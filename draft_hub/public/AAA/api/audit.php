<?php
/**
 * API: Panel Review Evaluation & Scoring
 */
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();

    if ($method === 'POST') {
        requireAuth('admin');
        $input = json_decode(file_get_contents('php://input'), true);

        $deptId = (int)($input['department_id'] ?? 0);
        $scores = $input['scores'] ?? [];
        $grade = trim($input['overall_grade'] ?? 'A+');
        $expert = trim($input['expert_name'] ?? '');
        $dean = trim($input['dean_name'] ?? '');
        $iqac = trim($input['iqac_coordinator'] ?? '');
        $commendations = trim($input['commendations'] ?? '');
        $recommendations = trim($input['recommendations'] ?? '');

        if (!$deptId) {
            sendJsonResponse(['success' => false, 'error' => 'Department ID is required.'], 400);
        }

        $totalPoints = array_sum(array_map('floatval', $scores));
        $compositeScore = round(($totalPoints / 40) * 100, 2);

        $stmt = $pdo->prepare("
            INSERT INTO audit_evaluations 
            (department_id, academic_year, expert_name, dean_name, iqac_coordinator, scores_json, composite_score, overall_grade, commendations, recommendations)
            VALUES (:dept_id, '2026 - 2027', :expert, :dean, :iqac, :scores, :comp, :grade, :comm, :rec)
            ON DUPLICATE KEY UPDATE 
            expert_name = VALUES(expert_name),
            dean_name = VALUES(dean_name),
            iqac_coordinator = VALUES(iqac_coordinator),
            scores_json = VALUES(scores_json),
            composite_score = VALUES(composite_score),
            overall_grade = VALUES(overall_grade),
            commendations = VALUES(commendations),
            recommendations = VALUES(recommendations)
        ");

        $stmt->execute([
            ':dept_id' => $deptId,
            ':expert' => $expert,
            ':dean' => $dean,
            ':iqac' => $iqac,
            ':scores' => json_encode($scores),
            ':comp' => $compositeScore,
            ':grade' => $grade,
            ':comm' => $commendations,
            ':rec' => $recommendations
        ]);

        // Mark department as audited
        $pdo->prepare("UPDATE departments SET status = 'audited' WHERE id = :id")->execute([':id' => $deptId]);

        sendJsonResponse([
            'success' => true,
            'message' => 'Audit evaluation and grade successfully saved!',
            'composite_score' => $compositeScore,
            'overall_grade' => $grade
        ]);
    }
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
