// IQAC AAA 2026-2027 - Application Controller & Coordinator

class App {
  constructor() {
    this.currentView = 'dashboard'; // default to dashboard
  }

  async init() {
    // Initialize components
    window.formBuilder = new FormBuilder('form-container');
    window.dashboardRenderer = new DashboardRenderer('dashboard-container');
    window.adminDashboard = new AdminDashboard('admin-container');
    window.attributeFilterHub = new AttributeFilterHub('filter-container');

    // Subscribe to store updates
    window.dataStore.subscribe((data) => {
      this.onDataUpdated(data);
    });

    // Initialize Auth
    if (window.authManager) {
      window.authManager.init();
      window.authManager.subscribe((user) => {
        this.onAuthChanged(user);
      });
    }

    // Load initial data
    await window.dataStore.init();

    // Setup Department Dropdown
    this.refreshDeptDropdown();
    this.refreshYearSelectors();

    // Hash navigation listener
    window.addEventListener('hashchange', () => {
      this.handleHashRoute();
    });

    // Navigate to appropriate view based on hash or role
    if (!this.handleHashRoute()) {
      if (window.authManager && window.authManager.isAdmin()) {
        this.switchView('admin');
      } else {
        this.switchView('form');
      }
    }
  }

  handleHashRoute() {
    const rawHash = (window.location.hash || '').replace('#', '').trim();
    if (!rawHash) return false;

    if (rawHash === 'form' || rawHash.startsWith('form') || rawHash.startsWith('att') || rawHash === 'part_a') {
      this.switchView('form');
      if (window.formBuilder) {
        if (rawHash.startsWith('att') || rawHash === 'part_a' || rawHash.startsWith('form-')) {
          const cardId = rawHash.replace('form-', '');
          window.formBuilder.openCard(cardId);
        }
      }
      return true;
    }

    if (['admin', 'dashboard', 'filter', 'dept-data'].includes(rawHash)) {
      if (window.authManager && window.authManager.isAdmin()) {
        this.switchView(rawHash);
        return true;
      }
    }
    return false;
  }

  onAuthChanged(user) {
    this.refreshDeptDropdown();
    if (this.handleHashRoute()) {
      return;
    }
    if (user && user.role === 'admin') {
      this.switchView('admin');
    } else if (user && user.role === 'department') {
      if (user.department_name) {
        window.dataStore.switchDepartment(user.department_name);
      }
      this.switchView('form');
    }
  }

  refreshDeptDropdown() {
    const select = document.getElementById('dept-switcher-select');
    if (!select) return;

    const list = window.dataStore.getDepartmentList();
    const active = window.dataStore.activeDepartment;

    select.innerHTML = list.map(d => `
      <option value="${d}" ${d === active ? 'selected' : ''}>${d}</option>
    `).join('') + `<option value="__NEW__">+ Add New Department...</option>`;
  }

  async onDeptChanged(deptName) {
    if (deptName === '__NEW__') {
      const newName = await window.showPromptDialog('Enter New Department Name (e.g. PG & Research Department of Physics):', '', 'Add New Department', { placeholder: 'e.g. PG & Research Department of Physics', confirmText: 'Add Department' });
      if (newName && newName.trim()) {
        window.dataStore.switchDepartment(newName.trim());
        this.refreshDeptDropdown();
        this.switchView('form');
      } else {
        this.refreshDeptDropdown();
      }
      return;
    }
    window.dataStore.switchDepartment(deptName);
  }

