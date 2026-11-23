import openpyxl
import os
import json
import re

# Refined title dictionary for standard attribute metrics based on official Excel templates
OFFICIAL_TITLES = {
    # Part A
    "PART-A": "PART A - Mandatory Institutional Profile of the Department (Cadres, Shifts, Programmes & Strengths)",
    # Attribute I
    "1.1": "1.1 Courses Offered by the Department during the Year (Syllabus Revision & OBE Course Codes)",
    "1.2": "1.2 Value-Added Courses & Certificate Courses with Industry Orientation (> 30 Contact Hours)",
    "1.3": "1.3 Activities Conducted with Reference to Indian Knowledge Systems (IKS)",
    "1.4": "1.4 Industrial Visits, Educational Visits, Field Visits & Field Work",
    "1.5": "1.5 Student Internships & Experiential Learning",
    "1.6": "1.6 Student Projects (Batch / Individual Academic Research Projects)",
    "1.7": "1.7 Apprenticeship Programs with External Industry Partners",
    "1.8": "1.8 Internship / Project Activities Outside the Curriculum",
    "1.9": "1.9 Students Registering / Completing MOOCs (SWAYAM, NPTEL, SWAYAM PLUS)",
    "1.10": "1.10 Parent Teacher Meetings Conducted & Stakeholder Feedback Analysis",
    "1.11": "1.11 Feedback Collected from Stakeholders (Teachers, Alumni, Employers, Students)",
    # Attribute II
    "2.1": "2.1 Faculty Cadre Profile, Shift I & II Details & Appointment Sanction Orders",
    "2.2": "2.2 New Degrees Awarded to Faculty (Ph.D., D.Sc., Post-Doctoral Fellowships)",
    "2.3": "2.3 Faculty Representation as Member in Various Recognized Academic & Audit Bodies (BoS, Council)",
    "2.4": "2.4 Faculty Contribution to Research Journals (Editor, Co-Editor, Editorial Board, Reviewer)",
    "2.5": "2.5 Faculty Membership in Recognized Professional Bodies (ACM, IEEE, CSI, RSC, etc.)",
    "2.6": "2.6 Faculty Activity as Resource Person (Keynote, Invited Speaker, Workshop Chair)",
    "2.7": "2.7 Faculty Development / Training Programmes through Govt. Recognised Bodies (UGC-HRDC FDP, Refresher, Orientation)",
    "2.8": "2.8 Participation in Academic and Professional Development Programmes (Seminars, Conferences, Workshops)",
    "2.9": "2.9 Industrial Training / Social Sector Projects / Corporate Fellowships Attended by Faculty",
    "2.10": "2.10 NET / SET / JRF / Other National Eligibility Examinations Qualified by Faculty in Current Year",
    "2.11": "2.11 Institutional, State, National and International Awards / Honors Received by Faculty",
    "2.12": "2.12 Faculty Registering / Completing MOOCs (SWAYAM, NPTEL, Coursera, edX)",
    "2.13": "2.13 Faculty Going Abroad for Academic Visits, International Fellowships & Collaborations",
    # Attribute III
    "3.1": "3.1 Equipment / Instruments Purchased for Laboratories & High-End Infrastructure Modernization",
    "3.2": "3.2 Department Library (Books & Journals Purchased in 2026-27, Total Department Holdings)",
    # Attribute IV
    "4.1": "4.1 Alumni Association Engagements, Batch Reunions & Alumni Mentorship Sessions",
    "4.2": "4.2 Scholarships / Freeships / Financial Assistance Received by Students (College, Alumni, External)",
    "4.3": "4.3 Capability Enhancement and Development Schemes (Competitive Guidance, Soft Skills, Remedial)",
    "4.4": "4.4 Student Progression to Prestigious Higher Education Programs",
    "4.5": "4.5 Student Placements in Reputed Corporate Houses (Campus & Off-Campus Offers)",
    # Attribute V
    "5.1": "5.1 Innovative Teaching Methodologies Employed by Faculty (Active Learning, ICT Pedagogies)",
    "5.2": "5.2 Assessment Practices & Continuous Internal Assessment (CIA) Employed by Faculty",
    "5.3": "5.3 Remedial Coaching Conducted for Slow Learners (Diagnostic Records & Outcome Analysis)",
    "5.4": "5.4 Advanced Learning Support Provided to Fast Learners (Research Projects, Advanced Clubs)",
    "5.5": "5.5 Industry-Academia Collaboration: Functional MoUs & Institutional Linkages",
    "5.6": "5.6 Four-Quadrant E-Contents Created and Uploaded by Faculty (Video, Text, Quiz, LMS)",
    # Attribute VI
    "6.1": "6.1 Faculty Development Programmes, Conferences, Seminars & Workshops Organized by Department",
    "6.2": "6.2 Guidance for Competitive Examinations (NET, SET, GATE, CAT, UPSC, TNPSC) Organized by Dept",
    "6.3": "6.3 Students Pursuing Additional Degrees / Programmes (Offline, ODL, Online, Blended Mode)",
    "6.4": "6.4 Co-Curricular & Domain Activities Conducted by Department Clubs",
    "6.5": "6.5 Establishment and Active Operations of Student Chapters of Professional Bodies",
    # Attribute VII
    "7.1": "7.1 Grants & Funds Received from Management / External Bodies for Conferences & Courses",
    "7.2": "7.2 Seed Money Received from Management for Patents, Copyrights & Intellectual Property",
    "7.3": "7.3 Seed Money Received from Management for Minor / Major Research Projects",
    "7.4": "7.4 Financial Support Received from Management for Attending Conferences & FDPs",
    # Attribute VIII
    "8.1": "8.1 Students Qualifying in National Competitive Examinations (NET, SET, GATE, CAT, UPSC, JAM)",
    "8.2": "8.2 Students' Participation and Awards in Cultural, Sports and Extra-Curricular Events",
    "8.3": "8.3 Students' Participation and Awards in External Academic Competitions, Hackathons & Tech Fests",
    # Attribute IX
    "9.1": "9.1 Ph.D. Degrees Conferred by Bharathidasan University under Department Research Guides",
    "9.2": "9.2 Ph.D. Theses Formally Submitted by Research Scholars during Current Academic Year",
    "9.3": "9.3 New Research Guides Recognized by Bharathidasan University during Current Academic Year",
    "9.4": "9.4 Ph.D. Research Scholars Enrolment (Full-Time, Part-Time, JRF, SRF Scholars on Roll)",
    "9.5": "9.5 Corporate Consultancy Projects Undertaken & Revenue Generated (₹)",
    "9.6": "9.6 Corporate Training Programmes Delivered & Revenue Generated (₹)",
    "9.7": "9.7 Externally Funded Research Projects Sanctioned by Govt / Non-Govt Agencies",
    "9.8": "9.8 Research Papers Published in Refereed Journals (Scopus, Web of Science, UGC-CARE)",
    "9.9": "9.9 Research Papers Presented in National & International Conferences",
    "9.10": "9.10 Textbooks, Edited Volumes & Book Chapters Published with Valid ISBN",
    "9.11": "9.11 Intellectual Property Rights: Patents, Copyrights & Designs (Applied / Published / Granted)",
    "9.12": "9.12 Active Collaborations with National and International Institutions / Industry",
    "9.13": "9.13 Incubation and Student / Faculty Start-ups through Technology Business Incubator (TBI)",
    # Attribute X
    "10.1": "10.1 Extension Activities, Village Adoption & Social Outreach Programs (SHEPHERD / NSS / CSR)"
}

