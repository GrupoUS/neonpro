// ============================================================================
// Session Management System - Utilities
// NeonPro - Session Management & Security
// ============================================================================
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
exports.generateSessionToken = generateSessionToken;
exports.generateRefreshToken = generateRefreshToken;
exports.generateDeviceId = generateDeviceId;
exports.hashToken = hashToken;
exports.verifyToken = verifyToken;
exports.generateFingerprintHash = generateFingerprintHash;
exports.compareFingerprintSimilarity = compareFingerprintSimilarity;
exports.extractDeviceType = extractDeviceType;
exports.calculateDistance = calculateDistance;
exports.isLocationSuspicious = isLocationSuspicious;
exports.isPrivateIP = isPrivateIP;
exports.extractCountryFromIP = extractCountryFromIP;
exports.isSuspiciousIP = isSuspiciousIP;
exports.isSessionExpired = isSessionExpired;
exports.needsRenewal = needsRenewal;
exports.calculateSessionDuration = calculateSessionDuration;
exports.getSessionAge = getSessionAge;
exports.isSessionActive = isSessionActive;
exports.calculateSecurityScore = calculateSecurityScore;
exports.detectSessionHijacking = detectSessionHijacking;
exports.encryptData = encryptData;
exports.decryptData = decryptData;
exports.isValidSessionToken = isValidSessionToken;
exports.isValidRefreshToken = isValidRefreshToken;
exports.isValidIP = isValidIP;
exports.isValidUserAgent = isValidUserAgent;
exports.formatDuration = formatDuration;
exports.getTimeUntilExpiration = getTimeUntilExpiration;
exports.isBusinessHours = isBusinessHours;
exports.createRateLimiter = createRateLimiter;
var crypto_1 = require("crypto");
// ============================================================================
// TOKEN UTILITIES
// ============================================================================
/**
 * Generate a secure session token
 */
function generateSessionToken() {
  return (0, crypto_1.randomBytes)(32).toString("hex");
}
/**
 * Generate a secure refresh token
 */
function generateRefreshToken() {
  return (0, crypto_1.randomBytes)(48).toString("hex");
}
/**
 * Generate a secure device ID
 */
function generateDeviceId() {
  return (0, crypto_1.randomBytes)(16).toString("hex");
}
/**
 * Hash a token for storage
 */
function hashToken(token) {
  return (0, crypto_1.createHash)("sha256").update(token).digest("hex");
}
/**
 * Verify a token against its hash
 */
function verifyToken(token, hash) {
  return hashToken(token) === hash;
}
// ============================================================================
// DEVICE FINGERPRINTING
// ============================================================================
/**
 * Generate device fingerprint hash
 */
function generateFingerprintHash(fingerprint) {
  var _a, _b, _c;
  var components = [
    fingerprint.userAgent,
    (_a = fingerprint.screen) === null || _a === void 0 ? void 0 : _a.width,
    (_b = fingerprint.screen) === null || _b === void 0 ? void 0 : _b.height,
    fingerprint.timezone,
    fingerprint.language,
    fingerprint.platform,
    JSON.stringify((_c = fingerprint.plugins) === null || _c === void 0 ? void 0 : _c.sort()),
    fingerprint.canvas,
    fingerprint.webgl,
  ].filter(Boolean);
  return (0, crypto_1.createHash)("sha256").update(components.join("|")).digest("hex");
}
/**
 * Compare device fingerprints
 */
function compareFingerprintSimilarity(fp1, fp2) {
  var _a, _b, _c, _d;
  var matches = 0;
  var total = 0;
  // User Agent similarity
  total++;
  if (fp1.userAgent === fp2.userAgent) matches++;
  // Screen resolution
  total++;
  if (
    ((_a = fp1.screen) === null || _a === void 0 ? void 0 : _a.width) ===
      ((_b = fp2.screen) === null || _b === void 0 ? void 0 : _b.width) &&
    ((_c = fp1.screen) === null || _c === void 0 ? void 0 : _c.height) ===
      ((_d = fp2.screen) === null || _d === void 0 ? void 0 : _d.height)
  ) {
    matches++;
  }
  // Timezone
  total++;
  if (fp1.timezone === fp2.timezone) matches++;
  // Language
  total++;
  if (fp1.language === fp2.language) matches++;
  // Platform
  total++;
  if (fp1.platform === fp2.platform) matches++;
  // Plugins (partial match)
  total++;
  if (fp1.plugins && fp2.plugins) {
    var intersection = fp1.plugins.filter((p) => fp2.plugins.includes(p));
    var union = __spreadArray(
      [],
      new Set(__spreadArray(__spreadArray([], fp1.plugins, true), fp2.plugins, true)),
      true,
    );
    if (intersection.length / union.length > 0.7) matches++;
  }
  // Canvas fingerprint
  total++;
  if (fp1.canvas === fp2.canvas) matches++;
  return matches / total;
}
/**
 * Extract device type from user agent
 */