  onDataUpdated(data) {
    if (!data) return;

    // Update active department indicators
    const label = document.getElementById('active-dept-label');
    if (label && data.departmentInfo) {
      label.textContent = data.departmentInfo.departmentName || 'Department';
    }
    const topDept = document.getElementById('top-dept-name');
    if (topDept) {
      topDept.textContent = window.dataStore?.activeDepartment || 'Department';
    }
    const topBadge = document.getElementById('top-dept-display-name');
    const topIcon = document.getElementById('top-dept-icon');
    if (topBadge) {
      const authUser = window.authManager?.getUser();
      const isAdmin = authUser && authUser.role === 'admin';
      if (isAdmin) {
        topBadge.textContent = 'IQAC Admin';
        if (topIcon) topIcon.setAttribute('data-lucide', 'shield-check');
      } else {
        const name = authUser?.department_name || authUser?.display_name || window.dataStore?.activeDepartment || 'Department';
        topBadge.textContent = name;
        if (topIcon) topIcon.setAttribute('data-lucide', 'building-2');
      }
      if (window.lucide) lucide.createIcons();
    }
    const sidebarDl = document.getElementById('sidebar-deadline-text');
    if (sidebarDl && window.dataStore) {
      sidebarDl.textContent = window.dataStore.formatDeadlineForDisplay();
    }
    const topDl = document.getElementById('topbar-deadline-text');
    if (topDl && window.dataStore) {
      topDl.textContent = window.dataStore.formatDeadlineForDisplay();
    }
    const topDlWidget = document.getElementById('topbar-deadline-widget');
    if (topDlWidget && window.dataStore) {
      const isAdmin = window.authManager && window.authManager.isAdmin();
      if (isAdmin) {
        topDlWidget.classList.add('hidden');
      } else {
        topDlWidget.classList.remove('hidden');
        if (window.dataStore.isDeadlinePassed()) {
          topDlWidget.className = 'flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 shadow-2xs animate-pulse';
        } else {
          topDlWidget.className = 'flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/90 rounded-xl text-xs font-bold text-amber-900 shadow-2xs';
        }
      }
    }

    // Update active view
    switch (this.currentView) {
      case 'admin':
        if (window.adminDashboard) window.adminDashboard.loadData();
        break;
      case 'form':
        if (window.formBuilder) window.formBuilder.render(data);
        break;
      case 'dashboard':
        if (window.dashboardRenderer) window.dashboardRenderer.render(data);
        break;
      case 'filter':
        if (window.attributeFilterHub) window.attributeFilterHub.render();
        break;
      case 'dept-profile':
        this.renderDeptProfile();
        break;
      case 'dept-data':
        if (window.adminDashboard) {
          window.adminDashboard.renderDepartmentDataPage('dept-data-container');
        }
        break;
    }
  }

  switchView(viewName) {
    const isAdmin = window.authManager && window.authManager.isAdmin();
    // Restrict department users strictly to Attribute Forms and Department Info
    if (!isAdmin && viewName !== 'form' && viewName !== 'dept-profile') {
      viewName = 'form';
    }

    this.currentView = viewName;

    // Hide all view containers
    const views = ['admin', 'form', 'dashboard', 'filter', 'dept-profile', 'dept-data'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }

      // Update Nav Buttons for Palette Theme Sidebar
      const btn = document.getElementById(`nav-btn-${v}`);
      if (btn) {
        if (v === viewName) {
          btn.classList.remove('text-slate-700', 'hover:text-[#26648E]', 'hover:bg-white', 'bg-white/80', 'border-slate-200');
          btn.classList.add('bg-[#26648E]', 'text-white', 'font-bold', 'shadow-md', 'shadow-[#26648E]/25', 'border-[#26648E]');
        } else {
          btn.classList.remove('bg-[#26648E]', 'text-white', 'font-bold', 'shadow-md', 'shadow-[#26648E]/25', 'border-[#26648E]', 'bg-blue-600');
          btn.classList.add('text-slate-700', 'hover:text-[#26648E]', 'hover:bg-white', 'bg-white/80', 'border', 'border-slate-200', 'shadow-2xs', 'font-semibold');
        }
      }

      // Update Top Navbar Buttons
      const topBtn = document.getElementById(`topnav-btn-${v}`);
      if (topBtn) {
        if (!isAdmin) {
          // Department login: strictly hide all topnav buttons (forms are direct and dept info is top-right icon)
          if (v === 'admin' || v === 'dept-data' || v === 'filter' || v === 'dashboard' || v === 'form') {
            topBtn.className = 'hidden';
          }
        } else if (isAdmin && v === 'dept-profile') {
          topBtn.className = 'hidden';
        } else {
          if (v === viewName) {
            topBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer bg-[#26648E] text-white shadow-xs';
          } else {
            topBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer text-slate-700 hover:text-[#26648E] hover:bg-white/80';
          }
        }
      }
    });

    // Update Top Right Department Account Button Active State
    const deptAccountBtn = document.getElementById('top-dept-account-btn');
    if (deptAccountBtn) {
      if (viewName === 'dept-profile') {
        deptAccountBtn.className = 'flex items-center gap-2 px-3 py-1.5 bg-[#26648E] text-white border border-[#26648E] rounded-xl transition cursor-pointer shadow-md shadow-[#26648E]/25 group';
        const subLbl = document.getElementById('top-dept-sub-label');
        if (subLbl) subLbl.className = 'block text-[9px] font-bold text-blue-200 uppercase tracking-wider';
        const nameLbl = document.getElementById('top-dept-display-name');
        if (nameLbl) nameLbl.className = 'block text-xs font-black text-white tracking-tight max-w-[140px] truncate leading-tight';
      } else {
        deptAccountBtn.className = 'flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#26648E]/10 via-[#4F8FC0]/10 to-[#FFE3B3]/25 hover:from-[#26648E]/20 hover:to-[#FFE3B3]/40 border border-[#4F8FC0]/35 rounded-xl transition cursor-pointer shadow-2xs group';
        const subLbl = document.getElementById('top-dept-sub-label');
        if (subLbl) subLbl.className = 'block text-[9px] font-bold text-slate-500 uppercase tracking-wider';
        const nameLbl = document.getElementById('top-dept-display-name');
        if (nameLbl) nameLbl.className = 'block text-xs font-black text-[#26648E] tracking-tight max-w-[140px] truncate leading-tight';
      }
    }

    // Render active view
    if (viewName === 'dept-data' && window.adminDashboard) {
      window.adminDashboard.renderDepartmentDataPage('dept-data-container');
    }
    this.onDataUpdated(window.dataStore.data);
  }

