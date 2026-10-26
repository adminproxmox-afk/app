<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

lca_require_method('POST');
$pdo = lca_db();
$session = lca_require_session($pdo);
$userId = (int)$session['user']['id'];
$reward = 50;

try {
    $pdo->beginTransaction();
    $claimedStmt = $pdo->prepare(
        'SELECT id FROM transactions
         WHERE user_id = :user_id AND source_type = "daily_bonus" AND created_at >= UTC_DATE()
         LIMIT 1 FOR UPDATE'
    );
    $claimedStmt->execute(['user_id' => $userId]);
    if ($claimedStmt->fetch()) {
        throw new RuntimeException('BONUS_ALREADY_CLAIMED');
    }
    $stmt = $pdo->prepare('SELECT coins FROM characters WHERE user_id = :user_id FOR UPDATE');
    $stmt->execute(['user_id' => $userId]);
    $character = $stmt->fetch();
    $before = (int)($character['coins'] ?? 0);
    $after = $before + $reward;
    $pdo->prepare('UPDATE characters SET coins = :coins, updated_at = NOW() WHERE user_id = :user_id')
        ->execute(['coins' => $after, 'user_id' => $userId]);
    $pdo->prepare(
        'INSERT INTO transactions (user_id, transaction_type, amount, balance_before, balance_after, source_type)
         VALUES (:user_id, "earn", :amount, :before, :after, "daily_bonus")'
    )->execute(['user_id' => $userId, 'amount' => $reward, 'before' => $before, 'after' => $after]);
    lca_check_achievements($pdo, $userId);
    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if ($exception->getMessage() === 'BONUS_ALREADY_CLAIMED') {
        lca_send_json(['ok' => false, 'code' => 'BONUS_ALREADY_CLAIMED', 'error' => 'Daily bonus already claimed'], 409);
    }
    lca_send_json(['ok' => false, 'code' => 'REWARD_FAILED', 'error' => 'Reward failed'], 500);
}

lca_send_json(['ok' => true, 'user' => lca_load_user_bundle($pdo, $userId)]);
