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

  constructor() {
    this.departments = [];
    this.selectedDept = localStorage.getItem('CP_SELECTED_DEPT') || 'Computer Science';
    this.currentUser = null; // null (Faculty/Public), { role: 'hod', department_name: ... }, { role: 'admin' }
    this.plans = [];
    this.activePlan = null;
    this.viewMode = 'form'; // Default directly to 'form' for faculty data entry
    this.activeFormTab = 'part1'; // 'part1' | 'part2' | 'part3' | 'declaration'
    this.adminFilter = 'Approved'; // Requirement 2: default to Approved for Admin
    this.adminDeptFilter = 'all';
    this.adminTab = 'dept'; // 'dept' | 'faculty' | 'course' | 'manage'
    this.adminManageSubTab = 'faculty'; // 'faculty' | 'course' | 'dept'
    this.hodTab = 'courses'; // 'courses' | 'roster'
    this.syllabusCourses = [];
    this.syllabusLoaded = false;
  }

  async init() {
    await this.loadDepartmentsData();
    await this.loadSyllabusData();
    await this.checkAuth();
    await this.fetchPlans();
    if (!this.currentUser) {
      if (!this.activePlan) {
        this.activePlan = this.createDefaultPlan();
      }
      this.viewMode = 'form';
      this.activeFormTab = 'part1';
    } else {
      this.viewMode = 'dashboard';
    }
    this.render();

    // Check if URL specifies login (/login or ?login or #login)
    const urlParams = new URLSearchParams(window.location.search);
    const isLoginUrl = urlParams.has('login') || 
                       window.location.pathname.endsWith('/login') || 
                       window.location.pathname.endsWith('/login/') || 
                       window.location.hash === '#login';
    if (isLoginUrl && !this.currentUser) {
      this.openLoginModal();
    }
  }

  async loadSyllabusData() {
    try {
      const res = await fetch('data/syllabus_master.json');
      this.syllabusCourses = await res.json();
      this.syllabusLoaded = true;
    } catch (e) {
      console.warn('Could not load syllabus_master.json', e);
      this.syllabusCourses = [];
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
      'B.Voc SD & SA': ['B.Voc. SD & SA (Software Development)'],
      'Visual Communication': ['B.Sc. Visual Communication', 'B.Voc. Viscom Technology', 'M.Sc. Visual Communication'],
      'Electronics': ['B.Sc. Electronics', 'M.Sc. Electronics'],
      'Counselling Psy': ['M.Sc. Counselling Psychology'],
      'HRM': ['M.A. Human Resource Management'],
      'Physical Education': ['B.Sc. Physical Education'],
      'Human Excellence': ['Human Excellence & Value Education']
    };

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
    const s = String(sem).toUpperCase();
    if (s === 'VI' || s.includes('VI') || s.includes('6')) return 6;
    if (s === 'IV' || s.includes('IV') || s.includes('4')) return 4;
    return 2;
  }

  isDeptMatch(courseDept, selectedDept) {
    if (!courseDept || !selectedDept) return false;
    const cd = courseDept.toLowerCase().trim();
    const sd = selectedDept.toLowerCase().trim();
    if (cd === sd) return true;
    if (cd.includes(sd) || sd.includes(cd)) return true;
    if (sd.includes('counselling') && cd.includes('counselling')) return true;
    if (sd.includes('visual') && cd.includes('visual')) return true;
    if (sd.includes('human resource') && cd.includes('hrm')) return true;
    if (sd.includes('hrm') && cd.includes('human resource')) return true;
    if (sd.includes('human excellence') && cd.includes('human excellence')) return true;
    return false;
  }

  getRelevantSyllabusCourses() {
    if (!this.syllabusCourses || this.syllabusCourses.length === 0) return [];
    const dept = (this.activePlan && this.activePlan.department_name) ? this.activePlan.department_name : this.selectedDept;
    const sem = (this.activePlan && this.activePlan.semester) ? this.activePlan.semester : 'II';
    const prog = (this.activePlan && this.activePlan.programme) ? this.activePlan.programme : '';
    const semNum = this.getSemesterNum(sem);

    return this.syllabusCourses.filter(c => {
      // 1. Department match
      if (!this.isDeptMatch(c.department, dept)) return false;

      // 2. Semester filtering (only show courses for corresponding semester II, IV, or VI)
      if (c.semester_num && c.semester_num !== semNum) return false;

      // 3. Optional Programme match (if user has selected a specific programme)
      if (prog && dept === 'Computer Science') {
        if (prog.includes('MCA') && !c.course_code.includes('PCA')) return false;
        if (prog.includes('B.Sc') && !c.course_code.includes('UCS')) return false;
      } else if (prog && dept === 'Information Technology') {
        if (prog.includes('M.Sc') && !c.course_code.includes('PCS')) return false;
        if ((prog.includes('BCA') || prog.includes('B.C.A')) && !c.course_code.includes('UBC')) return false;
      }

      return true;
    });
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

    if (course.cos && course.cos.length > 0) {
      this.activePlan.course_outcomes = JSON.parse(JSON.stringify(course.cos));
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
      alert("✓ Auto-fetched syllabus details for " + course.course_code + ":\n• Course Title: " + (course.course_title || '—') + "\n• Credits: " + this.activePlan.credits + "\n• Teaching Hours: " + weeklyHrs + " Hrs/Week (" + (weeklyHrs*15) + " Total)\n• Unit Hours: " + perUnitHours + " Hrs/Unit (Default Actual Hours pre-filled)\n• Course Outcomes: " + (course.cos ? course.cos.length : 0) + " COs loaded!");
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

  applyAssessmentRules(isPG) {
    if (!this.activePlan.assessment_plan || this.activePlan.assessment_plan.length === 0) {
      this.activePlan.assessment_plan = this.getDefaultAssessmentPlan(isPG);
      return;
    }

    this.activePlan.assessment_plan.forEach(asst => {
      if (asst.sno === '1') {
        asst.component = 'C1 – K1, K2';
        asst.marks = '15';
        asst.category = 'MCQ through JosTEL';
        asst.uneditable = true;
      } else if (asst.sno === '2') {
        asst.component = 'Mid Sem';
        asst.marks = '30';
        asst.category = 'Written Examination';
        asst.uneditable = true;
      } else if (asst.sno === '3') {
        asst.marks = isPG ? '6' : '10';
        asst.component = 'C2 - K4';
      } else if (asst.sno === '4') {
        asst.marks = isPG ? '6' : '10';
        asst.component = 'C2 - K5';
      } else if (asst.sno === '5') {
        asst.component = 'C2 - K6';
        asst.marks = isPG ? '8' : '—';
        asst.disabled = !isPG;
        if (!isPG) asst.category = 'Not Applicable for UG (PG Course Only)';
      } else if (asst.sno === '6') {
        asst.marks = '5';
      } else if (asst.sno === '7') {
        asst.component = 'End Sem';
        asst.marks = '30';
        asst.category = 'Written Examination';
        asst.uneditable = true;
      }
    });
  }

  getDefaultAssessmentPlan(isPG = false) {
    return [
      { sno: '1', component: 'C1 – K1, K2', marks: '15', category: 'MCQ through JosTEL', unit_coverage: 'Unit I & II', from_date: '09-01-2027', to_date: '13-01-2027', cos_assessed: 'CO1, CO2', uneditable: true },
      { sno: '2', component: 'Mid Sem', marks: '30', category: 'Written Examination', unit_coverage: 'Unit I, II, III', from_date: '21-01-2027', to_date: '30-01-2027', cos_assessed: 'CO1, CO2, CO3', uneditable: true },
      { sno: '3', component: 'C2 - K4', marks: isPG ? '6' : '10', category: 'Assignment', unit_coverage: 'Unit III', from_date: '', to_date: '', cos_assessed: 'CO4' },
      { sno: '4', component: 'C2 - K5', marks: isPG ? '6' : '10', category: 'Problem Solving / Case Analysis', unit_coverage: 'Unit IV', from_date: '', to_date: '', cos_assessed: 'CO5' },
      { sno: '5', component: 'C2 - K6', marks: isPG ? '8' : '—', category: isPG ? 'Creative Model / Simulation' : 'Not Applicable for UG (PG Course Only)', unit_coverage: isPG ? 'Unit V' : '—', from_date: '', to_date: '', cos_assessed: isPG ? 'CO6' : '—', disabled: !isPG },
      { sno: '6', component: 'Library Referencing - K3', marks: '5', category: 'Library Notes / Reference Work', unit_coverage: 'Units I - V', from_date: '', to_date: '', cos_assessed: 'CO3' },
      { sno: '7', component: 'End Sem', marks: '30', category: 'Written Examination', unit_coverage: 'All Units (I - V)', from_date: '16-03-2027', to_date: '24-03-2027', cos_assessed: isPG ? 'CO1 to CO6' : 'CO1 to CO5', uneditable: true }
    ];
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
          class="hidden absolute left-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl z-40 p-2 space-y-2 w-72 sm:w-80"
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

  formatDateToDDMMYYYY(dateStr) {
    if (!dateStr) return '';
    const trimmed = String(dateStr).trim();
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
    this.render();
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
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn space-y-5">
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
            <div class="grid grid-cols-2 gap-3">
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
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn space-y-5">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="book-plus" class="w-5 h-5 text-indigo-600"></i>
              <span>${isEdit ? 'Edit Syllabus Course' : 'Add New Course to Syllabus'}</span>
            </h3>
            <button type="button" onclick="document.getElementById('${modalId}').innerHTML = ''" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
          </div>

          <div class="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <input type="hidden" id="ac-old-code" value="${isEdit ? existingCourse.course_code : ''}" />
            <div class="grid grid-cols-2 gap-3">
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

            <div class="grid grid-cols-3 gap-3">
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
        if (this.currentUser.role === 'hod' && this.currentUser.department_name) {
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

    if (this.viewMode === 'form') {
      root.innerHTML = this.renderFormHtml();
      this.calculateTotalHours();
    } else if (this.viewMode === 'print') {
      root.innerHTML = this.renderPrintHtml();
    } else {
      // Dashboard view based on user role
      if (this.currentUser && this.currentUser.role === 'admin') {
        root.innerHTML = this.renderAdminDashboardHtml();
      } else if (this.currentUser && this.currentUser.role === 'hod') {
        root.innerHTML = this.renderHODDashboardHtml();
      } else {
        if (!this.currentUser) {
          this.viewMode = 'form';
          root.innerHTML = this.renderFormHtml();
          this.calculateTotalHours();
        } else {
          root.innerHTML = this.renderFacultyDashboardHtml();
        }
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
      authStatusEl.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-xl text-xs font-bold ${isHOD ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-purple-100 text-purple-900 border border-purple-300'} flex items-center gap-1.5">
            <i data-lucide="${isHOD ? 'shield-check' : 'crown'}" class="w-3.5 h-3.5"></i>
            <span>${this.currentUser.display_name}</span>
          </span>
          <button 
            type="button" 
            onclick="coursePlanApp.logout()" 
            class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition border border-rose-200 cursor-pointer"
          >
            Logout
          </button>
        </div>
      `;
    } else {
      authStatusEl.innerHTML = '';
    }
  }

  // ================= 1. FACULTY DASHBOARD (DIRECT DATA ENTRY) =================
  renderFacultyDashboardHtml() {
    const deptObj = this.getCurrentDepartmentObj();
    const plans = this.plans;

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
        <!-- Faculty Instructions Banner -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Department Faculty Data Entry
              </span>
              <span class="text-xs font-semibold text-slate-400">•</span>
              <span class="text-xs font-bold text-slate-700">${this.selectedDept}</span>
            </div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">
              Course Plan – Academic Year 2026–2027 (Even Semester)
            </h1>
            <p class="text-xs text-slate-500 font-medium">
              Dear Professor, prepare theory course plans for the upcoming semester and submit directly to your Head of Department (HOD) for review and approval.
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <button 
              type="button" 
              onclick="coursePlanApp.createNewPlan()" 
              class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm shadow-indigo-600/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>+ Fill New Course Plan</span>
            </button>
          </div>
        </div>

        <!-- Department Quick Switcher & Stats -->
        <div class="bg-slate-100/80 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i data-lucide="building" class="w-4 h-4 text-indigo-600"></i>
              <span>Select Your Department:</span>
            </label>
            <select 
              onchange="coursePlanApp.switchDepartment(this.value)" 
              class="text-xs font-bold px-3 py-2 bg-white rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs cursor-pointer"
            >
              ${this.departments.map(d => `
                <option value="${d.name}" ${d.name === this.selectedDept ? 'selected' : ''}>
                  ${d.name} (${d.faculty_count} Faculty)
                </option>
              `).join('')}
            </select>
          </div>

          <div class="flex items-center gap-3 text-xs">
            <span class="font-bold text-slate-600">${plans.length} Course Plan(s) in this Department</span>
            <span class="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[11px]">${plans.filter(p => p.hod_status === 'Pending').length} Awaiting HOD</span>
            <span class="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[11px]">${plans.filter(p => p.hod_status === 'Approved').length} HOD Approved</span>
          </div>
        </div>

        <!-- Course Plans List Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="file-spreadsheet" class="w-4 h-4 text-indigo-600"></i>
              <span>Submitted & Draft Course Plans (${this.selectedDept})</span>
            </h2>
            <button type="button" onclick="coursePlanApp.fetchPlans().then(() => coursePlanApp.render())" class="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1">
              <i data-lucide="refresh-cw" class="w-3 h-3"></i> Refresh List
            </button>
          </div>

          ${plans.length === 0 ? `
            <div class="p-12 text-center space-y-3">
              <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <i data-lucide="file-plus" class="w-6 h-6"></i>
              </div>
              <h3 class="text-base font-bold text-slate-800">No Course Plans Added for ${this.selectedDept}</h3>
              <p class="text-xs text-slate-500 max-w-md mx-auto">
                Click below to begin filling out a theory course plan. Select your name from the faculty roster and complete Part I, II, and III as per the IQAC syllabus format.
              </p>
              <button 
                type="button" 
                onclick="coursePlanApp.createNewPlan()" 
                class="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition"
              >
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Fill Course Plan</span>
              </button>
            </div>
          ` : `
            <div class="overflow-x-auto w-full">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th class="p-3 text-center w-12">S.No</th>
                    <th class="p-3">Course Code & Title</th>
                    <th class="p-3">Programme / Year</th>
                    <th class="p-3">Faculty Member</th>
                    <th class="p-3 text-center">Hours/Wk</th>
                    <th class="p-3 text-center">Submission Status</th>
                    <th class="p-3 text-center">HOD Approval</th>
                    <th class="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${plans.map((p, idx) => `
                    <tr class="hover:bg-slate-50/70 transition">
                      <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                      <td class="p-3 cursor-pointer group" onclick="coursePlanApp.editPlan(${p.id})" title="Click to view/edit this course plan">
                        <div class="font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                          <span>${p.course_code || '—'}</span>
                          <i data-lucide="external-link" class="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"></i>
                        </div>
                        <div class="text-slate-600 text-[11px] font-semibold group-hover:text-indigo-900">${p.course_title || 'Untitled Course'}</div>
                      </td>
                      <td class="p-3 text-slate-700">
                        <div class="font-semibold">${p.programme || '—'}</div>
                        <div class="text-[11px] text-slate-400">${p.year_class || ''}</div>
                      </td>
                      <td class="p-3 text-slate-900 font-bold">${p.faculty_name || '—'}</td>
                      <td class="p-3 text-center font-mono font-bold">${p.teaching_hours || '—'}</td>
                      <td class="p-3 text-center">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Submitted' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }">
                          ${p.status || 'Draft'}
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.hod_status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.hod_status === 'Revision Needed'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }">
                          ${p.hod_status === 'Approved' ? '✓ HOD Approved' : p.hod_status === 'Revision Needed' ? '⚠ Revision Requested' : '⏳ Pending Review'}
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        <div class="inline-flex items-center gap-1.5">
                          <button 
                            type="button" 
                            onclick="coursePlanApp.editPlan(${p.id})" 
                            class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            onclick="coursePlanApp.previewPlan(${p.id})" 
                            class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                          >
                            View / Print
                          </button>
                          ${p.status === 'Draft' ? `
                            <button 
                              type="button" 
                              onclick="coursePlanApp.deletePlan(${p.id})" 
                              class="p-1 text-slate-400 hover:text-red-600 rounded" 
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
              <table class="w-full text-left text-xs border-collapse">
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
                        <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                        <td class="p-3 font-bold text-slate-900">${fac.name}</td>
                        <td class="p-3 text-slate-600">Shift ${fac.shift || 'I'} • ${fac.category || 'Faculty'}</td>
                        <td class="p-3 font-mono text-slate-600">${fac.email || '—'}</td>
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
                        <td class="p-3 text-center">${statusBadge}</td>
                        <td class="p-3 text-center">
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
                <table class="w-full text-left text-xs border-collapse">
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
                        <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                        <td class="p-3 cursor-pointer group" onclick="coursePlanApp.openHODReviewModal(${p.id})" title="Click to review this course plan">
                          <div class="font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                            <span>${p.course_code || '—'}</span>
                            <i data-lucide="external-link" class="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"></i>
                          </div>
                          <div class="text-slate-600 text-[11px] font-semibold group-hover:text-indigo-900">${p.course_title || 'Untitled'}</div>
                        </td>
                        <td class="p-3 text-slate-700">
                          <div>${p.programme || '—'}</div>
                          <div class="text-[10px] text-slate-400">${p.year_class || ''}${p.section && p.section !== 'N/A' ? ' (' + p.section + ')' : ''} • Semester ${p.semester || ''}</div>
                        </td>
                        <td class="p-3 font-bold text-slate-800">${p.faculty_name || '—'}</td>
                        <td class="p-3 text-center">
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Submitted' || p.status === 'Approved by HOD' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'}">
                            ${p.status || 'Draft'}
                          </span>
                        </td>
                        <td class="p-3 text-center">
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
                        <td class="p-3 text-center">
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

          <div class="flex items-center gap-3">
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
              <span>3. Course-wise Master View (${approvedPlans.length})</span>
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

        <!-- ================= 3. COURSE-WISE MASTER VIEW (APPROVED COURSES ONLY) ================= -->
        ${this.adminTab === 'course' ? `
          <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full">
            <div class="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i data-lucide="book-check" class="w-4 h-4 text-emerald-600"></i>
                  <span>HOD-Approved Course Plans Master Registry</span>
                </h2>
                <p class="text-[11px] text-slate-500">Only verified and HOD-approved course plans across all academic departments</p>
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <select 
                  onchange="coursePlanApp.adminDeptFilter = this.value; coursePlanApp.render();" 
                  class="text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                >
                  <option value="all">All Departments (${this.departments.length})</option>
                  ${this.departments.map(d => `
                    <option value="${d.name}" ${this.adminDeptFilter === d.name ? 'selected' : ''}>${d.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            ${approvedPlans.length === 0 ? `
              <div class="p-12 text-center text-slate-400 font-bold">
                No approved course plans found yet across departments. Once HODs approve submissions, they will be listed here automatically.
              </div>
            ` : `
              <div class="overflow-x-auto w-full">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th class="p-3 text-center w-12">S.No</th>
                      <th class="p-3">Course Code & Title</th>
                      <th class="p-3">Department</th>
                      <th class="p-3">Faculty In-Charge</th>
                      <th class="p-3">Programme / Year</th>
                      <th class="p-3 text-center">Hrs & Credits</th>
                      <th class="p-3 text-center">HOD Approval Stamp</th>
                      <th class="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    ${approvedPlans
                      .filter(p => this.adminDeptFilter === 'all' || (p.department_name && (p.department_name.toLowerCase() === this.adminDeptFilter.toLowerCase() || p.department_name.toLowerCase().includes(this.adminDeptFilter.toLowerCase()))))
                      .map((p, idx) => `
                        <tr class="hover:bg-slate-50/70 transition">
                          <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                          <td class="p-3">
                            <div class="font-bold text-slate-900">${p.course_code || '—'}</div>
                            <div class="text-slate-600 text-[11px] font-semibold">${p.course_title || 'Untitled'}</div>
                          </td>
                          <td class="p-3 text-slate-800 font-bold">${p.department_name || '—'}</td>
                          <td class="p-3 font-semibold text-slate-900">${p.faculty_name || '—'}</td>
                          <td class="p-3 text-slate-600">
                            <div>${p.programme || '—'}</div>
                            <div class="text-[10px] text-slate-400">${p.year_class || ''}${p.section && p.section !== 'N/A' ? ' (' + p.section + ')' : ''} • Semester ${p.semester || ''}</div>
                          </td>
                          <td class="p-3 text-center">
                            <span class="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                              ${p.teaching_hours ? p.teaching_hours.split('&')[1] || p.teaching_hours : '4 Hrs'} • ${p.credits || '3'} Cr
                            </span>
                          </td>
                          <td class="p-3 text-center">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              ✓ Approved by ${p.hod_name || 'HOD'}
                            </span>
                          </td>
                          <td class="p-3 text-center">
                            <div class="flex items-center justify-center gap-1.5">
                              <button 
                                type="button" 
                                onclick="coursePlanApp.previewPlan(${p.id})" 
                                class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
                              >
                                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                                <span>Inspect Plan</span>
                              </button>
                              <button 
                                type="button" 
                                onclick="coursePlanApp.editPlan(${p.id})" 
                                class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                                title="Edit Course Plan"
                              >
                                <i data-lucide="edit" class="w-3.5 h-3.5"></i>
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
        ` : ''}

        <!-- ================= 4. MANAGE MASTER DATA (FACULTY / COURSES / DEPTS) ================= -->
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
        <!-- Institutional Header Banner (matching PDF Header) -->
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md text-center space-y-1.5">
          <div class="text-xs uppercase tracking-widest font-bold text-indigo-200">Internal Quality Assurance Cell (IQAC)</div>
          <div class="text-xl font-black tracking-tight">St. Joseph’s College (Autonomous), Tiruchirappalli</div>
          <div class="text-sm font-extrabold text-amber-300 pt-1 tracking-wide">
            COURSE PLAN – ACADEMIC YEAR 2026–2027 (Even Semester)
          </div>
          
          <!-- Dynamic Instructions Box: Hidden by default, shown upon Faculty selection -->
          <div id="cp-banner-instructions-box" class="${plan.faculty_name ? '' : 'hidden'} text-xs text-indigo-100 max-w-2xl mx-auto pt-3 bg-white/10 rounded-2xl p-4 mt-3 border border-white/20 animate-fadeIn space-y-1.5 shadow-inner">
            <div id="cp-banner-welcome" class="text-base font-black text-amber-300 flex items-center justify-center gap-2">
              ${plan.faculty_name ? `<span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-indigo-950 text-xs font-black uppercase tracking-wider shadow-sm"><i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Welcome, ${plan.faculty_name}</span>` : ''}
            </div>
            <div id="cp-banner-instructions" class="text-[11.5px] leading-relaxed text-indigo-100 font-medium">
              ${plan.faculty_name ? `<strong>Instructions:</strong> Dear ${plan.faculty_name}, The course plan shall be prepared for all the theory courses before the commencement of the course and submitted to the Head of the Department for review and approval.` : ''}
            </div>
          </div>
        </div>

        <!-- Part-wise Navigation Tabs & Form Actions -->
        <div class="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-16 z-20">
          <!-- Navigation Tabs with Stage Lock Icons -->
          <div class="flex flex-wrap items-center gap-1.5">
            <!-- Part I Tab (Always Unlocked) -->
            <button 
              type="button" 
              onclick="coursePlanApp.switchFormTab('part1')" 
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${this.activeFormTab === 'part1' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
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
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${part2Locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-65' : (this.activeFormTab === 'part2' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 cursor-pointer' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer')}"
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
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${part3Locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-65' : (this.activeFormTab === 'part3' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 cursor-pointer' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer')}"
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
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${part4Locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-65' : (this.activeFormTab === 'declaration' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 cursor-pointer' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer')}"
              title="${part4Locked ? 'Locked: Complete Part-III Activities & Assessment to unlock' : 'IV Declaration & HOD Approval'}"
            >
              <span class="w-4 h-4 rounded-full ${part4Locked ? 'bg-slate-200 text-slate-500' : (part4Done ? 'bg-emerald-500 text-white' : 'bg-white/20')} flex items-center justify-center text-[10px] font-black">
                ${part4Locked ? '<i data-lucide="lock" class="w-2.5 h-2.5"></i>' : (part4Done ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : 'IV')}
              </span>
              <span>IV Declaration & HOD Approval</span>
              ${part4Locked ? '<i data-lucide="lock" class="w-3 h-3 text-slate-400 ml-0.5"></i>' : ''}
            </button>
          </div>

          <!-- Action Buttons Next to Tabs -->
          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <!-- New Form Button -->
            <button 
              type="button" 
              onclick="coursePlanApp.createNewPlan()" 
              class="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer active:scale-95"
              title="Clear form and start a new course plan"
            >
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>New Form</span>
            </button>

            <!-- Print Preview (Enabled ONLY on Part-IV) -->
            ${canPrintAndSubmit ? `
              <button 
                type="button" 
                onclick="coursePlanApp.previewCurrentPlan()" 
                class="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer active:scale-95"
                title="Preview printable course plan"
              >
                <i data-lucide="printer" class="w-3.5 h-3.5 text-slate-600"></i>
                <span>Print Preview</span>
              </button>
            ` : `
              <button 
                type="button" 
                disabled 
                class="text-xs px-3 py-2 bg-slate-100 text-slate-400 font-bold rounded-xl flex items-center gap-1.5 border border-slate-200 cursor-not-allowed opacity-60"
                title="Print Preview is enabled after reaching Part-IV (Declaration & HOD Approval)"
              >
                <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>Print Preview</span>
              </button>
            `}

            <!-- Save as Draft (Always Available) -->
            <button 
              type="button" 
              onclick="coursePlanApp.saveCurrentPlan('Draft')" 
              class="text-xs px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer active:scale-95"
              title="Save current progress as a draft"
            >
              <i data-lucide="save" class="w-4 h-4 text-slate-500"></i>
              <span>Save as Draft</span>
            </button>

            <!-- Submit to HOD (Enabled ONLY on Part-IV) -->
            ${canPrintAndSubmit ? `
              <button 
                type="button" 
                onclick="coursePlanApp.saveCurrentPlan('Submitted')" 
                class="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95 animate-pulse"
                title="Submit completed course plan to Head of Department"
              >
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span>Submit to HOD</span>
              </button>
            ` : `
              <button 
                type="button" 
                disabled 
                class="text-xs px-4 py-2 bg-slate-200 text-slate-400 font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-60"
                title="Submit to HOD is enabled after reaching Part-IV (Declaration & HOD Approval)"
              >
                <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>Submit to HOD</span>
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

            <!-- A. General Details -->
            <div class="space-y-4">
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. General Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <!-- Department Dropdown -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Department *</label>
                  <select 
                    id="cp-dept-name" 
                    onchange="coursePlanApp.onFormDeptChange(this.value)" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                  >
                    ${this.departments.map(d => `
                      <option value="${d.name}" ${d.name === (plan.department_name || this.selectedDept) ? 'selected' : ''}>
                        ${d.name}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Faculty Name Dropdown (Populated from Excel) -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Name of the Faculty Member *</label>
                  <select 
                    id="cp-faculty-name" 
                    onchange="coursePlanApp.onFormFacultyChange(this.value)" 
                    class="w-full text-xs px-3 py-2 border border-indigo-400 bg-indigo-50/30 rounded-xl font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="">-- Choose Faculty Member (${facultyList.length}) --</option>
                    ${facultyList.map(f => `
                      <option value="${f.name}" ${f.name === plan.faculty_name ? 'selected' : ''}>
                        ${f.name} ${f.shift ? `(Shift ${f.shift})` : ''}
                      </option>
                    `).join('')}
                  </select>
                  <div id="cp-faculty-email-hint" class="text-[10px] text-slate-500 mt-1 font-mono">
                    ${plan.faculty_email || ''}
                  </div>
                  <div id="cp-faculty-welcome-inline" class="${plan.faculty_name ? '' : 'hidden'} mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                    ${plan.faculty_name ? `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i> Welcome, <strong>${plan.faculty_name}</strong>!` : ''}
                  </div>
                </div>

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

                <!-- Year and Class Dropdown (Dynamically filtered by Programme) -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Year and Class *</label>
                  <select 
                    id="cp-year-class" 
                    onchange="coursePlanApp.onYearClassChange(this.value)" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:border-indigo-600 focus:outline-none cursor-pointer"
                  >
                    ${isUGProg ? `
                      <option value="I UG" ${plan.year_class === 'I UG' ? 'selected' : ''}>I UG</option>
                      <option value="II UG" ${plan.year_class === 'II UG' ? 'selected' : ''}>II UG</option>
                      <option value="III UG" ${plan.year_class === 'III UG' ? 'selected' : ''}>III UG</option>
                    ` : `
                      <option value="I PG" ${plan.year_class === 'I PG' ? 'selected' : ''}>I PG</option>
                      <option value="II PG" ${plan.year_class === 'II PG' ? 'selected' : ''}>II PG</option>
                      ${(plan.programme && plan.programme.includes('MCA')) ? `<option value="III PG" ${plan.year_class === 'III PG' ? 'selected' : ''}>III PG</option>` : ''}
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
                    <option value="N/A" ${plan.section === 'N/A' || !plan.section ? 'selected' : ''}>N/A</option>
                    <option value="Shift I - Section A" ${plan.section === 'Shift I - Section A' ? 'selected' : ''}>Shift I - Section A</option>
                    <option value="Shift I - Section B" ${plan.section === 'Shift I - Section B' ? 'selected' : ''}>Shift I - Section B</option>
                    <option value="Shift II - Section A" ${plan.section === 'Shift II - Section A' ? 'selected' : ''}>Shift II - Section A</option>
                    <option value="Shift II - Section B" ${plan.section === 'Shift II - Section B' ? 'selected' : ''}>Shift II - Section B</option>
                    <option value="Shift II - Section C" ${plan.section === 'Shift II - Section C' ? 'selected' : ''}>Shift II - Section C</option>
                    <option value="Shift II - Section D" ${plan.section === 'Shift II - Section D' ? 'selected' : ''}>Shift II - Section D</option>
                  </select>
                </div>

                <!-- Course Auto-Fetch Dropdown (Syllabus Integration by Dept & Sem) -->
                <div class="md:col-span-2 bg-indigo-50/70 p-3.5 rounded-2xl border-2 border-indigo-200 space-y-1.5">
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

                <!-- Course Code Input (Read-only once auto-fetched from syllabus) -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Course Code *</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i> Auto-locked</span>` : ''}
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

                <!-- Course Title (Uneditable when auto-fetched) -->
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Course Title *</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i> Auto-locked</span>` : ''}
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

                <!-- Course Category (Uneditable when auto-fetched) -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Course Category</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i> Auto-locked</span>` : ''}
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

                <!-- Teaching Hours (Uneditable when auto-fetched) -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Total Teaching Hours & Hours/Week</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i> Auto-locked</span>` : ''}
                  </label>
                  <input 
                    type="text" 
                    id="cp-teaching-hours" 
                    value="${plan.teaching_hours || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold ${isCourseLocked ? 'bg-slate-100 cursor-not-allowed text-slate-700' : 'bg-white focus:border-indigo-600 focus:outline-none'}" 
                    ${isCourseLocked ? 'readonly' : ''}
                    placeholder="e.g. 60 Hours & 4 Hours/Week"
                  />
                </div>

                <!-- Course Credits (Uneditable when auto-fetched) -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Credits *</span>
                    ${isCourseLocked ? `<span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i> Auto-locked</span>` : ''}
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
                ` : `
                  <button 
                    type="button" 
                    onclick="coursePlanApp.addCORow()" 
                    class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200 cursor-pointer"
                  >
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add CO
                  </button>
                `}
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse mobile-card-table">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2.5 w-24">CO Code</th>
                      <th class="p-2.5">Course Outcome *</th>
                      <th class="p-2.5 w-44">K-Levels *</th>
                      <th class="p-2.5 w-12 text-center">Action</th>
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
                        <td class="p-2 text-center" data-label="Action">
                          ${isCourseLocked ? `
                            <span class="text-slate-400 font-bold" title="Locked from syllabus master">🔒</span>
                          ` : `
                            <button type="button" onclick="coursePlanApp.deleteCORow(${idx})" class="p-1 text-slate-400 hover:text-red-600 rounded">
                              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                          `}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <datalist id="dtp-units-datalist">
                <option value="Unit I">
                <option value="Unit II">
                <option value="Unit III">
                <option value="Unit IV">
                <option value="Unit V">
                <option value="Unit I & II">
                <option value="Unit II & III">
                <option value="Unit III & IV">
                <option value="Unit IV & V">
                <option value="Unit I, II">
                <option value="Unit II, III">
                <option value="Unit III, IV">
                <option value="Unit IV, V">
              </datalist>
            </div>

            <!-- Next Part Button -->
            <div class="flex justify-end pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onclick="coursePlanApp.proceedToTab('part2')" 
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
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
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. Detailed Teaching Plan</h4>
                  <p class="text-[11px] text-slate-500">Instruction: Divide each unit into manageable topics (From & To) and allocate appropriate teaching hours.</p>
                </div>
                <button 
                  type="button" 
                  onclick="coursePlanApp.addTeachingPlanRow()" 
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200 cursor-pointer"
                >
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Topic Row
                </button>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200 max-h-[580px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse mobile-card-table">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0 z-10">
                    <tr>
                      <th class="p-2.5 w-28">Month / Days</th>
                      <th class="p-2.5 w-24">Unit</th>
                      <th class="p-2.5 w-44">From (Topic) *</th>
                      <th class="p-2.5 w-44">To (Topic) *</th>
                      <th class="p-2.5 w-16 text-center">Hours *</th>
                      <th class="p-2.5 w-16 text-center">COs *</th>
                      <th class="p-2.5 w-60">Teaching Methodology *</th>
                      <th class="p-2.5 w-36">Learning Resources *</th>
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
                              <div class="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 shadow-2xs font-black text-indigo-950 text-xs inline-block">
                                ${this.escapeHtml(row.month_days || '—')}
                              </div>
                              <input type="hidden" class="dtp-month" value="${this.escapeHtml(row.month_days || '')}" />
                            </td>
                          ` : ''}

                          <!-- Mobile-only Month/Days cell so mobile card clearly shows month -->
                          <td class="md:hidden p-1.5" data-label="Month / Days">
                            <span class="font-black text-indigo-950 text-xs">${this.escapeHtml(row.month_days || '—')}</span>
                            <input type="hidden" class="dtp-month" value="${this.escapeHtml(row.month_days || '')}" />
                          </td>

                          <td class="p-1.5" data-label="Unit">
                            <input 
                              list="dtp-units-datalist" 
                              class="dtp-unit w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-bold bg-white focus:border-indigo-600 focus:outline-none" 
                              value="${row.unit || 'Unit I'}" 
                              placeholder="e.g. Unit I" 
                              title="Multiple units can be specified for a month (e.g. Unit I & II)"
                            />
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
                          <td class="p-1.5 text-center" data-label="COs Mapped">
                            <input type="text" class="dtp-cos w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-bold text-center focus:border-indigo-600 focus:outline-none" value="${row.cos || 'CO1'}" />
                          </td>
                          <td class="p-1.5" data-label="Teaching Methodology">
                            ${this.renderMethodologyMultiSelect(idx, row.methodology)}
                          </td>
                          <td class="p-1.5" data-label="Learning Resources">
                            ${(() => {
                              const resOptions = [
                                'Text Book / Reference Book', 'PPT / Lecture Notes', 'JosTEL LMS / E-Content',
                                'NPTEL / SWAYAM / Coursera', 'Research Papers / Journal Articles',
                                'Lab Manual / Software Tools', 'Web Links / Online Repositories'
                              ];
                              const curRes = row.resources || '';
                              const isOther = curRes && !resOptions.includes(curRes);
                              return `
                                <select 
                                  class="dtp-res-select w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                                  onchange="coursePlanApp.onDtpResourceChange(this)"
                                >
                                  <option value="" ${!curRes ? 'selected' : ''}>-- Select Resource --</option>
                                  ${resOptions.map(opt => `<option value="${opt}" ${curRes === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                                  <option value="Others" ${isOther ? 'selected' : ''}>Others (Specify)</option>
                                </select>
                                <input 
                                  type="text" 
                                  class="dtp-res-other w-full text-xs px-2 py-1 border border-indigo-400 rounded mt-1 ${isOther ? '' : 'hidden'}" 
                                  placeholder="Specify resource..." 
                                  value="${isOther ? curRes : ''}"
                                />
                              `;
                            })()}
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
                      <th class="p-2.5 w-36 text-center">Actual Hours</th>
                      <th class="p-2.5">Target Completion Date</th>
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
                        <td class="p-2" data-label="Target Date">
                          <input type="date" class="ucp-date w-48 text-xs px-2.5 py-1.5 border border-slate-300 rounded font-mono focus:border-indigo-600 focus:outline-none" value="${u.target_date || ''}" />
                        </td>
                      </tr>
                    `).join('')}
                    <tr class="bg-indigo-50/60 font-bold border-t border-indigo-200">
                      <td class="p-2.5 text-indigo-950 font-black">Total (As per Syllabus)</td>
                      <td class="p-2.5 text-center text-indigo-950 font-black" id="ucp-total-planned">0 Hrs</td>
                      <td class="p-2.5 text-center text-indigo-950 font-black" id="ucp-total-actual">0 Hrs</td>
                      <td class="p-2.5 text-slate-500 text-[11px] italic">Verified before semester audit</td>
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
                onclick="coursePlanApp.proceedToTab('part3')" 
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
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

            <!-- B. Assessment Plan (Completely Uneditable, Auto-populated from Section A) -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span>B. Assessment Plan</span>
                    <span class="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                      <i data-lucide="lock" class="w-3 h-3 text-emerald-600"></i> Auto-synced from Section A • Completely Uneditable
                    </span>
                  </h4>
                  <p class="text-[11px] text-slate-500 italic">
                    Displays activities marked as CIA Assessments in Section A above. Completely uneditable.
                  </p>
                </div>
              </div>

              ${(() => {
                const assessedActs = acts.filter(a => a.is_assessment);
                if (assessedActs.length === 0) {
                  return `
                    <div class="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60 space-y-2">
                      <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <i data-lucide="clipboard-check" class="w-5 h-5"></i>
                      </div>
                      <h5 class="text-xs font-bold text-slate-800">No Assessment Plan Created Yet</h5>
                      <p class="text-[11px] text-slate-500 max-w-md mx-auto">
                        In <strong>A. Learning Activities</strong> above, click <strong>"+ Add Activity"</strong> (or click the edit pencil icon on an activity) and tick <strong>"Convert it as assessment"</strong> to assign CIA components and marks.
                      </p>
                    </div>
                  `;
                }

                const totalMarks = assessedActs.reduce((sum, a) => sum + (parseFloat(a.cia_marks) || 0), 0);

                return `
                  <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-left text-xs border-collapse mobile-card-table">
                      <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th class="p-2.5 w-12 text-center">S.No</th>
                          <th class="p-2.5 w-44">CIA Component</th>
                          <th class="p-2.5 w-24 text-center">Marks</th>
                          <th class="p-2.5">Learning Activity / Assessment Category</th>
                          <th class="p-2.5 w-44">Unit Coverage</th>
                          <th class="p-2.5 w-32">Proposed Date</th>
                          <th class="p-2.5">Expected Outcome</th>
                        </tr>
                      </thead>
                      <tbody id="cp-assts-tbody" class="divide-y divide-slate-100 font-medium bg-slate-50/30">
                        ${assessedActs.map((asst, idx) => `
                          <tr>
                            <td class="p-2.5 text-center font-bold text-slate-400" data-label="S.No">${idx + 1}</td>
                            <td class="p-2.5" data-label="CIA Component">
                              <span class="inline-flex items-center gap-1.5 font-black text-indigo-950 text-xs">
                                <i data-lucide="award" class="w-3.5 h-3.5 text-indigo-600"></i>
                                <span>${this.escapeHtml(asst.cia_component || ('C' + (idx + 1)))}</span>
                              </span>
                            </td>
                            <td class="p-2.5 text-center" data-label="Marks">
                              <span class="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs shadow-2xs">
                                ${this.escapeHtml(asst.cia_marks || '10')} Marks
                              </span>
                            </td>
                            <td class="p-2.5 font-bold text-slate-800" data-label="Assessment Category">
                              ${this.escapeHtml(asst.activity || '—')}
                            </td>
                            <td class="p-2.5 text-slate-700 font-medium" data-label="Unit Coverage">
                              ${this.escapeHtml(asst.topic || '—')}
                            </td>
                            <td class="p-2.5 font-mono text-slate-700 font-bold" data-label="Proposed Date">
                              ${this.formatDateToDDMMYYYY(asst.proposed_date) || '—'}
                            </td>
                            <td class="p-2.5 text-slate-600 text-[11px]" data-label="Expected Outcome">
                              ${this.escapeHtml(asst.outcome || '—')}
                            </td>
                          </tr>
                        `).join('')}
                        <tr class="bg-indigo-50/70 border-t-2 border-indigo-200 font-bold text-indigo-950">
                          <td class="p-2.5 text-center">Σ</td>
                          <td class="p-2.5 font-black">Total CIA Plan</td>
                          <td class="p-2.5 text-center font-black">
                            ${totalMarks} Marks
                          </td>
                          <td class="p-2.5 italic text-slate-500 text-[11px]" colspan="4">
                            Auto-synchronized with Section A above • Completely Uneditable
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
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">C. Digital Resources and ICT Integration</h4>
                  <p class="text-[11px] text-slate-500">JosTEL LMS, PPT, online quizzes, and simulation software.</p>
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
                      const curTool = ict.tool || 'PPT / Interactive Slides';
                      const isOtherTool = !toolOptions.includes(curTool);

                      const platformOptions = [
                        'JosTEL', 'Google Classroom', 'Moodle', 'YouTube',
                        'Kahoot / Quizizz', 'SWAYAM / NPTEL', 'GitHub'
                      ];
                      const curPlatform = ict.platform || 'JosTEL';
                      const isOtherPlatform = !platformOptions.includes(curPlatform);

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
                onclick="coursePlanApp.proceedToTab('declaration')" 
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
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
        <div id="course-plan-print-doc" class="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-sm max-w-5xl mx-auto space-y-6 text-slate-900 font-sans">
          
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
              <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
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
                    <th class="border border-slate-300 p-1.5 text-center">COs</th>
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
                        <td class="border border-slate-300 p-1.5 text-center font-bold">${row.cos || '—'}</td>
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
                    <th class="border border-slate-300 p-2 text-center">Actual Hours</th>
                    <th class="border border-slate-300 p-2">Target Completion Date</th>
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
                  ${((plan.learning_activities || []).filter(a => a.is_assessment)).map((asst, i) => `
                    <tr>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${i + 1}</td>
                      <td class="border border-slate-300 p-1.5 font-bold">${this.escapeHtml(asst.cia_component || '—')}</td>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${this.escapeHtml(asst.cia_marks || '—')}</td>
                      <td class="border border-slate-300 p-1.5 font-bold">${this.escapeHtml(asst.activity || '—')}</td>
                      <td class="border border-slate-300 p-1.5">${this.escapeHtml(asst.topic || '—')}</td>
                      <td class="border border-slate-300 p-1.5 text-center font-mono">${this.formatDateToDDMMYYYY(asst.proposed_date) || '—'}</td>
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

            <div class="grid grid-cols-3 gap-6 pt-4">
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

    const container = document.getElementById(sectionId) || document.getElementById(`section-${this.activeFormTab}`);
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

        if (resEl && resEl.value === 'Others' && (!resOther || !resOther.value.trim())) {
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

    // B. Assessment Plan (Must have at least one activity converted to assessment)
    const assts = (this.activePlan.learning_activities || []).filter(a => a.is_assessment);
    if (assts.length === 0) {
      errors.push('Assessment Plan: Please convert at least one Learning Activity in Section A into an assessment (tick "Convert it as assessment")');
    }

    // C. Digital Resources and ICT Integration
    const ictRows = document.querySelectorAll('#cp-icts-tbody tr');
    let emptyIctTopic = 0, emptyIctTool = 0, emptyIctPlat = 0, emptyIctPurpose = 0;
    ictRows.forEach(row => {
      const topEl = row.querySelector('.ict-topic');
      const toolEl = row.querySelector('.ict-tool-select');
      const platEl = row.querySelector('.ict-plat-select');
      const purpEl = row.querySelector('.ict-purpose');

      if (!topEl || !topEl.value.trim()) { emptyIctTopic++; if (topEl) invalidEls.push(topEl); }
      if (!toolEl || !toolEl.value.trim()) { emptyIctTool++; if (toolEl) invalidEls.push(toolEl); }
      if (!platEl || !platEl.value.trim()) { emptyIctPlat++; if (platEl) invalidEls.push(platEl); }
      if (!purpEl || !purpEl.value.trim()) { emptyIctPurpose++; if (purpEl) invalidEls.push(purpEl); }
    });

    if (emptyIctTopic > 0) errors.push(`Digital Resources / ICT: Topic/Unit missing in ${emptyIctTopic} row(s)`);
    if (emptyIctTool > 0) errors.push(`Digital Resources / ICT: Tool missing in ${emptyIctTool} row(s)`);
    if (emptyIctPlat > 0) errors.push(`Digital Resources / ICT: Platform missing in ${emptyIctPlat} row(s)`);
    if (emptyIctPurpose > 0) errors.push(`Digital Resources / ICT: Purpose missing in ${emptyIctPurpose} row(s)`);

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
    this.activePlan = this.createDefaultPlan();
    this.viewMode = 'form';
    this.activeFormTab = 'part1';
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async editPlan(id) {
    try {
      const res = await fetch(`api/course_plan.php?action=get&id=${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        this.activePlan = json.data;
      } else {
        this.activePlan = this.plans.find(p => p.id === id) || this.createDefaultPlan();
      }
    } catch (e) {
      this.activePlan = this.plans.find(p => p.id === id) || this.createDefaultPlan();
    }
    this.viewMode = 'form';
    this.activeFormTab = 'part1';
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async previewPlan(id) {
    await this.editPlan(id);
    this.viewMode = 'print';
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      this.viewMode = 'form';
      this.activeFormTab = 'part1';
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.viewMode = 'dashboard';
    this.fetchPlans().then(() => this.render());
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const welcomeEl = document.getElementById('cp-banner-welcome');
    const instEl = document.getElementById('cp-banner-instructions');
    const inlineGreeting = document.getElementById('cp-faculty-welcome-inline');

    if (facName && facName.trim()) {
      if (welcomeEl) {
        welcomeEl.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-indigo-950 text-xs font-black uppercase tracking-wider shadow-sm"><i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Welcome, ${facName}</span>`;
      }
      if (instEl) {
        instEl.innerHTML = `<strong>Instructions:</strong> Dear ${facName}, The course plan shall be prepared for all the theory courses before the commencement of the course and submitted to the Head of the Department for review and approval.`;
      }
      if (box) box.classList.remove('hidden');

      if (inlineGreeting) {
        inlineGreeting.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i> Welcome, <strong>${facName}</strong>!`;
        inlineGreeting.classList.remove('hidden');
      }
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } else {
      if (box) box.classList.add('hidden');
      if (welcomeEl) welcomeEl.innerHTML = '';
      if (instEl) instEl.innerHTML = '';
      if (inlineGreeting) {
        inlineGreeting.innerHTML = '';
        inlineGreeting.classList.add('hidden');
      }
    }
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
    return {
      id: null,
      department_name: this.selectedDept,
      faculty_name: '',
      faculty_email: '',
      programme: '',
      year_class: 'I UG',
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
        { month_days: 'November / 10', unit: 'Unit I', from_topic: '', to_topic: '', hours: '', cos: 'CO1', methodology: '', resources: '' },
        { month_days: 'November / 10', unit: 'Unit I', from_topic: '', to_topic: '', hours: '', cos: 'CO1', methodology: '', resources: '' },
        { month_days: 'December / 19', unit: 'Unit II', from_topic: '', to_topic: '', hours: '', cos: 'CO2', methodology: '', resources: '' },
        { month_days: 'December / 19', unit: 'Unit II', from_topic: '', to_topic: '', hours: '', cos: 'CO2', methodology: '', resources: '' },
        { month_days: 'January / 13', unit: 'Unit III', from_topic: '', to_topic: '', hours: '', cos: 'CO3', methodology: '', resources: '' },
        { month_days: 'January / 13', unit: 'Unit III', from_topic: '', to_topic: '', hours: '', cos: 'CO3', methodology: '', resources: '' },
        { month_days: 'February / 22', unit: 'Unit IV', from_topic: '', to_topic: '', hours: '', cos: 'CO4', methodology: '', resources: '' },
        { month_days: 'February / 22', unit: 'Unit IV', from_topic: '', to_topic: '', hours: '', cos: 'CO4', methodology: '', resources: '' },
        { month_days: 'March / 12', unit: 'Unit V', from_topic: '', to_topic: '', hours: '', cos: 'CO5', methodology: '', resources: '' },
        { month_days: 'March / 12', unit: 'Unit V', from_topic: '', to_topic: '', hours: '', cos: 'CO5', methodology: '', resources: '' }
      ],
      unit_completion_plan: [
        { unit: 'Unit I', planned_hours: '15', actual_hours: '15', target_date: '' },
        { unit: 'Unit II', planned_hours: '15', actual_hours: '15', target_date: '' },
        { unit: 'Unit III', planned_hours: '15', actual_hours: '15', target_date: '' },
        { unit: 'Unit IV', planned_hours: '15', actual_hours: '15', target_date: '' },
        { unit: 'Unit V', planned_hours: '15', actual_hours: '15', target_date: '' }
      ],
      learning_activities: [
        { sno: '1', activity: 'Quizzes (MCQs, Short Answer)', topic: 'Unit I & II', outcome: 'Recall and understand foundational concepts (K1, K2)', proposed_date: '2027-01-11', is_assessment: true, cia_component: 'C1 – K1, K2', cia_marks: '15' },
        { sno: '2', activity: 'In-class Exercises / Problem-solving, Assignment', topic: 'Unit III', outcome: 'Apply principles to analyze real-world problems (K4)', proposed_date: '2027-02-05', is_assessment: true, cia_component: 'C2 - K4', cia_marks: '10' },
        { sno: '3', activity: 'Case Study Analysis, Group Discussions / Seminars', topic: 'Unit IV', outcome: 'Critical evaluation and synthesis of findings (K5)', proposed_date: '2027-02-20', is_assessment: true, cia_component: 'C2 - K5', cia_marks: '10' },
        { sno: '4', activity: 'Think-Pair-Share, Concept Maps', topic: 'Unit II', outcome: 'Interactive peer engagement and conceptual clarity', proposed_date: '2027-01-18', is_assessment: false, cia_component: '', cia_marks: '' },
        { sno: '5', activity: 'Projects (Individual/Group), Presentations / Viva Voce', topic: 'Unit V', outcome: 'Design, implement, and present practical solutions', proposed_date: '2027-03-05', is_assessment: false, cia_component: '', cia_marks: '' }
      ],
      assessment_plan: [
        { sno: '1', component: 'C1 – K1, K2', marks: '15', category: 'Quizzes (MCQs, Short Answer)', unit_coverage: 'Unit I & II', from_date: '2027-01-11', to_date: '2027-01-11', cos_assessed: 'Recall and understand foundational concepts (K1, K2)', uneditable: true },
        { sno: '2', component: 'C2 - K4', marks: '10', category: 'In-class Exercises / Problem-solving, Assignment', unit_coverage: 'Unit III', from_date: '2027-02-05', to_date: '2027-02-05', cos_assessed: 'Apply principles to analyze real-world problems (K4)', uneditable: true },
        { sno: '3', component: 'C2 - K5', marks: '10', category: 'Case Study Analysis, Group Discussions / Seminars', unit_coverage: 'Unit IV', from_date: '2027-02-20', to_date: '2027-02-20', cos_assessed: 'Critical evaluation and synthesis of findings (K5)', uneditable: true }
      ],
      ict_integration: [
        { sno: '1', topic: '', tool: 'PPT / Interactive Slides', platform: 'JosTEL', purpose: '' },
        { sno: '2', topic: '', tool: 'Video Lecture', platform: 'JosTEL', purpose: '' },
        { sno: '3', topic: '', tool: 'Online Quiz', platform: 'JosTEL', purpose: '' },
        { sno: '4', topic: '', tool: 'E-Book / PDF Notes', platform: 'JosTEL', purpose: '' }
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

  addTeachingPlanRow() {
    this.harvestFormInputs();
    this.activePlan.detailed_teaching_plan.push({
      month_days: '', unit: 'Unit I', topics: '', from_date: '', to_date: '', hours: '', cos: 'CO1', methodology: 'Lecture / PPT', resources: 'Text Book / PPT'
    });
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
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn space-y-4 max-h-[90vh] overflow-y-auto">
          
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
                  placeholder="🔍 Type to filter 25 learning activities..." 
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

            <!-- Proposed Date -->
            <div>
              <label class="block font-black text-slate-800 mb-1">Proposed Date *</label>
              <input 
                type="date" 
                id="modal-act-date" 
                value="${existing?.proposed_date || ''}" 
                class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:border-indigo-600 focus:outline-none"
              />
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

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- CIA Component Select -->
                <div>
                  <label class="block font-black text-amber-950 mb-1">CIA Component *</label>
                  <select 
                    id="modal-act-cia-comp" 
                    onchange="coursePlanApp.onModalCiaCompChange(this.value)" 
                    class="w-full text-xs px-3 py-2 border border-amber-300 rounded-xl bg-white font-bold text-slate-900 focus:border-amber-600 focus:outline-none cursor-pointer"
                  >
                    <option value="C2 - K4" ${curCiaComp.includes('K4') ? 'selected' : ''}>C2 - K4 (Assignment / Test)</option>
                    <option value="C2 - K5" ${curCiaComp.includes('K5') ? 'selected' : ''}>C2 - K5 (Problem Solving / Case Study)</option>
                    ${isPG ? `<option value="C2 - K6" ${curCiaComp.includes('K6') ? 'selected' : ''}>C2 - K6 (Creative Model / Mini Project)</option>` : ''}
                    <option value="C1 – K1, K2" ${curCiaComp.includes('C1') ? 'selected' : ''}>C1 – K1, K2 (JosTEL MCQ / Online Test)</option>
                    <option value="Library Referencing - K3" ${curCiaComp.includes('Library') ? 'selected' : ''}>Library Referencing - K3</option>
                    <option value="Mid Sem Test" ${curCiaComp.includes('Mid Sem') ? 'selected' : ''}>Mid Sem Test</option>
                    <option value="End Sem Exam" ${curCiaComp.includes('End Sem') ? 'selected' : ''}>End Sem Exam</option>
                    <option value="Additional Assessment" ${(!curCiaComp.includes('C1') && !curCiaComp.includes('C2') && !curCiaComp.includes('Mid') && !curCiaComp.includes('End') && !curCiaComp.includes('Library')) ? 'selected' : ''}>Other Assessment Component</option>
                  </select>
                </div>

                <!-- Marks Input -->
                <div>
                  <label class="block font-black text-amber-950 mb-1">Allocated Marks *</label>
                  <input 
                    type="number" 
                    id="modal-act-cia-marks" 
                    value="${curCiaMarks}" 
                    class="w-full text-xs px-3 py-2 border border-amber-300 rounded-xl bg-white font-black text-slate-900 text-center focus:border-amber-600 focus:outline-none"
                    placeholder="Marks"
                  />
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

  onModalCiaCompChange(comp) {
    const marksInput = document.getElementById('modal-act-cia-marks');
    if (!marksInput) return;
    const isPG = this.activePlan?.is_pg || (this.activePlan?.year_class && this.activePlan.year_class.includes('PG')) || (this.activePlan?.programme && this.activePlan.programme.startsWith('M.'));

    if (comp.includes('C1')) {
      marksInput.value = '15';
    } else if (comp.includes('Mid Sem') || comp.includes('End Sem')) {
      marksInput.value = '30';
    } else if (comp.includes('Library')) {
      marksInput.value = '5';
    } else if (comp.includes('K6')) {
      marksInput.value = isPG ? '8' : '10';
    } else if (comp.includes('K4') || comp.includes('K5')) {
      marksInput.value = isPG ? '6' : '10';
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
    const date = document.getElementById('modal-act-date')?.value || '';
    const isAssessment = document.getElementById('modal-act-is-assessment')?.checked || false;
    const ciaComp = document.getElementById('modal-act-cia-comp')?.value || 'C2 - K4';
    const ciaMarks = document.getElementById('modal-act-cia-marks')?.value || '10';

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
    if (!date) {
      alert('Please select Proposed Date.');
      document.getElementById('modal-act-date')?.focus();
      return;
    }

    if (!this.activePlan.learning_activities) this.activePlan.learning_activities = [];

    const activityObj = {
      sno: String((actIndex !== null ? actIndex : this.activePlan.learning_activities.length) + 1),
      activity: acts.join(', '),
      topic,
      outcome,
      proposed_date: date,
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
    const assessed = (this.activePlan.learning_activities || []).filter(a => a.is_assessment);
    this.activePlan.assessment_plan = assessed.map((a, idx) => ({
      sno: String(idx + 1),
      component: a.cia_component || ('C2 - K' + (idx <= 1 ? idx + 4 : 4)),
      marks: String(a.cia_marks || '10'),
      category: a.activity,
      unit_coverage: a.topic || '—',
      from_date: a.proposed_date || '',
      to_date: a.proposed_date || '',
      cos_assessed: a.outcome || '—',
      uneditable: true
    }));
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

    this.activePlan.department_name = document.getElementById('cp-dept-name')?.value || this.selectedDept;
    this.activePlan.faculty_name = document.getElementById('cp-faculty-name')?.value || '';
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
        resources: (tr.querySelector('.dtp-res-select')?.value === 'Others' 
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
    if (icts.length > 0) this.activePlan.ict_integration = icts;

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
              onclick="coursePlanApp.submitNextCourse()" 
              class="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
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
    const curDept = this.activePlan ? this.activePlan.department_name : this.selectedDept;
    const curFac = this.activePlan ? this.activePlan.faculty_name : '';
    const curEmail = this.activePlan ? this.activePlan.faculty_email : '';
    const curSem = this.activePlan ? this.activePlan.semester : 'II';
    const curProg = this.activePlan ? this.activePlan.programme : '';

    this.activePlan = this.createDefaultPlan();
    this.activePlan.department_name = curDept;
    this.activePlan.faculty_name = '';
    this.activePlan.faculty_email = '';
    this.activePlan.semester = curSem;
    this.activePlan.programme = curProg;
    if (this.activePlan.declaration) {
      this.activePlan.declaration.faculty_signature = curFac;
    }
    
    this.viewMode = 'form';
    this.activeFormTab = 'part1';
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div id="hod-review-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div class="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
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
            <div class="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
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

          <div class="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <button 
              type="button" 
              onclick="coursePlanApp.previewPlan(${fullPlan.id})" 
              class="px-4 py-2 bg-white text-slate-700 font-bold border border-slate-300 rounded-xl text-xs hover:bg-slate-100 flex items-center gap-1.5"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>View Full Document Preview</span>
            </button>

            <div class="flex items-center gap-2">
              <button 
                type="button" 
                onclick="coursePlanApp.submitHODDecision(${fullPlan.id}, 'Revision Needed')" 
                class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition border border-rose-200"
              >
                Request Revision
              </button>
              <button 
                type="button" 
                onclick="coursePlanApp.submitHODDecision(${fullPlan.id}, 'Approved')" 
                class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/25"
              >
                <i data-lucide="check-check" class="w-4 h-4"></i>
                <span>Approve & Transmit to IQAC</span>
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
        if (this.currentUser.role === 'hod' && this.currentUser.department_name) {
          this.selectedDept = this.currentUser.department_name;
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

  async logout() {
    try {
      await fetch('api/course_plan.php?action=logout');
      this.currentUser = null;
      await this.fetchPlans();
      this.render();
    } catch (e) {
      this.currentUser = null;
      this.render();
    }
  }
}

// Global instance
window.coursePlanApp = new CoursePlanApp();


// Global click handler to close open teaching methodology autocomplete dropdowns
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dtp-method-container')) {
    document.querySelectorAll('[id^="dtp-method-menu-"]').forEach(m => m.classList.add('hidden'));
  }
});
