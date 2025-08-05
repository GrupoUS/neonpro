/**
 * tRPC Server Configuration
 * Healthcare-compliant API with audit logging
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * Context creation for tRPC
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  
  // Get Supabase client with session
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return {
    req,
    res,
    supabase,
    session,
    user: session?.user || null,
  };
};

/**
 * Initialize tRPC with healthcare-specific configurations
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Healthcare-specific protected procedure with audit logging
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Healthcare audit log
  // TODO: Implement audit logging for LGPD compliance
  
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.user },
    },
  });
});

/**
 * Healthcare admin procedure (RBAC)
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // TODO: Implement role-based access control
  const isAdmin = ctx.user?.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({ ctx });
});

