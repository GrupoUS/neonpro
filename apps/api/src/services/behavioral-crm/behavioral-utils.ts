/**
 * Behavioral Analysis Utilities - Extracted for Reusability
 *
 * IMPROVEMENTS:
 * ✅ Extracted pure calculation functions from large service class
 * ✅ Single Responsibility Principle applied
 * ✅ Reusable utility functions
 * ✅ Better testability
 * ✅ Reduced coupling
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface BehavioralScores {
  readonly engagement: number;
  readonly loyalty: number;
  readonly satisfaction: number;
  readonly risk: number;
  readonly compliance: number;
}

export interface BehavioralPatterns {
  readonly communicationStyle: "formal" | "casual" | "direct" | "detailed";
  readonly responseTime: "immediate" | "hours" | "days" | "delayed";
  readonly preferredChannel: "whatsapp" | "email" | "phone" | "sms";
  readonly appointmentBehavior: "punctual" | "early" | "late" | "reschedules";
  readonly seasonalTrends: readonly string[];
}

export type PersonalityType = "analytical" | "expressive" | "driver" | "amiable";
export type PatientSegment = "vip" | "loyal" | "at-risk" | "new" | "inactive";

export interface BehavioralEvent {
  readonly patientId: string;
  readonly eventType: "appointment" | "communication" | "payment" | "review";
  readonly timestamp: Date;
  readonly outcome: "positive" | "neutral" | "negative";
  readonly metadata: Record<string, unknown>;
}

export interface PatientInteraction {
  readonly patientId: string;
  readonly channel: string;
  readonly responseTime: number; // in hours
  readonly sentiment: "positive" | "neutral" | "negative";
  readonly timestamp: Date;
  readonly message?: string; // Optional message content
}

// =============================================================================
// SCORE CALCULATION UTILITIES
// =============================================================================

/**
 * Calculates engagement score based on interaction frequency and quality
 * Pure function - easily testable
 */
export function calculateEngagementScore(
  events: readonly BehavioralEvent[],
  interactions: readonly PatientInteraction[],
): number {
  if (events.length === 0 && interactions.length === 0) {
    return 0;
  }

  // Recent activity weight (last 90 days)
  const recentEvents = filterRecentEvents(events, 90);
  const recentInteractions = filterRecentInteractions(interactions, 90);

  // Base score from event frequency
  const eventScore = Math.min(recentEvents.length * 10, 70);

  // Interaction quality bonus
  const positiveInteractions = recentInteractions.filter(i => i.sentiment === "positive");
  const interactionBonus = Math.min(positiveInteractions.length * 5, 30);

  return Math.min(eventScore + interactionBonus, 100);
}

/**
 * Calculates loyalty score based on long-term patterns
 * Considers appointment consistency and retention
 */
export function calculateLoyaltyScore(
  events: readonly BehavioralEvent[],
  registrationDate: Date,
): number {
  const monthsSinceRegistration = getMonthsDifference(registrationDate, new Date());

  if (monthsSinceRegistration < 3) {
    return 20; // New patient baseline
  }

  // Consistency over time
  const appointmentEvents = events.filter(e => e.eventType === "appointment");
  const consistencyScore = calculateConsistencyScore(appointmentEvents);

  // Tenure bonus
  const tenureBonus = Math.min(monthsSinceRegistration * 2, 40);

  return Math.min(consistencyScore + tenureBonus, 100);
}

/**
 * Calculates satisfaction score from feedback and reviews
 * Weighted by recency
 */
