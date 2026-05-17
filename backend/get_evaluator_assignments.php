<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();

try {
    require_once __DIR__ . "/db.php";
} catch (Throwable $e) {
    ob_clean();
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

try {
    $userId = $_SESSION["user_id"] ?? null;

    if (!$userId) {
        echo json_encode(["status" => "error", "message" => "User not logged in", "assignments" => []]);
        exit;
    }

    $evaluatorStmt = $conn->prepare("
        SELECT evaluator_id
        FROM evaluators
        WHERE user_id = ? AND is_active = 1
        LIMIT 1
    ");
    $evaluatorStmt->bind_param("i", $userId);
    $evaluatorStmt->execute();
    $evaluatorResult = $evaluatorStmt->get_result();
    $evaluator = $evaluatorResult->fetch_assoc();
    $evaluatorStmt->close();

    if (!$evaluator) {
        echo json_encode(["status" => "success", "assignments" => []]);
        exit;
    }

    $evaluatorId = (int) $evaluator["evaluator_id"];

    $stmt = $conn->prepare("
        SELECT
            rp.proposal_id,
            rp.program_title,
            rp.study_leader,
            rp.research_cluster,
            rp.status AS proposal_status,
            rp.created_at AS proposal_created_at,
            c.college_name,
            d.department_name,
            ir.review_id,
            ir.review_type,
            ir.review_date,
            ir.created_at AS assigned_at,
            pe.evaluation_id,
            pe.numerical_rating,
            pe.recommendation,
            pe.comments,
            pe.evaluation_date,
            pe.created_at AS evaluation_created_at
        FROM reviewpanels panel
        INNER JOIN inhousereviews ir ON ir.review_id = panel.review_id
        INNER JOIN researchproposals rp ON rp.proposal_id = ir.proposal_id
        LEFT JOIN colleges c ON c.college_id = rp.college_id
        LEFT JOIN departments d ON d.department_id = rp.department_id
        LEFT JOIN proposalevaluations pe
            ON pe.proposal_id = rp.proposal_id
            AND pe.evaluator_id = panel.evaluator_id
            AND (pe.review_id = ir.review_id OR pe.review_id IS NULL)
        WHERE panel.evaluator_id = ?
        ORDER BY COALESCE(ir.review_date, ir.created_at) DESC, rp.created_at DESC
    ");
    $stmt->bind_param("i", $evaluatorId);
    $stmt->execute();
    $result = $stmt->get_result();

    $assignments = [];
    while ($row = $result->fetch_assoc()) {
        $assignments[] = [
            "id" => $row["proposal_id"],
            "proposal_id" => $row["proposal_id"],
            "review_id" => $row["review_id"],
            "title" => $row["program_title"],
            "proponent" => $row["study_leader"],
            "college" => $row["college_name"],
            "department" => $row["department_name"],
            "category" => category_from_review($row["review_type"], $row["research_cluster"]),
            "status" => $row["evaluation_id"] ? "submitted" : "pending",
            "assigned_at" => $row["assigned_at"],
            "deadline" => $row["review_date"],
            "evaluation_id" => $row["evaluation_id"],
            "score" => $row["numerical_rating"],
            "recommendation" => $row["recommendation"],
            "comments" => $row["comments"],
            "evaluation_date" => $row["evaluation_date"] ?: $row["evaluation_created_at"],
            "proposal_status" => $row["proposal_status"],
        ];
    }
    $stmt->close();

    echo json_encode(["status" => "success", "assignments" => $assignments]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage(), "assignments" => []]);
}

function category_from_review($reviewType, $cluster) {
    $review = strtolower((string) $reviewType);
    $clusterText = strtolower((string) $cluster);
    $isSocial = str_contains($clusterText, "social") || str_contains($clusterText, "human");

    if (str_contains($review, "completed")) {
        return $isSocial ? "completed_social_sciences" : "completed_natural_sciences";
    }

    if (str_contains($review, "ongoing")) {
        return $isSocial ? "ongoing_social_sciences" : "ongoing_natural_sciences";
    }

    return "new_proposal";
}
