import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ success: false, error: 'Route removed. Use Vercel Blob URLs directly.' }, { status: 410 });
}
