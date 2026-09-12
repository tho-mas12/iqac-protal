import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  const str = String(val);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const table = (searchParams.get('table') || 'invitations').toLowerCase();

    let data: any[] = [];
    let filename = `${table}-export-${new Date().toISOString().slice(0, 10)}.csv`;

    switch (table) {
      case 'invitations': {
        const rows = await prisma.invitation.findMany({
          include: { department: { select: { name: true, code: true } } },
          orderBy: { createdAt: 'desc' },
        });
        data = rows.map((r) => ({
          ID: r.id,
          ProgramTitle: r.programTitle,
          Department: r.department?.name || '',
          DeptCode: r.department?.code || '',
          Shift: r.shift,
          Category: r.category,
          FromDate: r.fromDate?.toISOString() || '',
          ToDate: r.toDate?.toISOString() || '',
          Status: r.status,
          RevisionCount: r.revisionCount,
          DirectorRemarks: r.directorRemarks || '',
          HardCopyReceived: r.hardCopyReceived ? 'YES' : 'NO',
          HardCopyReceivedAt: r.hardCopyReceivedAt?.toISOString() || '',
          MailSent: r.mailSent ? 'YES' : 'NO',
          MailSentAt: r.mailSentAt?.toISOString() || '',
          FileName: r.fileName,
          CreatedAt: r.createdAt.toISOString(),
        }));
        break;
      }

      case 'departments': {
        const rows = await prisma.department.findMany({
          include: { _count: { select: { users: true, invitations: true } } },
          orderBy: { name: 'asc' },
        });
        data = rows.map((d) => ({
          ID: d.id,
          Name: d.name,
          Code: d.code,
          Shift: d.shift,
          DriveFolderId: d.driveFolderId || '',
          IsActive: d.isActive ? 'YES' : 'NO',
          TotalUsers: d._count.users,
          TotalInvitations: d._count.invitations,
          CreatedAt: d.createdAt.toISOString(),
        }));
        break;
      }

      case 'users': {
        const rows = await prisma.user.findMany({
          include: { department: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        });
        data = rows.map((u) => ({
          ID: u.id,
          Username: u.username,
          Name: u.name,
          Role: u.role,
          Department: u.department?.name || '',
          IsActive: u.isActive ? 'YES' : 'NO',
          IsPasswordChanged: u.isPasswordChanged ? 'YES' : 'NO',
          CreatedAt: u.createdAt.toISOString(),
        }));
        break;
      }

      case 'history': {
        const rows = await prisma.invitationHistory.findMany({
          include: { invitation: { select: { programTitle: true } } },
          orderBy: { timestamp: 'desc' },
        });
        data = rows.map((h) => ({
          ID: h.id,
          InvitationID: h.invitationId,
          ProgramTitle: h.invitation?.programTitle || '',
          Action: h.action,
          ActorName: h.actorName,
          ActorRole: h.actorRole,
          Notes: h.notes || '',
          Timestamp: h.timestamp.toISOString(),
        }));
        break;
      }

      default:
        return NextResponse.json({ error: `Export not supported for table: ${table}` }, { status: 400 });
    }

    if (data.length === 0) {
      return new NextResponse('No data found', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) => headers.map((field) => escapeCsvField(row[field])).join(',')),
    ];

    const csvString = csvRows.join('\r\n');

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
