<?php
require 'db.php';

$action = $_POST['action'] ?? 'create'; // default action
$id = $_POST['id'] ?? 0;
$title = $_POST['title'] ?? '';
$content = $_POST['content'] ?? '';
$published_by = $_POST['user_id'] ?? 0;
$file_path = null;

header('Content-Type: application/json');

// Handle file upload
if(isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = '../uploads/announcements/';
    if(!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $file_name = time() . '_' . basename($_FILES['file']['name']);
    $target_path = $upload_dir . $file_name;
    
    if(move_uploaded_file($_FILES['file']['tmp_name'], $target_path)) {
        $file_path = 'uploads/announcements/' . $file_name;
    }
}

if($action === 'create'){
    if($title && $content && $published_by){
        $stmt = $conn->prepare("INSERT INTO announcements (title, content, published_by, file_path, status) VALUES (?, ?, ?, ?, 'active')");
        $stmt->bind_param("ssis", $title, $content, $published_by, $file_path);
        if($stmt->execute()){
            echo json_encode(['status'=>'success','message'=>'Announcement published']);
        } else {
            echo json_encode(['status'=>'error','message'=>'Failed to publish']);
        }
    } else {
        echo json_encode(['status'=>'error','message'=>'Missing data']);
    }

} elseif($action === 'edit'){
    if($id && $title && $content){
        if($file_path) {
            $stmt = $conn->prepare("UPDATE announcements SET title=?, content=?, file_path=? WHERE id=?");
            $stmt->bind_param("sssi", $title, $content, $file_path, $id);
        } else {
            $stmt = $conn->prepare("UPDATE announcements SET title=?, content=? WHERE id=?");
            $stmt->bind_param("ssi", $title, $content, $id);
        }
        if($stmt->execute()){
            echo json_encode(['status'=>'success','message'=>'Announcement updated']);
        } else {
            echo json_encode(['status'=>'error','message'=>'Failed to update']);
        }
    } else {
        echo json_encode(['status'=>'error','message'=>'Missing data']);
    }

} elseif($action === 'delete'){
    if($id){
        $stmt = $conn->prepare("DELETE FROM announcements WHERE id=?");
        $stmt->bind_param("i", $id);
        if($stmt->execute()){
            echo json_encode(['status'=>'success','message'=>'Announcement deleted']);
        } else {
            echo json_encode(['status'=>'error','message'=>'Failed to delete']);
        }
    } else {
        echo json_encode(['status'=>'error','message'=>'Missing announcement ID']);
    }

} else {
    echo json_encode(['status'=>'error','message'=>'Invalid action']);
}
?>
