/**
 * Supabase Browser Client for NeonPro Healthcare
 * Modern @supabase/ssr implementation for Client Components
 * Healthcare compliance with real-time capabilities
 */

import { createClient as createDbClient } from '@neonpro/db';

/**
 * Create Supabase browser client for Client Components
 * Implements proper browser-side authentication and real-time
 */
export function createClient() {
  return createDbClient();
}

/**
 * Create Supabase client with real-time subscriptions for healthcare
 * Optimized for appointment updates and patient notifications
 */
export function createRealtimeClient() {
  const client = createDbClient();

  // Healthcare-specific real-time configuration
  // Additional configuration would be handled in the base client

  return client;
}
