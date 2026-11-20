import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      invitationsTotal,
      invitationsApproved,
      coursePlansTotal,
      coursePlansApproved,
      aaaTotalDepts,
      aaaSubmitted,
      dynamicCampaignsCount,
    ] = await Promise.all([
      prisma.invitation.count(),
      prisma.invitation.count({ where: { status: 'APPROVED' } }),
      prisma.coursePlanRecord.count(),
      prisma.coursePlanRecord.count({ where: { hodStatus: 'Approved' } }),
      prisma.department.count(),
      prisma.aaaDepartmentRecord.count({ where: { status: 'submitted' } }),
      prisma.dynamicCampaign.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        invitationsTotal,
        invitationsApproved,
        coursePlansTotal,
        coursePlansApproved,
        aaaTotalDepts: aaaTotalDepts || 34,
        aaaSubmitted,
        dynamicCampaignsCount,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
