import { expect, test } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('h1')).toContainText('Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/login')

    // Submit empty form
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'invalidpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login')

    // Use test credentials (in a real app, these would be set up in test database)
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForURL('/dashboard')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should remember user session', async ({ page }) => {
    await page.goto('/login')

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForURL('/dashboard')

    // Reload page
    await page.reload()

    // Should still be logged in
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should logout successfully', async ({ page }) => {
    await page.goto('/login')

    // Login first
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForURL('/dashboard')

    // Logout
    await page.click('button:text("Logout")')

    // Should be redirected to login page
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Login')
  })

  test('should protect protected routes', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL('/login')

    // Should show login form
    await expect(page.locator('h1')).toContainText('Login')
  })

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/login')

    // Click forgot password link
    await page.click('text=Forgot Password?')

    // Should show password reset form
    await expect(page).toHaveURL('/forgot-password')
    await expect(page.locator('h1')).toContainText('Reset Password')

    // Enter email
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    // Should show success message
    await expect(page.locator('text=Check your email')).toBeVisible()
  })

  test('should enforce password requirements', async ({ page }) => {
    await page.goto('/register')

    // Try to register with weak password
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'weak')
    await page.fill('input[name="confirmPassword"]', 'weak')
    await page.click('button[type="submit"]')

    // Should show password requirements error
    await expect(
      page.locator('text=Password must be at least 8 characters'),
    ).toBeVisible()
  })

  test('should handle registration flow', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('input[name="name"]', 'New User')
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'StrongPassword123!')
    await page.fill('input[name="confirmPassword"]', 'StrongPassword123!')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or verification page
    await expect(page).toHaveURL(/\/dashboard|\/verify-email/)
  })
})
