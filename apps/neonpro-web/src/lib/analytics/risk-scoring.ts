/**
 * Story 11.2: Patient Risk Scoring System
 * Advanced risk assessment algorithms for no-show prediction and patient management
 */

import type { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";
import type { RiskFactor, RiskFactorCategory, NoShowPattern } from "./no-show-prediction";

// Risk scoring configuration
export interface RiskScoringConfig {
  weights: Record<RiskFactorCategory, number>;
  thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  decayFactors: {
    timeDecay: number; // How much historical data decays over time
    seasonalDecay: number; // Seasonal pattern relevance decay
    behaviorDecay: number; // Behavior pattern decay
  };
  minimumDataPoints: number; // Minimum appointments needed for reliable scoring
}

// Comprehensive patient risk profile
export interface PatientRiskProfile {
  patientId: string;
  overallRiskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  lastUpdated: Date;

  // Detailed risk breakdowns
  historicalRisk: number;
  behavioralRisk: number;
  demographicRisk: number;
  communicationRisk: number;
  contextualRisk: number;

  // Risk trends
  riskTrend: "IMPROVING" | "STABLE" | "DETERIORATING";
  trendConfidence: number;
  monthlyRiskHistory: Array<{
    month: string;
    riskScore: number;
    appointmentCount: number;
  }>;

  // Intervention history
  interventionHistory: InterventionOutcome[];
  interventionEffectiveness: Record<string, number>;

  // Predictive factors
  topRiskFactors: RiskFactor[];
  protectiveFactors: RiskFactor[];
  seasonalPatterns: Record<string, number>;

  // Recommendations
  recommendedInterventions: string[];
  appointmentRecommendations: AppointmentRecommendation[];
}

// Intervention outcome tracking
export interface InterventionOutcome {
  interventionId: string;
  type: string;
  executedAt: Date;
  appointmentId: string;
  outcome: "ATTENDED" | "NO_SHOW" | "RESCHEDULED" | "CANCELLED";
  effectivenessScore: number;
  costImpact: number;
  patientFeedback?: string;
}

// Appointment recommendations based on risk analysis
export interface AppointmentRecommendation {
  type: "TIME_SLOT" | "DAY_OF_WEEK" | "ADVANCE_BOOKING" | "REMINDER_SCHEDULE" | "PROVIDER_MATCH";
  recommendation: string;
  expectedImpact: number;
  confidence: number;
  reasoning: string;
}

// Demographic risk factors
export interface DemographicRiskFactors {
  ageGroup: string;
  distanceFromClinic: number;
  socioeconomicIndicators: Record<string, number>;
  transportationAccess: "EXCELLENT" | "GOOD" | "LIMITED" | "POOR";
  languageBarriers: boolean;
  familySupport: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  employmentStatus: string;
  insuranceType: string;
}

// Main risk scoring engine class
export class RiskScoringEngine {
  private supabase = createClient<Database>();
  private config: RiskScoringConfig;

  constructor() {
    this.config = {
      weights: {
        [RiskFactorCategory.PATIENT_HISTORY]: 0.3,
        [RiskFactorCategory.APPOINTMENT_CHARACTERISTICS]: 0.2,
        [RiskFactorCategory.DEMOGRAPHICS]: 0.2,
        [RiskFactorCategory.EXTERNAL_FACTORS]: 0.15,
        [RiskFactorCategory.COMMUNICATION_PATTERNS]: 0.15,
      },
      thresholds: {
        low: 25,
        medium: 50,
        high: 75,
        critical: 90,
      },
      decayFactors: {
        timeDecay: 0.95, // 5% decay per month
        seasonalDecay: 0.9, // 10% decay per year
        behaviorDecay: 0.98, // 2% decay per month
      },
      minimumDataPoints: 3,
    };
  }

  /**
   * Generate comprehensive risk profile for a patient
   */
  async generateRiskProfile(patientId: string): Promise<PatientRiskProfile> {
    try {
      // Gather comprehensive patient data
      const [appointmentHistory, demographicData, communicationHistory, interventionHistory] =
        await Promise.all([
          this.getPatientAppointmentHistory(patientId),
          this.getPatientDemographics(patientId),
          this.getCommunicationHistory(patientId),
          this.getInterventionHistory(patientId),
        ]);

      // Calculate individual risk components
      const historicalRisk = await this.calculateHistoricalRisk(appointmentHistory);
      const behavioralRisk = await this.calculateBehavioralRisk(appointmentHistory);
      const demographicRisk = await this.calculateDemographicRisk(demographicData);
      const communicationRisk = await this.calculateCommunicationRisk(communicationHistory);
      const contextualRisk = await this.calculateContextualRisk(patientId);

      // Calculate overall risk score
      const overallRiskScore = this.calculateOverallRiskScore({
        historicalRisk,
        behavioralRisk,
        demographicRisk,
        communicationRisk,
        contextualRisk,
      });

      // Analyze risk trends
      const { riskTrend, trendConfidence, monthlyHistory } =
        await this.analyzeRiskTrends(appointmentHistory);

      // Identify key risk and protective factors
      const topRiskFactors = await this.identifyTopRiskFactors(patientId);
      const protectiveFactors = await this.identifyProtectiveFactors(patientId);

      // Analyze intervention effectiveness
      const interventionEffectiveness = this.analyzeInterventionEffectiveness(interventionHistory);

      // Generate recommendations
      const recommendedInterventions = await this.generateInterventionRecommendations(
        overallRiskScore,
        topRiskFactors,
      );
      const appointmentRecommendations = await this.generateAppointmentRecommendations(
        patientId,
        appointmentHistory,
      );

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(appointmentHistory.length);

      return {
        patientId,
        overallRiskScore,
        riskLevel: this.getRiskLevel(overallRiskScore),
        confidence,
        lastUpdated: new Date(),

        historicalRisk,
        behavioralRisk,
        demographicRisk,
        communicationRisk,
        contextualRisk,

        riskTrend,
        trendConfidence,
        monthlyRiskHistory: monthlyHistory,

        interventionHistory,
        interventionEffectiveness,

        topRiskFactors,
        protectiveFactors,
        seasonalPatterns: await this.calculateSeasonalPatterns(appointmentHistory),

        recommendedInterventions,
        appointmentRecommendations,
      };
    } catch (error) {
      console.error("Error generating risk profile:", error);
      throw new Error("Failed to generate patient risk profile");
    }
  }

  /**
   * Calculate historical risk based on appointment history
   */
  private async calculateHistoricalRisk(appointmentHistory: any[]): Promise<number> {
    if (appointmentHistory.length < this.config.minimumDataPoints) {
      return 50; // Default medium risk for insufficient data
    }

    const noShows = appointmentHistory.filter((apt) => apt.status === "NO_SHOW");
    const cancellations = appointmentHistory.filter((apt) => apt.status === "CANCELLED");
    const lateArrival = appointmentHistory.filter((apt) => apt.late_arrival === true);

    // Calculate base metrics
    const noShowRate = noShows.length / appointmentHistory.length;
    const cancellationRate = cancellations.length / appointmentHistory.length;
    const lateRate = lateArrival.length / appointmentHistory.length;

    // Apply time decay to give more weight to recent appointments
    const weightedNoShowRate = this.applyTimeDecay(noShows, appointmentHistory);
    const weightedCancellationRate = this.applyTimeDecay(cancellations, appointmentHistory);

    // Calculate risk score (0-100)
    let riskScore = 0;
    riskScore += weightedNoShowRate * 60; // No-shows are highest risk
    riskScore += weightedCancellationRate * 20; // Cancellations are moderate risk
    riskScore += lateRate * 15; // Late arrivals are low risk

    // Pattern analysis bonus/penalty
    const patternPenalty = this.analyzePatterns(appointmentHistory);
    riskScore += patternPenalty;

    return Math.min(Math.max(riskScore, 0), 100);
  }

  /**
   * Calculate behavioral risk based on appointment patterns
   */
  private async calculateBehavioralRisk(appointmentHistory: any[]): Promise<number> {
    if (appointmentHistory.length === 0) return 50;

    let riskScore = 0;

    // Analyze booking patterns
    const bookingPatterns = this.analyzeBookingPatterns(appointmentHistory);
    riskScore += bookingPatterns.lastMinuteBookings * 20;
    riskScore += bookingPatterns.inconsistentTiming * 15;

    // Analyze rescheduling behavior
    const reschedulingRate =
      appointmentHistory.filter((apt) => apt.reschedule_count && apt.reschedule_count > 0).length /
      appointmentHistory.length;
    riskScore += reschedulingRate * 25;

    // Communication responsiveness
    const communicationScore = await this.getCommunicationScore(appointmentHistory[0]?.patient_id);
    riskScore += (1 - communicationScore) * 20;

    // Appointment frequency patterns
    const frequencyScore = this.analyzeAppointmentFrequency(appointmentHistory);
    riskScore += frequencyScore * 10;

    return Math.min(Math.max(riskScore, 0), 100);
  }

  /**
   * Calculate demographic risk factors
   */
  private async calculateDemographicRisk(demographicData: DemographicRiskFactors): Promise<number> {
    let riskScore = 0;

    // Age group risk
    const ageRisk = this.getAgeGroupRisk(demographicData.ageGroup);
    riskScore += ageRisk * 15;

    // Distance from clinic
    const distanceRisk = Math.min(demographicData.distanceFromClinic / 50, 1) * 20;
    riskScore += distanceRisk;

    // Transportation access
    const transportRisk =
      {
        EXCELLENT: 0,
        GOOD: 5,
        LIMITED: 15,
        POOR: 25,
      }[demographicData.transportationAccess] || 10;
    riskScore += transportRisk;

    // Language barriers
    if (demographicData.languageBarriers) {
      riskScore += 10;
    }

    // Family support
    const supportRisk =
      {
        HIGH: 0,
        MEDIUM: 5,
        LOW: 15,
        UNKNOWN: 8,
      }[demographicData.familySupport] || 8;
    riskScore += supportRisk;

    // Employment and insurance factors
    if (demographicData.employmentStatus === "UNEMPLOYED") {
      riskScore += 10;
    }
    if (demographicData.insuranceType === "NONE") {
      riskScore += 15;
    }

    return Math.min(Math.max(riskScore, 0), 100);
  }

  /**
   * Calculate communication risk based on response patterns
   */
  private async calculateCommunicationRisk(communicationHistory: any[]): Promise<number> {
    if (communicationHistory.length === 0) return 30; // Default low-medium risk

    const responses = communicationHistory.filter((comm) => comm.response_received);
    const responseRate = responses.length / communicationHistory.length;

    // Calculate average response time
    const responseTimes = responses
      .filter((r) => r.response_time_minutes)
      .map((r) => r.response_time_minutes);

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 1440; // Default 24 hours

    // Risk calculation
    let riskScore = 0;
    riskScore += (1 - responseRate) * 50; // Poor response rate increases risk
    riskScore += Math.min(avgResponseTime / 60, 48) * 0.5; // Slow response increases risk

    // Preferred communication channel effectiveness
    const channelEffectiveness = this.analyzeChannelEffectiveness(communicationHistory);
    riskScore += (1 - channelEffectiveness) * 20;

    return Math.min(Math.max(riskScore, 0), 100);
  }

  /**
   * Calculate contextual risk based on current circumstances
   */
  private async calculateContextualRisk(patientId: string): Promise<number> {
    // This would integrate with current patient status, health conditions, etc.
    // For now, returning a base contextual risk
    return 25; // Base contextual risk
  }

  /**
   * Calculate overall risk score from component scores
   */
  private calculateOverallRiskScore(components: {
    historicalRisk: number;
    behavioralRisk: number;
    demographicRisk: number;
    communicationRisk: number;
    contextualRisk: number;
  }): number {
    const weightedScore =
      components.historicalRisk * this.config.weights[RiskFactorCategory.PATIENT_HISTORY] +
      components.behavioralRisk *
        this.config.weights[RiskFactorCategory.APPOINTMENT_CHARACTERISTICS] +
      components.demographicRisk * this.config.weights[RiskFactorCategory.DEMOGRAPHICS] +
      components.communicationRisk *
        this.config.weights[RiskFactorCategory.COMMUNICATION_PATTERNS] +
      components.contextualRisk * this.config.weights[RiskFactorCategory.EXTERNAL_FACTORS];

    return Math.round(weightedScore);
  }

  /**
   * Analyze risk trends over time
   */
  private async analyzeRiskTrends(appointmentHistory: any[]): Promise<{
    riskTrend: "IMPROVING" | "STABLE" | "DETERIORATING";
    trendConfidence: number;
    monthlyHistory: Array<{ month: string; riskScore: number; appointmentCount: number }>;
  }> {
    if (appointmentHistory.length < 6) {
      return {
        riskTrend: "STABLE",
        trendConfidence: 0.5,
        monthlyHistory: [],
      };
    }

    // Group appointments by month
    const monthlyGroups = appointmentHistory.reduce(
      (groups, apt) => {
        const month = new Date(apt.scheduled_date).toISOString().substring(0, 7);
        if (!groups[month]) groups[month] = [];
        groups[month].push(apt);
        return groups;
      },
      {} as Record<string, any[]>,
    );

    // Calculate monthly risk scores
    const monthlyHistory = Object.entries(monthlyGroups)
      .map(([month, appointments]) => ({
        month,
        riskScore: this.calculateMonthlyRiskScore(appointments),
        appointmentCount: appointments.length,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Analyze trend
    const recentMonths = monthlyHistory.slice(-6); // Last 6 months
    if (recentMonths.length < 3) {
      return {
        riskTrend: "STABLE",
        trendConfidence: 0.6,
        monthlyHistory,
      };
    }

    const firstHalf = recentMonths.slice(0, 3);
    const secondHalf = recentMonths.slice(-3);

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.riskScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.riskScore, 0) / secondHalf.length;

    const trendDifference = secondAvg - firstAvg;
    const trendConfidence = Math.min(recentMonths.length / 6, 1);

    let riskTrend: "IMPROVING" | "STABLE" | "DETERIORATING";
    if (trendDifference > 10) {
      riskTrend = "DETERIORATING";
    } else if (trendDifference < -10) {
      riskTrend = "IMPROVING";
    } else {
      riskTrend = "STABLE";
    }

    return {
      riskTrend,
      trendConfidence,
      monthlyHistory,
    };
  }

  /**
   * Identify top risk factors for the patient
   */
  private async identifyTopRiskFactors(patientId: string): Promise<RiskFactor[]> {
    // This would analyze all factors and return the most significant ones
    // Placeholder implementation
    return [
      {
        category: RiskFactorCategory.PATIENT_HISTORY,
        factorName: "High No-Show Rate",
        value: 0.35,
        weight: 0.25,
        contribution: 35,
        description: "Patient has 35% historical no-show rate",
      },
    ];
  }

  /**
   * Identify protective factors that reduce risk
   */
  private async identifyProtectiveFactors(patientId: string): Promise<RiskFactor[]> {
    // This would identify factors that positively influence attendance
    // Placeholder implementation
    return [
      {
        category: RiskFactorCategory.COMMUNICATION_PATTERNS,
        factorName: "High Response Rate",
        value: 0.9,
        weight: 0.15,
        contribution: -10,
        description: "Patient consistently responds to communications",
      },
    ];
  }

  /**
   * Generate intervention recommendations based on risk profile
   */
  private async generateInterventionRecommendations(
    riskScore: number,
    riskFactors: RiskFactor[],
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (riskScore >= 75) {
      recommendations.push("Personal phone call 48 hours before appointment");
      recommendations.push("Offer flexible rescheduling options");
      recommendations.push("Consider incentive program enrollment");
    } else if (riskScore >= 50) {
      recommendations.push("Enhanced reminder sequence (multiple channels)");
      recommendations.push("Confirmation request 24 hours prior");
      recommendations.push("Transportation assistance information");
    } else if (riskScore >= 25) {
      recommendations.push("Standard reminder via preferred channel");
      recommendations.push("Optional confirmation request");
    }

    return recommendations;
  }

  /**
   * Generate appointment recommendations
   */
  private async generateAppointmentRecommendations(
    patientId: string,
    appointmentHistory: any[],
  ): Promise<AppointmentRecommendation[]> {
    const recommendations: AppointmentRecommendation[] = [];

    // Analyze preferred time slots
    const timePreferences = this.analyzeTimePreferences(appointmentHistory);
    if (timePreferences.confidence > 0.7) {
      recommendations.push({
        type: "TIME_SLOT",
        recommendation: `Schedule appointments around ${timePreferences.preferredTime}`,
        expectedImpact: 15,
        confidence: timePreferences.confidence,
        reasoning: "Based on historical attendance patterns",
      });
    }

    // Analyze booking advance time
    const optimalAdvanceTime = this.calculateOptimalAdvanceTime(appointmentHistory);
    recommendations.push({
      type: "ADVANCE_BOOKING",
      recommendation: `Book appointments ${optimalAdvanceTime} days in advance`,
      expectedImpact: 10,
      confidence: 0.8,
      reasoning: "Optimal balance between planning and commitment",
    });

    return recommendations;
  }

  // Helper methods
  private applyTimeDecay(events: any[], allEvents: any[]): number {
    if (events.length === 0) return 0;

    const now = new Date();
    let weightedSum = 0;
    let totalWeight = 0;

    events.forEach((event) => {
      const eventDate = new Date(event.scheduled_date);
      const monthsAgo = Math.max(
        0,
        (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
      );
      const weight = Math.pow(this.config.decayFactors.timeDecay, monthsAgo);

      weightedSum += weight;
      totalWeight += weight;
    });

    const totalEvents = allEvents.length;
    const totalEventWeight = allEvents.reduce((sum, event) => {
      const eventDate = new Date(event.scheduled_date);
      const monthsAgo = Math.max(
        0,
        (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
      );
      return sum + Math.pow(this.config.decayFactors.timeDecay, monthsAgo);
    }, 0);

    return totalEventWeight > 0 ? weightedSum / totalEventWeight : 0;
  }

  private analyzePatterns(appointmentHistory: any[]): number {
    // Look for concerning patterns
    let patternPenalty = 0;

    // Consecutive no-shows
    let consecutiveNoShows = 0;
    let maxConsecutive = 0;

    appointmentHistory
      .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
      .forEach((apt) => {
        if (apt.status === "NO_SHOW") {
          consecutiveNoShows++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveNoShows);
        } else {
          consecutiveNoShows = 0;
        }
      });

    patternPenalty += maxConsecutive * 5; // 5 points per consecutive no-show

    return Math.min(patternPenalty, 25); // Cap at 25 points
  }

  private analyzeBookingPatterns(appointmentHistory: any[]): {
    lastMinuteBookings: number;
    inconsistentTiming: number;
  } {
    const bookings = appointmentHistory
      .filter((apt) => apt.created_at && apt.scheduled_date)
      .map((apt) => {
        const booking = new Date(apt.created_at);
        const appointment = new Date(apt.scheduled_date);
        return (appointment.getTime() - booking.getTime()) / (1000 * 60 * 60 * 24);
      });

    const lastMinuteBookings = bookings.filter((days) => days < 1).length / bookings.length;

    // Calculate timing consistency
    const avgBookingTime = bookings.reduce((sum, days) => sum + days, 0) / bookings.length;
    const variance =
      bookings.reduce((sum, days) => sum + Math.pow(days - avgBookingTime, 2), 0) / bookings.length;
    const inconsistentTiming = Math.min(variance / 100, 1); // Normalize variance

    return {
      lastMinuteBookings,
      inconsistentTiming,
    };
  }

  private analyzeAppointmentFrequency(appointmentHistory: any[]): number {
    // Analyze gaps between appointments
    const dates = appointmentHistory
      .map((apt) => new Date(apt.scheduled_date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length < 2) return 0;

    const gaps = [];
    for (let i = 1; i < dates.length; i++) {
      const gap = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      gaps.push(gap);
    }

    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;

    // Higher variance indicates inconsistent scheduling patterns
    return Math.min(Math.sqrt(variance) / 30, 1); // Normalize
  }

  private getAgeGroupRisk(ageGroup: string): number {
    const riskMap: Record<string, number> = {
      "18-25": 0.8,
      "26-35": 0.6,
      "36-45": 0.4,
      "46-55": 0.3,
      "56-65": 0.2,
      "65+": 0.1,
    };
    return riskMap[ageGroup] || 0.5;
  }

  private analyzeChannelEffectiveness(communicationHistory: any[]): number {
    if (communicationHistory.length === 0) return 0.5;

    const channels = communicationHistory.reduce(
      (acc, comm) => {
        if (!acc[comm.channel]) {
          acc[comm.channel] = { sent: 0, responded: 0 };
        }
        acc[comm.channel].sent++;
        if (comm.response_received) {
          acc[comm.channel].responded++;
        }
        return acc;
      },
      {} as Record<string, { sent: number; responded: number }>,
    );

    const channelRates = Object.values(channels).map((ch) => ch.responded / ch.sent);
    return channelRates.length > 0 ? Math.max(...channelRates) : 0.5;
  }

  private calculateMonthlyRiskScore(appointments: any[]): number {
    const noShows = appointments.filter((apt) => apt.status === "NO_SHOW").length;
    const total = appointments.length;
    return total > 0 ? (noShows / total) * 100 : 0;
  }

  private analyzeInterventionEffectiveness(
    interventionHistory: InterventionOutcome[],
  ): Record<string, number> {
    const effectiveness: Record<string, number> = {};

    interventionHistory.forEach((intervention) => {
      if (!effectiveness[intervention.type]) {
        effectiveness[intervention.type] = 0;
      }
      effectiveness[intervention.type] += intervention.effectivenessScore;
    });

    // Average the effectiveness scores
    Object.keys(effectiveness).forEach((type) => {
      const count = interventionHistory.filter((i) => i.type === type).length;
      effectiveness[type] = effectiveness[type] / count;
    });

    return effectiveness;
  }

  private analyzeTimePreferences(appointmentHistory: any[]): {
    preferredTime: string;
    confidence: number;
  } {
    const timeSlots = appointmentHistory
      .filter((apt) => apt.status === "ATTENDED")
      .map((apt) => new Date(apt.scheduled_date).getHours());

    if (timeSlots.length === 0) {
      return { preferredTime: "10:00", confidence: 0 };
    }

    const timeCounts = timeSlots.reduce(
      (acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const [mostFrequentHour, count] = Object.entries(timeCounts).sort(([, a], [, b]) => b - a)[0];

    const confidence = count / timeSlots.length;
    const preferredTime = `${mostFrequentHour}:00`;

    return { preferredTime, confidence };
  }

  private calculateOptimalAdvanceTime(appointmentHistory: any[]): number {
    const advanceTimes = appointmentHistory
      .filter((apt) => apt.created_at && apt.scheduled_date && apt.status === "ATTENDED")
      .map((apt) => {
        const booking = new Date(apt.created_at);
        const appointment = new Date(apt.scheduled_date);
        return Math.round((appointment.getTime() - booking.getTime()) / (1000 * 60 * 60 * 24));
      });

    if (advanceTimes.length === 0) return 7; // Default to 1 week

    // Find the most common advance time for attended appointments
    const timeFrequency = advanceTimes.reduce(
      (acc, time) => {
        acc[time] = (acc[time] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const [optimalTime] = Object.entries(timeFrequency).sort(([, a], [, b]) => b - a)[0];

    return parseInt(optimalTime);
  }

  private async getCommunicationScore(patientId: string): Promise<number> {
    // Placeholder for communication score calculation
    return 0.75;
  }

  private calculateConfidenceScore(appointmentCount: number): number {
    if (appointmentCount < this.config.minimumDataPoints) {
      return 0.5;
    }

    // Confidence increases with more data points, plateaus at 20 appointments
    const maxConfidence = 0.95;
    const minConfidence = 0.6;
    const optimalDataPoints = 20;

    const confidenceIncrease = Math.min(appointmentCount / optimalDataPoints, 1);
    return minConfidence + (maxConfidence - minConfidence) * confidenceIncrease;
  }

  private getRiskLevel(riskScore: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (riskScore >= this.config.thresholds.critical) return "CRITICAL";
    if (riskScore >= this.config.thresholds.high) return "HIGH";
    if (riskScore >= this.config.thresholds.medium) return "MEDIUM";
    return "LOW";
  }

  private async getPatientAppointmentHistory(patientId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", patientId)
      .order("scheduled_date", { ascending: false });

    return data || [];
  }

  private async getPatientDemographics(patientId: string): Promise<DemographicRiskFactors> {
    // Placeholder implementation
    return {
      ageGroup: "26-35",
      distanceFromClinic: 15,
      socioeconomicIndicators: {},
      transportationAccess: "GOOD",
      languageBarriers: false,
      familySupport: "MEDIUM",
      employmentStatus: "EMPLOYED",
      insuranceType: "PRIVATE",
    };
  }

  private async getCommunicationHistory(patientId: string): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  private async getInterventionHistory(patientId: string): Promise<InterventionOutcome[]> {
    // Placeholder implementation
    return [];
  }

  private async calculateSeasonalPatterns(
    appointmentHistory: any[],
  ): Promise<Record<string, number>> {
    // Placeholder implementation
    return {
      spring: 0.15,
      summer: 0.25,
      autumn: 0.2,
      winter: 0.3,
    };
  }

  /**
   * Update risk profile with new appointment outcome
   */
  async updateRiskProfile(
    patientId: string,
    appointmentOutcome: "ATTENDED" | "NO_SHOW" | "CANCELLED" | "RESCHEDULED",
  ): Promise<void> {
    // Implementation for updating risk profile based on new data
    console.log(
      `Updating risk profile for patient ${patientId} with outcome: ${appointmentOutcome}`,
    );
  }

  /**
   * Get risk scoring configuration
   */
  getConfig(): RiskScoringConfig {
    return { ...this.config };
  }

  /**
   * Update risk scoring configuration
   */
  updateConfig(newConfig: Partial<RiskScoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export default instance
export const riskScoringEngine = new RiskScoringEngine();

// Export utility functions
export function formatRiskScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getRiskLevelColor(level: string): string {
  const colors = {
    LOW: "text-green-600",
    MEDIUM: "text-yellow-600",
    HIGH: "text-orange-600",
    CRITICAL: "text-red-600",
  };
  return colors[level as keyof typeof colors] || "text-gray-600";
}

export function getRiskTrendIcon(trend: string): string {
  const icons = {
    IMPROVING: "↗️",
    STABLE: "→",
    DETERIORATING: "↘️",
  };
  return icons[trend as keyof typeof icons] || "→";
}

export function calculateRiskReduction(
  baseRisk: number,
  interventionEffectiveness: number,
): number {
  return Math.round(baseRisk * (1 - interventionEffectiveness));
}
