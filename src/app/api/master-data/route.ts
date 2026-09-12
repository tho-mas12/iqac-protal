import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    const schools = await prisma.school.findMany({ orderBy: { name: 'asc' } });
    const frameworks = await prisma.framework.findMany({ orderBy: { name: 'asc' } });
    const programmes = await prisma.programme.findMany({ include: { department: true } });
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        schoolId: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      departments,
      schools,
      frameworks,
      programmes,
      users,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
