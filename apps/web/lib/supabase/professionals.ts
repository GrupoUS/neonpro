import { createClient } from "@/app/utils/supabase/server";

// Types
type Professional = {
	id: string;
	given_name: string;
	family_name: string;
	email: string;
	phone?: string;
	specialty?: string;
	license_number?: string;
	status: "active" | "inactive" | "suspended";
	created_at: string;
	updated_at: string;
};

type ProfessionalCredential = {
	id: string;
	professional_id: string;
	credential_type: string;
	issuing_authority: string;
	credential_number: string;
	issue_date: string;
	expiry_date?: string;
	verified: boolean;
	created_at: string;
	updated_at: string;
};

type ProfessionalService = {
	id: string;
	professional_id: string;
	service_name: string;
	description?: string;
	price?: number;
	duration_minutes?: number;
	active: boolean;
	created_at: string;
	updated_at: string;
};

type PerformanceMetric = {
	id: string;
	professional_id: string;
	metric_type: string;
	value: number;
	period_start: string;
	period_end: string;
	created_at: string;
	updated_at: string;
}; // Professional Management Functions

export async function createProfessional(
	data: Omit<Professional, "id" | "created_at" | "updated_at">
): Promise<Professional> {
	const supabase = createClient();

	const { data: result, error } = await supabase.from("professionals").insert(data).select().single();

	if (error) {
		throw new Error(`Database error: ${error.message}`);
	}

	return result;
}

export async function updateProfessional(id: string, data: Partial<Professional>): Promise<Professional> {
	const supabase = createClient();

	const { data: result, error } = await supabase.from("professionals").update(data).eq("id", id).select().single();

	if (error) {
		throw new Error(`Update failed: ${error.message}`);
	}

	if (!result) {
		throw new Error("Professional not found");
	}

	return result;
}

export async function deleteProfessional(id: string): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase.from("professionals").delete().eq("id", id);

	if (error) {
		throw new Error(`Deletion failed: ${error.message}`);
	}
}

export async function getProfessionals(options?: {
	status?: Professional["status"];
	limit?: number;
	offset?: number;
	orderBy?: string;
	fields?: string[];
}): Promise<Professional[]> {
	const supabase = createClient();

	let query = supabase.from("professionals").select(options?.fields?.join(",") || "*");

	if (options?.status) {
		query = query.eq("status", options.status);
	}

	if (options?.orderBy) {
		query = query.order(options.orderBy);
	}

	if (options?.limit) {
		query = query.limit(options.limit);
	}

	if (options?.offset) {
		query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
	}

	const { data, error } = await query;

	if (error) {
		throw new Error(`Fetch failed: ${error.message}`);
	}

	return data || [];
}

export async function getProfessionalById(id: string): Promise<Professional | null> {
	const supabase = createClient();

	const { data, error } = await supabase.from("professionals").select("*").eq("id", id).single();

	if (error) {
		if (error.code === "PGRST116") {
			return null; // Professional not found
		}
		throw new Error(`Fetch failed: ${error.message}`);
	}

	return data;
} // Credentials Management Functions

export async function getProfessionalCredentials(professionalId: string): Promise<ProfessionalCredential[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("professional_credentials")
		.select("*")
		.eq("professional_id", professionalId)
		.order("issue_date", { ascending: false });

	if (error) {
		throw new Error(`Fetch failed: ${error.message}`);
	}

	return data || [];
}

export async function createProfessionalCredential(
	data: Omit<ProfessionalCredential, "id" | "created_at" | "updated_at">
): Promise<ProfessionalCredential> {
	const supabase = createClient();

	const { data: result, error } = await supabase.from("professional_credentials").insert(data).select().single();

	if (error) {
		throw new Error(`Creation failed: ${error.message}`);
	}

	return result;
}

export async function updateProfessionalCredential(
	id: string,
	data: Partial<ProfessionalCredential>
): Promise<ProfessionalCredential> {
	const supabase = createClient();

	const { data: result, error } = await supabase
		.from("professional_credentials")
		.update(data)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		throw new Error(`Update failed: ${error.message}`);
	}

	return result;
}
export async function deleteProfessionalCredential(id: string): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase.from("professional_credentials").delete().eq("id", id);

	if (error) {
		throw new Error(`Deletion failed: ${error.message}`);
	}
}

export async function verifyCredential(id: string): Promise<ProfessionalCredential> {
	const supabase = createClient();

	const { data: result, error } = await supabase
		.from("professional_credentials")
		.update({ verified: true, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();

	if (error) {
		throw new Error(`Verification failed: ${error.message}`);
	}

	return result;
}

// Services Management Functions

export async function getProfessionalServices(professionalId: string): Promise<ProfessionalService[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("professional_services")
		.select("*")
		.eq("professional_id", professionalId)
		.order("service_name");

	if (error) {
		throw new Error(`Fetch failed: ${error.message}`);
	}

	return data || [];
}
export async function createProfessionalService(
	data: Omit<ProfessionalService, "id" | "created_at" | "updated_at">
): Promise<ProfessionalService> {
	const supabase = createClient();

	const { data: result, error } = await supabase.from("professional_services").insert(data).select().single();

	if (error) {
		throw new Error(`Creation failed: ${error.message}`);
	}

	return result;
}

export async function updateProfessionalService(
	id: string,
	data: Partial<ProfessionalService>
): Promise<ProfessionalService> {
	const supabase = createClient();

	const { data: result, error } = await supabase
		.from("professional_services")
		.update(data)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		throw new Error(`Update failed: ${error.message}`);
	}

	return result;
}

export async function deleteProfessionalService(id: string): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase.from("professional_services").delete().eq("id", id);

	if (error) {
		throw new Error(`Deletion failed: ${error.message}`);
	}
} // Performance Metrics Functions

export async function getProfessionalPerformanceMetrics(
	professionalId: string,
	options?: {
		startDate?: string;
		endDate?: string;
		metricType?: string;
	}
): Promise<PerformanceMetric[]> {
	const supabase = createClient();

	let query = supabase.from("performance_metrics").select("*").eq("professional_id", professionalId);

	if (options?.startDate) {
		query = query.gte("period_start", options.startDate);
	}

	if (options?.endDate) {
		query = query.lte("period_end", options.endDate);
	}

	if (options?.metricType) {
		query = query.eq("metric_type", options.metricType);
	}

	const { data, error } = await query.order("period_start", {
		ascending: false,
	});

	if (error) {
		throw new Error(`Fetch failed: ${error.message}`);
	}

	return data || [];
}

export async function addPerformanceMetric(
	data: Omit<PerformanceMetric, "id" | "created_at" | "updated_at">
): Promise<PerformanceMetric> {
	const supabase = createClient();

	const { data: result, error } = await supabase.from("performance_metrics").insert(data).select().single();

	if (error) {
		throw new Error(`Creation failed: ${error.message}`);
	}

	return result;
}
export async function updatePerformanceMetric(
	id: string,
	data: Partial<PerformanceMetric>
): Promise<PerformanceMetric> {
	const supabase = createClient();

	const { data: result, error } = await supabase
		.from("performance_metrics")
		.update(data)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		throw new Error(`Update failed: ${error.message}`);
	}

	return result;
}
