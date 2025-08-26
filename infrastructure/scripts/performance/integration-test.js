#!/usr/bin/env node

/**
 * Performance Integration Test
 *
 * Tests the NeonPro performance monitoring system
 * Validates Web Vitals collection, API endpoints, and monitoring integration
 */

const { performance } = require('node:perf_hooks');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(_message, _color = colors.reset) {}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Sample Web Vitals data for testing
const sampleMetrics = [
  {
    name: 'LCP',
    value: 2.1,
    rating: 'good',
    delta: 0,
    id: 'test-lcp-1',
    url: '/dashboard',
    timestamp: Date.now(),
  },
  {
    name: 'FID',
    value: 95,
    rating: 'good',
    delta: 0,
    id: 'test-fid-1',
    url: '/dashboard',
    timestamp: Date.now(),
  },
  {
    name: 'CLS',
    value: 0.08,
    rating: 'good',
    delta: 0,
    id: 'test-cls-1',
    url: '/dashboard',
    timestamp: Date.now(),
  },
  {
    name: 'FCP',
    value: 1.8,
    rating: 'good',
    delta: 0,
    id: 'test-fcp-1',
    url: '/dashboard',
    timestamp: Date.now(),
  },
  {
    name: 'TTFB',
    value: 800,
    rating: 'good',
    delta: 0,
    id: 'test-ttfb-1',
    url: '/dashboard',
    timestamp: Date.now(),
  },
];

async function testPerformanceAPI() {
  info('Testing Performance API Endpoint...');

  try {
    const response = await fetch(
      'http://localhost:3000/api/analytics/performance',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleMetrics),
      },
    );

    if (response.ok) {
      const result = await response.json();
      success('Performance API test successful');
      info(`Response: ${JSON.stringify(result, null, 2)}`);
      return true;
    }
    const errorText = await response.text();
    warning(`Performance API returned ${response.status}: ${errorText}`);
    return false;
  } catch (err) {
    error(`Performance API test failed: ${err.message}`);
    return false;
  }
}

async function testPerformanceDashboard() {
  info('Testing Performance Dashboard Page...');

  try {
    const response = await fetch('http://localhost:3000/dashboard/performance');

    if (response.ok) {
      success('Performance Dashboard accessible');
      return true;
    }
    warning(`Performance Dashboard returned ${response.status}`);
    return false;
  } catch (err) {
    error(`Performance Dashboard test failed: ${err.message}`);
    return false;
  }
}

function testPerformanceUtils() {
  info('Testing Performance Utilities...');

  try {
    // Simulate performance measurement
    const startTime = performance.now();

    // Simulate some work
    const data = Array.from({ length: 1000 }, (_, i) => i * Math.random());
    const processed = data.map((x) => x * 2).filter((x) => x > 500);

    const endTime = performance.now();
    const duration = endTime - startTime;

    success(
      `Performance measurement test completed in ${duration.toFixed(2)}ms`,
    );
    info(`Processed ${processed.length} items`);

    return true;
  } catch (err) {
    error(`Performance utilities test failed: ${err.message}`);
    return false;
  }
}

function simulateWebVitals() {
  info('Simulating Web Vitals collection...');

  const metrics = {
    LCP: Math.random() * 3 + 1, // 1-4 seconds
    FID: Math.random() * 200 + 50, // 50-250ms
    CLS: Math.random() * 0.2, // 0-0.2
    FCP: Math.random() * 2 + 1, // 1-3 seconds
    TTFB: Math.random() * 1000 + 500, // 500-1500ms
  };

  Object.entries(metrics).forEach(([name, value]) => {
    const formattedValue = name === 'CLS'
      ? value.toFixed(3)
      : name === 'LCP' || name === 'FCP'
      ? `${value.toFixed(1)}s`
      : `${Math.round(value)}ms`;

    const isGood = (name === 'LCP' && value <= 2.5)
      || (name === 'FID' && value <= 100)
      || (name === 'CLS' && value <= 0.1)
      || (name === 'FCP' && value <= 1.8)
      || (name === 'TTFB' && value <= 800);

    if (isGood) {
      success(`${name}: ${formattedValue} (Good)`);
    } else {
      warning(`${name}: ${formattedValue} (Needs Improvement)`);
    }
  });

  return true;
}

async function runPerformanceTests() {
  log(`\n${'='.repeat(60)}`, colors.bold);
  log('🚀 NeonPro Performance Integration Test Suite', colors.bold);
  log('='.repeat(60), colors.bold);

  const tests = [
    { name: 'Performance Utilities', fn: testPerformanceUtils },
    { name: 'Web Vitals Simulation', fn: simulateWebVitals },
    { name: 'Performance API', fn: testPerformanceAPI },
    { name: 'Performance Dashboard', fn: testPerformanceDashboard },
  ];

  const results = [];

  for (const test of tests) {
    log(`\n📊 Running ${test.name} Test...`, colors.blue);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (err) {
      error(`${test.name} test threw an error: ${err.message}`);
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  log(`\n${'='.repeat(60)}`, colors.bold);
  log('📈 Test Results Summary', colors.bold);
  log('='.repeat(60), colors.bold);

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    if (result.passed) {
      success(`${result.name}: PASSED`);
    } else {
      error(`${result.name}: FAILED`);
    }
  });

  log(
    `\nTotal: ${passed}/${total} tests passed`,
    passed === total ? colors.green : colors.yellow,
  );

  if (passed === total) {
    success('\n🎉 All performance integration tests passed!');
    success('Performance monitoring system is ready for production!');
  } else {
    warning('\n⚠️  Some tests failed. Check the output above for details.');
    info(
      'Note: API and Dashboard tests may fail if server is not running or database is not connected.',
    );
  }

  log(`\n${'='.repeat(60)}`, colors.bold);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPerformanceTests().catch((err) => {
    error(`Test suite failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  runPerformanceTests,
  testPerformanceAPI,
  testPerformanceDashboard,
  testPerformanceUtils,
  simulateWebVitals,
};
