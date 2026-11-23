# Central Hub Draft & Dynamic Performance Appraisal System (AppSYS)

This directory (`draft_hub/`) contains the complete implementation and assets for combining the three primary institutional portals into an integrated **Central Admin Hub & Faculty Dynamic Performance Appraisal Ecosystem**.

---

## 🏛️ Ecosystem Overview & Architecture

The Central Hub unifies three previously siloed institutional applications:
1. **Course Plan & Teaching-Learning Evaluation (TLE)**
   - AY 2026-2027 Even Semester Course Plan management.
   - Interactive syllabus units, ICT tools, evaluation rubrics, and HOD approval workflows.
2. **Event Invitations & Institutional Approvals**
   - Department-level invitation workflow with remarks, corrections, and approved PDF issuance.
   - Shift I, Shift II, and Combined Department filtering with Google Drive & local archival.
3. **Academic Audit (AAA) & Dynamic Institutional Campaigns (AppSYS)**
   - 10 NAAC Criteria Academic Audit metrics bank.
   - Dynamic Campaign builder with provision to add/edit questions and allot individual marks.
   - **Fields_AppSYS.docx** alignment: 44 official parameters mapped across 11 categories totaling 1,000 marks.
   - Faculty multi-row sub-question table entry grid with cell inputs and evidence uploads.

---

## 📁 Directory Structure & File Inventory

```text
draft_hub/
├── README.md                              <- This documentation guide
├── src/
│   └── app/
│       ├── admin/
│       │   ├── central/
│       │   │   └── page.tsx              <- Central Admin Hub (AAA, Course Plan, Invitations, AppSYS Dossier, Dynamic Campaigns)
│       │   └── page.tsx                  <- Admin Entry Point (links to central hub)
│       ├── faculty/
│       │   └── dashboard/
│       │       └── page.tsx              <- Faculty Portal (Course Plan live view + PBAS Dynamic Campaigns with AppSYS table format)
│       └── api/                          <- Backend API endpoints
│           ├── admin/
│           │   ├── aaa/                  <- AAA metric banks & scores
│           │   ├── course-plans/         <- Course plan submission aggregation
│           │   ├── dashboard-stats/      <- Institutional KPIs
│           │   ├── dynamic-campaigns/    <- Campaign creation, question/marks editor, and submissions
│           │   ├── erp-data/             <- ERP roster and student sync
│           │   └── rankings-federation/  <- NIRF, AISHE, and India Today datasets
│           ├── course-plan-bridge/       <- Course Plan session and sync bridge
│           ├── appraisal/                <- Appraisal derivation
│           ├── checklist/                <- Checklist events & submissions
│           ├── ewyl/                     <- Earn While You Learn hours & stipends
│           └── faculty/                  <- Faculty specific endpoints
├── prisma/
│   ├── schema.prisma                     <- SQLite Schema with DynamicCampaign, DynamicField, DynamicSubmission
│   ├── dev.db                            <- Seeded SQLite database with 11 AppSYS campaigns and 44 table questions
│   ├── schema.mysql.prisma               <- Production MySQL target schema
│   └── seed_local_master.js              <- Local seed script
├── data/
│   ├── Fields_AppSYS.docx                <- Official AppSYS specification document
│   ├── official_appsys_fields.json       <- Structured table columns parsed from Fields_AppSYS.docx
│   ├── complete_official_aaa_metrics.json<- Official 64 AAA metrics definition
│   ├── parsed_official_aaa_metrics.json  <- Cleaned AAA metric catalog
│   ├── extracted_aaa_instructions.txt    <- NAAC AAA instructions
│   ├── Performance Appraisal of Teaching Faculty_25-26.xlsx <- Official Excel rubrics
│   ├── INDIA TODAY RANKINGS-2026-27 EXCEL TEMPLATE.xlsx    <- India Today template
│   ├── NIRF template.pdf                 <- NIRF survey template
│   └── Template-2025-26-AISHE.xlsx       <- AISHE template
├── public/
│   ├── AAA/                              <- Static NAAC AAA documentation portal
│   ├── course-plan/                      <- Standalone Course Plan web application
│   └── assets/                           <- Static institutional brand assets
├── scripts/                              <- Data extraction, patching, and verification scripts
└── screenshots/                          <- Visual verification artifacts
```

---

## 📊 AppSYS 1,000-Mark Categories & Parameters Mapping

| Category # | Category Title | Allotted Marks | Total Parameters | Table Format Columns |
| :--- | :--- | :---: | :---: | :--- |
| **Cat 1** | Curriculum Development | 100 M | 4 Questions | Programme, Course Code, Course Title, Duration, Enrolled, Completed |
| **Cat 2** | Teaching, Learning & Evaluation | 100 M | 4 Questions | Target Group, Course Code, Average Score, Evaluation Mode |
| **Cat 3** | ICT based Teaching Learning and Evaluation | 100 M | 4 Questions | ICT Tool, JosTEL link, LMS Module, Video Lecture URL |
| **Cat 4** | Research, Publications and Academic Contributions | 250 M | 6 Questions | Title of Paper, Journal Name, ISSN, Scopus/WoS, DOI link, Impact Factor |
| **Cat 5** | Research Projects & Consultancy | 100 M | 4 Questions | Project Title, Funding Agency, Sanction Order No, Amount Sanctioned |
| **Cat 6** | Research Guidance | 50 M | 3 Questions | Scholar Name, Reg No, Title of Thesis, Status (Awarded / Ongoing) |
| **Cat 7** | Patents, Technology Transfer & Products | 50 M | 3 Questions | Patent Application No, Country, Status (Published / Granted), Commercialization |
| **Cat 8** | Awards, Fellowships & Invited Lectures | 50 M | 4 Questions | Award Name, Awarding Agency, Date, Level (International / National) |
| **Cat 9** | Professional Development & Training (FDP/STC) | 50 M | 4 Questions | Programme Name, Organizing Institution, Duration From-To, Certificate URL |
| **Cat 10** | Institutional Governance & Responsibilities | 100 M | 4 Questions | Committee Name, Role (Convener / Member), Key Contribution |
| **Cat 11** | Extension, Outreach & Community Engagement | 50 M | 4 Questions | Activity Name, Target Beneficiary, Date, Hours, Collaborating Agency |
| **Total** | **Official AppSYS Aggregate** | **1,000 M** | **44 Questions** | **All Configured as Interactive Table Entry** |

---

## 🚀 How to Reinstate / Mount Central Hub into Production

When ready to graduate the Central Hub from draft to active production:

1. **Mount UI Routes**:
   - Copy `draft_hub/src/app/admin/central/` to `src/app/admin/central/`.
   - Update `src/app/admin/page.tsx` or `src/app/page.tsx` to route `ADMIN` to `/admin/central`.
   - Copy `draft_hub/src/app/faculty/` to `src/app/faculty/`.
2. **Mount APIs**:
   - Copy all folders in `draft_hub/src/app/api/` into `src/app/api/`.
3. **Database Migration**:
   - Merge `DynamicCampaign`, `DynamicField`, and `DynamicSubmission` models from `draft_hub/prisma/schema.prisma` into your production MySQL `prisma/schema.prisma`.
   - Run `npx prisma db push` or `npx prisma migrate deploy`.
4. **Build & Start**:
   - Run `npm run build` and `npm start`.
