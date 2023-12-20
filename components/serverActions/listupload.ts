'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { upload } from "./imgupload";

let authorid: any;

//This server action will fetch any image blobs uploaded by the user based on their urls(already created for generating image previews), and send them to imgupload for uploading.
//Then it uploads the list to the database, and it also loads the sign in state to determine whether to add an author to the post or not.

//More work needs to be done to give the blobs a proper name so they can be identified when it comes time to display the images.
export async function newList(formData: FormData) {

  const data = JSON.stringify(Object.fromEntries(formData));
  const formDataObj = JSON.parse(data);

  if(formDataObj.img1 != "") {
    let blob1 = await fetch(formDataObj.img1.substring(5)).then(res => res.blob());
    upload(blob1, formDataObj.img1);
  }
  if(formDataObj.img2 != "") {
    let blob2 = await fetch(formDataObj.img2.substring(5)).then(res => res.blob());
  }
  if(formDataObj.img3 != "") {
    let blob3 = await fetch(formDataObj.img3.substring(5)).then(res => res.blob());
  }
  if(formDataObj.img4 != "") {
    let blob4 = await fetch(formDataObj.img4.substring(5)).then(res => res.blob());
  }
  if(formDataObj.img5 != "") {
    let blob5 = await fetch(formDataObj.img5.substring(5)).then(res => res.blob());
  }

  

  authorid = null;
  const session = await getServerSession(authOptions);

  if(session?.user?.email != null) {
    const authorid1 = await prisma.user.findUnique({
      where : { email: session.user?.email }
    })
    authorid = authorid1?.id;
  }

  if(authorid !== null) {
    const List = await prisma.post.create({
      data: {
        title: formDataObj.title,
        rank1: formDataObj.r1,
        rank2: formDataObj.r2,
        rank3: formDataObj.r3,
        rank4: formDataObj.r4,
        rank5: formDataObj.r5,
        description: formDataObj.description,
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
        description: formDataObj.description,
      }
    })
    return (List.id);
  }
}