/**
 * ComplianceTestRunner - Automated testing infrastructure for compliance validation
 * Coordinates testing across WCAG, LGPD, ANVISA, and CFM frameworks
 */

import type { ComplianceFramework, ComplianceViolation } from "../types";
import { ComplianceCheckResult } from "../types";
import { ANVISATester } from "./ANVISATester";
import { CFMTester } from "./CFMTester";
import { LGPDTester } from "./LGPDTester";
import { WCAGTester } from "./WCAGTester";

export interface ComplianceTestConfig {
  // Test execution settings
  concurrency: number;
  timeout: number; // milliseconds
  retries: number;

  // Framework-specific configurations
  frameworks: ComplianceFramework[];

  // Test environment settings
  baseUrl: string;
  testPages: string[];
  excludePages?: string[];

  // Authentication (if needed for protected pages)
  auth?: {
    username: string;
    password: string;
    loginUrl: string;
  };

  // Reporting settings
  outputFormat: "json" | "html" | "junit" | "all";
  outputPath: string;

  // Integration settings
  webhookUrl?: string;
  slackWebhook?: string;
  emailRecipients?: string[];

  // Thresholds for pass/fail
  thresholds: {
    maxViolations: number;
    minScore: number;
    criticalViolationsAllowed: number;
  };
}

export interface ComplianceTestResult {
  framework: ComplianceFramework;
  page: string;
  score: number;
  violations: ComplianceViolation[];
  passes: number;
  incomplete: number;
  duration: number;
  timestamp: number;
  status: "passed" | "failed" | "error";
  error?: string;
}

export interface ComplianceTestSuite {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ComplianceTestResult[];
  overallScore: number;
  status: "passed" | "failed" | "error";
  config: ComplianceTestConfig;
}

export class ComplianceTestRunner {
  private wcagTester: WCAGTester;
  private lgpdTester: LGPDTester;
  private anvisaTester: ANVISATester;
  private cfmTester: CFMTester;

  constructor() {
    this.wcagTester = new WCAGTester();
    this.lgpdTester = new LGPDTester();
    this.anvisaTester = new ANVISATester();
    this.cfmTester = new CFMTester();
  }

  /**
   * Run complete compliance test suite
   */
  async runTestSuite(config: ComplianceTestConfig): Promise<ComplianceTestSuite> {
    const suiteId = `suite_${Date.now()}`;
    const startTime = Date.now();

    console.log(`🚀 Starting compliance test suite: ${suiteId}`);
    console.log(
      `📋 Testing ${config.testPages.length} pages across ${config.frameworks.length} frameworks`,
    );

    const results: ComplianceTestResult[] = [];

    try {
      // Generate test combinations (framework + page)
      const testCombinations = this.generateTestCombinations(config);

      console.log(`🔄 Generated ${testCombinations.length} test combinations`);

      // Run tests with concurrency control
      const testPromises = testCombinations.map(async (combination, index) => {
        return this.runSingleTest(combination, config, index, testCombinations.length);
      });

      // Execute tests with concurrency limit
      const testResults = await this.executeWithConcurrency(testPromises, config.concurrency);
      results.push(...testResults.filter(result => result !== null));

      // Calculate suite metrics
      const endTime = Date.now();
      const duration = endTime - startTime;

      const suite: ComplianceTestSuite = {
        id: suiteId,
        startTime,
        endTime,
        duration,
        totalTests: testCombinations.length,
        passedTests: results.filter(r => r.status === "passed").length,
        failedTests: results.filter(r => r.status === "failed").length,
        results,
        overallScore: this.calculateOverallScore(results),
        status: this.determineSuiteStatus(results, config),
        config,
      };

      // Generate reports
      await this.generateReports(suite);

      // Send notifications
      await this.sendNotifications(suite);

      console.log(`✅ Test suite completed: ${suite.status}`);
      console.log(
        `📊 Score: ${suite.overallScore}% | Passed: ${suite.passedTests}/${suite.totalTests}`,
      );

      return suite;
    } catch (error) {
      console.error("❌ Test suite failed:", error);

      const endTime = Date.now();
      return {
        id: suiteId,
        startTime,
        endTime,
        duration: endTime - startTime,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        results,
        overallScore: 0,
        status: "error",
        config,
      };
    }
  }

