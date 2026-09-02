import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { autoSyncDatabaseColumns } from '@/lib/db-sync';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Automatically ensure columns exist
    await autoSyncDatabaseColumns();

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { username: username.trim().toLowerCase() },
        include: { department: true },
      });
    } catch (dbErr: any) {
      // If column still missing, attempt emergency DDL sync and retry
      await autoSyncDatabaseColumns();
      user = await prisma.user.findUnique({
        where: { username: username.trim().toLowerCase() },
        include: { department: true },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if user or department is disabled/blocked
    if (user.isActive === false || (user.department && user.department.isActive === false)) {
      return NextResponse.json(
        { error: 'This account has been temporarily disabled by the administrator. Please contact IQAC.' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role as any,
      departmentId: user.departmentId,
      shift: user.department?.shift || null,
    });

    // Determine redirect path based on role
    let redirectUrl = '/login';
    switch (user.role) {
      case 'DEPARTMENT':
        redirectUrl = '/department/dashboard';
        break;
      case 'DIRECTOR':
        redirectUrl = '/director/dashboard';
        break;
      case 'STAFF':
        redirectUrl = '/staff/dashboard';
        break;
      case 'ADMIN':
        redirectUrl = '/admin/departments';
        break;
    }

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        isPasswordChanged: user.isPasswordChanged,
      },
      redirectUrl,
    });

    // Set secure HTTP-only cookie
    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = error?.message?.includes('database') || error?.message?.includes('Authentication failed') || error?.message?.includes('connect')
      ? `Database Connection Error: ${error.message}`
      : 'An unexpected server error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
