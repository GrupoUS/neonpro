/* eslint-disable @typescript-eslint/no-explicit-<unknown> */

import {
  createHealthcareAPISecurityStack,
  EndpointSecurityLevel,
  healthcareSecurityMiddlewares,
  HealthcareSecurityOrchestrator,
  securityComponents,
  SecurityEnvironment,
  securityPresets,
} from "./index";

// Mock all component factories to capture calls/arguments and return identifiable middleware fns
// Jest-style mocking (compatible with Vitest's vi.mock if swapped)
jest.mock("./auth/jwt-validation", () => {
  const fn = jest.fn((opts: unknown) => {
    const mw = ((c: unknown, n: unknown) => n()) as unknown;
    (mw as unknown).__name = "auth";
    (mw as unknown).__args = opts;
    return mw;
  });
  return {
    createJWTAuthMiddleware: fn,
    HealthcareRole: {
      PATIENT: "patient",
      NURSE: "nurse",
      PHYSICIAN: "physician",
      EMERGENCY_PHYSICIAN: "emergency_physician",
      ADMIN: "admin",
    },
  };
});

jest.mock("./error-handling/healthcare-error-handler", () => {
  const fn = jest.fn((opts: unknown) => {
    const mw = ((c: unknown, n: unknown) => n()) as unknown;
    (mw as unknown).__name = "error";
    (mw as unknown).__args = opts;
    return mw;
  });
  return { createHealthcareErrorHandler: fn };
});

jest.mock("./headers/healthcare-cors-middleware", () => {
  const factory = jest.fn((policy: unknown, opts: unknown) => {
    const mw = ((c: unknown, n: unknown) => n()) as unknown;
    (mw as unknown).__name = "cors";
    (mw as unknown).__args = { policy, ...opts };
    return mw;
  });
  const presets = {
    strict: { name: "strict" },
    patient: { name: "patient" },
    emergency: { name: "emergency" },
    dev: { name: "dev" },
  };
  return {
    createHealthcareCORSMiddleware: factory,
    healthcareCORSMiddlewares: presets,
    HealthcareCORSPolicy: {
      STRICT: "STRICT",
      PATIENT_PORTAL: "PATIENT_PORTAL",
      EMERGENCY: "EMERGENCY",
      DEVELOPMENT: "DEVELOPMENT",
    },
  };
});

jest.mock("./headers/security-headers-middleware", () => {
  const factory = jest.fn((configName: string, opts: unknown) => {
    const mw = ((c: unknown, n: unknown) => n()) as unknown;
    (mw as unknown).__name = "headers";
    (mw as unknown).__args = { configName, ...opts };
    return mw;
  });
  const presets = { strict: {}, patient: {}, dev: {} };
  return {
    createSecurityHeadersMiddleware: factory,
    securityHeadersMiddlewares: presets,
  };
});

jest.mock("./rate-limiting/healthcare-rate-limiter", () => {
  const memory = jest.fn((_: unknown, opts: unknown) => {
    const mw = ((c: unknown, n: unknown) => n()) as unknown;
    (mw as unknown).__name = "rate-limit-memory";
    (mw as unknown).__args = { ...opts };
    return mw;
  });
  const redis = jest.fn((client: unknown, opts: unknown) => {
    const mw = ((c: unknown, n: unknown) => n()) as unknown;
    (mw as unknown).__name = "rate-limit-redis";
    (mw as unknown).__args = { client, ...opts };
    return mw;
  });
  return {
    createHealthcareRateLimiter: memory,
    createRedisHealthcareRateLimiter: redis,
  };
});

