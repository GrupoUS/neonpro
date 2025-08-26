import { z } from "zod";

// Constants for phone validation
const MIN_PHONE_LENGTH = 10;
const MAX_PHONE_LENGTH = 15;

const emailSchema = z.string().email();
const phoneSchema = z.string().min(MIN_PHONE_LENGTH).max(MAX_PHONE_LENGTH);

const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

const validatePhone = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success;
};

export { z, emailSchema, phoneSchema, validateEmail, validatePhone };
