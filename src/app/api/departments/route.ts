import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        shift: true,
        isActive: true,
        createdAt: true,
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
