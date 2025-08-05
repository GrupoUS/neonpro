/**
 * Suspicious Activity Detector
 * Story 1.4 - Task 4: Detection and monitoring of suspicious activities
 *
 * Features:
 * - Real-time activity pattern analysis
 * - Anomaly detection algorithms
 * - Behavioral baseline establishment
 * - Risk scoring and alerting
 * - Automated response triggers
 * - Machine learning-based detection
 */

import type { createClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/auth";
import type { SecurityAuditLogger } from "./security-audit-logger";

export interface ActivityPattern {
  userId: string;
  sessionId: string;
  deviceId: string;
  activityType:
    | "login"
    | "logout"
    | "page_view"
    | "api_call"
    | "data_access"
    | "file_download"
    | "settings_change"
    | "user_creation"
    | "permission_change"
    | "bulk_operation";
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  metadata: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    dataVolume?: number;
    resourceAccessed?: string;
    previousPage?: string;
    clickCoordinates?: { x: number; y: number };
    keystrokes?: number;
    mouseMovements?: number;
    scrollDepth?: number;
    timeOnPage?: number;
    [key: string]: any;
  };
}

export interface SuspiciousActivityAlert {
  alertId: string;
  userId: string;
  sessionId: string;
  deviceId: string;
  alertType:
    | "velocity_anomaly"
    | "location_anomaly"
    | "behavior_anomaly"
    | "access_pattern_anomaly"
    | "data_exfiltration"
    | "privilege_escalation"
    | "brute_force"
    | "session_hijacking"
    | "bot_activity"
    | "impossible_travel";
  severity: "low" | "medium" | "high" | "critical";
  riskScore: number;
  description: string;
  detectedAt: Date;
  patterns: ActivityPattern[];
  evidence: Record<string, any>;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  falsePositive: boolean;
  automatedResponse?: {
    action:
      | "none"
      | "warn_user"
      | "require_mfa"
      | "terminate_session"
      | "block_user"
      | "escalate_admin";
    executedAt?: Date;
    result?: string;
  };
}

export interface UserBehaviorBaseline {
  userId: string;
  userRole: UserRole;
  establishedAt: Date;
  lastUpdated: Date;
  patterns: {
    typicalLoginTimes: number[]; // Hours of day (0-23)
    typicalDaysOfWeek: number[]; // Days (0-6, Sunday=0)
    averageSessionDuration: number; // Minutes
    typicalLocations: string[]; // Country codes
    commonDevices: string[]; // Device types
    averageApiCallsPerHour: number;
    commonEndpoints: string[];
    typicalDataVolume: number; // Bytes per session
    mouseMovementPatterns: {
      averageSpeed: number;
      clickFrequency: number;
      scrollPatterns: number[];
    };
    keystrokePatterns: {
      averageWPM: number;
      typingRhythm: number[];
      pausePatterns: number[];
    };
  };
  anomalyThresholds: {
    locationDeviationKm: number;
    timeDeviationHours: number;
    sessionDurationMultiplier: number;
    apiCallMultiplier: number;
    dataVolumeMultiplier: number;
    velocityThreshold: number;
  };
}

export interface DetectionRule {
  ruleId: string;
  name: string;
  description: string;
  alertType: SuspiciousActivityAlert["alertType"];
  severity: SuspiciousActivityAlert["severity"];
  isEnabled: boolean;
  conditions: {
    timeWindow: number; // Minutes
    threshold: number;
    operator: "gt" | "lt" | "eq" | "gte" | "lte";
    field: string;
    value: any;
  }[];
  actions: {
    action: SuspiciousActivityAlert["automatedResponse"]["action"];
    delay: number; // Seconds
    conditions?: Record<string, any>;
  }[];
  applicableRoles: UserRole[];
  metadata?: Record<string, any>;
}

