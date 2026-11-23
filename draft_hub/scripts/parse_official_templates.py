import openpyxl
import os
import glob
import json
import re

# Load PDF extracted text
with open("extracted_aaa_instructions.txt", "r", encoding="utf-8") as f:
    pdf_text = f.read()

# Map attribute names
attr_map = {
    "Attribute I": {
        "id": "att1",
        "name": "Attribute I - Curriculum Design & Development",
        "naac": "Criterion 1: Curricular Aspects",
        "excel": "AAA_February 2027_Attribute I_Template.xlsx"
    },
    "Attribute II": {
        "id": "att2",
        "name": "Attribute II - Faculty Resources & Development",
        "naac": "Criterion 2: Teaching-Learning & Evaluation",
        "excel": "AAA_February 2027_Attribute II_Template(AutoRecovered).xlsx"
    },
    "Attribute III": {
        "id": "att3",
        "name": "Attribute III - Infrastructure & Learning Resources",
        "naac": "Criterion 4: Infrastructure & Learning Resources",
        "excel": "AAA_February 2027_Attribute III_Template.xlsx"
    },
    "Attribute IV": {
        "id": "att4",
        "name": "Attribute IV - Student Support & Progression",
        "naac": "Criterion 5: Student Support & Progression",
        "excel": "AAA_February 2027_Attribute IV_Template.xlsx"
    },
    "Attribute V": {
        "id": "att5",
        "name": "Attribute V - Teaching-Learning Methodologies & Innovations",
        "naac": "Criterion 2: Teaching-Learning & Evaluation",
        "excel": "AAA_February 2027_Attribute V_Template.xlsx"
    },
    "Attribute VI": {
        "id": "att6",
        "name": "Attribute VI - Extended Curricular Engagements & Student Chapters",
        "naac": "Criterion 5 & 6: Student Activities & Governance",
        "excel": "AAA_February 2027_Attribute VI_Template.xlsx"
    },
    "Attribute VII": {
        "id": "att7",
        "name": "Attribute VII - Management Support & Institutional Grants",
        "naac": "Criterion 6: Governance, Leadership & Management",
        "excel": "AAA_February 2027_Attribute VII_Template.xlsx"
    },
    "Attribute VIII": {
        "id": "att8",
        "name": "Attribute VIII - Student Competitions, Awards & Cultural/Sports",
        "naac": "Criterion 5: Student Support & Progression",
        "excel": "AAA_February 2027_Attribute VIII_Template.xlsx"
    },
    "Attribute IX": {
        "id": "att9",
        "name": "Attribute IX - Research and Innovation Outcomes",
        "naac": "Criterion 3: Research, Innovations & Extension",
        "excel": "AAA_February 2027_Attribute IX_Template.xlsx"
    },
    "Attribute X": {
        "id": "att10",
        "name": "Attribute X - Social Outreach & Extension Activities",
        "naac": "Criterion 3: Research, Innovations & Extension",
        "excel": "AAA_February 2027_Attribute X_Template.xlsx"
    }
}

# Parse all Excel files
excel_dir = r"iqac_aaa\Templates_AAA_2026-2027"
all_parsed_metrics = []

# Part A Profile
all_parsed_metrics.append({
    "id": "aaa_part_a",
    "attributeId": "part_a",
    "attributeName": "PART A - Profile of the Department",
    "metricCode": "PART-A",
    "metricTitle": "Mandatory Departmental Profile: Programmes Offered, Faculty Cadres (Aided/Mgt), Gender Shift-wise Distribution & Student Strength",
    "benchmark": "100% Departmental Profile Clearance",
    "metricType": "table",
    "weightage": 5,
    "naacCriterion": "Institutional Governance",
    "isMandatory": True,
    "convertedToAppraisal": False,
    "supportiveDocuments": "Department Cadre Register, Staff List signed by Principal / HoD, Shift I & II Sanction Orders",
    "instructions": "Presenting data on all questions in Part A is mandatory for every department before audit presentation."
})

