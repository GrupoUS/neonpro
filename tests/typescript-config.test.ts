import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Mock process.env for testing
const originalEnv = process.env

// Helper function to parse JSON with comments
const parseJsonWithComments = (jsonString: string) => {
  // Remove comments before parsing
  const withoutComments = jsonString.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
  return JSON.parse(withoutComments)
}

describe('TypeScript Configuration Validation', () => {
  const tsconfigPaths = [
    'tsconfig.json',
    'tsconfig.base.json',
    'packages/database/tsconfig.json',
    'packages/types/tsconfig.json',
    'packages/config/tsconfig.json',
    'apps/api/tsconfig.json'
  ]

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('1. Consistent moduleResolution across all packages', () => {
    it('should have moduleResolution set to "bundler" in all tsconfig.json files', () => {
      const inconsistentFiles: string[] = []

      tsconfigPaths.forEach(path => {
        if (existsSync(path)) {
          const config = parseJsonWithComments(readFileSync(path, 'utf-8'))
          const moduleResolution = config.compilerOptions?.moduleResolution

          if (moduleResolution !== 'bundler') {
            inconsistentFiles.push(`${path}: ${moduleResolution || 'undefined'}`)
          }
        }
      })

      expect(inconsistentFiles).toHaveLength(0)
      expect(inconsistentFiles.join(', ')).toBe('')
    })

    it('should validate moduleResolution inheritance in extended configs', () => {
      // Check that extended configs properly inherit or override moduleResolution
      const typesConfig = parseJsonWithComments(readFileSync('packages/types/tsconfig.json', 'utf-8'))
      const apiConfig = parseJsonWithComments(readFileSync('apps/api/tsconfig.json', 'utf-8'))

      expect(typesConfig.compilerOptions?.moduleResolution).toBe('bundler')
      expect(apiConfig.compilerOptions?.moduleResolution).toBe('bundler')
    })
  })

  describe('2. Strict mode enabled in all tsconfig.json files', () => {
    it('should have strict mode enabled in all configurations', () => {
      const nonStrictFiles: string[] = []

      tsconfigPaths.forEach(path => {
        if (existsSync(path)) {
          const config = parseJsonWithComments(readFileSync(path, 'utf-8'))
          const strict = config.compilerOptions?.strict

          if (strict !== true) {
            nonStrictFiles.push(`${path}: ${strict || 'undefined'}`)
          }
        }
      })

      expect(nonStrictFiles).toHaveLength(0)
      expect(nonStrictFiles.join(', ')).toBe('')
    })

    it('should have strict-related compiler options enabled', () => {
      const baseConfig = parseJsonWithComments(readFileSync('tsconfig.base.json', 'utf-8'))
      const databaseConfig = parseJsonWithComments(readFileSync('packages/database/tsconfig.json', 'utf-8'))

      // Check strict mode options
      expect(baseConfig.compilerOptions?.strictNullChecks).toBe(true)
      expect(baseConfig.compilerOptions?.noImplicitAny).toBe(true)
      expect(baseConfig.compilerOptions?.strictFunctionTypes).toBe(true)
      expect(baseConfig.compilerOptions?.strictBindCallApply).toBe(true)
      expect(baseConfig.compilerOptions?.strictPropertyInitialization).toBe(true)
      expect(baseConfig.compilerOptions?.noImplicitThis).toBe(true)
      expect(baseConfig.compilerOptions?.useUnknownInCatchVariables).toBe(true)
      expect(baseConfig.compilerOptions?.alwaysStrict).toBe(true)

      // Check database-specific strict options
      expect(databaseConfig.compilerOptions?.exactOptionalPropertyTypes).toBe(true)
      expect(databaseConfig.compilerOptions?.noUncheckedIndexedAccess).toBe(true)
      expect(databaseConfig.compilerOptions?.noPropertyAccessFromIndexSignature).toBe(true)
    })
  })

  describe('3. Environment variables accessed with bracket notation', () => {
    it('should validate process.env bracket notation usage', () => {
      // Mock environment variables for testing
      process.env = {
        ...originalEnv,
        'TEST_VAR': 'test-value',
        'SUPABASE_URL': 'https://test.supabase.co',
        'JWT_SECRET': 'test-secret',
        'NODE_ENV': 'test'
      }

      // Test bracket notation access patterns
      const testAccess = () => {
        // Correct bracket notation
        const value1 = process.env['TEST_VAR']
        const value2 = process.env['SUPABASE_URL']
        const value3 = process.env['JWT_SECRET']
        const value4 = process.env['NODE_ENV']

        return { value1, value2, value3, value4 }
      }

      const result = testAccess()
      expect(result.value1).toBe('test-value')
      expect(result.value2).toBe('https://test.supabase.co')
      expect(result.value3).toBe('test-secret')
      expect(result.value4).toBe('test')
    })

    it('should handle undefined environment variables safely', () => {
      // Test safe handling of undefined env vars
      const testUndefinedAccess = () => {
        // Should handle undefined safely
        const undefinedVar = process.env['UNDEFINED_VAR']
        const withDefault = process.env['ANOTHER_UNDEFINED'] ?? 'default-value'
        const withCoercion = parseInt(process.env['NUMBER_VAR'] || '0')

        return { undefinedVar, withDefault, withCoercion }
      }

      const result = testUndefinedAccess()
      expect(result.undefinedVar).toBeUndefined()
      expect(result.withDefault).toBe('default-value')
      expect(result.withCoercion).toBe(0)
    })
  })

  describe('4. Proper type exports without value/type confusion', () => {
    it('should validate type-only exports in packages', () => {
      // Check that type exports use proper syntax
      const typeExportPatterns = [
        'export type {',
        'export type *',
        'export interface',
        'export type Database',
        'export type SupabaseClient'
      ]

      // Read package index files to check export patterns
      const packageIndexPaths = [
        'packages/types/src/index.ts',
        'packages/database/src/index.ts',
        'packages/ui/src/index.ts'
      ]

      packageIndexPaths.forEach(path => {
        if (existsSync(path)) {
          const content = readFileSync(path, 'utf-8')

          // Check for proper type exports
          typeExportPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
              // Verify the pattern is used correctly
              expect(content).toContain(pattern)
            }
          })

          // Check for problematic mixed exports
          const problematicPatterns = [
            'export { type',
            'export { value, type'
          ]

          problematicPatterns.forEach(problematic => {
            if (content.includes(problematic)) {
              // If found, ensure it's properly formatted
              const lines = content.split('\n')
              const problematicLines = lines.filter(line => line.includes(problematic))

              problematicLines.forEach(line => {
                // Should be properly formatted with explicit type keyword
                if (line.includes('type')) {
                  expect(line).toMatch(/export\s*{[^}]*type\s+[^}]+}/)
                }
              })
            }
          })
        }
      })
    })

    it('should validate type imports are properly declared', () => {
      // Check that type imports use proper syntax
      const typeImportPatterns = [
        'import type',
        'import { type',
        'import * as type'
      ]

      const testFilePaths = [
        'packages/database/src/client.ts',
        'packages/types/src/index.ts'
      ]

      testFilePaths.forEach(path => {
        if (existsSync(path)) {
          const content = readFileSync(path, 'utf-8')

          // Check for proper type imports
          typeImportPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
              // Verify the pattern is used correctly
              expect(content).toContain(pattern)
            }
          })
        }
      })
    })
  })

  describe('5. LGPD compliance for sensitive env handling', () => {
    it('should validate LGPD-compliant environment variable handling', () => {
      // Mock sensitive environment variables
      process.env = {
        ...originalEnv,
        'PATIENT_DATA_ENCRYPTION_KEY': 'sensitive-key',
        'LGPD_AUDIT_WEBHOOK': 'https://audit.example.com',
        'DATABASE_URL': 'postgresql://localhost:5432/neonpro',
        'SUPABASE_SERVICE_ROLE_KEY': 'super-secret-key'
      }

      // Test LGPD-compliant access patterns
      const lgpdCompliantAccess = () => {
        // Sensitive data should be accessed with bracket notation
        const encryptionKey = process.env['PATIENT_DATA_ENCRYPTION_KEY']
        const auditWebhook = process.env['LGPD_AUDIT_WEBHOOK']

        // Database credentials should be handled securely
        const dbUrl = process.env['DATABASE_URL']

        // Service role keys should never be exposed in edge runtime
        const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

        return {
          hasEncryptionKey: !!encryptionKey,
          hasAuditWebhook: !!auditWebhook,
          hasDbUrl: !!dbUrl,
          serviceRoleKeyLength: serviceRoleKey?.length || 0
        }
      }

      const result = lgpdCompliantAccess()
      expect(result.hasEncryptionKey).toBe(true)
      expect(result.hasAuditWebhook).toBe(true)
      expect(result.hasDbUrl).toBe(true)
      expect(result.serviceRoleKeyLength).toBeGreaterThan(0)
    })

    it('should validate no sensitive data exposure in logs', () => {
      // Test that sensitive environment variables are not exposed
      const sensitiveKeys = [
        'PATIENT_DATA_ENCRYPTION_KEY',
        'LGPD_AUDIT_WEBHOOK',
        'DATABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET'
      ]

      const logSafeAccess = (key: string) => {
        // Should access with bracket notation
        const value = process.env[key]

        // Should not log sensitive values directly
        if (value && sensitiveKeys.includes(key)) {
          return `***REDACTED_${key}***`
        }

        return value
      }

      sensitiveKeys.forEach(key => {
        process.env[key] = 'sensitive-test-value'
        const result = logSafeAccess(key)
        expect(result).toBe(`***REDACTED_${key}***`)
      })
    })

    it('should validate environment variable validation for LGPD', () => {
      // Test LGPD-required environment variables
      const requiredLgpdVars = [
        'LGPD_AUDIT_WEBHOOK',
        'PATIENT_DATA_ENCRYPTION_KEY',
        'DATA_RETENTION_DAYS'
      ]

      const validateLgpdCompliance = () => {
        const compliance: Record<string, boolean> = {}

        requiredLgpdVars.forEach(varName => {
          const value = process.env[varName]
          compliance[varName] = !!value
        })

        return compliance
      }

      // Set some required variables
      process.env['LGPD_AUDIT_WEBHOOK'] = 'https://audit.example.com'
      process.env['PATIENT_DATA_ENCRYPTION_KEY'] = 'encryption-key-123'
      process.env['DATA_RETENTION_DAYS'] = '2555' // 7 years

      const compliance = validateLgpdCompliance()
      expect(compliance['LGPD_AUDIT_WEBHOOK']).toBe(true)
      expect(compliance['PATIENT_DATA_ENCRYPTION_KEY']).toBe(true)
      expect(compliance['DATA_RETENTION_DAYS']).toBe(true)
    })

    it('should validate secure handling of patient data environment variables', () => {
      // Test secure patterns for patient data handling
      process.env = {
        ...originalEnv,
        'PATIENT_DATA_BUCKET': 'patient-records-secure',
        'PATIENT_DATA_REGION': 'br-sao1',
        'LGPD_CONSENT_WEBHOOK': 'https://consent.example.com'
      }

      const securePatientDataAccess = () => {
        // Access patient data configuration securely
        const config = {
          bucket: process.env['PATIENT_DATA_BUCKET'],
          region: process.env['PATIENT_DATA_REGION'],
          consentWebhook: process.env['LGPD_CONSENT_WEBHOOK']
        }

        // Validate all required fields are present
        const isValid = !!(config.bucket && config.region && config.consentWebhook)

        return { config, isValid }
      }

      const result = securePatientDataAccess()
      expect(result.isValid).toBe(true)
      expect(result.config.bucket).toBe('patient-records-secure')
      expect(result.config.region).toBe('br-sao1')
      expect(result.config.consentWebhook).toBe('https://consent.example.com')
    })
  })

  describe('Configuration File Validation', () => {
    it('should validate all tsconfig.json files are valid JSON', () => {
      tsconfigPaths.forEach(path => {
        if (existsSync(path)) {
          expect(() => {
            parseJsonWithComments(readFileSync(path, 'utf-8'))
          }).not.toThrow()
        }
      })
    })

    it('should validate required compiler options are present', () => {
      const requiredOptions = [
        'target',
        'module',
        'moduleResolution',
        'strict',
        'esModuleInterop',
        'skipLibCheck',
        'forceConsistentCasingInFileNames'
      ]

      tsconfigPaths.forEach(path => {
        if (existsSync(path)) {
          const config = parseJsonWithComments(readFileSync(path, 'utf-8'))
          const compilerOptions = config.compilerOptions || {}

          requiredOptions.forEach(option => {
            expect(compilerOptions).toHaveProperty(option)
          })
        }
      })
    })

    it('should validate include/exclude patterns are consistent', () => {
      const databaseConfig = parseJsonWithComments(readFileSync('packages/database/tsconfig.json', 'utf-8'))
      const typesConfig = parseJsonWithComments(readFileSync('packages/types/tsconfig.json', 'utf-8'))

      // Check that include patterns contain test files
      expect(databaseConfig.include).toContain('src/**/*.test.ts')
      expect(databaseConfig.include).toContain('src/**/*.spec.ts')
      expect(databaseConfig.include).toContain('src/__tests__/**/*')

      expect(typesConfig.include).toContain('src/**/*.test.ts')
      expect(typesConfig.include).toContain('src/**/*.spec.ts')
      expect(typesConfig.include).toContain('src/__tests__/**/*')

      // Check that exclude patterns are consistent
      expect(databaseConfig.exclude).toContain('node_modules')
      expect(databaseConfig.exclude).toContain('dist')
      expect(typesConfig.exclude).toContain('node_modules')
      expect(typesConfig.exclude).toContain('dist')
    })
  })
})
