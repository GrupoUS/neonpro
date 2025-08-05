"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
describe("TASK-001 Foundation Setup Verification", function () {
  var rootDir = path_1.default.join(__dirname, "../../");
  describe("Monitoring Utilities", function () {
    test("should have all required monitoring utility files", function () {
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
      requiredFiles.forEach(function (file) {
        var filePath = path_1.default.join(monitoringDir, file);
        expect(fs_1.default.existsSync(filePath)).toBe(true);
      });
    });
    test("should have monitoring components", function () {
      var componentsDir = path_1.default.join(rootDir, "components/monitoring");
      var requiredComponents = [
        "FeatureFlagManager.tsx",
        "SystemHealthWidget.tsx",
        "performance-dashboard.tsx",
      ];
      requiredComponents.forEach(function (component) {
        var componentPath = path_1.default.join(componentsDir, component);
        expect(fs_1.default.existsSync(componentPath)).toBe(true);
      });
    });
    test("should have monitoring API endpoints", function () {
      var apiDir = path_1.default.join(rootDir, "app/api/monitoring");
      var requiredEndpoints = ["health", "feature-flags", "metrics"];
      requiredEndpoints.forEach(function (endpoint) {
        var endpointPath = path_1.default.join(apiDir, endpoint, "route.ts");
        expect(fs_1.default.existsSync(endpointPath)).toBe(true);
      });
    });
  });
});
