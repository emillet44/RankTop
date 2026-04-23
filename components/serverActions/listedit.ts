'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from "@/lib/prisma"
import { syncPostToAlgolia } from "@/lib/AlgoliaSync"
import { metadata } from '@/app/layout';

//This server action will update a post given its unique id and new post data. Due to the nature of the formData object however, optional values that
//will potentially be left empty by the user upon submitting must be set to null, hence the 4 ternary operators for each of the 4 optional data fields. 
//Setting undefined fields to null allows Prisma to overwrite existing data with null(this covers the case where a user edits a post to have less ranks 
//than it did originally).
export async function editList(formData: FormData, id: string) {

  const data = Object.fromEntries(formData);
  
  const items = [];
  for (let i = 1; i <= 10; i++) {
    const name = data[`r${i}`] as string;
    const note = data[`r${i}_note`] as string;
    if (name) {
      items.push({
        text: name,
        note: note || null
      });
    }
  }

  const updateList = await prisma.posts.update({
    where: {
      id: id
    },
    data: {
      title: data.title as string,
      items: items,
      itemCount: items.length,
      description: data.description !== "" ? (data.description as string) : null,
      category: data.category as string,
      metadata: {
        update: {
          date: new Date()
        }
      }
    },
    include: {
      metadata: true
    }
  })

  if (!updateList.private) {
    await syncPostToAlgolia(updateList, updateList.username, updateList.metadata);
  }

  revalidatePath(`/post/${id}`);
  return (id);
}