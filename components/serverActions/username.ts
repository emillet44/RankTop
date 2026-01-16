'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function UniqueUsername(username: string) {
  // Case-insensitive check for reserved names
  if (username.toLowerCase() === "guest") {
    return true;
  }

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
    await prisma.$transaction(async (tx) => {
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

      // 2. Update the User (Removed the 'username: null' check so it works for 
      // users changing their auto-generated handles)
      await tx.user.update({
        where: { id: userid },
        data: { username: normalizedUsername },
      });

      // 3. Update associated content
      // We check for username: null OR just update all by authorId 
      // to ensure consistency across the site.
      await tx.posts.updateMany({
        where: { authorId: userid },
        data: { username: normalizedUsername },
      });

      await tx.comments.updateMany({
        where: { userId: userid },
        data: { username: normalizedUsername },
      });
    });

    revalidatePath(`/user/${normalizedUsername}`);
    revalidatePath('/');
    return true;
  } catch (error) {
    console.error("Transaction Error:", error);
    return false;
  }
}