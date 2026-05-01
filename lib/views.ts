import { prisma } from "./prisma";

/**
 * Increments the view count for a specific post.
 * In the future, this can be moved to a Redis cache (e.g., await redis.incr(`views:${postId}`))
 * for better performance and to handle high traffic.
 */
export async function trackView(postId: string) {
  try {
    await prisma.post_Metadata.update({
      where: { postId },
      data: { 
        views: { 
          increment: 1 
        } 
      }
    });
  } catch (error) {
    console.error(`Failed to track view for post ${postId}:`, error);
  }
}
