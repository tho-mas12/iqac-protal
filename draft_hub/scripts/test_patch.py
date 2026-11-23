import re

with open('src/app/admin/central/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

print("File read successfully, length:", len(content))
assert "const [aaaSubTab, setAaaSubTab] = useState<'sub_control' | 'overview' | 'attribute_matrix' | 'faculty_tracker'>('sub_control');" in content
print("Found aaaSubTab declaration!")
