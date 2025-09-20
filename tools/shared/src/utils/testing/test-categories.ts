/**
 * Test Category Utilities
 * Shared utilities for organizing tests by categories
 */

export type TestCategory = "frontend" | "backend" | "database" | "quality";

export interface TestCategoryConfig {
  name: TestCategory;
  description: string;
  packageName: string;
  primaryAgent: string;
  supportAgents: string[];
  testTypes: string[];
  healthcareCompliance: boolean;
}

export const TEST_CATEGORIES: Record<TestCategory, TestCategoryConfig> = {
  frontend: {
    name: "frontend",
    description: "Frontend testing - React, E2E, Accessibility & Healthcare UI",
    packageName: "@neonpro/tools-frontend-tests",
    primaryAgent: "code-reviewer",
    supportAgents: ["architect-review", "test"],
    testTypes: [
      "components",
      "routes",
      "e2e",
      "accessibility",
      "healthcare-ui",
    ],
    healthcareCompliance: true,
  },
  backend: {
    name: "backend",
    description: "Backend testing - API, Integration, Monorepo & Middleware",
    packageName: "@neonpro/tools-backend-tests",
    primaryAgent: "architect-review",
    supportAgents: ["code-reviewer", "security-auditor"],
    testTypes: ["api", "integration", "middleware", "monorepo"],
    healthcareCompliance: true,
  },
  database: {
    name: "database",
    description: "Database testing - RLS, Security, Compliance & Migrations",
    packageName: "@neonpro/tools-database-tests",
    primaryAgent: "security-auditor",
    supportAgents: ["architect-review", "code-reviewer"],
    testTypes: ["rls", "security", "compliance", "migrations"],
    healthcareCompliance: true,
  },
  quality: {
    name: "quality",
    description: "Quality testing - Coverage, Performance, Audit & Monitoring",
    packageName: "@neonpro/tools-quality-tests",
    primaryAgent: "tdd-orchestrator",
    supportAgents: ["code-reviewer", "security-auditor", "architect-review"],
    testTypes: ["coverage", "performance", "audit", "monitoring"],
    healthcareCompliance: true,
  },
};

export class TestCategoryManager {
  static getCategoryConfig(category: TestCategory): TestCategoryConfig {
    return TEST_CATEGORIES[category];
  }

  static getAllCategories(): TestCategoryConfig[] {
    return Object.values(TEST_CATEGORIES);
  }

  static getCategoriesByAgent(agent: string): TestCategoryConfig[] {
    return Object.values(TEST_CATEGORIES).filter(
      (config) =>
        config.primaryAgent === agent || config.supportAgents.includes(agent),
    );
  }

  static getHealthcareComplianceCategories(): TestCategoryConfig[] {
    return Object.values(TEST_CATEGORIES).filter(
      (config) => config.healthcareCompliance,
    );
  }

  static generateTestCommand(
    category: TestCategory,
    testType?: string,
  ): string {
    const config = TEST_CATEGORIES[category];
    const baseCommand = `pnpm --filter ${config.packageName}`;

    if (testType && config.testTypes.includes(testType)) {
      return `${baseCommand} test:${testType}`;
    }

    return `${baseCommand} test`;
  }
}

export const TEST_PATTERNS = {
  frontend: {
    components: "**/*.test.{ts,tsx}",
    routes: "**/routes/**/*.test.{ts,tsx}",
    e2e: "**/*.spec.ts",
    accessibility: "**/*.a11y.test.{ts,tsx}",
    healthcareUi: "**/healthcare-ui/**/*.test.{ts,tsx}",
  },
  backend: {
    api: "**/api/**/*.test.ts",
    integration: "**/integration/**/*.test.ts",
    middleware: "**/middleware/**/*.test.ts",
    monorepo: "**/monorepo/**/*.test.ts",
  },
  database: {
    rls: "**/rls/**/*.test.ts",
    security: "**/security/**/*.test.ts",
    compliance: "**/compliance/**/*.test.ts",
    migrations: "**/migrations/**/*.test.ts",
  },
  quality: {
    coverage: "**/coverage/**/*.test.ts",
    performance: "**/performance/**/*.test.ts",
    audit: "**/audit/**/*.test.ts",
    monitoring: "**/monitoring/**/*.test.ts",
  },
};
