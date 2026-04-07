'use server'

import { prisma } from "@/lib/prisma"
import { upload } from "./imgupload";
import { syncGroupToAlgolia } from "@/lib/AlgoliaSync";

/**
 * Server action to handle the creation of a new group.
 * It creates the group in the database, connects the admin, 
 * handles image uploads, and syncs to Algolia if the group is public.
 */
export async function newGroup(formData: FormData) {
  const images: Record<string, Blob> = {};

  formData.forEach((value, key) => {
    if (value instanceof Blob) {
      images[key] = value;
    }
  })

  // Extract form data
  const data = Object.fromEntries(formData);
  const isPrivate = data.visibility === "private";

  // 1. Create the Group in Prisma
  const Group = await prisma.groups.create({
    data: {
      name: data.groupname as string,
      password: data.password as string,
      invite: false,
      private: isPrivate,
      bannerimg: images["bannerimage"] != null,
      profileimg: images["profileimage"] != null,
    }
  });

  // 2. Connect the creator as an admin
  const updatedGroup = await prisma.groups.update({
    where: { id: Group.id },
    data: {
      admins: {
        connect: { id: data.userid as string }
      },
    },
  });

  // 3. Sync to Algolia ONLY if the group is not private
  if (!isPrivate) {
    try {
      await syncGroupToAlgolia(Group);
    } catch (error) {
      console.error("Failed to sync group to Algolia:", error);
    }
  }

  // 4. Handle image uploads if present
  if(images["bannerimage"] != null) {
    upload(images["bannerimage"], Group.id + "banner.png");
  }
  if(images["profileimage"] != null) {
    upload(images["profileimage"], Group.id + "profile.png");
  }

  return Group.id;
}