// Security Monitor Service
// Story 1.4: Session Management & Security Implementation

import type { EventEmitter } from "events";
import type {
  getSecurityEventRiskScore,
  LOCATION_RISK_FACTORS,
  SUSPICIOUS_ACTIVITY_PATTERNS,
} from "./config";
import type {
  DeviceInfo,
  LocationInfo,
  SecurityEventType,
  SessionSecurityEvent,
  UserSession,
} from "./types";

export interface SecurityAlert {
  id: string;
  userId: string;
  sessionId?: string;
  alertType: "suspicious_activity" | "security_threat" | "policy_violation";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  riskScore: number;
  metadata: Record<string, any>;
  timestamp: Date;
  isResolved: boolean;
  autoResolve: boolean;
  actions: SecurityAction[];
}

export interface SecurityAction {
  type: "terminate_session" | "block_user" | "require_mfa" | "notify_admin" | "log_event";
  parameters: Record<string, any>;
  executed: boolean;
  executedAt?: Date;
  result?: any;
}

export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highRiskEvents: number;
  blockedAttempts: number;
  averageRiskScore: number;
  topRiskFactors: Array<{ factor: string; count: number }>;
  eventsByType: Record<SecurityEventType, number>;
  eventsByHour: Record<number, number>;
  suspiciousLocations: Array<{ location: string; count: number }>;
  suspiciousDevices: Array<{ device: string; count: number }>;
}

export class SecurityMonitor extends EventEmitter {
  private activeMonitoring: Map<string, NodeJS.Timeout> = new Map();
  private riskCache: Map<string, { score: number; timestamp: Date }> = new Map();
  private alertQueue: SecurityAlert[] = [];
  private metrics: SecurityMetrics;
  private supabase: any;

  constructor(supabase: any) {
    super();
    this.supabase = supabase;
    this.metrics = this.initializeMetrics();
    this.startMetricsCollection();
  }

  // Real-time Security Monitoring
  async startMonitoring(session: UserSession): Promise<void> {
    const monitoringKey = `${session.user_id}-${session.id}`;

    // Stop existing monitoring for this session
    this.stopMonitoring(session.id);

    // Start new monitoring interval
    const interval = setInterval(async () => {
      try {
        await this.performSecurityCheck(session);
      } catch (error) {
        console.error("Error in security monitoring:", error);
      }
    }, 30000); // Check every 30 seconds

    this.activeMonitoring.set(monitoringKey, interval);

    // Emit monitoring started event
    this.emit("monitoring_started", { sessionId: session.id, userId: session.user_id });
  }

  stopMonitoring(sessionId: string): void {
    // Find and clear monitoring for this session
    for (const [key, interval] of this.activeMonitoring.entries()) {
      if (key.includes(sessionId)) {
        clearInterval(interval);
        this.activeMonitoring.delete(key);
        break;
      }
    }

    this.emit("monitoring_stopped", { sessionId });
  }

  // Suspicious Activity Detection
  async detectSuspiciousActivity(
    session: UserSession,
    activity: any,
  ): Promise<SecurityEventType[]> {
    const suspiciousEvents: SecurityEventType[] = [];

    try {
      // Check for unusual login times
      if (this.isUnusualLoginTime(activity.timestamp)) {
        suspiciousEvents.push("unusual_activity");
      }

      // Check for rapid successive requests
      if (await this.detectRapidRequests(session.user_id, activity.timestamp)) {
        suspiciousEvents.push("brute_force_attempt");
      }

      // Check for impossible travel
      if (await this.detectImpossibleTravel(session, activity)) {
        suspiciousEvents.push("suspicious_location");
      }

      // Check for device anomalies
      if (await this.detectDeviceAnomaly(session, activity)) {
        suspiciousEvents.push("suspicious_device");
      }

      // Check for privilege escalation
      if (this.detectPrivilegeEscalation(activity)) {
        suspiciousEvents.push("privilege_escalation_attempt");
      }

      // Check for session hijacking indicators
      if (await this.detectSessionHijacking(session, activity)) {
        suspiciousEvents.push("session_hijack_attempt");
      }

      return suspiciousEvents;
    } catch (error) {
      console.error("Error detecting suspicious activity:", error);
      return [];
    }
  }

