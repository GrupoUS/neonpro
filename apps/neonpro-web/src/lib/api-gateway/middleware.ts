/**
 * NeonPro - API Gateway Middleware System
 * Comprehensive middleware and plugin system for request processing
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import type {
  ApiMiddleware,
  ApiGatewayPlugin,
  ApiRequestContext,
  ApiResponseContext,
  ApiGatewayConfig,
  ApiGatewayLogger,
} from "./types";

/**
 * Middleware Manager
 * Manages and executes middleware chain
 */
export class MiddlewareManager {
  private middleware: Map<string, ApiMiddleware> = new Map();
  private plugins: Map<string, ApiGatewayPlugin> = new Map();
  private logger?: ApiGatewayLogger;

  constructor(logger?: ApiGatewayLogger) {
    this.logger = logger;
  }

  /**
   * Register middleware
   */
  register(middleware: ApiMiddleware): void {
    this.middleware.set(middleware.name, middleware);

    this.logger?.info("Middleware registered", {
      name: middleware.name,
      order: middleware.order,
      enabled: middleware.enabled,
    });
  }

  /**
   * Unregister middleware
   */
  unregister(name: string): void {
    this.middleware.delete(name);
    this.logger?.info("Middleware unregistered", { name });
  }

  /**
   * Register plugin
   */
  registerPlugin(plugin: ApiGatewayPlugin): void {
    this.plugins.set(plugin.name, plugin);

    this.logger?.info("Plugin registered", {
      name: plugin.name,
      version: plugin.version,
      enabled: plugin.enabled,
    });
  }

  /**
   * Unregister plugin
   */
  unregisterPlugin(name: string): void {
    this.plugins.delete(name);
    this.logger?.info("Plugin unregistered", { name });
  }

  /**
   * Execute middleware chain
   */
  async execute(context: ApiRequestContext): Promise<void> {
    const middlewares = this.getOrderedMiddleware();
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];

        try {
          await middleware.handler(context, next);
        } catch (error) {
          this.logger?.error("Middleware error", error as Error, {
            middleware: middleware.name,
            requestId: context.requestId,
          });
          throw error;
        }
      }
    };

    await next();
  }

  /**
   * Get ordered middleware
   */
  private getOrderedMiddleware(): ApiMiddleware[] {
    return Array.from(this.middleware.values())
      .filter((m) => m.enabled)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get middleware by name
   */
  getMiddleware(name: string): ApiMiddleware | undefined {
    return this.middleware.get(name);
  }

  /**
   * List all middleware
   */
  listMiddleware(): ApiMiddleware[] {
    return Array.from(this.middleware.values());
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): ApiGatewayPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * List all plugins
   */
  listPlugins(): ApiGatewayPlugin[] {
    return Array.from(this.plugins.values());
  }
}

/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing
 */
export class CorsMiddleware {
  static create(config: {
    origins: string[];
    methods: string[];
    headers: string[];
    credentials: boolean;
    maxAge?: number;
  }): ApiMiddleware {
    return {
      name: "cors",
      order: 1,
      enabled: true,
      config,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        // Handle preflight requests
        if (context.method === "OPTIONS") {
          context.headers["Access-Control-Allow-Origin"] = config.origins.includes("*")
            ? "*"
            : config.origins.join(",");
          context.headers["Access-Control-Allow-Methods"] = config.methods.join(",");
          context.headers["Access-Control-Allow-Headers"] = config.headers.join(",");
          context.headers["Access-Control-Allow-Credentials"] = config.credentials.toString();

          if (config.maxAge) {
            context.headers["Access-Control-Max-Age"] = config.maxAge.toString();
          }

          // End preflight request
          return;
        }

        // Add CORS headers to actual requests
        const origin = context.headers["origin"] || context.headers["Origin"];

        if (origin && (config.origins.includes("*") || config.origins.includes(origin))) {
          context.headers["Access-Control-Allow-Origin"] = origin;
        }

        context.headers["Access-Control-Allow-Credentials"] = config.credentials.toString();
        context.headers["Vary"] = "Origin";

        await next();
      },
    };
  }
}

/**
 * Request Logging Middleware
 * Logs all API requests and responses
 */
