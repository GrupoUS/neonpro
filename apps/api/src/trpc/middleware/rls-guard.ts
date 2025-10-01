import { TRPCError } from '@trpc/server'
import { middleware } from '../trpc-factory'

export const rlsGuard = middleware(async ({ ctx, next }) => {
  const clinicId = ctx.session?.user_metadata?.['clinic_id']

  if (!ctx.session || !clinicId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Clinic context required' })
  }

  return next({
    ctx: {
      ...ctx,
      clinicId: clinicId as string,
    },
  })
})
