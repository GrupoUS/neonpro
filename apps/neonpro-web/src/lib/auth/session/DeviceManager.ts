/**
 * Device Manager - Device Registration and Trust Management
 *
 * Handles device registration, fingerprinting, trust management,
 * and suspicious activity detection for enhanced security.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import type { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  generateDeviceFingerprint,
  validateUUID,
  removeUndefined,
  parseUserAgent,
} from "./utils";
import type {
  DeviceConfig,
  DeviceData,
  DeviceRegistrationRequest,
  DeviceStats,
  AuthenticationResponse,
} from "./types";

/**
 * Device Manager Class
 *
 * Core device management operations:
 * - Device registration and fingerprinting
 * - Trust management and verification
 * - Suspicious activity detection
 * - Device limits and security controls
 * - Cross-device synchronization support
 */
export class DeviceManager {
  private supabase: SupabaseClient;
  private config: DeviceConfig;

  constructor(config: DeviceConfig) {
    this.config = config;

    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  }

  /**
   * Register or update a device
   */
  async registerDevice(request: DeviceRegistrationRequest): Promise<AuthenticationResponse> {
    try {
      // Validate input
      if (!validateUUID(request.userId)) {
        return {
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Invalid user ID format",
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Generate or validate fingerprint
      const fingerprint =
        request.fingerprint ||
        generateDeviceFingerprint({
          userAgent: request.userAgent,
          screen: request.screen,
          timezone: request.timezone,
          language: request.language,
        });

      // Check if device already exists
      const existingDevice = await this.getDeviceByFingerprint(fingerprint);

      if (existingDevice.success && existingDevice.data) {
        // Update existing device
        return this.updateExistingDevice(existingDevice.data, request);
      }

      // Check device limits for user
      const deviceLimitCheck = await this.checkDeviceLimit(request.userId);
      if (!deviceLimitCheck.success) {
        return deviceLimitCheck;
      }

      // Parse user agent for device info
      const userAgentInfo = parseUserAgent(request.userAgent);

      // Create new device
      const deviceId = crypto.randomUUID();
      const deviceData = removeUndefined({
        id: deviceId,
        user_id: request.userId,
        fingerprint,
        name: request.name,
        type: request.type,
        user_agent: request.userAgent,
        ip_address: request.ipAddress,
        location: request.location ? JSON.stringify(request.location) : null,
        screen_info: request.screen ? JSON.stringify(request.screen) : null,
        timezone: request.timezone,
        language: request.language,
        browser: userAgentInfo.browser,
        os: userAgentInfo.os,
        trusted: false, // New devices start as untrusted
        trust_expires_at: null,
        blocked: false,
        last_seen: new Date().toISOString(),
        last_ip_address: request.ipAddress,
        last_location: request.location ? JSON.stringify(request.location) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const { data, error } = await this.supabase
        .from("devices")
        .insert(deviceData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: "DEVICE_REGISTRATION_FAILED",
            message: "Failed to register device",
            details: { error: error.message },
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Convert to DeviceData format
      const device = this.convertToDeviceData(data);

      // Check for auto-trust conditions
      await this.checkAutoTrustConditions(device);

      return {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEVICE_REGISTRATION_ERROR",
          message: "Internal error registering device",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get device by fingerprint
   */
  async getDeviceByFingerprint(fingerprint: string): Promise<AuthenticationResponse> {
    try {
      const { data, error } = await this.supabase
        .from("devices")
        .select("*")
        .eq("fingerprint", fingerprint)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: "DEVICE_NOT_FOUND",
            message: "Device not found",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const device = this.convertToDeviceData(data);

      return {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "GET_DEVICE_ERROR",
          message: "Error retrieving device",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get device by ID
   */
  async getDevice(deviceId: string): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(deviceId)) {
        return {
          success: false,
          error: {
            code: "INVALID_DEVICE_ID",
            message: "Invalid device ID format",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const { data, error } = await this.supabase
        .from("devices")
        .select("*")
        .eq("id", deviceId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: "DEVICE_NOT_FOUND",
            message: "Device not found",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const device = this.convertToDeviceData(data);

      return {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "GET_DEVICE_ERROR",
          message: "Error retrieving device",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(userId: string): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(userId)) {
        return {
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Invalid user ID format",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const { data, error } = await this.supabase
        .from("devices")
        .select("*")
        .eq("user_id", userId)
        .order("last_seen", { ascending: false });

      if (error) {
        return {
          success: false,
          error: {
            code: "GET_DEVICES_FAILED",
            message: "Failed to retrieve user devices",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const devices = data.map((row) => this.convertToDeviceData(row));

      return {
        success: true,
        data: devices,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "GET_DEVICES_ERROR",
          message: "Error retrieving user devices",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Trust a device
   */
  async trustDevice(deviceId: string, trustDuration?: number): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(deviceId)) {
        return {
          success: false,
          error: {
            code: "INVALID_DEVICE_ID",
            message: "Invalid device ID format",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const duration = trustDuration || this.config.trustDuration;
      const trustExpiresAt = new Date(Date.now() + duration).toISOString();

      const { data, error } = await this.supabase
        .from("devices")
        .update({
          trusted: true,
          trust_expires_at: trustExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deviceId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: "DEVICE_TRUST_FAILED",
            message: "Failed to trust device",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const device = this.convertToDeviceData(data);

      return {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEVICE_TRUST_ERROR",
          message: "Error trusting device",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Revoke device trust
   */
  async revokeDeviceTrust(deviceId: string): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(deviceId)) {
        return {
          success: false,
          error: {
            code: "INVALID_DEVICE_ID",
            message: "Invalid device ID format",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const { data, error } = await this.supabase
        .from("devices")
        .update({
          trusted: false,
          trust_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deviceId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: "DEVICE_TRUST_REVOKE_FAILED",
            message: "Failed to revoke device trust",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const device = this.convertToDeviceData(data);

      return {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEVICE_TRUST_REVOKE_ERROR",
          message: "Error revoking device trust",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Block a device
   */
  async blockDevice(deviceId: string, reason: string): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(deviceId)) {
        return {
          success: false,
          error: {
            code: "INVALID_DEVICE_ID",
            message: "Invalid device ID format",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const { data, error } = await this.supabase
        .from("devices")
        .update({
          blocked: true,
          trusted: false,
          trust_expires_at: null,
          block_reason: reason,
          blocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", deviceId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: "DEVICE_BLOCK_FAILED",
            message: "Failed to block device",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const device = this.convertToDeviceData(data);

      return {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEVICE_BLOCK_ERROR",
          message: "Error blocking device",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Unblock a device
   */
  async unblockDevice(deviceId: string): Promise<AuthenticationResponse> {
    try {
      if (!validateUUID(deviceId)) {
        return {
          success: false,
          error: {
            code: "INVALID_DEVICE_ID",
            message: "Invalid device ID format",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const { data, error } = await this.supabase
        .from("devices")
        .update({
          blocked: false,
          block_reason: null,
          blocked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deviceId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: "DEVICE_UNBLOCK_FAILED",
            message: "Failed to unblock device",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const device = this.convertToDeviceData(data);

      return {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEVICE_UNBLOCK_ERROR",
          message: "Error unblocking device",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Initiate device trust verification
   */
  async initiateDeviceTrust(
    deviceId: string,
    verificationMethod: "email" | "sms",
  ): Promise<AuthenticationResponse> {
    try {
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Store verification code
      const { error } = await this.supabase.from("device_verifications").insert({
        device_id: deviceId,
        verification_code: verificationCode,
        method: verificationMethod,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      });

      if (error) {
        return {
          success: false,
          error: {
            code: "VERIFICATION_INIT_FAILED",
            message: "Failed to initiate device verification",
          },
          timestamp: new Date().toISOString(),
        };
      }

      // TODO: Send verification code via email/SMS
      // This would integrate with your notification service

      return {
        success: true,
        data: {
          verificationMethod,
          expiresAt,
          message: `Verification code sent via ${verificationMethod}`,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "VERIFICATION_INIT_ERROR",
          message: "Error initiating device verification",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Verify device trust with code
   */
  async verifyDeviceTrust(
    deviceId: string,
    verificationCode: string,
  ): Promise<AuthenticationResponse> {
    try {
      // Check verification code
      const { data: verification, error: verifyError } = await this.supabase
        .from("device_verifications")
        .select("*")
        .eq("device_id", deviceId)
        .eq("verification_code", verificationCode)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (verifyError || !verification) {
        return {
          success: false,
          error: {
            code: "INVALID_VERIFICATION_CODE",
            message: "Invalid or expired verification code",
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Trust the device
      const trustResult = await this.trustDevice(deviceId);

      if (!trustResult.success) {
        return trustResult;
      }

      // Clean up verification record
      await this.supabase.from("device_verifications").delete().eq("id", verification.id);

      return {
        success: true,
        data: {
          device: trustResult.data,
          verified: true,
          verifiedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "VERIFICATION_ERROR",
          message: "Error verifying device trust",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Revoke expired trust for all devices
   */
  async revokeExpiredTrust(): Promise<AuthenticationResponse> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("devices")
        .update({
          trusted: false,
          trust_expires_at: null,
          updated_at: now,
        })
        .eq("trusted", true)
        .lt("trust_expires_at", now)
        .select("id");

      if (error) {
        return {
          success: false,
          error: {
            code: "TRUST_REVOKE_FAILED",
            message: "Failed to revoke expired trust",
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: {
          revokedCount: data?.length || 0,
          revokedAt: now,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "TRUST_REVOKE_ERROR",
          message: "Error revoking expired trust",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Clean up inactive devices
   */
  async cleanupInactiveDevices(inactiveDays: number = 90): Promise<AuthenticationResponse> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

      const { data, error } = await this.supabase
        .from("devices")
        .delete()
        .lt("last_seen", cutoffDate.toISOString())
        .select("id");

      if (error) {
        return {
          success: false,
          error: {
            code: "DEVICE_CLEANUP_FAILED",
            message: "Failed to cleanup inactive devices",
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: {
          deletedCount: data?.length || 0,
          cutoffDate: cutoffDate.toISOString(),
          cleanupDate: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEVICE_CLEANUP_ERROR",
          message: "Error cleaning up inactive devices",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(userId: string): Promise<DeviceStats> {
    try {
      const { data: devices, error } = await this.supabase
        .from("devices")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to fetch devices: ${error.message}`);
      }

      const now = new Date();
      const trustedDevices = devices.filter(
        (d) => d.trusted && (!d.trust_expires_at || new Date(d.trust_expires_at) > now),
      );
      const blockedDevices = devices.filter((d) => d.blocked);
      const recentDevices = devices.filter((d) => {
        const lastSeen = new Date(d.last_seen);
        const daysDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      });

      // Group by device type
      const deviceTypes = devices.reduce(
        (acc, device) => {
          const type = device.type || "unknown";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Group by OS
      const operatingSystems = devices.reduce(
        (acc, device) => {
          const os = device.os || "unknown";
          acc[os] = (acc[os] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        total: devices.length,
        trusted: trustedDevices.length,
        blocked: blockedDevices.length,
        recent: recentDevices.length,
        deviceTypes,
        operatingSystems,
        generatedAt: now.toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Error generating device statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Private helper methods
   */
  private async updateExistingDevice(
    existingDevice: DeviceData,
    request: DeviceRegistrationRequest,
  ): Promise<AuthenticationResponse> {
    try {
      const updateData = removeUndefined({
        name: request.name || existingDevice.name,
        ip_address: request.ipAddress,
        location: request.location ? JSON.stringify(request.location) : undefined,
        last_seen: new Date().toISOString(),
        last_ip_address: request.ipAddress,
        last_location: request.location ? JSON.stringify(request.location) : undefined,
        updated_at: new Date().toISOString(),
      });

      const { data, error } = await this.supabase
        .from("devices")
        .update(updateData)
        .eq("id", existingDevice.id)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: "DEVICE_UPDATE_FAILED",
            message: "Failed to update existing device",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const device = this.convertToDeviceData(data);

      return {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEVICE_UPDATE_ERROR",
          message: "Error updating existing device",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkDeviceLimit(userId: string): Promise<AuthenticationResponse> {
    try {
      const { data: devices, error } = await this.supabase
        .from("devices")
        .select("id")
        .eq("user_id", userId);

      if (error) {
        return {
          success: false,
          error: {
            code: "DEVICE_LIMIT_CHECK_FAILED",
            message: "Failed to check device limit",
          },
          timestamp: new Date().toISOString(),
        };
      }

      const deviceCount = devices?.length || 0;

      if (deviceCount >= this.config.maxDevicesPerUser) {
        return {
          success: false,
          error: {
            code: "MAX_DEVICES_EXCEEDED",
            message: `Maximum devices per user (${this.config.maxDevicesPerUser}) exceeded`,
            details: { currentDevices: deviceCount, maxAllowed: this.config.maxDevicesPerUser },
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: { currentDevices: deviceCount, maxAllowed: this.config.maxDevicesPerUser },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DEVICE_LIMIT_CHECK_ERROR",
          message: "Error checking device limit",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkAutoTrustConditions(device: DeviceData): Promise<void> {
    try {
      // Auto-trust if device is from same network as other trusted devices
      if (this.config.autoTrustSameNetwork && device.ipAddress) {
        const { data: trustedDevices } = await this.supabase
          .from("devices")
          .select("ip_address")
          .eq("user_id", device.userId)
          .eq("trusted", true);

        const sameNetworkTrusted = trustedDevices?.some((td) =>
          this.isSameNetwork(device.ipAddress!, td.ip_address),
        );

        if (sameNetworkTrusted) {
          await this.trustDevice(device.id, this.config.trustDuration);
        }
      }
    } catch (error) {
      console.error("Error checking auto-trust conditions:", error);
    }
  }

  private isSameNetwork(ip1: string, ip2: string): boolean {
    // Simple same network check (same /24 subnet)
    const parts1 = ip1.split(".");
    const parts2 = ip2.split(".");

    return (
      parts1.length === 4 &&
      parts2.length === 4 &&
      parts1[0] === parts2[0] &&
      parts1[1] === parts2[1] &&
      parts1[2] === parts2[2]
    );
  }

  private convertToDeviceData(row: any): DeviceData {
    return {
      id: row.id,
      userId: row.user_id,
      fingerprint: row.fingerprint,
      name: row.name,
      type: row.type,
      userAgent: row.user_agent,
      ipAddress: row.ip_address,
      location: row.location ? JSON.parse(row.location) : undefined,
      screen: row.screen_info ? JSON.parse(row.screen_info) : undefined,
      timezone: row.timezone,
      language: row.language,
      browser: row.browser,
      os: row.os,
      trusted: row.trusted,
      trustExpiresAt: row.trust_expires_at,
      blocked: row.blocked,
      blockReason: row.block_reason,
      blockedAt: row.blocked_at,
      lastSeen: row.last_seen,
      lastIpAddress: row.last_ip_address,
      lastLocation: row.last_location ? JSON.parse(row.last_location) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default DeviceManager;
