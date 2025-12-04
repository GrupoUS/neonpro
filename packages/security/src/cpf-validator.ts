/**
 * CPF Validation Module
 * Brazilian CPF (Cadastro de Pessoas Físicas) validation
 * Implements check digit verification algorithm
 */

/**
 * Validates Brazilian CPF number
 * CPF format: XXX.XXX.XXX-XX or XXXXXXXXXXX
 *
 * Algorithm:
 * - First 9 digits are the base number
 * - Last 2 digits are check digits calculated from the first 9
 *
 * @param cpf - CPF string (with or without formatting)
 * @returns true if valid, false otherwise
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Remove formatting (dots, hyphens, spaces)
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  // Check length
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Check for known invalid CPFs (all digits the same)
  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ];

  if (invalidCPFs.includes(cleanCPF)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }

  let remainder = 11 - (sum % 11);
  const firstCheckDigit = remainder >= 10 ? 0 : remainder;

  if (firstCheckDigit !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }

  remainder = 11 - (sum % 11);
  const secondCheckDigit = remainder >= 10 ? 0 : remainder;

  if (secondCheckDigit !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Formats CPF string to standard format XXX.XXX.XXX-XX
 *
 * @param cpf - CPF string (with or without formatting)
 * @returns Formatted CPF or empty string if invalid
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';

  const cleanCPF = cpf.replace(/[^\d]/g, '');

  if (cleanCPF.length !== 11) {
    return cpf; // Return as-is if not 11 digits
  }

  return `${cleanCPF.substring(0, 3)}.${cleanCPF.substring(3, 6)}.${cleanCPF.substring(6, 9)}-${cleanCPF.substring(9)}`;
}

/**
 * Removes CPF formatting
 *
 * @param cpf - Formatted CPF string
 * @returns CPF with only digits
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/[^\d]/g, '');
}

/**
 * Generates a random valid CPF for testing purposes
 * WARNING: For testing only! Do not use for real data
 *
 * @returns Random valid CPF string
 */
export function generateRandomCPF(): string {
  // Generate first 9 random digits
  const baseDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += baseDigits[i] * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const firstCheckDigit = remainder >= 10 ? 0 : remainder;

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += baseDigits[i] * (11 - i);
  }
  sum += firstCheckDigit * 2;
  remainder = 11 - (sum % 11);
  const secondCheckDigit = remainder >= 10 ? 0 : remainder;

  const fullCPF = [...baseDigits, firstCheckDigit, secondCheckDigit].join('');
  return formatCPF(fullCPF);
}

/**
 * Type guard to check if string is a valid CPF
 *
 * @param value - Value to check
 * @returns true if value is a valid CPF string
 */
export function isCPF(value: unknown): value is string {
  return typeof value === 'string' && validateCPF(value);
}
