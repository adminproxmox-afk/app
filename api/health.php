<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

lca_send_json([
    'ok' => true,
    'service' => 'finway-api',
    'time' => gmdate('c'),
]);
