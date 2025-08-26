import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Healthcare E2E Testing Utilities for NeonPro
// LGPD, ANVISA, and CFM compliance testing helpers

export class HealthcareTestUtils {
  constructor(private readonly page: Page) {}

  // LGPD Compliance Utilities
  async validateLGPDConsent(patientId: string) {
    await this.page.goto(`/patients/${patientId}`);

    // Check consent status
    const consentElement = this.page.locator(
      '[data-testid="lgpd-consent-status"]',
    );
    await expect(consentElement).toBeVisible();

    const consentStatus = await consentElement.textContent();
    expect(consentStatus).toContain('Granted');

    // Validate consent date
    const consentDate = this.page.locator('[data-testid="consent-date"]');
    await expect(consentDate).toBeVisible();
  }

  async testDataSubjectRights(patientId: string) {
    await this.page.goto(`/patients/${patientId}/data-rights`);

    // Test data access request
    await expect(
      this.page.locator('[data-testid="data-access-request"]'),
    ).toBeVisible();

    // Test data rectification
    await expect(
      this.page.locator('[data-testid="data-rectification"]'),
    ).toBeVisible();

    // Test data deletion
    await expect(
      this.page.locator('[data-testid="data-deletion"]'),
    ).toBeVisible();

    // Test data portability
    await expect(
      this.page.locator('[data-testid="data-portability"]'),
    ).toBeVisible();
  }

  // ANVISA Compliance Utilities
  async validateDeviceRegistration(deviceId: string) {
    await this.page.goto(`/devices/${deviceId}`);

    // Check ANVISA registration status
    const registrationElement = this.page.locator(
      '[data-testid="anvisa-registration"]',
    );
    await expect(registrationElement).toBeVisible();

    // Validate registration number format
    const registrationNumber = await registrationElement.textContent();
    expect(registrationNumber).toMatch(/^[A-Z]{3}-\d{6}-\d{4}$/);
  }

  async testAdverseEventReporting() {
    await this.page.goto('/compliance/adverse-events');

    // Test adverse event form
    await this.page.click('[data-testid="new-adverse-event"]');
    await expect(
      this.page.locator('[data-testid="adverse-event-form"]'),
    ).toBeVisible();

    // Fill required fields
    await this.page.fill(
      '[data-testid="event-description"]',
      'Test adverse event',
    );
    await this.page.select('[data-testid="severity-level"]', 'moderate');
    await this.page.fill('[data-testid="device-involved"]', 'Device-001');

    // Submit and validate
    await this.page.click('[data-testid="submit-event"]');
    await expect(
      this.page.locator('[data-testid="submission-success"]'),
    ).toBeVisible();
  }

  // CFM Compliance Utilities
  async validateProfessionalLicense(professionalId: string) {
    await this.page.goto(`/professionals/${professionalId}`);

    // Check CFM license status
    const licenseElement = this.page.locator('[data-testid="cfm-license"]');
    await expect(licenseElement).toBeVisible();

    // Validate license format (CRM format)
    const licenseNumber = await licenseElement.textContent();
    expect(licenseNumber).toMatch(/^CRM\/[A-Z]{2}\s\d{4,6}$/);
  }

  async testDigitalSignature() {
    await this.page.goto('/prescriptions/new');

    // Test digital signature component
    await expect(
      this.page.locator('[data-testid="digital-signature-pad"]'),
    ).toBeVisible();

    // Test signature validation
    await this.page.click('[data-testid="validate-signature"]');
    await expect(
      this.page.locator('[data-testid="signature-status"]'),
    ).toBeVisible();
  }

  async testElectronicPrescription() {
    await this.page.goto('/prescriptions');

    // Create new prescription
    await this.page.click('[data-testid="new-prescription"]');

    // Fill prescription details
    await this.page.fill('[data-testid="patient-cpf"]', '123.456.789-00');
    await this.page.fill('[data-testid="medication"]', 'Test Medication');
    await this.page.fill('[data-testid="dosage"]', '1 tablet daily');

    // Test CFM validation
    await this.page.click('[data-testid="cfm-validate"]');
    await expect(
      this.page.locator('[data-testid="cfm-validation-success"]'),
    ).toBeVisible();
  }

  // Audit Trail Utilities
  async validateAuditTrail(action: string, userId: string) {
    await this.page.goto('/audit-logs');

    // Filter by action and user
    await this.page.fill('[data-testid="action-filter"]', action);
    await this.page.fill('[data-testid="user-filter"]', userId);
    await this.page.click('[data-testid="apply-filters"]');

    // Validate audit entry exists
    const auditEntry = this.page.locator('[data-testid="audit-entry"]').first();
    await expect(auditEntry).toBeVisible();

    // Validate audit details
    await expect(
      auditEntry.locator('[data-testid="audit-action"]'),
    ).toContainText(action);
    await expect(
      auditEntry.locator('[data-testid="audit-user"]'),
    ).toContainText(userId);
    await expect(
      auditEntry.locator('[data-testid="audit-timestamp"]'),
    ).toBeVisible();
  }

  // General Healthcare Testing Utilities
  async loginAsHealthcareProfessional(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');

    // Wait for dashboard and validate professional status
    await this.page.waitForURL('/dashboard');
    await expect(
      this.page.locator('[data-testid="professional-status"]'),
    ).toBeVisible();
  }

  async validateHealthcareData(
    dataType: 'patient' | 'device' | 'professional',
    id: string,
  ) {
    switch (dataType) {
      case 'patient': {
        await this.validateLGPDConsent(id);
        break;
      }
      case 'device': {
        await this.validateDeviceRegistration(id);
        break;
      }
      case 'professional': {
        await this.validateProfessionalLicense(id);
        break;
      }
    }
  }

  async generateComplianceReport(reportType: 'lgpd' | 'anvisa' | 'cfm') {
    await this.page.goto(`/compliance/reports/${reportType}`);

    // Generate report
    await this.page.click('[data-testid="generate-report"]');

    // Wait for report generation
    await this.page.waitForSelector('[data-testid="report-ready"]');

    // Validate report content
    await expect(
      this.page.locator('[data-testid="report-summary"]'),
    ).toBeVisible();
    await expect(
      this.page.locator('[data-testid="compliance-score"]'),
    ).toBeVisible();
  }
}
