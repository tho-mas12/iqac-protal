import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Legacy invitations API deprecated. Use /api/submissions for IQAC workspace.' });
}

export async function POST() {
  return NextResponse.json({ message: 'Legacy invitations API deprecated. Use /api/submissions for IQAC workspace.' });
}
