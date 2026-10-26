<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

lca_require_method('POST');
$pdo = lca_db();
$session = lca_require_session($pdo);
$input = lca_read_json_input();
$lessonId = (int)($input['lessonId'] ?? 0);
$score = max(0, min(100, (int)($input['score'] ?? 0)));
$userId = (int)$session['user']['id'];

if ($lessonId < 1) {
    lca_send_json(['ok' => false, 'code' => 'LESSON_INVALID', 'error' => 'Invalid lesson'], 422);
}

try {
    $pdo->beginTransaction();
    $lessonStmt = $pdo->prepare(
        'SELECT id, xp_reward FROM lessons WHERE id = :lesson_id AND status = "active" AND deleted_at IS NULL FOR UPDATE'
    );
    $lessonStmt->execute(['lesson_id' => $lessonId]);
    $lesson = $lessonStmt->fetch();
    if (!$lesson) {
        throw new RuntimeException('LESSON_NOT_FOUND');
    }

    $progressStmt = $pdo->prepare(
        'SELECT completed FROM lesson_progress WHERE user_id = :user_id AND lesson_id = :lesson_id FOR UPDATE'
    );
    $progressStmt->execute(['user_id' => $userId, 'lesson_id' => $lessonId]);
    $progress = $progressStmt->fetch();
    $alreadyCompleted = (bool)($progress['completed'] ?? false);

    $pdo->prepare(
        'INSERT INTO lesson_progress
            (user_id, lesson_id, completed, score, progress_percent, started_at, last_accessed_at, completed_at)
         VALUES (:user_id, :lesson_id, 1, :score, 100, NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE
            completed = 1, score = GREATEST(score, VALUES(score)), progress_percent = 100,
            last_accessed_at = NOW(), completed_at = COALESCE(completed_at, NOW())'
    )->execute(['user_id' => $userId, 'lesson_id' => $lessonId, 'score' => $score]);

    if (!$alreadyCompleted) {
        $characterStmt = $pdo->prepare('SELECT xp, level, coins FROM characters WHERE user_id = :user_id FOR UPDATE');
        $characterStmt->execute(['user_id' => $userId]);
        $character = $characterStmt->fetch() ?: ['xp' => 0, 'level' => 1, 'coins' => 0];
        $xpBefore = (int)$character['xp'];
        $coinsBefore = (int)$character['coins'];
        $xpAfter = $xpBefore + (int)$lesson['xp_reward'];
        $coinsAfter = $coinsBefore + 10;
        $levelAfter = max(1, intdiv($xpAfter, 100) + 1);
        $pdo->prepare(
            'UPDATE characters SET xp = :xp, level = :level, coins = :coins, updated_at = NOW() WHERE user_id = :user_id'
        )->execute([
            'xp' => $xpAfter,
            'level' => $levelAfter,
            'coins' => $coinsAfter,
            'user_id' => $userId,
        ]);
        $pdo->prepare(
            'INSERT INTO transactions (user_id, transaction_type, amount, balance_before, balance_after, source_type, source_id)
             VALUES (:user_id, "earn", 10, :before, :after, "lesson", :source_id)'
        )->execute([
            'user_id' => $userId,
            'before' => $coinsBefore,
            'after' => $coinsAfter,
            'source_id' => $lessonId,
        ]);
        lca_check_achievements($pdo, $userId);
    }
    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $code = $exception->getMessage();
    if ($code === 'LESSON_NOT_FOUND') {
        lca_send_json(['ok' => false, 'code' => $code, 'error' => 'Lesson is not available'], 404);
    }
    lca_send_json(['ok' => false, 'code' => 'LESSON_FAILED', 'error' => 'Lesson completion failed'], 500);
}

lca_send_json(['ok' => true, 'user' => lca_load_user_bundle($pdo, $userId)]);
