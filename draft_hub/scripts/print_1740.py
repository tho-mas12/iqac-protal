with open('src/app/admin/central/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(1734, 1750):
    print(f"{i+1:4d}: {repr(lines[i])}")
