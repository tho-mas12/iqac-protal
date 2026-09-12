import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = req.nextUrl.searchParams;
    const yearParam = searchParams.get('academicYear');

    // Get selected academic year or current
    let academicYear = await prisma.academicYear.findFirst({
      where: yearParam ? { year: yearParam } : { isCurrent: true },
    });

    if (!academicYear) {
      academicYear = await prisma.academicYear.findFirst({ orderBy: { year: 'desc' } });
    }

    const ayId = academicYear?.id;

    // Filters depending on user role
    const isDeptUser = user?.role === 'HOD' || user?.role === 'DEPT_COORDINATOR' || user?.role === 'FACULTY';
    const deptId = isDeptUser ? user?.departmentId : searchParams.get('departmentId');

    const reqWhere: any = {};
    if (ayId) reqWhere.academicYearId = ayId;
    if (deptId) reqWhere.responsibleDeptId = deptId;

    const requirements = await prisma.requirements.findMany({
      where: reqWhere,
      include: { framework: true, department: true },
    });

    const totalReqs = requirements.length;
    const completedReqs = requirements.filter((r) => r.status === 'Completed' || r.status === 'Approved').length;
    const pendingReqs = requirements.filter((r) => r.status === 'In Progress' || r.status === 'Not Started').length;
    const underVerificationReqs = requirements.filter((r) => r.status === 'Under Verification' || r.status === 'Submitted').length;
    const correctionRequiredReqs = requirements.filter((r) => r.status === 'Correction Required').length;
    const compliantReqs = requirements.filter((r) => r.status === 'Approved' || r.status === 'Completed').length;
    const partiallyCompliantReqs = requirements.filter((r) => r.status === 'Under Verification' || r.complianceScore === 50.0).length;
    const notCompliantReqs = requirements.filter((r) => r.status === 'Not Started' || r.status === 'Correction Required').length;

    const now = new Date();
    const overdueReqs = requirements.filter(
      (r) => r.dueDate && new Date(r.dueDate) < now && r.status !== 'Approved' && r.status !== 'Completed'
    ).length;

    // Evidence count
    const evidenceWhere: any = {};
    if (ayId) evidenceWhere.academicYearId = ayId;
    if (deptId) evidenceWhere.departmentId = deptId;

    const totalEvidence = await prisma.evidence.count({ where: { ...evidenceWhere, isDeleted: false } });
    const pendingEvidenceCount = await prisma.evidence.count({
      where: { ...evidenceWhere, isDeleted: false, verificationStatus: 'PENDING' },
    });

    // Overall Compliance Score calculation
    const overallScore = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

    // Department-wise compliance aggregation
    const departments = await prisma.department.findMany({ where: { isActive: true } });
    const deptComplianceData = await Promise.all(
      departments.map(async (d) => {
        const dReqs = await prisma.requirements.findMany({
          where: { responsibleDeptId: d.id, ...(ayId ? { academicYearId: ayId } : {}) },
        });
        const dTotal = dReqs.length;
        const dCompleted = dReqs.filter((r) => r.status === 'Approved' || r.status === 'Completed').length;
        const dScore = dTotal > 0 ? Math.round((dCompleted / dTotal) * 100) : 0;
        return {
          departmentId: d.id,
          name: d.name,
          code: d.code,
          total: dTotal,
          completed: dCompleted,
          score: dScore,
        };
      })
    );

    // Criterion-wise compliance
    const criterionMap: Record<string, { total: number; completed: number }> = {};
    requirements.forEach((r) => {
      const crit = r.criterion || 'General';
      if (!criterionMap[crit]) criterionMap[crit] = { total: 0, completed: 0 };
      criterionMap[crit].total += 1;
      if (r.status === 'Approved' || r.status === 'Completed') {
        criterionMap[crit].completed += 1;
      }
    });

    const criterionData = Object.keys(criterionMap).map((crit) => ({
      criterion: crit,
      total: criterionMap[crit].total,
      completed: criterionMap[crit].completed,
      score:
        criterionMap[crit].total > 0
          ? Math.round((criterionMap[crit].completed / criterionMap[crit].total) * 100)
          : 0,
    }));

    // Quality Pulse Data
    const qualityPulse = {
      overdueSubmissions: overdueReqs,
      pendingEvidence: pendingEvidenceCount,
      correctionsNeeded: correctionRequiredReqs,
      completedRequirements: completedReqs,
    };

    return NextResponse.json({
      academicYear: academicYear?.year,
      summary: {
        totalRequirements: totalReqs,
        completed: completedReqs,
        pending: pendingReqs,
        underVerification: underVerificationReqs,
        correctionRequired: correctionRequiredReqs,
        compliant: compliantReqs,
        partiallyCompliant: partiallyCompliantReqs,
        notCompliant: notCompliantReqs,
        evidenceMissing: pendingEvidenceCount,
        overdueTasks: overdueReqs,
        overallComplianceScore: overallScore,
        totalEvidenceUploaded: totalEvidence,
      },
      deptComplianceData,
      criterionData,
      qualityPulse,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
