<?php
/**
 * API: Get and Save Department Audit Submission
 * Directly reads & writes to MySQL database `iqac_aaa` -> table `audit_submissions`
 */
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();

    if ($method === 'GET') {
        $deptParam = isset($_GET['dept_id']) ? trim($_GET['dept_id']) : (isset($_GET['code']) ? trim($_GET['code']) : null);

        // If not specified, use authenticated user's department
        if (!$deptParam) {
            $user = getAuthUser();
            if ($user && !empty($user['department_id'])) {
                $deptParam = $user['department_id'];
            } elseif ($user && !empty($user['department_code'])) {
                $deptParam = $user['department_code'];
            }
        }

        // Default to department 1 (Computer Science) if still null
        if (!$deptParam) {
            $deptParam = 1;
        }

        // Resolve department by ID, code, or name
        if (is_numeric($deptParam)) {
            $stmt = $pdo->prepare("
                SELECT d.*, s.data_json, s.submitted_at AS sub_submitted_at, s.updated_at AS sub_updated_at
                FROM departments d
                LEFT JOIN audit_submissions s ON d.id = s.department_id
                WHERE d.id = :id
                LIMIT 1
            ");
            $stmt->execute([':id' => (int)$deptParam]);
        } else {
            $stmt = $pdo->prepare("
                SELECT d.*, s.data_json, s.submitted_at AS sub_submitted_at, s.updated_at AS sub_updated_at
                FROM departments d
                LEFT JOIN audit_submissions s ON d.id = s.department_id
                WHERE d.code = :val OR d.name = :val
                LIMIT 1
            ");
            $stmt->execute([':val' => $deptParam]);
        }
        
        $row = $stmt->fetch();

        if (!$row) {
            sendJsonResponse(['success' => false, 'error' => 'Department not found in database.'], 404);
        }

        $data = !empty($row['data_json']) ? json_decode($row['data_json'], true) : null;

        sendJsonResponse([
            'success' => true,
            'department_id' => (int)$row['id'],
            'department_code' => $row['code'],
            'department_name' => $row['name'],
            'department_status' => $row['status'],
            'is_locked' => (bool)$row['is_locked'],
            'data' => $data,
            'submitted_at' => $row['sub_submitted_at'] ?? $row['submitted_at'] ?? null,
            'updated_at' => $row['sub_updated_at'] ?? null
        ]);

    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            sendJsonResponse(['success' => false, 'error' => 'Invalid JSON payload received.'], 400);
        }

        $deptParam = $input['department_id'] ?? ($input['department_code'] ?? ($input['department_name'] ?? null));
        $auditData = $input['data'] ?? null;
        $isFinalSubmit = !empty($input['is_final_submit']);
        $academicYear = !empty($input['academic_year']) ? trim($input['academic_year']) : '2026 - 2027';

        // Check authentication
        $user = getAuthUser();
        if ($user && $user['role'] === 'department' && !empty($user['department_id'])) {
            $deptParam = $user['department_id']; // enforce own department
        }

        if (!$deptParam || !$auditData) {
            sendJsonResponse(['success' => false, 'error' => 'Department identifier and audit data payload are required.'], 400);
        }

        // Resolve department record
        if (is_numeric($deptParam)) {
            $stmt = $pdo->prepare("SELECT id, name, code, is_locked, status FROM departments WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => (int)$deptParam]);
        } else {
            $stmt = $pdo->prepare("SELECT id, name, code, is_locked, status FROM departments WHERE code = :val OR name = :val LIMIT 1");
            $stmt->execute([':val' => trim($deptParam)]);
        }
        $deptRow = $stmt->fetch();

        if (!$deptRow) {
            sendJsonResponse(['success' => false, 'error' => 'Matching department not found in database.'], 404);
        }

        $deptId = (int)$deptRow['id'];

        // Enforce lock check (unless admin)
        if ($deptRow['is_locked'] && (!$user || $user['role'] !== 'admin')) {
            sendJsonResponse(['success' => false, 'error' => 'This department audit is currently locked by IQAC.'], 403);
        }

        $jsonStr = json_encode($auditData, JSON_UNESCAPED_UNICODE);

        // Upsert into audit_submissions
        if ($isFinalSubmit) {
            $subStmt = $pdo->prepare("
                INSERT INTO audit_submissions (department_id, academic_year, data_json, submitted_at)
                VALUES (:dept_id, :acad_year, :data_json, NOW())
                ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), submitted_at = NOW()
            ");
            $subStmt->execute([
                ':dept_id' => $deptId,
                ':acad_year' => $academicYear,
                ':data_json' => $jsonStr
            ]);

            // Update departments table status
            $pdo->prepare("UPDATE departments SET status = 'submitted' WHERE id = :id")->execute([':id' => $deptId]);
        } else {
            $subStmt = $pdo->prepare("
                INSERT INTO audit_submissions (department_id, academic_year, data_json)
                VALUES (:dept_id, :acad_year, :data_json)
                ON DUPLICATE KEY UPDATE data_json = VALUES(data_json)
            ");
            $subStmt->execute([
                ':dept_id' => $deptId,
                ':acad_year' => $academicYear,
                ':data_json' => $jsonStr
            ]);

            // If draft, advance to in_progress
            $pdo->prepare("UPDATE departments SET status = 'in_progress' WHERE id = :id AND status = 'draft'")->execute([':id' => $deptId]);
        }

        sendJsonResponse([
            'success' => true,
            'message' => $isFinalSubmit ? 'Final audit report submitted to IQAC successfully!' : 'Submission saved to database successfully.',
            'department_id' => $deptId,
            'department_code' => $deptRow['code'],
            'department_name' => $deptRow['name'],
            'status' => $isFinalSubmit ? 'submitted' : ($deptRow['status'] === 'draft' ? 'in_progress' : $deptRow['status']),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
    }
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
