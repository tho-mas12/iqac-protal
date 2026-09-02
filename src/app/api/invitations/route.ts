import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { uploadFileToDrive } from '@/lib/drive';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const where: any = {};

    // Department can only view their own invitations
    if (session.role === 'DEPARTMENT') {
      if (!session.departmentId) {
        return NextResponse.json({ error: 'User is not assigned to a department' }, { status: 400 });
      }
      where.departmentId = session.departmentId;
    } else if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (category) {
      where.category = category;
    }

    // Sort priority-wise: latest submissions and revisions first
    const invitations = await prisma.invitation.findMany({
      where,
      include: {
        department: true,
        history: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // Calculate statistics
    const statsWhere = session.role === 'DEPARTMENT' ? { departmentId: session.departmentId! } : {};
    
    const [total, pending, remarks, approved] = await Promise.all([
      prisma.invitation.count({ where: statsWhere }),
      prisma.invitation.count({ where: { ...statsWhere, status: 'PENDING' } }),
      prisma.invitation.count({ where: { ...statsWhere, status: 'REMARKS' } }),
      prisma.invitation.count({ where: { ...statsWhere, status: 'APPROVED' } }),
    ]);

    // Last 24 hours pending count for director
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hPending = await prisma.invitation.count({
      where: {
        ...statsWhere,
        status: 'PENDING',
        createdAt: { gte: oneDayAgo },
      },
    });

    return NextResponse.json({
      success: true,
      invitations,
      stats: {
        total,
        pending,
        remarks,
        approved,
        last24hPending,
      },
    });
  } catch (error: any) {
    console.error('Error listing invitations:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'DEPARTMENT') {
      return NextResponse.json({ error: 'Only departments can upload invitations' }, { status: 403 });
    }

    if (!session.departmentId) {
      return NextResponse.json({ error: 'No department linked to current user account' }, { status: 400 });
    }

    const department = await prisma.department.findUnique({
      where: { id: session.departmentId },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const programTitle = formData.get('programTitle') as string;
    const category = formData.get('category') as string;
    const customCategory = (formData.get('customCategory') as string) || null;
    const shift = (formData.get('shift') as string) || department.shift || 'Shift I';
    const fromDateStr = formData.get('fromDate') as string;
    const toDateStr = formData.get('toDate') as string;
    const file = formData.get('file') as File | null;

    if (!programTitle || !category || !fromDateStr) {
      return NextResponse.json({ error: 'Program Title, Category, and From Date are required.' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Invitation file (image or PDF) is required.' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to Google Drive in department folder
    const uploadResult = await uploadFileToDrive(
      buffer,
      file.name,
      file.type,
      department.name,
      shift,
      department.driveFolderId
    );

    const fromDate = new Date(fromDateStr);
    const toDate = toDateStr ? new Date(toDateStr) : null;

    // Create Invitation in database
    const fileUrl = uploadResult.webViewLink.startsWith('data:')
      ? uploadResult.webViewLink
      : uploadResult.webViewLink;

    const invitation = await prisma.invitation.create({
      data: {
        programTitle: programTitle.trim(),
        departmentId: department.id,
        shift: shift,
        category: category === 'Other' && customCategory ? customCategory : category,
        customCategory: category === 'Other' ? customCategory : null,
        fromDate,
        toDate,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        driveFileId: uploadResult.fileId,
        fileData: fileUrl,
        driveViewLink: `/api/invitations/__ID__/file`,
        driveDownloadLink: `/api/invitations/__ID__/file`,
        localFilePath: `/api/invitations/__ID__/file`,
        status: 'PENDING',
        revisionCount: 0,
        history: {
          create: {
            action: 'UPLOAD',
            actorName: session.name,
            actorRole: session.role,
            notes: 'Initial invitation submission',
            driveFileId: uploadResult.fileId,
            fileData: fileUrl,
          },
        },
      },
      include: {
        department: true,
      },
    });

    // Construct absolute public HTTPS link for database storage
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host || 'iqac-protal.vercel.app';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const origin = isLocal ? `http://${host}` : `https://${host}`;
    const fullPublicUrl = `${origin}/api/invitations/${invitation.id}/file`;

    // Update with real ID in the link
    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        driveViewLink: fullPublicUrl,
        driveDownloadLink: fullPublicUrl,
        localFilePath: fullPublicUrl,
      },
      include: {
        department: true,
      },
    });

    // Trigger automated WhatsApp notification to Director/IQAC receiver
    try {
      await sendWhatsAppNotification({
        departmentName: updatedInvitation.department?.name || 'Department',
        shift: updatedInvitation.shift || updatedInvitation.department?.shift || 'Shift I',
        programTitle: updatedInvitation.programTitle,
        fromDate: updatedInvitation.fromDate,
        toDate: updatedInvitation.toDate,
        status: 'Pending Review',
        invitationId: updatedInvitation.id,
      });
    } catch (e) {
      console.error('[WhatsApp Trigger Warning]', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation uploaded successfully and submitted for IQAC review.',
      invitation: updatedInvitation,
    });
  } catch (error: any) {
    console.error('Error uploading invitation:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit invitation' }, { status: 500 });
  }
}
