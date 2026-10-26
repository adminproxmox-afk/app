<?php
declare(strict_types=1);
// PHP's development server ignores .htaccess; mirror the private-path boundary.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
if (preg_match('~(?:^|/)(?:\.[^/]+|database|config|tests|scripts|docs|infra)(?:/|$)~i', $path)
    || $path === '/api/_bootstrap.php') {
    http_response_code(404);
    exit;
}
return false;
