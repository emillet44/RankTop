import { prisma } from "@/lib/prisma";

export async function LoadBatch(batch: number, type: string) {
  const comments = await prisma.comments.findMany({
    skip: 4 * batch,
    take: 4,
    orderBy: [
      {
        likes: 'desc'
      },
    ],
  });
  return comments;
}