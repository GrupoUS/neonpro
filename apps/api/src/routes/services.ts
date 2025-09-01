/**
 * 💄 Services Routes - NeonPro API
 * ==================================
 *
 * Rotas para catálogo de serviços estéticos
 * com validação Zod, categorização e compliance ANVISA.
 */

import { zValidator } from "@hono/zod-validator";
import type { ApiResponse } from "@neonpro/shared/types";
import { Hono } from "hono";
import { z } from "zod";
import { HTTP_STATUS } from "../lib/constants";

// Constants for validation
const MIN_DESCRIPTION_LENGTH = 10;
const MIN_SERVICE_DURATION = 15; // minutes
const MAX_SERVICE_DURATION = 480; // 8 hours in minutes
const DEFAULT_BOOKING_ADVANCE = 90; // days
const MAX_RESULTS_PER_PAGE = 100;
const DEFAULT_RESULTS_PER_PAGE = 10;

// Zod schemas for services
const ServiceCategorySchema = z.enum([
  "facial_treatments",
  "body_treatments",
  "hair_removal",
  "cosmetic_procedures",
  "wellness",
  "consultations",
]);

const CreateServiceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z
    .string()
    .min(MIN_DESCRIPTION_LENGTH, "Descrição deve ter pelo menos 10 caracteres"),
  category: ServiceCategorySchema,
  duration: z.number().min(MIN_SERVICE_DURATION).max(MAX_SERVICE_DURATION), // 15 minutes to 8 hours
  price: z.number().min(0),
  isActive: z.boolean().default(true),

  // ANVISA Compliance
  anvisaCategory: z
    .enum(["cosmetic", "medical_device", "pharmaceutical", "none"])
    .default("none"),
  anvisaRegistration: z.string().optional(),
  requiresLicense: z.boolean().default(false),

  // Professional requirements
  requiredProfessions: z.array(
    z.enum(["dermatologist", "esthetician", "therapist"]),
  ),

  // Additional settings
  maxBookingAdvance: z.number().default(DEFAULT_BOOKING_ADVANCE), // days
  cancellationPolicy: z.string().optional(),
  contraindications: z.array(z.string()).default([]),
  aftercareInstructions: z.string().optional(),
});

const UpdateServiceSchema = CreateServiceSchema.partial();

const ServiceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce
    .number()
    .min(1)
    .max(MAX_RESULTS_PER_PAGE)
    .default(DEFAULT_RESULTS_PER_PAGE),
  search: z.string().optional(),
  category: ServiceCategorySchema.optional(),
  isActive: z.coerce.boolean().optional(),
  profession: z.enum(["dermatologist", "esthetician", "therapist"]).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
});

