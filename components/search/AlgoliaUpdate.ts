import { prisma } from "@/lib/prisma";

//Can't lie, this one is all Claude 3.7. Generally what it's doing is checking the date of the newest post from Algolia, then fetching all posts from the database that are newer
//than that date, formatting them, then sending them. There's a some error handling for a failed prisma query which is probably not necessary but its a loop call script so it might be
//useful. Then there is something that allows it to run from console, not really sure how but it does I guess. Leaving the inline comments until I work on this myself.

export async function AlgoliaUpdate() {
  const algoliasearch = require('algoliasearch');
  const client = algoliasearch('PL301U4XAW', process.env.ALGOLIA_API_KEY);

  try {
    // Get the last update time from DB
    const metadata = await prisma.algoliaMetadata.findUnique({
      where: { id: "last-update" }
    });

    if (!metadata) {
      console.error("Metadata not found, retrying in 60 seconds...");
      setTimeout(AlgoliaUpdate, 60000); 
      AlgoliaUpdate();
      return;
    }

    // Update Posts
    const postsIndex = client.initIndex('Posts');
    const posts = await prisma.posts.findMany({
      where: { metadata: { date: { gt: metadata.lastPost } } },
      include: { metadata: true, author: { select: { username: true } } },
      orderBy: { metadata: { date: 'asc' } }
    });

    if (posts.length > 0) {
      const formattedPosts = posts.map(post => ({
        objectID: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        username: post.author?.username || post.username,
        date: post.metadata?.date?.toISOString() || null,
      }));
      
      await postsIndex.saveObjects(formattedPosts);
      await prisma.algoliaMetadata.update({
        where: { id: "last-update" },
        data: { lastPost: posts[posts.length - 1].metadata?.date }
      });
    }

    // Update Groups
    const groupsIndex = client.initIndex('Groups');
    const groups = await prisma.groups.findMany({
      where: { date: { gt: metadata.lastGroup } },
      orderBy: { date: 'asc' }
    });

    if (groups.length > 0) {
      const formattedGroups = groups.map(group => ({
        objectID: group.id,
        name: group.name,
        private: group.private,
      }));
      
      await groupsIndex.saveObjects(formattedGroups);
      await prisma.algoliaMetadata.update({
        where: { id: "last-update" },
        data: { lastGroup: groups[groups.length - 1].date }
      });
    }

    // Update Users
    const usersIndex = client.initIndex('Users');
    const users = await prisma.user.findMany({
      where: { joindate: { gt: metadata.lastUser }, username: { not: null } },
      orderBy: { joindate: 'asc' }
    });

    if (users.length > 0) {
      const formattedUsers = users.map(user => ({
        objectID: user.id,
        username: user.username,
      }));
      
      await usersIndex.saveObjects(formattedUsers);
      await prisma.algoliaMetadata.update({
        where: { id: "last-update" },
        data: { lastUser: users[users.length - 1].joindate }
      });
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}