/**
 * WebAuthn Service for TASK-002: Multi-Factor Authentication Enhancement
 *
 * Provides WebAuthn/FIDO2 authentication capabilities including:
 * - Passwordless authentication
 * - Multi-factor authentication
 * - Biometric authentication support
 * - Trusted device management
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
          step(generator["throw"](value));
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
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
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
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
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
exports.createwebAuthnService = exports.webAuthnService = void 0;
exports.createWebAuthnService = createWebAuthnService;
var server_1 = require("@simplewebauthn/server");
var server_2 = require("../../app/utils/supabase/server");
var performance_tracker_1 = require("./performance-tracker");
var analytics_1 = require("@/lib/monitoring/analytics");
var WebAuthnService = /** @class */ (() => {
  function WebAuthnService() {
    this.rpName = "NeonPro";
    this.rpID = process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || "localhost";
    this.origin = process.env.NEXT_PUBLIC_WEBAUTHN_ORIGIN || "http://localhost:3000";
  }
  /**
   * Generate registration options for new WebAuthn credential
   */
  WebAuthnService.prototype.generateRegistrationOptions = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, existingCredentials, excludeCredentials, registrationOptions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_2.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("webauthn_credentials")
                .select("credential_id")
                .eq("user_id", options.userId)
                .eq("is_active", true),
            ];
          case 2:
            existingCredentials = _a.sent().data;
            excludeCredentials =
              (existingCredentials === null || existingCredentials === void 0
                ? void 0
                : existingCredentials.map((cred) => ({
                    id: cred.credential_id,
                    type: "public-key",
                  }))) || [];
            return [
              4 /*yield*/,
              (0, server_1.generateRegistrationOptions)({
                rpName: this.rpName,
                rpID: this.rpID,
                userID: options.userId,
                userName: options.userName,
                userDisplayName: options.userDisplayName,
                timeout: 60000,
                attestationType: "none",
                excludeCredentials: excludeCredentials,
                authenticatorSelection: {
                  residentKey: "preferred",
                  userVerification: "preferred",
                  authenticatorAttachment: "platform",
                },
                supportedAlgorithmIDs: [-7, -257], // ES256, RS256
              }),
            ];
          case 3:
            registrationOptions = _a.sent();
            // Store challenge temporarily (in production, use Redis or secure session storage)
            return [
              4 /*yield*/,
              this.storeChallenge(options.userId, registrationOptions.challenge, "registration"),
            ];
          case 4:
            // Store challenge temporarily (in production, use Redis or secure session storage)
            _a.sent();
            // Log analytics
            return [
              4 /*yield*/,
              (0, analytics_1.logAnalyticsEvent)("webauthn_registration_started", {
                userId: options.userId,
                deviceName: options.deviceName,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 5:
            // Log analytics
            _a.sent();
            return [2 /*return*/, registrationOptions];
        }
      });
    });
  };
  /**
   * Verify registration response and store credential
   */
  WebAuthnService.prototype.verifyRegistrationResponse = function (userId, response, deviceName) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        (0, performance_tracker_1.trackMFAVerification)(
          () =>
            __awaiter(this, void 0, void 0, function () {
              var supabase,
                challenge,
                verification,
                _a,
                credentialID,
                credentialPublicKey,
                counter,
                credentialDeviceType,
                credentialBackedUp,
                error;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    return [4 /*yield*/, (0, server_2.createClient)()];
                  case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, this.getChallenge(userId, "registration")];
                  case 2:
                    challenge = _b.sent();
                    if (!challenge) {
                      throw new Error("No registration challenge found");
                    }
                    return [
                      4 /*yield*/,
                      (0, server_1.verifyRegistrationResponse)({
                        response: response,
                        expectedChallenge: challenge,
                        expectedOrigin: this.origin,
                        expectedRPID: this.rpID,
                        requireUserVerification: true,
                      }),
                    ];
                  case 3:
                    verification = _b.sent();
                    if (!(!verification.verified || !verification.registrationInfo))
                      return [3 /*break*/, 5];
                    return [
                      4 /*yield*/,
                      (0, analytics_1.logAnalyticsEvent)("webauthn_registration_failed", {
                        userId: userId,
                        error: "Verification failed",
                        timestamp: new Date().toISOString(),
                      }),
                    ];
                  case 4:
                    _b.sent();
                    throw new Error("WebAuthn registration verification failed");
                  case 5:
                    (_a = verification.registrationInfo),
                      (credentialID = _a.credentialID),
                      (credentialPublicKey = _a.credentialPublicKey),
                      (counter = _a.counter),
                      (credentialDeviceType = _a.credentialDeviceType),
                      (credentialBackedUp = _a.credentialBackedUp);
                    return [
                      4 /*yield*/,
                      supabase.from("webauthn_credentials").insert({
                        user_id: userId,
                        credential_id: credentialID,
                        public_key: credentialPublicKey,
                        counter: counter,
                        device_type: credentialDeviceType,
                        device_name: deviceName,
                        backup_eligible: credentialBackedUp,
                        backup_state: credentialBackedUp,
                        transports: response.response.transports || [],
                      }),
                    ];
                  case 6:
                    error = _b.sent().error;
                    if (error) {
                      throw new Error(
                        "Failed to store WebAuthn credential: ".concat(error.message),
                      );
                    }
                    // Clean up challenge
                    return [4 /*yield*/, this.removeChallenge(userId, "registration")];
                  case 7:
                    // Clean up challenge
                    _b.sent();
                    return [
                      4 /*yield*/,
                      (0, analytics_1.logAnalyticsEvent)("webauthn_registration_success", {
                        userId: userId,
                        deviceName: deviceName,
                        deviceType: credentialDeviceType,
                        timestamp: new Date().toISOString(),
                      }),
                    ];
                  case 8:
                    _b.sent();
                    return [2 /*return*/, verification];
                }
              });
            }),
          {
            userId: userId,
            method: "webauthn",
            additionalData: { deviceName: deviceName, operation: "registration" },
          },
        ),
      ]);
    });
  };
  /**
   * Generate authentication options for WebAuthn login
   */
  WebAuthnService.prototype.generateAuthenticationOptions = function () {
    return __awaiter(this, arguments, void 0, function (options) {
      var supabase, allowCredentials, credentials, authenticationOptions, challengeKey;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_2.createClient)()];
          case 1:
            supabase = _a.sent();
            if (!options.userId) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              supabase
                .from("webauthn_credentials")
                .select("credential_id, transports")
                .eq("user_id", options.userId)
                .eq("is_active", true),
            ];
          case 2:
            credentials = _a.sent().data;
            allowCredentials =
              credentials === null || credentials === void 0
                ? void 0
                : credentials.map((cred) => ({
                    id: cred.credential_id,
                    type: "public-key",
                    transports: cred.transports,
                  }));
            _a.label = 3;
          case 3:
            return [
              4 /*yield*/,
              (0, server_1.generateAuthenticationOptions)({
                timeout: 60000,
                allowCredentials: options.allowCredentials !== false ? allowCredentials : undefined,
                userVerification: "preferred",
                rpID: this.rpID,
              }),
            ];
          case 4:
            authenticationOptions = _a.sent();
            challengeKey = options.userId ? options.userId : "anonymous";
            return [
              4 /*yield*/,
              this.storeChallenge(challengeKey, authenticationOptions.challenge, "authentication"),
            ];
          case 5:
            _a.sent();
            return [
              4 /*yield*/,
              (0, analytics_1.logAnalyticsEvent)("webauthn_authentication_started", {
                userId: options.userId,
                hasAllowCredentials: !!(allowCredentials === null || allowCredentials === void 0
                  ? void 0
                  : allowCredentials.length),
                timestamp: new Date().toISOString(),
              }),
            ];
          case 6:
            _a.sent();
            return [2 /*return*/, authenticationOptions];
        }
      });
    });
  };
  /**
   * Verify authentication response
   */
  WebAuthnService.prototype.verifyAuthenticationResponse = function (response, userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        (0, performance_tracker_1.trackMFAVerification)(
          () =>
            __awaiter(this, void 0, void 0, function () {
              var supabase, credential, challengeKey, challenge, verification;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, (0, server_2.createClient)()];
                  case 1:
                    supabase = _a.sent();
                    return [
                      4 /*yield*/,
                      supabase
                        .from("webauthn_credentials")
                        .select("*")
                        .eq("credential_id", response.id)
                        .eq("is_active", true)
                        .single(),
                    ];
                  case 2:
                    credential = _a.sent().data;
                    if (!credential) {
                      throw new Error("WebAuthn credential not found");
                    }
                    challengeKey = userId || credential.user_id;
                    return [4 /*yield*/, this.getChallenge(challengeKey, "authentication")];
                  case 3:
                    challenge = _a.sent();
                    if (!challenge) {
                      throw new Error("No authentication challenge found");
                    }
                    return [
                      4 /*yield*/,
                      (0, server_1.verifyAuthenticationResponse)({
                        response: response,
                        expectedChallenge: challenge,
                        expectedOrigin: this.origin,
                        expectedRPID: this.rpID,
                        authenticator: {
                          credentialID: credential.credential_id,
                          credentialPublicKey: new Uint8Array(credential.public_key),
                          counter: credential.counter,
                          transports: credential.transports,
                        },
                        requireUserVerification: true,
                      }),
                    ];
                  case 4:
                    verification = _a.sent();
                    if (verification.verified) return [3 /*break*/, 6];
                    return [
                      4 /*yield*/,
                      (0, analytics_1.logAnalyticsEvent)("webauthn_authentication_failed", {
                        userId: credential.user_id,
                        credentialId: credential.credential_id,
                        timestamp: new Date().toISOString(),
                      }),
                    ];
                  case 5:
                    _a.sent();
                    throw new Error("WebAuthn authentication verification failed");
                  case 6:
                    // Update credential counter and last used
                    return [
                      4 /*yield*/,
                      supabase
                        .from("webauthn_credentials")
                        .update({
                          counter: verification.authenticationInfo.newCounter,
                          last_used_at: new Date().toISOString(),
                        })
                        .eq("id", credential.id),
                    ];
                  case 7:
                    // Update credential counter and last used
                    _a.sent();
                    // Clean up challenge
                    return [4 /*yield*/, this.removeChallenge(challengeKey, "authentication")];
                  case 8:
                    // Clean up challenge
                    _a.sent();
                    return [
                      4 /*yield*/,
                      (0, analytics_1.logAnalyticsEvent)("webauthn_authentication_success", {
                        userId: credential.user_id,
                        credentialId: credential.credential_id,
                        deviceType: credential.device_type,
                        timestamp: new Date().toISOString(),
                      }),
                    ];
                  case 9:
                    _a.sent();
                    return [
                      2 /*return*/,
                      {
                        verified: verification.verified,
                        userId: credential.user_id,
                        credentialId: credential.credential_id,
                        authenticationInfo: verification.authenticationInfo,
                      },
                    ];
                }
              });
            }),
          {
            userId:
              userId ||
              (credential === null || credential === void 0 ? void 0 : credential.user_id),
            method: "webauthn",
            additionalData: { operation: "authentication" },
          },
        ),
      ]);
    });
  };
  /**
   * Get user's WebAuthn credentials
   */
  WebAuthnService.prototype.getUserCredentials = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, credentials, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_2.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("webauthn_credentials")
                .select("*")
                .eq("user_id", userId)
                .eq("is_active", true)
                .order("created_at", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (credentials = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch WebAuthn credentials: ".concat(error.message));
            }
            return [2 /*return*/, credentials || []];
        }
      });
    });
  };
  /**
   * Remove a WebAuthn credential
   */
  WebAuthnService.prototype.removeCredential = function (userId, credentialId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_2.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("webauthn_credentials")
                .update({ is_active: false })
                .eq("user_id", userId)
                .eq("credential_id", credentialId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to remove WebAuthn credential: ".concat(error.message));
            }
            return [
              4 /*yield*/,
              (0, analytics_1.logAnalyticsEvent)("webauthn_credential_removed", {
                userId: userId,
                credentialId: credentialId,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 3:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Store challenge temporarily (implement with Redis in production)
   */
  WebAuthnService.prototype.storeChallenge = function (userId, challenge, type) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // For now, using simple in-memory storage
        // In production, use Redis or secure session storage
        if (typeof globalThis !== "undefined") {
          if (!globalThis.webauthnChallenges) {
            globalThis.webauthnChallenges = new Map();
          }
          globalThis.webauthnChallenges.set("".concat(userId, ":").concat(type), {
            challenge: challenge,
            timestamp: Date.now(),
          });
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get stored challenge
   */
  WebAuthnService.prototype.getChallenge = function (userId, type) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, (_a) => {
        if (typeof globalThis !== "undefined" && globalThis.webauthnChallenges) {
          data = globalThis.webauthnChallenges.get("".concat(userId, ":").concat(type));
          if (data && Date.now() - data.timestamp < 300000) {
            // 5 minutes
            return [2 /*return*/, data.challenge];
          }
        }
        return [2 /*return*/, null];
      });
    });
  };
  /**
   * Remove stored challenge
   */
  WebAuthnService.prototype.removeChallenge = function (userId, type) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        if (typeof globalThis !== "undefined" && globalThis.webauthnChallenges) {
          globalThis.webauthnChallenges.delete("".concat(userId, ":").concat(type));
        }
        return [2 /*return*/];
      });
    });
  };
  return WebAuthnService;
})();
exports.webAuthnService = createWebAuthnService();
// Factory function to create WebAuthn service
function createWebAuthnService() {
  return new WebAuthnService();
}
// Export alias for compatibility
exports.createwebAuthnService = createWebAuthnService;
