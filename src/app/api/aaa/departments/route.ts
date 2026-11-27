import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SUBMISSION_FILE = path.join(process.cwd(), 'data', 'aaa_submissions.json');

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get('year') || '2026 - 2027';

    // 1. Fetch all real departments from MySQL
    let dbDepts: any[] = [];
    try {
      dbDepts = await prisma.department.findMany({
        where: { isActive: true },
        orderBy: [{ name: 'asc' }, { shift: 'asc' }],
      });
    } catch (dbErr) {
      console.error('[AAA Departments] DB fetch error:', dbErr);
    }

    // 2. Fetch all submissions from MySQL for this academic year
    let dbSubmissions: any[] = [];
    try {
      dbSubmissions = await prisma.aAASubmission.findMany({
        where: { academicYear },
      });
    } catch (subErr) {
      // Table might still be syncing
      console.warn('[AAA Departments] AAASubmission query error:', subErr);
    }

    // 3. Fallback: file submissions
    let fileSubmissions: Record<string, any> = {};
    if (fs.existsSync(SUBMISSION_FILE)) {
      try {
        fileSubmissions = JSON.parse(fs.readFileSync(SUBMISSION_FILE, 'utf8'));
      } catch (e) {}
    }

    // Map dbSubmissions into a lookup map
    const subMap = new Map<string, any>();
    for (const sub of dbSubmissions) {
      if (sub.departmentName) subMap.set(sub.departmentName.toLowerCase(), sub);
      if (sub.departmentCode) subMap.set(sub.departmentCode.toLowerCase(), sub);
    }

    // Build rich list of departments
    const departments = dbDepts.map((d, index) => {
      const sub = subMap.get(d.name.toLowerCase()) || 
                  subMap.get(d.code.toLowerCase()) ||
                  fileSubmissions[`${d.name}_${academicYear}`] ||
                  fileSubmissions[`${d.id}_${academicYear}`];

      const isFinal = Boolean(sub?.isFinalSubmit ?? sub?.is_final_submit);
      const hasData = Boolean(sub);

      return {
        id: d.id,
        numId: index + 1,
        code: d.code,
        name: d.name,
        shift: d.shift || 'Shift I',
        school: d.shift === 'Shift II' ? 'Shift II Programmes' : 'Shift I Programmes',
        hod_name: '',
        coordinator_name: '',
        status: isFinal ? 'submitted' : (hasData ? 'in_progress' : 'draft'),
        is_locked: isFinal,
        last_updated: sub?.updatedAt ? new Date(sub.updatedAt).toLocaleString() : (sub?.updated_at || '-'),
        submitted_at: sub?.submittedAt || sub?.submitted_at || null,
        submitted_by: sub?.submittedBy || null,
        pubs: 0,
        grants: 0,
        patents: 0,
        vacCc: 0,
        moocPct: '0%',
      };
    });

    // Unique department names for filters and dropdowns
    const departmentNames = Array.from(new Set(dbDepts.map(d => d.name).filter(Boolean))).sort();

    return NextResponse.json({
      success: true,
      departments,
      departmentNames,
      academic_year: academicYear,
      summary: {
        total_departments: departments.length,
        submitted_count: departments.filter(d => d.status === 'submitted').length,
        in_progress_count: departments.filter(d => d.status === 'in_progress').length,
        draft_count: departments.filter(d => d.status === 'draft').length,
        locked_count: departments.filter(d => d.is_locked).length,
      },
    });
  } catch (err: any) {
    console.error('Error fetching AAA departments:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch departments' }, { status: 500 });
  }
}
