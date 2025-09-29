import { t } from '../router';
import { createEdgeClient } from '@neonpro/database';
import { CreateClinicSchema } from '@neonpro/types';
import { z } from 'zod';

export const clinicsRouter = t.router({
  get: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', input.id)
        .single();
      
      if (error) {
        throw new Error(`Failed to fetch clinic: ${error.message}`);
      }
      
      return data;
    }),

  create: t.procedure
    .input(CreateClinicSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('clinics')
        .insert(input)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create clinic: ${error.message}`);
      }
      
      return data;
    }),
});