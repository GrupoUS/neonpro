/**
 * NeonPro Healthcare - Authentication E2E Tests
 *
 * PRIORITY: CRITICAL - Core authentication flows
 * COVERAGE: Login, logout, session management, security
 * HEALTHCARE FOCUS: Professional credential validation
 */

import { expect, test } from '@playwright/test';

test.describe('Healthcare Professional Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display login page with healthcare branding', async ({
    page,
  }) => {
    // Healthcare-specific UI elements
    await expect(page.locator('h1')).toContainText(/Login|Entrar/);
    await expect(page.locator('[data-testid="healthcare-logo"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Professional login indicators
    await expect(page.locator('text=Acesso Profissional')).toBeVisible();
    await expect(
      page.locator('[data-testid="crm-validation-info"]')
    ).toBeVisible();
  });

  test('should validate professional credentials format', async ({ page }) => {
    // Test CRM number validation
    await page.fill('input[type="email"]', 'invalid-format');
    await page.fill('[data-testid="crm-number"]', '123'); // Invalid CRM
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Formato de email inválido')).toBeVisible();
    await expect(
      page.locator('text=CRM deve conter estado e números')
    ).toBeVisible();
  });

  test('should authenticate healthcare professional successfully', async ({
    page,
  }) => {
    // Use test healthcare professional credentials
    await page.fill('input[type="email"]', 'dr.silva@neonpro.com');
    await page.fill('input[type="password"]', 'HealthcareTest2024!');
    await page.fill('[data-testid="crm-number"]', 'CRM/SP 123456');

    // Professional license validation
    await page.click('button[type="submit"]');

    // Should show license validation
    await expect(
      page.locator('[data-testid="validating-license"]')
    ).toBeVisible();

    // Wait for authentication
    await page.waitForURL('/dashboard', { timeout: 15_000 });

    // Verify healthcare dashboard elements
    await expect(
      page.locator('[data-testid="professional-name"]')
    ).toContainText('Dr. Silva');
    await expect(page.locator('[data-testid="crm-display"]')).toContainText(
      'CRM/SP 123456'
    );
    await expect(page.locator('[data-testid="clinic-context"]')).toBeVisible();

    // Essential healthcare navigation
    await expect(page.locator('[data-testid="nav-patients"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="nav-appointments"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="nav-reports"]')).toBeVisible();
  });

  test('should handle invalid professional credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'fake@doctor.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.fill('[data-testid="crm-number"]', 'CRM/SP 999999');

    await page.click('button[type="submit"]');

    // Should show professional validation error
    await expect(
      page.locator('text=Credenciais profissionais inválidas')
    ).toBeVisible();
    await expect(
      page.locator('text=CRM não encontrado no sistema')
    ).toBeVisible();

    // Should remain on login page
    await expect(page.url()).toContain('/login');
  });

  test('should handle session persistence across page refreshes', async ({
    page,
  }) => {
    // Login first
    await page.fill('input[type="email"]', 'dr.silva@neonpro.com');
    await page.fill('input[type="password"]', 'HealthcareTest2024!');
    await page.fill('[data-testid="crm-number"]', 'CRM/SP 123456');
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should maintain session
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.locator('[data-testid="professional-name"]')
    ).toBeVisible();
  });

  test('should redirect to login when accessing protected healthcare routes', async ({
    page,
  }) => {
    // Try to access patients without authentication
    await page.goto('/patients');

    // Should redirect to login with healthcare messaging
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.locator('text=Acesso restrito a profissionais autenticados')
    ).toBeVisible();
  });
});

test.describe('Multi-Factor Authentication (Healthcare Compliance)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('should enforce MFA for sensitive operations', async ({ page }) => {
    // Login with standard credentials
    await page.fill('input[type="email"]', 'dr.silva@neonpro.com');
    await page.fill('input[type="password"]', 'HealthcareTest2024!');
    await page.fill('[data-testid="crm-number"]', 'CRM/SP 123456');
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');

    // Try to access sensitive operation (prescription management)
    await page.click('[data-testid="nav-prescriptions"]');

    // Should prompt for MFA
    await expect(page.locator('[data-testid="mfa-challenge"]')).toBeVisible();
    await expect(
      page.locator('text=Verificação adicional necessária')
    ).toBeVisible();

    // Simulate MFA token entry
    await page.fill('[data-testid="mfa-token"]', '123456');
    await page.click('[data-testid="verify-mfa-btn"]');

    // Should grant access to sensitive area
    await expect(page).toHaveURL(/\/prescriptions/);
    await expect(
      page.locator('[data-testid="prescription-dashboard"]')
    ).toBeVisible();
  });
});

test.describe('Emergency Access Protocol', () => {
  test('should handle emergency authentication bypass', async ({ page }) => {
    await page.goto('/login');

    // Click emergency access button
    await page.click('[data-testid="emergency-access-btn"]');

    // Should show emergency authentication form
    await expect(
      page.locator('[data-testid="emergency-auth-modal"]')
    ).toBeVisible();
    await expect(page.locator('text=Acesso de Emergência')).toBeVisible();
    await expect(
      page.locator('text=Para situações de risco à vida')
    ).toBeVisible();

    // Fill emergency credentials
    await page.fill('[data-testid="emergency-id"]', 'EMRG001');
    await page.fill('[data-testid="emergency-code"]', 'VIDA123');
    await page.fill(
      '[data-testid="incident-description"]',
      'Parada cardiorrespiratória - Acesso urgente ao prontuário'
    );

    await page.click('[data-testid="emergency-access-confirm"]');

    // Should grant immediate access
    await expect(page).toHaveURL(/\/emergency-dashboard/);
    await expect(
      page.locator('[data-testid="emergency-banner"]')
    ).toBeVisible();
    await expect(page.locator('text=MODO EMERGÊNCIA ATIVO')).toBeVisible();

    // Should show emergency timer
    await expect(page.locator('[data-testid="emergency-timer"]')).toBeVisible();

    // Should log emergency access
    await expect(
      page.locator('[data-testid="emergency-audit-log"]')
    ).toBeVisible();
  });
});

