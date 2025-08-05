// Device Manager Tests
// Story 1.4: Session Management & Security Implementation

import type { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { DeviceManager } from "../device-manager";
import type { DeviceInfo, DeviceRegistration } from "../types";

describe("DeviceManager", () => {
  let deviceManager: DeviceManager;

  beforeEach(() => {
    deviceManager = new DeviceManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registerDevice", () => {
    it("should register a new device successfully", async () => {
      const deviceRegistration: DeviceRegistration = {
        userId: "user123",
        name: "iPhone 13",
        type: "mobile",
        platform: "iOS",
        fingerprint: "abc123def456",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const deviceId = await deviceManager.registerDevice(deviceRegistration);

      expect(deviceId).toBeDefined();
      expect(typeof deviceId).toBe("string");
      expect(deviceId.length).toBeGreaterThan(0);
    });

    it("should reject duplicate device fingerprints for same user", async () => {
      const deviceRegistration: DeviceRegistration = {
        userId: "user123",
        name: "iPhone 13",
        type: "mobile",
        platform: "iOS",
        fingerprint: "duplicate123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      // Register first device
      await deviceManager.registerDevice(deviceRegistration);

      // Try to register duplicate
      await expect(deviceManager.registerDevice(deviceRegistration)).rejects.toThrow(
        "Device already registered",
      );
    });

    it("should allow same fingerprint for different users", async () => {
      const deviceRegistration1: DeviceRegistration = {
        userId: "user123",
        name: "iPhone 13",
        type: "mobile",
        platform: "iOS",
        fingerprint: "shared123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const deviceRegistration2: DeviceRegistration = {
        ...deviceRegistration1,
        userId: "user456",
      };

      const deviceId1 = await deviceManager.registerDevice(deviceRegistration1);
      const deviceId2 = await deviceManager.registerDevice(deviceRegistration2);

      expect(deviceId1).toBeDefined();
      expect(deviceId2).toBeDefined();
      expect(deviceId1).not.toBe(deviceId2);
    });
  });

  describe("getDevice", () => {
    it("should retrieve an existing device", async () => {
      const deviceRegistration: DeviceRegistration = {
        userId: "user123",
        name: "MacBook Pro",
        type: "desktop",
        platform: "macOS",
        fingerprint: "mac123def456",
        ipAddress: "192.168.1.2",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const deviceId = await deviceManager.registerDevice(deviceRegistration);
      const device = await deviceManager.getDevice(deviceId);

      expect(device).toBeDefined();
      expect(device?.id).toBe(deviceId);
      expect(device?.userId).toBe("user123");
      expect(device?.name).toBe("MacBook Pro");
      expect(device?.trusted).toBe(false); // Default value
      expect(device?.blocked).toBe(false); // Default value
    });

    it("should return null for non-existent device", async () => {
      const device = await deviceManager.getDevice("non-existent");
      expect(device).toBeNull();
    });
  });

  describe("getUserDevices", () => {
    it("should return all devices for a user", async () => {
      const userId = "user123";

      const device1: DeviceRegistration = {
        userId,
        name: "iPhone 13",
        type: "mobile",
        platform: "iOS",
        fingerprint: "iphone123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const device2: DeviceRegistration = {
        userId,
        name: "MacBook Pro",
        type: "desktop",
        platform: "macOS",
        fingerprint: "macbook123",
        ipAddress: "192.168.1.2",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      await deviceManager.registerDevice(device1);
      await deviceManager.registerDevice(device2);

      const devices = await deviceManager.getUserDevices(userId);

      expect(devices).toHaveLength(2);
      expect(devices.every((d) => d.userId === userId)).toBe(true);
    });

    it("should return empty array for user with no devices", async () => {
      const devices = await deviceManager.getUserDevices("user-no-devices");
      expect(devices).toHaveLength(0);
    });
  });

  describe("validateDevice", () => {
    it("should validate device with correct fingerprint", async () => {
      const deviceRegistration: DeviceRegistration = {
        userId: "user123",
        name: "Test Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "test123fingerprint",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const deviceId = await deviceManager.registerDevice(deviceRegistration);
      const isValid = await deviceManager.validateDevice(deviceId, "test123fingerprint");

      expect(isValid).toBe(true);
    });

    it("should reject device with incorrect fingerprint", async () => {
      const deviceRegistration: DeviceRegistration = {
        userId: "user123",
        name: "Test Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "correct123fingerprint",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const deviceId = await deviceManager.registerDevice(deviceRegistration);
      const isValid = await deviceManager.validateDevice(deviceId, "wrong123fingerprint");

      expect(isValid).toBe(false);
    });

    it("should reject validation for non-existent device", async () => {
      const isValid = await deviceManager.validateDevice("non-existent", "any-fingerprint");
      expect(isValid).toBe(false);
    });
  });

  describe("updateDeviceTrust", () => {
    it("should update device trust status", async () => {
      const deviceRegistration: DeviceRegistration = {
        userId: "user123",
        name: "Test Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "trust123test",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const deviceId = await deviceManager.registerDevice(deviceRegistration);

      // Initially not trusted
      let device = await deviceManager.getDevice(deviceId);
      expect(device?.trusted).toBe(false);

      // Update to trusted
      const success = await deviceManager.updateDeviceTrust(deviceId, true, "User verified");
      expect(success).toBe(true);

      // Verify trust status updated
      device = await deviceManager.getDevice(deviceId);
      expect(device?.trusted).toBe(true);
    });

    it("should return false for non-existent device", async () => {
      const success = await deviceManager.updateDeviceTrust("non-existent", true, "Test");
      expect(success).toBe(false);
    });
  });

  describe("blockDevice", () => {
    it("should block and unblock device", async () => {
      const deviceRegistration: DeviceRegistration = {
        userId: "user123",
        name: "Test Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "block123test",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const deviceId = await deviceManager.registerDevice(deviceRegistration);

      // Initially not blocked
      let device = await deviceManager.getDevice(deviceId);
      expect(device?.blocked).toBe(false);

      // Block device
      let success = await deviceManager.blockDevice(deviceId, true, "Suspicious activity");
      expect(success).toBe(true);

      // Verify blocked status
      device = await deviceManager.getDevice(deviceId);
      expect(device?.blocked).toBe(true);

      // Unblock device
      success = await deviceManager.blockDevice(deviceId, false, "False positive");
      expect(success).toBe(true);

      // Verify unblocked status
      device = await deviceManager.getDevice(deviceId);
      expect(device?.blocked).toBe(false);
    });

    it("should return false for non-existent device", async () => {
      const success = await deviceManager.blockDevice("non-existent", true, "Test");
      expect(success).toBe(false);
    });
  });

  describe("removeDevice", () => {
    it("should remove device successfully", async () => {
      const deviceRegistration: DeviceRegistration = {
        userId: "user123",
        name: "Test Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "remove123test",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const deviceId = await deviceManager.registerDevice(deviceRegistration);

      // Verify device exists
      let device = await deviceManager.getDevice(deviceId);
      expect(device).toBeDefined();

      // Remove device
      const success = await deviceManager.removeDevice(deviceId);
      expect(success).toBe(true);

      // Verify device no longer exists
      device = await deviceManager.getDevice(deviceId);
      expect(device).toBeNull();
    });

    it("should return false for non-existent device", async () => {
      const success = await deviceManager.removeDevice("non-existent");
      expect(success).toBe(false);
    });
  });

  describe("calculateTrustScore", () => {
    it("should calculate trust score for new device", async () => {
      const device: DeviceInfo = {
        id: "device123",
        userId: "user123",
        name: "Test Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "trust123score",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        trusted: false,
        blocked: false,
        registeredAt: new Date(),
        lastSeen: new Date(),
        sessionCount: 0,
        metadata: {},
      };

      const trustScore = await deviceManager.calculateTrustScore(device);

      expect(trustScore).toBeGreaterThanOrEqual(0);
      expect(trustScore).toBeLessThanOrEqual(1);
    });

    it("should give higher trust score to established devices", async () => {
      const newDevice: DeviceInfo = {
        id: "device123",
        userId: "user123",
        name: "New Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "new123device",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        trusted: false,
        blocked: false,
        registeredAt: new Date(),
        lastSeen: new Date(),
        sessionCount: 1,
        metadata: {},
      };

      const establishedDevice: DeviceInfo = {
        ...newDevice,
        id: "device456",
        name: "Established Device",
        fingerprint: "established123device",
        registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        sessionCount: 50,
        trusted: true,
      };

      const newScore = await deviceManager.calculateTrustScore(newDevice);
      const establishedScore = await deviceManager.calculateTrustScore(establishedDevice);

      expect(establishedScore).toBeGreaterThan(newScore);
    });

    it("should give lower trust score to blocked devices", async () => {
      const normalDevice: DeviceInfo = {
        id: "device123",
        userId: "user123",
        name: "Normal Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "normal123device",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        trusted: false,
        blocked: false,
        registeredAt: new Date(),
        lastSeen: new Date(),
        sessionCount: 10,
        metadata: {},
      };

      const blockedDevice: DeviceInfo = {
        ...normalDevice,
        id: "device456",
        name: "Blocked Device",
        fingerprint: "blocked123device",
        blocked: true,
      };

      const normalScore = await deviceManager.calculateTrustScore(normalDevice);
      const blockedScore = await deviceManager.calculateTrustScore(blockedDevice);

      expect(blockedScore).toBeLessThan(normalScore);
    });
  });

  describe("generateFingerprint", () => {
    it("should generate consistent fingerprints for same input", () => {
      const deviceInfo = {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        screen: { width: 1920, height: 1080 },
        timezone: "America/New_York",
        language: "en-US",
        platform: "Win32",
        plugins: ["Chrome PDF Plugin", "Chrome PDF Viewer"],
      };

      const fingerprint1 = deviceManager.generateFingerprint(deviceInfo);
      const fingerprint2 = deviceManager.generateFingerprint(deviceInfo);

      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toBeDefined();
      expect(typeof fingerprint1).toBe("string");
      expect(fingerprint1.length).toBeGreaterThan(0);
    });

    it("should generate different fingerprints for different inputs", () => {
      const deviceInfo1 = {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        screen: { width: 1920, height: 1080 },
        timezone: "America/New_York",
        language: "en-US",
        platform: "Win32",
        plugins: ["Chrome PDF Plugin"],
      };

      const deviceInfo2 = {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        screen: { width: 1440, height: 900 },
        timezone: "America/Los_Angeles",
        language: "en-US",
        platform: "MacIntel",
        plugins: ["Safari PDF Plugin"],
      };

      const fingerprint1 = deviceManager.generateFingerprint(deviceInfo1);
      const fingerprint2 = deviceManager.generateFingerprint(deviceInfo2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });

  describe("getDeviceAnalytics", () => {
    it("should return device analytics", async () => {
      const analytics = await deviceManager.getDeviceAnalytics({
        period: "30d",
        userId: "user123",
      });

      expect(analytics).toBeDefined();
      expect(typeof analytics.totalDevices).toBe("number");
      expect(typeof analytics.trustedDevices).toBe("number");
      expect(typeof analytics.blockedDevices).toBe("number");
      expect(typeof analytics.averageTrustScore).toBe("number");
      expect(Array.isArray(analytics.devicesByType)).toBe(true);
      expect(Array.isArray(analytics.devicesByPlatform)).toBe(true);
      expect(Array.isArray(analytics.registrationTrend)).toBe(true);
      expect(Array.isArray(analytics.locationDistribution)).toBe(true);
    });

    it("should filter analytics by user when specified", async () => {
      // Register devices for different users
      const device1: DeviceRegistration = {
        userId: "user123",
        name: "User 1 Device",
        type: "mobile",
        platform: "iOS",
        fingerprint: "user1device",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      const device2: DeviceRegistration = {
        userId: "user456",
        name: "User 2 Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "user2device",
        ipAddress: "192.168.1.2",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      };

      await deviceManager.registerDevice(device1);
      await deviceManager.registerDevice(device2);

      const user1Analytics = await deviceManager.getDeviceAnalytics({
        period: "30d",
        userId: "user123",
      });

      const allAnalytics = await deviceManager.getDeviceAnalytics({
        period: "30d",
      });

      expect(user1Analytics.totalDevices).toBeLessThanOrEqual(allAnalytics.totalDevices);
    });
  });
});
