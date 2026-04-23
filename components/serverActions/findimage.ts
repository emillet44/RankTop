'use server'

import { Storage } from '@google-cloud/storage'
import { prisma } from "@/lib/prisma"

//Server action to check whether images exist in the GCS bucket(images are optional, 1 image for a rank does not gurantee all ranks have images). The images are then sorted using the
//sort method(takes the image number in the url and performs subtractions to determine the order).

const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
})
const bucketName = 'ranktop-i'

export async function fetchImageMetadata(postid: string) {
  try {
    const [files] = await storage.bucket(bucketName).getFiles({
      prefix: `${postid}`
    });
    const imageUrls = files.map(file => `https://storage.googleapis.com/${bucketName}/${file.name}`).sort((a, b) => {
      const aNum = parseInt(a.charAt(a.length - 5));
      const bNum = parseInt(b.charAt(a.length - 5));
      return aNum - bNum;
    });

    return { imageUrls };
  } 
  catch (error) {
    console.error("Error fetching image metadata:", error)
    throw new Error("Failed to fetch image metadata")
  }
}

export async function fetchRerankImageMetadata(rerankId: string) {
  try {
    const rerank = await prisma.reRankings.findUnique({
      where: { id: rerankId },
      select: { postId: true, rankMap: true }
    });

    if (!rerank) return { imageUrls: [] };

    // 1. Get files for this rerank (if any new images were uploaded)
    const [rerankFiles] = await storage.bucket(bucketName).getFiles({
      prefix: `${rerankId}`
    });

    // 2. Get files for original post
    const [postFiles] = await storage.bucket(bucketName).getFiles({
      prefix: `${rerank.postId}`
    });

    const rerankFileMap = new Map(rerankFiles.map(f => [f.name, `https://storage.googleapis.com/${bucketName}/${f.name}`]));
    const postFileMap = new Map(postFiles.map(f => [f.name, `https://storage.googleapis.com/${bucketName}/${f.name}`]));

    const imageUrls: (string | null)[] = [];
    
    // rankMap is [originalIndexAtRank0, originalIndexAtRank1, ...]
    // Items are 1-indexed in GCS (e.g. postid1.png is rank 1)
    for (let i = 0; i < rerank.rankMap.length; i++) {
      const currentRank = i + 1;
      const originalRank = rerank.rankMap[i] + 1;

      // Check if rerank has its own image for this rank
      const rerankImg = rerankFileMap.get(`${rerankId}${currentRank}.png`);
      if (rerankImg) {
        imageUrls.push(rerankImg);
        continue;
      }

      // Default to original post image for this item
      const postImg = postFileMap.get(`${rerank.postId}${originalRank}.png`);
      if (postImg) {
        imageUrls.push(postImg);
      } else {
        imageUrls.push(null);
      }
    }

    return { imageUrls };
  } catch (error) {
    console.error("Error fetching rerank image metadata:", error)
    throw new Error("Failed to fetch rerank image metadata")
  }
}

export async function fetchFirstImageMetadata(id: string, isRerank: boolean = false) {
  try {
    if (isRerank) {
      const { imageUrls } = await fetchRerankImageMetadata(id);
      return imageUrls.some(url => url !== null);
    }

    const [files] = await storage.bucket(bucketName).getFiles({
      prefix: `${id}1`,
      maxResults: 1
    });
    
    return files.length > 0;
  } catch(error) {
    console.error("Error fetching image metadata:", error)
    throw new Error("Failed to fetch image metadata")
  }
}