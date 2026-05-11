<?php
header("Content-Type: application/json");

$url = getenv("MYSQL_URL") ?: getenv("DATABASE_URL");

if (!$url) {
    echo json_encode([
        "ok" => false,
        "error" => "DATABASE_URL or MYSQL_URL is not set"
    ]);
    exit;
}

$db = parse_url($url);
$host = $db["host"] ?? "";
$port = (int) ($db["port"] ?? 3306);
$user = isset($db["user"]) ? urldecode($db["user"]) : "";
$pass = isset($db["pass"]) ? urldecode($db["pass"]) : "";
$name = isset($db["path"]) ? urldecode(ltrim($db["path"], "/")) : "";

$conn = @new mysqli($host, $user, $pass, $name, $port);

if ($conn->connect_error) {
    echo json_encode([
        "ok" => false,
        "host" => $host,
        "port" => $port,
        "database" => $name,
        "user" => $user,
        "connect_errno" => $conn->connect_errno,
        "connect_error" => $conn->connect_error
    ]);
    exit;
}

echo json_encode([
    "ok" => true,
    "host" => $host,
    "port" => $port,
    "database" => $name,
    "user" => $user,
    "server_info" => $conn->server_info
]);
