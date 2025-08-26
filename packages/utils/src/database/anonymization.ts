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
   * @param data - Patient data to anonymize
   * @returns Promise with anonymized data
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
   * @param _email - Email to anonymize (unused for security)
   * @returns Anonymized email string
   */
  private anonymizeEmail = (_email: string): string => {
    const timestamp = Date.now();
    return `anonymized_${timestamp}@deleted.local`;
  };

  /**
   * Anonymize phone numbers
   * @param _phone - Phone to anonymize (unused for security)
   * @returns Anonymized phone string
   */
  private anonymizePhone = (_phone: string): string => {
    return ANONYMOUS_PHONE;
  };

  /**
   * Anonymize CPF numbers
   * @param _cpf - CPF to anonymize (unused for security)
   * @returns Anonymized CPF string
   */
  private anonymizeCPF = (_cpf: string): string => {
    return ANONYMOUS_CPF;
  };

  /**
   * Check if data contains sensitive information
   * @param data - Data to check for sensitive fields
   * @returns Boolean indicating if sensitive data is present
   */
  containsSensitiveData = (data: Record<string, unknown>): boolean => {
    const sensitiveFields = ["cpf", "email", "phone", "birth_date", "address"];
    return sensitiveFields.some((field) => data[field] !== undefined);
  };

  /**
   * Generate anonymized medical record number
   * @returns Anonymized MRN string
   */
  generateAnonymizedMRN = (): string => {
    return `ANON_${Date.now()}_${Math.random().toString(RANDOM_BASE).slice(SLICE_START, SLICE_END)}`;
  };
}

export { AnonymizationConfig, DataAnonymizer };
