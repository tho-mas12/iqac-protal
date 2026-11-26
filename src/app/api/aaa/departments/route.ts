import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SUBMISSION_FILE = path.join(process.cwd(), 'data', 'aaa_submissions.json');

const DEFAULT_DEPARTMENTS = [
  { id: 1, code: 'cs', name: 'PG & Research Department of Computer Science', school: 'School of Computing Sciences', hod_name: 'Dr. S. Albert Rabara', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 2, code: 'commerce', name: 'PG & Research Department of Commerce', school: 'School of Management Studies', hod_name: 'Dr. F. R. Alexander Pravin Durai', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 3, code: 'physics', name: 'PG & Research Department of Physics', school: 'School of Physical Sciences', hod_name: 'Dr. N. Lawrence', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 4, code: 'chemistry', name: 'PG & Research Department of Chemistry', school: 'School of Chemical Sciences', hod_name: 'Dr. A. Rose Venis', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 5, code: 'maths', name: 'PG & Research Department of Mathematics', school: 'School of Computing Sciences', hod_name: 'Dr. J. Maria Joseph', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 6, code: 'history', name: 'Department of History', school: 'School of Social Sciences', hod_name: 'Dr. K. Lingammal', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 7, code: 'english', name: 'Department of English', school: 'School of Languages', hod_name: 'Dr. V. L. Jayapaul', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 8, code: 'economics', name: 'Department of Economics', school: 'School of Management Studies', hod_name: 'Dr. S. Sujatha', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 9, code: 'bba', name: 'Department of Business Administration (BBA)', school: 'School of Management Studies', hod_name: 'Dr. P. Bastin Jerome', coordinator_name: '', status: 'draft', is_locked: false },
  { id: 10, code: 'botany', name: 'PG & Research Department of Botany', school: 'School of Biological Sciences', hod_name: 'Dr. S. Sahaya Sathish', coordinator_name: '', status: 'draft', is_locked: false },
];

export async function GET(req: NextRequest) {
  try {
    let submissions: Record<string, any> = {};
    if (fs.existsSync(SUBMISSION_FILE)) {
      try {
        submissions = JSON.parse(fs.readFileSync(SUBMISSION_FILE, 'utf8'));
      } catch (e) {}
    }

    const depts = DEFAULT_DEPARTMENTS.map(d => {
      const sub = submissions[`${d.id}_2026 - 2027`];
      return {
        ...d,
        status: sub?.is_final_submit ? 'submitted' : (sub ? 'in_progress' : d.status),
        is_locked: Boolean(sub?.is_final_submit),
        last_updated: sub?.updated_at || '-',
        submitted_at: sub?.submitted_at || null,
        pubs: 0,
        grants: 0,
        patents: 0,
        vacCc: 0,
        moocPct: '0%'
      };
    });

    return NextResponse.json({
      success: true,
      departments: depts,
      summary: {
        totalPubs: 0,
        totalGrants: 0,
        totalPatents: 0,
        totalVacCc: 0,
        submittedCount: depts.filter(d => d.status === 'submitted').length,
        auditedCount: 0
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch departments' }, { status: 500 });
  }
}
