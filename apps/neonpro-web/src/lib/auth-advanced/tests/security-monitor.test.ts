// Security Monitor Tests
// Story 1.4: Session Management & Security Implementation

import type { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SecurityMonitor } from "../security-monitor";
import type { SecurityAlert, SecurityConfig, SecurityEvent, ThreatLevel } from "../types";

describe("SecurityMonitor", () => {
  let securityMonitor: SecurityMonitor;
  let mockConfig: SecurityConfig;

  beforeEach(() => {
    mockConfig = {
      enableRealTimeMonitoring: true,
      threatDetectionLevel: "medium" as ThreatLevel,
      maxFailedAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      suspiciousActivityThreshold: 10,
      enableGeolocationTracking: true,
      enableDeviceFingerprinting: true,
      alertThresholds: {
        low: 1,
        medium: 3,
        high: 5,
        critical: 1,
      },
      autoBlockThreshold: 10,
      rateLimitConfig: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        blockDuration: 60 * 60 * 1000, // 1 hour
      },
    };

    securityMonitor = new SecurityMonitor(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("logSecurityEvent", () => {
    it("should log a security event successfully", async () => {
      const event: SecurityEvent = {
        type: "login_attempt",
        userId: "user123",
        severity: "info",
        details: {
          success: true,
          ipAddress: "192.168.1.1",
        },
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      await expect(securityMonitor.logSecurityEvent(event)).resolves.not.toThrow();
    });

    it("should create alert for high severity events", async () => {
      const event: SecurityEvent = {
        type: "suspicious_activity",
        userId: "user123",
        severity: "high",
        details: {
          reason: "Multiple failed login attempts",
          attempts: 6,
        },
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      await securityMonitor.logSecurityEvent(event);

      const alerts = await securityMonitor.getSecurityAlerts("user123");
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe("high");
    });

    it("should trigger auto-block for critical events", async () => {
      const event: SecurityEvent = {
        type: "brute_force_attack",
        userId: "user123",
        severity: "critical",
        details: {
          attempts: 15,
          timeWindow: "5 minutes",
        },
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      await securityMonitor.logSecurityEvent(event);

      const isBlocked = await securityMonitor.isIPBlocked("192.168.1.1");
      expect(isBlocked).toBe(true);
    });
  });

  describe("detectAnomalies", () => {
    it("should detect location anomalies", async () => {
      const sessionData = {
        userId: "user123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        deviceId: "device123",
      };

      // First session - establish baseline
      await securityMonitor.detectAnomalies(sessionData);

      // Second session from different location
      const anomalousSession = {
        ...sessionData,
        location: {
          country: "RU",
          region: "MOW",
          city: "Moscow",
          latitude: 55.7558,
          longitude: 37.6176,
        },
      };

      const anomalies = await securityMonitor.detectAnomalies(anomalousSession);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some((a) => a.type === "location_anomaly")).toBe(true);
    });

    it("should detect device anomalies", async () => {
      const sessionData = {
        userId: "user123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        deviceId: "device123",
      };

      // First session - establish baseline
      await securityMonitor.detectAnomalies(sessionData);

      // Second session with different user agent
      const anomalousSession = {
        ...sessionData,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        deviceId: "device456",
      };

      const anomalies = await securityMonitor.detectAnomalies(anomalousSession);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some((a) => a.type === "device_anomaly")).toBe(true);
    });

    it("should detect time-based anomalies", async () => {
      const sessionData = {
        userId: "user123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        deviceId: "device123",
      };

      // Mock unusual time (3 AM)
      vi.spyOn(Date.prototype, "getHours").mockReturnValue(3);

      const anomalies = await securityMonitor.detectAnomalies(sessionData);
      expect(anomalies.some((a) => a.type === "time_anomaly")).toBe(true);
    });
  });

  describe("calculateRiskScore", () => {
    it("should calculate low risk score for normal session", async () => {
      const sessionData = {
        userId: "user123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        deviceTrusted: true,
        mfaVerified: true,
        recentFailedAttempts: 0,
      };

      const riskScore = await securityMonitor.calculateRiskScore(sessionData);
      expect(riskScore).toBeLessThan(0.3);
    });

    it("should calculate high risk score for suspicious session", async () => {
      const sessionData = {
        userId: "user123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "CN",
          region: "BJ",
          city: "Beijing",
          latitude: 39.9042,
          longitude: 116.4074,
        },
        deviceTrusted: false,
        mfaVerified: false,
        recentFailedAttempts: 3,
      };

      const riskScore = await securityMonitor.calculateRiskScore(sessionData);
      expect(riskScore).toBeGreaterThan(0.7);
    });

    it("should increase risk score for untrusted device", async () => {
      const trustedSession = {
        userId: "user123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        deviceTrusted: true,
        mfaVerified: true,
        recentFailedAttempts: 0,
      };

      const untrustedSession = {
        ...trustedSession,
        deviceTrusted: false,
      };

      const trustedScore = await securityMonitor.calculateRiskScore(trustedSession);
      const untrustedScore = await securityMonitor.calculateRiskScore(untrustedSession);

      expect(untrustedScore).toBeGreaterThan(trustedScore);
    });
  });

  describe("getSecurityAlerts", () => {
    it("should return security alerts for user", async () => {
      // Create some events that generate alerts
      const event: SecurityEvent = {
        type: "suspicious_activity",
        userId: "user123",
        severity: "high",
        details: {
          reason: "Multiple failed login attempts",
        },
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      await securityMonitor.logSecurityEvent(event);

      const alerts = await securityMonitor.getSecurityAlerts("user123");
      expect(Array.isArray(alerts)).toBe(true);
    });

    it("should filter alerts by severity", async () => {
      // Create events with different severities
      const lowEvent: SecurityEvent = {
        type: "login_attempt",
        userId: "user123",
        severity: "low",
        details: {},
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      const highEvent: SecurityEvent = {
        type: "suspicious_activity",
        userId: "user123",
        severity: "high",
        details: {},
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      await securityMonitor.logSecurityEvent(lowEvent);
      await securityMonitor.logSecurityEvent(highEvent);

      const highAlerts = await securityMonitor.getSecurityAlerts("user123", "high");
      expect(highAlerts.every((alert) => alert.severity === "high")).toBe(true);
    });
  });

  describe("dismissAlert", () => {
    it("should dismiss an alert successfully", async () => {
      const event: SecurityEvent = {
        type: "suspicious_activity",
        userId: "user123",
        severity: "medium",
        details: {},
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      await securityMonitor.logSecurityEvent(event);

      const alerts = await securityMonitor.getSecurityAlerts("user123");
      expect(alerts.length).toBeGreaterThan(0);

      const alertId = alerts[0].id;
      const success = await securityMonitor.dismissAlert(alertId, "user123", "False positive");
      expect(success).toBe(true);

      const updatedAlerts = await securityMonitor.getSecurityAlerts("user123");
      const dismissedAlert = updatedAlerts.find((a) => a.id === alertId);
      expect(dismissedAlert?.dismissed).toBe(true);
    });

    it("should return false for non-existent alert", async () => {
      const success = await securityMonitor.dismissAlert("non-existent", "user123", "Test");
      expect(success).toBe(false);
    });
  });

  describe("blockIP", () => {
    it("should block an IP address", async () => {
      const success = await securityMonitor.blockIP(
        "192.168.1.100",
        "Manual block",
        60 * 60 * 1000,
      );
      expect(success).toBe(true);

      const isBlocked = await securityMonitor.isIPBlocked("192.168.1.100");
      expect(isBlocked).toBe(true);
    });

    it("should unblock an IP address", async () => {
      await securityMonitor.blockIP("192.168.1.100", "Test block", 60 * 60 * 1000);

      const success = await securityMonitor.unblockIP("192.168.1.100");
      expect(success).toBe(true);

      const isBlocked = await securityMonitor.isIPBlocked("192.168.1.100");
      expect(isBlocked).toBe(false);
    });
  });

  describe("getSecurityMetrics", () => {
    it("should return security metrics", async () => {
      const metrics = await securityMonitor.getSecurityMetrics("user123", "24h");

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalEvents).toBe("number");
      expect(typeof metrics.alertsGenerated).toBe("number");
      expect(typeof metrics.threatsBlocked).toBe("number");
      expect(typeof metrics.averageRiskScore).toBe("number");
      expect(Array.isArray(metrics.eventsByType)).toBe(true);
      expect(Array.isArray(metrics.alertsBySeverity)).toBe(true);
      expect(Array.isArray(metrics.topThreats)).toBe(true);
    });
  });

  describe("isRateLimited", () => {
    it("should track rate limiting", async () => {
      const identifier = "192.168.1.1";

      // Should not be rate limited initially
      let isLimited = await securityMonitor.isRateLimited(identifier);
      expect(isLimited).toBe(false);

      // Simulate many requests
      for (let i = 0; i < mockConfig.rateLimitConfig.maxRequests + 1; i++) {
        await securityMonitor.isRateLimited(identifier);
      }

      // Should now be rate limited
      isLimited = await securityMonitor.isRateLimited(identifier);
      expect(isLimited).toBe(true);
    });
  });

  describe("generateSecurityReport", () => {
    it("should generate a security report", async () => {
      const report = await securityMonitor.generateSecurityReport({
        userId: "user123",
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        includeDetails: true,
      });

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.events).toBeDefined();
      expect(report.alerts).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it("should include recommendations in report", async () => {
      // Create some security events
      const event: SecurityEvent = {
        type: "failed_login",
        userId: "user123",
        severity: "medium",
        details: {
          attempts: 3,
        },
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      await securityMonitor.logSecurityEvent(event);

      const report = await securityMonitor.generateSecurityReport({
        userId: "user123",
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        includeDetails: true,
      });

      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("threat detection", () => {
    it("should detect brute force attacks", async () => {
      const sessionData = {
        userId: "user123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        deviceId: "device123",
      };

      // Simulate multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        const event: SecurityEvent = {
          type: "failed_login",
          userId: "user123",
          severity: "medium",
          details: {
            attempt: i + 1,
          },
          timestamp: new Date(),
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
        };

        await securityMonitor.logSecurityEvent(event);
      }

      const anomalies = await securityMonitor.detectAnomalies(sessionData);
      expect(anomalies.some((a) => a.type === "brute_force")).toBe(true);
    });

    it("should detect session hijacking attempts", async () => {
      const sessionData = {
        userId: "user123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        deviceId: "device123",
      };

      // First establish normal session
      await securityMonitor.detectAnomalies(sessionData);

      // Then simulate session from different IP with same user agent
      const suspiciousSession = {
        ...sessionData,
        ipAddress: "10.0.0.1",
      };

      const anomalies = await securityMonitor.detectAnomalies(suspiciousSession);
      expect(anomalies.some((a) => a.type === "session_hijacking")).toBe(true);
    });
  });
});
