import { test, expect } from '@playwright/test';

// Dashboard Compliance E2E Tests
// Tests compliance monitoring, ANVISA reporting, LGPD compliance, and audit trails

test.describe('Dashboard Compliance Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to compliance dashboard
    await page.goto('/dashboard/compliance');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Compliance Overview', () => {
    test('should display compliance dashboard with key metrics', async ({ page }) => {
      // Check page title and navigation
      await expect(page).toHaveTitle(/Compliance.*NeonPro/);
      await expect(page.locator('h1')).toContainText('Compliance Dashboard');
      
      // Verify compliance metrics cards
      await expect(page.locator('[data-testid="compliance-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="anvisa-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="lgpd-compliance"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-alerts"]')).toBeVisible();
      
      // Check compliance score display
      const complianceScore = page.locator('[data-testid="compliance-score-value"]');
      await expect(complianceScore).toBeVisible();
      await expect(complianceScore).toContainText(/%/);
    });

    test('should show compliance status indicators', async ({ page }) => {
      // ANVISA compliance status
      const anvisaStatus = page.locator('[data-testid="anvisa-status-indicator"]');
      await expect(anvisaStatus).toBeVisible();
      
      // LGPD compliance status
      const lgpdStatus = page.locator('[data-testid="lgpd-status-indicator"]');
      await expect(lgpdStatus).toBeVisible();
      
      // Professional licenses status
      const licensesStatus = page.locator('[data-testid="licenses-status-indicator"]');
      await expect(licensesStatus).toBeVisible();
      
      // Data security status
      const securityStatus = page.locator('[data-testid="security-status-indicator"]');
      await expect(securityStatus).toBeVisible();
    });

    test('should display recent compliance alerts', async ({ page }) => {
      const alertsSection = page.locator('[data-testid="compliance-alerts"]');
      await expect(alertsSection).toBeVisible();
      
      // Check for alert items
      const alertItems = page.locator('[data-testid="alert-item"]');
      if (await alertItems.count() > 0) {
        await expect(alertItems.first()).toBeVisible();
        await expect(alertItems.first().locator('[data-testid="alert-severity"]')).toBeVisible();
        await expect(alertItems.first().locator('[data-testid="alert-message"]')).toBeVisible();
        await expect(alertItems.first().locator('[data-testid="alert-timestamp"]')).toBeVisible();
      }
    });
  });

  test.describe('ANVISA Compliance', () => {
    test('should display ANVISA reporting section', async ({ page }) => {
      const anvisaSection = page.locator('[data-testid="anvisa-section"]');
      await expect(anvisaSection).toBeVisible();
      
      // Check ANVISA registration status
      await expect(page.locator('[data-testid="anvisa-registration"]')).toBeVisible();
      
      // Check adverse events reporting
      await expect(page.locator('[data-testid="adverse-events-section"]')).toBeVisible();
      
      // Check equipment compliance
      await expect(page.locator('[data-testid="equipment-compliance"]')).toBeVisible();
    });

    test('should handle adverse events reporting', async ({ page }) => {
      // Navigate to adverse events
      await page.click('[data-testid="adverse-events-tab"]');
      
      // Check adverse events list
      const eventsTable = page.locator('[data-testid="adverse-events-table"]');
      await expect(eventsTable).toBeVisible();
      
      // Test new adverse event reporting
      await page.click('[data-testid="report-adverse-event"]');
      
      // Fill adverse event form
      await page.fill('[data-testid="patient-id-input"]', '12345678901');
      await page.selectOption('[data-testid="event-severity"]', 'moderate');
      await page.fill('[data-testid="event-description"]', 'Test adverse event description');
      await page.selectOption('[data-testid="event-category"]', 'allergic_reaction');
      
      // Submit form
      await page.click('[data-testid="submit-adverse-event"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Adverse event reported successfully');
    });

    test('should validate ANVISA equipment compliance', async ({ page }) => {
      // Navigate to equipment compliance
      await page.click('[data-testid="equipment-compliance-tab"]');
      
      // Check equipment list
      const equipmentTable = page.locator('[data-testid="equipment-table"]');
      await expect(equipmentTable).toBeVisible();
      
      // Check compliance status for each equipment
      const equipmentRows = page.locator('[data-testid="equipment-row"]');
      if (await equipmentRows.count() > 0) {
        const firstRow = equipmentRows.first();
        await expect(firstRow.locator('[data-testid="equipment-name"]')).toBeVisible();
        await expect(firstRow.locator('[data-testid="anvisa-registration"]')).toBeVisible();
        await expect(firstRow.locator('[data-testid="compliance-status"]')).toBeVisible();
        await expect(firstRow.locator('[data-testid="last-inspection"]')).toBeVisible();
      }
    });
  });

  test.describe('LGPD Compliance', () => {
    test('should display LGPD compliance dashboard', async ({ page }) => {
      // Navigate to LGPD section
      await page.click('[data-testid="lgpd-tab"]');
      
      // Check LGPD metrics
      await expect(page.locator('[data-testid="data-processing-activities"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-subject-requests"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-retention-status"]')).toBeVisible();
    });

    test('should handle data subject requests', async ({ page }) => {
      await page.click('[data-testid="lgpd-tab"]');
      
      // Check data subject requests section
      const requestsSection = page.locator('[data-testid="data-subject-requests-section"]');
      await expect(requestsSection).toBeVisible();
      
      // Test new data request
      await page.click('[data-testid="new-data-request"]');
      
      // Fill request form
      await page.fill('[data-testid="requester-cpf"]', '12345678901');
      await page.selectOption('[data-testid="request-type"]', 'data_access');
      await page.fill('[data-testid="request-description"]', 'Request for personal data access');
      
      // Submit request
      await page.click('[data-testid="submit-data-request"]');
      
      // Verify request created
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Data subject request created');
    });

    test('should manage consent tracking', async ({ page }) => {
      await page.click('[data-testid="lgpd-tab"]');
      
      // Navigate to consent management
      await page.click('[data-testid="consent-management-tab"]');
      
      // Check consent overview
      const consentTable = page.locator('[data-testid="consent-table"]');
      await expect(consentTable).toBeVisible();
      
      // Check consent statistics
      await expect(page.locator('[data-testid="active-consents"]')).toBeVisible();
      await expect(page.locator('[data-testid="expired-consents"]')).toBeVisible();
      await expect(page.locator('[data-testid="withdrawn-consents"]')).toBeVisible();
      
      // Test consent filtering
      await page.selectOption('[data-testid="consent-status-filter"]', 'active');
      await page.waitForTimeout(1000); // Wait for filter to apply
      
      // Verify filtered results
      const filteredRows = page.locator('[data-testid="consent-row"]');
      if (await filteredRows.count() > 0) {
        await expect(filteredRows.first().locator('[data-testid="consent-status"]')).toContainText('Active');
      }
    });
  });

  test.describe('Audit Trail', () => {
    test('should display comprehensive audit trail', async ({ page }) => {
      // Navigate to audit trail
      await page.click('[data-testid="audit-trail-tab"]');
      
      // Check audit trail table
      const auditTable = page.locator('[data-testid="audit-trail-table"]');
      await expect(auditTable).toBeVisible();
      
      // Check audit entry columns
      await expect(page.locator('[data-testid="audit-timestamp-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-user-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-action-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-resource-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-details-header"]')).toBeVisible();
    });

    test('should filter audit trail by date range', async ({ page }) => {
      await page.click('[data-testid="audit-trail-tab"]');
      
      // Set date range filter
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      await page.fill('[data-testid="audit-start-date"]', lastWeek.toISOString().split('T')[0]);
      await page.fill('[data-testid="audit-end-date"]', today.toISOString().split('T')[0]);
      
      // Apply filter
      await page.click('[data-testid="apply-audit-filter"]');
      
      // Wait for results
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const auditEntries = page.locator('[data-testid="audit-entry"]');
      if (await auditEntries.count() > 0) {
        await expect(auditEntries.first()).toBeVisible();
      }
    });

    test('should filter audit trail by user and action', async ({ page }) => {
      await page.click('[data-testid="audit-trail-tab"]');
      
      // Filter by action type
      await page.selectOption('[data-testid="audit-action-filter"]', 'patient_access');
      
      // Filter by user (if available)
      const userFilter = page.locator('[data-testid="audit-user-filter"]');
      if (await userFilter.isVisible()) {
        await userFilter.selectOption({ index: 1 }); // Select first available user
      }
      
      // Apply filters
      await page.click('[data-testid="apply-audit-filter"]');
      
      // Wait for results
      await page.waitForTimeout(1000);
      
      // Verify filtered results show correct action type
      const auditEntries = page.locator('[data-testid="audit-entry"]');
      if (await auditEntries.count() > 0) {
        await expect(auditEntries.first().locator('[data-testid="audit-action"]')).toContainText('patient_access');
      }
    });

    test('should export audit trail report', async ({ page }) => {
      await page.click('[data-testid="audit-trail-tab"]');
      
      // Test export functionality
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-audit-trail"]');
      
      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/audit.*\.(csv|xlsx|pdf)$/);
    });
  });

  test.describe('Professional Licenses', () => {
    test('should display professional licenses overview', async ({ page }) => {
      // Navigate to licenses section
      await page.click('[data-testid="licenses-tab"]');
      
      // Check licenses table
      const licensesTable = page.locator('[data-testid="licenses-table"]');
      await expect(licensesTable).toBeVisible();
      
      // Check license status indicators
      await expect(page.locator('[data-testid="active-licenses-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="expiring-licenses-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="expired-licenses-count"]')).toBeVisible();
    });

    test('should handle license renewal alerts', async ({ page }) => {
      await page.click('[data-testid="licenses-tab"]');
      
      // Check for expiring licenses
      const expiringLicenses = page.locator('[data-testid="expiring-license"]');
      if (await expiringLicenses.count() > 0) {
        // Click on first expiring license
        await expiringLicenses.first().click();
        
        // Check renewal options
        await expect(page.locator('[data-testid="renewal-options"]')).toBeVisible();
        await expect(page.locator('[data-testid="renewal-deadline"]')).toBeVisible();
        await expect(page.locator('[data-testid="renewal-requirements"]')).toBeVisible();
      }
    });

    test('should validate CFM registration numbers', async ({ page }) => {
      await page.click('[data-testid="licenses-tab"]');
      
      // Test adding new license
      await page.click('[data-testid="add-license"]');
      
      // Fill license form
      await page.fill('[data-testid="professional-name"]', 'Dr. Test Professional');
      await page.fill('[data-testid="cfm-number"]', '12345/SP');
      await page.selectOption('[data-testid="license-type"]', 'dermatologist');
      
      // Test CFM validation
      await page.blur('[data-testid="cfm-number"]');
      
      // Should show validation status
      await expect(page.locator('[data-testid="cfm-validation-status"]')).toBeVisible();
    });
  });

  test.describe('Compliance Reports', () => {
    test('should generate compliance reports', async ({ page }) => {
      // Navigate to reports section
      await page.click('[data-testid="compliance-reports-tab"]');
      
      // Check available report types
      await expect(page.locator('[data-testid="anvisa-report-option"]')).toBeVisible();
      await expect(page.locator('[data-testid="lgpd-report-option"]')).toBeVisible();
      await expect(page.locator('[data-testid="audit-report-option"]')).toBeVisible();
      await expect(page.locator('[data-testid="licenses-report-option"]')).toBeVisible();
    });

    test('should generate ANVISA compliance report', async ({ page }) => {
      await page.click('[data-testid="compliance-reports-tab"]');
      
      // Select ANVISA report
      await page.click('[data-testid="anvisa-report-option"]');
      
      // Configure report parameters
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      await page.fill('[data-testid="report-start-date"]', startDate.toISOString().split('T')[0]);
      await page.fill('[data-testid="report-end-date"]', new Date().toISOString().split('T')[0]);
      
      // Generate report
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="generate-report"]');
      
      // Verify download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/anvisa.*report.*\.(pdf|xlsx)$/);
    });

    test('should schedule automated compliance reports', async ({ page }) => {
      await page.click('[data-testid="compliance-reports-tab"]');
      
      // Navigate to scheduled reports
      await page.click('[data-testid="scheduled-reports-tab"]');
      
      // Create new scheduled report
      await page.click('[data-testid="create-scheduled-report"]');
      
      // Configure schedule
      await page.fill('[data-testid="report-name"]', 'Monthly ANVISA Compliance Report');
      await page.selectOption('[data-testid="report-type"]', 'anvisa_compliance');
      await page.selectOption('[data-testid="report-frequency"]', 'monthly');
      await page.fill('[data-testid="recipient-emails"]', 'compliance@neonpro.com');
      
      // Save schedule
      await page.click('[data-testid="save-schedule"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Scheduled report created');
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load compliance dashboard within performance thresholds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/dashboard/compliance');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check for performance metrics
      const performanceEntries = await page.evaluate(() => {
        return JSON.stringify(performance.getEntriesByType('navigation'));
      });
      
      expect(performanceEntries).toBeDefined();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation through compliance sections
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate to main sections
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels for compliance data', async ({ page }) => {
      // Check ARIA labels on compliance metrics
      await expect(page.locator('[data-testid="compliance-score"][aria-label]')).toBeVisible();
      await expect(page.locator('[data-testid="anvisa-status"][aria-label]')).toBeVisible();
      await expect(page.locator('[data-testid="lgpd-compliance"][aria-label]')).toBeVisible();
      
      // Check table accessibility
      const tables = page.locator('table');
      if (await tables.count() > 0) {
        await expect(tables.first()).toHaveAttribute('role', 'table');
      }
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that compliance cards stack properly
      const complianceCards = page.locator('[data-testid="compliance-card"]');
      if (await complianceCards.count() > 0) {
        const firstCard = complianceCards.first();
        const cardBox = await firstCard.boundingBox();
        expect(cardBox?.width).toBeLessThan(400); // Should fit mobile width
      }
      
      // Check mobile navigation
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }
    });

    test('should support screen readers', async ({ page }) => {
      // Check for screen reader announcements
      const announcements = page.locator('[aria-live="polite"], [aria-live="assertive"]');
      if (await announcements.count() > 0) {
        await expect(announcements.first()).toBeVisible();
      }
      
      // Check for descriptive headings
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      if (await headings.count() > 0) {
        await expect(headings.first()).toBeVisible();
      }
    });
  });
});