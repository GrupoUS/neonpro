import type { Context, Next } from "hono";

// Minimal consent gating and RLS helpers for integration tests
export function requireConsent() {
  return async (c: Context, next: Next) => {
    const consent = c.req.header("x-consent") || c.req.query("consent");
    if (consent !== "true") {
      return c.json({ error: "CONSENT_REQUIRED" }, 403);
    }
    return next();
  };
}

export function requireClinicScope() {
  return async (c: Context, next: Next) => {
    const userClinic = c.req.header("x-clinic-id");
    const targetClinic = c.req.param("clinicId") || c.req.query("clinicId");
    if (!userClinic || !targetClinic || userClinic !== targetClinic) {
      return c.json({ error: "RLS_SCOPE_VIOLATION" }, 403);
    }
    return next();
  };
}
