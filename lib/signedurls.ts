'use server'

import { storage } from './gcs';

/**
 * Generates a time-limited signed URL for any file in any GCS bucket.
 * @param bucketName - The name of the GCS bucket
 * @param filePath - The full path to the file (e.g., 'postid.mp4' or 'avatars/user.jpg')
 */
export async function getSignedGCSUrl(
  bucketName: string, 
  filePath: string,
  action: 'read' | 'write',
  expiresInMinutes: number = 15
) {
  try {
    const options = {
      version: 'v4' as const,
      action: action,
      expires: Date.now() + expiresInMinutes * 60 * 1000,
      ...(action === 'write' && { contentType: 'image/png' })
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