import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAction, ActionType, ModuleType } from '@/lib/action-logger';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));
    const action = searchParams.get('action');
    const module = searchParams.get('module');
    const username = searchParams.get('username');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const isExport = searchParams.get('export') === 'csv';

    const where: any = {};

    if (action && action !== 'ALL') {
      where.action = action;
    }

    if (module && module !== 'ALL') {
      where.module = module;
    }

    if (username) {
      where.username = { contains: username.trim().toUpperCase() };
    }

    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) {
        where.timestamp.gte = new Date(fromDate);
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp.lte = end;
      }
    }

    if (search) {
      const term = search.trim();
      where.OR = [
        { username: { contains: term } },
        { targetName: { contains: term } },
        { details: { contains: term } },
        { ipAddress: { contains: term } },
        { role: { contains: term } },
      ];
    }

    // CSV Export Handling
    if (isExport) {
      const allLogs = await prisma.actionLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 5000,
      });

      const csvHeader = ['Timestamp', 'Actor Username', 'Role', 'Action', 'Module', 'Target ID', 'Target Name', 'Details', 'IP Address', 'User Agent'];
      const csvRows = allLogs.map(l => [
        `"${l.timestamp.toISOString()}"`,
        `"${l.username}"`,
        `"${l.role}"`,
        `"${l.action}"`,
        `"${l.module}"`,
        `"${(l.targetId || '').replace(/"/g, '""')}"`,
        `"${(l.targetName || '').replace(/"/g, '""')}"`,
        `"${(l.details || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${l.ipAddress || ''}"`,
        `"${(l.userAgent || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [csvHeader.join(','), ...csvRows.map(r => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="IQAC_Portal_Action_Logs_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Paginated Fetch + Statistics
    const [totalLogs, logs, actionCounts] = await Promise.all([
      prisma.actionLog.count({ where }),
      prisma.actionLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.actionLog.groupBy({
        by: ['action'],
        _count: { action: true },
      }),
    ]);

    const stats: Record<string, number> = {
      TOTAL: 0,
      CREATE: 0,
      READ: 0,
      UPDATE: 0,
      DELETE: 0,
      LOGIN: 0,
      LOGOUT: 0,
    };

    let totalAll = 0;
    actionCounts.forEach(c => {
      stats[c.action] = c._count.action;
      totalAll += c._count.action;
    });
    stats.TOTAL = totalAll;

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total: totalLogs,
        page,
        limit,
        totalPages: Math.ceil(totalLogs / limit),
      },
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching action logs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch action logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const username = user?.username || body.username || 'SYSTEM';
    const role = user?.role || body.role || 'USER';

    await logAction({
      req,
      username,
      role,
      actorId: user?.userId || body.actorId,
      action: (body.action || 'GENERAL') as ActionType,
      module: (body.module || 'GENERAL') as ModuleType,
      targetId: body.targetId,
      targetName: body.targetName,
      details: body.details,
    });

    return NextResponse.json({ success: true, message: 'Action recorded successfully.' });
  } catch (error: any) {
    console.error('Error recording action log:', error);
    return NextResponse.json({ error: error.message || 'Failed to record action log' }, { status: 500 });
  }
}
