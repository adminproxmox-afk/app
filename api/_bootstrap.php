<?php
declare(strict_types=1);

const LCA_SESSION_COOKIE = 'lca_session';
const LCA_CSRF_COOKIE = 'lca_csrf';
const LCA_SESSION_TTL_SECONDS = 2592000; // 30 days

function lca_config(): array
{
    static $config = null;

    if ($config !== null) {
        return $config;
    }

    $config = ['db_host' => 'localhost', 'db_port' => 3306, 'db_name' => 'life_capital',
        'db_user' => 'life_capital_app', 'db_pass' => '', 'cookie_name' => LCA_SESSION_COOKIE];
    $explicitConfig = getenv('LCA_CONFIG_FILE');
    $candidates = $explicitConfig !== false ? [$explicitConfig] : [
        dirname(__DIR__, 3) . '/etc/life-capital-db.json', '/etc/life-capital-db.json',
    ];
    foreach ($candidates as $privateConfig) {
        if (is_file($privateConfig)) {
            $values = json_decode(file_get_contents($privateConfig), true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($values)) {
                throw new RuntimeException('Invalid private configuration');
            }
            $config = array_replace($config, $values);
            break;
        }
        if ($explicitConfig !== false) {
            throw new RuntimeException('Private configuration file is missing');
        }
    }
    foreach (['LCA_DB_HOST' => 'db_host', 'LCA_DB_PORT' => 'db_port', 'LCA_DB_NAME' => 'db_name',
              'LCA_DB_USER' => 'db_user', 'LCA_DB_PASS' => 'db_pass', 'LCA_SESSION_COOKIE' => 'cookie_name'] as $key => $name) {
        $value = getenv($key);
        if ($value !== false) {
            $config[$name] = $value;
        }
    }

    return $config;
}

function lca_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }

    return (int)($_SERVER['SERVER_PORT'] ?? 80) === 443;
}

function lca_send_json(array $payload, int $status = 200): never
{
    $requestId = bin2hex(random_bytes(8));
    header('X-Request-ID: ' . $requestId);
    if ($status >= 500) {
        error_log(json_encode(['event' => 'finway_api_error', 'request_id' => $requestId,
            'status' => $status, 'path' => substr((string)parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), 0, 256)]));
    }
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function lca_read_json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        lca_send_json(['ok' => false, 'error' => 'Invalid JSON body'], 400);
    }

    return $data;
}

function lca_connect(): PDO
{
    $config = lca_config();
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $config['db_host'], (int)$config['db_port'], $config['db_name']);
    return new PDO($dsn, $config['db_user'], $config['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function lca_db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    try {
        $pdo = lca_connect();
    } catch (Throwable $exception) {
        lca_send_json([
            'ok' => false,
            'error' => 'Database connection failed',
        ], 500);
    }

    lca_ensure_csrf_cookie();
    $pdo->exec('SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci');
    return $pdo;
}

function lca_cookie_options(int $expiresAt): array
{
    return [
        'expires' => $expiresAt,
        'path' => '/',
        'domain' => '',
        'secure' => lca_is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ];
}

function lca_set_session_cookie(string $token, int $expiresAt): void
{
    setcookie(lca_config()['cookie_name'], $token, lca_cookie_options($expiresAt));
}

function lca_clear_session_cookie(): void
{
    setcookie(lca_config()['cookie_name'], '', lca_cookie_options(time() - 3600));
}

function lca_ensure_csrf_cookie(): string
{
    $token = trim((string)($_COOKIE[LCA_CSRF_COOKIE] ?? ''));
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        $token = bin2hex(random_bytes(32));
        $options = lca_cookie_options(time() + LCA_SESSION_TTL_SECONDS);
        $options['httponly'] = false;
        setcookie(LCA_CSRF_COOKIE, $token, $options);
    }
    return $token;
}

