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

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = :id AND status = "active" AND deleted_at IS NULL FOR UPDATE');
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($currentPassword, (string)$user['password_hash'])) {
        $pdo->rollBack();
        lca_send_json(['ok' => false, 'code' => 'INVALID_PASSWORD', 'error' => 'Current password is invalid'], 401);
    }
    $pdo->prepare('UPDATE users SET password_hash = :password_hash, updated_at = NOW() WHERE id = :id')
        ->execute(['password_hash' => password_hash($newPassword, PASSWORD_DEFAULT), 'id' => $userId]);
    $pdo->prepare('UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = :id AND revoked_at IS NULL')
        ->execute(['id' => $userId]);
    lca_issue_session($pdo, $userId);
    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    lca_clear_session_cookie();
    lca_send_json(['ok' => false, 'code' => 'PASSWORD_CHANGE_FAILED', 'error' => 'Password change failed'], 500);
}

lca_send_json(['ok' => true, 'user' => lca_load_user_bundle($pdo, $userId)]);
