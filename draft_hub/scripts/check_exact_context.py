with open('src/app/admin/central/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

idx1 = code.find("onClick={() => setAaaSubTab('faculty_tracker')}")
print("--- SUBTAB NAV CONTEXT ---")
print(repr(code[idx1-100:idx1+350]))

idx2 = code.rfind("View Portfolio")
print("--- FACULTY TRACKER END CONTEXT ---")
print(repr(code[idx2-100:idx2+250]))

idx3 = code.find("Select questions from AAA Attributes, Course Plans & Event Invitations")
print("--- APPRAISAL HEADER CONTEXT ---")
print(repr(code[idx3-50:idx3+250]))
