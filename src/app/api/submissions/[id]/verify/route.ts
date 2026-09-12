import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN' && user.role !== 'IQAC_MEMBER')) {
      return NextResponse.json({ error: 'Unauthorized to verify submissions' }, { status: 403 });
    }

    const { action, remarks, resubmissionDeadline } = await req.json();

    if (!['APPROVE', 'REJECT', 'CORRECTION'].includes(action)) {
      return NextResponse.json({ error: 'Invalid verification action' }, { status: 400 });
    }

    let status = 'APPROVED';
    if (action === 'REJECT') status = 'REJECTED';
    if (action === 'CORRECTION') status = 'CORRECTION_REQUIRED';

    const submission = await prisma.submission.update({
      where: { id: params.id },
      data: {
        status,
        verificationRemarks: remarks || null,
        resubmissionDeadline: resubmissionDeadline ? new Date(resubmissionDeadline) : null,
        verifiedAt: new Date(),
        verifiedById: user.userId,
      },
      include: { department: true, dataRequest: true },
    });

    // Notify Department HOD & Coordinator
    const deptUsers = await prisma.user.findMany({
      where: {
        departmentId: submission.departmentId,
        role: { in: ['HOD', 'DEPT_COORDINATOR'] },
      },
    });

    const notifType = action === 'CORRECTION' ? 'CORRECTION_REQUESTED' : action === 'APPROVE' ? 'APPROVED' : 'INFO';
    const notifTitle = action === 'CORRECTION' ? 'Correction Requested by IQAC' : action === 'APPROVE' ? 'Submission Approved by IQAC' : 'Submission Reviewed';

    for (const dUser of deptUsers) {
      await prisma.notification.create({
        data: {
          userId: dUser.id,
          title: notifTitle,
          message: `Submission for '${submission.dataRequest.title}' was marked '${status}'. ${remarks ? 'Remarks: ' + remarks : ''}`,
          type: notifType,
        },
      });
    }

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: action as any,
      module: 'DATA_REQUEST',
      recordId: submission.id,
      details: { status: submission.status, remarks },
    });

    return NextResponse.json({ submission });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
