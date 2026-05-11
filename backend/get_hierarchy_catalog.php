<?php
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
    $userId = $_SESSION["user_id"] ?? null;

    if (!$userId) {
        echo json_encode(["status" => "error", "message" => "User not logged in"]);
        exit;
    }

    // Primary source: explicit hierarchy rows previously saved with submissions.
    $hierQuery = "
        SELECT
            ph.project_name,
            ph.study_name,
            ph.project_order,
            ph.study_order
        FROM proposal_hierarchy ph
        INNER JOIN researchproposals rp ON rp.proposal_id = ph.proposal_id
        WHERE rp.user_id = ?
          AND ph.project_name IS NOT NULL
          AND TRIM(ph.project_name) <> ''
          AND ph.study_name IS NOT NULL
          AND TRIM(ph.study_name) <> ''
        ORDER BY ph.project_order ASC, ph.study_order ASC, ph.project_name ASC, ph.study_name ASC
    ";

    $hierStmt = $conn->prepare($hierQuery);
    $hierStmt->bind_param("i", $userId);
    $hierStmt->execute();
    $hierResult = $hierStmt->get_result();

    $projectMap = [];

    while ($row = $hierResult->fetch_assoc()) {
        $projectName = trim((string)($row['project_name'] ?? ''));
        $studyName = trim((string)($row['study_name'] ?? ''));

        if ($projectName === '' || $studyName === '') {
            continue;
        }

        if (!array_key_exists($projectName, $projectMap)) {
            $projectMap[$projectName] = [];
        }

        if (!in_array($studyName, $projectMap[$projectName], true)) {
            $projectMap[$projectName][] = $studyName;
        }
    }

    $projects = [];

    if (!empty($projectMap)) {
        foreach ($projectMap as $projectName => $studies) {
            $projects[] = [
                'project_name' => $projectName,
                'studies' => $studies
            ];
        }
    } else {
        // Fallback for older records without proposal_hierarchy rows.
        $query = "
            SELECT
                proposal_id,
                program_title,
                nature,
                created_at
            FROM researchproposals
            WHERE user_id = ?
              AND program_title IS NOT NULL
              AND program_title <> ''
            ORDER BY created_at DESC, proposal_id DESC
        ";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $projectTitles = [];
        $studyTitles = [];

        while ($row = $result->fetch_assoc()) {
            $title = trim((string)($row['program_title'] ?? ''));
            $nature = trim((string)($row['nature'] ?? ''));

            if ($title === '') {
                continue;
            }

            if (strcasecmp($nature, 'Study') === 0) {
                if (!in_array($title, $studyTitles, true)) {
                    $studyTitles[] = $title;
                }
                continue;
            }

            if (strcasecmp($nature, 'Project') === 0 || strcasecmp($nature, 'Program') === 0) {
                if (!in_array($title, $projectTitles, true)) {
                    $projectTitles[] = $title;
                }
            }
        }

        if (!empty($projectTitles)) {
            foreach ($projectTitles as $projectTitle) {
                $projects[] = [
                    'project_name' => $projectTitle,
                    'studies' => !empty($studyTitles) ? $studyTitles : [$projectTitle]
                ];
            }
        } elseif (!empty($studyTitles)) {
            $projects[] = [
                'project_name' => 'Independent Studies',
                'studies' => $studyTitles
            ];
        }
    }

    echo json_encode([
        "status" => "success",
        "projects" => $projects
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
