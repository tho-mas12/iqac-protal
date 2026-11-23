with open('src/app/admin/central/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find("<span>Lock All Submissions</span>\n                      </button>")
if idx == -1:
    idx = code.find("<span>Lock All Submissions</span>\r\n                      </button>")
print("Found Lock All Submissions at:", idx)

if idx != -1:
    end_tag = code.find("</button>", idx) + len("</button>")
    to_insert = """
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
    code = code[:end_tag] + to_insert + code[end_tag:]
    with open('src/app/admin/central/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("SUCCESS: Inserted button into Dashboard Card 5!")
