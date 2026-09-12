import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN' && session.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { received } = body;

    const isReceived = Boolean(received);

    const updated = await prisma.invitation.update({
      where: { id },
      data: {
        hardCopyReceived: isReceived,
        hardCopyReceivedAt: isReceived ? new Date() : null,
        hardCopyStaffName: isReceived ? session.name : null,
        // When hard copy is received, automatically mark ERP mail as sent/dispatched as well
        ...(isReceived
          ? {
              mailSent: true,
              mailSentAt: new Date(),
              mailSentStaffName: session.name,
            }
          : {}),
        history: {
          create: {
            action: isReceived ? 'HARD_COPY_MARKED' : 'HARD_COPY_UNMARKED',
            actorName: session.name,
            actorRole: session.role,
            notes: isReceived
              ? `Hard copy received & auto-dispatched to ERP by ${session.name}`
              : 'Hard copy marked as pending',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: isReceived
        ? 'Hard copy received & publication marked as Sent to ERP!'
        : 'Hard copy status reset to pending.',
      invitation: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update hard copy status' }, { status: 500 });
  }
}
