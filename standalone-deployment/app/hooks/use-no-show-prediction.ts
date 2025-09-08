"use client";

import type { AppointmentWithRisk, NoShowPrediction } from "@/types/no-show-prediction";
import { RISK_THRESHOLDS } from "@/types/no-show-prediction";
import { useCallback, useEffect, useState } from "react";

interface UseNoShowPredictionOptions {
  appointmentIds?: string[];
  realTimeUpdates?: boolean;
  refreshInterval?: number; // milliseconds
}

interface UseNoShowPredictionReturn {
  predictions: Record<string, NoShowPrediction>;
  isLoading: boolean;
  error: string | null;
  fetchPrediction: (appointmentId: string) => Promise<void>;
  fetchMultiplePredictions: (appointmentIds: string[]) => Promise<void>;
  refreshPredictions: () => Promise<void>;
  getPredictionForAppointment: (
    appointmentId: string,
  ) => NoShowPrediction | undefined;
  getRiskLevel: (riskScore: number) => "low" | "medium" | "high" | "critical";
}

/**
 * Hook for managing no-show predictions
 * Provides real-time updates and caching for risk scoring data
 */
export function useNoShowPrediction({
  appointmentIds = [],
  realTimeUpdates = false,
  refreshInterval = 30_000,
}: UseNoShowPredictionOptions = {}): UseNoShowPredictionReturn {
  const [predictions, setPredictions] = useState<
    Record<string, NoShowPrediction>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRiskLevel = useCallback(
    (riskScore: number): "low" | "medium" | "high" | "critical" => {
      if (riskScore >= RISK_THRESHOLDS.CRITICAL) {
        return "critical";
      }
      if (riskScore >= RISK_THRESHOLDS.HIGH) {
        return "high";
      }
      if (riskScore >= RISK_THRESHOLDS.MEDIUM) {
        return "medium";
      }
      return "low";
    },
    [],
  );

  const fetchPrediction = useCallback(
    async (appointmentId: string) => {
      try {
        setError(null);
        const response = await fetch(`/api/ai/no-show-prediction/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appointmentId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch prediction: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.prediction) {
          setPredictions((prev) => ({
            ...prev,
            [appointmentId]: {
              ...data.prediction,
              riskLevel: getRiskLevel(data.prediction.riskScore),
              predictedAt: new Date(data.prediction.predictedAt),
            },
          }));
        }
      } catch (err) {
        console.error("Error fetching no-show prediction:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch prediction",
        );
      }
    },
    [getRiskLevel],
  );

  const fetchMultiplePredictions = useCallback(
    async (appointmentIds: string[]) => {
      if (appointmentIds.length === 0) {
        return;
      }

      setIsLoading(true);
      try {
        setError(null);

        // Fetch predictions in batches to avoid overwhelming the API
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < appointmentIds.length; i += batchSize) {
          batches.push(appointmentIds.slice(i, i + batchSize));
        }

        for (const batch of batches) {
          await Promise.all(batch.map((id) => fetchPrediction(id)));
        }
      } catch (err) {
        console.error("Error fetching multiple predictions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch predictions",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPrediction],
  );

  const refreshPredictions = useCallback(async () => {
    const appointmentIds = Object.keys(predictions);
    if (appointmentIds.length > 0) {
      await fetchMultiplePredictions(appointmentIds);
    }
  }, [predictions, fetchMultiplePredictions]);

  const getPredictionForAppointment = useCallback(
    (appointmentId: string) => {
      return predictions[appointmentId];
    },
    [predictions],
  );

  // Initial fetch for provided appointment IDs
  useEffect(() => {
    if (appointmentIds.length > 0) {
      fetchMultiplePredictions(appointmentIds);
    }
  }, [appointmentIds, fetchMultiplePredictions]);

  // Set up real-time updates if enabled
  useEffect(() => {
    if (!realTimeUpdates || refreshInterval <= 0) {
      return;
    }

    const interval = setInterval(() => {
      refreshPredictions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [realTimeUpdates, refreshInterval, refreshPredictions]);

  return {
    predictions,
    isLoading,
    error,
    fetchPrediction,
    fetchMultiplePredictions,
    refreshPredictions,
    getPredictionForAppointment,
    getRiskLevel,
  };
}

interface BaseAppointment {
  id: string;
  patientId: string;
  scheduledAt: string;
  status: string;
  type: string;
}

/**
 * Enhanced hook that enriches appointments with risk predictions
 */
export function useEnhancedAppointments(appointments: BaseAppointment[]) {
  const appointmentIds = appointments.map((apt) => apt.id);
  const { predictions, isLoading, error, getPredictionForAppointment } = useNoShowPrediction({
    appointmentIds,
    realTimeUpdates: true,
    refreshInterval: 60_000, // 1 minute
  });

  const enhancedAppointments: AppointmentWithRisk[] = appointments.map(
    (appointment) => ({
      ...appointment,
      riskPrediction: getPredictionForAppointment(appointment.id),
    }),
  );

  return {
    appointments: enhancedAppointments,
    predictions,
    isLoading,
    error,
  };
}
