"use strict";
/**
 * Multi-Factor Authentication (MFA) System for NeonPro Healthcare Platform
 *
 * Features:
 * - TOTP (Time-based One-Time Password) with authenticator apps
 * - SMS-based verification (fallback)
 * - QR code generation for easy setup
 * - Backup codes generation and management
 * - Healthcare compliance (LGPD, ANVISA, CFM)
 * - Rate limiting and account lockout
 * - Device registration and trust
 * - Emergency bypass for clinical emergencies
 * - Comprehensive audit logging
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MFAUtils =
  exports.MFAService =
  exports.MFAVerificationSchema =
  exports.MFASetupSchema =
    void 0;
exports.getMFAService = getMFAService;
var OTPAuth = require("otpauth");
var supabase_js_1 = require("@supabase/supabase-js");
var zod_1 = require("zod");
var crypto_1 = require("crypto");
unknown & gt;
timestamp: Date;
// Validation Schemas
exports.MFASetupSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    method: zod_1.z.enum(['totp', 'sms']),
    phoneNumber: zod_1.z.string().optional(),
    deviceName: zod_1.z.string().min(1, 'Device name is required'),
    lgpdConsent: zod_1.z.boolean().refine(val =  & gt),
    val: val
} === true, 'LGPD consent is required');
exports.MFAVerificationSchema = zod_1.z.object({
  userId: zod_1.z.string().uuid(),
  token: zod_1.z.string().min(6, "Token must be at least 6 characters"),
  method: zod_1.z.enum(["totp", "sms", "backup"]),
  deviceFingerprint: zod_1.z.string().optional(),
  emergencyBypass: zod_1.z.boolean().optional(),
});
// Rate Limiting Configuration
var RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMinutes: 15,
  lockoutMinutes: 30,
  emergencyBypassMaxPerDay: 3,
};
// Default MFA Configuration
var DEFAULT_MFA_CONFIG = {
  issuer: "NeonPro Healthcare",
  label: "NeonPro Account",
  algorithm: "SHA1",
  digits: 6,
  period: 30,
  window: 1,
};
/**
 * Comprehensive MFA Service for Healthcare Platform
 */
