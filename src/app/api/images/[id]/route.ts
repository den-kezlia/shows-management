import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ImageModel } from '@/lib/models';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
  const doc = await ImageModel.findById(id).lean<{ filename: string; contentType: string; size: number; data: Buffer | { type: string; data: number[] } | ArrayBuffer | Uint8Array }>();
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    const headers = new Headers({
      'Content-Type': doc.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
  let buf: Buffer;
  if (Buffer.isBuffer(doc.data)) {
    buf = doc.data;
  } else if (doc.data instanceof ArrayBuffer) {
    buf = Buffer.from(doc.data);
  } else if (doc.data instanceof Uint8Array) {
    buf = Buffer.from(doc.data);
  } else if (doc.data && typeof doc.data === 'object' && 'data' in doc.data && Array.isArray((doc.data as { data: number[] }).data)) {
    buf = Buffer.from((doc.data as { data: number[] }).data);
  } else {
    return NextResponse.json({ success: false, error: 'Invalid image data' }, { status: 500 });
  }
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf);
  return new Response(ab, { headers });
  } catch (e) {
    console.error('Image fetch error', e);
    return NextResponse.json({ success: false, error: 'Failed to fetch image' }, { status: 500 });
  }
}
