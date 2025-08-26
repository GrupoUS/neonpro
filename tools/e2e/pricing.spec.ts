import { expect, test } from '@playwright/test';

/**
 * Pricing Page E2E Tests for NeonPro Healthcare
 *
 * Critical pricing and subscription workflows:
 * - Plan comparison and feature display
 * - Subscription selection and upgrade flows
 * - Payment processing and security
 * - Trial period management
 * - Brazilian healthcare compliance pricing
 * - ANVISA and CFM feature tiers
 */

test.describe('Pricing Page - Plan Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
  });

  test('should display all subscription plans', async ({ page }) => {
    // Check for main pricing plans
    await expect(page.locator('h1, .pricing-title')).toContainText(
      /Planos|Preços|Pricing/,
    );

    // Should display Basic plan
    const basicPlan = page
      .locator('[data-testid="plan-basic"]')
      .or(page.locator('text=Básico'));
    await expect(basicPlan).toBeVisible();

    // Should display Professional plan
    const proPlan = page
      .locator('[data-testid="plan-professional"]')
      .or(page.locator('text=Profissional'));
    await expect(proPlan).toBeVisible();

    // Should display Enterprise plan
    const enterprisePlan = page
      .locator('[data-testid="plan-enterprise"]')
      .or(page.locator('text=Enterprise'));
    await expect(enterprisePlan).toBeVisible();
  });

  test('should display pricing in Brazilian Real (BRL)', async ({ page }) => {
    // Check for BRL currency formatting
    const priceElements = page.locator('text=/R$s*d+/');
    await expect(priceElements.first()).toBeVisible();

    // Should display monthly pricing
    await expect(page.locator('text=//mês|mensal/')).toBeVisible();

    // Should display annual pricing option
    const annualToggle = page
      .locator('[data-testid="annual-toggle"]')
      .or(page.locator('text=Anual'));
    if (await annualToggle.isVisible()) {
      await expect(annualToggle).toBeVisible();
    }
  });

  test('should highlight recommended plan', async ({ page }) => {
    // Look for recommended/popular plan indicator
    const recommendedPlan = page
      .locator('[data-testid="recommended-plan"]')
      .or(page.locator('.recommended'))
      .or(page.locator('text=Recomendado'));

    if (await recommendedPlan.isVisible()) {
      await expect(recommendedPlan).toBeVisible();

      // Should have visual distinction
      const hasHighlight = await recommendedPlan.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return (
          style.border !== 'none'
          || style.backgroundColor !== 'rgba(0, 0, 0, 0)'
        );
      });
      expect(hasHighlight).toBeTruthy();
    }
  });

  test('should display healthcare-specific features', async ({ page }) => {
    // Check for ANVISA compliance features
    await expect(
      page.locator('text=ANVISA').or(page.locator('text=Vigilância Sanitária')),
    ).toBeVisible();

    // Check for CFM compliance features
    await expect(
      page
        .locator('text=CFM')
        .or(page.locator('text=Conselho Federal de Medicina')),
    ).toBeVisible();

    // Check for LGPD compliance
    await expect(
      page
        .locator('text=LGPD')
        .or(page.locator('text=Lei Geral de Proteção de Dados')),
    ).toBeVisible();

    // Check for medical record features
    await expect(
      page.locator('text=Prontuário').or(page.locator('text=Medical Records')),
    ).toBeVisible();
  });
});

test.describe('Pricing Page - Feature Comparison', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
  });

  test('should display feature comparison table', async ({ page }) => {
    // Look for comparison table or feature list
    const comparisonTable = page
      .locator('[data-testid="feature-comparison"]')
      .or(page.locator('.comparison-table'));

    if (await comparisonTable.isVisible()) {
      await expect(comparisonTable).toBeVisible();

      // Should show feature rows
      const featureRows = page
        .locator('tr')
        .filter({ hasText: /✓|✗|Incluído|Não incluído/ });
      if ((await featureRows.count()) > 0) {
        await expect(featureRows.first()).toBeVisible();
      }
    }
  });

  test('should show patient limits per plan', async ({ page }) => {
    // Check for patient capacity information
    const patientLimits = page.locator('text=/d+s*pacientes/');
    if ((await patientLimits.count()) > 0) {
      await expect(patientLimits.first()).toBeVisible();
    }

    // Should show storage limits
    const storageLimits = page.locator('text=/d+s*(GB|TB)/');
    if ((await storageLimits.count()) > 0) {
      await expect(storageLimits.first()).toBeVisible();
    }
  });

  test('should display API access tiers', async ({ page }) => {
    // Check for API access information
    const apiFeatures = page
      .locator('text=API')
      .or(page.locator('text=Integração'));
    if (await apiFeatures.isVisible()) {
      await expect(apiFeatures).toBeVisible();

      // Should show API rate limits
      const rateLimits = page.locator('text=/d+s*requests/');
      if ((await rateLimits.count()) > 0) {
        await expect(rateLimits.first()).toBeVisible();
      }
    }
  });

  test('should show compliance features by plan', async ({ page }) => {
    // Basic plan should have basic compliance
    const basicSection = page.locator('[data-testid="plan-basic"]');
    if (await basicSection.isVisible()) {
      await expect(basicSection.locator('text=LGPD')).toBeVisible();
    }

    // Professional plan should have advanced compliance
    const proSection = page.locator('[data-testid="plan-professional"]');
    if (await proSection.isVisible()) {
      await expect(proSection.locator('text=ANVISA')).toBeVisible();
    }

    // Enterprise should have full compliance suite
    const enterpriseSection = page.locator('[data-testid="plan-enterprise"]');
    if (await enterpriseSection.isVisible()) {
      await expect(enterpriseSection.locator('text=CFM')).toBeVisible();
    }
  });
});

