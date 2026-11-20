import json

with open("complete_official_aaa_metrics.json", "r", encoding="utf-8") as f:
    metrics = json.load(f)

with open("src/app/admin/central/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace aaaMetrics initialization
start_str = "const [aaaMetrics, setAaaMetrics] = useState<any[]>([\n"
end_str = "  ]);\n\n  const [metricModalOpen, setMetricModalOpen] = useState(false);"

start_idx = code.find(start_str)
end_idx = code.find(end_str)

print("Found aaaMetrics start:", start_idx, "end:", end_idx)

if start_idx != -1 and end_idx != -1:
    metrics_js = json.dumps(metrics, indent=4)
    new_init = f"const [aaaMetrics, setAaaMetrics] = useState<any[]>({metrics_js});\n\n  const [metricModalOpen, setMetricModalOpen] = useState(false);"
    code = code[:start_idx] + new_init + code[end_idx + len(end_str):]
    with open("src/app/admin/central/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("SUCCESS: Updated aaaMetrics with all 64 official metrics!")
else:
    print("ERROR: Could not find exact boundaries")
