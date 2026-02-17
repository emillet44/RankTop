import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { prisma } from "@/lib/prisma";

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
  const url = process.env.FINAL_VIDEO_SERVICE_URL;

  try {
    // 1. Proxy Actions (Upload URLs OR Check Status)
    if (body.action === 'getUploadUrls' || body.action === 'checkStatus') {
      const client = await cloudRunAuth.getIdTokenClient(url!);
      const response = await client.request({
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: body,
      });
      return NextResponse.json(response.data);
    }

    // 2. Create Submission (DB Record + Cloud Task)
    const { title, r1, r2, r3, r4, r5, description, category, username, userid, visibility, filePaths } = body;

    const post = await prisma.posts.create({
      data: {
        title,
        rank1: r1, rank2: r2, rank3: r3, rank4: r4, rank5: r5,
        description: description || null,
        category: category === "None" ? "" : category,
        username: username || null,
        author: userid ? { connect: { id: userid } } : undefined,
        private: visibility === "Private",
        metadata: {
          create: { videos: true, status: 'PROCESSING' } 
        }
      }
    });

    const ranks = [r1, r2, r3, r4, r5].filter(Boolean);
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const currentWebsiteUrl = `${protocol}://${host}`;

    // Cloud Task setup
    const project = process.env.GOOGLE_PROJECT_ID!;
    const location = 'us-central1';
    const queue = 'video-processing'; // Shared queue
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
            title,
            ranks,
            filePaths,
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
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(taskPayload),
    });

    return new Response(null, { status: 200, headers: { 'X-Post-Id': post.id } });

  } catch (error: any) {
    console.error("Final Proxy Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}