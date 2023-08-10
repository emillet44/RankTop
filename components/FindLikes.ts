'use server'

import { prisma } from "@/lib/prisma";

export async function ChangeLikes(identifier: string, add: boolean, userid: string) {

  if(add) {
    const post = await prisma.post.update({
      where: { id: identifier },
      data: { likes: { increment: 1 } }
    });
    
    if (userid !== null) {
      const userlike = await prisma.likes.create({
        data:{ 
          postid: identifier,
          user: { connect: {id: userid} } 
        }
      });
    }
  }
  else {
    const post = await prisma.post.update({
      where: { id: identifier },
      data: { likes: { decrement: 1 } }
    });
    if (userid !== null) {
      const removelike = await prisma.likes.delete({
        where: { userId: userid, postid: identifier }
      })
    }
  }
}