'use server'

import { prisma } from "@/lib/prisma";

//Simple server action to delete a post based on its id.
export async function DeletePost(idparam: string) {
    const deletePost = await prisma.post.delete({
        where: {
            id: idparam
        }
    });
}