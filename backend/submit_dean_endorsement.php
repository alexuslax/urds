<?php
session_start();
require_once "db.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit;
}

// Check if user is College Dean
if ($_SESSION['role'] !== 'College Dean') {
    echo json_encode(["status" => "error", "message" => "Access denied: Only College Dean can endorse proposals"]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

$proposalId = $data['proposal_id'] ?? null;
$comments = $data['comments'] ?? '';
$decision = $data['decision'] ?? '';
$userId = $_SESSION['user_id'];
$userRole = $_SESSION['role'];
$userCollegeId = $_SESSION['college_id'] ?? null;

// Validate input
if (!$proposalId || !$comments || !$decision) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// Map decision to status and action label
$statusMap = [
    'endorse' => 'For URDS Review',
    'return' => 'Returned for Revision',
    'minor' => 'For Minor Revision'
];

$actionMap = [
    'endorse' => 'Endorsed to URDS',
    'return' => 'Returned for Revision',
    'minor' => 'Requested Minor Revision'
];

$newStatus = $statusMap[$decision] ?? 'For URDS Review';
$actionLabel = $actionMap[$decision] ?? 'Endorsed';

try {
    // Begin transaction
    $conn->begin_transaction();

    // Verify the proposal belongs to dean's college
    $checkQuery = "SELECT college_id FROM researchproposals WHERE proposal_id = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("i", $proposalId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        throw new Exception("Proposal not found");
    }
    
    $proposalData = $checkResult->fetch_assoc();
    if ($userCollegeId && $proposalData['college_id'] != $userCollegeId) {
        throw new Exception("You can only endorse proposals from your college");
    }
    $checkStmt->close();

    // Update proposal status
    $updateQuery = "UPDATE researchproposals SET status = ?, dean_endorsed = 1, dean_endorsed_date = NOW() WHERE proposal_id = ?";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bind_param("si", $newStatus, $proposalId);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Failed to update proposal status");
    }
    $updateStmt->close();

    // Create proposal_history table if it doesn't exist
    $createHistoryTable = "
    CREATE TABLE IF NOT EXISTS proposal_history (
        history_id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100) NOT NULL,
        action VARCHAR(255) NOT NULL,
        comment TEXT,
        checklist JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proposal_id) REFERENCES researchproposals(proposal_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )";
    $conn->query($createHistoryTable);

    // Insert into proposal history
    $historyQuery = "INSERT INTO proposal_history (proposal_id, user_id, role, action, comment) VALUES (?, ?, ?, ?, ?)";
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param("iisss", $proposalId, $userId, $userRole, $actionLabel, $comments);
    
    if (!$historyStmt->execute()) {
        throw new Exception("Failed to log history");
    }
    $historyStmt->close();

    // Commit transaction
    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Dean endorsement submitted successfully",
        "new_status" => $newStatus,
        "action" => $actionLabel
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
