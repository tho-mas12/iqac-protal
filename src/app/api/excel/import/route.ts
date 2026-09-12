import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { parseExcelBuffer, validateAndMapImportData } from '@/lib/excel-engine';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN' && user.role !== 'HOD')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const moduleType = formData.get('module') as string || 'FACULTY';
    const columnMappingRaw = formData.get('columnMapping') as string;
    const confirmImport = formData.get('confirmImport') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'Excel file is required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { dataPerSheet } = parseExcelBuffer(buffer);
    const firstSheetName = Object.keys(dataPerSheet)[0];
    const rawRows = dataPerSheet[firstSheetName] || [];

    const columnMapping = columnMappingRaw ? JSON.parse(columnMappingRaw) : {};

    // Standard required fields based on module
    let requiredFields: string[] = [];
    let uniqueField: string | undefined = undefined;

    if (moduleType === 'FACULTY') {
      requiredFields = ['name', 'departmentCode'];
      uniqueField = 'facultyIdNumber';
    } else if (moduleType === 'STUDENT') {
      requiredFields = ['departmentCode', 'totalStudents'];
    }

    const preview = validateAndMapImportData(rawRows, columnMapping, requiredFields, uniqueField);

    if (!confirmImport) {
      // Just return preview for mapping confirmation
      return NextResponse.json({
        preview,
        sheetNames: Object.keys(dataPerSheet),
        sampleRow: rawRows[0] || {},
      });
    }

    // Execute Actual Transactional Import
    let importedCount = 0;
    if (moduleType === 'FACULTY') {
      const defaultAy = await prisma.academicYear.findFirst({ where: { isCurrent: true } });

      for (const item of preview.validRows) {
        const d = item.data;
        const dept = await prisma.department.findFirst({ where: { code: d.departmentCode } });
        if (!dept) continue;

        const facId = d.facultyIdNumber || `FAC-IMP-${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        await prisma.faculty.upsert({
          where: { facultyIdNumber: facId },
          update: {
            name: d.name,
            departmentId: dept.id,
            designation: d.designation || 'Assistant Professor',
            email: d.email || null,
            phone: d.phone || null,
          },
          create: {
            facultyIdNumber: facId,
            name: d.name,
            departmentId: dept.id,
            designation: d.designation || 'Assistant Professor',
            email: d.email || null,
            phone: d.phone || null,
            academicYearId: defaultAy?.id,
          },
        });
        importedCount += 1;
      }
    }

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'IMPORT',
      module: 'MASTER_DATA',
      details: { importedRows: importedCount, moduleType },
    });

    return NextResponse.json({
      success: true,
      importedCount,
      summary: preview.summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