function extractDeviceType(userAgent) {
  var ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) {
    return "mobile";
  }
  if (/tablet|ipad/.test(ua)) {
    return "tablet";
  }
  if (/windows|macintosh|linux/.test(ua)) {
    return "desktop";
  }
  return "unknown";
}
// ============================================================================
// LOCATION UTILITIES
// ============================================================================
/**
 * Calculate distance between two locations (Haversine formula)
 */
function calculateDistance(loc1, loc2) {
  var R = 6371; // Earth's radius in kilometers
  var dLat = toRadians(loc2.latitude - loc1.latitude);
  var dLon = toRadians(loc2.longitude - loc1.longitude);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.latitude)) *
      Math.cos(toRadians(loc2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
/**
 * Check if location is suspicious based on previous locations
 */
function isLocationSuspicious(
  currentLocation,
  previousLocations,
  timeWindow, // 24 hours
) {
  if (timeWindow === void 0) {
    timeWindow = 24 * 60 * 60 * 1000;
  }
  if (!currentLocation.latitude || !currentLocation.longitude) {
    return false;
  }
  var recentLocations = previousLocations.filter(
    (loc) => Date.now() - new Date(loc.timestamp).getTime() < timeWindow,
  );
  if (recentLocations.length === 0) {
    return false;
  }
  // Check for impossible travel (> 1000 km/h)
  for (var _i = 0, recentLocations_1 = recentLocations; _i < recentLocations_1.length; _i++) {
    var prevLoc = recentLocations_1[_i];
    if (!prevLoc.latitude || !prevLoc.longitude) continue;
    var distance = calculateDistance(
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: prevLoc.latitude, longitude: prevLoc.longitude },
    );
    var timeDiff = (Date.now() - new Date(prevLoc.timestamp).getTime()) / (1000 * 60 * 60); // hours
    var speed = distance / timeDiff;
    if (speed > 1000) {
      // Impossible travel speed
      return true;
    }
  }
  return false;
}
// ============================================================================
// IP UTILITIES
// ============================================================================
/**
 * Check if IP is private/local
 */
function isPrivateIP(ip) {
  var privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];
  return privateRanges.some((range) => range.test(ip));
}
/**
 * Extract country from IP (simplified - in production use GeoIP service)
 */
function extractCountryFromIP(ip) {
  // This is a simplified implementation
  // In production, use a proper GeoIP service like MaxMind
  if (isPrivateIP(ip)) {
    return "LOCAL";
  }
  // Return null for now - implement with actual GeoIP service
  return null;
}
/**
 * Check if IP is in a suspicious range
 */
function isSuspiciousIP(ip) {
  // Known suspicious patterns (simplified)
  var suspiciousPatterns = [/^0\./, /^255\./, /^224\./];
  return suspiciousPatterns.some((pattern) => pattern.test(ip));
}
// ============================================================================
// SESSION UTILITIES
// ============================================================================
/**
 * Check if session is expired
 */
function isSessionExpired(session) {
  return new Date() > new Date(session.expiresAt);
}
/**
 * Check if session needs renewal
 */
function needsRenewal(session, renewalThreshold) {
  if (renewalThreshold === void 0) {
    renewalThreshold = 0.25;
  }
  var now = Date.now();
  var created = new Date(session.createdAt).getTime();
  var expires = new Date(session.expiresAt).getTime();
  var totalDuration = expires - created;
  var remainingTime = expires - now;
  return remainingTime / totalDuration <= renewalThreshold;
}
/**
 * Calculate session duration
 */
function calculateSessionDuration(session) {
  var start = new Date(session.createdAt).getTime();
  var end = session.terminatedAt ? new Date(session.terminatedAt).getTime() : Date.now();
  return end - start;
}
/**
 * Get session age in minutes
 */
function getSessionAge(session) {
  var now = Date.now();
  var created = new Date(session.createdAt).getTime();
  return Math.floor((now - created) / (1000 * 60));
}
/**
 * Check if session is active
 */
function isSessionActive(session) {
  return session.status === "active" && !isSessionExpired(session);
}
// ============================================================================
// SECURITY UTILITIES
// ============================================================================
/**
 * Calculate security score based on various factors
 */
