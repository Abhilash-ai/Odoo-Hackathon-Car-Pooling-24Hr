import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// GET MESSAGES FOR A TRIP
router.get('/trip/:tripId', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const messages = await prisma.message.findMany({
    where: { tripId: req.params.tripId },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  return res.json(messages);
});

// SEND MESSAGE FOR A TRIP
router.post('/trip/:tripId', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  const trip = await prisma.trip.findUnique({ where: { id: req.params.tripId } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const message = await prisma.message.create({
    data: {
      tripId: trip.id,
      senderId: req.user.id,
      content: content.trim(),
    },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true } }
    }
  });

  return res.status(201).json(message);
});

export default router;
