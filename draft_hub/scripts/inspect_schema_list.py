import json

with open('iqac_aaa/js/all-attributes-schema.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Data is list of length {len(data)}")
for item in data[:12]:
    print(f"  ID: {item.get('id')} - Title: {item.get('title')} ({len(item.get('sections', []))} sections)")
    for sec in item.get('sections', [])[:2]:
        print(f"    -> Sec ID: {sec.get('id')} - {sec.get('title')} ({len(sec.get('fields', []))} fields)")
