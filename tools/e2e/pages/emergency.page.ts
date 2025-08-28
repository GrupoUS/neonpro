/**
 * Emergency Page Object Model
 * Handles emergency department workflows and critical patient care scenarios
 */

import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export interface TriageFormData {
  patientId: string;
  chiefComplaint: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
  };
  painLevel: string;
  allergies: string;
  currentMedications: string;
}

export class EmergencyPage extends BasePage {
  // Critical patient data elements
  readonly patientAllergies: Locator;
  readonly currentMedications: Locator;
  readonly vitalSigns: Locator;
  readonly prescriptionHistory: Locator;

  // Diagnostic imaging elements
  readonly xrayImage: Locator;
  readonly ctScanImage: Locator;
  readonly mriImage: Locator;
  readonly diagnosticViewer: Locator;

  // Triage form elements
  readonly triageForm: Locator;
  readonly patientIdInput: Locator;
  readonly chiefComplaintInput: Locator;
  readonly bloodPressureInput: Locator;
  readonly heartRateInput: Locator;
  readonly temperatureInput: Locator;
  readonly oxygenSaturationInput: Locator;
  readonly painLevelSlider: Locator;
  readonly allergiesInput: Locator;
  readonly medicationsInput: Locator;
  readonly submitTriageButton: Locator;
  readonly submissionConfirmation: Locator;

  // Emergency alerts and notifications
  readonly criticalAlerts: Locator;
  readonly drugInteractionWarnings: Locator;
  readonly allergyAlerts: Locator;

  // Audit and compliance
  readonly auditTrail: Locator;
  readonly accessLog: Locator;

  constructor(page: Page) {
    super(page);

    // Critical patient data selectors
    this.patientAllergies = page.locator('[data-testid="patient-allergies"]');
    this.currentMedications = page.locator(
      '[data-testid="current-medications"]',
    );
    this.vitalSigns = page.locator('[data-testid="vital-signs"]');
    this.prescriptionHistory = page.locator(
      '[data-testid="prescription-history"]',
    );

    // Diagnostic imaging selectors
    this.xrayImage = page.locator('[data-testid="xray-image"]');
    this.ctScanImage = page.locator('[data-testid="ct-scan-image"]');
    this.mriImage = page.locator('[data-testid="mri-image"]');
    this.diagnosticViewer = page.locator('[data-testid="diagnostic-viewer"]');

    // Triage form selectors
    this.triageForm = page.locator('[data-testid="triage-form"]');
    this.patientIdInput = page.locator('[data-testid="patient-id-input"]');
    this.chiefComplaintInput = page.locator(
      '[data-testid="chief-complaint-input"]',
    );
    this.bloodPressureInput = page.locator(
      '[data-testid="blood-pressure-input"]',
    );
    this.heartRateInput = page.locator('[data-testid="heart-rate-input"]');
    this.temperatureInput = page.locator('[data-testid="temperature-input"]');
    this.oxygenSaturationInput = page.locator(
      '[data-testid="oxygen-saturation-input"]',
    );
    this.painLevelSlider = page.locator('[data-testid="pain-level-slider"]');
    this.allergiesInput = page.locator('[data-testid="allergies-input"]');
    this.medicationsInput = page.locator('[data-testid="medications-input"]');
    this.submitTriageButton = page.locator(
      '[data-testid="submit-triage-button"]',
    );
    this.submissionConfirmation = page.locator(
      '[data-testid="submission-confirmation"]',
    );

    // Alert selectors
    this.criticalAlerts = page.locator('[data-testid="critical-alerts"]');
    this.drugInteractionWarnings = page.locator(
      '[data-testid="drug-interaction-warnings"]',
    );
    this.allergyAlerts = page.locator('[data-testid="allergy-alerts"]');

    // Audit selectors
    this.auditTrail = page.locator('[data-testid="audit-trail"]');
    this.accessLog = page.locator('[data-testid="access-log"]');
  }

  /**
   * Load critical patient data for emergency scenarios
   * @param patientId - Emergency patient identifier
   */
  async loadCriticalPatientData(patientId: string): Promise<void> {
    await this.page.waitForLoadState("networkidle");

    // Trigger critical data load
    await this.page.evaluate((id) => {
      window.dispatchEvent(
        new CustomEvent("load-critical-patient-data", {
          detail: { patientId: id },
        }),
      );
    }, patientId);

    // Wait for critical data to be visible
    await Promise.all([
      this.patientAllergies.waitFor({ state: "visible" }),
      this.currentMedications.waitFor({ state: "visible" }),
      this.vitalSigns.waitFor({ state: "visible" }),
    ]);
  }

