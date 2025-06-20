"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import CountUp from "react-countup";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

export interface MetricCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  color?: "green" | "red" | "blue" | "purple" | "yellow" | "gray";
  variant?: "compact" | "detailed" | "chart";
  sparklineData?: Array<{ value: number }>;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const colorMap = {
  green: {
    text: "text-green-600",
    bg: "bg-green-100/50",
    border: "border-green-200/50",
    icon: "text-green-500",
    chart: "#10b981",
  },
  red: {
    text: "text-red-600",
    bg: "bg-red-100/50",
    border: "border-red-200/50",
    icon: "text-red-500",
    chart: "#ef4444",
  },
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-100/50",
    border: "border-blue-200/50",
    icon: "text-blue-500",
    chart: "#3b82f6",
  },
  purple: {
    text: "text-purple-600",
    bg: "bg-purple-100/50",
    border: "border-purple-200/50",
    icon: "text-purple-500",
    chart: "#8b5cf6",
  },
  yellow: {
    text: "text-yellow-600",
    bg: "bg-yellow-100/50",
    border: "border-yellow-200/50",
    icon: "text-yellow-500",
    chart: "#f59e0b",
  },
  gray: {
    text: "text-gray-600",
    bg: "bg-gray-100/50",
    border: "border-gray-200/50",
    icon: "text-gray-500",
    chart: "#6b7280",
  },
};

const MetricCardSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-gray-300/50 rounded w-24"></div>
      <div className="h-8 w-8 bg-gray-300/50 rounded-full"></div>
    </div>
    <div className="h-8 bg-gray-300/50 rounded w-32 mb-2"></div>
    <div className="h-4 bg-gray-300/50 rounded w-20"></div>
  </div>
);

const MetricCard = memo(
  ({
    title,
    value,
    previousValue,
    change,
    trend,
    icon: Icon,
    color = "gray",
    variant = "compact",
    sparklineData = [],
    isLoading = false,
    prefix = "",
    suffix = "",
    decimals = 0,
    className,
  }: MetricCardProps) => {
    // Memoize colors to avoid object recreation
    const colors = useMemo(() => colorMap[color], [color]);

    // Memoize numeric value calculation
    const numericValue = useMemo(() => {
      return typeof value === "number"
        ? value
        : parseFloat(value.replace(/[^0-9.-]/g, ""));
    }, [value]);

    // Memoize formatted change
    const formattedChange = useMemo(() => {
      return change ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%` : "";
    }, [change]);

    // Memoize trend calculations
    const { TrendIcon, trendColor } = useMemo(() => {
      const icon =
        trend === "up"
          ? ArrowUpRight
          : trend === "down"
          ? ArrowDownRight
          : null;
      const color =
        trend === "up"
          ? "text-green-500"
          : trend === "down"
          ? "text-red-500"
          : "text-gray-500";
      return { TrendIcon: icon, trendColor: color };
    }, [trend]);

    // Memoize tooltip style
    const tooltipStyle = useMemo(
      () => ({
        backgroundColor: "rgba(17, 32, 49, 0.9)",
        border: "none",
        borderRadius: "8px",
        color: "#fff",
      }),
      []
    );

    // Callback for CountUp formatting
    const formatValue = useCallback(
      (val: number) => {
        return `${prefix}${val.toLocaleString()}${suffix}`;
      },
      [prefix, suffix]
    );

    if (isLoading) {
      return <MetricCardSkeleton />;
    }

    const cardContent = (
      <>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
          {Icon && (
            <div className={cn("p-2 rounded-lg", colors.bg)}>
              <Icon className={cn("h-4 w-4", colors.icon)} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {typeof value === "number" ? (
              <>
                {prefix}
                <CountUp
                  end={numericValue}
                  decimals={decimals}
                  duration={2}
                  separator=","
                  preserveValue
                />
                {suffix}
              </>
            ) : (
              value
            )}
          </div>
          {TrendIcon && change !== undefined && (
            <div className={cn("flex items-center gap-1", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{formattedChange}</span>
            </div>
          )}
        </div>

        {/* Previous Value */}
        {previousValue !== undefined && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            vs. {prefix}
            {previousValue.toLocaleString()}
            {suffix} last period
          </div>
        )}

        {/* Chart for detailed variant */}
        {variant === "detailed" && sparklineData.length > 0 && (
          <div className="mt-4 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors.chart}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart variant */}
        {variant === "chart" && sparklineData.length > 0 && (
          <div className="mt-6 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors.chart}
                  strokeWidth={3}
                  dot={false}
                  strokeLinecap="round"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </>
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(172, 148, 105, 0.15)",
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "glass-card p-6 cursor-pointer",
          "hover:shadow-glass-hover",
          "transition-all duration-300",
          className
        )}
      >
        {cardContent}
      </motion.div>
    );
  }
);

MetricCard.displayName = "MetricCard";

export default MetricCard;
