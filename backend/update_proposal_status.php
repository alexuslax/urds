<?php
session_start();
require "db.php";
header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$proposal_id = $data["proposal_id"] ?? $data["proposalId"] ?? 0;
$new_status = $data["status"] ?? "";
$action_by = $_SESSION['user_id'];
$role = $_SESSION['role'] ?? "";
$action_label = $data["action_label"] ?? "";
$checklist = $data["checklist"] ?? [];
$comment = $data["comment"] ?? $data["notes"] ?? "";
$cluster = $data["cluster"] ?? null;

if (!$proposal_id || !$new_status) {
    echo json_encode(["status" => "error", "message" => "Invalid proposal ID or status"]);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // Update proposal status and cluster
    if ($cluster !== null) {
        $stmt = $conn->prepare("UPDATE researchproposals SET status=?, research_cluster=? WHERE proposal_id=?");
        $stmt->bind_param("ssi", $new_status, $cluster, $proposal_id);
    } else {
        $stmt = $conn->prepare("UPDATE researchproposals SET status=? WHERE proposal_id=?");
        $stmt->bind_param("si", $new_status, $proposal_id);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to update proposal status");
    }
    $stmt->close();
    
    // Log the action in proposal_history table
    $checklistJson = json_encode($checklist);
    $historyStmt = $conn->prepare("INSERT INTO proposal_history (proposal_id, user_id, role, action, comment, checklist) VALUES (?, ?, ?, ?, ?, ?)");
    $historyStmt->bind_param("iissss", $proposal_id, $action_by, $role, $action_label, $comment, $checklistJson);
    
    if (!$historyStmt->execute()) {
        throw new Exception("Failed to log history: " . $historyStmt->error);
    }
    $historyStmt->close();
    
    $conn->commit();
    echo json_encode([
        "status" => "success", 
        "message" => "Proposal status updated successfully",
        "new_status" => $new_status
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
