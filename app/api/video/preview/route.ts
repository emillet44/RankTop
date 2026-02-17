import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// Cloud Run Auth (ID Tokens - for HTTP requests)
const cloudRunAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

// Cloud Tasks Auth (Access Tokens - for creating tasks)
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
  const serviceUrl = process.env.VIDEO_PREVIEW_SERVICE_URL;

  try {
    // 1. Proxy standard HTTP requests (getUploadUrls, checkStatus)
    // We use ID tokens to call the Cloud Function directly
    if (body.action === 'getUploadUrls' || body.action === 'checkStatus') {
      const client = await cloudRunAuth.getIdTokenClient(serviceUrl!);
      const response = await client.request({
        url: serviceUrl,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: body,
      });
      return NextResponse.json(response.data);
    }

    // 2. Trigger Processing via Cloud Task
    // This offloads the long-running request to Google's queue
    if (body.action === 'trigger') {
      const project = process.env.GOOGLE_PROJECT_ID!;
      const location = 'us-central1';
      const queue = 'video-processing'; // Ensure this queue exists
      const taskApiUrl = `https://cloudtasks.googleapis.com/v2/projects/${project}/locations/${location}/queues/${queue}/tasks`;

      const accessToken = await cloudTasksAuth.getAccessToken();

      // The task will call GCR with action='process'
      const taskPayload = {
        task: {
          httpRequest: {
            httpMethod: 'POST',
            url: serviceUrl,
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.from(JSON.stringify({
              action: 'process',
              sessionId: body.sessionId,
              title: body.title,
              ranks: body.ranks,
              filePaths: body.filePaths
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
        throw new Error(`Cloud Task Failed: ${taskResponse.statusText}`);
      }

      return NextResponse.json({ status: 'QUEUED' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error("Preview API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}