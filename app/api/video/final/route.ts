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
      url, method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: body,
    });
    return NextResponse.json(response.data);
  }

    // 2. Create Submission (DB Record + Cloud Task)
    const { title, description, category, username, userid, visibility, filePaths, layoutConfig } = body;

    const items = [];
    for (let i = 1; i <= 10; i++) {
      const r = body[`r${i}`];
      if (r) {
        items.push({ text: r as string, note: null });
      }
    }
    
    // Convert the stringified JSON from the hidden input back into an object
    const parsedLayout = typeof layoutConfig === 'string' ? JSON.parse(layoutConfig) : layoutConfig;

    const post = await prisma.posts.create({
      data: {
        title,
        items: items,
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

    const ranks = items.map(i => i.text);
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const currentWebsiteUrl = `${protocol}://${host}`;

    const project = process.env.GOOGLE_PROJECT_ID!;
    const location = 'us-central1';
    const queue = 'video-processing';
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
            videoMode: 'auto',  // tells GCR which pipeline to use
            title,
            ranks,
            filePaths,
            postId: post.id,
            layoutConfig: parsedLayout,
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