const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database for IQAC Portal...');

  // Clean old data if re-seeding
  await prisma.invitationHistory.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const defaultDeptPassword = await bcrypt.hash('sjciqac', 10);
  const directorPassword = await bcrypt.hash('director123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      name: 'IQAC Administrator',
      role: 'ADMIN',
      isPasswordChanged: true,
    },
  });

  // 2. Create Director
  const director = await prisma.user.create({
    data: {
      username: 'director',
      password: directorPassword,
      name: 'Dr. S. Albert',
      role: 'DIRECTOR',
      isPasswordChanged: true,
    },
  });

  // 3. Create Staff
  const staff = await prisma.user.create({
    data: {
      username: 'staff',
      password: staffPassword,
      name: 'Mr. Ajay James',
      role: 'STAFF',
      isPasswordChanged: true,
    },
  });

  // 4. Create Departments
  const departmentsData = [
    { name: 'Computer Science', code: 'CS', shift: 'Shift I', user: 'cs_shift1', folderId: 'local_Computer_Science_Shift_I' },
    { name: 'Computer Science', code: 'CS_S2', shift: 'Shift II', user: 'cs_shift2', folderId: 'local_Computer_Science_Shift_II' },
    { name: 'Mathematics', code: 'MATHS', shift: 'Shift I', user: 'maths_shift1', folderId: 'local_Mathematics_Shift_I' },
    { name: 'Physics', code: 'PHY', shift: 'Shift I', user: 'physics_shift1', folderId: 'local_Physics_Shift_I' },
    { name: 'Commerce', code: 'COMM_S1', shift: 'Shift I', user: 'commerce_shift1', folderId: 'local_Commerce_Shift_I' },
    { name: 'Commerce', code: 'COMM_S2', shift: 'Shift II', user: 'commerce_shift2', folderId: 'local_Commerce_Shift_II' },
    { name: 'English', code: 'ENG', shift: 'Shift I', user: 'english_shift1', folderId: 'local_English_Shift_I' },
    { name: 'Business Administration', code: 'BBA', shift: 'Shift II', user: 'bba_shift2', folderId: 'local_Business_Administration_Shift_II' },
  ];

  const createdDepts = [];

  for (const dept of departmentsData) {
    const d = await prisma.department.create({
      data: {
        name: dept.name,
        code: dept.code,
        shift: dept.shift,
        driveFolderId: dept.folderId,
      },
    });
    createdDepts.push(d);

    await prisma.user.create({
      data: {
        username: dept.user,
        password: defaultDeptPassword,
        name: `${dept.name} Department (${dept.shift})`,
        role: 'DEPARTMENT',
        departmentId: d.id,
        isPasswordChanged: false,
      },
    });
  }

  console.log(`Created ${createdDepts.length} departments.`);

  // 5. Seed sample Invitations
  const csDept = createdDepts[0];
  const mathsDept = createdDepts[2];
  const commDept = createdDepts[4];
  const phyDept = createdDepts[3];

  // 5a. Pending Invitation (CS)
  const inv1 = await prisma.invitation.create({
    data: {
      programTitle: 'International Conference on Quantum Computing & AI 2026',
      departmentId: csDept.id,
      shift: csDept.shift,
      category: 'Conference',
      fromDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      toDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      fileName: 'quantum_ai_conference_invitation.png',
      fileSize: 452000,
      mimeType: 'image/png',
      localFilePath: '/uploads/sample_invitation_1.png',
      driveViewLink: '/uploads/sample_invitation_1.png',
      status: 'PENDING',
      revisionCount: 0,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  // 5b. Remarks Invitation (Maths - Needs correction)
  const inv2 = await prisma.invitation.create({
    data: {
      programTitle: 'National Seminar on Applied Discrete Mathematics & Cryptography',
      departmentId: mathsDept.id,
      shift: mathsDept.shift,
      category: 'Seminar',
      fromDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      fileName: 'maths_national_seminar_2026.png',
      fileSize: 389000,
      mimeType: 'image/png',
      localFilePath: '/uploads/sample_invitation_2.png',
      driveViewLink: '/uploads/sample_invitation_2.png',
      status: 'REMARKS',
      revisionCount: 0,
      checkLogo: true,
      checkHeaders: true,
      directorRemarks: 'Please ensure the IQAC logo is placed on the top right alongside the college crest, and correct the date format in the chief guest header section.',
      remarkedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  });

  // 5c. Approved Invitation (Commerce - Approved & Hard Copy Received)
  const inv3 = await prisma.invitation.create({
    data: {
      programTitle: 'Endowment Lecture on Fintech Innovations & GST 2.0',
      departmentId: commDept.id,
      shift: commDept.shift,
      category: 'Endowment Lecture',
      fromDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      fileName: 'commerce_endowment_lecture.png',
      fileSize: 521000,
      mimeType: 'image/png',
      localFilePath: '/uploads/sample_invitation_3.png',
      driveViewLink: '/uploads/sample_invitation_3.png',
      status: 'APPROVED',
      revisionCount: 1,
      checkLogo: true,
      checkTitle: true,
      checkHeaders: true,
      checkOthers: true,
      directorRemarks: 'Approved with minor suggestions. Looks great.',
      approvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      hardCopyReceived: true,
      hardCopyReceivedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      hardCopyStaffName: 'Mr. Ajay James',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    },
  });

  // 5d. Approved Invitation (Physics - Approved, Hard Copy Pending)
  const inv4 = await prisma.invitation.create({
    data: {
      programTitle: 'Workshop on Advanced Spectroscopic Characterization Techniques',
      departmentId: phyDept.id,
      shift: phyDept.shift,
      category: 'Workshop',
      fromDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      toDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      fileName: 'physics_spectroscopy_workshop.png',
      fileSize: 610000,
      mimeType: 'image/png',
      localFilePath: '/uploads/sample_invitation_4.png',
      driveViewLink: '/uploads/sample_invitation_4.png',
      status: 'APPROVED',
      revisionCount: 0,
      checkLogo: true,
      checkTitle: true,
      checkHeaders: true,
      approvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      hardCopyReceived: false,
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
