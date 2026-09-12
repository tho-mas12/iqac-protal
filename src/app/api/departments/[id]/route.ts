import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, shift, code, isActive } = body;

    const deptName = name?.trim();
    const deptShift = shift?.trim();
    const deptCode = code?.trim().toUpperCase();

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(deptName ? { name: deptName } : {}),
        ...(deptShift ? { shift: deptShift } : {}),
        ...(deptCode ? { code: deptCode } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
    });

    // If name or shift changed, also update the display name of assigned users
    if (deptName || deptShift) {
      await prisma.user.updateMany({
        where: { departmentId: id },
        data: {
          name: `${department.name} (${department.shift})`,
        },
      });
    }

    // If isActive changed, also update user status
    if (typeof isActive === 'boolean') {
      await prisma.user.updateMany({
        where: { departmentId: id },
        data: { isActive },
      });
    }

    return NextResponse.json({ success: true, department, message: 'Department updated successfully' });
  } catch (error: any) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: error.message || 'Failed to update department' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive boolean is required' }, { status: 400 });
    }

    const department = await prisma.department.update({
      where: { id },
      data: { isActive },
    });

    // Also toggle the department user
    await prisma.user.updateMany({
      where: { departmentId: id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      message: isActive ? `Department "${department.name}" enabled.` : `Department "${department.name}" disabled.`,
      department,
    });
  } catch (error: any) {
    console.error('Error toggling department status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update department status' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Department removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}

// Action to Reset Department Password back to default "sjciqac"
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const defaultPassword = await hashPassword('sjciqac');

    const users = await prisma.user.findMany({
      where: { departmentId: id },
    });

    if (users.length === 0) {
      return NextResponse.json({ error: 'No user account found for this department' }, { status: 404 });
    }

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: defaultPassword,
          isPasswordChanged: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset to default 'sjciqac' for ${users.length} user account(s).`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
