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

    // Must be logged in (optional depending on requirement)
    $userId = $_SESSION["user_id"] ?? null;

    if (!$userId) {
        echo json_encode(["status" => "error", "message" => "User not logged in"]);
        exit;
    }

    // Proposal ID
    $proposalId = $_GET["id"] ?? null;

    if (!$proposalId) {
        echo json_encode(["status" => "error", "message" => "Proposal ID is required"]);
        exit;
    }

    // Query proposal + user + college + department + endorsers
    $query = "
        SELECT 
            rp.*,
            c.college_name,
            c.college_dean,
            d.department_name,
            u.first_name,
            u.last_name,
            u.email,
            crc.first_name AS crc_first_name,
            crc.last_name AS crc_last_name,
            dean.first_name AS dean_first_name,
            dean.last_name AS dean_last_name
        FROM researchproposals rp
        LEFT JOIN colleges c ON rp.college_id = c.college_id
        LEFT JOIN departments d ON rp.department_id = d.department_id
        LEFT JOIN users u ON rp.user_id = u.user_id
        LEFT JOIN users crc ON crc.college_id = rp.college_id AND crc.role = 'College Research Coordinator'
        LEFT JOIN users dean ON dean.college_id = rp.college_id AND dean.role = 'College Dean'
        WHERE rp.proposal_id = ?
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $proposalId);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$row = $result->fetch_assoc()) {
        echo json_encode(["status" => "error", "message" => "Proposal not found"]);
        exit;
    }

    // -----------------------------------------------------
    // DECODE JSON FIELDS (THE CORRECT WAY)
    // -----------------------------------------------------

    // Fetch workplan items from workplan_items table
    $workplanQuery = "SELECT activity, y1_q1, y1_q2, y1_q3, y1_q4, y2_q1, y2_q2, y2_q3, y2_q4, y3_q1, y3_q2, y3_q3, y3_q4 FROM workplan_items WHERE proposal_id = ?";
    $workplanStmt = $conn->prepare($workplanQuery);
    $workplanStmt->bind_param("i", $proposalId);
    $workplanStmt->execute();
    $workplanResult = $workplanStmt->get_result();
    
    $workplan = [];
    while ($wpRow = $workplanResult->fetch_assoc()) {
        $workplan[] = [
            'activity' => $wpRow['activity'],
            'y1_q1' => (bool)$wpRow['y1_q1'],
            'y1_q2' => (bool)$wpRow['y1_q2'],
            'y1_q3' => (bool)$wpRow['y1_q3'],
            'y1_q4' => (bool)$wpRow['y1_q4'],
            'y2_q1' => (bool)$wpRow['y2_q1'],
            'y2_q2' => (bool)$wpRow['y2_q2'],
            'y2_q3' => (bool)$wpRow['y2_q3'],
            'y2_q4' => (bool)$wpRow['y2_q4'],
            'y3_q1' => (bool)$wpRow['y3_q1'],
            'y3_q2' => (bool)$wpRow['y3_q2'],
            'y3_q3' => (bool)$wpRow['y3_q3'],
            'y3_q4' => (bool)$wpRow['y3_q4']
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
    $psStmt->bind_param("i", $proposalId);
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
    $mooeStmt->bind_param("i", $proposalId);
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
    $eqStmt->bind_param("i", $proposalId);
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

    // Fetch proposal history
    $history = [];
    $historyQuery = "SELECT ph.*, u.first_name, u.last_name FROM proposal_history ph 
                     LEFT JOIN users u ON ph.user_id = u.user_id 
                     WHERE ph.proposal_id = ? 
                     ORDER BY ph.created_at ASC";
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param("i", $proposalId);
    $historyStmt->execute();
    $historyResult = $historyStmt->get_result();
    
    while ($histRow = $historyResult->fetch_assoc()) {
        $checklist = null;
        if ($histRow['checklist']) {
            $checklist = json_decode($histRow['checklist'], true);
        }
        
        $history[] = [
            'role' => $histRow['role'],
            'action' => $histRow['action'],
            'comment' => $histRow['comment'],
            'date' => $histRow['created_at'],
            'user' => trim(($histRow['first_name'] ?? '') . ' ' . ($histRow['last_name'] ?? '')),
            'checklist' => $checklist
        ];
    }
    $historyStmt->close();

    // Fetch project-study hierarchy
    $hierarchy = [];
    $hierarchyQuery = "SELECT project_name, study_name, project_order, study_order
                       FROM proposal_hierarchy
                       WHERE proposal_id = ?
                       ORDER BY project_order ASC, study_order ASC";
    $hierarchyStmt = $conn->prepare($hierarchyQuery);
    if ($hierarchyStmt) {
        $hierarchyStmt->bind_param("i", $proposalId);
        $hierarchyStmt->execute();
        $hierarchyResult = $hierarchyStmt->get_result();
        while ($hierRow = $hierarchyResult->fetch_assoc()) {
            $hierarchy[] = [
                'project_name' => $hierRow['project_name'],
                'study_name' => $hierRow['study_name'],
                'project_order' => (int)$hierRow['project_order'],
                'study_order' => (int)$hierRow['study_order']
            ];
        }
        $hierarchyStmt->close();
    }

    // -----------------------------------------------------
    // BUILD FINAL PROPOSAL OBJECT FOR FRONTEND
    // -----------------------------------------------------

    $proposal = [
        "id" => $row["proposal_id"],
        "proposal_id" => $row["proposal_id"],
        "title" => $row["program_title"],
        "description" => $row["program_description"],
        "nature" => $row["nature"],
        "cluster" => $row["research_cluster"],

        "leader" => $row["study_leader"],
        "studyLeader" => $row["study_leader"],
        "otherPersonnel" => $row["other_personnel"],

        "college" => $row["college_name"],
        "collegeId" => $row["college_id"],
        "collegeDean" => trim(($row["dean_first_name"] ?? "") . " " . ($row["dean_last_name"] ?? "")),
        "collegeResearchCoordinator" => trim(($row["crc_first_name"] ?? "") . " " . ($row["crc_last_name"] ?? "")),
        "department" => $row["department_name"],
        "departmentId" => $row["department_id"],

        "location" => $row["project_location"],
        "duration" => intval($row["duration_months"]),
        "durationMonths" => intval($row["duration_months"]),

        "estimatedBudget" => floatval($row["estimated_budget"]),
        "computedBudgetTotal" => floatval($row["computed_budget_total"]),
        "budgetTotal" => floatval($row["computed_budget_total"]),

        "rationale" => $row["rationale"],
        "objectives" => $row["objectives"],
        "literature" => $row["literature"],
        "methodology" => $row["methodology"],
        "expectedOutput" => $row["expected_output"],
        "impact" => $row["impact"],

        "workplan" => $workplan,
        "budget" => $budget,

        "files" => [
            "proposal" => $row["proposal_file"],
            "workplan" => $row["workplan_file"],
            "budget" => $row["budget_file"]
        ],

        "proposalFile" => $row["proposal_file"],
        "workplanFile" => $row["workplan_file"],
        "budgetFile" => $row["budget_file"],

        "status" => $row["status"],
        "dateSubmitted" => $row["created_at"],

        "submitter" => trim($row["first_name"] . " " . $row["last_name"]),
        "submitterEmail" => $row["email"],

        "hierarchy" => $hierarchy,
        "history" => $history
    ];

    echo json_encode([
        "status" => "success",
        "proposal" => $proposal
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit;
}
