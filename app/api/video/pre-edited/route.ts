import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { prisma } from "@/lib/prisma";

interface Timestamp {
  rankIndex: number;
  time: number; // seconds
}

const cloudRunAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

const cloudTasksAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

export async function POST(req: Request) {
  const body = await req.json();
  // Same service as the auto-stitch pipeline — GCR routes internally by videoMode
  const url = process.env.FINAL_VIDEO_SERVICE_URL;

  if (!url) {
    return NextResponse.json({ error: 'FINAL_VIDEO_SERVICE_URL is not configured' }, { status: 500 });
  }

  try {
    // 1. Proxy: Check Status
    if (body.action === 'checkStatus') {
      const client = await cloudRunAuth.getIdTokenClient(url);
      const response = await client.request({
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: body,
      });
      return NextResponse.json(response.data);
    }

    // 2. Proxy: Get a single signed upload URL for the pre-edited file
    if (body.action === 'getUploadUrl') {
      const { sessionId, fileType } = body;
      if (!sessionId || !fileType) {
        return NextResponse.json({ error: 'Missing sessionId or fileType' }, { status: 400 });
      }

      const client = await cloudRunAuth.getIdTokenClient(url);
      const response = await client.request({
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { action: 'getUploadUrl', sessionId, fileType },
      });
      return NextResponse.json(response.data);
    }

    // 3. Create Submission (DB Record + Cloud Task)
    const {
      title, r1, r2, r3, r4, r5,
      description, category, username, userid, visibility,
      filePath, sessionId, timestamps: timestampsRaw, endTime,
    } = body;

    const timestamps: Timestamp[] = typeof timestampsRaw === 'string'
      ? JSON.parse(timestampsRaw)
      : (timestampsRaw ?? []);

    if (!filePath) {
      return NextResponse.json({ error: 'Missing filePath' }, { status: 400 });
    }
    if (!timestamps.length) {
      return NextResponse.json({ error: 'Missing timestamps' }, { status: 400 });
    }

    const post = await prisma.posts.create({
      data: {
        title,
        rank1: r1, rank2: r2, rank3: r3, rank4: r4, rank5: r5,
        description: description || null,
        category: category === 'None' ? '' : category,
        username: username || null,
        author: userid ? { connect: { id: userid } } : undefined,
        private: visibility === 'Private',
        metadata: {
          create: { videos: true, status: 'PROCESSING' }
        }
      }
    });

    const ranks = [r1, r2, r3, r4, r5].filter(Boolean);
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const currentWebsiteUrl = `${protocol}://${host}`;

    const project = process.env.GOOGLE_PROJECT_ID!;
    const location = 'us-central1';
    const queue = 'video-processing'; // Shared queue with final pipeline
    const taskApiUrl = `https://cloudtasks.googleapis.com/v2/projects/${project}/locations/${location}/queues/${queue}/tasks`;

    const accessToken = await cloudTasksAuth.getAccessToken();

    const taskPayload = {
      task: {
        httpRequest: {
          httpMethod: 'POST',
          url,
          headers: {
            'Content-Type': 'application/json',
            'x-callback-url': currentWebsiteUrl,
          },
          body: Buffer.from(JSON.stringify({
            videoMode: 'pre-edited',  // tells GCR which pipeline to use
            title,
            ranks,
            filePath,
            sessionId,
            timestamps,
            endTime,
            postId: post.id,
          })).toString('base64'),
          oidcToken: {
            serviceAccountEmail: process.env.GOOGLE_CLIENT_EMAIL,
          },
        },
      },
    };

    await fetch(taskApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskPayload),
    });

    return new Response(null, {
      status: 200,
      headers: { 'X-Post-Id': post.id },
    });

  } catch (error: any) {
    console.error('Pre-Edited Proxy Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}