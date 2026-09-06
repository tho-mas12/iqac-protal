import { prisma } from '@/lib/prisma';

let syncAttempted = false;

export async function autoSyncDatabaseColumns() {
  if (syncAttempted) return;
  syncAttempted = true;

  try {
    const existing = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    if (!existing) {
      await prisma.systemSettings.create({
        data: {
          id: 'default',
          whatsappSenderNumber: '9626806328',
          whatsappReceiverNumber: '7418671366',
          whatsappEnabled: true,
          whatsappProvider: 'ultramsg',
        },
      });
    }
  } catch (e) {
    // Ignore if already initialized
  }
}
