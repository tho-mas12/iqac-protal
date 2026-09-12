import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { department: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid username or account disabled' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
      details: { username: user.username },
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
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
