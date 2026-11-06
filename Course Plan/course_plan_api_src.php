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

    // ================= 1. AUTHENTICATION (HOD & ADMIN) =================
    if ($action === 'login' && $method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        $username = isset($data['username']) ? trim($data['username']) : '';
        $password = isset($data['password']) ? trim($data['password']) : '';
        $deptName = isset($data['department_name']) ? trim($data['department_name']) : '';
        $role = isset($data['role']) ? trim($data['role']) : '';

        if (!$password) {
            echo json_encode(['success' => false, 'error' => 'Please provide password']);
            exit;
        }

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
            'display_name' => $user['display_name']
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

        // If logged in as HOD, strictly filter to their department
        if ($currentUser && $currentUser['role'] === 'hod') {
            $department = $currentUser['department_name'];
        }

        // Base query
        $sql = "SELECT id, department_name, faculty_name, programme, year_class, semester, academic_year, course_code, course_title, course_category, teaching_hours, credits, status, hod_status, hod_name, approved_at, updated_at FROM course_plan_2026_27 WHERE 1=1";
        $params = [];

        // If IQAC Admin requested approved only or default
        if ($currentUser && $currentUser['role'] === 'admin') {
            if ($filterStatus !== '' && $filterStatus !== 'all') {
                $sql .= " AND hod_status = :hstatus";
                $params[':hstatus'] = $filterStatus;
            }
            if ($department !== '' && $department !== 'All Departments') {
                $sql .= " AND department_name = :dept";
                $params[':dept'] = $department;
            }
        } else {
            // Department view (Public Faculty or HOD)
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
                    hod_comments = :hcomments,
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
                    hod_comments = :hcomments
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
                    hod_status = CASE WHEN :hstatus = 'Pending' AND hod_status = 'Approved' THEN 'Approved' ELSE :hstatus END,
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
                ':hstatus' => $hodStatus,
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
        $stmt = $pdo->prepare("DELETE FROM course_plan_2026_27 WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Course plan deleted successfully']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
