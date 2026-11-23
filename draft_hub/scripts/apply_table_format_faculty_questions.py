with open('src/app/faculty/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Trash2 to imports
assert 'Plus,' in content, "Plus, not found in imports"
content = content.replace('Plus,', 'Plus,\n  Trash2,', 1)

# 2. Handlers: replace openCampaignModal and add table row handlers
target_handlers = """  const openCampaignModal = (camp: any) => {
    setSelectedCampaign(camp);
    setFormResponses(camp.mySubmissionData || {});
    setSubmitMessage(null);
  };"""

new_handlers = """  const openCampaignModal = (camp: any) => {
    setSelectedCampaign(camp);
    if (camp.mySubmissionData && Object.keys(camp.mySubmissionData).length > 0) {
      setFormResponses(camp.mySubmissionData);
    } else {
      const initial: any = {};
      (camp.fields || []).forEach((f: any) => {
        let isTbl = f.fieldType === 'TABLE';
        if (f.optionsJson) {
          try {
            const parsed = typeof f.optionsJson === 'string' ? JSON.parse(f.optionsJson) : f.optionsJson;
            if (parsed.isTable || parsed.columns?.length) isTbl = true;
          } catch (e) {}
        }
        if (isTbl) {
          initial[f.fieldName] = [{}];
        }
      });
      setFormResponses(initial);
    }
    setSubmitMessage(null);
  };

  const handleAddTableRow = (fieldName: string) => {
    setFormResponses((prev: any) => {
      const existing = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      return {
        ...prev,
        [fieldName]: [...existing, {}]
      };
    });
  };

  const handleUpdateTableCell = (fieldName: string, rowIdx: number, colName: string, val: string) => {
    setFormResponses((prev: any) => {
      const existing = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [{}];
      existing[rowIdx] = { ...(existing[rowIdx] || {}), [colName]: val };
      return {
        ...prev,
        [fieldName]: existing
      };
    });
  };

  const handleRemoveTableRow = (fieldName: string, rowIdx: number) => {
    setFormResponses((prev: any) => {
      const existing = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [];
      const filtered = existing.filter((_: any, i: number) => i !== rowIdx);
      return {
        ...prev,
        [fieldName]: filtered.length > 0 ? filtered : [{}]
      };
    });
  };"""

assert target_handlers in content, "target_handlers not found"
content = content.replace(target_handlers, new_handlers, 1)

# 3. Replace the Modal with the wide table format modal
start_modal_anchor = "{/* MODAL: Submit Dynamic Campaign Responses */}"
end_modal_anchor = "{/* MODAL: Upload Invitation */}"

idx_m_start = content.find(start_modal_anchor)
idx_m_end = content.find(end_modal_anchor)

assert idx_m_start != -1, "idx_m_start not found"
assert idx_m_end != -1, "idx_m_end not found"

new_table_modal = """{/* MODAL: Submit Dynamic Campaign Responses with Exact Table Format */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-6xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto my-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
                    {selectedCampaign.targetRole}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    AY {selectedCampaign.academicYear || '2025–2026'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedCampaign.title}</h3>
                {selectedCampaign.description && (
                  <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">{selectedCampaign.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer self-start sm:self-auto"
              >
                ✕
              </button>
            </div>

            {submitMessage && (
              <div className={`p-4 rounded-2xl text-xs font-semibold ${
                submitMessage.startsWith('Error')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleDynamicSubmit} className="space-y-6 text-xs">
              {selectedCampaign.fields.map((f: any, fIdx: number) => {
                let isTbl = f.fieldType === 'TABLE';
                let tableCols: string[] = [];
                if (f.optionsJson) {
                  try {
                    const parsed = typeof f.optionsJson === 'string' ? JSON.parse(f.optionsJson) : f.optionsJson;
                    if (parsed.columns?.length) {
                      tableCols = parsed.columns;
                      isTbl = true;
                    }
                  } catch (e) {}
                }

                // If TABLE field format
                if (isTbl && tableCols.length > 0) {
                  const rows = Array.isArray(formResponses[f.fieldName]) ? formResponses[f.fieldName] : [{}];
                  return (
                    <div key={f.id || fIdx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {fIdx + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {f.fieldLabel.split(' • Fields:')[0]}
                          </span>
                          {f.isRequired && <span className="text-red-500 font-bold">*</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                            {f.marks ?? 10} Marks
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddTableRow(f.fieldName)}
                            className="px-3 py-1 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          >
                            + Add Row
                          </button>
                        </div>
                      </div>

                      {/* Interactive Responsive Entry Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs min-w-[700px]">
                          <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="py-2.5 px-3 w-12 text-center">#</th>
                              {tableCols.map((col: string, cIdx: number) => (
                                <th key={cIdx} className="py-2.5 px-3">{col}</th>
                              ))}
                              <th className="py-2.5 px-3 w-16 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rows.map((row: any, rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                                <td className="py-2 px-3 text-center font-bold text-slate-400 font-mono text-[11px]">
                                  {rIdx + 1}
                                </td>
                                {tableCols.map((col: string, cIdx: number) => (
                                  <td key={cIdx} className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={row[col] || ''}
                                      onChange={(e) => handleUpdateTableCell(f.fieldName, rIdx, col, e.target.value)}
                                      placeholder={`Enter ${col}...`}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 text-xs focus:border-blue-500 focus:bg-blue-50/20 focus:outline-hidden transition"
                                    />
                                  </td>
                                ))}
                                <td className="py-2 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTableRow(f.fieldName, rIdx)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title="Delete row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>{rows.length} record(s) entered for this parameter</span>
                        <button
                          type="button"
                          onClick={() => handleAddTableRow(f.fieldName)}
                          className="text-[#1877F2] hover:underline font-bold"
                        >
                          + Add another entry row
                        </button>
                      </div>
                    </div>
                  );
                }

                // If Document Upload (FILE)
                if (f.fieldType === 'FILE') {
                  return (
                    <div key={f.id || fIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          <span>{f.fieldLabel}</span>
                          {f.isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          Attested PDF Document
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormResponses({ ...formResponses, [f.fieldName]: file.name });
                          }
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                      />
                      {formResponses[f.fieldName] && (
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Selected file: {formResponses[f.fieldName]}
                        </p>
                      )}
                    </div>
                  );
                }

                // Standard Fallback Input
                return (
                  <div key={f.id || fIdx} className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span>{f.fieldLabel} {f.isRequired && <span className="text-red-500">*</span>}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {f.marks ?? 10} Marks
                      </span>
                    </label>
                    <input
                      type="text"
                      required={f.isRequired}
                      value={formResponses[f.fieldName] || ''}
                      onChange={(e) => setFormResponses({ ...formResponses, [f.fieldName]: e.target.value })}
                      placeholder={f.placeholder || 'Enter value...'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-blue-600"
                    />
                  </div>
                );
              })}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  All table rows and parameters are automatically synchronized with your PBAS Appraisal Scorecard.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingField}
                    className="px-6 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {submittingField ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Table Entries...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save &amp; Submit Table Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      """

content = content[:idx_m_start] + new_table_modal + content[idx_m_end:]

with open('src/app/faculty/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Injected Table Format modal into Faculty Dashboard!")
