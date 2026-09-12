const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding IQAC Quality Management & Compliance Portal database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Academic Years
  const ay2425 = await prisma.academicYear.upsert({
    where: { year: '2024-25' },
    update: {},
    create: {
      year: '2024-25',
      isCurrent: false,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-05-31'),
    },
  });

  const ay2526 = await prisma.academicYear.upsert({
    where: { year: '2025-26' },
    update: { isCurrent: true },
    create: {
      year: '2025-26',
      isCurrent: true,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-05-31'),
    },
  });

  const ay2627 = await prisma.academicYear.upsert({
    where: { year: '2026-27' },
    update: {},
    create: {
      year: '2026-27',
      isCurrent: false,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2027-05-31'),
    },
  });

  // 2. Schools
  const schoolMgmt = await prisma.school.upsert({
    where: { code: 'SMB' },
    update: {},
    create: {
      name: 'School of Management & Business Studies',
      code: 'SMB',
    },
  });

  const schoolSci = await prisma.school.upsert({
    where: { code: 'SCS' },
    update: {},
    create: {
      name: 'School of Computing Sciences',
      code: 'SCS',
    },
  });

  // 3. Departments
  const deptCommerce = await prisma.department.upsert({
    where: { code: 'COMM' },
    update: { schoolId: schoolMgmt.id },
    create: {
      name: 'Department of Commerce',
      code: 'COMM',
      shift: 'Shift I',
      schoolId: schoolMgmt.id,
    },
  });

  const deptCS = await prisma.department.upsert({
    where: { code: 'CS' },
    update: { schoolId: schoolSci.id },
    create: {
      name: 'Department of Computer Science',
      code: 'CS',
      shift: 'Shift I',
      schoolId: schoolSci.id,
    },
  });

  const deptMaths = await prisma.department.upsert({
    where: { code: 'MATH' },
    update: {},
    create: {
      name: 'Department of Mathematics',
      code: 'MATH',
      shift: 'Shift I',
    },
  });

  const deptEnglish = await prisma.department.upsert({
    where: { code: 'ENG' },
    update: {},
    create: {
      name: 'Department of English',
      code: 'ENG',
      shift: 'Shift II',
    },
  });

  // 4. Programmes
  const bcom = await prisma.programme.upsert({
    where: { code: 'BCOM-GEN' },
    update: {},
    create: {
      name: 'Bachelor of Commerce (B.Com)',
      code: 'BCOM-GEN',
      level: 'UG',
      departmentId: deptCommerce.id,
      shift: 'Shift I',
    },
  });

  const bscCS = await prisma.programme.upsert({
    where: { code: 'BSC-CS' },
    update: {},
    create: {
      name: 'B.Sc. Computer Science',
      code: 'BSC-CS',
      level: 'UG',
      departmentId: deptCS.id,
      shift: 'Shift I',
    },
  });

  // 5. Users for all 9 roles
  const usersToSeed = [
    {
      username: 'superadmin',
      name: 'Dr. System Administrator',
      email: 'admin@sjciqac.edu',
      role: 'SUPER_ADMIN',
    },
    {
      username: 'iqac_admin',
      name: 'Dr. S. Xavier (IQAC Coordinator)',
      email: 'iqac.coord@sjciqac.edu',
      role: 'IQAC_ADMIN',
    },
    {
      username: 'iqac_member',
      name: 'Prof. Mary Joseph (IQAC Member)',
      email: 'iqac.member@sjciqac.edu',
      role: 'IQAC_MEMBER',
    },
    {
      username: 'principal',
      name: 'Rev. Dr. Principal SJ',
      email: 'principal@sjciqac.edu',
      role: 'PRINCIPAL',
    },
    {
      username: 'school_dean',
      name: 'Dr. R. Sundaram (Dean Management)',
      email: 'dean.management@sjciqac.edu',
      role: 'SCHOOL_DEAN',
      schoolId: schoolMgmt.id,
    },
    {
      username: 'hod_commerce',
      name: 'Dr. A. Antony (HOD Commerce)',
      email: 'hod.commerce@sjciqac.edu',
      role: 'HOD',
      departmentId: deptCommerce.id,
    },
    {
      username: 'dept_coord',
      name: 'Prof. K. Charles (Commerce IQAC Coordinator)',
      email: 'coord.commerce@sjciqac.edu',
      role: 'DEPT_COORDINATOR',
      departmentId: deptCommerce.id,
    },
    {
      username: 'faculty_user',
      name: 'Dr. P. Ramesh (Assistant Professor)',
      email: 'ramesh.cs@sjciqac.edu',
      role: 'FACULTY',
      departmentId: deptCS.id,
    },
    {
      username: 'auditor',
      name: 'Dr. External NAAC Peer Auditor',
      email: 'auditor@naac.gov.in',
      role: 'VIEWER',
    },
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        password: hashedPassword,
        name: u.name,
        role: u.role,
        departmentId: u.departmentId || null,
        schoolId: u.schoolId || null,
      },
      create: {
        username: u.username,
        password: hashedPassword,
        name: u.name,
        email: u.email,
        role: u.role,
        departmentId: u.departmentId || null,
        schoolId: u.schoolId || null,
      },
    });
  }

  const iqacAdminUser = await prisma.user.findUnique({ where: { username: 'iqac_admin' } });

  // 6. Frameworks
  const frameworksData = [
    { code: 'NAAC', name: 'NAAC Accreditation Framework', description: 'National Assessment and Accreditation Council 7 Criteria' },
    { code: 'UGC', name: 'UGC Mandates & Quality Directives', description: 'University Grants Commission Regulatory Requirements' },
    { code: 'NIRF', name: 'NIRF Ranking Data', description: 'National Institutional Ranking Framework Parameters' },
    { code: 'NEP2020', name: 'National Education Policy 2020', description: 'NEP Implementation Guidelines' },
    { code: 'AISHE', name: 'AISHE Institutional Survey', description: 'All India Survey on Higher Education Data' },
    { code: 'ACADEMIC_AUDIT', name: 'Annual Academic & Administrative Audit', description: 'Internal & External Audit Parameters' },
    { code: 'IDP', name: 'Institutional Development Plan', description: 'Strategic Planning and Goals' },
    { code: 'INTERNAL', name: 'IQAC Internal Quality Goals', description: 'College Specific IQAC Benchmarks' },
  ];

  for (const fw of frameworksData) {
    await prisma.framework.upsert({
      where: { code: fw.code },
      update: { name: fw.name, description: fw.description },
      create: fw,
    });
  }

  const naacFw = await prisma.framework.findUnique({ where: { code: 'NAAC' } });
  const ugcFw = await prisma.framework.findUnique({ where: { code: 'UGC' } });

  // 7. Requirements
  const sampleRequirements = [
    {
      reqId: 'REQ-2025-001',
      title: 'Curriculum Revision & Learning Outcome Mapping',
      description: 'Submit revised course structures, PO/PSO/CO mappings, and Board of Studies (BoS) minutes for AY 2025-26.',
      category: 'Curricular Aspects',
      frameworkId: naacFw.id,
      criterion: 'Criterion 1: Curricular Aspects',
      subCriterion: '1.1 Curriculum Design and Development',
      sourceAuthority: 'NAAC Guidelines 2024',
      academicYearId: ay2526.id,
      responsibleDeptId: deptCommerce.id,
      priority: 'HIGH',
      startDate: new Date('2025-06-15'),
      dueDate: new Date('2025-10-31'),
      status: 'Approved',
      remarks: 'All BoS minutes verified and outcome mapping compliant.',
      requiredEvidence: 'BoS Minutes, Syllabus copy, PO-CO Matrix',
      complianceScore: 100.0,
      assignedMemberId: iqacAdminUser.id,
    },
    {
      reqId: 'REQ-2025-002',
      title: 'Faculty Training in MMTTC / NEP Orientation Programs',
      description: 'Minimum 50% faculty completion of UGC Malaviya Mission Teacher Training Programme (MMTTC) or approved FDPs.',
      category: 'Teaching-Learning & Evaluation',
      frameworkId: ugcFw.id,
      criterion: 'Criterion 2: Teaching-Learning and Evaluation',
      subCriterion: '2.4 Faculty Profile and Quality',
      sourceAuthority: 'UGC Mandate 2024',
      academicYearId: ay2526.id,
      responsibleDeptId: deptCS.id,
      priority: 'HIGH',
      startDate: new Date('2025-07-01'),
      dueDate: new Date('2025-11-15'),
      status: 'Correction Required',
      remarks: '2 Faculty certificates missing organizing authority seal.',
      requiredEvidence: 'Participation Certificates & MMTTC Logins',
      complianceScore: 50.0,
      assignedMemberId: iqacAdminUser.id,
    },
    {
      reqId: 'REQ-2025-003',
      title: 'Annual Department Academic & Administrative Audit (AAA)',
      description: 'Complete AAA self-evaluation report along with evidence for all 10 standard parameters.',
      category: 'Academic Audit',
      frameworkId: naacFw.id,
      criterion: 'Criterion 6: Governance, Leadership and Management',
      subCriterion: '6.5 Internal Quality Assurance System',
      sourceAuthority: 'IQAC Internal Directive',
      academicYearId: ay2526.id,
      responsibleDeptId: deptMaths.id,
      priority: 'MEDIUM',
      startDate: new Date('2025-08-01'),
      dueDate: new Date('2025-12-20'),
      status: 'Under Verification',
      remarks: 'Audit report submitted, awaiting peer team evaluation.',
      requiredEvidence: 'AAA Self-Evaluation Form, Dept Activity Register',
      complianceScore: 75.0,
      assignedMemberId: iqacAdminUser.id,
    },
    {
      reqId: 'REQ-2025-004',
      title: 'Student Progression & Placement Record Submission',
      description: 'Upload higher education admission proof and corporate placement offer letters for passed out batch.',
      category: 'Student Support & Progression',
      frameworkId: naacFw.id,
      criterion: 'Criterion 5: Student Support and Progression',
      subCriterion: '5.2 Student Progression',
      sourceAuthority: 'NAAC Manual',
      academicYearId: ay2526.id,
      responsibleDeptId: deptCommerce.id,
      priority: 'MEDIUM',
      startDate: new Date('2025-09-01'),
      dueDate: new Date('2025-12-31'),
      status: 'In Progress',
      remarks: 'Collection ongoing in placement cell.',
      requiredEvidence: 'Offer Letters, ID Cards of PG Admissions',
      complianceScore: 30.0,
      assignedMemberId: iqacAdminUser.id,
    },
  ];

  for (const req of sampleRequirements) {
    await prisma.requirements.upsert({
      where: { reqId: req.reqId },
      update: req,
      create: req,
    });
  }

  // 8. Dynamic Forms & Data Requests
  const sampleFields = [
    { id: 'f1', label: 'Program / Event Title', type: 'text', required: true },
    { id: 'f2', label: 'Event Category', type: 'dropdown', required: true, options: ['FDP', 'Conference', 'Seminar', 'Workshop', 'Extension Activity'] },
    { id: 'f3', label: 'Start Date', type: 'date', required: true },
    { id: 'f4', label: 'Number of Beneficiaries', type: 'number', required: true },
    { id: 'f5', label: 'Has Photo Evidence & Report?', type: 'yesno', required: true },
    { id: 'f6', label: 'Upload Complete Event Report (PDF)', type: 'fileUpload', required: true, allowedTypes: ['.pdf'], maxMb: 10 },
  ];

  const dynForm = await prisma.dynamicForm.create({
    data: {
      title: 'Standard Department Activity & Evidence Form',
      description: 'IQAC standard data collection form for department organized seminars, FDPs and extension activities.',
      fieldsJson: JSON.stringify(sampleFields),
      createdById: iqacAdminUser.id,
    },
  });

  const dataReq = await prisma.dataRequest.upsert({
    where: { reqNumber: 'DR-2025-010' },
    update: {},
    create: {
      reqNumber: 'DR-2025-010',
      title: 'Quarterly Department Activities & Faculty Training Data',
      instructions: 'Please enter all events conducted during Q1/Q2 and attach invitation, attendance, report, and photos.',
      academicYearId: ay2526.id,
      targetDepartments: JSON.stringify([deptCommerce.id, deptCS.id, deptMaths.id]),
      deadline: new Date('2025-11-30'),
      assignedMemberId: iqacAdminUser.id,
      status: 'ACTIVE',
      formId: dynForm.id,
    },
  });

  // 9. Faculty Seed Data
  const facultyMembers = [
    {
      facultyIdNumber: 'FAC-1001',
      name: 'Dr. A. Antony',
      departmentId: deptCommerce.id,
      designation: 'Professor & HOD',
      appointmentNature: 'Regular',
      category: 'Aided',
      dateOfJoining: new Date('2010-06-15'),
      qualification: 'Ph.D., M.Com, M.Phil',
      specialization: 'Corporate Accounting & Taxation',
      isPhd: true,
      experienceYears: 15.5,
      email: 'hod.commerce@sjciqac.edu',
      phone: '9443100001',
      academicYearId: ay2526.id,
    },
    {
      facultyIdNumber: 'FAC-1002',
      name: 'Prof. K. Charles',
      departmentId: deptCommerce.id,
      designation: 'Assistant Professor',
      appointmentNature: 'Regular',
      category: 'Management',
      dateOfJoining: new Date('2018-07-01'),
      qualification: 'M.Com, NET',
      specialization: 'Banking & Financial Markets',
      isPhd: false,
      experienceYears: 7.0,
      email: 'coord.commerce@sjciqac.edu',
      phone: '9443100002',
      academicYearId: ay2526.id,
    },
    {
      facultyIdNumber: 'FAC-1003',
      name: 'Dr. P. Ramesh',
      departmentId: deptCS.id,
      designation: 'Associate Professor',
      appointmentNature: 'Regular',
      category: 'Aided',
      dateOfJoining: new Date('2014-08-10'),
      qualification: 'Ph.D., M.Tech',
      specialization: 'Artificial Intelligence & Data Mining',
      isPhd: true,
      experienceYears: 11.0,
      email: 'ramesh.cs@sjciqac.edu',
      phone: '9443100003',
      academicYearId: ay2526.id,
    },
  ];

  for (const fac of facultyMembers) {
    const createdFac = await prisma.faculty.upsert({
      where: { facultyIdNumber: fac.facultyIdNumber },
      update: fac,
      create: fac,
    });

    // Add Faculty Training
    await prisma.facultyTraining.create({
      data: {
        facultyId: createdFac.id,
        programmeName: 'MMTTC Orientation on Outcome Based Education & AI Tools',
        organizer: 'UGC Malaviya Mission Teacher Training Centre',
        category: 'MMTTC',
        startDate: new Date('2025-07-10'),
        endDate: new Date('2025-07-17'),
        durationDays: 7,
        academicYearId: ay2526.id,
      },
    });
  }

  // 10. Student Data
  await prisma.studentData.create({
    data: {
      academicYearId: ay2526.id,
      departmentId: deptCommerce.id,
      programmeId: bcom.id,
      shift: 'Shift I',
      totalStudents: 360,
      maleStudents: 190,
      femaleStudents: 170,
      otherStudents: 0,
      categoryBreakdownJson: JSON.stringify({ SC: 45, ST: 12, OBC: 180, General: 123 }),
      passedOutCount: 118,
      progressionCount: 78,
    },
  });

  await prisma.studentData.create({
    data: {
      academicYearId: ay2526.id,
      departmentId: deptCS.id,
      programmeId: bscCS.id,
      shift: 'Shift I',
      totalStudents: 240,
      maleStudents: 140,
      femaleStudents: 100,
      otherStudents: 0,
      categoryBreakdownJson: JSON.stringify({ SC: 30, ST: 8, OBC: 130, General: 72 }),
      passedOutCount: 75,
      progressionCount: 52,
    },
  });

  // 11. Faculty-Student Ratio (FSR)
  await prisma.facultyStudentRatio.create({
    data: {
      academicYearId: ay2526.id,
      departmentId: deptCommerce.id,
      facultyCount: 18,
      studentCount: 360,
      fullTimeFacultyCount: 18,
      ratioValue: 20.0, // 1:20
      customFormula: 'students / max(fullTimeFaculty, 1)',
    },
  });

  // 12. Activities & Evidence Checklist
  await prisma.activity.upsert({
    where: { activityNumber: 'ACT-2025-001' },
    update: {},
    create: {
      activityNumber: 'ACT-2025-001',
      departmentId: deptCommerce.id,
      academicYearId: ay2526.id,
      title: 'National Seminar on Digital Accounting & Fintech Innovations',
      type: 'Seminar',
      startDate: new Date('2025-08-22'),
      endDate: new Date('2025-08-23'),
      durationHours: 12.0,
      coordinatorName: 'Prof. K. Charles',
      objectives: 'Expose students to modern GST software, Blockchain ledger accounting, and AI audit tools.',
      outcomes: '250+ commerce students certified in digital accounting tools.',
      participantCount: 260,
      beneficiariesCount: 260,
      sdgGoal: 'SDG 4: Quality Education & Decent Work',
      categoryType: 'Academic',
      invitationFileUrl: '/uploads/demo/invitation_act_001.pdf',
      reportFileUrl: '/uploads/demo/report_act_001.pdf',
      attendanceFileUrl: '/uploads/demo/attendance_act_001.pdf',
      photosFileUrl: '/uploads/demo/photos_act_001.pdf',
      feedbackFileUrl: '/uploads/demo/feedback_act_001.pdf',
      certsFileUrl: '/uploads/demo/certs_act_001.pdf',
      evidenceStatus: 'Complete',
    },
  });

  // 13. UGC / NEP Compliance Seed Data
  const ugcItems = [
    { requirementName: 'Section 2(f) & 12B Status Maintenance', category: 'UGC', sourceAuthority: 'UGC Act 1956', status: 'Compliant', responsiblePerson: 'Principal', remarks: 'Recognition valid & confirmed.' },
    { requirementName: 'AISHE Annual Institutional Survey Submission', category: 'UGC', sourceAuthority: 'Ministry of Education', status: 'Compliant', responsiblePerson: 'IQAC Coordinator', remarks: 'DCF-II uploaded for AY 2024-25.' },
    { requirementName: 'Public Self-Disclosure Mandate (UGC UTSAH)', category: 'UGC', sourceAuthority: 'UGC Public Notice 2023', status: 'Partially Compliant', responsiblePerson: 'Webmaster / IQAC', remarks: 'Fee structure & Accreditation certificates published; audit report update pending.' },
    { requirementName: 'Statutory Students Grievance Redressal Committee & Ombudsperson', category: 'UGC', sourceAuthority: 'UGC SGRC Regulations 2023', status: 'Compliant', responsiblePerson: 'Dean Student Affairs', remarks: 'Ombudsperson appointed and public notification posted.' },
    { requirementName: 'Indian Knowledge Systems (IKS) Course Integration', category: 'NEP', sourceAuthority: 'NEP 2020 Curriculum Framework', status: 'Compliant', responsiblePerson: 'Dean Academics', remarks: '2 credit IKS value-added course integrated across all UG programmes.' },
    { requirementName: 'Professor of Practice (PoP) Appointments', category: 'NEP', sourceAuthority: 'UGC PoP Guidelines', status: 'Under Review', responsiblePerson: 'HOD Commerce & CS', remarks: 'Shortlisted 3 industry practitioners for guest faculty appointments.' },
  ];

  for (const item of ugcItems) {
    await prisma.ugcNepCompliance.create({
      data: item,
    });
  }

  // 14. Meetings & Action Taken Report (ATR)
  const meeting = await prisma.meeting.upsert({
    where: { meetingNumber: 'IQAC-MTG-2025-01' },
    update: {},
    create: {
      meetingNumber: 'IQAC-MTG-2025-01',
      title: 'First Executive IQAC Committee Meeting AY 2025-26',
      date: new Date('2025-07-05'),
      time: '10:30 AM',
      venue: 'IQAC Conference Board Room',
      agenda: 'Review of NAAC Criteria readiness, AAA Schedule, FSR calculations, and UGC compliance status.',
      minutes: 'Resolved to conduct internal mock audits by October and launch online dynamic data portal for all departments.',
      status: 'Completed',
    },
  });

  await prisma.meetingActionItem.create({
    data: {
      meetingId: meeting.id,
      resolution: 'Resolution 4: Mandate 100% faculty training under MMTTC before December 2025.',
      actionRequired: 'Issue circular to HODs and track weekly completion via portal.',
      responsibleUserId: iqacAdminUser.id,
      departmentId: deptCommerce.id,
      deadline: new Date('2025-12-15'),
      actionTaken: 'Circular issued; 12 faculty members enrolled in upcoming batch.',
      status: 'In Progress',
    },
  });

  // 15. System Settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {
      institutionName: "St. Joseph's College (Autonomous)",
      academicYearCurrent: '2025-26',
      formulaFsr: 'students / max(fullTimeFaculty, 1)',
    },
    create: {
      id: 'default',
      institutionName: "St. Joseph's College (Autonomous)",
      academicYearCurrent: '2025-26',
      formulaFsr: 'students / max(fullTimeFaculty, 1)',
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
