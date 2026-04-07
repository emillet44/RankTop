'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { syncUserToAlgolia } from "@/lib/AlgoliaSync"

export async function UniqueUsername(username: string) {
  // Case-insensitive check for reserved names
  if (username.toLowerCase() === "guest") return true;

  // Case-insensitive uniqueness check
  const unique = await prisma.user.findFirst({
    where: { 
      username: {
        equals: username,
        mode: 'insensitive'
      }
    },
    select: { id: true }
  });

  return unique !== null;
}

export async function CreateUsername(username: string, userid: string) {
  const normalizedUsername = username.trim();
  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Double-check uniqueness inside the transaction for safety
      const exists = await tx.user.findFirst({
        where: { 
          username: {
            equals: normalizedUsername,
            mode: 'insensitive'
          }
        },
      });

      if (exists && exists.id !== userid) throw new Error("Username taken");

      // 2. Update user record
      const user = await tx.user.update({
        where: { id: userid },
        data: { username: normalizedUsername },
      });

      // 3. Keep username consistent on posts and comments
      await tx.posts.updateMany({
        where: { authorId: userid },
        data: { username: normalizedUsername },
      });

      await tx.comments.updateMany({
        where: { userId: userid },
        data: { username: normalizedUsername },
      });

      return user;
    });

    // 4. Update the Algolia search index
    if (updatedUser) {
      try {
        await syncUserToAlgolia(updatedUser);
      } catch (algoliaError) {
        // We log Algolia errors separately so the DB success still counts
        console.error("Algolia User Sync Error:", algoliaError);
      }
    }

    revalidatePath(`/user/${normalizedUsername}`);
    revalidatePath('/');
    
    return true;
  } catch (error) {
    console.error("Transaction Error:", error);
    return false;
  }
}