function calculateSecurityScore(factors) {
  var score = 100;
  // Device trust factor
  if (factors.deviceTrusted === false) {
    score -= 30;
  }
  // Location factor
  if (factors.locationSuspicious) {
    score -= 25;
  }
  // IP reputation factor
  if (factors.ipSuspicious) {
    score -= 20;
  }
  // Recent security events
  if (factors.recentSecurityEvents) {
    score -= Math.min(factors.recentSecurityEvents * 10, 30);
  }
  // Session age factor (older sessions are less secure)
  if (factors.sessionAge) {
    var ageHours = factors.sessionAge / 60;
    if (ageHours > 8) {
      score -= Math.min((ageHours - 8) * 2, 20);
    }
  }
  // Fingerprint match factor
  if (factors.fingerprintMatch !== undefined) {
    if (factors.fingerprintMatch < 0.7) {
      score -= (1 - factors.fingerprintMatch) * 40;
    }
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
/**
 * Detect potential session hijacking
 */
function detectSessionHijacking(currentSession, previousSessions) {
  if (previousSessions.length === 0) {
    return false;
  }
  var lastSession = previousSessions[previousSessions.length - 1];
  // Check for sudden IP change
  if (currentSession.ipAddress !== lastSession.ipAddress) {
    // Check if locations are too far apart
    if (currentSession.location && lastSession.location) {
      var distance = calculateDistance(
        {
          latitude: currentSession.location.latitude,
          longitude: currentSession.location.longitude,
        },
        {
          latitude: lastSession.location.latitude,
          longitude: lastSession.location.longitude,
        },
      );
      var timeDiff =
        new Date(currentSession.createdAt).getTime() -
        new Date(lastSession.lastActivityAt).getTime();
      var hours = timeDiff / (1000 * 60 * 60);
      // Impossible travel speed
      if (distance / hours > 1000) {
        return true;
      }
    }
  }
  // Check for device fingerprint mismatch
  var fingerprintSimilarity = compareFingerprintSimilarity(
    currentSession.deviceFingerprint,
    lastSession.deviceFingerprint,
  );
  if (fingerprintSimilarity < 0.5) {
    return true;
  }
  return false;
}
// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================
var ENCRYPTION_ALGORITHM = "aes-256-gcm";
var ENCRYPTION_KEY_LENGTH = 32;
var IV_LENGTH = 16;
var TAG_LENGTH = 16;
/**
 * Encrypt sensitive data
 */
function encryptData(data, key) {
  var keyBuffer = Buffer.from(
    key.padEnd(ENCRYPTION_KEY_LENGTH, "0").slice(0, ENCRYPTION_KEY_LENGTH),
  );
  var iv = (0, crypto_1.randomBytes)(IV_LENGTH);
  var cipher = (0, crypto_1.createCipheriv)(ENCRYPTION_ALGORITHM, keyBuffer, iv);
  var encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  var tag = cipher.getAuthTag();
  // Combine IV, tag, and encrypted data
  return iv.toString("hex") + tag.toString("hex") + encrypted;
}
/**
 * Decrypt sensitive data
 */
function decryptData(encryptedData, key) {
  var keyBuffer = Buffer.from(
    key.padEnd(ENCRYPTION_KEY_LENGTH, "0").slice(0, ENCRYPTION_KEY_LENGTH),
  );
  // Extract IV, tag, and encrypted data
  var iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), "hex");
  var tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), "hex");
  var encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);
  var decipher = (0, crypto_1.createDecipheriv)(ENCRYPTION_ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(tag);
  var decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
/**
 * Validate session token format
 */
function isValidSessionToken(token) {
  return /^[a-f0-9]{64}$/.test(token);
}
/**
 * Validate refresh token format
 */
function isValidRefreshToken(token) {
  return /^[a-f0-9]{96}$/.test(token);
}
/**
 * Validate IP address format
 */
function isValidIP(ip) {
  var ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  var ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
/**
 * Validate user agent format
 */
function isValidUserAgent(userAgent) {
  return userAgent.length > 0 && userAgent.length <= 1000;
}
// ============================================================================
// TIME UTILITIES
// ============================================================================
/**
 * Format duration in human readable format
 */
function formatDuration(milliseconds) {
  var seconds = Math.floor(milliseconds / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  if (days > 0) {
    return ""
      .concat(days, "d ")
      .concat(hours % 24, "h ")
      .concat(minutes % 60, "m");
  } else if (hours > 0) {
    return "".concat(hours, "h ").concat(minutes % 60, "m");
  } else if (minutes > 0) {
    return "".concat(minutes, "m ").concat(seconds % 60, "s");
  } else {
    return "".concat(seconds, "s");
  }
}
/**
 * Get time until expiration
 */
function getTimeUntilExpiration(expiresAt) {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}
/**
 * Check if time is within business hours
 */
function isBusinessHours(date) {
  if (date === void 0) {
    date = new Date();
  }
  var hour = date.getHours();
  var day = date.getDay();
  // Monday to Friday, 8 AM to 6 PM
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
}
// ============================================================================
// RATE LIMITING UTILITIES
// ============================================================================
/**
 * Simple in-memory rate limiter
 */
var RateLimiter = /** @class */ (() => {
  function RateLimiter(maxAttempts, windowMs) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }
  RateLimiter.prototype.isAllowed = function (key) {
    var now = Date.now();
    var record = this.attempts.get(key);
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    if (record.count >= this.maxAttempts) {
      return false;
    }
    record.count++;
    return true;
  };
  RateLimiter.prototype.reset = function (key) {
    this.attempts.delete(key);
  };
  RateLimiter.prototype.getRemainingAttempts = function (key) {
    var record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  };
  return RateLimiter;
})();
exports.RateLimiter = RateLimiter;
/**
 * Create rate limiter instance
 */
function createRateLimiter(maxAttempts, windowMs) {
  return new RateLimiter(maxAttempts, windowMs);
}
