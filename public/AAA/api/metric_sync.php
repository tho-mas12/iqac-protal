<?php
/**
 * IQAC Annual Academic Audit (AAA) 2026-2027
 * Bi-directional Sync Engine: Maps JSON Submissions into Individual metric_* Database Tables
 * St. Joseph's College (Autonomous), Tiruchirappalli
 */

class MetricSyncEngine {

    /**
     * Map of Card ID / Sheet Key / Section Key to MySQL table name
     */
    public static function getSheetTableMap() {
        return [
            // Attribute 1
            '1.1'           => ['table' => 'metric_1_1', 'type' => 'table'],
            '1.2_a'         => ['table' => 'metric_1_2a', 'type' => 'table'],
            '1.2_b'         => ['table' => 'metric_1_2b', 'type' => 'table'],
            '1.3'           => ['table' => 'metric_1_3', 'type' => 'table'],
            '1.4'           => ['table' => 'metric_1_4', 'type' => 'table'],
            '1.5'           => ['table' => 'metric_1_5', 'type' => 'batch'],
            '1.6'           => ['table' => 'metric_1_6', 'type' => 'batch'],
            '1.7'           => ['table' => 'metric_1_7', 'type' => 'table'],
            '1.8'           => ['table' => 'metric_1_8', 'type' => 'table'],
            '1.9'           => ['table' => 'metric_1_9', 'type' => 'table'],
            '1.10'          => ['table' => 'metric_1_10', 'type' => 'table'],
            '1.11'          => ['table' => 'metric_1_11', 'type' => 'table'],

            // Attribute 2
            '2_2_1'         => ['table' => 'metric_2_1', 'type' => 'table'],
            '2_2_2'         => ['table' => 'metric_2_2', 'type' => 'table'],
            '2_2_3'         => ['table' => 'metric_2_3', 'type' => 'table'],
            '2_2_4'         => ['table' => 'metric_2_4', 'type' => 'table'],
            '2_2_5'         => ['table' => 'metric_2_5', 'type' => 'table'],
            '2_2_6'         => ['table' => 'metric_2_6', 'type' => 'table'],
            '2_2_7'         => ['table' => 'metric_2_7', 'type' => 'table'],
            '2_2_8'         => ['table' => 'metric_2_8', 'type' => 'table'],
            '2_2_9'         => ['table' => 'metric_2_9', 'type' => 'table'],
            '2_2_10'        => ['table' => 'metric_2_10', 'type' => 'table'],
            '2_2_11'        => ['table' => 'metric_2_11', 'type' => 'table'],
            '2_2_12'        => ['table' => 'metric_2_12', 'type' => 'table'],
            '2_2_13'        => ['table' => 'metric_2_13', 'type' => 'table'],

            // Attribute 3
            '3_3_1'         => ['table' => 'metric_3_1', 'type' => 'table'],
            '3_3_2'         => ['table' => 'metric_3_2', 'type' => 'table'],

            // Attribute 4
            '4_4_1'         => ['table' => 'metric_4_1', 'type' => 'table'],
            '4_4_2'         => ['table' => 'metric_4_2', 'type' => 'table'],
            '4_4_3'         => ['table' => 'metric_4_3', 'type' => 'table'],
            '4_4_4'         => ['table' => 'metric_4_4', 'type' => 'table'],
            '4_4_5'         => ['table' => 'metric_4_5', 'type' => 'table'],

            // Attribute 5
            '5_5_1'         => ['table' => 'metric_5_1', 'type' => 'table'],
            '5_5_2'         => ['table' => 'metric_5_2', 'type' => 'table'],
            'remedial_classes' => ['table' => 'metric_5_3', 'type' => 'table'],
            '5_5_3'         => ['table' => 'metric_5_3', 'type' => 'multi'],
            '5_5_4'         => ['table' => 'metric_5_4', 'type' => 'table'],
            '5_5_5'         => ['table' => 'metric_5_5', 'type' => 'table'],
            '5_5_6'         => ['table' => 'metric_5_6', 'type' => 'table'],

            // Attribute 6
            '6_6_1'         => ['table' => 'metric_6_1', 'type' => 'table'],
            '6_6_2'         => ['table' => 'metric_6_2', 'type' => 'table'],
            '6_6_3'         => ['table' => 'metric_6_3', 'type' => 'table'],
            '6_6_4'         => ['table' => 'metric_6_4', 'type' => 'table'],
            '6_6_5'         => ['table' => 'metric_6_5', 'type' => 'table'],

            // Attribute 7
            '7_7_1'         => ['table' => 'metric_7_1', 'type' => 'table'],
            '7_7_2'         => ['table' => 'metric_7_2', 'type' => 'table'],
            '7_7_3'         => ['table' => 'metric_7_3', 'type' => 'table'],
            '7_7_4'         => ['table' => 'metric_7_4', 'type' => 'table'],

            // Attribute 8
            '8_8_1'         => ['table' => 'metric_8_1', 'type' => 'table'],
            '8_8_2'         => ['table' => 'metric_8_2', 'type' => 'table'],
            '8_8_3'         => ['table' => 'metric_8_3', 'type' => 'table'],

            // Attribute 9
            '9_9_1'         => ['table' => 'metric_9_1', 'type' => 'table'],
            '9_9_2'         => ['table' => 'metric_9_2', 'type' => 'table'],
            '9_9_3'         => ['table' => 'metric_9_3', 'type' => 'table'],
            '9_9_4'         => ['table' => 'metric_9_4', 'type' => 'table'],
            '9_9_5'         => ['table' => 'metric_9_5', 'type' => 'table'],
            '9_9_6'         => ['table' => 'metric_9_6', 'type' => 'table'],
            '9_9_7'         => ['table' => 'metric_9_7', 'type' => 'table'],
            '9_9_8'         => ['table' => 'metric_9_8', 'type' => 'table'],
            '9_9_9'         => ['table' => 'metric_9_9', 'type' => 'table'],
            '9_9_10'        => ['table' => 'metric_9_10', 'type' => 'table'],
            'ipr_details'   => ['table' => 'metric_9_11', 'type' => 'table'],
            '9_9_11'        => ['table' => 'metric_9_11', 'type' => 'multi'],
            '9_9_12'        => ['table' => 'metric_9_12', 'type' => 'table'],
            '9_9_13'        => ['table' => 'metric_9_13', 'type' => 'table'],

            // Attribute 10
            '10_attribute_x' => ['table' => 'metric_10_1', 'type' => 'table'],
            '10_10_1'        => ['table' => 'metric_10_1', 'type' => 'table']
        ];
    }

