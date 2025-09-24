import { test, expect } from '@playwright/test';
import { AuthUtils, TEST_USERS } from '../utils/auth-utils.js';
import { createTestUtils } from '../utils/test-utils.js';

test.describe('Authentication Flow', () => {
  let authUtils: AuthUtils;
  let testUtils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    authUtils = new AuthUtils(page);
    testUtils = createTestUtils(page);
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await authUtils.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should successfully register new user', async ({ page }) => {
    await page.click('[data-testid="register-link"]');
    
    await expect(page).toHaveURL('/register');
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    
    const newUser = {
      name: 'New Test User',
      email: 'newuser@example.com',
      password: 'password123',
      phone: '+55 11 9888-7777',
    };
    
    await authUtils.register(newUser);
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText(newUser.name);
  });

  test('should logout successfully', async ({ page }) => {
    await authUtils.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await authUtils.logout();
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.click('[data-testid="forgot-password-link"]');
    
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.locator('[data-testid="forgot-password-form"]')).toBeVisible();
    
    await authUtils.resetPassword(TEST_USERS.admin.email);
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset email sent');
  });

  test('should maintain login state after page refresh', async ({ page }) => {
    await authUtils.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await page.reload();
    
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    const userName = await authUtils.getCurrentUser();
    expect(userName).toBe(TEST_USERS.admin.name);
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should validate email format on registration', async ({ page }) => {
    await page.click('[data-testid="register-link"]');
    
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="phone-input"]', '+55 11 9888-7777');
    await page.click('[data-testid="terms-checkbox"]');
    
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Please enter a valid email');
  });

  test('should require LGPD consent on registration', async ({ page }) => {
    await page.click('[data-testid="register-link"]');
    
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="phone-input"]', '+55 11 9888-7777');
    
    // Don't check LGPD consent
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="lgpd-consent-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="lgpd-consent-error"]')).toContainText('LGPD consent is required');
  });

  test('should handle session timeout', async ({ page }) => {
    await authUtils.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Simulate session timeout by clearing localStorage
    await page.evaluate(() => localStorage.clear());
    
    await page.reload();
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="session-timeout-message"]')).toBeVisible();
  });

  test('should support social login options', async ({ page }) => {
    await expect(page.locator('[data-testid="google-login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="facebook-login-button"]')).toBeVisible();
    
    // Note: Actual social login testing would require OAuth mock setup
    // This test just verifies the buttons are present
  });

  test('should have accessible authentication forms', async ({ page }) => {
    await page.goto('/login');
    
    const loginForm = page.locator('[data-testid="login-form"]');
    await expect(loginForm).toBeVisible();
    
    // Check accessibility
    const violations = await testUtils.checkAccessibility();
    expect(violations).toBeNull();
    
    // Check form labels
    const inputs = await loginForm.locator('input').all();
    for (const input of inputs) {
      await expect(input).toHaveAccessibleName('');
    }
  });
});