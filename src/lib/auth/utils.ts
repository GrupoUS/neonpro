// Authentication Utilities
// Story 1.4: Session Management & Security Implementation

import {
  UserSession,
  SessionSecurityEvent,
  DeviceInfo,
  LocationInfo,
  SessionPolicy,
  SecurityEventType,
} from './types';
import { SESSION_POLICIES } from './config';

// Session Validation Utilities
export const SessionValidation = {
  /**
   * Check if a session is still valid based on expiration and activity
   */
  isSessionValid(session: UserSession): boolean {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const lastActivity = new Date(session.last_activity);
    
    // Check if session has expired
    if (now > expiresAt) {
      return false;
    }
    
    // Check if session is marked as inactive
    if (!session.is_active) {
      return false;
    }
    
    // Check idle timeout (30 minutes default)
    const idleTimeoutMs = 30 * 60 * 1000;
    const idleTime = now.getTime() - lastActivity.getTime();
    
    if (idleTime > idleTimeoutMs) {
      return false;
    }
    
    return true;
  },

  /**
   * Check if a session should be extended based on activity
   */
  shouldExtendSession(session: UserSession): boolean {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    // Extend if less than 15 minutes remaining
    const extensionThreshold = 15 * 60 * 1000;
    
    return timeUntilExpiry < extensionThreshold && timeUntilExpiry > 0;
  },

  /**
   * Calculate session duration in milliseconds
   */
  getSessionDuration(session: UserSession): number {
    const createdAt = new Date(session.created_at);
    const lastActivity = new Date(session.last_activity);
    
    return lastActivity.getTime() - createdAt.getTime();
  },

  /**
   * Get time until session expires
   */
  getTimeUntilExpiry(session: UserSession): number {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    return Math.max(0, expiresAt.getTime() - now.getTime());
  },

  /**
   * Check if user has exceeded concurrent session limit
   */
  checkConcurrentSessionLimit(
    activeSessions: UserSession[],
    userRole: string
  ): boolean {
    const policy = SESSION_POLICIES[userRole as keyof typeof SESSION_POLICIES];
    if (!policy) return false;
    
    return activeSessions.length >= policy.maxConcurrentSessions;
  },
};

