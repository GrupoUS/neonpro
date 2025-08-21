import { expect, test } from '@playwright/test';

/**
 * 🔐 CRITICAL Authentication E2E Tests for NeonPro Healthcare
 * Tests complete authentication flow with role-based access and session management
 */

test.describe('🔐 Authentication Flow - Critical E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('🚪 Login/Logout Complete Flow', () => {
    test('should complete full login flow with valid credentials', async ({ page }) => {
      // Navigate to login page
      const loginButton = page.locator('[data-testid="login-button"], button:has-text("Entrar"), a:has-text("Login")');
      if (await loginButton.count() > 0) {
        await loginButton.click();
      } else {
        await page.goto('/login');
      }

      await page.waitForLoadState('networkidle');

      // Fill login form with valid credentials
      await page.fill('[data-testid="email"], input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'AdminSecure123!');
      
      // Submit login
      await page.click('[data-testid="login-submit"], button[type="submit"], button:has-text("Entrar")');
      
      // Wait for navigation and verify successful login
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Verify dashboard elements are visible
      await expect(page.locator('[data-testid="dashboard"], [data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="logout"], button:has-text("Sair")')).toBeVisible();
      
      // Verify user session is established
      const userInfo = page.locator('[data-testid="user-info"], [data-testid="user-name"]');
      await expect(userInfo).toBeVisible();
    });

    test('should complete logout flow and clear session', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email"], input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'AdminSecure123!');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Perform logout
      const userMenu = page.locator('[data-testid="user-menu"], [data-testid="profile-menu"]');
      if (await userMenu.count() > 0) {
        await userMenu.click();
      }
      
      const logoutButton = page.locator('[data-testid="logout"], button:has-text("Sair"), a:has-text("Sair")');
      await logoutButton.click();
      
      // Verify logout completed
      await page.waitForURL(/\/(login|$)/, { timeout: 10000 });
      
      // Verify protected routes are inaccessible
      await page.goto('/dashboard');
      await expect(page.url()).toMatch(/\/(login|$)/);
      
      // Verify session cleared
      const sessionStorage = await page.evaluate(() => localStorage.getItem('auth-token'));
      expect(sessionStorage).toBeNull();
    });

    test('should reject invalid credentials with proper error handling', async ({ page }) => {
      await page.goto('/login');
      
      // Attempt login with invalid credentials
      await page.fill('[data-testid="email"], input[type="email"]', 'invalid@email.com');
      await page.fill('[data-testid="password"], input[type="password"]', 'wrongpassword');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      
      // Verify error message appears
      await expect(page.locator('[data-testid="login-error"], .error, [role="alert"]')).toBeVisible();
      
      // Verify still on login page
      expect(page.url()).toMatch(/login/);
      
      // Verify no dashboard access
      await page.goto('/dashboard');
      expect(page.url()).toMatch(/login/);
    });
  });

  test.describe('🔒 Session Persistence', () => {
    test('should maintain session across browser refresh', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="email"], input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'AdminSecure123!');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify still authenticated
      expect(page.url()).toMatch(/dashboard/);
      await expect(page.locator('[data-testid="user-menu"], [data-testid="logout"]')).toBeVisible();
    });

    test('should handle session timeout gracefully', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="email"], input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'AdminSecure123!');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Simulate session expiry by clearing auth tokens
      await page.evaluate(() => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
      });
      
      // Try to access protected resource
      await page.goto('/patients');
      
      // Should redirect to login
      await expect(page.url()).toMatch(/login/);
      await expect(page.locator('[data-testid="session-expired"], .session-expired')).toBeVisible();
    });
  });

  test.describe('👥 Role-based Access Control', () => {
    test('should grant admin access to all areas', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('[data-testid="email"], input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'AdminSecure123!');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Verify admin navigation elements
      const adminMenus = [
        '[data-testid="patients-menu"]',
        '[data-testid="appointments-menu"]', 
        '[data-testid="users-menu"]',
        '[data-testid="settings-menu"]',
        '[data-testid="reports-menu"]'
      ];
      
      for (const menu of adminMenus) {
        const element = page.locator(menu);
        if (await element.count() > 0) {
          await expect(element).toBeVisible();
        }
      }
      
      // Test access to admin-only pages
      await page.goto('/users');
      expect(page.url()).toMatch(/users/);
      
      await page.goto('/settings');
      expect(page.url()).toMatch(/settings/);
    });

    test('should restrict professional access appropriately', async ({ page }) => {
      // Login as healthcare professional
      await page.goto('/login');
      await page.fill('[data-testid="email"], input[type="email"]', 'medico@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'MedicoSecure123!');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Verify professional can access patient-related areas
      await page.goto('/patients');
      expect(page.url()).toMatch(/patients/);
      
      await page.goto('/appointments');
      expect(page.url()).toMatch(/appointments/);
      
      // Verify restricted access to admin areas
      await page.goto('/users');
      await expect(page.locator('[data-testid="access-denied"], .access-denied')).toBeVisible();
      
      await page.goto('/settings');
      await expect(page.locator('[data-testid="access-denied"], .access-denied')).toBeVisible();
    });

    test('should restrict staff access to basic functions', async ({ page }) => {
      // Login as staff
      await page.goto('/login');
      await page.fill('[data-testid="email"], input[type="email"]', 'recepcionista@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'StaffSecure123!');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Verify staff can access scheduling and basic patient info
      await page.goto('/appointments');
      expect(page.url()).toMatch(/appointments/);
      
      await page.goto('/patients');
      expect(page.url()).toMatch(/patients/);
      
      // Verify restricted access to medical records
      await page.goto('/patients/1/medical-records');
      await expect(page.locator('[data-testid="access-restricted"], .access-restricted')).toBeVisible();
      
      // Verify no access to admin functions
      await page.goto('/users');
      await expect(page.locator('[data-testid="access-denied"], .access-denied')).toBeVisible();
    });
  });

  test.describe('🔐 Security Validations', () => {
    test('should validate form inputs and prevent injection', async ({ page }) => {
      await page.goto('/login');
      
      // Test SQL injection attempt
      await page.fill('[data-testid="email"], input[type="email"]', "'; DROP TABLE users; --");
      await page.fill('[data-testid="password"], input[type="password"]', 'password');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      
      // Should show validation error, not crash
      await expect(page.locator('[data-testid="validation-error"], .validation-error')).toBeVisible();
      expect(page.url()).toMatch(/login/);
    });

    test('should enforce rate limiting on failed attempts', async ({ page }) => {
      await page.goto('/login');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email"], input[type="email"]', 'test@example.com');
        await page.fill('[data-testid="password"], input[type="password"]', 'wrongpassword');
        await page.click('[data-testid="login-submit"], button[type="submit"]');
        await page.waitForTimeout(500);
      }
      
      // Should show rate limiting message
      await expect(page.locator('[data-testid="rate-limit"], .rate-limit-error')).toBeVisible();
      
      // Form should be disabled temporarily
      const submitButton = page.locator('[data-testid="login-submit"], button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test('should handle password requirements validation', async ({ page }) => {
      // This test assumes there's a password change/reset flow
      await page.goto('/login');
      
      // Look for password requirements display
      const passwordField = page.locator('[data-testid="password"], input[type="password"]');
      await passwordField.focus();
      
      // Test weak password
      await passwordField.fill('123');
      
      // Should show password strength indicator
      const strengthIndicator = page.locator('[data-testid="password-strength"], .password-strength');
      if (await strengthIndicator.count() > 0) {
        await expect(strengthIndicator).toBeVisible();
        await expect(strengthIndicator).toContainText(/fraca|weak/i);
      }
    });
  });

  test.describe('🚨 Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept and fail the login request
      await page.route('**/api/auth/login', route => {
        route.abort('failed');
      });
      
      await page.goto('/login');
      await page.fill('[data-testid="email"], input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'AdminSecure123!');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      
      // Should show network error message
      await expect(page.locator('[data-testid="network-error"], .network-error')).toBeVisible();
      expect(page.url()).toMatch(/login/);
    });

    test('should show proper loading states during authentication', async ({ page }) => {
      // Slow down the authentication request
      await page.route('**/api/auth/login', route => {
        setTimeout(() => route.continue(), 2000);
      });
      
      await page.goto('/login');
      await page.fill('[data-testid="email"], input[type="email"]', 'admin@neonpro.com.br');
      await page.fill('[data-testid="password"], input[type="password"]', 'AdminSecure123!');
      await page.click('[data-testid="login-submit"], button[type="submit"]');
      
      // Should show loading state
      await expect(page.locator('[data-testid="login-loading"], .loading')).toBeVisible();
      
      // Submit button should be disabled during loading
      const submitButton = page.locator('[data-testid="login-submit"], button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });
  });
});
