/**
 * Brazilian Real (BRL) Currency Utilities
 * Provides formatting and parsing functions for Brazilian currency
 */

/**
 * Formats a number as Brazilian Real currency
 * @param value - The numeric value to format
 * @param options - Optional Intl.NumberFormat options
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatBRL(
  value: number,
  options?: Partial<Intl.NumberFormatOptions>,
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    ...options,
  }).format(value);
}

/**
 * Formats a number as Brazilian Real without currency symbol
 * @param value - The numeric value to format
 * @returns Formatted number string (e.g., "1.234,56")
 */
export function formatBRLNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parses a Brazilian currency string to a number
 * @param value - The currency string to parse (e.g., "R$ 1.234,56" or "1.234,56")
 * @returns Parsed number value
 */
export function parseBRL(value: string): number {
  // Remove currency symbol, spaces, and dots (thousand separators)
  // Replace comma (decimal separator) with dot
  const cleaned = value
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .trim();

  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Validates if a string is a valid Brazilian currency format
 * @param value - The string to validate
 * @returns True if valid BRL format
 */
export function isValidBRL(value: string): boolean {
  // Matches formats like: R$ 1.234,56 or 1.234,56 or 1234,56
  const brlRegex = /^R\$\s?\d{1,3}(\.\d{3})*(,\d{2})?$|^\d{1,3}(\.\d{3})*(,\d{2})?$/;
  return brlRegex.test(value.trim());
}

/**
 * Formats cents (integer) to Brazilian Real
 * Useful for databases that store currency as cents/centavos
 * @param cents - Value in cents (e.g., 12345 = R$ 123,45)
 * @returns Formatted currency string
 */
export function formatCentsAsBRL(cents: number): string {
  return formatBRL(cents / 100);
}

/**
 * Converts Brazilian Real to cents (integer)
 * Useful for storing currency in databases as integers
 * @param value - Value in BRL (e.g., 123.45)
 * @returns Value in cents (e.g., 12345)
 */
export function brlToCents(value: number): number {
  return Math.round(value * 100);
}

/**
 * Currency formatting presets for different contexts
 */
export const BRLPresets = {
  /** Compact format: R$ 1,2 mil */
  compact: (value: number) =>
    formatBRL(value, { notation: 'compact', compactDisplay: 'short' }),

  /** Accounting format with parentheses for negative: (R$ 123,45) */
  accounting: (value: number) =>
    formatBRL(value, { currencySign: 'accounting' }),

  /** No cents: R$ 1.234 */
  noCents: (value: number) =>
    formatBRL(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),

  /** Explicit sign: +R$ 123,45 or -R$ 123,45 */
  withSign: (value: number) =>
    formatBRL(value, { signDisplay: 'always' }),
} as const;

/**
 * Masks BRL input for real-time formatting in input fields
 * Useful for controlled input components that need to display formatted currency
 *
 * @param raw - Raw string input from user (e.g., "1234.56" or "R$ 1.234,56")
 * @returns Object with formatted string for display and numeric value for state
 *
 * @example
 * maskBRLInput("123456") // => { formatted: "R$ 1.234,56", value: 1234.56 }
 * maskBRLInput("R$ 1.234,56") // => { formatted: "R$ 1.234,56", value: 1234.56 }
 * maskBRLInput("abc") // => { formatted: "R$ 0,00", value: 0 }
 */
export function maskBRLInput(raw: string): { formatted: string; value: number } {
  // Remove all non-digit characters except comma and dot
  let cleaned = raw.replace(/[^\d,.-]/g, '');

  // Replace comma with dot for parsing (Brazilian format uses comma as decimal)
  cleaned = cleaned.replace(',', '.');

  // Parse to number
  const numericValue = Number.parseFloat(cleaned);
  const value = Number.isNaN(numericValue) ? 0 : numericValue;

  // Format for display
  const formatted = formatBRL(value);

  return { formatted, value };
}
