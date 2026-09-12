import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const departmentId = searchParams.get('departmentId');
    const type = searchParams.get('type');

    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (departmentId) where.departmentId = departmentId;
    if (type) where.type = type;

    const activities = await prisma.activity.findMany({
      where,
      include: {
        department: true,
        academicYear: true,
      },
      orderBy: { startDate: 'desc' },
    });

    // Compute automatic checklist for each activity
    const processed = activities.map((act) => {
      const checklist = {
        invitation: Boolean(act.invitationFileUrl),
        report: Boolean(act.reportFileUrl),
        attendance: Boolean(act.attendanceFileUrl),
        photographs: Boolean(act.photosFileUrl),
        feedback: Boolean(act.feedbackFileUrl),
        certificates: Boolean(act.certsFileUrl),
      };

      const isComplete =
        checklist.invitation &&
        checklist.report &&
        checklist.attendance &&
        checklist.photographs;

      return {
        ...act,
        checklist,
        evidenceStatus: isComplete ? 'Complete' : 'Incomplete',
      };
    });

    return NextResponse.json({ activities: processed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const count = await prisma.activity.count();
    const activityNumber = body.activityNumber || `ACT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const isComplete =
      Boolean(body.invitationFileUrl) &&
      Boolean(body.reportFileUrl) &&
      Boolean(body.attendanceFileUrl) &&
      Boolean(body.photosFileUrl);

    const activity = await prisma.activity.create({
      data: {
        activityNumber,
        departmentId: body.departmentId || user.departmentId,
        academicYearId: body.academicYearId,
        title: body.title,
        type: body.type || 'Seminar',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        durationHours: Number(body.durationHours || 1.0),
        coordinatorName: body.coordinatorName || user.name,
        objectives: body.objectives || null,
        outcomes: body.outcomes || null,
        participantCount: Number(body.participantCount || 0),
        beneficiariesCount: Number(body.beneficiariesCount || 0),
        sdgGoal: body.sdgGoal || null,
        categoryType: body.categoryType || 'Academic',
        invitationFileUrl: body.invitationFileUrl || null,
        reportFileUrl: body.reportFileUrl || null,
        attendanceFileUrl: body.attendanceFileUrl || null,
        photosFileUrl: body.photosFileUrl || null,
        feedbackFileUrl: body.feedbackFileUrl || null,
        certsFileUrl: body.certsFileUrl || null,
        evidenceStatus: isComplete ? 'Complete' : 'Incomplete',
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'ACTIVITY',
      recordId: activity.id,
      details: { title: activity.title, activityNumber: activity.activityNumber },
    });

    return NextResponse.json({ activity });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