# Official supportive document requirements from AAA_2026_2027_Instructions.pdf
OFFICIAL_DOCS = {
    "PART-A": "Department Cadre Register, Staff List signed by Principal / HoD, Shift I & II Sanction Orders",
    "1.1": "Copy of the Approved Syllabus, Minutes of the Board of Studies (BoS) Meeting, Academic Council Approval",
    "1.2": "Brochure/Flyer, Course Outline (>30 contact hours), Participants Attendance, Geotagged Photos, Certificates",
    "1.3": "Report of the Activity, Attendance, Geotagged Photos, Reflection on Indian Knowledge Systems",
    "1.4": "Department Permission Letter, Host Industry Acceptance, Geotagged Colour Photos, Student Reflection Reports",
    "1.5": "Internship Allotment Order, Attendance from Place of Internship, Geotagged Photos with Official-in-charge, Completion Certificate",
    "1.6": "Project Master Title List with Guide Allotment, Sample Soft Copy of Project Front Page, Endorsement Sheet",
    "1.7": "Apprenticeship Agreement, Stipend Voucher / Bank Credit Proof, Attendance Records",
    "1.8": "Proof of Outside-Curriculum Project / Internship, Completion Certificate, Industry Letter",
    "1.9": "MOOC Enrollment Proof / SWAYAM / NPTEL Course Completion Certificate",
    "1.10": "Single Consolidated PT Meeting Report, Attendance of Parents with Signatures, Feedback Analysis & Action Taken Report",
    "1.11": "Filled Feedback Forms, Action Taken Report (ATR) signed by HoD, Department Minutes",
    
    "2.1": "Appointment Order, Ph.D. Degree Certificate, NET/SET Pass Certificate, University Guideship Recognition Order",
    "2.2": "Provisional Certificate or Ph.D. / D.Sc. Degree Certificate awarded in 2026-27",
    "2.3": "Official Nomination / Appointment Order as BoS / Academic Council / Audit Inspection Member",
    "2.4": "Journal Editorial Board Page / Reviewer Acknowledgment Letter / Certificate of Reviewing",
    "2.5": "Valid Life / Annual Membership Certificate / ID Card from Professional Body (IEEE, ACM, CSI, etc.)",
    "2.6": "Invitation Letter as Resource Person, Certificate of Appreciation / Honorarium Voucher, Geotagged Photos",
    "2.7": "UGC-HRDC / Govt. Recognised Participation Certificate (Course min 5 Days / 30 Hours, Online / Offline)",
    "2.8": "Certificate of Participation in Academic Conference, Seminar, Workshop, FDP",
    "2.9": "Training Completion Certificate, Management Sponsorship Evidence, Host Industry Letter",
    "2.10": "Official NET / SET / JRF Score Card / Pass Certificate issued during current Academic Year",
    "2.11": "Award Certificate & Citation from Recognized Body, Verification of Level (State/National/International)",
    "2.12": "Completed: MOOC Completion Certificate. Registered: Course Registration Confirmation Receipt",
    "2.13": "Host Institution Invitation Letter, Fellowship Award Letter, Travel Clearance Order, Letter of Appreciation",
    
    "3.1": "Purchase Bill / Invoice, Stock Register Entry Copy, Sanction Approval, Geotagged Photos of Equipment",
    "3.2": "Accession Register Copy, Purchase Bills for 2026-27, Subscription Receipt for Journals / E-resources",
    
    "4.1": "Meeting Minutes with Alumni Signature, Geotagged Photos, Alumni Contribution Voucher / Report",
    "4.2": "Award Letter / Cheque / Bank Statement proof of Scholarship disbursement to students",
    "4.3": "Event Report, Attendance List of Benefitted Students, Resource Person Profile, Feedback",
    "4.4": "Student Admission Letter / University ID Card / Gate Score Card for Higher Studies",
    "4.5": "Formal Offer Letters / Company Selection Mail with Salary Package (CTC) proof",
    
    "5.1": "Implementation Schedule, ICT LMS Screenshots / Google Classroom Logs, Pedagogical Evidence",
    "5.2": "Continuous Internal Assessment (CIA) Question Papers, Rubrics Sheet, Sample Corrected Answer Scripts",
    "5.3": "Diagnostic Test Score Sheet, Attendance Register of Remedial Classes, Outcome Analysis Report",
    "5.4": "Fast Learner Identification Sheet, Mentoring Log, Advanced Project / Hackathon Submission Proof",
    "5.5": "MoU Document Signed by Both Parties on Stamp Paper, Functional Activity Report under MoU",
    "5.6": "Four-Quadrant Module Link, LMS URL, Screen Captures of e-Text, Video Lecture, Quiz, and Reference Material",
    
    "6.1": "Consolidated Event Report: Brochure, HoD Signed Report, Objectives/Outcomes, Geotagged Photos, Feedback, Attendance",
    "6.2": "Coaching Schedule, Student Attendance, Resource Person Profile, Sample Material, Success List",
    "6.3": "Admission Letter / Certificate / University ID Card of Student Pursuing Dual Degree / Diploma",
    "6.4": "Club Activity Report, Participant Attendance, Photos, External Partner Involvement Letter",
    "6.5": "Student Chapter Recognition Letter from Professional Body, List of Student Office Bearers, Activity Log",
    
    "7.1": "Sanction Order / Cheque Copy / Bank Statement from External Funding Agency",
    "7.2": "Management Sanction Order for Patent / Copyright Seed Money, Proof of Fund Transfer",
    "7.3": "Management Research Grant Sanction Letter, Utilization Plan, Progress Milestone",
    "7.4": "Management Financial Support Sanction Letter, Conference Registration Receipt, Attendance Certificate",
    
    "8.1": "Official Score Card / Mark Sheet / Roll Number Proof of NET / SET / GATE / CAT / UPSC",
    "8.2": "Certificate of Merit / Participation, Prize Trophy Photo, Verification Letter from Organizing Institution",
    "8.3": "Competition Winner Certificate, Hackathon Submission Proof, Participation ID",
    
    "9.1": "Ph.D. Degree Certificate or Official Provisional Certificate issued by Bharathidasan University",
    "9.2": "University Synopsis / Thesis Submission Fee Receipt and Acknowledgement Letter with Ref. No.",
    "9.3": "Official Guideship Recognition Order issued by Registrar, Bharathidasan University",
    "9.4": "University Enrolment Communication, Joining Report, Fellow Award Letter (for JRF / SRF)",
    "9.5": "Client Work Order / Consultancy Agreement, Department Acceptance Letter, Bank Credit Proof / Receipt Voucher",
    "9.6": "Corporate Training Proposal & Agreement, Client Feedback, Payment Receipt Voucher",
    "9.7": "Official Grant Sanction Letter from Govt/Industry, First Page of Approved Proposal with Budget Outlay",
    "9.8": "First Page of Published Paper showing Author Affiliation (St. Joseph's College) and Scopus/WoS Indexing Proof",
    "9.9": "Full Conference Proceeding Copy / Certificate of Paper Presentation, Conference Schedule",
    "9.10": "Front Cover, Copyright Page showing ISBN, Publisher Details, and Table of Contents",
    "9.11": "Official Patent Office Journal Publication Page / Grant Certificate / Trademark Registration Copy",
    "9.12": "Collaboration Agreement on Institutional Letterhead, Joint Research Output / Activity Report",
    "9.13": "TBI Incubation Agreement, Company Incorporation Certificate (MCA), Mentorship Agreement",
    
    "10.1": "SHEPHERD / Outreach Camp Report, Village Panchayat Endorsement, Geotagged Colour Photos, Student Attendance"
}

