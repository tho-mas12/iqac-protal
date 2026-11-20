const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// MQC list for AY 2026-2027
const MQC_ROSTER = [
  { dept: 'Botany', names: ['Dr M. Bastin Churchill', 'Dr G. Chelladurai', 'Dr. M. Bastin Churchill', 'Dr. G. Chelladurai'] },
  { dept: 'Biochemistry', names: ['Mr T. Antony Diwakar Chandran', 'Dr P. G. Geegi', 'Mr. T. Antony Diwakar Chandran', 'Dr. P. G. Geegi'] },
  { dept: 'Biotechnology', names: ['Dr J. Arutchelvi', 'Dr A. Asha Monica', 'Dr. J. Arutchelvi', 'Dr. A. Asha Monica'] },
  { dept: 'Commerce', names: ['Dr A. Sahayaraj Alexander', 'Dr Dennis Edward Fernando', 'Mr V. Perumal', 'Dr A. Ignatius', 'Dr. A. Sahayaraj Alexander', 'Dr. Dennis Edward Fernando', 'Mr. V. Perumal', 'Dr. A. Ignatius'] },
  { dept: 'Commerce Business Analytics', names: ['Dr P. Navomi Nithila', 'Dr. P. Navomi Nithila'] },
  { dept: 'Commerce CA', names: ['Dr D. John Prabakaran', 'Dr R. Arul', 'Dr. D. John Prabakaran', 'Dr. R. Arul'] },
  { dept: 'Commerce Computer Application', names: ['Dr D. John Prabakaran', 'Dr R. Arul', 'Dr. D. John Prabakaran', 'Dr. R. Arul'] },
  { dept: 'Commerce Honours', names: ['Dr I. Jerry Richards', 'Dr G. Udhayaraj', 'Dr. I. Jerry Richards', 'Dr. G. Udhayaraj'] },
  { dept: 'Commerce Strategic Finance', names: ['Dr V. Sagaya Pricilla', 'Dr. V. Sagaya Pricilla'] },
  { dept: 'Artificial Intelligence', names: ['Dr J. Hirudhaya Mary Asha', 'Mr M. Jesudoss', 'Dr. J. Hirudhaya Mary Asha', 'Mr. M. Jesudoss'] },
  { dept: 'Software Development & System Administration', names: ['Dr S. Banumathi', 'Dr V. A. Jane', 'Dr. S. Banumathi', 'Dr. V. A. Jane'] },
  { dept: 'B Voc Software Development & System Administration', names: ['Dr S. Banumathi', 'Dr V. A. Jane', 'Dr. S. Banumathi', 'Dr. V. A. Jane'] },
  { dept: 'Computer Science', names: ['Dr George Gabriel Richard Roy', 'Dr K. Maheshwaran', 'Dr S. Thulasi Bharathi', 'Dr S. Sathyapriya', 'Dr. George Gabriel Richard Roy', 'Dr. K. Maheshwaran', 'Dr. S. Thulasi Bharathi', 'Dr. S. Sathyapriya'] },
  { dept: 'Data Science', names: ['Dr M. Kriushanth', 'Dr A. Beatrice Dorothy', 'Dr. M. Kriushanth', 'Dr. A. Beatrice Dorothy'] },
  { dept: 'Information Technology', names: ['Dr B. Mangai Begum', 'Dr D. Richard', 'Dr. B. Mangai Begum', 'Dr. D. Richard'] },
  { dept: 'Mathematics', names: ['Dr R. Lenin', 'Dr J. Carmel Pushpa Raj', 'Dr S. Sahaya Jernith', 'Dr A. Arul Xavier', 'Dr. R. Lenin', 'Dr. J. Carmel Pushpa Raj', 'Dr. S. Sahaya Jernith', 'Dr. A. Arul Xavier'] },
  { dept: 'Statistics', names: ['Dr. J. Glorypersial', 'Dr J. Glorypersial'] },
  { dept: 'English', names: ['Dr M. Amutha', 'Mr A. Nepolian', 'Ms L. Virgin Francy', 'Ms R. Rekkani', 'Dr. M. Amutha', 'Mr. A. Nepolian', 'Ms. L. Virgin Francy', 'Ms. R. Rekkani'] },
  { dept: 'French', names: ['Ms. M. Mohanalakshmi', 'Ms M. Mohanalakshmi'] },
  { dept: 'Hindi', names: ['Dr. S. Sreedevi', 'Dr S. Sreedevi'] },
  { dept: 'History', names: ['Dr K. Lingammal', 'Mr M.R. Gowtham Rajan', 'Dr. K. Lingammal', 'Mr. M.R. Gowtham Rajan'] },
  { dept: 'Sanskrit', names: ['Dr. M. S. Madhavachari', 'Dr M. S. Madhavachari'] },
  { dept: 'Tamil', names: ['Dr J. Saleth', 'Dr L. Charles', 'Dr M. Dhanalakshmi', 'Dr J. Stella Mary', 'Dr. J. Saleth', 'Dr. L. Charles', 'Dr. M. Dhanalakshmi', 'Dr. J. Stella Mary'] },
  { dept: 'BBA', names: ['Mr D. Rinaldo De David', 'Mr J. Inigo Papu Vinodhan', 'Mr. D. Rinaldo De David', 'Mr. J. Inigo Papu Vinodhan'] },
  { dept: 'MBA', names: ['Dr A. Pappurajan', 'Dr. A. Pappurajan'] },
  { dept: 'Counselling Psychology', names: ['Dr V. Suganthi', 'Ms F. M. Christeeba', 'Dr. V. Suganthi', 'Ms. F. M. Christeeba'] },
  { dept: 'Economics', names: ['Dr A. Justin Thiraviam', 'Ms J. Jayashree Naiken', 'Dr. A. Justin Thiraviam', 'Ms. J. Jayashree Naiken'] },
  { dept: 'HRM', names: ['Dr V. Udhaya Geetha', 'Dr J. Vincent Xavier', 'Dr. V. Udhaya Geetha', 'Dr. J. Vincent Xavier'] },
  { dept: 'Physical Education', names: ['Dr P. Ramesh', 'Dr. P. Ramesh'] },
  { dept: 'Visual Communication', names: ['Ms K. Ramya', 'Dr E.V. Prabha', 'Ms. K. Ramya', 'Dr. E.V. Prabha'] },
  { dept: 'Chemistry', names: ['Dr S. Mangalaraj', 'Dr A. Arun Joseph Rosario', 'Dr P. Arockiadoss', 'Dr. S. Mangalaraj', 'Dr. A. Arun Joseph Rosario', 'Dr. P. Arockiadoss'] },
  { dept: 'Electronics', names: ['Dr S. Mary Margaret', 'Dr K. Priyadharshini', 'Dr. S. Mary Margaret', 'Dr. K. Priyadharshini'] },
  { dept: 'Physics', names: ['Dr P. Christuraj', 'Dr. H. Joy Prabu', 'Dr. A. Alexandar', 'Ms. B. Mary Dayana', 'Dr. S. Rex Rosario', 'Dr H. Joy Prabu', 'Dr A. Alexandar', 'Ms B. Mary Dayana', 'Dr S. Rex Rosario'] }
];

