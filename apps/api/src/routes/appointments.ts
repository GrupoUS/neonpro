import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createClient } from "@supabase/supabase-js";
import { HTTP_STATUS, RESPONSE_MESSAGES } from "../lib/constants";

export const appointmentRoutes = new Hono();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Valid appointment statuses
const VALID_STATUSES = [
  'scheduled', 'confirmed', 'in_progress', 'completed', 
  'cancelled', 'no_show', 'rescheduled'
];

// Authentication middleware for all appointment routes
appointmentRoutes.use("*", async (c, next) => {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json(
      { error: RESPONSE_MESSAGES.AUTH_REQUIRED },
      HTTP_STATUS.UNAUTHORIZED,
    );
  }
  await next();
});

// GET /appointments - List appointments with filtering and pagination
appointmentRoutes.get("/", async (c) => {
  try {
    const clinicId = c.req.query("clinic_id");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const status = c.req.query("status");
    const professionalId = c.req.query("professional_id");
    const patientId = c.req.query("patient_id");
    const startDate = c.req.query("start_date");
    const endDate = c.req.query("end_date");
    const roomId = c.req.query("room_id");

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
        clinic_id,
        patient_id,
        professional_id,
        service_type_id,
        status,
        start_time,
        end_time,
        notes,
        internal_notes,
        room_id,
        priority,
        reminder_sent_at,
        confirmation_sent_at,
        whatsapp_reminder_sent,
        sms_reminder_sent,
        created_at,
        updated_at,
        patients!inner(
          id,
          full_name,
          phone_primary,
          email
        ),
        professionals!inner(
          id,
          full_name,
          specialty
        )
      `)
      .eq("clinic_id", clinicId)
      .range((page - 1) * limit, page * limit - 1)
      .order("start_time", { ascending: true });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (professionalId) {
      query = query.eq("professional_id", professionalId);
    }
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }
    if (roomId) {
      query = query.eq("room_id", roomId);
    }
    if (startDate) {
      query = query.gte("start_time", startDate);
    }
    if (endDate) {
      query = query.lte("end_time", endDate);
    }

    const { data: appointments, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to fetch appointments" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({
      appointments: appointments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Appointments listing error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// GET /appointments/:id - Get appointment by ID
appointmentRoutes.get("/:id", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const clinicId = c.req.query("clinic_id");

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patients!inner(
          id,
          full_name,
          phone_primary,
          email,
          birth_date,
          gender
        ),
        professionals!inner(
          id,
          full_name,
          specialty,
          phone,
          email
        ),
        service_types!inner(
          id,
          name,
          duration_minutes,
          price
        ),
        rooms(
          id,
          name,
          type
        )
      `)
      .eq("id", appointmentId)
      .eq("clinic_id", clinicId)
      .single();

    if (error || !appointment) {
      return c.json(
        { error: "Appointment not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return c.json({ appointment });
  } catch (error) {
    console.error("Appointment fetch error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /appointments - Create new appointment
appointmentRoutes.post("/", async (c) => {
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
      patient_id,
      professional_id,
      service_type_id,
      start_time,
      end_time
    } = body;

    if (!clinic_id || !patient_id || !professional_id || !service_type_id || !start_time || !end_time) {
      return c.json(
        { error: "Missing required fields: clinic_id, patient_id, professional_id, service_type_id, start_time, end_time" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // Validate dates
    const startDateTime = new Date(start_time);
    const endDateTime = new Date(end_time);
    const now = new Date();

    if (startDateTime <= now) {
      return c.json(
        { error: "Appointment start time must be in the future" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    if (endDateTime <= startDateTime) {
      return c.json(
        { error: "End time must be after start time" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // Check for conflicts with existing appointments
    const { data: conflicts, error: conflictError } = await supabase
      .from("appointments")
      .select("id, start_time, end_time")
      .eq("clinic_id", clinic_id)
      .eq("professional_id", professional_id)
      .neq("status", "cancelled")
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time}),and(start_time.gte.${start_time},end_time.lte.${end_time})`);

    if (conflictError) {
      console.error("Conflict check error:", conflictError);
      return c.json(
        { error: "Failed to check appointment conflicts" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (conflicts && conflicts.length > 0) {
      return c.json(
        { 
          error: "Time slot conflict detected", 
          conflicts: conflicts.map(c => ({
            id: c.id,
            start_time: c.start_time,
            end_time: c.end_time
          }))
        },
        HTTP_STATUS.CONFLICT,
      );
    }

    // Validate that patient exists and is active
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, is_active")
      .eq("id", patient_id)
      .eq("clinic_id", clinic_id)
      .single();

    if (patientError || !patient || !patient.is_active) {
      return c.json(
        { error: "Patient not found or inactive" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // Validate that professional exists and is active
    const { data: professional, error: professionalError } = await supabase
      .from("professionals")
      .select("id, is_active")
      .eq("id", professional_id)
      .eq("clinic_id", clinic_id)
      .single();

    if (professionalError || !professional || !professional.is_active) {
      return c.json(
        { error: "Professional not found or inactive" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const appointmentData = {
      clinic_id,
      patient_id,
      professional_id,
      service_type_id,
      status: body.status || "scheduled",
      start_time,
      end_time,
      notes: body.notes || null,
      internal_notes: body.internal_notes || null,
      room_id: body.room_id || null,
      priority: body.priority || 1,
      created_by: body.created_by || null
    };

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select(`
        *,
        patients!inner(full_name, phone_primary, email),
        professionals!inner(full_name, specialty)
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to create appointment" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Appointment created successfully", 
      appointment 
    }, HTTP_STATUS.CREATED);

  } catch (error) {
    console.error("Appointment creation error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// PUT /appointments/:id - Update appointment
appointmentRoutes.put("/:id", async (c) => {
  try {
    const appointmentId = c.req.param("id");
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

    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("clinic_id", clinic_id)
      .single();

    if (fetchError || !existingAppointment) {
      return c.json(
        { error: "Appointment not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: body.updated_by || null
    };

    // Allow updating specific fields
    const allowedFields = [
      'status', 'start_time', 'end_time', 'notes', 'internal_notes',
      'room_id', 'priority', 'professional_id', 'service_type_id'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Validate status
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return c.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // If updating time, validate dates and conflicts
    if (body.start_time || body.end_time) {
      const newStartTime = body.start_time || existingAppointment.start_time;
      const newEndTime = body.end_time || existingAppointment.end_time;
      
      const startDateTime = new Date(newStartTime);
      const endDateTime = new Date(newEndTime);

      if (endDateTime <= startDateTime) {
        return c.json(
          { error: "End time must be after start time" },
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
        );
      }

      // Check for conflicts (excluding current appointment)
      const professionalId = body.professional_id || existingAppointment.professional_id;
      
      const { data: conflicts, error: conflictError } = await supabase
        .from("appointments")
        .select("id, start_time, end_time")
        .eq("clinic_id", clinic_id)
        .eq("professional_id", professionalId)
        .neq("id", appointmentId)
        .neq("status", "cancelled")
        .or(`and(start_time.lte.${newStartTime},end_time.gt.${newStartTime}),and(start_time.lt.${newEndTime},end_time.gte.${newEndTime}),and(start_time.gte.${newStartTime},end_time.lte.${newEndTime})`);

      if (conflictError) {
        console.error("Conflict check error:", conflictError);
        return c.json(
          { error: "Failed to check appointment conflicts" },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      if (conflicts && conflicts.length > 0) {
        return c.json(
          { 
            error: "Time slot conflict detected", 
            conflicts: conflicts.map(c => ({
              id: c.id,
              start_time: c.start_time,
              end_time: c.end_time
            }))
          },
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId)
      .eq("clinic_id", clinic_id)
      .select(`
        *,
        patients!inner(full_name, phone_primary, email),
        professionals!inner(full_name, specialty)
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to update appointment" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Appointment updated successfully", 
      appointment 
    });

  } catch (error) {
    console.error("Appointment update error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// DELETE /appointments/:id - Cancel appointment (soft delete)
appointmentRoutes.delete("/:id", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const clinicId = c.req.query("clinic_id");

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, status, start_time, patients!inner(full_name)")
      .eq("id", appointmentId)
      .eq("clinic_id", clinicId)
      .single();

    if (fetchError || !existingAppointment) {
      return c.json(
        { error: "Appointment not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (existingAppointment.status === "cancelled") {
      return c.json(
        { error: "Appointment is already cancelled" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Cancel appointment instead of hard delete
    const { error } = await supabase
      .from("appointments")
      .update({ 
        status: "cancelled",
        updated_at: new Date().toISOString()
      })
      .eq("id", appointmentId)
      .eq("clinic_id", clinicId);

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to cancel appointment" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Appointment cancelled successfully",
      appointment_id: appointmentId,
      patient_name: existingAppointment.patients.full_name,
      start_time: existingAppointment.start_time
    });

  } catch (error) {
    console.error("Appointment deletion error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// GET /appointments/availability - Check professional availability
appointmentRoutes.get("/availability", async (c) => {
  try {
    const clinicId = c.req.query("clinic_id");
    const professionalId = c.req.query("professional_id");
    const date = c.req.query("date");

    if (!clinicId || !professionalId || !date) {
      return c.json(
        { error: "clinic_id, professional_id, and date are required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("clinic_id", clinicId)
      .eq("professional_id", professionalId)
      .neq("status", "cancelled")
      .gte("start_time", startOfDay.toISOString())
      .lte("end_time", endOfDay.toISOString())
      .order("start_time");

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to fetch availability" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate available slots (basic implementation - can be enhanced with business hours)
    const businessStart = 8; // 8 AM
    const businessEnd = 18; // 6 PM
    const slotDuration = 30; // 30 minutes
    
    const availableSlots = [];
    const bookedSlots = appointments || [];

    for (let hour = businessStart; hour < businessEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date + `T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

        // Check if slot conflicts with existing appointments
        const hasConflict = bookedSlots.some(appointment => {
          const appointmentStart = new Date(appointment.start_time);
          const appointmentEnd = new Date(appointment.end_time);
          
          return (slotStart < appointmentEnd && slotEnd > appointmentStart);
        });

        if (!hasConflict && slotStart > new Date()) {
          availableSlots.push({
            start_time: slotStart.toISOString(),
            end_time: slotEnd.toISOString()
          });
        }
      }
    }

    return c.json({
      date,
      professional_id: professionalId,
      available_slots: availableSlots,
      booked_slots: bookedSlots
    });

  } catch (error) {
    console.error("Availability check error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /appointments/:id/status - Update appointment status
appointmentRoutes.post("/:id/status", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const body = await c.req.json().catch(() => null);

    if (!body || !body.status) {
      return c.json(
        { error: "Status is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { status, clinic_id, updated_by } = body;

    if (!clinic_id) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return c.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        updated_by
      })
      .eq("id", appointmentId)
      .eq("clinic_id", clinic_id)
      .select("id, status, start_time, patients!inner(full_name)")
      .single();

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to update appointment status" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Appointment status updated successfully", 
      appointment: {
        id: appointment.id,
        status: appointment.status,
        start_time: appointment.start_time,
        patient_name: appointment.patients.full_name
      }
    });

  } catch (error) {
    console.error("Appointment status update error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});