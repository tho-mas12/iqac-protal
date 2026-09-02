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

/**
 * 100% Fully Automated Background WhatsApp Dispatcher
 * Sends message automatically to the recipient via WhatsApp Cloud / UltraMsg / GreenAPI / Webhook API.
 */
export async function sendWhatsAppNotification(payload: WhatsAppNotificationPayload) {
  try {
    await autoSyncDatabaseColumns();

    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    const senderNumber = settings?.whatsappSenderNumber || '9626806328';
    const receiverNumber = settings?.whatsappReceiverNumber || '7418671366';
    const isEnabled = settings ? settings.whatsappEnabled : true;
    const provider = settings?.whatsappProvider || 'ultramsg';
    const instanceId = settings?.whatsappInstanceId?.trim() || '';
    const apiKey = settings?.whatsappApiKey?.trim() || '';
    const customWebhook = settings?.whatsappCustomWebhookUrl?.trim() || '';

    if (!isEnabled) {
      console.log('[WhatsApp Notification] Disabled in settings.');
      return { success: false, reason: 'Disabled in Admin Settings' };
    }

    const message = formatInvitationAlertMessage(payload);
    const directUrl = generateWhatsAppDirectLink(receiverNumber, message);

    const cleanReceiver = receiverNumber.replace(/\D/g, '');
    const internationalReceiver = cleanReceiver.startsWith('91') && cleanReceiver.length === 12
      ? cleanReceiver
      : (cleanReceiver.length === 10 ? `91${cleanReceiver}` : cleanReceiver);

    let automatedDispatchSuccess = false;
    let apiResponseData: any = null;

    // 1. UltraMsg Automated API Dispatch
    if (provider === 'ultramsg' && instanceId && apiKey) {
      try {
        const res = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: apiKey,
            to: `+${internationalReceiver}`,
            body: message,
          }),
        });
        apiResponseData = await res.json();
        automatedDispatchSuccess = res.ok && (apiResponseData.sent === 'true' || apiResponseData.id);
        console.log('[UltraMsg Automated Dispatch Result]', apiResponseData);
      } catch (err) {
        console.error('[UltraMsg Error]', err);
      }
    }
    // 2. GreenAPI Automated Dispatch
    else if (provider === 'greenapi' && instanceId && apiKey) {
      try {
        const res = await fetch(`https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `${internationalReceiver}@c.us`,
            message: message,
          }),
        });
        apiResponseData = await res.json();
        automatedDispatchSuccess = res.ok && apiResponseData.idMessage;
        console.log('[GreenAPI Automated Dispatch Result]', apiResponseData);
      } catch (err) {
        console.error('[GreenAPI Error]', err);
      }
    }
    // 3. Custom Webhook / Meta API
    else if (provider === 'custom_webhook' && customWebhook) {
      try {
        const res = await fetch(customWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: senderNumber,
            receiver: internationalReceiver,
            message: message,
            payload: payload,
          }),
        });
        apiResponseData = await res.text();
        automatedDispatchSuccess = res.ok;
      } catch (err) {
        console.error('[Custom Webhook Error]', err);
      }
    }

    console.log(`[WhatsApp Notification Output] To: ${internationalReceiver}, Automated: ${automatedDispatchSuccess}`);

    return {
      success: true,
      automated: automatedDispatchSuccess,
      senderNumber,
      receiverNumber,
      message,
      directUrl,
      apiResponse: apiResponseData,
    };
  } catch (error) {
    console.error('[WhatsApp Notification Exception]', error);
    return { success: false, error };
  }
}
