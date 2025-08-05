// 🔐 Sistema de Autenticação e Segurança Avançado
// Story 1.4: Session Management & Security Implementation
// Main entry point for the authentication system

// Core modules
export * from './core';
export {
  SessionManager,
  SecurityMonitor,
  DeviceManager,
  type SessionConfig,
  type SecurityConfig,
  type DeviceConfig,
  type Session,
  type SecurityEvent,
  type SecurityAlert,
  type Device,
  type SessionMetrics,
  type SecurityMetrics,
  type DeviceAnalytics,
} from './core';

// React components
export * from './components';
export {
  SessionStatus,
  SecurityAlerts,
  DeviceManager as DeviceManagerComponent,
  SessionMetrics as SessionMetricsComponent,
  type SessionStatusProps,
  type SecurityAlertsProps,
  type DeviceManagerProps,
  type SessionMetricsProps,
} from './components';

// Middlewares
export * from './middleware';
export {
  createAuthMiddleware,
  createSecurityMiddleware,
  createCombinedMiddleware,
  extractClientIP,
  extractSessionToken,
  isAPIRoute,
  isStaticRoute,
  isPublicRoute,
  HIGH_SECURITY_CONFIG,
  DEFAULT_CONFIG,
  DEVELOPMENT_CONFIG,
  type AuthMiddlewareConfig,
  type SecurityMiddlewareConfig,
  type CombinedMiddlewareConfig,
  type MiddlewareContext,
  type RouteType,
} from './middleware';

// API routes
export * from './api';
export {
  createSessionRoutes,
  createSecurityRoutes,
  createDeviceRoutes,
  createAuthAPIRoutes,
  extractClientIP as apiExtractClientIP,
  extractSessionToken as apiExtractSessionToken,
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
  parseQueryParams,
  addSecurityHeaders,
  API_ROUTE_PATTERNS,
  HTTP_METHODS,
  STATUS_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  type APIRouteHandler,
  type APIResponse,
  type APIError,
  type QueryParams,
} from './api';

// Test utilities (for development and testing)
export {
  TestUtils,
  PerformanceTestUtils,
  IntegrationTestUtils,
  TEST_CONFIG,
  setupTestEnvironment,
  runTestSuite,
} from './tests';

// System configuration and utilities
export const AUTH_SYSTEM_VERSION = '1.4.0';
export const AUTH_SYSTEM_NAME = 'NeonPro Advanced Authentication & Security System';

/**
 * Default system configuration
 */
export const DEFAULT_SYSTEM_CONFIG = {
  // Session configuration
  session: {
    maxSessions: 5,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    extendThreshold: 5 * 60 * 1000,  // 5 minutes
    heartbeatInterval: 60 * 1000,    // 1 minute
    requireMFA: false,
    requireTrustedDevice: false,
    allowConcurrentSessions: true,
    trackLocation: true,
    logSecurityEvents: true,
    enableRateLimiting: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  
  // Security configuration
  security: {
    enableRealTimeMonitoring: true,
    threatDetectionLevel: 'medium' as const,
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    suspiciousActivityThreshold: 10,
    enableGeolocationTracking: true,
    enableDeviceFingerprinting: true,
    alertThresholds: {
      low: 1,
      medium: 3,
      high: 5,
      critical: 1,
    },
    autoBlockThreshold: 10,
    rateLimitConfig: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
      blockDuration: 60 * 60 * 1000,
    },
  },
  
  // Device configuration
  device: {
    enableFingerprinting: true,
    trustScoreThreshold: 0.7,
    maxDevicesPerUser: 10,
    deviceExpirationDays: 90,
    requireDeviceVerification: false,
    enableLocationTracking: true,
    enableBehaviorAnalysis: true,
  },
};

/**
 * System initialization function
 */
