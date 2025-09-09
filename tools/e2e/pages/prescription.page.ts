/**
 * Prescription Page Object Model
 * Handles prescription management, drug interactions, and medication safety workflows
 */

import { Locator, Page, } from '@playwright/test'
import { BasePage, } from './base.page'

export interface PrescriptionFormData {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  prescriberId?: string
  patientId?: string
}

export interface DrugInteractionResult {
  hasInteractions: boolean
  interactions: {
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
    drugs: string[]
    description: string
    recommendation: string
  }[]
}

export class PrescriptionPage extends BasePage {
  // Prescription management elements
  readonly prescriptionForm: Locator
  readonly medicationInput: Locator
  readonly dosageInput: Locator
  readonly frequencySelect: Locator
  readonly durationInput: Locator
  readonly instructionsTextarea: Locator
  readonly prescriberSelect: Locator
  readonly submitPrescriptionButton: Locator
  readonly prescriptionConfirmation: Locator

  // Prescription history elements
  readonly prescriptionHistory: Locator
  readonly activePrescritions: Locator
  readonly pastPrescriptions: Locator
  readonly prescriptionSearch: Locator
  readonly prescriptionFilters: Locator

  // Drug interaction elements
  readonly interactionChecker: Locator
  readonly interactionWarnings: Locator
  readonly majorInteractionAlert: Locator
  readonly moderateInteractionWarning: Locator
  readonly minorInteractionInfo: Locator
  readonly contraindicationAlert: Locator

  // Medication database elements
  readonly medicationSearch: Locator
  readonly medicationSuggestions: Locator
  readonly drugInformation: Locator
  readonly dosageGuidelines: Locator
  readonly allergyWarnings: Locator

  // Prescription printing and transmission
  readonly printPrescription: Locator
  readonly electronicPrescription: Locator
  readonly pharmacySelect: Locator
  readonly transmissionStatus: Locator

  // Audit and compliance
  readonly prescriptionAudit: Locator
  readonly controlledSubstanceLog: Locator
  readonly prescriptionHistory: Locator

  constructor(page: Page,) {
    super(page,)

    // Prescription form selectors
    this.prescriptionForm = page.locator('[data-testid="prescription-form"]',)
    this.medicationInput = page.locator('[data-testid="medication-input"]',)
    this.dosageInput = page.locator('[data-testid="dosage-input"]',)
    this.frequencySelect = page.locator('[data-testid="frequency-select"]',)
    this.durationInput = page.locator('[data-testid="duration-input"]',)
    this.instructionsTextarea = page.locator(
      '[data-testid="instructions-textarea"]',
    )
    this.prescriberSelect = page.locator('[data-testid="prescriber-select"]',)
    this.submitPrescriptionButton = page.locator(
      '[data-testid="submit-prescription-button"]',
    )
    this.prescriptionConfirmation = page.locator(
      '[data-testid="prescription-confirmation"]',
    )

    // Prescription history selectors
    this.prescriptionHistory = page.locator(
      '[data-testid="prescription-history"]',
    )
    this.activePrescritions = page.locator(
      '[data-testid="active-prescriptions"]',
    )
    this.pastPrescriptions = page.locator('[data-testid="past-prescriptions"]',)
    this.prescriptionSearch = page.locator(
      '[data-testid="prescription-search"]',
    )
    this.prescriptionFilters = page.locator(
      '[data-testid="prescription-filters"]',
    )

    // Drug interaction selectors
    this.interactionChecker = page.locator(
      '[data-testid="interaction-checker"]',
    )
    this.interactionWarnings = page.locator(
      '[data-testid="interaction-warnings"]',
    )
    this.majorInteractionAlert = page.locator(
      '[data-testid="major-interaction-alert"]',
    )
    this.moderateInteractionWarning = page.locator(
      '[data-testid="moderate-interaction-warning"]',
    )
    this.minorInteractionInfo = page.locator(
      '[data-testid="minor-interaction-info"]',
    )
    this.contraindicationAlert = page.locator(
      '[data-testid="contraindication-alert"]',
    )

    // Medication database selectors
    this.medicationSearch = page.locator('[data-testid="medication-search"]',)
    this.medicationSuggestions = page.locator(
      '[data-testid="medication-suggestions"]',
    )
    this.drugInformation = page.locator('[data-testid="drug-information"]',)
    this.dosageGuidelines = page.locator('[data-testid="dosage-guidelines"]',)
    this.allergyWarnings = page.locator('[data-testid="allergy-warnings"]',)

    // Prescription transmission selectors
    this.printPrescription = page.locator('[data-testid="print-prescription"]',)
    this.electronicPrescription = page.locator(
      '[data-testid="electronic-prescription"]',
    )
    this.pharmacySelect = page.locator('[data-testid="pharmacy-select"]',)
    this.transmissionStatus = page.locator(
      '[data-testid="transmission-status"]',
    )

    // Audit selectors
    this.prescriptionAudit = page.locator('[data-testid="prescription-audit"]',)
    this.controlledSubstanceLog = page.locator(
      '[data-testid="controlled-substance-log"]',
    )
  }

