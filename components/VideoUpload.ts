export async function uploadVideosToCache(videoFiles: File[]): Promise<{
  sessionId: string;
  filePaths: string[];
}> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 1. Call the internal api route for auth
  const uploadUrlResponse = await fetch('/api/video/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'getUploadUrls',
      videoCount: videoFiles.length,
      sessionId: sessionId,
      fileTypes: videoFiles.map(file => file.type)
    })
  });

  if (!uploadUrlResponse.ok) {
    const errorData = await uploadUrlResponse.json().catch(() => ({}));
    throw new Error(`Failed to get upload URLs: ${errorData.error || uploadUrlResponse.status}`);
  }

  const { uploadUrls, filePaths } = await uploadUrlResponse.json();

  // 2. Upload fragments directly to Google Cloud Storage
  await Promise.all(
    videoFiles.map(async (file, index) => {
      const uploadInfo = uploadUrls.find((u: any) => u.index === index);
      if (!uploadInfo) {
        throw new Error(`No upload URL found for video ${index}`);
      }

      const response = await fetch(uploadInfo.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!response.ok) {
        throw new Error(`GCS Upload failed for file ${index}: ${response.status}`);
      }
    })
  );

  return { sessionId, filePaths };
}