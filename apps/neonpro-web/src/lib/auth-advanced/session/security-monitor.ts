/**
 * Security Monitor - Advanced Security Monitoring
 *
 * Provides real-time security monitoring, threat detection, and anomaly analysis
 * for session management with intelligent risk assessment and automated responses.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventEmitter } from "events";
import type {
  BehaviorRisk,
  DeviceFingerprint,
  DeviceRisk,
  GeoRisk,
  IPReputation,
  SecurityAction,
  SecurityConfig,
  SecurityEventType,
  SecuritySeverity,
  SessionError,
  SessionLocation,
  SessionSecurityEvent,
  SuspiciousActivityDetection,
  ThreatIntelligence,
  UserSession,
} from "./types";

interface SecurityValidationParams {
  userId: string;
  ipAddress: string;
  deviceFingerprint: DeviceFingerprint;
  location?: SessionLocation;
}

interface SecurityValidationResult {
  allowed: boolean;
  securityScore: number;
  reasons: string[];
  events?: SessionSecurityEvent[];
}

interface SessionActivityValidationResult {
  allowed: boolean;
  reasons: string[];
  events?: SessionSecurityEvent[];
}

export class SecurityMonitor extends EventEmitter {
  private supabase: SupabaseClient;
  private config: SecurityConfig;
  private threatIntelCache: Map<string, ThreatIntelligence> = new Map();
  private userBehaviorProfiles: Map<string, UserBehaviorProfile> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  private blockedIPs: Set<string> = new Set();

  constructor(config: SecurityConfig, supabase: SupabaseClient) {
    super();
    this.config = config;
    this.supabase = supabase;
    this.initializeSecurityData();
  }

  // ============================================================================
  // SESSION SECURITY VALIDATION
  // ============================================================================

  /**
   * Validate session creation security
   */
  async validateSessionCreation(
    params: SecurityValidationParams,
  ): Promise<SecurityValidationResult> {
    try {
      const reasons: string[] = [];
      const events: SessionSecurityEvent[] = [];
      let securityScore = 100;

      // IP reputation check
      const ipReputation = await this.checkIPReputation(params.ipAddress);
      if (ipReputation.isMalicious) {
        reasons.push("Malicious IP detected");
        securityScore -= 50;
      }
      if (ipReputation.isProxy || ipReputation.isVPN) {
        reasons.push("Proxy/VPN detected");
        securityScore -= 20;
      }
      if (ipReputation.isTor) {
        reasons.push("Tor network detected");
        securityScore -= 30;
      }

      // Geographic risk assessment
      if (params.location) {
        const geoRisk = await this.assessGeographicRisk(params.location, params.userId);
        if (geoRisk.isHighRisk) {
          reasons.push(`High-risk location: ${geoRisk.reasons.join(", ")}`);
          securityScore -= geoRisk.riskScore;
        }
      }

      // Device fingerprint analysis
      const deviceRisk = await this.analyzeDeviceRisk(params.deviceFingerprint, params.userId);
      if (deviceRisk.isCompromised) {
        reasons.push(`Device risk detected: ${deviceRisk.indicators.join(", ")}`);
        securityScore -= deviceRisk.riskScore;
      }

      // User behavior analysis
      const behaviorRisk = await this.analyzeBehaviorRisk(params.userId, {
        ipAddress: params.ipAddress,
        location: params.location,
        deviceFingerprint: params.deviceFingerprint,
      });
      if (behaviorRisk.isAnomalous) {
        reasons.push(`Behavioral anomaly: ${behaviorRisk.patterns.join(", ")}`);
        securityScore -= behaviorRisk.riskScore;
      }

      // Rate limiting check
      const rateLimitViolation = await this.checkRateLimit(params.userId, params.ipAddress);
      if (rateLimitViolation) {
        reasons.push("Rate limit exceeded");
        securityScore -= 25;
      }

      // Concurrent session check
      const concurrentViolation = await this.checkConcurrentSessions(params.userId);
      if (concurrentViolation) {
        reasons.push("Concurrent session limit exceeded");
        securityScore -= 15;
      }

      // Determine if session creation is allowed
      const allowed =
        securityScore >= this.config.suspiciousActivityThreshold &&
        !this.blockedIPs.has(params.ipAddress);

      // Log security events if needed
      if (!allowed || reasons.length > 0) {
        const event = await this.createSecurityEvent({
          userId: params.userId,
          eventType: "suspicious_login",
          severity: this.calculateSeverity(securityScore),
          description: `Session creation security validation: Score ${securityScore}`,
          details: {
            reasons,
            securityScore,
            ipReputation,
            geoRisk: params.location
              ? await this.assessGeographicRisk(params.location, params.userId)
              : null,
            deviceRisk,
            behaviorRisk,
          },
          ipAddress: params.ipAddress,
          location: params.location,
        });
        events.push(event);
      }

      return {
        allowed,
        securityScore: Math.max(0, securityScore),
        reasons,
        events,
      };
    } catch (error) {
      console.error("Security validation failed:", error);
      return {
        allowed: false,
        securityScore: 0,
        reasons: ["Security validation error"],
        events: [],
      };
    }
  }

  /**
   * Validate ongoing session activity
   */
  async validateSessionActivity(session: UserSession): Promise<SessionActivityValidationResult> {
    try {
      const reasons: string[] = [];
      const events: SessionSecurityEvent[] = [];

      // Check for session hijacking indicators
      const hijackingRisk = await this.detectSessionHijacking(session);
      if (hijackingRisk.detected) {
        reasons.push(`Session hijacking detected: ${hijackingRisk.indicators.join(", ")}`);

        const event = await this.createSecurityEvent({
          sessionId: session.id,
          userId: session.userId,
          eventType: "session_hijack_attempt",
          severity: "critical",
          description: "Potential session hijacking detected",
          details: hijackingRisk,
          ipAddress: session.ipAddress,
          location: session.location,
        });
        events.push(event);
      }

      // Check for unusual activity patterns
      const activityAnomaly = await this.detectActivityAnomalies(session);
      if (activityAnomaly.detected) {
        reasons.push(`Activity anomaly: ${activityAnomaly.patterns.join(", ")}`);

        const event = await this.createSecurityEvent({
          sessionId: session.id,
          userId: session.userId,
          eventType: "data_access_anomaly",
          severity: "medium",
          description: "Unusual activity pattern detected",
          details: activityAnomaly,
          ipAddress: session.ipAddress,
          location: session.location,
        });
        events.push(event);
      }

      // Check for privilege escalation attempts
      const privilegeEscalation = await this.detectPrivilegeEscalation(session);
      if (privilegeEscalation.detected) {
        reasons.push(`Privilege escalation attempt: ${privilegeEscalation.attempts.join(", ")}`);

        const event = await this.createSecurityEvent({
          sessionId: session.id,
          userId: session.userId,
          eventType: "privilege_escalation",
          severity: "high",
          description: "Privilege escalation attempt detected",
          details: privilegeEscalation,
          ipAddress: session.ipAddress,
          location: session.location,
        });
        events.push(event);
      }

      const allowed = reasons.length === 0;

      return {
        allowed,
        reasons,
        events,
      };
    } catch (error) {
      console.error("Session activity validation failed:", error);
      return {
        allowed: false,
        reasons: ["Activity validation error"],
        events: [],
      };
    }
  }

  // ============================================================================
  // THREAT INTELLIGENCE
  // ============================================================================

  /**
   * Check IP reputation using multiple sources
   */
  private async checkIPReputation(ipAddress: string): Promise<IPReputation> {
    try {
      // Check cache first
      const cached = this.threatIntelCache.get(ipAddress);
      if (cached && Date.now() - cached.timestamp < 3600000) {
        // 1 hour cache
        return cached.ipReputation;
      }

      // Check internal blacklist
      if (this.blockedIPs.has(ipAddress)) {
        return {
          isMalicious: true,
          isProxy: false,
          isVPN: false,
          isTor: false,
          riskScore: 100,
          sources: ["internal_blacklist"],
        };
      }

      // Check database for known malicious IPs
      const { data: maliciousIP } = await this.supabase
        .from("malicious_ips")
        .select("*")
        .eq("ip_address", ipAddress)
        .single();

      if (maliciousIP) {
        return {
          isMalicious: true,
          isProxy: maliciousIP.is_proxy || false,
          isVPN: maliciousIP.is_vpn || false,
          isTor: maliciousIP.is_tor || false,
          riskScore: maliciousIP.risk_score || 100,
          sources: ["database"],
        };
      }

      // External threat intelligence (placeholder for real implementation)
      const reputation = await this.queryExternalThreatIntel(ipAddress);

      // Cache result
      this.threatIntelCache.set(ipAddress, {
        ipReputation: reputation,
        timestamp: Date.now(),
      });

      return reputation;
    } catch (error) {
      console.error("IP reputation check failed:", error);
      return {
        isMalicious: false,
        isProxy: false,
        isVPN: false,
        isTor: false,
        riskScore: 0,
        sources: [],
      };
    }
  }

  /**
   * Assess geographic risk based on location and user history
   */
  private async assessGeographicRisk(location: SessionLocation, userId: string): Promise<GeoRisk> {
    try {
      const reasons: string[] = [];
      let riskScore = 0;

      // Check high-risk countries
      const highRiskCountries = ["CN", "RU", "KP", "IR"]; // Example list
      if (highRiskCountries.includes(location.country)) {
        reasons.push("High-risk country");
        riskScore += 30;
      }

      // Check user's typical locations
      const { data: userLocations } = await this.supabase
        .from("user_sessions")
        .select("location")
        .eq("user_id", userId)
        .not("location", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (userLocations && userLocations.length > 0) {
        const typicalCountries = new Set(
          userLocations.map((s) => s.location?.country).filter(Boolean),
        );

        if (!typicalCountries.has(location.country)) {
          reasons.push("Unusual country for user");
          riskScore += 20;
        }

        // Check for impossible travel
        const lastLocation = userLocations[0]?.location;
        if (lastLocation && this.isImpossibleTravel(lastLocation, location)) {
          reasons.push("Impossible travel detected");
          riskScore += 40;
        }
      }

      return {
        isHighRisk: riskScore > 25,
        riskScore,
        reasons,
      };
    } catch (error) {
      console.error("Geographic risk assessment failed:", error);
      return {
        isHighRisk: false,
        riskScore: 0,
        reasons: [],
      };
    }
  }

  /**
   * Analyze device risk based on fingerprint and history
   */
  private async analyzeDeviceRisk(
    fingerprint: DeviceFingerprint,
    userId: string,
  ): Promise<DeviceRisk> {
    try {
      const indicators: string[] = [];
      let riskScore = 0;

      // Check for suspicious user agent patterns
      if (this.isSuspiciousUserAgent(fingerprint.userAgent)) {
        indicators.push("Suspicious user agent");
        riskScore += 15;
      }

      // Check for automation indicators
      if (this.hasAutomationIndicators(fingerprint)) {
        indicators.push("Automation detected");
        riskScore += 25;
      }

      // Check device consistency
      const { data: userDevices } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("user_id", userId)
        .eq("is_trusted", true);

      if (userDevices && userDevices.length > 0) {
        const isKnownDevice = userDevices.some((device) =>
          this.compareDeviceFingerprints(device.device_fingerprint, fingerprint),
        );

        if (!isKnownDevice) {
          indicators.push("Unknown device");
          riskScore += 10;
        }
      }

      return {
        isCompromised: riskScore > 20,
        riskScore,
        indicators,
      };
    } catch (error) {
      console.error("Device risk analysis failed:", error);
      return {
        isCompromised: false,
        riskScore: 0,
        indicators: [],
      };
    }
  }

  /**
   * Analyze user behavior for anomalies
   */
  private async analyzeBehaviorRisk(
    userId: string,
    currentContext: {
      ipAddress: string;
      location?: SessionLocation;
      deviceFingerprint: DeviceFingerprint;
    },
  ): Promise<BehaviorRisk> {
    try {
      const patterns: string[] = [];
      let riskScore = 0;

      // Get user behavior profile
      let profile = this.userBehaviorProfiles.get(userId);
      if (!profile) {
        profile = await this.buildUserBehaviorProfile(userId);
        this.userBehaviorProfiles.set(userId, profile);
      }

      // Check login time patterns
      const currentHour = new Date().getHours();
      if (!profile.typicalLoginHours.includes(currentHour)) {
        patterns.push("Unusual login time");
        riskScore += 10;
      }

      // Check IP address patterns
      if (!profile.knownIPs.has(currentContext.ipAddress)) {
        patterns.push("New IP address");
        riskScore += 15;
      }

      // Check location patterns
      if (currentContext.location && !this.isTypicalLocation(profile, currentContext.location)) {
        patterns.push("Unusual location");
        riskScore += 20;
      }

      // Check rapid login attempts
      const recentAttempts = await this.getRecentLoginAttempts(userId);
      if (recentAttempts > 5) {
        patterns.push("Rapid login attempts");
        riskScore += 25;
      }

      return {
        isAnomalous: riskScore > 15,
        riskScore,
        patterns,
      };
    } catch (error) {
      console.error("Behavior risk analysis failed:", error);
      return {
        isAnomalous: false,
        riskScore: 0,
        patterns: [],
      };
    }
  }

  // ============================================================================
  // ANOMALY DETECTION
  // ============================================================================

  /**
   * Detect potential session hijacking
   */
  private async detectSessionHijacking(session: UserSession): Promise<{
    detected: boolean;
    indicators: string[];
    confidence: number;
  }> {
    const indicators: string[] = [];
    let confidence = 0;

    try {
      // Check for IP address changes
      const { data: sessionHistory } = await this.supabase
        .from("session_activities")
        .select("ip_address, timestamp")
        .eq("session_id", session.id)
        .order("timestamp", { ascending: false })
        .limit(10);

      if (sessionHistory && sessionHistory.length > 1) {
        const uniqueIPs = new Set(sessionHistory.map((h) => h.ip_address));
        if (uniqueIPs.size > 1) {
          indicators.push("IP address changed during session");
          confidence += 40;
        }
      }

      // Check for user agent changes
      const { data: userAgentHistory } = await this.supabase
        .from("session_activities")
        .select("user_agent, timestamp")
        .eq("session_id", session.id)
        .order("timestamp", { ascending: false })
        .limit(5);

      if (userAgentHistory && userAgentHistory.length > 1) {
        const uniqueUserAgents = new Set(userAgentHistory.map((h) => h.user_agent));
        if (uniqueUserAgents.size > 1) {
          indicators.push("User agent changed during session");
          confidence += 30;
        }
      }

      // Check for impossible activity patterns
      const activityPattern = await this.analyzeActivityPattern(session.id);
      if (activityPattern.isImpossible) {
        indicators.push("Impossible activity pattern");
        confidence += 50;
      }

      return {
        detected: confidence > 50,
        indicators,
        confidence,
      };
    } catch (error) {
      console.error("Session hijacking detection failed:", error);
      return {
        detected: false,
        indicators: [],
        confidence: 0,
      };
    }
  }

  /**
   * Detect activity anomalies
   */
  private async detectActivityAnomalies(session: UserSession): Promise<{
    detected: boolean;
    patterns: string[];
    severity: SecuritySeverity;
  }> {
    const patterns: string[] = [];
    let severity: SecuritySeverity = "low";

    try {
      // Check for rapid requests
      const { data: recentActivity } = await this.supabase
        .from("session_activities")
        .select("timestamp, action")
        .eq("session_id", session.id)
        .gte("timestamp", new Date(Date.now() - 60000).toISOString()) // Last minute
        .order("timestamp", { ascending: false });

      if (recentActivity && recentActivity.length > 100) {
        patterns.push("Excessive request rate");
        severity = "high";
      }

      // Check for unusual data access patterns
      const dataAccessPattern = await this.analyzeDataAccessPattern(session.userId);
      if (dataAccessPattern.isUnusual) {
        patterns.push("Unusual data access pattern");
        severity = "medium";
      }

      // Check for privilege escalation attempts
      const { data: privilegeAttempts } = await this.supabase
        .from("session_activities")
        .select("action, success")
        .eq("session_id", session.id)
        .like("action", "%admin%")
        .eq("success", false);

      if (privilegeAttempts && privilegeAttempts.length > 3) {
        patterns.push("Multiple privilege escalation attempts");
        severity = "high";
      }

      return {
        detected: patterns.length > 0,
        patterns,
        severity,
      };
    } catch (error) {
      console.error("Activity anomaly detection failed:", error);
      return {
        detected: false,
        patterns: [],
        severity: "low",
      };
    }
  }

  /**
   * Detect privilege escalation attempts
   */
  private async detectPrivilegeEscalation(session: UserSession): Promise<{
    detected: boolean;
    attempts: string[];
    riskLevel: number;
  }> {
    const attempts: string[] = [];
    let riskLevel = 0;

    try {
      // Check for unauthorized admin access attempts
      const { data: adminAttempts } = await this.supabase
        .from("session_activities")
        .select("action, resource, success, timestamp")
        .eq("session_id", session.id)
        .or("action.like.%admin%,resource.like.%admin%")
        .order("timestamp", { ascending: false })
        .limit(10);

      if (adminAttempts && adminAttempts.length > 0) {
        const failedAttempts = adminAttempts.filter((a) => !a.success);
        if (failedAttempts.length > 2) {
          attempts.push("Multiple failed admin access attempts");
          riskLevel += 30;
        }
      }

      // Check for role manipulation attempts
      const { data: roleAttempts } = await this.supabase
        .from("session_activities")
        .select("action, details")
        .eq("session_id", session.id)
        .like("action", "%role%")
        .order("timestamp", { ascending: false });

      if (roleAttempts && roleAttempts.length > 0) {
        attempts.push("Role manipulation attempts");
        riskLevel += 25;
      }

      // Check for permission bypass attempts
      const { data: permissionAttempts } = await this.supabase
        .from("session_activities")
        .select("action, success")
        .eq("session_id", session.id)
        .eq("success", false)
        .like("action", "%unauthorized%");

      if (permissionAttempts && permissionAttempts.length > 5) {
        attempts.push("Multiple unauthorized access attempts");
        riskLevel += 20;
      }

      return {
        detected: riskLevel > 25,
        attempts,
        riskLevel,
      };
    } catch (error) {
      console.error("Privilege escalation detection failed:", error);
      return {
        detected: false,
        attempts: [],
        riskLevel: 0,
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async checkRateLimit(userId: string, ipAddress: string): Promise<boolean> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const { data: recentAttempts } = await this.supabase
        .from("session_audit_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("ip_address", ipAddress)
        .eq("action", "session_created")
        .gte("timestamp", fiveMinutesAgo.toISOString());

      return (recentAttempts?.length || 0) > 10;
    } catch (error) {
      return false;
    }
  }

  private async checkConcurrentSessions(userId: string): Promise<boolean> {
    try {
      const { data: activeSessions } = await this.supabase
        .from("user_sessions")
        .select("id")
        .eq("user_id", userId)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString());

      return (activeSessions?.length || 0) >= this.config.maxConcurrentSessions;
    } catch (error) {
      return false;
    }
  }

  private calculateSeverity(securityScore: number): SecuritySeverity {
    if (securityScore < 25) return "critical";
    if (securityScore < 50) return "high";
    if (securityScore < 75) return "medium";
    return "low";
  }

  private async createSecurityEvent(params: {
    sessionId?: string;
    userId: string;
    eventType: SecurityEventType;
    severity: SecuritySeverity;
    description: string;
    details: any;
    ipAddress: string;
    location?: SessionLocation;
  }): Promise<SessionSecurityEvent> {
    const event: SessionSecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: params.sessionId || "",
      userId: params.userId,
      clinicId: "", // Will be filled from user data
      eventType: params.eventType,
      severity: params.severity,
      description: params.description,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: "",
      location: params.location,
      timestamp: new Date(),
      resolved: false,
      actions: this.determineSecurityActions(params.severity),
    };

    // Store in database
    await this.supabase.from("session_security_events").insert({
      id: event.id,
      session_id: event.sessionId,
      user_id: event.userId,
      event_type: event.eventType,
      severity: event.severity,
      description: event.description,
      details: event.details,
      ip_address: event.ipAddress,
      location: event.location,
      timestamp: event.timestamp.toISOString(),
      resolved: event.resolved,
      actions: event.actions,
    });

    this.emit("security_event", event);
    return event;
  }

  private determineSecurityActions(severity: SecuritySeverity): SecurityAction[] {
    switch (severity) {
      case "critical":
        return ["terminate_session", "block_device", "notify_admin", "escalate_incident"];
      case "high":
        return ["require_mfa", "send_alert", "notify_admin"];
      case "medium":
        return ["send_alert", "log_event"];
      case "low":
      default:
        return ["log_event"];
    }
  }

  private async queryExternalThreatIntel(ipAddress: string): Promise<IPReputation> {
    // Placeholder for external threat intelligence integration
    // In a real implementation, this would query services like:
    // - VirusTotal
    // - AbuseIPDB
    // - Shodan
    // - Custom threat feeds

    return {
      isMalicious: false,
      isProxy: false,
      isVPN: false,
      isTor: false,
      riskScore: 0,
      sources: ["external_api"],
    };
  }

  private isImpossibleTravel(
    lastLocation: SessionLocation,
    currentLocation: SessionLocation,
  ): boolean {
    if (
      !lastLocation.latitude ||
      !lastLocation.longitude ||
      !currentLocation.latitude ||
      !currentLocation.longitude
    ) {
      return false;
    }

    // Calculate distance between locations
    const distance = this.calculateDistance(
      lastLocation.latitude,
      lastLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude,
    );

    // Assume maximum travel speed of 1000 km/h (commercial flight)
    const maxSpeed = 1000; // km/h
    const timeDiff = 1; // hours (simplified for this example)
    const maxDistance = maxSpeed * timeDiff;

    return distance > maxDistance;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
  }

  private hasAutomationIndicators(fingerprint: DeviceFingerprint): boolean {
    // Check for automation indicators
    return (
      fingerprint.hardwareConcurrency > 16 || // Unusual CPU count
      fingerprint.maxTouchPoints === 0 || // No touch support (headless)
      !fingerprint.cookieEnabled || // Cookies disabled
      fingerprint.doNotTrack === true // DNT enabled (common in automation)
    );
  }

  private compareDeviceFingerprints(stored: any, current: DeviceFingerprint): boolean {
    // Simplified fingerprint comparison
    return (
      stored.userAgent === current.userAgent &&
      stored.screenResolution === current.screenResolution &&
      stored.timezone === current.timezone &&
      stored.language === current.language
    );
  }

  private async buildUserBehaviorProfile(userId: string): Promise<UserBehaviorProfile> {
    try {
      const { data: sessions } = await this.supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      const profile: UserBehaviorProfile = {
        userId,
        typicalLoginHours: [],
        knownIPs: new Set(),
        typicalLocations: [],
        averageSessionDuration: 0,
        lastUpdated: new Date(),
      };

      if (sessions && sessions.length > 0) {
        // Extract typical login hours
        const loginHours = sessions.map((s) => new Date(s.created_at).getHours());
        profile.typicalLoginHours = [...new Set(loginHours)];

        // Extract known IPs
        sessions.forEach((s) => profile.knownIPs.add(s.ip_address));

        // Extract typical locations
        const locations = sessions
          .map((s) => s.location)
          .filter(Boolean)
          .map((l) => `${l.country}-${l.region}`);
        profile.typicalLocations = [...new Set(locations)];

        // Calculate average session duration
        const durations = sessions
          .filter((s) => s.terminated_at)
          .map((s) => new Date(s.terminated_at).getTime() - new Date(s.created_at).getTime());
        profile.averageSessionDuration =
          durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      }

      return profile;
    } catch (error) {
      console.error("Failed to build user behavior profile:", error);
      return {
        userId,
        typicalLoginHours: [],
        knownIPs: new Set(),
        typicalLocations: [],
        averageSessionDuration: 0,
        lastUpdated: new Date(),
      };
    }
  }

  private isTypicalLocation(profile: UserBehaviorProfile, location: SessionLocation): boolean {
    const locationKey = `${location.country}-${location.region}`;
    return profile.typicalLocations.includes(locationKey);
  }

  private async getRecentLoginAttempts(userId: string): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const { data: attempts } = await this.supabase
        .from("session_audit_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("action", "session_created")
        .gte("timestamp", fiveMinutesAgo.toISOString());

      return attempts?.length || 0;
    } catch (error) {
      return 0;
    }
  }

  private async analyzeActivityPattern(sessionId: string): Promise<{
    isImpossible: boolean;
    reasons: string[];
  }> {
    // Placeholder for activity pattern analysis
    return {
      isImpossible: false,
      reasons: [],
    };
  }

  private async analyzeDataAccessPattern(userId: string): Promise<{
    isUnusual: boolean;
    patterns: string[];
  }> {
    // Placeholder for data access pattern analysis
    return {
      isUnusual: false,
      patterns: [],
    };
  }

  private async initializeSecurityData(): Promise<void> {
    try {
      // Load blocked IPs
      const { data: blockedIPs } = await this.supabase.from("blocked_ips").select("ip_address");

      if (blockedIPs) {
        blockedIPs.forEach((ip) => this.blockedIPs.add(ip.ip_address));
      }

      // Load suspicious IPs
      const { data: suspiciousIPs } = await this.supabase
        .from("suspicious_ips")
        .select("ip_address");

      if (suspiciousIPs) {
        suspiciousIPs.forEach((ip) => this.suspiciousIPs.add(ip.ip_address));
      }
    } catch (error) {
      console.error("Failed to initialize security data:", error);
    }
  }

  /**
   * Add IP to block list
   */
  async blockIP(ipAddress: string, reason: string): Promise<void> {
    this.blockedIPs.add(ipAddress);

    await this.supabase.from("blocked_ips").upsert({
      ip_address: ipAddress,
      reason,
      blocked_at: new Date().toISOString(),
    });
  }

  /**
   * Remove IP from block list
   */
  async unblockIP(ipAddress: string): Promise<void> {
    this.blockedIPs.delete(ipAddress);

    await this.supabase.from("blocked_ips").delete().eq("ip_address", ipAddress);
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface UserBehaviorProfile {
  userId: string;
  typicalLoginHours: number[];
  knownIPs: Set<string>;
  typicalLocations: string[];
  averageSessionDuration: number;
  lastUpdated: Date;
}

interface ThreatIntelligence {
  ipReputation: IPReputation;
  timestamp: number;
}
