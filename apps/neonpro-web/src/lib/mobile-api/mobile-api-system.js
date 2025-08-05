/**
 * Mobile API System - Core Implementation
 * Story 7.4: Mobile App API Support
 *
 * Comprehensive mobile API system with:
 * - Mobile-optimized authentication
 * - Offline synchronization
 * - Intelligent caching
 * - Data compression
 * - Push notifications
 * - Performance optimization
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
exports.mobileApiSystem = exports.MobileApiSystemImpl = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var cache_manager_1 = require("./cache-manager");
var offline_sync_1 = require("./offline-sync");
var push_manager_1 = require("./push-manager");
var compression_utils_1 = require("./compression-utils");
var security_utils_1 = require("./security-utils");
var MobileApiSystemImpl = /** @class */ (() => {
  function MobileApiSystemImpl() {
    this.eventHandlers = {};
    this.networkStatus = "online";
    this.isInitialized = false;
    this.currentUser = null;
    this.currentClinic = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = 0;
    // Initialize with default config
    this.config = this.getDefaultConfig();
    // Initialize network status monitoring
    this.initializeNetworkMonitoring();
  }
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  MobileApiSystemImpl.prototype.initialize = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.config = __assign(__assign({}, this.getDefaultConfig()), config);
            // Initialize Supabase client
            this.supabase = (0, supabase_js_1.createClient)(
              process.env.SUPABASE_URL,
              process.env.SUPABASE_ANON_KEY,
              {
                auth: {
                  persistSession: true,
                  autoRefreshToken: true,
                  detectSessionInUrl: false,
                },
                realtime: {
                  params: {
                    eventsPerSecond: 10,
                  },
                },
              },
            );
            // Initialize subsystems
            this.cache = new cache_manager_1.MobileCache(this.config.cache);
            this.offlineSync = new offline_sync_1.OfflineSync(this.supabase, this.config.offline);
            this.pushManager = new push_manager_1.PushManager(this.config.push);
            this.compressionUtils = new compression_utils_1.CompressionUtils(
              this.config.compression,
            );
            this.securityUtils = new security_utils_1.SecurityUtils(this.config.security);
            // Initialize subsystems
            return [
              4 /*yield*/,
              Promise.all([
                this.cache.initialize(),
                this.offlineSync.initialize(),
                this.pushManager.initialize(),
                this.compressionUtils.initialize(),
                this.securityUtils.initialize(),
              ]),
              // Setup event listeners
            ];
          case 1:
            // Initialize subsystems
            _a.sent();
            // Setup event listeners
            this.setupEventListeners();
            // Start background processes
            this.startBackgroundProcesses();
            this.isInitialized = true;
            console.log("Mobile API System initialized successfully");
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Failed to initialize Mobile API System:", error_1);
            throw new Error("Mobile API initialization failed: ".concat(error_1));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.getDefaultConfig = () => ({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    version: "2.0",
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    compression: {
      level: "medium",
      algorithm: "gzip",
      threshold: 1024,
      mimeTypes: ["application/json", "text/plain"],
      excludePatterns: ["image/*", "video/*"],
    },
    cache: {
      strategy: "cache-first",
      ttl: 300,
      maxSize: 50 * 1024 * 1024,
      maxEntries: 10000,
      compression: true,
      encryption: false,
      persistToDisk: true,
      syncOnReconnect: true,
    },
    offline: {
      enabled: true,
      maxStorageSize: 100 * 1024 * 1024,
      syncInterval: 60,
      conflictResolution: "timestamp",
      autoSync: true,
      syncOnReconnect: true,
      backgroundSync: true,
      maxRetries: 5,
      retryDelay: 5,
    },
    push: {
      enabled: true,
      maxNotifications: 100,
      grouping: true,
      persistence: true,
    },
    security: {
      encryption: true,
      tokenRefreshThreshold: 300,
      biometricTimeout: 300,
      maxFailedAttempts: 5,
      lockoutDuration: 900,
      certificatePinning: false,
      allowInsecureConnections: false,
    },
    performance: {
      imageOptimization: true,
      lazyLoading: true,
      prefetching: true,
      bundleCompression: true,
      minificationLevel: "basic",
      cachePreloading: true,
      backgroundProcessing: true,
      memoryManagement: true,
    },
  });
  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  MobileApiSystemImpl.prototype.authenticate = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 13, , 14]);
            // Validate device info
            this.validateDeviceInfo(request.deviceInfo);
            authResult = void 0;
            if (!request.refreshToken) return [3 /*break*/, 2];
            return [4 /*yield*/, this.refreshAuthentication(request.refreshToken)];
          case 1:
            // Refresh token authentication
            authResult = _a.sent();
            return [3 /*break*/, 9];
          case 2:
            if (!request.biometricData) return [3 /*break*/, 4];
            return [4 /*yield*/, this.biometricAuthentication(request)];
          case 3:
            // Biometric authentication
            authResult = _a.sent();
            return [3 /*break*/, 9];
          case 4:
            if (!(request.email && request.password)) return [3 /*break*/, 6];
            return [4 /*yield*/, this.emailPasswordAuthentication(request)];
          case 5:
            // Email/password authentication
            authResult = _a.sent();
            return [3 /*break*/, 9];
          case 6:
            if (!request.phone) return [3 /*break*/, 8];
            return [4 /*yield*/, this.phoneAuthentication(request)];
          case 7:
            // Phone authentication
            authResult = _a.sent();
            return [3 /*break*/, 9];
          case 8:
            throw new Error("Invalid authentication request");
          case 9:
            // Store authentication data
            this.currentUser = authResult.user;
            this.currentClinic = authResult.clinic;
            this.accessToken = authResult.accessToken;
            this.refreshToken = authResult.refreshToken;
            this.tokenExpiresAt = Date.now() + authResult.expiresIn * 1000;
            if (!request.pushToken) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              this.pushManager.registerDevice({
                deviceId: request.deviceId,
                userId: authResult.user.id,
                clinicId: authResult.clinic.id,
                token: request.pushToken,
                platform: request.deviceInfo.platform,
                isActive: true,
                preferences: authResult.user.preferences.notifications,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastUsed: new Date(),
              }),
            ];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            // Initialize offline sync for user
            return [
              4 /*yield*/,
              this.offlineSync.initializeForUser(authResult.user.id, authResult.clinic.id),
              // Trigger initial sync if online
            ];
          case 12:
            // Initialize offline sync for user
            _a.sent();
            // Trigger initial sync if online
            if (this.networkStatus === "online" && this.config.offline.autoSync) {
              this.sync({ priority: "normal" }).catch(console.error);
            }
            return [2 /*return*/, authResult];
          case 13:
            error_2 = _a.sent();
            console.error("Authentication failed:", error_2);
            throw this.createApiError(
              "AUTH_FAILED",
              "Authentication failed: ".concat(error_2),
              true,
            );
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.emailPasswordAuthentication = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.auth.signInWithPassword({
                email: request.email,
                password: request.password,
              }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error(error.message);
            }
            return [2 /*return*/, this.buildAuthResponse(data, request.deviceInfo)];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.phoneAuthentication = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implement phone authentication logic
        throw new Error("Phone authentication not implemented yet");
      });
    });
  };
  MobileApiSystemImpl.prototype.biometricAuthentication = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var isValid, credentials;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.securityUtils.validateBiometricData(request.biometricData, request.deviceId),
            ];
          case 1:
            isValid = _a.sent();
            if (!isValid) {
              throw new Error("Invalid biometric data");
            }
            return [4 /*yield*/, this.securityUtils.getStoredCredentials(request.deviceId)];
          case 2:
            credentials = _a.sent();
            if (!credentials) {
              throw new Error("No stored credentials found for device");
            }
            // Authenticate with stored credentials
            return [
              2 /*return*/,
              this.emailPasswordAuthentication(
                __assign(__assign({}, request), {
                  email: credentials.email,
                  password: credentials.password,
                }),
              ),
            ];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.refreshAuthentication = function (refreshToken) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.auth.refreshSession({
                refresh_token: refreshToken,
              }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error(error.message);
            }
            return [2 /*return*/, this.buildAuthResponse(data, this.getCurrentDeviceInfo())];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.buildAuthResponse = function (authData, deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      var userProfile, clinicData, mobileUser, mobileClinic;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("profiles")
                .select("*")
                .eq("id", authData.user.id)
                .single(),
              // Fetch clinic data
            ];
          case 1:
            userProfile = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("clinics")
                .select("*")
                .eq("id", userProfile.clinic_id)
                .single(),
              // Build mobile user object
            ];
          case 2:
            clinicData = _a.sent().data;
            mobileUser = {
              id: authData.user.id,
              email: authData.user.email,
              name: userProfile.name,
              avatar: userProfile.avatar_url,
              role: userProfile.role,
              clinicId: userProfile.clinic_id,
              preferences: this.buildUserPreferences(userProfile),
              lastLoginAt: new Date(),
              isActive: true,
            };
            mobileClinic = {
              id: clinicData.id,
              name: clinicData.name,
              logo: clinicData.logo_url,
              address: clinicData.address,
              phone: clinicData.phone,
              email: clinicData.email,
              website: clinicData.website,
              timezone: clinicData.timezone,
              businessHours: clinicData.business_hours || [],
              features: clinicData.features || [],
              subscription: clinicData.subscription || {},
              branding: clinicData.branding || {},
            };
            return [
              2 /*return*/,
              {
                accessToken: authData.session.access_token,
                refreshToken: authData.session.refresh_token,
                expiresIn: authData.session.expires_in,
                user: mobileUser,
                clinic: mobileClinic,
                permissions: userProfile.permissions || [],
                features: clinicData.features || [],
                syncTimestamp: Date.now(),
              },
            ];
        }
      });
    });
  };
  // ============================================================================
  // API REQUESTS
  // ============================================================================
  MobileApiSystemImpl.prototype.request = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, requestId, cachedResponse, response, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            requestId = this.generateRequestId();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, , 9]);
            // Validate authentication
            return [
              4 /*yield*/,
              this.ensureAuthenticated(),
              // Check cache first if strategy allows
            ];
          case 2:
            // Validate authentication
            _a.sent();
            if (!this.shouldCheckCache(request)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.cache.get(this.buildCacheKey(request))];
          case 3:
            cachedResponse = _a.sent();
            if (cachedResponse) {
              return [
                2 /*return*/,
                this.buildResponse(cachedResponse.data, {
                  requestId: requestId,
                  timestamp: Date.now(),
                  processingTime: Date.now() - startTime,
                  source: "cache",
                  version: this.config.version,
                  cacheInfo: {
                    hit: true,
                    age: Date.now() - cachedResponse.createdAt,
                    ttl: cachedResponse.expiresAt - Date.now(),
                    key: this.buildCacheKey(request),
                    strategy: request.cacheStrategy || this.config.cache.strategy,
                  },
                }),
              ];
            }
            _a.label = 4;
          case 4:
            // Handle offline mode
            if (this.networkStatus === "offline") {
              if (request.offlineFallback) {
                return [2 /*return*/, this.handleOfflineRequest(request, requestId, startTime)];
              } else {
                throw this.createApiError(
                  "OFFLINE",
                  "Device is offline and no offline fallback available",
                  true,
                );
              }
            }
            return [
              4 /*yield*/,
              this.makeNetworkRequest(request, requestId, startTime),
              // Cache response if successful
            ];
          case 5:
            response = _a.sent();
            if (!(response.success && this.shouldCacheResponse(request, response)))
              return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.cache.set(this.buildCacheKey(request), {
                key: this.buildCacheKey(request),
                data: response.data,
                metadata: {
                  version: this.config.version,
                  contentType: "application/json",
                  source: "network",
                  priority: request.priority,
                  tags: [request.endpoint, request.method],
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
                accessedAt: Date.now(),
                expiresAt: Date.now() + this.config.cache.ttl * 1000,
                size: JSON.stringify(response.data).length,
                compressed: false,
                encrypted: false,
              }),
            ];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            return [2 /*return*/, response];
          case 8:
            error_3 = _a.sent();
            console.error("API request failed:", error_3);
            // Try offline fallback if available
            if (request.offlineFallback && this.networkStatus !== "online") {
              return [2 /*return*/, this.handleOfflineRequest(request, requestId, startTime)];
            }
            throw error_3;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.makeNetworkRequest = function (request, requestId, startTime) {
    return __awaiter(this, void 0, void 0, function () {
      var url,
        headers,
        body,
        compressionResult,
        compressed,
        fetchOptions,
        response,
        responseData,
        contentEncoding,
        decompressed;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            url = "".concat(this.config.baseUrl).concat(request.endpoint);
            headers = __assign(
              {
                "Content-Type": "application/json",
                Authorization: "Bearer ".concat(this.accessToken),
                "X-Request-ID": requestId,
                "X-Client-Version": this.config.version,
                "X-Device-Platform": request.deviceInfo.platform,
              },
              request.headers,
            );
            body = request.body;
            if (!(body && this.shouldCompressRequest(request))) return [3 /*break*/, 2];
            return [4 /*yield*/, this.compressionUtils.compress(JSON.stringify(body))];
          case 1:
            compressed = _a.sent();
            if (compressed.success) {
              body = compressed.data;
              headers["Content-Encoding"] = compressed.algorithm;
              compressionResult = compressed;
            }
            _a.label = 2;
          case 2:
            fetchOptions = {
              method: request.method,
              headers: headers,
              body: body ? JSON.stringify(body) : undefined,
              signal: AbortSignal.timeout(request.timeout || this.config.timeout),
            };
            return [4 /*yield*/, fetch(url, fetchOptions)];
          case 3:
            response = _a.sent();
            if (!response.ok) {
              throw this.createApiError(
                "HTTP_".concat(response.status),
                "HTTP ".concat(response.status, ": ").concat(response.statusText),
                response.status >= 500,
              );
            }
            return [
              4 /*yield*/,
              response.json(),
              // Decompress response if needed
            ];
          case 4:
            responseData = _a.sent();
            contentEncoding = response.headers.get("Content-Encoding");
            if (!(contentEncoding && this.compressionUtils.isSupported(contentEncoding)))
              return [3 /*break*/, 6];
            return [4 /*yield*/, this.compressionUtils.decompress(responseData, contentEncoding)];
          case 5:
            decompressed = _a.sent();
            if (decompressed.success) {
              responseData = JSON.parse(decompressed.data);
            }
            _a.label = 6;
          case 6:
            return [
              2 /*return*/,
              this.buildResponse(responseData, {
                requestId: requestId,
                timestamp: Date.now(),
                processingTime: Date.now() - startTime,
                source: "network",
                version: this.config.version,
                compression: compressionResult,
              }),
            ];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.handleOfflineRequest = function (request, requestId, startTime) {
    return __awaiter(this, void 0, void 0, function () {
      var offlineData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.offlineSync.getOfflineData(request.endpoint, request.params)];
          case 1:
            offlineData = _a.sent();
            if (offlineData) {
              return [
                2 /*return*/,
                this.buildResponse(offlineData, {
                  requestId: requestId,
                  timestamp: Date.now(),
                  processingTime: Date.now() - startTime,
                  source: "offline",
                  version: this.config.version,
                }),
              ];
            }
            if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method))
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.offlineSync.queueOperation({
                id: requestId,
                type: this.mapMethodToOperationType(request.method),
                entity: this.extractEntityFromEndpoint(request.endpoint),
                entityId: this.extractEntityIdFromRequest(request),
                data: request.body,
                timestamp: Date.now(),
                status: "pending",
                retryCount: 0,
                priority: request.priority,
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            throw this.createApiError(
              "OFFLINE_NO_DATA",
              "No offline data available for this request",
              true,
            );
        }
      });
    });
  };
  // ============================================================================
  // SYNCHRONIZATION
  // ============================================================================
  MobileApiSystemImpl.prototype.sync = function () {
    return __awaiter(this, arguments, void 0, function (options) {
      var result, error_4, errorResult;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this.isInitialized) {
              throw new Error("Mobile API System not initialized");
            }
            if (!this.currentUser) {
              throw new Error("User not authenticated");
            }
            if (this.networkStatus === "offline") {
              throw new Error("Cannot sync while offline");
            }
            this.emitEvent("onSyncStart", {
              id: "sync-" + Date.now(),
              operations: [],
              timestamp: Date.now(),
              status: "syncing",
              totalOperations: 0,
              successfulOperations: 0,
              failedOperations: 0,
              conflictOperations: 0,
            });
            return [
              4 /*yield*/,
              this.offlineSync.performSync(
                __assign({ userId: this.currentUser.id, clinicId: this.currentClinic.id }, options),
              ),
            ];
          case 1:
            result = _a.sent();
            this.emitEvent("onSyncComplete", result);
            return [2 /*return*/, result];
          case 2:
            error_4 = _a.sent();
            console.error("Sync failed:", error_4);
            errorResult = {
              success: false,
              operations: [],
              conflicts: [],
              errors: [this.createApiError("SYNC_FAILED", "Sync failed: ".concat(error_4), true)],
              statistics: {
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 0,
                conflictOperations: 0,
                bytesTransferred: 0,
                compressionRatio: 0,
              },
              duration: 0,
            };
            this.emitEvent("onSyncComplete", errorResult);
            return [2 /*return*/, errorResult];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // PUSH NOTIFICATIONS
  // ============================================================================
  MobileApiSystemImpl.prototype.sendPushNotification = function (notification, targets) {
    return __awaiter(this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this.isInitialized) {
              throw new Error("Mobile API System not initialized");
            }
            return [4 /*yield*/, this.pushManager.sendNotification(notification, targets)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_5 = _a.sent();
            console.error("Push notification failed:", error_5);
            return [
              2 /*return*/,
              {
                success: false,
                delivered: 0,
                failed: targets.length,
                errors: [
                  this.createApiError(
                    "PUSH_FAILED",
                    "Push notification failed: ".concat(error_5),
                    true,
                  ),
                ],
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================
  MobileApiSystemImpl.prototype.getOfflineData = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.isInitialized) {
              throw new Error("Mobile API System not initialized");
            }
            return [4 /*yield*/, this.offlineSync.getOfflineStorage()];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.clearCache = function (pattern) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.isInitialized) {
              throw new Error("Mobile API System not initialized");
            }
            return [4 /*yield*/, this.cache.clear(pattern)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // SYSTEM STATUS
  // ============================================================================
  MobileApiSystemImpl.prototype.getSystemStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cacheStats, syncStatus, storageUsage, performanceMetrics;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.cache.getStats()];
          case 1:
            cacheStats = _a.sent();
            return [4 /*yield*/, this.offlineSync.getStatus()];
          case 2:
            syncStatus = _a.sent();
            return [4 /*yield*/, this.getStorageUsage()];
          case 3:
            storageUsage = _a.sent();
            return [4 /*yield*/, this.getPerformanceMetrics()];
          case 4:
            performanceMetrics = _a.sent();
            return [
              2 /*return*/,
              {
                online: this.networkStatus === "online",
                apiVersion: this.config.version,
                serverTime: Date.now(), // This should be fetched from server
                clientTime: Date.now(),
                timeDrift: 0, // Calculate actual drift
                latency: 0, // Calculate actual latency
                cacheStats: cacheStats,
                syncStatus: syncStatus,
                storageUsage: storageUsage,
                performance: performanceMetrics,
              },
            ];
        }
      });
    });
  };
  // ============================================================================
  // CLEANUP
  // ============================================================================
  MobileApiSystemImpl.prototype.destroy = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Stop background processes
            this.stopBackgroundProcesses();
            // Cleanup subsystems
            return [
              4 /*yield*/,
              Promise.all([
                this.cache.destroy(),
                this.offlineSync.destroy(),
                this.pushManager.destroy(),
                this.compressionUtils.destroy(),
                this.securityUtils.destroy(),
              ]),
              // Clear authentication data
            ];
          case 1:
            // Cleanup subsystems
            _a.sent();
            // Clear authentication data
            this.currentUser = null;
            this.currentClinic = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiresAt = 0;
            this.isInitialized = false;
            console.log("Mobile API System destroyed successfully");
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error destroying Mobile API System:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
  MobileApiSystemImpl.prototype.initializeNetworkMonitoring = function () {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.networkStatus = "online";
        this.emitEvent("onNetworkChange", "online");
        // Trigger sync when coming back online
        if (this.config.offline.syncOnReconnect && this.currentUser) {
          this.sync({ priority: "high" }).catch(console.error);
        }
      });
      window.addEventListener("offline", () => {
        this.networkStatus = "offline";
        this.emitEvent("onNetworkChange", "offline");
      });
      // Initial status
      this.networkStatus = navigator.onLine ? "online" : "offline";
    }
  };
  MobileApiSystemImpl.prototype.setupEventListeners = function () {
    // Setup internal event listeners for subsystems
    this.offlineSync.on("syncProgress", (progress, operation) => {
      this.emitEvent("onSyncProgress", progress, operation);
    });
    this.offlineSync.on("syncConflict", (conflict) => {
      this.emitEvent("onSyncConflict", conflict);
    });
    this.cache.on("cacheUpdate", (key, entry) => {
      this.emitEvent("onCacheUpdate", key, entry);
    });
    this.pushManager.on("pushReceived", (notification) => {
      this.emitEvent("onPushReceived", notification);
    });
  };
  MobileApiSystemImpl.prototype.startBackgroundProcesses = function () {
    // Start periodic sync if enabled
    if (this.config.offline.autoSync) {
      setInterval(() => {
        if (this.networkStatus === "online" && this.currentUser) {
          this.sync({ priority: "low" }).catch(console.error);
        }
      }, this.config.offline.syncInterval * 1000);
    }
    // Start cache cleanup
    setInterval(
      () => {
        this.cache.cleanup().catch(console.error);
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
    // Start token refresh monitoring
    setInterval(() => {
      this.checkTokenExpiry().catch(console.error);
    }, 60 * 1000); // Every minute
  };
  MobileApiSystemImpl.prototype.stopBackgroundProcesses = () => {
    // Background processes are handled by intervals, which will be cleared when the object is destroyed
  };
  MobileApiSystemImpl.prototype.ensureAuthenticated = function () {
    return __awaiter(this, void 0, void 0, function () {
      var refreshed, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.accessToken || !this.currentUser) {
              throw this.createApiError("UNAUTHENTICATED", "User not authenticated", false);
            }
            if (
              !(
                this.tokenExpiresAt - Date.now() <
                this.config.security.tokenRefreshThreshold * 1000
              )
            )
              return [3 /*break*/, 6];
            if (!this.refreshToken) return [3 /*break*/, 5];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, this.refreshAuthentication(this.refreshToken)];
          case 2:
            refreshed = _a.sent();
            this.accessToken = refreshed.accessToken;
            this.refreshToken = refreshed.refreshToken;
            this.tokenExpiresAt = Date.now() + refreshed.expiresIn * 1000;
            return [3 /*break*/, 4];
          case 3:
            error_7 = _a.sent();
            throw this.createApiError("TOKEN_REFRESH_FAILED", "Failed to refresh token", false);
          case 4:
            return [3 /*break*/, 6];
          case 5:
            throw this.createApiError(
              "TOKEN_EXPIRED",
              "Token expired and no refresh token available",
              false,
            );
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.checkTokenExpiry = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (
              !(
                this.accessToken &&
                this.tokenExpiresAt - Date.now() < this.config.security.tokenRefreshThreshold * 1000
              )
            )
              return [3 /*break*/, 4];
            if (!this.refreshToken) return [3 /*break*/, 4];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, this.refreshAuthentication(this.refreshToken)];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_8 = _a.sent();
            console.error("Token refresh failed:", error_8);
            this.emitEvent(
              "onError",
              this.createApiError("TOKEN_REFRESH_FAILED", "Failed to refresh token", false),
            );
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileApiSystemImpl.prototype.validateDeviceInfo = (deviceInfo) => {
    if (!deviceInfo.id || !deviceInfo.platform) {
      throw new Error("Invalid device info: id and platform are required");
    }
  };
  MobileApiSystemImpl.prototype.buildUserPreferences = (profile) => ({
    language: profile.language || "pt-BR",
    timezone: profile.timezone || "America/Sao_Paulo",
    notifications: profile.notification_preferences || {
      appointments: true,
      reminders: true,
      payments: true,
      system: true,
      marketing: false,
      sound: true,
      vibration: true,
      badge: true,
    },
    theme: profile.theme || "auto",
    dataUsage: profile.data_usage || "standard",
    offlineMode: profile.offline_mode || true,
    autoSync: profile.auto_sync || true,
    compressionLevel: profile.compression_level || "medium",
  });
  MobileApiSystemImpl.prototype.getCurrentDeviceInfo = () => {
    // This should be provided by the client application
    return {
      id: "unknown",
      platform: "web",
      version: "1.0.0",
      screenWidth: window.innerWidth || 1920,
      screenHeight: window.innerHeight || 1080,
      pixelDensity: window.devicePixelRatio || 1,
      isTablet: false,
      hasNotifications: "Notification" in window,
      hasBiometrics: false,
      hasCamera: false,
      hasLocation: "geolocation" in navigator,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
      appVersion: "1.0.0",
      buildNumber: "1",
      lastSeen: new Date(),
    };
  };
  MobileApiSystemImpl.prototype.shouldCheckCache = function (request) {
    var strategy = request.cacheStrategy || this.config.cache.strategy;
    return ["cache-first", "cache-only"].includes(strategy) && request.method === "GET";
  };
  MobileApiSystemImpl.prototype.shouldCacheResponse = (request, response) =>
    request.method === "GET" && response.success && response.data;
  MobileApiSystemImpl.prototype.shouldCompressRequest = function (request) {
    if (!request.body) return false;
    var bodySize = JSON.stringify(request.body).length;
    return bodySize >= this.config.compression.threshold;
  };
  MobileApiSystemImpl.prototype.buildCacheKey = (request) => {
    var params = request.params ? JSON.stringify(request.params) : "";
    return "".concat(request.method, ":").concat(request.endpoint, ":").concat(params);
  };
  MobileApiSystemImpl.prototype.buildResponse = (data, metadata) => ({
    success: true,
    data: data,
    metadata: metadata,
  });
  MobileApiSystemImpl.prototype.createApiError = function (code, message, retryable) {
    return {
      code: code,
      message: message,
      retryable: retryable,
      retryAfter: retryable ? this.config.retryDelay / 1000 : undefined,
    };
  };
  MobileApiSystemImpl.prototype.generateRequestId = () =>
    "req_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  MobileApiSystemImpl.prototype.mapMethodToOperationType = (method) => {
    switch (method) {
      case "POST":
        return "create";
      case "PUT":
      case "PATCH":
        return "update";
      case "DELETE":
        return "delete";
      default:
        return "update";
    }
  };
  MobileApiSystemImpl.prototype.extractEntityFromEndpoint = (endpoint) => {
    var parts = endpoint.split("/").filter(Boolean);
    return parts[0] || "unknown";
  };
  MobileApiSystemImpl.prototype.extractEntityIdFromRequest = (request) => {
    var parts = request.endpoint.split("/").filter(Boolean);
    return parts[1] || "unknown";
  };
  MobileApiSystemImpl.prototype.getStorageUsage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implement storage usage calculation
        return [
          2 /*return*/,
          {
            total: 0,
            used: 0,
            available: 0,
            percentage: 0,
            breakdown: {
              cache: 0,
              offline: 0,
              images: 0,
              documents: 0,
              other: 0,
            },
          },
        ];
      });
    });
  };
  MobileApiSystemImpl.prototype.getPerformanceMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implement performance metrics calculation
        return [
          2 /*return*/,
          {
            averageResponseTime: 0,
            cacheHitRate: 0,
            compressionRatio: 0,
            errorRate: 0,
            throughput: 0,
            memoryUsage: 0,
            cpuUsage: 0,
          },
        ];
      });
    });
  };
  MobileApiSystemImpl.prototype.emitEvent = function (eventType) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    var handler = this.eventHandlers[eventType];
    if (handler) {
      try {
        handler.apply(void 0, args);
      } catch (error) {
        console.error("Error in event handler ".concat(eventType, ":"), error);
      }
    }
  };
  // ============================================================================
  // PUBLIC EVENT MANAGEMENT
  // ============================================================================
  MobileApiSystemImpl.prototype.on = function (event, handler) {
    this.eventHandlers[event] = handler;
  };
  MobileApiSystemImpl.prototype.off = function (event) {
    delete this.eventHandlers[event];
  };
  return MobileApiSystemImpl;
})();
exports.MobileApiSystemImpl = MobileApiSystemImpl;
// Export singleton instance
exports.mobileApiSystem = new MobileApiSystemImpl();
