import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { createDepartmentFolder } from '@/lib/drive';

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
            isPasswordChanged: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            invitations: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can perform bulk actions' }, { status: 403 });
    }

    const body = await req.json();
    const { action, isActive } = body;

    if (action === 'TOGGLE_BULK') {
      const targetState = Boolean(isActive);

      // Update all departments
      await prisma.department.updateMany({
        data: { isActive: targetState },
      });

      // Update all department users
      await prisma.user.updateMany({
        where: { role: 'DEPARTMENT' },
        data: { isActive: targetState },
      });

      return NextResponse.json({
        success: true,
        message: targetState
          ? 'All department accounts have been enabled.'
          : 'All department accounts have been disabled (blocked).',
      });
    }

    return NextResponse.json({ error: 'Invalid bulk action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in bulk department action:', error);
    return NextResponse.json({ error: error.message || 'Bulk action failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can create departments' }, { status: 403 });
    }

    const body = await req.json();
    const { name, shift, code, customUsername } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const deptShift = shift && shift.trim() ? shift.trim() : 'Shift I';
    const deptName = name.trim();
    
    // Generate department code if not provided
    let deptCode = code ? code.trim().toUpperCase() : deptName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
    if (deptShift === 'Shift II') deptCode += '_S2';

    // Ensure unique code
    let existingDept = await prisma.department.findUnique({ where: { code: deptCode } });
    if (existingDept) {
      deptCode = `${deptCode}_${Date.now().toString().slice(-4)}`;
    }

    // Create Department record
    const department = await prisma.department.create({
      data: {
        name: deptName,
        code: deptCode,
        shift: deptShift,
        driveFolderId: `dept_${deptCode}`,
      },
    });

    // Create Default Department User Login with password "sjciqac"
    const defaultPassword = await hashPassword('sjciqac');
    let username = customUsername ? customUsername.trim().toLowerCase() : `${deptName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${deptShift.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Ensure unique username
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      username = `${username}_${Date.now().toString().slice(-3)}`;
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: defaultPassword,
        name: `${deptName} (${deptShift})`,
        role: 'DEPARTMENT',
        departmentId: department.id,
        isPasswordChanged: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Department registered successfully!',
      department,
      user: {
        id: user.id,
        username: user.username,
        defaultPassword: 'sjciqac',
      },
    });
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: error.message || 'Failed to register department' }, { status: 500 });
  }
}
