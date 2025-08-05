// utils/supabase/client.ts
import type { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function createClient() {
  return createClientComponentClient();
}
