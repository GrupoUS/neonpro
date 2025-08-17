import type { TriggerConfig } from '@trigger.dev/sdk/v3';

export const config: TriggerConfig = {
  project: process.env.TRIGGER_PROJECT_ID!,
  // Vercel deployment friendly
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  maxDuration: 300, // 5 minutos para jobs de longa duração
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10_000,
      factor: 2,
    },
  },
  // Integração com sistema NeonPro existente
  dirs: ['./infrastructure/automation'],
  // Vercel compatível
  build: {
    external: ['@supabase/supabase-js'],
  },
};
