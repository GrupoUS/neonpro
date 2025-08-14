/**
 * Subscription Upgrade Prompt Component
 *
 * Modal component that displays upgrade prompts when users hit subscription limits
 * or when their subscription has expired. Provides clear CTAs for upgrading.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Crown,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";

export interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  reason:
    | "expired"
    | "cancelled"
    | "trial_ended"
    | "feature_limit"
    | "usage_limit";
  currentPlan?: string;
  suggestedPlan?: string;
  usageMetrics?: {
    current: number;
    limit: number;
    label: string;
  };
  onUpgrade?: () => void;
  onExtendTrial?: () => void;
  className?: string;
}

interface UpgradeReason {
  title: string;
  description: string;
  urgency: "low" | "medium" | "high" | "critical";
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  features: string[];
  ctaPrimary: string;
  ctaSecondary?: string;
}

const upgradeReasons: Record<UpgradePromptProps["reason"], UpgradeReason> = {
  expired: {
    title: "Subscription Expired",
    description:
      "Your subscription has expired. Renew now to continue accessing all premium features.",
    urgency: "critical",
    icon: AlertTriangle,
    badge: "Action Required",
    features: [
      "Full patient management system",
      "Unlimited appointments",
      "Advanced reporting",
      "Priority support",
    ],
    ctaPrimary: "Renew Subscription",
    ctaSecondary: "View Plans",
  },
  cancelled: {
    title: "Subscription Cancelled",
    description:
      "Your subscription was cancelled. Reactivate to restore access to premium features.",
    urgency: "high",
    icon: AlertTriangle,
    badge: "Reactivate",
    features: [
      "Patient records and history",
      "Appointment scheduling",
      "Financial reports",
      "Multi-clinic support",
    ],
    ctaPrimary: "Reactivate Plan",
    ctaSecondary: "Browse Plans",
  },
  trial_ended: {
    title: "Free Trial Ended",
    description:
      "Your free trial has ended. Upgrade now to continue using NeonPro without limitations.",
    urgency: "high",
    icon: Sparkles,
    badge: "Trial Complete",
    features: [
      "Unlimited patient records",
      "Advanced analytics",
      "Custom workflows",
      "Premium integrations",
    ],
    ctaPrimary: "Start Paid Plan",
    ctaSecondary: "Extend Trial",
  },
  feature_limit: {
    title: "Feature Upgrade Required",
    description:
      "This feature requires a higher subscription tier. Upgrade to unlock advanced capabilities.",
    urgency: "medium",
    icon: Crown,
    badge: "Premium Feature",
    features: [
      "Advanced reporting suite",
      "Custom dashboard widgets",
      "API access",
      "White-label options",
    ],
    ctaPrimary: "Upgrade Plan",
    ctaSecondary: "Learn More",
  },
  usage_limit: {
    title: "Usage Limit Reached",
    description:
      "You've reached your plan's usage limit. Upgrade to continue without restrictions.",
    urgency: "medium",
    icon: TrendingUp,
    badge: "Limit Reached",
    features: [
      "Higher usage limits",
      "Unlimited storage",
      "Advanced features",
      "Priority processing",
    ],
    ctaPrimary: "Increase Limits",
    ctaSecondary: "Manage Usage",
  },
};

const urgencyConfig = {
  low: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    badgeVariant: "outline" as const,
  },
  medium: {
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    badgeVariant: "outline" as const,
  },
  high: {
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    badgeVariant: "destructive" as const,
  },
  critical: {
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    badgeVariant: "destructive" as const,
  },
};

export function UpgradePrompt({
  isOpen,
  onClose,
  reason,
  currentPlan = "Free",
  suggestedPlan = "Professional",
  usageMetrics,
  onUpgrade,
  onExtendTrial,
  className,
}: UpgradePromptProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  const config = upgradeReasons[reason];
  const urgency = urgencyConfig[config.urgency];
  const Icon = config.icon;

  const handleUpgrade = async () => {
    if (!onUpgrade) return;

    setIsUpgrading(true);
    try {
      await onUpgrade();
      onClose();
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleExtendTrial = async () => {
    if (!onExtendTrial) return;

    setIsExtending(true);
    try {
      await onExtendTrial();
      onClose();
    } catch (error) {
      console.error("Trial extension failed:", error);
    } finally {
      setIsExtending(false);
    }
  };

  const usagePercentage = usageMetrics
    ? Math.round((usageMetrics.current / usageMetrics.limit) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded-lg", urgency.bgColor)}>
                <Icon className={cn("h-5 w-5", urgency.color)} />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {config.title}
                </DialogTitle>
                <Badge variant={urgency.badgeVariant} className="mt-1">
                  {config.badge}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base mt-4">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Metrics */}
          {usageMetrics && (
            <div className={cn("p-4 rounded-lg", urgency.bgColor)}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{usageMetrics.label}</span>
                <span className="text-sm text-muted-foreground">
                  {usageMetrics.current} / {usageMetrics.limit}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {usagePercentage >= 100
                  ? "You've reached your limit"
                  : `${100 - usagePercentage}% remaining`}
              </p>
            </div>
          )}

          {/* Current vs Suggested Plan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium text-sm text-muted-foreground">
                Current Plan
              </h4>
              <p className="font-semibold">{currentPlan}</p>
            </div>
            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
              <h4 className="font-medium text-sm text-primary">Recommended</h4>
              <p className="font-semibold text-primary">{suggestedPlan}</p>
            </div>
          </div>

          {/* Features List */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              What you'll get with {suggestedPlan}
            </h4>
            <ul className="space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full mr-3" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row">
          {config.ctaSecondary && (
            <Button
              variant="outline"
              onClick={reason === "trial_ended" ? handleExtendTrial : onClose}
              disabled={isUpgrading || isExtending}
              className="w-full sm:w-auto"
            >
              {isExtending ? "Extending..." : config.ctaSecondary}
            </Button>
          )}
          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading || isExtending || !onUpgrade}
            className="w-full sm:w-auto"
          >
            {isUpgrading ? "Processing..." : config.ctaPrimary}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradePrompt;
