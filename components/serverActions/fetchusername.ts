'use server'

import { prisma } from "@/lib/prisma";

export async function FetchUsername(userid: string) {
  const author = await prisma.user.findUnique({
    where: { id: userid }
  });
  return author?.username;
}
