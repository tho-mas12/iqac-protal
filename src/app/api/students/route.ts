import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const departmentId = searchParams.get('departmentId');

    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (departmentId) where.departmentId = departmentId;

    const studentRecords = await prisma.studentData.findMany({
      where,
      include: {
        department: true,
        programme: true,
        academicYear: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = studentRecords.reduce(
      (acc, s) => {
        acc.total += s.totalStudents;
        acc.male += s.maleStudents;
        acc.female += s.femaleStudents;
        acc.other += s.otherStudents;
        acc.passedOut += s.passedOutCount;
        acc.progression += s.progressionCount;
        return acc;
      },
      { total: 0, male: 0, female: 0, other: 0, passedOut: 0, progression: 0 }
    );

    return NextResponse.json({ studentRecords, summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const record = await prisma.studentData.create({
      data: {
        academicYearId: body.academicYearId,
        departmentId: body.departmentId,
        programmeId: body.programmeId || null,
        shift: body.shift || 'Shift I',
        totalStudents: Number(body.totalStudents || 0),
        maleStudents: Number(body.maleStudents || 0),
        femaleStudents: Number(body.femaleStudents || 0),
        otherStudents: Number(body.otherStudents || 0),
        categoryBreakdownJson: typeof body.categoryBreakdown === 'object' ? JSON.stringify(body.categoryBreakdown) : body.categoryBreakdown || null,
        passedOutCount: Number(body.passedOutCount || 0),
        progressionCount: Number(body.progressionCount || 0),
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'STUDENT',
      recordId: record.id,
      details: { totalStudents: record.totalStudents },
    });

    return NextResponse.json({ studentData: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