for attr_key, meta in attr_map.items():
    xlpath = os.path.join(excel_dir, meta["excel"])
    if not os.path.exists(xlpath):
        continue
    wb = openpyxl.load_workbook(xlpath, data_only=True)
    for sname in wb.sheetnames:
        ws = wb[sname]
        rows = list(ws.iter_rows(max_row=12, values_only=True))
        
        # Determine code
        code = sname.strip()
        if code.lower().startswith("attribute"):
            if "x" in code.lower():
                code = "10.1"
            else:
                num = meta["id"].replace("att", "")
                code = f"{num}.1"
        
        # Determine title
        title = ""
        instructions = ""
        headers = []
        for row in rows:
            non_empty = [str(c).strip() for c in row if c is not None and str(c).strip() != '']
            if not non_empty:
                continue
            line = " ".join(non_empty)
            if not title and len(non_empty) == 1 and not line.lower().startswith("attribute"):
                title = line
            elif not title and any(k in line.lower() for k in ["courses", "phd", "alumni", "teaching", "internship", "project", "degrees", "seed money", "guidance"]):
                title = line
            elif "instruction" in line.lower() or "note" in line.lower() or "scrupulously" in line.lower():
                instructions += line + " "
            elif len(non_empty) >= 3 and not headers:
                headers = non_empty[:8]
        
        if not title:
            title = f"{code} - {meta['name'].split(' - ')[1]}"
        
        # Search PDF for supportive docs & instructions for this metric code
        # pattern e.g. "1.1 -" or "1.1 " or "9.8 -"
        pdf_pattern = rf"(?:{re.escape(code)}\s*[-–]\s*)([^\n]+)"
        pdf_match = re.search(pdf_pattern, pdf_text)
        
        supportive_docs = "Consolidated Report, Geo-tagged Photos, Approval / Sanction Order & Participant Attendance"
        pdf_instruction_snippet = ""
        
        if pdf_match:
            # find section after match
            start_pos = pdf_match.start()
            end_pos = min(len(pdf_text), start_pos + 1200)
            snippet = pdf_text[start_pos:end_pos]
            lines = [l.strip() for l in snippet.split("\n") if l.strip()]
            if len(lines) > 2:
                # usually the next line or lines describe the document and instruction
                supportive_docs = lines[1] if len(lines) > 1 else supportive_docs
                pdf_instruction_snippet = " ".join(lines[2:5])
        
        # Determine weightage and default appraisal linking
        weight = 5
        is_mand = True
        appraisal = False
        target = "Verified Department Records"
        
        if code in ["1.1", "1.5", "1.6", "2.1", "2.7", "5.1", "5.6", "9.1", "9.7", "9.8"]:
            weight = 10
            appraisal = True
        elif code in ["2.4", "2.6", "2.11", "7.1", "7.2", "9.5", "9.6", "9.10", "9.11", "10.1"]:
            weight = 5
            appraisal = True
        
        if code in ["1.1"]: target = "≥ 20% Syllabus Revision in Current Cycle"
        elif code in ["1.2"]: target = "≥ 2 Value Added Courses per Shift"
        elif code in ["1.5"]: target = "100% Final Year Internships"
        elif code in ["2.1"]: target = "100% Course Plans Cleared by HOD"
        elif code in ["2.4"]: target = "≥ 2 Journal Review / Editorial Seats"
        elif code in ["2.6"]: target = "≥ 1 Session as External Resource Person"
        elif code in ["2.7"]: target = "≥ 1 FDP / Refresher Course (min 5 Days)"
        elif code in ["2.10"]: target = "NET / SET / Ph.D. Qualified"
        elif code in ["5.1"]: target = "≥ 3 ICT Pedagogies & Smart Class Modules"
        elif code in ["5.6"]: target = "≥ 1 Four-Quadrant E-Content Module Created"
        elif code in ["7.2", "7.3"]: target = "Seed Money Granted by Management"
        elif code in ["9.1"]: target = "≥ 1 Ph.D. Conferred per Department"
        elif code in ["9.5"]: target = "≥ ₹25,000 Corporate Consultancy Revenue"
        elif code in ["9.7"]: target = "≥ ₹1,00,000 Extramural Research Grants"
        elif code in ["9.8"]: target = "≥ 2 Scopus / WoS / UGC-CARE Papers per Faculty"
        elif code in ["9.10"]: target = "≥ 1 Book / Chapter with Valid ISBN"
        elif code in ["9.11"]: target = "≥ 1 Patent Published / Granted / Commercialized"
        elif code in ["10.1"]: target = "≥ 2 Active Outreach Camps & MoU Activities"
        
        all_parsed_metrics.append({
            "id": f"aaa_m_{code.replace('.', '_')}",
            "attributeId": meta["id"],
            "attributeName": meta["name"],
            "metricCode": code,
            "metricTitle": title.strip(),
            "benchmark": target,
            "metricType": "table",
            "weightage": weight,
            "naacCriterion": meta["naac"],
            "isMandatory": is_mand,
            "convertedToAppraisal": appraisal,
            "supportiveDocuments": supportive_docs[:200],
            "instructions": (instructions[:250] or pdf_instruction_snippet[:250] or "Strictly adhere to 1-entry-1-evidence principle; upload scanned color PDF in portrait mode.")
        })

print(f"Total metrics parsed from Excels & PDF: {len(all_parsed_metrics)}")
with open("parsed_official_aaa_metrics.json", "w", encoding="utf-8") as f:
    json.dump(all_parsed_metrics, f, indent=2)

print("Saved to parsed_official_aaa_metrics.json successfully!")
