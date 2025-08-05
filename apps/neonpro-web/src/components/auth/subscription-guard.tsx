import type { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { cookies } from "next/headers";
import type { redirect } from "next/navigation";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: string[];
  fallbackPath?: string;
}

export async function SubscriptionGuard({
  children,
  requiredPlan = [],
  fallbackPath = "/pricing",
}: SubscriptionGuardProps) {
  const supabase = createServerComponentClient({ cookies });

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Check user subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions_view")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // If no subscription found, redirect to pricing
    if (!subscription) {
      redirect(fallbackPath);
    }

    // If specific plans are required, check if user's plan matches
    if (requiredPlan.length > 0 && !requiredPlan.includes(subscription.plan_id)) {
      redirect("/dashboard/subscription/upgrade");
    }

    // Check if subscription is expired
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);

    if (periodEnd < now && subscription.status !== "trialing") {
      redirect("/dashboard/subscription/expired");
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Subscription guard error:", error);
    redirect(fallbackPath);
  }
}
