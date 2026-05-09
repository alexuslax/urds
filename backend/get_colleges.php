<?php
header('Content-Type: application/json');
require_once "db.php";

try {
    // Get all colleges with their departments
    $stmt = $conn->prepare("
        SELECT 
            c.college_id,
            c.college_code,
            c.college_name,
            c.college_logo,
            c.college_dean as dean_name
        FROM colleges c
        ORDER BY c.college_name
    ");
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $colleges = [];
    
    while ($college = $result->fetch_assoc()) {
        $collegeId = $college['college_id'];
        
        // Get departments for this college
        $deptStmt = $conn->prepare("
            SELECT department_id, department_name, department_code
            FROM departments
            WHERE college_id = ?
            ORDER BY department_name
        ");
        $deptStmt->bind_param("i", $collegeId);
        $deptStmt->execute();
        $deptResult = $deptStmt->get_result();
        
        $departments = [];
        while ($dept = $deptResult->fetch_assoc()) {
            $departments[] = $dept;
        }
        
        $college['departments'] = $departments;
        $colleges[] = $college;
    }
    
    echo json_encode([
        "status" => "success",
        "colleges" => $colleges
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
