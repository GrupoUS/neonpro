import DOMPurify from 'dompurify';

export const isValidEmail = (email: unknown): boolean => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: unknown): boolean => {
  if (typeof phone !== 'string') return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const isValidCPF = (cpf: unknown): boolean => {
  if (typeof cpf !== 'string') return false;
  const cleanCpf = cpf.replace(/[^\d]/g, '');
  if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  sum = (sum * 10) % 11;
  if (sum === 10 || sum === 11) sum = 0;
  remainder = sum;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  sum = (sum * 10) % 11;
  if (sum === 10 || sum === 11) sum = 0;
  remainder = sum;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
  return true;
};

export const sanitizeString = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const sanitizeHtml = (html: unknown): string => {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'] });
};

export const getSecurityHeaders = (): Record<string, string> => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
});

export const isSafeHeaderValue = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  return !/[\r\n]/.test(value); // No CRLF injection
};

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private rate: number;

  constructor(rate: number) {
    this.tokens = rate;
    this.lastRefill = Date.now();
    this.rate = rate;
  }

  async consume(): Promise<boolean> {
    const now = Date.now();
    const delta = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.rate, this.tokens + delta * (this.rate / 60)); // Refill per minute
    this.lastRefill = now;

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}
