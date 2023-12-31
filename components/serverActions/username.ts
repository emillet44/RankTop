'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import { prisma } from "@/lib/prisma"

//This server action has a function to check if a users inputted username is unique or not, and a function to post the username to the database.
//It also prevents users from being named guest as this username is reserved for anyonymous posters. 
export async function UniqueUsername(username: string) {

  if(username == "Guest") {
    return true;
  }
  const unique = await prisma.user.findUnique({
    where: { username: username },
  });

  if (unique !== null) {
    return true;
  }
  return false;
}

export async function CreateUsername(username: string) {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (email !== null && email !== undefined) {
    const newusername = await prisma.user.update({
      where: { email: email },
      data: { username: username }
    });
  }
}