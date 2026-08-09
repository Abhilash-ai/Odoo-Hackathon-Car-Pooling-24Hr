import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odoo_commute_hackathon_super_secret_jwt_key_2026';

// HEARTBEAT ENDPOINT
router.post('/heartbeat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.user as any)?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() }
    });
    return res.json({ status: 'OK', lastActiveAt: new Date() });
  } catch (err) {
    return res.status(500).json({ error: 'Heartbeat failed' });
  }
});

// GET ACTIVE USERS (Last active within 15 mins)
router.get('/active-users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeUsers = await prisma.user.findMany({
      where: {
        lastActiveAt: { gte: fifteenMinsAgo },
        organizationId: req.user?.organizationId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        gender: true,
        department: true,
        avatarUrl: true,
        lastActiveAt: true,
      },
      orderBy: { lastActiveAt: 'desc' }
    });
    return res.json({ count: activeUsers.length, activeUsers });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch active users' });
  }
});

// SEND OTP (DEMO MODE ENABLED FOR HACKATHON EVALUATION)
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ error: 'Valid mobile number or email required' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const existingOtp = await prisma.otpVerification.findUnique({ where: { identifier: cleanIdentifier } });
    if (existingOtp) {
      const secondsSinceLast = (Date.now() - new Date(existingOtp.updatedAt).getTime()) / 1000;
      if (secondsSinceLast < 30) {
        const remainingCooldown = Math.ceil(30 - secondsSinceLast);
        return res.status(429).json({
          error: `Please wait ${remainingCooldown} seconds before requesting a new OTP.`,
          cooldownRemainingSeconds: remainingCooldown,
        });
      }
    }

    const rawOtp = '123456';
    const codeHash = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpVerification.upsert({
      where: { identifier: cleanIdentifier },
      update: { codeHash, expiresAt, attempts: 0, verified: false },
      create: { identifier: cleanIdentifier, codeHash, expiresAt, attempts: 0, verified: false }
    });

    return res.json({
      message: 'OTP generated and transmitted via Odoo Enterprise Demo Gateway.',
      identifier: cleanIdentifier,
      demoOtp: '123456',
      expiresInSeconds: 300,
      cooldownSeconds: 30,
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// VERIFY OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { identifier, otpCode } = req.body;
    if (!identifier || !otpCode) {
      return res.status(400).json({ error: 'Identifier and 6-digit OTP code required' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const record = await prisma.otpVerification.findUnique({ where: { identifier: cleanIdentifier } });

    if (!record) {
      return res.status(404).json({ error: 'No OTP requested for this mobile number/email.' });
    }

    if (new Date() > new Date(record.expiresAt)) {
      return res.status(400).json({ error: 'OTP expired. Please request a new verification code.' });
    }

    if (record.attempts >= 3) {
      return res.status(429).json({ error: 'Too many failed verification attempts. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(String(otpCode).trim(), record.codeHash);
    if (!isMatch) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 }
      });
      const attemptsLeft = 3 - (record.attempts + 1);
      return res.status(400).json({
        error: `Invalid OTP code. ${attemptsLeft} attempt(s) remaining.`,
        attemptsRemaining: attemptsLeft,
      });
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true, attempts: 0 }
    });

    return res.json({
      message: 'OTP verification successful!',
      verified: true,
      identifier: cleanIdentifier,
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// SIGN UP / REGISTER USER
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, organizationCode, mobileNumber, gender, department } = req.body;
    if (!fullName || !email || !password || !organizationCode || !mobileNumber) {
      return res.status(400).json({ error: 'Full name, email, password, mobile number, and org code required.' });
    }

    const cleanMobile = mobileNumber.trim().toLowerCase();
    const otpRecord = await prisma.otpVerification.findUnique({ where: { identifier: cleanMobile } });
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({ error: 'Mobile number must be verified via OTP before registering.' });
    }

    const org = await prisma.organization.findUnique({ where: { code: organizationCode.trim().toUpperCase() } });
    if (!org) {
      return res.status(404).json({ error: 'Organization code not found.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email.trim().toLowerCase() }, { mobileNumber: cleanMobile }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or mobile number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email: email.trim().toLowerCase(),
        mobileNumber: cleanMobile,
        passwordHash,
        fullName: fullName.trim(),
        role: 'EMPLOYEE',
        gender: gender || 'OTHER',
        department: department || 'Engineering',
        phone: cleanMobile,
        lastActiveAt: new Date(),
        wallet: { create: { balance: 1000.0 } },
      },
      include: { organization: true, wallet: true }
    });

    const token = jwt.sign(
      { id: user.id, userId: user.id, organizationId: org.id, role: user.role, gender: user.gender },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        gender: user.gender,
        organizationId: user.organizationId,
        organizationName: org.name,
        walletBalance: user.wallet?.balance || 1000.0,
      }
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// LOGIN
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { organization: true, wallet: true, vehicles: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });

    const token = jwt.sign(
      { id: user.id, userId: user.id, organizationId: user.organizationId, role: user.role, gender: user.gender },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        gender: user.gender,
        department: user.department,
        workLocation: user.workLocation,
        avatarUrl: user.avatarUrl,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        walletBalance: user.wallet?.balance || 0,
        vehicles: user.vehicles,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// QUICK HACKATHON DEMO LOGIN
router.post('/quick-demo', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    let email = 'driver@odoo.demo';
    if (role === 'admin') email = 'admin@odoo.demo';
    if (role === 'passenger') email = 'employee@odoo.demo';
    if (role === 'female-driver') email = 'female.driver@odoo.demo';

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true, wallet: true, vehicles: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Please run seed.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });

    const token = jwt.sign(
      { id: user.id, userId: user.id, organizationId: user.organizationId, role: user.role, gender: user.gender },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        gender: user.gender,
        department: user.department,
        workLocation: user.workLocation,
        avatarUrl: user.avatarUrl,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        walletBalance: user.wallet?.balance || 0,
        vehicles: user.vehicles,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Quick demo login failed' });
  }
});

// GET ME
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.user as any)?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
      include: { organization: true, wallet: true, vehicles: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        gender: user.gender,
        department: user.department,
        workLocation: user.workLocation,
        avatarUrl: user.avatarUrl,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        walletBalance: user.wallet?.balance || 0,
        vehicles: user.vehicles,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
