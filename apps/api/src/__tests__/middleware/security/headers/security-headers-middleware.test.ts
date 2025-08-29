/**
 * Tests for Security Headers Middleware (apps/api)
 *
 * Note on test framework:
 * - Uses Jest/Vitest-compatible globals: describe, it/test, expect, beforeEach, vi/jest for spies.
 * - Prefer Vitest (vi) if available; otherwise fall back to Jest's jest.fn.
 *
 * Scope:
 * - Focus on behavior in the implementation under test (source diff).
 * - Validate header application across predefined configurations and options.
 */

import { SecurityHeadersManager, createSecurityHeadersMiddleware, createCSPReportHandler } from "../../../../middleware/security/headers/security-headers-middleware";

// Try to get spy impl from Vitest or Jest
const spy = (global as any).vi?.fn ?? (global as any).jest?.fn ?? ((fn?: any) => {
  // very small fallback spy
  const f: any = (...args: any[]) => {
    f.calls.push(args);
    return fn?.(...args);
  };
  f.calls = [] as any[];
  f.mockImplementation = (impl: any) => { fn = impl; };
  f.mockResolvedValue = (val: any) => { f.mockImplementation(() => Promise.resolve(val)); };
  f.mockRejectedValue = (err: any) => { f.mockImplementation(() => Promise.reject(err)); };
  return f;
});

// Minimal Hono-like Context mock tailored for our middleware
type HeaderBag = Record<string, string>;

function createMockContext(init?: {
  url?: string;
  path?: string;
  headers?: Record<string, string | undefined>;
}) {
  const setHeaders: HeaderBag = {};
  const incoming = init?.headers ?? {};
  const req = {
    url: init?.url ?? "https://example.test/ping",
    path: init?.path ?? "/ping",
    header: (name: string) => {
      const key = Object.keys(incoming).find(k => k.toLowerCase() === name.toLowerCase());
      return key ? (incoming as any)[key] : undefined;
    },
    json: spy(async () => ({})), // only used in CSP report handler via c.req.json()
  };

  const c = {
    req,
    header: (name: string, value: string) => { setHeaders[name] = value; },
    json: (data: any, status?: number) => ({ data, status: status ?? 200, headers: setHeaders }),
    get headers() { return setHeaders; },
  } as any;

  return c;
}