  toggleDeptProfile() {
    if (this.currentView === 'dept-profile') {
      this.switchView('form');
    } else {
      this.switchView('dept-profile');
    }
  }

  refreshYearSelectors() {
    if (!window.dataStore) return;
    const activeYear = window.dataStore.getActiveYear();
    const years = window.dataStore.getAcademicYearsList();
    const isAdmin = window.authManager && window.authManager.isAdmin();

    const topContainer = document.getElementById('topbar-year-container');
    if (topContainer) {
      if (isAdmin) {
        topContainer.innerHTML = `
          <div class="flex items-center gap-1.5 bg-[#FFE3B3] px-2.5 py-1 rounded-xl border border-[#fedba0] shadow-2xs">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#26648E]"></i>
            <span class="text-xs font-black text-[#26648E]">Year:</span>
            <select 
              id="topbar-active-year-select"
              onchange="app.onGlobalYearChange(this.value)"
              class="text-xs font-black text-[#26648E] bg-transparent outline-none cursor-pointer"
              title="Switch Active Academic Year"
            >
              ${years.map(y => `<option value="${y}" ${y === activeYear ? 'selected' : ''}>${y}</option>`).join('')}
              <option value="__NEW__">+ Add New Year...</option>
              <option value="__DELETE__">🗑️ Delete Active Year...</option>
            </select>
            <button 
              type="button" 
              onclick="app.deleteActiveYear()" 
              class="p-0.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
              title="Delete Active Academic Year and erase all its data"
            >
              <i data-lucide="trash-2" class="w-3 h-3 text-rose-500"></i>
            </button>
          </div>
        `;
      } else {
        topContainer.innerHTML = `
          <div class="flex items-center gap-1.5 bg-[#FFE3B3] px-2.5 py-1 rounded-xl border border-[#fedba0] shadow-2xs select-none">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#26648E]"></i>
            <span class="text-xs font-black text-[#26648E]">Active Year: ${activeYear}</span>
          </div>
        `;
      }
      if (window.lucide) lucide.createIcons({ root: topContainer });
    }

    // Inside Department Data page if open
    const deptDataSel = document.getElementById('dept-data-active-year-selector');
    if (deptDataSel) {
      deptDataSel.innerHTML = years.map(y => `
        <option value="${y}" ${y === activeYear ? 'selected' : ''}>${y}</option>
      `).join('') + '<option value="__NEW__">+ Add New Year...</option><option value="__DELETE__">🗑️ Delete Active Year...</option>';
    }
  }

