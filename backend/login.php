<?php
session_start();
header("Content-Type: application/json");

try {
    require_once "db.php";
} catch (Throwable $e) {
    error_log("Login database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

$username = trim($_POST['username'] ?? "");
$password = trim($_POST['password'] ?? "");

if ($username === "" || $password === "") {
    echo json_encode(["status"=>"error","message"=>"Username and password are required"]);
    exit;
}

// Fetch user (active only)
$sql = "SELECT * FROM users WHERE username = ? AND is_active = 1 LIMIT 1";
try {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception($conn->error);
    }
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
} catch (Throwable $e) {
    error_log("Login query failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Login query failed"]);
    exit;
}

if ($result->num_rows !== 1) {
    echo json_encode(["status"=>"error","message"=>"User not found or inactive"]);
    exit;
}

$user = $result->fetch_assoc();

// Check approval
if ($user["approval_status"] !== "approved") {
    $status = $user["approval_status"];
    $messages = [
        "pending" => "Your account is pending approval. Please wait for admin review.",
        "rejected" => "Your account has been rejected. Contact the administrator."
    ];
    echo json_encode(["status"=>"error","message"=>$messages[$status] ?? "Your account is not approved."]);
    exit;
}

// Verify password
if (!password_verify($password, $user["password_hash"])) {
    echo json_encode(["status"=>"error","message"=>"Invalid password"]);
    exit;
}

// Set session values
$_SESSION["user_id"] = $user["user_id"];
$_SESSION["username"] = $user["username"];
$_SESSION["role"] = $user["role"];
$_SESSION["full_name"] = $user["first_name"] . " " . $user["last_name"];
$_SESSION["email"] = $user["email"];
$_SESSION["college_id"] = $user["college_id"] ?? null;
$_SESSION["department_id"] = $user["department_id"] ?? null;

// Role-based redirect
$role = strtolower($user["role"]);
$redirect = "dashboard.html";
if ($role === "administrator" || $role === "sysadmin") {
    $redirect = "admin-dashboard.html";
}

// Success response
echo json_encode([
    "status" => "success",
    "redirect" => $redirect,
    "userId" => $user["user_id"],
    "userName" => $_SESSION["full_name"],
    "role" => $user["role"],
    "email" => $user["email"],
    "college_id" => $user["college_id"] ?? "",
    "department_id" => $user["department_id"] ?? ""
]);

exit;
?>
