<?php
session_start();
require_once "db.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

try {
    // Get distinct research clusters from proposals
    $query = "SELECT DISTINCT research_cluster FROM researchproposals 
              WHERE research_cluster IS NOT NULL AND research_cluster != '' 
              ORDER BY research_cluster ASC";
    
    $result = $conn->query($query);
    
    $clusters = [];
    while ($row = $result->fetch_assoc()) {
        $clusters[] = $row['research_cluster'];
    }
    
    echo json_encode([
        "status" => "success",
        "clusters" => $clusters
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
