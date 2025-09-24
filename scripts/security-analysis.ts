#!/usr/bin/env bun

/**
 * Security Analysis Script - PR 40 Vulnerability Detection
 * Demonstrates security issues identified in telemedicine service
 */

import * as fs from 'fs/promises'

interface SecurityIssue {
  type:
    | 'hardcoded_secret'
    | 'hardcoded_salt'
    | 'sensitive_logging'
    | 'insecure_storage'
  severity: 'critical' | 'high' | 'medium' | 'low'
  file: string
  line: number
  code: string
  description: string
  lgpdCompliance: boolean
  cfmCompliance: boolean
}

async function analyzeTelemedicineService(): Promise<SecurityIssue[]> {
  const serviceFile = '/home/vibecode/neonpro/apps/api/src/services/telemedicine.ts'
  const content = await fs.readFile(serviceFile, 'utf8')
  const lines = content.split('\n')

  const issues: SecurityIssue[] = []

  // Detect hardcoded secrets
  lines.forEach((line, index) => {
    const lineNum = index + 1

    // Hardcoded default secrets
    if (line.includes("'default-secret'") || line.includes("'default-key'")) {
      issues.push({
        type: 'hardcoded_secret',
        severity: 'critical',
        file: serviceFile,
        line: lineNum,
        code: line.trim(),
        description:
          'Hardcoded default secret detected. This compromises security if environment variables are not set.',
        lgpdCompliance: false,
        cfmCompliance: false,
      })
    }

    // Hardcoded salt
    if (line.includes("'salt'") && line.includes('scryptSync')) {
      issues.push({
        type: 'hardcoded_salt',
        severity: 'critical',
        file: serviceFile,
        line: lineNum,
        code: line.trim(),
        description:
          'Hardcoded salt in encryption function. This makes encryption predictable and vulnerable.',
        lgpdCompliance: false,
        cfmCompliance: false,
      })
    }

    // Sensitive logging
    if (
      line.includes('console.log')
      && (line.toLowerCase().includes('session')
        || line.toLowerCase().includes('patient')
        || line.toLowerCase().includes('medical')
        || line.toLowerCase().includes('audit'))
    ) {
      issues.push({
        type: 'sensitive_logging',
        severity: 'high',
        file: serviceFile,
        line: lineNum,
        code: line.trim(),
        description:
          'Potentially sensitive data being logged. This may expose patient information.',
        lgpdCompliance: false,
        cfmCompliance: false,
      })
    }

    // Insecure memory storage
    if (
      line.includes('Map<string, TelemedicineSession>')
      || (line.includes('activeSessions') && line.includes('Map'))
    ) {
      issues.push({
        type: 'insecure_storage',
        severity: 'medium',
        file: serviceFile,
        line: lineNum,
        code: line.trim(),
        description:
          'Sensitive medical session data stored in unencrypted memory. Potential memory leak vulnerability.',
        lgpdCompliance: false,
        cfmCompliance: false,
      })
    }
  })

  return issues
}

async function generateSecurityReport(): Promise<void> {
  console.log('🔍 NEONPRO SECURITY ANALYSIS - PR 40 VULNERABILITIES')
  console.log('='.repeat(60))
  console.log()

  const issues = await analyzeTelemedicineService()

  // Group by severity
  const critical = issues.filter((i) => i.severity === 'critical')
  const high = issues.filter((i) => i.severity === 'high')
  const medium = issues.filter((i) => i.severity === 'medium')

  console.log(`🚨 CRITICAL ISSUES: ${critical.length}`)
  critical.forEach((issue) => {
    console.log(`  📍 Line ${issue.line}: ${issue.description}`)
    console.log(`     Code: ${issue.code}`)
    console.log(`     LGPD Compliant: ${issue.lgpdCompliance ? '✅' : '❌'}`)
    console.log(`     CFM Compliant: ${issue.cfmCompliance ? '✅' : '❌'}`)
    console.log()
  })

  console.log(`⚠️  HIGH ISSUES: ${high.length}`)
  high.forEach((issue) => {
    console.log(`  📍 Line ${issue.line}: ${issue.description}`)
    console.log(`     Code: ${issue.code}`)
    console.log(`     LGPD Compliant: ${issue.lgpdCompliance ? '✅' : '❌'}`)
    console.log(`     CFM Compliant: ${issue.cfmCompliance ? '✅' : '❌'}`)
    console.log()
  })

  console.log(`⚡ MEDIUM ISSUES: ${medium.length}`)
  medium.forEach((issue) => {
    console.log(`  📍 Line ${issue.line}: ${issue.description}`)
    console.log(`     Code: ${issue.code}`)
    console.log()
  })

  // Compliance Summary
  console.log('📊 COMPLIANCE SUMMARY')
  console.log('='.repeat(30))
  console.log(`Total Issues: ${issues.length}`)
  console.log(
    `LGPD Violations: ${issues.filter((i) => !i.lgpdCompliance).length}`,
  )
  console.log(
    `CFM Violations: ${issues.filter((i) => !i.cfmCompliance).length}`,
  )
  console.log()

  if (issues.length === 0) {
    console.log('✅ No security issues detected!')
  } else {
    console.log('❌ Security issues found. TDD remediation required.')
  }

  console.log()
  console.log('🔧 NEXT STEPS (TDD Methodology):')
  console.log('1. GREEN Phase: Fix each issue systematically')
  console.log('2. Create secure configuration management')
  console.log('3. Implement proper encryption with random salts')
  console.log('4. Replace console.log with secure audit logging')
  console.log('5. REFACTOR Phase: Optimize security implementation')
}

// Run analysis
if (import.meta.main) {
  generateSecurityReport().catch(console.error)
}

export { analyzeTelemedicineService, SecurityIssue }
