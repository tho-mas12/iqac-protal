import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const event = await prisma.checklistEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const submissions = await prisma.checklistSubmission.findMany({
      where: { eventId },
      include: {
        department: true
      },
      orderBy: { department: { name: 'asc' } }
    });

    const formatted = submissions.map(s => ({
      id: s.id,
      departmentId: s.departmentId,
      departmentName: s.department.name,
      shift: s.department.shift,
      status: s.status, // "pending", "received", "remarks"
      receivedTime: s.receivedTime,
      remarks: s.remarks,
    }));

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        deadline: event.deadline,
        shiftsScope: event.shiftsScope,
      },
      submissions: formatted
    });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, status, remarks } = body;

    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Submission ID and status required' }, { status: 400 });
    }

    const updated = await prisma.checklistSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        remarks: remarks !== undefined ? remarks : undefined,
        receivedTime: status === 'received' ? new Date().toLocaleString() : (status === 'pending' ? null : undefined)
      }
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
