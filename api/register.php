<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

lca_require_method('POST');
$pdo = lca_db();
$input = lca_read_json_input();

$username = lca_trim_string($input['username'] ?? '');
$email = lca_trim_string($input['email'] ?? '');
$password = (string)($input['password'] ?? '');
$displayName = lca_trim_string($input['displayName'] ?? $username);
$publicTagInput = lca_trim_string($input['publicTag'] ?? $input['tag'] ?? '');
$gender = lca_trim_string($input['gender'] ?? 'unknown');
$avatarEmoji = lca_trim_string($input['avatarEmoji'] ?? ($gender === 'female' ? '👩‍🎓' : '👨‍🎓'));
lca_rate_limit('register:' . ($_SERVER['REMOTE_ADDR'] ?? ''), 5, 3600);

if ($displayName === '') {
    $displayName = $username;
}

if (!lca_valid_username($username)) {
    lca_send_json([
        'ok' => false,
        'code' => 'USERNAME_INVALID',
        'error' => 'Username must be 3-32 chars: letters, numbers, dot, dash or underscore',
    ], 422);
}

if (!lca_valid_email($email)) {
    lca_send_json([
        'ok' => false,
        'code' => 'EMAIL_INVALID',
        'error' => 'Invalid email',
    ], 422);
}

if (mb_strlen($password) < 8) {
    lca_send_json([
        'ok' => false,
        'code' => 'PASSWORD_TOO_SHORT',
        'error' => 'Password must be at least 8 characters',
    ], 422);
}

if (mb_strlen($displayName) > 80) {
    lca_send_json([
        'ok' => false,
        'code' => 'DISPLAY_NAME_INVALID',
        'error' => 'Display name must be 80 characters or less',
    ], 422);
}

$existingUsername = $pdo->prepare('SELECT id FROM users WHERE username = :username AND deleted_at IS NULL LIMIT 1');
$existingUsername->execute(['username' => $username]);
if ($existingUsername->fetch()) {
    lca_send_json([
        'ok' => false,
        'code' => 'LOGIN_EXISTS',
        'error' => 'Username is already taken',
    ], 409);
}

$existingEmail = $pdo->prepare('SELECT id FROM users WHERE email = :email AND deleted_at IS NULL LIMIT 1');
$existingEmail->execute(['email' => $email]);
if ($existingEmail->fetch()) {
    lca_send_json([
        'ok' => false,
        'code' => 'EMAIL_EXISTS',
        'error' => 'Email is already taken',
    ], 409);
}

$gender = in_array($gender, ['male', 'female'], true) ? $gender : 'unknown';
if ($avatarEmoji === '') {
    $avatarEmoji = $gender === 'female' ? '👩‍🎓' : '👨‍🎓';
}

if ($publicTagInput !== '') {
    $publicTag = lca_normalize_public_tag($publicTagInput);
    if (!preg_match('/^[a-z0-9_]{3,24}$/', $publicTag)) {
        lca_send_json([
            'ok' => false,
            'code' => 'TAG_INVALID',
            'error' => 'Invalid public tag',
        ], 422);
    }
} else {
    $publicTag = lca_public_tag_from_username($username);
}

if ($publicTag !== '') {
    $tagCheck = $pdo->prepare('SELECT id FROM profiles WHERE public_tag = :public_tag LIMIT 1');
    $tagCheck->execute(['public_tag' => $publicTag]);
    if ($tagCheck->fetch()) {
        lca_send_json([
            'ok' => false,
            'code' => 'TAG_EXISTS',
            'error' => 'Public tag is already taken',
        ], 409);
    }
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
         VALUES (:username, :email, :password_hash, :role, :status, NOW(), NOW())'
    );
    $stmt->execute([
        'username' => $username,
        'email' => $email,
        'password_hash' => $passwordHash,
        'role' => 'user',
        'status' => 'active',
    ]);

    $userId = (int)$pdo->lastInsertId();

    $pdo->prepare(
        'INSERT INTO profiles (user_id, display_name, public_tag, bio, phone, country_code, gender, avatar_emoji, avatar_url, created_at, updated_at)
         VALUES (:user_id, :display_name, :public_tag, :bio, :phone, :country_code, :gender, :avatar_emoji, :avatar_url, NOW(), NOW())'
    )->execute([
        'user_id' => $userId,
        'display_name' => $displayName,
        'public_tag' => $publicTag,
        'bio' => '',
        'phone' => '',
        'country_code' => 'UA',
        'gender' => $gender,
        'avatar_emoji' => $avatarEmoji,
        'avatar_url' => '',
    ]);

    $pdo->prepare(
        'INSERT INTO settings (user_id, theme, language, notifications_enabled, music_enabled, sound_enabled, volume, ui_state_json, created_at, updated_at)
         VALUES (:user_id, :theme, :language, :notifications_enabled, :music_enabled, :sound_enabled, :volume, :ui_state_json, NOW(), NOW())'
    )->execute([
        'user_id' => $userId,
        'theme' => 'dark',
        'language' => 'uk',
        'notifications_enabled' => 1,
        'music_enabled' => 1,
        'sound_enabled' => 1,
        'volume' => 70,
        'ui_state_json' => json_encode(new stdClass(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);

    $pdo->prepare(
        'INSERT INTO characters (user_id, level, xp, coins, avatar_emoji, active_category, created_at, updated_at)
         VALUES (:user_id, :level, :xp, :coins, :avatar_emoji, :active_category, NOW(), NOW())'
    )->execute([
        'user_id' => $userId,
        'level' => 1,
        'xp' => 0,
        'coins' => 0,
        'avatar_emoji' => $avatarEmoji,
        'active_category' => 'skin',
    ]);

    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    lca_send_json([
        'ok' => false,
        'code' => 'REGISTRATION_FAILED',
        'error' => 'Registration failed',
    ], 500);
}

$sessionInfo = lca_issue_session($pdo, $userId);
$bundle = lca_load_user_bundle($pdo, $userId);

lca_send_json([
    'ok' => true,
    'session' => [
        'tokenExpiresAt' => $sessionInfo['expiresAt'],
    ],
    'user' => $bundle,
], 201);
