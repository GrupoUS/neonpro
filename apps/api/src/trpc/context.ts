/**
 * tRPC Context Configuration
 * Enhanced context with Prisma + Supabase integration for healthcare compliance
 */

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";

// Initialize Prisma client for database operations
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Initialize Supabase client for real-time features
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || "",
);

/**
 * Creates context for tRPC procedures
 * Includes Prisma client, Supabase client, and request metadata for audit logging
 */
export const createContext = (opts: CreateHTTPContextOptions) => {
  const { req, res } = opts;

  // Extract user information from request headers or JWT
  const userId = req.headers["x-user-id"] as string;
  const clinicId = req.headers["x-clinic-id"] as string;
  const requestId =
    (req.headers["x-request-id"] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Collect audit metadata for LGPD compliance
  const auditMeta = {
    ipAddress:
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
    sessionId: req.headers["x-session-id"] as string,
    timestamp: new Date(),
  };

  return {
    prisma,
    supabase,
    req,
    res,
    user: userId ? { id: userId } : null,
    userId,
    clinicId,
    requestId,
    auditMeta,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
