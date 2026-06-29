import { Router } from 'express';
import mongoose from 'mongoose';
import Location from '../models/Location.js';
import Container from '../models/Container.js';
import Item from '../models/Item.js';

const router = Router();

// GET /api/locations
router.get('/', async (req, res) => {
  const locations = await Location.find().sort({ name: 1 }).lean();
  return res.json(locations);
});

// GET /api/locations/:id
router.get('/:id', async (req, res) => {
  const location = await Location.findById(req.params.id).lean();
  if (!location) return res.status(404).json({ message: 'Location not found' });
  return res.json(location);
});

// POST /api/locations
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const location = await Location.create({ name });
  return res.status(201).json(location);
});

// PUT /api/locations/:id
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  const location = await Location.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  );
  if (!location) return res.status(404).json({ message: 'Location not found' });
  return res.json(location);
});

// DELETE /api/locations/:id  (cascades to its containers and their items)
router.delete('/:id', async (req, res) => {
  const locationId = new mongoose.Types.ObjectId(req.params.id);
  const containers = await Container.find({ locationId }).select('_id').lean();
  const containerIds = containers.map((c) => c._id);

  await Item.deleteMany({ containerId: { $in: containerIds } });
  await Container.deleteMany({ locationId });
  await Location.deleteOne({ _id: locationId });

  return res.json({ message: 'Location and nested data deleted' });
});

export default router;
