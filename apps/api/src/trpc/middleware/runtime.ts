import { t } from '../router';

export const withRuntime = (runtime: 'edge' | 'node') => 
  t.middleware(async ({ ctx, next }) => {
    if (runtime === 'edge' && ctx.runtime !== 'edge') {
      throw new Error('This procedure requires Edge runtime');
    }
    if (runtime === 'node' && ctx.runtime !== 'node') {
      throw new Error('This procedure requires Node runtime');
    }
    return next();
  });

export const edgeProcedure = t.procedure.use(withRuntime('edge'));
export const nodeProcedure = t.procedure.use(withRuntime('node'));

// Authentication middleware
export const withAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Authentication required');
  }
  return next();
});

export const protectedProcedure = t.procedure.use(withAuth);
export const protectedEdgeProcedure = t.procedure.use(withAuth).use(withRuntime('edge'));
export const protectedNodeProcedure = t.procedure.use(withAuth).use(withRuntime('node'));