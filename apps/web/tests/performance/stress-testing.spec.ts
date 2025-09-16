/**
 * PERFORMANCE TEST: Patient dashboard stress testing (T030)
 * 
 * Tests system behavior under extreme load conditions:
 * - Breaking point identification
 * - Resource exhaustion scenarios
 * - Error handling under stress
 * - Recovery capabilities
 * - Brazilian healthcare emergency scenarios
 * - System limits and capacity planning
 */

import { test, expect, chromium } from '@playwright/test';

// Stress testing configuration
const STRESS_TEST_CONFIG = {
  MAX_CONCURRENT_USERS: 100,
  RAMP_UP_STEPS: [5, 10, 20, 30, 50, 75, 100],
  TEST_DURATION_MS: 10 * 60 * 1000, // 10 minutes
  ERROR_THRESHOLD_PERCENT: 5, // Max 5% error rate acceptable
  RESPONSE_TIME_THRESHOLD_MS: 10000, // 10 seconds max response time
  MEMORY_LIMIT_MB: 500, // 500MB per browser instance
};

// Brazilian healthcare emergency scenarios
const EMERGENCY_SCENARIOS = {
  PANDEMIC_SURGE: {
    description: 'COVID-19 surge with 10x normal traffic',
    multiplier: 10,
    duration: 5 * 60 * 1000, // 5 minutes
  },
  HOSPITAL_EMERGENCY: {
    description: 'Mass casualty event requiring rapid patient processing',
    multiplier: 5,
    duration: 10 * 60 * 1000, // 10 minutes
  },
  SYSTEM_MIGRATION: {
    description: 'System migration with all users switching simultaneously',
    multiplier: 3,
    duration: 15 * 60 * 1000, // 15 minutes
  },
};

// Stress test utilities
class StressTester {
  private browsers: any[] = [];
  private contexts: any[] = [];
  private pages: any[] = [];
  private errorCounts: Map<string, number> = new Map();
  private responseTimes: number[] = [];
  private memoryUsages: number[] = [];

