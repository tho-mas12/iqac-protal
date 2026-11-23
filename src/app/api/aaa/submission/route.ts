import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SUBMISSION_FILE = path.join(process.cwd(), 'data', 'aaa_submissions.json');
const METRICS_DIR = path.join(process.cwd(), 'data', 'metrics');

function getSubmissions(): { [key: string]: any } {
  try {
    if (fs.existsSync(SUBMISSION_FILE)) {
      return JSON.parse(fs.readFileSync(SUBMISSION_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading aaa_submissions.json:', e);
  }
  return {};
}

function saveSubmissions(data: { [key: string]: any }) {
  try {
    const dir = path.dirname(SUBMISSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUBMISSION_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error saving aaa_submissions.json:', e);
    return false;
  }
}

function syncLocalMetricFiles(deptId: number, deptName: string, year: string, auditData: any) {
  try {
    if (!fs.existsSync(METRICS_DIR)) fs.mkdirSync(METRICS_DIR, { recursive: true });

    const formData = auditData?.attributeFormData;
    if (!formData) return;

    // Part A
    if (formData.part_a?.['PART-A']) {
      const partA = formData.part_a['PART-A'];
      const facRows = Array.isArray(partA.facultyDetails) ? partA.facultyDetails : (partA.facultyDetails?.rows || []);
      if (facRows.length > 0) {
        const file = path.join(METRICS_DIR, `metric_part_a_faculty_${deptId}_${year.replace(/\s+/g, '_')}.json`);
        fs.writeFileSync(file, JSON.stringify(facRows, null, 2), 'utf8');
      }
      const stuRows = Array.isArray(partA.studentDetails) ? partA.studentDetails : (partA.studentDetails?.rows || []);
      if (stuRows.length > 0) {
        const file = path.join(METRICS_DIR, `metric_part_a_students_${deptId}_${year.replace(/\s+/g, '_')}.json`);
        fs.writeFileSync(file, JSON.stringify(stuRows, null, 2), 'utf8');
      }
    }

    // Attributes 1 to 10
    for (const [cardId, cardData] of Object.entries(formData)) {
      if (cardId === 'part_a' || !cardData || typeof cardData !== 'object') continue;
      for (const [sheetKey, content] of Object.entries(cardData as Record<string, any>)) {
        const safeKey = `${cardId}_${sheetKey}`.replace(/[^a-zA-Z0-9_]/g, '_');
        const file = path.join(METRICS_DIR, `metric_${safeKey}_${deptId}_${year.replace(/\s+/g, '_')}.json`);
        fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
      }
    }
  } catch (e) {
    console.error('Error syncing local metric files:', e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get('dept_id') || '1';
    const year = searchParams.get('year') || '2026 - 2027';

    const submissions = getSubmissions();
    const key = `${deptId}_${year}`;
    const record = submissions[key] || submissions[`1_${year}`] || null;

    if (record) {
      return NextResponse.json({
        success: true,
        department_id: Number(deptId),
        department_name: record.department_name || 'PG & Research Department of Computer Science',
        department_status: record.is_final_submit ? 'submitted' : 'in_progress',
        academic_year: year,
        is_locked: Boolean(record.is_final_submit),
        data: record.data,
        submitted_at: record.submitted_at || null,
        updated_at: record.updated_at || new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      department_id: Number(deptId),
      data: null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch submission' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { department_id, department_name, academic_year, data, is_final_submit } = body;

    const deptId = Number(department_id) || 1;
    const year = academic_year || '2026 - 2027';
    const key = `${deptId}_${year}`;

    const submissions = getSubmissions();
    submissions[key] = {
      department_id: deptId,
      department_name: department_name || 'Department',
      academic_year: year,
      data,
      is_final_submit: Boolean(is_final_submit),
      submitted_at: is_final_submit ? new Date().toISOString() : submissions[key]?.submitted_at || null,
      updated_at: new Date().toISOString(),
    };

    saveSubmissions(submissions);
    syncLocalMetricFiles(deptId, department_name || 'Department', year, data);

    return NextResponse.json({
      success: true,
      message: is_final_submit
        ? 'Final audit report submitted to IQAC successfully!'
        : 'Submission saved and synced to database successfully.',
      department_id: deptId,
      status: is_final_submit ? 'submitted' : 'in_progress',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save submission' }, { status: 500 });
  }
}
