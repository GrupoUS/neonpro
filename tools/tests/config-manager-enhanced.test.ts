/**
 * 🧪 Enhanced ConfigManager Test Suite
 *
 * Comprehensive tests for the enhanced configuration management system including:
 * - Configuration templates and environment-specific overrides
 * - Advanced validation with dependency checking
 * - Configuration migration and versioning support
 * - Health checks and monitoring
 * - Deprecation handling and validation
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  ConfigManager,
  createConfigManager,
  HealthcareConfigSchemas,
} from "../../apps/api/src/utils/config-manager"
import {
  HealthcareError,
  HealthcareErrorCategory,
  HealthcareErrorSeverity,
} from "../../apps/api/src/utils/healthcare-errors"
import { SecureLogger } from "../../apps/api/src/utils/secure-logger"

// Test configuration interfaces
interface TestConfig {
  database: {
    host: string
    port: number
    name: string
    ssl: boolean
  }
  security: {
    jwtSecret: string
    bcryptRounds: number
    sessionTimeout: number
  }
  monitoring: {
    enableMetrics: boolean
    metricsInterval: number
  }
  features: {
    enableAI: boolean
    enableNotifications: boolean
  }
}

describe.skip("ConfigManager - Enhanced Features", () => {
  let configManager: ConfigManager<TestConfig>
  let logger: SecureLogger

  beforeEach(() => {
    logger = new SecureLogger({
      level: "debug",
      maskSensitiveData: true,
      lgpdCompliant: true,
      auditTrail: true,
      _service: "ConfigManagerTest",
    })

    configManager = createConfigManager<TestConfig>({
      environment: "development",
      enableHotReload: true,
      enableChangeTracking: true,
      strictValidation: true,
      auditLogChanges: true,
      enableTemplates: true,
      enableMigrationSupport: true,
      enableHealthChecks: true,
    })
  })

  afterEach(() => {
    // Reset config manager state
    configManager = null as any
  })

  describe("Configuration Templates", () => {
    it("should define and apply configuration templates", () => {
      // Define a template
      const developmentTemplate: Partial<TestConfig> = {
        database: {
          host: "localhost",
          port: 5432,
          name: "neonpro_dev",
          ssl: false,
        },
        monitoring: {
          enableMetrics: true,
          metricsInterval: 30,
        },
      }

      configManager.defineTemplate("development", developmentTemplate)

      // Verify template is stored
      expect(configManager.getTemplate("development")).toEqual(developmentTemplate)
      expect(configManager.listTemplates()).toContain("development")
    })

    it("should apply template with deep merge strategy", () => {
      // Define schema first
      configManager.defineSchema("database", {
        type: "object",
        required: true,
        default: { host: "localhost", port: 5432, name: "test", ssl: false },
      })

      // Set some initial config
      configManager.set("database", { host: "existing-host", port: 3000 } as any)

      // Define and apply template
      const template = {
        database: { name: "template-db", ssl: true },
        features: { enableAI: true },
      }

      configManager.defineTemplate("test", template)
      configManager.applyTemplate("test", { mergeStrategy: "deep-merge" })

      // Verify deep merge worked correctly
      const dbConfig = configManager.get("database")
      expect(dbConfig).toEqual({
        host: "existing-host", // preserved
        port: 3000, // preserved
        name: "template-db", // merged
        ssl: true, // merged
      })
    })

    it("should throw error for conflicting template application", () => {
      // Set existing config
      configManager.defineSchema("features", {
        type: "object",
        required: true,
      })
      configManager.set("features", { enableAI: false, enableNotifications: true } as any)

      // Define template with conflicting keys
      const template = { features: { enableAI: true } }
      configManager.defineTemplate("conflict", template)

      // Should throw error when trying to apply without override
      expect(() => {
        configManager.applyTemplate("conflict", { override: false })
      }).toThrow("TEMPLATE_CONFLICT")

      // Should succeed with override
      expect(() => {
        configManager.applyTemplate("conflict", { override: true })
      }).not.toThrow()
    })

    it("should validate template against schema", () => {
      // Define schema with validation
      configManager.defineSchema("security", {
        type: "object",
        required: true,
        validator: (value: any) => value.jwtSecret && value.jwtSecret.length >= 32,
      })

      // Define invalid template
      const invalidTemplate = {
        security: { jwtSecret: "short" }, // Too short
      }

      // Should throw validation error
      expect(() => {
        configManager.defineTemplate("invalid", invalidTemplate)
      }).toThrow("INVALID_TEMPLATE")
    })
  })

  describe("Environment-specific Configuration", () => {
    it("should apply development environment overrides", async () => {
      // Define schema for environment-specific configs
      configManager.defineSchema("debug", { type: "boolean", default: false })
      configManager.defineSchema("logLevel", { type: "string", default: "info" })
      configManager.defineSchema("enableHotReload", { type: "boolean", default: false })

      // Apply development overrides
      await configManager.applyEnvironmentOverrides("development")

      // Verify development-specific values
      expect(configManager.get("debug")).toBe(true)
      expect(configManager.get("logLevel")).toBe("debug")
      expect(configManager.get("enableHotReload")).toBe(true)
    })

    it("should apply production environment overrides", async () => {
      // Define schema for environment-specific configs
      configManager.defineSchema("debug", { type: "boolean", default: false })
      configManager.defineSchema("logLevel", { type: "string", default: "info" })

      // Apply production overrides
      await configManager.applyEnvironmentOverrides("production")

      // Verify production-specific values
      expect(configManager.get("debug")).toBe(false)
      expect(configManager.get("logLevel")).toBe("warn")
    })

    it("should handle unknown environment gracefully", async () => {
      // Define schema
      configManager.defineSchema("debug", { type: "boolean", default: false })

      // Apply unknown environment - should not crash
      await expect(configManager.applyEnvironmentOverrides("unknown")).resolves.not.toThrow()

      // Should keep default values
      expect(configManager.get("debug")).toBeUndefined()
    })
  })

  describe("Configuration Migration", () => {
    it("should add and run migrations successfully", async () => {
      // Add a migration
      const migration = {
        id: "test-migration-1",
        version: "1.0.0",
        description: "Test migration",
        migrate: async (context: any) => {
          // Simple migration that adds a config value
          context.currentConfig.migrationTest = "migrated"
        },
      }

      await configManager.addMigration(migration)

      // Run migrations
      const results = await configManager.runMigrations()

      // Verify migration was applied
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        id: "test-migration-1",
        success: true,
        message: "Applied successfully",
      })

      // Verify config was updated
      expect(configManager.get("migrationTest")).toBe("migrated")
    })

    it("should handle migration failures gracefully", async () => {
      // Add a failing migration
      const failingMigration = {
        id: "failing-migration",
        version: "1.0.0",
        description: "Failing migration",
        migrate: async () => {
          throw new Error("Migration failed")
        },
        continueOnFailure: true,
      }

      await configManager.addMigration(failingMigration)

      // Add a successful migration
      const successfulMigration = {
        id: "successful-migration",
        version: "1.0.1",
        description: "Successful migration",
        migrate: async (context: any) => {
          context.currentConfig.successfulValue = "success"
        },
      }

      await configManager.addMigration(successfulMigration)

      // Run migrations
      const results = await configManager.runMigrations()

      // Verify both migrations were processed
      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(false)
      expect(results[1].success).toBe(true)

      // Verify successful migration was still applied
      expect(configManager.get("successfulValue")).toBe("success")
    })

    it("should support dry run migrations", async () => {
      const migration = {
        id: "dry-run-test",
        version: "1.0.0",
        description: "Dry run test",
        migrate: async (context: any) => {
          context.currentConfig.dryRunValue = "should_not_appear"
        },
      }

      await configManager.addMigration(migration)

      // Run migrations in dry run mode
      const results = await configManager.runMigrations({ dryRun: true })

      // Verify migration was processed but not applied
      expect(results[0].success).toBe(true)
      expect(results[0].message).toBe("Would be applied")
      expect(configManager.get("dryRunValue")).toBeUndefined()
    })

    it("should skip already applied migrations", async () => {
      const migration = {
        id: "skip-test",
        version: "1.0.0",
        description: "Skip test",
        migrate: async (context: any) => {
          context.currentConfig.skipValue = "should_skip"
        },
        applied: true, // Mark as already applied
      }

      await configManager.addMigration(migration)

      // Run migrations
      const results = await configManager.runMigrations()

      // Verify migration was skipped
      expect(results[0].success).toBe(true)
      expect(results[0].skipped).toBe(true)
      expect(results[0].message).toBe("Already applied")
      expect(configManager.get("skipValue")).toBeUndefined()
    })
  })

  describe("Configuration Health Checks", () => {
    it("should pass health checks for valid configuration", async () => {
      // Define schema
      configManager.defineSchema("testConfig", {
        type: "string",
        required: true,
        default: "default-value",
      })

      // Set valid configuration
      await configManager.set("testConfig", "valid-value")

      // Run health checks
      const healthStatus = await configManager.runHealthChecks()

      // Should be healthy
      expect(healthStatus.healthy).toBe(true)
      expect(healthStatus.issues).toHaveLength(0)
    })

    it("should detect validation errors in health checks", async () => {
      // Define schema with validation
      configManager.defineSchema("validatedConfig", {
        type: "string",
        required: true,
        validator: (value: any) => value.length >= 5,
      })

      // Set invalid configuration
      await configManager.set("validatedConfig", "short")

      // Run health checks
      const healthStatus = await configManager.runHealthChecks()

      // Should detect validation error
      expect(healthStatus.healthy).toBe(false)
      expect(healthStatus.issues).toHaveLength(1)
      expect(healthStatus.issues[0].type).toBe("validation_error")
      expect(healthStatus.issues[0].severity).toBe("high")
    })

    it("should detect deprecated configurations", async () => {
      // Define deprecated schema
      configManager.defineSchema("oldConfig", {
        type: "string",
        deprecated: true,
        deprecationMessage: "Use newConfig instead",
      })

      // Set deprecated configuration
      await configManager.set("oldConfig", "using-old-config")

      // Run health checks
      const healthStatus = await configManager.runHealthChecks()

      // Should detect deprecated config
      expect(healthStatus.healthy).toBe(false)
      expect(healthStatus.issues).toHaveLength(1)
      expect(healthStatus.issues[0].type).toBe("deprecated_config")
      expect(healthStatus.issues[0].severity).toBe("medium")
    })

    it("should detect missing required configurations", async () => {
      // Define required schema without default
      configManager.defineSchema("requiredConfig", {
        type: "string",
        required: true,
      })

      // Don't set the configuration

      // Run health checks
      const healthStatus = await configManager.runHealthChecks()

      // Should detect missing required config
      expect(healthStatus.healthy).toBe(false)
      expect(healthStatus.issues).toHaveLength(1)
      expect(healthStatus.issues[0].type).toBe("missing_required")
      expect(healthStatus.issues[0].severity).toBe("high")
    })

    it("should detect configuration dependencies", async () => {
      // Define dependent schemas
      configManager.defineSchema("primaryConfig", {
        type: "string",
        required: true,
        dependencies: ["dependentConfig"],
      })

      configManager.defineSchema("dependentConfig", {
        type: "string",
        required: false,
      })

      // Set primary config but not dependency
      await configManager.set("primaryConfig", "primary-value")

      // Run health checks
      const healthStatus = await configManager.runHealthChecks()

      // Should detect missing dependency
      expect(healthStatus.healthy).toBe(false)
      expect(healthStatus.issues).toHaveLength(1)
      expect(healthStatus.issues[0].type).toBe("missing_dependency")
      expect(healthStatus.issues[0].severity).toBe("medium")
    })
  })

  describe("Advanced Configuration Validation", () => {
    it("should validate allowed values", () => {
      // Define schema with allowed values
      configManager.defineSchema("environment", {
        type: "string",
        required: true,
        allowedValues: ["development", "staging", "production"],
      })

      // Should accept valid values
      expect(() => configManager.set("environment", "development" as any)).not.toThrow()
      expect(() => configManager.set("environment", "staging" as any)).not.toThrow()
      expect(() => configManager.set("environment", "production" as any)).not.toThrow()

      // Should reject invalid values
      expect(() => configManager.set("environment", "invalid" as any)).toThrow(
        "INVALID_CONFIG_VALUE",
      )
    })

    it("should validate numeric constraints", () => {
      // Define schema with numeric constraints
      configManager.defineSchema("port", {
        type: "number",
        required: true,
        min: 1,
        max: 65535,
      })

      configManager.defineSchema("timeout", {
        type: "number",
        required: true,
        min: 1000,
        max: 30000,
      })

      // Should accept valid numeric values
      expect(() => configManager.set("port", 8080)).not.toThrow()
      expect(() => configManager.set("timeout", 5000)).not.toThrow()

      // Should reject out-of-range values
      expect(() => configManager.set("port", 0)).toThrow("INVALID_CONFIG_VALUE")
      expect(() => configManager.set("port", 70000)).toThrow("INVALID_CONFIG_VALUE")
      expect(() => configManager.set("timeout", 500)).toThrow("INVALID_CONFIG_VALUE")
      expect(() => configManager.set("timeout", 40000)).toThrow("INVALID_CONFIG_VALUE")
    })

    it("should validate string length constraints", () => {
      // Define schema with length constraints
      configManager.defineSchema("apiKey", {
        type: "string",
        required: true,
        minLength: 32,
        maxLength: 64,
      })

      // Should accept valid length strings
      expect(() => configManager.set("apiKey", "a".repeat(32))).not.toThrow()
      expect(() => configManager.set("apiKey", "a".repeat(64))).not.toThrow()

      // Should reject invalid length strings
      expect(() => configManager.set("apiKey", "a".repeat(31))).toThrow("INVALID_CONFIG_VALUE")
      expect(() => configManager.set("apiKey", "a".repeat(65))).toThrow("INVALID_CONFIG_VALUE")
    })

    it("should validate pattern matching", () => {
      // Define schema with pattern validation
      configManager.defineSchema("email", {
        type: "string",
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      })

      configManager.defineSchema("uuid", {
        type: "string",
        required: true,
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      })

      // Should accept valid patterns
      expect(() => configManager.set("email", "test@example.com")).not.toThrow()
      expect(() => configManager.set("uuid", "123e4567-e89b-12d3-a456-426614174000")).not.toThrow()

      // Should reject invalid patterns
      expect(() => configManager.set("email", "invalid-email")).toThrow("INVALID_CONFIG_VALUE")
      expect(() => configManager.set("uuid", "invalid-uuid")).toThrow("INVALID_CONFIG_VALUE")
    })

    it("should handle sensitive healthcare data appropriately", () => {
      // Define sensitive healthcare configuration
      configManager.defineSchema("patientDataEncryption", {
        type: "object",
        required: true,
        sensitive: true,
      })

      // Set sensitive data
      const sensitiveData = { algorithm: "AES-256", key: "secret-key" }
      configManager.set("patientDataEncryption", sensitiveData as any)

      // Verify data is stored but masked in getAll()
      expect(configManager.get("patientDataEncryption")).toEqual(sensitiveData)
      expect(configManager.getAll()).not.toHaveProperty("patientDataEncryption") // Should be filtered out
    })
  })

  describe("Performance and Memory Management", () => {
    it("should clear validation cache appropriately", async () => {
      // Define schema and set configuration
      configManager.defineSchema("cacheTest", {
        type: "string",
        required: true,
      })

      await configManager.set("cacheTest", "initial-value")

      // Verify value is cached
      expect(configManager.get("cacheTest")).toBe("initial-value")

      // Run migrations to clear cache
      const migration = {
        id: "cache-clear-test",
        version: "1.0.0",
        description: "Test cache clearing",
        migrate: async () => {
          // Migration that doesn't change config
        },
      }

      await configManager.addMigration(migration)
      await configManager.runMigrations()

      // Cache should be cleared but value should remain
      expect(configManager.get("cacheTest")).toBe("initial-value")
    })

    it("should handle large configuration efficiently", async () => {
      // Create large configuration object
      const largeConfig: Partial<TestConfig> = {
        database: {
          host: "localhost",
          port: 5432,
          name: "large_db",
          ssl: true,
        },
        monitoring: {
          enableMetrics: true,
          metricsInterval: 60,
        },
      }

      // Add many nested properties
      for (let i = 0; i < 100; i++) {
        ;(largeConfig as any)[`nested_${i}`] = {
          level1: { level2: { level3: `value_${i}` } },
        }
      }

      // Should handle large config without performance issues
      const startTime = Date.now()

      // Define schema for all properties
      configManager.defineSchema("database", { type: "object", required: true })
      configManager.defineSchema("monitoring", { type: "object", required: true })

      for (let i = 0; i < 100; i++) {
        configManager.defineSchema(`nested_${i}`, { type: "object", required: false })
      }

      // Set configuration
      await configManager.set("database", largeConfig.database!)
      await configManager.set("monitoring", largeConfig.monitoring!)

      for (let i = 0; i < 100; i++) {
        await configManager.set(`nested_${i}` as any, (largeConfig as any)[`nested_${i}`])
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000)

      // Verify all values are accessible
      expect(configManager.get("database")).toEqual(largeConfig.database)
      expect(configManager.get("nested_99")).toEqual((largeConfig as any).nested_99)
    })
  })
})
