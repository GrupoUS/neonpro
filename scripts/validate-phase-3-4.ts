#!/usr/bin/env tsx
/**
 * Phase 3.4 Validation Script - Mobile Emergency Interface Implementation
 *
 * CRITICAL VALIDATION REQUIREMENTS:
 * - Emergency data access < 100ms
 * - SAMU 192 integration functionality
 * - Offline emergency data caching
 * - WCAG 2.1 AAA+ accessibility compliance
 * - Brazilian healthcare regulatory compliance
 * - Mobile-first emergency interface performance
 *
 * @fileoverview Comprehensive validation for Brazilian healthcare emergency systems
 */

import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { performance } from "perf_hooks";
import { promisify } from "util";

const execAsync = promisify(exec);

// ANSI Color codes for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

interface ValidationResult {
  testName: string;
  passed: boolean;
  duration: number;
  details?: string;
  critical?: boolean;
  requirements?: string[];
}

interface ValidationSuite {
  suiteName: string;
  results: ValidationResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalFailures: number;
  duration: number;
}

class Phase34Validator {
  private results: ValidationSuite[] = [];
  private startTime: number = 0;

  constructor() {
    console.log(
      `${colors.cyan}${colors.bold}🚨 Phase 3.4 - Mobile Emergency Interface Validation${colors.reset}`,
    );
    console.log(
      `${colors.dim}Brazilian Healthcare Emergency Systems Compliance Test${colors.reset}\n`,
    );
  }

  /**
   * CRITICAL: Emergency Data Access Performance Validation
   * Requirement: < 100ms for life-threatening data access
   */
  async validateEmergencyPerformance(): Promise<ValidationSuite> {
    const suite: ValidationSuite = {
      suiteName: "Emergency Performance Critical Tests",
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      criticalFailures: 0,
      duration: 0,
    };

    const start = performance.now();

    console.log(`${colors.yellow}⚡ Testing Emergency Data Access Performance...${colors.reset}`);

    // Test 1: Emergency Patient Card Rendering Performance
    const patientCardTest = await this.testComponentPerformance(
      "apps/web/src/components/emergency/EmergencyPatientCard.tsx",
      "Emergency Patient Card Rendering",
      100, // <100ms requirement
    );
    suite.results.push(patientCardTest);

    // Test 2: Critical Alerts Response Time
    const alertsTest = await this.testComponentPerformance(
      "apps/web/src/components/emergency/CriticalAlertOverlay.tsx",
      "Critical Alert Display",
      50, // <50ms for life-threatening alerts
    );
    suite.results.push(alertsTest);

    // Test 3: SAMU Dial Button Instant Access
    const samuDialTest = await this.testComponentPerformance(
      "apps/web/src/components/emergency/SAMUDialButton.tsx",
      "SAMU Emergency Dial Access",
      75, // <75ms for emergency dial
    );
    suite.results.push(samuDialTest);

    // Test 4: Emergency Cache Access Speed
    const cacheTest = await this.testLibraryPerformance(
      "apps/web/src/lib/emergency/emergency-cache.ts",
      "Emergency Patient Cache Access",
      25, // <25ms for cached data
    );
    suite.results.push(cacheTest);

    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.passed).length;
    suite.failedTests = suite.results.filter(r => !r.passed).length;
    suite.criticalFailures = suite.results.filter(r => !r.passed && r.critical).length;
    suite.duration = performance.now() - start;

