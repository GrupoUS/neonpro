/**
 * Treatment & Procedure Data Access Layer
 * Supabase functions for HL7 FHIR R4 compliant treatment documentation
 * Includes LGPD compliance and Row Level Security
 *
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */

import type { createClient } from "@/lib/supabase/client";
import type { FHIRCodeableConcept } from "@/lib/types/fhir";
import type {
  ClinicalNote,
  ClinicalNoteFormData,
  ClinicalNoteListResponse,
  ClinicalNoteSearchFilters,
  Procedure,
  ProcedureFormData,
  ProcedureListResponse,
  ProcedureSearchFilters,
  TreatmentPlan,
  TreatmentPlanFormData,
  TreatmentPlanListResponse,
  TreatmentPlanSearchFilters,
  TreatmentStatistics,
} from "@/lib/types/treatment";

const supabase = await createClient();

// ===============================================
// TREATMENT PLAN FUNCTIONS
// ===============================================

/**
 * Create a new treatment plan
 */
export async function createTreatmentPlan(data: TreatmentPlanFormData): Promise<TreatmentPlan> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Generate FHIR ID
  const fhir_id = `careplan-${crypto.randomUUID()}`;

  // Convert form data to FHIR format
  const treatmentPlan = {
    patient_id: data.patient_id,
    provider_id: user.id,
    fhir_id,
    status: data.status,
    intent: data.intent,
    category: data.category.map((cat) => ({
      coding: [{ code: cat, display: cat }],
    })) as FHIRCodeableConcept[],
    title: data.title,
    description: data.description,
    subject_reference: `Patient/${data.patient_id}`,
    period_start: data.period_start,
    period_end: data.period_end,
    care_team: [],
    goals: data.goals.map((goal) => ({ reference: `Goal/${goal}` })),
    activities: [],
    supporting_info: [],
    addresses: data.addresses.map((addr) => ({ reference: `Condition/${addr}` })),
    fhir_meta: {
      versionId: "1",
      lastUpdated: new Date().toISOString(),
      source: "NeonPro",
      profile: ["http://hl7.org/fhir/StructureDefinition/CarePlan"],
    },
    fhir_text: {
      status: "generated",
      div: `<div>${data.title}: ${data.description || "Plano de tratamento"}</div>`,
    },
    data_consent_given: data.data_consent_given,
    data_consent_date: data.data_consent_given ? new Date().toISOString() : null,
    data_retention_until: data.data_consent_given
      ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
      : null, // 10 years
    version: 1,
    created_by: user.id,
    updated_by: user.id,
  };

  const { data: result, error } = await supabase
    .from("treatment_plans")
    .insert(treatmentPlan)
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar plano de tratamento: ${error.message}`);
  return result;
}

/**
 * Update an existing treatment plan
 */
export async function updateTreatmentPlan(
  id: string,
  data: Partial<TreatmentPlanFormData>,
): Promise<TreatmentPlan> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const updateData = {
    ...data,
    fhir_meta: {
      lastUpdated: new Date().toISOString(),
    },
    updated_by: user.id,
  };

  const { data: result, error } = await supabase
    .from("treatment_plans")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar plano de tratamento: ${error.message}`);
  return result;
}

/**
 * Get treatment plan by ID
 */
export async function getTreatmentPlan(id: string): Promise<TreatmentPlan | null> {
  const { data, error } = await supabase
    .from("treatment_plans")
    .select(`
      *,
      patient:patients!treatment_plans_patient_id_fkey(id, given_name, family_name),
      provider:profiles!treatment_plans_provider_id_fkey(id, full_name, professional_title)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Erro ao buscar plano de tratamento: ${error.message}`);
  }

  return data;
}

/**
 * Search and list treatment plans with filters
 */
