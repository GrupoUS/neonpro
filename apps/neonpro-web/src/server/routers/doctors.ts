/**
 * tRPC Doctors Router
 * Healthcare staff management with scheduling
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const doctorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  crm: z.string().min(4).max(10),
  specialty: z.string().min(2).max(50),
  department: z.string().min(2).max(50),
  working_hours: z.object({
    monday: z.object({ start: z.string(), end: z.string() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string() }).optional(),
    friday: z.object({ start: z.string(), end: z.string() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string() }).optional(),
  }),
});

export const doctorsRouter = createTRPCRouter({
  // List doctors with filtering
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      specialty: z.string().optional(),
      department: z.string().optional(),
      available_today: z.boolean().optional(),
      status: z.enum(['active', 'inactive', 'all']).default('active'),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;
      
      let query = supabase
        .from('doctors')
        .select('*', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.specialty) {
        query = query.eq('specialty', input.specialty);
      }

      if (input.department) {
        query = query.eq('department', input.department);
      }

      if (input.status !== 'all') {
        query = query.eq('status', input.status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch doctors',
        });
      }

      return {
        doctors: data || [],
        total: count || 0,
        hasMore: (input.offset + input.limit) < (count || 0),
      };
    }),

  // Get doctor by ID with schedule
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          appointments!inner(
            id,
            appointment_date,
            duration_minutes,
            status,
            patients!inner(name)
          )
        `)
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Doctor not found',
        });
      }

      return data;
    }),

  // Get doctor schedule for date range
  getSchedule: protectedProcedure
    .input(z.object({
      doctor_id: z.string().uuid(),
      date_from: z.string().date(),
      date_to: z.string().date(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          duration_minutes,
          appointment_type,
          status,
          patients!inner(id, name)
        `)
        .eq('doctor_id', input.doctor_id)
        .gte('appointment_date', `${input.date_from}T00:00:00.000Z`)
        .lte('appointment_date', `${input.date_to}T23:59:59.999Z`)
        .order('appointment_date');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch doctor schedule',
        });
      }

      return { appointments: appointments || [] };
    }),

  // Create new doctor
  create: adminProcedure
    .input(doctorSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;
      
      // Check if CRM already exists
      const { data: existingDoctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('crm', input.crm)
        .single();

      if (existingDoctor) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Doctor with this CRM already exists',
        });
      }

      const { data, error } = await supabase
        .from('doctors')
        .insert({
          ...input,
          status: 'active',
          created_by: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create doctor',
        });
      }

      return data;
    }),

  // Update doctor
  update: adminProcedure
    .input(doctorSchema.partial().extend({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;
      const { id, ...updateData } = input;
      
      const { data, error } = await supabase
        .from('doctors')
        .update({
          ...updateData,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update doctor',
        });
      }

      return data;
    }),

  // Get specialties list
  getSpecialties: protectedProcedure
    .query(async ({ ctx }) => {
      const { supabase } = ctx;
      
      const { data, error } = await supabase
        .from('doctors')
        .select('specialty')
        .eq('status', 'active');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch specialties',
        });
      }

      const specialties = [...new Set(data?.map(d => d.specialty) || [])];
      return { specialties };
    }),

  // Get departments list
  getDepartments: protectedProcedure
    .query(async ({ ctx }) => {
      const { supabase } = ctx;
      
      const { data, error } = await supabase
        .from('doctors')
        .select('department')
        .eq('status', 'active');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch departments',
        });
      }

      const departments = [...new Set(data?.map(d => d.department) || [])];
      return { departments };
    }),
});
