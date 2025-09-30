import { router, procedure } from './trpc-factory'
import { appointmentsRouter } from './routers/appointments'
import { messagesRouter } from './routers/messages'
import { chatRouter } from './routers/chat'

export const appRouter = router({
  health: procedure.query(async ({ ctx }) => ({
    ok: true,
    user: ctx.session?.id ?? null,
    ts: Date.now(),
  })),
  appointments: appointmentsRouter,
  messages: messagesRouter,
  chat: chatRouter,
})

export type AppRouter = typeof appRouter
