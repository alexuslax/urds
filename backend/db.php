<?php
<<<<<<< HEAD
$url = getenv("MYSQL_URL") ?: getenv("DATABASE_URL");

if ($url) {
    $db = parse_url($url);
    $host = $db["host"] ?? "localhost";
    $port = $db["port"] ?? 3306;
    $user = $db["user"] ?? "root";
    $pass = isset($db["pass"]) ? urldecode($db["pass"]) : "";
    $dbname = isset($db["path"]) ? ltrim($db["path"], "/") : "research_db";
} else {
    $host = getenv("MYSQLHOST") ?: getenv("DB_HOST") ?: "localhost";
    $port = getenv("MYSQLPORT") ?: getenv("DB_PORT") ?: 3306;
    $user = getenv("MYSQLUSER") ?: getenv("DB_USER") ?: "root";
    $pass = getenv("MYSQLPASSWORD") ?: getenv("DB_PASSWORD") ?: "";
    $dbname = getenv("MYSQLDATABASE") ?: getenv("DB_NAME") ?: "research_db";
}

// Suppress connection warnings
$conn = @new mysqli($host, $user, $pass, $dbname, (int) $port);
=======
$host = "localhost";
$user = "root"; // default XAMPP username
$pass = "";     // default XAMPP password
$dbname = "research_db";

// Suppress connection warnings
$conn = @new mysqli($host, $user, $pass, $dbname);
>>>>>>> origin/master

if ($conn->connect_error) {
    // Don't die with HTML, let calling script handle error
    error_log("Database Connection Failed: " . $conn->connect_error);
    throw new Exception("Database connection failed");
}

// Set charset to prevent encoding issues
$conn->set_charset("utf8mb4");
