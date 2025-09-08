/**
 * Performance Test for Patient Dashboard
 * Tests Core Web Vitals and healthcare-specific performance metrics
 */

import { expect, test, } from '@playwright/test'
import {
  getPerformanceBudget,
  getTestConfig,
  HEALTHCARE_PERFORMANCE_ASSERTIONS,
  PERFORMANCE_SELECTORS,
} from '../../config/performance.config'
import { PerformanceMonitor, PerformanceReporter, } from '../../utils/performance-metrics'

// Global performance reporter
let performanceReporter: PerformanceReporter

test.describe('Patient Dashboard Performance', () => {
  test.beforeAll(async () => {
    performanceReporter = new PerformanceReporter(
      './test-results/performance/patient-dashboard',
    )
  },)

  test.afterAll(async () => {
    // Generate performance reports
    performanceReporter.generateJSONReport()
    performanceReporter.generateHTMLReport()

    const summary = performanceReporter.generateSummary()
    console.log('\n📊 Performance Test Summary:',)
    console.log(`Total Tests: ${summary.totalTests}`,)
    console.log(`Budget Violations: ${summary.budgetViolations}`,)

    if (summary.worstPerformingTests.length > 0) {
      console.log('\n⚠️ Worst Performing Tests:',)
      summary.worstPerformingTests.forEach((test,) => {
        console.log(`  ${test.testName}: ${test.metric} = ${test.value}ms`,)
      },)
    }
  },)

  test('should load patient dashboard within performance budget', async ({ page, context, },) => {
    const testName = 'Patient Dashboard Load'
    const monitor = new PerformanceMonitor(page, context, testName,)
    const testUrl = '/patients/dashboard'

    // Get performance budget and config for this page
    const budget = getPerformanceBudget(testUrl,)
    const config = getTestConfig(testUrl,)

    console.log(`\n🏥 Testing: ${testName}`,)
    console.log(
      `📋 Budget: LCP=${budget.lcp}ms, FID=${budget.fid}ms, CLS=${budget.cls}`,
    )

    // Navigate to patient dashboard
    await page.goto('/patients/dashboard',)

    // Wait for critical content to load
    await page.waitForSelector(PERFORMANCE_SELECTORS.patientList, {
      state: 'visible',
      timeout: budget.patientDataLoadTime * 2, // Allow 2x budget for timeout
    },)

    // Measure patient data loading time
    const patientDataLoadTime = await monitor.measurePatientDataLoad(
      PERFORMANCE_SELECTORS.patientList,
    )
    console.log(`👥 Patient Data Load Time: ${patientDataLoadTime}ms`,)

    // Test navigation performance
    const navigationTime = await monitor.measureNavigation(async () => {
      await page.click('[data-testid="patient-details-tab"]',)
    },)
    console.log(`🧭 Navigation Time: ${navigationTime}ms`,)

    // Test search performance
    const searchTime = await monitor.measureSearchResponse(
      PERFORMANCE_SELECTORS.searchInput,
      'João Silva',
      PERFORMANCE_SELECTORS.searchResults,
    )
    console.log(`🔍 Search Response Time: ${searchTime}ms`,)

    // Collect all performance metrics
    const metrics = await monitor.collectMetrics()
    performanceReporter.addMetrics(metrics,)

    console.log('\n📈 Core Web Vitals:',)
    console.log(`  LCP: ${metrics.lcp}ms`,)
    console.log(`  FID: ${metrics.fid}ms`,)
    console.log(`  CLS: ${metrics.cls}`,)
    console.log(`  FCP: ${metrics.fcp}ms`,)
    console.log(`  TTFB: ${metrics.ttfb}ms`,)

    // Validate against performance budget
    const validation = monitor.validateBudget(metrics, budget,)

    if (!validation.passed) {
      console.log('\n❌ Performance Budget Violations:',)
      validation.violations.forEach((violation,) => {
        console.log(
          `  ${violation.metric}: ${violation.actual} > ${violation.budget}`,
        )
      },)
    } else {
      console.log('\n✅ All performance metrics within budget',)
    }

    // Healthcare-specific performance assertions
    expect(patientDataLoadTime,).toBeLessThan(
      HEALTHCARE_PERFORMANCE_ASSERTIONS.patientDataLoad.maxTime,
    )
    expect(navigationTime,).toBeLessThan(
      HEALTHCARE_PERFORMANCE_ASSERTIONS.clinicalNavigation.maxTime,
    )
    expect(searchTime,).toBeLessThan(
      HEALTHCARE_PERFORMANCE_ASSERTIONS.clinicalSearch.maxTime,
    )

    // Core Web Vitals assertions
    expect(metrics.lcp,).toBeLessThan(budget.lcp,)
    expect(metrics.fid,).toBeLessThan(budget.fid,)
    expect(metrics.cls,).toBeLessThan(budget.cls,)
    expect(metrics.fcp,).toBeLessThan(budget.fcp,)
    expect(metrics.ttfb,).toBeLessThan(budget.ttfb,)

    // Fail test if critical budget violations exist and strict mode is enabled
    if (config.thresholds.failOnBudgetViolation && !validation.passed) {
      const criticalViolations = validation.violations.filter((v,) =>
        config.thresholds.criticalMetrics.includes(v.metric,)
      )

      if (criticalViolations.length > 0) {
        throw new Error(
          `Critical performance budget violations: ${
            criticalViolations.map((v,) => v.metric).join(', ',)
          }`,
        )
      }
    }
  })

  test('should handle patient form submission performance', async ({ page, context, },) => {
    const testName = 'Patient Form Submission'
    const monitor = new PerformanceMonitor(page, context, testName,)
    const budget = getPerformanceBudget('/patients/new',)

    console.log(`\n🏥 Testing: ${testName}`,)

    // Navigate to new patient form
    await page.goto('/patients/new',)
    await page.waitForSelector(PERFORMANCE_SELECTORS.medicalForm, {
      state: 'visible',
    },)

    // Fill out patient form
    await page.fill('[data-testid="patient-name"]', 'Maria Santos',)
    await page.fill('[data-testid="patient-cpf"]', '123.456.789-00',)
    await page.fill('[data-testid="patient-birth-date"]', '1985-03-15',)
    await page.selectOption('[data-testid="patient-gender"]', 'female',)
    await page.fill('[data-testid="patient-phone"]', '(11) 99999-9999',)
    await page.fill('[data-testid="patient-email"]', 'maria.santos@email.com',)

    // Measure form submission performance
    const submissionTime = await monitor.measureFormSubmission(
      '[data-testid="submit-patient-form"]',
      PERFORMANCE_SELECTORS.successMessage,
    )

    console.log(`📝 Form Submission Time: ${submissionTime}ms`,)

    // Collect metrics
    const metrics = await monitor.collectMetrics()
    performanceReporter.addMetrics(metrics,)

    // Healthcare-specific assertion
    expect(submissionTime,).toBeLessThan(
      HEALTHCARE_PERFORMANCE_ASSERTIONS.medicalFormSubmission.maxTime,
    )

    // Budget assertion
    expect(submissionTime,).toBeLessThan(budget.formSubmissionTime,)
  })

  test('should maintain performance during patient search', async ({ page, context, },) => {
    const testName = 'Patient Search Performance'
    const monitor = new PerformanceMonitor(page, context, testName,)
    const budget = getPerformanceBudget('/patients',)

    console.log(`\n🏥 Testing: ${testName}`,)

    // Navigate to patients page
    await page.goto('/patients',)
    await page.waitForSelector(PERFORMANCE_SELECTORS.patientList, {
      state: 'visible',
    },)

    // Test multiple search scenarios
    const searchQueries = [
      'João',
      'Silva',
      '123.456.789-00',
      'joao.silva@email.com',
    ]

    const searchTimes: number[] = []

    for (const query of searchQueries) {
      // Clear previous search
      await page.fill(PERFORMANCE_SELECTORS.searchInput, '',)
      await page.waitForTimeout(500,) // Allow UI to reset

      // Perform search and measure time
      const searchTime = await monitor.measureSearchResponse(
        PERFORMANCE_SELECTORS.searchInput,
        query,
        PERFORMANCE_SELECTORS.searchResults,
      )

      searchTimes.push(searchTime,)
      console.log(`🔍 Search "${query}": ${searchTime}ms`,)

      // Verify search results are displayed
      await expect(
        page.locator(PERFORMANCE_SELECTORS.searchResults,),
      ).toBeVisible()
    }

    // Calculate average search time
    const avgSearchTime = searchTimes.reduce((sum, time,) => sum + time, 0,) / searchTimes.length
    console.log(`📊 Average Search Time: ${avgSearchTime.toFixed(0,)}ms`,)

    // Collect final metrics
    const metrics = await monitor.collectMetrics()
    performanceReporter.addMetrics(metrics,)

    // Performance assertions
    expect(avgSearchTime,).toBeLessThan(budget.searchResponseTime,)
    expect(Math.max(...searchTimes,),).toBeLessThan(
      HEALTHCARE_PERFORMANCE_ASSERTIONS.clinicalSearch.maxTime,
    )
  })

  test('should handle emergency page performance', async ({ page, context, },) => {
    const testName = 'Emergency Page Performance'
    const monitor = new PerformanceMonitor(page, context, testName,)
    const budget = getPerformanceBudget('/emergency',)

    console.log(`\n🚨 Testing: ${testName} (Critical Page)`,)

    // Navigate to emergency page
    const navigationTime = await monitor.measureNavigation(async () => {
      await page.goto('/emergency',)
    }, '/emergency',)

    // Wait for critical emergency elements
    await page.waitForSelector(PERFORMANCE_SELECTORS.emergencyAlert, {
      state: 'visible',
      timeout: HEALTHCARE_PERFORMANCE_ASSERTIONS.emergencyResponse.maxTime * 2,
    },)

    // Measure critical data loading
    const criticalDataTime = await monitor.measurePatientDataLoad(
      PERFORMANCE_SELECTORS.criticalValues,
    )

    console.log(`🚨 Emergency Navigation: ${navigationTime}ms`,)
    console.log(`⚡ Critical Data Load: ${criticalDataTime}ms`,)

    // Collect metrics
    const metrics = await monitor.collectMetrics()
    performanceReporter.addMetrics(metrics,)

    // Strict emergency performance requirements
    expect(navigationTime,).toBeLessThan(
      HEALTHCARE_PERFORMANCE_ASSERTIONS.emergencyResponse.maxTime,
    )
    expect(criticalDataTime,).toBeLessThan(
      HEALTHCARE_PERFORMANCE_ASSERTIONS.patientDataLoad.maxTime,
    )

    // Emergency pages must meet critical budget
    expect(metrics.lcp,).toBeLessThan(budget.lcp,)
    expect(metrics.fid,).toBeLessThan(budget.fid,)

    console.log('✅ Emergency page performance meets critical requirements',)
  })

  test('should monitor memory usage during extended session', async ({ page, context, },) => {
    const testName = 'Extended Session Memory Performance'
    const monitor = new PerformanceMonitor(page, context, testName,)

    console.log(`\n🧠 Testing: ${testName}`,)

    const memorySnapshots: number[] = []

    // Simulate extended healthcare session
    const pages = [
      '/patients/dashboard',
      '/patients/123',
      '/appointments',
      '/medical-records/456',
      '/prescriptions',
      '/lab-results/789',
    ]

    for (const pagePath of pages) {
      await page.goto(pagePath,)
      await page.waitForLoadState('networkidle',)

      // Take memory snapshot
      const jsHeapSize = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      },)

      memorySnapshots.push(jsHeapSize,)
      console.log(
        `📄 ${pagePath}: ${(jsHeapSize / 1024 / 1024).toFixed(2,)} MB`,
      )

      // Small delay between page visits
      await page.waitForTimeout(1000,)
    }

    // Collect final metrics
    const metrics = await monitor.collectMetrics()
    performanceReporter.addMetrics(metrics,)

    // Memory growth analysis
    const initialMemory = memorySnapshots[0]
    const finalMemory = memorySnapshots[memorySnapshots.length - 1]
    const memoryGrowth = finalMemory - initialMemory
    const memoryGrowthMB = memoryGrowth / 1024 / 1024

    console.log(`📈 Memory Growth: ${memoryGrowthMB.toFixed(2,)} MB`,)

    // Memory assertions (should not grow excessively)
    expect(memoryGrowthMB,).toBeLessThan(50,) // Less than 50MB growth
    expect(finalMemory / 1024 / 1024,).toBeLessThan(200,) // Less than 200MB total
  })
})
