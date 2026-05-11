<?php
// Prevent any output before headers
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in output

session_start();
require_once "db.php";

// Clear any output that might have occurred
ob_clean();

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

try {
    // Get user_id from session
    $userId = $_SESSION["user_id"] ?? null;

    if (!$userId) {
        echo json_encode(["status" => "error", "message" => "User not logged in"]);
        exit;
    }

    // Get proposals for this user with college and department names
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
        WHERE rp.user_id = ?
        ORDER BY rp.created_at DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $proposals = [];

    while ($row = $result->fetch_assoc()) {
        // Fetch workplan items from workplan_items table
        $workplanQuery = "SELECT activity, q1, q2, q3, q4 FROM workplan_items WHERE proposal_id = ?";
        $workplanStmt = $conn->prepare($workplanQuery);
        $workplanStmt->bind_param("i", $row['proposal_id']);
        $workplanStmt->execute();
        $workplanResult = $workplanStmt->get_result();
        
        $workplan = [];
        while ($wpRow = $workplanResult->fetch_assoc()) {
            $workplan[] = [
                'activity' => $wpRow['activity'],
                'q1' => (bool)$wpRow['q1'],
                'q2' => (bool)$wpRow['q2'],
                'q3' => (bool)$wpRow['q3'],
                'q4' => (bool)$wpRow['q4']
            ];
        }
        $workplanStmt->close();
        
        // Fetch budget items from separate tables
        $budget = [
            "personalServices" => [],
            "mooe" => [],
            "equipment" => []
        ];
        
        // Personal Services
        $psQuery = "SELECT item, q1, q2, q3, q4, year1, year2, year3, total FROM proposal_ps WHERE proposal_id = ?";
        $psStmt = $conn->prepare($psQuery);
        $psStmt->bind_param("i", $row['proposal_id']);
        $psStmt->execute();
        $psResult = $psStmt->get_result();
        while ($psRow = $psResult->fetch_assoc()) {
            $budget['personalServices'][] = [
                'item' => $psRow['item'],
                'q1' => floatval($psRow['q1']),
                'q2' => floatval($psRow['q2']),
                'q3' => floatval($psRow['q3']),
                'q4' => floatval($psRow['q4']),
                'year1' => floatval($psRow['year1']),
                'year2' => floatval($psRow['year2']),
                'year3' => floatval($psRow['year3']),
                'total' => floatval($psRow['total'])
            ];
        }
        $psStmt->close();
        
        // MOOE
        $mooeQuery = "SELECT type, date_field, places, purpose, mode_of_transport, unit, description, qty, unit_cost, year1, year2, year3, estimated_cost, total FROM proposal_mooe WHERE proposal_id = ?";
        $mooeStmt = $conn->prepare($mooeQuery);
        $mooeStmt->bind_param("i", $row['proposal_id']);
        $mooeStmt->execute();
        $mooeResult = $mooeStmt->get_result();
        while ($mooeRow = $mooeResult->fetch_assoc()) {
            $budget['mooe'][] = [
                'type' => $mooeRow['type'],
                'date_field' => $mooeRow['date_field'],
                'places' => $mooeRow['places'],
                'purpose' => $mooeRow['purpose'],
                'mode_of_transport' => $mooeRow['mode_of_transport'],
                'unit' => $mooeRow['unit'],
                'description' => $mooeRow['description'],
                'qty' => floatval($mooeRow['qty']),
                'unit_cost' => floatval($mooeRow['unit_cost']),
                'year1' => floatval($mooeRow['year1']),
                'year2' => floatval($mooeRow['year2']),
                'year3' => floatval($mooeRow['year3']),
                'estimated_cost' => floatval($mooeRow['estimated_cost']),
                'total' => floatval($mooeRow['total'])
            ];
        }
        $mooeStmt->close();
        
        // Equipment
        $eqQuery = "SELECT date_field, unit, item_description, purpose, qty, year1, year2, year3, estimated_cost, total FROM proposal_equipment WHERE proposal_id = ?";
        $eqStmt = $conn->prepare($eqQuery);
        $eqStmt->bind_param("i", $row['proposal_id']);
        $eqStmt->execute();
        $eqResult = $eqStmt->get_result();
        while ($eqRow = $eqResult->fetch_assoc()) {
            $budget['equipment'][] = [
                'date_field' => $eqRow['date_field'],
                'unit' => $eqRow['unit'],
                'description' => $eqRow['item_description'],
                'purpose' => $eqRow['purpose'],
                'qty' => floatval($eqRow['qty']),
                'year1' => floatval($eqRow['year1']),
                'year2' => floatval($eqRow['year2']),
                'year3' => floatval($eqRow['year3']),
                'estimated_cost' => floatval($eqRow['estimated_cost']),
                'total' => floatval($eqRow['total'])
            ];
        }
        $eqStmt->close();

        // Format for frontend
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
            'workplan' => $workplan,
            'budget' => $budget,
            'proposalFile' => $row['proposal_file'],
            'workplanFile' => $row['workplan_file'],
            'budgetFile' => $row['budget_file'],
            'submitter' => $row['first_name'] . ' ' . $row['last_name'],
            'submitterEmail' => $row['email']
        ];
    }

    echo json_encode(["status" => "success", "proposals" => $proposals]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit;
}
