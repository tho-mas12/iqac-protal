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
                $formData = $data['attributeFormData'] ?? $data;

                // 1. Publications (Attribute 9 - 9.1 Scopus / Web of Science / UGC Care)
                $papersRows = $formData['att9']['9_9_1'] ?? $formData['att9']['9.1'] ?? $data['attributeIX']['papersPublished'] ?? [];
                if (is_array($papersRows)) {
                    if (isset($papersRows['scopus']) || isset($papersRows['wos'])) {
                        $pubs = (int)($papersRows['scopus'] ?? 0) + (int)($papersRows['wos'] ?? 0);
                    } else {
                        $pubs = count(array_filter($papersRows, function($r) {
                            return !empty($r['title_of_paper']) || !empty($r['name_of_the_journal']);
                        }));
                    }
                }
                $totalPubs += $pubs;

                // 2. Grants / External Funds (Attribute 7 - 7.1, 7.2 or Attribute 4/7)
                $fundRows = $formData['att7']['7_7_1'] ?? $formData['att7']['7_7_2'] ?? $data['attributeIV_VII']['externalFunds'] ?? [];
                if (is_array($fundRows)) {
                    foreach ($fundRows as $f) {
                        $ext += (float)($f['amount'] ?? $f['financial_contribution'] ?? $f['grant_amount'] ?? 0);
                    }
                }
                $grants = $ext;
                $totalGrants += $grants;

                // 3. Patents & IPR (Attribute 9 - 9.11)
                $iprSection = $formData['att9']['9_9_11']['ipr_details'] ?? $formData['att9']['9_9_11'] ?? [];
                if (is_array($iprSection)) {
                    $patents = count(array_filter($iprSection, function($r) {
                        return !empty($r['title_of_invention_technology']) || !empty($r['application_patent_number']);
                    }));
                } else {
                    $patents = (int)($data['attributeIX']['patents']['granted'] ?? 0);
                }
                $totalPatents += $patents;

                // 4. Value-Added & Certificate Courses (Attribute 1 - 1.2)
                $vacRows = $formData['att1']['1.2']['vac'] ?? $formData['att1']['1.2'] ?? [];
                if (is_array($vacRows)) {
                    if (isset($formData['att1']['1.2']['vac']) || isset($formData['att1']['1.2']['cc'])) {
                        $vacCc = count($formData['att1']['1.2']['vac'] ?? []) + count($formData['att1']['1.2']['cc'] ?? []);
                    } else {
                        $vacCc = count(array_filter($vacRows, function($r) {
                            return !empty($r['course_title']) || !empty($r['course_code']);
                        }));
                    }
                } else {
                    $vacCc = count($data['attributeI']['vac'] ?? []) + count($data['attributeI']['cc'] ?? []);
                }
                $totalVacCc += $vacCc;

                // 5. MOOCs
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
