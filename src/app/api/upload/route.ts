import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ImageModel } from '@/lib/models';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
  await dbConnect();
  const formData = await req.formData();

  const files: File[] = [];
    for (const [, value] of formData.entries()) {
      if (value instanceof File) files.push(value);
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per file
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/bmp': '.bmp',
      'image/svg+xml': '.svg'
    };

  const urls: string[] = [];
  for (const file of files) {
      if (!file.type?.startsWith('image/')) {
        return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
      }
      // Size check using File.size (available in web File/Blob)
      if (typeof file.size === 'number' && file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ success: false, error: 'File too large (max 5MB)' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
        return NextResponse.json({ success: false, error: 'File too large (max 5MB)' }, { status: 400 });
      }
      const buffer = Buffer.from(arrayBuffer);
      const ext = mimeToExt[file.type] || '';
      const base = (file.name || 'file').replace(/[^a-z0-9._-]/gi, '_').slice(0, 80);
      const filename = base.endsWith(ext) || !ext ? base : `${base}${ext}`;
      const created = await ImageModel.create({
        filename,
        contentType: file.type,
        size: buffer.length,
        data: buffer,
      });
      urls.push(`/api/images/${created._id}`);
    }

    return NextResponse.json({ success: true, urls });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