var MFAService = /** @class */ (function () {
  function MFAService(supabaseUrl, supabaseKey, config, MFAConfig, , gt) {
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.config = __assign(__assign({}, DEFAULT_MFA_CONFIG), config);
    }
  return MFAService;
})();
exports.MFAService = MFAService;
& gt
{
  try {
    // Validate input
    var validation = exports.MFASetupSchema.parse({
      userId: userId,
      method: method,
      phoneNumber: options.phoneNumber,
      deviceName: options.deviceName,
      lgpdConsent: options.lgpdConsent,
    });
    // Check if user already has MFA enabled
    var existingMFA = await this.getUserMFASettings(userId);
    if (existingMFA === null || existingMFA === void 0 ? void 0 : existingMFA.isEnabled) {
      throw new Error("MFA already enabled for this user");
    }
    // Generate cryptographically secure secret (20 bytes = 160 bits)
    var secret = new OTPAuth.Secret({ size: 20 });
    // Create TOTP instance
    var totp_1 = new OTPAuth.TOTP({
      issuer: this.config.issuer,
      label: "".concat(this.config.label, " (").concat(options.deviceName, ")"),
      algorithm: this.config.algorithm,
      digits: this.config.digits,
      period: this.config.period,
      secret: secret,
    });
    // Generate QR code URI
    var qrCodeUri = totp_1.toString();
    // Generate backup codes (8 codes, 10 characters each)
    var backupCodes = this.generateBackupCodes(8);
    // Generate recovery token
    var recoveryToken = this.generateRecoveryToken();
    // Store MFA configuration in database
    await this.storeMFAConfiguration(userId, {
      secret: secret.base32,
      method: method,
      phoneNumber: options.phoneNumber,
      deviceName: options.deviceName,
      backupCodes: await this.hashBackupCodes(backupCodes),
      recoveryToken: await this.hashRecoveryToken(recoveryToken),
    });
    // Create audit log entry
    await this.createAuditLog({
      userId: userId,
      action: "setup",
      method: method,
      result: "success",
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: {
        deviceName: options.deviceName,
        lgpdConsent: options.lgpdConsent,
        phoneNumber: options.phoneNumber ? "***" + options.phoneNumber.slice(-4) : undefined,
      },
    });
    return {
            secret: secret.base32,
            qrCodeUri: qrCodeUri,
            backupCodes: backupCodes,
            recoveryToken: recoveryToken,
        };
  } catch (error) {
    // Log setup failure
    await this.createAuditLog({
      userId: userId,
      action: "setup",
      method: method,
      result: "failure",
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
} /**
 * Verify MFA token with comprehensive security and healthcare compliance
 */
async;
verifyMFA(userId, string, token, string, method, "totp" | "sms" | "backup", options, {
  deviceFingerprint: string,
  userAgent: string,
  ipAddress: string,
  emergencyBypass: boolean,
  emergencyReason: string,
});
Promise < MFAVerificationResult > {
    try: {
        // Validate input
        const: validation = exports.MFAVerificationSchema.parse({
            userId: userId,
            token: token,
            method: method,
            deviceFingerprint: options.deviceFingerprint,
            emergencyBypass: options.emergencyBypass,
        }),
        // Check rate limiting
        const: rateLimitResult = await this.checkRateLimit(userId, options.ipAddress),
        if: function (rateLimitResult) { },
        : .isLocked
    }
};
{
  await this.createAuditLog({
    userId: userId,
    action: "verify",
    method: method,
    result: "locked",
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    metadata: {
      lockedUntil: rateLimitResult.lockedUntil,
      remainingAttempts: 0,
    },
  });
  return {
        isValid: false,
        remainingAttempts: 0,
        lockedUntil: rateLimitResult.lockedUntil,
        auditLogId: '',
    };
}
// Handle emergency bypass for clinical emergencies
if (options.emergencyBypass) {
  return await this.handleEmergencyBypass(userId, options);
}
// Get user MFA settings
var mfaSettings = await this.getUserMFASettings(userId);
if (!(mfaSettings === null || mfaSettings === void 0 ? void 0 : mfaSettings.isEnabled)) {
  throw new Error("MFA not enabled for this user");
}
var isValid = false;
var delta;
// Verify token based on method
switch (method) {
  case "totp":
    var totpResult = await this.verifyTOTP(userId, token);
    isValid = totpResult.isValid;
    delta = totpResult.delta;
    break;
  case "sms":
    isValid = await this.verifySMS(userId, token);
    break;
  case "backup":
    isValid = await this.verifyBackupCode(userId, token);
    break;
  default:
    throw new Error("Invalid MFA method");
}
// Update rate limiting
await this.updateRateLimit(userId, options.ipAddress, isValid);
// Create audit log
var auditLogId = await this.createAuditLog({
  userId: userId,
  action: "verify",
  method: method,
  result: isValid ? "success" : "failure",
  ipAddress: options.ipAddress,
  userAgent: options.userAgent,
  deviceFingerprint: options.deviceFingerprint,
  metadata: {
    delta: delta,
    remainingAttempts: rateLimitResult.remainingAttempts - 1,
  },
});
// Update trusted device if verification successful
if (isValid && options.deviceFingerprint) {
  await this.updateTrustedDevice(userId, options.deviceFingerprint, options);
}
// Update last verified timestamp
if (isValid) {
  await this.updateLastVerified(userId, method);
}
return {
    isValid: isValid,
    delta: delta,
    remainingAttempts: rateLimitResult.remainingAttempts - 1,
    auditLogId: auditLogId,
};
try {
} catch (error) {
  // Log verification error
  var auditLogId_1 = await this.createAuditLog({
    userId: userId,
    action: "verify",
    method: method,
    result: "failure",
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    metadata: {
      error: error instanceof Error ? error.message : "Unknown error",
    },
  });
  throw error;
}
async;
verifyTOTP(userId, string, token, string);
Promise <
  { isValid: boolean, delta: number } >
  {
    // Get user's TOTP secret from database
    const:
      ((_a = await this.supabase
        .from("user_mfa_settings")
        .select("secret")
        .eq("user_id", userId)
        .eq("method", "totp")
        .single()),
      (mfaData = _a.data),
      (error = _a.error),
      _a),
    if: function (error) {},
  } || !mfaData;
{
  throw new Error("TOTP not configured for this user");
}
// Create TOTP instance with stored secret
var totp = new OTPAuth.TOTP({
  issuer: this.config.issuer,
  label: this.config.label,
  algorithm: this.config.algorithm,
  digits: this.config.digits,
  period: this.config.period,
  secret: OTPAuth.Secret.fromBase32(mfaData.secret),
});
// Validate token with window tolerance
var delta = totp.validate({
  token: token,
  window: this.config.window,
});
return {
    isValid: delta !== null,
    delta: delta !== null && delta !== void 0 ? delta : undefined,
};
async;
verifySMS(userId, string, token, string);
Promise <
  boolean >
  {
    const:
      ((_b = await this.supabase
        .from("user_mfa_sms_tokens")
        .select("token, expires_at")
        .eq("user_id", userId)
        .eq("used", false)
        .single()),
      (smsData = _b.data),
      (error = _b.error),
      _b),
    if: function (error) {},
  } || !smsData;
{
  return false;
}
// Check if token has expired
if (new Date() > new Date(smsData.expires_at)) {
  return false;
}
// Verify token (constant-time comparison)
var isValid = crypto_1.default.timingSafeEqual(Buffer.from(token), Buffer.from(smsData.token));
// Mark token as used if valid
if (isValid) {
  await this.supabase
    .from("user_mfa_sms_tokens")
    .update({ used: true })
    .eq("user_id", userId)
    .eq("token", token);
}
return isValid;
async;
verifyBackupCode(userId, string, code, string);
Promise <
  boolean >
  {
    const:
      ((_c = await this.supabase
        .from("user_mfa_settings")
        .select("backup_codes, backup_codes_used")
        .eq("user_id", userId)
        .single()),
      (mfaData = _c.data),
      (error = _c.error),
      _c),
    if: function (error) {},
  } || !mfaData;
{
  return false;
}
// Hash the provided code
var hashedCode = await this.hashBackupCode(code);
// Check if code exists and hasn't been used
var isValid = mfaData.backup_codes.includes(hashedCode);
if (isValid) {
  // Remove used backup code and increment usage counter
  var updatedBackupCodes = mfaData.backup_codes.filter(function (storedCode) {
    return storedCode !== hashedCode;
  });
  await this.supabase
    .from("user_mfa_settings")
    .update({
      backup_codes: updatedBackupCodes,
      backup_codes_used: mfaData.backup_codes_used + 1,
    })
    .eq("user_id", userId);
}
return isValid;
async;
handleEmergencyBypass(userId, string, options, {
  emergencyReason: string,
  userAgent: string,
  ipAddress: string,
});
Promise < MFAVerificationResult > {
    // Check daily emergency bypass limit
    const: todayStart = new Date(),
    todayStart: todayStart,
    : .setHours(0, 0, 0, 0),
    const: (_d = await this.supabase
        .from('mfa_audit_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('emergency_bypass', true)
        .gte('timestamp', todayStart.toISOString()), bypassCount = _d.data, _d),
    if: function (bypassCount) { }
} && bypassCount.length >= RATE_LIMIT_CONFIG.emergencyBypassMaxPerDay;
{
  throw new Error("Daily emergency bypass limit exceeded");
}
// Create audit log for emergency bypass
var auditLogId = await this.createAuditLog({
  userId: userId,
  action: "bypass",
  method: "emergency",
  result: "success",
  ipAddress: options.ipAddress,
  userAgent: options.userAgent,
  emergencyBypass: true,
  metadata: {
    reason: options.emergencyReason || "Clinical emergency",
    bypassCount:
      ((bypassCount === null || bypassCount === void 0 ? void 0 : bypassCount.length) || 0) + 1,
  },
});
// Send emergency bypass notification
await this.sendEmergencyBypassNotification(userId, options);
return {
    isValid: true,
    remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
    isEmergencyBypass: true,
    auditLogId: auditLogId,
};
/**
 * Send SMS OTP for fallback authentication
 */
async;
sendSMSOTP(userId, string, options, {
  userAgent: string,
  ipAddress: string,
});
Promise < { success: boolean, expiresIn: number } > {
    try: {
        // Get user's phone number
        const: mfaSettings = await this.getUserMFASettings(userId),
        const: smsMethod = mfaSettings === null || mfaSettings === void 0 ? void 0 : mfaSettings.methods.find(function (m) { return m.type === 'sms' && m.isEnabled; }),
        if: function (, smsMethod, phoneNumber) {
            throw new Error('SMS MFA not configured for this user');
        }
        // Generate 6-digit OTP
        ,
        // Generate 6-digit OTP
        const: otp = Math.floor(100000 + Math.random() * 900000).toString(),
        const: expiresAt = new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        // Store OTP in database
        await: await,
        this: .supabase
            .from('user_mfa_sms_tokens')
            .insert({
            user_id: userId,
            token: otp,
            expires_at: expiresAt.toISOString(),
            used: false,
        }),
        // Send SMS via Supabase (or your SMS provider)
        // This would integrate with your SMS service
        await: await,
        this: .sendSMS(smsMethod.phoneNumber, otp),
        // Create audit log
        await: await,
        this: .createAuditLog({
            userId: userId,
            action: 'verify',
            method: 'sms',
            result: 'success',
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            metadata: {
                phoneNumber: '***' + smsMethod.phoneNumber.slice(-4),
                expiresAt: expiresAt.toISOString(),
            },
        }
),
return
:
{
  success: true, expiresIn;
  : 300, // 5 minutes in seconds
}
},
    catch:
function (error) {
        yield this.createAuditLog({
            userId: userId,
            action: 'verify',
            method: 'sms',
            result: 'failure',
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            metadata: {
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        throw error;
    }
}
/**
 * Disable MFA for a user (with proper authorization)
 */
async
disableMFA(userId, string, options, {
  adminUserId: string,
  reason: string,
  userAgent: string,
  ipAddress: string,
});
Promise < { success: boolean } > {
    try: {
        // Verify admin authorization if provided
        if: function (options) { },
        : .adminUserId
    }
};
{
  await this.verifyAdminAuthorization(options.adminUserId, "disable_mfa");
}
// Disable MFA in database
await this.supabase
  .from("user_mfa_settings")
  .update({
    is_enabled: false,
    disabled_at: new Date().toISOString(),
    disabled_reason: options.reason,
    disabled_by: options.adminUserId || userId,
  })
  .eq("user_id", userId);
// Create audit log
await this.createAuditLog({
  userId: userId,
  action: "disable",
  method: "admin",
  result: "success",
  ipAddress: options.ipAddress,
  userAgent: options.userAgent,
  metadata: {
    adminUserId: options.adminUserId,
    reason: options.reason,
  },
});
return { success: true };
try {
} catch (error) {
  await this.createAuditLog({
    userId: userId,
    action: "disable",
    method: "admin",
    result: "failure",
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    metadata: {
      error: error instanceof Error ? error.message : "Unknown error",
    },
  });
  throw error;
}
/**
 * Get MFA settings for a user
 */
async;
getUserMFASettings(userId, string);
(Promise < MFAUserSettings) |
  (null >
    {
      const:
        ((_e = await this.supabase
          .from("user_mfa_settings")
          .select(
            "\n        *,\n        user_mfa_methods(*),\n        user_trusted_devices(*),\n        user_emergency_contacts(*)\n      ",
          )
          .eq("user_id", userId)
          .single()),
        (data = _e.data),
        (error = _e.error),
        _e),
      if: function (error) {},
    }) || !data;
{
  return null;
}
return {
    userId: data.user_id,
    isEnabled: data.is_enabled,
    methods: data.user_mfa_methods || [],
    trustedDevices: data.user_trusted_devices || [],
    emergencyContacts: data.user_emergency_contacts || [],
    backupCodesUsed: data.backup_codes_used || 0,
    lastVerified: new Date(data.last_verified),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
};
generateBackupCodes(count, (number = 8));
string[];
{
  var codes = [];
  for (var i = 0; i < count; i++) {
    // Generate 10-character alphanumeric code
    var code = crypto_1.default.randomBytes(5).toString("hex").toUpperCase();
    codes.push(code);
  }
  return codes;
}
generateRecoveryToken();
string;
{
  return crypto_1.default.randomBytes(32).toString('hex');
}
async;
hashBackupCodes(codes, string[]);
Promise < string[] > (_f = {
        const: hashedCodes,
        string: string
    },
    _f[] =  = [],
    _f.for = function (, code, of, codes) {
        var hash = yield this.hashBackupCode(code);
        hashedCodes.push(hash);
    },
    _f.return = hashedCodes,
    _f
)
async
hashBackupCode(code, string);
Promise <
  string >
  {
    return: crypto_1.default
      .pbkdf2Sync(code, "neonpro-mfa-salt", 100000, 64, "sha512")
      .toString("hex"),
  };
async;
hashRecoveryToken(token, string);
Promise <
  string >
  {
    return: crypto_1.default
      .pbkdf2Sync(token, "neonpro-recovery-salt", 100000, 64, "sha512")
      .toString("hex"),
  };
async;
storeMFAConfiguration(userId, string, config, {
    secret: string,
    method: 'totp' | 'sms',
    phoneNumber: string,
    deviceName: string,
    backupCodes: string[],
    recoveryToken: string
});
Promise < void  > {
    // Begin transaction
    const: (_g = await this.supabase
        .from('user_mfa_settings')
        .insert({
        user_id: userId,
        is_enabled: true,
        secret: config.secret,
        backup_codes: config.backupCodes,
        backup_codes_used: 0,
        recovery_token: config.recoveryToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }), settingsError = _g.error, _g),
    if: function (settingsError) {
        throw new Error("Failed to store MFA settings: ".concat(settingsError.message));
    }
    // Store MFA method
    ,
    // Store MFA method
    const: (_h = await this.supabase
        .from('user_mfa_methods')
        .insert({
        user_id: userId,
        type: config.method,
        name: config.deviceName,
        is_enabled: true,
        is_primary: true,
        phone_number: config.phoneNumber,
        created_at: new Date().toISOString(),
    }), methodError = _h.error, _h),
    if: function (methodError) {
        throw new Error("Failed to store MFA method: ".concat(methodError.message));
    }
};
async;
checkRateLimit(userId, string, ipAddress, string);
Promise < {
    isLocked: boolean,
    remainingAttempts: number,
    lockedUntil: Date
} > {
    const: windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.windowMinutes * 60 * 1000),
    const: (_j = await this.supabase
        .from('mfa_audit_logs')
        .select('result, timestamp')
        .eq('user_id', userId)
        .eq('action', 'verify')
        .gte('timestamp', windowStart.toISOString())
        .order('timestamp', { ascending: false }), attempts = _j.data, _j),
    if: function (, attempts) {
        return { isLocked: false, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts };
    },
    const: failedAttempts = attempts.filter(function (attempt) { return attempt.result === 'failure'; }).length,
    if: function (failedAttempts) { }
} >= RATE_LIMIT_CONFIG.maxAttempts;
{
  var lastFailure = attempts.find(function (attempt) {
    return attempt.result === "failure";
  });
  var lockedUntil = new Date(
    new Date(lastFailure.timestamp).getTime() + RATE_LIMIT_CONFIG.lockoutMinutes * 60 * 1000,
  );
  if (new Date() < lockedUntil) {
    return { isLocked: true, remainingAttempts: 0, lockedUntil: lockedUntil };
  }
}
return {
    isLocked: false,
    remainingAttempts: Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - failedAttempts),
};
async;
updateRateLimit(userId, string, ipAddress, string, success, boolean);
Promise < void  > {
// Rate limiting is handled through audit logs
// This method is placeholder for additional rate limiting logic if needed
};
async;
createAuditLog(log, Omit);
Promise <
  string >
  {
    const:
      ((_k = await this.supabase
        .from("mfa_audit_logs")
        .insert({
          user_id: log.userId,
          action: log.action,
          method: log.method,
          result: log.result,
          ip_address: log.ipAddress,
          user_agent: log.userAgent,
          device_fingerprint: log.deviceFingerprint,
          emergency_bypass: log.emergencyBypass || false,
          metadata: log.metadata,
          timestamp: new Date().toISOString(),
        })
        .select("id")
        .single()),
      (data = _k.data),
      (error = _k.error),
      _k),
    if: function (error) {
      console.error("Failed to create audit log:", error);
      return "";
    },
    return: (data === null || data === void 0 ? void 0 : data.id) || "",
  };
async;
updateTrustedDevice(userId, string, deviceFingerprint, string, options, {
  userAgent: string,
  ipAddress: string,
});
Promise < void  > {
    const: expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    await: await,
    this: .supabase
        .from('user_trusted_devices')
        .upsert({
        user_id: userId,
        fingerprint: deviceFingerprint,
        user_agent: options.userAgent,
        ip_address: options.ipAddress,
        last_seen: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
    })
}
async
updateLastVerified(userId, string, method, string);
Promise < void  > {
    await: await,
    this: .supabase
        .from('user_mfa_settings')
        .update({
        last_verified: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })
        .eq('user_id', userId),
    await
: await,
    this: .supabase
        .from('user_mfa_methods')
        .update(
{
  last_used: new Date().toISOString(),
}
)
        .eq('user_id', userId)
        .eq('type', method)
} /**
 * Send SMS via integrated SMS service
 */
async
sendSMS(phoneNumber, string, otp, string);
Promise < void  > {
    // This would integrate with your SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll use Supabase's built-in SMS functionality
    const: message = "Seu c\u00F3digo de verifica\u00E7\u00E3o NeonPro \u00E9: ".concat(otp, ". V\u00E1lido por 5 minutos. N\u00E3o compartilhe este c\u00F3digo."),
    // In production, implement actual SMS sending
    console: console,
    : .log("SMS to ".concat(phoneNumber, ": ").concat(message))
};
async;
sendEmergencyBypassNotification(userId, string, options, {
  emergencyReason: string,
  userAgent: string,
  ipAddress: string,
});
Promise < void  > {
    // Get user information
    const: (_l = await this.supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single(), user = _l.data, _l),
    if: function (, user) { },
    return: ,
    // Send notification to user and security team
    const: notification = {
        to: user.email,
        subject: 'Alerta de Segurança: Bypass de MFA Utilizado',
        body: "\n        Ol\u00E1 ".concat(user.full_name, ",\n        \n        Um bypass de emerg\u00EAncia foi utilizado em sua conta NeonPro Healthcare.\n        \n        Detalhes:\n        - Data/Hora: ").concat(new Date().toLocaleString('pt-BR'), "\n        - IP: ").concat(options.ipAddress, "\n        - Navegador: ").concat(options.userAgent, "\n        - Motivo: ").concat(options.emergencyReason || 'Emergência clínica', "\n        \n        Se voc\u00EA n\u00E3o realizou esta a\u00E7\u00E3o, entre em contato com o suporte imediatamente.\n        \n        Equipe NeonPro Security\n      "),
    },
    // In production, send actual email notification
    console: console,
    : .log('Emergency bypass notification:', notification)
};
async;
verifyAdminAuthorization(adminUserId, string, operation, string);
Promise < void  > {
    const: (_m = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', adminUserId)
        .in('role', ['admin', 'security_officer'])
        .single(), admin = _m.data, _m),
    if: function (, admin) {
        throw new Error('Insufficient permissions for this operation');
    }
};
/**
 * Generate MFA recovery codes
 */
async;
generateNewBackupCodes(userId, string, options, {
  userAgent: string,
  ipAddress: string,
});
Promise < string[] > {
    try: {
        // Verify MFA is enabled
        const: mfaSettings = await this.getUserMFASettings(userId),
        if: function (, mfaSettings, isEnabled) {
            throw new Error('MFA not enabled for this user');
        }
        // Generate new backup codes
        ,
        // Generate new backup codes
        const: newBackupCodes = this.generateBackupCodes(8),
        const: hashedCodes = await this.hashBackupCodes(newBackupCodes),
        // Update database
        await: await,
        this: .supabase
            .from('user_mfa_settings')
            .update({
            backup_codes: hashedCodes,
            backup_codes_used: 0,
            updated_at: new Date().toISOString(),
        })
            .eq('user_id', userId),
        // Create audit log
        await: await,
        this: .createAuditLog({
            userId: userId,
            action: 'recover',
            method: 'backup',
            result: 'success',
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            metadata: {
                codesGenerated: newBackupCodes.length,
            },
        }
),
return
: newBackupCodes
    },
    catch:
function (error) {
        yield this.createAuditLog({
            userId: userId,
            action: 'recover',
            method: 'backup',
            result: 'failure',
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            metadata: {
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        throw error;
    }
}
/**
 * Get MFA statistics for dashboard/monitoring
 */
async
getMFAStatistics(userId ?  : string);
Promise < {
    totalUsers: number,
    enabledUsers: number,
    totpUsers: number,
    smsUsers: number,
    emergencyBypassesToday: number,
    failedAttemptsToday: number
} > {
    const: todayStart = new Date(),
    todayStart: todayStart,
    : .setHours(0, 0, 0, 0),
    const: queries = await Promise.all([
        // Total users
        this.supabase.from('users').select('id', { count: 'exact', head: true }),
        // Enabled MFA users
        this.supabase
            .from('user_mfa_settings')
            .select('user_id', { count: 'exact', head: true })
            .eq('is_enabled', true),
        // TOTP users
        this.supabase
            .from('user_mfa_methods')
            .select('user_id', { count: 'exact', head: true })
            .eq('type', 'totp')
            .eq('is_enabled', true),
        // SMS users
        this.supabase
            .from('user_mfa_methods')
            .select('user_id', { count: 'exact', head: true })
            .eq('type', 'sms')
            .eq('is_enabled', true),
        // Emergency bypasses today
        this.supabase
            .from('mfa_audit_logs')
            .select('id', { count: 'exact', head: true })
            .eq('emergency_bypass', true)
            .gte('timestamp', todayStart.toISOString()),
        // Failed attempts today
        this.supabase
            .from('mfa_audit_logs')
            .select('id', { count: 'exact', head: true })
            .eq('action', 'verify')
            .eq('result', 'failure')
            .gte('timestamp', todayStart.toISOString()),
    ]),
    return: {
        totalUsers: queries[0].count || 0,
        enabledUsers: queries[1].count || 0,
        totpUsers: queries[2].count || 0,
        smsUsers: queries[3].count || 0,
        emergencyBypassesToday: queries[4].count || 0,
        failedAttemptsToday: queries[5].count || 0,
    }
};
// Default MFA service instance
var mfaServiceInstance = null;
/**
 * Get singleton MFA service instance
 */
function getMFAService() {
  if (!mfaServiceInstance) {
    var supabaseUrl = process.env.SUPABASE_URL;
    var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    mfaServiceInstance = new MFAService(supabaseUrl, supabaseKey);
  }
  return mfaServiceInstance;
}
// Utility functions for client-side use
exports.MFAUtils = {
  /**
   * Generate QR code data URL for display
   */
  generateQRCodeDataURL: function (uri) {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would use a QR code library like 'qrcode'
        // For now, return the URI - implement QR generation in the component
        return [2 /*return*/, uri];
      });
    });
  },
  /**
   * Format backup codes for display
   */
  formatBackupCodes: function (codes) {
    return codes.map(function (code) {
      return code.replace(/(.{4})(.{4})(.{2})/, "$1-$2-$3");
    });
  },
  /**
   * Validate token format
   */
  validateToken: function (token, method) {
    switch (method) {
      case "totp":
        return /^\d{6}$/.test(token);
      case "sms":
        return /^\d{6}$/.test(token);
      case "backup":
        return /^[A-F0-9]{10}$/i.test(token.replace(/-/g, ""));
      default:
        return false;
    }
  },
};
exports.default = MFAService;
