/**
 * NeonPro - API Gateway Core
 * Main API Gateway implementation with routing, authentication, and monitoring
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import {
  ApiGatewayConfig,
  ApiGatewayManager,
  ApiRoute,
  ApiClientConfig,
  ApiRequestContext,
  ApiResponseContext,
  ApiError,
  ApiMetrics,
  ApiHealthCheck,
  ApiDocumentation,
  ApiMiddleware,
  ApiGatewayPlugin,
  ApiGatewayEvents,
  ApiGatewayCache,
  ApiGatewayLogger
} from './types';

/**
 * NeonPro API Gateway
 * Central gateway for all API requests with authentication, rate limiting, and monitoring
 */
export class NeonProApiGateway implements ApiGatewayManager {
  private config: ApiGatewayConfig;
  private routes: Map<string, ApiRoute> = new Map();
  private clients: Map<string, ApiClientConfig> = new Map();
  private middleware: Map<string, ApiMiddleware> = new Map();
  private plugins: Map<string, ApiGatewayPlugin> = new Map();
  private rateLimitStore: Map<string, { count: number; resetTime: Date }> = new Map();
  private metrics: ApiMetrics;
  private cache?: ApiGatewayCache;
  private logger?: ApiGatewayLogger;
  private eventListeners: Map<keyof ApiGatewayEvents, Function[]> = new Map();

  constructor(
    config: ApiGatewayConfig,
    cache?: ApiGatewayCache,
    logger?: ApiGatewayLogger
  ) {
    this.config = config;
    this.cache = cache;
    this.logger = logger;
    this.metrics = this.initializeMetrics();
    this.setupDefaultMiddleware();
  }

  /**
   * Initialize default metrics
   */
  private initializeMetrics(): ApiMetrics {
    return {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      uptime: 0,
      timestamp: new Date(),
      period: '1h'
    };
  }

  /**
   * Setup default middleware
   */
  private setupDefaultMiddleware(): void {
    // CORS middleware
    this.registerMiddleware({
      name: 'cors',
      order: 1,
      enabled: true,
      config: this.config.cors,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        // Add CORS headers
        context.headers['Access-Control-Allow-Origin'] = this.config.cors.origins.join(',');
        context.headers['Access-Control-Allow-Methods'] = this.config.cors.methods.join(',');
        context.headers['Access-Control-Allow-Headers'] = this.config.cors.headers.join(',');
        context.headers['Access-Control-Allow-Credentials'] = this.config.cors.credentials.toString();
        
        await next();
      }
    });

