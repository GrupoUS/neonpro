"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  AIActionType,
  AIAdoptionMetrics,
  AIFeatureType,
  AIUsageAnalytic,
} from "@neonpro/types/monitoring";
import { useCallback, useEffect, useRef, useState } from "react";

interface AIAnalyticsConfig {
  enableAutoTracking?: boolean;
  batchSize?: number;
  flushInterval?: number;
  trackUserSatisfaction?: boolean;
}

interface AIUsageStats {
  totalSessions: number;
  activeFeatures: number;
  averageSuccessRate: number;
  totalROI: number;
  featuresBreakdown: AIAdoptionMetrics[];
  recentActivity: AIUsageAnalytic[];
}

interface SessionContext {
  sessionId: string;
  startTime: number;
  featureType: AIFeatureType;
  queryCount: number;
  successCount: number;
}

// ROI multipliers for each AI feature (estimated revenue impact)
const AI_FEATURE_ROI_MULTIPLIERS = {
  universal_ai_chat: 150, // $150 per successful session
  anti_no_show_prediction: 300, // $300 per prevented no-show
  crm_behavioral_analytics: 200, // $200 per converted lead
  patient_sentiment_analysis: 100, // $100 per improved satisfaction
  automated_scheduling: 80, // $80 per automated booking
} as const;

