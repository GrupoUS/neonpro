"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress"; // Unused import
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type React from "react";
import { createContext, useCallback, useContext, /*useEffect,*/ useState } from "react"; // useEffect unused import

// Context types for healthcare AI system
export enum ContextType {
  AI_AUTONOMOUS = "ai_autonomous", // Pure AI processing
  AI_ASSISTED = "ai_assisted", // AI with human oversight
  HUMAN_PRIMARY = "human_primary", // Human with AI suggestions
  MANUAL_ONLY = "manual_only", // No AI assistance
  EMERGENCY = "emergency", // Emergency protocols
  COMPLIANCE_MODE = "compliance_mode", // LGPD/ANVISA compliance mode
}

// Healthcare departments/specialties
export enum Department {
  GENERAL = "general",
  AESTHETIC = "aesthetic",
  DERMATOLOGY = "dermatology",
  SURGERY = "surgery",
  EMERGENCY = "emergency",
  PEDIATRICS = "pediatrics",
  GERIATRICS = "geriatrics",
}

// User roles in healthcare system
export enum UserRole {
  ADMIN = "admin",
  DOCTOR = "doctor",
  NURSE = "nurse",
  RECEPTIONIST = "receptionist",
  TECHNICIAN = "technician",
  PATIENT = "patient",
}

// Context switching reasons
export enum SwitchReason {
  USER_REQUEST = "user_request",
  AI_CONFIDENCE_LOW = "ai_confidence_low",
  EMERGENCY_DETECTED = "emergency_detected",
  COMPLIANCE_REQUIRED = "compliance_required",
  ERROR_RECOVERY = "error_recovery",
  WORKFLOW_CHANGE = "workflow_change",
  PATIENT_ESCALATION = "patient_escalation",
}

// Context state definition
export interface ContextState {
  type: ContextType;
  department: Department;
  userRole: UserRole;
  patientId?: string;
  sessionId: string;
  aiConfidence?: number;
  activeWorkflow?: string;
  permissions: string[];
  metadata: Record<string, unknown>;
  lastSwitchTime: number;
  switchReason?: SwitchReason;
}

// Context switching transition rules
const TransitionRules = {
  [ContextType.AI_AUTONOMOUS]: {
    canSwitchTo: [
      ContextType.AI_ASSISTED,
      ContextType.HUMAN_PRIMARY,
      ContextType.MANUAL_ONLY,
      ContextType.EMERGENCY,
    ],
    requiresConfirmation: [ContextType.MANUAL_ONLY],
    autoSwitchTriggers: {
      [ContextType.AI_ASSISTED]: { minConfidence: 70 },
      [ContextType.EMERGENCY]: { emergencyDetected: true },
      [ContextType.COMPLIANCE_MODE]: { complianceRequired: true },
    },
  },
  [ContextType.AI_ASSISTED]: {
    canSwitchTo: [
      ContextType.AI_AUTONOMOUS,
      ContextType.HUMAN_PRIMARY,
      ContextType.MANUAL_ONLY,
      ContextType.EMERGENCY,
    ],
    requiresConfirmation: [],
    autoSwitchTriggers: {
      [ContextType.AI_AUTONOMOUS]: { minConfidence: 90 },
      [ContextType.HUMAN_PRIMARY]: { minConfidence: 50 },
    },
  },
  [ContextType.HUMAN_PRIMARY]: {
    canSwitchTo: [
      ContextType.AI_AUTONOMOUS,
      ContextType.AI_ASSISTED,
      ContextType.MANUAL_ONLY,
      ContextType.EMERGENCY,
    ],
    requiresConfirmation: [ContextType.AI_AUTONOMOUS],
    autoSwitchTriggers: {},
  },
  [ContextType.MANUAL_ONLY]: {
    canSwitchTo: [
      ContextType.AI_AUTONOMOUS,
      ContextType.AI_ASSISTED,
      ContextType.HUMAN_PRIMARY,
      ContextType.EMERGENCY,
    ],
    requiresConfirmation: [ContextType.AI_AUTONOMOUS, ContextType.AI_ASSISTED],
    autoSwitchTriggers: {
      [ContextType.EMERGENCY]: { emergencyDetected: true },
    },
  },
  [ContextType.EMERGENCY]: {
    canSwitchTo: [
      ContextType.AI_ASSISTED,
      ContextType.HUMAN_PRIMARY,
      ContextType.MANUAL_ONLY,
    ],
    requiresConfirmation: [],
    autoSwitchTriggers: {},
    priority: true,
  },
  [ContextType.COMPLIANCE_MODE]: {
    canSwitchTo: [
      ContextType.AI_ASSISTED,
      ContextType.HUMAN_PRIMARY,
      ContextType.MANUAL_ONLY,
    ],
    requiresConfirmation: [],
    autoSwitchTriggers: {},
    priority: true,
  },
} as const;

