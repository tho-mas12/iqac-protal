import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: params.id },
      include: {
        department: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Ensure department users can only trigger notifications for their own department
    if (session.role === 'DEPARTMENT' && session.departmentId && invitation.departmentId !== session.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Dispatch automated system trigger from system sender (9626806328) to Director (7418671366)
    const result = await sendWhatsAppNotification({
      departmentName: invitation.department?.name || 'Department',
      shift: invitation.shift || invitation.department?.shift || 'Shift I',
      programTitle: invitation.programTitle,
      fromDate: invitation.fromDate,
      toDate: invitation.toDate,
      status: invitation.status === 'PENDING' ? 'Pending Review' : invitation.status,
      invitationId: invitation.id,
    });

    return NextResponse.json({
      success: true,
      message: `Notification triggered to Director (7418671366) from system sender (9626806328)`,
      result,
    });
  } catch (error: any) {
    console.error('Error sending WhatsApp notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to trigger notification' }, { status: 500 });
  }
}
