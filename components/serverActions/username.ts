'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import { prisma } from "@/lib/prisma"

//This server action has a function to check if a users inputted username is unique or not, and a function to post the username to the database.
//It also prevents users from being named guest as this username is reserved for anyonymous posters. 
//Now updated to set usernames using updateMany, which prevents "two" users from simultaneously clicking the submit button and getting the same username. Also updates all of the posts
//, comments, and replies associated with the user's id with their new username.

export async function UniqueUsername(username: string) {

  if (username == "Guest") {
    return true;
  }
  const unique = await prisma.user.findUnique({
    where: { username: username },
  });

  return unique !== null;
}

export async function CreateUsername(username: string, userid: string) {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (email !== null && email !== undefined) {
    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.user.updateMany({
          where: {
            email: email,
            username: null,
          },
          data: {
            username: username,
          },
        });
        await prisma.posts.updateMany({
          where: {
            authorId: userid,
            username: null,
          },
          data: {
            username: username,
          },
        });
        await prisma.comments.updateMany({
          where: {
            userId: userid,
            username: null,
          },
          data: {
            username: username,
          },
        });
      });
      
    } catch (error) {
      return false;
    }
  }
  return true;
}