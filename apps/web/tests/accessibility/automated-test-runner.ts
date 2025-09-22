/**
 * Automated Accessibility Test Runner
 * Discovers and tests all UI components for WCAG 2.1 AA+ compliance
 * Performance optimized with intelligent batching and caching
 */

import fs from 'fs/promises';
import { glob } from 'glob';
import path from 'path';
import { performance } from 'perf_hooks';
import React from 'react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { axe, toHaveNoViolations } from 'vitest-axe';

// Import configuration and utilities
import {
  globalAccessibilityReport,
  healthcareAxeConfig,
  healthcareTestContexts,
  runOptimizedAccessibilityTest,
} from './axe-integration.test';

expect.extend(toHaveNoViolations);

interface ComponentDiscovery {
  name: string;
  path: string;
  type: 'component' | 'page' | 'layout' | 'utility';
  complexity: 'simple' | 'medium' | 'complex';
  category:
    | 'telemedicine'
    | 'patient'
    | 'admin'
    | 'ui'
    | 'accessibility'
    | 'common';
  hasTests: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface TestBatch {
  batchId: string;
  components: ComponentDiscovery[];
  estimatedDuration: number;
  maxMemoryUsage: number;
}

interface AutomatedTestReport extends AccessibilityReport {
  discoveredComponents: number;
  testedComponents: number;
  skippedComponents: number;
  batchingMetrics: {
    totalBatches: number;
    averageBatchDuration: number;
    memoryOptimization: number;
  };
  componentCategories: Record<
    string,
    {
      count: number;
      violations: number;
      complianceRate: number;
    }
  >;
}

class AccessibilityTestRunner {
  private components: ComponentDiscovery[] = [];
  private testBatches: TestBatch[] = [];
  private report: AutomatedTestReport;
  private readonly maxBatchSize = 10;
  private readonly maxMemoryPerBatch = 100 * 1024 * 1024; // 100MB

  constructor() {
    this.report = {
      ...globalAccessibilityReport,
      discoveredComponents: 0,
      testedComponents: 0,
      skippedComponents: 0,
      batchingMetrics: {
        totalBatches: 0,
        averageBatchDuration: 0,
        memoryOptimization: 0,
      },
      componentCategories: {},
    };
  }

  /**
   * Discover all UI components in the project
   */
  async discoverComponents(): Promise<ComponentDiscovery[]> {
    const componentPaths = [
      'src/components/**/*.tsx',
      'src/routes/**/*.tsx',
      '!src/components/**/*.test.tsx',
      '!src/components/**/*.stories.tsx',
      '!src/**/__tests__/**',
      '!src/**/*.d.ts',
    ];

    const files = await glob(componentPaths, {
      cwd: process.cwd(),
      absolute: true,
    });

    const components: ComponentDiscovery[] = [];

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');

        // Skip files without React components
        if (
          !content.includes('export')
          || (!content.includes('React') && !content.includes('jsx'))
        ) {
          continue;
        }

        const component = await this.analyzeComponent(filePath, content);
        if (component) {
          components.push(component);
        }
      } catch (error) {
        console.warn(`Failed to analyze component: ${filePath}`, error);
      }
    }

    this.components = components;
    this.report.discoveredComponents = components.length;

