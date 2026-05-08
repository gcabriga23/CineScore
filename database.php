<?php
// Opens and returns a connection to the SQLite database
function get_db() {
    $db = new SQLite3(__DIR__ . '/database/movies.db');
    return $db;
}
?>