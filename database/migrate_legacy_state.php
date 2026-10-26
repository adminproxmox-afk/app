<?php
declare(strict_types=1);

require __DIR__ . '/../api/_bootstrap.php';

$pdo = lca_db();
$users = $pdo->query(
    'SELECT u.id, s.ui_state_json FROM users u
     INNER JOIN settings s ON s.user_id = u.id
     WHERE u.deleted_at IS NULL AND s.ui_state_json IS NOT NULL'
);
$migratedUsers = 0;
$migratedPurchases = 0;
$migratedAchievements = 0;
$migratedLessons = 0;

while ($user = $users->fetch()) {
    $state = json_decode((string)$user['ui_state_json'], true);
    if (!is_array($state)) {
        continue;
    }
    $userId = (int)$user['id'];
    $shop = is_array($state['shop'] ?? null) ? $state['shop'] : [];
    $progress = is_array($state['progress'] ?? null) ? $state['progress'] : [];
    $character = is_array($state['character'] ?? null) ? $state['character'] : [];
    $history = is_array($shop['purchaseHistory'] ?? null) ? $shop['purchaseHistory'] : [];
    $inventory = is_array($shop['inventory'] ?? null) ? $shop['inventory'] : [];

    if (!$shop && !$progress && !$character) {
        continue;
    }

    try {
        $pdo->beginTransaction();

        foreach ($history as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $slug = trim((string)($entry['itemId'] ?? $entry['id'] ?? ''));
            if ($slug === '') {
                continue;
            }
            $itemStmt = $pdo->prepare('SELECT id, price, item_type FROM shop_items WHERE slug = :slug LIMIT 1');
            $itemStmt->execute(['slug' => $slug]);
            $item = $itemStmt->fetch();
            if (!$item) {
                continue;
            }
            $exists = $pdo->prepare(
                'SELECT id FROM user_purchases WHERE user_id = :user_id AND shop_item_id = :item_id LIMIT 1'
            );
            $exists->execute(['user_id' => $userId, 'item_id' => $item['id']]);
            if ($exists->fetch()) {
                continue;
            }
            $insert = $pdo->prepare(
                'INSERT INTO user_purchases
                    (user_id, shop_item_id, quantity, unit_price, total_price, purchase_type)
                 VALUES (:user_id, :item_id, 1, :price, :price, "grant")'
            );
            $insert->execute(['user_id' => $userId, 'item_id' => $item['id'], 'price' => (int)$item['price']]);
            $migratedPurchases++;
        }

        foreach ($inventory as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $slug = trim((string)($entry['id'] ?? ''));
            if ($slug === '') {
                continue;
            }
            $itemStmt = $pdo->prepare('SELECT id, price FROM shop_items WHERE slug = :slug LIMIT 1');
            $itemStmt->execute(['slug' => $slug]);
            $item = $itemStmt->fetch();
            if (!$item || (int)$item['price'] !== 0) {
                continue;
            }
            $insert = $pdo->prepare(
                'INSERT INTO user_purchases
                    (user_id, shop_item_id, quantity, unit_price, total_price, purchase_type)
                 SELECT :user_id, :item_id, 1, 0, 0, "grant"
                 WHERE NOT EXISTS
                    (SELECT 1 FROM user_purchases WHERE user_id = :exists_user AND shop_item_id = :exists_item)'
            );
            $insert->execute([
                'user_id' => $userId,
                'item_id' => $item['id'],
                'exists_user' => $userId,
                'exists_item' => $item['id'],
            ]);
            $migratedPurchases += $insert->rowCount();
        }

        foreach ((array)($shop['achievements'] ?? []) as $slug) {
            $achievement = $pdo->prepare('SELECT id FROM achievements WHERE slug = :slug LIMIT 1');
            $achievement->execute(['slug' => (string)$slug]);
            $achievementId = $achievement->fetchColumn();
            if (!$achievementId) {
                continue;
            }
            $insert = $pdo->prepare(
                'INSERT IGNORE INTO user_achievements (user_id, achievement_id, source_type)
                 VALUES (:user_id, :achievement_id, "legacy_migration")'
            );
            $insert->execute(['user_id' => $userId, 'achievement_id' => $achievementId]);
            $migratedAchievements += $insert->rowCount();
        }

        foreach ((array)($progress['completedLessons'] ?? []) as $lessonId) {
            $lessonId = (int)$lessonId;
            if ($lessonId < 1) {
                continue;
            }
            $insert = $pdo->prepare(
                'INSERT IGNORE INTO lesson_progress
                    (user_id, lesson_id, completed, progress_percent, started_at, last_accessed_at, completed_at)
                 VALUES (:user_id, :lesson_id, 1, 100, NOW(), NOW(), NOW())'
            );
            try {
                $insert->execute(['user_id' => $userId, 'lesson_id' => $lessonId]);
                $migratedLessons += $insert->rowCount();
            } catch (PDOException) {
                // Ignore legacy lesson ids that no longer exist.
            }
        }

        $columns = [
            'skin' => 'equipped_skin_item_id', 'hair' => 'equipped_hair_item_id',
            'accessory' => 'equipped_accessory_item_id', 'shirt' => 'equipped_shirt_item_id',
            'pants' => 'equipped_pants_item_id', 'shoes' => 'equipped_shoes_item_id',
            'extra' => 'equipped_extra_item_id',
        ];
        $selected = is_array($character['selected'] ?? null) ? $character['selected'] : [];
        foreach ($columns as $slot => $column) {
            $slug = trim((string)($selected[$slot] ?? ''));
            if ($slug === '') {
                continue;
            }
            $item = $pdo->prepare(
                'SELECT i.id FROM shop_items i
                 LEFT JOIN user_purchases p ON p.shop_item_id = i.id AND p.user_id = :user_id
                 WHERE i.slug = :slug AND i.is_active = 1 AND (i.price = 0 OR p.id IS NOT NULL)
                 LIMIT 1'
            );
            $item->execute(['user_id' => $userId, 'slug' => $slug]);
            $itemId = $item->fetchColumn();
            if ($itemId) {
                $pdo->prepare("UPDATE characters SET $column = :item_id WHERE user_id = :user_id")
                    ->execute(['item_id' => $itemId, 'user_id' => $userId]);
            }
        }

        unset($state['shop'], $state['progress'], $state['character']);
        $pdo->prepare('UPDATE settings SET ui_state_json = :state, updated_at = NOW() WHERE user_id = :user_id')
            ->execute([
                'state' => json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'user_id' => $userId,
            ]);
        $pdo->commit();
        $migratedUsers++;
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        fwrite(STDERR, "User {$userId}: {$exception->getMessage()}\n");
    }
}

fwrite(STDOUT, "users={$migratedUsers} purchases={$migratedPurchases} achievements={$migratedAchievements} lessons={$migratedLessons}\n");
