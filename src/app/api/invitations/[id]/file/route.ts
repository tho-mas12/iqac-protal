import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Legacy route deprecated.' });
}

export async function POST() {
  return NextResponse.json({ message: 'Legacy route deprecated.' });
}

export async function PATCH() {
  return NextResponse.json({ message: 'Legacy route deprecated.' });
}
