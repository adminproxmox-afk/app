<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

lca_send_json([
    'ok' => true,
    'service' => 'life-capital-api',
    'time' => gmdate('c'),
    'php' => PHP_VERSION,
    'db' => 'life_capital',
]);
