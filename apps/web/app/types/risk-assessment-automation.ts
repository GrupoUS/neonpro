// ============================================================================
// PATIENT RISK ASSESSMENT TYPES - CONSTITUTIONAL HEALTHCARE COMPLIANCE
// ============================================================================

/**
 * Risk Level Classification
 * Based on Brazilian healthcare standards (CFM/ANVISA compliance)
 */
export enum RiskLevel {
	LOW = "LOW", // 0-30: Minimal intervention required
	MEDIUM = "MEDIUM", // 31-70: Standard monitoring
	HIGH = "HIGH", // 71-85: Enhanced monitoring + professional review
	CRITICAL = "CRITICAL", // 86-100: Immediate escalation + emergency protocols
}

/**
 * Risk Factor Categories
 * Multi-dimensional analysis for comprehensive patient assessment
 */
export enum RiskFactorCategory {
	DEMOGRAPHIC = "DEMOGRAPHIC", // Age, gender, BMI, genetic factors
	MEDICAL_HISTORY = "MEDICAL_HISTORY", // Previous conditions, treatments, allergies
	CURRENT_CONDITION = "CURRENT_CONDITION", // Vital signs, symptoms, medications
	PROCEDURE_SPECIFIC = "PROCEDURE_SPECIFIC", // Treatment complexity, anesthesia needs
	ENVIRONMENTAL = "ENVIRONMENTAL", // Support system, compliance history
	PSYCHOSOCIAL = "PSYCHOSOCIAL", // Mental health, stress factors
}

/**
 * Emergency Escalation Priority
 * CFM compliance for medical professional oversight
 */
export enum EscalationPriority {
	ROUTINE = "ROUTINE", // Standard professional review
	URGENT = "URGENT", // Within 4 hours
	IMMEDIATE = "IMMEDIATE", // Within 30 minutes
	EMERGENCY = "EMERGENCY", // Immediate action required
}

/**
 * Patient Demographic Risk Factors
 * LGPD compliant data collection with consent tracking
 */
export type DemographicRiskFactors = {
	age: number;
	gender: "MALE" | "FEMALE" | "OTHER" | "NOT_SPECIFIED";
	bmi: number;
	geneticPredispositions: string[];
	pregnancyStatus?: "PREGNANT" | "BREASTFEEDING" | "NOT_APPLICABLE";
	smokingStatus: "NEVER" | "FORMER" | "CURRENT";
	alcoholConsumption: "NONE" | "LIGHT" | "MODERATE" | "HEAVY";
	physicalActivityLevel: "SEDENTARY" | "LIGHT" | "MODERATE" | "INTENSE";
};

/**
 * Medical History Risk Assessment
 * Constitutional healthcare data with audit trail
 */
export type MedicalHistoryRiskFactors = {
	chronicConditions: string[];
	previousSurgeries: Array<{
		procedure: string;
		date: Date;
		complications?: string[];
		outcome: "SUCCESSFUL" | "COMPLICATED" | "FAILED";
	}>;
	allergies: Array<{
		allergen: string;
		severity: "MILD" | "MODERATE" | "SEVERE" | "ANAPHYLACTIC";
		reaction: string;
	}>;
	familyHistory: Array<{
		condition: string;
		relationship: string;
		ageAtDiagnosis?: number;
	}>;
	currentMedications: Array<{
		name: string;
		dosage: string;
		frequency: string;
		startDate: Date;
		indication: string;
	}>;
	immunizationStatus: Record<
		string,
		{
			vaccinated: boolean;
			lastDose?: Date;
			boosterRequired?: boolean;
		}
	>;
}; /**
 * Current Health Status Assessment
 * Real-time monitoring with vital signs integration
 */
