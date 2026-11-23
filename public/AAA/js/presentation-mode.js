// IQAC AAA 2026-2027 - 60-Minute Presentation Slide Deck & Timer Controller

class PresentationMode {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentSlide = 0;
    this.totalSlides = 17;

    // Timer state
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.isTimerRunning = false;
    this.currentPhase = 1; // 1: First 15m, 2: 30m, 3: Last 15m

    this.phaseDurations = {
      1: 15 * 60, // 15 mins = 900s
      2: 30 * 60, // 30 mins = 1800s
      3: 15 * 60  // 15 mins = 900s
    };

    this.bindKeyboard();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Only process when presentation tab is active and not typing in an input
      const presTab = document.getElementById('view-presentation');
      if (!presTab || presTab.classList.contains('hidden')) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });
  }

  render(data, initialSlideIndex = null) {
    if (!this.container || !data) return;

    const activeSlides = this.getActiveSlides(data);
    this.totalSlides = activeSlides.length;

    if (initialSlideIndex !== null && typeof initialSlideIndex === 'number') {
      this.currentSlide = Math.min(Math.max(initialSlideIndex, 0), this.totalSlides - 1);
    } else if (this.currentSlide >= this.totalSlides) {
      this.currentSlide = Math.max(0, this.totalSlides - 1);
    }

    // Auto sync timer phase with slide
    if (this.currentSlide <= 5) {
      this.currentPhase = 1; // First 15 min Dashboard
    } else if (this.currentSlide >= 6 && this.currentSlide <= 15) {
      this.currentPhase = 2; // 30 min Deep Dive
    } else {
      this.currentPhase = 3; // Last 15 min Panel
    }

    this.container.innerHTML = `
      <div id="presentation-deck-root" class="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 text-white min-h-[85vh] flex flex-col justify-between">
        
        <!-- Top Presentation Bar: Phase Indicator & 60-Minute Interactive Timer -->
        <div class="bg-slate-950/80 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 select-none">
          <!-- Left: Institutional Brand & Slide Title -->
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1.5">
              <i data-lucide="shield" class="w-3.5 h-3.5"></i>
              IQAC AAA 2026-2027
            </span>
            <span class="text-xs text-slate-300 font-medium hidden sm:inline">
              ${data.departmentInfo?.departmentName || 'Department Presentation'}
            </span>
          </div>

          <!-- Middle: 3 Phases Tracker -->
          <div class="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button type="button" onclick="presentationMode.setPhase(1)" class="px-2.5 py-1 rounded-lg transition ${this.currentPhase === 1 ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'}">
              1. Dashboard (15m)
            </button>
            <span class="text-slate-700">›</span>
            <button type="button" onclick="presentationMode.setPhase(2)" class="px-2.5 py-1 rounded-lg transition ${this.currentPhase === 2 ? 'bg-purple-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}">
              2. Qualitative (30m)
            </button>
            <span class="text-slate-700">›</span>
            <button type="button" onclick="presentationMode.setPhase(3)" class="px-2.5 py-1 rounded-lg transition ${this.currentPhase === 3 ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}">
              3. Panel Interaction (15m)
            </button>
          </div>

          <!-- Right: Digital Timer Controls -->
          <div class="flex items-center gap-3">
            <div id="deck-timer-display" class="font-mono text-base font-bold px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-2 text-amber-400">
              <i data-lucide="clock" class="w-4 h-4"></i>
              <span id="timer-text">${this.formatTimer(this.timerSeconds)}</span>
              <span class="text-[10px] text-slate-400 uppercase">/ ${this.formatTimer(this.phaseDurations[this.currentPhase])}</span>
            </div>

            <div class="flex items-center gap-1">
              <button type="button" onclick="presentationMode.toggleTimer()" title="Play / Pause Timer" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition">
                <i data-lucide="${this.isTimerRunning ? 'pause' : 'play'}" class="w-4 h-4"></i>
              </button>
              <button type="button" onclick="presentationMode.resetTimer()" title="Reset Timer" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition">
                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              </button>
              <button type="button" onclick="presentationMode.toggleFullscreen()" title="Fullscreen" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition hidden sm:inline-flex">
                <i data-lucide="maximize-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Slide Body -->
        <div class="flex-1 p-6 md:p-10 flex flex-col justify-center presentation-slide overflow-y-auto max-h-[calc(85vh-120px)]">
          ${this.renderCurrentSlide(data)}
        </div>

        <!-- Bottom Controller Bar -->
        <div class="bg-slate-950/80 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400 select-none">
          <div class="flex items-center gap-2">
            <span>Slide <strong>${this.currentSlide + 1}</strong> of ${this.totalSlides}</span>
            <select onchange="presentationMode.goToSlide(parseInt(this.value))" class="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs outline-none">
              ${activeSlides.map((s, i) => `
                <option value="${i}" ${this.currentSlide === i ? 'selected' : ''}>Slide ${i + 1}: ${s.title}</option>
              `).join('')}
            </select>
          </div>

          <!-- Progress dots bar -->
          <div class="hidden md:flex items-center gap-1.5">
            ${Array.from({ length: this.totalSlides }).map((_, i) => `
              <button type="button" onclick="presentationMode.goToSlide(${i})" class="h-2 rounded-full transition-all ${this.currentSlide === i ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-500'}"></button>
            `).join('')}
          </div>

          <!-- Prev / Next navigation buttons -->
          <div class="flex items-center gap-2">
            <button type="button" onclick="presentationMode.prevSlide()" ${this.currentSlide === 0 ? 'disabled' : ''} class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-slate-200 flex items-center gap-1 transition">
              <i data-lucide="chevron-left" class="w-4 h-4"></i>
              <span>Prev</span>
            </button>
            <button type="button" onclick="presentationMode.nextSlide()" ${this.currentSlide === this.totalSlides - 1 ? 'disabled' : ''} class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg font-semibold flex items-center gap-1 transition shadow">
              <span>Next</span>
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  getSlideTitle(index) {
    const titles = [
      "Executive Title & Department Identity",
      "First 15-Mins: Dashboard Overview & KPI Metrics",
      "Attribute I & V: Curriculum, MoUs & MOOC Progression",
      "Attribute II: Faculty Resources & Development",
      "Attribute 4, 7 & IX: Research, Grants & Patents",
      "Attribute VI & VIII: Extended Curricular & Student Awards",
      "Signature Achievements & Verifiable Impact (2026-2027)",
      "Uniqueness of the Department (Distinctive Identity)",
      "Status of Activities Completed (AAA 2025-2026 ATR & FOP June 2026)",
      "Institutional Best Practices (NAAC Format)",
      "SWOC Analysis Matrix",
      "Future Strategic Roadmap (1 & 3-5 Year Targets)",
      "Academic Pillar 1: PTM & Stakeholder Feedback / ATR",
      "Academic Pillar 2: Teaching-Learning (TL) Innovations & Assessment (Ass P.)",
      "Academic Pillar 3: Remedial Teaching & Student Support",
      "Academic Pillar 4: Competitive Exams & Sustainability",
      "Last 15-Mins: Expert Interaction & Evaluation Panel"
    ];
    return titles[index] || `Slide ${index + 1}`;
  }

  getActiveSlides(data) {
    const isAttrOn = (id) => window.dataStore ? window.dataStore.isAttributeEnabled(id) : true;
    const slides = [];

    // Slide 0: Executive Welcome Title (Always)
    slides.push({ id: 0, title: "Executive Title & Department Identity", render: () => this.slide0Title(data) });

    // Slide 1: 15-Mins Dashboard Overview (Always)
    slides.push({ id: 1, title: "First 15-Mins: Dashboard Overview & KPI Metrics", render: () => this.slide1DashboardSummary(data) });

    // Slide 2: Attribute I & V (Curriculum, MoUs)
    if (isAttrOn('att1') || isAttrOn('att5')) {
      slides.push({ id: 2, title: "Attribute I & V: Curriculum, MoUs & MOOC Progression", render: () => this.slide2Curriculum(data) });
    }

    // Slide 3: Attribute II (Faculty)
    if (isAttrOn('att2')) {
      slides.push({ id: 3, title: "Attribute II: Faculty Resources & Development", render: () => this.slide3Faculty(data) });
    }

    // Slide: Attribute III (Infrastructure & Learning Resources)
    if (isAttrOn('att3')) {
      slides.push({ id: 'att3', title: "Attribute III: Infrastructure & Learning Resources", render: () => this.slideAtt3Infrastructure(data) });
    }

    // Slide 4: Attribute 4, 7 & IX (Research, Grants & IPR)
    if (isAttrOn('att4_7') || isAttrOn('att9')) {
      slides.push({ id: 4, title: "Attribute 4, 7 & IX: Research, Grants & IPR", render: () => this.slide4ResearchGrants(data) });
    }

    // Slide 5: Attribute VI, VIII & Table 10 Outcomes
    if (isAttrOn('att6_8') || isAttrOn('t10_outcomes')) {
      slides.push({ id: 5, title: "Attribute VI, VIII & Outcomes: Student Progression & Placements", render: () => this.slide5StudentEngagements(data) });
    }

    // Slide 6: Signature Achievements (30-Min Qualitative)
    slides.push({ id: 6, title: "Signature Achievements & Verifiable Impact (2026-2027)", render: () => this.slide6SignatureAchievements(data) });

    // Slide 7: Uniqueness of Department
    slides.push({ id: 7, title: "Uniqueness of the Department (Distinctive Identity)", render: () => this.slide7Uniqueness(data) });

    // Slide 8: Status of Activities Completed (Table 2)
    if (isAttrOn('t2_activities')) {
      slides.push({ id: 8, title: "Status of Activities Completed (AAA 2025-2026 ATR & FOP June 2026)", render: () => this.slide8Atr2025_26(data) });
    }

    // Slide 9: Best Practices
    slides.push({ id: 9, title: "Institutional Best Practices (NAAC Format)", render: () => this.slide9BestPractices(data) });

    // Slide 10: SWOC Analysis
    slides.push({ id: 10, title: "SWOC Analysis Matrix", render: () => this.slide10Swoc(data) });

    // Slide 11: Future Strategic Roadmap
    slides.push({ id: 11, title: "Future Strategic Roadmap (1 & 3-5 Year Targets)", render: () => this.slide11FuturePlans(data) });

    // Slide 12: Academic Pillar 1 - PTM & Feedback (Attribute I)
    if (isAttrOn('att1')) {
      slides.push({ id: 12, title: "Academic Pillar 1: PTM & Stakeholder Feedback / ATR", render: () => this.slide12PtmFeedback(data) });
    }

    // Slide 13: Academic Pillar 2 - Teaching-Learning & Assessment (Attribute V)
    if (isAttrOn('att5')) {
      slides.push({ id: 13, title: "Academic Pillar 2: Teaching-Learning (TL) Innovations & Assessment", render: () => this.slide13TLandAssessment(data) });
    }

    // Slide 14: Academic Pillar 3 - Remedial Teaching & Student Support
    if (isAttrOn('att5') || isAttrOn('att4_7')) {
      slides.push({ id: 14, title: "Academic Pillar 3: Remedial Teaching & Student Support", render: () => this.slide14RemedialSupport(data) });
    }

    // Slide 15: Academic Pillar 4 - Comp Exams & Sustainability (Attributes VI, VIII & X)
    if (isAttrOn('att6_8') || isAttrOn('att10')) {
      slides.push({ id: 15, title: "Academic Pillar 4: Competitive Exams & Sustainability (Green Campus)", render: () => this.slide15CompExamsSustainability(data) });
    }

    // Slide 16: Panel Review Rubric (Always)
    slides.push({ id: 16, title: "Last 15-Mins: Expert Interaction & Evaluation Panel", render: () => this.slide16PanelInteraction(data) });

    return slides;
  }

  renderCurrentSlide(data) {
    const activeSlides = this.getActiveSlides(data);
    if (!activeSlides || activeSlides.length === 0) return this.slide0Title(data);
    const slide = activeSlides[this.currentSlide] || activeSlides[0];
    return slide.render();
  }

  // Slide 0: Executive Welcome Title
  slide0Title(data) {
    const dept = data.departmentInfo || {};
    const sch = data.scholars || { fullTime: { male: 0, female: 0, total: 0 }, partTime: { male: 0, female: 0, total: 0 }, total: { male: 0, female: 0, grandTotal: 0 } };
    const ftTotal = Number(sch.fullTime?.total) || ((Number(sch.fullTime?.male) || 0) + (Number(sch.fullTime?.female) || 0));
    const ptTotal = Number(sch.partTime?.total) || ((Number(sch.partTime?.male) || 0) + (Number(sch.partTime?.female) || 0));
    const grandTotal = Number(sch.total?.grandTotal) || (ftTotal + ptTotal);

    return `
      <div class="text-center max-w-4xl mx-auto space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
          <i data-lucide="award" class="w-4 h-4 text-blue-400"></i>
          Internal Quality Assurance Cell (IQAC)
        </div>
        
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-300">${dept.collegeName || "St. Joseph's College (Autonomous)"}</h2>
          <p class="text-xs text-slate-400 mt-1">${dept.accreditation || 'Special Heritage Status | NAAC A++'}</p>
        </div>

        <div class="py-4">
          <h1 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-amber-200 tracking-tight leading-tight">
            Annual Academic Audit (AAA)<br/>${dept.academicYear || '2026 - 2027'}
          </h1>
          <h2 class="text-xl md:text-2xl font-bold text-amber-400 mt-4">
            ${dept.departmentName || 'Department Presentation'}
          </h2>
          <p class="text-sm text-slate-300 mt-1">${dept.school || 'School of Computing Sciences'}</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-3xl mx-auto pt-4 text-left">
          <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase font-semibold block">Head of Dept</span>
            <span class="text-xs font-bold text-slate-200 truncate block">${dept.hodName || 'Dr. HOD'}</span>
          </div>
          <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase font-semibold block">Faculty Strength</span>
            <span class="text-xs font-bold text-amber-400">${dept.facultyCount || 0} Members</span>
          </div>
          <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase font-semibold block">Student Strength</span>
            <span class="text-xs font-bold text-emerald-400">${(dept.studentCountUG || 0) + (dept.studentCountPG || 0)} Enrolled</span>
          </div>
          <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase font-semibold block">Research Scholars</span>
            <span class="text-xs font-bold text-cyan-400">${grandTotal} Scholars</span>
            <span class="text-[9px] text-slate-400 block mt-0.5">FT: ${ftTotal} | PT: ${ptTotal}</span>
          </div>
          <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
            <span class="text-[10px] text-slate-400 uppercase font-semibold block">Audit Date</span>
            <span class="text-xs font-bold text-slate-200">${dept.auditDate || 'Scheduled'}</span>
          </div>
        </div>

        <div class="pt-6">
          <button type="button" onclick="presentationMode.nextSlide()" class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2">
            <span>Begin Audit Presentation</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }

  // Slide 1: 15-Mins Dashboard Overview
  slide1DashboardSummary(data) {
    const att9 = data.attributeIX || {};
    const att4_7 = data.attributeIV_VII || {};
    const att1 = data.attributeI || {};
    const extGrants = (att4_7.externalFunds || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const mgmtGrants = (att4_7.managementFunds || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const seedMoney = Number(att4_7.seedMoney?.totalSanctioned) || 0;
    const totalFundsLakhs = ((extGrants + mgmtGrants + seedMoney) / 100000).toFixed(2);

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Phase 1 • First 15 Minutes</span>
            <h2 class="text-2xl font-black text-white">Executive Departmental Dashboard</h2>
          </div>
          <span class="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
            Audit Overview
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-slate-800/90 p-4 rounded-xl border border-slate-700">
            <span class="text-[11px] text-slate-400 font-semibold uppercase">Scopus & WoS Papers</span>
            <div class="text-3xl font-black text-blue-400 mt-1">${(att9.papersPublished?.scopus || 0) + (att9.papersPublished?.wos || 0)}</div>
            <p class="text-[10px] text-slate-400 mt-1">Scopus: ${att9.papersPublished?.scopus || 0} | WoS: ${att9.papersPublished?.wos || 0}</p>
          </div>

          <div class="bg-slate-800/90 p-4 rounded-xl border border-slate-700">
            <span class="text-[11px] text-slate-400 font-semibold uppercase">Total Grants Mobilized</span>
            <div class="text-3xl font-black text-emerald-400 mt-1">₹ ${totalFundsLakhs} L</div>
            <p class="text-[10px] text-slate-400 mt-1">External: ₹ ${(extGrants/100000).toFixed(1)}L | Seed: ₹ ${(seedMoney/100000).toFixed(1)}L</p>
          </div>

          <div class="bg-slate-800/90 p-4 rounded-xl border border-slate-700">
            <span class="text-[11px] text-slate-400 font-semibold uppercase">Skill Courses (VAC & CC)</span>
            <div class="text-3xl font-black text-amber-400 mt-1">${(att1.vac || []).length + (att1.cc || []).length}</div>
            <p class="text-[10px] text-slate-400 mt-1">${(att1.vac || []).reduce((s,i)=>s+(Number(i.studentsEnrolled)||0),0) + (att1.cc || []).reduce((s,i)=>s+(Number(i.studentsEnrolled)||0),0)} students certified</p>
          </div>

          <div class="bg-slate-800/90 p-4 rounded-xl border border-slate-700">
            <span class="text-[11px] text-slate-400 font-semibold uppercase">Patents & Copyrights</span>
            <div class="text-3xl font-black text-purple-400 mt-1">${(att9.patents?.granted || 0) + (att9.patents?.applied || 0) + (att9.copyrights?.count || 0)}</div>
            <p class="text-[10px] text-slate-400 mt-1">${att9.patents?.granted || 0} Granted | ${att9.copyrights?.count || 0} Software Copyrights</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 class="font-bold text-blue-300 uppercase tracking-wider text-[11px]">Academic & Curriculum Highlights</h4>
            <p class="text-slate-300 leading-relaxed">• <strong>Indian Knowledge Systems (IKS):</strong> ${att1.iks?.seminarCount || 0} Seminars, ${att1.iks?.workshopCount || 0} Workshops (${att1.iks?.studentsBenefitted || 0} students benefitted).</p>
            <p class="text-slate-300 leading-relaxed">• <strong>Industrial & Field Visits:</strong> ${(att1.visits?.industrial||0)+(att1.visits?.educational||0)+(att1.visits?.fieldWork||0)} visits covering ${(att1.visits?.studentsParticipated||0)} students.</p>
            <p class="text-slate-300 leading-relaxed">• <strong>Four-Quadrant E-Contents:</strong> ${data.attributeV?.eContent?.count || 0} accredited modules on College LMS.</p>
          </div>

          <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 class="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">Faculty Excellence & Outreach</h4>
            <p class="text-slate-300 leading-relaxed">• <strong>Higher Qualifications:</strong> ${data.attributeII?.newDegrees?.count || 0} Ph.D./PDF degrees, ${data.attributeII?.netSetJrf?.count || 0} NET/SET qualified.</p>
            <p class="text-slate-300 leading-relaxed">• <strong>Journal Editors & Reviewers:</strong> ${(data.attributeII?.researchJournals?.reviewersCount||0)+(data.attributeII?.researchJournals?.editorsCount||0)} roles in Scopus/WoS indexed journals.</p>
            <p class="text-slate-300 leading-relaxed">• <strong>Resource Person Invites:</strong> ${(data.attributeII?.resourcePerson?.international||0)+(data.attributeII?.resourcePerson?.national||0)} at National/International forums.</p>
          </div>

          <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 class="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Student Progression & Awards</h4>
            <p class="text-slate-300 leading-relaxed">• <strong>Competitive Exams:</strong> ${data.attributeVI_VIII?.competitiveExams?.qualified || 0} students qualified (GATE, NET, UPSC, TNPSC).</p>
            <p class="text-slate-300 leading-relaxed">• <strong>Corporate Internships:</strong> ${att1.internships?.studentsInvolved || 0} students placed in high-value industrial projects.</p>
            <p class="text-slate-300 leading-relaxed">• <strong>Awards & Trophies:</strong> ${(data.attributeVI_VIII?.studentParticipationAwards?.sports||0)+(data.attributeVI_VIII?.studentParticipationAwards?.externalAcademicEvents||0)} prizes across regional & national events.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 2: Attribute I & V - Curriculum & MoUs
  slide2Curriculum(data) {
    const att1 = data.attributeI || {};
    const att5 = data.attributeV || {};
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-blue-400 uppercase tracking-widest">Attribute I & V</span>
            <h2 class="text-2xl font-black text-white">Curriculum Innovations, MoUs & MOOC Progression</h2>
          </div>
          <span class="text-xs text-slate-400">First 15-Mins Dashboard</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- VAC & CC -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="award" class="w-4 h-4"></i> Value Added (VAC) & Certificate Courses (CC)
            </h3>
            <div class="space-y-2 text-xs">
              ${(att1.vac || []).map(v => `
                <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span class="font-bold text-white block">${v.name}</span>
                    <span class="text-[10px] text-slate-400">Partner: ${v.agenciesInvolved || 'Internal'}</span>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-emerald-400">${v.studentsEnrolled} enrolled</span>
                    <span class="text-[10px] text-slate-400 block">₹ ${v.feeCollected} fee</span>
                  </div>
                </div>
              `).join('')}
              ${(att1.cc || []).map(c => `
                <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span class="font-bold text-white block">${c.name}</span>
                    <span class="text-[10px] text-slate-400">Partner: ${c.agenciesInvolved || 'Internal'}</span>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-blue-400">${c.studentsEnrolled} enrolled</span>
                    <span class="text-[10px] text-slate-400 block">₹ ${c.feeCollected} fee</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- MoUs & E-Content -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5">
              <i data-lucide="handshake" class="w-4 h-4"></i> Industry MoUs & Four-Quadrant E-Content
            </h3>
            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 text-xs space-y-1.5">
              <div class="flex justify-between font-bold text-slate-200">
                <span>New MoUs in 2026-27:</span>
                <span class="text-indigo-400">${att5.mouCreated?.count || 0} Signed</span>
              </div>
              <p class="text-slate-400 leading-relaxed text-[11px]">${att5.mouCreated?.activitiesConducted || 'Active collaborative training and certification modules.'}</p>
            </div>
            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 text-xs space-y-1.5">
              <div class="flex justify-between font-bold text-slate-200">
                <span>Four-Quadrant E-Contents:</span>
                <span class="text-amber-400">${att5.eContent?.count || 0} Modules</span>
              </div>
              <p class="text-slate-400 leading-relaxed text-[11px]">${att5.eContent?.details || 'Video, text, self-evaluation, and discussion forums implemented on LMS.'}</p>
            </div>
          </div>
        </div>

        <!-- MOOC UG/PG Table & PTM -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <h3 class="text-xs font-bold uppercase text-purple-400 mb-2 flex items-center gap-1.5">
              <i data-lucide="globe" class="w-4 h-4"></i> SWAYAM / NPTEL MOOC Completion Track Record
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
              <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 block text-[10px]">UG Cycle I</span>
                <span class="text-base font-black text-emerald-400">${att1.moocs?.ug?.cycle1_completed || 0} / ${att1.moocs?.ug?.cycle1_registered || 0}</span>
              </div>
              <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 block text-[10px]">UG Cycle II</span>
                <span class="text-base font-black text-emerald-400">${att1.moocs?.ug?.cycle2_completed || 0} / ${att1.moocs?.ug?.cycle2_registered || 0}</span>
              </div>
              <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 block text-[10px]">PG Cycle I</span>
                <span class="text-base font-black text-purple-400">${att1.moocs?.pg?.cycle1_completed || 0} / ${att1.moocs?.pg?.cycle1_registered || 0}</span>
              </div>
              <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 block text-[10px]">PG Cycle II</span>
                <span class="text-base font-black text-purple-400">${att1.moocs?.pg?.cycle2_completed || 0} / ${att1.moocs?.pg?.cycle2_registered || 0}</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
            <h3 class="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <i data-lucide="users" class="w-4 h-4"></i> Parent Teacher Meetings (PTM)
            </h3>
            <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-700/60 flex justify-between items-center text-xs">
              <div>
                <span class="text-[10px] text-slate-400 block">Meetings</span>
                <span class="text-lg font-black text-amber-400">${att1.ptm?.meetingsCount || 0}</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-slate-400 block">Parents Attended</span>
                <span class="text-lg font-black text-emerald-400">${att1.ptm?.parentsParticipated || 0}</span>
              </div>
            </div>
            <p class="text-[10px] text-slate-400 leading-tight">${att1.ptm?.details || 'Regular semester feedback and progress review sessions conducted.'}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 3: Attribute II - Faculty
  slide3Faculty(data) {
    const att2 = data.attributeII || {};
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest">Attribute II</span>
            <h2 class="text-2xl font-black text-white">Faculty Resources, Professional Recognition & FDP</h2>
          </div>
          <span class="text-xs text-slate-400">First 15-Mins Dashboard</span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div class="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase">Ph.D. / Higher Degrees</span>
            <div class="text-2xl font-black text-cyan-400 mt-1">${att2.newDegrees?.count || 0}</div>
            <p class="text-[10px] text-slate-400 mt-0.5">Faculty Awarded</p>
          </div>
          <div class="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase">NET / SET / JRF</span>
            <div class="text-2xl font-black text-blue-400 mt-1">${att2.netSetJrf?.count || 0}</div>
            <p class="text-[10px] text-slate-400 mt-0.5">National Eligibility</p>
          </div>
          <div class="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase">BoS / Academic Audit</span>
            <div class="text-2xl font-black text-emerald-400 mt-1">${(att2.recognizedBodies?.bosCount||0)+(att2.recognizedBodies?.externalAuditCount||0)}</div>
            <p class="text-[10px] text-slate-400 mt-0.5">External Roles</p>
          </div>
          <div class="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span class="text-[10px] text-slate-400 uppercase">Faculty FDPs</span>
            <div class="text-2xl font-black text-purple-400 mt-1">${(att2.fdp?.mmttc_aicte_ugc||0)+(att2.fdp?.otherInstitutions||0)+(att2.fdp?.throughFdc||0)}</div>
            <p class="text-[10px] text-slate-400 mt-0.5">Programmes Completed</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-3">
            <h4 class="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Resource Person Invites (Keynotes & Talks)</h4>
            <div class="grid grid-cols-5 gap-1.5 text-center">
              <div class="p-2 bg-slate-900 rounded border border-slate-700/60">
                <span class="text-[9px] text-slate-400 block">Intl</span>
                <span class="font-black text-amber-400">${att2.resourcePerson?.international || 0}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700/60">
                <span class="text-[9px] text-slate-400 block">Natl</span>
                <span class="font-black text-amber-400">${att2.resourcePerson?.national || 0}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700/60">
                <span class="text-[9px] text-slate-400 block">State</span>
                <span class="font-black text-amber-400">${att2.resourcePerson?.state || 0}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700/60">
                <span class="text-[9px] text-slate-400 block">Reg</span>
                <span class="font-black text-amber-400">${att2.resourcePerson?.regional || 0}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700/60">
                <span class="text-[9px] text-slate-400 block">Inst</span>
                <span class="font-black text-amber-400">${att2.resourcePerson?.institutional || 0}</span>
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed text-[11px] bg-slate-900/50 p-2.5 rounded border border-slate-700/50">
              ${att2.resourcePerson?.servedFacultyNames || 'Faculty invited across national and state institutions for keynote addresses.'}
            </p>
          </div>

          <div class="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-3">
            <h4 class="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">Industrial Immersion & International Engagement</h4>
            <div class="p-2.5 bg-slate-900/80 rounded border border-slate-700/60">
              <span class="font-bold text-slate-200 block">Industry Training:</span>
              <p class="text-slate-300 text-[11px] mt-0.5">${att2.industrialTraining?.details || 'Faculty deputed for corporate training in industry environments.'}</p>
            </div>
            <div class="p-2.5 bg-slate-900/80 rounded border border-slate-700/60">
              <span class="font-bold text-slate-200 block">Abroad Visits for Academic Purpose:</span>
              <p class="text-slate-300 text-[11px] mt-0.5">${att2.abroadVisits?.facultyNames || 'International research collaboration and conference presentations.'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide: Attribute III - Infrastructure & Learning Resources
  slideAtt3Infrastructure(data) {
    const att3 = data.attributeIII || {};
    const equipments = att3.purchasedEquipments || [];
    const library = att3.departmentLibrary || {
      booksPurchased2026_2027: 0,
      totalBooks: 0,
      nationalJournalsPurchased2026_2027: 0,
      internationalJournalsPurchased2026_2027: 0,
      totalJournals: 0,
      dailyFacultyFootfall: 0,
      dailyStudentFootfall: 0
    };

    const totalSpend = equipments.reduce((sum, e) => sum + (Number(e.amountINR) || 0), 0);

    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Attribute III</span>
            <h2 class="text-2xl font-black text-white">Infrastructure & Learning Resources</h2>
          </div>
          <span class="text-xs text-slate-400">First 15-Mins Dashboard</span>
        </div>

        <!-- Metric KPI Pills -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-indigo-950/60 border border-indigo-700/50 p-3 rounded-xl">
            <span class="text-[10px] text-indigo-300 font-bold uppercase block">Procured Equipments</span>
            <span class="text-2xl font-black text-white mt-1 block">${equipments.length}</span>
            <span class="text-[10px] text-slate-400">hardware / software units</span>
          </div>
          <div class="bg-blue-950/60 border border-blue-700/50 p-3 rounded-xl">
            <span class="text-[10px] text-blue-300 font-bold uppercase block">Equipment Investment</span>
            <span class="text-2xl font-black text-blue-300 mt-1 block">₹${(totalSpend / 100000).toFixed(2)} L</span>
            <span class="text-[10px] text-slate-400">in A.Y. 2026-2027</span>
          </div>
          <div class="bg-emerald-950/60 border border-emerald-700/50 p-3 rounded-xl">
            <span class="text-[10px] text-emerald-300 font-bold uppercase block">Dept Library Books</span>
            <span class="text-2xl font-black text-emerald-300 mt-1 block">${library.totalBooks || 0}</span>
            <span class="text-[10px] text-slate-400">+${library.booksPurchased2026_2027 || 0} new titles</span>
          </div>
          <div class="bg-purple-950/60 border border-purple-700/50 p-3 rounded-xl">
            <span class="text-[10px] text-purple-300 font-bold uppercase block">Daily Footfall</span>
            <span class="text-2xl font-black text-purple-300 mt-1 block">${(library.dailyFacultyFootfall || 0) + (library.dailyStudentFootfall || 0)}</span>
            <span class="text-[10px] text-slate-400">faculty & student visits/day</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 3.1 Lab Equipment Purchased -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5">
              <i data-lucide="hard-drive" class="w-4 h-4"></i> 3.1 Laboratory Equipment Procured in 2026-2027
            </h3>
            <div class="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
              ${equipments.length === 0 ? `
                <div class="p-3 bg-slate-900/60 rounded text-slate-400 italic text-center">No equipment purchases recorded.</div>
              ` : equipments.map(eq => `
                <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span class="font-bold text-white block">${eq.equipmentName}</span>
                    <span class="text-[10px] text-indigo-300">${eq.labName} • ${eq.type} (${eq.purchaseDate || '2026'})</span>
                  </div>
                  <span class="font-mono font-bold text-emerald-400 text-xs">₹${Number(eq.amountINR || 0).toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3.2 Department Library Learning Resources -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-purple-400 flex items-center gap-1.5">
              <i data-lucide="book-open" class="w-4 h-4"></i> 3.2 Department Library Learning Resources & Usage
            </h3>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60">
                <span class="text-[10px] text-slate-400 uppercase block">Total Books Collection</span>
                <span class="text-xl font-black text-white mt-1 block">${library.totalBooks || 0}</span>
                <span class="text-[10px] text-emerald-400">+${library.booksPurchased2026_2027 || 0} purchased this year</span>
              </div>
              <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60">
                <span class="text-[10px] text-slate-400 uppercase block">Journals Subscribed</span>
                <span class="text-xl font-black text-white mt-1 block">${library.totalJournals || 0}</span>
                <span class="text-[10px] text-purple-400">${library.nationalJournalsPurchased2026_2027 || 0} Nat'l, ${library.internationalJournalsPurchased2026_2027 || 0} Int'l</span>
              </div>
              <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 col-span-2">
                <span class="text-[10px] text-slate-400 uppercase block mb-1">Average Daily Footfall (Visits / Day)</span>
                <div class="flex items-center justify-between text-xs font-medium">
                  <span class="text-slate-300">Faculty Visits: <strong class="text-white">${library.dailyFacultyFootfall || 0}</strong></span>
                  <span class="text-slate-300">Student Visits: <strong class="text-white">${library.dailyStudentFootfall || 0}</strong></span>
                  <span class="text-purple-300 font-bold">Total: ${(library.dailyFacultyFootfall || 0) + (library.dailyStudentFootfall || 0)}/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 4: Attribute 4, 7 & IX - Research & Funding
  slide4ResearchGrants(data) {
    const att4_7 = data.attributeIV_VII || {};
    const att9 = data.attributeIX || {};
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Attribute 4, 7 & IX</span>
            <h2 class="text-2xl font-black text-white">Research Ecosystem, Grants, Patents & IPR</h2>
          </div>
          <span class="text-xs text-slate-400">First 15-Mins Dashboard</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- External & Seed Grants Table -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="indian-rupee" class="w-4 h-4"></i> Grants Received from External Agencies & Management
            </h3>
            <div class="space-y-2 text-xs">
              ${(att4_7.externalFunds || []).map(f => `
                <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span class="font-bold text-white block">${f.agency}</span>
                    <span class="text-[10px] text-slate-400">${f.category} (${f.facultyInvolved || 'Team'})</span>
                  </div>
                  <span class="font-black text-emerald-400">₹ ${(Number(f.amount)/100000).toFixed(2)} L</span>
                </div>
              `).join('')}
              <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/60 flex justify-between items-center">
                <div>
                  <span class="font-bold text-slate-200">Management Seed Grants</span>
                  <span class="text-[10px] text-slate-400">Projects, Patents & Copyrights</span>
                </div>
                <span class="font-black text-amber-400">₹ ${((Number(att4_7.seedMoney?.totalSanctioned)||325000)/100000).toFixed(2)} L</span>
              </div>
            </div>
          </div>

          <!-- Publications, Patents & Copyrights -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
              <i data-lucide="award" class="w-4 h-4"></i> Publications, Books & Intellectual Property (IPR)
            </h3>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="p-3 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 text-[10px] block">Scopus</span>
                <span class="text-xl font-black text-blue-400">${att9.papersPublished?.scopus || 0}</span>
              </div>
              <div class="p-3 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 text-[10px] block">Web of Science</span>
                <span class="text-xl font-black text-indigo-400">${att9.papersPublished?.wos || 0}</span>
              </div>
              <div class="p-3 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 text-[10px] block">Books / Chapt</span>
                <span class="text-xl font-black text-amber-400">${(att9.books?.published||0)+(att9.books?.chaptersContributed||0)}</span>
              </div>
            </div>

            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 text-xs space-y-2">
              <div class="flex justify-between font-bold text-slate-200">
                <span>Indian Patents Granted / Applied:</span>
                <span class="text-emerald-400">${att9.patents?.granted || 0} Granted (${att9.patents?.applied || 0} Applied)</span>
              </div>
              <div class="flex justify-between font-bold text-slate-200">
                <span>Registered Software Copyrights:</span>
                <span class="text-cyan-400">${att9.copyrights?.count || 0} Copyrights</span>
              </div>
              <p class="text-slate-400 text-[11px] leading-relaxed">${att9.patents?.details || 'Patents in edge computing and automated diagnostics.'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 5: Attribute VI & VIII - Extended Curricular & Students Outcomes
  slide5StudentEngagements(data) {
    const att6_8 = data.attributeVI_VIII || {};
    const outcomes = data.studentsOutcomes2026 || { ug: {}, pg: {}, phd: {} };
    const ug = outcomes.ug || {};
    const pg = outcomes.pg || {};
    const phd = outcomes.phd || {};

    const totalStrength = (Number(ug.strength) || 0) + (Number(pg.strength) || 0) + (Number(phd.strength) || 0);
    const totalPlaced = (Number(ug.onCampus) || 0) + (Number(ug.offCampus) || 0) + (Number(pg.onCampus) || 0) + (Number(pg.offCampus) || 0) + (Number(phd.onCampus) || 0) + (Number(phd.offCampus) || 0);
    const totalHigher = (Number(ug.higherStudies) || 0) + (Number(pg.higherStudies) || 0) + (Number(phd.higherStudies) || 0);

    return `
      <div class="space-y-5">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-teal-400 uppercase tracking-widest">Attribute VI, VIII & Outcomes</span>
            <h2 class="text-2xl font-black text-white">Students Outcomes (2026 Batch), Clubs & Competitive Exams</h2>
          </div>
          <span class="text-xs text-slate-400">First 15-Mins Dashboard</span>
        </div>

        <!-- Table 10: Students Outcomes – 2026 Passed out -->
        <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="graduation-cap" class="w-4 h-4"></i> Students Outcomes – 2026 Passed Out (Placement & Higher Studies)
            </h3>
            <span class="text-[11px] text-slate-300 font-semibold">
              Total Cohort: <strong>${totalStrength}</strong> | Total Placed: <strong>${totalPlaced}</strong> | Higher Studies: <strong>${totalHigher}</strong>
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-900/90 text-slate-300 text-[10px] uppercase font-bold border-b border-slate-700">
                  <th class="py-2 px-3">Programme</th>
                  <th class="py-2 px-3 text-center">Batch Strength</th>
                  <th class="py-2 px-3 text-center text-emerald-400">On Campus</th>
                  <th class="py-2 px-3 text-center text-teal-400">Off Campus</th>
                  <th class="py-2 px-3 text-center text-blue-400">Higher Studies</th>
                  <th class="py-2 px-3 text-center text-amber-400">Entrepreneur</th>
                  <th class="py-2 px-3 text-center text-slate-400">Others</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800 text-slate-200">
                <tr class="hover:bg-slate-800/50">
                  <td class="py-2 px-3 font-bold text-white">UG Programmes</td>
                  <td class="py-2 px-3 text-center font-bold">${ug.strength || 0}</td>
                  <td class="py-2 px-3 text-center text-emerald-400 font-bold">${ug.onCampus || 0}</td>
                  <td class="py-2 px-3 text-center text-teal-400 font-bold">${ug.offCampus || 0}</td>
                  <td class="py-2 px-3 text-center text-blue-400 font-bold">${ug.higherStudies || 0}</td>
                  <td class="py-2 px-3 text-center text-amber-400 font-bold">${ug.entrepreneur || 0}</td>
                  <td class="py-2 px-3 text-center text-slate-400 font-bold">${ug.others || 0}</td>
                </tr>
                <tr class="hover:bg-slate-800/50">
                  <td class="py-2 px-3 font-bold text-white">PG Programmes</td>
                  <td class="py-2 px-3 text-center font-bold">${pg.strength || 0}</td>
                  <td class="py-2 px-3 text-center text-emerald-400 font-bold">${pg.onCampus || 0}</td>
                  <td class="py-2 px-3 text-center text-teal-400 font-bold">${pg.offCampus || 0}</td>
                  <td class="py-2 px-3 text-center text-blue-400 font-bold">${pg.higherStudies || 0}</td>
                  <td class="py-2 px-3 text-center text-amber-400 font-bold">${pg.entrepreneur || 0}</td>
                  <td class="py-2 px-3 text-center text-slate-400 font-bold">${pg.others || 0}</td>
                </tr>
                <tr class="hover:bg-slate-800/50">
                  <td class="py-2 px-3 font-bold text-white">Ph.D. Scholars</td>
                  <td class="py-2 px-3 text-center font-bold">${phd.strength || 0}</td>
                  <td class="py-2 px-3 text-center text-emerald-400 font-bold">${phd.onCampus || 0}</td>
                  <td class="py-2 px-3 text-center text-teal-400 font-bold">${phd.offCampus || 0}</td>
                  <td class="py-2 px-3 text-center text-blue-400 font-bold">${phd.higherStudies || 0}</td>
                  <td class="py-2 px-3 text-center text-amber-400 font-bold">${phd.entrepreneur || 0}</td>
                  <td class="py-2 px-3 text-center text-slate-400 font-bold">${phd.others || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Active Clubs -->
          <div class="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
            <h3 class="text-xs font-bold uppercase text-teal-400 flex items-center gap-1.5">
              <i data-lucide="users-round" class="w-4 h-4"></i> Departmental Clubs & Professional Chapters
            </h3>
            <div class="space-y-2 text-xs">
              ${(att6_8.clubs || []).map(club => `
                <div class="p-2 bg-slate-900/80 rounded-lg border border-slate-700/60">
                  <div class="flex justify-between font-bold text-slate-200">
                    <span>${club.clubName}</span>
                    <span class="text-teal-400">${(Number(club.studentsUG)||0) + (Number(club.studentsPG)||0)} Members</span>
                  </div>
                  <p class="text-slate-400 text-[11px] mt-0.5">${club.activities}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Competitive Exams & Awards -->
          <div class="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
            <h3 class="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <i data-lucide="trophy" class="w-4 h-4"></i> Competitive Examinations & Student Trophies
            </h3>
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="p-2 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 text-[10px] block">Appeared</span>
                <span class="text-xl font-black text-slate-200">${att6_8.competitiveExams?.appeared || 0}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded-lg border border-slate-700">
                <span class="text-slate-400 text-[10px] block">Qualified</span>
                <span class="text-xl font-black text-emerald-400">${att6_8.competitiveExams?.qualified || 0}</span>
              </div>
            </div>
            <p class="text-slate-400 text-[11px] leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-700/50">
              ${att6_8.competitiveExams?.details || 'Students qualified in GATE, NET, TNPSC, and Banking exams.'}
            </p>
            <div class="p-2 bg-slate-900/80 rounded-lg border border-slate-700/60 text-xs">
              <span class="font-bold text-amber-300 block mb-0.5">Prizes & Championship Trophies:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${att6_8.studentParticipationAwards?.details || 'Champions in national inter-collegiate symposia.'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 6: Signature Achievements (Start of 30-Min Presentation)
  slide6SignatureAchievements(data) {
    const ach = data.qualitativePresentation?.signatureAchievements || [];
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-purple-400 uppercase tracking-widest">Phase 2 • Followed by 30 Minutes</span>
            <h2 class="text-2xl font-black text-white">Signature Achievements & Verifiable Impact (2026 - 2027)</h2>
          </div>
          <span class="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg border border-purple-500/30">
            Qualitative Impact
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${ach.map((item, idx) => `
            <div class="bg-gradient-to-br from-slate-800 to-slate-850 p-5 rounded-xl border border-slate-700 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div class="absolute -right-4 -bottom-4 text-slate-700/30 text-7xl font-black select-none pointer-events-none">
                0${idx + 1}
              </div>
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black flex items-center justify-center border border-purple-400/30">
                    ${idx + 1}
                  </span>
                  <h3 class="text-base font-bold text-white">${item.title}</h3>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed mt-2 bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                  <strong class="text-emerald-400 block mb-1">Verifiable Impact:</strong>
                  ${item.impact}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Slide 7: Uniqueness of Department
  slide7Uniqueness(data) {
    const uniq = data.qualitativePresentation?.uniqueness || '';
    return `
      <div class="space-y-6 max-w-4xl mx-auto">
        <div class="border-b border-slate-800 pb-3 text-center">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Departmental Identity</span>
          <h2 class="text-2xl font-black text-white mt-1">Uniqueness of the Department</h2>
          <p class="text-xs text-slate-400">What distinguishes our pedagogical and research ethos?</p>
        </div>

        <div class="bg-gradient-to-r from-blue-950/60 via-slate-850 to-indigo-950/60 p-8 rounded-2xl border border-blue-800/40 shadow-xl relative">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 flex-shrink-0">
              <i data-lucide="sparkles" class="w-8 h-8"></i>
            </div>
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-amber-300">Pioneering Distinctiveness & Institutional Heritage</h3>
              <p class="text-sm md:text-base text-slate-200 leading-relaxed font-light">
                ${uniq}
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-center">
            <i data-lucide="cpu" class="w-5 h-5 text-blue-400 mx-auto mb-2"></i>
            <h4 class="font-bold text-white mb-1">Industry Integration</h4>
            <p class="text-slate-400">Curriculum embedded with AWS, Red Hat, and Zoho hands-on tracks.</p>
          </div>
          <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-center">
            <i data-lucide="heart-handshake" class="w-5 h-5 text-emerald-400 mx-auto mb-2"></i>
            <h4 class="font-bold text-white mb-1">Social Outreach</h4>
            <p class="text-slate-400">SHEPHARD rural outreach bringing digital literacy to grassroots communities.</p>
          </div>
          <div class="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-center">
            <i data-lucide="book-open" class="w-5 h-5 text-purple-400 mx-auto mb-2"></i>
            <h4 class="font-bold text-white mb-1">Jesuit Pedagogy</h4>
            <p class="text-slate-400">Cura Personalis: individualized student mentoring, care, and value formation.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 8: Status of Activities Completed (AAA 2025-26 ATR & FOP June 2026)
  slide8Atr2025_26(data) {
    const act = data.statusOfActivities || {};
    const cat1 = (act.basedOnAAA2025_2026 && act.basedOnAAA2025_2026.length > 0)
      ? act.basedOnAAA2025_2026
      : (data.qualitativePresentation?.statusAAA2025_2026 || []).map(i => ({
          activity: i.recommendation || i.activity || '',
          monthYear: i.monthYear || '2025-26',
          status: i.status || 'Completed',
          remarks: i.evidence || i.remarks || ''
        }));
    const cat2 = act.basedOnFacultyOrientation2026 || [];

    const renderActivityList = (items, emptyLabel) => {
      if (!items || items.length === 0) {
        return `<div class="p-3 bg-slate-900/60 rounded-lg text-slate-400 text-xs italic text-center">${emptyLabel}</div>`;
      }
      return items.map((item, idx) => {
        const isComp = (item.status || '').toLowerCase().includes('completed') && !(item.status || '').toLowerCase().includes('not');
        return `
          <div class="bg-slate-900/80 p-3 rounded-lg border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div class="flex items-start gap-2.5 sm:w-5/12">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-700">
                ${idx + 1}
              </span>
              <div>
                <span class="font-bold text-slate-200 block text-xs">${item.activity || item.recommendation || 'Activity'}</span>
                <span class="text-[10px] text-slate-400"><i data-lucide="calendar" class="w-3 h-3 inline mr-1"></i>${item.monthYear || 'Scheduled'}</span>
              </div>
            </div>

            <div class="sm:w-2/12">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${isComp ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                <span>${isComp ? '✓' : '⏳'}</span>
                <span>${item.status || 'Completed'}</span>
              </span>
            </div>

            <div class="sm:w-5/12 bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px]">
              <span class="text-[9px] text-emerald-400 font-bold uppercase block">Remarks / Evidence:</span>
              <span class="text-slate-300">${item.remarks || item.evidence || 'Documented and verified.'}</span>
            </div>
          </div>
        `;
      }).join('');
    };

    return `
      <div class="space-y-5">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-blue-400 uppercase tracking-widest">Compliance & Strategic Execution</span>
            <h2 class="text-2xl font-black text-white">Status of Activities Completed (AAA 2025-26 ATR & FOP June 2026)</h2>
          </div>
          <span class="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30">
            Table 2 Compliant
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Category 1 -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <h3 class="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i> 1. Based on AAA 2025 – 2026 (ATR)
              </h3>
              <span class="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold">${cat1.length} Activities</span>
            </div>
            <div class="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
              ${renderActivityList(cat1, 'No AAA 2025-26 ATR activities recorded.')}
            </div>
          </div>

          <!-- Category 2 -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <h3 class="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-4 h-4"></i> 2. Faculty Orientation Programme (June 2026)
              </h3>
              <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">${cat2.length} Activities</span>
            </div>
            <div class="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
              ${renderActivityList(cat2, 'No Faculty Orientation June 2026 activities recorded.')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 9: Best Practices (NAAC Format)
  slide9BestPractices(data) {
    const bpList = data.qualitativePresentation?.bestPractices || [];
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Institutional Excellence</span>
            <h2 class="text-2xl font-black text-white">Best Practices of the Department (Institutional NAAC Format)</h2>
          </div>
          <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
            NAAC Criteria Aligned
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          ${bpList.map((bp, idx) => `
            <div class="bg-slate-800/90 p-5 rounded-xl border border-slate-700 space-y-3 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-black text-[10px]">PRACTICE ${idx + 1}</span>
                  <h3 class="text-sm font-bold text-white">${bp.title}</h3>
                </div>
                
                <div class="space-y-2 mt-3">
                  <div class="bg-slate-900/60 p-2.5 rounded border border-slate-700/50">
                    <span class="text-[10px] uppercase font-bold text-blue-400 block">Objectives:</span>
                    <p class="text-slate-300 text-[11px]">${bp.objectives}</p>
                  </div>
                  <div class="bg-slate-900/60 p-2.5 rounded border border-slate-700/50">
                    <span class="text-[10px] uppercase font-bold text-amber-400 block">The Practice:</span>
                    <p class="text-slate-300 text-[11px]">${bp.practice}</p>
                  </div>
                  <div class="bg-slate-900/60 p-2.5 rounded border border-slate-700/50">
                    <span class="text-[10px] uppercase font-bold text-emerald-400 block">Evidence of Success:</span>
                    <p class="text-slate-200 font-semibold text-[11px]">${bp.evidence}</p>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Slide 10: SWOC Analysis Matrix
  slide10Swoc(data) {
    const swoc = data.qualitativePresentation?.swoc || {};
    return `
      <div class="space-y-5">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Strategic Self-Evaluation</span>
            <h2 class="text-2xl font-black text-white">SWOC Analysis (Strengths, Weaknesses, Opportunities, Challenges)</h2>
          </div>
          <span class="text-xs text-slate-400">Institutional Strategy</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- Strengths -->
          <div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
            <h3 class="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="shield-check" class="w-4 h-4"></i> Strengths (S)
            </h3>
            <ul class="space-y-1.5 text-slate-300">
              ${(swoc.strengths || []).map(s => `<li class="flex items-start gap-1.5"><span class="text-emerald-400 font-bold">✓</span><span>${s}</span></li>`).join('')}
            </ul>
          </div>

          <!-- Weaknesses -->
          <div class="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
            <h3 class="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <i data-lucide="alert-triangle" class="w-4 h-4"></i> Weaknesses (W)
            </h3>
            <ul class="space-y-1.5 text-slate-300">
              ${(swoc.weaknesses || []).map(w => `<li class="flex items-start gap-1.5"><span class="text-amber-400 font-bold">•</span><span>${w}</span></li>`).join('')}
            </ul>
          </div>

          <!-- Opportunities -->
          <div class="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 space-y-2">
            <h3 class="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
              <i data-lucide="trending-up" class="w-4 h-4"></i> Opportunities (O)
            </h3>
            <ul class="space-y-1.5 text-slate-300">
              ${(swoc.opportunities || []).map(o => `<li class="flex items-start gap-1.5"><span class="text-blue-400 font-bold">↗</span><span>${o}</span></li>`).join('')}
            </ul>
          </div>

          <!-- Challenges -->
          <div class="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
            <h3 class="text-xs font-bold uppercase text-rose-400 flex items-center gap-1.5">
              <i data-lucide="target" class="w-4 h-4"></i> Challenges (C)
            </h3>
            <ul class="space-y-1.5 text-slate-300">
              ${(swoc.challenges || []).map(c => `<li class="flex items-start gap-1.5"><span class="text-rose-400 font-bold">!</span><span>${c}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 11: Future Plans
  slide11FuturePlans(data) {
    const plans = data.qualitativePresentation?.futurePlans || {};
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest">Strategic Vision</span>
            <h2 class="text-2xl font-black text-white">Future Strategic Roadmap (1 & 3-5 Year Horizons)</h2>
          </div>
          <span class="text-xs text-slate-400">Institutional Growth</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <!-- Short-Term -->
          <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
            <div class="flex items-center gap-2 border-b border-slate-700 pb-2">
              <span class="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <i data-lucide="calendar" class="w-4 h-4"></i>
              </span>
              <div>
                <h3 class="text-sm font-bold text-white">Short-Term Plans (Next 1 Year: 2027 - 2028)</h3>
                <span class="text-[10px] text-slate-400">Immediate Actionable Milestones</span>
              </div>
            </div>
            <ul class="space-y-2.5 pt-2">
              ${(plans.shortTerm || []).map(p => `
                <li class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 flex items-start gap-2">
                  <span class="text-blue-400 font-bold mt-0.5">●</span>
                  <span class="text-slate-200 leading-relaxed">${p}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Long-Term -->
          <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
            <div class="flex items-center gap-2 border-b border-slate-700 pb-2">
              <span class="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                <i data-lucide="compass" class="w-4 h-4"></i>
              </span>
              <div>
                <h3 class="text-sm font-bold text-white">Long-Term Plans (3 to 5 Year Horizon)</h3>
                <span class="text-[10px] text-slate-400">Transformative Institutional Goals</span>
              </div>
            </div>
            <ul class="space-y-2.5 pt-2">
              ${(plans.longTerm || []).map(p => `
                <li class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 flex items-start gap-2">
                  <span class="text-purple-400 font-bold mt-0.5">◆</span>
                  <span class="text-slate-200 leading-relaxed">${p}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 12: Academic Pillar 1 - PTM & Feedback / ATR
  slide12PtmFeedback(data) {
    const pillars = data.qualitativePresentation?.pillars || {};
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-blue-400 uppercase tracking-widest">Quality Pillar 1</span>
            <h2 class="text-2xl font-black text-white">Parent-Teacher Meetings (PTM) & Stakeholder Feedback / ATR</h2>
          </div>
          <span class="text-xs text-slate-400">Governance & Stakeholders</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- PTM -->
          <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
              <i data-lucide="users" class="w-4 h-4"></i> Parent-Teacher Meetings (PTM)
            </h3>
            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="p-2.5 bg-slate-900 rounded border border-slate-700">
                <span class="text-[10px] text-slate-400 block">Meetings Held</span>
                <span class="text-xl font-black text-white">${pillars.ptm?.meetingsConducted || 0}</span>
              </div>
              <div class="p-2.5 bg-slate-900 rounded border border-slate-700">
                <span class="text-[10px] text-slate-400 block">Parent Attendance</span>
                <span class="text-xl font-black text-emerald-400">${pillars.ptm?.parentAttendancePercentage || 0}%</span>
              </div>
            </div>
            <div class="p-3 bg-slate-900/80 rounded border border-slate-700/60 space-y-1.5">
              <span class="text-amber-300 font-bold block text-[11px]">Key Parent Feedback:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.ptm?.keyFeedback || 'Positive feedback on mentoring and academic rigor.'}</p>
            </div>
            <div class="p-3 bg-slate-900/80 rounded border border-slate-700/60 space-y-1.5">
              <span class="text-emerald-300 font-bold block text-[11px]">Action Taken by Department:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.ptm?.actionTaken || 'Implemented specific aptitude and career classes.'}</p>
            </div>
          </div>

          <!-- Stakeholder Feedback -->
          <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="star" class="w-4 h-4"></i> Stakeholder Satisfaction Index (out of 5.0)
            </h3>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div class="p-2 bg-slate-900 rounded border border-slate-700">
                <span class="text-[10px] text-slate-400 block">Students</span>
                <span class="text-lg font-black text-blue-400">${pillars.feedback?.studentRating || 0}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700">
                <span class="text-[10px] text-slate-400 block">Parents</span>
                <span class="text-lg font-black text-blue-400">${pillars.feedback?.parentRating || 0}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700">
                <span class="text-[10px] text-slate-400 block">Alumni</span>
                <span class="text-lg font-black text-blue-400">${pillars.feedback?.alumniRating || 0}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700">
                <span class="text-[10px] text-slate-400 block">Employers</span>
                <span class="text-lg font-black text-blue-400">${pillars.feedback?.employerRating || 0}</span>
              </div>
            </div>
            <div class="p-3 bg-slate-900/80 rounded border border-slate-700/60 space-y-1.5">
              <span class="text-emerald-400 font-bold block text-[11px]">Action Taken Report (ATR) on Stakeholder Feedback:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.feedback?.actionTakenReport || 'Curriculum modified based on employer and alumni inputs.'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 13: Academic Pillar 2 - TL Innovations & Assessment (Ass P.)
  slide13TLandAssessment(data) {
    const pillars = data.qualitativePresentation?.pillars || {};
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Quality Pillar 2</span>
            <h2 class="text-2xl font-black text-white">Teaching-Learning (TL) Innovations & Assessment Process (Ass P.)</h2>
          </div>
          <span class="text-xs text-slate-400">Pedagogical Reforms</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- TL Innovations -->
          <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-purple-400 flex items-center gap-1.5">
              <i data-lucide="book" class="w-4 h-4"></i> Teaching-Learning (TL) Innovations
            </h3>
            <div class="p-3.5 bg-slate-900/80 rounded-lg border border-slate-700/60 space-y-1.5">
              <span class="text-slate-200 font-bold block text-[11px]">Modern Pedagogical Techniques:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.teachingLearning?.innovations || 'Flipped classrooms and gamified problem-solving modules.'}</p>
            </div>
            <div class="p-3.5 bg-slate-900/80 rounded-lg border border-slate-700/60 space-y-1.5">
              <span class="text-indigo-300 font-bold block text-[11px]">ICT Tools & Platforms:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.teachingLearning?.ictToolsUsed || 'Moodle LMS, Google Suite, Overleaf.'}</p>
            </div>
          </div>

          <!-- Assessment Process -->
          <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5">
              <i data-lucide="check-circle" class="w-4 h-4"></i> Assessment Process & CIA Reforms (Ass P.)
            </h3>
            <div class="p-3.5 bg-slate-900/80 rounded-lg border border-slate-700/60 space-y-2">
              <span class="text-amber-300 font-bold block text-[11px]">Bloom's Taxonomy Mapping & Scrutiny:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.assessmentProcess?.reforms || 'CIA examination papers scrutinized against Bloom taxonomy levels K1-K6.'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 14: Academic Pillar 3 - Remedial Teaching & Student Support
  slide14RemedialSupport(data) {
    const pillars = data.qualitativePresentation?.pillars || {};
    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Quality Pillar 3</span>
            <h2 class="text-2xl font-black text-white">Remedial Teaching & Student Support & Development</h2>
          </div>
          <span class="text-xs text-slate-400">Student Formation</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- Remedial -->
          <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <i data-lucide="life-buoy" class="w-4 h-4"></i> Remedial Teaching (Slow / Advanced Learners)
            </h3>
            <div class="p-3.5 bg-slate-900/80 rounded-lg border border-slate-700/60 space-y-1.5">
              <span class="text-slate-200 font-bold block text-[11px]">Diagnostic Strategy & Peer Mentoring:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.remedialTeaching?.strategy || 'Entry level diagnostic tests and peer-assisted learning.'}</p>
            </div>
            <div class="p-3.5 bg-slate-900/80 rounded-lg border border-slate-700/60 space-y-1.5">
              <span class="text-emerald-400 font-bold block text-[11px]">Measurable Pass % Improvement:</span>
              <p class="text-slate-200 font-semibold text-[11px] leading-relaxed">${pillars.remedialTeaching?.impact || 'End-semester pass rates improved significantly.'}</p>
            </div>
          </div>

          <!-- Student Support -->
          <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-rose-400 flex items-center gap-1.5">
              <i data-lucide="heart" class="w-4 h-4"></i> Student Support & Development
            </h3>
            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 flex items-center justify-between">
              <span class="text-slate-300 font-bold">Faculty Mentoring Ratio:</span>
              <span class="text-amber-400 font-black text-sm">${pillars.studentSupport?.mentoringRatio || '1:20'}</span>
            </div>
            <div class="p-3.5 bg-slate-900/80 rounded-lg border border-slate-700/60 space-y-1.5">
              <span class="text-rose-300 font-bold block text-[11px]">Scholarships, Counseling & Welfare Measures:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.studentSupport?.supportMeasures || 'Management scholarships, personal counseling, career guidance.'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 15: Academic Pillar 4 - Comp Exams & Sustainability
  slide15CompExamsSustainability(data) {
    const pillars = data.qualitativePresentation?.pillars || {};
    const att10 = data.attributeX || {};
    const csrList = att10.csrActivities || [];
    const sust = att10.sustainability || {};

    const totalBeneficiaries = csrList.reduce((sum, c) => sum + (Number(c.studentsBenefited) || 0), 0);
    const totalCsrFunds = csrList.reduce((sum, c) => sum + (Number(c.amountINR) || 0), 0);

    return `
      <div class="space-y-6">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-teal-400 uppercase tracking-widest">Quality Pillar 4 & Attribute X</span>
            <h2 class="text-2xl font-black text-white">Guidance for Competitive Exams, CSR & Environmental Sustainability</h2>
          </div>
          <span class="text-xs text-slate-400">Followed by 30-Min Presentation</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- 1. Guidance for Competitive Exams -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-teal-400 flex items-center gap-1.5">
              <i data-lucide="target" class="w-4 h-4"></i> Competitive Exams Coaching
            </h3>
            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 space-y-2">
              <span class="text-slate-200 font-bold block text-[11px]">GATE, NET/SET, UPSC & TNPSC:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${pillars.guidanceCompExam?.initiatives || 'Weekend intensive problem-solving sessions, test series, and mentorship.'}</p>
            </div>
            <div class="p-2.5 bg-teal-950/40 rounded border border-teal-800/50 flex items-center justify-between text-[11px]">
              <span class="text-slate-300">Coached Students:</span>
              <span class="font-bold text-teal-300">${pillars.guidanceCompExam?.studentsBenefited || 45}+ enrolled</span>
            </div>
          </div>

          <!-- 2. Extension & CSR Collaborations (Attribute X) -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <div class="flex justify-between items-center">
              <h3 class="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <i data-lucide="heart-handshake" class="w-4 h-4"></i> Extension & CSR Projects
              </h3>
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-bold">${csrList.length}</span>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              ${csrList.length === 0 ? `
                <div class="p-2.5 bg-slate-900/60 rounded text-slate-400 italic">No CSR activities recorded.</div>
              ` : csrList.map(c => `
                <div class="p-2 bg-slate-900/80 rounded border border-slate-700/60">
                  <span class="font-bold text-white block text-[11px]">${c.activityName}</span>
                  <div class="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>${c.collaboratingAgency}</span>
                    <span class="text-emerald-400 font-medium">${c.studentsBenefited || 0} benefited</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="p-2.5 bg-emerald-950/40 rounded border border-emerald-800/50 flex items-center justify-between text-[11px]">
              <span class="text-slate-300">CSR Funds Mobilized:</span>
              <span class="font-bold text-emerald-300">₹${(totalCsrFunds / 100000).toFixed(2)} Lakhs</span>
            </div>
          </div>

          <!-- 3. Environmental Sustainability Dimensions -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
            <h3 class="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <i data-lucide="leaf" class="w-4 h-4"></i> Green Campus Initiatives
            </h3>
            <div class="space-y-1.5 text-[11px]">
              <div class="p-2 bg-slate-900/80 rounded border border-slate-700/60">
                <span class="text-blue-300 font-bold block text-[10px]">1. Paperless CIA Assessments</span>
                <span class="text-slate-300 text-[10px]">${sust.paperlessCIA || '100% digital submissions via LMS'}</span>
              </div>
              <div class="p-2 bg-slate-900/80 rounded border border-slate-700/60">
                <span class="text-amber-300 font-bold block text-[10px]">2. Solar Energy Grid Usage</span>
                <span class="text-slate-300 text-[10px]">${sust.solarEnergyUsage || 'Rooftop solar grid coverage'}</span>
              </div>
              <div class="p-2 bg-slate-900/80 rounded border border-slate-700/60">
                <span class="text-emerald-300 font-bold block text-[10px]">3. Plastic-Free Campus</span>
                <span class="text-slate-300 text-[10px]">${sust.plasticFreeCampus || 'Strict single-use plastic ban'}</span>
              </div>
              <div class="p-2 bg-slate-900/80 rounded border border-slate-700/60">
                <span class="text-cyan-300 font-bold block text-[10px]">4. Rainwater Harvesting</span>
                <span class="text-slate-300 text-[10px]">${sust.rainwaterHarvesting || 'Connected to campus recharge wells'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Slide 16: Last 15-Mins Expert Interaction
  slide16PanelInteraction(data) {
    const panel = data.panelReview || {};
    return `
      <div class="space-y-6 max-w-4xl mx-auto">
        <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Phase 3 • Last 15 Minutes</span>
            <h2 class="text-2xl font-black text-white">Interaction with Administrators, IQAC, School Dean & External Expert</h2>
          </div>
          <span class="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
            Audit Review
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- Committee Panel -->
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2.5">
            <h4 class="font-bold text-slate-200 uppercase text-[11px]">Audit Evaluation Committee</h4>
            <div class="space-y-2">
              <div class="p-2 bg-slate-900 rounded border border-slate-700/50">
                <span class="text-[10px] text-slate-400 block">External Expert</span>
                <span class="font-bold text-slate-200">${panel.expertName || 'Prof. External Expert'}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700/50">
                <span class="text-[10px] text-slate-400 block">School Dean</span>
                <span class="font-bold text-slate-200">${panel.deanName || 'School Dean'}</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700/50">
                <span class="text-[10px] text-slate-400 block">IQAC Coordinator</span>
                <span class="font-bold text-slate-200">${panel.iqacCoordinator || 'Dr. IQAC Coordinator'}</span>
              </div>
            </div>
          </div>

          <!-- Overall Assigned Grade & Score -->
          <div class="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 p-5 rounded-xl border border-blue-700/60 text-center flex flex-col justify-center items-center">
            <span class="text-xs font-bold uppercase tracking-wider text-blue-200">Overall Assigned Grade</span>
            <div class="text-5xl font-black text-amber-400 my-2">${panel.overallGrade || 'A++'}</div>
            <p class="text-xs text-blue-100">Annual Academic Audit 2026 - 2027</p>
            <div class="mt-4 flex gap-2">
              <button type="button" onclick="app.showPanelTab()" class="px-3 py-1.5 bg-white text-blue-950 font-bold rounded-lg text-xs hover:bg-blue-50 transition shadow">
                View Full Scorecard Rubric
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/40 space-y-1.5">
            <h4 class="font-bold text-emerald-400 uppercase text-[11px]">Key Commendations</h4>
            <p class="text-slate-200 leading-relaxed">${panel.commendations || 'Significant strides in research, student placements, and MOOC pass rates.'}</p>
          </div>
          <div class="bg-amber-950/40 p-4 rounded-xl border border-amber-500/40 space-y-1.5">
            <h4 class="font-bold text-amber-400 uppercase text-[11px]">Key Recommendations for 2027-2028</h4>
            <p class="text-slate-200 leading-relaxed">${panel.recommendations || 'Scale up corporate consultancy and international research tie-ups.'}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Slide Navigation
  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.render(window.dataStore.data);
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.render(window.dataStore.data);
    }
  }

  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlide = index;
      this.render(window.dataStore.data);
    }
  }

  // Timer Methods
  setPhase(phaseNumber) {
    this.currentPhase = phaseNumber;
    this.timerSeconds = 0;
    if (phaseNumber === 1) this.goToSlide(1);
    else if (phaseNumber === 2) this.goToSlide(6);
    else if (phaseNumber === 3) this.goToSlide(16);
  }

  toggleTimer() {
    if (this.isTimerRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);
    this.render(window.dataStore.data);
  }

  pauseTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.render(window.dataStore.data);
  }

  resetTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.timerSeconds = 0;
    this.render(window.dataStore.data);
  }

  updateTimerDisplay() {
    const el = document.getElementById('timer-text');
    if (el) {
      el.textContent = this.formatTimer(this.timerSeconds);
      const maxSeconds = this.phaseDurations[this.currentPhase];
      const rootTimer = document.getElementById('deck-timer-display');
      if (rootTimer) {
        if (this.timerSeconds > maxSeconds) {
          rootTimer.classList.add('timer-urgent');
        } else if (this.timerSeconds >= maxSeconds - 120) {
          rootTimer.classList.remove('text-amber-400');
          rootTimer.classList.add('text-rose-400');
        }
      }
    }
  }

  formatTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  toggleFullscreen() {
    const elem = document.getElementById('presentation-deck-root');
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().catch(err => console.warn(err));
    } else {
      document.exitFullscreen?.().catch(err => console.warn(err));
    }
  }
}

window.PresentationMode = PresentationMode;
