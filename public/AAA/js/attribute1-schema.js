// IQAC AAA February 2027 - Attribute 1 Questionnaire & Sheet Schema
// Extracted 1:1 from Templates_AAA_2026-2027/AAA_February 2027_Attribute 1/AAA_February 2027_Attribute I_Template.xlsx

window.DEFAULT_ATTRIBUTE1_SCHEMA = [
  {
    "key": "PART-A",
    "sheetName": "PART-A",
    "title": "PART A - PROFILE OF THE DEPARTMENT",
    "subtitle": "(Presenting Data on all the questions in Part A is mandatory)",
    "type": "profile",
    "profileQuestions": {
      "department": "PG & Research Department of Computer Science",
      "shift": "Shift I & Shift II",
      "programmes": {
        "ug": "B.Sc. Computer Science",
        "pg": "M.Sc. Computer Science, MCA",
        "phd": "Ph.D. Computer Science"
      },
      "hodName": "Dr. S. Albert Rabara"
    },
    "facultyDetails": {
      "headers": [
        "Faculty Category / Cadre",
        "Male",
        "Female"
      ],
      "rows": [
        {
          "label": "Total No. of Teaching Faculty",
          "male": 18,
          "female": 12
        },
        {
          "label": "No. of Faculty (Aided)",
          "male": 8,
          "female": 4
        },
        {
          "label": "No. of Faculty (Coordinator-Appointed)",
          "male": 4,
          "female": 3
        },
        {
          "label": "No. of Faculty (Secretary-Appointed)",
          "male": 5,
          "female": 4
        },
        {
          "label": "No. of Professor of Practice",
          "male": 1,
          "female": 0
        },
        {
          "label": "No. of Faculty (Hourly Basis)",
          "male": 0,
          "female": 1
        },
        {
          "label": "No. of Faculty from Other States",
          "male": 1,
          "female": 1
        },
        {
          "label": "No. of Faculty Graduating from Other States",
          "male": 2,
          "female": 1
        },
        {
          "label": "No. of Academic Support Staff (Technical) and Non-teaching Staff",
          "male": 4,
          "female": 2
        }
      ]
    },
    "studentDetails": {
      "headers": [
        "Programme Level",
        "Male",
        "Female",
        "Other Gender",
        "Other States",
        "Other Countries"
      ],
      "rows": [
        {
          "programme": "UG",
          "male": 160,
          "female": 120,
          "otherGender": 0,
          "otherStates": 4,
          "otherCountries": 2
        },
        {
          "programme": "PG",
          "male": 55,
          "female": 45,
          "otherGender": 0,
          "otherStates": 2,
          "otherCountries": 1
        },
        {
          "programme": "PhD",
          "male": 14,
          "female": 10,
          "otherGender": 0,
          "otherStates": 1,
          "otherCountries": 0
        }
      ]
    }
  },
  {
    "key": "1.1",
    "sheetName": "1.1",
    "title": "1.1 Courses offered by the Department during the year 2026-27",
    "badge": "Part B - Attribute I: Curriculum Design",
    "instruction": "Mention all the Courses offered by the Department during the year 2026-2027",
    "note": "No need to fill this Data for this Academic Year",
    "type": "table",
    "columns": [
      {
        "key": "sno",
        "label": "S.No.",
        "width": "w-14"
      },
      {
        "key": "programmeName",
        "label": "Programme Name (Commerce CA, History, etc.,)",
        "width": "w-48"
      },
      {
        "key": "level",
        "label": "PG / UG (MSc, BA, BSc, BCom, etc.,)",
        "width": "w-36"
      },
      {
        "key": "courseCode",
        "label": "Course Code",
        "width": "w-32"
      },
      {
        "key": "courseTitle",
        "label": "Title of the Course",
        "width": "w-64"
      },
      {
        "key": "newSyllabus",
        "label": "Mention YES if it is introduced in the new syllabus",
        "width": "w-36"
      },
      {
        "key": "revisionPct",
        "label": "Percentage (%) of the revision",
        "width": "w-28"
      },
      {
        "key": "skillPractical",
        "label": "Skill / Practical Hands on Training (Mention Yes if applicable)",
        "width": "w-36"
      },
      {
        "key": "iksBased",
        "label": "IKS Based (Mention Yes if applicable)",
        "width": "w-28"
      },
      {
        "key": "nsqfAligned",
        "label": "Aligned with NSQF / NHEQF (Mention Yes if applicable)",
        "width": "w-32"
      },
      {
        "key": "fieldWorkVisit",
        "label": "Field Work/Field Visit/Industrial Visit (Mention Yes if applicable)",
        "width": "w-36"
      },
      {
        "key": "internship",
        "label": "Internship (Mention Yes if applicable)",
        "width": "w-28"
      },
      {
        "key": "project",
        "label": "Project (Mention Yes if applicable)",
        "width": "w-28"
      }
    ],
    "rows": []
  },
  {
    "key": "1.2",
    "sheetName": "1.2",
    "title": "1.2 Value-Added Courses & Certificate Courses",
    "badge": "Attribute I - Section 1.2",
    "type": "multi_table",
    "sections": [
      {
        "id": "1.2_a",
        "title": "1.2 (a) Value-Added Courses / Certificate Course Conducted by SJC",
        "columns": [
          {
            "key": "sno",
            "label": "S.No.",
            "width": "w-14"
          },
          {
            "key": "nature",
            "label": "Nature of the Course (VAC / CC)",
            "width": "w-28"
          },
          {
            "key": "collaboratingAgency",
            "label": "Collaborating institutions/Agency, Name and Address",
            "width": "w-64"
          },
          {
            "key": "courseCode",
            "label": "Course Code",
            "width": "w-28"
          },
          {
            "key": "courseTitle",
            "label": "Title of the Course",
            "width": "w-56"
          },
          {
            "key": "creditsAssigned",
            "label": "Credits Assigned (For Certificate Course)",
            "width": "w-28"
          },
          {
            "key": "coordinatorName",
            "label": "Name of the Course Coordinator",
            "width": "w-44"
          },
          {
            "key": "mode",
            "label": "Mode (Online / Offline / Blended)",
            "width": "w-32"
          },
          {
            "key": "iksBased",
            "label": "Course conducted based on IKS (Mention YES/NO)",
            "width": "w-32"
          },
          {
            "key": "focus",
            "label": "Focus (Mention SKILL, KNOWLEDGE, BOTH)",
            "width": "w-36"
          },
          {
            "key": "multidisciplinary",
            "label": "Multidisciplinary (Mention YES/NO)",
            "width": "w-32"
          },
          {
            "key": "durationHours",
            "label": "Duration of the Course (in hrs)",
            "width": "w-28"
          },
          {
            "key": "datesFromTo",
            "label": "Dates conducted From - To (DD.MM.YYYY)",
            "width": "w-40"
          },
          {
            "key": "industryCollab",
            "label": "Industry Collaboration (Mention YES/NO)",
            "width": "w-32"
          },
          {
            "key": "staffOrExperts",
            "label": "Staff Members / External Experts Handling the Course",
            "width": "w-72"
          },
          {
            "key": "enrolled",
            "label": "No. of Students Enrolled",
            "width": "w-28"
          },
          {
            "key": "completed",
            "label": "No. of Students Completing the Course",
            "width": "w-28"
          }
        ],
        "rows": [
          {
            "sno": "1",
            "nature": "VAC",
            "collaboratingAgency": "Not Applicable",
            "courseCode": "VAC-CS01",
            "courseTitle": "Digital Literacy and Productivity Tools",
            "creditsAssigned": "0",
            "coordinatorName": "Dr. A. Vimal Jerald",
            "mode": "Blended",
            "iksBased": "No",
            "focus": "Skill",
            "multidisciplinary": "Yes",
            "durationHours": "30",
            "datesFromTo": "01.07.2026 – 15.07.2026",
            "industryCollab": "No",
            "staffOrExperts": "Dr. A. Vimal Jerald, Assistant Professor, Department of Computer Science, St. Joseph’s College (Autonomous), Tiruchirappalli – 620002",
            "enrolled": "80",
            "completed": "75"
          },
          {
            "sno": "2",
            "nature": "CC",
            "collaboratingAgency": "Not Applicable",
            "courseCode": "CC-AI01",
            "courseTitle": "Artificial Intelligence and Generative AI",
            "creditsAssigned": "2",
            "coordinatorName": "Dr. R. Lenin",
            "mode": "Offline",
            "iksBased": "No",
            "focus": "Both",
            "multidisciplinary": "Yes",
            "durationHours": "40",
            "datesFromTo": "15.07.2026 – 30.07.2026",
            "industryCollab": "Yes",
            "staffOrExperts": "Dr. R. Lenin, Associate Professor, Department of Computer Science, St. Joseph’s College (Autonomous), Tiruchirappalli – 620002; Mr. Arun Kumar, Senior AI Engineer, ABC Technologies Pvt. Ltd., 25 Anna Salai, Chennai – 600002",
            "enrolled": "60",
            "completed": "55"
          },
          {
            "sno": "3",
            "nature": "CC",
            "collaboratingAgency": "ABC Technologies Pvt. Ltd., 25 Anna Salai, Chennai – 600002, Tamil Nadu",
            "courseCode": "CC-FS01",
            "courseTitle": "Full Stack Web Development",
            "creditsAssigned": "3",
            "coordinatorName": "Mr. G. Novin Senetra Roy",
            "mode": "Blended",
            "iksBased": "No",
            "focus": "Skill",
            "multidisciplinary": "Yes",
            "durationHours": "60",
            "datesFromTo": "01.08.2026 – 20.08.2026",
            "industryCollab": "Yes",
            "staffOrExperts": "Mr. G. Novin Senetra Roy, Assistant Professor, Department of Computer Science, St. Joseph’s College (Autonomous); Ms. Priya Joseph, Senior Software Developer, ABC Technologies Pvt. Ltd.",
            "enrolled": "50",
            "completed": "45"
          },
          {
            "sno": "4",
            "nature": "VAC",
            "collaboratingAgency": "Not Applicable",
            "courseCode": "VAC-IKS01",
            "courseTitle": "Indian Knowledge Systems and Sustainable Living",
            "creditsAssigned": "0",
            "coordinatorName": "Dr. S. Thulasi Bharathi",
            "mode": "Offline",
            "iksBased": "Yes",
            "focus": "Knowledge",
            "multidisciplinary": "Yes",
            "durationHours": "20",
            "datesFromTo": "05.08.2026 – 12.08.2026",
            "industryCollab": "No",
            "staffOrExperts": "Dr. S. Thulasi Bharathi, Assistant Professor, Department of Commerce, St. Joseph’s College (Autonomous), Tiruchirappalli – 620002",
            "enrolled": "100",
            "completed": "96"
          }
        ]
      },
      {
        "id": "1.2_b",
        "title": "1.2 (b) Students Attending Certificate Courses Offered by Other Agencies/Industries (Do not include MOOC)",
        "columns": [
          {
            "key": "sno",
            "label": "S.No.",
            "width": "w-14"
          },
          {
            "key": "regNo",
            "label": "Register Number",
            "width": "w-32"
          },
          {
            "key": "studentName",
            "label": "Name of the Student",
            "width": "w-44"
          },
          {
            "key": "courseTitle",
            "label": "Title of the Certificate Course",
            "width": "w-56"
          },
          {
            "key": "agencyDetails",
            "label": "Name and Address of the Agency offering the Course",
            "width": "w-64"
          },
          {
            "key": "mode",
            "label": "Mode (Online / Offline / Blended)",
            "width": "w-32"
          },
          {
            "key": "datesFromTo",
            "label": "Dates conducted FROM-TO",
            "width": "w-40"
          },
          {
            "key": "credits",
            "label": "Credits from Recognized Body / Agency, if any",
            "width": "w-32"
          }
        ],
        "rows": [
          {
            "sno": "1",
            "regNo": "26UCS101",
            "studentName": "Arun Kumar",
            "courseTitle": "Certificate Course in Full Stack Web Development",
            "agencyDetails": "ABC Technologies Pvt. Ltd., 25 Anna Salai, Chennai – 600002, Tamil Nadu",
            "mode": "Offline",
            "datesFromTo": "01.07.2026 – 15.07.2026",
            "credits": "2"
          },
          {
            "sno": "2",
            "regNo": "26UCS115",
            "studentName": "Priya Joseph",
            "courseTitle": "Certificate Course in Data Analytics",
            "agencyDetails": "XYZ Analytics Solutions, 18 MG Road, Bengaluru – 560001, Karnataka",
            "mode": "Blended",
            "datesFromTo": "10.07.2026 – 25.07.2026",
            "credits": "3"
          }
        ]
      }
    ]
  },
  {
    "key": "1.3",
    "sheetName": "1.3",
    "title": "1.3 Activities conducted with reference to IKS",
    "badge": "Attribute I - Section 1.3",
    "type": "table",
    "columns": [
      {
        "key": "sno",
        "label": "S.No",
        "width": "w-14"
      },
      {
        "key": "title",
        "label": "Title of the Programme",
        "width": "w-60"
      },
      {
        "key": "nature",
        "label": "Nature of Programme (Workshop, Seminar, Field Visit, Industry Visit, Guest Lectures, etc.,)",
        "width": "w-52"
      },
      {
        "key": "relevance",
        "label": "Academic/Course Relevance",
        "width": "w-44"
      },
      {
        "key": "date",
        "label": "Date",
        "width": "w-28"
      },
      {
        "key": "placeVisited",
        "label": "Name and Address of Place Visited (In case of FV/IV)",
        "width": "w-52"
      },
      {
        "key": "resourcePerson",
        "label": "Name, Designation of Resource Person",
        "width": "w-56"
      },
      {
        "key": "studentsBenefitted",
        "label": "No. of Student Benefitted",
        "width": "w-28"
      },
      {
        "key": "facultyBenefitted",
        "label": "No. of Faculty Benefitted",
        "width": "w-28"
      }
    ],
    "rows": [
      {
        "sno": "1",
        "title": "Traditional Knowledge Systems in Sustainable Agriculture",
        "nature": "Seminar",
        "relevance": "25PCA1CC01-Industrial IoT",
        "date": "22.09.2025",
        "placeVisited": "NIL",
        "resourcePerson": "Dr. R. Anitha, Associate Professor of Botany, ABC College, Tiruchirappalli",
        "studentsBenefitted": "25",
        "facultyBenefitted": "5"
      }
    ]
  },
  {
    "key": "1.4",
    "sheetName": "1.4",
    "title": "1.4 Industrial Visit, Educational Visit, Field Visit, Field Work, etc",
    "badge": "Attribute I - Section 1.4",
    "instruction": "Don't include if mentioned in 1.3",
    "type": "table",
    "columns": [
      {
        "key": "sno",
        "label": "S.No.",
        "width": "w-14"
      },
      {
        "key": "nature",
        "label": "Nature (Industrial Visit / Educational Visit / Field Visit / Field Work)",
        "width": "w-48"
      },
      {
        "key": "placeDetails",
        "label": "Details of Industry / Institution / Places Visited",
        "width": "w-60"
      },
      {
        "key": "relevance",
        "label": "Academic/Course Relevance",
        "width": "w-40"
      },
      {
        "key": "staffAccompanying",
        "label": "Name of the Staff Accompanying the Students",
        "width": "w-52"
      },
      {
        "key": "datesFromTo",
        "label": "Date From – To DD.MM.YYYY",
        "width": "w-36"
      },
      {
        "key": "durationDays",
        "label": "Duration (Days)",
        "width": "w-28"
      },
      {
        "key": "mouLinkage",
        "label": "Part of the MoU/Linkage",
        "width": "w-32"
      },
      {
        "key": "learningOutcome",
        "label": "Learning Outcome",
        "width": "w-52"
      },
      {
        "key": "targetGroup",
        "label": "Target Group",
        "width": "w-40"
      },
      {
        "key": "studentsBenefitted",
        "label": "Students Benefitted",
        "width": "w-28"
      }
    ],
    "rows": [
      {
        "sno": "1",
        "nature": "Industrial Visit",
        "placeDetails": "Systech Hardware & Networking Academy Pvt. Ltd., Tiruchirappalli, Tamil Nadu",
        "relevance": "25UCS4CC05-Internship",
        "staffAccompanying": "Dr. J. Antony John Prabu & Dr. K. Subash",
        "datesFromTo": "30.08.2025",
        "durationDays": "0.5",
        "mouLinkage": "MoU",
        "learningOutcome": "Enhanced Industry Awareness, Practical Learning Impact, Career Motivation",
        "targetGroup": "III BSc Computer Science 'A'",
        "studentsBenefitted": "60"
      }
    ]
  },
  {
    "key": "1.5",
    "sheetName": "1.5",
    "title": "1.5 Internship",
    "badge": "Attribute I - Section 1.5",
    "type": "batch_table",
    "columns": [
      {
        "key": "sno",
        "label": "S.No.",
        "width": "w-14"
      },
      {
        "key": "studentName",
        "label": "Name of the Student",
        "width": "w-40"
      },
      {
        "key": "regNo",
        "label": "Reg. No.",
        "width": "w-28"
      },
      {
        "key": "internshipTitle",
        "label": "Title of the Internship",
        "width": "w-44"
      },
      {
        "key": "organizationDetails",
        "label": "Name and Address of the Organization",
        "width": "w-56"
      },
      {
        "key": "placeNature",
        "label": "Nature of Place (Industry / Company / Institution, etc.)",
        "width": "w-40"
      },
      {
        "key": "durationDays",
        "label": "Duration (No. of Days)",
        "width": "w-28"
      },
      {
        "key": "datesFromTo",
        "label": "Dates FROM-TO DD.MM.YYYY - DD.MM.YYYY",
        "width": "w-40"
      },
      {
        "key": "staffInCharge",
        "label": "Name of the Staff in charge",
        "width": "w-40"
      },
      {
        "key": "sdgGoal",
        "label": "SDG Goal with Title",
        "width": "w-48"
      },
      {
        "key": "mouLinkage",
        "label": "Part of the MoU/Linkage",
        "width": "w-32"
      },
      {
        "key": "iksBased",
        "label": "Was the Internship based on IKS ? (Mention Yes/No)",
        "width": "w-36"
      }
    ],
    "batches": [
      {
        "id": "ug_batch",
        "name": "(2024 UG Batch)",
        "rows": [
          {
            "sno": "1",
            "studentName": "Kishore Ignatius R",
            "regNo": "24UCS604",
            "internshipTitle": "Data Analytics",
            "organizationDetails": "We Touch Technologies Pvt. Ltd., No. 45, IT Park, Coimbatore",
            "placeNature": "Industry",
            "durationDays": "30",
            "datesFromTo": "02.05.2026 - 03.06.2026",
            "staffInCharge": "Ms. I. Reshma Monica",
            "sdgGoal": "GOAL 8: Decent Work and Economic Growth",
            "mouLinkage": "MoU",
            "iksBased": "No"
          }
        ]
      },
      {
        "id": "pg_batch",
        "name": "(2025 PG Batch)",
        "rows": []
      }
    ]
  },
  {
    "key": "1.6",
    "sheetName": "1.6",
    "title": "1.6 Project",
    "badge": "Attribute I - Section 1.6",
    "type": "batch_table",
    "columns": [
      {
        "key": "sno",
        "label": "S.No.",
        "width": "w-14"
      },
      {
        "key": "studentName",
        "label": "Name of the Student",
        "width": "w-40"
      },
      {
        "key": "regNo",
        "label": "Reg. No.",
        "width": "w-28"
      },
      {
        "key": "projectTitle",
        "label": "Title of the Project",
        "width": "w-44"
      },
      {
        "key": "organizationDetails",
        "label": "Name and Address of the Organization",
        "width": "w-56"
      },
      {
        "key": "placeNature",
        "label": "Nature of Place (Industry / Company / Institution)",
        "width": "w-40"
      },
      {
        "key": "durationDays",
        "label": "Duration (No. of Days)",
        "width": "w-28"
      },
      {
        "key": "datesFromTo",
        "label": "Dates FROM-TO DD.MM.YYYY - DD.MM.YYYY",
        "width": "w-40"
      },
      {
        "key": "staffInCharge",
        "label": "Name of the Staff in charge",
        "width": "w-40"
      },
      {
        "key": "sdgGoal",
        "label": "SDG Goal with Title",
        "width": "w-48"
      },
      {
        "key": "mouLinkage",
        "label": "Part of the MoU/Linkage",
        "width": "w-32"
      },
      {
        "key": "iksBased",
        "label": "Was the Project based on IKS ? (Mention Yes/No)",
        "width": "w-36"
      }
    ],
    "batches": [
      {
        "id": "ug_batch",
        "name": "(2024 UG Batch)",
        "rows": [
          {
            "sno": "1",
            "studentName": "Santhosh S",
            "regNo": "24UCS101",
            "projectTitle": "Web Application Development",
            "organizationDetails": "Tech Solutions Pvt. Ltd., No. 45, IT Park, Coimbatore",
            "placeNature": "Industry",
            "durationDays": "30",
            "datesFromTo": "01.12.2025-30.12.2025",
            "staffInCharge": "Dr. V. Jude Nirmal",
            "sdgGoal": "GOAL 8: Decent Work and Economic Growth",
            "mouLinkage": "Linkage",
            "iksBased": "NO"
          }
        ]
      },
      {
        "id": "pg_batch",
        "name": "(2025 PG Batch)",
        "rows": []
      }
    ]
  },
  {
    "key": "1.7",
    "sheetName": "1.7",
    "title": "1.7 Apprenticeship",
    "badge": "Attribute I - Section 1.7",
    "type": "table",
    "columns": [
      {
        "key": "sno",
        "label": "S.No.",
        "width": "w-14"
      },
      {
        "key": "studentName",
        "label": "Name of the Student",
        "width": "w-44"
      },
      {
        "key": "regNo",
        "label": "Reg. No.",
        "width": "w-28"
      },
      {
        "key": "apprenticeshipTitle",
        "label": "Title of the Apprenticeship",
        "width": "w-52"
      },
      {
        "key": "organizationDetails",
        "label": "Name and Address of the Organization",
        "width": "w-60"
      },
      {
        "key": "durationDays",
        "label": "Duration (No of Days)",
        "width": "w-28"
      },
      {
        "key": "datesFromTo",
        "label": "Date From - To",
        "width": "w-36"
      },
      {
        "key": "status",
        "label": "Status (Completed/Ongoing)",
        "width": "w-32"
      },
      {
        "key": "stipend",
        "label": "Stipend (if applicable)",
        "width": "w-32"
      }
    ],
    "rows": [
      {
        "sno": "1",
        "studentName": "Thomas A",
        "regNo": "25UCS101",
        "apprenticeshipTitle": "Full Stack Development",
        "organizationDetails": "Tech Solutions Pvt. Ltd., No. 45, IT Park, Coimbatore",
        "durationDays": "180",
        "datesFromTo": "01.01.2025-30.06.2025",
        "status": "Ongoing",
        "stipend": "Rs. 4000"
      }
    ]
  },
  {
    "key": "1.8",
    "sheetName": "1.8",
    "title": "1.8 INTERNSHIP / PROJECT ACTIVITY OUTSIDE THE CURRICULUM",
    "badge": "Attribute I - Section 1.8",
    "type": "table",
    "columns": [
      {
        "key": "sno",
        "label": "Sl. No",
        "width": "w-14"
      },
      {
        "key": "className",
        "label": "Class",
        "width": "w-36"
      },
      {
        "key": "regNo",
        "label": "Reg. No. of the Student",
        "width": "w-32"
      },
      {
        "key": "studentName",
        "label": "Name of the Student",
        "width": "w-44"
      },
      {
        "key": "activityType",
        "label": "Internship / Project",
        "width": "w-48"
      },
      {
        "key": "agencyDetails",
        "label": "Name and Address of the Agency providing Internship/Project",
        "width": "w-64"
      },
      {
        "key": "durationDays",
        "label": "Duration in Days",
        "width": "w-28"
      },
      {
        "key": "datesFromTo",
        "label": "Dates From - To",
        "width": "w-36"
      },
      {
        "key": "skillsAcquired",
        "label": "Skills Acquired",
        "width": "w-52"
      },
      {
        "key": "stipend",
        "label": "Stipend, if any (₹)",
        "width": "w-28"
      }
    ],
    "rows": [
      {
        "sno": "1",
        "className": "III B.Com.",
        "regNo": "24UCO115",
        "studentName": "Priya Joseph",
        "activityType": "Project – Financial Data Analysis",
        "agencyDetails": "XYZ Financial Services, 45 MG Road, Bengaluru – 560001, Karnataka",
        "durationDays": "20",
        "datesFromTo": "10.06.2026 – 29.06.2026",
        "skillsAcquired": "Excel, Data Analysis, Financial Reporting",
        "stipend": "-"
      },
      {
        "sno": "2",
        "className": "II B.A. English",
        "regNo": "25UEN208",
        "studentName": "David Paul",
        "activityType": "Internship – Content Writing",
        "agencyDetails": "Creative Media Solutions, 18 College Road, Tiruchirappalli – 620002, Tamil Nadu",
        "durationDays": "15",
        "datesFromTo": "15.07.2026 – 29.07.2026",
        "skillsAcquired": "Content Writing, Editing, Communication",
        "stipend": "3000"
      }
    ]
  },
  {
    "key": "1.9",
    "sheetName": "1.9",
    "title": "1.9 Students Registering / Completing MOOC",
    "badge": "Attribute I - Section 1.9",
    "type": "table",
    "columns": [
      {
        "key": "sno",
        "label": "S. No.",
        "width": "w-14"
      },
      {
        "key": "className",
        "label": "Class",
        "width": "w-36"
      },
      {
        "key": "regNo",
        "label": "Reg. No. of the Student",
        "width": "w-32"
      },
      {
        "key": "studentName",
        "label": "Name of the Student",
        "width": "w-44"
      },
      {
        "key": "courseTitle",
        "label": "Title of the MOOC",
        "width": "w-52"
      },
      {
        "key": "platform",
        "label": "Platform (SWAYAM/NPTEL, Coursera, EdX, Udemy, SWAYAM PLUS)",
        "width": "w-56"
      },
      {
        "key": "cycle",
        "label": "Cycle (incase the platform is SWAYAM / NPTEL)",
        "width": "w-36"
      },
      {
        "key": "duration",
        "label": "Duration (Weeks for SWAYAM/NPTEL, Hrs for others)",
        "width": "w-36"
      },
      {
        "key": "examDate",
        "label": "Date of Examination",
        "width": "w-32"
      },
      {
        "key": "credits",
        "label": "No. of Credits",
        "width": "w-24"
      },
      {
        "key": "status",
        "label": "Registered / Completed",
        "width": "w-32"
      }
    ],
    "rows": [
      {
        "sno": "1",
        "className": "I BSc Computer Science",
        "regNo": "26UCS101",
        "studentName": "Raju S",
        "courseTitle": "Relational Database Management",
        "platform": "SWAYAM",
        "cycle": "July 2026",
        "duration": "8",
        "examDate": "28.09.2026",
        "credits": "2",
        "status": "Registered"
      },
      {
        "sno": "2",
        "className": "I MCA",
        "regNo": "26PCA101",
        "studentName": "Abishek A",
        "courseTitle": "C++ & Data Structures",
        "platform": "Coursera",
        "cycle": "NIL",
        "duration": "30",
        "examDate": "NIL",
        "credits": "NIL",
        "status": "Completed"
      }
    ]
  },
  {
    "key": "1.10",
    "sheetName": "1.10",
    "title": "1.10 Parent Teacher Meet Conducted",
    "badge": "Attribute I - Section 1.10",
    "type": "table",
    "columns": [
      {
        "key": "date",
        "label": "Date",
        "width": "w-32"
      },
      {
        "key": "className",
        "label": "Class",
        "width": "w-44"
      },
      {
        "key": "studentsOrganized",
        "label": "No. of Students for whom PT was organised",
        "width": "w-36"
      },
      {
        "key": "parentsAttending",
        "label": "No. of Parents Attending",
        "width": "w-36"
      },
      {
        "key": "feedbackReceived",
        "label": "No. of Feedback Received",
        "width": "w-36"
      },
      {
        "key": "actionTaken",
        "label": "Action Taken based on feedback received",
        "width": "w-72"
      }
    ],
    "rows": [
      {
        "date": "15.07.2026",
        "className": "II B.Sc. Computer Science",
        "studentsOrganized": "45",
        "parentsAttending": "38",
        "feedbackReceived": "32",
        "actionTaken": "Individual counselling and academic follow-up initiated for students requiring support"
      },
      {
        "date": "22.07.2026",
        "className": "I B.Com.",
        "studentsOrganized": "52",
        "parentsAttending": "45",
        "feedbackReceived": "40",
        "actionTaken": "Attendance and academic performance concerns communicated to parents and monitored"
      }
    ]
  },
  {
    "key": "1.11",
    "sheetName": "1.11",
    "title": "1.11 Feedback Collected from Stakeholders",
    "badge": "Attribute I - Section 1.11",
    "type": "table",
    "columns": [
      {
        "key": "sno",
        "label": "S.No",
        "width": "w-14"
      },
      {
        "key": "stakeholderType",
        "label": "Type of Stakeholder (Teachers/Alumni/Employers/Industry/Entrepreneurs/Students)",
        "width": "w-64"
      },
      {
        "key": "feedbackDate",
        "label": "Date of Feedback Collected",
        "width": "w-36"
      },
      {
        "key": "feedbackReceived",
        "label": "No. of Feedback Received",
        "width": "w-36"
      },
      {
        "key": "mode",
        "label": "Mode of Feedback (Online / Offline)",
        "width": "w-36"
      },
      {
        "key": "actionTaken",
        "label": "Action Taken",
        "width": "w-72"
      }
    ],
    "rows": [
      {
        "sno": "1",
        "stakeholderType": "Teachers",
        "feedbackDate": "15.07.2026",
        "feedbackReceived": "85",
        "mode": "Online",
        "actionTaken": "Faculty suggestions regarding curriculum delivery were reviewed and necessary improvements initiated"
      },
      {
        "sno": "2",
        "stakeholderType": "Alumni",
        "feedbackDate": "20.07.2026",
        "feedbackReceived": "120",
        "mode": "Online",
        "actionTaken": "Suggestions regarding employability and skill development were considered for curriculum enrichment"
      },
      {
        "sno": "3",
        "stakeholderType": "Employers/Industry",
        "feedbackDate": "25.07.2026",
        "feedbackReceived": "35",
        "mode": "Online / Offline",
        "actionTaken": "Industry suggestions were incorporated into skill-oriented training and curriculum review"
      },
      {
        "sno": "4",
        "stakeholderType": "Entrepreneurs",
        "feedbackDate": "30.07.2026",
        "feedbackReceived": "20",
        "mode": "Online",
        "actionTaken": "Suggestions regarding entrepreneurship and start-up skills were considered for student development activities"
      },
      {
        "sno": "5",
        "stakeholderType": "Students",
        "feedbackDate": "05.08.2026",
        "feedbackReceived": "450",
        "mode": "Online",
        "actionTaken": "Feedback on teaching-learning, infrastructure and student support services was analysed and corrective measures initiated"
      }
    ]
  }
];
