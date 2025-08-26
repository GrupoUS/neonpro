/**
 * @file Healthcare Data Anonymization Utilities
 * LGPD-compliant data anonymization for patient data
 */

// Constants for anonymization
const ANONYMIZED_FIRST_NAME = "ANONYMIZED";
const ANONYMIZED_LAST_NAME = "USER";
const ANONYMOUS_PHONE = "+55119*****0000";
const ANONYMOUS_CPF = "***.***.***-**";
const RANDOM_BASE = 36;
const SLICE_START = 2;
const SLICE_END = 9;

interface AnonymizationConfig {
  anonymizeCPF: boolean;
  anonymizeEmails: boolean;
  anonymizePhones: boolean;
  preserveStructure: boolean;
  retainMedicalCodes: boolean;
}

class DataAnonymizer {
  private static instance: DataAnonymizer;
  public config: AnonymizationConfig;

  private constructor() {
    this.config = {
      anonymizeCPF: true,
      anonymizeEmails: true,
      anonymizePhones: true,
      preserveStructure: true,
      retainMedicalCodes: true,
    };
  }

  static getInstance = (): DataAnonymizer => {
    if (!DataAnonymizer.instance) {
      DataAnonymizer.instance = new DataAnonymizer();
    }
    return DataAnonymizer.instance;
  };

  /**
   * Anonymize patient data for LGPD compliance
   * @param {Record<string, unknown>} data - Patient data to anonymize
   * @returns {Record<string, unknown>} Anonymized data
   */
  anonymizePatientData = (
    data: Record<string, unknown>,
  ): Record<string, unknown> => {
    const anonymized = { ...data };

    // Anonymize personal identifiers
    if (anonymized.email) {
      anonymized.email = this.anonymizeEmail(anonymized.email as string);
    }

    if (anonymized.phone) {
      anonymized.phone = this.anonymizePhone(anonymized.phone as string);
    }

    if (anonymized.cpf) {
      anonymized.cpf = this.anonymizeCPF(anonymized.cpf as string);
    }

    if (anonymized.first_name) {
      anonymized.first_name = ANONYMIZED_FIRST_NAME;
    }

    if (anonymized.last_name) {
      anonymized.last_name = ANONYMIZED_LAST_NAME;
    }
    return anonymized;
  };

  /**
   * Anonymize email addresses
   * @param {string} _email - Email to anonymize (unused for security)
   * @returns {string} Anonymized email string
   */
  private anonymizeEmail = (_email: string): string => {
    const timestamp = Date.now();
    return `anonymized_${timestamp}@deleted.local`;
  };

  /**
   * Anonymize phone numbers
   * @param {string} _phone - Phone to anonymize (unused for security)
   * @returns {string} Anonymized phone string
   */
  private anonymizePhone = (_phone: string): string => ANONYMOUS_PHONE;

  /**
   * Anonymize CPF numbers
   * @param {string} _cpf - CPF to anonymize (unused for security)
   * @returns {string} Anonymized CPF string
   */
  private anonymizeCPF = (_cpf: string): string => ANONYMOUS_CPF;

  /**
   * Check if data contains sensitive information
   * @param {Record<string, unknown>} data - Data to check for sensitive fields
   * @returns {boolean} Boolean indicating if sensitive data is present
   */
  containsSensitiveData = (data: Record<string, unknown>): boolean => {
    const sensitiveFields = ["cpf", "email", "phone", "birth_date", "address"];
    return sensitiveFields.some((field) => data[field] !== undefined);
  };

  /**
   * Generate anonymized medical record number
   * @returns {string} Anonymized MRN string
   */
  generateAnonymizedMRN = (): string =>
    `ANON_${Date.now()}_${Math.random().toString(RANDOM_BASE).slice(SLICE_START, SLICE_END)}`;
}

export { AnonymizationConfig, DataAnonymizer };
