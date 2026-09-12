import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const departmentId = searchParams.get('departmentId');
    const frameworkId = searchParams.get('frameworkId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (departmentId) where.responsibleDeptId = departmentId;
    if (frameworkId) where.frameworkId = frameworkId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { reqId: { contains: search } },
        { criterion: { contains: search } },
      ];
    }

    const requirements = await prisma.requirements.findMany({
      where,
      include: {
        framework: true,
        department: true,
        academicYear: true,
        assignedMember: true,
        evidences: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requirements });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN' && user.role !== 'IQAC_MEMBER')) {
      return NextResponse.json({ error: 'Unauthorized to create requirements' }, { status: 403 });
    }

    const body = await req.json();

    // Auto-generate Req ID if missing
    const reqCount = await prisma.requirements.count();
    const generatedReqId = body.reqId || `REQ-${new Date().getFullYear()}-${String(reqCount + 1).padStart(3, '0')}`;

    const requirement = await prisma.requirements.create({
      data: {
        reqId: generatedReqId,
        title: body.title,
        description: body.description || null,
        category: body.category || 'General',
        frameworkId: body.frameworkId,
        criterion: body.criterion || 'General Criterion',
        subCriterion: body.subCriterion || null,
        sourceAuthority: body.sourceAuthority || null,
        academicYearId: body.academicYearId,
        responsibleDeptId: body.responsibleDeptId || null,
        priority: body.priority || 'MEDIUM',
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || 'Not Started',
        remarks: body.remarks || null,
        requiredEvidence: body.requiredEvidence || null,
        assignedMemberId: body.assignedMemberId || user.userId,
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'REQUIREMENT',
      recordId: requirement.id,
      details: { title: requirement.title, reqId: requirement.reqId },
    });

    return NextResponse.json({ requirement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Requirement ID is required' }, { status: 400 });

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);

    const updated = await prisma.requirements.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'UPDATE',
      module: 'REQUIREMENT',
      recordId: updated.id,
      details: { status: updated.status },
    });

    return NextResponse.json({ requirement: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
