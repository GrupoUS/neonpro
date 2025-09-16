/**
 * Local Test Categories for TDD Orchestration
 * Simplified test category definitions without external dependencies
 */

export type TestCategory = 'frontend' | 'backend' | 'database' | 'quality';

export type TDDPhase = 'red' | 'green' | 'refactor';

export interface TestCategoryConfig {
  name: TestCategory;
  packageName: string;
  description: string;
  phases: TDDPhase[];
  agents: string[];
  healthcareCompliance: boolean;
}

export const TEST_CATEGORIES: Record<TestCategory, TestCategoryConfig> = {
  frontend: {
    name: 'frontend',
    packageName: '@neonpro/tools-frontend-tests',
    description: 'Frontend React components, hooks, and UI tests',
    phases: ['red', 'green', 'refactor'],
    agents: ['code-reviewer', 'apex-ui-ux-designer'],
    healthcareCompliance: false,
  },
  backend: {
    name: 'backend',
    packageName: '@neonpro/tools-backend-tests',
    description: 'Backend API, business logic, and integration tests',
    phases: ['red', 'green', 'refactor'],
    agents: ['code-reviewer', 'security-auditor', 'apex-dev'],
    healthcareCompliance: true,
  },
  database: {
    name: 'database',
    packageName: '@neonpro/tools-database-tests',
    description: 'Database schema, RLS policies, and data compliance tests',
    phases: ['red', 'green', 'refactor'],
    agents: ['security-auditor', 'code-reviewer'],
    healthcareCompliance: true,
  },
  quality: {
    name: 'quality',
    packageName: '@neonpro/tools-quality-tests',
    description: 'Code quality, performance, and security tests',
    phases: ['green', 'refactor'], // No red phase for quality tests
    agents: ['code-reviewer', 'security-auditor', 'architect-review'],
    healthcareCompliance: true,
  },
};

export class TestCategoryManager {
  static getCategoryConfig(category: TestCategory): TestCategoryConfig {
    return TEST_CATEGORIES[category];
  }

  static getAllCategories(): TestCategory[] {
    return Object.keys(TEST_CATEGORIES) as TestCategory[];
  }

  static getHealthcareCategories(): TestCategory[] {
    return this.getAllCategories().filter(
      category => TEST_CATEGORIES[category].healthcareCompliance
    );
  }

  static generateTestCommand(category: TestCategory): string {
    const config = this.getCategoryConfig(category);
    return `pnpm --filter ${config.packageName} test`;
  }

  static getCategoryAgents(category: TestCategory): string[] {
    return TEST_CATEGORIES[category].agents;
  }

  static getCategoryPhases(category: TestCategory): TDDPhase[] {
    return TEST_CATEGORIES[category].phases;
  }
}