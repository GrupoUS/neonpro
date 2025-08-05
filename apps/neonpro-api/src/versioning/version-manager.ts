/**
 * API Versioning and Deprecation Strategy
 * Healthcare-compliant versioning with backward compatibility
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { healthcareLogger } from "../plugins/logging";

// Version configuration schema
const VersionConfigSchema = z.object({
  current: z.string(),
  supported: z.array(z.string()),
  deprecated: z.array(
    z.object({
      version: z.string(),
      deprecatedAt: z.string(),
      sunsetAt: z.string(),
      reason: z.string(),
    }),
  ),
  default: z.string(),
});

type VersionConfig = z.infer<typeof VersionConfigSchema>;

// API version headers
export enum VersionHeader {
  API_VERSION = "x-api-version",
  ACCEPT_VERSION = "accept-version",
  DEPRECATION = "deprecation",
  SUNSET = "sunset",
  WARNING = "warning",
}

// Version strategies
export enum VersionStrategy {
  HEADER = "header",
  PATH = "path",
  QUERY = "query",
  ACCEPT_HEADER = "accept-header",
}

/**
 * Healthcare API Version Manager
 */
export class HealthcareVersionManager {
  private config: VersionConfig;
  private strategy: VersionStrategy;
  private deprecationWarnings: Map<string, number> = new Map();

  constructor(config: VersionConfig, strategy: VersionStrategy = VersionStrategy.HEADER) {
    this.config = VersionConfigSchema.parse(config);
    this.strategy = strategy;
  }

