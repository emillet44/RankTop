'use server'

import { prisma } from "@/lib/prisma"

//This server action uploads the list to the database, and it also loads the sign in state to determine whether to add an author to the post or not.

export async function newList(formData: FormData) {
  // 1. Extract data into a usable object
  const data = Object.fromEntries(formData);

  // 2. Determine if it's an image post
  // Check the postType appended in the subHandler
  const isImagePost = data.postType === 'image';

  // 3. Construct the Prisma data object
  const createData: any = {
    title: data.title as string,
    rank1: data.r1 as string,
    rank2: data.r2 as string,
    rank3: data.r3 as string,
    rank4: data.r4 as string,
    rank5: data.r5 as string,
    description: data.description !== "" ? (data.description as string) : null,
    category: data.category === "None" ? "" : (data.category as string),
    private: data.visibility === "Private",
    metadata: {
      create: {
        images: isImagePost
      }
    }
  };

  // 4. Handle Authenticated User Fields
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
      data: createData
    });

    // Return the ID so the SubmissionOverlay can use it for file naming
    return List.id;
  } catch (error) {
    console.error("Prisma Creation Error:", error);
    throw new Error("Failed to create post in database");
  }
}