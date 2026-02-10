export const maxDuration = 60;
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

    // Handle signed URL generation
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

    const { title, r1, r2, r3, r4, r5, description, category, username, userid, visibility } = body;

    // 1. Create the DB record with status 'PROCESSING'
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
          create: {
            videos: true,
            status: 'PROCESSING'
          }
        }
      }
    });

    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const currentWebsiteUrl = `${protocol}://${host}`;

    // 2. Create Cloud Task via REST API (no SDK needed!)
    const project = process.env.GOOGLE_PROJECT_ID!;
    const location = 'us-central1';
    const queue = 'video-processing';
    
    const queuePath = `projects/${project}/locations/${location}/queues/${queue}`;
    const taskApiUrl = `https://cloudtasks.googleapis.com/v2/${queuePath}/tasks`;

    // Get access token
    const accessToken = await auth.getAccessToken();

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
            ...body,
            postId: post.id,
          })).toString('base64'),
          oidcToken: {
            serviceAccountEmail: process.env.GOOGLE_CLIENT_EMAIL,
          },
        },
      },
    };

    const taskResponse = await fetch(taskApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskPayload),
    });

    if (!taskResponse.ok) {
      const errorText = await taskResponse.text();
      throw new Error(`Failed to create task: ${taskResponse.status} - ${errorText}`);
    }

    // 3. Return immediately with the postId
    return new Response(null, {
      status: 200,
      headers: { 'X-Post-Id': post.id },
    });

  } catch (error: any) {
    console.error("Final Proxy Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}