import { t } from '../router';
import { createEdgeClient } from '@neonpro/database';
import { CreateMessageSchema } from '@neonpro/types';
import { z } from 'zod';

export const messagesRouter = t.router({
  list: t.procedure
    .input(z.object({ 
      clinicId: z.string().uuid(),
      appointmentId: z.string().uuid().optional(),
      leadId: z.string().uuid().optional()
    }))
    .query(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:users(name, email)
        `)
        .eq('clinic_id', input.clinicId)
        .order('created_at', { ascending: false });

      if (input.appointmentId) {
        query = query.eq('appointment_id', input.appointmentId);
      }
      
      if (input.leadId) {
        query = query.eq('lead_id', input.leadId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }
      
      return data;
    }),

  create: t.procedure
    .input(CreateMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('messages')
        .insert(input)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create message: ${error.message}`);
      }
      
      return data;
    }),
});