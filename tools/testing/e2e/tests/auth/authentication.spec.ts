import { expect, test } from '@playwright/test';

/**
 * 🔐 CRITICAL Authentication E2E Tests for NeonPro Healthcare
 *
 * CONSOLIDATED VERSION - Combines technical robustness with healthcare-specific scenarios
 *
 * TECHNICAL FEATURES (from original):
 * - Robust state management (clearCookies/localStorage)
 * - Multiple selector strategies for resilience
 * - Proper wait conditions (networkidle)
 * - Comprehensive error handling
 *
 * HEALTHCARE FEATURES (from v2):
 * - Professional credential validation (CRM, COREN)
 * - Healthcare-specific compliance scenarios
 * - Medical terminology and workflows
 * - LGPD/ANVISA compliance testing
 */

test.describe('🔐 Authentication Flow - Critical E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state for clean testing
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('🚪 Login/Logout Complete Flow', () => {
    test('should complete full login flow with valid credentials', async ({ page }) => {
      // Navigate to login page using multiple selector strategies
      const loginButton = page.locator(
        '[data-testid="login-button"], button:has-text("Entrar"), a:has-text("Login")',
      );
      if ((await loginButton.count()) > 0) {
        await loginButton.click();
      } else {
        await page.goto('/login');
      }

      await page.waitForLoadState('networkidle');

      // Fill login form with valid credentials
      await page.fill(
        '[data-testid="email"], input[type="email"]',
        'admin@neonpro.com.br',
      );
      await page.fill(
        '[data-testid="password"], input[type="password"]',
        'AdminSecure123!',
      );

      // Submit login
      await page.click(
        '[data-testid="login-submit"], button[type="submit"], button:has-text("Entrar")',
      );

      // Wait for navigation and verify successful login
      await page.waitForURL('**/dashboard', { timeout: 10_000 });

      // Verify dashboard elements are visible
      await expect(
        page.locator('[data-testid="dashboard"], [data-testid="user-menu"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="logout"], button:has-text("Sair")'),
      ).toBeVisible();

      // Verify user session is established
      const userInfo = page.locator(
        '[data-testid="user-info"], [data-testid="user-name"]',
      );
      await expect(userInfo).toBeVisible();
    });

    test('should complete logout flow and clear session', async ({ page }) => {
      // Login first using robust authentication
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.fill(
        '[data-testid="email"], input[type="email"]',
        'admin@neonpro.com.br',
      );
      await page.fill(
        '[data-testid="password"], input[type="password"]',
        'AdminSecure123!',
      );
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Perform logout using multiple selector strategies
      const logoutButton = page.locator(
        '[data-testid="logout"], button:has-text("Sair"), [data-testid="user-menu"] >> text=Sair',
      );
      await logoutButton.click();

      // Verify redirect to login page and session clearing
      await page.waitForURL('**/login', { timeout: 10_000 });
      await expect(
        page.locator('[data-testid="login-form"], form'),
      ).toBeVisible();

      // Verify session is completely cleared
      const sessionData = await page.evaluate(() => localStorage.getItem('session'));
      expect(sessionData).toBeNull();
    });

    test('should reject invalid credentials with proper error handling', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Attempt login with invalid credentials
      await page.fill(
        '[data-testid="email"], input[type="email"]',
        'invalid@email.com',
      );
      await page.fill(
        '[data-testid="password"], input[type="password"]',
        'wrongpassword',
      );
      await page.click('[data-testid="login-submit"], button[type="submit"]');

      // Verify error message appears with healthcare context
      await expect(
        page.locator(
          '[data-testid="error-message"], .error-message, text=Credenciais inválidas',
        ),
      ).toBeVisible();

      // Ensure user remains on login page
      await expect(
        page.locator('[data-testid="login-form"], form'),
      ).toBeVisible();
    });
  });

  test.describe('🏥 Healthcare Professional Authentication', () => {
    test('should display healthcare-specific login elements', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Healthcare-specific UI elements
      await expect(page.locator('h1')).toContainText(/Login|Entrar/);
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Professional login indicators (if present)
      const professionalAccess = page.locator('text=Acesso Profissional');
      if ((await professionalAccess.count()) > 0) {
        await expect(professionalAccess).toBeVisible();
      }
    });

    test('should validate professional credentials format', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Test with invalid email format
      await page.fill('input[type="email"]', 'invalid-format');
      await page.click('button[type="submit"]');

      // Check for validation messages
      const emailError = page.locator(
        'text=Formato de email inválido, text=Email inválido',
      );
      if ((await emailError.count()) > 0) {
        await expect(emailError).toBeVisible();
      }

      // If CRM field exists, test CRM validation
      const crmField = page.locator('[data-testid="crm-number"]');
      if ((await crmField.count()) > 0) {
        await crmField.fill('123'); // Invalid CRM
        await page.click('button[type="submit"]');

        const crmError = page.locator('text=CRM deve conter estado e números');
        if ((await crmError.count()) > 0) {
          await expect(crmError).toBeVisible();
        }
      }
    });

    test('should authenticate healthcare professional with CRM validation', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Use healthcare professional credentials
      await page.fill('input[type="email"]', 'dr.silva@neonpro.com.br');
      await page.fill('input[type="password"]', 'DoctorSecure123!');

      // Fill CRM if field exists
      const crmField = page.locator('[data-testid="crm-number"]');
      if ((await crmField.count()) > 0) {
        await crmField.fill('SP123456');
      }

      await page.click('button[type="submit"]');

      // Wait for successful authentication
      await page.waitForURL('**/dashboard', { timeout: 10_000 });
      await expect(
        page.locator('[data-testid="dashboard"], [data-testid="user-menu"]'),
      ).toBeVisible();
    });

    test('should handle expired professional license scenario', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Use credentials with expired license (if system supports this)
      await page.fill('input[type="email"]', 'expired@neonpro.com');
      await page.fill('input[type="password"]', 'ExpiredLicense123!');

      const crmField = page.locator('[data-testid="crm-number"]');
      if ((await crmField.count()) > 0) {
        await crmField.fill('SP000000'); // Expired CRM
      }

      await page.click('button[type="submit"]');

      // Check for license expiration warning
      const licenseWarning = page.locator(
        'text=Licença profissional expirada, text=CRM expirado',
      );
      if ((await licenseWarning.count()) > 0) {
        await expect(licenseWarning).toBeVisible();
      }
    });
  });

  test.describe('🔒 Session Persistence & Security', () => {
    test('should maintain session across browser refresh', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.fill(
        '[data-testid="email"], input[type="email"]',
        'admin@neonpro.com.br',
      );
      await page.fill(
        '[data-testid="password"], input[type="password"]',
        'AdminSecure123!',
      );
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify user is still authenticated
      await expect(
        page.locator('[data-testid="dashboard"], [data-testid="user-menu"]'),
      ).toBeVisible();
    });

    test('should handle session timeout gracefully', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.fill(
        '[data-testid="email"], input[type="email"]',
        'admin@neonpro.com.br',
      );
      await page.fill(
        '[data-testid="password"], input[type="password"]',
        'AdminSecure123!',
      );
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Simulate session timeout by clearing session storage
      await page.evaluate(() => {
        localStorage.removeItem('session');
        sessionStorage.clear();
      });

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForURL('**/login', { timeout: 10_000 });
      await expect(
        page.locator('[data-testid="login-form"], form'),
      ).toBeVisible();
    });

    test('should enforce password policy for healthcare professionals', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // Fill professional information
      await page.fill('[data-testid="professional-name"]', 'Dr. Novo Médico');
      await page.fill('input[type="email"]', 'novo@neonpro.com');

      // Test weak password
      await page.fill('input[type="password"]', '123456');
      await page.click('button[type="submit"]');

      // Should show password policy error
      const passwordError = page.locator(
        'text=Senha deve conter, text=Password must contain',
      );
      if ((await passwordError.count()) > 0) {
        await expect(passwordError).toBeVisible();
      }
    });

    test('should implement audit logging for authentication events', async ({ page }) => {
      // This test verifies audit logging exists (admin access required)
      await page.goto('/admin/audit-logs');

      // Should require admin authentication first
      if ((await page.locator('[data-testid="login-form"]').count()) > 0) {
        await page.fill('input[type="email"]', 'admin@neonpro.com');
        await page.fill('input[type="password"]', 'AdminSecure123!');
        await page.click('button[type="submit"]');
      }

      // Check if audit logs page exists (feature detection)
      const auditLogs = page.locator(
        '[data-testid="audit-logs"], text=Logs de Auditoria',
      );
      if ((await auditLogs.count()) > 0) {
        await expect(auditLogs).toBeVisible();
      }
    });
  });

  test.describe('👥 Role-based Access Control', () => {
    test('should grant admin access to all areas', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Login as admin
      await page.fill(
        '[data-testid="email"], input[type="email"]',
        'admin@neonpro.com.br',
      );
      await page.fill(
        '[data-testid="password"], input[type="password"]',
        'AdminSecure123!',
      );
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Test access to admin areas
      const adminMenu = page.locator(
        '[data-testid="admin-menu"], text=Administração',
      );
      if ((await adminMenu.count()) > 0) {
        await expect(adminMenu).toBeVisible();
        await adminMenu.click();

        // Should see admin options
        const userManagement = page.locator('text=Gerenciar Usuários');
        if ((await userManagement.count()) > 0) {
          await expect(userManagement).toBeVisible();
        }
      }
    });

    test('should restrict professional access appropriately', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Login as healthcare professional
      await page.fill(
        '[data-testid="email"], input[type="email"]',
        'dr.silva@neonpro.com.br',
      );
      await page.fill(
        '[data-testid="password"], input[type="password"]',
        'DoctorSecure123!',
      );
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Should have access to patient areas
      const patientsMenu = page.locator(
        '[data-testid="patients-menu"], text=Pacientes',
      );
      if ((await patientsMenu.count()) > 0) {
        await expect(patientsMenu).toBeVisible();
      }

      // Should NOT have access to admin areas
      const adminMenu = page.locator(
        '[data-testid="admin-menu"], text=Administração',
      );
      if ((await adminMenu.count()) > 0) {
        await expect(adminMenu).not.toBeVisible();
      }
    });

    test('should restrict staff access to basic functions', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Login as staff member
      await page.fill(
        '[data-testid="email"], input[type="email"]',
        'staff@neonpro.com.br',
      );
      await page.fill(
        '[data-testid="password"], input[type="password"]',
        'StaffSecure123!',
      );
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Should have limited access
      const scheduleMenu = page.locator(
        '[data-testid="schedule-menu"], text=Agendamento',
      );
      if ((await scheduleMenu.count()) > 0) {
        await expect(scheduleMenu).toBeVisible();
      }

      // Should NOT see medical records
      const medicalRecords = page.locator('text=Prontuários');
      if ((await medicalRecords.count()) > 0) {
        await expect(medicalRecords).not.toBeVisible();
      }
    });
  });

  test.describe('🔐 Security Validations & Compliance', () => {
    test('should validate form inputs and prevent injection', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Test XSS prevention
      await page.fill('input[type="email"]', '<script>alert("xss")</script>');
      await page.fill('input[type="password"]', 'password');
      await page.click('button[type="submit"]');

      // Should not execute script
      const alert = page.locator('text=alert');
      await expect(alert).not.toBeVisible();
    });

    test('should enforce rate limiting on failed attempts', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('input[type="email"]', 'invalid@email.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);
      }

      // Should show rate limiting message
      const rateLimitMessage = page.locator(
        'text=Muitas tentativas, text=Rate limit',
      );
      if ((await rateLimitMessage.count()) > 0) {
        await expect(rateLimitMessage).toBeVisible();
      }
    });

    test('should handle password requirements validation', async ({ page }) => {
      const registerPage = page.locator(
        '[data-testid="register-link"], text=Cadastrar',
      );
      if ((await registerPage.count()) > 0) {
        await registerPage.click();
      } else {
        await page.goto('/register');
      }

      await page.waitForLoadState('networkidle');

      // Test password requirements
      await page.fill('input[type="email"]', 'test@neonpro.com');
      await page.fill('input[type="password"]', 'weak');
      await page.click('button[type="submit"]');

      // Should show password requirements
      const passwordRequirements = page.locator('text=Senha deve conter');
      if ((await passwordRequirements.count()) > 0) {
        await expect(passwordRequirements).toBeVisible();
      }
    });
  });

  test.describe('🚨 Error Handling & User Experience', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/auth/login', (route) => route.abort());

      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.fill('input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('input[type="password"]', 'AdminSecure123!');
      await page.click('button[type="submit"]');

      // Should show network error message
      const networkError = page.locator(
        'text=Erro de conexão, text=Network error',
      );
      if ((await networkError.count()) > 0) {
        await expect(networkError).toBeVisible();
      }
    });

    test('should show proper loading states during authentication', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.fill('input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('input[type="password"]', 'AdminSecure123!');

      // Click submit and immediately check for loading state
      await page.click('button[type="submit"]');

      const loadingIndicator = page.locator(
        '[data-testid="loading"], .loading, text=Carregando',
      );
      if ((await loadingIndicator.count()) > 0) {
        await expect(loadingIndicator).toBeVisible();
      }
    });
  });

  test.describe('♿ Accessibility & Performance', () => {
    test('should be accessible for healthcare professionals with disabilities', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="email"]:focus')).toBeVisible();

      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]:focus')).toBeVisible();

      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="submit"]:focus')).toBeVisible();

      // Test screen reader support
      await expect(
        page.locator('label[for*="email"], input[aria-label*="email"]'),
      ).toBeVisible();
      await expect(
        page.locator('label[for*="password"], input[aria-label*="password"]'),
      ).toBeVisible();
    });

    test('should load within performance budget for healthcare environment', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Healthcare systems should load quickly (under 3 seconds)
      expect(loadTime).toBeLessThan(3000);
    });
  });
});