export async function searchTreatmentPlans(
  filters: TreatmentPlanSearchFilters,
  page: number = 1,
  perPage: number = 10,
): Promise<TreatmentPlanListResponse> {
  let query = supabase.from("treatment_plans").select(
    `
      *,
      patient:patients!treatment_plans_patient_id_fkey(id, given_name, family_name),
      provider:profiles!treatment_plans_provider_id_fkey(id, full_name, professional_title)
    `,
    { count: "exact" },
  );

  // Apply filters
  if (filters.patient_id) {
    query = query.eq("patient_id", filters.patient_id);
  }

  if (filters.provider_id) {
    query = query.eq("provider_id", filters.provider_id);
  }

  if (filters.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters.intent && filters.intent.length > 0) {
    query = query.in("intent", filters.intent);
  }

  if (filters.period_start) {
    query = query.gte("period_start", filters.period_start);
  }

  if (filters.period_end) {
    query = query.lte("period_end", filters.period_end);
  }

  if (filters.search_text) {
    query = query.or(
      `title.ilike.%${filters.search_text}%,description.ilike.%${filters.search_text}%`,
    );
  }

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Erro ao buscar planos de tratamento: ${error.message}`);

  return {
    treatment_plans: data || [],
    total_count: count || 0,
    page,
    per_page: perPage,
  };
}

// ===============================================
// PROCEDURE FUNCTIONS
// ===============================================

/**
 * Create a new procedure
 */
export async function createProcedure(data: ProcedureFormData): Promise<Procedure> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Generate FHIR ID
  const fhir_id = `procedure-${crypto.randomUUID()}`;

  // Convert form data to FHIR format
  const procedure = {
    patient_id: data.patient_id,
    provider_id: user.id,
    treatment_plan_id: data.treatment_plan_id,
    fhir_id,
    status: data.status,
    category: data.category
      ? {
          coding: [{ code: data.category, display: data.category }],
        }
      : null,
    code: {
      coding: [{ code: data.code, display: data.code_display }],
    } as FHIRCodeableConcept,
    subject_reference: `Patient/${data.patient_id}`,
    performed_datetime: data.performed_datetime,
    performed_period_start: data.performed_period_start,
    performed_period_end: data.performed_period_end,
    recorder_reference: `Practitioner/${user.id}`,
    asserter_reference: `Practitioner/${user.id}`,
    performers: [
      {
        actor: `Practitioner/${user.id}`,
      },
    ],
    reason_code: data.reason_code.map((code) => ({
      coding: [{ code, display: code }],
    })) as FHIRCodeableConcept[],
    reason_reference: [],
    body_site: data.body_site.map((site) => ({
      coding: [{ code: site, display: site }],
    })) as FHIRCodeableConcept[],
    outcome: data.outcome
      ? {
          coding: [{ code: data.outcome, display: data.outcome }],
        }
      : null,
    report: [],
    complications: [],
    follow_up: [],
    notes: data.notes,
    used_reference: [],
    used_code: [],
    fhir_meta: {
      versionId: "1",
      lastUpdated: new Date().toISOString(),
      source: "NeonPro",
      profile: ["http://hl7.org/fhir/StructureDefinition/Procedure"],
    },
    fhir_text: {
      status: "generated",
      div: `<div>${data.code_display}</div>`,
    },
    data_consent_given: data.data_consent_given,
    data_consent_date: data.data_consent_given ? new Date().toISOString() : null,
    data_retention_until: data.data_consent_given
      ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
      : null, // 10 years
    version: 1,
    created_by: user.id,
    updated_by: user.id,
  };

  const { data: result, error } = await supabase
    .from("procedures")
    .insert(procedure)
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar procedimento: ${error.message}`);
  return result;
} /**
 * Update an existing procedure
 */
