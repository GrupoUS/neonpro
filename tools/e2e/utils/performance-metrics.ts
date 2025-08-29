/**
 * Performance Metrics Utilities for E2E Tests
 * Provides comprehensive performance monitoring and reporting for Playwright tests
 */

import type { BrowserContext, Page } from "@playwright/test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte

  // Custom Healthcare Metrics
  patientDataLoadTime: number;
  formSubmissionTime: number;
  navigationTime: number;
  searchResponseTime: number;

  // Resource Metrics
  totalRequests: number;
  failedRequests: number;
  totalTransferSize: number;
  jsHeapSize: number;

  // Timing Metrics
  domContentLoaded: number;
  loadComplete: number;

  // Test Metadata
  testName: string;
  url: string;
  timestamp: string;
  userAgent: string;
  viewport: { width: number; height: number; };
}

export interface PerformanceBudget {
  lcp: number; // < 2.5s
  fid: number; // < 100ms
  cls: number; // < 0.1
  fcp: number; // < 1.8s
  ttfb: number; // < 600ms
  patientDataLoadTime: number; // < 1s
  formSubmissionTime: number; // < 2s
  navigationTime: number; // < 500ms
  searchResponseTime: number; // < 800ms
}

// Default performance budgets for healthcare application
export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500, // 2.5s
  fid: 100, // 100ms
  cls: 0.1, // 0.1
  fcp: 1800, // 1.8s
  ttfb: 600, // 600ms
  patientDataLoadTime: 1000, // 1s
  formSubmissionTime: 2000, // 2s
  navigationTime: 500, // 500ms
  searchResponseTime: 800, // 800ms
};

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private startTimes: Map<string, number> = new Map();
  private page: Page;
  private context: BrowserContext;
  private testName: string;

  constructor(page: Page, context: BrowserContext, testName: string) {
    this.page = page;
    this.context = context;
    this.testName = testName;
    this.setupPerformanceObserver();
  }

  /**
   * Setup performance observer to collect Core Web Vitals
   */
  private async setupPerformanceObserver(): Promise<void> {
    await this.page.addInitScript(() => {
      // Collect Core Web Vitals
      window.performanceMetrics = {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
      };

      // LCP Observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.performanceMetrics.lcp = lastEntry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });

      // FID Observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          window.performanceMetrics.fid = entry.processingStart - entry.startTime;
        });
      }).observe({ type: "first-input", buffered: true });

      // CLS Observer
      new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        window.performanceMetrics.cls = clsValue;
      }).observe({ type: "layout-shift", buffered: true });

      // FCP Observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            window.performanceMetrics.fcp = entry.startTime;
          }
        });
      }).observe({ type: "paint", buffered: true });

      // TTFB Calculation
      window.addEventListener("load", () => {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        window.performanceMetrics.ttfb = navigation.responseStart - navigation.requestStart;
      });
    });
  }

  /**
   * Start timing a custom metric
   */
  startTiming(metricName: string): void {
    this.startTimes.set(metricName, Date.now());
  }

  /**
   * End timing a custom metric
   */
  endTiming(metricName: string): number {
    const startTime = this.startTimes.get(metricName);
    if (!startTime) {
      throw new Error(`No start time found for metric: ${metricName}`);
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(metricName);
    return duration;
  }

  /**
   * Measure patient data loading time
   */
  async measurePatientDataLoad(
    selector = '[data-testid="patient-list"]',
  ): Promise<number> {
    this.startTiming("patientDataLoad");
    await this.page.waitForSelector(selector, { state: "visible" });
    const loadTime = this.endTiming("patientDataLoad");
    this.metrics.patientDataLoadTime = loadTime;
    return loadTime;
  }

  /**
   * Measure form submission time
   */
  async measureFormSubmission(
    submitSelector: string,
    successSelector: string,
  ): Promise<number> {
    this.startTiming("formSubmission");
    await this.page.click(submitSelector);
    await this.page.waitForSelector(successSelector, { state: "visible" });
    const submissionTime = this.endTiming("formSubmission");
    this.metrics.formSubmissionTime = submissionTime;
    return submissionTime;
  }

  /**
   * Measure navigation time between pages
   */
  async measureNavigation(
    navigationAction: () => Promise<void>,
    expectedUrl?: string,
  ): Promise<number> {
    this.startTiming("navigation");
    await navigationAction();

    if (expectedUrl) {
      await this.page.waitForURL(expectedUrl);
    } else {
      await this.page.waitForLoadState("networkidle");
    }

    const navigationTime = this.endTiming("navigation");
    this.metrics.navigationTime = navigationTime;
    return navigationTime;
  }

  /**
   * Measure search response time
   */
  async measureSearchResponse(
    searchInput: string,
    searchQuery: string,
    resultsSelector: string,
  ): Promise<number> {
    this.startTiming("searchResponse");
    await this.page.fill(searchInput, searchQuery);
    await this.page.waitForSelector(resultsSelector, { state: "visible" });
    const responseTime = this.endTiming("searchResponse");
    this.metrics.searchResponseTime = responseTime;
    return responseTime;
  }

  /**
   * Collect all performance metrics
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    // Get Core Web Vitals from browser
    const webVitals = await this.page.evaluate(() => window.performanceMetrics);

    // Get resource metrics
    const resourceMetrics = await this.page.evaluate(() => {
      const resources = performance.getEntriesByType("resource");
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      return {
        totalRequests: resources.length,
        failedRequests: resources.filter((r) => r.transferSize === 0).length,
        totalTransferSize: resources.reduce(
          (sum, r) => sum + r.transferSize,
          0,
        ),
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
      };
    });

    // Get JS heap size
    const jsHeapSize = await this.page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Get viewport info
    const viewport = this.page.viewportSize() || { width: 1920, height: 1080 };

    const completeMetrics: PerformanceMetrics = {
      ...webVitals,
      ...resourceMetrics,
      ...this.metrics,
      jsHeapSize,
      testName: this.testName,
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      userAgent: await this.page.evaluate(() => navigator.userAgent),
      viewport,
    } as PerformanceMetrics;

    return completeMetrics;
  }

  /**
   * Validate metrics against performance budget
   */
  validateBudget(
    metrics: PerformanceMetrics,
    budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET,
  ): {
    passed: boolean;
    violations: { metric: string; actual: number; budget: number; }[];
  } {
    const violations: { metric: string; actual: number; budget: number; }[] = [];

    Object.entries(budget).forEach(([key, budgetValue]) => {
      const actualValue = metrics[key as keyof PerformanceMetrics] as number;
      if (actualValue > budgetValue) {
        violations.push({
          metric: key,
          actual: actualValue,
          budget: budgetValue,
        });
      }
    });

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}

/**
 * Performance Reporter for generating reports
 */
export class PerformanceReporter {
  private metricsHistory: PerformanceMetrics[] = [];
  private reportDir: string;

  constructor(reportDir = "./test-results/performance") {
    this.reportDir = reportDir;
    this.ensureReportDirectory();
  }

  private ensureReportDirectory(): void {
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Add metrics to history
   */
  addMetrics(metrics: PerformanceMetrics): void {
    this.metricsHistory.push(metrics);
  }

  /**
   * Generate JSON report
   */
  generateJSONReport(): void {
    const reportPath = join(this.reportDir, `performance-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(this.metricsHistory, null, 2));
    console.log(`Performance report generated: ${reportPath}`);
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(): void {
    const html = this.generateHTMLContent();
    const reportPath = join(this.reportDir, `performance-${Date.now()}.html`);
    writeFileSync(reportPath, html);
    console.log(`Performance HTML report generated: ${reportPath}`);
  }

  private generateHTMLContent(): string {
    const avgMetrics = this.calculateAverageMetrics();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeonPro E2E Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; margin-bottom: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1e293b; }
        .metric-label { color: #64748b; font-size: 14px; margin-top: 5px; }
        .good { border-left-color: #10b981; }
        .warning { border-left-color: #f59e0b; }
        .poor { border-left-color: #ef4444; }
        .test-results { margin-top: 30px; }
        .test-item { background: #f8fafc; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
        .test-name { font-weight: bold; color: #1e293b; }
        .test-url { color: #64748b; font-size: 12px; }
        .timestamp { color: #64748b; font-size: 12px; float: right; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 NeonPro E2E Performance Report</h1>
        
        <h2>📊 Average Metrics</h2>
        <div class="metrics-grid">
            <div class="metric-card ${this.getMetricClass("lcp", avgMetrics.lcp)}">
                <div class="metric-value">${avgMetrics.lcp.toFixed(0)}ms</div>
                <div class="metric-label">Largest Contentful Paint</div>
            </div>
            <div class="metric-card ${this.getMetricClass("fid", avgMetrics.fid)}">
                <div class="metric-value">${avgMetrics.fid.toFixed(0)}ms</div>
                <div class="metric-label">First Input Delay</div>
            </div>
            <div class="metric-card ${this.getMetricClass("cls", avgMetrics.cls)}">
                <div class="metric-value">${avgMetrics.cls.toFixed(3)}</div>
                <div class="metric-label">Cumulative Layout Shift</div>
            </div>
            <div class="metric-card ${this.getMetricClass("fcp", avgMetrics.fcp)}">
                <div class="metric-value">${avgMetrics.fcp.toFixed(0)}ms</div>
                <div class="metric-label">First Contentful Paint</div>
            </div>
            <div class="metric-card ${
      this.getMetricClass("patientDataLoadTime", avgMetrics.patientDataLoadTime)
    }">
                <div class="metric-value">${avgMetrics.patientDataLoadTime.toFixed(0)}ms</div>
                <div class="metric-label">Patient Data Load Time</div>
            </div>
            <div class="metric-card ${
      this.getMetricClass("formSubmissionTime", avgMetrics.formSubmissionTime)
    }">
                <div class="metric-value">${avgMetrics.formSubmissionTime.toFixed(0)}ms</div>
                <div class="metric-label">Form Submission Time</div>
            </div>
        </div>
        
        <h2>🧪 Test Results</h2>
        <div class="test-results">
            ${
      this.metricsHistory
        .map(
          (metric) => `
                <div class="test-item">
                    <div class="test-name">${metric.testName}</div>
                    <div class="test-url">${metric.url}</div>
                    <div class="timestamp">${
            new Date(metric.timestamp).toLocaleString("pt-BR")
          }</div>
                </div>
            `,
        )
        .join("")
    }
        </div>
        
        <p><small>Generated on ${new Date().toLocaleString("pt-BR")}</small></p>
    </div>
</body>
</html>
    `;
  }

  private calculateAverageMetrics(): PerformanceMetrics {
    if (this.metricsHistory.length === 0) {
      return {} as PerformanceMetrics;
    }

    const sums = this.metricsHistory.reduce(
      (acc, metrics) => {
        Object.entries(metrics).forEach(([key, value]) => {
          if (typeof value === "number") {
            acc[key] = (acc[key] || 0) + value;
          }
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const averages = {} as PerformanceMetrics;
    Object.entries(sums).forEach(([key, sum]) => {
      (averages as any)[key] = sum / this.metricsHistory.length;
    });

    return averages;
  }

  private getMetricClass(metric: string, value: number): string {
    const budget = DEFAULT_PERFORMANCE_BUDGET[metric as keyof PerformanceBudget];
    if (!budget) {
      return "";
    }

    if (value <= budget * 0.8) {
      return "good";
    }
    if (value <= budget) {
      return "warning";
    }
    return "poor";
  }

  /**
   * Generate summary statistics
   */
  generateSummary(): {
    totalTests: number;
    averageMetrics: Partial<PerformanceMetrics>;
    budgetViolations: number;
    worstPerformingTests: { testName: string; metric: string; value: number; }[];
  } {
    const averageMetrics = this.calculateAverageMetrics();
    const budgetViolations = this.metricsHistory.filter((metrics) => {
      const monitor = new PerformanceMonitor(
        {} as Page,
        {} as BrowserContext,
        "",
      );
      return !monitor.validateBudget(metrics).passed;
    }).length;

    const worstPerformingTests = this.metricsHistory
      .flatMap((metrics) =>
        Object.entries(DEFAULT_PERFORMANCE_BUDGET).map(([metric, budget]) => ({
          testName: metrics.testName,
          metric,
          value: metrics[metric as keyof PerformanceMetrics] as number,
          budget,
        }))
      )
      .filter((item) => item.value > item.budget)
      .sort((a, b) => b.value / b.budget - a.value / a.budget)
      .slice(0, 5);

    return {
      totalTests: this.metricsHistory.length,
      averageMetrics,
      budgetViolations,
      worstPerformingTests,
    };
  }
}

// Global performance metrics interface for browser context
declare global {
  interface Window {
    performanceMetrics: {
      lcp: number;
      fid: number;
      cls: number;
      fcp: number;
      ttfb: number;
    };
  }
}

export default PerformanceMonitor;
