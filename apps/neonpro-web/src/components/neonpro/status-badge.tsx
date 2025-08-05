/**
 * NEONPROV1 Design System - StatusBadge Component
 * Healthcare status indicators with NEONPROV1 styling
 */

import type {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
} from "lucide-react";
import type React from "react";
import type { Badge } from "@/components/ui/badge";
import type { cn } from "@/lib/utils";

type HealthcareStatus =
  | "critical"
  | "urgent"
  | "normal"
  | "pending"
  | "completed"
  | "cancelled"
  | "scheduled"
  | "in-progress";

interface StatusBadgeProps {
  status: HealthcareStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  customLabel?: string;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
  customLabel,
  pulse = false,
  className,
}) => {
  const getStatusConfig = (status: HealthcareStatus) => {
    const configs = {
      critical: {
        label: "Crítico",
        icon: AlertTriangle,
        className:
          "neon-status-critical bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800",
      },
      urgent: {
        label: "Urgente",
        icon: Zap,
        className:
          "neon-status-urgent bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800",
      },
      normal: {
        label: "Normal",
        icon: Activity,
        className:
          "neon-status-normal bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800",
      },
      pending: {
        label: "Pendente",
        icon: Clock,
        className:
          "neon-status-pending bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800",
      },
      completed: {
        label: "Concluído",
        icon: CheckCircle,
        className:
          "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800",
      },
      cancelled: {
        label: "Cancelado",
        icon: XCircle,
        className:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800",
      },
      scheduled: {
        label: "Agendado",
        icon: Clock,
        className:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800",
      },
      "in-progress": {
        label: "Em Andamento",
        icon: AlertCircle,
        className:
          "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-800",
      },
    };

    return configs[status];
  };

  const getSizeClasses = (size: "sm" | "md" | "lg") => {
    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-xs",
      lg: "px-3 py-1.5 text-sm",
    };

    return sizes[size];
  };

  const getIconSize = (size: "sm" | "md" | "lg") => {
    const iconSizes = {
      sm: "w-3 h-3",
      md: "w-3.5 h-3.5",
      lg: "w-4 h-4",
    };

    return iconSizes[size];
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const label = customLabel || config.label;

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        "transition-all duration-200 ease-in-out",
        getSizeClasses(size),
        config.className,
        {
          "animate-pulse-neon": pulse,
        },
        className,
      )}
    >
      {showIcon && <Icon className={cn("flex-shrink-0", getIconSize(size))} />}
      <span className="truncate">{label}</span>
    </Badge>
  );
};
