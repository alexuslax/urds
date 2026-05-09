<?php
header('Content-Type: application/json');
require_once "db.php";

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!is_array($data) || !isset($data['settings']) || !is_array($data['settings'])) {
    echo json_encode(["status" => "error", "message" => "Invalid payload"]);
    exit;
}

try {
    // Ensure table exists
    $createSql = "CREATE TABLE IF NOT EXISTS system_settings (
        name VARCHAR(100) NOT NULL PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->query($createSql);

    $stmt = $conn->prepare("INSERT INTO system_settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value=VALUES(value)");
    foreach ($data['settings'] as $k => $v) {
        $name = substr($k, 0, 100);
        $value = is_null($v) ? null : (string)$v;
        $stmt->bind_param('ss', $name, $value);
        $stmt->execute();
    }

    echo json_encode(["status" => "success"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