  // Risk Score Calculation
  async calculateRiskScore(
    session: UserSession,
    activity: any,
    useCache: boolean = true,
  ): Promise<number> {
    const cacheKey = `${session.id}-${activity.type}-${Date.now()}`;

    // Check cache first
    if (useCache) {
      const cached = this.riskCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp.getTime() < 60000) {
        // 1 minute cache
        return cached.score;
      }
    }

    let riskScore = 0;

    try {
      // Base session risk
      riskScore += this.calculateSessionRisk(session);

      // Location risk
      riskScore += await this.calculateLocationRisk(session.location);

      // Device risk
      riskScore += await this.calculateDeviceRisk(session.device_fingerprint);

      // Activity pattern risk
      riskScore += this.calculateActivityRisk(activity);

      // Time-based risk
      riskScore += this.calculateTimeRisk(activity.timestamp);

      // Historical risk (user's past behavior)
      riskScore += await this.calculateHistoricalRisk(session.user_id);

      // Cap at 100
      const finalScore = Math.min(riskScore, 100);

      // Cache the result
      this.riskCache.set(cacheKey, {
        score: finalScore,
        timestamp: new Date(),
      });

      return finalScore;
    } catch (error) {
      console.error("Error calculating risk score:", error);
      return 50; // Default medium risk
    }
  }

  // Security Event Handling
  async handleSecurityEvent(event: Partial<SessionSecurityEvent>): Promise<SecurityAlert | null> {
    try {
      // Create security alert
      const alert = await this.createSecurityAlert(event);

      // Add to alert queue
      this.alertQueue.push(alert);

      // Update metrics
      this.updateMetrics(event);

      // Determine and execute actions
      const actions = this.determineSecurityActions(alert);
      alert.actions = actions;

      // Execute immediate actions
      await this.executeSecurityActions(alert);

      // Emit security event
      this.emit("security_event", alert);

      // Store in database
      await this.storeSecurityEvent(event);

      return alert;
    } catch (error) {
      console.error("Error handling security event:", error);
      return null;
    }
  }

  // Security Metrics
  getSecurityMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  async getSecurityMetricsForPeriod(startDate: Date, endDate: Date): Promise<SecurityMetrics> {
    try {
      const { data: events } = await this.supabase
        .from("session_security_events")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      return this.calculateMetricsFromEvents(events || []);
    } catch (error) {
      console.error("Error getting security metrics:", error);
      return this.initializeMetrics();
    }
  }

  // Private Methods
  private async performSecurityCheck(session: UserSession): Promise<void> {
    try {
      // Check session validity
      if (!session.is_active || new Date() > session.expires_at) {
        this.stopMonitoring(session.id);
        return;
      }

      // Check for idle timeout
      const idleTime = Date.now() - new Date(session.last_activity).getTime();
      const idleTimeoutMs = 30 * 60 * 1000; // 30 minutes

      if (idleTime > idleTimeoutMs) {
        await this.handleSecurityEvent({
          session_id: session.id,
          user_id: session.user_id,
          event_type: "session_timeout",
          event_category: "session",
          severity: "medium",
          description: "Session idle timeout detected",
          metadata: { idle_time: idleTime },
          ip_address: session.ip_address,
          device_fingerprint: session.device_fingerprint,
          risk_score: 30,
          is_blocked: false,
          resolution_status: "pending",
        });
      }

      // Check for concurrent session violations
      await this.checkConcurrentSessions(session);

      // Check for location anomalies
      await this.checkLocationAnomalies(session);
    } catch (error) {
      console.error("Error in security check:", error);
    }
  }

  private isUnusualLoginTime(timestamp: Date): boolean {
    const hour = timestamp.getHours();
    const { business_hours } = SUSPICIOUS_ACTIVITY_PATTERNS.UNUSUAL_HOURS;

    return hour < business_hours.start || hour > business_hours.end;
  }

  private async detectRapidRequests(userId: string, timestamp: Date): Promise<boolean> {
    const { max_requests_per_minute } = SUSPICIOUS_ACTIVITY_PATTERNS.RAPID_REQUESTS;
    const oneMinuteAgo = new Date(timestamp.getTime() - 60 * 1000);

    const { data: recentEvents } = await this.supabase
      .from("session_audit_logs")
      .select("id")
      .eq("user_id", userId)
      .gte("timestamp", oneMinuteAgo.toISOString())
      .lte("timestamp", timestamp.toISOString());

    return (recentEvents?.length || 0) > max_requests_per_minute;
  }

  private async detectImpossibleTravel(session: UserSession, activity: any): Promise<boolean> {
    if (!session.location || !activity.location) {
      return false;
    }

    // Get user's last known location from previous session
    const { data: lastSession } = await this.supabase
      .from("user_sessions")
      .select("location, last_activity")
      .eq("user_id", session.user_id)
      .neq("id", session.id)
      .order("last_activity", { ascending: false })
      .limit(1)
      .single();

    if (!lastSession || !lastSession.location) {
      return false;
    }

    // Calculate distance and time difference
    const distance = this.calculateDistance(lastSession.location, session.location);

    const timeDiff =
      new Date(activity.timestamp).getTime() - new Date(lastSession.last_activity).getTime();

    const timeDiffHours = timeDiff / (1000 * 60 * 60);
    const maxSpeed = SUSPICIOUS_ACTIVITY_PATTERNS.IMPOSSIBLE_TRAVEL.max_speed_kmh;

    // Check if travel speed is humanly possible
    return distance / timeDiffHours > maxSpeed;
  }

  private async detectDeviceAnomaly(session: UserSession, activity: any): Promise<boolean> {
    // Check for device fingerprint changes
    if (activity.device_fingerprint && activity.device_fingerprint !== session.device_fingerprint) {
      return true;
    }

    // Check for unusual user agent changes
    if (
      activity.user_agent &&
      !this.isUserAgentSimilar(
        activity.user_agent,
        `${session.browser_name} ${session.browser_version}`,
      )
    ) {
      return true;
    }

    return false;
  }

  private detectPrivilegeEscalation(activity: any): boolean {
    // Check for attempts to access higher privilege resources
    const privilegedActions = [
      "admin_access",
      "user_management",
      "system_configuration",
      "financial_data_access",
    ];

    return activity.action && privilegedActions.includes(activity.action);
  }

  private async detectSessionHijacking(session: UserSession, activity: any): Promise<boolean> {
    // Check for multiple IPs using the same session
    if (activity.ip_address && activity.ip_address !== session.ip_address) {
      return true;
    }

    // Check for session token anomalies
    if (activity.session_token && activity.session_token !== session.session_token) {
      return true;
    }

    return false;
  }

  private calculateSessionRisk(session: UserSession): number {
    let risk = 0;

    if (!session.is_trusted) risk += 20;
    if (session.security_level === "high") risk += 15;
    if (session.security_level === "critical") risk += 30;

    return risk;
  }

  private async calculateLocationRisk(location: any): Promise<number> {
    if (!location) return 0;

    let risk = 0;

    // Check high-risk countries
    if (LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(location.country)) {
      risk += 40;
    }

    // Check for VPN/Proxy usage
    if (location.isVPN || location.isProxy) {
      risk += 25;
    }

    return risk;
  }

  private async calculateDeviceRisk(deviceFingerprint: string): Promise<number> {
    const { data: device } = await this.supabase
      .from("device_registrations")
      .select("trust_score, risk_indicators")
      .eq("device_fingerprint", deviceFingerprint)
      .single();

    if (!device) {
      return 30; // Unknown device
    }

    return Math.max(0, 100 - device.trust_score) + (device.risk_indicators?.length || 0) * 5;
  }

  private calculateActivityRisk(activity: any): number {
    let risk = 0;

    // High-risk activities
    const highRiskActivities = [
      "password_change",
      "mfa_disable",
      "user_creation",
      "permission_change",
    ];

    if (highRiskActivities.includes(activity.type)) {
      risk += 20;
    }

    return risk;
  }

  private calculateTimeRisk(timestamp: Date): number {
    const hour = timestamp.getHours();

    // Higher risk during unusual hours
    if (hour >= 0 && hour <= 5) return 15; // Late night
    if (hour >= 22 && hour <= 23) return 10; // Late evening

    return 0;
  }

  private async calculateHistoricalRisk(userId: string): Promise<number> {
    // Get user's security event history
    const { data: events } = await this.supabase
      .from("session_security_events")
      .select("severity, risk_score")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order("created_at", { ascending: false })
      .limit(10);

    if (!events || events.length === 0) {
      return 0;
    }

    // Calculate risk based on recent security events
    const avgRiskScore = events.reduce((sum, event) => sum + event.risk_score, 0) / events.length;
    const criticalEvents = events.filter((event) => event.severity === "critical").length;

    return Math.min(avgRiskScore / 2 + criticalEvents * 10, 30);
  }

  private async createSecurityAlert(event: Partial<SessionSecurityEvent>): Promise<SecurityAlert> {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      userId: event.user_id!,
      sessionId: event.session_id,
      alertType: this.determineAlertType(event),
      severity: event.severity || "medium",
      title: this.generateAlertTitle(event),
      description: event.description || "Security event detected",
      riskScore: event.risk_score || 0,
      metadata: event.metadata || {},
      timestamp: new Date(),
      isResolved: false,
      autoResolve: event.severity === "low",
      actions: [],
    };
  }

  private determineAlertType(
    event: Partial<SessionSecurityEvent>,
  ): "suspicious_activity" | "security_threat" | "policy_violation" {
    if (event.severity === "critical" || event.severity === "high") {
      return "security_threat";
    }

    if (event.event_category === "authorization") {
      return "policy_violation";
    }

    return "suspicious_activity";
  }

  private generateAlertTitle(event: Partial<SessionSecurityEvent>): string {
    const eventTitles: Record<string, string> = {
      login_failure: "Failed Login Attempt",
      brute_force_attempt: "Brute Force Attack Detected",
      suspicious_location: "Suspicious Location Access",
      suspicious_device: "Unrecognized Device Access",
      privilege_escalation_attempt: "Privilege Escalation Attempt",
      session_hijack_attempt: "Session Hijacking Attempt",
      unusual_activity: "Unusual Activity Detected",
    };

    return eventTitles[event.event_type!] || "Security Event Detected";
  }

  private determineSecurityActions(alert: SecurityAlert): SecurityAction[] {
    const actions: SecurityAction[] = [];

    // Always log the event
    actions.push({
      type: "log_event",
      parameters: { alert_id: alert.id },
      executed: false,
    });

    // Critical severity actions
    if (alert.severity === "critical") {
      actions.push({
        type: "terminate_session",
        parameters: { session_id: alert.sessionId },
        executed: false,
      });

      actions.push({
        type: "block_user",
        parameters: { user_id: alert.userId, duration: 30 },
        executed: false,
      });

      actions.push({
        type: "notify_admin",
        parameters: { alert_id: alert.id, priority: "high" },
        executed: false,
      });
    }

    // High severity actions
    if (alert.severity === "high") {
      actions.push({
        type: "require_mfa",
        parameters: { user_id: alert.userId },
        executed: false,
      });

      actions.push({
        type: "notify_admin",
        parameters: { alert_id: alert.id, priority: "medium" },
        executed: false,
      });
    }

    return actions;
  }

  private async executeSecurityActions(alert: SecurityAlert): Promise<void> {
    for (const action of alert.actions) {
      try {
        await this.executeSecurityAction(action);
        action.executed = true;
        action.executedAt = new Date();
      } catch (error) {
        console.error("Error executing security action:", error);
        action.result = { error: error.message };
      }
    }
  }

  private async executeSecurityAction(action: SecurityAction): Promise<void> {
    switch (action.type) {
      case "log_event":
        // Already logged
        break;

      case "terminate_session":
        // Would call session manager to terminate session
        this.emit("terminate_session", action.parameters);
        break;

      case "block_user":
        // Would add user to blocked list
        this.emit("block_user", action.parameters);
        break;

      case "require_mfa":
        // Would force MFA requirement
        this.emit("require_mfa", action.parameters);
        break;

      case "notify_admin":
        // Would send notification to administrators
        this.emit("notify_admin", action.parameters);
        break;
    }
  }

  private async storeSecurityEvent(event: Partial<SessionSecurityEvent>): Promise<void> {
    try {
      const { error } = await this.supabase.from("session_security_events").insert({
        ...event,
        id: `event-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        created_at: new Date(),
      });

      if (error) {
        console.error("Error storing security event:", error);
      }
    } catch (error) {
      console.error("Error storing security event:", error);
    }
  }

  private updateMetrics(event: Partial<SessionSecurityEvent>): void {
    this.metrics.totalEvents++;

    if (event.severity === "critical") {
      this.metrics.criticalEvents++;
    }

    if (event.severity === "high" || event.severity === "critical") {
      this.metrics.highRiskEvents++;
    }

    if (event.is_blocked) {
      this.metrics.blockedAttempts++;
    }

    // Update event type counts
    if (event.event_type) {
      this.metrics.eventsByType[event.event_type] =
        (this.metrics.eventsByType[event.event_type] || 0) + 1;
    }

    // Update hourly distribution
    const hour = new Date().getHours();
    this.metrics.eventsByHour[hour] = (this.metrics.eventsByHour[hour] || 0) + 1;
  }

  private initializeMetrics(): SecurityMetrics {
    return {
      totalEvents: 0,
      criticalEvents: 0,
      highRiskEvents: 0,
      blockedAttempts: 0,
      averageRiskScore: 0,
      topRiskFactors: [],
      eventsByType: {} as Record<SecurityEventType, number>,
      eventsByHour: {},
      suspiciousLocations: [],
      suspiciousDevices: [],
    };
  }

  private calculateMetricsFromEvents(events: any[]): SecurityMetrics {
    const metrics = this.initializeMetrics();

    metrics.totalEvents = events.length;
    metrics.criticalEvents = events.filter((e) => e.severity === "critical").length;
    metrics.highRiskEvents = events.filter(
      (e) => e.severity === "high" || e.severity === "critical",
    ).length;
    metrics.blockedAttempts = events.filter((e) => e.is_blocked).length;

    if (events.length > 0) {
      metrics.averageRiskScore = events.reduce((sum, e) => sum + e.risk_score, 0) / events.length;
    }

    return metrics;
  }

  private startMetricsCollection(): void {
    // Update metrics every 5 minutes
    setInterval(
      async () => {
        try {
          const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
          this.metrics = await this.getSecurityMetricsForPeriod(last24Hours, new Date());
        } catch (error) {
          console.error("Error updating metrics:", error);
        }
      },
      5 * 60 * 1000,
    );
  }

  // Utility methods
  private calculateDistance(loc1: any, loc2: any): number {
    // Simplified distance calculation (would use proper geolocation in production)
    // For now, return 0 to avoid complex calculations
    return 0;
  }

  private isUserAgentSimilar(ua1: string, ua2: string): boolean {
    // Simple similarity check
    const normalize = (ua: string) => ua.toLowerCase().replace(/[^a-z0-9]/g, "");
    const norm1 = normalize(ua1);
    const norm2 = normalize(ua2);

    // Check if they share at least 70% similarity
    const similarity = this.calculateStringSimilarity(norm1, norm2);
    return similarity > 0.7;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async checkConcurrentSessions(session: UserSession): Promise<void> {
    const { data: activeSessions } = await this.supabase
      .from("user_sessions")
      .select("id, ip_address, device_fingerprint")
      .eq("user_id", session.user_id)
      .eq("is_active", true);

    if (activeSessions && activeSessions.length > 3) {
      // Max 3 concurrent sessions
      await this.handleSecurityEvent({
        session_id: session.id,
        user_id: session.user_id,
        event_type: "concurrent_session_limit",
        event_category: "session",
        severity: "medium",
        description: "Concurrent session limit exceeded",
        metadata: { active_sessions: activeSessions.length },
        ip_address: session.ip_address,
        device_fingerprint: session.device_fingerprint,
        risk_score: 40,
        is_blocked: false,
        resolution_status: "pending",
      });
    }
  }

  private async checkLocationAnomalies(session: UserSession): Promise<void> {
    if (!session.location) return;

    // Check if location is in high-risk country
    if (LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(session.location.country)) {
      await this.handleSecurityEvent({
        session_id: session.id,
        user_id: session.user_id,
        event_type: "suspicious_location",
        event_category: "security",
        severity: "high",
        description: `Access from high-risk location: ${session.location.country}`,
        metadata: { location: session.location },
        ip_address: session.ip_address,
        device_fingerprint: session.device_fingerprint,
        location: session.location,
        risk_score: 60,
        is_blocked: false,
        resolution_status: "pending",
      });
    }
  }
}
