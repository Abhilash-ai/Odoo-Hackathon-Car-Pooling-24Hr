import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();

// GET WALLET BALANCE & TRANSACTIONS
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  let wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.id },
    include: {
      transactions: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: req.user.id,
        balance: 1000.0,
      },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } }
      }
    });
  }

  return res.json(wallet);
});

// RECHARGE WALLET (INR ₹)
router.post('/recharge', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, paymentMethod } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid recharge amount required' });
  }

  let wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId: req.user.id, balance: 0.0 }
    });
  }

  const updatedWallet = await prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: numAmount } }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: numAmount,
        type: 'CREDIT',
        description: `Wallet Top-Up via ${paymentMethod || 'UPI'}`,
        referenceId: `TXN-${Date.now().toString(36).toUpperCase()}`,
        paymentMethod: paymentMethod || 'UPI',
      }
    });

    return updated;
  });

  return res.json({
    message: 'Wallet recharge successful',
    balance: updatedWallet.balance,
  });
});

// PAY TRIP FARE (INR ₹)
router.post('/pay-trip', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { tripId } = req.body;
  if (!tripId) return res.status(400).json({ error: 'Trip ID required' });

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { ride: true, driver: true }
  });

  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  if (trip.passengerId !== req.user.id) return res.status(403).json({ error: 'Only trip passenger can process payment' });
  if (trip.paymentStatus === 'PAID') return res.status(400).json({ error: 'Trip fare is already paid' });

  const fare = trip.fareAmount;

  let passengerWallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
  if (!passengerWallet || passengerWallet.balance < fare) {
    return res.status(400).json({ error: `Insufficient wallet balance (Current: ₹${passengerWallet?.balance || 0}). Recharge wallet.` });
  }

  let driverWallet = await prisma.wallet.findUnique({ where: { userId: trip.driverId } });
  if (!driverWallet) {
    driverWallet = await prisma.wallet.create({ data: { userId: trip.driverId, balance: 0.0 } });
  }

  await prisma.$transaction(async (tx) => {
    // Deduct passenger balance
    await tx.wallet.update({
      where: { id: passengerWallet.id },
      data: { balance: { decrement: fare } }
    });

    await tx.transaction.create({
      data: {
        walletId: passengerWallet.id,
        amount: fare,
        type: 'DEBIT',
        description: `Commute Fare: ${trip.ride.originName} → ${trip.ride.destName}`,
        referenceId: `TRIP-${trip.id.slice(0, 8).toUpperCase()}`,
        paymentMethod: 'INTERNAL_WALLET',
      }
    });

    // Credit driver balance
    await tx.wallet.update({
      where: { id: driverWallet.id },
      data: { balance: { increment: fare } }
    });

    await tx.transaction.create({
      data: {
        walletId: driverWallet.id,
        amount: fare,
        type: 'CREDIT',
        description: `Fare Received: Commute with ${req.user!.fullName}`,
        referenceId: `EARN-${trip.id.slice(0, 8).toUpperCase()}`,
        paymentMethod: 'INTERNAL_WALLET',
      }
    });

    // Update trip status
    await tx.trip.update({
      where: { id: trip.id },
      data: {
        paymentStatus: 'PAID',
        status: 'COMPLETED',
      }
    });
  });

  return res.json({
    message: 'Payment processed successfully',
    fareAmount: fare,
    tripId: trip.id,
  });
});

export default router;
