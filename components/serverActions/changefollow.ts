'use server'

import { prisma } from "@/lib/prisma"

export async function addFollow(profileid: string, userid: string) {
  await prisma.$transaction([
    prisma.follow.create({
      data: {
        followerId: userid,     
        followingId: profileid,   
      },
    }),
    prisma.user.update({
      where: { id: userid },
      data: {
        followingCount: { increment: 1 },
      },
    }),
    prisma.user.update({
      where: { id: profileid },
      data: {
        followerCount: { increment: 1 },
      },
    }),
  ]);
}
export async function removeFollow(profileid: string, userid: string) {
  await prisma.$transaction([
    prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userid,
          followingId: profileid,
        },
      },
    }),
    prisma.user.update({
      where: { id: userid },
      data: {
        followingCount: { decrement: 1 },
      },
    }),
    prisma.user.update({
      where: { id: profileid },
      data: {
        followerCount: { decrement: 1 },
      },
    }),
  ]);
}