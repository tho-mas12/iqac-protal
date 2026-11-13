<?php
/**
 * API: Course Plan Management (Even Semester 2026-2027)
 * St. Joseph's College (Autonomous), Tiruchirappalli - IQAC
 * Workflow:
 *  1. Faculty: Selects Department & Name, fills form, submits without login (Status: Submitted, HOD Status: Pending).
 *  2. HOD: Logs in, reviews each course plan submitted by faculty in their department, approves it (HOD Status: Approved).
 *  3. IQAC Admin: Logs in, views and monitors all HOD-approved course plans across all 34 departments.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : ($method === 'POST' ? 'save' : 'list');

try {
    $pdo = getDBConnection();

    // ================= 1. AUTHENTICATION (FACULTY, HOD & ADMIN) =================
    if ($action === 'login' && $method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        $role = isset($data['role']) ? trim($data['role']) : 'faculty';
        $username = isset($data['username']) ? trim($data['username']) : '';
        $password = isset($data['password']) ? trim($data['password']) : '';
        $deptName = isset($data['department_name']) ? trim($data['department_name']) : '';
        $facName = isset($data['faculty_name']) ? trim($data['faculty_name']) : '';

        if (!$password) {
            echo json_encode(['success' => false, 'error' => 'Please provide password']);
            exit;
        }

        // --- FACULTY LOGIN ---
        if ($role === 'faculty') {
            $facultyId = isset($data['faculty_id']) ? trim($data['faculty_id']) : (isset($data['username']) ? trim($data['username']) : '');
            $authRow = null;

            if ($facultyId !== '') {
                // Direct login via Faculty ID / ERP Code or Staff Email
                $stmt = $pdo->prepare("SELECT * FROM course_plan_faculty_auth WHERE UPPER(faculty_id) = UPPER(:fid) OR UPPER(faculty_email) = UPPER(:femail) LIMIT 1");
                $stmt->execute([':fid' => $facultyId, ':femail' => $facultyId]);
                $authRow = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$authRow) {
                    echo json_encode(['success' => false, 'error' => 'Faculty ID "' . htmlspecialchars($facultyId) . '" not found. Please verify your Staff Code.']);
                    exit;
                }
                $deptName = $authRow['department_name'];
                $facName = $authRow['faculty_name'];
            } else {
                if (!$deptName || !$facName) {
                    echo json_encode(['success' => false, 'error' => 'Please enter Faculty ID or select Department and Faculty Member']);
                    exit;
                }

                // Check course_plan_faculty_auth table
                $stmt = $pdo->prepare("SELECT * FROM course_plan_faculty_auth WHERE department_name = :dept AND faculty_name = :fac LIMIT 1");
                $stmt->execute([':dept' => $deptName, ':fac' => $facName]);
                $authRow = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            $isValid = false;
            if ($authRow) {
                $pwHash = hash('sha256', $password);
                if ($authRow['password_hash'] === $pwHash || $authRow['plain_password'] === $password) {
                    $isValid = true;
                }
            } else if ($password === '123') {
                $isValid = true;
            }

            if (!$isValid) {
                echo json_encode(['success' => false, 'error' => 'Invalid password for ' . ($facName ?: $facultyId)]);
                exit;
            }

            $_SESSION['cp_user'] = [
                'id' => $authRow ? (int)$authRow['id'] : null,
                'faculty_id' => $authRow ? $authRow['faculty_id'] : $facultyId,
                'username' => $authRow ? ($authRow['faculty_id'] ?: $authRow['faculty_email'] ?: $facName) : $facName,
                'role' => 'faculty',
                'department_name' => $deptName,
                'faculty_name' => $facName,
                'display_name' => $facName,
                'faculty_email' => $authRow ? $authRow['faculty_email'] : ''
            ];

            echo json_encode([
                'success' => true,
                'user' => $_SESSION['cp_user'],
                'message' => 'Logged in successfully as ' . $facName
            ]);
            exit;
        }

        // --- HOD & ADMIN LOGIN ---
        $pwHash = hash('sha256', $password);

        if ($role === 'hod' && $deptName !== '') {
            $stmt = $pdo->prepare("SELECT * FROM course_plan_users WHERE role = 'hod' AND department_name = :dept LIMIT 1");
            $stmt->execute([':dept' => $deptName]);
        } else if ($username !== '') {
            $stmt = $pdo->prepare("SELECT * FROM course_plan_users WHERE username = :uname LIMIT 1");
            $stmt->execute([':uname' => $username]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Please provide username or select department']);
            exit;
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user || $user['password_hash'] !== $pwHash) {
            echo json_encode(['success' => false, 'error' => 'Invalid username or password']);
            exit;
        }

        $_SESSION['cp_user'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'department_name' => $user['department_name'],
            'display_name' => $user['display_name'],
            'faculty_name' => ($user['role'] === 'hod') ? $user['display_name'] : ''
        ];

        echo json_encode([
            'success' => true,
            'user' => $_SESSION['cp_user'],
            'message' => 'Logged in successfully as ' . $user['display_name']
        ]);
        exit;
    }

    if ($action === 'logout') {
        unset($_SESSION['cp_user']);
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
        exit;
    }

    if ($action === 'auth_check') {
        if (isset($_SESSION['cp_user'])) {
            echo json_encode(['success' => true, 'authenticated' => true, 'user' => $_SESSION['cp_user']]);
        } else {
            echo json_encode(['success' => true, 'authenticated' => false]);
        }
        exit;
    }

    // ================= 2. GET SINGLE COURSE PLAN =================
    if ($action === 'get' && $method === 'GET') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'Missing ID']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT * FROM course_plan_2026_27 WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            echo json_encode(['success' => false, 'error' => 'Course plan not found']);
            exit;
        }
        $jsonFields = ['general_details', 'course_outcomes', 'detailed_teaching_plan', 'unit_completion_plan', 'learning_activities', 'assessment_plan', 'ict_integration', 'declaration'];
        foreach ($jsonFields as $f) {
            if (isset($row[$f]) && $row[$f] !== null) {
                $row[$f] = json_decode($row[$f], true);
            }
        }
        echo json_encode(['success' => true, 'data' => $row]);
        exit;
    }

    // ================= 3. LIST COURSE PLANS WITH ROLE FILTER =================
    if ($action === 'list' && $method === 'GET') {
        $currentUser = isset($_SESSION['cp_user']) ? $_SESSION['cp_user'] : null;
        $department = isset($_GET['department']) ? trim($_GET['department']) : '';
        $filterStatus = isset($_GET['status']) ? trim($_GET['status']) : '';

        // Base query
        $sql = "SELECT id, department_name, faculty_name, programme, year_class, semester, academic_year, course_code, course_title, course_category, teaching_hours, credits, status, hod_status, hod_name, approved_at, updated_at FROM course_plan_2026_27 WHERE 1=1";
        $params = [];

        // Role-based filtering
        if ($currentUser && $currentUser['role'] === 'faculty') {
            // Strictly show only the logged-in faculty member's course plans
            $sql .= " AND faculty_name = :fac AND department_name = :dept";
            $params[':fac'] = $currentUser['faculty_name'];
            $params[':dept'] = $currentUser['department_name'];
        } else if ($currentUser && $currentUser['role'] === 'hod') {
            // Strictly filter to HOD's department
            $sql .= " AND department_name = :dept";
            $params[':dept'] = $currentUser['department_name'];
            if ($filterStatus && $filterStatus !== 'all') {
                $sql .= " AND hod_status = :hstatus";
                $params[':hstatus'] = $filterStatus;
            }
        } else if ($currentUser && $currentUser['role'] === 'admin') {
            // IQAC Admin view
            if ($filterStatus !== '' && $filterStatus !== 'all') {
                $sql .= " AND hod_status = :hstatus";
                $params[':hstatus'] = $filterStatus;
            }
            if ($department !== '' && $department !== 'All Departments') {
                $sql .= " AND department_name = :dept";
                $params[':dept'] = $department;
            }
        } else {
            // Unauthenticated query (if any)
            if ($department !== '' && $department !== 'All Departments') {
                $sql .= " AND department_name = :dept";
                $params[':dept'] = $department;
            }
        }

        $sql .= " ORDER BY updated_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $plans,
            'currentUser' => $currentUser
        ]);
        exit;
    }

    // ================= 4. HOD APPROVAL / REVISION =================
    if ($action === 'hod_action' && $method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $decision = isset($data['decision']) ? trim($data['decision']) : ''; // 'Approved' or 'Revision Needed'
        $hodName = isset($data['hod_name']) ? trim($data['hod_name']) : '';
        $hodComments = isset($data['hod_comments']) ? trim($data['hod_comments']) : '';

        if (!$id || !$decision) {
            echo json_encode(['success' => false, 'error' => 'Missing ID or decision']);
            exit;
        }

        if ($decision === 'Approved') {
            $stmt = $pdo->prepare("
                UPDATE course_plan_2026_27 SET
                    hod_status = 'Approved',
                    status = 'Approved by HOD',
                    hod_name = :hname,
                    hod_remarks = :hcomments,
                    hod_reviewed_at = NOW(),
                    approved_at = NOW()
                WHERE id = :id
            ");
            $stmt->execute([
                ':hname' => $hodName ?: 'Head of the Department',
                ':hcomments' => $hodComments,
                ':id' => $id
            ]);
            echo json_encode(['success' => true, 'message' => 'Course plan approved and published to IQAC!']);
        } else {
            $stmt = $pdo->prepare("
                UPDATE course_plan_2026_27 SET
                    hod_status = 'Revision Needed',
                    status = 'Needs Revision',
                    hod_name = :hname,
                    hod_remarks = :hcomments,
                    hod_reviewed_at = NOW()
                WHERE id = :id
            ");
            $stmt->execute([
                ':hname' => $hodName ?: 'Head of the Department',
                ':hcomments' => $hodComments,
                ':id' => $id
            ]);
            echo json_encode(['success' => true, 'message' => 'Course plan flagged for revision with comments.']);
        }
        exit;
    }

    // ================= 5. SAVE / SUBMIT COURSE PLAN (FACULTY) =================
    if ($action === 'save' && $method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data) {
            echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
            exit;
        }

        $id = isset($data['id']) && $data['id'] ? (int)$data['id'] : null;
        $deptName = isset($data['department_name']) ? trim($data['department_name']) : 'Department';
        $facultyName = isset($data['faculty_name']) ? trim($data['faculty_name']) : '';
        $programme = isset($data['programme']) ? trim($data['programme']) : '';
        $yearClass = isset($data['year_class']) ? trim($data['year_class']) : '';
        $semester = isset($data['semester']) ? trim($data['semester']) : 'Even Semester';
        $academicYear = isset($data['academic_year']) ? trim($data['academic_year']) : '2026 - 2027';
        $courseCode = isset($data['course_code']) ? trim($data['course_code']) : '';
        $courseTitle = isset($data['course_title']) ? trim($data['course_title']) : '';
        $courseCategory = isset($data['course_category']) ? trim($data['course_category']) : '';
        $teachingHours = isset($data['teaching_hours']) ? trim($data['teaching_hours']) : '';
        $credits = isset($data['credits']) ? trim($data['credits']) : '';
        
        // Submission status
        $status = isset($data['status']) ? trim($data['status']) : 'Draft';
        $hodStatus = ($status === 'Submitted') ? 'Pending' : 'Draft';

        $generalDetails = isset($data['general_details']) ? json_encode($data['general_details'], JSON_UNESCAPED_UNICODE) : null;
        $courseOutcomes = isset($data['course_outcomes']) ? json_encode($data['course_outcomes'], JSON_UNESCAPED_UNICODE) : null;
        $detailedTeachingPlan = isset($data['detailed_teaching_plan']) ? json_encode($data['detailed_teaching_plan'], JSON_UNESCAPED_UNICODE) : null;
        $unitCompletionPlan = isset($data['unit_completion_plan']) ? json_encode($data['unit_completion_plan'], JSON_UNESCAPED_UNICODE) : null;
        $learningActivities = isset($data['learning_activities']) ? json_encode($data['learning_activities'], JSON_UNESCAPED_UNICODE) : null;
        $assessmentPlan = isset($data['assessment_plan']) ? json_encode($data['assessment_plan'], JSON_UNESCAPED_UNICODE) : null;
        $ictIntegration = isset($data['ict_integration']) ? json_encode($data['ict_integration'], JSON_UNESCAPED_UNICODE) : null;
        $declaration = isset($data['declaration']) ? json_encode($data['declaration'], JSON_UNESCAPED_UNICODE) : null;

        if ($id) {
            $stmt = $pdo->prepare("
                UPDATE course_plan_2026_27 SET
                    department_name = :dept,
                    faculty_name = :faculty,
                    programme = :programme,
                    year_class = :year_class,
                    semester = :semester,
                    academic_year = :academic_year,
                    course_code = :course_code,
                    course_title = :course_title,
                    course_category = :course_category,
                    teaching_hours = :teaching_hours,
                    credits = :credits,
                    general_details = :general_details,
                    course_outcomes = :course_outcomes,
                    detailed_teaching_plan = :detailed_teaching_plan,
                    unit_completion_plan = :unit_completion_plan,
                    learning_activities = :learning_activities,
                    assessment_plan = :assessment_plan,
                    ict_integration = :ict_integration,
                    declaration = :declaration,
                    status = :status,
                    hod_status = CASE WHEN :hstatus_cond = 'Pending' AND hod_status = 'Approved' THEN 'Approved' ELSE :hstatus_val END,
                    updated_at = NOW()
                WHERE id = :id
            ");
            $stmt->execute([
                ':dept' => $deptName,
                ':faculty' => $facultyName,
                ':programme' => $programme,
                ':year_class' => $yearClass,
                ':semester' => $semester,
                ':academic_year' => $academicYear,
                ':course_code' => $courseCode,
                ':course_title' => $courseTitle,
                ':course_category' => $courseCategory,
                ':teaching_hours' => $teachingHours,
                ':credits' => $credits,
                ':general_details' => $generalDetails,
                ':course_outcomes' => $courseOutcomes,
                ':detailed_teaching_plan' => $detailedTeachingPlan,
                ':unit_completion_plan' => $unitCompletionPlan,
                ':learning_activities' => $learningActivities,
                ':assessment_plan' => $assessmentPlan,
                ':ict_integration' => $ictIntegration,
                ':declaration' => $declaration,
                ':status' => $status,
                ':hstatus_cond' => $hodStatus,
                ':hstatus_val' => $hodStatus,
                ':id' => $id
            ]);
            $savedId = $id;
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO course_plan_2026_27 (
                    department_name, faculty_name, programme, year_class, semester, academic_year,
                    course_code, course_title, course_category, teaching_hours, credits,
                    general_details, course_outcomes, detailed_teaching_plan, unit_completion_plan,
                    learning_activities, assessment_plan, ict_integration, declaration, status, hod_status
                ) VALUES (
                    :dept, :faculty, :programme, :year_class, :semester, :academic_year,
                    :course_code, :course_title, :course_category, :teaching_hours, :credits,
                    :general_details, :course_outcomes, :detailed_teaching_plan, :unit_completion_plan,
                    :learning_activities, :assessment_plan, :ict_integration, :declaration, :status, :hstatus
                )
            ");
            $stmt->execute([
                ':dept' => $deptName,
                ':faculty' => $facultyName,
                ':programme' => $programme,
                ':year_class' => $yearClass,
                ':semester' => $semester,
                ':academic_year' => $academicYear,
                ':course_code' => $courseCode,
                ':course_title' => $courseTitle,
                ':course_category' => $courseCategory,
                ':teaching_hours' => $teachingHours,
                ':credits' => $credits,
                ':general_details' => $generalDetails,
                ':course_outcomes' => $courseOutcomes,
                ':detailed_teaching_plan' => $detailedTeachingPlan,
                ':unit_completion_plan' => $unitCompletionPlan,
                ':learning_activities' => $learningActivities,
                ':assessment_plan' => $assessmentPlan,
                ':ict_integration' => $ictIntegration,
                ':declaration' => $declaration,
                ':status' => $status,
                ':hstatus' => $hodStatus
            ]);
            $savedId = (int)$pdo->lastInsertId();
        }

        echo json_encode([
            'success' => true,
            'id' => $savedId,
            'status' => $status,
            'hod_status' => $hodStatus,
            'message' => 'Course plan ' . ($status === 'Submitted' ? 'submitted to HOD for review' : 'saved as draft') . ' successfully!'
        ]);
        exit;
    }

    // ================= 6. DELETE COURSE PLAN =================
    if ($action === 'delete' && $method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'Missing ID']);
            exit;
        }
        $currentUser = isset($_SESSION['cp_user']) ? $_SESSION['cp_user'] : null;
        if ($currentUser && $currentUser['role'] === 'faculty') {
            $stmt = $pdo->prepare("DELETE FROM course_plan_2026_27 WHERE id = :id AND faculty_name = :fac AND department_name = :dept");
            $stmt->execute([':id' => $id, ':fac' => $currentUser['faculty_name'], ':dept' => $currentUser['department_name']]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM course_plan_2026_27 WHERE id = :id");
            $stmt->execute([':id' => $id]);
        }
        echo json_encode(['success' => true, 'message' => 'Course plan deleted successfully']);
        exit;
    }

    // ================= 7. SAVE / UPDATE TL PRACTICES & E-CONTENT =================
    if ($action === 'save_tl_practices' && $method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data) {
            echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
            exit;
        }

        $id = isset($data['id']) && $data['id'] ? (int)$data['id'] : null;
        $facultyName = isset($data['faculty_name']) ? trim($data['faculty_name']) : '';
        $facultyEmail = isset($data['faculty_email']) ? trim($data['faculty_email']) : '';
        $deptName = isset($data['department_name']) ? trim($data['department_name']) : '';
        $academicYear = isset($data['academic_year']) ? trim($data['academic_year']) : '2026 - 2027';
        $semester = isset($data['semester']) ? trim($data['semester']) : 'ODD Sem 2026 - 2027';

        if (!$facultyName || !$deptName) {
            echo json_encode(['success' => false, 'error' => 'Faculty Name and Department are required']);
            exit;
        }

        $tl1 = isset($data['tl_practice_1']) ? json_encode($data['tl_practice_1'], JSON_UNESCAPED_UNICODE) : null;
        $tl2 = isset($data['tl_practice_2']) ? json_encode($data['tl_practice_2'], JSON_UNESCAPED_UNICODE) : null;
        $ass1 = isset($data['assessment_practice_1']) ? json_encode($data['assessment_practice_1'], JSON_UNESCAPED_UNICODE) : null;
        $ass2 = isset($data['assessment_practice_2']) ? json_encode($data['assessment_practice_2'], JSON_UNESCAPED_UNICODE) : null;
        $econtent = isset($data['econtent']) ? json_encode($data['econtent'], JSON_UNESCAPED_UNICODE) : null;
        $status = isset($data['status']) ? trim($data['status']) : 'Submitted';

        if ($id) {
            $stmt = $pdo->prepare("
                UPDATE course_plan_tl_practices SET
                    faculty_name = :faculty,
                    faculty_email = :email,
                    department_name = :dept,
                    academic_year = :acad_year,
                    semester = :semester,
                    tl_practice_1 = :tl1,
                    tl_practice_2 = :tl2,
                    assessment_practice_1 = :ass1,
                    assessment_practice_2 = :ass2,
                    econtent = :econtent,
                    status = :status,
                    updated_at = NOW()
                WHERE id = :id
            ");
            $stmt->execute([
                ':faculty' => $facultyName,
                ':email' => $facultyEmail,
                ':dept' => $deptName,
                ':acad_year' => $academicYear,
                ':semester' => $semester,
                ':tl1' => $tl1,
                ':tl2' => $tl2,
                ':ass1' => $ass1,
                ':ass2' => $ass2,
                ':econtent' => $econtent,
                ':status' => $status,
                ':id' => $id
            ]);
            $savedId = $id;
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO course_plan_tl_practices (
                    faculty_name, faculty_email, department_name, academic_year, semester,
                    tl_practice_1, tl_practice_2, assessment_practice_1, assessment_practice_2,
                    econtent, status
                ) VALUES (
                    :faculty, :email, :dept, :acad_year, :semester,
                    :tl1, :tl2, :ass1, :ass2,
                    :econtent, :status
                )
            ");
            $stmt->execute([
                ':faculty' => $facultyName,
                ':email' => $facultyEmail,
                ':dept' => $deptName,
                ':acad_year' => $academicYear,
                ':semester' => $semester,
                ':tl1' => $tl1,
                ':tl2' => $tl2,
                ':ass1' => $ass1,
                ':ass2' => $ass2,
                ':econtent' => $econtent,
                ':status' => $status
            ]);
            $savedId = (int)$pdo->lastInsertId();
        }

        echo json_encode([
            'success' => true,
            'id' => $savedId,
            'message' => 'Teaching-Learning Practices, Assessment Components & E-Content saved successfully!'
        ]);
        exit;
    }

    // ================= 8. GET TL PRACTICES (BY ID OR FACULTY) =================
    if ($action === 'get_tl_practices' && $method === 'GET') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $faculty = isset($_GET['faculty_name']) ? trim($_GET['faculty_name']) : '';
        $dept = isset($_GET['department_name']) ? trim($_GET['department_name']) : '';

        $currentUser = isset($_SESSION['cp_user']) ? $_SESSION['cp_user'] : null;
        if (!$faculty && $currentUser && $currentUser['role'] === 'faculty') {
            $faculty = $currentUser['faculty_name'];
            $dept = $currentUser['department_name'];
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("SELECT * FROM course_plan_tl_practices WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
        } else if ($faculty && $dept) {
            $stmt = $pdo->prepare("SELECT * FROM course_plan_tl_practices WHERE faculty_name = :faculty AND department_name = :dept ORDER BY id DESC LIMIT 1");
            $stmt->execute([':faculty' => $faculty, ':dept' => $dept]);
        } else if ($faculty) {
            $stmt = $pdo->prepare("SELECT * FROM course_plan_tl_practices WHERE faculty_name = :faculty ORDER BY id DESC LIMIT 1");
            $stmt->execute([':faculty' => $faculty]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Please provide id or faculty_name']);
            exit;
        }

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $jsonCols = ['tl_practice_1', 'tl_practice_2', 'assessment_practice_1', 'assessment_practice_2', 'econtent'];
            foreach ($jsonCols as $col) {
                if (isset($row[$col]) && $row[$col] !== null) {
                    $row[$col] = json_decode($row[$col], true);
                }
            }
        }

        echo json_encode(['success' => true, 'data' => $row ?: null]);
        exit;
    }

    // ================= 9. LIST ALL TL PRACTICES (FOR ADMIN / HOD) =================
    if ($action === 'list_tl_practices' && $method === 'GET') {
        $dept = isset($_GET['department']) ? trim($_GET['department']) : '';
        $sql = "SELECT id, faculty_name, faculty_email, department_name, academic_year, semester, status, created_at, updated_at FROM course_plan_tl_practices WHERE 1=1";
        $params = [];
        if ($dept && $dept !== 'All Departments') {
            $sql .= " AND department_name = :dept";
            $params[':dept'] = $dept;
        }
        $sql .= " ORDER BY updated_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $list = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $list]);
        exit;
    }

    // ================= 10. PEDAGOGY & ICT ANALYTICS & INSTITUTIONAL DATA =================
    if ($action === 'analytics_data' && $method === 'GET') {
        $currentUser = isset($_SESSION['cp_user']) ? $_SESSION['cp_user'] : null;
        $filterDept = isset($_GET['department']) ? trim($_GET['department']) : '';
        $filterStatus = isset($_GET['status']) ? trim($_GET['status']) : '';

        $sql = "SELECT id, department_name, faculty_name, programme, year_class, semester, academic_year, course_code, course_title, course_category, teaching_hours, credits, status, hod_status, hod_name, hod_remarks, course_outcomes, detailed_teaching_plan, unit_completion_plan, learning_activities, assessment_plan, ict_integration, approved_at, updated_at FROM course_plan_2026_27 WHERE 1=1";
        $params = [];

        if ($currentUser && $currentUser['role'] === 'hod') {
            $sql .= " AND department_name = :dept";
            $params[':dept'] = $currentUser['department_name'];
        } else if ($filterDept && $filterDept !== 'all' && $filterDept !== 'All Departments') {
            $sql .= " AND department_name = :dept";
            $params[':dept'] = $filterDept;
        }

        if ($filterStatus && $filterStatus !== 'all') {
            $sql .= " AND hod_status = :hstatus";
            $params[':hstatus'] = $filterStatus;
        }

        $sql .= " ORDER BY department_name ASC, course_code ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rawPlans = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch TL Practices
        $tlSql = "SELECT * FROM course_plan_tl_practices";
        $tlStmt = $pdo->query($tlSql);
        $tlRows = $tlStmt ? $tlStmt->fetchAll(PDO::FETCH_ASSOC) : [];

        // Aggregations
        $totalPlans = count($rawPlans);
        $approvedPlans = 0;
        $pendingPlans = 0;
        $totalPlannedHours = 0;
        $facultySet = [];
        $deptPlanCounts = [];

        $methodologies = [];
        $bloomLevels = [
            'K1' => 0, 'K2' => 0, 'K3' => 0,
            'K4' => 0, 'K5' => 0, 'K6' => 0,
            'Other' => 0
        ];
        $ictPlatforms = [];
        $ictTools = [];
        $ictPurposes = [];
        $assessmentTypes = [];

        $processedPlans = [];

        foreach ($rawPlans as $p) {
            if ($p['hod_status'] === 'Approved') $approvedPlans++;
            else $pendingPlans++;

            $hrs = (int)($p['teaching_hours'] ?: 0);
            $totalPlannedHours += $hrs;

            if (!empty($p['faculty_name'])) $facultySet[$p['faculty_name']] = true;

            $dName = $p['department_name'] ?: 'Unknown';
            if (!isset($deptPlanCounts[$dName])) {
                $deptPlanCounts[$dName] = ['total' => 0, 'approved' => 0, 'hours' => 0, 'faculty' => []];
            }
            $deptPlanCounts[$dName]['total']++;
            if ($p['hod_status'] === 'Approved') $deptPlanCounts[$dName]['approved']++;
            $deptPlanCounts[$dName]['hours'] += $hrs;
            if (!empty($p['faculty_name'])) $deptPlanCounts[$dName]['faculty'][$p['faculty_name']] = true;

            // Decode JSON columns
            $cos = !empty($p['course_outcomes']) ? json_decode($p['course_outcomes'], true) : [];
            $dtp = !empty($p['detailed_teaching_plan']) ? json_decode($p['detailed_teaching_plan'], true) : [];
            $acts = !empty($p['learning_activities']) ? json_decode($p['learning_activities'], true) : [];
            $assts = !empty($p['assessment_plan']) ? json_decode($p['assessment_plan'], true) : [];
            $icts = !empty($p['ict_integration']) ? json_decode($p['ict_integration'], true) : [];

            // 1. Methodologies from DTP
            if (is_array($dtp)) {
                foreach ($dtp as $row) {
                    $m = isset($row['methodology']) ? trim($row['methodology']) : '';
                    if ($m) {
                        $methodologies[$m] = ($methodologies[$m] ?? 0) + 1;
                    }
                }
            }

            // 2. Bloom Levels from COs
            if (is_array($cos)) {
                foreach ($cos as $co) {
                    $lvl = isset($co['k_level']) ? trim($co['k_level']) : (isset($co['level']) ? trim($co['level']) : (isset($co['cognitive_level']) ? trim($co['cognitive_level']) : ''));
                    if ($lvl) {
                        $uLvl = strtoupper($lvl);
                        if (strpos($uLvl, 'K1') !== false || stripos($uLvl, 'REMEMBER') !== false) $bloomLevels['K1']++;
                        else if (strpos($uLvl, 'K2') !== false || stripos($uLvl, 'UNDERSTAND') !== false) $bloomLevels['K2']++;
                        else if (strpos($uLvl, 'K3') !== false || stripos($uLvl, 'APPLY') !== false) $bloomLevels['K3']++;
                        else if (strpos($uLvl, 'K4') !== false || stripos($uLvl, 'ANALY') !== false) $bloomLevels['K4']++;
                        else if (strpos($uLvl, 'K5') !== false || stripos($uLvl, 'EVALUAT') !== false) $bloomLevels['K5']++;
                        else if (strpos($uLvl, 'K6') !== false || stripos($uLvl, 'CREATE') !== false || stripos($uLvl, 'SYNTH') !== false) $bloomLevels['K6']++;
                        else $bloomLevels['Other']++;
                    }
                }
            }

            // 3. ICT Platforms, Tools & Purpose
            if (is_array($icts)) {
                foreach ($icts as $ict) {
                    $plat = isset($ict['platform']) ? trim($ict['platform']) : '';
                    if ($plat) $ictPlatforms[$plat] = ($ictPlatforms[$plat] ?? 0) + 1;

                    $tool = isset($ict['tool']) ? trim($ict['tool']) : '';
                    if ($tool) $ictTools[$tool] = ($ictTools[$tool] ?? 0) + 1;

                    $purp = isset($ict['purpose']) ? trim($ict['purpose']) : '';
                    if ($purp) $ictPurposes[$purp] = ($ictPurposes[$purp] ?? 0) + 1;
                }
            }

            // 4. Assessment Types
            if (is_array($acts)) {
                foreach ($acts as $act) {
                    if (!empty($act['is_assessment']) || !empty($act['cia_component'])) {
                        $comp = !empty($act['cia_component']) ? trim($act['cia_component']) : 'CIA Assessment';
                        $assessmentTypes[$comp] = ($assessmentTypes[$comp] ?? 0) + 1;
                    }
                }
            }

            $p['course_outcomes'] = $cos;
            $p['detailed_teaching_plan'] = $dtp;
            $p['learning_activities'] = $acts;
            $p['assessment_plan'] = $assts;
            $p['ict_integration'] = $icts;
            $processedPlans[] = $p;
        }

        // Sort frequencies descending
        arsort($methodologies);
        arsort($ictPlatforms);
        arsort($ictTools);
        arsort($ictPurposes);
        arsort($assessmentTypes);

        // Also aggregate tl_practices
        $tlEcontentPlatforms = [];
        $tlPracticesCounts = [];
        foreach ($tlRows as $tl) {
            $e = !empty($tl['econtent']) ? json_decode($tl['econtent'], true) : null;
            if ($e && !empty($e['platform'])) {
                $p = trim($e['platform']);
                $tlEcontentPlatforms[$p] = ($tlEcontentPlatforms[$p] ?? 0) + 1;
            }
            $t1 = !empty($tl['tl_practice_1']) ? json_decode($tl['tl_practice_1'], true) : null;
            if ($t1 && !empty($t1['tl_practice'])) {
                $tp = trim($t1['tl_practice']);
                $tlPracticesCounts[$tp] = ($tlPracticesCounts[$tp] ?? 0) + 1;
            }
            $t2 = !empty($tl['tl_practice_2']) ? json_decode($tl['tl_practice_2'], true) : null;
            if ($t2 && !empty($t2['tl_practice'])) {
                $tp = trim($t2['tl_practice']);
                $tlPracticesCounts[$tp] = ($tlPracticesCounts[$tp] ?? 0) + 1;
            }
        }

        // Convert dept faculty sets to counts
        $finalDeptStats = [];
        foreach ($deptPlanCounts as $deptKey => $dVal) {
            $finalDeptStats[$deptKey] = [
                'total' => $dVal['total'],
                'approved' => $dVal['approved'],
                'hours' => $dVal['hours'],
                'faculty_count' => count($dVal['faculty'])
            ];
        }

        echo json_encode([
            'success' => true,
            'summary' => [
                'total_plans' => $totalPlans,
                'approved_plans' => $approvedPlans,
                'pending_plans' => $pendingPlans,
                'total_hours' => $totalPlannedHours,
                'faculty_count' => count($facultySet),
                'depts_count' => count($deptPlanCounts)
            ],
            'pedagogy' => $methodologies,
            'bloom_levels' => $bloomLevels,
            'ict_platforms' => $ictPlatforms,
            'ict_tools' => $ictTools,
            'ict_purposes' => $ictPurposes,
            'assessment_types' => $assessmentTypes,
            'tl_practices' => $tlPracticesCounts,
            'tl_econtent' => $tlEcontentPlatforms,
            'dept_stats' => $finalDeptStats,
            'plans' => $processedPlans
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
