import { test, expect } from '@playwright/test';

test.describe('Aesthetic Platform Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Landing Page', () => {
    test('should display aesthetic clinic platform branding', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.locator('h1')).toContainText('NeonPro Aesthetic Clinic Platform');
      await expect(page.locator('text=Modern aesthetic clinic management platform')).toBeVisible();
      await expect(page.locator('text=WhatsApp integration')).toBeVisible();
      await expect(page.locator('text=anti-no-show engine')).toBeVisible();
    });

    test('should be mobile responsive', async ({ page }) => {
      await page.goto('/');
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=NeonPro Aesthetic Clinic Platform')).toBeVisible();
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('h1')).toBeVisible();
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should navigate to login page', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Login');
      
      await expect(page).toHaveURL('/auth/login');
      await expect(page.locator('h1')).toContainText('Login');
    });

    test('should navigate to registration page', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Register');
      
      await expect(page).toHaveURL('/auth/register');
      await expect(page.locator('h1')).toContainText('Register');
    });

    test('should show LGPD consent during registration', async ({ page }) => {
      await page.goto('/auth/register');
      
      await expect(page.locator('text=LGPD')).toBeVisible();
      await expect(page.locator('text=Consent')).toBeVisible();
      await expect(page.locator('text=Data Processing')).toBeVisible();
    });
  });

  test.describe('Client Management Flow', () => {
    test('should access client dashboard after login', async ({ page }) => {
      // Navigate to login
      await page.goto('/auth/login');
      
      // Fill with client credentials
      await page.fill('input[type="email"]', 'client@example.com');
      await page.fill('input[type="password"]', 'clientpassword123');
      await page.click('button[type="submit"]');
      
      // Should redirect to client dashboard
      await page.waitForURL('/dashboard');
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=Client Dashboard')).toBeVisible();
    });

    test('should display client appointment history', async ({ page }) => {
      // Login as client
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'client@example.com');
      await page.fill('input[type="password"]', 'clientpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      
      // Check for appointment history section
      await expect(page.locator('text=Appointment History')).toBeVisible();
      await expect(page.locator('text=Aesthetic Treatment History')).toBeVisible();
    });
  });

  test.describe('Professional Dashboard Flow', () => {
    test('should access professional dashboard', async ({ page }) => {
      // Login as professional
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'professional@example.com');
      await page.fill('input[type="password"]', 'professionalpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      await expect(page.locator('text=Professional Dashboard')).toBeVisible();
      await expect(page.locator('text=Today\'s Schedule')).toBeVisible();
      await expect(page.locator('text=Client Management')).toBeVisible();
    });

    test('should show business analytics', async ({ page }) => {
      // Login as professional
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'professional@example.com');
      await page.fill('input[type="password"]', 'professionalpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      
      // Check for business metrics
      await expect(page.locator('text=Revenue Metrics')).toBeVisible();
      await expect(page.locator('text=Appointment Analytics')).toBeVisible();
      await expect(page.locator('text=Client Satisfaction')).toBeVisible();
    });
  });

  test.describe('Appointment Scheduling Flow', () => {
    test('should show appointment booking interface', async ({ page }) => {
      // Login as client
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'client@example.com');
      await page.fill('input[type="password']', 'clientpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      
      // Navigate to appointment scheduling
      await page.click('text=Book Appointment');
      
      await expect(page.locator('text=Select Procedure')).toBeVisible();
      await expect(page.locator('text=Available Time Slots')).toBeVisible();
      await expect(page.locator('text=AI Optimization')).toBeVisible();
    });

    test('should show WhatsApp integration', async ({ page }) => {
      // Login as client
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'client@example.com');
      await page.fill('input[type="password"]', 'clientpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      
      // Check for WhatsApp integration indicators
      await expect(page.locator('text=WhatsApp')).toBeVisible();
      await expect(page.locator('text=Confirmation')).toBeVisible();
    });
  });

  test.describe('Anti-No-Show Engine Flow', () => {
    test('should display risk assessment', async ({ page }) => {
      // Login as professional
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'professional@example.com');
      await page.fill('input[type="password']', 'professionalpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      
      // Navigate to appointments
      await page.click('text=Appointments');
      
      // Check for risk assessment features
      await expect(page.locator('text=Risk Assessment')).toBeVisible();
      await expect(page.locator('text=No-Show Prediction')).toBeVisible();
      await expect(page.locator('text=Communication Strategy')).toBeVisible();
    });

    test('should show WhatsApp-first communication', async ({ page }) => {
      // Login as professional
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'professional@example.com');
      await page.fill('input[type="password"]', 'professionalpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      
      // Check for WhatsApp communication features
      await expect(page.locator('text=WhatsApp Reminders')).toBeVisible();
      await expect(page.locator('text=Automated Messages')).toBeVisible();
    });
  });

  test.describe('Aesthetic Treatment Planning', () => {
    test('should show treatment planning interface', async ({ page }) => {
      // Login as professional
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'professional@example.com');
      await page.fill('input[type="password"]', 'professionalpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      
      // Navigate to treatment planning
      await page.click('text=Treatment Planning');
      
      await expect(page.locator('text=Aesthetic Assessment')).toBeVisible();
      await expect(page.locator('text=Treatment Options')).toBeVisible();
      await expect(page.locator('text=Goal Alignment')).toBeVisible();
    });

    test('should include before/after photo management', async ({ page }) => {
      // Login as professional
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'professional@example.com');
      await page.fill('input[type="password"]', 'professionalpassword123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/dashboard');
      
      // Navigate to treatment planning
      await page.click('text=Treatment Planning');
      
      // Check for photo management features
      await expect(page.locator('text=Progress Photos')).toBeVisible();
      await expect(page.locator('text=LGPD Compliance')).toBeVisible();
    });
  });

  test.describe('LGPD Compliance Flow', () => {
    test('should show consent management', async ({ page }) => {
      await page.goto('/');
      
      // Check for LGPD compliance indicators
      await expect(page.locator('text=LGPD')).toBeVisible();
      await expect(page.locator('text=Data Protection')).toBeVisible();
    });

    test('should handle consent during client registration', async ({ page }) => {
      await page.goto('/auth/register');
      
      // Check for granular consent options
      await expect(page.locator('text=Treatment Consent')).toBeVisible();
      await expect(page.locator('text=Marketing Consent')).toBeVisible();
      await expect(page.locator('text=Photo Consent')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      await expect(page.locator('text=404')).toBeVisible();
      await expect(page.locator('text=Page Not Found')).toBeVisible();
    });

    test('should handle network errors', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Network Error')).toBeVisible();
    });

    test('should handle form validation errors', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Submit empty form
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });
  });

  test.describe('Navigation Flow', () => {
    test('should navigate between main sections', async ({ page }) => {
      await page.goto('/');
      
      // Test navigation to different sections
      await page.click('text=Login');
      await expect(page).toHaveURL('/auth/login');
      
      await page.click('text=Register');
      await expect(page).toHaveURL('/auth/register');
      
      await page.goto('/');
      await page.click('text=Dashboard');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should maintain consistent branding', async ({ page }) => {
      const pages = ['/', '/auth/login', '/auth/register', '/dashboard'];
      
      for (const url of pages) {
        await page.goto(url);
        await expect(page.locator('text=NeonPro')).toBeVisible();
        await expect(page.locator('text=Aesthetic Clinic')).toBeVisible();
      }
    });
  });
});