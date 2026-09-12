import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRolePermissions } from '@/lib/permissions';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const permissions = getRolePermissions(user.role);

  return NextResponse.json({
    user,
    permissions,
  });
}
