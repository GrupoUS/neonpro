import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * Combines clsx for conditional class names with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Healthcare-specific utility functions for accessibility and compliance
 */

// Format phone numbers for Brazil healthcare standards
export function formatBrazilianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Format CPF for display
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return cpf;
}

// Format currency for Brazilian Real
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

// Accessibility helpers
export function generateId(prefix: string = "element"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// LGPD compliance helpers
export function maskSensitiveData(
  data: string,
  visibleChars: number = 4,
): string {
  if (data.length <= visibleChars) return data;
  const masked = "*".repeat(data.length - visibleChars);
  return data.slice(0, visibleChars) + masked;
}
