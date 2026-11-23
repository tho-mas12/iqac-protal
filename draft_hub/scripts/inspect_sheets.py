import json

with open('iqac_aaa/js/all-attributes-schema.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data[:4]:
    print(f"=== {item.get('id')}: {item.get('cardTitle')} ({item.get('cardCode')}) ===")
    for sh in item.get('sheets', []):
        print(f"  Sheet: {sh.get('sheetName')} ({len(sh.get('columns', []))} columns)")
        print(f"    Columns: {', '.join(sh.get('columns', [])[:5])}")
