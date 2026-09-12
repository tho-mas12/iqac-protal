import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const departmentId = searchParams.get('departmentId');
    const academicYearId = searchParams.get('academicYearId');
    const search = searchParams.get('search');

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (academicYearId) where.academicYearId = academicYearId;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { facultyIdNumber: { contains: search } },
        { designation: { contains: search } },
      ];
    }

    const facultyList = await prisma.faculty.findMany({
      where,
      include: {
        department: true,
        trainings: true,
      },
      orderBy: { name: 'asc' },
    });

    // Calculate training metrics
    const totalFaculty = facultyList.length;
    const trainedFacultyCount = facultyList.filter((f) => f.trainings && f.trainings.length > 0).length;
    const trainingPercentage = totalFaculty > 0 ? Math.round((trainedFacultyCount / totalFaculty) * 100) : 0;

    return NextResponse.json({
      faculty: facultyList,
      summary: {
        totalFaculty,
        trainedFacultyCount,
        trainingPercentage,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const count = await prisma.faculty.count();
    const facultyIdNumber = body.facultyIdNumber || `FAC-${String(count + 1001)}`;

    const faculty = await prisma.faculty.create({
      data: {
        facultyIdNumber,
        name: body.name,
        departmentId: body.departmentId,
        designation: body.designation,
        appointmentNature: body.appointmentNature || 'Regular',
        category: body.category || 'Management',
        dateOfJoining: body.dateOfJoining ? new Date(body.dateOfJoining) : null,
        qualification: body.qualification || null,
        specialization: body.specialization || null,
        isPhd: Boolean(body.isPhd),
        experienceYears: Number(body.experienceYears || 0),
        email: body.email || null,
        phone: body.phone || null,
        academicYearId: body.academicYearId || null,
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'FACULTY',
      recordId: faculty.id,
      details: { name: faculty.name, facultyIdNumber: faculty.facultyIdNumber },
    });

    return NextResponse.json({ faculty });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
