import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'DIRECTOR') {
      return NextResponse.json({ error: 'Only the Director can review invitations' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { action, checkLogo, checkTitle, checkHeaders, checkOthers, directorRemarks } = body;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.invitation.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          checkLogo: checkLogo ?? invitation.checkLogo,
          checkTitle: checkTitle ?? invitation.checkTitle,
          checkHeaders: checkHeaders ?? invitation.checkHeaders,
          checkOthers: checkOthers ?? invitation.checkOthers,
          directorRemarks: directorRemarks || invitation.directorRemarks,
          history: {
            create: {
              action: 'APPROVED',
              actorName: session.name,
              actorRole: session.role,
              notes: directorRemarks ? `Approved with notes: ${directorRemarks}` : 'Invitation approved by Director',
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Invitation approved successfully!',
        invitation: updated,
      });
    } else if (action === 'REMARKS') {
      if (!directorRemarks || !directorRemarks.trim()) {
        return NextResponse.json({ error: 'Please enter remarks describing the necessary corrections.' }, { status: 400 });
      }

      const updated = await prisma.invitation.update({
        where: { id },
        data: {
          status: 'REMARKS',
          remarkedAt: new Date(),
          checkLogo: Boolean(checkLogo),
          checkTitle: Boolean(checkTitle),
          checkHeaders: Boolean(checkHeaders),
          checkOthers: Boolean(checkOthers),
          directorRemarks: directorRemarks.trim(),
          history: {
            create: {
              action: 'REMARKS_ADDED',
              actorName: session.name,
              actorRole: session.role,
              notes: directorRemarks.trim(),
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Remarks and checklist flags sent to department for corrections.',
        invitation: updated,
      });
    } else if (action === 'EDIT_REMARKS') {
      if (!directorRemarks || !directorRemarks.trim()) {
        return NextResponse.json({ error: 'Remarks content cannot be empty' }, { status: 400 });
      }

      const updated = await prisma.invitation.update({
        where: { id },
        data: {
          directorRemarks: directorRemarks.trim(),
          history: {
            create: {
              action: 'REMARKS_EDITED',
              actorName: session.name,
              actorRole: session.role,
              notes: `Updated remarks: ${directorRemarks.trim()}`,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Remarks updated successfully',
        invitation: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error reviewing invitation:', error);
    return NextResponse.json({ error: 'Failed to process review' }, { status: 500 });
  }
}
