import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await prisma.dynamicCampaign.findMany({
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                staffCode: true,
                departmentName: true,
                role: true,
                isHead: true,
                isMqc: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error('Error fetching dynamic campaigns:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Only IQAC Admin can create campaigns' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, targetRole, academicYear, deadline, fields } = body;

    if (!title || !deadline || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: 'Please provide Campaign Title, Deadline, and at least one Field.' }, { status: 400 });
    }

    const campaign = await prisma.dynamicCampaign.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        targetRole: targetRole || 'ALL_FACULTY',
        academicYear: academicYear || '2026 - 2027',
        deadline: new Date(deadline),
        isActive: true,
        fields: {
          create: fields.map((f: any, idx: number) => ({
            fieldName: (f.fieldName || `field_${idx + 1}`).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            fieldLabel: f.fieldLabel?.trim() || `Field ${idx + 1}`,
            fieldType: f.fieldType || 'TEXT',
            marks: typeof f.marks === 'number' ? f.marks : (parseInt(f.marks) || 10),
            optionsJson: f.optionsJson ? (typeof f.optionsJson === 'string' ? f.optionsJson : JSON.stringify(f.optionsJson)) : null,
            placeholder: f.placeholder || null,
            isRequired: f.isRequired !== false,
            orderIndex: idx + 1,
          }))
        }
      },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
      }
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('Error creating dynamic campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, deadline, targetRole, isActive, fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // 1. Update basic campaign metadata if provided
    const updateData: any = { updatedAt: new Date() };
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (deadline) updateData.deadline = new Date(deadline);
    if (targetRole) updateData.targetRole = targetRole;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await prisma.dynamicCampaign.update({
      where: { id },
      data: updateData,
    });

    // 2. If fields array is provided, sync questions and marks
    if (Array.isArray(fields)) {
      const existingFields = await prisma.dynamicField.findMany({
        where: { campaignId: id }
      });
      const incomingIds = fields.filter((f: any) => f.id).map((f: any) => f.id);

      // Delete fields that were removed in the UI
      const toDelete = existingFields.filter(ef => !incomingIds.includes(ef.id));
      if (toDelete.length > 0) {
        await prisma.dynamicField.deleteMany({
          where: { id: { in: toDelete.map(d => d.id) } }
        });
      }

      // Upsert/Update remaining or new fields
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        const fieldNameClean = (f.fieldName || `q_${Date.now()}_${i + 1}`).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const fieldMarks = typeof f.marks === 'number' ? f.marks : (parseInt(f.marks) || 10);

        if (f.id && existingFields.some(ef => ef.id === f.id)) {
          // Update existing field
          await prisma.dynamicField.update({
            where: { id: f.id },
            data: {
              fieldLabel: f.fieldLabel?.trim() || `Question ${i + 1}`,
              fieldType: f.fieldType || 'TEXT',
              marks: fieldMarks,
              placeholder: f.placeholder || null,
              isRequired: f.isRequired !== false,
              orderIndex: i + 1,
              optionsJson: f.optionsJson ? (typeof f.optionsJson === 'string' ? f.optionsJson : JSON.stringify(f.optionsJson)) : null,
              updatedAt: new Date(),
            }
          });
        } else {
          // Create new field
          await prisma.dynamicField.create({
            data: {
              campaignId: id,
              fieldName: fieldNameClean,
              fieldLabel: f.fieldLabel?.trim() || `Question ${i + 1}`,
              fieldType: f.fieldType || 'TEXT',
              marks: fieldMarks,
              placeholder: f.placeholder || null,
              isRequired: f.isRequired !== false,
              orderIndex: i + 1,
              optionsJson: f.optionsJson ? (typeof f.optionsJson === 'string' ? f.optionsJson : JSON.stringify(f.optionsJson)) : null,
            }
          });
        }
      }
    }

    const updated = await prisma.dynamicCampaign.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
        submissions: true,
      }
    });

    return NextResponse.json({ success: true, message: 'Campaign and questions updated successfully', campaign: updated });
  } catch (error: any) {
    console.error('Error updating campaign questions & marks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    await prisma.dynamicCampaign.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
