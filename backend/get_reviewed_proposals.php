<?php
// backend/get_reviewed_proposals.php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();
require_once "db.php";

ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

try {
    $userId = $_SESSION["user_id"] ?? null;
    if (!$userId) {
        echo json_encode(["status" => "error", "message" => "User not logged in"]);
        exit;
    }

    // Select proposals that the user has an entry for in proposal_history
    $query = "
        SELECT rp.proposal_id, rp.program_title, rp.status, MAX(ph.created_at) AS last_reviewed_at, ph.action AS last_action, ph.comment AS last_comment
        FROM proposal_history ph
        JOIN researchproposals rp ON rp.proposal_id = ph.proposal_id
        WHERE ph.user_id = ?
        GROUP BY rp.proposal_id, rp.program_title, rp.status, ph.action, ph.comment
        ORDER BY last_reviewed_at DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $res = $stmt->get_result();

    $out = [];
    while ($row = $res->fetch_assoc()) {
        $out[] = [
            'id' => $row['proposal_id'],
            'title' => $row['program_title'],
            'status' => $row['status'],
            'last_reviewed_at' => $row['last_reviewed_at'],
            'last_action' => $row['last_action'],
            'last_comment' => $row['last_comment']
        ];
    }
    $stmt->close();

    echo json_encode(["status" => "success", "proposals" => $out]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}

?>