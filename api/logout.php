<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

lca_require_method('POST');
$pdo = lca_db();
$session = lca_current_session($pdo);
if ($session) {
    lca_revoke_current_session($pdo);
}

lca_send_json([
    'ok' => true,
]);
