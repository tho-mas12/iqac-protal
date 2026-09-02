import { prisma } from '@/lib/prisma';

let syncAttempted = false;

export async function autoSyncDatabaseColumns() {
  if (syncAttempted) return;
  syncAttempted = true;

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `User` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1'
    );
  } catch (e) {
    // Column might already exist, ignore
  }

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Department` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1'
    );
  } catch (e) {
    // Column might already exist, ignore
  }
}
