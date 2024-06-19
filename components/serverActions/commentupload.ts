'use server'

import { prisma } from "@/lib/prisma"

export async function newComment(userid: string, postid: string, username: string | null | undefined, text: string) {

  const comment = await prisma.comments.create({
    data: {
      userId: userid,
      postId: postid,
      text: text,
      username: username || null,
    }
  });
  return comment;
}