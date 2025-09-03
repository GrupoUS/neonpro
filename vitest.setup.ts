import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import http from "http";
import https from "https";
import React from "react";

// Make React available globally
global.React = React;

// Make jest globals available for compatibility
global.jest = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  mock: vi.mock,
  unmock: vi.unmock,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
};

/**
 * ⚡ NeonPro Optimized Vitest Setup
 *
 * ✅ CONSOLIDATED SETUP:
 * - Combines functionality from vitest.setup.ts and vitest.setup.simple.ts
 * - Optimized mocks for healthcare AI services
 * - Clean environment variables
 * - Performance focused approach
 */

// 📝 Console mocking for clean test output
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// 🌍 Environment variables
process.env = {
  ...process.env,
  NODE_ENV: "test",
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_ANON_KEY: "test-key",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  JWT_SECRET: "test-secret",
};

// 🔒 Crypto mock
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "test-uuid",
    getRandomValues: (arr: Uint8Array) => arr,
  },
});

// 🌐 Enhanced fetch mock with healthcare AI responses
const mockFetch = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    // Mock AI Services endpoints
    if (url.includes("/api/ai/universal-chat/session")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            session_id: "test-session-123",
            user_id: "test-user-456",
            created_at: "2024-01-01T00:00:00Z",
            status: "active",
            compliance_status: {
              lgpd_compliant: true,
              anvisa_compliant: true,
              cfm_compliant: true,
            },
          }),
      } as Response);
    }

    if (url.includes("/api/ai/universal-chat/message")) {
      const requestBody = init?.body ? JSON.parse(init.body as string) : {};
      const message = requestBody.message?.toLowerCase() || "";
      const isEmergency = message.includes("emergência") || message.includes("emergency");
      const isHealthcare = message.includes("diabete") || message.includes("pressão");

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            message_id: "test-message-789",
            response: isHealthcare
              ? "Healthcare AI response for testing"
              : "General AI response",
            emergency_detected: isEmergency,
            context_maintained: true,
            audit_logged: true,
          }),
      } as Response);
    }

    if (url.includes("/api/ai/compliance")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            compliance_id: "test-compliance-456",
            lgpd_compliant: true,
            compliance_status: {
              lgpd_compliant: true,
              anvisa_compliant: true,
              cfm_compliant: true,
            },
            violations: [],
          }),
      } as Response);
    }

    // Default response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    } as Response);
  },
);

global.fetch = mockFetch;

// Node http/https request mocks to prevent real network calls to localhost:3000
const originalHttpRequest = http.request;
const originalHttpGet = http.get;
const originalHttpsRequest = https.request;
const originalHttpsGet = https.get;

function createMockResponse(body: any = {}, status = 200) {
  // Create a minimal IncomingMessage-like object
  const { PassThrough } = require("stream");
  const res = new PassThrough();
  // emit headers/status after next tick
  process.nextTick(() => {
    res.statusCode = status;
    res.headers = { "content-type": "application/json" };
    res.emit("data", Buffer.from(JSON.stringify(body)));
    res.emit("end");
  });
  return res;
}

function shouldMockHost(options: any) {
  try {
    // Handle string URL inputs
    if (typeof options === "string") {
      const u = new URL(options);
      return u.hostname === "127.0.0.1" || u.hostname === "localhost" || u.port === "3000";
    }
    // Handle URL object inputs
    if (typeof URL !== "undefined" && options instanceof URL) {
      return options.hostname === "127.0.0.1" || options.hostname === "localhost"
        || options.port === "3000";
    }
    // Handle RequestOptions-like objects
    const hostname = (options && (options.hostname || options.host)) || options?.host?.hostname
      || "";
    const port = (options && (options.port || options?.host?.port)) || "";
    const host = `${hostname}`;
    const str = String(options || "");
    // If no explicit host fields, inspect the string representation
    if (!host) {
      return str.includes("127.0.0.1") || str.includes("localhost") || str.includes(":3000");
    }
    return host === "127.0.0.1" || host === "localhost" || String(port) === "3000"
      || str.includes(":3000");
  } catch {
    const s = String(options || "");
    return s.includes("127.0.0.1") || s.includes("localhost") || s.includes(":3000");
  }
}

