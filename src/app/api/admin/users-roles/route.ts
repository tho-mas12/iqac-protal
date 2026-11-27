import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { getAcademicRoles, saveAcademicRoles } from '@/lib/academic-roles';
import { logAction } from '@/lib/action-logger';

export const dynamic = 'force-dynamic';

const FACULTY_PATH = path.join(process.cwd(), 'data', 'faculty_directory.json');

function getFacultyDirectory(): any[] {
  try {
    if (fs.existsSync(FACULTY_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(FACULTY_PATH, 'utf8'));
      return parsed.faculty || [];
    }
  } catch (e) {
    console.error('Error reading faculty directory:', e);
  }
  return [];
}

function saveFacultyDirectory(faculty: any[]) {
  try {
    fs.writeFileSync(
      FACULTY_PATH,
      JSON.stringify({ faculty, total: faculty.length, updatedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
  } catch (e) {
    console.error('Error saving faculty directory:', e);
  }
}

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const [dbUsers, dbDepartments] = await Promise.all([
      prisma.user.findMany({
        include: {
          department: {
            select: { id: true, name: true, code: true, shift: true },
          },
        },
        orderBy: [{ role: 'asc' }, { name: 'asc' }],
      }),
      prisma.department.findMany({
        select: { id: true, name: true, code: true, shift: true },
        orderBy: [{ shift: 'asc' }, { name: 'asc' }],
      }),
    ]);

    const academicRoles = getAcademicRoles();
    const facultyList = getFacultyDirectory();

    // Map system users
    const mappedDbUsers = dbUsers.map((u) => {
      const uname = u.username.toLowerCase();
      const custom = academicRoles.userDesignations[u.username] || academicRoles.userDesignations[uname] || {};
      const isMqc = custom.isMqc !== undefined ? custom.isMqc : u.role === 'ADMIN';
      const isHod = custom.isHod !== undefined ? custom.isHod : false;
      const coursePlanEnabled = custom.coursePlanEnabled !== undefined ? custom.coursePlanEnabled : true;

      return {
        id: u.id,
        code: u.username.toUpperCase(),
        username: u.username,
        name: u.name,
        role: u.role,
        invitationRole: u.role === 'ADMIN' ? 'ADMIN' : u.role === 'DIRECTOR' ? 'DIRECTOR' : u.role === 'STAFF' ? 'ADMINISTRATOR' : 'STAFF',
        departmentId: u.departmentId,
        departmentName: u.department?.name || 'Central Administration',
        position: u.role === 'ADMIN' ? 'ADMINISTRATOR' : u.role === 'DIRECTOR' ? 'DIRECTOR' : 'STAFF',
        isActive: u.isActive,
        isMqc,
        isHod,
        coursePlanEnabled,
        isDbUser: true,
      };
    });

    // Map faculty from ERP Credentials
    const mappedFaculty = facultyList.map((f) => {
      const uname = f.username.toLowerCase();
      const custom = academicRoles.userDesignations[uname] || academicRoles.userDesignations[f.code] || {};
      const isMqc = custom.isMqc !== undefined ? custom.isMqc : Boolean(f.isMqc);
      const isHod = custom.isHod !== undefined ? custom.isHod : Boolean(f.isHod);
      const coursePlanEnabled = custom.coursePlanEnabled !== undefined ? custom.coursePlanEnabled : (f.coursePlanEnabled !== undefined ? Boolean(f.coursePlanEnabled) : true);

      return {
        id: f.id,
        code: f.code,
        username: f.username,
        name: f.name,
        role: f.invitationRole || 'STAFF',
        invitationRole: f.invitationRole || 'STAFF',
        departmentId: null,
        departmentName: f.departmentName,
        position: f.position,
        isActive: true,
        isMqc,
        isHod,
        coursePlanEnabled,
        isDbUser: false,
      };
    });

    // Combine list: DB Users on top, then Faculty
    const allCombined = [...mappedDbUsers, ...mappedFaculty];

    // Extract unique department names for filtering
    const allDeptNames = Array.from(
      new Set(allCombined.map((u) => u.departmentName).filter(Boolean))
    ).sort();

    return NextResponse.json({
      success: true,
      users: allCombined,
      departments: dbDepartments,
      departmentNames: allDeptNames,
      totalUsers: allCombined.length,
      totalMqc: allCombined.filter((u) => u.isMqc).length,
      totalHods: allCombined.filter((u) => u.isHod).length,
      totalCoursePlanEnabled: allCombined.filter((u) => u.coursePlanEnabled !== false).length,
    });
  } catch (error: any) {
    console.error('Error fetching users and academic roles:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch directory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const academicRoles = getAcademicRoles();
    const facultyList = getFacultyDirectory();

    // 1. Toggle MQC Access (Gives access to AAA Data Platform)
    if (action === 'toggle_mqc') {
      const { username, code, isMqc } = body;
      const uname = (username || code || '').toLowerCase();
      if (!uname) return NextResponse.json({ error: 'User identifier required' }, { status: 400 });

      academicRoles.userDesignations[uname] = {
        ...(academicRoles.userDesignations[uname] || {}),
        isMqc,
      };

      // Also update faculty_directory.json
      const updatedFac = facultyList.map((f) => {
        if (f.username.toLowerCase() === uname || f.code.toLowerCase() === uname) {
          return { ...f, isMqc };
        }
        return f;
      });
      saveFacultyDirectory(updatedFac);
      saveAcademicRoles(academicRoles);

      return NextResponse.json({ success: true, message: `MQC access ${isMqc ? 'granted' : 'disabled'}` });
    }

    // 2. Toggle HOD Leadership (Gives access to View Department Status in Course Plan)
    if (action === 'toggle_hod') {
      const { username, code, isHod } = body;
      const uname = (username || code || '').toLowerCase();
      if (!uname) return NextResponse.json({ error: 'User identifier required' }, { status: 400 });

      academicRoles.userDesignations[uname] = {
        ...(academicRoles.userDesignations[uname] || {}),
        isHod,
      };

      const updatedFac = facultyList.map((f) => {
        if (f.username.toLowerCase() === uname || f.code.toLowerCase() === uname) {
          return { ...f, isHod };
        }
        return f;
      });
      saveFacultyDirectory(updatedFac);
      saveAcademicRoles(academicRoles);

      return NextResponse.json({ success: true, message: `HOD status ${isHod ? 'assigned' : 'removed'}` });
    }

    // 3. Toggle Course Plan Access (Enables / Disables Course Plan module and pages for user)
    if (action === 'toggle_course_plan') {
      const { username, code, coursePlanEnabled } = body;
      const uname = (username || code || '').toLowerCase();
      if (!uname) return NextResponse.json({ error: 'User identifier required' }, { status: 400 });

      academicRoles.userDesignations[uname] = {
        ...(academicRoles.userDesignations[uname] || {}),
        coursePlanEnabled,
      };

      const updatedFac = facultyList.map((f) => {
        if (f.username.toLowerCase() === uname || f.code.toLowerCase() === uname) {
          return { ...f, coursePlanEnabled };
        }
        return f;
      });
      saveFacultyDirectory(updatedFac);
      saveAcademicRoles(academicRoles);

      return NextResponse.json({
        success: true,
        message: `Course Plan access ${coursePlanEnabled ? 'ENABLED (Pages Visible)' : 'DISABLED (Pages Hidden)'}`,
      });
    }

    // 3b. Bulk Toggle Course Plan Access for all users
    if (action === 'bulk_toggle_course_plan') {
      const { coursePlanEnabled } = body;
      const enabled = Boolean(coursePlanEnabled);

      for (const uname of Object.keys(academicRoles.userDesignations)) {
        academicRoles.userDesignations[uname] = {
          ...(academicRoles.userDesignations[uname] || {}),
          coursePlanEnabled: enabled,
        };
      }
      (academicRoles as any).coursePlanGlobalDefault = enabled;

      const updatedFac = facultyList.map((f) => ({
        ...f,
        coursePlanEnabled: enabled,
      }));

      saveFacultyDirectory(updatedFac);
      saveAcademicRoles(academicRoles);

      return NextResponse.json({
        success: true,
        message: `Course Plan access successfully ${enabled ? 'ENABLED' : 'DISABLED'} for all users.`,
      });
    }

    // 4. Change Invitation Portal Access Role (Staff upload vs Director review vs Admin)
    if (action === 'change_invitation_role') {
      const { username, code, invitationRole } = body;
      const uname = (username || code || '').toLowerCase();
      if (!uname) return NextResponse.json({ error: 'User identifier required' }, { status: 400 });

      const updatedFac = facultyList.map((f) => {
        if (f.username.toLowerCase() === uname || f.code.toLowerCase() === uname) {
          return { ...f, invitationRole };
        }
        return f;
      });
      saveFacultyDirectory(updatedFac);

      // If user exists in Prisma DB, update role there too
      try {
        await prisma.user.updateMany({
          where: { username: uname },
          data: { role: invitationRole },
        });
      } catch {}

      return NextResponse.json({ success: true, message: `Invitation access role updated to ${invitationRole}` });
    }

    // 5. Update / Reset Password
    if (action === 'update_user') {
      const { username, password, name, invitationRole, isMqc, isHod, coursePlanEnabled } = body;
      const uname = (username || '').toLowerCase();

      academicRoles.userDesignations[uname] = {
        ...(academicRoles.userDesignations[uname] || {}),
        isMqc,
        isHod,
        coursePlanEnabled: coursePlanEnabled !== undefined ? coursePlanEnabled : true,
      };
      saveAcademicRoles(academicRoles);

      const updatedFac = facultyList.map((f) => {
        if (f.username.toLowerCase() === uname || f.code.toLowerCase() === uname) {
          return {
            ...f,
            name: name || f.name,
            credentials: password || f.credentials,
            invitationRole: invitationRole || f.invitationRole,
            isMqc,
            isHod,
            coursePlanEnabled: coursePlanEnabled !== undefined ? coursePlanEnabled : (f.coursePlanEnabled !== undefined ? f.coursePlanEnabled : true),
          };
        }
        return f;
      });
      saveFacultyDirectory(updatedFac);

      await logAction({
        req,
        username: session.username,
        role: session.role,
        actorId: session.userId,
        action: 'UPDATE',
        module: 'USERS',
        targetId: uname,
        targetName: uname,
        details: `Updated user credentials / permissions for "${uname}".`,
      });

      return NextResponse.json({ success: true, message: 'Faculty credentials and permissions updated' });
    }

    // 6. Create New User
    if (action === 'create_user') {
      const { name, username, code, password, departmentName, shift, invitationRole, userType, isMqc, isHod, coursePlanEnabled } = body;
      const cleanUname = (username || code || '').trim().toUpperCase();
      if (!cleanUname || (!name && userType !== 'ADMIN')) {
        return NextResponse.json({ error: 'Name and User ID/Code are required' }, { status: 400 });
      }

      const existing = facultyList.find(
        (f: any) => f.username?.toUpperCase() === cleanUname || f.code?.toUpperCase() === cleanUname
      );
      if (existing) {
        return NextResponse.json({ error: 'User with this User ID / Code already exists' }, { status: 400 });
      }

      // If creating an Admin user, register in Prisma DB
      if (userType === 'ADMIN' || invitationRole === 'ADMIN') {
        const hashedPassword = await hashPassword(password || 'admin123');
        const adminUser = await prisma.user.upsert({
          where: { username: cleanUname },
          update: {
            name: name || `Admin (${cleanUname})`,
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
          },
          create: {
            username: cleanUname,
            name: name || `Admin (${cleanUname})`,
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            isPasswordChanged: true,
          },
        });

        return NextResponse.json({ success: true, user: adminUser, message: `Admin account "${cleanUname}" created successfully` });
      }

      const newFaculty = {
        id: `fac_${Date.now()}`,
        code: cleanUname,
        name,
        username: cleanUname,
        credentials: password || 'sjciqac',
        departmentName: departmentName || 'Computer Science',
        shift: shift || 'Shift I',
        position: 'Faculty Member',
        invitationRole: invitationRole || 'STAFF',
        isMqc: Boolean(isMqc),
        isHod: Boolean(isHod),
        coursePlanEnabled: coursePlanEnabled !== false,
      };

      facultyList.unshift(newFaculty);
      saveFacultyDirectory(facultyList);

      academicRoles.userDesignations[cleanUname] = {
        isMqc: Boolean(isMqc),
        isHod: Boolean(isHod),
        coursePlanEnabled: coursePlanEnabled !== false,
      };
      saveAcademicRoles(academicRoles);

      await logAction({
        req,
        username: session.username,
        role: session.role,
        actorId: session.userId,
        action: 'CREATE',
        module: 'USERS',
        targetId: cleanUname,
        targetName: name,
        details: `Created new user "${cleanUname}" (${name}) with role ${invitationRole || 'STAFF'}.`,
      });

      return NextResponse.json({ success: true, user: newFaculty, message: 'User created successfully' });
    }

    // 6. Delete User
    if (action === 'delete_user') {
      const { id, username } = body;
      const cleanUname = (username || '').toLowerCase();
      const updatedFac = facultyList.filter(
        (f: any) => f.id !== id && f.username.toLowerCase() !== cleanUname
      );
      saveFacultyDirectory(updatedFac);

      await logAction({
        req,
        username: session.username,
        role: session.role,
        actorId: session.userId,
        action: 'DELETE',
        module: 'USERS',
        targetId: id || cleanUname,
        targetName: cleanUname,
        details: `Deleted user "${cleanUname}".`,
      });

      return NextResponse.json({ success: true, message: 'User removed successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling users-roles post:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