// Device Utilities
export const DeviceUtils = {
  /**
   * Generate a device fingerprint from device info
   */
  generateFingerprint(deviceInfo: DeviceInfo): string {
    const components = [
      deviceInfo.userAgent || '',
      deviceInfo.platform || '',
      deviceInfo.screenWidth?.toString() || '',
      deviceInfo.screenHeight?.toString() || '',
      deviceInfo.timezone || '',
      deviceInfo.language || '',
    ];
    
    return btoa(components.join('|')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  },

  /**
   * Detect device type from user agent
   */
  detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    const ua = userAgent.toLowerCase();
    
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
  parseBrowserInfo(userAgent: string): {
    name: string;
    version: string;
  } {
    const ua = userAgent.toLowerCase();
    
    // Chrome
    if (ua.includes('chrome') && !ua.includes('edg')) {
      const match = ua.match(/chrome\/(\d+\.\d+)/);
      return {
        name: 'Chrome',
        version: match ? match[1] : 'Unknown',
      };
    }
    
    // Firefox
    if (ua.includes('firefox')) {
      const match = ua.match(/firefox\/(\d+\.\d+)/);
      return {
        name: 'Firefox',
        version: match ? match[1] : 'Unknown',
      };
    }
    
    // Safari
    if (ua.includes('safari') && !ua.includes('chrome')) {
      const match = ua.match(/version\/(\d+\.\d+)/);
      return {
        name: 'Safari',
        version: match ? match[1] : 'Unknown',
      };
    }
    
    // Edge
    if (ua.includes('edg')) {
      const match = ua.match(/edg\/(\d+\.\d+)/);
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
  parseOSInfo(userAgent: string): {
    name: string;
    version: string;
  } {
    const ua = userAgent.toLowerCase();
    
    // Windows
    if (ua.includes('windows')) {
      if (ua.includes('windows nt 10.0')) return { name: 'Windows', version: '10' };
      if (ua.includes('windows nt 6.3')) return { name: 'Windows', version: '8.1' };
      if (ua.includes('windows nt 6.2')) return { name: 'Windows', version: '8' };
      if (ua.includes('windows nt 6.1')) return { name: 'Windows', version: '7' };
      return { name: 'Windows', version: 'Unknown' };
    }
    
    // macOS
    if (ua.includes('mac os x')) {
      const match = ua.match(/mac os x (\d+[._]\d+)/);
      return {
        name: 'macOS',
        version: match ? match[1].replace('_', '.') : 'Unknown',
      };
    }
    
    // iOS
    if (ua.includes('iphone') || ua.includes('ipad')) {
      const match = ua.match(/os (\d+[._]\d+)/);
      return {
        name: 'iOS',
        version: match ? match[1].replace('_', '.') : 'Unknown',
      };
    }
    
    // Android
    if (ua.includes('android')) {
      const match = ua.match(/android (\d+\.\d+)/);
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
  isMobileDevice(deviceInfo: DeviceInfo): boolean {
    return this.detectDeviceType(deviceInfo.userAgent || '') === 'mobile';
  },
};

// Location Utilities
export const LocationUtils = {
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Convert degrees to radians
   */
  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Check if location change is suspicious (impossible travel)
   */
  isSuspiciousLocationChange(
    previousLocation: LocationInfo,
    currentLocation: LocationInfo,
    timeDifferenceMs: number
  ): boolean {
    if (!previousLocation.latitude || !currentLocation.latitude) {
      return false;
    }
    
    const distance = this.calculateDistance(
      previousLocation.latitude,
      previousLocation.longitude!,
      currentLocation.latitude,
      currentLocation.longitude!
    );
    
    const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
    const maxSpeedKmh = 1000; // Maximum reasonable speed (including flights)
    
    return distance / timeDifferenceHours > maxSpeedKmh;
  },

  /**
   * Get location risk score
   */
  getLocationRiskScore(location: LocationInfo): number {
    let riskScore = 0;
    
    // High-risk countries (example list)
    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    if (highRiskCountries.includes(location.country)) {
      riskScore += 40;
    }
    
    // VPN/Proxy usage
    if (location.isVPN) riskScore += 25;
    if (location.isProxy) riskScore += 20;
    
    // Tor usage
    if (location.isTor) riskScore += 50;
    
    return Math.min(riskScore, 100);
  },
};

// Security Event Utilities
export const SecurityEventUtils = {
  /**
   * Classify security event severity
   */
  classifyEventSeverity(eventType: SecurityEventType): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<SecurityEventType, 'low' | 'medium' | 'high' | 'critical'> = {
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
  generateEventDescription(
    eventType: SecurityEventType,
    metadata?: Record<string, any>
  ): string {
    const descriptions: Record<SecurityEventType, string> = {
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
    
    let description = descriptions[eventType] || 'Security event occurred';
    
    // Add metadata context if available
    if (metadata) {
      if (metadata.location) {
        description += ` from ${metadata.location.city}, ${metadata.location.country}`;
      }
      if (metadata.device) {
        description += ` on ${metadata.device}`;
      }
      if (metadata.ip_address) {
        description += ` (IP: ${metadata.ip_address})`;
      }
    }
    
    return description;
  },

  /**
   * Calculate risk score for security event
   */
  calculateEventRiskScore(
    eventType: SecurityEventType,
    metadata?: Record<string, any>
  ): number {
    const baseScores: Record<SecurityEventType, number> = {
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
    
    let riskScore = baseScores[eventType] || 50;
    
    // Adjust based on metadata
    if (metadata) {
      if (metadata.location) {
        riskScore += LocationUtils.getLocationRiskScore(metadata.location);
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
export const FormatUtils = {
  /**
   * Format session duration
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Format timestamp relative to now
   */
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  },

  /**
   * Format IP address with location
   */
  formatIPWithLocation(ipAddress: string, location?: LocationInfo): string {
    if (!location) {
      return ipAddress;
    }
    
    return `${ipAddress} (${location.city}, ${location.country})`;
  },

  /**
   * Format device name
   */
  formatDeviceName(deviceInfo: DeviceInfo): string {
    const browser = DeviceUtils.parseBrowserInfo(deviceInfo.userAgent || '');
    const os = DeviceUtils.parseOSInfo(deviceInfo.userAgent || '');
    const deviceType = DeviceUtils.detectDeviceType(deviceInfo.userAgent || '');
    
    return `${browser.name} ${browser.version} on ${os.name} (${deviceType})`;
  },

  /**
   * Format risk score with color coding
   */
  formatRiskScore(score: number): {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    color: string;
    description: string;
  } {
    if (score <= 25) {
      return {
        score,
        level: 'low',
        color: '#10B981', // green
        description: 'Low risk',
      };
    } else if (score <= 50) {
      return {
        score,
        level: 'medium',
        color: '#F59E0B', // yellow
        description: 'Medium risk',
      };
    } else if (score <= 75) {
      return {
        score,
        level: 'high',
        color: '#EF4444', // red
        description: 'High risk',
      };
    } else {
      return {
        score,
        level: 'critical',
        color: '#7C2D12', // dark red
        description: 'Critical risk',
      };
    }
  },
};

// Validation Utilities
export const ValidationUtils = {
  /**
   * Validate session token format
   */
  isValidSessionToken(token: string): boolean {
    // JWT format: header.payload.signature
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    return jwtRegex.test(token);
  },

  /**
   * Validate IP address format
   */
  isValidIPAddress(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  },

  /**
   * Validate device fingerprint
   */
  isValidDeviceFingerprint(fingerprint: string): boolean {
    // Should be alphanumeric and reasonable length
    return /^[a-zA-Z0-9]{16,64}$/.test(fingerprint);
  },

  /**
   * Validate user agent string
   */
  isValidUserAgent(userAgent: string): boolean {
    // Basic validation - should contain browser and OS info
    return userAgent.length > 10 && userAgent.length < 500;
  },
};

// Crypto Utilities
export const CryptoUtils = {
  /**
   * Generate secure random string
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  },

  /**
   * Hash string using simple algorithm (for client-side use)
   */
  simpleHash(str: string): string {
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  },

  /**
   * Generate session ID
   */
  generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = this.generateSecureToken(16);
    return `sess_${timestamp}_${random}`;
  },

  /**
   * Generate device ID
   */
  generateDeviceId(): string {
    const timestamp = Date.now().toString(36);
    const random = this.generateSecureToken(12);
    return `dev_${timestamp}_${random}`;
  },
};

// Export all utilities as a single object
export const AuthUtils = {
  Session: SessionValidation,
  Device: DeviceUtils,
  Location: LocationUtils,
  SecurityEvent: SecurityEventUtils,
  Format: FormatUtils,
  Validation: ValidationUtils,
  Crypto: CryptoUtils,
};

// Default export
export default AuthUtils;