export type CurrentConditionRiskFactors = {
	vitalSigns: {
		bloodPressure: {
			systolic: number;
			diastolic: number;
			timestamp: Date;
		};
		heartRate: {
			bpm: number;
			rhythm: "REGULAR" | "IRREGULAR";
			timestamp: Date;
		};
		temperature: {
			celsius: number;
			timestamp: Date;
		};
		respiratoryRate: {
			rpm: number;
			timestamp: Date;
		};
		oxygenSaturation: {
			percentage: number;
			timestamp: Date;
		};
	};
	currentSymptoms: Array<{
		symptom: string;
		severity: 1 | 2 | 3 | 4 | 5; // 1=mild, 5=severe
		duration: string;
		onset: Date;
	}>;
	painLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
	mentalStatus: "ALERT" | "CONFUSED" | "DROWSY" | "UNCONSCIOUS";
	mobilityStatus: "AMBULATORY" | "ASSISTED" | "WHEELCHAIR" | "BEDRIDDEN";
}; /**
 * Procedure-Specific Risk Factors
 * Treatment complexity assessment with ANVISA compliance
 */
export type ProcedureSpecificRiskFactors = {
	plannedProcedure: {
		name: string;
		type: "SURGICAL" | "NON_SURGICAL" | "MINIMALLY_INVASIVE" | "COSMETIC";
		complexity: "LOW" | "MEDIUM" | "HIGH" | "COMPLEX";
		duration: number; // minutes
		anesthesiaRequired: boolean;
		anesthesiaType?: "LOCAL" | "REGIONAL" | "GENERAL" | "SEDATION";
	};
	equipmentRequired: Array<{
		device: string;
		anvisaRegistration?: string;
		riskClass: "I" | "II" | "III" | "IV";
	}>;
	contraindicationsPresent: string[];
	drugInteractions: Array<{
		medication1: string;
		medication2: string;
		severity: "MINOR" | "MODERATE" | "MAJOR" | "CONTRAINDICATED";
		description: string;
	}>;
};

/**
 * Environmental & Social Risk Factors
 * Holistic patient assessment with social determinants
 */
export type EnvironmentalRiskFactors = {
	supportSystem: {
		hasCaregiver: boolean;
		familySupport: "STRONG" | "MODERATE" | "WEAK" | "NONE";
		socialIsolation: boolean;
		languageBarriers: boolean;
	};
	accessibilityFactors: {
		transportationAvailable: boolean;
		distanceToClinic: number; // kilometers
		financialConstraints: boolean;
		insuranceCoverage: "FULL" | "PARTIAL" | "NONE";
	};
	complianceHistory: {
		previousAppointmentAttendance: number; // percentage
		medicationCompliance: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
		followUpCompliance: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
	};
}; /**
 * Comprehensive Risk Assessment Input
 * Complete patient risk profile for ML analysis
 */
export type RiskAssessmentInput = {
	patientId: string;
	tenantId: string;
	assessmentDate: Date;
	assessmentType: "PRE_PROCEDURE" | "ONGOING_CARE" | "POST_PROCEDURE" | "EMERGENCY";
	demographicFactors: DemographicRiskFactors;
	medicalHistory: MedicalHistoryRiskFactors;
	currentCondition: CurrentConditionRiskFactors;
	procedureSpecific?: ProcedureSpecificRiskFactors;
	environmental: EnvironmentalRiskFactors;

	// LGPD Compliance
	consentGiven: boolean;
	consentDate: Date;
	dataProcessingPurpose: string[];
	retentionPeriod: number; // days
};

/**
 * Risk Score Breakdown
 * Explainable AI with factor-level scoring
 */
export type RiskScoreBreakdown = {
	overallScore: number; // 0-100
	riskLevel: RiskLevel;
	categoryScores: {
		demographic: number;
		medicalHistory: number;
		currentCondition: number;
		procedureSpecific: number;
		environmental: number;
		psychosocial: number;
	};
	criticalFactors: Array<{
		factor: string;
		category: RiskFactorCategory;
		impact: number; // 0-100
		explanation: string;
	}>;
	confidenceInterval: {
		lower: number;
		upper: number;
		confidence: number; // percentage
	};
}; /**
 * Professional Oversight Requirements
 * CFM compliance for medical professional review
 */
export type ProfessionalOversight = {
	requiredReview: boolean;
	reviewLevel: "NURSE" | "PHYSICIAN" | "SPECIALIST" | "SENIOR_PHYSICIAN";
	timeframe: number; // minutes
	escalationRequired: boolean;
	escalationPriority: EscalationPriority;
	specialistConsultation?: {
		specialty: string;
		urgency: "ROUTINE" | "URGENT" | "STAT";
		reason: string;
	};
};

