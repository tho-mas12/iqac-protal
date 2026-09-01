import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: {
        fileData: true,
        driveViewLink: true,
        localFilePath: true,
        mimeType: true,
        fileName: true,
      },
    });

    if (!invitation) {
      return new NextResponse('File not found', { status: 404 });
    }

    const mimeType = invitation.mimeType || 'image/png';
    const fileName = invitation.fileName || 'invitation.png';

    // 1. Check for Base64 Data URL or string in fileData or driveViewLink
    const dataCandidate = invitation.fileData || invitation.driveViewLink || invitation.localFilePath;

    if (dataCandidate && dataCandidate.startsWith('data:')) {
      const base64Index = dataCandidate.indexOf(';base64,');
      if (base64Index !== -1) {
        const base64Part = dataCandidate.slice(base64Index + 8);
        const buffer = Buffer.from(base64Part, 'base64');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': 'inline; filename="' + fileName + '"',
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      }
    }

    // 2. Check if candidate is pure Base64 without data prefix
    if (dataCandidate && dataCandidate.length > 500 && !dataCandidate.startsWith('http') && !dataCandidate.startsWith('/')) {
      try {
        const buffer = Buffer.from(dataCandidate, 'base64');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': 'inline; filename="' + fileName + '"',
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      } catch {}
    }

    // 3. Check if it's an external HTTP URL (e.g. cPanel PHP URL)
    if (dataCandidate && dataCandidate.startsWith('http')) {
      return NextResponse.redirect(dataCandidate);
    }

    // 4. Fallback to local filesystem if exists
    if (invitation.localFilePath && invitation.localFilePath.startsWith('/uploads/')) {
      const localDiskPath = path.join(process.cwd(), 'public', invitation.localFilePath);
      if (fs.existsSync(localDiskPath)) {
        const fileBuffer = fs.readFileSync(localDiskPath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': 'inline; filename="' + fileName + '"',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }

    return new NextResponse('File data is not available', { status: 404 });
  } catch (error: any) {
    console.error('Error serving invitation file:', error);
    return new NextResponse('Error retrieving file', { status: 500 });
  }
}
