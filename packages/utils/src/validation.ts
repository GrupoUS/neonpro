import { z } from 'zod';

export const emailSchema = z.string().email();
export const phoneSchema = z.string().min(10).max(15);

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}
