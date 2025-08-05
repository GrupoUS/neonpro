/**
 * Device Tracking Manager
 * Story 1.4 - Task 3: Device-based session tracking and management
 *
 * Features:
 * - Device fingerprinting and identification
 * - Device registration and verification
 * - Trusted device management
 * - Device-based security policies
 * - Device activity monitoring
 * - Suspicious device detection
 */

import type { createClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/auth";
import type { SecurityAuditLogger } from "./security-audit-logger";

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  plugins: string[];
  canvas?: string;
  webgl?: string;
  fonts?: string[];
  audioContext?: string;
}

export interface DeviceInfo {
  deviceId: string;
  userId: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  fingerprint: DeviceFingerprint;
  ipAddress: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  isTrusted: boolean;
  isBlocked: boolean;
  firstSeen: Date;
  lastSeen: Date;
  sessionCount: number;
  riskScore: number;
  metadata?: Record<string, any>;
}

export interface DeviceVerificationChallenge {
  challengeId: string;
  deviceId: string;
  userId: string;
  challengeType: "email" | "sms" | "push" | "totp";
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isCompleted: boolean;
  metadata?: Record<string, any>;
}

export interface DeviceSecurityPolicy {
  role: UserRole;
  requireVerification: boolean;
  autoTrustAfterVerification: boolean;
  maxUnverifiedSessions: number;
  blockSuspiciousDevices: boolean;
  riskThreshold: number;
  notifyOnNewDevice: boolean;
  deviceRetentionDays: number;
}

export interface DeviceRiskFactors {
  isNewDevice: boolean;
  locationChange: boolean;
  fingerprintMismatch: boolean;
  suspiciousUserAgent: boolean;
  vpnDetected: boolean;
  torDetected: boolean;
  knownMaliciousIP: boolean;
  rapidLocationChanges: boolean;
  unusualAccessPatterns: boolean;
}

const DEFAULT_DEVICE_POLICIES: Record<UserRole, DeviceSecurityPolicy> = {
  owner: {
    role: "owner",
    requireVerification: true,
    autoTrustAfterVerification: true,
    maxUnverifiedSessions: 1,
    blockSuspiciousDevices: true,
    riskThreshold: 0.7,
    notifyOnNewDevice: true,
    deviceRetentionDays: 365,
  },
  manager: {
    role: "manager",
    requireVerification: true,
    autoTrustAfterVerification: true,
    maxUnverifiedSessions: 1,
    blockSuspiciousDevices: true,
    riskThreshold: 0.6,
    notifyOnNewDevice: true,
    deviceRetentionDays: 180,
  },
  staff: {
    role: "staff",
    requireVerification: false,
    autoTrustAfterVerification: true,
    maxUnverifiedSessions: 2,
    blockSuspiciousDevices: true,
    riskThreshold: 0.5,
    notifyOnNewDevice: false,
    deviceRetentionDays: 90,
  },
  patient: {
    role: "patient",
    requireVerification: false,
    autoTrustAfterVerification: false,
    maxUnverifiedSessions: 1,
    blockSuspiciousDevices: false,
    riskThreshold: 0.8,
    notifyOnNewDevice: false,
    deviceRetentionDays: 30,
  },
};

export class DeviceTrackingManager {
  private supabase;
  private auditLogger: SecurityAuditLogger;
  private devicePolicies: Record<UserRole, DeviceSecurityPolicy>;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    customPolicies?: Partial<Record<UserRole, DeviceSecurityPolicy>>,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = new SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.devicePolicies = { ...DEFAULT_DEVICE_POLICIES, ...customPolicies };

