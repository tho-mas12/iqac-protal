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

  return NextResponse.json({
    success: true,
    message: 'Database columns sync completed',
    results,
  });
}
