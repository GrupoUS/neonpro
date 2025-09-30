#!/usr/bin/env bun
/**
 * LGPD Compliance Checker with AST-based Analysis
 * 
 * Replaces brittle grep patterns with sophisticated AST analysis
 * for Brazilian healthcare data protection compliance
 * 
 * @author NEONPRO Constitution Team
 * @version 2.0.0 - AST-based Implementation
 */

import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import fs from 'fs'
import path from 'path'

// LGPD Violation Types
export const LGPD_VIOLATION_TYPES = {
  PERSONAL_DATA_EXPOSURE: 'personal_data_exposure',
  INSECURE_STORAGE: 'insecure_storage',
  DATA_LOGGING: 'data_logging',
  MISSING_CONSENT: 'missing_consent',
  INSUFFICIENT_ANONYMIZATION: 'insufficient_anonymization'
}

// Personal Data Patterns (LGPD Article 5)
const PERSONAL_DATA_PATTERNS = {
  // Direct identifiers
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
  rg: /\b\d{1,2}\.?\d{3}\.?\d{3}-?\d{1}\b/,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  phone: /\b(?:\+?55)?\s?(?:\(?[1-9]{2}\)?\s?)?\d{4,5}-?\d{4}\b/,
  
  // Healthcare specific
  patientId: /patient.*id|patient.*\d+/i,
  medicalRecord: /medical.*record|record.*\d+/i,
  cpfNumber: /cpf.*number|número.*cpf/i,
  
  // Brazilian health identifiers
  susCard: /cartão.*sus|sus.*card/i,
  cns: /\b\d{3}\s?\d{4}\s?\d{4}\s?\d{4}\b/ // Carteira Nacional de Saúde
}

// Insecure Context Patterns
const INSECURE_CONTEXTS = {
  logging: ['console.log', 'console.warn', 'console.error', 'logger.info'],
  storage: ['localStorage', 'sessionStorage', 'document.cookie'],
  http: ['fetch', 'axios.get', 'axios.post', 'XMLHttpRequest'],
  url: ['window.location', 'document.URL', 'history.pushState']
}

// LGPD Safe Harbor Patterns
const SAFE_HARBOR_PATTERNS = {
  encryption: ['crypto', 'bcrypt', 'argon2', 'AES', 'RSA'],
  hashing: ['hash', 'sha256', 'md5'],
  anonymization: ['anonymize', 'pseudonymize', 'mask', 'redact'],
  consent: ['consent', 'authorization', 'permission', 'agreement']
}

class LGPDComplianceChecker {
  constructor(options = {}) {
    this.options = {
      includeTests: false,
      severity: 'error', // 'error', 'warning', 'info'
      ...options
    }
    this.violations = []
  }

  /**
   * Check file for LGPD compliance violations
   */
  async checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const ast = this.parseCode(content, filePath)
      
      const violations = []
      
      // AST-based analysis
      traverse(ast, {
        // Check for personal data in insecure contexts
        CallExpression: (path) => this.checkCallExpression(path, violations, filePath),
        
        // Check for variable declarations with personal data
        VariableDeclarator: (path) => this.checkVariableDeclaration(path, violations, filePath),
        
        // Check for object properties with personal data
        ObjectProperty: (path) => this.checkObjectProperty(path, violations, filePath),
        
        // Check for string literals containing personal data
        StringLiteral: (path) => this.checkStringLiteral(path, violations, filePath),
        
        // Check for template literals
        TemplateLiteral: (path) => this.checkTemplateLiteral(path, violations, filePath)
      })
      
