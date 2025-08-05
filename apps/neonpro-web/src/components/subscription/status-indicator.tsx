"use client";

import type { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import type { cn } from "@/lib/utils";

interface SubscriptionStatusIndicatorProps {
  showFullCard?: boolean;
  className?: string;
}

export function SubscriptionStatusIndicator({
  showFullCard = false,
  className,
}: SubscriptionStatusIndicatorProps) {
  const {
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    hasAccess,
    inGracePeriod,
    isLoading,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    message,
    error,
  } = useSubscriptionStatus();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-sm text-muted-foreground">Checking subscription...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Subscription Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const getStatusConfig = () => {
    if (isActive) {
      return {
        icon: CheckCircle,
        color: "green",
        label: "Active",
        variant: "default" as const,
        description: cancelAtPeriodEnd
          ? "Will cancel at period end"
          : "Your subscription is active",
      };
    }

    if (isTrialing) {
      return {
        icon: Clock,
        color: "blue",
        label: "Trial",
        variant: "secondary" as const,
        description: "You are on a trial period",
      };
    }

    if (isPastDue && inGracePeriod) {
      return {
        icon: AlertCircle,
        color: "yellow",
        label: "Payment Due",
        variant: "destructive" as const,
        description: "Payment is overdue - please update your payment method",
      };
    }

    if (isCanceled || !hasAccess) {
      return {
        icon: XCircle,
        color: "red",
        label: "Inactive",
        variant: "destructive" as const,
        description: "Subscription required for premium features",
      };
    }

    return {
      icon: AlertCircle,
      color: "gray",
      label: "Unknown",
      variant: "secondary" as const,
      description: "Unable to determine subscription status",
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (!showFullCard) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <StatusIcon
          className={cn(
            "h-4 w-4",
            statusConfig.color === "green" && "text-green-600",
            statusConfig.color === "blue" && "text-blue-600",
            statusConfig.color === "yellow" && "text-yellow-600",
            statusConfig.color === "red" && "text-red-600",
            statusConfig.color === "gray" && "text-gray-600",
          )}
        />
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        {inGracePeriod && (
          <Badge variant="outline" className="text-xs">
            Grace Period
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <StatusIcon
              className={cn(
                "h-5 w-5",
                statusConfig.color === "green" && "text-green-600",
                statusConfig.color === "blue" && "text-blue-600",
                statusConfig.color === "yellow" && "text-yellow-600",
                statusConfig.color === "red" && "text-red-600",
                statusConfig.color === "gray" && "text-gray-600",
              )}
            />
            Subscription Status
          </span>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message || statusConfig.description}</p>

        {currentPeriodEnd && (
          <div className="text-sm">
            <span className="font-medium">{cancelAtPeriodEnd ? "Ends on: " : "Renews on: "}</span>
            <span className="text-muted-foreground">
              {currentPeriodEnd.toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}

        {inGracePeriod && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Required</AlertTitle>
            <AlertDescription>
              Your subscription payment is overdue. Please update your payment method to continue
              accessing premium features.
            </AlertDescription>
          </Alert>
        )}

        {!hasAccess && (
          <div className="space-y-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Premium Features Locked</AlertTitle>
              <AlertDescription>
                Upgrade your subscription to access all NeonPro features.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/dashboard/subscription">Upgrade Now</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/billing">View Billing</Link>
              </Button>
            </div>
          </div>
        )}

        {isPastDue && inGracePeriod && (
          <Button asChild className="w-full">
            <Link href="/dashboard/billing">Update Payment Method</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Simpler component for navigation bars
export function SubscriptionBadge({ className }: { className?: string }) {
  const { hasAccess, isLoading, status } = useSubscriptionStatus();

  if (isLoading) {
    return <div className={cn("h-6 w-16 bg-gray-200 rounded animate-pulse", className)} />;
  }

  if (!hasAccess) {
    return (
      <Badge variant="outline" className={cn("text-xs", className)}>
        <XCircle className="h-3 w-3 mr-1" />
        Upgrade
      </Badge>
    );
  }

  if (status === "trialing") {
    return (
      <Badge variant="secondary" className={cn("text-xs", className)}>
        <Clock className="h-3 w-3 mr-1" />
        Trial
      </Badge>
    );
  }

  return (
    <Badge variant="default" className={cn("text-xs", className)}>
      <CheckCircle className="h-3 w-3 mr-1" />
      Pro
    </Badge>
  );
}