jest.mock("./validation/healthcare-validation-middleware", () => {
  const createValidation = jest.fn((context: string, opts: unknown) => {
    const mw = ((c: unknown, n: unknown) => n()) as unknown;
    (mw as unknown).__name = `validation:${context}`;
    (mw as unknown).__args = { context, ...opts };
    return mw;
  });
  const presets = {
    patientRegistration: jest.fn((logger?: unknown) => {
      const mw = ((c: unknown, n: unknown) => n()) as unknown;
      (mw as unknown).__name = "validation:patientRegistration";
      (mw as unknown).__args = { auditLogger: logger };
      return mw;
    }),
    patientUpdate: jest.fn((logger?: unknown) => {
      const mw = ((c: unknown, n: unknown) => n()) as unknown;
      (mw as unknown).__name = "validation:patientUpdate";
      (mw as unknown).__args = { auditLogger: logger };
      return mw;
    }),
    providerRegistration: jest.fn((logger?: unknown) => {
      const mw = ((c: unknown, n: unknown) => n()) as unknown;
      (mw as unknown).__name = "validation:providerRegistration";
      (mw as unknown).__args = { auditLogger: logger };
      return mw;
    }),
    appointmentBooking: jest.fn((logger?: unknown) => {
      const mw = ((c: unknown, n: unknown) => n()) as unknown;
      (mw as unknown).__name = "validation:appointmentBooking";
      (mw as unknown).__args = { auditLogger: logger };
      return mw;
    }),
    emergencyAccess: jest.fn((logger?: unknown) => {
      const mw = ((c: unknown, n: unknown) => n()) as unknown;
      (mw as unknown).__name = "validation:emergencyAccess";
      (mw as unknown).__args = { auditLogger: logger };
      return mw;
    }),
  };
  return {
    createHealthcareValidationMiddleware: createValidation,
    validationMiddlewares: presets,
    ValidationContext: {
      MEDICAL_RECORD_CREATE: "MEDICAL_RECORD_CREATE",
      PATIENT_UPDATE: "PATIENT_UPDATE",
      PATIENT_REGISTRATION: "PATIENT_REGISTRATION",
      PROVIDER_REGISTRATION: "PROVIDER_REGISTRATION",
      APPOINTMENT_BOOKING: "APPOINTMENT_BOOKING",
      EMERGENCY_ACCESS: "EMERGENCY_ACCESS",
    },
  };
});

describe("HealthcareSecurityOrchestrator - createSecurityMiddleware ordering and inclusion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("includes error -> headers -> cors -> rateLimit -> auth in that order for production medical_records", () => {
    const orchestrator = new HealthcareSecurityOrchestrator("medical_records_production");
    const middlewares = orchestrator.createSecurityMiddleware();

    const names = middlewares.map((mw: unknown) => mw.__name);
    expect(names).toStrictEqual(["error", "headers", "cors", "rate-limit-redis", "auth"]);

    // Validate key options forwarded
    const authArgs = (middlewares.find((mw: unknown) => mw.__name === "auth") as unknown).__args;
    expect(authArgs.requireHealthcareLicense).toBe(true);
    expect(Array.isArray(authArgs.allowedRoles)).toBe(true);

    const rateArgs =
      (middlewares.find((mw: unknown) => mw.__name === "rate-limit-redis") as unknown).__args;
    expect(rateArgs.monitoring).toBe(true);
    expect(rateArgs.alerting).toBe(true);

    const headerArgs = (middlewares.find((mw: unknown) => mw.__name === "headers") as unknown).__args;
    expect(headerArgs.configName).toBe("medical_records_production");
  });

  it("omits disabled components in development config", () => {
    const orchestrator = new HealthcareSecurityOrchestrator("development");
    const names = orchestrator.createSecurityMiddleware().map((mw: unknown) => mw.__name);
    // In development: error, headers, cors are enabled; rate limiting and auth disabled.
    expect(names).toStrictEqual(["error", "headers", "cors"]);
  });

  it("uses in-memory rate limiter when storage=memory or missing redisClient", () => {
    const orchestrator = new HealthcareSecurityOrchestrator("patient_portal_production", {
      rateLimiting: { enabled: true, storage: "memory" } as unknown,
    });
    const names = orchestrator.createSecurityMiddleware().map((mw: unknown) => mw.__name);
    expect(names).toContain("rate-limit-memory");
    expect(names).not.toContain("rate-limit-redis");
  });

  it("uses redis rate limiter only when storage=redis and client provided", () => {
    const redisClient = { ping: jest.fn() };
    const orchestrator = new HealthcareSecurityOrchestrator("patient_portal_production", {
      rateLimiting: { enabled: true, storage: "redis", redisClient } as unknown,
    });
    const names = orchestrator.createSecurityMiddleware().map((mw: unknown) => mw.__name);
    expect(names).toContain("rate-limit-redis");
  });

  it("passes through override options from constructor", () => {
    const orchestrator = new HealthcareSecurityOrchestrator("patient_portal_production", {
      authentication: {
        enabled: true,
        jwtSecret: "override",
        emergencyBypass: true,
        requireHealthcareLicense: false,
        allowedRoles: ["patient"],
      } as unknown,
      securityHeaders: {
        enabled: true,
        configName: "override-headers",
        skipPaths: ["/health"],
      } as unknown,
    });

    const mws = orchestrator.createSecurityMiddleware();
    const authArgs = (mws.find((mw: unknown) => mw.__name === "auth") as unknown).__args;
    expect(authArgs.jwtSecret).toBe("override");
    expect(authArgs.emergencyBypass).toBe(true);

    const headerArgs = (mws.find((mw: unknown) => mw.__name === "headers") as unknown).__args;
    expect(headerArgs.configName).toBe("override-headers");
    expect(headerArgs.skipPaths).toStrictEqual(["/health"]);
  });
});

