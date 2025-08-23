// Migrated from src/services/patient.ts
import { supabase } from "@/lib/supabase";

export type Patient = {
	id?: string;
	tenant_id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	cpf: string;
	date_of_birth: string;
	gender: "male" | "female" | "other" | "prefer_not_to_say";
	address?: {
		street: string;
		number: string;
		complement?: string;
		neighborhood: string;
		city: string;
		state: string;
		zip_code: string;
	};
	emergency_contact?: {
		name: string;
		relationship: string;
		phone: string;
	};
	medical_history?: string;
	allergies?: string[];
	medications?: string[];
	insurance_info?: {
		provider: string;
		policy_number: string;
		coverage_type: string;
	};
	lgpd_consent: boolean;
	marketing_consent: boolean;
	status: "active" | "inactive" | "blocked";
	created_at?: string;
	updated_at?: string;
};

export type PatientAppointment = {
	id?: string;
	patient_id: string;
	professional_id: string;
	service_id: string;
	appointment_date: string;
	duration_minutes: number;
	status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
	notes?: string;
	created_at?: string;
};

export type PatientTreatment = {
	id?: string;
	patient_id: string;
	professional_id: string;
	treatment_name: string;
	description: string;
	status: "planned" | "in_progress" | "completed" | "cancelled";
	start_date: string;
	end_date?: string;
	sessions_planned: number;
	sessions_completed: number;
	notes?: string;
	created_at?: string;
	updated_at?: string;
};

export type PatientConsent = {
	id?: string;
	patient_id: string;
	tenant_id: string;
	consent_type: "lgpd" | "treatment" | "marketing" | "data_sharing" | "telemedicine";
	consent_text: string;
	granted: boolean;
	granted_at?: string;
	expires_at?: string;
	ip_address?: string;
	user_agent?: string;
	created_at?: string;
};

