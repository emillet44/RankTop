export const maxDuration = 300; // Allows execution for up to 5 minutes
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { prisma } from "@/lib/prisma";

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

export async function POST(req: Request) {
  const body = await req.json();
  const url = process.env.FINAL_VIDEO_SERVICE_URL;

  try {
    const client = await auth.getIdTokenClient(url!);

    // PHASE 1: Getting Signed URLs (JSON)
    if (body.action === 'getUploadUrls') {
      const response = await client.request({
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: body,
        responseType: 'json',
      });
      return NextResponse.json(response.data);
    }

    // PHASE 2: Database Creation and Final Processing (Streaming)
    const { title, r1, r2, r3, r4, r5, description, category, username, userid, visibility } = body;

    // Create the DB record
    const post = await prisma.posts.create({
      data: {
        title,
        rank1: r1, rank2: r2, rank3: r3, rank4: r4, rank5: r5,
        description: description || null,
        category: category === "None" ? "" : category,
        username: username || null,
        author: userid ? { connect: { id: userid } } : undefined,
        private: visibility === "Private",
        metadata: { create: { videos: true } }
      }
    });

    // Trigger Cloud Run 1080p Render
    const response = await client.request({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { ...body, postId: post.id },
      responseType: 'stream',
    });

    return new Response(response.data as any, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none',
        'X-Accel-Buffering': 'no',
        'Access-Control-Expose-Headers': 'X-Post-Id',
        'X-Post-Id': post.id,
      },
    });

  } catch (error: any) {
    console.error("Final Proxy Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}