function normalizeName(str) {
  return (str || '').toLowerCase().replace(/[^a-z]/g, '');
}

function isMqcMember(deptName, facName) {
  const normFac = normalizeName(facName);
  for (const m of MQC_ROSTER) {
    for (const name of m.names) {
      const normRoster = normalizeName(name);
      if (normFac === normRoster || (normFac.length > 5 && normRoster.includes(normFac)) || (normRoster.length > 5 && normFac.includes(normRoster))) {
        return true;
      }
    }
  }
  return false;
}

async function seed() {
  console.log('--- Starting Unified Master Seeding for Local IQAC Portal ---');

  // Clear existing records
  await prisma.invitationHistory.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.dynamicSubmission.deleteMany();
  await prisma.dynamicField.deleteMany();
  await prisma.dynamicCampaign.deleteMany();
  await prisma.coursePlanRecord.deleteMany();
  await prisma.aaaDepartmentRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.systemSettings.deleteMany();

  // 1. System Settings
  await prisma.systemSettings.create({
    data: {
      id: 'default',
      whatsappSenderNumber: '9626806328',
      whatsappReceiverNumber: '7418671366',
      whatsappEnabled: true,
      announcementText: 'Welcome to the Centralized IQAC Portal (AY 2026-2027). Course Plan submission & TLE documentation is open.',
      submissionsEnabled: true,
    }
  });

  const defaultPasswordHash = await bcrypt.hash('123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const directorPasswordHash = await bcrypt.hash('director123', 10);

  // 2. Core Administrative Accounts
  await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPasswordHash,
      plainPassword: 'admin123',
      name: 'IQAC Administrator',
      role: 'ADMIN',
      isHead: false,
      isMqc: false,
      isPasswordChanged: true,
    }
  });

  await prisma.user.create({
    data: {
      username: 'director',
      password: directorPasswordHash,
      plainPassword: 'director123',
      name: 'Dr. S. Albert Rabara (IQAC Director)',
      role: 'DIRECTOR',
      isHead: false,
      isMqc: false,
      isPasswordChanged: true,
    }
  });

  await prisma.user.create({
    data: {
      username: 'staff',
      password: await bcrypt.hash('staff123', 10),
      plainPassword: 'staff123',
      name: 'Mr. Ajay James (IQAC Staff)',
      role: 'STAFF',
      isHead: false,
      isMqc: false,
      isPasswordChanged: true,
    }
  });

  // 3. Departments Data
  const departmentsData = [
    { name: 'Artificial Intelligence', code: 'AI_S2', shift: 'Shift II', folderId: 'local_AI' },
    { name: 'Biochemistry', code: 'BIOCHEM_S2', shift: 'Shift II', folderId: 'local_Biochemistry' },
    { name: 'Biotechnology', code: 'BIOTECH_S2', shift: 'Shift II', folderId: 'local_Biotechnology' },
    { name: 'Botany', code: 'BOT_S1', shift: 'Shift I', folderId: 'local_Botany' },
    { name: 'BBA', code: 'BBA_S2', shift: 'Shift II', folderId: 'local_BBA' },
    { name: 'Chemistry', code: 'CHEM_S1', shift: 'Shift I', folderId: 'local_Chemistry' },
    { name: 'Commerce', code: 'COM_S1', shift: 'Shift I', folderId: 'local_Commerce' },
    { name: 'Commerce Business Analytics', code: 'BUS_S2', shift: 'Shift II', folderId: 'local_Commerce_BA' },
    { name: 'Commerce Computer Application', code: 'COMCA_S2', shift: 'Shift II', folderId: 'local_Commerce_CA' },
    { name: 'Commerce Honours', code: 'COMCR_S2', shift: 'Shift II', folderId: 'local_Commerce_Honours' },
    { name: 'Commerce Strategic Finance', code: 'COMSF_S2', shift: 'Shift II', folderId: 'local_Commerce_SF' },
    { name: 'Computer Science', code: 'CS_S1', shift: 'Shift I', folderId: 'local_Computer_Science' },
    { name: 'Counselling Psychology', code: 'COUNS_S2', shift: 'Shift II', folderId: 'local_Counselling_Psychology' },
    { name: 'Data Science', code: 'DS_S2', shift: 'Shift II', folderId: 'local_Data_Science' },
    { name: 'Economics', code: 'ECO_S1', shift: 'Shift I', folderId: 'local_Economics' },
    { name: 'Electronics', code: 'ELEC_S1', shift: 'Shift I', folderId: 'local_Electronics' },
    { name: 'English', code: 'ENG_S1', shift: 'Shift I', folderId: 'local_English' },
    { name: 'French', code: 'FREN_S1', shift: 'Shift I', folderId: 'local_French' },
    { name: 'Hindi', code: 'HIN_S1', shift: 'Shift I', folderId: 'local_Hindi' },
    { name: 'History', code: 'HIS_S1', shift: 'Shift I', folderId: 'local_History' },
    { name: 'HRM', code: 'HRM_S2', shift: 'Shift II', folderId: 'local_HRM' },
    { name: 'Information Technology', code: 'IT_S2', shift: 'Shift II', folderId: 'local_IT' },
    { name: 'Mathematics', code: 'MAT_S1', shift: 'Shift I', folderId: 'local_Mathematics' },
    { name: 'MBA', code: 'MBA_S2', shift: 'Shift II', folderId: 'local_MBA' },
    { name: 'Physical Education', code: 'PHY_EDU', shift: 'Shift I', folderId: 'local_Physical_Education' },
    { name: 'Physics', code: 'PHY_S1', shift: 'Shift I', folderId: 'local_Physics' },
    { name: 'Sanskrit', code: 'SAN_S1', shift: 'Shift I', folderId: 'local_Sanskrit' },
    { name: 'Software Development & System Administration', code: 'SDSA_S2', shift: 'Shift II', folderId: 'local_SDSA' },
    { name: 'Statistics', code: 'STAT_S1', shift: 'Shift I', folderId: 'local_Statistics' },
    { name: 'Tamil', code: 'TAM_S1', shift: 'Shift I', folderId: 'local_Tamil' },
    { name: 'Visual Communication', code: 'VISCOM_S2', shift: 'Shift II', folderId: 'local_Viscom' },
  ];

  const deptMap = {};
  for (const d of departmentsData) {
    const createdDept = await prisma.department.create({
      data: {
        name: d.name,
        code: d.code,
        shift: d.shift,
        driveFolderId: d.folderId,
      }
    });
    deptMap[d.name.toLowerCase()] = createdDept;
    
    // Also create department AAA record
    await prisma.aaaDepartmentRecord.create({
      data: {
        departmentId: createdDept.id,
        departmentCode: d.code,
        departmentName: d.name,
        status: 'in_progress',
        academicYear: '2026 - 2027',
        isLocked: false,
      }
    });
  }

  // 4. Load HOD List
  const hodListPath = path.join(__dirname, '../Course Plan/data/hod_list.json');
  let hodList = [];
  if (fs.existsSync(hodListPath)) {
    hodList = JSON.parse(fs.readFileSync(hodListPath, 'utf8'));
  }

  // 5. Load Faculty Credentials from CSV
  const csvPath = path.join(__dirname, '../Faculty_ERP_Credentials.csv');
  let facultyCount = 0;
  let hodCount = 0;
  let mqcCount = 0;

  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      if (parts.length < 5) continue;

      const code = parts[1]?.trim();
      const rawName = parts[2]?.trim();
      const deptRaw = parts[3]?.trim().replace(/^Dept\.\s*of\s*/i, '');
      const plainPw = parts[5]?.trim() || '123';

      if (!code || !rawName) continue;

      // Find matching department
      let deptRecord = null;
      for (const [k, v] of Object.entries(deptMap)) {
        if (deptRaw.toLowerCase().includes(k) || k.includes(deptRaw.toLowerCase())) {
          deptRecord = v;
          break;
        }
      }

      // Check if HOD
      let isHead = false;
      for (const hod of hodList) {
        if (hod.faculty_id && hod.faculty_id.trim().toUpperCase() === code.toUpperCase()) {
          isHead = true;
          break;
        }
        if (normalizeName(hod.faculty_name) === normalizeName(rawName)) {
          isHead = true;
          break;
        }
      }

      // Check if MQC (Faculty cannot be both HOD and MQC, except single-faculty)
      let isMqc = false;
      if (!isHead || ['french', 'hindi', 'sanskrit'].some(s => (deptRaw || '').toLowerCase().includes(s))) {
        if (isMqcMember(deptRaw, rawName)) {
          isMqc = true;
        }
      }

      const pwHash = await bcrypt.hash(plainPw, 10);

      try {
        await prisma.user.create({
          data: {
            username: code.toLowerCase(),
            password: pwHash,
            plainPassword: plainPw,
            name: rawName,
            role: 'FACULTY',
            staffCode: code,
            departmentId: deptRecord ? deptRecord.id : null,
            departmentName: deptRecord ? deptRecord.name : deptRaw,
            isHead: isHead,
            isMqc: isMqc,
            email: `${code.toLowerCase()}@mail.sjctni.edu`,
          }
        });

        facultyCount++;
        if (isHead) hodCount++;
        if (isMqc) mqcCount++;
      } catch (err) {
        // Skip duplicates if any
      }
    }
  }

  console.log(`Seeded ${facultyCount} Faculty members (${hodCount} HODs, ${mqcCount} MQC members).`);

  // 6. Seed Sample Dynamic Campaigns & Fields (Created by Admin)
  const campaign1 = await prisma.dynamicCampaign.create({
    data: {
      title: 'National & International Awards / Fellowships AY 2026-2027',
      description: 'Submit all national, international, state, or institutional awards, honorary doctorates, or fellowships received during the current academic year for Annual Academic Audit (Attribute II) and Performance Appraisal.',
      targetRole: 'ALL_FACULTY',
      academicYear: '2026 - 2027',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      isActive: true,
    }
  });

  await prisma.dynamicField.createMany({
    data: [
      {
        campaignId: campaign1.id,
        fieldName: 'award_name',
        fieldLabel: 'Award / Honor / Fellowship Name',
        fieldType: 'TEXT',
        placeholder: 'e.g., Best Scientist Award, Fellowship of Academy',
        isRequired: true,
        orderIndex: 1,
      },
      {
        campaignId: campaign1.id,
        fieldName: 'awarding_body',
        fieldLabel: 'Awarding Body / Organization',
        fieldType: 'TEXT',
        placeholder: 'e.g., Indian Academy of Sciences, DST, UGC',
        isRequired: true,
        orderIndex: 2,
      },
      {
        campaignId: campaign1.id,
        fieldName: 'award_level',
        fieldLabel: 'Recognition Level',
        fieldType: 'SELECT',
        optionsJson: JSON.stringify(['International', 'National', 'State', 'University / Regional', 'Institutional']),
        isRequired: true,
        orderIndex: 3,
      },
      {
        campaignId: campaign1.id,
        fieldName: 'award_date',
        fieldLabel: 'Date of Conferment',
        fieldType: 'DATE',
        isRequired: true,
        orderIndex: 4,
      },
      {
        campaignId: campaign1.id,
        fieldName: 'citation_or_cash',
        fieldLabel: 'Cash Prize / Citation Details',
        fieldType: 'TEXT',
        placeholder: 'e.g., Rs. 50,000 cash prize & Gold Medal',
        isRequired: false,
        orderIndex: 5,
      },
      {
        campaignId: campaign1.id,
        fieldName: 'certificate_file',
        fieldLabel: 'Upload Proof / Certificate (PDF/Image)',
        fieldType: 'FILE',
        isRequired: false,
        orderIndex: 6,
      }
    ]
  });

  const campaign2 = await prisma.dynamicCampaign.create({
    data: {
      title: 'SWAYAM / NPTEL / Coursera MOOC Course Certifications AY 2026-2027',
      description: 'Report completed online certified courses (4/8/12 weeks) for NAAC Attribute I & Performance Appraisal Credit.',
      targetRole: 'ALL_FACULTY',
      academicYear: '2026 - 2027',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Due in 14 days
      isActive: true,
    }
  });

  await prisma.dynamicField.createMany({
    data: [
      {
        campaignId: campaign2.id,
        fieldName: 'course_title',
        fieldLabel: 'Course Title',
        fieldType: 'TEXT',
        placeholder: 'e.g., Introduction to Machine Learning',
        isRequired: true,
        orderIndex: 1,
      },
      {
        campaignId: campaign2.id,
        fieldName: 'platform',
        fieldLabel: 'Platform / Host Institute',
        fieldType: 'SELECT',
        optionsJson: JSON.stringify(['NPTEL (IIT Madras)', 'SWAYAM', 'Coursera', 'edX', 'Other']),
        isRequired: true,
        orderIndex: 2,
      },
      {
        campaignId: campaign2.id,
        fieldName: 'duration_weeks',
        fieldLabel: 'Course Duration (Weeks)',
        fieldType: 'NUMBER',
        placeholder: 'e.g., 8',
        isRequired: true,
        orderIndex: 3,
      },
      {
        campaignId: campaign2.id,
        fieldName: 'score_percentage',
        fieldLabel: 'Final Exam Score (%) / Grade',
        fieldType: 'TEXT',
        placeholder: 'e.g., 88% (Elite + Silver)',
        isRequired: true,
        orderIndex: 4,
      }
    ]
  });

  // 7. Seed Sample Course Plans & TLE Practices
  const csDept = deptMap['computer science'];
  if (csDept) {
    const csFaculty = await prisma.user.findFirst({
      where: { departmentId: csDept.id, role: 'FACULTY' }
    });

    if (csFaculty) {
      await prisma.coursePlanRecord.create({
        data: {
          facultyId: csFaculty.id,
          facultyName: csFaculty.name,
          staffCode: csFaculty.staffCode,
          departmentName: csDept.name,
          courseCode: '21UCS4102',
          courseTitle: 'Object Oriented Programming using Java',
          programme: 'B.Sc. Computer Science',
          semester: 'Even',
          academicYear: '2026 - 2027',
          status: 'Submitted',
          hodStatus: 'Approved',
          tlPracticesJson: JSON.stringify({
            innovativeMethods: ['Flipped Classroom', 'Peer-Assisted Coding', 'Problem-Based Learning'],
            ictTools: ['Google Classroom', 'GitHub Classroom', 'Smart Board LCD'],
            eContentLinks: ['https://sjc-lms.edu/java-module-1', 'https://youtube.com/watch?v=sjc_java_unit2'],
            assessmentMethods: ['Continuous Internal Assessment (CIA)', 'Coding Lab Sprint', 'Bloom-aligned MCQ Quiz']
          }),
          unitsJson: JSON.stringify([
            { unit: 'Unit I', title: 'Java Fundamentals & OOP Concepts', hours: 15, bloomsLevel: 'K1, K2' },
            { unit: 'Unit II', title: 'Inheritance, Interfaces & Packages', hours: 15, bloomsLevel: 'K2, K3' },
            { unit: 'Unit III', title: 'Exception Handling & Multithreading', hours: 15, bloomsLevel: 'K3, K4' },
            { unit: 'Unit IV', title: 'Java Collections Framework', hours: 15, bloomsLevel: 'K4, K5' },
            { unit: 'Unit V', title: 'GUI Programming with JavaFX & JDBC', hours: 15, bloomsLevel: 'K5, K6' }
          ])
        }
      });

      // Also create sample Invitation uploaded by this faculty member
      await prisma.invitation.create({
        data: {
          programTitle: 'National Seminar on Quantum Computing and AI Frontiers 2026',
          departmentId: csDept.id,
          userId: csFaculty.id,
          facultyName: csFaculty.name,
          staffCode: csFaculty.staffCode,
          shift: 'Shift I',
          category: 'Seminar',
          fromDate: new Date('2026-12-10'),
          toDate: new Date('2026-12-11'),
          fileName: 'Quantum_AI_National_Seminar_Brochure.pdf',
          fileSize: 1024500,
          mimeType: 'application/pdf',
          status: 'APPROVED',
          approvedAt: new Date(),
          checkLogo: true,
          checkTitle: true,
          checkHeaders: true,
          checkOthers: true,
          directorRemarks: 'Verified and approved by IQAC. Excellent theme aligning with Autonomous Curriculum guidelines.',
        }
      });
    }
  }

  console.log('--- Unified Local Seeding Completed Successfully! ---');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
