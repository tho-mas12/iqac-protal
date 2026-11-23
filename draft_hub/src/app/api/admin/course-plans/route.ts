import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const departmentName = searchParams.get('department');
    const hodStatus = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (departmentName && departmentName !== 'ALL') {
      where.departmentName = { contains: departmentName };
    }
    if (hodStatus && hodStatus !== 'ALL') {
      where.hodStatus = hodStatus;
    }
    if (search) {
      where.OR = [
        { courseCode: { contains: search } },
        { courseTitle: { contains: search } },
        { facultyName: { contains: search } },
        { staffCode: { contains: search } },
      ];
    }

    const records = await prisma.coursePlanRecord.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    const parsed = records.map(r => {
      let tl = {};
      let units = [];
      try { tl = JSON.parse(r.tlPracticesJson || '{}'); } catch {}
      try { units = JSON.parse(r.unitsJson || '[]'); } catch {}
      return {
        ...r,
        tlPractices: tl,
        units
      };
    });

    return NextResponse.json({ success: true, coursePlans: parsed });
  } catch (error: any) {
    console.error('Error fetching course plans for admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, hodStatus, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Course Plan ID required' }, { status: 400 });
    }

    const updated = await prisma.coursePlanRecord.update({
      where: { id },
      data: {
        ...(hodStatus ? { hodStatus } : {}),
        ...(status ? { status } : {}),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, message: 'Status updated successfully', record: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Course Plan ID required' }, { status: 400 });
    }

    await prisma.coursePlanRecord.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Course plan deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

