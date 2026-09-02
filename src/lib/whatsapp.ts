import { prisma } from '@/lib/prisma';
import { autoSyncDatabaseColumns } from '@/lib/db-sync';

export interface WhatsAppNotificationPayload {
  departmentName: string;
  shift: string;
  programTitle: string;
  fromDate: string | Date;
  toDate?: string | Date | null;
  status?: string;
  invitationId?: string;
}

/**
 * Formats the exact message content requested:
 * 🏛️ IQAC Portal Alert — St. Joseph's College
 * New Invitation Submitted
 * Department: Computer Science (Shift I)
 * Program: National Seminar on Deep Learning
 * Event Date: 15/09/2026
 * Status: Pending Review
 */
export function formatInvitationAlertMessage(payload: WhatsAppNotificationPayload): string {
  const fromFormatted = payload.fromDate ? new Date(payload.fromDate).toLocaleDateString('en-GB') : '';
  const toFormatted = payload.toDate ? ` - ${new Date(payload.toDate).toLocaleDateString('en-GB')}` : '';
  const eventDateStr = `${fromFormatted}${toFormatted}`;

  return `🏛️ IQAC Portal Alert — St. Joseph's College\nNew Invitation Submitted\nDepartment: ${payload.departmentName} (${payload.shift})\nProgram: ${payload.programTitle}\nEvent Date: ${eventDateStr}\nStatus: ${payload.status || 'Pending Review'}`;
}

export function generateWhatsAppDirectLink(receiverPhone: string, message: string): string {
  const cleanNumber = receiverPhone.replace(/\D/g, '');
  const internationalNumber = cleanNumber.startsWith('91') && cleanNumber.length === 12
    ? cleanNumber
    : (cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber);

  return `https://api.whatsapp.com/send?phone=${internationalNumber}&text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppNotification(payload: WhatsAppNotificationPayload) {
  try {
    await autoSyncDatabaseColumns();

    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    const senderNumber = settings?.whatsappSenderNumber || '9626806328';
    const receiverNumber = settings?.whatsappReceiverNumber || '7418671366';
    const isEnabled = settings ? settings.whatsappEnabled : true;

    if (!isEnabled) {
      console.log('[WhatsApp Notification] Disabled in settings.');
      return { success: false, reason: 'Disabled in Admin Settings' };
    }

    const message = formatInvitationAlertMessage(payload);
    const directUrl = generateWhatsAppDirectLink(receiverNumber, message);

    console.log(`[WhatsApp Alert Generated] From ${senderNumber} -> To ${receiverNumber}`);
    console.log(message);

    return {
      success: true,
      senderNumber,
      receiverNumber,
      message,
      directUrl,
    };
  } catch (error) {
    console.error('[WhatsApp Notification Error]', error);
    return { success: false, error };
  }
}
