import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ImageModel } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
  const doc = await ImageModel.findById(id).lean<{ filename: string; contentType: string; size: number; data: Buffer }>();
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    const headers = new Headers({
      'Content-Type': doc.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
  const buf = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from((doc.data as any).buffer);
  return new Response(buf, { headers });
  } catch (e) {
    console.error('Image fetch error', e);
    return NextResponse.json({ success: false, error: 'Failed to fetch image' }, { status: 500 });
  }
}
