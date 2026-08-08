import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// CREATE BOOKING WITH TRANSACTION, DUPLICATE CHECK, & ATOMIC SEAT DEDUCTION
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized. Please sign in.' });

  const { rideId, seatsRequested, pickupName, dropName, pickupLat, pickupLng, dropLat, dropLng } = req.body;
  const seats = seatsRequested ? parseInt(seatsRequested, 10) : 1;

  if (!rideId) {
    return res.status(400).json({ error: 'Ride ID is required to book a seat.' });
  }

  if (isNaN(seats) || seats <= 0) {
    return res.status(400).json({ error: 'Please select a valid number of seats (at least 1).' });
  }

  const ride = await prisma.ride.findFirst({
    where: {
      id: rideId,
      organizationId: req.user.organizationId,
    },
    include: { driver: true, vehicle: true }
  });

  if (!ride) {
    return res.status(404).json({ error: 'Selected ride was not found in your organization.' });
  }

  if (ride.driverId === req.user.id) {
    return res.status(400).json({ error: 'You cannot book a seat on a ride you are driving.' });
  }

  if (ride.status !== 'SCHEDULED') {
    return res.status(400).json({ error: 'This commute is no longer active for booking.' });
  }

  // STRICT WOMEN-ONLY SAFETY RESTRICTION CHECK
  if (ride.isWomenOnly && req.user.gender !== 'FEMALE') {
    return res.status(403).json({
      error: 'Access Denied: This commute is designated as a Women-Only Ride and is strictly reserved for female employees.'
    });
  }

  if (ride.availableSeats < seats) {
    return res.status(400).json({
      error: ride.availableSeats === 0
        ? 'This ride no longer has any available seats.'
        : `Only ${ride.availableSeats} seat(s) remaining on this commute.`
    });
  }

  // PREVENT DUPLICATE BOOKING FOR SAME PASSENGER AND RIDE
  const existingBooking = await prisma.booking.findFirst({
    where: {
      rideId: ride.id,
      passengerId: req.user.id,
      status: 'CONFIRMED',
    }
  });

  if (existingBooking) {
    return res.status(400).json({ error: 'You already have a confirmed seat booked on this commute.' });
  }

  const totalFare = ride.pricePerSeat * seats;
  const boardingOtp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Re-verify fresh seat availability inside transaction (atomic concurrency check)
      const freshRide = await tx.ride.findUnique({ where: { id: ride.id } });
      if (!freshRide || freshRide.availableSeats < seats) {
        throw new Error('Seat availability changed. Overbooking prevented.');
      }

      // 1. Create Booking using clean relation connect syntax
      const booking = await tx.booking.create({
        data: {
          ride: { connect: { id: ride.id } },
          passenger: { connect: { id: req.user!.id } },
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

      // 2. Decrement available seats atomically
      const updatedRide = await tx.ride.update({
        where: { id: ride.id },
        data: {
          availableSeats: freshRide.availableSeats - seats,
        }
      });

      // 3. Create active Trip entry using relation connect syntax
      const trip = await tx.trip.create({
        data: {
          organization: { connect: { id: req.user!.organizationId } },
          ride: { connect: { id: ride.id } },
          booking: { connect: { id: booking.id } },
          driver: { connect: { id: ride.driverId } },
          passenger: { connect: { id: req.user!.id } },
          status: 'BOOKED',
          boardingOtp,
          isCheckedIn: false,
          distanceKm: ride.distanceKm,
          fareAmount: totalFare,
          currentLat: ride.originLat,
          currentLng: ride.originLng,
        }
      });

      // 4. Create Notification audit records
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

    return res.status(201).json({
      message: 'Ride booked successfully!',
      booking: result.booking,
      trip: result.trip,
      updatedRide: result.updatedRide,
      boardingOtp: result.boardingOtp,
    });
  } catch (error: any) {
    console.error('Booking transaction error:', error);
    return res.status(400).json({ error: error.message || 'Unable to book this ride. Please try again.' });
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