  async rampUpUsers(targetUserCount: number, rampUpDurationMs: number) {
    const userBatches = Math.ceil(targetUserCount / 5); // Add 5 users at a time
    const batchInterval = rampUpDurationMs / userBatches;

    for (let batch = 0; batch < userBatches; batch++) {
      const usersThisBatch = Math.min(5, targetUserCount - this.browsers.length);
      
      console.log(`Adding batch ${batch + 1}/${userBatches}: ${usersThisBatch} users (Total: ${this.browsers.length + usersThisBatch})`);
      
      // Create users in parallel
      const userPromises = Array.from({ length: usersThisBatch }, async (_, index) => {
        try {
          const browser = await chromium.launch({ 
            headless: true,
            args: ['--memory-pressure-off', '--max_old_space_size=256']
          });
          
          const context = await browser.newContext({
            userAgent: `StressTest-User-${this.browsers.length + index}`,
            viewport: { width: 1280, height: 720 },
          });
          
          const page = await context.newPage();
          
          // Monitor errors and performance
          page.on('pageerror', error => {
            this.recordError('page_error', error.message);
          });
          
          page.on('response', response => {
            if (response.url().includes('/api/')) {
              const timing = response.timing();
              if (timing) {
                this.responseTimes.push(timing.responseEnd);
              }
              
              if (response.status() >= 400) {
                this.recordError('api_error', `${response.status()} ${response.url()}`);
              }
            }
          });
          
          this.browsers.push(browser);
          this.contexts.push(context);
          this.pages.push(page);
          
          // Login immediately
          await this.loginUser(page, this.browsers.length - 1);
          
        } catch (error) {
          this.recordError('user_creation', error.message);
          console.warn(`Failed to create user: ${error.message}`);
        }
      });

      await Promise.all(userPromises);
      
      // Wait between batches
      if (batch < userBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, batchInterval));
      }
    }

    console.log(`Ramp-up completed: ${this.browsers.length} users active`);
  }

  private async loginUser(page: any, userIndex: number) {
    try {
      const startTime = Date.now();
      
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', `stresstest${userIndex}@clinic.com.br`);
      await page.fill('[data-testid="password-input"]', 'StressTest123!');
      await page.fill('[data-testid="crm-input"]', `CRM-SP-${String(userIndex + 300000).padStart(6, '0')}`);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard', { timeout: 30000 });
      
      const loginTime = Date.now() - startTime;
      this.responseTimes.push(loginTime);
      
      if (loginTime > STRESS_TEST_CONFIG.RESPONSE_TIME_THRESHOLD_MS) {
        this.recordError('slow_login', `Login took ${loginTime}ms`);
      }
      
    } catch (error) {
      this.recordError('login_failure', error.message);
      throw error;
    }
  }

  async executeStressScenario(durationMs: number, actionFrequencyMs: number = 2000) {
    const endTime = Date.now() + durationMs;
    const userActions: Promise<void>[] = [];

    console.log(`Starting stress scenario: ${this.pages.length} users for ${durationMs/1000} seconds`);

    this.pages.forEach((page, userIndex) => {
      const userPromise = this.executeUserStressActions(page, userIndex, endTime, actionFrequencyMs);
      userActions.push(userPromise);
    });

    // Monitor system resources during stress test
    const resourceMonitor = this.monitorSystemResources(endTime);
    
    await Promise.all([...userActions, resourceMonitor]);
  }

  private async executeUserStressActions(page: any, userIndex: number, endTime: number, actionFrequencyMs: number) {
    while (Date.now() < endTime) {
      try {
        // Aggressive user behavior patterns
        const actions = [
          () => this.rapidPatientSearch(page),
          () => this.rapidPatientViewing(page),
          () => this.concurrentFormFilling(page),
          () => this.heavyDataOperations(page),
          () => this.emergencyPatientAccess(page),
        ];

        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const actionStartTime = Date.now();
        
        await randomAction();
        
        const actionDuration = Date.now() - actionStartTime;
        this.responseTimes.push(actionDuration);

        if (actionDuration > STRESS_TEST_CONFIG.RESPONSE_TIME_THRESHOLD_MS) {
          this.recordError('slow_action', `Action took ${actionDuration}ms for user ${userIndex}`);
        }

        // Reduced wait time for stress testing
        await page.waitForTimeout(Math.random() * actionFrequencyMs);

      } catch (error) {
        this.recordError('action_failure', `User ${userIndex}: ${error.message}`);
        
        // Try to recover
        try {
          await page.goto('/dashboard');
          await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
        } catch (recoveryError) {
          this.recordError('recovery_failure', `User ${userIndex} recovery failed`);
        }
      }
    }
  }

  private async rapidPatientSearch(page: any) {
    const searchTerms = ['João', 'Maria', 'Silva', 'Santos', 'Ana', 'Carlos', 'Fernanda'];
    
    for (let i = 0; i < 5; i++) {
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      await page.fill('[data-testid="patient-search-input"]', term);
      await page.waitForTimeout(100);
    }
    
    await page.fill('[data-testid="patient-search-input"]', '');
  }

  private async rapidPatientViewing(page: any) {
    const patientCards = page.locator('[data-testid="patient-card"]');
    const cardCount = Math.min(await patientCards.count(), 10);
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      await patientCards.nth(i).click();
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(200);
    }
  }

  private async concurrentFormFilling(page: any) {
    // Simulate rapid form interactions
    await page.click('[data-testid="add-patient-button"]');
    
    const formFields = [
      { selector: '[data-testid="name-input"]', value: 'Paciente Teste Stress' },
      { selector: '[data-testid="cpf-input"]', value: '123.456.789-00' },
      { selector: '[data-testid="phone-input"]', value: '(11) 99999-9999' },
      { selector: '[data-testid="email-input"]', value: 'stress@test.com' },
    ];

    // Fill all fields rapidly
    for (const field of formFields) {
      await page.fill(field.selector, field.value);
      await page.waitForTimeout(50);
    }

    // Cancel to avoid creating test data
    await page.click('[data-testid="cancel-button"]');
  }

  private async heavyDataOperations(page: any) {
    // Navigate to data-heavy pages
    await page.click('[data-testid="reports-menu"]');
    await page.waitForTimeout(1000);
    
    // Request large report
    await page.click('[data-testid="generate-report-button"]');
    await page.waitForTimeout(2000);
    
    // Navigate back
    await page.click('[data-testid="dashboard-menu"]');
  }

  private async emergencyPatientAccess(page: any) {
    // Simulate emergency patient lookup pattern
    await page.fill('[data-testid="patient-search-input"]', '123.456.789-00');
    await page.waitForTimeout(300);
    
    const searchResults = page.locator('[data-testid="search-result"]');
    if (await searchResults.count() > 0) {
      await searchResults.first().click();
      await page.waitForTimeout(500);
      
      // Quick access to emergency info
      await page.click('[data-testid="emergency-info-tab"]');
      await page.waitForTimeout(300);
    }
    
    await page.fill('[data-testid="patient-search-input"]', '');
  }

  private async monitorSystemResources(endTime: number) {
    while (Date.now() < endTime) {
      // Collect memory usage from all pages
      const memoryPromises = this.pages.map(async (page, index) => {
        try {
          const memory = await page.evaluate(() => {
            return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
          });
          return { userIndex: index, memory };
        } catch (error) {
          return { userIndex: index, memory: 0 };
        }
      });

      const memoryResults = await Promise.all(memoryPromises);
      const totalMemory = memoryResults.reduce((sum, result) => sum + result.memory, 0);
      this.memoryUsages.push(totalMemory / 1024 / 1024); // Convert to MB

      // Check for users exceeding memory limits
      memoryResults.forEach(result => {
        const memoryMB = result.memory / 1024 / 1024;
        if (memoryMB > STRESS_TEST_CONFIG.MEMORY_LIMIT_MB) {
          this.recordError('memory_limit', `User ${result.userIndex} using ${memoryMB.toFixed(2)}MB`);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
    }
  }

  private recordError(type: string, message: string) {
    const count = this.errorCounts.get(type) || 0;
    this.errorCounts.set(type, count + 1);
    console.warn(`Error [${type}]: ${message}`);
  }

  getStressTestResults() {
    const totalActions = this.responseTimes.length;
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const errorRate = totalActions > 0 ? (totalErrors / totalActions) * 100 : 0;

    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length 
      : 0;

    const p95ResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.sort((a, b) => a - b)[Math.floor(this.responseTimes.length * 0.95)]
      : 0;

    const maxMemoryUsage = Math.max(...this.memoryUsages, 0);
    const avgMemoryUsage = this.memoryUsages.length > 0
      ? this.memoryUsages.reduce((sum, usage) => sum + usage, 0) / this.memoryUsages.length
      : 0;

    return {
      totalUsers: this.browsers.length,
      totalActions,
      totalErrors,
      errorRate,
      avgResponseTime,
      p95ResponseTime,
      maxMemoryUsage,
      avgMemoryUsage,
      errorBreakdown: Object.fromEntries(this.errorCounts),
    };
  }

  async cleanup() {
    console.log('Cleaning up stress test resources...');
    
    const cleanupPromises = this.browsers.map(async (browser, index) => {
      try {
        await browser.close();
      } catch (error) {
        console.warn(`Failed to close browser ${index}: ${error.message}`);
      }
    });

    await Promise.allSettled(cleanupPromises);
    
    this.browsers = [];
    this.contexts = [];
    this.pages = [];
    this.errorCounts.clear();
    this.responseTimes = [];
    this.memoryUsages = [];
  }
}

test.describe('Patient Dashboard Stress Testing', () => {
  let stressTester: StressTester;

  test.afterEach(async () => {
    if (stressTester) {
      await stressTester.cleanup();
    }
  });

  test('should identify breaking point with incremental load', async () => {
    stressTester = new StressTester();
    
    console.log('Starting incremental stress test...');
    
    for (const userCount of STRESS_TEST_CONFIG.RAMP_UP_STEPS) {
      console.log(`\n=== Testing with ${userCount} concurrent users ===`);
      
      try {
        // Ramp up to target user count
        await stressTester.rampUpUsers(userCount, 30000); // 30 second ramp-up
        
        // Execute stress scenario
        await stressTester.executeStressScenario(60000, 1000); // 1 minute, 1 second intervals
        
        const results = stressTester.getStressTestResults();
        
        console.log(`Results for ${userCount} users:`);
        console.log(`- Error rate: ${results.errorRate.toFixed(2)}%`);
        console.log(`- Avg response time: ${results.avgResponseTime.toFixed(0)}ms`);
        console.log(`- P95 response time: ${results.p95ResponseTime.toFixed(0)}ms`);
        console.log(`- Max memory usage: ${results.maxMemoryUsage.toFixed(2)}MB`);
        
        // Check if system is still performing acceptably
        const systemHealthy = 
          results.errorRate < STRESS_TEST_CONFIG.ERROR_THRESHOLD_PERCENT &&
          results.p95ResponseTime < STRESS_TEST_CONFIG.RESPONSE_TIME_THRESHOLD_MS &&
          results.maxMemoryUsage < 1000; // 1GB total memory limit
        
        if (!systemHealthy) {
          console.log(`\n🚨 BREAKING POINT IDENTIFIED: System degraded at ${userCount} concurrent users`);
          console.log(`- Error rate: ${results.errorRate.toFixed(2)}% (threshold: ${STRESS_TEST_CONFIG.ERROR_THRESHOLD_PERCENT}%)`);
          console.log(`- P95 response time: ${results.p95ResponseTime.toFixed(0)}ms (threshold: ${STRESS_TEST_CONFIG.RESPONSE_TIME_THRESHOLD_MS}ms)`);
          
          // Log error breakdown
          if (Object.keys(results.errorBreakdown).length > 0) {
            console.log('Error breakdown:');
            Object.entries(results.errorBreakdown).forEach(([type, count]) => {
              console.log(`  - ${type}: ${count}`);
            });
          }
          
          break;
        }
        
        console.log(`✅ System healthy with ${userCount} users`);
        
        // Clean up before next iteration (except for the last one)
        if (userCount !== STRESS_TEST_CONFIG.RAMP_UP_STEPS[STRESS_TEST_CONFIG.RAMP_UP_STEPS.length - 1]) {
          await stressTester.cleanup();
          stressTester = new StressTester();
        }
        
      } catch (error) {
        console.error(`Failed at ${userCount} users: ${error.message}`);
        break;
      }
    }
  });

  test('should handle pandemic surge scenario', async () => {
    stressTester = new StressTester();
    const scenario = EMERGENCY_SCENARIOS.PANDEMIC_SURGE;
    
    console.log(`\n=== ${scenario.description} ===`);
    
    // Simulate sudden spike in traffic
    const baseUsers = 10;
    const surgeUsers = baseUsers * scenario.multiplier;
    
    console.log(`Ramping up from ${baseUsers} to ${surgeUsers} users in 60 seconds...`);
    
    // Create base load
    await stressTester.rampUpUsers(baseUsers, 10000);
    console.log(`Base load established: ${baseUsers} users`);
    
    // Sudden surge
    await stressTester.rampUpUsers(surgeUsers, 60000);
    console.log(`Surge completed: ${surgeUsers} users`);
    
    // Execute pandemic scenario with rapid patient processing
    await stressTester.executeStressScenario(scenario.duration, 500); // 500ms intervals
    
    const results = stressTester.getStressTestResults();
    
    console.log('\n=== Pandemic Surge Results ===');
    console.log(`- Total users simulated: ${results.totalUsers}`);
    console.log(`- Error rate: ${results.errorRate.toFixed(2)}%`);
    console.log(`- Average response time: ${results.avgResponseTime.toFixed(0)}ms`);
    console.log(`- P95 response time: ${results.p95ResponseTime.toFixed(0)}ms`);
    console.log(`- Peak memory usage: ${results.maxMemoryUsage.toFixed(2)}MB`);
    
    // Emergency scenarios should maintain basic functionality
    expect(results.errorRate).toBeLessThan(10); // Allow higher error rate during emergency
    expect(results.p95ResponseTime).toBeLessThan(15000); // 15 second emergency threshold
    expect(results.avgResponseTime).toBeLessThan(5000); // 5 second average threshold
  });

  test('should handle resource exhaustion gracefully', async () => {
    stressTester = new StressTester();
    
    console.log('\n=== Resource Exhaustion Test ===');
    
    // Create maximum load
    const maxUsers = 75;
    await stressTester.rampUpUsers(maxUsers, 45000); // 45 second ramp-up
    
    // Execute intensive operations to exhaust resources
    console.log('Executing resource-intensive operations...');
    
    const intensiveActions = async (page: any) => {
      try {
        // Memory-intensive operations
        await page.evaluate(() => {
          // Create large arrays to consume memory
          const largeData = new Array(100000).fill(0).map((_, i) => ({
            id: i,
            data: new Array(100).fill(`data-${i}`),
            timestamp: Date.now(),
          }));
          
          // Store in window to prevent garbage collection
          (window as any).testData = largeData;
        });
        
        // CPU-intensive operations
        await page.evaluate(() => {
          let result = 0;
          for (let i = 0; i < 1000000; i++) {
            result += Math.sin(i) * Math.cos(i);
          }
          return result;
        });
        
        // DOM-intensive operations
        for (let i = 0; i < 10; i++) {
          await page.fill('[data-testid="patient-search-input"]', `intensive-search-${i}`);
          await page.waitForTimeout(100);
        }
        
      } catch (error) {
        console.warn('Intensive operation failed:', error.message);
      }
    };

    // Execute resource exhaustion scenario
    const exhaustionPromises = stressTester.pages.map(intensiveActions);
    await Promise.allSettled(exhaustionPromises);
    
    // Continue with normal operations to test recovery
    await stressTester.executeStressScenario(120000, 2000); // 2 minutes
    
    const results = stressTester.getStressTestResults();
    
    console.log('\n=== Resource Exhaustion Results ===');
    console.log(`- Error rate: ${results.errorRate.toFixed(2)}%`);
    console.log(`- Peak memory usage: ${results.maxMemoryUsage.toFixed(2)}MB`);
    console.log(`- System recovery capability assessed`);
    
    // System should handle resource exhaustion gracefully
    expect(results.errorRate).toBeLessThan(20); // Allow higher error rate during exhaustion
    expect(results.maxMemoryUsage).toBeLessThan(2000); // 2GB memory limit
    
    // Check error distribution
    const errorTypes = Object.keys(results.errorBreakdown);
    console.log('Error types encountered:', errorTypes);
    
    // Should not have critical system failures
    expect(results.errorBreakdown['recovery_failure'] || 0).toBeLessThan(10);
  });

  test('should validate system recovery after stress', async () => {
    stressTester = new StressTester();
    
    console.log('\n=== System Recovery Test ===');
    
    // Apply heavy stress
    await stressTester.rampUpUsers(50, 30000);
    await stressTester.executeStressScenario(180000, 500); // 3 minutes high stress
    
    const stressResults = stressTester.getStressTestResults();
    console.log(`Stress phase completed - Error rate: ${stressResults.errorRate.toFixed(2)}%`);
    
    // Clean up and test recovery
    await stressTester.cleanup();
    stressTester = new StressTester();
    
    console.log('Testing system recovery...');
    
    // Light load after stress
    await stressTester.rampUpUsers(5, 10000);
    await stressTester.executeStressScenario(60000, 3000); // 1 minute light load
    
    const recoveryResults = stressTester.getStressTestResults();
    
    console.log('\n=== Recovery Results ===');
    console.log(`- Recovery error rate: ${recoveryResults.errorRate.toFixed(2)}%`);
    console.log(`- Recovery response time: ${recoveryResults.avgResponseTime.toFixed(0)}ms`);
    console.log(`- Recovery memory usage: ${recoveryResults.avgMemoryUsage.toFixed(2)}MB`);
    
    // System should recover to normal performance levels
    expect(recoveryResults.errorRate).toBeLessThan(2); // Very low error rate after recovery
    expect(recoveryResults.avgResponseTime).toBeLessThan(2000); // Normal response times
    expect(recoveryResults.avgMemoryUsage).toBeLessThan(200); // Normal memory usage
    
    console.log('✅ System recovery validated');
  });

  test('should test Brazilian healthcare peak hours simulation', async () => {
    stressTester = new StressTester();
    
    console.log('\n=== Brazilian Healthcare Peak Hours Simulation ===');
    
    // Simulate morning peak (8-11 AM)
    console.log('Simulating morning peak hours...');
    await stressTester.rampUpUsers(30, 20000); // Gradual morning ramp-up
    await stressTester.executeStressScenario(120000, 1500); // 2 minutes
    
    const morningResults = stressTester.getStressTestResults();
    
    // Simulate lunch break (low activity)
    console.log('Simulating lunch break...');
    await stressTester.cleanup();
    stressTester = new StressTester();
    await stressTester.rampUpUsers(8, 10000);
    await stressTester.executeStressScenario(60000, 5000); // 1 minute
    
    const lunchResults = stressTester.getStressTestResults();
    
    // Simulate afternoon peak (2-5 PM)
    console.log('Simulating afternoon peak hours...');
    await stressTester.rampUpUsers(40, 25000); // Higher afternoon load
    await stressTester.executeStressScenario(180000, 1200); // 3 minutes
    
    const afternoonResults = stressTester.getStressTestResults();
    
    console.log('\n=== Brazilian Peak Hours Results ===');
    console.log(`Morning peak (${morningResults.totalUsers} users):`);
    console.log(`  - Error rate: ${morningResults.errorRate.toFixed(2)}%`);
    console.log(`  - Avg response: ${morningResults.avgResponseTime.toFixed(0)}ms`);
    
    console.log(`Lunch break (${lunchResults.totalUsers} users):`);
    console.log(`  - Error rate: ${lunchResults.errorRate.toFixed(2)}%`);
    console.log(`  - Avg response: ${lunchResults.avgResponseTime.toFixed(0)}ms`);
    
    console.log(`Afternoon peak (${afternoonResults.totalUsers} users):`);
    console.log(`  - Error rate: ${afternoonResults.errorRate.toFixed(2)}%`);
    console.log(`  - Avg response: ${afternoonResults.avgResponseTime.toFixed(0)}ms`);
    
    // Peak hours should maintain acceptable performance
    expect(morningResults.errorRate).toBeLessThan(5);
    expect(afternoonResults.errorRate).toBeLessThan(5);
    expect(lunchResults.errorRate).toBeLessThan(1); // Very low during lunch
    
    // Lunch period should have best performance
    expect(lunchResults.avgResponseTime).toBeLessThan(morningResults.avgResponseTime);
    expect(lunchResults.avgResponseTime).toBeLessThan(afternoonResults.avgResponseTime);
  });
});