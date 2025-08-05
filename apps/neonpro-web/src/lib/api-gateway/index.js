"use strict";
/**
 * NeonPro - API Gateway Module
 * Complete API Gateway system with documentation, monitoring, and middleware
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayBuilder =
  exports.ApiGatewayFactory =
  exports.ApiGatewayPerformanceMonitor =
  exports.MonitoringMiddleware =
  exports.ApiGatewayHealthCheckManager =
  exports.ApiGatewayMetricsCollector =
  exports.CacheMiddleware =
  exports.ApiGatewayCacheFactory =
  exports.SupabaseApiGatewayCache =
  exports.RedisApiGatewayCache =
  exports.MemoryApiGatewayCache =
  exports.ResponseTransformationMiddleware =
  exports.RequestValidationMiddleware =
  exports.AuthorizationMiddleware =
  exports.AuthenticationMiddleware =
  exports.RateLimitingMiddleware =
  exports.RequestLoggingMiddleware =
  exports.CorsMiddleware =
  exports.MiddlewareManager =
  exports.DocumentationRouteBuilder =
  exports.DocumentationMiddleware =
  exports.OpenApiDocumentationGenerator =
  exports.NeonProApiGateway =
    void 0;
// Core Gateway
var gateway_1 = require("./gateway");
Object.defineProperty(exports, "NeonProApiGateway", {
  enumerable: true,
  get: function () {
    return gateway_1.NeonProApiGateway;
  },
});
// Types and Interfaces
__exportStar(require("./types"), exports);
// Documentation System
var documentation_1 = require("./documentation");
Object.defineProperty(exports, "OpenApiDocumentationGenerator", {
  enumerable: true,
  get: function () {
    return documentation_1.OpenApiDocumentationGenerator;
  },
});
Object.defineProperty(exports, "DocumentationMiddleware", {
  enumerable: true,
  get: function () {
    return documentation_1.DocumentationMiddleware;
  },
});
Object.defineProperty(exports, "DocumentationRouteBuilder", {
  enumerable: true,
  get: function () {
    return documentation_1.DocumentationRouteBuilder;
  },
});
// Middleware System
var middleware_1 = require("./middleware");
Object.defineProperty(exports, "MiddlewareManager", {
  enumerable: true,
  get: function () {
    return middleware_1.MiddlewareManager;
  },
});
Object.defineProperty(exports, "CorsMiddleware", {
  enumerable: true,
  get: function () {
    return middleware_1.CorsMiddleware;
  },
});
Object.defineProperty(exports, "RequestLoggingMiddleware", {
  enumerable: true,
  get: function () {
    return middleware_1.RequestLoggingMiddleware;
  },
});
Object.defineProperty(exports, "RateLimitingMiddleware", {
  enumerable: true,
  get: function () {
    return middleware_1.RateLimitingMiddleware;
  },
});
Object.defineProperty(exports, "AuthenticationMiddleware", {
  enumerable: true,
  get: function () {
    return middleware_1.AuthenticationMiddleware;
  },
});
Object.defineProperty(exports, "AuthorizationMiddleware", {
  enumerable: true,
  get: function () {
    return middleware_1.AuthorizationMiddleware;
  },
});
Object.defineProperty(exports, "RequestValidationMiddleware", {
  enumerable: true,
  get: function () {
    return middleware_1.RequestValidationMiddleware;
  },
});
Object.defineProperty(exports, "ResponseTransformationMiddleware", {
  enumerable: true,
  get: function () {
    return middleware_1.ResponseTransformationMiddleware;
  },
});
// Cache System
var cache_1 = require("./cache");
Object.defineProperty(exports, "MemoryApiGatewayCache", {
  enumerable: true,
  get: function () {
    return cache_1.MemoryApiGatewayCache;
  },
});
Object.defineProperty(exports, "RedisApiGatewayCache", {
  enumerable: true,
  get: function () {
    return cache_1.RedisApiGatewayCache;
  },
});
Object.defineProperty(exports, "SupabaseApiGatewayCache", {
  enumerable: true,
  get: function () {
    return cache_1.SupabaseApiGatewayCache;
  },
});
Object.defineProperty(exports, "ApiGatewayCacheFactory", {
  enumerable: true,
  get: function () {
    return cache_1.ApiGatewayCacheFactory;
  },
});
Object.defineProperty(exports, "CacheMiddleware", {
  enumerable: true,
  get: function () {
    return cache_1.CacheMiddleware;
  },
});
// Monitoring System
var monitoring_1 = require("./monitoring");
Object.defineProperty(exports, "ApiGatewayMetricsCollector", {
  enumerable: true,
  get: function () {
    return monitoring_1.ApiGatewayMetricsCollector;
  },
});
Object.defineProperty(exports, "ApiGatewayHealthCheckManager", {
  enumerable: true,
  get: function () {
    return monitoring_1.ApiGatewayHealthCheckManager;
  },
});
Object.defineProperty(exports, "MonitoringMiddleware", {
  enumerable: true,
  get: function () {
    return monitoring_1.MonitoringMiddleware;
  },
});
Object.defineProperty(exports, "ApiGatewayPerformanceMonitor", {
  enumerable: true,
  get: function () {
    return monitoring_1.ApiGatewayPerformanceMonitor;
  },
});
/**
 * API Gateway Factory
 * Factory class for creating and configuring API Gateway instances
 */
