<?php
/**
 * IQAC Annual Academic Audit (AAA) 2026-2027
 * Database Configuration (cPanel / MySQL / phpMyAdmin)
 * St. Joseph's College (Autonomous), Tiruchirappalli
 */

// ==============================================================
// EDIT THESE 4 VALUES TO MATCH YOUR CPANEL MYSQL CREDENTIALS
// ==============================================================
define('DB_HOST', 'localhost');
define('DB_NAME', 'iqac_aaa_db');      // e.g. 'cpaneluser_iqac_aaa'
define('DB_USER', 'root');             // e.g. 'cpaneluser_dbuser'
define('DB_PASS', '');                 // e.g. 'YourStrongPassword123'
define('DB_CHARSET', 'utf8mb4');

// Start session if not started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Returns PDO Database Connection
 */
function getDBConnection() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed: ' . $e->getMessage(),
                'hint' => 'Please check config/db.php credentials or run install.php first.'
            ]);
            exit;
        }
    }
    return $pdo;
}

/**
 * Send JSON response
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Get Authenticated User from session
 */
function getAuthUser() {
    return isset($_SESSION['user']) ? $_SESSION['user'] : null;
}

/**
 * Require Login
 */
function requireAuth($role = null) {
    $user = getAuthUser();
    if (!$user) {
        sendJsonResponse(['success' => false, 'error' => 'Unauthorized. Please log in.'], 401);
    }
    if ($role && $user['role'] !== $role) {
        sendJsonResponse(['success' => false, 'error' => 'Forbidden. Admin privileges required.'], 403);
    }
    return $user;
}
