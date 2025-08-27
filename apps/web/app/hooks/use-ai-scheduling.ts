"use client";

import { AISchedulingEngine } from "@/lib/ai-scheduling";
import type {
  AppointmentSlot,
  DynamicSchedulingEvent,
  SchedulingAction,
  SchedulingAnalytics,
  SchedulingRequest,
  SchedulingResult,
  TreatmentType,
} from "@neonpro/core-services/scheduling";
import { useCallback, useEffect, useRef, useState } from "react";

interface AIEngineConfig {
  optimizationLevel: "basic" | "advanced" | "experimental";
  enablePredictiveModeling: boolean;
  realtimeAnalytics: boolean;
  autoRescheduling: boolean;
  maxConcurrentOptimizations: number;
  learningRate: number;
}

interface UseAISchedulingOptions {
  tenantId: string;
  autoOptimize?: boolean;
  realtimeUpdates?: boolean;
  analyticsEnabled?: boolean;
}

interface UseAISchedulingReturn {
  // Core scheduling functions
  scheduleAppointment: (
    request: SchedulingRequest,
  ) => Promise<SchedulingResult>;
  getAvailableSlots: (
    request: Partial<SchedulingRequest>,
  ) => Promise<AppointmentSlot[]>;
  handleRealtimeEvent: (
    event: DynamicSchedulingEvent,
  ) => Promise<SchedulingAction[]>;

  // State management
  isLoading: boolean;
  error: string | null;
  lastResult: SchedulingResult | null;

  // Real-time optimization
  optimizationScore: number;
  activeOptimizations: SchedulingAction[];

  // Analytics
  analytics: SchedulingAnalytics | null;
  processingTime: number;

  // Utility functions
  predictNoShowRisk: (patientId: string, slotId: string) => Promise<number>;
  optimizeStaffWorkload: () => Promise<SchedulingAction[]>;
  forecastDemand: (days: number) => Promise<unknown>;

  // Configuration
  updateConfig: (config: Partial<AIEngineConfig>) => void;
  resetState: () => void;
}

/**
 * Advanced React Hook for AI-Powered Scheduling
 * Provides comprehensive scheduling capabilities with real-time optimization
 */
