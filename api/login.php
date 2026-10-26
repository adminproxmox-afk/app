<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

lca_require_method('POST');
$pdo = lca_db();
$input = lca_read_json_input();

$identifier = lca_trim_string($input['login'] ?? $input['identifier'] ?? '');
$password = (string)($input['password'] ?? '');
lca_rate_limit('login:' . ($_SERVER['REMOTE_ADDR'] ?? '') . ':' . strtolower($identifier), 10, 900);

if ($identifier === '' || $password === '') {
    lca_send_json([
        'ok' => false,
        'code' => 'MISSING_CREDENTIALS',
        'error' => 'Login and password are required',
    ], 422);
}

try {
    // Share the account-row lock with password changes before verifying credentials.
    $pdo->beginTransaction();
    $stmt = $pdo->prepare(
    'SELECT id, username, email, password_hash, role, status
     FROM users
     WHERE (username = :username_identifier OR email = :email_identifier)
       AND deleted_at IS NULL
     LIMIT 1 FOR UPDATE'
);
$stmt->execute([
    'username_identifier' => $identifier,
    'email_identifier' => $identifier,
]);
$user = $stmt->fetch();

if (!$user || $user['status'] !== 'active' || !password_verify($password, (string)$user['password_hash'])) {
    $pdo->rollBack();
    lca_send_json([
        'ok' => false,
        'code' => 'INVALID_CREDENTIALS',
        'error' => 'Invalid credentials',
    ], 401);
}

$pdo->prepare('UPDATE users SET last_login_at = NOW() WHERE id = :id')
    ->execute(['id' => $user['id']]);

$sessionInfo = lca_issue_session($pdo, (int)$user['id']);
$bundle = lca_load_user_bundle($pdo, (int)$user['id']);
    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    lca_clear_session_cookie();
    lca_send_json(['ok' => false, 'code' => 'LOGIN_FAILED', 'error' => 'Login failed'], 500);
}

lca_send_json([
    'ok' => true,
    'session' => [
        'tokenExpiresAt' => $sessionInfo['expiresAt'],
    ],
    'user' => $bundle,
]);
