import { z } from 'zod';
import { createTRPCRouter } from '../trpc';
import { publicProcedureWithAudit, protectedProcedure } from '../middleware';
import { TRPCError } from '@trpc/server';

// Healthcare user profile schema
const HealthcareUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'healthcare_professional', 'patient', 'staff']),
  tenant_id: z.string(),
  medical_license: z.string().optional(),
  lgpd_consent: z.boolean(),
  data_consent_given: z.boolean(),
  data_consent_date: z.string().optional(),
  profile: z.object({
    full_name: z.string(),
    specialization: z.string().optional(),
    department: z.string().optional(),
    phone: z.string().optional(),
    avatar_url: z.string().optional(),
  }).optional(),
  tenant: z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['hospital', 'clinic', 'practice']),
    settings: z.record(z.any()).optional(),
  }).optional(),
});

export const authRouter = createTRPCRouter({
  // Get current user with healthcare profile
  me: protectedProcedure
    .output(HealthcareUserSchema)
    .query(async ({ ctx }) => {
      try {
        // Fetch complete user profile with tenant info
        const { data: userProfile, error: profileError } = await ctx.supabase
          .from('user_profiles')
          .select(`
            id,
            email,
            role,
            tenant_id,
            medical_license,
            lgpd_consent,
            data_consent_given,
            data_consent_date,
            full_name,
            specialization,
            department,
            phone,
            avatar_url,
            tenants:tenant_id (
              id,
              name,
              type,
              settings
            )
          `)
          .eq('id', ctx.user.id)
          .single();

        if (profileError || !userProfile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Healthcare profile not found',
          });
        }

        // Validate LGPD compliance
        if (!userProfile.lgpd_consent || !userProfile.data_consent_given) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'LGPD data consent required',
          });
        }

        return {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role as any,
          tenant_id: userProfile.tenant_id,
          medical_license: userProfile.medical_license || undefined,
          lgpd_consent: userProfile.lgpd_consent,
          data_consent_given: userProfile.data_consent_given,
          data_consent_date: userProfile.data_consent_date || undefined,
          profile: {
            full_name: userProfile.full_name,
            specialization: userProfile.specialization || undefined,
            department: userProfile.department || undefined,
            phone: userProfile.phone || undefined,
            avatar_url: userProfile.avatar_url || undefined,
          },
          tenant: userProfile.tenants ? {
            id: userProfile.tenants.id,
            name: userProfile.tenants.name,
            type: userProfile.tenants.type as any,
            settings: userProfile.tenants.settings || undefined,
          } : undefined,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch healthcare profile',
          cause: error,
        });
      }
    }),

  // Update LGPD consent
  updateConsent: protectedProcedure
    .input(z.object({
      lgpd_consent: z.boolean(),
      data_consent_given: z.boolean(),
    }))
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { error } = await ctx.supabase
          .from('user_profiles')
          .update({
            lgpd_consent: input.lgpd_consent,
            data_consent_given: input.data_consent_given,
            data_consent_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', ctx.user.id);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update LGPD consent',
            cause: error,
          });
        }

        return {
          success: true,
          message: 'LGPD consent updated successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update consent',
          cause: error,
        });
      }
    }),
});