import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');

    let ay = await prisma.academicYear.findFirst({
      where: academicYearId ? { id: academicYearId } : { isCurrent: true },
    });

    if (!ay) ay = await prisma.academicYear.findFirst({ orderBy: { year: 'desc' } });

    const departments = await prisma.department.findMany({ where: { isActive: true } });

    const deptFsrList = await Promise.all(
      departments.map(async (d) => {
        const facultyCount = await prisma.faculty.count({
          where: { departmentId: d.id, status: 'Active' },
        });

        const studentAggregate = await prisma.studentData.aggregate({
          where: { departmentId: d.id, ...(ay ? { academicYearId: ay.id } : {}) },
          _sum: { totalStudents: true },
        });

        const studentCount = studentAggregate._sum.totalStudents || 0;
        const fullTimeFacultyCount = facultyCount; // full-time active faculty

        const ratioValue = fullTimeFacultyCount > 0 ? parseFloat((studentCount / fullTimeFacultyCount).toFixed(1)) : studentCount;

        return {
          departmentId: d.id,
          departmentName: d.name,
          departmentCode: d.code,
          facultyCount,
          studentCount,
          fullTimeFacultyCount,
          ratioFormatted: `1:${ratioValue}`,
          ratioValue,
        };
      })
    );

    // Total institution level FSR
    const totalFaculty = deptFsrList.reduce((acc, curr) => acc + curr.facultyCount, 0);
    const totalStudents = deptFsrList.reduce((acc, curr) => acc + curr.studentCount, 0);
    const instRatioValue = totalFaculty > 0 ? parseFloat((totalStudents / totalFaculty).toFixed(1)) : totalStudents;

    return NextResponse.json({
      academicYear: ay?.year,
      institutionFSR: {
        totalFaculty,
        totalStudents,
        ratioFormatted: `1:${instRatioValue}`,
        ratioValue: instRatioValue,
      },
      departments: deptFsrList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
