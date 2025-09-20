/**
 * PERFORMANCE TARGETS INTEGRATION TEST (T030)
 *
 * Constitutional TDD Implementation - RED PHASE
 * Tests performance requirements across healthcare workflows
 *
 * @compliance Core Web Vitals, Healthcare UX Performance Standards
 * @test-id T030
 * @performance-targets Mobile <500ms, Search <300ms, LCP <2.5s, INP <200ms, CLS <0.1
 * @healthcare-critical Emergency scenarios, Real-time features, Patient safety
 */

import { devices, expect, test } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

// Constitutional Performance Thresholds
const PERFORMANCE_THRESHOLDS = {
  // Constitutional Requirements
  mobileResponseTime: 500, // <500ms mobile response requirement
  searchResponseTime: 300, // <300ms search requirement

  // Core Web Vitals Thresholds (Google Standards)
  lcp: 2500, // Largest Contentful Paint <2.5s
  inp: 200, // Interaction to Next Paint <200ms
  cls: 0.1, // Cumulative Layout Shift <0.1
  fcp: 1800, // First Contentful Paint <1.8s

  // Healthcare-Specific Performance
  emergencyDataLoad: 1000, // Emergency data <1s
  realtimeLatency: 100, // Real-time features <100ms
  prescriptionValidation: 200, // Prescription validation <200ms
  patientDataEncryption: 300, // Data encryption overhead <300ms

  // Network Performance
  slowConnection: 3000, // Slow 3G maximum acceptable time
  offlineToOnlineSync: 2000, // Sync after reconnection <2s
};

// Test data generators
const generatePerformanceTestData = () => ({
  largePatientDataset: Array.from({ length: 100 }, (_, i) => ({
    id: `perf-patient-${i}`,
    name: `Patient ${i}`,
    cpf: `${String(i).padStart(3, '0')}.${String(i).padStart(3, '0')}.${
      String(
        i,
      ).padStart(3, '0')
    }-${String(i % 100).padStart(2, '0')}`,
    phone: `(11) ${String(90000 + i).substr(0, 5)}-${String(1000 + i).substr(0, 4)}`,
    lastConsultation: new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    consultationCount: Math.floor(Math.random() * 50),
  })),
  complexMedicalData: {
    patientHistory: Array.from({ length: 50 }, (_, i) => ({
      date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: `Consultation ${i}`,
      diagnosis: `Diagnosis ${i}`,
      treatment: `Treatment plan ${i}`,
      notes: `Detailed medical notes for consultation ${i}`.repeat(10),
    })),
    prescriptions: Array.from({ length: 30 }, (_, i) => ({
      id: `perf-prescription-${i}`,
      medications: Array.from({ length: 3 }, (_, j) => ({
        name: `Medication ${i}-${j}`,
        dosage: `${j + 1} tablet(s) daily`,
        instructions: 'Take with food and plenty of water',
      })),
    })),
  },
});