# Instructions from PDF
OFFICIAL_INSTRUCTIONS = {
    "PART-A": "Presenting data on all questions in Part A is mandatory for every department before peer audit.",
    "1.1": "Reconcile course codes with approved college catalogue. Mention YES if introduced in new syllabus.",
    "1.2": "Courses with 30 or more contact hours conducted beyond class hours. Exclude regular curriculum courses.",
    "1.3": "Include activities specifically referencing Indian Knowledge Systems (IKS) in curriculum or field visits.",
    "1.4": "Student reflection report and geo-tagged photographs in colour with captions are mandatory.",
    "1.5": "Minimum 15-day internship. Geo-tagged photo with official-in-charge at place of internship is compulsory.",
    "1.6": "Individual or batch projects. Submit consolidated student-guide list with project titles.",
    "1.7": "Apprenticeships embedded in industry or vocational frameworks with verifiable attendance.",
    "1.8": "Extracurricular internships done during vacations or semester breaks with completion certificate.",
    "1.9": "SWAYAM / NPTEL registration or completion within reporting academic year 2026-2027.",
    "1.10": "If department conducts PT meeting for multiple classes, submit one consolidated report with ATR.",
    "1.11": "Collect feedback across all 4 stakeholder groups (Students, Alumni, Teachers, Employers) with ATR.",
    
    "2.1": "Arrange faculty list strictly in institutional seniority order. Include Aided and Management staff.",
    "2.2": "Degree must be formally awarded between June 2026 and February 2027.",
    "2.3": "External academic or administrative audits, BoS member, Academic Council expert appointments.",
    "2.4": "Must be recognized peer-reviewed indexed journal. Mention ISSN and publisher details.",
    "2.5": "National or International professional bodies. Mention membership grade (Member, Senior Member, Fellow).",
    "2.6": "Include keynote addresses, invited lectures, session chair roles at recognized seminars or conferences.",
    "2.7": "Include only programmes organized by UGC-HRDC, PMMMNMTT, AICTE, or government-recognized bodies (min 5 days).",
    "2.8": "Seminars, workshops, webinars, and training outside 2.7. Attach participant certificate.",
    "2.9": "Industrial sabbaticals, social projects, or corporate fellowships with completion letters.",
    "2.10": "Ensure qualifying date falls within academic year 2026-2027.",
    "2.11": "Awards received from recognized academic, government, or NGO agencies. Categorize award level accurately.",
    "2.12": "MOOC courses registered or completed by faculty on SWAYAM/NPTEL, Coursera, or edX.",
    "2.13": "Foreign university visits for research, paper presentation, or academic fellowship.",
    
    "3.1": "Attach copy of purchase invoice, stock ledger page, and geo-tagged photos of laboratory setup.",
    "3.2": "Books and journals added to department library during 2026-2027 academic year.",
    
    "4.1": "Alumni meetings, guest talks by alumni, and department alumni chapters.",
    "4.2": "Include college freeships, management scholarships, and external private/govt scholarships.",
    "4.3": "Soft skills training, communication coaching, and personality enhancement workshops.",
    "4.4": "Students progressing to PG, Ph.D., or higher professional studies in reputed institutions.",
    "4.5": "Campus placements through college placement cell or verified off-campus appointments.",
    
    "5.1": "Report teaching methodologies actually deployed in classroom (Flipped, Problem-based, ICT).",
    "5.2": "Innovative CIA evaluation, rubric-based evaluation, and diagnostic assessment tests.",
    "5.3": "Remedial coaching for slow learners. Maintain attendance register and improvement records.",
    "5.4": "Advanced mentoring for fast learners: research papers, competitions, and honours projects.",
    "5.5": "Active MoUs with verifiable collaborative activities undertaken during 2026-2027.",
    "5.6": "Four-quadrant digital e-content modules created by faculty (e-Text, Video, Web Links, Self-Assessment).",
    
    "6.1": "One consolidated report per event: Brochure + HoD Report + Objectives/Outcomes + Geotagged Photos + Attendance + Feedback.",
    "6.2": "Guidance sessions for competitive exams. Maintain attendance and topic schedule.",
    "6.3": "Students pursuing diploma or certificate alongside their regular degree.",
    "6.4": "Department club activities, symposiums, technical festivals, and domain exhibitions.",
    "6.5": "Student branch of professional bodies (ACM, IEEE, CSI, etc.) with verified roster.",
    
    "7.1": "Non-government grants received to organize conferences, workshops, or academic events.",
    "7.2": "Seed money sanctioned by management specifically for patent drafting, filing, or copyright.",
    "7.3": "Seed money sanctioned by management for faculty research projects.",
    "7.4": "Financial support from management to attend conferences, workshops, or FDPs.",
    
    "8.1": "Students clearing national competitive exams during 2026-2027.",
    "8.2": "Awards in cultural, fine arts, sports, and athletic tournaments at State/National level.",
    "8.3": "Student prizes in inter-college hackathons, paper presentations, and business quizzes.",
    
    "9.1": "Ph.D. provisional certificate or degree certificate issued by Bharathidasan University.",
    "9.2": "Thesis formally submitted with University registration number and fee receipt.",
    "9.3": "Guideship recognition communication order issued by University Registrar.",
    "9.4": "Ph.D. scholars currently enrolled (Full-Time / Part-Time / JRF / SRF).",
    "9.5": "Consultancy projects undertaken for industry/government with revenue credit proof.",
    "9.6": "Corporate training provided to corporate houses or government bodies with fee receipt.",
    "9.7": "Extramural research projects funded by UGC, DST, DBT, CSIR, ICSSR, or private industry.",
    "9.8": "Paper must bear faculty name with St. Joseph's College institutional affiliation.",
    "9.9": "Papers presented in national or international conferences with proceedings.",
    "9.10": "Books or book chapters with valid ISBN published during 2026-2027.",
    "9.11": "Patents published, granted, or commercialized with official Patent Office journal page.",
    "9.12": "Collaborations with external universities or industries leading to academic outcomes.",
    "9.13": "Start-ups incubated through Technology Business Incubator (TBI) with incorporation proof.",
    
    "10.1": "Social extension activities conducted under SHEPHERD or NSS with village community involvement."
}

