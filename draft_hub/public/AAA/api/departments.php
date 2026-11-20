<?php
/**
 * API: Departments Management & Consolidated Summary
 */
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();

    if ($method === 'GET') {
        // Return list of all departments with status and summary metrics
        $stmt = $pdo->query("
            SELECT d.*, 
                   s.updated_at AS last_updated,
                   s.submitted_at,
                   s.data_json,
                   e.overall_grade,
                   e.composite_score
            FROM departments d
            LEFT JOIN audit_submissions s ON d.id = s.department_id
            LEFT JOIN audit_evaluations e ON d.id = e.department_id
            ORDER BY d.id ASC
        ");
        $rows = $stmt->fetchAll();

        $departments = [];
        $totalPubs = 0;
        $totalGrants = 0;
        $totalPatents = 0;
        $totalVacCc = 0;
        $submittedCount = 0;
        $auditedCount = 0;

        foreach ($rows as $row) {
            $data = !empty($row['data_json']) ? json_decode($row['data_json'], true) : null;
            
            // Extract quick summary stats for admin table
            $pubs = 0;
            $grants = 0;
            $patents = 0;
            $vacCc = 0;
            $moocPct = '0%';

            if ($data) {
                $scopus = $data['attributeIX']['papersPublished']['scopus'] ?? 0;
                $wos = $data['attributeIX']['papersPublished']['wos'] ?? 0;
                $pubs = (int)$scopus + (int)$wos;
                $totalPubs += $pubs;

                $ext = 0;
                if (!empty($data['attributeIV_VII']['externalFunds'])) {
                    foreach ($data['attributeIV_VII']['externalFunds'] as $f) {
                        $ext += (float)($f['amount'] ?? 0);
                    }
                }
                $grants = $ext;
                $totalGrants += $grants;

                $patents = (int)($data['attributeIX']['patents']['granted'] ?? 0);
                $totalPatents += $patents;

                $vacCc = count($data['attributeI']['vac'] ?? []) + count($data['attributeI']['cc'] ?? []);
                $totalVacCc += $vacCc;

                $ugComp = (int)($data['attributeI']['moocs']['ug']['cycle1_completed'] ?? 0) + (int)($data['attributeI']['moocs']['ug']['cycle2_completed'] ?? 0);
                $ugReg = (int)($data['attributeI']['moocs']['ug']['cycle1_registered'] ?? 0) + (int)($data['attributeI']['moocs']['ug']['cycle2_registered'] ?? 0);
                $moocPct = $ugReg > 0 ? round(($ugComp / $ugReg) * 100, 1) . '%' : 'N/A';
            }

            if ($row['status'] === 'submitted') $submittedCount++;
            if ($row['status'] === 'audited') $auditedCount++;

            $departments[] = [
                'id' => (int)$row['id'],
                'code' => $row['code'],
                'name' => $row['name'],
                'school' => $row['school'],
                'hod_name' => $row['hod_name'],
                'status' => $row['status'],
                'audit_date' => $row['audit_date'],
                'is_locked' => (bool)$row['is_locked'],
                'last_updated' => $row['last_updated'],
                'submitted_at' => $row['submitted_at'],
                'has_submission' => !empty($data),
                'metrics' => [
                    'publications' => $pubs,
                    'grants_lakhs' => round($grants / 100000, 2),
                    'patents' => $patents,
                    'vac_cc' => $vacCc,
                    'mooc_pct' => $moocPct
                ],
                'evaluation' => [
                    'grade' => $row['overall_grade'] ?? null,
                    'score' => $row['composite_score'] ?? null
                ]
            ];
        }

        sendJsonResponse([
            'success' => true,
            'departments' => $departments,
            'overview' => [
                'total_departments' => count($departments),
                'submitted_count' => $submittedCount,
                'audited_count' => $auditedCount,
                'in_progress_count' => count($departments) - $submittedCount - $auditedCount,
                'total_publications' => $totalPubs,
                'total_grants_lakhs' => round($totalGrants / 100000, 2),
                'total_patents' => $totalPatents,
                'total_vac_cc' => $totalVacCc
            ]
        ]);
    } elseif ($method === 'POST') {
        // Admin only: Add new department
        requireAuth('admin');
        $input = json_decode(file_get_contents('php://input'), true);
        
        $name = trim($input['name'] ?? '');
        $code = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $input['code'] ?? ''));
        $school = trim($input['school'] ?? '');
        $hodName = trim($input['hod_name'] ?? '');
        $auditDate = $input['audit_date'] ?? null;

        if (empty($name) || empty($code)) {
            sendJsonResponse(['success' => false, 'error' => 'Department name and unique code are required.'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO departments (code, name, school, hod_name, audit_date, status)
            VALUES (:code, :name, :school, :hod_name, :audit_date, 'draft')
        ");
        $stmt->execute([
            ':code' => $code,
            ':name' => $name,
            ':school' => $school,
            ':hod_name' => $hodName,
            ':audit_date' => $auditDate
        ]);
        $newDeptId = (int)$pdo->lastInsertId();

        // Also create department user account: username = code, password = code + 123
        $passHash = password_hash($code . '123', PASSWORD_BCRYPT);
        $userStmt = $pdo->prepare("
            INSERT INTO users (username, password_hash, display_name, role, department_id)
            VALUES (:username, :password_hash, :display_name, 'department', :department_id)
        ");
        $userStmt->execute([
            ':username' => $code,
            ':password_hash' => $passHash,
            ':display_name' => 'HOD ' . $name,
            ':department_id' => $newDeptId
        ]);

        sendJsonResponse([
            'success' => true,
            'department_id' => $newDeptId,
            'username' => $code,
            'default_password' => $code . '123',
            'message' => "Department created successfully! User account '$code' created with password '{$code}123'."
        ]);
    }
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
