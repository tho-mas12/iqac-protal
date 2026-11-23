# IQAC Annual Academic Audit (AAA) 2026–2027: Form-to-Dashboard Platform
**Internal Quality Assurance Cell (IQAC), St. Joseph's College (Autonomous), Tiruchirappalli**

---

## 🎯 Purpose & Core Value
In IQAC, the Annual Academic Audit (AAA) requires all academic departments to present their yearly performance. To replace fragmented, text-heavy or purely numeric ad-hoc presentations, this platform introduces a **Standardized Form-to-Dashboard System** that achieves:
1. **Total Uniformity:** Every department presents using the exact same NAAC-aligned 60-minute structure.
2. **Tremendous Time Saving:** Filling out the structured questionnaire automatically generates:
   - A **High-Impact 15-Minute Executive KPI Dashboard** (with charts, metrics, and attribute breakdowns)
   - A **16-Slide Projector-Ready Presentation Deck** for the 30-minute deep-dive
   - A **Committee Rubric & Evaluation Sheet** for the final 15-minute panel interaction
3. **Role-Based Workflows:**
   - **Department Accounts:** Each department logs in to fill their form with auto-save and submission locking.
   - **IQAC Admin Dashboard:** Consolidates all college departments in real-time, displays college-wide aggregate metrics, and allows 1-click meeting launching during AAA presentations.
4. **Dual Hosting Model:**
   - **cPanel / MySQL (phpMyAdmin) Ready:** Full PHP API & MySQL schema ready for production deployment on shared hosting.
   - **100% Offline Capable:** Runs directly on any laptop via Python or web browser without requiring internet.

---

## ⏱️ The 60-Minute AAA Presentation Protocol

The platform strictly embeds the 60-minute institutional presentation plan:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     TOTAL AAA PRESENTATION DURATION: 60 MINS                    │
├─────────────────────────┬───────────────────────────────┬───────────────────────┤
│    FIRST 15 MINUTES     │     FOLLOWED BY 30 MINUTES    │    LAST 15 MINUTES    │
│  Departmental Dashboard │   Qualitative & Impact Flow   │   Panel Interaction   │
├─────────────────────────┼───────────────────────────────┼───────────────────────┤
│ • Executive Profile     │ • Signature Achievements      │ • Expert Q&A          │
│ • Research & Pubs Chart │ • Department Uniqueness       │ • Dean / Admin Review │
│ • Grants & Seed Money   │ • AAA 2025-26 ATR Compliance  │ • IQAC Evaluation     │
│ • Skill Courses (VAC/CC)│ • Institutional Best Practices│ • Scoring Rubric      │
│ • MOOC Cycle Pass Rates │ • SWOC Analysis Matrix        │ • Grade (A++, A+, A)  │
│ • MoUs & Linkages       │ • Future Strategic Roadmap    │ • Official Sign-Off   │
│ • Patents & IPR Badges  │ • 8 Academic Quality Pillars  │                       │
└─────────────────────────┴───────────────────────────────┴───────────────────────┘
```

### The 8 Academic Quality Pillars in the 30-Min Segment:
1. **PTM:** Parent-Teacher Meetings, dates, attendance %, key feedback, and action taken.
2. **Feedback & ATR:** Stakeholder satisfaction index (Students, Parents, Alumni, Employers) and Action Taken Report.
3. **TL Innovations:** Teaching-Learning pedagogical innovations (Flipped classrooms, blended LMS, experiential learning).
4. **Assessment Process (Ass P.):** Continuous Internal Assessment (CIA) reforms and Bloom's Taxonomy question mapping.
5. **Remedial Teaching:** Diagnostic entry tests, slow learner coaching, peer-assisted learning (PAL), and advanced learner enrichment.
6. **Student Support & Development:** 1:20 Faculty mentoring ratio, mental wellness counseling, and management scholarships.
7. **Guidance for Competitive Examinations:** Coaching for GATE, UGC/CSIR-NET, UPSC, TNPSC, and Banking exams.
8. **Sustainability:** Paperless CIA submissions, e-waste protocol, and campus green initiatives.

---

## 🌐 Hosting on cPanel with MySQL (phpMyAdmin)

The project is structured with a production-ready PHP/MySQL backend for cPanel LAMP hosting.
Refer to [CPANEL_DEPLOYMENT_GUIDE.md](CPANEL_DEPLOYMENT_GUIDE.md) for step-by-step instructions.

### Quick cPanel Setup:
1. Upload the pre-built **`iqac_aaa_cpanel.zip`** (0.45 MB) to your cPanel `public_html` (or subdomain) via File Manager and Extract.
2. Create a MySQL database and user in cPanel **MySQL Databases**.
3. Edit `config/db.php` with your database name, user, and password.
4. Open `https://yourdomain.com/install.php` in your browser and click **"Run Database Installation & Seed Tables"**.
5. Log in with the default credentials:
   - **Admin:** `admin` / `admin123`
   - **Computer Science:** `cs` / `cs123`
   - **Commerce:** `commerce` / `commerce123`

---

## 💻 Local Offline Usage

### Option 1: Double-Click Launcher (Windows)
Double-click the **`start_dashboard.bat`** file in the project folder. It launches the server and opens your web browser automatically at `http://localhost:8000`.

### Option 2: Command Line (Python)
Run in PowerShell or Command Prompt:
```bash
python run_dashboard.py
```

### Option 3: Direct Browser Launch (Zero Server)
Simply double-click **`index.html`** to open it directly in Google Chrome, Microsoft Edge, or Mozilla Firefox. All required libraries (`Tailwind CSS`, `Chart.js`, and `Lucide Icons`) are bundled locally in `vendor/`, so it works **100% offline without CORS issues**.

---

