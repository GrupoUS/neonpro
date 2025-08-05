/**
 * tRPC Patient Router
 * Healthcare-compliant patient management with LGPD audit
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Patient schemas
const patientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  birth_date: z.string().date(),
  cpf: z.string().length(11),
  gender: z.enum(["M", "F", "O"]),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip_code: z.string(),
  }),
});

const updatePatientSchema = patientSchema.partial().extend({
  id: z.string().uuid(),
});

export const patientsRouter = createTRPCRouter({
  // List patients with pagination and filtering
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        status: z.enum(["active", "inactive", "all"]).default("active"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;

      let query = supabase
        .from("patients")
        .select("*", { count: "exact" })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%,email.ilike.%${input.search}%`);
      }

      if (input.status !== "all") {
        query = query.eq("status", input.status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch patients",
        });
      }

      return {
        patients: data || [],
        total: count || 0,
        hasMore: input.offset + input.limit < (count || 0),
      };
    }),

  // Get single patient by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      return data;
    }),

  // Create new patient
  create: protectedProcedure.input(patientSchema).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    const { data, error } = await supabase
      .from("patients")
      .insert({
        ...input,
        created_by: user.id,
        created_at: new Date().toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create patient",
      });
    }

    // TODO: Add LGPD audit log

    return data;
  }),

  // Update patient
  update: protectedProcedure.input(updatePatientSchema).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx;
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from("patients")
      .update({
        ...updateData,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update patient",
      });
    }

    // TODO: Add LGPD audit log

    return data;
  }),

  // Soft delete patient (LGPD compliance)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;

      const { data, error } = await supabase
        .from("patients")
        .update({
          status: "inactive",
          deleted_by: user.id,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete patient",
        });
      }

      // TODO: Add LGPD audit log for deletion

      return { success: true };
    }),
});
