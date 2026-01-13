import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

export async function POST(req: Request) {
  const body = await req.json();
  const url = process.env.VIDEO_PREVIEW_SERVICE_URL;

  try {
    const client = await auth.getIdTokenClient(url!);
    
    const response = await client.request({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: body,
      responseType: 'stream', // Always a stream for previews
    });

    return new Response(response.data as any, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("Preview Proxy Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}