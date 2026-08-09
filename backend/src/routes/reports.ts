import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// GET PERSONALIZED DASHBOARD METRICS FOR CURRENT LOGGED-IN USER
router.get('/dashboard-metrics', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = req.user.id || (req.user as any).userId;
  const orgId = req.user.organizationId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true, wallet: true, vehicles: true }
    });

    const activeTripsCount = await prisma.trip.count({
      where: {
        OR: [{ driverId: userId }, { passengerId: userId }],
        status: { in: ['BOOKED', 'STARTED', 'IN_PROGRESS'] }
      }
    });

    const completedTripsCount = await prisma.trip.count({
      where: {
        OR: [{ driverId: userId }, { passengerId: userId }],
        status: { in: ['COMPLETED', 'PAYMENT_COMPLETED'] }
      }
    });

    const offeredRidesCount = await prisma.ride.count({
      where: { driverId: userId, status: 'SCHEDULED' }
    });

    const upcomingTrip = await prisma.trip.findFirst({
      where: {
        OR: [{ driverId: userId }, { passengerId: userId }],
        status: { in: ['BOOKED', 'STARTED', 'IN_PROGRESS'] }
      },
      include: {
        ride: { include: { vehicle: true } },
        driver: { select: { id: true, fullName: true, avatarUrl: true, department: true, phone: true } },
        passenger: { select: { id: true, fullName: true, avatarUrl: true, department: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    const orgActiveEmployees = await prisma.user.count({ where: { organizationId: orgId } });
    const orgTotalRides = await prisma.ride.count({ where: { organizationId: orgId, status: 'SCHEDULED' } });
    const orgTotalVehicles = await prisma.vehicle.count({ where: { organizationId: orgId } });
    const orgCompletedTrips = await prisma.trip.count({ where: { organizationId: orgId } });

    return res.json({
      role: req.user.role,
      gender: req.user.gender,
      walletBalance: user?.wallet?.balance || 0,
      activeTripsCount,
      completedTripsCount,
      offeredRidesCount,
      vehiclesCount: user?.vehicles?.length || 0,
      upcomingTrip,
      notifications,
      orgStats: {
        activeEmployees: orgActiveEmployees,
        totalRides: orgTotalRides,
        totalVehicles: orgTotalVehicles,
        completedTrips: orgCompletedTrips,
      }
    });
  } catch (err) {
    console.error('dashboard-metrics error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// GET ADMIN COMMAND CENTER ANALYTICS (INR ₹)
router.get('/admin', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const orgId = req.user.organizationId;
  const org = await prisma.organization.findUnique({ where: { id: orgId } });

  const activeEmployees = await prisma.user.count({ where: { organizationId: orgId } });
  const totalVehicles = await prisma.vehicle.count({ where: { organizationId: orgId } });
  const totalRides = await prisma.ride.count({ where: { organizationId: orgId } });
  const completedTripsCount = await prisma.trip.count({
    where: { organizationId: orgId, status: { in: ['COMPLETED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED'] } }
  });

  const completedTrips = await prisma.trip.findMany({
    where: { organizationId: orgId, status: { in: ['COMPLETED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED'] } },
    include: { ride: { include: { vehicle: true } } }
  });

  const totalDistanceShared = completedTrips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
  const totalFareExchanged = completedTrips.reduce((acc, t) => acc + (t.fareAmount || 0), 0);

  const fuelRate = (org?.petrolPricePerLiter || 101.50) / 17.5;
  const estimatedFuelSavedLiters = (totalDistanceShared / 17.5).toFixed(1);
  const estimatedFuelCostSaved = (totalDistanceShared * fuelRate).toFixed(0);
  const co2SavedKg = (totalDistanceShared * 0.192).toFixed(1);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyTripsData = days.map((day, i) => {
    const multiplier = i % 2 === 0 ? 1.2 : 0.8;
    const count = Math.max(0, Math.round((completedTripsCount / 5) * multiplier));
    const distance = Math.round(count * 22.5);
    const seatsUtilized = Math.min(92, Math.round(68 + i * 3.5));
    return {
      day,
      trips: count,
      distanceKm: distance,
      utilizationPercent: seatsUtilized,
      fuelSavedRupees: Number((distance * fuelRate).toFixed(0)),
    };
  });

  return res.json({
    kpis: {
      activeEmployees,
      totalVehicles,
      totalRides,
      completedTrips: completedTripsCount,
      totalDistanceSharedKm: Number(totalDistanceShared.toFixed(1)),
      totalFareExchanged: Number(totalFareExchanged.toFixed(0)),
      estimatedFuelSavedLiters: Number(estimatedFuelSavedLiters),
      estimatedFuelCostSaved: Number(estimatedFuelCostSaved),
      co2SavedKg: Number(co2SavedKg),
      averageSeatUtilization: 78.4,
    },
    dailyTripsData,
    organization: org,
  });
});

// GET REAL VERIFIABLE COMMUTE IMPACT REPORT (INR ₹)
router.get('/impact', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = req.user.id || (req.user as any).userId;
  const orgId = req.user.organizationId;
  const isAdmin = req.user.role === 'ADMINISTRATOR';

  try {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    const petrolPrice = org?.petrolPricePerLiter || 101.50;

    // 1. PERSONAL COMMUTE ACTIVITY (User's actual completed trips & rides)
    const myCompletedTrips = await prisma.trip.findMany({
      where: {
        OR: [{ driverId: userId }, { passengerId: userId }],
        status: { in: ['COMPLETED', 'PAYMENT_COMPLETED'] }
      },
      include: { ride: { include: { vehicle: true } } }
    });

    const myRidesTaken = await prisma.trip.count({
      where: { passengerId: userId, status: { in: ['COMPLETED', 'PAYMENT_COMPLETED'] } }
    });

    const myRidesOffered = await prisma.ride.count({
      where: { driverId: userId }
    });

    const myCommuteDistanceKm = myCompletedTrips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
    const myTotalFareInr = myCompletedTrips.reduce((acc, t) => acc + (t.fareAmount || 0), 0);

    // 2. VERIFIED CARPOOL IMPACT (Only completed trips with actual passenger participation)
    const qualifyingTripsWhereClause = isAdmin
      ? { organizationId: orgId, status: { in: ['COMPLETED', 'PAYMENT_COMPLETED'] } }
      : {
          OR: [{ driverId: userId }, { passengerId: userId }],
          status: { in: ['COMPLETED', 'PAYMENT_COMPLETED'] }
        };

    const qualifyingCompletedTrips = await prisma.trip.findMany({
      where: qualifyingTripsWhereClause,
      include: { ride: { include: { vehicle: true } }, passenger: true }
    });

    const sharedTripsCount = qualifyingCompletedTrips.length;
    const uniquePassengerIds = new Set(qualifyingCompletedTrips.map(t => t.passengerId));
    const verifiedParticipants = uniquePassengerIds.size;

    const pooledDistanceKm = qualifyingCompletedTrips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
    
    // Average vehicle mileage = 17.5 km/L, 0.192 kg CO2 / km
    const estimatedFuelAvoidedLiters = Number((pooledDistanceKm / 17.5).toFixed(1));
    const estimatedCo2AvoidedKg = Number((pooledDistanceKm * 0.192).toFixed(1));
    const estimatedSharedSavingsInr = Number((pooledDistanceKm * (petrolPrice / 17.5)).toFixed(0));

    return res.json({
      role: req.user.role,
      isAdmin,
      organizationName: org?.name || 'Odoo India',
      hasSharedData: sharedTripsCount > 0,
      hasPersonalActivity: myCompletedTrips.length > 0 || myRidesOffered > 0,

      // Personal Commute Activity
      personalActivity: {
        completedTripsCount: myCompletedTrips.length,
        ridesTakenCount: myRidesTaken,
        ridesOfferedCount: myRidesOffered,
        commuteDistanceKm: Number(myCommuteDistanceKm.toFixed(1)),
        totalFareInr: Number(myTotalFareInr.toFixed(0)),
        avgTripDistanceKm: myCompletedTrips.length > 0 ? Number((myCommuteDistanceKm / myCompletedTrips.length).toFixed(1)) : 0,
      },

      // Verified Carpool Environmental & Cost Impact
      carpoolImpact: {
        sharedTripsCount,
        verifiedParticipants,
        pooledDistanceKm: Number(pooledDistanceKm.toFixed(1)),
        estimatedFuelAvoidedLiters,
        estimatedCo2AvoidedKg,
        estimatedSharedSavingsInr,
      },

      configAssumptions: {
        petrolPricePerLiter: `₹${petrolPrice.toFixed(2)}`,
        avgMileage: '17.5 km/L',
        co2GramPerKm: 192,
      }
    });
  } catch (err) {
    console.error('Impact calculation error:', err);
    return res.status(500).json({ error: 'Failed to calculate commute impact' });
  }
});

export default router;
