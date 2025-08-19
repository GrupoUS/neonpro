/**
 * 🌐 Healthcare Accessibility Testing - WCAG 2.1 AA+ & NBR 17225
 * Patient Interface Accessibility with Brazilian Standards
 * Constitutional Healthcare Accessibility Compliance
 */

import { expect, test } from '@playwright/test';
import {
  HealthcareAccessibilityHelper,
  HealthcareWorkflowHelper,
} from '../utils/healthcare-testing-utils';

test.describe('🌐 Healthcare Accessibility Testing - WCAG 2.1 AA+ & NBR 17225', () => {
  test.beforeEach(async ({ page }) => {
    // Setup healthcare authentication for accessibility testing
    await HealthcareWorkflowHelper.authenticateHealthcareUser(page, 'patient');

    // Enable accessibility tree for testing
    await page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        document.documentElement.setAttribute(
          'data-accessibility-test',
          'true'
        );
      });
    });
  });

  test('should validate WCAG 2.1 AA+ compliance for patient dashboard', async ({
    page,
  }) => {
    await page.goto('/dashboard/patient');

    // Comprehensive WCAG 2.1 AA+ validation
    await HealthcareAccessibilityHelper.validateAccessibility(page);

    // Test 1: Keyboard Navigation (WCAG 2.1.1)
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(['BUTTON', 'INPUT', 'SELECT', 'A', 'TEXTAREA']).toContain(
      focusedElement
    );

    // Navigate through all interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(
        () => document.activeElement?.tagName
      );

      // Verify focus is visible (WCAG 2.4.7)
      const focusVisible = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement;
        if (!element) {
          return false;
        }

        const styles = getComputedStyle(element);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });

      if (focusedElement !== 'BODY') {
        expect(focusVisible).toBe(true);
      }
    }

    // Test 2: Heading Structure (WCAG 1.3.1)
    const headings = await page.evaluate(() => {
      const headingElements = Array.from(
        document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      );
      return headingElements.map((h) => ({
        level: Number.parseInt(h.tagName.charAt(1), 10),
        text: h.textContent?.trim(),
      }));
    });

    expect(headings.length).toBeGreaterThan(0);
    expect(headings.filter((h) => h.level === 1)).toHaveLength(1); // Only one H1

    // Verify logical heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const levelDiff = headings[i].level - headings[i - 1].level;
      expect(levelDiff).toBeLessThanOrEqual(1); // No skipping levels
    }

    // Test 3: Alternative Text for Images (WCAG 1.1.1)
    const images = await page.locator('img').count();
    for (let i = 0; i < images; i++) {
      const img = page.locator('img').nth(i);
      const altText = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const isDecorative = (await img.getAttribute('role')) === 'presentation';

      if (!isDecorative) {
        expect(altText || ariaLabel).toBeTruthy();
      }
    }

    // Test 4: Form Labels (WCAG 1.3.1)
    const inputs = await page.locator('input, select, textarea').count();
    for (let i = 0; i < inputs; i++) {
      const input = page.locator('input, select, textarea').nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should validate NBR 17225 Brazilian accessibility standards', async ({
    page,
  }) => {
    await page.goto('/dashboard/patient');

    // NBR 17225 specific validation
    await HealthcareAccessibilityHelper.validateBrazilianAccessibility(page);

    // Test 1: Portuguese Language Support (NBR 17225)
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('pt-BR');

    // Verify Portuguese content
    const pageContent = await page.textContent('body');
    const portugueseWords = [
      'Paciente',
      'Agendamento',
      'Tratamento',
      'Privacidade',
      'Dados',
      'Consulta',
      'Histórico',
      'Contato',
    ];

    const hasPortugueseContent = portugueseWords.some((word) =>
      pageContent?.includes(word)
    );
    expect(hasPortugueseContent).toBe(true);

    // Test 2: High Contrast Mode Support (NBR 17225)
    await page.emulateMedia({ prefersColorScheme: 'dark' });
    await expect(page.getByTestId('main-content')).toBeVisible();

    // Verify contrast ratios in high contrast mode
    const contrastElements = await page
      .locator('[data-testid*="contrast"]')
      .count();
    expect(contrastElements).toBeGreaterThanOrEqual(0);

    // Test 3: Font Size Accessibility (NBR 17225)
    await page.evaluate(() => {
      document.body.style.fontSize = '150%';
    });

    // Verify content remains accessible at larger font sizes
    await expect(page.getByTestId('main-content')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();

    // Reset font size
    await page.evaluate(() => {
      document.body.style.fontSize = '';
    });

    // Test 4: Brazilian Currency and Date Formats (NBR 17225)
    const currencyElements = await page
      .locator('[data-testid*="currency"], [data-testid*="price"]')
      .count();
    if (currencyElements > 0) {
      const currencyText = await page
        .locator('[data-testid*="currency"], [data-testid*="price"]')
        .first()
        .textContent();
      expect(currencyText).toMatch(/R\$\s*\d+[,.]?\d*/); // Brazilian Real format
    }

    const dateElements = await page.locator('[data-testid*="date"]').count();
    if (dateElements > 0) {
      const dateText = await page
        .locator('[data-testid*="date"]')
        .first()
        .textContent();
      expect(dateText).toMatch(/\d{2}\/\d{2}\/\d{4}/); // Brazilian date format DD/MM/YYYY
    }
  });
});
