import { Router } from 'express';
import mongoose from 'mongoose';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import Container from '../models/Container.js';
import Item from '../models/Item.js';
import { s3, BUCKET } from '../utils/s3.js';

const router = Router();

// GET /api/containers?locationId=...
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.locationId) filter.locationId = req.query.locationId;
  const containers = await Container.find(filter).sort({ name: 1 }).lean();
  return res.json(containers);
});

// GET /api/containers/:id
router.get('/:id', async (req, res) => {
  const container = await Container.findById(req.params.id).lean();
  if (!container) return res.status(404).json({ message: 'Container not found' });
  return res.json(container);
});

// POST /api/containers
router.post('/', async (req, res) => {
  const { locationId, name, description, imageKey } = req.body;
  if (!locationId || !name) {
    return res.status(400).json({ message: 'locationId and name are required' });
  }
  const container = await Container.create({ locationId, name, description, imageKey });
  return res.status(201).json(container);
});

// PUT /api/containers/:id
router.put('/:id', async (req, res) => {
  const { name, description, imageKey, locationId } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (imageKey !== undefined) update.imageKey = imageKey;
  if (locationId !== undefined) update.locationId = locationId;

  const container = await Container.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!container) return res.status(404).json({ message: 'Container not found' });
  return res.json(container);
});

// DELETE /api/containers/:id  (cascades to its items + removes S3 image)
router.delete('/:id', async (req, res) => {
  const container = await Container.findById(req.params.id);
  if (!container) return res.status(404).json({ message: 'Container not found' });

  if (container.imageKey) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: container.imageKey }));
    } catch (err) {
      console.error('S3 delete error:', err);
    }
  }

  await Item.deleteMany({ containerId: container._id });
  await container.deleteOne();

  return res.json({ message: 'Container and its items deleted' });
});

export default router;
