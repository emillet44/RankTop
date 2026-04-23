'use server'

import { prisma } from "@/lib/prisma"
import { syncPostToAlgolia } from "@/lib/AlgoliaSync"

//This server action uploads the list to the database, and it also loads the sign in state to determine whether to add an author to the post or not.

export async function newList(formData: FormData) {
  // 1. Extract data into a usable object
  const data = Object.fromEntries(formData);

  // 2. Determine if it's an image post
  // Check the postType appended in the subHandler
  const isImagePost = data.postType === 'image';
  const isPrivate = data.visibility === "Private";

  // 3. Construct the items array
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

  // 4. Construct the Prisma data object
  const createData: any = {
    title: data.title as string,
    items: items,
    itemCount: items.length,
    reRankType: data.postType === 'video' ? "NONE" : (data.reRankType as any || "NONE"),
    description: data.description !== "" ? (data.description as string) : null,
    category: data.category === "None" ? "" : (data.category as string),
    private: data.visibility === "Private",
    metadata: {
      create: {
        images: isImagePost
      }
    }
  };

  // 5. Handle Authenticated User Fields
  if (data.userid && data.userid !== "") {
    createData.author = { connect: { id: data.userid as string } };
    createData.username = (data.username as string) || null;

    // Handle Group Visibility
    if (data.visibility !== "Public" && data.visibility !== "Private") {
      createData.group = { connect: { id: data.visibility as string } };
    }
  }

  // 5. Execute the Database Creation
  try {
    const List = await prisma.posts.create({
      data: createData,
      include: { metadata: true }
    });

    // 6. Sync to Algolia ONLY if the post is not private
    if (!isPrivate) {
      const postUsername = (data.username as string) || null;
      await syncPostToAlgolia(List, postUsername, List.metadata);
    }

    // Return the ID so the SubmissionOverlay can use it for file naming
    return List.id;
  } catch (error) {
    console.error("Prisma Creation Error:", error);
    throw new Error("Failed to create post in database");
  }
}