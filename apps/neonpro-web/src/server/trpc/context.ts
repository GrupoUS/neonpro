import { createServerClient } from "@supabase/ssr";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

// Healthcare user context with medical role validation
export interface HealthcareUser {
  id: string;
  email: string;
  role: "admin" | "healthcare_professional" | "patient" | "staff";
  tenant_id: string;
  medical_license?: string;
  lgpd_consent: boolean;
  data_consent_given: boolean;
  data_consent_date?: string;
}

// tRPC Context with healthcare compliance
export interface Context {
  user: HealthcareUser | null;
  supabase: ReturnType<typeof createServerClient<Database>>;
  requestId: string;
  userAgent: string;
  ipAddress: string;
  timestamp: Date;
}

export async function createTRPCContext(opts: CreateNextContextOptions): Promise<Context> {
  const { req } = opts;

  // Generate unique request ID for audit trail
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Extract request metadata for healthcare audit
  const userAgent = req.headers["user-agent"] || "unknown";
  const ipAddress = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";

  // Create Supabase server client with cookies
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  // Get authenticated user with healthcare profile
  let user: HealthcareUser | null = null;

  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authUser && !authError) {
      // Fetch healthcare profile with role and compliance data
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select(`
          id,
          email,
          role,
          tenant_id,
          medical_license,
          lgpd_consent,
          data_consent_given,
          data_consent_date
        `)
        .eq("id", authUser.id)
        .single();

      if (profile && !profileError) {
        user = {
          id: profile.id,
          email: profile.email,
          role: profile.role as HealthcareUser["role"],
          tenant_id: profile.tenant_id,
          medical_license: profile.medical_license || undefined,
          lgpd_consent: profile.lgpd_consent,
          data_consent_given: profile.data_consent_given,
          data_consent_date: profile.data_consent_date || undefined,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching user context:", error);
    // User remains null for unauthenticated requests
  }

  return {
    user,
    supabase,
    requestId,
    userAgent,
    ipAddress,
    timestamp: new Date(),
  };
}
