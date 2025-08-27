import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { Activity, AlertCircle, CheckCircle, Clock, Heart } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-muted/80 via-muted/60 to-muted/80 shadow-healthcare-sm backdrop-blur-sm transition-all duration-500",
  {
    variants: {
      variant: {
        default: "from-muted/80 via-muted/60 to-muted/80",
        medical: "from-primary/20 via-primary/15 to-primary/20 backdrop-blur-sm",
        treatment: "from-secondary/20 via-secondary/15 to-secondary/20 backdrop-blur-sm",
        critical:
          "from-destructive/20 via-destructive/15 to-destructive/20 shadow-healthcare-md backdrop-blur-sm",
        warning: "from-warning/20 via-warning/15 to-warning/20 backdrop-blur-sm",
        success: "from-success/20 via-success/15 to-success/20 backdrop-blur-sm",
      },
      size: {
        default: "h-2",
        sm: "h-1",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const progressBarVariants = cva(
  "h-full w-full flex-1 rounded-full shadow-sm transition-all duration-700 ease-out",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary shadow-primary/20",
        medical: "bg-gradient-to-r from-primary via-primary/90 to-primary shadow-primary/30",
        treatment:
          "bg-gradient-to-r from-secondary via-secondary/90 to-secondary shadow-secondary/30",
        critical:
          "bg-gradient-to-r from-destructive via-destructive/90 to-destructive shadow-destructive/40",
        warning: "bg-gradient-to-r from-warning via-warning/90 to-warning shadow-warning/30",
        success: "bg-gradient-to-r from-success via-success/90 to-success shadow-success/30",
      },
      animated: {
        true:
          "relative animate-pulse-healthcare bg-gradient-to-r before:absolute before:inset-0 before:animate-slide-in-right before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: false,
    },
  },
);

interface ProgressProps
  extends
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressBarVariants>
{
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      variant,
      size,
      animated,
      value = 0,
      showValue = false,
      showLabel = false,
      label,
      icon,
      pulse = false,
      ...props
    },
    ref,
  ) => (
    <div className="w-full space-y-2">
      {(showLabel || label || icon || showValue) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {icon && (
              <span
                aria-hidden="true"
                className="flex items-center justify-center"
              >
                {icon}
              </span>
            )}
            {(showLabel || label) && (
              <span className="font-medium text-foreground">
                {label || "Progresso"}
              </span>
            )}
          </div>
          {showValue && (
            <span className="font-medium text-muted-foreground">
              {Math.round(value || 0)}%
            </span>
          )}
        </div>
      )}

      <ProgressPrimitive.Root
        className={cn(progressVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            progressBarVariants({ variant, animated: animated || pulse }),
            pulse && "animate-pulse",
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName; // Healthcare-specific progress components

interface TreatmentProgressProps extends Omit<ProgressProps, "variant" | "label"> {
  treatmentName: string;
  phase: "initial" | "active" | "maintenance" | "completed";
  completedSessions: number;
  totalSessions: number;
  nextSession?: Date;
  patientResponse?: "excellent" | "good" | "fair" | "poor";
}

const TreatmentProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  TreatmentProgressProps
>(
  (
    {
      treatmentName,
      phase,
      completedSessions,
      totalSessions,
      nextSession,
      patientResponse = "good",
      ...props
    },
    ref,
  ) => {
    const progress = Math.round((completedSessions / totalSessions) * 100);

    const getPhaseColor = () => {
      switch (phase) {
        case "initial": {
          return "medical";
        }
        case "active": {
          return "treatment";
        }
        case "maintenance": {
          return "warning";
        }
        case "completed": {
          return "success";
        }
        default: {
          return "default";
        }
      }
    };

    const getPhaseLabel = () => {
      switch (phase) {
        case "initial": {
          return "Fase Inicial";
        }
        case "active": {
          return "Tratamento Ativo";
        }
        case "maintenance": {
          return "Manutenção";
        }
        case "completed": {
          return "Concluído";
        }
        default: {
          return "Tratamento";
        }
      }
    };

    const getResponseIcon = () => {
      switch (patientResponse) {
        case "excellent": {
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        }
        case "good": {
          return <CheckCircle className="h-4 w-4 text-blue-600" />;
        }
        case "fair": {
          return <Clock className="h-4 w-4 text-orange-600" />;
        }
        case "poor": {
          return <AlertCircle className="h-4 w-4 text-red-600" />;
        }
        default: {
          return <Activity className="h-4 w-4 text-gray-600" />;
        }
      }
    };

    return (
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <h4 className="font-medium text-foreground">{treatmentName}</h4>
          </div>
          <span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground text-xs">
            {getPhaseLabel()}
          </span>
        </div>

        <Progress
          pulse={phase === "active"}
          ref={ref}
          showValue
          value={progress}
          variant={getPhaseColor() as unknown}
          {...props}
        />

        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <div className="flex items-center gap-4">
            <span>
              {completedSessions} de {totalSessions} sessões
            </span>
            <div className="flex items-center gap-1">
              {getResponseIcon()}
              <span className="text-xs capitalize">
                {patientResponse === "excellent"
                  ? "Excelente"
                  : patientResponse === "good"
                  ? "Boa"
                  : patientResponse === "fair"
                  ? "Regular"
                  : "Baixa"}
              </span>
            </div>
          </div>
          {nextSession && (
            <span className="text-xs">
              Próxima: {nextSession.toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>
    );
  },
);
TreatmentProgress.displayName = "TreatmentProgress";

interface LGPDComplianceProgressProps extends Omit<ProgressProps, "variant" | "label"> {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    status: "compliant" | "warning" | "violation";
  }[];
  lastAudit?: Date;
  nextAudit?: Date;
}

const LGPDComplianceProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  LGPDComplianceProgressProps
>(({ overallScore, categories, lastAudit, nextAudit, ...props }, ref) => {
  const getComplianceVariant = () => {
    if (overallScore >= 90) {
      return "success";
    }
    if (overallScore >= 70) {
      return "warning";
    }
    return "critical";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": {
        return "text-green-600";
      }
      case "warning": {
        return "text-orange-600";
      }
      case "violation": {
        return "text-red-600";
      }
      default: {
        return "text-gray-600";
      }
    }
  };

  return (
    <div className="space-y-4 rounded-lg border-2 border-green-200 bg-green-50/30 p-4 dark:border-green-800 dark:bg-green-950/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded bg-green-100 p-1 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Conformidade LGPD</h4>
            <p className="text-muted-foreground text-xs">
              Pontuação geral de proteção de dados
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-2xl text-green-600">
            {overallScore}%
          </div>
          <div className="text-muted-foreground text-xs">
            {overallScore >= 90
              ? "Excelente"
              : overallScore >= 70
              ? "Bom"
              : "Precisa atenção"}
          </div>
        </div>
      </div>

      <Progress
        pulse={overallScore < 70}
        ref={ref}
        showValue={false}
        value={overallScore}
        variant={getComplianceVariant() as unknown}
        {...props}
      />

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            className="flex items-center justify-between text-sm"
            key={category.name}
          >
            <span className="text-muted-foreground">{category.name}</span>
            <div className="flex items-center gap-2">
              <span
                className={cn("font-medium", getStatusColor(category.status))}
              >
                {category.score}%
              </span>
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  category.status === "compliant" && "bg-green-500",
                  category.status === "warning" && "bg-orange-500",
                  category.status === "violation" && "bg-red-500",
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {(lastAudit || nextAudit) && (
        <div className="flex justify-between border-t pt-2 text-muted-foreground text-xs">
          {lastAudit && (
            <span>
              Última auditoria: {lastAudit.toLocaleDateString("pt-BR")}
            </span>
          )}
          {nextAudit && (
            <span>
              Próxima auditoria: {nextAudit.toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
LGPDComplianceProgress.displayName = "LGPDComplianceProgress";
interface PatientRecoveryProgressProps extends Omit<ProgressProps, "variant" | "label"> {
  patientName: string;
  condition: string;
  recoveryStage: "critical" | "stable" | "improving" | "recovered";
  vitalSigns: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
  };
  recoveryPercentage: number;
  estimatedDischarge?: Date;
}

const PatientRecoveryProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  PatientRecoveryProgressProps
>(
  (
    {
      patientName,
      condition,
      recoveryStage,
      vitalSigns,
      recoveryPercentage,
      estimatedDischarge,
      ...props
    },
    ref,
  ) => {
    const getStageVariant = () => {
      switch (recoveryStage) {
        case "critical": {
          return "critical";
        }
        case "stable": {
          return "warning";
        }
        case "improving": {
          return "medical";
        }
        case "recovered": {
          return "success";
        }
        default: {
          return "default";
        }
      }
    };

    const getStageLabel = () => {
      switch (recoveryStage) {
        case "critical": {
          return "Estado Crítico";
        }
        case "stable": {
          return "Estável";
        }
        case "improving": {
          return "Melhorando";
        }
        case "recovered": {
          return "Recuperado";
        }
        default: {
          return "Não definido";
        }
      }
    };

    const getStageIcon = () => {
      switch (recoveryStage) {
        case "critical": {
          return <AlertCircle className="h-4 w-4 text-red-600" />;
        }
        case "stable": {
          return <Clock className="h-4 w-4 text-orange-600" />;
        }
        case "improving": {
          return <Activity className="h-4 w-4 text-blue-600" />;
        }
        case "recovered": {
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        }
        default: {
          return <Heart className="h-4 w-4 text-gray-600" />;
        }
      }
    };

    return (
      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">{patientName}</h4>
              <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground text-xs">
                {condition}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {getStageIcon()}
              <span className="font-medium text-sm">{getStageLabel()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-primary text-xl">
              {recoveryPercentage}%
            </div>
            <div className="text-muted-foreground text-xs">Recuperação</div>
          </div>
        </div>

        <Progress
          animated={recoveryStage === "improving"}
          pulse={recoveryStage === "critical"}
          ref={ref}
          showValue={false}
          value={recoveryPercentage}
          variant={getStageVariant() as unknown}
          {...props}
        />

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-foreground">
              {vitalSigns.temperature}°C
            </div>
            <div className="text-muted-foreground text-xs">Temperatura</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">
              {vitalSigns.bloodPressure}
            </div>
            <div className="text-muted-foreground text-xs">Pressão</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">
              {vitalSigns.heartRate} bpm
            </div>
            <div className="text-muted-foreground text-xs">Frequência</div>
          </div>
        </div>

        {estimatedDischarge && (
          <div className="border-t pt-2 text-center text-muted-foreground text-xs">
            Alta prevista: {estimatedDischarge.toLocaleDateString("pt-BR")}
          </div>
        )}
      </div>
    );
  },
);
PatientRecoveryProgress.displayName = "PatientRecoveryProgress";

export {
  LGPDComplianceProgress,
  type LGPDComplianceProgressProps,
  PatientRecoveryProgress,
  type PatientRecoveryProgressProps,
  Progress,
  progressBarVariants,
  type ProgressProps,
  progressVariants,
  TreatmentProgress,
  type TreatmentProgressProps,
};
