import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { autoSyncDatabaseColumns } from '@/lib/db-sync';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN' && session.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await autoSyncDatabaseColumns();

    const { id } = params;
    const body = await req.json();
    const { sent } = body;

    const isSent = sent === undefined ? true : Boolean(sent);

    const updated = await prisma.invitation.update({
      where: { id },
      data: {
        mailSent: isSent,
        mailSentAt: isSent ? new Date() : null,
        mailSentStaffName: isSent ? session.name : null,
        history: {
          create: {
            action: isSent ? 'ERP_MAIL_SENT' : 'ERP_MAIL_UNMARKED',
            actorName: session.name,
            actorRole: session.role,
            notes: isSent ? `ERP publication mail marked as sent by ${session.name}` : 'ERP mail status reset',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: isSent ? 'Mail marked as Sent to ERP.' : 'Mail status updated.',
      invitation: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update mail status' }, { status: 500 });
  }
}
