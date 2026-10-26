<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

lca_require_method('POST');

$pdo = lca_db();
$session = lca_require_session($pdo);
$userId = (int)$session['user']['id'];
$input = lca_read_json_input();
$state = $input['state'] ?? null;

if (!is_array($state)) {
    lca_send_json(['ok' => false, 'error' => 'Invalid state'], 400);
}

$profileState = is_array($state['profile'] ?? null) ? $state['profile'] : [];
$settingsState = is_array($state['settings'] ?? null) ? $state['settings'] : [];
$characterState = is_array($state['character'] ?? null) ? $state['character'] : [];

$current = lca_load_user_bundle($pdo, $userId);
if (!$current) {
    lca_send_json(['ok' => false, 'error' => 'User not found'], 404);
}

function lca_state_string(mixed $value): string
{
    return trim((string)($value ?? ''));
}

function lca_state_bool(mixed $value, bool $default): bool
{
    if ($value === null || $value === '') {
        return $default;
    }

    return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default;
}

function lca_state_int(mixed $value, int $default, int $min, int $max): int
{
    if ($value === null || $value === '') {
        return $default;
    }

    $intValue = (int)$value;
    if ($intValue < $min) {
        return $min;
    }

    if ($intValue > $max) {
        return $max;
    }

    return $intValue;
}

