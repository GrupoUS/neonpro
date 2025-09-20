import type { Context, Next } from "hono";

// Minimal audit middleware: collects request metadata and logs to console
export function auditMiddleware(eventName: string) {
  return async (c: Context, next: Next) => {
    const startedAt = Date.now();
    await next();
    const durationMs = Date.now() - startedAt;

    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
      userId: c.get("userId") || c.req.header("x-user-id") || "anonymous",
      clinicId: c.get("clinicId") || c.req.header("x-clinic-id") || null,
      ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || null,
      userAgent: c.req.header("user-agent") || null,
    };

    console.log("AUDIT_EVENT", JSON.stringify(payload));
  };
}
