import type { useCallback, useState } from "react";
import type { toast } from "sonner";

// Types for demand forecasting
interface ForecastRequest {
  itemId: string;
  clinicId: string;
  forecastPeriod: number;
  confidenceLevel: number;
}

interface BulkForecastRequest {
  items: Array<{
    itemId: string;
    forecastPeriod: number;
  }>;
  clinicId: string;
  confidenceLevel: number;
}

interface ForecastResult {
  itemId: string;
  itemName: string;
  forecastPeriod: number;
  predictedDemand: number;
  confidenceInterval: {
    lower: number;
    upper: number;
    level: number;
  };
  seasonalFactors: number[];
  trendComponent: number;
  accuracy: {
    mape: number;
    rmse: number;
    lastPeriodAccuracy: number;
  };
  recommendations: string[];
  modelUsed:
    | "exponential_smoothing"
    | "seasonal_decomposition"
    | "linear_regression"
    | "moving_average";
}

interface SeasonalAnalysis {
  itemId: string;
  analysisPeriod: number;
  dataPoints: number;
  seasonalPatterns: Array<{
    pattern: "weekly" | "monthly" | "quarterly" | "annual";
    strength: number;
    peaks: number[];
    valleys: number[];
  }>;
  statistics: {
    totalConsumption: number;
    averageDailyConsumption: number;
    standardDeviation: number;
    coefficientOfVariation: number;
    consumptionByType: Record<string, number>;
  };
  demandDrivers: {
    appointmentBased: boolean;
    seasonalInfluenced: boolean;
    highVariability: boolean;
    steadyDemand: boolean;
  };
  recommendations: string[];
  appointmentCorrelation: {
    hasAppointmentData: boolean;
    appointmentBasedConsumption: number;
    averageConsumptionPerAppointment: number;
  };
}

interface AccuracyAnalysis {
  period: string;
  totalForecasts: number;
  overallStatistics: {
    averageAccuracy: number;
    averageMAPE: number;
    averageRMSE: number;
    confidenceIntervalHitRate: number;
    totalForecasts: number;
  };
  byModel: Record<string, any>;
  byCategory: Record<string, any>;
  trends: {
    weeklyStats: Array<{
      week: string;
      averageAccuracy: number;
      averageMAPE: number;
      averageRMSE: number;
      confidenceIntervalHitRate: number;
      totalForecasts: number;
    }>;
    trend: {
      direction: "improving" | "declining";
      change: number;
      isSignificant: boolean;
    };
  };
  recommendations: string[];
}

