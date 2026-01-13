'use server'

import { Storage } from '@google-cloud/storage'

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

export async function fetchFirstImageMetadata(postid: string) {
  try {
    const [files] = await storage.bucket(bucketName).getFiles({
      prefix: `${postid}1`,
      maxResults: 1
    });
    
    return files.length > 0;
  } catch(error) {
    console.error("Error fetching image metadata:", error)
    throw new Error("Failed to fetch image metadata")
  }
}