# -*- coding: utf-8 -*-
with open('src/app/admin/central/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. State Replacement
old_subtab_decl = "const [aaaSubTab, setAaaSubTab] = useState<'sub_control' | 'overview' | 'attribute_matrix' | 'faculty_tracker'>('sub_control');"
assert old_subtab_decl in code, "Could not find aaaSubTab declaration"

new_state_block = """const [aaaSubTab, setAaaSubTab] = useState<'sub_control' | 'overview' | 'attribute_matrix' | 'metric_builder' | 'faculty_tracker'>('sub_control');
  
  // AAA Metrics & Criteria Repository (Attributes I - X + Part A)
  const [aaaMetrics, setAaaMetrics] = useState<any[]>([
    {
      id: 'aaa_m_part_a',
      attributeId: 'part_a',
      attributeName: 'PART A - Department Profile',
      metricCode: 'PART-A',
      metricTitle: 'Department Cadre Profile, Shift Details & Student Cadre Strength',
      benchmark: '100% Departmental Verification',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Institutional Governance',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_1_1',
      attributeId: 'att1',
      attributeName: 'Attribute I - Curricular Design & Development',
      metricCode: '1.1',
      metricTitle: 'Curriculum Revision, New Courses Introduced & Outcome Based Education (OBE) Mapping',
      benchmark: '≥ 20% Syllabus Revision in Current Cycle',
      metricType: 'table',
      weightage: 10,
      naacCriterion: 'Criterion 1: Curricular Aspects',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_1_2',
      attributeId: 'att1',
      attributeName: 'Attribute I - Curricular Design & Development',
      metricCode: '1.2',
      metricTitle: 'Value-Added Courses & Certificate Courses with Industry Orientation (> 30 Contact Hours)',
      benchmark: '≥ 2 Value Added Courses per Shift',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 1: Curricular Aspects',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_1_4',
      attributeId: 'att1',
      attributeName: 'Attribute I - Curricular Design & Development',
      metricCode: '1.4',
      metricTitle: 'Industrial Visits, Educational Field Visits, Field Work & Experiential Learning',
      benchmark: '≥ 1 Field Visit per Academic Year',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 1: Curricular Aspects',
      isMandatory: false,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_1_5',
      attributeId: 'att1',
      attributeName: 'Attribute I - Curricular Design & Development',
      metricCode: '1.5',
      metricTitle: 'Student Internships, On-the-Job Training & Apprenticeship Mandate',
      benchmark: '100% Final Year Students Interned',
      metricType: 'table',
      weightage: 10,
      naacCriterion: 'Criterion 1: Curricular Aspects',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_2_1',
      attributeId: 'att2',
      attributeName: 'Attribute II - Teaching, Learning & Evaluation',
      metricCode: '2.1',
      metricTitle: 'Course Planning Adherence, Lecture Hour Log & Continuous Internal Assessment (CIA)',
      benchmark: '100% Course Plans Cleared by HOD',
      metricType: 'table',
      weightage: 15,
      naacCriterion: 'Criterion 2: Teaching-Learning & Evaluation',
      isMandatory: true,
      convertedToAppraisal: true,
      status: 'active'
    },
    {
      id: 'aaa_m_2_3',
      attributeId: 'att2',
      attributeName: 'Attribute II - Teaching, Learning & Evaluation',
      metricCode: '2.3',
      metricTitle: 'Faculty Representation as Board of Studies (BoS) Member & Academic Council Expert',
      benchmark: '≥ 2 Faculty Members Nominated',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 2: Teaching-Learning & Evaluation',
      isMandatory: false,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_2_4',
      attributeId: 'att2',
      attributeName: 'Attribute II - Teaching, Learning & Evaluation',
      metricCode: '2.4',
      metricTitle: 'ICT Pedagogical Innovations, LMS Digital Modules & Blended Learning Tools',
      benchmark: '≥ 3 ICT Methods Logged per Faculty',
      metricType: 'numeric',
      weightage: 10,
      naacCriterion: 'Criterion 2: Teaching-Learning & Evaluation',
      isMandatory: true,
      convertedToAppraisal: true,
      status: 'active'
    },
    {
      id: 'aaa_m_3_1',
      attributeId: 'att3',
      attributeName: 'Attribute III - Infrastructure & Learning Resources',
      metricCode: '3.1',
      metricTitle: 'Laboratory Modernization, High-End Equipment Purchase & ICT Smart Rooms',
      benchmark: 'Annual Equipment Maintenance & Log Book',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 4: Infrastructure & Learning Resources',
      isMandatory: false,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_4_1',
      attributeId: 'att4',
      attributeName: 'Attribute IV - Student Support & Progression',
      metricCode: '4.1',
      metricTitle: 'Competitive Exam Guidance (NET/SET/GATE/CAT/Civil Services) & Remedial Coaching',
      benchmark: '≥ 30 Students Benefitted per Year',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 5: Student Support & Progression',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_4_2',
      attributeId: 'att4',
      attributeName: 'Attribute IV - Student Support & Progression',
      metricCode: '4.2',
      metricTitle: 'Student Placement Ratio & Progression to Prestigious Higher Education',
      benchmark: '≥ 70% Eligible Students Placed',
      metricType: 'percentage',
      weightage: 10,
      naacCriterion: 'Criterion 5: Student Support & Progression',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_5_1',
      attributeId: 'att5',
      attributeName: 'Attribute V - Governance, Leadership & Management',
      metricCode: '5.1',
      metricTitle: 'Faculty Development Programs (FDP), Refresher / Orientation Courses Attended',
      benchmark: '≥ 1 FDP (min 5 Days) per Faculty/Year',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 6: Governance, Leadership & Management',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_6_1',
      attributeId: 'att6',
      attributeName: 'Attribute VI - Institutional Values & Best Practices',
      metricCode: '6.1',
      metricTitle: 'Green Campus Initiatives, Gender Sensitization & Sustainable Practices',
      benchmark: '≥ 2 Best Practices Institutionalized',
      metricType: 'narrative',
      weightage: 5,
      naacCriterion: 'Criterion 7: Institutional Values & Best Practices',
      isMandatory: false,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_7_1',
      attributeId: 'att7',
      attributeName: 'Attribute VII - Innovation, Incubation & Entrepreneurship',
      metricCode: '7.1',
      metricTitle: 'Intellectual Property Rights: Patents Published, Granted or Commercialized',
      benchmark: '≥ 1 Patent per Department',
      metricType: 'table',
      weightage: 10,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: false,
      convertedToAppraisal: true,
      status: 'active'
    },
    {
      id: 'aaa_m_7_2',
      attributeId: 'att7',
      attributeName: 'Attribute VII - Innovation, Incubation & Entrepreneurship',
      metricCode: '7.2',
      metricTitle: 'Student Startups, Incubation Projects & Innovation Hub Prototypes',
      benchmark: '≥ 1 Functional Prototype/Startup',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: false,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_8_1',
      attributeId: 'att8',
      attributeName: 'Attribute VIII - Extension Activities & Social Outreach',
      metricCode: '8.1',
      metricTitle: 'Community Service, Village Adoption & Social Outreach Programs (SHEPHERD / NSS)',
      benchmark: '≥ 2 Community Extension Camps',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    },
    {
      id: 'aaa_m_9_1',
      attributeId: 'att9',
      attributeName: 'Attribute IX - Research Publications & Intellectual Capital',
      metricCode: '9.1',
      metricTitle: 'Research Papers Published in Scopus, Web of Science & UGC-CARE Indexed Journals',
      benchmark: '≥ 2 Indexed Papers per Faculty',
      metricType: 'table',
      weightage: 15,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: true,
      convertedToAppraisal: true,
      status: 'active'
    },
    {
      id: 'aaa_m_9_2',
      attributeId: 'att9',
      attributeName: 'Attribute IX - Research Publications & Intellectual Capital',
      metricCode: '9.2',
      metricTitle: 'Extramural Funded Research Projects Sanctioned by Govt / Industry Agencies',
      benchmark: '≥ ₹1,00,000 Research Grant Outlay',
      metricType: 'currency',
      weightage: 10,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: true,
      convertedToAppraisal: true,
      status: 'active'
    },
    {
      id: 'aaa_m_9_3',
      attributeId: 'att9',
      attributeName: 'Attribute IX - Research Publications & Intellectual Capital',
      metricCode: '9.3',
      metricTitle: 'Textbooks, Authored Volumes & Edited Chapters Published with ISBN',
      benchmark: '≥ 1 ISBN Volume per Department',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: false,
      convertedToAppraisal: true,
      status: 'active'
    },
    {
      id: 'aaa_m_10_1',
      attributeId: 'att10',
      attributeName: 'Attribute X - Collaborations, Linkages & Consultancy',
      metricCode: '10.1',
      metricTitle: 'Corporate Consultancy, Technical Solutions & Knowledge Transfer Revenue',
      benchmark: '≥ ₹25,000 Revenue Generated',
      metricType: 'currency',
      weightage: 5,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: false,
      convertedToAppraisal: true,
      status: 'active'
    },
    {
      id: 'aaa_m_10_2',
      attributeId: 'att10',
      attributeName: 'Attribute X - Collaborations, Linkages & Consultancy',
      metricCode: '10.2',
      metricTitle: 'Formal MoUs & Collaborative Academic Partnerships with Active Functional Deliverables',
      benchmark: '≥ 2 Active Industry/Academic MoUs',
      metricType: 'table',
      weightage: 5,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: true,
      convertedToAppraisal: false,
      status: 'active'
    }
  ]);

  const [metricModalOpen, setMetricModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<any | null>(null);
  const [metricFilterAttribute, setMetricFilterAttribute] = useState('ALL');
  const [metricTypeFilter, setMetricTypeFilter] = useState('ALL');
  const [metricSearch, setMetricSearch] = useState('');
  const [metricToast, setMetricToast] = useState<string | null>(null);
  const [metricForm, setMetricForm] = useState({
    attributeId: 'att9',
    metricCode: '',
    metricTitle: '',
    benchmark: '',
    metricType: 'table',
    weightage: 10,
    naacCriterion: 'Criterion 3: Research, Innovations and Extension',
    isMandatory: true,
    autoConvertToAppraisal: true,
  });"""

code = code.replace(old_subtab_decl, new_state_block)

# 2. Handlers Injection
handler_anchor = "  // --- 7. Live Checklist Handlers (Matching tho-mas12/IQAC) ---"
assert handler_anchor in code, "Could not find handler_anchor"

handlers_block = """  // --- AAA Metric & Criteria Creation Desk Handlers ---
  const getAttributeNameById = (attrId: string) => {
    switch (attrId) {
      case 'part_a': return 'PART A - Department Profile';
      case 'att1': return 'Attribute I - Curricular Design & Development';
      case 'att2': return 'Attribute II - Teaching, Learning & Evaluation';
      case 'att3': return 'Attribute III - Infrastructure & Learning Resources';
      case 'att4': return 'Attribute IV - Student Support & Progression';
      case 'att5': return 'Attribute V - Governance, Leadership & Management';
      case 'att6': return 'Attribute VI - Institutional Values & Best Practices';
      case 'att7': return 'Attribute VII - Innovation, Incubation & Entrepreneurship';
      case 'att8': return 'Attribute VIII - Extension Activities & Social Outreach';
      case 'att9': return 'Attribute IX - Research Publications & Intellectual Capital';
      case 'att10': return 'Attribute X - Collaborations, Linkages & Consultancy';
      default: return 'Attribute ' + attrId;
    }
  };

  const handleOpenCreateMetricModal = (defaultAttr = 'att9') => {
    setEditingMetric(null);
    setMetricForm({
      attributeId: defaultAttr,
      metricCode: '',
      metricTitle: '',
      benchmark: '',
      metricType: 'table',
      weightage: 10,
      naacCriterion: 'Criterion 3: Research, Innovations and Extension',
      isMandatory: true,
      autoConvertToAppraisal: true,
    });
    setMetricModalOpen(true);
  };

  const handleOpenEditMetricModal = (metric: any) => {
    setEditingMetric(metric);
    setMetricForm({
      attributeId: metric.attributeId,
      metricCode: metric.metricCode,
      metricTitle: metric.metricTitle,
      benchmark: metric.benchmark,
      metricType: metric.metricType,
      weightage: metric.weightage,
      naacCriterion: metric.naacCriterion,
      isMandatory: metric.isMandatory,
      autoConvertToAppraisal: metric.convertedToAppraisal,
    });
    setMetricModalOpen(true);
  };

  const handleSaveAaaMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricForm.metricCode.trim() || !metricForm.metricTitle.trim()) return;

    if (editingMetric) {
      // Update existing
      setAaaMetrics(prev => prev.map(m => m.id === editingMetric.id ? {
        ...m,
        attributeId: metricForm.attributeId,
        attributeName: getAttributeNameById(metricForm.attributeId),
        metricCode: metricForm.metricCode.trim(),
        metricTitle: metricForm.metricTitle.trim(),
        benchmark: metricForm.benchmark.trim() || 'Required for Audit',
        metricType: metricForm.metricType,
        weightage: Number(metricForm.weightage) || 5,
        naacCriterion: metricForm.naacCriterion,
        isMandatory: metricForm.isMandatory,
        convertedToAppraisal: metricForm.autoConvertToAppraisal,
      } : m));

      // Update in appraisal criteria if converted
      if (metricForm.autoConvertToAppraisal) {
        const appraisalId = `aaa_m_${editingMetric.id}`;
        setAppraisalCriteria(prev => {
          const exists = prev.some(c => c.id === appraisalId);
          if (exists) {
            return prev.map(c => c.id === appraisalId ? {
              ...c,
              label: `${metricForm.metricCode}: ${metricForm.metricTitle}`,
              currentWeight: Number(metricForm.weightage) || 5,
              defaultWeight: Number(metricForm.weightage) || 5,
              target: metricForm.benchmark,
              enabled: true
            } : c);
          } else {
            return [...prev, {
              id: appraisalId,
              category: 'AAA Academic Audit',
              label: `${metricForm.metricCode}: ${metricForm.metricTitle}`,
              sourceModule: `AAA (${getAttributeNameById(metricForm.attributeId).split(' - ')[0]})`,
              defaultWeight: Number(metricForm.weightage) || 5,
              currentWeight: Number(metricForm.weightage) || 5,
              target: metricForm.benchmark,
              enabled: true,
              code: `AAA-${metricForm.metricCode}`
            }];
          }
        });
      }
      setMetricToast(`Metric ${metricForm.metricCode} updated successfully.`);
    } else {
      // Create new
      const newId = `aaa_m_custom_${Date.now()}`;
      const newMetric = {
        id: newId,
        attributeId: metricForm.attributeId,
        attributeName: getAttributeNameById(metricForm.attributeId),
        metricCode: metricForm.metricCode.trim(),
        metricTitle: metricForm.metricTitle.trim(),
        benchmark: metricForm.benchmark.trim() || 'Standard Academic Goal',
        metricType: metricForm.metricType,
        weightage: Number(metricForm.weightage) || 5,
        naacCriterion: metricForm.naacCriterion,
        isMandatory: metricForm.isMandatory,
        convertedToAppraisal: metricForm.autoConvertToAppraisal,
        status: 'active'
      };

      setAaaMetrics(prev => [newMetric, ...prev]);

      if (metricForm.autoConvertToAppraisal) {
        setAppraisalCriteria(prev => [...prev, {
          id: `aaa_m_${newId}`,
          category: 'AAA Academic Audit',
          label: `${newMetric.metricCode}: ${newMetric.metricTitle}`,
          sourceModule: `AAA (${getAttributeNameById(newMetric.attributeId).split(' - ')[0]})`,
          defaultWeight: newMetric.weightage,
          currentWeight: newMetric.weightage,
          target: newMetric.benchmark,
          enabled: true,
          code: `AAA-${newMetric.metricCode}`
        }]);
      }
      setMetricToast(`New AAA Metric ${newMetric.metricCode} created and integrated into system!`);
    }

    setMetricModalOpen(false);
    setTimeout(() => setMetricToast(null), 5000);
  };

  const handleDeleteAaaMetric = (id: string) => {
    const metric = aaaMetrics.find(m => m.id === id);
    if (!confirm(`Are you sure you want to delete metric ${metric?.metricCode || ''}?`)) return;

    setAaaMetrics(prev => prev.filter(m => m.id !== id));
    setAppraisalCriteria(prev => prev.filter(c => c.id !== `aaa_m_${id}`));
    setMetricToast(`Metric removed from AAA repository.`);
    setTimeout(() => setMetricToast(null), 4000);
  };

  const handleToggleMetricAppraisal = (metricId: string) => {
    const metric = aaaMetrics.find(m => m.id === metricId);
    if (!metric) return;

    const newStatus = !metric.convertedToAppraisal;
    setAaaMetrics(prev => prev.map(m => m.id === metricId ? { ...m, convertedToAppraisal: newStatus } : m));

    const appraisalId = `aaa_m_${metricId}`;
    if (newStatus) {
      setAppraisalCriteria(prev => {
        const exists = prev.some(c => c.id === appraisalId);
        if (exists) {
          return prev.map(c => c.id === appraisalId ? { ...c, enabled: true } : c);
        } else {
          return [...prev, {
            id: appraisalId,
            category: 'AAA Academic Audit',
            label: `${metric.metricCode}: ${metric.metricTitle}`,
            sourceModule: `AAA (${getAttributeNameById(metric.attributeId).split(' - ')[0]})`,
            defaultWeight: metric.weightage,
            currentWeight: metric.weightage,
            target: metric.benchmark,
            enabled: true,
            code: `AAA-${metric.metricCode}`
          }];
        }
      });
      setMetricToast(`⚡ Metric ${metric.metricCode} linked to Faculty Performance Appraisal Question Selector!`);
    } else {
      setAppraisalCriteria(prev => prev.map(c => c.id === appraisalId ? { ...c, enabled: false } : c));
      setMetricToast(`Metric ${metric.metricCode} unlinked from Appraisal Formula.`);
    }
    setTimeout(() => setMetricToast(null), 5000);
  };

""" + handler_anchor

code = code.replace(handler_anchor, handlers_block)

# 3. Add 5th Subtab Button
old_subtab_nav = """              <button
                onClick={() => setAaaSubTab('faculty_tracker')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  aaaSubTab === 'faculty_tracker'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Faculty-Wise Contribution Tracker</span>
              </button>"""

new_subtab_nav = """              <button
                onClick={() => setAaaSubTab('metric_builder')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  aaaSubTab === 'metric_builder'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>⚙️ Metric & Attribute Creation Desk</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  aaaSubTab === 'metric_builder' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  {aaaMetrics.length}
                </span>
              </button>

              <button
                onClick={() => setAaaSubTab('faculty_tracker')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  aaaSubTab === 'faculty_tracker'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Faculty-Wise Contribution Tracker</span>
              </button>"""

assert old_subtab_nav in code, "Could not find old_subtab_nav"
code = code.replace(old_subtab_nav, new_subtab_nav)

# 4. Metric Builder View
old_faculty_tracker_end = """                            <button
                              onClick={() => handleLoadAppraisal(u.staffCode || u.username)}
                              className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs transition cursor-pointer"
                            >
                              View Portfolio →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}"""

metric_builder_view = """                            <button
                              onClick={() => handleLoadAppraisal(u.staffCode || u.username)}
                              className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs transition cursor-pointer"
                            >
                              View Portfolio →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: METRIC & ATTRIBUTE CREATION DESK (AAA AUDIT & APPRAISAL CONVERTER) */}
            {aaaSubTab === 'metric_builder' && (
              <div className="space-y-6">
                {/* Metric Desk Banner */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#1877F2]">
                        AAA Criteria Architecture Desk
                      </span>
                      <span className="text-xs text-slate-400 font-bold">• Part A & Attributes I to X</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Annual Academic Audit (AAA) Metric & Question Customization
                    </h3>
                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                      Define, configure, and calibrate audit evaluation questions across all 10 NAAC Attributes. Click 
                      <span className="text-[#1877F2] font-bold"> &quot;Convert to Appraisal Question&quot; </span> 
                      to immediately link any AAA metric to the Faculty Performance Appraisal (PBAS) question bank.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    <button
                      onClick={() => handleOpenCreateMetricModal()}
                      className="px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create New AAA Metric</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('appraisal_hub');
                        setAppraisalSubTab('criteria_selector');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Open Appraisal Selector →</span>
                    </button>
                  </div>
                </div>

                {/* Live Toast Message */}
                {metricToast && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs transition animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{metricToast}</span>
                  </div>
                )}

                {/* Macro Metric Stats Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Defined Metrics</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">{aaaMetrics.length}</div>
                    <span className="text-[10px] text-blue-600 font-semibold">Active in NAAC Rubric</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mandatory Audits</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">
                      {aaaMetrics.filter(m => m.isMandatory).length}
                    </div>
                    <span className="text-[10px] text-amber-600 font-semibold">Required for Clearance</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Appraisal Bank</span>
                    <div className="text-2xl font-black text-purple-700 mt-1">
                      {aaaMetrics.filter(m => m.convertedToAppraisal).length}
                    </div>
                    <span className="text-[10px] text-purple-600 font-semibold">Linked to Faculty PBAS</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Points Pool</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {aaaMetrics.reduce((s, m) => s + Number(m.weightage || 0), 0)} pts
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Audit Weightage Pool</span>
                  </div>
                </div>

                {/* Attribute Selector Filter Bar */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Filter by NAAC Audit Attribute:
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Showing {aaaMetrics.filter(m => (metricFilterAttribute === 'ALL' || m.attributeId === metricFilterAttribute) && (metricTypeFilter === 'ALL' || m.metricType === metricTypeFilter) && (m.metricTitle.toLowerCase().includes(metricSearch.toLowerCase()) || m.metricCode.toLowerCase().includes(metricSearch.toLowerCase()))).length} metrics
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                    {[
                      { id: 'ALL', label: 'All Attributes' },
                      { id: 'part_a', label: 'Part A (Profile)' },
                      { id: 'att1', label: 'Attr I (Curriculum)' },
                      { id: 'att2', label: 'Attr II (TLE)' },
                      { id: 'att3', label: 'Attr III (Infra)' },
                      { id: 'att4', label: 'Attr IV (Student)' },
                      { id: 'att5', label: 'Attr V (Governance)' },
                      { id: 'att6', label: 'Attr VI (Values)' },
                      { id: 'att7', label: 'Attr VII (Innovation)' },
                      { id: 'att8', label: 'Attr VIII (Outreach)' },
                      { id: 'att9', label: 'Attr IX (Research)' },
                      { id: 'att10', label: 'Attr X (Linkages)' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setMetricFilterAttribute(tab.id)}
                        className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                          metricFilterAttribute === tab.id
                            ? 'bg-[#1877F2] text-white shadow-2xs font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search and Type Filter */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search metric code (e.g. 9.1), title, or keywords..."
                        value={metricSearch}
                        onChange={(e) => setMetricSearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Data Type:</span>
                      <select
                        value={metricTypeFilter}
                        onChange={(e) => setMetricTypeFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                      >
                        <option value="ALL">All Capture Types</option>
                        <option value="table">Tabular Grid / Sheet</option>
                        <option value="numeric">Numeric KPI Counter</option>
                        <option value="currency">Currency (₹ Outlay)</option>
                        <option value="percentage">Percentage Ratio</option>
                        <option value="narrative">Narrative Descriptive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Configured AAA Evaluation Questions & Criteria Bank
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Criteria mapped to NAAC Guidelines with automatic derivation for Faculty PBAS Portfolios.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenCreateMetricModal(metricFilterAttribute === 'ALL' ? 'att9' : metricFilterAttribute)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1877F2] text-xs font-bold border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Metric to this Attribute</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold text-[11px]">
                        <tr>
                          <th className="py-3 px-4 w-28">Code & NAAC</th>
                          <th className="py-3 px-4 w-52">Attribute</th>
                          <th className="py-3 px-4">Evaluation Question / Metric Title</th>
                          <th className="py-3 px-4 w-44">Target Benchmark</th>
                          <th className="py-3 px-3 text-center w-20">Type</th>
                          <th className="py-3 px-3 text-center w-20">Weight</th>
                          <th className="py-3 px-4 text-center w-48">Appraisal Conversion</th>
                          <th className="py-3 px-4 text-right w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {aaaMetrics
                          .filter(m => metricFilterAttribute === 'ALL' || m.attributeId === metricFilterAttribute)
                          .filter(m => metricTypeFilter === 'ALL' || m.metricType === metricTypeFilter)
                          .filter(m => 
                            m.metricTitle.toLowerCase().includes(metricSearch.toLowerCase()) ||
                            m.metricCode.toLowerCase().includes(metricSearch.toLowerCase()) ||
                            m.attributeName.toLowerCase().includes(metricSearch.toLowerCase())
                          )
                          .map((m) => (
                            <tr key={m.id} className="hover:bg-blue-50/30 transition">
                              <td className="py-3.5 px-4">
                                <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 block w-fit">
                                  {m.metricCode}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-1 leading-tight line-clamp-1">
                                  {m.naacCriterion}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-700">
                                <span className="text-xs">{m.attributeName}</span>
                                {m.isMandatory && (
                                  <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 block w-fit mt-1">
                                    Mandatory
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-slate-900 text-xs leading-relaxed">
                                  {m.metricTitle}
                                </p>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg text-[11px] block border border-slate-200/80 w-fit">
                                  🎯 {m.benchmark}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {m.metricType}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center font-black text-slate-800">
                                <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs">
                                  {m.weightage} pts
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {m.convertedToAppraisal ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>In Appraisal Bank</span>
                                    </span>
                                    <button
                                      onClick={() => handleToggleMetricAppraisal(m.id)}
                                      className="text-[10px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
                                    >
                                      Unlink Question
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleToggleMetricAppraisal(m.id)}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[11px] transition shadow-2xs flex items-center gap-1.5 cursor-pointer mx-auto"
                                  >
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                    <span>Convert to Appraisal</span>
                                  </button>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditMetricModal(m)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                    title="Edit Metric"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAaaMetric(m.id)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                                    title="Delete Metric"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <span>
                      Total Active Points in NAAC Audit System: <strong className="text-slate-800">{aaaMetrics.reduce((s, m) => s + Number(m.weightage || 0), 0)} Points</strong>
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('appraisal_hub');
                        setAppraisalSubTab('criteria_selector');
                      }}
                      className="font-bold text-[#1877F2] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Jump to Performance Appraisal Question Selector</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}"""

assert old_faculty_tracker_end in code, "Could not find old_faculty_tracker_end"
code = code.replace(old_faculty_tracker_end, metric_builder_view)

# 5. Add Create / Edit AAA Metric Modal
user_modal_anchor = "{/* MODAL: Create / Edit User */}"
assert user_modal_anchor in code, "Could not find user_modal_anchor"

metric_modal_code = """{/* MODAL: Create / Edit AAA Metric */}
      {metricModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#1877F2] flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  {editingMetric ? 'Edit AAA Audit Metric' : 'Create New AAA Metric & Evaluation Question'}
                </h3>
              </div>
              <button onClick={() => setMetricModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveAaaMetric} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target NAAC Attribute *</label>
                  <select
                    value={metricForm.attributeId}
                    onChange={(e) => setMetricForm({ ...metricForm, attributeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white font-semibold"
                  >
                    <option value="part_a">PART A - Profile of Dept</option>
                    <option value="att1">Attribute I - Curricular Design</option>
                    <option value="att2">Attribute II - Teaching & Learning (TLE)</option>
                    <option value="att3">Attribute III - Infrastructure</option>
                    <option value="att4">Attribute IV - Student Support</option>
                    <option value="att5">Attribute V - Governance & Management</option>
                    <option value="att6">Attribute VI - Institutional Values</option>
                    <option value="att7">Attribute VII - Innovations & Patents</option>
                    <option value="att8">Attribute VIII - Extension & Outreach</option>
                    <option value="att9">Attribute IX - Research Publications</option>
                    <option value="att10">Attribute X - Linkages & Consultancy</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Metric Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9.4, 1.12, AAA-RES-01"
                    value={metricForm.metricCode}
                    onChange={(e) => setMetricForm({ ...metricForm, metricCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Evaluation Question / Metric Title *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Number of Scopus-indexed research publications with department faculty affiliation..."
                  value={metricForm.metricTitle}
                  onChange={(e) => setMetricForm({ ...metricForm, metricTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Benchmark Target</label>
                  <input
                    type="text"
                    placeholder="e.g. ≥ 2 Papers, ≥ ₹1.0 Lakh"
                    value={metricForm.benchmark}
                    onChange={(e) => setMetricForm({ ...metricForm, benchmark: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capture Data Type</label>
                  <select
                    value={metricForm.metricType}
                    onChange={(e) => setMetricForm({ ...metricForm, metricType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="table">Tabular Grid / Sheet</option>
                    <option value="numeric">Numeric Count</option>
                    <option value="currency">Currency (₹ Outlay)</option>
                    <option value="percentage">Percentage Ratio</option>
                    <option value="proof_document">Document Proof / URL</option>
                    <option value="narrative">Narrative Descriptive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Evaluation Weightage (Points)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={metricForm.weightage}
                    onChange={(e) => setMetricForm({ ...metricForm, weightage: Number(e.target.value) || 5 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">NAAC Criterion Mapping</label>
                  <select
                    value={metricForm.naacCriterion}
                    onChange={(e) => setMetricForm({ ...metricForm, naacCriterion: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="Criterion 1: Curricular Aspects">Criterion 1: Curricular Aspects</option>
                    <option value="Criterion 2: Teaching-Learning & Evaluation">Criterion 2: Teaching-Learning</option>
                    <option value="Criterion 3: Research, Innovations and Extension">Criterion 3: Research & Extension</option>
                    <option value="Criterion 4: Infrastructure & Learning Resources">Criterion 4: Infrastructure</option>
                    <option value="Criterion 5: Student Support & Progression">Criterion 5: Student Support</option>
                    <option value="Criterion 6: Governance, Leadership & Management">Criterion 6: Governance</option>
                    <option value="Criterion 7: Institutional Values & Best Practices">Criterion 7: Values & Practices</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={metricForm.isMandatory}
                    onChange={(e) => setMetricForm({ ...metricForm, isMandatory: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Mandatory Academic Audit Requirement (Clearance Gate)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#1877F2]">
                  <input
                    type="checkbox"
                    checked={metricForm.autoConvertToAppraisal}
                    onChange={(e) => setMetricForm({ ...metricForm, autoConvertToAppraisal: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1877F2]"
                  />
                  <span>⚡ Convert & Link to Faculty Performance Appraisal (PBAS) Question Bank</span>
                </label>
                <p className="text-[10px] text-slate-500 pl-6 leading-tight">
                  Enabling this makes the metric immediately selectable when deriving faculty appraisal dossiers and calculating institutional scores.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMetricModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMetric ? 'Save Changes' : 'Create Metric'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      """ + user_modal_anchor

code = code.replace(user_modal_anchor, metric_modal_code)

# 6. Appraisal Hub Direct Link in Header
appraisal_header_anchor = """                  <p className="text-xs text-slate-500 mt-1">
                    Select questions from AAA Attributes, Course Plans & Event Invitations to build the PBAS appraisal formula and derive individual faculty performance reports.
                  </p>
                </div>"""

new_appraisal_header = """                  <p className="text-xs text-slate-500 mt-1">
                    Select questions from AAA Attributes, Course Plans & Event Invitations to build the PBAS appraisal formula and derive individual faculty performance reports.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('aaa_hub');
                      setAaaSubTab('metric_builder');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>⚙️ AAA Metric & Question Builder</span>
                  </button>
                </div>"""

assert appraisal_header_anchor in code, "Could not find appraisal_header_anchor"
code = code.replace(appraisal_header_anchor, new_appraisal_header)

with open('src/app/admin/central/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: Updated src/app/admin/central/page.tsx with AAA Metric Creation Desk!")
