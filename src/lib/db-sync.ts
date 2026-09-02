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

  // Create SystemSettings table if it does not exist
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`SystemSettings\` (
        \`id\` VARCHAR(191) NOT NULL PRIMARY KEY DEFAULT 'default',
        \`whatsappSenderNumber\` VARCHAR(191) NOT NULL DEFAULT '9626806328',
        \`whatsappReceiverNumber\` VARCHAR(191) NOT NULL DEFAULT '7418671366',
        \`whatsappEnabled\` TINYINT(1) NOT NULL DEFAULT 1,
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure default settings row exists
    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO \`SystemSettings\` (\`id\`, \`whatsappSenderNumber\`, \`whatsappReceiverNumber\`, \`whatsappEnabled\`, \`updatedAt\`)
      VALUES ('default', '9626806328', '7418671366', 1, NOW());
    `);
  } catch (e) {}
}
