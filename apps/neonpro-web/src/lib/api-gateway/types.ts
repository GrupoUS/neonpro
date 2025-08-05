/**
 * NeonPro - API Gateway Types
 * Type definitions for the API Gateway system
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

/**
 * API Gateway Configuration
 */
export interface ApiGatewayConfig {
  baseUrl: string;
  version: string;
  environment: "development" | "staging" | "production";
  cors: {
    origins: string[];
    methods: string[];
    headers: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  };
  authentication: {
    required: boolean;
    providers: string[];
    tokenExpiry: number;
  };
  logging: {
    enabled: boolean;
    level: "debug" | "info" | "warn" | "error";
    includeBody: boolean;
    includeHeaders: boolean;
  };
  monitoring: {
    enabled: boolean;
    metricsEndpoint?: string;
    healthCheckEndpoint: string;
  };
}

/**
 * API Route Definition
 */
export interface ApiRoute {
  id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  handler: string;
  middleware: string[];
  authentication: {
    required: boolean;
    roles?: string[];
    permissions?: string[];
  };
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  validation?: {
    body?: any;
    query?: any;
    params?: any;
    headers?: any;
  };
  documentation: {
    summary: string;
    description: string;
    tags: string[];
    parameters?: ApiParameter[];
    responses: ApiResponse[];
    examples?: ApiExample[];
  };
  deprecated?: boolean;
  version?: string;
}

/**
 * API Parameter
 */
export interface ApiParameter {
  name: string;
  in: "query" | "path" | "header" | "body";
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  description: string;
  example?: any;
  enum?: any[];
  format?: string;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

/**
 * API Response
 */
export interface ApiResponse {
  statusCode: number;
  description: string;
  schema?: any;
  headers?: Record<string, string>;
  examples?: Record<string, any>;
}

/**
 * API Example
 */
export interface ApiExample {
  name: string;
  description: string;
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response: {
    statusCode: number;
    headers?: Record<string, string>;
    body: any;
  };
}

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  id: string;
  name: string;
  description: string;
  type: "web" | "mobile" | "server" | "integration";
  apiKey: string;
  secretKey?: string;
  allowedOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  permissions: string[];
  scopes: string[];
  active: boolean;
  expiresAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API Request Context
 */
export interface ApiRequestContext {
  requestId: string;
  clientId?: string;
  userId?: string;
  userRoles?: string[];
  userPermissions?: string[];
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  route: ApiRoute;
  method: string;
  path: string;
  query: Record<string, any>;
  params: Record<string, any>;
  headers: Record<string, string>;
  body?: any;
}

/**
 * API Response Context
 */
export interface ApiResponseContext {
  requestId: string;
  statusCode: number;
  headers: Record<string, string>;
  body?: any;
  duration: number;
  timestamp: Date;
  cached?: boolean;
  error?: ApiError;
}

/**
 * API Error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
  timestamp: Date;
  requestId: string;
  stack?: string;
}

/**
 * API Metrics
 */
export interface ApiMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  timestamp: Date;
  period: string;
}

/**
 * API Health Check
 */
export interface ApiHealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "up" | "down";
      responseTime: number;
      error?: string;
    };
    cache: {
      status: "up" | "down";
      responseTime: number;
      error?: string;
    };
    integrations: {
      name: string;
      status: "up" | "down";
      responseTime: number;
      error?: string;
    }[];
  };
  metrics: ApiMetrics;
}

/**
 * API Documentation
 */
export interface ApiDocumentation {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact: {
      name: string;
      email: string;
      url: string;
    };
    license: {
      name: string;
      url: string;
    };
  };
  servers: {
    url: string;
    description: string;
  }[];
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
    parameters: Record<string, any>;
    responses: Record<string, any>;
    examples: Record<string, any>;
  };
  security: any[];
  tags: {
    name: string;
    description: string;
  }[];
}

/**
 * API Gateway Middleware
 */
export interface ApiMiddleware {
  name: string;
  order: number;
  enabled: boolean;
  config: Record<string, any>;
  handler: (context: ApiRequestContext, next: () => Promise<void>) => Promise<void>;
}

/**
 * API Gateway Plugin
 */
export interface ApiGatewayPlugin {
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  config: Record<string, any>;
  hooks: {
    beforeRequest?: (context: ApiRequestContext) => Promise<void>;
    afterRequest?: (context: ApiRequestContext, response: ApiResponseContext) => Promise<void>;
    onError?: (context: ApiRequestContext, error: ApiError) => Promise<void>;
  };
}

/**
 * API Gateway Manager Interface
 */
export interface ApiGatewayManager {
  // Route Management
  registerRoute(route: ApiRoute): Promise<void>;
  unregisterRoute(routeId: string): Promise<void>;
  getRoute(routeId: string): Promise<ApiRoute | null>;
  listRoutes(): Promise<ApiRoute[]>;

  // Client Management
  createClient(
    config: Omit<ApiClientConfig, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiClientConfig>;
  updateClient(clientId: string, updates: Partial<ApiClientConfig>): Promise<ApiClientConfig>;
  deleteClient(clientId: string): Promise<void>;
  getClient(clientId: string): Promise<ApiClientConfig | null>;
  listClients(): Promise<ApiClientConfig[]>;

  // Authentication & Authorization
  authenticateRequest(context: ApiRequestContext): Promise<boolean>;
  authorizeRequest(context: ApiRequestContext): Promise<boolean>;
  generateApiKey(clientId: string): Promise<string>;
  validateApiKey(apiKey: string): Promise<ApiClientConfig | null>;

  // Rate Limiting
  checkRateLimit(context: ApiRequestContext): Promise<boolean>;
  getRateLimitStatus(clientId: string): Promise<{
    remaining: number;
    resetTime: Date;
    limit: number;
  }>;

  // Monitoring & Metrics
  recordRequest(context: ApiRequestContext, response: ApiResponseContext): Promise<void>;
  getMetrics(period?: string): Promise<ApiMetrics>;
  getHealthCheck(): Promise<ApiHealthCheck>;

  // Documentation
  generateDocumentation(): Promise<ApiDocumentation>;
  getDocumentation(): Promise<ApiDocumentation>;

  // Middleware & Plugins
  registerMiddleware(middleware: ApiMiddleware): Promise<void>;
  unregisterMiddleware(name: string): Promise<void>;
  registerPlugin(plugin: ApiGatewayPlugin): Promise<void>;
  unregisterPlugin(name: string): Promise<void>;
}

/**
 * API Gateway Events
 */
export interface ApiGatewayEvents {
  "request:start": { context: ApiRequestContext };
  "request:end": { context: ApiRequestContext; response: ApiResponseContext };
  "request:error": { context: ApiRequestContext; error: ApiError };
  "client:created": { client: ApiClientConfig };
  "client:updated": { client: ApiClientConfig };
  "client:deleted": { clientId: string };
  "route:registered": { route: ApiRoute };
  "route:unregistered": { routeId: string };
  "rate_limit:exceeded": { context: ApiRequestContext };
  "health:changed": { status: "healthy" | "degraded" | "unhealthy" };
}

/**
 * API Gateway Cache
 */
export interface ApiGatewayCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * API Gateway Logger
 */
export interface ApiGatewayLogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
}
