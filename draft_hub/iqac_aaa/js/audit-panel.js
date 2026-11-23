// IQAC AAA 2026-2027 - Last 15-Minutes Committee Review & Evaluation Rubric

class AuditPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(data) {
    if (!this.container || !data) return;

    const panel = data.panelReview || {};
    const dept = data.departmentInfo || {};
    const scores = panel.scores || {
      curriculum: 5,
      faculty: 5,
      infrastructure: 5,
      resources: 4,
      learningTeaching: 5,
      extendedCurricular: 5,
      research: 5,
      valuesSustainability: 5,
      presentationQuality: 5,
      complianceAAA: 5
    };

    // Calculate weighted average (out of 100)
    // 10 criteria, max score 5 each -> 50 points total -> scale to 100
    const totalPoints = Object.values(scores).reduce((a, b) => Number(a) + Number(b), 0);
    const percentage = ((totalPoints / 50) * 100).toFixed(1);

    let calculatedGrade = 'A++';
    if (percentage >= 90) calculatedGrade = 'A++';
    else if (percentage >= 80) calculatedGrade = 'A+';
    else if (percentage >= 70) calculatedGrade = 'A';
    else if (percentage >= 60) calculatedGrade = 'B++';
    else calculatedGrade = 'B';

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Header Banner -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 uppercase">
                Last 15 Minutes
              </span>
              <span class="text-xs text-slate-500 font-medium">Panel Review & Interaction</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold uppercase">
                Full 10-Attribute Rubric
              </span>
            </div>
            <h2 class="text-xl font-bold text-slate-800">
              Audit Evaluation Panel & Rubric: ${dept.departmentName || 'Department'}
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              Recorded during official interaction with External Academic Expert, School Dean, IQAC Coordinator, and College Administrators.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center min-w-[120px]">
              <span class="text-[10px] text-blue-700 uppercase font-bold block">Composite Score</span>
              <span class="text-2xl font-black text-blue-900">${percentage}%</span>
              <span class="text-[10px] text-blue-600 block font-mono">(${totalPoints}/50 pts)</span>
            </div>
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center min-w-[120px]">
              <span class="text-[10px] text-emerald-700 uppercase font-bold block">Assigned Grade</span>
              <span class="text-2xl font-black text-emerald-800">${panel.overallGrade || calculatedGrade}</span>
              <span class="text-[10px] text-emerald-600 block">NAAC Standard</span>
            </div>
          </div>
        </div>

        <!-- 10-Criteria Scoring Rubric Grid -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-800">Criterion-Wise Scoring Rubric (1 = Needs Attention, 5 = Outstanding)</h3>
              <p class="text-xs text-slate-500">Evaluated against NAAC Autonomous benchmarks and AAA guidelines covering all 10 Attributes.</p>
            </div>
            <button type="button" onclick="auditPanel.saveRubric()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition">
              Save Evaluation
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            ${this.renderScoreRow('Attribute I: Curriculum Design & MOOCs', 'Curricular relevance, VAC/CC courses, IKS integration, industrial visits', 'curriculum', scores.curriculum, 'att1')}
            ${this.renderScoreRow('Attribute II: Faculty Resources & Excellence', 'Qualifications, NET/SET, Journal reviewers/editors, FDPs, abroad visits', 'faculty', scores.faculty, 'att2')}
            ${this.renderScoreRow('Attribute III: Infrastructure & Learning Resources', 'Laboratory equipment purchases, software licenses, library collection & daily footfall', 'infrastructure', scores.infrastructure, 'att3')}
            ${this.renderScoreRow('Attribute IV & VII: Grants & Resource Mobilization', 'External funding (DST/AICTE), management grants, seed money, endowments', 'resources', scores.resources, 'att4_7')}
            ${this.renderScoreRow('Attribute V: Teaching-Learning & MoUs', 'Active MoUs, industry linkages, 4-Quadrant e-contents created', 'learningTeaching', scores.learningTeaching, 'att5')}
            ${this.renderScoreRow('Attribute VI & VIII: Extended Curricular & Clubs', 'Student clubs, competitive exam qualification rate, sports/cultural awards', 'extendedCurricular', scores.extendedCurricular, 'att6_8')}
            ${this.renderScoreRow('Attribute IX: Research, Books & Patents', 'Scopus/WoS publications, doctoral completions, books, granted patents, OER', 'research', scores.research, 'att9')}
            ${this.renderScoreRow('Attribute X: Values, Green Initiatives & CSR', 'Extension outreach, CSR collaborations, paperless CIA, solar power, rainwater harvesting', 'valuesSustainability', scores.valuesSustainability, 'att10')}
            ${this.renderScoreRow('Presentation & Timing Compliance', 'Adherence to the 60-minute plan (15m Dashboard + 30m Deep Dive + 15m Interaction)', 'presentationQuality', scores.presentationQuality)}
            ${this.renderScoreRow('Compliance with AAA 2025-2026 ATR', 'Fulfillment of previous audit recommendations with tangible verifiable evidence', 'complianceAAA', scores.complianceAAA, 't2_activities')}
          </div>
        </div>

        <!-- Panel Feedback, Commendations & Recommendations -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Commendations -->
          <div class="bg-emerald-50/50 rounded-xl border border-emerald-200 p-5 space-y-3">
            <div class="flex items-center gap-2">
              <span class="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <i data-lucide="thumbs-up" class="w-4 h-4"></i>
              </span>
              <div>
                <h3 class="text-xs font-bold uppercase text-emerald-950">Key Commendations</h3>
                <span class="text-[10px] text-emerald-700">Noteworthy strengths highlighted by External Expert</span>
              </div>
            </div>
            <textarea id="panel-commendations" rows="5" class="w-full text-xs p-3 border border-emerald-300 rounded-lg bg-white leading-relaxed focus:ring-2 focus:ring-emerald-500">${panel.commendations || ''}</textarea>
          </div>

