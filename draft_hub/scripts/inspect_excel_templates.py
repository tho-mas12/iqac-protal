import openpyxl
import os
import glob
import re

excel_dir = r"iqac_aaa\Templates_AAA_2026-2027"
excels = sorted(glob.glob(os.path.join(excel_dir, "*.xlsx")))

print("Found Excels:", len(excels))

excel_data = {}

for xlf in excels:
    fname = os.path.basename(xlf)
    print(f"\nProcessing {fname}...")
    wb = openpyxl.load_workbook(xlf, data_only=True)
    sheet_names = wb.sheetnames
    excel_data[fname] = []
    
    for sname in sheet_names:
        ws = wb[sname]
        # read first 10 rows to get title, question, columns
        rows = list(ws.iter_rows(max_row=10, values_only=True))
        title = ""
        instruction = ""
        headers = []
        for r_idx, row in enumerate(rows):
            non_empty = [str(c).strip() for c in row if c is not None and str(c).strip() != '']
            if not non_empty:
                continue
            line = " | ".join(non_empty)
            if not title and len(non_empty) == 1:
                title = non_empty[0]
            elif "instruction" in line.lower() or "note" in line.lower():
                instruction += line + " "
            elif len(non_empty) > 2 and not headers:
                headers = non_empty[:10]
        
        excel_data[fname].append({
            "sheet": sname,
            "title": title or sname,
            "instruction": instruction.strip(),
            "headers": headers
        })

print("\n--- Summary of Excels ---")
for fname, sheets in excel_data.items():
    print(f"\n=== {fname} ({len(sheets)} sheets) ===")
    for s in sheets:
        print(f"  • Sheet: [{s['sheet']}] Title: {s['title'][:80]}")
        if s['headers']:
            print(f"    Headers: {s['headers'][:5]}")
