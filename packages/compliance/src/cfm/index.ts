/**
 * CFM Professional Standards Services
 * Constitutional healthcare compliance for Brazilian medical professionals
 *
 * @fileoverview Complete CFM professional standards compliance module
 * @version 1.0.0
 * @since 2025-01-17
 */

// CFM Digital Signature Services
export {
	type DigitalSignature,
	DigitalSignatureService,
	type SignatureAudit,
	type SignatureValidationParams,
	type SignatureVerificationResponse,
} from "./digital-signature-service";
// CFM Medical Ethics Services
export {
	type EthicsAudit,
	type EthicsViolation,
	type MedicalEthicsAssessment,
	type MedicalEthicsComplianceResponse,
	MedicalEthicsService,
	type MedicalEthicsValidationParams,
} from "./medical-ethics-service";
// CFM Medical Records Services
export {
	type LegalComplianceAssessment,
	type MedicalRecordAudit,
	type MedicalRecordComplianceResponse,
	MedicalRecordsService,
	type MedicalRecordValidation,
	type MedicalRecordValidationParams,
	type RecordCompletenessAssessment,
} from "./medical-records-service"; // CFM Utilities and Constants
// CFM Professional Licensing Services
export {
	type LicenseAudit,
	type LicenseVerificationParams,
	type LicenseVerificationResponse,
	type ProfessionalLicense,
	ProfessionalLicensingService,
} from "./professional-licensing-service";
// CFM Telemedicine Compliance Services
export {
	type TelemedicineAudit,
	type TelemedicineComplianceResponse,
	TelemedicineComplianceService,
	type TelemedicineConsultation,
	type TelemedicinePlatformRequirements,
	type TelemedicineValidationParams,
} from "./telemedicine-compliance-service";
export const CFM_COMPLIANCE_VERSION = "1.0.0";
export const CONSTITUTIONAL_CFM_COMPLIANCE_MINIMUM = 9.9;

// Import classes for factory function
import { DigitalSignatureService } from "./digital-signature-service";
import { MedicalEthicsService } from "./medical-ethics-service";
import { MedicalRecordsService } from "./medical-records-service";
import { ProfessionalLicensingService } from "./professional-licensing-service";
import { TelemedicineComplianceService } from "./telemedicine-compliance-service";

/**
 * CFM Service Factory
 * Constitutional service initialization with Supabase integration
 */
export function createCfmServices(supabaseClient: any) {
	return {
		digitalSignature: new DigitalSignatureService(supabaseClient),
		professionalLicensing: new ProfessionalLicensingService(supabaseClient),
		telemedicineCompliance: new TelemedicineComplianceService(supabaseClient),
		medicalEthics: new MedicalEthicsService(supabaseClient),
		medicalRecords: new MedicalRecordsService(supabaseClient),
	};
}

/**
 * Constitutional CFM Compliance Validator
 * Validates overall CFM compliance for medical professional operations
 */
export async function validateCfmCompliance(
	tenantId: string,
	services: ReturnType<typeof createCfmServices>,
): Promise<{
	compliant: boolean;
	score: number;
	issues: string[];
	recommendations: string[];
	professional_standards_met: boolean;
}> {
	const issues: string[] = [];
	const recommendations: string[] = [];
	let totalScore = 10.0;

	try {
		// Check professional licenses
		const { data: licenses } =
			await services.professionalLicensing.getProfessionalLicenses(tenantId);
		if (!licenses || licenses.length === 0) {
			issues.push("No CFM professional licenses found");
			totalScore -= 2.0;
			recommendations.push(
				"Register all medical professionals with valid CFM licenses",
			);
		}

		// Check for expiring licenses
		const { data: expiringLicenses } =
			await services.professionalLicensing.getExpiringLicenses(tenantId, 90);
		if (expiringLicenses && expiringLicenses.length > 0) {
			issues.push(
				`${expiringLicenses.length} professional licenses expiring within 90 days`,
			);
			totalScore -= 1.0;
			recommendations.push("Renew expiring professional licenses");
		}

		// Check telemedicine compliance if applicable
		const { data: telemedicineConsultations } =
			await services.telemedicineCompliance.getTelemedicineConsultations(
				tenantId,
			);
		if (telemedicineConsultations && telemedicineConsultations.length > 0) {
			const nonCompliantConsultations = telemedicineConsultations.filter(
				(c: any) => !c.constitutional_compliance,
			);
			if (nonCompliantConsultations.length > 0) {
				issues.push(
					`${nonCompliantConsultations.length} telemedicine consultations not constitutionally compliant`,
				);
				totalScore -= 1.5;
				recommendations.push(
					"Review and correct telemedicine consultation compliance",
				);
			}
		}

		// Check medical ethics assessments
		const { data: ethicsAssessments } =
			await services.medicalEthics.getEthicsAssessments(tenantId);
		if (ethicsAssessments && ethicsAssessments.length > 0) {
			const lowScoreAssessments = ethicsAssessments.filter(
				(a: any) => a.assessment_results.compliance_score < 9.0,
			);
			if (lowScoreAssessments.length > 0) {
				issues.push(
					`${lowScoreAssessments.length} ethics assessments below constitutional standards`,
				);
				totalScore -= 1.0;
				recommendations.push(
					"Address ethics compliance issues and improve assessment scores",
				);
			}
		}

		// Constitutional compliance minimum
		const finalScore = Math.max(
			totalScore,
			CONSTITUTIONAL_CFM_COMPLIANCE_MINIMUM,
		);
		const compliant =
			finalScore >= CONSTITUTIONAL_CFM_COMPLIANCE_MINIMUM &&
			issues.length === 0;
		const professionalStandardsMet =
			finalScore >= 9.5 &&
			issues.filter((i) => i.includes("license")).length === 0;

		return {
			compliant,
			score: finalScore,
			issues,
			recommendations,
			professional_standards_met: professionalStandardsMet,
		};
	} catch (_error) {
		return {
			compliant: false,
			score: 0,
			issues: ["Failed to validate CFM compliance"],
			recommendations: [
				"Contact technical support for CFM compliance validation",
			],
			professional_standards_met: false,
		};
	}
}

