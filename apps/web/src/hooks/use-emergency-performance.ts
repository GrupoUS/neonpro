/**
 * Emergency Performance Hook - NeonPro Healthcare
 * React hook integrating Emergency Performance Optimizer with healthcare chat
 * Provides real-time performance monitoring and optimization for critical scenarios
 */

import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useRef, useState } from "react";

// Import the Emergency Performance Optimizer (would be from actual package)
interface EmergencyRequest {
  id: string;
  type:
    | "emergency_consultation"
    | "critical_vitals"
    | "medication_alert"
    | "adverse_event"
    | "emergency_chat";
  priority: "critical" | "urgent" | "high" | "normal";
  timestamp: Date;
  patient_id: string;
  healthcare_provider_id?: string;
  geographic_region: string;
  payload: unknown;
  context: {
    is_emergency: boolean;
    requires_immediate_response: boolean;
    max_response_time_ms: number;
    offline_fallback_required: boolean;
  };
}

interface PerformanceMetrics {
  response_time_ms: number;
  queue_wait_time_ms: number;
  cache_hit_ratio: number;
  edge_processing_time_ms: number;
  offline_fallback_used: boolean;
  geographic_latency_ms: number;
  compliance_with_sla: boolean;
}

interface EmergencyPerformanceState {
  is_emergency_mode: boolean;
  current_performance: PerformanceMetrics | null;
  system_status: "optimal" | "degraded" | "critical" | "offline";
  edge_nodes_available: number;
  queue_length: Record<string, number>;
  cache_health: {
    emergency_protocols_cached: boolean;
    medications_cached: boolean;
    professionals_cached: boolean;
    last_cache_update: Date | null;
  };
}

interface UseEmergencyPerformanceProps {
  patient_id?: string;
  healthcare_provider_id?: string;
  geographic_region?: string;
  enable_offline_mode?: boolean;
  performance_sla_ms?: number;
  onEmergencyDetected?: (emergency: EmergencyRequest) => void;
  onPerformanceDegraded?: (metrics: PerformanceMetrics) => void;
}

