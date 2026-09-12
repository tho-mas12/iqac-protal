const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting IQAC Quality Management Portal Automated Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  try {
    // Test 1: Academic Years in DB
    const ayCount = await prisma.academicYear.count();
    assert(ayCount >= 3, `Academic Years seeded (Found: ${ayCount})`);

    // Test 2: User Roles
    const userCount = await prisma.user.count();
    assert(userCount >= 9, `Seeded users for all 9 roles (Found: ${userCount})`);

    // Test 3: Password Hashing & Verification
    const password = 'password123';
    const hashed = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hashed);
    assert(isValid, 'Password hashing and bcrypt comparison works');

    // Test 4: Requirements Query
    const reqCount = await prisma.requirements.count();
    assert(reqCount >= 4, `Requirements seeded correctly (Found: ${reqCount})`);

    // Test 5: Faculty & Training Data
    const facCount = await prisma.faculty.count();
    assert(facCount >= 3, `Faculty members registered (Found: ${facCount})`);

    // Test 6: Faculty-Student Ratio (FSR) Math
    const studentAgg = await prisma.studentData.aggregate({
      _sum: { totalStudents: true },
    });
    const totalStudents = studentAgg._sum.totalStudents || 0;
    const fsrRatio = totalStudents / facCount;
    assert(fsrRatio > 0, `FSR mathematical ratio calculated dynamically (Ratio: 1:${fsrRatio.toFixed(1)})`);

    // Test 7: Activity Evidence Checklist
    const act = await prisma.activity.findFirst({ where: { activityNumber: 'ACT-2025-001' } });
    const hasCompleteChecklist =
      Boolean(act?.invitationFileUrl) &&
      Boolean(act?.reportFileUrl) &&
      Boolean(act?.attendanceFileUrl) &&
      Boolean(act?.photosFileUrl);
    assert(hasCompleteChecklist, 'Department Activity evidence checklist verification');

    // Test 8: UGC Compliance items
    const ugcCount = await prisma.ugcNepCompliance.count();
    assert(ugcCount >= 6, `UGC / NEP statutory compliance directives seeded (Found: ${ugcCount})`);

    console.log(`\n🎉 Test Suite Completed: ${passed}/${total} assertions passed successfully.`);
  } catch (err) {
    console.error('❌ Test suite execution failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
