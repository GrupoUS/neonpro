/**
 * Mock Data for Brazilian Aesthetic Medicine Treatments
 * Realistic data for testing and demonstration of the treatments management system
 */

import type {
	PatientConsent,
	TreatmentPhoto,
	TreatmentPlan,
	TreatmentProgress,
	TreatmentProtocol,
	TreatmentSession,
} from "@/types/treatments";

// Mock Treatment Plans - Brazilian Aesthetic Medicine
export const mockTreatmentPlans: TreatmentPlan[] = [
	{
		id: "treatment-001",
		patient_id: "patient-001",
		professional_id: "prof-001",
		treatment_name: "Rejuvenescimento Facial com Laser CO2",
		treatment_type: "multi_session",
		category: "facial",
		status: "active",
		description:
			"Tratamento de rejuvenescimento facial utilizando laser CO2 fracionado para melhoria da textura da pele, redução de rugas e uniformização do tom.",
		expected_sessions: 4,
		completed_sessions: 1,
		session_interval_days: 30,
		cfm_compliance_status: "compliant",
		professional_license_verified: true,
		ethics_review_required: false,
		lgpd_consent_granted: true,
		lgpd_consent_date: "2024-01-15T10:00:00Z",
		lgpd_photo_consent_status: "granted",
		data_retention_days: 2555, // 7 years
		expected_outcomes: {
			improvement_percentage: "70-85%",
			visible_results_weeks: 4,
			final_results_months: 3,
			skin_texture_improvement: "Significativa",
			wrinkle_reduction: "Moderada a severa",
			skin_tone_uniformity: "Muito boa",
		},
		risk_assessment: {
			risk_level: "medium",
			common_side_effects: ["Vermelhidão temporária", "Descamação leve", "Sensibilidade solar"],
			rare_complications: ["Hiperpigmentação", "Hipopigmentação", "Cicatrização irregular"],
			contraindications: ["Gravidez", "Lactação", "Uso de isotretinoína", "Bronzeamento recente"],
		},
		total_cost: 4800.0,
		payment_plan: {
			installments: 4,
			installment_value: 1200.0,
			payment_method: "credit_card",
		},
		insurance_coverage: null,
		start_date: "2024-01-15T14:00:00Z",
		estimated_completion_date: "2024-05-15T14:00:00Z",
		next_session_date: "2024-02-15T14:00:00Z",
		created_at: "2024-01-10T10:00:00Z",
		updated_at: "2024-01-15T16:00:00Z",
		created_by: "Dr. Marina Silva",
		last_modified_by: "Dr. Marina Silva",
	},
	{
		id: "treatment-002",
		patient_id: "patient-002",
		professional_id: "prof-002",
		treatment_name: "Contorno Corporal com Criolipólise",
		treatment_type: "multi_session",
		category: "body_contouring",
		status: "active",
		description:
			"Redução de gordura localizada através de criolipólise em região abdominal e flancos, visando contorno corporal e redução de medidas.",
		expected_sessions: 3,
		completed_sessions: 2,
		session_interval_days: 45,
		cfm_compliance_status: "compliant",
		professional_license_verified: true,
		ethics_review_required: false,
		lgpd_consent_granted: true,
		lgpd_consent_date: "2023-11-20T09:00:00Z",
		lgpd_photo_consent_status: "granted",
		data_retention_days: 2555,
		expected_outcomes: {
			fat_reduction_percentage: "20-25%",
			circumference_reduction_cm: "2-5",
			visible_results_weeks: 8,
			final_results_months: 4,
			improvement_areas: ["Abdômen", "Flancos"],
		},
		risk_assessment: {
			risk_level: "low",
			common_side_effects: ["Vermelhidão", "Inchaço temporário", "Dormência leve"],
			rare_complications: ["Hiperplasia adiposa paradoxal", "Neuropatia sensitiva"],
			contraindications: ["Gravidez", "Crioglobulinemia", "Urticária ao frio"],
		},
		total_cost: 2700.0,
		payment_plan: {
			installments: 3,
			installment_value: 900.0,
			payment_method: "bank_transfer",
		},
		insurance_coverage: null,
		start_date: "2023-11-20T10:00:00Z",
		estimated_completion_date: "2024-03-20T10:00:00Z",
		next_session_date: "2024-01-25T10:00:00Z",
		created_at: "2023-11-15T14:00:00Z",
		updated_at: "2024-01-05T11:00:00Z",
		created_by: "Dr. Roberto Costa",
		last_modified_by: "Dr. Roberto Costa",
	},
];

// Export all mock data
export const mockTreatmentsData = {
	treatmentPlans: mockTreatmentPlans,
	treatmentSessions: [],
	treatmentProtocols: [],
	patientConsents: [],
	treatmentPhotos: [],
	treatmentProgress: [],
};

export default mockTreatmentsData;
