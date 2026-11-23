with open('src/app/admin/central/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'Lock All Submissions', code)]
print("Matches for 'Lock All Submissions':", len(matches))
for m in matches:
    print(repr(code[m-50:m+70]))
