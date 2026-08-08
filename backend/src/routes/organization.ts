import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// GET CURRENT ORG DETAILS
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const org = await prisma.organization.findUnique({
    where: { id: req.user.organizationId },
    include: {
      _count: {
        select: { users: true, vehicles: true, rides: true, trips: true }
      }
    }
  });

  if (!org) return res.status(404).json({ error: 'Organization not found' });
  return res.json(org);
});

// UPDATE ORG FUEL PRICES & COST SETTINGS (ADMIN ONLY)
router.put('/settings', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { petrolPricePerLiter, dieselPricePerLiter, cngPricePerKg, evPricePerKwh, travelAllowancePerKm } = req.body;

  const updatedOrg = await prisma.organization.update({
    where: { id: req.user.organizationId },
    data: {
      petrolPricePerLiter: petrolPricePerLiter !== undefined ? parseFloat(petrolPricePerLiter) : undefined,
      dieselPricePerLiter: dieselPricePerLiter !== undefined ? parseFloat(dieselPricePerLiter) : undefined,
      cngPricePerKg: cngPricePerKg !== undefined ? parseFloat(cngPricePerKg) : undefined,
      evPricePerKwh: evPricePerKwh !== undefined ? parseFloat(evPricePerKwh) : undefined,
      travelAllowancePerKm: travelAllowancePerKm !== undefined ? parseFloat(travelAllowancePerKm) : undefined,
    }
  });

  return res.json(updatedOrg);
});

// LIST ORG EMPLOYEES
router.get('/employees', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const employees = await prisma.user.findMany({
    where: { organizationId: req.user.organizationId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      gender: true,
      department: true,
      workLocation: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: { vehicles: true, offeredRides: true, passengerTrips: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return res.json(employees);
});

export default router;
