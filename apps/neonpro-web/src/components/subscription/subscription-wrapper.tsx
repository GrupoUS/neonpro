"use client";

import React, { ReactNode } from "react";
import type { useAuth } from "@/contexts/auth-context";
import type { SubscriptionProvider } from "@/hooks/use-subscription";

// Debug: Log the imported SubscriptionProvider
console.log("SubscriptionProvider:", SubscriptionProvider);

interface SubscriptionWrapperProps {
  children: ReactNode;
}

export default function SubscriptionWrapper({ children }: SubscriptionWrapperProps) {
  const { user } = useAuth();

  // Convert auth context user to supabase user format
  const supabaseUser = user
    ? {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata || {},
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: "authenticated",
        confirmation_sent_at: null,
        confirmed_at: null,
        email_change: null,
        email_change_sent_at: null,
        email_change_token: null,
        email_change_confirm_status: 0,
        invited_at: null,
        action_link: null,
        phone: null,
        phone_confirmed_at: null,
        phone_change: null,
        phone_change_token: null,
        phone_change_sent_at: null,
        recovery_sent_at: null,
        new_email: null,
        new_phone: null,
      }
    : null;

  return <SubscriptionProvider user={supabaseUser}>{children}</SubscriptionProvider>;
}
