import imageCompression from 'browser-image-compression';
import { getPresignedUrl } from './api.js';

// Compresses an image, requests a presigned URL, PUTs the file to S3,
// and returns the imageKey to persist with the Container.
export async function uploadImage(file) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  });

  const { uploadUrl, imageKey } = await getPresignedUrl(compressed.type || 'image/jpeg');

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: compressed,
    headers: { 'Content-Type': compressed.type || 'image/jpeg' },
  });

  if (!res.ok) throw new Error('Image upload failed');

  return imageKey;
}
