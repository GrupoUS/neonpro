import { t } from '../router';
import { createEdgeClient } from '@neonpro/database';
import { CreateUserSchema } from '@neonpro/types';
import { z } from 'zod';

export const usersRouter = t.router({
  list: t.procedure
    .input(z.object({ clinicId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('user_clinics')
        .select(`
          *,
          user:users(*)
        `)
        .eq('clinic_id', input.clinicId);
      
      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      return data;
    }),

  create: t.procedure
    .input(CreateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = createEdgeClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('users')
        .insert(input)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      
      return data;
    }),
});