test.describe('Professional License Validation', () => {
  test('should validate CRM status and specialties', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'especialista@neonpro.com');
    await page.fill('input[type="password"]', 'SpecialistTest2024!');
    await page.fill('[data-testid="crm-number"]', 'CRM/RJ 654321');

    // Select medical specialty
    await page.click('[data-testid="specialty-select"]');
    await page.click('[data-testid="specialty-cardiologia"]');

    await page.click('button[type="submit"]');

    // Should validate specialty certification
    await expect(
      page.locator('[data-testid="validating-specialty"]')
    ).toBeVisible();

    await page.waitForURL('/dashboard');

    // Should display specialty information
    await expect(
      page.locator('[data-testid="professional-specialty"]')
    ).toContainText('Cardiologia');
    await expect(
      page.locator('[data-testid="specialty-permissions"]')
    ).toBeVisible();

    // Should show specialty-specific tools
    await expect(
      page.locator('[data-testid="cardiology-tools"]')
    ).toBeVisible();
  });

  test('should handle expired professional license', async ({ page }) => {
    await page.goto('/login');

    // Use credentials with expired license
    await page.fill('input[type="email"]', 'expired@neonpro.com');
    await page.fill('input[type="password"]', 'ExpiredTest2024!');
    await page.fill('[data-testid="crm-number"]', 'CRM/MG 999999');

    await page.click('button[type="submit"]');

    // Should show license expiration error
    await expect(
      page.locator('[data-testid="license-expired-error"]')
    ).toBeVisible();
    await expect(page.locator('text=CRM vencido ou suspenso')).toBeVisible();
    await expect(
      page.locator('text=Contate o Conselho Regional de Medicina')
    ).toBeVisible();

    // Should provide renewal instructions
    await expect(
      page.locator('[data-testid="renewal-instructions"]')
    ).toBeVisible();

    // Should block access
    await expect(page.url()).toContain('/login');
  });
});

test.describe('Security & Compliance', () => {
  test('should enforce password policy for healthcare professionals', async ({
    page,
  }) => {
    await page.goto('/register');

    await page.fill('[data-testid="professional-name"]', 'Dr. Novo Médico');
    await page.fill('input[type="email"]', 'novo@neonpro.com');
    await page.fill('[data-testid="crm-number"]', 'CRM/ES 111111');

    // Test weak password
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Should show healthcare password requirements
    await expect(
      page.locator('text=Senha deve ter no mínimo 12 caracteres')
    ).toBeVisible();
    await expect(
      page.locator('text=Deve conter letras, números e símbolos')
    ).toBeVisible();
    await expect(
      page.locator('text=Exigência CFM para segurança de dados')
    ).toBeVisible();

    // Test compliant password
    await page.fill('input[type="password"]', 'MedSecure2024!@#');
    await page.fill('[data-testid="password-confirm"]', 'MedSecure2024!@#');

    await page.click('button[type="submit"]');

    // Should proceed to license verification
    await expect(
      page.locator('[data-testid="license-verification"]')
    ).toBeVisible();
  });

  test('should implement audit logging for authentication events', async ({
    page,
  }) => {
    await page.goto('/admin/audit-logs');

    // Should require admin authentication
    await page.fill('input[type="email"]', 'admin@neonpro.com');
    await page.fill('input[type="password"]', 'AdminHealthcare2024!');
    await page.click('button[type="submit"]');

    await page.waitForURL('/admin/audit-logs');

    // Filter for authentication events
    await page.click('[data-testid="event-filter"]');
    await page.click('[data-testid="filter-authentication"]');

    // Should show authentication audit trail
    await expect(page.locator('[data-testid="audit-entry"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-action"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="audit-ip-address"]')
    ).toBeVisible();

    // Should show license validation events
    await expect(page.locator('text=CRM validation')).toBeVisible();
    await expect(page.locator('text=Emergency access')).toBeVisible();
  });
});

test.describe('Accessibility & Performance', () => {
  test('should be accessible for healthcare professionals with disabilities', async ({
    page,
  }) => {
    await page.goto('/login');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="crm-number"]')).toBeFocused();

    // Test screen reader labels
    await expect(page.locator('input[type="email"]')).toHaveAttribute(
      'aria-label',
      /email|e-mail/i
    );
    await expect(page.locator('input[type="password"]')).toHaveAttribute(
      'aria-label',
      /senha|password/i
    );
    await expect(page.locator('[data-testid="crm-number"]')).toHaveAttribute(
      'aria-label',
      /crm/i
    );

    // Test high contrast mode compatibility
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should load within performance budget for healthcare environment', async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Healthcare systems requirement: < 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Test Core Web Vitals
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries.at(-1);
          resolve(lastEntry?.startTime || 0);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    // LCP should be under 2.5 seconds for healthcare UX
    expect(lcp).toBeLessThan(2500);
  });
});