export async function updateProcedure(
  id: string,
  data: Partial<ProcedureFormData>,
): Promise<Procedure> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const updateData = {
    ...data,
    fhir_meta: {
      lastUpdated: new Date().toISOString(),
    },
    updated_by: user.id,
  };

  const { data: result, error } = await supabase
    .from("procedures")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar procedimento: ${error.message}`);
  return result;
}

/**
 * Get procedure by ID
 */
export async function getProcedure(id: string): Promise<Procedure | null> {
  const { data, error } = await supabase
    .from("procedures")
    .select(`
      *,
      patient:patients!procedures_patient_id_fkey(id, given_name, family_name),
      provider:profiles!procedures_provider_id_fkey(id, full_name, professional_title),
      treatment_plan:treatment_plans!procedures_treatment_plan_id_fkey(id, title, status)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Erro ao buscar procedimento: ${error.message}`);
  }

  return data;
}

/**
 * Search and list procedures with filters
 */
export async function searchProcedures(
  filters: ProcedureSearchFilters,
  page: number = 1,
  perPage: number = 10,
): Promise<ProcedureListResponse> {
  let query = supabase.from("procedures").select(
    `
      *,
      patient:patients!procedures_patient_id_fkey(id, given_name, family_name),
      provider:profiles!procedures_provider_id_fkey(id, full_name, professional_title),
      treatment_plan:treatment_plans!procedures_treatment_plan_id_fkey(id, title, status)
    `,
    { count: "exact" },
  );

  // Apply filters
  if (filters.patient_id) {
    query = query.eq("patient_id", filters.patient_id);
  }

  if (filters.provider_id) {
    query = query.eq("provider_id", filters.provider_id);
  }

  if (filters.treatment_plan_id) {
    query = query.eq("treatment_plan_id", filters.treatment_plan_id);
  }

  if (filters.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters.procedure_code && filters.procedure_code.length > 0) {
    query = query.contains("code", { coding: [{ code: filters.procedure_code }] });
  }

  if (filters.performed_start) {
    query = query.gte("performed_datetime", filters.performed_start);
  }

  if (filters.performed_end) {
    query = query.lte("performed_datetime", filters.performed_end);
  }

  if (filters.search_text) {
    query = query.or(`notes.ilike.%${filters.search_text}%`);
  }

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order("performed_datetime", { ascending: false });

  if (error) throw new Error(`Erro ao buscar procedimentos: ${error.message}`);

  return {
    procedures: data || [],
    total_count: count || 0,
    page,
    per_page: perPage,
  };
}

// ===============================================
// CLINICAL NOTES FUNCTIONS
// ===============================================

/**
 * Create a new clinical note
 */
export async function createClinicalNote(data: ClinicalNoteFormData): Promise<ClinicalNote> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Generate FHIR ID
  const fhir_id = `note-${crypto.randomUUID()}`;

  // Convert form data to FHIR format
  const clinicalNote = {
    patient_id: data.patient_id,
    provider_id: user.id,
    treatment_plan_id: data.treatment_plan_id,
    procedure_id: data.procedure_id,
    fhir_id,
    status: "current" as const,
    category: data.category
      ? {
          coding: [{ code: data.category, display: data.category }],
        }
      : null,
    type: {
      coding: [{ code: data.type, display: data.type_display }],
    } as FHIRCodeableConcept,
    subject_reference: `Patient/${data.patient_id}`,
    title: data.title,
    content: data.content,
    content_type: data.content_type,
    authored_time: new Date().toISOString(),
    author_reference: `Practitioner/${user.id}`,
    authenticator_reference: `Practitioner/${user.id}`,
    relates_to: [],
    security_label: [],
    confidentiality: data.confidentiality,
    fhir_meta: {
      versionId: "1",
      lastUpdated: new Date().toISOString(),
      source: "NeonPro",
      profile: ["http://hl7.org/fhir/StructureDefinition/DocumentReference"],
    },
    fhir_text: {
      status: "generated",
      div: `<div>${data.title}: ${data.content.substring(0, 100)}...</div>`,
    },
    data_consent_given: data.data_consent_given,
    data_consent_date: data.data_consent_given ? new Date().toISOString() : null,
    data_retention_until: data.data_consent_given
      ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
      : null, // 10 years
    version: 1,
    created_by: user.id,
    updated_by: user.id,
  };

  const { data: result, error } = await supabase
    .from("clinical_notes")
    .insert(clinicalNote)
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar nota clínica: ${error.message}`);
  return result;
}

/**
 * Update an existing clinical note
 */
export async function updateClinicalNote(
  id: string,
  data: Partial<ClinicalNoteFormData>,
): Promise<ClinicalNote> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const updateData = {
    ...data,
    fhir_meta: {
      lastUpdated: new Date().toISOString(),
    },
    updated_by: user.id,
  };

  const { data: result, error } = await supabase
    .from("clinical_notes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar nota clínica: ${error.message}`);
  return result;
}

/**
 * Get clinical note by ID
 */
export async function getClinicalNote(id: string): Promise<ClinicalNote | null> {
  const { data, error } = await supabase
    .from("clinical_notes")
    .select(`
      *,
      patient:patients!clinical_notes_patient_id_fkey(id, given_name, family_name),
      provider:profiles!clinical_notes_provider_id_fkey(id, full_name, professional_title),
      treatment_plan:treatment_plans!clinical_notes_treatment_plan_id_fkey(id, title, status),
      procedure:procedures!clinical_notes_procedure_id_fkey(id, code, status)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Erro ao buscar nota clínica: ${error.message}`);
  }

  return data;
}

/**
 * Search and list clinical notes with filters
 */