export class PatientService {
	async createPatient(
		patient: Omit<Patient, "id" | "created_at" | "updated_at">
	): Promise<{ patient?: Patient; error?: string }> {
		try {
			// Validate CPF format
			if (!this.isValidCPF(patient.cpf)) {
				return { error: "CPF inválido" };
			}

			// Check if patient already exists
			const { data: existingPatient } = await supabase
				.from("patients")
				.select("id")
				.eq("tenant_id", patient.tenant_id)
				.or(`email.eq.${patient.email},cpf.eq.${patient.cpf}`)
				.single();

			if (existingPatient) {
				return { error: "Paciente já cadastrado com este email ou CPF" };
			}

			const { data, error } = await supabase
				.from("patients")
				.insert({
					...patient,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error) {
				return { error: error.message };
			}

			// Record LGPD consent if granted
			if (patient.lgpd_consent) {
				await this.recordConsent({
					patient_id: data.id!,
					tenant_id: patient.tenant_id,
					consent_type: "lgpd",
					consent_text: "Consent granted for personal data processing according to LGPD",
					granted: true,
					granted_at: new Date().toISOString(),
				});
			}

			return { patient: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to create patient",
			};
		}
	}

	async getPatient(id: string, tenantId: string): Promise<{ patient?: Patient; error?: string }> {
		try {
			const { data, error } = await supabase
				.from("patients")
				.select("*")
				.eq("id", id)
				.eq("tenant_id", tenantId)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					return { error: "Patient not found" };
				}
				return { error: error.message };
			}

			return { patient: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to get patient",
			};
		}
	}

	async getPatients(
		tenantId: string,
		filters?: {
			search?: string;
			status?: Patient["status"];
			limit?: number;
			offset?: number;
		}
	): Promise<{ patients?: Patient[]; total?: number; error?: string }> {
		try {
			let query = supabase
				.from("patients")
				.select("*", { count: "exact" })
				.eq("tenant_id", tenantId)
				.order("created_at", { ascending: false });

			if (filters?.search) {
				query = query.or(
					`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`
				);
			}

			if (filters?.status) {
				query = query.eq("status", filters.status);
			}

			if (filters?.limit) {
				query = query.limit(filters.limit);
			}

			if (filters?.offset) {
				query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 50) - 1);
			}

			const { data, error, count } = await query;

			if (error) {
				return { error: error.message };
			}

			return { patients: data, total: count || 0 };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to get patients",
			};
		}
	}

	async updatePatient(
		id: string,
		tenantId: string,
		updates: Partial<Patient>
	): Promise<{ patient?: Patient; error?: string }> {
		try {
			// Validate CPF if being updated
			if (updates.cpf && !this.isValidCPF(updates.cpf)) {
				return { error: "CPF inválido" };
			}

			const { data, error } = await supabase
				.from("patients")
				.update({
					...updates,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.eq("tenant_id", tenantId)
				.select()
				.single();

			if (error) {
				return { error: error.message };
			}

			return { patient: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to update patient",
			};
		}
	}

	async deletePatient(id: string, tenantId: string): Promise<{ success?: boolean; error?: string }> {
		try {
			// In healthcare, we typically don't hard delete patient data
			// Instead, we mark as inactive for LGPD compliance
			const { error } = await supabase
				.from("patients")
				.update({
					status: "inactive",
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.eq("tenant_id", tenantId);

			if (error) {
				return { error: error.message };
			}

			return { success: true };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to delete patient",
			};
		}
	}

	async getPatientAppointments(
		patientId: string,
		tenantId: string,
		filters?: {
			status?: PatientAppointment["status"];
			startDate?: string;
			endDate?: string;
			limit?: number;
		}
	): Promise<{ appointments?: PatientAppointment[]; error?: string }> {
		try {
			let query = supabase
				.from("patient_appointments")
				.select(`
          *,
          professional:professionals(first_name, last_name),
          service:services(name, duration_minutes)
        `)
				.eq("patient_id", patientId)
				.eq("tenant_id", tenantId)
				.order("appointment_date", { ascending: false });

			if (filters?.status) {
				query = query.eq("status", filters.status);
			}

			if (filters?.startDate) {
				query = query.gte("appointment_date", filters.startDate);
			}

			if (filters?.endDate) {
				query = query.lte("appointment_date", filters.endDate);
			}

			if (filters?.limit) {
				query = query.limit(filters.limit);
			}

			const { data, error } = await query;

			if (error) {
				return { error: error.message };
			}

			return { appointments: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to get patient appointments",
			};
		}
	}

	async getPatientTreatments(
		patientId: string,
		tenantId: string
	): Promise<{ treatments?: PatientTreatment[]; error?: string }> {
		try {
			const { data, error } = await supabase
				.from("patient_treatments")
				.select(`
          *,
          professional:professionals(first_name, last_name)
        `)
				.eq("patient_id", patientId)
				.eq("tenant_id", tenantId)
				.order("created_at", { ascending: false });

			if (error) {
				return { error: error.message };
			}

			return { treatments: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to get patient treatments",
			};
		}
	}

	async recordConsent(
		consent: Omit<PatientConsent, "id" | "created_at">
	): Promise<{ consent?: PatientConsent; error?: string }> {
		try {
			const { data, error } = await supabase
				.from("patient_consents")
				.insert({
					...consent,
					created_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error) {
				return { error: error.message };
			}

			return { consent: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to record consent",
			};
		}
	}

	async getPatientConsents(
		patientId: string,
		tenantId: string
	): Promise<{ consents?: PatientConsent[]; error?: string }> {
		try {
			const { data, error } = await supabase
				.from("patient_consents")
				.select("*")
				.eq("patient_id", patientId)
				.eq("tenant_id", tenantId)
				.order("created_at", { ascending: false });

			if (error) {
				return { error: error.message };
			}

			return { consents: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to get patient consents",
			};
		}
	}

	async searchPatients(
		tenantId: string,
		searchTerm: string,
		limit = 10
	): Promise<{ patients?: Patient[]; error?: string }> {
		try {
			const { data, error } = await supabase
				.from("patients")
				.select("id, first_name, last_name, email, phone, cpf")
				.eq("tenant_id", tenantId)
				.eq("status", "active")
				.or(
					`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`
				)
				.limit(limit);

			if (error) {
				return { error: error.message };
			}

			return { patients: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to search patients",
			};
		}
	}

	async getPatientStats(tenantId: string): Promise<{ stats?: Record<string, number>; error?: string }> {
		try {
			const { data, error } = await supabase.rpc("get_patient_stats", {
				p_tenant_id: tenantId,
			});

			if (error) {
				return { error: error.message };
			}

			return { stats: data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to get patient stats",
			};
		}
	}

	private isValidCPF(cpf: string): boolean {
		// Remove any non-digit characters
		const cleanCPF = cpf.replace(/\D/g, "");

		// Check if it has 11 digits
		if (cleanCPF.length !== 11) {
			return false;
		}

		// Check if all digits are the same
		if (/^(\d)\1+$/.test(cleanCPF)) {
			return false;
		}

		// Calculate check digits
		let sum = 0;
		for (let i = 0; i < 9; i++) {
			sum += Number.parseInt(cleanCPF.charAt(i), 10) * (10 - i);
		}

		let checkDigit1 = 11 - (sum % 11);
		if (checkDigit1 >= 10) {
			checkDigit1 = 0;
		}

		if (Number.parseInt(cleanCPF.charAt(9), 10) !== checkDigit1) {
			return false;
		}

		sum = 0;
		for (let i = 0; i < 10; i++) {
			sum += Number.parseInt(cleanCPF.charAt(i), 10) * (11 - i);
		}

		let checkDigit2 = 11 - (sum % 11);
		if (checkDigit2 >= 10) {
			checkDigit2 = 0;
		}

		return Number.parseInt(cleanCPF.charAt(10), 10) === checkDigit2;
	}

	async exportPatientData(
		patientId: string,
		tenantId: string
	): Promise<{ data?: Record<string, unknown>; error?: string }> {
		try {
			// LGPD data portability requirement
			const [patientResult, appointmentsResult, treatmentsResult, consentsResult] = await Promise.all([
				this.getPatient(patientId, tenantId),
				this.getPatientAppointments(patientId, tenantId),
				this.getPatientTreatments(patientId, tenantId),
				this.getPatientConsents(patientId, tenantId),
			]);

			if (patientResult.error) {
				return { error: patientResult.error };
			}

			const exportData = {
				patient: patientResult.patient,
				appointments: appointmentsResult.appointments || [],
				treatments: treatmentsResult.treatments || [],
				consents: consentsResult.consents || [],
				exported_at: new Date().toISOString(),
			};

			return { data: exportData };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Failed to export patient data",
			};
		}
	}
}

export const patientService = new PatientService();