## 📋 Standardized Questionnaire Mapping (`questions.docx`)

The data form maps 1-to-1 with every single attribute and sub-table from `questions.docx`:

| Attribute | Questionnaire Scope | Form & Dashboard Feature |
| :--- | :--- | :--- |
| **Attribute I** | Curriculum Design | Value Added Courses (VAC), Certificate Courses (CC), Indian Knowledge Systems (IKS), Industrial & Educational Visits, Outside Internships, and SWAYAM/NPTEL MOOC Cycles (UG/PG). |
| **Attribute II** | Faculty Resources | New Ph.D./PDF Degrees, NET/SET/JRF, BoS Memberships, External Auditors, Journal Reviewers & Editors, Professional Bodies, Resource Person Invites (Intl/Natl/State/Reg/Inst), FDPs, Industrial Training, Social Projects, Fellowships, Awards, and Abroad Visits. |
| **Attribute 4 & 7** | Infrastructure & Grants | External Agency Grants (DST, SERB, AICTE, ICSSR), Management Grants, Seed Money for Projects/Patents/Copyrights, and Endowments Established in 2026-2027. |
| **Attribute V** | Learning & Teaching | New MoUs signed in 2026-27, Previous Active MoUs, Industry Linkages, and Four-Quadrant E-Contents (Video, Text, Quiz, Discussion). |
| **Attribute VI & VIII** | Extended Curricular | Department Clubs & Associations (UG/PG), Dual Degree / Add-on Programmes, Professional Chapters (ACM/CSI/IEEE), Competitive Exams Appeared & Qualified, and Student Awards (Sports, Cultural, Academic, Extra-Curricular, Co-Curricular). |
| **Attribute IX** | Research & Outcomes | Ph.D. Conferred, New Research Guides, New Scholars Enrolled, Scopus & WoS Papers, Indexed Conference Proceedings, Books Authored (ISBN), Patents Granted & Applied, Software Copyrights, and Open Educational Resources (OER). |

---

## 💡 Key Platform Capabilities

1. **Department Data Entry Form with Attribute-Wise Navigation:**
   - Sticky navigation bar allows jumping directly to any Attribute (I through IX) or Qualitative section.
   - Dynamic table rows with real-time auto-calculation of grant sums and percentages.
2. **Auto-Saving Local & MySQL Persistence:**
   - Auto-saves changes as coordinators type. Submissions can be marked as `in_progress`, `submitted`, or `locked`.
3. **Admin Console & Meeting Launcher:**
   - Admin view displays college-wide aggregate metrics (total publications, grants, patents, VAC courses) and department submission tracking.
   - 1-click **"Launch Meeting Presentation"** brings up the department's full 60-minute review session.
4. **Interactive 60-Minute Projector Slide Deck:**
   - 16 full-screen presentation slides with keyboard navigation (`Left`/`Right` arrows, `Spacebar`, `F` for fullscreen).
   - Digital countdown timer with phase alerts for 15m Dashboard, 30m Deep Dive, and 15m Panel.
5. **Interactive Audit Evaluation Panel:**
   - 40-point rubric scorecard across 8 dimensions.
   - Automatic composite score and grade computation (**A++**, **A+**, **A**, **B++**).
   - Digital sign-offs for External Expert, School Dean, and IQAC Coordinator.

---

## 📁 Project Directory Structure
```
iqac_AAA_dashboard/
├── index.html                   # Main application interface
├── install.php                  # 1-Click web installer for cPanel MySQL
├── schema.sql                   # MySQL database schema & initial seed data
├── .htaccess                    # cPanel Apache security & compression rules
├── config/
│   └── db.php                   # Database connection PDO & helper functions
├── api/                         # Backend REST APIs for cPanel
│   ├── login.php                # User & Admin authentication
│   ├── logout.php               # Session termination
│   ├── departments.php          # Consolidated department listing & college metrics
│   ├── submission.php           # Audit data JSON save and retrieve
│   ├── status.php               # Department lock & workflow status
│   └── audit.php                # Committee rubric scores & sign-offs
├── js/
│   ├── sample-data.js           # Embedded datasets for CS, Commerce & blank template
│   ├── data-store.js            # Reactive data store & LocalStorage engine
│   ├── auth.js                  # Authentication & session state controller
│   ├── admin-dashboard.js       # Admin overview, college metrics & meeting launcher
│   ├── form-builder.js          # Dynamic form generator with auto-calculations
│   ├── dashboard-renderer.js    # 15-Minute KPI dashboard & attribute-wise tables
│   ├── presentation-mode.js     # 30-Minute slide deck & 60-min timer controller
│   ├── audit-panel.js           # 15-Minute panel review rubric & scorecard
│   └── app.js                   # Application coordinator & event router
├── css/
│   └── styles.css               # Institutional stylesheet & print layout
├── sample-data/                 # Raw JSON datasets for seeding
├── vendor/                      # Bundled offline frontend libraries
│   ├── chart.umd.min.js         # Offline Chart.js library
│   ├── lucide.min.js            # Offline Lucide icon pack
│   └── tailwind.js              # Offline Tailwind CSS runtime engine
├── create_cpanel_zip.py         # Utility script to package zip for cPanel
├── iqac_aaa_cpanel.zip          # Ready-to-upload cPanel deployment package (0.45 MB)
├── CPANEL_DEPLOYMENT_GUIDE.md   # Detailed step-by-step cPanel hosting instructions
├── questions.docx               # Official IQAC AAA PPT questionnaire file
├── run_dashboard.py             # Dual-mode local server with API simulation
└── start_dashboard.bat          # Windows 1-click batch launcher
```

---
*Developed for the Internal Quality Assurance Cell (IQAC), St. Joseph's College (Autonomous), Tiruchirappalli.*
