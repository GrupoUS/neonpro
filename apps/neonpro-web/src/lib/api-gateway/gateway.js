/**
 * NeonPro - API Gateway Core
 * Main API Gateway implementation with routing, authentication, and monitoring
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeonProApiGateway = void 0;
/**
 * NeonPro API Gateway
 * Central gateway for all API requests with authentication, rate limiting, and monitoring
 */
var NeonProApiGateway = /** @class */ (() => {
  function NeonProApiGateway(config, cache, logger) {
    this.routes = new Map();
    this.clients = new Map();
    this.middleware = new Map();
    this.plugins = new Map();
    this.rateLimitStore = new Map();
    this.eventListeners = new Map();
    this.config = config;
    this.cache = cache;
    this.logger = logger;
    this.metrics = this.initializeMetrics();
    this.setupDefaultMiddleware();
  }
  /**
   * Initialize default metrics
   */
  NeonProApiGateway.prototype.initializeMetrics = () => ({
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
    throughput: 0,
    errorRate: 0,
    uptime: 0,
    timestamp: new Date(),
    period: "1h",
  });
  /**
   * Setup default middleware
   */
  NeonProApiGateway.prototype.setupDefaultMiddleware = function () {
    // CORS middleware
    this.registerMiddleware({
      name: "cors",
      order: 1,
      enabled: true,
      config: this.config.cors,
      handler: (context, next) =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                // Add CORS headers
                context.headers["Access-Control-Allow-Origin"] = this.config.cors.origins.join(",");
                context.headers["Access-Control-Allow-Methods"] =
                  this.config.cors.methods.join(",");
                context.headers["Access-Control-Allow-Headers"] =
                  this.config.cors.headers.join(",");
                context.headers["Access-Control-Allow-Credentials"] =
                  this.config.cors.credentials.toString();
                return [4 /*yield*/, next()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
    });
    // Request logging middleware
    this.registerMiddleware({
      name: "logging",
      order: 2,
      enabled: this.config.logging.enabled,
      config: this.config.logging,
      handler: (context, next) =>
        __awaiter(this, void 0, void 0, function () {
          var startTime, duration;
          var _a, _b;
          return __generator(this, function (_c) {
            switch (_c.label) {
              case 0:
                startTime = Date.now();
                (_a = this.logger) === null || _a === void 0
                  ? void 0
                  : _a.info("API Request", {
                      requestId: context.requestId,
                      method: context.method,
                      path: context.path,
                      clientId: context.clientId,
                      userId: context.userId,
                      ipAddress: context.ipAddress,
                      userAgent: context.userAgent,
                    });
                _c.label = 1;
              case 1:
                _c.trys.push([1, , 3, 4]);
                return [4 /*yield*/, next()];
              case 2:
                _c.sent();
                return [3 /*break*/, 4];
              case 3:
                duration = Date.now() - startTime;
                (_b = this.logger) === null || _b === void 0
                  ? void 0
                  : _b.info("API Response", {
                      requestId: context.requestId,
                      duration: duration,
                      statusCode: context.headers["status-code"] || 200,
                    });
                return [7 /*endfinally*/];
              case 4:
                return [2 /*return*/];
            }
          });
        }),
    });
    // Rate limiting middleware
    this.registerMiddleware({
      name: "rate-limit",
      order: 3,
      enabled: true,
      config: this.config.rateLimit,
      handler: (context, next) =>
        __awaiter(this, void 0, void 0, function () {
          var allowed;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.checkRateLimit(context)];
              case 1:
                allowed = _a.sent();
                if (!allowed) {
                  throw new Error("Rate limit exceeded");
                }
                return [4 /*yield*/, next()];
              case 2:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
    });
    // Authentication middleware
    this.registerMiddleware({
      name: "authentication",
      order: 4,
      enabled: this.config.authentication.required,
      config: this.config.authentication,
      handler: (context, next) =>
        __awaiter(this, void 0, void 0, function () {
          var authenticated;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (!context.route.authentication.required) return [3 /*break*/, 2];
                return [4 /*yield*/, this.authenticateRequest(context)];
              case 1:
                authenticated = _a.sent();
                if (!authenticated) {
                  throw new Error("Authentication required");
                }
                _a.label = 2;
              case 2:
                return [4 /*yield*/, next()];
              case 3:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
    });
    // Authorization middleware
    this.registerMiddleware({
      name: "authorization",
      order: 5,
      enabled: true,
      config: {},
      handler: (context, next) =>
        __awaiter(this, void 0, void 0, function () {
          var authorized;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (!context.route.authentication.required) return [3 /*break*/, 2];
                return [4 /*yield*/, this.authorizeRequest(context)];
              case 1:
                authorized = _a.sent();
                if (!authorized) {
                  throw new Error("Insufficient permissions");
                }
                _a.label = 2;
              case 2:
                return [4 /*yield*/, next()];
              case 3:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
    });
  };
  // Route Management
  /**
   * Register a new API route
   */
  NeonProApiGateway.prototype.registerRoute = function (route) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        this.routes.set(route.id, route);
        this.emit("route:registered", { route: route });
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Route registered", {
              routeId: route.id,
              path: route.path,
              method: route.method,
            });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Unregister an API route
   */
  NeonProApiGateway.prototype.unregisterRoute = function (routeId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        this.routes.delete(routeId);
        this.emit("route:unregistered", { routeId: routeId });
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Route unregistered", { routeId: routeId });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get a specific route
   */
  NeonProApiGateway.prototype.getRoute = function (routeId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.routes.get(routeId) || null];
      });
    });
  };
  /**
   * List all routes
   */
  NeonProApiGateway.prototype.listRoutes = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, Array.from(this.routes.values())];
      });
    });
  };
  /**
   * Find route by path and method
   */
  NeonProApiGateway.prototype.findRoute = function (path, method) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, route;
      return __generator(this, function (_b) {
        for (_i = 0, _a = this.routes.values(); _i < _a.length; _i++) {
          route = _a[_i];
          if (this.matchRoute(route.path, path) && route.method === method) {
            return [2 /*return*/, route];
          }
        }
        return [2 /*return*/, null];
      });
    });
  };
  /**
   * Match route path with request path
   */
  NeonProApiGateway.prototype.matchRoute = (routePath, requestPath) => {
    // Simple path matching - can be enhanced with parameter extraction
    var routeSegments = routePath.split("/");
    var requestSegments = requestPath.split("/");
    if (routeSegments.length !== requestSegments.length) {
      return false;
    }
    for (var i = 0; i < routeSegments.length; i++) {
      var routeSegment = routeSegments[i];
      var requestSegment = requestSegments[i];
      // Parameter segment (starts with :)
      if (routeSegment.startsWith(":")) {
        continue;
      }
      // Exact match required
      if (routeSegment !== requestSegment) {
        return false;
      }
    }
    return true;
  };
  // Client Management
  /**
   * Create a new API client
   */
  NeonProApiGateway.prototype.createClient = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var client;
      var _a;
      return __generator(this, function (_b) {
        client = __assign(__assign({}, config), {
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        this.clients.set(client.id, client);
        this.emit("client:created", { client: client });
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Client created", {
              clientId: client.id,
              name: client.name,
              type: client.type,
            });
        return [2 /*return*/, client];
      });
    });
  };
  /**
   * Update an existing client
   */
  NeonProApiGateway.prototype.updateClient = function (clientId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var client, updatedClient;
      var _a;
      return __generator(this, function (_b) {
        client = this.clients.get(clientId);
        if (!client) {
          throw new Error("Client not found: ".concat(clientId));
        }
        updatedClient = __assign(__assign(__assign({}, client), updates), {
          updatedAt: new Date(),
        });
        this.clients.set(clientId, updatedClient);
        this.emit("client:updated", { client: updatedClient });
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Client updated", { clientId: clientId });
        return [2 /*return*/, updatedClient];
      });
    });
  };
  /**
   * Delete a client
   */
  NeonProApiGateway.prototype.deleteClient = function (clientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        this.clients.delete(clientId);
        this.emit("client:deleted", { clientId: clientId });
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Client deleted", { clientId: clientId });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get a specific client
   */
  NeonProApiGateway.prototype.getClient = function (clientId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.clients.get(clientId) || null];
      });
    });
  };
  /**
   * List all clients
   */
  NeonProApiGateway.prototype.listClients = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, Array.from(this.clients.values())];
      });
    });
  };
  // Authentication & Authorization
  /**
   * Authenticate API request
   */
  NeonProApiGateway.prototype.authenticateRequest = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var apiKey, client;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            apiKey =
              context.headers["x-api-key"] ||
              ((_a = context.headers["authorization"]) === null || _a === void 0
                ? void 0
                : _a.replace("Bearer ", ""));
            if (!apiKey) {
              return [2 /*return*/, false];
            }
            return [4 /*yield*/, this.validateApiKey(apiKey)];
          case 1:
            client = _b.sent();
            if (!client || !client.active) {
              return [2 /*return*/, false];
            }
            // Check expiration
            if (client.expiresAt && client.expiresAt < new Date()) {
              return [2 /*return*/, false];
            }
            // Set client context
            context.clientId = client.id;
            return [2 /*return*/, true];
        }
      });
    });
  };
  /**
   * Authorize API request
   */
  NeonProApiGateway.prototype.authorizeRequest = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var client, route, requiredPermission;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!context.clientId) {
              return [2 /*return*/, false];
            }
            return [4 /*yield*/, this.getClient(context.clientId)];
          case 1:
            client = _a.sent();
            if (!client) {
              return [2 /*return*/, false];
            }
            route = context.route;
            // Check required roles
            if (route.authentication.roles && route.authentication.roles.length > 0) {
              if (
                !context.userRoles ||
                !route.authentication.roles.some((role) => context.userRoles.includes(role))
              ) {
                return [2 /*return*/, false];
              }
            }
            // Check required permissions
            if (route.authentication.permissions && route.authentication.permissions.length > 0) {
              if (
                !context.userPermissions ||
                !route.authentication.permissions.some((perm) =>
                  context.userPermissions.includes(perm),
                )
              ) {
                return [2 /*return*/, false];
              }
            }
            requiredPermission = "".concat(route.method.toLowerCase(), ":").concat(route.path);
            if (
              !client.permissions.includes(requiredPermission) &&
              !client.permissions.includes("*")
            ) {
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
        }
      });
    });
  };
  /**
   * Generate API key for client
   */
  NeonProApiGateway.prototype.generateApiKey = function (clientId) {
    return __awaiter(this, void 0, void 0, function () {
      var client, apiKey;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getClient(clientId)];
          case 1:
            client = _a.sent();
            if (!client) {
              throw new Error("Client not found: ".concat(clientId));
            }
            apiKey = "neonpro_".concat(clientId, "_").concat(this.generateSecureToken());
            // Update client with new API key
            return [4 /*yield*/, this.updateClient(clientId, { apiKey: apiKey })];
          case 2:
            // Update client with new API key
            _a.sent();
            return [2 /*return*/, apiKey];
        }
      });
    });
  };
  /**
   * Validate API key
   */
  NeonProApiGateway.prototype.validateApiKey = function (apiKey) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, client;
      return __generator(this, function (_b) {
        for (_i = 0, _a = this.clients.values(); _i < _a.length; _i++) {
          client = _a[_i];
          if (client.apiKey === apiKey) {
            return [2 /*return*/, client];
          }
        }
        return [2 /*return*/, null];
      });
    });
  };
  // Rate Limiting
  /**
   * Check rate limit for request
   */
  NeonProApiGateway.prototype.checkRateLimit = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var key, route, rateLimit, now, windowStart, rateLimitData;
      return __generator(this, function (_a) {
        key = context.clientId || context.ipAddress;
        route = context.route;
        rateLimit = route.rateLimit || this.config.rateLimit;
        now = new Date();
        windowStart = new Date(now.getTime() - rateLimit.windowMs);
        rateLimitData = this.rateLimitStore.get(key);
        if (!rateLimitData || rateLimitData.resetTime < now) {
          rateLimitData = {
            count: 0,
            resetTime: new Date(now.getTime() + rateLimit.windowMs),
          };
        }
        if (rateLimitData.count >= rateLimit.maxRequests) {
          this.emit("rate_limit:exceeded", { context: context });
          return [2 /*return*/, false];
        }
        rateLimitData.count++;
        this.rateLimitStore.set(key, rateLimitData);
        return [2 /*return*/, true];
      });
    });
  };
  /**
   * Get rate limit status for client
   */
  NeonProApiGateway.prototype.getRateLimitStatus = function (clientId) {
    return __awaiter(this, void 0, void 0, function () {
      var rateLimitData, limit;
      return __generator(this, function (_a) {
        rateLimitData = this.rateLimitStore.get(clientId);
        limit = this.config.rateLimit.maxRequests;
        if (!rateLimitData) {
          return [
            2 /*return*/,
            {
              remaining: limit,
              resetTime: new Date(Date.now() + this.config.rateLimit.windowMs),
              limit: limit,
            },
          ];
        }
        return [
          2 /*return*/,
          {
            remaining: Math.max(0, limit - rateLimitData.count),
            resetTime: rateLimitData.resetTime,
            limit: limit,
          },
        ];
      });
    });
  };
  // Monitoring & Metrics
  /**
   * Record API request for metrics
   */
  NeonProApiGateway.prototype.recordRequest = function (context, response) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
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
        this.emit("request:end", { context: context, response: response });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Update response time metrics
   */
  NeonProApiGateway.prototype.updateResponseTimeMetrics = function (duration) {
    // Simple moving average for demonstration
    // In production, use proper percentile calculation
    this.metrics.averageResponseTime = (this.metrics.averageResponseTime + duration) / 2;
    // Approximate percentiles
    this.metrics.p95ResponseTime = Math.max(this.metrics.p95ResponseTime, duration * 0.95);
    this.metrics.p99ResponseTime = Math.max(this.metrics.p99ResponseTime, duration * 0.99);
  };
  /**
   * Get current metrics
   */
  NeonProApiGateway.prototype.getMetrics = function (period) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          __assign(__assign({}, this.metrics), { period: period || this.metrics.period }),
        ];
      });
    });
  };
  /**
   * Get health check status
   */
  NeonProApiGateway.prototype.getHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, dbCheck, cacheCheck, integrationChecks, status;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            return [4 /*yield*/, this.checkDatabaseHealth()];
          case 1:
            dbCheck = _a.sent();
            return [4 /*yield*/, this.checkCacheHealth()];
          case 2:
            cacheCheck = _a.sent();
            return [4 /*yield*/, this.checkIntegrationsHealth()];
          case 3:
            integrationChecks = _a.sent();
            status = this.determineOverallHealth(dbCheck, cacheCheck, integrationChecks);
            return [
              2 /*return*/,
              {
                status: status,
                timestamp: new Date(),
                version: this.config.version,
                uptime: Date.now() - startTime,
                checks: {
                  database: dbCheck,
                  cache: cacheCheck,
                  integrations: integrationChecks,
                },
                metrics: this.metrics,
              },
            ];
        }
      });
    });
  };
  /**
   * Check database health
   */
  NeonProApiGateway.prototype.checkDatabaseHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            // Simulate database check
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 10))];
          case 2:
            // Simulate database check
            _a.sent();
            return [
              2 /*return*/,
              {
                status: "up",
                responseTime: Date.now() - startTime,
              },
            ];
          case 3:
            error_1 = _a.sent();
            return [
              2 /*return*/,
              {
                status: "down",
                responseTime: Date.now() - startTime,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check cache health
   */
  NeonProApiGateway.prototype.checkCacheHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            if (!this.cache) return [3 /*break*/, 4];
            return [4 /*yield*/, this.cache.set("health-check", "ok", 1000)];
          case 2:
            _a.sent();
            return [4 /*yield*/, this.cache.get("health-check")];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [
              2 /*return*/,
              {
                status: "up",
                responseTime: Date.now() - startTime,
              },
            ];
          case 5:
            error_2 = _a.sent();
            return [
              2 /*return*/,
              {
                status: "down",
                responseTime: Date.now() - startTime,
                error: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check integrations health
   */
  NeonProApiGateway.prototype.checkIntegrationsHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Placeholder for integration health checks
        return [
          2 /*return*/,
          [
            {
              name: "whatsapp",
              status: "up",
              responseTime: 50,
            },
            {
              name: "google-calendar",
              status: "up",
              responseTime: 100,
            },
            {
              name: "stripe",
              status: "up",
              responseTime: 75,
            },
          ],
        ];
      });
    });
  };
  /**
   * Determine overall health status
   */
  NeonProApiGateway.prototype.determineOverallHealth = (dbCheck, cacheCheck, integrationChecks) => {
    if (dbCheck.status === "down") {
      return "unhealthy";
    }
    var downIntegrations = integrationChecks.filter((check) => check.status === "down");
    if (downIntegrations.length > integrationChecks.length / 2) {
      return "unhealthy";
    }
    if (cacheCheck.status === "down" || downIntegrations.length > 0) {
      return "degraded";
    }
    return "healthy";
  };
  // Documentation
  /**
   * Generate OpenAPI documentation
   */
  NeonProApiGateway.prototype.generateDocumentation = function () {
    return __awaiter(this, void 0, void 0, function () {
      var routes,
        paths,
        schemas,
        tags,
        _i,
        routes_1,
        route,
        pathKey,
        methodKey,
        _loop_1,
        _a,
        _b,
        tag;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [4 /*yield*/, this.listRoutes()];
          case 1:
            routes = _c.sent();
            paths = {};
            schemas = {};
            tags = [];
            // Process routes
            for (_i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
              route = routes_1[_i];
              pathKey = route.path;
              methodKey = route.method.toLowerCase();
              if (!paths[pathKey]) {
                paths[pathKey] = {};
              }
              paths[pathKey][methodKey] = {
                summary: route.documentation.summary,
                description: route.documentation.description,
                tags: route.documentation.tags,
                parameters: route.documentation.parameters,
                responses: this.formatResponses(route.documentation.responses),
                security: route.authentication.required ? [{ ApiKeyAuth: [] }] : [],
              };
              _loop_1 = (tag) => {
                if (!tags.find((t) => t.name === tag)) {
                  tags.push({ name: tag, description: "".concat(tag, " operations") });
                }
              };
              // Collect unique tags
              for (_a = 0, _b = route.documentation.tags; _a < _b.length; _a++) {
                tag = _b[_a];
                _loop_1(tag);
              }
            }
            return [
              2 /*return*/,
              {
                openapi: "3.0.3",
                info: {
                  title: "NeonPro API",
                  description: "API Gateway for NeonPro Healthcare Management System",
                  version: this.config.version,
                  contact: {
                    name: "NeonPro Support",
                    email: "support@neonpro.com.br",
                    url: "https://neonpro.com.br",
                  },
                  license: {
                    name: "MIT",
                    url: "https://opensource.org/licenses/MIT",
                  },
                },
                servers: [
                  {
                    url: this.config.baseUrl,
                    description: "".concat(this.config.environment, " server"),
                  },
                ],
                paths: paths,
                components: {
                  schemas: schemas,
                  securitySchemes: {
                    ApiKeyAuth: {
                      type: "apiKey",
                      in: "header",
                      name: "X-API-Key",
                    },
                  },
                  parameters: {},
                  responses: {},
                  examples: {},
                },
                security: [],
                tags: tags,
              },
            ];
        }
      });
    });
  };
  /**
   * Format responses for OpenAPI
   */
  NeonProApiGateway.prototype.formatResponses = (responses) => {
    var formatted = {};
    for (var _i = 0, responses_1 = responses; _i < responses_1.length; _i++) {
      var response = responses_1[_i];
      formatted[response.statusCode.toString()] = {
        description: response.description,
        content: response.schema
          ? {
              "application/json": {
                schema: response.schema,
              },
            }
          : undefined,
      };
    }
    return formatted;
  };
  /**
   * Get cached documentation
   */
  NeonProApiGateway.prototype.getDocumentation = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, cached, documentation;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cacheKey = "api-documentation";
            if (!this.cache) return [3 /*break*/, 2];
            return [4 /*yield*/, this.cache.get(cacheKey)];
          case 1:
            cached = _a.sent();
            if (cached) {
              return [2 /*return*/, cached];
            }
            _a.label = 2;
          case 2:
            return [4 /*yield*/, this.generateDocumentation()];
          case 3:
            documentation = _a.sent();
            if (!this.cache) return [3 /*break*/, 5];
            return [4 /*yield*/, this.cache.set(cacheKey, documentation, 3600000)];
          case 4:
            _a.sent(); // 1 hour
            _a.label = 5;
          case 5:
            return [2 /*return*/, documentation];
        }
      });
    });
  };
  // Middleware & Plugins
  /**
   * Register middleware
   */
  NeonProApiGateway.prototype.registerMiddleware = function (middleware) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        this.middleware.set(middleware.name, middleware);
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Middleware registered", {
              name: middleware.name,
              order: middleware.order,
              enabled: middleware.enabled,
            });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Unregister middleware
   */
  NeonProApiGateway.prototype.unregisterMiddleware = function (name) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        this.middleware.delete(name);
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Middleware unregistered", { name: name });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Register plugin
   */
  NeonProApiGateway.prototype.registerPlugin = function (plugin) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        this.plugins.set(plugin.name, plugin);
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Plugin registered", {
              name: plugin.name,
              version: plugin.version,
              enabled: plugin.enabled,
            });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Unregister plugin
   */
  NeonProApiGateway.prototype.unregisterPlugin = function (name) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        this.plugins.delete(name);
        (_a = this.logger) === null || _a === void 0
          ? void 0
          : _a.info("Plugin unregistered", { name: name });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Execute middleware chain
   */
  NeonProApiGateway.prototype.executeMiddleware = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var middlewares, index, next;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            middlewares = Array.from(this.middleware.values())
              .filter((m) => m.enabled)
              .sort((a, b) => a.order - b.order);
            index = 0;
            next = () =>
              __awaiter(_this, void 0, void 0, function () {
                var middleware;
                return __generator(this, (_a) => {
                  switch (_a.label) {
                    case 0:
                      if (!(index < middlewares.length)) return [3 /*break*/, 2];
                      middleware = middlewares[index++];
                      return [4 /*yield*/, middleware.handler(context, next)];
                    case 1:
                      _a.sent();
                      _a.label = 2;
                    case 2:
                      return [2 /*return*/];
                  }
                });
              });
            return [4 /*yield*/, next()];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Event Management
  /**
   * Add event listener
   */
  NeonProApiGateway.prototype.on = function (event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  };
  /**
   * Remove event listener
   */
  NeonProApiGateway.prototype.off = function (event, listener) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      var index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
  /**
   * Emit event
   */
  NeonProApiGateway.prototype.emit = function (event, data) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        var _a;
        try {
          listener(data);
        } catch (error) {
          (_a = this.logger) === null || _a === void 0
            ? void 0
            : _a.error("Event listener error", error, { event: event });
        }
      });
    }
  };
  // Utility Methods
  /**
   * Generate unique ID
   */
  NeonProApiGateway.prototype.generateId = () =>
    "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
  /**
   * Generate secure token
   */
  NeonProApiGateway.prototype.generateSecureToken = () => {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return NeonProApiGateway;
})();
exports.NeonProApiGateway = NeonProApiGateway;
