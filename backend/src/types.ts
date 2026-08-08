import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMINISTRATOR' | 'EMPLOYEE';
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  organizationId: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface MatchScoreBreakdown {
  score: number; // 0 - 100%
  originProximityKm: number;
  destProximityKm: number;
  timeDiffMins: number;
  seatsAvailable: number;
  reasons: string[];
}
