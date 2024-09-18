'use server'

import { prisma } from "@/lib/prisma"
import { upload } from "./imgupload";

//This server action will fetch any image blobs uploaded by the user based on their urls(already created for generating image previews), and send them to imgupload for uploading.
//Then it uploads the list to the database, and it also loads the sign in state to determine whether to add an author to the post or not.

export async function newGroup(formData: FormData) {

  const images: Record<string, Blob> = {};

  formData.forEach((value, key) => {
    if (value instanceof Blob) {
      images[key] = value;
    }
  })

  const data = JSON.stringify(Object.fromEntries(formData));
  const formDataObj = JSON.parse(data);

  const Group = await prisma.groups.create({
    data: {
      name: formDataObj.groupname,
      password: formDataObj.password,
      invite: false,
      private: formDataObj.visibility === "private",
      bannerimg: images["bannerimage"] != null,
      profileimg: images["profileimage"] != null,
    }
  });
  const updatedGroup = await prisma.groups.update({
    where: { id: Group.id },
    data: {
      admins: {
        connect: { id: formDataObj.userid }
      },
    },
  });

  if(images["bannerimage"] != null) {
    upload(images["bannerimage"], Group.id + "banner.png");
  }
  if(images["profileimage"] != null) {
    upload(images["profileimage"], Group.id + "profile.png");
  }

  return (Group.id);
}