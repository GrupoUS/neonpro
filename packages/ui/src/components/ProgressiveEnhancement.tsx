import {
  AlertCircle,
  CheckCircle,
  Heart,
  Info,
  Layers,
  Shield,
  Smartphone,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";

export type FeatureLevel = "core" | "enhanced" | "premium" | "experimental";

export type CapabilityStatus =
  | "available"
  | "degraded"
  | "unavailable"
  | "fallback";

export interface FeatureCapability {
  id: string;
  name: string;
  level: FeatureLevel;
  status: CapabilityStatus;
  fallbackMessage?: string;
  fallbackComponent?: React.ReactNode;
  isEssential?: boolean;
  healthcareRelevant?: boolean;
  lgpdImportant?: boolean;
}

export interface ProgressiveEnhancementProps {
  /**
   * Array of feature capabilities to monitor
   */
  features: FeatureCapability[];
  /**
   * Current device capabilities
   */
  deviceCapabilities?: {
    isMobile: boolean;
    isLowEnd: boolean;
    supportsTouchScreen: boolean;
    supportsWebGL: boolean;
    supportsServiceWorker: boolean;
    hasGoodConnection: boolean;
    batteryLevel?: number;
  };
  /**
   * Current user preferences that affect capability
   */
  userPreferences?: {
    reducedMotion: boolean;
    highContrast: boolean;
    prefersSimplified: boolean;
    accessibilityMode: boolean;
  };
  /**
   * Network status affecting capabilities
   */
  networkStatus?: {
    online: boolean;
    effectiveType: "2g" | "3g" | "4g" | "5g" | "unknown";
    downlink?: number;
    rtt?: number;
  };
  /**
   * Show detailed capability information
   */
  showDetails?: boolean;
  /**
   * Emergency mode - only show essential healthcare features
   */
  emergencyMode?: boolean;
  /**
   * Callback when user wants to adjust settings for better performance
   */
  onOptimizePerformance?: () => void;
  /**
   * Callback when user wants to enable emergency mode
   */
  onEnableEmergencyMode?: () => void;
  /**
   * Show healthcare-specific progressive enhancement information
   */
  showHealthcareOptimization?: boolean;
  /**
   * Children to wrap with progressive enhancement
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const featureLevelInfo = {
  core: {
    label: "Essencial",
    description: "Funcionalidades básicas sempre disponíveis",
    color: "text-green-600",
    bgColor: "bg-green-100",
    priority: 1,
  },
  enhanced: {
    label: "Melhorado",
    description: "Melhorias de experiência do usuário",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    priority: 2,
  },
  premium: {
    label: "Premium",
    description: "Recursos avançados para dispositivos capazes",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    priority: 3,
  },
  experimental: {
    label: "Experimental",
    description: "Recursos em teste, podem falhar",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    priority: 4,
  },
};

const capabilityStatusInfo = {
  available: {
    label: "Disponível",
    icon: CheckCircle,
    color: "text-green-600",
    variant: "confirmed" as const,
  },
  degraded: {
    label: "Degradado",
    icon: AlertCircle,
    color: "text-yellow-600",
    variant: "medium" as const,
  },
  unavailable: {
    label: "Indisponível",
    icon: AlertCircle,
    color: "text-red-600",
    variant: "urgent" as const,
  },
  fallback: {
    label: "Alternativo",
    icon: Info,
    color: "text-blue-600",
    variant: "processing" as const,
  },
};

const getDeviceOptimizationLevel = (
  deviceCapabilities?: ProgressiveEnhancementProps["deviceCapabilities"],
) => {
  if (!deviceCapabilities) {
    return "unknown";
  }

  const score = [
    !deviceCapabilities.isLowEnd,
    deviceCapabilities.hasGoodConnection,
    !deviceCapabilities.isMobile,
    deviceCapabilities.supportsServiceWorker,
    deviceCapabilities.supportsWebGL,
    (deviceCapabilities.batteryLevel || 100) > 20,
  ].filter(Boolean).length;

  if (score >= 5) {
    return "optimal";
  }
  if (score >= 3) {
    return "good";
  }
  if (score >= 2) {
    return "limited";
  }
  return "minimal";
};

const getHealthcareEssentialFeatures = (
  features: FeatureCapability[],
): FeatureCapability[] => {
  return features.filter(
    (f) =>
      f.isEssential
      || f.healthcareRelevant
      || f.level === "core"
      || f.lgpdImportant,
  );
};

const FeatureStatusCard: React.FC<{
  feature: FeatureCapability;
  showDetails?: boolean;
  emergencyMode?: boolean;
}> = ({ feature, showDetails = false, emergencyMode = false }) => {
  const levelInfo = featureLevelInfo[feature.level];
  const statusInfo = capabilityStatusInfo[feature.status];
  const { icon: StatusIcon } = statusInfo;

  // Hide non-essential features in emergency mode
  if (emergencyMode && !feature.isEssential && !feature.healthcareRelevant) {
    return;
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all",
        feature.status === "available" && "border-green-200 bg-green-50",
        feature.status === "degraded" && "border-yellow-200 bg-yellow-50",
        feature.status === "unavailable" && "border-red-200 bg-red-50",
        feature.status === "fallback" && "border-blue-200 bg-blue-50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              statusInfo.color === "text-green-600" && "bg-green-100",
              statusInfo.color === "text-yellow-600" && "bg-yellow-100",
              statusInfo.color === "text-red-600" && "bg-red-100",
              statusInfo.color === "text-blue-600" && "bg-blue-100",
            )}
          >
            <StatusIcon className={cn("h-4 w-4", statusInfo.color)} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="font-medium text-sm">{feature.name}</h4>
              <Badge size="sm" variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
              {feature.healthcareRelevant && (
                <Badge size="sm" variant="processing">
                  <Heart className="mr-1 h-3 w-3" />
                  Healthcare
                </Badge>
              )}
              {feature.lgpdImportant && (
                <Badge size="sm" variant="outline">
                  <Shield className="mr-1 h-3 w-3" />
                  LGPD
                </Badge>
              )}
            </div>

            <div className="mb-2 flex items-center gap-2">
              <Badge
                className={cn(levelInfo.color, levelInfo.bgColor)}
                size="sm"
                variant="outline"
              >
                {levelInfo.label}
              </Badge>
            </div>

            {showDetails && (
              <p className="text-muted-foreground text-xs">
                {levelInfo.description}
              </p>
            )}

            {feature.status === "fallback" && feature.fallbackMessage && (
              <p className="mt-2 text-blue-700 text-xs">
                💡 {feature.fallbackMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {feature.status === "fallback" && feature.fallbackComponent && (
        <div className="mt-3 rounded border border-blue-200 bg-blue-100 p-2">
          {feature.fallbackComponent}
        </div>
      )}
    </div>
  );
};

const DeviceOptimizationSummary: React.FC<{
  deviceCapabilities?: ProgressiveEnhancementProps["deviceCapabilities"];
  networkStatus?: ProgressiveEnhancementProps["networkStatus"];
  onOptimizePerformance?: () => void;
}> = ({ deviceCapabilities, networkStatus, onOptimizePerformance }) => {
  const optimizationLevel = getDeviceOptimizationLevel(deviceCapabilities);

  const optimizationInfo = {
    optimal: {
      label: "Ótimo",
      description: "Dispositivo com capacidade total",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: CheckCircle,
    },
    good: {
      label: "Bom",
      description: "Boa experiência disponível",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: Info,
    },
    limited: {
      label: "Limitado",
      description: "Algumas limitações detectadas",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      icon: AlertCircle,
    },
    minimal: {
      label: "Mínimo",
      description: "Modo essencial recomendado",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: AlertCircle,
    },
    unknown: {
      label: "Desconhecido",
      description: "Capacidades não detectadas",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: Info,
    },
  };

  const info = optimizationInfo[optimizationLevel];
  const { icon: Icon } = info;

  return (
    <div className={cn("rounded-lg border p-4", info.bgColor)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5", info.color)} />
        <div className="flex-1">
          <h4 className="font-medium text-sm">
            Otimização do Dispositivo: {info.label}
          </h4>
          <p className="mt-1 text-muted-foreground text-sm">
            {info.description}
          </p>

          {deviceCapabilities && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-3 w-3" />
                  <span>
                    {deviceCapabilities.isMobile ? "Mobile" : "Desktop"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {deviceCapabilities.hasGoodConnection
                    ? <Wifi className="h-3 w-3 text-green-600" />
                    : <WifiOff className="h-3 w-3 text-red-600" />}
                  <span>
                    {networkStatus?.effectiveType || "unknown"} network
                  </span>
                </div>
                {deviceCapabilities.batteryLevel !== undefined && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span>{deviceCapabilities.batteryLevel}% bateria</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Layers className="h-3 w-3" />
                  <span>
                    {deviceCapabilities.isLowEnd ? "Low-end" : "High-end"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {onOptimizePerformance
            && (optimizationLevel === "limited"
              || optimizationLevel === "minimal")
            && (
              <button
                className="mt-3 text-blue-600 text-sm underline hover:text-blue-800"
                onClick={onOptimizePerformance}
              >
                Otimizar para melhor performance
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export const ProgressiveEnhancement = React.forwardRef<
  HTMLDivElement,
  ProgressiveEnhancementProps
>(
  (
    {
      features,
      deviceCapabilities,
      userPreferences,
      networkStatus,
      showDetails = false,
      emergencyMode = false,
      onOptimizePerformance,
      onEnableEmergencyMode,
      showHealthcareOptimization = true,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const essentialFeatures = getHealthcareEssentialFeatures(features);
    const availableFeatures = features.filter((f) => f.status === "available");
    const degradedFeatures = features.filter(
      (f) => f.status === "degraded" || f.status === "fallback",
    );
    const unavailableFeatures = features.filter(
      (f) => f.status === "unavailable",
    );

    const healthcareCompatibilityScore = Math.round(
      (essentialFeatures.filter((f) => f.status === "available").length
        / Math.max(essentialFeatures.length, 1))
        * 100,
    );

    const shouldShowOptimization = showHealthcareOptimization
      && (unavailableFeatures.length > 0 || degradedFeatures.length > 2);

    return (
      <div
        className={cn("space-y-4", className)}
        ref={ref}
        {...props}
        aria-labelledby="progressive-enhancement-title"
        role="region"
      >
        {/* Healthcare Compatibility Status */}
        {showHealthcareOptimization && (
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3
                className="flex items-center gap-2 font-semibold"
                id="progressive-enhancement-title"
              >
                <Heart className="h-5 w-5 text-red-600" />
                Compatibilidade Healthcare
              </h3>
              <Badge
                size="sm"
                variant={healthcareCompatibilityScore >= 90
                  ? "confirmed"
                  : healthcareCompatibilityScore >= 70
                  ? "medium"
                  : "urgent"}
              >
                {healthcareCompatibilityScore}% compatível
              </Badge>
            </div>

            <p className="mb-4 text-muted-foreground text-sm">
              Funcionalidades essenciais para cuidados médicos seguros e conformidade LGPD.
            </p>

            {emergencyMode && (
              <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                <div className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium text-orange-900 text-sm">
                      Modo de Emergência Ativo
                    </h4>
                    <p className="mt-1 text-orange-700 text-sm">
                      Apenas funcionalidades críticas para atendimento médico estão disponíveis.
                      Dados de pacientes e protocolos de emergência permanecem acessíveis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold text-green-600">
                  {availableFeatures.length}
                </div>
                <div className="text-muted-foreground">Disponível</div>
              </div>
              <div>
                <div className="font-semibold text-yellow-600">
                  {degradedFeatures.length}
                </div>
                <div className="text-muted-foreground">Degradado</div>
              </div>
              <div>
                <div className="font-semibold text-red-600">
                  {unavailableFeatures.length}
                </div>
                <div className="text-muted-foreground">Indisponível</div>
              </div>
            </div>
          </div>
        )}

        {/* Device Optimization Summary */}
        {shouldShowOptimization && (
          <DeviceOptimizationSummary
            deviceCapabilities={deviceCapabilities}
            networkStatus={networkStatus}
            onOptimizePerformance={onOptimizePerformance}
          />
        )}

        {/* Emergency Mode Option */}
        {!emergencyMode
          && onEnableEmergencyMode
          && unavailableFeatures.length > 3 && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-900 text-sm">
                    Modo de Emergência Disponível
                  </h4>
                  <p className="mt-1 text-orange-700 text-sm">
                    Ative o modo de emergência para garantir que funcionalidades críticas de
                    healthcare estejam sempre disponíveis, mesmo com limitações de dispositivo ou
                    rede.
                  </p>
                </div>
              </div>
              <button
                className="whitespace-nowrap rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700"
                onClick={onEnableEmergencyMode}
              >
                Ativar Modo Emergência
              </button>
            </div>
          </div>
        )}

        {/* Feature Status List */}
        {showDetails && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Status das Funcionalidades</h4>
            <div className="space-y-2">
              {features
                .sort((a, b) => {
                  // Sort by importance: essential healthcare first, then by level priority
                  if (a.isEssential !== b.isEssential) {
                    return a.isEssential ? -1 : 1;
                  }
                  if (a.healthcareRelevant !== b.healthcareRelevant) {
                    return a.healthcareRelevant ? -1 : 1;
                  }
                  return (
                    featureLevelInfo[a.level].priority
                    - featureLevelInfo[b.level].priority
                  );
                })
                .map((feature) => (
                  <FeatureStatusCard
                    emergencyMode={emergencyMode}
                    feature={feature}
                    key={feature.id}
                    showDetails={showDetails}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Progressive Enhancement Wrapper */}
        <div className="relative">
          {/* Reduced functionality overlay for severe limitations */}
          {healthcareCompatibilityScore < 50 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border border-red-200 bg-red-50/80 p-4 backdrop-blur-sm">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
                <h4 className="mb-1 font-medium text-red-900">
                  Funcionalidade Limitada
                </h4>
                <p className="text-red-700 text-sm">
                  Limitações detectadas podem afetar funcionalidades críticas de healthcare.
                  Considere usar um dispositivo com melhor conectividade.
                </p>
                {onOptimizePerformance && (
                  <button
                    className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    onClick={onOptimizePerformance}
                  >
                    Otimizar Sistema
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Enhanced functionality for good devices */}
          <div
            className={cn(
              "transition-opacity duration-300",
              healthcareCompatibilityScore < 50 && "opacity-50",
            )}
          >
            {children}
          </div>
        </div>

        {/* Constitutional Healthcare Notice */}
        {showHealthcareOptimization && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm">
                  Garantias Constitucionais Healthcare
                </h4>
                <p className="mt-1 text-blue-700 text-sm">
                  Funcionalidades essenciais de atendimento médico e proteção de dados LGPD são
                  mantidas independentemente das limitações técnicas. A segurança do paciente e a
                  privacidade dos dados são sempre priorizadas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ProgressiveEnhancement.displayName = "ProgressiveEnhancement";

// Utility hooks and functions for feature detection
export const useFeatureDetection = () => {
  const [capabilities, setCapabilities] = React.useState<
    ProgressiveEnhancementProps["deviceCapabilities"]
  >();

  React.useEffect(() => {
    const detectCapabilities = () => {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
      const isLowEnd = navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency <= 2
        : false;

      setCapabilities({
        isMobile,
        isLowEnd,
        supportsTouchScreen: "ontouchstart" in window,
        supportsWebGL: Boolean(window.WebGLRenderingContext),
        supportsServiceWorker: "serviceWorker" in navigator,
        hasGoodConnection: (navigator as unknown)?.connection?.effectiveType?.includes("4g") || false,
        // Battery API is async; keep undefined for now, avoid unknown access
        batteryLevel: undefined,
      });
    };

    detectCapabilities();
  }, []);

  return capabilities;
};

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = React.useState<
    ProgressiveEnhancementProps["networkStatus"]
  >();

  React.useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as unknown)?.connection;
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || "unknown",
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      });
    };

    updateNetworkStatus();
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);

  return networkStatus;
};
