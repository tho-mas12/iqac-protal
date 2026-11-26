import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { autoSyncDatabaseColumns } from '@/lib/db-sync';
import { validateSession } from '@/lib/session-lock';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Validate Single Session Lock: If another login took over, terminate this session
    if (session.sessionId && !validateSession(session.username, session.sessionId)) {
      return NextResponse.json({
        authenticated: false,
        sessionTerminated: true,
        reason: 'This account was logged in from another device or browser. Your session has been ended.',
      }, { status: 401 });
    }

    await autoSyncDatabaseColumns();

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          departmentId: true,
          isPasswordChanged: true,
          department: true,
        },
      });
    } catch {}

    if (!user) {
      // Check faculty_directory.json
      try {
        const fs = require('fs');
        const path = require('path');
        const facPath = path.join(process.cwd(), 'data', 'faculty_directory.json');
        if (fs.existsSync(facPath)) {
          const facData = JSON.parse(fs.readFileSync(facPath, 'utf8'));
          const f = (facData.faculty || []).find(
            (x: any) =>
              x.id === session.userId ||
              (x.username && session.username && x.username.toLowerCase() === session.username.toLowerCase())
          );
          if (f) {
            user = {
              id: f.id,
              username: f.username,
              name: f.name,
              role: f.invitationRole || 'STAFF',
              invitationRole: f.invitationRole || 'STAFF',
              departmentId: null,
              isHod: Boolean(f.isHod),
              isMqc: Boolean(f.isMqc),
              isPasswordChanged: true,
              department: { name: f.departmentName, code: f.code },
            };
          }
        }
      } catch {}

      if (!user) {
        user = {
          id: session.userId,
          username: session.username,
          name: session.name || session.username,
          role: session.role || 'STAFF',
          invitationRole: session.role || 'STAFF',
          departmentId: session.departmentId,
          isPasswordChanged: true,
        };
      }
    } else {
      // Synchronize HOD / MQC status for database users
      const { checkUserIsMqc, checkUserIsHod } = require('@/lib/academic-roles');
      const isMqc = checkUserIsMqc(user.username, user.department?.code);
      const isHod = checkUserIsHod(user.username, user.department?.code);
      const userRoleResolved =
        user.role === 'ADMIN'
          ? 'ADMIN'
          : user.role === 'DIRECTOR'
          ? 'DIRECTOR'
          : user.role === 'ADMINISTRATOR' || (user.role === 'STAFF' && user.username === 'staff')
          ? 'ADMINISTRATOR'
          : 'STAFF';

      user = {
        ...user,
        role: userRoleResolved,
        invitationRole: userRoleResolved,
        isMqc,
        isHod,
      };
    }

    const { checkUserCoursePlanAccess } = require('@/lib/academic-roles');
    const isCoursePlanEnabled = checkUserCoursePlanAccess(user.username, user.role);

    user = {
      ...user,
      isCoursePlanEnabled,
    };

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
