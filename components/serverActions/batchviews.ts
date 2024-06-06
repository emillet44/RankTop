'use server'

import { prisma } from "@/lib/prisma";
import { runReport } from "./pageview";

//This function batch updates the post views using the report data from Google Analytics, as well as a Prisma transaction(for atomic write). Should be on a 1 hour timer eventually,
//with this code: 
// export function startPostViewUpdater() {
//   // Call the function initially
//   updatePostViews();

//   // Set up the interval to run the function periodically
//   setInterval(updatePostViews, 60 * 60 * 1000); // Run once per hour
// }

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