"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";
import { cn } from "../../lib/utils";

// Confidence thresholds for healthcare AI operations
export const ConfidenceThresholds = {
  HIGH: 85,
  MEDIUM: 70,
  LOW: 0,
} as const;

// Healthcare-specific confidence categories with different thresholds
export const HealthcareConfidenceCategories = {
  "critical-diagnosis": { high: 95, medium: 85, label: "Diagnóstico Crítico", icon: "🩺" },
  "treatment-suggestion": { high: 90, medium: 80, label: "Sugestão de Tratamento", icon: "💊" },
  "risk-assessment": { high: 88, medium: 75, label: "Avaliação de Risco", icon: "⚠️" },
  "patient-triage": { high: 92, medium: 82, label: "Triagem de Pacientes", icon: "🏥" },
  "appointment-scheduling": { high: 85, medium: 70, label: "Agendamento", icon: "📅" },
  "voice-recognition": { high: 90, medium: 80, label: "Reconhecimento de Voz", icon: "🎤" },
  "document-analysis": { high: 93, medium: 85, label: "Análise Documental", icon: "📄" },
  "compliance-check": { high: 98, medium: 95, label: "Verificação de Conformidade", icon: "✅" },
  "general": { high: 85, medium: 70, label: "Geral", icon: "🤖" },
} as const;

export type ConfidenceCategory = keyof typeof HealthcareConfidenceCategories;

interface ConfidenceLevel {
  level: "high" | "medium" | "low";
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  label: string;
  description: string;
}

// Get confidence level based on score and category
export function getConfidenceLevel(
  score: number,
  category: ConfidenceCategory = "general",
): ConfidenceLevel {
  const thresholds = HealthcareConfidenceCategories[category];

  if (score >= thresholds.high) {
    return {
      level: "high",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      icon: "✅",
      label: "Alta Confiança",
      description:
        "A IA tem alta confiança nesta análise. Resultados são confiáveis para uso clínico.",
    };
  } else if (score >= thresholds.medium) {
    return {
      level: "medium",
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      icon: "⚠️",
      label: "Confiança Moderada",
      description:
        "A IA tem confiança moderada. Recomenda-se revisão profissional antes de usar clinicamente.",
    };
  } else {
    return {
      level: "low",
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      icon: "❌",
      label: "Baixa Confiança",
      description: "A IA tem baixa confiança. Resultado requer validação profissional obrigatória.",
    };
  }
}

// Main confidence pattern component
interface ConfidencePatternsProps {
  score: number;
  category?: ConfidenceCategory;
  variant?: "compact" | "detailed" | "inline" | "badge" | "progress";
  showPercentage?: boolean;
  showLabel?: boolean;
  showTooltip?: boolean;
  showIcon?: boolean;
  showDescription?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  context?: string; // Additional context for the confidence score
}

export function ConfidencePatterns({
  score,
  category = "general",
  variant = "compact",
  showPercentage = true,
  showLabel = true,
  showTooltip = true,
  showIcon = true,
  showDescription = false,
  className,
  size = "md",
  context,
}: ConfidencePatternsProps) {
  const confidenceLevel = getConfidenceLevel(score, category);
  const categoryInfo = HealthcareConfidenceCategories[category];

  // Size-based styling
  const sizeClasses = {
    sm: {
      text: "text-xs",
      padding: "px-2 py-1",
      icon: "text-xs",
      progress: "h-1",
    },
    md: {
      text: "text-sm",
      padding: "px-3 py-2",
      icon: "text-sm",
      progress: "h-2",
    },
    lg: {
      text: "text-base",
      padding: "px-4 py-3",
      icon: "text-base",
      progress: "h-3",
    },
  };

  const currentSize = sizeClasses[size];

  // Render different variants
  const renderVariant = () => {
    switch (variant) {
      case "compact":
        return (
          <div
            className={cn(
              "flex items-center gap-2",
              currentSize.text,
              className,
            )}
          >
            {showIcon && (
              <span className={currentSize.icon}>
                {confidenceLevel.icon}
              </span>
            )}
            <div
              className={cn(
                "flex items-center gap-1",
                confidenceLevel.textColor,
              )}
            >
              {showPercentage && (
                <span className="font-medium">
                  {Math.round(score)}%
                </span>
              )}
              {showLabel && (
                <span className="font-medium">
                  {confidenceLevel.label}
                </span>
              )}
            </div>
          </div>
        );

      case "detailed":
        return (
          <div
            className={cn(
              "space-y-3 p-4 rounded-lg border",
              confidenceLevel.bgColor,
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryInfo.icon}</span>
                <div>
                  <h4
                    className={cn(
                      "font-semibold",
                      confidenceLevel.textColor,
                    )}
                  >
                    {categoryInfo.label}
                  </h4>
                  {context && <p className="text-xs text-gray-600 mt-1">{context}</p>}
                </div>
              </div>
              <div
                className={cn(
                  "text-right",
                  confidenceLevel.textColor,
                )}
              >
                <div className="text-2xl font-bold">
                  {Math.round(score)}%
                </div>
                <div className="text-xs">
                  {confidenceLevel.label}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress
                value={score}
                className={cn("h-3", confidenceLevel.color)}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Confiança Mínima: {categoryInfo.medium}%</span>
                <span>Recomendada: {categoryInfo.high}%</span>
              </div>
            </div>

            {/* Description */}
            {showDescription && (
              <p
                className={cn(
                  "text-sm",
                  confidenceLevel.textColor,
                  "bg-white/50 p-2 rounded",
                )}
              >
                {confidenceLevel.description}
              </p>
            )}
          </div>
        );

      case "inline":
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              currentSize.text,
              confidenceLevel.textColor,
              className,
            )}
          >
            {showIcon && (
              <span className={currentSize.icon}>
                {confidenceLevel.icon}
              </span>
            )}
            {showPercentage && (
              <span className="font-medium">
                {Math.round(score)}%
              </span>
            )}
            {showLabel && <span>confiança</span>}
          </span>
        );

      case "badge":
        return (
          <Badge
            variant={confidenceLevel.level === "high"
              ? "default"
              : confidenceLevel.level === "medium"
              ? "secondary"
              : "destructive"}
            className={cn(
              "flex items-center gap-1",
              currentSize.text,
              className,
            )}
          >
            {showIcon && (
              <span className={currentSize.icon}>
                {confidenceLevel.icon}
              </span>
            )}
            {showPercentage && <span>{Math.round(score)}%</span>}
            {showLabel && <span>{confidenceLevel.label}</span>}
          </Badge>
        );

      case "progress":
        return (
          <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showIcon && (
                  <span className={currentSize.icon}>
                    {confidenceLevel.icon}
                  </span>
                )}
                {showLabel && (
                  <span
                    className={cn(
                      "font-medium",
                      currentSize.text,
                      confidenceLevel.textColor,
                    )}
                  >
                    {confidenceLevel.label}
                  </span>
                )}
              </div>
              {showPercentage && (
                <span
                  className={cn(
                    "font-bold",
                    currentSize.text,
                    confidenceLevel.textColor,
                  )}
                >
                  {Math.round(score)}%
                </span>
              )}
            </div>
            <Progress
              value={score}
              className={cn(currentSize.progress)}
            />
          </div>
        );

      default:
        return renderVariant();
    }
  };

  // Wrap with tooltip if enabled
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{renderVariant()}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>{categoryInfo.icon}</span>
                <span className="font-semibold">{categoryInfo.label}</span>
              </div>
              <p className="text-sm">{confidenceLevel.description}</p>
              {context && (
                <p className="text-xs text-gray-400 border-t pt-2">
                  Contexto: {context}
                </p>
              )}
              <div className="text-xs text-gray-400 border-t pt-2">
                <div>Limites para {categoryInfo.label}:</div>
                <div>• Alta: ≥{categoryInfo.high}%</div>
                <div>• Moderada: {categoryInfo.medium}-{categoryInfo.high - 1}%</div>
                <div>• Baixa: &lt;{categoryInfo.medium}%</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return renderVariant();
}

