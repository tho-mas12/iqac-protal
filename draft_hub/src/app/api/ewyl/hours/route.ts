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
    const studentId = searchParams.get('studentId');
    const month = searchParams.get('month');

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (month) where.monthActive = month;

    const hours = await prisma.ewylHourLog.findMany({
      where,
      include: {
        student: {
          select: {
            name: true,
            regNo: true,
            deptName: true,
            hourlyRate: true,
            bankName: true,
            accountNo: true,
            ifscCode: true,
            branchName: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ success: true, hours });
  } catch (error: any) {
    console.error('Error fetching EWYL hours:', error);
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
    const { studentId, date, inTime, outTime, monthActive, workDone } = body;

    if (!studentId || !date || !inTime || !outTime) {
      return NextResponse.json({ error: 'Student, date, IN and OUT times are required' }, { status: 400 });
    }

    // Calculate hours from IN and OUT times
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;

    if (outMinutes <= inMinutes) {
      return NextResponse.json({ error: 'OUT time must be after IN time' }, { status: 400 });
    }

    const totalHours = Number(((outMinutes - inMinutes) / 60).toFixed(2));
    const activeMonth = monthActive || date.slice(0, 7);

    const log = await prisma.ewylHourLog.create({
      data: {
        studentId,
        date,
        inTime,
        outTime,
        totalHours,
        monthActive: activeMonth,
        workDone: workDone ? workDone.trim() : null,
        status: 'Approved'
      }
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Error logging EWYL hours:', error);
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
      return NextResponse.json({ error: 'Hour Log ID required' }, { status: 400 });
    }

    await prisma.ewylHourLog.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Hour entry deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting EWYL hour entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
