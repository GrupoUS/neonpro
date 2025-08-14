// Test Suite Index
// Story 1.4: Session Management & Security Implementation

// Export all test modules
export * from './session-manager.test';
export * from './security-monitor.test';
export * from './device-manager.test';

// Test utilities and helpers
export const TestUtils = {
  /**
   * Create mock session data
   */
  createMockSessionData: (overrides: any = {}) => ({
    userId: 'test-user-123',
    userRole: 'user',
    deviceId: 'test-device-123',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    location: {
      country: 'US',
      region: 'CA',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    mfaVerified: false,
    deviceTrusted: true,
    riskScore: 0.2,
    metadata: {},
    ...overrides,
  }),

  /**
   * Create mock device registration
   */
  createMockDeviceRegistration: (overrides: any = {}) => ({
    userId: 'test-user-123',
    name: 'Test Device',
    type: 'desktop',
    platform: 'Windows',
    fingerprint: 'test-fingerprint-123',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    location: {
      country: 'US',
      region: 'CA',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    registeredAt: new Date(),
    ...overrides,
  }),

  /**
   * Create mock security event
   */
  createMockSecurityEvent: (overrides: any = {}) => ({
    type: 'login_attempt',
    userId: 'test-user-123',
    severity: 'info',
    details: {
      success: true,
    },
    timestamp: new Date(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    ...overrides,
  }),

  /**
   * Create mock security config
   */
  createMockSecurityConfig: (overrides: any = {}) => ({
    enableRealTimeMonitoring: true,
    threatDetectionLevel: 'medium',
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
    ...overrides,
  }),

  /**
   * Create mock session config
   */
  createMockSessionConfig: (overrides: any = {}) => ({
    maxSessions: 5,
    sessionTimeout: 30 * 60 * 1000,
    extendThreshold: 5 * 60 * 1000,
    heartbeatInterval: 60 * 1000,
    requireMFA: false,
    requireTrustedDevice: false,
    allowConcurrentSessions: true,
    trackLocation: true,
    logSecurityEvents: true,
    enableRateLimiting: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    ...overrides,
  }),

  /**
   * Wait for async operations
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate random test data
   */
  generateRandomId: () => Math.random().toString(36).substring(2, 15),
  
  generateRandomIP: () => {
    const octets = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
    return octets.join('.');
  },

  generateRandomUserAgent: () => {
    const browsers = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0)',
    ];
    return browsers[Math.floor(Math.random() * browsers.length)];
  },

  /**
   * Mock time functions
   */
  mockTime: {
    now: () => Date.now(),
    advanceBy: (ms: number) => {
      const originalNow = Date.now;
      const startTime = originalNow();
      Date.now = () => startTime + ms;
      return () => { Date.now = originalNow; };
    },
  },

  /**
   * Assertion helpers
   */
  assertions: {
    isValidSessionId: (sessionId: string) => {
      return typeof sessionId === 'string' && sessionId.length > 0;
    },
    
    isValidDeviceId: (deviceId: string) => {
      return typeof deviceId === 'string' && deviceId.length > 0;
    },
    
    isValidTimestamp: (timestamp: Date) => {
      return timestamp instanceof Date && !isNaN(timestamp.getTime());
    },
    
    isValidRiskScore: (score: number) => {
      return typeof score === 'number' && score >= 0 && score <= 1;
    },
    
    isValidTrustScore: (score: number) => {
      return typeof score === 'number' && score >= 0 && score <= 1;
    },
  },
};

// Test configuration
export const TEST_CONFIG = {
  // Test timeouts
  TIMEOUT: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000,
  },
  
  // Test data limits
  LIMITS: {
    MAX_SESSIONS: 10,
    MAX_DEVICES: 20,
    MAX_EVENTS: 100,
  },
  
  // Mock data
  MOCK_DATA: {
    USER_IDS: ['user-1', 'user-2', 'user-3', 'admin-1'],
    DEVICE_TYPES: ['desktop', 'mobile', 'tablet'],
    PLATFORMS: ['Windows', 'macOS', 'iOS', 'Android', 'Linux'],
    COUNTRIES: ['US', 'CA', 'GB', 'DE', 'FR', 'JP'],
    CITIES: ['New York', 'London', 'Tokyo', 'Berlin', 'Paris', 'Toronto'],
  },
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock console methods to reduce noise in tests
  const originalConsole = { ...console };
  
  beforeEach(() => {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });
  
  afterEach(() => {
    Object.assign(console, originalConsole);
    vi.clearAllMocks();
  });
};

// Performance testing utilities
export const PerformanceTestUtils = {
  /**
   * Measure execution time
   */
  measureTime: async (fn: () => Promise<any>) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  },
  
  /**
   * Run load test
   */
  loadTest: async (fn: () => Promise<any>, iterations: number) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const time = await PerformanceTestUtils.measureTime(fn);
      times.push(time);
    }
    
    return {
      iterations,
      totalTime: times.reduce((sum, time) => sum + time, 0),
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      times,
    };
  },
  
  /**
   * Memory usage tracking
   */
  trackMemory: () => {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    return null;
  },
};

// Integration test helpers
export const IntegrationTestUtils = {
  /**
   * Setup complete auth system for integration tests
   */
  setupAuthSystem: async () => {
    const { SessionManager } = await import('../session-manager');
    const { SecurityMonitor } = await import('../security-monitor');
    const { DeviceManager } = await import('../device-manager');
    
    const securityConfig = TestUtils.createMockSecurityConfig();
    const sessionConfig = TestUtils.createMockSessionConfig();
    
    const securityMonitor = new SecurityMonitor(securityConfig);
    const sessionManager = new SessionManager(sessionConfig, securityMonitor);
    const deviceManager = new DeviceManager();
    
    return {
      sessionManager,
      securityMonitor,
      deviceManager,
      configs: {
        security: securityConfig,
        session: sessionConfig,
      },
    };
  },
  
  /**
   * Simulate user workflow
   */
  simulateUserWorkflow: async (authSystem: any, userId: string) => {
    const { sessionManager, deviceManager } = authSystem;
    
    // Register device
    const deviceRegistration = TestUtils.createMockDeviceRegistration({ userId });
    const deviceId = await deviceManager.registerDevice(deviceRegistration);
    
    // Create session
    const sessionData = TestUtils.createMockSessionData({ userId, deviceId });
    const sessionId = await sessionManager.createSession(sessionData);
    
    // Simulate activity
    await sessionManager.updateActivity(sessionId);
    
    return {
      userId,
      deviceId,
      sessionId,
      deviceRegistration,
      sessionData,
    };
  },
};

// Export test suite runner
export const runTestSuite = async () => {
  console.log('🧪 Running Auth System Test Suite...');
  
  try {
    // Run all tests
    const testResults = await Promise.all([
      import('./session-manager.test'),
      import('./security-monitor.test'),
      import('./device-manager.test'),
    ]);
    
    console.log('✅ All tests completed successfully!');
    return testResults;
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    throw error;
  }
};