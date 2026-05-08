<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once __DIR__ . '/database.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'movies';

$db = get_db();

// ── /api.php?action=top5 ──────────────────────────────────────────────────
if ($action === 'top5') {

    $top5_ids = [10, 9, 44, 14, 18];
    $movies = [];

    foreach ($top5_ids as $rank => $movie_id) {
        $stmt = $db->prepare('SELECT * FROM movies WHERE id = :id');
        $stmt->bindValue(':id', $movie_id, SQLITE3_INTEGER);
        $result = $stmt->execute();
        $movie = $result->fetchArray(SQLITE3_ASSOC);

        if ($movie) {
            if ($movie['score'] !== null) {
                $movie['score'] = (int) $movie['score'];
            }
            $movie['rank'] = $rank + 1;
            $movies[] = $movie;
        }
    }

    echo json_encode($movies);

// ── /api.php  (or ?action=movies) ────────────────────────────────────────
} else {

    $result = $db->query('SELECT * FROM movies ORDER BY RANDOM()');
    $movies = [];

    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        if ($row['score'] !== null) {
            $row['score'] = (int) $row['score'];
        }
        $movies[] = $row;
    }

    echo json_encode($movies);
}

$db->close();
?>