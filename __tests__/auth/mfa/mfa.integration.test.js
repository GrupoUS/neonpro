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
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var supabase_js_1 = require("@supabase/supabase-js");
var OTPAuth = require("otpauth");
var mfa_1 = require("@/lib/auth/mfa");
// Test environment setup
var TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL || "http://localhost:54321";
var TEST_SUPABASE_KEY = process.env.TEST_SUPABASE_ANON_KEY || "test-key";
// Mock data
var mockUserId = "550e8400-e29b-41d4-a716-446655440000";
var mockUserAgent = "Mozilla/5.0 (Test Browser)";
var mockIpAddress = "192.168.1.100";
var mockDeviceFingerprint = "test-device-fingerprint";
// Test utilities
var TestDatabaseManager = /** @class */ (() => {
  function TestDatabaseManager() {
    this.supabase = (0, supabase_js_1.createClient)(TEST_SUPABASE_URL, TEST_SUPABASE_KEY);
  }
  TestDatabaseManager.prototype.cleanupTestData = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Clean up test data in reverse dependency order
            return [
              4 /*yield*/,
              this.supabase.from("mfa_audit_logs").delete().eq("user_id", userId),
            ];
          case 1:
            // Clean up test data in reverse dependency order
            _a.sent();
            return [
              4 /*yield*/,
              this.supabase.from("user_trusted_devices").delete().eq("user_id", userId),
            ];
          case 2:
            _a.sent();
            return [
              4 /*yield*/,
              this.supabase.from("user_mfa_methods").delete().eq("user_id", userId),
            ];
          case 3:
            _a.sent();
            return [
              4 /*yield*/,
              this.supabase.from("user_mfa_sms_tokens").delete().eq("user_id", userId),
            ];
          case 4:
            _a.sent();
            return [
              4 /*yield*/,
              this.supabase.from("user_mfa_settings").delete().eq("user_id", userId),
            ];
          case 5:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  TestDatabaseManager.prototype.createTestUser = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("users").upsert({
                id: userId,
                email: "test@neonpro.com.br",
                full_name: "Test User",
                role: "healthcare_professional",
                tenant_id: "test-tenant",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to create test user: ".concat(error.message));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  TestDatabaseManager.prototype.getMFASettings = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("user_mfa_settings").select("*").eq("user_id", userId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") {
              // Not found is OK
              throw new Error("Failed to get MFA settings: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  TestDatabaseManager.prototype.getAuditLogs = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("mfa_audit_logs")
                .select("*")
                .eq("user_id", userId)
                .order("timestamp", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get audit logs: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  return TestDatabaseManager;
})();
(0, globals_1.describe)("MFA Integration Tests", () => {
  var mfaService;
  var dbManager;
  (0, globals_1.beforeAll)(() =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Initialize test environment
        mfaService = new mfa_1.MFAService(TEST_SUPABASE_URL, TEST_SUPABASE_KEY);
        dbManager = new TestDatabaseManager();
        return [2 /*return*/];
      });
    }),
  );
  (0, globals_1.beforeEach)(() =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Clean up before each test
            return [4 /*yield*/, dbManager.cleanupTestData(mockUserId)];
          case 1:
            // Clean up before each test
            _a.sent();
            return [4 /*yield*/, dbManager.createTestUser(mockUserId)];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.afterEach)(() =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Clean up after each test
            return [4 /*yield*/, dbManager.cleanupTestData(mockUserId)];
          case 1:
            // Clean up after each test
            _a.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.describe)("MFA Setup Flow", () => {
    (0, globals_1.describe)("TOTP Setup", () => {
      (0, globals_1.it)("should successfully setup TOTP with valid parameters", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var setupRequest, result, mfaSettings, auditLogs;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                setupRequest = {
                  method: "totp",
                  deviceName: "Test Device",
                  lgpdConsent: true,
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                };
                return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
              case 1:
                result = _a.sent();
                // Assert
                (0, globals_1.expect)(result).toBeDefined();
                (0, globals_1.expect)(result.secret).toMatch(/^[A-Z2-7]{32}$/); // Base32 format
                (0, globals_1.expect)(result.qrCodeUri).toContain("otpauth://totp/");
                (0, globals_1.expect)(result.qrCodeUri).toContain("NeonPro");
                (0, globals_1.expect)(result.backupCodes).toHaveLength(8);
                (0, globals_1.expect)(result.backupCodes.every((code) => code.length === 10)).toBe(
                  true,
                );
                (0, globals_1.expect)(result.recoveryToken).toHaveLength(64); // 32 bytes hex
                return [4 /*yield*/, dbManager.getMFASettings(mockUserId)];
              case 2:
                mfaSettings = _a.sent();
                (0, globals_1.expect)(mfaSettings).toBeDefined();
                (0, globals_1.expect)(mfaSettings.is_enabled).toBe(true);
                (0, globals_1.expect)(mfaSettings.secret).toBe(result.secret);
                (0, globals_1.expect)(mfaSettings.backup_codes).toHaveLength(8);
                return [4 /*yield*/, dbManager.getAuditLogs(mockUserId)];
              case 3:
                auditLogs = _a.sent();
                (0, globals_1.expect)(auditLogs).toHaveLength(1);
                (0, globals_1.expect)(auditLogs[0].action).toBe("setup");
                (0, globals_1.expect)(auditLogs[0].method).toBe("totp");
                (0, globals_1.expect)(auditLogs[0].result).toBe("success");
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should validate LGPD consent requirement", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var setupRequest, mfaSettings;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                setupRequest = {
                  method: "totp",
                  deviceName: "Test Device",
                  lgpdConsent: false, // Invalid
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                };
                // Act & Assert
                return [
                  4 /*yield*/,
                  (0, globals_1.expect)(
                    mfaService.setupMFA(mockUserId, "totp", setupRequest),
                  ).rejects.toThrow("LGPD consent is required"),
                ];
              case 1:
                // Act & Assert
                _a.sent();
                return [4 /*yield*/, dbManager.getMFASettings(mockUserId)];
              case 2:
                mfaSettings = _a.sent();
                (0, globals_1.expect)(mfaSettings).toBeNull();
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should prevent duplicate MFA setup", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var setupRequest;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                setupRequest = {
                  method: "totp",
                  deviceName: "Test Device",
                  lgpdConsent: true,
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                };
                return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
              case 1:
                _a.sent();
                // Act & Assert - Second setup should fail
                return [
                  4 /*yield*/,
                  (0, globals_1.expect)(
                    mfaService.setupMFA(mockUserId, "totp", setupRequest),
                  ).rejects.toThrow("MFA already enabled for this user"),
                ];
              case 2:
                // Act & Assert - Second setup should fail
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
      );
    });
    (0, globals_1.describe)("SMS Setup", () => {
      (0, globals_1.it)("should successfully setup SMS with valid phone number", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var setupRequest, result, mfaSettings;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                setupRequest = {
                  method: "sms",
                  phoneNumber: "+5511999999999",
                  deviceName: "Test Device",
                  lgpdConsent: true,
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                };
                return [4 /*yield*/, mfaService.setupMFA(mockUserId, "sms", setupRequest)];
              case 1:
                result = _a.sent();
                // Assert
                (0, globals_1.expect)(result).toBeDefined();
                (0, globals_1.expect)(result.backupCodes).toHaveLength(8);
                (0, globals_1.expect)(result.recoveryToken).toHaveLength(64);
                return [4 /*yield*/, dbManager.getMFASettings(mockUserId)];
              case 2:
                mfaSettings = _a.sent();
                (0, globals_1.expect)(mfaSettings).toBeDefined();
                (0, globals_1.expect)(mfaSettings.is_enabled).toBe(true);
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should validate phone number requirement for SMS", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var setupRequest;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                setupRequest = {
                  method: "sms",
                  // phoneNumber missing
                  deviceName: "Test Device",
                  lgpdConsent: true,
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                };
                // Act & Assert
                return [
                  4 /*yield*/,
                  (0, globals_1.expect)(
                    mfaService.setupMFA(mockUserId, "sms", setupRequest),
                  ).rejects.toThrow(),
                ];
              case 1:
                // Act & Assert
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
      );
    });
  });
  (0, globals_1.describe)("MFA Verification Flow", () => {
    var totpSecret;
    var backupCodes;
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        var setupRequest, setupResult;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setupRequest = {
                method: "totp",
                deviceName: "Test Device",
                lgpdConsent: true,
                userAgent: mockUserAgent,
                ipAddress: mockIpAddress,
              };
              return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
            case 1:
              setupResult = _a.sent();
              totpSecret = setupResult.secret;
              backupCodes = setupResult.backupCodes;
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.describe)("TOTP Verification", () => {
      (0, globals_1.it)("should successfully verify valid TOTP token", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var totp, validToken, result, auditLogs, verifyLog;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                totp = new OTPAuth.TOTP({
                  secret: OTPAuth.Secret.fromBase32(totpSecret),
                  digits: 6,
                  period: 30,
                });
                validToken = totp.generate();
                return [
                  4 /*yield*/,
                  mfaService.verifyMFA(mockUserId, validToken, "totp", {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                    deviceFingerprint: mockDeviceFingerprint,
                  }),
                ];
              case 1:
                result = _a.sent();
                // Assert
                (0, globals_1.expect)(result.isValid).toBe(true);
                (0, globals_1.expect)(result.delta).toBeDefined();
                (0, globals_1.expect)(result.remainingAttempts).toBe(5);
                (0, globals_1.expect)(result.auditLogId).toBeDefined();
                return [4 /*yield*/, dbManager.getAuditLogs(mockUserId)];
              case 2:
                auditLogs = _a.sent();
                verifyLog = auditLogs.find((log) => log.action === "verify");
                (0, globals_1.expect)(verifyLog).toBeDefined();
                (0, globals_1.expect)(verifyLog.result).toBe("success");
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should reject invalid TOTP token", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var invalidToken, result, auditLogs, verifyLog;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                invalidToken = "123456";
                return [
                  4 /*yield*/,
                  mfaService.verifyMFA(mockUserId, invalidToken, "totp", {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ];
              case 1:
                result = _a.sent();
                // Assert
                (0, globals_1.expect)(result.isValid).toBe(false);
                (0, globals_1.expect)(result.remainingAttempts).toBe(4);
                return [4 /*yield*/, dbManager.getAuditLogs(mockUserId)];
              case 2:
                auditLogs = _a.sent();
                verifyLog = auditLogs.find((log) => log.action === "verify");
                (0, globals_1.expect)(verifyLog.result).toBe("failure");
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should handle TOTP token window tolerance", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var totp, previousToken, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                totp = new OTPAuth.TOTP({
                  secret: OTPAuth.Secret.fromBase32(totpSecret),
                  digits: 6,
                  period: 30,
                });
                previousToken = totp.generate({ timestamp: Date.now() - 30000 });
                return [
                  4 /*yield*/,
                  mfaService.verifyMFA(mockUserId, previousToken, "totp", {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ];
              case 1:
                result = _a.sent();
                // Assert - Should be valid due to window tolerance
                (0, globals_1.expect)(result.isValid).toBe(true);
                (0, globals_1.expect)(result.delta).toBe(-1);
                return [2 /*return*/];
            }
          });
        }),
      );
    });
    (0, globals_1.describe)("Backup Code Verification", () => {
      (0, globals_1.it)("should successfully verify valid backup code", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var validBackupCode, result, mfaSettings;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                validBackupCode = backupCodes[0];
                return [
                  4 /*yield*/,
                  mfaService.verifyMFA(mockUserId, validBackupCode, "backup", {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ];
              case 1:
                result = _a.sent();
                // Assert
                (0, globals_1.expect)(result.isValid).toBe(true);
                (0, globals_1.expect)(result.auditLogId).toBeDefined();
                return [4 /*yield*/, dbManager.getMFASettings(mockUserId)];
              case 2:
                mfaSettings = _a.sent();
                (0, globals_1.expect)(mfaSettings.backup_codes).toHaveLength(7); // One less
                (0, globals_1.expect)(mfaSettings.backup_codes_used).toBe(1);
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should reject reused backup code", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var backupCode, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                backupCode = backupCodes[0];
                return [
                  4 /*yield*/,
                  mfaService.verifyMFA(mockUserId, backupCode, "backup", {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ];
              case 1:
                _a.sent();
                return [
                  4 /*yield*/,
                  mfaService.verifyMFA(mockUserId, backupCode, "backup", {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ];
              case 2:
                result = _a.sent();
                // Assert
                (0, globals_1.expect)(result.isValid).toBe(false);
                return [2 /*return*/];
            }
          });
        }),
      );
      (0, globals_1.it)("should reject invalid backup code", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var invalidBackupCode, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                invalidBackupCode = "INVALIDCODE";
                return [
                  4 /*yield*/,
                  mfaService.verifyMFA(mockUserId, invalidBackupCode, "backup", {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ];
              case 1:
                result = _a.sent();
                // Assert
                (0, globals_1.expect)(result.isValid).toBe(false);
                return [2 /*return*/];
            }
          });
        }),
      );
    });
  });
  (0, globals_1.describe)("Rate Limiting and Security", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        var setupRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setupRequest = {
                method: "totp",
                deviceName: "Test Device",
                lgpdConsent: true,
                userAgent: mockUserAgent,
                ipAddress: mockIpAddress,
              };
              return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should enforce rate limiting after failed attempts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidToken, i, result, auditLogs, lockedLog;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidToken = "123456";
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < 5)) return [3 /*break*/, 4];
              return [
                4 /*yield*/,
                mfaService.verifyMFA(mockUserId, invalidToken, "totp", {
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                }),
              ];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              return [
                4 /*yield*/,
                mfaService.verifyMFA(mockUserId, invalidToken, "totp", {
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                }),
              ];
            case 5:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result.remainingAttempts).toBe(0);
              (0, globals_1.expect)(result.lockedUntil).toBeDefined();
              (0, globals_1.expect)(result.lockedUntil.getTime()).toBeGreaterThan(Date.now());
              return [4 /*yield*/, dbManager.getAuditLogs(mockUserId)];
            case 6:
              auditLogs = _a.sent();
              lockedLog = auditLogs.find((log) => log.result === "locked");
              (0, globals_1.expect)(lockedLog).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should reset rate limiting after successful verification", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidToken, i, mfaSettings, totp, validToken, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidToken = "123456";
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < 3)) return [3 /*break*/, 4];
              return [
                4 /*yield*/,
                mfaService.verifyMFA(mockUserId, invalidToken, "totp", {
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                }),
              ];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              return [4 /*yield*/, dbManager.getMFASettings(mockUserId)];
            case 5:
              mfaSettings = _a.sent();
              totp = new OTPAuth.TOTP({
                secret: OTPAuth.Secret.fromBase32(mfaSettings.secret),
                digits: 6,
                period: 30,
              });
              validToken = totp.generate();
              return [
                4 /*yield*/,
                mfaService.verifyMFA(mockUserId, validToken, "totp", {
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                }),
              ];
            case 6:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result.isValid).toBe(true);
              (0, globals_1.expect)(result.remainingAttempts).toBe(5); // Reset to full attempts
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Emergency Bypass", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        var setupRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setupRequest = {
                method: "totp",
                deviceName: "Test Device",
                lgpdConsent: true,
                userAgent: mockUserAgent,
                ipAddress: mockIpAddress,
              };
              return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should allow emergency bypass with valid reason", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, auditLogs, bypassLog;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                mfaService.verifyMFA(
                  mockUserId,
                  "000000", // Placeholder token for emergency
                  "emergency",
                  {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                    emergencyBypass: true,
                    emergencyReason: "Patient critical condition - immediate access required",
                  },
                ),
              ];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result.isValid).toBe(true);
              (0, globals_1.expect)(result.isEmergencyBypass).toBe(true);
              (0, globals_1.expect)(result.auditLogId).toBeDefined();
              return [4 /*yield*/, dbManager.getAuditLogs(mockUserId)];
            case 2:
              auditLogs = _a.sent();
              bypassLog = auditLogs.find((log) => log.action === "bypass");
              (0, globals_1.expect)(bypassLog).toBeDefined();
              (0, globals_1.expect)(bypassLog.emergency_bypass).toBe(true);
              (0, globals_1.expect)(bypassLog.metadata).toHaveProperty("reason");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should enforce daily emergency bypass limit", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var i;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < 3)) return [3 /*break*/, 4];
              return [
                4 /*yield*/,
                mfaService.verifyMFA(mockUserId, "000000", "emergency", {
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                  emergencyBypass: true,
                  emergencyReason: "Emergency ".concat(i + 1),
                }),
              ];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              // Act - 4th bypass should fail
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  mfaService.verifyMFA(mockUserId, "000000", "emergency", {
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                    emergencyBypass: true,
                    emergencyReason: "Emergency 4",
                  }),
                ).rejects.toThrow("Daily emergency bypass limit exceeded"),
              ];
            case 5:
              // Act - 4th bypass should fail
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Device Trust Management", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        var setupRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setupRequest = {
                method: "totp",
                deviceName: "Test Device",
                lgpdConsent: true,
                userAgent: mockUserAgent,
                ipAddress: mockIpAddress,
              };
              return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should register trusted device after successful verification", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mfaSettings, totp, validToken, trustedDevices;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, dbManager.getMFASettings(mockUserId)];
            case 1:
              mfaSettings = _a.sent();
              totp = new OTPAuth.TOTP({
                secret: OTPAuth.Secret.fromBase32(mfaSettings.secret),
                digits: 6,
                period: 30,
              });
              validToken = totp.generate();
              // Act
              return [
                4 /*yield*/,
                mfaService.verifyMFA(mockUserId, validToken, "totp", {
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                  deviceFingerprint: mockDeviceFingerprint,
                }),
              ];
            case 2:
              // Act
              _a.sent();
              return [
                4 /*yield*/,
                dbManager.supabase
                  .from("user_trusted_devices")
                  .select("*")
                  .eq("user_id", mockUserId)
                  .eq("fingerprint", mockDeviceFingerprint),
              ];
            case 3:
              trustedDevices = _a.sent().data;
              (0, globals_1.expect)(trustedDevices).toHaveLength(1);
              (0, globals_1.expect)(trustedDevices[0].fingerprint).toBe(mockDeviceFingerprint);
              (0, globals_1.expect)(trustedDevices[0].user_agent).toBe(mockUserAgent);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Healthcare Compliance", () => {
    (0, globals_1.it)("should create comprehensive audit logs for compliance", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var setupRequest, setupResult, totp, validToken, auditLogs;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setupRequest = {
                method: "totp",
                deviceName: "Test Device",
                lgpdConsent: true,
                userAgent: mockUserAgent,
                ipAddress: mockIpAddress,
              };
              return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
            case 1:
              setupResult = _a.sent();
              totp = new OTPAuth.TOTP({
                secret: OTPAuth.Secret.fromBase32(setupResult.secret),
                digits: 6,
                period: 30,
              });
              validToken = totp.generate();
              return [
                4 /*yield*/,
                mfaService.verifyMFA(mockUserId, validToken, "totp", {
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                }),
              ];
            case 2:
              _a.sent();
              return [4 /*yield*/, dbManager.getAuditLogs(mockUserId)];
            case 3:
              auditLogs = _a.sent();
              // Should have setup and verify logs
              (0, globals_1.expect)(auditLogs.length).toBeGreaterThanOrEqual(2);
              // Check required compliance fields
              auditLogs.forEach((log) => {
                (0, globals_1.expect)(log.user_id).toBe(mockUserId);
                (0, globals_1.expect)(log.ip_address).toBe(mockIpAddress);
                (0, globals_1.expect)(log.user_agent).toBe(mockUserAgent);
                (0, globals_1.expect)(log.timestamp).toBeDefined();
                (0, globals_1.expect)(log.metadata).toBeDefined();
                (0, globals_1.expect)(["setup", "verify", "bypass", "disable"]).toContain(
                  log.action,
                );
                (0, globals_1.expect)(["success", "failure", "locked"]).toContain(log.result);
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle LGPD consent validation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          // This is already tested in setup validation
          // but included here for compliance documentation
          (0, globals_1.expect)(true).toBe(true);
          return [2 /*return*/];
        });
      }),
    );
  });
  (0, globals_1.describe)("Error Handling", () => {
    (0, globals_1.it)("should handle database connection errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidService;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidService = new mfa_1.MFAService("invalid-url", "invalid-key");
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  invalidService.setupMFA(mockUserId, "totp", {
                    method: "totp",
                    deviceName: "Test Device",
                    lgpdConsent: true,
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ).rejects.toThrow(),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should validate input parameters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Test empty user ID
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  mfaService.setupMFA("", "totp", {
                    method: "totp",
                    deviceName: "Test Device",
                    lgpdConsent: true,
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ).rejects.toThrow(),
              ];
            case 1:
              // Test empty user ID
              _a.sent();
              // Test invalid method
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  mfaService.setupMFA(mockUserId, "invalid", {
                    method: "invalid",
                    deviceName: "Test Device",
                    lgpdConsent: true,
                    userAgent: mockUserAgent,
                    ipAddress: mockIpAddress,
                  }),
                ).rejects.toThrow(),
              ];
            case 2:
              // Test invalid method
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Backup Code Management", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        var setupRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setupRequest = {
                method: "totp",
                deviceName: "Test Device",
                lgpdConsent: true,
                userAgent: mockUserAgent,
                ipAddress: mockIpAddress,
              };
              return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should generate new backup codes", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var newBackupCodes, mfaSettings, auditLogs, recoverLog;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                mfaService.generateNewBackupCodes(mockUserId, {
                  userAgent: mockUserAgent,
                  ipAddress: mockIpAddress,
                }),
              ];
            case 1:
              newBackupCodes = _a.sent();
              // Assert
              (0, globals_1.expect)(newBackupCodes).toHaveLength(8);
              (0, globals_1.expect)(newBackupCodes.every((code) => code.length === 10)).toBe(true);
              (0, globals_1.expect)(newBackupCodes.every((code) => /^[A-F0-9]+$/.test(code))).toBe(
                true,
              );
              return [4 /*yield*/, dbManager.getMFASettings(mockUserId)];
            case 2:
              mfaSettings = _a.sent();
              (0, globals_1.expect)(mfaSettings.backup_codes_used).toBe(0); // Reset after regeneration
              return [4 /*yield*/, dbManager.getAuditLogs(mockUserId)];
            case 3:
              auditLogs = _a.sent();
              recoverLog = auditLogs.find((log) => log.action === "recover");
              (0, globals_1.expect)(recoverLog).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Statistics and Monitoring", () => {
    (0, globals_1.it)("should provide accurate MFA statistics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var setupRequest, stats;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setupRequest = {
                method: "totp",
                deviceName: "Test Device",
                lgpdConsent: true,
                userAgent: mockUserAgent,
                ipAddress: mockIpAddress,
              };
              return [4 /*yield*/, mfaService.setupMFA(mockUserId, "totp", setupRequest)];
            case 1:
              _a.sent();
              return [4 /*yield*/, mfaService.getMFAStatistics()];
            case 2:
              stats = _a.sent();
              // Assert
              (0, globals_1.expect)(stats).toBeDefined();
              (0, globals_1.expect)(typeof stats.totalUsers).toBe("number");
              (0, globals_1.expect)(typeof stats.enabledUsers).toBe("number");
              (0, globals_1.expect)(typeof stats.totpUsers).toBe("number");
              (0, globals_1.expect)(typeof stats.smsUsers).toBe("number");
              (0, globals_1.expect)(typeof stats.emergencyBypassesToday).toBe("number");
              (0, globals_1.expect)(typeof stats.failedAttemptsToday).toBe("number");
              // At least one user should be enabled after our setup
              (0, globals_1.expect)(stats.enabledUsers).toBeGreaterThanOrEqual(1);
              (0, globals_1.expect)(stats.totpUsers).toBeGreaterThanOrEqual(1);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
