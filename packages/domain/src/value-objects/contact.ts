// import type { Address } from './address'; // TODO: Use when implementing address functionality

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: import('./address').Address;
}

/**
 * Brazilian phone validation
 */
export function validateBrazilianPhone(phone: string): boolean {
  // Remove formatting
  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Check length (10 or 11 digits)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Check area code (11-99)
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;

  // Check mobile number format (9 digits starting with 9)
  if (cleanPhone.length === 11) {
    const firstDigit = parseInt(cleanPhone.charAt(2));
    if (firstDigit !== 9) return false;
  }

  return true;
}

/**
 * Format Brazilian phone for display
 */
export function formatBrazilianPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');

  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}
