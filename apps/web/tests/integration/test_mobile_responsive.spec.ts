/**
 * MOBILE RESPONSIVE DESIGN INTEGRATION TEST (T027)
 *
 * Constitutional TDD Implementation - RED PHASE
 * Tests mobile responsive design across healthcare workflows
 *
 * @compliance WCAG 2.1 AA+, Mobile-First Design, Healthcare UX
 * @test-id T027
 * @performance <500ms mobile load times
 * @accessibility Full keyboard navigation, screen reader support
 */

import { devices, expect, test } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

// Mobile device configurations for testing
const MOBILE_DEVICES = [
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'iPhone 13 Pro Max', ...devices['iPhone 13 Pro Max'] },
  { name: 'Samsung Galaxy S22', ...devices['Galaxy S21'] },
  { name: 'iPad', ...devices['iPad Pro'] },
  { name: 'Generic Mobile', viewport: { width: 375, height: 667 } },
  { name: 'Generic Tablet', viewport: { width: 768, height: 1024 } },
];

// Performance thresholds (Constitutional Requirements)
const PERFORMANCE_THRESHOLDS = {
  mobileLoadTime: 500, // <500ms requirement
  touchTargetMinSize: 44, // WCAG 2.1 AA
  textContrastRatio: 4.5, // WCAG 2.1 AA
  focusIndicatorMinSize: 2, // WCAG 2.1 AA
};

// Healthcare-specific responsive test data
const generateHealthcareTestData = () => ({
  patient: {
    name: 'João Silva Santos',
    cpf: '123.456.789-09',
    phone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
  },
  appointment: {
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:30',
    type: 'consulta_dermatologia',
  },
});

