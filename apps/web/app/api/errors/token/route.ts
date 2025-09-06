/**
 * CSRF Token Endpoint for Error Reporting
 *
 * Provides short-lived tokens for authenticated error reporting
 * Prevents spam and unauthorized error submissions
 */

import { secureCrypto } from "@neonpro/security/utils/secure-crypto";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Token configuration
const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_TOKENS_PER_IP = 10; // Prevent token flooding

// In-memory token store (use Redis in production)
const tokenStore = new Map<string, {
  token: string;
  expiresAt: number;
  ip: string;
  createdAt: number;
}>();

// Rate limiting per IP for token generation
const tokenRateLimit = new Map<string, {
  count: number;
  resetTime: number;
}>();

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const xClientIp = request.headers.get("x-client-ip");

  return cfConnectingIp || realIp || xClientIp || "unknown";
}

/**
 * Check and update rate limits for token generation
 */
function checkTokenRateLimit(ip: string): { allowed: boolean; remaining: number; } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const limit = 5; // 5 tokens per minute per IP

  const record = tokenRateLimit.get(ip);

  if (!record || now > record.resetTime) {
    tokenRateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();

  for (const [tokenId, tokenData] of tokenStore.entries()) {
    if (now > tokenData.expiresAt) {
      tokenStore.delete(tokenId);
    }
  }

  // Also cleanup rate limit records older than 1 hour
  for (const [ip, record] of tokenRateLimit.entries()) {
    if (now > record.resetTime + (60 * 60 * 1000)) {
      tokenRateLimit.delete(ip);
    }
  }
}

/**
 * GET /api/errors/token
 * Generate a short-lived CSRF token for error reporting
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIP = getClientIP(request);

    // Check rate limits
    const rateLimitResult = checkTokenRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many token requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "Retry-After": "60",
          },
        },
      );
    }

    // Clean up expired tokens periodically
    if (Math.random() < 0.1) { // 10% chance
      cleanupExpiredTokens();
    }

    // Check if IP has too many active tokens
    const ipTokenCount = Array.from(tokenStore.values())
      .filter(token => token.ip === clientIP && Date.now() < token.expiresAt).length;

    if (ipTokenCount >= MAX_TOKENS_PER_IP) {
      return NextResponse.json(
        { error: "Too many active tokens for this IP" },
        { status: 429 },
      );
    }

    // Generate secure token
    const tokenId = secureCrypto.randomUUID();
    const tokenValue = secureCrypto.randomBytes(32).toString("base64url");
    const now = Date.now();
    const expiresAt = now + TOKEN_EXPIRY_MS;

    // Store token
    tokenStore.set(tokenId, {
      token: tokenValue,
      expiresAt,
      ip: clientIP,
      createdAt: now,
    });

    return NextResponse.json({
      token: tokenValue,
      expiresAt,
      tokenId, // For debugging/tracking
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating CSRF token:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Validate CSRF token (utility function for other routes)
 */
export function validateCSRFToken(
  token: string,
  clientIP: string,
): { valid: boolean; error?: string; } {
  if (!token) {
    return { valid: false, error: "Token is required" };
  }

  const now = Date.now();

  // Find matching token
  for (const [tokenId, tokenData] of tokenStore.entries()) {
    if (tokenData.token === token) {
      // Check expiration
      if (now > tokenData.expiresAt) {
        tokenStore.delete(tokenId); // Clean up expired token
        return { valid: false, error: "Token has expired" };
      }

      // Check IP match (optional, for added security)
      if (tokenData.ip !== clientIP) {
        return { valid: false, error: "Token IP mismatch" };
      }

      // Token is valid - remove it (one-time use)
      tokenStore.delete(tokenId);
      return { valid: true };
    }
  }

  return { valid: false, error: "Invalid token" };
}

// Periodic cleanup (run every 10 minutes)
if (typeof globalThis !== "undefined") {
  const cleanupInterval = setInterval(cleanupExpiredTokens, 10 * 60 * 1000);

  // Clear interval on process exit
  if (typeof process !== "undefined") {
    process.on("SIGTERM", () => clearInterval(cleanupInterval));
    process.on("SIGINT", () => clearInterval(cleanupInterval));
  }
}
