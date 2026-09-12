import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (user) {
    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'LOGOUT',
      module: 'AUTH',
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
