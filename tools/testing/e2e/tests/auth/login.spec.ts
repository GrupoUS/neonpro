// Essential Auth E2E Test
// e2e/tests/auth/login.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Authentication - Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Wait for login form to load
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();

    // Fill login form
    await page.getByLabel(/email/i).fill('admin@neonpro.com');
    await page.getByLabel(/senha/i).fill('password123');

    // Submit login form
    await page.getByRole('button', { name: /entrar/i }).click();

    // Verify successful login - redirect to dashboard
    await expect(page.url()).toMatch(/\/dashboard/);

    // Verify dashboard elements are visible
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();
    await expect(page.getByText(/bem-vindo/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@email.com');
    await page.getByLabel(/senha/i).fill('wrongpassword');

    // Submit login form
    await page.getByRole('button', { name: /entrar/i }).click();

    // Verify error message
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();

    // Verify still on login page
    await expect(page.url()).toMatch(/\/login/);
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: /entrar/i }).click();

    // Verify validation errors
    await expect(page.getByText(/email é obrigatório/i)).toBeVisible();
    await expect(page.getByText(/senha é obrigatória/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill invalid email format
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/senha/i).fill('password123');

    // Try to submit
    await page.getByRole('button', { name: /entrar/i }).click();

    // Verify email validation error
    await expect(page.getByText(/email inválido/i)).toBeVisible();
  });
});

test.describe('Authentication - Logout Flow', () => {
  test('should logout successfully', async ({ page }) => {
    // Navigate to dashboard (assuming user is logged in)
    await page.goto('/dashboard');

    // Click logout button/menu
    await page.getByRole('button', { name: /sair/i }).click();

    // Verify redirect to login page
    await expect(page.url()).toMatch(/\/login/);

    // Verify login form is visible
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
  });
});
