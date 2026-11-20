import json

with open('iqac_aaa/js/all-attributes-schema.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Item 1 keys:", list(data[1].keys()))
print("Item 1 name:", data[1].get('name'))
print("Item 1 tables count:", len(data[1].get('tables', [])))
for t in data[1].get('tables', []):
    print("  Table:", t.get('name'), "Columns:", [c.get('name') for c in t.get('columns', [])][:4])
