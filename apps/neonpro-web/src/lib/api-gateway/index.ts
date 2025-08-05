/**
 * NeonPro - API Gateway Module
 * Complete API Gateway system with documentation, monitoring, and middleware
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

// Core Gateway
export { NeonProApiGateway } from "./gateway";

// Types and Interfaces
export * from "./types";

// Documentation System
export {
  OpenApiDocumentationGenerator,
  DocumentationMiddleware,
  DocumentationRouteBuilder,
} from "./documentation";

// Middleware System
export {
  MiddlewareManager,
  CorsMiddleware,
  RequestLoggingMiddleware,
  RateLimitingMiddleware,
  AuthenticationMiddleware,
  AuthorizationMiddleware,
  RequestValidationMiddleware,
  ResponseTransformationMiddleware,
} from "./middleware";

// Cache System
export {
  MemoryApiGatewayCache,
  RedisApiGatewayCache,
  SupabaseApiGatewayCache,
  ApiGatewayCacheFactory,
  CacheMiddleware,
} from "./cache";

// Monitoring System
export {
  ApiGatewayMetricsCollector,
  ApiGatewayHealthCheckManager,
  MonitoringMiddleware,
  ApiGatewayPerformanceMonitor,
} from "./monitoring";

/**
 * API Gateway Factory
 * Factory class for creating and configuring API Gateway instances
 */
export class ApiGatewayFactory {
  /**
   * Create a basic API Gateway instance
   */
  static createBasic(
    config: {
      port?: number;
      host?: string;
      cors?: boolean;
      rateLimit?: {
        windowMs: number;
        max: number;
      };
      logger?: any;
    } = {},
  ): NeonProApiGateway {
    const gateway = new NeonProApiGateway(
      {
        port: config.port || 3000,
        host: config.host || "localhost",
        cors: {
          enabled: config.cors !== false,
          origins: ["*"],
          methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
          headers: ["Content-Type", "Authorization", "X-API-Key"],
        },
        rateLimit: {
          enabled: !!config.rateLimit,
          windowMs: config.rateLimit?.windowMs || 60000,
          max: config.rateLimit?.max || 100,
        },
        monitoring: {
          enabled: true,
          metricsPath: "/metrics",
          healthPath: "/health",
        },
        documentation: {
          enabled: true,
          path: "/docs",
          title: "NeonPro API Gateway",
          version: "1.0.0",
        },
      },
      config.logger,
    );

    return gateway;
  }

