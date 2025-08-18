import { createBrowserClient } from '@supabase/ssr';
// import type { Database } // PLACEHOLDER: from '@/types/database'; // PLACEHOLDER - NEEDS FIXING

// Cliente Supabase para uso no pacote domain
export const createDomainSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Re-export para compatibilidade (legacy support)
export const createClientComponentClient = () => createDomainSupabaseClient();
