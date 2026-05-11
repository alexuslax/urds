<?php
session_start();
require_once "db.php";

header('Content-Type: application/json');

// LOGGING
$logFile = __DIR__ . '/submit_log.txt';
function writeLog($msg) {
    global $logFile;
    file_put_contents($logFile, date("Y-m-d H:i:s") . " - $msg\n", FILE_APPEND);
}

writeLog("=== New submission attempt ===");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

try {

    $conn->begin_transaction();

    // Check if data is FormData or JSON
    $data = json_decode($_POST['data'], true);

// Validate
if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid data JSON."]);
    exit;
}

$program_title       = $data['program_title'];
$program_description = $data['program_description'];
$nature              = $data['nature'];
$research_cluster    = $data['research_cluster'];
$college_id          = $data['college_id'];
$department_id       = $data['department_id'];
$study_leader        = $data['study_leader'];
$other_personnel     = $data['other_personnel'];
$project_location    = $data['project_location'];
$duration_months     = $data['duration_months'];
$estimated_budget    = $data['estimated_budget'];
$rationale           = $data['rationale'];
$objectives          = $data['objectives'];
$literature          = $data['literature'];
$methodology         = $data['methodology'];
$expected_output     = $data['expected_output'];
$impact              = $data['impact'];

$workplan_json = $data['workplan'];     // already JSON string
$budget_json   = $data['budget'];       // already JSON string
$hierarchy_json = $data['hierarchy'] ?? '[]';

$computed_budget_total = $data['computed_budget_total'];

// Determine status - draft or for screening
$status = isset($data['status']) && $data['status'] === 'draft' ? 'draft' : 'for screening';
writeLog("Status determination: isset=" . (isset($data['status']) ? 'yes' : 'no') . ", value=" . ($data['status'] ?? 'null') . ", final status=$status");