attr_categories = [
    ("part_a", "PART A - Department Profile", "Institutional Governance", ["PART-A"]),
    ("att1", "Attribute I - Curriculum Design & Development", "Criterion 1: Curricular Aspects", [f"1.{i}" for i in range(1, 12)]),
    ("att2", "Attribute II - Faculty Resources & Development", "Criterion 2: Teaching-Learning & Evaluation", [f"2.{i}" for i in range(1, 14)]),
    ("att3", "Attribute III - Infrastructure & Learning Resources", "Criterion 4: Infrastructure & Learning Resources", ["3.1", "3.2"]),
    ("att4", "Attribute IV - Student Support & Progression", "Criterion 5: Student Support & Progression", [f"4.{i}" for i in range(1, 6)]),
    ("att5", "Attribute V - Teaching-Learning Methodologies & Innovations", "Criterion 2: Teaching-Learning & Evaluation", [f"5.{i}" for i in range(1, 7)]),
    ("att6", "Attribute VI - Extended Curricular Engagements & Student Chapters", "Criterion 5 & 6: Student Activities", [f"6.{i}" for i in range(1, 6)]),
    ("att7", "Attribute VII - Management Support & Institutional Grants", "Criterion 6: Governance, Leadership & Management", [f"7.{i}" for i in range(1, 5)]),
    ("att8", "Attribute VIII - Student Competitions, Awards & Cultural/Sports", "Criterion 5: Student Support & Progression", ["8.1", "8.2", "8.3"]),
    ("att9", "Attribute IX - Research and Innovation Outcomes", "Criterion 3: Research, Innovations & Extension", [f"9.{i}" for i in range(1, 14)]),
    ("att10", "Attribute X - Social Outreach & Extension Activities", "Criterion 3: Research, Innovations & Extension", ["10.1"])
]

