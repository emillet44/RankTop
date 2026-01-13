'use server'

import { prisma } from "@/lib/prisma"
import { upload } from "./imgupload";
import { GoogleAuth } from 'google-auth-library';

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

  if (formDataObj.userid != "") {
    const List = await prisma.posts.create({
      data: {
        title: formDataObj.title,
        rank1: formDataObj.r1,
        rank2: formDataObj.r2,
        rank3: formDataObj.r3,
        rank4: formDataObj.r4,
        rank5: formDataObj.r5,
        description: formDataObj.description !== "" ? formDataObj.description : null,
        category: formDataObj.category === "None" ? "" : formDataObj.category,
        username: formDataObj.username || null,
        author: { connect: { id: formDataObj.userid } },
        group: (formDataObj.visibility !== "Public" && formDataObj.visibility !== "Private") ? { connect: { id: formDataObj.visibility } } : undefined,
        private: formDataObj.visibility === "Private",
        metadata: {
          create: {
            images: images["img1"] != null || images["img2"] != null || images["img3"] != null || images["img4"] != null || images["img5"] != null
          }
        }
      }
    })

    if (images["img1"] != null) {
      upload(images["img1"], List.id + "1.png");
    }
    if (images["img2"] != null) {
      upload(images["img2"], List.id + "2.png");
    }
    if (images["img3"] != null) {
      upload(images["img3"], List.id + "3.png");
    }
    if (images["img4"] != null) {
      upload(images["img4"], List.id + "4.png");
    }
    if (images["img5"] != null) {
      upload(images["img5"], List.id + "5.png");
    }

    return (List.id);
  }
  else {
    const List = await prisma.posts.create({
      data: {
        title: formDataObj.title,
        rank1: formDataObj.r1,
        rank2: formDataObj.r2,
        rank3: formDataObj.r3,
        rank4: formDataObj.r4,
        rank5: formDataObj.r5,
        description: formDataObj.description !== "" ? formDataObj.description : null,
        category: formDataObj.category === "None" ? "" : formDataObj.category,
        private: formDataObj.visibility === "Private",
        metadata: {
          create: {}
        }
      }
    })
    return (List.id);
  }
}