http.request = function(...args: any[]) {
  try {
    const cb = args.find((a) => typeof a === "function");
    const candidates = args.slice(0, 2); // url, options
    const match = candidates.some((c) => shouldMockHost(c));
    if (match) {
      const { PassThrough } = require("stream");
      const req = new PassThrough();
      (req as any).write = () => {};
      (req as any).end = () => {
        const res = createMockResponse({});
        if (cb) cb(res);
        (req as any).emit("response", res);
      };
      (req as any).on = () => req;
      return req as any;
    }
  } catch (e) {
    // fallthrough to original
  }
  return originalHttpRequest.apply(this, args as any);
} as any;

http.get = function(options: any, callback?: any) {
  const req = (http.request as any)(options, callback);
  req.end();
  return req;
} as any;

https.request = function(...args: any[]) {
  try {
    const cb = args.find((a) => typeof a === "function");
    const candidates = args.slice(0, 2); // url, options
    const match = candidates.some((c) => shouldMockHost(c));
    if (match) {
      const { PassThrough } = require("stream");
      const req = new PassThrough();
      (req as any).write = () => {};
      (req as any).end = () => {
        const res = createMockResponse({});
        if (cb) cb(res);
        (req as any).emit("response", res);
      };
      (req as any).on = () => req;
      return req as any;
    }
  } catch (e) {
    // fallthrough
  }
  return originalHttpsRequest.apply(this, args as any);
} as any;

https.get = function(options: any, callback?: any) {
  const req = (https.request as any)(options, callback);
  req.end();
  return req;
} as any;

// Ensure modules importing different core specifiers see the mocked APIs
vi.mock("http", () => ({ ...http, default: http }));
vi.mock("https", () => ({ ...https, default: https }));
vi.mock("node:http", () => ({ ...http, default: http }));
vi.mock("node:https", () => ({ ...https, default: https }));

// 💾 Storage mocks
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => null),
      removeItem: vi.fn(() => null),
      clear: vi.fn(() => null),
    },
    writable: true,
  });

  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => null),
      removeItem: vi.fn(() => null),
      clear: vi.fn(() => null),
    },
    writable: true,
  });

  Object.defineProperty(window, "location", {
    value: {
      href: "http://localhost:3000",
      origin: "http://localhost:3000",
      pathname: "/",
      search: "",
      hash: "",
    },
    writable: true,
  });
}

// 🗄️ Supabase mocks
const createChainableMock = (table?: string, operation?: string) => {
  const mockData = {
    "ai_sessions": [
      { id: "test-session-1", user_id: "test-user", created_at: new Date().toISOString() },
    ],
    "ai_messages": [
      {
        id: "test-message-1",
        session_id: "test-session-1",
        content: "Test message",
        created_at: new Date().toISOString(),
      },
    ],
    "compliance_reports": [
      { id: "test-report-1", lgpd_compliant: true, created_at: new Date().toISOString() },
    ],
  };

  return {
    select: vi.fn(() => createChainableMock(table, "select")),
    insert: vi.fn(() => createChainableMock(table, "insert")),
    update: vi.fn(() => createChainableMock(table, "update")),
    delete: vi.fn(() => createChainableMock(table, "delete")),
    eq: vi.fn(() => createChainableMock(table, operation)),
    in: vi.fn(() => createChainableMock(table, operation)),
    gte: vi.fn(() => createChainableMock(table, operation)),
    lte: vi.fn(() => createChainableMock(table, operation)),
    order: vi.fn(() => createChainableMock(table, operation)),
    limit: vi.fn(() => createChainableMock(table, operation)),
    then: vi.fn((resolve) => {
      const data = table && mockData[table] ? mockData[table] : [];
      return resolve({ data, error: null });
    }),
    catch: vi.fn(() => Promise.resolve({ data: [], error: null })),
  };
};

const mockSupabaseClient = {
  from: vi.fn((table) => createChainableMock(table)),
};

// Supabase module mocks
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: mockSupabaseClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => mockSupabaseClient),
}));
