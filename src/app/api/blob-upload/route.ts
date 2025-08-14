export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll('files') as File[];
    if (!files.length) {
      return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
    }

    const urls: string[] = [];
    for (const file of files) {
      if (!file.type?.startsWith('image/')) {
        return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
      }
      const ab = await file.arrayBuffer();
      const key = `shows/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
      const { url } = await put(key, new Blob([ab], { type: file.type }), {
        access: 'public',
        addRandomSuffix: false,
      });
      urls.push(url);
    }

    return NextResponse.json({ success: true, urls });
  } catch (e) {
    console.error('Blob upload error', e);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
