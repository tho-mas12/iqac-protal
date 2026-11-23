with open('src/app/admin/central/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = """                      <button
                        onClick={() => handleBatchLockAllAaa(true)}
                        className="w-full py-2.5 px-6 rounded-full bg-[#0066CC] hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Lock All Submissions</span>
                      </button>"""

replacement = """                      <button
                        onClick={() => handleBatchLockAllAaa(true)}
                        className="w-full py-2.5 px-6 rounded-full bg-[#0066CC] hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Lock All Submissions</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('aaa_hub');
                          setAaaSubTab('metric_builder');
                        }}
                        className="w-full py-2 px-6 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition-all cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-purple-600" />
                        <span>⚙️ Metric Creation Desk ({aaaMetrics.length})</span>
                      </button>"""

assert target in code, "Could not find target in CARD 5"
code = code.replace(target, replacement)

with open('src/app/admin/central/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: Added Metric Creation Desk button to Dashboard Card 5!")
