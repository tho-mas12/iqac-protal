// Course Plan Full Application (Faculty, HOD & IQAC Admin)
// St. Joseph's College (Autonomous), Tiruchirappalli - IQAC
// Academic Year 2026-2027 (Even Semester)

class CoursePlanApp {
  constructor() {
    this.departments = [];
    this.selectedDept = localStorage.getItem('CP_SELECTED_DEPT') || 'Computer Science';
    this.currentUser = null; // null (Faculty/Public), { role: 'hod', department_name: ... }, { role: 'admin' }
    this.plans = [];
    this.activePlan = null;
    this.viewMode = 'form'; // Default directly to 'form' for faculty data entry
    this.activeFormTab = 'part1'; // 'part1' | 'part2' | 'part3' | 'declaration'
    this.adminFilter = 'all'; // 'all' | 'Approved' | 'Pending'
    this.adminDeptFilter = 'all';
  }

  async init() {
    await this.loadDepartmentsData();
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
      authStatusEl.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Faculty Portal (No Login Required)
          </span>
          <button 
            type="button" 
            onclick="coursePlanApp.openLoginModal()" 
            class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <i data-lucide="lock" class="w-3.5 h-3.5"></i>
            <span>HOD / IQAC Login</span>
          </button>
        </div>
      `;
    }
  }

  // ================= 1. FACULTY DASHBOARD (DIRECT DATA ENTRY) =================
  renderFacultyDashboardHtml() {
    const deptObj = this.getCurrentDepartmentObj();
    const plans = this.plans;

    return `
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
                      <td class="p-3">
                        <div class="font-bold text-slate-900">${p.course_code || '—'}</div>
                        <div class="text-slate-600 text-[11px] font-semibold">${p.course_title || 'Untitled Course'}</div>
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
  renderHODDashboardHtml() {
    const dept = this.currentUser.department_name;
    const plans = this.plans;
    const pendingPlans = plans.filter(p => p.hod_status === 'Pending' || p.status === 'Submitted');
    const approvedPlans = plans.filter(p => p.hod_status === 'Approved');

    return `
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
              Review course plans submitted by faculty members for each theory course. Once verified and approved, course records are published directly to IQAC.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button 
              type="button" 
              onclick="coursePlanApp.fetchPlans().then(() => coursePlanApp.render())" 
              class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20 flex items-center gap-1.5"
            >
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- HOD KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Course Submissions</div>
            <div class="text-2xl font-black text-slate-900">${plans.length}</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/40">
            <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Awaiting Your Review</div>
            <div class="text-2xl font-black text-amber-700">${pendingPlans.length}</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/40">
            <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Approved & Sent to IQAC</div>
            <div class="text-2xl font-black text-emerald-700">${approvedPlans.length}</div>
          </div>
        </div>

        <!-- HOD Review Table -->
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
                    <th class="p-3 text-center">Status</th>
                    <th class="p-3 text-center">HOD Decision</th>
                    <th class="p-3 text-center">Review Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${plans.map((p, idx) => `
                    <tr class="hover:bg-slate-50/70 transition">
                      <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                      <td class="p-3">
                        <div class="font-bold text-slate-900">${p.course_code || '—'}</div>
                        <div class="text-slate-600 text-[11px] font-semibold">${p.course_title}</div>
                      </td>
                      <td class="p-3 text-slate-700">${p.programme || '—'} (${p.year_class || ''})</td>
                      <td class="p-3 font-bold text-slate-900">${p.faculty_name}</td>
                      <td class="p-3 text-center">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}">
                          ${p.status}
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.hod_status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }">
                          ${p.hod_status === 'Approved' ? 'Approved' : 'Pending Review'}
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        <div class="inline-flex items-center gap-2">
                          <button 
                            type="button" 
                            onclick="coursePlanApp.openHODReviewModal(${p.id})" 
                            class="px-3 py-1.5 ${p.hod_status === 'Approved' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-amber-500 hover:bg-amber-600 text-white font-bold'} rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <i data-lucide="${p.hod_status === 'Approved' ? 'check' : 'edit-3'}" class="w-3.5 h-3.5"></i>
                            <span>${p.hod_status === 'Approved' ? 'Re-inspect' : 'Review & Approve'}</span>
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
      </div>
    `;
  }

  // ================= 3. IQAC ADMIN DASHBOARD (COLLEGE-WIDE AUDIT) =================
  renderAdminDashboardHtml() {
    const plans = this.plans;
    const approvedPlans = plans.filter(p => p.hod_status === 'Approved');
    const pendingPlans = plans.filter(p => p.hod_status === 'Pending' || p.status === 'Submitted');

    return `
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
              class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20 flex items-center gap-1.5"
            >
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- Macro KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Submissions</div>
            <div class="text-2xl font-black text-slate-900">${plans.length}</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/40">
            <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">HOD Approved (Ready for Audit)</div>
            <div class="text-2xl font-black text-emerald-700">${approvedPlans.length}</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/40">
            <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Pending HOD Approval</div>
            <div class="text-2xl font-black text-amber-700">${pendingPlans.length}</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-purple-200 shadow-2xs bg-purple-50/40">
            <div class="text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1">Academic Departments</div>
            <div class="text-2xl font-black text-purple-900">34 Departments</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2 text-xs">
              <span class="font-bold text-slate-600">Filter Department:</span>
              <select 
                onchange="coursePlanApp.onAdminDeptFilterChange(this.value)" 
                class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 text-xs"
              >
                <option value="all">All Departments</option>
                ${this.departments.map(d => `
                  <option value="${d.name}" ${this.adminDeptFilter === d.name ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="flex items-center gap-2 text-xs">
              <span class="font-bold text-slate-600">Approval Status:</span>
              <select 
                onchange="coursePlanApp.onAdminStatusFilterChange(this.value)" 
                class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 text-xs"
              >
                <option value="all" ${this.adminFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="Approved" ${this.adminFilter === 'Approved' ? 'selected' : ''}>Approved by HOD Only</option>
                <option value="Pending" ${this.adminFilter === 'Pending' ? 'selected' : ''}>Pending HOD Approval</option>
              </select>
            </div>
          </div>

          <span class="text-xs font-bold text-slate-500">${plans.length} course plan(s) displayed</span>
        </div>

        <!-- Admin Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full">
          <div class="overflow-x-auto w-full">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th class="p-3 text-center w-12">S.No</th>
                  <th class="p-3">Department</th>
                  <th class="p-3">Course Code & Title</th>
                  <th class="p-3">Faculty Member</th>
                  <th class="p-3 text-center">HOD Approval Status</th>
                  <th class="p-3 text-center">Approved By</th>
                  <th class="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                ${plans.length === 0 ? `
                  <tr><td colspan="7" class="p-8 text-center text-slate-400">No course plans match your filter criteria.</td></tr>
                ` : plans.map((p, idx) => `
                  <tr class="hover:bg-slate-50/70 transition">
                    <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                    <td class="p-3 font-bold text-indigo-900">${p.department_name}</td>
                    <td class="p-3">
                      <div class="font-bold text-slate-900">${p.course_code || '—'}</div>
                      <div class="text-slate-600 text-[11px]">${p.course_title}</div>
                    </td>
                    <td class="p-3 font-semibold text-slate-800">${p.faculty_name}</td>
                    <td class="p-3 text-center">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.hod_status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }">
                        ${p.hod_status === 'Approved' ? '✓ HOD Approved' : '⏳ Pending HOD Review'}
                      </span>
                    </td>
                    <td class="p-3 text-center text-[11px] text-slate-500 font-medium">
                      ${p.hod_name || '—'}
                    </td>
                    <td class="p-3 text-center">
                      <div class="inline-flex items-center gap-1.5">
                        <button 
                          type="button" 
                          onclick="coursePlanApp.previewPlan(${p.id})" 
                          class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition"
                        >
                          View / Print Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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
    const cos = plan.course_outcomes || [];
    const dtp = plan.detailed_teaching_plan || [];
    const ucp = plan.unit_completion_plan || [];
    const acts = plan.learning_activities || [];
    const assts = plan.assessment_plan || [];
    const icts = plan.ict_integration || [];
    const decl = plan.declaration || {};

    return `
      <div class="space-y-6 animate-fadeIn w-full">
        <!-- Top Sticky Action Bar -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-20">
          <div class="flex items-center gap-3">
            <button 
              type="button" 
              onclick="coursePlanApp.backToDashboard()" 
              class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition border border-slate-200 shrink-0 cursor-pointer"
              title="View all course submissions in this department"
            >
              <i data-lucide="list" class="w-4 h-4 text-slate-500"></i>
              <span class="hidden sm:inline">Department Submissions</span>
            </button>
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Course Plan Form
                </span>
                <span class="text-xs font-semibold text-slate-400">•</span>
                <span class="text-xs font-bold text-slate-700">${plan.department_name || this.selectedDept}</span>
              </div>
              <h2 class="text-lg font-black tracking-tight text-slate-900 truncate">
                ${plan.course_title ? plan.course_title : (plan.course_code || 'New Theory Course Plan')}
              </h2>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button 
              type="button" 
              onclick="coursePlanApp.createNewPlan()" 
              class="text-xs px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
              title="Clear form and start a new course plan"
            >
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>New Form</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.previewCurrentPlan()" 
              class="text-xs px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
            >
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>Print Preview</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.saveCurrentPlan('Draft')" 
              class="text-xs px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
            >
              <i data-lucide="save" class="w-4 h-4 text-slate-500"></i>
              <span>Save as Draft</span>
            </button>
            <button 
              type="button" 
              onclick="coursePlanApp.saveCurrentPlan('Submitted')" 
              class="text-xs px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95"
            >
              <i data-lucide="send" class="w-4 h-4"></i>
              <span>Submit to HOD</span>
            </button>
          </div>
        </div>

        <!-- Institutional Header Banner (matching PDF Header) -->
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md text-center space-y-1.5">
          <div class="text-xs uppercase tracking-widest font-bold text-indigo-200">Internal Quality Assurance Cell (IQAC)</div>
          <div class="text-xl font-black tracking-tight">St. Joseph’s College (Autonomous), Tiruchirappalli</div>
          <div class="text-sm font-extrabold text-amber-300 pt-1 tracking-wide">
            COURSE PLAN – ACADEMIC YEAR 2026–2027 (Even Semester)
          </div>
          <div class="text-[11px] text-indigo-100 max-w-2xl mx-auto pt-2 bg-white/10 rounded-xl p-2.5 mt-2 border border-white/15">
            <strong>Instructions:</strong> Dear Professor, The course plan shall be prepared for all the theory courses before the commencement of the course and submitted to the Head of the Department for review and approval.
          </div>
        </div>

        <!-- Part-wise Navigation Tabs -->
        <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
          <button 
            type="button" 
            onclick="coursePlanApp.switchFormTab('part1')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.activeFormTab === 'part1' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">I</span>
            <span>Part-I: Course Information & Outcomes</span>
          </button>
          <button 
            type="button" 
            onclick="coursePlanApp.switchFormTab('part2')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.activeFormTab === 'part2' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">II</span>
            <span>Part-II: Unit-wise Teaching Plan</span>
          </button>
          <button 
            type="button" 
            onclick="coursePlanApp.switchFormTab('part3')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.activeFormTab === 'part3' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">III</span>
            <span>Part-III: Activities & CIA Assessment</span>
          </button>
          <button 
            type="button" 
            onclick="coursePlanApp.switchFormTab('declaration')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.activeFormTab === 'declaration' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">IV</span>
            <span>Declaration & HOD Approval</span>
          </button>
        </div>

        <!-- ================= PART I SECTION ================= -->
        <div id="section-part1" class="${this.activeFormTab === 'part1' ? '' : 'hidden'} space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div class="border-b border-slate-200 pb-3">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Part-I: Course Information</h3>
              <p class="text-[11px] text-slate-500">General details & Course Outcomes (COs) mapped to K-Levels</p>
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
                </div>

                <!-- Programme -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Programme (e.g. B.Sc. Computer Science) *</label>
                  <input 
                    type="text" 
                    id="cp-programme" 
                    value="${plan.programme || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-none" 
                    placeholder="e.g. B.Sc. Computer Science / M.Sc."
                  />
                </div>

                <!-- Year and Class -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Year and Class (e.g. I BSc) *</label>
                  <input 
                    type="text" 
                    id="cp-year-class" 
                    value="${plan.year_class || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-none" 
                    placeholder="e.g. I BSc / II MSc"
                  />
                </div>

                <!-- Semester -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Semester</label>
                  <select id="cp-semester" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:border-indigo-600 focus:outline-none">
                    <option value="Even Semester" selected>Even Semester (2026–2027)</option>
                    <option value="Semester II" ${plan.semester === 'Semester II' ? 'selected' : ''}>Semester II</option>
                    <option value="Semester IV" ${plan.semester === 'Semester IV' ? 'selected' : ''}>Semester IV</option>
                    <option value="Semester VI" ${plan.semester === 'Semester VI' ? 'selected' : ''}>Semester VI</option>
                  </select>
                </div>

                <!-- Course Code -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Course Code *</label>
                  <input 
                    type="text" 
                    id="cp-course-code" 
                    value="${plan.course_code || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:border-indigo-600 focus:outline-none" 
                    placeholder="e.g. 23UCS401"
                  />
                </div>

                <!-- Course Title -->
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Course Title *</label>
                  <input 
                    type="text" 
                    id="cp-course-title" 
                    value="${plan.course_title || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold focus:border-indigo-600 focus:outline-none" 
                    placeholder="e.g. Database Management Systems"
                  />
                </div>

                <!-- Course Category -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Course Category</label>
                  <select id="cp-course-category" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:border-indigo-600 focus:outline-none">
                    <option value="Core" ${plan.course_category === 'Core' ? 'selected' : ''}>Core</option>
                    <option value="Elective" ${plan.course_category === 'Elective' ? 'selected' : ''}>Elective</option>
                    <option value="Allied" ${plan.course_category === 'Allied' ? 'selected' : ''}>Allied</option>
                    <option value="Skill Enhancement (SEC)" ${plan.course_category === 'Skill Enhancement (SEC)' ? 'selected' : ''}>Skill Enhancement (SEC)</option>
                    <option value="Value Added (VAC)" ${plan.course_category === 'Value Added (VAC)' ? 'selected' : ''}>Value Added (VAC)</option>
                  </select>
                </div>

                <!-- Teaching Hours -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Total Teaching Hours & Hours/Week</label>
                  <input 
                    type="text" 
                    id="cp-teaching-hours" 
                    value="${plan.teaching_hours || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-none" 
                    placeholder="e.g. 60 Hours & 4 Hours/Week"
                  />
                </div>

                <!-- Course Credits -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Course Credits</label>
                  <input 
                    type="text" 
                    id="cp-credits" 
                    value="${plan.credits || ''}" 
                    class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold focus:border-indigo-600 focus:outline-none" 
                    placeholder="e.g. 4"
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
                <button 
                  type="button" 
                  onclick="coursePlanApp.addCORow()" 
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                >
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add CO
                </button>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2.5 w-24">CO Code</th>
                      <th class="p-2.5">Course Outcome</th>
                      <th class="p-2.5 w-44">K-Levels</th>
                      <th class="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="cp-cos-tbody" class="divide-y divide-slate-100">
                    ${cos.map((co, idx) => `
                      <tr>
                        <td class="p-2">
                          <input type="text" class="co-code w-full text-xs px-2 py-1.5 font-bold font-mono border border-slate-300 rounded bg-slate-50" value="${co.code || 'CO' + (idx + 1)}" />
                        </td>
                        <td class="p-2">
                          <textarea class="co-outcome w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-600 focus:outline-none" rows="2" placeholder="State outcome statement...">${co.outcome || ''}</textarea>
                        </td>
                        <td class="p-2">
                          <select class="co-klevel w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-semibold bg-white">
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
                        <td class="p-2 text-center">
                          <button type="button" onclick="coursePlanApp.deleteCORow(${idx})" class="p-1 text-slate-400 hover:text-red-600 rounded">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Next Part Button -->
            <div class="flex justify-end pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onclick="coursePlanApp.switchFormTab('part2')" 
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
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
            <div class="border-b border-slate-200 pb-3">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Part-II: Unit-wise Teaching Plan</h3>
              <p class="text-[11px] text-slate-500">Divide each unit into manageable topics, allocate hours, and map Course Outcomes</p>
            </div>

            <!-- A. Detailed Teaching Plan -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. Detailed Teaching Plan</h4>
                  <p class="text-[11px] text-slate-500">Instruction: Divide each unit into manageable topics and allocate appropriate teaching hours.</p>
                </div>
                <button 
                  type="button" 
                  onclick="coursePlanApp.addTeachingPlanRow()" 
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                >
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Topic Row
                </button>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200 max-h-[500px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0 z-10">
                    <tr>
                      <th class="p-2.5 w-32">Month / Days</th>
                      <th class="p-2.5 w-24">Unit</th>
                      <th class="p-2.5">Topics to Be Covered</th>
                      <th class="p-2.5 w-28">From Date</th>
                      <th class="p-2.5 w-28">To Date</th>
                      <th class="p-2.5 w-20 text-center">Hours</th>
                      <th class="p-2.5 w-20 text-center">COs</th>
                      <th class="p-2.5 w-44">Teaching Methodology</th>
                      <th class="p-2.5 w-36">Learning Resources</th>
                      <th class="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="cp-dtp-tbody" class="divide-y divide-slate-100">
                    ${dtp.map((row, idx) => `
                      <tr>
                        <td class="p-1.5">
                          <input type="text" class="dtp-month w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-bold" value="${row.month_days || ''}" placeholder="e.g. November/10" />
                        </td>
                        <td class="p-1.5">
                          <select class="dtp-unit w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-semibold bg-white">
                            <option value="Unit I" ${row.unit === 'Unit I' ? 'selected' : ''}>Unit I</option>
                            <option value="Unit II" ${row.unit === 'Unit II' ? 'selected' : ''}>Unit II</option>
                            <option value="Unit III" ${row.unit === 'Unit III' ? 'selected' : ''}>Unit III</option>
                            <option value="Unit IV" ${row.unit === 'Unit IV' ? 'selected' : ''}>Unit IV</option>
                            <option value="Unit V" ${row.unit === 'Unit V' ? 'selected' : ''}>Unit V</option>
                          </select>
                        </td>
                        <td class="p-1.5">
                          <textarea class="dtp-topics w-full text-xs px-2 py-1.5 border border-slate-300 rounded" rows="2" placeholder="List topics...">${row.topics || ''}</textarea>
                        </td>
                        <td class="p-1.5">
                          <input type="date" class="dtp-from w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-mono" value="${row.from_date || ''}" />
                        </td>
                        <td class="p-1.5">
                          <input type="date" class="dtp-to w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-mono" value="${row.to_date || ''}" />
                        </td>
                        <td class="p-1.5 text-center">
                          <input type="number" class="dtp-hours w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-bold text-center" value="${row.hours || ''}" placeholder="Hrs" />
                        </td>
                        <td class="p-1.5 text-center">
                          <input type="text" class="dtp-cos w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-bold text-center" value="${row.cos || 'CO1'}" />
                        </td>
                        <td class="p-1.5">
                          <input type="text" class="dtp-method w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${row.methodology || ''}" placeholder="Lecture, Case Study, etc." />
                        </td>
                        <td class="p-1.5">
                          <input type="text" class="dtp-resources w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${row.resources || ''}" placeholder="PPT / Text Book" />
                        </td>
                        <td class="p-1.5 text-center">
                          <button type="button" onclick="coursePlanApp.deleteTeachingPlanRow(${idx})" class="p-1 text-slate-400 hover:text-red-600 rounded">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- B. Unit Completion Plan -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">B. Unit Completion Plan</h4>
              <p class="text-[11px] text-slate-500 italic">
                Note: This section provides an overview of the time allocated to each unit. Helps the faculty member and Head of the Department monitor syllabus coverage.
              </p>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse">
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
                        <td class="p-2.5 font-bold text-slate-800">${u.unit}</td>
                        <td class="p-2 text-center">
                          <input type="number" class="ucp-planned w-28 text-xs px-2 py-1.5 border border-slate-300 rounded font-bold text-center" value="${u.planned_hours || ''}" onchange="coursePlanApp.calculateTotalHours()" placeholder="0" />
                        </td>
                        <td class="p-2 text-center">
                          <input type="number" class="ucp-actual w-28 text-xs px-2 py-1.5 border border-slate-300 rounded font-bold text-center" value="${u.actual_hours || ''}" onchange="coursePlanApp.calculateTotalHours()" placeholder="0" />
                        </td>
                        <td class="p-2">
                          <input type="date" class="ucp-date w-48 text-xs px-2.5 py-1.5 border border-slate-300 rounded font-mono" value="${u.target_date || ''}" />
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
              <button type="button" onclick="coursePlanApp.switchFormTab('part1')" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">← Back to Part-I</button>
              <button type="button" onclick="coursePlanApp.switchFormTab('part3')" class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                <span>Continue to Part-III: Activities</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ================= PART III SECTION ================= -->
        <div id="section-part3" class="${this.activeFormTab === 'part3' ? '' : 'hidden'} space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div class="border-b border-slate-200 pb-3">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Part-III: Learning Activities and Assessment Plan</h3>
              <p class="text-[11px] text-slate-500">Activities enabling application, analysis, and institutional assessment schedules</p>
            </div>

            <!-- A. Learning Activities -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. Learning Activities</h4>
                  <p class="text-[11px] text-slate-500 italic">Select suitable activities based on the nature of the course.</p>
                </div>
                <button 
                  type="button" 
                  onclick="coursePlanApp.addActivityRow()" 
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                >
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Activity
                </button>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2.5 w-12 text-center">S.No</th>
                      <th class="p-2.5 w-60">Learning Activity</th>
                      <th class="p-2.5">Related Unit / Topic</th>
                      <th class="p-2.5">Expected Learning Outcome</th>
                      <th class="p-2.5 w-36">Proposed Date</th>
                      <th class="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="cp-acts-tbody" class="divide-y divide-slate-100 font-medium">
                    ${acts.map((act, idx) => `
                      <tr>
                        <td class="p-2 text-center font-bold text-slate-400">${idx + 1}</td>
                        <td class="p-2">
                          <input type="text" class="act-name w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-bold" value="${act.activity || ''}" />
                        </td>
                        <td class="p-2">
                          <input type="text" class="act-topic w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded" value="${act.topic || ''}" placeholder="Unit / Topic..." />
                        </td>
                        <td class="p-2">
                          <input type="text" class="act-outcome w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded" value="${act.outcome || ''}" placeholder="Outcome..." />
                        </td>
                        <td class="p-2">
                          <input type="date" class="act-date w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-mono" value="${act.proposed_date || ''}" />
                        </td>
                        <td class="p-2 text-center">
                          <button type="button" onclick="coursePlanApp.deleteActivityRow(${idx})" class="p-1 text-slate-400 hover:text-red-600 rounded">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- B. Assessment Plan -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">B. Assessment Plan</h4>
                  <p class="text-[11px] text-slate-500 italic">Plan assessments in accordance with institutional examination regulations.</p>
                </div>
                <button 
                  type="button" 
                  onclick="coursePlanApp.addAssessmentRow()" 
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                >
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add CIA Row
                </button>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2.5 w-12 text-center">S.No</th>
                      <th class="p-2.5 w-44">CIA Component</th>
                      <th class="p-2.5 w-20 text-center">Marks</th>
                      <th class="p-2.5 w-48">Assessment Category</th>
                      <th class="p-2.5">Unit / Syllabus Coverage</th>
                      <th class="p-2.5 w-28">From Date</th>
                      <th class="p-2.5 w-28">To Date</th>
                      <th class="p-2.5 w-24 text-center">COs</th>
                      <th class="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="cp-assts-tbody" class="divide-y divide-slate-100 font-medium">
                    ${assts.map((asst, idx) => `
                      <tr>
                        <td class="p-2 text-center font-bold text-slate-400">${idx + 1}</td>
                        <td class="p-2">
                          <input type="text" class="asst-comp w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-bold" value="${asst.component || ''}" />
                        </td>
                        <td class="p-2 text-center">
                          <input type="text" class="asst-marks w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-black text-center" value="${asst.marks || ''}" />
                        </td>
                        <td class="p-2">
                          <input type="text" class="asst-cat w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${asst.category || ''}" />
                        </td>
                        <td class="p-2">
                          <input type="text" class="asst-cov w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${asst.unit_coverage || ''}" />
                        </td>
                        <td class="p-2">
                          <input type="date" class="asst-from w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-mono" value="${asst.from_date || ''}" />
                        </td>
                        <td class="p-2">
                          <input type="date" class="asst-to w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-mono" value="${asst.to_date || ''}" />
                        </td>
                        <td class="p-2 text-center">
                          <input type="text" class="asst-cos w-full text-xs px-1.5 py-1.5 border border-slate-300 rounded font-bold text-center" value="${asst.cos_assessed || ''}" />
                        </td>
                        <td class="p-2 text-center">
                          <button type="button" onclick="coursePlanApp.deleteAssessmentRow(${idx})" class="p-1 text-slate-400 hover:text-red-600 rounded">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
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
                    ${icts.map((ict, idx) => `
                      <tr>
                        <td class="p-2 text-center font-bold text-slate-400">${idx + 1}</td>
                        <td class="p-2">
                          <input type="text" class="ict-topic w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${ict.topic || ''}" />
                        </td>
                        <td class="p-2">
                          <input type="text" class="ict-tool w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-bold" value="${ict.tool || ''}" />
                        </td>
                        <td class="p-2">
                          <input type="text" class="ict-platform w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${ict.platform || ''}" />
                        </td>
                        <td class="p-2">
                          <input type="text" class="ict-purpose w-full text-xs px-2 py-1.5 border border-slate-300 rounded" value="${ict.purpose || ''}" />
                        </td>
                        <td class="p-2 text-center">
                          <button type="button" onclick="coursePlanApp.deleteICTRow(${idx})" class="p-1 text-slate-400 hover:text-red-600 rounded">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="flex justify-between pt-4 border-t border-slate-100">
              <button type="button" onclick="coursePlanApp.switchFormTab('part2')" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">← Back to Part-II</button>
              <button type="button" onclick="coursePlanApp.switchFormTab('declaration')" class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                <span>Continue to Declaration & Submission</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ================= DECLARATION SECTION ================= -->
        <div id="section-declaration" class="${this.activeFormTab === 'declaration' ? '' : 'hidden'} space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div class="border-b border-slate-200 pb-3">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Declaration & Submissions</h3>
              <p class="text-[11px] text-slate-500">Confirm preparation compliance and submit directly to Head of Department</p>
            </div>

            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <div class="flex items-start gap-2.5">
                <input type="checkbox" id="cp-decl-check" checked class="mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer" />
                <label for="cp-decl-check" class="font-medium cursor-pointer">
                  <strong>Declaration by the Faculty Member:</strong> I hereby confirm that the course plan has been prepared based on the approved syllabus, prescribed teaching hours, academic calendar, and institutional assessment regulations.
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="p-4 border border-slate-200 rounded-xl space-y-3">
                <div class="text-[11px] font-bold text-slate-600 uppercase">Faculty Signature & Date</div>
                <div>
                  <label class="block text-[10px] text-slate-500 font-bold">Faculty Member Name</label>
                  <input type="text" id="cp-decl-fac-sig" value="${decl.faculty_signature || plan.faculty_name || ''}" class="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-semibold" />
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

            <!-- Bottom Action Controls -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
              <button type="button" onclick="coursePlanApp.switchFormTab('part3')" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">← Back to Part-III</button>

              <div class="flex items-center gap-2.5">
                <button 
                  type="button" 
                  onclick="coursePlanApp.saveCurrentPlan('Draft')" 
                  class="text-xs px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
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
                  <span>Submit to HOD for Approval</span>
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
            <strong>Instructions:</strong> Dear Professor, The course plan shall be prepared for all the theory courses before the commencement of the course and submitted to the Head of the Department for review and approval.
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
                <div><span class="font-bold text-slate-600">Semester:</span> ${plan.semester || 'Even Semester'}</div>
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
                    <th class="border border-slate-300 p-1.5">Topics Covered</th>
                    <th class="border border-slate-300 p-1.5 text-center">Dates</th>
                    <th class="border border-slate-300 p-1.5 text-center">Hours</th>
                    <th class="border border-slate-300 p-1.5 text-center">COs</th>
                    <th class="border border-slate-300 p-1.5">Methodology</th>
                    <th class="border border-slate-300 p-1.5">Resources</th>
                  </tr>
                </thead>
                <tbody>
                  ${dtp.map(row => `
                    <tr>
                      <td class="border border-slate-300 p-1.5 font-bold">${row.month_days}</td>
                      <td class="border border-slate-300 p-1.5">${row.unit}</td>
                      <td class="border border-slate-300 p-1.5">${row.topics || '—'}</td>
                      <td class="border border-slate-300 p-1.5 text-center text-[10px] whitespace-nowrap">
                        ${row.from_date || ''} ${row.to_date ? 'to ' + row.to_date : ''}
                      </td>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${row.hours || '—'}</td>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${row.cos || '—'}</td>
                      <td class="border border-slate-300 p-1.5">${row.methodology || '—'}</td>
                      <td class="border border-slate-300 p-1.5">${row.resources || '—'}</td>
                    </tr>
                  `).join('')}
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
                <thead class="bg-slate-100 font-bold">
                  <tr>
                    <th class="border border-slate-300 p-1.5 w-12 text-center">S.No</th>
                    <th class="border border-slate-300 p-1.5">Activity</th>
                    <th class="border border-slate-300 p-1.5">Related Unit / Topic</th>
                    <th class="border border-slate-300 p-1.5">Expected Learning Outcome</th>
                    <th class="border border-slate-300 p-1.5 text-center">Proposed Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${acts.map((a, i) => `
                    <tr>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${i + 1}</td>
                      <td class="border border-slate-300 p-1.5 font-bold">${a.activity}</td>
                      <td class="border border-slate-300 p-1.5">${a.topic || '—'}</td>
                      <td class="border border-slate-300 p-1.5">${a.outcome || '—'}</td>
                      <td class="border border-slate-300 p-1.5 text-center font-mono">${a.proposed_date || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="text-xs pl-2 pt-2 space-y-1.5">
              <div class="font-bold text-slate-700">B. Assessment Plan</div>
              <table class="w-full text-xs border border-slate-300 border-collapse">
                <thead class="bg-slate-100 font-bold text-[11px]">
                  <tr>
                    <th class="border border-slate-300 p-1.5 w-10 text-center">S.No</th>
                    <th class="border border-slate-300 p-1.5">CIA Component</th>
                    <th class="border border-slate-300 p-1.5 text-center">Marks</th>
                    <th class="border border-slate-300 p-1.5">Category</th>
                    <th class="border border-slate-300 p-1.5">Coverage</th>
                    <th class="border border-slate-300 p-1.5 text-center">Proposed Dates</th>
                    <th class="border border-slate-300 p-1.5 text-center">COs</th>
                  </tr>
                </thead>
                <tbody>
                  ${assts.map((asst, i) => `
                    <tr>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${i + 1}</td>
                      <td class="border border-slate-300 p-1.5 font-bold">${asst.component}</td>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${asst.marks}</td>
                      <td class="border border-slate-300 p-1.5">${asst.category}</td>
                      <td class="border border-slate-300 p-1.5">${asst.unit_coverage || '—'}</td>
                      <td class="border border-slate-300 p-1.5 text-center text-[10px] whitespace-nowrap">
                        ${asst.from_date || ''} ${asst.to_date ? 'to ' + asst.to_date : ''}
                      </td>
                      <td class="border border-slate-300 p-1.5 text-center font-bold">${asst.cos_assessed || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="text-xs pl-2 pt-2 space-y-1.5">
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

  // ================= TAB SWITCHING =================
  switchFormTab(tabKey) {
    this.harvestFormInputs();
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
    this.viewMode = 'print';
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToDashboard() {
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
    const deptObj = this.getCurrentDepartmentObj();
    const facObj = (deptObj.faculty || []).find(f => f.name === facName);
    const hint = document.getElementById('cp-faculty-email-hint');
    if (hint && facObj) {
      hint.textContent = facObj.email ? `Email: ${facObj.email} | Shift: ${facObj.shift}` : '';
      if (facObj.email) this.activePlan.faculty_email = facObj.email;
    }
    const declSig = document.getElementById('cp-decl-fac-sig');
    if (declSig && !declSig.value) declSig.value = facName;
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
    const deptObj = this.getCurrentDepartmentObj();
    const firstFac = (deptObj.faculty && deptObj.faculty.length > 0) ? deptObj.faculty[0].name : '';
    const firstEmail = (deptObj.faculty && deptObj.faculty.length > 0) ? deptObj.faculty[0].email : '';

    return {
      id: null,
      department_name: this.selectedDept,
      faculty_name: firstFac,
      faculty_email: firstEmail,
      programme: '',
      year_class: '',
      semester: 'Even Semester',
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
        { month_days: 'November/10', unit: 'Unit I', topics: '', from_date: '', to_date: '', hours: '', cos: 'CO1', methodology: 'Lecture / PPT', resources: 'Text Book / PPT' },
        { month_days: 'December/19', unit: 'Unit II', topics: '', from_date: '', to_date: '', hours: '', cos: 'CO2', methodology: 'Lecture / PPT', resources: 'Text Book / PPT' },
        { month_days: 'January/13', unit: 'Unit III', topics: '', from_date: '', to_date: '', hours: '', cos: 'CO3', methodology: 'Demonstration / Case Study', resources: 'Reference Book / Web Link' },
        { month_days: 'February/22', unit: 'Unit IV', topics: '', from_date: '', to_date: '', hours: '', cos: 'CO4', methodology: 'Group Discussion / Problem Solving', resources: 'Case Study Material' },
        { month_days: 'March/12', unit: 'Unit V', topics: '', from_date: '', to_date: '', hours: '', cos: 'CO5', methodology: 'Blended / Seminar', resources: 'Online Resources / NPTEL' }
      ],
      unit_completion_plan: [
        { unit: 'Unit I', planned_hours: '', actual_hours: '', target_date: '' },
        { unit: 'Unit II', planned_hours: '', actual_hours: '', target_date: '' },
        { unit: 'Unit III', planned_hours: '', actual_hours: '', target_date: '' },
        { unit: 'Unit IV', planned_hours: '', actual_hours: '', target_date: '' },
        { unit: 'Unit V', planned_hours: '', actual_hours: '', target_date: '' }
      ],
      learning_activities: [
        { sno: '1', activity: 'Assignment', topic: '', outcome: '', proposed_date: '' },
        { sno: '2', activity: 'Group Discussion / Seminar', topic: '', outcome: '', proposed_date: '' },
        { sno: '3', activity: 'Case Study / Problem-Solving Exercise', topic: '', outcome: '', proposed_date: '' },
        { sno: '4', activity: 'Project / Practical Activity', topic: '', outcome: '', proposed_date: '' },
        { sno: '5', activity: 'Quiz / Presentation / Other Activity', topic: '', outcome: '', proposed_date: '' }
      ],
      assessment_plan: [
        { sno: '1', component: 'C1 – K1, K2', marks: '15', category: 'MCQ through JosTEL', unit_coverage: 'Unit I & II', from_date: '2027-01-09', to_date: '2027-01-13', cos_assessed: 'CO1, CO2' },
        { sno: '2', component: 'Mid Sem', marks: '30', category: 'Written Examination', unit_coverage: 'Unit I, II, III', from_date: '2027-01-21', to_date: '2027-01-30', cos_assessed: 'CO1, CO2, CO3' },
        { sno: '3', component: 'C2 - K4', marks: '10/6', category: 'Assignment / Seminar', unit_coverage: 'Unit III', from_date: '', to_date: '', cos_assessed: 'CO4' },
        { sno: '4', component: 'C2 - K5', marks: '10/6', category: 'Problem Solving / Project', unit_coverage: 'Unit IV', from_date: '', to_date: '', cos_assessed: 'CO5' },
        { sno: '5', component: 'C2 - K6', marks: '7', category: 'Creative Model / Review', unit_coverage: 'Unit V', from_date: '', to_date: '', cos_assessed: 'CO6' },
        { sno: '6', component: 'Library Referencing - K3', marks: '5', category: 'Library Notes / Reference', unit_coverage: 'Units I - V', from_date: '', to_date: '', cos_assessed: 'CO3' },
        { sno: '7', component: 'End Sem', marks: '30', category: 'Written Examination', unit_coverage: 'All Units (I - V)', from_date: '2027-03-16', to_date: '2027-03-24', cos_assessed: 'CO1 to CO6' }
      ],
      ict_integration: [
        { sno: '1', topic: 'Overview & Core Concepts', tool: 'PPT / Video Lecture', platform: 'JosTEL / Classroom', purpose: 'Visual Conceptual Understanding' },
        { sno: '2', topic: 'Formative Knowledge Checks', tool: 'LMS / Online Quiz', platform: 'JosTEL', purpose: 'Assessment of Learning Outcomes' },
        { sno: '3', topic: 'Practical Demonstrations', tool: 'Simulation / Subject-Specific Software', platform: 'Lab Software / Open Source', purpose: 'Hands-on Skill Acquisition' },
        { sno: '4', topic: 'Reference Literature', tool: 'E-Books / Online Database', platform: 'College Digital Library / N-LIST', purpose: 'Self-Paced Extended Reading' }
      ],
      declaration: {
        confirmed: true,
        faculty_signature: firstFac,
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

  addActivityRow() {
    this.harvestFormInputs();
    const count = (this.activePlan.learning_activities || []).length + 1;
    this.activePlan.learning_activities.push({ sno: String(count), activity: '', topic: '', outcome: '', proposed_date: '' });
    this.render();
  }

  deleteActivityRow(idx) {
    this.harvestFormInputs();
    this.activePlan.learning_activities.splice(idx, 1);
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
    this.activePlan.year_class = document.getElementById('cp-year-class')?.value || '';
    this.activePlan.semester = document.getElementById('cp-semester')?.value || 'Even Semester';
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
        k_level: tr.querySelector('.co-klevel')?.value || ''
      });
    });
    if (cos.length > 0) this.activePlan.course_outcomes = cos;

    // Detailed Teaching Plan
    const dtpRows = document.querySelectorAll('#cp-dtp-tbody tr');
    const dtp = [];
    dtpRows.forEach(tr => {
      dtp.push({
        month_days: tr.querySelector('.dtp-month')?.value || '',
        unit: tr.querySelector('.dtp-unit')?.value || 'Unit I',
        topics: tr.querySelector('.dtp-topics')?.value || '',
        from_date: tr.querySelector('.dtp-from')?.value || '',
        to_date: tr.querySelector('.dtp-to')?.value || '',
        hours: tr.querySelector('.dtp-hours')?.value || '',
        cos: tr.querySelector('.dtp-cos')?.value || '',
        methodology: tr.querySelector('.dtp-method')?.value || '',
        resources: tr.querySelector('.dtp-resources')?.value || ''
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

    // Learning Activities
    const actRows = document.querySelectorAll('#cp-acts-tbody tr');
    const acts = [];
    actRows.forEach((tr, i) => {
      acts.push({
        sno: String(i + 1),
        activity: tr.querySelector('.act-name')?.value || '',
        topic: tr.querySelector('.act-topic')?.value || '',
        outcome: tr.querySelector('.act-outcome')?.value || '',
        proposed_date: tr.querySelector('.act-date')?.value || ''
      });
    });
    if (acts.length > 0) this.activePlan.learning_activities = acts;

    // Assessment Plan
    const asstRows = document.querySelectorAll('#cp-assts-tbody tr');
    const assts = [];
    asstRows.forEach((tr, i) => {
      assts.push({
        sno: String(i + 1),
        component: tr.querySelector('.asst-comp')?.value || '',
        marks: tr.querySelector('.asst-marks')?.value || '',
        category: tr.querySelector('.asst-cat')?.value || '',
        unit_coverage: tr.querySelector('.asst-cov')?.value || '',
        from_date: tr.querySelector('.asst-from')?.value || '',
        to_date: tr.querySelector('.asst-to')?.value || '',
        cos_assessed: tr.querySelector('.asst-cos')?.value || ''
      });
    });
    if (assts.length > 0) this.activePlan.assessment_plan = assts;

    // ICT Integration
    const ictRows = document.querySelectorAll('#cp-icts-tbody tr');
    const icts = [];
    ictRows.forEach((tr, i) => {
      icts.push({
        sno: String(i + 1),
        topic: tr.querySelector('.ict-topic')?.value || '',
        tool: tr.querySelector('.ict-tool')?.value || '',
        platform: tr.querySelector('.ict-platform')?.value || '',
        purpose: tr.querySelector('.ict-purpose')?.value || ''
      });
    });
    if (icts.length > 0) this.activePlan.ict_integration = icts;

    // Declaration
    this.activePlan.declaration = {
      confirmed: document.getElementById('cp-decl-check')?.checked || true,
      faculty_signature: document.getElementById('cp-decl-fac-sig')?.value || this.activePlan.faculty_name,
      submission_date: document.getElementById('cp-decl-fac-date')?.value || new Date().toISOString().split('T')[0]
    };
  }

  async saveCurrentPlan(status = 'Draft') {
    this.harvestFormInputs();
    this.activePlan.status = status;

    if (!this.activePlan.faculty_name) {
      alert('Please select your Faculty Name from the dropdown.');
      this.switchFormTab('part1');
      return;
    }

    if (!this.activePlan.course_code || !this.activePlan.course_title) {
      alert('Please enter Course Code and Course Title.');
      this.switchFormTab('part1');
      return;
    }

    try {
      const res = await fetch('api/course_plan.php?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.activePlan)
      });
      const json = await res.json();
      if (json.success) {
        alert(status === 'Submitted' 
          ? `✓ Course plan submitted successfully to the Head of the Department (${this.activePlan.department_name}) for review and approval!`
          : '✓ Course plan draft saved successfully!'
        );
        this.backToDashboard();
      } else {
        alert(json.error || 'Failed to save course plan');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving course plan. Please check server connection.');
    }
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
  openLoginModal() {
    const modalHtml = `
      <div id="course-plan-login-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
          
          <div class="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <i data-lucide="lock" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-slate-900">Course Plan Sign-In</h3>
                <p class="text-[11px] text-slate-500">Access for Heads of Department & IQAC Admin</p>
              </div>
            </div>
            <button type="button" onclick="document.getElementById('course-plan-login-modal').remove()" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Tabs -->
            <div class="flex border-b border-slate-200">
              <button 
                type="button" 
                id="login-tab-btn-hod" 
                onclick="coursePlanApp.switchLoginTab('hod')" 
                class="flex-1 pb-2.5 text-xs font-bold text-indigo-600 border-b-2 border-indigo-600 text-center"
              >
                HOD Login
              </button>
              <button 
                type="button" 
                id="login-tab-btn-admin" 
                onclick="coursePlanApp.switchLoginTab('admin')" 
                class="flex-1 pb-2.5 text-xs font-bold text-slate-400 border-b-2 border-transparent text-center"
              >
                IQAC Admin Login
              </button>
            </div>

            <!-- HOD Login Form -->
            <div id="login-form-hod" class="space-y-3.5 text-xs">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Select Department</label>
                <select id="login-hod-dept" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-800">
                  ${this.departments.map(d => `
                    <option value="${d.name}" ${d.name === this.selectedDept ? 'selected' : ''}>${d.name}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">HOD Password</label>
                <input type="password" id="login-hod-pass" value="sjcHOD2026" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono" placeholder="Enter HOD password" />
                <p class="text-[10px] text-slate-400 mt-1">Default HOD Password: <code class="font-mono text-indigo-600 font-bold">sjcHOD2026</code></p>
              </div>

              <button 
                type="button" 
                onclick="coursePlanApp.performLogin('hod')" 
                class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                Sign In as HOD
              </button>
            </div>

            <!-- Admin Login Form -->
            <div id="login-form-admin" class="space-y-3.5 text-xs hidden">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Admin Username</label>
                <input type="text" id="login-admin-user" value="admin" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono" />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Admin Password</label>
                <input type="password" id="login-admin-pass" value="sjcIQAC-portal26" class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono" />
                <p class="text-[10px] text-slate-400 mt-1">Default Password: <code class="font-mono text-indigo-600 font-bold">sjcIQAC-portal26</code></p>
              </div>

              <button 
                type="button" 
                onclick="coursePlanApp.performLogin('admin')" 
                class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                Sign In as IQAC Admin
              </button>
            </div>

            <div class="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
              Are you a faculty member entering course details? <br />
              <button type="button" onclick="document.getElementById('course-plan-login-modal').remove()" class="text-indigo-600 font-bold hover:underline">
                Continue without login →
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) lucide.createIcons();
  }

  switchLoginTab(tab) {
    const btnHod = document.getElementById('login-tab-btn-hod');
    const btnAdmin = document.getElementById('login-tab-btn-admin');
    const formHod = document.getElementById('login-form-hod');
    const formAdmin = document.getElementById('login-form-admin');

    if (tab === 'hod') {
      btnHod.className = 'flex-1 pb-2.5 text-xs font-bold text-indigo-600 border-b-2 border-indigo-600 text-center';
      btnAdmin.className = 'flex-1 pb-2.5 text-xs font-bold text-slate-400 border-b-2 border-transparent text-center';
      formHod.classList.remove('hidden');
      formAdmin.classList.add('hidden');
    } else {
      btnAdmin.className = 'flex-1 pb-2.5 text-xs font-bold text-purple-600 border-b-2 border-purple-600 text-center';
      btnHod.className = 'flex-1 pb-2.5 text-xs font-bold text-slate-400 border-b-2 border-transparent text-center';
      formAdmin.classList.remove('hidden');
      formHod.classList.add('hidden');
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
