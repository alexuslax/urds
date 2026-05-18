<?php
// backend/submit_urec_review.php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();
require_once "db.php";

ob_clean();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

try {
    $userId = $_SESSION["user_id"] ?? null;
    $userRole = $_SESSION["role"] ?? null;
    if (!$userId || !in_array($userRole, ["UREC", "Senior Faculty Researcher / UREC"])) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $proposalId = $data["proposal_id"] ?? null;
    $review = $data["review"] ?? null;
    if (!$proposalId || !$review) {
        echo json_encode(["status" => "error", "message" => "Missing data"]);
        exit;
    }

    // Ensure proposal_history exists (safe to call)
    $createHistoryTable = "
    CREATE TABLE IF NOT EXISTS proposal_history (
        history_id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100) NOT NULL,
        action VARCHAR(255) NOT NULL,
        comment TEXT,
        checklist JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->query($createHistoryTable);

    // Insert into proposal_history
    $historyQuery = "INSERT INTO proposal_history (proposal_id, user_id, role, action, comment, checklist) VALUES (?, ?, ?, ?, ?, ?)";
    $historyStmt = $conn->prepare($historyQuery);

    $checklistJson = json_encode($review["criteria"] ?? []);
    $actionLabel = $review["decision"] ?? ($review["recommendation"] ?? 'UREC Review');
    $comments = $review["notes"] ?? ($review["comments"] ?? '');

    $historyStmt->bind_param("iissss", $proposalId, $userId, $userRole, $actionLabel, $comments, $checklistJson);
    if (!$historyStmt->execute()) {
        echo json_encode(["status" => "error", "message" => "Failed to save history"]);
        exit;
    }
    $historyStmt->close();

    // Map decision to status
    $newStatus = null;
    $dec = strtolower($actionLabel);
    if (strpos($dec, 'approve') !== false || strpos($dec, 'approved') !== false || strpos($dec, 'for director') !== false || strpos($dec, 'director review') !== false) {
        $newStatus = 'for director review';
    } else if (strpos($dec, 'revision') !== false || strpos($dec, 'return') !== false || strpos($dec, 'returned') !== false) {
        $newStatus = 'returned for revision';
    } else if (strpos($dec, 'disapprove') !== false || strpos($dec, 'disapproved') !== false || strpos($dec, 'reject') !== false || strpos($dec, 'rejected') !== false) {
        $newStatus = 'rejected';
    }

    if ($newStatus !== null) {
        $update = $conn->prepare("UPDATE researchproposals SET status = ? WHERE proposal_id = ?");
        $update->bind_param("si", $newStatus, $proposalId);
        $update->execute();
        $update->close();
    }

    // Return updated history and status
    $history = [];
    $hstmt = $conn->prepare("SELECT ph.*, u.first_name, u.last_name FROM proposal_history ph LEFT JOIN users u ON ph.user_id = u.user_id WHERE ph.proposal_id = ? ORDER BY ph.created_at ASC");
    $hstmt->bind_param("i", $proposalId);
    $hstmt->execute();
    $hres = $hstmt->get_result();
    while ($row = $hres->fetch_assoc()) {
        $history[] = [
            'role' => $row['role'],
            'action' => $row['action'],
            'comment' => $row['comment'],
            'date' => $row['created_at'],
            'user' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''))
        ];
    }
    $hstmt->close();

    // Get current status
    if ($newStatus === null) {
        $sstmt = $conn->prepare("SELECT status FROM researchproposals WHERE proposal_id = ? LIMIT 1");
        $sstmt->bind_param("i", $proposalId);
        $sstmt->execute();
        $sres = $sstmt->get_result();
        if ($srow = $sres->fetch_assoc()) {
            $newStatus = $srow['status'];
        }
        $sstmt->close();
    }

    echo json_encode(["status" => "success", "history" => $history, "updatedStatus" => $newStatus]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}

?>
