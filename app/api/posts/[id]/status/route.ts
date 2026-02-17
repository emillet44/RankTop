import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const meta = await prisma.post_Metadata.findUnique({
      where: { postId: id },
      select: { status: true, processingError: true }
    });

    if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ 
      status: meta.status, 
      error: meta.processingError 
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}