export const useAIScheduling = (
  options: UseAISchedulingOptions,
): UseAISchedulingReturn => {
  const {
    tenantId,
    autoOptimize = true,
    realtimeUpdates = true,
    analyticsEnabled = true,
  } = options;

  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const [lastResult, setLastResult] = useState<SchedulingResult | null>();

  // Optimization state
  const [optimizationScore, setOptimizationScore] = useState(0.8);
  const [activeOptimizations, setActiveOptimizations] = useState<
    SchedulingAction[]
  >([]);

  // Analytics state
  const [analytics, setAnalytics] = useState<SchedulingAnalytics | null>();
  const [processingTime, setProcessingTime] = useState(0);

  // Refs for AI engine and real-time connections
  const aiEngineRef = useRef<AISchedulingEngine | null>(null);
  const wsConnectionRef = useRef<WebSocket | null>(null);

  // Handle real-time updates from WebSocket
  const handleRealtimeUpdate = useCallback((data: unknown) => {
    const updateData = data as { type?: string; affectedSlots?: unknown };
    switch (updateData.type) {
      case "schedule_change": {
        // Refresh available slots
        if (updateData.affectedSlots) {
        }
        break;
      }

      case "optimization_opportunity": {
        // New optimization opportunity detected
        setOptimizationScore(data.score);
        break;
      }

      case "analytics_update": {
        // Real-time analytics update
        setAnalytics((prev) => ({ ...prev, ...data.analytics }));
        break;
      }

      default:
    }
  }, []);

  // Initialize AI engine
  useEffect(() => {
    aiEngineRef.current = new AISchedulingEngine();
  }, []);

  // Initialize real-time WebSocket connection
  useEffect(() => {
    if (!realtimeUpdates) {
      return;
    }

    const connectWebSocket = () => {
      try {
        const wsUrl = `${
          process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"
        }/scheduling/${tenantId}`;
        wsConnectionRef.current = new WebSocket(wsUrl);

        wsConnectionRef.current.addEventListener("open", () => {});

        wsConnectionRef.current.addEventListener("message", (event) => {
          const data = JSON.parse(event.data);
          handleRealtimeUpdate(data);
        });

        wsConnectionRef.current.addEventListener("close", () => {
          setTimeout(connectWebSocket, 5000);
        });

        wsConnectionRef.current.addEventListener("error", (_error) => {});
      } catch {}
    };

    connectWebSocket();

    return () => {
      if (wsConnectionRef.current) {
        wsConnectionRef.current.close();
      }
    };
  }, [tenantId, realtimeUpdates, handleRealtimeUpdate]);

  // Load analytics data
  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    const loadAnalytics = async () => {
      try {
        const response = await fetch(`/api/scheduling/analytics/${tenantId}`);
        if (response.ok) {
          const analyticsData = await response.json();
          setAnalytics(analyticsData);
        }
      } catch {}
    };

    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30_000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [tenantId, analyticsEnabled]);

  // Core scheduling function
  const scheduleAppointment = useCallback(
    async (request: SchedulingRequest): Promise<SchedulingResult> => {
      if (!aiEngineRef.current) {
        throw new Error("AI Scheduling Engine not initialized");
      }

      setIsLoading(true);
      setError(undefined);
      const startTime = performance.now();

      try {
        // Fetch required data
        const [
          slotsResponse,
          staffResponse,
          patientsResponse,
          treatmentsResponse,
        ] = await Promise.all([
          fetch(
            `/api/scheduling/slots/${tenantId}?treatmentType=${request.treatmentTypeId}`,
          ),
          fetch(`/api/staff/${tenantId}`),
          fetch(`/api/patients/${tenantId}/${request.patientId}`),
          fetch(`/api/treatments/${tenantId}`),
        ]);

        const [_slots, _staff, _patient, _treatments] = await Promise.all([
          slotsResponse.json(),
          staffResponse.json(),
          patientsResponse.json(),
          treatmentsResponse.json(),
        ]);

        // AI-powered scheduling
        const result = await aiEngineRef.current.optimizeSchedule(
          request,
        );

        // Adapt result to match SchedulingResult interface
        const adaptedResult = {
          ...result,
          confidenceScore: 0.8, // Default confidence score
          appointmentSlot: result.recommendations?.[0] as unknown,
          alternatives: result.recommendations?.slice(1) as unknown[],
        };

        setLastResult(adaptedResult);

        // Store result for analytics
        if (result.success) {
          await fetch(`/api/scheduling/analytics/${tenantId}/record`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              request,
              result,
              processingTime: performance.now() - startTime,
            }),
          });
        }

        return adaptedResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Scheduling failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
        setProcessingTime(performance.now() - startTime);
      }
    },
    [tenantId],
  );

  // Get available slots with AI pre-filtering
  const getAvailableSlots = useCallback(
    async (request: Partial<SchedulingRequest>): Promise<AppointmentSlot[]> => {
      if (!aiEngineRef.current) {
        return [];
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/scheduling/slots/${tenantId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const { data: slots } = await response.json();

        // AI filtering if treatment type specified
        if (request.treatmentTypeId) {
          const treatmentsResponse = await fetch(`/api/treatments/${tenantId}`);
          const { data: treatments } = await treatmentsResponse.json();

          const treatment = treatments.find(
            (t: TreatmentType) => t.id === request.treatmentTypeId,
          );
          if (treatment) {
            const timeSlots = await aiEngineRef.current.getAvailableSlots(
              new Date(),
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days ahead
              request.treatmentType,
            );

            // Convert TimeSlot[] to AppointmentSlot[]
            return timeSlots.map((timeSlot, index) => ({
              id: `slot-${index}`,
              start: timeSlot.startTime,
              end: timeSlot.endTime,
              duration: timeSlot.duration || 60,
              isAvailable: timeSlot.isAvailable,
              staffId: timeSlot.professionalId || "",
              treatmentTypeId: request.treatmentType,
              conflictScore: 0,
              optimizationScore: 0.8,
            }));
          }
        }

        return slots;
      } catch {
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId],
  );

  // Handle real-time scheduling events
  const handleRealtimeEvent = useCallback(
    async (event: DynamicSchedulingEvent): Promise<SchedulingAction[]> => {
      if (!aiEngineRef.current) {
        return [];
      }

      try {
        const [scheduleResponse, staffResponse] = await Promise.all([
          fetch(`/api/scheduling/current/${tenantId}`),
          fetch(`/api/staff/${tenantId}`),
        ]);

        const [currentSchedule, staff] = await Promise.all([
          scheduleResponse.json(),
          staffResponse.json(),
        ]);

        const actions = await aiEngineRef.current.handleDynamicEvent(
          event,
          currentSchedule.data || [],
          staff.data || [],
        );

        setActiveOptimizations(actions);

        // Auto-execute high-impact, low-risk actions
        if (autoOptimize) {
          const autoActions = actions.filter(
            (action) =>
              action.impact.efficiencyChange > 10
              && action.executionTime < 60
              && action.impact.patientSatisfactionChange >= 0,
          );

          for (const action of autoActions) {
            await executeAction(action);
          }
        }

        return actions;
      } catch {
        return [];
      }
    },
    [tenantId, autoOptimize, executeAction],
  );

  // Predict no-show risk for specific patient/slot combination
  const predictNoShowRisk = useCallback(
    async (patientId: string, slotId: string): Promise<number> => {
      try {
        const response = await fetch(
          `/api/scheduling/predict-noshow/${tenantId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, slotId }),
          },
        );

        const { risk } = await response.json();
        return risk;
      } catch {
        return 0.1; // Default low risk
      }
    },
    [tenantId],
  );

  // Optimize staff workload distribution
  const optimizeStaffWorkload = useCallback(async (): Promise<
    SchedulingAction[]
  > => {
    try {
      const response = await fetch(
        `/api/scheduling/optimize-workload/${tenantId}`,
        {
          method: "POST",
        },
      );

      const { actions } = await response.json();
      return actions;
    } catch {
      return [];
    }
  }, [tenantId]);

  // Forecast demand for upcoming days
  const forecastDemand = useCallback(
    async (days = 14) => {
      try {
        const response = await fetch(
          `/api/scheduling/forecast/${tenantId}?days=${days}`,
        );
        return await response.json();
      } catch {
        return;
      }
    },
    [tenantId],
  );

  // Update AI engine configuration
  const updateConfig = useCallback((_config: Partial<AIEngineConfig>) => {
    if (aiEngineRef.current) {
    }
  }, []);

  // Reset hook state
  const resetState = useCallback(() => {
    setError(null);
    setLastResult(null);
    setActiveOptimizations([]);
    setOptimizationScore(0.8);
  }, []);

  // Execute a scheduling action
  const executeAction = useCallback(
    async (action: SchedulingAction) => {
      try {
        const response = await fetch(
          `/api/scheduling/execute-action/${tenantId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action),
          },
        );

        if (response.ok) {
        }
      } catch {}
    },
    [tenantId],
  );

  return {
    // Core functions
    scheduleAppointment,
    getAvailableSlots,
    handleRealtimeEvent,

    // State
    isLoading,
    error,
    lastResult,

    // Optimization
    optimizationScore,
    activeOptimizations,

    // Analytics
    analytics,
    processingTime,

    // Utilities
    predictNoShowRisk,
    optimizeStaffWorkload,
    forecastDemand,

    // Configuration
    updateConfig,
    resetState,
  };
};
