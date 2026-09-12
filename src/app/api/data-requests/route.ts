import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = req.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');

    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;

    const dataRequests = await prisma.dataRequest.findMany({
      where,
      include: {
        academicYear: true,
        assignedMember: true,
        dynamicForm: true,
        submissions: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If user is department role, filter visible requests
    let filtered = dataRequests;
    if (user && (user.role === 'HOD' || user.role === 'DEPT_COORDINATOR' || user.role === 'FACULTY')) {
      filtered = dataRequests.filter((dr) => {
        if (dr.targetDepartments === 'ALL') return true;
        try {
          const depts: string[] = JSON.parse(dr.targetDepartments);
          return depts.includes(user.departmentId || '');
        } catch (e) {
          return true;
        }
      });
    }

    return NextResponse.json({ dataRequests: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN' && user.role !== 'IQAC_MEMBER')) {
      return NextResponse.json({ error: 'Unauthorized to create data requests' }, { status: 403 });
    }

    const body = await req.json();

    const count = await prisma.dataRequest.count();
    const reqNumber = body.reqNumber || `DR-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const dataRequest = await prisma.dataRequest.create({
      data: {
        reqNumber,
        title: body.title,
        instructions: body.instructions || null,
        academicYearId: body.academicYearId,
        targetDepartments: Array.isArray(body.targetDepartments) ? JSON.stringify(body.targetDepartments) : body.targetDepartments || 'ALL',
        deadline: body.deadline ? new Date(body.deadline) : null,
        assignedMemberId: body.assignedMemberId || user.userId,
        status: 'ACTIVE',
        formId: body.formId || null,
      },
    });

    // Create notifications for target departments
    let deptIdsToNotify: string[] = [];
    if (body.targetDepartments === 'ALL') {
      const allDepts = await prisma.department.findMany({ select: { id: true } });
      deptIdsToNotify = allDepts.map((d) => d.id);
    } else if (Array.isArray(body.targetDepartments)) {
      deptIdsToNotify = body.targetDepartments;
    }

    const deptUsers = await prisma.user.findMany({
      where: {
        departmentId: { in: deptIdsToNotify },
        role: { in: ['HOD', 'DEPT_COORDINATOR'] },
      },
    });

    for (const dUser of deptUsers) {
      await prisma.notification.create({
        data: {
          userId: dUser.id,
          title: 'New Data Collection Task Assigned',
          message: `IQAC assigned task: ${dataRequest.title}. Deadline: ${dataRequest.deadline ? new Date(dataRequest.deadline).toLocaleDateString() : 'N/A'}`,
          type: 'TASK_ASSIGNED',
        },
      });
    }

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'DATA_REQUEST',
      recordId: dataRequest.id,
      details: { reqNumber: dataRequest.reqNumber, title: dataRequest.title },
    });

    return NextResponse.json({ dataRequest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
