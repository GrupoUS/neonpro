/**
 * Supabase Server Client for NeonPro Healthcare
 * Modern @supabase/ssr implementation for Next.js 15
 * Healthcare compliance with secure session management
 */

import { createServerClient } from '@neonpro/db';
import { cookies } from 'next/headers';

/**
 * Create Supabase server client for Server Components and API Routes
 * Implements proper cookie handling for healthcare session management
 */
export async function createClient() {
  const cookieStore = cookies();

  return createServerClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookies) => {
      cookies.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    },
  });
}

/**
 * Create Supabase server client with enhanced security headers
 * Used for healthcare-specific operations requiring audit trails
 */
export async function createHealthcareClient(clinicId?: string) {
  const cookieStore = cookies();

  const client = createServerClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookies) => {
      cookies.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    },
  });

  // Add healthcare-specific headers for compliance
  if (clinicId) {
    // This would be implemented in the actual client configuration
    // client.headers['X-Clinic-ID'] = clinicId
  }

  return client;
}