var ApiGatewayFactory = /** @class */ (function () {
  function ApiGatewayFactory() {}
  /**
   * Create a basic API Gateway instance
   */
  ApiGatewayFactory.createBasic = function (config) {
    var _a, _b;
    if (config === void 0) {
      config = {};
    }
    var gateway = new NeonProApiGateway(
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
          windowMs:
            ((_a = config.rateLimit) === null || _a === void 0 ? void 0 : _a.windowMs) || 60000,
          max: ((_b = config.rateLimit) === null || _b === void 0 ? void 0 : _b.max) || 100,
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
  };
  /**
   * Create a production-ready API Gateway instance
   */
  ApiGatewayFactory.createProduction = function (config) {
    var _a, _b, _c, _d, _e;
    var gateway = new NeonProApiGateway(
      {
        port: config.port || 8080,
        host: config.host || "0.0.0.0",
        cors: {
          enabled: true,
          origins: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0
            ? void 0
            : _a.split(",")) || ["*"],
          methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          headers: ["Content-Type", "Authorization", "X-API-Key"],
          credentials: true,
        },
        rateLimit: {
          enabled: true,
          windowMs:
            ((_b = config.rateLimit) === null || _b === void 0 ? void 0 : _b.windowMs) || 60000,
          max: ((_c = config.rateLimit) === null || _c === void 0 ? void 0 : _c.max) || 1000,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
        },
        authentication: {
          enabled: true,
          jwtSecret:
            ((_d = config.auth) === null || _d === void 0 ? void 0 : _d.jwtSecret) ||
            process.env.JWT_SECRET ||
            "",
          apiKeys: ((_e = config.auth) === null || _e === void 0 ? void 0 : _e.apiKeys) || [],
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
  };
  /**
   * Create a development API Gateway instance
   */
  ApiGatewayFactory.createDevelopment = function (config) {
    if (config === void 0) {
      config = {};
    }
    var gateway = new NeonProApiGateway(
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
  };
  /**
   * Create a testing API Gateway instance
   */
  ApiGatewayFactory.createTesting = function (config) {
    if (config === void 0) {
      config = {};
    }
    var gateway = new NeonProApiGateway(
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
  };
  return ApiGatewayFactory;
})();
exports.ApiGatewayFactory = ApiGatewayFactory;
/**
 * API Gateway Builder
 * Fluent builder for creating customized API Gateway instances
 */
var ApiGatewayBuilder = /** @class */ (function () {
  function ApiGatewayBuilder() {
    this.config = {
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
  }
  /**
   * Set server configuration
   */
  ApiGatewayBuilder.prototype.server = function (port, host) {
    if (host === void 0) {
      host = "localhost";
    }
    this.config.port = port;
    this.config.host = host;
    return this;
  };
  /**
   * Enable CORS
   */
  ApiGatewayBuilder.prototype.enableCors = function (options) {
    this.config.cors = {
      enabled: true,
      origins: (options === null || options === void 0 ? void 0 : options.origins) || ["*"],
      methods: (options === null || options === void 0 ? void 0 : options.methods) || [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "OPTIONS",
      ],
      headers: (options === null || options === void 0 ? void 0 : options.headers) || [
        "Content-Type",
        "Authorization",
        "X-API-Key",
      ],
      credentials: (options === null || options === void 0 ? void 0 : options.credentials) || false,
    };
    return this;
  };
  /**
   * Enable rate limiting
   */
  ApiGatewayBuilder.prototype.enableRateLimit = function (windowMs, max) {
    this.config.rateLimit = {
      enabled: true,
      windowMs: windowMs,
      max: max,
    };
    return this;
  };
  /**
   * Enable authentication
   */
  ApiGatewayBuilder.prototype.enableAuth = function (jwtSecret, apiKeys) {
    if (apiKeys === void 0) {
      apiKeys = [];
    }
    this.config.authentication = {
      enabled: true,
      jwtSecret: jwtSecret,
      apiKeys: apiKeys,
      excludePaths: ["/health", "/metrics", "/docs"],
    };
    return this;
  };
  /**
   * Enable authorization
   */
  ApiGatewayBuilder.prototype.enableAuthz = function (defaultRole, roleHierarchy) {
    if (defaultRole === void 0) {
      defaultRole = "user";
    }
    if (roleHierarchy === void 0) {
      roleHierarchy = {};
    }
    this.config.authorization = {
      enabled: true,
      defaultRole: defaultRole,
      roleHierarchy: roleHierarchy,
    };
    return this;
  };
  /**
   * Enable monitoring
   */
  ApiGatewayBuilder.prototype.enableMonitoring = function (options) {
    this.config.monitoring = {
      enabled: true,
      metricsPath:
        (options === null || options === void 0 ? void 0 : options.metricsPath) || "/metrics",
      healthPath:
        (options === null || options === void 0 ? void 0 : options.healthPath) || "/health",
      collectSystemMetrics:
        (options === null || options === void 0 ? void 0 : options.collectSystemMetrics) !== false,
    };
    return this;
  };
  /**
   * Enable caching
   */
  ApiGatewayBuilder.prototype.enableCache = function (type, config) {
    this.config.cache = {
      enabled: true,
      type: type,
      config: config,
    };
    return this;
  };
  /**
   * Enable documentation
   */
  ApiGatewayBuilder.prototype.enableDocs = function (options) {
    this.config.documentation = {
      enabled: true,
      path: (options === null || options === void 0 ? void 0 : options.path) || "/docs",
      title: (options === null || options === void 0 ? void 0 : options.title) || "API Gateway",
      version: (options === null || options === void 0 ? void 0 : options.version) || "1.0.0",
      description:
        (options === null || options === void 0 ? void 0 : options.description) ||
        "API Gateway Documentation",
    };
    return this;
  };
  /**
   * Enable logging
   */
  ApiGatewayBuilder.prototype.enableLogging = function (options) {
    this.config.logging = {
      enabled: true,
      level: (options === null || options === void 0 ? void 0 : options.level) || "info",
      format: (options === null || options === void 0 ? void 0 : options.format) || "json",
      includeRequestBody:
        (options === null || options === void 0 ? void 0 : options.includeRequestBody) || false,
      includeResponseBody:
        (options === null || options === void 0 ? void 0 : options.includeResponseBody) || false,
    };
    return this;
  };
  /**
   * Set logger
   */
  ApiGatewayBuilder.prototype.withLogger = function (logger) {
    this.logger = logger;
    return this;
  };
  /**
   * Build the API Gateway instance
   */
  ApiGatewayBuilder.prototype.build = function () {
    return new NeonProApiGateway(this.config, this.logger);
  };
  return ApiGatewayBuilder;
})();
exports.ApiGatewayBuilder = ApiGatewayBuilder;
/**
 * Default export - API Gateway Factory
 */
exports.default = ApiGatewayFactory;