  /**
   * Load prescription history for a patient
   * @param patientId - Patient identifier
   */
  async loadPrescriptionHistory(patientId: string,): Promise<void> {
    await this.page.waitForLoadState('networkidle',)

    // Trigger prescription history load
    await this.page.evaluate((id,) => {
      window.dispatchEvent(
        new CustomEvent('load-prescription-history', {
          detail: { patientId: id, },
        },),
      )
    }, patientId,)

    // Wait for prescription history to be visible
    await this.prescriptionHistory.waitFor({ state: 'visible', },)
  }

  /**
   * Check for drug interactions between medications
   * @param medications - Array of medication names
   */
  async checkDrugInteractions(
    medications: string[],
  ): Promise<DrugInteractionResult> {
    // Trigger drug interaction check
    await this.page.evaluate((meds,) => {
      window.dispatchEvent(
        new CustomEvent('check-drug-interactions', {
          detail: { medications: meds, },
        },),
      )
    }, medications,)

    // Wait for interaction check to complete
    await this.interactionChecker.waitFor({ state: 'visible', },)

    // Check for interaction warnings
    const hasInteractions = await this.interactionWarnings.isVisible()

    if (!hasInteractions) {
      return {
        hasInteractions: false,
        interactions: [],
      }
    }

    // Extract interaction details
    const interactions = await this.page.evaluate(() => {
      const interactionElements = document.querySelectorAll(
        '[data-testid^="interaction-"]',
      )
      const results = []

      interactionElements.forEach((element,) => {
        const severity = element.getAttribute('data-severity',) as
          | 'minor'
          | 'moderate'
          | 'major'
          | 'contraindicated'
        const drugs = JSON.parse(element.getAttribute('data-drugs',) || '[]',)
        const description = element.querySelector('.interaction-description',)?.textContent || ''
        const recommendation = element.querySelector('.interaction-recommendation',)?.textContent
          || ''

        results.push({
          severity,
          drugs,
          description,
          recommendation,
        },)
      },)

      return results
    },)

    return {
      hasInteractions: true,
      interactions,
    }
  }

  /**
   * Fill prescription form with medication details
   * @param formData - Prescription form data
   */
  async fillPrescriptionForm(formData: PrescriptionFormData,): Promise<void> {
    await this.prescriptionForm.waitFor({ state: 'visible', },)

    // Fill medication information
    await this.medicationInput.fill(formData.medication,)

    // Wait for medication suggestions and select if available
    try {
      await this.medicationSuggestions.waitFor({
        state: 'visible',
        timeout: 2000,
      },)
      await this.page.click(
        `[data-testid="medication-suggestion-${
          formData.medication.toLowerCase().replace(/\s+/g, '-',)
        }"]`,
      )
    } catch {
      // Continue if no suggestions appear
    }

    // Fill dosage and frequency
    await this.dosageInput.fill(formData.dosage,)
    await this.frequencySelect.selectOption(formData.frequency,)
    await this.durationInput.fill(formData.duration,)
    await this.instructionsTextarea.fill(formData.instructions,)

    // Select prescriber if provided
    if (formData.prescriberId) {
      await this.prescriberSelect.selectOption(formData.prescriberId,)
    }
  }

