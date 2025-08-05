/**
 * tRPC Appointments Router
 * Healthcare appointment management with conflict detection
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const appointmentSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  appointment_date: z.string().datetime(),
  duration_minutes: z.number().min(15).max(480),
  appointment_type: z.enum(["consultation", "follow_up", "emergency", "surgery"]),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const appointmentsRouter = createTRPCRouter({
  // List appointments with filters
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        date_from: z.string().date().optional(),
        date_to: z.string().date().optional(),
        doctor_id: z.string().uuid().optional(),
        patient_id: z.string().uuid().optional(),
        status: z
          .enum(["scheduled", "completed", "cancelled", "no_show", "all"])
          .default("scheduled"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;

      let query = supabase
        .from("appointments")
        .select(
          `
          *,
          patients!inner(id, name, email),
          doctors!inner(id, name, specialty)
        `,
          { count: "exact" },
        )
        .range(input.offset, input.offset + input.limit - 1)
        .order("appointment_date", { ascending: true });

      if (input.date_from) {
        query = query.gte("appointment_date", input.date_from);
      }

      if (input.date_to) {
        query = query.lte("appointment_date", input.date_to);
      }

      if (input.doctor_id) {
        query = query.eq("doctor_id", input.doctor_id);
      }

      if (input.patient_id) {
        query = query.eq("patient_id", input.patient_id);
      }

      if (input.status !== "all") {
        query = query.eq("status", input.status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch appointments",
        });
      }

      return {
        appointments: data || [],
        total: count || 0,
        hasMore: input.offset + input.limit < (count || 0),
      };
    }),

  // Create appointment with conflict detection
  create: protectedProcedure.input(appointmentSchema).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    // Check for scheduling conflicts
    const appointmentEnd = new Date(input.appointment_date);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + input.duration_minutes);

    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", input.doctor_id)
      .eq("status", "scheduled")
      .gte("appointment_date", input.appointment_date)
      .lt("appointment_date", appointmentEnd.toISOString());

    if (conflicts && conflicts.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Doctor has a conflicting appointment at this time",
      });
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        ...input,
        status: "scheduled",
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create appointment",
      });
    }

    return data;
  }),

  // Update appointment status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["scheduled", "completed", "cancelled", "no_show"]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;

      const { data, error } = await supabase
        .from("appointments")
        .update({
          status: input.status,
          notes: input.notes,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update appointment",
        });
      }

      return data;
    }),

  // Get available slots for doctor
  getAvailableSlots: protectedProcedure
    .input(
      z.object({
        doctor_id: z.string().uuid(),
        date: z.string().date(),
        duration_minutes: z.number().min(15).max(480).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;

      // Get doctor's existing appointments for the day
      const startOfDay = `${input.date}T00:00:00.000Z`;
      const endOfDay = `${input.date}T23:59:59.999Z`;

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("appointment_date, duration_minutes")
        .eq("doctor_id", input.doctor_id)
        .eq("status", "scheduled")
        .gte("appointment_date", startOfDay)
        .lte("appointment_date", endOfDay)
        .order("appointment_date");

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch doctor availability",
        });
      }

      // Generate available slots (simplified logic)
      const workingHours = { start: 8, end: 18 }; // 8 AM to 6 PM
      const slots = [];

      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(input.date);
          slotTime.setHours(hour, minute, 0, 0);

          // Check if slot conflicts with existing appointments
          const hasConflict = appointments?.some((apt) => {
            const aptStart = new Date(apt.appointment_date);
            const aptEnd = new Date(aptStart.getTime() + apt.duration_minutes * 60000);
            const slotEnd = new Date(slotTime.getTime() + input.duration_minutes * 60000);

            return (
              (slotTime >= aptStart && slotTime < aptEnd) ||
              (slotEnd > aptStart && slotEnd <= aptEnd)
            );
          });

          if (!hasConflict) {
            slots.push({
              datetime: slotTime.toISOString(),
              display_time: slotTime.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
          }
        }
      }

      return { slots };
    }),
});