  /**
   * Load prescription history for drug interaction checking
   */
  async loadPrescriptionHistory(): Promise<void> {
    await this.page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("load-prescription-history"));
    });

    await this.prescriptionHistory.waitFor({ state: "visible" });
  }

  /**
   * Load diagnostic images for emergency assessment
   * @param patientId - Patient identifier
   * @param imageTypes - Types of images to load (xray, ct-scan, mri)
   */
  async loadDiagnosticImages(
    patientId: string,
    imageTypes: string[],
  ): Promise<void> {
    await this.page.evaluate(
      (data) => {
        window.dispatchEvent(
          new CustomEvent("load-diagnostic-images", {
            detail: { patientId: data.patientId, imageTypes: data.imageTypes },
          }),
        );
      },
      { patientId, imageTypes },
    );

    // Wait for requested images to load
    const imagePromises = imageTypes.map((type) => {
      switch (type) {
        case "xray":
          return this.xrayImage.waitFor({ state: "visible" });
        case "ct-scan":
          return this.ctScanImage.waitFor({ state: "visible" });
        case "mri":
          return this.mriImage.waitFor({ state: "visible" });
        default:
          return Promise.resolve();
      }
    });

    await Promise.all(imagePromises);
  }

  /**
   * Fill emergency triage form with patient data
   * @param formData - Triage form data
   */
  async fillTriageForm(formData: TriageFormData): Promise<void> {
    await this.triageForm.waitFor({ state: "visible" });

    // Fill patient identification
    await this.patientIdInput.fill(formData.patientId);
    await this.chiefComplaintInput.fill(formData.chiefComplaint);

    // Fill vital signs
    await this.bloodPressureInput.fill(formData.vitalSigns.bloodPressure);
    await this.heartRateInput.fill(formData.vitalSigns.heartRate);
    await this.temperatureInput.fill(formData.vitalSigns.temperature);
    await this.oxygenSaturationInput.fill(formData.vitalSigns.oxygenSaturation);

    // Set pain level using slider
    await this.painLevelSlider.fill(formData.painLevel);

    // Fill medical history
    await this.allergiesInput.fill(formData.allergies);
    await this.medicationsInput.fill(formData.currentMedications);
  }

  /**
   * Submit emergency triage form
   */
  async submitTriageForm(): Promise<void> {
    await this.submitTriageButton.click();
    await this.submissionConfirmation.waitFor({ state: "visible" });
  }

  /**
   * Verify audit trail is properly recorded
   */
  async verifyAuditTrail(): Promise<void> {
    await this.page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("verify-audit-trail"));
    });

    await this.auditTrail.waitFor({ state: "visible" });
  }

  /**
   * Check for critical alerts and warnings
   */
  async checkCriticalAlerts(): Promise<{
    hasCriticalAlerts: boolean;
    hasDrugInteractions: boolean;
    hasAllergyAlerts: boolean;
  }> {
    const hasCriticalAlerts = await this.criticalAlerts.isVisible();
    const hasDrugInteractions = await this.drugInteractionWarnings.isVisible();
    const hasAllergyAlerts = await this.allergyAlerts.isVisible();

    return {
      hasCriticalAlerts,
      hasDrugInteractions,
      hasAllergyAlerts,
    };
  }

  /**
   * Navigate to emergency department section
   * @param section - Emergency section (triage, trauma, resuscitation)
   */
  async navigateToEmergencySection(section: string): Promise<void> {
    await this.page.goto(`/emergency/${section}`);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Perform emergency patient search
   * @param searchTerm - Patient name, ID, or medical record number
   */
  async searchEmergencyPatients(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator(
      '[data-testid="emergency-patient-search"]',
    );
    await searchInput.fill(searchTerm);
    await searchInput.press("Enter");

    // Wait for search results
    await this.page
      .locator('[data-testid="emergency-search-results"]')
      .waitFor({ state: "visible" });
  }

  /**
   * Access patient emergency record
   * @param patientId - Emergency patient identifier
   */
  async accessEmergencyRecord(patientId: string): Promise<void> {
    await this.page.click(`[data-testid="emergency-record-${patientId}"]`);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Update patient status in emergency department
   * @param patientId - Patient identifier
   * @param status - New status (waiting, in-treatment, discharged, admitted)
   */
  async updatePatientStatus(patientId: string, status: string): Promise<void> {
    const statusDropdown = this.page.locator(
      `[data-testid="patient-status-${patientId}"]`,
    );
    await statusDropdown.selectOption(status);

    // Confirm status update
    await this.page.click('[data-testid="confirm-status-update"]');
    await this.page
      .locator('[data-testid="status-update-confirmation"]')
      .waitFor({ state: "visible" });
  }

  /**
   * Initiate emergency protocol
   * @param protocolType - Type of emergency protocol (code-blue, trauma-alert, stroke-alert)
   */
  async initiateEmergencyProtocol(protocolType: string): Promise<void> {
    await this.page.click(`[data-testid="emergency-protocol-${protocolType}"]`);

    // Confirm protocol activation
    await this.page.click('[data-testid="confirm-protocol-activation"]');

    // Wait for protocol confirmation
    await this.page
      .locator('[data-testid="protocol-activation-confirmation"]')
      .waitFor({ state: "visible" });
  }

  /**
   * Document emergency intervention
   * @param intervention - Intervention details
   */
  async documentIntervention(intervention: {
    type: string;
    description: string;
    provider: string;
    timestamp: string;
  }): Promise<void> {
    const interventionForm = this.page.locator(
      '[data-testid="intervention-form"]',
    );

    await interventionForm
      .locator('[data-testid="intervention-type"]')
      .selectOption(intervention.type);
    await interventionForm
      .locator('[data-testid="intervention-description"]')
      .fill(intervention.description);
    await interventionForm
      .locator('[data-testid="intervention-provider"]')
      .fill(intervention.provider);

    await this.page.click('[data-testid="save-intervention"]');
    await this.page
      .locator('[data-testid="intervention-saved-confirmation"]')
      .waitFor({ state: "visible" });
  }
}
