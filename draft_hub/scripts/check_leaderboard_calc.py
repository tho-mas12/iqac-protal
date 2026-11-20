with open("src/app/admin/central/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

idx = code.find("const teachingPts =")
print("Found teachingPts at:", idx)
if idx != -1:
    print(repr(code[idx:idx+350]))
