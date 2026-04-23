'use server'

import { prisma } from "@/lib/prisma";

/**
 * Idempotent post like toggle
 * Sets the like status to an explicit state to handle high-frequency clicks
 */
export async function setPostLikeStatus(postid: string, userid: string, shouldLike: boolean) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existingLike = await tx.likes.findUnique({
        where: {
          userId_postId: {
            userId: userid,
            postId: postid,
          },
        },
      });

      if (!shouldLike && existingLike) {
        // Remove like
        await tx.likes.delete({
          where: {
            userId_postId: {
              userId: userid,
              postId: postid,
            },
          },
        });

        await tx.posts.update({
          where: { id: postid },
          data: {
            metadata: {
              update: {
                likes: { decrement: 1 },
              },
            },
          },
        });
      } else if (shouldLike && !existingLike) {
        // Add like
        await tx.likes.create({
          data: {
            postId: postid,
            userId: userid,
          },
        });

        await tx.posts.update({
          where: { id: postid },
          data: {
            metadata: {
              update: {
                likes: { increment: 1 },
              },
            },
          },
        });
      }
      return { success: true };
    });
  } catch (error) {
    console.error("Failed to set like status:", error);
    throw new Error("Could not update like");
  }
}

// Keep legacy actions for compatibility if needed elsewhere
export async function addLike(postid: string, userid: string) {
  return setPostLikeStatus(postid, userid, true);
}

export async function removeLike(postid: string, userid: string) {
  return setPostLikeStatus(postid, userid, false);
}

export async function setCommentLikeStatus(commentid: string, userid: string, shouldLike: boolean) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existingLike = await tx.comment_Likes.findUnique({
        where: {
          userId_commentId: {
            userId: userid,
            commentId: commentid,
          },
        },
      });

      if (!shouldLike && existingLike) {
        await tx.comment_Likes.delete({
          where: {
            userId_commentId: {
              userId: userid,
              commentId: commentid,
            },
          },
        });
        await tx.comments.update({
          where: { id: commentid },
          data: {
            likes: { decrement: 1 },
          },
        });
      } else if (shouldLike && !existingLike) {
        await tx.comment_Likes.create({
          data: {
            commentId: commentid,
            userId: userid,
          },
        });
        await tx.comments.update({
          where: { id: commentid },
          data: {
            likes: { increment: 1 },
          },
        });
      }
      return { success: true };
    });
  } catch (error) {
    console.error("Failed to set comment like status:", error);
    throw new Error("Could not update comment like");
  }
}

export async function addCommentLike(commentid: string, userid: string) {
  return setCommentLikeStatus(commentid, userid, true);
}

export async function removeCommentLike(commentid: string, userid: string) {
  return setCommentLikeStatus(commentid, userid, false);
}

export async function setReRankingLikeStatus(rerankingid: string, userid: string, shouldLike: boolean) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existingLike = await tx.reRanking_Likes.findUnique({
        where: {
          userId_rerankingId: {
            userId: userid,
            rerankingId: rerankingid,
          },
        },
      });

      if (!shouldLike && existingLike) {
        await tx.reRanking_Likes.delete({
          where: {
            userId_rerankingId: {
              userId: userid,
              rerankingId: rerankingid,
            },
          },
        });
        await tx.reRankings.update({
          where: { id: rerankingid },
          data: {
            likes: { decrement: 1 },
          },
        });
      } else if (shouldLike && !existingLike) {
        await tx.reRanking_Likes.create({
          data: {
            rerankingId: rerankingid,
            userId: userid,
          },
        });
        await tx.reRankings.update({
          where: { id: rerankingid },
          data: {
            likes: { increment: 1 },
          },
        });
      }
      return { success: true };
    });
  } catch (error) {
    console.error("Failed to set reranking like status:", error);
    throw new Error("Could not update reranking like");
  }
}

export async function addReRankingLike(rerankingid: string, userid: string) {
  return setReRankingLikeStatus(rerankingid, userid, true);
}

export async function removeReRankingLike(rerankingid: string, userid: string) {
  return setReRankingLikeStatus(rerankingid, userid, false);
}
