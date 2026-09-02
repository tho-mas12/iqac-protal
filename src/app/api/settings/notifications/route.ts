import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { autoSyncDatabaseColumns } from '@/lib/db-sync';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await autoSyncDatabaseColumns();

    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          whatsappSenderNumber: '9626806328',
          whatsappReceiverNumber: '7418671366',
          whatsappEnabled: true,
          whatsappProvider: 'ultramsg',
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        settings: {
          whatsappSenderNumber: '9626806328',
          whatsappReceiverNumber: '7418671366',
          whatsappEnabled: true,
          whatsappProvider: 'ultramsg',
        },
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can update notification settings' }, { status: 403 });
    }

    await autoSyncDatabaseColumns();

    const body = await req.json();
    const {
      whatsappSenderNumber,
      whatsappReceiverNumber,
      whatsappEnabled,
      whatsappProvider,
      whatsappInstanceId,
      whatsappApiKey,
      whatsappCustomWebhookUrl,
    } = body;

    const updated = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        whatsappSenderNumber: whatsappSenderNumber ? String(whatsappSenderNumber).replace(/\D/g, '') : '9626806328',
        whatsappReceiverNumber: whatsappReceiverNumber ? String(whatsappReceiverNumber).replace(/\D/g, '') : '7418671366',
        whatsappEnabled: whatsappEnabled !== undefined ? Boolean(whatsappEnabled) : true,
        whatsappProvider: whatsappProvider || 'ultramsg',
        whatsappInstanceId: whatsappInstanceId !== undefined ? String(whatsappInstanceId).trim() : null,
        whatsappApiKey: whatsappApiKey !== undefined ? String(whatsappApiKey).trim() : null,
        whatsappCustomWebhookUrl: whatsappCustomWebhookUrl !== undefined ? String(whatsappCustomWebhookUrl).trim() : null,
      },
      create: {
        id: 'default',
        whatsappSenderNumber: whatsappSenderNumber ? String(whatsappSenderNumber).replace(/\D/g, '') : '9626806328',
        whatsappReceiverNumber: whatsappReceiverNumber ? String(whatsappReceiverNumber).replace(/\D/g, '') : '7418671366',
        whatsappEnabled: whatsappEnabled !== undefined ? Boolean(whatsappEnabled) : true,
        whatsappProvider: whatsappProvider || 'ultramsg',
        whatsappInstanceId: whatsappInstanceId !== undefined ? String(whatsappInstanceId).trim() : null,
        whatsappApiKey: whatsappApiKey !== undefined ? String(whatsappApiKey).trim() : null,
        whatsappCustomWebhookUrl: whatsappCustomWebhookUrl !== undefined ? String(whatsappCustomWebhookUrl).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp notification settings saved successfully.',
      settings: updated,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save notification settings' }, { status: 500 });
  }
}
