import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// GET USER'S VEHICLES
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const vehicles = await prisma.vehicle.findMany({
    where: {
      userId: req.user.id,
      organizationId: req.user.organizationId,
    },
    orderBy: { createdAt: 'desc' }
  });

  return res.json(vehicles);
});

// ADD VEHICLE WITH MILEAGE & FUEL TYPE
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { model, make, color, plateNumber, totalSeats, fuelType, mileageKmL, isDefault } = req.body;
  if (!model || !make || !plateNumber) {
    return res.status(400).json({ error: 'Model, make, and plate number are required' });
  }

  // Check unique plate number
  const existing = await prisma.vehicle.findUnique({ where: { plateNumber } });
  if (existing) {
    return res.status(400).json({ error: 'Vehicle with this plate number already exists' });
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: req.user.id,
      organizationId: req.user.organizationId,
      model,
      make,
      color: color || 'Silver',
      plateNumber,
      totalSeats: totalSeats ? parseInt(totalSeats, 10) : 4,
      fuelType: fuelType || 'Petrol',
      mileageKmL: mileageKmL ? parseFloat(mileageKmL) : 18.0,
      isDefault: Boolean(isDefault),
    }
  });

  return res.status(201).json(vehicle);
});

// DELETE VEHICLE
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
  }

  await prisma.vehicle.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Vehicle deleted successfully' });
});

export default router;
