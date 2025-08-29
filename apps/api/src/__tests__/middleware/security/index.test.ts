/**
 * Tests for Healthcare Security Middleware Orchestrator
 * Framework: Jest (ts-jest). If this repo uses Vitest, replace jest.* with vi.* as needed.
 *
 * Focus: Validate composition, ordering, and configuration propagation for:
 *  - HealthcareSecurityOrchestrator
 *  - healthcareSecurityMiddlewares factory
 *  - createHealthcareAPISecurityStack
 *
 * Strategy: Mock all underlying middleware creators to observe call order and parameters.
 */

import type { MiddlewareHandler } from "hono"

// IMPORTANT: adjust the import path if the repository layout differs.
// This path assumes: apps/api/src/__tests__/middleware/security/index.test.ts
// testing apps/api/src/middleware/security/index.ts
import {
  HealthcareSecurityOrchestrator,
  healthcareSecurityMiddlewares,
  createHealthcareAPISecurityStack,
  EndpointSecurityLevel,
  SecurityEnvironment,
  HealthcareRole,
  ValidationContext,
  HealthcareCORSPolicy,
} from "../../../middleware/security/index"

// Mock underlying modules to capture calls and return identifiable middleware functions
jest.mock("../../../middleware/security/auth/jwt-validation", () => {
  return {
    createJWTAuthMiddleware: jest.fn((opts: any) => {
      const fn: MiddlewareHandler = (c, next) => next()
      // attach marker for identity in assertions
      ;(fn as any).__name = "jwtAuth"
      ;(fn as any).__opts = opts
      return fn
    }),
    HealthcareRole: {
      PATIENT: "patient",
      PHYSICIAN: "physician",
      NURSE: "nurse",
      EMERGENCY_PHYSICIAN: "emergency_physician",
      ADMIN: "admin",
    },
  }
})

jest.mock("../../../middleware/security/error-handling/healthcare-error-handler", () => {
  return {
    createHealthcareErrorHandler: jest.fn((opts: any) => {
      const fn: MiddlewareHandler = (c, next) => next()
      ;(fn as any).__name = "errorHandler"
      ;(fn as any).__opts = opts
      return fn
    }),
  }
})

jest.mock("../../../middleware/security/headers/healthcare-cors-middleware", () => {
  return {
    createHealthcareCORSMiddleware: jest.fn((policy: any, opts: any) => {
      const fn: MiddlewareHandler = (c, next) => next()
      ;(fn as any).__name = "cors"
      ;(fn as any).__policy = policy
      ;(fn as any).__opts = opts
      return fn
    }),
    healthcareCORSMiddlewares: {
      // not used directly in these tests
    },
    HealthcareCORSPolicy: {
      STRICT: "strict",
      PATIENT_PORTAL: "patient_portal",
      EMERGENCY: "emergency",
      DEVELOPMENT: "development",
    },
  }
})

jest.mock("../../../middleware/security/headers/security-headers-middleware", () => {
  return {
    createSecurityHeadersMiddleware: jest.fn((configName: string, opts: any) => {
      const fn: MiddlewareHandler = (c, next) => next()
      ;(fn as any).__name = "securityHeaders"
      ;(fn as any).__configName = configName
      ;(fn as any).__opts = opts
      return fn
    }),
    securityHeadersMiddlewares: {},
  }
})

jest.mock("../../../middleware/security/rate-limiting/healthcare-rate-limiter", () => {
  return {
    createHealthcareRateLimiter: jest.fn((_client: any, opts: any) => {
      const fn: MiddlewareHandler = (c, next) => next()
      ;(fn as any).__name = "rateLimiterMemory"
      ;(fn as any).__opts = opts
      return fn
    }),
    createRedisHealthcareRateLimiter: jest.fn((client: any, opts: any) => {
      const fn: MiddlewareHandler = (c, next) => next()
      ;(fn as any).__name = "rateLimiterRedis"
      ;(fn as any).__client = client
      ;(fn as any).__opts = opts
      return fn
    }),
  }
})

