import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// CREATE BOOKING WITH WOMEN-ONLY SERVER-SIDE ENFORCEMENT & BOARDING OTP GENERATION
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { rideId, seatsRequested, pickupName, dropName, pickupLat, pickupLng, dropLat, dropLng } = req.body;
  const seats = seatsRequested ? parseInt(seatsRequested, 10) : 1;

  if (!rideId) {
    return res.status(400).json({ error: 'Ride ID is required' });
  }

  const ride = await prisma.ride.findFirst({
    where: {
      id: rideId,
      organizationId: req.user.organizationId,
    },
    include: { driver: true, vehicle: true }
  });

  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }

  if (ride.driverId === req.user.id) {
    return res.status(400).json({ error: 'You cannot book your own ride' });
  }

  if (ride.status !== 'SCHEDULED') {
    return res.status(400).json({ error: 'This ride is no longer active for booking' });
  }

  // STRICT SERVER-SIDE ENFORCEMENT FOR WOMEN-ONLY RIDES
  if (ride.isWomenOnly && req.user.gender !== 'FEMALE') {
    return res.status(403).json({
      error: 'Access Denied: This commute is designated as a Women-Only Ride and is strictly reserved for female employees.'
    });
  }

  if (ride.availableSeats < seats) {
    return res.status(400).json({ error: `Not enough seats available. Only ${ride.availableSeats} seat(s) remaining.` });
  }

  const totalFare = ride.pricePerSeat * seats;
  // Generate 4-digit Boarding OTP (e.g. 4829)
  const boardingOtp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const freshRide = await tx.ride.findUnique({ where: { id: rideId } });
      if (!freshRide || freshRide.availableSeats < seats) {
        throw new Error('Seat availability changed. Overbooking prevented.');
      }

      // 1. Create Booking
      const booking = await tx.booking.create({
        data: {
          rideId: ride.id,
          passengerId: req.user!.id,
          seatsBooked: seats,
          totalFare,
          pickupName: pickupName || ride.originName,
          pickupLat: pickupLat ? Number(pickupLat) : ride.originLat,
          pickupLng: pickupLng ? Number(pickupLng) : ride.originLng,
          dropName: dropName || ride.destName,
          dropLat: dropLat ? Number(dropLat) : ride.destLat,
          dropLng: dropLng ? Number(dropLng) : ride.destLng,
          boardingOtp,
          isCheckedIn: false,
          status: 'CONFIRMED',
        }
      });

      // 2. Decrement available seats
      const updatedRide = await tx.ride.update({
        where: { id: ride.id },
        data: {
          availableSeats: freshRide.availableSeats - seats,
        }
      });

      // 3. Create active Trip entry
      const trip = await tx.trip.create({
        data: {
          organizationId: req.user!.organizationId,
          rideId: ride.id,
          bookingId: booking.id,
          driverId: ride.driverId,
          passengerId: req.user!.id,
          status: 'BOOKED',
          boardingOtp,
          isCheckedIn: false,
          distanceKm: ride.distanceKm,
          fareAmount: totalFare,
          currentLat: ride.originLat,
          currentLng: ride.originLng,
        }
      });

      // 4. Send Notifications
      await tx.notification.createMany({
        data: [
          {
            userId: ride.driverId,
            title: 'New Booking Confirmed',
            message: `${req.user!.fullName} booked ${seats} seat(s) on your commute to ${ride.destName}.`,
            type: 'BOOKING',
          },
          {
            userId: req.user!.id,
            title: 'Ride Booked Successfully',
            message: `Your commute with ${ride.driver.fullName} to ${ride.destName} is confirmed! Your Boarding Verification OTP is ${boardingOtp}.`,
            type: 'BOOKING',
          }
        ]
      });

      return { booking, trip, updatedRide, boardingOtp };
    });

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to book ride' });
  }
});

// GET MY BOOKINGS
router.get('/my-bookings', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const bookings = await prisma.booking.findMany({
    where: { passengerId: req.user.id },
    include: {
      ride: {
        include: {
          driver: { select: { id: true, fullName: true, avatarUrl: true, department: true, gender: true } },
          vehicle: true,
        }
      },
      trip: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return res.json(bookings);
});

export default router;