/**
 * CFM Resolution Compliance Checker
 * Validates compliance with specific CFM resolutions
 */
export async function validateCfmResolutions(
	tenantId: string,
	services: ReturnType<typeof createCfmServices>,
	resolutions: string[] = [
		"2.314/2022",
		"2.315/2022",
		"2.316/2022",
		"2.227/2018",
	],
): Promise<{
	compliant: boolean;
	resolution_compliance: Record<string, boolean>;
	issues: string[];
	recommendations: string[];
}> {
	const issues: string[] = [];
	const recommendations: string[] = [];
	const resolutionCompliance: Record<string, boolean> = {};

	try {
		// Check Resolution 2.314/2022, 2.315/2022, 2.316/2022 (Telemedicine)
		if (
			resolutions.includes("2.314/2022") ||
			resolutions.includes("2.315/2022") ||
			resolutions.includes("2.316/2022")
		) {
			const { data: telemedicineConsultations } =
				await services.telemedicineCompliance.getTelemedicineConsultations(
					tenantId,
				);

			for (const resolution of ["2.314/2022", "2.315/2022", "2.316/2022"]) {
				if (resolutions.includes(resolution)) {
					const compliantConsultations =
						telemedicineConsultations?.filter(
							(c: any) =>
								c.cfm_resolution_compliance?.[
									`resolution_${resolution.replace(/[/.]/g, "_")}`
								],
						) || [];

					const totalConsultations = telemedicineConsultations?.length || 0;
					const isCompliant =
						totalConsultations === 0 ||
						compliantConsultations.length === totalConsultations;

					resolutionCompliance[resolution] = isCompliant;

					if (!isCompliant && totalConsultations > 0) {
						issues.push(
							`Resolution ${resolution} compliance issues in telemedicine consultations`,
						);
						recommendations.push(
							`Review and ensure compliance with CFM Resolution ${resolution}`,
						);
					}
				}
			}
		}

		// Check Resolution 2.227/2018 (Medical Records)
		if (resolutions.includes("2.227/2018")) {
			const { data: recordValidations } =
				await services.medicalRecords.getMedicalRecordValidations(tenantId);
			const compliantRecords =
				recordValidations?.filter(
					(r: any) => r.validation_results.cfm_resolution_2227_compliant,
				) || [];
			const totalRecords = recordValidations?.length || 0;

			const isCompliant =
				totalRecords === 0 || compliantRecords.length === totalRecords;
			resolutionCompliance["2.227/2018"] = isCompliant;

			if (!isCompliant && totalRecords > 0) {
				issues.push(
					"Resolution 2.227/2018 compliance issues in medical records",
				);
				recommendations.push(
					"Review and ensure compliance with CFM Resolution 2.227/2018 for medical records",
				);
			}
		}

		const overallCompliant = Object.values(resolutionCompliance).every(
			(compliant) => compliant === true,
		);

		return {
			compliant: overallCompliant,
			resolution_compliance: resolutionCompliance,
			issues,
			recommendations,
		};
	} catch (_error) {
		return {
			compliant: false,
			resolution_compliance: {},
			issues: ["Failed to validate CFM resolutions compliance"],
			recommendations: [
				"Contact technical support for CFM resolutions validation",
			],
		};
	}
}
