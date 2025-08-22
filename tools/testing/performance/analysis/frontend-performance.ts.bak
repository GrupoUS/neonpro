/**
 * Frontend Performance Testing for NeonPro Healthcare
 *
 * Tests React component performance, bundle optimization, and user experience metrics
 */

import { performance } from 'perf_hooks';
import puppeteer, { type Browser, type Page } from 'puppeteer';

export interface FrontendPerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  componentMetrics: ComponentMetrics;
  bundleMetrics: BundleMetrics;
  userInteractionMetrics: UserInteractionMetrics;
  accessibilityMetrics: AccessibilityMetrics;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface ComponentMetrics {
  renderTime: number;
  reRenderCount: number;
  memoryLeaks: boolean;
  unusedComponents: string[];
}

export interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  cacheHitRate: number;
  loadTime: number;
}

export interface UserInteractionMetrics {
  formSubmissionTime: number;
  navigationTime: number;
  searchResponseTime: number;
  filteringTime: number;
}

export interface AccessibilityMetrics {
  score: number;
  violations: AccessibilityViolation[];
}

export interface AccessibilityViolation {
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  message: string;
}

export class FrontendPerformanceTester {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-web-security']
    });
    this.page = await this.browser.newPage();
    
    // Enable performance monitoring
    await this.page.evaluateOnNewDocument(() => {
      // Inject performance monitoring code
      window.performanceMetrics = {
        componentRenders: 0,
        reRenders: 0
      };
    });
  }

  async cleanup(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }  /**
   * Measure Core Web Vitals
   */
  async measureCoreWebVitals(url: string): Promise<CoreWebVitals> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.goto(url, { waitUntil: 'networkidle2' });

    const webVitals = await this.page.evaluate(() => {
      return new Promise<CoreWebVitals>((resolve) => {
        const vitals: Partial<CoreWebVitals> = {};

        // LCP - Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            vitals.lcp = entries[entries.length - 1].startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID - First Input Delay
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            vitals.fid = (entries[0] as any).processingStart - entries[0].startTime;
          }
        }).observe({ entryTypes: ['first-input'] });

        // CLS - Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.cls = entries.reduce((sum, entry) => sum + (entry as any).value, 0);
        }).observe({ entryTypes: ['layout-shift'] });

        // FCP - First Contentful Paint
        const fcpEntry = performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint');
        vitals.fcp = fcpEntry ? fcpEntry.startTime : 0;

        // TTFB - Time to First Byte
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        vitals.ttfb = navEntry ? navEntry.responseStart - navEntry.requestStart : 0;

        setTimeout(() => {
          resolve({
            lcp: vitals.lcp || 0,
            fid: vitals.fid || 0,
            cls: vitals.cls || 0,
            fcp: vitals.fcp || 0,
            ttfb: vitals.ttfb || 0
          });
        }, 3000); // Wait 3 seconds for metrics collection
      });
    });

    return webVitals;
  }
