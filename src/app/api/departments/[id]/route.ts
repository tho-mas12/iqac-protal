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
    const { name, shift, code } = body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(shift ? { shift: shift.trim() } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
      },
    });

    return NextResponse.json({ success: true, department });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
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
