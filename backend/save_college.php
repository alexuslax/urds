<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

// Authentication check
// Temporarily disabled for testing - TODO: Re-enable in production
// if (!isset($_SESSION['user_id'])) {
//     echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
//     exit;
// }

require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';
$college_id = $data['college_id'] ?? null;
$college_name = $data['college_name'] ?? '';
$college_code = $data['college_code'] ?? '';
$dean_id = $data['dean_id'] ?? null;
$departments = $data['departments'] ?? []; // Array of department names

try {
    $conn->begin_transaction();

    if ($action === 'add') {
        // Insert new college
        $stmt = $conn->prepare("INSERT INTO colleges (college_name, college_code, college_logo, college_dean, campus, is_active) VALUES (?, ?, ?, ?, 'MAIN', 1)");
        $logo_url = $data['college_logo'] ?? null;
        $dean_name = $data['dean_name'] ?? null;
        $stmt->bind_param("ssss", $college_name, $college_code, $logo_url, $dean_name);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to insert college: " . $stmt->error);
        }
        
        $college_id = $conn->insert_id;
        
        // Insert departments
        if (!empty($departments)) {
            $dept_stmt = $conn->prepare("INSERT INTO departments (department_name, department_code, college_id, is_active) VALUES (?, ?, ?, 1)");
            foreach ($departments as $dept) {
                $dept_name = trim(is_array($dept) ? $dept['name'] : $dept);
                $dept_code = is_array($dept) && isset($dept['code']) ? $dept['code'] : strtoupper(substr($dept_name, 0, 4));
                if (!empty($dept_name)) {
                    $dept_stmt->bind_param("ssi", $dept_name, $dept_code, $college_id);
                    if (!$dept_stmt->execute()) {
                        throw new Exception("Failed to insert department: " . $dept_stmt->error);
                    }
                }
            }
            $dept_stmt->close();
        }
        
        $stmt->close();
        
    } elseif ($action === 'edit') {
        // Update college
        $logo_url = $data['college_logo'] ?? null;
        $dean_name = $data['dean_name'] ?? null;
        $stmt = $conn->prepare("UPDATE colleges SET college_name = ?, college_code = ?, college_logo = ?, college_dean = ? WHERE college_id = ?");
        $stmt->bind_param("ssssi", $college_name, $college_code, $logo_url, $dean_name, $college_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update college: " . $stmt->error);
        }
        $stmt->close();
        
        // Delete existing departments and re-insert
        $del_stmt = $conn->prepare("DELETE FROM departments WHERE college_id = ?");
        $del_stmt->bind_param("i", $college_id);
        if (!$del_stmt->execute()) {
            throw new Exception("Failed to delete old departments: " . $del_stmt->error);
        }
        $del_stmt->close();
        
        // Insert new departments
        if (!empty($departments)) {
            $dept_stmt = $conn->prepare("INSERT INTO departments (department_name, department_code, college_id, is_active) VALUES (?, ?, ?, 1)");
            foreach ($departments as $dept) {
                $dept_name = trim(is_array($dept) ? $dept['name'] : $dept);
                $dept_code = is_array($dept) && isset($dept['code']) ? $dept['code'] : strtoupper(substr($dept_name, 0, 4));
                if (!empty($dept_name)) {
                    $dept_stmt->bind_param("ssi", $dept_name, $dept_code, $college_id);
                    if (!$dept_stmt->execute()) {
                        throw new Exception("Failed to insert department: " . $dept_stmt->error);
                    }
                }
            }
            $dept_stmt->close();
        }
        
    } elseif ($action === 'delete') {
        // Delete departments first (foreign key constraint)
        $del_dept_stmt = $conn->prepare("DELETE FROM departments WHERE college_id = ?");
        $del_dept_stmt->bind_param("i", $college_id);
        if (!$del_dept_stmt->execute()) {
            throw new Exception("Failed to delete departments: " . $del_dept_stmt->error);
        }
        $del_dept_stmt->close();
        
        // Delete college
        $del_stmt = $conn->prepare("DELETE FROM colleges WHERE college_id = ?");
        $del_stmt->bind_param("i", $college_id);
        if (!$del_stmt->execute()) {
            throw new Exception("Failed to delete college: " . $del_stmt->error);
        }
        $del_stmt->close();
        
    } else {
        throw new Exception("Invalid action: $action");
    }
    
    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Operation completed successfully', 'college_id' => $college_id]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
