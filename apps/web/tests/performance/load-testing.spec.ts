/**
 * PERFORMANCE TEST: Patient dashboard load testing (T029)
 *
 * Tests load performance for patient dashboard under realistic conditions:
 * - Concurrent user simulation
 * - Database query optimization validation
 * - Frontend rendering performance
 * - API response time under load
 * - Memory usage patterns
 * - Brazilian healthcare peak usage scenarios
 */

import { chromium, expect, test } from '@playwright/test';

// Brazilian healthcare usage patterns
const BRAZILIAN_HEALTHCARE_PATTERNS = {
  PEAK_HOURS: {
    morning: { start: 8, end: 11 }, // 8-11 AM
    afternoon: { start: 14, end: 17 }, // 2-5 PM
  },
  TYPICAL_CLINIC_SIZES: {
    small: { doctors: 3, patients_per_hour: 15 },
    medium: { doctors: 8, patients_per_hour: 40 },
    large: { doctors: 20, patients_per_hour: 100 },
    hospital: { doctors: 50, patients_per_hour: 250 },
  },
  COMMON_OPERATIONS: [
    { action: 'view_patient_list', frequency: 0.35 },
    { action: 'search_patient', frequency: 0.25 },
    { action: 'view_patient_details', frequency: 0.20 },
    { action: 'update_patient_info', frequency: 0.10 },
    { action: 'create_prescription', frequency: 0.08 },
    { action: 'view_medical_history', frequency: 0.02 },
  ],
};

// Performance metrics thresholds
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: 3000, // 3 seconds
  API_RESPONSE: 500, // 500ms
  SEARCH_RESPONSE: 1000, // 1 second
  DATABASE_QUERY: 200, // 200ms
  MEMORY_USAGE: 100, // 100MB per user session
};

// Test helper for load simulation
class LoadTester {
  private browsers: any[] = [];
  private contexts: any[] = [];
  private pages: any[] = [];

  async createConcurrentUsers(userCount: number) {
    for (let i = 0; i < userCount; i++) {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: `LoadTest-User-${i}`,
        viewport: { width: 1280, height: 720 },
      });
      const page = await context.newPage();

