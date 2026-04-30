'use server'

import { storage } from '@/lib/gcs';

/**
 * Server action to upload image blobs to GCS.
 * NOTE: This is subject to a 1MB server action limit. 
 * For larger files, use signed URLs and direct client-side uploads.
 */
export async function upload(blob: Blob, imgname: string) {
  const bucketName = 'ranktop-i';
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await storage.bucket(bucketName).file(imgname).save(buffer);
}
