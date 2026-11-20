import sqlite3, json, re

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

with open('official_appsys_fields.json', 'r', encoding='utf-8') as f:
    cats = json.load(f)

# Build a lookup by normalized question title
lookup = {}
for cat in cats:
    for q in cat.get('questions', []):
        norm_title = re.sub(r'[^a-z0-9]', '', q['title'].lower())
        lookup[norm_title] = [col for col in q.get('fields', []) if col != 'Sl.No.']

print(f"Loaded {len(lookup)} questions from official_appsys_fields.json")

c.execute("SELECT id, fieldName, fieldLabel FROM DynamicField")
rows = c.fetchall()
updated = 0

for fid, fname, flabel in rows:
    # Find matching columns
    cols = None
    norm_label = re.sub(r'[^a-z0-9]', '', flabel.lower())
    for k, v in lookup.items():
        if k in norm_label or norm_label in k:
            cols = v
            break
    
    # Specific fallbacks
    if not cols:
        if 'studentfeedback' in norm_label:
            cols = ['Semester (ODD / EVEN)', 'Staff Evaluation Feedback Score (%)', 'Total Students Evaluated']
        elif 'innovativetle' in norm_label:
            cols = ['Innovative TLE Practice Adopted', 'Target Course / Batch', 'Pedagogical Methodology (Flipped/Peer/Inquiry)', 'Outcome / Evidence']
        elif 'extension' in norm_label:
            cols = ['Name & Address of Institution / Village', 'Nature of Extension Activity (SHEPHERD / NSS / NCC)', 'Date of Activity', 'Nature of Beneficiaries', 'No. of Beneficiaries']
        elif 'noteworthy' in norm_label:
            cols = ['Distinct Institutional Accomplishment', 'Description of Innovation / Accolade', 'Recognitions / Outcomes Achieved']
        elif 'governing' in norm_label:
            cols = ['Name & Address of Institution', 'Level (National / State)', 'Date of Meeting(s) Attended', 'Duration of Membership From - To', 'No. of Years']
        elif 'bos' in norm_label:
            cols = ['Name & Address of University / College', 'Department', 'Date of BoS Meeting(s) Attended', 'Duration From - To', 'No. of Courses Revised']
        elif 'patents' in norm_label:
            cols = ['Patent Title', 'Application / Patent No.', 'Country / Agency', 'Date of Award', 'Income Generated (INR)']
        elif 'startup' in norm_label:
            cols = ['Name of Product / Venture', 'Nature of Innovation', 'Student Mentees (Names & D.Nos.)', 'Income Generated (INR)']

    if cols and 'proof' not in fname.lower():
        # Store clean columns
        opts = json.dumps({"columns": cols, "isTable": True})
        c.execute("UPDATE DynamicField SET optionsJson = ?, fieldType = 'TABLE' WHERE id = ?", (opts, fid))
        updated += 1

conn.commit()
print(f"Successfully configured {updated} fields as interactive TABLE formats!")
c.execute("SELECT fieldLabel, fieldType, optionsJson FROM DynamicField WHERE fieldType = 'TABLE' LIMIT 5")
for r in c.fetchall():
    print(r[0][:50], '--> Type:', r[1], '--> Options:', r[2])

conn.close()
