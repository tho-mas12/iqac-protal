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

    const audits = await prisma.academicAudit.findMany({
      where,
      include: {
        department: true,
        academicYear: true,
        verifiedBy: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ audits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const audit = await prisma.academicAudit.create({
      data: {
        academicYearId: body.academicYearId,
        departmentId: body.departmentId || user.departmentId,
        auditDataJson: typeof body.auditData === 'object' ? JSON.stringify(body.auditData) : body.auditData || '{}',
        score: Number(body.score || 0.0),
        status: body.status || 'Draft',
        reviewerRemarks: body.reviewerRemarks || null,
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'AUDIT',
      recordId: audit.id,
      details: { status: audit.status, score: audit.score },
    });

    return NextResponse.json({ audit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
