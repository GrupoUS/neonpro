import { z } from 'zod'
import { procedure, router } from '../trpc-factory'
import { rlsGuard } from '../middleware/rls-guard'

type RlsContext = { clinicId: string }

const protectedProcedure = procedure.use(rlsGuard)

export const messagesRouter = router({
  list: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const clinicId = (ctx as typeof ctx & RlsContext).clinicId
      const query = ctx.supabase
        .from('messages_view')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: true })

      if (input.sessionId) {
        query.eq('session_id', input.sessionId)
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    }),
})
