<?php
/**
 * IQAC Annual Academic Audit (AAA) 2026-2027
 * One-Click Web Installer for cPanel / Shared Hosting
 * St. Joseph's College (Autonomous), Tiruchirappalli
 */

require_once __DIR__ . '/config/db.php';

$step = isset($_GET['action']) ? $_GET['action'] : 'check';
$message = '';
$error = '';
$isInstalled = false;

if ($step === 'run_install') {
    try {
        $pdo = getDBConnection();
        $sqlFile = __DIR__ . '/schema.sql';
        
        if (!file_exists($sqlFile)) {
            throw new Exception("schema.sql not found in root directory.");
        }
        
        $sql = file_get_contents($sqlFile);
        
        // Execute multi-query schema
        $pdo->exec($sql);

        // Also seed Computer Science sample data into audit_submissions if empty
        $csSampleFile = __DIR__ . '/sample-data/cs_sample.json';
        if (file_exists($csSampleFile)) {
            $csJson = file_get_contents($csSampleFile);
            $stmt = $pdo->prepare("
                INSERT INTO audit_submissions (department_id, academic_year, data_json, submitted_at)
                VALUES (1, '2026 - 2027', :data_json, NOW())
                ON DUPLICATE KEY UPDATE data_json = VALUES(data_json)
            ");
            $stmt->execute([':data_json' => $csJson]);
        }

        // Also seed Commerce sample data
        $commSampleFile = __DIR__ . '/sample-data/commerce_sample.json';
        if (file_exists($commSampleFile)) {
            $commJson = file_get_contents($commSampleFile);
            $stmt = $pdo->prepare("
                INSERT INTO audit_submissions (department_id, academic_year, data_json, submitted_at)
                VALUES (2, '2026 - 2027', :data_json, NOW())
                ON DUPLICATE KEY UPDATE data_json = VALUES(data_json)
            ");
            $stmt->execute([':data_json' => $commJson]);
        }

        $isInstalled = true;
        $message = "Installation successful! Database tables created and sample data seeded.";
    } catch (Exception $e) {
        $error = "Installation failed: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IQAC AAA 2026-2027 — Database Installer</title>
  <script src="vendor/tailwind.js"></script>
</head>
<body class="bg-slate-100 text-slate-800 antialiased min-h-screen flex items-center justify-center p-4">
  <div class="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
    <div class="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white text-center">
      <div class="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 font-black text-lg flex items-center justify-center mx-auto mb-2 shadow">
        SJC
      </div>
      <h1 class="text-xl font-black">St. Joseph's College (Autonomous)</h1>
      <p class="text-xs text-blue-200 mt-1">IQAC Annual Academic Audit (AAA) 2026-2027 • Database Installer</p>
    </div>

    <div class="p-6 space-y-6">
      <?php if ($error): ?>
        <div class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
          <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
        </div>
      <?php endif; ?>

      <?php if ($message): ?>
        <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs space-y-2">
          <div class="font-bold text-sm">✓ <?php echo htmlspecialchars($message); ?></div>
          <p>You can now log in using the credentials below:</p>
          <div class="bg-white p-3 rounded border border-emerald-200 text-[11px] font-mono space-y-1">
            <div><strong>IQAC Admin:</strong> username: <code class="text-blue-700">admin</code> | password: <code class="text-blue-700">admin123</code></div>
            <div><strong>CS Department:</strong> username: <code class="text-blue-700">cs</code> | password: <code class="text-blue-700">cs123</code></div>
            <div><strong>Commerce Dept:</strong> username: <code class="text-blue-700">commerce</code> | password: <code class="text-blue-700">commerce123</code></div>
          </div>
        </div>

        <div class="pt-2 text-center">
          <a href="index.html" class="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition">
            Go to Platform Dashboard &rarr;
          </a>
        </div>
      <?php else: ?>
        <div class="space-y-4 text-xs text-slate-600">
          <p class="leading-relaxed">
            Welcome to the <strong>IQAC Annual Academic Audit (AAA) 2026-2027</strong> automated database installer for cPanel & MySQL.
          </p>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-800 uppercase text-[11px] block">Database Connection Settings (config/db.php):</span>
            <ul class="space-y-1 font-mono text-[11px] text-slate-700">
              <li>• Host: <strong><?php echo DB_HOST; ?></strong></li>
              <li>• Database: <strong><?php echo DB_NAME; ?></strong></li>
              <li>• User: <strong><?php echo DB_USER; ?></strong></li>
            </ul>
            <p class="text-[10px] text-slate-500">Edit <code>config/db.php</code> if your cPanel database credentials differ.</p>
          </div>

          <div class="pt-2">
            <a href="install.php?action=run_install" class="w-full text-center block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition">
              Run Database Installation & Seed Tables
            </a>
          </div>
        </div>
      <?php endif; ?>
    </div>

    <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
      Internal Quality Assurance Cell • St. Joseph's College (Autonomous), Tiruchirappalli
    </div>
  </div>
</body>
</html>
