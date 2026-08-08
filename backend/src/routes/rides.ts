import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// Haversine distance in KM
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate realistic polyline points for Indian routes
function generateRoutePolyline(lat1: number, lng1: number, lat2: number, lng2: number) {
  const steps = 15;
  const polyline: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const curveOffsetLat = Math.sin(ratio * Math.PI) * 0.003;
    const curveOffsetLng = Math.cos(ratio * Math.PI) * 0.003;
    const lat = lat1 + (lat2 - lat1) * ratio + curveOffsetLat;
    const lng = lng1 + (lng2 - lng1) * ratio + curveOffsetLng;
    polyline.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }
  return polyline;
}

// CALCULATE ROUTE & DYNAMIC FUEL COST RATE (INR ₹)
router.post('/calculate-route', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { originLat, originLng, destLat, destLng, originName, destName, vehicleId } = req.body;
  if (!originLat || !originLng || !destLat || !destLng) {
    return res.status(400).json({ error: 'Origin and Destination coordinates required' });
  }

  const distanceKm = haversineKm(Number(originLat), Number(originLng), Number(destLat), Number(destLng));
  const durationMins = Math.max(5, Math.round(distanceKm * 2.5));
  const polyline = generateRoutePolyline(Number(originLat), Number(originLng), Number(destLat), Number(destLng));

  let fuelType = 'Petrol';
  let mileageKmL = 17.5;
  let unitPrice = 101.50;

  if (vehicleId && req.user) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    const org = await prisma.organization.findUnique({ where: { id: req.user.organizationId } });

    if (vehicle) {
      fuelType = vehicle.fuelType;
      mileageKmL = vehicle.mileageKmL;
    }
    if (org) {
      if (fuelType === 'Diesel') unitPrice = org.dieselPricePerLiter;
      else if (fuelType === 'CNG') unitPrice = org.cngPricePerKg;
      else if (fuelType === 'EV') unitPrice = org.evPricePerKwh;
      else unitPrice = org.petrolPricePerLiter;
    }
  }

  const fuelCostPerKm = unitPrice / mileageKmL;
  const estimatedFuelCost = distanceKm * fuelCostPerKm;

  return res.json({
    originName: originName || 'Nagpur Railway Station',
    destName: destName || 'Dharampeth Tech Campus',
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMins,
    polyline,
    origin: [Number(originLat), Number(originLng)],
    dest: [Number(destLat), Number(destLng)],
    costBreakdown: {
      fuelType,
      mileageKmL,
      unitPriceInr: Number(unitPrice.toFixed(2)),
      fuelCostPerKmInr: Number(fuelCostPerKm.toFixed(2)),
      estimatedFuelCostInr: Number(estimatedFuelCost.toFixed(2)),
    }
  });
});

// PUBLISH RIDE
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const {
    vehicleId,
    originName,
    originLat,
    originLng,
    destName,
    destLat,
    destLng,
    departureTime,
    availableSeats,
    pricePerSeat,
    isWomenOnly,
    isRecurring,
  } = req.body;

  if (!vehicleId || !originName || !destName || !departureTime || !availableSeats || pricePerSeat === undefined) {
    return res.status(400).json({ error: 'All ride details including registered vehicle are required' });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: req.user.id }
  });

  if (!vehicle) {
    return res.status(400).json({ error: 'Invalid vehicle selected' });
  }

  const org = await prisma.organization.findUnique({ where: { id: req.user.organizationId } });
  let unitPrice = org?.petrolPricePerLiter || 101.50;
  if (vehicle.fuelType === 'Diesel') unitPrice = org?.dieselPricePerLiter || 92.00;
  if (vehicle.fuelType === 'CNG') unitPrice = org?.cngPricePerKg || 78.00;
  if (vehicle.fuelType === 'EV') unitPrice = org?.evPricePerKwh || 12.00;

  const distanceKm = haversineKm(Number(originLat), Number(originLng), Number(destLat), Number(destLng));
  const durationMins = Math.max(5, Math.round(distanceKm * 2.5));
  const polyline = generateRoutePolyline(Number(originLat), Number(originLng), Number(destLat), Number(destLng));
  
  const fuelCostPerKm = unitPrice / vehicle.mileageKmL;
  const estimatedFuelCost = distanceKm * fuelCostPerKm;

  const ride = await prisma.ride.create({
    data: {
      organization: { connect: { id: req.user.organizationId } },
      driver: { connect: { id: req.user.id } },
      vehicle: { connect: { id: vehicle.id } },
      originName,
      originLat: Number(originLat),
      originLng: Number(originLng),
      destName,
      destLat: Number(destLat),
      destLng: Number(destLng),
      departureTime: new Date(departureTime),
      availableSeats: Number(availableSeats),
      totalSeats: vehicle.totalSeats,
      pricePerSeat: Number(pricePerSeat),
      estimatedFuelCost: Number(estimatedFuelCost.toFixed(2)),
      isWomenOnly: Boolean(isWomenOnly),
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMins,
      routePolyline: JSON.stringify(polyline),
      isRecurring: Boolean(isRecurring),
      status: 'SCHEDULED',
    },
    include: {
      driver: { select: { id: true, fullName: true, avatarUrl: true, department: true, gender: true } },
      vehicle: true,
    }
  });

  return res.status(201).json(ride);
});

