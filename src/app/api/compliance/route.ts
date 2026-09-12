import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category'); // UGC, NEP, NAAC, NIRF

    const where: any = {};
    if (category) where.category = category;

    const complianceItems = await prisma.ugcNepCompliance.findMany({
      where,
      orderBy: { requirementName: 'asc' },
    });

    const summary = {
      total: complianceItems.length,
      compliant: complianceItems.filter((i) => i.status === 'Compliant').length,
      partiallyCompliant: complianceItems.filter((i) => i.status === 'Partially Compliant').length,
      notCompliant: complianceItems.filter((i) => i.status === 'Not Compliant').length,
      underReview: complianceItems.filter((i) => i.status === 'Under Review').length,
    };

    return NextResponse.json({ complianceItems, summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN' && user.role !== 'IQAC_MEMBER')) {
      return NextResponse.json({ error: 'Unauthorized to modify compliance items' }, { status: 403 });
    }

    const body = await req.json();

    const item = await prisma.ugcNepCompliance.create({
      data: {
        requirementName: body.requirementName,
        category: body.category || 'UGC',
        sourceAuthority: body.sourceAuthority || null,
        status: body.status || 'Not Compliant',
        responsiblePerson: body.responsiblePerson || null,
        remarks: body.remarks || null,
        dueDates: body.dueDates ? new Date(body.dueDates) : null,
        evidenceFileUrl: body.evidenceFileUrl || null,
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'COMPLIANCE',
      recordId: item.id,
      details: { requirementName: item.requirementName, category: item.category },
    });

    return NextResponse.json({ item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN' && user.role !== 'IQAC_MEMBER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    const item = await prisma.ugcNepCompliance.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'UPDATE',
      module: 'COMPLIANCE',
      recordId: item.id,
      details: { status: item.status },
    });

    return NextResponse.json({ item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
