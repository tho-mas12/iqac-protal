with open("src/app/admin/central/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

idx1 = code.find("{appraisalCriteria.filter(c => c.enabled).map((c, index) => {")
idx2 = code.find("/* Evaluator Remarks & Commendation Box */")

print(code[idx1:idx2])
