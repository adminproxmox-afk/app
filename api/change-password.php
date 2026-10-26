<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

lca_require_method('POST');
$pdo = lca_db();
$session = lca_require_session($pdo);
$input = lca_read_json_input();
$currentPassword = (string)($input['currentPassword'] ?? '');
$newPassword = (string)($input['newPassword'] ?? '');
$userId = (int)$session['user']['id'];
lca_rate_limit('password:' . ($_SERVER['REMOTE_ADDR'] ?? '') . ':' . $userId, 5, 3600);

if ($currentPassword === '' || $newPassword === '') {
    lca_send_json(['ok' => false, 'code' => 'MISSING_PASSWORD', 'error' => 'Current and new passwords are required'], 422);
}

if (mb_strlen($newPassword) < 8) {
    lca_send_json(['ok' => false, 'code' => 'PASSWORD_TOO_SHORT', 'error' => 'Password must be at least 8 characters'], 422);
}

$stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = :id AND deleted_at IS NULL LIMIT 1');
$stmt->execute(['id' => $userId]);
$user = $stmt->fetch();

if (!$user || !password_verify($currentPassword, (string)$user['password_hash'])) {
    lca_send_json(['ok' => false, 'code' => 'INVALID_PASSWORD', 'error' => 'Current password is invalid'], 401);
}

$update = $pdo->prepare('UPDATE users SET password_hash = :password_hash, updated_at = NOW() WHERE id = :id');
$update->execute([
    'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
    'id' => $userId,
]);

lca_send_json(['ok' => true, 'user' => lca_load_user_bundle($pdo, $userId)]);
