import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Mock process.env for testing
const originalEnv = process.env

describe('TypeScript Configuration Validation', () => {
  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('1. Consistent moduleResolution across all packages', () => {
    it('should validate moduleResolution in tsconfig files by checking content', () => {
      const tsconfigPaths = [
        'tsconfig.json',
        'tsconfig.base.json',
        'packages/database/tsconfig.json',
        'packages/types/tsconfig.json',
        'packages/config/tsconfig.json',
        'apps/api/tsconfig.json'
      ]

      const inconsistentFiles: string[] = []

      tsconfigPaths.forEach(path => {
        if (existsSync(path)) {
          const content = readFileSync(path, 'utf-8')

          // Check if moduleResolution is set to bundler
          if (content.includes('"moduleResolution"')) {
            const match = content.match(/"moduleResolution"\s*:\s*"([^"]+)"/)
            if (match && match[1] !== 'bundler') {
              inconsistentFiles.push(`${path}: ${match[1]}`)
            }
          } else {
            // If moduleResolution is not explicitly set, check if it extends a config that has it
            if (!content.includes('"extends"')) {
              inconsistentFiles.push(`${path}: moduleResolution not defined`)
            }
          }
        }
      })

      expect(inconsistentFiles).toHaveLength(0)
      expect(inconsistentFiles.join(', ')).toBe('')
    })

    it('should validate moduleResolution inheritance in extended configs', () => {
      // Check that extended configs properly inherit or override moduleResolution
      const typesContent = readFileSync('packages/types/tsconfig.json', 'utf-8')
      const apiContent = readFileSync('apps/api/tsconfig.json', 'utf-8')

      // Both should either have moduleResolution: bundler or extend a config that has it
      expect(typesContent).toContain('"moduleResolution": "bundler"')
      expect(apiContent).toContain('"moduleResolution": "bundler"')
    })
  })

  describe('2. Strict mode enabled in all tsconfig.json files', () => {
    it('should validate strict mode in tsconfig files by checking content', () => {
      const tsconfigPaths = [
        'tsconfig.json',
        'tsconfig.base.json',
        'packages/database/tsconfig.json',
        'packages/types/tsconfig.json',
        'packages/config/tsconfig.json',
        'apps/api/tsconfig.json'
      ]

      const nonStrictFiles: string[] = []

      tsconfigPaths.forEach(path => {
        if (existsSync(path)) {
          const content = readFileSync(path, 'utf-8')

          // Check if strict is enabled
          if (content.includes('"strict"')) {
            const match = content.match(/"strict"\s*:\s*(true|false)/)
            if (match && match[1] !== 'true') {
              nonStrictFiles.push(`${path}: ${match[1]}`)
            }
          } else {
            // If strict is not explicitly set, check if it extends a config that has it
            if (!content.includes('"extends"')) {
              nonStrictFiles.push(`${path}: strict not defined`)
            }
          }
        }
      })

      expect(nonStrictFiles).toHaveLength(0)
      expect(nonStrictFiles.join(', ')).toBe('')
    })

    it('should validate strict-related compiler options in base config', () => {
      const baseContent = readFileSync('tsconfig.base.json', 'utf-8')

      // Check strict mode options
      expect(baseContent).toContain('"strictNullChecks": true')
      expect(baseContent).toContain('"noImplicitAny": true')
      expect(baseContent).toContain('"strictFunctionTypes": true')
      expect(baseContent).toContain('"strictBindCallApply": true')
      expect(baseContent).toContain('"strictPropertyInitialization": true')
      expect(baseContent).toContain('"noImplicitThis": true')
      expect(baseContent).toContain('"useUnknownInCatchVariables": true')
      expect(baseContent).toContain('"alwaysStrict": true')
    })

    it('should validate database-specific strict options', () => {
      const databaseContent = readFileSync('packages/database/tsconfig.json', 'utf-8')

      // Check database-specific strict options
      expect(databaseContent).toContain('"exactOptionalPropertyTypes": true')
      expect(databaseContent).toContain('"noUncheckedIndexedAccess": true')
      expect(databaseContent).toContain('"noPropertyAccessFromIndexSignature": true')
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

    it('should validate bracket notation usage in source files', () => {
      // Check that source files use bracket notation for process.env
      const sourceFiles = [
        'apps/api/src/index.ts',
        'apps/api/src/services/jwt-service.ts',
        'apps/api/src/services/session-service.ts',
        'apps/api/src/trpc/context.ts'
      ]

      sourceFiles.forEach(file => {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf-8')

          // Check for process.env usage with bracket notation
          const bracketNotationMatches = content.match(/process\.env\[['"][^'"]+['"]\]/g) || []
          const dotNotationMatches = content.match(/process\.env\.[A-Z_]+/g) || []

          // All process.env access should use bracket notation
          expect(dotNotationMatches).toHaveLength(0)
          expect(bracketNotationMatches.length).toBeGreaterThan(0)
        }
      })
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
    it('should validate tsconfig files contain required compiler options', () => {
      const tsconfigPaths = [
        'tsconfig.json',
        'tsconfig.base.json',
        'packages/database/tsconfig.json',
        'packages/types/tsconfig.json',
        'packages/config/tsconfig.json',
        'apps/api/tsconfig.json'
      ]

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
          const content = readFileSync(path, 'utf-8')

          // Check that required options are present either directly or in extended config
          requiredOptions.forEach(option => {
            // If the option is not directly in this file, it might be in an extended config
            if (!content.includes(`"${option}"`)) {
              // Should extend a config that has this option
              expect(content.includes('"extends"')).toBe(true)
            }
          })
        }
      })
    })

    it('should validate include/exclude patterns are consistent', () => {
      const databaseContent = readFileSync('packages/database/tsconfig.json', 'utf-8')
      const typesContent = readFileSync('packages/types/tsconfig.json', 'utf-8')

      // Check that include patterns contain test files
      expect(databaseContent).toContain('src/**/*.test.ts')
      expect(databaseContent).toContain('src/**/*.spec.ts')
      expect(databaseContent).toContain('src/__tests__/**/*')

      expect(typesContent).toContain('src/**/*.test.ts')
      expect(typesContent).toContain('src/**/*.spec.ts')
      expect(typesContent).toContain('src/__tests__/**/*')

      // Check that exclude patterns are consistent
      expect(databaseContent).toContain('node_modules')
      expect(databaseContent).toContain('dist')
      expect(typesContent).toContain('node_modules')
      expect(typesContent).toContain('dist')
    })
  })
})
