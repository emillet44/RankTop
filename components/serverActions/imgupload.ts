'use server'

//This server action will upload image blobs to Google Cloud Storage with the postid + rank as their name.

const { Storage } = require('@google-cloud/storage');

  const { privateKey } = JSON.parse(process.env.GOOGLE_PRIVATE_KEY || '{ privateKey: null }')
  const options = {
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey
    },
    projectId: process.env.GOOGLE_PROJECT_ID
  };

const storage = new Storage(options);

export async function upload(blob: Blob, imgname: String) {
  const bucketName = 'ranktop-i';

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  async function uploadFile() {
    await storage.bucket(bucketName).file(imgname).save(buffer);
  }

  uploadFile().catch(console.error);
}