describe("SecurityHeadersManager - applySecurityHeaders", () => {
  it("applies HSTS only for HTTPS and when enabled", () => {
    const manager = new SecurityHeadersManager("medical_records_production");

    // HTTPS request should set HSTS
    const cHttps = createMockContext({ url: "https://secure.example/records" });
    manager.applySecurityHeaders(cHttps);
    expect(cHttps.headers["Strict-Transport-Security"]).toContain("max-age=");
    expect(cHttps.headers["Strict-Transport-Security"]).toContain("includeSubDomains");
    expect(cHttps.headers["Strict-Transport-Security"]).toContain("preload");

    // HTTP request should NOT set HSTS
    const cHttp = createMockContext({ url: "http://insecure.example/records" });
    manager.applySecurityHeaders(cHttp);
    expect(cHttp.headers["Strict-Transport-Security"]).toBeUndefined();
  });

  it("assembles CSP header with directives and report-uri for production configs", () => {
    const manager = new SecurityHeadersManager("patient_portal_production");
    const c = createMockContext();
    manager.applySecurityHeaders(c);

    const hdr = c.headers["Content-Security-Policy"];
    expect(hdr).toBeDefined();
    expect(hdr).toContain("default-src 'self'");
    expect(hdr).toContain("script-src 'self'");
    expect(hdr).toContain("report-uri /api/v1/security/csp-report");
  });

  it("uses CSP report-only header in development config", () => {
    const manager = new SecurityHeadersManager("development");
    const c = createMockContext();
    manager.applySecurityHeaders(c);

    expect(c.headers["Content-Security-Policy-Report-Only"]).toBeDefined();
    expect(c.headers["Content-Security-Policy"]).toBeUndefined();
  });

  it("applies frame protection (DENY / SAMEORIGIN / ALLOW-FROM)", () => {
    // DENY in medical records
    const med = new SecurityHeadersManager("medical_records_production");
    const c1 = createMockContext();
    med.applySecurityHeaders(c1);
    expect(c1.headers["X-Frame-Options"]).toBe("DENY");

    // SAMEORIGIN in patient portal
    const pp = new SecurityHeadersManager("patient_portal_production");
    const c2 = createMockContext();
    pp.applySecurityHeaders(c2);
    expect(c2.headers["X-Frame-Options"]).toBe("SAMEORIGIN");

    // Simulate ALLOW-FROM by custom manager: reuse development base with custom frameProtection
    const custom = new (SecurityHeadersManager as any)().constructor("development") as SecurityHeadersManager;
    // @ts-expect-error - test-only override
    (custom as any).config.frameProtection = { enabled: true, policy: "ALLOW-FROM", allowFrom: ["https://partner.example"] };
    const c3 = createMockContext();
    // @ts-expect-error - private method exercised via public applySecurityHeaders
    custom.applySecurityHeaders(c3);
    expect(c3.headers["X-Frame-Options"]).toBe("ALLOW-FROM https://partner.example");
  });

  it("applies XSS protection with mode=block when configured", () => {
    const manager = new SecurityHeadersManager("patient_portal_production");
    const c = createMockContext();
    manager.applySecurityHeaders(c);

    expect(c.headers["X-XSS-Protection"]).toBe("1; mode=block");
  });

  it("sets X-Content-Type-Options nosniff when enabled", () => {
    const manager = new SecurityHeadersManager("patient_portal_production");
    const c = createMockContext();
    manager.applySecurityHeaders(c);

    expect(c.headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("sets Referrer-Policy as per configuration", () => {
    const manager = new SecurityHeadersManager("medical_records_production");
    const c = createMockContext();
    manager.applySecurityHeaders(c);

    expect(c.headers["Referrer-Policy"]).toBe("no-referrer");
  });

  it("formats Permissions-Policy correctly when enabled", () => {
    const manager = new SecurityHeadersManager("patient_portal_production");
    const c = createMockContext();
    manager.applySecurityHeaders(c);

    const pp = c.headers["Permissions-Policy"];
    expect(pp).toBeDefined();
    expect(pp).toContain("camera=('self')");
    expect(pp).toContain("microphone=('self')");
  });

  it("applies LGPD headers when enabled (privacy policy and controller info)", () => {
    const manager = new SecurityHeadersManager("patient_portal_production");
    const c = createMockContext();
    manager.applySecurityHeaders(c);

    expect(c.headers["X-LGPD-Compliant"]).toBe("true");
    expect(c.headers["X-Privacy-Policy"]).toContain("https://neonpro.health/privacy");
    expect(c.headers["X-Data-Controller"]).toContain("NeonPro Healthcare Platform");
    expect(c.headers["X-Data-Processing"]).toBe("healthcare-operations");
    expect(c.headers["X-Data-Retention"]).toBe("as-per-medical-regulations");
  });

  it("adds emergency access headers only when request includes X-Emergency-Access and config enabled", () => {
    // Without emergency header - should not add
    const manager1 = new SecurityHeadersManager("emergency_access_production");
    const c1 = createMockContext({ headers: {} });
    manager1.applySecurityHeaders(c1);
    expect(c1.headers["X-Emergency-Access-Granted"]).toBeUndefined();

    // With emergency header - should add
    const manager2 = new SecurityHeadersManager("emergency_access_production");
    const c2 = createMockContext({ headers: { "X-Emergency-Access": "true" } });
    manager2.applySecurityHeaders(c2);
    expect(c2.headers["X-Emergency-Access-Granted"]).toBe("true");
    expect(c2.headers["X-Emergency-Audit-Required"]).toBe("true");
    expect(c2.headers["X-Emergency-Justification-Required"]).toBe("true");
  });

  it("adds additional security headers and cache-control for medical records", () => {
    const manager = new SecurityHeadersManager("medical_records_production");
    const c = createMockContext();
    manager.applySecurityHeaders(c);

    expect(c.headers["X-Powered-By"]).toBe("NeonPro Healthcare Platform");
    expect(c.headers["X-Healthcare-Compliance"]).toBe("ANVISA,CFM,LGPD");
    expect(c.headers["X-Security-Level"]).toBe("high_security");

    expect(c.headers["Cache-Control"]).toContain("no-store");
    expect(c.headers["Pragma"]).toBe("no-cache");
    expect(c.headers["Expires"]).toBe("0");

    expect(c.headers["Cross-Origin-Embedder-Policy"]).toBe("require-corp");
    expect(c.headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(c.headers["Cross-Origin-Resource-Policy"]).toBe("cross-origin");
  });
});

describe("createSecurityHeadersMiddleware", () => {
  it("skips applying headers for configured skipPaths", async () => {
    const mw = createSecurityHeadersMiddleware("patient_portal_production", {
      skipPaths: ["/healthz", "/public"],
    });

    const c = createMockContext({ path: "/healthz" });
    const next = spy(async () => { /* noop */ });

    await mw(c, next);
    // No key headers should be present if skipped
    expect(c.headers["Content-Security-Policy"]).toBeUndefined();
    expect(c.headers["X-Response-Time"]).toBeUndefined();
    expect(next).toBeCalled?.() ?? expect((next as any).calls.length).toBeGreaterThan(0);
  });

  it("applies headers and sets X-Response-Time after next()", async () => {
    const mw = createSecurityHeadersMiddleware("patient_portal_production");
    const c = createMockContext({ path: "/app" });
    const next = spy(async () => { /* simulate handler latency */ });

    await mw(c, next);

    expect(c.headers["Content-Security-Policy"]).toBeDefined();
    expect(c.headers["X-Response-Time"]).toMatch(/^\d+ms$/);
  });

  it("continues (fail-open) even if an error occurs during header application", async () => {
    // Create a middleware but inject a broken manager by temporarily overriding method
    const mw = createSecurityHeadersMiddleware("patient_portal_production");
    const c = createMockContext({ path: "/app" });

    // Monkey-patch header to throw on first call to simulate failure
    const originalHeader = c.header;
    let thrown = false;
    c.header = (name: string, value: string) => {
      if (!thrown) {
        thrown = true;
        throw new Error("Synthetic header set failure");
      }
      originalHeader(name, value);
    };

    const next = spy(async () => { /* should still be called */ });

    await mw(c, next);
    expect(next).toBeCalled?.() ?? expect((next as any).calls.length).toBeGreaterThan(0);
  });
});

describe("createCSPReportHandler", () => {
  it("returns success response for valid JSON report", async () => {
    const handler = createCSPReportHandler();
    const c = createMockContext();
    // Provide a JSON body
    (c.req.json as any).mockResolvedValue?.({ "csp-report": { "blocked-uri": "https://x" } });

    const res = await handler(c);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true, message: "CSP report received" });
  });

  it("returns error response when JSON parsing fails", async () => {
    const handler = createCSPReportHandler();
    const c = createMockContext();
    // Force JSON parse error
    (c.req.json as any).mockRejectedValue?.(new Error("bad json"));

    const res = await handler(c);
    expect(res.status).toBe(500);
    expect(res.data).toEqual({ success: false, error: "Failed to process CSP report" });
  });
});

/* Helpers to support toBeCalled in both Vitest and Jest */
declare global {
  // eslint-disable-next-line no-var
  var expect: any;
}
if (!(expect as any).extend && (global as any).vi?.expect?.extend) {
  // Running under Vitest's global-less mode; bind vitest expect
  (global as any).expect = (global as any).vi.expect;
}
// Add minimal matcher alias if needed
if (!(spy as any).mock) {
  // attach jest-like helpers
  (spy as any).mock = { calls: (spy as any).calls };
}
if (!(spy as any).toBeCalled) {
  (spy as any).toBeCalled = function () {
    const calls = (spy as any).calls ?? (spy as any).mock?.calls ?? [];
    expect(calls.length).toBeGreaterThan(0);
  };
}