// CommonJS wrapper for performance-tracker
const authPerformanceTracker = {
  startTiming: (operation) => {
    return { 
      operation,
      start: Date.now(),
      id: Math.random().toString(36)
    };
  },
  
  endTiming: (timing) => {
    const end = Date.now();
    const duration = end - timing.start;
    return { 
      ...timing,
      end,
      duration
    };
  },
  
  getPerformanceThresholds: () => {
    return {
      registration: 5000,      // 5 seconds max for WebAuthn registration
      authentication: 2000,    // 2 seconds max for WebAuthn authentication
      validation: 1000,        // 1 second max for credential validation
      login: 350,              // ≤350ms for login (TASK-002 requirement)
      logout: 200,             // ≤200ms for logout
      session_validation: 100, // ≤100ms for session validation
      token_refresh: 250,      // ≤250ms for token refresh
      mfa_verification: 500    // ≤500ms for MFA verification
    };
  },
  
  recordMetric: (metric, value) => {
    // Mock implementation
    return true;
  },
  
  getMetrics: () => {
    return {
      averageRegistrationTime: 2500,
      averageAuthenticationTime: 1500,
      averageValidationTime: 800,
      successRate: 0.95,
      errorRate: 0.05
    };
  },
  
  validatePerformance: (operation, duration, thresholds) => {
    const threshold = thresholds[operation];
    return threshold ? duration <= threshold : true;
  }
};

module.exports = { authPerformanceTracker };