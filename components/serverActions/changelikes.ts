'use server'

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

//This server action has a function to update likes on the database, which updates the post first, then it adds the postId to the users liked posts.
//It can both add or remove likes depending on the add parameter. The likes function first loads the user email, the uses it to find the user record
//in the database. It then uses the user id to check whether the user has liked the post or not, then it uses the post id parameter it recieved to
//find how many likes the post has already.
export async function ChangeLikes(postid: string, add: boolean, userid: string) {
  
  if (add) {

    await prisma.$transaction(async (prisma) => {
      const userlike = await prisma.likes.upsert({
        where: {
          userId_postId: {
            userId: userid,
            postId: postid,
          },
        },
        update: {},
        create: {
          postId: postid,
          user: { connect: { id: userid } },
        },
      });
      await prisma.posts.update({
        where: { id: postid },
        data: {
          metadata: {
            update: {
              likes: { increment: 1 },
            },
          },
        },
      });
    });
  } 
  else {

    await prisma.$transaction(async (prisma) => {
      const removelike = await prisma.likes.delete({
        where: {
          userId_postId: {
            userId: userid,
            postId: postid,
          },
        },
      });
      await prisma.posts.update({
        where: { id: postid },
        data: {
          metadata: {
            update: {
              likes: { decrement: 1 },
            },
          },
        },
      });
    });
  }
}

export async function ChangeCLikes(commentid: string, add: boolean, userid: string) {
  
  if (add) {

    await prisma.$transaction(async (prisma) => {
      const comlike = await prisma.comment_Likes.upsert({
        where: {
          userId_commentId: {
            userId: userid,
            commentId: commentid,
          },
        },
        update: {},
        create: {
          commentId: commentid,
          user: { connect: { id: userid } },
        },
      });
      await prisma.comments.update({
        where: { id: commentid },
        data: {
          likes: { increment: 1 }
        },
      });
    });
  } 
  else {
    
    await prisma.$transaction(async (prisma) => {
      const comlike = await prisma.comment_Likes.delete({
        where: {
          userId_commentId: {
            userId: userid,
            commentId: commentid,
          },
        },
      })
      await prisma.comments.update({
        where: { id: commentid },
        data: {
          likes: { decrement: 1 }
        },
      });
    });
  }
}