// Create services router
export const servicesRoutes = new Hono()
  // Authentication middleware
  .use("*", async (c, next) => {
    const auth = c.req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return c.json(
        { error: "UNAUTHORIZED", message: "Token de acesso obrigatório" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }
    await next();
  })
  // 📋 List services
  .get("/", zValidator("query", ServiceQuerySchema), async (c) => {
    const {
      page,
      limit,
      search,
      category,
      isActive,
      profession,
      priceMin,
      priceMax,
    } = c.req.valid("query");

    try {
      // Build query with filters
      let query = supabase
        .from("services")
        .select(`
          id,
          name,
          description,
          category,
          duration,
          price,
          is_active,
          anvisa_category,
          anvisa_registration,
          requires_license,
          required_professions,
          max_booking_advance,
          cancellation_policy,
          contraindications,
          aftercare_instructions,
          created_at,
          updated_at
        `);

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (category) {
        query = query.eq("category", category);
      }
      if (isActive !== undefined) {
        query = query.eq("is_active", isActive);
      }
      if (profession) {
        query = query.contains("required_professions", [profession]);
      }
      if (priceMin !== undefined) {
        query = query.gte("price", priceMin);
      }
      if (priceMax !== undefined) {
        query = query.lte("price", priceMax);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

      const { data: services, error, count } = await query;

      if (error) {
        console.error("Error fetching services:", error);
        return c.json(
          {
            success: false,
            error: "DATABASE_ERROR",
            message: "Erro ao buscar serviços",
          },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      // Transform data to match expected format
      const transformedServices = services?.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        isActive: service.is_active,
        anvisaCategory: service.anvisa_category,
        anvisaRegistration: service.anvisa_registration,
        requiresLicense: service.requires_license,
        requiredProfessions: service.required_professions || [],
        maxBookingAdvance: service.max_booking_advance,
        cancellationPolicy: service.cancellation_policy,
        contraindications: service.contraindications || [],
        aftercareInstructions: service.aftercare_instructions,
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      })) || [];

      return c.json<
        ApiResponse<{
          services: typeof transformedServices;
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>
      >({
        success: true,
        data: {
          services: transformedServices,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      return c.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "SERVICES_FETCH_ERROR",
            message: "Erro ao buscar serviços",
          },
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  })
  // 💄 Get service by ID
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const { data: service, error } = await supabase
        .from("services")
        .select(`
          id,
          name,
          description,
          category,
          duration,
          price,
          is_active,
          anvisa_category,
          anvisa_registration,
          requires_license,
          required_professions,
          max_booking_advance,
          cancellation_policy,
          contraindications,
          aftercare_instructions,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .single();

      if (error || !service) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "SERVICE_NOT_FOUND",
              message: "Serviço não encontrado",
            },
          },
          HTTP_STATUS.NOT_FOUND,
        );
      }

      const transformedService = {
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        isActive: service.is_active,
        anvisaCategory: service.anvisa_category,
        anvisaRegistration: service.anvisa_registration,
        requiresLicense: service.requires_license,
        requiredProfessions: service.required_professions || [],
        maxBookingAdvance: service.max_booking_advance,
        cancellationPolicy: service.cancellation_policy,
        contraindications: service.contraindications || [],
        aftercareInstructions: service.aftercare_instructions,
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      };

      return c.json<ApiResponse<typeof transformedService>>({
        success: true,
        data: transformedService,
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Serviço não encontrado",
        },
        HTTP_STATUS.NOT_FOUND,
      );
    }
  })
  // ✨ Create service
  .post("/", zValidator("json", CreateServiceSchema), async (c) => {
    const serviceData = c.req.valid("json");

    try {
      const { data: service, error } = await supabase
        .from("services")
        .insert({
          name: serviceData.name,
          description: serviceData.description,
          category: serviceData.category,
          duration: serviceData.duration,
          price: serviceData.price,
          is_active: serviceData.isActive,
          anvisa_category: serviceData.anvisaCategory,
          anvisa_registration: serviceData.anvisaRegistration,
          requires_license: serviceData.requiresLicense,
          required_professions: serviceData.requiredProfessions,
          max_booking_advance: serviceData.maxBookingAdvance,
          cancellation_policy: serviceData.cancellationPolicy,
          contraindications: serviceData.contraindications,
          aftercare_instructions: serviceData.aftercareInstructions,
        })
        .select()
        .single();

      if (error) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "SERVICE_CREATION_FAILED",
              message: "Erro ao criar serviço",
              details: error.message,
            },
          },
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      const transformedService = {
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        isActive: service.is_active,
        anvisaCategory: service.anvisa_category,
        anvisaRegistration: service.anvisa_registration,
        requiresLicense: service.requires_license,
        requiredProfessions: service.required_professions || [],
        maxBookingAdvance: service.max_booking_advance,
        cancellationPolicy: service.cancellation_policy,
        contraindications: service.contraindications || [],
        aftercareInstructions: service.aftercare_instructions,
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      };

      return c.json<ApiResponse<typeof transformedService>>({
        success: true,
        data: transformedService,
        message: "Serviço criado com sucesso",
      }, HTTP_STATUS.CREATED);
    } catch {
      return c.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Erro ao criar serviço",
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  })
  // ✏️ Update service
  .put("/:id", zValidator("json", UpdateServiceSchema), async (c) => {
    const id = c.req.param("id");
    const updateData = c.req.valid("json");

    try {
      // Build update object with only provided fields
      const updateFields: Record<string, unknown> = {};

      if (updateData.name !== undefined) {updateFields.name = updateData.name;}
      if (updateData.description !== undefined) {updateFields.description = updateData.description;}
      if (updateData.category !== undefined) {updateFields.category = updateData.category;}
      if (updateData.duration !== undefined) {updateFields.duration = updateData.duration;}
      if (updateData.price !== undefined) {updateFields.price = updateData.price;}
      if (updateData.isActive !== undefined) {updateFields.is_active = updateData.isActive;}
      if (updateData.anvisaCategory !== undefined) {
        updateFields.anvisa_category = updateData.anvisaCategory;
      }
      if (updateData.anvisaRegistration !== undefined) {
        updateFields.anvisa_registration = updateData.anvisaRegistration;
      }
      if (updateData.requiresLicense !== undefined) {
        updateFields.requires_license = updateData.requiresLicense;
      }
      if (updateData.requiredProfessions !== undefined) {
        updateFields.required_professions = updateData.requiredProfessions;
      }
      if (updateData.maxBookingAdvance !== undefined) {
        updateFields.max_booking_advance = updateData.maxBookingAdvance;
      }
      if (updateData.cancellationPolicy !== undefined) {
        updateFields.cancellation_policy = updateData.cancellationPolicy;
      }
      if (updateData.contraindications !== undefined) {
        updateFields.contraindications = updateData.contraindications;
      }
      if (updateData.aftercareInstructions !== undefined) {
        updateFields.aftercare_instructions = updateData.aftercareInstructions;
      }

      const { data: service, error } = await supabase
        .from("services")
        .update(updateFields)
        .eq("id", id)
        .select()
        .single();

      if (error || !service) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "SERVICE_NOT_FOUND",
              message: "Serviço não encontrado",
            },
          },
          HTTP_STATUS.NOT_FOUND,
        );
      }

      const transformedService = {
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        isActive: service.is_active,
        anvisaCategory: service.anvisa_category,
        anvisaRegistration: service.anvisa_registration,
        requiresLicense: service.requires_license,
        requiredProfessions: service.required_professions || [],
        maxBookingAdvance: service.max_booking_advance,
        cancellationPolicy: service.cancellation_policy,
        contraindications: service.contraindications || [],
        aftercareInstructions: service.aftercare_instructions,
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      };

      return c.json<ApiResponse<typeof transformedService>>({
        success: true,
        data: transformedService,
        message: "Serviço atualizado com sucesso",
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Serviço não encontrado",
        },
        HTTP_STATUS.NOT_FOUND,
      );
    }
  })
  // 🗑️ Delete service (soft delete)
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const { data: service, error } = await supabase
        .from("services")
        .update({ is_active: false, deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("is_active", true) // Only delete active services
        .select("id")
        .single();

      if (error || !service) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "SERVICE_NOT_FOUND",
              message: "Serviço não encontrado ou já foi removido",
            },
          },
          HTTP_STATUS.NOT_FOUND,
        );
      }

      return c.json<ApiResponse<{ id: string; }>>({
        success: true,
        data: { id: service.id },
        message: "Serviço removido com sucesso",
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Serviço não encontrado",
        },
        HTTP_STATUS.NOT_FOUND,
      );
    }
  })
  // 📊 Get services by category
  .get("/category/:category", async (c) => {
    const category = c.req.param("category");

    try {
      // Validate category parameter
      const categoryValidation = ServiceCategorySchema.safeParse(category);
      if (!categoryValidation.success) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "INVALID_CATEGORY",
              message: "Categoria inválida",
            },
          },
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      const { data: services, error } = await supabase
        .from("services")
        .select("id, name, description, category, duration, price, is_active, created_at")
        .eq("category", category)
        .eq("is_active", true)
        .order("name");

      if (error) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "DATABASE_ERROR",
              message: "Erro ao buscar serviços",
            },
          },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      const transformedServices = services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        isActive: service.is_active,
        createdAt: service.created_at,
      }));

      return c.json<
        ApiResponse<{
          category: string;
          services: typeof transformedServices;
          count: number;
        }>
      >({
        success: true,
        data: {
          category,
          services: transformedServices,
          count: transformedServices.length,
        },
        message: `Serviços da categoria ${category}`,
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Categoria não encontrada",
        },
        404,
      );
    }
  })
  // 🏥 ANVISA compliance check
  .get("/:id/compliance", async (c) => {
    const id = c.req.param("id");

    try {
      const { data: service, error } = await supabase
        .from("services")
        .select(`
          id,
          name,
          anvisa_category,
          anvisa_registration,
          requires_license,
          is_active,
          service_compliance (
            anvisa_compliant,
            registration_valid,
            last_inspection,
            expiration_date,
            warnings,
            certifications
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error || !service) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "SERVICE_NOT_FOUND",
              message: "Serviço não encontrado",
            },
          },
          HTTP_STATUS.NOT_FOUND,
        );
      }

      // Calculate compliance status based on service data
      const compliance = service.service_compliance?.[0] || {};
      const isAnvisaCompliant = service.anvisa_category !== "none"
        && service.anvisa_registration
        && compliance.registration_valid !== false;

      const complianceData = {
        serviceId: service.id,
        serviceName: service.name,
        anvisaCategory: service.anvisa_category,
        anvisaRegistration: service.anvisa_registration,
        anvisaCompliant: isAnvisaCompliant,
        registrationValid: compliance.registration_valid ?? true,
        licenseRequired: service.requires_license,
        lastInspection: compliance.last_inspection,
        expirationDate: compliance.expiration_date,
        warnings: compliance.warnings || [],
        certifications: compliance.certifications || [],
      };

      return c.json<ApiResponse<typeof complianceData>>({
        success: true,
        data: complianceData,
        message: "Status de compliance ANVISA",
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Dados de compliance não encontrados",
        },
        404,
      );
    }
  });
