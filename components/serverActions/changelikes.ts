'use server'

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

//This server action has a function to update likes on the database, which updates the post first, then it adds the postId to the users liked posts.
//It can both add or remove likes depending on the add parameter. The likes function first loads the user email, the uses it to find the user record
//in the database. It then uses the user id to check whether the user has liked the post or not, then it uses the post id parameter it recieved to
//find how many likes the post has already.
export async function ChangeLikes(identifier: string, add: boolean, userid: string) {

  if(add) {
    const post = await prisma.post.update({
      where: { id: identifier },
      data: { likes: { increment: 1 } }
    });
    
    if (userid !== null) {
      const userlike = await prisma.likes.create({
        data:{ 
          postId: identifier,
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
        where: { userId: userid, postId: identifier }
      })
    }
  }
}

let states: any[] = ["", "", false, 0];
export async function Likes(id: string) {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  states[0] = email;
  let userid: string = "";

  if (email !== null && email !== undefined) {

    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    if(user?.id !== undefined) {
      userid = user?.id;
      states[1] = userid;
    }
  }
  const likes = await prisma.likes.findUnique({
    where: { userId: userid, postId: id }
  });
  const liked = likes !== null;
  states[2] = liked;

  const post = await prisma.post.findUnique({
    where: { id: id },
  });
  states[3] = post?.likes;

  return states;
}