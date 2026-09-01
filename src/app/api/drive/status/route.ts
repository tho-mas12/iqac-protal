import { NextResponse } from 'next/server';
import { testDriveConnection, isDriveConfigured } from '@/lib/drive';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isConfigured = isDriveConfigured();
    const result = await testDriveConnection();

    return NextResponse.json({
      configured: isConfigured,
      connected: result.connected,
      message: result.message,
      email: result.email,
      parentFolderId: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to test Drive connection' }, { status: 500 });
  }
}