complete_metric_bank = []

for attr_id, attr_name, naac_crit, codes in attr_categories:
    for code in codes:
        title = OFFICIAL_TITLES.get(code, f"Metric {code}")
        docs = OFFICIAL_DOCS.get(code, "Consolidated Report, Geo-tagged Photos, Approval Order & Participant Attendance")
        inst = OFFICIAL_INSTRUCTIONS.get(code, "Strictly follow the 1-entry-1-evidence principle; upload scanned color PDF in portrait mode.")
        
        # Determine weight & appraisal linking
        weight = 5
        is_mand = True
        appraisal = False
        target = "Verified Department Records"
        metric_type = "table"
        
        if code in ["1.1", "1.5", "1.6", "2.1", "2.7", "5.1", "5.6", "9.1", "9.7", "9.8"]:
            weight = 10
            appraisal = True
        elif code in ["2.4", "2.6", "2.11", "7.1", "7.2", "7.3", "9.5", "9.6", "9.10", "9.11", "10.1"]:
            weight = 5
            appraisal = True
        
        if code in ["9.5", "9.6", "9.7", "7.1", "7.2", "7.3", "7.4"]:
            metric_type = "currency"
        elif code in ["4.4", "4.5"]:
            metric_type = "percentage"
        elif code in ["2.10", "8.1", "9.1", "9.11"]:
            metric_type = "numeric"
        
        if code == "1.1": target = "≥ 20% Syllabus Revision in Current Cycle"
        elif code == "1.2": target = "≥ 2 Value Added Courses per Shift"
        elif code == "1.5": target = "100% Final Year Internships"
        elif code == "2.1": target = "100% Course Plans Cleared by HOD"
        elif code == "2.4": target = "≥ 2 Journal Review / Editorial Seats"
        elif code == "2.6": target = "≥ 1 Session as External Resource Person"
        elif code == "2.7": target = "≥ 1 FDP / Refresher Course (min 5 Days)"
        elif code == "2.10": target = "NET / SET / Ph.D. Qualified"
        elif code == "5.1": target = "≥ 3 ICT Pedagogies & Smart Class Modules"
        elif code == "5.6": target = "≥ 1 Four-Quadrant E-Content Module Created"
        elif code in ["7.2", "7.3"]: target = "Seed Money Granted by Management"
        elif code == "9.1": target = "≥ 1 Ph.D. Conferred per Department"
        elif code == "9.5": target = "≥ ₹25,000 Corporate Consultancy Revenue"
        elif code == "9.7": target = "≥ ₹1,00,000 Extramural Research Grants"
        elif code == "9.8": target = "≥ 2 Scopus / WoS / UGC-CARE Papers per Faculty"
        elif code == "9.10": target = "≥ 1 Book / Chapter with Valid ISBN"
        elif code == "9.11": target = "≥ 1 Patent Published / Granted / Commercialized"
        elif code == "10.1": target = "≥ 2 Active Outreach Camps & MoU Activities"
        
        complete_metric_bank.append({
            "id": f"aaa_m_{code.replace('.', '_').replace('-', '_').lower()}",
            "attributeId": attr_id,
            "attributeName": attr_name,
            "metricCode": code,
            "metricTitle": title,
            "benchmark": target,
            "metricType": metric_type,
            "weightage": weight,
            "naacCriterion": naac_crit,
            "isMandatory": is_mand,
            "convertedToAppraisal": appraisal,
            "supportiveDocuments": docs,
            "instructions": inst,
            "status": "active"
        })

print(f"Total structured AAA metrics generated: {len(complete_metric_bank)}")
with open("complete_official_aaa_metrics.json", "w", encoding="utf-8") as f:
    json.dump(complete_metric_bank, f, indent=2)

print("Saved complete_official_aaa_metrics.json successfully!")