  /**
   * Run tests for a specific framework
   */
  async runFrameworkTests(
    framework: ComplianceFramework,
    pages: string[],
    config: Partial<ComplianceTestConfig>,
  ): Promise<ComplianceTestResult[]> {
    console.log(`🔍 Running ${framework} tests for ${pages.length} pages`);

    const results: ComplianceTestResult[] = [];

    for (const page of pages) {
      try {
        const result = await this.runSingleFrameworkTest(framework, page, config);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error testing ${framework} on ${page}:`, error);
        results.push({
          framework,
          page,
          score: 0,
          violations: [],
          passes: 0,
          incomplete: 0,
          duration: 0,
          timestamp: Date.now(),
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Run continuous monitoring (for CI/CD integration)
   */
  async runContinuousMonitoring(config: ComplianceTestConfig): Promise<boolean> {
    console.log("🔄 Running continuous compliance monitoring");

    const suite = await this.runTestSuite(config);

    // Check if tests pass the defined thresholds
    const passesThresholds = this.checkThresholds(suite, config.thresholds);

    if (!passesThresholds) {
      console.error("❌ Compliance tests failed threshold checks");
      process.exit(1); // Fail CI/CD pipeline
    }

    console.log("✅ Compliance monitoring passed");
    return true;
  }

  /**
   * Generate test combinations (framework + page)
   */
  private generateTestCombinations(
    config: ComplianceTestConfig,
  ): { framework: ComplianceFramework; page: string; }[] {
    const combinations: { framework: ComplianceFramework; page: string; }[] = [];

    for (const framework of config.frameworks) {
      for (const page of config.testPages) {
        if (!config.excludePages?.includes(page)) {
          combinations.push({ framework, page });
        }
      }
    }

    return combinations;
  }

  /**
   * Run a single test combination
   */
  private async runSingleTest(
    combination: { framework: ComplianceFramework; page: string; },
    config: ComplianceTestConfig,
    index: number,
    total: number,
  ): Promise<ComplianceTestResult> {
    const { framework, page } = combination;
    const startTime = Date.now();

    console.log(`⏳ [${index + 1}/${total}] Testing ${framework} on ${page}`);

    try {
      const result = await this.runSingleFrameworkTest(framework, page, config);

      const duration = Date.now() - startTime;
      console.log(
        `✅ [${
          index + 1
        }/${total}] ${framework} on ${page} - Score: ${result.score}% (${duration}ms)`,
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `❌ [${index + 1}/${total}] ${framework} on ${page} failed (${duration}ms):`,
        error,
      );

      return {
        framework,
        page,
        score: 0,
        violations: [],
        passes: 0,
        incomplete: 0,
        duration,
        timestamp: startTime,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Run test for a specific framework and page
   */
  private async runSingleFrameworkTest(
    framework: ComplianceFramework,
    page: string,
    config: Partial<ComplianceTestConfig>,
  ): Promise<ComplianceTestResult> {
    const fullUrl = `${config.baseUrl || ""}${page}`;

    switch (framework) {
      case "WCAG":
        return await this.wcagTester.testPage(fullUrl, config);

      case "LGPD":
        return await this.lgpdTester.testPage(fullUrl, config);

      case "ANVISA":
        return await this.anvisaTester.testPage(fullUrl, config);

      case "CFM":
        return await this.cfmTester.testPage(fullUrl, config);

      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }

  /**
   * Execute promises with concurrency control
   */
  private async executeWithConcurrency<T>(
    promises: Promise<T>[],
    concurrency: number,
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i].then(result => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Calculate overall score across all tests
   */
  private calculateOverallScore(results: ComplianceTestResult[]): number {
    if (!results.length) {return 0;}

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  }

  /**
   * Determine overall suite status
   */
  private determineSuiteStatus(
    results: ComplianceTestResult[],
    config: ComplianceTestConfig,
  ): "passed" | "failed" | "error" {
    const errorResults = results.filter(r => r.status === "error");
    if (errorResults.length > 0) {return "error";}

    const overallScore = this.calculateOverallScore(results);
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
    const criticalViolations = results.reduce(
      (sum, r) => sum + r.violations.filter(v => v.severity === "critical").length,
      0,
    );

    if (
      overallScore < config.thresholds.minScore
      || totalViolations > config.thresholds.maxViolations
      || criticalViolations > config.thresholds.criticalViolationsAllowed
    ) {
      return "failed";
    }

    return "passed";
  }

  /**
   * Check if suite passes defined thresholds
   */
  private checkThresholds(
    suite: ComplianceTestSuite,
    thresholds: ComplianceTestConfig["thresholds"],
  ): boolean {
    const totalViolations = suite.results.reduce((sum, r) => sum + r.violations.length, 0);
    const criticalViolations = suite.results.reduce(
      (sum, r) => sum + r.violations.filter(v => v.severity === "critical").length,
      0,
    );

    return suite.overallScore >= thresholds.minScore
      && totalViolations <= thresholds.maxViolations
      && criticalViolations <= thresholds.criticalViolationsAllowed;
  }

  /**
   * Generate test reports in various formats
   */
  private async generateReports(suite: ComplianceTestSuite): Promise<void> {
    console.log("📄 Generating compliance test reports");

    // Implementation would generate reports based on config.outputFormat
    // This would be implemented based on specific reporting requirements
  }

  /**
   * Send notifications based on test results
   */
  private async sendNotifications(suite: ComplianceTestSuite): Promise<void> {
    if (suite.status !== "failed") {return;}

    console.log("📧 Sending failure notifications");

    // Implementation would send notifications via webhook, Slack, email, etc.
    // This would be implemented based on specific notification requirements
  }
}

// Export singleton instance
export const complianceTestRunner = new ComplianceTestRunner();