  async onGlobalYearChange(val) {
    if (window.authManager && !window.authManager.isAdmin()) {
      window.showToast('Access Restricted: Only IQAC Administrators can change academic years.', 'error', 3500, 'Access Denied');
      this.refreshYearSelectors();
      return;
    }
    if (val === '__NEW__') {
      const newYear = await window.showPromptDialog(
        'Enter New Academic Year in format YYYY - YYYY (e.g. 2027 - 2028):',
        '',
        'Add Academic Year',
        { placeholder: '2027 - 2028', confirmText: 'Add Year' }
      );
      if (newYear && newYear.trim()) {
        window.dataStore.addAcademicYear(newYear.trim());
        window.dataStore.setActiveYear(newYear.trim());
        window.showToast(`Academic Year "${newYear.trim()}" created successfully!`, 'success', 3500, 'Academic Year Added');
      }
    } else if (val === '__DELETE__') {
      await this.deleteActiveYear();
      return;
    } else if (val) {
      window.dataStore.setActiveYear(val);
      window.showToast(`Active Academic Year switched to "${val}". Previous year records safely preserved.`, 'success', 3500, 'Academic Year Switched');
    }

    this.refreshYearSelectors();
    this.onDataUpdated(window.dataStore.data);
  }

  async deleteActiveYear() {
    if (window.authManager && !window.authManager.isAdmin()) {
      window.showToast('Access Restricted: Only IQAC Administrators can delete academic years.', 'error', 3500, 'Access Denied');
      this.refreshYearSelectors();
      return;
    }

    const activeYear = window.dataStore ? window.dataStore.getActiveYear() : '2026 - 2027';
    const list = window.dataStore ? window.dataStore.getAcademicYearsList() : [];

    if (list.length <= 1) {
      window.showToast('Cannot delete the only remaining academic year.', 'warning', 3500, 'Delete Restricted');
      this.refreshYearSelectors();
      return;
    }

    const confirmed = await window.showConfirmDialog(
      `Are you sure you want to permanently delete Academic Year "${activeYear}"?\n\nWARNING: All departmental records, audit data, and submissions for "${activeYear}" will be completely erased. This action cannot be undone.`,
      `Delete Academic Year (${activeYear})`,
      { confirmText: 'Yes, Delete Year & Erase Data', cancelText: 'Cancel', type: 'danger' }
    );

    if (confirmed) {
      try {
        const res = window.dataStore.deleteAcademicYear(activeYear);
        window.showToast(`Academic Year "${activeYear}" and all its departmental records have been permanently erased. Switched to "${res.activeYear}".`, 'warning', 5000, 'Academic Year Deleted');
      } catch (e) {
        window.showToast('Error deleting academic year: ' + e.message, 'error', 3500, 'Delete Error');
      }
    }

    this.refreshYearSelectors();
    this.onDataUpdated(window.dataStore.data);
  }

  showAdminTab() {
    this.switchView('admin');
  }

  showFormTab() {
    this.switchView('form');
  }

  showDashboardTab() {
    this.switchView('dashboard');
  }

  showAttributeWiseView(attrKey = 'all') {
    this.switchView('dashboard');
    if (window.dashboardRenderer) {
      window.dashboardRenderer.setAttributeFilter(attrKey);
    }
  }

  showPresentationTab(slideIndex = null) {
    this.switchView('presentation');
    if (slideIndex !== null && window.presentationMode) {
      window.presentationMode.goToSlide(slideIndex);
    }
  }

  showPanelTab() {
    this.switchView('panel');
  }

  showManageTab() {
    this.switchView('manage');
  }

