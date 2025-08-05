// Suspicious Activity Detection System
// Advanced behavioral analysis and anomaly detection for session security

import type { SessionConfig } from "@/lib/auth/config/session-config";
import type { SessionUtils } from "@/lib/auth/utils/session-utils";
import type { SecurityEvent, SuspiciousActivity, UserRole, UserSession } from "@/types/session";

export interface BehaviorPattern {
  userId: string;
  sessionId: string;
  patternType: BehaviorPatternType;
  baseline: BehaviorBaseline;
  currentMetrics: BehaviorMetrics;
  anomalyScore: number; // 0-100
  confidence: number; // 0-100
  timestamp: number;
}

export type BehaviorPatternType =
  | "typing_speed"
  | "mouse_movement"
  | "navigation_pattern"
  | "api_usage"
  | "time_pattern"
  | "location_pattern"
  | "device_pattern"
  | "interaction_frequency";

export interface BehaviorBaseline {
  avgTypingSpeed: number; // WPM
  avgMouseSpeed: number; // pixels/second
  commonNavigationPaths: string[];
  typicalApiEndpoints: string[];
  usualLoginTimes: number[]; // hours of day
  frequentLocations: string[];
  preferredDevices: string[];
  avgSessionDuration: number; // minutes
  interactionFrequency: number; // actions per minute
}

export interface BehaviorMetrics {
  currentTypingSpeed: number;
  currentMouseSpeed: number;
  navigationPath: string[];
  apiEndpoints: string[];
  loginTime: number;
  location: string;
  deviceType: string;
  sessionDuration: number;
  interactionFrequency: number;
}

export interface AnomalyAlert {
  id: string;
  userId: string;
  sessionId: string;
  alertType: AnomalyType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: AnomalyEvidence;
  riskScore: number; // 0-100
  timestamp: number;
  resolved: boolean;
  falsePositive: boolean;
}

export type AnomalyType =
  | "unusual_typing_pattern"
  | "abnormal_mouse_behavior"
  | "suspicious_navigation"
  | "unusual_api_usage"
  | "off_hours_access"
  | "location_anomaly"
  | "device_anomaly"
  | "rapid_actions"
  | "bot_like_behavior"
  | "credential_stuffing"
  | "session_hijacking"
  | "privilege_escalation";

export interface AnomalyEvidence {
  patternDeviations: Record<string, number>;
  statisticalSignificance: number;
  comparisonData: Record<string, any>;
  contextualFactors: string[];
  relatedEvents: string[];
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  patternTypes: BehaviorPatternType[];
  thresholds: Record<string, number>;
  severity: AnomalyAlert["severity"];
  enabled: boolean;
  falsePositiveRate: number;
  lastUpdated: number;
}

