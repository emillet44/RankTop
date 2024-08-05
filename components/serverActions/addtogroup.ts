'use server'

import { prisma } from "@/lib/prisma";

export async function AddToGroup(userid: string, groupid: string) {
  const updatedGroup = await prisma.groups.update({
    where: { id: groupid },
    data: {
      members: {
        connect: { id: userid }
      },
      population: {
        increment: 1
      }
    },
  });
  if(updatedGroup) {
    return true;
  }
  return false;
}