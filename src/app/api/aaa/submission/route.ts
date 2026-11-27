import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/action-logger';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SUBMISSION_FILE = path.join(process.cwd(), 'data', 'aaa_submissions.json');

function extractUsername(req: NextRequest, bodyUser?: string): string {
  if (bodyUser && bodyUser.trim()) return bodyUser.trim().toUpperCase();
  try {
    const token = req.cookies.get('iqac_token')?.value;
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload?.username) return String(payload.username).toUpperCase();
      }
    }
  } catch {}
  return 'IQAC_PORTAL';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deptName = searchParams.get('dept_name')?.trim();
    const deptId = searchParams.get('dept_id')?.trim();
    const deptCode = searchParams.get('dept_code')?.trim();
    const year = searchParams.get('year') || '2026 - 2027';

    // 1. Try MySQL Database first
    try {
      let sub = null;
      if (deptName) {
        sub = await prisma.aAASubmission.findFirst({
          where: {
            departmentName: deptName,
            academicYear: year,
          },
        });
      }

      if (!sub && deptCode) {
        sub = await prisma.aAASubmission.findFirst({
          where: {
            departmentCode: deptCode,
            academicYear: year,
          },
        });
      }

      if (!sub && deptId) {
        sub = await prisma.aAASubmission.findFirst({
          where: {
            OR: [
              { departmentId: deptId },
              { departmentName: deptId },
            ],
            academicYear: year,
          },
        });
      }

      if (sub && sub.dataJson) {
        const parsedData = JSON.parse(sub.dataJson);
        return NextResponse.json({
          success: true,
          department_id: sub.departmentId,
          department_name: sub.departmentName,
          department_code: sub.departmentCode,
          academic_year: sub.academicYear,
          department_status: sub.isFinalSubmit ? 'submitted' : 'in_progress',
          is_locked: sub.isFinalSubmit,
          submitted_by: sub.submittedBy,
          submitted_at: sub.submittedAt,
          updated_at: sub.updatedAt,
          data: parsedData,
        });
      }
    } catch (dbErr) {
      console.warn('[AAA Submission] DB fetch fallback to file:', dbErr);
    }

    // 2. Fallback to json file
    if (fs.existsSync(SUBMISSION_FILE)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(SUBMISSION_FILE, 'utf8'));
        const key = deptName ? `${deptName}_${year}` : (deptId ? `${deptId}_${year}` : null);
        const record = key ? (fileData[key] || Object.values(fileData).find((x: any) => x.department_name === deptName)) : null;

        if (record && record.data) {
          return NextResponse.json({
            success: true,
            department_name: record.department_name || deptName,
            department_status: record.is_final_submit ? 'submitted' : 'in_progress',
            is_locked: Boolean(record.is_final_submit),
            data: record.data,
            submitted_by: record.submitted_by || null,
            submitted_at: record.submitted_at || null,
            updated_at: record.updated_at || new Date().toISOString(),
          });
        }
      } catch (fErr) {}
    }

    return NextResponse.json({
      success: true,
      department_name: deptName || deptId || 'Department',
      data: null,
      message: 'No submission found for this department yet.',
    });
  } catch (err: any) {
    console.error('Error fetching submission:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch submission' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { department_id, department_code, department_name, academic_year, data, is_final_submit, submitted_by } = body;

    const deptName = (department_name || 'Department').trim();
    const year = (academic_year || '2026 - 2027').trim();
    const submitter = extractUsername(req, submitted_by);

    if (!data) {
      return NextResponse.json({ error: 'Audit data is required' }, { status: 400 });
    }

    // Ensure submitted_by is stamped on every row in the dataset
    if (data.attributeFormData && typeof data.attributeFormData === 'object') {
      for (const card of Object.values(data.attributeFormData) as any[]) {
        if (!card || typeof card !== 'object') continue;
        for (const sheet of Object.values(card) as any[]) {
          if (Array.isArray(sheet)) {
            sheet.forEach((r: any) => {
              if (r && typeof r === 'object' && !r.submitted_by) {
                r.submitted_by = submitter;
              }
            });
          } else if (sheet && typeof sheet === 'object') {
            for (const subArr of Object.values(sheet) as any[]) {
              if (Array.isArray(subArr)) {
                subArr.forEach((r: any) => {
                  if (r && typeof r === 'object' && !r.submitted_by) {
                    r.submitted_by = submitter;
                  }
                });
              }
            }
          }
        }
      }
    }

    const jsonString = JSON.stringify(data);
    const isFinal = Boolean(is_final_submit);
    const now = new Date();

    // 1. Save to MySQL Database
    let savedInDb = false;
    try {
      await prisma.aAASubmission.upsert({
        where: {
          departmentName_academicYear: {
            departmentName: deptName,
            academicYear: year,
          },
        },
        update: {
          departmentId: department_id ? String(department_id) : undefined,
          departmentCode: department_code ? String(department_code) : undefined,
          dataJson: jsonString,
          isFinalSubmit: isFinal,
          submittedBy: submitter,
          submittedAt: isFinal ? now : undefined,
          updatedAt: now,
        },
        create: {
          departmentId: department_id ? String(department_id) : undefined,
          departmentCode: department_code ? String(department_code) : undefined,
          departmentName: deptName,
          academicYear: year,
          dataJson: jsonString,
          isFinalSubmit: isFinal,
          submittedBy: submitter,
          submittedAt: isFinal ? now : null,
          createdAt: now,
          updatedAt: now,
        },
      });

      // Also breakdown individual metrics into AAAMetricRecord for fast indexing
      if (data.attributeFormData) {
        for (const [cardId, cardContent] of Object.entries(data.attributeFormData as Record<string, any>)) {
          if (!cardContent || typeof cardContent !== 'object') continue;
          for (const [metricKey, metricContent] of Object.entries(cardContent as Record<string, any>)) {
            try {
              await prisma.aAAMetricRecord.upsert({
                where: {
                  departmentName_academicYear_metricKey: {
                    departmentName: deptName,
                    academicYear: year,
                    metricKey,
                  },
                },
                update: {
                  departmentCode: department_code ? String(department_code) : undefined,
                  attributeId: cardId,
                  dataJson: JSON.stringify(metricContent),
                  submittedBy: submitter,
                  updatedAt: now,
                },
                create: {
                  departmentName: deptName,
                  departmentCode: department_code ? String(department_code) : undefined,
                  academicYear: year,
                  attributeId: cardId,
                  metricKey,
                  dataJson: JSON.stringify(metricContent),
                  submittedBy: submitter,
                  updatedAt: now,
                },
              });
            } catch (mErr) {}
          }
        }
      }
      savedInDb = true;
    } catch (dbErr) {
      console.error('[AAA Submission] Error saving to MySQL:', dbErr);
    }

    // 2. Also persist to JSON file as fallback
    try {
      const dir = path.dirname(SUBMISSION_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let submissions: Record<string, any> = {};
      if (fs.existsSync(SUBMISSION_FILE)) {
        try { submissions = JSON.parse(fs.readFileSync(SUBMISSION_FILE, 'utf8')); } catch (e) {}
      }

      submissions[`${deptName}_${year}`] = {
        department_id,
        department_code,
        department_name: deptName,
        academic_year: year,
        data,
        is_final_submit: isFinal,
        submitted_by: submitter,
        submitted_at: isFinal ? now.toISOString() : (submissions[`${deptName}_${year}`]?.submitted_at || null),
        updated_at: now.toISOString(),
      };
      fs.writeFileSync(SUBMISSION_FILE, JSON.stringify(submissions, null, 2), 'utf8');
    } catch (fErr) {
      console.error('[AAA Submission] Error saving to file:', fErr);
    }

    // 3. Log Action in Portal Audit Log
    await logAction({
      req,
      username: submitter,
      role: 'DEPARTMENT',
      action: isFinal ? 'UPDATE' : 'CREATE',
      module: 'AAA',
      targetId: deptName,
      targetName: `${deptName} (${year})`,
      details: isFinal
        ? `Final AAA audit submission completed by ${submitter} for ${deptName} (${year}).`
        : `AAA audit metric records entered/saved by ${submitter} for ${deptName} (${year}).`,
    });

    return NextResponse.json({
      success: true,
      savedInDatabase: savedInDb,
      message: isFinal
        ? 'Final audit report submitted to IQAC and locked successfully!'
        : 'All metric records saved and stored in database successfully.',
      department_name: deptName,
      status: isFinal ? 'submitted' : 'in_progress',
      submitted_by: submitter,
    });
  } catch (err: any) {
    console.error('Error saving submission:', err);
    return NextResponse.json({ error: err.message || 'Failed to save submission' }, { status: 500 });
  }
}
