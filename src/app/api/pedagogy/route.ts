import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const departmentId = searchParams.get('departmentId');

    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (departmentId) where.departmentId = departmentId;

    const records = await prisma.pedagogicalApproach.findMany({
      where,
      include: {
        department: true,
        academicYear: true,
        programme: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const record = await prisma.pedagogicalApproach.create({
      data: {
        academicYearId: body.academicYearId,
        departmentId: body.departmentId || user.departmentId,
        programmeId: body.programmeId || null,
        courseName: body.courseName,
        facultyName: body.facultyName || user.name,
        pedagogicalApproach: body.pedagogicalApproach,
        assessmentPractice: body.assessmentPractice || null,
        eContentDetails: body.eContentDetails || null,
        evidenceFileUrl: body.evidenceFileUrl || null,
      },
    });

    return NextResponse.json({ record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
