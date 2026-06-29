import { Router } from 'express';
import Item from '../models/Item.js';

const router = Router();

// GET /api/items?containerId=...&needsRestock=true
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.containerId) filter.containerId = req.query.containerId;
  if (req.query.needsRestock !== undefined) {
    filter.needsRestock = req.query.needsRestock === 'true';
  }

  // Shopping-list view: include the computed Location > Container path.
  if (req.query.needsRestock === 'true') {
    const items = await Item.aggregate([
      { $match: { needsRestock: true } },
      {
        $lookup: {
          from: 'containers',
          localField: 'containerId',
          foreignField: '_id',
          as: 'container',
        },
      },
      { $unwind: '$container' },
      {
        $lookup: {
          from: 'locations',
          localField: 'container.locationId',
          foreignField: '_id',
          as: 'location',
        },
      },
      { $unwind: '$location' },
      {
        $project: {
          _id: 1,
          name: 1,
          quantity: 1,
          needsRestock: 1,
          containerId: 1,
          path: { $concat: ['$location.name', ' > ', '$container.name'] },
        },
      },
    ]);
    return res.json(items);
  }

  const items = await Item.find(filter).sort({ name: 1 }).lean();
  return res.json(items);
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ message: 'Item not found' });
  return res.json(item);
});

// POST /api/items
router.post('/', async (req, res) => {
  const { containerId, name, quantity, tags, needsRestock } = req.body;
  if (!containerId || !name) {
    return res.status(400).json({ message: 'containerId and name are required' });
  }
  const item = await Item.create({
    containerId,
    name,
    quantity: quantity ?? 1,
    tags: tags ?? [],
    needsRestock: needsRestock ?? false,
  });
  return res.status(201).json(item);
});

// PUT /api/items/:id
router.put('/:id', async (req, res) => {
  const { name, quantity, tags, needsRestock, containerId } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (quantity !== undefined) update.quantity = quantity;
  if (tags !== undefined) update.tags = tags;
  if (needsRestock !== undefined) update.needsRestock = needsRestock;
  if (containerId !== undefined) update.containerId = containerId;

  const item = await Item.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  return res.json(item);
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  const result = await Item.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Item not found' });
  }
  return res.json({ message: 'Item deleted' });
});

// PATCH /api/items/:id/increment  (atomic; clears restock flag)
router.patch('/:id/increment', async (req, res) => {
  const result = await Item.updateOne(
    { _id: req.params.id },
    { $inc: { quantity: 1 }, $set: { needsRestock: false } }
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Item not found' });
  }
  return res.json({ message: 'Incremented' });
});

// PATCH /api/items/:id/decrement
// Aggregation-pipeline update: decrement, then set needsRestock if it hits 0.
router.patch('/:id/decrement', async (req, res) => {
  const result = await Item.updateOne(
    { _id: req.params.id, quantity: { $gt: 0 } },
    [
      { $set: { quantity: { $subtract: ['$quantity', 1] } } },
      { $set: { needsRestock: { $eq: ['$quantity', 0] } } },
    ]
  );
  if (result.matchedCount === 0) {
    return res.status(409).json({ message: 'Quantity already at zero' });
  }
  return res.json({ message: 'Decremented' });
});

export default router;