// Save to DB
$stmt = $conn->prepare("
INSERT INTO researchproposals (
    program_title, program_description, nature, research_cluster,
    college_id, department_id, study_leader, other_personnel,
    project_location, duration_months, estimated_budget,
    rationale, objectives, literature, methodology, expected_output, impact,
    user_id, status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "ssssiisssidssssssis",
    $program_title, $program_description, $nature, $research_cluster,
    $college_id, $department_id, $study_leader, $other_personnel,
    $project_location, $duration_months, $estimated_budget,
    $rationale, $objectives, $literature, $methodology, $expected_output, $impact,
    $data['user_id'], $status
);

    
    $stmt->execute();

    $proposalId = $conn->insert_id;
    writeLog("Inserted proposal: $proposalId");

    // Handle file uploads
    $uploadDir = __DIR__ . '/../uploads/proposals/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $proposalFilePath = null;
    $workplanFilePath = null;
    $budgetFilePath = null;

    // Upload proposal file
    if (isset($_FILES['proposal_file']) && $_FILES['proposal_file']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['proposal_file']['name'], PATHINFO_EXTENSION);
        $proposalFileName = "proposal_" . $proposalId . "_" . time() . "." . $ext;
        $proposalFilePath = $uploadDir . $proposalFileName;
        
        if (move_uploaded_file($_FILES['proposal_file']['tmp_name'], $proposalFilePath)) {
            $proposalFilePath = "uploads/proposals/" . $proposalFileName;
            writeLog("Proposal file uploaded: $proposalFilePath");
        } else {
            $proposalFilePath = null;
        }
    }

    // Update proposal with file path
    if ($proposalFilePath) {
        $updateStmt = $conn->prepare("
            UPDATE researchproposals 
            SET proposal_file = ? 
            WHERE proposal_id = ?
        ");
        $updateStmt->bind_param("si", $proposalFilePath, $proposalId);
        $updateStmt->execute();
        $updateStmt->close();
        writeLog("File path updated in database");
    }

    // Insert workplan items into workplan_items table
    $workplanData = json_decode($workplan_json, true);
    if ($workplanData && is_array($workplanData)) {
        $wpStmt = $conn->prepare("INSERT INTO workplan_items (proposal_id, activity, y1_q1, y1_q2, y1_q3, y1_q4, y2_q1, y2_q2, y2_q3, y2_q4, y3_q1, y3_q2, y3_q3, y3_q4) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($workplanData as $item) {
            $activity = $item['activity'] ?? $item['task'] ?? '';
            if (trim($activity) === '') continue; // Skip empty activities
            
            $y1q1 = isset($item['y1_q1']) ? (int)$item['y1_q1'] : 0;
            $y1q2 = isset($item['y1_q2']) ? (int)$item['y1_q2'] : 0;
            $y1q3 = isset($item['y1_q3']) ? (int)$item['y1_q3'] : 0;
            $y1q4 = isset($item['y1_q4']) ? (int)$item['y1_q4'] : 0;
            
            $y2q1 = isset($item['y2_q1']) ? (int)$item['y2_q1'] : 0;
            $y2q2 = isset($item['y2_q2']) ? (int)$item['y2_q2'] : 0;
            $y2q3 = isset($item['y2_q3']) ? (int)$item['y2_q3'] : 0;
            $y2q4 = isset($item['y2_q4']) ? (int)$item['y2_q4'] : 0;
            
            $y3q1 = isset($item['y3_q1']) ? (int)$item['y3_q1'] : 0;
            $y3q2 = isset($item['y3_q2']) ? (int)$item['y3_q2'] : 0;
            $y3q3 = isset($item['y3_q3']) ? (int)$item['y3_q3'] : 0;
            $y3q4 = isset($item['y3_q4']) ? (int)$item['y3_q4'] : 0;
            
            $wpStmt->bind_param("isiiiiiiiiiiii", $proposalId, $activity, $y1q1, $y1q2, $y1q3, $y1q4, $y2q1, $y2q2, $y2q3, $y2q4, $y3q1, $y3q2, $y3q3, $y3q4);
            $wpStmt->execute();
        }
        $wpStmt->close();
        writeLog("Inserted " . count($workplanData) . " workplan items");
    }

    // Insert budget items into separate tables
    $budgetData = json_decode($budget_json, true);
    if ($budgetData && is_array($budgetData)) {
        
        // Insert Personal Services (with quarterly and yearly breakdown)
        if (isset($budgetData['personalServices']) && is_array($budgetData['personalServices'])) {
            $psStmt = $conn->prepare("INSERT INTO proposal_ps (proposal_id, item, q1, q2, q3, q4, year1, year2, year3, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($budgetData['personalServices'] as $item) {
                $description = $item['item'] ?? '';
                $q1 = $item['q1'] ?? 0;
                $q2 = $item['q2'] ?? 0;
                $q3 = $item['q3'] ?? 0;
                $q4 = $item['q4'] ?? 0;
                $year1 = $item['year1'] ?? 0;
                $year2 = $item['year2'] ?? 0;
                $year3 = $item['year3'] ?? 0;
                $total = $item['total'] ?? 0;
                $psStmt->bind_param("isdddddddd", $proposalId, $description, $q1, $q2, $q3, $q4, $year1, $year2, $year3, $total);
                $psStmt->execute();
            }
            $psStmt->close();
            writeLog("Inserted " . count($budgetData['personalServices']) . " PS items");
        }

        // Insert MOOE (Travel, Supplies, Communications with detailed fields)
        if (isset($budgetData['mooe']) && is_array($budgetData['mooe'])) {
            $mooeStmt = $conn->prepare("INSERT INTO proposal_mooe (proposal_id, type, date_field, places, purpose, mode_of_transport, unit, description, qty, unit_cost, year1, year2, year3, estimated_cost, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($budgetData['mooe'] as $item) {
                $type = $item['type'] ?? 'Other';
                $date_field = $item['date_field'] ?? '';
                $places = $item['places'] ?? '';
                $purpose = $item['purpose'] ?? '';
                $mode_of_transport = $item['mode_of_transport'] ?? '';
                $unit = $item['unit'] ?? '';
                $description = $item['description'] ?? '';
                $qty = $item['qty'] ?? 0;
                $unit_cost = $item['unit_cost'] ?? 0;
                $year1 = $item['year1'] ?? 0;
                $year2 = $item['year2'] ?? 0;
                $year3 = $item['year3'] ?? 0;
                $estimated_cost = $item['estimated_cost'] ?? 0;
                $total = $item['total'] ?? 0;
                $mooeStmt->bind_param("isssssssddddddd", $proposalId, $type, $date_field, $places, $purpose, $mode_of_transport, $unit, $description, $qty, $unit_cost, $year1, $year2, $year3, $estimated_cost, $total);
                $mooeStmt->execute();
            }
            $mooeStmt->close();
            writeLog("Inserted " . count($budgetData['mooe']) . " MOOE items");
        }

        // Insert Equipment (with detailed fields and yearly breakdown)
        if (isset($budgetData['equipment']) && is_array($budgetData['equipment'])) {
            $eqStmt = $conn->prepare("INSERT INTO proposal_equipment (proposal_id, date_field, unit, item_description, purpose, qty, year1, year2, year3, estimated_cost, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($budgetData['equipment'] as $item) {
                $date_field = $item['date_field'] ?? '';
                $unit = $item['unit'] ?? '';
                $description = $item['description'] ?? '';
                $purpose = $item['purpose'] ?? '';
                $qty = $item['qty'] ?? 0;
                $year1 = $item['year1'] ?? 0;
                $year2 = $item['year2'] ?? 0;
                $year3 = $item['year3'] ?? 0;
                $estimated_cost = $item['estimated_cost'] ?? 0;
                $total = $item['total'] ?? 0;
                $eqStmt->bind_param("issssdddddd", $proposalId, $date_field, $unit, $description, $purpose, $qty, $year1, $year2, $year3, $estimated_cost, $total);
                $eqStmt->execute();
            }
            $eqStmt->close();
            writeLog("Inserted " . count($budgetData['equipment']) . " Equipment items");
        }
    }

    // Insert project-study hierarchy rows
    $hierarchyData = json_decode($hierarchy_json, true);
    if ($hierarchyData && is_array($hierarchyData)) {
        $hierStmt = $conn->prepare("INSERT INTO proposal_hierarchy (proposal_id, project_name, study_name, project_order, study_order) VALUES (?, ?, ?, ?, ?)");
        foreach ($hierarchyData as $node) {
            $projectName = trim((string)($node['project_name'] ?? ''));
            $studyName = trim((string)($node['study_name'] ?? ''));
            $projectOrder = isset($node['project_order']) ? (int)$node['project_order'] : 1;
            $studyOrder = isset($node['study_order']) ? (int)$node['study_order'] : 1;

            if ($studyName === '') {
                continue;
            }

            if ($projectName === '') {
                $projectName = null;
            }

            $hierStmt->bind_param("issii", $proposalId, $projectName, $studyName, $projectOrder, $studyOrder);
            $hierStmt->execute();
        }
        $hierStmt->close();
        writeLog("Inserted hierarchy rows: " . count($hierarchyData));
    }

    // COMMIT TRANSACTION
    $conn->commit();
    writeLog("Transaction committed");

    echo json_encode(["status" => "success", "proposal_id" => $proposalId]);

} catch (Exception $e) {

    writeLog("ERROR: " . $e->getMessage());
    if ($conn) {
        $conn->rollback();
        writeLog("Transaction rolled back");
    }

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
