'use server'

import { prisma } from "@/lib/prisma";

export async function LoadBatch(batch: number, type: string, userid: string, postid: string) {
  const comments = await prisma.comments.findMany({
    skip: 10 * batch,
    take: 10,
    where: {
      parentId: null,
      postId: postid,
    },
    orderBy: [
      { likes: 'desc' },
      { date: 'desc' }
    ],
  });

  if (userid) {
    const likedCommentIds = await prisma.comment_Likes.findMany({
      where: {
        userId: userid,
        commentId: { in: comments.map(c => c.id) }
      },
      select: { commentId: true }
    });
    
    const likedSet = new Set(likedCommentIds.map(l => l.commentId));
    
    return comments.map(comment => ({
      ...comment,
      userliked: likedSet.has(comment.id)
    }));
  }

  return comments.map(comment => ({
    ...comment,
    userliked: false
  }));
}

export async function LoadReplies(commentid: string, userid: string) {
  const replies = await prisma.comments.findMany({
    where: {
      parentId: commentid,
    },
    orderBy: [
      { date: 'asc' }
    ],
  });

  if (userid) {
    const likedReplyIds = await prisma.comment_Likes.findMany({
      where: {
        userId: userid,
        commentId: { in: replies.map(r => r.id) }
      },
      select: { commentId: true }
    });

    const likedSet = new Set(likedReplyIds.map(l => l.commentId));

    return replies.map(reply => ({
      ...reply,
      userliked: likedSet.has(reply.id)
    }));
  }

  return replies.map(reply => ({
    ...reply,
    userliked: false
  }));
}
