// ============================================================================
// Session Management System - Utilities
// NeonPro - Session Management & Security
// ============================================================================

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { UserSession, DeviceFingerprint, SessionLocation, SecurityEvent } from './types';

// ============================================================================
// TOKEN UTILITIES
// ============================================================================

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken(): string {
  return randomBytes(48).toString('hex');
}

/**
 * Generate a secure device ID
 */
export function generateDeviceId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Hash a token for storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against its hash
 */
export function verifyToken(token: string, hash: string): boolean {
  return hashToken(token) === hash;
}

// ============================================================================
// DEVICE FINGERPRINTING
// ============================================================================

/**
 * Generate device fingerprint hash
 */
export function generateFingerprintHash(fingerprint: DeviceFingerprint): string {
  const components = [
    fingerprint.userAgent,
    fingerprint.screen?.width,
    fingerprint.screen?.height,
    fingerprint.timezone,
    fingerprint.language,
    fingerprint.platform,
    JSON.stringify(fingerprint.plugins?.sort()),
    fingerprint.canvas,
    fingerprint.webgl,
  ].filter(Boolean);
  
  return createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
}

/**
 * Compare device fingerprints
 */
export function compareFingerprintSimilarity(
  fp1: DeviceFingerprint,
  fp2: DeviceFingerprint
): number {
  let matches = 0;
  let total = 0;
  
  // User Agent similarity
  total++;
  if (fp1.userAgent === fp2.userAgent) matches++;
  
  // Screen resolution
  total++;
  if (fp1.screen?.width === fp2.screen?.width && 
      fp1.screen?.height === fp2.screen?.height) {
    matches++;
  }
  
  // Timezone
  total++;
  if (fp1.timezone === fp2.timezone) matches++;
  
  // Language
  total++;
  if (fp1.language === fp2.language) matches++;
  
  // Platform
  total++;
  if (fp1.platform === fp2.platform) matches++;
  
  // Plugins (partial match)
  total++;
  if (fp1.plugins && fp2.plugins) {
    const intersection = fp1.plugins.filter(p => fp2.plugins!.includes(p));
    const union = [...new Set([...fp1.plugins, ...fp2.plugins])];
    if (intersection.length / union.length > 0.7) matches++;
  }
  
  // Canvas fingerprint
  total++;
  if (fp1.canvas === fp2.canvas) matches++;
  
  return matches / total;
}

/**
 * Extract device type from user agent
 */
export function extractDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const ua = userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) {
    return 'mobile';
  }
  
  if (/tablet|ipad/.test(ua)) {
    return 'tablet';
  }
  
  if (/windows|macintosh|linux/.test(ua)) {
    return 'desktop';
  }
  
  return 'unknown';
}

// ============================================================================
// LOCATION UTILITIES
// ============================================================================

/**
 * Calculate distance between two locations (Haversine formula)
 */
