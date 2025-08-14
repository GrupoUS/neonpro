/**
 * Subscription Status Widget Component
 *
 * Dashboard widget that shows current subscription status, usage metrics,
 * and quick actions. Designed for dashboard integration.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

"use client";

import { cn } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  Crown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useSubscriptionStatus } from "../../hooks/use-subscription-status";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { SubscriptionStatusIndicator } from "./subscription-status-indicator";
import { UpgradePrompt } from "./upgrade-prompt";

export interface SubscriptionStatusWidgetProps {
  className?: string;
  showUsageMetrics?: boolean;
  showQuickActions?: boolean;
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  variant?: "default" | "compact" | "detailed";
}

export function SubscriptionStatusWidget({
  className,
  showUsageMetrics = true,
  showQuickActions = true,
  onUpgrade,
  onManageBilling,
  variant = "default",
}: SubscriptionStatusWidgetProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    status,
    tier,
    features,
    nextBilling,
    gracePeriodEnd,
    isLoading,
    error,
    refresh,
  } = useSubscriptionStatus();

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "trialing":
        return "text-blue-600";
      case "past_due":
        return "text-orange-600";
      case "cancelled":
      case "canceled":
      case "expired":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getNextActionDate = () => {
    if (status === "trialing") return nextBilling;
    if (status === "past_due" && gracePeriodEnd) return gracePeriodEnd;
    if (status === "active") return nextBilling;
    return null;
  };

  const getActionDateLabel = () => {
    if (status === "trialing") return "Trial ends";
    if (status === "past_due") return "Grace period ends";
    if (status === "active") return "Next billing";
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Mock usage metrics - in real app, these would come from API
  const usageMetrics = [
    { label: "Patients", current: 87, limit: 100, icon: Users },
    { label: "Storage", current: 2.3, limit: 5, icon: TrendingUp, unit: "GB" },
  ];

  if (variant === "compact") {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SubscriptionStatusIndicator
                variant="minimal"
                className="scale-75"
              />
              <div>
                <p className="font-medium">{tier || "Free"} Plan</p>
                <p className={cn("text-sm", getStatusColor())}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
              </div>
            </div>
            {status !== "active" && (
              <Button size="sm" onClick={() => setShowUpgradeModal(true)}>
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-primary" />
                <span>Subscription Status</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription and usage
              </CardDescription>
            </div>
            <SubscriptionStatusIndicator variant="minimal" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Subscription Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="font-semibold text-lg">{tier || "Free"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={status === "active" ? "default" : "secondary"}
                className={getStatusColor()}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Next Action Date */}
          {getNextActionDate() && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {getActionDateLabel()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatDate(getNextActionDate()!)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getDaysUntil(getNextActionDate()!)} days
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Metrics */}
          {showUsageMetrics && variant === "detailed" && (
            <div>
              <h4 className="font-medium mb-3">Usage Overview</h4>
              <div className="space-y-3">
                {usageMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  const percentage = Math.round(
                    (metric.current / metric.limit) * 100
                  );

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{metric.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {metric.current}
                          {metric.unit || ""} / {metric.limit}
                          {metric.unit || ""}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {percentage}% used
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Features */}
          {variant === "detailed" && features.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Active Features</h4>
              <div className="flex flex-wrap gap-2">
                {features.slice(0, 6).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {features.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{features.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                {status !== "active" && (
                  <Button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onManageBilling}
                    className="flex-1"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </Button>

                  <Button
                    variant="outline"
                    onClick={refresh}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradePrompt
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={status === "trialing" ? "trial_ended" : "expired"}
        currentPlan={tier || "Free"}
        suggestedPlan="Professional"
        onUpgrade={onUpgrade}
      />
    </>
  );
}

export default SubscriptionStatusWidget;
