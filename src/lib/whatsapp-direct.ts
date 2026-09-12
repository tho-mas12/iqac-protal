/**
 * Safe 1-Click WhatsApp Direct Link Generator
 * Uses standard official `wa.me` links without requiring backend bots or QR scanning,
 * 100% immune to WhatsApp account bans.
 */

export interface WhatsAppDirectOptions {
  receiverPhone?: string;
  departmentName: string;
  shift?: string;
  programTitle: string;
  category?: string;
  fromDate: string | Date;
  toDate?: string | Date | null;
  status?: string;
  remarks?: string;
  portalUrl?: string;
}

const DEFAULT_IQAC_PHONE = '7418671366'; // Dr. A. Johnson Francis / IQAC Office
const PORTAL_BASE_URL = 'https://sjciqac.frontierwox.in';

export function getWhatsAppSubmissionUrl(options: WhatsAppDirectOptions): string {
  const phone = options.receiverPhone || DEFAULT_IQAC_PHONE;
  const cleanPhone = phone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
    ? cleanPhone
    : (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone);

  const fromFormatted = options.fromDate ? new Date(options.fromDate).toLocaleDateString('en-GB') : '';
  const toFormatted = options.toDate ? ` to ${new Date(options.toDate).toLocaleDateString('en-GB')}` : '';
  const dateStr = `${fromFormatted}${toFormatted}`;

  const message = `🏛️ *St. Joseph's College (Autonomous)*\n*IQAC Invitation Portal Notification*\n\n📋 *New Invitation Submitted for Review*\n• *Department:* ${options.departmentName} (${options.shift || 'Shift I'})\n• *Program:* ${options.programTitle}\n• *Category:* ${options.category || 'Event'}\n• *Date(s):* ${dateStr}\n• *Status:* ${options.status || 'Pending Director Review'}\n\n🔗 *Review on Portal:* ${PORTAL_BASE_URL}/director/dashboard\n\n_Submitted via SJC IQAC Portal_`;

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppApprovalShareUrl(options: WhatsAppDirectOptions): string {
  const fromFormatted = options.fromDate ? new Date(options.fromDate).toLocaleDateString('en-GB') : '';
  const toFormatted = options.toDate ? ` to ${new Date(options.toDate).toLocaleDateString('en-GB')}` : '';
  const dateStr = `${fromFormatted}${toFormatted}`;

  const message = `🎉 *IQAC Invitation Verified & Approved! — SJC*\n\n• *Department:* ${options.departmentName} (${options.shift || 'Shift I'})\n• *Event:* ${options.programTitle}\n• *Date(s):* ${dateStr}\n• *Category:* ${options.category || 'Event'}\n\n✅ Verified by IQAC Director. Next steps: Physical copy submission & ERP dispatch.\n\n🔗 *Portal:* ${PORTAL_BASE_URL}/department/dashboard`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppRemarksUrl(receiverPhone: string, options: WhatsAppDirectOptions): string {
  const cleanPhone = receiverPhone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
    ? cleanPhone
    : (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone);

  const message = `⚠️ *SJC IQAC Invitation Portal — Remarks Return*\n\n• *Department:* ${options.departmentName}\n• *Program:* ${options.programTitle}\n\n📝 *Director's Remarks:* ${options.remarks || 'Please check remarks on the portal and re-upload the corrected version.'}\n\n🔗 *Re-upload here:* ${PORTAL_BASE_URL}/department/remarks`;

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}