// Context descriptions for UI
const ContextDescriptions = {
  [ContextType.AI_AUTONOMOUS]: {
    title: "IA Autônoma",
    description: "Sistema funcionando totalmente com inteligência artificial",
    icon: "🤖",
    color: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  [ContextType.AI_ASSISTED]: {
    title: "IA Assistida",
    description: "IA com supervisão profissional ativa",
    icon: "🤝",
    color: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  [ContextType.HUMAN_PRIMARY]: {
    title: "Profissional Principal",
    description: "Controle humano com sugestões da IA",
    icon: "👨‍⚕️",
    color: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
  [ContextType.MANUAL_ONLY]: {
    title: "Modo Manual",
    description: "Sem assistência da inteligência artificial",
    icon: "✋",
    color: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  },
  [ContextType.EMERGENCY]: {
    title: "Emergência Médica",
    description: "Protocolos de emergência ativados",
    icon: "🚨",
    color: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  [ContextType.COMPLIANCE_MODE]: {
    title: "Modo Conformidade",
    description: "Verificação LGPD/ANVISA/CFM ativa",
    icon: "🛡️",
    color: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
  },
} as const;

// Context switching hook
export function useContextSwitching(initialContext: Partial<ContextState> = {}) {
  const [context, setContext] = useState<ContextState>({
    type: ContextType.AI_ASSISTED,
    department: Department.GENERAL,
    userRole: UserRole.DOCTOR,
    sessionId: `session_${Date.now()}`,
    permissions: [],
    metadata: {},
    lastSwitchTime: Date.now(),
    ...initialContext,
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  // Switch to new context with transition
  const switchContext = useCallback(async (
    newType: ContextType,
    reason: SwitchReason = SwitchReason.USER_REQUEST,
    preserveData: Record<string, unknown> = {},
  ) => {
    const currentRules = TransitionRules[context.type];

    // Check if transition is allowed
    if (!currentRules.canSwitchTo.includes(newType)) {
      console.warn(`Cannot switch from ${context.type} to ${newType}`);
      return false;
    }

    setIsTransitioning(true);
    setTransitionProgress(0);

    // Simulate transition process
    const transitionSteps = [
      "Salvando contexto atual...",
      "Validando permissões...",
      "Preparando novo contexto...",
      "Aplicando configurações...",
      "Finalizando transição...",
    ];

    for (let i = 0; i < transitionSteps.length; i++) {
      setTransitionProgress((i + 1) * 20);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Update context
    setContext(prev => ({
      ...prev,
      type: newType,
      lastSwitchTime: Date.now(),
      switchReason: reason,
      metadata: { ...prev.metadata, ...preserveData },
    }));

    setTransitionProgress(100);
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionProgress(0);
    }, 500);

    return true;
  }, [context]);

  // Auto-switch based on conditions
  const checkAutoSwitch = useCallback((conditions: Record<string, unknown>) => {
    const currentRules = TransitionRules[context.type];

    for (const [targetType, triggers] of Object.entries(currentRules.autoSwitchTriggers)) {
      let shouldSwitch = true;

      for (const [key, value] of Object.entries(triggers)) {
        if (conditions[key] !== value) {
          shouldSwitch = false;
          break;
        }
      }

      if (shouldSwitch) {
        switchContext(
          targetType as ContextType,
          SwitchReason.AI_CONFIDENCE_LOW,
        );
        break;
      }
    }
  }, [context, switchContext]);

  return {
    context,
    switchContext,
    checkAutoSwitch,
    isTransitioning,
    transitionProgress,
  };
}

// Context switching component
interface ContextSwitchingProps {
  currentContext: ContextState;
  onContextSwitch?: (newType: ContextType, reason: SwitchReason) => Promise<boolean>;
  showTransitionAnimation?: boolean;
  allowedSwitches?: ContextType[];
  className?: string;
}

export function ContextSwitching({
  currentContext,
  onContextSwitch,
  showTransitionAnimation = true,
  allowedSwitches,
  className,
}: ContextSwitchingProps) {
  const [selectedContext, setSelectedContext] = useState<ContextType | null>(null);
  const [isConfirmationRequired, setIsConfirmationRequired] = useState(false);

  const currentDesc = ContextDescriptions[currentContext.type];
  const currentRules = TransitionRules[currentContext.type];

  const availableSwitches = allowedSwitches || currentRules.canSwitchTo;

  const handleContextSwitch = async (newType: ContextType) => {
    const requiresConfirmation = currentRules.requiresConfirmation.includes(newType);

    if (requiresConfirmation && !isConfirmationRequired) {
      setSelectedContext(newType);
      setIsConfirmationRequired(true);
      return;
    }

    const success = await onContextSwitch?.(newType, SwitchReason.USER_REQUEST);
    if (success) {
      setSelectedContext(null);
      setIsConfirmationRequired(false);
    }
  };

  const cancelSwitch = () => {
    setSelectedContext(null);
    setIsConfirmationRequired(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Context Display */}
      <Card
        className={cn(
          "border-2",
          currentDesc.color,
          currentDesc.borderColor,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label="Context icon">
                {currentDesc.icon}
              </span>
              <div>
                <CardTitle className={cn("text-lg", currentDesc.textColor)}>
                  {currentDesc.title}
                </CardTitle>
                <CardDescription>
                  {currentDesc.description}
                </CardDescription>
              </div>
            </div>

            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                {currentContext.department}
              </Badge>
              {currentContext.aiConfidence && (
                <div className="text-sm text-gray-600">
                  IA: {Math.round(currentContext.aiConfidence)}%
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {currentContext.patientId && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>👤</span>
              <span>Paciente: {currentContext.patientId}</span>
              {currentContext.activeWorkflow && (
                <>
                  <span>•</span>
                  <span>Fluxo: {currentContext.activeWorkflow}</span>
                </>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Context Switch Options */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-700">
          Alternar para:
        </h4>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {availableSwitches.map((switchType) => {
            const switchDesc = ContextDescriptions[switchType];
            const requiresConfirmation = currentRules.requiresConfirmation.includes(switchType);

            return (
              <TooltipProvider key={switchType}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContextSwitch(switchType)}
                      className={cn(
                        "h-auto p-3 flex flex-col items-start gap-1 text-left",
                        "hover:bg-gray-50",
                      )}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span>{switchDesc.icon}</span>
                        <span className="font-medium text-sm">
                          {switchDesc.title}
                        </span>
                        {requiresConfirmation && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            Confirmar
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">
                        {switchDesc.description}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="max-w-xs">
                      <div className="font-semibold">{switchDesc.title}</div>
                      <div className="text-sm">{switchDesc.description}</div>
                      {requiresConfirmation && (
                        <div className="text-xs mt-1 text-yellow-600">
                          ⚠️ Requer confirmação adicional
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isConfirmationRequired && selectedContext && (
        <Alert>
          <AlertDescription className="space-y-3">
            <div>
              <strong>Confirmação Necessária</strong>
            </div>
            <p className="text-sm">
              Você está prestes a alternar para{" "}
              <strong>{ContextDescriptions[selectedContext].title}</strong>.
              {selectedContext === ContextType.MANUAL_ONLY && (
                " Isto desativará todas as funcionalidades de IA."
              )}
              {selectedContext === ContextType.AI_AUTONOMOUS && (
                " Isto permitirá que a IA funcione sem supervisão direta."
              )}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleContextSwitch(selectedContext)}
              >
                Confirmar Mudança
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelSwitch}
              >
                Cancelar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Context provider for app-wide context management
const ContextSwitchingContext = createContext<
  {
    context: ContextState;
    switchContext: (type: ContextType, reason?: SwitchReason) => Promise<boolean>;
    isTransitioning: boolean;
  } | null
>(null);

export function ContextSwitchingProvider({
  children,
  initialContext = {},
}: {
  children: React.ReactNode;
  initialContext?: Partial<ContextState>;
}) {
  const { context, switchContext, isTransitioning } = useContextSwitching(initialContext);

  return (
    <ContextSwitchingContext.Provider
      value={{
        context,
        switchContext,
        isTransitioning,
      }}
    >
      {children}
    </ContextSwitchingContext.Provider>
  );
}

export function useContextSwitchingContext() {
  const contextValue = useContext(ContextSwitchingContext);
  if (!contextValue) {
    throw new Error("useContextSwitchingContext must be used within ContextSwitchingProvider");
  }
  return contextValue;
}

// Quick switch buttons for common transitions
export function QuickContextSwitcher({ className }: { className?: string; }) {
  const { context, switchContext, isTransitioning } = useContextSwitchingContext();

  const quickSwitches = [
    {
      type: ContextType.EMERGENCY,
      label: "Emergência",
      icon: "🚨",
      variant: "destructive" as const,
      hotkey: "Ctrl+E",
    },
    {
      type: ContextType.AI_AUTONOMOUS,
      label: "IA Auto",
      icon: "🤖",
      variant: "default" as const,
      hotkey: "Ctrl+A",
    },
    {
      type: ContextType.MANUAL_ONLY,
      label: "Manual",
      icon: "✋",
      variant: "outline" as const,
      hotkey: "Ctrl+M",
    },
  ];

  return (
    <div className={cn("flex gap-2", className)}>
      {quickSwitches.map((quick) => (
        <TooltipProvider key={quick.type}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={quick.variant}
                disabled={isTransitioning || context.type === quick.type}
                onClick={() => switchContext(quick.type, SwitchReason.USER_REQUEST)}
                className="flex items-center gap-1"
              >
                <span>{quick.icon}</span>
                <span className="hidden md:inline">{quick.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <div className="font-semibold">{quick.label}</div>
                <div className="text-xs">{quick.hotkey}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

export default ContextSwitching;