  /**
   * Submit prescription form
   */
  async submitPrescription(): Promise<void> {
    await this.submitPrescriptionButton.click()
    await this.prescriptionConfirmation.waitFor({ state: 'visible', },)
  }

  /**
   * Search for medications in the database
   * @param searchTerm - Medication name or active ingredient
   */
  async searchMedications(searchTerm: string,): Promise<void> {
    await this.medicationSearch.fill(searchTerm,)
    await this.medicationSearch.press('Enter',)

    // Wait for search results
    await this.medicationSuggestions.waitFor({ state: 'visible', },)
  }

  /**
   * Get medication information and dosage guidelines
   * @param medicationName - Name of the medication
   */
  async getMedicationInfo(medicationName: string,): Promise<{
    drugInfo: string
    dosageGuidelines: string
    allergyWarnings: string[]
  }> {
    // Click on medication to view details
    await this.page.click(
      `[data-testid="medication-${medicationName.toLowerCase().replace(/\s+/g, '-',)}"]`,
    )

    // Wait for drug information to load
    await this.drugInformation.waitFor({ state: 'visible', },)

    // Extract medication information
    const drugInfo = (await this.drugInformation.textContent()) || ''
    const dosageGuidelines = (await this.dosageGuidelines.textContent()) || ''

    // Extract allergy warnings
    const allergyWarnings = await this.page.evaluate(() => {
      const warningElements = document.querySelectorAll(
        '[data-testid="allergy-warning"]',
      )
      return Array.from(warningElements,).map((el,) => el.textContent || '')
    },)

    return {
      drugInfo,
      dosageGuidelines,
      allergyWarnings,
    }
  }

  /**
   * Filter prescription history
   * @param filters - Filter criteria
   */
  async filterPrescriptions(filters: {
    status?: 'active' | 'completed' | 'discontinued'
    dateRange?: { start: string; end: string }
    prescriber?: string
    medication?: string
  },): Promise<void> {
    await this.prescriptionFilters.waitFor({ state: 'visible', },)

    if (filters.status) {
      await this.page.selectOption(
        '[data-testid="status-filter"]',
        filters.status,
      )
    }

    if (filters.dateRange) {
      await this.page.fill(
        '[data-testid="start-date-filter"]',
        filters.dateRange.start,
      )
      await this.page.fill(
        '[data-testid="end-date-filter"]',
        filters.dateRange.end,
      )
    }

    if (filters.prescriber) {
      await this.page.selectOption(
        '[data-testid="prescriber-filter"]',
        filters.prescriber,
      )
    }

    if (filters.medication) {
      await this.page.fill(
        '[data-testid="medication-filter"]',
        filters.medication,
      )
    }

    // Apply filters
    await this.page.click('[data-testid="apply-filters"]',)
    await this.page.waitForLoadState('networkidle',)
  }

  /**
   * Print prescription
   * @param prescriptionId - Prescription identifier
   */
  async printPrescription(prescriptionId: string,): Promise<void> {
    await this.page.click(
      `[data-testid="print-prescription-${prescriptionId}"]`,
    )

    // Wait for print dialog or confirmation
    await this.page.waitForTimeout(1000,) // Allow time for print dialog
  }

