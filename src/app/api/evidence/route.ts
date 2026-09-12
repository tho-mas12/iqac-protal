import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import path from 'path';
import fs from 'fs/promises';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.pptx', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB max

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const departmentId = searchParams.get('departmentId');
    const requirementId = searchParams.get('requirementId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = { isDeleted: false };
    if (academicYearId) where.academicYearId = academicYearId;
    if (departmentId) where.departmentId = departmentId;
    if (requirementId) where.requirementId = requirementId;
    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { fileName: { contains: search } },
        { evidenceNumber: { contains: search } },
        { tag: { contains: search } },
      ];
    }

    const evidences = await prisma.evidence.findMany({
      where,
      include: {
        department: true,
        academicYear: true,
        requirement: true,
        uploadedBy: true,
        versions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ evidences });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string || '';
    const category = formData.get('category') as string || 'General';
    const requirementId = formData.get('requirementId') as string || null;
    const submissionId = formData.get('submissionId') as string || null;
    const departmentId = formData.get('departmentId') as string || user.departmentId || null;
    const academicYearId = formData.get('academicYearId') as string || null;
    const activityId = formData.get('activityId') as string || null;
    const tag = formData.get('tag') as string || null;

    if (!file) {
      return NextResponse.json({ error: 'File attachment is required' }, { status: 400 });
    }

    // Validate file size & extension
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 25MB' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type '${ext}' is not permitted. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Unique generated filename
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const safeFileName = `evidence_${uniqueId}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, safeFileName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFileName}`;

    const count = await prisma.evidence.count();
    const evidenceNumber = `EVI-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const evidence = await prisma.evidence.create({
      data: {
        evidenceNumber,
        title: title || file.name,
        category,
        requirementId: requirementId || null,
        submissionId: submissionId || null,
        departmentId: departmentId || null,
        academicYearId: academicYearId || null,
        activityId: activityId || null,
        fileName: file.name,
        fileUrl,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        tag: tag || null,
        uploadedById: user.userId,
        verificationStatus: 'PENDING',
        version: 1,
      },
    });

    // Save version history
    await prisma.evidenceVersion.create({
      data: {
        evidenceId: evidence.id,
        versionNumber: 1,
        fileName: file.name,
        fileUrl,
        mimeType: file.type,
        fileSize: file.size,
        uploadedById: user.userId,
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'EVIDENCE',
      recordId: evidence.id,
      details: { evidenceNumber, fileName: file.name, fileSize: file.size },
    });

    return NextResponse.json({ evidence });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