describe("Validation middleware helpers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns no-op when validation disabled", async () => {
    const orchestrator = new HealthcareSecurityOrchestrator("development", {
      inputValidation: { enabled: false } as unknown,
    });

    const mw = orchestrator.createValidationMiddleware("PATIENT_REGISTRATION" as unknown);
    const next = jest.fn();
    await mw({} as unknown, next);
    expect(next).toHaveBeenCalled(); // behaves as pass-through
  });

  it("creates context-specific validation with auditLogger and emergencyBypass", () => {
    const auditLogger = { log: jest.fn() };
    const orchestrator = new HealthcareSecurityOrchestrator("development", {
      inputValidation: { enabled: true, emergencyBypass: true, auditLogger } as unknown,
    });

    const mw = orchestrator.createValidationMiddleware("PATIENT_UPDATE" as unknown) as unknown;
    expect(mw.__name).toBe("validation:PATIENT_UPDATE");
    expect(mw.__args.auditLogger).toBe(auditLogger);
    expect(mw.__args.allowEmergencyBypass).toBe(true);
  });

  it("getValidationMiddlewares injects auditLogger into presets", () => {
    const auditLogger = { id: "logger" };
    const orchestrator = new HealthcareSecurityOrchestrator("development", {
      inputValidation: { enabled: true, auditLogger } as unknown,
    });

    const presets = orchestrator.getValidationMiddlewares();
    const mws = Object.values(presets).map((f: unknown) => f);
    expect(mws).toHaveLength(5);

    const pr = presets.patientRegistration as unknown;
    const mw = pr as unknown;
    expect(mw.__name).toBe("validation:patientRegistration");
    expect(mw.__args.auditLogger).toBe(auditLogger);
  });
});

