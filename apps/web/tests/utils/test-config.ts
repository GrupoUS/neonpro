/**
 * Test Configuration
 * Common configuration for all test files
 */

// Base URL for API tests - used to convert relative URLs to absolute
export const TEST_BASE_URL = 'http://localhost:3000';

/**
 * Convert relative URL to absolute URL for fetch requests in tests
 * @param url - Relative or absolute URL
 * @returns Absolute URL for fetch
 */
export function makeAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${TEST_BASE_URL}${url}`;
}

/**
 * Common test headers for authenticated requests
 */
export const TEST_AUTH_HEADERS = {
  Authorization: 'Bearer valid-test-token',
  'Content-Type': 'application/json',
};

/**
 * Common test timeouts
 */
export const TEST_TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 15000,
} as const;
