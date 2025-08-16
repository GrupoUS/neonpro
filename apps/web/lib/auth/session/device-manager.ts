// =====================================================
// Device Manager Service
// Story 1.4: Session Management & Security
// =====================================================

import type { SupabaseClient } from '@supabase/supabase-js';

// Types
export type DeviceRegistration = {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName?: string;
  deviceType?: string;
  browserInfo?: BrowserInfo;
  trusted: boolean;
  lastUsedAt?: Date;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type BrowserInfo = {
  name?: string;
  version?: string;
  os?: string;
  platform?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  colorDepth?: number;
  cookieEnabled?: boolean;
  javaEnabled?: boolean;
  plugins?: string[];
};

export type DeviceInfo = {
  fingerprint: string;
  name?: string;
  type?: string;
  browserInfo?: BrowserInfo;
  trusted?: boolean;
};

export type DeviceValidationResult = {
  isValid: boolean;
  isKnown: boolean;
  isTrusted: boolean;
  registration?: DeviceRegistration;
  riskScore: number;
  riskFactors: string[];
};

export type DeviceTrustUpdate = {
  deviceId: string;
  trusted: boolean;
  reason?: string;
};

// Device Manager Service
export class DeviceManager {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // =====================================================
  // DEVICE REGISTRATION METHODS
  // =====================================================

  /**
   * Register or update a device for a user
   */
  async registerOrUpdateDevice(
    userId: string,
    deviceInfo: DeviceInfo,
    _ipAddress: string,
  ): Promise<DeviceRegistration> {
    // Check if device already exists
    const existingDevice = await this.getDeviceByFingerprint(
      userId,
      deviceInfo.fingerprint,
    );

    if (existingDevice) {
      // Update existing device
      const { data, error } = await this.supabase
        .from('device_registrations')
        .update({
          device_name: deviceInfo.name || existingDevice.deviceName,
          device_type: deviceInfo.type || existingDevice.deviceType,
          browser_info: deviceInfo.browserInfo || existingDevice.browserInfo,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDevice.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update device: ${error.message}`);
      }

      return this.mapDeviceRegistration(data);
    }
    // Register new device
    const { data, error } = await this.supabase
      .from('device_registrations')
      .insert({
        user_id: userId,
        device_fingerprint: deviceInfo.fingerprint,
        device_name: deviceInfo.name,
        device_type: deviceInfo.type,
        browser_info: deviceInfo.browserInfo,
        trusted: deviceInfo.trusted,
        last_used_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register device: ${error.message}`);
    }

    return this.mapDeviceRegistration(data);
  }

  /**
   * Get device by fingerprint for a user
   */
  async getDeviceByFingerprint(
    userId: string,
    fingerprint: string,
  ): Promise<DeviceRegistration | null> {
    try {
      const { data, error } = await this.supabase
        .from('device_registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('device_fingerprint', fingerprint)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get device: ${error.message}`);
      }

      return data ? this.mapDeviceRegistration(data) : null;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(userId: string): Promise<DeviceRegistration[]> {
    try {
      const { data, error } = await this.supabase
        .from('device_registrations')
        .select('*')
        .eq('user_id', userId)
        .order('last_used_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get user devices: ${error.message}`);
      }

      return data.map(this.mapDeviceRegistration);
    } catch (_error) {
      return [];
    }
  }

  // =====================================================
  // DEVICE VALIDATION METHODS
  // =====================================================

  /**
   * Validate device and calculate risk score
   */
  async validateDevice(
    userId: string,
    deviceInfo: DeviceInfo,
    ipAddress: string,
  ): Promise<DeviceValidationResult> {
    try {
      const registration = await this.getDeviceByFingerprint(
        userId,
        deviceInfo.fingerprint,
      );
      const isKnown = Boolean(registration);
      const isTrusted = registration?.trusted;

      // Calculate risk score
      const riskScore = await this.calculateDeviceRiskScore(
        userId,
        deviceInfo,
        ipAddress,
        registration,
      );

      // Determine risk factors
      const riskFactors = await this.identifyRiskFactors(
        userId,
        deviceInfo,
        ipAddress,
        registration,
      );

      return {
        isValid: true,
        isKnown,
        isTrusted,
        registration: registration || undefined,
        riskScore,
        riskFactors,
      };
    } catch (_error) {
      return {
        isValid: false,
        isKnown: false,
        isTrusted: false,
        riskScore: 100,
        riskFactors: ['validation_error'],
      };
    }
  }

  /**
   * Calculate device risk score (0-100, lower is better)
   */
  private async calculateDeviceRiskScore(
    userId: string,
    deviceInfo: DeviceInfo,
    ipAddress: string,
    registration?: DeviceRegistration | null,
  ): Promise<number> {
    let riskScore = 0;

    // New device risk
    if (!registration) {
      riskScore += 30;
    } else if (!registration.trusted) {
      riskScore += 15;
    }

    // Browser fingerprint consistency
    if (registration && deviceInfo.browserInfo) {
      const browserChanges = this.detectBrowserChanges(
        registration.browserInfo,
        deviceInfo.browserInfo,
      );
      riskScore += browserChanges * 5;
    }

    // IP address history
    const ipRisk = await this.calculateIPRisk(userId, ipAddress);
    riskScore += ipRisk;

    // Device usage patterns
    if (registration) {
      const usageRisk = await this.calculateUsagePatternRisk(
        userId,
        registration,
      );
      riskScore += usageRisk;
    }

    // Time-based risk (unusual login times)
    const timeRisk = this.calculateTimeBasedRisk();
    riskScore += timeRisk;

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Identify specific risk factors
   */
  private async identifyRiskFactors(
    userId: string,
    deviceInfo: DeviceInfo,
    ipAddress: string,
    registration?: DeviceRegistration | null,
  ): Promise<string[]> {
    const factors: string[] = [];

    // New device
    if (!registration) {
      factors.push('new_device');
    } else if (!registration.trusted) {
      factors.push('untrusted_device');
    }

    // Browser changes
    if (registration && deviceInfo.browserInfo) {
      const changes = this.detectBrowserChanges(
        registration.browserInfo,
        deviceInfo.browserInfo,
      );
      if (changes > 2) {
        factors.push('browser_fingerprint_changed');
      }
    }

    // IP address risk
    const isNewIP = await this.isNewIPAddress(userId, ipAddress);
    if (isNewIP) {
      factors.push('new_ip_address');
    }

    // Suspicious IP
    const isSuspiciousIP = await this.isSuspiciousIP(ipAddress);
    if (isSuspiciousIP) {
      factors.push('suspicious_ip');
    }

    // Unusual time
    const isUnusualTime = await this.isUnusualLoginTime(userId);
    if (isUnusualTime) {
      factors.push('unusual_login_time');
    }

    // Rapid requests
    const hasRapidRequests = await this.hasRapidLoginAttempts(
      userId,
      ipAddress,
    );
    if (hasRapidRequests) {
      factors.push('rapid_login_attempts');
    }

    return factors;
  }

  // =====================================================
  // DEVICE TRUST MANAGEMENT
  // =====================================================

  /**
   * Update device trust status
   */
  async updateDeviceTrust(
    userId: string,
    deviceId: string,
    trusted: boolean,
    reason?: string,
  ): Promise<DeviceRegistration> {
    const { data, error } = await this.supabase
      .from('device_registrations')
      .update({
        trusted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deviceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update device trust: ${error.message}`);
    }

    // Log the trust change
    await this.logDeviceTrustChange(userId, deviceId, trusted, reason);

    return this.mapDeviceRegistration(data);
  }

  /**
   * Bulk update device trust status
   */
  async bulkUpdateDeviceTrust(
    userId: string,
    updates: DeviceTrustUpdate[],
  ): Promise<DeviceRegistration[]> {
    const results: DeviceRegistration[] = [];

    for (const update of updates) {
      const result = await this.updateDeviceTrust(
        userId,
        update.deviceId,
        update.trusted,
        update.reason,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Remove device registration
   */
  async removeDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('device_registrations')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to remove device: ${error.message}`);
      }

      // Log device removal
      await this.logDeviceRemoval(userId, deviceId);

      return true;
    } catch (_error) {
      return false;
    }
  }

  // =====================================================
  // DEVICE ANALYTICS METHODS
  // =====================================================

  /**
   * Get device usage statistics
   */
  async getDeviceStatistics(userId: string): Promise<{
    totalDevices: number;
    trustedDevices: number;
    activeDevices: number;
    recentDevices: number;
    deviceTypes: Record<string, number>;
    browserTypes: Record<string, number>;
  }> {
    try {
      const devices = await this.getUserDevices(userId);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalDevices = devices.length;
      const trustedDevices = devices.filter((d) => d.trusted).length;
      const activeDevices = devices.filter(
        (d) => d.lastUsedAt && d.lastUsedAt > thirtyDaysAgo,
      ).length;
      const recentDevices = devices.filter(
        (d) => d.lastUsedAt && d.lastUsedAt > sevenDaysAgo,
      ).length;

      // Device type distribution
      const deviceTypes: Record<string, number> = {};
      devices.forEach((device) => {
        const type = device.deviceType || 'unknown';
        deviceTypes[type] = (deviceTypes[type] || 0) + 1;
      });

      // Browser type distribution
      const browserTypes: Record<string, number> = {};
      devices.forEach((device) => {
        const browser = device.browserInfo?.name || 'unknown';
        browserTypes[browser] = (browserTypes[browser] || 0) + 1;
      });

      return {
        totalDevices,
        trustedDevices,
        activeDevices,
        recentDevices,
        deviceTypes,
        browserTypes,
      };
    } catch (_error) {
      return {
        totalDevices: 0,
        trustedDevices: 0,
        activeDevices: 0,
        recentDevices: 0,
        deviceTypes: {},
        browserTypes: {},
      };
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Map database record to DeviceRegistration
   */
  private mapDeviceRegistration(data: any): DeviceRegistration {
    return {
      id: data.id,
      userId: data.user_id,
      deviceFingerprint: data.device_fingerprint,
      deviceName: data.device_name,
      deviceType: data.device_type,
      browserInfo: data.browser_info,
      trusted: data.trusted,
      lastUsedAt: data.last_used_at ? new Date(data.last_used_at) : undefined,
      registeredAt: new Date(data.registered_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Detect browser fingerprint changes
   */
  private detectBrowserChanges(
    oldBrowser?: BrowserInfo,
    newBrowser?: BrowserInfo,
  ): number {
    if (!(oldBrowser && newBrowser)) {
      return 0;
    }

    let changes = 0;
    const fields = [
      'name',
      'version',
      'os',
      'platform',
      'language',
      'timezone',
    ];

    fields.forEach((field) => {
      if (
        oldBrowser[field as keyof BrowserInfo] !==
        newBrowser[field as keyof BrowserInfo]
      ) {
        changes++;
      }
    });

    return changes;
  }

  /**
   * Calculate IP address risk
   */
  private async calculateIPRisk(
    userId: string,
    ipAddress: string,
  ): Promise<number> {
    try {
      // Check if IP is new for this user
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('ip_address')
        .eq('user_id', userId)
        .eq('ip_address', ipAddress)
        .limit(1);

      if (error) {
        return 10; // Default risk for query error
      }

      // New IP adds risk
      if (!data || data.length === 0) {
        return 20;
      }

      return 0;
    } catch (_error) {
      return 10;
    }
  }

  /**
   * Calculate usage pattern risk
   */
  private async calculateUsagePatternRisk(
    userId: string,
    registration: DeviceRegistration,
  ): Promise<number> {
    try {
      // Check how often this device is used
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('created_at')
        .eq('user_id', userId)
        .eq('device_fingerprint', registration.deviceFingerprint)
        .gte(
          'created_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        );

      if (error) {
        return 5;
      }

      const sessionCount = data.length;

      // Infrequent usage adds risk
      if (sessionCount < 3) {
        return 10;
      }

      return 0;
    } catch (_error) {
      return 5;
    }
  }

  /**
   * Calculate time-based risk
   */
  private calculateTimeBasedRisk(): number {
    const now = new Date();
    const hour = now.getHours();

    // Higher risk for unusual hours (late night/early morning)
    if (hour >= 2 && hour <= 5) {
      return 15;
    }
    if (hour >= 23 || hour <= 1) {
      return 10;
    }

    return 0;
  }

  /**
   * Check if IP address is new for user
   */
  private async isNewIPAddress(
    userId: string,
    ipAddress: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('ip_address', ipAddress)
        .limit(1);

      if (error) {
        return true; // Assume new if query fails
      }

      return !data || data.length === 0;
    } catch (_error) {
      return true;
    }
  }

  /**
   * Check if IP address is suspicious
   */
  private async isSuspiciousIP(ipAddress: string): Promise<boolean> {
    try {
      // Check against known suspicious IPs
      const { data, error } = await this.supabase
        .from('session_security_events')
        .select('id')
        .eq('ip_address', ipAddress)
        .in('event_type', ['suspicious_login', 'session_hijack_attempt'])
        .gte(
          'timestamp',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .limit(1);

      if (error) {
        return false;
      }

      return data && data.length > 0;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Check if login time is unusual for user
   */
  private async isUnusualLoginTime(userId: string): Promise<boolean> {
    try {
      const now = new Date();
      const currentHour = now.getHours();

      // Get user's typical login hours from last 30 days
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('created_at')
        .eq('user_id', userId)
        .gte(
          'created_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        );

      if (error || !data || data.length < 5) {
        return false; // Not enough data to determine pattern
      }

      // Calculate typical hours
      const hours = data.map((session) =>
        new Date(session.created_at).getHours(),
      );
      const hourCounts: Record<number, number> = {};

      hours.forEach((hour) => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      // Check if current hour is in top 50% of usage
      const sortedHours = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, Math.ceil(Object.keys(hourCounts).length / 2))
        .map(([hour]) => Number.parseInt(hour, 10));

      return !sortedHours.includes(currentHour);
    } catch (_error) {
      return false;
    }
  }

  /**
   * Check for rapid login attempts
   */
  private async hasRapidLoginAttempts(
    userId: string,
    ipAddress: string,
  ): Promise<boolean> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('ip_address', ipAddress)
        .gte('created_at', fiveMinutesAgo.toISOString());

      if (error) {
        return false;
      }

      return data && data.length > 3;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Log device trust change
   */
  private async logDeviceTrustChange(
    userId: string,
    deviceId: string,
    trusted: boolean,
    reason?: string,
  ): Promise<void> {
    try {
      await this.supabase.from('session_audit_logs').insert({
        user_id: userId,
        action: 'device_trust_updated',
        details: {
          device_id: deviceId,
          trusted,
          reason,
        },
      });
    } catch (_error) {}
  }

  /**
   * Log device removal
   */
  private async logDeviceRemoval(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    try {
      await this.supabase.from('session_audit_logs').insert({
        user_id: userId,
        action: 'device_removed',
        details: {
          device_id: deviceId,
        },
      });
    } catch (_error) {}
  }
}

export default DeviceManager;
