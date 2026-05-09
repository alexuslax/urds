<?php
// Prevent any output before headers
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

session_start();
require_once "db.php";

// Clear any output that might have occurred
ob_clean();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Get user_id from session
    $userId = $_SESSION["user_id"] ?? null;

    if (!$userId) {
        echo json_encode(["status" => "error", "message" => "User not logged in"]);
        exit;
    }

    // Get POST data
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        echo json_encode(["status" => "error", "message" => "Invalid input"]);
        exit;
    }

    $firstName = $input["firstName"] ?? null;
    $lastName = $input["lastName"] ?? null;
    $email = $input["email"] ?? null;
    $campus = $input["campus"] ?? null;

    // Validate required fields
    if (!$firstName || !$lastName || !$email) {
        echo json_encode(["status" => "error", "message" => "First name, last name, and email are required"]);
        exit;
    }

    // Check if email is already taken by another user
    $checkStmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
    $checkStmt->bind_param("si", $email, $userId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Email is already in use by another user"]);
        exit;
    }

    // Update user profile
    $query = "
        UPDATE users 
        SET first_name = ?, 
            last_name = ?, 
            email = ?,
            campus = ?
        WHERE user_id = ?
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssssi", $firstName, $lastName, $email, $campus, $userId);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Profile updated successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update profile"
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit;
}
