import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'IQAC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, shift, code, isActive } = body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(shift ? { shift: shift.trim() } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
    });

    return NextResponse.json({ success: true, department });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'IQAC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Department removed' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
