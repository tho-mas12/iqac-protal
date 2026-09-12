import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results: any = {};

  try {
    const userCount = await prisma.user.count();
    const deptCount = await prisma.department.count();
    const invCount = await prisma.invitation.count();

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        whatsappSenderNumber: '9626806328',
        whatsappReceiverNumber: '7418671366',
        whatsappEnabled: true,
        whatsappProvider: 'ultramsg',
      },
    });

    results.users = userCount;
    results.departments = deptCount;
    results.invitations = invCount;
    results.systemSettings = 'Ready';

    return NextResponse.json({
      success: true,
      message: 'Database verified and synchronized successfully.',
      results,
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message || 'Database migration check error',
    }, { status: 500 });
  }
}