/**
 * Emergency Escalation Protocol
 * Real-time alert system with chain of command
 */
export type EmergencyEscalation = {
	triggered: boolean;
	triggerReason: string[];
	alertLevel: "YELLOW" | "ORANGE" | "RED" | "BLACK";
	notificationsSent: Array<{
		recipient: string;
		role: string;
		sentAt: Date;
		acknowledged: boolean;
		acknowledgedAt?: Date;
	}>;
	actionsTaken: Array<{
		action: string;
		performedBy: string;
		timestamp: Date;
		outcome: string;
	}>;
	resolutionStatus: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";
};

/**
 * Risk Assessment Result
 * Complete assessment output with professional oversight
 */
export type RiskAssessmentResult = {
	id: string;
	patientId: string;
	tenantId: string;
	assessmentDate: Date;
	inputData: RiskAssessmentInput;
	scoreBreakdown: RiskScoreBreakdown;
	professionalOversight: ProfessionalOversight;
	emergencyEscalation?: EmergencyEscalation;
	recommendations: Array<{
		category: string;
		priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
		action: string;
		rationale: string;
		timeframe: string;
	}>;

	// Model Information for Explainable AI
	modelVersion: string;
	algorithmUsed: string;
	trainingDataDate: Date;
	accuracy: number;

	// Audit Trail for Regulatory Compliance
	createdBy: string;
	createdAt: Date;
	lastModifiedBy?: string;
	lastModifiedAt?: Date;
	reviewHistory: Array<{
		reviewedBy: string;
		reviewedAt: Date;
		decision: "APPROVED" | "MODIFIED" | "REJECTED" | "ESCALATED";
		comments: string;
		digitalSignature: string;
	}>;
}; /**
 * Audit Trail Entry
 * Constitutional healthcare compliance with LGPD requirements
 */
export type AuditTrailEntry = {
	id: string;
	patientId: string;
	assessmentId: string;
	action: "CREATED" | "VIEWED" | "MODIFIED" | "DELETED" | "ESCALATED" | "REVIEWED";
	performedBy: string;
	performedAt: Date;
	ipAddress: string;
	userAgent: string;
	dataAccessed: string[];
	dataModified: string[];
	justification: string;
	digitalSignature: string;

	// LGPD Compliance
	legalBasis: "CONSENT" | "LEGITIMATE_INTEREST" | "VITAL_INTEREST" | "LEGAL_OBLIGATION";
	dataSubjectNotified: boolean;
	retentionExpiry: Date;
};

/**
 * Risk Assessment Monitoring
 * Real-time system performance and accuracy tracking
 */
export type RiskAssessmentMetrics = {
	totalAssessments: number;
	accuracyRate: number; // percentage
	averageProcessingTime: number; // milliseconds
	escalationRate: number; // percentage
	professionalOverrideRate: number; // percentage

	performanceByRiskLevel: Record<
		RiskLevel,
		{
			count: number;
			accuracy: number;
			avgProcessingTime: number;
			escalationRate: number;
		}
	>;

	// Constitutional Healthcare Quality Metrics
	patientSafetyIncidents: number;
	regulatoryCompliance: {
		lgpdCompliance: number; // percentage
		anvisaCompliance: number; // percentage
		cfmCompliance: number; // percentage
	};

	lastUpdated: Date;
};

/**
 * System Configuration
 * Risk assessment algorithm parameters and thresholds
 */
export type RiskAssessmentConfig = {
	modelVersion: string;
	accuracyThreshold: number; // minimum required accuracy

	riskThresholds: {
		low: { min: number; max: number };
		medium: { min: number; max: number };
		high: { min: number; max: number };
		critical: { min: number; max: number };
	};

	escalationRules: Array<{
		condition: string;
		threshold: number;
		action: string;
		timeframe: number; // minutes
	}>;

	weightings: {
		demographic: number;
		medicalHistory: number;
		currentCondition: number;
		procedureSpecific: number;
		environmental: number;
		psychosocial: number;
	};

	lastUpdated: Date;
	updatedBy: string;
};
