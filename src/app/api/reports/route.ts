import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'IQAC_ANNUAL';
    const academicYearId = searchParams.get('academicYearId');
    const departmentId = searchParams.get('departmentId');

    let ay = await prisma.academicYear.findFirst({
      where: academicYearId ? { id: academicYearId } : { isCurrent: true },
    });

    if (!ay) ay = await prisma.academicYear.findFirst({ orderBy: { year: 'desc' } });

    let reportData: any = [];
    let reportTitle = 'IQAC Annual Quality Report';

    switch (reportType) {
      case 'REQUIREMENT_STATUS':
        reportTitle = 'Requirement Status Report';
        reportData = await prisma.requirements.findMany({
          where: {
            ...(ay ? { academicYearId: ay.id } : {}),
            ...(departmentId ? { responsibleDeptId: departmentId } : {}),
          },
          include: { framework: true, department: true, assignedMember: true },
        });
        break;

      case 'DEPARTMENT_ACTIVITY':
        reportTitle = 'Department Activity Report';
        reportData = await prisma.activity.findMany({
          where: {
            ...(ay ? { academicYearId: ay.id } : {}),
            ...(departmentId ? { departmentId } : {}),
          },
          include: { department: true, academicYear: true },
        });
        break;

      case 'FACULTY_TRAINING':
        reportTitle = 'Faculty Training & Development Report';
        reportData = await prisma.facultyTraining.findMany({
          where: { ...(ay ? { academicYearId: ay.id } : {}) },
          include: { faculty: { include: { department: true } } },
        });
        break;

      case 'STUDENT_STRENGTH':
        reportTitle = 'Student Strength & Demographics Report';
        reportData = await prisma.studentData.findMany({
          where: {
            ...(ay ? { academicYearId: ay.id } : {}),
            ...(departmentId ? { departmentId } : {}),
          },
          include: { department: true, programme: true },
        });
        break;

      case 'FSR_REPORT':
        reportTitle = 'Faculty-Student Ratio Report';
        reportData = await prisma.facultyStudentRatio.findMany({
          where: { ...(ay ? { academicYearId: ay.id } : {}) },
          include: { department: true },
        });
        break;

      case 'UGC_NEP_NAAC':
        reportTitle = 'UGC / NEP / NAAC Compliance Tracker Report';
        reportData = await prisma.ugcNepCompliance.findMany({
          orderBy: { category: 'asc' },
        });
        break;

      case 'EVIDENCE_COMPLETION':
        reportTitle = 'Evidence Completion & Verification Audit Report';
        reportData = await prisma.evidence.findMany({
          where: {
            isDeleted: false,
            ...(ay ? { academicYearId: ay.id } : {}),
            ...(departmentId ? { departmentId } : {}),
          },
          include: { department: true, uploadedBy: true, requirement: true },
        });
        break;

      case 'MEETING_ATR':
        reportTitle = 'IQAC Meeting Action Taken Report (ATR)';
        reportData = await prisma.meetingActionItem.findMany({
          include: { meeting: true, department: true, responsibleUser: true },
        });
        break;

      case 'ACADEMIC_AUDIT':
        reportTitle = 'Academic Audit Performance Report';
        reportData = await prisma.academicAudit.findMany({
          where: { ...(ay ? { academicYearId: ay.id } : {}) },
          include: { department: true, verifiedBy: true },
        });
        break;

      case 'IQAC_ANNUAL':
      default:
        reportTitle = 'IQAC Annual Comprehensive Quality Report';
        const reqs = await prisma.requirements.findMany({
          where: { ...(ay ? { academicYearId: ay.id } : {}) },
          include: { department: true, framework: true },
        });
        const acts = await prisma.activity.findMany({
          where: { ...(ay ? { academicYearId: ay.id } : {}) },
          include: { department: true },
        });
        reportData = {
          academicYear: ay?.year,
          requirementsCount: reqs.length,
          activitiesCount: acts.length,
          requirements: reqs,
          activities: acts,
        };
        break;
    }

    return NextResponse.json({
      title: reportTitle,
      academicYear: ay?.year,
      data: reportData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
