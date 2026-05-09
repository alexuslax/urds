<?php
header('Content-Type: application/json');
require_once "db.php";

try {
    // Get only approved users with college and department names
    $sql = "SELECT 
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
            u.approval_status,
            c.college_name,
            d.department_name
        FROM users u
        LEFT JOIN colleges c ON u.college_id = c.college_id
        LEFT JOIN departments d ON u.department_id = d.department_id
        WHERE u.approval_status = 'approved'
        ORDER BY u.user_id DESC";

    $stmt = $conn->prepare($sql);
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $users = [];
    while ($user = $result->fetch_assoc()) {
        $users[] = $user;
    }
    
    echo json_encode([
        "status" => "success",
        "users" => $users
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
