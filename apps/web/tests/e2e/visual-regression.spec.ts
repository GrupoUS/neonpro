import { expect, test, } from '@playwright/test'

/**
 * Visual Regression Testing for Healthcare UI Consistency
 * Tests UI components, layouts, and responsive design across different viewports
 */

test.describe('Visual Regression Tests', () => {
  test('should maintain consistent healthcare dashboard layout', async ({ page, },) => {
    await page.goto('/professional/dashboard',)
    await page.waitForLoadState('networkidle',)

    // Hide dynamic content for consistent screenshots
    await page.addStyleTag({
      content: `
        [data-testid="current-time"],
        [data-testid="live-updates"],
        [data-testid="random-metrics"] {
          visibility: hidden !important;
        }
      `,
    },)

    // Take screenshot for comparison
    await expect(page,).toHaveScreenshot('healthcare-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    },)
  })

  test('should maintain consistent patient registration form layout', async ({ page, },) => {
    await page.goto('/register',)
    await page.waitForLoadState('networkidle',)

    // Fill form to show validation states
    await page.fill('[data-testid="patient-name"]', 'Test Patient',)
    await page.fill('[data-testid="patient-cpf"]', '12345678901',)

    await expect(page,).toHaveScreenshot('patient-registration-form.png', {
      fullPage: true,
      animations: 'disabled',
    },)
  })

  test('should maintain consistent AI chat interface design', async ({ page, },) => {
    await page.goto('/professional/dashboard',)
    await page.click('[data-testid="ai-chat-assistant"]',)
    await page.waitForTimeout(1000,) // Wait for animation

    // Add sample conversation
    await page.fill(
      '[data-testid="chat-input"]',
      'What are the side effects of botulinum toxin?',
    )
    await page.click('[data-testid="send-message"]',)
    await page.waitForTimeout(2000,) // Wait for AI response

    await expect(
      page.locator('[data-testid="chat-interface"]',),
    ).toHaveScreenshot('ai-chat-interface.png', {
      animations: 'disabled',
    },)
  })

  test('should maintain consistent mobile responsive design', async ({ page, },) => {
    await page.setViewportSize({ width: 375, height: 667, },) // iPhone SE
    await page.goto('/dashboard',)
    await page.waitForLoadState('networkidle',)

    await expect(page,).toHaveScreenshot('mobile-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    },)

    // Test navigation menu on mobile
    await page.click('[data-testid="mobile-menu-toggle"]',)
    await page.waitForTimeout(500,)

    await expect(page,).toHaveScreenshot('mobile-navigation.png', {
      fullPage: true,
      animations: 'disabled',
    },)
  })

  test('should maintain consistent tablet layout', async ({ page, },) => {
    await page.setViewportSize({ width: 768, height: 1024, },) // iPad
    await page.goto('/professional/patients',)
    await page.waitForLoadState('networkidle',)

    await expect(page,).toHaveScreenshot('tablet-patient-list.png', {
      fullPage: true,
      animations: 'disabled',
    },)
  })

  test('should maintain consistent dark mode appearance', async ({ page, context, },) => {
    // Set dark mode preference
    await context.addInitScript(() => {
      localStorage.setItem('theme', 'dark',)
    },)

    await page.goto('/dashboard',)
    await page.waitForLoadState('networkidle',)

    await expect(page,).toHaveScreenshot('dark-mode-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    },)
  })

  test('should maintain consistent healthcare form components', async ({ page, },) => {
    await page.goto('/professional/patient/new',)
    await page.waitForLoadState('networkidle',)

    // Fill form to show various component states
    await page.fill('[data-testid="patient-name"]', 'Maria Silva',)
    await page.selectOption('[data-testid="patient-gender"]', 'female',)
    await page.fill('[data-testid="patient-birthdate"]', '1985-03-15',)
    await page.check('[data-testid="has-allergies"]',)

    await expect(page,).toHaveScreenshot('healthcare-form-components.png', {
      fullPage: true,
      animations: 'disabled',
    },)
  })

  test('should maintain consistent AR simulator interface', async ({ page, },) => {
    await page.goto('/professional/consultations/ar-simulator',)
    await page.waitForLoadState('networkidle',)

    // Simulate AR interface loading
    await page.click('[data-testid="start-ar-simulation"]',)
    await page.waitForTimeout(2000,)

    await expect(page.locator('[data-testid="ar-interface"]',),).toHaveScreenshot(
      'ar-simulator-interface.png',
      {
        animations: 'disabled',
      },
    )
  })

  test('should maintain consistent appointment calendar layout', async ({ page, },) => {
    await page.goto('/professional/appointments',)
    await page.waitForLoadState('networkidle',)

    // Navigate to specific month for consistency
    await page.click('[data-testid="calendar-today"]',)
    await page.waitForTimeout(500,)

    await expect(
      page.locator('[data-testid="appointment-calendar"]',),
    ).toHaveScreenshot('appointment-calendar.png', {
      animations: 'disabled',
    },)
  })

  test('should maintain consistent high contrast mode design', async ({ page, },) => {
    // Enable high contrast mode
    await page.emulateMedia({ forcedColors: 'active', },)
    await page.goto('/dashboard',)
    await page.waitForLoadState('networkidle',)

    await expect(page,).toHaveScreenshot('high-contrast-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    },)
  })
})
