<?php
header('Content-Type: application/json');
session_start();

require_once "db.php";

try {

    // ===================================
    // BASIC COUNTS
    // ===================================
    $stats = [];

    // Count users
    $result = $conn->query("SELECT COUNT(*) as count FROM users");
    $stats['users'] = $result->fetch_assoc()['count'];

    // Count colleges
    $result = $conn->query("SELECT COUNT(*) as count FROM colleges");
    $stats['colleges'] = $result->fetch_assoc()['count'];

    // Count proposals
    $result = $conn->query("SELECT COUNT(*) as count FROM researchproposals");
    $stats['proposals'] = $result->fetch_assoc()['count'];



    // ===================================
    // 📊 PROPOSALS PER COLLEGE
    // ===================================
    $proposalsPerCollege = [];
    $query = "
        SELECT c.college_code AS college, COUNT(r.proposal_id) AS count
        FROM colleges c
        LEFT JOIN researchproposals r ON r.college_id = c.college_id
        GROUP BY c.college_id, c.college_code
        ORDER BY c.college_code ASC
    ";
    $result = $conn->query($query);

    while ($row = $result->fetch_assoc()) {
        $proposalsPerCollege[] = $row;
    }



    // ===================================
    // 📊 USER ROLE DISTRIBUTION
    // ===================================
    $roles = [];
    $query = "
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
        ORDER BY count DESC
    ";
    $result = $conn->query($query);

    while ($row = $result->fetch_assoc()) {
        $roles[] = $row;
    }



    // ===================================
    // 📊 MONTHLY PROPOSAL SUBMISSIONS (last 12 months)
    // ===================================
    $monthly = [];
    $query = "
        SELECT DATE_FORMAT(created_at, '%b') AS month, COUNT(*) AS count
        FROM researchproposals
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY MIN(created_at)
    ";

    $result = $conn->query($query);

    while ($row = $result->fetch_assoc()) {
        $monthly[] = $row;
    }



    // ===================================
    // RECENT PROPOSALS
    // ===================================
    $stmt = $conn->prepare("
        SELECT 
            r.proposal_id,
            r.program_title,
            r.status,
            r.created_at,
            CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM researchproposals r
        LEFT JOIN users u ON r.user_id = u.user_id
        ORDER BY r.created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $result = $stmt->get_result();

    $recentProposals = [];
    while ($row = $result->fetch_assoc()) {
        $recentProposals[] = $row;
    }



    // ===================================
    // FINAL OUTPUT JSON
    // ===================================
    echo json_encode([
        'status' => 'success',
        'stats' => $stats,
        'proposalsPerCollege' => $proposalsPerCollege,
        'userRoles' => $roles,
        'monthlySubmissions' => $monthly,
        'recentProposals' => $recentProposals
    ]);

} catch (Exception $e) {

    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);

}

$conn->close();
?>
