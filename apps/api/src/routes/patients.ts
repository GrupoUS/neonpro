/**
 * Patient Management API Routes for NeonPro Healthcare
 * Implements CRUD operations with clinic-level data isolation
 * Healthcare compliance: LGPD + ANVISA + CFM + Multi-tenant security
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getDatabase } from "../lib/database";
import type { AuthenticatedUser, CreatePatientRequest, PatientListParams } from "../types/api";
import { createErrorResponse, createPaginatedResponse, createSuccessResponse } from "../types/api";

const patients = new Hono();

// Validation schemas
const createPatientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve conter 11 dígitos"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  gender: z.enum(["M", "F", "O"], { errorMap: () => ({ message: "Gênero deve ser M, F ou O" }) }),
  address: z.object({
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().length(2, "Estado deve ter 2 caracteres"),
    zip_code: z.string().regex(/^\d{8}$/, "CEP deve conter 8 dígitos"),
  }).optional(),
  emergency_contact: z.object({
    name: z.string().min(1, "Nome do contato de emergência é obrigatório"),
    phone: z.string().min(10, "Telefone do contato deve ter pelo menos 10 dígitos"),
    relationship: z.string().min(1, "Relacionamento é obrigatório"),
  }).optional(),
  medical_history: z.object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
});

const patientListSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
  age_min: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  age_max: z.string().transform(Number).pipe(z.number().max(150)).optional(),
  created_after: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  created_before: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Helper functions
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function validateCPF(cpf: string): boolean {
  // Remove any non-digit characters
  const cleanCPF = cpf.replace(/\D/g, "");

  // Check if it has 11 digits
  if (cleanCPF.length !== 11) return false;

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

// Routes

/**
 * GET /patients - List patients with filtering and pagination
 */
