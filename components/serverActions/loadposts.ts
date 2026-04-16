'use server'

import { prisma } from "@/lib/prisma";
import { getSignedGCSUrl } from "@/lib/signedurls";

//This server action loads different types of posts from the database, either 20(its still 4 for testing), or the first 50 results of a search. Soon there will be functions to load
//categories, subcategories, by likes, or by views.
//Soon means now. LoadBatchCat will load posts by their category, and if the category is custom(c added to the start of the category name), the search parameters are relaxed to try
//to increase discovery for users. Category "None" from the UI corresponds to a blank category in the db(to save space). LoadBatch loads posts by a metric(currently likes and views),
//and a time range, which is calculated with a switch corresponding to the options from the select box. 
//LoadResults loads 10 search results of type post, user, or group depending on the type specified during the search

async function addVideoUrls(posts: any[]) {
  return await Promise.all(
    posts.map(async (post) => {
      if (post.metadata?.videos) {
        post.metadata.videoUrl = await getSignedGCSUrl('ranktop-v', `${post.id}.mp4`, 'read');
      }
      return post;
    })
  );
}

export async function LoadSinglePost(postId: string) {
  const post = await prisma.posts.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      items: true,
      reRankType: true,
      authorId: true,
      username: true,
      description: true,
      category: true,
      groupId: true,
      private: true,
      metadata: true,
    },
  });
  
  if (post) {
    const [postWithUrl] = await addVideoUrls([post]);
    return postWithUrl;
  }
  return null;
}

export async function LoadAll() {
  const aposts = await prisma.posts.findMany({
    select: {
      id: true,
      title: true,
      items: true,
      reRankType: true,
      authorId: true,
      username: true,
      description: true,
      category: true,
      groupId: true,
      private: true,
      metadata: true,
    },
  });
  return await addVideoUrls(aposts);
}

export async function LoadBatch(batch: number, sort: string, category: string, date: string) {
  const now = new Date();
  let startdate;
  switch (date) {
    case "Today":
      startdate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "This Week":
      startdate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "This Month":
      startdate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "This Year":
      startdate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startdate = new Date(0);
  }

  // Build the WHERE clause
  const where: any = {
    metadata: {
      date: {
        gte: startdate,
      },
    },
  };

  // Category filtering
  if (category !== "All") {
    if (category === "None") {
      where.category = "";
    } else if (category.startsWith("c")) {
      where.category = {
        contains: category.substring(1),
        mode: 'insensitive',
      };
    } else {
      where.category = category;
    }
  }

  // Sorting logic
  let orderBy: any = [];
  switch (sort) {
    case "Most Viewed":
      orderBy = [{ metadata: { views: 'desc' } }];
      break;
    case "Most Liked":
      orderBy = [{ metadata: { likes: 'desc' } }];
      break;
    case "Newest":
    default:
      orderBy = [{ metadata: { date: 'desc' } }];
      break;
  }

  const bposts = await prisma.posts.findMany({
    skip: 4 * batch,
    take: 4,
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      items: true,
      reRankType: true,
      authorId: true,
      username: true,
      description: true,
      category: true,
      groupId: true,
      private: true,
      metadata: true,
    },
  });

  return await addVideoUrls(bposts);
}

// Keep LoadBatchCat for backward compatibility or simple use cases if needed, 
// but point it to the new LoadBatch or deprecate it. 
// For now, let's keep it but it's redundant.
export async function LoadBatchCat(batch: number, category: string) {
  return await LoadBatch(batch, "Newest", category, "All Time");
}

export async function LoadPostResults(search: string) {
  const posts = await prisma.posts.findMany({
    take: 10,
    where: {
      title: { contains: search, mode: 'insensitive' }
    },
    select: {
      id: true,
      title: true,
      items: true,
      reRankType: true,
      authorId: true,
      username: true,
      description: true,
      category: true,
      groupId: true,
      private: true,
      metadata: true,
    },
  });
  return await addVideoUrls(posts);
}

export async function LoadUserResults(search: string) {
  const users = await prisma.user.findMany({
    take: 10,
    where: {
      username: { contains: search, mode: 'insensitive' }
    }
  });
  return users;
}

export async function LoadGroupResults(search: string) {
  const groups = await prisma.groups.findMany({
    take: 10,
    where: {
      name: { contains: search, mode: 'insensitive' },
      private: false,
    }
  });
  return groups;
}

export async function LoadUserPosts(batch: number, userid: string) {
  const uposts = await prisma.posts.findMany({
    skip: 9 * batch,
    take: 9,
    where: {
      authorId: userid,
    },
    select: {
      id: true,
      title: true,
      items: true,
      reRankType: true,
      authorId: true,
      username: true,
      description: true,
      category: true,
      groupId: true,
      private: true,
      metadata: true,
    },
  });

  return await addVideoUrls(uposts);
}