    // Start cleanup interval (daily)
    this.startCleanupInterval();
  }

  /**
   * Generate device fingerprint from browser/client information
   */
  generateDeviceFingerprint(clientInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    timezone: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: boolean;
    plugins?: string[];
    canvas?: string;
    webgl?: string;
    fonts?: string[];
    audioContext?: string;
  }): DeviceFingerprint {
    return {
      userAgent: clientInfo.userAgent,
      screenResolution: `${clientInfo.screenWidth}x${clientInfo.screenHeight}`,
      timezone: clientInfo.timezone,
      language: clientInfo.language,
      platform: clientInfo.platform,
      cookieEnabled: clientInfo.cookieEnabled,
      doNotTrack: clientInfo.doNotTrack,
      plugins: clientInfo.plugins || [],
      canvas: clientInfo.canvas,
      webgl: clientInfo.webgl,
      fonts: clientInfo.fonts,
      audioContext: clientInfo.audioContext,
    };
  }

  /**
   * Generate unique device ID from fingerprint
   */
  generateDeviceId(fingerprint: DeviceFingerprint): string {
    const fingerprintString = JSON.stringify({
      userAgent: fingerprint.userAgent,
      screenResolution: fingerprint.screenResolution,
      timezone: fingerprint.timezone,
      platform: fingerprint.platform,
      canvas: fingerprint.canvas,
      webgl: fingerprint.webgl,
    });

    // Simple hash function (in production, use a proper crypto hash)
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `dev_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
  }

  /**
   * Register or update device information
   */
  async registerDevice(
    userId: string,
    userRole: UserRole,
    fingerprint: DeviceFingerprint,
    deviceInfo: {
      deviceName?: string;
      ipAddress: string;
      location?: DeviceInfo["location"];
    },
    metadata?: Record<string, any>,
  ): Promise<{ deviceId: string; isNewDevice: boolean; requiresVerification: boolean }> {
    try {
      const deviceId = this.generateDeviceId(fingerprint);
      const now = new Date();

      // Check if device already exists
      const existingDevice = await this.getDeviceInfo(deviceId);
      const isNewDevice = !existingDevice;

      // Determine device type from user agent
      const deviceType = this.detectDeviceType(fingerprint.userAgent);

      // Calculate risk score
      const riskFactors = await this.assessDeviceRisk(
        userId,
        deviceId,
        fingerprint,
        deviceInfo.ipAddress,
        deviceInfo.location,
        isNewDevice,
      );
      const riskScore = this.calculateRiskScore(riskFactors);

      // Get device policy for user role
      const policy = this.devicePolicies[userRole];

      // Determine if verification is required
      const requiresVerification =
        isNewDevice &&
        (policy.requireVerification ||
          riskScore >= policy.riskThreshold ||
          (policy.blockSuspiciousDevices && riskScore > 0.8));

      // Block device if risk is too high
      const isBlocked = policy.blockSuspiciousDevices && riskScore >= 0.9;

      if (isNewDevice) {
        // Create new device record
        const { error } = await this.supabase.from("device_registrations").insert({
          device_id: deviceId,
          user_id: userId,
          device_name: deviceInfo.deviceName || this.generateDeviceName(fingerprint),
          device_type: deviceType,
          fingerprint: fingerprint,
          ip_address: deviceInfo.ipAddress,
          location: deviceInfo.location,
          is_trusted: !requiresVerification && policy.autoTrustAfterVerification,
          is_blocked: isBlocked,
          first_seen: now.toISOString(),
          last_seen: now.toISOString(),
          session_count: 1,
          risk_score: riskScore,
          metadata: {
            ...metadata,
            riskFactors,
            userRole,
            registrationPolicy: policy,
          },
        });

        if (error) {
          throw new Error(`Failed to register device: ${error.message}`);
        }

        // Log device registration
        await this.auditLogger.logSecurityEvent({
          eventType: "device_registered",
          userId,
          deviceId,
          ipAddress: deviceInfo.ipAddress,
          userAgent: fingerprint.userAgent,
          metadata: {
            deviceType,
            riskScore,
            riskFactors,
            requiresVerification,
            isBlocked,
            location: deviceInfo.location,
          },
        });

        // Notify user if configured
        if (policy.notifyOnNewDevice && !isBlocked) {
          await this.notifyNewDevice(userId, deviceId, deviceInfo);
        }
      } else {
        // Update existing device
        const { error } = await this.supabase
          .from("device_registrations")
          .update({
            last_seen: now.toISOString(),
            session_count: (existingDevice?.sessionCount || 0) + 1,
            risk_score: riskScore,
            ip_address: deviceInfo.ipAddress,
            location: deviceInfo.location,
            metadata: {
              ...existingDevice?.metadata,
              ...metadata,
              lastRiskFactors: riskFactors,
              lastUpdate: now.toISOString(),
            },
          })
          .eq("device_id", deviceId);

        if (error) {
          throw new Error(`Failed to update device: ${error.message}`);
        }
      }

      return {
        deviceId,
        isNewDevice,
        requiresVerification: requiresVerification && !isBlocked,
      };
    } catch (error) {
      console.error("Failed to register device:", error);
      throw error;
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(deviceId: string): Promise<DeviceInfo | null> {
    try {
      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("device_id", deviceId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Device not found
        }
        throw new Error(`Failed to get device info: ${error.message}`);
      }

      return this.mapDatabaseToDeviceInfo(data);
    } catch (error) {
      console.error("Failed to get device info:", error);
      throw error;
    }
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(userId: string): Promise<DeviceInfo[]> {
    try {
      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("user_id", userId)
        .order("last_seen", { ascending: false });

      if (error) {
        throw new Error(`Failed to get user devices: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToDeviceInfo);
    } catch (error) {
      console.error("Failed to get user devices:", error);
      throw error;
    }
  }

  /**
   * Trust a device
   */
  async trustDevice(deviceId: string, trustedBy: string): Promise<void> {
    try {
      const device = await this.getDeviceInfo(deviceId);
      if (!device) {
        throw new Error("Device not found");
      }

      const { error } = await this.supabase
        .from("device_registrations")
        .update({
          is_trusted: true,
          trusted_at: new Date().toISOString(),
          trusted_by: trustedBy,
        })
        .eq("device_id", deviceId);

      if (error) {
        throw new Error(`Failed to trust device: ${error.message}`);
      }

      // Log device trust event
      await this.auditLogger.logSecurityEvent({
        eventType: "device_trusted",
        userId: device.userId,
        deviceId,
        ipAddress: device.ipAddress,
        metadata: {
          trustedBy,
          deviceName: device.deviceName,
          previousRiskScore: device.riskScore,
        },
      });
    } catch (error) {
      console.error("Failed to trust device:", error);
      throw error;
    }
  }

  /**
   * Block a device
   */
  async blockDevice(deviceId: string, reason: string, blockedBy: string): Promise<void> {
    try {
      const device = await this.getDeviceInfo(deviceId);
      if (!device) {
        throw new Error("Device not found");
      }

      const { error } = await this.supabase
        .from("device_registrations")
        .update({
          is_blocked: true,
          blocked_at: new Date().toISOString(),
          blocked_by: blockedBy,
          block_reason: reason,
        })
        .eq("device_id", deviceId);

      if (error) {
        throw new Error(`Failed to block device: ${error.message}`);
      }

      // Log device block event
      await this.auditLogger.logSecurityEvent({
        eventType: "device_blocked",
        userId: device.userId,
        deviceId,
        ipAddress: device.ipAddress,
        metadata: {
          reason,
          blockedBy,
          deviceName: device.deviceName,
          riskScore: device.riskScore,
        },
      });

      // Terminate all active sessions for this device
      await this.terminateDeviceSessions(deviceId, {
        type: "security_violation",
        message: `Device blocked: ${reason}`,
      });
    } catch (error) {
      console.error("Failed to block device:", error);
      throw error;
    }
  }

  /**
   * Create device verification challenge
   */
  async createVerificationChallenge(
    deviceId: string,
    userId: string,
    challengeType: DeviceVerificationChallenge["challengeType"],
  ): Promise<string> {
    try {
      const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const code = this.generateVerificationCode(challengeType);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const { error } = await this.supabase.from("device_verification_challenges").insert({
        challenge_id: challengeId,
        device_id: deviceId,
        user_id: userId,
        challenge_type: challengeType,
        code: code,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        max_attempts: 3,
        is_completed: false,
      });

      if (error) {
        throw new Error(`Failed to create verification challenge: ${error.message}`);
      }

      // Send verification code (implementation depends on challenge type)
      await this.sendVerificationCode(userId, challengeType, code);

      return challengeId;
    } catch (error) {
      console.error("Failed to create verification challenge:", error);
      throw error;
    }
  }

  /**
   * Verify device challenge
   */
  async verifyDeviceChallenge(
    challengeId: string,
    code: string,
  ): Promise<{ success: boolean; deviceId?: string; attemptsRemaining?: number }> {
    try {
      // Get challenge
      const { data: challenge, error: selectError } = await this.supabase
        .from("device_verification_challenges")
        .select("*")
        .eq("challenge_id", challengeId)
        .single();

      if (selectError || !challenge) {
        return { success: false };
      }

      // Check if challenge is expired or completed
      if (new Date() > new Date(challenge.expires_at) || challenge.is_completed) {
        return { success: false };
      }

      // Check if max attempts exceeded
      if (challenge.attempts >= challenge.max_attempts) {
        return { success: false, attemptsRemaining: 0 };
      }

      // Verify code
      const isValidCode = challenge.code === code;
      const newAttempts = challenge.attempts + 1;

      if (isValidCode) {
        // Mark challenge as completed
        await this.supabase
          .from("device_verification_challenges")
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
            attempts: newAttempts,
          })
          .eq("challenge_id", challengeId);

        // Trust the device if policy allows
        const device = await this.getDeviceInfo(challenge.device_id);
        if (device) {
          const userRole = await this.getUserRole(device.userId);
          const policy = this.devicePolicies[userRole];

          if (policy.autoTrustAfterVerification) {
            await this.trustDevice(challenge.device_id, "system_verification");
          }
        }

        // Log successful verification
        await this.auditLogger.logSecurityEvent({
          eventType: "device_verification_success",
          userId: challenge.user_id,
          deviceId: challenge.device_id,
          metadata: {
            challengeType: challenge.challenge_type,
            attempts: newAttempts,
          },
        });

        return { success: true, deviceId: challenge.device_id };
      } else {
        // Update attempt count
        await this.supabase
          .from("device_verification_challenges")
          .update({ attempts: newAttempts })
          .eq("challenge_id", challengeId);

        // Log failed verification
        await this.auditLogger.logSecurityEvent({
          eventType: "device_verification_failed",
          userId: challenge.user_id,
          deviceId: challenge.device_id,
          metadata: {
            challengeType: challenge.challenge_type,
            attempts: newAttempts,
            maxAttempts: challenge.max_attempts,
          },
        });

        return {
          success: false,
          attemptsRemaining: challenge.max_attempts - newAttempts,
        };
      }
    } catch (error) {
      console.error("Failed to verify device challenge:", error);
      throw error;
    }
  }

  /**
   * Clean up old devices and challenges
   */
  async cleanupOldDevices(): Promise<{ devicesRemoved: number; challengesRemoved: number }> {
    try {
      let devicesRemoved = 0;
      let challengesRemoved = 0;

      // Clean up devices based on retention policies
      for (const [role, policy] of Object.entries(this.devicePolicies)) {
        const retentionDate = new Date(
          Date.now() - policy.deviceRetentionDays * 24 * 60 * 60 * 1000,
        );

        const { data: oldDevices, error: selectError } = await this.supabase
          .from("device_registrations")
          .select("device_id")
          .lt("last_seen", retentionDate.toISOString());

        if (selectError) {
          console.error(`Failed to find old devices for role ${role}:`, selectError);
          continue;
        }

        if (oldDevices && oldDevices.length > 0) {
          const { error: deleteError } = await this.supabase
            .from("device_registrations")
            .delete()
            .in(
              "device_id",
              oldDevices.map((d) => d.device_id),
            );

          if (!deleteError) {
            devicesRemoved += oldDevices.length;
          }
        }
      }

      // Clean up expired challenges
      const { data: expiredChallenges, error: challengeSelectError } = await this.supabase
        .from("device_verification_challenges")
        .select("challenge_id")
        .lt("expires_at", new Date().toISOString());

      if (!challengeSelectError && expiredChallenges && expiredChallenges.length > 0) {
        const { error: challengeDeleteError } = await this.supabase
          .from("device_verification_challenges")
          .delete()
          .in(
            "challenge_id",
            expiredChallenges.map((c) => c.challenge_id),
          );

        if (!challengeDeleteError) {
          challengesRemoved = expiredChallenges.length;
        }
      }

      // Log cleanup event
      await this.auditLogger.logSecurityEvent({
        eventType: "device_cleanup",
        metadata: {
          devicesRemoved,
          challengesRemoved,
        },
      });

      return { devicesRemoved, challengesRemoved };
    } catch (error) {
      console.error("Failed to cleanup old devices:", error);
      throw error;
    }
  }

  /**
   * Update device policies
   */
  updateDevicePolicy(role: UserRole, policy: Partial<DeviceSecurityPolicy>): void {
    this.devicePolicies[role] = {
      ...this.devicePolicies[role],
      ...policy,
      role,
    };
  }

  /**
   * Get device policy for role
   */
  getDevicePolicy(role: UserRole): DeviceSecurityPolicy {
    return this.devicePolicies[role];
  }

  /**
   * Destroy the device tracking manager
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  // Private methods

  private detectDeviceType(userAgent: string): DeviceInfo["deviceType"] {
    const ua = userAgent.toLowerCase();

    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return "mobile";
    }

    if (ua.includes("tablet") || ua.includes("ipad")) {
      return "tablet";
    }

    if (ua.includes("windows") || ua.includes("mac") || ua.includes("linux")) {
      return "desktop";
    }

    return "unknown";
  }

  private generateDeviceName(fingerprint: DeviceFingerprint): string {
    const platform = fingerprint.platform || "Unknown";
    const deviceType = this.detectDeviceType(fingerprint.userAgent);
    const timestamp = new Date().toLocaleDateString();

    return `${platform} ${deviceType} (${timestamp})`;
  }

  private async assessDeviceRisk(
    userId: string,
    deviceId: string,
    fingerprint: DeviceFingerprint,
    ipAddress: string,
    location?: DeviceInfo["location"],
    isNewDevice: boolean = false,
  ): Promise<DeviceRiskFactors> {
    // Get user's previous devices for comparison
    const userDevices = await this.getUserDevices(userId);

    // Assess various risk factors
    const riskFactors: DeviceRiskFactors = {
      isNewDevice,
      locationChange: false,
      fingerprintMismatch: false,
      suspiciousUserAgent: false,
      vpnDetected: false,
      torDetected: false,
      knownMaliciousIP: false,
      rapidLocationChanges: false,
      unusualAccessPatterns: false,
    };

    if (userDevices.length > 0) {
      // Check for location changes
      const lastDevice = userDevices[0];
      if (lastDevice.location && location) {
        const distance = this.calculateDistance(
          lastDevice.location.coordinates,
          location.coordinates,
        );
        riskFactors.locationChange = distance > 1000; // More than 1000km
      }

      // Check for fingerprint mismatches
      const similarDevices = userDevices.filter(
        (d) =>
          d.fingerprint.platform === fingerprint.platform &&
          d.fingerprint.userAgent.includes(fingerprint.userAgent.split("/")[0]),
      );
      riskFactors.fingerprintMismatch = similarDevices.length === 0;
    }

    // Check for suspicious user agent
    riskFactors.suspiciousUserAgent = this.isSuspiciousUserAgent(fingerprint.userAgent);

    // Check for VPN/Tor (simplified - in production, use proper IP intelligence)
    riskFactors.vpnDetected = await this.checkVPN(ipAddress);
    riskFactors.torDetected = await this.checkTor(ipAddress);
    riskFactors.knownMaliciousIP = await this.checkMaliciousIP(ipAddress);

    return riskFactors;
  }

  private calculateRiskScore(riskFactors: DeviceRiskFactors): number {
    let score = 0;

    if (riskFactors.isNewDevice) score += 0.2;
    if (riskFactors.locationChange) score += 0.3;
    if (riskFactors.fingerprintMismatch) score += 0.2;
    if (riskFactors.suspiciousUserAgent) score += 0.4;
    if (riskFactors.vpnDetected) score += 0.3;
    if (riskFactors.torDetected) score += 0.6;
    if (riskFactors.knownMaliciousIP) score += 0.8;
    if (riskFactors.rapidLocationChanges) score += 0.5;
    if (riskFactors.unusualAccessPatterns) score += 0.4;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private calculateDistance(
    coord1?: { latitude: number; longitude: number },
    coord2?: { latitude: number; longitude: number },
  ): number {
    if (!coord1 || !coord2) return 0;

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

  private async checkVPN(ipAddress: string): Promise<boolean> {
    // Simplified VPN detection - in production, use proper IP intelligence service
    try {
      // This would call an IP intelligence API
      return false;
    } catch {
      return false;
    }
  }

  private async checkTor(ipAddress: string): Promise<boolean> {
    // Simplified Tor detection - in production, use Tor exit node lists
    try {
      // This would check against Tor exit node lists
      return false;
    } catch {
      return false;
    }
  }

  private async checkMaliciousIP(ipAddress: string): Promise<boolean> {
    // Simplified malicious IP detection - in production, use threat intelligence
    try {
      // This would check against threat intelligence feeds
      return false;
    } catch {
      return false;
    }
  }

  private generateVerificationCode(
    challengeType: DeviceVerificationChallenge["challengeType"],
  ): string {
    switch (challengeType) {
      case "totp":
        return Math.floor(100000 + Math.random() * 900000).toString();
      case "email":
      case "sms":
      case "push":
      default:
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
  }

  private async sendVerificationCode(
    userId: string,
    challengeType: DeviceVerificationChallenge["challengeType"],
    code: string,
  ): Promise<void> {
    // This would integrate with your notification system
    // For now, we'll just log the event
    await this.auditLogger.logSecurityEvent({
      eventType: "verification_code_sent",
      userId,
      metadata: {
        challengeType,
        codeLength: code.length,
      },
    });
  }

  private async getUserRole(userId: string): Promise<UserRole> {
    // This would fetch the user's role from your user management system
    // For now, return a default role
    return "staff";
  }

  private async terminateDeviceSessions(
    deviceId: string,
    reason: { type: string; message: string },
  ): Promise<void> {
    // This would integrate with your session management system
    // to terminate all active sessions for the blocked device
    await this.auditLogger.logSecurityEvent({
      eventType: "device_sessions_terminated",
      deviceId,
      metadata: reason,
    });
  }

  private async notifyNewDevice(
    userId: string,
    deviceId: string,
    deviceInfo: { ipAddress: string; location?: DeviceInfo["location"] },
  ): Promise<void> {
    // This would integrate with your notification system
    await this.auditLogger.logSecurityEvent({
      eventType: "new_device_notification",
      userId,
      deviceId,
      ipAddress: deviceInfo.ipAddress,
      metadata: {
        location: deviceInfo.location,
      },
    });
  }

  private mapDatabaseToDeviceInfo(data: any): DeviceInfo {
    return {
      deviceId: data.device_id,
      userId: data.user_id,
      deviceName: data.device_name,
      deviceType: data.device_type,
      fingerprint: data.fingerprint,
      ipAddress: data.ip_address,
      location: data.location,
      isTrusted: data.is_trusted,
      isBlocked: data.is_blocked,
      firstSeen: new Date(data.first_seen),
      lastSeen: new Date(data.last_seen),
      sessionCount: data.session_count,
      riskScore: data.risk_score,
      metadata: data.metadata,
    };
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      async () => {
        try {
          await this.cleanupOldDevices();
        } catch (error) {
          console.error("Device cleanup failed:", error);
        }
      },
      24 * 60 * 60 * 1000,
    ); // Daily cleanup
  }
}
