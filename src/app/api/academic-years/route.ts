import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { year: 'desc' },
    });
    return NextResponse.json({ years });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { year, isCurrent, startDate, endDate } = await req.json();

    if (isCurrent) {
      // Unset previous current year
      await prisma.academicYear.updateMany({
        data: { isCurrent: false },
      });
    }

    const newYear = await prisma.academicYear.create({
      data: {
        year,
        isCurrent: Boolean(isCurrent),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ year: newYear });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
