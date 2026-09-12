import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_TABLES = ['invitations', 'departments', 'users', 'history', 'settings'];

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const table = (searchParams.get('table') || 'invitations').toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '20')));
    const search = (searchParams.get('search') || '').trim();
    const skip = (page - 1) * limit;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });
    }

    let records: any[] = [];
    let total = 0;

    switch (table) {
      case 'invitations': {
        const where: any = {};
        if (search) {
          where.OR = [
            { programTitle: { contains: search } },
            { category: { contains: search } },
            { shift: { contains: search } },
            { status: { contains: search } },
            { fileName: { contains: search } },
            { department: { name: { contains: search } } },
          ];
        }

        [total, records] = await Promise.all([
          prisma.invitation.count({ where }),
          prisma.invitation.findMany({
            where,
            include: {
              department: { select: { id: true, name: true, code: true, shift: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
        ]);
        break;
      }

      case 'departments': {
        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search } },
            { code: { contains: search } },
            { shift: { contains: search } },
          ];
        }

        [total, records] = await Promise.all([
          prisma.department.count({ where }),
          prisma.department.findMany({
            where,
            include: {
              _count: { select: { users: true, invitations: true } },
            },
            orderBy: { name: 'asc' },
            skip,
            take: limit,
          }),
        ]);
        break;
      }

      case 'users': {
        const where: any = {};
        if (search) {
          where.OR = [
            { username: { contains: search } },
            { name: { contains: search } },
            { role: { contains: search } },
            { department: { name: { contains: search } } },
          ];
        }

        [total, records] = await Promise.all([
          prisma.user.count({ where }),
          prisma.user.findMany({
            where,
            select: {
              id: true,
              username: true,
              name: true,
              role: true,
              departmentId: true,
              department: { select: { id: true, name: true, code: true, shift: true } },
              isPasswordChanged: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
        ]);
        break;
      }

      case 'history': {
        const where: any = {};
        if (search) {
          where.OR = [
            { action: { contains: search } },
            { actorName: { contains: search } },
            { actorRole: { contains: search } },
            { notes: { contains: search } },
            { invitation: { programTitle: { contains: search } } },
          ];
        }

        [total, records] = await Promise.all([
          prisma.invitationHistory.count({ where }),
          prisma.invitationHistory.findMany({
            where,
            include: {
              invitation: { select: { id: true, programTitle: true, category: true } },
            },
            orderBy: { timestamp: 'desc' },
            skip,
            take: limit,
          }),
        ]);
        break;
      }

      case 'settings': {
        [total, records] = await Promise.all([
          prisma.systemSettings.count(),
          prisma.systemSettings.findMany({
            orderBy: { updatedAt: 'desc' },
            skip,
            take: limit,
          }),
        ]);
        break;
      }
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      table,
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error in database API GET:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch table data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { table, id, data } = body;

    if (!table || !id || !data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Missing required parameters (table, id, data)' }, { status: 400 });
    }

    if (!ALLOWED_TABLES.includes(table.toLowerCase())) {
      return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });
    }

    let updatedRecord: any = null;

    switch (table.toLowerCase()) {
      case 'invitations': {
        const allowedFields = [
          'programTitle',
          'category',
          'customCategory',
          'shift',
          'status',
          'revisionCount',
          'checkLogo',
          'checkTitle',
          'checkHeaders',
          'checkOthers',
          'directorRemarks',
          'hardCopyReceived',
          'mailSent',
        ];
        const updateData: any = {};
        for (const key of allowedFields) {
          if (key in data) {
            updateData[key] = data[key];
          }
        }
        if (data.fromDate) updateData.fromDate = new Date(data.fromDate);
        if (data.toDate) updateData.toDate = new Date(data.toDate);

        updatedRecord = await prisma.invitation.update({
          where: { id },
          data: updateData,
        });
        break;
      }

      case 'departments': {
        const allowedFields = ['name', 'code', 'shift', 'driveFolderId', 'isActive'];
        const updateData: any = {};
        for (const key of allowedFields) {
          if (key in data) {
            updateData[key] = data[key];
          }
        }
        updatedRecord = await prisma.department.update({
          where: { id },
          data: updateData,
        });
        break;
      }

      case 'users': {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.username !== undefined) updateData.username = data.username.trim().toLowerCase();
        if (data.role !== undefined) updateData.role = data.role;
        if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
        if (data.departmentId !== undefined) updateData.departmentId = data.departmentId || null;
        if (data.password && data.password.trim().length > 0) {
          updateData.password = await hashPassword(data.password.trim());
          updateData.isPasswordChanged = true;
        }

        updatedRecord = await prisma.user.update({
          where: { id },
          data: updateData,
        });
        break;
      }

      case 'history': {
        const updateData: any = {};
        if (data.action !== undefined) updateData.action = data.action;
        if (data.actorName !== undefined) updateData.actorName = data.actorName;
        if (data.actorRole !== undefined) updateData.actorRole = data.actorRole;
        if (data.notes !== undefined) updateData.notes = data.notes;

        updatedRecord = await prisma.invitationHistory.update({
          where: { id },
          data: updateData,
        });
        break;
      }

      case 'settings': {
        updatedRecord = await prisma.systemSettings.update({
          where: { id },
          data,
        });
        break;
      }
    }

    return NextResponse.json({ success: true, updatedRecord });
  } catch (error: any) {
    console.error('Error updating table record:', error);
    return NextResponse.json({ error: error.message || 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const table = (searchParams.get('table') || '').toLowerCase();
    const id = searchParams.get('id');

    if (!table || !id) {
      return NextResponse.json({ error: 'Missing table or id parameter' }, { status: 400 });
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });
    }

    // Safety checks for User deletion
    if (table === 'users') {
      if (session.userId === id) {
        return NextResponse.json({ error: 'Cannot delete your own active Admin account.' }, { status: 400 });
      }
    }

    switch (table) {
      case 'invitations':
        await prisma.invitation.delete({ where: { id } });
        break;
      case 'departments':
        await prisma.department.delete({ where: { id } });
        break;
      case 'users':
        await prisma.user.delete({ where: { id } });
        break;
      case 'history':
        await prisma.invitationHistory.delete({ where: { id } });
        break;
      case 'settings':
        return NextResponse.json({ error: 'Cannot delete primary system settings.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Record ${id} deleted successfully from ${table}` });
  } catch (error: any) {
    console.error('Error deleting table record:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete record' }, { status: 500 });
  }
}
