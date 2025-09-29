import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Database } from '@neonpro/types';

export interface Context {
  user?: {
    id: string;
    clinic_id: string;
    role: string;
    permissions: string[];
  };
  runtime: 'edge' | 'node';
}

export const t = initTRPC.context<Context>().create();

// Import routers (will be created)
import { appointmentsRouter } from './procedures/appointments';
import { clinicsRouter } from './procedures/clinics';
import { usersRouter } from './procedures/users';
import { leadsRouter } from './procedures/leads';
import { messagesRouter } from './procedures/messages';

export const appRouter = t.router({
  appointments: appointmentsRouter,
  clinics: clinicsRouter,
  users: usersRouter,
  leads: leadsRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;