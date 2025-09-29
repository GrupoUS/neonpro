import { t } from '../router';
import { createEdgeClient } from '@neonpro/database';
import { CreateLeadSchema } from '@neonpro/types';
import { z } from 'zod';

export const leadsRouter = t.router({
  list: t.procedure
    .input(z.object({ clinicId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('clinic_id', input.clinicId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch leads: ${error.message}`);
      }
      
      return data;
    }),

  create: t.procedure
    .input(CreateLeadSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('leads')
        .insert(input)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create lead: ${error.message}`);
      }
      
      return data;
    }),
});