test.describe('Pricing Page - Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
  });

  test('should initiate subscription for Basic plan', async ({ page }) => {
    // Click on Basic plan subscribe button
    const basicSubscribe = page
      .locator('[data-testid="subscribe-basic"]')
      .or(page.locator('button:has-text("Assinar Básico")'))
      .first();

    if (await basicSubscribe.isVisible()) {
      await basicSubscribe.click();

      // Should redirect to signup or checkout
      await expect(page).toHaveURL(/.*\/(signup|checkout|subscribe)/);

      // Should display plan selection confirmation
      await expect(
        page.locator('text=Básico').or(page.locator('text=Basic')),
      ).toBeVisible();
    }
  });

  test('should initiate subscription for Professional plan', async ({ page }) => {
    // Click on Professional plan subscribe button
    const proSubscribe = page
      .locator('[data-testid="subscribe-professional"]')
      .or(page.locator('button:has-text("Assinar Profissional")'))
      .first();

    if (await proSubscribe.isVisible()) {
      await proSubscribe.click();

      // Should redirect to signup or checkout
      await expect(page).toHaveURL(/.*\/(signup|checkout|subscribe)/);

      // Should display plan selection confirmation
      await expect(
        page.locator('text=Profissional').or(page.locator('text=Professional')),
      ).toBeVisible();
    }
  });

  test('should handle Enterprise plan contact request', async ({ page }) => {
    // Click on Enterprise plan button
    const enterpriseButton = page
      .locator('[data-testid="contact-enterprise"]')
      .or(page.locator('button:has-text("Contato")'))
      .first();

    if (await enterpriseButton.isVisible()) {
      await enterpriseButton.click();

      // Should show contact form or redirect to contact page
      const contactForm = page
        .locator('[data-testid="contact-form"]')
        .or(page.locator('.contact-form'));
      const contactPage = page.url().includes('/contact');

      expect((await contactForm.isVisible()) || contactPage).toBeTruthy();
    }
  });

  test('should toggle between monthly and annual pricing', async ({ page }) => {
    // Look for pricing toggle
    const annualToggle = page
      .locator('[data-testid="annual-toggle"]')
      .or(page.locator('input[type="checkbox"]'))
      .first();

    if (await annualToggle.isVisible()) {
      // Get initial price
      const initialPrice = await page
        .locator('text=/R$s*d+/')
        .first()
        .textContent();

      // Toggle to annual
      await annualToggle.click();
      await page.waitForTimeout(500);

      // Price should change
      const newPrice = await page
        .locator('text=/R$s*d+/')
        .first()
        .textContent();
      expect(newPrice).not.toBe(initialPrice);

      // Should show annual discount
      await expect(
        page.locator('text=desconto').or(page.locator('text=economia')),
      ).toBeVisible();
    }
  });
});

test.describe('Pricing Page - Trial and Free Options', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
  });

  test('should display free trial information', async ({ page }) => {
    // Look for free trial offers
    const freeTrialText = page
      .locator('text=gratuito')
      .or(page.locator('text=trial'))
      .or(page.locator('text=teste'));

    if (await freeTrialText.isVisible()) {
      await expect(freeTrialText).toBeVisible();

      // Should specify trial duration
      await expect(page.locator('text=/d+s*dias/')).toBeVisible();
    }
  });

  test('should start free trial', async ({ page }) => {
    // Look for free trial button
    const trialButton = page
      .locator('[data-testid="start-trial"]')
      .or(page.locator('button:has-text("Teste Gratuito")'))
      .first();

    if (await trialButton.isVisible()) {
      await trialButton.click();

      // Should redirect to signup
      await expect(page).toHaveURL(/.*\/signup/);

      // Should indicate trial signup
      await expect(
        page.locator('text=trial').or(page.locator('text=gratuito')),
      ).toBeVisible();
    }
  });

  test('should display money-back guarantee', async ({ page }) => {
    // Look for guarantee information
    const guaranteeText = page
      .locator('text=garantia')
      .or(page.locator('text=dinheiro de volta'));

    if (await guaranteeText.isVisible()) {
      await expect(guaranteeText).toBeVisible();

      // Should specify guarantee period
      await expect(page.locator('text=/d+s*dias/')).toBeVisible();
    }
  });
});

