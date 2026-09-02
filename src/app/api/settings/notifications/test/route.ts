import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const result = await sendWhatsAppNotification({
      departmentName: 'Computer Science',
      shift: 'Shift I',
      programTitle: 'National Seminar on Deep Learning (Test Dispatch)',
      fromDate: new Date(),
      status: 'Pending Review (Test Alert)',
    });

    return NextResponse.json({
      success: true,
      message: result.automated
        ? 'Automated WhatsApp message delivered successfully to receiver!'
        : 'Message created. (If no API key is set yet, you can test with the Direct WhatsApp button below).',
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to dispatch test' }, { status: 500 });
  }
}
