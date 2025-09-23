/**
 * Brazilian document identifiers validation and formatting
 * Healthcare compliant utilities for CPF, phone numbers, etc.
 */

/**
 * Format Brazilian phone number
 */
export function formatBRPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    // Mobile: +55 (XX) 9XXXX-XXXX
    return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    // Landline: +55 (XX) XXXX-XXXX
    return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Format CPF with dots and dash
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  return cpf;
}

/**
 * Validate CPF using official algorithm
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) return false;

  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }

  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;

  if (checkDigit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }

  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;

  return checkDigit === parseInt(cleaned.charAt(10));
}

/**
 * Validate Brazilian phone number
 */
export function validateBrazilianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");

  // Must have 10 (landline) or 11 (mobile) digits
  if (cleaned.length !== 10 && cleaned.length !== 11) return false;

  // Area codes must be between 11-99
  const areaCode = parseInt(cleaned.slice(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;

  // Mobile numbers must start with 9
  if (cleaned.length === 11 && cleaned.charAt(2) !== "9") return false;

  return true;
}

/**
 * CPF input mask for forms
 */
export function validateCPFMask(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);

  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9)
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;

  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

/**
 * Brazilian phone input mask
 */
export function validateBRPhoneMask(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);

  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;

  if (cleaned.length <= 11) {
    const areaCode = cleaned.slice(0, 2);
    const firstPart = cleaned.slice(2, 7);
    const secondPart = cleaned.slice(7);
    return `(${areaCode}) ${firstPart}-${secondPart}`;
  }

  return value;
}

/**
 * Clean document removing all non-numeric characters
 */
export function cleanDocument(document: string): string {
  return document.replace(/\D/g, "");
}
