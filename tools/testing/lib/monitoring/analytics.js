// CommonJS wrapper for monitoring/analytics
const analyticsService = {
  track: (event, properties = {}) => {
    return {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: 'test-session',
    };
  },

  trackWebAuthn: (action, result) => {
    return {
      action,
      result,
      timestamp: Date.now(),
      category: 'webauthn',
    };
  },

  trackPerformance: (operation, duration) => {
    return {
      operation,
      duration,
      timestamp: Date.now(),
      category: 'performance',
    };
  },

  getAnalytics: (_filter = {}) => {
    return {
      totalEvents: 1000,
      uniqueUsers: 150,
      conversionRate: 0.85,
      averageSessionDuration: 300_000,
    };
  },
};

module.exports = { analyticsService };
