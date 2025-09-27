import { sign, verify, SignOptions } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { Patient, Professional } from '@neonpro/types';

// Extended type for Patient with LGPD consent
interface PatientWithConsent extends Patient {
  consentGiven: boolean;
}

// Type guard for Patient with consent
const isPatientWithConsent = (user: Patient | Professional): user is PatientWithConsent => {
  return 'patientId' in user && (user as Patient).consentGiven === true;
};

// Auth guards (moved from index.ts)
export const isAuthenticated = (user: Patient | Professional | null): user is Patient | Professional => {
  return !!user && !!user.id;
};

export const requireProfessional = (user: Patient | Professional | null): asserts user is Professional => {
  if (!user || !('specialty' in user)) {
    throw new Error('Professional access required');
  }
};

// Password hashing with bcrypt (upgraded from SHA256 in index.ts)
export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 12); // Salt rounds 12 for security
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await compare(password, hash);
};

// JWT token utilities
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'; // In production, use secure env var

export const signToken = (payload: Record<string, unknown>, expiresIn: number = 3600): string => { // Short expiry for LGPD compliance, in seconds
  const options: SignOptions = { expiresIn };
  return sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): Record<string, unknown> | null => {
  try {
    return verify(token, JWT_SECRET) as Record<string, unknown>;
  } catch {
    return null;
  }
};

// Session management with LGPD compliance (short-lived sessions, consent check)
export const createSession = (user: Patient | Professional): object => {
  if (!isPatientWithConsent(user)) {
    throw new Error('User consent required for session creation (LGPD compliance)');
  }
  const payload = {
    id: user.id,
    role: 'patientId' in user ? 'patient' : 'professional',
    expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour expiry for sensitive data
  };
  return {
    token: signToken(payload, 3600), // 1 hour in seconds
    userId: user.id,
    expiresAt: payload.expiresAt,
  };
};

export const validateSession = (token: string, user: Patient | Professional): boolean => {
  const decoded = verifyToken(token);
  if (!decoded || !isAuthenticated(user)) return false;
  // Check expiry and consent
  const decodedWithExpires = decoded as { expiresAt: number };
  const hasConsent = isPatientWithConsent(user) ? user.consentGiven : true; // Professionals may have different consent model
  if (Date.now() > decodedWithExpires.expiresAt || !hasConsent) return false;
  return true;
};
