import { Router } from 'express';
import Item from '../models/Item.js';

const router = Router();

// GET /api/search?q=...
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  const results = await Item.aggregate([
    { $match: { $text: { $search: q } } },
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
        path: { $concat: ['$location.name', ' > ', '$container.name'] },
      },
    },
  ]);

  return res.json(results);
});

export default router;
