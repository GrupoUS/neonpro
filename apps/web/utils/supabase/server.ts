// MVP Supabase Server Client
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  // MVP Mock client - replace with real Supabase client when ready
  return {
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
      signOut: async () => ({
        error: null,
      }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: { message: "MVP mode - no database connection" },
          }),
        }),
      }),
      insert: async () => ({
        data: null,
        error: null, // MVP: No error for insert operations
      }),
      update: () => ({
        eq: () => async () => ({
          data: null,
          error: null,
        }),
      }),
      delete: () => ({
        eq: () => async () => ({
          data: null,
          error: null,
        }),
      }),
    }),
  };
}

export default createClient;
