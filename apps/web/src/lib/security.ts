import { isValidEmail, isValidPhone, isValidCPF, sanitizeString, sanitizeHtml } from '@/types/guards.ts';

// Security constants
export const SECURITY_CONFIG = {
  maxPasswordLength: 128,
  minPasswordLength: 8,
  maxUsernameLength: 50,
  maxEmailLength: 254,
  maxPhoneLength: 20,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  rateLimitWindow: 60 * 1000, // 1 minute
  maxRequestsPerWindow: 100,
} as const;

// Input validation and sanitization
export const validateAndSanitizeInput = (input: unknown, type: 'string' | 'email' | 'phone' | 'cpf'): string => {
  let sanitized: string;
  
  switch (type) {
    case 'email':
      if (!isValidEmail(input)) {
        throw new Error('Invalid email format');
      }
      sanitized = sanitizeString(input);
      if (sanitized.length > SECURITY_CONFIG.maxEmailLength) {
        throw new Error('Email too long');
      }
      break;
      
    case 'phone':
      if (!isValidPhone(input)) {
        throw new Error('Invalid phone format');
      }
      sanitized = sanitizeString(input).replace(/[^\d+\-\s()]/g, '');
      if (sanitized.length > SECURITY_CONFIG.maxPhoneLength) {
        throw new Error('Phone number too long');
      }
      break;
      
    case 'cpf':
      if (!isValidCPF(input)) {
        throw new Error('Invalid CPF format');
      }
      sanitized = sanitizeString(input).replace(/[^\d]/g, '');
      break;
      
    case 'string':
    default:
      sanitized = sanitizeString(input);
      if (sanitized.length > SECURITY_CONFIG.maxUsernameLength) {
        throw new Error('Input too long');
      }
      break;
  }
  
  return sanitized;
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.minPasswordLength) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.minPasswordLength} characters`);
  }
  
  if (password.length > SECURITY_CONFIG.maxPasswordLength) {
    errors.push(`Password must be less than ${SECURITY_CONFIG.maxPasswordLength} characters`);
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common patterns
  const commonPatterns = [
    /password/i,
    /123456/,
    /qwerty/i,
    /abc123/i,
    /letmein/i,
    /welcome/i,
    /admin/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password contains common patterns that are not allowed');
  }
  
  // Check for sequential characters
  const sequentialPattern = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;
  if (sequentialPattern.test(password)) {
    errors.push('Password contains sequential characters');
  }
  
  // Check for repeated characters
  const repeatedPattern = /(.)\1{2,}/;
  if (repeatedPattern.test(password)) {
    errors.push('Password contains repeated characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// CSRF protection
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken && token.length > 0;
};

// XSS protection
export const sanitizeForHTML = (content: unknown): string => {
  return sanitizeHtml(content);
};

export const sanitizeForAttribute = (content: unknown): string => {
  if (typeof content !== 'string') return '';
  return content
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Content Security Policy helpers
export const generateCSPHeader = (): string => {
  const nonce = crypto.randomUUID();
  return [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "' 'strict-dynamic'",
    "style-src 'self' 'nonce-" + nonce + "'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.supabase.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests",
  ].join('; ');
};

// Rate limiting
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private windowMs: number, private maxRequests: number) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }
    
    const userRequests = this.requests.get(key)!;
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
  
  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      return this.maxRequests;
    }
    
    const userRequests = this.requests.get(key)!;
    const validRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
  
  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Security headers
export const getSecurityHeaders = (): Record<string, string> => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': generateCSPHeader(),
});

// Session security
export const secureSessionStorage = {
  setItem: (key: string, value: string): void => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  },
  
  getItem: (key: string): string | null => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  },
  
  removeItem: (key: string): void => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  },
  
  clear: (): void => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  },
};

// Cookie options interface
export interface CookieOptions {
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
}

// Secure cookie helpers
export const getSecureCookieOptions = (): Partial<CookieOptions> => ({
  secure: true,
  sameSite: 'strict',
  httpOnly: true,
  path: '/',
});

// Input validation for healthcare data
export const validateHealthcareData = (data: {
  patientName?: unknown;
  patientEmail?: unknown;
  patientPhone?: unknown;
  patientCPF?: unknown;
  appointmentDate?: unknown;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  try {
    if (data.patientName) {
      validateAndSanitizeInput(data.patientName, 'string');
    }
  } catch (error) {
    errors.push(`Invalid patient name: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  try {
    if (data.patientEmail) {
      validateAndSanitizeInput(data.patientEmail, 'email');
    }
  } catch (error) {
    errors.push(`Invalid patient email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  try {
    if (data.patientPhone) {
      validateAndSanitizeInput(data.patientPhone, 'phone');
    }
  } catch (error) {
    errors.push(`Invalid patient phone: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  try {
    if (data.patientCPF) {
      validateAndSanitizeInput(data.patientCPF, 'cpf');
    }
  } catch (error) {
    errors.push(`Invalid patient CPF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  if (data.appointmentDate && !(data.appointmentDate instanceof Date)) {
    errors.push('Invalid appointment date');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};