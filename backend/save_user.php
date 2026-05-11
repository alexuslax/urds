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

// Authentication check - temporarily disabled for testing
// if (!isset($_SESSION['user_id'])) {
//     echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
//     exit;
// }

require 'db.php';

// Check if request is FormData (file upload) or JSON
$isFormData = !empty($_POST) || !empty($_FILES);

if ($isFormData) {
    $data = $_POST;
    $action = $_POST['action'] ?? '';
} else {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
}

try {
    $conn->begin_transaction();

    if ($action === 'add') {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $email = $data['email'] ?? '';
        $first_name = $data['firstName'] ?? $data['first_name'] ?? '';
        $last_name = $data['lastName'] ?? $data['last_name'] ?? '';
        $role = $data['role'] ?? 'Faculty Researcher';
        $college_id = $data['college_id'] ?? null;
        $department_id = $data['department_id'] ?? null;
        $campus = $data['campus'] ?? 'MAIN';
        $contact_no = $data['contactNo'] ?? $data['contact_no'] ?? '';
        $position = $data['position'] ?? '';
        $employee_id = $data['employeeId'] ?? $data['employee_id'] ?? '';
        
        if (empty($username) || empty($password) || empty($email)) {
            throw new Exception("Username, password, and email are required");
        }
        
        // Handle profile picture upload
        $profile_picture_path = null;
        if (isset($_FILES['profilePicture']) && $_FILES['profilePicture']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../uploads/profile_pictures/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            $file_extension = pathinfo($_FILES['profilePicture']['name'], PATHINFO_EXTENSION);
            $file_name = 'profile_' . time() . '_' . uniqid() . '.' . $file_extension;
            $target_path = $upload_dir . $file_name;
            
            if (move_uploaded_file($_FILES['profilePicture']['tmp_name'], $target_path)) {
                $profile_picture_path = 'uploads/profile_pictures/' . $file_name;
            }
        }
        
        // Hash password
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Set approval status based on role
        $approval_status = ($role === 'Faculty Researcher') ? 'approved' : 'pending';
        
        $stmt = $conn->prepare("
            INSERT INTO users (username, password_hash, email, first_name, last_name, role, college_id, department_id, campus, contact_no, position, employee_id, profile_picture_path, approval_status, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->bind_param("sssssssissssss", $username, $password_hash, $email, $first_name, $last_name, $role, $college_id, $department_id, $campus, $contact_no, $position, $employee_id, $profile_picture_path, $approval_status);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to insert user: " . $stmt->error);
        }
        
        $user_id = $conn->insert_id;
        $stmt->close();
        
    } elseif ($action === 'edit') {
        $user_id = $data['user_id'] ?? null;
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $first_name = $data['first_name'] ?? '';
        $last_name = $data['last_name'] ?? '';
        $role = $data['role'] ?? 'Faculty Researcher';
        $college_id = $data['college_id'] ?? null;
        $department_id = $data['department_id'] ?? null;
        $campus = $data['campus'] ?? 'MAIN';
        
        if (empty($user_id) || empty($username) || empty($email)) {
            throw new Exception("User ID, username, and email are required");
        }
        
        // Update without password if not provided
        if (!empty($data['password'])) {
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $conn->prepare("
    UPDATE users 
    SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?, college_id = ?, department_id = ?, campus = ?
    WHERE user_id = ?
");
$stmt->bind_param("sssssiisii", $username, $password_hash, $email, $first_name, $last_name, $role, $college_id, $department_id, $campus, $user_id);


        } else {
            $stmt = $conn->prepare("
                UPDATE users 
                SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?, college_id = ?, department_id = ?, campus = ?
                WHERE user_id = ?
            ");
            $stmt->bind_param("sssssissi", $username, $email, $first_name, $last_name, $role, $college_id, $department_id, $campus, $user_id);
        }
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update user: " . $stmt->error);
        }
        $stmt->close();
        
    } elseif ($action === 'delete') {
        $user_id = $data['user_id'] ?? null;
        
        if (empty($user_id)) {
            throw new Exception("User ID is required");
        }
        
        // Soft delete (set is_active = 0) or hard delete
        $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to delete user: " . $stmt->error);
        }
        $stmt->close();
        
    } else {
        throw new Exception("Invalid action: $action");
    }
    
    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Operation completed successfully']);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
