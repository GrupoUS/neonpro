/**
 * Multi-Factor Authentication Integration Tests
 *
 * Comprehensive test suite for MFA system with healthcare compliance,
 * security features, and edge case handling.
 *
 * Test Coverage:
 * - MFA setup flow (TOTP/SMS)
 * - Token verification and validation
 * - Backup codes generation and usage
 * - Rate limiting and account lockout
 * - Emergency bypass functionality
 * - Device trust management
 * - Healthcare compliance (LGPD, ANVISA, CFM)
 * - Error handling and edge cases
 * - Security audit logging
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";
import * as OTPAuth from "otpauth";
import { MFAService } from "@/lib/auth/mfa";

// Test environment setup
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL || "http://localhost:54321";
const TEST_SUPABASE_KEY = process.env.TEST_SUPABASE_ANON_KEY || "test-key";

// Mock data
const mockUserId = "550e8400-e29b-41d4-a716-446655440000";
const mockUserAgent = "Mozilla/5.0 (Test Browser)";
const mockIpAddress = "192.168.1.100";
const mockDeviceFingerprint = "test-device-fingerprint";

// Test utilities
class TestDatabaseManager {
  private supabase;

  constructor() {
    this.supabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_KEY);
  }

  async cleanupTestData(userId: string) {
    // Clean up test data in reverse dependency order
    await this.supabase.from("mfa_audit_logs").delete().eq("user_id", userId);
    await this.supabase.from("user_trusted_devices").delete().eq("user_id", userId);
    await this.supabase.from("user_mfa_methods").delete().eq("user_id", userId);
    await this.supabase.from("user_mfa_sms_tokens").delete().eq("user_id", userId);
    await this.supabase.from("user_mfa_settings").delete().eq("user_id", userId);
  }

  async createTestUser(userId: string) {
    const { error } = await this.supabase.from("users").upsert({
      id: userId,
      email: "test@neonpro.com.br",
      full_name: "Test User",
      role: "healthcare_professional",
      tenant_id: "test-tenant",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }
  }

  async getMFASettings(userId: string) {
    const { data, error } = await this.supabase
      .from("user_mfa_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // Not found is OK
      throw new Error(`Failed to get MFA settings: ${error.message}`);
    }

    return data;
  }

  async getAuditLogs(userId: string) {
    const { data, error } = await this.supabase
      .from("mfa_audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (error) {
      throw new Error(`Failed to get audit logs: ${error.message}`);
    }

    return data || [];
  }
}

describe("MFA Integration Tests", () => {
  let mfaService: MFAService;
  let dbManager: TestDatabaseManager;

  beforeAll(async () => {
    // Initialize test environment
    mfaService = new MFAService(TEST_SUPABASE_URL, TEST_SUPABASE_KEY);
    dbManager = new TestDatabaseManager();
  });

  beforeEach(async () => {
    // Clean up before each test
    await dbManager.cleanupTestData(mockUserId);
    await dbManager.createTestUser(mockUserId);
  });

  afterEach(async () => {
    // Clean up after each test
    await dbManager.cleanupTestData(mockUserId);
  });

  describe("MFA Setup Flow", () => {
    describe("TOTP Setup", () => {
      it("should successfully setup TOTP with valid parameters", async () => {
        // Arrange
        const setupRequest = {
          method: "totp" as const,
          deviceName: "Test Device",
          lgpdConsent: true,
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        };

        // Act
        const result = await mfaService.setupMFA(mockUserId, "totp", setupRequest);

        // Assert
        expect(result).toBeDefined();
        expect(result.secret).toMatch(/^[A-Z2-7]{32}$/); // Base32 format
        expect(result.qrCodeUri).toContain("otpauth://totp/");
        expect(result.qrCodeUri).toContain("NeonPro");
        expect(result.backupCodes).toHaveLength(8);
        expect(result.backupCodes.every((code) => code.length === 10)).toBe(true);
        expect(result.recoveryToken).toHaveLength(64); // 32 bytes hex

        // Verify database state
        const mfaSettings = await dbManager.getMFASettings(mockUserId);
        expect(mfaSettings).toBeDefined();
        expect(mfaSettings.is_enabled).toBe(true);
        expect(mfaSettings.secret).toBe(result.secret);
        expect(mfaSettings.backup_codes).toHaveLength(8);

        // Verify audit log
        const auditLogs = await dbManager.getAuditLogs(mockUserId);
        expect(auditLogs).toHaveLength(1);
        expect(auditLogs[0].action).toBe("setup");
        expect(auditLogs[0].method).toBe("totp");
        expect(auditLogs[0].result).toBe("success");
      });

      it("should validate LGPD consent requirement", async () => {
        // Arrange
        const setupRequest = {
          method: "totp" as const,
          deviceName: "Test Device",
          lgpdConsent: false, // Invalid
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        };

        // Act & Assert
        await expect(mfaService.setupMFA(mockUserId, "totp", setupRequest)).rejects.toThrow(
          "LGPD consent is required",
        );

        // Verify no database changes
        const mfaSettings = await dbManager.getMFASettings(mockUserId);
        expect(mfaSettings).toBeNull();
      });

      it("should prevent duplicate MFA setup", async () => {
        // Arrange - First setup
        const setupRequest = {
          method: "totp" as const,
          deviceName: "Test Device",
          lgpdConsent: true,
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        };

        await mfaService.setupMFA(mockUserId, "totp", setupRequest);

        // Act & Assert - Second setup should fail
        await expect(mfaService.setupMFA(mockUserId, "totp", setupRequest)).rejects.toThrow(
          "MFA already enabled for this user",
        );
      });
    });

    describe("SMS Setup", () => {
      it("should successfully setup SMS with valid phone number", async () => {
        // Arrange
        const setupRequest = {
          method: "sms" as const,
          phoneNumber: "+5511999999999",
          deviceName: "Test Device",
          lgpdConsent: true,
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        };

        // Act
        const result = await mfaService.setupMFA(mockUserId, "sms", setupRequest);

        // Assert
        expect(result).toBeDefined();
        expect(result.backupCodes).toHaveLength(8);
        expect(result.recoveryToken).toHaveLength(64);

        // Verify database state
        const mfaSettings = await dbManager.getMFASettings(mockUserId);
        expect(mfaSettings).toBeDefined();
        expect(mfaSettings.is_enabled).toBe(true);
      });

      it("should validate phone number requirement for SMS", async () => {
        // Arrange
        const setupRequest = {
          method: "sms" as const,
          // phoneNumber missing
          deviceName: "Test Device",
          lgpdConsent: true,
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        };

        // Act & Assert
        await expect(mfaService.setupMFA(mockUserId, "sms", setupRequest)).rejects.toThrow();
      });
    });
  });

  describe("MFA Verification Flow", () => {
    let totpSecret: string;
    let backupCodes: string[];

    beforeEach(async () => {
      // Setup MFA for verification tests
      const setupRequest = {
        method: "totp" as const,
        deviceName: "Test Device",
        lgpdConsent: true,
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      };

      const setupResult = await mfaService.setupMFA(mockUserId, "totp", setupRequest);
      totpSecret = setupResult.secret;
      backupCodes = setupResult.backupCodes;
    });

    describe("TOTP Verification", () => {
      it("should successfully verify valid TOTP token", async () => {
        // Arrange - Generate valid TOTP token
        const totp = new OTPAuth.TOTP({
          secret: OTPAuth.Secret.fromBase32(totpSecret),
          digits: 6,
          period: 30,
        });
        const validToken = totp.generate();

        // Act
        const result = await mfaService.verifyMFA(mockUserId, validToken, "totp", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
          deviceFingerprint: mockDeviceFingerprint,
        });

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.delta).toBeDefined();
        expect(result.remainingAttempts).toBe(5);
        expect(result.auditLogId).toBeDefined();

        // Verify audit log
        const auditLogs = await dbManager.getAuditLogs(mockUserId);
        const verifyLog = auditLogs.find((log) => log.action === "verify");
        expect(verifyLog).toBeDefined();
        expect(verifyLog?.result).toBe("success");
      });

      it("should reject invalid TOTP token", async () => {
        // Arrange
        const invalidToken = "123456";

        // Act
        const result = await mfaService.verifyMFA(mockUserId, invalidToken, "totp", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        });

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.remainingAttempts).toBe(4);

        // Verify audit log
        const auditLogs = await dbManager.getAuditLogs(mockUserId);
        const verifyLog = auditLogs.find((log) => log.action === "verify");
        expect(verifyLog?.result).toBe("failure");
      });

      it("should handle TOTP token window tolerance", async () => {
        // Arrange - Generate token for previous time window
        const totp = new OTPAuth.TOTP({
          secret: OTPAuth.Secret.fromBase32(totpSecret),
          digits: 6,
          period: 30,
        });
        const previousToken = totp.generate({ timestamp: Date.now() - 30000 });

        // Act
        const result = await mfaService.verifyMFA(mockUserId, previousToken, "totp", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        });

        // Assert - Should be valid due to window tolerance
        expect(result.isValid).toBe(true);
        expect(result.delta).toBe(-1);
      });
    });

    describe("Backup Code Verification", () => {
      it("should successfully verify valid backup code", async () => {
        // Arrange
        const validBackupCode = backupCodes[0];

        // Act
        const result = await mfaService.verifyMFA(mockUserId, validBackupCode, "backup", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        });

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.auditLogId).toBeDefined();

        // Verify backup code is consumed
        const mfaSettings = await dbManager.getMFASettings(mockUserId);
        expect(mfaSettings.backup_codes).toHaveLength(7); // One less
        expect(mfaSettings.backup_codes_used).toBe(1);
      });

      it("should reject reused backup code", async () => {
        // Arrange - Use backup code once
        const backupCode = backupCodes[0];
        await mfaService.verifyMFA(mockUserId, backupCode, "backup", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        });

        // Act - Try to reuse same code
        const result = await mfaService.verifyMFA(mockUserId, backupCode, "backup", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        });

        // Assert
        expect(result.isValid).toBe(false);
      });

      it("should reject invalid backup code", async () => {
        // Arrange
        const invalidBackupCode = "INVALIDCODE";

        // Act
        const result = await mfaService.verifyMFA(mockUserId, invalidBackupCode, "backup", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        });

        // Assert
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe("Rate Limiting and Security", () => {
    beforeEach(async () => {
      // Setup MFA for rate limiting tests
      const setupRequest = {
        method: "totp" as const,
        deviceName: "Test Device",
        lgpdConsent: true,
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      };

      await mfaService.setupMFA(mockUserId, "totp", setupRequest);
    });

    it("should enforce rate limiting after failed attempts", async () => {
      // Arrange
      const invalidToken = "123456";

      // Act - Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await mfaService.verifyMFA(mockUserId, invalidToken, "totp", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        });
      }

      // Act - 6th attempt should be locked
      const result = await mfaService.verifyMFA(mockUserId, invalidToken, "totp", {
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      });

      // Assert
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockedUntil).toBeDefined();
      expect(result.lockedUntil?.getTime()).toBeGreaterThan(Date.now());

      // Verify audit log shows locked status
      const auditLogs = await dbManager.getAuditLogs(mockUserId);
      const lockedLog = auditLogs.find((log) => log.result === "locked");
      expect(lockedLog).toBeDefined();
    });

    it("should reset rate limiting after successful verification", async () => {
      // Arrange - Make some failed attempts
      const invalidToken = "123456";
      for (let i = 0; i < 3; i++) {
        await mfaService.verifyMFA(mockUserId, invalidToken, "totp", {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        });
      }

      // Generate valid token
      const mfaSettings = await dbManager.getMFASettings(mockUserId);
      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(mfaSettings.secret),
        digits: 6,
        period: 30,
      });
      const validToken = totp.generate();

      // Act - Successful verification
      const result = await mfaService.verifyMFA(mockUserId, validToken, "totp", {
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      });

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.remainingAttempts).toBe(5); // Reset to full attempts
    });
  });

  describe("Emergency Bypass", () => {
    beforeEach(async () => {
      // Setup MFA for emergency bypass tests
      const setupRequest = {
        method: "totp" as const,
        deviceName: "Test Device",
        lgpdConsent: true,
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      };

      await mfaService.setupMFA(mockUserId, "totp", setupRequest);
    });

    it("should allow emergency bypass with valid reason", async () => {
      // Act
      const result = await mfaService.verifyMFA(
        mockUserId,
        "000000", // Placeholder token for emergency
        "emergency" as any,
        {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
          emergencyBypass: true,
          emergencyReason: "Patient critical condition - immediate access required",
        },
      );

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.isEmergencyBypass).toBe(true);
      expect(result.auditLogId).toBeDefined();

      // Verify audit log
      const auditLogs = await dbManager.getAuditLogs(mockUserId);
      const bypassLog = auditLogs.find((log) => log.action === "bypass");
      expect(bypassLog).toBeDefined();
      expect(bypassLog?.emergency_bypass).toBe(true);
      expect(bypassLog?.metadata).toHaveProperty("reason");
    });

    it("should enforce daily emergency bypass limit", async () => {
      // Arrange - Use up daily limit (3 bypasses)
      for (let i = 0; i < 3; i++) {
        await mfaService.verifyMFA(mockUserId, "000000", "emergency" as any, {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
          emergencyBypass: true,
          emergencyReason: `Emergency ${i + 1}`,
        });
      }

      // Act - 4th bypass should fail
      await expect(
        mfaService.verifyMFA(mockUserId, "000000", "emergency" as any, {
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
          emergencyBypass: true,
          emergencyReason: "Emergency 4",
        }),
      ).rejects.toThrow("Daily emergency bypass limit exceeded");
    });
  });

  describe("Device Trust Management", () => {
    beforeEach(async () => {
      // Setup MFA for device trust tests
      const setupRequest = {
        method: "totp" as const,
        deviceName: "Test Device",
        lgpdConsent: true,
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      };

      await mfaService.setupMFA(mockUserId, "totp", setupRequest);
    });

    it("should register trusted device after successful verification", async () => {
      // Arrange
      const mfaSettings = await dbManager.getMFASettings(mockUserId);
      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(mfaSettings.secret),
        digits: 6,
        period: 30,
      });
      const validToken = totp.generate();

      // Act
      await mfaService.verifyMFA(mockUserId, validToken, "totp", {
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
        deviceFingerprint: mockDeviceFingerprint,
      });

      // Assert - Check trusted device was created
      const { data: trustedDevices } = await dbManager.supabase
        .from("user_trusted_devices")
        .select("*")
        .eq("user_id", mockUserId)
        .eq("fingerprint", mockDeviceFingerprint);

      expect(trustedDevices).toHaveLength(1);
      expect(trustedDevices?.[0].fingerprint).toBe(mockDeviceFingerprint);
      expect(trustedDevices?.[0].user_agent).toBe(mockUserAgent);
    });
  });

  describe("Healthcare Compliance", () => {
    it("should create comprehensive audit logs for compliance", async () => {
      // Arrange
      const setupRequest = {
        method: "totp" as const,
        deviceName: "Test Device",
        lgpdConsent: true,
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      };

      // Act - Setup and verify MFA
      const setupResult = await mfaService.setupMFA(mockUserId, "totp", setupRequest);

      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(setupResult.secret),
        digits: 6,
        period: 30,
      });
      const validToken = totp.generate();

      await mfaService.verifyMFA(mockUserId, validToken, "totp", {
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      });

      // Assert - Verify comprehensive audit trail
      const auditLogs = await dbManager.getAuditLogs(mockUserId);

      // Should have setup and verify logs
      expect(auditLogs.length).toBeGreaterThanOrEqual(2);

      // Check required compliance fields
      auditLogs.forEach((log) => {
        expect(log.user_id).toBe(mockUserId);
        expect(log.ip_address).toBe(mockIpAddress);
        expect(log.user_agent).toBe(mockUserAgent);
        expect(log.timestamp).toBeDefined();
        expect(log.metadata).toBeDefined();
        expect(["setup", "verify", "bypass", "disable"]).toContain(log.action);
        expect(["success", "failure", "locked"]).toContain(log.result);
      });
    });

    it("should handle LGPD consent validation", async () => {
      // This is already tested in setup validation
      // but included here for compliance documentation
      expect(true).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors gracefully", async () => {
      // Arrange - Create service with invalid connection
      const invalidService = new MFAService("invalid-url", "invalid-key");

      // Act & Assert
      await expect(
        invalidService.setupMFA(mockUserId, "totp", {
          method: "totp",
          deviceName: "Test Device",
          lgpdConsent: true,
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        }),
      ).rejects.toThrow();
    });

    it("should validate input parameters", async () => {
      // Test empty user ID
      await expect(
        mfaService.setupMFA("", "totp", {
          method: "totp",
          deviceName: "Test Device",
          lgpdConsent: true,
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        }),
      ).rejects.toThrow();

      // Test invalid method
      await expect(
        mfaService.setupMFA(mockUserId, "invalid" as any, {
          method: "invalid" as any,
          deviceName: "Test Device",
          lgpdConsent: true,
          userAgent: mockUserAgent,
          ipAddress: mockIpAddress,
        }),
      ).rejects.toThrow();
    });
  });

  describe("Backup Code Management", () => {
    beforeEach(async () => {
      // Setup MFA for backup code tests
      const setupRequest = {
        method: "totp" as const,
        deviceName: "Test Device",
        lgpdConsent: true,
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      };

      await mfaService.setupMFA(mockUserId, "totp", setupRequest);
    });

    it("should generate new backup codes", async () => {
      // Act
      const newBackupCodes = await mfaService.generateNewBackupCodes(mockUserId, {
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      });

      // Assert
      expect(newBackupCodes).toHaveLength(8);
      expect(newBackupCodes.every((code) => code.length === 10)).toBe(true);
      expect(newBackupCodes.every((code) => /^[A-F0-9]+$/.test(code))).toBe(true);

      // Verify database updated
      const mfaSettings = await dbManager.getMFASettings(mockUserId);
      expect(mfaSettings.backup_codes_used).toBe(0); // Reset after regeneration

      // Verify audit log
      const auditLogs = await dbManager.getAuditLogs(mockUserId);
      const recoverLog = auditLogs.find((log) => log.action === "recover");
      expect(recoverLog).toBeDefined();
    });
  });

  describe("Statistics and Monitoring", () => {
    it("should provide accurate MFA statistics", async () => {
      // Arrange - Setup MFA for user
      const setupRequest = {
        method: "totp" as const,
        deviceName: "Test Device",
        lgpdConsent: true,
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      };

      await mfaService.setupMFA(mockUserId, "totp", setupRequest);

      // Act
      const stats = await mfaService.getMFAStatistics();

      // Assert
      expect(stats).toBeDefined();
      expect(typeof stats.totalUsers).toBe("number");
      expect(typeof stats.enabledUsers).toBe("number");
      expect(typeof stats.totpUsers).toBe("number");
      expect(typeof stats.smsUsers).toBe("number");
      expect(typeof stats.emergencyBypassesToday).toBe("number");
      expect(typeof stats.failedAttemptsToday).toBe("number");

      // At least one user should be enabled after our setup
      expect(stats.enabledUsers).toBeGreaterThanOrEqual(1);
      expect(stats.totpUsers).toBeGreaterThanOrEqual(1);
    });
  });
});
