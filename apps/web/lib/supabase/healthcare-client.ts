// NEONPRO HEALTHCARE - Edge-Compatible Supabase Client
// ≥9.9/10 Quality Standard for Patient Data Operations

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { HEALTHCARE_DB_CONFIG } from './healthcare-config';
import type { Database } from './types';

// Healthcare-optimized browser client for patient interfaces
export function createHealthcareClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Healthcare real-time configuration
      realtime: {
        params: {
          eventsPerSecond: 10, // Optimized for patient data updates
        },
      },
      // São Paulo region optimization for LGPD
      global: {
        headers: {
          'x-region': HEALTHCARE_DB_CONFIG.region,
          'x-healthcare-compliance': 'lgpd-anvisa-cfm',
        },
      },
    },
  );
}

// Edge-compatible server client for healthcare APIs
export function createHealthcareServerClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
      // Healthcare performance optimization
      global: {
        headers: {
          'x-region': HEALTHCARE_DB_CONFIG.region,
          'x-healthcare-compliance': 'lgpd-anvisa-cfm',
          'x-patient-safety': 'enabled',
        },
      },
    },
  );
}