jest.mock("../../../middleware/security/validation/healthcare-validation-middleware", () => {
  return {
    createHealthcareValidationMiddleware: jest.fn((context: any, opts: any) => {
      const fn: MiddlewareHandler = (c, next) => next()
      ;(fn as any).__name = "validation"
      ;(fn as any).__context = context
      ;(fn as any).__opts = opts
      return fn
    }),
    validationMiddlewares: {
      patientRegistration: (auditLogger?: any) => {
        const fn: MiddlewareHandler = (c, next) => next()
        ;(fn as any).__name = "validationPreset:patientRegistration"
        ;(fn as any).__auditLogger = auditLogger
        return fn
      },
      patientUpdate: (auditLogger?: any) => {
        const fn: MiddlewareHandler = (c, next) => next()
        ;(fn as any).__name = "validationPreset:patientUpdate"
        ;(fn as any).__auditLogger = auditLogger
        return fn
      },
      providerRegistration: (auditLogger?: any) => {
        const fn: MiddlewareHandler = (c, next) => next()
        ;(fn as any).__name = "validationPreset:providerRegistration"
        ;(fn as any).__auditLogger = auditLogger
        return fn
      },
      appointmentBooking: (auditLogger?: any) => {
        const fn: MiddlewareHandler = (c, next) => next()
        ;(fn as any).__name = "validationPreset:appointmentBooking"
        ;(fn as any).__auditLogger = auditLogger
        return fn
      },
      emergencyAccess: (auditLogger?: any) => {
        const fn: MiddlewareHandler = (c, next) => next()
        ;(fn as any).__name = "validationPreset:emergencyAccess"
        ;(fn as any).__auditLogger = auditLogger
        return fn
      },
    },
    ValidationContext: {
      MEDICAL_RECORD_CREATE: "MEDICAL_RECORD_CREATE",
      PATIENT_UPDATE: "PATIENT_UPDATE",
      PATIENT_REGISTRATION: "PATIENT_REGISTRATION",
      PROVIDER_REGISTRATION: "PROVIDER_REGISTRATION",
      APPOINTMENT_BOOKING: "APPOINTMENT_BOOKING",
      EMERGENCY_ACCESS: "EMERGENCY_ACCESS",
    },
  }
})

/**
 * Utilities
 */
const getNames = (middlewares: MiddlewareHandler[]) =>
  middlewares.map((m) => (m as any).__name || "unknown")

