#!/usr/bin/env node

// Phase 3.5 Validation System - AI-Powered Healthcare Analytics & Predictive Intelligence
// Comprehensive validation for all Phase 3.5 components and services

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

class Phase35Validator {
  private results: ValidationResult[] = [];
  private startTime: number = 0;
  private readonly projectRoot: string;
  private readonly phase35Path: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.phase35Path = path.join(this.projectRoot, "apps", "web", "src");
  }

  /**
   * Main validation entry point
   */
  async runValidation(): Promise<ValidationSuite> {
    console.log("🚀 Starting Phase 3.5: AI-Powered Healthcare Analytics Validation");
    console.log("=".repeat(80));

    this.startTime = performance.now();

    // Run all validation suites
    await this.validateFileStructure();
    await this.validateTypeDefinitions();
    await this.validateAnalyticsComponents();
    await this.validateAnalyticsServices();
    await this.validateIntegrationPoints();
    await this.validateBrazilianCompliance();
    await this.validatePerformanceRequirements();
    await this.validateAccessibility();
    await this.validateSecurityImplementation();

    const endTime = performance.now();
    const duration = endTime - this.startTime;

    return this.generateSuiteReport(duration);
  }

  /**
   * Validate Phase 3.5 file structure and organization
   */
  private async validateFileStructure(): Promise<void> {
    console.log("\n📁 Validating File Structure...");

    const requiredFiles = [
      // Type definitions
      "types/analytics.ts",

      // Components
      "components/analytics/AIAnalyticsDashboard.tsx",
      "components/analytics/PredictivePatientIntelligence.tsx",
      "components/analytics/RealTimeHealthMonitor.tsx",
      "components/analytics/BrazilianHealthcareIntelligence.tsx",
      "components/analytics/index.tsx",

      // Services
      "lib/analytics/ai-analytics-service.ts",
      "lib/analytics/predictive-patient-service.ts",
      "lib/analytics/real-time-monitoring-service.ts",
      "lib/analytics/brazilian-healthcare-intelligence-service.ts",
      "lib/analytics/index.ts",
    ];

    for (const file of requiredFiles) {
      await this.validateFile(file, true);
    }

    // Validate directory structure
    const requiredDirectories = [
      "components/analytics",
      "lib/analytics",
    ];

    for (const dir of requiredDirectories) {
      await this.validateDirectory(dir);
    }
  }

  /**
   * Validate TypeScript type definitions
   */
  private async validateTypeDefinitions(): Promise<void> {
    console.log("\n🔧 Validating Type Definitions...");

    try {
      const typesFile = path.join(this.phase35Path, "types", "analytics.ts");

      if (!fs.existsSync(typesFile)) {
        this.addResult("Type Definitions", "FAIL", "analytics.ts types file not found", {}, true);
        return;
      }

      const content = fs.readFileSync(typesFile, "utf8");

      // Check for essential Phase 3.5 types
      const requiredTypes = [
        "PredictivePatientIntelligence",
        "AIAnalyticsDashboard",
        "RealTimeHealthMetrics",
        "BrazilianHealthcareIntelligence",
        "HealthRiskFactor",
        "PredictedHealthOutcome",
        "EmergencyHealthAlert",
        "ComplianceHealthStatus",
        "MarketPosition",
        "PerformanceBenchmark",
      ];

      const missingTypes = requiredTypes.filter(type =>
        !content.includes(`interface ${type}`) && !content.includes(`type ${type}`)
      );

      if (missingTypes.length === 0) {
        this.addResult("Type Definitions", "PASS", "All required types are defined");
      } else {
        this.addResult("Type Definitions", "FAIL", `Missing types: ${missingTypes.join(", ")}`, {
          missingTypes,
        }, true);
      }

      // Validate type guards
      const requiredTypeGuards = [
        "isPredictivePatientIntelligence",
        "isRealTimeHealthMetrics",
        "isAIAnalyticsDashboard",
      ];

      const missingTypeGuards = requiredTypeGuards.filter(guard => !content.includes(guard));

      if (missingTypeGuards.length === 0) {
        this.addResult("Type Guards", "PASS", "All required type guards are defined");
      } else {
        this.addResult(
          "Type Guards",
          "WARNING",
          `Missing type guards: ${missingTypeGuards.join(", ")}`,
          { missingTypeGuards },
        );
      }
    } catch (error) {
      this.addResult("Type Definitions", "FAIL", `Error validating types: ${error.message}`, {
        error,
      }, true);
    }
  }

  /**
   * Validate analytics components
   */
  private async validateAnalyticsComponents(): Promise<void> {
    console.log("\n🎨 Validating Analytics Components...");

    const components = [
      {
        name: "AIAnalyticsDashboard",
        file: "components/analytics/AIAnalyticsDashboard.tsx",
        requiredProps: ["clinicId", "dashboardType"],
        requiredFeatures: ["KPI display", "real-time updates", "Brazilian localization"],
      },
      {
        name: "PredictivePatientIntelligence",
        file: "components/analytics/PredictivePatientIntelligence.tsx",
        requiredProps: ["patientId", "clinicId"],
        requiredFeatures: ["risk analysis", "treatment recommendations", "personalized offers"],
      },
      {
        name: "RealTimeHealthMonitor",
        file: "components/analytics/RealTimeHealthMonitor.tsx",
        requiredProps: ["clinicId"],
        requiredFeatures: ["real-time metrics", "emergency alerts", "compliance monitoring"],
      },
      {
        name: "BrazilianHealthcareIntelligence",
        file: "components/analytics/BrazilianHealthcareIntelligence.tsx",
        requiredProps: ["clinicId", "region"],
        requiredFeatures: ["regulatory updates", "market analysis", "competitor insights"],
      },
    ];

    for (const component of components) {
      await this.validateComponent(component);
    }

    // Validate component exports
    await this.validateComponentIndex();
  }

  /**
   * Validate analytics services
   */
  private async validateAnalyticsServices(): Promise<void> {
    console.log("\n⚙️ Validating Analytics Services...");

    const services = [
      {
        name: "AIAnalyticsService",
        file: "lib/analytics/ai-analytics-service.ts",
        requiredMethods: ["getDashboardData", "getRealTimeMetrics", "generatePredictiveInsights"],
        singleton: "aiAnalyticsService",
      },
      {
        name: "PredictivePatientService",
        file: "lib/analytics/predictive-patient-service.ts",
        requiredMethods: [
          "generatePatientIntelligence",
          "analyzeHealthRisks",
          "recommendTreatments",
        ],
        singleton: "predictivePatientService",
      },
      {
        name: "RealTimeMonitoringService",
        file: "lib/analytics/real-time-monitoring-service.ts",
        requiredMethods: ["startMonitoring", "stopMonitoring", "onMetricsUpdate", "onAlert"],
        singleton: "realTimeMonitoringService",
      },
      {
        name: "BrazilianHealthcareIntelligenceService",
        file: "lib/analytics/brazilian-healthcare-intelligence-service.ts",
        requiredMethods: [
          "getHealthcareIntelligence",
          "fetchRegulatoryUpdates",
          "analyzeMarketPosition",
        ],
        singleton: "brazilianHealthcareIntelligenceService",
      },
    ];

    for (const service of services) {
      await this.validateService(service);
    }

    // Validate service orchestrator
    await this.validateServiceOrchestrator();
  }

  /**
   * Validate integration points
   */
  private async validateIntegrationPoints(): Promise<void> {
    console.log("\n🔗 Validating Integration Points...");

    // Validate Supabase integration
    await this.validateSupabaseIntegration();

    // Validate API client integration
    await this.validateAPIIntegration();

    // Validate state management integration
    await this.validateStateIntegration();

    // Validate UI component integration
    await this.validateUIIntegration();
  }

  /**
   * Validate Brazilian compliance features
   */
  private async validateBrazilianCompliance(): Promise<void> {
    console.log("\n🇧🇷 Validating Brazilian Compliance...");

    // Check LGPD compliance features
    await this.validateLGPDCompliance();

    // Check ANVISA compliance features
    await this.validateANVISACompliance();

    // Check CFM compliance features
    await this.validateCFMCompliance();

    // Check Brazilian localization
    await this.validateBrazilianLocalization();
  }

  /**
   * Validate performance requirements
   */
  private async validatePerformanceRequirements(): Promise<void> {
    console.log("\n⚡ Validating Performance Requirements...");

    // Check file sizes
    await this.validateFileSizes();

    // Check import structure
    await this.validateImportStructure();

    // Check for performance optimizations
    await this.validatePerformanceOptimizations();
  }

  /**
   * Validate accessibility compliance
   */
  private async validateAccessibility(): Promise<void> {
    console.log("\n♿ Validating Accessibility...");

    // Check for ARIA attributes usage
    await this.validateARIAUsage();

    // Check for keyboard navigation
    await this.validateKeyboardNavigation();

    // Check for color contrast considerations
    await this.validateColorContrast();
  }

  /**
   * Validate security implementation
   */
  private async validateSecurityImplementation(): Promise<void> {
    console.log("\n🔒 Validating Security Implementation...");

    // Check for input sanitization
    await this.validateInputSanitization();

    // Check for authentication handling
    await this.validateAuthenticationHandling();

    // Check for data encryption considerations
    await this.validateDataEncryption();
  }

  /**
   * Helper validation methods
   */
  private async validateFile(filePath: string, critical: boolean = false): Promise<void> {
    const fullPath = path.join(this.phase35Path, filePath);

    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const sizeKB = Math.round(stats.size / 1024);
      this.addResult(
        `File: ${filePath}`,
        "PASS",
        `File exists (${sizeKB}KB)`,
        { path: fullPath, size: stats.size },
        critical,
      );
    } else {
      this.addResult(
        `File: ${filePath}`,
        "FAIL",
        "File does not exist",
        { path: fullPath },
        critical,
      );
    }
  }

  private async validateDirectory(dirPath: string): Promise<void> {
    const fullPath = path.join(this.phase35Path, dirPath);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      const files = fs.readdirSync(fullPath);
      this.addResult(
        `Directory: ${dirPath}`,
        "PASS",
        `Directory exists with ${files.length} files`,
        { path: fullPath, fileCount: files.length },
      );
    } else {
      this.addResult(
        `Directory: ${dirPath}`,
        "FAIL",
        "Directory does not exist",
        { path: fullPath },
        true,
      );
    }
  }

  private async validateComponent(component: any): Promise<void> {
    const filePath = path.join(this.phase35Path, component.file);

    if (!fs.existsSync(filePath)) {
      this.addResult(component.name, "FAIL", "Component file not found", {}, true);
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");

    // Check for required props
    const missingProps = component.requiredProps.filter((prop: string) => !content.includes(prop));

    if (missingProps.length === 0) {
      this.addResult(`${component.name} Props`, "PASS", "All required props found");
    } else {
      this.addResult(
        `${component.name} Props`,
        "WARNING",
        `Missing props: ${missingProps.join(", ")}`,
        { missingProps },
      );
    }

    // Check for React hooks usage
    const hooks = ["useState", "useEffect", "useCallback", "useMemo"];
    const usedHooks = hooks.filter(hook => content.includes(hook));

    if (usedHooks.length > 0) {
      this.addResult(
        `${component.name} Hooks`,
        "PASS",
        `Uses React hooks: ${usedHooks.join(", ")}`,
      );
    } else {
      this.addResult(`${component.name} Hooks`, "WARNING", "No React hooks detected");
    }

    // Check for TypeScript usage
    if (content.includes("interface") || content.includes("type ")) {
      this.addResult(`${component.name} TypeScript`, "PASS", "TypeScript interfaces/types found");
    } else {
      this.addResult(`${component.name} TypeScript`, "WARNING", "No TypeScript definitions found");
    }

    // Check for error handling
    if (content.includes("try") && content.includes("catch")) {
      this.addResult(`${component.name} Error Handling`, "PASS", "Error handling implemented");
    } else {
      this.addResult(
        `${component.name} Error Handling`,
        "WARNING",
        "Limited error handling detected",
      );
    }
  }

  private async validateService(service: any): Promise<void> {
    const filePath = path.join(this.phase35Path, service.file);

    if (!fs.existsSync(filePath)) {
      this.addResult(service.name, "FAIL", "Service file not found", {}, true);
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");

    // Check for required methods
    const missingMethods = service.requiredMethods.filter((method: string) =>
      !content.includes(method)
    );

    if (missingMethods.length === 0) {
      this.addResult(`${service.name} Methods`, "PASS", "All required methods found");
    } else {
      this.addResult(
        `${service.name} Methods`,
        "FAIL",
        `Missing methods: ${missingMethods.join(", ")}`,
        { missingMethods },
        true,
      );
    }

    // Check for singleton export
    if (service.singleton && content.includes(`export const ${service.singleton}`)) {
      this.addResult(`${service.name} Singleton`, "PASS", "Singleton instance exported");
    } else if (service.singleton) {
      this.addResult(`${service.name} Singleton`, "WARNING", "Singleton instance not found");
    }

    // Check for class structure
    if (content.includes(`class ${service.name}`)) {
      this.addResult(`${service.name} Structure`, "PASS", "Class-based service structure");
    } else {
      this.addResult(`${service.name} Structure`, "WARNING", "Non-standard service structure");
    }

    // Check for async/await usage
    if (content.includes("async ") && content.includes("await ")) {
      this.addResult(`${service.name} Async`, "PASS", "Async/await patterns used");
    } else {
      this.addResult(`${service.name} Async`, "WARNING", "Limited async/await usage");
    }
  }

  private async validateComponentIndex(): Promise<void> {
    const indexPath = path.join(this.phase35Path, "components", "analytics", "index.tsx");

    if (!fs.existsSync(indexPath)) {
      this.addResult("Component Index", "FAIL", "Component index file not found", {}, true);
      return;
    }

    const content = fs.readFileSync(indexPath, "utf8");

    const requiredExports = [
      "AIAnalyticsDashboard",
      "PredictivePatientIntelligence",
      "RealTimeHealthMonitor",
      "BrazilianHealthcareIntelligence",
    ];

    const missingExports = requiredExports.filter(exp => !content.includes(exp));

    if (missingExports.length === 0) {
      this.addResult("Component Index", "PASS", "All components properly exported");
    } else {
      this.addResult(
        "Component Index",
        "FAIL",
        `Missing exports: ${missingExports.join(", ")}`,
        { missingExports },
        true,
      );
    }
  }

  private async validateServiceOrchestrator(): Promise<void> {
    const indexPath = path.join(this.phase35Path, "lib", "analytics", "index.ts");

    if (!fs.existsSync(indexPath)) {
      this.addResult("Service Orchestrator", "FAIL", "Service index file not found", {}, true);
      return;
    }

    const content = fs.readFileSync(indexPath, "utf8");

    if (content.includes("createAnalyticsOrchestrator")) {
      this.addResult("Service Orchestrator", "PASS", "Analytics orchestrator function found");
    } else {
      this.addResult("Service Orchestrator", "WARNING", "Analytics orchestrator not found");
    }
  }

  private async validateSupabaseIntegration(): Promise<void> {
    // Check for Supabase imports in service files
    const serviceFiles = [
      "lib/analytics/ai-analytics-service.ts",
      "lib/analytics/predictive-patient-service.ts",
      "lib/analytics/real-time-monitoring-service.ts",
      "lib/analytics/brazilian-healthcare-intelligence-service.ts",
    ];

    let supabaseUsage = 0;

    for (const file of serviceFiles) {
      const filePath = path.join(this.phase35Path, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        if (content.includes("supabase")) {
          supabaseUsage++;
        }
      }
    }

    if (supabaseUsage > 0) {
      this.addResult(
        "Supabase Integration",
        "PASS",
        `Supabase used in ${supabaseUsage} service files`,
      );
    } else {
      this.addResult("Supabase Integration", "WARNING", "Limited Supabase integration detected");
    }
  }

  private async validateAPIIntegration(): Promise<void> {
    // Check for API client usage
    const apiClientPath = path.join(this.phase35Path, "lib", "api-client.ts");

    if (fs.existsSync(apiClientPath)) {
      this.addResult("API Integration", "PASS", "API client available for integration");
    } else {
      this.addResult("API Integration", "WARNING", "No API client found");
    }
  }

  private async validateStateIntegration(): Promise<void> {
    // Check for state management integration
    const stateDir = path.join(this.phase35Path, "lib", "state");

    if (fs.existsSync(stateDir)) {
      this.addResult("State Integration", "PASS", "State management directory found");
    } else {
      this.addResult("State Integration", "WARNING", "No state management integration detected");
    }
  }

  private async validateUIIntegration(): Promise<void> {
    // Check for UI component imports
    const componentFiles = fs.readdirSync(path.join(this.phase35Path, "components", "analytics"));

    let uiImports = 0;

    for (const file of componentFiles) {
      if (file.endsWith(".tsx")) {
        const filePath = path.join(this.phase35Path, "components", "analytics", file);
        const content = fs.readFileSync(filePath, "utf8");

        if (content.includes("@/components/ui/")) {
          uiImports++;
        }
      }
    }

    if (uiImports > 0) {
      this.addResult("UI Integration", "PASS", `UI components used in ${uiImports} files`);
    } else {
      this.addResult("UI Integration", "WARNING", "Limited UI component integration");
    }
  }

  private async validateLGPDCompliance(): Promise<void> {
    // Check for LGPD-related code
    const serviceFiles = [
      "lib/analytics/real-time-monitoring-service.ts",
      "lib/analytics/brazilian-healthcare-intelligence-service.ts",
    ];

    let lgpdMentions = 0;

    for (const file of serviceFiles) {
      const filePath = path.join(this.phase35Path, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        if (content.toLowerCase().includes("lgpd")) {
          lgpdMentions++;
        }
      }
    }

    if (lgpdMentions > 0) {
      this.addResult("LGPD Compliance", "PASS", `LGPD considerations in ${lgpdMentions} files`);
    } else {
      this.addResult("LGPD Compliance", "WARNING", "Limited LGPD compliance implementation");
    }
  }

  private async validateANVISACompliance(): Promise<void> {
    // Similar check for ANVISA
    const servicesContent = this.getServiceFilesContent();
    const anvisaMentions =
      servicesContent.filter(content => content.toLowerCase().includes("anvisa")).length;

    if (anvisaMentions > 0) {
      this.addResult(
        "ANVISA Compliance",
        "PASS",
        `ANVISA considerations in ${anvisaMentions} files`,
      );
    } else {
      this.addResult("ANVISA Compliance", "WARNING", "Limited ANVISA compliance implementation");
    }
  }

  private async validateCFMCompliance(): Promise<void> {
    // Similar check for CFM
    const servicesContent = this.getServiceFilesContent();
    const cfmMentions =
      servicesContent.filter(content => content.toLowerCase().includes("cfm")).length;

    if (cfmMentions > 0) {
      this.addResult("CFM Compliance", "PASS", `CFM considerations in ${cfmMentions} files`);
    } else {
      this.addResult("CFM Compliance", "WARNING", "Limited CFM compliance implementation");
    }
  }

  private async validateBrazilianLocalization(): Promise<void> {
    // Check for Portuguese text and Brazilian formatting
    const componentFiles = this.getComponentFilesContent();

    const portuguesePatterns = [
      "formatBRL",
      "pt-BR",
      "Brazilian",
      "Brasileiro",
      "Saúde",
      "Paciente",
    ];

    const localizationFeatures = portuguesePatterns.filter(pattern =>
      componentFiles.some(content => content.includes(pattern))
    );

    if (localizationFeatures.length >= 3) {
      this.addResult(
        "Brazilian Localization",
        "PASS",
        `${localizationFeatures.length} localization features found`,
      );
    } else {
      this.addResult("Brazilian Localization", "WARNING", "Limited Brazilian localization");
    }
  }

  private async validateFileSizes(): Promise<void> {
    const componentDir = path.join(this.phase35Path, "components", "analytics");
    const serviceDir = path.join(this.phase35Path, "lib", "analytics");

    const checkFileSizes = (dir: string, maxSizeKB: number = 100) => {
      if (!fs.existsSync(dir)) return [];

      return fs.readdirSync(dir)
        .filter(file => file.endsWith(".tsx") || file.endsWith(".ts"))
        .map(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          return { file, sizeKB, oversized: sizeKB > maxSizeKB };
        });
    };

    const componentSizes = checkFileSizes(componentDir, 50); // 50KB limit for components
    const serviceSizes = checkFileSizes(serviceDir, 100); // 100KB limit for services

    const oversizedFiles = [...componentSizes, ...serviceSizes].filter(f => f.oversized);

    if (oversizedFiles.length === 0) {
      this.addResult("File Sizes", "PASS", "All files within size limits");
    } else {
      this.addResult(
        "File Sizes",
        "WARNING",
        `${oversizedFiles.length} files exceed size limits`,
        { oversizedFiles },
      );
    }
  }

  private async validateImportStructure(): Promise<void> {
    // Check for proper import structure
    const files = this.getAllTypeScriptFiles();
    let properImports = 0;
    let totalImports = 0;

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf8");
      const imports = content.match(/import .* from ['"'].*['"'];/g) || [];

      totalImports += imports.length;

      // Check for relative imports vs absolute imports
      const relativeImports = imports.filter(imp => imp.includes("'./") || imp.includes('"./'));
      const absoluteImports = imports.filter(imp => imp.includes("'@/") || imp.includes('"@/'));

      if (absoluteImports.length >= relativeImports.length) {
        properImports++;
      }
    }

    if (properImports > files.length * 0.7) {
      this.addResult("Import Structure", "PASS", "Good import structure practices");
    } else {
      this.addResult("Import Structure", "WARNING", "Consider using more absolute imports");
    }
  }

  private async validatePerformanceOptimizations(): Promise<void> {
    const componentFiles = this.getComponentFilesContent();

    const optimizationPatterns = [
      "useCallback",
      "useMemo",
      "React.memo",
      "lazy",
      "Suspense",
    ];

    const foundOptimizations = optimizationPatterns.filter(pattern =>
      componentFiles.some(content => content.includes(pattern))
    );

    if (foundOptimizations.length >= 3) {
      this.addResult(
        "Performance Optimizations",
        "PASS",
        `${foundOptimizations.length} optimization patterns found`,
      );
    } else {
      this.addResult(
        "Performance Optimizations",
        "WARNING",
        "Limited performance optimizations detected",
      );
    }
  }

  private async validateARIAUsage(): Promise<void> {
    const componentFiles = this.getComponentFilesContent();

    const ariaPatterns = [
      "aria-label",
      "aria-describedby",
      "aria-expanded",
      "role=",
      "aria-live",
    ];

    const foundAria = ariaPatterns.filter(pattern =>
      componentFiles.some(content => content.includes(pattern))
    );

    if (foundAria.length >= 2) {
      this.addResult("ARIA Usage", "PASS", `${foundAria.length} ARIA patterns found`);
    } else {
      this.addResult("ARIA Usage", "WARNING", "Limited ARIA attribute usage");
    }
  }

  private async validateKeyboardNavigation(): Promise<void> {
    const componentFiles = this.getComponentFilesContent();

    const keyboardPatterns = [
      "onKeyDown",
      "onKeyUp",
      "tabIndex",
      "focus()",
      "blur()",
    ];

    const foundKeyboard = keyboardPatterns.filter(pattern =>
      componentFiles.some(content => content.includes(pattern))
    );

    if (foundKeyboard.length >= 1) {
      this.addResult(
        "Keyboard Navigation",
        "PASS",
        `${foundKeyboard.length} keyboard patterns found`,
      );
    } else {
      this.addResult("Keyboard Navigation", "WARNING", "Limited keyboard navigation support");
    }
  }

  private async validateColorContrast(): Promise<void> {
    const componentFiles = this.getComponentFilesContent();

    const contrastPatterns = [
      "text-red-600",
      "text-green-600",
      "text-blue-600",
      "bg-red-50",
      "bg-green-50",
      "contrast",
    ];

    const foundContrast = contrastPatterns.filter(pattern =>
      componentFiles.some(content => content.includes(pattern))
    );

    if (foundContrast.length >= 3) {
      this.addResult("Color Contrast", "PASS", "Color contrast considerations found");
    } else {
      this.addResult("Color Contrast", "WARNING", "Limited color contrast considerations");
    }
  }

  private async validateInputSanitization(): Promise<void> {
    const serviceFiles = this.getServiceFilesContent();

    const sanitizationPatterns = [
      "escape",
      "sanitize",
      "validate",
      "trim()",
      "toLowerCase()",
    ];

    const foundSanitization = sanitizationPatterns.filter(pattern =>
      serviceFiles.some(content => content.includes(pattern))
    );

    if (foundSanitization.length >= 2) {
      this.addResult(
        "Input Sanitization",
        "PASS",
        `${foundSanitization.length} sanitization patterns found`,
      );
    } else {
      this.addResult("Input Sanitization", "WARNING", "Limited input sanitization detected");
    }
  }

  private async validateAuthenticationHandling(): Promise<void> {
    const serviceFiles = this.getServiceFilesContent();

    const authPatterns = [
      "auth",
      "token",
      "session",
      "user",
      "login",
    ];

    const foundAuth = authPatterns.filter(pattern =>
      serviceFiles.some(content => content.toLowerCase().includes(pattern))
    );

    if (foundAuth.length >= 2) {
      this.addResult("Authentication Handling", "PASS", "Authentication considerations found");
    } else {
      this.addResult("Authentication Handling", "WARNING", "Limited authentication handling");
    }
  }

  private async validateDataEncryption(): Promise<void> {
    const serviceFiles = this.getServiceFilesContent();

    const encryptionPatterns = [
      "encrypt",
      "decrypt",
      "hash",
      "crypto",
      "secure",
    ];

    const foundEncryption = encryptionPatterns.filter(pattern =>
      serviceFiles.some(content => content.toLowerCase().includes(pattern))
    );

    if (foundEncryption.length >= 1) {
      this.addResult("Data Encryption", "PASS", "Encryption considerations found");
    } else {
      this.addResult("Data Encryption", "WARNING", "Limited data encryption considerations");
    }
  }

  /**
   * Helper methods
   */
  private getServiceFilesContent(): string[] {
    const serviceDir = path.join(this.phase35Path, "lib", "analytics");
    if (!fs.existsSync(serviceDir)) return [];

    return fs.readdirSync(serviceDir)
      .filter(file => file.endsWith(".ts") && file !== "index.ts")
      .map(file => {
        const filePath = path.join(serviceDir, file);
        return fs.readFileSync(filePath, "utf8");
      });
  }

  private getComponentFilesContent(): string[] {
    const componentDir = path.join(this.phase35Path, "components", "analytics");
    if (!fs.existsSync(componentDir)) return [];

    return fs.readdirSync(componentDir)
      .filter(file => file.endsWith(".tsx") && file !== "index.tsx")
      .map(file => {
        const filePath = path.join(componentDir, file);
        return fs.readFileSync(filePath, "utf8");
      });
  }

  private getAllTypeScriptFiles(): string[] {
    const files: string[] = [];

    const addFiles = (dir: string) => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && entry.name !== "node_modules") {
          addFiles(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          files.push(fullPath);
        }
      }
    };

    addFiles(path.join(this.phase35Path, "components", "analytics"));
    addFiles(path.join(this.phase35Path, "lib", "analytics"));

    return files;
  }

  private addResult(
    testName: string,
    status: "PASS" | "FAIL" | "SKIP" | "WARNING",
    message: string,
    details: any = {},
    critical: boolean = false,
  ): void {
    this.results.push({
      testName,
      status,
      message,
      details,
      critical,
    });

    // Real-time logging
    const statusIcon = {
      "PASS": "✅",
      "FAIL": "❌",
      "SKIP": "⏭️",
      "WARNING": "⚠️",
    }[status];

    console.log(`  ${statusIcon} ${testName}: ${message}`);
  }

  private generateSuiteReport(duration: number): ValidationSuite {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === "PASS").length;
    const failedTests = this.results.filter(r => r.status === "FAIL").length;
    const skippedTests = this.results.filter(r => r.status === "SKIP").length;
    const warningTests = this.results.filter(r => r.status === "WARNING").length;

    const suite: ValidationSuite = {
      suiteName: "Phase 3.5: AI-Powered Healthcare Analytics",
      results: this.results,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      warningTests,
      duration: Math.round(duration),
    };

    // Print summary
    console.log("\n" + "=".repeat(80));
    console.log("📊 VALIDATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`Suite: ${suite.suiteName}`);
    console.log(`Duration: ${suite.duration}ms`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Warnings: ${warningTests}`);
    console.log(`⏭️  Skipped: ${skippedTests}`);

    const successRate = Math.round((passedTests / totalTests) * 100);
    console.log(`Success Rate: ${successRate}%`);

    // Critical failures
    const criticalFailures = this.results.filter(r => r.status === "FAIL" && r.critical);
    if (criticalFailures.length > 0) {
      console.log(`\n🚨 Critical Failures: ${criticalFailures.length}`);
      criticalFailures.forEach(failure => {
        console.log(`   - ${failure.testName}: ${failure.message}`);
      });
    }

    console.log("=".repeat(80));

    return suite;
  }
}

// Main execution
async function main() {
  const validator = new Phase35Validator();

  try {
    const suite = await validator.runValidation();

    // Save results to file
    const resultsDir = path.join(process.cwd(), "validation-reports");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const resultsFile = path.join(resultsDir, `phase-3-5-validation-${timestamp}.json`);

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

export default Phase35Validator;
export { Phase35Validator };

// Execute main function
main().catch(console.error);
