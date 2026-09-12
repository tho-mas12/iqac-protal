import { prisma } from '@/lib/prisma';

export interface WhatsAppNotificationPayload {
  departmentName: string;
  shift: string;
  programTitle: string;
  fromDate: string | Date;
  toDate?: string | Date | null;
  status?: string;
  invitationId?: string;
}

export function formatInvitationAlertMessage(payload: WhatsAppNotificationPayload): string {
  const fromFormatted = payload.fromDate ? new Date(payload.fromDate).toLocaleDateString('en-GB') : '';
  const toFormatted = payload.toDate ? ` - ${new Date(payload.toDate).toLocaleDateString('en-GB')}` : '';
  const eventDateStr = `${fromFormatted}${toFormatted}`;

  return `🏛️ IQAC Portal Alert — St. Joseph's College\nDepartment: ${payload.departmentName} (${payload.shift})\nProgram: ${payload.programTitle}\nEvent Date: ${eventDateStr}\nStatus: ${payload.status || 'Pending Review'}`;
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
    const senderNumber = '9626806328';
    const receiverNumber = '7418671366';

    const message = formatInvitationAlertMessage(payload);
    const directUrl = generateWhatsAppDirectLink(receiverNumber, message);

    return {
      success: true,
      automated: false,
      senderNumber,
      receiverNumber,
      message,
      directUrl,
    };
  } catch (error) {
    return { success: false, error };
  }
}