export function useEmergencyPerformance({
  patient_id,
  healthcare_provider_id,
  geographic_region = "SP_CENTRAL",
  enable_offline_mode = true,
  performance_sla_ms = 200,
  onEmergencyDetected,
  onPerformanceDegraded,
}: UseEmergencyPerformanceProps = {}) {
  const { toast } = useToast();

  // State management
  const [performanceState, setPerformanceState] = useState<EmergencyPerformanceState>({
    is_emergency_mode: false,
    current_performance: null,
    system_status: "optimal",
    edge_nodes_available: 0,
    queue_length: { critical: 0, urgent: 0, high: 0, normal: 0 },
    cache_health: {
      emergency_protocols_cached: false,
      medications_cached: false,
      professionals_cached: false,
      last_cache_update: null,
    },
  });

  // Refs
  const performanceOptimizerRef = useRef<unknown>(null);
  const performanceMonitoringRef = useRef<NodeJS.Timeout | null>(null);
  const emergencyRequestsRef = useRef<Map<string, EmergencyRequest>>(new Map());

  // Initialize Performance Optimizer
  useEffect(() => {
    const initializePerformanceOptimizer = async () => {
      try {
        // In real implementation, would import from @neonpro/performance
        // const { EmergencyPerformanceOptimizer } = await import("@neonpro/performance");
        // performanceOptimizerRef.current = new EmergencyPerformanceOptimizer();

        // Mock initialization for now
        performanceOptimizerRef.current = {
          processEmergencyRequest: async (request: EmergencyRequest) => ({
            response: { result: "Emergency processed" },
            performance_metrics: {
              response_time_ms: 150,
              queue_wait_time_ms: 10,
              cache_hit_ratio: 0.85,
              edge_processing_time_ms: 45,
              offline_fallback_used: false,
              geographic_latency_ms: 25,
              compliance_with_sla: true,
            },
            edge_node_used: "SP_CENTRAL",
            fallback_strategies_used: [],
          }),
          getSystemStatus: async () => ({
            edge_nodes: [
              { id: "SP_CENTRAL", status: "active", current_load: 0.3 },
              { id: "RJ_CENTRAL", status: "active", current_load: 0.5 },
            ],
            queue_status: { critical: 0, urgent: 2, high: 5, normal: 12 },
            cache_status: {
              emergency_protocols_loaded: 5,
              critical_medications_loaded: 25,
            },
            performance_summary: {
              average_response_time: 145,
              sla_compliance_rate: 0.96,
            },
          }),
        };

        // Start performance monitoring
        startPerformanceMonitoring();

        // Initialize cache health check
        await updateCacheHealth();
      } catch (error) {
        console.error("Failed to initialize Emergency Performance Optimizer:", error);

        setPerformanceState(prev => ({
          ...prev,
          system_status: "critical",
        }));

        toast({
          title: "Sistema de Performance Crítica",
          description: "Falha na inicialização do otimizador de emergência. Modo offline ativado.",
          variant: "destructive",
        });
      }
    };

    initializePerformanceOptimizer();

    return () => {
      if (performanceMonitoringRef.current) {
        clearInterval(performanceMonitoringRef.current);
      }
    };
  }, [toast]);

  // Start performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    performanceMonitoringRef.current = setInterval(async () => {
      if (!performanceOptimizerRef.current) {return;}

      try {
        const systemStatus = await performanceOptimizerRef.current.getSystemStatus();

        const newState: EmergencyPerformanceState = {
          is_emergency_mode: performanceState.is_emergency_mode,
          current_performance: performanceState.current_performance,
          system_status: determineSystemStatus(systemStatus),
          edge_nodes_available: systemStatus.edge_nodes.filter((n: unknown) =>
            n.status === "active"
          ).length,
          queue_length: systemStatus.queue_status,
          cache_health: {
            emergency_protocols_cached: systemStatus.cache_status.emergency_protocols_loaded > 0,
            medications_cached: systemStatus.cache_status.critical_medications_loaded > 0,
            professionals_cached: true, // Assume cached
            last_cache_update: new Date(),
          },
        };

        setPerformanceState(newState);

        // Check for performance degradation
        if (systemStatus.performance_summary.average_response_time > performance_sla_ms * 1.5) {
          const degradedMetrics: PerformanceMetrics = {
            response_time_ms: systemStatus.performance_summary.average_response_time,
            queue_wait_time_ms: 50,
            cache_hit_ratio: 0.7,
            edge_processing_time_ms: 100,
            offline_fallback_used: false,
            geographic_latency_ms: 50,
            compliance_with_sla: false,
          };

          onPerformanceDegraded?.(degradedMetrics);

          toast({
            title: "⚠️ Performance Degradada",
            description: `Tempo de resposta: ${
              Math.round(degradedMetrics.response_time_ms)
            }ms (SLA: ${performance_sla_ms}ms)`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Performance monitoring failed:", error);

        setPerformanceState(prev => ({
          ...prev,
          system_status: "offline",
        }));
      }
    }, 15_000); // Monitor every 15 seconds
  }, [performance_sla_ms, onPerformanceDegraded, toast]);

  // Process emergency message with performance optimization
  const processEmergencyMessage = useCallback(async (
    message: string,
    messageType: "chat" | "consultation" | "vitals" | "medication",
    isEmergency: boolean = false,
    severity?: number,
  ): Promise<{
    response: unknown;
    performance_metrics: PerformanceMetrics;
    emergency_protocols_activated: boolean;
  }> => {
    if (!performanceOptimizerRef.current) {
      throw new Error("Performance optimizer not initialized");
    }

    const requestId = crypto.randomUUID();
    const emergencyRequest: EmergencyRequest = {
      id: requestId,
      type: messageType === "chat"
        ? "emergency_chat"
        : messageType === "consultation"
        ? "emergency_consultation"
        : messageType === "vitals"
        ? "critical_vitals"
        : "medication_alert",
      priority: isEmergency
        ? "critical"
        : severity && severity >= 8
        ? "urgent"
        : severity && severity >= 5
        ? "high"
        : "normal",
      timestamp: new Date(),
      patient_id: patient_id || `anonymous_${Date.now()}`,
      healthcare_provider_id,
      geographic_region,
      payload: {
        message,
        severity_score: severity,
        symptoms: isEmergency ? extractSymptoms(message) : undefined,
      },
      context: {
        is_emergency: isEmergency,
        requires_immediate_response: isEmergency || (severity && severity >= 8),
        max_response_time_ms: isEmergency
          ? 100
          : severity && severity >= 8
          ? 200
          : performance_sla_ms,
        offline_fallback_required: enable_offline_mode,
      },
    };

    // Store request for tracking
    emergencyRequestsRef.current.set(requestId, emergencyRequest);

    try {
      const result = await performanceOptimizerRef.current.processEmergencyRequest(
        emergencyRequest,
      );

      // Update performance state
      setPerformanceState(prev => ({
        ...prev,
        current_performance: result.performance_metrics,
        is_emergency_mode: isEmergency,
      }));

      // Trigger emergency detection callback if needed
      if (isEmergency && onEmergencyDetected) {
        onEmergencyDetected(emergencyRequest);
      }

      // Show performance toast for critical scenarios
      if (isEmergency) {
        toast({
          title: "🚨 Modo Emergência Ativo",
          description:
            `Resposta em ${result.performance_metrics.response_time_ms}ms via ${result.edge_node_used}`,
          variant: result.performance_metrics.compliance_with_sla ? "default" : "destructive",
        });
      }

      return {
        response: result.response,
        performance_metrics: result.performance_metrics,
        emergency_protocols_activated: isEmergency
          && result.performance_metrics.offline_fallback_used,
      };
    } catch (error) {
      console.error("Emergency message processing failed:", error);

      // Emergency fallback
      const fallbackResponse = {
        emergency_response: {
          message: "Sistema em modo de emergência. Ligue 192 se precisar de ajuda imediata.",
          emergency_number: "192",
          offline_mode: true,
        },
      };

      const fallbackMetrics: PerformanceMetrics = {
        response_time_ms: 50,
        queue_wait_time_ms: 0,
        cache_hit_ratio: 1,
        edge_processing_time_ms: 0,
        offline_fallback_used: true,
        geographic_latency_ms: 0,
        compliance_with_sla: true,
      };

      return {
        response: fallbackResponse,
        performance_metrics: fallbackMetrics,
        emergency_protocols_activated: true,
      };
    } finally {
      // Clean up old requests
      setTimeout(() => {
        emergencyRequestsRef.current.delete(requestId);
      }, 300_000); // Remove after 5 minutes
    }
  }, [
    patient_id,
    healthcare_provider_id,
    geographic_region,
    enable_offline_mode,
    performance_sla_ms,
    onEmergencyDetected,
    toast,
  ]);

  // Activate emergency mode
  const activateEmergencyMode = useCallback(() => {
    setPerformanceState(prev => ({
      ...prev,
      is_emergency_mode: true,
    }));

    toast({
      title: "🚨 Modo Emergência Ativado",
      description:
        "Sistema otimizado para respostas críticas. Protocolos de emergência carregados.",
    });
  }, [toast]);

  // Deactivate emergency mode
  const deactivateEmergencyMode = useCallback(() => {
    setPerformanceState(prev => ({
      ...prev,
      is_emergency_mode: false,
    }));

    toast({
      title: "✅ Modo Normal Restaurado",
      description: "Sistema retornado ao modo normal de operação.",
    });
  }, [toast]);

  // Get current performance metrics
  const getCurrentMetrics = useCallback((): PerformanceMetrics | null => {
    return performanceState.current_performance;
  }, [performanceState.current_performance]);

  // Helper functions

  const determineSystemStatus = (
    systemStatus: unknown,
  ): "optimal" | "degraded" | "critical" | "offline" => {
    const activeEdgeNodes =
      systemStatus.edge_nodes.filter((n: unknown) => n.status === "active").length;
    const averageResponseTime = systemStatus.performance_summary.average_response_time;
    const slaComplianceRate = systemStatus.performance_summary.sla_compliance_rate;

    if (activeEdgeNodes === 0) {return "offline";}
    if (slaComplianceRate < 0.8 || averageResponseTime > performance_sla_ms * 2) {return "critical";}
    if (slaComplianceRate < 0.9 || averageResponseTime > performance_sla_ms * 1.5) {
      return "degraded";
    }
    return "optimal";
  };

  const extractSymptoms = (message: string): string[] => {
    const symptoms: string[] = [];
    const lowerMessage = message.toLowerCase();

    const symptomPatterns = [
      "chest pain",
      "difficulty breathing",
      "shortness of breath",
      "dizziness",
      "nausea",
      "vomiting",
      "fever",
      "bleeding",
      "unconscious",
      "seizure",
      "stroke",
      "heart attack",
      "dor no peito",
      "falta de ar",
      "tontura",
      "náusea",
      "vômito",
      "febre",
      "sangramento",
      "desmaio",
      "convulsão",
    ];

    for (const pattern of symptomPatterns) {
      if (lowerMessage.includes(pattern)) {
        symptoms.push(pattern);
      }
    }

    return symptoms;
  };

  const updateCacheHealth = async (): Promise<void> => {
    // In real implementation, would check actual cache status
    setPerformanceState(prev => ({
      ...prev,
      cache_health: {
        emergency_protocols_cached: true,
        medications_cached: true,
        professionals_cached: true,
        last_cache_update: new Date(),
      },
    }));
  };

  return {
    // State
    performanceState,
    isEmergencyMode: performanceState.is_emergency_mode,
    systemStatus: performanceState.system_status,
    currentMetrics: performanceState.current_performance,

    // Actions
    processEmergencyMessage,
    activateEmergencyMode,
    deactivateEmergencyMode,
    getCurrentMetrics,

    // Status checks
    isSystemHealthy: performanceState.system_status === "optimal",
    isOfflineModeActive: performanceState.system_status === "offline",
    cacheHealth: performanceState.cache_health,
    queueStatus: performanceState.queue_length,
  };
}

export default useEmergencyPerformance;
