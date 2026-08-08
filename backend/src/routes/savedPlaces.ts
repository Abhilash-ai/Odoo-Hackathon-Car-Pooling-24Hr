import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// GET USER SAVED PLACES
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const places = await prisma.savedPlace.findMany({
    where: { userId: req.user.id }
  });

  return res.json(places);
});

// ADD SAVED PLACE
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { label, address, lat, lng } = req.body;
  if (!label || !address || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Label, address, lat, and lng are required' });
  }

  const place = await prisma.savedPlace.create({
    data: {
      userId: req.user.id,
      label,
      address,
      lat: Number(lat),
      lng: Number(lng),
    }
  });

  return res.status(201).json(place);
});

// DELETE SAVED PLACE
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  await prisma.savedPlace.deleteMany({
    where: { id: req.params.id, userId: req.user.id }
  });

  return res.json({ message: 'Saved place removed' });
});

export default router;
