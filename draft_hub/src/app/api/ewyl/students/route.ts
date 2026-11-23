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
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // e.g. "2026-11"

    const students = await prisma.ewylStudent.findMany({
      orderBy: { name: 'asc' },
      include: {
        hours: {
          where: { monthActive: month }
        }
      }
    });

    const summary = students.map(s => {
      const totalHours = s.hours.reduce((sum, h) => sum + h.totalHours, 0);
      const remuneration = Math.round(totalHours * s.hourlyRate);

      return {
        id: s.id,
        name: s.name,
        reg_no: s.regNo,
        dept_name: s.deptName,
        shift: s.shift,
        bank_name: s.bankName,
        account_no: s.accountNo,
        ifsc_code: s.ifscCode,
        branch_name: s.branchName,
        hourly_rate: s.hourlyRate,
        total_hours: totalHours,
        remuneration: remuneration,
        logs_count: s.hours.length
      };
    });

    return NextResponse.json({ success: true, month, students: summary });
  } catch (error: any) {
    console.error('Error fetching EWYL students:', error);
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
    const { name, reg_no, dept_name, shift, bank_name, account_no, ifsc_code, branch_name, hourly_rate } = body;

    if (!name || !reg_no || !dept_name || !bank_name || !account_no || !ifsc_code || !branch_name) {
      return NextResponse.json({ error: 'All fields including bank details are required' }, { status: 400 });
    }

    const student = await prisma.ewylStudent.create({
      data: {
        name: name.trim(),
        regNo: reg_no.trim().toUpperCase(),
        deptName: dept_name.trim(),
        shift: shift || 'Shift I',
        bankName: bank_name.trim(),
        accountNo: account_no.trim(),
        ifscCode: ifsc_code.trim().toUpperCase(),
        branchName: branch_name.trim(),
        hourlyRate: hourly_rate ? Number(hourly_rate) : 100.0
      }
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error('Error creating EWYL student:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Registration Number already exists' }, { status: 400 });
    }
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
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    await prisma.ewylStudent.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Student and associated hours deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting EWYL student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