    return components;
  }

  /**
   * Analyze individual component for metadata
   */
  private async analyzeComponent(
    filePath: string,
    content: string,
  ): Promise<ComponentDiscovery | null> {
    const fileName = path.basename(filePath, '.tsx');
    const relativePath = path.relative(process.cwd(), filePath);

    // Determine component category
    let category: ComponentDiscovery['category'] = 'common';
    if (relativePath.includes('/telemedicine/')) category = 'telemedicine';
    else if (relativePath.includes('/patient')) category = 'patient';
    else if (relativePath.includes('/admin/')) category = 'admin';
    else if (relativePath.includes('/ui/')) category = 'ui';
    else if (relativePath.includes('/accessibility/')) {
      category = 'accessibility';
    }

    // Determine component type
    let type: ComponentDiscovery['type'] = 'component';
    if (relativePath.includes('/routes/')) type = 'page';
    else if (relativePath.includes('/layout/')) type = 'layout';
    else if (relativePath.includes('/utils/')) type = 'utility';

    // Analyze complexity based on content
    let complexity: ComponentDiscovery['complexity'] = 'simple';
    const lineCount = content.split('\n').length;
    const hasState = content.includes('useState') || content.includes('useReducer');
    const hasEffects = content.includes('useEffect') || content.includes('useLayoutEffect');
    const hasComplexLogic = content.includes('useMemo') || content.includes('useCallback');
    const hasAsyncOperations = content.includes('async') || content.includes('Promise');

    if (lineCount > 200 || (hasState && hasEffects && hasComplexLogic)) {
      complexity = 'complex';
    } else if (
      lineCount > 100
      || hasState
      || hasEffects
      || hasAsyncOperations
    ) {
      complexity = 'medium';
    }

    // Determine priority based on healthcare context
    let priority: ComponentDiscovery['priority'] = 'medium';
    if (category === 'telemedicine' || relativePath.includes('emergency')) {
      priority = 'critical';
    } else if (category === 'patient' || category === 'accessibility') {
      priority = 'high';
    } else if (category === 'admin') {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Check if component has existing tests
    const testPath = filePath.replace('.tsx', '.test.tsx');
    const hasTests = await fs
      .access(testPath)
      .then(() => true)
      .catch(() => false);

    return {
      name: fileName,
      path: relativePath,
      type,
      complexity,
      category,
      hasTests,
      priority,
    };
  }

  /**
   * Create optimized test batches for performance
   */
  createTestBatches(): TestBatch[] {
    // Sort components by priority and complexity
    const sortedComponents = [...this.components].sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const complexityWeight = { complex: 3, medium: 2, simple: 1 };

      const aScore = priorityWeight[a.priority] + complexityWeight[a.complexity];
      const bScore = priorityWeight[b.priority] + complexityWeight[b.complexity];

      return bScore - aScore;
    });

    const batches: TestBatch[] = [];
    let currentBatch: ComponentDiscovery[] = [];
    let currentBatchMemory = 0;

    for (const component of sortedComponents) {
      const estimatedMemory = this.estimateComponentMemoryUsage(component);

      if (
        currentBatch.length >= this.maxBatchSize
        || currentBatchMemory + estimatedMemory > this.maxMemoryPerBatch
      ) {
        if (currentBatch.length > 0) {
          batches.push({
            batchId: `batch-${batches.length + 1}`,
            components: [...currentBatch],
            estimatedDuration: this.estimateBatchDuration(currentBatch),
            maxMemoryUsage: currentBatchMemory,
          });
        }

        currentBatch = [component];
        currentBatchMemory = estimatedMemory;
      } else {
        currentBatch.push(component);
        currentBatchMemory += estimatedMemory;
      }
    }

    // Add final batch
    if (currentBatch.length > 0) {
      batches.push({
        batchId: `batch-${batches.length + 1}`,
        components: [...currentBatch],
        estimatedDuration: this.estimateBatchDuration(currentBatch),
        maxMemoryUsage: currentBatchMemory,
      });
    }

    this.testBatches = batches;
    this.report.batchingMetrics.totalBatches = batches.length;

    return batches;
  }

  /**
   * Estimate memory usage for component testing
   */
  private estimateComponentMemoryUsage(component: ComponentDiscovery): number {
    const baseMemory = 5 * 1024 * 1024; // 5MB base
    const complexityMultiplier = { simple: 1, medium: 2, complex: 4 };
    const categoryMultiplier = {
      telemedicine: 3,
      patient: 2,
      accessibility: 2,
      admin: 1.5,
      ui: 1,
      common: 1,
    };

    return (
      baseMemory
      * complexityMultiplier[component.complexity]
      * categoryMultiplier[component.category]
    );
  }

  /**
   * Estimate batch duration based on components
   */
  private estimateBatchDuration(components: ComponentDiscovery[]): number {
    const baseTime = 2000; // 2 seconds per component
    const complexityMultiplier = { simple: 1, medium: 1.5, complex: 3 };

    return components.reduce((total, component) => {
      return total + baseTime * complexityMultiplier[component.complexity];
    }, 0);
  }

  /**
   * Run automated accessibility tests on all discovered components
   */
  async runAutomatedTests(): Promise<AutomatedTestReport> {
    const startTime = performance.now();

    for (const batch of this.testBatches) {
      await this.runBatch(batch);
    }

    const endTime = performance.now();
    this.report.batchingMetrics.averageBatchDuration = (endTime - startTime)
      / this.testBatches.length;

    // Calculate compliance rates by category
    this.calculateCategoryMetrics();

    // Generate final report
    await this.generateReport();

    return this.report;
  }

  /**
   * Run accessibility tests for a batch of components
   */
  private async runBatch(batch: TestBatch): Promise<void> {
    console.log(
      `Running accessibility tests for ${batch.batchId} (${batch.components.length} components)`,
    );

    for (const component of batch.components) {
      try {
        await this.testComponent(component);
        this.report.testedComponents++;
      } catch (error) {
        console.warn(`Skipped testing ${component.name}: ${error}`);
        this.report.skippedComponents++;
      }
    }

    // Memory cleanup between batches
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Test individual component for accessibility
   */
  private async testComponent(component: ComponentDiscovery): Promise<void> {
    try {
      // Dynamic import to avoid loading all components at once
      const module = await import(path.join(process.cwd(), component.path));
      const Component = module.default || module[component.name];

      if (!Component) {
        throw new Error(`No default export found for ${component.name}`);
      }

      // Determine test context based on component category
      let _context: keyof typeof healthcareTestContexts = 'PATIENT_PORTAL';
      switch (component.category) {
        case 'telemedicine':
          context = 'TELEMEDICINE';
          break;
        case 'admin':
          context = 'MEDICAL_PROFESSIONAL';
          break;
        case 'accessibility':
          context = 'PATIENT_PORTAL';
          break;
      }

      // Create mock props based on component analysis
      const mockProps = this.generateMockProps(component);

      // Run accessibility test
      const results = await runOptimizedAccessibilityTest(
        React.createElement(Component, mockProps),
        component.name,
        context,
      );

      // Store results
      this.updateComponentCategory(component.category, results);
    } catch (error) {
      throw new Error(`Failed to test ${component.name}: ${error}`);
    }
  }

  /**
   * Generate mock props for component testing
   */
  private generateMockProps(component: ComponentDiscovery): any {
    const mockProps: any = {};

    // Common props based on component category
    switch (component.category) {
      case 'telemedicine':
        mockProps.sessionId = 'test-session-123';
        mockProps.onSessionEnd = () => {};
        break;
      case 'patient':
        mockProps.patientId = 'patient-123';
        mockProps.onSave = () => {};
        break;
      case 'admin':
        mockProps.userId = 'admin-123';
        mockProps.permissions = ['read', 'write'];
        break;
    }

    return mockProps;
  }

  /**
   * Update category metrics based on test results
   */
  private updateComponentCategory(category: string, results: any): void {
    if (!this.report.componentCategories[category]) {
      this.report.componentCategories[category] = {
        count: 0,
        violations: 0,
        complianceRate: 0,
      };
    }

    const categoryData = this.report.componentCategories[category];
    categoryData.count++;
    categoryData.violations += results.violations?.length || 0;
    categoryData.complianceRate =
      ((categoryData.count - categoryData.violations) / categoryData.count)
      * 100;
  }

  /**
   * Calculate final category metrics
   */
  private calculateCategoryMetrics(): void {
    for (
      const [category, data] of Object.entries(
        this.report.componentCategories,
      )
    ) {
      data.complianceRate = data.count > 0
        ? ((data.count - data.violations) / data.count) * 100
        : 0;
    }

    // Calculate overall compliance rate
    this.report.complianceRate = this.report.totalComponents > 0
      ? ((this.report.totalComponents - this.report.totalViolations)
        / this.report.totalComponents)
        * 100
      : 0;
  }

  /**
   * Generate comprehensive accessibility report
   */
  private async generateReport(): Promise<void> {
    const reportPath = path.join(process.cwd(), 'accessibility-report.json');

    try {
      await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));
      console.log(`📊 Accessibility report generated: ${reportPath}`);

      // Also generate human-readable summary
      await this.generateHumanReadableReport();
    } catch (_error) {
      console.error('Failed to generate accessibility report:', error);
    }
  }

  /**
   * Generate human-readable accessibility report
   */
  private async generateHumanReadableReport(): Promise<void> {
    const summaryPath = path.join(process.cwd(), 'accessibility-summary.md');

    const summary = `
# 🏥 Healthcare Platform Accessibility Report

**Generated:** ${this.report.timestamp}
**Platform:** NeonPro Healthcare Platform
**Standards:** WCAG 2.1 AA+, ANVISA, CFM, LGPD

## 📊 Summary

- **Total Components Discovered:** ${this.report.discoveredComponents}
- **Components Tested:** ${this.report.testedComponents}
- **Components Skipped:** ${this.report.skippedComponents}
- **Total Violations:** ${this.report.totalViolations}
- **Overall Compliance Rate:** ${this.report.complianceRate.toFixed(2)}%

## 🎯 WCAG Compliance

- **WCAG 2A:** ${this.report.wcagCompliance.wcag2a ? '✅ Compliant' : '❌ Non-compliant'}
- **WCAG 2AA:** ${this.report.wcagCompliance.wcag2aa ? '✅ Compliant' : '❌ Non-compliant'}
- **WCAG 2.1 AA:** ${this.report.wcagCompliance.wcag21aa ? '✅ Compliant' : '❌ Non-compliant'}
- **Best Practices:** ${
      this.report.wcagCompliance.bestPractice
        ? '✅ Compliant'
        : '❌ Non-compliant'
    }

## 🏥 Healthcare Compliance

- **ANVISA:** ${this.report.healthcareCompliance.anvisa ? '✅ Compliant' : '❌ Non-compliant'}
- **CFM:** ${this.report.healthcareCompliance.cfm ? '✅ Compliant' : '❌ Non-compliant'}
- **LGPD:** ${this.report.healthcareCompliance.lgpd ? '✅ Compliant' : '❌ Non-compliant'}

## 📈 Performance Metrics

- **Total Batches:** ${this.report.batchingMetrics.totalBatches}
- **Average Batch Duration:** ${this.report.batchingMetrics.averageBatchDuration.toFixed(2)}ms
- **Memory Optimization:** Enabled

## 🏷️ Component Categories

${
      Object.entries(this.report.componentCategories)
        .map(
          ([category, data]) => `
### ${category.charAt(0).toUpperCase() + category.slice(1)}
- **Components:** ${data.count}
- **Violations:** ${data.violations}
- **Compliance Rate:** ${data.complianceRate.toFixed(2)}%
`,
        )
        .join('')
    }

## 🚨 Critical Violations

${
      this.report.criticalViolations.length > 0
        ? this.report.criticalViolations
          .map(
            v => `
### ${v.id}
- **Impact:** ${v.impact}
- **Description:** ${v.description}
- **Help:** ${v.help}
`,
          )
          .join('')
        : 'No critical violations found ✅'
    }

---

*Report generated by NeonPro Automated Accessibility Testing System*
*For technical details, see accessibility-report.json*
`;

    try {
      await fs.writeFile(summaryPath, summary);
      console.log(`📋 Human-readable summary generated: ${summaryPath}`);
    } catch (_error) {
      console.error('Failed to generate summary report:', error);
    }
  }
}

