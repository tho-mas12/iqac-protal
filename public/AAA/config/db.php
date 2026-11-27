<?php
/**
 * IQAC Annual Academic Audit (AAA) 2026-2027
 * Database Configuration (cPanel / MySQL / phpMyAdmin)
 * St. Joseph's College (Autonomous), Tiruchirappalli
 */

// ==============================================================
// EDIT THESE 4 VALUES TO MATCH YOUR CPANEL MYSQL CREDENTIALS
// ==============================================================
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_NAME', getenv('DB_NAME') ?: 'iqac_aaa');
define('DB_USER', getenv('DB_USER') ?: 'iqac_user');
define('DB_PASS', getenv('DB_PASS') ?: 'sjcIQAC-portal26');
define('DB_CHARSET', 'utf8mb4');
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'sjciqac-portal-secret-key-super-secure-2026');

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
                'error' => 'Database connection failed. Please contact the administrator.'
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
    
    // Secure CORS: restrict to host origin
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && (strpos($origin, 'frontierwox.in') !== false || strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
    }
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Base64URL decode helper for JWT
 */
function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Get Authenticated User from session or JWT cookie
 */
function getAuthUser() {
    if (isset($_SESSION['user']) && !empty($_SESSION['user']['username'])) {
        return $_SESSION['user'];
    }

    // Verify central portal SSO JWT token from cookie
    if (!empty($_COOKIE['iqac_token'])) {
        $jwt = trim($_COOKIE['iqac_token']);
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) === 3) {
            $headerJson = base64UrlDecode($tokenParts[0]);
            $payloadJson = base64UrlDecode($tokenParts[1]);
            $signatureProvided = base64UrlDecode($tokenParts[2]);

            // Cryptographically verify HMAC-SHA256 signature
            $headerAndPayload = $tokenParts[0] . '.' . $tokenParts[1];
            $signatureExpected = hash_hmac('sha256', $headerAndPayload, JWT_SECRET, true);

            if (hash_equals($signatureExpected, $signatureProvided)) {
                $payload = json_decode($payloadJson, true);
                if ($payload && (!isset($payload['exp']) || $payload['exp'] > time())) {
                    $rawRole = strtoupper($payload['role'] ?? '');
                    $isAdmin = ($rawRole === 'ADMIN' || $rawRole === 'ADMINISTRATOR');

                    $_SESSION['user'] = [
                        'id' => $payload['userId'] ?? 1,
                        'username' => strtolower($payload['username'] ?? 'user'),
                        'role' => $isAdmin ? 'admin' : 'department',
                        'department_id' => $payload['departmentId'] ?? null,
                        'display_name' => $payload['name'] ?? ($payload['username'] ?? 'User')
                    ];
                    return $_SESSION['user'];
                }
            }
        }
    }

    return null;
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
