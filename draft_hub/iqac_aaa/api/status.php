<?php
/**
 * API: Update Department Status & Lock/Unlock
 */
require_once __DIR__ . '/../config/db.php';

requireAuth('admin');

$input = json_decode(file_get_contents('php://input'), true);
$deptId = (int)($input['department_id'] ?? 0);
$status = $input['status'] ?? null;
$isLocked = isset($input['is_locked']) ? (int)$input['is_locked'] : null;

if (!$deptId) {
    sendJsonResponse(['success' => false, 'error' => 'Department ID is required.'], 400);
}

try {
    $pdo = getDBConnection();
    
    if ($status !== null) {
        $stmt = $pdo->prepare("UPDATE departments SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $deptId]);
    }

    if ($isLocked !== null) {
        $stmt = $pdo->prepare("UPDATE departments SET is_locked = :is_locked WHERE id = :id");
        $stmt->execute([':is_locked' => $isLocked, ':id' => $deptId]);
    }

    sendJsonResponse([
        'success' => true,
        'message' => 'Department status updated successfully.'
    ]);
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
