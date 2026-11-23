import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getMqcMembers, setMqcMembers, checkIsMqcMember } from '@/lib/mqc';
import { checkUserIsMqc, checkUserIsHod } from '@/lib/academic-roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mqcList = getMqcMembers();

    // Check if the current session itself is an authorized MQC member & HOD
    let isCurrentMqc = false;
    let isCurrentHod = false;
    if (session.role === 'ADMIN') {
      isCurrentMqc = true;
      isCurrentHod = true;
    } else {
      let deptCode: string | null = null;
      if (session.departmentId) {
        try {
          const dept = await prisma.department.findUnique({
            where: { id: session.departmentId },
            select: { id: true, code: true },
          });
          deptCode = dept?.code || null;
        } catch {
          deptCode = null;
        }
      }
      isCurrentMqc = checkUserIsMqc(session.username, deptCode);
      isCurrentHod = checkUserIsHod(session.username, deptCode);
    }

    // If Admin, also return list of all departments with their MQC status
    let departmentsWithStatus: any[] = [];
    if (session.role === 'ADMIN') {
      try {
        const allDepts = await prisma.department.findMany({
          select: {
            id: true,
            name: true,
            code: true,
            shift: true,
            isActive: true,
          },
          orderBy: [{ shift: 'asc' }, { name: 'asc' }],
        });

        const upperList = mqcList.map((m) => m.toUpperCase());
        departmentsWithStatus = allDepts.map((d) => ({
          ...d,
          isMqc: upperList.includes(d.code.toUpperCase()) || upperList.includes(d.id.toUpperCase()),
        }));
      } catch (e) {
        console.error('Error listing departments for MQC:', e);
      }
    }

    return NextResponse.json({
      success: true,
      mqcMembers: mqcList,
      isCurrentMqc,
      isCurrentHod,
      role: session.role,
      departments: departmentsWithStatus,
    });
  } catch (error: any) {
    console.error('Error in MQC GET route:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch MQC info' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { departmentCodes } = body;

    if (!Array.isArray(departmentCodes)) {
      return NextResponse.json({ error: 'departmentCodes must be an array of department codes' }, { status: 400 });
    }

    const saved = setMqcMembers(departmentCodes);
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save MQC members' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'MQC members updated successfully',
      mqcMembers: getMqcMembers(),
    });
  } catch (error: any) {
    console.error('Error in MQC POST route:', error);
    return NextResponse.json({ error: error.message || 'Failed to update MQC members' }, { status: 500 });
  }
}
