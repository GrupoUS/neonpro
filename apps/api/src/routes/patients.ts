import { Hono } from "hono";
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