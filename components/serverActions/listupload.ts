'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { upload } from "./imgupload";

let authorid: any;

//This server action will fetch any image blobs uploaded by the user based on their urls(already created for generating image previews), and send them to imgupload for uploading.
//Then it uploads the list to the database, and it also loads the sign in state to determine whether to add an author to the post or not.

export async function newList(formData: FormData) {

  const images: Record<string, Blob> = {};

  formData.forEach((value, key) => {
    if (value instanceof Blob) {
      images[key] = value;
    }
  })

  const data = JSON.stringify(Object.fromEntries(formData));
  const formDataObj = JSON.parse(data);

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
        metadata: {
          create: {
            images: images["img1"] != null || images["img2"] != null || images["img3"] != null || images["img4"] != null || images["img5"] != null
          }
        }
      }
    })

    if(images["img1"] != null) {
      upload(images["img1"], List.id + "1.png");
    }
    if(images["img2"] != null) {
      upload(images["img2"], List.id + "2.png");
    }
    if(images["img3"] != null) {
      upload(images["img3"], List.id + "3.png");
    }
    if(images["img4"] != null) {
      upload(images["img4"], List.id + "4.png");
    }
    if(images["img5"] != null) {
      upload(images["img5"], List.id + "5.png");
    }

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