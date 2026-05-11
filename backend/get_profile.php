<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();
require_once "db.php";

ob_clean();

// IMPORTANT FIX — allow credentials
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");
// Allow origin dynamically to support different localhost origins/ports when using credentials
$origin = $_SERVER['HTTP_ORIGIN'] ?? null;
if ($origin) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: http://localhost");
}
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");

// Get user from session or GET parameter
$userId = $_SESSION["user_id"] ?? $_GET["userId"] ?? null;

// Use is_null to properly check for null (allows 0 as valid userId)
if (is_null($userId) || $userId === "") {
    echo json_encode([
        "status" => "error",
        "message" => "User not logged in",
        "debug" => [
            "session" => $_SESSION,
            "session_id" => session_id()
        ]
    ]);
    exit;
}

// Pull user with joins
$sql = "
    SELECT 
        u.user_id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.college_id,
        u.department_id,
        u.campus,
        u.is_active,
        c.college_name,
        d.department_name
    FROM users u
    LEFT JOIN colleges c ON u.college_id = c.college_id
    LEFT JOIN departments d ON u.department_id = d.department_id
    WHERE u.user_id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {

    echo json_encode([
        "status" => "success",
        "user" => [
            "userId" => $user["user_id"],
            "username" => $user["username"],
            "email" => $user["email"],
            "firstName" => $user["first_name"],
            "lastName" => $user["last_name"],
            "fullName" => $user["first_name"] . " " . $user["last_name"],
            "role" => $user["role"],
            "collegeId" => $user["college_id"],
            "collegeName" => $user["college_name"],
            "departmentId" => $user["department_id"],
            "departmentName" => $user["department_name"],
            "campus" => $user["campus"],
            "isActive" => $user["is_active"]
        ]
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
}
?>