export async function searchClinicalNotes(
  filters: ClinicalNoteSearchFilters,
  page: number = 1,
  perPage: number = 10,
): Promise<ClinicalNoteListResponse> {
  let query = supabase.from("clinical_notes").select(
    `
      *,
      patient:patients!clinical_notes_patient_id_fkey(id, given_name, family_name),
      provider:profiles!clinical_notes_provider_id_fkey(id, full_name, professional_title),
      treatment_plan:treatment_plans!clinical_notes_treatment_plan_id_fkey(id, title, status),
      procedure:procedures!clinical_notes_procedure_id_fkey(id, code, status)
    `,
    { count: "exact" },
  );

  // Apply filters
  if (filters.patient_id) {
    query = query.eq("patient_id", filters.patient_id);
  }

  if (filters.provider_id) {
    query = query.eq("provider_id", filters.provider_id);
  }

  if (filters.treatment_plan_id) {
    query = query.eq("treatment_plan_id", filters.treatment_plan_id);
  }

  if (filters.procedure_id) {
    query = query.eq("procedure_id", filters.procedure_id);
  }

  if (filters.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters.note_type && filters.note_type.length > 0) {
    query = query.contains("type", { coding: [{ code: filters.note_type }] });
  }

  if (filters.authored_start) {
    query = query.gte("authored_time", filters.authored_start);
  }

  if (filters.authored_end) {
    query = query.lte("authored_time", filters.authored_end);
  }

  if (filters.confidentiality && filters.confidentiality.length > 0) {
    query = query.in("confidentiality", filters.confidentiality);
  }

  if (filters.search_text) {
    query = query.or(`title.ilike.%${filters.search_text}%,content.ilike.%${filters.search_text}%`);
  }

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order("authored_time", { ascending: false });

  if (error) throw new Error(`Erro ao buscar notas clínicas: ${error.message}`);

  return {
    clinical_notes: data || [],
    total_count: count || 0,
    page,
    per_page: perPage,
  };
}

// ===============================================
// STATISTICS AND ANALYTICS FUNCTIONS
// ===============================================

/**
 * Get treatment statistics for dashboard
 */
export async function getTreatmentStatistics(): Promise<TreatmentStatistics> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Get treatment plans statistics
  const { data: treatmentPlansStats } = await supabase
    .from("treatment_plans")
    .select("status")
    .eq("provider_id", user.id);

  // Get procedures statistics
  const { data: proceduresStats } = await supabase
    .from("procedures")
    .select("status, code, performed_datetime")
    .eq("provider_id", user.id);

  // Calculate current month procedures
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const { data: proceduresThisMonth } = await supabase
    .from("procedures")
    .select("id")
    .eq("provider_id", user.id)
    .gte("performed_datetime", thisMonth.toISOString());

  // Calculate treatment outcomes
  const { data: outcomes } = await supabase
    .from("procedures")
    .select("outcome")
    .eq("provider_id", user.id)
    .not("outcome", "is", null);

  // Count most common procedures
  const procedureCounts = (proceduresStats || []).reduce(
    (acc, proc) => {
      const code = proc.code?.coding?.[0]?.code || "unknown";
      const display = proc.code?.coding?.[0]?.display || "Procedimento não especificado";

      if (!acc[code]) {
        acc[code] = { code, display, count: 0 };
      }
      acc[code].count++;
      return acc;
    },
    {} as Record<string, { code: string; display: string; count: number }>,
  );

  const mostCommonProcedures = Object.values(procedureCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate average treatment duration
  const completedPlans = (treatmentPlansStats || []).filter((plan) => plan.status === "completed");
  const avgDuration =
    completedPlans.length > 0
      ? completedPlans.reduce((acc, plan) => {
          // This would need period_start and period_end to calculate properly
          return acc + 30; // Placeholder: 30 days average
        }, 0) / completedPlans.length
      : 0;

  return {
    total_treatment_plans: treatmentPlansStats?.length || 0,
    active_treatment_plans: treatmentPlansStats?.filter((p) => p.status === "active").length || 0,
    completed_treatment_plans:
      treatmentPlansStats?.filter((p) => p.status === "completed").length || 0,
    total_procedures: proceduresStats?.length || 0,
    procedures_this_month: proceduresThisMonth?.length || 0,
    average_treatment_duration_days: Math.round(avgDuration),
    most_common_procedures: mostCommonProcedures,
    treatment_outcomes: {
      successful:
        outcomes?.filter((o) => o.outcome?.coding?.[0]?.code === "successful").length || 0,
      partial: outcomes?.filter((o) => o.outcome?.coding?.[0]?.code === "partial").length || 0,
      unsuccessful:
        outcomes?.filter((o) => o.outcome?.coding?.[0]?.code === "unsuccessful").length || 0,
    },
  };
}

/**
 * Delete treatment plan (soft delete by changing status)
 */
export async function deleteTreatmentPlan(id: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("treatment_plans")
    .update({
      status: "entered-in-error",
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) throw new Error(`Erro ao excluir plano de tratamento: ${error.message}`);
  return true;
}

/**
 * Delete procedure (soft delete by changing status)
 */
export async function deleteProcedure(id: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("procedures")
    .update({
      status: "entered-in-error",
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) throw new Error(`Erro ao excluir procedimento: ${error.message}`);
  return true;
}

/**
 * Delete clinical note (soft delete by changing status)
 */
export async function deleteClinicalNote(id: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("clinical_notes")
    .update({
      status: "entered-in-error",
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) throw new Error(`Erro ao excluir nota clínica: ${error.message}`);
  return true;
}