      return violations
    } catch (error) {
      return [{
        type: LGPD_VIOLATION_TYPES.PERSONAL_DATA_EXPOSURE,
        severity: 'error',
        file: filePath,
        line: 1,
        column: 1,
        message: `Failed to parse file: ${error.message}`,
        suggestion: 'Check file syntax and encoding'
      }]
    }
  }

  /**
   * Parse code into AST based on file type
   */
  parseCode(content, filePath) {
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx')
    const isJSX = filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
    
    const plugins = [
      isTypeScript && 'typescript',
      isJSX && 'jsx',
      'decorators-legacy',
      'classProperties',
      'objectRestSpread',
      'asyncGenerators',
      'functionBind',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'dynamicImport',
      'nullishCoalescingOperator',
      'optionalChaining'
    ].filter(Boolean)
    
    return parse(content, {
      sourceType: 'module',
      plugins,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true
    })
  }

  /**
   * Check function calls for LGPD violations
   */
  checkCallExpression(path, violations, filePath) {
    const { node } = path
    const callee = node.callee
    
    // Get function name
    let functionName = ''
    if (callee.type === 'Identifier') {
      functionName = callee.name
    } else if (callee.type === 'MemberExpression') {
      functionName = callee.property.name
    }
    
    // Check if this is an insecure context
    const insecureTypes = Object.entries(INSECURE_CONTEXTS)
      .filter(([_, functions]) => functions.includes(functionName))
      .map(([type]) => type)
    
    if (insecureTypes.length === 0) return
    
    // Analyze arguments for personal data
    node.arguments.forEach((arg, index) => {
      const personalDataTypes = this.analyzeNodeForPersonalData(arg)
      
      personalDataTypes.forEach(dataType => {
        violations.push({
          type: LGPD_VIOLATION_TYPES.INSECURE_STORAGE,
          severity: 'error',
          file: filePath,
          line: node.loc?.start.line || 0,
          column: node.loc?.start.column || 0,
          message: `LGPD Violation: Personal data (${dataType}) in insecure context (${functionName})`,
          suggestion: `Use secure storage utilities from @neonpro/security for ${dataType}`,
          context: {
            function: functionName,
            argumentIndex: index,
            dataType
          }
        })
      })
    })
  }

  /**
   * Check variable declarations for personal data
   */
  checkVariableDeclaration(path, violations, filePath) {
    const { node } = path
    if (!node.id || node.id.type !== 'Identifier') return
    
    const variableName = node.id.name
    const personalDataTypes = this.identifyPersonalDataType(variableName)
    
    if (personalDataTypes.length > 0) {
      // Check if variable is properly secured
      const isSecure = this.checkSecureInitialization(node.init)
      
      if (!isSecure) {
        violations.push({
          type: LGPD_VIOLATION_TYPES.PERSONAL_DATA_EXPOSURE,
          severity: 'warning',
          file: filePath,
          line: node.loc?.start.line || 0,
          column: node.loc?.start.column || 0,
          message: `LGPD Warning: Variable "${variableName}" contains personal data without proper protection`,
          suggestion: `Consider encryption or anonymization for ${personalDataTypes.join(', ')}`,
          context: {
            variable: variableName,
            dataTypes: personalDataTypes
          }
        })
      }
    }
  }

  /**
   * Check object properties for personal data
   */
  checkObjectProperty(path, violations, filePath) {
    const { node } = path
    
    if (node.key.type === 'Identifier') {
      const propertyName = node.key.name
      const personalDataTypes = this.identifyPersonalDataType(propertyName)
      
      if (personalDataTypes.length > 0) {
        // Check if property value is properly secured
        const isSecure = this.checkSecureInitialization(node.value)
        
        if (!isSecure) {
          violations.push({
            type: LGPD_VIOLATION_TYPES.INSUFFICIENT_ANONYMIZATION,
            severity: 'warning',
            file: filePath,
            line: node.loc?.start.line || 0,
            column: node.loc?.start.column || 0,
            message: `LGPD Warning: Property "${propertyName}" contains personal data without anonymization`,
            suggestion: `Apply masking or encryption for ${personalDataTypes.join(', ')}`,
            context: {
              property: propertyName,
              dataTypes: personalDataTypes
            }
          })
        }
      }
    }
  }

  /**
   * Check string literals for embedded personal data
   */
  checkStringLiteral(path, violations, filePath) {
    const { node } = path
    const personalDataTypes = this.identifyPersonalDataType(node.value)
    
    if (personalDataTypes.length > 0) {
      violations.push({
        type: LGPD_VIOLATION_TYPES.PERSONAL_DATA_EXPOSURE,
        severity: 'error',
        file: filePath,
        line: node.loc?.start.line || 0,
        column: node.loc?.start.column || 0,
        message: `LGPD Violation: Hardcoded personal data (${personalDataTypes.join(', ')}) detected`,
        suggestion: 'Remove hardcoded personal data and use proper data sources',
        context: {
          value: node.value,
          dataTypes: personalDataTypes
        }
      })
    }
  }

  /**
   * Check template literals for personal data exposure
   */
  checkTemplateLiteral(path, violations, filePath) {
    const { node } = path
    
    // Check expressions within template literals
    node.expressions.forEach(expression => {
      const personalDataTypes = this.analyzeNodeForPersonalData(expression)
      
      personalDataTypes.forEach(dataType => {
        violations.push({
          type: LGPD_VIOLATION_TYPES.DATA_LOGGING,
          severity: 'warning',
          file: filePath,
          line: node.loc?.start.line || 0,
          column: node.loc?.start.column || 0,
          message: `LGPD Warning: Personal data (${dataType}) in template literal - potential logging risk`,
          suggestion: `Use proper data masking for ${dataType} in user-facing content`,
          context: {
            dataType,
            expressionType: expression.type
          }
        })
      })
    })
  }

  /**
   * Analyze AST node for personal data patterns
   */
  analyzeNodeForPersonalData(node) {
    const dataTypes = []
    
    if (node.type === 'StringLiteral') {
      dataTypes.push(...this.identifyPersonalDataType(node.value))
    } else if (node.type === 'Identifier') {
      dataTypes.push(...this.identifyPersonalDataType(node.name))
    } else if (node.type === 'TemplateLiteral') {
      node.quasis.forEach(quasi => {
        dataTypes.push(...this.identifyPersonalDataType(quasi.value.raw))
      })
    }
    
    return dataTypes
  }

  /**
   * Identify personal data type from string content
   */
  identifyPersonalDataType(content) {
    const types = []
    
    Object.entries(PERSONAL_DATA_PATTERNS).forEach(([type, pattern]) => {
      if (pattern.test(content)) {
        types.push(type)
      }
    })
    
    return types
  }

  /**
   * Check if initialization is secure (encryption, hashing, etc.)
   */
  checkSecureInitialization(node) {
    if (!node) return false
    
    // Check for secure patterns
    const securePatterns = [
      /encrypt/i,
      /hash/i,
      /mask/i,
      /anonymize/i,
      /crypto/i
    ]
    
    if (node.type === 'CallExpression') {
      const functionName = this.getFunctionName(node.callee)
      return securePatterns.some(pattern => pattern.test(functionName))
    }
    
    return false
  }

  /**
   * Extract function name from callee node
   */
  getFunctionName(callee) {
    if (callee.type === 'Identifier') {
      return callee.name
    } else if (callee.type === 'MemberExpression') {
      return callee.property.name
    }
    return ''
  }

  /**
   * Generate compliance report
   */
  generateReport(violations) {
    const report = {
      timestamp: new Date().toISOString(),
      totalViolations: violations.length,
      violationsByType: {},
      violationsBySeverity: {
        error: 0,
        warning: 0,
        info: 0
      },
      filesWithViolations: new Set(),
      recommendations: []
    }
    
    violations.forEach(violation => {
      // Count by type
      if (!report.violationsByType[violation.type]) {
        report.violationsByType[violation.type] = 0
      }
      report.violationsByType[violation.type]++
      
      // Count by severity
      report.violationsBySeverity[violation.severity]++
      
      // Track files
      report.filesWithViolations.add(violation.file)
    })
    
    // Generate recommendations
    if (report.violationsByType[LGPD_VIOLATION_TYPES.INSECURE_STORAGE] > 0) {
      report.recommendations.push('Implement secure storage utilities from @neonpro/security')
    }
    
    if (report.violationsByType[LGPD_VIOLATION_TYPES.PERSONAL_DATA_EXPOSURE] > 0) {
      report.recommendations.push('Review hardcoded personal data and use proper data sources')
    }
    
    if (report.violationsByType[LGPD_VIOLATION_TYPES.INSUFFICIENT_ANONYMIZATION] > 0) {
      report.recommendations.push('Apply proper data masking and anonymization techniques')
    }
    
    report.filesWithViolations = Array.from(report.filesWithViolations)
    
    return report
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const filePaths = args.filter(arg => !arg.startsWith('--'))
  const options = {}
  
  // Parse options
  args.forEach(arg => {
    if (arg === '--include-tests') options.includeTests = true
    if (arg === '--severity=warning') options.severity = 'warning'
  })
  
  const checker = new LGPDComplianceChecker(options)
  const allViolations = []
  
  if (filePaths.length === 0) {
    console.error('Usage: lgpd-compliance-check.js <file1.ts> [file2.ts] [...]')
    process.exit(1)
  }
  
  // Check each file
  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      continue
    }
    
    const violations = await checker.checkFile(filePath)
    allViolations.push(...violations)
    
    // Print violations for this file
    violations.forEach(violation => {
      const emoji = violation.severity === 'error' ? '❌' : '⚠️'
      console.log(`${emoji} ${violation.file}:${violation.line}:${violation.column} - ${violation.message}`)
      if (violation.suggestion) {
        console.log(`   💡 ${violation.suggestion}`)
      }
    })
  }
  
  // Generate summary report
  const report = checker.generateReport(allViolations)
  
  console.log(`\n📊 LGPD Compliance Report`)
  console.log(`Total Violations: ${report.totalViolations}`)
  console.log(`Files with Violations: ${report.filesWithViolations.length}`)
  
  if (report.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`)
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })
  }
  
  // Exit with error code if there are error-level violations
  if (report.violationsBySeverity.error > 0) {
    console.log(`\n❌ LGPD compliance check failed with ${report.violationsBySeverity.error} error(s)`)
    process.exit(1)
  } else {
    console.log(`\n✅ LGPD compliance check passed`)
  }
}

// Export for use in other modules
export { LGPDComplianceChecker, PERSONAL_DATA_PATTERNS, INSECURE_CONTEXTS }

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}