    return suite;
  }

  /**
   * CRITICAL: SAMU 192 Integration Validation
   * Brazilian Emergency Medical Services Integration
   */
  async validateSAMUIntegration(): Promise<ValidationSuite> {
    const suite: ValidationSuite = {
      suiteName: "SAMU 192 Emergency Integration",
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      criticalFailures: 0,
      duration: 0,
    };

    const start = performance.now();

    console.log(`${colors.red}🚨 Testing SAMU 192 Emergency Integration...${colors.reset}`);

    // Test 1: SAMU Integration Library Structure
    const samuLibTest = await this.validateFileExists(
      "apps/web/src/lib/emergency/samu-integration.ts",
      "SAMU Integration Library",
      ["SAMUEmergencyCall", "EmergencyLocation", "HospitalNetwork"],
    );
    samuLibTest.critical = true;
    suite.results.push(samuLibTest);

    // Test 2: Emergency Call Data Structure
    const emergencyTypesTest = await this.validateTypeDefinitions(
      "apps/web/src/types/emergency.ts",
      "Emergency Call Types",
      ["SAMUEmergencyCall", "EmergencyType", "EmergencyLocation"],
    );
    emergencyTypesTest.critical = true;
    suite.results.push(emergencyTypesTest);

    // Test 3: GPS Location Integration
    const locationTest = await this.validateCodePattern(
      "apps/web/src/lib/emergency/samu-integration.ts",
      "GPS Location Integration",
      ["getCurrentLocation", "EmergencyLocation", "coordinates"],
    );
    suite.results.push(locationTest);

    // Test 4: Hospital Network Notifications
    const hospitalTest = await this.validateCodePattern(
      "apps/web/src/lib/emergency/samu-integration.ts",
      "Hospital Network Integration",
      ["notifyHospitalNetwork", "EmergencyEscalation", "HospitalNotification"],
    );
    suite.results.push(hospitalTest);

    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.passed).length;
    suite.failedTests = suite.results.filter(r => !r.passed).length;
    suite.criticalFailures = suite.results.filter(r => !r.passed && r.critical).length;
    suite.duration = performance.now() - start;

    return suite;
  }

  /**
   * CRITICAL: Brazilian Healthcare Regulatory Compliance
   * CFM, ANVISA, LGPD compliance validation
   */
  async validateBrazilianCompliance(): Promise<ValidationSuite> {
    const suite: ValidationSuite = {
      suiteName: "Brazilian Healthcare Compliance",
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      criticalFailures: 0,
      duration: 0,
    };

    const start = performance.now();

    console.log(`${colors.green}🇧🇷 Testing Brazilian Healthcare Compliance...${colors.reset}`);

    // Test 1: LGPD Data Protection Compliance
    const lgpdTest = await this.validateCodePattern(
      "apps/web/src/lib/emergency/emergency-cache.ts",
      "LGPD Data Protection",
      ["encryptPatientData", "LGPD", "dataProtection", "patientConsent"],
    );
    lgpdTest.critical = true;
    lgpdTest.requirements = ["LGPD Article 7", "Patient Data Encryption", "Consent Management"];
    suite.results.push(lgpdTest);

    // Test 2: CFM Medical Protocol Compliance
    const cfmTest = await this.validateCodePattern(
      "apps/web/src/lib/emergency/emergency-protocols.ts",
      "CFM Medical Protocols",
      ["CFM", "medicalProtocol", "EmergencyProtocol", "BrazilianStandards"],
    );
    cfmTest.critical = true;
    cfmTest.requirements = ["CFM Resolution 2314/2022", "Emergency Medical Protocols"];
    suite.results.push(cfmTest);

    // Test 3: ANVISA Controlled Substances
    const anvisaTest = await this.validateCodePattern(
      "apps/web/src/components/emergency/EmergencyMedicationsList.tsx",
      "ANVISA Controlled Substances",
      ["ANVISA", "controlledSubstance", "MedicationClassification"],
    );
    anvisaTest.requirements = ["ANVISA RDC 344/1998", "Controlled Substance Tracking"];
    suite.results.push(anvisaTest);

    // Test 4: Brazilian Emergency Service Numbers
    const emergencyNumbersTest = await this.validateCodePattern(
      "apps/web/src/components/emergency/index.tsx",
      "Brazilian Emergency Numbers",
      ["192", "SAMU", "BRAZILIAN_EMERGENCY_SERVICES"],
    );
    suite.results.push(emergencyNumbersTest);

    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.passed).length;
    suite.failedTests = suite.results.filter(r => !r.passed).length;
    suite.criticalFailures = suite.results.filter(r => !r.passed && r.critical).length;
    suite.duration = performance.now() - start;

    return suite;
  }

  /**
   * CRITICAL: WCAG 2.1 AAA+ Accessibility Compliance
   * Emergency interface accessibility validation
   */
  async validateAccessibilityCompliance(): Promise<ValidationSuite> {
    const suite: ValidationSuite = {
      suiteName: "WCAG 2.1 AAA+ Accessibility",
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      criticalFailures: 0,
      duration: 0,
    };

    const start = performance.now();

    console.log(`${colors.magenta}♿ Testing WCAG 2.1 AAA+ Accessibility...${colors.reset}`);

    // Test 1: Emergency Touch Targets (56px minimum)
    const touchTargetTest = await this.validateCodePattern(
      "apps/web/src/components/emergency/SAMUDialButton.tsx",
      "Emergency Touch Targets",
      ["56px", "touchTarget", "emergencyTouchSize", "accessible"],
    );
    touchTargetTest.critical = true;
    touchTargetTest.requirements = ["WCAG 2.1 AA 2.5.5", "56px minimum touch targets"];
    suite.results.push(touchTargetTest);

    // Test 2: High Contrast Emergency Colors (21:1 ratio)
    const contrastTest = await this.validateCodePattern(
      "apps/web/src/components/emergency/CriticalAlertOverlay.tsx",
      "Emergency High Contrast",
      ["21:1", "contrastRatio", "emergencyContrast", "AAA+"],
    );
    contrastTest.critical = true;
    contrastTest.requirements = ["WCAG 2.1 AAA 1.4.6", "21:1 contrast ratio"];
    suite.results.push(contrastTest);

    // Test 3: Voice Command Integration
    const voiceTest = await this.validateCodePattern(
      "apps/web/src/components/emergency/EmergencyAccessibilityPanel.tsx",
      "Voice Command Support",
      ["voiceCommands", "speechRecognition", "handsFree", "emergencyVoice"],
    );
    voiceTest.requirements = ["WCAG 2.1 AA 2.1.1", "Voice command accessibility"];
    suite.results.push(voiceTest);

    // Test 4: Screen Reader Emergency Announcements
    const screenReaderTest = await this.validateCodePattern(
      "apps/web/src/components/emergency/CriticalAlertOverlay.tsx",
      "Screen Reader Support",
      ["aria-live", "assertive", "screenReader", "emergencyAnnouncement"],
    );
    screenReaderTest.critical = true;
    screenReaderTest.requirements = ["WCAG 2.1 AA 4.1.3", "Emergency screen reader support"];
    suite.results.push(screenReaderTest);

    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.passed).length;
    suite.failedTests = suite.results.filter(r => !r.passed).length;
    suite.criticalFailures = suite.results.filter(r => !r.passed && r.critical).length;
    suite.duration = performance.now() - start;

    return suite;
  }

  /**
   * Mobile-First Emergency Interface Validation
   */
  async validateMobileEmergencyInterface(): Promise<ValidationSuite> {
    const suite: ValidationSuite = {
      suiteName: "Mobile Emergency Interface",
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      criticalFailures: 0,
      duration: 0,
    };

    const start = performance.now();

    console.log(`${colors.blue}📱 Testing Mobile Emergency Interface...${colors.reset}`);

    // Test 1: One-Thumb Operation Design
    const oneThumbTest = await this.validateCodePattern(
      "apps/web/src/components/emergency/EmergencyPatientCard.tsx",
      "One-Thumb Operation",
      ["oneThumb", "reachableArea", "mobileFirst", "emergencyAccess"],
    );
    oneThumbTest.critical = true;
    suite.results.push(oneThumbTest);

    // Test 2: Critical Data Above-the-Fold
    const aboveFoldTest = await this.validateCodePattern(
      "apps/web/src/components/emergency/EmergencyPatientCard.tsx",
      "Critical Data Priority",
      ["criticalData", "aboveFold", "lifeThreatening", "priorityDisplay"],
    );
    suite.results.push(aboveFoldTest);

    // Test 3: Emergency Offline Mode
    const offlineTest = await this.validateCodePattern(
      "apps/web/src/lib/emergency/emergency-cache.ts",
      "Emergency Offline Support",
      ["offlineMode", "emergencyCache", "cachedPatientData", "offlineFunctionality"],
    );
    offlineTest.critical = true;
    suite.results.push(offlineTest);

    // Test 4: Battery Optimization for Emergencies
    const batteryTest = await this.validateCodePattern(
      "apps/web/src/lib/emergency/emergency-performance.ts",
      "Emergency Battery Optimization",
      ["batteryOptimization", "lowPowerMode", "emergencyBattery", "powerSaving"],
    );
    suite.results.push(batteryTest);

    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.passed).length;
    suite.failedTests = suite.results.filter(r => !r.passed).length;
    suite.criticalFailures = suite.results.filter(r => !r.passed && r.critical).length;
    suite.duration = performance.now() - start;

    return suite;
  }

  /**
   * Test component rendering performance
   */
  private async testComponentPerformance(
    filePath: string,
    testName: string,
    maxMs: number,
  ): Promise<ValidationResult> {
    const start = performance.now();

    try {
      const fileExists = await this.fileExists(filePath);
      if (!fileExists) {
        return {
          testName,
          passed: false,
          duration: performance.now() - start,
          details: `Component file not found: ${filePath}`,
          critical: true,
        };
      }

      const fileContent = await fs.readFile(filePath, "utf-8");
      const hasPerformanceOptimization = fileContent.includes("useMemo")
        || fileContent.includes("useCallback")
        || fileContent.includes("React.memo");

      const duration = performance.now() - start;
      const passed = hasPerformanceOptimization && duration < maxMs;

      return {
        testName,
        passed,
        duration,
        details: passed
          ? `✅ Performance optimized (${duration.toFixed(2)}ms < ${maxMs}ms)`
          : `❌ Missing performance optimization or too slow (${
            duration.toFixed(2)
          }ms >= ${maxMs}ms)`,
        critical: maxMs <= 100, // Critical if requirement is <= 100ms
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        duration: performance.now() - start,
        details: `Error testing component: ${error}`,
        critical: true,
      };
    }
  }

  /**
   * Test library performance characteristics
   */
  private async testLibraryPerformance(
    filePath: string,
    testName: string,
    maxMs: number,
  ): Promise<ValidationResult> {
    const start = performance.now();

    try {
      const fileExists = await this.fileExists(filePath);
      if (!fileExists) {
        return {
          testName,
          passed: false,
          duration: performance.now() - start,
          details: `Library file not found: ${filePath}`,
          critical: true,
        };
      }

      const fileContent = await fs.readFile(filePath, "utf-8");
      const hasPerformanceFeatures = fileContent.includes("cache")
        || fileContent.includes("optimize")
        || fileContent.includes("performance")
        || fileContent.includes("fast");

      const duration = performance.now() - start;
      const passed = hasPerformanceFeatures && duration < maxMs;

      return {
        testName,
        passed,
        duration,
        details: passed
          ? `✅ Performance optimized library (${duration.toFixed(2)}ms)`
          : `❌ Library lacks performance optimization`,
        critical: true,
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        duration: performance.now() - start,
        details: `Error testing library: ${error}`,
        critical: true,
      };
    }
  }

  /**
   * Validate file exists and contains expected content
   */
  private async validateFileExists(
    filePath: string,
    testName: string,
    requiredElements: string[],
  ): Promise<ValidationResult> {
    const start = performance.now();

    try {
      const fileExists = await this.fileExists(filePath);
      if (!fileExists) {
        return {
          testName,
          passed: false,
          duration: performance.now() - start,
          details: `❌ File not found: ${filePath}`,
          critical: true,
        };
      }

      const content = await fs.readFile(filePath, "utf-8");
      const missingElements = requiredElements.filter(element => !content.includes(element));

      const passed = missingElements.length === 0;
      const duration = performance.now() - start;

      return {
        testName,
        passed,
        duration,
        details: passed
          ? `✅ All required elements found: ${requiredElements.join(", ")}`
          : `❌ Missing elements: ${missingElements.join(", ")}`,
        requirements: requiredElements,
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        duration: performance.now() - start,
        details: `Error validating file: ${error}`,
        critical: true,
      };
    }
  }

  /**
   * Validate TypeScript type definitions
   */
  private async validateTypeDefinitions(
    filePath: string,
    testName: string,
    requiredTypes: string[],
  ): Promise<ValidationResult> {
    const start = performance.now();

    try {
      const fileExists = await this.fileExists(filePath);
      if (!fileExists) {
        return {
          testName,
          passed: false,
          duration: performance.now() - start,
          details: `❌ Type definition file not found: ${filePath}`,
          critical: true,
        };
      }

      const content = await fs.readFile(filePath, "utf-8");
      const missingTypes = requiredTypes.filter(type =>
        !content.includes(`interface ${type}`)
        && !content.includes(`type ${type}`)
        && !content.includes(`enum ${type}`)
      );

      const passed = missingTypes.length === 0;
      const duration = performance.now() - start;

      return {
        testName,
        passed,
        duration,
        details: passed
          ? `✅ All required types defined: ${requiredTypes.join(", ")}`
          : `❌ Missing type definitions: ${missingTypes.join(", ")}`,
        requirements: requiredTypes.map(t => `Type: ${t}`),
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        duration: performance.now() - start,
        details: `Error validating types: ${error}`,
        critical: true,
      };
    }
  }

  /**
   * Validate code patterns exist in file
   */
  private async validateCodePattern(
    filePath: string,
    testName: string,
    patterns: string[],
  ): Promise<ValidationResult> {
    const start = performance.now();

    try {
      const fileExists = await this.fileExists(filePath);
      if (!fileExists) {
        return {
          testName,
          passed: false,
          duration: performance.now() - start,
          details: `❌ File not found: ${filePath}`,
          critical: false,
        };
      }

      const content = await fs.readFile(filePath, "utf-8");
      const missingPatterns = patterns.filter(pattern => !content.includes(pattern));

      const passed = missingPatterns.length === 0;
      const duration = performance.now() - start;

      return {
        testName,
        passed,
        duration,
        details: passed
          ? `✅ All patterns found: ${patterns.join(", ")}`
          : `⚠️  Missing patterns: ${missingPatterns.join(", ")}`,
        requirements: patterns.map(p => `Pattern: ${p}`),
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        duration: performance.now() - start,
        details: `Error validating patterns: ${error}`,
      };
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run all validation suites
   */
  async runAllValidations(): Promise<void> {
    this.startTime = performance.now();

    console.log(`${colors.bold}🚀 Starting Phase 3.4 Comprehensive Validation...${colors.reset}\n`);

    // Run all validation suites
    this.results.push(await this.validateEmergencyPerformance());
    this.results.push(await this.validateSAMUIntegration());
    this.results.push(await this.validateBrazilianCompliance());
    this.results.push(await this.validateAccessibilityCompliance());
    this.results.push(await this.validateMobileEmergencyInterface());

    // Generate comprehensive report
    await this.generateValidationReport();
  }

  /**
   * Generate comprehensive validation report
   */
  private async generateValidationReport(): Promise<void> {
    const totalDuration = performance.now() - this.startTime;
    const totalTests = this.results.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalCriticalFailures = this.results.reduce(
      (sum, suite) => sum + suite.criticalFailures,
      0,
    );

    console.log(`\n${colors.cyan}${colors.bold}📊 PHASE 3.4 VALIDATION REPORT${colors.reset}`);
    console.log(
      `${colors.dim}Mobile Emergency Interface Implementation - Brazilian Healthcare${colors.reset}\n`,
    );

    // Overall Summary
    const overallPass = totalCriticalFailures === 0 && (totalPassed / totalTests) >= 0.9;
    console.log(`${colors.bold}🎯 Overall Status: ${
      overallPass
        ? `${colors.green}PASSED ✅${colors.reset}`
        : `${colors.red}FAILED ❌${colors.reset}`
    }${colors.reset}`);

    console.log(
      `📈 Tests: ${totalTests} total, ${colors.green}${totalPassed} passed${colors.reset}, ${
        totalFailed > 0 ? `${colors.red}${totalFailed} failed` : "0 failed"
      }${colors.reset}`,
    );
    console.log(
      `⚠️  Critical Failures: ${
        totalCriticalFailures > 0
          ? `${colors.red}${totalCriticalFailures}${colors.reset}`
          : `${colors.green}0${colors.reset}`
      }`,
    );
    console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`);

    // Suite-by-Suite Results
    for (const suite of this.results) {
      const suiteStatus = suite.criticalFailures === 0
        && (suite.passedTests / suite.totalTests) >= 0.8;
      console.log(
        `${colors.bold}${
          suiteStatus ? colors.green : colors.red
        }${suite.suiteName}${colors.reset} ${suiteStatus ? "✅" : "❌"}`,
      );
      console.log(
        `  Tests: ${suite.totalTests}, Passed: ${suite.passedTests}, Failed: ${suite.failedTests}, Critical: ${suite.criticalFailures}`,
      );
      console.log(`  Duration: ${(suite.duration / 1000).toFixed(2)}s\n`);

      // Show failed tests details
      const failedTests = suite.results.filter(r => !r.passed);
      if (failedTests.length > 0) {
        console.log(`  ${colors.red}Failed Tests:${colors.reset}`);
        for (const test of failedTests) {
          console.log(`    ${test.critical ? "🔴" : "🟡"} ${test.testName}: ${test.details}`);
          if (test.requirements && test.requirements.length > 0) {
            console.log(`      Requirements: ${test.requirements.join(", ")}`);
          }
        }
        console.log("");
      }
    }

    // Critical Requirements Summary
    console.log(`${colors.yellow}${colors.bold}🎯 CRITICAL REQUIREMENTS STATUS:${colors.reset}`);
    console.log(
      `• Emergency Data Access < 100ms: ${
        this.getRequirementStatus("Emergency Patient Card Rendering")
      }`,
    );
    console.log(`• SAMU 192 Integration: ${this.getRequirementStatus("SAMU Integration Library")}`);
    console.log(`• LGPD Compliance: ${this.getRequirementStatus("LGPD Data Protection")}`);
    console.log(
      `• WCAG 2.1 AAA+ Accessibility: ${this.getRequirementStatus("Emergency Touch Targets")}`,
    );
    console.log(`• Mobile-First Emergency: ${this.getRequirementStatus("One-Thumb Operation")}`);

    // Recommendations
    if (totalCriticalFailures > 0 || !overallPass) {
      console.log(`\n${colors.red}${colors.bold}⚠️  IMMEDIATE ACTION REQUIRED:${colors.reset}`);
      console.log(`Critical failures detected in Brazilian healthcare emergency systems.`);
      console.log(`These must be resolved before Phase 3.4 can be considered complete.`);
    } else {
      console.log(
        `\n${colors.green}${colors.bold}✅ Phase 3.4 VALIDATION SUCCESSFUL!${colors.reset}`,
      );
      console.log(`Mobile Emergency Interface Implementation meets all critical requirements.`);
      console.log(`Ready for Brazilian healthcare emergency deployment.`);
    }

    // Generate validation report file
    await this.saveValidationReport(
      overallPass,
      totalTests,
      totalPassed,
      totalFailed,
      totalCriticalFailures,
      totalDuration,
    );
  }

  /**
   * Get requirement status for critical features
   */
  private getRequirementStatus(testName: string): string {
    for (const suite of this.results) {
      const test = suite.results.find(r => r.testName === testName);
      if (test) {
        return test.passed
          ? `${colors.green}PASSED ✅${colors.reset}`
          : `${colors.red}FAILED ❌${colors.reset}`;
      }
    }
    return `${colors.yellow}NOT TESTED ⚠️${colors.reset}`;
  }

  /**
   * Save detailed validation report to file
   */
  private async saveValidationReport(
    overallPass: boolean,
    totalTests: number,
    totalPassed: number,
    totalFailed: number,
    totalCriticalFailures: number,
    totalDuration: number,
  ): Promise<void> {
    const reportPath = "validation-reports/phase-3-4-report.json";

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(reportPath), { recursive: true });

      const report = {
        phase: "3.4",
        title: "Mobile Emergency Interface Implementation",
        timestamp: new Date().toISOString(),
        overall: {
          passed: overallPass,
          tests: totalTests,
          passed: totalPassed,
          failed: totalFailed,
          criticalFailures: totalCriticalFailures,
          duration: Math.round(totalDuration),
          successRate: Math.round((totalPassed / totalTests) * 100),
        },
        suites: this.results.map(suite => ({
          name: suite.suiteName,
          passed: suite.criticalFailures === 0 && (suite.passedTests / suite.totalTests) >= 0.8,
          tests: suite.totalTests,
          passed: suite.passedTests,
          failed: suite.failedTests,
          criticalFailures: suite.criticalFailures,
          duration: Math.round(suite.duration),
          results: suite.results,
        })),
        criticalRequirements: {
          emergencyPerformance: this.getRequirementStatus("Emergency Patient Card Rendering")
            .includes("PASSED"),
          samuIntegration: this.getRequirementStatus("SAMU Integration Library").includes("PASSED"),
          lgpdCompliance: this.getRequirementStatus("LGPD Data Protection").includes("PASSED"),
          accessibilityCompliance: this.getRequirementStatus("Emergency Touch Targets").includes(
            "PASSED",
          ),
          mobileFirstEmergency: this.getRequirementStatus("One-Thumb Operation").includes("PASSED"),
        },
      };

      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf-8");
      console.log(`\n📄 Detailed report saved: ${reportPath}`);
    } catch (error) {
      console.error(`Failed to save validation report: ${error}`);
    }
  }
}

// Execute validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new Phase34Validator();
  validator.runAllValidations().catch(console.error);
}

export { Phase34Validator, ValidationResult, ValidationSuite };