    // Request logging middleware
    this.registerMiddleware({
      name: 'logging',
      order: 2,
      enabled: this.config.logging.enabled,
      config: this.config.logging,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        const startTime = Date.now();
        
        this.logger?.info('API Request', {
          requestId: context.requestId,
          method: context.method,
          path: context.path,
          clientId: context.clientId,
          userId: context.userId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        });
        
        try {
          await next();
        } finally {
          const duration = Date.now() - startTime;
          this.logger?.info('API Response', {
            requestId: context.requestId,
            duration,
            statusCode: context.headers['status-code'] || 200
          });
        }
      }
    });

    // Rate limiting middleware
    this.registerMiddleware({
      name: 'rate-limit',
      order: 3,
      enabled: true,
      config: this.config.rateLimit,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        const allowed = await this.checkRateLimit(context);
        
        if (!allowed) {
          throw new Error('Rate limit exceeded');
        }
        
        await next();
      }
    });

    // Authentication middleware
    this.registerMiddleware({
      name: 'authentication',
      order: 4,
      enabled: this.config.authentication.required,
      config: this.config.authentication,
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        if (context.route.authentication.required) {
          const authenticated = await this.authenticateRequest(context);
          
          if (!authenticated) {
            throw new Error('Authentication required');
          }
        }
        
        await next();
      }
    });

    // Authorization middleware
    this.registerMiddleware({
      name: 'authorization',
      order: 5,
      enabled: true,
      config: {},
      handler: async (context: ApiRequestContext, next: () => Promise<void>) => {
        if (context.route.authentication.required) {
          const authorized = await this.authorizeRequest(context);
          
          if (!authorized) {
            throw new Error('Insufficient permissions');
          }
        }
        
        await next();
      }
    });
  }

  // Route Management

  /**
   * Register a new API route
   */
  async registerRoute(route: ApiRoute): Promise<void> {
    this.routes.set(route.id, route);
    this.emit('route:registered', { route });
    
    this.logger?.info('Route registered', {
      routeId: route.id,
      path: route.path,
      method: route.method
    });
  }

  /**
   * Unregister an API route
   */
  async unregisterRoute(routeId: string): Promise<void> {
    this.routes.delete(routeId);
    this.emit('route:unregistered', { routeId });
    
    this.logger?.info('Route unregistered', { routeId });
  }

  /**
   * Get a specific route
   */
  async getRoute(routeId: string): Promise<ApiRoute | null> {
    return this.routes.get(routeId) || null;
  }

  /**
   * List all routes
   */
  async listRoutes(): Promise<ApiRoute[]> {
    return Array.from(this.routes.values());
  }

  /**
   * Find route by path and method
   */
  async findRoute(path: string, method: string): Promise<ApiRoute | null> {
    for (const route of this.routes.values()) {
      if (this.matchRoute(route.path, path) && route.method === method) {
        return route;
      }
    }
    return null;
  }

  /**
   * Match route path with request path
   */
  private matchRoute(routePath: string, requestPath: string): boolean {
    // Simple path matching - can be enhanced with parameter extraction
    const routeSegments = routePath.split('/');
    const requestSegments = requestPath.split('/');
    
    if (routeSegments.length !== requestSegments.length) {
      return false;
    }
    
    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const requestSegment = requestSegments[i];
      
      // Parameter segment (starts with :)
      if (routeSegment.startsWith(':')) {
        continue;
      }
      
      // Exact match required
      if (routeSegment !== requestSegment) {
        return false;
      }
    }
    
    return true;
  }

  // Client Management

  /**
   * Create a new API client
   */
  async createClient(config: Omit<ApiClientConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiClientConfig> {
    const client: ApiClientConfig = {
      ...config,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.clients.set(client.id, client);
    this.emit('client:created', { client });
    
    this.logger?.info('Client created', {
      clientId: client.id,
      name: client.name,
      type: client.type
    });
    
    return client;
  }

  /**
   * Update an existing client
   */
  async updateClient(clientId: string, updates: Partial<ApiClientConfig>): Promise<ApiClientConfig> {
    const client = this.clients.get(clientId);
    
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }
    
    const updatedClient = {
      ...client,
      ...updates,
      updatedAt: new Date()
    };
    
    this.clients.set(clientId, updatedClient);
    this.emit('client:updated', { client: updatedClient });
    
    this.logger?.info('Client updated', { clientId });
    
    return updatedClient;
  }

  /**
   * Delete a client
   */
  async deleteClient(clientId: string): Promise<void> {
    this.clients.delete(clientId);
    this.emit('client:deleted', { clientId });
    
    this.logger?.info('Client deleted', { clientId });
  }

  /**
   * Get a specific client
   */
  async getClient(clientId: string): Promise<ApiClientConfig | null> {
    return this.clients.get(clientId) || null;
  }

  /**
   * List all clients
   */
  async listClients(): Promise<ApiClientConfig[]> {
    return Array.from(this.clients.values());
  }

  // Authentication & Authorization

  /**
   * Authenticate API request
   */
  async authenticateRequest(context: ApiRequestContext): Promise<boolean> {
    const apiKey = context.headers['x-api-key'] || context.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return false;
    }
    
    const client = await this.validateApiKey(apiKey);
    
    if (!client || !client.active) {
      return false;
    }
    
    // Check expiration
    if (client.expiresAt && client.expiresAt < new Date()) {
      return false;
    }
    
    // Set client context
    context.clientId = client.id;
    
    return true;
  }

  /**
   * Authorize API request
   */
  async authorizeRequest(context: ApiRequestContext): Promise<boolean> {
    if (!context.clientId) {
      return false;
    }
    
    const client = await this.getClient(context.clientId);
    
    if (!client) {
      return false;
    }
    
    const route = context.route;
    
    // Check required roles
    if (route.authentication.roles && route.authentication.roles.length > 0) {
      if (!context.userRoles || !route.authentication.roles.some(role => context.userRoles!.includes(role))) {
        return false;
      }
    }
    
    // Check required permissions
    if (route.authentication.permissions && route.authentication.permissions.length > 0) {
      if (!context.userPermissions || !route.authentication.permissions.some(perm => context.userPermissions!.includes(perm))) {
        return false;
      }
    }
    
    // Check client permissions
    const requiredPermission = `${route.method.toLowerCase()}:${route.path}`;
    if (!client.permissions.includes(requiredPermission) && !client.permissions.includes('*')) {
      return false;
    }
    
    return true;
  }

  /**
   * Generate API key for client
   */
  async generateApiKey(clientId: string): Promise<string> {
    const client = await this.getClient(clientId);
    
    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }
    
    // Generate secure API key
    const apiKey = `neonpro_${clientId}_${this.generateSecureToken()}`;
    
    // Update client with new API key
    await this.updateClient(clientId, { apiKey });
    
    return apiKey;
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey: string): Promise<ApiClientConfig | null> {
    for (const client of this.clients.values()) {
      if (client.apiKey === apiKey) {
        return client;
      }
    }
    return null;
  }

  // Rate Limiting

  /**
   * Check rate limit for request
   */
  async checkRateLimit(context: ApiRequestContext): Promise<boolean> {
    const key = context.clientId || context.ipAddress;
    const route = context.route;
    
    // Use route-specific rate limit or global rate limit
    const rateLimit = route.rateLimit || this.config.rateLimit;
    
    const now = new Date();
    const windowStart = new Date(now.getTime() - rateLimit.windowMs);
    
    let rateLimitData = this.rateLimitStore.get(key);
    
    if (!rateLimitData || rateLimitData.resetTime < now) {
      rateLimitData = {
        count: 0,
        resetTime: new Date(now.getTime() + rateLimit.windowMs)
      };
    }
    
    if (rateLimitData.count >= rateLimit.maxRequests) {
      this.emit('rate_limit:exceeded', { context });
      return false;
    }
    
    rateLimitData.count++;
    this.rateLimitStore.set(key, rateLimitData);
    
    return true;
  }

  /**
   * Get rate limit status for client
   */
  async getRateLimitStatus(clientId: string): Promise<{
    remaining: number;
    resetTime: Date;
    limit: number;
  }> {
    const rateLimitData = this.rateLimitStore.get(clientId);
    const limit = this.config.rateLimit.maxRequests;
    
    if (!rateLimitData) {
      return {
        remaining: limit,
        resetTime: new Date(Date.now() + this.config.rateLimit.windowMs),
        limit
      };
    }
    
    return {
      remaining: Math.max(0, limit - rateLimitData.count),
      resetTime: rateLimitData.resetTime,
      limit
    };
  }

  // Monitoring & Metrics

  /**
   * Record API request for metrics
   */
  async recordRequest(context: ApiRequestContext, response: ApiResponseContext): Promise<void> {
    this.metrics.requestCount++;
    
    if (response.statusCode >= 400) {
      this.metrics.errorCount++;
    }
    
    // Update response time metrics
    this.updateResponseTimeMetrics(response.duration);
    
    // Calculate error rate
    this.metrics.errorRate = (this.metrics.errorCount / this.metrics.requestCount) * 100;
    
    // Update timestamp
    this.metrics.timestamp = new Date();
    
    this.emit('request:end', { context, response });
  }

  /**
   * Update response time metrics
   */
  private updateResponseTimeMetrics(duration: number): void {
    // Simple moving average for demonstration
    // In production, use proper percentile calculation
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + duration) / 2;
    
    // Approximate percentiles
    this.metrics.p95ResponseTime = Math.max(this.metrics.p95ResponseTime, duration * 0.95);
    this.metrics.p99ResponseTime = Math.max(this.metrics.p99ResponseTime, duration * 0.99);
  }

  /**
   * Get current metrics
   */
  async getMetrics(period?: string): Promise<ApiMetrics> {
    return { ...this.metrics, period: period || this.metrics.period };
  }

  /**
   * Get health check status
   */
  async getHealthCheck(): Promise<ApiHealthCheck> {
    const startTime = Date.now();
    
    // Check database connectivity
    const dbCheck = await this.checkDatabaseHealth();
    
    // Check cache connectivity
    const cacheCheck = await this.checkCacheHealth();
    
    // Check integrations
    const integrationChecks = await this.checkIntegrationsHealth();
    
    const status = this.determineOverallHealth(dbCheck, cacheCheck, integrationChecks);
    
    return {
      status,
      timestamp: new Date(),
      version: this.config.version,
      uptime: Date.now() - startTime,
      checks: {
        database: dbCheck,
        cache: cacheCheck,
        integrations: integrationChecks
      },
      metrics: this.metrics
    };
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<{ status: 'up' | 'down'; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Simulate database check
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth(): Promise<{ status: 'up' | 'down'; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      if (this.cache) {
        await this.cache.set('health-check', 'ok', 1000);
        await this.cache.get('health-check');
      }
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check integrations health
   */
  private async checkIntegrationsHealth(): Promise<{
    name: string;
    status: 'up' | 'down';
    responseTime: number;
    error?: string;
  }[]> {
    // Placeholder for integration health checks
    return [
      {
        name: 'whatsapp',
        status: 'up',
        responseTime: 50
      },
      {
        name: 'google-calendar',
        status: 'up',
        responseTime: 100
      },
      {
        name: 'stripe',
        status: 'up',
        responseTime: 75
      }
    ];
  }

  /**
   * Determine overall health status
   */
  private determineOverallHealth(
    dbCheck: any,
    cacheCheck: any,
    integrationChecks: any[]
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (dbCheck.status === 'down') {
      return 'unhealthy';
    }
    
    const downIntegrations = integrationChecks.filter(check => check.status === 'down');
    
    if (downIntegrations.length > integrationChecks.length / 2) {
      return 'unhealthy';
    }
    
    if (cacheCheck.status === 'down' || downIntegrations.length > 0) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  // Documentation

  /**
   * Generate OpenAPI documentation
   */
  async generateDocumentation(): Promise<ApiDocumentation> {
    const routes = await this.listRoutes();
    
    const paths: Record<string, any> = {};
    const schemas: Record<string, any> = {};
    const tags: { name: string; description: string }[] = [];
    
    // Process routes
    for (const route of routes) {
      const pathKey = route.path;
      const methodKey = route.method.toLowerCase();
      
      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }
      
      paths[pathKey][methodKey] = {
        summary: route.documentation.summary,
        description: route.documentation.description,
        tags: route.documentation.tags,
        parameters: route.documentation.parameters,
        responses: this.formatResponses(route.documentation.responses),
        security: route.authentication.required ? [{ ApiKeyAuth: [] }] : []
      };
      
      // Collect unique tags
      for (const tag of route.documentation.tags) {
        if (!tags.find(t => t.name === tag)) {
          tags.push({ name: tag, description: `${tag} operations` });
        }
      }
    }
    
    return {
      openapi: '3.0.3',
      info: {
        title: 'NeonPro API',
        description: 'API Gateway for NeonPro Healthcare Management System',
        version: this.config.version,
        contact: {
          name: 'NeonPro Support',
          email: 'support@neonpro.com.br',
          url: 'https://neonpro.com.br'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: this.config.baseUrl,
          description: `${this.config.environment} server`
        }
      ],
      paths,
      components: {
        schemas,
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        },
        parameters: {},
        responses: {},
        examples: {}
      },
      security: [],
      tags
    };
  }

  /**
   * Format responses for OpenAPI
   */
  private formatResponses(responses: any[]): Record<string, any> {
    const formatted: Record<string, any> = {};
    
    for (const response of responses) {
      formatted[response.statusCode.toString()] = {
        description: response.description,
        content: response.schema ? {
          'application/json': {
            schema: response.schema
          }
        } : undefined
      };
    }
    
    return formatted;
  }

  /**
   * Get cached documentation
   */
  async getDocumentation(): Promise<ApiDocumentation> {
    const cacheKey = 'api-documentation';
    
    if (this.cache) {
      const cached = await this.cache.get<ApiDocumentation>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const documentation = await this.generateDocumentation();
    
    if (this.cache) {
      await this.cache.set(cacheKey, documentation, 3600000); // 1 hour
    }
    
    return documentation;
  }

  // Middleware & Plugins

  /**
   * Register middleware
   */
  async registerMiddleware(middleware: ApiMiddleware): Promise<void> {
    this.middleware.set(middleware.name, middleware);
    
    this.logger?.info('Middleware registered', {
      name: middleware.name,
      order: middleware.order,
      enabled: middleware.enabled
    });
  }

  /**
   * Unregister middleware
   */
  async unregisterMiddleware(name: string): Promise<void> {
    this.middleware.delete(name);
    
    this.logger?.info('Middleware unregistered', { name });
  }

  /**
   * Register plugin
   */
  async registerPlugin(plugin: ApiGatewayPlugin): Promise<void> {
    this.plugins.set(plugin.name, plugin);
    
    this.logger?.info('Plugin registered', {
      name: plugin.name,
      version: plugin.version,
      enabled: plugin.enabled
    });
  }

  /**
   * Unregister plugin
   */
  async unregisterPlugin(name: string): Promise<void> {
    this.plugins.delete(name);
    
    this.logger?.info('Plugin unregistered', { name });
  }

  /**
   * Execute middleware chain
   */
  async executeMiddleware(context: ApiRequestContext): Promise<void> {
    const middlewares = Array.from(this.middleware.values())
      .filter(m => m.enabled)
      .sort((a, b) => a.order - b.order);
    
    let index = 0;
    
    const next = async (): Promise<void> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        await middleware.handler(context, next);
      }
    };
    
    await next();
  }

  // Event Management

  /**
   * Add event listener
   */
  on<K extends keyof ApiGatewayEvents>(event: K, listener: (data: ApiGatewayEvents[K]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof ApiGatewayEvents>(event: K, listener: (data: ApiGatewayEvents[K]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit<K extends keyof ApiGatewayEvents>(event: K, data: ApiGatewayEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          this.logger?.error('Event listener error', error as Error, { event });
        }
      });
    }
  }

  // Utility Methods

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate secure token
   */
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
