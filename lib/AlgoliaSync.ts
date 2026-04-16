import algoliasearch from 'algoliasearch';

/**
 * lib/algolia.ts
 * * This utility provides centralized functions to sync your Prisma models
 * (Posts, Groups, and Users) with Algolia indices.
 */

// Initialize the client
const APP_ID = 'PL301U4XAW'; 
const client = algoliasearch(APP_ID, process.env.ALGOLIA_API_KEY || '');

/**
 * Syncs a list to Algolia with full searchable content and metadata.
 */
export async function syncPostToAlgolia(post: any, username: string | null, metadata?: any) {
  try {
    const postsIndex = client.initIndex('Posts');

    const algoliaObject = {
      objectID: post.id,
      title: post.title,
      description: post.description || "",
      category: post.category,
      username: username || "Guest",
      date: metadata?.date ? new Date(metadata.date).getTime() : Date.now(),
      
      // Searchable Content: The ranks themselves
      ranks: Array.isArray(post.items) 
        ? post.items.map((item: any) => item.text).filter((text: any) => text && text.trim() !== "")
        : [],

      // Faceting/Filtering
      private: post.private ?? false,
      groupId: post.groupId || null,
      hasImages: metadata?.images ?? false,
      hasVideos: metadata?.videos ?? false,

      // Custom Ranking (Popularity)
      likes: metadata?.likes ?? 0,
      views: metadata?.views ?? 0,
    };

    await postsIndex.saveObject(algoliaObject);
    return { success: true };
  } catch (error) {
    console.error("Algolia Posts Sync Error:", error);
    return { success: false, error };
  }
}

/**
 * Syncs a group to the 'Groups' index.
 */
export async function syncGroupToAlgolia(group: any) {
  try {
    const groupsIndex = client.initIndex('Groups');

    const algoliaObject = {
      objectID: group.id,
      name: group.name,
      private: group.private ?? false,
      hasBanner: group.bannerimg ?? false,
      hasProfile: group.profileimg ?? false,
      population: group.population ?? 0,
      date: group.date ? new Date(group.date).getTime() : Date.now(),
    };

    await groupsIndex.saveObject(algoliaObject);
    return { success: true };
  } catch (error) {
    console.error("Algolia Groups Sync Error:", error);
    return { success: false, error };
  }
}

/**
 * Syncs a user to the 'Users' index.
 */
export async function syncUserToAlgolia(user: any) {
  try {
    const usersIndex = client.initIndex('Users');

    const algoliaObject = {
      objectID: user.id,
      username: user.username,
      followerCount: user.followerCount ?? 0,
      joindate: user.joindate ? new Date(user.joindate).getTime() : Date.now(),
    };

    await usersIndex.saveObject(algoliaObject);
    return { success: true };
  } catch (error) {
    console.error("Algolia Users Sync Error:", error);
    return { success: false, error };
  }
}