function lca_state_json_value(array $state): ?string
{
    $extra = $state;
    unset($extra['users'], $extra['session'], $extra['profile'], $extra['settings'], $extra['character'], $extra['shop'], $extra['progress']);
    if (isset($extra['character']) && is_array($extra['character'])) {
        unset($extra['character']['level'], $extra['character']['xp'], $extra['character']['coins'], $extra['character']['avatarEmoji']);
    }

    if ($extra === []) {
        return null;
    }

    $encoded = json_encode($extra, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return $encoded === false ? null : $encoded;
}

$existingEmail = (string)$current['email'];
$email = $existingEmail;
if (array_key_exists('email', $profileState) || array_key_exists('email', $state)) {
    $candidate = lca_state_string($profileState['email'] ?? $state['email'] ?? '');
    if ($candidate !== '') {
        if (!filter_var($candidate, FILTER_VALIDATE_EMAIL)) {
            lca_send_json(['ok' => false, 'code' => 'EMAIL_INVALID', 'error' => 'Invalid email'], 400);
        }

        $emailCheck = $pdo->prepare('SELECT id FROM users WHERE email = :email AND id != :user_id LIMIT 1');
        $emailCheck->execute([
            'email' => $candidate,
            'user_id' => $userId,
        ]);
        if ($emailCheck->fetch()) {
            lca_send_json(['ok' => false, 'code' => 'EMAIL_EXISTS', 'error' => 'Email already taken'], 409);
        }

        $email = $candidate;
    }
}

$displayName = lca_state_string($profileState['displayName'] ?? $profileState['name'] ?? $state['displayName'] ?? $current['profile']['displayName']);
if ($displayName === '') {
    $displayName = (string)$current['profile']['displayName'];
}
if (mb_strlen($displayName) > 80) {
    $displayName = mb_substr($displayName, 0, 80);
}

$publicTag = lca_state_string($profileState['publicTag'] ?? $profileState['username'] ?? $state['publicTag'] ?? '');
if ($publicTag === '') {
    $publicTag = (string)$current['profile']['publicTag'];
}
$publicTag = lca_normalize_public_tag($publicTag);
if ($publicTag === '') {
    $publicTag = lca_public_tag_from_username((string)$current['username']);
}
if (!preg_match('/^[a-z0-9_]{3,24}$/', $publicTag)) {
    lca_send_json(['ok' => false, 'code' => 'TAG_INVALID', 'error' => 'Invalid public tag'], 400);
}

$tagCheck = $pdo->prepare('SELECT id FROM profiles WHERE public_tag = :public_tag AND user_id != :user_id LIMIT 1');
$tagCheck->execute([
    'public_tag' => $publicTag,
    'user_id' => $userId,
]);
if ($tagCheck->fetch()) {
    lca_send_json(['ok' => false, 'code' => 'TAG_EXISTS', 'error' => 'Public tag already taken'], 409);
}

$gender = lca_state_string($profileState['gender'] ?? $state['gender'] ?? $current['profile']['gender']);
if (!in_array($gender, ['unknown', 'male', 'female', 'other'], true)) {
    $gender = 'unknown';
}

$phone = lca_state_string($profileState['phone'] ?? $state['phone'] ?? '');
$phone = $phone !== '' ? mb_substr($phone, 0, 32) : '';

$countryCode = strtoupper(lca_state_string($profileState['countryCode'] ?? $profileState['country_code'] ?? $state['countryCode'] ?? $current['profile']['countryCode']));
if ($countryCode === '') {
    $countryCode = 'UA';
}
$countryCode = mb_substr($countryCode, 0, 2);

$avatarEmoji = lca_state_string($profileState['avatarEmoji'] ?? $profileState['avatar'] ?? $state['avatarEmoji'] ?? $current['profile']['avatarEmoji']);
if ($avatarEmoji === '') {
    $avatarEmoji = '👨‍🎓';
}
$avatarEmoji = mb_substr($avatarEmoji, 0, 16);

$avatarUrl = lca_state_string($profileState['avatarUrl'] ?? $profileState['avatarImage'] ?? $state['avatarUrl'] ?? '');
$avatarUrl = $avatarUrl !== '' ? mb_substr($avatarUrl, 0, 512) : '';

$bio = lca_state_string($profileState['bio'] ?? $state['bio'] ?? '');
$bio = $bio !== '' ? $bio : '';

$profileAvatarEmoji = lca_state_string(
    $profileState['avatarEmoji']
    ?? $profileState['avatar']
    ?? $characterState['avatarEmoji']
    ?? $characterState['avatar']
    ?? $state['avatarEmoji']
    ?? $current['character']['avatarEmoji']
);
if ($profileAvatarEmoji === '') {
    $profileAvatarEmoji = (string)$current['character']['avatarEmoji'];
}
$profileAvatarEmoji = mb_substr($profileAvatarEmoji, 0, 16);

$theme = lca_state_string($settingsState['theme'] ?? $state['theme'] ?? $current['settings']['theme']);
if (!in_array($theme, ['light', 'dark', 'system'], true)) {
    $theme = 'dark';
}

$language = lca_state_string($settingsState['language'] ?? $state['language'] ?? $current['settings']['language']);
if (!in_array($language, ['uk', 'en'], true)) {
    $language = 'uk';
}

$notificationsEnabled = lca_state_bool($settingsState['notificationsEnabled'] ?? $settingsState['notifications'] ?? $state['notificationsEnabled'] ?? $current['settings']['notificationsEnabled'], (bool)$current['settings']['notificationsEnabled']);
$musicEnabled = lca_state_bool($settingsState['musicEnabled'] ?? $state['musicEnabled'] ?? $current['settings']['musicEnabled'], (bool)$current['settings']['musicEnabled']);
$soundEnabled = lca_state_bool($settingsState['soundEnabled'] ?? $state['soundEnabled'] ?? $current['settings']['soundEnabled'], (bool)$current['settings']['soundEnabled']);
$volume = lca_state_int($settingsState['volume'] ?? $state['volume'] ?? $current['settings']['volume'], (int)$current['settings']['volume'], 0, 100);

$level = (int)$current['character']['level'];
$xp = (int)$current['character']['xp'];
$coins = (int)$current['character']['coins'];
$characterAvatarEmoji = lca_state_string($characterState['avatarEmoji'] ?? $characterState['avatar'] ?? $state['avatarEmoji'] ?? $profileAvatarEmoji);
if ($characterAvatarEmoji === '') {
    $characterAvatarEmoji = $profileAvatarEmoji;
}
$characterAvatarEmoji = mb_substr($characterAvatarEmoji, 0, 16);

$activeCategory = lca_state_string($characterState['activeCategory'] ?? $state['activeCategory'] ?? $current['character']['activeCategory']);
if ($activeCategory === '') {
    $activeCategory = 'skin';
}
$activeCategory = mb_substr($activeCategory, 0, 32);

$equipped = $characterState['equipped'] ?? [];
if (!is_array($equipped)) {
    $equipped = [];
}

$itemIds = [];
$selected = is_array($characterState['selected'] ?? null) ? $characterState['selected'] : [];
foreach ([
    'skin' => 'equipped_skin_item_id',
    'hair' => 'equipped_hair_item_id',
    'accessory' => 'equipped_accessory_item_id',
    'shirt' => 'equipped_shirt_item_id',
    'pants' => 'equipped_pants_item_id',
    'shoes' => 'equipped_shoes_item_id',
    'extra' => 'equipped_extra_item_id',
] as $key => $column) {
    $value = $equipped[$key] ?? $selected[$key] ?? $characterState[$column] ?? $state[$column] ?? null;
    if ($value === null || $value === '') {
        $itemIds[$column] = null;
        continue;
    }

    if (is_numeric($value)) {
        $itemIds[$column] = max(0, (int)$value) ?: null;
        continue;
    }
    $itemStmt = $pdo->prepare(
        'SELECT i.id FROM shop_items i
         LEFT JOIN user_purchases p ON p.shop_item_id = i.id AND p.user_id = :user_id
         WHERE i.slug = :slug AND i.is_active = 1 AND (i.price = 0 OR p.id IS NOT NULL)
         LIMIT 1'
    );
    $itemStmt->execute(['user_id' => $userId, 'slug' => (string)$value]);
    $itemIds[$column] = (int)($itemStmt->fetchColumn() ?: 0) ?: null;
}

$uiStateJson = lca_state_json_value($state);

try {
    $pdo->beginTransaction();

    $userStmt = $pdo->prepare('UPDATE users SET email = :email WHERE id = :user_id');
    $userStmt->execute([
        'email' => $email,
        'user_id' => $userId,
    ]);

    $profileStmt = $pdo->prepare(
        'INSERT INTO profiles (user_id, display_name, public_tag, bio, phone, country_code, gender, avatar_emoji, avatar_url, created_at, updated_at)
         VALUES (:user_id, :display_name, :public_tag, :bio, :phone, :country_code, :gender, :avatar_emoji, :avatar_url, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
            display_name = VALUES(display_name),
            public_tag = VALUES(public_tag),
            bio = VALUES(bio),
            phone = VALUES(phone),
            country_code = VALUES(country_code),
            gender = VALUES(gender),
            avatar_emoji = VALUES(avatar_emoji),
            avatar_url = VALUES(avatar_url),
            updated_at = NOW()'
    );
    $profileStmt->execute([
        'user_id' => $userId,
        'display_name' => $displayName,
        'public_tag' => $publicTag,
        'bio' => $bio !== '' ? $bio : null,
        'phone' => $phone !== '' ? $phone : null,
        'country_code' => $countryCode !== '' ? $countryCode : null,
        'gender' => $gender,
        'avatar_emoji' => $profileAvatarEmoji,
        'avatar_url' => $avatarUrl !== '' ? $avatarUrl : null,
    ]);

    $settingsStmt = $pdo->prepare(
        'INSERT INTO settings (user_id, theme, language, notifications_enabled, music_enabled, sound_enabled, volume, ui_state_json, created_at, updated_at)
         VALUES (:user_id, :theme, :language, :notifications_enabled, :music_enabled, :sound_enabled, :volume, :ui_state_json, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
            theme = VALUES(theme),
            language = VALUES(language),
            notifications_enabled = VALUES(notifications_enabled),
            music_enabled = VALUES(music_enabled),
            sound_enabled = VALUES(sound_enabled),
            volume = VALUES(volume),
            ui_state_json = VALUES(ui_state_json),
            updated_at = NOW()'
    );
    $settingsStmt->execute([
        'user_id' => $userId,
        'theme' => $theme,
        'language' => $language,
        'notifications_enabled' => $notificationsEnabled ? 1 : 0,
        'music_enabled' => $musicEnabled ? 1 : 0,
        'sound_enabled' => $soundEnabled ? 1 : 0,
        'volume' => $volume,
        'ui_state_json' => $uiStateJson,
    ]);

    $characterStmt = $pdo->prepare(
        'INSERT INTO characters (
            user_id, level, xp, coins, avatar_emoji, active_category,
            equipped_skin_item_id, equipped_hair_item_id, equipped_accessory_item_id,
            equipped_shirt_item_id, equipped_pants_item_id, equipped_shoes_item_id, equipped_extra_item_id,
            created_at, updated_at
         ) VALUES (
            :user_id, :level, :xp, :coins, :avatar_emoji, :active_category,
            :equipped_skin_item_id, :equipped_hair_item_id, :equipped_accessory_item_id,
            :equipped_shirt_item_id, :equipped_pants_item_id, :equipped_shoes_item_id, :equipped_extra_item_id,
            NOW(), NOW()
         )
         ON DUPLICATE KEY UPDATE
            level = VALUES(level),
            xp = VALUES(xp),
            coins = VALUES(coins),
            avatar_emoji = VALUES(avatar_emoji),
            active_category = VALUES(active_category),
            equipped_skin_item_id = VALUES(equipped_skin_item_id),
            equipped_hair_item_id = VALUES(equipped_hair_item_id),
            equipped_accessory_item_id = VALUES(equipped_accessory_item_id),
            equipped_shirt_item_id = VALUES(equipped_shirt_item_id),
            equipped_pants_item_id = VALUES(equipped_pants_item_id),
            equipped_shoes_item_id = VALUES(equipped_shoes_item_id),
            equipped_extra_item_id = VALUES(equipped_extra_item_id),
            updated_at = NOW()'
    );
    $characterStmt->execute([
        'user_id' => $userId,
        'level' => $level,
        'xp' => $xp,
        'coins' => $coins,
        'avatar_emoji' => $characterAvatarEmoji,
        'active_category' => $activeCategory,
        'equipped_skin_item_id' => $itemIds['equipped_skin_item_id'],
        'equipped_hair_item_id' => $itemIds['equipped_hair_item_id'],
        'equipped_accessory_item_id' => $itemIds['equipped_accessory_item_id'],
        'equipped_shirt_item_id' => $itemIds['equipped_shirt_item_id'],
        'equipped_pants_item_id' => $itemIds['equipped_pants_item_id'],
        'equipped_shoes_item_id' => $itemIds['equipped_shoes_item_id'],
        'equipped_extra_item_id' => $itemIds['equipped_extra_item_id'],
    ]);

    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    lca_send_json(['ok' => false, 'error' => 'Failed to sync state'], 500);
}

$bundle = lca_load_user_bundle($pdo, $userId);
if (!$bundle) {
    lca_send_json(['ok' => false, 'error' => 'User not found'], 404);
}

lca_send_json([
    'ok' => true,
    'user' => $bundle,
]);
