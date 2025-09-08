/**
 * Performance Audit Suite for NeonPro Healthcare
 *
 * Comprehensive performance testing and optimization utilities
 */

import lighthouse from 'lighthouse'
import { performance, } from 'node:perf_hooks'
import puppeteer from 'puppeteer'

export interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number
  speedIndex: number
}

export interface HealthcarePerformanceMetrics {
  emergencyAccessTime: number
  patientDataLoadTime: number
  appointmentLoadTime: number
  formSubmissionTime: number
  realTimeUpdateLatency: number
  databaseQueryTime: number
}

export class PerformanceAuditor {
  private browser: puppeteer.Browser | null = undefined

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox',],
    },)
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
    }
  }

  /**
   * Run Lighthouse audit on a page
   */
  async runLighthouseAudit(url: string,): Promise<{
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
    metrics: PerformanceMetrics
  }> {
    const result = await lighthouse(url, {
      port: 9222,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo',],
      settings: {
        maxWaitForFcp: 15 * 1000,
        maxWaitForLoad: 35 * 1000,
        formFactor: 'desktop',
      },
    },)

    const lhr = result?.lhr
    if (!lhr) {
      throw new Error('Lighthouse audit failed',)
    }

    return {
      performance: Math.round(lhr.categories.performance.score! * 100,),
      accessibility: Math.round(lhr.categories.accessibility.score! * 100,),
      bestPractices: Math.round(lhr.categories['best-practices'].score! * 100,),
      seo: Math.round(lhr.categories.seo.score! * 100,),
      metrics: {
        pageLoadTime: lhr.audits['speed-index'].numericValue || 0,
        firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue || 0,
        largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue || 0,
        firstInputDelay: lhr.audits['max-potential-fid'].numericValue || 0,
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue || 0,
        timeToInteractive: lhr.audits.interactive.numericValue || 0,
        speedIndex: lhr.audits['speed-index'].numericValue || 0,
      },
    }
  }

  /**
   * Test healthcare-specific performance metrics
   */
  async testHealthcareMetrics(
    baseUrl: string,
  ): Promise<HealthcarePerformanceMetrics> {
    if (!this.browser) {
      throw new Error('Browser not initialized',)
    }

    const page = await this.browser.newPage()

    try {
      // Test emergency access time
      const emergencyStart = performance.now()
      await page.goto(`${baseUrl}/emergency-access`,)
      await page.waitForSelector('[data-testid="emergency-form"]', {
        timeout: 10_000,
      },)
      const emergencyEnd = performance.now()

      // Test patient data loading
      const patientStart = performance.now()
      await page.goto(`${baseUrl}/patients`,)
      await page.waitForSelector('[data-testid="patient-list"]', {
        timeout: 5000,
      },)
      const patientEnd = performance.now()

      // Test appointment loading
      const appointmentStart = performance.now()
      await page.goto(`${baseUrl}/appointments`,)
      await page.waitForSelector('[data-testid="appointment-calendar"]', {
        timeout: 5000,
      },)
      const appointmentEnd = performance.now()

      // Test form submission
      await page.goto(`${baseUrl}/patients/new`,)
      await page.waitForSelector('[data-testid="patient-form"]',)

      const formStart = performance.now()
      await page.fill('[name="name"]', 'Test Patient',)
      await page.fill('[name="email"]', 'test@example.com',)
      await page.click('[type="submit"]',)
      await page.waitForSelector('[data-testid="success-message"]', {
        timeout: 3000,
      },)
      const formEnd = performance.now()

      return {
        emergencyAccessTime: emergencyEnd - emergencyStart,
        patientDataLoadTime: patientEnd - patientStart,
        appointmentLoadTime: appointmentEnd - appointmentStart,
        formSubmissionTime: formEnd - formStart,
        realTimeUpdateLatency: 0, // Will be tested separately
        databaseQueryTime: 0, // Will be tested separately
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Test API performance
   */
  async testApiPerformance(apiUrl: string,): Promise<{
    responseTime: number
    throughput: number
    errorRate: number
  }> {
    const startTime = performance.now()
    let successCount = 0
    let errorCount = 0
    const concurrency = 10
    const requests = 100

    const promises = Array.from({ length: concurrency, }, async () => {
      for (let i = 0; i < requests / concurrency; i++) {
        try {
          const response = await fetch(`${apiUrl}/health`,)
          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch {
          errorCount++
        }
      }
    },)

    await Promise.all(promises,)
    const endTime = performance.now()
    const totalTime = endTime - startTime

    return {
      responseTime: totalTime / requests,
      throughput: requests / (totalTime / 1000),
      errorRate: errorCount / (successCount + errorCount),
    }
  }
}