  renderManageTab(data) {
    const container = document.getElementById('manage-container');
    if (!container) return;

    const list = window.dataStore.getDepartmentList();

    container.innerHTML = `
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div class="border-b border-slate-200 pb-3 mb-4">
            <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="database" class="w-5 h-5 text-blue-600"></i>
              IQAC Data Management & Submission Hub
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              Uniformity and time-saving: Export standardized JSON files, load sample data, or import department submissions.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 1. Sample Data Loader -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h3 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <i data-lucide="sparkles" class="w-4 h-4 text-amber-500"></i>
                  1. Load Sample Demonstrations
                </h3>
                <p class="text-xs text-slate-500 mt-1">
                  Load pre-populated, realistic AAA audit data to test and preview all dashboard and presentation views instantly.
                </p>
              </div>
              <div class="space-y-2 pt-2">
                <button type="button" onclick="app.loadSampleData('cs')" class="w-full text-xs py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                  <i data-lucide="code" class="w-4 h-4"></i>
                  <span>Load Computer Science Sample</span>
                </button>
                <button type="button" onclick="app.loadSampleData('commerce')" class="w-full text-xs py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                  <i data-lucide="briefcase" class="w-4 h-4"></i>
                  <span>Load Commerce Sample</span>
                </button>
                <button type="button" onclick="app.loadBlankTemplate()" class="w-full text-xs py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg transition flex items-center justify-center gap-2">
                  <i data-lucide="file-plus" class="w-4 h-4"></i>
                  <span>New Blank Template</span>
                </button>
              </div>
            </div>

            <!-- 2. Export / Backup -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h3 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <i data-lucide="download" class="w-4 h-4 text-emerald-600"></i>
                  2. Export Department Data
                </h3>
                <p class="text-xs text-slate-500 mt-1">
                  Download the current department's audit data as a standardized JSON file to submit to IQAC or save offline.
                </p>
              </div>
              <div class="space-y-2 pt-2">
                <button type="button" onclick="window.dataStore.exportJSON()" class="w-full text-xs py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                  <i data-lucide="download-cloud" class="w-4 h-4"></i>
                  <span>Download Department JSON</span>
                </button>
                <button type="button" onclick="window.print()" class="w-full text-xs py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                  <i data-lucide="printer" class="w-4 h-4"></i>
                  <span>Print Dossier / Save PDF</span>
                </button>
              </div>
            </div>

            <!-- 3. Import Department Submission -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h3 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <i data-lucide="upload" class="w-4 h-4 text-purple-600"></i>
                  3. Import Department Submission
                </h3>
                <p class="text-xs text-slate-500 mt-1">
                  Upload a previously exported JSON file from any department coordinator or HOD to review.
                </p>
              </div>
              <div class="pt-2">
                <input type="file" id="import-file-input" accept=".json" onchange="app.handleFileImport(event)" class="hidden" />
                <button type="button" onclick="document.getElementById('import-file-input').click()" class="w-full text-xs py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                  <i data-lucide="folder-open" class="w-4 h-4"></i>
                  <span>Select JSON File to Import</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Departments in Local Storage -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
          <h3 class="text-sm font-bold text-slate-800">Departments Configured on this Device</h3>
          <div class="divide-y divide-slate-100 text-xs">
            ${list.map(d => `
              <div class="py-2.5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i data-lucide="building" class="w-4 h-4 text-slate-400"></i>
                  <span class="font-medium text-slate-800">${d}</span>
                  ${d === window.dataStore.activeDepartment ? '<span class="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">Active</span>' : ''}
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" onclick="app.onDeptChanged('${d}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition">
                    Switch To
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  async loadSampleData(sampleType) {
    const success = await window.dataStore.loadSample(sampleType);
    if (success) {
      this.refreshDeptDropdown();
      alert(`Loaded sample data for ${sampleType.toUpperCase()} department.`);
      this.switchView('dashboard');
    }
  }

  async loadBlankTemplate() {
    await window.dataStore.loadBlankTemplate();
    this.refreshDeptDropdown();
    this.switchView('form');
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const res = window.dataStore.importJSON(content);
      if (res.success) {
        this.refreshDeptDropdown();
        alert('Department data imported successfully!');
        this.switchView('dashboard');
      } else {
        alert('Import Error: ' + res.error);
      }
    };
    reader.readAsText(file);
  }
  toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const toggleText = document.getElementById('sidebar-toggle-text');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    if (!sidebar) return;

    const isHidden = sidebar.classList.contains('hidden');
    if (isHidden) {
      sidebar.classList.remove('hidden');
      if (toggleText) toggleText.textContent = 'Hide Menu';
      if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'panel-left-close');
    } else {
      sidebar.classList.add('hidden');
      if (toggleText) toggleText.textContent = 'Show Menu';
      if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'panel-left-open');
    }
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ================= DEPARTMENT PROFILE & INFO PAGE =================
  renderDeptProfile() {
    const container = document.getElementById('dept-profile-container');
    if (!container) return;

    const authUser = window.authManager ? window.authManager.getUser() : null;
    const db = window.dataStore ? window.dataStore.getUsersDB() : { departments: [] };
    const deptCode = authUser ? authUser.username : (window.dataStore?.activeDepartment || 'cs');
    const deptObj = (db.departments || []).find(d => d.code.toLowerCase() === deptCode.toLowerCase()) || {
      name: window.dataStore?.activeDepartment || 'Department',
      code: deptCode,
      hod_name: 'HOD In-Charge',
      status: 'In Progress'
    };

    const activeYear = window.dataStore ? window.dataStore.getActiveYear() : '2026 - 2027';
    const deadlineStr = window.dataStore ? window.dataStore.formatDeadlineForDisplay() : 'No Cutoff Configured';

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-[#26648E] via-[#33729e] to-[#4F8FC0] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFE3B3] text-[#26648E]">
                Active Year: ${activeYear}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                Dept User ID: ${deptObj.code}
              </span>
            </div>
            <h1 class="text-2xl font-black tracking-tight text-white">
              ${deptObj.name}
            </h1>
            <p class="text-xs text-blue-100 mt-0.5 font-medium">
              Departmental Profile, Submission Status, and Security Credentials
            </p>
          </div>

          <div class="shrink-0">
            <span class="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
              deptObj.status === 'submitted' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'
            } shadow-sm">
              Status: ${deptObj.status || 'Draft'}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Card 1: Department Information -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#26648E] flex items-center justify-center font-bold">
                <i data-lucide="building" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Institutional Details</h3>
                <p class="text-[11px] text-slate-500">Official Department Profile Records</p>
              </div>
            </div>

            <div class="space-y-3 text-xs">
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="font-bold text-slate-500">Department Name:</span>
                <span class="font-extrabold text-slate-800 text-right">${deptObj.name}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="font-bold text-slate-500">Department User ID:</span>
                <span class="font-mono font-bold text-blue-700">${deptObj.code}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="font-bold text-slate-500">Head of Department:</span>
                <span class="font-bold text-slate-800">${deptObj.hod_name || 'HOD In-Charge'}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="font-bold text-slate-500">Audit Academic Year:</span>
                <span class="font-black text-[#26648E]">${activeYear}</span>
              </div>
              <div class="flex justify-between py-1.5">
                <span class="font-bold text-slate-500">Submission Cutoff:</span>
                <span class="font-mono font-bold text-amber-800">${deadlineStr}</span>
              </div>
            </div>

            <div class="pt-2">
              <button 
                type="button" 
                onclick="app.switchView('form')" 
                class="w-full py-2.5 bg-[#26648E] hover:bg-[#1b4b6d] text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <i data-lucide="book-open" class="w-4 h-4 text-[#53D2DC]"></i>
                <span>Open Attribute Forms (1-10)</span>
              </button>
            </div>
          </div>

          <!-- Card 2: Change Password & Security -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <i data-lucide="key-round" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Change Password</h3>
                <p class="text-[11px] text-slate-500">Update login password for ${deptObj.code}</p>
              </div>
            </div>

            <form onsubmit="app.handleDeptPasswordChange(event, '${deptObj.code}')" class="space-y-3.5">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                <input 
                  type="password" 
                  id="dept-new-password" 
                  required 
                  placeholder="Enter new password"
                  class="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#4F8FC0] focus:border-[#26648E] outline-none font-medium bg-white"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                <input 
                  type="password" 
                  id="dept-confirm-password" 
                  required 
                  placeholder="Re-type new password"
                  class="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#4F8FC0] focus:border-[#26648E] outline-none font-medium bg-white"
                />
              </div>

              <div class="pt-2">
                <button 
                  type="submit" 
                  class="w-full py-2.5 bg-[#26648E] hover:bg-[#1b4b6d] text-white font-black rounded-xl text-xs transition shadow-md shadow-[#26648E]/25 ring-2 ring-[#53D2DC]/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i data-lucide="shield-check" class="w-4 h-4 text-[#53D2DC]"></i>
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons({ root: container });
  }

  handleDeptPasswordChange(event, code) {
    event.preventDefault();
    const newPass = document.getElementById('dept-new-password')?.value;
    const confirmPass = document.getElementById('dept-confirm-password')?.value;

    if (!newPass || !newPass.trim()) {
      window.showToast('Please enter a valid new password.', 'warning', 3500, 'Invalid Password');
      return;
    }

    if (newPass !== confirmPass) {
      window.showToast('Passwords do not match. Please re-enter carefully.', 'error', 3500, 'Password Mismatch');
      return;
    }

    try {
      if (window.dataStore) {
        window.dataStore.updateDepartmentUser(code, { password: newPass.trim() });
        window.showToast(`Password for ${code} updated successfully! Use your new password on future logins.`, 'success', 4000, 'Security Updated');
        document.getElementById('dept-new-password').value = '';
        document.getElementById('dept-confirm-password').value = '';
      }
    } catch (e) {
      window.showToast('Error updating password: ' + e.message, 'error', 3500, 'Update Error');
    }
  }


}

// Global App Instance
window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
