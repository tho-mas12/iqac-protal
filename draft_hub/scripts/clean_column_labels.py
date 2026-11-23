import sqlite3, json

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT id, optionsJson FROM DynamicField WHERE fieldType = 'TABLE'")
rows = c.fetchall()
for fid, opts in rows:
    data = json.loads(opts)
    cols = data.get('columns', [])
    cleaned_cols = []
    for col in cols:
        col = col.replace('ProgrammeEg. B. A. English', 'Programme (e.g. B.A. English)')
        col = col.replace('Curse Conducted From -To', 'Course Conducted From - To')
        col = col.replace('PurposeFV/IV/EV', 'Purpose (FV / IV / EV)')
        col = col.replace('DateFrom-To', 'Date (From - To)')
        col = col.replace('DesignationCoordinator/Asst Coordinator', 'Designation (Coordinator / Asst Coordinator)')
        col = col.replace('Stream(Advanced/Intermediate/Basic)', 'Stream (Advanced / Intermediate / Basic)')
        col = col.replace('Mode of Conduct(Online, Offline)', 'Mode of Conduct (Online / Offline)')
        col = col.replace('Role(PI/CI)', 'Role (PI / CI)')
        col = col.replace('DateFrom -To', 'Date (From - To)')
        col = col.replace('DateFrom - To', 'Date (From - To)')
        col = col.replace('Duration of MembershipFrom - To', 'Duration of Membership (From - To)')
        col = col.replace('Nature of Guidance(Project/Internship)', 'Nature of Guidance (Project / Internship)')
        col = col.replace('Nature (WS/OP/RC/STC/FDP/Others)', 'Nature of Programme (WS / OP / RC / STC / FDP / Others)')
        col = col.replace('Nature I/N/S', 'Level (International / National / State)')
        cleaned_cols.append(col)
    c.execute("UPDATE DynamicField SET optionsJson = ? WHERE id = ?", (json.dumps({'columns': cleaned_cols, 'isTable': True}), fid))

conn.commit()
print('Cleaned up column label typos!')
conn.close()
