import { prisma } from '@/lib/prisma';

export async function autoSyncDatabaseColumns() {
  try {
    const existingSettings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    if (!existingSettings) {
      await prisma.systemSettings.create({
        data: {
          id: 'default',
          institutionName: "St. Joseph's College (Autonomous)",
          academicYearCurrent: '2025-26',
        },
      });
    }
  } catch (e) {
    // ignore
  }
}
