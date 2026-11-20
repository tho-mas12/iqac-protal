import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let targetUserId = searchParams.get('userId') || session.userId;
    let targetStaffCode = searchParams.get('staffCode');

    // Non-admins can only view their own appraisal
    if (session.role !== 'ADMIN' && session.role !== 'DIRECTOR') {
      targetUserId = session.userId;
      targetStaffCode = null;
    }

    let faculty;
    if (targetStaffCode) {
      faculty = await prisma.user.findFirst({
        where: {
          OR: [
            { staffCode: { equals: targetStaffCode } },
            { username: targetStaffCode.toLowerCase() },
          ]
        },
        include: { department: true }
      });
    } else {
      faculty = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: { department: true }
      });
    }

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 });
    }

    const fId = faculty.id;
    const fCode = faculty.staffCode || faculty.username;
    const fName = faculty.name;
    const deptName = faculty.departmentName || faculty.department?.name || 'Department';

    // 1. Course Plans & TLE Practices
    const coursePlans = await prisma.coursePlanRecord.findMany({
      where: {
        OR: [
          { facultyId: fId },
          { staffCode: fCode },
          { facultyName: { contains: fName } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsedCoursePlans = coursePlans.map(cp => {
      let tl = {};
      let units = [];
      try { tl = JSON.parse(cp.tlPracticesJson || '{}'); } catch {}
      try { units = JSON.parse(cp.unitsJson || '[]'); } catch {}
      return {
        ...cp,
        tlPractices: tl,
        units
      };
    });

    // 2. Event Invitations (Approved & Organized)
    const invitations = await prisma.invitation.findMany({
      where: {
        OR: [
          { userId: fId },
          { staffCode: fCode },
          { facultyName: { contains: fName } },
        ]
      },
      orderBy: { fromDate: 'desc' }
    });

    const approvedInvitations = invitations.filter(inv => inv.status === 'APPROVED');
    const pendingInvitations = invitations.filter(inv => inv.status !== 'APPROVED');

    // 3. Dynamic Field Submissions
    const dynamicSubmissions = await prisma.dynamicSubmission.findMany({
      where: { userId: fId },
      include: {
        campaign: {
          include: {
            fields: { orderBy: { orderIndex: 'asc' } }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const parsedSubmissions = dynamicSubmissions.map(sub => {
      let data: Record<string, any> = {};
      try { data = JSON.parse(sub.dataJson || '{}'); } catch {}
      return {
        id: sub.id,
        campaignTitle: sub.campaign.title,
        academicYear: sub.campaign.academicYear,
        submittedAt: sub.submittedAt,
        fields: sub.campaign.fields.map(f => ({
          label: f.fieldLabel,
          value: data[f.fieldName] || 'N/A'
        }))
      };
    });

    // 4. Performance Appraisal Scoring Computation
    // Domain 1: Teaching, Course Planning & TLE (Max 40 points)
    let domain1Score = 0;
    if (parsedCoursePlans.length > 0) {
      domain1Score += Math.min(20, parsedCoursePlans.length * 10);
      const approvedCount = parsedCoursePlans.filter(p => p.hodStatus === 'Approved').length;
      domain1Score += Math.min(10, approvedCount * 5);
      const hasTl = parsedCoursePlans.some(p => p.tlPractices && Object.keys(p.tlPractices).length > 0);
      if (hasTl) domain1Score += 10;
    }

    // Domain 2: Academic Events & Institutional Verification (Max 25 points)
    let domain2Score = Math.min(25, approvedInvitations.length * 12.5);

    // Domain 3: Dynamic Data Compliance & Institutional Submissions (Max 20 points)
    let domain3Score = Math.min(20, parsedSubmissions.length * 10);

    // Domain 4: Leadership / Department Responsibility (Max 15 points)
    let domain4Score = 5; // Base faculty involvement
    if (faculty.isHead) domain4Score = 15;
    else if (faculty.isMqc) domain4Score = 12;

    const totalScore = Math.min(100, domain1Score + domain2Score + domain3Score + domain4Score);

    let performanceGrade = 'A+ (Exemplary)';
    if (totalScore < 50) performanceGrade = 'B (Developing)';
    else if (totalScore < 75) performanceGrade = 'A (Proficient)';
    else if (totalScore >= 90) performanceGrade = 'A++ (Outstanding)';

    return NextResponse.json({
      success: true,
      appraisal: {
        academicYear: '2026 - 2027',
        faculty: {
          id: faculty.id,
          name: faculty.name,
          staffCode: faculty.staffCode || faculty.username,
          departmentName: deptName,
          shift: faculty.department?.shift || 'Shift I',
          email: faculty.email,
          role: faculty.role,
          isHead: Boolean(faculty.isHead),
          isMqc: Boolean(faculty.isMqc),
          roleTitle: faculty.isHead ? 'Head of Department' : (faculty.isMqc ? 'MQC Coordinator' : 'Assistant / Associate Professor')
        },
        scores: {
          domain1Teaching: domain1Score, // max 40
          domain2Events: domain2Score,   // max 25
          domain3Dynamic: domain3Score,  // max 20
          domain4Leadership: domain4Score, // max 15
          totalScore,
          performanceGrade,
        },
        sections: {
          coursePlans: parsedCoursePlans,
          approvedInvitations,
          pendingInvitations,
          dynamicSubmissions: parsedSubmissions,
        }
      }
    });
  } catch (error: any) {
    console.error('Error generating appraisal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