function lca_require_csrf(): void
{
    if (in_array(strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'), ['GET', 'HEAD', 'OPTIONS'], true)) {
        return;
    }
    $cookieToken = lca_ensure_csrf_cookie();
    $headerToken = trim((string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''));
    if ($headerToken === '' || !hash_equals($cookieToken, $headerToken)) {
        lca_send_json(['ok' => false, 'code' => 'CSRF_INVALID', 'error' => 'Invalid CSRF token'], 403);
    }
}

function lca_rate_limit(string $key, int $limit, int $windowSeconds): void
{
    $directory = sys_get_temp_dir() . '/lca-rate-limit';
    if (!is_dir($directory)) {
        @mkdir($directory, 0700, true);
    }
    $handle = @fopen($directory . '/' . hash('sha256', $key) . '.json', 'c+');
    if (!$handle) {
        return;
    }
    flock($handle, LOCK_EX);
    $state = json_decode(stream_get_contents($handle) ?: '', true);
    $now = time();
    if (!is_array($state) || (int)($state['resetAt'] ?? 0) <= $now) {
        $state = ['count' => 0, 'resetAt' => $now + $windowSeconds];
    }
    $state['count']++;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($state));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    if ((int)$state['count'] > $limit) {
        header('Retry-After: ' . max(1, (int)$state['resetAt'] - $now));
        lca_send_json(['ok' => false, 'code' => 'RATE_LIMITED', 'error' => 'Too many requests'], 429);
    }
}

function lca_hash_token(string $token): string
{
    return hash('sha256', $token);
}

function lca_normalize_public_tag(string $value): string
{
    $value = trim(mb_strtolower($value));
    $value = preg_replace('/^@+/', '', $value) ?? '';
    $value = preg_replace('/[\s.-]+/', '_', $value) ?? '';
    $value = preg_replace('/_+/', '_', $value) ?? '';
    $value = preg_replace('/^_+|_+$/', '', $value) ?? '';

    return $value;
}

function lca_public_tag_from_username(string $username): string
{
    $tag = lca_normalize_public_tag($username);
    if ($tag === '') {
        $tag = 'user';
    }

    return substr($tag, 0, 24);
}

function lca_load_user_shop(PDO $pdo, int $userId): array
{
    $purchases = $pdo->prepare(
        'SELECT p.id, p.shop_item_id, p.unit_price, p.purchased_at,
                i.slug, i.name, i.item_type, i.payload_json
         FROM user_purchases p
         INNER JOIN shop_items i ON i.id = p.shop_item_id
         WHERE p.user_id = :user_id
         ORDER BY p.purchased_at ASC, p.id ASC'
    );
    $purchases->execute(['user_id' => $userId]);

    $inventory = [];
    $avatars = ['👨‍🎓', '👩‍🎓'];
    $history = [];
    while ($row = $purchases->fetch()) {
        $timestamp = strtotime((string)$row['purchased_at']) * 1000;
        $inventory[] = [
            'id' => $row['slug'],
            'name' => $row['name'],
            'type' => $row['item_type'],
            'boughtAt' => $timestamp,
        ];
        $history[] = [
            'id' => 'purchase_' . (int)$row['id'],
            'itemId' => $row['slug'],
            'type' => $row['item_type'],
            'price' => (int)$row['unit_price'],
            'timestamp' => $timestamp,
        ];
        if ($row['item_type'] === 'avatar') {
            $payload = json_decode((string)$row['payload_json'], true);
            if (is_array($payload) && !empty($payload['emoji'])) {
                $avatars[] = (string)$payload['emoji'];
            }
        }
    }

    $achievements = $pdo->prepare(
        'SELECT a.slug FROM user_achievements ua
         INNER JOIN achievements a ON a.id = ua.achievement_id
         WHERE ua.user_id = :user_id ORDER BY ua.obtained_at ASC'
    );
    $achievements->execute(['user_id' => $userId]);

    $daily = $pdo->prepare(
        'SELECT MAX(created_at) AS last_claimed_at, COUNT(*) AS claim_count
         FROM transactions WHERE user_id = :user_id AND source_type = "daily_bonus"'
    );
    $daily->execute(['user_id' => $userId]);
    $dailyRow = $daily->fetch() ?: [];
    $spent = $pdo->prepare(
        'SELECT COALESCE(SUM(-amount), 0) FROM transactions
         WHERE user_id = :user_id AND transaction_type = "spend"'
    );
    $spent->execute(['user_id' => $userId]);

    return [
        'inventory' => $inventory,
        'avatars' => array_values(array_unique($avatars)),
        'purchaseHistory' => $history,
        'achievements' => $achievements->fetchAll(PDO::FETCH_COLUMN),
        'lastDaily' => !empty($dailyRow['last_claimed_at']) ? strtotime((string)$dailyRow['last_claimed_at']) * 1000 : 0,
        'dailyClaimCount' => (int)($dailyRow['claim_count'] ?? 0),
        'totalSpent' => (int)$spent->fetchColumn(),
    ];
}