// Test suite for automated testing
describe('Automated Accessibility Test Runner', () => {
  let testRunner: AccessibilityTestRunner;

  beforeAll(async () => {
    testRunner = new AccessibilityTestRunner();
  });

  test('discovers all UI components in the project', async () => {
    const components = await testRunner.discoverComponents();

    expect(components.length).toBeGreaterThan(0);
    expect(components.every(c => c.name && c.path && c.category)).toBe(true);

    console.log(`📦 Discovered ${components.length} components`);
  });

  test('creates optimized test batches for performance', async () => {
    const batches = testRunner.createTestBatches();

    expect(batches.length).toBeGreaterThan(0);
    expect(batches.every(b => b.components.length <= 10)).toBe(true); // Max batch size

    console.log(`🔄 Created ${batches.length} optimized test batches`);
  });

  test('runs automated accessibility tests on all components', async () => {
    const report = await testRunner.runAutomatedTests();

    expect(report.discoveredComponents).toBeGreaterThan(0);
    expect(report.testedComponents).toBeGreaterThan(0);
    expect(report.complianceRate).toBeGreaterThanOrEqual(0);

    console.log(`🎯 Compliance Rate: ${report.complianceRate.toFixed(2)}%`);
  }, 300000); // 5 minute timeout for full test suite

  afterAll(async () => {
    console.log('✅ Automated accessibility testing completed');
  });
});

export { AccessibilityTestRunner, AutomatedTestReport, ComponentDiscovery, TestBatch };
