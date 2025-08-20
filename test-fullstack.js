#!/usr/bin/env node
/**
 * Full-Stack Integration Test for NeonPro
 * Tests frontend pages and backend API integration
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Test configuration
const BACKEND_URL = 'http://localhost:3003';
const FRONTEND_URL = 'http://localhost:3002';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testEndpoint(url, expectedStatus = 200, method = 'GET', body = null) {
  try {
    const curlCmd = method === 'GET' 
      ? `curl -s -o nul -w "%{http_code}" "${url}"`
      : `curl -s -o nul -w "%{http_code}" -X ${method} -H "Content-Type: application/json" ${body ? `-d '${JSON.stringify(body)}'` : ''} "${url}"`;
    
    const { stdout } = await execAsync(curlCmd);
    const status = parseInt(stdout.trim());
    
    if (status === expectedStatus) {
      log(colors.green, `✅ ${method} ${url} - ${status}`);
      return true;
    } else {
      log(colors.red, `❌ ${method} ${url} - Expected ${expectedStatus}, got ${status}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `❌ ${method} ${url} - Error: ${error.message}`);
    return false;
  }
}

async function testFrontendPage(path, expectedStatus = 200) {
  return testEndpoint(`${FRONTEND_URL}${path}`, expectedStatus);
}

async function testBackendAPI(path, expectedStatus = 200, method = 'GET', body = null) {
  return testEndpoint(`${BACKEND_URL}${path}`, expectedStatus, method, body);
}

async function runTests() {
  log(colors.bold + colors.blue, '\n🧪 NEONPRO FULL-STACK INTEGRATION TEST');
  log(colors.blue, '================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  // Backend API Tests
  log(colors.yellow, '🔧 Backend API Tests:');
  const backendTests = [
    ['/', 200],
    ['/health', 200],
    ['/api/v1/auth/login', 405, 'GET'], // Should require POST
    ['/api/v1/clinics', 401], // Should require auth
    ['/api/v1/patients', 401], // Should require auth
    ['/api/v1/appointments', 401], // Should require auth
  ];

  for (const [path, expectedStatus, method] of backendTests) {
    totalTests++;
    if (await testBackendAPI(path, expectedStatus, method || 'GET')) {
      passedTests++;
    }
  }

  // Frontend Page Tests
  log(colors.yellow, '\n🎨 Frontend Page Tests:');
  const frontendTests = [
    ['/login', 200],
    ['/register', 200],
    ['/reset-password', 200],
    ['/patients', 200],
    ['/patients/new', 200],
    ['/dashboard', 200],
  ];

  for (const [path, expectedStatus] of frontendTests) {
    totalTests++;
    if (await testFrontendPage(path, expectedStatus)) {
      passedTests++;
    }
  }

  // API Integration Tests (simulated user flows)
  log(colors.yellow, '\n🔗 API Integration Tests:');
  
  // Test patient creation flow (should fail without auth, which is expected)
  totalTests++;
  if (await testBackendAPI('/api/v1/patients', 401, 'POST', { name: 'Test Patient', email: 'test@example.com' })) {
    passedTests++;
  }

  // Results Summary
  log(colors.blue, '\n================================================');
  log(colors.bold + colors.blue, '📊 TEST RESULTS SUMMARY');
  log(colors.blue, '================================================');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  if (passedTests === totalTests) {
    log(colors.green, `🎉 ALL TESTS PASSED! (${passedTests}/${totalTests})`);
    log(colors.green, `✅ Success Rate: ${successRate}%`);
    log(colors.green, '\n🚀 System is ready for development and testing!');
  } else {
    log(colors.yellow, `⚠️  SOME TESTS FAILED (${passedTests}/${totalTests})`);
    log(colors.yellow, `📈 Success Rate: ${successRate}%`);
    log(colors.yellow, '\n🔧 Review failed tests and fix issues before proceeding.');
  }

  // Next Steps
  log(colors.blue, '\n📋 NEXT STEPS:');
  log(colors.reset, '1. 🔐 Implement authentication flow');
  log(colors.reset, '2. 🔄 Test authenticated API calls');
  log(colors.reset, '3. 🎨 Complete UI integration with real data');
  log(colors.reset, '4. 🚀 Deploy to Vercel production');
  log(colors.reset, '');

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', () => {
  log(colors.yellow, '\n⚠️  Test interrupted by user');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(colors.red, `\n💥 Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  log(colors.red, `\n💥 Test execution failed: ${error.message}`);
  process.exit(1);
});