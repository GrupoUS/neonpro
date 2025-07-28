// app/utils/supabase/server.ts
// Task 1.3 - CONNECTION POOLING OPTIMIZATION
// Updated server client with connection pooling integration
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getConnectionPoolManager } from "@/lib/supabase/connection-pool-manager";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ocorre em Server Actions quando se tenta setar um cookie.
            // A middleware se encarregará de atualizar os cookies.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ocorre em Server Actions quando se tenta remover um cookie.
          }
        },
      },
    }
  );
}

// Export alias for compatibility
export { createClient as createServerClient };

// New optimized server client factory with pooling
export async function createOptimizedServerClient(clinicId: string) {
  const poolManager = getConnectionPoolManager()
  return await poolManager.getServerClient(clinicId)
}

// Legacy support - gradually migrate to optimized version
export { createClient as createLegacyServerClient };