export function useDemandForecasting() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [bulkForecasts, setBulkForecasts] = useState<ForecastResult[]>([]);
  const [seasonalAnalysis, setSeasonalAnalysis] = useState<SeasonalAnalysis | null>(null);
  const [accuracyAnalysis, setAccuracyAnalysis] = useState<AccuracyAnalysis | null>(null);
  const [capabilities, setCapabilities] = useState<any>(null);

  // Generate single item forecast
  const generateForecast = useCallback(async (request: ForecastRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/inventory/forecasting/demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate forecast");
      }

      setForecast(result.data);
      toast.success("Demand forecast generated successfully");
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate forecast";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate bulk forecasts
  const generateBulkForecast = useCallback(async (request: BulkForecastRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/inventory/forecasting/demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate bulk forecasts");
      }

      setBulkForecasts(result.data.forecasts);

      const { successful, failed } = result.data.summary;
      toast.success(
        `Generated ${successful} forecasts successfully${failed > 0 ? ` (${failed} failed)` : ""}`,
      );

      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate bulk forecasts";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Analyze seasonal patterns
  const analyzeSeasonalPatterns = useCallback(
    async (itemId: string, clinicId: string, analysisPeriod: number = 365) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/inventory/forecasting/seasonal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, clinicId, analysisPeriod }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to analyze seasonal patterns");
        }

        setSeasonalAnalysis(result.data);
        toast.success("Seasonal analysis completed");
        return result.data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to analyze seasonal patterns";
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Get forecast accuracy analysis
  const getAccuracyAnalysis = useCallback(
    async (clinicId: string, itemId?: string, period: string = "30d", modelType?: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          clinicId,
          period,
          ...(itemId && { itemId }),
          ...(modelType && { modelType }),
        });

        const response = await fetch(`/api/inventory/forecasting/accuracy?${params}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to get accuracy analysis");
        }

        setAccuracyAnalysis(result.data);
        return result.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get accuracy analysis";
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Log forecast accuracy
  const logForecastAccuracy = useCallback(
    async (accuracyData: {
      clinicId: string;
      itemId: string;
      forecastDate: string;
      forecastPeriod: number;
      predictedDemand: number;
      actualDemand: number;
      accuracyPercentage: number;
      mape: number;
      rmse: number;
      modelUsed: string;
      confidenceLevel: number;
      withinConfidenceInterval: boolean;
    }) => {
      try {
        const response = await fetch("/api/inventory/forecasting/accuracy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(accuracyData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to log accuracy data");
        }

        return result.data;
      } catch (error) {
        console.error("Failed to log forecast accuracy:", error);
        throw error;
      }
    },
    [],
  );

  // Get forecasting capabilities
  const getCapabilities = useCallback(async (clinicId: string) => {
    try {
      const response = await fetch(`/api/inventory/forecasting/demand?clinicId=${clinicId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get capabilities");
      }

      setCapabilities(result.data);
      return result.data;
    } catch (error) {
      console.error("Failed to get forecasting capabilities:", error);
      throw error;
    }
  }, []);

  // Clear current forecast
  const clearForecast = useCallback(() => {
    setForecast(null);
  }, []);

  // Clear bulk forecasts
  const clearBulkForecasts = useCallback(() => {
    setBulkForecasts([]);
  }, []);

  // Clear seasonal analysis
  const clearSeasonalAnalysis = useCallback(() => {
    setSeasonalAnalysis(null);
  }, []);

  // Clear accuracy analysis
  const clearAccuracyAnalysis = useCallback(() => {
    setAccuracyAnalysis(null);
  }, []);

  // Calculate forecast confidence score
  const calculateConfidenceScore = useCallback((forecastResult: ForecastResult): number => {
    const { accuracy, modelUsed } = forecastResult;

    // Base score from model accuracy
    let score = accuracy.lastPeriodAccuracy * 0.4;

    // Adjust based on MAPE (lower is better)
    const mapeScore = Math.max(0, 1 - accuracy.mape);
    score += mapeScore * 0.3;

    // Adjust based on model type reliability
    const modelReliability = {
      seasonal_decomposition: 0.9,
      exponential_smoothing: 0.8,
      linear_regression: 0.7,
      moving_average: 0.6,
    };
    score += (modelReliability[modelUsed] || 0.6) * 0.3;

    return Math.min(1, Math.max(0, score));
  }, []);

  // Get forecast recommendations
  const getForecastRecommendations = useCallback(
    (forecastResult: ForecastResult, seasonalData?: SeasonalAnalysis): string[] => {
      const recommendations = [...forecastResult.recommendations];

      if (seasonalData) {
        const strongPatterns = seasonalData.seasonalPatterns.filter((p) => p.strength > 0.5);
        if (strongPatterns.length > 0) {
          recommendations.push(
            "Strong seasonal patterns detected - consider seasonal inventory adjustments",
          );
        }

        if (seasonalData.demandDrivers.appointmentBased) {
          recommendations.push(
            "Demand is appointment-driven - link inventory planning to appointment schedules",
          );
        }
      }

      const confidenceScore = calculateConfidenceScore(forecastResult);
      if (confidenceScore < 0.6) {
        recommendations.push(
          "Low forecast confidence - increase monitoring frequency and safety stock",
        );
      } else if (confidenceScore > 0.8) {
        recommendations.push("High forecast confidence - suitable for automated reordering");
      }

      return recommendations;
    },
    [calculateConfidenceScore],
  );

  return {
    // State
    isLoading,
    forecast,
    bulkForecasts,
    seasonalAnalysis,
    accuracyAnalysis,
    capabilities,

    // Actions
    generateForecast,
    generateBulkForecast,
    analyzeSeasonalPatterns,
    getAccuracyAnalysis,
    logForecastAccuracy,
    getCapabilities,

    // Clear functions
    clearForecast,
    clearBulkForecasts,
    clearSeasonalAnalysis,
    clearAccuracyAnalysis,

    // Utility functions
    calculateConfidenceScore,
    getForecastRecommendations,
  };
}
