'use server'

import { prisma } from "@/lib/prisma";

//This server action loads different types of posts from the database, either 50, or the first 50 results of a search. Soon there will be functions to load categories, subcategories,
//by likes, or by views

export async function LoadAll() {
  const aposts = await prisma.posts.findMany({
    include: {
      metadata: true,
    },
  });
  return aposts;
}
export async function LoadBatch(batch: number) {

  const bposts = await prisma.posts.findMany({
    skip: 3*batch,
    take: 3,
    include: {
      metadata: true,
    },
  });
  return bposts;
}
export async function LoadResults(search: string) {
  const rposts = await prisma.posts.findMany({
    take: 50,
    where: { 
      title: { contains: search, mode: 'insensitive' } 
    },
    include: {
      metadata: true,
    },
  })

  return rposts;
}