export class RequestLoggingMiddleware {
  static create(
    config: {
      enabled: boolean;
      level: "debug" | "info" | "warn" | "error";
      includeBody: boolean;
      includeHeaders: boolean;
      sensitiveHeaders: string[];
    },
    logger?: ApiGatewayLogger,
  ): ApiMiddleware {
    return {
      name: "request-logging",
      order: 2,
      enabled: config.enabled,
      config,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        const startTime = Date.now();

        // Log request
        const requestLog: any = {
          requestId: context.requestId,
          method: context.method,
          path: context.path,
          query: context.query,
          clientId: context.clientId,
          userId: context.userId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          timestamp: new Date().toISOString(),
        };

        if (config.includeHeaders) {
          requestLog.headers = RequestLoggingMiddleware.sanitizeHeaders(
            context.headers,
            config.sensitiveHeaders,
          );
        }

        if (config.includeBody && context.body) {
          requestLog.body = context.body;
        }

        logger?.info("API Request", requestLog);

        try {
          await next();

          // Log successful response
          const duration = Date.now() - startTime;
          logger?.info("API Response", {
            requestId: context.requestId,
            duration,
            statusCode: context.headers["status-code"] || 200,
          });
        } catch (error) {
          // Log error response
          const duration = Date.now() - startTime;
          logger?.error("API Error", error as Error, {
            requestId: context.requestId,
            duration,
            statusCode: 500,
          });
          throw error;
        }
      },
    };
  }

  /**
   * Sanitize headers by removing sensitive information
   */
  private static sanitizeHeaders(
    headers: Record<string, any>,
    sensitiveHeaders: string[],
  ): Record<string, any> {
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = "[REDACTED]";
      }
    }

    return sanitized;
  }
}

/**
 * Rate Limiting Middleware
 * Implements rate limiting based on client ID or IP address
 */
export class RateLimitingMiddleware {
  private rateLimitStore: Map<string, { count: number; resetTime: Date }> = new Map();

  static create(config: {
    maxRequests: number;
    windowMs: number;
    keyGenerator?: (context: ApiRequestContext) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }): ApiMiddleware {
    const instance = new RateLimitingMiddleware();

    return {
      name: "rate-limiting",
      order: 3,
      enabled: true,
      config,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        const key = config.keyGenerator
          ? config.keyGenerator(context)
          : context.clientId || context.ipAddress;

        const allowed = instance.checkRateLimit(key, config);

        if (!allowed) {
          const rateLimitInfo = instance.getRateLimitInfo(key, config);

          // Add rate limit headers
          context.headers["X-RateLimit-Limit"] = config.maxRequests.toString();
          context.headers["X-RateLimit-Remaining"] = rateLimitInfo.remaining.toString();
          context.headers["X-RateLimit-Reset"] = Math.ceil(
            rateLimitInfo.resetTime.getTime() / 1000,
          ).toString();

          throw new Error("Rate limit exceeded");
        }

        await next();
      },
    };
  }

  /**
   * Check if request is within rate limit
   */
  private checkRateLimit(key: string, config: any): boolean {
    const now = new Date();
    let rateLimitData = this.rateLimitStore.get(key);

    if (!rateLimitData || rateLimitData.resetTime < now) {
      rateLimitData = {
        count: 0,
        resetTime: new Date(now.getTime() + config.windowMs),
      };
    }

    if (rateLimitData.count >= config.maxRequests) {
      return false;
    }

    rateLimitData.count++;
    this.rateLimitStore.set(key, rateLimitData);

    return true;
  }

  /**
   * Get rate limit information
   */
  private getRateLimitInfo(
    key: string,
    config: any,
  ): {
    remaining: number;
    resetTime: Date;
  } {
    const rateLimitData = this.rateLimitStore.get(key);

    if (!rateLimitData) {
      return {
        remaining: config.maxRequests,
        resetTime: new Date(Date.now() + config.windowMs),
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - rateLimitData.count),
      resetTime: rateLimitData.resetTime,
    };
  }
}

/**
 * Authentication Middleware
 * Handles API key and JWT authentication
 */
