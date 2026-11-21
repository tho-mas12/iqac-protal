<?php
/**
 * API: Get and Save Department Audit Submission
 */
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();

    if ($method === 'GET') {
        $deptId = isset($_GET['dept_id']) ? (int)$_GET['dept_id'] : null;

        // If not specified, use authenticated user's department
        if (!$deptId) {
            $user = getAuthUser();
            if ($user && $user['department_id']) {
                $deptId = $user['department_id'];
            }
        }

        if (!$deptId) {
            // Default to department 1 (Computer Science) if not logged in
            $deptId = 1;
        }

        $stmt = $pdo->prepare("
            SELECT s.*, d.name AS department_name, d.code AS department_code, d.status AS department_status, d.is_locked
            FROM departments d
            LEFT JOIN audit_submissions s ON d.id = s.department_id
            WHERE d.id = :dept_id
            LIMIT 1
        ");
        $stmt->execute([':dept_id' => $deptId]);
        $row = $stmt->fetch();

        if (!$row) {
            sendJsonResponse(['success' => false, 'error' => 'Department not found.'], 404);
        }

        $data = !empty($row['data_json']) ? json_decode($row['data_json'], true) : null;

        sendJsonResponse([
            'success' => true,
            'department_id' => $deptId,
            'department_name' => $row['department_name'],
            'department_status' => $row['department_status'],
            'is_locked' => (bool)$row['is_locked'],
            'data' => $data,
            'submitted_at' => $row['submitted_at'] ?? null,
            'updated_at' => $row['updated_at'] ?? null
        ]);

    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $deptId = isset($input['department_id']) ? (int)$input['department_id'] : null;
        $auditData = $input['data'] ?? null;
        $isFinalSubmit = !empty($input['is_final_submit']);

        // Authenticate
        $user = getAuthUser();
        if ($user && $user['role'] === 'department') {
            $deptId = (int)$user['department_id']; // enforce own department
        }

        if (!$deptId || !$auditData) {
            sendJsonResponse(['success' => false, 'error' => 'Department ID and data are required.'], 400);
        }

        // Check if locked
        $checkStmt = $pdo->prepare("SELECT is_locked, name FROM departments WHERE id = :id");
        $checkStmt->execute([':id' => $deptId]);
        $deptRow = $checkStmt->fetch();

        if ($deptRow && $deptRow['is_locked'] && (!$user || $user['role'] !== 'admin')) {
            sendJsonResponse(['success' => false, 'error' => 'This department submission is locked by IQAC.'], 403);
        }

        $jsonStr = json_encode($auditData, JSON_UNESCAPED_UNICODE);

        // Upsert submission
        if ($isFinalSubmit) {
            $stmt = $pdo->prepare("
                INSERT INTO audit_submissions (department_id, academic_year, data_json, submitted_at)
                VALUES (:dept_id, '2026 - 2027', :data_json, NOW())
                ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), submitted_at = NOW()
            ");
            $pdo->prepare("UPDATE departments SET status = 'submitted' WHERE id = :id")->execute([':id' => $deptId]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO audit_submissions (department_id, academic_year, data_json)
                VALUES (:dept_id, '2026 - 2027', :data_json)
                ON DUPLICATE KEY UPDATE data_json = VALUES(data_json)
            ");
            $pdo->prepare("UPDATE departments SET status = 'in_progress' WHERE id = :id AND status = 'draft'")->execute([':id' => $deptId]);
        }

        $stmt->execute([
            ':dept_id' => $deptId,
            ':data_json' => $jsonStr
        ]);

        sendJsonResponse([
            'success' => true,
            'message' => $isFinalSubmit ? 'Final audit report submitted to IQAC successfully!' : 'Submission saved successfully.',
            'department_id' => $deptId,
            'status' => $isFinalSubmit ? 'submitted' : 'in_progress'
        ]);
    }
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
