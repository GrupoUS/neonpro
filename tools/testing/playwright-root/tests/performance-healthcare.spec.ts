/**
 * ⚡ Healthcare Performance Testing - Critical Medical Workflows
 * Emergency Access <100ms | Routine Operations <500ms | Core Web Vitals ≥95%
 * Constitutional Healthcare Performance Standards
 */

import { expect, test } from "@playwright/test";
import {
  HealthcareDataAnonymizer,
  HealthcarePerformanceHelper,
  HealthcareWorkflowHelper,
} from "../utils/healthcare-testing-utils";

test.describe("⚡ Healthcare Performance Testing - Critical Medical Workflows", () => {
  test.beforeEach(async ({ page }) => {
    // Setup healthcare authentication for performance testing
    await HealthcareWorkflowHelper.authenticateHealthcareUser(page, "doctor");

    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performance.mark("healthcare-test-start");
      window.addEventListener("DOMContentLoaded", () => {
        window.performance.mark("healthcare-dom-ready");
      });
    });
  });

  test("should validate emergency access performance (<100ms requirement)", async ({
    page,
  }) => {
    // Test 1: Emergency Patient Data Access
    const testPatient = HealthcareDataAnonymizer.generateAnonymousPatient();

    // Navigate to emergency access interface
    await page.goto("/dashboard/emergency");
    await expect(page.getByTestId("emergency-dashboard")).toBeVisible();

    // Test emergency patient lookup performance
    const emergencyStartTime = Date.now();

    await page.getByTestId("emergency-patient-search").fill(testPatient.id);
    await page.getByTestId("emergency-search-button").click();

    // Wait for emergency data to load
    await expect(page.getByTestId("emergency-patient-data")).toBeVisible();

    const emergencyAccessTime = Date.now() - emergencyStartTime;

    // CRITICAL: Emergency access must be <100ms
    expect(emergencyAccessTime).toBeLessThan(100);

    // Test 2: Emergency Medical History Access
    const historyStartTime = Date.now();

    await page.getByTestId("emergency-medical-history-button").click();
    await expect(page.getByTestId("emergency-medical-history")).toBeVisible();

    const historyAccessTime = Date.now() - historyStartTime;

    expect(historyAccessTime).toBeLessThan(100);

    // Test 3: Emergency Alerts and Warnings
    const alertsStartTime = Date.now();

    await page.getByTestId("emergency-alerts-button").click();
    await expect(page.getByTestId("emergency-alerts-panel")).toBeVisible();

    const alertsAccessTime = Date.now() - alertsStartTime;

    expect(alertsAccessTime).toBeLessThan(100);

    // Test 4: Emergency Contact Information
    const contactStartTime = Date.now();

    await page.getByTestId("emergency-contacts-button").click();
    await expect(page.getByTestId("emergency-contacts-list")).toBeVisible();

    const contactAccessTime = Date.now() - contactStartTime;

    expect(contactAccessTime).toBeLessThan(100);

    // Validate overall emergency workflow performance
    await HealthcareWorkflowHelper.validateEmergencyAccess(
      page,
      testPatient.id,
    );
  });

  test("should validate routine healthcare operations performance (<500ms requirement)", async ({
    page,
  }) => {
    // Test 1: Patient Dashboard Loading
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.goto("/dashboard/patients");
        await expect(page.getByTestId("patients-dashboard")).toBeVisible();
      },
    );

    // Test 2: Appointment Scheduling Performance
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId("schedule-appointment-button").click();
        await expect(page.getByTestId("appointment-form")).toBeVisible();
      },
    );

    // Test 3: Treatment History Loading
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId("treatment-history-tab").click();
        await expect(page.getByTestId("treatment-history-list")).toBeVisible();
      },
    );

    // Test 4: Patient Search Performance
    const testPatient = HealthcareDataAnonymizer.generateAnonymousPatient();

    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId("patient-search-input").fill(testPatient.name);
        await page.getByTestId("search-button").click();
        await expect(page.getByTestId("search-results")).toBeVisible();
      },
    );

    // Test 5: Form Submission Performance
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId("new-patient-button").click();
        await page.getByTestId("patient-name-input").fill(testPatient.name);
        await page.getByTestId("patient-email-input").fill(testPatient.email);
        await page.getByTestId("save-patient-button").click();
        await expect(page.getByTestId("patient-saved-message")).toBeVisible();
      },
    );

    // Test 6: Navigation Performance
    const navigationTests = [
      { path: "/dashboard/analytics", testId: "analytics-dashboard" },
      { path: "/dashboard/appointments", testId: "appointments-dashboard" },
      { path: "/dashboard/treatments", testId: "treatments-dashboard" },
      {
        path: "/dashboard/regulatory-documents",
        testId: "regulatory-documents-list",
      },
    ];

    for (const navTest of navigationTests) {
      await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
        page,
        async () => {
          await page.goto(navTest.path);
          await expect(page.getByTestId(navTest.testId)).toBeVisible();
        },
      );
    }
  });

  test("should validate Core Web Vitals for patient interfaces (≥95% requirement)", async ({
    page,
  }) => {
    // Test 1: Patient Dashboard Core Web Vitals
    await page.goto("/dashboard/patient");

    // Validate comprehensive performance requirements
    await HealthcarePerformanceHelper.validatePerformanceRequirements(page);

    // Test 2: Detailed Core Web Vitals Measurement
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};

          entries.forEach((entry) => {
            if (
              entry.entryType === "paint" &&
              entry.name === "first-contentful-paint"
            ) {
              metrics.fcp = entry.startTime;
            }
            if (entry.entryType === "largest-contentful-paint") {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === "layout-shift") {
              metrics.cls = (metrics.cls || 0) + entry.value;
            }
          });

          // Add navigation timing
          const navigation = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;
          if (navigation) {
            metrics.ttfb = navigation.responseStart - navigation.requestStart;
            metrics.domContentLoaded =
              navigation.domContentLoadedEventEnd - navigation.navigationStart;
            metrics.loadComplete =
              navigation.loadEventEnd - navigation.navigationStart;
          }

          resolve(metrics);
        });

        observer.observe({
          entryTypes: ["paint", "largest-contentful-paint", "layout-shift"],
        });

        // Fallback timeout
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;
          resolve({
            ttfb: navigation?.responseStart - navigation?.requestStart || 0,
            fcp:
              performance.getEntriesByName("first-contentful-paint")[0]
                ?.startTime || 0,
            domContentLoaded:
              navigation?.domContentLoadedEventEnd -
                navigation?.navigationStart || 0,
            loadComplete:
              navigation?.loadEventEnd - navigation?.navigationStart || 0,
          });
        }, 5000);
      });
    });

    // Validate Core Web Vitals thresholds for healthcare
    expect(performanceMetrics.fcp).toBeLessThan(1800); // First Contentful Paint <1.8s
    expect(performanceMetrics.lcp).toBeLessThan(2500); // Largest Contentful Paint <2.5s
    expect(performanceMetrics.cls).toBeLessThan(0.1); // Cumulative Layout Shift <0.1
    expect(performanceMetrics.ttfb).toBeLessThan(600); // Time to First Byte <600ms
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // DOM Content Loaded <2s
    expect(performanceMetrics.loadComplete).toBeLessThan(3000); // Complete Load <3s

    // Test 3: Performance Under Load (Simulated)
    const loadTestPromises = [];
    for (let i = 0; i < 5; i++) {
      loadTestPromises.push(
        page.evaluate(() => fetch("/api/patients").then((r) => r.status)),
      );
    }

    const startTime = Date.now();
    const responses = await Promise.all(loadTestPromises);
    const loadTestTime = Date.now() - startTime;

    // All requests should succeed under load
    responses.forEach((status) => expect(status).toBe(200));

    // Total load test time should be reasonable
    expect(loadTestTime).toBeLessThan(2000);
  });

  test("should validate mobile healthcare performance with accessibility", async ({
    page,
  }) => {
    // Set mobile viewport for healthcare mobile testing
    await page.setViewportSize({ width: 375, height: 667 });

    // Test 1: Mobile Patient Dashboard Performance
    const mobileStartTime = Date.now();

    await page.goto("/dashboard/patient");
    await expect(page.getByTestId("mobile-patient-dashboard")).toBeVisible();

    const mobileDashboardTime = Date.now() - mobileStartTime;

    // Mobile healthcare interfaces should load quickly for patient anxiety reduction
    expect(mobileDashboardTime).toBeLessThan(2000);

    // Test 2: Mobile Touch Response Performance
    const touchResponses = [];

    // Test multiple touch interactions
    for (let i = 0; i < 5; i++) {
      const touchStartTime = Date.now();

      await page.getByTestId("mobile-menu-toggle").tap();
      await expect(page.getByTestId("mobile-navigation")).toBeVisible();

      const touchResponseTime = Date.now() - touchStartTime;
      touchResponses.push(touchResponseTime);

      // Close menu
      await page.getByTestId("mobile-menu-close").tap();
      await expect(page.getByTestId("mobile-navigation")).not.toBeVisible();
    }

    // Average touch response should be fast for healthcare mobile UX
    const avgTouchResponse =
      touchResponses.reduce((a, b) => a + b, 0) / touchResponses.length;

    expect(avgTouchResponse).toBeLessThan(300);

    // Test 3: Mobile Form Performance
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId("mobile-quick-action-button").tap();
        await expect(page.getByTestId("mobile-form-panel")).toBeVisible();
      },
    );

    // Test 4: Mobile Accessibility Performance
    await page.addInitScript(() => {
      // Enable accessibility monitoring
      window.accessibilityMetrics = {
        focusTime: [],
        screenReaderTime: [],
      };
    });

    const accessibilityTestStartTime = Date.now();

    // Test focus management performance
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const accessibilityTestTime = Date.now() - accessibilityTestStartTime;

    expect(accessibilityTestTime).toBeLessThan(500);
  });

  test("should validate performance under various network conditions", async ({
    page,
    context,
  }) => {
    // Test 1: Fast 3G Network Simulation
    await context.route("**/*", async (route) => {
      // Simulate Fast 3G: ~1.6 Mbps down, ~750 Kbps up, ~562ms latency
      await new Promise((resolve) => setTimeout(resolve, 562));
      await route.continue();
    });

    const fast3gStartTime = Date.now();

    await page.goto("/dashboard/emergency");
    await expect(page.getByTestId("emergency-dashboard")).toBeVisible();

    const fast3gLoadTime = Date.now() - fast3gStartTime;

    // Emergency dashboard should load reasonably even on slower networks
    expect(fast3gLoadTime).toBeLessThan(5000);

    // Clear network simulation
    await context.unroute("**/*");

    // Test 2: Slow 3G Network Simulation
    await context.route("**/*", async (route) => {
      // Simulate Slow 3G: ~500 Kbps down, ~500 Kbps up, ~2000ms latency
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    const slow3gStartTime = Date.now();

    await page.goto("/dashboard/patient");
    await expect(page.getByTestId("patient-dashboard")).toBeVisible();

    const slow3gLoadTime = Date.now() - slow3gStartTime;

    // Patient dashboard should still be usable on slow networks
    expect(slow3gLoadTime).toBeLessThan(10_000);

    await context.unroute("**/*");

    // Test 3: Offline Resilience
    await context.setOffline(true);

    // Test offline page functionality
    await page.goto("/dashboard/offline");

    // Should show offline message
    await expect(page.getByTestId("offline-message")).toBeVisible();
    await expect(page.getByTestId("offline-instructions")).toBeVisible();

    // Test cached data availability
    const cachedData = await page.evaluate(() => {
      return localStorage.getItem("cached_patient_data") !== null;
    });

    // Some data should be available offline for healthcare continuity
    expect(cachedData).toBe(true);

    await context.setOffline(false);
  });

  test("should validate database and API performance for healthcare operations", async ({
    page,
  }) => {
    // Test 1: Database Query Performance
    const dbQueries = [
      { endpoint: "/api/patients", operation: "Patient List" },
      { endpoint: "/api/appointments", operation: "Appointments" },
      { endpoint: "/api/treatments", operation: "Treatments" },
      { endpoint: "/api/analytics/dashboard", operation: "Analytics" },
    ];

    for (const query of dbQueries) {
      let apiResponseTime = 0;

      await page.route(query.endpoint, async (route) => {
        const startTime = Date.now();
        await route.continue();
        apiResponseTime = Date.now() - startTime;
      });

      await page.goto(`/dashboard/${query.operation.toLowerCase()}`);

      // Database queries should be fast for healthcare responsiveness
      expect(apiResponseTime).toBeLessThan(1000);

      await page.unroute(query.endpoint);
    }

    // Test 2: Concurrent API Request Performance
    const concurrentStartTime = Date.now();

    const concurrentRequests = [
      page.evaluate(() => fetch("/api/patients")),
      page.evaluate(() => fetch("/api/appointments")),
      page.evaluate(() => fetch("/api/analytics/kpis")),
      page.evaluate(() => fetch("/api/notifications")),
    ];

    const responses = await Promise.all(concurrentRequests);
    const concurrentTime = Date.now() - concurrentStartTime;

    // All requests should succeed
    responses.forEach((response) => expect(response.status).toBe(200));

    // Concurrent requests should complete reasonably fast
    expect(concurrentTime).toBeLessThan(2000);

    // Test 3: Large Dataset Performance
    await page.goto("/dashboard/analytics");

    const largeDataStartTime = Date.now();

    // Simulate large dataset request
    await page.getByTestId("date-range-start").fill("01/01/2020");
    await page.getByTestId("date-range-end").fill("31/12/2024");
    await page.getByTestId("apply-filters-button").click();

    await expect(page.getByTestId("analytics-charts")).toBeVisible();

    const largeDataTime = Date.now() - largeDataStartTime;

    // Large dataset should process within reasonable time
    expect(largeDataTime).toBeLessThan(5000);
  });

  test("should validate healthcare memory and resource usage", async ({
    page,
  }) => {
    // Test 1: Memory Usage Monitoring
    await page.goto("/dashboard/patient");

    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            usedJSMemory: (performance as any).memory.usedJSMemory,
            totalJSMemory: (performance as any).memory.totalJSMemory,
            jsMemoryLimit: (performance as any).memory.jsMemoryLimit,
          }
        : undefined;
    });

    // Perform memory-intensive operations
    for (let i = 0; i < 10; i++) {
      await page.goto("/dashboard/analytics");
      await page.goto("/dashboard/patients");
      await page.goto("/dashboard/appointments");
    }

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            usedJSMemory: (performance as any).memory.usedJSMemory,
            totalJSMemory: (performance as any).memory.totalJSMemory,
            jsMemoryLimit: (performance as any).memory.jsMemoryLimit,
          }
        : undefined;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease =
        finalMemory.usedJSMemory - initialMemory.usedJSMemory;

      // Memory usage should not increase excessively
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // <50MB increase
    }

    // Test 2: Resource Cleanup Validation
    const resourceCounts = await page.evaluate(() => {
      const images = document.images.length;
      const scripts = document.scripts.length;
      const stylesheets = document.styleSheets.length;
      const eventListeners = document.querySelectorAll(
        "*[onclick], *[onload]",
      ).length;

      return { images, scripts, stylesheets, eventListeners };
    });

    // Resource counts should be reasonable for healthcare application
    expect(resourceCounts.images).toBeLessThan(50);
    expect(resourceCounts.scripts).toBeLessThan(20);
    expect(resourceCounts.stylesheets).toBeLessThan(10);
    expect(resourceCounts.eventListeners).toBeLessThan(5); // Prefer modern event handling

    // Final performance validation
    await HealthcarePerformanceHelper.validatePerformanceRequirements(page);
  });
});
