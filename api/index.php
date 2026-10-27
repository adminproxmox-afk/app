<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

lca_send_json([
    'ok' => true,
    'service' => 'finway-api',
    'endpoints' => [
        'GET /api/health.php',
        'GET /api/me.php',
        'POST /api/login.php',
        'POST /api/register.php',
        'POST /api/logout.php',
    ],
]);
