'use server'

import { prisma } from "@/lib/prisma";

export async function LoadBatch(batch: number, type: string, userid: string) {
  const comments = await prisma.comments.findMany({
    skip: 4 * batch,
    take: 4,
    orderBy: [
      {
        likes: 'desc'
      },
    ],
  });


  const updcomments = Promise.all(comments.map(async comment => ({
    ...comment,
    userliked: await prisma.comment_Likes.findUnique({
      where: {
        userId_commentId: {
          userId: userid,
          commentId: comment.id,
        },
      },
    }) != null
  })));

  return updcomments;
}