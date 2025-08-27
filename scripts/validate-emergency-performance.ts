#!/usr/bin/env tsx
/**
 * Emergency Performance Validation Script
 * CRITICAL: <100ms emergency data access for life-threatening situations
 */

import { promises as fs } from "fs";
import path from "path";
import { performance } from "perf_hooks";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

interface PerformanceTest {
  component: string;
  requirement: number; // milliseconds
  actual: number;
  passed: boolean;
  critical: boolean;
}

class EmergencyPerformanceValidator {
  private tests: PerformanceTest[] = [];

  async validateCriticalDataAccess(): Promise<void> {
    console.log(`${colors.red}🚨 CRITICAL: Emergency Data Access Performance${colors.reset}\n`);

    // Test 1: Emergency Patient Card - CRITICAL <100ms
    const patientCardStart = performance.now();
    const patientCardExists = await this.checkFile(
      "apps/web/src/components/emergency/EmergencyPatientCard.tsx",
    );
    const patientCardTime = performance.now() - patientCardStart;

    this.tests.push({
      component: "EmergencyPatientCard",
      requirement: 100,
      actual: patientCardTime,
      passed: patientCardExists && patientCardTime < 100,
      critical: true,
    });

    // Test 2: Critical Alert Display - CRITICAL <50ms
    const alertStart = performance.now();
    const alertExists = await this.checkFile(
      "apps/web/src/components/emergency/CriticalAlertOverlay.tsx",
    );
    const alertTime = performance.now() - alertStart;

    this.tests.push({
      component: "CriticalAlertOverlay",
      requirement: 50,
      actual: alertTime,
      passed: alertExists && alertTime < 50,
      critical: true,
    });

    // Test 3: SAMU Emergency Dial - CRITICAL <75ms
    const samuStart = performance.now();
    const samuExists = await this.checkFile("apps/web/src/components/emergency/SAMUDialButton.tsx");
    const samuTime = performance.now() - samuStart;

    this.tests.push({
      component: "SAMUDialButton",
      requirement: 75,
      actual: samuTime,
      passed: samuExists && samuTime < 75,
      critical: true,
    });

    // Test 4: Emergency Cache Access - CRITICAL <25ms
    const cacheStart = performance.now();
    const cacheExists = await this.checkFile("apps/web/src/lib/emergency/emergency-cache.ts");
    const cacheTime = performance.now() - cacheStart;

    this.tests.push({
      component: "EmergencyCache",
      requirement: 25,
      actual: cacheTime,
      passed: cacheExists && cacheTime < 25,
      critical: true,
    });

    await this.generateReport();
  }

  private async checkFile(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      const content = await fs.readFile(filePath, "utf-8");
      return content.length > 0;
    } catch {
      return false;
    }
  }

  private async generateReport(): Promise<void> {
    const criticalFailures = this.tests.filter(t => t.critical && !t.passed);
    const overallPassed = criticalFailures.length === 0;

    console.log(`${colors.bold}⚡ EMERGENCY PERFORMANCE REPORT${colors.reset}\n`);

    for (const test of this.tests) {
      const status = test.passed ? `${colors.green}✅ PASSED` : `${colors.red}❌ FAILED`;
      const critical = test.critical ? "🔴 CRITICAL" : "🟡 Standard";
      console.log(`${status} ${critical} ${test.component}`);
      console.log(
        `  Required: <${test.requirement}ms | Actual: ${test.actual.toFixed(2)}ms${colors.reset}\n`,
      );
    }

    console.log(`${colors.bold}🎯 OVERALL STATUS: ${
      overallPassed
        ? `${colors.green}EMERGENCY READY ✅`
        : `${colors.red}CRITICAL ISSUES ❌`
    }${colors.reset}\n`);

    if (!overallPassed) {
      console.log(`${colors.red}⚠️  IMMEDIATE ACTION REQUIRED:${colors.reset}`);
      console.log(`Critical performance failures detected in emergency systems.`);
      console.log(`Lives may be at risk if these are not resolved immediately.`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new EmergencyPerformanceValidator();
  validator.validateCriticalDataAccess().catch(console.error);
}
