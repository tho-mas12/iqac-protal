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

    const events = await prisma.checklistEvent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        submissions: {
          select: {
            id: true,
            status: true,
            departmentId: true,
          }
        }
      }
    });

    const formatted = events.map(evt => {
      const total = evt.submissions.length;
      const received = evt.submissions.filter(s => s.status === 'received').length;
      const remarks = evt.submissions.filter(s => s.status === 'remarks').length;
      const pending = evt.submissions.filter(s => s.status === 'pending').length;
      const percentage = total > 0 ? Math.round((received / total) * 100) : 0;

      return {
        id: evt.id,
        title: evt.title,
        description: evt.description,
        deadline: evt.deadline,
        shiftsScope: evt.shiftsScope,
        isVisiblePublic: evt.isVisiblePublic,
        createdAt: evt.createdAt,
        total,
        received,
        remarks,
        pending,
        percentage
      };
    });

    return NextResponse.json({ success: true, events: formatted });
  } catch (error: any) {
    console.error('Error fetching checklist events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, deadline, shiftsScope } = body;

    if (!title || !deadline) {
      return NextResponse.json({ error: 'Title and deadline are required' }, { status: 400 });
    }

    const scope = shiftsScope || 'Shift I,Shift II,Combined Department';

    // 1. Create the event
    const event = await prisma.checklistEvent.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        deadline: deadline.trim(),
        shiftsScope: scope,
        isVisiblePublic: true
      }
    });

    // 2. Fetch departments to seed checklist submission rows
    const departments = await prisma.department.findMany({
      where: { isActive: true }
    });

    // Filter departments matching shiftsScope
    const eligibleDepts = departments.filter(d => {
      if (scope.includes('Combined') || scope.includes('All')) return true;
      const shiftNormalized = d.shift.toLowerCase();
      if (scope.toLowerCase().includes('shift i') && shiftNormalized.includes('shift i')) return true;
      if (scope.toLowerCase().includes('shift ii') && shiftNormalized.includes('shift ii')) return true;
      return true;
    });

    // Create submissions for eligible departments
    if (eligibleDepts.length > 0) {
      await prisma.$transaction(
        eligibleDepts.map(d =>
          prisma.checklistSubmission.create({
            data: {
              eventId: event.id,
              departmentId: d.id,
              status: 'pending'
            }
          })
        )
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Error creating checklist event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    await prisma.checklistEvent.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting checklist event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
