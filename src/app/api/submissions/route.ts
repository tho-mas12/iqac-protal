import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = req.nextUrl.searchParams;
    const dataRequestId = searchParams.get('dataRequestId');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    const where: any = {};
    if (dataRequestId) where.dataRequestId = dataRequestId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    // Filter department users to their own dept
    if (user && (user.role === 'HOD' || user.role === 'DEPT_COORDINATOR' || user.role === 'FACULTY')) {
      if (user.departmentId) where.departmentId = user.departmentId;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        dataRequest: {
          include: { dynamicForm: true },
        },
        department: true,
        academicYear: true,
        submittedBy: true,
        verifiedBy: true,
        values: true,
        versions: true,
        evidences: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ submissions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { dataRequestId, departmentId, academicYearId, values, isSubmit } = await req.json();

    if (!dataRequestId || !departmentId || !academicYearId) {
      return NextResponse.json({ error: 'Data request, department, and academic year are required' }, { status: 400 });
    }

    // Check if submission already exists
    let submission = await prisma.submission.findFirst({
      where: { dataRequestId, departmentId },
    });

    const status = isSubmit ? 'UNDER_VERIFICATION' : 'DRAFT';

    if (!submission) {
      submission = await prisma.submission.create({
        data: {
          dataRequestId,
          departmentId,
          academicYearId,
          submittedById: user.userId,
          status,
          submittedAt: isSubmit ? new Date() : null,
        },
      });
    } else {
      const newRevCount = submission.status === 'CORRECTION_REQUIRED' ? submission.revisionCount + 1 : submission.revisionCount;
      submission = await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status,
          submittedById: user.userId,
          revisionCount: newRevCount,
          submittedAt: isSubmit ? new Date() : submission.submittedAt,
        },
      });
    }

    // Upsert submission values
    if (values && Array.isArray(values)) {
      await prisma.submissionValue.deleteMany({
        where: { submissionId: submission.id },
      });

      for (const val of values) {
        await prisma.submissionValue.create({
          data: {
            submissionId: submission.id,
            fieldId: val.fieldId,
            fieldLabel: val.fieldLabel,
            value: typeof val.value === 'object' ? JSON.stringify(val.value) : String(val.value ?? ''),
            evidenceId: val.evidenceId || null,
          },
        });
      }
    }

    // Save version history
    const currentValues = await prisma.submissionValue.findMany({
      where: { submissionId: submission.id },
    });

    await prisma.submissionVersion.create({
      data: {
        submissionId: submission.id,
        versionNumber: submission.revisionCount + 1,
        valuesJson: JSON.stringify(currentValues),
        changedById: user.userId,
        remarks: isSubmit ? 'Submitted by department' : 'Draft saved',
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: isSubmit ? 'SUBMIT' : 'UPDATE',
      module: 'DATA_REQUEST',
      recordId: submission.id,
      details: { status: submission.status, revisionCount: submission.revisionCount },
    });

    return NextResponse.json({ submission });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
