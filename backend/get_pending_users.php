<?php
require "db.php";
header("Content-Type: application/json");

$sql = "
  SELECT u.*, c.college_name, d.department_name
  FROM users u
  LEFT JOIN colleges c ON u.college_id = c.college_id
  LEFT JOIN departments d ON u.department_id = d.department_id
  WHERE u.approval_status = 'pending'
  ORDER BY u.created_at DESC
";

$result = $conn->query($sql);

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    "status" => "success",
    "users" => $users
]);
