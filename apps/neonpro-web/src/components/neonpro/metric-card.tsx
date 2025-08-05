/**
 * NEONPROV1 Design System - MetricCard Component
 * KPI and metrics display with healthcare-specific indicators
 */
import React from "react";
import type { cn } from "@/lib/utils";
import type { NeonCard } from "./neon-card";
import type { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  trendLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "success" | "warning" | "danger";
  loading?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  trendLabel,
  icon: Icon = Activity,
  variant = "default",
  loading = false,
  className,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  const getTrendColor = () => {
    if (variant === "danger") return "text-healthcare-critical";
    if (variant === "warning") return "text-healthcare-urgent";
    if (variant === "success") return "text-healthcare-completed";

    switch (trend) {
      case "up":
        return "text-healthcare-completed";
      case "down":
        return "text-healthcare-critical";
      default:
        return "text-slate-500";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-l-healthcare-completed bg-gradient-to-r from-green-50 to-white dark:from-green-950 dark:to-slate-900";
      case "warning":
        return "border-l-healthcare-urgent bg-gradient-to-r from-orange-50 to-white dark:from-orange-950 dark:to-slate-900";
      case "danger":
        return "border-l-healthcare-critical bg-gradient-to-r from-red-50 to-white dark:from-red-950 dark:to-slate-900";
      default:
        return "border-l-neon-primary bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-slate-900";
    }
  };

  return (
    <NeonCard
      variant="metric"
      className={cn("border-l-4", getVariantStyles(), className)}
      loading={loading}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon
              className={cn("w-4 h-4 flex-shrink-0", {
                "text-healthcare-completed": variant === "success",
                "text-healthcare-urgent": variant === "warning",
                "text-healthcare-critical": variant === "danger",
                "text-neon-primary": variant === "default",
              })}
            />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
              {title}
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <p
              className={cn("text-2xl font-bold tracking-tight", {
                "text-healthcare-completed": variant === "success",
                "text-healthcare-urgent": variant === "warning",
                "text-healthcare-critical": variant === "danger",
                "text-slate-900 dark:text-slate-100": variant === "default",
              })}
            >
              {loading ? (
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                value
              )}
            </p>

            {trend && trendValue && !loading && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  getTrendColor(),
                  "bg-slate-100 dark:bg-slate-800",
                )}
              >
                <TrendIcon className="w-3 h-3" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {loading ? (
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                subtitle
              )}
            </p>
          )}

          {trendLabel && !loading && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{trendLabel}</p>
          )}
        </div>
      </div>
    </NeonCard>
  );
};
