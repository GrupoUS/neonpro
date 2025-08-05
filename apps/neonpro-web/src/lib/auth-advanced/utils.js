"use strict";
// Authentication Utilities
// Story 1.4: Session Management & Security Implementation
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUtils = exports.CryptoUtils = exports.ValidationUtils = exports.FormatUtils = exports.SecurityEventUtils = exports.LocationUtils = exports.DeviceUtils = exports.SessionValidation = void 0;
var config_1 = require("./config");
// Session Validation Utilities
exports.SessionValidation = {
    /**
     * Check if a session is still valid based on expiration and activity
     */
    isSessionValid: function (session) {
        var now = new Date();
        var expiresAt = new Date(session.expires_at);
        var lastActivity = new Date(session.last_activity);
        // Check if session has expired
        if (now > expiresAt) {
            return false;
        }
        // Check if session is marked as inactive
        if (!session.is_active) {
            return false;
        }
        // Check idle timeout (30 minutes default)
        var idleTimeoutMs = 30 * 60 * 1000;
        var idleTime = now.getTime() - lastActivity.getTime();
        if (idleTime > idleTimeoutMs) {
            return false;
        }
        return true;
    },
    /**
     * Check if a session should be extended based on activity
     */
    shouldExtendSession: function (session) {
        var now = new Date();
        var expiresAt = new Date(session.expires_at);
        var timeUntilExpiry = expiresAt.getTime() - now.getTime();
        // Extend if less than 15 minutes remaining
        var extensionThreshold = 15 * 60 * 1000;
        return timeUntilExpiry < extensionThreshold && timeUntilExpiry > 0;
    },
    /**
     * Calculate session duration in milliseconds
     */
    getSessionDuration: function (session) {
        var createdAt = new Date(session.created_at);
        var lastActivity = new Date(session.last_activity);
        return lastActivity.getTime() - createdAt.getTime();
    },
    /**
     * Get time until session expires
     */
    getTimeUntilExpiry: function (session) {
        var now = new Date();
        var expiresAt = new Date(session.expires_at);
        return Math.max(0, expiresAt.getTime() - now.getTime());
    },
    /**
     * Check if user has exceeded concurrent session limit
     */
    checkConcurrentSessionLimit: function (activeSessions, userRole) {
        var policy = config_1.SESSION_POLICIES[userRole];
        if (!policy)
            return false;
        return activeSessions.length >= policy.maxConcurrentSessions;
    },
};
// Device Utilities
exports.DeviceUtils = {
    /**
     * Generate a device fingerprint from device info
     */
    generateFingerprint: function (deviceInfo) {
        var _a, _b;
        var components = [
            deviceInfo.userAgent || '',
            deviceInfo.platform || '',
            ((_a = deviceInfo.screenWidth) === null || _a === void 0 ? void 0 : _a.toString()) || '',
            ((_b = deviceInfo.screenHeight) === null || _b === void 0 ? void 0 : _b.toString()) || '',
            deviceInfo.timezone || '',
            deviceInfo.language || '',
        ];
        return btoa(components.join('|')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    },
    /**
     * Detect device type from user agent
     */
    detectDeviceType: function (userAgent) {
        var ua = userAgent.toLowerCase();
        if (ua.includes('tablet') || ua.includes('ipad')) {
            return 'tablet';
        }
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return 'mobile';
        }
        return 'desktop';
    },
    /**
     * Extract browser information from user agent
     */
    parseBrowserInfo: function (userAgent) {
        var ua = userAgent.toLowerCase();
        // Chrome
        if (ua.includes('chrome') && !ua.includes('edg')) {
            var match = ua.match(/chrome\/(\d+\.\d+)/);
            return {
                name: 'Chrome',
                version: match ? match[1] : 'Unknown',
            };
        }
        // Firefox
        if (ua.includes('firefox')) {
            var match = ua.match(/firefox\/(\d+\.\d+)/);
            return {
                name: 'Firefox',
                version: match ? match[1] : 'Unknown',
            };
        }
        // Safari
        if (ua.includes('safari') && !ua.includes('chrome')) {
            var match = ua.match(/version\/(\d+\.\d+)/);
            return {
                name: 'Safari',
                version: match ? match[1] : 'Unknown',
            };
        }
        // Edge
        if (ua.includes('edg')) {
            var match = ua.match(/edg\/(\d+\.\d+)/);
            return {
                name: 'Edge',
                version: match ? match[1] : 'Unknown',
            };
        }
        return {
            name: 'Unknown',
            version: 'Unknown',
        };
    },
    /**
     * Extract OS information from user agent
     */
    parseOSInfo: function (userAgent) {
        var ua = userAgent.toLowerCase();
        // Windows
        if (ua.includes('windows')) {
            if (ua.includes('windows nt 10.0'))
                return { name: 'Windows', version: '10' };
            if (ua.includes('windows nt 6.3'))
                return { name: 'Windows', version: '8.1' };
            if (ua.includes('windows nt 6.2'))
                return { name: 'Windows', version: '8' };
            if (ua.includes('windows nt 6.1'))
                return { name: 'Windows', version: '7' };
            return { name: 'Windows', version: 'Unknown' };
        }
        // macOS
        if (ua.includes('mac os x')) {
            var match = ua.match(/mac os x (\d+[._]\d+)/);
            return {
                name: 'macOS',
                version: match ? match[1].replace('_', '.') : 'Unknown',
            };
        }
        // iOS
        if (ua.includes('iphone') || ua.includes('ipad')) {
            var match = ua.match(/os (\d+[._]\d+)/);
            return {
                name: 'iOS',
                version: match ? match[1].replace('_', '.') : 'Unknown',
            };
        }
        // Android
        if (ua.includes('android')) {
            var match = ua.match(/android (\d+\.\d+)/);
            return {
                name: 'Android',
                version: match ? match[1] : 'Unknown',
            };
        }
        // Linux
        if (ua.includes('linux')) {
            return { name: 'Linux', version: 'Unknown' };
        }
        return { name: 'Unknown', version: 'Unknown' };
    },
    /**
     * Check if device is mobile
     */
    isMobileDevice: function (deviceInfo) {
        return this.detectDeviceType(deviceInfo.userAgent || '') === 'mobile';
    },
};
// Location Utilities
exports.LocationUtils = {
    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    calculateDistance: function (lat1, lon1, lat2, lon2) {
        var R = 6371; // Earth's radius in kilometers
        var dLat = this.toRadians(lat2 - lat1);
        var dLon = this.toRadians(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },
    /**
     * Convert degrees to radians
     */
    toRadians: function (degrees) {
        return degrees * (Math.PI / 180);
    },
    /**
     * Check if location change is suspicious (impossible travel)
     */
    isSuspiciousLocationChange: function (previousLocation, currentLocation, timeDifferenceMs) {
        if (!previousLocation.latitude || !currentLocation.latitude) {
            return false;
        }
        var distance = this.calculateDistance(previousLocation.latitude, previousLocation.longitude, currentLocation.latitude, currentLocation.longitude);
        var timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
        var maxSpeedKmh = 1000; // Maximum reasonable speed (including flights)
        return distance / timeDifferenceHours > maxSpeedKmh;
    },
    /**
     * Get location risk score
     */
    getLocationRiskScore: function (location) {
        var riskScore = 0;
        // High-risk countries (example list)
        var highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
        if (highRiskCountries.includes(location.country)) {
            riskScore += 40;
        }
        // VPN/Proxy usage
        if (location.isVPN)
            riskScore += 25;
        if (location.isProxy)
            riskScore += 20;
        // Tor usage
        if (location.isTor)
            riskScore += 50;
        return Math.min(riskScore, 100);
    },
};
// Security Event Utilities
exports.SecurityEventUtils = {
    /**
     * Classify security event severity
     */
    classifyEventSeverity: function (eventType) {
        var severityMap = {
            'login_success': 'low',
            'login_failure': 'medium',
            'logout': 'low',
            'session_timeout': 'low',
            'session_extended': 'low',
            'password_change': 'medium',
            'mfa_enabled': 'low',
            'mfa_disabled': 'high',
            'suspicious_location': 'high',
            'suspicious_device': 'high',
            'brute_force_attempt': 'critical',
            'privilege_escalation_attempt': 'critical',
            'session_hijack_attempt': 'critical',
            'unusual_activity': 'medium',
            'concurrent_session_limit': 'medium',
            'device_blocked': 'high',
            'user_blocked': 'critical',
        };
        return severityMap[eventType] || 'medium';
    },
    /**
     * Generate security event description
     */
    generateEventDescription: function (eventType, metadata) {
        var descriptions = {
            'login_success': 'User successfully logged in',
            'login_failure': 'Failed login attempt',
            'logout': 'User logged out',
            'session_timeout': 'Session expired due to inactivity',
            'session_extended': 'Session was extended',
            'password_change': 'User changed password',
            'mfa_enabled': 'Multi-factor authentication enabled',
            'mfa_disabled': 'Multi-factor authentication disabled',
            'suspicious_location': 'Access from suspicious location',
            'suspicious_device': 'Access from unrecognized device',
            'brute_force_attempt': 'Brute force attack detected',
            'privilege_escalation_attempt': 'Privilege escalation attempt detected',
            'session_hijack_attempt': 'Session hijacking attempt detected',
            'unusual_activity': 'Unusual user activity detected',
            'concurrent_session_limit': 'Concurrent session limit exceeded',
            'device_blocked': 'Device has been blocked',
            'user_blocked': 'User account has been blocked',
        };
        var description = descriptions[eventType] || 'Security event occurred';
        // Add metadata context if available
        if (metadata) {
            if (metadata.location) {
                description += " from ".concat(metadata.location.city, ", ").concat(metadata.location.country);
            }
            if (metadata.device) {
                description += " on ".concat(metadata.device);
            }
            if (metadata.ip_address) {
                description += " (IP: ".concat(metadata.ip_address, ")");
            }
        }
        return description;
    },
    /**
     * Calculate risk score for security event
     */
    calculateEventRiskScore: function (eventType, metadata) {
        var baseScores = {
            'login_success': 0,
            'login_failure': 20,
            'logout': 0,
            'session_timeout': 5,
            'session_extended': 0,
            'password_change': 10,
            'mfa_enabled': 0,
            'mfa_disabled': 40,
            'suspicious_location': 60,
            'suspicious_device': 50,
            'brute_force_attempt': 90,
            'privilege_escalation_attempt': 95,
            'session_hijack_attempt': 100,
            'unusual_activity': 30,
            'concurrent_session_limit': 25,
            'device_blocked': 70,
            'user_blocked': 80,
        };
        var riskScore = baseScores[eventType] || 50;
        // Adjust based on metadata
        if (metadata) {
            if (metadata.location) {
                riskScore += exports.LocationUtils.getLocationRiskScore(metadata.location);
            }
            if (metadata.failed_attempts && metadata.failed_attempts > 3) {
                riskScore += Math.min(metadata.failed_attempts * 5, 30);
            }
            if (metadata.is_vpn) {
                riskScore += 15;
            }
            if (metadata.is_tor) {
                riskScore += 25;
            }
        }
        return Math.min(riskScore, 100);
    },
};
// Formatting Utilities
exports.FormatUtils = {
    /**
     * Format session duration
     */
    formatDuration: function (milliseconds) {
        var seconds = Math.floor(milliseconds / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);
        if (days > 0) {
            return "".concat(days, "d ").concat(hours % 24, "h ").concat(minutes % 60, "m");
        }
        else if (hours > 0) {
            return "".concat(hours, "h ").concat(minutes % 60, "m");
        }
        else if (minutes > 0) {
            return "".concat(minutes, "m ").concat(seconds % 60, "s");
        }
        else {
            return "".concat(seconds, "s");
        }
    },
    /**
     * Format timestamp relative to now
     */
    formatRelativeTime: function (date) {
        var now = new Date();
        var diffMs = now.getTime() - date.getTime();
        var diffSeconds = Math.floor(diffMs / 1000);
        var diffMinutes = Math.floor(diffSeconds / 60);
        var diffHours = Math.floor(diffMinutes / 60);
        var diffDays = Math.floor(diffHours / 24);
        if (diffDays > 0) {
            return "".concat(diffDays, " day").concat(diffDays > 1 ? 's' : '', " ago");
        }
        else if (diffHours > 0) {
            return "".concat(diffHours, " hour").concat(diffHours > 1 ? 's' : '', " ago");
        }
        else if (diffMinutes > 0) {
            return "".concat(diffMinutes, " minute").concat(diffMinutes > 1 ? 's' : '', " ago");
        }
        else {
            return 'Just now';
        }
    },
    /**
     * Format IP address with location
     */
    formatIPWithLocation: function (ipAddress, location) {
        if (!location) {
            return ipAddress;
        }
        return "".concat(ipAddress, " (").concat(location.city, ", ").concat(location.country, ")");
    },
    /**
     * Format device name
     */
    formatDeviceName: function (deviceInfo) {
        var browser = exports.DeviceUtils.parseBrowserInfo(deviceInfo.userAgent || '');
        var os = exports.DeviceUtils.parseOSInfo(deviceInfo.userAgent || '');
        var deviceType = exports.DeviceUtils.detectDeviceType(deviceInfo.userAgent || '');
        return "".concat(browser.name, " ").concat(browser.version, " on ").concat(os.name, " (").concat(deviceType, ")");
    },
    /**
     * Format risk score with color coding
     */
    formatRiskScore: function (score) {
        if (score <= 25) {
            return {
                score: score,
                level: 'low',
                color: '#10B981', // green
                description: 'Low risk',
            };
        }
        else if (score <= 50) {
            return {
                score: score,
                level: 'medium',
                color: '#F59E0B', // yellow
                description: 'Medium risk',
            };
        }
        else if (score <= 75) {
            return {
                score: score,
                level: 'high',
                color: '#EF4444', // red
                description: 'High risk',
            };
        }
        else {
            return {
                score: score,
                level: 'critical',
                color: '#7C2D12', // dark red
                description: 'Critical risk',
            };
        }
    },
};
// Validation Utilities
exports.ValidationUtils = {
    /**
     * Validate session token format
     */
    isValidSessionToken: function (token) {
        // JWT format: header.payload.signature
        var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
        return jwtRegex.test(token);
    },
    /**
     * Validate IP address format
     */
    isValidIPAddress: function (ip) {
        var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        var ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    },
    /**
     * Validate device fingerprint
     */
    isValidDeviceFingerprint: function (fingerprint) {
        // Should be alphanumeric and reasonable length
        return /^[a-zA-Z0-9]{16,64}$/.test(fingerprint);
    },
    /**
     * Validate user agent string
     */
    isValidUserAgent: function (userAgent) {
        // Basic validation - should contain browser and OS info
        return userAgent.length > 10 && userAgent.length < 500;
    },
};
// Crypto Utilities
exports.CryptoUtils = {
    /**
     * Generate secure random string
     */
    generateSecureToken: function (length) {
        if (length === void 0) { length = 32; }
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    /**
     * Hash string using simple algorithm (for client-side use)
     */
    simpleHash: function (str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    },
    /**
     * Generate session ID
     */
    generateSessionId: function () {
        var timestamp = Date.now().toString(36);
        var random = this.generateSecureToken(16);
        return "sess_".concat(timestamp, "_").concat(random);
    },
    /**
     * Generate device ID
     */
    generateDeviceId: function () {
        var timestamp = Date.now().toString(36);
        var random = this.generateSecureToken(12);
        return "dev_".concat(timestamp, "_").concat(random);
    },
};
// Export all utilities as a single object
exports.AuthUtils = {
    Session: exports.SessionValidation,
    Device: exports.DeviceUtils,
    Location: exports.LocationUtils,
    SecurityEvent: exports.SecurityEventUtils,
    Format: exports.FormatUtils,
    Validation: exports.ValidationUtils,
    Crypto: exports.CryptoUtils,
};
// Default export
exports.default = exports.AuthUtils;
