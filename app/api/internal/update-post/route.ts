import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client"; // Import the generated type

export async function POST(req: Request) {
  const secret = req.headers.get('x-internal-secret');
  
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, status, errorMessage } = await req.json();

  try {
    // Validate that the status is a valid Enum value
    if (!Object.values(PostStatus).includes(status)) {
      throw new Error("Invalid status value");
    }

    await prisma.post_Metadata.update({
      where: { postId: postId },
      data: { 
        status: status as PostStatus,
        processingError: errorMessage || null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook update failed:", error.message);
    return NextResponse.json({ error: "DB Update Failed" }, { status: 500 });
  }
}