export class AuthenticationMiddleware {
  static create(config: {
    required: boolean;
    apiKeyHeader: string;
    jwtSecret?: string;
    validateApiKey: (
      apiKey: string,
    ) => Promise<{ valid: boolean; clientId?: string; userId?: string }>;
    validateJwt?: (token: string) => Promise<{ valid: boolean; payload?: any }>;
  }): ApiMiddleware {
    return {
      name: "authentication",
      order: 4,
      enabled: config.required,
      config,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        if (!context.route.authentication.required) {
          await next();
          return;
        }

        // Try API key authentication
        const apiKey =
          context.headers[config.apiKeyHeader.toLowerCase()] ||
          context.headers["authorization"]?.replace("Bearer ", "");

        if (apiKey) {
          const result = await config.validateApiKey(apiKey);

          if (result.valid) {
            context.clientId = result.clientId;
            context.userId = result.userId;
            await next();
            return;
          }
        }

        // Try JWT authentication if configured
        if (config.validateJwt) {
          const authHeader = context.headers["authorization"];

          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const result = await config.validateJwt(token);

            if (result.valid && result.payload) {
              context.userId = result.payload.sub || result.payload.userId;
              context.userRoles = result.payload.roles;
              context.userPermissions = result.payload.permissions;
              await next();
              return;
            }
          }
        }

        throw new Error("Authentication required");
      },
    };
  }
}

/**
 * Authorization Middleware
 * Handles role-based and permission-based authorization
 */
export class AuthorizationMiddleware {
  static create(config: {
    checkRoles: boolean;
    checkPermissions: boolean;
    adminRoles?: string[];
  }): ApiMiddleware {
    return {
      name: "authorization",
      order: 5,
      enabled: true,
      config,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        if (!context.route.authentication.required) {
          await next();
          return;
        }

        const route = context.route;

        // Check admin roles
        if (config.adminRoles && context.userRoles) {
          const hasAdminRole = config.adminRoles.some((role) => context.userRoles!.includes(role));

          if (hasAdminRole) {
            await next();
            return;
          }
        }

        // Check required roles
        if (
          config.checkRoles &&
          route.authentication.roles &&
          route.authentication.roles.length > 0
        ) {
          if (
            !context.userRoles ||
            !route.authentication.roles.some((role) => context.userRoles!.includes(role))
          ) {
            throw new Error("Insufficient role permissions");
          }
        }

        // Check required permissions
        if (
          config.checkPermissions &&
          route.authentication.permissions &&
          route.authentication.permissions.length > 0
        ) {
          if (
            !context.userPermissions ||
            !route.authentication.permissions.some((perm) =>
              context.userPermissions!.includes(perm),
            )
          ) {
            throw new Error("Insufficient permissions");
          }
        }

        await next();
      },
    };
  }
}

/**
 * Request Validation Middleware
 * Validates request parameters, query, and body
 */
