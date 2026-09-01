import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        department: true,
        history: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Role check: Department can only view their own
    if (session.role === 'DEPARTMENT' && invitation.departmentId !== session.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch invitation details' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'DEPARTMENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const inv = await prisma.invitation.findUnique({ where: { id } });

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (session.role === 'DEPARTMENT' && inv.departmentId !== session.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.invitation.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Invitation removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 });
  }
}
