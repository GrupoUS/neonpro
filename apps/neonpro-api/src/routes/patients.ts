import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  type CreatePatient,
  CreatePatientSchema,
  PatientDataExportSchema,
  PatientListResponseSchema,
  type PatientQuery,
  PatientQuerySchema,
  PatientResponseSchema,
  type UpdatePatient,
  UpdatePatientSchema,
} from "../schemas/patient";
import { generateMedicalRecordNumber } from "../utils/healthcare";

const patientsRoutes: FastifyPluginAsync = async (fastify) => {
  // List patients with pagination and search
  fastify.get(
    "/",
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(["doctor", "nurse", "admin", "receptionist"]),
      ],
      schema: {
        description: "List patients with pagination, search, and filtering",
        tags: ["patients"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        querystring: PatientQuerySchema,
        response: {
          200: PatientListResponseSchema,
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const query = request.query as PatientQuery;
      const {
        page = 1,
        limit = 20,
        search,
        status = "active",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = query;

      try {
        // Build Supabase query with RLS automatic tenant filtering
        let supabaseQuery = request.supabaseClient
          .from("patients")
          .select("*", { count: "exact" })
          .eq("tenant_id", request.tenantId);

        // Apply status filter
        if (status !== "all") {
          supabaseQuery = supabaseQuery.eq("is_active", status === "active");
        }

        // Apply search filter
        if (search) {
          supabaseQuery = supabaseQuery.or(
            `name.ilike.%${search}%,email.ilike.%${search}%,medical_record_number.ilike.%${search}%`,
          );
        }

        // Apply sorting
        supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination
        const offset = (page - 1) * limit;
        supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

        const { data: patients, error, count } = await supabaseQuery;

        if (error) {
          fastify.log.error({ error, tenantId: request.tenantId }, "Failed to fetch patients");
          throw new Error("Failed to fetch patients");
        }

        // Calculate pagination metadata
        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        const response = {
          patients: patients || [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        };

        // Audit log for LGPD compliance
        request.auditLog("patients_listed", {
          count: patients?.length || 0,
          filters: { search, status, sortBy, sortOrder },
          pagination: { page, limit },
        });

        return response;
      } catch (error) {
        fastify.log.error({ error, tenantId: request.tenantId }, "Error listing patients");
        throw new Error(error instanceof Error ? error.message : "Failed to list patients");
      }
    },
  ); // Get single patient by ID
  fastify.get(
    "/:id",
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(["doctor", "nurse", "admin", "receptionist"]),
      ],
      schema: {
        description: "Get patient by ID",
        tags: ["patients"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
        }),
        response: {
          200: PatientResponseSchema,
          404: Type.Object({ error: Type.String() }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const { data: patient, error } = await request.supabaseClient
          .from("patients")
          .select("*")
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .single();

        if (error || !patient) {
          reply.code(404);
          return { error: "Patient not found" };
        }

        // Audit log for LGPD compliance
        request.auditLog("patient_viewed", {
          patientId: id,
          patientName: patient.name,
        });

        return patient;
      } catch (error) {
        fastify.log.error(
          { error, patientId: id, tenantId: request.tenantId },
          "Error fetching patient",
        );
        throw new Error("Failed to fetch patient");
      }
    },
  ); // Create new patient
  fastify.post(
    "/",
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(["doctor", "nurse", "admin", "receptionist"]),
      ],
      schema: {
        description: "Create new patient with LGPD consent",
        tags: ["patients"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        body: CreatePatientSchema,
        response: {
          201: PatientResponseSchema,
          400: Type.Object({
            error: Type.String(),
            details: Type.Optional(Type.Array(Type.String())),
          }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const patientData = request.body as CreatePatient;

      try {
        // Generate medical record number (ANS compliant format)
        const medicalRecordNumber = generateMedicalRecordNumber();

        // Prepare patient data with system fields
        const newPatient = {
          ...patientData,
          medical_record_number: medicalRecordNumber,
          tenant_id: request.tenantId,
          created_by: request.user.id,
          lgpd_consent: {
            data_processing: true, // Required for healthcare
            marketing: false,
            data_sharing: false,
            consent_date: new Date().toISOString(),
            consent_version: "1.0",
          },
          is_active: true,
        };

        const { data: patient, error } = await request.supabaseClient
          .from("patients")
          .insert(newPatient)
          .select()
          .single();

        if (error) {
          fastify.log.error({ error, tenantId: request.tenantId }, "Failed to create patient");
          throw new Error(`Failed to create patient: ${error.message}`);
        }

        // Audit log for LGPD compliance
        request.auditLog("patient_created", {
          patientId: patient.id,
          patientName: patient.name,
          medicalRecordNumber: patient.medical_record_number,
        });

        reply.code(201);
        return patient;
      } catch (error) {
        fastify.log.error({ error, tenantId: request.tenantId }, "Error creating patient");
        throw new Error(error instanceof Error ? error.message : "Failed to create patient");
      }
    },
  ); // Update patient
  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["doctor", "nurse", "admin"])],
      schema: {
        description: "Update patient information",
        tags: ["patients"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
        }),
        body: UpdatePatientSchema,
        response: {
          200: PatientResponseSchema,
          404: Type.Object({ error: Type.String() }),
          400: Type.Object({ error: Type.String() }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const updateData = request.body as UpdatePatient;

      try {
        // First, verify patient exists and belongs to tenant
        const { data: existingPatient, error: fetchError } = await request.supabaseClient
          .from("patients")
          .select("id, name")
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .single();

        if (fetchError || !existingPatient) {
          reply.code(404);
          return { error: "Patient not found" };
        }

        // Prepare update data with metadata
        const patientUpdate = {
          ...updateData,
          updated_at: new Date().toISOString(),
          updated_by: request.user.id,
        };

        const { data: updatedPatient, error } = await request.supabaseClient
          .from("patients")
          .update(patientUpdate)
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .select()
          .single();

        if (error) {
          fastify.log.error(
            { error, patientId: id, tenantId: request.tenantId },
            "Failed to update patient",
          );
          throw new Error(`Failed to update patient: ${error.message}`);
        }

        // Audit log for LGPD compliance
        request.auditLog("patient_updated", {
          patientId: id,
          patientName: updatedPatient.name,
          updatedFields: Object.keys(updateData),
        });

        return updatedPatient;
      } catch (error) {
        fastify.log.error(
          { error, patientId: id, tenantId: request.tenantId },
          "Error updating patient",
        );
        throw new Error(error instanceof Error ? error.message : "Failed to update patient");
      }
    },
  ); // Soft delete patient (LGPD compliant)
  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin"])],
      schema: {
        description: "Soft delete patient (LGPD compliant deactivation)",
        tags: ["patients"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
        }),
        response: {
          200: Type.Object({
            message: Type.String(),
            patientId: Type.String({ format: "uuid" }),
            deactivatedAt: Type.String({ format: "date-time" }),
          }),
          404: Type.Object({ error: Type.String() }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        // First, verify patient exists and belongs to tenant
        const { data: existingPatient, error: fetchError } = await request.supabaseClient
          .from("patients")
          .select("id, name, is_active")
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .single();

        if (fetchError || !existingPatient) {
          reply.code(404);
          return { error: "Patient not found" };
        }

        if (!existingPatient.is_active) {
          return {
            message: "Patient already deactivated",
            patientId: id,
            deactivatedAt: new Date().toISOString(),
          };
        }

        // Soft delete (deactivate) instead of hard delete for LGPD compliance
        const deactivatedAt = new Date().toISOString();
        const { error } = await request.supabaseClient
          .from("patients")
          .update({
            is_active: false,
            deactivated_at: deactivatedAt,
            deactivated_by: request.user.id,
          })
          .eq("id", id)
          .eq("tenant_id", request.tenantId);

        if (error) {
          fastify.log.error(
            { error, patientId: id, tenantId: request.tenantId },
            "Failed to deactivate patient",
          );
          throw new Error(`Failed to deactivate patient: ${error.message}`);
        }

        // Audit log for LGPD compliance
        request.auditLog("patient_deactivated", {
          patientId: id,
          patientName: existingPatient.name,
          reason: "Administrative deactivation",
          lgpdCompliance: true,
        });

        return {
          message: "Patient successfully deactivated",
          patientId: id,
          deactivatedAt,
        };
      } catch (error) {
        fastify.log.error(
          { error, patientId: id, tenantId: request.tenantId },
          "Error deactivating patient",
        );
        throw new Error(error instanceof Error ? error.message : "Failed to deactivate patient");
      }
    },
  ); // LGPD Data Export - Patient's right to data portability
  fastify.get(
    "/:id/export",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin", "patient"])],
      schema: {
        description: "Export complete patient data for LGPD compliance",
        tags: ["patients", "lgpd"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
        }),
        response: {
          200: PatientDataExportSchema,
          404: Type.Object({ error: Type.String() }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        // Verify patient exists and user has permission
        const { data: patient, error: patientError } = await request.supabaseClient
          .from("patients")
          .select("*")
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .single();

        if (patientError || !patient) {
          reply.code(404);
          return { error: "Patient not found" };
        }

        // For patient role, ensure they can only export their own data
        if (request.user.role === "patient" && request.user.id !== patient.id) {
          reply.code(403);
          return { error: "Access denied - can only export own data" };
        }

        // Fetch medical history
        const { data: medicalHistory = [] } = await request.supabaseClient
          .from("medical_records")
          .select(`
          id,
          created_at as date,
          description,
          provider_id,
          providers!inner(name)
        `)
          .eq("patient_id", id)
          .eq("tenant_id", request.tenantId)
          .order("created_at", { ascending: false });

        // Fetch appointments
        const { data: appointments = [] } = await request.supabaseClient
          .from("appointments")
          .select(`
          id,
          appointment_date as date,
          appointment_type as type,
          status,
          provider_id,
          providers!inner(name)
        `)
          .eq("patient_id", id)
          .eq("tenant_id", request.tenantId)
          .order("appointment_date", { ascending: false });

        // Prepare export data
        const exportData = {
          patient,
          medicalHistory: medicalHistory.map((record) => ({
            id: record.id,
            date: record.date,
            description: record.description,
            providerId: record.provider_id,
            providerName: record.providers?.name || "Unknown",
          })),
          appointments: appointments.map((apt) => ({
            id: apt.id,
            date: apt.date,
            type: apt.type,
            status: apt.status,
            providerId: apt.provider_id,
            providerName: apt.providers?.name || "Unknown",
          })),
          exportMetadata: {
            exportedAt: new Date().toISOString(),
            exportedBy: request.user.id,
            dataRetentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 7 years
            lgpdCompliance: true,
          },
        };

        // Audit log for LGPD compliance
        request.auditLog("patient_data_exported", {
          patientId: id,
          exportedBy: request.user.id,
          exportType: "full_data_export",
          lgpdCompliance: true,
          dataCategories: ["personal_data", "medical_history", "appointments"],
        });

        return exportData;
      } catch (error) {
        fastify.log.error(
          { error, patientId: id, tenantId: request.tenantId },
          "Error exporting patient data",
        );
        throw new Error(error instanceof Error ? error.message : "Failed to export patient data");
      }
    },
  );
};

export default patientsRoutes;
