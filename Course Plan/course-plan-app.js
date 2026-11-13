// Course Plan Full Application (Faculty, HOD & IQAC Admin)
// St. Joseph's College (Autonomous), Tiruchirappalli - IQAC
// Academic Year 2026-2027 (Even Semester)

class CoursePlanApp {
  static LEARNING_ACTIVITIES = [
    'Quizzes (MCQs, Short Answer)',
    'Class Polls / Clicker Questions',
    'Reflective Journals / Learning Logs',
    'Think-Pair-Share',
    'Concept Maps',
    'Exit Tickets / Minute Papers',
    'In-class Exercises / Problem-solving',
    'Group Discussions / Seminars',
    'Draft Submissions',
    'Term Papers / Essays',
    'Projects (Individual/Group)',
    'Lab Reports / Practical Exams',
    'Presentations / Viva Voce',
    'Capstone Projects / Theses',
    'Case Study Analysis',
    'Portfolios (Print or Digital)',
    'Open-Book Exams',
    'Peer Assessment',
    'Self-Assessment',
    'Role Plays / Simulations',
    'Infographics / Visual Projects',
    'Blogs / Podcasts / Digital Narratives',
    'Community-Based Learning Reports',
    'Gamified Assessments / Interactive Quests',
    'Other:'
  ];

  static TEACHING_METHODOLOGIES = [
    'Lecture-based Learning',
    'Experiential Learning',
    'Problem-Based Learning (PBL)',
    'Case-Based Learning',
    'Collaborative & Cooperative Learning',
    'Flipped Classroom',
    'Inquiry-Based Learning',
    'Socratic Dialogue / Critical Pedagogy',
    'Project-Based Learning',
    'Service Learning',
    'Studio / Workshop-Based Learning',
    'Role Play and Dramatization',
    'Peer Teaching and Evaluation',
    'Differentiated Instruction',
    'Data-Driven Instruction',
    'Other:'
  ];

  static LEARNING_RESOURCES = [
    'Text Book / Study Material',
    'Reference Book / Standard Reference',
    'PPT / Interactive Lecture Slides',
    'JosTEL LMS / E-Content / Moodle',
    'NPTEL / SWAYAM / Coursera MOOCs',
    'Research Papers / Journal Articles',
    'Lab Manual / Simulation Software',
    'Web Links / Online Repositories',
    'Other:'
  ];

  static TL_APPROACHES = [
    'Lecture-based Learning',
    'Experiential Learning',
    'Problem-Based Learning (PBL)',
    'Case - Based Learning',
    'Collaborative & Cooperative Learning',
    'Flipped Classroom',
    'Inquiry-Based Learning',
    'Socratic Dialogue / Critical Pedagogy',
    'Project-Based Learning',
    'Service Learning',
    'Studio / Workshop-Based Learning',
    'Role Play and Dramatization',
    'Peer Teaching and Evaluation',
    'Differentiated Instruction',
    'Data-Driven Instruction',
    'Other'
  ];

  static TL_ASSESSMENT_COMPONENTS = [
    'Quizzes (MCQs, Short Answer)',
    'Class Polls / Clicker Questions',
    'Reflective Journals / Learning Logs',
    'Think-Pair-Share',
    'Concept Maps',
    'Exit Tickets / Minute Papers',
    'In-class Exercises / Problem-solving',
    'Group Discussions / Seminars',
    'Draft Submissions',
    'End-Semester Exams',
    'Mid-Semester Tests',
    'Term Papers / Essays',
    'Projects (Individual/Group)',
    'Lab Reports / Practical Exams',
    'Presentations / Viva Voce',
    'Capstone Projects / Theses',
    'Case Study Analysis',
    'Portfolios (Print or Digital)',
    'Open-Book Exams',
    'Peer Assessment',
    'Self-Assessment',
    'Role Plays / Simulations',
    'Infographics / Visual Projects',
    'Blogs / Podcasts / Digital Narratives',
    'Community-Based Learning Reports',
    'Gamified Assessments / Interactive Quests',
    'Other'
  ];


  constructor() {
    this.departments = [];
    this.selectedDept = localStorage.getItem('CP_SELECTED_DEPT') || 'Computer Science';
    this.currentUser = null; // null (Faculty/Public), { role: 'faculty', ... }, { role: 'hod', ... }, { role: 'admin' }
    this.plans = [];
    this.activePlan = null;
    this.viewMode = 'login'; // Display login page by default when browsing
    this.activeFormTab = 'part1'; // 'part1' | 'part2' | 'part3' | 'declaration'
    this.loginTab = 'faculty'; // 'faculty' | 'hod' | 'admin'
    this.selectedLoginDept = '';
    this.selectedLoginFaculty = '';
    this.adminFilter = 'Approved';
    this.adminDeptFilter = 'all';
    this.adminTab = 'dept';
    this.adminManageSubTab = 'faculty';
    this.adminLevelFilter = 'all'; // 'all' | 'UG' | 'PG'
    this.adminSemFilter = 'even'; // 'even' | 'all' | '2' | '4' | '6' | '1' | '3' | '5'
    this.adminStatusFilter = 'all'; // 'all' | 'Approved' | 'Pending' | 'Draft' | 'Revision Needed' | 'Not Started'
    this.adminSearchQuery = '';
    this.adminCoursePage = 1;
    this.adminCoursePageSize = 50;
    this.hodTab = 'courses';
    this.syllabusCourses = [];
    this.syllabusLoaded = false;
  }

  async init() {
    await this.loadDepartmentsData();
    // Start syllabus data fetch
    this.syllabusPromise = this.loadSyllabusData();
    await this.checkAuth();

    // Sync selectedDept from authenticated user
    if (this.currentUser && this.currentUser.department_name) {
      this.selectedDept = this.currentUser.department_name;
    }

    // Set default login dept
    if (!this.selectedLoginDept && this.departments.length > 0) {
      this.selectedLoginDept = this.selectedDept || this.departments[0].name;
    }

    // Listen to browser Back / Forward buttons for clean URL navigation
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    // If directly entering a route that requires syllabus (new, edit, view) or already authenticated, await syllabus
    const r = this.getRoute();
    if (r.name === 'new' || r.name === 'edit' || r.name === 'view' || this.currentUser) {
      await this.syllabusPromise;
    }

    // Dispatch route based on URL
    await this.handleRoute();
  }

  getRoute() {
    const path = window.location.pathname.replace(/\/+$/, '');
    const search = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace(/^#/, '');

    if (path.endsWith('/login') || search.has('login') || hash === 'login') return { name: 'login' };
    if (path.endsWith('/dashboard') || search.has('dashboard') || hash === 'dashboard') return { name: 'dashboard' };
    if (path.endsWith('/new') || path.endsWith('/create') || search.has('new') || hash === 'new') return { name: 'new' };
    if (path.endsWith('/edit') || search.has('edit')) return { name: 'edit', id: search.get('id') || search.get('edit') };
    if (path.endsWith('/view') || path.endsWith('/print') || search.has('view') || search.has('print')) return { name: 'view', id: search.get('id') || search.get('view') || search.get('print') };
    if (path.endsWith('/hod') || search.has('hod') || hash === 'hod') return { name: 'hod' };
    if (path.endsWith('/admin') || search.has('admin') || hash === 'admin') return { name: 'admin' };

    return { name: 'root' };
  }

  async navigateTo(url, replace = false) {
    if (replace) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }
    if (url.includes('/new') || url.includes('/edit') || url.includes('/view')) {
      if (!this.syllabusLoaded || !this.syllabusCourses || this.syllabusCourses.length === 0) {
        if (this.syllabusPromise) {
          await this.syllabusPromise;
        } else {
          await this.loadSyllabusData();
        }
      }
    }
    await this.handleRoute();
  }

  async handleRoute() {
    const r = this.getRoute();

    if (!this.currentUser) {
      this.viewMode = 'login';
      if (r.name !== 'login') {
        window.history.replaceState(null, '', '/course-plan/login');
      }
      this.render();
      return;
    }

    if (r.name === 'new') {
      this.activePlan = this.createDefaultPlan();
      this.viewMode = 'form';
      this.activeFormTab = 'part1';
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (r.name === 'edit' && r.id) {
      await this.loadPlanForEdit(r.id);
      this.viewMode = 'form';
      this.activeFormTab = 'part1';
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (r.name === 'view' && r.id) {
      await this.loadPlanForPrint(r.id);
      this.viewMode = 'print';
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Dashboard views
    this.viewMode = 'dashboard';
    if (this.currentUser.role === 'faculty') {
      if (r.name !== 'dashboard') {
        window.history.replaceState(null, '', '/course-plan/dashboard');
      }
      await this.fetchPlans();
    } else if (this.currentUser.role === 'hod') {
      if (r.name !== 'hod' && r.name !== 'dashboard') {
        window.history.replaceState(null, '', '/course-plan/hod');
      }
      await this.fetchPlans();
    } else if (this.currentUser.role === 'admin') {
      if (r.name !== 'admin' && r.name !== 'dashboard') {
        window.history.replaceState(null, '', '/course-plan/admin');
      }
      await this.fetchPlans();
    }

    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async loadSyllabusData() {
    if (this.syllabusLoaded && this.syllabusCourses && this.syllabusCourses.length > 0) {
      return this.syllabusCourses;
    }

    const paths = [
      '/course-plan/data/syllabus_master.json?v=20261109I',
      '/course-plan/syllabus_master.json?v=20261109I',
      'data/syllabus_master.json?v=20261109I',
      'syllabus_master.json?v=20261109I'
    ];

    for (const p of paths) {
      try {
        const res = await fetch(p);
        if (res.ok) {
          const contentType = (res.headers.get('content-type') || '').toLowerCase();
          if (contentType.includes('json') || contentType === '' || p.includes('.json')) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              this.syllabusCourses = data;
              this.syllabusLoaded = true;
              console.log(`[CoursePlanApp] Successfully loaded ${data.length} syllabus courses from ${p}`);
              if (this.viewMode === 'form') {
                this.refreshSyllabusCourseDropdown();
              }
              return data;
            }
          }
        }
      } catch (err) {
        console.warn(`[CoursePlanApp] Failed loading syllabus from ${p}:`, err);
      }
    }
  }

  refreshSyllabusCourseDropdown() {
    const selectEl = document.getElementById('cp-course-select');
    if (!selectEl) return;
    const relevantCourses = this.getRelevantSyllabusCourses();
    const curVal = selectEl.value || (this.activePlan && this.activePlan.course_code) || '';

    let html = `<option value="">-- Choose Course to Auto-Fill Details (${relevantCourses.length} available) --</option>`;
    relevantCourses.forEach(c => {
      const isSel = (c.course_code === curVal) ? 'selected' : '';
      html += `<option value="${this.escapeHtml(c.course_code)}" ${isSel}>
        ${this.escapeHtml(c.course_code)} - ${this.escapeHtml(c.course_title)} (${c.credits || 3} Credits, ${c.hours || 4}h/wk)
      </option>`;
    });
    selectEl.innerHTML = html;

    const badge = selectEl.closest('.bg-indigo-50\\/70')?.querySelector('.bg-indigo-600') || selectEl.parentElement?.querySelector('.bg-indigo-600');
    if (badge) {
      const semNum = this.getSemesterNum(this.activePlan ? this.activePlan.semester : 'II');
      badge.textContent = `${relevantCourses.length} courses in Semester ${semNum}`;
    }
  }

  getDepartmentProgrammes(deptName) {
    const dept = (deptName || this.selectedDept || '').trim();
    
    // Explicit curated programmes for college departments
    const specialMap = {
      'Computer Science': ['B.Sc. Computer Science', 'MCA (Master of Computer Applications)'],
      'Information Technology': ['B.C.A (Computer Applications)', 'M.Sc. Computer Science'],
      'Commerce': ['B.Com. Commerce', 'M.Com. Commerce'],
      'Commerce CA': ['B.Com. Commerce with Computer Applications', 'M.Com. Commerce Computer Applications'],
      'Commerce Business Analytics': ['B.Com. Business Analytics'],
      'Commerce Honours': ['B.Com. Honours'],
      'Commerce Strategic Finance': ['B.Com. Strategic Finance'],
      'Mathematics': ['B.Sc. Mathematics', 'M.Sc. Mathematics'],
      'Physics': ['B.Sc. Physics', 'M.Sc. Physics'],
      'Chemistry': ['B.Sc. Chemistry', 'M.Sc. Chemistry'],
      'Botany': ['B.Sc. Botany', 'M.Sc. Botany'],
      'Biotechnology': ['B.Sc. Biotechnology', 'M.Sc. Biotechnology'],
      'Biochemistry': ['M.Sc. Biochemistry'],
      'Data Science': ['M.Sc. Data Science'],
      'Artificial Intelligence': ['B.Sc. Artificial Intelligence and Machine Learning', 'M.Sc. Artificial Intelligence'],
      'Economics': ['B.A. Economics', 'M.A. Economics'],
      'English': ['B.A. English', 'M.A. English'],
      'History': ['B.A. History', 'M.A. History'],
      'Tamil': ['B.A. Tamil', 'M. A. Tamil'],
      'BBA': ['B.B.A (Business Administration)'],
      'B.Voc SD & SA': ['B.Voc. Software Development & System Administration', 'B.Voc. SD & SA'],
      'Visual Communication': ['B.Sc. Visual Communication', 'B.Voc. Viscom Technology', 'M.Sc. Visual Communication'],
      'Electronics': ['B.Sc. Electronics', 'M.Sc. Electronics'],
      'Counselling Psy': ['M.Sc. Counselling Psychology'],
      'HRM': ['M.A. Human Resource Management'],
      'Physical Education': ['B.Sc. Physical Education'],
      'Human Excellence': ['Human Excellence & Value Education']
    };

    // Full list of UG programmes across the college for Language & Foundation faculties
    const allCollegeUGProgrammes = [
      'B.A. Economics',
      'B.A. English',
      'B.A. History',
      'B.A. Tamil',
      'B.B.A (Business Administration)',
      'B.Com. Commerce',
      'B.Com. Commerce with Computer Applications',
      'B.Com. Business Analytics',
      'B.Com. Honours',
      'B.Com. Strategic Finance',
      'B.Sc. Computer Science',
      'B.C.A (Computer Applications)',
      'B.Sc. Mathematics',
      'B.Sc. Physics',
      'B.Sc. Chemistry',
      'B.Sc. Botany',
      'B.Sc. Biotechnology',
      'B.Sc. Artificial Intelligence and Machine Learning',
      'B.Sc. Visual Communication',
      'B.Voc. Software Development & System Administration',
      'B.Voc. Viscom Technology',
      'B.Sc. Electronics',
      'B.Sc. Physical Education'
    ];

    const isLanguageOrFoundationDept = /^(English|Tamil|French|Hindi|Sanskrit|Human Excellence)$/i.test(dept);
    if (isLanguageOrFoundationDept) {
      const ownProgs = specialMap[dept] || [dept + ' Programme'];
      const otherProgs = allCollegeUGProgrammes.filter(p => !ownProgs.includes(p));
      return [...ownProgs, ...otherProgs];
    }

    if (specialMap[dept]) return specialMap[dept];

    // Otherwise derive from syllabus master
    const progs = new Set();
    (this.syllabusCourses || []).forEach(c => {
      if (c.department && (c.department.toLowerCase() === dept.toLowerCase() || dept.toLowerCase().includes(c.department.toLowerCase()))) {
        if (c.programme) progs.add(c.programme);
      }
    });

    return progs.size > 0 ? Array.from(progs) : [dept + ' Programme'];
  }

  getSemesterNum(sem) {
    if (!sem) return 2;
    const s = String(sem).trim().toUpperCase();
    if (s === 'VI' || s === '6' || s.includes('VI') || s.includes('SEM 6') || s.includes('SEM-6')) return 6;
    if (s === 'IV' || s === '4' || s.includes('IV') || s.includes('SEM 4') || s.includes('SEM-4')) return 4;
    if (s === 'V' || s === '5' || s.includes('SEM 5') || s.includes('SEM-5')) return 5;
    if (s === 'III' || s === '3' || s.includes('III') || s.includes('SEM 3') || s.includes('SEM-3')) return 3;
    if (s === 'II' || s === '2' || s.includes('II') || s.includes('SEM 2') || s.includes('SEM-2')) return 2;
    if (s === 'I' || s === '1' || s.includes('SEM 1') || s.includes('SEM-1')) return 1;
    return 2;
  }

  isDeptMatch(courseDept, selectedDept) {
    if (!courseDept || !selectedDept) return false;
    const cd = courseDept.toLowerCase().trim();
    const sd = selectedDept.toLowerCase().trim();
    if (cd === sd) return true;
    if (cd.includes(sd) || sd.includes(cd)) return true;

    // Normalization (strip punctuation, dots, dashes, underscores, and normalize &)
    const norm = (s) => (s || '').toLowerCase().replace(/[_\.\-]/g, ' ').replace(/&amp;/g, 'and').replace(/&/g, 'and').replace(/\s+/g, ' ').trim();
    const ncd = norm(courseDept);
    const nsd = norm(selectedDept);
    if (ncd === nsd || ncd.includes(nsd) || nsd.includes(ncd)) return true;

    // Robust B.Voc SD & SA matching
    const isSdSa = (s) => (s.includes('voc') || s.includes('software') || s.includes('uss')) && 
                          (s.includes('sd') || s.includes('sa') || s.includes('software') || s.includes('uss') || s.includes('system'));
    if (isSdSa(ncd) && isSdSa(nsd)) return true;

    if (nsd.includes('counselling') && ncd.includes('counselling')) return true;
    if (nsd.includes('visual') && ncd.includes('visual')) return true;
    if ((nsd.includes('human resource') || nsd.includes('hrm')) && (ncd.includes('human resource') || ncd.includes('hrm'))) return true;
    if (nsd.includes('human excellence') && ncd.includes('human excellence')) return true;
    if (nsd.includes('physical education') && ncd.includes('physical education')) return true;
    if (nsd.includes('data science') && ncd.includes('data science')) return true;
    if (nsd.includes('artificial intelligence') && (ncd.includes('artificial intelligence') || ncd.includes('ai'))) return true;

    return false;
  }

  getRelevantSyllabusCourses() {
    if (!this.syllabusCourses || this.syllabusCourses.length === 0) return [];
    const dept = (this.activePlan && this.activePlan.department_name) ? this.activePlan.department_name : this.selectedDept;
    const sem = (this.activePlan && this.activePlan.semester) ? this.activePlan.semester : 'II';
    const prog = (this.activePlan && this.activePlan.programme) ? this.activePlan.programme : '';
    const semNum = this.getSemesterNum(sem);

    const dLower = (dept || '').toLowerCase().trim();
    const pLower = (prog || '').toLowerCase().trim();

    const isBVocDept = dLower.includes('voc') || dLower.includes('sd') || dLower.includes('sa') || dLower.includes('software') || dLower.includes('uss');
    const isEng = dLower === 'english';
    const isTam = dLower === 'tamil';
    const isFrench = dLower.includes('french');
    const isHindi = dLower.includes('hindi');
    const isSanskrit = dLower.includes('sanskrit');

    const isOwnMajor = (isEng && pLower.includes('english')) || (isTam && pLower.includes('tamil'));
    const isPG = pLower.startsWith('m.') || pLower.includes('mca') || pLower.includes('master') || pLower.includes('post');

    let list = this.syllabusCourses.filter(c => {
      // 1. Semester filtering (only show courses for corresponding semester II, IV, or VI)
      if (c.semester_num && c.semester_num !== semNum) return false;

      const code = (c.course_code || '').toUpperCase();
      const title = (c.course_title || '');
      const cat = (c.course_category || '');

      // 2. B.Voc SD & SA
      if (isBVocDept) {
        return code.includes('USS');
      }

      // 3. English Department
      if (isEng) {
        if (isPG) {
          return this.isDeptMatch(c.department, 'English') && (code.startsWith('25PEN') || code.includes('PEN'));
        }
        if (isOwnMajor) {
          return this.isDeptMatch(c.department, 'English');
        }
        // English faculty teaching outside UG programme: General English courses
        return this.isDeptMatch(c.department, 'English') && (code.includes('GE') || cat === 'General English' || title.toLowerCase().includes('general english'));
      }

      // 4. Tamil Department
      if (isTam) {
        if (isPG) {
          return this.isDeptMatch(c.department, 'Tamil') && (code.startsWith('25PTA') || code.includes('PTA'));
        }
        if (isOwnMajor) {
          return this.isDeptMatch(c.department, 'Tamil');
        }
        // Tamil faculty teaching outside UG programme: General Tamil courses (exclude SL Self Learning)
        return this.isDeptMatch(c.department, 'Tamil') && !code.includes('SL') && (code.includes('GL') || cat === 'General Language' || title.toLowerCase().includes('general tamil') || title.includes('பொதுத்தமிழ்') || title.includes('பபொதுத்தமிழ்'));
      }

      // 5. Other Language & Foundation Departments (French, Hindi, Sanskrit, Human Excellence)
      if (isFrench || isHindi || isSanskrit || dLower.includes('human excellence')) {
        return this.isDeptMatch(c.department, dept);
      }

      // 6. Standard Departments
      const deptMatches = this.isDeptMatch(c.department, dept);
      if (!deptMatches) return false;

      if (prog && dept === 'Computer Science') {
        if (prog.includes('MCA') && !code.includes('PCA')) return false;
        if (prog.includes('B.Sc') && !code.includes('UCS')) return false;
      } else if (prog && dept === 'Information Technology') {
        if (prog.includes('M.Sc') && !code.includes('PCS')) return false;
        if ((prog.includes('BCA') || prog.includes('B.C.A')) && !code.includes('UBC')) return false;
      }

      return true;
    });

    // Stream-based prioritization for General English & General Tamil in Semester IV
    if (semNum === 4 && (isEng || isTam) && !isOwnMajor && !isPG) {
      const isSci = /sc|bca|voc|math|phys|chem|bot|bio|ai|elec/i.test(pLower);
      const isCom = /com|bba|bus|hon|fin/i.test(pLower);
      const isArt = /art|econ|hist|lit|lang/i.test(pLower);

      list.sort((a, b) => {
        const ca = (a.course_code || '').toUpperCase();
        const cb = (b.course_code || '').toUpperCase();
        if (isEng) {
          if (isSci) {
            if (ca.includes('GE04B')) return -1;
            if (cb.includes('GE04B')) return 1;
          } else if (isCom) {
            if (ca.includes('GE04C')) return -1;
            if (cb.includes('GE04C')) return 1;
          } else if (isArt) {
            if (ca.includes('GE04A')) return -1;
            if (cb.includes('GE04A')) return 1;
          }
        } else if (isTam) {
          if (isSci) {
            if (ca.includes('GL04B')) return -1;
            if (cb.includes('GL04B')) return 1;
          } else if (isCom) {
            if (ca.includes('GL04C')) return -1;
            if (cb.includes('GL04C')) return 1;
          } else if (isArt) {
            if (ca.includes('GL04A')) return -1;
            if (cb.includes('GL04A')) return 1;
          }
        }
        return 0;
      });
    }

    return list;
  }

  detectCourseCategory(code, title) {
    const ucode = (code || '').toUpperCase();
    const utitle = (title || '').toUpperCase();

    if (ucode.includes('CC') || utitle.includes('CORE COURSE')) return 'Core';
    if (ucode.includes('CP') || utitle.includes('PRACTICAL')) return 'Core Practical';
    if (ucode.includes('AC') || utitle.includes('ALLIED') || ucode.includes('AO')) return 'Allied';
    if (ucode.includes('ES') || utitle.includes('ELECTIVE') || utitle.includes('DSE')) return 'Elective';
    if (ucode.includes('SEC') || ucode.includes('SE') || utitle.includes('SKILL')) return 'Skill Enhancement (SEC)';
    if (ucode.includes('VE') || utitle.includes('VALUE') || utitle.includes('HUMAN RIGHTS')) return 'Value Added (VAC)';
    if (ucode.includes('AE') || ucode.includes('ENVIRONMENTAL')) return 'Ability Enhancement (AECC)';
    if (ucode.includes('OE') || utitle.includes('OPEN ELECTIVE')) return 'Open Elective';
    if (ucode.includes('GL') || utitle.includes('GENERAL TAMIL') || utitle.includes('FRENCH') || utitle.includes('HINDI') || utitle.includes('SANSKRIT')) return 'General Language';
    if (ucode.includes('GE') || utitle.includes('GENERAL ENGLISH')) return 'General English';
    return 'Core';
  }

  onSemesterChange(newSem) {
    if (!this.activePlan) this.activePlan = this.createDefaultPlan();
    this.harvestFormInputs();
    this.activePlan.semester = newSem;

    // Reset course code if it doesn't match new semester
    const curCode = this.activePlan.course_code;
    if (curCode) {
      const semNum = this.getSemesterNum(newSem);
      const match = (this.syllabusCourses || []).find(c => c.course_code.toLowerCase() === curCode.toLowerCase().trim());
      if (match && match.semester_num && match.semester_num !== semNum) {
        this.activePlan.course_code = '';
        this.activePlan.course_title = '';
      }
    }

    this.render();
  }

  onProgrammeChange(newProg) {
    if (!this.activePlan) this.activePlan = this.createDefaultPlan();
    this.harvestFormInputs();
    this.activePlan.programme = newProg;

    const isPG = newProg.startsWith('M.') || newProg.includes('MCA') || newProg.includes('Master') || newProg.includes('Post');
    this.activePlan.is_pg = isPG;

    // Update Year & Class dropdown default according to UG vs PG
    if (isPG) {
      if (!this.activePlan.year_class || this.activePlan.year_class.includes('UG')) {
        this.activePlan.year_class = 'I PG';
      }
    } else {
      if (!this.activePlan.year_class || this.activePlan.year_class.includes('PG')) {
        this.activePlan.year_class = 'I UG';
      }
    }

    this.applyAssessmentRules(isPG);
    this.render();
  }

  onYearClassChange(newYc) {
    if (!this.activePlan) this.activePlan = this.createDefaultPlan();
    this.harvestFormInputs();
    this.activePlan.year_class = newYc;

    // Automatically sync corresponding even semester for the academic year 2026-2027 Even Semester
    if (newYc === 'I UG' || newYc === 'I PG') {
      this.activePlan.semester = 'II';
    } else if (newYc === 'II UG' || newYc === 'II PG') {
      this.activePlan.semester = 'IV';
    } else if (newYc === 'III UG') {
      this.activePlan.semester = 'VI';
    }

    const isPG = newYc.includes('PG') || newYc.includes('MCA');
    this.activePlan.is_pg = isPG;
    this.activePlan.is_auto_fetched = true;
    this.applyAssessmentRules(isPG);
    this.render();
  }

  onSectionChange(newSec) {
    if (!this.activePlan) this.activePlan = this.createDefaultPlan();
    this.activePlan.section = newSec;
  }

  fetchFromSyllabus(courseCode, showAlert = false) {
    if (!courseCode) return;
    const cleanCode = courseCode.toLowerCase().trim();
    const course = (this.syllabusCourses || []).find(c => c.course_code.toLowerCase().trim() === cleanCode);
    if (!course) {
      if (showAlert) alert("Course code '" + courseCode + "' not found in syllabus database for this department.");
      return;
    }

    if (!this.activePlan) this.activePlan = this.createDefaultPlan();

    // Preserve already entered faculty metadata without letting stale course inputs overwrite
    const curDept = document.getElementById('cp-dept-name')?.value;
    if (curDept) this.activePlan.department_name = curDept;
    const curFac = document.getElementById('cp-faculty-name')?.value;
    if (curFac) this.activePlan.faculty_name = curFac;
    const curSem = document.getElementById('cp-semester')?.value;
    if (curSem) this.activePlan.semester = curSem;
    const curYc = document.getElementById('cp-year-class')?.value;
    if (curYc) this.activePlan.year_class = curYc;
    const curSec = document.getElementById('cp-section')?.value;
    if (curSec) this.activePlan.section = curSec;

    // Auto-fill course details from syllabus master
    this.activePlan.course_code = course.course_code;
    this.activePlan.course_title = course.course_title || '';
    this.activePlan.credits = course.credits || '3';
    this.activePlan.course_category = course.course_category || this.detectCourseCategory(course.course_code, course.course_title);
    
    if (course.programme && (!this.activePlan.programme || this.activePlan.programme === '')) {
      this.activePlan.programme = course.programme;
    }

    const weeklyHrs = parseInt(course.hours) || 4;
    this.activePlan.teaching_hours = `${weeklyHrs * 15} Hours & ${weeklyHrs} Hours/Week`;

    const isPG = course.level === 'PG' || (course.year_class && course.year_class.includes('PG')) || course.course_code.includes('P') || (this.activePlan.programme && this.activePlan.programme.startsWith('M.'));
    this.activePlan.is_pg = isPG;

    const courseCos = (course.cos && course.cos.length > 0) ? course.cos : (course.course_outcomes || []);
    if (courseCos.length > 0) {
      this.activePlan.course_outcomes = JSON.parse(JSON.stringify(courseCos));
    }

    const perUnitHours = Math.round((weeklyHrs * 15) / 5);
    const units = ['Unit I', 'Unit II', 'Unit III', 'Unit IV', 'Unit V'];
    this.activePlan.unit_completion_plan = units.map((u, i) => ({
      unit: u,
      planned_hours: String(perUnitHours),
      actual_hours: String(perUnitHours),
      target_date: (this.activePlan.unit_completion_plan && this.activePlan.unit_completion_plan[i]) ? this.activePlan.unit_completion_plan[i].target_date : ''
    }));

    this.activePlan.is_auto_fetched = true;
    this.applyAssessmentRules(isPG);
    this.render();

    this.showAutoFillToast(course);

    if (showAlert) {
      alert("✓ Auto-fetched syllabus details for " + course.course_code + ":\n• Course Title: " + (course.course_title || '—') + "\n• Credits: " + this.activePlan.credits + "\n• Teaching Hours: " + weeklyHrs + " Hrs/Week (" + (weeklyHrs*15) + " Total)\n• Unit Hours: " + perUnitHours + " Hrs/Unit (Default Actual Hours pre-filled)\n• Course Outcomes: " + (courseCos ? courseCos.length : 0) + " COs loaded!");
    }
  }

  showAutoFillToast(course) {
    let toast = document.getElementById('cp-autofill-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cp-autofill-toast';
      document.body.appendChild(toast);
    }
    toast.className = 'fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border-2 border-emerald-400 text-xs font-bold';
    toast.innerHTML = `
      <div class="w-7 h-7 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black">✓</div>
      <div>
        <div class="text-[13px] font-black">${course.course_code} Auto-Filled!</div>
        <div class="text-emerald-100 font-medium">${course.course_title || ''} • ${course.credits || 3} Credits • ${course.hours || 4}h/wk</div>
      </div>
      <button type="button" onclick="this.parentElement.remove()" class="text-emerald-200 hover:text-white font-bold ml-2">✕</button>
    `;
    setTimeout(() => {
      if (toast && toast.parentElement) toast.remove();
    }, 4500);
  }

  onSyllabusCourseSelected(code) {
    if (code) {
      this.fetchFromSyllabus(code, false);
    }
  }

  onCourseCodeInputChange(val) {
    if (!val) return;
    const match = (this.syllabusCourses || []).find(c => c.course_code.toLowerCase().trim() === val.toLowerCase().trim());
    if (match) {
      this.fetchFromSyllabus(match.course_code, false);
    }
  }

  fetchByCodeInput() {
    const input = document.getElementById('cp-course-code');
    if (input && input.value.trim()) {
      this.fetchFromSyllabus(input.value.trim(), true);
    } else {
      alert('Please enter or select a Course Code.');
    }
  }

  getFullAssessmentPlan(plan) {
    const p = plan || this.activePlan || {};
    const isPG = !!p.is_pg || (p.year_class && p.year_class.includes('PG')) || (p.programme && p.programme.startsWith('M.'));

    const c1 = {
      sno: '1',
      component: 'C1 – K1, K2',
      marks: '15',
      category: 'MCQ through JosTEL',
      unit_coverage: 'Unit I & II',
      date: '09-01-2027 to 13-01-2027',
      outcome: '—',
      is_default: true,
      uneditable: true
    };

    const mid = {
      sno: '2',
      component: 'Mid Sem',
      marks: '30',
      category: 'Written Examination',
      unit_coverage: 'Unit I, II & III',
      date: '21-01-2027 to 30-01-2027',
      outcome: '—',
      is_default: true,
      uneditable: true
    };

    const end = {
      component: 'End Sem',
      marks: '30',
      category: 'Written Examination',
      unit_coverage: 'All Units (Unit I - V)',
      date: '16-03-2027 to 24-03-2027',
      outcome: '—',
      is_default: true,
      uneditable: true
    };

    const assessedActs = (p.learning_activities || []).filter(a => a && a.is_assessment);
    const middleItems = assessedActs.map(a => ({
      component: a.cia_component || 'C2 Assessment',
      marks: String(a.cia_marks || '10'),
      category: a.activity || 'Learning Activity',
      unit_coverage: a.topic || '—',
      date: a.proposed_date ? this.formatDateToDDMMYYYY(a.proposed_date) : '—',
      outcome: a.outcome || '—',
      is_default: false,
      uneditable: true
    }));

    const fullList = [c1, mid, ...middleItems, end];
    return fullList.map((item, idx) => ({
      ...item,
      sno: String(idx + 1)
    }));
  }

  applyAssessmentRules(isPG) {
    if (!this.activePlan) return;
    this.activePlan.assessment_plan = this.getFullAssessmentPlan(this.activePlan);
  }

  getDefaultAssessmentPlan(isPG = false) {
    return this.getFullAssessmentPlan({ is_pg: isPG });
  }


  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  toggleMethodDropdown(rowIdx, event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById(`dtp-method-menu-${rowIdx}`);
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    // Close any other open dropdowns
    document.querySelectorAll('[id^="dtp-method-menu-"]').forEach(m => m.classList.add('hidden'));
    if (isHidden) {
      menu.classList.remove('hidden');
    }
  }

  closeMethodDropdown(rowIdx) {
    const menu = document.getElementById(`dtp-method-menu-${rowIdx}`);
    if (menu) menu.classList.add('hidden');
  }

  filterMethodOptions(rowIdx, query) {
    const container = document.getElementById(`dtp-method-list-${rowIdx}`);
    if (!container) return;
    const q = (query || '').toLowerCase().trim();
    const labels = container.querySelectorAll('.dtp-method-opt');
    labels.forEach(lbl => {
      const text = lbl.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        lbl.style.display = 'flex';
      } else {
        lbl.style.display = 'none';
      }
    });
  }

  onMethodCheckboxToggle(rowIdx, option, isChecked) {
    const hiddenVal = document.querySelector(`#dtp-method-box-${rowIdx} .dtp-method-value`);
    if (!hiddenVal) return;
    let list = (hiddenVal.value || '').split(',').map(s => s.trim()).filter(Boolean);

    if (option === 'Other:') {
      const otherContainer = document.getElementById(`dtp-method-other-container-${rowIdx}`);
      const otherInput = otherContainer ? otherContainer.querySelector('.dtp-method-other-input') : null;
      if (isChecked) {
        if (otherContainer) otherContainer.classList.remove('hidden');
        const customText = otherInput ? otherInput.value.trim() : '';
        const itemVal = customText ? `Other: ${customText}` : 'Other:';
        if (!list.some(s => s === 'Other:' || s.startsWith('Other:'))) {
          list.push(itemVal);
        }
        if (otherInput) otherInput.focus();
      } else {
        if (otherContainer) otherContainer.classList.add('hidden');
        list = list.filter(s => s !== 'Other:' && !s.startsWith('Other:'));
      }
    } else {
      if (isChecked) {
        if (!list.includes(option)) list.push(option);
      } else {
        list = list.filter(s => s !== option);
      }
    }

    hiddenVal.value = list.join(', ');
    this.updateMethodDisplayTags(rowIdx, list);
  }

  onMethodOtherInput(rowIdx, text) {
    const hiddenVal = document.querySelector(`#dtp-method-box-${rowIdx} .dtp-method-value`);
    if (!hiddenVal) return;
    let list = (hiddenVal.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const custom = text.trim();
    const entry = custom ? `Other: ${custom}` : 'Other:';

    const idx = list.findIndex(s => s === 'Other:' || s.startsWith('Other:'));
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.push(entry);
    }
    hiddenVal.value = list.join(', ');
    this.updateMethodDisplayTags(rowIdx, list);
  }

  removeMethodItem(rowIdx, item) {
    const hiddenVal = document.querySelector(`#dtp-method-box-${rowIdx} .dtp-method-value`);
    if (!hiddenVal) return;
    let list = (hiddenVal.value || '').split(',').map(s => s.trim()).filter(Boolean);

    const isOther = item === 'Other:' || item.startsWith('Other:');
    if (isOther) {
      list = list.filter(s => s !== 'Other:' && !s.startsWith('Other:'));
      const otherContainer = document.getElementById(`dtp-method-other-container-${rowIdx}`);
      if (otherContainer) otherContainer.classList.add('hidden');
      const chk = document.querySelector(`#dtp-method-list-${rowIdx} input[value="Other:"]`);
      if (chk) chk.checked = false;
    } else {
      list = list.filter(s => s !== item);
      const chk = document.querySelector(`#dtp-method-list-${rowIdx} input[value="${item}"]`);
      if (chk) chk.checked = false;
    }

    hiddenVal.value = list.join(', ');
    this.updateMethodDisplayTags(rowIdx, list);
  }

  updateMethodDisplayTags(rowIdx, list) {
    const container = document.querySelector(`#dtp-method-box-${rowIdx} .dtp-method-tags`);
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<span class="text-slate-400 text-[11px] italic pl-1">Select methodology (multiple)...</span>`;
      return;
    }

    container.innerHTML = list.map(item => {
      const isOtherVal = item === 'Other:' || item.startsWith('Other:');
      const displayLabel = isOtherVal ? (item.length > 6 ? item : 'Other: Custom') : item;
      return `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
          <span>${this.escapeHtml(displayLabel)}</span>
          <button type="button" onclick="event.stopPropagation(); coursePlanApp.removeMethodItem(${rowIdx}, '${this.escapeHtml(item)}')" class="text-indigo-400 hover:text-indigo-800 font-bold ml-0.5">✕</button>
        </span>
      `;
    }).join('');
  }

  renderMethodologyMultiSelect(rowIdx, currentVal) {
    const list = (currentVal || '').split(',').map(s => s.trim()).filter(Boolean);
    const otherItem = list.find(s => s.startsWith('Other:') || (!CoursePlanApp.TEACHING_METHODOLOGIES.includes(s) && s !== 'Other:'));
    const hasOther = list.some(s => s === 'Other:' || s.startsWith('Other:'));
    const otherCustomText = otherItem ? (otherItem.startsWith('Other:') ? otherItem.replace('Other:', '').trim() : otherItem) : '';

    return `
      <div class="dtp-method-container relative w-full" id="dtp-method-box-${rowIdx}">
        <input type="hidden" class="dtp-method-value" value="${this.escapeHtml(currentVal || '')}" />
        
        <!-- Clickable tags trigger -->
        <div 
          onclick="coursePlanApp.toggleMethodDropdown(${rowIdx}, event)" 
          class="min-h-[34px] w-full p-1.5 border border-slate-300 rounded-lg bg-white flex flex-wrap items-center gap-1 cursor-pointer hover:border-indigo-500 transition"
        >
          <div class="dtp-method-tags flex flex-wrap items-center gap-1 flex-1">
            ${list.length === 0 ? `
              <span class="text-slate-400 text-[11px] italic pl-1">Select methodology (multiple)...</span>
            ` : `
              ${list.map(item => {
                const isOtherVal = item === 'Other:' || item.startsWith('Other:');
                const displayLabel = isOtherVal ? (item.length > 6 ? item : 'Other: Custom') : item;
                return `
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    <span>${this.escapeHtml(displayLabel)}</span>
                    <button type="button" onclick="event.stopPropagation(); coursePlanApp.removeMethodItem(${rowIdx}, '${this.escapeHtml(item)}')" class="text-indigo-400 hover:text-indigo-800 font-bold ml-0.5">✕</button>
                  </span>
                `;
              }).join('')}
            `}
          </div>
          <span class="text-slate-400 text-xs pr-1 shrink-0">▾</span>
        </div>

        <!-- Autocomplete Dropdown Menu -->
        <div 
          id="dtp-method-menu-${rowIdx}" 
          class="hidden absolute left-0 sm:left-auto right-0 sm:right-auto top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl z-40 p-2 space-y-2 w-[calc(100vw-3rem)] max-w-xs sm:w-80"
          onclick="event.stopPropagation()"
        >
          <div class="relative">
            <input 
              type="text" 
              placeholder="Search 16 methodologies..." 
              oninput="coursePlanApp.filterMethodOptions(${rowIdx}, this.value)" 
              class="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
          </div>
          <div class="max-h-48 overflow-y-auto space-y-0.5 divide-y divide-slate-100" id="dtp-method-list-${rowIdx}">
            ${CoursePlanApp.TEACHING_METHODOLOGIES.map(opt => {
              const isChecked = opt === 'Other:' ? hasOther : list.includes(opt);
              return `
                <label class="dtp-method-opt flex items-center gap-2 px-2 py-1.5 hover:bg-indigo-50 rounded-lg cursor-pointer text-xs font-medium text-slate-800">
                  <input 
                    type="checkbox" 
                    class="rounded text-indigo-600 focus:ring-0" 
                    value="${opt}" 
                    ${isChecked ? 'checked' : ''} 
                    onchange="coursePlanApp.onMethodCheckboxToggle(${rowIdx}, '${opt}', this.checked)" 
                  />
                  <span class="opt-label">${opt}</span>
                </label>
              `;
            }).join('')}
          </div>
          <div id="dtp-method-other-container-${rowIdx}" class="${hasOther ? '' : 'hidden'} pt-1 border-t border-slate-200">
            <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Specify Other Methodology *</label>
            <input 
              type="text" 
              class="dtp-method-other-input w-full text-xs px-2 py-1 border border-indigo-400 rounded-lg font-medium" 
              placeholder="e.g. Gamification / Concept Mapping" 
              value="${this.escapeHtml(otherCustomText)}" 
              oninput="coursePlanApp.onMethodOtherInput(${rowIdx}, this.value)"
            />
          </div>
          <div class="flex justify-between items-center pt-1 border-t border-slate-100 text-[10px]">
            <span class="text-slate-500 font-bold">${list.length} selected</span>
            <button type="button" onclick="coursePlanApp.closeMethodDropdown(${rowIdx})" class="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Done</button>
          </div>
        </div>
      </div>
    `;
  }

  toggleResourceDropdown(rowIdx, event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById(`dtp-res-menu-${rowIdx}`);
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    document.querySelectorAll('[id^="dtp-res-menu-"]').forEach(m => m.classList.add('hidden'));
    document.querySelectorAll('[id^="dtp-method-menu-"]').forEach(m => m.classList.add('hidden'));
    if (isHidden) {
      menu.classList.remove('hidden');
    }
  }

  closeResourceDropdown(rowIdx) {
    const menu = document.getElementById(`dtp-res-menu-${rowIdx}`);
    if (menu) menu.classList.add('hidden');
  }

  filterResourceOptions(rowIdx, query) {
    const container = document.getElementById(`dtp-res-list-${rowIdx}`);
    if (!container) return;
    const q = (query || '').toLowerCase().trim();
    const labels = container.querySelectorAll('.dtp-res-opt');
    labels.forEach(lbl => {
      const text = lbl.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        lbl.style.display = 'flex';
      } else {
        lbl.style.display = 'none';
      }
    });
  }

  onResourceCheckboxToggle(rowIdx, option, isChecked) {
    const hiddenVal = document.querySelector(`#dtp-res-box-${rowIdx} .dtp-res-value`);
    if (!hiddenVal) return;
    let list = (hiddenVal.value || '').split(',').map(s => s.trim()).filter(Boolean);

    if (option === 'Other:') {
      const otherContainer = document.getElementById(`dtp-res-other-container-${rowIdx}`);
      const otherInput = otherContainer ? otherContainer.querySelector('.dtp-res-other-input') : null;
      if (isChecked) {
        if (otherContainer) otherContainer.classList.remove('hidden');
        if (otherInput) {
          otherInput.focus();
          const custom = otherInput.value.trim();
          if (custom && !list.includes(custom)) {
            list.push(custom);
          } else if (!list.some(s => s === 'Other:' || s.startsWith('Other:'))) {
            list.push('Other:');
          }
        }
      } else {
        if (otherContainer) otherContainer.classList.add('hidden');
        list = list.filter(s => !s.startsWith('Other:') && CoursePlanApp.LEARNING_RESOURCES.includes(s));
      }
    } else {
      if (isChecked) {
        if (!list.includes(option)) list.push(option);
      } else {
        list = list.filter(s => s !== option);
      }
    }

    hiddenVal.value = list.join(', ');
    this.updateResourceDisplayTags(rowIdx, list);
  }

  onResourceOtherInput(rowIdx, text) {
    const hiddenVal = document.querySelector(`#dtp-res-box-${rowIdx} .dtp-res-value`);
    if (!hiddenVal) return;
    let list = (hiddenVal.value || '').split(',').map(s => s.trim()).filter(Boolean);
    list = list.filter(s => CoursePlanApp.LEARNING_RESOURCES.includes(s) && s !== 'Other:');
    const custom = text.trim();
    if (custom) {
      list.push(`Other: ${custom}`);
    } else {
      list.push('Other:');
    }
    hiddenVal.value = list.join(', ');
    this.updateResourceDisplayTags(rowIdx, list);
  }

  removeResourceItem(rowIdx, item) {
    const hiddenVal = document.querySelector(`#dtp-res-box-${rowIdx} .dtp-res-value`);
    if (!hiddenVal) return;
    let list = (hiddenVal.value || '').split(',').map(s => s.trim()).filter(Boolean);

    const isOther = item === 'Other:' || item.startsWith('Other:') || !CoursePlanApp.LEARNING_RESOURCES.includes(item);
    if (isOther) {
      list = list.filter(s => s !== 'Other:' && !s.startsWith('Other:') && CoursePlanApp.LEARNING_RESOURCES.includes(s));
      const otherContainer = document.getElementById(`dtp-res-other-container-${rowIdx}`);
      if (otherContainer) otherContainer.classList.add('hidden');
      const chk = document.querySelector(`#dtp-res-list-${rowIdx} input[value="Other:"]`);
      if (chk) chk.checked = false;
    } else {
      list = list.filter(s => s !== item);
      const chk = document.querySelector(`#dtp-res-list-${rowIdx} input[value="${item}"]`);
      if (chk) chk.checked = false;
    }

    hiddenVal.value = list.join(', ');
    this.updateResourceDisplayTags(rowIdx, list);
  }

  updateResourceDisplayTags(rowIdx, list) {
    const container = document.querySelector(`#dtp-res-box-${rowIdx} .dtp-res-tags`);
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<span class="text-slate-400 text-[11px] italic pl-1">Select resources (multiple)...</span>`;
      return;
    }

    container.innerHTML = list.map(item => {
      const isOtherVal = item === 'Other:' || item.startsWith('Other:');
      const displayLabel = isOtherVal ? (item.length > 6 ? item : 'Other: Custom') : item;
      return `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
          <span class="max-w-[130px] truncate" title="${this.escapeHtml(displayLabel)}">${this.escapeHtml(displayLabel)}</span>
          <button type="button" onclick="event.stopPropagation(); coursePlanApp.removeResourceItem(${rowIdx}, '${this.escapeHtml(item)}')" class="text-amber-500 hover:text-amber-900 font-bold ml-0.5">✕</button>
        </span>
      `;
    }).join('');
  }

  renderResourceMultiSelect(rowIdx, currentVal) {
    const list = (currentVal || '').split(',').map(s => s.trim()).filter(Boolean);
    const otherItem = list.find(s => s.startsWith('Other:') || (!CoursePlanApp.LEARNING_RESOURCES.includes(s) && s !== 'Other:'));
    const hasOther = list.some(s => s === 'Other:' || s.startsWith('Other:'));
    const otherCustomText = otherItem ? (otherItem.startsWith('Other:') ? otherItem.replace('Other:', '').trim() : otherItem) : '';

    return `
      <div class="dtp-res-container relative w-full" id="dtp-res-box-${rowIdx}">
        <input type="hidden" class="dtp-res-value" value="${this.escapeHtml(currentVal || '')}" />
        
        <!-- Clickable tags trigger -->
        <div 
          onclick="coursePlanApp.toggleResourceDropdown(${rowIdx}, event)" 
          class="min-h-[34px] w-full p-1.5 border border-slate-300 rounded-lg bg-white flex flex-wrap items-center gap-1 cursor-pointer hover:border-amber-500 transition"
          title="Click to select or enter multiple learning resources"
        >
          <div class="dtp-res-tags flex flex-wrap items-center gap-1 flex-1">
            ${list.length === 0 ? `
              <span class="text-slate-400 text-[11px] italic pl-1">Select resources (multiple)...</span>
            ` : `
              ${list.map(item => {
                const isOtherVal = item === 'Other:' || item.startsWith('Other:');
                const displayLabel = isOtherVal ? (item.length > 6 ? item : 'Other: Custom') : item;
                return `
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    <span class="max-w-[130px] truncate" title="${this.escapeHtml(displayLabel)}">${this.escapeHtml(displayLabel)}</span>
                    <button type="button" onclick="event.stopPropagation(); coursePlanApp.removeResourceItem(${rowIdx}, '${this.escapeHtml(item)}')" class="text-amber-500 hover:text-amber-900 font-bold ml-0.5">✕</button>
                  </span>
                `;
              }).join('')}
            `}
          </div>
          <span class="text-slate-400 text-xs pr-1 shrink-0">▾</span>
        </div>

        <!-- Autocomplete Dropdown Menu -->
        <div 
          id="dtp-res-menu-${rowIdx}" 
          class="hidden absolute left-0 sm:left-auto right-0 sm:right-auto top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl z-40 p-2 space-y-2 w-[calc(100vw-3rem)] max-w-xs sm:w-80"
          onclick="event.stopPropagation()"
        >
          <div class="relative">
            <input 
              type="text" 
              placeholder="Search learning resources..." 
              oninput="coursePlanApp.filterResourceOptions(${rowIdx}, this.value)" 
              class="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-amber-600 focus:outline-none"
            />
          </div>
          <div class="max-h-48 overflow-y-auto space-y-0.5 divide-y divide-slate-100" id="dtp-res-list-${rowIdx}">
            ${CoursePlanApp.LEARNING_RESOURCES.map(opt => {
              const isChecked = opt === 'Other:' ? hasOther : list.includes(opt);
              return `
                <label class="dtp-res-opt flex items-center gap-2 px-2 py-1.5 hover:bg-amber-50 rounded-lg cursor-pointer text-xs font-medium text-slate-800">
                  <input 
                    type="checkbox" 
                    class="rounded text-amber-600 focus:ring-0" 
                    value="${opt}" 
                    ${isChecked ? 'checked' : ''} 
                    onchange="coursePlanApp.onResourceCheckboxToggle(${rowIdx}, '${opt}', this.checked)" 
                  />
                  <span class="opt-label">${opt}</span>
                </label>
              `;
            }).join('')}
          </div>
          <div id="dtp-res-other-container-${rowIdx}" class="${hasOther ? '' : 'hidden'} pt-1 border-t border-slate-200">
            <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Specify Book / Resource Title *</label>
            <input 
              type="text" 
              class="dtp-res-other-input w-full text-xs px-2 py-1 border border-amber-400 rounded-lg font-medium" 
              placeholder="e.g. Balagurusamy Java 6th Ed / Coursera" 
              value="${this.escapeHtml(otherCustomText)}" 
              oninput="coursePlanApp.onResourceOtherInput(${rowIdx}, this.value)"
            />
          </div>
          <div class="flex justify-between items-center pt-1 border-t border-slate-100 text-[10px]">
            <span class="text-slate-500 font-bold">${list.length} selected</span>
            <button type="button" onclick="coursePlanApp.closeResourceDropdown(${rowIdx})" class="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700">Done</button>
          </div>
        </div>
      </div>
    `;
  }

  addResourceToRow(rowIdx, resourceText) {
    if (!resourceText) return;
    const clean = resourceText.trim();
    const hiddenVal = document.querySelector(`#dtp-res-box-${rowIdx} .dtp-res-value`);
    if (!hiddenVal) return;
    let list = (hiddenVal.value || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!list.includes(clean)) {
      list.push(clean);
      hiddenVal.value = list.join(', ');
      this.updateResourceDisplayTags(rowIdx, list);
    }
  }

  openCourseSyllabusReferenceModal() {
    this.harvestFormInputs();
    const curCode = (this.activePlan && this.activePlan.course_code) ? this.activePlan.course_code.trim() : '';
    if (!curCode) {
      alert('Please select or specify a Course Code in Part-I (Course Information) first to view its syllabus and reference content.');
      this.switchFormTab('part1');
      return;
    }

    const course = (this.syllabusCourses || []).find(c => c.course_code.toLowerCase().trim() === curCode.toLowerCase().trim()) || {
      course_code: curCode,
      course_title: this.activePlan.course_title || 'Selected Course',
      department: this.activePlan.department_name || '',
      semester: this.activePlan.semester || '',
      credits: this.activePlan.credits || '',
      hours: this.activePlan.teaching_hours || '',
      cos: this.activePlan.course_outcomes || []
    };

    document.getElementById('course-syllabus-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'course-syllabus-modal';
    modal.className = 'fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn';

    const units = course.units || [
      { unit: 'Unit I', title: 'Foundations & Concepts', hours: '9 Hours', topics: 'Fundamental concepts, core terminology, theoretical framework, introductory principles.' },
      { unit: 'Unit II', title: 'Methodologies & Implementation', hours: '9 Hours', topics: 'Detailed mechanisms, structural design, execution patterns, problem-solving techniques.' },
      { unit: 'Unit III', title: 'Advanced Analysis & Applications', hours: '9 Hours', topics: 'Component interaction, practical application, case study evaluation, domain workflows.' },
      { unit: 'Unit IV', title: 'Integration & Modern Tools', hours: '9 Hours', topics: 'System integration, modern industry standards, software tools, performance tuning.' },
      { unit: 'Unit V', title: 'Emerging Trends & Capstone Projects', hours: '9 Hours', topics: 'Contemporary advances, security, scalability, comprehensive project implementation.' }
    ];

    const booksStudy = course.books_study || [
      'Standard Department Textbook & Course Learning Material',
      'Prescribed Institutional Study Modules & Lecture Notes'
    ];

    const booksRef = course.books_reference || [
      'Standard Reference Handbook (Latest Edition)',
      'ACM / IEEE Academic References & Monographs'
    ];

    const websites = course.websites || [
      'https://swayam.gov.in - SWAYAM National MOOCs',
      'https://nptel.ac.in - NPTEL Learning Repository',
      'JosTEL LMS Portal - St. Joseph\'s College'
    ];

    const cos = (course.cos && course.cos.length > 0) ? course.cos : (this.activePlan.course_outcomes || []);

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1.5">
              <span class="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-amber-400 text-indigo-950 uppercase tracking-wider shadow-sm">
                ${this.escapeHtml(course.course_code)}
              </span>
              <span class="text-xs bg-white/15 px-2.5 py-1 rounded-lg font-bold text-indigo-100 border border-white/20">
                ${this.escapeHtml(course.course_category || 'Core')}
              </span>
              <span class="text-xs bg-white/15 px-2.5 py-1 rounded-lg font-bold text-indigo-100 border border-white/20">
                Sem ${this.escapeHtml(course.semester_num ? String(course.semester_num) : (course.semester || '—'))}
              </span>
              <span class="text-xs bg-white/15 px-2.5 py-1 rounded-lg font-bold text-indigo-100 border border-white/20">
                ${this.escapeHtml(course.credits || '3')} Credits • ${this.escapeHtml(course.hours || '4')}h/wk
              </span>
            </div>
            <h3 class="text-lg sm:text-xl font-black text-white tracking-tight">
              ${this.escapeHtml(course.course_title || 'Course Syllabus')}
            </h3>
            <p class="text-xs text-indigo-200 mt-0.5">
              ${this.escapeHtml(course.department || this.selectedDept)} • Reference Guide for Course Plan Part-II
            </p>
          </div>
          <button 
            type="button" 
            onclick="document.getElementById('course-syllabus-modal').remove()" 
            class="text-indigo-200 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          
          <!-- Instructions banner -->
          <div class="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-indigo-900">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <i data-lucide="lightbulb" class="w-4 h-4 text-amber-300"></i>
              </div>
              <div class="text-xs">
                <strong class="font-bold">Faculty Quick Fill:</strong> Click <strong>"Insert into Plan"</strong> or <strong>"Copy Topics"</strong> on any unit to populate your Detailed Teaching Plan, or click <strong>"Use as Resource"</strong> to add references directly!
              </div>
            </div>
          </div>

          <!-- Section 1: Course Outcomes (CO1 to CO5) -->
          <div class="space-y-2.5">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <i data-lucide="target" class="w-4 h-4 text-indigo-600"></i>
              <span>Course Outcomes (COs) & Bloom's Levels</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              ${cos.map(co => `
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-1.5 hover:border-indigo-300 transition">
                  <div class="flex items-center justify-between">
                    <span class="font-mono font-black text-indigo-950 text-xs">${this.escapeHtml(co.code || 'CO')}</span>
                    <span class="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">${this.escapeHtml(co.k_level || 'K1')}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 line-clamp-3 leading-snug" title="${this.escapeHtml(co.outcome || '')}">
                    ${this.escapeHtml(co.outcome || 'Course Outcome statement')}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Section 2: Unit-wise Detailed Syllabus Topics -->
          <div class="space-y-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-indigo-600"></i>
              <span>Unit-wise Syllabus Content (Units I to V)</span>
            </h4>
            
            <div class="space-y-2.5">
              ${units.map((u, uIdx) => `
                <div class="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition space-y-2">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10.5px]">
                        ${this.escapeHtml(u.unit)}
                      </span>
                      <strong class="text-xs font-black text-slate-900">
                        ${this.escapeHtml(u.title || '')}
                      </strong>
                      <span class="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                        ${this.escapeHtml(u.hours || '9 Hours')}
                      </span>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <button 
                        type="button" 
                        onclick="coursePlanApp.copySyllabusText('${this.escapeHtml(u.topics).replace(/'/g, "\\'")}', this)" 
                        class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
                        title="Copy unit topics to clipboard"
                      >
                        <i data-lucide="copy" class="w-3 h-3"></i> Copy Topics
                      </button>
                      <button 
                        type="button" 
                        onclick="coursePlanApp.insertUnitIntoTeachingPlan('${this.escapeHtml(u.unit)}', '${this.escapeHtml(u.topics).replace(/'/g, "\\'")}', '${uIdx + 1}')" 
                        class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
                        title="Add this unit as a row into Detailed Teaching Plan"
                      >
                        <i data-lucide="plus-circle" class="w-3 h-3"></i> Insert into Plan
                      </button>
                    </div>
                  </div>

                  <p class="text-xs text-slate-700 leading-relaxed font-sans select-all bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    ${this.escapeHtml(u.topics)}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Section 3: Learning Resources & References -->
          <div class="space-y-3 pt-2 border-t border-slate-200">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <i data-lucide="book-marked" class="w-4 h-4 text-indigo-600"></i>
              <span>Prescribed Books & Learning Resources</span>
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Books for Study -->
              <div class="space-y-2 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
                <div class="font-black text-amber-950 text-xs flex items-center gap-1.5">
                  <i data-lucide="book" class="w-3.5 h-3.5 text-amber-700"></i>
                  <span>Books for Study (Textbooks)</span>
                </div>
                <div class="space-y-2">
                  ${booksStudy.map(b => `
                    <div class="p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs flex flex-col justify-between gap-1.5">
                      <div class="text-xs text-slate-800 font-medium leading-snug">${this.escapeHtml(b)}</div>
                      <div class="flex justify-end">
                        <button 
                          type="button" 
                          onclick="coursePlanApp.useResourceInTeachingPlan('${this.escapeHtml(b).replace(/'/g, "\\'")}')" 
                          class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded text-[10.5px] transition flex items-center gap-1 cursor-pointer"
                          title="Add this book to Detailed Teaching Plan Learning Resources"
                        >
                          <i data-lucide="plus" class="w-3 h-3"></i> Use as Resource
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Books for Reference -->
              <div class="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div class="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <i data-lucide="bookmark" class="w-3.5 h-3.5 text-slate-700"></i>
                  <span>Books for Reference</span>
                </div>
                <div class="space-y-2">
                  ${booksRef.map(b => `
                    <div class="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-1.5">
                      <div class="text-xs text-slate-800 font-medium leading-snug">${this.escapeHtml(b)}</div>
                      <div class="flex justify-end">
                        <button 
                          type="button" 
                          onclick="coursePlanApp.useResourceInTeachingPlan('${this.escapeHtml(b).replace(/'/g, "\\'")}')" 
                          class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[10.5px] transition flex items-center gap-1 cursor-pointer"
                          title="Add this reference to Detailed Teaching Plan Learning Resources"
                        >
                          <i data-lucide="plus" class="w-3 h-3"></i> Use as Resource
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Websites and eLearning Sources -->
            <div class="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
              <div class="font-black text-blue-950 text-xs flex items-center gap-1.5">
                <i data-lucide="globe" class="w-3.5 h-3.5 text-blue-700"></i>
                <span>Websites & eLearning Sources</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${websites.map(w => `
                  <div class="p-2 rounded-xl bg-white border border-blue-200 shadow-2xs flex items-center justify-between gap-2">
                    <span class="text-xs text-blue-800 truncate font-mono" title="${this.escapeHtml(w)}">
                      ${this.escapeHtml(w)}
                    </span>
                    <button 
                      type="button" 
                      onclick="coursePlanApp.useResourceInTeachingPlan('${this.escapeHtml(w).replace(/'/g, "\\'")}')" 
                      class="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded text-[10.5px] transition shrink-0 cursor-pointer"
                      title="Add web source to Detailed Teaching Plan"
                    >
                      Use
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span class="text-slate-500 text-xs">
            Tip: You can re-open this reference guide anytime while editing Part-II.
          </span>
          <button 
            type="button" 
            onclick="document.getElementById('course-syllabus-modal').remove()" 
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  copySyllabusText(text, btnEl) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (btnEl) {
        const orig = btnEl.innerHTML;
        btnEl.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> Copied!`;
        setTimeout(() => { btnEl.innerHTML = orig; if (window.lucide) window.lucide.createIcons(); }, 1800);
      }
    }).catch(() => {
      prompt('Copy unit topics:', text);
    });
  }

  insertUnitIntoTeachingPlan(unit, topics, coNum) {
    this.harvestFormInputs();
    if (!this.activePlan.detailed_teaching_plan) this.activePlan.detailed_teaching_plan = [];

    let targetRow = this.activePlan.detailed_teaching_plan.find(r => r.unit === unit && !r.from_topic && !r.to_topic);
    if (targetRow) {
      targetRow.from_topic = topics.length > 80 ? topics.slice(0, 75) + '...' : topics;
      targetRow.to_topic = topics.length > 80 ? topics.slice(75) : '';
      targetRow.hours = '2';
      targetRow.cos = `CO${coNum}`;
      if (!targetRow.resources) targetRow.resources = 'Text Book / Study Material';
    } else {
      this.activePlan.detailed_teaching_plan.push({
        month_days: 'Ongoing',
        unit: unit,
        from_topic: topics.length > 80 ? topics.slice(0, 75) + '...' : topics,
        to_topic: topics.length > 80 ? topics.slice(75) : '',
        hours: '2',
        cos: `CO${coNum}`,
        methodology: 'Lecture-based Learning',
        resources: 'Text Book / Study Material'
      });
    }

    document.getElementById('course-syllabus-modal')?.remove();
    this.render();
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-fadeIn';
    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> ${unit} topics inserted into Teaching Plan!`;
    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => toast.remove(), 2500);
  }

  useResourceInTeachingPlan(resourceText) {
    if (!resourceText) return;
    this.harvestFormInputs();
    const dtp = this.activePlan.detailed_teaching_plan || [];
    if (dtp.length === 0) {
      alert('Please add a row in the Detailed Teaching Plan table first.');
      return;
    }

    let addedCount = 0;
    dtp.forEach((row, i) => {
      let list = (row.resources || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!list.includes(resourceText.trim())) {
        list.push(resourceText.trim());
        row.resources = list.join(', ');
        addedCount++;
        const hiddenVal = document.querySelector(`#dtp-res-box-${i} .dtp-res-value`);
        if (hiddenVal) {
          hiddenVal.value = row.resources;
          this.updateResourceDisplayTags(i, list);
        }
      }
    });

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 z-50 bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-fadeIn';
    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Added to Learning Resources!`;
    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => toast.remove(), 2200);
  }


  formatDateToDDMMYYYY(dateStr) {
    if (!dateStr) return '';
    const trimmed = String(dateStr).trim();
    if (trimmed.includes(' to ')) {
      const parts = trimmed.split(' to ');
      return `${this.formatDateToDDMMYYYY(parts[0])} to ${this.formatDateToDDMMYYYY(parts[1])}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-');
      return `${d}-${m}-${y}`;
    }
    return trimmed;
  }

  onDtpMethodChange(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const otherInput = row.querySelector('.dtp-method-other');
    if (otherInput) {
      if (selectEl.value === 'Others') {
        otherInput.classList.remove('hidden');
        otherInput.focus();
      } else {
        otherInput.classList.add('hidden');
      }
    }
  }

  onDtpResourceChange(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const otherInput = row.querySelector('.dtp-res-other');
    if (otherInput) {
      if (selectEl.value === 'Others') {
        otherInput.classList.remove('hidden');
        otherInput.focus();
      } else {
        otherInput.classList.add('hidden');
      }
    }
  }

  onAsstCatChange(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const otherInput = row.querySelector('.asst-cat-other');
    if (otherInput) {
      if (selectEl.value === 'Others') {
        otherInput.classList.remove('hidden');
        otherInput.focus();
      } else {
        otherInput.classList.add('hidden');
      }
    }
  }

  onICTToolChange(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const otherInput = row.querySelector('.ict-tool-other');
    if (otherInput) {
      if (selectEl.value === 'Others') {
        otherInput.classList.remove('hidden');
        otherInput.focus();
      } else {
        otherInput.classList.add('hidden');
      }
    }
  }

  onICTPlatformChange(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const otherInput = row.querySelector('.ict-platform-other');
    if (otherInput) {
      if (selectEl.value === 'Others') {
        otherInput.classList.remove('hidden');
        otherInput.focus();
      } else {
        otherInput.classList.add('hidden');
      }
    }
  }

  onActivityDropdownChange(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const otherInput = row.querySelector('.act-other-name');
    if (otherInput) {
      if (selectEl.value === 'Others') {
        otherInput.classList.remove('hidden');
        otherInput.focus();
      } else {
        otherInput.classList.add('hidden');
      }
    }
  }

  onICTToolChange(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const otherInput = row.querySelector('.ict-other-tool');
    if (otherInput) {
      if (selectEl.value === 'Others') {
        otherInput.classList.remove('hidden');
        otherInput.focus();
      } else {
        otherInput.classList.add('hidden');
      }
    }
  }

  onICTPlatformChange(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const otherInput = row.querySelector('.ict-other-platform');
    if (otherInput) {
      if (selectEl.value === 'Others') {
        otherInput.classList.remove('hidden');
        otherInput.focus();
      } else {
        otherInput.classList.add('hidden');
      }
    }
  }

  switchHODTab(tab) {
    this.hodTab = tab;
    this.render();
  }

  async quickApprovePlan(planId) {
    if (!confirm('Are you sure you want to approve this course plan and transmit it to IQAC?')) return;
    try {
      const res = await fetch('api/course_plan.php?action=hod_action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: planId,
          decision: 'Approved',
          hod_name: this.currentUser ? this.currentUser.display_name : 'Head of Department',
          hod_comments: 'Verified and approved by HOD.'
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('✓ Course plan approved successfully and published to IQAC!');
        this.fetchPlans().then(() => this.render());
      } else {
        alert(json.error || 'Failed to approve course plan');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while approving course plan');
    }
  }

  switchAdminTab(tab) {
    this.adminTab = tab;
    if (tab === 'analytics' || tab === 'report') {
      if (!this.analyticsData && !this.analyticsLoading) {
        this.loadAnalyticsData();
      }
    }
    this.render();
  }

  async loadAnalyticsData(force = false) {
    if (this.analyticsData && !force) return this.analyticsData;
    this.analyticsLoading = true;
    try {
      let url = 'api/course_plan.php?action=analytics_data';
      if (this.adminAnalyticsDept && this.adminAnalyticsDept !== 'all') {
        url += `&department=${encodeURIComponent(this.adminAnalyticsDept)}`;
      }
      if (this.adminAnalyticsStatus && this.adminAnalyticsStatus !== 'all') {
        url += `&status=${encodeURIComponent(this.adminAnalyticsStatus)}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        this.analyticsData = json;
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      this.analyticsLoading = false;
      if (this.adminTab === 'analytics' || this.adminTab === 'report') {
        this.render();
      }
    }
    return this.analyticsData;
  }

  onAnalyticsFilterChange(filterType, val) {
    if (filterType === 'status') this.adminAnalyticsStatus = val;
    if (filterType === 'dept') this.adminAnalyticsDept = val;
    if (filterType === 'stream') this.adminAnalyticsStream = val;
    this.render();
  }

  printInstitutionalReport() {
    if (this.adminTab !== 'report') {
      this.switchAdminTab('report');
      setTimeout(() => window.print(), 350);
    } else {
      window.print();
    }
  }

  exportInstitutionalReportCSV() {
    const rows = [
      ['S.No', 'Department', 'Faculty Strength', 'Plans Submitted', 'Plans Approved', 'Master Syllabus Courses', 'Coverage (%)', 'Planned Teaching Hours', 'Audit Status']
    ];
    const data = this.analyticsData || {};
    const deptStats = data.dept_stats || {};
    
    this.departments.forEach((d, idx) => {
      const dStat = deptStats[d.name] || { total: 0, approved: 0, hours: 0, faculty_count: d.faculty ? d.faculty.length : 0 };
      const sylCount = this.getDepartmentEvenSyllabusCount(d.name);
      const covPct = sylCount > 0 ? Math.min(100, Math.round((dStat.approved / sylCount) * 100)) : (dStat.approved > 0 ? 100 : 0);
      const statusText = dStat.approved > 0 ? 'Approved & Certified' : (dStat.total > 0 ? 'Under Review' : 'Pending Submission');
      rows.push([
        idx + 1,
        `"${d.name.replace(/"/g, '""')}"`,
        d.faculty ? d.faculty.length : (dStat.faculty_count || 0),
        dStat.total,
        dStat.approved,
        sylCount,
        `${covPct}%`,
        dStat.hours,
        statusText
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SJC_IQAC_Course_Plan_Institutional_Report_2026_27.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  getDepartmentEvenSyllabusCount(deptName) {
    if (!this.syllabusCourses || this.syllabusCourses.length === 0) return 0;
    let count = 0;
    this.syllabusCourses.forEach(c => {
      if (this.isDeptMatch(c.department, deptName) && [2, 4, 6].includes(Number(c.semester_num))) {
        count++;
      }
    });
    return count;
  }

  switchAdminManageSubTab(subTab) {
    this.adminManageSubTab = subTab;
    this.render();
  }

  openAddFacultyModal(existingFac = null, deptName = '') {
    const modalId = 'admin-faculty-modal';
    let el = document.getElementById(modalId);
    if (!el) {
      el = document.createElement('div');
      el.id = modalId;
      document.body.appendChild(el);
    }
    const isEdit = !!existingFac;
    const curDept = deptName || (existingFac ? existingFac.dept : this.selectedDept);

    el.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-scaleIn space-y-4 max-h-[92vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="user-plus" class="w-5 h-5 text-indigo-600"></i>
              <span>${isEdit ? 'Edit Faculty Member' : 'Add New Faculty Member'}</span>
            </h3>
            <button type="button" onclick="document.getElementById('${modalId}').innerHTML = ''" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
          </div>

          <div class="space-y-3.5 text-xs">
            <input type="hidden" id="af-old-name" value="${isEdit ? existingFac.name : ''}" />
            <div>
              <label class="block font-bold text-slate-700 mb-1">Department *</label>
              <select id="af-dept" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white">
                ${this.departments.map(d => `
                  <option value="${d.name}" ${d.name === curDept ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Faculty Name (with Title) *</label>
              <input type="text" id="af-name" value="${isEdit ? existingFac.name : ''}" placeholder="e.g. Dr. K. Soundararajan" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Shift</label>
                <select id="af-shift" class="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold">
                  <option value="I" ${isEdit && existingFac.shift === 'I' ? 'selected' : ''}>Shift I</option>
                  <option value="II" ${isEdit && existingFac.shift === 'II' ? 'selected' : ''}>Shift II</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Role / Category</label>
                <input type="text" id="af-category" value="${isEdit ? (existingFac.category || 'Faculty') : 'Faculty'}" placeholder="e.g. Faculty / Coordinator / HOD" class="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              </div>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Institutional Email *</label>
              <input type="email" id="af-email" value="${isEdit ? (existingFac.email || '') : ''}" placeholder="e.g. name@mail.sjctni.edu" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button type="button" onclick="document.getElementById('${modalId}').innerHTML = ''" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">Cancel</button>
            <button type="button" onclick="coursePlanApp.submitAdminFaculty()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Save Faculty</span>
            </button>
          </div>
        </div>
      </div>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  async submitAdminFaculty() {
    const oldName = document.getElementById('af-old-name')?.value || '';
    const deptName = document.getElementById('af-dept')?.value || '';
    const facName = document.getElementById('af-name')?.value?.trim() || '';
    const shift = document.getElementById('af-shift')?.value || 'I';
    const category = document.getElementById('af-category')?.value?.trim() || 'Faculty';
    const email = document.getElementById('af-email')?.value?.trim() || '';

    if (!deptName || !facName) {
      alert('Department and Faculty Name are required.');
      return;
    }

    try {
      const res = await fetch('api/course_plan.php?action=admin_manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'save_faculty',
          department_name: deptName,
          faculty_name: facName,
          old_faculty_name: oldName,
          email,
          shift,
          category
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('✓ ' + json.message);
        document.getElementById('admin-faculty-modal').innerHTML = '';
        await this.loadDepartmentsData();
        this.render();
      } else {
        alert(json.error || 'Failed to save faculty');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving faculty member');
    }
  }

  async deleteAdminFaculty(deptName, facName) {
    if (!confirm(`Are you sure you want to remove "${facName}" from ${deptName}?`)) return;
    try {
      const res = await fetch('api/course_plan.php?action=admin_manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'delete_faculty',
          department_name: deptName,
          faculty_name: facName
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('✓ ' + json.message);
        await this.loadDepartmentsData();
        this.render();
      } else {
        alert(json.error || 'Failed to remove faculty');
      }
    } catch (e) {
      console.error(e);
    }
  }

  openAddCourseModal(existingCourse = null) {
    const modalId = 'admin-course-modal';
    let el = document.getElementById(modalId);
    if (!el) {
      el = document.createElement('div');
      el.id = modalId;
      document.body.appendChild(el);
    }
    const isEdit = !!existingCourse;

    el.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
        <div class="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-scaleIn space-y-4 max-h-[92vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="book-plus" class="w-5 h-5 text-indigo-600"></i>
              <span>${isEdit ? 'Edit Syllabus Course' : 'Add New Course to Syllabus'}</span>
            </h3>
            <button type="button" onclick="document.getElementById('${modalId}').innerHTML = ''" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
          </div>

          <div class="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <input type="hidden" id="ac-old-code" value="${isEdit ? existingCourse.course_code : ''}" />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Course Code *</label>
                <input type="text" id="ac-code" value="${isEdit ? existingCourse.course_code : ''}" placeholder="e.g. 25UCS23CC03" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono uppercase" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Department *</label>
                <select id="ac-dept" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white">
                  ${this.departments.map(d => `
                    <option value="${d.name}" ${isEdit && existingCourse.department === d.name ? 'selected' : ''}>${d.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Course Title *</label>
              <input type="text" id="ac-title" value="${isEdit ? existingCourse.course_title : ''}" placeholder="e.g. Core Course - 3: Python Programming" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Semester</label>
                <select id="ac-sem" class="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold">
                  <option value="Semester 2" ${isEdit && existingCourse.semester === 'Semester 2' ? 'selected' : ''}>Semester 2</option>
                  <option value="Semester 4" ${isEdit && existingCourse.semester === 'Semester 4' ? 'selected' : ''}>Semester 4</option>
                  <option value="Semester 6" ${isEdit && existingCourse.semester === 'Semester 6' ? 'selected' : ''}>Semester 6</option>
                  <option value="Semester 1" ${isEdit && existingCourse.semester === 'Semester 1' ? 'selected' : ''}>Semester 1</option>
                  <option value="Semester 3" ${isEdit && existingCourse.semester === 'Semester 3' ? 'selected' : ''}>Semester 3</option>
                  <option value="Semester 5" ${isEdit && existingCourse.semester === 'Semester 5' ? 'selected' : ''}>Semester 5</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Hours / Week</label>
                <input type="number" id="ac-hours" value="${isEdit ? (existingCourse.hours || '4') : '4'}" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-center" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Credits</label>
                <input type="number" id="ac-credits" value="${isEdit ? (existingCourse.credits || '3') : '3'}" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-center" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Programme</label>
                <input type="text" id="ac-prog" value="${isEdit ? (existingCourse.programme || '') : ''}" placeholder="e.g. B.Sc. Computer Science" class="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Level / Batch</label>
                <select id="ac-level" class="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold">
                  <option value="UG" ${isEdit && existingCourse.level === 'UG' ? 'selected' : ''}>UG (I / II / III UG)</option>
                  <option value="PG" ${isEdit && existingCourse.level === 'PG' ? 'selected' : ''}>PG (I / II PG)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button type="button" onclick="document.getElementById('${modalId}').innerHTML = ''" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">Cancel</button>
            <button type="button" onclick="coursePlanApp.submitAdminCourse()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Save Course</span>
            </button>
          </div>
        </div>
      </div>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  async submitAdminCourse() {
    const oldCode = document.getElementById('ac-old-code')?.value || '';
    const code = document.getElementById('ac-code')?.value?.trim().toUpperCase() || '';
    const title = document.getElementById('ac-title')?.value?.trim() || '';
    const dept = document.getElementById('ac-dept')?.value || '';
    const sem = document.getElementById('ac-sem')?.value || 'Semester 2';
    const hours = document.getElementById('ac-hours')?.value?.trim() || '4';
    const credits = document.getElementById('ac-credits')?.value?.trim() || '3';
    const prog = document.getElementById('ac-prog')?.value?.trim() || '';
    const level = document.getElementById('ac-level')?.value || 'UG';

    if (!code || !title || !dept) {
      alert('Course Code, Title, and Department are required.');
      return;
    }

    try {
      const res = await fetch('api/course_plan.php?action=admin_manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'save_course',
          course_code: code,
          old_course_code: oldCode,
          course_title: title,
          department: dept,
          programme: prog,
          semester: sem,
          hours,
          credits,
          level
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('✓ ' + json.message);
        document.getElementById('admin-course-modal').innerHTML = '';
        await this.loadSyllabusData();
        this.render();
      } else {
        alert(json.error || 'Failed to save course');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving course');
    }
  }

  openAddDepartmentModal(existingDept = null) {
    const modalId = 'admin-dept-modal';
    let el = document.getElementById(modalId);
    if (!el) {
      el = document.createElement('div');
      el.id = modalId;
      document.body.appendChild(el);
    }
    const isEdit = !!existingDept;

    el.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn space-y-5">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="building-2" class="w-5 h-5 text-indigo-600"></i>
              <span>${isEdit ? 'Edit Department' : 'Add New Department'}</span>
            </h3>
            <button type="button" onclick="document.getElementById('${modalId}').innerHTML = ''" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
          </div>

          <div class="space-y-3.5 text-xs">
            <input type="hidden" id="ad-old-name" value="${isEdit ? existingDept.name : ''}" />
            <div>
              <label class="block font-bold text-slate-700 mb-1">Department Name *</label>
              <input type="text" id="ad-name" value="${isEdit ? existingDept.name : ''}" placeholder="e.g. Artificial Intelligence" class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button type="button" onclick="document.getElementById('${modalId}').innerHTML = ''" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">Cancel</button>
            <button type="button" onclick="coursePlanApp.submitAdminDepartment()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Save Department</span>
            </button>
          </div>
        </div>
      </div>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  async submitAdminDepartment() {
    const oldName = document.getElementById('ad-old-name')?.value || '';
    const deptName = document.getElementById('ad-name')?.value?.trim() || '';

    if (!deptName) {
      alert('Department Name is required.');
      return;
    }

    try {
      const res = await fetch('api/course_plan.php?action=admin_manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'save_department',
          department_name: deptName,
          old_department_name: oldName
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('✓ ' + json.message);
        document.getElementById('admin-dept-modal').innerHTML = '';
        await this.loadDepartmentsData();
        this.render();
      } else {
        alert(json.error || 'Failed to save department');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving department');
    }
  }


  async loadDepartmentsData() {
    try {
      const res = await fetch('data/departments_faculty.json');
      const json = await res.json();
      this.departments = json.departments || [];
    } catch (e) {
      console.error('Failed to load departments faculty data', e);
      this.departments = [];
    }
  }

  async checkAuth() {
    try {
      const res = await fetch('api/course_plan.php?action=auth_check');
      const json = await res.json();
      if (json.success && json.authenticated) {
        this.currentUser = json.user;
        if (this.currentUser.department_name) {
          this.selectedDept = this.currentUser.department_name;
        }
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  async fetchPlans() {
    try {
      let url = 'api/course_plan.php?action=list';
      if (this.currentUser && this.currentUser.role === 'admin') {
        if (this.adminFilter !== 'all') url += `&status=${encodeURIComponent(this.adminFilter)}`;
        if (this.adminDeptFilter !== 'all') url += `&department=${encodeURIComponent(this.adminDeptFilter)}`;
      } else if (this.currentUser && this.currentUser.role === 'faculty') {
        url += `&department=${encodeURIComponent(this.currentUser.department_name)}&faculty_name=${encodeURIComponent(this.currentUser.faculty_name)}`;
      } else {
        url += `&department=${encodeURIComponent(this.selectedDept)}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        this.plans = json.data || [];
      } else {
        this.plans = [];
      }
    } catch (e) {
      console.warn('Could not fetch plans', e);
      this.plans = [];
    }
  }

  getCurrentDepartmentObj() {
    return this.departments.find(d => d.name === this.selectedDept || d.name.toLowerCase() === this.selectedDept.toLowerCase()) || this.departments[0] || { name: this.selectedDept, faculty: [] };
  }

  // ================= MAIN RENDER =================
  render() {
    const root = document.getElementById('course-plan-root');
    if (!root) return;

    this.renderHeaderBar();

    if (this.viewMode === 'login' || !this.currentUser) {
      root.innerHTML = this.renderLoginHtml();
    } else if (this.viewMode === 'form') {
      root.innerHTML = this.renderFormHtml();
      this.calculateTotalHours();
    } else if (this.viewMode === 'print') {
      root.innerHTML = this.renderPrintHtml();
    } else {
      // Dashboard view based on user role
      if (this.currentUser.role === 'admin') {
        root.innerHTML = this.renderAdminDashboardHtml();
      } else if (this.currentUser.role === 'hod') {
        root.innerHTML = this.renderHODDashboardHtml();
      } else {
        root.innerHTML = this.renderFacultyDashboardHtml();
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Render Dynamic Header Bar Info
  renderHeaderBar() {
    const authStatusEl = document.getElementById('header-auth-section');
    if (!authStatusEl) return;

    if (this.currentUser) {
      const isHOD = this.currentUser.role === 'hod';
      const isFaculty = this.currentUser.role === 'faculty';
      const roleBadge = isHOD ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        isFaculty ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        'bg-purple-100 text-purple-900 border border-purple-300';
      const roleIcon = isHOD ? 'shield-check' : isFaculty ? 'user-check' : 'crown';
      const roleTitle = isHOD ? 'Head of Department' : isFaculty ? 'Faculty Member' : 'IQAC Admin';

      authStatusEl.innerHTML = `
        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          ${isFaculty ? `
            <button 
              type="button" 
              onclick="coursePlanApp.navigateTo('/course-plan/dashboard')" 
              class="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>
              <span>Dashboard</span>
            </button>
          ` : isHOD ? `
            <button 
              type="button" 
              onclick="coursePlanApp.navigateTo('/course-plan/hod')" 
              class="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>
              <span>HOD Portal</span>
            </button>
          ` : `
            <button 
              type="button" 
              onclick="coursePlanApp.navigateTo('/course-plan/admin')" 
              class="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>
              <span>Admin Hub</span>
            </button>
          `}
          <span class="px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold ${roleBadge} flex items-center gap-1 max-w-[130px] sm:max-w-xs truncate" title="${this.escapeHtml(this.currentUser.display_name || this.currentUser.faculty_name || 'User')}">
            <i data-lucide="${roleIcon}" class="w-3.5 h-3.5 shrink-0"></i>
            <span class="truncate">${this.escapeHtml(this.currentUser.display_name || this.currentUser.faculty_name || 'User')}</span>
          </span>
          <a 
            href="manual.html" 
            target="_blank" 
            class="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1 cursor-pointer shadow-2xs" 
            title="Open User Manual with Screenshots"
          >
            <i data-lucide="book-open" class="w-3.5 h-3.5 text-indigo-600"></i>
            <span>User Manual</span>
          </a>
          <button 
            type="button" 
            onclick="coursePlanApp.logout()" 
            class="px-2.5 sm:px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-[11px] sm:text-xs transition border border-rose-200 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      `;
    } else {
      authStatusEl.innerHTML = `
        <a 
          href="manual.html" 
          target="_blank" 
          class="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1 cursor-pointer shadow-2xs" 
          title="Open User Manual with Screenshots"
        >
          <i data-lucide="book-open" class="w-3.5 h-3.5 text-indigo-600"></i>
          <span>User Manual</span>
        </a>
      `;
    }
  }

  // ================= 0. AUTHENTICATION & LOGIN VIEW =================
  renderLoginHtml() {
    const tab = this.loginTab || 'faculty';
    const deptObj = this.departments.find(d => d.name === (this.selectedLoginDept || this.selectedDept)) || this.departments[0] || { name: '', faculty: [] };
    const facultyList = deptObj.faculty || [];
    const currentDeptName = deptObj.name;
    const currentFacName = this.selectedLoginFaculty || (facultyList.length > 0 ? (typeof facultyList[0] === 'string' ? facultyList[0] : facultyList[0].name) : '');

    return `
      <div class="min-h-[80vh] flex items-center justify-center py-10 px-4 animate-fadeIn">
        <div class="w-full max-w-xl">
          <!-- Institutional Brand Card Header -->
          <div class="text-center mb-8 space-y-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black uppercase tracking-wider">
              <i data-lucide="award" class="w-3.5 h-3.5 text-indigo-600"></i>
              <span>Internal Quality Assurance Cell (IQAC)</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              St. Joseph’s College <span class="text-xs font-bold text-slate-500 uppercase block sm:inline">(Autonomous)</span>
            </h1>
            <p class="text-xs font-bold text-slate-600 uppercase tracking-widest">
              Tiruchirappalli – 620 002 • Accredited at A++ Grade (Cycle IV) by NAAC
            </p>
            <div class="inline-block mt-1 text-sm font-black text-indigo-700 bg-indigo-50/80 px-4 py-1 rounded-xl border border-indigo-200">
              Course Plan Portal – Academic Year 2026–2027
            </div>
          </div>

          <!-- Main Login Box -->
          <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <!-- Role Tabs Header -->
            <div class="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-1.5 gap-1 text-xs font-bold">
              <button 
                type="button" 
                onclick="coursePlanApp.setLoginTab('faculty')" 
                class="py-2.5 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer ${tab === 'faculty' ? 'bg-white text-indigo-700 shadow-sm font-black ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}"
              >
                <i data-lucide="user-check" class="w-4 h-4 text-indigo-600"></i>
                <span>Faculty</span>
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.setLoginTab('hod')" 
                class="py-2.5 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer ${tab === 'hod' ? 'bg-white text-indigo-700 shadow-sm font-black ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}"
              >
                <i data-lucide="shield-check" class="w-4 h-4 text-amber-600"></i>
                <span>HOD</span>
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.setLoginTab('admin')" 
                class="py-2.5 px-3 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer ${tab === 'admin' ? 'bg-white text-indigo-700 shadow-sm font-black ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}"
              >
                <i data-lucide="crown" class="w-4 h-4 text-purple-600"></i>
                <span>IQAC Admin</span>
              </button>
            </div>

            <!-- Tab Content Forms -->
            <div class="p-6 sm:p-8 space-y-6">
              
              <!-- Error Notification Box -->
              <div id="login-error-msg" class="hidden p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-shake">
                <i data-lucide="alert-circle" class="w-4 h-4 shrink-0 text-rose-600"></i>
                <span class="error-text">Authentication failed</span>
              </div>

              ${tab === 'faculty' ? `
                <!-- 1. Faculty Login Form -->
                <form onsubmit="event.preventDefault(); coursePlanApp.loginFaculty(event);" class="space-y-4">
                  <div class="space-y-1">
                    <h2 class="text-lg font-black text-slate-900">Faculty Sign In</h2>
                    <p class="text-xs text-slate-500 font-medium">Enter your Staff Code (Faculty ID) and ERP password to access your course plans.</p>
                  </div>

                  <!-- Staff Code / Faculty ID Input -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span class="flex items-center gap-1.5">
                        <i data-lucide="id-card" class="w-3.5 h-3.5 text-indigo-600"></i>
                        <span>Staff Code / Faculty ID *</span>
                      </span>
                      <span class="text-[10.5px] font-semibold text-slate-400">e.g., 24CAI51, 26PEN01</span>
                    </label>
                    <input 
                      type="text" 
                      id="login-fac-id" 
                      class="w-full text-xs sm:text-sm px-3.5 py-2.5 border-2 border-slate-200 rounded-2xl bg-white font-mono font-bold text-slate-900 uppercase focus:border-indigo-600 focus:outline-none transition"
                      placeholder="Enter Staff Code (e.g., 24CAI51)"
                      autocomplete="username"
                    />
                  </div>

                  <!-- Toggle for Department / Name Dropdown -->
                  <div class="pt-0.5">
                    <button 
                      type="button" 
                      onclick="document.getElementById('fac-dept-dropdown-wrap').classList.toggle('hidden');" 
                      class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
                      <span>Or sign in by selecting Department & Faculty Name</span>
                    </button>
                  </div>

                  <!-- Department Dropdown Container (collapsible) -->
                  <div id="fac-dept-dropdown-wrap" class="hidden space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <!-- Department Dropdown -->
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <i data-lucide="building-2" class="w-3.5 h-3.5 text-indigo-600"></i>
                        <span>Department</span>
                      </label>
                      <select 
                        id="login-fac-dept" 
                        onchange="coursePlanApp.onLoginDeptChange(this.value)" 
                        class="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:border-indigo-600 focus:outline-none transition cursor-pointer"
                      >
                        ${this.departments.map(d => `
                          <option value="${this.escapeHtml(d.name)}" ${d.name === currentDeptName ? 'selected' : ''}>
                            ${this.escapeHtml(d.name)}
                          </option>
                        `).join('')}
                      </select>
                    </div>

                    <!-- Faculty Name Dropdown (Dynamically updated based on selected dept) -->
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <i data-lucide="user" class="w-3.5 h-3.5 text-indigo-600"></i>
                        <span>Faculty Name</span>
                      </label>
                      <select 
                        id="login-fac-name" 
                        onchange="coursePlanApp.onLoginFacultyChange(this.value)" 
                        class="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 bg-white rounded-xl font-bold text-slate-900 focus:border-indigo-600 focus:outline-none transition cursor-pointer"
                      >
                        ${facultyList.map(f => {
                          const name = typeof f === 'string' ? f : f.name;
                          return `<option value="${this.escapeHtml(name)}" ${name === currentFacName ? 'selected' : ''}>${this.escapeHtml(name)}</option>`;
                        }).join('')}
                      </select>
                    </div>
                  </div>

                  <!-- Password Field -->
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <label class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <i data-lucide="lock" class="w-3.5 h-3.5 text-indigo-600"></i>
                        <span>Password *</span>
                      </label>
                    </div>
                    <div class="relative">
                      <input 
                        type="password" 
                        id="login-fac-password" 
                        required 
                        class="w-full text-xs sm:text-sm px-3.5 py-2.5 border-2 border-slate-200 rounded-2xl bg-white font-mono font-bold text-slate-900 focus:border-indigo-600 focus:outline-none transition pr-10"
                        placeholder="Enter your password"
                        autocomplete="current-password"
                      />
                      <button 
                        type="button" 
                        onclick="coursePlanApp.togglePasswordVisibility('login-fac-password')" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Show/Hide Password"
                      >
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </button>
                    </div>
                    <div class="text-[11px] text-slate-400 font-medium">
                      Enter your College ERP credentials password.
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <div class="pt-2">
                    <button 
                      type="submit" 
                      id="login-submit-btn" 
                      class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Sign In to Faculty Portal</span>
                      <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                  </div>
                </form>
              ` : tab === 'hod' ? `
                <!-- 2. HOD Login Form -->
                <form onsubmit="event.preventDefault(); coursePlanApp.loginHOD(event);" class="space-y-4">
                  <div class="space-y-1">
                    <h2 class="text-lg font-black text-slate-900">Head of Department (HOD) Sign In</h2>
                    <p class="text-xs text-slate-500 font-medium">Access your department review dashboard to approve or review faculty submissions.</p>
                  </div>

                  <!-- Department Dropdown -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i data-lucide="building-2" class="w-3.5 h-3.5 text-amber-600"></i>
                      <span>Department *</span>
                    </label>
                    <select 
                      id="login-hod-dept" 
                      class="w-full text-xs sm:text-sm px-3.5 py-2.5 border-2 border-slate-200 rounded-2xl bg-white font-bold text-slate-900 focus:border-amber-600 focus:outline-none transition cursor-pointer"
                      required
                    >
                      ${this.departments.map(d => `
                        <option value="${this.escapeHtml(d.name)}" ${d.name === currentDeptName ? 'selected' : ''}>
                          ${this.escapeHtml(d.name)}
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- Password Field -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i data-lucide="lock" class="w-3.5 h-3.5 text-amber-600"></i>
                      <span>HOD Password *</span>
                    </label>
                    <div class="relative">
                      <input 
                        type="password" 
                        id="login-hod-password" 
                        value="123" 
                        required 
                        class="w-full text-xs sm:text-sm px-3.5 py-2.5 border-2 border-slate-200 rounded-2xl bg-white font-mono font-bold text-slate-900 focus:border-amber-600 focus:outline-none transition pr-10"
                        placeholder="Enter HOD password"
                      />
                      <button 
                        type="button" 
                        onclick="coursePlanApp.togglePasswordVisibility('login-hod-password')" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <div class="pt-2">
                    <button 
                      type="submit" 
                      id="login-hod-btn" 
                      onclick="coursePlanApp.loginHOD(event)"
                      class="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold rounded-2xl shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Sign In as Head of Department</span>
                      <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                  </div>
                </form>
              ` : `
                <!-- 3. Admin Login Form -->
                <form onsubmit="event.preventDefault(); coursePlanApp.loginAdmin(event);" class="space-y-4">
                  <div class="space-y-1">
                    <h2 class="text-lg font-black text-slate-900">IQAC Admin Portal</h2>
                    <p class="text-xs text-slate-500 font-medium">Institution-wide course plan monitoring, analytics, and department oversight.</p>
                  </div>

                  <!-- Username Field -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i data-lucide="shield" class="w-3.5 h-3.5 text-purple-600"></i>
                      <span>Admin Username *</span>
                    </label>
                    <input 
                      type="text" 
                      id="login-admin-user" 
                      value="admin" 
                      required 
                      class="w-full text-xs sm:text-sm px-3.5 py-2.5 border-2 border-slate-200 rounded-2xl bg-white font-bold text-slate-900 focus:border-purple-600 focus:outline-none transition"
                      placeholder="Username"
                    />
                  </div>

                  <!-- Password Field -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i data-lucide="lock" class="w-3.5 h-3.5 text-purple-600"></i>
                      <span>Admin Password *</span>
                    </label>
                    <div class="relative">
                      <input 
                        type="password" 
                        id="login-admin-password" 
                        required 
                        class="w-full text-xs sm:text-sm px-3.5 py-2.5 border-2 border-slate-200 rounded-2xl bg-white font-mono font-bold text-slate-900 focus:border-purple-600 focus:outline-none transition pr-10"
                        placeholder="Admin password"
                      />
                      <button 
                        type="button" 
                        onclick="coursePlanApp.togglePasswordVisibility('login-admin-password')" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <div class="pt-2">
                    <button 
                      type="submit" 
                      id="login-admin-btn" 
                      onclick="coursePlanApp.loginAdmin(event)"
                      class="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Sign In as IQAC Admin</span>
                      <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                  </div>
                </form>
              `}

            </div>

            <!-- Footer Note -->
            <div class="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
              St. Joseph’s College (Autonomous), Tiruchirappalli • Internal Quality Assurance Cell (IQAC)
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setLoginTab(tab) {
    this.loginTab = tab;
    this.render();
  }

  onLoginDeptChange(dept) {
    this.selectedLoginDept = dept;
    const deptObj = this.departments.find(d => d.name === dept) || { faculty: [] };
    const facultyList = deptObj.faculty || [];
    this.selectedLoginFaculty = facultyList.length > 0 ? (typeof facultyList[0] === 'string' ? facultyList[0] : facultyList[0].name) : '';

    const facSelect = document.getElementById('login-fac-name');
    if (facSelect) {
      facSelect.innerHTML = facultyList.length === 0
        ? '<option value="">-- No faculty found in department --</option>'
        : facultyList.map(f => {
            const name = typeof f === 'string' ? f : f.name;
            return `<option value="${this.escapeHtml(name)}" ${name === this.selectedLoginFaculty ? 'selected' : ''}>${this.escapeHtml(name)}</option>`;
          }).join('');
      facSelect.value = this.selectedLoginFaculty;
    }
  }

  onLoginFacultyChange(fac) {
    this.selectedLoginFaculty = fac;
  }

  togglePasswordVisibility(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
  }

  async loginFaculty(e) {
    if (e && e.preventDefault) e.preventDefault();
    const facultyId = (document.getElementById('login-fac-id')?.value || '').trim();
    const dept = document.getElementById('login-fac-dept')?.value || this.selectedLoginDept;
    const fac = document.getElementById('login-fac-name')?.value || this.selectedLoginFaculty;
    const pass = (document.getElementById('login-fac-password')?.value || '').trim();
    const errEl = document.getElementById('login-error-msg');
    const btn = document.getElementById('login-submit-btn');

    if (!facultyId && (!dept || !fac)) {
      if (errEl) {
        errEl.querySelector('.error-text').textContent = 'Please enter your Staff Code / Faculty ID (e.g. 24CAI51) or select Department & Faculty Name.';
        errEl.classList.remove('hidden');
      }
      return;
    }
    if (!pass) {
      if (errEl) {
        errEl.querySelector('.error-text').textContent = 'Please enter your password.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> Signing in...`;
    }

    try {
      const payload = {
        role: 'faculty',
        password: pass
      };
      if (facultyId) {
        payload.faculty_id = facultyId.toUpperCase();
      } else {
        payload.department_name = dept;
        payload.faculty_name = fac;
      }

      const res = await fetch('api/course_plan.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.selectedDept = data.user.department_name;
        this.navigateTo('/course-plan/dashboard');
      } else {
        if (errEl) {
          errEl.querySelector('.error-text').textContent = data.error || 'Authentication failed. Please verify credentials.';
          errEl.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error(err);
      if (errEl) {
        errEl.querySelector('.error-text').textContent = 'Network or server error while connecting to authentication service.';
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Sign In to Faculty Portal</span> <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>`;
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      }
    }
  }

  async loginHOD(e) {
    if (e && e.preventDefault) e.preventDefault();
    const dept = document.getElementById('login-hod-dept')?.value;
    const pass = document.getElementById('login-hod-password')?.value || '123';
    const errEl = document.getElementById('login-error-msg');
    const btn = document.getElementById('login-hod-btn');

    if (!dept) {
      if (errEl) {
        errEl.querySelector('.error-text').textContent = 'Please select your department.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> Signing in...`;
    }

    try {
      const res = await fetch('api/course_plan.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'hod',
          department_name: dept,
          password: pass
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.selectedDept = data.user.department_name;
        this.navigateTo('/course-plan/hod');
      } else {
        if (errEl) {
          errEl.querySelector('.error-text').textContent = data.error || 'HOD Authentication failed.';
          errEl.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (errEl) {
        errEl.querySelector('.error-text').textContent = 'Network or server error.';
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Sign In as Head of Department</span> <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>`;
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      }
    }
  }

  async loginAdmin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const username = document.getElementById('login-admin-user')?.value || 'admin';
    const pass = document.getElementById('login-admin-password')?.value || '';
    const errEl = document.getElementById('login-error-msg');
    const btn = document.getElementById('login-admin-btn');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> Signing in...`;
    }

    try {
      const res = await fetch('api/course_plan.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'admin',
          username: username,
          password: pass
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.navigateTo('/course-plan/admin');
      } else {
        if (errEl) {
          errEl.querySelector('.error-text').textContent = data.error || 'Admin Authentication failed.';
          errEl.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (errEl) {
        errEl.querySelector('.error-text').textContent = 'Network or server error.';
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Sign In as IQAC Admin</span> <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>`;
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      }
    }
  }

  async loadPlanForEdit(id) {
    try {
      const res = await fetch(`api/course_plan.php?action=get&id=${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        this.activePlan = json.data;
      } else {
        this.activePlan = this.plans.find(p => String(p.id) === String(id)) || this.createDefaultPlan();
      }
    } catch (e) {
      this.activePlan = this.plans.find(p => String(p.id) === String(id)) || this.createDefaultPlan();
    }
  }

  async loadPlanForPrint(id) {
    await this.loadPlanForEdit(id);
  }

  // ================= 1. PERSONAL FACULTY DASHBOARD =================
  renderFacultyDashboardHtml() {
    const user = this.currentUser || { display_name: 'Professor', department_name: this.selectedDept };
    const myPlans = this.plans || [];

    const totalSubmitted = myPlans.filter(p => p.status === 'Submitted' || p.hod_status === 'Approved' || p.hod_status === 'Pending').length;
    const totalApproved = myPlans.filter(p => p.hod_status === 'Approved').length;
    const totalDrafts = myPlans.filter(p => p.status === 'Draft' || !p.status).length;
    const totalRevisions = myPlans.filter(p => p.hod_status === 'Revision Needed').length;

    return `
      <div class="space-y-6 animate-fadeIn w-full max-w-7xl mx-auto">
        <!-- Faculty Dashboard Welcome Banner -->
        <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-indigo-950 text-xs font-black uppercase tracking-wider shadow-sm">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Faculty Portal
              </span>
              <span class="text-indigo-200 text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
                ${this.escapeHtml(user.department_name || this.selectedDept)}
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, ${this.escapeHtml(user.display_name || user.faculty_name || 'Professor')}!
            </h1>
            <p class="text-xs sm:text-sm text-indigo-100 max-w-2xl font-medium leading-relaxed">
              Academic Year 2026–2027 (Even Semester) • Prepare theory course plans, track review status with your Head of Department (HOD), and export official IQAC documentation.
            </p>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <button 
              type="button" 
              onclick="coursePlanApp.navigateTo('/course-plan/new')" 
              class="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i data-lucide="plus-circle" class="w-5 h-5"></i>
              <span>+ Create New Course Plan</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.openTLPracticesModal()" 
              class="px-5 py-3 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-indigo-950/40 flex items-center gap-2 cursor-pointer border border-indigo-400/40 active:scale-95"
              title="Open Teaching-Learning Practices, Assessment Components & E-Content planned form"
            >
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-300"></i>
              <span>TL Practices, Assessment Components, E-Content</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.logout()" 
              class="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="log-out" class="w-4 h-4"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <!-- Quick Stats Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div class="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Total Plans</div>
            <div class="text-2xl font-black text-slate-900">${myPlans.length}</div>
            <div class="text-[10px] text-slate-400 font-medium">Even Semester 2026-27</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div class="text-[11px] font-bold uppercase text-amber-600 tracking-wider">Under HOD Review</div>
            <div class="text-2xl font-black text-amber-600">${totalSubmitted}</div>
            <div class="text-[10px] text-amber-700 font-medium">Pending approval</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div class="text-[11px] font-bold uppercase text-emerald-600 tracking-wider">HOD Approved</div>
            <div class="text-2xl font-black text-emerald-600">${totalApproved}</div>
            <div class="text-[10px] text-emerald-700 font-medium">Published to IQAC</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div class="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Drafts</div>
            <div class="text-2xl font-black text-slate-700">${totalDrafts}</div>
            <div class="text-[10px] text-slate-400 font-medium">In progress</div>
          </div>
        </div>

        <!-- My Course Plans Table -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="layers" class="w-5 h-5 text-indigo-600"></i>
                <span>My Course Plans</span>
              </h2>
              <p class="text-xs text-slate-500 font-medium mt-0.5">
                All theory course plans prepared by you for ${this.escapeHtml(user.department_name || this.selectedDept)}
              </p>
            </div>

            <div class="flex items-center gap-2.5 flex-wrap">
              <button 
                type="button" 
                onclick="coursePlanApp.openTLPracticesModal()" 
                class="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-indigo-200 shadow-2xs"
                title="Teaching-Learning Practices, Assessment Components & E-Content planned"
              >
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-600"></i>
                <span>TL Practices, Assessment Components, E-Content</span>
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.fetchPlans().then(() => coursePlanApp.render())" 
                class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Refresh</span>
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.navigateTo('/course-plan/new')" 
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>+ New Plan</span>
              </button>
            </div>
          </div>

          ${myPlans.length === 0 ? `
            <div class="p-12 text-center space-y-4">
              <div class="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <i data-lucide="clipboard-list" class="w-8 h-8"></i>
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-black text-slate-900">No Course Plans Created Yet</h3>
                <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  You haven't prepared any course plans for Even Semester 2026–2027 yet. Click the button below to select your semester, programme, and course to get started!
                </p>
              </div>
              <button 
                type="button" 
                onclick="coursePlanApp.navigateTo('/course-plan/new')" 
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>+ Create Your First Course Plan</span>
              </button>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse mobile-card-table">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th class="p-3.5 w-12 text-center">S.No</th>
                    <th class="p-3.5">Course Code & Title</th>
                    <th class="p-3.5">Programme & Year</th>
                    <th class="p-3.5">Semester & Section</th>
                    <th class="p-3.5 text-center">Hours & Credits</th>
                    <th class="p-3.5 text-center">HOD Review Status</th>
                    <th class="p-3.5 text-center">Last Updated</th>
                    <th class="p-3.5 text-center w-40">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${myPlans.map((p, idx) => `
                    <tr class="hover:bg-slate-50/80 transition">
                      <td class="p-3.5 text-center font-bold text-slate-400" data-label="S.No">${idx + 1}</td>
                      <td class="p-3.5" data-label="Course Code & Title">
                        <div class="font-black text-indigo-950 text-[13px] flex items-center gap-1.5">
                          <span>${this.escapeHtml(p.course_code || '—')}</span>
                          <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">${this.escapeHtml(p.course_category || 'Core')}</span>
                        </div>
                        <div class="text-slate-600 font-bold text-xs mt-0.5">${this.escapeHtml(p.course_title || 'Untitled Course')}</div>
                      </td>
                      <td class="p-3.5" data-label="Programme & Year">
                        <div class="font-bold text-slate-800">${this.escapeHtml(p.programme || '—')}</div>
                        <div class="text-[11px] text-slate-500 font-medium">${this.escapeHtml(p.year_class || '')}</div>
                      </td>
                      <td class="p-3.5" data-label="Semester & Section">
                        <div class="font-bold text-slate-800">Sem ${this.escapeHtml(p.semester || 'II')}</div>
                        <div class="text-[11px] text-slate-500 font-medium">${this.escapeHtml(p.section || 'N/A')}</div>
                      </td>
                      <td class="p-3.5 text-center font-mono font-bold" data-label="Hours & Credits">
                        <div class="text-slate-800">${p.teaching_hours || '—'}h / wk</div>
                        <div class="text-[10px] text-slate-500">${p.credits || '—'} Credits</div>
                      </td>
                      <td class="p-3.5 text-center" data-label="HOD Status">
                        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold ${
                          p.hod_status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.hod_status === 'Revision Needed'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : (p.status === 'Submitted' || p.hod_status === 'Pending')
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }">
                          <i data-lucide="${
                            p.hod_status === 'Approved' ? 'check-circle' :
                            p.hod_status === 'Revision Needed' ? 'alert-triangle' :
                            (p.status === 'Submitted' || p.hod_status === 'Pending') ? 'clock' : 'file-edit'
                          }" class="w-3.5 h-3.5"></i>
                          <span>${
                            p.hod_status === 'Approved' ? 'HOD Approved' :
                            p.hod_status === 'Revision Needed' ? 'Revision Needed' :
                            (p.status === 'Submitted' || p.hod_status === 'Pending') ? 'Under Review' : 'Draft'
                          }</span>
                        </span>
                      </td>
                      <td class="p-3.5 text-center text-slate-500 text-[11px] font-mono" data-label="Last Updated">
                        ${this.formatDateToDDMMYYYY(p.updated_at ? p.updated_at.split(' ')[0] : '') || '—'}
                      </td>
                      <td class="p-3.5 text-center" data-label="Actions">
                        <div class="inline-flex items-center gap-1.5">
                          <button 
                            type="button" 
                            onclick="coursePlanApp.navigateTo('/course-plan/edit?id=${p.id}')" 
                            class="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                            title="Edit / Update Course Plan"
                          >
                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                            <span>Edit</span>
                          </button>
                          <button 
                            type="button" 
                            onclick="coursePlanApp.navigateTo('/course-plan/view?id=${p.id}')" 
                            class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                            title="Print Preview / Export PDF"
                          >
                            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                            <span>Print</span>
                          </button>
                          ${(p.status === 'Draft' || !p.status) ? `
                            <button 
                              type="button" 
                              onclick="coursePlanApp.deletePlan(${p.id})" 
                              class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete Draft"
                            >
                              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ================= 2. HOD DASHBOARD (DEPARTMENT REVIEW & APPROVAL) =================
  // ================= 2. HOD DASHBOARD (APPROVAL & FACULTY ROSTER STATUS) =================
  renderHODDashboardHtml() {
    const dept = this.currentUser.department_name;
    const deptObj = this.departments.find(d => d.name === dept || d.name.toLowerCase() === dept.toLowerCase()) || { name: dept, faculty: [] };
    const facultyList = deptObj.faculty || [];
    const plans = this.plans;
    const pendingPlans = plans.filter(p => p.hod_status === 'Pending' || p.status === 'Submitted');
    const approvedPlans = plans.filter(p => p.hod_status === 'Approved');

    // Calculate faculty submission stats
    const submittedFacultyNames = new Set(plans.map(p => p.faculty_name));
    const approvedFacultyNames = new Set(approvedPlans.map(p => p.faculty_name));

    return `
      
<style>
  .is-invalid-field {
    border-color: #ef4444 !important;
    background-color: #fef2f2 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
    animation: fieldShake 0.4s ease-in-out !important;
  }
  @keyframes fieldShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }

  /* Compact Card View for Mobile Screens */
  @media (max-width: 768px) {
    .mobile-card-table thead {
      display: none !important;
    }
    .mobile-card-table, 
    .mobile-card-table tbody, 
    .mobile-card-table tr, 
    .mobile-card-table td {
      display: block !important;
      width: 100% !important;
    }
    .mobile-card-table tr {
      margin-bottom: 1rem !important;
      background: #ffffff !important;
      border: 1.5px solid #e2e8f0 !important;
      border-radius: 1rem !important;
      padding: 0.85rem !important;
      box-shadow: 0 2px 6px -1px rgba(0, 0, 0, 0.06) !important;
    }
    .mobile-card-table td {
      padding: 0.35rem 0 !important;
      border: none !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0.25rem !important;
    }
    .mobile-card-table td::before {
      content: attr(data-label);
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.03em;
    }
  }
</style>

      <div class="space-y-6 animate-fadeIn w-full">
        <!-- HOD Management Header -->
        <div class="bg-gradient-to-r from-amber-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-300 border border-amber-400/40">
                HOD Approval & Review Workspace
              </span>
              <span class="text-amber-400">•</span>
              <span class="text-xs font-bold text-white">${dept}</span>
            </div>
            <h1 class="text-2xl font-black tracking-tight text-white">
              HOD Course Plan Review Hub (Even Semester 2026–2027)
            </h1>
            <p class="text-xs text-slate-300 font-medium">
              Review and approve course plans submitted by faculty members for each course. Approved plans are published directly to IQAC.
            </p>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <button 
              type="button" 
              onclick="coursePlanApp.fetchPlans().then(() => coursePlanApp.render())" 
              class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20 flex items-center gap-1.5"
            >
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- HOD KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Faculty in Dept</div>
            <div class="text-2xl font-black text-slate-900">${facultyList.length} Faculty</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Course Submissions</div>
            <div class="text-2xl font-black text-slate-900">${plans.length} Courses</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/40">
            <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Awaiting Your Review</div>
            <div class="text-2xl font-black text-amber-700">${pendingPlans.length}</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/40">
            <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Approved & Transmitted to IQAC</div>
            <div class="text-2xl font-black text-emerald-700">${approvedPlans.length}</div>
          </div>
        </div>

        <!-- HOD Navigation Tabs -->
        <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
          <button 
            type="button" 
            onclick="coursePlanApp.switchHODTab('courses')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.hodTab === 'courses' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            <i data-lucide="book-open" class="w-4 h-4"></i>
            <span>Submitted Courses & Approvals (${plans.length})</span>
          </button>
          <button 
            type="button" 
            onclick="coursePlanApp.switchHODTab('roster')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.hodTab === 'roster' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            <i data-lucide="users" class="w-4 h-4"></i>
            <span>Department Faculty Status Roster (${facultyList.length})</span>
          </button>
        </div>

        ${this.hodTab === 'roster' ? `
          <!-- FACULTY ROSTER STATUS TABLE -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i data-lucide="users" class="w-4 h-4 text-amber-600"></i>
                  <span>Faculty Submission Status Roster (${dept})</span>
                </h2>
                <p class="text-[11px] text-slate-500">Monitor submission status across all department faculty members</p>
              </div>
            </div>

            <div class="overflow-x-auto w-full">
              <table class="w-full text-left text-xs border-collapse mobile-card-table">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th class="p-3 text-center w-12">S.No</th>
                    <th class="p-3">Faculty Member</th>
                    <th class="p-3">Shift & Role</th>
                    <th class="p-3">Institutional Email</th>
                    <th class="p-3">Submitted Course(s)</th>
                    <th class="p-3 text-center">Status</th>
                    <th class="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${facultyList.map((fac, idx) => {
                    const facPlans = plans.filter(p => p.faculty_name && (p.faculty_name.trim().toLowerCase() === fac.name.trim().toLowerCase() || p.faculty_name.toLowerCase().includes(fac.name.toLowerCase())));
                    const isApproved = facPlans.some(p => p.hod_status === 'Approved');
                    const isPending = facPlans.some(p => p.hod_status === 'Pending' || p.status === 'Submitted');
                    const isDraft = facPlans.some(p => p.status === 'Draft');

                    let statusBadge = `
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Not Submitted Yet
                      </span>
                    `;
                    if (isApproved) {
                      statusBadge = `
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ HOD Approved
                        </span>
                      `;
                    } else if (isPending) {
                      statusBadge = `
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                          ⏳ Awaiting Review
                        </span>
                      `;
                    } else if (isDraft) {
                      statusBadge = `
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          Draft Saved
                        </span>
                      `;
                    }

                    return `
                      <tr class="hover:bg-slate-50/70 transition">
                        <td class="p-3 text-center font-bold text-slate-400" data-label="S.No">${idx + 1}</td>
                        <td class="p-3 font-bold text-slate-900" data-label="Faculty Member">${fac.name}</td>
                        <td class="p-3 text-slate-600" data-label="Shift & Designation">Shift ${fac.shift || 'I'} • ${fac.category || 'Faculty'}</td>
                        <td class="p-3 font-mono text-slate-600" data-label="Email">${fac.email || '—'}</td>
                        <td class="p-3">
                          ${facPlans.length === 0 ? '<span class="text-slate-400 italic">None</span>' : `
                            <div class="flex flex-wrap gap-1">
                              ${facPlans.map(fp => `
                                <span class="px-2 py-0.5 rounded text-[11px] font-bold ${fp.hod_status === 'Approved' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}">
                                  ${fp.course_code}: ${fp.course_title || 'Course'}
                                </span>
                              `).join('')}
                            </div>
                          `}
                        </td>
                        <td class="p-3 text-center" data-label="Status">${statusBadge}</td>
                        <td class="p-3 text-center" data-label="Action">
                          ${facPlans.length > 0 ? `
                            <button 
                              type="button" 
                              onclick="coursePlanApp.openHODReviewModal(${facPlans[0].id})" 
                              class="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold"
                            >
                              Review
                            </button>
                          ` : '—'}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : `
          <!-- COURSES LIST TABLE -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="check-square" class="w-4 h-4 text-amber-600"></i>
                <span>Faculty Submissions in ${dept}</span>
              </h2>
              <span class="text-xs text-slate-500 font-semibold">${plans.length} total courses</span>
            </div>

            ${plans.length === 0 ? `
              <div class="p-12 text-center text-slate-400 font-bold">
                No faculty submissions yet for ${dept}.
              </div>
            ` : `
              <div class="overflow-x-auto w-full">
                <table class="w-full text-left text-xs border-collapse mobile-card-table">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th class="p-3 text-center w-12">S.No</th>
                      <th class="p-3">Course Code & Title</th>
                      <th class="p-3">Programme</th>
                      <th class="p-3">Faculty Member</th>
                      <th class="p-3 text-center">Submission Status</th>
                      <th class="p-3 text-center">HOD Approval</th>
                      <th class="p-3 text-center">Review & Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    ${plans.map((p, idx) => `
                      <tr class="hover:bg-slate-50/70 transition">
                        <td class="p-3 text-center font-bold text-slate-400" data-label="S.No">${idx + 1}</td>
                        <td class="p-3 cursor-pointer group" onclick="coursePlanApp.openHODReviewModal(${p.id})" title="Click to review this course plan" data-label="Course Code & Title">
                          <div class="font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                            <span>${p.course_code || '—'}</span>
                            <i data-lucide="external-link" class="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"></i>
                          </div>
                          <div class="text-slate-600 text-[11px] font-semibold group-hover:text-indigo-900">${p.course_title || 'Untitled'}</div>
                        </td>
                        <td class="p-3 text-slate-700" data-label="Programme & Sem">
                          <div>${p.programme || '—'}</div>
                          <div class="text-[10px] text-slate-400">${p.year_class || ''}${p.section && p.section !== 'N/A' ? ' (' + p.section + ')' : ''} • Semester ${p.semester || ''}</div>
                        </td>
                        <td class="p-3 font-bold text-slate-800" data-label="Faculty Member">${p.faculty_name || '—'}</td>
                        <td class="p-3 text-center" data-label="Submission Status">
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Submitted' || p.status === 'Approved by HOD' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'}">
                            ${p.status || 'Draft'}
                          </span>
                        </td>
                        <td class="p-3 text-center" data-label="HOD Approval">
                          ${p.hod_status === 'Approved' ? `
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1 mx-auto w-fit">
                              <i data-lucide="check-circle" class="w-3 h-3 text-emerald-600"></i>
                              <span>Approved</span>
                            </span>
                          ` : p.hod_status === 'Revision Needed' ? `
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Revision Needed
                            </span>
                          ` : `
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              Pending Review
                            </span>
                          `}
                        </td>
                        <td class="p-3 text-center" data-label="Actions">
                          <div class="flex items-center justify-center gap-1.5 flex-wrap">
                            <button 
                              type="button" 
                              onclick="coursePlanApp.openHODReviewModal(${p.id})" 
                              class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                              <span>Review & Approve</span>
                            </button>
                            ${p.hod_status !== 'Approved' ? `
                              <button 
                                type="button" 
                                onclick="coursePlanApp.quickApprovePlan(${p.id})" 
                                class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Quick Approve with 1 Click"
                              >
                                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                                <span>Approve</span>
                              </button>
                            ` : ''}
                            <button 
                              type="button" 
                              onclick="coursePlanApp.previewPlan(${p.id})" 
                              class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                              title="Print View"
                            >
                              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        `}
      </div>
    `;
  }


  // ================= 3. IQAC ADMIN MASTER HUB =================
  renderAdminDashboardHtml() {
    // Requirement 2: Only approved courses displayed in Admin Login
    const allPlans = this.plans;
    const approvedPlans = allPlans.filter(p => p.hod_status === 'Approved');

    // Aggregate by Department
    const deptStats = this.departments.map(d => {
      const dApproved = approvedPlans.filter(p => p.department_name && (p.department_name.toLowerCase() === d.name.toLowerCase() || p.department_name.toLowerCase().includes(d.name.toLowerCase())));
      return {
        name: d.name,
        faculty_count: d.faculty_count || (d.faculty ? d.faculty.length : 0),
        faculty: d.faculty || [],
        approved_count: dApproved.length,
        approved_plans: dApproved
      };
    });

    return `
      
<style>
  .is-invalid-field {
    border-color: #ef4444 !important;
    background-color: #fef2f2 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
    animation: fieldShake 0.4s ease-in-out !important;
  }
  @keyframes fieldShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }

  /* Compact Card View for Mobile Screens */
  @media (max-width: 768px) {
    .mobile-card-table thead {
      display: none !important;
    }
    .mobile-card-table, 
    .mobile-card-table tbody, 
    .mobile-card-table tr, 
    .mobile-card-table td {
      display: block !important;
      width: 100% !important;
    }
    .mobile-card-table tr {
      margin-bottom: 1rem !important;
      background: #ffffff !important;
      border: 1.5px solid #e2e8f0 !important;
      border-radius: 1rem !important;
      padding: 0.85rem !important;
      box-shadow: 0 2px 6px -1px rgba(0, 0, 0, 0.06) !important;
    }
    .mobile-card-table td {
      padding: 0.35rem 0 !important;
      border: none !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0.25rem !important;
    }
    .mobile-card-table td::before {
      content: attr(data-label);
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.03em;
    }
  }
</style>

      <div class="space-y-6 animate-fadeIn w-full">
        <!-- Admin Header -->
        <div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-300 border border-purple-400/40">
                IQAC Central Admin Audit
              </span>
              <span class="text-purple-400">•</span>
              <span class="text-xs font-bold text-white">All 34 Departments</span>
            </div>
            <h1 class="text-2xl font-black tracking-tight text-white">
              Institutional Course Plans Master Monitoring Hub
            </h1>
            <p class="text-xs text-purple-200 font-medium">
              View, inspect, and verify all HOD-approved course plans across all academic departments for Even Semester 2026–2027.
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('analytics')" 
              class="px-3.5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
              <span>📊 Pedagogy & ICT Analytics</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('report')" 
              class="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>🏛️ Institutional Report</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.fetchPlans().then(() => coursePlanApp.loadAnalyticsData(true)).then(() => coursePlanApp.render())" 
              class="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
              title="Refresh All Plans & Analytics"
            >
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- Macro KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
          <div class="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/40">
            <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Approved Course Plans (IQAC Live)</div>
            <div class="text-2xl font-black text-emerald-700">${approvedPlans.length} Courses</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-purple-200 shadow-2xs bg-purple-50/40">
            <div class="text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1">Academic Departments</div>
            <div class="text-2xl font-black text-purple-900">${this.departments.length} Departments</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Departments with Approvals</div>
            <div class="text-2xl font-black text-slate-900">${deptStats.filter(d => d.approved_count > 0).length} of ${deptStats.length}</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-indigo-200 shadow-2xs bg-indigo-50/30">
            <div class="text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Master Syllabus Catalog</div>
            <div class="text-2xl font-black text-indigo-700">${this.syllabusCourses.length} Courses</div>
          </div>
        </div>

        <!-- Requirement 3: Admin Navigation Tabs (Dept-wise, Faculty-wise, Course-wise, Manage Data) -->
        <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('dept')" 
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.adminTab === 'dept' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              <i data-lucide="building" class="w-4 h-4"></i>
              <span>1. Department-wise View</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('faculty')" 
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.adminTab === 'faculty' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              <i data-lucide="users" class="w-4 h-4"></i>
              <span>2. Faculty-wise View</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('course')" 
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.adminTab === 'course' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              <i data-lucide="book-open" class="w-4 h-4"></i>
              <span>3. Course-wise Monitoring (UG & PG Sem-wise)</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('analytics')" 
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.adminTab === 'analytics' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
              <span>4. 📊 Pedagogy & ICT Analytics</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('report')" 
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.adminTab === 'report' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>5. 🏛️ Institutional Report</span>
            </button>
          </div>

          <button 
            type="button" 
            onclick="coursePlanApp.switchAdminTab('manage')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.adminTab === 'manage' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}"
          >
            <i data-lucide="settings" class="w-4 h-4"></i>
            <span>⚙️ Manage Data (Faculty / Course / Dept)</span>
          </button>
        </div>

        <!-- ================= 1. DEPARTMENT-WISE VIEW ================= -->
        ${this.adminTab === 'dept' ? `
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="building" class="w-4 h-4 text-purple-600"></i>
                <span>Academic Departments Overview (34 Departments)</span>
              </h2>
              <span class="text-xs text-slate-500 font-semibold">${approvedPlans.length} approved courses across college</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${deptStats.map(d => `
                <div class="bg-white p-5 rounded-2xl border ${d.approved_count > 0 ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'} shadow-2xs hover:shadow-sm transition flex flex-col justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between gap-2">
                      <h3 class="font-bold text-slate-900 text-sm">${d.name}</h3>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${d.approved_count > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}">
                        ${d.approved_count} Approved
                      </span>
                    </div>
                    <div class="text-xs text-slate-500">${d.faculty_count} Teaching Faculty Members</div>
                  </div>

                  <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span class="text-[11px] font-bold text-slate-600">
                      ${d.approved_count > 0 ? '✓ Ready for Audit' : 'Pending HOD Approval'}
                    </span>
                    <button 
                      type="button" 
                      onclick="coursePlanApp.adminDeptFilter = '${d.name}'; coursePlanApp.switchAdminTab('course');" 
                      class="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl text-xs border border-purple-200 transition"
                    >
                      View Courses →
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- ================= 2. FACULTY-WISE VIEW ================= -->
        ${this.adminTab === 'faculty' ? `
          <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full space-y-4 p-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i data-lucide="users" class="w-4 h-4 text-purple-600"></i>
                  <span>Faculty-wise Approved Courses View</span>
                </h2>
                <p class="text-[11px] text-slate-500">Track approved course plans submitted by each faculty member</p>
              </div>
              <div class="flex items-center gap-2">
                <select 
                  id="admin-fac-dept-filter" 
                  onchange="coursePlanApp.render()" 
                  class="text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                >
                  <option value="all">All Departments</option>
                  ${this.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="overflow-x-auto w-full">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th class="p-3 text-center w-12">S.No</th>
                    <th class="p-3">Faculty Member</th>
                    <th class="p-3">Department</th>
                    <th class="p-3">Approved Course(s)</th>
                    <th class="p-3 text-center">Approved Count</th>
                    <th class="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${(() => {
                    const selDept = document.getElementById('admin-fac-dept-filter')?.value || 'all';
                    let facList = [];
                    this.departments.forEach(d => {
                      if (selDept !== 'all' && d.name !== selDept) return;
                      (d.faculty || []).forEach(f => {
                        const fApproved = approvedPlans.filter(p => p.faculty_name && (p.faculty_name.trim().toLowerCase() === f.name.trim().toLowerCase() || p.faculty_name.toLowerCase().includes(f.name.toLowerCase())));
                        facList.push({ ...f, dept: d.name, approved_plans: fApproved });
                      });
                    });

                    if (facList.length === 0) {
                      return '<tr><td colspan="6" class="p-8 text-center text-slate-400">No faculty members found.</td></tr>';
                    }

                    return facList.map((f, idx) => `
                      <tr class="hover:bg-slate-50/70 transition">
                        <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                        <td class="p-3">
                          <div class="font-bold text-slate-900">${f.name}</div>
                          <div class="text-[10px] text-slate-500 font-mono">${f.email || ''}</div>
                        </td>
                        <td class="p-3 text-slate-700 font-semibold">${f.dept} (Shift ${f.shift || 'I'})</td>
                        <td class="p-3">
                          ${f.approved_plans.length === 0 ? '<span class="text-slate-400 italic">No approved courses</span>' : `
                            <div class="flex flex-wrap gap-1.5">
                              ${f.approved_plans.map(ap => `
                                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                  ${ap.course_code}: ${ap.course_title}
                                </span>
                              `).join('')}
                            </div>
                          `}
                        </td>
                        <td class="p-3 text-center font-black ${f.approved_plans.length > 0 ? 'text-emerald-700 text-sm' : 'text-slate-400'}">
                          ${f.approved_plans.length}
                        </td>
                        <td class="p-3 text-center">
                          ${f.approved_plans.length > 0 ? `
                            <button 
                              type="button" 
                              onclick="coursePlanApp.previewPlan(${f.approved_plans[0].id})" 
                              class="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-lg text-xs border border-purple-200"
                            >
                              Inspect Plan
                            </button>
                          ` : '—'}
                        </td>
                      </tr>
                    `).join('');
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- ================= 3. COURSE-WISE MASTER VIEW (UG & PG SEM-WISE) ================= -->
        ${this.adminTab === 'course' ? (() => {
          // 1. Gather all master courses from syllabusCourses + any ad-hoc course codes in plans
          const catalog = (this.syllabusCourses || []).slice();
          const existingCodes = new Set(catalog.map(c => (c.course_code || '').trim().toUpperCase()));
          
          (this.plans || []).forEach(p => {
            const pCode = (p.course_code || '').trim().toUpperCase();
            if (pCode && !existingCodes.has(pCode)) {
              existingCodes.add(pCode);
              const isPG = (p.programme && (p.programme.startsWith('M.') || p.programme.includes('Master') || p.programme.includes('MCA'))) || (p.year_class && p.year_class.includes('PG'));
              catalog.push({
                course_code: p.course_code,
                course_title: p.course_title,
                department: p.department_name,
                programme: p.programme,
                semester: `Semester ${this.getSemesterNum(p.semester)}`,
                semester_num: this.getSemesterNum(p.semester),
                level: isPG ? 'PG' : 'UG',
                year_class: p.year_class,
                hours: p.teaching_hours,
                credits: p.credits,
                course_category: p.course_category || 'Core'
              });
            }
          });

          // Precompute plan match lookup by normalized course code
          const plansByCode = new Map();
          (this.plans || []).forEach(p => {
            const code = (p.course_code || '').trim().toUpperCase();
            if (!code) return;
            if (!plansByCode.has(code)) plansByCode.set(code, []);
            plansByCode.get(code).push(p);
          });

          // Precompute counts for Level Filter
          const totalAllCount = catalog.length;
          const totalUGCount = catalog.filter(c => (c.level || (c.programme && (c.programme.startsWith('M.') || c.programme.includes('Master') || c.programme.includes('MCA')) ? 'PG' : 'UG')).toUpperCase() === 'UG').length;
          const totalPGCount = catalog.filter(c => (c.level || (c.programme && (c.programme.startsWith('M.') || c.programme.includes('Master') || c.programme.includes('MCA')) ? 'PG' : 'UG')).toUpperCase() === 'PG').length;

          // 2. Filter by Level, Semester, Department, Status, Search
          const levelFilter = this.adminLevelFilter || 'all';
          const semFilter = this.adminSemFilter || 'even';
          const deptFilter = this.adminDeptFilter || 'all';
          const statusFilter = this.adminStatusFilter || 'all';
          const searchQuery = (this.adminSearchQuery || '').trim().toLowerCase();

          const filteredCourses = catalog.filter(c => {
            const cLevel = (c.level || (c.programme && (c.programme.startsWith('M.') || c.programme.includes('Master') || c.programme.includes('MCA')) ? 'PG' : 'UG')).toUpperCase();
            const cSemNum = c.semester_num || this.getSemesterNum(c.semester);
            const cDept = c.department || '';

            // A. Level Filter (All / UG / PG)
            if (levelFilter !== 'all' && cLevel !== levelFilter.toUpperCase()) return false;

            // B. Semester Filter
            if (semFilter === 'even') {
              if (cSemNum !== 2 && cSemNum !== 4 && cSemNum !== 6) return false;
            } else if (semFilter !== 'all') {
              if (String(cSemNum) !== String(semFilter)) return false;
            }

            // C. Department Filter
            if (deptFilter !== 'all') {
              if (cDept.toLowerCase() !== deptFilter.toLowerCase() && !cDept.toLowerCase().includes(deptFilter.toLowerCase())) return false;
            }

            // D. Course Status & Matching Plans
            const code = (c.course_code || '').trim().toUpperCase();
            const matchingPlans = plansByCode.get(code) || [];
            let courseStatus = 'Not Started';
            if (matchingPlans.length > 0) {
              if (matchingPlans.some(p => p.hod_status === 'Approved')) courseStatus = 'Approved';
              else if (matchingPlans.some(p => p.hod_status === 'Revision Needed')) courseStatus = 'Revision Needed';
              else if (matchingPlans.some(p => p.status === 'Submitted' || p.hod_status === 'Pending')) courseStatus = 'Pending';
              else courseStatus = 'Draft';
            }
            c._computedStatus = courseStatus;
            c._matchingPlans = matchingPlans;

            if (statusFilter !== 'all' && courseStatus !== statusFilter) return false;

            // E. Search Query
            if (searchQuery) {
              const codeMatch = (c.course_code || '').toLowerCase().includes(searchQuery);
              const titleMatch = (c.course_title || '').toLowerCase().includes(searchQuery);
              const deptMatch = (c.department || '').toLowerCase().includes(searchQuery);
              const progMatch = (c.programme || '').toLowerCase().includes(searchQuery);
              const facMatch = matchingPlans.some(p => (p.faculty_name || '').toLowerCase().includes(searchQuery));
              if (!codeMatch && !titleMatch && !deptMatch && !progMatch && !facMatch) return false;
            }

            return true;
          });

          // Sort by Level (UG first, then PG), then Semester ascending (2, 4, 6), then Department, then Code
          filteredCourses.sort((a, b) => {
            const aLevel = (a.level || 'UG').toUpperCase();
            const bLevel = (b.level || 'UG').toUpperCase();
            if (aLevel !== bLevel) return aLevel === 'UG' ? -1 : 1;

            const aSem = a.semester_num || 0;
            const bSem = b.semester_num || 0;
            if (aSem !== bSem) return aSem - bSem;

            const aDept = (a.department || '').localeCompare(b.department || '');
            if (aDept !== 0) return aDept;

            return (a.course_code || '').localeCompare(b.course_code || '');
          });

          // KPI counts among filtered items
          const kpiApproved = filteredCourses.filter(c => c._computedStatus === 'Approved').length;
          const kpiPending = filteredCourses.filter(c => c._computedStatus === 'Pending').length;
          const kpiDraft = filteredCourses.filter(c => c._computedStatus === 'Draft').length;
          const kpiRevision = filteredCourses.filter(c => c._computedStatus === 'Revision Needed').length;
          const kpiNotStarted = filteredCourses.filter(c => c._computedStatus === 'Not Started').length;

          // Pagination calculations
          const pageSize = this.adminCoursePageSize || 50;
          const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
          const currentPage = Math.min(Math.max(1, this.adminCoursePage || 1), totalPages);
          const startIdx = (currentPage - 1) * pageSize;
          const endIdx = Math.min(startIdx + pageSize, filteredCourses.length);
          const pagedCourses = filteredCourses.slice(startIdx, endIdx);

          return `
            <div class="space-y-4">
              <!-- Filter Controls Card -->
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
                      <i data-lucide="book-open-check" class="w-5 h-5 text-purple-600"></i>
                      <span>Institutional Course-wise Monitoring Registry</span>
                    </h2>
                    <p class="text-xs text-slate-500 font-medium mt-0.5">
                      Real-time tracking of syllabus courses across UG & PG programmes, semester-wise status, and assigned faculty members.
                    </p>
                  </div>

                  <!-- Level Quick Filter Pills (UG / PG / All) -->
                  <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl shrink-0">
                    <button 
                      type="button" 
                      onclick="coursePlanApp.setAdminLevelFilter('all')" 
                      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${levelFilter === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
                    >
                      All Courses (${totalAllCount})
                    </button>
                    <button 
                      type="button" 
                      onclick="coursePlanApp.setAdminLevelFilter('UG')" 
                      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${levelFilter === 'UG' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
                    >
                      UG Courses (${totalUGCount})
                    </button>
                    <button 
                      type="button" 
                      onclick="coursePlanApp.setAdminLevelFilter('PG')" 
                      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${levelFilter === 'PG' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
                    >
                      PG Courses (${totalPGCount})
                    </button>
                  </div>
                </div>

                <!-- Secondary Dropdown Filters -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <!-- Semester Filter -->
                  <div class="space-y-1">
                    <label class="block font-bold text-slate-700">Semester Filter</label>
                    <select 
                      onchange="coursePlanApp.setAdminSemFilter(this.value)" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-800 focus:border-purple-600 focus:outline-none cursor-pointer"
                    >
                      <option value="even" ${semFilter === 'even' ? 'selected' : ''}>🌟 Even Semesters (II, IV, VI) - Current</option>
                      <option value="all" ${semFilter === 'all' ? 'selected' : ''}>All Semesters (I to VI)</option>
                      <option value="2" ${semFilter === '2' ? 'selected' : ''}>Semester 2 (Even)</option>
                      <option value="4" ${semFilter === '4' ? 'selected' : ''}>Semester 4 (Even)</option>
                      <option value="6" ${semFilter === '6' ? 'selected' : ''}>Semester 6 (Even - UG only)</option>
                      <option value="1" ${semFilter === '1' ? 'selected' : ''}>Semester 1 (Odd)</option>
                      <option value="3" ${semFilter === '3' ? 'selected' : ''}>Semester 3 (Odd)</option>
                      <option value="5" ${semFilter === '5' ? 'selected' : ''}>Semester 5 (Odd)</option>
                    </select>
                  </div>

                  <!-- Department Filter -->
                  <div class="space-y-1">
                    <label class="block font-bold text-slate-700">Department</label>
                    <select 
                      onchange="coursePlanApp.setAdminDeptFilter(this.value)" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-800 focus:border-purple-600 focus:outline-none cursor-pointer"
                    >
                      <option value="all" ${deptFilter === 'all' ? 'selected' : ''}>All Departments (${this.departments.length})</option>
                      ${this.departments.map(d => `
                        <option value="${this.escapeHtml(d.name)}" ${deptFilter === d.name ? 'selected' : ''}>
                          ${this.escapeHtml(d.name)}
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- Status Filter -->
                  <div class="space-y-1">
                    <label class="block font-bold text-slate-700">Course Plan Status</label>
                    <select 
                      onchange="coursePlanApp.setAdminStatusFilter(this.value)" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-800 focus:border-purple-600 focus:outline-none cursor-pointer"
                    >
                      <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Statuses (${filteredCourses.length})</option>
                      <option value="Approved" ${statusFilter === 'Approved' ? 'selected' : ''}>✓ HOD Approved (${kpiApproved})</option>
                      <option value="Pending" ${statusFilter === 'Pending' ? 'selected' : ''}>⏳ Under HOD Review (${kpiPending})</option>
                      <option value="Draft" ${statusFilter === 'Draft' ? 'selected' : ''}>📝 Draft Saved (${kpiDraft})</option>
                      <option value="Revision Needed" ${statusFilter === 'Revision Needed' ? 'selected' : ''}>⚠️ Revision Needed (${kpiRevision})</option>
                      <option value="Not Started" ${statusFilter === 'Not Started' ? 'selected' : ''}>⚪ Not Started / Pending (${kpiNotStarted})</option>
                    </select>
                  </div>

                  <!-- Real-time Search Input -->
                  <div class="space-y-1">
                    <label class="block font-bold text-slate-700">Search Course or Faculty</label>
                    <div class="relative">
                      <input 
                        type="text" 
                        id="admin-course-search" 
                        placeholder="Course code, title, faculty..." 
                        value="${this.escapeHtml(searchQuery)}" 
                        oninput="coursePlanApp.onAdminCourseSearchInput(this.value)" 
                        class="w-full px-3 py-2 pl-8 border border-slate-300 rounded-xl font-medium bg-white text-slate-900 focus:border-purple-600 focus:outline-none"
                      />
                      <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"></i>
                    </div>
                  </div>
                </div>

                <!-- KPI Status Badges Summary -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div class="text-[10px] font-bold text-slate-500 uppercase">Filtered Courses</div>
                    <div class="text-lg font-black text-slate-900">${filteredCourses.length}</div>
                  </div>
                  <div class="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
                    <div class="text-[10px] font-bold text-emerald-800 uppercase">HOD Approved</div>
                    <div class="text-lg font-black text-emerald-700">${kpiApproved}</div>
                  </div>
                  <div class="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-center">
                    <div class="text-[10px] font-bold text-amber-800 uppercase">Under Review</div>
                    <div class="text-lg font-black text-amber-800">${kpiPending}</div>
                  </div>
                  <div class="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-center">
                    <div class="text-[10px] font-bold text-blue-800 uppercase">Drafts</div>
                    <div class="text-lg font-black text-blue-800">${kpiDraft}</div>
                  </div>
                  <div class="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200 text-center col-span-2 sm:col-span-1">
                    <div class="text-[10px] font-bold text-rose-800 uppercase">Not Started</div>
                    <div class="text-lg font-black text-rose-700">${kpiNotStarted}</div>
                  </div>
                </div>
              </div>

              <!-- Main Table Card -->
              <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full">
                ${filteredCourses.length === 0 ? `
                  <div class="p-12 text-center space-y-2">
                    <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <i data-lucide="inbox" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-sm font-black text-slate-800">No Courses Match Your Criteria</h3>
                    <p class="text-xs text-slate-500">Try adjusting your Level, Semester, Department, or Status filters above.</p>
                  </div>
                ` : `
                  <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-xs border-collapse mobile-card-table">
                      <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] sticky top-0 z-10">
                        <tr>
                          <th class="p-3 text-center w-12">S.No</th>
                          <th class="p-3 w-80">Course Code & Title</th>
                          <th class="p-3 w-56">Department & Programme</th>
                          <th class="p-3 w-36 text-center">Semester & Class</th>
                          <th class="p-3 w-32 text-center">Hrs & Credits</th>
                          <th class="p-3 w-64">Faculty Name(s)</th>
                          <th class="p-3 w-40 text-center">Submission Status</th>
                          <th class="p-3 text-center w-28">Actions</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 font-medium">
                        ${pagedCourses.map((c, idx) => {
                          const globalIdx = startIdx + idx + 1;
                          const cLevel = (c.level || (c.programme && (c.programme.startsWith('M.') || c.programme.includes('Master') || c.programme.includes('MCA')) ? 'PG' : 'UG')).toUpperCase();
                          const plans = c._matchingPlans || [];

                          let statusBadge = '';
                          let facultyDisplay = '';
                          let actionsHtml = '';

                          if (c._computedStatus === 'Approved') {
                            statusBadge = `
                              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i>
                                <span>HOD Approved</span>
                              </span>
                            `;
                          } else if (c._computedStatus === 'Revision Needed') {
                            statusBadge = `
                              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-rose-600"></i>
                                <span>Revision Needed</span>
                              </span>
                            `;
                          } else if (c._computedStatus === 'Pending') {
                            statusBadge = `
                              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-600"></i>
                                <span>Under HOD Review</span>
                              </span>
                            `;
                          } else if (c._computedStatus === 'Draft') {
                            statusBadge = `
                              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                <i data-lucide="file-edit" class="w-3.5 h-3.5 text-blue-600"></i>
                                <span>Draft Saved</span>
                              </span>
                            `;
                          } else {
                            statusBadge = `
                              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <span>Not Started</span>
                              </span>
                            `;
                          }

                          if (plans.length > 0) {
                            facultyDisplay = `
                              <div class="space-y-1">
                                ${plans.map(p => `
                                  <div class="font-black text-indigo-950 text-xs flex items-center gap-1.5">
                                    <i data-lucide="user-check" class="w-3.5 h-3.5 text-indigo-600 shrink-0"></i>
                                    <span>${this.escapeHtml(p.faculty_name || 'Assigned Faculty')}</span>
                                    ${p.section && p.section !== 'N/A' ? `<span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">${this.escapeHtml(p.section)}</span>` : ''}
                                  </div>
                                `).join('')}
                              </div>
                            `;

                            const primaryPlan = plans[0];
                            actionsHtml = `
                              <div class="inline-flex items-center gap-1.5">
                                <button 
                                  type="button" 
                                  onclick="coursePlanApp.previewPlan(${primaryPlan.id})" 
                                  class="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-lg text-xs transition border border-purple-200 flex items-center gap-1 cursor-pointer"
                                  title="View Course Plan Document"
                                >
                                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                                  <span>View</span>
                                </button>
                                <button 
                                  type="button" 
                                  onclick="coursePlanApp.navigateTo('/course-plan/edit?id=${primaryPlan.id}')" 
                                  class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                  title="Edit Course Plan"
                                >
                                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                                </button>
                              </div>
                            `;
                          } else {
                            facultyDisplay = `
                              <span class="text-slate-400 italic font-medium flex items-center gap-1 text-[11px]">
                                <i data-lucide="user-x" class="w-3.5 h-3.5 text-slate-300"></i>
                                <span>Pending Faculty Submission</span>
                              </span>
                            `;
                            actionsHtml = `<span class="text-slate-300 text-xs font-mono">—</span>`;
                          }

                          return `
                            <tr class="hover:bg-slate-50/70 transition">
                              <td class="p-3 text-center font-bold text-slate-400" data-label="S.No">${globalIdx}</td>
                              
                              <td class="p-3" data-label="Course Code & Title">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                  <span class="font-mono font-black text-indigo-950 text-xs">${this.escapeHtml(c.course_code || '—')}</span>
                                  <span class="text-[9.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${cLevel === 'PG' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-blue-100 text-blue-900 border border-blue-200'}">
                                    ${cLevel}
                                  </span>
                                  <span class="text-[9.5px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                    ${this.escapeHtml(c.course_category || 'Core')}
                                  </span>
                                </div>
                                <div class="text-slate-700 font-bold text-xs mt-0.5 leading-snug">
                                  ${this.escapeHtml(c.course_title || 'Untitled Course')}
                                </div>
                              </td>

                              <td class="p-3" data-label="Department & Programme">
                                <div class="font-bold text-slate-900 text-xs">${this.escapeHtml(c.department || '—')}</div>
                                <div class="text-[11px] text-slate-500 font-medium">${this.escapeHtml(c.programme || '—')}</div>
                              </td>

                              <td class="p-3 text-center" data-label="Semester & Class">
                                <div class="font-bold text-slate-800 text-xs">Sem ${this.escapeHtml(c.semester_num ? String(c.semester_num) : (c.semester || '—'))}</div>
                                <div class="text-[10.5px] text-slate-500 font-medium">${this.escapeHtml(c.year_class || (cLevel === 'PG' ? 'PG' : 'UG'))}</div>
                              </td>

                              <td class="p-3 text-center font-mono font-bold" data-label="Hours & Credits">
                                <div class="text-slate-800 text-xs">${this.escapeHtml(c.hours ? String(c.hours).replace(/&/g, '•') : '—')}h</div>
                                <div class="text-[10px] text-slate-500">${this.escapeHtml(c.credits ? String(c.credits) : '—')} Credits</div>
                              </td>

                              <td class="p-3" data-label="Faculty Name(s)">
                                ${facultyDisplay}
                              </td>

                              <td class="p-3 text-center" data-label="Submission Status">
                                ${statusBadge}
                              </td>

                              <td class="p-3 text-center" data-label="Actions">
                                ${actionsHtml}
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>

                  <!-- Table Pagination Controls -->
                  <div class="p-3.5 sm:p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50">
                    <div class="flex items-center gap-2 text-slate-600 font-medium">
                      <span>Showing <strong>${startIdx + 1}</strong>–<strong>${endIdx}</strong> of <strong>${filteredCourses.length}</strong> courses</span>
                      <span class="text-slate-300">•</span>
                      <span>Page <strong>${currentPage}</strong> of <strong>${totalPages}</strong></span>
                    </div>

                    <div class="flex items-center gap-2">
                      <select 
                        onchange="coursePlanApp.setAdminCoursePageSize(this.value)" 
                        class="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-700 cursor-pointer"
                        title="Rows per page"
                      >
                        <option value="50" ${pageSize === 50 ? 'selected' : ''}>50 / page</option>
                        <option value="100" ${pageSize === 100 ? 'selected' : ''}>100 / page</option>
                        <option value="250" ${pageSize === 250 ? 'selected' : ''}>250 / page</option>
                        <option value="all" ${pageSize > 1000 ? 'selected' : ''}>Show All</option>
                      </select>

                      <button 
                        type="button" 
                        onclick="coursePlanApp.setAdminCoursePage(${currentPage - 1})" 
                        class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs transition ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
                        ${currentPage <= 1 ? 'disabled' : ''}
                      >
                        ← Prev
                      </button>

                      <button 
                        type="button" 
                        onclick="coursePlanApp.setAdminCoursePage(${currentPage + 1})" 
                        class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs transition ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
                        ${currentPage >= totalPages ? 'disabled' : ''}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                `}
              </div>
            </div>
          `;
        })() : ''}

        <!-- ================= 4. PEDAGOGY & ICT ANALYTICS VIEW ================= -->
        ${this.adminTab === 'analytics' ? this.renderAdminAnalyticsHtml() : ''}

        <!-- ================= 5. INSTITUTIONAL COURSE PLAN REPORT VIEW ================= -->
        ${this.adminTab === 'report' ? this.renderInstitutionalReportHtml() : ''}

        <!-- ================= 6. MANAGE MASTER DATA (FACULTY / COURSES / DEPTS) ================= -->
        ${this.adminTab === 'manage' ? `
          <div class="space-y-5">
            <!-- Manage Sub-navigation -->
            <div class="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
              <button 
                type="button" 
                onclick="coursePlanApp.switchAdminManageSubTab('faculty')" 
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.adminManageSubTab === 'faculty' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
              >
                Manage Faculty Members (${this.departments.reduce((acc, d) => acc + (d.faculty ? d.faculty.length : 0), 0)})
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.switchAdminManageSubTab('course')" 
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.adminManageSubTab === 'course' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
              >
                Manage Syllabus Courses (${this.syllabusCourses.length})
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.switchAdminManageSubTab('dept')" 
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.adminManageSubTab === 'dept' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
              >
                Manage Academic Departments (${this.departments.length})
              </button>
            </div>

            <!-- SUB-TAB A: MANAGE FACULTY -->
            ${this.adminManageSubTab === 'faculty' ? `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full p-6 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                      <i data-lucide="user-check" class="w-4 h-4 text-indigo-600"></i>
                      <span>Faculty Directory & Roster Editor</span>
                    </h3>
                    <p class="text-[11px] text-slate-500">Add missing faculty members or update existing designations & emails</p>
                  </div>
                  <button 
                    type="button" 
                    onclick="coursePlanApp.openAddFacultyModal()" 
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>+ Add New Faculty</span>
                  </button>
                </div>

                <div class="flex items-center gap-3">
                  <select 
                    id="admin-manage-fac-dept" 
                    onchange="coursePlanApp.render()" 
                    class="text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="all">All Departments (${this.departments.length})</option>
                    ${this.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                  </select>
                </div>

                <div class="overflow-x-auto w-full max-h-[550px] scrollbar-thin">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] sticky top-0 z-10">
                      <tr>
                        <th class="p-3 text-center w-12">S.No</th>
                        <th class="p-3">Faculty Member</th>
                        <th class="p-3">Department</th>
                        <th class="p-3">Shift & Category</th>
                        <th class="p-3">Institutional Email</th>
                        <th class="p-3 text-center w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      ${(() => {
                        const selDept = document.getElementById('admin-manage-fac-dept')?.value || 'all';
                        let list = [];
                        this.departments.forEach(d => {
                          if (selDept !== 'all' && d.name !== selDept) return;
                          (d.faculty || []).forEach(f => list.push({ ...f, dept: d.name }));
                        });
                        return list.map((f, idx) => `
                          <tr class="hover:bg-slate-50/70 transition">
                            <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                            <td class="p-3 font-bold text-slate-900">${f.name}</td>
                            <td class="p-3 text-slate-700 font-semibold">${f.dept}</td>
                            <td class="p-3 text-slate-600">Shift ${f.shift || 'I'} • ${f.category || 'Faculty'}</td>
                            <td class="p-3 font-mono text-slate-600">${f.email || '—'}</td>
                            <td class="p-3 text-center">
                              <div class="flex items-center justify-center gap-1.5">
                                <button 
                                  type="button" 
                                  onclick="coursePlanApp.openAddFacultyModal(${JSON.stringify(f).replace(/"/g, '&quot;')}, '${f.dept}')" 
                                  class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                                >
                                  Edit
                                </button>
                                <button 
                                  type="button" 
                                  onclick="coursePlanApp.deleteAdminFaculty('${f.dept}', '${f.name}')" 
                                  class="p-1 text-slate-400 hover:text-red-600 rounded"
                                >
                                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        `).join('');
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            <!-- SUB-TAB B: MANAGE COURSES -->
            ${this.adminManageSubTab === 'course' ? `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full p-6 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                      <i data-lucide="book-marked" class="w-4 h-4 text-indigo-600"></i>
                      <span>Syllabus Master Course Catalog</span>
                    </h3>
                    <p class="text-[11px] text-slate-500">Add new courses or edit course codes, hours, and credits</p>
                  </div>
                  <button 
                    type="button" 
                    onclick="coursePlanApp.openAddCourseModal()" 
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>+ Add New Course</span>
                  </button>
                </div>

                <div class="overflow-x-auto w-full max-h-[550px] scrollbar-thin">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] sticky top-0 z-10">
                      <tr>
                        <th class="p-3 text-center w-12">S.No</th>
                        <th class="p-3">Course Code</th>
                        <th class="p-3">Title of the Course</th>
                        <th class="p-3">Department</th>
                        <th class="p-3">Semester</th>
                        <th class="p-3 text-center">Hrs & Credits</th>
                        <th class="p-3 text-center w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      ${this.syllabusCourses.slice(0, 300).map((c, idx) => `
                        <tr class="hover:bg-slate-50/70 transition">
                          <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                          <td class="p-3 font-mono font-bold text-slate-900">${c.course_code}</td>
                          <td class="p-3 font-bold text-slate-800">${c.course_title}</td>
                          <td class="p-3 text-slate-600 font-semibold">${c.department}</td>
                          <td class="p-3 text-slate-600">${c.semester || ''}</td>
                          <td class="p-3 text-center">${c.hours || '4'} Hrs • ${c.credits || '3'} Cr</td>
                          <td class="p-3 text-center">
                            <button 
                              type="button" 
                              onclick="coursePlanApp.openAddCourseModal(${JSON.stringify(c).replace(/"/g, '&quot;')})" 
                              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            <!-- SUB-TAB C: MANAGE DEPARTMENTS -->
            ${this.adminManageSubTab === 'dept' ? `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full p-6 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                      <i data-lucide="building" class="w-4 h-4 text-indigo-600"></i>
                      <span>Academic Departments Registry</span>
                    </h3>
                    <p class="text-[11px] text-slate-500">Manage all 34 teaching departments and faculties</p>
                  </div>
                  <button 
                    type="button" 
                    onclick="coursePlanApp.openAddDepartmentModal()" 
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>+ Add Department</span>
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  ${this.departments.map((d, idx) => `
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <div class="font-bold text-slate-900 text-xs">${idx + 1}. ${d.name}</div>
                        <div class="text-[11px] text-slate-500">${d.faculty ? d.faculty.length : d.faculty_count} Faculty Members</div>
                      </div>
                      <button 
                        type="button" 
                        onclick="coursePlanApp.openAddDepartmentModal(${JSON.stringify(d).replace(/"/g, '&quot;')})" 
                        class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }



// ================= 3B. PEDAGOGY & ICT ANALYTICS (NAAC 2.3.1 & 2.3.2) =================
  renderAdminAnalyticsHtml() {
    const data = this.analyticsData;
    if (!data) {
      if (!this.analyticsLoading) this.loadAnalyticsData();
      return `
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent"></div>
          <div class="text-base font-black text-slate-800">Synthesizing Institutional Pedagogy & ICT Analytics...</div>
          <p class="text-xs text-slate-500 max-w-md mx-auto">Aggregating student-centric methodologies, JosTEL LMS integrations, digital tools, and Bloom's cognitive taxonomy across all 34 departments.</p>
        </div>
      `;
    }

    const rawPlans = (data.plans && data.plans.length > 0) ? data.plans : (this.plans || []);
    
    // Stream definition helper
    const streams = {
      science: ['mathematics', 'physics', 'chemistry', 'botany', 'biotechnology', 'electronics', 'physical education'],
      computing: ['computer science', 'information technology', 'artificial intelligence', 'data science', 'voc'],
      commerce: ['commerce', 'bba'],
      arts: ['english', 'tamil', 'history', 'economics', 'counselling', 'hrm', 'visual communication', 'sanskrit', 'french', 'hindi']
    };

    const getStream = (dept) => {
      const d = (dept || '').toLowerCase();
      for (const [st, depts] of Object.entries(streams)) {
        if (depts.some(x => d.includes(x))) return st;
      }
      return 'general';
    };

    // Filter plans according to UI selectors
    const filteredPlans = rawPlans.filter(p => {
      if (this.adminAnalyticsStatus === 'Approved' && p.hod_status !== 'Approved') return false;
      if (this.adminAnalyticsDept !== 'all' && p.department_name !== this.adminAnalyticsDept) return false;
      if (this.adminAnalyticsStream !== 'all') {
        const st = getStream(p.department_name);
        if (st !== this.adminAnalyticsStream) return false;
      }
      return true;
    });

    // Recompute statistics dynamically based on filtered set
    let totalHours = 0;
    let approvedCount = 0;
    const facSet = new Set();
    const deptSet = new Set();
    const methodologies = {};
    const ictPlatforms = {};
    const ictTools = {};
    const ictPurposes = {};
    const assessmentTypes = {};
    const bloom = { K1: 0, K2: 0, K3: 0, K4: 0, K5: 0, K6: 0 };

    filteredPlans.forEach(p => {
      totalHours += parseInt(p.teaching_hours || 0, 10) || 0;
      if (p.hod_status === 'Approved') approvedCount++;
      if (p.faculty_name) facSet.add(p.faculty_name);
      if (p.department_name) deptSet.add(p.department_name);

      // Methodologies
      const dtp = Array.isArray(p.detailed_teaching_plan) ? p.detailed_teaching_plan : [];
      dtp.forEach(r => {
        const m = (r.methodology || '').trim();
        if (m) methodologies[m] = (methodologies[m] || 0) + 1;
      });

      // Bloom's levels
      const cos = Array.isArray(p.course_outcomes) ? p.course_outcomes : [];
      cos.forEach(co => {
        const lvl = (co.k_level || co.level || co.cognitive_level || '').toUpperCase();
        if (lvl.includes('K1') || lvl.includes('REMEMBER')) bloom.K1++;
        else if (lvl.includes('K2') || lvl.includes('UNDERSTAND')) bloom.K2++;
        else if (lvl.includes('K3') || lvl.includes('APPLY')) bloom.K3++;
        else if (lvl.includes('K4') || lvl.includes('ANALY')) bloom.K4++;
        else if (lvl.includes('K5') || lvl.includes('EVALUAT')) bloom.K5++;
        else if (lvl.includes('K6') || lvl.includes('CREATE') || lvl.includes('SYNTH')) bloom.K6++;
      });

      // ICT
      const icts = Array.isArray(p.ict_integration) ? p.ict_integration : [];
      icts.forEach(ict => {
        const plat = (ict.platform || '').trim();
        if (plat) ictPlatforms[plat] = (ictPlatforms[plat] || 0) + 1;
        const tool = (ict.tool || '').trim();
        if (tool) ictTools[tool] = (ictTools[tool] || 0) + 1;
        const purp = (ict.purpose || '').trim();
        if (purp) ictPurposes[purp] = (ictPurposes[purp] || 0) + 1;
      });

      // Assessments
      const acts = Array.isArray(p.learning_activities) ? p.learning_activities : [];
      acts.forEach(act => {
        if (act.is_assessment || act.cia_component) {
          const comp = (act.cia_component || 'CIA Component').trim();
          assessmentTypes[comp] = (assessmentTypes[comp] || 0) + 1;
        }
      });
    });

    // Fallback to server pre-aggregates if filtered set is whole collection
    const activeMethodologies = (filteredPlans.length === rawPlans.length && Object.keys(methodologies).length === 0) ? (data.pedagogy || {}) : methodologies;
    const activePlatforms = (filteredPlans.length === rawPlans.length && Object.keys(ictPlatforms).length === 0) ? (data.ict_platforms || {}) : ictPlatforms;
    const activeTools = (filteredPlans.length === rawPlans.length && Object.keys(ictTools).length === 0) ? (data.ict_tools || {}) : ictTools;
    const activePurposes = (filteredPlans.length === rawPlans.length && Object.keys(ictPurposes).length === 0) ? (data.ict_purposes || {}) : ictPurposes;
    const activeBloom = (filteredPlans.length === rawPlans.length && Object.values(bloom).reduce((a, b) => a + b, 0) === 0) ? (data.bloom_levels || bloom) : bloom;
    const activeAssessments = (filteredPlans.length === rawPlans.length && Object.keys(assessmentTypes).length === 0) ? (data.assessment_types || {}) : assessmentTypes;

    const totalPedagogySessions = Object.values(activeMethodologies).reduce((a, b) => a + b, 0);
    const totalPlatformsCount = Object.values(activePlatforms).reduce((a, b) => a + b, 0);
    const totalToolsCount = Object.values(activeTools).reduce((a, b) => a + b, 0);
    const totalCosCount = Object.values(activeBloom).reduce((a, b) => a + b, 0);

    const hotsCount = (activeBloom.K3 || 0) + (activeBloom.K4 || 0) + (activeBloom.K5 || 0) + (activeBloom.K6 || 0);
    const lotsCount = (activeBloom.K1 || 0) + (activeBloom.K2 || 0);
    const hotsPct = totalCosCount > 0 ? Math.round((hotsCount / totalCosCount) * 100) : 0;
    const lotsPct = totalCosCount > 0 ? (100 - hotsPct) : 0;

    let activeStudentCentricCount = 0;
    Object.entries(activeMethodologies).forEach(([meth, cnt]) => {
      const mLow = meth.toLowerCase();
      if (!mLow.includes('lecture-based') || mLow.includes('problem') || mLow.includes('case') || mLow.includes('flipped') || mLow.includes('cooperative') || mLow.includes('project') || mLow.includes('experiential')) {
        activeStudentCentricCount += cnt;
      }
    });
    const activePedagogyPct = totalPedagogySessions > 0 ? Math.round((activeStudentCentricCount / totalPedagogySessions) * 100) : 0;

    return `
      <div class="space-y-6 animate-fadeIn w-full">
        <!-- Control Header & Filters -->
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                NAAC Criterion 2.3 & 2.6
              </span>
              <span class="text-slate-400">•</span>
              <span class="text-xs font-bold text-slate-700">Institutional Analytics Engine</span>
            </div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <i data-lucide="bar-chart-3" class="w-5 h-5 text-purple-600"></i>
              <span>Pedagogy, ICT Integration & OBE Analytics Dashboard</span>
            </h2>
            <p class="text-xs text-slate-500">
              Interactive college-wide analysis of student-centric pedagogical modalities, JosTEL LMS digital integration, and Bloom's cognitive outcomes.
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('report')" 
              class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Generate Institutional Report →</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.loadAnalyticsData(true)" 
              class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Refresh Analytics"
            >
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Sync</span>
            </button>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-slate-50 p-4 rounded-2xl border border-purple-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-600">Stream:</span>
              <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                ${[
                  { id: 'all', label: 'All Streams' },
                  { id: 'science', label: '🔬 Sciences' },
                  { id: 'computing', label: '💻 Computing & Voc' },
                  { id: 'commerce', label: '📈 Commerce' },
                  { id: 'arts', label: '📚 Arts & Hum' }
                ].map(s => `
                  <button 
                    type="button" 
                    onclick="coursePlanApp.onAnalyticsFilterChange('stream', '${s.id}')"
                    class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${this.adminAnalyticsStream === s.id ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'}"
                  >
                    ${s.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-600">Status:</span>
              <select 
                onchange="coursePlanApp.onAnalyticsFilterChange('status', this.value)"
                class="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
              >
                <option value="all" ${this.adminAnalyticsStatus === 'all' ? 'selected' : ''}>All Submissions (${filteredPlans.length})</option>
                <option value="Approved" ${this.adminAnalyticsStatus === 'Approved' ? 'selected' : ''}>✓ Approved Only (${filteredPlans.filter(p => p.hod_status === 'Approved').length})</option>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-600">Department:</span>
              <select 
                onchange="coursePlanApp.onAnalyticsFilterChange('dept', this.value)"
                class="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs max-w-[200px]"
              >
                <option value="all">All 34 Departments</option>
                ${this.departments.map(d => `
                  <option value="${d.name}" ${this.adminAnalyticsDept === d.name ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Analyzing <strong>${filteredPlans.length}</strong> Course Plans across <strong>${deptSet.size}</strong> Depts</span>
          </div>
        </div>

        <!-- Macro Analytics KPI Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div class="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-2xs bg-purple-50/20 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Active Pedagogy Index</span>
                <span class="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">NAAC 2.3.1</span>
              </div>
              <div class="text-3xl font-black text-purple-900">${activePedagogyPct}%</div>
              <p class="text-[11px] text-slate-500 mt-1">Share of participatory / active learning sessions</p>
            </div>
            <div class="w-full bg-purple-100 h-2 rounded-full overflow-hidden mt-3">
              <div class="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${activePedagogyPct}%"></div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-indigo-200/80 shadow-2xs bg-indigo-50/20 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">Digital & LMS Integrations</span>
                <span class="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">NAAC 2.3.2</span>
              </div>
              <div class="text-3xl font-black text-indigo-900">${totalPlatformsCount}</div>
              <p class="text-[11px] text-slate-500 mt-1">Total ICT platform usages logged across courses</p>
            </div>
            <div class="w-full bg-indigo-100 h-2 rounded-full overflow-hidden mt-3">
              <div class="bg-gradient-to-r from-indigo-600 to-sky-600 h-full rounded-full" style="width: ${Math.min(100, totalPlatformsCount * 8)}%"></div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Higher-Order Thinking (HOTS)</span>
                <span class="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">OBE K3–K6</span>
              </div>
              <div class="text-3xl font-black text-emerald-900">${hotsPct}%</div>
              <p class="text-[11px] text-slate-500 mt-1">${hotsCount} of ${totalCosCount} Course Outcomes mapped to HOTS</p>
            </div>
            <div class="w-full bg-emerald-100 h-2 rounded-full overflow-hidden mt-3 flex">
              <div class="bg-emerald-600 h-full rounded-l-full" style="width: ${hotsPct}%" title="HOTS: ${hotsPct}%"></div>
              <div class="bg-sky-400 h-full rounded-r-full" style="width: ${lotsPct}%" title="LOTS: ${lotsPct}%"></div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs bg-amber-50/20 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Planned Teaching Hours</span>
                <span class="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Curriculum Delivery</span>
              </div>
              <div class="text-3xl font-black text-amber-900">${totalHours} hrs</div>
              <p class="text-[11px] text-slate-500 mt-1">Cumulative scheduled theory hours</p>
            </div>
            <div class="text-[10.5px] font-bold text-amber-700 mt-3 flex items-center justify-between">
              <span>Avg per Course: <strong>${filteredPlans.length > 0 ? Math.round(totalHours / filteredPlans.length) : 0} hrs</strong></span>
              <span><strong>${facSet.size}</strong> Faculty Members</span>
            </div>
          </div>
        </div>

        <!-- SECTION 1: TEACHING-LEARNING METHODOLOGIES BREAKDOWN -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800">NAAC Metric 2.3.1</span>
                <h3 class="text-base font-black text-slate-900">Pedagogical Methodologies Deployment</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Distribution of student-centric experiential, participative, and problem-solving teaching methods</p>
            </div>
            <span class="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
              Total Logged Sessions: ${totalPedagogySessions}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${Object.entries(activeMethodologies).map(([meth, count], idx) => {
              const pct = totalPedagogySessions > 0 ? Math.round((count / totalPedagogySessions) * 100) : 0;
              const isDirect = meth.toLowerCase() === 'lecture-based learning';
              const colors = isDirect 
                ? { bg: 'bg-slate-100', bar: 'bg-slate-500', text: 'text-slate-800', tag: 'Direct Instruction', tagBg: 'bg-slate-100 text-slate-600' }
                : { bg: 'bg-purple-50', bar: 'bg-gradient-to-r from-purple-600 to-indigo-600', text: 'text-purple-950', tag: 'Student-Centric Participative', tagBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200' };

              return `
                <div class="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-300 transition shadow-2xs space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                        ${idx + 1}
                      </span>
                      <span class="font-bold text-xs ${colors.text}">${this.escapeHtml(meth)}</span>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.tagBg}">${colors.tag}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                    <span>${count} session plans</span>
                    <span class="font-bold text-slate-800">${pct}% of curriculum</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="${colors.bar} h-full rounded-full transition-all duration-500" style="width: ${Math.max(5, pct)}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- SECTION 2: DIGITAL RESOURCES & ICT PLATFORMS INTEGRATION -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- ICT Platforms -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800">NAAC Metric 2.3.2</span>
                <h3 class="text-sm font-black text-slate-900 mt-1">E-Learning Platforms & LMS Utilization</h3>
              </div>
              <span class="text-xs font-bold text-indigo-600">${totalPlatformsCount} Deployments</span>
            </div>

            <div class="space-y-3">
              ${Object.keys(activePlatforms).length === 0 ? `
                <p class="text-xs text-slate-400 italic text-center py-6">No platform records found for current filter.</p>
              ` : Object.entries(activePlatforms).map(([plat, cnt]) => {
                const pct = totalPlatformsCount > 0 ? Math.round((cnt / totalPlatformsCount) * 100) : 0;
                return `
                  <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-slate-900 flex items-center gap-1.5">
                        <i data-lucide="monitor" class="w-3.5 h-3.5 text-indigo-600"></i>
                        <span>${this.escapeHtml(plat)}</span>
                      </span>
                      <span class="font-black text-indigo-700">${cnt} courses (${pct}%)</span>
                    </div>
                    <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div class="bg-indigo-600 h-full rounded-full" style="width: ${Math.max(6, pct)}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Digital Tools & E-Content -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">E-Content Formats</span>
                <h3 class="text-sm font-black text-slate-900 mt-1">Digital Tools & Multimedia Resources</h3>
              </div>
              <span class="text-xs font-bold text-emerald-600">${totalToolsCount} Tools</span>
            </div>

            <div class="space-y-3">
              ${Object.keys(activeTools).length === 0 ? `
                <p class="text-xs text-slate-400 italic text-center py-6">No digital tools records found for current filter.</p>
              ` : Object.entries(activeTools).map(([tool, cnt]) => {
                const pct = totalToolsCount > 0 ? Math.round((cnt / totalToolsCount) * 100) : 0;
                return `
                  <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-slate-900 flex items-center gap-1.5">
                        <i data-lucide="layers" class="w-3.5 h-3.5 text-emerald-600"></i>
                        <span>${this.escapeHtml(tool)}</span>
                      </span>
                      <span class="font-black text-emerald-700">${cnt} usages (${pct}%)</span>
                    </div>
                    <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div class="bg-emerald-600 h-full rounded-full" style="width: ${Math.max(6, pct)}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- SECTION 3: OUTCOME-BASED EDUCATION (OBE) BLOOM'S TAXONOMY PROFILE -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 text-sky-800">NAAC Criterion 2.6</span>
                <h3 class="text-base font-black text-slate-900">Outcome-Based Education (OBE) Bloom's Cognitive Profile</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Distribution of Course Outcomes (CO1–CO6) mapped across revised Bloom's taxonomy cognitive levels</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-sky-50 text-sky-800 rounded-xl text-xs font-bold border border-sky-200">
                LOTS (K1–K2): <strong>${lotsPct}%</strong>
              </span>
              <span class="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                HOTS (K3–K6): <strong>${hotsPct}%</strong>
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            ${[
              { k: 'K1', name: 'Remember', desc: 'Recall & Recognition', color: 'indigo', count: activeBloom.K1 || 0 },
              { k: 'K2', name: 'Understand', desc: 'Comprehend & Explain', color: 'sky', count: activeBloom.K2 || 0 },
              { k: 'K3', name: 'Apply', desc: 'Execute & Implement', color: 'teal', count: activeBloom.K3 || 0 },
              { k: 'K4', name: 'Analyze', desc: 'Deconstruct & Differentiate', color: 'emerald', count: activeBloom.K4 || 0 },
              { k: 'K5', name: 'Evaluate', desc: 'Appraise & Justify', color: 'amber', count: activeBloom.K5 || 0 },
              { k: 'K6', name: 'Create', desc: 'Design & Synthesize', color: 'rose', count: activeBloom.K6 || 0 }
            ].map(b => {
              const pct = totalCosCount > 0 ? Math.round((b.count / totalCosCount) * 100) : 0;
              return `
                <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition text-center space-y-1.5 shadow-2xs">
                  <div class="inline-block px-2.5 py-0.5 rounded-full font-mono font-black text-xs bg-${b.color}-100 text-${b.color}-800 border border-${b.color}-200">
                    ${b.k}
                  </div>
                  <div class="font-black text-slate-900 text-sm">${b.name}</div>
                  <div class="text-[10px] text-slate-400 font-medium">${b.desc}</div>
                  <div class="text-xl font-black text-slate-900 pt-2 border-t border-slate-200/60">${b.count}</div>
                  <div class="text-[11px] font-bold text-slate-500">${pct}% of COs</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- SECTION 4: CONTINUOUS INTERNAL ASSESSMENT (CIA) BLUEPRINT -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">Formative CIA Blueprint</span>
              <h3 class="text-base font-black text-slate-900 mt-1">Continuous Internal Assessment (CIA) Components Planned</h3>
            </div>
            <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              ${Object.values(activeAssessments).reduce((a, b) => a + b, 0)} Total CIA Evaluations
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            ${Object.keys(activeAssessments).length === 0 ? `
              <p class="text-xs text-slate-400 italic col-span-full text-center py-6">No assessment entries recorded for current filter.</p>
            ` : Object.entries(activeAssessments).map(([comp, cnt]) => `
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                <div>
                  <div class="text-xs font-bold text-slate-800">${this.escapeHtml(comp)}</div>
                  <div class="text-[10.5px] text-slate-500">Component</div>
                </div>
                <div class="text-base font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  ${cnt}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ================= 3C. INSTITUTIONAL COURSE PLAN REPORT (PRINTABLE & AUDIT DOSSIER) =================
  renderInstitutionalReportHtml() {
    const data = this.analyticsData || {};
    const deptStats = data.dept_stats || {};
    const rawPlans = (data.plans && data.plans.length > 0) ? data.plans : (this.plans || []);
    const approvedPlans = rawPlans.filter(p => p.hod_status === 'Approved');

    // Aggregate statistics across all 34 departments
    let totalFaculty = 0;
    let totalSubmitted = 0;
    let totalApproved = 0;
    let totalHours = 0;
    let totalSyllabusEvenCourses = 0;

    const deptRows = this.departments.map((d, idx) => {
      const dStat = deptStats[d.name] || { total: 0, approved: 0, hours: 0, faculty_count: d.faculty ? d.faculty.length : 0 };
      const fCount = d.faculty ? d.faculty.length : (dStat.faculty_count || 0);
      const sylCount = this.getDepartmentEvenSyllabusCount(d.name);
      const covPct = sylCount > 0 ? Math.min(100, Math.round((dStat.approved / sylCount) * 100)) : (dStat.approved > 0 ? 100 : 0);

      totalFaculty += fCount;
      totalSubmitted += dStat.total;
      totalApproved += dStat.approved;
      totalHours += dStat.hours;
      totalSyllabusEvenCourses += sylCount;

      return {
        sno: idx + 1,
        name: d.name,
        facultyCount: fCount,
        submitted: dStat.total,
        approved: dStat.approved,
        syllabusCount: sylCount,
        coveragePct: covPct,
        hours: dStat.hours,
        status: dStat.approved > 0 ? 'Certified' : (dStat.total > 0 ? 'Under Review' : 'Pending')
      };
    });

    const institutionalCoveragePct = totalSyllabusEvenCourses > 0 ? Math.round((totalApproved / totalSyllabusEvenCourses) * 100) : 0;
    const generatedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return `
      <style>
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
          }
          header, nav, #app-navbar, .no-print, button, select {
            display: none !important;
          }
          #app-root, .main-container {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .institutional-report-page {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 14mm 14mm 14mm;
          }
        }
      </style>

      <div class="space-y-6 animate-fadeIn w-full">
        <!-- Floating Action Header (Hidden during Print) -->
        <div class="no-print bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
            <div>
              <div class="text-xs font-bold text-slate-800">Official Institutional Report Dossier (A4 Ready)</div>
              <div class="text-[11px] text-slate-500">Autonomous College Governance & NAAC Accreditation Compliance</div>
            </div>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <button 
              type="button" 
              onclick="coursePlanApp.printInstitutionalReport()" 
              class="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>🖨️ Print / Save as PDF</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.exportInstitutionalReportCSV()" 
              class="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>📥 Export CSV</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('analytics')" 
              class="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
              <span>View Analytics</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.switchAdminTab('dept')" 
              class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Back to Hub</span>
            </button>
          </div>
        </div>

        <!-- FORMAL INSTITUTIONAL REPORT DOCUMENT (A4 SHEET STYLED) -->
        <div class="institutional-report-page bg-white p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-md max-w-5xl mx-auto space-y-8 text-slate-900">
          
          <!-- OFFICIAL LETTERHEAD -->
          <div class="border-b-2 border-slate-900 pb-6 text-center space-y-2">
            <div class="flex items-center justify-center gap-3">
              <span class="text-3xl">🏛️</span>
              <div>
                <h1 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  St. Joseph's College (Autonomous)
                </h1>
                <p class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Special Heritage Status awarded by UGC • Accredited at A++ Grade (Cycle IV) by NAAC
                </p>
                <p class="text-[11px] font-semibold text-slate-600">
                  College with Potential for Excellence • Tiruchirappalli – 620 002, Tamil Nadu, India
                </p>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-600 gap-2">
              <div class="bg-purple-50 text-purple-900 px-3 py-1 rounded-full border border-purple-200 text-[11px]">
                INTERNAL QUALITY ASSURANCE CELL (IQAC)
              </div>
              <div class="font-mono text-[11px] text-slate-500">
                Ref: SJC/IQAC/CP-REP/2026-27/EVEN • Date: ${generatedDate}
              </div>
            </div>

            <div class="pt-2">
              <h2 class="text-base sm:text-lg font-black tracking-tight text-indigo-950 uppercase">
                Institutional Course Plan & Teaching–Learning Compliance Report
              </h2>
              <p class="text-xs font-bold text-slate-700">
                Academic Year 2026–2027 • Even Semester (Dec 2026 – Apr 2027)
              </p>
            </div>
          </div>

          <!-- EXECUTIVE PREAMBLE -->
          <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
            <div class="font-bold uppercase tracking-wider text-slate-900 text-[11px] flex items-center gap-1.5">
              <span>📋</span>
              <span>Executive Quality Assurance Declaration</span>
            </div>
            <p>
              This institutional report certifies that theory course plans across all undergraduate (UG) and postgraduate (PG) programmes have been formulated in compliance with the <strong>UGC Learning Outcome-based Curriculum Framework (LOCF)</strong>, Revised Bloom's Taxonomy (Cognitive Levels K1–K6), and the autonomous academic regulations of St. Joseph's College.
            </p>
            <p>
              Each course plan details 45 scheduled instructional hours across 5 units, incorporates student-centric participative methodologies (Problem-Based Learning, Case Studies, Flipped Classrooms), mandates campus <strong>JosTEL LMS</strong> digital integration, and institutes transparent Continuous Internal Assessment (CIA) rubrics.
            </p>
          </div>

          <!-- MACRO INSTITUTIONAL SUMMARY (TABLEAU CARDS) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div class="p-4 rounded-xl border border-slate-200 bg-purple-50/40">
              <div class="text-[10px] font-bold uppercase text-purple-900">Academic Departments</div>
              <div class="text-2xl font-black text-purple-950 mt-1">${this.departments.length}</div>
              <div class="text-[10px] text-slate-500 font-semibold">${totalFaculty} Faculty Members</div>
            </div>
            <div class="p-4 rounded-xl border border-slate-200 bg-indigo-50/40">
              <div class="text-[10px] font-bold uppercase text-indigo-900">Master Catalog (Even Sem)</div>
              <div class="text-2xl font-black text-indigo-950 mt-1">${totalSyllabusEvenCourses}</div>
              <div class="text-[10px] text-slate-500 font-semibold">Semesters II, IV & VI</div>
            </div>
            <div class="p-4 rounded-xl border border-slate-200 bg-emerald-50/40">
              <div class="text-[10px] font-bold uppercase text-emerald-900">Course Plans Submitted</div>
              <div class="text-2xl font-black text-emerald-950 mt-1">${totalSubmitted}</div>
              <div class="text-[10px] text-emerald-800 font-bold">${totalApproved} HOD-Approved</div>
            </div>
            <div class="p-4 rounded-xl border border-slate-200 bg-amber-50/40">
              <div class="text-[10px] font-bold uppercase text-amber-900">Curriculum Hours Planned</div>
              <div class="text-2xl font-black text-amber-950 mt-1">${totalHours} hrs</div>
              <div class="text-[10px] text-slate-500 font-semibold">Scheduled Instructional Hours</div>
            </div>
          </div>

          <!-- TABLE 1: DEPARTMENT-WISE AUDIT & SYLLABUS COVERAGE MATRIX -->
          <div class="space-y-3 print-avoid-break">
            <div class="flex items-center justify-between border-b border-slate-300 pb-2">
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>1. Department-wise Syllabus Coverage & Course Plan Audit</span>
              </h3>
              <span class="text-[11px] font-bold text-slate-500">All 34 Academic Departments</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 text-slate-900 font-black text-[10.5px] uppercase border-b border-slate-300">
                  <tr>
                    <th class="p-2 border border-slate-300 text-center w-8">#</th>
                    <th class="p-2 border border-slate-300">Academic Department</th>
                    <th class="p-2 border border-slate-300 text-center w-16">Faculty</th>
                    <th class="p-2 border border-slate-300 text-center w-16">Submitted</th>
                    <th class="p-2 border border-slate-300 text-center w-16">Approved</th>
                    <th class="p-2 border border-slate-300 text-center w-20">Syllabus Courses</th>
                    <th class="p-2 border border-slate-300 text-center w-16">Coverage</th>
                    <th class="p-2 border border-slate-300 text-center w-20">Planned Hours</th>
                    <th class="p-2 border border-slate-300 text-center w-24">Audit Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-[11px]">
                  ${deptRows.map(r => `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-1.5 border border-slate-300 text-center font-bold text-slate-500">${r.sno}</td>
                      <td class="p-1.5 border border-slate-300 font-bold text-slate-900">${r.name}</td>
                      <td class="p-1.5 border border-slate-300 text-center font-semibold">${r.facultyCount}</td>
                      <td class="p-1.5 border border-slate-300 text-center font-semibold">${r.submitted}</td>
                      <td class="p-1.5 border border-slate-300 text-center font-bold text-emerald-800">${r.approved}</td>
                      <td class="p-1.5 border border-slate-300 text-center font-semibold">${r.syllabusCount}</td>
                      <td class="p-1.5 border border-slate-300 text-center font-black ${r.coveragePct > 0 ? 'text-emerald-700' : 'text-slate-400'}">
                        ${r.coveragePct}%
                      </td>
                      <td class="p-1.5 border border-slate-300 text-center font-semibold">${r.hours}</td>
                      <td class="p-1.5 border border-slate-300 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.approved > 0 ? 'bg-emerald-100 text-emerald-900' : (r.submitted > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500')}">
                          ${r.status}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot class="bg-slate-100 font-black text-[11px] border-t-2 border-slate-400">
                  <tr>
                    <td colspan="2" class="p-2 border border-slate-300 text-right uppercase">Institutional Total:</td>
                    <td class="p-2 border border-slate-300 text-center">${totalFaculty}</td>
                    <td class="p-2 border border-slate-300 text-center">${totalSubmitted}</td>
                    <td class="p-2 border border-slate-300 text-center text-emerald-900">${totalApproved}</td>
                    <td class="p-2 border border-slate-300 text-center">${totalSyllabusEvenCourses}</td>
                    <td class="p-2 border border-slate-300 text-center text-emerald-900">${institutionalCoveragePct}%</td>
                    <td class="p-2 border border-slate-300 text-center">${totalHours} hrs</td>
                    <td class="p-2 border border-slate-300 text-center">✓ Verified</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- TABLE 2: PEDAGOGICAL INNOVATIONS SUMMARY (NAAC CRITERION 2.3.1) -->
          <div class="space-y-3 print-avoid-break">
            <div class="flex items-center justify-between border-b border-slate-300 pb-2">
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>2. Pedagogical Methodologies Summary (NAAC Criterion 2.3.1)</span>
              </h3>
              <span class="text-[11px] font-bold text-purple-800">Student-Centric Participative Learning</span>
            </div>

            <table class="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead class="bg-slate-100 text-slate-900 font-black text-[10.5px] uppercase border-b border-slate-300">
                <tr>
                  <th class="p-2 border border-slate-300 text-center w-8">#</th>
                  <th class="p-2 border border-slate-300">Instructional Methodology</th>
                  <th class="p-2 border border-slate-300 text-center w-36">Pedagogical Classification</th>
                  <th class="p-2 border border-slate-300 text-center w-24">Planned Sessions</th>
                  <th class="p-2 border border-slate-300 text-center w-24">Curricular Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 text-[11px]">
                ${(() => {
                  const ped = data.pedagogy || {};
                  const total = Object.values(ped).reduce((a, b) => a + b, 0);
                  if (Object.keys(ped).length === 0) {
                    return '<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">No methodology records available.</td></tr>';
                  }
                  return Object.entries(ped).map(([meth, count], idx) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isDirect = meth.toLowerCase().includes('lecture-based') && !meth.toLowerCase().includes('case') && !meth.toLowerCase().includes('problem');
                    return `
                      <tr>
                        <td class="p-1.5 border border-slate-300 text-center font-bold text-slate-500">${idx + 1}</td>
                        <td class="p-1.5 border border-slate-300 font-bold text-slate-900">${meth}</td>
                        <td class="p-1.5 border border-slate-300 text-center">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isDirect ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-900'}">
                            ${isDirect ? 'Direct Instruction' : 'Student-Centric Participative'}
                          </span>
                        </td>
                        <td class="p-1.5 border border-slate-300 text-center font-semibold">${count}</td>
                        <td class="p-1.5 border border-slate-300 text-center font-bold text-slate-900">${pct}%</td>
                      </tr>
                    `;
                  }).join('');
                })()}
              </tbody>
            </table>
          </div>

          <!-- TABLE 3: DIGITAL PLATFORMS & ICT INTEGRATION (NAAC CRITERION 2.3.2) -->
          <div class="space-y-3 print-avoid-break">
            <div class="flex items-center justify-between border-b border-slate-300 pb-2">
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>3. Digital Resources & ICT Platform Adoption (NAAC Criterion 2.3.2)</span>
              </h3>
              <span class="text-[11px] font-bold text-indigo-800">LMS & E-Content Deployment</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <table class="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 text-slate-900 font-black text-[10.5px] uppercase border-b border-slate-300">
                  <tr>
                    <th class="p-2 border border-slate-300">ICT Platform / Portal</th>
                    <th class="p-2 border border-slate-300 text-center w-24">Adoption Count</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-[11px]">
                  ${(() => {
                    const plats = data.ict_platforms || {};
                    if (Object.keys(plats).length === 0) return '<tr><td colspan="2" class="p-2 text-center text-slate-400 italic">No records.</td></tr>';
                    return Object.entries(plats).map(([p, cnt]) => `
                      <tr>
                        <td class="p-1.5 border border-slate-300 font-bold text-slate-900">${p}</td>
                        <td class="p-1.5 border border-slate-300 text-center font-semibold">${cnt} courses</td>
                      </tr>
                    `).join('');
                  })()}
                </tbody>
              </table>

              <table class="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 text-slate-900 font-black text-[10.5px] uppercase border-b border-slate-300">
                  <tr>
                    <th class="p-2 border border-slate-300">Digital Tool / Format</th>
                    <th class="p-2 border border-slate-300 text-center w-24">Usage Count</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-[11px]">
                  ${(() => {
                    const tools = data.ict_tools || {};
                    if (Object.keys(tools).length === 0) return '<tr><td colspan="2" class="p-2 text-center text-slate-400 italic">No records.</td></tr>';
                    return Object.entries(tools).map(([t, cnt]) => `
                      <tr>
                        <td class="p-1.5 border border-slate-300 font-bold text-slate-900">${t}</td>
                        <td class="p-1.5 border border-slate-300 text-center font-semibold">${cnt} usages</td>
                      </tr>
                    `).join('');
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          <!-- FORMAL SIGN-OFF & AUTHENTICATION BLOCK -->
          <div class="print-avoid-break pt-12 border-t-2 border-slate-900 space-y-8">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
              <div class="space-y-1">
                <div class="h-14 flex items-end justify-center font-signature font-bold text-slate-700 italic">
                  [Verified Electronically]
                </div>
                <div class="font-black text-slate-900 text-xs">Dr. A. Rose Venis</div>
                <div class="text-[10.5px] text-slate-600 font-semibold">Coordinator, IQAC</div>
                <div class="text-[10px] text-slate-500">Internal Quality Assurance Cell</div>
              </div>

              <div class="space-y-1">
                <div class="h-14 flex items-end justify-center font-signature font-bold text-slate-700 italic">
                  [Recommended for BoS]
                </div>
                <div class="font-black text-slate-900 text-xs">Rev. Dr. S. Santiago SJ</div>
                <div class="text-[10.5px] text-slate-600 font-semibold">Dean of Academics</div>
                <div class="text-[10px] text-slate-500">St. Joseph's College (Autonomous)</div>
              </div>

              <div class="space-y-1">
                <div class="h-14 flex items-end justify-center font-signature font-bold text-slate-700 italic">
                  [Approved & Certified]
                </div>
                <div class="font-black text-slate-900 text-xs">Rev. Dr. M. Arockiasamy Xavier SJ</div>
                <div class="text-[10.5px] text-slate-600 font-semibold">Principal</div>
                <div class="text-[10px] text-slate-500">St. Joseph's College (Autonomous)</div>
              </div>
            </div>

            <div class="text-center text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-200">
              Official Quality Assurance Record • St. Joseph's College (Autonomous), Tiruchirappalli • IQAC Portal Even Semester 2026–2027
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // ================= 4. FORM VIEW (DIVIDED PART-WISE SECTION) =================
  renderFormHtml() {
    const plan = this.activePlan || this.createDefaultPlan();
    const deptObj = this.departments.find(d => d.name === (plan.department_name || this.selectedDept)) || this.getCurrentDepartmentObj();
    const facultyList = deptObj.faculty || [];
    const relevantCourses = this.getRelevantSyllabusCourses();
    const cos = plan.course_outcomes || [];
    const dtp = plan.detailed_teaching_plan || [];
    const ucp = plan.unit_completion_plan || [];
    const acts = plan.learning_activities || [];
    const assts = plan.assessment_plan || [];
    const icts = plan.ict_integration || [];
    const decl = plan.declaration || {};

    const part1Done = this.isPart1Complete();
    const part2Done = this.isPart2Complete();
    const part3Done = this.isPart3Complete();
    const part4Done = this.isPart4Complete();

    const currentDeptName = plan.department_name || (this.currentUser ? this.currentUser.department_name : this.selectedDept) || '';
    const currentFacName = plan.faculty_name || (this.currentUser ? this.currentUser.faculty_name : '') || '';

    const part2Locked = !part1Done;
    const part3Locked = !part2Done;
    const part4Locked = !part3Done;

    const isDeclarationTab = (this.activeFormTab === 'declaration');
    const canPrintAndSubmit = isDeclarationTab && !part4Locked;
    const isCourseLocked = !!(plan.course_code && (plan.is_auto_fetched || (this.syllabusCourses || []).some(c => c.course_code.toLowerCase().trim() === (plan.course_code || '').toLowerCase().trim())));
    const isUGProg = !plan.programme || (!plan.programme.startsWith('M.') && !plan.programme.includes('MCA') && !plan.programme.includes('Master') && !plan.programme.includes('Post'));

    return `
      
<style>
  .is-invalid-field {
    border-color: #ef4444 !important;
    background-color: #fef2f2 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
    animation: fieldShake 0.4s ease-in-out !important;
  }
  @keyframes fieldShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }

  /* Compact Card View for Mobile Screens */
  @media (max-width: 768px) {
    .mobile-card-table thead {
      display: none !important;
    }
    .mobile-card-table, 
    .mobile-card-table tbody, 
    .mobile-card-table tr, 
    .mobile-card-table td {
      display: block !important;
      width: 100% !important;
    }
    .mobile-card-table tr {
      margin-bottom: 1rem !important;
      background: #ffffff !important;
      border: 1.5px solid #e2e8f0 !important;
      border-radius: 1rem !important;
      padding: 0.85rem !important;
      box-shadow: 0 2px 6px -1px rgba(0, 0, 0, 0.06) !important;
    }
    .mobile-card-table td {
      padding: 0.35rem 0 !important;
      border: none !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0.25rem !important;
    }
    .mobile-card-table td::before {
      content: attr(data-label);
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.03em;
    }
  }
</style>

      <div class="space-y-6 animate-fadeIn w-full">
        <!-- Institutional Header Banner with Department & Faculty on the right -->
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1 text-center md:text-left">
            <div class="text-xs uppercase tracking-widest font-bold text-indigo-200">Internal Quality Assurance Cell (IQAC)</div>
            <div class="text-xl sm:text-2xl font-black tracking-tight">St. Joseph’s College (Autonomous), Tiruchirappalli</div>
            <div class="text-xs sm:text-sm font-extrabold text-amber-300 pt-0.5 tracking-wide">
              COURSE PLAN – ACADEMIC YEAR 2026–2027 (Even Semester)
            </div>
          </div>

          <!-- Faculty Member & Department on the Right -->
          <div class="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-3.5 text-left md:text-right shrink-0 shadow-inner flex flex-col justify-center space-y-1 min-w-[220px]">
            <div class="text-[10px] uppercase tracking-wider text-indigo-200 font-bold flex items-center md:justify-end gap-1.5">
              <i data-lucide="award" class="w-3.5 h-3.5 text-amber-300"></i>
              <span>Course Instructor</span>
            </div>
            ${(this.currentUser && this.currentUser.role === 'faculty') ? `
              <div class="text-sm font-black text-white flex items-center md:justify-end gap-1.5">
                <i data-lucide="user" class="w-4 h-4 text-amber-300"></i>
                <span>${this.escapeHtml(currentFacName || 'Faculty Member')}</span>
              </div>
              <div class="text-xs font-bold text-amber-200 flex items-center md:justify-end gap-1.5">
                <i data-lucide="building-2" class="w-3.5 h-3.5 text-amber-300"></i>
                <span>${this.escapeHtml(currentDeptName || 'Department')}</span>
              </div>
            ` : `
              <div class="space-y-1 text-slate-900">
                <select 
                  id="header-dept-select" 
                  onchange="const d=this.value; if(document.getElementById('cp-dept-name')) document.getElementById('cp-dept-name').value=d; coursePlanApp.onFormDeptChange(d);" 
                  class="w-full text-xs px-2 py-1 rounded bg-white font-bold text-slate-900 border border-indigo-200 focus:outline-none"
                >
                  ${this.departments.map(d => `
                    <option value="${d.name}" ${d.name === currentDeptName ? 'selected' : ''}>
                      ${d.name}
                    </option>
                  `).join('')}
                </select>
                <select 
                  id="header-faculty-select" 
                  onchange="const f=this.value; if(document.getElementById('cp-faculty-name')) document.getElementById('cp-faculty-name').value=f; coursePlanApp.onFormFacultyChange(f);" 
                  class="w-full text-xs px-2 py-1 rounded bg-white font-bold text-slate-900 border border-indigo-200 focus:outline-none"
                >
                  <option value="">-- Choose Faculty (${facultyList.length}) --</option>
                  ${facultyList.map(f => `
                    <option value="${f.name}" ${f.name === currentFacName ? 'selected' : ''}>
                      ${f.name}
                    </option>
                  `).join('')}
                </select>
              </div>
            `}
          </div>
        </div>

        <!-- Part-wise Navigation Tabs & Form Actions -->
        <div class="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5 sticky top-14 sm:top-16 z-20">
          <!-- Navigation Tabs with Stage Lock Icons (Horizontally scrollable on mobile) -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto flex-nowrap py-0.5">
            <!-- Part I Tab (Always Unlocked) -->
            <button 
              type="button" 
              onclick="coursePlanApp.switchFormTab('part1')" 
              class="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${this.activeFormTab === 'part1' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              <span class="w-4 h-4 rounded-full ${part1Done ? 'bg-emerald-500 text-white' : 'bg-white/20'} flex items-center justify-center text-[10px] font-black">
                ${part1Done ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : 'I'}
              </span>
              <span>Part-I: Course Info</span>
            </button>

            <!-- Part II Tab (Locked until Part I Complete) -->
            <button 
              type="button" 
              onclick="coursePlanApp.switchFormTab('part2')" 
              class="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${part2Locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-65' : (this.activeFormTab === 'part2' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 cursor-pointer' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer')}"
              title="${part2Locked ? 'Locked: Complete Part-I Course Information to unlock' : 'Part-II: Teaching Plan'}"
            >
              <span class="w-4 h-4 rounded-full ${part2Locked ? 'bg-slate-200 text-slate-500' : (part2Done ? 'bg-emerald-500 text-white' : 'bg-white/20')} flex items-center justify-center text-[10px] font-black">
                ${part2Locked ? '<i data-lucide="lock" class="w-2.5 h-2.5"></i>' : (part2Done ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : 'II')}
              </span>
              <span>Part-II: Teaching Plan</span>
              ${part2Locked ? '<i data-lucide="lock" class="w-3 h-3 text-slate-400 ml-0.5"></i>' : ''}
            </button>

            <!-- Part III Tab (Locked until Part II Complete) -->
            <button 
              type="button" 
              onclick="coursePlanApp.switchFormTab('part3')" 
              class="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${part3Locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-65' : (this.activeFormTab === 'part3' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 cursor-pointer' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer')}"
              title="${part3Locked ? 'Locked: Complete Part-II Teaching Plan topics to unlock' : 'Part-III: Activities & CIA'}"
            >
              <span class="w-4 h-4 rounded-full ${part3Locked ? 'bg-slate-200 text-slate-500' : (part3Done ? 'bg-emerald-500 text-white' : 'bg-white/20')} flex items-center justify-center text-[10px] font-black">
                ${part3Locked ? '<i data-lucide="lock" class="w-2.5 h-2.5"></i>' : (part3Done ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : 'III')}
              </span>
              <span>Part-III: Activities & CIA</span>
              ${part3Locked ? '<i data-lucide="lock" class="w-3 h-3 text-slate-400 ml-0.5"></i>' : ''}
            </button>

            <!-- Part IV Tab (Locked until Part III Complete) -->
            <button 
              type="button" 
              onclick="coursePlanApp.switchFormTab('declaration')" 
              class="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${part4Locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-65' : (this.activeFormTab === 'declaration' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 cursor-pointer' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer')}"
              title="${part4Locked ? 'Locked: Complete Part-III Activities & Assessment to unlock' : 'IV Declaration & HOD Approval'}"
            >
              <span class="w-4 h-4 rounded-full ${part4Locked ? 'bg-slate-200 text-slate-500' : (part4Done ? 'bg-emerald-500 text-white' : 'bg-white/20')} flex items-center justify-center text-[10px] font-black">
                ${part4Locked ? '<i data-lucide="lock" class="w-2.5 h-2.5"></i>' : (part4Done ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : 'IV')}
              </span>
              <span>IV Declaration & HOD Approval</span>
              ${part4Locked ? '<i data-lucide="lock" class="w-3 h-3 text-slate-400 ml-0.5"></i>' : ''}
            </button>
          </div>

          <!-- Action Buttons Next to Tabs (Smooth responsive layout) -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <!-- Back to Dashboard Button -->
            <button 
              type="button" 
              onclick="coursePlanApp.backToDashboard()" 
              class="text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition flex items-center gap-1 border border-indigo-200 shadow-2xs cursor-pointer active:scale-95 shrink-0"
              title="Return to your Dashboard"
            >
              <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
              <span>Dashboard</span>
            </button>

            <!-- New Form Button -->
            <button 
              type="button" 
              onclick="coursePlanApp.createNewPlan()" 
              class="text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1 border border-slate-300 shadow-2xs cursor-pointer active:scale-95 shrink-0"
              title="Clear form and start a new course plan"
            >
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-slate-500"></i>
              <span class="hidden sm:inline">New Form</span>
              <span class="sm:hidden">Reset</span>
            </button>

            <!-- Print Preview (Enabled ONLY on Part-IV) -->
            ${canPrintAndSubmit ? `
              <button 
                type="button" 
                onclick="coursePlanApp.previewCurrentPlan()" 
                class="text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center gap-1 border border-slate-300 shadow-2xs cursor-pointer active:scale-95 shrink-0"
                title="Preview printable course plan"
              >
                <i data-lucide="printer" class="w-3.5 h-3.5 text-slate-600"></i>
                <span class="hidden sm:inline">Print Preview</span>
                <span class="sm:hidden">Print</span>
              </button>
            ` : `
              <button 
                type="button" 
                disabled 
                class="text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 text-slate-400 font-bold rounded-xl flex items-center gap-1 border border-slate-200 cursor-not-allowed opacity-60 shrink-0"
                title="Print Preview is enabled after reaching Part-IV (Declaration & HOD Approval)"
              >
                <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
                <span class="hidden sm:inline">Print Preview</span>
                <span class="sm:hidden">Print</span>
              </button>
            `}

            <!-- Save as Draft (Always Available) -->
            <button 
              type="button" 
              onclick="coursePlanApp.saveCurrentPlan('Draft')" 
              class="text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition flex items-center gap-1 border border-slate-300 shadow-2xs cursor-pointer active:scale-95 shrink-0"
              title="Save current progress as a draft"
            >
              <i data-lucide="save" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>Save</span>
            </button>

            <!-- Submit to HOD (Enabled ONLY on Part-IV) -->
            ${canPrintAndSubmit ? `
              <button 
                type="button" 
                onclick="coursePlanApp.saveCurrentPlan('Submitted')" 
                class="text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex items-center gap-1 shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95 shrink-0 animate-pulse"
                title="Submit completed course plan to Head of Department"
              >
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span>Submit</span>
              </button>
            ` : `
              <button 
                type="button" 
                disabled 
                class="text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-200 text-slate-400 font-bold rounded-xl flex items-center gap-1 cursor-not-allowed opacity-60 shrink-0"
                title="Submit to HOD is enabled after reaching Part-IV (Declaration & HOD Approval)"
              >
                <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>Submit</span>
              </button>
            `}
          </div>
        </div>

        <!-- ================= PART I SECTION ================= -->
        <div id="section-part1" class="${this.activeFormTab === 'part1' ? '' : 'hidden'} space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div class="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Part-I: Course Information</h3>
                <p class="text-[11px] text-slate-500">General details & Course Outcomes (COs) mapped to K-Levels</p>
              </div>
              <span class="text-[10.5px] bg-rose-50 text-rose-700 font-black px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-rose-600"></i> All Fields Mandatory *
              </span>
            </div>

            <!-- Hidden Inputs for Department & Faculty Name so validation & storage continue to work -->
            <input type="hidden" id="cp-dept-name" value="${this.escapeHtml(currentDeptName)}" />
            <input type="hidden" id="cp-faculty-name" value="${this.escapeHtml(currentFacName)}" />

            <!-- A. General Details -->
            <div class="space-y-4">
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. General Details</h4>
              
              <!-- 1. Semester, Programme, Year & Class, Section in ONE LINE -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Semester (Strictly II, IV, VI only) -->
                <div>
                  <label class="block text-[11px] font-bold text-indigo-950 mb-1 flex items-center gap-1">
                    <i data-lucide="calendar" class="w-3.5 h-3.5 text-indigo-600"></i>
                    <span>Semester *</span>
                  </label>
                  <select 
                    id="cp-semester" 
                    onchange="coursePlanApp.onSemesterChange(this.value)" 
                    class="w-full text-xs px-3 py-2 border-2 border-indigo-500 bg-indigo-50/40 rounded-xl font-black text-indigo-950 focus:border-indigo-600 focus:outline-none cursor-pointer"
                  >
                    <option value="II" ${plan.semester === 'II' || plan.semester === 'Semester II' ? 'selected' : ''}>II</option>
                    <option value="IV" ${plan.semester === 'IV' || plan.semester === 'Semester IV' ? 'selected' : ''}>IV</option>
                    <option value="VI" ${plan.semester === 'VI' || plan.semester === 'Semester VI' ? 'selected' : ''}>VI</option>
                  </select>
                </div>

                <!-- Programme Dropdown (Based on Department) -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Programme *</label>
                  <select 
                    id="cp-programme" 
                    onchange="coursePlanApp.onProgrammeChange(this.value)" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:border-indigo-600 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Programme --</option>
                    ${(this.getDepartmentProgrammes(plan.department_name || this.selectedDept)).map(progName => `
                      <option value="${progName}" ${plan.programme === progName ? 'selected' : ''}>
                        ${progName}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Year and Class Dropdown (Dynamically filtered by Programme, III PG removed!) -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Year and Class *</label>
                  <select 
                    id="cp-year-class" 
                    onchange="coursePlanApp.onYearClassChange(this.value)" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:border-indigo-600 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Year & Class --</option>
                    ${isUGProg ? `
                      <option value="I UG" ${plan.year_class === 'I UG' ? 'selected' : ''}>I UG</option>
                      <option value="II UG" ${plan.year_class === 'II UG' ? 'selected' : ''}>II UG</option>
                      <option value="III UG" ${plan.year_class === 'III UG' ? 'selected' : ''}>III UG</option>
                    ` : `
                      <option value="I PG" ${plan.year_class === 'I PG' ? 'selected' : ''}>I PG</option>
                      <option value="II PG" ${plan.year_class === 'II PG' ? 'selected' : ''}>II PG</option>
                    `}
                  </select>
                </div>

                <!-- Section Dropdown -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Section *</label>
                  <select 
                    id="cp-section" 
                    onchange="coursePlanApp.onSectionChange(this.value)" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:border-indigo-600 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Section --</option>
                    <option value="N/A" ${plan.section === 'N/A' ? 'selected' : ''}>N/A</option>
                    <option value="Shift I - Section A" ${plan.section === 'Shift I - Section A' ? 'selected' : ''}>Shift I - Section A</option>
                    <option value="Shift I - Section B" ${plan.section === 'Shift I - Section B' ? 'selected' : ''}>Shift I - Section B</option>
                    <option value="Shift II - Section A" ${plan.section === 'Shift II - Section A' ? 'selected' : ''}>Shift II - Section A</option>
                    <option value="Shift II - Section B" ${plan.section === 'Shift II - Section B' ? 'selected' : ''}>Shift II - Section B</option>
                    <option value="Shift II - Section C" ${plan.section === 'Shift II - Section C' ? 'selected' : ''}>Shift II - Section C</option>
                    <option value="Shift II - Section D" ${plan.section === 'Shift II - Section D' ? 'selected' : ''}>Shift II - Section D</option>
                  </select>
                </div>
              </div>

              <!-- Course Auto-Fetch Dropdown (Syllabus Integration by Dept & Sem) -->
              <div class="bg-indigo-50/70 p-3.5 rounded-2xl border-2 border-indigo-200 space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="block text-[11px] font-black text-indigo-950 flex items-center gap-1.5">
                    <i data-lucide="sparkles" class="w-4 h-4 text-indigo-600"></i>
                    <span>Select Course (Auto-Fetch from Syllabus) *</span>
                  </label>
                  <span class="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    ${relevantCourses.length} courses in Semester ${this.getSemesterNum(plan.semester)}
                  </span>
                </div>
                <select 
                  id="cp-course-select" 
                  onchange="coursePlanApp.onSyllabusCourseSelected(this.value)" 
                  class="w-full text-xs px-3 py-2 border-2 border-indigo-500 bg-white rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="">-- Choose Course to Auto-Fill Details (${relevantCourses.length} available) --</option>
                  ${relevantCourses.map(c => `
                    <option value="${c.course_code}" ${c.course_code === plan.course_code ? 'selected' : ''}>
                      ${c.course_code} - ${c.course_title} (${c.credits || 3} Credits, ${c.hours || 4}h/wk)
                    </option>
                  `).join('')}
                </select>
                <p class="text-[10.5px] text-indigo-800 font-semibold flex items-center gap-1">
                  <span>💡</span>
                  <span>Selecting a course auto-populates Title, Category, Credits, Teaching Hours & Course Outcomes (CO1–CO6).</span>
                </p>
              </div>

              <!-- 2. Course Code, Title, Category, Hours/Week, Credits in ONE LINE -->
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <!-- Course Code (2 cols) -->
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Course Code *</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i></span>` : ''}
                  </label>
                  <input 
                    type="text" 
                    id="cp-course-code" 
                    value="${plan.course_code || ''}" 
                    onchange="coursePlanApp.onCourseCodeInputChange(this.value)"
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold ${isCourseLocked ? 'bg-slate-100 cursor-not-allowed text-slate-700' : 'bg-white focus:border-indigo-600 focus:outline-none'}" 
                    ${isCourseLocked ? 'readonly' : ''}
                    placeholder="e.g. 25UCS21CC03"
                  />
                </div>

                <!-- Course Title (4 cols) -->
                <div class="md:col-span-4">
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Course Title *</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i></span>` : ''}
                  </label>
                  <input 
                    type="text" 
                    id="cp-course-title" 
                    value="${plan.course_title || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold ${isCourseLocked ? 'bg-slate-100 cursor-not-allowed text-slate-700' : 'bg-white focus:border-indigo-600 focus:outline-none'}" 
                    ${isCourseLocked ? 'readonly' : ''}
                    placeholder="e.g. Data Structures and Algorithms"
                  />
                </div>

                <!-- Course Category (2 cols) -->
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Category *</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i></span>` : ''}
                  </label>
                  ${isCourseLocked ? `<input type="hidden" id="cp-course-category-hidden" value="${plan.course_category || 'Core'}" />` : ''}
                  <select 
                    id="cp-course-category" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold ${isCourseLocked ? 'bg-slate-100 cursor-not-allowed text-slate-700' : 'bg-white text-slate-800 focus:border-indigo-600 focus:outline-none cursor-pointer'}"
                    ${isCourseLocked ? 'disabled' : ''}
                  >
                    <option value="Core" ${plan.course_category === 'Core' ? 'selected' : ''}>Core</option>
                    <option value="Elective" ${plan.course_category === 'Elective' ? 'selected' : ''}>Elective</option>
                    <option value="Allied" ${plan.course_category === 'Allied' ? 'selected' : ''}>Allied</option>
                    <option value="Core Practical" ${plan.course_category === 'Core Practical' ? 'selected' : ''}>Core Practical</option>
                    <option value="Skill Enhancement (SEC)" ${plan.course_category === 'Skill Enhancement (SEC)' ? 'selected' : ''}>Skill Enhancement (SEC)</option>
                    <option value="Value Added (VAC)" ${plan.course_category === 'Value Added (VAC)' ? 'selected' : ''}>Value Added (VAC)</option>
                    <option value="Ability Enhancement (AECC)" ${plan.course_category === 'Ability Enhancement (AECC)' ? 'selected' : ''}>Ability Enhancement (AECC)</option>
                    <option value="Open Elective" ${plan.course_category === 'Open Elective' ? 'selected' : ''}>Open Elective</option>
                    <option value="General Language" ${plan.course_category === 'General Language' ? 'selected' : ''}>General Language</option>
                    <option value="General English" ${plan.course_category === 'General English' ? 'selected' : ''}>General English</option>
                  </select>
                </div>

                <!-- Teaching Hours (2 cols) -->
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Hours/Week *</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i></span>` : ''}
                  </label>
                  <input 
                    type="text" 
                    id="cp-teaching-hours" 
                    value="${plan.teaching_hours || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold ${isCourseLocked ? 'bg-slate-100 cursor-not-allowed text-slate-700' : 'bg-white focus:border-indigo-600 focus:outline-none'}" 
                    ${isCourseLocked ? 'readonly' : ''}
                    placeholder="e.g. 60 Hrs & 4 Hrs/Wk"
                  />
                </div>

                <!-- Course Credits (2 cols) -->
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Credits *</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i></span>` : ''}
                  </label>
                  <input 
                    type="text" 
                    id="cp-credits" 
                    value="${plan.credits || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold ${isCourseLocked ? 'bg-slate-100 cursor-not-allowed text-slate-700' : 'bg-white focus:border-indigo-600 focus:outline-none'}" 
                    ${isCourseLocked ? 'readonly' : ''}
                    placeholder="e.g. 3 or 4"
                  />
                </div>
              </div>
            </div>

            <!-- B. Course Outcomes (COs) -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">B. Course Outcomes (COs)</h4>
                  <p class="text-[11px] text-slate-500 italic">List the Course Outcomes as specified in the approved syllabus.</p>
                </div>
                ${isCourseLocked ? `
                  <span class="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                    <i data-lucide="lock" class="w-3.5 h-3.5 text-emerald-600"></i> Syllabus COs Locked
                  </span>
                ` : ''}
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse mobile-card-table">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2.5 w-24">CO Code</th>
                      <th class="p-2.5">Course Outcome</th>
                      <th class="p-2.5 w-56">K-Levels *</th>
                    </tr>
                  </thead>
                  <tbody id="cp-cos-tbody" class="divide-y divide-slate-100">
                    ${cos.map((co, idx) => `
                      <tr>
                        <td class="p-2" data-label="CO Code">
                          <input type="text" class="co-code w-full text-xs px-2 py-1.5 font-bold font-mono border border-slate-200 bg-slate-50 rounded text-center text-slate-700" value="${co.code || 'CO' + (idx + 1)}" readonly />
                        </td>
                        <td class="p-2" data-label="Course Outcome Description">
                          <textarea 
                            class="co-outcome w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded leading-relaxed ${isCourseLocked ? 'bg-slate-100 cursor-not-allowed text-slate-700 font-medium' : 'bg-white focus:border-indigo-600 focus:outline-none'}" 
                            rows="2" 
                            ${isCourseLocked ? 'readonly' : ''}
                            placeholder="State outcome statement..."
                          >${co.outcome || ''}</textarea>
                        </td>
                        <td class="p-2" data-label="Cognitive Level (Bloom's)">
                          ${isCourseLocked ? `<input type="hidden" class="co-klevel-hidden" value="${co.k_level || 'K1'}" />` : ''}
                          <select 
                            class="co-klevel w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-semibold ${isCourseLocked ? 'bg-slate-100 cursor-not-allowed text-slate-700 font-bold' : 'bg-white focus:border-indigo-600 focus:outline-none cursor-pointer'}"
                            ${isCourseLocked ? 'disabled' : ''}
                          >
                            <option value="K1" ${co.k_level === 'K1' ? 'selected' : ''}>K1 - Remember</option>
                            <option value="K2" ${co.k_level === 'K2' ? 'selected' : ''}>K2 - Understand</option>
                            <option value="K3" ${co.k_level === 'K3' ? 'selected' : ''}>K3 - Apply</option>
                            <option value="K4" ${co.k_level === 'K4' ? 'selected' : ''}>K4 - Analyse</option>
                            <option value="K5" ${co.k_level === 'K5' ? 'selected' : ''}>K5 - Evaluate</option>
                            <option value="K6" ${co.k_level === 'K6' ? 'selected' : ''}>K6 - Create</option>
                            <option value="K1, K2" ${co.k_level === 'K1, K2' ? 'selected' : ''}>K1, K2</option>
                            <option value="K3, K4" ${co.k_level === 'K3, K4' ? 'selected' : ''}>K3, K4</option>
                            <option value="K5, K6" ${co.k_level === 'K5, K6' ? 'selected' : ''}>K5, K6</option>
                          </select>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            </div>

            <!-- Next Part Button -->
            <div class="flex justify-end pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onclick="coursePlanApp.proceedToTab(\'part2\')" class="w-full sm:w-auto justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
              >
                <span>Continue to Part-II: Teaching Plan</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ================= PART II SECTION ================= -->
        <div id="section-part2" class="${this.activeFormTab === 'part2' ? '' : 'hidden'} space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div class="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Part-II: Unit-wise Teaching Plan</h3>
                <p class="text-[11px] text-slate-500">Divide each unit into manageable topics, allocate hours, and map Course Outcomes</p>
              </div>
              <span class="text-[10.5px] bg-rose-50 text-rose-700 font-black px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-rose-600"></i> All Fields Mandatory *
              </span>
            </div>

            <!-- A. Detailed Teaching Plan -->
            <div class="space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. Detailed Teaching Plan</h4>
                  <p class="text-[11px] text-slate-500">Instruction: Divide each unit into manageable topics (From & To) and allocate appropriate teaching hours.</p>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <button 
                    type="button" 
                    onclick="coursePlanApp.openCourseSyllabusReferenceModal()" 
                    class="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    title="View syllabus units, topics, textbooks and reference resources for this course"
                  >
                    <i data-lucide="book-open" class="w-3.5 h-3.5 text-amber-300"></i>
                    <span>View Course Syllabus & References</span>
                  </button>
                  <button 
                    type="button" 
                    onclick="coursePlanApp.toggleTeachingPlanTable()" 
                    class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer transition shadow-2xs"
                    title="${this.isTeachingPlanCollapsed ? 'Show Detailed Teaching Plan' : 'Hide Detailed Teaching Plan'}"
                  >
                    <i data-lucide="${this.isTeachingPlanCollapsed ? 'eye-off' : 'eye'}" class="w-4 h-4 text-indigo-600"></i>
                    <span>${this.isTeachingPlanCollapsed ? 'Show Table' : 'Hide Table'}</span>
                  </button>
                </div>
              </div>

              <div class="${this.isTeachingPlanCollapsed ? 'hidden' : ''} overflow-x-auto rounded-xl border border-slate-200 max-h-none md:max-h-[580px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse mobile-card-table">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0 z-10">
                    <tr>
                      <th class="p-2.5 w-32">Month / Days</th>
                      <th class="p-2.5 w-28">Unit</th>
                      <th class="p-2.5 w-48">From (Topic) *</th>
                      <th class="p-2.5 w-48">To (Topic) *</th>
                      <th class="p-2.5 w-16 text-center">Hours *</th>
                      <th class="p-2.5 w-60">Teaching Methodology *</th>
                      <th class="p-2.5 w-60">Learning Resources *</th>
                      <th class="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="cp-dtp-tbody" class="divide-y divide-slate-100">
                    ${dtp.map((row, idx) => {
                      const isFirstInMonth = (idx === 0 || row.month_days !== dtp[idx - 1].month_days);
                      let span = 1;
                      if (isFirstInMonth) {
                        for (let j = idx + 1; j < dtp.length; j++) {
                          if (dtp[j].month_days === row.month_days) span++;
                          else break;
                        }
                      }

                      return `
                        <tr>
                          ${isFirstInMonth ? `
                            <td rowspan="${span}" class="p-2.5 font-bold text-slate-800 bg-slate-50/70 border-r border-slate-200 text-center align-middle whitespace-nowrap hidden md:table-cell select-none" data-label="Month / Days">
                              <div class="flex flex-col items-center justify-center gap-2">
                                <div class="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 shadow-2xs font-black text-indigo-950 text-xs inline-block">
                                  ${this.escapeHtml(row.month_days || '—')}
                                </div>
                                <button 
                                  type="button" 
                                  onclick="coursePlanApp.addTeachingPlanRowForMonth('${this.escapeHtml(row.month_days || '')}', ${idx + span - 1})" 
                                  class="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10.5px] border border-indigo-200 flex items-center gap-1 cursor-pointer transition shadow-2xs active:scale-95"
                                  title="Add topic row under ${this.escapeHtml(row.month_days || 'this month')}"
                                >
                                  <i data-lucide="plus" class="w-3 h-3 text-indigo-600"></i>
                                  <span>Add Topic Row</span>
                                </button>
                              </div>
                              <input type="hidden" class="dtp-month" value="${this.escapeHtml(row.month_days || '')}" />
                            </td>
                          ` : ''}

                          <!-- Mobile-only Month/Days cell so mobile card clearly shows month -->
                          <td class="md:hidden p-1.5" data-label="Month / Days">
                            <div class="flex items-center justify-between gap-2">
                              <span class="font-black text-indigo-950 text-xs">${this.escapeHtml(row.month_days || '—')}</span>
                              <button 
                                type="button" 
                                onclick="coursePlanApp.addTeachingPlanRowForMonth('${this.escapeHtml(row.month_days || '')}', ${idx})" 
                                class="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px] border border-indigo-200 flex items-center gap-1 cursor-pointer"
                              >
                                <i data-lucide="plus" class="w-3 h-3 text-indigo-600"></i> Add Topic Row
                              </button>
                            </div>
                            <input type="hidden" class="dtp-month" value="${this.escapeHtml(row.month_days || '')}" />
                          </td>

                          <td class="p-1.5" data-label="Unit">
                            <select 
                              class="dtp-unit w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-bold bg-white focus:border-indigo-600 focus:outline-none"
                            >
                              <option value="">-- Select Unit --</option>
                              <option value="Unit I" ${row.unit === 'Unit I' ? 'selected' : ''}>Unit I</option>
                              <option value="Unit II" ${row.unit === 'Unit II' ? 'selected' : ''}>Unit II</option>
                              <option value="Unit III" ${row.unit === 'Unit III' ? 'selected' : ''}>Unit III</option>
                              <option value="Unit IV" ${row.unit === 'Unit IV' ? 'selected' : ''}>Unit IV</option>
                              <option value="Unit V" ${row.unit === 'Unit V' ? 'selected' : ''}>Unit V</option>
                            </select>
                          </td>
                          <td class="p-1.5" data-label="From (Topic)">
                            <textarea class="dtp-from-topic w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:border-indigo-600 focus:outline-none" rows="2" placeholder="Start topic / portion...">${row.from_topic || row.topics || ''}</textarea>
                          </td>
                          <td class="p-1.5" data-label="To (Topic)">
                            <textarea class="dtp-to-topic w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:border-indigo-600 focus:outline-none" rows="2" placeholder="End topic / portion...">${row.to_topic || ''}</textarea>
                          </td>
                          <td class="p-1.5 text-center" data-label="Lecture Hours">
                            <input type="number" class="dtp-hours w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-bold text-center focus:border-indigo-600 focus:outline-none" value="${row.hours || ''}" placeholder="Hrs" />
                          </td>
                          <td class="p-1.5" data-label="Teaching Methodology">
                            ${this.renderMethodologyMultiSelect(idx, row.methodology)}
                          </td>
                          <td class="p-1.5" data-label="Learning Resources">
                            ${this.renderResourceMultiSelect(idx, row.resources)}
                          </td>
                          <td class="p-1.5 text-center" data-label="Action">
                            <button type="button" onclick="coursePlanApp.deleteTeachingPlanRow(${idx})" class="p-1 text-slate-400 hover:text-red-600 rounded">
                              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- B. Unit Completion Plan -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">B. Unit Completion Plan</h4>
              <p class="text-[11px] text-slate-500 italic">
                Note: This section provides an overview of the time allocated to each unit. Actual hours are fetched from syllabus and locked from editing.
              </p>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse mobile-card-table">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2.5 w-36">Unit</th>
                      <th class="p-2.5 w-36 text-center">Planned Hours</th>
                      <th class="p-2.5 w-44 text-center">Actual Hours (As per Syllabus)</th>
                      <th class="p-2.5">Expected Completion Date</th>
                    </tr>
                  </thead>
                  <tbody id="cp-ucp-tbody" class="divide-y divide-slate-100 font-medium">
                    ${ucp.map((u, idx) => `
                      <tr>
                        <td class="p-2.5 font-bold text-slate-800" data-label="Unit">${u.unit}</td>
                        <td class="p-2 text-center" data-label="Planned Hours">
                          <input type="number" class="ucp-planned w-28 text-xs px-2 py-1.5 border border-slate-300 rounded font-bold text-center focus:border-indigo-600 focus:outline-none" value="${u.planned_hours || ''}" onchange="coursePlanApp.calculateTotalHours()" placeholder="0" />
                        </td>
                        <td class="p-2 text-center" data-label="Actual Hours">
                          <input 
                            type="number" 
                            class="ucp-actual w-28 text-xs px-2 py-1.5 border border-slate-200 bg-slate-100 cursor-not-allowed rounded font-bold text-center text-slate-700" 
                            value="${u.actual_hours || ''}" 
                            readonly 
                            title="Actual hours fetched from syllabus master"
                            placeholder="0" 
                          />
                        </td>
                        <td class="p-2" data-label="Expected Date">
                          <input type="date" class="ucp-date w-48 text-xs px-2.5 py-1.5 border border-slate-300 rounded font-mono focus:border-indigo-600 focus:outline-none" value="${u.target_date || ''}" />
                        </td>
                      </tr>
                    `).join('')}
                    <tr class="bg-indigo-50/60 font-bold border-t border-indigo-200">
                      <td class="p-2.5 text-indigo-950 font-black">Total</td>
                      <td class="p-2.5 text-center text-indigo-950 font-black" id="ucp-total-planned">0 Hrs</td>
                      <td class="p-2.5 text-center text-indigo-950 font-black" id="ucp-total-actual">0 Hrs</td>
                      <td class="p-2.5"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="flex justify-between pt-4 border-t border-slate-100">
              <button type="button" onclick="coursePlanApp.switchFormTab('part1')" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
                ← Back to Part-I
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.proceedToTab(\'part3\')" class="w-full sm:w-auto justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              >
                <span>Continue to Part-III: Activities & CIA</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ================= PART III SECTION ================= -->
        <div id="section-part3" class="${this.activeFormTab === 'part3' ? '' : 'hidden'} space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div class="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Part-III: Learning Activities and Assessment Plan</h3>
                <p class="text-[11px] text-slate-500">Activities enabling application, analysis, and institutional assessment schedules</p>
              </div>
              <span class="text-[10.5px] bg-rose-50 text-rose-700 font-black px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-rose-600"></i> All Fields Mandatory *
              </span>
            </div>

            <!-- A. Learning Activities -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. Learning Activities</h4>
                  <p class="text-[11px] text-slate-500 italic">Click "+ Add Activity" to open the interactive form, select from 25 activities, and optionally convert to CIA assessment.</p>
                </div>
                <button 
                  type="button" 
                  onclick="coursePlanApp.openActivityModal()" 
                  class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
                >
                  <i data-lucide="plus" class="w-4 h-4"></i> Add Activity
                </button>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse mobile-card-table">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2.5 w-12 text-center">S.No</th>
                      <th class="p-2.5 w-72">Learning Activity</th>
                      <th class="p-2.5 w-44">Related Unit / Topic</th>
                      <th class="p-2.5">Expected Learning Outcome</th>
                      <th class="p-2.5 w-28">Proposed Date</th>
                      <th class="p-2.5 w-44 text-center">Assessment Status</th>
                      <th class="p-2.5 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="cp-acts-tbody" class="divide-y divide-slate-100 font-medium">
                    ${acts.length === 0 ? `
                      <tr>
                        <td colspan="7" class="p-6 text-center text-slate-400 italic font-semibold">
                          No learning activities added yet. Click "+ Add Activity" above to add your first activity.
                        </td>
                      </tr>
                    ` : acts.map((act, idx) => `
                      <tr class="hover:bg-slate-50/50 transition">
                        <td class="p-2.5 text-center font-bold text-slate-400" data-label="S.No">${idx + 1}</td>
                        <td class="p-2.5" data-label="Learning Activity">
                          <div class="flex flex-wrap gap-1">
                            ${(act.activity || '').split(',').map(s => s.trim()).filter(Boolean).map(item => `
                              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                                ${this.escapeHtml(item)}
                              </span>
                            `).join('') || '<span class="text-slate-400 italic">No activity specified</span>'}
                          </div>
                        </td>
                        <td class="p-2.5 font-bold text-slate-800" data-label="Unit / Topic">${this.escapeHtml(act.topic || '—')}</td>
                        <td class="p-2.5 text-slate-600 text-xs leading-relaxed" data-label="Expected Outcome">${this.escapeHtml(act.outcome || '—')}</td>
                        <td class="p-2.5 font-mono text-slate-700 font-bold whitespace-nowrap" data-label="Proposed Date">${this.formatDateToDDMMYYYY(act.proposed_date) || '—'}</td>
                        <td class="p-2.5 text-center" data-label="Assessment Status">
                          ${act.is_assessment ? `
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                              <i data-lucide="award" class="w-3.5 h-3.5 text-amber-700"></i>
                              <span>${this.escapeHtml(act.cia_component || 'CIA')} (${this.escapeHtml(act.cia_marks || '10')}M)</span>
                            </span>
                          ` : `
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              Learning Activity
                            </span>
                          `}
                        </td>
                        <td class="p-2.5 text-center" data-label="Action">
                          <div class="flex items-center justify-center gap-1">
                            <button 
                              type="button" 
                              onclick="coursePlanApp.openActivityModal(${idx})" 
                              class="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition cursor-pointer" 
                              title="Edit Activity"
                            >
                              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                            </button>
                            <button 
                              type="button" 
                              onclick="coursePlanApp.deleteActivityRow(${idx})" 
                              class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer" 
                              title="Delete Activity"
                            >
                              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- B. Assessment Plan (Completely Uneditable, Default Institutional Fixed + Auto-synced from Section A) -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span>B. Assessment Plan</span>
                    <span class="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                      <i data-lucide="lock" class="w-3 h-3 text-emerald-600"></i> Mid, End & C1 Pre-filled • Completely Uneditable
                    </span>
                  </h4>
                  <p class="text-[11px] text-slate-500 italic">
                    Institutional exams (C1 JosTEL MCQ, Mid Sem & End Sem) are pre-filled by default. CIA continuous components are auto-populated from Section A above.
                  </p>
                </div>
              </div>

              ${(() => {
                const fullAssessmentPlan = this.getFullAssessmentPlan(plan);
                const totalMarks = fullAssessmentPlan.reduce((sum, a) => sum + (parseFloat(a.marks) || 0), 0);

                return `
                  <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-left text-xs border-collapse mobile-card-table">
                      <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th class="p-2.5 w-12 text-center">S.No</th>
                          <th class="p-2.5 w-48">CIA / Exam Component</th>
                          <th class="p-2.5 w-24 text-center">Marks</th>
                          <th class="p-2.5">Learning Activity / Assessment Category</th>
                          <th class="p-2.5 w-44">Unit Coverage</th>
                          <th class="p-2.5 w-36 text-center">Proposed Date / Window</th>
                          <th class="p-2.5">Expected Outcome</th>
                        </tr>
                      </thead>
                      <tbody id="cp-assts-tbody" class="divide-y divide-slate-100 font-medium bg-slate-50/30">
                        ${fullAssessmentPlan.map((asst, idx) => `
                          <tr class="${asst.is_default ? 'bg-indigo-50/30' : 'bg-amber-50/30'}">
                            <td class="p-2.5 text-center font-bold text-slate-400" data-label="S.No">${idx + 1}</td>
                            <td class="p-2.5" data-label="CIA Component">
                              <div class="inline-flex items-center gap-1.5 font-black text-indigo-950 text-xs">
                                <i data-lucide="${asst.is_default ? 'lock' : 'award'}" class="w-3.5 h-3.5 ${asst.is_default ? 'text-indigo-600' : 'text-amber-600'}"></i>
                                <span>${this.escapeHtml(asst.component)}</span>
                              </div>
                              <div class="mt-0.5">
                                ${asst.is_default ? '<span class="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1"><i data-lucide="shield-check" class="w-2.5 h-2.5 text-indigo-600"></i> Institutional Default</span>' : '<span class="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1"><i data-lucide="check" class="w-2.5 h-2.5 text-amber-700"></i> Synced from Section A</span>'}
                              </div>
                            </td>
                            <td class="p-2.5 text-center" data-label="Marks">
                              <span class="px-2.5 py-1 rounded-lg ${asst.is_default ? 'bg-indigo-600' : 'bg-amber-600'} text-white font-black text-xs shadow-2xs">
                                ${this.escapeHtml(asst.marks)} Marks
                              </span>
                            </td>
                            <td class="p-2.5 font-bold text-slate-800" data-label="Assessment Category">
                              ${this.escapeHtml(asst.category || '—')}
                            </td>
                            <td class="p-2.5 text-slate-700 font-medium" data-label="Unit Coverage">
                              ${this.escapeHtml(asst.unit_coverage || '—')}
                            </td>
                            <td class="p-2.5 font-mono text-slate-700 font-bold text-center" data-label="Proposed Date / Window">
                              ${this.escapeHtml(asst.date || '—')}
                            </td>
                            <td class="p-2.5 text-slate-600 text-[11px]" data-label="Expected Outcome">
                              ${this.escapeHtml(asst.outcome || '—')}
                            </td>
                          </tr>
                        `).join('')}
                        <tr class="bg-indigo-50/70 border-t-2 border-indigo-200 font-bold text-indigo-950">
                          <td class="p-2.5 text-center font-black">Σ</td>
                          <td class="p-2.5 font-black">Total Examination & CIA Plan</td>
                          <td class="p-2.5 text-center font-black">
                            ${totalMarks} Marks
                          </td>
                          <td class="p-2.5 italic text-slate-500 text-[11px]" colspan="4">
                            Mid, End & C1 Pre-filled Institutional Assessments • Converted Activities Auto-synced • Completely Uneditable
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                `;
              })()}
            </div>

            <!-- C. Digital Resources -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">C. Digital Resources and ICT Integration <span class="text-indigo-600 font-semibold text-[11px] normal-case">(Minimum 1 row mandatory)</span></h4>
                  <p class="text-[11px] text-slate-500">JosTEL LMS, PPT, online quizzes, and simulation software. Minimum 1 row is required.</p>
                </div>
                <button 
                  type="button" 
                  onclick="coursePlanApp.addICTRow()" 
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                >
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add ICT Resource
                </button>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2.5 w-12 text-center">S.No</th>
                      <th class="p-2.5 w-48">Topic / Unit</th>
                      <th class="p-2.5 w-56">Digital Resource / ICT Tool</th>
                      <th class="p-2.5 w-52">Platform (JosTEL / Others)</th>
                      <th class="p-2.5">Purpose</th>
                      <th class="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="cp-icts-tbody" class="divide-y divide-slate-100 font-medium">
                    ${icts.map((ict, idx) => {
                      const toolOptions = [
                        'PPT / Interactive Slides', 'Video Lecture', 'Simulation / Virtual Lab',
                        'Online Quiz / JosTEL Quiz', 'Discussion Forum', 'E-Book / PDF Notes',
                        'Spreadsheet / Data Analysis', 'Programming IDE / Code Editor'
                      ];
                      const curTool = ict.tool || '';
                      const isOtherTool = curTool !== '' && !toolOptions.includes(curTool);

                      const platformOptions = [
                        'JosTEL', 'Google Classroom', 'Moodle', 'YouTube',
                        'Kahoot / Quizizz', 'SWAYAM / NPTEL', 'GitHub'
                      ];
                      const curPlatform = ict.platform || 'JosTEL';
                      const isOtherPlatform = curPlatform !== '' && !platformOptions.includes(curPlatform);

                      return `
                        <tr>
                          <td class="p-2 text-center font-bold text-slate-400">${idx + 1}</td>
                          <td class="p-2">
                            <input type="text" class="ict-topic w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${ict.topic || ''}" placeholder="Topic / Unit..." />
                          </td>
                          <td class="p-2">
                            <select 
                              class="ict-tool-select w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-bold bg-white"
                              onchange="coursePlanApp.onICTToolChange(this)"
                            >
                              <option value="">-- Select Tool --</option>
                              ${toolOptions.map(opt => `<option value="${opt}" ${curTool === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                              <option value="Others" ${isOtherTool ? 'selected' : ''}>Others (Specify)</option>
                            </select>
                            <input 
                              type="text" 
                              class="ict-tool-other w-full text-xs px-2 py-1 border border-indigo-400 rounded mt-1 ${isOtherTool ? '' : 'hidden'}" 
                              placeholder="Specify digital resource / tool..." 
                              value="${isOtherTool ? curTool : ''}"
                            />
                          </td>
                          <td class="p-2">
                            <select 
                              class="ict-platform-select w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                              onchange="coursePlanApp.onICTPlatformChange(this)"
                            >
                              <option value="">-- Select Platform --</option>
                              ${platformOptions.map(opt => `<option value="${opt}" ${curPlatform === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                              <option value="Others" ${isOtherPlatform ? 'selected' : ''}>Others (Specify)</option>
                            </select>
                            <input 
                              type="text" 
                              class="ict-platform-other w-full text-xs px-2 py-1 border border-indigo-400 rounded mt-1 ${isOtherPlatform ? '' : 'hidden'}" 
                              placeholder="Specify platform..." 
                              value="${isOtherPlatform ? curPlatform : ''}"
                            />
                          </td>
                          <td class="p-2">
                            <input type="text" class="ict-purpose w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${ict.purpose || ''}" placeholder="Purpose of ICT integration..." />
                          </td>
                          <td class="p-2 text-center">
                            <button type="button" onclick="coursePlanApp.deleteICTRow(${idx})" class="p-1 text-slate-400 hover:text-red-600 rounded">
                              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="flex justify-between pt-4 border-t border-slate-100">
              <button type="button" onclick="coursePlanApp.switchFormTab('part2')" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
                ← Back to Part-II
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.proceedToTab(\'declaration\')" class="w-full sm:w-auto justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              >
                <span>Continue to IV Declaration & HOD Approval</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ================= DECLARATION SECTION ================= -->
        <div id="section-declaration" class="${this.activeFormTab === 'declaration' ? '' : 'hidden'} space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div class="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Declaration & Submissions</h3>
                <p class="text-[11px] text-slate-500">Confirm preparation compliance and submit directly to Head of Department</p>
              </div>
              <span class="text-[10.5px] bg-rose-50 text-rose-700 font-black px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-rose-600"></i> All Fields Mandatory *
              </span>
            </div>

            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <div class="flex items-start gap-2.5">
                <input type="checkbox" id="cp-decl-check" ${decl.confirmed ? 'checked' : ''} class="mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer" />
                <label for="cp-decl-check" class="font-medium cursor-pointer">
                  <strong class="text-indigo-900">Declaration by the Faculty Member *:</strong> I hereby confirm that the course plan has been prepared based on the approved syllabus, prescribed teaching hours, academic calendar, and institutional assessment regulations.
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="p-4 border border-slate-200 rounded-xl space-y-3">
                <div class="text-[11px] font-bold text-slate-600 uppercase">Faculty Signature & Date</div>
                <div>
                  <label class="block text-[10px] text-slate-500 font-bold">Faculty Member Name</label>
                  <input 
                    type="text" 
                    id="cp-decl-fac-sig" 
                    value="${plan.faculty_name || decl.faculty_signature || ''}" 
                    readonly 
                    class="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-bold bg-slate-100 text-slate-800 cursor-not-allowed" 
                    title="Automatically synchronized with Name of the Faculty Member in Part-I" 
                  />
                  <span class="text-[10px] text-indigo-600 font-medium mt-0.5 block">✓ Synced with Part-I: ${plan.faculty_name || '(Select in Part-I)'}</span>
                </div>
                <div>
                  <label class="block text-[10px] text-slate-500 font-bold">Date of Submission</label>
                  <input type="date" id="cp-decl-fac-date" value="${decl.submission_date || new Date().toISOString().split('T')[0]}" class="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-mono" />
                </div>
              </div>

              <div class="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/70">
                <div class="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
                  <span>HOD Review & Approval Workflow</span>
                </div>
                <p class="text-[11px] text-slate-600">
                  When you click <strong>Submit to HOD</strong>, this course plan will be transferred to your Head of Department (${this.selectedDept}) for review and approval.
                </p>
                <div class="text-[11px] text-emerald-700 font-bold">
                  ✓ After HOD approves, the course plan is automatically registered into the institutional IQAC Academic Audit records.
                </div>
              </div>
            </div>

            <!-- Bottom Action Controls (End of the Form) -->
            <div class="flex items-center justify-between pt-5 border-t-2 border-slate-200 flex-wrap gap-3 bg-slate-50/80 p-4 rounded-2xl">
              <div class="flex items-center gap-2">
                <button type="button" onclick="coursePlanApp.switchFormTab('part3')" class="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs cursor-pointer">
                  ← Back to Part-III
                </button>
                <button 
                  type="button" 
                  onclick="coursePlanApp.createNewPlan()" 
                  class="text-xs px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                  title="Clear form and start a new course plan"
                >
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>New Form</span>
                </button>
              </div>

              <div class="flex items-center gap-3 flex-wrap">
                <button 
                  type="button" 
                  onclick="coursePlanApp.previewCurrentPlan()" 
                  class="text-xs px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl transition flex items-center gap-2 border border-slate-300 shadow-2xs cursor-pointer"
                >
                  <i data-lucide="printer" class="w-4 h-4 text-slate-600"></i>
                  <span>Print Preview</span>
                </button>
                <button 
                  type="button" 
                  onclick="coursePlanApp.saveCurrentPlan('Draft')" 
                  class="text-xs px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                >
                  <i data-lucide="save" class="w-4 h-4 text-slate-500"></i>
                  <span>Save as Draft</span>
                </button>
                <button 
                  type="button" 
                  onclick="coursePlanApp.saveCurrentPlan('Submitted')" 
                  class="text-xs px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95"
                >
                  <i data-lucide="send" class="w-4 h-4"></i>
                  <span>Submit to HOD</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ================= 5. PRINT VIEW =================
  renderPrintHtml() {
    const plan = this.activePlan || this.createDefaultPlan();
    const cos = plan.course_outcomes || [];
    const dtp = plan.detailed_teaching_plan || [];
    const ucp = plan.unit_completion_plan || [];
    const acts = plan.learning_activities || [];
    const assts = plan.assessment_plan || [];
    const icts = plan.ict_integration || [];
    const decl = plan.declaration || {};

    return `
      <div class="space-y-6 w-full animate-fadeIn">
        <!-- Controls (Hidden on print) -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 no-print">
          <button 
            type="button" 
            onclick="coursePlanApp.backToDashboard()" 
            class="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Back</span>
          </button>
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="window.print()" 
              class="text-xs px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer"
            >
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        <!-- Printable Document (1:1 matching institutional PDF) -->
        <div id="course-plan-print-doc" class="bg-white p-4 sm:p-12 rounded-2xl border border-slate-300 shadow-sm max-w-5xl mx-auto space-y-6 text-slate-900 font-sans">
          
          <div class="text-center space-y-1 border-b-2 border-slate-800 pb-4">
            <h1 class="text-sm font-extrabold uppercase tracking-wide text-slate-700">Internal Quality Assurance Cell (IQAC)</h1>
            <h2 class="text-lg font-black tracking-tight text-slate-900">St. Joseph’s College (Autonomous), Tiruchirappalli</h2>
            <h3 class="text-base font-extrabold text-indigo-900 pt-1">
              COURSE PLAN – ACADEMIC YEAR 2026–2027 (Even Semester)
            </h3>
          </div>

          <div class="text-[11px] text-slate-600 italic border-l-2 border-slate-400 pl-3 py-1">
            <strong>Instructions:</strong> Dear ${plan.faculty_name || 'Professor'}, The course plan shall be prepared for all the theory courses before the commencement of the course and submitted to the Head of the Department for review and approval.
          </div>

          <!-- Part I -->
          <div class="space-y-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded">Part-I: Course Information</h4>
            <div class="text-xs space-y-1.5 pl-2">
              <div class="font-bold text-slate-700">A. General Details</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div><span class="font-bold text-slate-600">Name of the Faculty Member:</span> ${plan.faculty_name || '—'}</div>
                <div><span class="font-bold text-slate-600">Department:</span> ${plan.department_name || '—'}</div>
                <div><span class="font-bold text-slate-600">Programme:</span> ${plan.programme || '—'}</div>
                <div><span class="font-bold text-slate-600">Year and Class:</span> ${plan.year_class || '—'}</div>
                <div><span class="font-bold text-slate-600">Section:</span> ${plan.section || 'N/A'}</div>
                <div><span class="font-bold text-slate-600">Semester:</span> ${plan.semester || 'II'}</div>
                <div><span class="font-bold text-slate-600">Course Code:</span> <strong>${plan.course_code || '—'}</strong></div>
                <div class="col-span-2"><span class="font-bold text-slate-600">Course Title:</span> <strong>${plan.course_title || '—'}</strong></div>
                <div><span class="font-bold text-slate-600">Course Category:</span> ${plan.course_category || 'Core'}</div>
                <div><span class="font-bold text-slate-600">Total Teaching Hours & Hours/Week:</span> ${plan.teaching_hours || '—'}</div>
                <div><span class="font-bold text-slate-600">Course Credits:</span> ${plan.credits || '—'}</div>
              </div>
            </div>

            <!-- CO Table -->
            <div class="pt-2 pl-2 space-y-1.5">
              <div class="font-bold text-xs text-slate-700">B. Course Outcomes (COs)</div>
              <table class="w-full text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 font-bold">
                  <tr>
                    <th class="border border-slate-300 p-2 w-20 text-center">CO Code</th>
                    <th class="border border-slate-300 p-2">Course Outcome</th>
                    <th class="border border-slate-300 p-2 w-32 text-center">K-Levels</th>
                  </tr>
                </thead>
                <tbody>
                  ${cos.map(co => `
                    <tr>
                      <td class="border border-slate-300 p-2 text-center font-bold font-mono">${co.code}</td>
                      <td class="border border-slate-300 p-2">${co.outcome || '—'}</td>
                      <td class="border border-slate-300 p-2 text-center font-semibold">${co.k_level || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Part II -->
          <div class="space-y-3 pt-4">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded">Part-II: Unit-wise Teaching Plan</h4>
            <div class="text-xs pl-2 space-y-1.5">
              <div class="font-bold text-slate-700">A. Detailed Teaching Plan</div>
              <table class="w-full text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 font-bold text-[11px]">
                  <tr>
                    <th class="border border-slate-300 p-1.5">Month/Days</th>
                    <th class="border border-slate-300 p-1.5">Unit</th>
                    <th class="border border-slate-300 p-1.5">From (Topic)</th>
                    <th class="border border-slate-300 p-1.5">To (Topic)</th>
                    <th class="border border-slate-300 p-1.5 text-center">Hours</th>
                    <th class="border border-slate-300 p-1.5">Methodology</th>
                    <th class="border border-slate-300 p-1.5">Resources</th>
                  </tr>
                </thead>
                <tbody>
                  ${dtp.map((row, idx) => {
                    const isFirstInMonth = (idx === 0 || row.month_days !== dtp[idx - 1].month_days);
                    let span = 1;
                    if (isFirstInMonth) {
                      for (let j = idx + 1; j < dtp.length; j++) {
                        if (dtp[j].month_days === row.month_days) span++;
                        else break;
                      }
                    }
                    return `
                      <tr>
                        ${isFirstInMonth ? `
                          <td rowspan="${span}" class="border border-slate-300 p-1.5 font-bold text-center align-middle whitespace-nowrap bg-slate-50">
                            ${row.month_days || '—'}
                          </td>
                        ` : ''}
                        <td class="border border-slate-300 p-1.5">${row.unit || '—'}</td>
                        <td class="border border-slate-300 p-1.5">${row.from_topic || row.topics || '—'}</td>
                        <td class="border border-slate-300 p-1.5">${row.to_topic || '—'}</td>
                        <td class="border border-slate-300 p-1.5 text-center font-bold">${row.hours || '—'}</td>
                        <td class="border border-slate-300 p-1.5">${row.methodology || '—'}</td>
                        <td class="border border-slate-300 p-1.5">${row.resources || '—'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="text-xs pl-2 pt-2 space-y-1.5">
              <div class="font-bold text-slate-700">B. Unit Completion Plan</div>
              <table class="w-full text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 font-bold">
                  <tr>
                    <th class="border border-slate-300 p-2">Unit</th>
                    <th class="border border-slate-300 p-2 text-center">Planned Hours</th>
                    <th class="border border-slate-300 p-2 text-center">Actual Hours (As per Syllabus)</th>
                    <th class="border border-slate-300 p-2">Expected Completion Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${ucp.map(u => `
                    <tr>
                      <td class="border border-slate-300 p-2 font-bold">${u.unit}</td>
                      <td class="border border-slate-300 p-2 text-center font-bold">${u.planned_hours || '—'}</td>
                      <td class="border border-slate-300 p-2 text-center font-bold">${u.actual_hours || '—'}</td>
                      <td class="border border-slate-300 p-2">${u.target_date || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Part III -->
          <div class="space-y-3 pt-4">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded">Part-III: Learning Activities and Assessment Plan</h4>
            <div class="text-xs pl-2 space-y-1.5">
              <div class="font-bold text-slate-700">A. Learning Activities</div>
              <table class="w-full text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 font-bold text-[11px]">
                  <tr>
                    <th class="border border-slate-300 p-1.5 w-10 text-center">S.No</th>
                    <th class="border border-slate-300 p-1.5">Activity</th>
                    <th class="border border-slate-300 p-1.5">Topic</th>
                    <th class="border border-slate-300 p-1.5">Outcome</th>
                    <th class="border border-slate-300 p-1.5 text-center">Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${(plan.learning_activities || []).map((act, i) => `
                    <tr>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${i + 1}</td>
                      <td class="border border-slate-300 p-1.5 font-bold">${this.escapeHtml(act.activity || '—')}</td>
                      <td class="border border-slate-300 p-1.5">${this.escapeHtml(act.topic || '—')}</td>
                      <td class="border border-slate-300 p-1.5">${this.escapeHtml(act.outcome || '—')}</td>
                      <td class="border border-slate-300 p-1.5 text-center font-mono">${this.formatDateToDDMMYYYY(act.proposed_date) || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="text-xs pl-2 pt-2 space-y-1.5">
              <div class="font-bold text-slate-700">B. Assessment Plan (CIA)</div>
              <table class="w-full text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 font-bold text-[11px]">
                  <tr>
                    <th class="border border-slate-300 p-1.5 w-10 text-center">S.No</th>
                    <th class="border border-slate-300 p-1.5">CIA Component</th>
                    <th class="border border-slate-300 p-1.5 text-center">Marks</th>
                    <th class="border border-slate-300 p-1.5">Assessment Category / Activity</th>
                    <th class="border border-slate-300 p-1.5">Unit Coverage</th>
                    <th class="border border-slate-300 p-1.5 text-center">Date</th>
                    <th class="border border-slate-300 p-1.5">Expected Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.getFullAssessmentPlan(plan).map((asst, i) => `
                    <tr>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${i + 1}</td>
                      <td class="border border-slate-300 p-1.5 font-bold">${this.escapeHtml(asst.component || '—')}</td>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${this.escapeHtml(asst.marks || '—')}</td>
                      <td class="border border-slate-300 p-1.5 font-bold">${this.escapeHtml(asst.category || '—')}</td>
                      <td class="border border-slate-300 p-1.5">${this.escapeHtml(asst.unit_coverage || '—')}</td>
                      <td class="border border-slate-300 p-1.5 text-center font-mono">${this.escapeHtml(asst.date || '—')}</td>
                      <td class="border border-slate-300 p-1.5">${this.escapeHtml(asst.outcome || '—')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="font-bold text-slate-700">C. Digital Resources and ICT Integration</div>
              <table class="w-full text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 font-bold">
                  <tr>
                    <th class="border border-slate-300 p-1.5 w-10 text-center">S.No</th>
                    <th class="border border-slate-300 p-1.5">Topic / Unit</th>
                    <th class="border border-slate-300 p-1.5">Digital Resource / ICT Tool</th>
                    <th class="border border-slate-300 p-1.5">Platform</th>
                    <th class="border border-slate-300 p-1.5">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  ${icts.map((ict, i) => `
                    <tr>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${i + 1}</td>
                      <td class="border border-slate-300 p-1.5">${ict.topic || '—'}</td>
                      <td class="border border-slate-300 p-1.5 font-bold">${ict.tool}</td>
                      <td class="border border-slate-300 p-1.5">${ict.platform}</td>
                      <td class="border border-slate-300 p-1.5">${ict.purpose}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Signatures Footer -->
          <div class="pt-8 border-t-2 border-slate-800 space-y-8 text-xs">
            <div class="italic text-[11px] text-slate-700">
              "I hereby confirm that the course plan has been prepared based on the approved syllabus, prescribed teaching hours, academic calendar, and institutional assessment regulations."
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div class="space-y-6">
                <div>Faculty Signature: <strong>${decl.faculty_signature || plan.faculty_name || '____________________'}</strong></div>
                <div>Date: <strong>${decl.submission_date || '____________________'}</strong></div>
              </div>

              <div class="space-y-6">
                <div>Reviewed by: <strong>${decl.reviewer_name || plan.hod_name || '____________________'}</strong></div>
                <div>Status: <strong>${plan.hod_status === 'Approved' ? 'VERIFIED & APPROVED' : 'PENDING'}</strong></div>
              </div>

              <div class="space-y-6">
                <div>Head of Department: <strong>${plan.hod_name || '____________________'}</strong></div>
                <div>Approval Date: <strong>${plan.approved_at || '____________________'}</strong></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // ================= STAGE PROGRESSION & COMPREHENSIVE VALIDATION =================
  clearValidationHighlights() {
    document.querySelectorAll('.is-invalid-field').forEach(el => {
      el.classList.remove('is-invalid-field', 'border-rose-500', 'ring-2', 'ring-rose-200', 'bg-rose-50/40');
    });
    const banner = document.getElementById('cp-validation-banner');
    if (banner) banner.remove();
  }

  highlightElement(el) {
    if (!el) return;
    el.classList.add('is-invalid-field', 'border-rose-500', 'ring-2', 'ring-rose-200', 'bg-rose-50/40');
    const clearFn = () => {
      el.classList.remove('is-invalid-field', 'border-rose-500', 'ring-2', 'ring-rose-200', 'bg-rose-50/40');
      el.removeEventListener('input', clearFn);
      el.removeEventListener('change', clearFn);
    };
    el.addEventListener('input', clearFn, { once: true });
    el.addEventListener('change', clearFn, { once: true });
  }

  showValidationFeedback(sectionId, errors, invalidEls) {
    this.clearValidationHighlights();
    (invalidEls || []).forEach(el => this.highlightElement(el));

    if (invalidEls && invalidEls.length > 0) {
      const first = invalidEls[0];
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        try { first.focus(); } catch (e) {}
      }, 300);
    }

    const container = document.getElementById(`section-${this.activeFormTab}`) || document.getElementById(sectionId);
    if (container) {
      let banner = document.getElementById('cp-validation-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'cp-validation-banner';
        container.prepend(banner);
      }
      banner.className = 'p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl mb-4 text-rose-900 shadow-md animate-fadeIn flex items-start gap-3';
      banner.innerHTML = `
        <div class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <i data-lucide="alert-octagon" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 text-xs">
          <div class="font-black text-rose-950 text-sm">Please complete the highlighted mandatory fields:</div>
          <ul class="list-disc list-inside mt-1.5 space-y-0.5 font-bold text-rose-800">
            ${errors.slice(0, 8).map(err => `<li>${err}</li>`).join('')}
            ${errors.length > 8 ? `<li>...and ${errors.length - 8} more field(s) highlighted in red</li>` : ''}
          </ul>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="text-rose-400 hover:text-rose-700 font-bold text-base px-1">✕</button>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  validatePart1(harvest = false) {
    if (harvest) this.harvestFormInputs();
    const p = this.activePlan || {};
    const errors = [];
    const invalidEls = [];

    const check = (val, id, name) => {
      if (!val || !String(val).trim()) {
        errors.push(name);
        const el = document.getElementById(id);
        if (el) invalidEls.push(el);
      }
    };

    check(p.department_name, 'cp-dept-name', 'Department');
    check(p.faculty_name, 'cp-faculty-name', 'Name of the Faculty Member');
    check(p.semester, 'cp-semester', 'Semester');
    check(p.programme, 'cp-programme', 'Programme');
    check(p.year_class, 'cp-year-class', 'Year & Class');
    check(p.section, 'cp-section', 'Section');
    check(p.course_code, 'cp-course-code', 'Course Code');
    check(p.course_title, 'cp-course-title', 'Course Title');
    check(p.course_category, 'cp-course-category', 'Course Category');
    check(p.teaching_hours, 'cp-teaching-hours', 'Total Teaching Hours');
    check(p.credits, 'cp-credits', 'Credits');

    const coRows = document.querySelectorAll('#cp-cos-tbody tr');
    let emptyCOs = 0;
    coRows.forEach((row, i) => {
      if (i < 5) {
        const outEl = row.querySelector('.co-outcome');
        const kEl = row.querySelector('.co-klevel');
        let rowEmpty = false;
        if (!outEl || !outEl.value.trim()) {
          if (outEl) invalidEls.push(outEl);
          rowEmpty = true;
        }
        if (!kEl || !kEl.value.trim()) {
          if (kEl) invalidEls.push(kEl);
          rowEmpty = true;
        }
        if (rowEmpty) emptyCOs++;
      }
    });
    if (emptyCOs > 0) {
      errors.push(`Course Outcomes (${emptyCOs} outcome statement(s) or K-level(s) incomplete)`);
    }

    return { valid: errors.length === 0, errors, invalidEls };
  }

  isPart1Complete() {
    return this.validatePart1(false).valid;
  }

  validatePart2(harvest = false) {
    if (harvest) this.harvestFormInputs();
    const p = this.activePlan || {};
    const errors = [];
    const invalidEls = [];

    // Ensure Part 1 is complete
    const p1 = this.validatePart1(false);
    if (!p1.valid) {
      return { valid: false, errors: ['Please complete all mandatory questions in Part-I first.'], invalidEls: p1.invalidEls };
    }

    // A. Detailed Teaching Plan
    const dtpRows = document.querySelectorAll('#cp-dtp-tbody tr');
    if (dtpRows.length === 0) {
      errors.push('Detailed Teaching Plan entries');
    } else {
      let emptyFromTopic = 0, emptyToTopic = 0, emptyHours = 0, emptyMethods = 0, emptyRes = 0;
      dtpRows.forEach((row) => {
        const fromEl = row.querySelector('.dtp-from-topic');
        const toEl = row.querySelector('.dtp-to-topic');
        const hrEl = row.querySelector('.dtp-hours');
        const methVal = row.querySelector('.dtp-method-value');
        const resEl = row.querySelector('.dtp-res-select');
        const resOther = row.querySelector('.dtp-res-other');

        if (!fromEl || !fromEl.value.trim()) { emptyFromTopic++; if (fromEl) invalidEls.push(fromEl); }
        if (!toEl || !toEl.value.trim()) { emptyToTopic++; if (toEl) invalidEls.push(toEl); }
        if (!hrEl || !hrEl.value.trim()) { emptyHours++; if (hrEl) invalidEls.push(hrEl); }

        if (!methVal || !methVal.value.trim()) {
          emptyMethods++;
          const box = row.querySelector('.dtp-method-container');
          if (box) invalidEls.push(box);
        }

        const resVal = row.querySelector('.dtp-res-value');
        if (resVal) {
          if (!resVal.value.trim()) {
            emptyRes++;
            const box = row.querySelector('.dtp-res-container');
            if (box) invalidEls.push(box);
          }
        } else if (resEl && resEl.value === 'Others' && (!resOther || !resOther.value.trim())) {
          emptyRes++; if (resOther) invalidEls.push(resOther);
        } else if (!resEl || !resEl.value.trim()) {
          emptyRes++; if (resEl) invalidEls.push(resEl);
        }
      });

      if (emptyFromTopic > 0) errors.push(`Detailed Teaching Plan: 'From (Topic)' missing in ${emptyFromTopic} row(s)`);
      if (emptyToTopic > 0) errors.push(`Detailed Teaching Plan: 'To (Topic)' missing in ${emptyToTopic} row(s)`);
      if (emptyHours > 0) errors.push(`Detailed Teaching Plan: Lecture Hour(s) missing in ${emptyHours} row(s)`);
      if (emptyMethods > 0) errors.push(`Detailed Teaching Plan: Teaching Methodology missing in ${emptyMethods} row(s)`);
      if (emptyRes > 0) errors.push(`Detailed Teaching Plan: Learning Resource missing in ${emptyRes} row(s)`);
    }

    // B. Unit Completion Plan
    const ucpRows = document.querySelectorAll('#cp-ucp-tbody tr:not(:last-child)');
    let emptyUcpPlanned = 0, emptyUcpActual = 0, emptyUcpDate = 0;
    ucpRows.forEach((row) => {
      const plEl = row.querySelector('.ucp-planned');
      const acEl = row.querySelector('.ucp-actual');
      const dtEl = row.querySelector('.ucp-date');
      if (!plEl || !plEl.value.trim()) { emptyUcpPlanned++; if (plEl) invalidEls.push(plEl); }
      if (!acEl || !acEl.value.trim()) { emptyUcpActual++; if (acEl) invalidEls.push(acEl); }
      if (!dtEl || !dtEl.value.trim()) { emptyUcpDate++; if (dtEl) invalidEls.push(dtEl); }
    });

    if (emptyUcpPlanned > 0) errors.push(`Unit Completion Plan: Planned Hours missing in ${emptyUcpPlanned} unit(s)`);
    if (emptyUcpActual > 0) errors.push(`Unit Completion Plan: Actual Hours missing in ${emptyUcpActual} unit(s)`);
    if (emptyUcpDate > 0) errors.push(`Unit Completion Plan: Target Date missing in ${emptyUcpDate} unit(s)`);

    return { valid: errors.length === 0, errors, invalidEls };
  }

  isPart2Complete() {
    return this.validatePart2(false).valid;
  }

  validatePart3(harvest = false) {
    if (harvest) this.harvestFormInputs();
    const p = this.activePlan || {};
    const errors = [];
    const invalidEls = [];

    // Ensure Part 2 is complete
    const p2 = this.validatePart2(false);
    if (!p2.valid) {
      return { valid: false, errors: ['Please complete all mandatory questions in Part-II first.'], invalidEls: p2.invalidEls };
    }

    // A. Learning Activities
    const acts = this.activePlan.learning_activities || [];
    if (acts.length === 0) {
      errors.push('Learning Activities: At least one learning activity must be added in Section A');
    } else {
      let emptyTopic = 0, emptyOutcome = 0, emptyDate = 0;
      acts.forEach(a => {
        if (!a.topic || !a.topic.trim()) emptyTopic++;
        if (!a.outcome || !a.outcome.trim()) emptyOutcome++;
        if (!a.proposed_date || !a.proposed_date.trim()) emptyDate++;
      });
      if (emptyTopic > 0) errors.push(`Learning Activities: Topic/Unit missing in ${emptyTopic} activity entry(ies)`);
      if (emptyOutcome > 0) errors.push(`Learning Activities: Expected Outcome missing in ${emptyOutcome} activity entry(ies)`);
      if (emptyDate > 0) errors.push(`Learning Activities: Proposed Date missing in ${emptyDate} activity entry(ies)`);
    }

    // B. Assessment Plan (Total marks must be 100 and both CIA 2 and Library Referencing entered)
    const assts = (this.activePlan.learning_activities || []).filter(a => a.is_assessment);
    const fullPlan = this.getFullAssessmentPlan(this.activePlan);
    const totalMarks = fullPlan.reduce((sum, a) => sum + (parseFloat(a.marks) || 0), 0);
    const hasC2 = assts.some(a => a.cia_component && a.cia_component.includes('C2'));
    const hasLib = assts.some(a => a.cia_component && (a.cia_component.includes('Library') || a.cia_component.includes('Lib')));

    if (assts.length === 0) {
      errors.push('Assessment Plan: Please convert learning activities into assessment components (both CIA 2 and Library Referencing are mandatory)');
    } else {
      if (totalMarks !== 100) {
        errors.push(`Assessment Plan: Total assessment marks must equal exactly 100 Marks (Currently: ${totalMarks} Marks). Please ensure both CIA 2 and Library Referencing are entered.`);
      }
      if (!hasC2 || !hasLib) {
        const missing = [];
        if (!hasC2) missing.push('CIA 2 (C2)');
        if (!hasLib) missing.push('Library Referencing');
        errors.push(`Assessment Plan: Both CIA 2 and Library Referencing are mandatory to proceed (Missing: ${missing.join(' & ')}).`);
      }
    }

    // C. Digital Resources and ICT Integration (Min 1 row is mandatory)
    const ictRows = document.querySelectorAll('#cp-icts-tbody tr');
    let completedIctRows = 0;
    let incompleteRowErrors = [];

    ictRows.forEach((row, idx) => {
      const topEl = row.querySelector('.ict-topic');
      const toolEl = row.querySelector('.ict-tool-select');
      const toolOtherEl = row.querySelector('.ict-tool-other');
      const platEl = row.querySelector('.ict-platform-select, .ict-plat-select');
      const platOtherEl = row.querySelector('.ict-platform-other');
      const purpEl = row.querySelector('.ict-purpose');

      const topVal = topEl ? topEl.value.trim() : '';
      const toolVal = (toolEl && toolEl.value === 'Others') ? (toolOtherEl ? toolOtherEl.value.trim() : '') : (toolEl ? toolEl.value.trim() : '');
      const platVal = (platEl && platEl.value === 'Others') ? (platOtherEl ? platOtherEl.value.trim() : '') : (platEl ? platEl.value.trim() : '');
      const purpVal = purpEl ? purpEl.value.trim() : '';

      const hasAny = topVal || toolVal || platVal || purpVal;
      const isComplete = topVal && toolVal && platVal && purpVal;

      if (isComplete) {
        completedIctRows++;
      } else if (hasAny) {
        const missing = [];
        if (!topVal) { missing.push('Topic/Unit'); if (topEl) invalidEls.push(topEl); }
        if (!toolVal) {
          missing.push('Tool');
          if (toolEl && toolEl.value === 'Others' && toolOtherEl) invalidEls.push(toolOtherEl);
          else if (toolEl) invalidEls.push(toolEl);
        }
        if (!platVal) {
          missing.push('Platform');
          if (platEl && platEl.value === 'Others' && platOtherEl) invalidEls.push(platOtherEl);
          else if (platEl) invalidEls.push(platEl);
        }
        if (!purpVal) { missing.push('Purpose'); if (purpEl) invalidEls.push(purpEl); }
        incompleteRowErrors.push(`Row ${idx + 1}: Missing ${missing.join(', ')}`);
      }
    });

    if (completedIctRows === 0 && incompleteRowErrors.length === 0) {
      errors.push('Digital Resources and ICT Integration: Minimum 1 row is mandatory. Please provide Topic/Unit, Tool, Platform, and Purpose.');
      const firstRow = ictRows[0];
      if (firstRow) {
        const t = firstRow.querySelector('.ict-topic');
        const tl = firstRow.querySelector('.ict-tool-select');
        const p = firstRow.querySelector('.ict-platform-select, .ict-plat-select');
        const pr = firstRow.querySelector('.ict-purpose');
        if (t && !t.value.trim()) invalidEls.push(t);
        if (tl && !tl.value.trim()) invalidEls.push(tl);
        if (p && !p.value.trim()) invalidEls.push(p);
        if (pr && !pr.value.trim()) invalidEls.push(pr);
      }
    }

    if (incompleteRowErrors.length > 0) {
      incompleteRowErrors.forEach(err => errors.push(`Digital Resources / ICT: ${err}`));
    }

    return { valid: errors.length === 0, errors, invalidEls };
  }

  isPart3Complete() {
    return this.validatePart3(false).valid;
  }

  validatePart4(harvest = false) {
    if (harvest) this.harvestFormInputs();
    const p = this.activePlan || {};
    const errors = [];
    const invalidEls = [];

    const p3 = this.validatePart3(false);
    if (!p3.valid) {
      return { valid: false, errors: ['Please complete all mandatory questions in Part-I, Part-II, and Part-III first.'], invalidEls: p3.invalidEls };
    }

    const decl = p.declaration || {};
    const declCheck = document.getElementById('cp-decl-check');
    const declBox = document.getElementById('cp-decl-box');
    if ((declCheck && !declCheck.checked) || !decl.confirmed) {
      errors.push('Declaration Confirmation Checkbox (must be checked)');
      if (declBox) invalidEls.push(declBox);
      else if (declCheck) invalidEls.push(declCheck);
    }

    const sigEl = document.getElementById('cp-decl-fac-sig');
    if (!decl.faculty_signature || !decl.faculty_signature.trim()) {
      errors.push('Faculty Digital Signature');
      if (sigEl) invalidEls.push(sigEl);
    }

    const dateEl = document.getElementById('cp-decl-fac-date');
    if (!decl.submission_date || !decl.submission_date.trim()) {
      errors.push('Submission Date');
      if (dateEl) invalidEls.push(dateEl);
    }

    return { valid: errors.length === 0, errors, invalidEls };
  }

  isPart4Complete() {
    return this.validatePart4(false).valid;
  }

  proceedToTab(targetTab) {
    this.harvestFormInputs();
    if (targetTab === 'part2') {
      const v = this.validatePart1();
      if (!v.valid) {
        this.showValidationFeedback('section-part1', v.errors, v.invalidEls);
        return;
      }
    } else if (targetTab === 'part3') {
      const v = this.validatePart2();
      if (!v.valid) {
        this.showValidationFeedback('section-part2', v.errors, v.invalidEls);
        return;
      }
    } else if (targetTab === 'declaration') {
      const v = this.validatePart3();
      if (!v.valid) {
        this.showValidationFeedback('section-part3', v.errors, v.invalidEls);
        return;
      }
    }
    this.clearValidationHighlights();
    this.switchFormTab(targetTab);
  }

  // ================= TAB SWITCHING =================
  switchFormTab(tabKey) {
    this.harvestFormInputs();

    // Prevent jumping forward if previous sections are not completely filled
    if (tabKey === 'part2') {
      const v = this.validatePart1();
      if (!v.valid) {
        this.showValidationFeedback('section-part1', v.errors, v.invalidEls);
        return;
      }
    } else if (tabKey === 'part3') {
      const v = this.validatePart2();
      if (!v.valid) {
        this.showValidationFeedback('section-part2', v.errors, v.invalidEls);
        return;
      }
    } else if (tabKey === 'declaration') {
      const v = this.validatePart3();
      if (!v.valid) {
        this.showValidationFeedback('section-part3', v.errors, v.invalidEls);
        return;
      }
    }

    this.clearValidationHighlights();
    this.activeFormTab = tabKey;
    ['part1', 'part2', 'part3', 'declaration'].forEach(k => {
      const el = document.getElementById(`section-${k}`);
      if (el) {
        if (k === tabKey) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });
    this.render();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  // ================= DATA LOGIC & ACTIONS =================
  createNewPlan() {
    this.navigateTo('/course-plan/new');
  }

  async editPlan(id) {
    this.navigateTo(`/course-plan/edit?id=${id}`);
  }

  async previewPlan(id) {
    this.navigateTo(`/course-plan/view?id=${id}`);
  }

  previewCurrentPlan() {
    this.harvestFormInputs();
    if (this.activeFormTab !== 'declaration') {
      alert('🔒 Print Preview is enabled after reaching Part-IV (Declaration & HOD Approval). Please complete each section and proceed to Part-IV.');
      return;
    }
    const v = this.validatePart4();
    if (!v.valid) {
      this.showValidationFeedback('section-declaration', v.errors, v.invalidEls);
      return;
    }
    this.viewMode = 'print';
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToDashboard() {
    if (!this.currentUser) {
      this.navigateTo('/course-plan/login');
      return;
    }
    if (this.currentUser.role === 'hod') {
      this.navigateTo('/course-plan/hod');
    } else if (this.currentUser.role === 'admin') {
      this.navigateTo('/course-plan/admin');
    } else {
      this.navigateTo('/course-plan/dashboard');
    }
  }

  switchDepartment(deptName) {
    this.selectedDept = deptName;
    localStorage.setItem('CP_SELECTED_DEPT', deptName);
    this.fetchPlans().then(() => this.render());
  }

  onFormDeptChange(newDept) {
    this.harvestFormInputs();
    this.activePlan.department_name = newDept;
    this.selectedDept = newDept;
    localStorage.setItem('CP_SELECTED_DEPT', newDept);
    // Reset faculty selection so user selects from the new department
    this.activePlan.faculty_name = '';
    this.activePlan.faculty_email = '';
    this.render();
  }

  onFormFacultyChange(facName) {
    if (!this.activePlan) this.activePlan = this.createDefaultPlan();
    this.activePlan.faculty_name = facName;
    if (!this.activePlan.declaration) this.activePlan.declaration = {};
    this.activePlan.declaration.faculty_signature = facName;

    const deptObj = this.getCurrentDepartmentObj();
    const facObj = (deptObj.faculty || []).find(f => f.name === facName);
    const hint = document.getElementById('cp-faculty-email-hint');
    if (hint && facObj) {
      hint.textContent = facObj.email ? `Email: ${facObj.email} | Shift: ${facObj.shift}` : '';
      if (facObj.email) this.activePlan.faculty_email = facObj.email;
    } else if (hint) {
      hint.textContent = '';
    }
    const declSig = document.getElementById('cp-decl-fac-sig');
    if (declSig) declSig.value = facName;

    this.updateFacultyWelcomeBanner(facName);
  }

  updateFacultyWelcomeBanner(facName) {
    const box = document.getElementById('cp-banner-instructions-box');
    if (box) box.remove();
    const welcomeEl = document.getElementById('cp-banner-welcome');
    if (welcomeEl) welcomeEl.remove();
    const instEl = document.getElementById('cp-banner-instructions');
    if (instEl) instEl.remove();
  }

  onAdminStatusFilterChange(status) {
    this.adminFilter = status;
    this.fetchPlans().then(() => this.render());
  }

  onAdminDeptFilterChange(dept) {
    this.adminDeptFilter = dept;
    this.fetchPlans().then(() => this.render());
  }

  createDefaultPlan() {
    const isFaculty = this.currentUser && this.currentUser.role === 'faculty';
    const curDept = isFaculty ? this.currentUser.department_name : this.selectedDept;
    const progs = this.getDepartmentProgrammes(curDept);
    const defaultProg = (progs && progs.length > 0) ? progs[0] : '';
    const defaultYc = (defaultProg.startsWith('M.') || defaultProg.includes('MCA') || defaultProg.includes('Master')) ? 'I PG' : 'I UG';
    const p = {
      id: null,
      department_name: curDept,
      faculty_name: isFaculty ? this.currentUser.faculty_name : '',
      faculty_email: isFaculty ? (this.currentUser.faculty_email || '') : '',
      programme: defaultProg,
      year_class: defaultYc,
      section: 'N/A',
      semester: 'II',
      academic_year: '2026 - 2027',
      course_code: '',
      course_title: '',
      course_category: 'Core',
      teaching_hours: '',
      credits: '',
      course_outcomes: [
        { code: 'CO1', outcome: '', k_level: 'K1' },
        { code: 'CO2', outcome: '', k_level: 'K2' },
        { code: 'CO3', outcome: '', k_level: 'K3' },
        { code: 'CO4', outcome: '', k_level: 'K4' },
        { code: 'CO5', outcome: '', k_level: 'K5' },
        { code: 'CO6', outcome: '', k_level: 'K6' }
      ],
      detailed_teaching_plan: [
        { month_days: 'November / 10', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'November / 10', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'December / 19', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'December / 19', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'January / 13', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'January / 13', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'February / 22', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'February / 22', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'March / 12', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' },
        { month_days: 'March / 12', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: '' }
      ],
      unit_completion_plan: [
        { unit: 'Unit I', planned_hours: '', actual_hours: '', target_date: '' },
        { unit: 'Unit II', planned_hours: '', actual_hours: '', target_date: '' },
        { unit: 'Unit III', planned_hours: '', actual_hours: '', target_date: '' },
        { unit: 'Unit IV', planned_hours: '', actual_hours: '', target_date: '' },
        { unit: 'Unit V', planned_hours: '', actual_hours: '', target_date: '' }
      ],
      learning_activities: [],
      assessment_plan: [],
      ict_integration: [
        { sno: '1', topic: '', tool: '', platform: 'JosTEL', purpose: '' }
      ],
      declaration: {
        confirmed: false,
        faculty_signature: '',
        submission_date: new Date().toISOString().split('T')[0],
        reviewer_name: '',
        review_date: '',
        hod_name: '',
        approval_date: ''
      },
      status: 'Draft',
      hod_status: 'Draft'
    };
    p.assessment_plan = this.getFullAssessmentPlan(p);
    return p;
  }

  calculateTotalHours() {
    const plannedInputs = document.querySelectorAll('.ucp-planned');
    const actualInputs = document.querySelectorAll('.ucp-actual');
    let totalP = 0;
    let totalA = 0;
    plannedInputs.forEach(inp => { totalP += parseFloat(inp.value) || 0; });
    actualInputs.forEach(inp => { totalA += parseFloat(inp.value) || 0; });

    const elP = document.getElementById('ucp-total-planned');
    const elA = document.getElementById('ucp-total-actual');
    if (elP) elP.textContent = `${totalP} Hrs`;
    if (elA) elA.textContent = `${totalA} Hrs`;
  }

  // Row additions
  addCORow() {
    this.harvestFormInputs();
    const count = (this.activePlan.course_outcomes || []).length + 1;
    this.activePlan.course_outcomes.push({ code: `CO${count}`, outcome: '', k_level: 'K' + (count <= 6 ? count : 1) });
    this.render();
  }

  deleteCORow(idx) {
    this.harvestFormInputs();
    this.activePlan.course_outcomes.splice(idx, 1);
    this.render();
  }

  toggleTeachingPlanTable() {
    this.isTeachingPlanCollapsed = !this.isTeachingPlanCollapsed;
    this.render();
  }

  addTeachingPlanRow() {
    this.harvestFormInputs();
    if (!this.activePlan.detailed_teaching_plan) this.activePlan.detailed_teaching_plan = [];
    this.activePlan.detailed_teaching_plan.push({
      month_days: 'November / 10', unit: '', from_topic: '', to_topic: '', hours: '', methodology: '', resources: ''
    });
    this.render();
  }

  addTeachingPlanRowForMonth(monthDays, afterIndex) {
    this.harvestFormInputs();
    if (!this.activePlan.detailed_teaching_plan) this.activePlan.detailed_teaching_plan = [];

    const newRow = {
      month_days: monthDays || '',
      unit: '',
      from_topic: '',
      to_topic: '',
      hours: '',
      methodology: '',
      resources: ''
    };

    if (afterIndex !== undefined && afterIndex !== null && afterIndex >= 0 && afterIndex < this.activePlan.detailed_teaching_plan.length) {
      this.activePlan.detailed_teaching_plan.splice(afterIndex + 1, 0, newRow);
    } else {
      this.activePlan.detailed_teaching_plan.push(newRow);
    }
    this.render();
  }

  deleteTeachingPlanRow(idx) {
    this.harvestFormInputs();
    this.activePlan.detailed_teaching_plan.splice(idx, 1);
    this.render();
  }


  openActivityModal(actIndex = null) {
    const isEdit = (actIndex !== null && actIndex !== undefined && actIndex >= 0);
    const existing = isEdit ? (this.activePlan.learning_activities[actIndex] || {}) : null;

    let modal = document.getElementById('activity-entry-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'activity-entry-modal';
      document.body.appendChild(modal);
    }

    const isPG = this.activePlan?.is_pg || (this.activePlan?.year_class && this.activePlan.year_class.includes('PG')) || (this.activePlan?.programme && this.activePlan.programme.startsWith('M.'));

    // Prepopulate selected activities
    let selectedActs = [];
    let customOtherText = '';
    if (existing && existing.activity) {
      selectedActs = existing.activity.split(',').map(s => s.trim()).filter(Boolean);
      const otherItem = selectedActs.find(s => s.startsWith('Other:') || (!CoursePlanApp.LEARNING_ACTIVITIES.includes(s) && s !== 'Other:'));
      if (otherItem) {
        customOtherText = otherItem.startsWith('Other:') ? otherItem.replace('Other:', '').trim() : otherItem;
      }
    }

    const isAssessment = existing ? !!existing.is_assessment : false;
    const curCiaComp = existing?.cia_component || (isPG ? 'C2 - K4 (6 Marks)' : 'C2 - K4 (10 Marks)');
    const curCiaMarks = existing?.cia_marks || (isPG ? '6' : '10');

    modal.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
        <div class="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-scaleIn space-y-4 max-h-[92vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                <i data-lucide="layers" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">${isEdit ? 'Edit Learning Activity' : 'Add Learning Activity'}</h3>
                <p class="text-[11px] text-slate-500">Part-III: Formative learning tasks & CIA assessment linkage</p>
              </div>
            </div>
            <button type="button" onclick="document.getElementById('activity-entry-modal').remove()" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 font-bold text-sm">✕</button>
          </div>

          <form onsubmit="event.preventDefault(); coursePlanApp.saveActivityFromModal(${isEdit ? actIndex : 'null'});" class="space-y-4 text-xs">
            
            <!-- Learning Activity Multi-Select Autocomplete -->
            <div class="space-y-1.5">
              <label class="block font-black text-slate-800">
                Learning Activity * <span class="font-normal text-slate-500">(Search & select one or more)</span>
              </label>

              <!-- Selected Activity Badges Container -->
              <div id="modal-act-badges" class="min-h-[38px] p-2 border border-slate-300 rounded-xl bg-slate-50/50 flex flex-wrap items-center gap-1.5">
                ${selectedActs.length === 0 ? `
                  <span class="text-slate-400 text-[11px] italic">No activities selected yet. Pick from list below.</span>
                ` : `
                  ${selectedActs.map(act => `
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-2xs">
                      <span>${this.escapeHtml(act)}</span>
                      <button type="button" onclick="coursePlanApp.removeModalActivityItem('${this.escapeHtml(act)}')" class="text-indigo-400 hover:text-indigo-800 font-black ml-0.5">✕</button>
                    </span>
                  `).join('')}
                `}
              </div>

              <!-- Search Autocomplete Filter Input -->
              <div class="relative">
                <input 
                  type="text" 
                  id="modal-act-search" 
                  placeholder="" 
                  oninput="coursePlanApp.filterModalActivityList(this.value)" 
                  class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-none bg-white font-medium"
                />
              </div>

              <!-- Scrollable Options List -->
              <div id="modal-act-options-list" class="max-h-44 overflow-y-auto border border-slate-200 rounded-xl p-1.5 space-y-0.5 divide-y divide-slate-100 bg-white">
                ${CoursePlanApp.LEARNING_ACTIVITIES.map(opt => {
                  const isChecked = opt === 'Other:' ? selectedActs.some(s => s === 'Other:' || s.startsWith('Other:')) : selectedActs.includes(opt);
                  return `
                    <label class="modal-act-opt-item flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-indigo-50/70 rounded-lg cursor-pointer text-xs font-semibold text-slate-800">
                      <input 
                        type="checkbox" 
                        class="modal-act-checkbox rounded text-indigo-600 focus:ring-0 cursor-pointer" 
                        value="${opt}" 
                        ${isChecked ? 'checked' : ''} 
                        onchange="coursePlanApp.toggleModalActivityCheckbox('${opt}', this.checked)"
                      />
                      <span class="act-name-label">${opt}</span>
                    </label>
                  `;
                }).join('')}
              </div>

              <!-- Custom Other Input -->
              <div id="modal-act-other-container" class="${selectedActs.some(s => s === 'Other:' || s.startsWith('Other:')) ? '' : 'hidden'} pt-1">
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Specify Custom Activity *</label>
                <input 
                  type="text" 
                  id="modal-act-other-input" 
                  placeholder="e.g. Design Sprint / Interactive Simulation" 
                  value="${this.escapeHtml(customOtherText)}" 
                  oninput="coursePlanApp.onModalOtherActivityInput(this.value)" 
                  class="w-full text-xs px-3 py-2 border border-indigo-400 bg-indigo-50/30 rounded-xl font-bold focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <!-- Unit / Topic -->
            <div>
              <label class="block font-black text-slate-800 mb-1">Related Unit / Topic *</label>
              <input 
                type="text" 
                id="modal-act-topic" 
                value="${this.escapeHtml(existing?.topic || '')}" 
                placeholder="e.g. Unit II - Dynamic Programming & Trees" 
                class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-medium focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <!-- Expected Learning Outcome -->
            <div>
              <label class="block font-black text-slate-800 mb-1">Expected Learning Outcome *</label>
              <textarea 
                id="modal-act-outcome" 
                rows="2" 
                placeholder="e.g. Ability to analyze problem constraints, develop recursive logic, and formulate state transitions (CO3, K4)" 
                class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl leading-relaxed font-medium focus:border-indigo-600 focus:outline-none"
              >${this.escapeHtml(existing?.outcome || '')}</textarea>
            </div>

            <!-- Proposed Date (From - To) -->
            <div>
              <label class="block font-black text-slate-800 mb-1">Proposed Date (From – To) *</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span class="block text-[10.5px] font-bold text-slate-600 mb-1">From Date *</span>
                  <input 
                    type="date" 
                    id="modal-act-date-from" 
                    value="${existing?.proposed_date_from || (existing?.proposed_date ? existing.proposed_date.split(' to ')[0] : '') || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:border-indigo-600 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <span class="block text-[10.5px] font-bold text-slate-600 mb-1">To Date *</span>
                  <input 
                    type="date" 
                    id="modal-act-date-to" 
                    value="${existing?.proposed_date_to || (existing?.proposed_date ? (existing.proposed_date.includes(' to ') ? existing.proposed_date.split(' to ')[1] : existing.proposed_date) : '') || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:border-indigo-600 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            <!-- Convert it as assessment Toggle / Checkbox -->
            <div class="pt-2">
              <label class="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-amber-50/40 border-2 border-indigo-200 rounded-2xl cursor-pointer hover:border-indigo-400 transition shadow-2xs">
                <input 
                  type="checkbox" 
                  id="modal-act-is-assessment" 
                  ${isAssessment ? 'checked' : ''} 
                  onchange="coursePlanApp.toggleModalAssessmentSection(this.checked)" 
                  class="w-4 h-4 text-indigo-600 rounded focus:ring-0 cursor-pointer"
                />
                <div class="flex-1">
                  <div class="font-black text-indigo-950 text-xs flex items-center gap-1.5">
                    <i data-lucide="award" class="w-4 h-4 text-amber-600"></i>
                    <span>Convert it as assessment</span>
                  </div>
                  <div class="text-[10.5px] text-slate-500 font-medium">If ticked, automatically links to Part III-B Assessment Plan with CIA component & marks</div>
                </div>
              </label>
            </div>

            <!-- CIA Component and Marks Section (shown only when Convert it as assessment is ticked) -->
            <div id="modal-act-assessment-fields" class="${isAssessment ? '' : 'hidden'} p-4 bg-amber-50/80 border-2 border-amber-300 rounded-2xl space-y-3.5 animate-fadeIn">
              <div class="flex items-center justify-between border-b border-amber-200 pb-2">
                <span class="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5 text-amber-700"></i>
                  <span>CIA Assessment Details</span>
                </span>
                <span class="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-2 py-0.5 rounded-full">
                  ${isPG ? 'Postgraduate (PG) Scale' : 'Undergraduate (UG) Scale'}
                </span>
              </div>

              <div class="space-y-3">
                <!-- CIA Component Radio Buttons -->
                <div>
                  <label class="block font-black text-amber-950 mb-1.5">
                    Select CIA Assessment Component (Radio Button) *
                  </label>
                  <p class="text-[10.5px] text-amber-800 mb-2 font-medium">
                    Mentioning CIA Component – Corresponding K Level – Marks (Total Assessment Plan must equal 100 Marks):
                  </p>

                  <div class="space-y-2 bg-white/90 p-3 rounded-xl border border-amber-300">
                    ${(() => {
                      const options = [
                        { comp: 'C2 – K4', marks: '15', label: 'C2 – K4 – 15 Marks (Assignment / Technical Seminar)' },
                        { comp: 'C2 – K5', marks: '15', label: 'C2 – K5 – 15 Marks (Problem Solving / Case Analysis)' },
                        { comp: 'C2 – K4', marks: '10', label: 'C2 – K4 – 10 Marks (Assignment / Formative Test)' },
                        { comp: 'C2 – K5', marks: '5', label: 'C2 – K5 – 5 Marks (Mini Quiz / Review)' },
                        ...(isPG ? [
                          { comp: 'C2 – K6', marks: '15', label: 'C2 – K6 – 15 Marks (Creative Model / Mini Project)' },
                          { comp: 'C2 – K6', marks: '6', label: 'C2 – K6 – 6 Marks (Creative Application / Seminar)' }
                        ] : []),
                        { comp: 'Library Referencing – K3', marks: '10', label: 'Library Referencing – K3 – 10 Marks (JosTEL / Library Reference)' }
                      ];

                      const selectedComp = existing?.cia_component || 'C2 – K4';
                      const selectedMarks = String(existing?.cia_marks || (selectedComp.includes('Library') ? '10' : '15'));

                      return options.map((opt, i) => {
                        const isChecked = existing ? (
                          (opt.comp.includes('Library') && selectedComp.includes('Library')) ||
                          (!opt.comp.includes('Library') && !selectedComp.includes('Library') && opt.marks === selectedMarks && opt.comp.includes(selectedComp.replace(/[^K0-9]/g, '') || 'K4'))
                        ) : (i === 0);

                        return `
                          <label class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-amber-100/70 cursor-pointer border border-transparent has-checked:border-amber-400 has-checked:bg-amber-100/80 transition">
                            <input 
                              type="radio" 
                              name="modal_cia_comp_radio" 
                              value="${opt.comp}" 
                              data-marks="${opt.marks}" 
                              ${isChecked ? 'checked' : ''} 
                              onchange="coursePlanApp.onModalCiaRadioChange('${opt.comp}', '${opt.marks}')" 
                              class="text-amber-600 focus:ring-0 cursor-pointer"
                            />
                            <div class="flex items-center justify-between flex-1">
                              <span class="font-bold text-xs text-amber-950">${opt.label}</span>
                              <span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900">${opt.marks} M</span>
                            </div>
                          </label>
                        `;
                      }).join('');
                    })()}
                  </div>
                  <div class="text-[10px] text-amber-800/80 font-medium mt-1">C1 (15M), Mid Sem (30M) & End Sem (30M) are pre-filled institutional exams.</div>
                </div>

                <!-- Marks Input (Uneditable) -->
                <div>
                  <label class="block font-black text-amber-950 mb-1">Allocated Marks (Locked / Uneditable) *</label>
                  <input 
                    type="number" 
                    id="modal-act-cia-marks" 
                    value="${existing?.cia_marks || '15'}" 
                    readonly 
                    class="w-full text-xs px-3 py-2 border border-amber-300 rounded-xl bg-slate-100 cursor-not-allowed font-black text-slate-700 text-center focus:outline-none"
                    placeholder="Marks"
                  />
                  <input type="hidden" id="modal-act-cia-comp-hidden" value="${existing?.cia_component || 'C2 – K4'}" />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onclick="document.getElementById('activity-entry-modal').remove()" 
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95"
              >
                <i data-lucide="check" class="w-4 h-4"></i>
                <span>${isEdit ? 'Update Activity' : 'Save Activity'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  filterModalActivityList(query) {
    const q = (query || '').toLowerCase().trim();
    const items = document.querySelectorAll('#modal-act-options-list .modal-act-opt-item');
    items.forEach(el => {
      const txt = el.textContent.toLowerCase();
      if (!q || txt.includes(q)) {
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    });
  }

  toggleModalActivityCheckbox(option, isChecked) {
    let currentActs = this.getModalSelectedActivities();
    if (option === 'Other:') {
      const otherContainer = document.getElementById('modal-act-other-container');
      const otherInput = document.getElementById('modal-act-other-input');
      if (isChecked) {
        if (otherContainer) otherContainer.classList.remove('hidden');
        if (otherInput) otherInput.focus();
        if (!currentActs.some(s => s === 'Other:' || s.startsWith('Other:'))) {
          const val = otherInput?.value?.trim() || '';
          currentActs.push(val ? `Other: ${val}` : 'Other:');
        }
      } else {
        if (otherContainer) otherContainer.classList.add('hidden');
        currentActs = currentActs.filter(s => s !== 'Other:' && !s.startsWith('Other:'));
      }
    } else {
      if (isChecked) {
        if (!currentActs.includes(option)) currentActs.push(option);
      } else {
        currentActs = currentActs.filter(s => s !== option);
      }
    }

    this.renderModalActivityBadges(currentActs);
  }

  onModalOtherActivityInput(val) {
    let currentActs = this.getModalSelectedActivities();
    const trimmed = val.trim();
    const entry = trimmed ? `Other: ${trimmed}` : 'Other:';
    const idx = currentActs.findIndex(s => s === 'Other:' || s.startsWith('Other:'));
    if (idx >= 0) {
      currentActs[idx] = entry;
    } else {
      currentActs.push(entry);
    }
    this.renderModalActivityBadges(currentActs);
  }

  removeModalActivityItem(item) {
    let currentActs = this.getModalSelectedActivities();
    if (item === 'Other:' || item.startsWith('Other:')) {
      currentActs = currentActs.filter(s => s !== 'Other:' && !s.startsWith('Other:'));
      const chk = document.querySelector('#modal-act-options-list input[value="Other:"]');
      if (chk) chk.checked = false;
      const otherContainer = document.getElementById('modal-act-other-container');
      if (otherContainer) otherContainer.classList.add('hidden');
    } else {
      currentActs = currentActs.filter(s => s !== item);
      const chk = document.querySelector(`#modal-act-options-list input[value="${item}"]`);
      if (chk) chk.checked = false;
    }
    this.renderModalActivityBadges(currentActs);
  }

  getModalSelectedActivities() {
    const badges = document.querySelectorAll('#modal-act-badges [data-act-val]');
    const list = [];
    badges.forEach(b => {
      const v = b.getAttribute('data-act-val');
      if (v) list.push(v);
    });
    return list;
  }

  renderModalActivityBadges(list) {
    const container = document.getElementById('modal-act-badges');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<span class="text-slate-400 text-[11px] italic">No activities selected yet. Pick from list below.</span>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <span data-act-val="${this.escapeHtml(item)}" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-2xs">
        <span>${this.escapeHtml(item)}</span>
        <button type="button" onclick="coursePlanApp.removeModalActivityItem('${this.escapeHtml(item)}')" class="text-indigo-400 hover:text-indigo-800 font-black ml-0.5">✕</button>
      </span>
    `).join('');
  }

  toggleModalAssessmentSection(isChecked) {
    const section = document.getElementById('modal-act-assessment-fields');
    if (section) {
      if (isChecked) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    }
  }

  onModalCiaRadioChange(comp, marks) {
    const marksInput = document.getElementById('modal-act-cia-marks');
    if (marksInput) marksInput.value = marks;
    const compInput = document.getElementById('modal-act-cia-comp-hidden');
    if (compInput) compInput.value = comp;
  }

  onModalCiaCompChange(comp) {
    const marksInput = document.getElementById('modal-act-cia-marks');
    if (!marksInput) return;
    const isPG = this.activePlan?.is_pg || (this.activePlan?.year_class && this.activePlan.year_class.includes('PG')) || (this.activePlan?.programme && this.activePlan.programme.startsWith('M.'));

    if (comp.includes('C1')) {
      marksInput.value = '15';
    } else if (comp.includes('Mid Sem') || comp.includes('End Sem')) {
      marksInput.value = '30';
    } else if (comp.includes('Library')) {
      marksInput.value = '10';
    } else if (comp.includes('K6')) {
      marksInput.value = isPG ? '15' : '10';
    } else if (comp.includes('K4') || comp.includes('K5')) {
      marksInput.value = '15';
    } else {
      marksInput.value = '10';
    }
  }

  saveActivityFromModal(actIndex = null) {
    const acts = this.getModalSelectedActivities();
    if (acts.length === 0) {
      alert('Please select at least one Learning Activity.');
      return;
    }

    const topic = document.getElementById('modal-act-topic')?.value?.trim() || '';
    const outcome = document.getElementById('modal-act-outcome')?.value?.trim() || '';
    const dateFrom = document.getElementById('modal-act-date-from')?.value || '';
    const dateTo = document.getElementById('modal-act-date-to')?.value || '';
    const isAssessment = document.getElementById('modal-act-is-assessment')?.checked || false;

    const selectedRadio = document.querySelector('input[name="modal_cia_comp_radio"]:checked');
    const ciaComp = selectedRadio ? selectedRadio.value : (document.getElementById('modal-act-cia-comp-hidden')?.value || 'C2 – K4');
    const ciaMarks = selectedRadio ? selectedRadio.getAttribute('data-marks') : (document.getElementById('modal-act-cia-marks')?.value || '15');

    if (!topic) {
      alert('Please enter Related Unit / Topic.');
      document.getElementById('modal-act-topic')?.focus();
      return;
    }
    if (!outcome) {
      alert('Please enter Expected Learning Outcome.');
      document.getElementById('modal-act-outcome')?.focus();
      return;
    }
    if (!dateFrom) {
      alert('Please select Proposed From Date.');
      document.getElementById('modal-act-date-from')?.focus();
      return;
    }

    const formattedDate = (dateFrom && dateTo && dateFrom !== dateTo) 
      ? `${this.formatDateToDDMMYYYY(dateFrom)} to ${this.formatDateToDDMMYYYY(dateTo)}`
      : this.formatDateToDDMMYYYY(dateFrom);

    if (!this.activePlan.learning_activities) this.activePlan.learning_activities = [];

    const activityObj = {
      sno: String((actIndex !== null ? actIndex : this.activePlan.learning_activities.length) + 1),
      activity: acts.join(', '),
      topic,
      outcome,
      proposed_date: formattedDate,
      proposed_date_from: dateFrom,
      proposed_date_to: dateTo || dateFrom,
      is_assessment: isAssessment,
      cia_component: isAssessment ? ciaComp : '',
      cia_marks: isAssessment ? ciaMarks : ''
    };

    if (actIndex !== null && actIndex >= 0 && actIndex < this.activePlan.learning_activities.length) {
      this.activePlan.learning_activities[actIndex] = activityObj;
    } else {
      this.activePlan.learning_activities.push(activityObj);
    }

    // Automatically synchronize Section B (Assessment Plan)
    this.syncAssessmentPlanFromActivities();

    const modal = document.getElementById('activity-entry-modal');
    if (modal) modal.remove();

    this.render();
  }

  syncAssessmentPlanFromActivities() {
    if (!this.activePlan) return;
    this.activePlan.assessment_plan = this.getFullAssessmentPlan(this.activePlan);
  }

  addActivityRow() {
    this.openActivityModal();
  }

  deleteActivityRow(idx) {
    this.harvestFormInputs();
    this.activePlan.learning_activities.splice(idx, 1);
    this.syncAssessmentPlanFromActivities();
    this.render();
  }

  addAssessmentRow() {
    this.harvestFormInputs();
    const count = (this.activePlan.assessment_plan || []).length + 1;
    this.activePlan.assessment_plan.push({ sno: String(count), component: '', marks: '', category: '', unit_coverage: '', from_date: '', to_date: '', cos_assessed: '' });
    this.render();
  }

  deleteAssessmentRow(idx) {
    this.harvestFormInputs();
    this.activePlan.assessment_plan.splice(idx, 1);
    this.render();
  }

  addICTRow() {
    this.harvestFormInputs();
    const count = (this.activePlan.ict_integration || []).length + 1;
    this.activePlan.ict_integration.push({ sno: String(count), topic: '', tool: '', platform: 'JosTEL', purpose: '' });
    this.render();
  }

  deleteICTRow(idx) {
    this.harvestFormInputs();
    this.activePlan.ict_integration.splice(idx, 1);
    this.render();
  }

  harvestFormInputs() {
    if (!this.activePlan) this.activePlan = this.createDefaultPlan();

    if (this.currentUser && this.currentUser.role === 'faculty') {
      this.activePlan.department_name = this.currentUser.department_name;
      this.activePlan.faculty_name = this.currentUser.faculty_name;
      this.activePlan.faculty_email = this.currentUser.faculty_email || '';
    } else {
      this.activePlan.department_name = document.getElementById('cp-dept-name')?.value || this.selectedDept;
      this.activePlan.faculty_name = document.getElementById('cp-faculty-name')?.value || '';
    }
    this.activePlan.programme = document.getElementById('cp-programme')?.value || '';
    this.activePlan.year_class = document.getElementById('cp-year-class')?.value || 'I UG';
    this.activePlan.section = document.getElementById('cp-section')?.value || 'N/A';
    this.activePlan.semester = document.getElementById('cp-semester')?.value || 'II';
    this.activePlan.course_code = document.getElementById('cp-course-code')?.value || '';
    this.activePlan.course_title = document.getElementById('cp-course-title')?.value || '';
    this.activePlan.course_category = document.getElementById('cp-course-category')?.value || 'Core';
    this.activePlan.teaching_hours = document.getElementById('cp-teaching-hours')?.value || '';
    this.activePlan.credits = document.getElementById('cp-credits')?.value || '';

    // COs
    const coRows = document.querySelectorAll('#cp-cos-tbody tr');
    const cos = [];
    coRows.forEach(tr => {
      cos.push({
        code: tr.querySelector('.co-code')?.value || '',
        outcome: tr.querySelector('.co-outcome')?.value || '',
        k_level: tr.querySelector('.co-klevel')?.value || tr.querySelector('.co-klevel-hidden')?.value || 'K1'
      });
    });
    if (cos.length > 0) this.activePlan.course_outcomes = cos;

    // Course Category fallback to hidden input if disabled
    this.activePlan.course_category = document.getElementById('cp-course-category')?.value || document.getElementById('cp-course-category-hidden')?.value || 'Core';

    // Detailed Teaching Plan
    const dtpRows = document.querySelectorAll('#cp-dtp-tbody tr');
    const dtp = [];
    dtpRows.forEach(tr => {
      const fromTopic = tr.querySelector('.dtp-from-topic')?.value || '';
      const toTopic = tr.querySelector('.dtp-to-topic')?.value || '';
      dtp.push({
        month_days: tr.querySelector('.dtp-month')?.value || '',
        unit: tr.querySelector('.dtp-unit')?.value || 'Unit I',
        from_topic: fromTopic,
        to_topic: toTopic,
        topics: fromTopic + (toTopic ? ' to ' + toTopic : ''),
        hours: tr.querySelector('.dtp-hours')?.value || '',
        cos: tr.querySelector('.dtp-cos')?.value || '',
        methodology: tr.querySelector('.dtp-method-value')?.value || '',
        resources: tr.querySelector('.dtp-res-value')?.value || (tr.querySelector('.dtp-res-select')?.value === 'Others' 
          ? (tr.querySelector('.dtp-res-other')?.value || 'Others') 
          : (tr.querySelector('.dtp-res-select')?.value || ''))
      });
    });
    if (dtp.length > 0) this.activePlan.detailed_teaching_plan = dtp;

    // Unit Completion Plan
    const ucpRows = document.querySelectorAll('#cp-ucp-tbody tr:not(:last-child)');
    const ucp = [];
    const units = ['Unit I', 'Unit II', 'Unit III', 'Unit IV', 'Unit V'];
    ucpRows.forEach((tr, i) => {
      ucp.push({
        unit: units[i] || `Unit ${i+1}`,
        planned_hours: tr.querySelector('.ucp-planned')?.value || '',
        actual_hours: tr.querySelector('.ucp-actual')?.value || '',
        target_date: tr.querySelector('.ucp-date')?.value || ''
      });
    });
    if (ucp.length > 0) this.activePlan.unit_completion_plan = ucp;

    // Learning Activities & Assessment Plan (Section B is auto-synced from Section A)
    this.syncAssessmentPlanFromActivities();

    // ICT Integration
    const ictRows = document.querySelectorAll('#cp-icts-tbody tr');
    const icts = [];
    ictRows.forEach((tr, i) => {
      const toolSelect = tr.querySelector('.ict-tool-select')?.value || '';
      const toolOther = tr.querySelector('.ict-tool-other')?.value || tr.querySelector('.ict-other-tool')?.value || '';
      const finalTool = (toolSelect === 'Others' ? toolOther : toolSelect) || tr.querySelector('.ict-tool')?.value || '';

      const platSelect = tr.querySelector('.ict-platform-select')?.value || '';
      const platOther = tr.querySelector('.ict-platform-other')?.value || tr.querySelector('.ict-other-platform')?.value || '';
      const finalPlat = (platSelect === 'Others' ? platOther : platSelect) || tr.querySelector('.ict-platform')?.value || '';

      icts.push({
        sno: String(i + 1),
        topic: tr.querySelector('.ict-topic')?.value || '',
        tool: finalTool,
        tool_type: toolSelect,
        tool_other: toolOther,
        platform: finalPlat,
        platform_type: platSelect,
        platform_other: platOther,
        purpose: tr.querySelector('.ict-purpose')?.value || ''
      });
    });
    // Keep rows that have at least one field filled, or at least 1 row
    const filledIcts = icts.filter(r => (r.topic || '').trim() || (r.tool || '').trim() || (r.platform || '').trim() || (r.purpose || '').trim());
    this.activePlan.ict_integration = (filledIcts.length > 0) ? filledIcts : (icts.slice(0, 1).length > 0 ? icts.slice(0, 1) : [{ sno: '1', topic: '', tool: '', platform: '', purpose: '' }]);

    // Declaration
    const declCheckEl = document.getElementById('cp-decl-check');
    this.activePlan.declaration = {
      confirmed: declCheckEl ? declCheckEl.checked : (this.activePlan.declaration?.confirmed || false),
      faculty_signature: document.getElementById('cp-decl-fac-sig')?.value || this.activePlan.faculty_name,
      submission_date: document.getElementById('cp-decl-fac-date')?.value || new Date().toISOString().split('T')[0]
    };
  }

  async saveCurrentPlan(status = 'Draft') {
    this.harvestFormInputs();
    this.activePlan.status = status;

    if (status === 'Submitted') {
      if (this.activeFormTab !== 'declaration') {
        alert('🔒 Submit to HOD is enabled after completing IV Declaration & HOD Approval. Please proceed to Part-IV to review and submit.');
        return;
      }
      const v = this.validatePart4();
      if (!v.valid) {
        this.showValidationFeedback('section-declaration', v.errors, v.invalidEls);
        return;
      }
    } else {
      if (!this.activePlan.faculty_name && !this.activePlan.course_code) {
        // Allow saving draft with minimal info, but prompt if completely blank
        if (!confirm('Faculty name and course details are not yet selected. Save empty draft anyway?')) return;
      }
    }

    try {
      const res = await fetch('api/course_plan.php?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.activePlan)
      });
      const json = await res.json();
      if (json.success) {
        if (status === 'Submitted') {
          const facName = this.activePlan.faculty_name || 'Professor';
          const cCode = this.activePlan.course_code || '';
          const cTitle = this.activePlan.course_title || '';
          this.showSubmissionSuccessModal(facName, cCode, cTitle);
        } else {
          alert('✓ Course plan draft saved successfully!');
        }
      } else {
        alert(json.error || 'Failed to save course plan');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving course plan. Please check server connection.');
    }
  }

  showSubmissionSuccessModal(facultyName, courseCode, courseTitle) {
    const modalId = 'submission-success-modal';
    let el = document.getElementById(modalId);
    if (!el) {
      el = document.createElement('div');
      el.id = modalId;
      document.body.appendChild(el);
    }

    const courseDisplay = courseCode && courseTitle ? `${courseCode} – ${courseTitle}` : (courseCode || courseTitle || 'Course');

    el.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-8 text-center space-y-6 my-auto animate-scaleIn">
          
          <!-- Success Check Icon -->
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <i data-lucide="check-circle-2" class="w-10 h-10 sm:w-12 sm:h-12"></i>
          </div>

          <!-- Message Header & Body -->
          <div class="space-y-3">
            <span class="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wider">
              Submission Recorded
            </span>
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              Thank you, <span class="text-indigo-600">${facultyName}</span>!
            </h3>
            <p class="text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              Your course plan for <strong class="text-slate-900">${courseDisplay}</strong> is recorded and submitted to HoD review.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button 
              type="button" 
              onclick="coursePlanApp.navigateTo('/course-plan/dashboard')" 
              class="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
              <span>Go to My Dashboard</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.submitNextCourse()" 
              class="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition border border-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <i data-lucide="plus-circle" class="w-4 h-4 text-slate-500"></i>
              <span>Submit for Next Course</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.closeCurrentTab()" 
              class="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition border border-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <i data-lucide="x-circle" class="w-4 h-4 text-slate-500"></i>
              <span>Close Tab</span>
            </button>
          </div>

          <!-- Fallback helper note if browser security blocks window.close -->
          <div id="close-tab-fallback-msg" class="hidden text-xs text-slate-400 font-medium">
            (If the tab remains open, you can safely close this browser tab manually)
          </div>
        </div>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  submitNextCourse() {
    const el = document.getElementById('submission-success-modal');
    if (el) el.innerHTML = '';
    
    // Retain department, faculty name and email for quick sequential entry
    const isFaculty = this.currentUser && this.currentUser.role === 'faculty';
    const curDept = isFaculty ? this.currentUser.department_name : (this.activePlan ? this.activePlan.department_name : this.selectedDept);
    const curFac = isFaculty ? this.currentUser.faculty_name : (this.activePlan ? this.activePlan.faculty_name : '');
    const curEmail = isFaculty ? (this.currentUser.faculty_email || '') : (this.activePlan ? this.activePlan.faculty_email : '');
    const curSem = this.activePlan ? this.activePlan.semester : 'II';
    const curProg = this.activePlan ? this.activePlan.programme : '';

    this.activePlan = this.createDefaultPlan();
    this.activePlan.department_name = curDept;
    this.activePlan.faculty_name = curFac;
    this.activePlan.faculty_email = curEmail;
    this.activePlan.semester = curSem;
    this.activePlan.programme = curProg;
    if (this.activePlan.declaration) {
      this.activePlan.declaration.faculty_signature = curFac;
    }
    
    this.navigateTo('/course-plan/new');
  }

  closeCurrentTab() {
    window.close();
    const fallback = document.getElementById('close-tab-fallback-msg');
    if (fallback) fallback.classList.remove('hidden');
    setTimeout(() => {
      try {
        window.open('', '_self', '');
        window.close();
      } catch (e) {}
    }, 250);
  }

  async deletePlan(id) {
    if (!confirm('Are you sure you want to delete this course plan draft?')) return;
    try {
      const res = await fetch('api/course_plan.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.success) {
        this.fetchPlans().then(() => this.render());
      }
    } catch (e) {
      console.error(e);
    }
  }

  // ================= 6. HOD REVIEW MODAL & APPROVAL =================
  async openHODReviewModal(planId) {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return;

    // Fetch full plan
    const res = await fetch(`api/course_plan.php?action=get&id=${planId}`);
    const json = await res.json();
    const fullPlan = (json.success && json.data) ? json.data : plan;

    const modalHtml = `
      <div id="hod-review-modal" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div class="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
          
          <div class="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div class="text-[10px] uppercase font-bold text-amber-700">HOD Verification & Review</div>
              <h3 class="text-base font-extrabold text-slate-900">${fullPlan.course_code}: ${fullPlan.course_title}</h3>
              <p class="text-xs text-slate-500">Submitted by <strong>${fullPlan.faculty_name}</strong> for ${fullPlan.department_name}</p>
            </div>
            <button type="button" onclick="document.getElementById('hod-review-modal').remove()" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div><span class="font-bold text-slate-600">Programme:</span> ${fullPlan.programme || '—'}</div>
              <div><span class="font-bold text-slate-600">Year & Class:</span> ${fullPlan.year_class || '—'}</div>
              <div><span class="font-bold text-slate-600">Teaching Hours:</span> ${fullPlan.teaching_hours || '—'}</div>
              <div><span class="font-bold text-slate-600">Credits:</span> ${fullPlan.credits || '—'}</div>
              <div><span class="font-bold text-slate-600">Course Outcomes:</span> ${(fullPlan.course_outcomes || []).length} COs mapped</div>
              <div><span class="font-bold text-slate-600">Submission Date:</span> ${fullPlan.declaration?.submission_date || fullPlan.updated_at}</div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Head of the Department Name *</label>
              <input type="text" id="hod-review-name" value="${fullPlan.hod_name || (this.currentUser ? this.currentUser.display_name.replace('HOD - ', '') : '')}" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Reviewer Remarks / Approval Notes</label>
              <textarea id="hod-review-comments" rows="3" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl" placeholder="Course plan reviewed and verified against syllabus standards...">${fullPlan.hod_comments || ''}</textarea>
            </div>

            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
              <strong>Institutional Assurance:</strong> Upon approving, this course plan will be certified with your HOD approval timestamp and forwarded directly to the central IQAC dashboard.
            </div>
          </div>

          <div class="p-3.5 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button 
              type="button" 
              onclick="coursePlanApp.previewPlan(${fullPlan.id})" 
              class="px-4 py-2 bg-white text-slate-700 font-bold border border-slate-300 rounded-xl text-xs hover:bg-slate-100 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>View Document Preview</span>
            </button>

            <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <button 
                type="button" 
                onclick="coursePlanApp.submitHODDecision(${fullPlan.id}, 'Revision Needed')" 
                class="flex-1 sm:flex-initial px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition border border-rose-200 text-center"
              >
                Request Revision
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.submitHODDecision(${fullPlan.id}, 'Approved')" 
                class="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25"
              >
                <i data-lucide="check-check" class="w-4 h-4"></i>
                <span>Approve</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) lucide.createIcons();
  }

  async submitHODDecision(planId, decision) {
    const hodName = document.getElementById('hod-review-name')?.value || '';
    const hodComments = document.getElementById('hod-review-comments')?.value || '';

    try {
      const res = await fetch('api/course_plan.php?action=hod_action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: planId, decision, hod_name: hodName, hod_comments: hodComments })
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || 'Decision recorded successfully.');
        document.getElementById('hod-review-modal')?.remove();
        this.fetchPlans().then(() => this.render());
      } else {
        alert(json.error || 'Failed to submit decision.');
      }
    } catch (e) {
      console.error(e);
      alert('Error communicating with server.');
    }
  }

  // ================= 7. LOGIN MODAL (HOD & IQAC ADMIN) =================
  openLoginModal(defaultTab = 'hod') {
    const existing = document.getElementById('course-plan-login-modal');
    if (existing) existing.remove();

    const urlParams = new URLSearchParams(window.location.search);
    const startAsAdmin = defaultTab === 'admin' || urlParams.has('admin');

    const modalHtml = `
      <div id="course-plan-login-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleIn">
          
          <div class="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <i data-lucide="lock" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 id="login-modal-title" class="text-sm font-extrabold text-slate-900">
                  ${startAsAdmin ? 'IQAC System Administrator' : 'Head of Department (HOD) Login'}
                </h3>
                <p id="login-modal-subtitle" class="text-[11px] text-slate-500">
                  ${startAsAdmin ? 'Manage faculties, courses & departmental audit' : 'Sign in to review and approve departmental course plans'}
                </p>
              </div>
            </div>
            <button type="button" onclick="document.getElementById('course-plan-login-modal').remove()" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- HOD Login Form -->
            <div id="login-form-hod" class="space-y-3.5 text-xs ${startAsAdmin ? 'hidden' : ''}">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Select Department</label>
                <select id="login-hod-dept" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:border-indigo-600">
                  ${this.departments.map(d => `
                    <option value="${d.name}" ${d.name === this.selectedDept ? 'selected' : ''}>${d.name}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">HOD Password</label>
                <input type="password" id="login-hod-pass" value="" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-indigo-600" placeholder="Enter HOD password" autocomplete="current-password" />
              </div>

              <button 
                type="button" 
                onclick="coursePlanApp.performLogin('hod')" 
                class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer active:scale-95"
              >
                Sign In as HOD
              </button>
            </div>

            <!-- Admin Login Form -->
            <div id="login-form-admin" class="space-y-3.5 text-xs ${startAsAdmin ? '' : 'hidden'}">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Admin Username</label>
                <input type="text" id="login-admin-user" value="" placeholder="Enter admin username" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:outline-none focus:border-indigo-600" />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Admin Password</label>
                <input type="password" id="login-admin-pass" value="" placeholder="Enter admin password" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-indigo-600" autocomplete="current-password" />
              </div>

              <button 
                type="button" 
                onclick="coursePlanApp.performLogin('admin')" 
                class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer active:scale-95"
              >
                Sign In as Administrator
              </button>
            </div>

            <div class="pt-3 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
              <button type="button" onclick="document.getElementById('course-plan-login-modal').remove()" class="text-indigo-600 font-bold hover:underline cursor-pointer">
                ← Return to Faculty Course Plan
              </button>
              <button 
                type="button" 
                id="login-toggle-role-btn" 
                onclick="coursePlanApp.toggleAdminLoginForm()" 
                class="text-slate-400 hover:text-slate-600 text-[10px] font-medium transition cursor-pointer"
              >
                ${startAsAdmin ? 'Switch to HOD Login' : 'Administrator Sign-in'}
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) lucide.createIcons();
  }

  toggleAdminLoginForm() {
    const formHod = document.getElementById('login-form-hod');
    const formAdmin = document.getElementById('login-form-admin');
    const title = document.getElementById('login-modal-title');
    const subtitle = document.getElementById('login-modal-subtitle');
    const toggleBtn = document.getElementById('login-toggle-role-btn');
    if (!formHod || !formAdmin) return;

    if (formAdmin.classList.contains('hidden')) {
      formHod.classList.add('hidden');
      formAdmin.classList.remove('hidden');
      if (title) title.textContent = 'IQAC System Administrator';
      if (subtitle) subtitle.textContent = 'Manage faculties, courses & departmental audit';
      if (toggleBtn) toggleBtn.textContent = 'Switch to HOD Login';
    } else {
      formAdmin.classList.add('hidden');
      formHod.classList.remove('hidden');
      if (title) title.textContent = 'Head of Department (HOD) Login';
      if (subtitle) subtitle.textContent = 'Sign in to review and approve departmental course plans';
      if (toggleBtn) toggleBtn.textContent = 'Administrator Sign-in';
    }
  }

  switchLoginTab(tab) {
    if (tab === 'admin') {
      const formHod = document.getElementById('login-form-hod');
      const formAdmin = document.getElementById('login-form-admin');
      if (formHod) formHod.classList.add('hidden');
      if (formAdmin) formAdmin.classList.remove('hidden');
    } else {
      const formHod = document.getElementById('login-form-hod');
      const formAdmin = document.getElementById('login-form-admin');
      if (formAdmin) formAdmin.classList.add('hidden');
      if (formHod) formHod.classList.remove('hidden');
    }
  }

  async performLogin(role) {
    let payload = {};
    if (role === 'hod') {
      const dept = document.getElementById('login-hod-dept')?.value;
      const pass = document.getElementById('login-hod-pass')?.value;
      payload = { role: 'hod', department_name: dept, password: pass };
    } else {
      const user = document.getElementById('login-admin-user')?.value;
      const pass = document.getElementById('login-admin-pass')?.value;
      payload = { role: 'admin', username: user, password: pass };
    }

    try {
      const res = await fetch('api/course_plan.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.user) {
        this.currentUser = json.user;
        this.viewMode = 'dashboard';
        if (this.currentUser.role === 'hod' && this.currentUser.department_name) {
          this.selectedDept = this.currentUser.department_name;
        }
        if (this.currentUser.role === 'admin') {
          window.history.replaceState(null, '', '/course-plan/admin');
        } else if (this.currentUser.role === 'hod') {
          window.history.replaceState(null, '', '/course-plan/hod');
        }
        document.getElementById('course-plan-login-modal')?.remove();
        await this.fetchPlans();
        this.render();
      } else {
        alert(json.error || 'Login failed. Please check credentials.');
      }
    } catch (e) {
      console.error(e);
      alert('Network or server error during sign in.');
    }
  }


  // ================= TL PRACTICES, ASSESSMENT COMPONENTS & E-CONTENT =================
  getFacultyPlannedCourses() {
    const plans = (this.plans || []).filter(p => p.course_code && p.course_title);
    const seen = new Set();
    const list = [];
    for (const p of plans) {
      const code = (p.course_code || '').trim();
      const title = (p.course_title || '').trim();
      const key = `${code} - ${title}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          code: code,
          title: title,
          key: key,
          classSection: p.year_class || p.programme || '',
          semester: p.semester || ''
        });
      }
    }
    return list;
  }

  renderTLCourseSelect(fieldId, targetClassInputId, selectedValue = '') {
    const courses = this.getFacultyPlannedCourses();
    let optionsHtml = `<option value="">-- Select Planned Course --</option>`;
    
    if (courses.length === 0) {
      optionsHtml += `<option value="" disabled>No planned courses found (Create a Course Plan first)</option>`;
    } else {
      courses.forEach(c => {
        const isSel = (selectedValue && selectedValue.trim().toLowerCase() === c.key.trim().toLowerCase()) ? 'selected' : '';
        const label = `${c.code} - ${c.title}${c.classSection ? ` (${c.classSection})` : ''}`;
        optionsHtml += `<option value="${this.escapeHtml(c.key)}" data-class="${this.escapeHtml(c.classSection)}" ${isSel}>${this.escapeHtml(label)}</option>`;
      });
    }
    
    const isCustom = selectedValue && !courses.some(c => c.key.trim().toLowerCase() === selectedValue.trim().toLowerCase());
    optionsHtml += `<option value="__custom__" ${isCustom ? 'selected' : ''}>➕ Enter another course manually...</option>`;

    return `
      <div class="space-y-1.5">
        <select 
          id="${fieldId}" 
          onchange="coursePlanApp.onTLCourseSelect('${fieldId}', '${targetClassInputId}', this)" 
          class="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 shadow-2xs cursor-pointer"
        >
          ${optionsHtml}
        </select>
        <input 
          type="text" 
          id="${fieldId}_custom" 
          value="${isCustom ? this.escapeHtml(selectedValue) : ''}" 
          placeholder="Type Course Code & Title (e.g. 25USS230203 - Object Oriented Programming)" 
          class="w-full px-3 py-2 text-xs font-medium bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 transition text-slate-800 ${isCustom ? '' : 'hidden'}"
        />
      </div>
    `;
  }

  onTLCourseSelect(fieldId, targetClassInputId, selectEl) {
    const val = selectEl.value;
    const customInput = document.getElementById(`${fieldId}_custom`);
    if (val === '__custom__') {
      if (customInput) {
        customInput.classList.remove('hidden');
        customInput.focus();
      }
    } else {
      if (customInput) customInput.classList.add('hidden');
      if (targetClassInputId) {
        const targetEl = document.getElementById(targetClassInputId);
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        const classData = selectedOption ? selectedOption.getAttribute('data-class') : '';
        if (targetEl && classData) {
          targetEl.value = classData;
        }
      }
    }
  }

  renderTLSelectWithOptions(fieldId, optionsList, otherInputId, selectedValue = '') {
    let hasCustomVal = false;
    let isStandard = optionsList.some(o => o.toLowerCase().trim() === (selectedValue || '').toLowerCase().trim());
    if (selectedValue && !isStandard) {
      hasCustomVal = true;
    }
    
    let html = `<option value="">-- Select Option --</option>`;
    optionsList.forEach(opt => {
      let isSel = false;
      if (opt === 'Other') {
        isSel = hasCustomVal || selectedValue === 'Other';
      } else {
        isSel = (selectedValue || '').toLowerCase().trim() === opt.toLowerCase().trim();
      }
      html += `<option value="${this.escapeHtml(opt)}" ${isSel ? 'selected' : ''}>${this.escapeHtml(opt)}</option>`;
    });

    const customText = hasCustomVal ? selectedValue : '';

    return `
      <div class="space-y-1.5">
        <select 
          id="${fieldId}" 
          onchange="coursePlanApp.onTLSelectChange(this, '${otherInputId}')" 
          class="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 shadow-2xs cursor-pointer"
        >
          ${html}
        </select>
        <input 
          type="text" 
          id="${otherInputId}" 
          value="${this.escapeHtml(customText)}" 
          placeholder="Please specify..." 
          class="w-full px-3 py-2 text-xs font-medium bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 transition text-slate-800 ${(hasCustomVal || selectedValue === 'Other') ? '' : 'hidden'}"
        />
      </div>
    `;
  }

  onTLSelectChange(selectEl, otherInputId) {
    const otherInput = document.getElementById(otherInputId);
    if (!otherInput) return;
    if (selectEl.value === 'Other') {
      otherInput.classList.remove('hidden');
      otherInput.focus();
    } else {
      otherInput.classList.add('hidden');
    }
  }

  async openTLPracticesModal() {
    const user = this.currentUser || {};
    const facultyName = user.faculty_name || user.display_name || '';
    const deptName = user.department_name || this.selectedDept || '';

    let existingData = null;
    try {
      const res = await fetch(`api/course_plan.php?action=get_tl_practices&faculty_name=${encodeURIComponent(facultyName)}&department_name=${encodeURIComponent(deptName)}`);
      const json = await res.json();
      if (json.success && json.data) {
        existingData = json.data;
      }
    } catch (e) {
      console.warn('Could not fetch existing TL practices:', e);
    }

    const d = existingData || {};
    const tl1 = d.tl_practice_1 || {};
    const tl2 = d.tl_practice_2 || {};
    const ass1 = d.assessment_practice_1 || {};
    const ass2 = d.assessment_practice_2 || {};
    const ec = d.econtent || {};

    document.getElementById('tl-practices-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'tl-practices-modal';
    modal.className = 'fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn';

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white flex items-start justify-between gap-4 shrink-0 shadow-md">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-indigo-950 uppercase tracking-wider shadow-xs">
                IQAC Quality Initiative
              </span>
              <span class="text-xs text-indigo-200 font-semibold">
                ODD Sem 2026 - 2027
              </span>
              ${d.id ? `<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Previously Submitted (#${d.id})</span>` : ''}
            </div>
            <h2 class="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <i data-lucide="sparkles" class="w-5 h-5 text-amber-300"></i>
              <span>Teaching - Learning Practices, Assessment Components &amp; E - Contents Planned</span>
            </h2>
            <p class="text-xs text-indigo-200 max-w-3xl leading-relaxed font-medium">
              St. Joseph's College (Autonomous), Tiruchirappalli • Internal Quality Assurance Cell (IQAC). Document your planned pedagogical approaches, continuous assessment components, and 4-quadrant e-content.
            </p>
          </div>

          <button 
            type="button" 
            onclick="coursePlanApp.closeTLPracticesModal()" 
            class="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-2xl transition cursor-pointer shrink-0"
            title="Close Form"
          >
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <!-- Form Body (Scrollable) -->
        <form id="tl-practices-form" onsubmit="coursePlanApp.saveTLPracticesForm(event)" class="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 bg-slate-50/70">
          <input type="hidden" id="tl_id" value="${d.id || ''}" />

          <!-- Card 1: Faculty Information -->
          <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div class="flex items-center gap-2 text-slate-800 font-black text-xs sm:text-sm border-b border-slate-100 pb-3">
              <i data-lucide="user-check" class="w-4 h-4 text-indigo-600"></i>
              <span>Faculty &amp; Department Information</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Name of the Faculty <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="tl_fac_name" 
                  value="${this.escapeHtml(d.faculty_name || facultyName)}" 
                  required 
                  class="w-full px-3.5 py-2 text-xs font-bold bg-slate-100 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Department <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="tl_dept_name" 
                  value="${this.escapeHtml(d.department_name || deptName)}" 
                  required 
                  class="w-full px-3.5 py-2 text-xs font-bold bg-slate-100 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Institutional E-mail ID <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="tl_fac_email" 
                  value="${this.escapeHtml(d.faculty_email || user.faculty_email || user.username || '')}" 
                  placeholder="e.g. yourname@sjctni.edu" 
                  required 
                  class="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <!-- Card 2: Section A: Teaching - Learning Practices -->
          <div class="bg-white p-5 sm:p-6 rounded-2xl border border-blue-200/80 shadow-2xs space-y-5">
            <div class="flex items-center justify-between border-b border-blue-100 pb-3 flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">A</span>
                <h3 class="text-sm font-black text-slate-900">Section A: Teaching - Learning Practices</h3>
              </div>
              <span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Course dropdown displays only your planned courses
              </span>
            </div>

            <!-- Practice 1 -->
            <div class="p-4 sm:p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
              <div class="flex items-center gap-2 font-black text-xs text-blue-900">
                <i data-lucide="bookmark" class="w-3.5 h-3.5 text-blue-600"></i>
                <span>Practice – 1</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Course Code - Course Title <span class="text-rose-500">*</span>
                  </label>
                  ${this.renderTLCourseSelect('tl_a1_course', 'tl_a1_class', tl1.course_code_title || '')}
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Class with section <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="tl_a1_class" 
                    value="${this.escapeHtml(tl1.class_section || '')}" 
                    placeholder="e.g. I B.Voc Software Development 'A'" 
                    required 
                    class="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Teaching Method / Strategy <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="tl_a1_method" 
                    value="${this.escapeHtml(tl1.teaching_method || '')}" 
                    placeholder="e.g. Flipped Classroom, Think-Pair-Share, Live coding demos" 
                    required 
                    class="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Approach <span class="text-rose-500">*</span>
                  </label>
                  ${this.renderTLSelectWithOptions('tl_a1_approach', CoursePlanApp.TL_APPROACHES, 'tl_a1_approach_other', tl1.approach || '')}
                </div>
              </div>
            </div>

            <!-- Practice 2 -->
            <div class="p-4 sm:p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
              <div class="flex items-center gap-2 font-black text-xs text-blue-900">
                <i data-lucide="bookmark" class="w-3.5 h-3.5 text-blue-600"></i>
                <span>Practice – 2</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Course Code - Course Title
                  </label>
                  ${this.renderTLCourseSelect('tl_a2_course', 'tl_a2_class', tl2.course_code_title || '')}
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Class with section
                  </label>
                  <input 
                    type="text" 
                    id="tl_a2_class" 
                    value="${this.escapeHtml(tl2.class_section || '')}" 
                    placeholder="e.g. II B.Voc Software Development" 
                    class="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Teaching Method / Strategy
                  </label>
                  <input 
                    type="text" 
                    id="tl_a2_method" 
                    value="${this.escapeHtml(tl2.teaching_method || '')}" 
                    placeholder="e.g. Case-based discussions, Industry problem solving" 
                    class="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Approach
                  </label>
                  ${this.renderTLSelectWithOptions('tl_a2_approach', CoursePlanApp.TL_APPROACHES, 'tl_a2_approach_other', tl2.approach || '')}
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: Section B: Assessment Components -->
          <div class="bg-white p-5 sm:p-6 rounded-2xl border border-purple-200/80 shadow-2xs space-y-5">
            <div class="flex items-center justify-between border-b border-purple-100 pb-3 flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">B</span>
                <h3 class="text-sm font-black text-slate-900">Section B: Assessment Components</h3>
              </div>
              <span class="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Formative &amp; Continuous Assessment Components
              </span>
            </div>

            <!-- Assessment Practice 1 -->
            <div class="p-4 sm:p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
              <div class="flex items-center gap-2 font-black text-xs text-purple-900">
                <i data-lucide="check-circle" class="w-3.5 h-3.5 text-purple-600"></i>
                <span>Practice – 1</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Course Code - Course Title <span class="text-rose-500">*</span>
                  </label>
                  ${this.renderTLCourseSelect('tl_b1_course', 'tl_b1_class', ass1.course_code_title || '')}
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Class with section <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="tl_b1_class" 
                    value="${this.escapeHtml(ass1.class_section || '')}" 
                    placeholder="e.g. I B.Voc Software Development" 
                    required 
                    class="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Component <span class="text-rose-500">*</span>
                  </label>
                  ${this.renderTLSelectWithOptions('tl_b1_comp', CoursePlanApp.TL_ASSESSMENT_COMPONENTS, 'tl_b1_comp_other', ass1.component || '')}
                </div>
              </div>
            </div>

            <!-- Assessment Practice 2 -->
            <div class="p-4 sm:p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
              <div class="flex items-center gap-2 font-black text-xs text-purple-900">
                <i data-lucide="check-circle" class="w-3.5 h-3.5 text-purple-600"></i>
                <span>Practice – 2</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Course Code - Course Title
                  </label>
                  ${this.renderTLCourseSelect('tl_b2_course', 'tl_b2_class', ass2.course_code_title || '')}
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Class
                  </label>
                  <input 
                    type="text" 
                    id="tl_b2_class" 
                    value="${this.escapeHtml(ass2.class_section || '')}" 
                    placeholder="e.g. II B.Voc Software Development" 
                    class="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Component
                  </label>
                  ${this.renderTLSelectWithOptions('tl_b2_comp', CoursePlanApp.TL_ASSESSMENT_COMPONENTS, 'tl_b2_comp_other', ass2.component || '')}
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4: Section C: E - Content (4 Quadrant Approach) -->
          <div class="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-4">
            <div class="flex items-center justify-between border-b border-emerald-100 pb-3 flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">C</span>
                <h3 class="text-sm font-black text-slate-900">Section C: E - Content (4 Quadrant Approach)</h3>
              </div>
              <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Quadrants: e-Tutorial, e-Content/Text, Self-Assessment, Discussion
              </span>
            </div>

            <div class="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Course Code - Course Title <span class="text-rose-500">*</span>
                  </label>
                  ${this.renderTLCourseSelect('tl_c_course', '', ec.course_code_title || '')}
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Unit <span class="text-rose-500">*</span>
                  </label>
                  <select 
                    id="tl_c_unit" 
                    class="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-slate-800 shadow-2xs cursor-pointer"
                  >
                    <option value="">-- Select Unit --</option>
                    ${['I', 'II', 'III', 'IV', 'V'].map(u => `<option value="${u}" ${(ec.unit === u) ? 'selected' : ''}>Unit ${u}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    E-Content Topic <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="tl_c_topic" 
                    value="${this.escapeHtml(ec.topic || '')}" 
                    placeholder="e.g. Object-Oriented Polymorphism, Virtual Functions & Templates" 
                    required 
                    class="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div id="tl-modal-feedback" class="hidden"></div>
        </form>

        <!-- Footer -->
        <div class="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button 
            type="button" 
            onclick="coursePlanApp.printTLPracticesSummary()" 
            class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Print or preview a clean institutional summary"
          >
            <i data-lucide="printer" class="w-4 h-4 text-slate-500"></i>
            <span>Print Summary</span>
          </button>

          <div class="flex items-center gap-3">
            <button 
              type="button" 
              onclick="coursePlanApp.closeTLPracticesModal()" 
              class="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition border border-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="tl-practices-form" 
              id="tl-submit-btn" 
              class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i data-lucide="send" class="w-4 h-4"></i>
              <span>Save &amp; Submit Details</span>
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  closeTLPracticesModal() {
    document.getElementById('tl-practices-modal')?.remove();
  }

  async saveTLPracticesForm(e) {
    e.preventDefault();
    const btn = document.getElementById('tl-submit-btn');
    const feedback = document.getElementById('tl-modal-feedback');

    const getVal = (id) => (document.getElementById(id)?.value || '').trim();
    const getCourseVal = (id) => {
      const selectVal = getVal(id);
      if (selectVal === '__custom__') {
        return getVal(`${id}_custom`);
      }
      return selectVal;
    };
    const getOptionVal = (selectId, otherId) => {
      const sel = getVal(selectId);
      if (sel === 'Other') {
        const otherVal = getVal(otherId);
        return otherVal ? `Other: ${otherVal}` : 'Other';
      }
      return sel;
    };

    const id = getVal('tl_id');
    const facName = getVal('tl_fac_name');
    const deptName = getVal('tl_dept_name');
    const facEmail = getVal('tl_fac_email');

    const tl1 = {
      course_code_title: getCourseVal('tl_a1_course'),
      class_section: getVal('tl_a1_class'),
      teaching_method: getVal('tl_a1_method'),
      approach: getOptionVal('tl_a1_approach', 'tl_a1_approach_other')
    };

    const tl2 = {
      course_code_title: getCourseVal('tl_a2_course'),
      class_section: getVal('tl_a2_class'),
      teaching_method: getVal('tl_a2_method'),
      approach: getOptionVal('tl_a2_approach', 'tl_a2_approach_other')
    };

    const ass1 = {
      course_code_title: getCourseVal('tl_b1_course'),
      class_section: getVal('tl_b1_class'),
      component: getOptionVal('tl_b1_comp', 'tl_b1_comp_other')
    };

    const ass2 = {
      course_code_title: getCourseVal('tl_b2_course'),
      class_section: getVal('tl_b2_class'),
      component: getOptionVal('tl_b2_comp', 'tl_b2_comp_other')
    };

    const ec = {
      course_code_title: getCourseVal('tl_c_course'),
      unit: getVal('tl_c_unit'),
      topic: getVal('tl_c_topic')
    };

    if (!tl1.course_code_title || !tl1.class_section || !tl1.teaching_method || !tl1.approach) {
      alert('Please fill all mandatory fields for Section A (Practice 1).');
      return;
    }
    if (!ass1.course_code_title || !ass1.class_section || !ass1.component) {
      alert('Please fill all mandatory fields for Section B (Practice 1).');
      return;
    }
    if (!ec.course_code_title || !ec.unit || !ec.topic) {
      alert('Please fill all mandatory fields for Section C (E-Content).');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Submitting...`;
      if (window.lucide) window.lucide.createIcons();
    }

    try {
      const payload = {
        id: id ? parseInt(id, 10) : null,
        faculty_name: facName,
        faculty_email: facEmail,
        department_name: deptName,
        academic_year: '2026 - 2027',
        semester: 'ODD Sem 2026 - 2027',
        tl_practice_1: tl1,
        tl_practice_2: tl2,
        assessment_practice_1: ass1,
        assessment_practice_2: ass2,
        econtent: ec,
        status: 'Submitted'
      };

      const res = await fetch('api/course_plan.php?action=save_tl_practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        if (document.getElementById('tl_id')) {
          document.getElementById('tl_id').value = data.id || '';
        }
        if (feedback) {
          feedback.className = 'p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2';
          feedback.innerHTML = `<i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600 shrink-0"></i> <span>${data.message || 'Saved successfully!'}</span>`;
          feedback.classList.remove('hidden');
          if (window.lucide) window.lucide.createIcons();
        }
        setTimeout(() => {
          this.closeTLPracticesModal();
          alert('Teaching-Learning Practices, Assessment Components & E-Content submitted successfully!');
        }, 1200);
      } else {
        alert(data.error || 'Failed to save submission. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i> <span>Save &amp; Submit Details</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  printTLPracticesSummary() {
    const getVal = (id) => (document.getElementById(id)?.value || '').trim();
    const getCourseVal = (id) => {
      const selectVal = getVal(id);
      return (selectVal === '__custom__') ? getVal(`${id}_custom`) : selectVal;
    };
    const getOptionVal = (selectId, otherId) => {
      const sel = getVal(selectId);
      return (sel === 'Other') ? `Other: ${getVal(otherId)}` : sel;
    };

    const facName = getVal('tl_fac_name') || (this.currentUser && this.currentUser.faculty_name) || '';
    const deptName = getVal('tl_dept_name') || (this.currentUser && this.currentUser.department_name) || '';
    const facEmail = getVal('tl_fac_email') || '';

    const tl1Course = getCourseVal('tl_a1_course');
    const tl1Class = getVal('tl_a1_class');
    const tl1Method = getVal('tl_a1_method');
    const tl1Approach = getOptionVal('tl_a1_approach', 'tl_a1_approach_other');

    const tl2Course = getCourseVal('tl_a2_course');
    const tl2Class = getVal('tl_a2_class');
    const tl2Method = getVal('tl_a2_method');
    const tl2Approach = getOptionVal('tl_a2_approach', 'tl_a2_approach_other');

    const ass1Course = getCourseVal('tl_b1_course');
    const ass1Class = getVal('tl_b1_class');
    const ass1Comp = getOptionVal('tl_b1_comp', 'tl_b1_comp_other');

    const ass2Course = getCourseVal('tl_b2_course');
    const ass2Class = getVal('tl_b2_class');
    const ass2Comp = getOptionVal('tl_b2_comp', 'tl_b2_comp_other');

    const ecCourse = getCourseVal('tl_c_course');
    const ecUnit = getVal('tl_c_unit');
    const ecTopic = getVal('tl_c_topic');

    const printWin = window.open('', '_blank', 'width=900,height=900');
    if (!printWin) {
      alert('Please allow popups to print the TL Practices summary.');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TL Practices & Assessment Components - ${this.escapeHtml(facName)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 30px; color: #1e293b; line-height: 1.5; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 18px; color: #1e1b4b; text-transform: uppercase; }
          .header h2 { margin: 4px 0; font-size: 14px; color: #312e81; font-weight: 700; }
          .header p { margin: 2px 0; font-size: 12px; color: #64748b; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
          .meta-item strong { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; }
          .section-title { background: #312e81; color: white; padding: 6px 12px; font-weight: bold; font-size: 13px; border-radius: 6px; margin: 20px 0 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; font-size: 12px; color: #334155; }
          .practice-head { background: #e0e7ff; font-weight: bold; color: #1e1b4b; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; padding-top: 30px; }
          @media print { body { margin: 15mm; } button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>St. Joseph's College (Autonomous)</h1>
          <p>Affiliated to Bharathidasan University • Tiruchirappalli - 620 002</p>
          <h2>Teaching - Learning Practices, Assessment Components & E-Contents Planned</h2>
          <p>Academic Year: ODD Sem 2026 - 2027 • IQAC Documentation</p>
        </div>

        <div class="meta-box">
          <div class="meta-item"><strong>Faculty Name</strong> ${this.escapeHtml(facName)}</div>
          <div class="meta-item"><strong>Department</strong> ${this.escapeHtml(deptName)}</div>
          <div class="meta-item"><strong>Institutional Email</strong> ${this.escapeHtml(facEmail)}</div>
        </div>

        <div class="section-title">Section A: Teaching - Learning Practices</div>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Practice</th>
              <th style="width: 30%;">Course Code &amp; Title</th>
              <th style="width: 20%;">Class with Section</th>
              <th style="width: 20%;">Teaching Method / Strategy</th>
              <th style="width: 15%;">Approach</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="practice-head">Practice 1</td>
              <td><strong>${this.escapeHtml(tl1Course || '—')}</strong></td>
              <td>${this.escapeHtml(tl1Class || '—')}</td>
              <td>${this.escapeHtml(tl1Method || '—')}</td>
              <td>${this.escapeHtml(tl1Approach || '—')}</td>
            </tr>
            <tr>
              <td class="practice-head">Practice 2</td>
              <td><strong>${this.escapeHtml(tl2Course || '—')}</strong></td>
              <td>${this.escapeHtml(tl2Class || '—')}</td>
              <td>${this.escapeHtml(tl2Method || '—')}</td>
              <td>${this.escapeHtml(tl2Approach || '—')}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Section B: Assessment Components</div>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Practice</th>
              <th style="width: 35%;">Course Code &amp; Title</th>
              <th style="width: 25%;">Class with Section</th>
              <th style="width: 25%;">Assessment Component</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="practice-head">Practice 1</td>
              <td><strong>${this.escapeHtml(ass1Course || '—')}</strong></td>
              <td>${this.escapeHtml(ass1Class || '—')}</td>
              <td>${this.escapeHtml(ass1Comp || '—')}</td>
            </tr>
            <tr>
              <td class="practice-head">Practice 2</td>
              <td><strong>${this.escapeHtml(ass2Course || '—')}</strong></td>
              <td>${this.escapeHtml(ass2Class || '—')}</td>
              <td>${this.escapeHtml(ass2Comp || '—')}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Section C: E-Content (4 Quadrant Approach)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Course Code &amp; Title</th>
              <th style="width: 15%;">Unit</th>
              <th style="width: 45%;">E-Content Topic</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${this.escapeHtml(ecCourse || '—')}</strong></td>
              <td>Unit ${this.escapeHtml(ecUnit || '—')}</td>
              <td>${this.escapeHtml(ecTopic || '—')}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>Signature of the Faculty</div>
          <div>Signature of the Head of the Department</div>
          <div>Director / Coordinator - IQAC</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  async logout() {
    try {
      await fetch('api/course_plan.php?action=logout');
      this.currentUser = null;
      this.plans = [];
      this.navigateTo('/course-plan/login');
    } catch (e) {
      this.currentUser = null;
      this.plans = [];
      this.navigateTo('/course-plan/login');
    }
  }
}

// Global instance
window.coursePlanApp = new CoursePlanApp();


// Global click handler to close open teaching methodology and learning resources autocomplete dropdowns
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dtp-method-container')) {
    document.querySelectorAll('[id^="dtp-method-menu-"]').forEach(m => m.classList.add('hidden'));
  }
  if (!e.target.closest('.dtp-res-container')) {
    document.querySelectorAll('[id^="dtp-res-menu-"]').forEach(m => m.classList.add('hidden'));
  }
});