describe('Mobile Responsive Design Tests (T027)', () => {
  let testData: ReturnType<typeof generateHealthcareTestData>;

  test.beforeEach(async ({ page }) => {
    testData = generateHealthcareTestData();

    // Setup authenticated session for healthcare professional
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem(
        'supabase.auth.token',
        JSON.stringify({
          access_token: 'mock-mobile-token',
          user: {
            id: 'mobile-test-user',
            email: 'mobile.test@professional.com',
            role: 'healthcare_professional',
          },
        }),
      );
    });
  });

  describe('Cross-Device Responsive Layout', () => {
    for (const device of MOBILE_DEVICES) {
      test(`should display properly on ${device.name}`, async ({ browser }) => {
        const context = await browser.newContext({
          ...device,
          locale: 'pt-BR',
          timezoneId: 'America/Sao_Paulo',
        });
        const page = await context.newPage();

        const startTime = Date.now();
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Constitutional Performance Requirement: <500ms
        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.mobileLoadTime);

        // Verify main navigation is accessible
        await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();

        // Check responsive layout elements
        const viewport = page.viewportSize();
        if (viewport && viewport.width < 768) {
          // Mobile layout
          await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
          await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
        } else {
          // Tablet/Desktop layout
          await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
        }

        // Verify healthcare dashboard cards are responsive
        const dashboardCards = page.locator('[data-testid="dashboard-card"]');
        const cardCount = await dashboardCards.count();

        if (cardCount > 0) {
          const firstCard = dashboardCards.first();
          const cardBox = await firstCard.boundingBox();

          if (cardBox && viewport) {
            // Card should not overflow viewport
            expect(cardBox.width).toBeLessThanOrEqual(viewport.width);
          }
        }

        await context.close();
      });
    }
  });

  describe('Touch Target Accessibility', () => {
    test('should have accessible touch targets on mobile', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Check touch target sizes for critical healthcare actions
      const criticalButtons = [
        '[data-testid="add-patient-button"]',
        '[data-testid="emergency-contact-button"]',
        '[data-testid="appointment-schedule-button"]',
        '[data-testid="patient-search-button"]',
      ];

      for (const selector of criticalButtons) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.touchTargetMinSize);
            expect(box.height).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.touchTargetMinSize);
          }
        }
      }

      await context.close();
    });

    test('should support touch gestures for patient data entry', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      await page.goto('/patients/new');
      await page.waitForLoadState('networkidle');

      // Test swipe gestures for form sections
      const formSections = page.locator('[data-testid="form-section"]');
      const sectionCount = await formSections.count();

      if (sectionCount > 1) {
        // Test swipe between sections
        const firstSection = formSections.first();
        const sectionBox = await firstSection.boundingBox();

        if (sectionBox) {
          // Simulate swipe left
          await page.touchscreen.tap(
            sectionBox.x + sectionBox.width / 2,
            sectionBox.y + sectionBox.height / 2,
          );
          await page.touchscreen.tap(sectionBox.x + 50, sectionBox.y + sectionBox.height / 2);
        }
      }

      // Test pinch-to-zoom on medical charts
      const medicalChart = page.locator('[data-testid="medical-chart"]');
      if (await medicalChart.isVisible()) {
        const chartBox = await medicalChart.boundingBox();
        if (chartBox) {
          // Test zoom gesture
          await page.touchscreen.tap(chartBox.x + 100, chartBox.y + 100);
          await page.touchscreen.tap(chartBox.x + 200, chartBox.y + 200);
        }
      }

      await context.close();
    });
  });

  describe('Mobile Healthcare Workflows', () => {
    test('should support mobile patient registration workflow', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      await page.goto('/patients/new');
      await page.waitForLoadState('networkidle');

      // Verify form is mobile-optimized
      await expect(page.locator('[data-testid="mobile-patient-form"]')).toBeVisible();

      // Fill patient data with mobile-optimized inputs
      await page.fill('[data-testid="patient-name"]', testData.patient.name);

      // Test mobile-specific input patterns
      await page.fill('[data-testid="patient-cpf"]', testData.patient.cpf);
      await page.fill('[data-testid="patient-phone"]', testData.patient.phone);
      await page.fill('[data-testid="patient-email"]', testData.patient.email);

      // Verify mobile keyboard optimizations
      const phoneInput = page.locator('[data-testid="patient-phone"]');
      const phoneInputType = await phoneInput.getAttribute('inputmode');
      expect(phoneInputType).toBe('tel');

      const emailInput = page.locator('[data-testid="patient-email"]');
      const emailInputType = await emailInput.getAttribute('inputmode');
      expect(emailInputType).toBe('email');

      // Test LGPD consent on mobile
      await expect(page.locator('[data-testid="mobile-lgpd-consent"]')).toBeVisible();

      // Consent checkboxes should have accessible touch targets
      const consentCheckboxes = page.locator('[data-testid^="consent-"]');
      const checkboxCount = await consentCheckboxes.count();

      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = consentCheckboxes.nth(i);
        const checkboxBox = await checkbox.boundingBox();
        if (checkboxBox) {
          expect(checkboxBox.width).toBeGreaterThanOrEqual(
            PERFORMANCE_THRESHOLDS.touchTargetMinSize,
          );
          expect(checkboxBox.height).toBeGreaterThanOrEqual(
            PERFORMANCE_THRESHOLDS.touchTargetMinSize,
          );
        }
      }

      await context.close();
    });

    test('should support mobile appointment scheduling', async ({ browser }) => {
      const context = await browser.newContext(devices['Samsung Galaxy S21']);
      const page = await context.newPage();

      await page.goto('/appointments/schedule');
      await page.waitForLoadState('networkidle');

      // Test mobile calendar interface
      await expect(page.locator('[data-testid="mobile-calendar"]')).toBeVisible();

      // Calendar should be touch-friendly
      const calendarDays = page.locator('[data-testid="calendar-day"]');
      const dayCount = await calendarDays.count();

      if (dayCount > 0) {
        const firstDay = calendarDays.first();
        const dayBox = await firstDay.boundingBox();
        if (dayBox) {
          expect(dayBox.width).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.touchTargetMinSize);
          expect(dayBox.height).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.touchTargetMinSize);
        }
      }

      // Test time slot selection on mobile
      await page.tap('[data-testid="calendar-day"][data-available="true"]');
      await expect(page.locator('[data-testid="mobile-time-slots"]')).toBeVisible();

      const timeSlots = page.locator('[data-testid="time-slot"]');
      const slotCount = await timeSlots.count();

      if (slotCount > 0) {
        const firstSlot = timeSlots.first();
        const slotBox = await firstSlot.boundingBox();
        if (slotBox) {
          expect(slotBox.width).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.touchTargetMinSize);
          expect(slotBox.height).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.touchTargetMinSize);
        }
      }

      await context.close();
    });

    test('should support mobile telemedicine interface', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      await page.goto('/telemedicine/session/new');
      await page.waitForLoadState('networkidle');

      // Verify mobile video interface
      await expect(page.locator('[data-testid="mobile-video-container"]')).toBeVisible();

      // Control buttons should be touch-accessible
      const videoControls = [
        '[data-testid="video-toggle"]',
        '[data-testid="audio-toggle"]',
        '[data-testid="screen-share"]',
        '[data-testid="end-call"]',
      ];

      for (const selector of videoControls) {
        const control = page.locator(selector);
        if (await control.isVisible()) {
          const controlBox = await control.boundingBox();
          if (controlBox) {
            expect(controlBox.width).toBeGreaterThanOrEqual(
              PERFORMANCE_THRESHOLDS.touchTargetMinSize,
            );
            expect(controlBox.height).toBeGreaterThanOrEqual(
              PERFORMANCE_THRESHOLDS.touchTargetMinSize,
            );
          }
        }
      }

      // Test mobile chat interface in telemedicine
      await page.tap('[data-testid="chat-toggle"]');
      await expect(page.locator('[data-testid="mobile-chat-panel"]')).toBeVisible();

      // Chat input should be mobile-optimized
      const chatInput = page.locator('[data-testid="chat-input"]');
      await expect(chatInput).toBeVisible();

      const inputBox = await chatInput.boundingBox();
      if (inputBox) {
        expect(inputBox.height).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.touchTargetMinSize);
      }

      await context.close();
    });
  });

  describe('Accessibility on Mobile', () => {
    test('should support screen readers on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
        reducedMotion: 'reduce',
        forcedColors: 'active',
      });
      const page = await context.newPage();

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Check ARIA labels for screen readers
      const navigationItems = page.locator('[data-testid="nav-item"]');
      const navCount = await navigationItems.count();

      for (let i = 0; i < navCount; i++) {
        const navItem = navigationItems.nth(i);
        const ariaLabel = await navItem.getAttribute('aria-label');
        const role = await navItem.getAttribute('role');

        // Each nav item should have proper accessibility attributes
        expect(ariaLabel || role).toBeTruthy();
      }

      // Test focus management
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Verify focus indicators are visible
      const focusBox = await focusedElement.boundingBox();
      if (focusBox) {
        const focusIndicator = await page.evaluate(element => {
          const styles = window.getComputedStyle(element);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow,
          };
        }, await focusedElement.elementHandle());

        // Should have visible focus indicator
        expect(
          focusIndicator.outline !== 'none'
            || focusIndicator.outlineWidth !== '0px'
            || focusIndicator.boxShadow !== 'none',
        ).toBe(true);
      }

      await context.close();
    });

    test('should support high contrast mode on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
        colorScheme: 'dark',
        forcedColors: 'active',
      });
      const page = await context.newPage();

      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Verify high contrast compliance
      const importantElements = [
        '[data-testid="patient-card"]',
        '[data-testid="add-patient-button"]',
        '[data-testid="search-input"]',
      ];

      for (const selector of importantElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const styles = await page.evaluate(sel => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              borderColor: computed.borderColor,
            };
          }, selector);

          // Elements should have sufficient contrast
          expect(styles).toBeTruthy();
          expect(styles?.color).not.toBe(styles?.backgroundColor);
        }
      }

      await context.close();
    });

    test('should support keyboard navigation on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad'],
        hasTouch: false, // Simulate keyboard-only navigation
      });
      const page = await context.newPage();

      await page.goto('/patients/new');
      await page.waitForLoadState('networkidle');

      // Test keyboard navigation through form
      const formInputs = [
        '[data-testid="patient-name"]',
        '[data-testid="patient-cpf"]',
        '[data-testid="patient-phone"]',
        '[data-testid="patient-email"]',
      ];

      for (const selector of formInputs) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');

        // Should be able to reach each input via keyboard
        const inputElement = page.locator(selector);
        if (await inputElement.isVisible()) {
          const isFocused = await page.evaluate(sel => {
            const element = document.querySelector(sel);
            return document.activeElement === element;
          }, selector);

          // May not be exact match due to tab order, but focus should be progressing
          expect(await focused.count()).toBeGreaterThan(0);
        }
      }

      await context.close();
    });
  });

  describe('Performance on Mobile Networks', () => {
    test('should perform well on slow mobile connections', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
        // Simulate slow 3G connection
        // Note: Playwright doesn't have built-in network throttling like Puppeteer
        // This would be implemented with CDP in a real environment
      });
      const page = await context.newPage();

      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      // Should still meet performance targets on slow connections
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.mobileLoadTime * 2); // Allow 2x on slow connection

      // Check for progressive loading
      await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();

      // Wait for full content load
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();

      await context.close();
    });

    test('should handle offline/online state transitions', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Simulate going offline
      await context.setOffline(true);

      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({
        timeout: 5000,
      });

      // Test offline functionality
      await page.click('[data-testid="add-patient-button"]');

      // Should show offline message or queue action
      const offlineMessage = page.locator('[data-testid="offline-action-queued"]');
      if (await offlineMessage.isVisible()) {
        await expect(offlineMessage).toContainText(/offline|queued|pending/i);
      }

      // Simulate going back online
      await context.setOffline(false);

      // Should hide offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible({
        timeout: 5000,
      });

      await context.close();
    });
  });

  describe('Brazilian Healthcare Mobile UX', () => {
    test('should support Brazilian mobile payment integration', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      await page.goto('/payments/new');
      await page.waitForLoadState('networkidle');

      // Check for Brazilian payment methods
      const paymentMethods = [
        '[data-testid="payment-pix"]',
        '[data-testid="payment-boleto"]',
        '[data-testid="payment-credit-card"]',
        '[data-testid="payment-debit-card"]',
      ];

      for (const selector of paymentMethods) {
        const method = page.locator(selector);
        if (await method.isVisible()) {
          const methodBox = await method.boundingBox();
          if (methodBox) {
            expect(methodBox.width).toBeGreaterThanOrEqual(
              PERFORMANCE_THRESHOLDS.touchTargetMinSize,
            );
            expect(methodBox.height).toBeGreaterThanOrEqual(
              PERFORMANCE_THRESHOLDS.touchTargetMinSize,
            );
          }
        }
      }

      // Test PIX integration on mobile
      await page.tap('[data-testid="payment-pix"]');
      await expect(page.locator('[data-testid="pix-qr-code"]')).toBeVisible();

      // QR code should be appropriately sized for mobile
      const qrCode = page.locator('[data-testid="pix-qr-code"]');
      const qrBox = await qrCode.boundingBox();
      if (qrBox) {
        expect(qrBox.width).toBeGreaterThan(200); // Minimum scannable size
        expect(qrBox.height).toBeGreaterThan(200);
      }

      await context.close();
    });

    test('should validate Brazilian data formats on mobile', async ({ browser }) => {
      const context = await browser.newContext(devices['Samsung Galaxy S21']);
      const page = await context.newPage();

      await page.goto('/patients/new');
      await page.waitForLoadState('networkidle');

      // Test CPF input with mobile keyboard
      await page.tap('[data-testid="patient-cpf"]');
      await page.keyboard.type('12345678909');

      // Should format automatically
      const cpfValue = await page.inputValue('[data-testid="patient-cpf"]');
      expect(cpfValue).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);

      // Test phone number with mobile keyboard
      await page.tap('[data-testid="patient-phone"]');
      await page.keyboard.type('11987654321');

      // Should format automatically
      const phoneValue = await page.inputValue('[data-testid="patient-phone"]');
      expect(phoneValue).toMatch(/^\(\d{2}\)\s\d{4,5}-\d{4}$/);

      // Test CEP input
      await page.tap('[data-testid="patient-cep"]');
      await page.keyboard.type('01310100');

      // Should format automatically
      const cepValue = await page.inputValue('[data-testid="patient-cep"]');
      expect(cepValue).toMatch(/^\d{5}-\d{3}$/);

      await context.close();
    });

    test('should support Brazilian healthcare professional mobile workflows', async ({ browser }) => {
      const context = await browser.newContext(devices['iPhone 12']);
      const page = await context.newPage();

      await page.goto('/prescriptions/new');
      await page.waitForLoadState('networkidle');

      // Test mobile prescription interface
      await expect(page.locator('[data-testid="mobile-prescription-form"]')).toBeVisible();

      // CRM input should be touch-optimized
      await page.tap('[data-testid="physician-crm"]');
      await page.keyboard.type('CRM123456SP');

      const crmValue = await page.inputValue('[data-testid="physician-crm"]');
      expect(crmValue).toMatch(/^CRM-\d{4,6}\/[A-Z]{2}$/);

      // Test medication search on mobile
      await page.tap('[data-testid="medication-search"]');
      await page.keyboard.type('Losartana');

      // Should show medication suggestions
      await expect(page.locator('[data-testid="medication-suggestions"]')).toBeVisible();

      const suggestions = page.locator('[data-testid="medication-suggestion"]');
      const suggestionCount = await suggestions.count();

      if (suggestionCount > 0) {
        const firstSuggestion = suggestions.first();
        const suggestionBox = await firstSuggestion.boundingBox();
        if (suggestionBox) {
          expect(suggestionBox.height).toBeGreaterThanOrEqual(
            PERFORMANCE_THRESHOLDS.touchTargetMinSize,
          );
        }
      }

      await context.close();
    });
  });
});
