with open("src/app/admin/central/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

s1 = "const researchPts = Math.min(25, 15);"
print("s1 in code:", s1 in code)

s2 = "{selectedFacultyAppraisal.scores?.totalScore || 94.5}"
print("s2 in code:", s2 in code)

s3 = "{appraisalCriteria.filter(c => c.enabled).map((c, index) => {"
print("s3 in code:", s3 in code)

s4 = "Official IQAC Evaluation & Peer Commendation:"
print("s4 in code:", s4 in code)
