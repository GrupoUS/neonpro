// app/utils/supabase/client.ts
// Task 1.3 - CONNECTION POOLING OPTIMIZATION
// Updated client with connection pooling integration
import { createBrowserClient } from "@supabase/ssr"
import { getConnectionPoolManager } from "@/lib/supabase/connection-pool-manager"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// New optimized client factory with pooling
export function createOptimizedClient(clinicId: string) {
  const poolManager = getConnectionPoolManager()
  return poolManager.getBrowserClient(clinicId)
}

// Legacy support - gradually migrate to optimized version
export { createClient as createLegacyClient }