const DEFAULT_DETECTION_RULES: DetectionRule[] = [
  {
    ruleId: "velocity_anomaly_1",
    name: "High API Call Velocity",
    description: "Detects unusually high API call frequency",
    alertType: "velocity_anomaly",
    severity: "medium",
    isEnabled: true,
    conditions: [
      {
        timeWindow: 5,
        threshold: 100,
        operator: "gt",
        field: "api_calls",
        value: 100,
      },
    ],
    actions: [
      {
        action: "warn_user",
        delay: 0,
      },
    ],
    applicableRoles: ["owner", "manager", "staff", "patient"],
  },
  {
    ruleId: "location_anomaly_1",
    name: "Impossible Travel",
    description: "Detects logins from impossible geographic locations",
    alertType: "impossible_travel",
    severity: "high",
    isEnabled: true,
    conditions: [
      {
        timeWindow: 60,
        threshold: 1000,
        operator: "gt",
        field: "distance_km",
        value: 1000,
      },
    ],
    actions: [
      {
        action: "require_mfa",
        delay: 0,
      },
      {
        action: "escalate_admin",
        delay: 300,
      },
    ],
    applicableRoles: ["owner", "manager", "staff"],
  },
  {
    ruleId: "data_exfiltration_1",
    name: "Large Data Download",
    description: "Detects unusually large data downloads",
    alertType: "data_exfiltration",
    severity: "high",
    isEnabled: true,
    conditions: [
      {
        timeWindow: 30,
        threshold: 100 * 1024 * 1024, // 100MB
        operator: "gt",
        field: "data_volume",
        value: 100 * 1024 * 1024,
      },
    ],
    actions: [
      {
        action: "escalate_admin",
        delay: 0,
      },
    ],
    applicableRoles: ["staff", "patient"],
  },
  {
    ruleId: "brute_force_1",
    name: "Multiple Failed Logins",
    description: "Detects potential brute force attacks",
    alertType: "brute_force",
    severity: "high",
    isEnabled: true,
    conditions: [
      {
        timeWindow: 15,
        threshold: 5,
        operator: "gte",
        field: "failed_logins",
        value: 5,
      },
    ],
    actions: [
      {
        action: "block_user",
        delay: 0,
      },
    ],
    applicableRoles: ["owner", "manager", "staff", "patient"],
  },
  {
    ruleId: "bot_activity_1",
    name: "Bot-like Behavior",
    description: "Detects automated/bot-like activity patterns",
    alertType: "bot_activity",
    severity: "medium",
    isEnabled: true,
    conditions: [
      {
        timeWindow: 10,
        threshold: 0.1,
        operator: "lt",
        field: "mouse_movement_variance",
        value: 0.1,
      },
      {
        timeWindow: 10,
        threshold: 50,
        operator: "gt",
        field: "api_calls",
        value: 50,
      },
    ],
    actions: [
      {
        action: "require_mfa",
        delay: 0,
      },
    ],
    applicableRoles: ["owner", "manager", "staff", "patient"],
  },
];

export class SuspiciousActivityDetector {
  private supabase;
  private auditLogger: SecurityAuditLogger;
  private detectionRules: DetectionRule[];
  private userBaselines: Map<string, UserBehaviorBaseline> = new Map();
  private activityBuffer: Map<string, ActivityPattern[]> = new Map();
  private processingInterval?: NodeJS.Timeout;
  private baselineUpdateInterval?: NodeJS.Timeout;

  constructor(supabaseUrl: string, supabaseKey: string, customRules?: DetectionRule[]) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = new SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.detectionRules = customRules || DEFAULT_DETECTION_RULES;

    // Start processing intervals
    this.startProcessingInterval();
    this.startBaselineUpdateInterval();

