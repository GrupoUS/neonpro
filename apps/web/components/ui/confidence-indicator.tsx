"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  confidence: number;
  className?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceIndicator({
  confidence,
  className,
  showPercentage = true,
  size = "md",
}: ConfidenceIndicatorProps) {
  // Clamp confidence to [0,100] range and round it
  const clampedConfidence = Math.min(100, Math.max(0, Math.round(confidence)));

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 85) {return "high";}
    if (confidence >= 60) {return "medium";}
    return "low";
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getConfidenceText = (level: string) => {
    switch (level) {
      case "high":
        return "Alta Confiança";
      case "medium":
        return "Confiança Média";
      case "low":
        return "Baixa Confiança";
      default:
        return "Indefinido";
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-1";
      case "lg":
        return "text-sm px-4 py-2";
      default:
        return "text-sm px-3 py-1.5";
    }
  };

  const level = getConfidenceLevel(clampedConfidence);
  const colorClass = getConfidenceColor(level);
  const sizeClass = getSizeClass(size);
  const text = getConfidenceText(level);

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-2 border font-medium transition-colors",
        colorClass,
        sizeClass,
        className,
      )}
      role="status"
      aria-label={`Nível de confiança: ${text}${showPercentage ? `, ${clampedConfidence}%` : ""}`}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          level === "high" && "bg-green-600",
          level === "medium" && "bg-yellow-600",
          level === "low" && "bg-red-600",
        )}
        aria-hidden="true"
      />
      <span>{text}</span>
      {showPercentage && (
        <span className="font-semibold">
          {clampedConfidence}%
        </span>
      )}
    </Badge>
  );
}
