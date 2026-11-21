// IQAC AAA 2026-2027 - Central Data Store & State Management

const STORAGE_KEY_PREFIX = 'IQAC_AAA_DATA_';
const DEPT_LIST_KEY = 'IQAC_AAA_DEPARTMENTS_LIST';
const ACTIVE_DEPT_KEY = 'IQAC_AAA_ACTIVE_DEPT';
const ACTIVE_YEAR_KEY = 'IQAC_AAA_ACTIVE_YEAR';
const YEARS_LIST_KEY = 'IQAC_AAA_YEARS_LIST';
const DEFAULT_ACTIVE_YEAR = '2026 - 2027';

class DataStore {
  constructor() {
    this.activeDepartment = null;
    this.data = null;
    this.listeners = [];
  }

  // Subscribe to changes
  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.data); } catch (e) { console.error(e); }
    });
  }

  // Initialize store: check if data exists in localStorage, else load sample
  async init() {
    // Guaranteed automatic one-time wipe of legacy dummy data across all departments & years
    const PURGE_FLAG = 'IQAC_AAA_CLEAN_DEPLOY_PURGE_V16_ZERO_STATE';
    if (localStorage.getItem(PURGE_FLAG) !== 'completed') {
      try {
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (
            k.startsWith('IQAC_AAA_DATA_') || 
            k.startsWith('IQAC_AAA_MASTER_') || 
            k.startsWith('IQAC_AAA_ATTR') ||
            k === 'IQAC_CARDS_UNLOCKED'
          )) {
            toRemove.push(k);
          }
        }
        toRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {}

      // Reset existing departments in users DB to clean zero-data state
      try {
        const rawUsers = localStorage.getItem('IQAC_USERS_DB');
        if (rawUsers) {
          const udb = JSON.parse(rawUsers);
          if (udb && Array.isArray(udb.departments)) {
            udb.departments.forEach(d => {
              d.status = 'draft';
              d.last_updated = '-';
              d.is_locked = false;
            });
            if (!udb.departments.some(d => d.code === 'thomas')) {
              udb.departments.push({
                id: Date.now(),
                code: 'thomas',
                name: 'Department of THOMAS',
                school: 'School of Computing Sciences',
                hod_name: 'Thomas Darwin',
                password: 'sjc123',
                is_locked: false,
                status: 'draft',
                last_updated: '-'
              });
            }
            localStorage.setItem('IQAC_USERS_DB', JSON.stringify(udb));
          }
        }
      } catch (e) {}

      localStorage.setItem(ACTIVE_YEAR_KEY, '2026 - 2027');
      localStorage.setItem(YEARS_LIST_KEY, JSON.stringify(['2024 - 2025', '2025 - 2026', '2026 - 2027', '2027 - 2028', '2028 - 2029', '2029 - 2030']));
      localStorage.setItem(PURGE_FLAG, 'completed');
    }
    let deptList = this.getDepartmentList();
    if (!deptList || deptList.length === 0) {
      deptList = ['PG & Research Department of Computer Science', 'PG & Research Department of Commerce'];
      this.saveDepartmentList(deptList);
    }

    let activeDeptName = localStorage.getItem(ACTIVE_DEPT_KEY) || deptList[0];
    let stored = localStorage.getItem(STORAGE_KEY_PREFIX + activeDeptName);

    if (stored) {
      try {
        this.data = this.ensureSchema(JSON.parse(stored));
        this.activeDepartment = activeDeptName;
        this.notify();
        return;
      } catch (e) {
        console.warn('Could not parse stored data, loading default', e);
      }
    }

    // Clean blank template ready for production deployment (no dummy records)
    this.data = this.ensureSchema(this.createDefaultData(activeDeptName));
    this.activeDepartment = activeDeptName;
    this.saveCurrentData();
    this.notify();
  }

  resetAllDataToBlankSlate() {
    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('IQAC_AAA_DATA_') || k === 'IQAC_USERS_DB' || k.startsWith('IQAC_AAA_MASTER_'))) {
          toRemove.push(k);
        }
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {}

    localStorage.setItem(ACTIVE_YEAR_KEY, DEFAULT_ACTIVE_YEAR);
    localStorage.setItem(YEARS_LIST_KEY, JSON.stringify(['2025 - 2026', '2026 - 2027', '2027 - 2028', '2028 - 2029']));
    this.data = this.ensureSchema(this.createDefaultData('PG & Research Department of Computer Science'));
    this.saveCurrentData();
    this.notify();
    return true;
  }

  // ================= ACADEMIC YEAR MANAGEMENT & PERSISTENCE =================
  getActiveYear() {
    return localStorage.getItem(ACTIVE_YEAR_KEY) || DEFAULT_ACTIVE_YEAR;
  }

  getAcademicYearsList() {
    try {
      const stored = localStorage.getItem(YEARS_LIST_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {}
    const defaultYears = ['2024 - 2025', '2025 - 2026', '2026 - 2027', '2027 - 2028', '2028 - 2029'];
    localStorage.setItem(YEARS_LIST_KEY, JSON.stringify(defaultYears));
    return defaultYears;
  }

  deleteAcademicYear(yearToDelete) {
    const cleanYear = (yearToDelete || '').trim();
    if (!cleanYear) throw new Error('Valid academic year string required');

    const list = this.getAcademicYearsList();
    if (list.length <= 1) {
      throw new Error('Cannot delete the only existing academic year.');
    }

    // 1. Remove all year-scoped data from localStorage
    const prefix = STORAGE_KEY_PREFIX + cleanYear + '_';
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 2. Update years list
    const updatedList = list.filter(y => y !== cleanYear);
    localStorage.setItem(YEARS_LIST_KEY, JSON.stringify(updatedList));

    // 3. Switch active year to first remaining
    const nextYear = updatedList[0];
    localStorage.setItem(ACTIVE_YEAR_KEY, nextYear);
    this.setActiveYear(nextYear);

    return { success: true, deletedYear: cleanYear, activeYear: nextYear, countRemoved: keysToRemove.length };
  }

  addAcademicYear(yearStr) {
    const cleanYear = (yearStr || '').trim();
    if (!cleanYear) return this.getAcademicYearsList();
    const list = this.getAcademicYearsList();
    if (!list.includes(cleanYear)) {
      list.push(cleanYear);
      localStorage.setItem(YEARS_LIST_KEY, JSON.stringify(list));
    }
    return list;
  }

  setActiveYear(newYear) {
    const cleanYear = (newYear || '').trim();
    if (!cleanYear) return;

    // 1. Save current active department data for the old year before switching
    if (this.data && this.activeDepartment) {
      this.saveCurrentData();
    }

    // 2. Set new active year
    localStorage.setItem(ACTIVE_YEAR_KEY, cleanYear);
    this.addAcademicYear(cleanYear);

    // 3. Load or initialize department data for this new year
    const deptName = this.activeDepartment || (this.getDepartmentList()[0] || 'PG & Research Department of Computer Science');
    const yearStorageKey = STORAGE_KEY_PREFIX + cleanYear + '_' + deptName;
    const stored = localStorage.getItem(yearStorageKey);

    if (stored) {
      try {
        this.data = this.ensureSchema(JSON.parse(stored));
      } catch (e) {
        console.warn('Error reading stored data for year:', cleanYear, e);
        this.data = this.ensureSchema(this.createDefaultData(deptName));
      }
    } else {
      // If switching to default year 2026 - 2027 and un-prefixed data exists, migrate it
      const legacyStored = localStorage.getItem(STORAGE_KEY_PREFIX + deptName);
      if (cleanYear === DEFAULT_ACTIVE_YEAR && legacyStored) {
        try {
          this.data = this.ensureSchema(JSON.parse(legacyStored));
        } catch (e) {
          this.data = this.ensureSchema(this.createDefaultData(deptName));
        }
      } else {
        // Fresh year-specific dataset
        this.data = this.ensureSchema(this.createDefaultData(deptName));
      }
      this.data.departmentInfo.academicYear = cleanYear;
      localStorage.setItem(yearStorageKey, JSON.stringify(this.data));
    }

    if (this.data && this.data.departmentInfo) {
      this.data.departmentInfo.academicYear = cleanYear;
    }

    this.notify();
    return cleanYear;
  }

  getDepartmentDataForYear(deptName, year) {
    const targetYear = year || this.getActiveYear();
    const key = STORAGE_KEY_PREFIX + targetYear + '_' + deptName;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return this.ensureSchema(JSON.parse(stored));
      } catch (e) {}
    }
    // Fallback to un-prefixed key if 2026 - 2027
    if (targetYear === DEFAULT_ACTIVE_YEAR) {
      const legacy = localStorage.getItem(STORAGE_KEY_PREFIX + deptName);
      if (legacy) {
        try {
          return this.ensureSchema(JSON.parse(legacy));
        } catch (e) {}
      }
    }
    return this.ensureSchema(this.createDefaultData(deptName));
  }


  // Master Attribute Cards Schema (Admin Editable for PART-A and Attributes 1 to 10)
  getAllCardsSchema() {
    try {
      const saved = localStorage.getItem('IQAC_AAA_MASTER_CARDS_SCHEMA');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Check if cached schema has outdated generic placeholder titles, old structure, or 0 in studentDetails programme
          const hasStaleTitles = parsed.some(c => 
            (c.sheets || []).some(s => 
              (s.title && (s.title.startsWith('Attribute ') || s.title === '9. 9.13' || s.title === 'Attribute X')) ||
              (s.key === '3_3_1' && s.title !== '3.1 Research Facility') ||
              (s.key === '4_4_1' && s.title !== '4.1 Alumni Meeting') ||
              (s.key === '5_5_3' && s.type !== 'multi_table') ||
              (s.key === '9_9_11' && s.type !== 'multi_table') ||
              (s.key === '9_9_4' && !s.columns?.some(col => col.key === 'university_reference_number')) ||
              (s.studentDetails && s.studentDetails.rows && s.studentDetails.rows.some(r => r.programme === 0 || r.programme === '0'))
            )
          );
          if (!hasStaleTitles) {
            parsed.forEach(c => {
              (c.sheets || []).forEach(s => {
                if (s.rows && s.rows.length > 0) s.rows = [];
                if (s.sections) s.sections.forEach(sec => { if (sec.rows) sec.rows = []; });
                if (s.batches) s.batches.forEach(bat => { if (bat.rows) bat.rows = []; });
                if (s.studentDetails && Array.isArray(s.studentDetails.rows)) {
                  const defaultLevels = ['Undergraduate (UG)', 'Postgraduate (PG)', 'Ph.D. / Research'];
                  s.studentDetails.rows.forEach((r, idx) => {
                    if (!r.programme || r.programme === 0 || r.programme === '0') {
                      r.programme = defaultLevels[idx] || `Level ${idx + 1}`;
                    }
                  });
                }
              });
            });
            return parsed;
          } else {
            console.info('Detected stale card schema in localStorage, updating with latest descriptive schema...');
          }
        }
      }
    } catch (e) {
      console.warn('Error reading saved master cards schema:', e);
    }
    if (window.ALL_ATTRIBUTES_CARDS_SCHEMA) {
      const fresh = JSON.parse(JSON.stringify(window.ALL_ATTRIBUTES_CARDS_SCHEMA));
      try {
        localStorage.setItem('IQAC_AAA_MASTER_CARDS_SCHEMA', JSON.stringify(fresh));
      } catch (err) {}
      return fresh;
    }
    return [];
  }

  saveAllCardsSchema(newSchema) {
    try {
      localStorage.setItem('IQAC_AAA_MASTER_CARDS_SCHEMA', JSON.stringify(newSchema));
      return true;
    } catch (e) {
      console.error('Error saving master cards schema:', e);
      return false;
    }
  }

  resetAllCardsSchema() {
    try {
      localStorage.removeItem('IQAC_AAA_MASTER_CARDS_SCHEMA');
      return this.getAllCardsSchema();
    } catch (e) {
      return window.ALL_ATTRIBUTES_CARDS_SCHEMA || [];
    }
  }

  initDefaultCardsFormData() {
    const data = {};
    const cards = this.getAllCardsSchema();
    const defaultLevels = ['Undergraduate (UG)', 'Postgraduate (PG)', 'Ph.D. / Research'];
    if (cards && Array.isArray(cards)) {
      cards.forEach(card => {
        data[card.id] = {};
        (card.sheets || []).forEach(sheet => {
          if (sheet.type === 'profile') {
            data[card.id][sheet.key] = {
              profile: {
                collegeName: "St. Joseph's College (Autonomous)",
                department: "",
                hodName: "",
                programmesOffered: ""
              },
              facultyDetails: (sheet.facultyDetails?.rows || []).map(r => ({
                label: r.label,
                male: 0,
                female: 0
              })),
              studentDetails: (sheet.studentDetails?.rows || []).map((r, idx) => ({
                programme: (r.programme && r.programme !== 0 && r.programme !== '0') ? r.programme : (defaultLevels[idx] || `Level ${idx + 1}`),
                male: 0,
                female: 0,
                otherGender: 0,
                otherStates: 0,
                otherCountries: 0
              }))
            };
          } else if (sheet.type === 'table') {
            data[card.id][sheet.key] = [];
          } else if (sheet.type === 'multi_table') {
            const m = {};
            (sheet.sections || []).forEach(sec => {
              m[sec.id] = [];
            });
            data[card.id][sheet.key] = m;
          } else if (sheet.type === 'batch_table') {
            const b = {};
            (sheet.batches || []).forEach(bat => {
              b[bat.id] = [];
            });
            data[card.id][sheet.key] = b;
          }
        });
      });
    }
    return data;
  }

  // Attribute 1 Questionnaire Schema (Admin Editable)
  getAttribute1Schema() {
    try {
      const saved = localStorage.getItem('IQAC_AAA_ATTR1_SCHEMA');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved Attribute 1 schema:', e);
    }
    if (window.DEFAULT_ATTRIBUTE1_SCHEMA) {
      return JSON.parse(JSON.stringify(window.DEFAULT_ATTRIBUTE1_SCHEMA));
    }
    return [];
  }

  saveAttribute1Schema(newSchema) {
    try {
      localStorage.setItem('IQAC_AAA_ATTR1_SCHEMA', JSON.stringify(newSchema));
      return true;
    } catch (e) {
      console.error('Error saving Attribute 1 schema:', e);
      return false;
    }
  }

  resetAttribute1Schema() {
    try {
      localStorage.removeItem('IQAC_AAA_ATTR1_SCHEMA');
      return this.getAttribute1Schema();
    } catch (e) {
      return window.DEFAULT_ATTRIBUTE1_SCHEMA || [];
    }
  }

  initDefaultAttribute1Data() {
    const data = {};
    const schema = this.getAttribute1Schema();
    if (schema && Array.isArray(schema)) {
      schema.forEach(sheet => {
        if (sheet.type === 'profile') {
          data[sheet.key] = {
            profile: JSON.parse(JSON.stringify(sheet.profileQuestions || {})),
            facultyDetails: JSON.parse(JSON.stringify(sheet.facultyDetails?.rows || [])),
            studentDetails: JSON.parse(JSON.stringify(sheet.studentDetails?.rows || []))
          };
        } else if (sheet.type === 'table') {
          data[sheet.key] = JSON.parse(JSON.stringify(sheet.rows || []));
        } else if (sheet.type === 'multi_table') {
          const m = {};
          (sheet.sections || []).forEach(sec => {
            m[sec.id] = JSON.parse(JSON.stringify(sec.rows || []));
          });
          data[sheet.key] = m;
        } else if (sheet.type === 'batch_table') {
          const b = {};
          (sheet.batches || []).forEach(bat => {
            b[bat.id] = JSON.parse(JSON.stringify(bat.rows || []));
          });
          data[sheet.key] = b;
        }
      });
    }
    return data;
  }

  getAttribute1SheetData(sheetKey) {
    if (!this.data) return null;
    if (!this.data.attribute1Data) {
      this.data.attribute1Data = this.initDefaultAttribute1Data();
    }
    return this.data.attribute1Data[sheetKey];
  }

  updateAttribute1SheetData(sheetKey, sheetData) {
    if (!this.data) return;
    if (!this.data.attribute1Data) {
      this.data.attribute1Data = this.initDefaultAttribute1Data();
    }
    this.data.attribute1Data[sheetKey] = sheetData;
    this.saveCurrentData();
  }

  ensureSchema(data) {
    if (!data) return data;
    if (!data.attributeFormData || Object.keys(data.attributeFormData).length === 0) {
      data.attributeFormData = this.initDefaultCardsFormData();
    }
    // Heal any empty studentDetails level names in existing saved data
    if (data.attributeFormData && data.attributeFormData['part_a'] && data.attributeFormData['part_a']['PART-A']) {
      const partA = data.attributeFormData['part_a']['PART-A'];
      if (Array.isArray(partA.studentDetails)) {
        const defaultLevels = ['Undergraduate (UG)', 'Postgraduate (PG)', 'Ph.D. / Research'];
        partA.studentDetails.forEach((r, idx) => {
          if (!r.programme || r.programme === 0 || r.programme === '0' || String(r.programme).trim() === '') {
            r.programme = defaultLevels[idx] || `Level ${idx + 1}`;
          }
        });
      }
    }
    if (!data.attribute1Data || Object.keys(data.attribute1Data).length === 0) {
      data.attribute1Data = this.initDefaultAttribute1Data();
    }
    if (!data.departmentInfo) data.departmentInfo = {};
    if (!data.departmentInfo.scholars) {
      data.departmentInfo.scholars = {
        fullTime: { male: 0, female: 0 },
        partTime: { male: 0, female: 0 }
      };
    }
    if (!data.attributeI) data.attributeI = {};
    if (!data.attributeI.ptm) {
      data.attributeI.ptm = {
        numberOfPTMs: 0,
        parentsParticipated: 0,
        details: ""
      };
    }
    if (!data.studentsOutcomes2026) {
      data.studentsOutcomes2026 = {
        ug: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 },
        pg: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 },
        phd: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 }
      };
    }
    if (!data.attributeIII) {
      data.attributeIII = {
        researchFacility: [],
        departmentLibrary: {
          booksPurchased: 0,
          journalsPurchased: 0,
          totalBooks: 0,
          totalJournals: 0,
          facultyVisitsPerDay: 0,
          studentVisitsPerDay: 0
        }
      };
    }
    if (!data.attributeX) {
      data.attributeX = {
        csrExtension: [],
        greenInitiatives: {
          paperlessCIA: "",
          solarEnergyUsage: "",
          plasticFreeCampus: "",
          rainWaterHarvesting: ""
        }
      };
    }
    if (!data.qualitativePresentation) data.qualitativePresentation = {};
    return data;
  }

  getDepartmentList() {
    try {
      const list = localStorage.getItem(DEPT_LIST_KEY);
      return list ? JSON.parse(list) : [];
    } catch (e) {
      return [];
    }
  }

  saveDepartmentList(list) {
    localStorage.setItem(DEPT_LIST_KEY, JSON.stringify(list));
  }

  getDepartmentSubmissionStatus(deptName) {
    const name = deptName || this.activeDepartment || 'Default';
    const key = 'IQAC_AAA_STATUS_' + name;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Fallback: check UsersDB in case user has lock flag
    try {
      const db = this.getUsersDB();
      const u = (db.departments || []).find(d => 
        (d.name || '').toLowerCase() === name.toLowerCase() || 
        (d.code || '').toLowerCase() === name.toLowerCase()
      );
      if (u && u.is_locked) {
        return {
          status: 'submitted',
          is_locked: true,
          last_updated: new Date().toISOString()
        };
      }
    } catch (e) {}

    return {
      status: 'draft',
      is_locked: false,
      last_updated: new Date().toISOString()
    };
  }

  setDepartmentSubmissionStatus(deptName, statusObj, isLocked) {
    const name = deptName || this.activeDepartment || 'Default';
    const key = 'IQAC_AAA_STATUS_' + name;
    const current = this.getDepartmentSubmissionStatus(name);

    let patch = {};
    if (typeof statusObj === 'string') {
      patch = { status: statusObj, is_locked: Boolean(isLocked) };
    } else if (typeof statusObj === 'object' && statusObj !== null) {
      patch = statusObj;
    }

    const updated = { ...current, ...patch, last_updated: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(updated));

    // Also update UsersDB for consistency
    try {
      const db = this.getUsersDB();
      const dept = (db.departments || []).find(d => 
        (d.name || '').toLowerCase() === name.toLowerCase() || 
        (d.code || '').toLowerCase() === name.toLowerCase()
      );
      if (dept && patch.is_locked !== undefined) {
        dept.is_locked = Boolean(patch.is_locked);
        if (patch.status) dept.status = patch.status;
        this.saveUsersDB(db);
      }
    } catch (e) {}

    this.notify();
    return updated;
  }

  isDepartmentLocked(deptName) {
    const status = this.getDepartmentSubmissionStatus(deptName || this.activeDepartment);
    return Boolean(status.is_locked);
  }

  switchDepartment(deptName) {
    if (this.data && this.activeDepartment) {
      this.saveCurrentData();
    }

    const activeYear = this.getActiveYear();
    const yearStorageKey = STORAGE_KEY_PREFIX + activeYear + '_' + deptName;
    const stored = localStorage.getItem(yearStorageKey) || localStorage.getItem(STORAGE_KEY_PREFIX + deptName);

    if (stored) {
      try {
        this.data = this.ensureSchema(JSON.parse(stored));
        this.activeDepartment = deptName;
        localStorage.setItem(ACTIVE_DEPT_KEY, deptName);
        this.notify();
        return;
      } catch (e) {
        console.error('Error switching department', e);
      }
    }

    // Create fresh zero-dummy dataset for this department
    this.data = this.ensureSchema(this.createDefaultData(deptName));
    this.activeDepartment = deptName;
    localStorage.setItem(ACTIVE_DEPT_KEY, deptName);
    this.saveCurrentData();
    this.notify();
  }

  saveCurrentData() {
    if (!this.data || !this.data.departmentInfo) return;
    const name = this.data.departmentInfo.departmentName || 'Untitled Department';
    const activeYear = this.getActiveYear();
    this.activeDepartment = name;
    this.data.departmentInfo.academicYear = activeYear;

    // Save under year-scoped key to ensure previous years remain preserved
    localStorage.setItem(STORAGE_KEY_PREFIX + activeYear + '_' + name, JSON.stringify(this.data));
    // Also save legacy key for compatibility with existing exporters
    localStorage.setItem(STORAGE_KEY_PREFIX + name, JSON.stringify(this.data));
    localStorage.setItem(ACTIVE_DEPT_KEY, name);

    // ensure in dept list
    let list = this.getDepartmentList();
    if (!list.includes(name)) {
      list.push(name);
      this.saveDepartmentList(list);
    }
  }

  updateData(newData) {
    this.data = newData;
    this.saveCurrentData();
    this.notify();
  }

  async loadSample(sampleType = 'cs') {
    if (sampleType === 'commerce' && window.COMMERCE_SAMPLE_DATA) {
      this.data = this.ensureSchema(JSON.parse(JSON.stringify(window.COMMERCE_SAMPLE_DATA)));
      this.activeDepartment = this.data.departmentInfo.departmentName;
      this.saveCurrentData();
      this.notify();
      return true;
    } else if (window.CS_SAMPLE_DATA) {
      this.data = this.ensureSchema(JSON.parse(JSON.stringify(window.CS_SAMPLE_DATA)));
      this.activeDepartment = this.data.departmentInfo.departmentName;
      this.saveCurrentData();
      this.notify();
      return true;
    }

    const filename = sampleType === 'commerce' ? 'sample-data/commerce_sample.json' : 'sample-data/cs_sample.json';
    try {
      const resp = await fetch(filename);
      if (resp.ok) {
        this.data = this.ensureSchema(await resp.json());
        this.activeDepartment = this.data.departmentInfo.departmentName;
        this.saveCurrentData();
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Error loading sample data:', e);
    }
    return false;
  }

  async loadBlankTemplate() {
    if (window.BLANK_TEMPLATE_DATA) {
      this.data = JSON.parse(JSON.stringify(window.BLANK_TEMPLATE_DATA));
      this.activeDepartment = this.data.departmentInfo.departmentName;
      this.saveCurrentData();
      this.notify();
      return true;
    }

    try {
      const resp = await fetch('sample-data/blank_template.json');
      if (resp.ok) {
        this.data = await resp.json();
        this.activeDepartment = this.data.departmentInfo.departmentName;
        this.saveCurrentData();
        this.notify();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    this.data = this.createDefaultData('New Department');
    this.activeDepartment = 'New Department';
    this.saveCurrentData();
    this.notify();
    return true;
  }

  exportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const filename = `IQAC_AAA_2026_27_${(this.data.departmentInfo.departmentName || 'Department').replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.departmentInfo) {
        throw new Error('Invalid format: departmentInfo is missing');
      }
      this.data = parsed;
      this.activeDepartment = parsed.departmentInfo.departmentName;
      this.saveCurrentData();
      this.notify();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  createDefaultData(deptName = 'Department') {
    const activeYear = this.getActiveYear();
    return {
      departmentInfo: {
        collegeName: "St. Joseph's College (Autonomous)",
        accreditation: "Special Heritage Status, NIRF Ranked, NAAC A++ Accredited",
        academicYear: activeYear,
        departmentName: deptName,
        school: "Academic School",
        hodName: "",
        auditDate: new Date().toISOString().split('T')[0],
        facultyCount: 0,
        studentCountUG: 0,
        studentCountPG: 0,
        researchScholarsCount: 0,
        scholars: {
          fullTime: { male: 0, female: 0 },
          partTime: { male: 0, female: 0 }
        }
      },
      attributeFormData: this.initDefaultCardsFormData(),
      attributeI: {
        vac: [],
        cc: [],
        iks: { seminarCount: 0, workshopCount: 0, fieldVisitCount: 0, studentsBenefitted: 0, details: "" },
        visits: { industrial: 0, educational: 0, fieldWork: 0, fieldVisit: 0, studentsParticipated: 0, classSec: "", details: "" },
        internships: { studentsInvolved: 0, details: "" },
        ptm: { numberOfPTMs: 0, parentsParticipated: 0, details: "" },
        moocs: {
          ug: { totalStudents: 0, cycle1_registered: 0, cycle2_registered: 0, cycle1_completed: 0, cycle2_completed: 0 },
          pg: { totalStudents: 0, cycle1_registered: 0, cycle2_registered: 0, cycle1_completed: 0, cycle2_completed: 0 }
        }
      },
      attributeII: {
        newDegrees: { count: 0, details: "" },
        netSetJrf: { count: 0, details: "" },
        recognizedBodies: { bosCount: 0, externalAuditCount: 0, details: "" },
        researchJournals: { reviewersCount: 0, editorsCount: 0, details: "" },
        professionalBodies: { count: 0, details: "" },
        resourcePerson: { international: 0, national: 0, state: 0, regional: 0, institutional: 0, servedFacultyNames: "" },
        fdp: { mmttc_aicte_ugc: 0, otherInstitutions: 0, throughFdc: 0, institutionalLevel: 0, details: "" },
        industrialTraining: { count: 0, details: "" },
        socialSectorProjects: { count: 0, details: "" },
        fellowships: { national: 0, international: 0, details: "" },
        awards: { count: 0, details: "" },
        facultyMooc: { registered: 0, completed: 0, details: "" },
        abroadVisits: { count: 0, facultyNames: "" }
      },
      attributeIV_VII: {
        externalFunds: [],
        managementFunds: [],
        seedMoney: { projectsAmount: 0, patentsAmount: 0, copyrightAmount: 0, totalSanctioned: 0, details: "" },
        endowments: { count: 0, details: "" }
      },
      attributeV: {
        mouCreated: { count: 0, activitiesConducted: "" },
        previousMous: { count: 0, activitiesConducted: "" },
        linkages: { count: 0, activitiesConducted: "" },
        eContent: { count: 0, details: "" }
      },
      attributeVI_VIII: {
        clubs: [],
        pursuingOtherDegrees: { count: 0, details: "" },
        studentChapters: { count: 0, details: "" },
        competitiveExams: { appeared: 0, qualified: 0, details: "" },
        studentParticipationAwards: { sports: 0, cultural: 0, externalAcademicEvents: 0, extraCurricularEvents: 0, coCurricularEvents: 0, details: "" }
      },
      attributeIX: {
        phdConferred: { count: 0, details: "" },
        newGuides: { count: 0, details: "" },
        newScholars: { count: 0, details: "" },
        papersPublished: { scopus: 0, wos: 0, ugcCare: 0, details: "" },
        conferencesPresented: { indexed: 0, nonIndexed: 0, details: "" },
        books: { published: 0, edited: 0, chaptersContributed: 0, details: "" },
        patents: { applied: 0, granted: 0, details: "" },
        copyrights: { count: 0, details: "" },
        oer: { count: 0, details: "" }
      },
      studentsOutcomes2026: {
        ug: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 },
        pg: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 },
        phd: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 }
      },
      qualitativePresentation: {
        signatureAchievements: [],
        uniqueness: "",
        statusOfActivities: {
          basedOnAAA2025_2026: [],
          basedOnFacultyOrientation2026: []
        },
        statusAAA2025_2026: [],
        bestPractices: [],
        swoc: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          challenges: []
        },
        futurePlans: {
          shortTerm: [],
          longTerm: []
        },
        pillars: {
          ptm: { meetingsConducted: 0, dates: "", parentAttendancePercentage: 0, keyFeedback: "", actionTaken: "" },
          feedback: { studentRating: 0, parentRating: 0, alumniRating: 0, employerRating: 0, actionTakenReport: "" },
          teachingLearning: { innovations: "", ictToolsUsed: "" },
          assessmentProcess: { reforms: "" },
          remedialTeaching: { strategy: "", impact: "" },
          studentSupport: { mentoringRatio: "", supportMeasures: "" },
          guidanceCompExam: { initiatives: "" },
          sustainability: { initiatives: "" }
        }
      },
      panelReview: {
        expertName: "",
        deanName: "",
        iqacCoordinator: "",
        administratorName: "",
        comments: "",
        rating: 0
      }
    };
  }
  // --- Meeting Agenda & Question Selection Management ---
  getAllAttributesMetadata() {
    return [
      {
        id: 't1_scholars',
        code: 'T1',
        name: 'Table 1: Research Scholars Matrix',
        category: 'Research',
        questions: [
          { id: 't1_fulltime', code: '1.A', label: 'Full-Time Research Scholars (M/F)', default: true },
          { id: 't1_parttime', code: '1.B', label: 'Part-Time Research Scholars (M/F)', default: true }
        ]
      },
      {
        id: 't2_activities',
        code: 'T2',
        name: 'Table 2: Status of Activities Completed (ATR & FOP 2026)',
        category: 'Governance',
        questions: [
          { id: 't2_aaa_atr', code: '2.A', label: 'Status based on AAA 2025–2026 ATR', default: true },
          { id: 't2_fop_2026', code: '2.B', label: 'Status based on Faculty Orientation June 2026', default: true }
        ]
      },
      {
        id: 'att1',
        code: 'Attr I',
        name: 'Attribute I: Curriculum Design & MOOC Progression',
        category: 'Curriculum',
        questions: [
          { id: 'att1_vac', code: '1.2a', label: 'Value-Added Courses (VAC)', default: true },
          { id: 'att1_cc', code: '1.2b', label: 'Certificate Courses (CC)', default: true },
          { id: 'att1_iks', code: '1.3', label: 'Indian Knowledge Systems (IKS)', default: true },
          { id: 'att1_visits', code: '1.4', label: 'Industrial, Educational & Field Visits', default: true },
          { id: 'att1_internships', code: '1.5', label: 'Corporate & Field Internships', default: true },
          { id: 'att1_moocs', code: '1.8', label: 'SWAYAM / NPTEL MOOC Progression (UG/PG)', default: true },
          { id: 'att1_ptm', code: '1.10', label: 'Parent Teacher Meetings (PTM)', default: true }
        ]
      },
      {
        id: 'att2',
        code: 'Attr II',
        name: 'Attribute II: Faculty Resources & Development',
        category: 'Faculty',
        questions: [
          { id: 'att2_degrees', code: '2.2', label: 'New Degrees Conferred (Ph.D./PDF)', default: true },
          { id: 'att2_netset', code: '2.10', label: 'NET / SET / JRF Qualified Faculty', default: true },
          { id: 'att2_bodies', code: '2.3', label: 'Memberships in Recognised Bodies & Audits', default: true },
          { id: 'att2_journals', code: '2.4', label: 'Journal Editors & Reviewers (Scopus/WoS)', default: true },
          { id: 'att2_prof_bodies', code: '2.5', label: 'Professional Body Memberships', default: true },
          { id: 'att2_resource', code: '2.6', label: 'Resource Person / Keynote Invites', default: true },
          { id: 'att2_fdp', code: '2.7', label: 'FDPs & Orientation Courses', default: true },
          { id: 'att2_industry', code: '2.9', label: 'Industrial Training & Fellowships', default: true },
          { id: 'att2_abroad', code: '2.13', label: 'Faculty Abroad Academic Visits', default: true }
        ]
      },
      {
        id: 'att3',
        code: 'Attr III',
        name: 'Attribute III: Infrastructure & Learning Resources',
        category: 'Infrastructure',
        questions: [
          { id: 'att3_facility', code: '3.1', label: 'Research Facility & Lab Equipment Purchased', default: true },
          { id: 'att3_library', code: '3.2', label: 'Department Library (Volumes & Daily Visits)', default: true }
        ]
      },
      {
        id: 'att4_7',
        code: 'Attr IV & VII',
        name: 'Attribute IV & VII: Research Grants, Seed Money & Endowments',
        category: 'Grants',
        questions: [
          { id: 'att4_external', code: '4.3', label: 'External Agency Research & Conference Grants', default: true },
          { id: 'att7_mgmt', code: '7.1', label: 'Management Research & Conference Support', default: true },
          { id: 'att7_seed', code: '7.2', label: 'Seed Money for Projects, Patents & Copyrights', default: true },
          { id: 'att4_endowments', code: '4.4', label: 'Endowments Established & Memorial Lectures', default: true }
        ]
      },
      {
        id: 'att5',
        code: 'Attr V',
        name: 'Attribute V: Learning, Teaching & Evaluation (MoUs & E-Content)',
        category: 'Teaching',
        questions: [
          { id: 'att5_mou', code: '5.5a', label: 'New MoUs Signed in 2026–27', default: true },
          { id: 'att5_prev_mou', code: '5.5b', label: 'Previous Active Industry MoUs', default: true },
          { id: 'att5_linkages', code: '5.5c', label: 'Academic & Research Linkages', default: true },
          { id: 'att5_econtent', code: '5.6', label: 'Four-Quadrant E-Contents (LMS/MOOC)', default: true }
        ]
      },
      {
        id: 'att6_8',
        code: 'Attr VI & VIII',
        name: 'Attribute VI & VIII: Extended Curricular, Clubs & Awards',
        category: 'Student Activities',
        questions: [
          { id: 'att6_clubs', code: '6.4', label: 'Departmental Clubs & Student Chapters', default: true },
          { id: 'att6_exams', code: '6.2', label: 'Competitive Examinations (GATE, NET, UPSC)', default: true },
          { id: 'att8_awards', code: '8.2', label: 'Student Prizes & Championship Trophies', default: true }
        ]
      },
      {
        id: 't10_outcomes',
        code: 'T10',
        name: 'Table 10: Students Outcomes – 2026 Passed Out',
        category: 'Outcomes',
        questions: [
          { id: 't10_ug', code: '10.A', label: 'UG Placements, Higher Studies & Entrepreneurs', default: true },
          { id: 't10_pg', code: '10.B', label: 'PG Placements, Higher Studies & Entrepreneurs', default: true },
          { id: 't10_phd', code: '10.C', label: 'Ph.D. Placements & Career Progression', default: true }
        ]
      },
      {
        id: 'att9',
        code: 'Attr IX',
        name: 'Attribute IX: Research, Innovations & Intellectual Property',
        category: 'Research',
        questions: [
          { id: 'att9_phd', code: '9.1', label: 'Ph.D. Conferred, Guides & Enrolment', default: true },
          { id: 'att9_papers', code: '9.8', label: 'Journal Papers (Scopus, WoS, UGC-CARE)', default: true },
          { id: 'att9_conferences', code: '9.9', label: 'Conference Papers Presented', default: true },
          { id: 'att9_books', code: '9.10', label: 'Books Authored & Chapters Contributed', default: true },
          { id: 'att9_patents', code: '9.11a', label: 'Indian Patents (Granted & Applied)', default: true },
          { id: 'att9_copyrights', code: '9.11b', label: 'Software Copyrights Registered', default: true },
          { id: 'att9_oer', code: '9.11c', label: 'Open Educational Resources (OER)', default: true }
        ]
      },
      {
        id: 'att10',
        code: 'Attr X',
        name: 'Attribute X: Institutional Values, Green Initiatives & CSR',
        category: 'Values & CSR',
        questions: [
          { id: 'att10_csr', code: '10.1', label: 'CSR Collaborations & Extension Outreach', default: true },
          { id: 'att10_green', code: '10.2', label: 'Sustainability & Green Campus Practices', default: true }
        ]
      }
    ];
  }

  getMeetingAgendaConfig() {
    try {
      const stored = localStorage.getItem('IQAC_AAA_MEETING_AGENDA_CONFIG');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading agenda config:', e);
    }
    return this.getDefaultAgendaConfig();
  }

  getDefaultAgendaConfig() {
    const config = {
      preset: 'all',
      enabledAttributes: {},
      enabledQuestions: {}
    };
    this.getAllAttributesMetadata().forEach(attr => {
      config.enabledAttributes[attr.id] = true;
      attr.questions.forEach(q => {
        config.enabledQuestions[q.id] = true;
      });
    });
    return config;
  }

  saveMeetingAgendaConfig(config) {
    localStorage.setItem('IQAC_AAA_MEETING_AGENDA_CONFIG', JSON.stringify(config));
    this.notify();
  }

  isAttributeEnabled(attrId) {
    if (!attrId) return true;
    const config = this.getMeetingAgendaConfig();
    if (!config || !config.enabledAttributes) return true;
    if (config.enabledAttributes[attrId] !== undefined) {
      return config.enabledAttributes[attrId] !== false;
    }
    const alt = attrId.startsWith('attr') ? attrId.replace('attr', 'att') : (attrId.startsWith('att') ? attrId.replace('att', 'attr') : attrId);
    if (config.enabledAttributes[alt] !== undefined) {
      return config.enabledAttributes[alt] !== false;
    }
    return true;
  }

  isQuestionEnabled(questionId) {
    const config = this.getMeetingAgendaConfig();
    return config.enabledQuestions ? config.enabledQuestions[questionId] !== false : true;
  }

  getAgendaStats() {
    const config = this.getMeetingAgendaConfig();
    const all = this.getAllAttributesMetadata();
    const totalAttrs = all.length;
    let activeAttrs = 0;
    let totalQuestions = 0;
    let activeQuestions = 0;

    all.forEach(attr => {
      const attrActive = config.enabledAttributes ? config.enabledAttributes[attr.id] !== false : true;
      if (attrActive) activeAttrs++;
      attr.questions.forEach(q => {
        totalQuestions++;
        const qActive = config.enabledQuestions ? config.enabledQuestions[q.id] !== false : true;
        if (attrActive && qActive) {
          activeQuestions++;
        }
      });
    });

    return {
      totalAttributes: totalAttrs,
      activeAttributes: activeAttrs,
      totalQuestions: totalQuestions,
      activeQuestions: activeQuestions,
      isFiltered: activeAttrs < totalAttrs || activeQuestions < totalQuestions,
      preset: config.preset || 'custom'
    };
  }

  applyAgendaPreset(presetKey) {
    const all = this.getAllAttributesMetadata();
    const config = {
      preset: presetKey,
      enabledAttributes: {},
      enabledQuestions: {}
    };

    const enableAllInAttr = (attrId) => {
      config.enabledAttributes[attrId] = true;
      const attr = all.find(a => a.id === attrId);
      if (attr) {
        attr.questions.forEach(q => { config.enabledQuestions[q.id] = true; });
      }
    };

    const disableAllInAttr = (attrId) => {
      config.enabledAttributes[attrId] = false;
      const attr = all.find(a => a.id === attrId);
      if (attr) {
        attr.questions.forEach(q => { config.enabledQuestions[q.id] = false; });
      }
    };

    if (presetKey === 'all') {
      const full = this.getDefaultAgendaConfig();
      this.saveMeetingAgendaConfig(full);
      return full;
    }

    // Default everything to disabled first
    all.forEach(a => disableAllInAttr(a.id));

    if (presetKey === 'executive_15m') {
      ['t1_scholars', 't2_activities', 'att1', 'att2', 'att4_7', 'att5', 't10_outcomes', 'att9'].forEach(enableAllInAttr);
    } else if (presetKey === 'research_ipr') {
      ['t1_scholars', 'att3', 'att4_7', 'att9'].forEach(enableAllInAttr);
    } else if (presetKey === 'curriculum_teaching') {
      ['att1', 'att2', 'att5'].forEach(enableAllInAttr);
    } else if (presetKey === 'student_progression') {
      ['att4_7', 'att6_8', 't10_outcomes', 'att10'].forEach(enableAllInAttr);
    } else if (presetKey === 'governance_atr') {
      ['t2_activities', 'att1', 'att5', 'att10'].forEach(enableAllInAttr);
    }

    this.saveMeetingAgendaConfig(config);
    return config;
  }

  // ================= SUBMISSION DEADLINE MANAGEMENT =================
  getSubmissionDeadline() {
    try {
      const stored = localStorage.getItem('IQAC_SUBMISSION_DEADLINE');
      if (stored) return stored;
    } catch (e) {}
    // Default deadline: 28 Feb 2027 at 23:59
    return '2027-02-28T23:59';
  }

  setSubmissionDeadline(isoDateTime) {
    try {
      localStorage.setItem('IQAC_SUBMISSION_DEADLINE', isoDateTime);
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to save submission deadline:', e);
      return false;
    }
  }

  isDeadlinePassed() {
    const deadline = this.getSubmissionDeadline();
    if (!deadline) return false;
    try {
      return new Date() > new Date(deadline);
    } catch (e) {
      return false;
    }
  }

  formatDeadlineForDisplay() {
    const dl = this.getSubmissionDeadline();
    if (!dl) return 'No Deadline Configured';
    try {
      const d = new Date(dl);
      return d.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dl;
    }
  }

  // ================= USERS & ACCESS MANAGEMENT DATABASE =================
  getUsersDB() {
    try {
      const stored = localStorage.getItem('IQAC_USERS_DB');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}

    // Default pre-populated accounts
    const initialDB = {
      departments: [
        {
          id: 1,
          code: 'cs',
          name: 'PG & Research Department of Computer Science',
          school: 'School of Computing Sciences',
          hod_name: 'Dr. S. Albert Rabara',
          password: 'sjc123',
          is_locked: false,
          status: 'draft',
          last_updated: '2026-10-30 11:30'
        },
        {
          id: 2,
          code: 'commerce',
          name: 'PG & Research Department of Commerce',
          school: 'School of Management Studies',
          hod_name: 'Dr. F. R. Alexander Pravin Durai',
          password: 'sjc123',
          is_locked: false,
          status: 'draft',
          last_updated: '2026-10-30 10:15'
        },
        {
          id: 3,
          code: 'physics',
          name: 'PG & Research Department of Physics',
          school: 'School of Physical Sciences',
          hod_name: 'Dr. N. Lawrence',
          password: 'sjc123',
          is_locked: false,
          status: 'draft',
          last_updated: '2026-10-29 14:20'
        },
        {
          id: 4,
          code: 'chemistry',
          name: 'PG & Research Department of Chemistry',
          school: 'School of Chemical Sciences',
          hod_name: 'Dr. A. Rose Venis',
          password: 'sjc123',
          is_locked: false,
          status: 'draft',
          last_updated: '2026-10-28 11:00'
        },
        {
          id: 5,
          code: 'maths',
          name: 'PG & Research Department of Mathematics',
          school: 'School of Computing Sciences',
          hod_name: 'Dr. J. Maria Joseph',
          password: 'sjc123',
          is_locked: false,
          status: 'draft',
          last_updated: '2026-10-28 09:30'
        },
        {
          id: 6,
          code: 'history',
          name: 'Department of History',
          school: 'School of Social Sciences',
          hod_name: 'Dr. K. Lingammal',
          password: 'sjc123',
          is_locked: false,
          status: 'draft',
          last_updated: '2026-10-29 16:45'
        },
        {
          id: 7,
          code: 'english',
          name: 'Department of English',
          school: 'School of Languages',
          hod_name: 'Dr. V. L. Jayapaul',
          password: 'sjc123',
          is_locked: false,
          status: 'draft',
          last_updated: '2026-10-27 15:10'
        },
        {
          id: 8,
          code: 'economics',
          name: 'Department of Economics',
          school: 'School of Management Studies',
          hod_name: 'Dr. S. Sujatha',
          password: 'sjc123',
          is_locked: false,
          status: 'draft',
          last_updated: '2026-10-30 08:50'
        }
      ],
      admins: [
        {
          id: 1,
          username: 'admin',
          name: 'IQAC Administrator',
          role: 'IQAC Director / Administrator',
          password: 'admin123'
        },
        {
          id: 2,
          username: 'iqac_coord',
          name: 'Dr. A. John Peter',
          role: 'IQAC Coordinator',
          password: 'sjc123'
        }
      ]
    };

    this.saveUsersDB(initialDB);
    return initialDB;
  }

  saveUsersDB(db) {
    try {
      localStorage.setItem('IQAC_USERS_DB', JSON.stringify(db));
      if (db && Array.isArray(db.departments)) {
        const names = db.departments.map(d => d.name);
        this.saveDepartmentList(names);
      }
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to save users DB:', e);
      return false;
    }
  }

  addDepartmentUser(deptData) {
    const db = this.getUsersDB();
    const cleanCode = (deptData.code || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanCode) throw new Error('Valid Department Code / User ID is required');

    if (db.departments.some(d => d.code.toLowerCase() === cleanCode)) {
      throw new Error(`Department User ID "${cleanCode}" already exists`);
    }

    const newDept = {
      id: Date.now(),
      code: cleanCode,
      name: (deptData.name || '').trim(),
      school: (deptData.school || 'Department').trim(),
      hod_name: (deptData.hod_name || '').trim(),
      password: (deptData.password || 'sjc123').trim(),
      is_locked: false,
      status: 'draft',
      last_updated: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    db.departments.push(newDept);
    this.saveUsersDB(db);
    return newDept;
  }

  updateDepartmentUser(code, updates) {
    const db = this.getUsersDB();
    const idx = db.departments.findIndex(d => d.code.toLowerCase() === code.toLowerCase());
    if (idx === -1) throw new Error(`Department "${code}" not found`);

    db.departments[idx] = { ...db.departments[idx], ...updates };
    this.saveUsersDB(db);
    return db.departments[idx];
  }

  deleteDepartmentUser(code) {
    const db = this.getUsersDB();
    const initialLen = db.departments.length;
    db.departments = db.departments.filter(d => d.code.toLowerCase() !== code.toLowerCase());
    if (db.departments.length === initialLen) throw new Error(`Department "${code}" not found`);
    this.saveUsersDB(db);
    return true;
  }

  addAdminUser(adminData) {
    const db = this.getUsersDB();
    const cleanUsername = (adminData.username || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) throw new Error('Valid Admin User ID is required');

    if (db.admins.some(a => a.username.toLowerCase() === cleanUsername)) {
      throw new Error(`Admin User ID "${cleanUsername}" already exists`);
    }

    const newAdmin = {
      id: Date.now(),
      username: cleanUsername,
      name: (adminData.name || 'IQAC Officer').trim(),
      role: (adminData.role || 'IQAC Coordinator').trim(),
      password: (adminData.password || 'admin123').trim()
    };

    db.admins.push(newAdmin);
    this.saveUsersDB(db);
    return newAdmin;
  }

  updateAdminUser(username, updates) {
    const db = this.getUsersDB();
    const idx = db.admins.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
    if (idx === -1) throw new Error(`Admin "${username}" not found`);

    db.admins[idx] = { ...db.admins[idx], ...updates };
    this.saveUsersDB(db);
    return db.admins[idx];
  }

  deleteAdminUser(username) {
    if (username.toLowerCase() === 'admin') {
      throw new Error('Default root administrator account cannot be deleted');
    }
    const db = this.getUsersDB();
    const initialLen = db.admins.length;
    db.admins = db.admins.filter(a => a.username.toLowerCase() !== username.toLowerCase());
    if (db.admins.length === initialLen) throw new Error(`Admin "${username}" not found`);
    this.saveUsersDB(db);
    return true;
  }
}

// Global singleton instance
window.dataStore = new DataStore();
