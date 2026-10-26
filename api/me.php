<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

lca_require_method('GET');
$pdo = lca_db();
$session = lca_require_session($pdo);

lca_send_json([
    'ok' => true,
    'user' => $session['user'],
    'session' => [
        'id' => $session['sessionId'],
        'expiresAt' => $session['expiresAt'],
    ],
]);
