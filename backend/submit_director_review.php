<?php
// backend/submit_director_review.php

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
    // -------------------------
    // Auth & role guard
    // -------------------------
    $userId   = $_SESSION["user_id"] ?? null;
    $userRole = $_SESSION["role"] ?? null;

    if (
        !$userId ||
        !in_array($userRole, ["URDS Director", "Director", "URDS"])
    ) {
        echo json_encode([
            "status" => "error",
            "message" => "Unauthorized"
        ]);
        exit;
    }

    // -------------------------
    // Input
    // -------------------------
    $data = json_decode(file_get_contents("php://input"), true);

    $proposalId = $data["proposal_id"] ?? null;
    $review     = $data["review"] ?? null;
    $submit     = !empty($data["submit"]);

    if (!$proposalId || !$review) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing data"
        ]);
        exit;
    }

    $decision = trim($review["decision"] ?? "");
    $comment  = trim($review["comments"] ?? "");

    // -------------------------
    // Insert proposal history (ONE row)
    // -------------------------
    $roleLabel = "URDS Director";

    $hist = $conn->prepare("
        INSERT INTO proposal_history
            (proposal_id, user_id, role, action, comment, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $hist->bind_param(
        "iisss",
        $proposalId,
        $userId,
        $roleLabel,
        $decision,
        $comment
    );

    $hist->execute();
    $hist->close();

    // -------------------------
    // Decision → status mapping
    // -------------------------
    $newStatus = null;

    if ($submit) {
        switch ($decision) {
            case "Approved":
                $newStatus = "approved";
                break;

            case "Returned for Revision":
                $newStatus = "returned for revision";
                break;

            case "Reject":
                $newStatus = "rejected";
                break;

            case "Return to Staff":
                $newStatus = "for URDS review";
                break;
        }

        // Safety check: never allow empty status
        if (!$newStatus) {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid director decision."
            ]);
            exit;
        }

        // -------------------------
        // Update proposal status
        // -------------------------
        $upd = $conn->prepare("
            UPDATE researchproposals
            SET status = ?
            WHERE proposal_id = ?
        ");

        $upd->bind_param("si", $newStatus, $proposalId);
        $upd->execute();
        $upd->close();
    }

    // -------------------------
    // Fetch updated history
    // -------------------------
    $history = [];

    $hstmt = $conn->prepare("
        SELECT ph.*, u.first_name, u.last_name
        FROM proposal_history ph
        LEFT JOIN users u ON ph.user_id = u.user_id
        WHERE ph.proposal_id = ?
        ORDER BY ph.created_at ASC
    ");

    $hstmt->bind_param("i", $proposalId);
    $hstmt->execute();
    $hres = $hstmt->get_result();

    while ($row = $hres->fetch_assoc()) {
        $history[] = [
            "role"    => $row["role"],
            "action"  => $row["action"],
            "comment" => $row["comment"],
            "date"    => $row["created_at"],
            "user"    => trim(($row["first_name"] ?? "") . " " . ($row["last_name"] ?? ""))
        ];
    }

    $hstmt->close();

    // -------------------------
    // Get authoritative status
    // -------------------------
    $dbStatus = null;

    $sstmt = $conn->prepare("
        SELECT status
        FROM researchproposals
        WHERE proposal_id = ?
        LIMIT 1
    ");

    $sstmt->bind_param("i", $proposalId);
    $sstmt->execute();
    $sres = $sstmt->get_result();

    if ($srow = $sres->fetch_assoc()) {
        $dbStatus = $srow["status"];
    }

    $sstmt->close();

    // -------------------------
    // Success response
    // -------------------------
    echo json_encode([
        "status"        => "success",
        "history"       => $history,
        "updatedStatus" => $dbStatus
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status"  => "error",
        "message" => $e->getMessage()
    ]);
    exit;
}
