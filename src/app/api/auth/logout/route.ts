import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { removeSession } from '@/lib/session-lock';
import { logAction } from '@/lib/action-logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (session?.username) {
      removeSession(session.username);
      await logAction({
        req,
        username: session.username,
        role: session.role,
        actorId: session.userId,
        action: 'LOGOUT',
        module: 'AUTH',
        details: `User "${session.username}" logged out.`,
      });
    }
  } catch {}

  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.delete(AUTH_COOKIE_NAME);
  return res;
}
