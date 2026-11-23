import json

with open('iqac_aaa/js/all-attributes-schema.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Keys in all-attributes-schema.json:", list(data.keys()))
for k in list(data.keys()):
    val = data[k]
    title = val.get('title', 'No Title')
    sections = val.get('sections', [])
    print(f"  {k}: {title} ({len(sections)} sections/tables)")
    for s in sections[:3]:
        print(f"    - Section: {s.get('title', 'Untitled')} ({len(s.get('fields', []))} fields/columns)")
