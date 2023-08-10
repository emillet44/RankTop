'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "../app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

let states: any[] = [false, false];

export async function SignState() {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (email !== null && email !== undefined) {
    states[0] = true;
    states[3] = email;

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    states[4] = user?.id;

    if (user?.username !== null) {
      states[1] = true;
      states[2] = user?.username;
    }
    else {
      states[1] = false;
    }
  }
  else {
    states[0] = false;
  }
  return states;
}

export async function ClientSignState(id: string) {
  const session = await getServerSession(authOptions);

  return session;
}

export async function UniqueUsername(username: string) {

  const unique = await prisma.user.findUnique({
    where: { username: username },
  });

  if (unique !== null) {
    return true;
  }
  return false;
}

export async function CreateUsername(username: string) {
  
  const newusername = await prisma.user.update({
    where: { email: states[3] },
    data: { username: username }
  });
}

export async function Likes(id: string) {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (email !== null && email !== undefined) {

    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    states[4] = user?.id;
  }
  const likes = await prisma.likes.findUnique({
    where: { userId: states[4], postid: id }
  });
  const liked = likes !== null;
  states[5] = liked;

  const post = await prisma.post.findUnique({
    where: { id: id },
  });
  states[6] = post?.likes;

  return states;
} 

  
