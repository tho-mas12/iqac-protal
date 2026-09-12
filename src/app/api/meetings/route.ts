import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        actionItems: {
          include: { responsibleUser: true, department: true },
        },
      },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ meetings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN' && user.role !== 'IQAC_MEMBER')) {
      return NextResponse.json({ error: 'Unauthorized to schedule meetings' }, { status: 403 });
    }

    const body = await req.json();

    const count = await prisma.meeting.count();
    const meetingNumber = body.meetingNumber || `IQAC-MTG-${new Date().getFullYear()}-${String(count + 1).padStart(2, '0')}`;

    const meeting = await prisma.meeting.create({
      data: {
        meetingNumber,
        title: body.title,
        date: new Date(body.date),
        time: body.time || null,
        venue: body.venue || null,
        agenda: body.agenda || null,
        minutes: body.minutes || null,
        status: body.status || 'Scheduled',
        documentUrl: body.documentUrl || null,
      },
    });

    // Create Action Items if present
    if (body.actionItems && Array.isArray(body.actionItems)) {
      for (const item of body.actionItems) {
        await prisma.meetingActionItem.create({
          data: {
            meetingId: meeting.id,
            resolution: item.resolution,
            actionRequired: item.actionRequired,
            responsibleUserId: item.responsibleUserId || null,
            departmentId: item.departmentId || null,
            deadline: item.deadline ? new Date(item.deadline) : null,
            status: 'Pending',
          },
        });
      }
    }

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'MEETING',
      recordId: meeting.id,
      details: { title: meeting.title, meetingNumber: meeting.meetingNumber },
    });

    return NextResponse.json({ meeting });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
