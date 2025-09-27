/**
 * 🛡️ SQL SANITIZER - Advanced SQL Injection Protection
 *
 * Features:
 * - Whitelist-based operation validation
 * - Dynamic query sanitization
 * - LGPD-compliant data access control
 * - Audit trail for all SQL operations
 * - Performance monitoring
 */

import { logger } from '../utils/secure-logger.js'

interface SQLOperation {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  columns?: string[]
  conditions?: Record<string, any>
  _userId?: string
  patientId?: string
}

interface SQLValidationResult {
  isValid: boolean
  sanitizedQuery?: string
  errors: string[]
  warnings: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface TableConfig {
  name: string
  allowedOperations: SQLOperation['type'][]
  sensitiveColumns: string[]
  requiresPatientConsent: boolean
  lgpdProtected: boolean
  auditRequired: boolean
}

class SQLSanitizer {
  private static readonly DANGEROUS_PATTERNS = [
    /(\b(DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi,
    /(;|\|\||&&|\/\*|\*\/|--|#)/g,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bINTO\s+OUTFILE\b)/gi,
    /(\bLOAD_FILE\b)/gi,
    /(\bSCRIPT\b)/gi,
    /(javascript:|vbscript:|onload=|onerror=)/gi,
    /\bINFORMATION_SCHEMA\b/gi,
    /0x[0-9a-fA-F]+/g,
  ]

  private static readonly ALLOWED_TABLES: TableConfig[] = [
    {
      name: 'patients',
      allowedOperations: ['SELECT', 'INSERT', 'UPDATE'],
      sensitiveColumns: [
        'cpf',
        'rg',
        'medical_record_number',
        'phone',
        'email',
      ],
      requiresPatientConsent: true,
      lgpdProtected: true,
      auditRequired: true,
    },
    {
      name: 'appointments',
      allowedOperations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      sensitiveColumns: ['patient_id', 'notes', 'diagnosis'],
      requiresPatientConsent: true,
      lgpdProtected: true,
      auditRequired: true,
    },
    {
      name: 'medical_records',
      allowedOperations: ['SELECT', 'INSERT', 'UPDATE'],
      sensitiveColumns: [
        'patient_id',
        'diagnosis',
        'treatment',
        'notes',
        'attachments',
      ],
      requiresPatientConsent: true,
      lgpdProtected: true,
      auditRequired: true,
    },
    {
      name: 'users',
      allowedOperations: ['SELECT', 'INSERT', 'UPDATE'],
      sensitiveColumns: ['email', 'password_hash', 'phone'],
      requiresPatientConsent: false,
      lgpdProtected: true,
      auditRequired: true,
    },
    {
      name: 'audit_logs',
      allowedOperations: ['SELECT', 'INSERT'],
      sensitiveColumns: ['user_data', 'patient_data'],
      requiresPatientConsent: false,
      lgpdProtected: true,
      auditRequired: false,
    },
    {
      name: 'system_config',
      allowedOperations: ['SELECT', 'UPDATE'],
      sensitiveColumns: ['api_keys', 'secrets'],
      requiresPatientConsent: false,
      lgpdProtected: false,
      auditRequired: true,
    },
  ]

  private static readonly ALLOWED_FUNCTIONS = [
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
    'COALESCE',
    'NULLIF',
    'UPPER',
    'LOWER',
    'TRIM',
    'LENGTH',
    'SUBSTRING',
    'NOW',
    'CURRENT_TIMESTAMP',
    'DATE',
    'TIME',
    'CAST',
    'CONVERT',
  ]

  /**
   * Validates and sanitizes SQL operations
   */
  static validateOperation(operation: SQLOperation): SQLValidationResult {
    const result: SQLValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      riskLevel: 'LOW',
    }

    try {
      // 1. Validate table access
      const tableValidation = this.validateTableAccess(operation)
      if (!tableValidation.isValid) {
        result.errors.push(...tableValidation.errors)
        result.riskLevel = 'CRITICAL'
        return result
      }

      // 2. Validate operation type
      const operationValidation = this.validateOperationType(operation)
      if (!operationValidation.isValid) {
        result.errors.push(...operationValidation.errors)
        result.riskLevel = 'HIGH'
        return result
      }

      // 3. Validate columns
      const columnValidation = this.validateColumns(operation)
      if (!columnValidation.isValid) {
        result.errors.push(...columnValidation.errors)
        result.warnings.push(...columnValidation.warnings)
        result.riskLevel = Math.max(
          result.riskLevel,
          columnValidation.riskLevel,
        ) as any
      }

      // 4. Validate conditions
      const conditionValidation = this.validateConditions(operation)
      if (!conditionValidation.isValid) {
        result.errors.push(...conditionValidation.errors)
        result.riskLevel = 'HIGH'
        return result
      }

      // 5. LGPD compliance check
      const lgpdValidation = this.validateLGPDCompliance(operation)
      if (!lgpdValidation.isValid) {
        result.errors.push(...lgpdValidation.errors)
        result.warnings.push(...lgpdValidation.warnings)
        result.riskLevel = 'HIGH'
      }

      // If we get here, operation is valid
      result.isValid = result.errors.length === 0
      result.sanitizedQuery = this.buildSanitizedQuery(operation)

      // Audit the operation
      this.auditSQLOperation(operation, result)

      return result
    } catch {
      logger.error('SQL validation failed', error as Error, {
        operation: operation.type,
        table: operation.table,
        _userId: operation.userId,
      })

      result.errors.push('Internal validation error')
      result.riskLevel = 'CRITICAL'
      return result
    }
  }

  private static validateTableAccess(
    operation: SQLOperation,
  ): SQLValidationResult {
    const result: SQLValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      riskLevel: 'LOW',
    }

    const tableConfig = this.ALLOWED_TABLES.find(
      t => t.name === operation.table,
    )

    if (!tableConfig) {
      result.errors.push(
        `Table '${operation.table}' is not in the allowed tables list`,
      )
      result.riskLevel = 'CRITICAL'
      return result
    }

    result.isValid = true
    return result
  }

  private static validateOperationType(
    operation: SQLOperation,
  ): SQLValidationResult {
    const result: SQLValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      riskLevel: 'LOW',
    }

    const tableConfig = this.ALLOWED_TABLES.find(
      t => t.name === operation.table,
    )!

    if (!tableConfig.allowedOperations.includes(operation.type)) {
      result.errors.push(
        `Operation '${operation.type}' is not allowed on table '${operation.table}'`,
      )
      result.riskLevel = 'HIGH'
      return result
    }

    result.isValid = true
    return result
  }