patients.get("/", zValidator("query", patientListSchema), async (c) => {
  try {
    const user = c.get("user") as AuthenticatedUser;
    const params = c.req.valid("query") as PatientListParams;

    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const db = getDatabase();

    // Build query with filters
    let query = db
      .from("patients")
      .select("*", { count: "exact" })
      .eq("clinic_id", user.clinic_id)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,cpf.ilike.%${params.search}%,email.ilike.%${params.search}%`,
      );
    }

    if (params.gender) {
      query = query.eq("gender", params.gender);
    }

    if (params.created_after) {
      query = query.gte("created_at", params.created_after);
    }

    if (params.created_before) {
      query = query.lte("created_at", params.created_before);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching patients:", error);
      return c.json(createErrorResponse("Erro ao buscar pacientes"), 500);
    }

    // Filter by age if specified
    let filteredData = data || [];
    if (params.age_min !== undefined || params.age_max !== undefined) {
      filteredData = filteredData.filter((patient) => {
        const age = calculateAge(patient.birth_date);
        if (params.age_min !== undefined && age < params.age_min) return false;
        if (params.age_max !== undefined && age > params.age_max) return false;
        return true;
      });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response = createPaginatedResponse(filteredData, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });

    return c.json(response);
  } catch (error) {
    console.error("Unexpected error in GET /patients:", error);
    return c.json(createErrorResponse("Erro interno do servidor"), 500);
  }
});

/**
 * GET /patients/:id - Get patient by ID
 */
patients.get("/:id", async (c) => {
  try {
    const user = c.get("user") as AuthenticatedUser;
    const patientId = c.req.param("id");

    if (!patientId) {
      return c.json(createErrorResponse("ID do paciente é obrigatório"), 400);
    }

    const db = getDatabase();
    const { data, error } = await db
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .eq("clinic_id", user.clinic_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return c.json(createErrorResponse("Paciente não encontrado"), 404);
      }
      console.error("Error fetching patient:", error);
      return c.json(createErrorResponse("Erro ao buscar paciente"), 500);
    }

    return c.json(createSuccessResponse(data));
  } catch (error) {
    console.error("Unexpected error in GET /patients/:id:", error);
    return c.json(createErrorResponse("Erro interno do servidor"), 500);
  }
});

/**
 * POST /patients - Create new patient
 */
patients.post("/", zValidator("json", createPatientSchema), async (c) => {
  try {
    const user = c.get("user") as AuthenticatedUser;
    const patientData = c.req.valid("json") as CreatePatientRequest;

    // Validate CPF
    if (!validateCPF(patientData.cpf)) {
      return c.json(createErrorResponse("CPF inválido"), 400);
    }

    const db = getDatabase();

    // Check if CPF already exists in the clinic
    const { data: existingPatient } = await db
      .from("patients")
      .select("id")
      .eq("cpf", patientData.cpf)
      .eq("clinic_id", user.clinic_id)
      .single();

    if (existingPatient) {
      return c.json(createErrorResponse("Paciente com este CPF já existe na clínica"), 409);
    }

    // Create patient
    const { data, error } = await db
      .from("patients")
      .insert({
        ...patientData,
        clinic_id: user.clinic_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating patient:", error);
      return c.json(createErrorResponse("Erro ao criar paciente"), 500);
    }

    return c.json(createSuccessResponse(data, "Paciente criado com sucesso"), 201);
  } catch (error) {
    console.error("Unexpected error in POST /patients:", error);
    return c.json(createErrorResponse("Erro interno do servidor"), 500);
  }
});

export default patients;
import { HTTPException } from "hono/http-exception";
import { createClient } from "@supabase/supabase-js";
import { HTTP_STATUS } from "../lib/constants.js";

export const patientRoutes = new Hono();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication middleware for all patient routes
patientRoutes.use("*", async (c, next) => {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json(
      { error: "Authentication required" },
      HTTP_STATUS.UNAUTHORIZED,
    );
  }
  await next();
});

// GET /patients - List patients with pagination and filtering
patientRoutes.get("/", async (c) => {
  try {
    const clinicId = c.req.query("clinic_id");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const search = c.req.query("search");
    const status = c.req.query("status") || "active";

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    let query = supabase
      .from("patients")
      .select(`
        id,
        medical_record_number,
        given_names,
        family_name,
        full_name,
        preferred_name,
        phone_primary,
        email,
        birth_date,
        gender,
        patient_status,
        is_active,
        lgpd_consent_given,
        data_consent_status,
        no_show_risk_score,
        total_appointments,
        last_visit_date,
        next_appointment_date,
        created_at,
        updated_at
      `)
      .eq("clinic_id", clinicId)
      .eq("patient_status", status)
      .eq("is_active", true)
      .range((page - 1) * limit, page * limit - 1)
      .order("full_name", { ascending: true });

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone_primary.ilike.%${search}%`);
    }

    const { data: patients, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to fetch patients" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({
      patients: patients || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Patients listing error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// GET /patients/:id - Get patient by ID
patientRoutes.get("/:id", async (c) => {
  try {
    const patientId = c.req.param("id");
    const clinicId = c.req.query("clinic_id");

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { data: patient, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .single();

    if (error || !patient) {
      return c.json(
        { error: "Patient not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return c.json({ patient });
  } catch (error) {
    console.error("Patient fetch error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /patients - Create new patient
patientRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body) {
      return c.json(
        { error: "Invalid JSON payload" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate required fields
    const { 
      clinic_id,
      given_names,
      family_name,
      lgpd_consent_given,
      data_consent_status = "given",
      email,
      phone_primary
    } = body;

    if (!clinic_id || !given_names || !family_name || !lgpd_consent_given) {
      return c.json(
        { error: "Missing required fields: clinic_id, given_names, family_name, lgpd_consent_given" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    if (!lgpd_consent_given) {
      return c.json(
        { error: "LGPD consent is required for patient registration" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // Generate medical record number
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const medical_record_number = `MRN-${timestamp}-${random}`.toUpperCase();

    // Generate full name
    const givenNamesStr = Array.isArray(given_names) ? given_names.join(" ") : given_names;
    const full_name = `${givenNamesStr} ${family_name}`;

    const patientData = {
      clinic_id,
      medical_record_number,
      given_names: Array.isArray(given_names) ? given_names : [given_names],
      family_name,
      full_name,
      preferred_name: body.preferred_name || null,
      phone_primary: phone_primary || null,
      phone_secondary: body.phone_secondary || null,
      email: email || null,
      address_line1: body.address_line1 || null,
      address_line2: body.address_line2 || null,
      city: body.city || null,
      state: body.state || null,
      postal_code: body.postal_code || null,
      country: body.country || "BR",
      birth_date: body.birth_date || null,
      gender: body.gender || null,
      marital_status: body.marital_status || null,
      cpf: body.cpf || null,
      rg: body.rg || null,
      passport_number: body.passport_number || null,
      preferred_contact_method: body.preferred_contact_method || "phone",
      blood_type: body.blood_type || null,
      allergies: body.allergies || null,
      chronic_conditions: body.chronic_conditions || null,
      current_medications: body.current_medications || null,
      insurance_provider: body.insurance_provider || null,
      insurance_number: body.insurance_number || null,
      insurance_plan: body.insurance_plan || null,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      emergency_contact_relationship: body.emergency_contact_relationship || null,
      lgpd_consent_given: true,
      lgpd_consent_version: "1.0",
      data_consent_status,
      data_consent_date: new Date().toISOString(),
      marketing_consent: body.marketing_consent || false,
      research_consent: body.research_consent || false,
      communication_preferences: body.communication_preferences || {},
      patient_status: "active",
      registration_source: body.registration_source || "manual",
      patient_notes: body.patient_notes || null,
      nationality: body.nationality || "brasileira",
      is_active: true,
      created_by: body.created_by || null
    };

    const { data: patient, error } = await supabase
      .from("patients")
      .insert([patientData])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      if (error.code === "23505") { // Unique violation
        return c.json(
          { error: "Patient with this information already exists" },
          HTTP_STATUS.CONFLICT,
        );
      }
      return c.json(
        { error: "Failed to create patient" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Patient created successfully", 
      patient 
    }, HTTP_STATUS.CREATED);

  } catch (error) {
    console.error("Patient creation error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// PUT /patients/:id - Update patient
patientRoutes.put("/:id", async (c) => {
  try {
    const patientId = c.req.param("id");
    const body = await c.req.json().catch(() => null);

    if (!body) {
      return c.json(
        { error: "Invalid JSON payload" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { clinic_id } = body;

    if (!clinic_id) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Check if patient exists
    const { data: existingPatient, error: fetchError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("clinic_id", clinic_id)
      .eq("is_active", true)
      .single();

    if (fetchError || !existingPatient) {
      return c.json(
        { error: "Patient not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Prepare update data (only allow certain fields to be updated)
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: body.updated_by || null
    };

    // Allow updating specific fields
    const allowedFields = [
      'preferred_name', 'phone_primary', 'phone_secondary', 'email',
      'address_line1', 'address_line2', 'city', 'state', 'postal_code',
      'marital_status', 'preferred_contact_method', 'blood_type',
      'allergies', 'chronic_conditions', 'current_medications',
      'insurance_provider', 'insurance_number', 'insurance_plan',
      'emergency_contact_name', 'emergency_contact_phone', 
      'emergency_contact_relationship', 'marketing_consent',
      'research_consent', 'communication_preferences', 'patient_notes'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update full_name if given_names or family_name changed
    if (body.given_names || body.family_name) {
      const { data: current } = await supabase
        .from("patients")
        .select("given_names, family_name")
        .eq("id", patientId)
        .single();

      const givenNames = body.given_names || current?.given_names || [];
      const familyName = body.family_name || current?.family_name || "";
      
      if (body.given_names) {
        updateData.given_names = Array.isArray(body.given_names) ? body.given_names : [body.given_names];
      }
      if (body.family_name) {
        updateData.family_name = body.family_name;
      }

      const givenNamesStr = Array.isArray(givenNames) ? givenNames.join(" ") : givenNames;
      updateData.full_name = `${givenNamesStr} ${familyName}`;
    }

    const { data: patient, error } = await supabase
      .from("patients")
      .update(updateData)
      .eq("id", patientId)
      .eq("clinic_id", clinic_id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to update patient" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Patient updated successfully", 
      patient 
    });

  } catch (error) {
    console.error("Patient update error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// DELETE /patients/:id - Soft delete patient (deactivate)
patientRoutes.delete("/:id", async (c) => {
  try {
    const patientId = c.req.param("id");
    const clinicId = c.req.query("clinic_id");

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Check if patient exists
    const { data: existingPatient, error: fetchError } = await supabase
      .from("patients")
      .select("id, full_name")
      .eq("id", patientId)
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .single();

    if (fetchError || !existingPatient) {
      return c.json(
        { error: "Patient not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Soft delete (deactivate) instead of hard delete for LGPD compliance
    const { error } = await supabase
      .from("patients")
      .update({ 
        is_active: false, 
        patient_status: "inactive",
        updated_at: new Date().toISOString()
      })
      .eq("id", patientId)
      .eq("clinic_id", clinicId);

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to deactivate patient" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Patient deactivated successfully",
      patient_id: patientId,
      patient_name: existingPatient.full_name
    });

  } catch (error) {
    console.error("Patient deletion error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// GET /patients/:id/appointments - Get patient appointments
patientRoutes.get("/:id/appointments", async (c) => {
  try {
    const patientId = c.req.param("id");
    const clinicId = c.req.query("clinic_id");
    const status = c.req.query("status");

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    let query = supabase
      .from("appointments")
      .select(`
        id,
        status,
        start_time,
        end_time,
        notes,
        priority,
        service_type_id,
        professional_id,
        room_id,
        created_at
      `)
      .eq("patient_id", patientId)
      .eq("clinic_id", clinicId)
      .order("start_time", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to fetch patient appointments" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ appointments: appointments || [] });

  } catch (error) {
    console.error("Patient appointments fetch error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});
