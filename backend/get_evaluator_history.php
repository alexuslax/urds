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
        echo json_encode(["status" => "error", "message" => "User not logged in", "history" => []]);
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
        echo json_encode(["status" => "success", "history" => []]);
        exit;
    }

    $evaluatorId = (int) $evaluator["evaluator_id"];

    $stmt = $conn->prepare("
        SELECT
            pe.evaluation_id,
            pe.proposal_id,
            pe.review_id,
            pe.numerical_rating,
            pe.comments,
            pe.recommendation,
            pe.evaluation_date,
            pe.created_at AS submitted_at,
            rp.program_title,
            rp.study_leader,
            rp.research_cluster,
            c.college_name,
            d.department_name,
            ir.review_type
        FROM proposalevaluations pe
        INNER JOIN researchproposals rp ON rp.proposal_id = pe.proposal_id
        LEFT JOIN inhousereviews ir ON ir.review_id = pe.review_id
        LEFT JOIN colleges c ON c.college_id = rp.college_id
        LEFT JOIN departments d ON d.department_id = rp.department_id
        WHERE pe.evaluator_id = ?
        ORDER BY COALESCE(pe.evaluation_date, pe.created_at) DESC
    ");
    $stmt->bind_param("i", $evaluatorId);
    $stmt->execute();
    $result = $stmt->get_result();

    $history = [];
    while ($row = $result->fetch_assoc()) {
        $history[] = [
            "id" => $row["evaluation_id"],
            "evaluation_id" => $row["evaluation_id"],
            "proposal_id" => $row["proposal_id"],
            "review_id" => $row["review_id"],
            "title" => $row["program_title"],
            "proponent" => $row["study_leader"],
            "college" => $row["college_name"],
            "department" => $row["department_name"],
            "category" => category_from_review($row["review_type"], $row["research_cluster"]),
            "score" => $row["numerical_rating"],
            "recommendation" => readable_recommendation($row["recommendation"]),
            "recommendation_type" => recommendation_type($row["recommendation"]),
            "submitted_at" => $row["evaluation_date"] ?: $row["submitted_at"],
            "remarks" => $row["comments"],
        ];
    }
    $stmt->close();

    echo json_encode(["status" => "success", "history" => $history]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage(), "history" => []]);
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

function readable_recommendation($value) {
    $text = strtolower((string) $value);

    if ($text === "approve_funding") return "Approve Funding";
    if ($text === "continue") return "Project/study for continuation";
    if ($text === "terminate") return "Project/study for termination";
    if ($text === "award_prize") return "Award Prize";

    return $value ?: "Submitted evaluation";
}

function recommendation_type($value) {
    $text = strtolower((string) $value);

    if (str_contains($text, "terminate")) return "termination";
    if (str_contains($text, "continue") || str_contains($text, "approve")) return "approved";
    if (str_contains($text, "award")) return "presentation";

    return "approved";
}
