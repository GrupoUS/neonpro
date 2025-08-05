"use client";

import type { AlertCircle, Clock, Lock, Zap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { useSubscriptionStatus } from "@/hooks/use-subscription-status";

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireActive?: boolean;
  showUpgrade?: boolean;
  feature?: string;
  className?: string;
}

export function SubscriptionGuard({
  children,
  fallback,
  requireActive = false,
  showUpgrade = true,
  feature = "this feature",
  className,
}: SubscriptionGuardProps) {
  const { hasAccess, isActive, isTrialing, inGracePeriod, isLoading, status, message, error } =
    useSubscriptionStatus();

  // Show loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Checking subscription...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Subscription Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button asChild variant="outline" size="sm" className="ml-2">
            <Link href="/dashboard/subscription">Check Subscription</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Check access requirements
  const shouldShowContent = requireActive ? isActive : hasAccess;

  // Show content if user has access
  if (shouldShowContent) {
    // Show grace period warning if applicable
    if (inGracePeriod && children) {
      return (
        <div className={className}>
          <Alert variant="destructive" className="mb-4">
            <Clock className="h-4 w-4" />
            <AlertTitle>Payment Required</AlertTitle>
            <AlertDescription>
              {message ||
                "Your subscription payment is overdue. Please update your payment method to continue accessing premium features."}
              <Button asChild variant="outline" size="sm" className="ml-2">
                <Link href="/dashboard/billing">Update Payment</Link>
              </Button>
            </AlertDescription>
          </Alert>
          {children}
        </div>
      );
    }

    return <div className={className}>{children}</div>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Show default upgrade prompt
  if (!showUpgrade) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">
          {requireActive ? "Active Subscription Required" : "Subscription Required"}
        </CardTitle>
        <CardDescription>
          {requireActive
            ? `An active subscription is required to access ${feature}. ${status === "trialing" ? "Trial users cannot access this feature." : ""}`
            : `Upgrade to NeonPro to unlock ${feature} and many other premium features.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "trialing" && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>Trial Limitation</AlertTitle>
            <AlertDescription>
              This feature is not available during the trial period. Upgrade to a paid plan to
              access all features.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="flex-1">
            <Link href="/dashboard/subscription">
              {status === "trialing" ? "Upgrade Now" : "View Plans"}
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/billing">Manage Billing</Link>
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Questions?{" "}
            <Link href="/dashboard/settings" className="underline">
              Contact Support
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized guards for common use cases
export function PremiumFeatureGuard({
  children,
  feature,
  className,
}: {
  children: ReactNode;
  feature?: string;
  className?: string;
}) {
  return (
    <SubscriptionGuard
      requireActive={false}
      feature={feature || "premium features"}
      className={className}
    >
      {children}
    </SubscriptionGuard>
  );
}

export function ActiveSubscriptionGuard({
  children,
  feature,
  className,
}: {
  children: ReactNode;
  feature?: string;
  className?: string;
}) {
  return (
    <SubscriptionGuard
      requireActive={true}
      feature={feature || "this advanced feature"}
      className={className}
    >
      {children}
    </SubscriptionGuard>
  );
}

// Hook for conditional rendering based on subscription
export function useSubscriptionAccess() {
  const { hasAccess, isActive, isTrialing, isLoading } = useSubscriptionStatus();

  return {
    canAccessPremium: hasAccess,
    canAccessActive: isActive,
    isTrialUser: isTrialing,
    isLoading,
    // Helper functions
    renderIfPremium: (content: ReactNode) => (hasAccess ? content : null),
    renderIfActive: (content: ReactNode) => (isActive ? content : null),
    renderIfTrial: (content: ReactNode) => (isTrialing ? content : null),
  };
}
