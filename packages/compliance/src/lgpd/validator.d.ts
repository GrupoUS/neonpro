/**
 * LGPD Validator
 * Constitutional compliance validation with privacy protection
 * Compliance: LGPD + Constitutional Privacy + ≥9.9/10 Standards
 */
import type { Database } from "@neonpro/types";
import { z } from "zod";
export declare const LGPDValidationConfigSchema: z.ZodObject<
	{
		validation_type: z.ZodEnum<["data_processing", "consent_management", "data_transfer", "breach_assessment"]>;
		strict_mode: z.ZodDefault<z.ZodBoolean>;
		constitutional_validation: z.ZodDefault<z.ZodBoolean>;
		audit_trail: z.ZodDefault<z.ZodBoolean>;
		privacy_impact_assessment: z.ZodDefault<z.ZodBoolean>;
	},
	"strip",
	z.ZodTypeAny,
	{
		audit_trail: boolean;
		constitutional_validation: boolean;
		validation_type: "data_transfer" | "data_processing" | "consent_management" | "breach_assessment";
		strict_mode: boolean;
		privacy_impact_assessment: boolean;
	},
	{
		validation_type: "data_transfer" | "data_processing" | "consent_management" | "breach_assessment";
		audit_trail?: boolean | undefined;
		constitutional_validation?: boolean | undefined;
		strict_mode?: boolean | undefined;
		privacy_impact_assessment?: boolean | undefined;
	}
>;
export declare const LGPDValidationResultSchema: z.ZodObject<
	{
		validation_id: z.ZodString;
		validation_type: z.ZodString;
		validated_at: z.ZodString;
		valid: z.ZodBoolean;
		compliance_score: z.ZodNumber;
		violations: z.ZodArray<
			z.ZodObject<
				{
					category: z.ZodString;
					description: z.ZodString;
					severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
					article_reference: z.ZodString;
					constitutional_impact: z.ZodBoolean;
					remediation_required: z.ZodBoolean;
				},
				"strip",
				z.ZodTypeAny,
				{
					severity: "low" | "medium" | "high" | "critical";
					constitutional_impact: boolean;
					category: string;
					description: string;
					article_reference: string;
					remediation_required: boolean;
				},
				{
					severity: "low" | "medium" | "high" | "critical";
					constitutional_impact: boolean;
					category: string;
					description: string;
					article_reference: string;
					remediation_required: boolean;
				}
			>,
			"many"
		>;
		constitutional_validation: z.ZodObject<
			{
				privacy_rights_respected: z.ZodBoolean;
				data_minimization_applied: z.ZodBoolean;
				purpose_limitation_observed: z.ZodBoolean;
				transparency_maintained: z.ZodBoolean;
				legal_basis_valid: z.ZodBoolean;
			},
			"strip",
			z.ZodTypeAny,
			{
				data_minimization_applied: boolean;
				transparency_maintained: boolean;
				privacy_rights_respected: boolean;
				purpose_limitation_observed: boolean;
				legal_basis_valid: boolean;
			},
			{
				data_minimization_applied: boolean;
				transparency_maintained: boolean;
				privacy_rights_respected: boolean;
				purpose_limitation_observed: boolean;
				legal_basis_valid: boolean;
			}
		>;
		recommendations: z.ZodArray<
			z.ZodObject<
				{
					priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
					description: z.ZodString;
					implementation_timeline: z.ZodString;
					constitutional_requirement: z.ZodBoolean;
				},
				"strip",
				z.ZodTypeAny,
				{
					description: string;
					priority: "low" | "medium" | "high" | "critical";
					implementation_timeline: string;
					constitutional_requirement: boolean;
				},
				{
					description: string;
					priority: "low" | "medium" | "high" | "critical";
					implementation_timeline: string;
					constitutional_requirement: boolean;
				}
			>,
			"many"
		>;
		audit_trail: z.ZodObject<
			{
				validated_by: z.ZodString;
				validation_steps: z.ZodArray<z.ZodString, "many">;
				quality_score: z.ZodNumber;
			},
			"strip",
			z.ZodTypeAny,
			{
				quality_score: number;
				validation_steps: string[];
				validated_by: string;
			},
			{
				quality_score: number;
				validation_steps: string[];
				validated_by: string;
			}
		>;
	},
	"strip",
	z.ZodTypeAny,
	{
		audit_trail: {
			quality_score: number;
			validation_steps: string[];
			validated_by: string;
		};
		compliance_score: number;
		valid: boolean;
		recommendations: {
			description: string;
			priority: "low" | "medium" | "high" | "critical";
			implementation_timeline: string;
			constitutional_requirement: boolean;
		}[];
		constitutional_validation: {
			data_minimization_applied: boolean;
			transparency_maintained: boolean;
			privacy_rights_respected: boolean;
			purpose_limitation_observed: boolean;
			legal_basis_valid: boolean;
		};
		violations: {
			severity: "low" | "medium" | "high" | "critical";
			constitutional_impact: boolean;
			category: string;
			description: string;
			article_reference: string;
			remediation_required: boolean;
		}[];
		validation_type: string;
		validation_id: string;
		validated_at: string;
	},
	{
		audit_trail: {
			quality_score: number;
			validation_steps: string[];
			validated_by: string;
		};
		compliance_score: number;
		valid: boolean;
		recommendations: {
			description: string;
			priority: "low" | "medium" | "high" | "critical";
			implementation_timeline: string;
			constitutional_requirement: boolean;
		}[];
		constitutional_validation: {
			data_minimization_applied: boolean;
			transparency_maintained: boolean;
			privacy_rights_respected: boolean;
			purpose_limitation_observed: boolean;
			legal_basis_valid: boolean;
		};
		violations: {
			severity: "low" | "medium" | "high" | "critical";
			constitutional_impact: boolean;
			category: string;
			description: string;
			article_reference: string;
			remediation_required: boolean;
		}[];
		validation_type: string;
		validation_id: string;
		validated_at: string;
	}
>;
export type LGPDValidationConfig = z.infer<typeof LGPDValidationConfigSchema>;
export type LGPDValidationResult = z.infer<typeof LGPDValidationResultSchema>;
/**
 * LGPD Validator Service
 * Validates constitutional compliance with LGPD requirements
 */
export declare class LGPDValidator {
	private readonly config;
	constructor(config: LGPDValidationConfig, db: Database);
	/**
	 * Validate data processing activity
	 */
	validateDataProcessing(processingActivity: any): Promise<LGPDValidationResult>;
	/**
	 * Validate consent management
	 */
	validateConsent(consentData: any): Promise<LGPDValidationResult>;
	/**
	 * Validate constitutional compliance
	 */
	private validateConstitutionalCompliance;
	/**
	 * Validate data transfer
	 */
	validateDataTransfer(transferData: any): Promise<LGPDValidationResult>;
}
/**
 * Create LGPD Validator service
 */
export declare function createLGPDValidator(config: LGPDValidationConfig, db: Database): LGPDValidator;
/**
 * Validate LGPD validation configuration
 */
export declare function validateLGPDValidationConfig(config: LGPDValidationConfig): Promise<{
	valid: boolean;
	violations: string[];
}>;