  private static validateColumns(operation: SQLOperation): SQLValidationResult {
    const result: SQLValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      riskLevel: 'LOW',
    }

    if (!operation.columns || operation.columns.length === 0) {
      return result
    }

    const tableConfig = this.ALLOWED_TABLES.find(
      t => t.name === operation.table,
    )!

    operation.columns.forEach(column => {
      // Check for dangerous patterns in column names
      if (this.containsDangerousPatterns(column)) {
        result.errors.push(`Column '${column}' contains dangerous patterns`)
        result.riskLevel = 'CRITICAL'
        result.isValid = false
      }

      // Check for sensitive columns
      if (tableConfig.sensitiveColumns.includes(column)) {
        result.warnings.push(
          `Accessing sensitive column '${column}' - ensure LGPD compliance`,
        )
        result.riskLevel = 'MEDIUM'
      }
    })

    return result
  }

  private static validateConditions(
    operation: SQLOperation,
  ): SQLValidationResult {
    const result: SQLValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      riskLevel: 'LOW',
    }

    if (!operation.conditions) {
      return result
    }

    Object.entries(operation.conditions).forEach(([key, _value]) => {
      // Validate condition keys
      if (this.containsDangerousPatterns(key)) {
        result.errors.push(
          `Condition key '${key}' contains dangerous patterns`,
        )
        result.riskLevel = 'CRITICAL'
        result.isValid = false
      }

      // Validate condition values
      if (typeof value === 'string' && this.containsDangerousPatterns(value)) {
        result.errors.push(
          `Condition value for '${key}' contains dangerous patterns`,
        )
        result.riskLevel = 'CRITICAL'
        result.isValid = false
      }
    })

