/**
 * Real-time Subscription Status Indicator Component
 *
 * Displays subscription status with real-time updates and interactive features.
 * Provides visual feedback for status changes and access to subscription management.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

"use client";

import type { useEffect, useState } from "react";
import type { Badge } from "../ui/badge";
import type { Button } from "../ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { Progress } from "../ui/progress";
import type { Separator } from "../ui/separator";
import type { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import type { useToast } from "../ui/use-toast";
import type {
  useSubscriptionStatus,
  type UseSubscriptionStatusOptions,
} from "../../hooks/use-subscription-status";
import type {
  CheckCircle2,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Settings,
  Crown,
  Zap,
  Shield,
  Activity,
} from "lucide-react";
import type { cn } from "../../lib/utils";

export interface SubscriptionStatusIndicatorProps {
  variant?: "default" | "compact" | "detailed" | "minimal";
  showMetrics?: boolean;
  showEvents?: boolean;
  showActions?: boolean;
  className?: string;
  onUpgradeClick?: () => void;
  onManageClick?: () => void;
  options?: UseSubscriptionStatusOptions;
}

const statusConfig = {
  active: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle2,
    label: "Active",
    description: "Your subscription is active and all features are available",
  },
  trialing: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: Clock,
    label: "Trial",
    description: "You are currently in your trial period",
  },
  expired: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    icon: XCircle,
    label: "Expired",
    description: "Your subscription has expired. Please renew to continue",
  },
  cancelled: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: AlertTriangle,
    label: "Cancelled",
    description: "Your subscription has been cancelled",
  },
  incomplete: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: AlertTriangle,
    label: "Incomplete",
    description: "Payment is required to complete your subscription",
  },
} as const;

const tierConfig = {
  free: { label: "Free", icon: Shield, color: "text-gray-600" },
  basic: { label: "Basic", icon: Zap, color: "text-blue-600" },
  premium: { label: "Premium", icon: Crown, color: "text-purple-600" },
  enterprise: { label: "Enterprise", icon: TrendingUp, color: "text-gold-600" },
} as const;

export function SubscriptionStatusIndicator({
  variant = "default",
  showMetrics = false,
  showEvents = false,
  showActions = true,
  className,
  onUpgradeClick,
  onManageClick,
  options = {},
}: SubscriptionStatusIndicatorProps) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const subscription = useSubscriptionStatus({
    autoConnect: true,
    enableLogging: process.env.NODE_ENV === "development",
    onStatusChange: (status, previous) => {
      if (previous && status !== previous) {
        toast({
          title: "Subscription Status Updated",
          description: `Your subscription status changed from ${previous} to ${status}`,
          variant: status === "active" ? "default" : "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: error,
        variant: "destructive",
      });
    },
    ...options,
  });

  const {
    status,
    tier,
    features,
    gracePeriodEnd,
    nextBilling,
    isLoading,
    isConnected,
    lastUpdate,
    error,
    isExpired,
    isActive,
    canAccessFeature,
    refresh,
    clearError,
    metrics,
    events,
  } = subscription;

  // Auto-refresh on reconnect
  useEffect(() => {
    if (isConnected && !isLoading && !status) {
      refresh();
    }
  }, [isConnected, isLoading, status, refresh]);

  if (!status && isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status && !isLoading) {
    return null;
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.expired;
  const tierInfo = tierConfig[tier as keyof typeof tierConfig] || tierConfig.free;
  const StatusIcon = config.icon;
  const TierIcon = tierInfo.icon;

  // Calculate grace period progress
  const gracePeriodProgress = gracePeriodEnd
    ? Math.max(
        0,
        Math.min(
          100,
          ((new Date(gracePeriodEnd).getTime() - Date.now()) / (3 * 24 * 60 * 60 * 1000)) * 100,
        ),
      )
    : 0;

  const renderMinimal = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn("flex items-center space-x-1", className)}>
            <div className="relative">
              <StatusIcon className={cn("h-4 w-4", config.color)} />
              {isConnected ? (
                <Wifi className="absolute -bottom-1 -right-1 h-2 w-2 text-green-500" />
              ) : (
                <WifiOff className="absolute -bottom-1 -right-1 h-2 w-2 text-red-500" />
              )}
            </div>
            <Badge variant={isActive ? "default" : "destructive"}>{config.label}</Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{config.description}</p>
            {tier && <p className="text-muted-foreground mt-1">Plan: {tierInfo.label}</p>}
            {lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderCompact = () => (
    <Card className={cn("w-full", config.bgColor, config.borderColor, className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className={cn("h-5 w-5", config.color)} />
            <div>
              <div className="flex items-center space-x-2">
                <span className={cn("font-medium", config.color)}>{config.label}</span>
                {tier && (
                  <Badge variant="outline" className={cn("text-xs", tierInfo.color)}>
                    <TierIcon className="h-3 w-3 mr-1" />
                    {tierInfo.label}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Connection indicator */}
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}

            {showActions && (
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
                  <RefreshCw className={cn("h-3 w-3", { "animate-spin": isLoading })} />
                </Button>
                {isExpired && onUpgradeClick && (
                  <Button size="sm" onClick={onUpgradeClick}>
                    Upgrade
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDetailed = () => (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <StatusIcon className={cn("h-5 w-5", config.color)} />
            <span>Subscription Status</span>
            {isConnected ? (
              <Activity className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </CardTitle>

          {showActions && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                <Settings className="h-4 w-4 mr-1" />
                Details
              </Button>
              <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", { "animate-spin": isLoading })} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className={cn("p-3 rounded-lg", config.bgColor, config.borderColor)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant={isActive ? "default" : "destructive"}>{config.label}</Badge>
              {tier && (
                <Badge variant="outline" className={tierInfo.color}>
                  <TierIcon className="h-3 w-3 mr-1" />
                  {tierInfo.label}
                </Badge>
              )}
            </div>

            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(lastUpdate).toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{config.description}</p>

          {/* Grace period progress */}
          {gracePeriodEnd && gracePeriodProgress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Grace period</span>
                <span>{Math.round(gracePeriodProgress)}% remaining</span>
              </div>
              <Progress value={gracePeriodProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Available Features</h4>
            <div className="flex flex-wrap gap-1">
              {features.slice(0, showDetails ? features.length : 3).map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {!showDetails && features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-600 hover:text-red-700"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Metrics */}
        {showDetails && showMetrics && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Connection Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Messages:</span>
                  <span className="ml-1">{metrics.messagesReceived}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Latency:</span>
                  <span className="ml-1">{metrics.latency}ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="ml-1">{Math.round(metrics.uptime / 1000)}s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reconnects:</span>
                  <span className="ml-1">{metrics.reconnectAttempts}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recent Events */}
        {showDetails && showEvents && events.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Updates</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {events.slice(0, 5).map((event, index) => (
                  <div
                    key={`${event.timestamp}-${index}`}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{event.event.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {showActions && (
          <>
            <Separator />
            <div className="flex space-x-2">
              {isExpired && onUpgradeClick && (
                <Button onClick={onUpgradeClick} className="flex-1">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
              {onManageClick && (
                <Button variant="outline" onClick={onManageClick} className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Render based on variant
  switch (variant) {
    case "minimal":
      return renderMinimal();
    case "compact":
      return renderCompact();
    case "detailed":
      return renderDetailed();
    default:
      return renderCompact();
  }
}
