'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

let authorid: any;

//This server action will upload a list to the database, and it also loads the sign in state to determine whether to add an author to the post or not.
export async function newList(formData: FormData) {

  authorid = null;
  const session = await getServerSession(authOptions);

  if(session?.user?.email != null) {
    const authorid1 = await prisma.user.findUnique({
      where : { email: session.user?.email }
    })
    authorid = authorid1?.id;
  }

  const data = JSON.stringify(Object.fromEntries(formData));
  const formDataObj = JSON.parse(data);

  if(authorid !== null) {
    const List = await prisma.post.create({
      data: {
        title: formDataObj.title,
        rank1: formDataObj.r1,
        rank2: formDataObj.r2,
        rank3: formDataObj.r3,
        rank4: formDataObj.r4,
        rank5: formDataObj.r5,
        explain: formDataObj.explain,
        author: { connect: {id: authorid}},
      }
    })
    return (List.id);
  }
  else {
    const List = await prisma.post.create({
      data: {
        title: formDataObj.title,
        rank1: formDataObj.r1,
        rank2: formDataObj.r2,
        rank3: formDataObj.r3,
        rank4: formDataObj.r4,
        rank5: formDataObj.r5,
        explain: formDataObj.explain,
      }
    })
    return (List.id);
  }
}