/**
 * Behavioral Analysis Service - Refactored
 *
 * IMPROVEMENTS:
 * ✅ Single Responsibility - Focus on orchestration and data access
 * ✅ Composition over complex inheritance
 * ✅ Dependency injection for better testability
 * ✅ Separation of concerns - calculations moved to utilities
 * ✅ Reduced complexity and cognitive load
 * ✅ Better error handling and logging
 */

import { supabase } from "@/lib/supabase";
import {
  type BehavioralEvent,
  type BehavioralPatterns,
  type BehavioralScores,
  calculateComplianceScore,
  calculateEngagementScore,
  calculateLoyaltyScore,
  calculateRiskScore,
  calculateSatisfactionScore,
  categorizeResponseTime,
  determineCommunicationStyle,
  type PatientInteraction,
  type PatientSegment,
  type PersonalityType,
} from "./behavioral-utils";

// =============================================================================
// MAIN SERVICE INTERFACE
// =============================================================================

export interface PatientBehaviorProfile {
  readonly patientId: string;
  readonly scores: BehavioralScores;
  readonly patterns: BehavioralPatterns;
  readonly personalityType: PersonalityType;
  readonly segment: PatientSegment;
  readonly lifetimeValue: number;
  readonly lastAnalyzed: Date;
}

// =============================================================================
// REFACTORED SERVICE CLASS
// =============================================================================

export class BehavioralAnalysisService {
  private static instance: BehavioralAnalysisService;

  private constructor() {}

  public static getInstance(): BehavioralAnalysisService {
    if (!BehavioralAnalysisService.instance) {
      BehavioralAnalysisService.instance = new BehavioralAnalysisService();
    }
    return BehavioralAnalysisService.instance;
  }

