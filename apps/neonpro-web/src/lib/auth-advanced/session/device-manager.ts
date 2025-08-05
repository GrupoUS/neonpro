/**
 * Device Manager - Device Registration & Validation
 *
 * Manages device registration, fingerprinting, trust levels, and device-based security
 * for the NeonPro session management system with LGPD compliance.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { EventEmitter } from "events";
import type {
  DeviceFingerprint,
  DeviceMetadata,
  DeviceRegistration,
  DeviceType,
  LGPDSessionData,
  SessionError,
  SessionLocation,
} from "./types";

interface DeviceRegistrationParams {
  userId: string;
  clinicId: string;
  fingerprint: DeviceFingerprint;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  deviceName?: string;
}

interface DeviceValidationResult {
  isValid: boolean;
  isTrusted: boolean;
  isBlocked: boolean;
  riskScore: number;
  reasons: string[];
  device?: DeviceRegistration;
}

interface DeviceTrustParams {
  deviceId: string;
  userId: string;
  verificationMethod: "email" | "sms" | "admin" | "biometric";
  verificationCode?: string;
}

export class DeviceManager extends EventEmitter {
  private supabase: SupabaseClient;
  private deviceCache: Map<string, DeviceRegistration> = new Map();
  private fingerprintCache: Map<string, string> = new Map();
  private blockedDevices: Set<string> = new Set();

  constructor(supabase: SupabaseClient) {
    super();
    this.supabase = supabase;
    this.initializeDeviceData();
  }

  // ============================================================================
  // DEVICE REGISTRATION & VALIDATION
  // ============================================================================

  /**
   * Register or validate a device for a user
   */
  async registerOrValidateDevice(params: DeviceRegistrationParams): Promise<DeviceRegistration> {
    try {
      // Generate device fingerprint hash
      const fingerprintHash = this.generateFingerprintHash(params.fingerprint);

      // Check if device already exists
      const existingDevice = await this.getDeviceByFingerprint(fingerprintHash, params.userId);

      if (existingDevice) {
        // Update existing device
        const updatedDevice = await this.updateDeviceUsage(existingDevice.id, {
          lastUsed: new Date(),
          ipAddress: params.ipAddress,
          location: params.location,
        });

        this.emit("device_validated", { device: updatedDevice, isNew: false });
        return updatedDevice;
      }

      // Register new device
      const newDevice = await this.registerNewDevice(params, fingerprintHash);

      this.emit("device_registered", { device: newDevice, isNew: true });
      return newDevice;
    } catch (error) {
      throw new SessionError("Failed to register or validate device", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Validate device for session creation
   */
  async validateDevice(fingerprintHash: string, userId: string): Promise<DeviceValidationResult> {
    try {
      const device = await this.getDeviceByFingerprint(fingerprintHash, userId);

      if (!device) {
        return {
          isValid: false,
          isTrusted: false,
          isBlocked: false,
          riskScore: 50,
          reasons: ["Unknown device"],
        };
      }

      // Check if device is blocked
      if (device.isBlocked || this.blockedDevices.has(device.id)) {
        return {
          isValid: false,
          isTrusted: false,
          isBlocked: true,
          riskScore: 100,
          reasons: ["Device is blocked"],
          device,
        };
      }

      // Calculate device risk score
      const riskAssessment = await this.assessDeviceRisk(device);

      return {
        isValid: true,
        isTrusted: device.isTrusted,
        isBlocked: false,
        riskScore: riskAssessment.riskScore,
        reasons: riskAssessment.reasons,
        device,
      };
    } catch (error) {
      return {
        isValid: false,
        isTrusted: false,
        isBlocked: false,
        riskScore: 100,
        reasons: ["Device validation error"],
      };
    }
  }

  /**
   * Trust a device after verification
   */
  async trustDevice(params: DeviceTrustParams): Promise<DeviceRegistration> {
    try {
      // Verify the trust request
      const isVerified = await this.verifyDeviceTrust(params);

      if (!isVerified) {
        throw new SessionError("Device trust verification failed", "AUTHENTICATION_REQUIRED");
      }

      // Update device trust status
      const { data, error } = await this.supabase
        .from("device_registrations")
        .update({
          is_trusted: true,
          trusted_at: new Date().toISOString(),
          trust_method: params.verificationMethod,
        })
        .eq("id", params.deviceId)
        .eq("user_id", params.userId)
        .select()
        .single();

      if (error || !data) {
        throw new SessionError("Failed to update device trust status", "SYSTEM_ERROR", { error });
      }

      const trustedDevice = this.mapDatabaseToDevice(data);

      // Update cache
      this.deviceCache.set(trustedDevice.id, trustedDevice);

      // Log trust event
      await this.logDeviceEvent({
        deviceId: trustedDevice.id,
        userId: params.userId,
        action: "device_trusted",
        details: {
          verificationMethod: params.verificationMethod,
          trustedAt: new Date(),
        },
      });

      this.emit("device_trusted", { device: trustedDevice, method: params.verificationMethod });

      return trustedDevice;
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to trust device", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Block a device
   */
  async blockDevice(deviceId: string, userId: string, reason: string): Promise<void> {
    try {
      // Update device block status
      const { error } = await this.supabase
        .from("device_registrations")
        .update({
          is_blocked: true,
          blocked_at: new Date().toISOString(),
          block_reason: reason,
        })
        .eq("id", deviceId)
        .eq("user_id", userId);

      if (error) {
        throw new SessionError("Failed to block device", "SYSTEM_ERROR", { error });
      }

      // Add to blocked devices cache
      this.blockedDevices.add(deviceId);

      // Remove from device cache
      this.deviceCache.delete(deviceId);

      // Terminate all sessions for this device
      await this.terminateDeviceSessions(deviceId);

      // Log block event
      await this.logDeviceEvent({
        deviceId,
        userId,
        action: "device_blocked",
        details: {
          reason,
          blockedAt: new Date(),
        },
      });

      this.emit("device_blocked", { deviceId, userId, reason });
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to block device", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Unblock a device
   */
  async unblockDevice(deviceId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("device_registrations")
        .update({
          is_blocked: false,
          blocked_at: null,
          block_reason: null,
        })
        .eq("id", deviceId)
        .eq("user_id", userId);

      if (error) {
        throw new SessionError("Failed to unblock device", "SYSTEM_ERROR", { error });
      }

      // Remove from blocked devices cache
      this.blockedDevices.delete(deviceId);

      // Log unblock event
      await this.logDeviceEvent({
        deviceId,
        userId,
        action: "device_unblocked",
        details: {
          unblockedAt: new Date(),
        },
      });

      this.emit("device_unblocked", { deviceId, userId });
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to unblock device", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // DEVICE QUERIES
  // ============================================================================

  /**
   * Get all devices for a user
   */
  async getUserDevices(userId: string): Promise<DeviceRegistration[]> {
    try {
      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("user_id", userId)
        .order("last_used", { ascending: false });

      if (error) {
        throw new SessionError("Failed to fetch user devices", "SYSTEM_ERROR", { error });
      }

      return data.map(this.mapDatabaseToDevice);
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to get user devices", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Get trusted devices for a user
   */
  async getTrustedDevices(userId: string): Promise<DeviceRegistration[]> {
    try {
      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("user_id", userId)
        .eq("is_trusted", true)
        .eq("is_blocked", false)
        .order("last_used", { ascending: false });

      if (error) {
        throw new SessionError("Failed to fetch trusted devices", "SYSTEM_ERROR", { error });
      }

      return data.map(this.mapDatabaseToDevice);
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to get trusted devices", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Get device by ID
   */
  async getDeviceById(deviceId: string): Promise<DeviceRegistration | null> {
    try {
      // Check cache first
      const cached = this.deviceCache.get(deviceId);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("id", deviceId)
        .single();

      if (error || !data) {
        return null;
      }

      const device = this.mapDatabaseToDevice(data);

      // Cache the device
      this.deviceCache.set(deviceId, device);

      return device;
    } catch (error) {
      return null;
    }
  }

  /**
   * Search devices with filters
   */
  async searchDevices(filters: {
    userId?: string;
    clinicId?: string;
    deviceType?: DeviceType;
    isTrusted?: boolean;
    isBlocked?: boolean;
    registeredAfter?: Date;
    lastUsedAfter?: Date;
  }): Promise<DeviceRegistration[]> {
    try {
      let query = this.supabase.from("device_registrations").select("*");

      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.clinicId) {
        query = query.eq("clinic_id", filters.clinicId);
      }
      if (filters.deviceType) {
        query = query.eq("device_type", filters.deviceType);
      }
      if (filters.isTrusted !== undefined) {
        query = query.eq("is_trusted", filters.isTrusted);
      }
      if (filters.isBlocked !== undefined) {
        query = query.eq("is_blocked", filters.isBlocked);
      }
      if (filters.registeredAfter) {
        query = query.gte("registered_at", filters.registeredAfter.toISOString());
      }
      if (filters.lastUsedAfter) {
        query = query.gte("last_used", filters.lastUsedAfter.toISOString());
      }

      query = query.order("last_used", { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new SessionError("Failed to search devices", "SYSTEM_ERROR", { error });
      }

      return data.map(this.mapDatabaseToDevice);
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to search devices", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // DEVICE FINGERPRINTING
  // ============================================================================

  /**
   * Generate device fingerprint from browser data
   */
  generateDeviceFingerprint(browserData: {
    userAgent: string;
    screenResolution: string;
    timezone: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: boolean;
    hardwareConcurrency: number;
    maxTouchPoints: number;
    pixelRatio: number;
    colorDepth: number;
    webglVendor?: string;
    webglRenderer?: string;
    audioContext?: any;
    canvas?: HTMLCanvasElement;
  }): DeviceFingerprint {
    const fingerprint: DeviceFingerprint = {
      userAgent: browserData.userAgent,
      screenResolution: browserData.screenResolution,
      colorDepth: browserData.colorDepth,
      timezone: browserData.timezone,
      language: browserData.language,
      platform: browserData.platform,
      cookieEnabled: browserData.cookieEnabled,
      doNotTrack: browserData.doNotTrack,
      hardwareConcurrency: browserData.hardwareConcurrency,
      maxTouchPoints: browserData.maxTouchPoints,
      pixelRatio: browserData.pixelRatio,
    };

    // Add WebGL fingerprint if available
    if (browserData.webglVendor && browserData.webglRenderer) {
      fingerprint.webglVendor = browserData.webglVendor;
      fingerprint.webglRenderer = browserData.webglRenderer;
    }

    // Add audio fingerprint if available
    if (browserData.audioContext) {
      fingerprint.audioFingerprint = this.generateAudioFingerprint(browserData.audioContext);
    }

    // Add canvas fingerprint if available
    if (browserData.canvas) {
      fingerprint.canvasFingerprint = this.generateCanvasFingerprint(browserData.canvas);
    }

    return fingerprint;
  }

  /**
   * Generate a hash from device fingerprint
   */
  generateFingerprintHash(fingerprint: DeviceFingerprint): string {
    const fingerprintString = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
    return crypto.createHash("sha256").update(fingerprintString).digest("hex");
  }

  /**
   * Compare two device fingerprints for similarity
   */
  compareFingerprintSimilarity(fp1: DeviceFingerprint, fp2: DeviceFingerprint): number {
    const fields = [
      "userAgent",
      "screenResolution",
      "timezone",
      "language",
      "platform",
      "hardwareConcurrency",
      "maxTouchPoints",
      "pixelRatio",
      "colorDepth",
    ];

    let matches = 0;
    let total = 0;

    for (const field of fields) {
      total++;
      if (fp1[field as keyof DeviceFingerprint] === fp2[field as keyof DeviceFingerprint]) {
        matches++;
      }
    }

    return matches / total;
  }

  // ============================================================================
  // DEVICE ANALYTICS
  // ============================================================================

  /**
   * Get device usage statistics
   */
  async getDeviceStatistics(
    userId?: string,
    clinicId?: string,
  ): Promise<{
    totalDevices: number;
    trustedDevices: number;
    blockedDevices: number;
    deviceTypes: Record<DeviceType, number>;
    recentRegistrations: number;
    averageUsageCount: number;
  }> {
    try {
      let query = this.supabase
        .from("device_registrations")
        .select("device_type, is_trusted, is_blocked, usage_count, registered_at");

      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (clinicId) {
        query = query.eq("clinic_id", clinicId);
      }

      const { data, error } = await query;

      if (error) {
        throw new SessionError("Failed to get device statistics", "SYSTEM_ERROR", { error });
      }

      const stats = {
        totalDevices: data.length,
        trustedDevices: data.filter((d) => d.is_trusted).length,
        blockedDevices: data.filter((d) => d.is_blocked).length,
        deviceTypes: {
          desktop: 0,
          laptop: 0,
          tablet: 0,
          mobile: 0,
          unknown: 0,
        } as Record<DeviceType, number>,
        recentRegistrations: 0,
        averageUsageCount: 0,
      };

      // Count device types
      data.forEach((device) => {
        stats.deviceTypes[device.device_type as DeviceType]++;
      });

      // Count recent registrations (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      stats.recentRegistrations = data.filter(
        (d) => new Date(d.registered_at) > sevenDaysAgo,
      ).length;

      // Calculate average usage count
      const totalUsage = data.reduce((sum, d) => sum + (d.usage_count || 0), 0);
      stats.averageUsageCount = data.length > 0 ? totalUsage / data.length : 0;

      return stats;
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to get device statistics", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Clean up old devices
   */
  async cleanupOldDevices(retentionDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      // Get old, unused devices
      const { data: oldDevices, error: fetchError } = await this.supabase
        .from("device_registrations")
        .select("id")
        .lt("last_used", cutoffDate.toISOString())
        .eq("is_trusted", false)
        .eq("is_blocked", false)
        .limit(100);

      if (fetchError) {
        throw new SessionError("Failed to fetch old devices", "SYSTEM_ERROR", {
          error: fetchError,
        });
      }

      if (!oldDevices || oldDevices.length === 0) {
        return 0;
      }

      // Delete old devices
      const { error: deleteError } = await this.supabase
        .from("device_registrations")
        .delete()
        .in(
          "id",
          oldDevices.map((d) => d.id),
        );

      if (deleteError) {
        throw new SessionError("Failed to delete old devices", "SYSTEM_ERROR", {
          error: deleteError,
        });
      }

      // Clear from cache
      oldDevices.forEach((device) => {
        this.deviceCache.delete(device.id);
      });

      return oldDevices.length;
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to cleanup old devices", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async registerNewDevice(
    params: DeviceRegistrationParams,
    fingerprintHash: string,
  ): Promise<DeviceRegistration> {
    const deviceId = this.generateDeviceId();
    const now = new Date();

    // Detect device type and metadata
    const deviceType = this.detectDeviceType(params.fingerprint);
    const deviceMetadata = this.extractDeviceMetadata(params.fingerprint);
    const deviceName = params.deviceName || this.generateDeviceName(params.fingerprint);

    const device: DeviceRegistration = {
      id: deviceId,
      userId: params.userId,
      clinicId: params.clinicId,
      deviceFingerprint: fingerprintHash,
      deviceName,
      deviceType,
      platform: params.fingerprint.platform,
      browser: this.extractBrowser(params.fingerprint.userAgent),
      screenResolution: params.fingerprint.screenResolution,
      timezone: params.fingerprint.timezone,
      isTrusted: false,
      isBlocked: false,
      registeredAt: now,
      lastUsed: now,
      usageCount: 1,
      securityEvents: 0,
      metadata: deviceMetadata,
    };

    // Store in database
    const { error } = await this.supabase.from("device_registrations").insert({
      id: device.id,
      user_id: device.userId,
      clinic_id: device.clinicId,
      device_fingerprint: device.deviceFingerprint,
      device_name: device.deviceName,
      device_type: device.deviceType,
      platform: device.platform,
      browser: device.browser,
      screen_resolution: device.screenResolution,
      timezone: device.timezone,
      is_trusted: device.isTrusted,
      is_blocked: device.isBlocked,
      registered_at: device.registeredAt.toISOString(),
      last_used: device.lastUsed.toISOString(),
      usage_count: device.usageCount,
      security_events: device.securityEvents,
      metadata: device.metadata,
    });

    if (error) {
      throw new SessionError("Failed to register device in database", "SYSTEM_ERROR", { error });
    }

    // Cache the device
    this.deviceCache.set(device.id, device);
    this.fingerprintCache.set(fingerprintHash, device.id);

    // Log registration event
    await this.logDeviceEvent({
      deviceId: device.id,
      userId: params.userId,
      action: "device_registered",
      details: {
        deviceType,
        platform: device.platform,
        browser: device.browser,
        ipAddress: params.ipAddress,
        location: params.location,
      },
    });

    return device;
  }

  private async getDeviceByFingerprint(
    fingerprintHash: string,
    userId: string,
  ): Promise<DeviceRegistration | null> {
    try {
      // Check fingerprint cache first
      const cachedDeviceId = this.fingerprintCache.get(fingerprintHash);
      if (cachedDeviceId) {
        const cachedDevice = this.deviceCache.get(cachedDeviceId);
        if (cachedDevice && cachedDevice.userId === userId) {
          return cachedDevice;
        }
      }

      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("device_fingerprint", fingerprintHash)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return null;
      }

      const device = this.mapDatabaseToDevice(data);

      // Cache the device
      this.deviceCache.set(device.id, device);
      this.fingerprintCache.set(fingerprintHash, device.id);

      return device;
    } catch (error) {
      return null;
    }
  }

  private async updateDeviceUsage(
    deviceId: string,
    updates: {
      lastUsed: Date;
      ipAddress: string;
      location?: SessionLocation;
    },
  ): Promise<DeviceRegistration> {
    const { data, error } = await this.supabase
      .from("device_registrations")
      .update({
        last_used: updates.lastUsed.toISOString(),
        usage_count: this.supabase.rpc("increment_usage_count", { device_id: deviceId }),
      })
      .eq("id", deviceId)
      .select()
      .single();

    if (error || !data) {
      throw new SessionError("Failed to update device usage", "SYSTEM_ERROR", { error });
    }

    const updatedDevice = this.mapDatabaseToDevice(data);

    // Update cache
    this.deviceCache.set(deviceId, updatedDevice);

    return updatedDevice;
  }

  private async assessDeviceRisk(device: DeviceRegistration): Promise<{
    riskScore: number;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check if device is new
    const daysSinceRegistration =
      (Date.now() - device.registeredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceRegistration < 1) {
      reasons.push("New device (less than 1 day old)");
      riskScore += 20;
    }

    // Check usage patterns
    if (device.usageCount < 3) {
      reasons.push("Low usage count");
      riskScore += 10;
    }

    // Check security events
    if (device.securityEvents > 0) {
      reasons.push(`${device.securityEvents} security events`);
      riskScore += device.securityEvents * 5;
    }

    // Check if device is trusted
    if (!device.isTrusted) {
      reasons.push("Device not trusted");
      riskScore += 15;
    }

    // Check last usage
    const daysSinceLastUse = (Date.now() - device.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUse > 30) {
      reasons.push("Device not used for over 30 days");
      riskScore += 10;
    }

    return {
      riskScore: Math.min(100, riskScore),
      reasons,
    };
  }

  private async verifyDeviceTrust(params: DeviceTrustParams): Promise<boolean> {
    // Simplified verification - in a real implementation, this would:
    // - Send verification codes via email/SMS
    // - Validate biometric data
    // - Check admin approval
    // - Validate time-based tokens

    switch (params.verificationMethod) {
      case "admin":
        // Admin approval - always allow for demo
        return true;

      case "email":
      case "sms":
        // Code verification - simplified for demo
        return params.verificationCode === "123456";

      case "biometric":
        // Biometric verification - simplified for demo
        return true;

      default:
        return false;
    }
  }

  private async terminateDeviceSessions(deviceId: string): Promise<void> {
    try {
      // Get device to find fingerprint
      const device = await this.getDeviceById(deviceId);
      if (!device) return;

      // Terminate all active sessions for this device
      await this.supabase
        .from("user_sessions")
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          termination_reason: "device_blocked",
        })
        .eq("device_fingerprint", device.deviceFingerprint)
        .eq("is_active", true);
    } catch (error) {
      console.error("Failed to terminate device sessions:", error);
    }
  }

  private detectDeviceType(fingerprint: DeviceFingerprint): DeviceType {
    const userAgent = fingerprint.userAgent.toLowerCase();

    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) {
      return "mobile";
    }

    if (/tablet|ipad/i.test(userAgent)) {
      return "tablet";
    }

    if (/windows|macintosh|linux/i.test(userAgent)) {
      // Distinguish between desktop and laptop based on screen resolution
      const [width, height] = fingerprint.screenResolution.split("x").map(Number);
      if (width >= 1920 && height >= 1080) {
        return "desktop";
      }
      return "laptop";
    }

    return "unknown";
  }

  private extractDeviceMetadata(fingerprint: DeviceFingerprint): DeviceMetadata {
    const userAgent = fingerprint.userAgent;

    return {
      os: this.extractOS(userAgent),
      osVersion: this.extractOSVersion(userAgent),
      browserVersion: this.extractBrowserVersion(userAgent),
      hardwareConcurrency: fingerprint.hardwareConcurrency,
      maxTouchPoints: fingerprint.maxTouchPoints,
      colorDepth: fingerprint.colorDepth,
      pixelRatio: fingerprint.pixelRatio,
    };
  }

  private generateDeviceName(fingerprint: DeviceFingerprint): string {
    const os = this.extractOS(fingerprint.userAgent);
    const browser = this.extractBrowser(fingerprint.userAgent);
    const deviceType = this.detectDeviceType(fingerprint);

    return `${os} ${deviceType} (${browser})`;
  }

  private extractBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return "Chrome";
    if (/firefox/i.test(userAgent)) return "Firefox";
    if (/safari/i.test(userAgent)) return "Safari";
    if (/edge/i.test(userAgent)) return "Edge";
    if (/opera/i.test(userAgent)) return "Opera";
    return "Unknown";
  }

  private extractOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return "Windows";
    if (/macintosh|mac os/i.test(userAgent)) return "macOS";
    if (/linux/i.test(userAgent)) return "Linux";
    if (/android/i.test(userAgent)) return "Android";
    if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
    return "Unknown";
  }

  private extractOSVersion(userAgent: string): string {
    // Simplified OS version extraction
    const windowsMatch = userAgent.match(/Windows NT ([\d.]+)/);
    if (windowsMatch) return windowsMatch[1];

    const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
    if (macMatch) return macMatch[1].replace(/_/g, ".");

    const androidMatch = userAgent.match(/Android ([\d.]+)/);
    if (androidMatch) return androidMatch[1];

    const iosMatch = userAgent.match(/OS ([\d_]+)/);
    if (iosMatch) return iosMatch[1].replace(/_/g, ".");

    return "Unknown";
  }

  private extractBrowserVersion(userAgent: string): string {
    // Simplified browser version extraction
    const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
    if (chromeMatch) return chromeMatch[1];

    const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
    if (firefoxMatch) return firefoxMatch[1];

    const safariMatch = userAgent.match(/Version\/([\d.]+).*Safari/);
    if (safariMatch) return safariMatch[1];

    const edgeMatch = userAgent.match(/Edge\/([\d.]+)/);
    if (edgeMatch) return edgeMatch[1];

    return "Unknown";
  }

  private generateAudioFingerprint(audioContext: any): string {
    // Simplified audio fingerprinting
    try {
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();

      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      return crypto.createHash("md5").update(dataArray.toString()).digest("hex");
    } catch (error) {
      return "audio_error";
    }
  }

  private generateCanvasFingerprint(canvas: HTMLCanvasElement): string {
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return "canvas_error";

      // Draw some shapes and text
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprinting", 2, 2);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillRect(100, 5, 80, 20);

      return crypto.createHash("md5").update(canvas.toDataURL()).digest("hex");
    } catch (error) {
      return "canvas_error";
    }
  }

  private generateDeviceId(): string {
    return `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapDatabaseToDevice(data: any): DeviceRegistration {
    return {
      id: data.id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      deviceFingerprint: data.device_fingerprint,
      deviceName: data.device_name,
      deviceType: data.device_type,
      platform: data.platform,
      browser: data.browser,
      screenResolution: data.screen_resolution,
      timezone: data.timezone,
      isTrusted: data.is_trusted,
      isBlocked: data.is_blocked,
      registeredAt: new Date(data.registered_at),
      lastUsed: new Date(data.last_used),
      usageCount: data.usage_count,
      securityEvents: data.security_events,
      metadata: data.metadata,
    };
  }

  private async logDeviceEvent(params: {
    deviceId: string;
    userId: string;
    action: string;
    details: any;
  }): Promise<void> {
    try {
      await this.supabase.from("device_audit_logs").insert({
        device_id: params.deviceId,
        user_id: params.userId,
        action: params.action,
        details: params.details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log device event:", error);
    }
  }

  private async initializeDeviceData(): Promise<void> {
    try {
      // Load blocked devices
      const { data: blockedDevices } = await this.supabase
        .from("device_registrations")
        .select("id")
        .eq("is_blocked", true);

      if (blockedDevices) {
        blockedDevices.forEach((device) => this.blockedDevices.add(device.id));
      }
    } catch (error) {
      console.error("Failed to initialize device data:", error);
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    this.deviceCache.clear();
    this.fingerprintCache.clear();
    this.blockedDevices.clear();
    this.removeAllListeners();
  }
}
