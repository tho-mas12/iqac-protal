import sqlite3
conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT username, plainPassword, role FROM User WHERE role = 'FACULTY' LIMIT 5")
for r in c.fetchall():
    print(r)
conn.close()
