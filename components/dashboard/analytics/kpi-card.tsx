"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  format?: "number" | "percentage" | "currency" | "time";
  icon?: string | ReactNode;
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  trend,
  format = "number",
  icon,
  className = "",
}: KPICardProps) {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case "percentage":
        return `${val}%`;
      case "currency":
        return `R$ ${val.toLocaleString("pt-BR")}`;
      case "time":
        return `${val} min`;
      default:
        return val.toLocaleString("pt-BR");
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➖";
    }
  };

  const getTrendColor = () => {
    // Para métricas onde "down" é positivo (como tempo de espera, custo)
    const isInverseTrend =
      format === "time" || title.toLowerCase().includes("custo");

    if (isInverseTrend) {
      switch (trend) {
        case "up":
          return "text-green-600";
        case "down":
          return "text-red-600";
        default:
          return "text-gray-600";
      }
    } else {
      switch (trend) {
        case "up":
          return "text-green-600";
        case "down":
          return "text-red-600";
        default:
          return "text-gray-600";
      }
    }
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-lg">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-bold">{formatValue(value, format)}</p>
            <div
              className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span>
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs mês anterior</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
