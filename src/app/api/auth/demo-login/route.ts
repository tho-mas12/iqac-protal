import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { role, isActive: true },
      include: { department: true },
    });

    if (!user) {
      return NextResponse.json({ error: `No active demo user found for role ${role}` }, { status: 404 });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role as any,
      departmentId: user.departmentId,
      schoolId: user.schoolId,
      shift: user.department?.shift || null,
    };

    const token = signToken(payload);

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'LOGIN',
      module: 'AUTH',
      details: { demoLogin: true, role },
    });

    const response = NextResponse.json({ success: true, user: payload });
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Demo login failed' }, { status: 500 });
  }
}
