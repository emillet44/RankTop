'use server'

import { prisma } from "@/lib/prisma";

let vposts: any;
let uposts: any;
let aposts: any;
let rposts: any;

//This server action loads different types of posts from the database, verified, unverified, or all.
export async function LoadVerified() {

  vposts = await prisma.post.findMany({
    where: { verified: true },
  });

  return vposts;
}
export async function LoadUnverified() {

  uposts = await prisma.post.findMany({
    where: { verified: false },
  });

  return uposts;
}
export async function LoadAll() {

  aposts = await prisma.post.findMany();

  return aposts;
}
export async function LoadResults(search: string) {
  rposts = await prisma.post.findMany({
    where: { title: { contains: search, mode: 'insensitive' } }
  })

  return rposts;
}