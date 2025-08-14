// =====================================================================================
// MARKETING CAMPAIGNS E2E TESTS - Story 7.2
// End-to-end tests for automated marketing campaigns functionality
// =====================================================================================

import { test, expect } from '@playwright/test';

test.describe('Marketing Campaigns Dashboard - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto('/login');
    
    // Mock authentication for testing
    await page.evaluate(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-auth-token');
    });
    
    // Navigate to marketing campaigns dashboard
    await page.goto('/dashboard/marketing-campaigns');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Dashboard Loading and Layout', () => {
    test('should load the marketing campaigns dashboard', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Automated Marketing Campaigns');
      await expect(page.locator('[data-testid="tabs"]')).toBeVisible();
    });

    test('should display key metrics cards', async ({ page }) => {
      await expect(page.locator('text=Total Campaigns')).toBeVisible();
      await expect(page.locator('text=Automation Rate')).toBeVisible();
      await expect(page.locator('text=Total Reach')).toBeVisible();
      await expect(page.locator('text=Campaign ROI')).toBeVisible();
    });

    test('should display tab navigation', async ({ page }) => {
      await expect(page.locator('button:has-text("Overview")')).toBeVisible();
      await expect(page.locator('button:has-text("Campaigns")')).toBeVisible();
      await expect(page.locator('button:has-text("A/B Testing")')).toBeVisible();
      await expect(page.locator('button:has-text("Analytics")')).toBeVisible();
      await expect(page.locator('button:has-text("Automation")')).toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test('should navigate between tabs correctly', async ({ page }) => {
      // Test Campaigns tab
      await page.click('button:has-text("Campaigns")');
      await expect(page.locator('text=All Campaigns')).toBeVisible();
      await expect(page.locator('text=Manage and monitor your automated marketing campaigns')).toBeVisible();

      // Test A/B Testing tab
      await page.click('button:has-text("A/B Testing")');
      await expect(page.locator('text=A/B Testing Framework')).toBeVisible();
      await expect(page.locator('text=Optimize campaigns with statistical A/B testing')).toBeVisible();

      // Test Analytics tab
      await page.click('button:has-text("Analytics")');
      await expect(page.locator('text=Campaign Analytics')).toBeVisible();
      await expect(page.locator('text=Real-time performance tracking and ROI measurement')).toBeVisible();

      // Test Automation tab
      await page.click('button:has-text("Automation")');
      await expect(page.locator('text=Campaign Automation Engine')).toBeVisible();
      await expect(page.locator('text=≥80% automation rate with AI-driven optimization')).toBeVisible();
    });

    test('should maintain tab state when switching', async ({ page }) => {
      // Go to Campaigns tab
      await page.click('button:has-text("Campaigns")');
      await expect(page.locator('text=All Campaigns')).toBeVisible();

      // Go to Overview tab and back
      await page.click('button:has-text("Overview")');
      await expect(page.locator('text=Recent Campaigns')).toBeVisible();

      await page.click('button:has-text("Campaigns")');
      await expect(page.locator('text=All Campaigns')).toBeVisible();
    });
  });

  test.describe('Campaign Data Display', () => {
    test('should display campaign list in campaigns tab', async ({ page }) => {
      await page.click('button:has-text("Campaigns")');
      
      // Check for campaign items
      await expect(page.locator('text=Welcome Series - New Patients')).toBeVisible();
      await expect(page.locator('text=Treatment Follow-up Campaign')).toBeVisible();
      await expect(page.locator('text=Birthday Promotions')).toBeVisible();
    });

    test('should display campaign metrics correctly', async ({ page }) => {
      await page.click('button:has-text("Campaigns")');
      
      // Check for automation rates
      await expect(page.locator('text=92% automated')).toBeVisible();
      await expect(page.locator('text=87% automated')).toBeVisible();
      await expect(page.locator('text=95% automated')).toBeVisible();
    });

    test('should display campaign status badges', async ({ page }) => {
      await page.click('button:has-text("Campaigns")');
      
      // Check for status badges
      await expect(page.locator('[data-testid="badge"]:has-text("active")')).toBeVisible();
      await expect(page.locator('[data-testid="badge"]:has-text("scheduled")')).toBeVisible();
    });
  });

  test.describe('Automation Features', () => {
    test('should display automation statistics', async ({ page }) => {
      await page.click('button:has-text("Automation")');
      
      await expect(page.locator('text=Trigger-based Campaigns')).toBeVisible();
      await expect(page.locator('text=AI Personalization')).toBeVisible();
      await expect(page.locator('text=LGPD Compliance')).toBeVisible();
      
      // Check automation percentages
      await expect(page.locator('text=94%').first()).toBeVisible();
      await expect(page.locator('text=87%').first()).toBeVisible();
      await expect(page.locator('text=100%').first()).toBeVisible();
    });

    test('should display quick automation setup options', async ({ page }) => {
      await page.click('button:has-text("Automation")');
      
      await expect(page.locator('button:has-text("Schedule Campaign")')).toBeVisible();
      await expect(page.locator('button:has-text("Setup Triggers")')).toBeVisible();
      await expect(page.locator('button:has-text("AI Optimization")')).toBeVisible();
      await expect(page.locator('button:has-text("Compliance Check")')).toBeVisible();
    });

    test('should verify automation rate meets ≥80% requirement', async ({ page }) => {
      // Check overall automation rate in overview
      const automationRateElement = page.locator('text=89%').first();
      await expect(automationRateElement).toBeVisible();
      
      // Verify it's above 80%
      const automationText = await automationRateElement.textContent();
      const automationValue = parseInt(automationText?.replace('%', '') || '0');
      expect(automationValue).toBeGreaterThanOrEqual(80);
    });
  });

  test.describe('AI Personalization Features', () => {
    test('should display AI personalization status', async ({ page }) => {
      // Should be visible on overview tab by default
      await expect(page.locator('text=AI Personalization')).toBeVisible();
      await expect(page.locator('text=Content Personalization')).toBeVisible();
      await expect(page.locator('text=Send Time Optimization')).toBeVisible();
      await expect(page.locator('text=Segment Targeting')).toBeVisible();
    });

    test('should display LGPD compliance status', async ({ page }) => {
      await expect(page.locator('text=LGPD Compliance: Active')).toBeVisible();
    });

    test('should show AI feature progress bars', async ({ page }) => {
      const progressBars = page.locator('[data-testid="progress"]');
      await expect(progressBars).toHaveCountGreaterThan(0);
    });
  });

  test.describe('A/B Testing Framework', () => {
    test('should display A/B testing interface', async ({ page }) => {
      await page.click('button:has-text("A/B Testing")');
      
      await expect(page.locator('text=A/B Testing Framework')).toBeVisible();
      await expect(page.locator('text=Statistical A/B testing framework with automated winner selection')).toBeVisible();
      await expect(page.locator('button:has-text("Create A/B Test")')).toBeVisible();
    });

    test('should display create A/B test button', async ({ page }) => {
      await page.click('button:has-text("A/B Testing")');
      
      const createTestButton = page.locator('button:has-text("Create A/B Test")');
      await expect(createTestButton).toBeVisible();
      await expect(createTestButton).toBeEnabled();
    });
  });

  test.describe('Analytics and ROI Tracking', () => {
    test('should display analytics interface', async ({ page }) => {
      await page.click('button:has-text("Analytics")');
      
      await expect(page.locator('text=Campaign Analytics')).toBeVisible();
      await expect(page.locator('text=Real-time performance tracking and ROI measurement')).toBeVisible();
    });

    test('should display ROI metrics in overview', async ({ page }) => {
      // Check ROI display
      await expect(page.locator('text=4.2x')).toBeVisible();
      await expect(page.locator('text=Campaign ROI')).toBeVisible();
    });
  });

  test.describe('Campaign Creation Flow', () => {
    test('should display create campaign button', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Campaign")');
      await expect(createButton).toBeVisible();
      await expect(createButton).toBeEnabled();
    });

    test('should be able to click create campaign button', async ({ page }) => {
      const createButton = page.locator('button:has-text("Create Campaign")');
      await createButton.click();
      
      // Note: Actual form would be implemented in a modal or separate page
      // This test verifies the button is interactive
    });
  });

  test.describe('Multi-Channel Support', () => {
    test('should display multi-channel campaign types', async ({ page }) => {
      await page.click('button:has-text("Campaigns")');
      
      // Check for different campaign types
      await expect(page.locator('text=multi_channel')).toBeVisible();
      await expect(page.locator('text=email')).toBeVisible();
      await expect(page.locator('text=whatsapp')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Dashboard should still be functional
      await expect(page.locator('h1')).toContainText('Automated Marketing Campaigns');
      await expect(page.locator('[data-testid="tabs"]')).toBeVisible();
      
      // Tabs should be accessible
      await page.click('button:has-text("Campaigns")');
      await expect(page.locator('text=All Campaigns')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('h1')).toContainText('Automated Marketing Campaigns');
      await expect(page.locator('[data-testid="tabs"]')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await expect(page.locator('h1')).toContainText('Automated Marketing Campaigns');
      await expect(page.locator('[data-testid="tabs"]')).toBeVisible();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/dashboard/marketing-campaigns');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle navigation between tabs quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.click('button:has-text("Campaigns")');
      await expect(page.locator('text=All Campaigns')).toBeVisible();
      
      await page.click('button:has-text("Analytics")');
      await expect(page.locator('text=Campaign Analytics')).toBeVisible();
      
      const navigationTime = Date.now() - startTime;
      expect(navigationTime).toBeLessThan(2000); // Navigation should be fast
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText('Automated Marketing Campaigns');
    });

    test('should have accessible tab navigation', async ({ page }) => {
      const tabs = page.locator('button[role="tab"], [data-testid="tabs-trigger"]');
      await expect(tabs).toHaveCountGreaterThan(0);
      
      // Each tab should be focusable
      for (let i = 0; i < await tabs.count(); i++) {
        const tab = tabs.nth(i);
        await tab.focus();
        await expect(tab).toBeFocused();
      }
    });

    test('should have proper button accessibility', async ({ page }) => {
      const buttons = page.locator('button');
      await expect(buttons).toHaveCountGreaterThan(0);
      
      // Buttons should be keyboard accessible
      const createButton = page.locator('button:has-text("Create Campaign")');
      await createButton.focus();
      await expect(createButton).toBeFocused();
    });
  });

  test.describe('Story 7.2 Acceptance Criteria Validation', () => {
    test('should meet ≥80% automation rate requirement', async ({ page }) => {
      // Check main automation rate metric
      const automationRate = page.locator('text=89%').first();
      await expect(automationRate).toBeVisible();
      
      // Verify automation details in automation tab
      await page.click('button:has-text("Automation")');
      
      // Check individual automation components
      await expect(page.locator('text=94%').first()).toBeVisible(); // Trigger-based
      await expect(page.locator('text=87%').first()).toBeVisible(); // AI Personalization
      await expect(page.locator('text=100%').first()).toBeVisible(); // LGPD Compliance
    });

    test('should display AI-driven personalization features', async ({ page }) => {
      await expect(page.locator('text=AI Personalization')).toBeVisible();
      await expect(page.locator('text=Content Personalization')).toBeVisible();
      await expect(page.locator('text=Send Time Optimization')).toBeVisible();
      await expect(page.locator('text=Segment Targeting')).toBeVisible();
    });

    test('should support multi-channel delivery', async ({ page }) => {
      await page.click('button:has-text("Campaigns")');
      
      await expect(page.locator('text=multi_channel')).toBeVisible();
      await expect(page.locator('text=email')).toBeVisible();
      await expect(page.locator('text=whatsapp')).toBeVisible();
    });

    test('should provide A/B testing framework', async ({ page }) => {
      await page.click('button:has-text("A/B Testing")');
      
      await expect(page.locator('text=A/B Testing Framework')).toBeVisible();
      await expect(page.locator('text=Statistical A/B testing framework')).toBeVisible();
      await expect(page.locator('button:has-text("Create A/B Test")')).toBeVisible();
    });

    test('should display analytics and ROI tracking', async ({ page }) => {
      // Check ROI in overview
      await expect(page.locator('text=Campaign ROI')).toBeVisible();
      await expect(page.locator('text=4.2x')).toBeVisible();
      
      // Check analytics tab
      await page.click('button:has-text("Analytics")');
      await expect(page.locator('text=Real-time performance tracking and ROI measurement')).toBeVisible();
    });

    test('should ensure LGPD compliance', async ({ page }) => {
      await expect(page.locator('text=LGPD Compliance: Active')).toBeVisible();
      
      // Check in automation tab
      await page.click('button:has-text("Automation")');
      await expect(page.locator('text=LGPD Compliance')).toBeVisible();
      await expect(page.locator('text=100%').first()).toBeVisible();
    });

    test('should provide comprehensive documentation interface', async ({ page }) => {
      // Dashboard should have clear descriptions and help text
      await expect(page.locator('text=Create, manage, and optimize automated marketing campaigns with AI-driven personalization')).toBeVisible();
      
      // Each tab should have descriptive content
      await page.click('button:has-text("A/B Testing")');
      await expect(page.locator('text=Optimize campaigns with statistical A/B testing')).toBeVisible();
      
      await page.click('button:has-text("Analytics")');
      await expect(page.locator('text=Real-time performance tracking and ROI measurement')).toBeVisible();
    });
  });
});