import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { uploadFileToDrive } from '@/lib/drive';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'DEPARTMENT') {
      return NextResponse.json({ error: 'Only departments can re-upload corrected invitations' }, { status: 403 });
    }

    const { id } = params;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.departmentId !== session.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const correctionNotes = (formData.get('notes') as string) || 'Corrected invitation uploaded';

    if (!file) {
      return NextResponse.json({ error: 'Please select a corrected file to upload' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive
    const uploadResult = await uploadFileToDrive(
      buffer,
      `corrected_${file.name}`,
      file.type,
      invitation.department.name,
      invitation.shift,
      invitation.department.driveFolderId
    );

    const nextRevision = invitation.revisionCount + 1;
    const fileUrl = uploadResult.webViewLink;

    const updated = await prisma.invitation.update({
      where: { id },
      data: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        driveFileId: uploadResult.fileId,
        fileData: fileUrl,
        driveViewLink: `/api/invitations/${id}/file`,
        driveDownloadLink: `/api/invitations/${id}/file`,
        localFilePath: `/api/invitations/${id}/file`,
        status: 'PENDING', // Send back to pending for Director review
        revisionCount: nextRevision,
        history: {
          create: {
            action: 'REUPLOAD_CORRECTION',
            actorName: session.name,
            actorRole: session.role,
            notes: `Revision #${nextRevision} submitted: ${correctionNotes}`,
            driveFileId: uploadResult.fileId,
            fileData: fileUrl,
          },
        },
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Corrected invitation (Revision #${nextRevision}) uploaded and re-sent to Director.`,
      invitation: updated,
    });
  } catch (error: any) {
    console.error('Error re-uploading invitation:', error);
    return NextResponse.json({ error: error.message || 'Failed to re-upload corrected invitation' }, { status: 500 });
  }
}
