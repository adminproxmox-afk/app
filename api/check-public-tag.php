<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

lca_require_method('GET');
$pdo = lca_db();

$rawTag = lca_trim_string($_GET['tag'] ?? $_GET['value'] ?? '');
$normalizedTag = lca_normalize_public_tag($rawTag);

if ($normalizedTag === '' || !preg_match('/^[a-z0-9_]{3,24}$/', $normalizedTag)) {
    lca_send_json([
        'ok' => false,
        'code' => 'TAG_INVALID',
        'error' => 'Invalid public tag',
        'normalizedTag' => $normalizedTag,
    ], 422);
}

$stmt = $pdo->prepare(
    'SELECT p.id
     FROM profiles p
     INNER JOIN users u ON u.id = p.user_id
     WHERE p.public_tag = :public_tag
       AND u.deleted_at IS NULL
     LIMIT 1'
);
$stmt->execute(['public_tag' => $normalizedTag]);

if ($stmt->fetch()) {
    lca_send_json([
        'ok' => false,
        'code' => 'TAG_EXISTS',
        'error' => 'Public tag is already taken',
        'normalizedTag' => $normalizedTag,
    ], 409);
}

lca_send_json([
    'ok' => true,
    'normalizedTag' => $normalizedTag,
]);
