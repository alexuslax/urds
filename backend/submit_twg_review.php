<?php
// backend/submit_twg_review.php
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
    if (!$userId || !in_array($userRole, ["TWG", "Senior Faculty Researcher / TWG"])) {
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

    // Insert review into proposal_reviews table (create if not exists)
  $stmt = $conn->prepare("
    INSERT INTO proposal_history
    (proposal_id, user_id, role, action, comment, checklist, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
");

$checklistJson = json_encode($review["criteria"] ?? []);

$stmt->bind_param(
    "iissss",
    $proposalId,
    $userId,
    $userRole,                     // role
    $review["recommendation"],     // action
    $review["comments"],           // comment
    $checklistJson                 // checklist (JSON)
);

$stmt->execute();
$stmt->close();


    // Optionally update proposal status based on recommendation
    $newStatus = null;
    if (!empty($data["submit"]) && !empty($review["recommendation"])) {
        $rec = strtolower($review["recommendation"]);
        if (strpos($rec, 'urec') !== false) {
            $newStatus = 'for UREC review';
        } else if (strpos($rec, 'director') !== false) {
            $newStatus = 'for director review';
        } else if (strpos($rec, 'revision') !== false || strpos($rec, 'return') !== false) {
            $newStatus = 'returned for revision';
        } else {
            $newStatus = 'For Dean Review';
        }

        $update = $conn->prepare("UPDATE researchproposals SET status = ? WHERE proposal_id = ?");
        $update->bind_param("si", $newStatus, $proposalId);
        $update->execute();
        $update->close();
    }

    // Fetch updated history and recent reviews for the proposal to return authoritative data
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

    $reviews = [];
    $rstmt = $conn->prepare("SELECT pr.*, u.first_name, u.last_name FROM proposal_history pr LEFT JOIN users u ON pr.user_id = u.user_id WHERE pr.proposal_id = ? ORDER BY pr.created_at DESC");
    $rstmt->bind_param("i", $proposalId);
    $rstmt->execute();
    $rres = $rstmt->get_result();
    while ($row = $rres->fetch_assoc()) {
        $reviews[] = [
            'review_id' => $row['review_id'],
            'reviewer_id' => $row['reviewer_id'],
            'reviewer_name' => $row['reviewer_name'] ?? trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
            'recommendation' => $row['recommendation'],
            'criteria' => [
                'relevance' => $row['criteria_relevance'],
                'technical' => $row['criteria_technical'],
                'feasibility' => $row['criteria_feasibility'],
                'capability' => $row['criteria_capability'],
                'ethics' => $row['criteria_ethics']
            ],
            'comments' => $row['comments'],
            'submitted_at' => $row['submitted_at'],
            'role' => $row['role']
        ];
    }
    $rstmt->close();

    // If status wasn't changed during this request, query current status
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

    echo json_encode(["status" => "success", "history" => $history, "reviews" => $reviews, "updatedStatus" => $newStatus]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit;
}