    return result
  }

  private static validateLGPDCompliance(
    operation: SQLOperation,
  ): SQLValidationResult {
    const result: SQLValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      riskLevel: 'LOW',
    }

    const tableConfig = this.ALLOWED_TABLES.find(
      t => t.name === operation.table,
    )!

    // Check if operation requires patient consent
    if (tableConfig.requiresPatientConsent && !operation.patientId) {
      result.warnings.push(
        'Operation on LGPD-protected data without patient ID - ensure consent validation',
      )
      result.riskLevel = 'MEDIUM'
    }

    // Check if user is authorized
    if (tableConfig.lgpdProtected && !operation._userId) {
      result.errors.push(
        'Operations on LGPD-protected data require user identification',
      )
      result.riskLevel = 'HIGH'
      result.isValid = false
    }

    return result
  }

  private static containsDangerousPatterns(input: string): boolean {
    return this.DANGEROUS_PATTERNS.some(pattern => pattern.test(input))
  }

  private static buildSanitizedQuery(operation: SQLOperation): string {
    // This is a simplified example - in production, use a proper query builder
    const { type, table, columns, conditions } = operation

    switch (type) {
      case 'SELECT':
        const selectColumns = columns && columns.length > 0 ? columns.join(', ') : '*'
        let query = `SELECT ${selectColumns} FROM ${table}`

        if (conditions && Object.keys(conditions).length > 0) {
          const whereClause = Object.keys(conditions)
            .map(key => `${key} = $${key}`)
            .join(' AND ')
          query += ` WHERE ${whereClause}`
        }

        return query

      case 'INSERT':
        if (!columns || columns.length === 0) {
          throw new Error('INSERT operations require columns specification')
        }

        const insertColumns = columns.join(', ')
        const placeholders = columns
          .map((_, index) => `$${index + 1}`)
          .join(', ')
        return `INSERT INTO ${table} (${insertColumns}) VALUES (${placeholders})`

      case 'UPDATE':
        if (!columns || columns.length === 0) {
          throw new Error('UPDATE operations require columns specification')
        }

        const setClause = columns.map(col => `${col} = $${col}`).join(', ')
        let updateQuery = `UPDATE ${table} SET ${setClause}`

        if (conditions && Object.keys(conditions).length > 0) {
          const whereClause = Object.keys(conditions)
            .map(key => `${key} = $${key}`)
            .join(' AND ')
          updateQuery += ` WHERE ${whereClause}`
        }

        return updateQuery

      case 'DELETE':
        let deleteQuery = `DELETE FROM ${table}`

        if (conditions && Object.keys(conditions).length > 0) {
          const whereClause = Object.keys(conditions)
            .map(key => `${key} = $${key}`)
            .join(' AND ')
          deleteQuery += ` WHERE ${whereClause}`
        } else {
          throw new Error('DELETE operations require WHERE conditions')
        }

        return deleteQuery

      default:
        throw new Error(`Unsupported operation type: ${type}`)
    }
  }

  private static auditSQLOperation(
    operation: SQLOperation,
    result: SQLValidationResult,
  ): void {
    const tableConfig = this.ALLOWED_TABLES.find(
      t => t.name === operation.table,
    )!

    if (!tableConfig.auditRequired) {
      return
    }

    logger.auditDataAccess({
      _userId: operation.userId || 'unknown',
      patientId: operation.patientId,
      operation: `SQL_${operation.type}`,
      dataType: operation.table,
      endpoint: 'sql-sanitizer',
      ip: 'internal',
      userAgent: 'sql-sanitizer',
    })

    // Log validation result
    logger.info('SQL operation validated', {
      operation: operation.type,
      table: operation.table,
      isValid: result.isValid,
      riskLevel: result.riskLevel,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      _userId: operation.userId,
      patientId: operation.patientId,
    })
  }

  /**
   * Quick validation for simple operations
   */
  static isOperationAllowed(operationType: string, tableName: string): boolean {
    const tableConfig = this.ALLOWED_TABLES.find(t => t.name === tableName)
    if (!tableConfig) return false

    return tableConfig.allowedOperations.includes(
      operationType as SQLOperation['type'],
    )
  }

  /**
   * Get table configuration
   */
  static getTableConfig(tableName: string): TableConfig | undefined {
    return this.ALLOWED_TABLES.find(t => t.name === tableName)
  }

  /**
   * Check if table requires LGPD compliance
   */
  static requiresLGPDCompliance(tableName: string): boolean {
    const config = this.getTableConfig(tableName)
    return config?.lgpdProtected ?? false
  }

  /**
   * Check if operation requires patient consent
   */
  static requiresPatientConsent(tableName: string): boolean {
    const config = this.getTableConfig(tableName)
    return config?.requiresPatientConsent ?? false
  }
}

export { type SQLOperation, SQLSanitizer, type SQLValidationResult, type TableConfig }
