/**
 * Healthcare Data Anonymization Utilities
 * LGPD-compliant data anonymization for patient data
 *
 * @compliance LGPD + ANVISA + CFM
 */

export type AnonymizationConfig = {
	preserveStructure: boolean;
	anonymizeEmails: boolean;
	anonymizePhones: boolean;
	anonymizeCPF: boolean;
	retainMedicalCodes: boolean;
};

export class DataAnonymizer {
	private static instance: DataAnonymizer;
	public config: AnonymizationConfig;

	private constructor() {
		this.config = {
			preserveStructure: true,
			anonymizeEmails: true,
			anonymizePhones: true,
			anonymizeCPF: true,
			retainMedicalCodes: true,
		};
	}

	static getInstance(): DataAnonymizer {
		if (!DataAnonymizer.instance) {
			DataAnonymizer.instance = new DataAnonymizer();
		}
		return DataAnonymizer.instance;
	}

	/**
	 * Anonymize patient data for LGPD compliance
	 */
	async anonymizePatientData(data: Record<string, any>): Promise<Record<string, any>> {
		const anonymized = { ...data };

		// Anonymize personal identifiers
		if (anonymized.email) {
			anonymized.email = this.anonymizeEmail(anonymized.email);
		}

		if (anonymized.phone) {
			anonymized.phone = this.anonymizePhone(anonymized.phone);
		}

		if (anonymized.cpf) {
			anonymized.cpf = this.anonymizeCPF(anonymized.cpf);
		}

		if (anonymized.first_name) {
			anonymized.first_name = "ANONYMIZED";
		}

		if (anonymized.last_name) {
			anonymized.last_name = "USER";
		}
		return anonymized;
	}

	/**
	 * Anonymize email addresses
	 */
	private anonymizeEmail(_email: string): string {
		const timestamp = Date.now();
		return `anonymized_${timestamp}@deleted.local`;
	}

	/**
	 * Anonymize phone numbers
	 */
	private anonymizePhone(_phone: string): string {
		return "+55119*****0000";
	}

	/**
	 * Anonymize CPF numbers
	 */
	private anonymizeCPF(_cpf: string): string {
		return "***.***.***-**";
	}

	/**
	 * Check if data contains sensitive information
	 */
	containsSensitiveData(data: Record<string, any>): boolean {
		const sensitiveFields = ["cpf", "email", "phone", "birth_date", "address"];
		return sensitiveFields.some((field) => data[field] !== undefined);
	}

	/**
	 * Generate anonymized medical record number
	 */
	generateAnonymizedMRN(): string {
		return `ANON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
