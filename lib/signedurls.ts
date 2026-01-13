import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

/**
 * Generates a time-limited signed URL for any file in any GCS bucket.
 * @param bucketName - The name of the GCS bucket
 * @param filePath - The full path to the file (e.g., 'postid.mp4' or 'avatars/user.jpg')
 */
export async function getSignedGCSUrl(
  bucketName: string, 
  filePath: string, 
  expiresInMinutes: number = 15
) {
  try {
    const options = {
      version: 'v4' as const,
      action: 'read' as const,
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    };

    const [url] = await storage
      .bucket(bucketName)
      .file(filePath)
      .getSignedUrl(options);
    
    return url;
  } catch (error) {
    console.error(`Error signing URL for ${filePath} in ${bucketName}:`, error);
    return null;
  }
}