/**
 * Modern Supabase Authentication for NeonPro Healthcare
 * Implements secure authentication patterns with healthcare compliance
 * LGPD + ANVISA + CFM compliance with audit trails
 */

import type { Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createServerClient } from "./client";

/**
 * Server-side user authentication with healthcare audit trail
 * Use this for page protection and user data access
 * Never use getSession() for protection - always use getUser()
 */
export const getUser = cache(async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: (cookieList) => {
        cookieList.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return;
    }

    // Healthcare audit logging for user access
    if (user) {
      await logHealthcareAccess(user.id, "user_authenticated");
    }

    return user;
  } catch {
    return;
  }
});

/**
 * Get current session with healthcare validation
 * Used for token validation and session management
 */
export const getSession = cache(async (): Promise<Session | null> => {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: (cookieList) => {
        cookieList.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    });

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return;
    }

    return session;
  } catch {
    return;
  }
});

/**
 * Protect healthcare pages - redirects unauthorized users
 * Implements healthcare-specific authorization patterns
 */ export async function requireUser(): Promise<User> {
  const user = await getUser();

  if (!user) {
    // Healthcare compliance: redirect to secure login
    redirect("/auth/login?reason=authentication_required");
  }

  return user;
}

/**
 * Check if user has healthcare professional permissions
 * Implements role-based access control for medical data
 */
export async function requireHealthcareProfessional(): Promise<User> {
  const user = await requireUser();

  const cookieStore = await cookies();
  const supabase = createServerClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookies) => {
      cookies.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    },
  });

  // Check professional role and CFM compliance
  const { data: professional } = await supabase
    .from("healthcare_professionals")
    .select("id, cfm_number, role, active")
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (!professional) {
    redirect("/auth/unauthorized?reason=healthcare_access_required");
  }

  // Log healthcare professional access
  await logHealthcareAccess(user.id, "professional_access", {
    cfm_number: professional?.cfm_number,
    role: professional?.role,
  });

  return user;
}

/**
 * Healthcare audit logging for LGPD compliance
 * Records all authentication and access events
 */
async function logHealthcareAccess(
  userId: string,
  action: string,
  metadata?: Record<string, any>,
): Promise<void> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: (cookieList) => {
        cookieList.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    });

    await supabase.from("healthcare_audit_logs").insert({
      user_id: userId,
      action,
      metadata,
      ip_address: process.env.CF_CONNECTING_IP || "unknown",
      user_agent: process.env.HTTP_USER_AGENT || "unknown",
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Don't throw - audit logging failure shouldn't block auth
  }
}

/**
 * Sign out with healthcare audit trail
 */
export async function signOut(): Promise<void> {
  const user = await getUser();

  const cookieStore = await cookies();
  const supabase = createServerClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookies) => {
      cookies.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    },
  });

  if (user) {
    await logHealthcareAccess(user.id, "user_signout");
  }

  await supabase.auth.signOut();
  redirect("/auth/login");
}