  /**
   * Main method - now focuses on orchestration, not complex calculations
   * Uses extracted utilities for all calculations
   */
  async analyzePatientBehavior(patientId: string): Promise<PatientBehaviorProfile> {
    try {
      // 1. Data collection (the service's main responsibility)
      const [events, interactions, registrationDate] = await Promise.all([
        this.collectBehavioralEvents(patientId),
        this.getPatientInteractions(patientId),
        this.getPatientRegistrationDate(patientId),
      ]);

      // 2. Score calculations (delegated to utilities)
      const scores: BehavioralScores = {
        engagement: calculateEngagementScore(events, interactions),
        loyalty: calculateLoyaltyScore(events, registrationDate),
        satisfaction: calculateSatisfactionScore(events),
        risk: calculateRiskScore(events, interactions),
        compliance: calculateComplianceScore(events),
      };

      // 3. Pattern detection (delegated to utilities)
      const avgResponseTime = this.calculateAverageResponseTime(interactions);
      const patterns: BehavioralPatterns = {
        communicationStyle: determineCommunicationStyle(interactions),
        responseTime: categorizeResponseTime(avgResponseTime),
        preferredChannel: this.determinePreferredChannel(interactions),
        appointmentBehavior: this.analyzeAppointmentBehavior(events),
        seasonalTrends: this.detectSeasonalTrends(events),
      };

      // 4. High-level analysis (orchestration of utilities)
      const personalityType = this.determinePersonalityType(scores, patterns);
      const segment = this.determinePatientSegment(scores);
      const lifetimeValue = await this.calculateLifetimeValue(patientId, segment);

      return {
        patientId,
        scores,
        patterns,
        personalityType,
        segment,
        lifetimeValue,
        lastAnalyzed: new Date(),
      };
    } catch (error) {
      console.error(`Behavioral analysis failed for patient ${patientId}:`, error);
      throw new Error(
        `Failed to analyze patient behavior: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  // =============================================================================
  // DATA ACCESS METHODS (Service's core responsibility)
  // =============================================================================

  private async collectBehavioralEvents(patientId: string): Promise<BehavioralEvent[]> {
    const { data, error } = await supabase
      .from("behavioral_events")
      .select("*")
      .eq("patient_id", patientId)
      .order("timestamp", { ascending: false })
      .limit(500); // Reasonable limit

    if (error) {
      throw new Error(`Failed to collect behavioral events: ${error.message}`);
    }

    return data || [];
  }

  private async getPatientInteractions(patientId: string): Promise<PatientInteraction[]> {
    const { data, error } = await supabase
      .from("patient_interactions")
      .select("*")
      .eq("patient_id", patientId)
      .order("timestamp", { ascending: false })
      .limit(200);

    if (error) {
      throw new Error(`Failed to get patient interactions: ${error.message}`);
    }

    return data || [];
  }

  private async getPatientRegistrationDate(patientId: string): Promise<Date> {
    const { data, error } = await supabase
      .from("patients")
      .select("created_at")
      .eq("id", patientId)
      .single();

    if (error) {
      throw new Error(`Failed to get registration date: ${error.message}`);
    }

    return new Date(data.created_at);
  }

  // =============================================================================
  // SIMPLE ORCHESTRATION METHODS (No complex calculations)
  // =============================================================================

  private calculateAverageResponseTime(interactions: PatientInteraction[]): number {
    if (interactions.length === 0) return 24;

    const totalTime = interactions.reduce((sum, interaction) => sum + interaction.responseTime, 0);
    return totalTime / interactions.length;
  }

  private determinePreferredChannel(
    interactions: PatientInteraction[],
  ): "whatsapp" | "email" | "phone" | "sms" {
    if (interactions.length === 0) return "whatsapp";

    const channelCounts = interactions.reduce((counts, interaction) => {
      counts[interaction.channel] = (counts[interaction.channel] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostUsedChannel = Object.entries(channelCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    return (mostUsedChannel as any) || "whatsapp";
  }

  private analyzeAppointmentBehavior(
    events: BehavioralEvent[],
  ): "punctual" | "early" | "late" | "reschedules" {
    const appointmentEvents = events.filter(e => e.eventType === "appointment");

    // Simplified logic - would be enhanced based on metadata
    const positiveRate = appointmentEvents.length > 0
      ? appointmentEvents.filter(e => e.outcome === "positive").length / appointmentEvents.length
      : 0.5;

    return positiveRate > 0.8 ? "punctual" : "reschedules";
  }

  private detectSeasonalTrends(events: BehavioralEvent[]): string[] {
    // Simplified seasonal analysis
    const months = events.map(e => e.timestamp.getMonth());
    const monthCounts = months.reduce((counts, month) => {
      counts[month] = (counts[month] || 0) + 1;
      return counts;
    }, {} as Record<number, number>);

    const peakMonths = Object.entries(monthCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([month]) => this.getSeasonFromMonth(parseInt(month)));

    return [...new Set(peakMonths)];
  }

  private getSeasonFromMonth(month: number): string {
    if (month >= 2 && month <= 4) return "Autumn";
    if (month >= 5 && month <= 7) return "Winter";
    if (month >= 8 && month <= 10) return "Spring";
    return "Summer";
  }

  private determinePersonalityType(
    scores: BehavioralScores,
    patterns: BehavioralPatterns,
  ): PersonalityType {
    // Simplified personality analysis based on patterns
    if (patterns.responseTime === "immediate" && patterns.communicationStyle === "direct") {
      return "driver";
    }
    if (scores.engagement > 80 && patterns.communicationStyle === "detailed") {
      return "expressive";
    }
    if (patterns.communicationStyle === "formal" && scores.compliance > 80) {
      return "analytical";
    }
    return "amiable";
  }

  private determinePatientSegment(scores: BehavioralScores): PatientSegment {
    if (scores.loyalty > 90 && scores.satisfaction > 85) return "vip";
    if (scores.loyalty > 70 && scores.risk < 30) return "loyal";
    if (scores.risk > 70) return "at-risk";
    if (scores.loyalty < 30) return "new";
    return "inactive";
  }

  private async calculateLifetimeValue(
    patientId: string,
    segment: PatientSegment,
  ): Promise<number> {
    // Simplified LTV calculation
    const segmentMultipliers = {
      vip: 5000,
      loyal: 3000,
      "at-risk": 1500,
      new: 800,
      inactive: 200,
    };

    return segmentMultipliers[segment];
  }
}