export class RequestValidationMiddleware {
  static create(config: {
    validateParams: boolean;
    validateQuery: boolean;
    validateBody: boolean;
    strictMode: boolean;
  }): ApiMiddleware {
    return {
      name: "request-validation",
      order: 6,
      enabled: true,
      config,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        const route = context.route;
        const errors: string[] = [];

        // Validate parameters
        if (config.validateParams && route.documentation.parameters) {
          const paramErrors = RequestValidationMiddleware.validateParameters(
            context.params || {},
            route.documentation.parameters.filter((p) => p.in === "path"),
            config.strictMode,
          );
          errors.push(...paramErrors);
        }

        // Validate query parameters
        if (config.validateQuery && route.documentation.parameters) {
          const queryErrors = RequestValidationMiddleware.validateParameters(
            context.query || {},
            route.documentation.parameters.filter((p) => p.in === "query"),
            config.strictMode,
          );
          errors.push(...queryErrors);
        }

        // Validate request body
        if (config.validateBody && context.body && route.documentation.parameters) {
          const bodyParam = route.documentation.parameters.find((p) => p.in === "body");

          if (bodyParam) {
            const bodyErrors = RequestValidationMiddleware.validateBody(
              context.body,
              bodyParam.schema,
              config.strictMode,
            );
            errors.push(...bodyErrors);
          }
        }

        if (errors.length > 0) {
          throw new Error(`Validation errors: ${errors.join(", ")}`);
        }

        await next();
      },
    };
  }

  /**
   * Validate parameters against schema
   */
  private static validateParameters(
    values: Record<string, any>,
    parameters: any[],
    strictMode: boolean,
  ): string[] {
    const errors: string[] = [];

    for (const param of parameters) {
      const value = values[param.name];

      // Check required parameters
      if (param.required && (value === undefined || value === null)) {
        errors.push(`Missing required parameter: ${param.name}`);
        continue;
      }

      // Skip validation if parameter is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Validate parameter type and format
      const paramErrors = RequestValidationMiddleware.validateValue(
        value,
        param.schema,
        param.name,
      );
      errors.push(...paramErrors);
    }

    return errors;
  }

  /**
   * Validate request body against schema
   */
  private static validateBody(body: any, schema: any, strictMode: boolean): string[] {
    return RequestValidationMiddleware.validateValue(body, schema, "body");
  }

  /**
   * Validate value against schema
   */
  private static validateValue(value: any, schema: any, fieldName: string): string[] {
    const errors: string[] = [];

    if (!schema) {
      return errors;
    }

    // Type validation
    if (schema.type) {
      const actualType = Array.isArray(value) ? "array" : typeof value;

      if (actualType !== schema.type) {
        errors.push(`${fieldName} must be of type ${schema.type}, got ${actualType}`);
        return errors;
      }
    }

    // String validations
    if (schema.type === "string") {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`${fieldName} must be at least ${schema.minLength} characters long`);
      }

      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`${fieldName} must be at most ${schema.maxLength} characters long`);
      }

      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push(`${fieldName} does not match required pattern`);
      }

      if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`${fieldName} must be one of: ${schema.enum.join(", ")}`);
      }
    }

    // Number validations
    if (schema.type === "number" || schema.type === "integer") {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(`${fieldName} must be at least ${schema.minimum}`);
      }

      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(`${fieldName} must be at most ${schema.maximum}`);
      }
    }

    // Array validations
    if (schema.type === "array") {
      if (schema.minItems && value.length < schema.minItems) {
        errors.push(`${fieldName} must have at least ${schema.minItems} items`);
      }

      if (schema.maxItems && value.length > schema.maxItems) {
        errors.push(`${fieldName} must have at most ${schema.maxItems} items`);
      }

      // Validate array items
      if (schema.items) {
        value.forEach((item: any, index: number) => {
          const itemErrors = RequestValidationMiddleware.validateValue(
            item,
            schema.items,
            `${fieldName}[${index}]`,
          );
          errors.push(...itemErrors);
        });
      }
    }

    // Object validations
    if (schema.type === "object" && schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propValue = value[propName];

        if (
          schema.required &&
          schema.required.includes(propName) &&
          (propValue === undefined || propValue === null)
        ) {
          errors.push(`${fieldName}.${propName} is required`);
          continue;
        }

        if (propValue !== undefined && propValue !== null) {
          const propErrors = RequestValidationMiddleware.validateValue(
            propValue,
            propSchema,
            `${fieldName}.${propName}`,
          );
          errors.push(...propErrors);
        }
      }
    }

    return errors;
  }
}

/**
 * Response Transformation Middleware
 * Transforms and formats API responses
 */
export class ResponseTransformationMiddleware {
  static create(config: {
    wrapResponses: boolean;
    includeMetadata: boolean;
    formatDates: boolean;
    removeNullValues: boolean;
  }): ApiMiddleware {
    return {
      name: "response-transformation",
      order: 100, // Execute last
      enabled: true,
      config,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        await next();

        // Transform response if present
        if (context.response) {
          context.response = ResponseTransformationMiddleware.transformResponse(
            context.response,
            config,
            context,
          );
        }
      },
    };
  }

  /**
   * Transform response data
   */
  private static transformResponse(response: any, config: any, context: ApiRequestContext): any {
    let transformed = response;

    // Remove null values
    if (config.removeNullValues) {
      transformed = ResponseTransformationMiddleware.removeNullValues(transformed);
    }

    // Format dates
    if (config.formatDates) {
      transformed = ResponseTransformationMiddleware.formatDates(transformed);
    }

    // Wrap response
    if (config.wrapResponses) {
      transformed = {
        success: true,
        data: transformed,
      };

      // Include metadata
      if (config.includeMetadata) {
        transformed.meta = {
          timestamp: new Date().toISOString(),
          requestId: context.requestId,
          version: "1.0.0",
        };
      }
    }

    return transformed;
  }

  /**
   * Remove null and undefined values
   */
  private static removeNullValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => ResponseTransformationMiddleware.removeNullValues(item));
    }

    if (typeof obj === "object") {
      const cleaned: any = {};

      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
          cleaned[key] = ResponseTransformationMiddleware.removeNullValues(value);
        }
      }

      return cleaned;
    }

    return obj;
  }

  /**
   * Format date objects to ISO strings
   */
  private static formatDates(obj: any): any {
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => ResponseTransformationMiddleware.formatDates(item));
    }

    if (typeof obj === "object" && obj !== null) {
      const formatted: any = {};

      for (const [key, value] of Object.entries(obj)) {
        formatted[key] = ResponseTransformationMiddleware.formatDates(value);
      }

      return formatted;
    }

    return obj;
  }
}
