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
  await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      name: 'IQAC Administrator',
      role: 'ADMIN',
      isPasswordChanged: true,
    },
  });

  // 2. Create Director
  await prisma.user.create({
    data: {
      username: 'director',
      password: directorPassword,
      name: 'Dr. S. Albert',
      role: 'DIRECTOR',
      isPasswordChanged: true,
    },
  });

  // 3. Create Staff
  await prisma.user.create({
    data: {
      username: 'staff',
      password: staffPassword,
      name: 'Mr. Ajay James',
      role: 'STAFF',
      isPasswordChanged: true,
    },
  });

  // 4. Create all 36 Departments & Department Users
  const departmentsData = [
    { name: 'Biochemistry', code: 'BIOCHEM_S2', shift: 'Shift II', user: 'biochem_s2', folderId: 'local_Biochemistry_Shift_II' },
    { name: 'Biotechnology', code: 'BIOTECH_S2', shift: 'Shift II', user: 'biotech_s2', folderId: 'local_Biotechnology_Shift_II' },
    { name: 'Botany', code: 'BOT_S1', shift: 'Shift I', user: 'bot_s1', folderId: 'local_Botany_Shift_I' },
    { name: 'Commerce', code: 'COM_S1', shift: 'Shift I', user: 'com_s1', folderId: 'local_Commerce_Shift_I' },
    { name: 'Commerce', code: 'COM_S2', shift: 'Shift II', user: 'com_s2', folderId: 'local_Commerce_Shift_II' },
    { name: 'Commerce Business Analytics', code: 'BUS_S2', shift: 'Shift II', user: 'bus_s2', folderId: 'local_Commerce_Business_Analytics_Shift_II' },
    { name: 'Commerce Computer Application', code: 'COMCA_S2', shift: 'Shift II', user: 'comca_s2', folderId: 'local_Commerce_Computer_Application_Shift_II' },
    { name: 'Commerce Honours', code: 'COMCR_S2', shift: 'Shift II', user: 'comcr_s2', folderId: 'local_Commerce_Honours_Shift_II' },
    { name: 'Commerce Strategic Finance', code: 'COMSF_S2', shift: 'Shift II', user: 'comsf_s2', folderId: 'local_Commerce_Strategic_Finance_Shift_II' },
    { name: 'Artificial Intelligence', code: 'AI_S2', shift: 'Shift II', user: 'ai_s2', folderId: 'local_Artificial_Intelligence_Shift_II' },
    { name: 'B Voc Software Development & System Administration', code: 'SDSA_S2', shift: 'Shift II', user: 'sdsa_s2', folderId: 'local_B_Voc_SDSA_Shift_II' },
    { name: 'Computer Science', code: 'CS_S1', shift: 'Shift I', user: 'cs_s1', folderId: 'local_Computer_Science_Shift_I' },
    { name: 'Computer Science', code: 'CS_S2', shift: 'Shift II', user: 'cs_s2', folderId: 'local_Computer_Science_Shift_II' },
    { name: 'Data Science', code: 'DS_S2', shift: 'Shift II', user: 'ds_s2', folderId: 'local_Data_Science_Shift_II' },
    { name: 'Information Technology', code: 'IT_S2', shift: 'Shift II', user: 'it_s2', folderId: 'local_Information_Technology_Shift_II' },
    { name: 'Mathematics', code: 'MAT_S1', shift: 'Shift I', user: 'mat_s1', folderId: 'local_Mathematics_Shift_I' },
    { name: 'Mathematics', code: 'MAT_S2', shift: 'Shift II', user: 'mat_s2', folderId: 'local_Mathematics_Shift_II' },
    { name: 'Statistics', code: 'STAT_S1', shift: 'Shift I', user: 'stat_s1', folderId: 'local_Statistics_Shift_I' },
    { name: 'English', code: 'EN_S1', shift: 'Shift I', user: 'en_s1', folderId: 'local_English_Shift_I' },
    { name: 'English', code: 'EN_S2', shift: 'Shift II', user: 'en_s2', folderId: 'local_English_Shift_II' },
    { name: 'French', code: 'FR_S1', shift: 'Shift I', user: 'fr_s1', folderId: 'local_French_Shift_I' },
    { name: 'Hindi', code: 'HI_S1', shift: 'Shift I', user: 'hi_s1', folderId: 'local_Hindi_Shift_I' },
    { name: 'History', code: 'HS_S1', shift: 'Shift I', user: 'hs_s1', folderId: 'local_History_Shift_I' },
    { name: 'Sanskrit', code: 'SA_S1', shift: 'Shift I', user: 'sa_s1', folderId: 'local_Sanskrit_Shift_I' },
    { name: 'Tamil', code: 'TA_S1', shift: 'Shift I', user: 'ta_s1', folderId: 'local_Tamil_Shift_I' },
    { name: 'Tamil', code: 'TA_S2', shift: 'Shift II', user: 'ta_s2', folderId: 'local_Tamil_Shift_II' },
    { name: 'Business Administration', code: 'BU_S2', shift: 'Shift II', user: 'bu_s2', folderId: 'local_Business_Administration_Shift_II' },
    { name: 'Counselling Psychology', code: 'CP_S2', shift: 'Shift II', user: 'cp_s2', folderId: 'local_Counselling_Psychology_Shift_II' },
    { name: 'Economics', code: 'ECO_S1', shift: 'Shift I', user: 'eco_s1', folderId: 'local_Economics_Shift_I' },
    { name: 'Human Resource Management', code: 'HR_S1', shift: 'Shift I', user: 'hr_s1', folderId: 'local_Human_Resource_Management_Shift_I' },
    { name: 'Physical Education, Health Education, Sports', code: 'PE_S2', shift: 'Shift II', user: 'pe_s2', folderId: 'local_Physical_Education_Shift_II' },
    { name: 'Visual Communication', code: 'VC_S2', shift: 'Shift II', user: 'vc_s2', folderId: 'local_Visual_Communication_Shift_II' },
    { name: 'Chemistry', code: 'CH_S1', shift: 'Shift I', user: 'ch_s1', folderId: 'local_Chemistry_Shift_I' },
    { name: 'Electronic', code: 'EL_S2', shift: 'Shift II', user: 'el_s2', folderId: 'local_Electronic_Shift_II' },
    { name: 'Physics', code: 'PH_S1', shift: 'Shift I', user: 'ph_s1', folderId: 'local_Physics_Shift_I' },
    { name: 'Physics', code: 'PH_S2', shift: 'Shift II', user: 'ph_s2', folderId: 'local_Physics_Shift_II' },
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

  console.log(`Created ${createdDepts.length} departments and users.`);

  // 5. Seed sample Invitations
  const csDept = createdDepts.find(d => d.code === 'CS_S1') || createdDepts[0];
  const mathsDept = createdDepts.find(d => d.code === 'MAT_S1') || createdDepts[1];
  const commDept = createdDepts.find(d => d.code === 'COM_S1') || createdDepts[2];
  const phyDept = createdDepts.find(d => d.code === 'PH_S1') || createdDepts[3];

  await prisma.invitation.create({
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
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  await prisma.invitation.create({
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
      directorRemarks: 'Please ensure the IQAC logo is placed on the top right alongside the college crest.',
      remarkedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  });

  await prisma.invitation.create({
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

  await prisma.invitation.create({
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

  console.log('Seed completed successfully with all 36 department users!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
