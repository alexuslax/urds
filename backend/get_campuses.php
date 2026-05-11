<?php
header('Content-Type: application/json');
require_once "db.php";

try {
    // Return default campuses (you can modify this list as needed)
    $campuses = [
        'MAIN',
        'LAOANG',
        'CATUBIG'
    ];
    
    echo json_encode([
        "status" => "success",
        "campuses" => $campuses
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
