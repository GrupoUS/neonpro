/**
 * API Key Management Service
 *
 * Healthcare platform API key management with LGPD compliance
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 */

import crypto from 'crypto';
import { z } from 'zod';

// API Key Permissions Schema
export const ApiKeyPermissionsSchema = z.object({
  read: z.boolean().default(false),
  write: z.boolean().default(false),
  delete: z.boolean().default(false),
  admin: z.boolean().default(false),
  patient_data: z.boolean().default(false),
  financial_data: z.boolean().default(false),
});

export type ApiKeyPermissions = z.infer<typeof ApiKeyPermissionsSchema>;

// API Key Metadata Schema
export const ApiKeyMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  clinicId: z.string(),
  userId: z.string(),
  createdAt: z.date().default(() => new Date()),
  lastUsedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
  rateLimit: z
    .object({
      requestsPerMinute: z.number().default(60),
      requestsPerHour: z.number().default(1000),
      requestsPerDay: z.number().default(10000),
    })
    .optional(),
});

export type ApiKeyMetadata = z.infer<typeof ApiKeyMetadataSchema>;

// API Key Schema
export const ApiKeySchema = z.object({
  id: z.string(),
  key: z.string(),
  permissions: ApiKeyPermissionsSchema,
  metadata: ApiKeyMetadataSchema,
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

// In-memory storage for TDD (will be replaced with database)
const apiKeys = new Map<string, ApiKey>();

/**
 * Create a new API key
 */
export async function createApiKey(
  permissions: ApiKeyPermissions,
  metadata: Omit<ApiKeyMetadata, 'createdAt' | 'isActive'>,
): Promise<ApiKey> {
  const id = crypto.randomUUID();
  const key = generateSecureApiKey();

  const apiKey: ApiKey = {
    id,
    key,
    permissions,
    metadata: {
      ...metadata,
      createdAt: new Date(),
      isActive: true,
    },
  };

  apiKeys.set(key, apiKey);

  return apiKey;
}

/**
 * Validate an API key
 */
export async function validateApiKey(key: string): Promise<ApiKey | null> {
  const apiKey = apiKeys.get(key);

  if (!apiKey || !apiKey.metadata.isActive) {
    return null;
  }

  // Check expiration
  if (apiKey.metadata.expiresAt && apiKey.metadata.expiresAt < new Date()) {
    return null;
  }

  // Update last used timestamp
  apiKey.metadata.lastUsedAt = new Date();

  return apiKey;
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(key: string): Promise<boolean> {
  const apiKey = apiKeys.get(key);

  if (!apiKey) {
    return false;
  }

  apiKey.metadata.isActive = false;

  return true;
}

/**
 * Rotate an API key (create new, revoke old)
 */
export async function rotateApiKey(oldKey: string): Promise<ApiKey | null> {
  const oldApiKey = apiKeys.get(oldKey);

  if (!oldApiKey) {
    return null;
  }

  // Create new key with same permissions and metadata
  const newApiKey = await createApiKey(oldApiKey.permissions, {
    name: oldApiKey.metadata.name,
    description: oldApiKey.metadata.description,
    clinicId: oldApiKey.metadata.clinicId,
    userId: oldApiKey.metadata.userId,
    expiresAt: oldApiKey.metadata.expiresAt,
    rateLimit: oldApiKey.metadata.rateLimit,
  });

  // Revoke old key
  await revokeApiKey(oldKey);

  return newApiKey;
}

/**
 * Generate a secure API key
 */
function generateSecureApiKey(): string {
  const prefix = 'neonpro_';
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('base64url');

  return `${prefix}${key}`;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
}

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

/**
 * Apply rate limiting to API key
 */
export async function applyRateLimit(
  key: string,
  config?: RateLimitConfig,
): Promise<RateLimitResult> {
  // TDD placeholder - will implement proper rate limiting
  return {
    allowed: true,
    remaining: 999,
    resetTime: new Date(Date.now() + 60000), // 1 minute from now
  };
}

/**
 * Clear all API keys (for testing)
 */
export function clearApiKeys(): void {
  apiKeys.clear();
}
