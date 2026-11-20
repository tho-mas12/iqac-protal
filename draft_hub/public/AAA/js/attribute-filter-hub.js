// IQAC AAA 2026-2027 - Cross-Department Attribute Data Explorer & Filter Hub
// Features:
// 1. Filter by Attribute (PART-A and Attributes 1 to 10).
// 2. Filter by Specific Sheet (e.g. 1.1, 1.2, 1.3, ... 1.11, 2.1, etc.).
// 3. Filter by Department (All Departments or select a specific department).
// 4. Live keyword search across all fields (names, titles, organizations, codes).
// 5. Quick filter chips (SDG Linked, MoU Linkages, IKS Based, Non-empty records).
// 6. Collapsible Filter Control Bar with Hide / Show toggle.
// 7. Full-width responsive data table with Department badges.
// 8. One-click Export to Excel for filtered dataset.

class AttributeFilterHub {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedAttribute = 'all'; // 'all' or card ID e.g. 'att1', 'att2'
    this.selectedSheet = 'all';     // 'all' or sheet key e.g. '1.1', '1.5'
    this.selectedDepartment = 'all';// 'all' or department name
    this.searchQuery = '';
    this.quickFilter = 'all';       // 'all', 'sdg', 'mou', 'iks', 'non_empty'
    this.isFiltersCollapsed = false;// Toggle for Hide / Show option
  }

  getMasterSchema() {
    if (window.dataStore && typeof window.dataStore.getAllCardsSchema === 'function') {
      return window.dataStore.getAllCardsSchema();
    }
    return window.ALL_ATTRIBUTES_CARDS_SCHEMA || [];
  }

  toggleFilters() {
    this.isFiltersCollapsed = !this.isFiltersCollapsed;
    this.render();
  }

  onAttributeChange(attrId) {
    this.selectedAttribute = attrId;
    this.selectedSheet = 'all'; // Reset sheet when attribute changes
    this.render();
  }

  onSheetChange(sheetKey) {
    this.selectedSheet = sheetKey;
    this.render();
  }

  onDepartmentChange(deptName) {
    this.selectedDepartment = deptName;
    this.render();
  }

  onSearchInput(query) {
    this.searchQuery = (query || '').trim().toLowerCase();
    this.renderTableOnly();
  }

  setQuickFilter(preset) {
    this.quickFilter = preset;
    this.render();
  }

  resetFilters() {
    this.selectedAttribute = 'all';
    this.selectedSheet = 'all';
    this.selectedDepartment = 'all';
    this.searchQuery = '';
    this.quickFilter = 'all';
    this.render();
  }

  // Retrieve all records across departments matching criteria
  getFilteredRecords() {
    const cards = this.getMasterSchema();
    const deptList = window.dataStore ? window.dataStore.getDepartmentList() : ['Computer Science', 'Commerce'];
    const results = [];

    // Filter departments to inspect
    const targetDepts = this.selectedDepartment === 'all'
      ? deptList
      : deptList.filter(d => d === this.selectedDepartment);

    targetDepts.forEach(deptName => {
      // Load departmental audit data
      let deptData = null;
      if (window.dataStore && window.dataStore.activeDepartment === deptName && window.dataStore.data) {
        deptData = window.dataStore.data;
      } else {
        const stored = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') ? localStorage.getItem('IQAC_AAA_DATA_' + deptName) : null;
        if (stored) {
          try { deptData = JSON.parse(stored); } catch (e) {}
        }
      }

      // If active dept has sample data fallback
      if (!deptData && window.CS_SAMPLE_DATA && deptName.includes('Computer Science')) {
        deptData = window.CS_SAMPLE_DATA;
      }

      const attrFormData = deptData?.attributeFormData || {};

      // Inspect matching cards
      cards.forEach(card => {
        if (this.selectedAttribute !== 'all' && card.id !== this.selectedAttribute) {
          return;
        }

        const cardData = attrFormData[card.id] || {};
        const sheets = card.sheets || [];

        sheets.forEach(sheet => {
          if (this.selectedSheet !== 'all' && sheet.key !== this.selectedSheet) {
            return;
          }

          const sData = cardData[sheet.key];
          let rows = [];

          if (Array.isArray(sData)) {
            rows = sData;
          } else if (sData && typeof sData === 'object') {
            // multi_table or batch_table
            Object.values(sData).forEach(val => {
              if (Array.isArray(val)) rows.push(...val);
            });
          }

          // If no rows found in storage but default template exists
          if (rows.length === 0 && sheet.defaultRows && Array.isArray(sheet.defaultRows)) {
            rows = sheet.defaultRows;
          }

          rows.forEach((row, rowIdx) => {
            // Check non-empty
            const hasData = Object.entries(row).some(([k, v]) => 
              k !== 'sno' && k !== 's_no' && k !== 'sl_no' && String(v || '').trim() !== ''
            );

            // Apply quick filters
            if (this.quickFilter === 'non_empty' && !hasData) return;

            if (this.quickFilter === 'sdg') {
              const sdgVal = String(row.sdgGoal || row.sdg || '').toLowerCase();
              if (!sdgVal || !sdgVal.includes('goal')) return;
            }

            if (this.quickFilter === 'mou') {
              const mouVal = String(row.mouLinkage || row.mou || '').toLowerCase();
              if (!mouVal || (!mouVal.includes('yes') && !mouVal.includes('mou'))) return;
            }

            if (this.quickFilter === 'iks') {
              const iksVal = String(row.iksBased || row.iks || '').toLowerCase();
              if (!iksVal || !iksVal.includes('yes')) return;
            }

            // Apply search query
            if (this.searchQuery) {
              const fullText = Object.values(row).join(' ').toLowerCase() + ' ' + deptName.toLowerCase();
              if (!fullText.includes(this.searchQuery)) return;
            }

            results.push({
              deptName,
              cardId: card.id,
              cardCode: card.cardCode,
              cardTitle: card.cardTitle,
              sheetKey: sheet.key,
              sheetName: sheet.sheetName || sheet.key,
              sheetTitle: sheet.title || '',
              columns: sheet.columns || [],
              rowData: row,
              rowIdx,
              hasData
            });
          });
        });
      });
    });

    return results;
  }

  render() {
    if (!this.container) return;

    const cards = this.getMasterSchema();
    const deptList = window.dataStore ? window.dataStore.getDepartmentList() : [];
    const activeCard = cards.find(c => c.id === this.selectedAttribute);
    const availableSheets = activeCard ? (activeCard.sheets || []) : [];
    const filteredRecords = this.getFilteredRecords();

    // Compute distinct contributing departments
    const contributingDepts = new Set(filteredRecords.map(r => r.deptName));

    this.container.innerHTML = `
      <div class="w-full space-y-6 animate-fadeIn">
        
        <!-- Header Banner with Light Academic Theme -->
        <div class="bg-gradient-to-r from-[#26648E]/10 via-[#4F8FC0]/10 to-[#FFE3B3]/25 rounded-2xl p-6 border border-[#4F8FC0]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900">
          <div>
            <div class="flex items-center flex-wrap gap-2 mb-2">
              <span class="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#53D2DC]/20 text-[#136168] border border-[#53D2DC]/50">
                Data Explorer & Filter Hub
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFE3B3] text-[#26648E] border border-[#fedba0] tracking-wide">
                Active Year: 2026–2027
              </span>
            </div>
            <h1 class="text-2xl md:text-3xl font-black tracking-tight text-[#26648E]">
              Department Attribute Data Explorer
            </h1>
          </div>

          <div class="flex items-center flex-wrap gap-2">
            <!-- Hide / Show Filter Option Button -->
            <button 
              type="button" 
              onclick="attributeFilterHub.toggleFilters()" 
              class="text-xs px-3.5 py-2 bg-white hover:bg-slate-50 text-blue-950 font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Toggle Filter Control Box"
            >
              <i data-lucide="${this.isFiltersCollapsed ? 'filter' : 'eye-off'}" class="w-4 h-4 text-amber-600"></i>
              <span>${this.isFiltersCollapsed ? 'Show Filter Controls' : 'Hide Filter Controls'}</span>
            </button>

            <!-- Export to Excel Button -->
            <button 
              type="button" 
              onclick="attributeFilterHub.exportFilteredToExcel()" 
              class="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download Filtered Results as Spreadsheet"
            >
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Export Filtered (.xls)</span>
            </button>
          </div>
        </div>

        <!-- ================= COLLAPSIBLE FILTER CONTROLS ================= -->
        ${!this.isFiltersCollapsed ? `
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <i data-lucide="sliders" class="w-4 h-4 text-blue-600"></i>
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-800">
                  Multi-Dimensional Filter Options
                </h3>
              </div>
              <button 
                type="button" 
                onclick="attributeFilterHub.resetFilters()" 
                class="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span>Reset All Filters</span>
              </button>
            </div>

            <!-- Primary 4 Dropdowns Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <!-- 1. Attribute Card Filter (All, Attribute 1 to 10, Part-A) -->
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <i data-lucide="layers" class="w-3.5 h-3.5 text-blue-600"></i>
                  <span>1. Attribute Filter:</span>
                </label>
                <select 
                  onchange="attributeFilterHub.onAttributeChange(this.value)" 
                  class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all" ${this.selectedAttribute === 'all' ? 'selected' : ''}>
                    All Attributes (1 to 10 & PART-A)
                  </option>
                  ${cards.map(c => `
                    <option value="${c.id}" ${this.selectedAttribute === c.id ? 'selected' : ''}>
                      ${c.cardCode}: ${c.cardTitle}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- 2. Specific Sheet Sub-Filter (e.g. 1.1, 1.2, 1.3 ... 1.11) -->
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-indigo-600"></i>
                  <span>2. Specific Sheet (1.1, 1.2, ...):</span>
                </label>
                <select 
                  onchange="attributeFilterHub.onSheetChange(this.value)" 
                  class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all" ${this.selectedSheet === 'all' ? 'selected' : ''}>
                    ${activeCard ? `All Sheets in ${activeCard.cardCode}` : 'All Sheets in Selected Attribute'}
                  </option>
                  ${availableSheets.map(s => `
                    <option value="${s.key}" ${this.selectedSheet === s.key ? 'selected' : ''}>
                      ${s.sheetName || s.key}: ${(s.title || '').substring(0, 45)}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- 3. Department Wise Filter -->
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <i data-lucide="building" class="w-3.5 h-3.5 text-amber-600"></i>
                  <span>3. Department Filter:</span>
                </label>
                <select 
                  onchange="attributeFilterHub.onDepartmentChange(this.value)" 
                  class="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all" ${this.selectedDepartment === 'all' ? 'selected' : ''}>
                    All Departments (College-Wide)
                  </option>
                  ${deptList.map(d => `
                    <option value="${d}" ${this.selectedDepartment === d ? 'selected' : ''}>
                      ${d}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- 4. Keyword Text Search -->
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <i data-lucide="search" class="w-3.5 h-3.5 text-emerald-600"></i>
                  <span>4. Keyword Search:</span>
                </label>
                <div class="relative">
                  <input 
                    type="text" 
                    value="${this.searchQuery}" 
                    oninput="attributeFilterHub.onSearchInput(this.value)" 
                    placeholder="Search name, course, title..." 
                    class="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl bg-white focus:border-blue-500 focus:outline-none"
                  />
                  <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"></i>
                </div>
              </div>

            </div>

            <!-- Quick Filter Chips -->
            <div class="flex items-center flex-wrap gap-2 pt-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Highlights:</span>
              
              <button 
                type="button" 
                onclick="attributeFilterHub.setQuickFilter('all')" 
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${this.quickFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
              >
                All Records
              </button>
              
              <button 
                type="button" 
                onclick="attributeFilterHub.setQuickFilter('non_empty')" 
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${this.quickFilter === 'non_empty' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
              >
                Filled Records Only
              </button>

              <button 
                type="button" 
                onclick="attributeFilterHub.setQuickFilter('sdg')" 
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${this.quickFilter === 'sdg' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
              >
                🎯 SDG Goal Linked
              </button>

              <button 
                type="button" 
                onclick="attributeFilterHub.setQuickFilter('mou')" 
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${this.quickFilter === 'mou' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
              >
                🤝 MoU Linkages
              </button>

              <button 
                type="button" 
                onclick="attributeFilterHub.setQuickFilter('iks')" 
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${this.quickFilter === 'iks' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
              >
                🏛️ IKS Based
              </button>
            </div>

          </div>
        ` : `
          <!-- Collapsed Summary Bar (When filters are hidden) -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center justify-between text-xs text-blue-900 shadow-xs animate-fadeIn">
            <div class="flex items-center flex-wrap gap-2">
              <span class="font-bold">🎯 Active Filter Criteria:</span>
              <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[11px] border border-blue-300">
                ${activeCard ? activeCard.cardCode : 'All Attributes'}
              </span>
              <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold text-[11px] border border-indigo-300">
                ${this.selectedSheet === 'all' ? 'All Sheets' : 'Sheet ' + this.selectedSheet}
              </span>
              <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-bold text-[11px] border border-amber-300">
                ${this.selectedDepartment === 'all' ? 'All Departments' : this.selectedDepartment}
              </span>
              ${this.searchQuery ? `
                <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 font-bold text-[11px] border border-emerald-300">
                  Query: "${this.searchQuery}"
                </span>
              ` : ''}
            </div>

            <button 
              type="button" 
              onclick="attributeFilterHub.toggleFilters()" 
              class="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <i data-lucide="filter" class="w-3.5 h-3.5"></i>
              <span>Show Filters</span>
            </button>
          </div>
        `}

        <!-- ================= KPI STATS BAR ================= -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <i data-lucide="list-filter" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xl font-black text-slate-900">${filteredRecords.length}</div>
              <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Matching Records Found</div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <i data-lucide="building-2" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xl font-black text-slate-900">${contributingDepts.size}</div>
              <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Contributing Departments</div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <i data-lucide="layout" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xl font-black text-slate-900">${this.selectedSheet === 'all' ? (activeCard?.sheets?.length || 11) : 1}</div>
              <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Active Sheet Scope</div>
            </div>
          </div>
        </div>

        <!-- ================= DATA TABLE CONTAINER ================= -->
        <div id="filter-table-container">
          ${this.renderRecordsTable(filteredRecords)}
        </div>

      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  renderTableOnly() {
    const container = document.getElementById('filter-table-container');
    if (!container) return;
    const records = this.getFilteredRecords();
    container.innerHTML = this.renderRecordsTable(records);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  renderRecordsTable(records) {
    if (!records || records.length === 0) {
      return `
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <i data-lucide="inbox" class="w-7 h-7"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-700">No records found for the selected filter combination</h4>
          <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try switching to 'All Departments' or 'All Sheets', or clear the keyword search query.
          </p>
          <button 
            type="button" 
            onclick="attributeFilterHub.resetFilters()" 
            class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
          >
            Reset Filters
          </button>
        </div>
      `;
    }

    // If specific sheet is selected, display tailored column headers
    if (this.selectedSheet !== 'all' && records[0] && records[0].columns && records[0].columns.length > 0) {
      const columns = records[0].columns;

      return `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span class="text-xs font-black text-slate-900">
                Sheet ${records[0].sheetKey} — ${records[0].sheetTitle || records[0].sheetName}
              </span>
              <span class="text-xs text-slate-500 ml-2">(${records.length} records)</span>
            </div>
            <span class="text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              ${records[0].cardCode}
            </span>
          </div>

          <div class="overflow-x-auto w-full">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th class="p-3 w-12 text-center">#</th>
                  <th class="p-3 whitespace-nowrap min-w-[160px]">Department</th>
                  ${columns.map(col => `
                    <th class="p-3 whitespace-nowrap min-w-[140px]">${col.label}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${records.map((rec, idx) => `
                  <tr class="hover:bg-blue-50/40 transition">
                    <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                    <td class="p-3">
                      <span class="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200 whitespace-nowrap">
                        ${rec.deptName.replace('PG & Research Department of ', '').replace('Department of ', '')}
                      </span>
                    </td>
                    ${columns.map(col => {
                      const val = rec.rowData[col.key] !== undefined ? rec.rowData[col.key] : '';
                      return `
                        <td class="p-3 text-slate-800 ${col.width || ''}">
                          ${this.formatTableCellValue(val, col.label)}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Default multi-sheet summary view
    return `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span class="text-xs font-black text-slate-900">Multi-Attribute Records Table</span>
          <span class="text-xs text-slate-500 font-semibold">${records.length} total rows matching filters</span>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th class="p-3 w-12 text-center">#</th>
                <th class="p-3 min-w-[160px]">Department</th>
                <th class="p-3 min-w-[120px]">Attribute</th>
                <th class="p-3 min-w-[120px]">Sheet</th>
                <th class="p-3 min-w-[260px]">Primary Title / Activity</th>
                <th class="p-3 min-w-[200px]">Details / Organization / Guide</th>
                <th class="p-3 min-w-[140px]">Date / Period</th>
                <th class="p-3 min-w-[130px]">SDG / MoU / IKS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${records.map((rec, idx) => {
                const r = rec.rowData;
                const titleVal = r.title || r.projectTitle || r.internshipTitle || r.courseTitle || r.programmeName || r.activityType || r.className || Object.values(r)[1] || '—';
                const detailVal = r.organizationDetails || r.placeNature || r.placeVisited || r.agencyDetails || r.staffInCharge || r.resourcePerson || Object.values(r)[2] || '—';
                const dateVal = r.datesFromTo || r.date || r.examDate || r.feedbackDate || '—';
                const sdgVal = r.sdgGoal || r.sdg || '';
                const mouVal = r.mouLinkage || r.mou || '';
                const iksVal = r.iksBased || r.iks || '';

                return `
                  <tr class="hover:bg-blue-50/40 transition">
                    <td class="p-3 text-center font-bold text-slate-400">${idx + 1}</td>
                    <td class="p-3">
                      <span class="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200 whitespace-nowrap">
                        ${rec.deptName.replace('PG & Research Department of ', '').replace('Department of ', '')}
                      </span>
                    </td>
                    <td class="p-3 font-semibold text-slate-800 whitespace-nowrap">
                      ${rec.cardCode}
                    </td>
                    <td class="p-3 font-bold text-indigo-700 whitespace-nowrap">
                      Sheet ${rec.sheetKey}
                    </td>
                    <td class="p-3 font-bold text-slate-900">
                      ${titleVal}
                    </td>
                    <td class="p-3 text-slate-600">
                      ${detailVal}
                    </td>
                    <td class="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      ${dateVal}
                    </td>
                    <td class="p-3">
                      <div class="flex flex-col gap-1 text-[10px]">
                        ${sdgVal ? `<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold truncate max-w-[160px]">${sdgVal}</span>` : ''}
                        ${mouVal === 'YES' || mouVal.includes('Yes') ? `<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">MoU: YES</span>` : ''}
                        ${iksVal === 'YES' || iksVal.includes('Yes') ? `<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-bold">IKS: YES</span>` : ''}
                        ${!sdgVal && !mouVal && !iksVal ? '<span class="text-slate-400">—</span>' : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  formatTableCellValue(val, colLabel) {
    if (val === undefined || val === null || val === '') {
      return '<span class="text-slate-300">—</span>';
    }

    const s = String(val);

    // SDG Goal Badge
    if (s.startsWith('Goal ')) {
      return `
        <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]">
          🎯 ${s}
        </span>
      `;
    }

    // YES / NO Badge
    if (s === 'YES' || s === 'Yes') {
      return `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">YES</span>`;
    }
    if (s === 'NO' || s === 'No') {
      return `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[11px]">NO</span>`;
    }

    // VAC / CC Badge
    if (s === 'VAC') {
      return `<span class="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[11px]">VAC</span>`;
    }
    if (s === 'CC') {
      return `<span class="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[11px]">CC</span>`;
    }

    return `<span class="text-slate-800">${s}</span>`;
  }

  exportFilteredToExcel() {
    const records = this.getFilteredRecords();
    if (!records || records.length === 0) {
      window.showToast('No matching records to export.', 'warning', 3000, 'Export Notice');
      return;
    }

    let csv = '';
    if (this.selectedSheet !== 'all' && records[0].columns) {
      // Specific sheet CSV
      const headers = ['Department', ...records[0].columns.map(c => `"${c.label.replace(/"/g, '""')}"`)];
      csv += headers.join(',') + '\r\n';

      records.forEach(rec => {
        const rowVals = [
          `"${rec.deptName.replace(/"/g, '""')}"`,
          ...records[0].columns.map(col => `"${String(rec.rowData[col.key] || '').replace(/"/g, '""')}"`)
        ];
        csv += rowVals.join(',') + '\r\n';
      });
    } else {
      // General summary CSV
      csv += 'Department,Attribute,Sheet,Title/Activity,Details/Guide,Date,SDG Goal,MoU Linkage,IKS Based\r\n';
      records.forEach(rec => {
        const r = rec.rowData;
        const rowVals = [
          `"${rec.deptName.replace(/"/g, '""')}"`,
          `"${rec.cardCode}"`,
          `"${rec.sheetKey}"`,
          `"${String(r.title || r.projectTitle || r.internshipTitle || r.courseTitle || '').replace(/"/g, '""')}"`,
          `"${String(r.organizationDetails || r.placeNature || r.staffInCharge || '').replace(/"/g, '""')}"`,
          `"${String(r.datesFromTo || r.date || '').replace(/"/g, '""')}"`,
          `"${String(r.sdgGoal || '').replace(/"/g, '""')}"`,
          `"${String(r.mouLinkage || '').replace(/"/g, '""')}"`,
          `"${String(r.iksBased || '').replace(/"/g, '""')}"`
        ];
        csv += rowVals.join(',') + '\r\n';
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IQAC_AAA_Filtered_Records_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}


window.AttributeFilterHub = AttributeFilterHub;