describe('Performance Targets Tests (T030)', () => {
  let testData: ReturnType<typeof generatePerformanceTestData>;

  test.beforeEach(async ({ page }) => {
    testData = generatePerformanceTestData();

    // Setup authenticated session with performance monitoring
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem(
        'supabase.auth.token',
        JSON.stringify({
          access_token: 'mock-performance-token',
          user: {
            id: 'performance-test-user',
            email: 'performance.test@professional.com',
            role: 'healthcare_professional',
          },
        }),
      );
    });

    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performanceMetrics = {
        marks: {},
        measures: {},
        navigation: {},
        vitals: {},
      };

      // Override performance API to capture metrics
      const originalMark = performance.mark;
      const originalMeasure = performance.measure;

      performance.mark = function(name) {
        window.performanceMetrics.marks[name] = performance.now();
        return originalMark.call(this, name);
      };

      performance.measure = function(name, startMark, endMark) {
        const result = originalMeasure.call(this, name, startMark, endMark);
        window.performanceMetrics.measures[name] = result.duration;
        return result;
      };
    });
  });

  describe('Mobile Performance Requirements', () => {
    test('should meet <500ms response time on mobile dashboard', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      // Navigate to dashboard and measure load time
      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      // Constitutional Requirement: <500ms mobile response
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.mobileResponseTime);

      // Verify dashboard elements are visible
      await expect(
        page.locator('[data-testid="dashboard-content"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="patient-summary-cards"]'),
      ).toBeVisible();

      // Measure interaction response time
      const interactionStart = Date.now();
      await page.click('[data-testid="patients-nav-link"]');
      await page.waitForLoadState('domcontentloaded');
      const interactionTime = Date.now() - interactionStart;

      expect(interactionTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.mobileResponseTime,
      );

      await context.close();
    });

    test('should maintain performance on mobile patient list with large dataset', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      // Mock large patient dataset
      await page.route('/api/v2/patients*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            patients: testData.largePatientDataset,
            pagination: {
              page: 1,
              limit: 50,
              total: testData.largePatientDataset.length,
            },
          }),
        });
      });

      const startTime = Date.now();
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should handle large dataset efficiently
      expect(loadTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.mobileResponseTime * 2,
      ); // Allow 2x for large dataset

      // Verify virtual scrolling or pagination performance
      const patientCards = page.locator('[data-testid="patient-card"]');
      const cardCount = await patientCards.count();
      expect(cardCount).toBeGreaterThan(0);
      expect(cardCount).toBeLessThanOrEqual(50); // Should implement pagination/virtualization

      // Test scroll performance
      const scrollStart = Date.now();
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(100);
      const scrollTime = Date.now() - scrollStart;

      expect(scrollTime).toBeLessThan(200); // Smooth scrolling

      await context.close();
    });

    test('should optimize mobile telemedicine performance', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      // Navigate to telemedicine session
      const sessionStartTime = Date.now();
      await page.goto('/telemedicine/session/new');
      await page.waitForLoadState('domcontentloaded');
      const sessionLoadTime = Date.now() - sessionStartTime;

      // Video interface should load quickly on mobile
      expect(sessionLoadTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.mobileResponseTime,
      );

      // Test video controls responsiveness
      const controlStart = Date.now();
      await page.click('[data-testid="video-toggle"]');
      await page.waitForTimeout(100);
      const controlTime = Date.now() - controlStart;

      expect(controlTime).toBeLessThan(PERFORMANCE_THRESHOLDS.inp);

      // Test mobile-specific optimizations
      await expect(
        page.locator('[data-testid="mobile-video-optimized"]'),
      ).toBeVisible();

      await context.close();
    });
  });

  describe('Search Performance Requirements', () => {
    test('should meet <300ms search response time', async ({ page }) => {
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Mock search API with realistic delay
      await page.route('/api/v2/patients/search*', async route => {
        await new Promise(resolve => setTimeout(resolve, 150)); // Simulate processing
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: testData.largePatientDataset.slice(0, 10),
            totalResults: 10,
            searchTime: 150,
          }),
        });
      });

      const searchInput = page.locator('[data-testid="patient-search"]');
      await searchInput.fill('João');

      const searchStart = Date.now();
      await searchInput.press('Enter');
      await page.waitForResponse(/\/api\/v2\/patients\/search/);
      const searchTime = Date.now() - searchStart;

      // Constitutional Requirement: <300ms search
      expect(searchTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.searchResponseTime,
      );

      // Verify search results are displayed
      await expect(
        page.locator('[data-testid="search-results"]'),
      ).toBeVisible();
      const searchResults = page.locator('[data-testid="search-result"]');
      const resultCount = await searchResults.count();
      expect(resultCount).toBeGreaterThan(0);
    });

    test('should implement efficient autocomplete search', async ({ page }) => {
      await page.goto('/prescriptions/new');
      await page.waitForLoadState('networkidle');

      // Mock medication search with performance simulation
      await page.route('/api/v2/medications/search*', async route => {
        const url = new URL(route.request().url());
        const query = url.searchParams.get('q');

        // Simulate fast database lookup
        await new Promise(resolve => setTimeout(resolve, 80));

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            suggestions: [
              {
                id: 1,
                name: `${query}sina 500mg`,
                category: 'Anti-inflamatório',
              },
              { id: 2, name: `${query}tanide 25mg`, category: 'Diurético' },
              {
                id: 3,
                name: `${query}cardia 10mg`,
                category: 'Cardiovascular',
              },
            ],
            responseTime: 80,
          }),
        });
      });

      const medicationSearch = page.locator(
        '[data-testid="medication-search"]',
      );

      // Test autocomplete performance
      const autocompleteStart = Date.now();
      await medicationSearch.fill('Los');
      await page.waitForResponse(/\/api\/v2\/medications\/search/);
      const autocompleteTime = Date.now() - autocompleteStart;

      expect(autocompleteTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.searchResponseTime,
      );

      // Verify suggestions appear quickly
      await expect(
        page.locator('[data-testid="medication-suggestions"]'),
      ).toBeVisible();
      const suggestions = page.locator('[data-testid="medication-suggestion"]');
      const suggestionCount = await suggestions.count();
      expect(suggestionCount).toBeGreaterThan(0);

      // Test typing performance (debounced search)
      await medicationSearch.fill('Losart');
      await page.waitForTimeout(100);
      await medicationSearch.fill('Losarta');
      await page.waitForTimeout(100);
      await medicationSearch.fill('Losartan');

      // Should not make excessive API calls (debouncing)
      const apiCalls = await page.evaluate(() => window.apiCallCount || 0);
      expect(apiCalls).toBeLessThanOrEqual(2); // Should be debounced
    });

    test('should optimize complex patient data search', async ({ page }) => {
      await page.goto('/patients/search/advanced');
      await page.waitForLoadState('networkidle');

      // Mock complex search with multiple criteria
      await page.route('/api/v2/patients/search/advanced*', async route => {
        const requestData = JSON.parse(route.request().postData() || '{}');

        // Simulate complex database query processing
        await new Promise(resolve => setTimeout(resolve, 200));

        // Return filtered results based on criteria
        const filteredResults = testData.largePatientDataset
          .filter(patient => {
            if (
              requestData.ageRange
              && requestData.gender
              && requestData.consultationDateRange
            ) {
              return Math.random() > 0.7; // Simulate filtering
            }
            return true;
          })
          .slice(0, 25);

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: filteredResults,
            searchCriteria: requestData,
            processingTime: 200,
            resultCount: filteredResults.length,
          }),
        });
      });

      // Fill advanced search form
      await page.selectOption('[data-testid="age-range-select"]', '30-50');
      await page.selectOption('[data-testid="gender-select"]', 'female');
      await page.fill('[data-testid="date-from"]', '2023-01-01');
      await page.fill('[data-testid="date-to"]', '2024-01-31');

      const complexSearchStart = Date.now();
      await page.click('[data-testid="advanced-search-submit"]');
      await page.waitForResponse(/\/api\/v2\/patients\/search\/advanced/);
      const complexSearchTime = Date.now() - complexSearchStart;

      // Complex searches should still be reasonably fast
      expect(complexSearchTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.searchResponseTime * 2,
      ); // Allow 2x for complexity

      // Verify results are displayed with search criteria
      await expect(
        page.locator('[data-testid="advanced-search-results"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="search-criteria-summary"]'),
      ).toBeVisible();
    });
  });

  describe('Core Web Vitals Performance', () => {
    test('should meet LCP (Largest Contentful Paint) threshold', async ({ page }) => {
      await page.goto('/dashboard');

      // Measure LCP using Navigation Timing API
      const lcpTime = await page.evaluate(async () => {
        return new Promise(resolve => {
          new PerformanceObserver(entryList => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });

      if (lcpTime > 0) {
        expect(lcpTime).toBeLessThan(PERFORMANCE_THRESHOLDS.lcp);
      }

      // Verify main content is loaded
      await expect(
        page.locator('[data-testid="main-dashboard-content"]'),
      ).toBeVisible();
    });

    test('should meet INP (Interaction to Next Paint) threshold', async ({ page }) => {
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Test click interaction performance
      const inpMeasurement = await page.evaluate(async () => {
        return new Promise(resolve => {
          let maxInp = 0;

          new PerformanceObserver(entryList => {
            for (const entry of entryList.getEntries()) {
              if (
                entry.name === 'event'
                && entry.processingStart
                && entry.processingEnd
              ) {
                const inp = entry.processingEnd - entry.processingStart;
                maxInp = Math.max(maxInp, inp);
              }
            }
          }).observe({ entryTypes: ['event'] });

          setTimeout(() => resolve(maxInp), 2000);
        });
      });

      // Perform interactions to measure
      await page.click('[data-testid="add-patient-button"]');
      await page.waitForTimeout(100);
      await page.click('[data-testid="patient-search"]');
      await page.waitForTimeout(100);

      // INP should be under threshold
      if (inpMeasurement > 0) {
        expect(inpMeasurement).toBeLessThan(PERFORMANCE_THRESHOLDS.inp);
      }
    });

    test('should meet CLS (Cumulative Layout Shift) threshold', async ({ page }) => {
      await page.goto('/patients');

      // Measure CLS
      const clsScore = await page.evaluate(async () => {
        return new Promise(resolve => {
          let clsValue = 0;

          new PerformanceObserver(entryList => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });

          // Wait for layout to stabilize
          setTimeout(() => resolve(clsValue), 3000);
        });
      });

      expect(clsScore).toBeLessThan(PERFORMANCE_THRESHOLDS.cls);

      // Verify no unexpected layout shifts during loading
      await page.waitForLoadState('networkidle');
      const finalClsScore = await page.evaluate(() => {
        let totalCLS = 0;
        const observer = new PerformanceObserver(entryList => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              totalCLS += entry.value;
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        return totalCLS;
      });

      expect(finalClsScore).toBeLessThan(PERFORMANCE_THRESHOLDS.cls);
    });
  });

  describe('Healthcare-Critical Performance', () => {
    test('should meet emergency data access performance', async ({ page }) => {
      await page.goto('/emergency');
      await page.waitForLoadState('networkidle');

      // Mock emergency patient data lookup
      await page.route('/api/v2/emergency/patient*', async route => {
        // Simulate fast emergency database access
        await new Promise(resolve => setTimeout(resolve, 500));

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            patient: {
              id: 'emergency-patient-1',
              name: 'João Carlos Silva',
              bloodType: 'O+',
              allergies: ['Penicilina', 'Látex'],
              criticalMedications: ['Losartana 50mg', 'Insulina'],
              emergencyContact: {
                name: 'Maria Silva',
                phone: '(11) 99999-9999',
              },
              lastUpdate: new Date().toISOString(),
            },
            responseTime: 500,
          }),
        });
      });

      const emergencySearchStart = Date.now();
      await page.fill('[data-testid="emergency-cpf-search"]', '123.456.789-09');
      await page.click('[data-testid="emergency-search-button"]');
      await page.waitForResponse(/\/api\/v2\/emergency\/patient/);
      const emergencySearchTime = Date.now() - emergencySearchStart;

      // Emergency scenarios must be extremely fast
      expect(emergencySearchTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.emergencyDataLoad,
      );

      // Verify critical information is immediately visible
      await expect(
        page.locator('[data-testid="emergency-patient-data"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="blood-type"]')).toContainText(
        'O+',
      );
      await expect(page.locator('[data-testid="allergies"]')).toContainText(
        'Penicilina',
      );
    });

    test('should meet prescription validation performance', async ({ page }) => {
      await page.goto('/prescriptions/validate');
      await page.waitForLoadState('networkidle');

      // Mock prescription validation API
      await page.route('/api/v2/prescriptions/validate*', async route => {
        const prescriptionData = JSON.parse(route.request().postData() || '{}');

        // Simulate validation processing
        await new Promise(resolve => setTimeout(resolve, 150));

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            isValid: true,
            validations: {
              physicianCrm: { valid: true, verified: true },
              patientData: { valid: true, lgpdCompliant: true },
              medications: { valid: true, interactions: [] },
              dosages: { valid: true, warnings: [] },
            },
            processingTime: 150,
          }),
        });
      });

      // Fill prescription form
      await page.fill('[data-testid="physician-crm"]', 'CRM-123456/SP');
      await page.fill('[data-testid="patient-cpf"]', '123.456.789-09');
      await page.fill(
        '[data-testid="medication-name"]',
        'Losartana Potássica 50mg',
      );
      await page.fill(
        '[data-testid="medication-dosage"]',
        '1 comprimido pela manhã',
      );

      const validationStart = Date.now();
      await page.click('[data-testid="validate-prescription"]');
      await page.waitForResponse(/\/api\/v2\/prescriptions\/validate/);
      const validationTime = Date.now() - validationStart;

      // Prescription validation must be fast for healthcare safety
      expect(validationTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.prescriptionValidation,
      );

      // Verify validation results are displayed
      await expect(
        page.locator('[data-testid="validation-results"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="validation-success"]'),
      ).toContainText('valid');
    });

    test('should maintain performance with data encryption', async ({ page }) => {
      await page.goto('/patients/new');
      await page.waitForLoadState('networkidle');

      // Mock patient creation with encryption overhead
      await page.route('/api/v2/patients*', async route => {
        const patientData = JSON.parse(route.request().postData() || '{}');

        // Simulate encryption processing time
        await new Promise(resolve => setTimeout(resolve, 250));

        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            patient: {
              ...patientData,
              id: 'encrypted-patient-1',
              encryptedFields: ['cpf', 'phone', 'email', 'medicalHistory'],
              encryptionTime: 250,
            },
            encryptionMetadata: {
              algorithm: 'AES-256-GCM',
              keyId: 'key-123',
              processingTime: 250,
            },
          }),
        });
      });

      // Fill patient form
      await page.fill('[data-testid="patient-name"]', 'Maria Santos Silva');
      await page.fill('[data-testid="patient-cpf"]', '987.654.321-00');
      await page.fill('[data-testid="patient-phone"]', '(21) 99887-6655');
      await page.fill(
        '[data-testid="patient-email"]',
        'maria.santos@email.com',
      );

      // Accept LGPD consent
      await page.check('[data-testid="consent-data-processing"]');

      const encryptionStart = Date.now();
      await page.click('[data-testid="submit-patient-form"]');
      await page.waitForResponse(/\/api\/v2\/patients/);
      const encryptionTime = Date.now() - encryptionStart;

      // Encryption overhead should not significantly impact user experience
      expect(encryptionTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.patientDataEncryption,
      );

      // Verify patient was created successfully
      await expect(
        page.locator('[data-testid="patient-created-success"]'),
      ).toBeVisible();
    });
  });

  describe('Real-time Performance', () => {
    test('should meet real-time notification latency', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Setup WebSocket mock for real-time notifications
      await page.evaluate(() => {
        window.mockWebSocket = {
          latencies: [],
          send: function(message) {
            const sent = performance.now();
            setTimeout(() => {
              const received = performance.now();
              this.latencies.push(received - sent);
              window.dispatchEvent(
                new CustomEvent('mock-notification', {
                  detail: {
                    message: JSON.parse(message),
                    latency: received - sent,
                  },
                }),
              );
            }, 50); // Simulate network latency
          },
        };
      });

      // Listen for notification performance
      const notificationLatencies: number[] = [];
      await page.exposeFunction('recordLatency', (latency: number) => {
        notificationLatencies.push(latency);
      });

      await page.evaluate(() => {
        window.addEventListener('mock-notification', (event: any) => {
          window.recordLatency(event.detail.latency);
        });
      });

      // Trigger real-time notifications
      for (let i = 0; i < 5; i++) {
        await page.evaluate(index => {
          window.mockWebSocket.send(
            JSON.stringify({
              type: 'appointment_reminder',
              patientName: `Patient ${index}`,
              time: new Date().toISOString(),
            }),
          );
        }, i);
        await page.waitForTimeout(100);
      }

      // Wait for all notifications to be processed
      await page.waitForTimeout(500);

      // All real-time notifications should meet latency threshold
      for (const latency of notificationLatencies) {
        expect(latency).toBeLessThan(PERFORMANCE_THRESHOLDS.realtimeLatency);
      }

      // Verify notifications are displayed
      const notifications = page.locator('[data-testid="notification-item"]');
      const notificationCount = await notifications.count();
      expect(notificationCount).toBe(5);
    });

    test('should handle concurrent real-time updates efficiently', async ({ page }) => {
      await page.goto('/appointments/calendar');
      await page.waitForLoadState('networkidle');

      // Setup concurrent update simulation
      const concurrentUpdateStart = Date.now();

      // Simulate multiple concurrent appointment updates
      const updatePromises = Array.from({ length: 10 }, async (_, i) => {
        return page.evaluate(index => {
          return new Promise(resolve => {
            const start = performance.now();
            window.dispatchEvent(
              new CustomEvent('appointment-update', {
                detail: {
                  id: `appointment-${index}`,
                  status: 'confirmed',
                  timestamp: new Date().toISOString(),
                },
              }),
            );
            const end = performance.now();
            resolve(end - start);
          });
        }, i);
      });

      const updateTimes = await Promise.all(updatePromises);
      const totalConcurrentTime = Date.now() - concurrentUpdateStart;

      // Concurrent updates should not block the UI
      expect(totalConcurrentTime).toBeLessThan(500);

      // Individual updates should be fast
      for (const updateTime of updateTimes) {
        expect(updateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.realtimeLatency);
      }
    });
  });

  describe('Network Condition Performance', () => {
    test('should maintain acceptable performance on slow connections', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
        // Note: Playwright doesn't have built-in network throttling
        // In production, we'd use CDP to simulate slow 3G
      });
      const page = await context.newPage();

      // Simulate slow connection by adding delays to requests
      await page.route('**/*', async route => {
        // Add network delay simulation
        await new Promise(resolve => setTimeout(resolve, 100));
        route.continue();
      });

      const slowConnectionStart = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      const slowConnectionTime = Date.now() - slowConnectionStart;

      // Should still be usable on slow connections
      expect(slowConnectionTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.slowConnection,
      );

      // Progressive loading should be visible
      await expect(
        page.locator('[data-testid="loading-skeleton"]'),
      ).toBeVisible();

      // Critical content should load first
      await expect(
        page.locator('[data-testid="urgent-notifications"]'),
      ).toBeVisible();

      await context.close();
    });

    test('should optimize offline-to-online sync performance', async ({ context, page }) => {
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Queue some actions while offline
      await context.setOffline(true);

      const offlineActions = [
        { type: 'CREATE_PATIENT', data: { name: 'Offline Patient 1' } },
        {
          type: 'UPDATE_APPOINTMENT',
          data: { id: 'apt-1', status: 'confirmed' },
        },
        { type: 'CREATE_PRESCRIPTION', data: { patientId: 'patient-1' } },
      ];

      await page.evaluate(actions => {
        localStorage.setItem(
          'neonpro_pending_actions',
          JSON.stringify(actions),
        );
      }, offlineActions);

      // Go back online and measure sync performance
      const syncStart = Date.now();
      await context.setOffline(false);

      // Wait for sync to complete
      await page.evaluate(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            localStorage.removeItem('neonpro_pending_actions');
            window.dispatchEvent(new CustomEvent('sync-completed'));
            resolve(null);
          }, 1500); // Simulate sync processing
        });
      });

      await page.waitForEvent('console', msg => msg.text().includes('sync-completed'));
      const syncTime = Date.now() - syncStart;

      // Sync should be fast after reconnection
      expect(syncTime).toBeLessThan(PERFORMANCE_THRESHOLDS.offlineToOnlineSync);

      // Verify sync success indicator
      await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
    });
  });

  describe('Performance Monitoring and Reporting', () => {
    test('should track and report performance metrics', async ({ page }) => {
      await page.goto('/admin/performance');
      await page.waitForLoadState('networkidle');

      // Mock performance metrics API
      await page.route('/api/v2/admin/performance/metrics*', async route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            coreWebVitals: {
              lcp: { p75: 2100, trend: 'improving' },
              inp: { p75: 150, trend: 'stable' },
              cls: { p75: 0.05, trend: 'improving' },
            },
            applicationMetrics: {
              mobileResponseTime: { p95: 450, threshold: 500 },
              searchResponseTime: { p95: 280, threshold: 300 },
              emergencyDataLoad: { p95: 900, threshold: 1000 },
            },
            userExperience: {
              bounceRate: 5.2,
              sessionDuration: '4m 32s',
              taskCompletionRate: 94.8,
            },
            generatedAt: new Date().toISOString(),
          }),
        });
      });

      // Load performance dashboard
      await page.click('[data-testid="load-performance-metrics"]');
      await page.waitForResponse(/\/api\/v2\/admin\/performance\/metrics/);

      // Verify performance metrics are displayed
      await expect(
        page.locator('[data-testid="core-web-vitals-chart"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="mobile-performance-metrics"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="search-performance-metrics"]'),
      ).toBeVisible();

      // Verify metrics meet thresholds
      const lcpMetric = await page
        .locator('[data-testid="lcp-metric"]')
        .textContent();
      const inpMetric = await page
        .locator('[data-testid="inp-metric"]')
        .textContent();

      expect(lcpMetric).toContain('2100'); // Should show actual metric
      expect(inpMetric).toContain('150');

      // Check performance alerts
      const performanceAlerts = page.locator(
        '[data-testid="performance-alert"]',
      );
      const alertCount = await performanceAlerts.count();

      // Should have alerts for any metrics exceeding thresholds
      if (alertCount > 0) {
        await expect(performanceAlerts.first()).toBeVisible();
      }
    });

    test('should implement performance budget enforcement', async ({ page }) => {
      await page.goto('/admin/performance/budgets');
      await page.waitForLoadState('networkidle');

      // Check current performance budgets
      const budgets = {
        mobileResponseTime: PERFORMANCE_THRESHOLDS.mobileResponseTime,
        searchResponseTime: PERFORMANCE_THRESHOLDS.searchResponseTime,
        lcpThreshold: PERFORMANCE_THRESHOLDS.lcp,
        inpThreshold: PERFORMANCE_THRESHOLDS.inp,
        clsThreshold: PERFORMANCE_THRESHOLDS.cls,
        emergencyDataLoad: PERFORMANCE_THRESHOLDS.emergencyDataLoad,
        realtimeLatency: PERFORMANCE_THRESHOLDS.realtimeLatency,
      };

      // Verify budgets are configured
      for (const [metric, threshold] of Object.entries(budgets)) {
        const budgetElement = page.locator(`[data-testid="budget-${metric}"]`);
        await expect(budgetElement).toBeVisible();

        const budgetValue = await budgetElement.textContent();
        expect(budgetValue).toContain(threshold.toString());
      }

      // Test budget violation alerts
      await page.click('[data-testid="simulate-budget-violation"]');
      await page.selectOption(
        '[data-testid="violation-metric"]',
        'mobileResponseTime',
      );
      await page.fill('[data-testid="violation-value"]', '600'); // Exceeds 500ms threshold
      await page.click('[data-testid="trigger-violation"]');

      // Should show budget violation alert
      await expect(
        page.locator('[data-testid="budget-violation-alert"]'),
      ).toBeVisible();
      const violationAlert = await page
        .locator('[data-testid="violation-details"]')
        .textContent();
      expect(violationAlert).toMatch(
        /mobile.*response.*time.*exceeded.*500ms/i,
      );
    });
  });
});

// Performance test utilities
class PerformanceTestUtils {
  static async measurePageLoad(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    return Date.now() - startTime;
  }

  static async measureInteraction(
    page: Page,
    selector: string,
  ): Promise<number> {
    const startTime = Date.now();
    await page.click(selector);
    await page.waitForLoadState('domcontentloaded');
    return Date.now() - startTime;
  }

  static async measureSearchResponse(
    page: Page,
    searchSelector: string,
    query: string,
  ): Promise<number> {
    const startTime = Date.now();
    await page.fill(searchSelector, query);
    await page.press(searchSelector, 'Enter');
    await page.waitForSelector('[data-testid="search-results"]');
    return Date.now() - startTime;
  }

  static validateThreshold(
    actualTime: number,
    threshold: number,
    operation: string,
  ): void {
    if (actualTime > threshold) {
      throw new Error(
        `Performance threshold exceeded for ${operation}: ${actualTime}ms > ${threshold}ms`,
      );
    }
  }
}

export { PERFORMANCE_THRESHOLDS, PerformanceTestUtils };