      this.browsers.push(browser);
      this.contexts.push(context);
      this.pages.push(page);
    }
  }

  async loginAllUsers() {
    const loginPromises = this.pages.map(async (page, index) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', `doctor${index}@loadtest.com`);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill(
        '[data-testid="crm-input"]',
        `CRM-SP-${String(index + 100000).padStart(6, '0')}`,
      );
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
    });

    await Promise.all(loginPromises);
  }

  async simulateUserActions(durationMs: number) {
    const endTime = Date.now() + durationMs;
    const actionPromises: Promise<void>[] = [];

    this.pages.forEach((page, userIndex) => {
      const userActionPromise = this.simulateIndividualUserActions(page, userIndex, endTime);
      actionPromises.push(userActionPromise);
    });

    await Promise.all(actionPromises);
  }

  private async simulateIndividualUserActions(page: any, userIndex: number, endTime: number) {
    while (Date.now() < endTime) {
      // Select random action based on Brazilian healthcare patterns
      const randomValue = Math.random();
      let cumulativeFrequency = 0;
      let selectedAction = 'view_patient_list';

      for (const operation of BRAZILIAN_HEALTHCARE_PATTERNS.COMMON_OPERATIONS) {
        cumulativeFrequency += operation.frequency;
        if (randomValue <= cumulativeFrequency) {
          selectedAction = operation.action;
          break;
        }
      }

      try {
        await this.performAction(page, selectedAction, userIndex);

        // Random wait between actions (1-5 seconds)
        await page.waitForTimeout(1000 + Math.random() * 4000);
      } catch (error) {
        console.warn(`User ${userIndex} action ${selectedAction} failed:`, error);
      }
    }
  }

  private async performAction(page: any, action: string, userIndex: number) {
    switch (action) {
      case 'view_patient_list':
        await page.click('[data-testid="patients-menu"]');
        await page.waitForLoadState('networkidle');
        break;

      case 'search_patient':
        const searchTerms = ['João', 'Maria', 'Silva', 'Santos', '123.456'];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        await page.fill('[data-testid="patient-search-input"]', randomTerm);
        await page.waitForTimeout(500);
        break;

      case 'view_patient_details':
        const patientCards = page.locator('[data-testid="patient-card"]');
        const cardCount = await patientCards.count();
        if (cardCount > 0) {
          const randomCard = patientCards.nth(Math.floor(Math.random() * Math.min(cardCount, 5)));
          await randomCard.click();
          await page.waitForLoadState('networkidle');
        }
        break;

      case 'update_patient_info':
        await page.click('[data-testid="edit-patient-button"]');
        await page.fill(
          '[data-testid="phone-input"]',
          `(11) 9${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        );
        await page.click('[data-testid="save-patient-button"]');
        break;

      case 'create_prescription':
        await page.click('[data-testid="prescribe-button"]');
        await page.fill('[data-testid="medication-search"]', 'Losartana');
        await page.waitForTimeout(300);
        const medicationSuggestions = page.locator('[data-testid="medication-suggestion"]');
        if (await medicationSuggestions.count() > 0) {
          await medicationSuggestions.first().click();
        }
        break;

      case 'view_medical_history':
        await page.click('[data-testid="medical-history-tab"]');
        await page.waitForLoadState('networkidle');
        break;
    }
  }

  async collectPerformanceMetrics() {
    const metrics = await Promise.all(
      this.pages.map(async (page, index) => {
        const performanceEntries = await page.evaluate(() => {
          return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')));
        });

        const memoryInfo = await page.evaluate(() => {
          return (performance as any).memory
            ? {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
              jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            }
            : null;
        });

        return {
          userIndex: index,
          navigation: performanceEntries[0],
          memory: memoryInfo,
        };
      }),
    );

    return metrics;
  }

  async cleanup() {
    await Promise.all(this.browsers.map(browser => browser.close()));
    this.browsers = [];
    this.contexts = [];
    this.pages = [];
  }
}

test.describe('Patient Dashboard Load Testing', () => {
  let loadTester: LoadTester;

  test.afterEach(async () => {
    if (loadTester) {
      await loadTester.cleanup();
    }
  });

  test('should handle small clinic load (3 concurrent doctors)', async () => {
    loadTester = new LoadTester();
    const userCount = 3;

    console.log(`Starting load test with ${userCount} concurrent users...`);

    // Create concurrent users
    await loadTester.createConcurrentUsers(userCount);

    // Login all users
    const loginStartTime = Date.now();
    await loadTester.loginAllUsers();
    const loginDuration = Date.now() - loginStartTime;

    console.log(`Login completed for ${userCount} users in ${loginDuration}ms`);
    expect(loginDuration).toBeLessThan(5000); // Should complete within 5 seconds

    // Simulate realistic usage for 2 minutes
    const testDuration = 2 * 60 * 1000; // 2 minutes
    const simulationStartTime = Date.now();

    await loadTester.simulateUserActions(testDuration);

    const simulationDuration = Date.now() - simulationStartTime;
    console.log(`Simulation completed in ${simulationDuration}ms`);

    // Collect performance metrics
    const metrics = await loadTester.collectPerformanceMetrics();

    // Analyze results
    const avgPageLoadTime = metrics.reduce((sum, metric) => sum + metric.navigation.loadEventEnd, 0)
      / metrics.length;
    const avgMemoryUsage = metrics.reduce(
      (sum, metric) => sum + (metric.memory ? metric.memory.usedJSHeapSize / 1024 / 1024 : 0),
      0,
    ) / metrics.length;

    console.log(`Average page load time: ${avgPageLoadTime}ms`);
    console.log(`Average memory usage: ${avgMemoryUsage}MB`);

    // Assertions
    expect(avgPageLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD);
    expect(avgMemoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE);
  });

  test('should handle medium clinic load (8 concurrent doctors)', async () => {
    loadTester = new LoadTester();
    const userCount = 8;

    console.log(`Starting medium load test with ${userCount} concurrent users...`);

    await loadTester.createConcurrentUsers(userCount);

    const loginStartTime = Date.now();
    await loadTester.loginAllUsers();
    const loginDuration = Date.now() - loginStartTime;

    console.log(`Medium clinic login completed in ${loginDuration}ms`);
    expect(loginDuration).toBeLessThan(8000); // Should complete within 8 seconds

    // Simulate 3 minutes of usage
    const testDuration = 3 * 60 * 1000;
    await loadTester.simulateUserActions(testDuration);

    const metrics = await loadTester.collectPerformanceMetrics();

    // Performance should degrade gracefully
    const avgPageLoadTime = metrics.reduce((sum, metric) => sum + metric.navigation.loadEventEnd, 0)
      / metrics.length;
    const maxMemoryUsage = Math.max(
      ...metrics.map(metric => metric.memory ? metric.memory.usedJSHeapSize / 1024 / 1024 : 0),
    );

    console.log(
      `Medium clinic - Avg page load: ${avgPageLoadTime}ms, Max memory: ${maxMemoryUsage}MB`,
    );

    expect(avgPageLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD * 1.5); // Allow 50% degradation
    expect(maxMemoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE * 1.2); // Allow 20% memory increase
  });

  test('should handle large clinic load (20 concurrent doctors)', async () => {
    loadTester = new LoadTester();
    const userCount = 20;

    console.log(`Starting large load test with ${userCount} concurrent users...`);

    await loadTester.createConcurrentUsers(userCount);

    const loginStartTime = Date.now();
    await loadTester.loginAllUsers();
    const loginDuration = Date.now() - loginStartTime;

    console.log(`Large clinic login completed in ${loginDuration}ms`);
    expect(loginDuration).toBeLessThan(15000); // Should complete within 15 seconds

    // Simulate 5 minutes of usage
    const testDuration = 5 * 60 * 1000;
    await loadTester.simulateUserActions(testDuration);

    const metrics = await loadTester.collectPerformanceMetrics();

    // Analyze performance under heavy load
    const loadTimes = metrics.map(metric => metric.navigation.loadEventEnd);
    const avgPageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    const p95PageLoadTime = loadTimes.sort((a, b) => a - b)[Math.floor(loadTimes.length * 0.95)];

    const memoryUsages = metrics.map(metric =>
      metric.memory ? metric.memory.usedJSHeapSize / 1024 / 1024 : 0
    );
    const avgMemoryUsage = memoryUsages.reduce((sum, usage) => sum + usage, 0)
      / memoryUsages.length;

    console.log(
      `Large clinic - Avg load: ${avgPageLoadTime}ms, P95 load: ${p95PageLoadTime}ms, Avg memory: ${avgMemoryUsage}MB`,
    );

    // Should maintain reasonable performance even under load
    expect(avgPageLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD * 2); // Allow 100% degradation
    expect(p95PageLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD * 3); // P95 should be within 3x
    expect(avgMemoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE * 1.5); // Allow 50% memory increase
  });

  test('should test database query performance under load', async ({ page }) => {
    // Test database performance with large dataset
    const patientCounts = [100, 500, 1000, 2000];

    for (const patientCount of patientCounts) {
      console.log(`Testing query performance with ${patientCount} patients...`);

      // Navigate to patient list
      await page.goto('/dashboard/patients');

      // Add query parameter to simulate dataset size
      await page.goto(`/dashboard/patients?test_dataset_size=${patientCount}`);

      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`Load time for ${patientCount} patients: ${loadTime}ms`);

      // Test search performance
      const searchStartTime = Date.now();
      await page.fill('[data-testid="patient-search-input"]', 'João');
      await page.waitForLoadState('networkidle');
      const searchTime = Date.now() - searchStartTime;

      console.log(`Search time for ${patientCount} patients: ${searchTime}ms`);

      // Performance should scale reasonably
      if (patientCount <= 500) {
        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD);
        expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE);
      } else {
        // Allow degradation for larger datasets
        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD * 2);
        expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE * 2);
      }
    }
  });

  test('should test API response times under concurrent requests', async () => {
    const concurrentRequests = [5, 10, 20, 50];

    for (const requestCount of concurrentRequests) {
      console.log(`Testing API performance with ${requestCount} concurrent requests...`);

      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Setup API monitoring
      const apiResponseTimes: number[] = [];

      page.on('response', response => {
        if (response.url().includes('/api/')) {
          const timing = response.timing();
          if (timing) {
            apiResponseTimes.push(timing.responseEnd);
          }
        }
      });

      // Make concurrent API requests
      const requestPromises = Array.from({ length: requestCount }, async (_, index) => {
        const requestPage = await context.newPage();

        // Login and make API calls
        await requestPage.goto('/login');
        await requestPage.fill('[data-testid="email-input"]', `apitest${index}@test.com`);
        await requestPage.fill('[data-testid="password-input"]', 'password123');
        await requestPage.fill(
          '[data-testid="crm-input"]',
          `CRM-SP-${String(index + 200000).padStart(6, '0')}`,
        );
        await requestPage.click('[data-testid="login-button"]');

        await requestPage.goto('/dashboard/patients');
        await requestPage.waitForLoadState('networkidle');

        await requestPage.close();
      });

      const startTime = Date.now();
      await Promise.all(requestPromises);
      const totalTime = Date.now() - startTime;

      console.log(`${requestCount} concurrent requests completed in ${totalTime}ms`);

      if (apiResponseTimes.length > 0) {
        const avgResponseTime = apiResponseTimes.reduce((sum, time) => sum + time, 0)
          / apiResponseTimes.length;
        const maxResponseTime = Math.max(...apiResponseTimes);

        console.log(`Avg API response: ${avgResponseTime}ms, Max: ${maxResponseTime}ms`);

        // API should maintain reasonable response times
        expect(avgResponseTime).toBeLessThan(
          PERFORMANCE_THRESHOLDS.API_RESPONSE * (1 + requestCount / 50),
        );
        expect(maxResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE * 3);
      }

      await browser.close();
    }
  });

  test('should monitor memory leaks during extended usage', async ({ page }) => {
    console.log('Testing for memory leaks during extended usage...');

    // Enable memory monitoring
    await page.goto('/dashboard');

    const memorySnapshots: number[] = [];

    // Take initial memory snapshot
    let initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    memorySnapshots.push(initialMemory);

    console.log(`Initial memory usage: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);

    // Simulate extended usage (15 minutes of actions)
    const cycles = 30; // 30 cycles of 30 seconds each

    for (let cycle = 0; cycle < cycles; cycle++) {
      // Perform typical user actions
      await page.click('[data-testid="patients-menu"]');
      await page.waitForTimeout(1000);

      await page.fill('[data-testid="patient-search-input"]', 'Test Patient');
      await page.waitForTimeout(500);

      const patientCards = page.locator('[data-testid="patient-card"]');
      const cardCount = await patientCards.count();
      if (cardCount > 0) {
        await patientCards.first().click();
        await page.waitForTimeout(1000);
        await page.goBack();
      }

      // Clear search
      await page.fill('[data-testid="patient-search-input"]', '');
      await page.waitForTimeout(500);

      // Take memory snapshot every 5 cycles
      if (cycle % 5 === 0) {
        const currentMemory = await page.evaluate(() => {
          // Force garbage collection if available
          if ((window as any).gc) {
            (window as any).gc();
          }

          return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
        });

        memorySnapshots.push(currentMemory);
        console.log(`Cycle ${cycle}: Memory usage: ${(currentMemory / 1024 / 1024).toFixed(2)}MB`);
      }
    }

    // Analyze memory usage trend
    const finalMemory = memorySnapshots[memorySnapshots.length - 1];
    const memoryGrowth = finalMemory - initialMemory;
    const memoryGrowthPercent = (memoryGrowth / initialMemory) * 100;

    console.log(
      `Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB (${
        memoryGrowthPercent.toFixed(1)
      }%)`,
    );

    // Memory growth should be reasonable (less than 50% increase)
    expect(memoryGrowthPercent).toBeLessThan(50);

    // Final memory usage should be within acceptable limits
    expect(finalMemory / 1024 / 1024).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE * 2);

    // No significant memory leak pattern (consistent growth)
    const recentGrowth = memorySnapshots.slice(-3);
    const isStableOrDecreasing = recentGrowth.every((memory, index) =>
      index === 0 || memory <= recentGrowth[index - 1] * 1.1
    );

    expect(isStableOrDecreasing).toBe(true);
  });
});
