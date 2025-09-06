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

// Memory safeguards
const MAX_TOKEN_STORE_SIZE = 10_000; // Maximum tokens in memory
const MAX_RATE_LIMIT_ENTRIES = 5000; // Maximum rate limit entries
const CLEANUP_THRESHOLD = 0.8; // Trigger cleanup when 80% full

// Deterministic cleanup tracking
let lastCleanupTime = 0;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory token store (use Redis in production)
const tokenStore = new Map<string, {
  token: string;
  expiresAt: number;
  ip: string;
  createdAt: number;
}>();

// O(1) IP token counting index for performance
const ipTokenCounts = new Map<string, number>();

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
 * Delete token and update IP count index
 */
function deleteToken(tokenId: string): void {
  const tokenData = tokenStore.get(tokenId);
  if (tokenData) {
    tokenStore.delete(tokenId);

    // Update IP token count index
    const currentCount = ipTokenCounts.get(tokenData.ip) || 0;
    if (currentCount <= 1) {
      ipTokenCounts.delete(tokenData.ip);
    } else {
      ipTokenCounts.set(tokenData.ip, currentCount - 1);
    }
  }
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
 * Clean up expired tokens and enforce memory limits
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();

  // Clean up expired tokens
  for (const [tokenId, tokenData] of tokenStore.entries()) {
    if (now > tokenData.expiresAt) {
      deleteToken(tokenId);
    }
  }

  // Enforce maximum token store size
  if (tokenStore.size > MAX_TOKEN_STORE_SIZE) {
    const tokensToDelete = tokenStore.size - Math.floor(MAX_TOKEN_STORE_SIZE * CLEANUP_THRESHOLD);
    const oldestTokens = Array.from(tokenStore.entries())
      .sort(([, a], [, b]) => a.createdAt - b.createdAt)
      .slice(0, tokensToDelete);

    for (const [tokenId] of oldestTokens) {
      deleteToken(tokenId);
    }
  }

  // Clean up rate limit records older than 1 hour and enforce size limit
  for (const [ip, record] of tokenRateLimit.entries()) {
    if (now > record.resetTime + (60 * 60 * 1000)) {
      tokenRateLimit.delete(ip);
    }
  }

  // Enforce maximum rate limit entries
  if (tokenRateLimit.size > MAX_RATE_LIMIT_ENTRIES) {
    const entriesToDelete = tokenRateLimit.size
      - Math.floor(MAX_RATE_LIMIT_ENTRIES * CLEANUP_THRESHOLD);
    const oldestEntries = Array.from(tokenRateLimit.entries())
      .sort(([, a], [, b]) => a.resetTime - b.resetTime)
      .slice(0, entriesToDelete);

    for (const [ip] of oldestEntries) {
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

    // Deterministic cleanup based on time interval
    const now = Date.now();
    if (now - lastCleanupTime >= CLEANUP_INTERVAL_MS) {
      lastCleanupTime = now;
      cleanupExpiredTokens();
    }

    // Check if IP has too many active tokens using O(1) lookup
    const ipTokenCount = ipTokenCounts.get(clientIP) || 0;

    if (ipTokenCount >= MAX_TOKENS_PER_IP) {
      return NextResponse.json(
        { error: "Too many active tokens for this IP" },
        { status: 429 },
      );
    }

    // Generate secure token
    const tokenId = secureCrypto.randomUUID();
    const tokenValue = secureCrypto.randomBytes(32).toString("base64url");
    const expiresAt = now + TOKEN_EXPIRY_MS;

    // Store token
    tokenStore.set(tokenId, {
      token: tokenValue,
      expiresAt,
      ip: clientIP,
      createdAt: now,
    });

    // Update IP token count index
    ipTokenCounts.set(clientIP, (ipTokenCounts.get(clientIP) || 0) + 1);

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
        deleteToken(tokenId); // Clean up expired token
        return { valid: false, error: "Token has expired" };
      }

      // Check IP match (optional, for added security)
      if (tokenData.ip !== clientIP) {
        return { valid: false, error: "Token IP mismatch" };
      }

      // Token is valid - remove it (one-time use)
      deleteToken(tokenId);
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