export function calculateDistance(
  loc1: { latitude: number; longitude: number },
  loc2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(loc2.latitude - loc1.latitude);
  const dLon = toRadians(loc2.longitude - loc1.longitude);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.latitude)) * Math.cos(toRadians(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if location is suspicious based on previous locations
 */
export function isLocationSuspicious(
  currentLocation: SessionLocation,
  previousLocations: SessionLocation[],
  timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours
): boolean {
  if (!currentLocation.latitude || !currentLocation.longitude) {
    return false;
  }
  
  const recentLocations = previousLocations.filter(
    loc => Date.now() - new Date(loc.timestamp).getTime() < timeWindow
  );
  
  if (recentLocations.length === 0) {
    return false;
  }
  
  // Check for impossible travel (> 1000 km/h)
  for (const prevLoc of recentLocations) {
    if (!prevLoc.latitude || !prevLoc.longitude) continue;
    
    const distance = calculateDistance(
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: prevLoc.latitude, longitude: prevLoc.longitude }
    );
    
    const timeDiff = (Date.now() - new Date(prevLoc.timestamp).getTime()) / (1000 * 60 * 60); // hours
    const speed = distance / timeDiff;
    
    if (speed > 1000) { // Impossible travel speed
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// IP UTILITIES
// ============================================================================

/**
 * Check if IP is private/local
 */
export function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];
  
  return privateRanges.some(range => range.test(ip));
}

/**
 * Extract country from IP (simplified - in production use GeoIP service)
 */
export function extractCountryFromIP(ip: string): string | null {
  // This is a simplified implementation
  // In production, use a proper GeoIP service like MaxMind
  if (isPrivateIP(ip)) {
    return 'LOCAL';
  }
  
  // Return null for now - implement with actual GeoIP service
  return null;
}

/**
 * Check if IP is in a suspicious range
 */
export function isSuspiciousIP(ip: string): boolean {
  // Known suspicious patterns (simplified)
  const suspiciousPatterns = [
    /^0\./,
    /^255\./,
    /^224\./,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(ip));
}

// ============================================================================
// SESSION UTILITIES
// ============================================================================

/**
 * Check if session is expired
 */
export function isSessionExpired(session: UserSession): boolean {
  return new Date() > new Date(session.expiresAt);
}

/**
 * Check if session needs renewal
 */
export function needsRenewal(session: UserSession, renewalThreshold: number = 0.25): boolean {
  const now = Date.now();
  const created = new Date(session.createdAt).getTime();
  const expires = new Date(session.expiresAt).getTime();
  
  const totalDuration = expires - created;
  const remainingTime = expires - now;
  
  return (remainingTime / totalDuration) <= renewalThreshold;
}

/**
 * Calculate session duration
 */
export function calculateSessionDuration(session: UserSession): number {
  const start = new Date(session.createdAt).getTime();
  const end = session.terminatedAt 
    ? new Date(session.terminatedAt).getTime()
    : Date.now();
  
  return end - start;
}

/**
 * Get session age in minutes
 */
export function getSessionAge(session: UserSession): number {
  const now = Date.now();
  const created = new Date(session.createdAt).getTime();
  return Math.floor((now - created) / (1000 * 60));
}

/**
 * Check if session is active
 */
export function isSessionActive(session: UserSession): boolean {
  return session.status === 'active' && !isSessionExpired(session);
}

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Calculate security score based on various factors
 */
export function calculateSecurityScore(factors: {
  deviceTrusted?: boolean;
  locationSuspicious?: boolean;
  ipSuspicious?: boolean;
  recentSecurityEvents?: number;
  sessionAge?: number;
  fingerprintMatch?: number;
}): number {
  let score = 100;
  
  // Device trust factor
  if (factors.deviceTrusted === false) {
    score -= 30;
  }
  
  // Location factor
  if (factors.locationSuspicious) {
    score -= 25;
  }
  
  // IP reputation factor
  if (factors.ipSuspicious) {
    score -= 20;
  }
  
  // Recent security events
  if (factors.recentSecurityEvents) {
    score -= Math.min(factors.recentSecurityEvents * 10, 30);
  }
  
  // Session age factor (older sessions are less secure)
  if (factors.sessionAge) {
    const ageHours = factors.sessionAge / 60;
    if (ageHours > 8) {
      score -= Math.min((ageHours - 8) * 2, 20);
    }
  }
  
  // Fingerprint match factor
  if (factors.fingerprintMatch !== undefined) {
    if (factors.fingerprintMatch < 0.7) {
      score -= (1 - factors.fingerprintMatch) * 40;
    }
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Detect potential session hijacking
 */
export function detectSessionHijacking(
  currentSession: UserSession,
  previousSessions: UserSession[]
): boolean {
  if (previousSessions.length === 0) {
    return false;
  }
  
  const lastSession = previousSessions[previousSessions.length - 1];
  
  // Check for sudden IP change
  if (currentSession.ipAddress !== lastSession.ipAddress) {
    // Check if locations are too far apart
    if (currentSession.location && lastSession.location) {
      const distance = calculateDistance(
        {
          latitude: currentSession.location.latitude!,
          longitude: currentSession.location.longitude!
        },
        {
          latitude: lastSession.location.latitude!,
          longitude: lastSession.location.longitude!
        }
      );
      
      const timeDiff = new Date(currentSession.createdAt).getTime() - 
                      new Date(lastSession.lastActivityAt).getTime();
      const hours = timeDiff / (1000 * 60 * 60);
      
      // Impossible travel speed
      if (distance / hours > 1000) {
        return true;
      }
    }
  }
  
  // Check for device fingerprint mismatch
  const fingerprintSimilarity = compareFingerprintSimilarity(
    currentSession.deviceFingerprint,
    lastSession.deviceFingerprint
  );
  
  if (fingerprintSimilarity < 0.5) {
    return true;
  }
  
  return false;
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string, key: string): string {
  const keyBuffer = Buffer.from(key.padEnd(ENCRYPTION_KEY_LENGTH, '0').slice(0, ENCRYPTION_KEY_LENGTH));
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Combine IV, tag, and encrypted data
  return iv.toString('hex') + tag.toString('hex') + encrypted;
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string, key: string): string {
  const keyBuffer = Buffer.from(key.padEnd(ENCRYPTION_KEY_LENGTH, '0').slice(0, ENCRYPTION_KEY_LENGTH));
  
  // Extract IV, tag, and encrypted data
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
  const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
  const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);
  
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate session token format
 */
export function isValidSessionToken(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token);
}

/**
 * Validate refresh token format
 */
export function isValidRefreshToken(token: string): boolean {
  return /^[a-f0-9]{96}$/.test(token);
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Validate user agent format
 */
export function isValidUserAgent(userAgent: string): boolean {
  return userAgent.length > 0 && userAgent.length <= 1000;
}

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Format duration in human readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get time until expiration
 */
export function getTimeUntilExpiration(expiresAt: Date): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

/**
 * Check if time is within business hours
 */
export function isBusinessHours(date: Date = new Date()): boolean {
  const hour = date.getHours();
  const day = date.getDay();
  
  // Monday to Friday, 8 AM to 6 PM
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
}

// ============================================================================
// RATE LIMITING UTILITIES
// ============================================================================

/**
 * Simple in-memory rate limiter
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }
}

/**
 * Create rate limiter instance
 */
export function createRateLimiter(maxAttempts: number, windowMs: number): RateLimiter {
  return new RateLimiter(maxAttempts, windowMs);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  RateLimiter,
};