    /**
     * Cache for table columns
     */
    private static $tableColumnsCache = [];

    public static function getTableColumns($pdo, $tableName) {
        if (isset(self::$tableColumnsCache[$tableName])) {
            return self::$tableColumnsCache[$tableName];
        }
        try {
            $stmt = $pdo->query("DESCRIBE `$tableName`");
            $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
            self::$tableColumnsCache[$tableName] = $cols;
            return $cols;
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Convert camelCase to snake_case
     */
    public static function toSnakeCase($str) {
        $str = preg_replace('/([a-z0-9])([A-Z])/', '$1_$2', $str);
        return strtolower($str);
    }

    /**
     * Match row data key to MySQL table column
     */
    public static function matchValueForColumn($row, $columnName) {
        // Direct match
        if (array_key_exists($columnName, $row)) return $row[$columnName];

        // S.No normalization
        if ($columnName === 'sno' || $columnName === 's_no' || $columnName === 'sl_no') {
            foreach (['sno', 's_no', 'sl_no', 'sNo', 'slNo', 'SNo'] as $k) {
                if (isset($row[$k])) return $row[$k];
            }
        }

        // Search keys
        $cleanCol = str_replace('_', '', strtolower($columnName));
        foreach ($row as $k => $v) {
            $snakeK = self::toSnakeCase($k);
            if ($snakeK === $columnName) return $v;

            $cleanK = str_replace('_', '', strtolower($k));
            if ($cleanK === $cleanCol) return $v;

            // Prefix match for truncated column names (MySQL max identifiers)
            if (strlen($cleanCol) >= 12 && strpos($cleanK, $cleanCol) === 0) return $v;
            if (strlen($cleanK) >= 12 && strpos($cleanCol, $cleanK) === 0) return $v;
        }

        return null;
    }

    /**
     * Main sync function: syncs entire submission data into all metric_* tables
     */
    public static function syncAuditData($pdo, $deptId, $deptName, $academicYear, $auditData, $submittedBy = null) {
        if (!$auditData || !is_array($auditData)) return false;

        if (!$submittedBy) {
            $submittedBy = $auditData['submitted_by'] ?? ($auditData['submittedBy'] ?? ($auditData['username'] ?? $deptName));
        }

        $sheetMap = self::getSheetTableMap();
        $syncedTables = [];

        // 1. Sync PART-A Faculty & Students
        self::syncPartA($pdo, $deptId, $deptName, $academicYear, $auditData, $submittedBy);

        // 2. Extract sheets from attributeFormData or direct keys
        $formData = $auditData['attributeFormData'] ?? [];

        foreach ($formData as $cardId => $sheets) {
            if (!is_array($sheets)) continue;

            foreach ($sheets as $sheetKey => $sheetContent) {
                if ($sheetKey === 'PART-A' || $cardId === 'part_a') continue;

                // Handle multi-table sheets (e.g. 1.2 has 1.2_a and 1.2_b; 5_5_3 has remedial_classes; 9_9_11 has ipr_details)
                if (is_array($sheetContent) && !isset($sheetContent[0]) && !empty($sheetContent)) {
                    // It's an associative array of sub-sections or batches
                    foreach ($sheetContent as $subKey => $subRows) {
                        if (is_array($subRows) && isset($subRows[0])) {
                            // Target table from subKey (e.g. 1.2_a, 1.2_b, remedial_classes, ipr_details)
                            $targetInfo = $sheetMap[$subKey] ?? ($sheetMap[$sheetKey] ?? null);
                            if ($targetInfo) {
                                self::insertRowsIntoTable(
                                    $pdo,
                                    $targetInfo['table'],
                                    $deptId,
                                    $deptName,
                                    $academicYear,
                                    $subRows,
                                    (strpos($subKey, 'batch') !== false) ? ($subKey === 'ug_batch' ? 'Undergraduate (UG)' : 'Postgraduate (PG)') : null,
                                    $submittedBy
                                );
                                $syncedTables[$targetInfo['table']] = true;
                            }
                        }
                    }
                } elseif (is_array($sheetContent) && isset($sheetContent[0])) {
                    // Standard table array of rows
                    $targetInfo = $sheetMap[$sheetKey] ?? null;
                    if ($targetInfo) {
                        self::insertRowsIntoTable($pdo, $targetInfo['table'], $deptId, $deptName, $academicYear, $sheetContent, null, $submittedBy);
                        $syncedTables[$targetInfo['table']] = true;
                    }
                }
            }
        }

        return array_keys($syncedTables);
    }

    /**
     * Sync PART-A Profile Data (Faculty Details & Student Details)
     */
    private static function syncPartA($pdo, $deptId, $deptName, $academicYear, $auditData, $submittedBy = null) {
        $partAData = null;
        if (isset($auditData['attributeFormData']['part_a']['PART-A'])) {
            $partAData = $auditData['attributeFormData']['part_a']['PART-A'];
        } elseif (isset($auditData['partA'])) {
            $partAData = $auditData['partA'];
        }

        if (!$partAData || !is_array($partAData)) return;

        $author = $submittedBy ?: ($auditData['submitted_by'] ?? ($auditData['username'] ?? $deptName));

        // 1. Faculty Details -> metric_part_a_faculty
        $facultyRows = $partAData['facultyDetails']['rows'] ?? ($partAData['facultyDetails'] ?? []);
        if (is_array($facultyRows) && !empty($facultyRows)) {
            $pdo->prepare("DELETE FROM `metric_part_a_faculty` WHERE department_id = :dept_id AND academic_year = :year")
                ->execute([':dept_id' => $deptId, ':year' => $academicYear]);

            $stmt = $pdo->prepare("
                INSERT INTO `metric_part_a_faculty` (department_id, department_name, submitted_by, academic_year, cadre_category, male, female)
                VALUES (:dept_id, :dept_name, :sub_by, :year, :cadre, :male, :female)
            ");

            foreach ($facultyRows as $f) {
                $cadre = $f['label'] ?? ($f['cadre'] ?? ($f['category'] ?? ''));
                if (!$cadre) continue;
                $rowSub = $f['submitted_by'] ?? ($f['submittedBy'] ?? $author);
                $stmt->execute([
                    ':dept_id'   => $deptId,
                    ':dept_name' => $deptName,
                    ':sub_by'    => $rowSub,
                    ':year'      => $academicYear,
                    ':cadre'     => $cadre,
                    ':male'      => (int)($f['male'] ?? 0),
                    ':female'    => (int)($f['female'] ?? 0)
                ]);
            }
        }

        // 2. Student Details -> metric_part_a_students
        $studentRows = $partAData['studentDetails']['rows'] ?? ($partAData['studentDetails'] ?? []);
        if (is_array($studentRows) && !empty($studentRows)) {
            $pdo->prepare("DELETE FROM `metric_part_a_students` WHERE department_id = :dept_id AND academic_year = :year")
                ->execute([':dept_id' => $deptId, ':year' => $academicYear]);

            $stmt = $pdo->prepare("
                INSERT INTO `metric_part_a_students` (department_id, department_name, submitted_by, academic_year, programme_level, male, female, other_gender, other_states, other_countries)
                VALUES (:dept_id, :dept_name, :sub_by, :year, :programme, :male, :female, :og, :os, :oc)
            ");

            foreach ($studentRows as $s) {
                $prog = $s['programme'] ?? ($s['level'] ?? '');
                if (!$prog) continue;
                $rowSub = $s['submitted_by'] ?? ($s['submittedBy'] ?? $author);
                $stmt->execute([
                    ':dept_id'   => $deptId,
                    ':dept_name' => $deptName,
                    ':sub_by'    => $rowSub,
                    ':year'      => $academicYear,
                    ':programme' => $prog,
                    ':male'      => (int)($s['male'] ?? 0),
                    ':female'    => (int)($s['female'] ?? 0),
                    ':og'        => (int)($s['otherGender'] ?? ($s['other_gender'] ?? 0)),
                    ':os'        => (int)($s['otherStates'] ?? ($s['other_states'] ?? 0)),
                    ':oc'        => (int)($s['otherCountries'] ?? ($s['other_countries'] ?? 0))
                ]);
            }
        }
    }

    /**
     * Generic Table Inserter for any metric_* table
     */
    private static function insertRowsIntoTable($pdo, $tableName, $deptId, $deptName, $academicYear, $rows, $batchName = null, $submittedBy = null) {
        if (!is_array($rows) || empty($rows)) return;

        $dbCols = self::getTableColumns($pdo, $tableName);
        if (empty($dbCols)) return;

        // Delete existing rows for this department & academic year
        if ($batchName && in_array('batch_name', $dbCols)) {
            $delStmt = $pdo->prepare("DELETE FROM `$tableName` WHERE department_id = :dept_id AND academic_year = :year AND batch_name = :batch");
            $delStmt->execute([':dept_id' => $deptId, ':year' => $academicYear, ':batch' => $batchName]);
        } else {
            $delStmt = $pdo->prepare("DELETE FROM `$tableName` WHERE department_id = :dept_id AND academic_year = :year");
            $delStmt->execute([':dept_id' => $deptId, ':year' => $academicYear]);
        }

        // Filter valid insertable columns (exclude id, created_at, updated_at)
        $insertCols = array_filter($dbCols, function($c) {
            return !in_array($c, ['id', 'created_at', 'updated_at']);
        });

        $colListSql = implode(', ', array_map(function($c) { return "`$c`"; }, $insertCols));
        $paramListSql = implode(', ', array_map(function($c) { return ":$c"; }, $insertCols));

        $insertSql = "INSERT INTO `$tableName` ($colListSql) VALUES ($paramListSql)";
        $stmt = $pdo->prepare($insertSql);

        // Deduplicate incoming rows by content signature
        $seenSignatures = [];
        $uniqueRows = [];
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $contentOnly = [];
            foreach ($row as $k => $v) {
                if (!in_array($k, ['sno', 's_no', 'sl_no', 'submitted_by', 'submittedBy', 'id'])) {
                    $contentOnly[$k] = trim((string)($v ?? ''));
                }
            }
            // Discard completely empty blank placeholder rows
            $hasAnyValue = false;
            foreach ($contentOnly as $v) {
                if ($v !== '') { $hasAnyValue = true; break; }
            }
            if (!$hasAnyValue) continue;

            ksort($contentOnly);
            $sig = md5(json_encode($contentOnly));
            if (!isset($seenSignatures[$sig])) {
                $seenSignatures[$sig] = true;
                $uniqueRows[] = $row;
            }
        }

        foreach ($uniqueRows as $row) {
            if (!is_array($row)) continue;

            $params = [];
            foreach ($insertCols as $col) {
                if ($col === 'department_id') {
                    $params[":$col"] = $deptId;
                } elseif ($col === 'department_name') {
                    $params[":$col"] = $deptName;
                } elseif ($col === 'academic_year') {
                    $params[":$col"] = $academicYear;
                } elseif ($col === 'batch_name' && $batchName) {
                    $params[":$col"] = $batchName;
                } elseif ($col === 'submitted_by') {
                    $rowSub = $row['submitted_by'] ?? ($row['submittedBy'] ?? null);
                    $params[":$col"] = $rowSub ?: ($submittedBy ?: $deptName);
                } else {
                    $val = self::matchValueForColumn($row, $col);
                    $params[":$col"] = ($val !== null && $val !== '') ? (string)$val : null;
                }
            }

            try {
                $stmt->execute($params);
            } catch (Exception $e) {
                // Ignore individual row error to prevent blocking entire batch
                error_log("Metric sync error on table $tableName: " . $e->getMessage());
            }
        }
    }

    /**
     * Backfill all existing submissions in audit_submissions into individual metric tables
     */
    public static function backfillAllSubmissions($pdo) {
        $stmt = $pdo->query("
            SELECT s.department_id, s.academic_year, s.data_json, d.name AS department_name
            FROM audit_submissions s
            JOIN departments d ON s.department_id = d.id
        ");
        $all = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $results = [];
        foreach ($all as $item) {
            $data = json_decode($item['data_json'], true);
            if ($data) {
                $synced = self::syncAuditData($pdo, (int)$item['department_id'], $item['department_name'], $item['academic_year'], $data);
                $results[$item['department_name']] = count($synced);
            }
        }
        return $results;
    }
}
