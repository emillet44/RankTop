'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache";

export async function submitComment(userid: string, postid: string, username: string | null | undefined, text: string, parentId?: string) {
  try {
    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comments.create({
        data: {
          userId: userid,
          postId: postid,
          text: text,
          username: username || null,
          parentId: parentId || null,
        }
      });

      if (parentId) {
        await tx.comments.update({
          where: { id: parentId },
          data: { replies: { increment: 1 } },
        });
      }

      return newComment;
    });

    revalidatePath(`/post/${postid}`);
    
    return {
      ...comment,
      userliked: false,
    };
  } catch (error) {
    console.error("Failed to submit comment:", error);
    throw new Error("Could not submit comment");
  }
}

export async function deleteComment(commentId: string, userid: string, postid: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated likes
      await tx.comment_Likes.deleteMany({
        where: { commentId }
      });

      // 2. If it's a reply, decrement the parent's reply count
      const comment = await tx.comments.findUnique({
        where: { id: commentId },
        select: { parentId: true }
      });

      if (comment?.parentId) {
        await tx.comments.update({
          where: { id: comment.parentId },
          data: { replies: { decrement: 1 } }
        });
      }

      // 3. Delete the comment itself
      // Note: If this has children, you might want to handle that. 
      // For now, simple delete (cascades or manual depending on schema).
      await tx.comments.delete({
        where: { id: commentId }
      });
    });

    revalidatePath(`/post/${postid}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw new Error("Could not delete comment");
  }
}

// Legacy compatibility
export async function newComment(userid: string, postid: string, username: string | null | undefined, text: string) {
  return submitComment(userid, postid, username, text);
}

export async function newReply(userid: string, postid: string, commentid: string, username: string | null | undefined, text: string) {
  return submitComment(userid, postid, username, text, commentid);
}