  /**
   * Send electronic prescription to pharmacy
   * @param prescriptionId - Prescription identifier
   * @param pharmacyId - Target pharmacy identifier
   */
  async sendElectronicPrescription(
    prescriptionId: string,
    pharmacyId: string,
  ): Promise<void> {
    await this.page.click(
      `[data-testid="electronic-prescription-${prescriptionId}"]`,
    )

    // Select pharmacy
    await this.pharmacySelect.selectOption(pharmacyId,)

    // Confirm transmission
    await this.page.click('[data-testid="confirm-transmission"]',)

    // Wait for transmission confirmation
    await this.transmissionStatus.waitFor({ state: 'visible', },)
  }

  /**
   * Discontinue an active prescription
   * @param prescriptionId - Prescription identifier
   * @param reason - Reason for discontinuation
   */
  async discontinuePrescription(
    prescriptionId: string,
    reason: string,
  ): Promise<void> {
    await this.page.click(
      `[data-testid="discontinue-prescription-${prescriptionId}"]`,
    )

    // Fill discontinuation reason
    await this.page.fill('[data-testid="discontinuation-reason"]', reason,)

    // Confirm discontinuation
    await this.page.click('[data-testid="confirm-discontinuation"]',)

    // Wait for confirmation
    await this.page
      .locator('[data-testid="discontinuation-confirmation"]',)
      .waitFor({ state: 'visible', },)
  }

  /**
   * Renew an existing prescription
   * @param prescriptionId - Prescription identifier
   * @param renewalData - Renewal information
   */
  async renewPrescription(
    prescriptionId: string,
    renewalData: {
      duration: string
      refills: number
      instructions?: string
    },
  ): Promise<void> {
    await this.page.click(
      `[data-testid="renew-prescription-${prescriptionId}"]`,
    )

    // Fill renewal information
    await this.page.fill(
      '[data-testid="renewal-duration"]',
      renewalData.duration,
    )
    await this.page.fill(
      '[data-testid="renewal-refills"]',
      renewalData.refills.toString(),
    )

    if (renewalData.instructions) {
      await this.page.fill(
        '[data-testid="renewal-instructions"]',
        renewalData.instructions,
      )
    }

    // Submit renewal
    await this.page.click('[data-testid="submit-renewal"]',)

    // Wait for renewal confirmation
    await this.page
      .locator('[data-testid="renewal-confirmation"]',)
      .waitFor({ state: 'visible', },)
  }

  /**
   * View prescription audit trail
   * @param prescriptionId - Prescription identifier
   */
  async viewPrescriptionAudit(prescriptionId: string,): Promise<void> {
    await this.page.click(`[data-testid="view-audit-${prescriptionId}"]`,)
    await this.prescriptionAudit.waitFor({ state: 'visible', },)
  }

  /**
   * Check controlled substance compliance
   * @param prescriptionId - Prescription identifier
   */
  async checkControlledSubstanceCompliance(prescriptionId: string,): Promise<{
    isControlledSubstance: boolean
    schedule: string
    complianceStatus: 'compliant' | 'warning' | 'violation'
    requirements: string[]
  }> {
    await this.page.click(`[data-testid="check-compliance-${prescriptionId}"]`,)

    // Wait for compliance check to complete
    await this.controlledSubstanceLog.waitFor({ state: 'visible', },)

    // Extract compliance information
    return await this.page.evaluate(() => {
      const complianceData = document.querySelector(
        '[data-testid="compliance-data"]',
      )
      if (!complianceData) {
        return {
          isControlledSubstance: false,
          schedule: '',
          complianceStatus: 'compliant' as const,
          requirements: [],
        }
      }

      return {
        isControlledSubstance: complianceData.getAttribute('data-controlled',) === 'true',
        schedule: complianceData.getAttribute('data-schedule',) || '',
        complianceStatus: complianceData.getAttribute('data-status',) as
          | 'compliant'
          | 'warning'
          | 'violation',
        requirements: JSON.parse(
          complianceData.getAttribute('data-requirements',) || '[]',
        ),
      }
    },)
  }
}
