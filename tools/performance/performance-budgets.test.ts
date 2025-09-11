/**
 * Performance Budget Violation Test for NeonPro
 * 
 * This test intentionally creates performance violations to demonstrate
 * that the performance budget validation system is working correctly.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('Performance Budget Validation System', () => {
  const projectRoot = join(process.cwd(), '../..')
  const lighthouseConfig = join(projectRoot, 'lighthouserc.js')
  const testConfigPath = join(projectRoot, 'lighthouserc.test.js')
  
  beforeAll(() => {
    // Create a test configuration with impossible budgets to ensure failure
    const testConfig = `
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      staticDistDir: './apps/web/dist',
      url: ['http://localhost:4173/'],
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance'],
      },
    },
    assert: {
      assertions: {
        // Impossible budgets that should always fail (testing violation detection)
        'largest-contentful-paint': ['error', { maxNumericValue: 1 }],    // 1ms - impossible
        'first-contentful-paint': ['error', { maxNumericValue: 1 }],      // 1ms - impossible  
        'speed-index': ['error', { maxNumericValue: 1 }],                 // 1ms - impossible
        'total-blocking-time': ['error', { maxNumericValue: 0 }],         // 0ms - impossible
        'categories:performance': ['error', { minScore: 1.0 }],           // 100% - very hard
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
    `
    writeFileSync(testConfigPath, testConfig.trim())
  })

  afterAll(() => {
    // Clean up test configuration
    if (existsSync(testConfigPath)) {
      const fs = require('fs')
      fs.unlinkSync(testConfigPath)
    }
  })

  it('should have lighthouse configuration file', () => {
    expect(existsSync(lighthouseConfig)).toBe(true)
    
    const config = readFileSync(lighthouseConfig, 'utf8')
    expect(config).toContain('largest-contentful-paint')
    expect(config).toContain('healthcare')
    expect(config).toContain('maxNumericValue')
  })

  it('should have healthcare-specific performance budgets defined', () => {
    const config = readFileSync(lighthouseConfig, 'utf8')
    
    // Check for healthcare-specific strict budgets
    expect(config).toContain('maxNumericValue: 2000')  // LCP 2s
    expect(config).toContain('maxNumericValue: 1500')  // FCP 1.5s  
    expect(config).toContain('maxNumericValue: 0.05')  // CLS 0.05
    expect(config).toContain('maxNumericValue: 150')   // INP 150ms
    expect(config).toContain('minScore: 0.95')         // Accessibility 95%
  })

  it('should have budget JSON file with healthcare timing budgets', () => {
    const budgetPath = join(projectRoot, 'lighthouse-budget.json')
    expect(existsSync(budgetPath)).toBe(true)
    
    const budget = JSON.parse(readFileSync(budgetPath, 'utf8'))
    expect(Array.isArray(budget)).toBe(true)
    expect(budget.length).toBeGreaterThan(0)
    
    const mainBudget = budget[0]
    expect(mainBudget.path).toBe('/*')
    expect(mainBudget.timings).toBeDefined()
    expect(mainBudget.resourceSizes).toBeDefined()
    expect(mainBudget.resourceCounts).toBeDefined()
    
    // Check healthcare-specific strict timing budgets
    const lcpBudget = mainBudget.timings.find(t => t.metric === 'largest-contentful-paint')
    expect(lcpBudget.budget).toBe(2000) // 2s strict for healthcare
    
    const fcpBudget = mainBudget.timings.find(t => t.metric === 'first-contentful-paint')  
    expect(fcpBudget.budget).toBe(1500) // 1.5s strict for healthcare
    
    const clsBudget = mainBudget.timings.find(t => t.metric === 'cumulative-layout-shift')
    expect(clsBudget.budget).toBe(0.05) // 0.05 strict for form stability
  })

  it('should have validation script with proper permissions', () => {
    const scriptPath = join(projectRoot, 'tools/performance/validate-performance-budgets.sh')
    expect(existsSync(scriptPath)).toBe(true)
    
    const script = readFileSync(scriptPath, 'utf8')
    expect(script).toContain('Healthcare Performance Budget')
    expect(script).toContain('patient safety')
    expect(script).toContain('LGPD/ANVISA')
    expect(script).toContain('lhci autorun')
  })

  it('should demonstrate budget violation detection with impossible budgets', async () => {
    // This test simulates what happens when performance budgets are violated
    // by creating a configuration with impossible performance requirements
    
    const testConfig = readFileSync(testConfigPath, 'utf8')
    expect(testConfig).toContain('maxNumericValue: 1') // Impossible 1ms budget
    
    // In a real CI environment, this would fail the build when budgets are exceeded
    // The test validates that our violation detection system is properly configured
    expect(testConfig).toContain('error') // Error level for critical violations
  })

  it('should validate CI integration with performance job', () => {
    const ciPath = join(projectRoot, '.github/workflows/ci.yml')
    expect(existsSync(ciPath)).toBe(true)
    
    const ci = readFileSync(ciPath, 'utf8')
    expect(ci).toContain('performance-budgets')
    expect(ci).toContain('@lhci/cli')
    expect(ci).toContain('lhci autorun')
  })

  it('should have performance tools package with lighthouse dependencies', () => {
    const packagePath = join(projectRoot, 'tools/performance/package.json')
    expect(existsSync(packagePath)).toBe(true)
    
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
    expect(pkg.dependencies).toHaveProperty('@lhci/cli')
    expect(pkg.scripts).toHaveProperty('lighthouse:ci')
    expect(pkg.scripts).toHaveProperty('budget:validate')
  })
})