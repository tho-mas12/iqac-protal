import json

with open('iqac_aaa/js/all-attributes-schema.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data[:6]:
    print(f"=== {item.get('id')}: {item.get('cardTitle')} ({item.get('cardCode')}) ===")
    for sh in item.get('sheets', []):
        cols = [c.get('name') if isinstance(c, dict) else str(c) for c in sh.get('columns', [])]
        print(f"  Sheet: {sh.get('sheetName')} ({len(cols)} columns)")
        print(f"    Sample Columns: {', '.join(cols[:4])}")