export function useAIAnalytics(config: AIAnalyticsConfig = {}) {
  const supabase = createClient();
  const [aiUsageStats, setAIUsageStats] = useState<AIUsageStats>({
    totalSessions: 0,
    activeFeatures: 0,
    averageSuccessRate: 0,
    totalROI: 0,
    featuresBreakdown: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentSessions, setCurrentSessions] = useState<
    Map<string, SessionContext>
  >(new Map());

  const analyticsBuffer = useRef<AIUsageAnalytic[]>([]);
  const lastFlushTime = useRef<number>(Date.now());

  const {
    enableAutoTracking = true,
    batchSize = 20,
    flushInterval = 60_000, // 1 minute
    trackUserSatisfaction = true,
  } = config;

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return `ai_session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }, []);

  // Record AI usage analytics
  const recordAIUsage = useCallback(
    async (
      featureType: AIFeatureType,
      actionType: AIActionType,
      metadata: {
        sessionId?: string;
        success?: boolean;
        responseTime?: number;
        userSatisfaction?: number;
        queryText?: string;
        predictionAccuracy?: number;
        businessImpact?: Record<string, unknown>;
      } = {},
    ) => {
      try {
        const analytic: Omit<AIUsageAnalytic, "id" | "created_at"> = {
          feature_type: featureType,
          session_id: metadata.sessionId,
          action_type: actionType,
          query_count: actionType === "query_submitted" ? 1 : 0,
          success_rate: metadata.success !== undefined
            ? metadata.success
              ? 100
              : 0
            : undefined,
          response_time_ms: metadata.responseTime,
          accuracy_score: metadata.predictionAccuracy,
          user_satisfaction: metadata.userSatisfaction,
          business_impact: {
            estimated_roi: calculateFeatureROI(
              featureType,
              actionType,
              metadata.success,
            ),
            ...metadata.businessImpact,
          },
          timestamp: new Date().toISOString(),
        };

        // Add to buffer
        analyticsBuffer.current.push(analytic as AIUsageAnalytic);

        // Flush if needed
        const timeSinceLastFlush = Date.now() - lastFlushTime.current;
        if (
          analyticsBuffer.current.length >= batchSize
          || timeSinceLastFlush > flushInterval
        ) {
          await flushAnalyticsBuffer();
        }

        return analytic;
      } catch (error) {
        // console.error("Error recording AI usage:", error);
        throw error;
      }
    },
    [batchSize, flushInterval, calculateFeatureROI, flushAnalyticsBuffer],
  );

  // Calculate ROI for AI feature usage
  const calculateFeatureROI = useCallback(
    (
      featureType: AIFeatureType,
      actionType: AIActionType,
      success?: boolean,
    ): number => {
      if (!success || actionType !== "session_completed") {
        return 0;
      }

      return AI_FEATURE_ROI_MULTIPLIERS[featureType] || 0;
    },
    [],
  );

  // Start AI feature session
  const startAISession = useCallback(
    (featureType: AIFeatureType): string => {
      const sessionId = generateSessionId();
      const sessionContext: SessionContext = {
        sessionId,
        startTime: Date.now(),
        featureType,
        queryCount: 0,
        successCount: 0,
      };

      setCurrentSessions((prev) => new Map(prev).set(sessionId, sessionContext));

      // Record session start
      recordAIUsage(featureType, "feature_opened", { sessionId });

      return sessionId;
    },
    [generateSessionId, recordAIUsage],
  );

  // Track AI query
  const trackAIQuery = useCallback(
    async (
      sessionId: string,
      success: boolean,
      responseTime?: number,
      accuracy?: number,
    ) => {
      const session = currentSessions.get(sessionId);
      if (!session) {
        return;
      }

      // Update session context
      session.queryCount++;
      if (success) {
        session.successCount++;
      }

      setCurrentSessions((prev) => new Map(prev).set(sessionId, session));

      // Record query
      await recordAIUsage(session.featureType, "query_submitted", {
        sessionId,
        success,
        responseTime,
        predictionAccuracy: accuracy,
      });
    },
    [currentSessions, recordAIUsage],
  );

  // Track AI recommendation response
  const trackAIRecommendation = useCallback(
    async (sessionId: string, accepted: boolean, userSatisfaction?: number) => {
      const session = currentSessions.get(sessionId);
      if (!session) {
        return;
      }

      const actionType = accepted
        ? "recommendation_accepted"
        : "recommendation_rejected";

      await recordAIUsage(session.featureType, actionType, {
        sessionId,
        success: accepted,
        userSatisfaction,
      });
    },
    [currentSessions, recordAIUsage],
  );

  // End AI session
  const endAISession = useCallback(
    async (sessionId: string, userSatisfaction?: number) => {
      const session = currentSessions.get(sessionId);
      if (!session) {
        return;
      }

      const sessionDuration = Date.now() - session.startTime;
      const successRate = session.queryCount > 0
        ? (session.successCount / session.queryCount) * 100
        : 0;

      // Record session completion
      await recordAIUsage(session.featureType, "session_completed", {
        sessionId,
        success: successRate > 50, // Consider successful if >50% success rate
        responseTime: sessionDuration,
        userSatisfaction,
        businessImpact: {
          session_duration: sessionDuration,
          query_count: session.queryCount,
          success_rate: successRate,
        },
      });

      // Remove from active sessions
      setCurrentSessions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });
    },
    [currentSessions, recordAIUsage],
  );

  // Flush analytics buffer
  const flushAnalyticsBuffer = useCallback(async () => {
    if (analyticsBuffer.current.length === 0) {
      return;
    }

    try {
      const analytics = [...analyticsBuffer.current];
      analyticsBuffer.current = [];
      lastFlushTime.current = Date.now();

      const { error } = await supabase
        .from("ai_usage_analytics")
        .insert(analytics);

      if (error) {
        // console.error("Error flushing AI analytics:", error);
        // Re-add to buffer for retry
        analyticsBuffer.current.unshift(...analytics);
      }
    } catch (error) {
      // console.error("Error in flushAnalyticsBuffer:", error);
    }
  }, [supabase]);

  // Load AI usage statistics
  const loadAIUsageStats = useCallback(async () => {
    try {
      setLoading(true);

      // Get analytics from last 24 hours
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: recentAnalytics, error } = await supabase
        .from("ai_usage_analytics")
        .select("*")
        .gte("timestamp", oneDayAgo)
        .order("timestamp", { ascending: false });

      if (error) {
        // console.error("Error loading AI usage stats:", error);
        return;
      }

      if (recentAnalytics && recentAnalytics.length > 0) {
        // Calculate aggregated stats
        const sessions = new Set(
          recentAnalytics.map((a) => a.session_id).filter(Boolean),
        );
        const activeFeatures = new Set(
          recentAnalytics.map((a) => a.feature_type),
        );

        const successfulQueries = recentAnalytics.filter(
          (a) => a.action_type === "query_submitted" && (a.success_rate || 0) > 0,
        );
        const totalQueries = recentAnalytics.filter(
          (a) => a.action_type === "query_submitted",
        );

        const avgSuccessRate = totalQueries.length > 0
          ? (successfulQueries.length / totalQueries.length) * 100
          : 0;

        // Calculate total ROI
        const totalROI = recentAnalytics.reduce((sum, a) => {
          const roi = a.business_impact?.estimated_roi || 0;
          return sum + (typeof roi === "number" ? roi : 0);
        }, 0);

        // Feature breakdown
        const featuresBreakdown: AIAdoptionMetrics[] = [];
        for (const featureType of activeFeatures) {
          const featureAnalytics = recentAnalytics.filter(
            (a) => a.feature_type === featureType,
          );
          const featureSessions = new Set(
            featureAnalytics.map((a) => a.session_id).filter(Boolean),
          );
          const featureQueries = featureAnalytics.filter(
            (a) => a.action_type === "query_submitted",
          );
          const featureSuccesses = featureQueries.filter(
            (a) => (a.success_rate || 0) > 0,
          );

          const avgQueries = featureSessions.size > 0
            ? featureQueries.length / featureSessions.size
            : 0;

          const featureSuccessRate = featureQueries.length > 0
            ? (featureSuccesses.length / featureQueries.length) * 100
            : 0;

          const userSatisfactions = featureAnalytics
            .map((a) => a.user_satisfaction)
            .filter((s): s is number => s !== null && s !== undefined);

          const avgSatisfaction = userSatisfactions.length > 0
            ? userSatisfactions.reduce((sum, s) => sum + s, 0)
              / userSatisfactions.length
            : 0;

          // Calculate clinic breakdown (would need clinic data in analytics)
          const clinicBreakdown: {
            clinic_id: string;
            clinic_name: string;
            adoption_rate: number;
            usage_count: number;
          }[] = []; // TODO: Implement with clinic data

          featuresBreakdown.push({
            feature_type: featureType,
            total_sessions: featureSessions.size,
            active_users: new Set(
              featureAnalytics.map((a) => a.user_id).filter(Boolean),
            ).size,
            average_queries_per_session: Math.round(avgQueries * 100) / 100,
            success_rate: Math.round(featureSuccessRate * 100) / 100,
            user_satisfaction_average: Math.round(avgSatisfaction * 100) / 100,
            revenue_impact: featureAnalytics.reduce(
              (sum, a) => sum + (a.business_impact?.estimated_roi || 0),
              0,
            ),
            clinic_breakdown: clinicBreakdown,
          });
        }

        setAIUsageStats({
          totalSessions: sessions.size,
          activeFeatures: activeFeatures.size,
          averageSuccessRate: Math.round(avgSuccessRate * 100) / 100,
          totalROI: Math.round(totalROI * 100) / 100,
          featuresBreakdown,
          recentActivity: recentAnalytics.slice(0, 20) as AIUsageAnalytic[],
        });
      }
    } catch (error) {
      // console.error("Error loading AI usage stats:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel("ai_usage_analytics_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_usage_analytics",
        },
        (_payload) => {
          // Refresh stats when new analytics are added
          loadAIUsageStats();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadAIUsageStats]);

  // Set up automatic flushing
  useEffect(() => {
    if (!enableAutoTracking) {
      return;
    }

    const interval = setInterval(() => {
      flushAnalyticsBuffer();
    }, flushInterval);

    return () => {
      clearInterval(interval);
      flushAnalyticsBuffer();
    };
  }, [enableAutoTracking, flushAnalyticsBuffer, flushInterval]);

  // Load initial stats
  useEffect(() => {
    loadAIUsageStats();
  }, [loadAIUsageStats]);

  // Cleanup sessions on unmount
  useEffect(() => {
    return () => {
      // End all active sessions
      currentSessions.forEach((_session, sessionId) => {
        endAISession(sessionId);
      });
    };
  }, [currentSessions, endAISession]);

  return {
    // State
    aiUsageStats,
    loading,
    currentSessions: [...currentSessions.values()],

    // Actions
    startAISession,
    trackAIQuery,
    trackAIRecommendation,
    endAISession,
    recordAIUsage,
    loadAIUsageStats,
    flushAnalyticsBuffer,

    // Utils
    calculateFeatureROI,
    roiMultipliers: AI_FEATURE_ROI_MULTIPLIERS,
  };
}
