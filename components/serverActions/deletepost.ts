'use server'

import { prisma } from "@/lib/prisma";
import { Storage } from '@google-cloud/storage';

// Initialize Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function DeletePost(idparam: string) {
  try {
    // 1. Fetch post metadata to know what to delete
    const post = await prisma.posts.findUnique({
      where: { id: idparam },
      select: { 
        metadata: true
      }
    });

    if (!post) throw new Error("Post not found");

    const deletePromises: Promise<any>[] = [];

    // 2. Handle Video Deletion
    // Deletes the video and the thumbnail from their respective buckets
    if (post.metadata?.videos) {
      deletePromises.push(
        storage.bucket('ranktop-v').file(`${idparam}.mp4`).delete().catch(e => console.log(`Video file not found, skipping...`)),
        storage.bucket('ranktop-v-thumb').file(`${idparam}.jpg`).delete().catch(e => console.log(`Thumbnail not found, skipping...`))
      );
    }

    // 3. Handle Image Deletion
    // Loops through the 5 possible rank images (id1.png, id2.png, etc.)
    if (post.metadata?.images) {
      for (let i = 1; i <= 5; i++) {
        deletePromises.push(
          storage.bucket('ranktop-i').file(`${idparam}${i}.png`).delete().catch(e => {
            // We catch but don't stop, because a post might only have 3 images out of 5
          })
        );
      }
    }

    // 4. Wait for all GCS deletions to finish
    await Promise.all(deletePromises);

    // 5. Finally, delete the database entry
    await prisma.posts.delete({
      where: { id: idparam }
    });

    return { success: true };

  } catch (error) {
    console.error("Failed to delete post and assets:", error);
    throw new Error("Could not complete deletion.");
  }
}