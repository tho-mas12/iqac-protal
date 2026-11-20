import openpyxl
import os

wb = openpyxl.load_workbook(r"iqac_aaa\Templates_AAA_2026-2027\AAA_February 2027_Attribute IX_Template.xlsx", data_only=True)
print("Attribute IX sheets:", wb.sheetnames)
for sname in wb.sheetnames:
    ws = wb[sname]
    rows = list(ws.iter_rows(max_row=8, values_only=True))
    non_empty_rows = [r for r in rows if any(r)]
    print(f"\nSheet {sname}:")
    for r in non_empty_rows[:3]:
        print("  ", [str(c)[:40] for c in r if c is not None][:6])