// Specialized confidence components for common healthcare scenarios
export function DiagnosisConfidence(
  { score, ...props }: Omit<ConfidencePatternsProps, "category">,
) {
  return (
    <ConfidencePatterns
      score={score}
      category="critical-diagnosis"
      {...props}
    />
  );
}

export function TreatmentConfidence(
  { score, ...props }: Omit<ConfidencePatternsProps, "category">,
) {
  return (
    <ConfidencePatterns
      score={score}
      category="treatment-suggestion"
      {...props}
    />
  );
}

export function RiskAssessmentConfidence(
  { score, ...props }: Omit<ConfidencePatternsProps, "category">,
) {
  return (
    <ConfidencePatterns
      score={score}
      category="risk-assessment"
      {...props}
    />
  );
}

export function VoiceRecognitionConfidence(
  { score, ...props }: Omit<ConfidencePatternsProps, "category">,
) {
  return (
    <ConfidencePatterns
      score={score}
      category="voice-recognition"
      {...props}
    />
  );
}

// Multi-confidence comparison component
interface MultiConfidenceProps {
  confidenceScores: {
    label: string;
    score: number;
    category?: ConfidenceCategory;
    context?: string;
  }[];
  className?: string;
  variant?: "horizontal" | "vertical";
}

export function MultiConfidence({
  confidenceScores,
  className,
  variant = "vertical",
}: MultiConfidenceProps) {
  const layoutClasses = variant === "horizontal"
    ? "flex gap-4 flex-wrap"
    : "space-y-3";

  return (
    <div className={cn(layoutClasses, className)}>
      {confidenceScores.map((item, index) => (
        <div key={index} className="min-w-0 flex-1">
          <div className="text-xs text-gray-600 mb-1 font-medium">
            {item.label}
          </div>
          <ConfidencePatterns
            score={item.score}
            category={item.category}
            context={item.context}
            variant="compact"
            showTooltip
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}

// Confidence trend component (shows confidence over time)
interface ConfidenceTrendProps {
  trends: {
    timestamp: string;
    score: number;
  }[];
  category?: ConfidenceCategory;
  className?: string;
}

export function ConfidenceTrend({ trends, category = "general", className }: ConfidenceTrendProps) {
  const latestScore = trends[trends.length - 1]?.score || 0;
  const confidenceLevel = getConfidenceLevel(latestScore, category);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Tendência de Confiança
        </span>
        <ConfidencePatterns
          score={latestScore}
          category={category}
          variant="badge"
          size="sm"
          showTooltip={false}
        />
      </div>

      <div className="space-y-1">
        {trends.slice(-5).map((trend, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{trend.timestamp}</span>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-8 rounded",
                  getConfidenceLevel(trend.score, category).color,
                )}
              />
              <span className="font-medium">{Math.round(trend.score)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConfidencePatterns;
