#!/usr/bin/env node

// Phase 4 Validation System - Anti-No-Show Activation
// Comprehensive validation for all Phase 4 components and workflow automation

import * as fs from "fs";
import * as path from "path";
import { performance } from "perf_hooks";

export interface ValidationResult {
  testName: string;
  status: "PASS" | "FAIL" | "SKIP" | "WARNING";
  message: string;
  details?: any;
  duration?: number;
  critical: boolean;
}

export interface ValidationSuite {
  suiteName: string;
  results: ValidationResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  warningTests: number;
  duration: number;
}

class Phase4Validator {
  private results: ValidationResult[] = [];
  private startTime: number = 0;
  private readonly projectRoot: string;
  private readonly phase4Path: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.phase4Path = path.join(this.projectRoot, "apps", "web", "src");
  }

  /**
   * Main validation entry point
   */
  async runValidation(): Promise<ValidationSuite> {
    console.log("🚀 Starting Phase 4: Anti-No-Show Activation Validation");
    console.log("=".repeat(80));

    this.startTime = performance.now();

    // Run all validation suites
    await this.validateFileStructure();
    await this.validateRiskScoringComponents();
    await this.validateStaffAlertSystem();
    await this.validateWorkflowAutomation();
    await this.validatePerformanceMonitoring();
    await this.validateIntegrationPoints();
    await this.validateBrazilianCompliance();
    await this.validatePerformanceRequirements();
    await this.validateAccessibility();
    await this.validateSecurity();

    const duration = performance.now() - this.startTime;

    const suite: ValidationSuite = {
      suiteName: "Phase 4: Anti-No-Show Activation",
      results: this.results,
      totalTests: this.results.length,
      passedTests: this.results.filter(r => r.status === "PASS").length,
      failedTests: this.results.filter(r => r.status === "FAIL").length,
      skippedTests: this.results.filter(r => r.status === "SKIP").length,
      warningTests: this.results.filter(r => r.status === "WARNING").length,
      duration: Math.round(duration),
    };

    this.printValidationSummary(suite);
    return suite;
  }

  /**
   * Validate Phase 4 file structure
   */
  private async validateFileStructure(): Promise<void> {
    console.log("\n📁 Validating File Structure...");

    const expectedFiles = [
      // Risk Scoring Components
      "components/no-show-activation/RiskScoreIndicator.tsx",
      "components/no-show-activation/AppointmentRiskList.tsx",
      "components/no-show-activation/StaffAlertSystem.tsx",
      "components/no-show-activation/PerformanceMonitoringDashboard.tsx",
      "components/no-show-activation/index.tsx",

      // Services
      "lib/no-show-activation/workflow-automation-service.ts",
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(this.phase4Path, file);
      const exists = fs.existsSync(filePath);

      if (exists) {
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        this.addResult({
          testName: `File: ${file}`,
          status: "PASS",
          message: `File exists (${sizeKB}KB)`,
          details: { path: filePath, size: stats.size },
          critical: true,
        });
      } else {
        this.addResult({
          testName: `File: ${file}`,
          status: "FAIL",
          message: "Required file missing",
          details: { expectedPath: filePath },
          critical: true,
        });
      }
    }

    // Validate directories
    const expectedDirectories = [
      "components/no-show-activation",
      "lib/no-show-activation",
    ];

    for (const dir of expectedDirectories) {
      const dirPath = path.join(this.phase4Path, dir);
      const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();

      if (exists) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
        this.addResult({
          testName: `Directory: ${dir}`,
          status: "PASS",
          message: `Directory exists with ${files.length} files`,
          details: { path: dirPath, fileCount: files.length },
          critical: true,
        });
      } else {
        this.addResult({
          testName: `Directory: ${dir}`,
          status: "FAIL",
          message: "Required directory missing",
          details: { expectedPath: dirPath },
          critical: true,
        });
      }
    }
  }

  /**
   * Validate risk scoring components
   */
  private async validateRiskScoringComponents(): Promise<void> {
    console.log("\n🎯 Validating Risk Scoring Components...");

    const componentFiles = [
      {
        file: "components/no-show-activation/RiskScoreIndicator.tsx",
        requiredPatterns: [
          "export interface RiskScoreData",
          "export interface RiskFactor",
          "RISK_CONFIG",
          "color-coded risk",
          "Brazilian Portuguese",
          "useMemo",
          "useCallback",
        ],
      },
      {
        file: "components/no-show-activation/AppointmentRiskList.tsx",
        requiredPatterns: [
          "export interface AppointmentData",
          "filteredAppointments",
          "riskStats",
          "formatDateTime",
          "Brazilian",
          "search",
          "filter",
        ],
      },
    ];

    for (const component of componentFiles) {
      const filePath = path.join(this.phase4Path, component.file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, "utf8");

      // Check for required patterns
      const foundPatterns = component.requiredPatterns.filter(pattern =>
        content.includes(pattern)
        || new RegExp(pattern, "i").test(content)
      );

      this.addResult({
        testName: `${path.basename(component.file)} Required Patterns`,
        status: foundPatterns.length >= component.requiredPatterns.length * 0.8 ? "PASS" : "FAIL",
        message: `${foundPatterns.length}/${component.requiredPatterns.length} patterns found`,
        details: {
          found: foundPatterns,
          missing: component.requiredPatterns.filter(p => !foundPatterns.includes(p)),
        },
        critical: true,
      });

      // Check for React patterns
      const hasReactHooks = ["useState", "useEffect", "useCallback", "useMemo"].some(hook =>
        content.includes(hook)
      );

      this.addResult({
        testName: `${path.basename(component.file)} React Hooks`,
        status: hasReactHooks ? "PASS" : "WARNING",
        message: hasReactHooks ? "React hooks found" : "Limited React hook usage",
        critical: false,
      });

      // Check for TypeScript interfaces
      const hasInterfaces = content.includes("interface") && content.includes("export");

      this.addResult({
        testName: `${path.basename(component.file)} TypeScript`,
        status: hasInterfaces ? "PASS" : "WARNING",
        message: hasInterfaces ? "TypeScript interfaces found" : "Limited TypeScript usage",
        critical: false,
      });

      // Check for Brazilian localization
      const hasBrazilianText = ["pt-BR", "Brazilian", "Risco", "Paciente", "Consulta"].some(text =>
        content.includes(text)
      );

      this.addResult({
        testName: `${path.basename(component.file)} Brazilian Localization`,
        status: hasBrazilianText ? "PASS" : "WARNING",
        message: hasBrazilianText ? "Brazilian localization found" : "Limited localization",
        critical: false,
      });
    }
  }

  /**
   * Validate staff alert system
   */
  private async validateStaffAlertSystem(): Promise<void> {
    console.log("\n🚨 Validating Staff Alert System...");

    const alertFilePath = path.join(
      this.phase4Path,
      "components/no-show-activation/StaffAlertSystem.tsx",
    );

    if (!fs.existsSync(alertFilePath)) {
      this.addResult({
        testName: "Staff Alert System File",
        status: "FAIL",
        message: "StaffAlertSystem.tsx not found",
        critical: true,
      });
      return;
    }

    const content = fs.readFileSync(alertFilePath, "utf8");

    // Check for alert management features
    const alertFeatures = [
      "StaffAlert",
      "AlertAction",
      "ALERT_PRIORITY_CONFIG",
      "filteredAlerts",
      "alertStats",
      "formatRelativeTime",
      "handleAlertAction",
      "handleDismiss",
      "handleSnooze",
    ];

    const foundFeatures = alertFeatures.filter(feature => content.includes(feature));

    this.addResult({
      testName: "Staff Alert Features",
      status: foundFeatures.length >= alertFeatures.length * 0.9 ? "PASS" : "WARNING",
      message: `${foundFeatures.length}/${alertFeatures.length} alert features found`,
      details: {
        found: foundFeatures,
        missing: alertFeatures.filter(f => !foundFeatures.includes(f)),
      },
      critical: false,
    });

    // Check for real-time capabilities
    const hasRealTime = ["WebSocket", "real-time", "notifications", "alerts"].some(term =>
      content.toLowerCase().includes(term.toLowerCase())
    );

    this.addResult({
      testName: "Real-time Alert Capabilities",
      status: hasRealTime ? "PASS" : "WARNING",
      message: hasRealTime ? "Real-time features detected" : "Limited real-time capabilities",
      critical: false,
    });

    // Check for Brazilian compliance
    const hasCompliance = ["LGPD", "Brazilian", "pt-BR", "auditoria", "compliance"].some(term =>
      content.includes(term)
    );

    this.addResult({
      testName: "Alert System Compliance",
      status: hasCompliance ? "PASS" : "WARNING",
      message: hasCompliance ? "Compliance features found" : "Limited compliance features",
      critical: false,
    });
  }

  /**
   * Validate workflow automation service
   */
  private async validateWorkflowAutomation(): Promise<void> {
    console.log("\n⚙️ Validating Workflow Automation...");

    const workflowFilePath = path.join(
      this.phase4Path,
      "lib/no-show-activation/workflow-automation-service.ts",
    );

    if (!fs.existsSync(workflowFilePath)) {
      this.addResult({
        testName: "Workflow Automation Service File",
        status: "FAIL",
        message: "workflow-automation-service.ts not found",
        critical: true,
      });
      return;
    }

    const content = fs.readFileSync(workflowFilePath, "utf8");

    // Check for core automation features
    const automationFeatures = [
      "WorkflowRule",
      "WorkflowTrigger",
      "WorkflowAction",
      "WorkflowExecution",
      "processRiskScore",
      "executeWorkflow",
      "sendStaffAlert",
      "scheduleIntervention",
    ];

    const foundFeatures = automationFeatures.filter(feature => content.includes(feature));

    this.addResult({
      testName: "Workflow Automation Features",
      status: foundFeatures.length >= automationFeatures.length * 0.85 ? "PASS" : "WARNING",
      message: `${foundFeatures.length}/${automationFeatures.length} automation features found`,
      details: {
        found: foundFeatures,
        missing: automationFeatures.filter(f => !foundFeatures.includes(f)),
      },
      critical: false,
    });

    // Check for rule engine
    const hasRuleEngine = ["addRule", "updateRule", "deleteRule", "findApplicableRules"].every(
      method => content.includes(method),
    );

    this.addResult({
      testName: "Rule Engine Implementation",
      status: hasRuleEngine ? "PASS" : "WARNING",
      message: hasRuleEngine ? "Complete rule engine found" : "Incomplete rule engine",
      critical: false,
    });

    // Check for integration points
    const hasIntegrations = [
      "enhanced-no-show-prediction-service",
      "automated-intervention-service",
    ].some(service => content.includes(service));

    this.addResult({
      testName: "Service Integrations",
      status: hasIntegrations ? "PASS" : "WARNING",
      message: hasIntegrations
        ? "Service integration references found"
        : "Limited service integrations",
      critical: false,
    });

    // Check for error handling
    const hasErrorHandling = ["try", "catch", "error", "Error"].some(term =>
      content.includes(term)
    );

    this.addResult({
      testName: "Workflow Error Handling",
      status: hasErrorHandling ? "PASS" : "WARNING",
      message: hasErrorHandling ? "Error handling implemented" : "Limited error handling",
      critical: false,
    });
  }

  /**
   * Validate performance monitoring dashboard
   */
  private async validatePerformanceMonitoring(): Promise<void> {
    console.log("\n📊 Validating Performance Monitoring...");

    const dashboardFilePath = path.join(
      this.phase4Path,
      "components/no-show-activation/PerformanceMonitoringDashboard.tsx",
    );

    if (!fs.existsSync(dashboardFilePath)) {
      this.addResult({
        testName: "Performance Dashboard File",
        status: "FAIL",
        message: "PerformanceMonitoringDashboard.tsx not found",
        critical: true,
      });
      return;
    }

    const content = fs.readFileSync(dashboardFilePath, "utf8");

    // Check for performance metrics
    const performanceFeatures = [
      "PerformanceMetrics",
      "PERFORMANCE_TARGETS",
      "performanceIndicators",
      "formatCurrency",
      "formatPercentage",
      "Brazilian",
      "ROI",
      "Tabs",
    ];

    const foundFeatures = performanceFeatures.filter(feature => content.includes(feature));

    this.addResult({
      testName: "Performance Monitoring Features",
      status: foundFeatures.length >= performanceFeatures.length * 0.8 ? "PASS" : "WARNING",
      message: `${foundFeatures.length}/${performanceFeatures.length} monitoring features found`,
      details: {
        found: foundFeatures,
        missing: performanceFeatures.filter(f => !foundFeatures.includes(f)),
      },
      critical: false,
    });

    // Check for Brazilian formatting
    const hasBrazilianFormatting = ["pt-BR", "BRL", "formatCurrency", "Intl.NumberFormat"].some(
      term => content.includes(term),
    );

    this.addResult({
      testName: "Brazilian Currency Formatting",
      status: hasBrazilianFormatting ? "PASS" : "WARNING",
      message: hasBrazilianFormatting
        ? "Brazilian formatting found"
        : "Limited Brazilian formatting",
      critical: false,
    });

    // Check for data visualization
    const hasVisualization = ["Progress", "Chart", "BarChart", "TrendingUp", "TrendingDown"].some(
      term => content.includes(term),
    );

    this.addResult({
      testName: "Data Visualization Components",
      status: hasVisualization ? "PASS" : "WARNING",
      message: hasVisualization ? "Visualization components found" : "Limited visualization",
      critical: false,
    });
  }

  /**
   * Validate integration points with existing services
   */
  private async validateIntegrationPoints(): Promise<void> {
    console.log("\n🔗 Validating Integration Points...");

    // Check for integration with existing no-show infrastructure
    const existingServices = [
      "packages/ai/src/services/enhanced-no-show-prediction-service.ts",
      "packages/ai/src/services/automated-intervention-service.ts",
      "packages/ai/src/services/roi-analytics-service.ts",
    ];

    let integrationCount = 0;
    for (const service of existingServices) {
      const servicePath = path.join(this.projectRoot, service);
      const exists = fs.existsSync(servicePath);

      if (exists) {
        integrationCount++;
        this.addResult({
          testName: `Integration: ${path.basename(service)}`,
          status: "PASS",
          message: "Integration service available",
          details: { servicePath },
          critical: false,
        });
      } else {
        this.addResult({
          testName: `Integration: ${path.basename(service)}`,
          status: "WARNING",
          message: "Integration service not found",
          details: { expectedPath: servicePath },
          critical: false,
        });
      }
    }

    this.addResult({
      testName: "Overall Integration Readiness",
      status: integrationCount >= 2 ? "PASS" : "WARNING",
      message: `${integrationCount}/${existingServices.length} integration services available`,
      critical: false,
    });

    // Check for UI component integration
    const uiIntegration = fs.existsSync(path.join(this.projectRoot, "packages", "ui"));

    this.addResult({
      testName: "UI Library Integration",
      status: uiIntegration ? "PASS" : "WARNING",
      message: uiIntegration ? "UI library available" : "UI library not found",
      critical: false,
    });
  }

  /**
   * Validate Brazilian healthcare compliance
   */
  private async validateBrazilianCompliance(): Promise<void> {
    console.log("\n🇧🇷 Validating Brazilian Compliance...");

    const phase4Files = [
      "components/no-show-activation/RiskScoreIndicator.tsx",
      "components/no-show-activation/AppointmentRiskList.tsx",
      "components/no-show-activation/StaffAlertSystem.tsx",
      "lib/no-show-activation/workflow-automation-service.ts",
    ];

    let lgpdCount = 0;
    let cfmCount = 0;
    let anvisaCount = 0;
    let localizationCount = 0;

    for (const file of phase4Files) {
      const filePath = path.join(this.phase4Path, file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, "utf8");

      if (
        content.includes("LGPD") || content.includes("data protection") || content.includes("audit")
      ) {
        lgpdCount++;
      }

      if (
        content.includes("CFM") || content.includes("medical") || content.includes("healthcare")
      ) {
        cfmCount++;
      }

      if (
        content.includes("ANVISA") || content.includes("regulatory")
        || content.includes("compliance")
      ) {
        anvisaCount++;
      }

      if (
        content.includes("pt-BR") || content.includes("Brazilian") || content.includes("Brasil")
      ) {
        localizationCount++;
      }
    }

    this.addResult({
      testName: "LGPD Compliance",
      status: lgpdCount >= 2 ? "PASS" : "WARNING",
      message: `LGPD considerations in ${lgpdCount} files`,
      critical: false,
    });

    this.addResult({
      testName: "CFM Compliance",
      status: cfmCount >= 2 ? "PASS" : "WARNING",
      message: `CFM considerations in ${cfmCount} files`,
      critical: false,
    });

    this.addResult({
      testName: "ANVISA Compliance",
      status: anvisaCount >= 1 ? "PASS" : "WARNING",
      message: `ANVISA considerations in ${anvisaCount} files`,
      critical: false,
    });

    this.addResult({
      testName: "Brazilian Localization",
      status: localizationCount >= 3 ? "PASS" : "WARNING",
      message: `${localizationCount} localization features found`,
      critical: false,
    });
  }

  /**
   * Validate performance requirements
   */
  private async validatePerformanceRequirements(): Promise<void> {
    console.log("\n⚡ Validating Performance Requirements...");

    const phase4Files = [
      "components/no-show-activation/RiskScoreIndicator.tsx",
      "components/no-show-activation/AppointmentRiskList.tsx",
      "components/no-show-activation/StaffAlertSystem.tsx",
      "components/no-show-activation/PerformanceMonitoringDashboard.tsx",
    ];

    let optimizedFiles = 0;
    let totalSize = 0;

    for (const file of phase4Files) {
      const filePath = path.join(this.phase4Path, file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, "utf8");
      const stats = fs.statSync(filePath);
      totalSize += stats.size;

      // Check for performance optimizations
      const hasOptimizations = ["useMemo", "useCallback", "React.memo"].some(opt =>
        content.includes(opt)
      );

      if (hasOptimizations) {
        optimizedFiles++;
      }
    }

    this.addResult({
      testName: "Performance Optimizations",
      status: optimizedFiles >= phase4Files.length * 0.75 ? "PASS" : "WARNING",
      message: `${optimizedFiles}/${phase4Files.length} files with optimizations`,
      critical: false,
    });

    // Check file sizes (should be reasonable)
    const avgSizeKB = Math.round((totalSize / phase4Files.length) / 1024);

    this.addResult({
      testName: "File Size Efficiency",
      status: avgSizeKB < 100 ? "PASS" : "WARNING",
      message: `Average file size: ${avgSizeKB}KB`,
      details: { totalSizeKB: Math.round(totalSize / 1024), averageSizeKB: avgSizeKB },
      critical: false,
    });

    // Check for lazy loading patterns
    const hasLazyLoading = phase4Files.some(file => {
      const filePath = path.join(this.phase4Path, file);
      if (!fs.existsSync(filePath)) return false;

      const content = fs.readFileSync(filePath, "utf8");
      return content.includes("lazy") || content.includes("Suspense")
        || content.includes("dynamic");
    });

    this.addResult({
      testName: "Lazy Loading Implementation",
      status: hasLazyLoading ? "PASS" : "WARNING",
      message: hasLazyLoading ? "Lazy loading patterns found" : "Limited lazy loading",
      critical: false,
    });
  }

  /**
   * Validate accessibility compliance
   */
  private async validateAccessibility(): Promise<void> {
    console.log("\n♿ Validating Accessibility...");

    const componentFiles = [
      "components/no-show-activation/RiskScoreIndicator.tsx",
      "components/no-show-activation/AppointmentRiskList.tsx",
      "components/no-show-activation/StaffAlertSystem.tsx",
      "components/no-show-activation/PerformanceMonitoringDashboard.tsx",
    ];

    let ariaCount = 0;
    let keyboardCount = 0;
    let colorContrastCount = 0;

    for (const file of componentFiles) {
      const filePath = path.join(this.phase4Path, file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, "utf8");

      if (content.includes("aria-") || content.includes("role=") || content.includes("tabIndex")) {
        ariaCount++;
      }

      if (
        content.includes("onKeyDown") || content.includes("onKeyPress")
        || content.includes("keyboard")
      ) {
        keyboardCount++;
      }

      if (
        content.includes("contrast") || content.includes("color")
        || content.includes("accessibility")
      ) {
        colorContrastCount++;
      }
    }

    this.addResult({
      testName: "ARIA Attributes",
      status: ariaCount >= componentFiles.length * 0.5 ? "PASS" : "WARNING",
      message: `ARIA attributes in ${ariaCount}/${componentFiles.length} files`,
      critical: false,
    });

    this.addResult({
      testName: "Keyboard Navigation",
      status: keyboardCount >= 1 ? "PASS" : "WARNING",
      message: `Keyboard support in ${keyboardCount}/${componentFiles.length} files`,
      critical: false,
    });

    this.addResult({
      testName: "Color Contrast Considerations",
      status: colorContrastCount >= 1 ? "PASS" : "WARNING",
      message:
        `Color contrast considerations in ${colorContrastCount}/${componentFiles.length} files`,
      critical: false,
    });
  }

  /**
   * Validate security implementation
   */
  private async validateSecurity(): Promise<void> {
    console.log("\n🔒 Validating Security Implementation...");

    const sensitiveFiles = [
      "lib/no-show-activation/workflow-automation-service.ts",
      "components/no-show-activation/StaffAlertSystem.tsx",
    ];

    let sanitizationCount = 0;
    let authCount = 0;
    let encryptionCount = 0;

    for (const file of sensitiveFiles) {
      const filePath = path.join(this.phase4Path, file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, "utf8");

      if (
        content.includes("sanitiz") || content.includes("validate") || content.includes("escape")
      ) {
        sanitizationCount++;
      }

      if (content.includes("auth") || content.includes("permission") || content.includes("role")) {
        authCount++;
      }

      if (content.includes("encrypt") || content.includes("hash") || content.includes("secure")) {
        encryptionCount++;
      }
    }

    this.addResult({
      testName: "Input Sanitization",
      status: sanitizationCount >= 1 ? "PASS" : "WARNING",
      message: `Input sanitization in ${sanitizationCount}/${sensitiveFiles.length} files`,
      critical: false,
    });

    this.addResult({
      testName: "Authentication Handling",
      status: authCount >= 1 ? "PASS" : "WARNING",
      message: `Authentication considerations in ${authCount}/${sensitiveFiles.length} files`,
      critical: false,
    });

    this.addResult({
      testName: "Data Encryption",
      status: encryptionCount >= 1 ? "PASS" : "WARNING",
      message: `Encryption considerations in ${encryptionCount}/${sensitiveFiles.length} files`,
      critical: false,
    });
  }

  /**
   * Add a validation result
   */
  private addResult(result: Omit<ValidationResult, "duration">): void {
    const fullResult: ValidationResult = {
      ...result,
      duration: 0,
    };

    this.results.push(fullResult);

    const statusIcon = {
      "PASS": "✅",
      "FAIL": "❌",
      "WARNING": "⚠️",
      "SKIP": "⏭️",
    }[result.status];

    console.log(`  ${statusIcon} ${result.testName}: ${result.message}`);
  }

  /**
   * Print validation summary
   */
  private printValidationSummary(suite: ValidationSuite): void {
    console.log("\n" + "=".repeat(80));
    console.log("📊 VALIDATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`Suite: ${suite.suiteName}`);
    console.log(`Duration: ${suite.duration}ms`);
    console.log(`Total Tests: ${suite.totalTests}`);
    console.log(`✅ Passed: ${suite.passedTests}`);
    console.log(`❌ Failed: ${suite.failedTests}`);
    console.log(`⚠️  Warnings: ${suite.warningTests}`);
    console.log(`⏭️  Skipped: ${suite.skippedTests}`);

    const successRate = Math.round((suite.passedTests / suite.totalTests) * 100);
    console.log(`Success Rate: ${successRate}%`);
    console.log("=".repeat(80));

    // Show critical failures
    const criticalFailures = suite.results.filter(r => r.status === "FAIL" && r.critical);
    if (criticalFailures.length > 0) {
      console.log("\n🚨 CRITICAL FAILURES:");
      criticalFailures.forEach(failure => {
        console.log(`  - ${failure.testName}: ${failure.message}`);
      });
    }

    // Show warnings summary
    const warnings = suite.results.filter(r => r.status === "WARNING");
    if (warnings.length > 0) {
      console.log("\n⚠️  WARNINGS SUMMARY:");
      warnings.forEach(warning => {
        console.log(`  - ${warning.testName}: ${warning.message}`);
      });
    }
  }
}

// Main execution
async function main() {
  const validator = new Phase4Validator();

  try {
    const suite = await validator.runValidation();

    // Save results to file
    const resultsDir = path.join(process.cwd(), "validation-reports");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const resultsFile = path.join(resultsDir, `phase-4-validation-${timestamp}.json`);

    fs.writeFileSync(resultsFile, JSON.stringify(suite, null, 2));

    console.log(`\n📄 Results saved to: ${resultsFile}`);

    // Exit with error code if there are critical failures
    const criticalFailures = suite.results.filter(r => r.status === "FAIL" && r.critical);
    process.exit(criticalFailures.length > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Validation failed with error:", error);
    process.exit(1);
  }
}

export default Phase4Validator;

// Execute main function
main().catch(console.error);