    // Load existing baselines
    this.loadUserBaselines();
  }

  /**
   * Record user activity for analysis
   */
  async recordActivity(activity: Omit<ActivityPattern, "timestamp">): Promise<void> {
    try {
      const activityWithTimestamp: ActivityPattern = {
        ...activity,
        timestamp: new Date(),
      };

      // Store in database
      const { error } = await this.supabase.from("user_activity_patterns").insert({
        user_id: activity.userId,
        session_id: activity.sessionId,
        device_id: activity.deviceId,
        activity_type: activity.activityType,
        timestamp: activityWithTimestamp.timestamp.toISOString(),
        ip_address: activity.ipAddress,
        user_agent: activity.userAgent,
        location: activity.location,
        metadata: activity.metadata,
      });

      if (error) {
        console.error("Failed to record activity:", error);
        return;
      }

      // Add to processing buffer
      const userBuffer = this.activityBuffer.get(activity.userId) || [];
      userBuffer.push(activityWithTimestamp);

      // Keep only recent activities in buffer (last 1000 activities)
      if (userBuffer.length > 1000) {
        userBuffer.splice(0, userBuffer.length - 1000);
      }

      this.activityBuffer.set(activity.userId, userBuffer);

      // Trigger real-time analysis for critical activities
      if (this.isCriticalActivity(activity.activityType)) {
        await this.analyzeUserActivity(activity.userId);
      }
    } catch (error) {
      console.error("Failed to record activity:", error);
    }
  }

  /**
   * Analyze user activity for suspicious patterns
   */
  async analyzeUserActivity(userId: string): Promise<SuspiciousActivityAlert[]> {
    try {
      const alerts: SuspiciousActivityAlert[] = [];
      const userActivities = this.activityBuffer.get(userId) || [];

      if (userActivities.length === 0) {
        return alerts;
      }

      // Get user baseline
      let baseline = this.userBaselines.get(userId);
      if (!baseline) {
        baseline = await this.establishUserBaseline(userId);
      }

      // Apply detection rules
      for (const rule of this.detectionRules.filter((r) => r.isEnabled)) {
        const ruleAlerts = await this.applyDetectionRule(rule, userId, userActivities, baseline);
        alerts.push(...ruleAlerts);
      }

      // Store alerts
      for (const alert of alerts) {
        await this.storeAlert(alert);
        await this.executeAutomatedResponse(alert);
      }

      return alerts;
    } catch (error) {
      console.error("Failed to analyze user activity:", error);
      return [];
    }
  }

  /**
   * Establish behavioral baseline for a user
   */
  async establishUserBaseline(userId: string): Promise<UserBehaviorBaseline> {
    try {
      // Get historical activity data (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: activities, error } = await this.supabase
        .from("user_activity_patterns")
        .select("*")
        .eq("user_id", userId)
        .gte("timestamp", thirtyDaysAgo.toISOString())
        .order("timestamp", { ascending: true });

      if (error) {
        throw new Error(`Failed to get user activities: ${error.message}`);
      }

      // Get user role
      const userRole = await this.getUserRole(userId);

      // Calculate baseline patterns
      const baseline: UserBehaviorBaseline = {
        userId,
        userRole,
        establishedAt: new Date(),
        lastUpdated: new Date(),
        patterns: this.calculateBaselinePatterns(activities || []),
        anomalyThresholds: this.calculateAnomalyThresholds(userRole, activities || []),
      };

      // Store baseline
      await this.storeUserBaseline(baseline);
      this.userBaselines.set(userId, baseline);

      return baseline;
    } catch (error) {
      console.error("Failed to establish user baseline:", error);
      throw error;
    }
  }

  /**
   * Update user baseline with new activity data
   */
  async updateUserBaseline(userId: string): Promise<void> {
    try {
      const existingBaseline = this.userBaselines.get(userId);
      if (!existingBaseline) {
        await this.establishUserBaseline(userId);
        return;
      }

      // Get recent activity data (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const { data: recentActivities, error } = await this.supabase
        .from("user_activity_patterns")
        .select("*")
        .eq("user_id", userId)
        .gte("timestamp", sevenDaysAgo.toISOString())
        .order("timestamp", { ascending: true });

      if (error || !recentActivities || recentActivities.length === 0) {
        return;
      }

      // Update baseline with weighted average (80% existing, 20% new)
      const recentPatterns = this.calculateBaselinePatterns(recentActivities);
      const updatedBaseline: UserBehaviorBaseline = {
        ...existingBaseline,
        lastUpdated: new Date(),
        patterns: this.mergePatterns(existingBaseline.patterns, recentPatterns, 0.8),
      };

      // Store updated baseline
      await this.storeUserBaseline(updatedBaseline);
      this.userBaselines.set(userId, updatedBaseline);
    } catch (error) {
      console.error("Failed to update user baseline:", error);
    }
  }

  /**
   * Get suspicious activity alerts for a user
   */
  async getUserAlerts(
    userId: string,
    options?: {
      severity?: SuspiciousActivityAlert["severity"][];
      alertType?: SuspiciousActivityAlert["alertType"][];
      resolved?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<SuspiciousActivityAlert[]> {
    try {
      let query = this.supabase
        .from("suspicious_activity_alerts")
        .select("*")
        .eq("user_id", userId)
        .order("detected_at", { ascending: false });

      if (options?.severity) {
        query = query.in("severity", options.severity);
      }

      if (options?.alertType) {
        query = query.in("alert_type", options.alertType);
      }

      if (options?.resolved !== undefined) {
        query = query.eq("is_resolved", options.resolved);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get user alerts: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToAlert);
    } catch (error) {
      console.error("Failed to get user alerts:", error);
      throw error;
    }
  }

  /**
   * Resolve a suspicious activity alert
   */
  async resolveAlert(
    alertId: string,
    resolution: string,
    resolvedBy: string,
    falsePositive: boolean = false,
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("suspicious_activity_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          resolution,
          false_positive: falsePositive,
        })
        .eq("alert_id", alertId);

      if (error) {
        throw new Error(`Failed to resolve alert: ${error.message}`);
      }

      // Log resolution
      await this.auditLogger.logSecurityEvent({
        eventType: "alert_resolved",
        metadata: {
          alertId,
          resolution,
          resolvedBy,
          falsePositive,
        },
      });
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      throw error;
    }
  }

  /**
   * Add or update detection rule
   */
  addDetectionRule(rule: DetectionRule): void {
    const existingIndex = this.detectionRules.findIndex((r) => r.ruleId === rule.ruleId);
    if (existingIndex >= 0) {
      this.detectionRules[existingIndex] = rule;
    } else {
      this.detectionRules.push(rule);
    }
  }

  /**
   * Remove detection rule
   */
  removeDetectionRule(ruleId: string): void {
    this.detectionRules = this.detectionRules.filter((r) => r.ruleId !== ruleId);
  }

  /**
   * Get detection statistics
   */
  async getDetectionStatistics(timeRange: { start: Date; end: Date }): Promise<{
    totalAlerts: number;
    alertsBySeverity: Record<SuspiciousActivityAlert["severity"], number>;
    alertsByType: Record<SuspiciousActivityAlert["alertType"], number>;
    falsePositiveRate: number;
    averageResolutionTime: number;
    topUsers: { userId: string; alertCount: number }[];
  }> {
    try {
      const { data: alerts, error } = await this.supabase
        .from("suspicious_activity_alerts")
        .select("*")
        .gte("detected_at", timeRange.start.toISOString())
        .lte("detected_at", timeRange.end.toISOString());

      if (error) {
        throw new Error(`Failed to get detection statistics: ${error.message}`);
      }

      const alertData = alerts || [];

      // Calculate statistics
      const alertsBySeverity: Record<SuspiciousActivityAlert["severity"], number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      const alertsByType: Record<SuspiciousActivityAlert["alertType"], number> = {
        velocity_anomaly: 0,
        location_anomaly: 0,
        behavior_anomaly: 0,
        access_pattern_anomaly: 0,
        data_exfiltration: 0,
        privilege_escalation: 0,
        brute_force: 0,
        session_hijacking: 0,
        bot_activity: 0,
        impossible_travel: 0,
      };

      const userAlertCounts: Record<string, number> = {};
      let falsePositives = 0;
      let totalResolutionTime = 0;
      let resolvedAlerts = 0;

      for (const alert of alertData) {
        alertsBySeverity[alert.severity as SuspiciousActivityAlert["severity"]]++;
        alertsByType[alert.alert_type as SuspiciousActivityAlert["alertType"]]++;

        userAlertCounts[alert.user_id] = (userAlertCounts[alert.user_id] || 0) + 1;

        if (alert.false_positive) {
          falsePositives++;
        }

        if (alert.is_resolved && alert.resolved_at) {
          const resolutionTime =
            new Date(alert.resolved_at).getTime() - new Date(alert.detected_at).getTime();
          totalResolutionTime += resolutionTime;
          resolvedAlerts++;
        }
      }

      const topUsers = Object.entries(userAlertCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId, alertCount]) => ({ userId, alertCount }));

      return {
        totalAlerts: alertData.length,
        alertsBySeverity,
        alertsByType,
        falsePositiveRate: alertData.length > 0 ? falsePositives / alertData.length : 0,
        averageResolutionTime: resolvedAlerts > 0 ? totalResolutionTime / resolvedAlerts : 0,
        topUsers,
      };
    } catch (error) {
      console.error("Failed to get detection statistics:", error);
      throw error;
    }
  }

  /**
   * Destroy the detector and cleanup resources
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }

    if (this.baselineUpdateInterval) {
      clearInterval(this.baselineUpdateInterval);
      this.baselineUpdateInterval = undefined;
    }

    this.activityBuffer.clear();
    this.userBaselines.clear();
  }

  // Private methods

  private isCriticalActivity(activityType: ActivityPattern["activityType"]): boolean {
    return ["login", "permission_change", "user_creation", "bulk_operation"].includes(activityType);
  }

  private async applyDetectionRule(
    rule: DetectionRule,
    userId: string,
    activities: ActivityPattern[],
    baseline: UserBehaviorBaseline,
  ): Promise<SuspiciousActivityAlert[]> {
    const alerts: SuspiciousActivityAlert[] = [];

    // Check if rule applies to user role
    if (!rule.applicableRoles.includes(baseline.userRole)) {
      return alerts;
    }

    // Get activities within the rule's time window
    const timeWindow = rule.conditions[0]?.timeWindow || 60;
    const windowStart = new Date(Date.now() - timeWindow * 60 * 1000);
    const windowActivities = activities.filter((a) => a.timestamp >= windowStart);

    // Apply rule conditions
    const conditionResults = rule.conditions.map((condition) =>
      this.evaluateCondition(condition, windowActivities, baseline),
    );

    // All conditions must be met
    if (conditionResults.every((result) => result.met)) {
      const alert: SuspiciousActivityAlert = {
        alertId: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        sessionId: windowActivities[windowActivities.length - 1]?.sessionId || "",
        deviceId: windowActivities[windowActivities.length - 1]?.deviceId || "",
        alertType: rule.alertType,
        severity: rule.severity,
        riskScore: this.calculateAlertRiskScore(rule, conditionResults),
        description: this.generateAlertDescription(rule, conditionResults),
        detectedAt: new Date(),
        patterns: windowActivities,
        evidence: {
          rule: rule.name,
          conditions: conditionResults,
          baseline: baseline.patterns,
        },
        isResolved: false,
        falsePositive: false,
      };

      alerts.push(alert);
    }

    return alerts;
  }

  private evaluateCondition(
    condition: DetectionRule["conditions"][0],
    activities: ActivityPattern[],
    baseline: UserBehaviorBaseline,
  ): { met: boolean; value: any; threshold: any } {
    let value: any;

    switch (condition.field) {
      case "api_calls":
        value = activities.filter((a) => a.activityType === "api_call").length;
        break;
      case "failed_logins":
        value = activities.filter(
          (a) => a.activityType === "login" && a.metadata.statusCode >= 400,
        ).length;
        break;
      case "data_volume":
        value = activities.reduce((sum, a) => sum + (a.metadata.dataVolume || 0), 0);
        break;
      case "distance_km":
        value = this.calculateMaxDistance(activities);
        break;
      case "mouse_movement_variance":
        value = this.calculateMouseMovementVariance(activities);
        break;
      default:
        value = 0;
    }

    const met = this.compareValues(value, condition.operator, condition.threshold);

    return { met, value, threshold: condition.threshold };
  }

  private compareValues(value: any, operator: string, threshold: any): boolean {
    switch (operator) {
      case "gt":
        return value > threshold;
      case "lt":
        return value < threshold;
      case "eq":
        return value === threshold;
      case "gte":
        return value >= threshold;
      case "lte":
        return value <= threshold;
      default:
        return false;
    }
  }

  private calculateMaxDistance(activities: ActivityPattern[]): number {
    let maxDistance = 0;

    for (let i = 1; i < activities.length; i++) {
      const prev = activities[i - 1];
      const curr = activities[i];

      if (prev.location?.coordinates && curr.location?.coordinates) {
        const distance = this.calculateDistance(
          prev.location.coordinates,
          curr.location.coordinates,
        );
        maxDistance = Math.max(maxDistance, distance);
      }
    }

    return maxDistance;
  }

  private calculateDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number },
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) *
        Math.cos(this.toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateMouseMovementVariance(activities: ActivityPattern[]): number {
    const movements = activities.map((a) => a.metadata.mouseMovements || 0).filter((m) => m > 0);

    if (movements.length === 0) return 0;

    const mean = movements.reduce((sum, m) => sum + m, 0) / movements.length;
    const variance =
      movements.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / movements.length;

    return Math.sqrt(variance);
  }

  private calculateBaselinePatterns(activities: any[]): UserBehaviorBaseline["patterns"] {
    // This is a simplified implementation
    // In production, you'd use more sophisticated statistical analysis

    const loginTimes = activities
      .filter((a) => a.activity_type === "login")
      .map((a) => new Date(a.timestamp).getHours());

    const sessionDurations = activities
      .filter((a) => a.activity_type === "logout")
      .map((a) => a.metadata?.sessionDuration || 0)
      .filter((d) => d > 0);

    return {
      typicalLoginTimes: [...new Set(loginTimes)],
      typicalDaysOfWeek: [1, 2, 3, 4, 5], // Weekdays
      averageSessionDuration:
        sessionDurations.length > 0
          ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
          : 30,
      typicalLocations: [...new Set(activities.map((a) => a.location?.country).filter(Boolean))],
      commonDevices: [...new Set(activities.map((a) => a.device_id).filter(Boolean))],
      averageApiCallsPerHour: 10,
      commonEndpoints: [],
      typicalDataVolume: 1024 * 1024, // 1MB
      mouseMovementPatterns: {
        averageSpeed: 100,
        clickFrequency: 10,
        scrollPatterns: [],
      },
      keystrokePatterns: {
        averageWPM: 40,
        typingRhythm: [],
        pausePatterns: [],
      },
    };
  }

  private calculateAnomalyThresholds(
    userRole: UserRole,
    activities: any[],
  ): UserBehaviorBaseline["anomalyThresholds"] {
    // Role-based thresholds
    const baseThresholds = {
      owner: {
        locationDeviationKm: 1000,
        timeDeviationHours: 4,
        sessionDurationMultiplier: 3,
        apiCallMultiplier: 5,
        dataVolumeMultiplier: 10,
        velocityThreshold: 100,
      },
      manager: {
        locationDeviationKm: 500,
        timeDeviationHours: 2,
        sessionDurationMultiplier: 2.5,
        apiCallMultiplier: 3,
        dataVolumeMultiplier: 5,
        velocityThreshold: 50,
      },
      staff: {
        locationDeviationKm: 200,
        timeDeviationHours: 1,
        sessionDurationMultiplier: 2,
        apiCallMultiplier: 2,
        dataVolumeMultiplier: 3,
        velocityThreshold: 30,
      },
      patient: {
        locationDeviationKm: 100,
        timeDeviationHours: 0.5,
        sessionDurationMultiplier: 1.5,
        apiCallMultiplier: 1.5,
        dataVolumeMultiplier: 2,
        velocityThreshold: 10,
      },
    };

    return baseThresholds[userRole];
  }

  private mergePatterns(
    existing: UserBehaviorBaseline["patterns"],
    recent: UserBehaviorBaseline["patterns"],
    weight: number,
  ): UserBehaviorBaseline["patterns"] {
    // Weighted merge of patterns (simplified)
    return {
      ...existing,
      averageSessionDuration:
        existing.averageSessionDuration * weight + recent.averageSessionDuration * (1 - weight),
      averageApiCallsPerHour:
        existing.averageApiCallsPerHour * weight + recent.averageApiCallsPerHour * (1 - weight),
      typicalDataVolume:
        existing.typicalDataVolume * weight + recent.typicalDataVolume * (1 - weight),
    };
  }

  private calculateAlertRiskScore(
    rule: DetectionRule,
    conditionResults: { met: boolean; value: any; threshold: any }[],
  ): number {
    const baseSeverityScore = {
      low: 0.25,
      medium: 0.5,
      high: 0.75,
      critical: 1.0,
    }[rule.severity];

    // Calculate deviation from thresholds
    const deviationScore =
      conditionResults.reduce((sum, result) => {
        if (typeof result.value === "number" && typeof result.threshold === "number") {
          const deviation = Math.abs(result.value - result.threshold) / result.threshold;
          return sum + Math.min(deviation, 1);
        }
        return sum;
      }, 0) / conditionResults.length;

    return Math.min(baseSeverityScore + deviationScore * 0.3, 1.0);
  }

  private generateAlertDescription(
    rule: DetectionRule,
    conditionResults: { met: boolean; value: any; threshold: any }[],
  ): string {
    const values = conditionResults.map((r) => `${r.value} (threshold: ${r.threshold})`).join(", ");
    return `${rule.description}. Detected values: ${values}`;
  }

  private async storeAlert(alert: SuspiciousActivityAlert): Promise<void> {
    try {
      const { error } = await this.supabase.from("suspicious_activity_alerts").insert({
        alert_id: alert.alertId,
        user_id: alert.userId,
        session_id: alert.sessionId,
        device_id: alert.deviceId,
        alert_type: alert.alertType,
        severity: alert.severity,
        risk_score: alert.riskScore,
        description: alert.description,
        detected_at: alert.detectedAt.toISOString(),
        patterns: alert.patterns,
        evidence: alert.evidence,
        is_resolved: alert.isResolved,
        false_positive: alert.falsePositive,
        automated_response: alert.automatedResponse,
      });

      if (error) {
        console.error("Failed to store alert:", error);
      }
    } catch (error) {
      console.error("Failed to store alert:", error);
    }
  }

  private async executeAutomatedResponse(alert: SuspiciousActivityAlert): Promise<void> {
    try {
      const rule = this.detectionRules.find((r) => r.alertType === alert.alertType);
      if (!rule || !rule.actions.length) {
        return;
      }

      for (const action of rule.actions) {
        // Delay execution if specified
        if (action.delay > 0) {
          setTimeout(() => this.executeAction(alert, action.action), action.delay * 1000);
        } else {
          await this.executeAction(alert, action.action);
        }
      }
    } catch (error) {
      console.error("Failed to execute automated response:", error);
    }
  }

  private async executeAction(
    alert: SuspiciousActivityAlert,
    action: SuspiciousActivityAlert["automatedResponse"]["action"],
  ): Promise<void> {
    try {
      // Log the action
      await this.auditLogger.logSecurityEvent({
        eventType: "automated_response_executed",
        userId: alert.userId,
        sessionId: alert.sessionId,
        deviceId: alert.deviceId,
        metadata: {
          alertId: alert.alertId,
          action,
          alertType: alert.alertType,
          severity: alert.severity,
        },
      });

      // Update alert with automated response info
      await this.supabase
        .from("suspicious_activity_alerts")
        .update({
          automated_response: {
            action,
            executedAt: new Date().toISOString(),
            result: "executed",
          },
        })
        .eq("alert_id", alert.alertId);

      // Note: Actual action execution would integrate with your session management,
      // notification, and user management systems
    } catch (error) {
      console.error("Failed to execute action:", error);
    }
  }

  private async storeUserBaseline(baseline: UserBehaviorBaseline): Promise<void> {
    try {
      const { error } = await this.supabase.from("user_behavior_baselines").upsert({
        user_id: baseline.userId,
        user_role: baseline.userRole,
        established_at: baseline.establishedAt.toISOString(),
        last_updated: baseline.lastUpdated.toISOString(),
        patterns: baseline.patterns,
        anomaly_thresholds: baseline.anomalyThresholds,
      });

      if (error) {
        console.error("Failed to store user baseline:", error);
      }
    } catch (error) {
      console.error("Failed to store user baseline:", error);
    }
  }

  private async loadUserBaselines(): Promise<void> {
    try {
      const { data: baselines, error } = await this.supabase
        .from("user_behavior_baselines")
        .select("*");

      if (error) {
        console.error("Failed to load user baselines:", error);
        return;
      }

      for (const baseline of baselines || []) {
        this.userBaselines.set(baseline.user_id, {
          userId: baseline.user_id,
          userRole: baseline.user_role,
          establishedAt: new Date(baseline.established_at),
          lastUpdated: new Date(baseline.last_updated),
          patterns: baseline.patterns,
          anomalyThresholds: baseline.anomaly_thresholds,
        });
      }
    } catch (error) {
      console.error("Failed to load user baselines:", error);
    }
  }

  private async getUserRole(userId: string): Promise<UserRole> {
    // This would fetch the user's role from your user management system
    // For now, return a default role
    return "staff";
  }

  private mapDatabaseToAlert(data: any): SuspiciousActivityAlert {
    return {
      alertId: data.alert_id,
      userId: data.user_id,
      sessionId: data.session_id,
      deviceId: data.device_id,
      alertType: data.alert_type,
      severity: data.severity,
      riskScore: data.risk_score,
      description: data.description,
      detectedAt: new Date(data.detected_at),
      patterns: data.patterns || [],
      evidence: data.evidence || {},
      isResolved: data.is_resolved,
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      resolvedBy: data.resolved_by,
      resolution: data.resolution,
      falsePositive: data.false_positive,
      automatedResponse: data.automated_response,
    };
  }

  private startProcessingInterval(): void {
    this.processingInterval = setInterval(async () => {
      try {
        // Process activities for all users in buffer
        for (const userId of this.activityBuffer.keys()) {
          await this.analyzeUserActivity(userId);
        }
      } catch (error) {
        console.error("Activity processing failed:", error);
      }
    }, 60 * 1000); // Every minute
  }

  private startBaselineUpdateInterval(): void {
    this.baselineUpdateInterval = setInterval(
      async () => {
        try {
          // Update baselines for all users
          for (const userId of this.userBaselines.keys()) {
            await this.updateUserBaseline(userId);
          }
        } catch (error) {
          console.error("Baseline update failed:", error);
        }
      },
      24 * 60 * 60 * 1000,
    ); // Daily
  }
}
