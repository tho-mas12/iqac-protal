import json

with open('iqac_aaa/js/all-attributes-schema.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("First column in sheet 1.1:")
print(json.dumps(data[1]['sheets'][0]['columns'][0], indent=2))
