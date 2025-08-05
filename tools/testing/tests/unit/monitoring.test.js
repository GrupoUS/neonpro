Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var fs_1 = require("node:fs");
var path_1 = require("node:path");
(0, globals_1.describe)("TASK-001 Foundation Setup Verification", () => {
  var rootDir = path_1.default.join(__dirname, "../../");
  (0, globals_1.describe)("Monitoring Utilities", () => {
    (0, globals_1.it)("should have all required monitoring utility files", () => {
      var monitoringDir = path_1.default.join(rootDir, "lib/monitoring");
      var requiredFiles = [
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
        var filePath = path_1.default.join(monitoringDir, file);
        (0, globals_1.expect)(fs_1.default.existsSync(filePath)).toBe(true);
      });
    });
    (0, globals_1.it)("should have monitoring components", () => {
      var componentsDir = path_1.default.join(rootDir, "components/monitoring");
      var requiredComponents = [
        "FeatureFlagManager.tsx",
        "SystemHealthWidget.tsx",
        "performance-dashboard.tsx",
      ];
      requiredComponents.forEach((component) => {
        var componentPath = path_1.default.join(componentsDir, component);
        (0, globals_1.expect)(fs_1.default.existsSync(componentPath)).toBe(true);
      });
    });
    (0, globals_1.it)("should have monitoring API endpoints", () => {
      var apiDir = path_1.default.join(rootDir, "app/api/monitoring");
      var requiredEndpoints = ["health", "feature-flags", "metrics"];
      requiredEndpoints.forEach((endpoint) => {
        var endpointPath = path_1.default.join(apiDir, endpoint, "route.ts");
        (0, globals_1.expect)(fs_1.default.existsSync(endpointPath)).toBe(true);
      });
    });
  });
  (0, globals_1.describe)("Code Quality", () => {
    (0, globals_1.it)("should have TypeScript configuration", () => {
      var tsconfigPath = path_1.default.join(rootDir, "tsconfig.json");
      (0, globals_1.expect)(fs_1.default.existsSync(tsconfigPath)).toBe(true);
    });
    (0, globals_1.it)("should have ESLint configuration", () => {
      var eslintConfigPath = path_1.default.join(rootDir, ".eslintrc.json");
      (0, globals_1.expect)(fs_1.default.existsSync(eslintConfigPath)).toBe(true);
    });
    (0, globals_1.it)("should have package.json with required scripts", () => {
      var packageJsonPath = path_1.default.join(rootDir, "package.json");
      (0, globals_1.expect)(fs_1.default.existsSync(packageJsonPath)).toBe(true);
      var packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf8"));
      (0, globals_1.expect)(packageJson.scripts).toBeDefined();
      (0, globals_1.expect)(packageJson.scripts.dev).toBeDefined();
      (0, globals_1.expect)(packageJson.scripts.build).toBeDefined();
      (0, globals_1.expect)(packageJson.scripts.lint).toBeDefined();
    });
  });
  (0, globals_1.describe)("Testing Infrastructure", () => {
    (0, globals_1.it)("should have Jest configuration", () => {
      var jestConfigPath = path_1.default.join(rootDir, "jest.config.ts");
      (0, globals_1.expect)(fs_1.default.existsSync(jestConfigPath)).toBe(true);
    });
    (0, globals_1.it)("should have test setup files", () => {
      var testSetupPath = path_1.default.join(rootDir, "__tests__/setup.ts");
      (0, globals_1.expect)(fs_1.default.existsSync(testSetupPath)).toBe(true);
    });
  });
  (0, globals_1.describe)("Performance Monitoring", () => {
    (0, globals_1.it)("should have Sentry configuration files", () => {
      var sentryClientConfig = path_1.default.join(rootDir, "sentry.client.config.ts");
      var sentryServerConfig = path_1.default.join(rootDir, "sentry.server.config.ts");
      var sentryEdgeConfig = path_1.default.join(rootDir, "sentry.edge.config.ts");
      (0, globals_1.expect)(fs_1.default.existsSync(sentryClientConfig)).toBe(true);
      (0, globals_1.expect)(fs_1.default.existsSync(sentryServerConfig)).toBe(true);
      (0, globals_1.expect)(fs_1.default.existsSync(sentryEdgeConfig)).toBe(true);
    });
    (0, globals_1.it)("should have performance monitoring utilities", () => {
      var performanceDir = path_1.default.join(rootDir, "lib/performance");
      (0, globals_1.expect)(fs_1.default.existsSync(performanceDir)).toBe(true);
    });
  });
});
