import { expect, test } from '@playwright/test'

test.describe('Clinic Authentication Flows @clinic @auth', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test.describe('Professional Authentication @professional', () => {
    test('should login professional with valid credentials @desktop', async ({ page }) => {
      await page.goto('/auth/login')

      // Fill professional login form
      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.click('button[type="submit"]')

      // Should redirect to professional dashboard
      await page.waitForURL('/dashboard/professional')
      await expect(page).toHaveURL('/dashboard/professional')
      await expect(page.locator('text=Professional Dashboard')).toBeVisible()
      await expect(page.locator("text=Today's Schedule")).toBeVisible()
      await expect(page.locator('text=Revenue Analytics')).toBeVisible()
    })

    test('should show professional dashboard features @desktop', async ({ page }) => {
      // Login first
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.click('button[type="submit"]')

      await page.waitForURL('/dashboard/professional')

      // Check professional-specific features
      await expect(page.locator('text=Patient Queue')).toBeVisible()
      await expect(page.locator('text=Treatment Planning')).toBeVisible()
      await expect(page.locator('text=Business Analytics')).toBeVisible()
      await expect(page.locator('text=Staff Management')).toBeVisible()
      await expect(page.locator('text=Inventory Management')).toBeVisible()
    })

    test('should handle appointment management @desktop', async ({ page }) => {
      // Login as professional
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.click('button[type="submit"]')

      await page.waitForURL('/dashboard/professional')

      // Navigate to appointments
      await page.click('text=Appointments')

      // Check appointment management features
      await expect(page.locator("text=Today's Appointments")).toBeVisible()
      await expect(page.locator('text=Calendar View')).toBeVisible()
      await expect(page.locator('text=No-Show Risk Assessment')).toBeVisible()
      await expect(page.locator('text=WhatsApp Integration')).toBeVisible()
    })

    test('should validate professional input @desktop', async ({ page }) => {
      await page.goto('/auth/login')

      // Submit empty form
      await page.click('button[type="submit"]')

      await expect(page.locator('text=Email is required')).toBeVisible()
      await expect(page.locator('text=Password is required')).toBeVisible()

      // Fill invalid email
      await page.fill('input[type="email"]', 'invalid-email')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')

      await expect(page.locator('text=Invalid email format')).toBeVisible()
    })
  })

  test.describe('Client Authentication @client', () => {
    test('should login client with valid credentials @mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })

      await page.goto('/auth/login')

      // Fill client login form
      await page.fill('input[type="email"]', 'client@example.com')
      await page.fill('input[type="password"]', 'clientPassword123!')
      await page.click('button[type="submit"]')

      // Should redirect to client dashboard
      await page.waitForURL('/dashboard/client')
      await expect(page).toHaveURL('/dashboard/client')
      await expect(page.locator('text=Client Portal')).toBeVisible()
      await expect(page.locator('text=My Appointments')).toBeVisible()
      await expect(page.locator('text=Treatment History')).toBeVisible()
    })

    test('should show client dashboard features @mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })

      // Login first
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'client@example.com')
      await page.fill('input[type="password"]', 'clientPassword123!')
      await page.click('button[type="submit"]')

      await page.waitForURL('/dashboard/client')

      // Check client-specific features
      await expect(page.locator('text=Book New Appointment')).toBeVisible()
      await expect(page.locator('text=Progress Photos')).toBeVisible()
      await expect(page.locator('text=Treatment Plan')).toBeVisible()
      await expect(page.locator('text=WhatsApp Notifications')).toBeVisible()
      await expect(page.locator('text=Billing Information')).toBeVisible()
    })

    test('should handle client registration @desktop', async ({ page }) => {
      await page.goto('/auth/register')

      // Fill registration form
      await page.fill('input[name="fullName"]', 'John Doe')
      await page.fill('input[name="email"]', 'newclient@example.com')
      await page.fill('input[name="phone"]', '+55 11 9999-8888')
      await page.fill('input[name="password"]', 'SecurePassword123!')
      await page.fill('input[name="confirmPassword"]', 'SecurePassword123!')

      // Check LGPD consent
      await page.check('input[name="lgpdConsent"]')
      await page.check('input[name="treatmentConsent"]')
      await page.check('input[name="marketingConsent"]')

      await page.click('button[type="submit"]')

      // Should show success message
      await expect(page.locator('text=Registration Successful')).toBeVisible()
    })

    test('should validate client registration @mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })

      await page.goto('/auth/register')

      // Submit empty form
      await page.click('button[type="submit"]')

      await expect(page.locator('text=Full name is required')).toBeVisible()
      await expect(page.locator('text=Email is required')).toBeVisible()
      await expect(page.locator('text=Phone is required')).toBeVisible()
      await expect(page.locator('text=Password is required')).toBeVisible()

      // Check LGPD consent validation
      await page.fill('input[name="fullName"]', 'John Doe')
      await page.fill('input[name="email"]', 'john@example.com')
      await page.fill('input[name="phone"]', '+55 11 9999-8888')
      await page.fill('input[name="password"]', 'Password123!')
      await page.fill('input[name="confirmPassword"]', 'Password123!')

      await page.click('button[type="submit"]')

      await expect(page.locator('text=LGPD consent is required')).toBeVisible()
    })
  })

  test.describe('Session Management @auth', () => {
    test('should handle logout @desktop', async ({ page }) => {
      // Login first
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.click('button[type="submit"]')

      await page.waitForURL('/dashboard/professional')

      // Logout
      await page.click('text=Logout')

      // Should redirect to login page
      await expect(page).toHaveURL('/auth/login')
      await expect(page.locator('text=Login')).toBeVisible()
    })

    test('should handle session timeout @desktop', async ({ page }) => {
      // Login first
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.click('button[type="submit"]')

      await page.waitForURL('/dashboard/professional')

      // Simulate session timeout by clearing localStorage
      await page.evaluate(() => {
        localStorage.clear()
      })

      // Reload page
      await page.reload()

      // Should redirect to login
      await expect(page).toHaveURL('/auth/login')
    })

    test('should handle remember me functionality @desktop', async ({ page }) => {
      await page.goto('/auth/login')

      // Fill form with remember me checked
      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.check('input[name="rememberMe"]')
      await page.click('button[type="submit"]')

      await page.waitForURL('/dashboard/professional')

      // Check if session is persisted
      const rememberMeValue = await page.evaluate(() => {
        return localStorage.getItem('rememberMe')
      })

      expect(rememberMeValue).toBe('true')
    })
  })

  test.describe('Error Handling @auth', () => {
    test('should handle invalid credentials @desktop', async ({ page }) => {
      await page.goto('/auth/login')

      // Fill with invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      // Should show error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible()
    })

    test('should handle network errors @desktop', async ({ page }) => {
      await page.goto('/auth/login')

      // Simulate network error
      await page.route('**/api/auth/login', (route) => route.abort())

      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.click('button[type="submit"]')

      // Should show network error message
      await expect(page.locator('text=Network error')).toBeVisible()
    })

    test('should handle server errors @desktop', async ({ page }) => {
      await page.goto('/auth/login')

      // Simulate server error
      await page.route('**/api/auth/login', (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        }))

      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.click('button[type="submit"]')

      // Should show server error message
      await expect(page.locator('text=Server error')).toBeVisible()
    })
  })

  test.describe('Password Reset @auth', () => {
    test('should show password reset form @desktop', async ({ page }) => {
      await page.goto('/auth/login')

      await page.click('text=Forgot Password?')

      await expect(page).toHaveURL('/auth/forgot-password')
      await expect(page.locator('text=Reset Password')).toBeVisible()
      await expect(page.locator('text=Enter your email address')).toBeVisible()
    })

    test('should handle password reset request @desktop', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.click('button[type="submit"]')

      // Should show success message
      await expect(page.locator('text=Password reset email sent')).toBeVisible()
    })

    test('should validate password reset form @desktop', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      // Submit empty form
      await page.click('button[type="submit"]')

      await expect(page.locator('text=Email is required')).toBeVisible()

      // Fill invalid email
      await page.fill('input[type="email"]', 'invalid-email')
      await page.click('button[type="submit"]')

      await expect(page.locator('text=Invalid email format')).toBeVisible()
    })
  })

  test.describe('Role-based Navigation @auth', () => {
    test('should redirect professional to correct dashboard @desktop', async ({ page }) => {
      await page.goto('/auth/login')

      await page.fill('input[type="email"]', 'professional@clinic.com')
      await page.fill('input[type="password"]', 'securePassword123!')
      await page.click('button[type="submit"]')

      await page.waitForURL('/dashboard/professional')

      // Should not have access to client features
      await expect(page.locator('text=Client Portal')).not.toBeVisible()
    })

    test('should redirect client to correct dashboard @mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })

      await page.goto('/auth/login')

      await page.fill('input[type="email"]', 'client@example.com')
      await page.fill('input[type="password"]', 'clientPassword123!')
      await page.click('button[type="submit"]')

      await page.waitForURL('/dashboard/client')

      // Should not have access to professional features
      await expect(page.locator('text=Professional Dashboard')).not.toBeVisible()
    })
  })
})
