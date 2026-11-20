with open("src/app/admin/central/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Let's inspect the banner and table row in metric_builder
old_banner_part = """                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
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
                  </div>"""

new_banner_part = """                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <a
                      href="/AAA/Templates_AAA_2026-2027/AAA_2026_2027_Instructions.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span>Official PDF Instructions (23 Pages)</span>
                    </a>
                    <button
                      onClick={() => handleOpenCreateMetricModal()}
                      className="px-3.5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create New Metric</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('appraisal_hub');
                        setAppraisalSubTab('criteria_selector');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Appraisal Selector →</span>
                    </button>
                  </div>"""

assert old_banner_part in code, "Could not find old_banner_part"
code = code.replace(old_banner_part, new_banner_part)

# Add IQAC Common Instructions Accordion / Callout Banner right under banner
toast_anchor = "{/* Live Toast Message */}"
assert toast_anchor in code, "Could not find toast_anchor"

common_instructions_block = """{/* IQAC Official Audit Guidelines & Common Instructions Banner (from AAA_2026_2027_Instructions.pdf) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/60 border border-blue-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        i
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                        Official Academic Audit Guidelines & Evidence Rules (AY 2026–2027)
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                      Standard: 1 Entry – 1 Evidence Principle
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                        📄 Soft Copy Evidence
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Scanned, clear, legible, and colour PDF documents in <strong>Portrait orientation</strong> only.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                        🏷️ Naming Convention
                      </span>
                      <p className="text-[11px] text-slate-600 font-mono leading-relaxed">
                        AttributeNo_MetricNo_Sno<br />
                        <span className="text-slate-400">e.g. Attribute9_9.8_01.pdf</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                        📸 Event Reports Structure
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Brochure + HoD signed report with Objectives & Outcomes + Geotagged Photos + Attendance + Feedback.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                        👥 Seniority & Samples
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Faculty data must strictly follow institutional <strong>seniority order</strong>. Red sample rows in Excels must be deleted.
                      </p>
                    </div>
                  </div>
                </div>

                """ + toast_anchor

code = code.replace(toast_anchor, common_instructions_block)

# Enhance table rows with Supportive Documents & Instructions
old_td_title = """                              <td className="py-3.5 px-4">
                                <p className="font-bold text-slate-900 text-xs leading-relaxed">
                                  {m.metricTitle}
                                </p>
                              </td>"""

new_td_title = """                              <td className="py-3.5 px-4 space-y-1.5">
                                <p className="font-bold text-slate-900 text-xs leading-relaxed">
                                  {m.metricTitle}
                                </p>
                                {m.supportiveDocuments && (
                                  <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/60 text-[11px] text-slate-700 flex items-start gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-blue-900 font-bold">Required Evidence (PDF): </strong>
                                      <span>{m.supportiveDocuments}</span>
                                    </div>
                                  </div>
                                )}
                                {m.instructions && (
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-start gap-1.5">
                                    <span className="font-bold text-slate-500 uppercase tracking-wide shrink-0">Rule:</span>
                                    <span className="leading-normal">{m.instructions}</span>
                                  </div>
                                )}
                              </td>"""

assert old_td_title in code, "Could not find old_td_title"
code = code.replace(old_td_title, new_td_title)

with open("src/app/admin/central/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS: Enhanced metric_builder with PDF instructions and evidence rules!")
