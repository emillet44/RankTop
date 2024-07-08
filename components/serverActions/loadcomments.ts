'use server'

import { prisma } from "@/lib/prisma";

export async function LoadBatch(batch: number, type: string, userid: string, postid: string) {
  const comments = await prisma.comments.findMany({
    skip: 5 * batch,
    take: 5,
    where: {
      parentId: null,
      postId: postid,
    },
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

export async function LoadReplies(commentid: string, userid: string) {
  const replies = await prisma.comments.findMany({
    where: {
      parentId: commentid,
    },
    orderBy: [
      {
        likes: 'desc'
      },
    ],
  });

  const updcomments = Promise.all(replies.map(async reply => ({
    ...reply,
    userliked: await prisma.comment_Likes.findUnique({
      where: {
        userId_commentId: {
          userId: userid,
          commentId: reply.id,
        },
      },
    }) != null
  })));

  return updcomments;
}