// SEARCH & MATCHING ENGINE
router.post('/search', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { originLat, originLng, destLat, destLng, departureTime, seatsNeeded, womenOnlyFilter } = req.body;
  const requestedSeats = seatsNeeded ? parseInt(seatsNeeded, 10) : 1;

  const whereClause: any = {
    organizationId: req.user.organizationId,
    status: 'SCHEDULED',
    availableSeats: { gte: requestedSeats },
  };

  if (womenOnlyFilter) {
    whereClause.isWomenOnly = true;
  }

  const rides = await prisma.ride.findMany({
    where: whereClause,
    include: {
      driver: { select: { id: true, fullName: true, avatarUrl: true, department: true, gender: true } },
      vehicle: true,
      organization: true,
    }
  });

  const searchOriginLat = originLat ? Number(originLat) : null;
  const searchOriginLng = originLng ? Number(originLng) : null;
  const searchDestLat = destLat ? Number(destLat) : null;
  const searchDestLng = destLng ? Number(destLng) : null;
  const reqTime = departureTime ? new Date(departureTime).getTime() : null;

  const matchedRides = rides.map((ride) => {
    let score = 0;
    const reasons: string[] = [];

    score += 10;
    reasons.push(`✓ Same organization (${ride.organization.name})`);

    if (ride.availableSeats >= requestedSeats) {
      score += 10;
      reasons.push(`✓ ${ride.availableSeats} seats available`);
    }

    if (ride.isWomenOnly) {
      reasons.push(`🔒 Women-Only Verified Commute`);
    }

    let originDist = 0;
    if (searchOriginLat !== null && searchOriginLng !== null) {
      originDist = haversineKm(searchOriginLat, searchOriginLng, ride.originLat, ride.originLng);
      if (originDist <= 1.0) {
        score += 30;
        reasons.push(`✓ Pickup within ${originDist.toFixed(1)} km`);
      } else if (originDist <= 3.0) {
        score += 20;
        reasons.push(`✓ Pickup within ${originDist.toFixed(1)} km`);
      } else {
        score += 10;
        reasons.push(`✓ Pickup within ${originDist.toFixed(1)} km`);
      }
    } else {
      score += 30;
    }

    let destDist = 0;
    if (searchDestLat !== null && searchDestLng !== null) {
      destDist = haversineKm(searchDestLat, searchDestLng, ride.destLat, ride.destLng);
      if (destDist <= 1.0) {
        score += 30;
        reasons.push(`✓ Destination matches within ${destDist.toFixed(1)} km`);
      } else if (destDist <= 3.0) {
        score += 20;
        reasons.push(`✓ Destination matches within ${destDist.toFixed(1)} km`);
      } else {
        score += 10;
        reasons.push(`✓ Destination matches within ${destDist.toFixed(1)} km`);
      }
    } else {
      score += 30;
    }

    if (reqTime !== null) {
      const rideTime = new Date(ride.departureTime).getTime();
      const diffMins = Math.abs(rideTime - reqTime) / (1000 * 60);
      if (diffMins <= 15) {
        score += 20;
        reasons.push(`✓ Departure within ${Math.round(diffMins)} minutes`);
      } else if (diffMins <= 45) {
        score += 15;
        reasons.push(`✓ Departure within ${Math.round(diffMins)} minutes`);
      } else {
        score += 10;
        reasons.push(`✓ Departure within ${Math.round(diffMins)} minutes`);
      }
    } else {
      score += 20;
    }

    const finalMatchScore = Math.min(99, Math.max(70, score));

    return {
      ...ride,
      matchScore: finalMatchScore,
      matchBreakdown: {
        score: finalMatchScore,
        originProximityKm: Number(originDist.toFixed(2)),
        destProximityKm: Number(destDist.toFixed(2)),
        reasons,
      }
    };
  });

  matchedRides.sort((a, b) => b.matchScore - a.matchScore);
  return res.json(matchedRides);
});

export default router;
