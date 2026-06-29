import { Router } from 'express';
import crypto from 'crypto';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, BUCKET } from '../utils/s3.js';

const router = Router();

// GET /api/upload/presigned-url
// Returns a 60s presigned PUT url and the imageKey to persist with the Container.
router.get('/presigned-url', async (req, res) => {
  try {
    const imageKey = `containers/${crypto.randomUUID()}-${Date.now()}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: imageKey,
      ContentType: req.query.contentType || 'image/jpeg',
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.status(200).json({ uploadUrl, imageKey });
  } catch (err) {
    console.error('Presigned URL error:', err);
    return res.status(500).json({ message: 'Could not generate upload URL' });
  }
});

// GET /api/upload/view-url?key=...
// Returns a short-lived presigned GET url for displaying a stored image.
router.get('/view-url', async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ message: 'key is required' });

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const viewUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return res.status(200).json({ viewUrl });
  } catch (err) {
    console.error('View URL error:', err);
    return res.status(500).json({ message: 'Could not generate view URL' });
  }
});

export default router;