          <!-- Recommendations -->
          <div class="bg-amber-50/50 rounded-xl border border-amber-200 p-5 space-y-3">
            <div class="flex items-center gap-2">
              <span class="p-2 bg-amber-100 text-amber-800 rounded-lg">
                <i data-lucide="compass" class="w-4 h-4"></i>
              </span>
              <div>
                <h3 class="text-xs font-bold uppercase text-amber-950">Specific Recommendations for A.Y. 2027 - 2028</h3>
                <span class="text-[10px] text-amber-700">Action items to be submitted to IQAC</span>
              </div>
            </div>
            <textarea id="panel-recommendations" rows="5" class="w-full text-xs p-3 border border-amber-300 rounded-lg bg-white leading-relaxed focus:ring-2 focus:ring-amber-500">${panel.recommendations || ''}</textarea>
          </div>
        </div>

        <!-- Committee Member Sign-Off Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 class="text-sm font-bold text-slate-800 border-b pb-2">Audit Panel Committee Sign-off</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span class="text-[10px] text-slate-500 uppercase font-semibold block">External Academic Expert</span>
              <input type="text" id="panel-expert-name" value="${panel.expertName || ''}" class="w-full text-xs p-1.5 border rounded font-medium text-slate-800" />
              <div class="pt-6 border-t border-slate-300 text-center text-[10px] text-slate-400">Signature</div>
            </div>

            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span class="text-[10px] text-slate-500 uppercase font-semibold block">School Dean</span>
              <input type="text" id="panel-dean-name" value="${panel.deanName || ''}" class="w-full text-xs p-1.5 border rounded font-medium text-slate-800" />
              <div class="pt-6 border-t border-slate-300 text-center text-[10px] text-slate-400">Signature</div>
            </div>

            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span class="text-[10px] text-slate-500 uppercase font-semibold block">IQAC Coordinator</span>
              <input type="text" id="panel-iqac-name" value="${panel.iqacCoordinator || ''}" class="w-full text-xs p-1.5 border rounded font-medium text-slate-800" />
              <div class="pt-6 border-t border-slate-300 text-center text-[10px] text-slate-400">Signature</div>
            </div>

            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span class="text-[10px] text-slate-500 uppercase font-semibold block">Administrator / Principal</span>
              <input type="text" id="panel-admin-name" value="${panel.administratorName || ''}" class="w-full text-xs p-1.5 border rounded font-medium text-slate-800" />
              <div class="pt-6 border-t border-slate-300 text-center text-[10px] text-slate-400">Signature</div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onclick="window.print()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>Print Official Audit Summary Sheet</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderScoreRow(title, description, key, currentValue, attrKey) {
    const isAgendaOn = attrKey && window.dataStore && typeof window.dataStore.isAttributeEnabled === 'function'
      ? window.dataStore.isAttributeEnabled(attrKey)
      : true;

    let agendaBadge = '';
    if (attrKey) {
      if (isAgendaOn) {
        agendaBadge = `<span class="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-100 text-blue-700 uppercase tracking-wider">Agenda Focus</span>`;
      } else {
        agendaBadge = `<span class="ml-1 px-1.5 py-0.5 text-[9px] font-medium rounded bg-slate-200 text-slate-500 uppercase tracking-wider">Off-Agenda</span>`;
      }
    }

    return `
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 ${!isAgendaOn ? 'opacity-70 bg-slate-100/70' : ''}">
        <div class="flex-1">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-800 block">${title}</span>
            ${agendaBadge}
          </div>
          <span class="text-[11px] text-slate-500 leading-tight block mt-0.5">${description}</span>
        </div>
        <div class="flex items-center gap-1">
          ${[1, 2, 3, 4, 5].map(rating => `
            <button type="button" onclick="auditPanel.setScore('${key}', ${rating})" class="w-7 h-7 rounded text-xs font-bold transition ${currentValue === rating ? 'bg-blue-600 text-white shadow-sm' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'}">
              ${rating}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  setScore(key, val) {
    const data = window.dataStore.data;
    if (!data.panelReview) data.panelReview = {};
    if (!data.panelReview.scores) data.panelReview.scores = {};
    data.panelReview.scores[key] = val;
    window.dataStore.saveCurrentData();
    this.render(data);
  }

  saveRubric() {
    const data = window.dataStore.data;
    if (!data.panelReview) data.panelReview = {};
    
    const comm = document.getElementById('panel-commendations');
    if (comm) data.panelReview.commendations = comm.value;

    const rec = document.getElementById('panel-recommendations');
    if (rec) data.panelReview.recommendations = rec.value;

    const exp = document.getElementById('panel-expert-name');
    if (exp) data.panelReview.expertName = exp.value;

    const dean = document.getElementById('panel-dean-name');
    if (dean) data.panelReview.deanName = dean.value;

    const iqac = document.getElementById('panel-iqac-name');
    if (iqac) data.panelReview.iqacCoordinator = iqac.value;

    const adm = document.getElementById('panel-admin-name');
    if (adm) data.panelReview.administratorName = adm.value;

    window.dataStore.saveCurrentData();
    alert('Audit Evaluation successfully recorded and saved!');
    this.render(data);
  }
}

window.AuditPanel = AuditPanel;
