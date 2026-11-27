import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export type ActionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
export type ModuleType = 'AAA' | 'COURSE_PLAN' | 'INVITATIONS' | 'USERS' | 'SETTINGS' | 'AUTH' | 'GENERAL';

export interface LogActionParams {
  req?: NextRequest;
  username: string;
  role?: string;
  actorId?: string;
  action: ActionType;
  module: ModuleType;
  targetId?: string;
  targetName?: string;
  details?: string | Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export function extractClientDetails(req?: NextRequest): { ipAddress: string; userAgent: string } {
  if (!req) {
    return { ipAddress: '127.0.0.1', userAgent: 'Internal / Background Service' };
  }
  const forwarded = req.headers.get('x-forwarded-for');
  const ipAddress = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers.get('x-real-ip')?.trim() || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'Browser';
  return { ipAddress, userAgent };
}

/**
 * Persists an action log record to MySQL.
 * Non-blocking: will never crash caller execution if database log insertion fails.
 */
export async function logAction(params: LogActionParams): Promise<void> {
  try {
    const { ipAddress: derivedIp, userAgent: derivedUa } = extractClientDetails(params.req);
    const ip = params.ipAddress || derivedIp;
    const ua = params.userAgent || derivedUa;

    let detailsStr: string | null = null;
    if (params.details) {
      detailsStr = typeof params.details === 'object' ? JSON.stringify(params.details) : String(params.details);
    }

    await prisma.actionLog.create({
      data: {
        username: (params.username || 'ANONYMOUS').trim().toUpperCase(),
        role: params.role || 'USER',
        actorId: params.actorId || null,
        action: params.action,
        module: params.module,
        targetId: params.targetId || null,
        targetName: params.targetName || null,
        details: detailsStr,
        ipAddress: ip,
        userAgent: ua,
      },
    });
  } catch (err) {
    console.error('[ActionLogger Error]:', err);
  }
}
