// IQAC AAA 2026-2027 - Departmental Dashboard Renderer (Executive & Attribute-Wise)

class DashboardRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.chartInstances = {};
    this.selectedAttribute = 'all'; // 'all', 'att1', 'att2', 'att4_7', 'att5', 'att6_8', 'att9'
    this.expandedSections = {
      scholars: false,
      status_act: false,
      att1: false,
      att2: false,
      att3: false,
      att4_7: false,
      att5: false,
      att6_8: false,
      outcomes: false,
      att9: false,
      att10: false
    };
    this.allExpanded = false;
  }

  isSectionExpanded(secKey) {
    return !!this.expandedSections[secKey];
  }

  toggleSection(secKey) {
    this.expandedSections[secKey] = !this.expandedSections[secKey];
    const isExpanded = this.expandedSections[secKey];
    const container = document.getElementById(`detail-container-${secKey}`);
    const btn = document.getElementById(`detail-btn-${secKey}`);
    
    if (container) {
      if (isExpanded) {
        container.classList.remove('hidden');
      } else {
        container.classList.add('hidden');
      }
    }
    
    if (btn) {
      btn.innerHTML = `
        <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
        <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
      `;
      if (isExpanded) {
        btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
        btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-300');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        btn.classList.add('bg-white', 'text-slate-700', 'border-slate-300');
      }
    }
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  toggleAllDetails() {
    this.allExpanded = !this.allExpanded;
    const sections = ['scholars', 'status_act', 'att1', 'att2', 'att3', 'att4_7', 'att5', 'att6_8', 'outcomes', 'att9', 'att10'];
    sections.forEach(sec => {
      this.expandedSections[sec] = this.allExpanded;
      const container = document.getElementById(`detail-container-${sec}`);
      const btn = document.getElementById(`detail-btn-${sec}`);
      if (container) {
        if (this.allExpanded) {
          container.classList.remove('hidden');
        } else {
          container.classList.add('hidden');
        }
      }
      if (btn) {
        btn.innerHTML = `
          <i data-lucide="${this.allExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
          <span>${this.allExpanded ? 'Hide Details' : 'View Details'}</span>
        `;
        if (this.allExpanded) {
          btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
          btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-300');
        } else {
          btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
          btn.classList.add('bg-white', 'text-slate-700', 'border-slate-300');
        }
      }
    });

    const masterBtn = document.getElementById('btn-toggle-all-details');
    if (masterBtn) {
      masterBtn.innerHTML = `
        <i data-lucide="${this.allExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5 text-blue-600"></i>
        <span>${this.allExpanded ? 'View Counts Only' : 'Expand All Details'}</span>
      `;
    }
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  expandAndScrollTo(secKey) {
    this.expandedSections[secKey] = true;
    const container = document.getElementById(`detail-container-${secKey}`);
    const btn = document.getElementById(`detail-btn-${secKey}`);
    if (container) {
      container.classList.remove('hidden');
    }
    if (btn) {
      btn.innerHTML = `
        <i data-lucide="eye-off" class="w-3.5 h-3.5"></i>
        <span>Hide Details</span>
      `;
      btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
      btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-300');
    }
    if (window.lucide) {
      lucide.createIcons();
    }
    
    if (this.selectedAttribute !== 'all' && this.selectedAttribute !== secKey) {
      this.selectedAttribute = 'all';
      this.render(window.dataStore.data);
      setTimeout(() => {
        this.expandAndScrollTo(secKey);
      }, 50);
      return;
    }

    const el = document.getElementById(`attr-section-${secKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  destroyCharts() {
    Object.keys(this.chartInstances).forEach(key => {
      if (this.chartInstances[key]) {
        try {
          this.chartInstances[key].destroy();
        } catch (e) {
          console.warn('Chart destroy error:', e);
        }
      }
    });
    this.chartInstances = {};
  }

  setAttributeFilter(attrKey) {
    this.selectedAttribute = attrKey;
    this.render(window.dataStore.data);
    
    // Smooth scroll to attribute if specific one selected
    if (attrKey !== 'all') {
      setTimeout(() => {
        const el = document.getElementById(`attr-section-${attrKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }

  render(data) {
    if (!this.container || !data) return;

    this.destroyCharts();

    // Compute Key Metrics
    const dept = data.departmentInfo || {};
    const att1 = data.attributeI || {};
    const att2 = data.attributeII || {};
    const att4_7 = data.attributeIV_VII || {};
    const att5 = data.attributeV || {};
    const att6_8 = data.attributeVI_VIII || {};
    const att9 = data.attributeIX || {};

    // Total publications
    const scopus = att9.papersPublished?.scopus || 0;
    const wos = att9.papersPublished?.wos || 0;
    const ugc = att9.papersPublished?.ugcCare || 0;
    const conf = (att9.conferencesPresented?.indexed || 0) + (att9.conferencesPresented?.nonIndexed || 0);
    const books = (att9.books?.published || 0) + (att9.books?.edited || 0) + (att9.books?.chaptersContributed || 0);
    const totalPubs = scopus + wos + ugc;

    // Total Grants
    const extGrants = (att4_7.externalFunds || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const mgmtGrants = (att4_7.managementFunds || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const seedMoney = Number(att4_7.seedMoney?.totalSanctioned) || 
                      (Number(att4_7.seedMoney?.projectsAmount || 0) + Number(att4_7.seedMoney?.patentsAmount || 0) + Number(att4_7.seedMoney?.copyrightAmount || 0));
    const totalFunds = extGrants + mgmtGrants + seedMoney;
    const fundsLakhs = (totalFunds / 100000).toFixed(2);

    // VAC / CC counts & students
    const vacCount = (att1.vac || []).length;
    const ccCount = (att1.cc || []).length;
    const vacEnrolled = (att1.vac || []).reduce((sum, item) => sum + (Number(item.studentsEnrolled) || 0), 0);
    const ccEnrolled = (att1.cc || []).reduce((sum, item) => sum + (Number(item.studentsEnrolled) || 0), 0);

    // MOOC Completion Calculation
    const ugReg = (att1.moocs?.ug?.cycle1_registered || 0) + (att1.moocs?.ug?.cycle2_registered || 0);
    const ugComp = (att1.moocs?.ug?.cycle1_completed || 0) + (att1.moocs?.ug?.cycle2_completed || 0);
    const pgReg = (att1.moocs?.pg?.cycle1_registered || 0) + (att1.moocs?.pg?.cycle2_registered || 0);
    const pgComp = (att1.moocs?.pg?.cycle1_completed || 0) + (att1.moocs?.pg?.cycle2_completed || 0);
    const totalMoocReg = ugReg + pgReg;
    const totalMoocComp = ugComp + pgComp;
    const moocPct = totalMoocReg > 0 ? ((totalMoocComp / totalMoocReg) * 100).toFixed(1) : '0';

    // MoUs & Linkages
    const newMous = att5.mouCreated?.count || 0;
    const prevMous = att5.previousMous?.count || 0;
    const linkages = att5.linkages?.count || 0;
    const totalMoUs = newMous + prevMous;

    // Patents & IPR
    const patApplied = att9.patents?.applied || 0;
    const patGranted = att9.patents?.granted || 0;
    const copyrights = att9.copyrights?.count || 0;
    const totalIPR = patApplied + patGranted + copyrights;

    // Faculty FDPs & Honors
    const fdpCount = (att2.fdp?.mmttc_aicte_ugc || 0) + (att2.fdp?.otherInstitutions || 0) + (att2.fdp?.throughFdc || 0) + (att2.fdp?.institutionalLevel || 0);
    const facultyAwards = att2.awards?.count || 0;

    // Student Awards
    const studentAwards = (att6_8.studentParticipationAwards?.sports || 0) +
                          (att6_8.studentParticipationAwards?.cultural || 0) +
                          (att6_8.studentParticipationAwards?.externalAcademicEvents || 0) +
                          (att6_8.studentParticipationAwards?.extraCurricularEvents || 0) +
                          (att6_8.studentParticipationAwards?.coCurricularEvents || 0);

    // Lookup department metadata from Admin dashboard if available
    const activeDeptObj = (window.adminDashboard?.departments?.find(d => 
      d.name === dept.departmentName || d.code === dept.departmentCode || (dept.departmentName && d.name?.includes(dept.departmentName.slice(0, 15)))
    )) || { status: 'submitted', is_locked: false, audit_date: '2026-11-15', evaluation: { grade: 'A++', score: 97.5 } };

    const statusBadges = {
      submitted: '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Submitted to IQAC</span>',
      in_progress: '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⏳ In Progress</span>',
      draft: '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">📝 Draft</span>',
      audited: '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">🎓 Audited</span>'
    };
    const currentStatusBadge = statusBadges[activeDeptObj.status] || statusBadges.submitted;
    const currentGrade = activeDeptObj.evaluation?.grade || 'A++';

    // Table 1 Scholars Matrix
    const scholars = dept.scholars || { fullTime: { male: 0, female: 0 }, partTime: { male: 0, female: 0 } };
    const ftM = scholars.fullTime?.male || 0;
    const ftF = scholars.fullTime?.female || 0;
    const ftTotal = ftM + ftF;
    const ptM = scholars.partTime?.male || 0;
    const ptF = scholars.partTime?.female || 0;
    const ptTotal = ptM + ptF;
    const maleTotal = ftM + ptM;
    const femaleTotal = ftF + ptF;
    const totalScholars = ftTotal + ptTotal || dept.researchScholarsCount || 0;
    const isAttrOn = (id) => window.dataStore ? window.dataStore.isAttributeEnabled(id) : true;
    const agendaStats = window.dataStore ? window.dataStore.getAgendaStats() : { isFiltered: false, activeAttributes: 11, totalAttributes: 11, activeQuestions: 38, totalQuestions: 38 };

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Meeting Focus Agenda Notice Banner (If filtered by Admin) -->
        ${agendaStats.isFiltered ? `
          <div class="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm">
            <div class="flex items-center gap-2.5">
              <span class="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
                <i data-lucide="sliders" class="w-4 h-4"></i>
              </span>
              <div>
                <strong class="font-bold text-sm text-amber-900">Meeting Focus Agenda Active (${agendaStats.activeAttributes} of ${agendaStats.totalAttributes} Attributes Enabled)</strong>
                <p class="text-[11px] text-amber-800 mt-0.5">Preset: <span class="uppercase font-bold">${agendaStats.preset}</span>. Displaying only the ${agendaStats.activeQuestions} questions selected by the IQAC Admin for this audit review.</p>
              </div>
            </div>
            <div class="flex items-center gap-2 self-start sm:self-center">
              <button type="button" onclick="adminDashboard.selectAgendaPreset('all')" class="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold rounded-lg transition text-xs whitespace-nowrap">
                Show All 10 Attributes
              </button>
              <button type="button" onclick="adminDashboard.openAgendaConfigModal()" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition text-xs shadow-sm whitespace-nowrap">
                Configure Agenda
              </button>
            </div>
          </div>
        ` : ''}
      <div class="space-y-6">
        <!-- Executive Header Banner (Matching Admin Console Style) -->
        <div class="bg-gradient-to-r from-[#26648E] via-[#33729e] to-[#4F8FC0] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE3B3] text-[#26648E] uppercase tracking-wide border border-[#fedba0] shadow-2xs font-extrabold">
                First 15 Minutes • Executive Departmental Dashboard
              </span>
              <span class="text-xs text-blue-200">${dept.collegeName || "St. Joseph's College (Autonomous)"}</span>
              <span class="text-xs text-blue-300">• ${dept.academicYear || '2026 - 2027'}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-black tracking-tight">
              ${dept.departmentName || 'Departmental Dashboard'}
            </h1>
            <p class="text-xs text-blue-200 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span><strong>School:</strong> ${dept.school || 'Autonomous Stream'}</span>
              <span><strong>HOD:</strong> ${dept.hodName || 'Department Head'}</span>
              <span><strong>Accreditation:</strong> ${dept.accreditation || 'NAAC A++'}</span>
              <span><strong>Faculty:</strong> ${dept.facultyCount || 0}</span>
              <span><strong>Students:</strong> ${(dept.studentCountUG || 0) + (dept.studentCountPG || 0)}</span>
              <span><strong>Scholars:</strong> ${totalScholars} (FT: ${ftTotal} | PT: ${ptTotal})</span>
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="app.switchView('presentation')" class="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 whitespace-nowrap">
              <i data-lucide="play-circle" class="w-4 h-4"></i>
              <span>Launch Meeting (60m)</span>
            </button>
            <button type="button" onclick="app.switchView('form')" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 whitespace-nowrap">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
              <span>Edit Data Form</span>
            </button>
            <button type="button" onclick="app.switchView('panel')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 whitespace-nowrap">
              <i data-lucide="clipboard-check" class="w-4 h-4"></i>
              <span>Score & Grade</span>
            </button>
            <button type="button" onclick="window.print()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap border border-slate-700">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        <!-- 8 High-Impact KPI Stat Cards (Matching Admin Dashboard Card System with Eye View Details) -->
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- KPI 1 -->
          <div onclick="dashboardRenderer.expandAndScrollTo('att9')" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-blue-600 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start justify-between">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Publications & Research</span>
              <button type="button" title="View Detailed Papers" onclick="event.stopPropagation(); dashboardRenderer.expandAndScrollTo('att9')" class="p-1 hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 rounded-lg transition flex items-center gap-1 text-[10px] font-bold">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-blue-600"></i>
                <span class="hidden sm:inline">Details</span>
              </button>
            </div>
            <div class="text-2xl font-black text-slate-800 mt-1">
              ${totalPubs} <span class="text-xs font-semibold text-slate-400">Indexed Papers</span>
            </div>
            <p class="text-[10px] text-blue-600 font-semibold mt-1">Scopus: ${scopus} | WoS: ${wos} | Books: ${books}</p>
          </div>

          <!-- KPI 2 -->
          <div onclick="dashboardRenderer.expandAndScrollTo('att4_7')" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-emerald-600 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start justify-between">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Grants Mobilized</span>
              <button type="button" title="View Detailed Grants" onclick="event.stopPropagation(); dashboardRenderer.expandAndScrollTo('att4_7')" class="p-1 hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 rounded-lg transition flex items-center gap-1 text-[10px] font-bold">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span class="hidden sm:inline">Details</span>
              </button>
            </div>
            <div class="text-2xl font-black text-slate-800 mt-1">
              ₹ ${fundsLakhs} <span class="text-xs font-semibold text-slate-400">Lakhs</span>
            </div>
            <p class="text-[10px] text-emerald-600 font-semibold mt-1">External: ₹ ${(extGrants/100000).toFixed(1)}L | Mgmt + Seed</p>
          </div>

          <!-- KPI 3 -->
          <div onclick="dashboardRenderer.expandAndScrollTo('att1')" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-purple-600 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start justify-between">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">MOOC & Skill Pass</span>
              <button type="button" title="View MOOC Matrix" onclick="event.stopPropagation(); dashboardRenderer.expandAndScrollTo('att1')" class="p-1 hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 rounded-lg transition flex items-center gap-1 text-[10px] font-bold">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-purple-600"></i>
                <span class="hidden sm:inline">Details</span>
              </button>
            </div>
            <div class="text-2xl font-black text-slate-800 mt-1">
              ${moocPct}% <span class="text-xs font-semibold text-slate-400">Pass Rate</span>
            </div>
            <p class="text-[10px] text-purple-600 font-semibold mt-1">${totalMoocComp} Passed / ${totalMoocReg} Registered SWAYAM</p>
          </div>

          <!-- KPI 4 -->
          <div onclick="dashboardRenderer.expandAndScrollTo('att9')" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-amber-500 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start justify-between">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">IPR & Patents</span>
              <button type="button" title="View Patents & Copyrights" onclick="event.stopPropagation(); dashboardRenderer.expandAndScrollTo('att9')" class="p-1 hover:bg-amber-50 text-slate-400 group-hover:text-amber-600 rounded-lg transition flex items-center gap-1 text-[10px] font-bold">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-amber-600"></i>
                <span class="hidden sm:inline">Details</span>
              </button>
            </div>
            <div class="text-2xl font-black text-slate-800 mt-1">
              ${totalIPR} <span class="text-xs font-semibold text-slate-400">Total IPR</span>
            </div>
            <p class="text-[10px] text-amber-600 font-semibold mt-1">${patGranted} Granted | ${patApplied} Applied | ${copyrights} Copyrights</p>
          </div>

          <!-- KPI 5 -->
          <div onclick="dashboardRenderer.expandAndScrollTo('att5')" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-indigo-600 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start justify-between">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active MoUs & Linkages</span>
              <button type="button" title="View MoUs & Linkages" onclick="event.stopPropagation(); dashboardRenderer.expandAndScrollTo('att5')" class="p-1 hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 rounded-lg transition flex items-center gap-1 text-[10px] font-bold">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-indigo-600"></i>
                <span class="hidden sm:inline">Details</span>
              </button>
            </div>
            <div class="text-2xl font-black text-slate-800 mt-1">
              ${totalMoUs + linkages} <span class="text-xs font-semibold text-slate-400">Total</span>
            </div>
            <p class="text-[10px] text-indigo-600 font-semibold mt-1">${newMous} New in 2026-27 | ${prevMous} Active MoUs</p>
          </div>

          <!-- KPI 6 -->
          <div onclick="dashboardRenderer.expandAndScrollTo('att1')" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-cyan-600 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start justify-between">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Skill Courses (VAC & CC)</span>
              <button type="button" title="View Skill Courses" onclick="event.stopPropagation(); dashboardRenderer.expandAndScrollTo('att1')" class="p-1 hover:bg-cyan-50 text-slate-400 group-hover:text-cyan-600 rounded-lg transition flex items-center gap-1 text-[10px] font-bold">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-cyan-600"></i>
                <span class="hidden sm:inline">Details</span>
              </button>
            </div>
            <div class="text-2xl font-black text-slate-800 mt-1">
              ${vacCount + ccCount} <span class="text-xs font-semibold text-slate-400">Courses</span>
            </div>
            <p class="text-[10px] text-cyan-600 font-semibold mt-1">${vacEnrolled + ccEnrolled} Students Enrolled in VAC & CC</p>
          </div>

          <!-- KPI 7 -->
          <div onclick="dashboardRenderer.expandAndScrollTo('att2')" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-rose-600 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start justify-between">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Faculty FDP & Honors</span>
              <button type="button" title="View Faculty Development" onclick="event.stopPropagation(); dashboardRenderer.expandAndScrollTo('att2')" class="p-1 hover:bg-rose-50 text-slate-400 group-hover:text-rose-600 rounded-lg transition flex items-center gap-1 text-[10px] font-bold">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-rose-600"></i>
                <span class="hidden sm:inline">Details</span>
              </button>
            </div>
            <div class="text-2xl font-black text-slate-800 mt-1">
              ${fdpCount} <span class="text-xs font-semibold text-slate-400">Completed</span>
            </div>
            <p class="text-[10px] text-rose-600 font-semibold mt-1">${facultyAwards} Honors | FDPs | BoS Roles</p>
          </div>

          <!-- KPI 8 -->
          <div onclick="dashboardRenderer.expandAndScrollTo('att6_8')" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-teal-600 hover:shadow-md transition cursor-pointer group">
            <div class="flex items-start justify-between">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Student Awards & Exams</span>
              <button type="button" title="View Student Awards" onclick="event.stopPropagation(); dashboardRenderer.expandAndScrollTo('att6_8')" class="p-1 hover:bg-teal-50 text-slate-400 group-hover:text-teal-600 rounded-lg transition flex items-center gap-1 text-[10px] font-bold">
                <i data-lucide="eye" class="w-3.5 h-3.5 text-teal-600"></i>
                <span class="hidden sm:inline">Details</span>
              </button>
            </div>
            <div class="text-2xl font-black text-slate-800 mt-1">
              ${studentAwards} <span class="text-xs font-semibold text-slate-400">Awards</span>
            </div>
            <p class="text-[10px] text-teal-600 font-semibold mt-1">${att6_8.competitiveExams?.qualified || 0} Cleared NET / GATE / Govt Exams</p>
          </div>
        </div>

        <!-- Department Meeting Control Hub Card (Matching Admin Presentation Card) -->
        <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 transition space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-slate-900">${dept.departmentName || 'Departmental Review'}</h3>
                ${currentStatusBadge}
                ${currentGrade ? `<span class="px-2 py-0.5 bg-purple-100 text-purple-900 font-black text-xs rounded border border-purple-200">Grade: ${currentGrade}</span>` : ''}
                ${activeDeptObj.is_locked ? '<span class="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">Locked</span>' : ''}
              </div>
              <p class="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span><strong>School:</strong> ${dept.school || 'School of Computing Sciences'}</span>
                <span><strong>HOD:</strong> ${dept.hodName || 'Department Head'}</span>
                <span><strong>Scheduled Audit:</strong> ${activeDeptObj.audit_date || 'AAA 2026-2027 Review Session'}</span>
              </p>
            </div>

            <!-- Quick Metrics Badges -->
            <div class="flex items-center gap-2 text-center text-xs">
              <div class="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-[70px]">
                <span class="text-[10px] text-slate-400 block font-semibold">Pubs</span>
                <span class="font-black text-blue-700">${totalPubs}</span>
              </div>
              <div class="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-[70px]">
                <span class="text-[10px] text-slate-400 block font-semibold">Grants</span>
                <span class="font-black text-emerald-700">₹ ${fundsLakhs}L</span>
              </div>
              <div class="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-[70px]">
                <span class="text-[10px] text-slate-400 block font-semibold">MOOC %</span>
                <span class="font-black text-purple-700">${moocPct}%</span>
              </div>
              <div class="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-[70px]">
                <span class="text-[10px] text-slate-400 block font-semibold">Patents</span>
                <span class="font-black text-amber-700">${patGranted}</span>
              </div>
              <div class="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-[70px]">
                <span class="text-[10px] text-slate-400 block font-semibold">MoUs</span>
                <span class="font-black text-indigo-700">${totalMoUs}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons for the Meeting -->
          <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <button type="button" onclick="app.switchView('presentation')" class="px-3.5 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5">
                <i data-lucide="play-circle" class="w-4 h-4"></i>
                <span>Launch Meeting (60m Presentation)</span>
              </button>
              <button type="button" onclick="app.switchView('form')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition flex items-center gap-1">
                <i data-lucide="edit" class="w-3.5 h-3.5"></i>
                <span>Review Form</span>
              </button>
              <button type="button" onclick="app.switchView('panel')" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg transition flex items-center gap-1">
                <i data-lucide="clipboard-check" class="w-3.5 h-3.5"></i>
                <span>Score & Grade</span>
              </button>
            </div>

            <div class="flex items-center gap-1">
              <span class="text-[11px] text-slate-400">Department Code: <code class="text-blue-600 font-bold">${dept.departmentCode || dept.code || 'cs'}</code></span>
            </div>
          </div>
        </div>

        <!-- Table 1: Research Scholars Matrix Card (FT & PT x Male & Female) -->
        ${isAttrOn('t1_scholars') ? `
        <div class="bg-white rounded-xl p-4 border border-purple-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-purple-600 text-white rounded-xl shadow-sm">
              <i data-lucide="graduation-cap" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200">Table 1</span>
                <h4 class="text-sm font-bold text-slate-800">Research Scholars Matrix (Full Time vs Part Time)</h4>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Doctoral researchers enrolled under university-approved research supervisors.</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="flex items-center gap-2 text-center text-xs">
              <div class="px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                <span class="text-[10px] text-slate-500 block uppercase font-bold">FT Scholars</span>
                <span class="text-base font-black text-purple-700">${ftTotal}</span>
                <span class="text-[9px] text-slate-400 block">${scholars.fullTime?.male||0}M / ${scholars.fullTime?.female||0}F</span>
              </div>
              <div class="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                <span class="text-[10px] text-slate-500 block uppercase font-bold">PT Scholars</span>
                <span class="text-base font-black text-blue-700">${ptTotal}</span>
                <span class="text-[9px] text-slate-400 block">${scholars.partTime?.male||0}M / ${scholars.partTime?.female||0}F</span>
              </div>
              <div class="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 font-black">
                <span class="text-[10px] text-slate-500 block uppercase font-bold">Total Scholars</span>
                <span class="text-base font-black text-slate-800">${totalScholars}</span>
                <span class="text-[9px] text-slate-500 block">${maleTotal}M / ${femaleTotal}F</span>
              </div>
            </div>
            <button id="detail-btn-scholars" type="button" onclick="dashboardRenderer.toggleSection('scholars')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${this.isSectionExpanded('scholars') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${this.isSectionExpanded('scholars') ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${this.isSectionExpanded('scholars') ? 'Hide Matrix' : 'View Matrix'}</span>
            </button>
          </div>
        </div>

        <!-- Expandable Scholars Table -->
        <div id="detail-container-scholars" class="${this.isSectionExpanded('scholars') ? '' : 'hidden'} bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <table class="w-full text-xs text-left">
            <thead class="bg-purple-50 text-purple-950 font-bold border-b border-purple-200">
              <tr>
                <th class="p-2.5">Scholars Category</th>
                <th class="p-2.5 text-center">Male Scholars</th>
                <th class="p-2.5 text-center">Female Scholars</th>
                <th class="p-2.5 text-center font-black">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="p-2.5 font-bold text-slate-800">FT (Full Time)</td>
                <td class="p-2.5 text-center font-bold text-blue-700">${scholars.fullTime?.male || 0}</td>
                <td class="p-2.5 text-center font-bold text-purple-700">${scholars.fullTime?.female || 0}</td>
                <td class="p-2.5 text-center font-black text-slate-900 bg-purple-50/30">${ftTotal}</td>
              </tr>
              <tr>
                <td class="p-2.5 font-bold text-slate-800">PT (Part Time)</td>
                <td class="p-2.5 text-center font-bold text-blue-700">${scholars.partTime?.male || 0}</td>
                <td class="p-2.5 text-center font-bold text-purple-700">${scholars.partTime?.female || 0}</td>
                <td class="p-2.5 text-center font-black text-slate-900 bg-purple-50/30">${ptTotal}</td>
              </tr>
              <tr class="bg-slate-50 font-black">
                <td class="p-2.5">Total Doctoral Scholars</td>
                <td class="p-2.5 text-center text-blue-900">${maleTotal}</td>
                <td class="p-2.5 text-center text-purple-900">${femaleTotal}</td>
                <td class="p-2.5 text-center text-emerald-800 text-sm">${totalScholars}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ` : ''}

        <!-- ATTRIBUTE-WISE DISPLAY BAR (FILTER / JUMP NAVIGATION - Matching Admin Filter Bar) -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30">
          <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <span class="text-slate-400 font-bold uppercase text-[10px] mr-2 flex items-center gap-1">
              <i data-lucide="filter" class="w-3.5 h-3.5 text-blue-600"></i>
              Filter Attribute:
            </span>
            ${this.renderAttrPill('all', 'All Sections', 'layers')}
            ${isAttrOn('t1_scholars') ? this.renderAttrPill('scholars', 'Scholars (T1)', 'users-round') : ''}
            ${isAttrOn('t2_activities') ? this.renderAttrPill('status_act', 'Activities (T2)', 'check-square') : ''}
            ${isAttrOn('att1') ? this.renderAttrPill('att1', 'Att I: Curriculum', 'book-open') : ''}
            ${isAttrOn('att2') ? this.renderAttrPill('att2', 'Att II: Faculty', 'users') : ''}
            ${isAttrOn('att3') ? this.renderAttrPill('att3', 'Att III: Infrastructure', 'server') : ''}
            ${isAttrOn('att4_7') ? this.renderAttrPill('att4_7', 'Att 4 & 7: Grants', 'indian-rupee') : ''}
            ${isAttrOn('att5') ? this.renderAttrPill('att5', 'Att V: Teaching', 'laptop') : ''}
            ${isAttrOn('att6_8') ? this.renderAttrPill('att6_8', 'Att VI & VIII: Clubs', 'trophy') : ''}
            ${isAttrOn('t10_outcomes') ? this.renderAttrPill('outcomes', 'Outcomes 2026', 'graduation-cap') : ''}
            ${isAttrOn('att9') ? this.renderAttrPill('att9', 'Att IX: Research', 'award') : ''}
            ${isAttrOn('att10') ? this.renderAttrPill('att10', 'Att X: Green & CSR', 'leaf') : ''}
          </div>

          <div class="flex items-center gap-2 text-xs text-slate-500">
            <!-- Global Eye Toggle: View Counts Only / Expand All Details -->
            <button id="btn-toggle-all-details" type="button" onclick="dashboardRenderer.toggleAllDetails()" class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-sm whitespace-nowrap">
              <i data-lucide="${this.allExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>${this.allExpanded ? 'View Counts Only' : 'Expand All Details'}</span>
            </button>
            <button type="button" onclick="app.switchView('form')" class="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition flex items-center gap-1 whitespace-nowrap">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit Form
            </button>
          </div>
        </div>

        <!-- Visual Analytics Row (Charts) -->
        ${(this.selectedAttribute === 'all' || this.selectedAttribute === 'att9' || this.selectedAttribute === 'att4_7') ? `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="bar-chart-3" class="w-4 h-4 text-blue-600"></i>
                    Research & Scholarly Publications Distribution
                  </h3>
                  <p class="text-[11px] text-slate-500">Breakdown of indexed papers, conference proceedings, and books.</p>
                </div>
                <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">Att IX</span>
              </div>
              <div class="h-64 relative">
                <canvas id="researchChart"></canvas>
              </div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="pie-chart" class="w-4 h-4 text-emerald-600"></i>
                    Financial Grants & Resource Mobilization (₹ in Lakhs)
                  </h3>
                  <p class="text-[11px] text-slate-500">External agency projects vs management funding vs seed money.</p>
                </div>
                <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Att 4 & 7</span>
              </div>
              <div class="h-64 relative">
                <canvas id="fundsChart"></canvas>
              </div>
            </div>
          </div>
        ` : ''}

        ${(this.selectedAttribute === 'all' || this.selectedAttribute === 'att1' || this.selectedAttribute === 'att2') ? `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="trending-up" class="w-4 h-4 text-purple-600"></i>
                    MOOC Progression: Registered vs Completed (Cycles I & II)
                  </h3>
                  <p class="text-[11px] text-slate-500">Comparison of UG and PG completion rates in SWAYAM/NPTEL.</p>
                </div>
                <span class="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">Att I</span>
              </div>
              <div class="h-64 relative">
                <canvas id="moocChart"></canvas>
              </div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="radar" class="w-4 h-4 text-indigo-600"></i>
                    Faculty Resource Person & Outreach Levels
                  </h3>
                  <p class="text-[11px] text-slate-500">National, International, State, Regional & Institutional representation.</p>
                </div>
                <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">Att II</span>
              </div>
              <div class="h-64 relative">
                <canvas id="facultyOutreachChart"></canvas>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- DETAILED ATTRIBUTE-WISE SECTIONS CONTAINER (Matching questions.docx Tables 2 to 11 & Attributes I to X) -->
        <div class="space-y-8">
          ${(isAttrOn('t2_activities') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'status_act')) ? this.renderStatusOfActivitiesSection(data.qualitativePresentation) : ''}
          ${(isAttrOn('att1') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'att1')) ? this.renderAttributeISection(att1) : ''}
          ${(isAttrOn('att2') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'att2')) ? this.renderAttributeIISection(att2) : ''}
          ${(isAttrOn('att3') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'att3')) ? this.renderAttributeIIISection(data.attributeIII) : ''}
          ${(isAttrOn('att4_7') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'att4_7')) ? this.renderAttributeIV_VIISection(att4_7) : ''}
          ${(isAttrOn('att5') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'att5')) ? this.renderAttributeVSection(att5) : ''}
          ${(isAttrOn('att6_8') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'att6_8')) ? this.renderAttributeVI_VIIISection(att6_8) : ''}
          ${(isAttrOn('t10_outcomes') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'outcomes')) ? this.renderStudentsOutcomesSection(data.studentsOutcomes2026) : ''}
          ${(isAttrOn('att9') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'att9')) ? this.renderAttributeIXSection(att9) : ''}
          ${(isAttrOn('att10') && (this.selectedAttribute === 'all' || this.selectedAttribute === 'att10')) ? this.renderAttributeXSection(data.attributeX) : ''}
        </div>

        <!-- Transition to 30-Min Presentation Banner -->
        <div class="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-white/10 rounded-lg">
              <i data-lucide="play-circle" class="w-6 h-6 text-purple-200"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold">Ready for the 30-Minute Qualitative Impact Presentation?</h4>
              <p class="text-xs text-purple-200">Covers Signature Achievements, Uniqueness, 2025-26 ATR, Best Practices, SWOC & Key Academic Pillars.</p>
            </div>
          </div>
          <button type="button" onclick="app.showPresentationTab(6)" class="px-4 py-2 bg-white text-purple-900 font-bold rounded-lg text-xs hover:bg-purple-50 transition shadow-sm whitespace-nowrap flex items-center gap-1.5">
            <span>Proceed to 30-Min Deck</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    // Render Charts after DOM updates
    setTimeout(() => {
      this.initCharts(data);
      if (window.lucide) {
        lucide.createIcons();
      }
    }, 50);
  }

  renderAttrPill(key, label, icon) {
    const isSelected = this.selectedAttribute === key;
    const activeClass = isSelected ? 'bg-blue-600 text-white font-bold shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium';
    return `
      <button type="button" onclick="dashboardRenderer.setAttributeFilter('${key}')" class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap text-xs ${activeClass}">
        <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
        <span>${label}</span>
      </button>
    `;
  }

  getAttributeTitle(key) {
    const map = {
      all: 'All Sections (Tables 1 to 11 & Attributes I to X)',
      scholars: 'Table 1: Research Scholars Matrix',
      status_act: 'Table 2: Status of Activities Completed',
      att1: 'Table 3 & 4: Attribute I - Curriculum & PTM',
      att2: 'Table 5: Attribute II - Faculty Resources',
      att3: 'Attribute III: Infrastructure & Learning Resources',
      att4_7: 'Table 6: Attribute 4 & 7 - Grants & Resource Mobilization',
      att5: 'Table 7: Attribute V - Learning & Teaching (MoUs)',
      att6_8: 'Table 8 & 9: Attribute VI & VIII - Clubs & Awards',
      outcomes: 'Table 10: Students Outcomes – 2026 Passed out',
      att9: 'Table 11: Attribute IX - Research & Innovation Outcomes',
      att10: 'Attribute X: Institutional Values & Green Initiatives'
    };
    return map[key] || 'All Attributes';
  }

  // ==========================================
  // TABLE 2: STATUS OF ACTIVITIES COMPLETED
  // ==========================================
  renderStatusOfActivitiesSection(qual) {
    const isExpanded = this.isSectionExpanded('status_act');
    if (!qual) qual = {};
    if (!qual.statusOfActivities) {
      qual.statusOfActivities = { basedOnAAA2025_2026: [], basedOnFacultyOrientation2026: [] };
    }
    const act = qual.statusOfActivities;
    const listAAA = act.basedOnAAA2025_2026 || [];
    const listFOP = act.basedOnFacultyOrientation2026 || [];

    const compAAA = listAAA.filter(x => x.status === 'Completed').length;
    const compFOP = listFOP.filter(x => x.status === 'Completed').length;
    const totalAAA = listAAA.length;
    const totalFOP = listFOP.length;
    const totalActs = totalAAA + totalFOP;
    const totalComp = compAAA + compFOP;
    const overallPct = totalActs > 0 ? ((totalComp / totalActs) * 100).toFixed(0) : 100;
    const pctAAA = totalAAA > 0 ? ((compAAA / totalAAA) * 100).toFixed(0) : 100;
    const pctFOP = totalFOP > 0 ? ((compFOP / totalFOP) * 100).toFixed(0) : 100;

    return `
      <div id="attr-section-status_act" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
              <i data-lucide="check-square" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">Table 2</span>
                <h3 class="text-base font-bold text-slate-800">Status of Activities Completed</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Compliance on AAA 2025-26 Recommendations and June 2026 Faculty Orientation Commitments.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button id="detail-btn-status_act" type="button" onclick="dashboardRenderer.toggleSection('status_act')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
            </button>
            <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              ${totalComp} / ${totalActs} Completed
            </span>
            <span class="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black shadow-sm">
              ${overallPct}% Compliance
            </span>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Executive Count Summary Grid (Always Visible) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div onclick="dashboardRenderer.toggleSection('status_act')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">AAA 2025-26 ATR</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${compAAA} <span class="text-xs font-normal text-slate-400">/ ${totalAAA}</span></div>
              <p class="text-[10px] text-emerald-600 font-semibold truncate">${pctAAA}% Recommendations Fulfilled</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('status_act')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Faculty Orientation '26</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${compFOP} <span class="text-xs font-normal text-slate-400">/ ${totalFOP}</span></div>
              <p class="text-[10px] text-blue-600 font-semibold truncate">${pctFOP}% Commitments Executed</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('status_act')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Total Activities</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${totalActs}</div>
              <p class="text-[10px] text-slate-500 truncate">Institutional Milestones</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('status_act')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Overall Compliance</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-emerald-700 mt-1">${overallPct}%</div>
              <p class="text-[10px] text-emerald-600 font-semibold truncate">Target Met</p>
            </div>
          </div>

          <!-- Expandable Detailed Container (Toggled via Eye Icon) -->
          <div id="detail-container-status_act" class="${isExpanded ? '' : 'hidden'} space-y-6 pt-4 border-t border-slate-200">
            <!-- Table A: Based on AAA 2025 - 2026 -->
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                  <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                  Based on AAA 2025 - 2026 Recommendations (Action Taken Report)
                </h4>
                <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${compAAA}/${totalAAA} Completed</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left bg-white rounded-lg border border-slate-200">
                  <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                    <tr>
                      <th class="p-2.5">Event / Activity</th>
                      <th class="p-2.5 text-center">Month & Year</th>
                      <th class="p-2.5 text-center">Status</th>
                      <th class="p-2.5">Remarks / Measurable Impact</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${listAAA.length > 0 ? listAAA.map(item => `
                      <tr>
                        <td class="p-2.5 font-bold text-slate-800">${item.eventActivity || '-'}</td>
                        <td class="p-2.5 text-center text-slate-600 whitespace-nowrap">${item.monthYear || '-'}</td>
                        <td class="p-2.5 text-center whitespace-nowrap">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                            ${item.status === 'Completed' ? '✓ Completed' : '⏳ In Progress'}
                          </span>
                        </td>
                        <td class="p-2.5 text-slate-600">${item.remarks || '-'}</td>
                      </tr>
                    `).join('') : '<tr><td colspan="4" class="p-3 text-center text-slate-400">No records added</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Table B: Based on Faculty Orientation Programme June 2026 -->
            <div class="bg-blue-50/40 rounded-xl p-4 border border-blue-200 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase text-blue-950 flex items-center gap-1.5">
                  <i data-lucide="calendar" class="w-4 h-4 text-blue-600"></i>
                  Based on Data provided during Faculty Orientation Programme – June 2026
                </h4>
                <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${compFOP}/${totalFOP} Completed</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left bg-white rounded-lg border border-blue-200">
                  <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                    <tr>
                      <th class="p-2.5">Event / Activity</th>
                      <th class="p-2.5 text-center">Month & Year</th>
                      <th class="p-2.5 text-center">Status</th>
                      <th class="p-2.5">Remarks / Measurable Impact</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${listFOP.length > 0 ? listFOP.map(item => `
                      <tr>
                        <td class="p-2.5 font-bold text-slate-800">${item.eventActivity || '-'}</td>
                        <td class="p-2.5 text-center text-slate-600 whitespace-nowrap">${item.monthYear || '-'}</td>
                        <td class="p-2.5 text-center whitespace-nowrap">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                            ${item.status === 'Completed' ? '✓ Completed' : '⏳ In Progress'}
                          </span>
                        </td>
                        <td class="p-2.5 text-slate-600">${item.remarks || '-'}</td>
                      </tr>
                    `).join('') : '<tr><td colspan="4" class="p-3 text-center text-slate-400">No records added</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ATTRIBUTE I: CURRICULUM DESIGN
  // ==========================================
  renderAttributeISection(att1) {
    const vacList = att1.vac || [];
    const ccList = att1.cc || [];
    const totalVacEnrolled = vacList.reduce((s, i) => s + (Number(i.studentsEnrolled) || 0), 0);
    const totalCcEnrolled = ccList.reduce((s, i) => s + (Number(i.studentsEnrolled) || 0), 0);
    const totalFee = vacList.reduce((s, i) => s + (Number(i.feeCollected) || 0), 0) + ccList.reduce((s, i) => s + (Number(i.feeCollected) || 0), 0);

    const ugReg = (att1.moocs?.ug?.cycle1_registered || 0) + (att1.moocs?.ug?.cycle2_registered || 0);
    const ugComp = (att1.moocs?.ug?.cycle1_completed || 0) + (att1.moocs?.ug?.cycle2_completed || 0);
    const pgReg = (att1.moocs?.pg?.cycle1_registered || 0) + (att1.moocs?.pg?.cycle2_registered || 0);
    const pgComp = (att1.moocs?.pg?.cycle1_completed || 0) + (att1.moocs?.pg?.cycle2_completed || 0);
    const totalMoocReg = ugReg + pgReg;
    const totalMoocComp = ugComp + pgComp;
    const moocPct = totalMoocReg > 0 ? ((totalMoocComp / totalMoocReg) * 100).toFixed(1) : '0';
    const isExpanded = this.isSectionExpanded('att1');

    return `
      <div id="attr-section-att1" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
              <i data-lucide="book-open" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">Attribute I</span>
                <h3 class="text-base font-bold text-slate-800">Curriculum Design</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Value Added Courses (VAC), Certificate Courses (CC), Indian Knowledge Systems (IKS), Visits, Internships & MOOCs.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              ${vacList.length + ccList.length} Skill Courses Offered
            </span>
            <span class="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800">
              ${totalVacEnrolled + totalCcEnrolled} Students Trained
            </span>
            <button id="detail-btn-att1" type="button" onclick="dashboardRenderer.toggleSection('att1')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Executive Count Summary Grid (View Only The Count) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div onclick="dashboardRenderer.toggleSection('att1')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">VAC Courses</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${vacList.length}</div>
              <p class="text-[10px] text-slate-500 truncate">${totalVacEnrolled} Enrolled</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att1')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Cert Courses</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${ccList.length}</div>
              <p class="text-[10px] text-slate-500 truncate">${totalCcEnrolled} Enrolled</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att1')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">IKS Events</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${(att1.iks?.seminarCount||0)+(att1.iks?.workshopCount||0)+(att1.iks?.fieldVisitCount||0)}</div>
              <p class="text-[10px] text-slate-500 truncate">${att1.iks?.studentsBenefitted || 0} Benefitted</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att1')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Visits & Field</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${(att1.visits?.industrial||0)+(att1.visits?.educational||0)+(att1.visits?.fieldWork||0)+(att1.visits?.fieldVisit||0)}</div>
              <p class="text-[10px] text-slate-500 truncate">${att1.visits?.studentsParticipated || 0} Students</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att1')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Internships</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att1.internships?.studentsInvolved || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">Outside Syllabus</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att1')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-amber-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">PTMs</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att1.ptm?.numberOfPTMs || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">${att1.ptm?.parentsParticipated || 0} Parents</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att1')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">MOOC Pass</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${moocPct}%</div>
              <p class="text-[10px] text-slate-500 truncate">${totalMoocComp} / ${totalMoocReg} Pass</p>
            </div>
          </div>

          <!-- Expandable Detailed Container (Toggled via Eye Icon) -->
          <div id="detail-container-att1" class="${isExpanded ? '' : 'hidden'} space-y-6 pt-4 border-t border-slate-200">
          <!-- VAC & CC Detailed Tables -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- VAC Table -->
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <i data-lucide="award" class="w-4 h-4 text-emerald-600"></i>
                  Value Added Courses (VAC)
                </h4>
                <span class="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">Count: ${vacList.length}</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left bg-white rounded-lg border border-slate-200">
                  <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                    <tr>
                      <th class="p-2">Course Title</th>
                      <th class="p-2 text-center">Enrolled</th>
                      <th class="p-2 text-right">Fee ₹</th>
                      <th class="p-2">Agencies Involved</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${vacList.length > 0 ? vacList.map(v => `
                      <tr>
                        <td class="p-2 font-medium text-slate-800">${v.name || 'Untitled Course'}</td>
                        <td class="p-2 text-center font-bold text-blue-600">${v.studentsEnrolled || 0}</td>
                        <td class="p-2 text-right text-slate-700">₹ ${(Number(v.feeCollected)||0).toLocaleString()}</td>
                        <td class="p-2 text-slate-500">${v.agenciesInvolved || '-'}</td>
                      </tr>
                    `).join('') : `<tr><td colspan="4" class="p-3 text-center text-slate-400">No VAC records added</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CC Table -->
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <i data-lucide="file-badge" class="w-4 h-4 text-blue-600"></i>
                  Certificate Courses (CC)
                </h4>
                <span class="text-xs font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">Count: ${ccList.length}</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left bg-white rounded-lg border border-slate-200">
                  <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                    <tr>
                      <th class="p-2">Course Title</th>
                      <th class="p-2 text-center">Enrolled</th>
                      <th class="p-2 text-right">Fee ₹</th>
                      <th class="p-2">Agencies Involved</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${ccList.length > 0 ? ccList.map(c => `
                      <tr>
                        <td class="p-2 font-medium text-slate-800">${c.name || 'Untitled Course'}</td>
                        <td class="p-2 text-center font-bold text-blue-600">${c.studentsEnrolled || 0}</td>
                        <td class="p-2 text-right text-slate-700">₹ ${(Number(c.feeCollected)||0).toLocaleString()}</td>
                        <td class="p-2 text-slate-500">${c.agenciesInvolved || '-'}</td>
                      </tr>
                    `).join('') : `<tr><td colspan="4" class="p-3 text-center text-slate-400">No Certificate Course records added</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- IKS & Visits & Internships & PTM -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- IKS -->
            <div class="bg-amber-50/40 rounded-xl p-4 border border-amber-200">
              <h4 class="text-xs font-bold uppercase text-amber-950 flex items-center gap-1.5 mb-2">
                <i data-lucide="compass" class="w-4 h-4 text-amber-600"></i>
                Indian Knowledge Systems (IKS)
              </h4>
              <div class="grid grid-cols-4 gap-1.5 text-center text-xs mb-3">
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Seminar</span>
                  <span class="font-bold text-amber-800">${att1.iks?.seminarCount || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Workshop</span>
                  <span class="font-bold text-amber-800">${att1.iks?.workshopCount || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Field Visit</span>
                  <span class="font-bold text-amber-800">${att1.iks?.fieldVisitCount || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Benefitted</span>
                  <span class="font-bold text-emerald-700">${att1.iks?.studentsBenefitted || 0}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-amber-200/60">
                ${att1.iks?.details || 'IKS initiatives integrating indigenous computing, algorithms, and heritage studies.'}
              </p>
            </div>

            <!-- Visits -->
            <div class="bg-indigo-50/40 rounded-xl p-4 border border-indigo-200">
              <h4 class="text-xs font-bold uppercase text-indigo-950 flex items-center gap-1.5 mb-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-indigo-600"></i>
                Industrial & Educational Visits
              </h4>
              <div class="grid grid-cols-4 gap-1.5 text-center text-xs mb-3">
                <div class="p-2 bg-white rounded border border-indigo-200">
                  <span class="text-[10px] text-slate-500 block">Industrial</span>
                  <span class="font-bold text-indigo-800">${att1.visits?.industrial || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-indigo-200">
                  <span class="text-[10px] text-slate-500 block">Educational</span>
                  <span class="font-bold text-indigo-800">${att1.visits?.educational || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-indigo-200">
                  <span class="text-[10px] text-slate-500 block">Field Work</span>
                  <span class="font-bold text-indigo-800">${att1.visits?.fieldWork || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-indigo-200">
                  <span class="text-[10px] text-slate-500 block">Field Visit</span>
                  <span class="font-bold text-indigo-800">${att1.visits?.fieldVisit || 0}</span>
                </div>
              </div>
              <div class="bg-white p-2.5 rounded border border-indigo-200/60 text-xs space-y-1">
                <div class="flex justify-between text-slate-700 font-medium">
                  <span>Students: <strong>${att1.visits?.studentsParticipated || 0}</strong></span>
                  <span>Class: <strong>${att1.visits?.classSec || 'All batches'}</strong></span>
                </div>
                <p class="text-slate-500 text-[11px]">${att1.visits?.details || 'Industry tech parks and research laboratories.'}</p>
              </div>
            </div>

            <!-- Internships -->
            <div class="bg-purple-50/40 rounded-xl p-4 border border-purple-200">
              <h4 class="text-xs font-bold uppercase text-purple-950 flex items-center gap-1.5 mb-2">
                <i data-lucide="briefcase" class="w-4 h-4 text-purple-600"></i>
                Industrial Internships
              </h4>
              <div class="p-3 bg-white rounded-lg border border-purple-200 mb-3 text-center">
                <span class="text-2xl font-black text-purple-700 block">${att1.internships?.studentsInvolved || 0}</span>
                <span class="text-[11px] font-semibold text-slate-500 uppercase">Students in Outside Curriculum</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-purple-200/60">
                ${att1.internships?.details || 'Corporate software projects with leading multinational IT partners.'}
              </p>
            </div>

            <!-- Parent Teacher Meetings (PTM - Table 3 Row 7) -->
            <div class="bg-amber-50/40 rounded-xl p-4 border border-amber-200">
              <h4 class="text-xs font-bold uppercase text-amber-950 flex items-center gap-1.5 mb-2">
                <i data-lucide="users" class="w-4 h-4 text-amber-600"></i>
                Parent Teacher Meetings (PTM)
              </h4>
              <div class="grid grid-cols-2 gap-1.5 text-center text-xs mb-3">
                <div class="p-2.5 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">PTMs Held</span>
                  <span class="text-xl font-black text-amber-800">${att1.ptm?.numberOfPTMs || 0}</span>
                </div>
                <div class="p-2.5 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Parents Attended</span>
                  <span class="text-xl font-black text-amber-800">${att1.ptm?.parentsParticipated || 0}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-amber-200/60">
                ${att1.ptm?.details || 'Semester-wise academic mentoring, student attendance progress, and parent feedback consultations.'}
              </p>
            </div>
          </div>

          <!-- MOOC Cycle Matrix (Table 2 from docx) -->
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 class="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
              <i data-lucide="globe" class="w-4 h-4 text-blue-600"></i>
              SWAYAM / NPTEL MOOC Progression Matrix (Cycle I & Cycle II)
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left bg-white rounded-lg border border-slate-200">
                <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th class="p-2.5">Programme</th>
                    <th class="p-2.5 text-center">Total Students</th>
                    <th class="p-2.5 text-center">Cycle I Registered</th>
                    <th class="p-2.5 text-center">Cycle I Completed</th>
                    <th class="p-2.5 text-center">Cycle II Registered</th>
                    <th class="p-2.5 text-center">Cycle II Completed</th>
                    <th class="p-2.5 text-center">Completion Rate</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr>
                    <td class="p-2.5 font-bold text-slate-800">UG Programme</td>
                    <td class="p-2.5 text-center">${att1.moocs?.ug?.totalStudents || 0}</td>
                    <td class="p-2.5 text-center font-medium">${att1.moocs?.ug?.cycle1_registered || 0}</td>
                    <td class="p-2.5 text-center font-bold text-emerald-600">${att1.moocs?.ug?.cycle1_completed || 0}</td>
                    <td class="p-2.5 text-center font-medium">${att1.moocs?.ug?.cycle2_registered || 0}</td>
                    <td class="p-2.5 text-center font-bold text-emerald-600">${att1.moocs?.ug?.cycle2_completed || 0}</td>
                    <td class="p-2.5 text-center">
                      <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                        ${(((att1.moocs?.ug?.cycle1_completed || 0) + (att1.moocs?.ug?.cycle2_completed || 0)) / Math.max(1, ((att1.moocs?.ug?.cycle1_registered || 0) + (att1.moocs?.ug?.cycle2_registered || 0))) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="p-2.5 font-bold text-slate-800">PG Programme</td>
                    <td class="p-2.5 text-center">${att1.moocs?.pg?.totalStudents || 0}</td>
                    <td class="p-2.5 text-center font-medium">${att1.moocs?.pg?.cycle1_registered || 0}</td>
                    <td class="p-2.5 text-center font-bold text-purple-600">${att1.moocs?.pg?.cycle1_completed || 0}</td>
                    <td class="p-2.5 text-center font-medium">${att1.moocs?.pg?.cycle2_registered || 0}</td>
                    <td class="p-2.5 text-center font-bold text-purple-600">${att1.moocs?.pg?.cycle2_completed || 0}</td>
                    <td class="p-2.5 text-center">
                      <span class="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded">
                        ${(((att1.moocs?.pg?.cycle1_completed || 0) + (att1.moocs?.pg?.cycle2_completed || 0)) / Math.max(1, ((att1.moocs?.pg?.cycle1_registered || 0) + (att1.moocs?.pg?.cycle2_registered || 0))) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ATTRIBUTE II: FACULTY RESOURCES
  // ==========================================
  renderAttributeIISection(att2) {
    const fdpTotal = (att2.fdp?.mmttc_aicte_ugc || 0) + (att2.fdp?.otherInstitutions || 0) + (att2.fdp?.throughFdc || 0) + (att2.fdp?.institutionalLevel || 0);
    const isExpanded = this.isSectionExpanded('att2');
    const resourceTalksTotal = (att2.resourcePerson?.international||0) + (att2.resourcePerson?.national||0) + (att2.resourcePerson?.state||0) + (att2.resourcePerson?.regional||0) + (att2.resourcePerson?.institutional||0);

    return `
      <div id="attr-section-att2" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-cyan-600 text-white rounded-xl shadow-sm">
              <i data-lucide="users" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 border border-cyan-200">Attribute II</span>
                <h3 class="text-base font-bold text-slate-800">Faculty Resources & Development</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Qualifications, BoS, Editorial, Resource Person Roles, FDPs, Fellowships, and Abroad Visits.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              ${att2.newDegrees?.count || 0} Ph.D./PDF Degrees
            </span>
            <span class="px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-lg text-xs font-bold text-cyan-800">
              ${fdpTotal} FDPs Completed
            </span>
            <button id="detail-btn-att2" type="button" onclick="dashboardRenderer.toggleSection('att2')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Executive Count Summary Grid (View Only The Count) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div onclick="dashboardRenderer.toggleSection('att2')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-cyan-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Degrees & NET</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${(att2.newDegrees?.count || 0) + (att2.netSetJrf?.count || 0)}</div>
              <p class="text-[10px] text-slate-500 truncate">${att2.newDegrees?.count || 0} Ph.D. | ${att2.netSetJrf?.count || 0} NET</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att2')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-cyan-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">BoS & Auditors</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${(att2.recognizedBodies?.bosCount || 0) + (att2.recognizedBodies?.externalAuditCount || 0)}</div>
              <p class="text-[10px] text-slate-500 truncate">${att2.recognizedBodies?.bosCount || 0} BoS | ${att2.recognizedBodies?.externalAuditCount || 0} Audit</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att2')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-cyan-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Journals & Rev</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${(att2.researchJournals?.reviewersCount || 0) + (att2.researchJournals?.editorsCount || 0)}</div>
              <p class="text-[10px] text-slate-500 truncate">${att2.researchJournals?.reviewersCount || 0} Rev | ${att2.researchJournals?.editorsCount || 0} Edit</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att2')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-cyan-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Resource Person</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${resourceTalksTotal}</div>
              <p class="text-[10px] text-slate-500 truncate">${att2.resourcePerson?.international || 0} Intl | ${att2.resourcePerson?.national || 0} Natl</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att2')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-cyan-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">FDP Training</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${fdpTotal}</div>
              <p class="text-[10px] text-slate-500 truncate">MMTTC & College FDC</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att2')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-cyan-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Awards & Abroad</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${(att2.awards?.count || 0) + (att2.abroadVisits?.count || 0)}</div>
              <p class="text-[10px] text-slate-500 truncate">${att2.awards?.count || 0} Awards | ${att2.abroadVisits?.count || 0} Visits</p>
            </div>
          </div>

          <!-- Expandable Detailed Container (Toggled via Eye Icon) -->
          <div id="detail-container-att2" class="${isExpanded ? '' : 'hidden'} space-y-6 pt-4 border-t border-slate-200">
          <!-- Row 1: Qualifications & Professional Bodies -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 block">1. Higher Qualifications</span>
              <div class="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200">
                <span class="text-xs text-slate-600">New Degrees Conferred:</span>
                <span class="text-sm font-black text-cyan-700">${att2.newDegrees?.count || 0}</span>
              </div>
              <p class="text-xs text-slate-500">${att2.newDegrees?.details || '-'}</p>
              <div class="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200 mt-2">
                <span class="text-xs text-slate-600">NET / SET / JRF:</span>
                <span class="text-sm font-black text-blue-700">${att2.netSetJrf?.count || 0}</span>
              </div>
              <p class="text-xs text-slate-500">${att2.netSetJrf?.details || '-'}</p>
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 block">2. Recognized Bodies & Audit Roles</span>
              <div class="grid grid-cols-2 gap-2 text-center text-xs">
                <div class="p-2.5 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">BoS Members</span>
                  <span class="text-lg font-black text-indigo-700">${att2.recognizedBodies?.bosCount || 0}</span>
                </div>
                <div class="p-2.5 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Academic Auditors</span>
                  <span class="text-lg font-black text-indigo-700">${att2.recognizedBodies?.externalAuditCount || 0}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                ${att2.recognizedBodies?.details || 'BoS members at universities and autonomous colleges.'}
              </p>
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 block">3. Journal Editorial & Reviewers</span>
              <div class="grid grid-cols-2 gap-2 text-center text-xs">
                <div class="p-2.5 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Journal Reviewers</span>
                  <span class="text-lg font-black text-blue-700">${att2.researchJournals?.reviewersCount || 0}</span>
                </div>
                <div class="p-2.5 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Journal Editors</span>
                  <span class="text-lg font-black text-blue-700">${att2.researchJournals?.editorsCount || 0}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                ${att2.researchJournals?.details || 'Reviewers for IEEE, Elsevier, Springer journals.'}
              </p>
            </div>
          </div>

          <!-- Row 2: Resource Person Roles & FDP Breakdown -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Resource Person -->
            <div class="bg-amber-50/40 rounded-xl p-4 border border-amber-200 space-y-3">
              <h4 class="text-xs font-bold uppercase text-amber-950 flex items-center gap-1.5">
                <i data-lucide="mic" class="w-4 h-4 text-amber-600"></i>
                Resource Person Engagements (Keynote Addresses & Talks)
              </h4>
              <div class="grid grid-cols-5 gap-2 text-center text-xs">
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">International</span>
                  <span class="text-base font-black text-amber-800">${att2.resourcePerson?.international || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">National</span>
                  <span class="text-base font-black text-amber-800">${att2.resourcePerson?.national || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">State</span>
                  <span class="text-base font-black text-amber-800">${att2.resourcePerson?.state || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Regional</span>
                  <span class="text-base font-black text-amber-800">${att2.resourcePerson?.regional || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Institutional</span>
                  <span class="text-base font-black text-amber-800">${att2.resourcePerson?.institutional || 0}</span>
                </div>
              </div>
              <div class="p-3 bg-white rounded border border-amber-200 text-xs">
                <span class="font-bold text-amber-900 block mb-1">Faculty Served at International & National Forums:</span>
                <p class="text-slate-600 leading-relaxed">${att2.resourcePerson?.servedFacultyNames || 'Faculty invited as guest speakers.'}</p>
              </div>
            </div>

            <!-- FDP Breakdown -->
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h4 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <i data-lucide="graduation-cap" class="w-4 h-4 text-purple-600"></i>
                Faculty Development / Training Programmes Attended
              </h4>
              <div class="grid grid-cols-4 gap-2 text-center text-xs">
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">MMTTC / UGC</span>
                  <span class="text-base font-black text-purple-700">${att2.fdp?.mmttc_aicte_ugc || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Other Inst.</span>
                  <span class="text-base font-black text-purple-700">${att2.fdp?.otherInstitutions || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">College FDC</span>
                  <span class="text-base font-black text-purple-700">${att2.fdp?.throughFdc || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Institutional</span>
                  <span class="text-base font-black text-purple-700">${att2.fdp?.institutionalLevel || 0}</span>
                </div>
              </div>
              <div class="p-3 bg-white rounded border border-slate-200 text-xs">
                <span class="font-bold text-slate-700 block mb-1">Key Training Themes:</span>
                <p class="text-slate-600 leading-relaxed">${att2.fdp?.details || 'Refresher courses on AI, NEP 2020 pedagogical models.'}</p>
              </div>
            </div>
          </div>

          <!-- Row 3: Industrial Training, Fellowships, Awards, Abroad Visits -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span class="font-bold text-slate-700 uppercase text-[11px] block">Industrial Immersion</span>
              <span class="text-base font-black text-slate-800">${att2.industrialTraining?.count || 0} Faculty</span>
              <p class="text-slate-500 text-[11px] mt-1">${att2.industrialTraining?.details || '-'}</p>
            </div>
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span class="font-bold text-slate-700 uppercase text-[11px] block">Fellowships (Nat/Int)</span>
              <span class="text-base font-black text-slate-800">${(att2.fellowships?.national || 0) + (att2.fellowships?.international || 0)} Awarded</span>
              <p class="text-slate-500 text-[11px] mt-1">${att2.fellowships?.details || '-'}</p>
            </div>
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span class="font-bold text-slate-700 uppercase text-[11px] block">Recognized Awards</span>
              <span class="text-base font-black text-amber-700">${att2.awards?.count || 0} Honors</span>
              <p class="text-slate-500 text-[11px] mt-1">${att2.awards?.details || '-'}</p>
            </div>
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span class="font-bold text-slate-700 uppercase text-[11px] block">Academic Abroad Visits</span>
              <span class="text-base font-black text-blue-700">${att2.abroadVisits?.count || 0} Visits</span>
              <p class="text-slate-500 text-[11px] mt-1">${att2.abroadVisits?.facultyNames || '-'}</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ATTRIBUTE 4 & 7: INFRASTRUCTURE & GRANTS
  // ==========================================
  renderAttributeIV_VIISection(att4_7) {
    const extFunds = att4_7.externalFunds || [];
    const mgmtFunds = att4_7.managementFunds || [];
    const totalExt = extFunds.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const totalMgmt = mgmtFunds.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const seedMoney = Number(att4_7.seedMoney?.totalSanctioned) || 
                      (Number(att4_7.seedMoney?.projectsAmount || 0) + Number(att4_7.seedMoney?.patentsAmount || 0) + Number(att4_7.seedMoney?.copyrightAmount || 0));
    const totalAllFunds = totalExt + totalMgmt + seedMoney;
    const isExpanded = this.isSectionExpanded('att4_7');

    return `
      <div id="attr-section-att4_7" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
              <i data-lucide="indian-rupee" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">Attribute 4 & 7</span>
                <h3 class="text-base font-bold text-slate-800">Infrastructure & Resource Mobilization</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">External Agency Grants, Management Research Funding, Seed Money, and Endowments.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              ₹ ${(totalExt / 100000).toFixed(2)}L External
            </span>
            <span class="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black shadow-sm">
              Total: ₹ ${(totalAllFunds / 100000).toFixed(2)} Lakhs
            </span>
            <button id="detail-btn-att4_7" type="button" onclick="dashboardRenderer.toggleSection('att4_7')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Executive Count Summary Grid (View Only The Count) -->
          <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div onclick="dashboardRenderer.toggleSection('att4_7')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">External Grants</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">₹ ${(totalExt / 100000).toFixed(2)}L</div>
              <p class="text-[10px] text-slate-500 truncate">${extFunds.length} Project Proposals</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att4_7')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Management Funds</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">₹ ${(totalMgmt / 100000).toFixed(2)}L</div>
              <p class="text-[10px] text-slate-500 truncate">${mgmtFunds.length} College Schemes</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att4_7')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Seed Money</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">₹ ${(seedMoney / 100000).toFixed(2)}L</div>
              <p class="text-[10px] text-slate-500 truncate">Projects, Patents, Copyrights</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att4_7')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Endowments</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att4_7.endowments?.count || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">Instituted in 2026-2027</p>
            </div>
          </div>

          <!-- Expandable Detailed Container (Toggled via Eye Icon) -->
          <div id="detail-container-att4_7" class="${isExpanded ? '' : 'hidden'} space-y-6 pt-4 border-t border-slate-200">
          <!-- External Funds Table -->
          <div class="bg-emerald-50/30 rounded-xl p-4 border border-emerald-200">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-bold uppercase text-emerald-950 flex items-center gap-1.5">
                <i data-lucide="external-link" class="w-4 h-4 text-emerald-600"></i>
                1. Funds Received from External Agencies (DST, AICTE, SERB, ICSSR, etc.)
              </h4>
              <span class="text-xs font-bold text-emerald-800">Total: ₹ ${(totalExt / 100000).toFixed(2)} Lakhs</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left bg-white rounded-lg border border-slate-200">
                <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th class="p-2.5">Category</th>
                    <th class="p-2.5">Funding Agency</th>
                    <th class="p-2.5 text-right">Amount Received</th>
                    <th class="p-2.5">Faculty Involved / PI</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${extFunds.length > 0 ? extFunds.map(f => `
                    <tr>
                      <td class="p-2.5 font-medium text-slate-800">${f.category}</td>
                      <td class="p-2.5 font-bold text-blue-700">${f.agency}</td>
                      <td class="p-2.5 text-right font-black text-emerald-700">₹ ${(Number(f.amount) || 0).toLocaleString()}</td>
                      <td class="p-2.5 text-slate-600">${f.facultyInvolved || '-'}</td>
                    </tr>
                  `).join('') : `<tr><td colspan="4" class="p-3 text-center text-slate-400">No external grant records added</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Management Funds Table -->
          <div class="bg-blue-50/30 rounded-xl p-4 border border-blue-200">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-bold uppercase text-blue-950 flex items-center gap-1.5">
                <i data-lucide="shield-check" class="w-4 h-4 text-blue-600"></i>
                2. Funds Received from College Management
              </h4>
              <span class="text-xs font-bold text-blue-800">Total: ₹ ${(totalMgmt / 100000).toFixed(2)} Lakhs</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left bg-white rounded-lg border border-slate-200">
                <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th class="p-2.5">Purpose / Scheme</th>
                    <th class="p-2.5 text-right">Amount Received</th>
                    <th class="p-2.5">Faculty Benefitted / Association</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${mgmtFunds.length > 0 ? mgmtFunds.map(f => `
                    <tr>
                      <td class="p-2.5 font-medium text-slate-800">${f.category}</td>
                      <td class="p-2.5 text-right font-black text-blue-700">₹ ${(Number(f.amount) || 0).toLocaleString()}</td>
                      <td class="p-2.5 text-slate-600">${f.facultyInvolved || '-'}</td>
                    </tr>
                  `).join('') : `<tr><td colspan="3" class="p-3 text-center text-slate-400">No management funding records added</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Seed Money & Endowments -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-2">
              <span class="text-xs font-bold uppercase text-amber-950 flex items-center gap-1.5">
                <i data-lucide="sprout" class="w-4 h-4 text-amber-600"></i>
                3. Seed Money Disbursed
              </span>
              <div class="grid grid-cols-3 gap-2 text-center text-xs">
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Projects ₹</span>
                  <span class="font-bold text-amber-800">₹ ${(Number(att4_7.seedMoney?.projectsAmount) || 0).toLocaleString()}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Patents ₹</span>
                  <span class="font-bold text-amber-800">₹ ${(Number(att4_7.seedMoney?.patentsAmount) || 0).toLocaleString()}</span>
                </div>
                <div class="p-2 bg-white rounded border border-amber-200">
                  <span class="text-[10px] text-slate-500 block">Copyrights ₹</span>
                  <span class="font-bold text-amber-800">₹ ${(Number(att4_7.seedMoney?.copyrightAmount) || 0).toLocaleString()}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2.5 rounded border border-amber-200">
                ${att4_7.seedMoney?.details || 'Seed grant for innovative student prototypes.'}
              </p>
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <i data-lucide="landmark" class="w-4 h-4 text-slate-600"></i>
                4. Endowments Established in 2026-2027
              </span>
              <div class="p-2.5 bg-white rounded border border-slate-200 flex justify-between items-center text-xs">
                <span class="text-slate-600">Endowments Count:</span>
                <span class="text-base font-black text-slate-800">${att4_7.endowments?.count || 0}</span>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                ${att4_7.endowments?.details || 'Academic memorial lectures and endowments instituted.'}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ATTRIBUTE V: LEARNING & TEACHING
  // ==========================================
  renderAttributeVSection(att5) {
    const isExpanded = this.isSectionExpanded('att5');
    return `
      <div id="attr-section-att5" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
              <i data-lucide="laptop" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-200">Attribute V</span>
                <h3 class="text-base font-bold text-slate-800">Learning and Teaching</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">MoUs Signed, Linkages, and Four-Quadrant E-Contents Created.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              ${(att5.mouCreated?.count || 0) + (att5.previousMous?.count || 0)} Total MoUs
            </span>
            <span class="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-800">
              ${att5.eContent?.count || 0} E-Content Modules
            </span>
            <button id="detail-btn-att5" type="button" onclick="dashboardRenderer.toggleSection('att5')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Executive Count Summary Grid (View Only The Count) -->
          <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div onclick="dashboardRenderer.toggleSection('att5')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-indigo-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">New MoUs (2026-27)</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att5.mouCreated?.count || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">Industry Certifications</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att5')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-indigo-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Previous MoUs</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att5.previousMous?.count || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">Active Collaborations</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att5')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-indigo-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Linkages</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att5.linkages?.count || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">Consultations & Syllabus</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att5')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-indigo-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">E-Contents</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att5.eContent?.count || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">4-Quadrant SWAYAM Model</p>
            </div>
          </div>

          <!-- Expandable Detailed Container (Toggled via Eye Icon) -->
          <div id="detail-container-att5" class="${isExpanded ? '' : 'hidden'} space-y-4 pt-4 border-t border-slate-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- New MoUs -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase text-slate-700">1. MoUs Created in A.Y. 2026-2027</span>
                <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-black rounded">${att5.mouCreated?.count || 0} Signed</span>
              </div>
              <p class="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                ${att5.mouCreated?.activitiesConducted || 'Active collaborative industry certifications.'}
              </p>
            </div>

            <!-- Previous MoUs -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase text-slate-700">2. Previous Active MoUs</span>
                <span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-black rounded">${att5.previousMous?.count || 0} Active</span>
              </div>
              <p class="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                ${att5.previousMous?.activitiesConducted || 'Continuous engagements and student placements.'}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Linkages -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase text-slate-700">3. Industry / Academic Linkages</span>
                <span class="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-black rounded">${att5.linkages?.count || 0} Linkages</span>
              </div>
              <p class="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                ${att5.linkages?.activitiesConducted || 'Consultations, syllabus updates, and student projects.'}
              </p>
            </div>

            <!-- E-Content -->
            <div class="p-4 bg-blue-50/40 rounded-xl border border-blue-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase text-blue-950">4. Four-Quadrant E-Contents (SWAYAM Model)</span>
                <span class="px-2 py-0.5 bg-blue-600 text-white text-xs font-black rounded">${att5.eContent?.count || 0} Modules</span>
              </div>
              <p class="text-xs text-slate-700 bg-white p-3 rounded-lg border border-blue-200 leading-relaxed">
                ${att5.eContent?.details || 'Video, e-text, self-assessment quizzes, and online discussion forums.'}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ATTRIBUTE VI & VIII: EXTENDED CURRICULAR
  // ==========================================
  renderAttributeVI_VIIISection(att6_8) {
    const clubs = att6_8.clubs || [];
    const awards = att6_8.studentParticipationAwards || {};
    const totalAwards = (awards.sports || 0) + (awards.cultural || 0) + (awards.externalAcademicEvents || 0) + (awards.extraCurricularEvents || 0) + (awards.coCurricularEvents || 0);
    const isExpanded = this.isSectionExpanded('att6_8');

    return `
      <div id="attr-section-att6_8" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-teal-600 text-white rounded-xl shadow-sm">
              <i data-lucide="trophy" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-200">Attribute VI & VIII</span>
                <h3 class="text-base font-bold text-slate-800">Extended Curricular Engagements & Student Awards</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Clubs & Associations, Competitive Exams, Dual Degrees, and Sports/Cultural Prizes.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              ${att6_8.competitiveExams?.qualified || 0} Cleared Exams
            </span>
            <span class="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-black shadow-sm">
              ${totalAwards} Student Awards
            </span>
            <button id="detail-btn-att6_8" type="button" onclick="dashboardRenderer.toggleSection('att6_8')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Executive Count Summary Grid (View Only The Count) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div onclick="dashboardRenderer.toggleSection('att6_8')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-teal-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Dept Clubs</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${clubs.length}</div>
              <p class="text-[10px] text-slate-500 truncate">Active Associations</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att6_8')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-teal-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Other Degrees</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att6_8.pursuingOtherDegrees?.count || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">Dual Diplomas</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att6_8')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-teal-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Chapters</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att6_8.studentChapters?.count || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">ACM / CSI / IEEE</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att6_8')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-teal-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Comp Exams</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att6_8.competitiveExams?.qualified || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">of ${att6_8.competitiveExams?.appeared || 0} Appeared</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att6_8')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-teal-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Student Awards</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${totalAwards}</div>
              <p class="text-[10px] text-slate-500 truncate">Trophies & Prizes</p>
            </div>
          </div>

          <!-- Expandable Detailed Container (Toggled via Eye Icon) -->
          <div id="detail-container-att6_8" class="${isExpanded ? '' : 'hidden'} space-y-6 pt-4 border-t border-slate-200">
          <!-- Clubs Table -->
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <i data-lucide="users-round" class="w-4 h-4 text-indigo-600"></i>
                1. Department Clubs & Associations
              </h4>
              <span class="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">${clubs.length} Active Clubs</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left bg-white rounded-lg border border-slate-200">
                <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th class="p-2.5">Club / Association Name</th>
                    <th class="p-2.5 text-center">UG Students</th>
                    <th class="p-2.5 text-center">PG Students</th>
                    <th class="p-2.5">Key Activities Conducted in 2026-2027</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${clubs.length > 0 ? clubs.map(c => `
                    <tr>
                      <td class="p-2.5 font-bold text-slate-800">${c.clubName}</td>
                      <td class="p-2.5 text-center text-blue-700 font-semibold">${c.studentsUG || 0}</td>
                      <td class="p-2.5 text-center text-purple-700 font-semibold">${c.studentsPG || 0}</td>
                      <td class="p-2.5 text-slate-600">${c.activities}</td>
                    </tr>
                  `).join('') : `<tr><td colspan="4" class="p-3 text-center text-slate-400">No club records added</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Dual Degrees & Chapters & Exams -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 block">2. Pursuing Other Degrees</span>
              <div class="p-2.5 bg-white rounded border border-slate-200 flex justify-between items-center text-xs">
                <span class="text-slate-600">Total Enrolled:</span>
                <span class="text-base font-black text-indigo-700">${att6_8.pursuingOtherDegrees?.count || 0}</span>
              </div>
              <p class="text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                ${att6_8.pursuingOtherDegrees?.details || 'Dual diplomas, language certifications.'}
              </p>
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 block">3. Student Chapters Established</span>
              <div class="p-2.5 bg-white rounded border border-slate-200 flex justify-between items-center text-xs">
                <span class="text-slate-600">Chapters:</span>
                <span class="text-base font-black text-blue-700">${att6_8.studentChapters?.count || 0}</span>
              </div>
              <p class="text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                ${att6_8.studentChapters?.details || 'ACM, CSI, IEEE Student Branches.'}
              </p>
            </div>

            <div class="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-2">
              <span class="text-xs font-bold uppercase text-emerald-950 block">4. Competitive Examinations</span>
              <div class="grid grid-cols-2 gap-2 text-center text-xs">
                <div class="p-2 bg-white rounded border border-emerald-200">
                  <span class="text-[10px] text-slate-500 block">Appeared</span>
                  <span class="text-base font-bold text-slate-700">${att6_8.competitiveExams?.appeared || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-emerald-200">
                  <span class="text-[10px] text-slate-500 block">Qualified</span>
                  <span class="text-base font-black text-emerald-700">${att6_8.competitiveExams?.qualified || 0}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-emerald-200">
                ${att6_8.competitiveExams?.details || 'GATE, NET, TNPSC, Banking.'}
              </p>
            </div>
          </div>

          <!-- Awards Breakdown -->
          <div class="bg-amber-50/40 rounded-xl p-4 border border-amber-200 space-y-3">
            <h4 class="text-xs font-bold uppercase text-amber-950 flex items-center gap-1.5">
              <i data-lucide="award" class="w-4 h-4 text-amber-600"></i>
              5. Students' Participation and Awards Breakdown
            </h4>
            <div class="grid grid-cols-5 gap-2 text-center text-xs">
              <div class="p-2.5 bg-white rounded-lg border border-amber-200">
                <span class="text-[10px] text-slate-500 block">Sports</span>
                <span class="text-lg font-black text-amber-800">${awards.sports || 0}</span>
              </div>
              <div class="p-2.5 bg-white rounded-lg border border-amber-200">
                <span class="text-[10px] text-slate-500 block">Cultural</span>
                <span class="text-lg font-black text-amber-800">${awards.cultural || 0}</span>
              </div>
              <div class="p-2.5 bg-white rounded-lg border border-amber-200">
                <span class="text-[10px] text-slate-500 block">Academic Events</span>
                <span class="text-lg font-black text-amber-800">${awards.externalAcademicEvents || 0}</span>
              </div>
              <div class="p-2.5 bg-white rounded-lg border border-amber-200">
                <span class="text-[10px] text-slate-500 block">Extra-Curricular</span>
                <span class="text-lg font-black text-amber-800">${awards.extraCurricularEvents || 0}</span>
              </div>
              <div class="p-2.5 bg-white rounded-lg border border-amber-200">
                <span class="text-[10px] text-slate-500 block">Co-Curricular</span>
                <span class="text-lg font-black text-amber-800">${awards.coCurricularEvents || 0}</span>
              </div>
            </div>
            <div class="p-3 bg-white rounded-lg border border-amber-200 text-xs">
              <span class="font-bold text-amber-950 block mb-1">Championship Trophies & Awards Highlights:</span>
              <p class="text-slate-600 leading-relaxed">${awards.details || 'Overall championship winners across inter-collegiate symposia.'}</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TABLE 10: STUDENTS OUTCOMES – 2026 PASSED OUT
  // ==========================================
  renderStudentsOutcomesSection(outcomes) {
    const isExpanded = this.isSectionExpanded('outcomes');
    if (!outcomes) {
      outcomes = {
        ug: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 },
        pg: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 },
        phd: { strength: 0, onCampus: 0, offCampus: 0, higherStudies: 0, entrepreneur: 0, others: 0 }
      };
    }
    const ug = outcomes.ug || {};
    const pg = outcomes.pg || {};
    const phd = outcomes.phd || {};

    const totalStrength = (ug.strength || 0) + (pg.strength || 0) + (phd.strength || 0);
    const totalOnCampus = (ug.onCampus || 0) + (pg.onCampus || 0) + (phd.onCampus || 0);
    const totalOffCampus = (ug.offCampus || 0) + (pg.offCampus || 0) + (phd.offCampus || 0);
    const totalPlaced = totalOnCampus + totalOffCampus;
    const totalHigherStudies = (ug.higherStudies || 0) + (pg.higherStudies || 0) + (phd.higherStudies || 0);
    const totalEntrepreneur = (ug.entrepreneur || 0) + (pg.entrepreneur || 0) + (phd.entrepreneur || 0);
    const totalOthers = (ug.others || 0) + (pg.others || 0) + (phd.others || 0);
    const totalPositive = totalPlaced + totalHigherStudies + totalEntrepreneur;

    const placementRate = totalStrength > 0 ? ((totalPlaced / totalStrength) * 100).toFixed(1) : '0.0';
    const progressionRate = totalStrength > 0 ? ((totalPositive / totalStrength) * 100).toFixed(1) : '0.0';

    return `
      <div id="attr-section-outcomes" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
              <i data-lucide="graduation-cap" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">Table 10</span>
                <h3 class="text-base font-bold text-slate-800">Students Outcomes – 2026 Passed out</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Final-Year Batch Placement Records, Higher Studies Progression, and Entrepreneurship Ventures.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button id="detail-btn-outcomes" type="button" onclick="dashboardRenderer.toggleSection('outcomes')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
            </button>
            <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              ${totalPlaced} / ${totalStrength} Placed
            </span>
            <span class="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black shadow-sm">
              ${placementRate}% Placement Rate
            </span>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Executive Count Summary Grid (Always Visible) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div onclick="dashboardRenderer.toggleSection('outcomes')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Graduating Batch</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${totalStrength}</div>
              <p class="text-[10px] text-slate-500 truncate">${ug.strength||0} UG / ${pg.strength||0} PG / ${phd.strength||0} PhD</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('outcomes')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">On Campus</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-blue-700 mt-1">${totalOnCampus}</div>
              <p class="text-[10px] text-slate-500 truncate">Tier-1 Corporates</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('outcomes')" class="bg-slate-50 p-3 rounded-xl border border-blue-200 hover:border-blue-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">OFF Campus</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600"></i>
              </div>
              <div class="text-xl font-black text-indigo-700 mt-1">${totalOffCampus}</div>
              <p class="text-[10px] text-slate-500 truncate">Direct Drives</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('outcomes')" class="bg-slate-50 p-3 rounded-xl border border-purple-200 hover:border-purple-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Higher Studies</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600"></i>
              </div>
              <div class="text-xl font-black text-purple-700 mt-1">${totalHigherStudies}</div>
              <p class="text-[10px] text-slate-500 truncate">PG & Doctoral Progression</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('outcomes')" class="bg-slate-50 p-3 rounded-xl border border-amber-200 hover:border-amber-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Entrepreneurs</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600"></i>
              </div>
              <div class="text-xl font-black text-amber-700 mt-1">${totalEntrepreneur}</div>
              <p class="text-[10px] text-slate-500 truncate">Startups & Ventures</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('outcomes')" class="bg-slate-50 p-3 rounded-xl border border-emerald-200 hover:border-emerald-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-emerald-800 block">Total Positive</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"></i>
              </div>
              <div class="text-xl font-black text-emerald-700 mt-1">${progressionRate}%</div>
              <p class="text-[10px] text-emerald-600 font-semibold truncate">${totalPositive} Successful</p>
            </div>
          </div>

          <!-- Expandable Detailed Container (Toggled via Eye Icon) -->
          <div id="detail-container-outcomes" class="${isExpanded ? '' : 'hidden'} space-y-4 pt-4 border-t border-slate-200">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left bg-white rounded-xl border border-slate-200 overflow-hidden">
                <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th class="p-3">Programme</th>
                    <th class="p-3 text-center">Batch Strength</th>
                    <th class="p-3 text-center">On Campus</th>
                    <th class="p-3 text-center">OFF Campus</th>
                    <th class="p-3 text-center font-bold">Total Placed</th>
                    <th class="p-3 text-center">Higher Studies</th>
                    <th class="p-3 text-center">Entrepreneur</th>
                    <th class="p-3 text-center">Others</th>
                    <th class="p-3 text-center font-black">Placed %</th>
                    <th class="p-3 text-center font-black">Progression %</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${['ug', 'pg', 'phd'].map(prog => {
                    const p = outcomes[prog] || {};
                    const s = p.strength || 0;
                    const pl = (p.onCampus || 0) + (p.offCampus || 0);
                    const pos = pl + (p.higherStudies || 0) + (p.entrepreneur || 0);
                    const plPct = s > 0 ? ((pl / s) * 100).toFixed(1) : '0.0';
                    const posPct = s > 0 ? ((pos / s) * 100).toFixed(1) : '0.0';
                    const label = prog === 'ug' ? 'UG (Undergraduate)' : (prog === 'pg' ? 'PG (Postgraduate)' : 'PhD (Doctoral)');
                    return `
                      <tr class="hover:bg-slate-50">
                        <td class="p-3 font-bold text-slate-800">${label}</td>
                        <td class="p-3 text-center font-semibold text-slate-700">${s}</td>
                        <td class="p-3 text-center text-blue-700 font-semibold">${p.onCampus || 0}</td>
                        <td class="p-3 text-center text-indigo-700 font-semibold">${p.offCampus || 0}</td>
                        <td class="p-3 text-center font-black text-slate-800 bg-slate-50/60">${pl}</td>
                        <td class="p-3 text-center text-purple-700 font-semibold">${p.higherStudies || 0}</td>
                        <td class="p-3 text-center text-amber-700 font-semibold">${p.entrepreneur || 0}</td>
                        <td class="p-3 text-center text-slate-500">${p.others || 0}</td>
                        <td class="p-3 text-center font-bold text-emerald-700 bg-emerald-50/40">${plPct}%</td>
                        <td class="p-3 text-center font-black text-blue-700 bg-blue-50/40">${posPct}%</td>
                      </tr>
                    `;
                  }).join('')}
                  <tr class="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td class="p-3">Total Graduating Cohort</td>
                    <td class="p-3 text-center">${totalStrength}</td>
                    <td class="p-3 text-center text-blue-800">${totalOnCampus}</td>
                    <td class="p-3 text-center text-indigo-800">${totalOffCampus}</td>
                    <td class="p-3 text-center font-black text-slate-900 bg-slate-200/50">${totalPlaced}</td>
                    <td class="p-3 text-center text-purple-800">${totalHigherStudies}</td>
                    <td class="p-3 text-center text-amber-800">${totalEntrepreneur}</td>
                    <td class="p-3 text-center text-slate-700">${totalOthers}</td>
                    <td class="p-3 text-center text-emerald-800 text-sm bg-emerald-100/60">${placementRate}%</td>
                    <td class="p-3 text-center text-blue-900 text-sm bg-blue-100/60">${progressionRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ATTRIBUTE IX: RESEARCH & INNOVATION
  // ==========================================
  renderAttributeIXSection(att9) {
    const isExpanded = this.isSectionExpanded('att9');
    const scopus = att9.papersPublished?.scopus || 0;
    const wos = att9.papersPublished?.wos || 0;
    const ugc = att9.papersPublished?.ugcCare || 0;
    const totalPubs = scopus + wos + ugc;
    const totalBooks = (att9.books?.published || 0) + (att9.books?.edited || 0) + (att9.books?.chaptersContributed || 0);
    const totalConfs = (att9.conferencesPresented?.indexed || 0) + (att9.conferencesPresented?.nonIndexed || 0);
    const totalDigitalAssets = (att9.copyrights?.count || 0) + (att9.oer?.count || 0);

    return `
      <div id="attr-section-att9" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-purple-600 text-white rounded-xl shadow-sm">
              <i data-lucide="award" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200">Attribute IX</span>
                <h3 class="text-base font-bold text-slate-800">Research and Innovation Outcomes</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Doctoral Supervision, Scopus/WoS Publications, Books, Patents Granted, and Software Copyrights.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button id="detail-btn-att9" type="button" onclick="dashboardRenderer.toggleSection('att9')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}">
              <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
            </button>
            <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              ${totalPubs} Journal Papers
            </span>
            <span class="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-black shadow-sm">
              ${att9.patents?.granted || 0} Patents Granted
            </span>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Executive Count Summary Grid (Always Visible) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div onclick="dashboardRenderer.toggleSection('att9')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-purple-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Ph.D. Conferred</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att9.phdConferred?.count || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">${att9.newScholars?.count || 0} Enrolled</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att9')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-purple-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Indexed Papers</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${totalPubs}</div>
              <p class="text-[10px] text-slate-500 truncate">${scopus} Scopus / ${wos} WoS</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att9')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-purple-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Conferences</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${totalConfs}</div>
              <p class="text-[10px] text-slate-500 truncate">${att9.conferencesPresented?.indexed || 0} Indexed</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att9')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-purple-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Books & Ch.</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${totalBooks}</div>
              <p class="text-[10px] text-slate-500 truncate">${att9.books?.published || 0} Books Published</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att9')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-purple-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Indian Patents</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${att9.patents?.granted || 0}</div>
              <p class="text-[10px] text-slate-500 truncate">${att9.patents?.applied || 0} Applied</p>
            </div>

            <div onclick="dashboardRenderer.toggleSection('att9')" class="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-purple-400 transition cursor-pointer group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Copyright & OER</span>
                <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600"></i>
              </div>
              <div class="text-xl font-black text-slate-800 mt-1">${totalDigitalAssets}</div>
              <p class="text-[10px] text-slate-500 truncate">${att9.copyrights?.count || 0} SW / ${att9.oer?.count || 0} OER</p>
            </div>
          </div>

          <!-- Expandable Detailed Container (Toggled via Eye Icon) -->
          <div id="detail-container-att9" class="${isExpanded ? '' : 'hidden'} space-y-6 pt-4 border-t border-slate-200">
          <!-- Row 1: Doctoral Studies -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span class="text-xs font-bold uppercase text-slate-700 block">1. Ph.D. Conferred</span>
              <span class="text-2xl font-black text-purple-700 block">${att9.phdConferred?.count || 0}</span>
              <p class="text-xs text-slate-500">${att9.phdConferred?.details || 'Doctoral scholars defended thesis.'}</p>
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span class="text-xs font-bold uppercase text-slate-700 block">2. New Research Guides</span>
              <span class="text-2xl font-black text-blue-700 block">${att9.newGuides?.count || 0}</span>
              <p class="text-xs text-slate-500">${att9.newGuides?.details || 'Faculty approved as supervisors.'}</p>
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span class="text-xs font-bold uppercase text-slate-700 block">3. New Scholars Enrolled</span>
              <span class="text-2xl font-black text-indigo-700 block">${att9.newScholars?.count || 0}</span>
              <p class="text-xs text-slate-500">${att9.newScholars?.details || 'Full-time & part-time scholars.'}</p>
            </div>
          </div>

          <!-- Row 2: Publications & Conferences & Books -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Journal Papers -->
            <div class="p-4 bg-blue-50/40 rounded-xl border border-blue-200 space-y-2">
              <span class="text-xs font-bold uppercase text-blue-950 block">4. Research Papers in Journals</span>
              <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div class="p-2 bg-white rounded border border-blue-200">
                  <span class="text-[10px] text-slate-500 block">Scopus</span>
                  <span class="font-black text-blue-700">${scopus}</span>
                </div>
                <div class="p-2 bg-white rounded border border-blue-200">
                  <span class="text-[10px] text-slate-500 block">WoS</span>
                  <span class="font-black text-indigo-700">${wos}</span>
                </div>
                <div class="p-2 bg-white rounded border border-blue-200">
                  <span class="text-[10px] text-slate-500 block">UGC-CARE</span>
                  <span class="font-black text-slate-700">${ugc}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-blue-200">
                ${att9.papersPublished?.details || 'Publications in high-impact indexed journals.'}
              </p>
            </div>

            <!-- Conferences -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 block">5. Conference Presentations</span>
              <div class="grid grid-cols-2 gap-2 text-center text-xs">
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Indexed</span>
                  <span class="font-black text-purple-700">${att9.conferencesPresented?.indexed || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Non-Indexed</span>
                  <span class="font-black text-slate-700">${att9.conferencesPresented?.nonIndexed || 0}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                ${att9.conferencesPresented?.details || 'IEEE and Springer international proceedings.'}
              </p>
            </div>

            <!-- Books -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 block">6. Books & Book Chapters</span>
              <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Published</span>
                  <span class="font-black text-amber-700">${att9.books?.published || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Edited</span>
                  <span class="font-black text-amber-700">${att9.books?.edited || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Chapters</span>
                  <span class="font-black text-amber-700">${att9.books?.chaptersContributed || 0}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                ${att9.books?.details || 'Authored books with standard ISBN.'}
              </p>
            </div>
          </div>

          <!-- Row 3: Patents, Copyrights & OER -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Patents -->
            <div class="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-2">
              <span class="text-xs font-bold uppercase text-emerald-950 flex items-center gap-1.5">
                <i data-lucide="shield-alert" class="w-4 h-4 text-emerald-600"></i>
                7. Indian Patents
              </span>
              <div class="grid grid-cols-2 gap-2 text-center text-xs">
                <div class="p-2 bg-white rounded border border-emerald-200">
                  <span class="text-[10px] text-slate-500 block">Applied</span>
                  <span class="text-base font-bold text-slate-700">${att9.patents?.applied || 0}</span>
                </div>
                <div class="p-2 bg-white rounded border border-emerald-200">
                  <span class="text-[10px] text-slate-500 block">Granted</span>
                  <span class="text-base font-black text-emerald-700">${att9.patents?.granted || 0}</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-emerald-200">
                ${att9.patents?.details || 'Patents in IoT, agriculture, and healthcare systems.'}
              </p>
            </div>

            <!-- Copyrights -->
            <div class="p-4 bg-blue-50/40 rounded-xl border border-blue-200 space-y-2">
              <span class="text-xs font-bold uppercase text-blue-950 flex items-center gap-1.5">
                <i data-lucide="code" class="w-4 h-4 text-blue-600"></i>
                8. Software Copyrights
              </span>
              <div class="p-2.5 bg-white rounded border border-blue-200 text-center text-xs">
                <span class="text-2xl font-black text-blue-700 block">${att9.copyrights?.count || 0}</span>
                <span class="text-[10px] text-slate-500 uppercase font-semibold">Registered Software Copyrights</span>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-blue-200">
                ${att9.copyrights?.details || 'Software evaluation tools and campus applications.'}
              </p>
            </div>

            <!-- OER -->
            <div class="p-4 bg-purple-50/40 rounded-xl border border-purple-200 space-y-2">
              <span class="text-xs font-bold uppercase text-purple-950 flex items-center gap-1.5">
                <i data-lucide="share-2" class="w-4 h-4 text-purple-600"></i>
                9. Open Educational Resources (OER)
              </span>
              <div class="p-2.5 bg-white rounded border border-purple-200 text-center text-xs">
                <span class="text-2xl font-black text-purple-700 block">${att9.oer?.count || 0}</span>
                <span class="text-[10px] text-slate-500 uppercase font-semibold">CC-BY Repositories Published</span>
              </div>
              <p class="text-xs text-slate-600 bg-white p-2 rounded border border-purple-200">
                ${att9.oer?.details || 'Open-access learning modules and course packs.'}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ATTRIBUTE III: INFRASTRUCTURE & LIBRARY
  // ==========================================
  renderAttributeIIISection(att3) {
    const isExpanded = this.isSectionExpanded('att3');
    if (!att3) att3 = {};
    const facilities = att3.researchFacility || [];
    const library = att3.departmentLibrary || {};
    const totalEquipmentAmount = facilities.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const amountLakhs = (totalEquipmentAmount / 100000).toFixed(2);

    return `
      <section id="attr-section-att3" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-24">
        <!-- Section Header -->
        <div class="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-cyan-600 text-white rounded-xl shadow-sm">
              <i data-lucide="server" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 border border-cyan-200">Attribute III</span>
                <h3 class="text-base font-bold text-slate-800">Infrastructure & Learning Resources</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Research laboratories, specialized equipment purchased, and departmental library footfalls.</p>
            </div>
          </div>
          <button id="detail-btn-att3" type="button" onclick="dashboardRenderer.toggleSection('att3')" class="px-3.5 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-center ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
            <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
            <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
          </button>
        </div>

        <!-- Count-First Grid -->
        <div class="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase block">Lab Equipment Purchased</span>
            <div class="text-xl font-black text-cyan-700 mt-0.5">${facilities.length} Units</div>
            <span class="text-[10px] text-slate-400">Total ₹ ${amountLakhs} Lakhs</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase block">Library Volumes</span>
            <div class="text-xl font-black text-blue-700 mt-0.5">${(library.totalBooks || 0) + (library.booksPurchased || 0)}</div>
            <span class="text-[10px] text-slate-400">${library.booksPurchased || 0} purchased in 2026-27</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase block">Subscribed Journals</span>
            <div class="text-xl font-black text-indigo-700 mt-0.5">${library.totalJournals || 0}</div>
            <span class="text-[10px] text-slate-400">${library.journalsPurchased || 0} added this year</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase block">Daily Library Footfall</span>
            <div class="text-xl font-black text-emerald-700 mt-0.5">${(library.facultyVisitsPerDay || 0) + (library.studentVisitsPerDay || 0)}</div>
            <span class="text-[10px] text-slate-400">Faculty: ${library.facultyVisitsPerDay || 0} | Students: ${library.studentVisitsPerDay || 0}</span>
          </div>
        </div>

        <!-- Expandable Detail Container -->
        <div id="detail-container-att3" class="${isExpanded ? '' : 'hidden'} border-t border-slate-200 p-5 space-y-6 bg-slate-50/50">
          <!-- 3.1 Equipment Purchased Table -->
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="cpu" class="w-4 h-4 text-cyan-600"></i>
              3.1 Research Facility & Specialized Lab Equipment Purchased
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th class="p-2.5">S.No.</th>
                    <th class="p-2.5">Name of the Lab</th>
                    <th class="p-2.5">Equipment / Instruments Purchased</th>
                    <th class="p-2.5">Facility Type</th>
                    <th class="p-2.5">Date of Purchase</th>
                    <th class="p-2.5 text-right">Cost (₹)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  ${facilities.map((f, idx) => `
                    <tr class="hover:bg-slate-50">
                      <td class="p-2.5 font-bold">${idx + 1}</td>
                      <td class="p-2.5 font-semibold text-slate-900">${f.labName || 'Research Lab'}</td>
                      <td class="p-2.5">${f.equipment || ''}</td>
                      <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${f.facilityType === 'New Facility' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">${f.facilityType || 'Existing'}</span></td>
                      <td class="p-2.5">${f.purchaseDate || ''}</td>
                      <td class="p-2.5 text-right font-black text-slate-900">₹ ${(Number(f.amount) || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3.2 Department Library Details -->
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="book-marked" class="w-4 h-4 text-blue-600"></i>
              3.2 Department Library Resources & Daily Utilization
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div class="p-3 bg-slate-50 rounded-lg">
                <span class="text-slate-500 text-[10px] block">Books in Dept Library</span>
                <span class="text-base font-black text-slate-800">${library.totalBooks || 0}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg">
                <span class="text-slate-500 text-[10px] block">New Books (2026-27)</span>
                <span class="text-base font-black text-blue-700">${library.booksPurchased || 0}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg">
                <span class="text-slate-500 text-[10px] block">Total Journals Subscribed</span>
                <span class="text-base font-black text-slate-800">${library.totalJournals || 0}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg">
                <span class="text-slate-500 text-[10px] block">Average Daily Visitors</span>
                <span class="text-base font-black text-emerald-700">${(library.facultyVisitsPerDay || 0) + (library.studentVisitsPerDay || 0)} per day</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================
  // ATTRIBUTE X: INSTITUTIONAL VALUES & GREEN INITIATIVES
  // ==========================================
  renderAttributeXSection(att10) {
    const isExpanded = this.isSectionExpanded('att10');
    if (!att10) att10 = {};
    const csr = att10.csrExtension || [];
    const green = att10.greenInitiatives || {};
    const totalBeneficiaries = csr.reduce((sum, item) => sum + (Number(item.beneficiaries) || 0), 0);
    const totalCsrFunding = csr.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return `
      <section id="attr-section-att10" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-24">
        <!-- Section Header -->
        <div class="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
              <i data-lucide="leaf" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">Attribute X</span>
                <h3 class="text-base font-bold text-slate-800">Institutional Values, Green Initiatives & CSR Extension</h3>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Corporate Social Responsibility (CSR) collaborative projects, paperless audits, and green campus outcomes.</p>
            </div>
          </div>
          <button id="detail-btn-att10" type="button" onclick="dashboardRenderer.toggleSection('att10')" class="px-3.5 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-center ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
            <i data-lucide="${isExpanded ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
            <span>${isExpanded ? 'Hide Details' : 'View Details'}</span>
          </button>
        </div>

        <!-- Count-First Grid -->
        <div class="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase block">CSR & Extension Drives</span>
            <div class="text-xl font-black text-emerald-700 mt-0.5">${csr.length} Programmes</div>
            <span class="text-[10px] text-slate-400">₹ ${(totalCsrFunding / 100000).toFixed(2)}L mobilized</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase block">Community Beneficiaries</span>
            <div class="text-xl font-black text-blue-700 mt-0.5">${totalBeneficiaries} Citizens</div>
            <span class="text-[10px] text-slate-400">Rural & outreach impact</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase block">Paperless Internal CIA</span>
            <div class="text-xl font-black text-purple-700 mt-0.5">100% Digital</div>
            <span class="text-[10px] text-slate-400">Moodle LMS evaluation</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase block">Green Campus Compliance</span>
            <div class="text-xl font-black text-amber-600 mt-0.5">Active</div>
            <span class="text-[10px] text-slate-400">Solar, Rainwater & Plastic-Free</span>
          </div>
        </div>

        <!-- Expandable Detail Container -->
        <div id="detail-container-att10" class="${isExpanded ? '' : 'hidden'} border-t border-slate-200 p-5 space-y-6 bg-slate-50/50">
          <!-- 10.1 CSR Table -->
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="heart-handshake" class="w-4 h-4 text-emerald-600"></i>
              10.1 Collaboration with Industries & NGOs under CSR Activities
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th class="p-2.5">S.No.</th>
                    <th class="p-2.5">Name & Nature of the Activity</th>
                    <th class="p-2.5">Sector Type</th>
                    <th class="p-2.5">Collaborating Agency</th>
                    <th class="p-2.5 text-center">Part of CSR</th>
                    <th class="p-2.5 text-center">Beneficiaries</th>
                    <th class="p-2.5 text-right">Support (₹)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  ${csr.map((c, idx) => `
                    <tr class="hover:bg-slate-50">
                      <td class="p-2.5 font-bold">${idx + 1}</td>
                      <td class="p-2.5 font-semibold text-slate-900">${c.activityName || ''}</td>
                      <td class="p-2.5">${c.type || 'Industry'}</td>
                      <td class="p-2.5">${c.agency || ''}</td>
                      <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.isCsr === 'YES' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">${c.isCsr || 'YES'}</span></td>
                      <td class="p-2.5 text-center font-bold">${c.beneficiaries || 0}</td>
                      <td class="p-2.5 text-right font-black text-slate-900">₹ ${(Number(c.amount) || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 10.2 Green Campus & Sustainability Details -->
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
              10.2 Sustainability Practices & Green Initiatives
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-slate-50 rounded-lg space-y-1">
                <strong class="text-slate-800 font-bold block">Paperless Examinations & CIA:</strong>
                <p class="text-slate-600">${green.paperlessCIA || 'Continuous Internal Assessment conducted 100% digitally through college LMS.'}</p>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg space-y-1">
                <strong class="text-slate-800 font-bold block">Solar Energy & Power Conservation:</strong>
                <p class="text-slate-600">${green.solarEnergyUsage || 'Department laboratories linked to college solar rooftop grid array.'}</p>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg space-y-1">
                <strong class="text-slate-800 font-bold block">Plastic-Free Protocol:</strong>
                <p class="text-slate-600">${green.plasticFreeCampus || 'Single-use plastic banned across staff rooms and student laboratory premises.'}</p>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg space-y-1">
                <strong class="text-slate-800 font-bold block">Rainwater Harvesting:</strong>
                <p class="text-slate-600">${green.rainWaterHarvesting || 'Integrated groundwater recharge sumps functional in departmental quadrangle.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  initCharts(data) {
    if (!window.Chart) {
      console.warn('Chart.js not loaded yet');
      return;
    }

    const att1 = data.attributeI || {};
    const att2 = data.attributeII || {};
    const att4_7 = data.attributeIV_VII || {};
    const att9 = data.attributeIX || {};

    // 1. Research Chart
    const ctxResearch = document.getElementById('researchChart');
    if (ctxResearch) {
      const scopus = att9.papersPublished?.scopus || 0;
      const wos = att9.papersPublished?.wos || 0;
      const ugc = att9.papersPublished?.ugcCare || 0;
      const confIndexed = att9.conferencesPresented?.indexed || 0;
      const confNon = att9.conferencesPresented?.nonIndexed || 0;
      const books = (att9.books?.published || 0) + (att9.books?.edited || 0) + (att9.books?.chaptersContributed || 0);

      this.chartInstances['research'] = new Chart(ctxResearch, {
        type: 'bar',
        data: {
          labels: ['Scopus', 'WoS', 'UGC-CARE', 'Conf (Indexed)', 'Conf (Other)', 'Books & Chapters'],
          datasets: [{
            label: 'Publications Count',
            data: [scopus, wos, ugc, confIndexed, confNon, books],
            backgroundColor: [
              'rgba(37, 99, 235, 0.85)',
              'rgba(79, 70, 229, 0.85)',
              'rgba(59, 130, 246, 0.85)',
              'rgba(147, 51, 234, 0.85)',
              'rgba(192, 132, 252, 0.85)',
              'rgba(245, 158, 11, 0.85)'
            ],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Output: ${ctx.parsed.y} papers/works`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
    }

    // 2. Funds Chart (in Lakhs)
    const ctxFunds = document.getElementById('fundsChart');
    if (ctxFunds) {
      const extGrants = (att4_7.externalFunds || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0) / 100000;
      const mgmtGrants = (att4_7.managementFunds || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0) / 100000;
      const seedMoney = ((Number(att4_7.seedMoney?.totalSanctioned) || 
                         (Number(att4_7.seedMoney?.projectsAmount || 0) + Number(att4_7.seedMoney?.patentsAmount || 0) + Number(att4_7.seedMoney?.copyrightAmount || 0))) / 100000);

      this.chartInstances['funds'] = new Chart(ctxFunds, {
        type: 'doughnut',
        data: {
          labels: ['External Agencies (DST/AICTE/SERB)', 'Management Grants', 'Seed Money (Projects/IPR)'],
          datasets: [{
            data: [parseFloat(extGrants.toFixed(2)), parseFloat(mgmtGrants.toFixed(2)), parseFloat(seedMoney.toFixed(2))],
            backgroundColor: [
              'rgba(5, 150, 105, 0.85)',
              'rgba(37, 99, 235, 0.85)',
              'rgba(245, 158, 11, 0.85)'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ₹ ${ctx.parsed} Lakhs`
              }
            }
          },
          cutout: '60%'
        }
      });
    }

    // 3. MOOC Chart
    const ctxMooc = document.getElementById('moocChart');
    if (ctxMooc) {
      const ugC1Reg = att1.moocs?.ug?.cycle1_registered || 0;
      const ugC1Comp = att1.moocs?.ug?.cycle1_completed || 0;
      const ugC2Reg = att1.moocs?.ug?.cycle2_registered || 0;
      const ugC2Comp = att1.moocs?.ug?.cycle2_completed || 0;

      const pgC1Reg = att1.moocs?.pg?.cycle1_registered || 0;
      const pgC1Comp = att1.moocs?.pg?.cycle1_completed || 0;
      const pgC2Reg = att1.moocs?.pg?.cycle2_registered || 0;
      const pgC2Comp = att1.moocs?.pg?.cycle2_completed || 0;

      this.chartInstances['mooc'] = new Chart(ctxMooc, {
        type: 'bar',
        data: {
          labels: ['UG Cycle I', 'UG Cycle II', 'PG Cycle I', 'PG Cycle II'],
          datasets: [
            {
              label: 'Registered',
              data: [ugC1Reg, ugC2Reg, pgC1Reg, pgC2Reg],
              backgroundColor: 'rgba(148, 163, 184, 0.7)',
              borderRadius: 5
            },
            {
              label: 'Completed',
              data: [ugC1Comp, ugC2Comp, pgC1Comp, pgC2Comp],
              backgroundColor: 'rgba(16, 185, 129, 0.85)',
              borderRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // 4. Faculty Outreach Radar
    const ctxFaculty = document.getElementById('facultyOutreachChart');
    if (ctxFaculty) {
      const rpInt = att2.resourcePerson?.international || 0;
      const rpNat = att2.resourcePerson?.national || 0;
      const rpState = att2.resourcePerson?.state || 0;
      const rpReg = att2.resourcePerson?.regional || 0;
      const rpInst = att2.resourcePerson?.institutional || 0;

      this.chartInstances['faculty'] = new Chart(ctxFaculty, {
        type: 'radar',
        data: {
          labels: ['International', 'National', 'State', 'Regional', 'Institutional'],
          datasets: [{
            label: 'Resource Person Engagements',
            data: [rpInt, rpNat, rpState, rpReg, rpInst],
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            borderColor: 'rgba(99, 102, 241, 1)',
            pointBackgroundColor: 'rgba(79, 70, 229, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(79, 70, 229, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            r: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
    }
  }
}

window.DashboardRenderer = DashboardRenderer;
