'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from "@/lib/prisma"

//This server action will update a post given its unique id and new post data. Due to the nature of the formData object however, optional values that
//will potentially be left empty by the user upon submitting must be set to null, hence the 4 ternary operators for each of the 4 optional data fields. 
//Setting undefined fields to null allows Prisma to overwrite existing data with null(this covers the case where a user edits a post to have less ranks 
//than it did originally).
export async function editList(formData: FormData, id: string) {

  const data = JSON.stringify(Object.fromEntries(formData));
  const formDataObj = JSON.parse(data);

  formDataObj.r3 = formDataObj.r3 == undefined ? null : formDataObj.r3;
  formDataObj.r4 = formDataObj.r4 == undefined ? null : formDataObj.r4;
  formDataObj.r5 = formDataObj.r5 == undefined ? null : formDataObj.r5;
  formDataObj.description = formDataObj.description == undefined ? null : formDataObj.description;

  const updateList = await prisma.post.update({
    where: {
      id: id
    },
    data: {
      title: formDataObj.title,
      rank1: formDataObj.r1,
      rank2: formDataObj.r2,
      rank3: formDataObj.r3,
      rank4: formDataObj.r4,
      rank5: formDataObj.r5,
      description: formDataObj.description,
    }
  })
  revalidatePath(`/post/${id}`);
  return (id);
}