function lca_load_character_selection(PDO $pdo, array $row): array
{
    $itemIds = array_values(array_filter([
        $row['equipped_skin_item_id'] ?? null,
        $row['equipped_hair_item_id'] ?? null,
        $row['equipped_accessory_item_id'] ?? null,
        $row['equipped_shirt_item_id'] ?? null,
        $row['equipped_pants_item_id'] ?? null,
        $row['equipped_shoes_item_id'] ?? null,
        $row['equipped_extra_item_id'] ?? null,
    ]));
    if (!$itemIds) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($itemIds), '?'));
    $stmt = $pdo->prepare("SELECT slot, slug FROM shop_items WHERE id IN ($placeholders)");
    $stmt->execute($itemIds);
    $selected = [];
    while ($item = $stmt->fetch()) {
        if ($item['slot'] !== 'none') {
            $selected[$item['slot']] = $item['slug'];
        }
    }
    return $selected;
}

function lca_check_achievements(PDO $pdo, int $userId): void
{
    $statsStmt = $pdo->prepare(
        'SELECT
            (SELECT COUNT(*) FROM user_purchases WHERE user_id = :user_id_a) AS purchase_count,
            (SELECT COALESCE(SUM(-amount), 0) FROM transactions WHERE user_id = :user_id_b AND transaction_type = "spend") AS spent_total,
            (SELECT COUNT(DISTINCT shop_item_id) FROM user_purchases WHERE user_id = :user_id_c) AS owned_count,
            (SELECT COUNT(*) FROM transactions WHERE user_id = :user_id_d AND source_type = "daily_bonus") AS daily_count'
    );
    $statsStmt->execute([
        'user_id_a' => $userId,
        'user_id_b' => $userId,
        'user_id_c' => $userId,
        'user_id_d' => $userId,
    ]);
    $stats = $statsStmt->fetch() ?: [];

    $achievements = $pdo->query(
        'SELECT id, slug, currency_reward, condition_json FROM achievements WHERE status = "active" AND deleted_at IS NULL'
    );
    foreach ($achievements as $achievement) {
        $condition = json_decode((string)$achievement['condition_json'], true);
        $type = is_array($condition) ? ($condition['type'] ?? '') : '';
        $needed = (int)(is_array($condition) ? ($condition['value'] ?? 0) : 0);
        $actual = match ($type) {
            'purchase_count' => (int)($stats['purchase_count'] ?? 0),
            'spent_total' => (int)($stats['spent_total'] ?? 0),
            'owned_count' => (int)($stats['owned_count'] ?? 0),
            'daily_count' => (int)($stats['daily_count'] ?? 0),
            default => 0,
        };
        if ($actual < $needed) {
            continue;
        }

        $insert = $pdo->prepare(
            'INSERT IGNORE INTO user_achievements (user_id, achievement_id, source_type)
             VALUES (:user_id, :achievement_id, "rule")'
        );
        $insert->execute(['user_id' => $userId, 'achievement_id' => $achievement['id']]);
        if ($insert->rowCount() !== 1 || (int)$achievement['currency_reward'] <= 0) {
            continue;
        }

        $reward = (int)$achievement['currency_reward'];
        $balance = $pdo->prepare('SELECT coins FROM characters WHERE user_id = :user_id FOR UPDATE');
        $balance->execute(['user_id' => $userId]);
        $before = (int)($balance->fetchColumn() ?: 0);
        $after = $before + $reward;
        $pdo->prepare('UPDATE characters SET coins = :coins, updated_at = NOW() WHERE user_id = :user_id')
            ->execute(['coins' => $after, 'user_id' => $userId]);
        $pdo->prepare(
            'INSERT INTO transactions (user_id, transaction_type, amount, balance_before, balance_after, source_type, source_id)
             VALUES (:user_id, "earn", :amount, :before, :after, "achievement", :source_id)'
        )->execute([
            'user_id' => $userId,
            'amount' => $reward,
            'before' => $before,
            'after' => $after,
            'source_id' => $achievement['id'],
        ]);
    }
}

