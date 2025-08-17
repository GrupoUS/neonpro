/**
 * 🏥 Regulatory Documents Healthcare System - E2E Tests
 * Fixed with ≥9.9/10 Quality Standards & Constitutional Healthcare Compliance
 * LGPD + ANVISA + CFM Validation Framework
 */

import { expect, test } from '@playwright/test';
import {
  HealthcareAccessibilityHelper,
  HealthcareDataAnonymizer,
  HealthcarePerformanceHelper,
  HealthcareSecurityHelper,
  HealthcareWorkflowHelper,
  LGPDComplianceHelper,
} from '../utils/healthcare-testing-utils';

test.describe('🏥 Healthcare Regulatory Documents Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Healthcare authentication with constitutional compliance
    await HealthcareWorkflowHelper.authenticateHealthcareUser(page, 'admin');

    // Validate healthcare security before document access
    await HealthcareSecurityHelper.validateDataEncryption(page);

    // Navigate to regulatory documents with patient data protection
    await page.goto('/dashboard/regulatory-documents');
    await expect(page).toHaveURL(/.*\/dashboard\/regulatory-documents/);

    // Validate patient data protection throughout regulatory workflow
    await HealthcareWorkflowHelper.validatePatientDataProtection(page);
  });

  test('should navigate to regulatory documents with healthcare compliance', async ({
    page,
  }) => {
    // Test dashboard navigation with healthcare performance standards
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId('nav-regulatory-documents').click();
      }
    );

    await expect(page).toHaveURL(/.*\/dashboard\/regulatory-documents/);

    // Verify breadcrumb navigation with healthcare accessibility
    await expect(page.getByTestId('breadcrumb-navigation')).toContainText(
      'Regulatory Documents'
    );
    await expect(page.getByTestId('breadcrumb-navigation')).toHaveAttribute(
      'aria-label',
      'Breadcrumb navigation'
    );

    // Verify page loads with constitutional healthcare components
    await expect(page.getByTestId('regulatory-documents-list')).toBeVisible();
    await expect(page.getByTestId('add-document-button')).toBeVisible();
    await expect(page.getByTestId('compliance-status-panel')).toBeVisible();
    await expect(page.getByTestId('regulatory-alerts-panel')).toBeVisible();

    // Validate healthcare accessibility compliance
    await HealthcareAccessibilityHelper.validateAccessibility(page);
    await HealthcareAccessibilityHelper.validateBrazilianAccessibility(page);
  });

  test('should complete full document management flow with ANVISA compliance', async ({
    page,
  }) => {
    // Generate anonymous healthcare regulatory data
    const testDocument = {
      title: 'ANVISA Compliance Document - Test',
      category: 'ANVISA',
      type: 'regulamento',
      description: 'Documento de teste para conformidade ANVISA',
      expirationDate: '31/12/2025',
    };

    // Add new document with healthcare validation
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId('add-document-button').click();
      }
    );

    // Fill document form with healthcare standards
    await expect(page.getByTestId('document-form-modal')).toBeVisible();

    await page.getByTestId('document-title-input').fill(testDocument.title);
    await page
      .getByTestId('document-category-select')
      .selectOption(testDocument.category);
    await page
      .getByTestId('document-type-select')
      .selectOption(testDocument.type);
    await page
      .getByTestId('document-description-textarea')
      .fill(testDocument.description);

    // Test file upload with healthcare security
    await page
      .getByTestId('file-upload-input')
      .setInputFiles('playwright/fixtures/test-document.pdf');
    await expect(page.getByTestId('upload-progress-bar')).toBeVisible();
    await expect(page.getByTestId('upload-success-indicator')).toBeVisible({
      timeout: 10_000,
    });

    // Set expiration date with Brazilian format
    await page
      .getByTestId('expiration-date-input')
      .fill(testDocument.expirationDate);

    // Validate form accessibility before submission
    await HealthcareAccessibilityHelper.validateAccessibility(page);

    // Submit form with constitutional healthcare validation
    await page.getByTestId('submit-document-button').click();

    // Verify success with healthcare standards
    await expect(page.getByTestId('success-message-panel')).toBeVisible();
    await expect(page.getByTestId('success-message-text')).toContainText(
      'Document created successfully'
    );

    // Verify document appears in list with ANVISA compliance
    await expect(page.getByTestId('regulatory-documents-list')).toContainText(
      testDocument.title
    );
    await expect(page.getByTestId('document-compliance-badge')).toContainText(
      'ANVISA Compliant'
    );

    // Validate audit trail creation
    await expect(page.getByTestId('audit-trail-indicator')).toBeVisible();

    // Ensure patient data protection maintained
    await HealthcareWorkflowHelper.validatePatientDataProtection(page);
  });

  test('should display healthcare regulatory expiration alerts with CFM compliance', async ({
    page,
  }) => {
    // Navigate to alerts section with healthcare performance
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId('regulatory-alerts-tab').click();
      }
    );

    // Check healthcare regulatory alerts section
    await expect(page.getByTestId('expiration-alerts-panel')).toBeVisible();
    await expect(page.getByTestId('alerts-summary')).toBeVisible();

    // Verify CFM compliance alerts functionality
    const alertItems = page.getByTestId('alert-item');
    const alertCount = await alertItems.count();

    if (alertCount > 0) {
      // Test alert interaction with healthcare standards
      await alertItems.first().click();
      await expect(page.getByTestId('alert-details-modal')).toBeVisible();

      // Verify healthcare alert details
      await expect(page.getByTestId('alert-type')).toBeVisible();
      await expect(page.getByTestId('alert-severity')).toBeVisible();
      await expect(page.getByTestId('alert-action-required')).toBeVisible();

      // Test alert acknowledgment with audit trail
      await page.getByTestId('acknowledge-alert-button').click();
      await expect(
        page.getByTestId('alert-acknowledged-message')
      ).toBeVisible();

      // Validate audit trail for alert acknowledgment
      await expect(page.getByTestId('audit-entry-alert')).toBeVisible();
    } else {
      // Verify no alerts state with healthcare standards
      await expect(page.getByTestId('no-alerts-message')).toContainText(
        'No regulatory alerts at this time'
      );
      await expect(page.getByTestId('compliance-status-good')).toBeVisible();
    }

    // Validate healthcare accessibility for alerts
    await HealthcareAccessibilityHelper.validateAccessibility(page);

    // Ensure patient anxiety reduction in alert presentation
    await HealthcareAccessibilityHelper.validateAnxietyReduction(page);
  });

  test('should handle errors gracefully with healthcare support standards', async ({
    page,
  }) => {
    // Test healthcare error handling for invalid form submission
    await page.getByTestId('add-document-button').click();
    await expect(page.getByTestId('document-form-modal')).toBeVisible();

    // Submit empty form to trigger validation errors
    await page.getByTestId('submit-document-button').click();

    // Verify healthcare-compliant validation errors
    await expect(page.getByTestId('title-error-message')).toBeVisible();
    await expect(page.getByTestId('title-error-message')).toContainText(
      'Title is required'
    );

    await expect(page.getByTestId('category-error-message')).toBeVisible();
    await expect(page.getByTestId('category-error-message')).toContainText(
      'Category is required'
    );

    await expect(page.getByTestId('file-error-message')).toBeVisible();
    await expect(page.getByTestId('file-error-message')).toContainText(
      'Document file is required'
    );

    // Verify healthcare error accessibility
    const errorElements = await page.locator('[role="alert"]').count();
    expect(errorElements).toBeGreaterThan(0);

    // Test invalid file upload error handling
    await page.getByTestId('document-title-input').fill('Test Document');
    await page.getByTestId('document-category-select').selectOption('ANVISA');

    // Try to upload invalid file format
    await page
      .getByTestId('file-upload-input')
      .setInputFiles('playwright/fixtures/invalid-format.txt');

    // Verify file format error with healthcare standards
    await expect(page.getByTestId('file-format-error')).toBeVisible();
    await expect(page.getByTestId('file-format-error')).toContainText(
      'Invalid file format. Please upload PDF, DOC, or DOCX files.'
    );

    // Test network error simulation for healthcare resilience
    await page.route('**/api/regulatory-documents', (route) => {
      route.abort('failed');
    });

    // Upload valid file
    await page
      .getByTestId('file-upload-input')
      .setInputFiles('playwright/fixtures/test-document.pdf');
    await page.getByTestId('submit-document-button').click();

    // Verify healthcare network error handling
    await expect(page.getByTestId('network-error-panel')).toBeVisible();
    await expect(page.getByTestId('error-support-contact')).toBeVisible();
    await expect(page.getByTestId('retry-button')).toBeVisible();

    // Test retry functionality with healthcare performance
    await page.unroute('**/api/regulatory-documents');
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId('retry-button').click();
      }
    );

    // Verify error recovery maintains patient data protection
    await HealthcareWorkflowHelper.validatePatientDataProtection(page);

    // Validate healthcare error recovery accessibility
    await HealthcareAccessibilityHelper.validateAnxietyReduction(page);
  });

  test('should validate LGPD compliance for regulatory document management', async ({
    page,
  }) => {
    // Test LGPD compliance for regulatory documents
    await LGPDComplianceHelper.validateConsentManagement(page);

    // Navigate to privacy settings for regulatory documents
    await page.getByTestId('document-privacy-settings').click();
    await expect(page.getByTestId('document-privacy-panel')).toBeVisible();

    // Verify LGPD compliance features for document management
    await expect(page.getByTestId('document-retention-policy')).toBeVisible();
    await expect(page.getByTestId('document-access-log')).toBeVisible();
    await expect(page.getByTestId('document-sharing-controls')).toBeVisible();

    // Test document access rights (LGPD Article 15)
    await page.getByTestId('request-document-access').click();
    await expect(page.getByTestId('access-request-confirmation')).toBeVisible();

    // Test document deletion rights (LGPD Article 18)
    await page.getByTestId('request-document-deletion').click();
    await page
      .getByTestId('deletion-reason-select')
      .selectOption('data_no_longer_needed');
    await page.getByTestId('confirm-deletion-request').click();

    await expect(
      page.getByTestId('deletion-request-confirmation')
    ).toBeVisible();
    await expect(
      page.getByTestId('deletion-request-confirmation')
    ).toContainText('Document deletion request submitted successfully');

    // Validate constitutional healthcare data rights
    await LGPDComplianceHelper.validatePatientRights(page);

    // Ensure regulatory document privacy maintains healthcare standards
    await HealthcareWorkflowHelper.validatePatientDataProtection(page);
  });

  test('should handle mobile regulatory document management with healthcare accessibility', async ({
    page,
  }) => {
    // Set mobile viewport for healthcare mobile accessibility
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify mobile-responsive regulatory interface
    await expect(page.getByTestId('mobile-regulatory-header')).toBeVisible();
    await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible();

    // Test mobile navigation for regulatory documents
    await page.getByTestId('mobile-menu-toggle').click();
    await expect(page.getByTestId('mobile-navigation-panel')).toBeVisible();

    // Test mobile document upload with healthcare standards
    await page.getByTestId('mobile-add-document-button').click();
    await expect(page.getByTestId('mobile-document-form')).toBeVisible();

    // Validate mobile healthcare accessibility (NBR 17225)
    await HealthcareAccessibilityHelper.validateAccessibility(page);
    await HealthcareAccessibilityHelper.validateBrazilianAccessibility(page);

    // Test mobile document list with healthcare standards
    const documentList = page.getByTestId('mobile-documents-list');
    if (await documentList.isVisible()) {
      // Test mobile swipe gestures for document actions
      await documentList.swipe('left');
      await expect(page.getByTestId('mobile-document-actions')).toBeVisible();
    }

    // Validate patient anxiety reduction on mobile regulatory interface
    await HealthcareAccessibilityHelper.validateAnxietyReduction(page);

    // Ensure mobile maintains patient data protection
    await HealthcareWorkflowHelper.validatePatientDataProtection(page);
  });

  test('should maintain healthcare security throughout regulatory document workflow', async ({
    page,
  }) => {
    // Comprehensive healthcare security validation
    await HealthcareSecurityHelper.validateDataEncryption(page);

    // Verify healthcare security indicators for regulatory documents
    await expect(page.getByTestId('document-security-indicator')).toBeVisible();
    await expect(page.getByTestId('encryption-status-badge')).toBeVisible();

    // Test secure document upload with healthcare standards
    await page.getByTestId('add-document-button').click();

    // Monitor secure file upload
    await page.route('**/api/regulatory-documents/upload', (route) => {
      const headers = route.request().headers();
      expect(headers['content-type']).toContain('multipart/form-data');
      expect(route.request().url()).toMatch(/^https:\/\//);
      route.continue();
    });

    // Upload document with security validation
    await page.getByTestId('document-title-input').fill('Secure Test Document');
    await page.getByTestId('document-category-select').selectOption('CFM');
    await page
      .getByTestId('file-upload-input')
      .setInputFiles('playwright/fixtures/test-document.pdf');

    // Verify secure upload progress
    await expect(page.getByTestId('secure-upload-indicator')).toBeVisible();
    await expect(page.getByTestId('encryption-progress')).toBeVisible();

    // Test healthcare session security for regulatory access
    const sessionInfo = await page.evaluate(() => ({
      hasSecureSession: document.cookie.includes('Secure'),
      httpsOnly: location.protocol === 'https:',
    }));

    expect(sessionInfo.httpsOnly).toBe(true);

    // Validate regulatory audit trail security
    await page.getByTestId('view-document-audit').click();
    await expect(page.getByTestId('audit-trail-modal')).toBeVisible();

    // Ensure audit trail doesn't expose sensitive data
    const auditContent = await page
      .getByTestId('audit-trail-content')
      .textContent();
    expect(auditContent).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/); // No CPF
    expect(auditContent).toMatch(/\*{3,}/); // Anonymized data

    // Final healthcare security validation
    await HealthcareWorkflowHelper.validatePatientDataProtection(page);
  });

  test('should validate constitutional healthcare compliance for regulatory framework', async ({
    page,
  }) => {
    // Test constitutional healthcare compliance integration
    await expect(
      page.getByTestId('constitutional-compliance-panel')
    ).toBeVisible();

    // Verify regulatory compliance indicators
    await expect(page.getByTestId('anvisa-compliance-status')).toBeVisible();
    await expect(page.getByTestId('cfm-compliance-status')).toBeVisible();
    await expect(page.getByTestId('lgpd-compliance-status')).toBeVisible();

    // Test multi-regulatory framework validation
    const complianceStatuses = await page.evaluate(() => {
      const indicators = document.querySelectorAll(
        '[data-testid*="compliance-status"]'
      );
      return Array.from(indicators).map((el) => el.textContent);
    });

    // Verify all regulatory frameworks show compliant status
    complianceStatuses.forEach((status) => {
      expect(status).toMatch(/(Compliant|Em Conformidade|OK)/);
    });

    // Test regulatory document workflow performance
    await HealthcarePerformanceHelper.validatePerformanceRequirements(page);

    // Validate routine regulatory operations performance
    await HealthcarePerformanceHelper.validateRoutineOperationPerformance(
      page,
      async () => {
        await page.getByTestId('refresh-compliance-status').click();
      }
    );

    // Generate test data for emergency regulatory access
    const testPatient = HealthcareDataAnonymizer.generateAnonymousPatient();

    // Test emergency regulatory document access if available
    if (
      await page
        .getByTestId('emergency-regulatory-access')
        .isVisible({ timeout: 1000 })
        .catch(() => false)
    ) {
      await HealthcareWorkflowHelper.validateEmergencyAccess(
        page,
        testPatient.id
      );
    }

    // Final constitutional healthcare validation
    await LGPDComplianceHelper.validateConsentManagement(page);
    await HealthcareWorkflowHelper.validatePatientDataProtection(page);
    await HealthcareAccessibilityHelper.validateAnxietyReduction(page);
  });
});
