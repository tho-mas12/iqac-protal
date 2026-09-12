import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import os from 'os';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Helper to calculate folder size and count files recursively
function getFolderStats(dirPath: string): { totalSize: number; fileCount: number } {
  let totalSize = 0;
  let fileCount = 0;

  if (!fs.existsSync(dirPath)) {
    return { totalSize: 0, fileCount: 0 };
  }

  function walk(currentPath: string) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            totalSize += stats.size;
            fileCount++;
          } catch {
            // Ignore individual file read errors
          }
        }
      }
    } catch {
      // Ignore directory read errors
    }
  }

  walk(dirPath);
  return { totalSize, fileCount };
}

// Helper to format bytes into human readable format
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Helper to format seconds to human-readable duration
function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // 1. Disk Storage Calculation
    let diskStats = {
      total: 0,
      free: 0,
      used: 0,
      percentUsed: 0,
      formattedTotal: 'N/A',
      formattedFree: 'N/A',
      formattedUsed: 'N/A',
    };

    try {
      const rootPath = process.platform === 'win32' ? process.cwd().split(path.sep)[0] + path.sep : '/';
      const statfs = fs.statfsSync ? fs.statfsSync(rootPath) : null;
      if (statfs) {
        const total = statfs.blocks * statfs.bsize;
        const free = statfs.bavail * statfs.bsize;
        const used = total - free;
        const percentUsed = total > 0 ? Math.round((used / total) * 100) : 0;

        diskStats = {
          total,
          free,
          used,
          percentUsed,
          formattedTotal: formatBytes(total),
          formattedFree: formatBytes(free),
          formattedUsed: formatBytes(used),
        };
      }
    } catch {
      // Fallback
    }

    // 2. Uploads Directory Storage
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    const uploadsFolder = getFolderStats(uploadsPath);

    // 3. RAM / Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);

    const memoryStats = {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      percentUsed: memPercent,
      formattedTotal: formatBytes(totalMem),
      formattedFree: formatBytes(freeMem),
      formattedUsed: formatBytes(usedMem),
    };

    // 4. Node.js Process & OS Health
    const processMem = process.memoryUsage();
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown';
    const cpuCores = cpus.length;

    const systemHealth = {
      platform: os.platform(),
      osType: os.type(),
      osRelease: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      serverUptime: formatUptime(os.uptime()),
      processUptime: formatUptime(process.uptime()),
      nodeVersion: process.version,
      cpuModel,
      cpuCores,
      processRss: formatBytes(processMem.rss),
      processHeapUsed: formatBytes(processMem.heapUsed),
      processHeapTotal: formatBytes(processMem.heapTotal),
    };

    // 5. Database Row Counts & Metrics
    const [
      invitationsCount,
      departmentsCount,
      usersCount,
      historyCount,
      settingsCount,
      approvedCount,
      pendingCount,
      remarksCount,
    ] = await Promise.all([
      prisma.invitation.count().catch(() => 0),
      prisma.department.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.invitationHistory.count().catch(() => 0),
      prisma.systemSettings.count().catch(() => 0),
      prisma.invitation.count({ where: { status: 'APPROVED' } }).catch(() => 0),
      prisma.invitation.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.invitation.count({ where: { status: 'REMARKS' } }).catch(() => 0),
    ]);

    const databaseStats = {
      totalTables: 5,
      invitationsCount,
      departmentsCount,
      usersCount,
      historyCount,
      settingsCount,
      approvedCount,
      pendingCount,
      remarksCount,
      totalRecords: invitationsCount + departmentsCount + usersCount + historyCount + settingsCount,
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      disk: diskStats,
      uploads: {
        totalSize: uploadsFolder.totalSize,
        fileCount: uploadsFolder.fileCount,
        formattedSize: formatBytes(uploadsFolder.totalSize),
        path: '/public/uploads',
      },
      memory: memoryStats,
      system: systemHealth,
      database: databaseStats,
    });
  } catch (error: any) {
    console.error('Error fetching server status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server metrics', details: error.message },
      { status: 500 }
    );
  }
}
