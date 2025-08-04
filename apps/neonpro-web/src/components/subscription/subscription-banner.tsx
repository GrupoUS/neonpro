/**
 * Subscription Banner Component
 *
 * Displays subscription-related notifications at the top of pages.
 * Shows trial remaining time, payment reminders, and upgrade prompts.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Crown, Sparkles, X, Zap } from "lucide-react";
import { useState } from "react";
import { useSubscriptionStatus } from "../../hooks/use-subscription-status";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

export interface SubscriptionBannerProps {
  className?: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  showProgress?: boolean;
  compact?: boolean;
}

export function SubscriptionBanner({
  className,
  onUpgrade,
  onDismiss,
  dismissible = true,
  showProgress = true,
  compact = false,
}: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { status, tier, gracePeriodEnd, nextBilling, isLoading } =
    useSubscriptionStatus();

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Don't show if loading, dismissed, or subscription is active
  if (isLoading || dismissed || status === "active") {
    return null;
  }

  const getBannerConfig = () => {
    const now = new Date();

    switch (status) {
      case "trialing": {
        const trialEnd = nextBilling ? new Date(nextBilling) : null;
        const daysRemaining = trialEnd
          ? Math.max(
              0,
              Math.ceil(
                (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              )
            )
          : 0;

        return {
          variant: daysRemaining <= 3 ? "urgent" : "info",
          icon: daysRemaining <= 3 ? AlertTriangle : Sparkles,
          title: "Free Trial Active",
          message:
            daysRemaining > 0
              ? `${daysRemaining} days remaining in your free trial`
              : "Your free trial expires today",
          badge: `${daysRemaining} days left`,
          ctaText: "Choose Plan",
          progress: trialEnd
            ? Math.max(0, 100 - (daysRemaining / 14) * 100)
            : 100,
        };
      }

      case "past_due": {
        const graceEnd = gracePeriodEnd ? new Date(gracePeriodEnd) : null;
        const daysRemaining = graceEnd
          ? Math.max(
              0,
              Math.ceil(
                (graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              )
            )
          : 0;

        return {
          variant: "urgent",
          icon: AlertTriangle,
          title: "Payment Overdue",
          message:
            daysRemaining > 0
              ? `Update payment method within ${daysRemaining} days to avoid service interruption`
              : "Update your payment method immediately to restore access",
          badge: "Action Required",
          ctaText: "Update Payment",
          progress: graceEnd
            ? Math.max(0, 100 - (daysRemaining / 7) * 100)
            : 100,
        };
      }

      case "cancelled":
      case "canceled": {
        const graceEnd = gracePeriodEnd ? new Date(gracePeriodEnd) : null;
        const daysRemaining = graceEnd
          ? Math.max(
              0,
              Math.ceil(
                (graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              )
            )
          : 0;

        return {
          variant: "urgent",
          icon: AlertTriangle,
          title: "Subscription Cancelled",
          message:
            daysRemaining > 0
              ? `Access will end in ${daysRemaining} days. Reactivate to continue using all features`
              : "Your subscription has ended. Reactivate to restore access",
          badge: "Cancelled",
          ctaText: "Reactivate",
          progress: graceEnd
            ? Math.max(0, 100 - (daysRemaining / 30) * 100)
            : 100,
        };
      }

      case "expired": {
        return {
          variant: "urgent",
          icon: AlertTriangle,
          title: "Subscription Expired",
          message:
            "Your subscription has expired. Renew now to continue accessing premium features",
          badge: "Expired",
          ctaText: "Renew Now",
          progress: 100,
        };
      }

      case "unpaid":
      case "incomplete": {
        return {
          variant: "warning",
          icon: Clock,
          title: "Payment Required",
          message: "Complete your payment to activate your subscription",
          badge: "Payment Pending",
          ctaText: "Complete Payment",
          progress: 50,
        };
      }

      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  const variantStyles = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-900",
      badge: "bg-blue-100 text-blue-800",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-900",
      badge: "bg-yellow-100 text-yellow-800",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    urgent: {
      container: "bg-red-50 border-red-200 text-red-900",
      badge: "bg-red-100 text-red-800",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
  };

  const styles = variantStyles[config.variant as keyof typeof variantStyles];
  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 border rounded-lg",
          styles.container,
          className
        )}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">{config.title}</span>
          <Badge variant="secondary" className={styles.badge}>
            {config.badge}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={onUpgrade}
            className={cn("text-xs", styles.button)}
          >
            {config.ctaText}
          </Button>
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-current opacity-70 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border rounded-lg p-4",
        styles.container,
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-2 rounded-lg bg-white/50">
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-lg">{config.title}</h3>
              <Badge variant="secondary" className={styles.badge}>
                {config.badge}
              </Badge>
            </div>
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-current opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-sm mb-4 text-current/80">{config.message}</p>

          {showProgress && config.progress !== undefined && (
            <div className="mb-4">
              <Progress value={config.progress} className="h-2 bg-white/30" />
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Button onClick={onUpgrade} className={styles.button}>
              <Crown className="h-4 w-4 mr-2" />
              {config.ctaText}
            </Button>

            {status === "trialing" && (
              <Button variant="outline" size="sm" className="border-current/20">
                <Zap className="h-4 w-4 mr-2" />
                See Features
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionBanner;
