<?php
header('Content-Type: application/json');
require_once "db.php";

try {
    // Ensure table exists
    $createSql = "CREATE TABLE IF NOT EXISTS system_settings (
        name VARCHAR(100) NOT NULL PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->query($createSql);

    $rows = [];
    $res = $conn->query("SELECT name, value FROM system_settings");
    if ($res) {
        while ($r = $res->fetch_assoc()) {
            $rows[$r['name']] = $r['value'];
        }
    }

    echo json_encode(["status" => "success", "settings" => $rows]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