function lca_load_user_bundle(PDO $pdo, int $userId): ?array
{
    $stmt = $pdo->prepare(
        'SELECT
            u.id AS user_id,
            u.username,
            u.email,
            u.role,
            u.status,
            u.last_login_at,
            u.created_at AS user_created_at,
            p.display_name,
            p.public_tag,
            p.bio,
            p.phone,
            p.country_code,
            p.gender,
            p.avatar_emoji,
            p.avatar_url,
            s.theme,
            s.language,
            s.notifications_enabled,
            s.music_enabled,
            s.sound_enabled,
            s.volume,
            s.ui_state_json,
            c.level,
            c.xp,
            c.coins,
            c.avatar_emoji AS character_avatar_emoji,
            c.active_category,
            c.equipped_skin_item_id,
            c.equipped_hair_item_id,
            c.equipped_accessory_item_id,
            c.equipped_shirt_item_id,
            c.equipped_pants_item_id,
            c.equipped_shoes_item_id,
            c.equipped_extra_item_id
         FROM users u
         LEFT JOIN profiles p ON p.user_id = u.id
         LEFT JOIN settings s ON s.user_id = u.id
         LEFT JOIN characters c ON c.user_id = u.id
         WHERE u.id = :user_id AND u.deleted_at IS NULL
         LIMIT 1'
    );
    $stmt->execute(['user_id' => $userId]);
    $row = $stmt->fetch();

    if (!$row) {
        return null;
    }

    return [
        'id' => (int)$row['user_id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'role' => $row['role'],
        'status' => $row['status'],
        'lastLoginAt' => $row['last_login_at'],
        'createdAt' => $row['user_created_at'],
        'profile' => [
            'displayName' => $row['display_name'] ?? $row['username'],
            'publicTag' => $row['public_tag'] ?? lca_public_tag_from_username($row['username']),
            'bio' => $row['bio'] ?? '',
            'phone' => $row['phone'] ?? '',
            'countryCode' => $row['country_code'] ?? 'UA',
            'gender' => $row['gender'] ?? 'unknown',
            'avatarEmoji' => $row['avatar_emoji'] ?? '👨‍🎓',
            'avatarUrl' => $row['avatar_url'] ?? '',
        ],
        'settings' => [
            'theme' => $row['theme'] ?? 'dark',
            'language' => $row['language'] ?? 'uk',
            'notificationsEnabled' => (bool)($row['notifications_enabled'] ?? 1),
            'musicEnabled' => (bool)($row['music_enabled'] ?? 1),
            'soundEnabled' => (bool)($row['sound_enabled'] ?? 1),
            'volume' => (int)($row['volume'] ?? 70),
            'uiState' => $row['ui_state_json'] ? json_decode((string)$row['ui_state_json'], true) : null,
        ],
        'character' => [
            'level' => (int)($row['level'] ?? 1),
            'xp' => (int)($row['xp'] ?? 0),
            'coins' => (int)($row['coins'] ?? 0),
            'avatarEmoji' => $row['character_avatar_emoji'] ?? $row['avatar_emoji'] ?? '👨‍🎓',
            'activeCategory' => $row['active_category'] ?? 'skin',
            'selected' => lca_load_character_selection($pdo, $row),
            'equipped' => [
                'skin' => isset($row['equipped_skin_item_id']) ? (int)$row['equipped_skin_item_id'] : null,
                'hair' => isset($row['equipped_hair_item_id']) ? (int)$row['equipped_hair_item_id'] : null,
                'accessory' => isset($row['equipped_accessory_item_id']) ? (int)$row['equipped_accessory_item_id'] : null,
                'shirt' => isset($row['equipped_shirt_item_id']) ? (int)$row['equipped_shirt_item_id'] : null,
                'pants' => isset($row['equipped_pants_item_id']) ? (int)$row['equipped_pants_item_id'] : null,
                'shoes' => isset($row['equipped_shoes_item_id']) ? (int)$row['equipped_shoes_item_id'] : null,
                'extra' => isset($row['equipped_extra_item_id']) ? (int)$row['equipped_extra_item_id'] : null,
            ],
        ],
        'shop' => lca_load_user_shop($pdo, $userId),
    ];
}

function lca_issue_session(PDO $pdo, int $userId): array
{
    $token = bin2hex(random_bytes(32));
    $hash = lca_hash_token($token);
    $expiresAt = time() + LCA_SESSION_TTL_SECONDS;
    $expiresSql = gmdate('Y-m-d H:i:s', $expiresAt);

    $stmt = $pdo->prepare(
        'INSERT INTO auth_sessions (user_id, session_token_hash, expires_at, created_at, updated_at)
         VALUES (:user_id, :session_token_hash, :expires_at, NOW(), NOW())'
    );
    $stmt->execute([
        'user_id' => $userId,
        'session_token_hash' => $hash,
        'expires_at' => $expiresSql,
    ]);

    lca_set_session_cookie($token, $expiresAt);

    return [
        'token' => $token,
        'tokenHash' => $hash,
        'expiresAt' => $expiresSql,
    ];
}

function lca_current_session(PDO $pdo): ?array
{
    $cookieName = lca_config()['cookie_name'];
    if (empty($_COOKIE[$cookieName])) {
        return null;
    }

    $token = (string)$_COOKIE[$cookieName];
    if ($token === '') {
        return null;
    }

    $hash = lca_hash_token($token);
    $stmt = $pdo->prepare(
        'SELECT s.id AS session_id, s.user_id, s.expires_at, s.revoked_at, s.last_seen_at,
                u.username, u.email, u.role, u.status
         FROM auth_sessions s
         INNER JOIN users u ON u.id = s.user_id
         WHERE s.session_token_hash = :session_token_hash
            AND u.status = "active" AND u.deleted_at IS NULL
         LIMIT 1'
    );
    $stmt->execute(['session_token_hash' => $hash]);
    $session = $stmt->fetch();

    if (!$session || $session['revoked_at'] !== null) {
        return null;
    }

    if (strtotime((string)$session['expires_at']) < time()) {
        return null;
    }

    $touch = $pdo->prepare('UPDATE auth_sessions SET last_seen_at = NOW() WHERE id = :id');
    $touch->execute(['id' => $session['session_id']]);

    $user = lca_load_user_bundle($pdo, (int)$session['user_id']);
    if (!$user) {
        return null;
    }

    return [
        'sessionId' => (int)$session['session_id'],
        'expiresAt' => $session['expires_at'],
        'user' => $user,
    ];
}

function lca_require_session(PDO $pdo): array
{
    $session = lca_current_session($pdo);
    if (!$session) {
        lca_send_json(['ok' => false, 'error' => 'Unauthorized'], 401);
    }

    return $session;
}

function lca_revoke_current_session(PDO $pdo): void
{
    $cookieName = lca_config()['cookie_name'];
    if (empty($_COOKIE[$cookieName])) {
        return;
    }

    $token = (string)$_COOKIE[$cookieName];
    if ($token === '') {
        return;
    }

    $hash = lca_hash_token($token);
    $stmt = $pdo->prepare('UPDATE auth_sessions SET revoked_at = NOW() WHERE session_token_hash = :session_token_hash');
    $stmt->execute(['session_token_hash' => $hash]);
    lca_clear_session_cookie();
}

function lca_method_is(string $expected): bool
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === strtoupper($expected);
}

function lca_require_method(string $expected): void
{
    if (!lca_method_is($expected)) {
        lca_send_json(['ok' => false, 'error' => 'Method not allowed'], 405);
    }
    lca_require_csrf();
}

function lca_trim_string(mixed $value): string
{
    return trim((string)($value ?? ''));
}

function lca_valid_username(string $username): bool
{
    return (bool)preg_match('/^[a-zA-Z0-9_.-]{3,32}$/', $username);
}

function lca_valid_email(string $email): bool
{
    return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
}
