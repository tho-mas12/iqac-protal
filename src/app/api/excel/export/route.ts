import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateExcelBuffer, generateCSVContent } from '@/lib/excel-engine';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'xlsx'; // xlsx or csv
    const moduleType = searchParams.get('module') || 'REQUIREMENTS';
    const academicYearId = searchParams.get('academicYearId');
    const departmentId = searchParams.get('departmentId');

    let exportData: any[] = [];
    let fileName = `IQAC_${moduleType}_Export`;

    if (moduleType === 'REQUIREMENTS') {
      const rows = await prisma.requirements.findMany({
        where: {
          ...(academicYearId ? { academicYearId } : {}),
          ...(departmentId ? { responsibleDeptId: departmentId } : {}),
        },
        include: { framework: true, department: true },
      });
      exportData = rows.map((r) => ({
        Req_ID: r.reqId,
        Title: r.title,
        Category: r.category,
        Framework: r.framework?.name || r.frameworkId,
        Criterion: r.criterion,
        Department: r.department?.name || 'All',
        Priority: r.priority,
        Status: r.status,
        DueDate: r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'N/A',
      }));
    } else if (moduleType === 'FACULTY') {
      const rows = await prisma.faculty.findMany({
        where: {
          ...(departmentId ? { departmentId } : {}),
        },
        include: { department: true },
      });
      exportData = rows.map((f) => ({
        Faculty_ID: f.facultyIdNumber,
        Name: f.name,
        Department: f.department?.name,
        Designation: f.designation,
        Appointment: f.appointmentNature,
        Category: f.category,
        JoiningDate: f.dateOfJoining ? new Date(f.dateOfJoining).toLocaleDateString() : 'N/A',
        Qualification: f.qualification || 'N/A',
        Email: f.email || 'N/A',
        Phone: f.phone || 'N/A',
      }));
    } else if (moduleType === 'ACTIVITIES') {
      const rows = await prisma.activity.findMany({
        where: {
          ...(academicYearId ? { academicYearId } : {}),
          ...(departmentId ? { departmentId } : {}),
        },
        include: { department: true },
      });
      exportData = rows.map((a) => ({
        Activity_Number: a.activityNumber,
        Title: a.title,
        Department: a.department?.name,
        Type: a.type,
        Date: new Date(a.startDate).toLocaleDateString(),
        Participants: a.participantCount,
        Coordinator: a.coordinatorName,
        EvidenceStatus: a.evidenceStatus,
      }));
    } else if (moduleType === 'COMPLIANCE') {
      const rows = await prisma.ugcNepCompliance.findMany({
        orderBy: { category: 'asc' },
      });
      exportData = rows.map((c) => ({
        Requirement: c.requirementName,
        Category: c.category,
        Source: c.sourceAuthority,
        Status: c.status,
        ResponsiblePerson: c.responsiblePerson,
        Remarks: c.remarks,
      }));
    }

    if (user) {
      await logAudit({
        userId: user.userId,
        userName: user.name,
        role: user.role,
        action: 'EXPORT',
        module: 'MASTER_DATA',
        details: { moduleType, format, rowCount: exportData.length },
      });
    }

    if (format === 'csv') {
      const csvStr = generateCSVContent(exportData);
      return new NextResponse(csvStr, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}.csv"`,
        },
      });
    }

    const buffer = generateExcelBuffer(exportData, moduleType);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