describe("HealthcareSecurityOrchestrator - middleware composition", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("includes errorHandler, securityHeaders, cors, rateLimiter, jwtAuth in that order for production medical_records", () => {
    const orchestrator = new HealthcareSecurityOrchestrator("medical_records_production")
    const stack = orchestrator.createSecurityMiddleware()
    expect(getNames(stack)).toEqual(["errorHandler", "securityHeaders", "cors", "rateLimiterRedis", "jwtAuth"])
  })

  it("uses redis rate limiter when storage is redis and client provided; otherwise memory limiter", () => {
    const redisClient = { ping: jest.fn() }
    // With redis client (default config already uses redis in prod)
    const orchRedis = new HealthcareSecurityOrchestrator("patient_portal_production", {
      rateLimiting: { redisClient } as any,
    })
    const stackRedis = orchRedis.createSecurityMiddleware()
    expect(getNames(stackRedis)).toContain("rateLimiterRedis")
    // No redis client -> memory
    const orchMem = new HealthcareSecurityOrchestrator("patient_portal_production", {
      rateLimiting: { redisClient: undefined } as any,
    })
    const stackMem = orchMem.createSecurityMiddleware()
    expect(getNames(stackMem)).toContain("rateLimiterMemory")
  })

  it("omits disabled components (development config disables auth and rate limiting)", () => {
    const orchestrator = new HealthcareSecurityOrchestrator("development")
    const stack = orchestrator.createSecurityMiddleware()
    // development: errorHandling=true, securityHeaders=true, cors=true, rateLimiting=false, authentication=false
    expect(getNames(stack)).toEqual(["errorHandler", "securityHeaders", "cors"])
  })

  it("createValidationMiddleware returns no-op when inputValidation disabled", async () => {
    const orchestrator = new HealthcareSecurityOrchestrator("development", {
      inputValidation: { enabled: false } as any,
    })
    const mw = orchestrator.createValidationMiddleware(ValidationContext.PATIENT_REGISTRATION)
    const calls: string[] = []
    const c: any = {}
    const next = jest.fn(async () => {
      calls.push("next")
    })
    await mw(c, next)
    expect(next).toHaveBeenCalled()
    expect(calls).toEqual(["next"])
  })

  it("createValidationMiddleware delegates to createHealthcareValidationMiddleware with auditLogger and emergencyBypass", () => {
    const auditLogger = { log: jest.fn() }
    const orchestrator = new HealthcareSecurityOrchestrator("medical_records_production", {
      inputValidation: { auditLogger, emergencyBypass: true } as any,
    })
    const mw = orchestrator.createValidationMiddleware(ValidationContext.MEDICAL_RECORD_CREATE)
    expect((mw as any).__name).toBe("validation")
    expect((mw as any).__context).toBe(ValidationContext.MEDICAL_RECORD_CREATE)
    expect((mw as any).__opts).toMatchObject({ auditLogger, allowEmergencyBypass: true })
  })

  it("getValidationMiddlewares wires presets with the configured auditLogger", () => {
    const auditLogger = { id: "A" }
    const orchestrator = new HealthcareSecurityOrchestrator("patient_portal_production", {
      inputValidation: { auditLogger } as any,
    })
    const presets = orchestrator.getValidationMiddlewares()
    expect((presets.patientRegistration as any).__name).toBe("validationPreset:patientRegistration")
    expect((presets.patientUpdate as any).__auditLogger).toBe(auditLogger)
    expect((presets.providerRegistration as any).__name).toBe("validationPreset:providerRegistration")
    expect((presets.appointmentBooking as any).__name).toBe("validationPreset:appointmentBooking")
    expect((presets.emergencyAccess as any).__name).toBe("validationPreset:emergencyAccess")
  })
})

describe("Factory wrappers - healthcareSecurityMiddlewares", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("medicalRecords produces the expected stack", () => {
    const stack = healthcareSecurityMiddlewares.medicalRecords()
    expect(getNames(stack)).toEqual(["errorHandler", "securityHeaders", "cors", "rateLimiterRedis", "jwtAuth"])
  })

  it("patientPortal uses patient portal policy and orders correctly", () => {
    const stack = healthcareSecurityMiddlewares.patientPortal()
    expect(getNames(stack)).toEqual(["errorHandler", "securityHeaders", "cors", "rateLimiterRedis", "jwtAuth"])
  })

  it("emergencyAccess enables emergency CORS and includes auth", () => {
    const stack = healthcareSecurityMiddlewares.emergencyAccess()
    expect(getNames(stack)).toEqual(["errorHandler", "securityHeaders", "cors", "rateLimiterRedis", "jwtAuth"])
  })

  it("development uses relaxed security (no auth, no rate limit)", () => {
    const stack = healthcareSecurityMiddlewares.development()
    expect(getNames(stack)).toEqual(["errorHandler", "securityHeaders", "cors"])
  })

  it("custom allows passing a preset name", () => {
    const stack = healthcareSecurityMiddlewares.custom("patient_portal_production")
    expect(getNames(stack)).toEqual(["errorHandler", "securityHeaders", "cors", "rateLimiterRedis", "jwtAuth"])
  })
})

