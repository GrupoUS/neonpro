import { aiClinicalSupportRouter } from './routers/ai-clinical-support'
import { appointmentsRouter } from './routers/appointments'
import { messagesRouter } from './routers/messages'
import { professionalCouncilRouter } from './routers/professional-council'
import { realtimeSyncRouter } from './routers/realtime-sync'
import { procedure, router } from './trpc-factory'

export const appRouter = router({
  health: procedure.query(async ({ ctx }) => ({
    ok: true,
    user: ctx.session?.id ?? null,
    ts: Date.now(),
  })),
  appointments: appointmentsRouter,
  messages: messagesRouter,
  aiClinicalSupport: aiClinicalSupportRouter,
  professionalCouncil: professionalCouncilRouter,
  realtimeSync: realtimeSyncRouter,
})

export type AppRouter = typeof appRouter
