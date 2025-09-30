import { router, procedure } from './trpc-factory'
import { appointmentsRouter } from './routers/appointments'
import { messagesRouter } from './routers/messages'
import { chatRouter } from './routers/chat'
import { aiClinicalSupportRouter } from './routers/ai-clinical-support'
import { professionalCouncilRouter } from './routers/professional-council'
import { realtimeSyncRouter } from './routers/realtime-sync'

export const appRouter = router({
  health: procedure.query(async ({ ctx }) => ({
    ok: true,
    user: ctx.session?.id ?? null,
    ts: Date.now(),
  })),
  appointments: appointmentsRouter,
  messages: messagesRouter,
  chat: chatRouter,
  aiClinicalSupport: aiClinicalSupportRouter,
  professionalCouncil: professionalCouncilRouter,
  realtimeSync: realtimeSyncRouter,
})

export type AppRouter = typeof appRouter