export const initializeAuthSystem = (config?: Partial<typeof DEFAULT_SYSTEM_CONFIG>) => {
  const finalConfig = {
    ...DEFAULT_SYSTEM_CONFIG,
    ...config,
    session: { ...DEFAULT_SYSTEM_CONFIG.session, ...config?.session },
    security: { ...DEFAULT_SYSTEM_CONFIG.security, ...config?.security },
    device: { ...DEFAULT_SYSTEM_CONFIG.device, ...config?.device },
  };
  
  // Initialize security monitor first
  const securityMonitor = new SecurityMonitor(finalConfig.security);
  
  // Initialize session manager with security monitor
  const sessionManager = new SessionManager(finalConfig.session, securityMonitor);
  
  // Initialize device manager
  const deviceManager = new DeviceManager(finalConfig.device);
  
  return {
    sessionManager,
    securityMonitor,
    deviceManager,
    config: finalConfig,
    version: AUTH_SYSTEM_VERSION,
    name: AUTH_SYSTEM_NAME,
  };
};

/**
 * Quick setup for common use cases
 */
export const AuthSystemPresets = {
  /**
   * High security preset for production environments
   */
  highSecurity: () => initializeAuthSystem({
    session: {
      maxSessions: 3,
      sessionTimeout: 15 * 60 * 1000, // 15 minutes
      requireMFA: true,
      requireTrustedDevice: true,
      allowConcurrentSessions: false,
      maxLoginAttempts: 3,
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
    },
    security: {
      threatDetectionLevel: 'high',
      maxFailedAttempts: 3,
      suspiciousActivityThreshold: 5,
      autoBlockThreshold: 5,
      rateLimitConfig: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 50,
        blockDuration: 2 * 60 * 60 * 1000, // 2 hours
      },
    },
    device: {
      trustScoreThreshold: 0.8,
      maxDevicesPerUser: 5,
      requireDeviceVerification: true,
    },
  }),
  
  /**
   * Standard preset for most applications
   */
  standard: () => initializeAuthSystem(),
  
  /**
   * Development preset with relaxed security
   */
  development: () => initializeAuthSystem({
    session: {
      sessionTimeout: 60 * 60 * 1000, // 1 hour
      requireMFA: false,
      requireTrustedDevice: false,
      maxLoginAttempts: 10,
      lockoutDuration: 5 * 60 * 1000, // 5 minutes
    },
    security: {
      threatDetectionLevel: 'low',
      maxFailedAttempts: 10,
      suspiciousActivityThreshold: 20,
      autoBlockThreshold: 20,
      rateLimitConfig: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 200,
        blockDuration: 10 * 60 * 1000, // 10 minutes
      },
    },
    device: {
      trustScoreThreshold: 0.5,
      maxDevicesPerUser: 20,
      requireDeviceVerification: false,
    },
  }),
  
  /**
   * Enterprise preset with advanced features
   */
  enterprise: () => initializeAuthSystem({
    session: {
      maxSessions: 10,
      sessionTimeout: 45 * 60 * 1000, // 45 minutes
      requireMFA: true,
      requireTrustedDevice: true,
      allowConcurrentSessions: true,
      maxLoginAttempts: 5,
      lockoutDuration: 20 * 60 * 1000, // 20 minutes
    },
    security: {
      threatDetectionLevel: 'critical',
      maxFailedAttempts: 3,
      suspiciousActivityThreshold: 3,
      autoBlockThreshold: 3,
      enableRealTimeMonitoring: true,
      enableGeolocationTracking: true,
      enableDeviceFingerprinting: true,
      rateLimitConfig: {
        windowMs: 10 * 60 * 1000,
        maxRequests: 30,
        blockDuration: 4 * 60 * 60 * 1000, // 4 hours
      },
    },
    device: {
      trustScoreThreshold: 0.9,
      maxDevicesPerUser: 3,
      requireDeviceVerification: true,
      enableBehaviorAnalysis: true,
    },
  }),
};

/**
 * Utility functions for common operations
 */
