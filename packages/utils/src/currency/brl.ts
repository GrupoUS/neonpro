/**
 * Brazilian Real (BRL) currency utilities for healthcare applications
 * Compliant with Brazilian currency standards and accessibility requirements
 */

/**
 * Format number as Brazilian Real currency
 */
export function formatBRL(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Parse BRL formatted string to number
 */
export function parseBRL(brlString: string): number {
  // Remove currency symbol and normalize decimal separators
  const cleaned = brlString
    .replace(/R\$\s*/, '')
    .replace(/\./g, '') // Remove thousands separators
    .replace(',', '.'); // Convert decimal comma to dot
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Mask BRL input for real-time formatting as user types
 */
export function maskBRLInput(value: string): string {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';
  
  // Convert to cents
  const cents = parseInt(numericValue, 10);
  const reais = cents / 100;
  
  return formatBRL(reais);
}

/**
 * Validate if string is a valid BRL amount
 */
export function isValidBRLAmount(value: string): boolean {
  const parsed = parseBRL(value);
  return !isNaN(parsed) && parsed >= 0;
}

/**
 * Convert cents to BRL format
 */
export function centsToBRL(cents: number): string {
  return formatBRL(cents / 100);
}

/**
 * Convert BRL to cents (for storage as integers)
 */
export function brlToCents(brlAmount: number | string): number {
  const amount = typeof brlAmount === 'string' ? parseBRL(brlAmount) : brlAmount;
  return Math.round(amount * 100);
}