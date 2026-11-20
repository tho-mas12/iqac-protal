import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const departments = await prisma.aaaDepartmentRecord.findMany({
      orderBy: { departmentName: 'asc' },
    });

    // Compute summary stats
    const total = departments.length;
    const submitted = departments.filter(d => d.status === 'submitted' || d.status === 'audited').length;
    const inProgress = departments.filter(d => d.status === 'in_progress').length;
    const draft = departments.filter(d => d.status === 'draft').length;
    const locked = departments.filter(d => d.isLocked).length;

    return NextResponse.json({
      success: true,
      departments,
      stats: {
        total,
        submitted,
        inProgress,
        draft,
        locked,
      }
    });
  } catch (error: any) {
    console.error('Error fetching AAA departments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, isLocked, status, auditDate, overallGrade, compositeScore, lockAll } = body;

    if (lockAll !== undefined) {
      // Batch lock/unlock all
      await prisma.aaaDepartmentRecord.updateMany({
        data: {
          isLocked: Boolean(lockAll),
          ...(lockAll ? { status: 'locked' } : { status: 'in_progress' }),
          updatedAt: new Date(),
        }
      });
      return NextResponse.json({ success: true, message: `All departments ${lockAll ? 'locked' : 'unlocked'}` });
    }

    if (!id) {
      return NextResponse.json({ error: 'Department ID required' }, { status: 400 });
    }

    const updated = await prisma.aaaDepartmentRecord.update({
      where: { id },
      data: {
        ...(isLocked !== undefined ? { isLocked } : {}),
        ...(status ? { status } : {}),
        ...(auditDate !== undefined ? { auditDate } : {}),
        ...(overallGrade !== undefined ? { overallGrade } : {}),
        ...(compositeScore !== undefined ? { compositeScore } : {}),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, department: updated });
  } catch (error: any) {
    console.error('Error updating AAA department:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
