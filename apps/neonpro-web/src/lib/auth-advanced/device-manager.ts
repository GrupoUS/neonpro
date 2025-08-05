// Device Manager Service
// Story 1.4: Session Management & Security Implementation

import type { DEVICE_TRUST_FACTORS, LOCATION_RISK_FACTORS } from "./config";
import type { DeviceInfo, DeviceRegistration, LocationInfo, UserSession } from "./types";

export interface DeviceFingerprint {
  userAgent: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  plugins: string[];
  canvas?: string;
  webgl?: string;
  fonts?: string[];
  audio?: string;
}

export interface DeviceRiskAssessment {
  trustScore: number;
  riskFactors: string[];
  recommendations: string[];
  isBlocked: boolean;
  requiresVerification: boolean;
}

export interface DeviceAnalytics {
  totalDevices: number;
  trustedDevices: number;
  suspiciousDevices: number;
  blockedDevices: number;
  devicesByType: Record<string, number>;
  devicesByLocation: Record<string, number>;
  averageTrustScore: number;
  riskDistribution: Record<string, number>;
}

export class DeviceManager {
  private supabase: any;
  private fingerprintCache: Map<string, DeviceFingerprint> = new Map();
  private trustScoreCache: Map<string, { score: number; timestamp: Date }> = new Map();

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  // Device Registration
  async registerDevice(
    userId: string,
    deviceInfo: DeviceInfo,
    location?: LocationInfo,
  ): Promise<DeviceRegistration> {
    try {
      const fingerprint = await this.generateDeviceFingerprint(deviceInfo);
      const trustScore = await this.calculateDeviceTrustScore(fingerprint, location);
      const riskAssessment = await this.assessDeviceRisk(fingerprint, location);

      const deviceRegistration: Partial<DeviceRegistration> = {
        user_id: userId,
        device_fingerprint: fingerprint.userAgent + fingerprint.platform,
        device_name: this.generateDeviceName(deviceInfo),
        device_type: this.detectDeviceType(deviceInfo),
        browser_name: deviceInfo.browser || "Unknown",
        browser_version: deviceInfo.browserVersion || "Unknown",
        os_name: deviceInfo.os || "Unknown",
        os_version: deviceInfo.osVersion || "Unknown",
        is_mobile: this.isMobileDevice(deviceInfo),
        is_trusted: trustScore >= DEVICE_TRUST_FACTORS.MINIMUM_TRUST_SCORE,
        trust_score: trustScore,
        risk_indicators: riskAssessment.riskFactors,
        last_seen: new Date(),
        location: location,
        fingerprint_data: fingerprint,
        verification_status: riskAssessment.requiresVerification ? "pending" : "verified",
        is_blocked: riskAssessment.isBlocked,
      };

      // Check if device already exists
      const existingDevice = await this.findExistingDevice(
        userId,
        deviceRegistration.device_fingerprint!,
      );

      if (existingDevice) {
        // Update existing device
        const { data, error } = await this.supabase
          .from("device_registrations")
          .update({
            ...deviceRegistration,
            updated_at: new Date(),
          })
          .eq("id", existingDevice.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new device registration
        const { data, error } = await this.supabase
          .from("device_registrations")
          .insert({
            ...deviceRegistration,
            id: `device-${Date.now()}-${Math.random().toString(36).substring(2)}`,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error("Error registering device:", error);
      throw error;
    }
  }

  // Device Validation
  async validateDevice(
    userId: string,
    deviceFingerprint: string,
    currentLocation?: LocationInfo,
  ): Promise<{
    isValid: boolean;
    device?: DeviceRegistration;
    riskAssessment: DeviceRiskAssessment;
  }> {
    try {
      const device = await this.getDeviceByFingerprint(userId, deviceFingerprint);

      if (!device) {
        return {
          isValid: false,
          riskAssessment: {
            trustScore: 0,
            riskFactors: ["unknown_device"],
            recommendations: ["Register device", "Complete verification"],
            isBlocked: true,
            requiresVerification: true,
          },
        };
      }

      // Check if device is blocked
      if (device.is_blocked) {
        return {
          isValid: false,
          device,
          riskAssessment: {
            trustScore: 0,
            riskFactors: ["device_blocked"],
            recommendations: ["Contact administrator"],
            isBlocked: true,
            requiresVerification: false,
          },
        };
      }

      // Assess current risk
      const riskAssessment = await this.assessDeviceRisk(device.fingerprint_data, currentLocation);

      // Update device last seen
      await this.updateDeviceLastSeen(device.id, currentLocation);

      return {
        isValid: !riskAssessment.isBlocked && device.verification_status === "verified",
        device,
        riskAssessment,
      };
    } catch (error) {
      console.error("Error validating device:", error);
      return {
        isValid: false,
        riskAssessment: {
          trustScore: 0,
          riskFactors: ["validation_error"],
          recommendations: ["Try again later"],
          isBlocked: true,
          requiresVerification: true,
        },
      };
    }
  }

  // Device Trust Management
  async updateDeviceTrust(deviceId: string, trustScore: number, reason: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("device_registrations")
        .update({
          trust_score: Math.max(0, Math.min(100, trustScore)),
          is_trusted: trustScore >= DEVICE_TRUST_FACTORS.MINIMUM_TRUST_SCORE,
          updated_at: new Date(),
        })
        .eq("id", deviceId);

      if (error) throw error;

      // Log trust score change
      await this.logDeviceEvent(deviceId, "trust_score_updated", {
        new_score: trustScore,
        reason,
      });
    } catch (error) {
      console.error("Error updating device trust:", error);
      throw error;
    }
  }

  async blockDevice(deviceId: string, reason: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("device_registrations")
        .update({
          is_blocked: true,
          is_trusted: false,
          trust_score: 0,
          updated_at: new Date(),
        })
        .eq("id", deviceId);

      if (error) throw error;

      await this.logDeviceEvent(deviceId, "device_blocked", { reason });
    } catch (error) {
      console.error("Error blocking device:", error);
      throw error;
    }
  }

  async unblockDevice(deviceId: string, reason: string): Promise<void> {
    try {
      // Recalculate trust score
      const device = await this.getDeviceById(deviceId);
      if (!device) throw new Error("Device not found");

      const trustScore = await this.calculateDeviceTrustScore(
        device.fingerprint_data,
        device.location,
      );

      const { error } = await this.supabase
        .from("device_registrations")
        .update({
          is_blocked: false,
          trust_score: trustScore,
          is_trusted: trustScore >= DEVICE_TRUST_FACTORS.MINIMUM_TRUST_SCORE,
          updated_at: new Date(),
        })
        .eq("id", deviceId);

      if (error) throw error;

      await this.logDeviceEvent(deviceId, "device_unblocked", { reason });
    } catch (error) {
      console.error("Error unblocking device:", error);
      throw error;
    }
  }

  // Device Analytics
  async getDeviceAnalytics(userId?: string): Promise<DeviceAnalytics> {
    try {
      let query = this.supabase.from("device_registrations").select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: devices, error } = await query;
      if (error) throw error;

      return this.calculateDeviceAnalytics(devices || []);
    } catch (error) {
      console.error("Error getting device analytics:", error);
      return this.getEmptyAnalytics();
    }
  }

  async getUserDevices(userId: string): Promise<DeviceRegistration[]> {
    try {
      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("user_id", userId)
        .order("last_seen", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting user devices:", error);
      return [];
    }
  }

  // Device Fingerprinting
  async generateDeviceFingerprint(deviceInfo: DeviceInfo): Promise<DeviceFingerprint> {
    const cacheKey = JSON.stringify(deviceInfo);

    if (this.fingerprintCache.has(cacheKey)) {
      return this.fingerprintCache.get(cacheKey)!;
    }

    const fingerprint: DeviceFingerprint = {
      userAgent: deviceInfo.userAgent || "Unknown",
      screen: {
        width: deviceInfo.screenWidth || 0,
        height: deviceInfo.screenHeight || 0,
        colorDepth: deviceInfo.colorDepth || 24,
      },
      timezone: deviceInfo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: deviceInfo.language || navigator.language,
      platform: deviceInfo.platform || "Unknown",
      cookieEnabled: deviceInfo.cookieEnabled ?? true,
      doNotTrack: deviceInfo.doNotTrack ?? false,
      plugins: deviceInfo.plugins || [],
      canvas: deviceInfo.canvasFingerprint,
      webgl: deviceInfo.webglFingerprint,
      fonts: deviceInfo.fonts,
      audio: deviceInfo.audioFingerprint,
    };

    this.fingerprintCache.set(cacheKey, fingerprint);
    return fingerprint;
  }

  // Private Methods
  private async findExistingDevice(
    userId: string,
    deviceFingerprint: string,
  ): Promise<DeviceRegistration | null> {
    try {
      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("user_id", userId)
        .eq("device_fingerprint", deviceFingerprint)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
      return data || null;
    } catch (error) {
      console.error("Error finding existing device:", error);
      return null;
    }
  }

  private async getDeviceByFingerprint(
    userId: string,
    deviceFingerprint: string,
  ): Promise<DeviceRegistration | null> {
    try {
      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("user_id", userId)
        .eq("device_fingerprint", deviceFingerprint)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (error) {
      console.error("Error getting device by fingerprint:", error);
      return null;
    }
  }

  private async getDeviceById(deviceId: string): Promise<DeviceRegistration | null> {
    try {
      const { data, error } = await this.supabase
        .from("device_registrations")
        .select("*")
        .eq("id", deviceId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (error) {
      console.error("Error getting device by ID:", error);
      return null;
    }
  }

  private async calculateDeviceTrustScore(
    fingerprint: DeviceFingerprint,
    location?: LocationInfo,
  ): Promise<number> {
    const cacheKey = JSON.stringify({ fingerprint, location });

    // Check cache
    const cached = this.trustScoreCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < 300000) {
      // 5 minute cache
      return cached.score;
    }

    let score = DEVICE_TRUST_FACTORS.BASE_TRUST_SCORE;

    // Browser consistency
    if (fingerprint.userAgent && fingerprint.userAgent !== "Unknown") {
      score += DEVICE_TRUST_FACTORS.KNOWN_BROWSER_BONUS;
    }

    // Screen resolution consistency
    if (fingerprint.screen.width > 0 && fingerprint.screen.height > 0) {
      score += DEVICE_TRUST_FACTORS.CONSISTENT_SCREEN_BONUS;
    }

    // Plugin consistency
    if (fingerprint.plugins && fingerprint.plugins.length > 0) {
      score += DEVICE_TRUST_FACTORS.PLUGIN_CONSISTENCY_BONUS;
    }

    // Canvas fingerprint (more unique = more trustworthy)
    if (fingerprint.canvas) {
      score += DEVICE_TRUST_FACTORS.CANVAS_FINGERPRINT_BONUS;
    }

    // WebGL fingerprint
    if (fingerprint.webgl) {
      score += DEVICE_TRUST_FACTORS.WEBGL_FINGERPRINT_BONUS;
    }

    // Location factors
    if (location) {
      if (LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(location.country)) {
        score -= 20;
      }

      if (location.isVPN || location.isProxy) {
        score -= 15;
      }
    }

    // Ensure score is within bounds
    const finalScore = Math.max(0, Math.min(100, score));

    // Cache the result
    this.trustScoreCache.set(cacheKey, {
      score: finalScore,
      timestamp: new Date(),
    });

    return finalScore;
  }

  private async assessDeviceRisk(
    fingerprint: DeviceFingerprint,
    location?: LocationInfo,
  ): Promise<DeviceRiskAssessment> {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    const trustScore = await this.calculateDeviceTrustScore(fingerprint, location);

    // Check for suspicious characteristics
    if (!fingerprint.userAgent || fingerprint.userAgent === "Unknown") {
      riskFactors.push("missing_user_agent");
      recommendations.push("Update browser");
    }

    if (fingerprint.screen.width === 0 || fingerprint.screen.height === 0) {
      riskFactors.push("invalid_screen_resolution");
      recommendations.push("Check display settings");
    }

    if (fingerprint.doNotTrack) {
      riskFactors.push("do_not_track_enabled");
    }

    if (!fingerprint.cookieEnabled) {
      riskFactors.push("cookies_disabled");
      recommendations.push("Enable cookies");
    }

    // Location-based risks
    if (location) {
      if (LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(location.country)) {
        riskFactors.push("high_risk_location");
        recommendations.push("Verify identity");
      }

      if (location.isVPN) {
        riskFactors.push("vpn_usage");
        recommendations.push("Disable VPN for verification");
      }

      if (location.isProxy) {
        riskFactors.push("proxy_usage");
        recommendations.push("Disable proxy for verification");
      }
    }

    // Determine if device should be blocked
    const isBlocked = trustScore < 30 || riskFactors.includes("high_risk_location");
    const requiresVerification = trustScore < 60 || riskFactors.length > 2;

    return {
      trustScore,
      riskFactors,
      recommendations,
      isBlocked,
      requiresVerification,
    };
  }

  private generateDeviceName(deviceInfo: DeviceInfo): string {
    const browser = deviceInfo.browser || "Unknown Browser";
    const os = deviceInfo.os || "Unknown OS";
    const deviceType = this.detectDeviceType(deviceInfo);

    return `${browser} on ${os} (${deviceType})`;
  }

  private detectDeviceType(deviceInfo: DeviceInfo): string {
    const userAgent = deviceInfo.userAgent?.toLowerCase() || "";

    if (
      userAgent.includes("mobile") ||
      userAgent.includes("android") ||
      userAgent.includes("iphone")
    ) {
      return "Mobile";
    }

    if (userAgent.includes("tablet") || userAgent.includes("ipad")) {
      return "Tablet";
    }

    return "Desktop";
  }

  private isMobileDevice(deviceInfo: DeviceInfo): boolean {
    return this.detectDeviceType(deviceInfo) === "Mobile";
  }

  private async updateDeviceLastSeen(deviceId: string, location?: LocationInfo): Promise<void> {
    try {
      const updateData: any = {
        last_seen: new Date(),
        updated_at: new Date(),
      };

      if (location) {
        updateData.location = location;
      }

      const { error } = await this.supabase
        .from("device_registrations")
        .update(updateData)
        .eq("id", deviceId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating device last seen:", error);
    }
  }

  private async logDeviceEvent(
    deviceId: string,
    eventType: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("device_events").insert({
        id: `event-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        device_id: deviceId,
        event_type: eventType,
        metadata,
        created_at: new Date(),
      });

      if (error) {
        console.error("Error logging device event:", error);
      }
    } catch (error) {
      console.error("Error logging device event:", error);
    }
  }

  private calculateDeviceAnalytics(devices: DeviceRegistration[]): DeviceAnalytics {
    const analytics: DeviceAnalytics = {
      totalDevices: devices.length,
      trustedDevices: devices.filter((d) => d.is_trusted).length,
      suspiciousDevices: devices.filter((d) => d.risk_indicators && d.risk_indicators.length > 0)
        .length,
      blockedDevices: devices.filter((d) => d.is_blocked).length,
      devicesByType: {},
      devicesByLocation: {},
      averageTrustScore: 0,
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
    };

    if (devices.length === 0) {
      return analytics;
    }

    // Calculate averages and distributions
    let totalTrustScore = 0;

    devices.forEach((device) => {
      // Trust score
      totalTrustScore += device.trust_score;

      // Device type distribution
      const deviceType = device.device_type || "Unknown";
      analytics.devicesByType[deviceType] = (analytics.devicesByType[deviceType] || 0) + 1;

      // Location distribution
      if (device.location?.country) {
        const country = device.location.country;
        analytics.devicesByLocation[country] = (analytics.devicesByLocation[country] || 0) + 1;
      }

      // Risk distribution
      if (device.trust_score >= 80) {
        analytics.riskDistribution.low++;
      } else if (device.trust_score >= 60) {
        analytics.riskDistribution.medium++;
      } else if (device.trust_score >= 30) {
        analytics.riskDistribution.high++;
      } else {
        analytics.riskDistribution.critical++;
      }
    });

    analytics.averageTrustScore = totalTrustScore / devices.length;

    return analytics;
  }

  private getEmptyAnalytics(): DeviceAnalytics {
    return {
      totalDevices: 0,
      trustedDevices: 0,
      suspiciousDevices: 0,
      blockedDevices: 0,
      devicesByType: {},
      devicesByLocation: {},
      averageTrustScore: 0,
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
    };
  }

  // Cleanup Methods
  async cleanupOldDevices(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const { data, error } = await this.supabase
        .from("device_registrations")
        .delete()
        .lt("last_seen", cutoffDate.toISOString())
        .eq("is_trusted", false)
        .select("id");

      if (error) throw error;

      const deletedCount = data?.length || 0;
      console.log(`Cleaned up ${deletedCount} old devices`);

      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up old devices:", error);
      return 0;
    }
  }

  async cleanupBlockedDevices(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const { data, error } = await this.supabase
        .from("device_registrations")
        .delete()
        .lt("updated_at", cutoffDate.toISOString())
        .eq("is_blocked", true)
        .select("id");

      if (error) throw error;

      const deletedCount = data?.length || 0;
      console.log(`Cleaned up ${deletedCount} blocked devices`);

      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up blocked devices:", error);
      return 0;
    }
  }
}
