<?php
$host = "localhost";
$user = "root"; // default XAMPP username
$pass = "";     // default XAMPP password
$dbname = "research_db";

// Suppress connection warnings
$conn = @new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    // Don't die with HTML, let calling script handle error
    error_log("Database Connection Failed: " . $conn->connect_error);
    throw new Exception("Database connection failed");
}

// Set charset to prevent encoding issues
$conn->set_charset("utf8mb4");