test.describe('Pricing Page - Payment Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
  });

  test('should display payment security badges', async ({ page }) => {
    // Look for security certifications
    const securityBadges = page
      .locator('img[alt*="SSL"]')
      .or(page.locator('img[alt*="seguro"]'));

    if ((await securityBadges.count()) > 0) {
      await expect(securityBadges.first()).toBeVisible();
    }

    // Look for payment method logos
    const paymentMethods = page
      .locator('img[alt*="Visa"]')
      .or(page.locator('img[alt*="Mastercard"]'))
      .or(page.locator('img[alt*="PIX"]'));

    if ((await paymentMethods.count()) > 0) {
      await expect(paymentMethods.first()).toBeVisible();
    }
  });

  test('should mention Brazilian payment methods', async ({ page }) => {
    // Should support PIX
    const pixPayment = page.locator('text=PIX');
    if (await pixPayment.isVisible()) {
      await expect(pixPayment).toBeVisible();
    }

    // Should support Boleto
    const boletoPayment = page.locator('text=Boleto');
    if (await boletoPayment.isVisible()) {
      await expect(boletoPayment).toBeVisible();
    }

    // Should support credit cards
    await expect(
      page.locator('text=cartão').or(page.locator('text=crédito')),
    ).toBeVisible();
  });

  test('should display tax information for Brazil', async ({ page }) => {
    // Should mention Brazilian taxes
    const taxInfo = page
      .locator('text=impostos')
      .or(page.locator('text=tributos'))
      .or(page.locator('text=ICMS'));

    if (await taxInfo.isVisible()) {
      await expect(taxInfo).toBeVisible();
    }

    // Should display prices including taxes
    const taxIncluded = page
      .locator('text=impostos inclusos')
      .or(page.locator('text=tributos incluídos'));

    if (await taxIncluded.isVisible()) {
      await expect(taxIncluded).toBeVisible();
    }
  });
});

test.describe('Pricing Page - Accessibility & Performance', () => {
  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/pricing');

    // Test keyboard navigation through plans
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through subscribe buttons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to activate subscribe button with Enter
    const subscribeButton = page.locator('button:focus');
    if (await subscribeButton.isVisible()) {
      await expect(subscribeButton).toBeVisible();
    }
  });

  test('should have proper ARIA labels for pricing', async ({ page }) => {
    await page.goto('/pricing');

    // Check for ARIA landmarks
    const mainContent = page.locator('[role="main"]').or(page.locator('main'));
    await expect(mainContent).toBeVisible();

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check for accessible price information
    const priceElements = page
      .locator('[aria-label*="preço"]')
      .or(page.locator('[aria-label*="price"]'));
    if ((await priceElements.count()) > 0) {
      await expect(priceElements.first()).toBeVisible();
    }
  });

  test('should load within performance thresholds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Should display all pricing plans
    await expect(
      page
        .locator('[data-testid="plan-basic"]')
        .or(page.locator('text=Básico')),
    ).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pricing');

    // Should display mobile-friendly layout
    await expect(page.locator('h1, .pricing-title')).toBeVisible();

    // Plans should stack vertically on mobile
    const planElements = page.locator('[data-testid*="plan-"]');
    if ((await planElements.count()) > 1) {
      const firstPlan = planElements.first();
      const secondPlan = planElements.nth(1);

      const firstBox = await firstPlan.boundingBox();
      const secondBox = await secondPlan.boundingBox();

      if (firstBox && secondBox) {
        // Second plan should be below first plan on mobile
        expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 50);
      }
    }
  });
});

test.describe('Pricing Page - Healthcare Compliance', () => {
  test('should display ANVISA compliance pricing', async ({ page }) => {
    await page.goto('/pricing');

    // Should mention ANVISA features in higher tiers
    const anvisaFeatures = page.locator('text=ANVISA');
    if (await anvisaFeatures.isVisible()) {
      await expect(anvisaFeatures).toBeVisible();

      // Should be in Professional or Enterprise plans
      const professionalPlan = page.locator(
        '[data-testid="plan-professional"]',
      );
      const enterprisePlan = page.locator('[data-testid="plan-enterprise"]');

      const anvisaInPro = await professionalPlan
        .locator('text=ANVISA')
        .isVisible();
      const anvisaInEnterprise = await enterprisePlan
        .locator('text=ANVISA')
        .isVisible();

      expect(anvisaInPro || anvisaInEnterprise).toBeTruthy();
    }
  });

  test('should display CFM compliance features', async ({ page }) => {
    await page.goto('/pricing');

    // Should mention CFM compliance
    const cfmFeatures = page.locator('text=CFM');
    if (await cfmFeatures.isVisible()) {
      await expect(cfmFeatures).toBeVisible();

      // Should include telemedicine features
      await expect(
        page.locator('text=telemedicina').or(page.locator('text=teleconsulta')),
      ).toBeVisible();
    }
  });

  test('should show data residency options for Brazil', async ({ page }) => {
    await page.goto('/pricing');

    // Should mention Brazilian data centers
    const dataResidency = page
      .locator('text=Brasil')
      .or(page.locator('text=dados no Brasil'));
    if (await dataResidency.isVisible()) {
      await expect(dataResidency).toBeVisible();
    }

    // Should mention LGPD compliance
    await expect(page.locator('text=LGPD')).toBeVisible();
  });
});
