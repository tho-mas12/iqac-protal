import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const forms = await prisma.dynamicForm.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ forms });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'IQAC_ADMIN' && user.role !== 'IQAC_MEMBER')) {
      return NextResponse.json({ error: 'Unauthorized to create dynamic forms' }, { status: 403 });
    }

    const { title, description, fields } = await req.json();

    if (!title || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'Title and fields array are required' }, { status: 400 });
    }

    const form = await prisma.dynamicForm.create({
      data: {
        title,
        description: description || null,
        fieldsJson: JSON.stringify(fields),
        createdById: user.userId,
      },
    });

    await logAudit({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'CREATE',
      module: 'DATA_REQUEST',
      recordId: form.id,
      details: { formTitle: form.title },
    });

    return NextResponse.json({ form });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
