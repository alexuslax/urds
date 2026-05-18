<?php
// Prevent accidental output
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();
require_once "db.php";

ob_clean();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

try {
    // Get user info from session
    $userId = $_SESSION["user_id"] ?? null;
    $userRole = $_SESSION["role"] ?? null;
    $userCollegeId = $_SESSION["college_id"] ?? null;

    if (!$userId) {
        echo json_encode(["status" => "error", "message" => "User not logged in"]);
        exit;
    }

    // Build WHERE clause based on role
    $whereClause = "";
    $params = [];
    $types = "";
    
    // Filter based on role
    if ($userRole === "College Research Coordinator" && $userCollegeId) {
        // Coordinators see only proposals from their college with specific statuses
        // For "returned for revision", only show if it was returned before dean endorsement (dean_endorsed = 0)
        $whereClause = "WHERE rp.college_id = ? AND (
            rp.status IN ('for screening', 'for dean endorsement', 'rejected', 'approved')
            OR (rp.status = 'returned for revision' AND rp.dean_endorsed = 0)
        )";
        $params[] = $userCollegeId;
        $types = "i";
    } else if ($userRole === "College Dean" && $userCollegeId) {
        // Deans see only proposals from their college with specific statuses
        // For "returned for revision", only show if it was returned at dean level (dean_endorsed = 0)
        $whereClause = "WHERE rp.college_id = ? AND (
            rp.status IN ('for dean endorsement', 'for URDS review', 'rejected', 'approved')
            OR (rp.status = 'returned for revision' AND rp.dean_endorsed = 0)
        )";
        $params[] = $userCollegeId;
        $types = "i";
    } else if ($userRole === "URDS Staff") {
        // URDS Staff see all proposals that have left the Dean level
        // For "returned for revision", only show if it's past dean level (dean_endorsed = 1) - meaning returned by URDS/TWG/Evaluator/Director
        // Exclude those returned at college level
        $whereClause = "WHERE (
            rp.status IN ('for URDS review', 'for TWG evaluation', 'for evaluator review', 'for director review', 'approved', 'rejected', 'for implementation', 'completed')
            OR (rp.status = 'returned for revision' AND rp.dean_endorsed = 1)
        )";
    } else if ($userRole === "Senior Faculty Researcher / TWG" || $userRole === "TWG") {
        // TWG see only proposals forwarded to them
        // For "returned for revision", only show if it's past dean level (dean_endorsed = 1)
        $whereClause = "WHERE (
            rp.status IN ('for TWG evaluation', 'for evaluator review', 'for director review', 'approved', 'rejected', 'for implementation', 'completed')
            OR (rp.status = 'returned for revision' AND rp.dean_endorsed = 1)
        )";
    } else if ($userRole === "UREC") {
        // Legacy UREC users see proposals that have reached evaluator/director stages.
        // For "returned for revision", only show if it's past dean level (dean_endorsed = 1)
        $whereClause = "WHERE (
            rp.status IN ('for evaluator review', 'for director review', 'rejected', 'approved')
            OR (rp.status = 'returned for revision' AND rp.dean_endorsed = 1)
        )";
    } else if ($userRole === "URDS Director") {
        // Director sees all proposals (full visibility for monitoring)
        // No WHERE clause - see everything
    }
    // Administrator sees all proposals (no WHERE clause)
    
    $query = "
        SELECT 
            rp.*,
            c.college_name,
            d.department_name,
            u.first_name,
                        u.last_name,
                        u.email,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND (
                                        LOWER(ph.role) LIKE '%coordinator%'
                                        OR LOWER(ph.role) = 'crc'
                                        OR LOWER(ph.action) LIKE '%screen%'
                                    )
                        ) AS screening_date,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND LOWER(ph.role) LIKE '%dean%'
                        ) AS dean_review_date,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND (
                                        LOWER(ph.role) LIKE '%urds staff%'
                                        OR LOWER(ph.role) = 'urds'
                                        OR LOWER(ph.action) LIKE '%urds%'
                                    )
                        ) AS urds_review_date,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND LOWER(ph.role) LIKE '%evaluator%'
                        ) AS evaluator_review_date,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND LOWER(ph.role) LIKE '%twg%'
                        ) AS twg_review_date,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND LOWER(ph.role) LIKE '%urec%'
                        ) AS urec_review_date,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND LOWER(ph.role) LIKE '%director%'
                        ) AS director_review_date,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                        ) AS last_action_date,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND LOWER(ph.action) LIKE '%approved%'
                        ) AS approved_at,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND (
                                        LOWER(ph.action) LIKE '%return%'
                                        OR LOWER(ph.action) LIKE '%revision%'
                                    )
                        ) AS returned_at,
                        (
                                SELECT MAX(ph.created_at)
                                FROM proposal_history ph
                                WHERE ph.proposal_id = rp.proposal_id
                                    AND (
                                        LOWER(ph.action) LIKE '%reject%'
                                        OR LOWER(ph.action) LIKE '%disapprove%'
                                    )
                        ) AS rejected_at
        FROM researchproposals rp
        LEFT JOIN colleges c ON rp.college_id = c.college_id
        LEFT JOIN departments d ON rp.department_id = d.department_id
        LEFT JOIN users u ON rp.user_id = u.user_id
        $whereClause
        ORDER BY rp.created_at DESC
    ";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $proposals = [];
    
    while ($row = $result->fetch_assoc()) {
        // Format for frontend (same as get_my_proposals.php)
        $proposals[] = [
            'id' => $row['proposal_id'],
            'title' => $row['program_title'],
            'description' => $row['program_description'],
            'nature' => $row['nature'],
            'cluster' => $row['research_cluster'],
            'leader' => $row['study_leader'],
            'studyLeader' => $row['study_leader'],
            'college' => $row['college_name'],
            'collegeId' => $row['college_id'],
            'department' => $row['department_name'],
            'departmentId' => $row['department_id'],
            'status' => $row['status'],
            'dateSubmitted' => $row['created_at'],
            'screening_date' => $row['screening_date'],
            'dean_review_date' => $row['dean_review_date'],
            'urds_review_date' => $row['urds_review_date'],
            'evaluator_review_date' => $row['evaluator_review_date'],
            'twg_review_date' => $row['twg_review_date'],
            'urec_review_date' => $row['urec_review_date'],
            'director_review_date' => $row['director_review_date'],
            'last_action_date' => $row['last_action_date'],
            'approved_at' => $row['approved_at'],
            'returned_at' => $row['returned_at'],
            'rejected_at' => $row['rejected_at'],
            'rationale' => $row['rationale'],
            'objectives' => $row['objectives'],
            'literature' => $row['literature'],
            'methodology' => $row['methodology'],
            'expectedOutput' => $row['expected_output'],
            'impact' => $row['impact'],
            'otherPersonnel' => $row['other_personnel'],
            'location' => $row['project_location'],
            'duration' => $row['duration_months'],
            'estimatedBudget' => $row['estimated_budget'],
            'computedBudgetTotal' => $row['computed_budget_total'],
            'proposalFile' => $row['proposal_file'],
            'workplanFile' => $row['workplan_file'],
            'budgetFile' => $row['budget_file'],
            'submitter' => trim($row['first_name'] . ' ' . $row['last_name']),
            'submitterEmail' => $row['email']
        ];
    }
    
    echo json_encode([
        "status" => "success",
        "proposals" => $proposals
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit;

}
?>
