import sqlite3
import json
import uuid
from datetime import datetime, timedelta

def run():
    conn = sqlite3.connect('prisma/dev.db')
    c = conn.cursor()

    # Clear old test campaigns
    c.execute("DELETE FROM DynamicSubmission WHERE campaignId IN (SELECT id FROM DynamicCampaign WHERE title LIKE '%trial%' OR title LIKE '%triak%')")
    c.execute("DELETE FROM DynamicField WHERE campaignId IN (SELECT id FROM DynamicCampaign WHERE title LIKE '%trial%' OR title LIKE '%triak%')")
    c.execute("DELETE FROM DynamicCampaign WHERE title LIKE '%trial%' OR title LIKE '%triak%'")

    now_iso = datetime.now().isoformat()
    deadline = (datetime.now() + timedelta(days=60)).isoformat()

    campaigns = [
        {
            "title": "PBAS 2025-26: Professional Enrichment & Faculty Development (FDP, MOOCs, Awards)",
            "description": "Category: Professional Enrichment (150 Marks). Orientation programmes, Refresher courses, FDPs, MOOC completions, National/International Fellowships & prestigious awards.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "programme_type",
                    "fieldLabel": "Programme Category (UGC / MoE / AICTE / NPTEL)",
                    "fieldType": "SELECT",
                    "optionsJson": json.dumps(["FDP - Faculty Development Programme", "Orientation Programme (OP)", "Refresher Course (RC)", "Short Term Course (STTP)", "Professional Development Programme (PDP)", "Workshop / Training Seminar"]),
                    "isRequired": True
                },
                {
                    "fieldName": "programme_title",
                    "fieldLabel": "Title of the Programme & Organizing Institution",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. Advanced AI Pedagogies organized by MMTTC / UGC-HRDC",
                    "isRequired": True
                },
                {
                    "fieldName": "duration_dates",
                    "fieldLabel": "Duration & Inclusive Dates (From - To)",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. 10.07.2025 to 24.07.2025 (14 Days)",
                    "isRequired": True
                },
                {
                    "fieldName": "mooc_courses",
                    "fieldLabel": "MOOC / NPTEL Courses Completed (Title, Platform, Score %)",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. SWAYAM NPTEL: Python for Data Science (Elite + Silver, 84%)",
                    "isRequired": False
                },
                {
                    "fieldName": "fellowships_awards",
                    "fieldLabel": "Prestigious Fellowships, Honours & Awards Received",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. Best Researcher Award from National Academy / Governmental Body",
                    "isRequired": False
                },
                {
                    "fieldName": "programmes_abroad",
                    "fieldLabel": "Academic Programmes / Conferences Attended Abroad",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. Keynote presenter at International Science Congress, Singapore",
                    "isRequired": False
                },
                {
                    "fieldName": "proof_document",
                    "fieldLabel": "Upload Completion Certificate / Award Order (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Resource Person & Invited Lectures",
            "description": "Category: Resource Person (100 Marks). Keynote addresses, session chairs, and invited talks delivered at UGC-HRDC, International, National, State level and Sister Institutions.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "level_of_program",
                    "fieldLabel": "Jurisdiction Level of Programme",
                    "fieldType": "SELECT",
                    "optionsJson": json.dumps(["UGC - HRDC / MMTTC & Central Academies (20 Pts)", "International Programme - Held Abroad (25 Pts)", "National Programme - Outside Tamil Nadu (20 Pts)", "State Level Programme (15 Pts)", "Within SJC / Sister Jesuit Institutions (10 Pts)"]),
                    "isRequired": True
                },
                {
                    "fieldName": "session_title",
                    "fieldLabel": "Title of Lecture / Session Chaired",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. Next-Gen Cloud Architecture & NEP 2020 Reforms",
                    "isRequired": True
                },
                {
                    "fieldName": "host_institution",
                    "fieldLabel": "Host University / College / Organization",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. Department of Computer Science, Loyola College / IIT Madras",
                    "isRequired": True
                },
                {
                    "fieldName": "engagement_date",
                    "fieldLabel": "Date of Lecture / Session",
                    "fieldType": "DATE",
                    "isRequired": True
                },
                {
                    "fieldName": "beneficiaries_count",
                    "fieldLabel": "Target Audience & Estimated Participants",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. 120 Faculty & Research Scholars",
                    "isRequired": True
                },
                {
                    "fieldName": "invitation_proof",
                    "fieldLabel": "Upload Official Invitation Letter & Certificate (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Student Support, Remedial Coaching & Mentoring",
            "description": "Category: Student Support Activities (100 Marks). Remedial classes handled for slow learners, bridge courses, capability enhancement, and industrial/field study visits.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "support_type",
                    "fieldLabel": "Student Support Activity Category",
                    "fieldType": "SELECT",
                    "optionsJson": json.dumps(["Remedial Classes Handled (20 Pts)", "Bridge Course for Freshers (10 Pts)", "Capability Enhancement Programme Organised (20 Pts)", "Industry Expert Lecture Organised (20 Pts)", "Industrial Visit / Field / Environmental Visit Conducted (10 Pts)"]),
                    "isRequired": True
                },
                {
                    "fieldName": "course_class",
                    "fieldLabel": "Course Code & Target Class Section",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. 21UCS4102 - II B.Sc. Computer Science 'B'",
                    "isRequired": True
                },
                {
                    "fieldName": "hours_handled",
                    "fieldLabel": "Total Remedial / Bridge Contact Hours Handled",
                    "fieldType": "NUMBER",
                    "placeholder": "e.g. 20",
                    "isRequired": True
                },
                {
                    "fieldName": "students_benefited",
                    "fieldLabel": "Number of Students Enrolled / Benefited",
                    "fieldType": "NUMBER",
                    "placeholder": "e.g. 35",
                    "isRequired": True
                },
                {
                    "fieldName": "academic_outcomes",
                    "fieldLabel": "Measurable Academic Outcome (Pass % Improvement)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "e.g. 88% of remedial batch cleared semester exam in first attempt; diagnostic pre and post test conducted.",
                    "isRequired": True
                },
                {
                    "fieldName": "report_proof",
                    "fieldLabel": "Upload Attendance Roster & HoD Endorsed Report (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: ICT-Based Teaching, Immersive Technologies & E-Content",
            "description": "Category: ICT Based Teaching Learning and Evaluation (100 Marks). E-content on LMS/Repositories, Immersive Technologies (AI/VR/AR), and non-PPT ICT pedagogical tools.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "ict_category",
                    "fieldLabel": "ICT / Innovation Category",
                    "fieldType": "SELECT",
                    "optionsJson": json.dumps(["Immersive Technologies Adopted (AI/VR/AR) (20 Pts)", "Innovative ICT-Based Teaching Activities - non-PPT (20 Pts)", "ICT-Based Online Assignments & Quizzes (20 Pts)", "E-Materials Deployed on JosTEL LMS (15 Pts)", "E-Materials in Institutional Repository (10 Pts)", "Online / Blended Value-Added Course (15 Pts)"]),
                    "isRequired": True
                },
                {
                    "fieldName": "course_mapping",
                    "fieldLabel": "Course Code & Title Where Adopted",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. 21UCS5201 - Cloud Computing & Microservices",
                    "isRequired": True
                },
                {
                    "fieldName": "technology_tool",
                    "fieldLabel": "Digital Platforms / Tools Used",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. JosTEL Moodle LMS, GitHub Classroom, Kahoot, ChatGPT API Prompt Engineering",
                    "isRequired": True
                },
                {
                    "fieldName": "econtent_url",
                    "fieldLabel": "URL Link to LMS Module / Video Lecture / Repository",
                    "fieldType": "TEXT",
                    "placeholder": "https://jostel.sjctni.edu/course/view.php?id=...",
                    "isRequired": True
                },
                {
                    "fieldName": "pedagogical_impact",
                    "fieldLabel": "Impact on Student Engagement & Learning Analytics",
                    "fieldType": "TEXTAREA",
                    "placeholder": "e.g. 96% interactive quiz participation; higher retention demonstrated in CIA-II assessments.",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Consultancy, Corporate Training & Startup Ventures",
            "description": "Category: FUNDS Generated and Received (100 Marks). Industry consultancy assignments, corporate training revenue, and startup incubation engagements.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "activity_type",
                    "fieldLabel": "Industry Linkage / Revenue Stream",
                    "fieldType": "SELECT",
                    "optionsJson": json.dumps(["Consultancy Activities (15 Pts)", "Engagement in Corporate Training (10 Pts)", "Engagement in Start-up Activities & Products Generated (20 Pts)", "Sponsored Research Projects Applied (10 Pts)"]),
                    "isRequired": True
                },
                {
                    "fieldName": "client_org",
                    "fieldLabel": "Industry Client / Corporate Organization Name",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. BHEL Trichy / Zoho Corporation / V-Guard Industries",
                    "isRequired": True
                },
                {
                    "fieldName": "revenue_amount",
                    "fieldLabel": "Revenue / Grant Mobilized (in INR)",
                    "fieldType": "NUMBER",
                    "placeholder": "e.g. 75000",
                    "isRequired": True
                },
                {
                    "fieldName": "tenure_dates",
                    "fieldLabel": "Project Dates & Deliverables",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. August 2025 - November 2025 (4 Months corporate workshop)",
                    "isRequired": True
                },
                {
                    "fieldName": "sanction_proof",
                    "fieldLabel": "Upload Sanction Order / MoU / Client Completion Certificate (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Academic Bodies, Governance & Noteworthy Accomplishments",
            "description": "Category: Academic Council/BoS (100 Marks), Department Governance (70 Marks), Extension (30 Marks) & Other Noteworthy Accomplishments (50 Marks).",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "body_category",
                    "fieldLabel": "Governance / Academic Body Category",
                    "fieldType": "SELECT",
                    "optionsJson": json.dumps(["Member of Governing Body / Academic Council - Other Institution (20 Pts)", "Board of Studies (BoS) Member - Other College / University (20 Pts)", "Member of IQAC / External Audit Committee (15 Pts)", "Member of Professional Bodies - IEEE, ACM, RSC (15 Pts)", "In-charge of Department Activities - MQC, Inventory, Labs (30 Pts)", "Administrative Responsibilities - Dean, Director, Vice-Principal (40 Pts)", "Extension & Community Outreach Activities (30 Pts)", "Other Noteworthy Accomplishments Not Listed Above (50 Pts)"]),
                    "isRequired": True
                },
                {
                    "fieldName": "institution_body",
                    "fieldLabel": "Body / Committee / External Institution Name",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. Academic Council of Holy Cross College / IEEE Madras Section",
                    "isRequired": True
                },
                {
                    "fieldName": "role_held",
                    "fieldLabel": "Designation / Role Held",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. University Nominee / Subject Expert / Department MQC Coordinator",
                    "isRequired": True
                },
                {
                    "fieldName": "summary_accomplishment",
                    "fieldLabel": "Detailed Description of Contribution & Accomplishments",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Describe curricula drafted, policies formulated, or institutional milestones achieved...",
                    "isRequired": True
                },
                {
                    "fieldName": "proof_letter",
                    "fieldLabel": "Upload Appointment Letter / Office Order / Certificate (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        }
    ]

    for camp in campaigns:
        camp_id = f"camp_{uuid.uuid4().hex[:12]}"
        c.execute("""
            INSERT INTO DynamicCampaign (id, title, description, targetRole, academicYear, deadline, isActive, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        """, (camp_id, camp["title"], camp["description"], camp["targetRole"], camp["academicYear"], deadline, now_iso, now_iso))

        for idx, field in enumerate(camp["fields"]):
            field_id = f"fld_{uuid.uuid4().hex[:12]}"
            c.execute("""
                INSERT INTO DynamicField (id, campaignId, fieldName, fieldLabel, fieldType, optionsJson, placeholder, isRequired, orderIndex, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                field_id,
                camp_id,
                field["fieldName"],
                field["fieldLabel"],
                field["fieldType"],
                field.get("optionsJson"),
                field.get("placeholder"),
                1 if field["isRequired"] else 0,
                idx + 1,
                now_iso,
                now_iso
            ))

    conn.commit()
    print(f"SUCCESS: Seeded {len(campaigns)} official PBAS Performance Appraisal campaigns!")
    conn.close()

if __name__ == '__main__':
    run()
