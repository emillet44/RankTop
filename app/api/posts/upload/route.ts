import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/gcs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for server-side processing

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return NextResponse.json({ error: 'Missing file or name' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 413 }
      );
    }

    const bucketName = 'ranktop-i';
    const buffer = Buffer.from(await file.arrayBuffer());

    await storage.bucket(bucketName).file(name).save(buffer, {
      contentType: file.type,
      resumable: false // Better for small/medium files in API routes
    });

    return NextResponse.json({ success: true, name });
  } catch (error: any) {
    console.error('API Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
