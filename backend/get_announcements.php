<?php
require 'db.php';

$stmt = $conn->prepare("SELECT a.id, a.title, a.content, a.file_path, a.published_at, u.username AS published_by 
                        FROM announcements a
                        JOIN users u ON a.published_by = u.user_id
                        WHERE a.status='active'
                        ORDER BY a.published_at DESC");
$stmt->execute();
$result = $stmt->get_result();

$announcements = [];
while($row = $result->fetch_assoc()){
    $announcements[] = $row;
}

echo json_encode($announcements);
?>