describe("Factory functions - healthcareSecurityMiddlewares", () => {
  it("medicalRecords returns configured stack", () => {
    const mws = healthcareSecurityMiddlewares.medicalRecords();
    const names = mws.map((mw: unknown) => mw.__name);
    expect(names[0]).toBe("error");
    expect(names).toContain("auth");
  });

  it("patientPortal returns configured stack", () => {
    const mws = healthcareSecurityMiddlewares.patientPortal();
    const names = mws.map((mw: unknown) => mw.__name);
    expect(names).toContain("auth");
  });

  it("emergencyAccess returns configured stack with redis rate limiter by default", () => {
    const mws = healthcareSecurityMiddlewares.emergencyAccess();
    const names = mws.map((mw: unknown) => mw.__name);
    // Storage is "redis" in preset, but client missing falls back to memory
    expect(names).toContain("rate-limit-memory");
  });

  it("development returns relaxed stack", () => {
    const names = healthcareSecurityMiddlewares.development().map((mw: unknown) => mw.__name);
    expect(names).toStrictEqual(["error", "headers", "cors"]);
  });

  it("custom allows arbitrary config name", () => {
    const spy = jest.spyOn(HealthcareSecurityOrchestrator.prototype, "createSecurityMiddleware");
    healthcareSecurityMiddlewares.custom(securityPresets.MEDICAL_RECORDS_PRODUCTION);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("createHealthcareAPISecurityStack", () => {
  it("selects correct config for PRODUCTION + MEDICAL_RECORDS", () => {
    const { middlewares } = createHealthcareAPISecurityStack(
      SecurityEnvironment.PRODUCTION,
      EndpointSecurityLevel.MEDICAL_RECORDS,
    );
    const names = middlewares.map((mw: unknown) => mw.__name);
    expect(names).toStrictEqual(["error", "headers", "cors", "rate-limit-memory", "auth"]);
  });

  it("selects patient_portal_production for PRODUCTION + PATIENT_PORTAL", () => {
    const { middlewares } = createHealthcareAPISecurityStack(
      SecurityEnvironment.PRODUCTION,
      EndpointSecurityLevel.PATIENT_PORTAL,
    );
    const names = middlewares.map((mw: unknown) => mw.__name);
    expect(names).toContain("auth");
  });

  it("defaults to patient_portal_production for other PRODUCTION levels", () => {
    const { middlewares } = createHealthcareAPISecurityStack(
      SecurityEnvironment.PRODUCTION,
      EndpointSecurityLevel.ADMINISTRATIVE, // not explicitly handled -> default
    );
    const names = middlewares.map((mw: unknown) => mw.__name);
    expect(names).toContain("auth");
  });

  it("injects optional systems via overrides (auditLogger/monitoring/emergencyNotification)", () => {
    const auditLogger = { audit: jest.fn() };
    const monitoringSystem = { track: jest.fn() };
    const emergencyNotificationSystem = { notify: jest.fn() };
    const { middlewares } = createHealthcareAPISecurityStack(
      SecurityEnvironment.PRODUCTION,
      EndpointSecurityLevel.PATIENT_PORTAL,
      { auditLogger, monitoringSystem, emergencyNotificationSystem },
    );
    const errorMw = middlewares.find((mw: unknown) => mw.__name === "error") as unknown;
    expect(errorMw.__args.auditLogger).toBe(auditLogger);
    expect(errorMw.__args.monitoringSystem).toBe(monitoringSystem);
    expect(errorMw.__args.emergencyNotificationSystem).toBe(emergencyNotificationSystem);
  });

  it("passes jwtSecret and redisClient to orchestrator via overrides", () => {
    const redisClient = { id: "redis" };
    const jwtSecret = "injected-secret";
    const { middlewares } = createHealthcareAPISecurityStack(
      SecurityEnvironment.PRODUCTION,
      EndpointSecurityLevel.PATIENT_PORTAL,
      { jwtSecret, redisClient },
    );
    const authArgs = (middlewares.find((mw: unknown) => (mw as unknown).__name === "auth") as unknown).__args;
    expect(authArgs.jwtSecret).toBe(jwtSecret);

    // Because redis client provided and storage preset is 'redis', rate limiter should prefer redis
    const names = middlewares.map((mw: unknown) => (mw as unknown).__name);
    expect(names).toContain("rate-limit-redis");
  });
});
