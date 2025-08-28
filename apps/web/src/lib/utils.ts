import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge classes with tailwind-merge and clsx
 * Essential utility for shadcn/ui and dynamic styling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Healthcare-specific utilities for NeonPro
 */
export const formatCPF = (cpf: string): string => {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
};

export const validateCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) {checkDigit = 0;}
  if (parseInt(digits[9]) !== checkDigit) {return false;}

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) {checkDigit = 0;}

  return parseInt(digits[10]) === checkDigit;
};

/**
 * Date utilities for Brazilian locale
 */
export const formatDateBR = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
};

export const formatDateTimeBR = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString("pt-BR");
};

/**
 * Currency formatting for Brazilian Real
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * LGPD compliance utility
 */
export const anonymizeData = (data: string, visibleChars = 3): string => {
  if (data.length <= visibleChars) {return data;}
  return data.slice(0, visibleChars) + "*".repeat(data.length - visibleChars);
};

/**
 * Error handling utility
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {return error.message;}
  if (typeof error === "string") {return error;}
  return "Erro inesperado";
};

/**
 * Environment utilities
 */
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";

/**
 * API URL helper
 */
export const getApiUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
