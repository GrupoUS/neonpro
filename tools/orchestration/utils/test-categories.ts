/**
 * Test Categories utility for orchestration tools
 * Defines test categories and related types
 */

export enum TestCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  QUALITY = 'quality',
}

export const TEST_CATEGORIES = {
  [TestCategory.FRONTEND]: TestCategory.FRONTEND,
  [TestCategory.BACKEND]: TestCategory.BACKEND,
  [TestCategory.DATABASE]: TestCategory.DATABASE,
  [TestCategory.QUALITY]: TestCategory.QUALITY,
} as const;

export type TestCategoryType = keyof typeof TEST_CATEGORIES;