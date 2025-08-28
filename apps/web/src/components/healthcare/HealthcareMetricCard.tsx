"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

// TweakCN NEONPRO Healthcare Metric Card Types
export interface HealthcareMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "normal" | "warning" | "critical" | "success";
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
  // Healthcare-specific props
  patientId?: string;
  emergencyMode?: boolean;
  lgpdCompliant?: boolean;
  accessLevel?: "public" | "restricted" | "confidential";
}

export interface HealthcareMetricsGridProps {
  metrics: HealthcareMetricCardProps[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

// Status color mapping for TweakCN NEONPRO theme
const statusColors = {
  normal: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  critical: "bg-red-50 border-red-200 text-red-800",
  success: "bg-green-50 border-green-200 text-green-800",
};

const statusIcons = {
  normal: Activity,
  warning: AlertTriangle,
  critical: AlertTriangle,
  success: CheckCircle,
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Activity,
};

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  stable: "text-gray-600",
};

// Healthcare Metric Card Component
export function HealthcareMetricCard({
  title,
  value,
  unit,
  description,
  trend,
  trendValue,
  status = "normal",
  icon,
  className,
  isLoading = false,
  onClick,
  patientId,
  emergencyMode = false,
  lgpdCompliant = true,
  accessLevel = "public",
}: HealthcareMetricCardProps) {
  const StatusIcon = statusIcons[status];
  const TrendIcon = trend ? trendIcons[trend] : null;

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer",
        emergencyMode && "ring-2 ring-red-500 ring-opacity-50",
        statusColors[status],
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
          {emergencyMode && (
            <Badge variant="destructive" className="ml-2 text-xs">
              EMERGÊNCIA
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center space-x-1">
          {icon || <StatusIcon className="h-4 w-4" />}
          {!lgpdCompliant && (
            <Shield
              className="h-3 w-3 text-amber-500"
              title="LGPD Compliance Required"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {unit && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {unit}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && trendValue && TrendIcon && (
          <div
            className={cn("flex items-center mt-2 text-xs", trendColors[trend])}
          >
            <TrendIcon className="h-3 w-3 mr-1" />
            <span>{trendValue}</span>
          </div>
        )}
        {accessLevel !== "public" && (
          <Badge variant="outline" className="mt-2 text-xs">
            {accessLevel === "restricted" ? "Restrito" : "Confidencial"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// Healthcare Metrics Grid Component
export function HealthcareMetricsGrid({
  metrics,
  columns = 3,
  className,
}: HealthcareMetricsGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {metrics.map((metric, index) => (
        <HealthcareMetricCard key={index} {...metric} />
      ))}
    </div>
  );
}

// Sample metrics for development and testing
export const sampleMetrics: HealthcareMetricCardProps[] = [
  {
    title: "Pacientes Ativos",
    value: 1247,
    description: "Total de pacientes em atendimento",
    trend: "up",
    trendValue: "+12% vs mês anterior",
    status: "success",
    icon: <Users className="h-4 w-4" />,
    lgpdCompliant: true,
  },
  {
    title: "Consultas Hoje",
    value: 89,
    description: "Consultas agendadas para hoje",
    trend: "stable",
    trendValue: "Mesmo que ontem",
    status: "normal",
    icon: <Clock className="h-4 w-4" />,
    lgpdCompliant: true,
  },
  {
    title: "Emergências",
    value: 3,
    description: "Casos críticos em andamento",
    trend: "down",
    trendValue: "-2 vs ontem",
    status: "warning",
    icon: <Heart className="h-4 w-4" />,
    emergencyMode: true,
    lgpdCompliant: true,
    accessLevel: "restricted",
  },
  {
    title: "Conformidade LGPD",
    value: "98.5%",
    description: "Taxa de conformidade atual",
    trend: "up",
    trendValue: "+0.3% esta semana",
    status: "success",
    icon: <Shield className="h-4 w-4" />,
    lgpdCompliant: true,
  },
];
