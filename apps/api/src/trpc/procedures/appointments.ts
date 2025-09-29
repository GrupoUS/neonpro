import { t } from '../router';
import { createEdgeClient } from '@neonpro/database';
import { AppointmentSchema, CreateAppointmentSchema } from '@neonpro/types';
import { z } from 'zod';

export const appointmentsRouter = t.router({
  list: t.procedure
    .input(z.object({ clinicId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users(name, email),
          professional:users(name, specialization)
        `)
        .eq('clinic_id', input.clinicId)
        .order('start_time');
      
      if (error) {
        throw new Error(`Failed to fetch appointments: ${error.message}`);
      }
      
      return data;
    }),
    
  create: t.procedure
    .input(CreateAppointmentSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(input)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create appointment: ${error.message}`);
      }
      
      return data;
    }),

  update: t.procedure
    .input(z.object({
      id: z.string().uuid(),
      data: CreateAppointmentSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('appointments')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update appointment: ${error.message}`);
      }
      
      return data;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', input.id);
      
      if (error) {
        throw new Error(`Failed to delete appointment: ${error.message}`);
      }
      
      return { success: true };
    }),
});