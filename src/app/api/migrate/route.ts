import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results: any = {};

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `User` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1'
    );
    results.user = 'Added isActive to User';
  } catch (e: any) {
    results.user = e.message || 'Already exists or error';
  }

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Department` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1'
    );
    results.department = 'Added isActive to Department';
  } catch (e: any) {
    results.department = e.message || 'Already exists or error';
  }

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Invitation` ADD COLUMN `mailSent` TINYINT(1) NOT NULL DEFAULT 0'
    );
    results.mailSent = 'Added mailSent to Invitation';
  } catch (e: any) {
    results.mailSent = e.message || 'Already exists or error';
  }

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Invitation` ADD COLUMN `mailSentAt` DATETIME NULL'
    );
    results.mailSentAt = 'Added mailSentAt to Invitation';
  } catch (e: any) {
    results.mailSentAt = e.message || 'Already exists or error';
  }

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Invitation` ADD COLUMN `mailSentStaffName` VARCHAR(255) NULL'
    );
    results.mailSentStaffName = 'Added mailSentStaffName to Invitation';
  } catch (e: any) {
    results.mailSentStaffName = e.message || 'Already exists or error';
  }

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
    await prisma.$executeRawUnsafe(`
      INSERT IGNORE INTO \`SystemSettings\` (\`id\`, \`whatsappSenderNumber\`, \`whatsappReceiverNumber\`, \`whatsappEnabled\`, \`updatedAt\`)
      VALUES ('default', '9626806328', '7418671366', 1, NOW());
    `);
    results.systemSettings = 'SystemSettings table ready';
  } catch (e: any) {
    results.systemSettings = e.message || 'Error creating SystemSettings';
  }

  return NextResponse.json({
    success: true,
    message: 'Database columns & settings sync completed',
    results,
  });
}
