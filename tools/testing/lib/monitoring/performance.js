// CommonJS wrapper for monitoring/performance
const performanceService = {
  startTimer: (name) => {
    return {
      name,
      start: Date.now(),
      id: Math.random().toString(36)
    };
  },
  
  endTimer: (timer) => {
    const end = Date.now();
    const duration = end - timer.start;
    return {
      ...timer,
      end,
      duration
    };
  },
  
  recordMetric: (name, value, tags = {}) => {
    // Mock implementation for testing
    return {
      name,
      value,
      tags,
      timestamp: Date.now()
    };
  },
  
  getMetrics: (filter = {}) => {
    return {
      totalRequests: 1000,
      averageResponseTime: 250,
      errorRate: 0.02,
      throughput: 100
    };
  },
  
  getPerformanceReport: () => {
    return {
      uptime: '99.9%',
      averageResponseTime: 250,
      peakResponseTime: 1200,
      totalRequests: 10000,
      errorCount: 20
    };
  }
};

const monitoringService = {
  logEvent: (event, data) => {
    return {
      event,
      data,
      timestamp: Date.now(),
      id: Math.random().toString(36)
    };
  },
  
  getHealthStatus: () => {
    return {
      status: 'healthy',
      uptime: Date.now() - 1000000,
      memory: process.memoryUsage(),
      cpu: 45.2
    };
  }
};

module.exports = { 
  performanceService,
  monitoringService
};