  /**
   * Create a production-ready API Gateway instance
   */
  static createProduction(config: {
    port?: number;
    host?: string;
    redis?: any;
    supabase?: any;
    auth?: {
      jwtSecret: string;
      apiKeys: string[];
    };
    rateLimit?: {
      windowMs: number;
      max: number;
    };
    logger?: any;
  }): NeonProApiGateway {
    const gateway = new NeonProApiGateway(
      {
        port: config.port || 8080,
        host: config.host || "0.0.0.0",
        cors: {
          enabled: true,
          origins: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
          methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          headers: ["Content-Type", "Authorization", "X-API-Key"],
          credentials: true,
        },
        rateLimit: {
          enabled: true,
          windowMs: config.rateLimit?.windowMs || 60000,
          max: config.rateLimit?.max || 1000,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
        },
        authentication: {
          enabled: true,
          jwtSecret: config.auth?.jwtSecret || process.env.JWT_SECRET || "",
          apiKeys: config.auth?.apiKeys || [],
          excludePaths: ["/health", "/metrics", "/docs"],
        },
        authorization: {
          enabled: true,
          defaultRole: "user",
          roleHierarchy: {
            admin: ["user"],
            user: [],
          },
        },
        monitoring: {
          enabled: true,
          metricsPath: "/metrics",
          healthPath: "/health",
          collectSystemMetrics: true,
          alerting: {
            enabled: true,
            thresholds: {
              responseTime: 1000,
              errorRate: 5,
              memoryUsage: 80,
            },
          },
        },
        cache: {
          enabled: true,
          type: config.redis ? "redis" : config.supabase ? "supabase" : "memory",
          config: {
            client: config.redis || config.supabase,
            defaultTtl: 300000,
            maxSize: 1000,
          },
        },
        documentation: {
          enabled: true,
          path: "/docs",
          title: "NeonPro API Gateway",
          version: "1.0.0",
          description: "Production API Gateway for NeonPro platform",
          contact: {
            name: "NeonPro Support",
            email: "support@neonpro.com",
          },
          security: {
            apiKey: {
              type: "apiKey",
              in: "header",
              name: "X-API-Key",
            },
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        logging: {
          enabled: true,
          level: process.env.LOG_LEVEL || "info",
          format: "json",
          includeRequestBody: false,
          includeResponseBody: false,
        },
      },
      config.logger,
    );

    return gateway;
  }

  /**
   * Create a development API Gateway instance
   */
  static createDevelopment(config: { port?: number; logger?: any } = {}): NeonProApiGateway {
    const gateway = new NeonProApiGateway(
      {
        port: config.port || 3001,
        host: "localhost",
        cors: {
          enabled: true,
          origins: ["*"],
          methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
          headers: ["*"],
          credentials: true,
        },
        rateLimit: {
          enabled: false,
        },
        authentication: {
          enabled: false,
        },
        authorization: {
          enabled: false,
        },
        monitoring: {
          enabled: true,
          metricsPath: "/metrics",
          healthPath: "/health",
          collectSystemMetrics: true,
        },
        cache: {
          enabled: true,
          type: "memory",
          config: {
            maxSize: 100,
            defaultTtl: 60000,
          },
        },
        documentation: {
          enabled: true,
          path: "/docs",
          title: "NeonPro API Gateway - Development",
          version: "1.0.0-dev",
          description: "Development API Gateway for NeonPro platform",
        },
        logging: {
          enabled: true,
          level: "debug",
          format: "pretty",
          includeRequestBody: true,
          includeResponseBody: true,
        },
      },
      config.logger,
    );

    return gateway;
  }

  /**
   * Create a testing API Gateway instance
   */
  static createTesting(config: { port?: number; logger?: any } = {}): NeonProApiGateway {
    const gateway = new NeonProApiGateway(
      {
        port: config.port || 0, // Random port
        host: "localhost",
        cors: {
          enabled: true,
          origins: ["*"],
          methods: ["*"],
          headers: ["*"],
        },
        rateLimit: {
          enabled: false,
        },
        authentication: {
          enabled: false,
        },
        authorization: {
          enabled: false,
        },
        monitoring: {
          enabled: false,
        },
        cache: {
          enabled: false,
        },
        documentation: {
          enabled: false,
        },
        logging: {
          enabled: false,
        },
      },
      config.logger,
    );

    return gateway;
  }
}

/**
 * API Gateway Builder
 * Fluent builder for creating customized API Gateway instances
 */
export class ApiGatewayBuilder {
  private config: any = {
    port: 3000,
    host: "localhost",
    cors: { enabled: false },
    rateLimit: { enabled: false },
    authentication: { enabled: false },
    authorization: { enabled: false },
    monitoring: { enabled: false },
    cache: { enabled: false },
    documentation: { enabled: false },
    logging: { enabled: false },
  };
  private logger?: any;

  /**
   * Set server configuration
   */
  server(port: number, host: string = "localhost"): ApiGatewayBuilder {
    this.config.port = port;
    this.config.host = host;
    return this;
  }

  /**
   * Enable CORS
   */
  enableCors(options?: {
    origins?: string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  }): ApiGatewayBuilder {
    this.config.cors = {
      enabled: true,
      origins: options?.origins || ["*"],
      methods: options?.methods || ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      headers: options?.headers || ["Content-Type", "Authorization", "X-API-Key"],
      credentials: options?.credentials || false,
    };
    return this;
  }

  /**
   * Enable rate limiting
   */
  enableRateLimit(windowMs: number, max: number): ApiGatewayBuilder {
    this.config.rateLimit = {
      enabled: true,
      windowMs,
      max,
    };
    return this;
  }

  /**
   * Enable authentication
   */
  enableAuth(jwtSecret: string, apiKeys: string[] = []): ApiGatewayBuilder {
    this.config.authentication = {
      enabled: true,
      jwtSecret,
      apiKeys,
      excludePaths: ["/health", "/metrics", "/docs"],
    };
    return this;
  }

  /**
   * Enable authorization
   */
  enableAuthz(
    defaultRole: string = "user",
    roleHierarchy: Record<string, string[]> = {},
  ): ApiGatewayBuilder {
    this.config.authorization = {
      enabled: true,
      defaultRole,
      roleHierarchy,
    };
    return this;
  }

  /**
   * Enable monitoring
   */
  enableMonitoring(options?: {
    metricsPath?: string;
    healthPath?: string;
    collectSystemMetrics?: boolean;
  }): ApiGatewayBuilder {
    this.config.monitoring = {
      enabled: true,
      metricsPath: options?.metricsPath || "/metrics",
      healthPath: options?.healthPath || "/health",
      collectSystemMetrics: options?.collectSystemMetrics !== false,
    };
    return this;
  }

  /**
   * Enable caching
   */
  enableCache(type: "memory" | "redis" | "supabase", config: any): ApiGatewayBuilder {
    this.config.cache = {
      enabled: true,
      type,
      config,
    };
    return this;
  }

  /**
   * Enable documentation
   */
  enableDocs(options?: {
    path?: string;
    title?: string;
    version?: string;
    description?: string;
  }): ApiGatewayBuilder {
    this.config.documentation = {
      enabled: true,
      path: options?.path || "/docs",
      title: options?.title || "API Gateway",
      version: options?.version || "1.0.0",
      description: options?.description || "API Gateway Documentation",
    };
    return this;
  }

  /**
   * Enable logging
   */
  enableLogging(options?: {
    level?: string;
    format?: string;
    includeRequestBody?: boolean;
    includeResponseBody?: boolean;
  }): ApiGatewayBuilder {
    this.config.logging = {
      enabled: true,
      level: options?.level || "info",
      format: options?.format || "json",
      includeRequestBody: options?.includeRequestBody || false,
      includeResponseBody: options?.includeResponseBody || false,
    };
    return this;
  }

  /**
   * Set logger
   */
  withLogger(logger: any): ApiGatewayBuilder {
    this.logger = logger;
    return this;
  }

  /**
   * Build the API Gateway instance
   */
  build(): NeonProApiGateway {
    return new NeonProApiGateway(this.config, this.logger);
  }
}

/**
 * Default export - API Gateway Factory
 */
export default ApiGatewayFactory;
