<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

lca_require_method('POST');
$pdo = lca_db();
$session = lca_require_session($pdo);
$input = lca_read_json_input();
$itemId = lca_trim_string($input['itemId'] ?? '');
$userId = (int)$session['user']['id'];

if ($itemId === '' || mb_strlen($itemId) > 80) {
    lca_send_json(['ok' => false, 'code' => 'ITEM_INVALID', 'error' => 'Invalid item'], 422);
}

try {
    $pdo->beginTransaction();

    $itemStmt = $pdo->prepare(
        'SELECT id, slug, name, item_type, price, currency_type
         FROM shop_items
         WHERE slug = :slug AND is_active = 1 AND deleted_at IS NULL
         FOR UPDATE'
    );
    $itemStmt->execute(['slug' => $itemId]);
    $item = $itemStmt->fetch();
    if (!$item || $item['currency_type'] !== 'coins') {
        throw new RuntimeException('ITEM_NOT_FOUND');
    }

    if ($item['item_type'] !== 'consumable') {
        $ownedStmt = $pdo->prepare(
            'SELECT id FROM user_purchases WHERE user_id = :user_id AND shop_item_id = :item_id LIMIT 1'
        );
        $ownedStmt->execute(['user_id' => $userId, 'item_id' => $item['id']]);
        if ($ownedStmt->fetch()) {
            throw new RuntimeException('ALREADY_OWNED');
        }
    }

    $characterStmt = $pdo->prepare('SELECT coins FROM characters WHERE user_id = :user_id FOR UPDATE');
    $characterStmt->execute(['user_id' => $userId]);
    $character = $characterStmt->fetch();
    $before = (int)($character['coins'] ?? 0);
    $price = (int)$item['price'];
    if ($before < $price) {
        throw new RuntimeException('INSUFFICIENT_COINS');
    }
    $after = $before - $price;

    $pdo->prepare('UPDATE characters SET coins = :coins, updated_at = NOW() WHERE user_id = :user_id')
        ->execute(['coins' => $after, 'user_id' => $userId]);
    $pdo->prepare(
        'INSERT INTO user_purchases (user_id, shop_item_id, quantity, unit_price, total_price, purchase_type)
         VALUES (:user_id, :item_id, 1, :unit_price, :total_price, "purchase")'
    )->execute([
        'user_id' => $userId,
        'item_id' => $item['id'],
        'unit_price' => $price,
        'total_price' => $price,
    ]);
    $purchaseId = (int)$pdo->lastInsertId();
    $pdo->prepare(
        'INSERT INTO transactions (user_id, transaction_type, amount, balance_before, balance_after, source_type, source_id)
         VALUES (:user_id, "spend", :amount, :before, :after, "shop_purchase", :source_id)'
    )->execute([
        'user_id' => $userId,
        'amount' => -$price,
        'before' => $before,
        'after' => $after,
        'source_id' => $purchaseId,
    ]);
    lca_check_achievements($pdo, $userId);

    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $code = $exception->getMessage();
    $messages = [
        'ITEM_NOT_FOUND' => ['ITEM_NOT_FOUND', 'Item is not available', 404],
        'ALREADY_OWNED' => ['ALREADY_OWNED', 'Item already owned', 409],
        'INSUFFICIENT_COINS' => ['INSUFFICIENT_COINS', 'Not enough coins', 409],
    ];
    [$errorCode, $message, $status] = $messages[$code] ?? ['PURCHASE_FAILED', 'Purchase failed', 500];
    lca_send_json(['ok' => false, 'code' => $errorCode, 'error' => $message], $status);
}

lca_send_json(['ok' => true, 'user' => lca_load_user_bundle($pdo, $userId)]);