export const AuthUtils = {
  /**
   * Generate secure session ID
   */
  generateSessionId: () => {
    return crypto.randomUUID ? crypto.randomUUID() : 
           Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },
  
  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint: (userAgent: string, additionalData?: Record<string, any>) => {
    const data = {
      userAgent,
      ...additionalData,
      timestamp: Date.now(),
    };
    
    // Simple hash function for fingerprinting
    let hash = 0;
    const str = JSON.stringify(data);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  },
  
  /**
   * Calculate risk score based on various factors
   */
  calculateRiskScore: (factors: {
    isNewDevice?: boolean;
    isNewLocation?: boolean;
    failedAttempts?: number;
    timeOfDay?: number; // 0-23
    dayOfWeek?: number; // 0-6
    userAgent?: string;
    ipAddress?: string;
  }) => {
    let score = 0;
    
    if (factors.isNewDevice) score += 0.3;
    if (factors.isNewLocation) score += 0.4;
    if (factors.failedAttempts) score += Math.min(factors.failedAttempts * 0.1, 0.5);
    
    // Time-based risk (higher risk during unusual hours)
    if (factors.timeOfDay !== undefined) {
      if (factors.timeOfDay < 6 || factors.timeOfDay > 22) score += 0.1;
    }
    
    // Weekend access might be unusual for business apps
    if (factors.dayOfWeek !== undefined) {
      if (factors.dayOfWeek === 0 || factors.dayOfWeek === 6) score += 0.05;
    }
    
    return Math.min(score, 1); // Cap at 1.0
  },
  
  /**
   * Validate session token format
   */
  isValidSessionToken: (token: string) => {
    return typeof token === 'string' && token.length > 10;
  },
  
  /**
   * Extract IP address from various sources
   */
  extractIPAddress: (request: any) => {
    return request.headers?.['x-forwarded-for']?.split(',')[0] ||
           request.headers?.['x-real-ip'] ||
           request.connection?.remoteAddress ||
           request.socket?.remoteAddress ||
           '127.0.0.1';
  },
  
  /**
   * Format duration in human-readable format
   */
  formatDuration: (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  },
};

/**
 * System health check
 */
export const performHealthCheck = async (authSystem: ReturnType<typeof initializeAuthSystem>) => {
  const results = {
    timestamp: new Date().toISOString(),
    version: AUTH_SYSTEM_VERSION,
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    checks: {
      sessionManager: false,
      securityMonitor: false,
      deviceManager: false,
    },
    metrics: {
      activeSessions: 0,
      securityEvents: 0,
      registeredDevices: 0,
    },
    errors: [] as string[],
  };
  
  try {
    // Check session manager
    const sessionMetrics = await authSystem.sessionManager.getMetrics();
    results.checks.sessionManager = true;
    results.metrics.activeSessions = sessionMetrics.activeSessions;
  } catch (error) {
    results.errors.push(`SessionManager: ${error}`);
  }
  
  try {
    // Check security monitor
    const securityMetrics = await authSystem.securityMonitor.getMetrics();
    results.checks.securityMonitor = true;
    results.metrics.securityEvents = securityMetrics.totalEvents;
  } catch (error) {
    results.errors.push(`SecurityMonitor: ${error}`);
  }
  
  try {
    // Check device manager
    const deviceAnalytics = await authSystem.deviceManager.getAnalytics();
    results.checks.deviceManager = true;
    results.metrics.registeredDevices = deviceAnalytics.totalDevices;
  } catch (error) {
    results.errors.push(`DeviceManager: ${error}`);
  }
  
  // Determine overall status
  const healthyChecks = Object.values(results.checks).filter(Boolean).length;
  if (healthyChecks === 3) {
    results.status = 'healthy';
  } else if (healthyChecks >= 2) {
    results.status = 'degraded';
  } else {
    results.status = 'unhealthy';
  }
  
  return results;
};

// Export system information
export const SYSTEM_INFO = {
  name: AUTH_SYSTEM_NAME,
  version: AUTH_SYSTEM_VERSION,
  description: 'Advanced authentication and security system for modern web applications',
  features: [
    'Session Management',
    'Real-time Security Monitoring',
    'Device Management & Fingerprinting',
    'Threat Detection & Prevention',
    'Rate Limiting & DDoS Protection',
    'Multi-factor Authentication Support',
    'Geolocation Tracking',
    'Behavioral Analysis',
    'Comprehensive Logging & Metrics',
    'React Components',
    'API Routes',
    'Middleware Integration',
  ],
  author: 'NeonPro Development Team',
  license: 'MIT',
  repository: 'https://github.com/neonpro/auth-system',
  documentation: 'https://docs.neonpro.dev/auth',
};

// Default export for convenience
export default {
  initializeAuthSystem,
  AuthSystemPresets,
  AuthUtils,
  performHealthCheck,
  SYSTEM_INFO,
  DEFAULT_SYSTEM_CONFIG,
  AUTH_SYSTEM_VERSION,
  AUTH_SYSTEM_NAME,
};
