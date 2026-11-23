import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken, signToken } from '@/lib/auth';

// Helper to convert Prisma CoursePlanRecord to CoursePlanApp format
function mapPlanRecord(p: any) {
  let units = [];
  try {
    units = p.unitsJson ? JSON.parse(p.unitsJson) : [];
  } catch (e) {
    units = [];
  }

  let tl = {};
  try {
    tl = p.tlPracticesJson ? JSON.parse(p.tlPracticesJson) : {};
  } catch (e) {
    tl = {};
  }

  return {
    id: p.id,
    faculty_id: p.facultyId,
    faculty_name: p.facultyName,
    staff_code: p.staffCode || p.facultyId,
    department_name: p.departmentName,
    course_code: p.courseCode,
    course_title: p.courseTitle,
    programme: p.programme,
    semester: p.semester || 'Even',
    academic_year: p.academicYear || '2026 - 2027',
    status: p.status || 'Draft',
    hod_status: p.hodStatus || 'Pending',
    units: units,
    tl_practices: tl,
    created_at: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    updated_at: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';

  // 1. Settings
  if (action === 'get_settings' || action === 'settings') {
    return NextResponse.json({
      success: true,
      settings: {
        submissions_enabled: true,
        maintenance_mode: false,
        academic_year: '2026–2027',
        semester: 'Even',
      },
    });
  }

  // 2. Auth Check
  if (action === 'auth_check') {
    const sysSettings = {
      submissions_enabled: true,
      maintenance_mode: false,
      academic_year: '2026–2027',
      semester: 'Even',
    };

    const token = cookies().get('iqac_token')?.value;
    if (!token) {
      return NextResponse.json({ success: true, authenticated: false, user: null, settings: sysSettings });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: true, authenticated: false, user: null, settings: sysSettings });
    }

    const isHod = !!payload.isHead || (payload.role as string) === 'HEAD';
    const isMqc = !!payload.isMqc || (payload.role as string) === 'MQC';
    const isAdmin = payload.role === 'ADMIN';

    const userData = {
      id: payload.userId,
      faculty_id: payload.username,
      username: payload.username,
      role: isAdmin ? 'admin' : (isHod ? 'hod' : 'faculty'),
      user_role: payload.role,
      is_hod: isHod,
      is_head: isHod,
      is_mqc: isMqc,
      department_name: payload.departmentName || '',
      hod_department: isHod ? payload.departmentName : null,
      faculty_name: payload.name,
      display_name: payload.name,
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: userData,
      settings: sysSettings,
    });
  }

  // 3. Single Course Plan
  if (action === 'get') {
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Course plan ID required' });
    }

    const plan = await prisma.coursePlanRecord.findUnique({ where: { id } });
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Course plan not found' });
    }

    return NextResponse.json({ success: true, data: mapPlanRecord(plan) });
  }

  // 4. List Course Plans
  if (action === 'list') {
    const dept = searchParams.get('department');
    const fac = searchParams.get('faculty_name');
    const status = searchParams.get('status');
    const view = searchParams.get('view');

    const where: any = {};
    if (dept && dept !== 'ALL' && dept !== 'all') {
      where.departmentName = dept;
    }
    if (fac && view !== 'hod') {
      where.facultyName = fac;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const plans = await prisma.coursePlanRecord.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: plans.map(mapPlanRecord),
    });
  }

  // 5. Get TL Practices
  if (action === 'get_tl_practices') {
    const facName = searchParams.get('faculty_name');
    const deptName = searchParams.get('department_name');

    const planWithTl = await prisma.coursePlanRecord.findFirst({
      where: {
        ...(facName ? { facultyName: facName } : {}),
        ...(deptName ? { departmentName: deptName } : {}),
        tlPracticesJson: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (planWithTl && planWithTl.tlPracticesJson) {
      try {
        return NextResponse.json({
          success: true,
          data: JSON.parse(planWithTl.tlPracticesJson),
        });
      } catch (e) {
        // Fall through
      }
    }

    return NextResponse.json({
      success: true,
      data: null,
    });
  }

  // 6. Get Faculty Roles
  if (action === 'get_faculty_roles') {
    const dept = searchParams.get('department');
    const where: any = {};
    if (dept && dept !== 'ALL') {
      where.department = { name: dept };
    }

    const users = await prisma.user.findMany({
      where,
      include: { department: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      faculty: users.map(u => ({
        id: u.id,
        faculty_id: u.username,
        faculty_name: u.name,
        department_name: u.department?.name || '',
        role: u.role,
        is_hod: u.role === 'HEAD',
        is_head: u.role === 'HEAD',
        is_mqc: u.role === 'MQC',
      })),
    });
  }

  // 7. Logout
  if (action === 'logout') {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('iqac_token');
    return response;
  }

  return NextResponse.json({ success: false, error: 'Unknown action' });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'save';

  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  // 1. Login
  if (action === 'login') {
    const loginId = (body.faculty_id || body.username || '').trim();
    const password = (body.password || '').trim();
    const deptName = (body.department_name || '').trim();
    const facName = (body.faculty_name || '').trim();

    // Check Admin
    if (
      loginId.toLowerCase() === 'admin' ||
      loginId.toLowerCase() === 'iqac_admin' ||
      body.role === 'admin'
    ) {
      if (password === 'admin123' || password === 'admin' || password === '123') {
        const token = signToken({
          userId: 'admin-id',
          username: 'admin',
          role: 'ADMIN',
          departmentId: null,
          departmentName: 'IQAC Central',
          name: 'IQAC Administrator',
        });

        const res = NextResponse.json({
          success: true,
          authenticated: true,
          user: {
            id: 1,
            username: 'admin',
            role: 'admin',
            user_role: 'ADMIN',
            department_name: 'IQAC Central',
            display_name: 'IQAC Administrator',
            faculty_name: 'IQAC Administrator',
          },
          message: 'Admin authenticated successfully',
        });
        res.cookies.set('iqac_token', token, { path: '/', httpOnly: true });
        return res;
      }
    }

    // Find User by username or department + faculty_name
    let user = null;
    if (loginId) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: { equals: loginId } },
            { username: { equals: loginId.toLowerCase() } },
          ],
        },
        include: { department: true },
      });
    }

    if (!user && deptName && facName) {
      user = await prisma.user.findFirst({
        where: {
          department: { name: deptName },
          name: { contains: facName },
        },
        include: { department: true },
      });
    }

    if (user) {
      // Allow demo password '123' or exact match
      const pwMatch = password === '123' || user.password === password;
      if (!pwMatch && password !== '') {
        return NextResponse.json({ success: false, authenticated: false, error: 'Invalid password. (Use demo password: 123)' });
      }

      const isHod = user.role === 'HEAD' || (user as any).isHead;
      const isMqc = user.role === 'MQC' || (user as any).isMqc;
      const token = signToken({
        userId: user.id,
        username: user.username,
        role: (user.role === 'HEAD' || user.role === 'MQC' ? 'FACULTY' : user.role) as any,
        departmentId: user.departmentId,
        departmentName: user.department?.name || '',
        name: user.name,
        isHead: isHod,
        isMqc: isMqc,
      });

      const res = NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          faculty_id: user.username,
          username: user.username,
          role: isHod ? 'hod' : 'faculty',
          user_role: user.role,
          is_hod: isHod,
          is_head: isHod,
          is_mqc: isMqc,
          department_name: user.department?.name || '',
          hod_department: isHod ? (user.department?.name || '') : null,
          faculty_name: user.name,
          display_name: user.name,
        },
        message: `Welcome, ${user.name}`,
      });
      res.cookies.set('iqac_token', token, { path: '/', httpOnly: true });
      return res;
    }

    // Fallback demo user if not found in db
    if (loginId || facName) {
      const displayName = facName || loginId;
      const res = NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: 'demo-faculty',
          faculty_id: loginId || 'faculty-01',
          username: loginId || 'faculty-01',
          role: body.role === 'hod' ? 'hod' : 'faculty',
          user_role: body.role === 'hod' ? 'HEAD' : 'FACULTY',
          is_hod: body.role === 'hod',
          is_head: body.role === 'hod',
          is_mqc: false,
          department_name: deptName || 'Computer Science',
          hod_department: body.role === 'hod' ? (deptName || 'Computer Science') : null,
          faculty_name: displayName,
          display_name: displayName,
        },
        message: `Welcome, ${displayName}`,
      });
      return res;
    }

    return NextResponse.json({
      success: false,
      error: 'Please enter valid staff code or select department & name',
    });
  }

  // 2. Save Course Plan
  if (action === 'save') {
    const p = body;
    const planId = p.id || undefined;
    const facId = p.faculty_id || p.staff_code || '16FCS01';
    const facName = p.faculty_name || 'Faculty Member';
    const deptName = p.department_name || 'Computer Science';
    const cCode = p.course_code || 'Untitled Course';
    const cTitle = p.course_title || 'Untitled Course';
    const prog = p.programme || 'Undergraduate';
    const sem = p.semester || 'Even';
    const stat = p.status || 'Draft';
    const hodStat = p.hod_status || 'Pending';
    const unitsStr = p.units ? JSON.stringify(p.units) : null;
    const tlStr = p.tl_practices ? JSON.stringify(p.tl_practices) : null;

    let saved;
    if (planId) {
      saved = await prisma.coursePlanRecord.upsert({
        where: { id: planId },
        update: {
          facultyName: facName,
          departmentName: deptName,
          courseCode: cCode,
          courseTitle: cTitle,
          programme: prog,
          semester: sem,
          status: stat,
          hodStatus: hodStat,
          unitsJson: unitsStr,
          tlPracticesJson: tlStr,
        },
        create: {
          id: planId,
          facultyId: facId,
          facultyName: facName,
          departmentName: deptName,
          courseCode: cCode,
          courseTitle: cTitle,
          programme: prog,
          semester: sem,
          status: stat,
          hodStatus: hodStat,
          unitsJson: unitsStr,
          tlPracticesJson: tlStr,
        },
      });
    } else {
      saved = await prisma.coursePlanRecord.create({
        data: {
          facultyId: facId,
          facultyName: facName,
          departmentName: deptName,
          courseCode: cCode,
          courseTitle: cTitle,
          programme: prog,
          semester: sem,
          status: stat,
          hodStatus: hodStat,
          unitsJson: unitsStr,
          tlPracticesJson: tlStr,
        },
      });
    }

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: 'Course plan saved successfully',
    });
  }

  // 3. HOD Action
  if (action === 'hod_action') {
    const planId = body.id || searchParams.get('id');
    const decision = body.action || body.status || searchParams.get('decision') || 'Approved';
    const remarks = body.remarks || body.hod_remarks || '';

    if (!planId) {
      return NextResponse.json({ success: false, error: 'Course plan ID required' });
    }

    const hodStatus = decision === 'Approved' || decision === 'approve' ? 'Approved' : 'Revision Needed';

    await prisma.coursePlanRecord.update({
      where: { id: planId },
      data: {
        hodStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Course plan status updated to ${hodStatus}`,
    });
  }

  // 4. Save TL Practices
  if (action === 'save_tl_practices') {
    const facName = body.faculty_name || '';
    const deptName = body.department_name || '';

    const firstPlan = await prisma.coursePlanRecord.findFirst({
      where: {
        ...(facName ? { facultyName: facName } : {}),
        ...(deptName ? { departmentName: deptName } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (firstPlan) {
      await prisma.coursePlanRecord.update({
        where: { id: firstPlan.id },
        data: {
          tlPracticesJson: JSON.stringify(body),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Teaching-learning practices saved successfully',
    });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' });
}
