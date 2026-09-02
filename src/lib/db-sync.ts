import { prisma } from '@/lib/prisma';

let syncAttempted = false;

export async function autoSyncDatabaseColumns() {
  if (syncAttempted) return;
  syncAttempted = true;

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `User` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1'
    );
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Department` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1'
    );
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Invitation` ADD COLUMN `mailSent` TINYINT(1) NOT NULL DEFAULT 0'
    );
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Invitation` ADD COLUMN `mailSentAt` DATETIME NULL'
    );
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Invitation` ADD COLUMN `mailSentStaffName` VARCHAR(255) NULL'
    );
  } catch (e) {}
}
