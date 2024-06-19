'use server'

import { prisma } from "@/lib/prisma";

export async function UserLikedComment(userid: string, commentid: string) {
    const liked = await prisma.comment_Likes.findUnique({
        where: {
          userId_commentId: {
            userId: userid,
            commentId: commentid,
          },
        },
      }) != null;
      return liked;
}

export async function CommentLikes(commentid: string) {
  const comment = await prisma.comments.findUnique({
    where: {
      id: commentid,
    },
    select: {
      likes: true,
    },
  });
  return comment?.likes || NaN;
}