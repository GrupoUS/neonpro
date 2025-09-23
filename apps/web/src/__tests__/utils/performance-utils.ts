/**
 * Performance Testing Utilities
 * 
 * Comprehensive utilities for measuring and testing performance:
 * - Component render time measurement
 * - API response time measurement
 * - Memory usage monitoring
 * - Concurrent user simulation
 * - WebSocket performance testing
 * - Mobile responsiveness testing
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Performance metrics interfaces
export interface PerformanceMetrics {
  renderTime: number;
  domNodes: number;
  componentCount: number;
  memoryUsage: number;
  reflowCount: number;
  paintCount: number;
}

export interface LoadMetrics {
  loadTime: number;
  responseSize: number;
  success: boolean;
  statusCode: number;
  ttfb: number; // Time to first byte
  downloadTime: number;
}

export interface MemoryMetrics {
  peakMemory: number;
  memoryGrowth: number;
  gcCount: number;
  memoryLeakDetected: boolean;
}

export interface LoadTestResult {
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface WebSocketMetrics {
  averageLatency: number;
  messageLossRate: number;
  successRate: number;
  totalMessages: number;
  deliveredMessages: number;
  averageThroughput: number;
}

// Render performance measurement
export async function measureRenderTime<T>(
  renderFn: () => T,
  iterations: number = 1
): Promise<PerformanceMetrics> {
  const startTime = performance.now();
  let domNodes = 0;
  let componentCount = 0;
  
  // Mock performance API for testing
  const originalMark = performance.mark;
  const originalMeasure = performance.measure;
  
  let paintCount = 0;
  let reflowCount = 0;
  
  performance.mark = vi.fn((name: string) => {
    if (name.includes('paint')) paintCount++;
    if (name.includes('reflow')) reflowCount++;
  });
  
  performance.measure = vi.fn();
  
  // Execute render
  const result = renderFn();
  
  // Calculate metrics
  const endTime = performance.now();
  const renderTime = (endTime - startTime) / iterations;
  
  // Count DOM nodes (if result is from RTL)
  if (result && typeof result === 'object' && 'container' in result) {
    domNodes = result.container.querySelectorAll('*').length;
    componentCount = result.container.querySelectorAll('[data-testid]').length;
  }
  
  // Memory usage (if available)
  const memoryUsage = performance.memory ? 
    performance.memory.usedJSHeapSize / (1024 * 1024) : 0;
  
  // Restore original methods
  performance.mark = originalMark;
  performance.measure = originalMeasure;
  
  return {
    renderTime,
    domNodes,
    componentCount,
    memoryUsage,
    reflowCount,
    paintCount
  };
}

// Load time measurement
export async function measureLoadTime<T>(
  loadFn: () => Promise<T>,
  iterations: number = 1
): Promise<LoadMetrics> {
  const startTime = performance.now();
  let success = false;
  let statusCode = 200;
  let responseSize = 0;
  let ttfb = 0;
  let downloadTime = 0;
  
  try {
    const ttfbStart = performance.now();
    const result = await loadFn();
    const ttfbEnd = performance.now();
    
    ttfb = ttfbEnd - ttfbStart;
    
    // Estimate response size
    if (result && typeof result === 'object') {
      responseSize = JSON.stringify(result).length;
    }
    
    const downloadEnd = performance.now();
    downloadTime = downloadEnd - ttfbEnd;
    
    success = true;
    
    const endTime = performance.now();
    const loadTime = (endTime - startTime) / iterations;
    
    return {
      loadTime,
      responseSize,
      success,
      statusCode,
      ttfb,
      downloadTime
    };
  } catch (error) {
    const endTime = performance.now();
    const loadTime = (endTime - startTime) / iterations;
    
    return {
      loadTime,
      responseSize: 0,
      success: false,
      statusCode: error instanceof Response ? error.status : 500,
      ttfb,
      downloadTime: 0
    };
  }
}

// Memory usage measurement
export async function measureMemoryUsage<T>(
  testFn: () => Promise<T> | T,
  duration: number = 5000
): Promise<MemoryMetrics> {
  const startMemory = performance.memory?.usedJSHeapSize || 0;
  let peakMemory = startMemory;
  let gcCount = 0;
  let memoryLeakDetected = false;
  
  // Monitor memory usage during test
  const memoryInterval = setInterval(() => {
    if (performance.memory) {
      const currentMemory = performance.memory.usedJSHeapSize;
      peakMemory = Math.max(peakMemory, currentMemory);
      
      // Detect garbage collection
      if (performance.memory.totalJSHeapSize < performance.memory.jsHeapSizeLimit) {
        gcCount++;
      }
    }
  }, 100);
  
  // Execute test
  await testFn();
  
  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  clearInterval(memoryInterval);
  
  const endMemory = performance.memory?.usedJSHeapSize || 0;
  const memoryGrowth = endMemory - startMemory;
  
  // Detect potential memory leak (>5MB growth)
  memoryLeakDetected = memoryGrowth > 5 * 1024 * 1024;
  
  return {
    peakMemory: peakMemory / (1024 * 1024), // Convert to MB
    memoryGrowth: memoryGrowth / (1024 * 1024), // Convert to MB
    gcCount,
    memoryLeakDetected
  };
}

// Concurrent user simulation
export async function simulateConcurrentUsers(options: {
  userCount: number;
  duration: number;
  actions: Array<{
    type: 'render' | 'api';
    component?: ReactElement;
    endpoint?: string;
    method?: string;
    payload?: any;
    iterations: number;
    weight?: number;
  }>;
}): Promise<LoadTestResult> {
  const { userCount, duration, actions } = options;
  const results: Array<{ success: boolean; responseTime: number }> = [];
  const totalWeight = actions.reduce((sum, action) => sum + (action.weight || 1), 0);
  
  // Create user simulation functions
  const userSimulations = Array(userCount).fill(null).map(async (_, userIndex) => {
    const userResults: Array<{ success: boolean; responseTime: number }> = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < duration) {
      // Select action based on weight
      const randomValue = Math.random() * totalWeight;
      let cumulativeWeight = 0;
      let selectedAction = actions[0];
      
      for (const action of actions) {
        cumulativeWeight += action.weight || 1;
        if (randomValue <= cumulativeWeight) {
          selectedAction = action;
          break;
        }
      }
      
      // Execute selected action
      for (let i = 0; i < selectedAction.iterations; i++) {
        const actionStart = performance.now();
        let success = false;
        
        try {
          if (selectedAction.type === 'render' && selectedAction.component) {
            await measureRenderTime(() => render(selectedAction.component!));
            success = true;
          } else if (selectedAction.type === 'api' && selectedAction.endpoint) {
            const response = await fetch(selectedAction.endpoint, {
              method: selectedAction.method || 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              body: selectedAction.payload ? JSON.stringify(selectedAction.payload) : undefined
            });
            success = response.ok;
          }
        } catch (error) {
          success = false;
        }
        
        const actionEnd = performance.now();
        const responseTime = actionEnd - actionStart;
        
        userResults.push({ success, responseTime });
      }
      
      // Add small delay between actions
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
    
    return userResults;
  });
  
  // Wait for all users to complete
  const allResults = await Promise.all(userSimulations);
  const flatResults = allResults.flat();
  
  // Calculate metrics
  const totalRequests = flatResults.length;
  const successfulRequests = flatResults.filter(r => r.success).length;
  const failedRequests = totalRequests - successfulRequests;
  
  const successRate = successfulRequests / totalRequests;
  const errorRate = failedRequests / totalRequests;
  
  const responseTimes = flatResults.map(r => r.responseTime);
  const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  
  // Calculate percentiles
  const sortedTimes = responseTimes.sort((a, b) => a - b);
  const p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  
  return {
    successRate,
    averageResponseTime,
    errorRate,
    totalRequests,
    successfulRequests,
    failedRequests,
    p95ResponseTime,
    p99ResponseTime
  };
}

// WebSocket performance measurement
export async function measureWebSocketPerformance(options: {
  messageCount: number;
  messageType: string;
  frequency?: number;
  testData?: any;
}): Promise<WebSocketMetrics> {
  const { messageCount, messageType, frequency = 100, testData = {} } = options;
  
  const results: Array<{ latency: number; success: boolean }> = [];
  let totalMessages = 0;
  let deliveredMessages = 0;
  
  // Mock WebSocket for testing
  const mockWebSocket = {
    send: vi.fn((data: string) => {
      const message = JSON.parse(data);
      totalMessages++;
      
      // Simulate processing time
      setTimeout(() => {
        deliveredMessages++;
        
        // Emit response
        const response = {
          type: `${message.type}_response`,
          timestamp: Date.now(),
          data: message.data
        };
        
        // Simulate message back to client
        window.postMessage(response, '*');
      }, Math.random() * 50);
    }),
    
    close: vi.fn()
  };
  
  // Mock WebSocket constructor
  global.WebSocket = vi.fn(() => mockWebSocket as any);
  
  // Message handler
  const messageHandler = vi.fn((event: MessageEvent) => {
    const receiveTime = performance.now();
    const sentTime = event.data.timestamp;
    const latency = receiveTime - sentTime;
    
    results.push({
      latency,
      success: true
    });
  });
  
  window.addEventListener('message', messageHandler);
  
  // Send messages
  for (let i = 0; i < messageCount; i++) {
    const startTime = performance.now();
    
    mockWebSocket.send(JSON.stringify({
      type: messageType,
      timestamp: startTime,
      data: { ...testData, index: i }
    }));
    
    // Wait for specified frequency
    await new Promise(resolve => setTimeout(resolve, frequency));
  }
  
  // Wait for all messages to be processed
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  window.removeEventListener('message', messageHandler);
  
  // Calculate metrics
  const averageLatency = results.length > 0 ? 
    results.reduce((sum, r) => sum + r.latency, 0) / results.length : 0;
  
  const messageLossRate = totalMessages > 0 ? 
    (totalMessages - deliveredMessages) / totalMessages : 0;
  
  const successRate = results.length > 0 ? 
    results.filter(r => r.success).length / results.length : 0;
  
  const averageThroughput = totalMessages > 0 ? 
    totalMessages / (messageCount * frequency / 1000) : 0;
  
  return {
    averageLatency,
    messageLossRate,
    successRate,
    totalMessages,
    deliveredMessages,
    averageThroughput
  };
}

// Response time measurement
export async function measureResponseTime<T>(
  testFn: () => Promise<T> | T,
  iterations: number = 1
): Promise<{ responseTime: number; processingTime: number; result?: T; totalItems?: number }> {
  const startTime = performance.now();
  const processingStart = performance.now();
  
  const result = await testFn();
  
  const processingEnd = performance.now();
  const endTime = performance.now();
  
  return {
    responseTime: (endTime - startTime) / iterations,
    processingTime: (processingEnd - processingStart) / iterations,
    result,
    totalItems: Array.isArray(result) ? result.length : undefined
  };
}

// Mobile responsiveness testing
export async function measureMobilePerformance<T>(
  testFn: () => T,
  viewport: { width: number; height: number } = { width: 375, height: 667 }
): Promise<PerformanceMetrics> {
  // Save original viewport
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;
  
  // Set mobile viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: viewport.width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewport.height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
  
  try {
    const metrics = await measureRenderTime(testFn);
    
    // Restore original viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalHeight,
    });
    
    window.dispatchEvent(new Event('resize'));
    
    return metrics;
  } catch (error) {
    // Restore original viewport on error
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalHeight,
    });
    
    window.dispatchEvent(new Event('resize'));
    
    throw error;
  }
}

// Performance thresholds configuration
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: {
    FAST: 100,    // < 100ms
    ACCEPTABLE: 200,  // < 200ms
    SLOW: 500    // < 500ms
  },
  MEMORY_USAGE: {
    LOW: 50,     // < 50MB
    MEDIUM: 100,   // < 100MB
    HIGH: 200    // < 200MB
  },
  RESPONSE_TIME: {
    FAST: 200,   // < 200ms
    ACCEPTABLE: 500,  // < 500ms
    SLOW: 1000   // < 1s
  },
  WEBSOCKET_LATENCY: {
    EXCELLENT: 50,  // < 50ms
    GOOD: 100,    // < 100ms
    ACCEPTABLE: 200 // < 200ms
  },
  CONCURRENT_USERS: {
    SUCCESS_RATE: 0.95,  // > 95%
    ERROR_RATE: 0.05     // < 5%
  }
};

// Performance assertion helpers
export function expectPerformanceThreshold(
  actual: number,
  threshold: keyof typeof PERFORMANCE_THRESHOLDS.RENDER_TIME,
  context: string = 'Performance'
) {
  const thresholds = PERFORMANCE_THRESHOLDS.RENDER_TIME;
  
  if (actual <= thresholds.FAST) {
    console.log(`✅ ${context}: ${actual}ms (Fast)`);
  } else if (actual <= thresholds.ACCEPTABLE) {
    console.log(`⚠️ ${context}: ${actual}ms (Acceptable)`);
  } else if (actual <= thresholds.SLOW) {
    console.log(`🐌 ${context}: ${actual}ms (Slow)`);
  } else {
    console.error(`❌ ${context}: ${actual}ms (Too slow)`);
  }
  
  expect(actual).toBeLessThanOrEqual(thresholds.SLOW);
}

// Performance monitoring setup
export function setupPerformanceMonitoring() {
  if ('performance' in window && 'memory' in performance) {
    // Monitor memory usage
    setInterval(() => {
      const memory = performance.memory;
      if (memory) {
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        const totalMB = memory.totalJSHeapSize / (1024 * 1024);
        const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);
        
        if (usedMB > limitMB * 0.9) {
          console.warn(`High memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB`);
        }
      }
    }, 5000);
  }
  
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 100) {
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
}

// Export performance test helpers
export const PerformanceTestUtils = {
  measureRenderTime,
  measureLoadTime,
  measureMemoryUsage,
  simulateConcurrentUsers,
  measureWebSocketPerformance,
  measureResponseTime,
  measureMobilePerformance,
  expectPerformanceThreshold,
  setupPerformanceMonitoring,
  PERFORMANCE_THRESHOLDS
};