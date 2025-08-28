/**
 * Module-level regex constants for performance optimization
 * These patterns are compiled once and reused throughout the application
 */

// Route parameter pattern for dynamic route matching
export const ROUTE_PARAM_PATTERN = /:\w+/g;

// Common validation patterns
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// CORS patterns
export const CLINIC_SUBDOMAIN_PATTERN = /^https:\/\/[\w-]+\.neonpro\.health$/;
export const VERCEL_PRODUCTION_PATTERN = /^https:\/\/.*\.vercel\.app$/;
export const VERCEL_STAGING_PATTERN = /^https:\/\/.*-staging\.vercel\.app$/;
export const VERCEL_PREVIEW_PATTERN = /^https:\/\/.*\.vercel\.app$/;
export const LOCALHOST_PATTERN = /^https?:\/\/localhost:\d+$/;
export const LOCALHOST_IP_PATTERN = /^https?:\/\/127\.0\.0\.1:\d+$/;

// Security patterns
export const SENSITIVE_HEADERS_PATTERN =
  /^(authorization|cookie|x-api-key|x-auth-token)$/i;
export const SQL_INJECTION_PATTERN =
  /('|(\\%27)|(\\x27)|(\\')|(\\')|(;)|(%3B)|(\\%3B)|(\\x3B)|(\\\u003B)|(\\;))/iu;

// File extension patterns
export const IMAGE_EXTENSIONS_PATTERN = /\.(jpg|jpeg|png|gif|webp)$/i;
export const DOCUMENT_EXTENSIONS_PATTERN = /\.(pdf|doc|docx|txt)$/i;

// Brazilian specific patterns
export const CPF_PATTERN = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const CNPJ_PATTERN = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
export const PHONE_BR_PATTERN = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

// Audit and logging patterns
export const RESOURCE_ID_PATTERN = /\/([a-zA-Z0-9_-]+)(?:\/|$)/g;
export const LOG_LEVEL_PATTERN = /^(debug|info|warn|error)$/i;

/**
 * Helper function to create dynamic route regex patterns
 * @param pattern - Route pattern with parameters (e.g., "/users/:id")
 * @returns Compiled regex for route matching
 */
export function createRouteRegex(pattern: string): RegExp {
  const escapedPattern = pattern.replace(ROUTE_PARAM_PATTERN, "[^/]+");
  return new RegExp(`^${escapedPattern}$`);
}

/**
 * Helper function to validate email addresses
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

/**
 * Helper function to validate UUIDs
 * @param uuid - UUID to validate
 * @returns True if UUID is valid
 */
export function isValidUUID(uuid: string): boolean {
  return UUID_PATTERN.test(uuid);
}

/**
 * Helper function to extract resource ID from path
 * @param path - URL path
 * @returns Array of resource IDs found in path
 */
export function extractResourceIds(path: string): string[] {
  const matches = path.match(RESOURCE_ID_PATTERN);
  return matches ? matches.map((match) => match.replaceAll(/[/]/g, "")) : [];
}
