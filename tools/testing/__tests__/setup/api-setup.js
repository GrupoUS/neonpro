"use strict";
// Jest setup file for API testing with proper mocking structure
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
// Basic Jest configuration
require("@testing-library/jest-dom");
// Mock Date constructor for consistent timestamps
var originalDate = Date;
global.Date = jest.fn(function () {
  return new originalDate("2025-01-24T10:00:00.000Z");
});
global.Date.now = jest.fn(function () {
  return new originalDate("2025-01-24T10:00:00.000Z").getTime();
});
global.Date.UTC = originalDate.UTC;
global.Date.parse = originalDate.parse;
// Mock console to suppress logs during tests
global.console = __assign(__assign({}, console), {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
});
// Mock crypto for security-related operations
Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: jest.fn(function () {
      return new Uint8Array(32);
    }),
    randomUUID: jest.fn(function () {
      return "12345678-1234-5678-9012-123456789012";
    }),
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      digest: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
    },
  },
});
// Mock URL constructor
global.URL = jest.fn().mockImplementation(function (url) {
  return {
    href: url,
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
    toString: function () {
      return url;
    },
  };
});
// Mock URLSearchParams
global.URLSearchParams = jest.fn().mockImplementation(function () {
  return {
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    append: jest.fn(),
    toString: jest.fn().mockReturnValue(""),
    entries: jest.fn().mockReturnValue([]),
    forEach: jest.fn(),
    keys: jest.fn().mockReturnValue([]),
    values: jest.fn().mockReturnValue([]),
  };
});
// Mock Request and Response for Next.js API routes
global.Request = jest.fn().mockImplementation(function (url, options) {
  if (options === void 0) {
    options = {};
  }
  return {
    url: url || "http://localhost:3000",
    method: options.method || "GET",
    headers: new Map(Object.entries(options.headers || {})),
    body: options.body || null,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(""),
    formData: jest.fn().mockResolvedValue(new FormData()),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: jest.fn().mockResolvedValue(new Blob()),
    clone: jest.fn(),
  };
});
global.Response = jest.fn().mockImplementation(function (body, options) {
  if (options === void 0) {
    options = {};
  }
  return {
    status: options.status || 200,
    statusText: options.statusText || "OK",
    headers: new Map(Object.entries(options.headers || {})),
    body: body || null,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(""),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: jest.fn().mockResolvedValue(new Blob()),
    clone: jest.fn(),
    ok: (options.status || 200) >= 200 && (options.status || 200) < 300,
  };
});
// Mock environment variables
process.env = __assign(__assign({}, process.env), {
  NODE_ENV: "test",
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  NEXTAUTH_SECRET: "test-secret",
  NEXTAUTH_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_PUBLISHABLE_KEY: "pk_test_123",
});
// Mock Next.js navigation
jest.mock("next/navigation", function () {
  return {
    useRouter: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      pathname: "/",
      searchParams: new URLSearchParams(),
      query: {},
    }),
    usePathname: jest.fn().mockReturnValue("/"),
    useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
    redirect: jest.fn(),
    notFound: jest.fn(),
  };
});
// Mock Next.js server components
var MockNextResponse = /** @class */ (function () {
  function MockNextResponse(body, options) {
    if (options === void 0) {
      options = {};
    }
    this.json = jest.fn().mockResolvedValue(this.body);
    this.text = jest
      .fn()
      .mockResolvedValue(typeof this.body === "string" ? this.body : JSON.stringify(this.body));
    this.clone = jest.fn();
    this.status = options.status || 200;
    this.statusText = options.statusText || "OK";
    this.headers = new Map(Object.entries(options.headers || {}));
    this.body = body;
    this.ok = this.status >= 200 && this.status < 300;
  }
  MockNextResponse.json = function (data, options) {
    if (options === void 0) {
      options = {};
    }
    return new MockNextResponse(data, options);
  };
  MockNextResponse.redirect = function (url, status) {
    if (status === void 0) {
      status = 302;
    }
    return new MockNextResponse(null, { status: status, headers: { location: url } });
  };
  MockNextResponse.rewrite = function (url) {
    return new MockNextResponse(null, { status: 200 });
  };
  MockNextResponse.next = function () {
    return new MockNextResponse(null, { status: 200 });
  };
  return MockNextResponse;
})();
jest.mock("next/server", function () {
  return {
    NextRequest: jest.fn().mockImplementation(function (url, options) {
      if (options === void 0) {
        options = {};
      }
      return {
        url: url || "http://localhost:3000",
        method: options.method || "GET",
        headers: {
          get: jest.fn().mockImplementation(function (name) {
            var mockHeaders = {
              authorization: "Bearer mock-token",
              "user-agent": "Mozilla/5.0 (Test Browser)",
              "x-forwarded-for": "192.168.1.100",
              "x-real-ip": "192.168.1.100",
              host: "localhost:3000",
              accept: "text/html,application/xhtml+xml",
              "content-type": "application/json",
            };
            return mockHeaders[name.toLowerCase()] || null;
          }),
          has: jest.fn().mockReturnValue(true),
          entries: jest.fn().mockReturnValue([]),
          forEach: jest.fn(),
          keys: jest.fn().mockReturnValue([]),
          values: jest.fn().mockReturnValue([]),
        },
        body: options.body || null,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(""),
        formData: jest.fn().mockResolvedValue(new FormData()),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
        blob: jest.fn().mockResolvedValue(new Blob()),
        clone: jest.fn(),
        nextUrl: {
          pathname: "/",
          search: "",
          searchParams: new URLSearchParams(),
        },
        geo: {},
        ip: "192.168.1.100",
        cookies: {
          get: jest.fn().mockReturnValue({ name: "test-cookie", value: "test-value" }),
          set: jest.fn(),
          delete: jest.fn(),
          has: jest.fn().mockReturnValue(true),
          getAll: jest.fn().mockReturnValue([]),
        },
      };
    }),
    NextResponse: MockNextResponse,
  };
});
// Mock Next.js headers
jest.mock("next/headers", function () {
  return {
    cookies: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        name: "test-cookie",
        value: "test-cookie-value",
      }),
      set: jest.fn(),
      delete: jest.fn(),
      has: jest.fn().mockReturnValue(true),
      getAll: jest.fn().mockReturnValue([]),
    }),
    headers: jest.fn().mockReturnValue({
      get: jest.fn().mockImplementation(function (name) {
        var mockHeaders = {
          "user-agent": "Mozilla/5.0 (Test Browser)",
          "x-forwarded-for": "192.168.1.100",
          "x-real-ip": "192.168.1.100",
          host: "localhost:3000",
          accept: "text/html,application/xhtml+xml",
        };
        return mockHeaders[name.toLowerCase()] || null;
      }),
      has: jest.fn().mockReturnValue(true),
      entries: jest.fn().mockReturnValue([]),
      forEach: jest.fn(),
      keys: jest.fn().mockReturnValue([]),
      values: jest.fn().mockReturnValue([]),
    }),
  };
});
// Mock Supabase client
jest.mock("@supabase/supabase-js", function () {
  return {
    createClient: jest.fn().mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              user: {
                id: "user-123",
                email: "test@example.com",
              },
              access_token: "mock-token",
              refresh_token: "mock-refresh-token",
            },
          },
          error: null,
        }),
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              email: "test@example.com",
            },
          },
          error: null,
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              email: "test@example.com",
            },
            session: {
              access_token: "mock-token",
            },
          },
          error: null,
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        containedBy: jest.fn().mockReturnThis(),
        rangeGt: jest.fn().mockReturnThis(),
        rangeGte: jest.fn().mockReturnThis(),
        rangeLt: jest.fn().mockReturnThis(),
        rangeLte: jest.fn().mockReturnThis(),
        rangeAdjacent: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        abortSignal: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: "Test",
          },
          error: null,
        }),
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: "Test",
          },
          error: null,
        }),
        csv: jest.fn().mockResolvedValue({
          data: "id,name\n1,Test",
          error: null,
        }),
        explain: jest.fn().mockResolvedValue({
          data: "Query plan",
          error: null,
        }),
        then: jest.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              name: "Test",
            },
          ],
          error: null,
        }),
      }),
      rpc: jest.fn().mockResolvedValue({
        data: {
          result: "success",
        },
        error: null,
      }),
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: {
              path: "test/file.png",
            },
            error: null,
          }),
          download: jest.fn().mockResolvedValue({
            data: new Blob(),
            error: null,
          }),
          remove: jest.fn().mockResolvedValue({
            data: true,
            error: null,
          }),
          list: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: {
              publicUrl: "https://example.com/file.png",
            },
          }),
        }),
      },
      realtime: {
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn().mockReturnThis(),
          unsubscribe: jest.fn().mockReturnThis(),
        }),
      },
    }),
  };
});
// Mock Supabase SSR
jest.mock("@supabase/ssr", function () {
  return {
    createServerClient: jest.fn().mockImplementation(function () {
      return {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                user: {
                  id: "user-123",
                  email: "test@example.com",
                },
                access_token: "mock-token",
                refresh_token: "mock-refresh-token",
              },
            },
            error: null,
          }),
          getUser: jest.fn().mockResolvedValue({
            data: {
              user: {
                id: "user-123",
                email: "test@example.com",
              },
            },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 1,
              name: "Test",
            },
            error: null,
          }),
          then: jest.fn().mockResolvedValue({
            data: [
              {
                id: 1,
                name: "Test",
              },
            ],
            error: null,
          }),
        }),
      };
    }),
    createBrowserClient: jest.fn().mockImplementation(function () {
      return {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                user: {
                  id: "user-123",
                  email: "test@example.com",
                },
                access_token: "mock-token",
                refresh_token: "mock-refresh-token",
              },
            },
            error: null,
          }),
        },
      };
    }),
  };
});
// Mock PerformanceTracker singleton
jest.mock("../../lib/auth/performance-tracker", function () {
  var mockInstance = {
    startTracking: jest.fn(),
    endTracking: jest.fn(),
    recordMetric: jest.fn(),
    getMetrics: jest.fn().mockReturnValue({}),
    reset: jest.fn(),
  };
  return {
    PerformanceTracker: {
      getInstance: jest.fn().mockReturnValue(mockInstance),
    },
  };
});
// Mock SessionManager singleton
jest.mock("../../lib/auth/session-manager", function () {
  var mockSessionManager = {
    validateSession: jest.fn().mockImplementation(function (token) {
      if (token === "invalid-token") {
        return Promise.resolve({
          isValid: false,
          error: "Invalid token",
        });
      }
      return Promise.resolve({
        isValid: true,
        session: {
          id: "session-123",
          userId: "user-123",
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        },
        user: {
          id: "user-123",
          email: "test@example.com",
        },
        securityFlags: {
          isTrustedDevice: true,
          requiresMFA: false,
          lastSecurityCheck: new Date().toISOString(),
        },
      });
    }),
    extendSession: jest.fn().mockImplementation(function (userId, extendMinutes) {
      if (userId === "invalid-user") {
        return Promise.resolve({
          success: false,
          error: "User not found",
        });
      }
      return Promise.resolve({
        success: true,
        newExpiresAt: new Date(Date.now() + (extendMinutes || 30) * 60000),
        sessionId: "session-123",
        metadata: {
          extensionCount: 1,
          originalExpiration: new Date(Date.now() + 3600000),
          extendedBy: extendMinutes || 30,
        },
      });
    }),
    cleanupExpiredSessions: jest.fn().mockResolvedValue({
      cleanedCount: 5,
      totalProcessed: 10,
    }),
    createSession: jest.fn().mockResolvedValue({
      success: true,
      sessionId: "session-123",
      expiresAt: new Date(Date.now() + 3600000),
    }),
    revokeSession: jest.fn().mockResolvedValue({
      success: true,
    }),
    logSecurityEvent: jest.fn().mockResolvedValue({
      success: true,
      eventId: "security-event-123",
      timestamp: new Date().toISOString(),
    }),
  };
  return {
    sessionManager: mockSessionManager,
  };
});
// Mock SecurityAuditFramework singleton
jest.mock("../../lib/auth/security-audit-framework", function () {
  var mockSecurityAuditFramework = {
    performAudit: jest.fn().mockImplementation(function (type) {
      if (type === "invalid-type") {
        return Promise.resolve({
          success: false,
          error: "Invalid audit type",
        });
      }
      return Promise.resolve({
        success: true,
        auditId: "audit-123",
        findings: [
          {
            type: "security",
            severity: "low",
            description: "Sample security finding",
          },
        ],
        riskScore: 3.5, // Ensure this is a number between 0-10
        riskLevel: "low",
      });
    }),
    detectThreat: jest.fn().mockResolvedValue({
      success: true,
      threatId: "threat-123",
      actionsTaken: ["logged", "blocked"],
      severity: "medium",
    }),
    validateCompliance: jest.fn().mockResolvedValue({
      success: true,
      standards: ["SOC2", "ISO27001"],
      violations: [],
      complianceScore: 95,
    }),
    logSecurityEvent: jest.fn().mockResolvedValue({
      success: true,
      eventId: "event-123",
    }),
    generateReport: jest.fn().mockImplementation(function () {
      return Promise.resolve({
        success: true,
        reportId: "report-123",
        data: {
          summary: "Security audit completed",
          findings: [],
          recommendations: [],
          riskScore: 3.5,
        },
      });
    }),
  };
  return {
    securityAuditFramework: mockSecurityAuditFramework,
  };
});
// Mock date-fns
jest.mock("date-fns", function () {
  return {
    format: jest.fn().mockReturnValue("2025-01-24"),
    addDays: jest.fn().mockReturnValue(new Date("2025-01-25T10:00:00.000Z")),
    addHours: jest.fn().mockReturnValue(new Date("2025-01-24T11:00:00.000Z")),
    addMinutes: jest.fn().mockReturnValue(new Date("2025-01-24T10:01:00.000Z")),
    subDays: jest.fn().mockReturnValue(new Date("2025-01-23T10:00:00.000Z")),
    isAfter: jest.fn().mockReturnValue(false),
    isBefore: jest.fn().mockReturnValue(true),
    isEqual: jest.fn().mockReturnValue(false),
    differenceInMinutes: jest.fn().mockReturnValue(60),
    differenceInHours: jest.fn().mockReturnValue(1),
    differenceInDays: jest.fn().mockReturnValue(1),
    parseISO: jest.fn().mockImplementation(function (dateString) {
      return new Date(dateString);
    }),
    isValid: jest.fn().mockReturnValue(true),
  };
});
// Mock Stripe
jest.mock("stripe", function () {
  return jest.fn().mockImplementation(function () {
    return {
      customers: {
        create: jest.fn().mockResolvedValue({
          id: "cus_123",
          email: "test@example.com",
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "cus_123",
          email: "test@example.com",
        }),
        update: jest.fn().mockResolvedValue({
          id: "cus_123",
          email: "test@example.com",
        }),
      },
      subscriptions: {
        create: jest.fn().mockResolvedValue({
          id: "sub_123",
          status: "active",
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "sub_123",
          status: "active",
        }),
        update: jest.fn().mockResolvedValue({
          id: "sub_123",
          status: "active",
        }),
        cancel: jest.fn().mockResolvedValue({
          id: "sub_123",
          status: "canceled",
        }),
      },
      invoices: {
        create: jest.fn().mockResolvedValue({
          id: "in_123",
          status: "draft",
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "in_123",
          status: "draft",
        }),
      },
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: "pi_123",
          client_secret: "pi_123_secret",
          status: "requires_payment_method",
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "pi_123",
          status: "succeeded",
        }),
      },
    };
  });
});
// Mock React hooks
jest.mock("react", function () {
  return __assign(__assign({}, jest.requireActual("react")), {
    useState: jest.fn(),
    useEffect: jest.fn(),
    useContext: jest.fn(),
    useReducer: jest.fn(),
    useCallback: jest.fn(),
    useMemo: jest.fn(),
    useRef: jest.fn(),
    useImperativeHandle: jest.fn(),
    useLayoutEffect: jest.fn(),
    useDebugValue: jest.fn(),
  });
});
