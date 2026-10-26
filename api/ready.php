<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
lca_require_method('GET');
try {
    $pdo = lca_connect();
    $pdo->query('SELECT 1')->fetchColumn();
    $pdo->query('SELECT id FROM users LIMIT 0');
    $releaseFile = dirname(__DIR__) . '/.finway-release.json';
    $release = is_file($releaseFile) ? json_decode(file_get_contents($releaseFile), true, 512, JSON_THROW_ON_ERROR) : [];
    lca_send_json(['ok' => true, 'service' => 'finway-api', 'release' => $release['commit'] ?? 'development']);
} catch (Throwable $exception) {
    lca_send_json(['ok' => false, 'service' => 'finway-api', 'error' => 'Service dependencies are unavailable'], 503);
}
