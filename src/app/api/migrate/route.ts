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

  return NextResponse.json({
    success: true,
    message: 'Database columns sync completed',
    results,
  });
}