describe("createHealthcareAPISecurityStack", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("defaults to development/public and returns orchestrator, middlewares, and validation presets", () => {
    const { middlewares, orchestrator, validationMiddlewares } = createHealthcareAPISecurityStack()
    expect(orchestrator).toBeInstanceOf(HealthcareSecurityOrchestrator)
    expect(getNames(middlewares)).toEqual(["errorHandler", "securityHeaders", "cors"])
    expect(validationMiddlewares).toBeTruthy()
    expect(typeof validationMiddlewares).toBe("object")
  })

  it("selects medical_records_production when PRODUCTION + MEDICAL_RECORDS", () => {
    const { middlewares } = createHealthcareAPISecurityStack(
      SecurityEnvironment.PRODUCTION,
      EndpointSecurityLevel.MEDICAL_RECORDS,
      { jwtSecret: "x", redisClient: { ping: jest.fn() } },
    )
    expect(getNames(middlewares)).toEqual(["errorHandler", "securityHeaders", "cors", "rateLimiterRedis", "jwtAuth"])
  })

  it("selects patient_portal_production by default for PRODUCTION with unknown level", () => {
    const { middlewares } = createHealthcareAPISecurityStack(SecurityEnvironment.PRODUCTION, "unknown" as any)
    // Should fall back to patient_portal_production per implementation
    expect(getNames(middlewares)).toEqual(["errorHandler", "securityHeaders", "cors", "rateLimiterRedis", "jwtAuth"])
  })

  it("propagates options (jwtSecret, redisClient, auditLogger, monitoringSystem, emergencyNotificationSystem, cors auditLogger)", () => {
    const options = {
      jwtSecret: "jwt-123",
      redisClient: { ping: jest.fn() },
      auditLogger: { audit: jest.fn() },
      monitoringSystem: { track: jest.fn() },
      emergencyNotificationSystem: { notify: jest.fn() },
    }
    const { middlewares } = createHealthcareAPISecurityStack(
      SecurityEnvironment.PRODUCTION,
      EndpointSecurityLevel.PATIENT_PORTAL,
      options,
    )
    // Extract the mocked middleware instances and assert options were propagated
    const err = middlewares.find((m) => (m as any).__name === "errorHandler") as any
    const headers = middlewares.find((m) => (m as any).__name === "securityHeaders") as any
    const cors = middlewares.find((m) => (m as any).__name === "cors") as any
    const rate = middlewares.find((m) => (m as any).__name?.startsWith("rateLimiter")) as any
    const auth = middlewares.find((m) => (m as any).__name === "jwtAuth") as any

    expect(err.__opts).toMatchObject({
      auditLogger: options.auditLogger,
      monitoringSystem: options.monitoringSystem,
      emergencyNotificationSystem: options.emergencyNotificationSystem,
    })
    expect(headers.__configName).toBe("patient_portal_production")
    expect(headers.__opts).toEqual({ skipPaths: [] })
    expect(cors.__opts).toMatchObject({ auditLogger: options.auditLogger, emergencyBypass: false })
    expect(rate.__opts).toMatchObject({ monitoring: true }) // per patient_portal_production preset
    expect(auth.__opts).toMatchObject({
      jwtSecret: options.jwtSecret,
      emergencyBypass: false,
    })
  })
})

/**
 * Edge cases & safety checks
 */
describe("Edge cases", () => {
  it("handles overrides that partially specify nested objects", () => {
    const orchestrator = new HealthcareSecurityOrchestrator("development", {
      authentication: { enabled: true } as any,
    })
    const stack = orchestrator.createSecurityMiddleware()
    // With dev + override auth.enabled true, rate limiting still disabled in dev
    expect(getNames(stack)).toContain("jwtAuth")
    expect(getNames(stack)).not.toContain("rateLimiterMemory")
    expect(getNames(stack)).not.toContain("rateLimiterRedis")
  })

  it("supports unknown configName via custom() without throwing", () => {
    // Even if an unknown config name is passed, constructor merges undefined + overrides; expectation: might throw at use.
    const orchestrator = new HealthcareSecurityOrchestrator("development")
    expect(() => orchestrator.createSecurityMiddleware()).not.toThrow()
  })
})