  /**
   * Extract version from request
   */
  extractVersion(request: FastifyRequest): string {
    let version: string | undefined;

    switch (this.strategy) {
      case VersionStrategy.HEADER:
        version = request.headers[VersionHeader.API_VERSION] as string;
        break;

      case VersionStrategy.PATH: {
        // Extract from path like /api/v1/patients
        const pathMatch = request.url.match(/\/api\/v(\d+(?:\.\d+)?)\//);
        version = pathMatch ? `v${pathMatch[1]}` : undefined;
        break;
      }

      case VersionStrategy.QUERY:
        version = (request.query as Record<string, unknown>)?.version as string;
        break;

      case VersionStrategy.ACCEPT_HEADER: {
        const acceptHeader = request.headers.accept;
        const acceptMatch = acceptHeader?.match(
          /application\/vnd\.neonpro\.v(\d+(?:\.\d+)?)\+json/,
        );
        version = acceptMatch ? `v${acceptMatch[1]}` : undefined;
        break;
      }
    }

    return version || this.config.default;
  }

  /**
   * Validate version support
   */
  validateVersion(version: string): {
    isSupported: boolean;
    isDeprecated: boolean;
    deprecationInfo?: { version: string; deprecatedAt: string; sunsetAt: string; reason: string };
  } {
    const isSupported = this.config.supported.includes(version);
    const deprecationInfo = this.config.deprecated.find((d) => d.version === version);
    const isDeprecated = !!deprecationInfo;

    return {
      isSupported,
      isDeprecated,
      deprecationInfo,
    };
  } /**
   * Add deprecation headers
   */
  addDeprecationHeaders(reply: FastifyReply, version: string): void {
    const deprecationInfo = this.config.deprecated.find((d) => d.version === version);

    if (deprecationInfo) {
      reply.header(VersionHeader.DEPRECATION, deprecationInfo.deprecatedAt);
      reply.header(VersionHeader.SUNSET, deprecationInfo.sunsetAt);
      reply.header(
        VersionHeader.WARNING,
        `299 neonpro-api "Version ${version} is deprecated. ${deprecationInfo.reason}"`,
      );
    }
  }

  /**
   * Log version usage for analytics
   */
  logVersionUsage(version: string, endpoint: string, tenantId?: string, userId?: string): void {
    const key = `${version}-${endpoint}`;
    const count = this.deprecationWarnings.get(key) || 0;
    this.deprecationWarnings.set(key, count + 1);

    healthcareLogger.log("info", `API version usage: ${version}`, {
      tenantId,
      userId,
      metadata: {
        version,
        endpoint,
        usageCount: count + 1,
        isDeprecated: this.validateVersion(version).isDeprecated,
      },
    });
  }

  /**
   * Get version usage statistics
   */
  getVersionStats(): { [version: string]: { [endpoint: string]: number } } {
    const stats: { [version: string]: { [endpoint: string]: number } } = {};

    for (const [key, count] of this.deprecationWarnings) {
      const [version, endpoint] = key.split("-", 2);
      if (!stats[version]) stats[version] = {};
      stats[version][endpoint] = count;
    }

    return stats;
  }

  getConfig() {
    return this.config;
  }
}

// Version configuration for NeonPro Healthcare API
export const NEONPRO_VERSION_CONFIG: VersionConfig = {
  current: "v3",
  default: "v3",
  supported: ["v2", "v3"],
  deprecated: [
    {
      version: "v1",
      deprecatedAt: "2024-01-01T00:00:00Z",
      sunsetAt: "2024-12-31T23:59:59Z",
      reason: "Replaced with enhanced LGPD compliance features in v2",
    },
    {
      version: "v2",
      deprecatedAt: "2024-06-01T00:00:00Z",
      sunsetAt: "2025-06-01T23:59:59Z",
      reason: "Enhanced with ANVISA compliance and advanced privacy controls in v3",
    },
  ],
};

// Fastify plugin for API versioning
export async function registerVersioning(
  fastify: FastifyInstance,
  options: {
    config?: VersionConfig;
    strategy?: VersionStrategy;
  } = {},
): Promise<void> {
  const config = options.config || NEONPRO_VERSION_CONFIG;
  const strategy = options.strategy || VersionStrategy.HEADER;

  const versionManager = new HealthcareVersionManager(config, strategy);

  // Add version manager to fastify instance
  fastify.decorate("versionManager", versionManager);

  // Version validation hook
  fastify.addHook("onRequest", async (request, reply) => {
    // Skip versioning for health checks and metrics
    if (
      request.url.startsWith("/health") ||
      request.url.startsWith("/metrics") ||
      request.url.startsWith("/docs")
    ) {
      return;
    }

    const version = versionManager.extractVersion(request);
    const validation = versionManager.validateVersion(version);

    if (!validation.isSupported) {
      return reply.status(400).send({
        error: {
          code: "UNSUPPORTED_API_VERSION",
          message: `API version ${version} is not supported`,
          supportedVersions: config.supported,
          current: config.current,
        },
      });
    }

    // Add version info to request
    type RequestWithVersion = FastifyRequest & {
      apiVersion?: string;
      versionInfo?: { isSupported: boolean; isDeprecated: boolean; deprecationInfo?: unknown };
    };
    (request as RequestWithVersion).apiVersion = version;
    (request as RequestWithVersion).versionInfo = validation;
  });

  // Add version headers to responses
  fastify.addHook("onSend", async (request, reply, payload) => {
    const version = (request as FastifyRequest & { apiVersion?: string }).apiVersion;
    if (version) {
      reply.header("x-api-version", version);
      reply.header("x-api-current-version", config.current);

      // Add deprecation headers if needed
      const validation = versionManager.validateVersion(version);
      if (validation.isDeprecated) {
        versionManager.addDeprecationHeaders(reply, version);
      }
    }

    return payload;
  });

  // Version stats endpoint
  fastify.get("/api/version/stats", async () => {
    return {
      config,
      usage: versionManager.getVersionStats(),
      timestamp: new Date().toISOString(),
    };
  });

  healthcareLogger.log("info", "API versioning system initialized", {
    metadata: {
      currentVersion: config.current,
      supportedVersions: config.supported,
      deprecatedVersions: config.deprecated.map((d) => d.version),
      strategy,
    },
  });
}
