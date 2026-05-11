<?php
require "db.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$action = $data["action"] ?? "";
$user_id = $data["user_id"] ?? 0;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Invalid user ID"]);
    exit;
}

if ($action === "approve") {
    $status = "approved";
} elseif ($action === "reject") {
    $status = "rejected";
} elseif ($action === "restore") {
    $status = "pending";
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET approval_status=? WHERE user_id=?");
$stmt->bind_param("si", $status, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
