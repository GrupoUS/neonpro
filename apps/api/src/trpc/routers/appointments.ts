import { z } from 'zod'
import { procedure, router } from '../trpc-factory'
import { rlsGuard } from '../middleware/rls-guard'

type RlsContext = { clinicId: string }

const protectedProcedure = procedure.use(rlsGuard)

export const appointmentsRouter = router({
  list: protectedProcedure
    .input(z.object({ clinicId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const clinicContext = (ctx as typeof ctx & RlsContext).clinicId
      const clinicId = input.clinicId ?? clinicContext

      const { data, error } = await ctx.supabase
        .from('appointments_view')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('starts_at', { ascending: true })

      if (error) {
        throw error
      }

      return data ?? []
    }),
})
