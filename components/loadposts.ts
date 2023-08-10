'use server'

import { prisma } from "@/lib/prisma";

let vposts: any;
let uposts: any;
let aposts: any;
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