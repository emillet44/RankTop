'use server'

import { prisma } from "@/lib/prisma";
import { runReport } from "./pageview";

export async function UpdatePostViews() {
  console.log("Updating views")
  const allposts = await prisma.posts.findMany();

  const viewdata: Record<string, number> = {};

  for (const { id } of allposts) {
    const views = await runReport(`/post/${id}`);
    viewdata[id] = views;
  }

  try {
    await prisma.$transaction(
      Object.entries(viewdata).map(([postId, postviews]) =>
        prisma.posts.update({
          where: { id: postId },
          data: {
            metadata: {
              update: {
                views: postviews,
              }
            }
          },
        })
      )
    );
  } finally {
    console.log("Views updated");
    await prisma.$disconnect();
  }
}