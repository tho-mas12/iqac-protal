import sqlite3
import json
import uuid
import time

def run():
    conn = sqlite3.connect('prisma/dev.db')
    c = conn.cursor()

    # Clear old campaigns
    c.execute("DELETE FROM DynamicSubmission")
    c.execute("DELETE FROM DynamicField")
    c.execute("DELETE FROM DynamicCampaign")

    now_ms = int(time.time() * 1000)
    deadline_ms = now_ms + (75 * 24 * 3600 * 1000)

    campaigns = [
        {
            "title": "PBAS 2025-26: Curriculum Development & Innovative Offline TLE",
            "description": "Category I: Curriculum Development (100 Marks). New courses taught, syllabus revision contributions, offline value-added courses, staff evaluation feedback, innovative offline TLE practices, and IKS activities.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "new_course_taught",
                    "fieldLabel": "New Course Taught (Not taught in previous years - 10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Course Code & Title (e.g. 23UCS3101 - Applied Machine Learning)",
                    "isRequired": True
                },
                {
                    "fieldName": "courses_revised",
                    "fieldLabel": "No. of Courses Revised in Syllabus Revision (10 Marks)",
                    "fieldType": "NUMBER",
                    "placeholder": "e.g. 2",
                    "isRequired": True
                },
                {
                    "fieldName": "value_added_offline",
                    "fieldLabel": "Value Added Courses Offered - Offline Only (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Title, target batch, duration (exclude online/blended)",
                    "isRequired": False
                },
                {
                    "fieldName": "certificate_extra_credit_offline",
                    "fieldLabel": "Certificate / Extra Credit Course - Offline Only (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Course Title, Credits, Hours handled",
                    "isRequired": False
                },
                {
                    "fieldName": "student_feedback_score",
                    "fieldLabel": "Student Feedback Taken During Staff Evaluation % (10 Marks)",
                    "fieldType": "NUMBER",
                    "placeholder": "e.g. 92.5",
                    "isRequired": True
                },
                {
                    "fieldName": "innovative_offline_tle",
                    "fieldLabel": "Innovative Offline TLE Practices Adopted (20 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Peer learning, role play, flipped classroom, problem-based learning, inquiry labs...",
                    "isRequired": True
                },
                {
                    "fieldName": "iks_activities",
                    "fieldLabel": "Indian Knowledge Systems (IKS) Activities Integrated (10 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Integration of indigenous knowledge, heritage science, Indian mathematical principles...",
                    "isRequired": False
                },
                {
                    "fieldName": "proof_curriculum",
                    "fieldLabel": "Upload BoS Excerpt / Syllabi / Endorsement (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Student Support, Remedial Coaching & Mentoring",
            "description": "Category II: Student Support Activities (100 Marks). Club/Centre of Excellence coordination, remedial classes, capability enhancement, industry expert programs, bridge courses, and industrial/field visits.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "club_centre_coordination",
                    "fieldLabel": "Member/Coordinator of Clubs & Centres of Excellence (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "e.g. AICUF / Rotaract / Centre for Soft Skills / IoT Centre of Excellence",
                    "isRequired": False
                },
                {
                    "fieldName": "remedial_classes",
                    "fieldLabel": "Remedial Classes Handled (Course, Hours, Batch) (20 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "e.g. 21UCS4102 - 18 Contact Hours - 32 Slow Learners benefited",
                    "isRequired": True
                },
                {
                    "fieldName": "capability_enhancement",
                    "fieldLabel": "Capability Enhancement Programmes Organised (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Soft skills, language lab, computing skills, yoga/wellness workshops...",
                    "isRequired": False
                },
                {
                    "fieldName": "industry_expert_programmes",
                    "fieldLabel": "Programmes Organised with Industry Experts (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Expert Name, Designation, Company, Topic, Date",
                    "isRequired": True
                },
                {
                    "fieldName": "bridge_course_conducted",
                    "fieldLabel": "Bridge Course Handled for Freshers (10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Course Code, Class, Dates, Pre & Post assessment conducted",
                    "isRequired": False
                },
                {
                    "fieldName": "industrial_field_visits",
                    "fieldLabel": "Industrial / Field / Environmental Visits Organised (10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Industry Name, Location, Date, No. of students, Faculty escort",
                    "isRequired": False
                },
                {
                    "fieldName": "proof_student_support",
                    "fieldLabel": "Upload Attendance Roster & HoD Endorsed Report (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: ICT-Based Teaching, Immersive Technologies & E-Content",
            "description": "Category III: ICT Based Teaching Learning & Evaluation (100 Marks). E-content on LMS and Institutional Repository, online/blended courses, non-PPT ICT teaching, online quizzes/assignments, and AI/VR/AR technologies.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "econtent_repository",
                    "fieldLabel": "E-Materials in Department / College Repository (Other than LMS - 10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Title of Module & Repository URL link",
                    "isRequired": False
                },
                {
                    "fieldName": "econtent_lms",
                    "fieldLabel": "E-Materials Deployed on JosTEL LMS (15 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "LMS Course URL & Module description (JosTEL Moodle)",
                    "isRequired": True
                },
                {
                    "fieldName": "online_blended_vac",
                    "fieldLabel": "Online / Blended Value Added / Certificate Courses (15 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Course Title, Platform, Duration, Enrollment",
                    "isRequired": False
                },
                {
                    "fieldName": "ict_teaching_non_ppt",
                    "fieldLabel": "ICT-Based Teaching Activities (Kindly Do NOT Include PPT - 20 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Simulations, Jupyter notebooks, interactive coding, podcasts, screencasts...",
                    "isRequired": True
                },
                {
                    "fieldName": "ict_assignments_conducted",
                    "fieldLabel": "ICT-Based Online Assignments & Quizzes Conducted (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Platform (Kahoot / Google Forms / LMS Quiz / GitHub), Frequency, Analytics",
                    "isRequired": True
                },
                {
                    "fieldName": "immersive_technologies",
                    "fieldLabel": "Immersive Technologies Adopted (AI / VR / AR - 20 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Generative AI pedagogical integration, VR virtual field labs, AR anatomy/molecular models...",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Resource Person & Invited Lectures",
            "description": "Category IV: Resource Person (100 Marks). UGC-HRDC/MMTTC keynote talks, International programs abroad, National programs outside Tamil Nadu, State-level talks, and institutional sessions.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "ugc_hrdc_session",
                    "fieldLabel": "Resource Person at UGC-HRDC, MMTTC & Central Academies (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Centre Name, Topic, Date",
                    "isRequired": False
                },
                {
                    "fieldName": "international_session_abroad",
                    "fieldLabel": "International Programmes - Held Abroad (25 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Country, Host University, Topic, Date",
                    "isRequired": False
                },
                {
                    "fieldName": "national_session_outside_tn",
                    "fieldLabel": "National Programmes - Held in States Other than Tamil Nadu (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "State, Host Institution, Topic, Date",
                    "isRequired": False
                },
                {
                    "fieldName": "state_level_session",
                    "fieldLabel": "State Level Programmes (15 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "College / University, Topic, Date",
                    "isRequired": False
                },
                {
                    "fieldName": "within_college_session",
                    "fieldLabel": "Resource Person Within St. Joseph's College (10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Department / Forum, Topic, Date",
                    "isRequired": False
                },
                {
                    "fieldName": "proof_resource_person",
                    "fieldLabel": "Upload Invitation Letter & Certificate of Appreciation (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Research Activities, Publications & PhD Guidance",
            "description": "Category V: Research Activities (100 Marks). Research papers presented/published in Scopus/WoS/UGC-CARE, book chapters, books edited/authored, editorial reviewer roles, and PhD/PG research guidance.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "papers_presented",
                    "fieldLabel": "Research Papers Presented in Conferences (10 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Paper Title, Conference Name, Organizer, Level (National/Intl), Date",
                    "isRequired": True
                },
                {
                    "fieldName": "papers_published",
                    "fieldLabel": "Research Papers Published in Journals (Scopus/WoS/UGC-CARE - 10 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Title, Journal Name, ISSN, Volume, Issue, DOI / Weblink",
                    "isRequired": True
                },
                {
                    "fieldName": "book_chapters_published",
                    "fieldLabel": "Chapters in Edited Books with ISBN (10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Chapter Title, Book Title, Publisher, ISBN",
                    "isRequired": False
                },
                {
                    "fieldName": "books_edited_published",
                    "fieldLabel": "Books Edited (15 Marks) / Books Authored & Published (25 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Book Title, Single/Co-author, Publisher, ISBN, Year",
                    "isRequired": False
                },
                {
                    "fieldName": "editorial_reviewer",
                    "fieldLabel": "Reviewer / Member of Editorial Board of Indexed Journals (15 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Journal Name, Publisher, Role, Dates",
                    "isRequired": False
                },
                {
                    "fieldName": "phd_guidance",
                    "fieldLabel": "Research Guidance - Ph.D. Scholars (Awarded: 10 Marks, Ongoing: 5 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Scholar Name, Reg No, Title of Thesis, Status (Awarded / Viva completed / Ongoing)",
                    "isRequired": False
                },
                {
                    "fieldName": "pg_ug_guidance",
                    "fieldLabel": "Research Guidance - PG & UG Dissertations / Projects (5 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "No. of Batches guided, Programme (M.Sc. / B.Sc.)",
                    "isRequired": False
                },
                {
                    "fieldName": "proof_research",
                    "fieldLabel": "Upload First Page of Publications / Acceptance / Guidance Orders (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Funds Generated, Consultancy & Startup Ventures",
            "description": "Category VI: FUNDS Generated & Received (100 Marks). Research projects applied/granted, industry consultancy revenue, corporate training, patents published/granted, and startup revenue.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "research_projects_applied",
                    "fieldLabel": "Research Projects Applied for Funding (10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Project Title, Funding Agency (SERB/DST/ICSSR/DBT), Amount Proposed (INR)",
                    "isRequired": False
                },
                {
                    "fieldName": "research_projects_granted",
                    "fieldLabel": "Research Projects Granted & Sanctioned (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Sanction Order No, Funding Agency, Total Amount Sanctioned (INR), Duration",
                    "isRequired": False
                },
                {
                    "fieldName": "consultancy_activities",
                    "fieldLabel": "Consultancy Activities & Revenue Mobilized (15 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Client Organization, Consultancy Scope, Revenue Generated (INR)",
                    "isRequired": False
                },
                {
                    "fieldName": "corporate_training",
                    "fieldLabel": "Engagement in Corporate Training (10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Company Name, Training Modules, Revenue, Duration",
                    "isRequired": False
                },
                {
                    "fieldName": "ipr_patents",
                    "fieldLabel": "IPR - Patents Published / Granted (25 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Patent Application No, Patent Title, Jurisdiction (Indian / International), Status",
                    "isRequired": False
                },
                {
                    "fieldName": "startup_activities",
                    "fieldLabel": "Engagement in Start-up Activities (Products, Income Generated - 20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Startup Name, Product Launched, Incubation Centre, Revenue/Grants",
                    "isRequired": False
                },
                {
                    "fieldName": "proof_funds",
                    "fieldLabel": "Upload Sanction Orders / Client Invoices / Patent Certificates (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Professional Enrichment & Faculty Development (FDP, MOOCs, Awards)",
            "description": "Category VII: Professional Enrichment (150 Marks). Doctoral degrees, NET/SET qualification, seminars/workshops attended, OP/RC/FDP/PDP courses (UGC/MoE/AICTE), fellowships, MOOCs, awards, and foreign visits.",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "doctoral_degree",
                    "fieldLabel": "Doctoral Degree (Ph.D.) Awarded in Assessment Year (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "University, Thesis Title, Notification Date",
                    "isRequired": False
                },
                {
                    "fieldName": "net_set",
                    "fieldLabel": "NET / CSIR / SET / GATE Qualified (10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Subject, Year, Roll No",
                    "isRequired": False
                },
                {
                    "fieldName": "fdp_op_rc_courses",
                    "fieldLabel": "OP, RC, FDP, PDP, STTP Attended (Organised by UGC, MoE, AICTE, etc. - 20 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Programme Title, Organizing Institution / HRDC, Duration (From - To), Days",
                    "isRequired": True
                },
                {
                    "fieldName": "fellowships_received",
                    "fieldLabel": "Prestigious Fellowships Received (National / International - 25 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Fellowship Name, Awarding Body, Tenure",
                    "isRequired": False
                },
                {
                    "fieldName": "mooc_completed",
                    "fieldLabel": "MOOC / SWAYAM / NPTEL Completed (10 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Course Title, Platform, Score %, Certificate Type (Elite / Gold)",
                    "isRequired": False
                },
                {
                    "fieldName": "awards_honours",
                    "fieldLabel": "Awards Received (Governmental or Reputed Bodies - 20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Award Title, Conferring Body, Date",
                    "isRequired": False
                },
                {
                    "fieldName": "programmes_abroad",
                    "fieldLabel": "Academic Programmes Attended Abroad (20 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Country, Conference / University, Purpose, Dates",
                    "isRequired": False
                },
                {
                    "fieldName": "proof_enrichment",
                    "fieldLabel": "Upload Certificates / Award Citations / Boarding Passes (PDF)",
                    "fieldType": "FILE",
                    "isRequired": True
                }
            ]
        },
        {
            "title": "PBAS 2025-26: Academic Bodies, Governance & Noteworthy Accomplishments",
            "description": "Category VIII to XI: Academic Bodies (100 Marks), Department Governance (70 Marks), Extension (30 Marks) & Other Noteworthy Accomplishments (50 Marks).",
            "targetRole": "ALL_FACULTY",
            "academicYear": "2025 - 2026",
            "fields": [
                {
                    "fieldName": "governing_body_council",
                    "fieldLabel": "Member of Governing Body / Academic Council (SJC: 20 M, Other Colleges: 20 M)",
                    "fieldType": "TEXT",
                    "placeholder": "Institution Name, Committee, Tenure",
                    "isRequired": False
                },
                {
                    "fieldName": "bos_membership",
                    "fieldLabel": "Member of Board of Studies (Other Universities: 20 M, SJC: 10 M)",
                    "fieldType": "TEXT",
                    "placeholder": "University / College Name, Department, Date of BoS",
                    "isRequired": False
                },
                {
                    "fieldName": "other_bodies_institutions",
                    "fieldLabel": "Member of IQAC, Audit Committee, etc. in Other Institutions (15 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Institution Name, Role, Date",
                    "isRequired": False
                },
                {
                    "fieldName": "professional_bodies",
                    "fieldLabel": "Member of Professional Bodies (IEEE, ACM, RSC, etc. - 15 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Professional Society Name, Membership ID, Grade (Member / Senior Member / Fellow)",
                    "isRequired": False
                },
                {
                    "fieldName": "dept_governance_mqc",
                    "fieldLabel": "In-charge of Department Activities (MQC, Inventory, Labs - 30 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Role (MQC Coordinator / Lab In-charge / Exam Committee), Key Responsibilities handled",
                    "isRequired": True
                },
                {
                    "fieldName": "administrative_responsibilities",
                    "fieldLabel": "College Administrative Responsibilities (Dean, Director, Coordinator - 40 Marks)",
                    "fieldType": "TEXT",
                    "placeholder": "Office held, Specific Institutional Portfolios managed",
                    "isRequired": False
                },
                {
                    "fieldName": "extension_activities",
                    "fieldLabel": "Extension & Community Outreach Activities (SHEPHERD / NSS / NCC - 30 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Village adopted, camp activities, hours, community beneficiaries",
                    "isRequired": True
                },
                {
                    "fieldName": "other_noteworthy_accomplishments",
                    "fieldLabel": "Other Noteworthy Accomplishments Not Mentioned Above (50 Marks)",
                    "fieldType": "TEXTAREA",
                    "placeholder": "Any unique state/national honor, policy contribution, artistic/cultural distinction, or institutional milestone...",
                    "isRequired": False
                },
                {
                    "fieldName": "proof_governance",
                    "fieldLabel": "Upload Appointment Orders / HoD Certificates / BoS Letters (PDF)",
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
        """, (camp_id, camp["title"], camp["description"], camp["targetRole"], camp["academicYear"], deadline_ms, now_ms, now_ms))

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
                now_ms,
                now_ms
            ))

    conn.commit()
    print(f"SUCCESS: Seeded {len(campaigns)} official PBAS campaigns with integer ms timestamps!")
    conn.close()

if __name__ == '__main__':
    run()
