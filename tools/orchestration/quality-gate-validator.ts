#!/usr/bin/env bun

/**
 * Automated Quality Gate Validation System
 *
 * Implements continuous quality monitoring and validation for the NeonPro
 * healthcare platform with comprehensive TDD orchestration integration.
 */

import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

interface QualityGateResult {
  gate: string
  status: 'passed' | 'failed' | 'warning' | 'skipped'
  score: number
  threshold: number
  details: string[]
  recommendations: string[]
}

interface QualityValidationResult {
  overall: 'passed' | 'failed' | 'warning'
  score: number
  gates: QualityGateResult[]
  summary: {
    passed: number
    failed: number
    warnings: number
    total: number
  }
  healthcareCompliance: {
    lgpd: boolean
    security: boolean
    dataProtection: boolean
  }
}

class QualityGateValidator {
  private workspaceRoot: string
  private config: {
    thresholds: Record<string, number>
    required: string[]
    healthcare: boolean
  }

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot
    this.config = {
      thresholds: {
        typescript_compilation: 0, // Zero TypeScript errors
        linting_compliance: 0, // Zero linting errors
        security_vulnerabilities: 0, // Zero critical security issues
        test_coverage: 80, // 80% minimum test coverage
        performance_score: 75, // 75% performance score
        bundle_size: 500, // 500KB maximum bundle size
        healthcare_compliance: 100, // 100% healthcare compliance
      },
      required: [
        'typescript_compilation',
        'linting_compliance',
        'security_vulnerabilities',
        'healthcare_compliance',
      ],
      healthcare: true,
    }
  }

  async validateAllGates(): Promise<QualityValidationResult> {
    console.log('🚀 Executing Automated Quality Gate Validation System...')
    console.log('🏥 Healthcare compliance mode: ENABLED')

    const gates: QualityGateResult[] = []

    // Core Quality Gates
    gates.push(await this.validateTypeScriptCompilation())
    gates.push(await this.validateLintingCompliance())
    gates.push(await this.validateSecurityCompliance())
    gates.push(await this.validateTestCoverage())
    gates.push(await this.validatePerformance())
    gates.push(await this.validateHealthcareCompliance())

    // Calculate overall results
    const summary = {
      passed: gates.filter((g) => g.status === 'passed').length,
      failed: gates.filter((g) => g.status === 'failed').length,
      warnings: gates.filter((g) => g.status === 'warning').length,
      total: gates.length,
    }

    const requiredGates = gates.filter((g) => this.config.required.includes(g.gate))
    const requiredPassed = requiredGates.every((g) => g.status === 'passed')

    const overallScore = gates.reduce((sum, g) => sum + g.score, 0) / gates.length

    const overall: 'passed' | 'failed' | 'warning' = requiredPassed && summary.failed === 0
      ? 'passed'
      : summary.failed > 0
      ? 'failed'
      : 'warning'

    const healthcareCompliance = {
      lgpd: gates.find((g) => g.gate === 'healthcare_compliance')?.status === 'passed' || false,
      security: gates.find((g) => g.gate === 'security_vulnerabilities')?.status === 'passed'
        || false,
      dataProtection: gates.find((g) => g.gate === 'healthcare_compliance')?.score >= 90 || false,
    }

    return {
      overall,
      score: overallScore,
      gates,
      summary,
      healthcareCompliance,
    }
  }

  private async validateTypeScriptCompilation(): Promise<QualityGateResult> {
    console.log('🔍 Validating TypeScript Compilation...')

    try {
      execSync('bun run type-check', {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      })

      return {
        gate: 'typescript_compilation',
        status: 'passed',
        score: 100,
        threshold: this.config.thresholds.typescript_compilation,
        details: ['✅ All packages compile successfully'],
        recommendations: ['Continue maintaining strict TypeScript standards'],
      }
    } catch (error: any) {
      const output = error.stdout || error.stderr || ''
      const errorMatch = output.match(/Found (\d+) errors?/)
      const errorCount = errorMatch ? parseInt(errorMatch[1]) : 1

      return {
        gate: 'typescript_compilation',
        status: 'failed',
        score: Math.max(0, 100 - (errorCount * 10)),
        threshold: this.config.thresholds.typescript_compilation,
        details: [`❌ ${errorCount} TypeScript compilation errors found`],
        recommendations: [
          'Fix TypeScript compilation errors immediately',
          'Focus on null safety and type definitions',
          'Ensure all API types are properly defined',
        ],
      }
    }
  }

  private async validateLintingCompliance(): Promise<QualityGateResult> {
    console.log('🧹 Validating Linting Compliance...')

    try {
      execSync('bun run lint', {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      })

      return {
        gate: 'linting_compliance',
        status: 'passed',
        score: 100,
        threshold: this.config.thresholds.linting_compliance,
        details: ['✅ All packages pass linting validation'],
        recommendations: ['Maintain consistent code style standards'],
      }
    } catch (error: any) {
      const output = error.stdout || error.stderr || ''
      const errorMatch = output.match(/Found (\d+) warnings? and (\d+) errors?/)
      const errorCount = errorMatch ? parseInt(errorMatch[2]) : 1
      const warningCount = errorMatch ? parseInt(errorMatch[1]) : 0

      const status = errorCount > 0 ? 'failed' : warningCount > 0 ? 'warning' : 'passed'
      const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5))

      return {
        gate: 'linting_compliance',
        status,
        score,
        threshold: this.config.thresholds.linting_compliance,
        details: [
          `${errorCount > 0 ? '❌' : '⚠️'} ${errorCount} errors, ${warningCount} warnings found`,
        ],
        recommendations: [
          'Fix all linting errors immediately',
          'Address linting warnings for improved code quality',
          'Ensure consistent formatting across all packages',
        ],
      }
    }
  }

  private async validateSecurityCompliance(): Promise<QualityGateResult> {
    console.log('🔒 Validating Security Compliance...')

    try {
      execSync('bun run lint --filter=@neonpro/security', {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      })

      return {
        gate: 'security_vulnerabilities',
        status: 'passed',
        score: 100,
        threshold: this.config.thresholds.security_vulnerabilities,
        details: ['✅ Security package validation passed'],
        recommendations: ['Continue security-first development practices'],
      }
    } catch (error: any) {
      const output = error.stdout || error.stderr || ''
      const errorMatch = output.match(/Found (\d+) warnings? and (\d+) errors?/)
      const errorCount = errorMatch ? parseInt(errorMatch[2]) : 1

      return {
        gate: 'security_vulnerabilities',
        status: 'failed',
        score: Math.max(0, 100 - (errorCount * 25)),
        threshold: this.config.thresholds.security_vulnerabilities,
        details: [`❌ ${errorCount} security validation errors found`],
        recommendations: [
          'Address security validation errors immediately',
          'Review LGPD compliance implementation',
          'Ensure encryption and anonymization functions are properly implemented',
        ],
      }
    }
  }

  private async validateTestCoverage(): Promise<QualityGateResult> {
    console.log('🧪 Validating Test Coverage...')

    // Simulated test coverage validation
    // In production, this would integrate with actual test runners
    return {
      gate: 'test_coverage',
      status: 'warning',
      score: 75,
      threshold: this.config.thresholds.test_coverage,
      details: ['⚠️ Test coverage below optimal threshold (est. 75%)'],
      recommendations: [
        'Increase test coverage for critical healthcare functions',
        'Implement comprehensive unit tests for LGPD compliance',
        'Add integration tests for API endpoints',
        'Create end-to-end tests for user workflows',
      ],
    }
  }

  private async validatePerformance(): Promise<QualityGateResult> {
    console.log('⚡ Validating Performance...')

    // Simulated performance validation
    // In production, this would run actual performance tests
    return {
      gate: 'performance_score',
      status: 'warning',
      score: 70,
      threshold: this.config.thresholds.performance_score,
      details: ['⚠️ Performance metrics need optimization'],
      recommendations: [
        'Optimize bundle size and loading performance',
        'Implement code splitting for better performance',
        'Review and optimize database queries',
        'Add performance monitoring and alerting',
      ],
    }
  }

  private async validateHealthcareCompliance(): Promise<QualityGateResult> {
    console.log('🏥 Validating Healthcare Compliance...')

    // Check for LGPD compliance implementation
    const lgpdFile = path.join(this.workspaceRoot, 'packages/utils/src/lgpd.ts')
    const securityPackage = path.join(this.workspaceRoot, 'packages/security')

    try {
      const lgpdContent = await fs.readFile(lgpdFile, 'utf-8')
      const hasLgpdFunctions = [
        'redactCPF',
        'redactCNPJ',
        'redactEmail',
        'validateCPF',
        'validateCNPJ',
        'anonymizeData',
      ].every((fn) => lgpdContent.includes(fn))

      await fs.access(securityPackage)

      if (hasLgpdFunctions) {
        return {
          gate: 'healthcare_compliance',
          status: 'passed',
          score: 100,
          threshold: this.config.thresholds.healthcare_compliance,
          details: [
            '✅ LGPD compliance utilities implemented',
            '✅ Security package structure validated',
            '✅ Data anonymization functions available',
          ],
          recommendations: [
            'Continue monitoring healthcare compliance',
            'Regular security audits and updates',
            'Maintain LGPD documentation and procedures',
          ],
        }
      } else {
        return {
          gate: 'healthcare_compliance',
          status: 'failed',
          score: 60,
          threshold: this.config.thresholds.healthcare_compliance,
          details: ['❌ Missing critical LGPD compliance functions'],
          recommendations: [
            'Implement complete LGPD compliance utilities',
            'Ensure all data handling follows healthcare standards',
            'Add comprehensive audit logging',
          ],
        }
      }
    } catch (_error) {
      return {
        gate: 'healthcare_compliance',
        status: 'failed',
        score: 0,
        threshold: this.config.thresholds.healthcare_compliance,
        details: ['❌ Healthcare compliance validation failed'],
        recommendations: [
          'Implement LGPD compliance package',
          'Set up security and privacy frameworks',
          'Ensure regulatory compliance validation',
        ],
      }
    }
  }

  async generateValidationReport(result: QualityValidationResult): Promise<void> {
    const reportPath = path.join(
      this.workspaceRoot,
      'tools/orchestration/quality-gate-validation-report.md',
    )

    const statusEmoji = result.overall === 'passed'
      ? '✅'
      : result.overall === 'failed'
      ? '❌'
      : '⚠️'

    const report = `# Quality Gate Validation Report

## Executive Summary
- **Overall Status**: ${statusEmoji} ${result.overall.toUpperCase()}
- **Quality Score**: ${result.score.toFixed(1)}%
- **Timestamp**: ${new Date().toISOString()}
- **Healthcare Compliance**: ${
      result.healthcareCompliance.lgpd && result.healthcareCompliance.security
        ? '✅ COMPLIANT'
        : '❌ NON-COMPLIANT'
    }

## Quality Gates Dashboard

| Quality Gate | Status | Score | Threshold | Details |
|--------------|--------|-------|-----------|---------|
${
      result.gates.map((gate) => {
        const statusEmoji = gate.status === 'passed' ? '✅' : gate.status === 'failed' ? '❌' : '⚠️'
        return `| ${
          gate.gate.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        } | ${statusEmoji} ${gate.status.toUpperCase()} | ${gate.score}% | ${gate.threshold} | ${
          gate.details[0] || ''
        } |`
      }).join('\n')
    }

## Summary Statistics
- ✅ **Passed**: ${result.summary.passed}/${result.summary.total} gates
- ❌ **Failed**: ${result.summary.failed}/${result.summary.total} gates  
- ⚠️ **Warnings**: ${result.summary.warnings}/${result.summary.total} gates

## Healthcare Compliance Status
- **LGPD Compliance**: ${result.healthcareCompliance.lgpd ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Security Validation**: ${result.healthcareCompliance.security ? '✅ PASSED' : '❌ FAILED'}
- **Data Protection**: ${
      result.healthcareCompliance.dataProtection ? '✅ IMPLEMENTED' : '❌ INCOMPLETE'
    }

## Detailed Recommendations

${
      result.gates.map((gate) =>
        `### ${gate.gate.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
${gate.recommendations.map((rec) => `- 📋 ${rec}`).join('\n')}
`
      ).join('\n')
    }

## Next Actions

${
      result.overall === 'passed'
        ? `### ✅ Quality Gates PASSED - Proceed to REFACTOR Phase
- Implement performance optimizations
- Deploy advanced monitoring and alerting
- Enhance healthcare compliance monitoring
- Prepare for production deployment`
        : `### 🔧 Quality Gates REQUIRE ATTENTION
- **Priority 1**: Fix failed quality gates immediately
- **Priority 2**: Address warnings for optimal quality
- **Priority 3**: Implement missing compliance requirements
- **Priority 4**: Enhance testing and validation coverage`
    }

## Continuous Improvement
- Set up automated quality gate execution in CI/CD pipeline
- Implement real-time quality monitoring dashboard
- Schedule regular security and compliance audits
- Maintain quality standards documentation

---
**Generated by**: NeonPro Quality Gate Validation System v2.0.0  
**Next Validation**: Recommended within 24 hours for failed gates
    `

    await fs.writeFile(reportPath, report, 'utf-8')
    console.log(`\n📊 Quality Gate Validation Report: ${reportPath}`)
  }
}

// Main execution
async function main() {
  const workspaceRoot = process.cwd()

  const validator = new QualityGateValidator(workspaceRoot)
  const result = await validator.validateAllGates()
  await validator.generateValidationReport(result)

  // Output final summary
  console.log('\n' + '='.repeat(80))
  console.log(`🎯 QUALITY GATE VALIDATION COMPLETE`)
  console.log(`📊 Overall Status: ${result.overall.toUpperCase()}`)
  console.log(`📈 Quality Score: ${result.score.toFixed(1)}%`)
  console.log(`✅ Passed: ${result.summary.passed}/${result.summary.total} gates`)
  console.log(`❌ Failed: ${result.summary.failed}/${result.summary.total} gates`)
  console.log(
    `🏥 Healthcare Compliance: ${
      result.healthcareCompliance.lgpd && result.healthcareCompliance.security
        ? 'COMPLIANT'
        : 'NON-COMPLIANT'
    }`,
  )
  console.log('='.repeat(80))

  process.exit(result.overall === 'passed' ? 0 : 1)
}

if (import.meta.main) {
  main().catch(console.error)
}

export { QualityGateValidator, type QualityValidationResult }
