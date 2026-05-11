<?php
header("Content-Type: application/json");

$target = __DIR__ . "/../../backend/login.php";

echo json_encode([
    "backend_login_exists" => file_exists($target),
    "backend_login_path" => $target,
    "request_uri" => $_SERVER["REQUEST_URI"] ?? "",
    "document_root" => $_SERVER["DOCUMENT_ROOT"] ?? ""
]);
