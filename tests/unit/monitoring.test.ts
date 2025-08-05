import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";

describe("TASK-001 Foundation Setup Verification", () => {
  const rootDir = path.join(__dirname, "../../");

  describe("Monitoring Utilities", () => {
    it("should have all required monitoring utility files", () => {
      const monitoringDir = path.join(rootDir, "lib/monitoring");

      const requiredFiles = [
        "analytics.ts",
        "error-tracking.ts",
        "feature-flags.ts",
        "performance.ts",
        "baseline.ts",
        "emergency-response.ts",
        "index.ts",
        "performance-monitor.ts",
      ];

      requiredFiles.forEach((file) => {
        const filePath = path.join(monitoringDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it("should have monitoring components", () => {
      const componentsDir = path.join(rootDir, "components/monitoring");

      const requiredComponents = [
        "FeatureFlagManager.tsx",
        "SystemHealthWidget.tsx",
        "performance-dashboard.tsx",
      ];

      requiredComponents.forEach((component) => {
        const componentPath = path.join(componentsDir, component);
        expect(fs.existsSync(componentPath)).toBe(true);
      });
    });

    it("should have monitoring API endpoints", () => {
      const apiDir = path.join(rootDir, "app/api/monitoring");

      const requiredEndpoints = ["health", "feature-flags", "metrics"];

      requiredEndpoints.forEach((endpoint) => {
        const endpointPath = path.join(apiDir, endpoint, "route.ts");
        expect(fs.existsSync(endpointPath)).toBe(true);
      });
    });
  });

  describe("Code Quality", () => {
    it("should have TypeScript configuration", () => {
      const tsconfigPath = path.join(rootDir, "tsconfig.json");
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });

    it("should have ESLint configuration", () => {
      const eslintConfigPath = path.join(rootDir, ".eslintrc.json");
      expect(fs.existsSync(eslintConfigPath)).toBe(true);
    });

    it("should have package.json with required scripts", () => {
      const packageJsonPath = path.join(rootDir, "package.json");
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.lint).toBeDefined();
    });
  });

  describe("Testing Infrastructure", () => {
    it("should have Jest configuration", () => {
      const jestConfigPath = path.join(rootDir, "jest.config.ts");
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });

    it("should have test setup files", () => {
      const testSetupPath = path.join(rootDir, "__tests__/setup.ts");
      expect(fs.existsSync(testSetupPath)).toBe(true);
    });
  });

  describe("Performance Monitoring", () => {
    it("should have Sentry configuration files", () => {
      const sentryClientConfig = path.join(rootDir, "sentry.client.config.ts");
      const sentryServerConfig = path.join(rootDir, "sentry.server.config.ts");
      const sentryEdgeConfig = path.join(rootDir, "sentry.edge.config.ts");

      expect(fs.existsSync(sentryClientConfig)).toBe(true);
      expect(fs.existsSync(sentryServerConfig)).toBe(true);
      expect(fs.existsSync(sentryEdgeConfig)).toBe(true);
    });

    it("should have performance monitoring utilities", () => {
      const performanceDir = path.join(rootDir, "lib/performance");
      expect(fs.existsSync(performanceDir)).toBe(true);
    });
  });
});