export class SuspiciousActivityDetector {
  private config: SessionConfig;
  private utils: SessionUtils;
  private behaviorBaselines: Map<string, BehaviorBaseline> = new Map();
  private activePatterns: Map<string, BehaviorPattern[]> = new Map();
  private anomalyAlerts: Map<string, AnomalyAlert> = new Map();
  private detectionRules: Map<string, DetectionRule> = new Map();
  private learningMode: boolean = true;
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = SessionConfig.getInstance();
    this.utils = new SessionUtils();
    this.initializeDetectionRules();
    this.startContinuousAnalysis();
  }

  /**
   * Initialize default detection rules
   */
  private initializeDetectionRules(): void {
    const rules: DetectionRule[] = [
      {
        id: "typing_speed_anomaly",
        name: "Unusual Typing Speed",
        description: "Detects significant deviations in typing speed patterns",
        patternTypes: ["typing_speed"],
        thresholds: { deviation: 50, confidence: 80 },
        severity: "medium",
        enabled: true,
        falsePositiveRate: 0.05,
        lastUpdated: Date.now(),
      },
      {
        id: "mouse_behavior_anomaly",
        name: "Abnormal Mouse Behavior",
        description: "Detects bot-like or unusual mouse movement patterns",
        patternTypes: ["mouse_movement"],
        thresholds: { deviation: 60, confidence: 85 },
        severity: "high",
        enabled: true,
        falsePositiveRate: 0.03,
        lastUpdated: Date.now(),
      },
      {
        id: "off_hours_access",
        name: "Off-Hours Access",
        description: "Detects access during unusual hours for the user",
        patternTypes: ["time_pattern"],
        thresholds: { deviation: 70, confidence: 90 },
        severity: "medium",
        enabled: true,
        falsePositiveRate: 0.08,
        lastUpdated: Date.now(),
      },
      {
        id: "location_anomaly",
        name: "Suspicious Location",
        description: "Detects access from unusual geographic locations",
        patternTypes: ["location_pattern"],
        thresholds: { deviation: 80, confidence: 95 },
        severity: "high",
        enabled: true,
        falsePositiveRate: 0.02,
        lastUpdated: Date.now(),
      },
      {
        id: "rapid_actions",
        name: "Rapid Action Sequence",
        description: "Detects unusually fast sequences of actions",
        patternTypes: ["interaction_frequency"],
        thresholds: { deviation: 75, confidence: 85 },
        severity: "high",
        enabled: true,
        falsePositiveRate: 0.04,
        lastUpdated: Date.now(),
      },
      {
        id: "privilege_escalation",
        name: "Privilege Escalation Attempt",
        description: "Detects attempts to access unauthorized resources",
        patternTypes: ["api_usage", "navigation_pattern"],
        thresholds: { deviation: 90, confidence: 95 },
        severity: "critical",
        enabled: true,
        falsePositiveRate: 0.01,
        lastUpdated: Date.now(),
      },
    ];

    rules.forEach((rule) => {
      this.detectionRules.set(rule.id, rule);
    });
  }

  /**
   * Start continuous behavioral analysis
   */
  private startContinuousAnalysis(): void {
    this.analysisInterval = setInterval(() => {
      this.performBehaviorAnalysis();
    }, 30000); // Analyze every 30 seconds
  }

  /**
   * Record user behavior data
   */
  public recordBehavior(
    userId: string,
    sessionId: string,
    behaviorType: BehaviorPatternType,
    metrics: Partial<BehaviorMetrics>,
  ): void {
    try {
      const pattern: BehaviorPattern = {
        userId,
        sessionId,
        patternType: behaviorType,
        baseline: this.getBehaviorBaseline(userId),
        currentMetrics: this.mergeBehaviorMetrics(userId, metrics),
        anomalyScore: 0,
        confidence: 0,
        timestamp: Date.now(),
      };

      // Calculate anomaly score
      pattern.anomalyScore = this.calculateAnomalyScore(pattern);
      pattern.confidence = this.calculateConfidence(pattern);

      // Store pattern
      const userPatterns = this.activePatterns.get(userId) || [];
      userPatterns.push(pattern);

      // Keep only last 100 patterns per user
      if (userPatterns.length > 100) {
        userPatterns.shift();
      }

      this.activePatterns.set(userId, userPatterns);

      // Check for anomalies
      this.checkForAnomalies(pattern);

      // Update baseline if in learning mode
      if (this.learningMode && pattern.anomalyScore < 30) {
        this.updateBehaviorBaseline(userId, pattern);
      }
    } catch (error) {
      console.error("Error recording behavior:", error);
    }
  }

  /**
   * Record typing behavior
   */
  public recordTypingBehavior(
    userId: string,
    sessionId: string,
    typingSpeed: number,
    keyPressIntervals: number[],
  ): void {
    this.recordBehavior(userId, sessionId, "typing_speed", {
      currentTypingSpeed: typingSpeed,
    });
  }

  /**
   * Record mouse behavior
   */
  public recordMouseBehavior(
    userId: string,
    sessionId: string,
    mouseSpeed: number,
    clickPatterns: number[],
  ): void {
    this.recordBehavior(userId, sessionId, "mouse_movement", {
      currentMouseSpeed: mouseSpeed,
    });
  }

  /**
   * Record navigation behavior
   */
  public recordNavigationBehavior(
    userId: string,
    sessionId: string,
    navigationPath: string[],
  ): void {
    this.recordBehavior(userId, sessionId, "navigation_pattern", {
      navigationPath,
    });
  }

  /**
   * Record API usage behavior
   */
  public recordApiUsage(
    userId: string,
    sessionId: string,
    endpoint: string,
    frequency: number,
  ): void {
    const userPatterns = this.activePatterns.get(userId) || [];
    const recentApiPatterns = userPatterns
      .filter((p) => p.patternType === "api_usage" && Date.now() - p.timestamp < 300000)
      .flatMap((p) => p.currentMetrics.apiEndpoints || []);

    recentApiPatterns.push(endpoint);

    this.recordBehavior(userId, sessionId, "api_usage", {
      apiEndpoints: recentApiPatterns,
      interactionFrequency: frequency,
    });
  }

  /**
   * Perform comprehensive behavior analysis
   */
  private async performBehaviorAnalysis(): Promise<void> {
    try {
      for (const [userId, patterns] of this.activePatterns.entries()) {
        const recentPatterns = patterns.filter(
          (p) => Date.now() - p.timestamp < 300000, // Last 5 minutes
        );

        if (recentPatterns.length === 0) continue;

        // Analyze patterns for anomalies
        const anomalies = await this.detectAnomalies(userId, recentPatterns);

        // Process detected anomalies
        for (const anomaly of anomalies) {
          await this.processAnomaly(anomaly);
        }

        // Update risk scores
        await this.updateUserRiskScore(userId, recentPatterns);
      }
    } catch (error) {
      console.error("Error in behavior analysis:", error);
    }
  }

  /**
   * Detect anomalies in behavior patterns
   */
  private async detectAnomalies(
    userId: string,
    patterns: BehaviorPattern[],
  ): Promise<AnomalyAlert[]> {
    const anomalies: AnomalyAlert[] = [];

    for (const rule of this.detectionRules.values()) {
      if (!rule.enabled) continue;

      const relevantPatterns = patterns.filter((p) => rule.patternTypes.includes(p.patternType));

      if (relevantPatterns.length === 0) continue;

      const anomaly = await this.applyDetectionRule(userId, rule, relevantPatterns);
      if (anomaly) {
        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  /**
   * Apply detection rule to patterns
   */
  private async applyDetectionRule(
    userId: string,
    rule: DetectionRule,
    patterns: BehaviorPattern[],
  ): Promise<AnomalyAlert | null> {
    try {
      const avgAnomalyScore =
        patterns.reduce((sum, p) => sum + p.anomalyScore, 0) / patterns.length;
      const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;

      if (
        avgAnomalyScore >= rule.thresholds.deviation &&
        avgConfidence >= rule.thresholds.confidence
      ) {
        const alertId = this.utils.generateSessionToken();
        const sessionId = patterns[0].sessionId;

        const anomaly: AnomalyAlert = {
          id: alertId,
          userId,
          sessionId,
          alertType: this.mapRuleToAnomalyType(rule.id),
          severity: rule.severity,
          description: `${rule.description} (Score: ${avgAnomalyScore.toFixed(1)})`,
          evidence: {
            patternDeviations: this.calculatePatternDeviations(patterns),
            statisticalSignificance: avgConfidence,
            comparisonData: this.getComparisonData(userId, patterns),
            contextualFactors: this.getContextualFactors(patterns),
            relatedEvents: [],
          },
          riskScore: this.calculateRiskScore(avgAnomalyScore, rule.severity),
          timestamp: Date.now(),
          resolved: false,
          falsePositive: false,
        };

        return anomaly;
      }

      return null;
    } catch (error) {
      console.error("Error applying detection rule:", error);
      return null;
    }
  }

  /**
   * Process detected anomaly
   */
  private async processAnomaly(anomaly: AnomalyAlert): Promise<void> {
    try {
      // Store anomaly
      this.anomalyAlerts.set(anomaly.id, anomaly);

      // Create security event
      await this.createSecurityEvent(anomaly);

      // Take automated actions based on severity
      await this.takeAutomatedAction(anomaly);

      // Send notifications
      await this.sendAnomalyNotification(anomaly);

      console.log(
        `Anomaly detected: ${anomaly.alertType} for user ${anomaly.userId} (Risk: ${anomaly.riskScore})`,
      );
    } catch (error) {
      console.error("Error processing anomaly:", error);
    }
  }

  /**
   * Take automated action based on anomaly severity
   */
  private async takeAutomatedAction(anomaly: AnomalyAlert): Promise<void> {
    switch (anomaly.severity) {
      case "critical":
        // Immediately suspend session
        await this.suspendSession(anomaly.sessionId, "Critical security anomaly detected");
        break;

      case "high":
        // Require re-authentication
        await this.requireReAuthentication(anomaly.sessionId);
        break;

      case "medium":
        // Increase monitoring
        await this.increaseMonitoring(anomaly.userId);
        break;

      case "low":
        // Log for review
        await this.logForReview(anomaly);
        break;
    }
  }

  /**
   * Calculate anomaly score for behavior pattern
   */
  private calculateAnomalyScore(pattern: BehaviorPattern): number {
    const baseline = pattern.baseline;
    const current = pattern.currentMetrics;
    let score = 0;

    switch (pattern.patternType) {
      case "typing_speed":
        if (baseline.avgTypingSpeed > 0) {
          const deviation =
            Math.abs(current.currentTypingSpeed - baseline.avgTypingSpeed) /
            baseline.avgTypingSpeed;
          score = Math.min(100, deviation * 100);
        }
        break;

      case "mouse_movement":
        if (baseline.avgMouseSpeed > 0) {
          const deviation =
            Math.abs(current.currentMouseSpeed - baseline.avgMouseSpeed) / baseline.avgMouseSpeed;
          score = Math.min(100, deviation * 100);
        }
        break;

      case "time_pattern": {
        const currentHour = new Date().getHours();
        const isUsualTime = baseline.usualLoginTimes.some(
          (hour) => Math.abs(hour - currentHour) <= 2,
        );
        score = isUsualTime ? 0 : 80;
        break;
      }

      case "location_pattern": {
        const isKnownLocation = baseline.frequentLocations.includes(current.location);
        score = isKnownLocation ? 0 : 90;
        break;
      }

      case "interaction_frequency":
        if (baseline.interactionFrequency > 0) {
          const deviation =
            Math.abs(current.interactionFrequency - baseline.interactionFrequency) /
            baseline.interactionFrequency;
          score = Math.min(100, deviation * 150); // Higher weight for interaction frequency
        }
        break;

      default:
        score = 0;
    }

    return Math.round(score);
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(pattern: BehaviorPattern): number {
    const baseline = pattern.baseline;
    let confidence = 50; // Base confidence

    // Increase confidence based on baseline data quality
    if (baseline.avgTypingSpeed > 0) confidence += 10;
    if (baseline.commonNavigationPaths.length > 5) confidence += 10;
    if (baseline.usualLoginTimes.length > 3) confidence += 10;
    if (baseline.frequentLocations.length > 2) confidence += 10;
    if (baseline.avgSessionDuration > 0) confidence += 10;

    return Math.min(100, confidence);
  }

  /**
   * Check for immediate anomalies
   */
  private checkForAnomalies(pattern: BehaviorPattern): void {
    if (pattern.anomalyScore >= 80 && pattern.confidence >= 80) {
      // High-confidence anomaly detected
      this.processAnomaly({
        id: this.utils.generateSessionToken(),
        userId: pattern.userId,
        sessionId: pattern.sessionId,
        alertType: this.mapPatternToAnomalyType(pattern.patternType),
        severity: pattern.anomalyScore >= 90 ? "critical" : "high",
        description: `High anomaly score detected in ${pattern.patternType}`,
        evidence: {
          patternDeviations: { [pattern.patternType]: pattern.anomalyScore },
          statisticalSignificance: pattern.confidence,
          comparisonData: {},
          contextualFactors: [],
          relatedEvents: [],
        },
        riskScore: pattern.anomalyScore,
        timestamp: Date.now(),
        resolved: false,
        falsePositive: false,
      });
    }
  }

  /**
   * Utility functions
   */
  private getBehaviorBaseline(userId: string): BehaviorBaseline {
    return (
      this.behaviorBaselines.get(userId) || {
        avgTypingSpeed: 0,
        avgMouseSpeed: 0,
        commonNavigationPaths: [],
        typicalApiEndpoints: [],
        usualLoginTimes: [],
        frequentLocations: [],
        preferredDevices: [],
        avgSessionDuration: 0,
        interactionFrequency: 0,
      }
    );
  }

  private mergeBehaviorMetrics(userId: string, metrics: Partial<BehaviorMetrics>): BehaviorMetrics {
    const baseline = this.getBehaviorBaseline(userId);
    return {
      currentTypingSpeed: metrics.currentTypingSpeed || baseline.avgTypingSpeed,
      currentMouseSpeed: metrics.currentMouseSpeed || baseline.avgMouseSpeed,
      navigationPath: metrics.navigationPath || [],
      apiEndpoints: metrics.apiEndpoints || [],
      loginTime: metrics.loginTime || Date.now(),
      location: metrics.location || "unknown",
      deviceType: metrics.deviceType || "unknown",
      sessionDuration: metrics.sessionDuration || 0,
      interactionFrequency: metrics.interactionFrequency || 0,
    };
  }

  private updateBehaviorBaseline(userId: string, pattern: BehaviorPattern): void {
    const baseline = this.getBehaviorBaseline(userId);
    const current = pattern.currentMetrics;

    // Update baseline with exponential moving average
    const alpha = 0.1; // Learning rate

    switch (pattern.patternType) {
      case "typing_speed":
        baseline.avgTypingSpeed =
          baseline.avgTypingSpeed * (1 - alpha) + current.currentTypingSpeed * alpha;
        break;
      case "mouse_movement":
        baseline.avgMouseSpeed =
          baseline.avgMouseSpeed * (1 - alpha) + current.currentMouseSpeed * alpha;
        break;
      case "time_pattern": {
        const hour = new Date().getHours();
        if (!baseline.usualLoginTimes.includes(hour)) {
          baseline.usualLoginTimes.push(hour);
        }
        break;
      }
      case "location_pattern":
        if (!baseline.frequentLocations.includes(current.location)) {
          baseline.frequentLocations.push(current.location);
        }
        break;
    }

    this.behaviorBaselines.set(userId, baseline);
  }

  private mapRuleToAnomalyType(ruleId: string): AnomalyType {
    const mapping: Record<string, AnomalyType> = {
      typing_speed_anomaly: "unusual_typing_pattern",
      mouse_behavior_anomaly: "abnormal_mouse_behavior",
      off_hours_access: "off_hours_access",
      location_anomaly: "location_anomaly",
      rapid_actions: "rapid_actions",
      privilege_escalation: "privilege_escalation",
    };
    return mapping[ruleId] || "bot_like_behavior";
  }

  private mapPatternToAnomalyType(patternType: BehaviorPatternType): AnomalyType {
    const mapping: Record<BehaviorPatternType, AnomalyType> = {
      typing_speed: "unusual_typing_pattern",
      mouse_movement: "abnormal_mouse_behavior",
      navigation_pattern: "suspicious_navigation",
      api_usage: "unusual_api_usage",
      time_pattern: "off_hours_access",
      location_pattern: "location_anomaly",
      device_pattern: "device_anomaly",
      interaction_frequency: "rapid_actions",
    };
    return mapping[patternType];
  }

  private calculatePatternDeviations(patterns: BehaviorPattern[]): Record<string, number> {
    const deviations: Record<string, number> = {};
    patterns.forEach((pattern) => {
      deviations[pattern.patternType] = pattern.anomalyScore;
    });
    return deviations;
  }

  private getComparisonData(userId: string, patterns: BehaviorPattern[]): Record<string, any> {
    const baseline = this.getBehaviorBaseline(userId);
    return {
      baseline,
      currentPatterns: patterns.map((p) => p.currentMetrics),
    };
  }

  private getContextualFactors(patterns: BehaviorPattern[]): string[] {
    const factors: string[] = [];
    const now = new Date();
    const hour = now.getHours();

    if (hour < 6 || hour > 22) factors.push("off_hours");
    if (patterns.length > 10) factors.push("high_activity");
    if (patterns.some((p) => p.anomalyScore > 70)) factors.push("multiple_anomalies");

    return factors;
  }

  private calculateRiskScore(anomalyScore: number, severity: AnomalyAlert["severity"]): number {
    const severityMultiplier = {
      low: 0.5,
      medium: 0.7,
      high: 0.9,
      critical: 1.0,
    };

    return Math.round(anomalyScore * severityMultiplier[severity]);
  }

  private async createSecurityEvent(anomaly: AnomalyAlert): Promise<void> {
    try {
      await fetch("/api/security/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "suspicious_activity",
          severity: anomaly.severity,
          userId: anomaly.userId,
          sessionId: anomaly.sessionId,
          description: anomaly.description,
          metadata: {
            anomalyId: anomaly.id,
            alertType: anomaly.alertType,
            riskScore: anomaly.riskScore,
            evidence: anomaly.evidence,
          },
        }),
      });
    } catch (error) {
      console.error("Error creating security event:", error);
    }
  }

  private async suspendSession(sessionId: string, reason: string): Promise<void> {
    await fetch("/api/session/suspend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, reason }),
    });
  }

  private async requireReAuthentication(sessionId: string): Promise<void> {
    await fetch("/api/session/require-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });
  }

  private async increaseMonitoring(userId: string): Promise<void> {
    // Increase monitoring frequency for this user
    console.log(`Increasing monitoring for user ${userId}`);
  }

  private async logForReview(anomaly: AnomalyAlert): Promise<void> {
    console.log(`Anomaly logged for review:`, anomaly);
  }

  private async sendAnomalyNotification(anomaly: AnomalyAlert): Promise<void> {
    // Send notification to security team
    console.log(`Security notification sent for anomaly ${anomaly.id}`);
  }

  private async updateUserRiskScore(userId: string, patterns: BehaviorPattern[]): Promise<void> {
    const avgRiskScore = patterns.reduce((sum, p) => sum + p.anomalyScore, 0) / patterns.length;

    await fetch("/api/users/risk-score", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        riskScore: avgRiskScore,
      }),
    });
  }

  /**
   * Public methods for external use
   */
  public getAnomalyAlerts(userId: string): AnomalyAlert[] {
    return Array.from(this.anomalyAlerts.values()).filter(
      (alert) => alert.userId === userId && !alert.resolved,
    );
  }

  public resolveAnomaly(anomalyId: string, falsePositive: boolean = false): boolean {
    const anomaly = this.anomalyAlerts.get(anomalyId);
    if (anomaly) {
      anomaly.resolved = true;
      anomaly.falsePositive = falsePositive;
      return true;
    }
    return false;
  }

  public getUserRiskProfile(userId: string): {
    riskScore: number;
    recentAnomalies: number;
    behaviorBaseline: BehaviorBaseline;
    lastAnalysis: number;
  } {
    const patterns = this.activePatterns.get(userId) || [];
    const recentPatterns = patterns.filter((p) => Date.now() - p.timestamp < 86400000); // Last 24 hours
    const avgRiskScore =
      recentPatterns.length > 0
        ? recentPatterns.reduce((sum, p) => sum + p.anomalyScore, 0) / recentPatterns.length
        : 0;

    const recentAnomalies = Array.from(this.anomalyAlerts.values()).filter(
      (a) => a.userId === userId && Date.now() - a.timestamp < 86400000,
    ).length;

    return {
      riskScore: Math.round(avgRiskScore),
      recentAnomalies,
      behaviorBaseline: this.getBehaviorBaseline(userId),
      lastAnalysis:
        recentPatterns.length > 0 ? Math.max(...recentPatterns.map((p) => p.timestamp)) : 0,
    };
  }

  public setLearningMode(enabled: boolean): void {
    this.learningMode = enabled;
  }

  public cleanup(): void {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Clean up old patterns
    for (const [userId, patterns] of this.activePatterns.entries()) {
      const recentPatterns = patterns.filter((p) => now - p.timestamp < maxAge);
      this.activePatterns.set(userId, recentPatterns);
    }

    // Clean up old anomalies
    for (const [id, anomaly] of this.anomalyAlerts.entries()) {
      if (now - anomaly.timestamp > maxAge) {
        this.anomalyAlerts.delete(id);
      }
    }
  }

  public destroy(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }
}

// Singleton instance
let suspiciousActivityDetector: SuspiciousActivityDetector | null = null;

export function getSuspiciousActivityDetector(): SuspiciousActivityDetector {
  if (!suspiciousActivityDetector) {
    suspiciousActivityDetector = new SuspiciousActivityDetector();
  }
  return suspiciousActivityDetector;
}

export default SuspiciousActivityDetector;
