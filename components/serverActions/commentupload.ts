'use server'

import { prisma } from "@/lib/prisma"

//Server action for uploading comments and replies, and it adds an extra field "userliked" to match the interface defined in AddComment(used for display purposes)

export async function newComment(userid: string, postid: string, username: string | null | undefined, text: string) {

  const comment = await prisma.comments.create({
    data: {
      userId: userid,
      postId: postid,
      text: text,
      username: username || null,
    }
  });

  const updcomment = {
    ...comment,
    userliked: false,
  };
  return updcomment;
}

export async function newReply(userid: string, postid: string, commentid: string, username: string | null | undefined, text: string) {

  const reply = await prisma.comments.create({
    data: {
      userId: userid,
      postId: postid,
      text: text,
      parentId: commentid,
      username: username || null,
    }
  });
  await prisma.comments.update({
    where: {
      id: commentid,
    },
    data: {
      replies: { increment: 1 },
    },
  });

  const updreply = {
    ...reply,
    userliked: false,
  };
  return updreply;
}