export function calculateSatisfactionScore(events: readonly BehavioralEvent[]): number {
  const reviewEvents = events.filter(e => e.eventType === "review");

  if (reviewEvents.length === 0) {
    return 50; // Neutral baseline when no feedback
  }

  let weightedScore = 0;
  let totalWeight = 0;

  reviewEvents.forEach(event => {
    const daysSince = getDaysDifference(event.timestamp, new Date());
    const weight = calculateRecencyWeight(daysSince);
    const score = getOutcomeScore(event.outcome);

    weightedScore += score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;
}

/**
 * Calculates risk score (probability of churn or no-show)
 * Higher score = higher risk
 */
export function calculateRiskScore(
  events: readonly BehavioralEvent[],
  interactions: readonly PatientInteraction[],
): number {
  // Recent activity (lower activity = higher risk)
  const recentEvents = filterRecentEvents(events, 60);
  const activityRisk = recentEvents.length === 0 ? 40 : Math.max(0, 30 - recentEvents.length * 5);

  // Response time patterns (slower response = higher risk)
  const avgResponseTime = calculateAverageResponseTime(interactions);
  const responseRisk = Math.min(avgResponseTime / 24 * 20, 30); // Cap at 30

  // Negative outcomes
  const negativeEvents = events.filter(e => e.outcome === "negative");
  const outcomeRisk = Math.min(negativeEvents.length * 10, 30);

  return Math.min(activityRisk + responseRisk + outcomeRisk, 100);
}

/**
 * Calculates treatment compliance score
 * Based on appointment adherence and follow-through
 */
export function calculateComplianceScore(events: readonly BehavioralEvent[]): number {
  const appointmentEvents = events.filter(e => e.eventType === "appointment");

  if (appointmentEvents.length === 0) {
    return 50; // No data baseline
  }

  const positiveAppointments = appointmentEvents.filter(e => e.outcome === "positive");
  const complianceRate = (positiveAppointments.length / appointmentEvents.length) * 100;

  return Math.round(complianceRate);
}

// =============================================================================
// PATTERN DETECTION UTILITIES
// =============================================================================

/**
 * Analyzes communication patterns to determine style
 */
export function determineCommunicationStyle(
  interactions: readonly PatientInteraction[],
): "formal" | "casual" | "direct" | "detailed" {
  // This is a simplified implementation
  // In real-world, this would analyze message content, length, formality markers

  const avgResponseTime = calculateAverageResponseTime(interactions);

  if (avgResponseTime < 2) {return "direct";}
  if (avgResponseTime < 8) {return "casual";}
  if (avgResponseTime < 24) {return "formal";}
  return "detailed";
}

/**
 * Analyzes response time patterns
 */
export function categorizeResponseTime(
  avgHours: number,
): "immediate" | "hours" | "days" | "delayed" {
  if (avgHours <= 1) {return "immediate";}
  if (avgHours <= 8) {return "hours";}
  if (avgHours <= 24) {return "days";}
  return "delayed";
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function filterRecentEvents(events: readonly BehavioralEvent[], days: number): BehavioralEvent[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return events.filter(event => event.timestamp >= cutoffDate);
}

function filterRecentInteractions(
  interactions: readonly PatientInteraction[],
  days: number,
): PatientInteraction[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return interactions.filter(interaction => interaction.timestamp >= cutoffDate);
}

function getMonthsDifference(startDate: Date, endDate: Date): number {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  return yearDiff * 12 + monthDiff;
}

function getDaysDifference(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

function calculateConsistencyScore(events: readonly BehavioralEvent[]): number {
  if (events.length < 2) {return 20;}

  // Calculate standard deviation of intervals between appointments
  // Lower deviation = higher consistency
  const intervals: number[] = [];

  for (let i = 1; i < events.length; i++) {
    const prevEvent = events[i - 1];
    const currentEvent = events[i];
    if (prevEvent?.timestamp && currentEvent?.timestamp) {
      const interval = getDaysDifference(prevEvent.timestamp, currentEvent.timestamp);
      intervals.push(interval);
    }
  }

  if (intervals.length === 0) {
    return 0;
  }

  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0)
    / intervals.length;
  const standardDeviation = Math.sqrt(variance);

  // Convert to consistency score (lower deviation = higher score)
  return Math.max(20, 100 - standardDeviation);
}

function calculateRecencyWeight(daysSince: number): number {
  // More recent events have higher weight
  return Math.max(0.1, 1 - (daysSince / 365));
}

function getOutcomeScore(outcome: "positive" | "neutral" | "negative"): number {
  switch (outcome) {
    case "positive":
      return 100;
    case "neutral":
      return 50;
    case "negative":
      return 0;
    default:
      return 50;
  }
}

function calculateAverageResponseTime(interactions: readonly PatientInteraction[]): number {
  if (interactions.length === 0) {return 24;} // Default to 24 hours

  const totalTime = interactions.reduce((sum, interaction) => sum + interaction.responseTime, 0);
  return totalTime / interactions.length;
}
