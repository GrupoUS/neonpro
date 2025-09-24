/**
 * Performance Configuration Constants
 *
 * Centralized performance thresholds and configuration for the NeonPro platform.
 * Extracted from performance-utils.ts for better organization and maintainability.
 *
 * @version 1.0.0
 */

/**
 * Performance thresholds for different metrics
 * Used throughout the platform for performance monitoring and testing
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Render time thresholds in milliseconds */
  RENDER_TIME: {
    FAST: 100, // < 100ms
    ACCEPTABLE: 200, // < 200ms
    SLOW: 500, // < 500ms
  },
  /** Memory usage thresholds in megabytes */
  MEMORY_USAGE: {
    LOW: 50, // < 50MB
    MEDIUM: 100, // < 100MB
    HIGH: 200, // < 200MB
  },
  /** Response time thresholds in milliseconds */
  RESPONSE_TIME: {
    FAST: 200, // < 200ms
    ACCEPTABLE: 500, // < 500ms
    SLOW: 1000, // < 1s
  },
  /** WebSocket latency thresholds in milliseconds */
  WEBSOCKET_LATENCY: {
    EXCELLENT: 50, // < 50ms
    GOOD: 100, // < 100ms
    ACCEPTABLE: 200, // < 200ms
  },
  /** Concurrent user performance thresholds */
  CONCURRENT_USERS: {
    SUCCESS_RATE: 0.95, // > 95%
    ERROR_RATE: 0.05, // < 5%
  },
};

/**
 * Performance monitoring configuration
 */
export const PERFORMANCE_MONITORING = {
  /** Memory monitoring interval in milliseconds */
  MEMORY_CHECK_INTERVAL: 5000,
  /** Memory usage warning threshold (percentage of limit) */
  MEMORY_WARNING_THRESHOLD: 0.9,
  /** Long task detection threshold in milliseconds */
  LONG_TASK_THRESHOLD: 100,
  /** Performance observer entry types to monitor */
  OBSERVED_ENTRY_TYPES: ['longtask'] as const,
};

/**
 * Mobile performance configuration
 */
export const MOBILE_PERFORMANCE = {
  /** Default mobile viewport dimensions */
  DEFAULT_VIEWPORT: {
    width: 375,
    height: 667,
  },
  /** Mobile-specific render time adjustments */
  RENDER_TIME_MULTIPLIER: 1.2,
  /** Mobile memory usage adjustments */
  MEMORY_MULTIPLIER: 1.1,
};

/**
 * Load testing configuration
 */
export const LOAD_TESTING = {
  /** Default concurrent user simulation settings */
  DEFAULT_USER_COUNT: 10,
  /** Default test duration in milliseconds */
  DEFAULT_DURATION: 30000,
  /** Default action delay range in milliseconds */
  ACTION_DELAY_RANGE: [0, 100],
  /** Weight distribution for action types */
  DEFAULT_ACTION_WEIGHTS: {
    render: 0.6,
    api: 0.4,
  },
};

/**
 * WebSocket performance configuration
 */
export const WEBSOCKET_CONFIG = {
  /** Default message frequency in milliseconds */
  DEFAULT_FREQUENCY: 100,
  /** Message processing timeout in milliseconds */
  PROCESSING_TIMEOUT: 50,
  /** Message delivery confirmation delay in milliseconds */
  DELIVERY_DELAY: 1000,
};

/**
 * Performance report configuration
 */
export const PERFORMANCE_REPORTING = {
  /** Percentile thresholds for performance metrics */
  PERCENTILES: {
    P95: 0.95,
    P99: 0.99,
  },
  /** Performance grade thresholds */
  GRADES: {
    EXCELLENT: 0.9,
    GOOD: 0.75,
    ACCEPTABLE: 0.6,
    POOR: 0.4,
  },
  /** Performance trend analysis window */
  TREND_WINDOW: 7, // days
};

/**
 * Performance optimization flags
 */
export const PERFORMANCE_OPTIMIZATION = {
  /** Enable memory monitoring */
  ENABLE_MEMORY_MONITORING: true,
  /** Enable long task monitoring */
  ENABLE_LONG_TASK_MONITORING: true,
  /** Enable performance reporting */
  ENABLE_PERFORMANCE_REPORTING: true,
  /** Enable automated performance testing */
  ENABLE_AUTOMATED_TESTING: true,
  /** Enable mobile performance testing */
  ENABLE_MOBILE_TESTING: true,
};

/**
 * Performance error codes
 */
export const PERFORMANCE_ERROR_CODES = {
  MEMORY_LEAK_DETECTED: 'PERF_MEM_001',
  LONG_TASK_DETECTED: 'PERF_TASK_001',
  THRESHOLD_EXCEEDED: 'PERF_THRESH_001',
  MONITORING_DISABLED: 'PERF_MON_001',
  CONFIGURATION_ERROR: 'PERF_CONFIG_001',
} as const;

/**
 * Performance event types
 */
export const PERFORMANCE_EVENTS = {
  MEMORY_WARNING: 'performance:memory:warning',
  LONG_TASK_DETECTED: 'performance:longtask:detected',
  THRESHOLD_EXCEEDED: 'performance:threshold:exceeded',
  TEST_COMPLETED: 'performance:test:completed',
  REPORT_GENERATED: 'performance:report:generated',
} as const;

/**
 * Default performance configuration export
 * Combines all performance-related configuration objects
 */
export const PERFORMANCE_CONFIG = {
  THRESHOLDS: PERFORMANCE_THRESHOLDS,
  MONITORING: PERFORMANCE_MONITORING,
  MOBILE: MOBILE_PERFORMANCE,
  LOAD_TESTING: LOAD_TESTING,
  WEBSOCKET: WEBSOCKET_CONFIG,
  REPORTING: PERFORMANCE_REPORTING,
  OPTIMIZATION: PERFORMANCE_OPTIMIZATION,
  ERROR_CODES: PERFORMANCE_ERROR_CODES,
  EVENTS: PERFORMANCE_EVENTS,
} as const;
