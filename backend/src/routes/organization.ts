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
      phone: true,
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

// GET DETAILED INDIVIDUAL EMPLOYEE COMMUTE & COST DRILL-DOWN ANALYTICS
router.get('/employees/:id/details', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const targetUserId = req.params.id;

  try {
    const employee = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        organization: true,
        wallet: { include: { transactions: { orderBy: { createdAt: 'desc' }, take: 5 } } },
        vehicles: true,
      }
    });

    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Driver activity
    const ridesOffered = await prisma.ride.findMany({
      where: { driverId: targetUserId },
      include: { vehicle: true, bookings: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Trips (Driver or Passenger)
    const trips = await prisma.trip.findMany({
      where: { OR: [{ driverId: targetUserId }, { passengerId: targetUserId }] },
      include: {
        ride: { include: { vehicle: true } },
        driver: { select: { id: true, fullName: true, department: true } },
        passenger: { select: { id: true, fullName: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const completedTrips = trips.filter(t => t.status === 'COMPLETED' || t.status === 'PAYMENT_COMPLETED');
    const ridesTakenCount = trips.filter(t => t.passengerId === targetUserId).length;
    const ridesOfferedCount = ridesOffered.length;

    const totalDistanceKm = completedTrips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
    const totalFareInr = completedTrips.reduce((acc, t) => acc + (t.fareAmount || 0), 0);

    const petrolPrice = employee.organization?.petrolPricePerLiter || 101.50;
    const estimatedFuelAvoidedLiters = Number((totalDistanceKm / 17.5).toFixed(1));
    const estimatedCo2AvoidedKg = Number((totalDistanceKm * 0.192).toFixed(1));

    // Daily activity trends for this specific employee over 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const employeeDailyData = days.map((dayName, idx) => {
      const dayOffset = 6 - idx;
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset);

      const tripsOnDay = trips.filter(t => {
        const d = new Date(t.createdAt);
        return d.getFullYear() === targetDate.getFullYear() &&
               d.getMonth() === targetDate.getMonth() &&
               d.getDate() === targetDate.getDate();
      });

      const dist = tripsOnDay.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
      const spent = tripsOnDay.reduce((acc, t) => acc + (t.fareAmount || 0), 0);

      return {
        day: dayName,
        trips: tripsOnDay.length,
        distanceKm: Number(dist.toFixed(1)),
        spentInr: Number(spent.toFixed(0)),
      };
    });

    return res.json({
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        workLocation: employee.workLocation,
        role: employee.role,
        gender: employee.gender,
        avatarUrl: employee.avatarUrl,
        createdAt: employee.createdAt,
        walletBalance: employee.wallet?.balance || 0,
      },
      vehicles: employee.vehicles,
      summary: {
        totalRides: trips.length,
        completedTripsCount: completedTrips.length,
        ridesTakenCount,
        ridesOfferedCount,
        totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
        totalFareInr: Number(totalFareInr.toFixed(0)),
        avgDistancePerTrip: completedTrips.length > 0 ? Number((totalDistanceKm / completedTrips.length).toFixed(1)) : 0,
        estimatedFuelAvoidedLiters,
        estimatedCo2AvoidedKg,
      },
      recentTrips: trips,
      walletTransactions: employee.wallet?.transactions || [],
      dailyData: employeeDailyData,
    });
  } catch (err) {
    console.error('Employee details drilldown error:', err);
    return res.status(500).json({ error: 'Failed to fetch employee details' });
  }
});

export default router;
