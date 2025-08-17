import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import type { Database } // PLACEHOLDER: from '@/types/database'; // PLACEHOLDER - NEEDS FIXING

// Cliente Supabase para uso no pacote domain
export const createDomainSupabaseClient = () => {
  return createClientComponentClient<any>();
};

// Re-export para compatibilidade
export { createClientComponentClient };
