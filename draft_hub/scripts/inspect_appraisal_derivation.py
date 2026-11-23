with open("src/app/admin/central/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

target_start = "{appraisalCriteria.filter(c => c.enabled).map((c, index) => {"
target_end = "/* Evaluator Remarks & Commendation Box */"

idx1 = code.find(target_start)
idx2 = code.find(target_end)

print("Found table loop start:", idx1, "end:", idx2)
print("Snippet:\n", code[idx1:idx1+400])
