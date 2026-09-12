import { prisma } from './prisma';

export interface AuditParams {
  userId?: string | null;
  userName?: string | null;
  role?: string | null;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'SUBMIT'
    | 'APPROVE'
    | 'REJECT'
    | 'CORRECTION'
    | 'IMPORT'
    | 'EXPORT';
  module:
    | 'AUTH'
    | 'REQUIREMENT'
    | 'DATA_REQUEST'
    | 'FACULTY'
    | 'STUDENT'
    | 'ACTIVITY'
    | 'AUDIT'
    | 'EVIDENCE'
    | 'COMPLIANCE'
    | 'MEETING'
    | 'MASTER_DATA';
  recordId?: string | null;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(params: AuditParams) {
  try {
    const detailsStr =
      typeof params.details === 'object' ? JSON.stringify(params.details) : params.details || null;

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || 'System',
        role: params.role || 'GUEST',
        action: params.action,
        module: params.module,
        recordId: params.recordId || null,
        detailsJson: detailsStr,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}
