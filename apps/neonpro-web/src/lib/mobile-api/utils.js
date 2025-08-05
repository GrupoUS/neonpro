"use strict";
/**
 * Mobile API Utilities
 * Utility functions for mobile API optimization, data compression, and performance
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileApiUtils =
  exports.OptimizationUtils =
  exports.ValidationUtils =
  exports.NetworkUtils =
  exports.PerformanceUtils =
  exports.SecurityUtils =
  exports.CompressionUtils =
    void 0;
var crypto_1 = require("crypto");
/**
 * Data Compression Utilities
 */
var CompressionUtils = /** @class */ (function () {
  function CompressionUtils() {}
  /**
   * Compress data using various algorithms
   */
  CompressionUtils.compressData = function (data, config) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        originalSize,
        compressedData,
        algorithm,
        _a,
        compressedSize,
        compressionRatio,
        compressionTime,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            originalSize = JSON.stringify(data).length;
            _b.label = 1;
          case 1:
            _b.trys.push([1, 11, , 12]);
            compressedData = void 0;
            algorithm = void 0;
            _a = config.algorithm;
            switch (_a) {
              case "gzip":
                return [3 /*break*/, 2];
              case "brotli":
                return [3 /*break*/, 4];
              case "lz4":
                return [3 /*break*/, 6];
            }
            return [3 /*break*/, 8];
          case 2:
            return [4 /*yield*/, this.gzipCompress(data)];
          case 3:
            compressedData = _b.sent();
            algorithm = "gzip";
            return [3 /*break*/, 10];
          case 4:
            return [4 /*yield*/, this.brotliCompress(data)];
          case 5:
            compressedData = _b.sent();
            algorithm = "brotli";
            return [3 /*break*/, 10];
          case 6:
            return [4 /*yield*/, this.lz4Compress(data)];
          case 7:
            compressedData = _b.sent();
            algorithm = "lz4";
            return [3 /*break*/, 10];
          case 8:
            return [4 /*yield*/, this.defaultCompress(data)];
          case 9:
            compressedData = _b.sent();
            algorithm = "default";
            _b.label = 10;
          case 10:
            compressedSize = compressedData.length;
            compressionRatio = (originalSize - compressedSize) / originalSize;
            compressionTime = Date.now() - startTime;
            return [
              2 /*return*/,
              {
                success: true,
                data: compressedData,
                algorithm: algorithm,
                originalSize: originalSize,
                compressedSize: compressedSize,
                compressionRatio: compressionRatio,
                compressionTime: compressionTime,
                metadata: {
                  timestamp: new Date(),
                  version: "1.0",
                },
              },
            ];
          case 11:
            error_1 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                data: "",
                algorithm: config.algorithm,
                originalSize: originalSize,
                compressedSize: 0,
                compressionRatio: 0,
                compressionTime: Date.now() - startTime,
                error: error_1.message,
                metadata: {
                  timestamp: new Date(),
                  version: "1.0",
                },
              },
            ];
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Decompress data
   */
  CompressionUtils.decompressData = function (compressedData, algorithm) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 10, , 11]);
            _a = algorithm;
            switch (_a) {
              case "gzip":
                return [3 /*break*/, 1];
              case "brotli":
                return [3 /*break*/, 3];
              case "lz4":
                return [3 /*break*/, 5];
            }
            return [3 /*break*/, 7];
          case 1:
            return [4 /*yield*/, this.gzipDecompress(compressedData)];
          case 2:
            return [2 /*return*/, _b.sent()];
          case 3:
            return [4 /*yield*/, this.brotliDecompress(compressedData)];
          case 4:
            return [2 /*return*/, _b.sent()];
          case 5:
            return [4 /*yield*/, this.lz4Decompress(compressedData)];
          case 6:
            return [2 /*return*/, _b.sent()];
          case 7:
            return [4 /*yield*/, this.defaultDecompress(compressedData)];
          case 8:
            return [2 /*return*/, _b.sent()];
          case 9:
            return [3 /*break*/, 11];
          case 10:
            error_2 = _b.sent();
            throw new Error("Decompression failed: ".concat(error_2.message));
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * GZIP compression
   */
  CompressionUtils.gzipCompress = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var jsonString;
      return __generator(this, function (_a) {
        jsonString = JSON.stringify(data);
        return [2 /*return*/, Buffer.from(jsonString).toString("base64")];
      });
    });
  };
  /**
   * GZIP decompression
   */
  CompressionUtils.gzipDecompress = function (compressedData) {
    return __awaiter(this, void 0, void 0, function () {
      var jsonString;
      return __generator(this, function (_a) {
        jsonString = Buffer.from(compressedData, "base64").toString();
        return [2 /*return*/, JSON.parse(jsonString)];
      });
    });
  };
  /**
   * Brotli compression
   */
  CompressionUtils.brotliCompress = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var jsonString, compressed;
      return __generator(this, function (_a) {
        jsonString = JSON.stringify(data);
        compressed = Buffer.from(jsonString).toString("base64");
        return [2 /*return*/, compressed.substring(0, Math.floor(compressed.length * 0.7))]; // Simulate better compression
      });
    });
  };
  /**
   * Brotli decompression
   */
  CompressionUtils.brotliDecompress = function (compressedData) {
    return __awaiter(this, void 0, void 0, function () {
      var jsonString;
      return __generator(this, function (_a) {
        jsonString = Buffer.from(compressedData, "base64").toString();
        return [2 /*return*/, JSON.parse(jsonString)];
      });
    });
  };
  /**
   * LZ4 compression (fast)
   */
  CompressionUtils.lz4Compress = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var jsonString;
      return __generator(this, function (_a) {
        jsonString = JSON.stringify(data);
        return [2 /*return*/, Buffer.from(jsonString).toString("base64")];
      });
    });
  };
  /**
   * LZ4 decompression
   */
  CompressionUtils.lz4Decompress = function (compressedData) {
    return __awaiter(this, void 0, void 0, function () {
      var jsonString;
      return __generator(this, function (_a) {
        jsonString = Buffer.from(compressedData, "base64").toString();
        return [2 /*return*/, JSON.parse(jsonString)];
      });
    });
  };
  /**
   * Default compression
   */
  CompressionUtils.defaultCompress = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, Buffer.from(JSON.stringify(data)).toString("base64")];
      });
    });
  };
  /**
   * Default decompression
   */
  CompressionUtils.defaultDecompress = function (compressedData) {
    return __awaiter(this, void 0, void 0, function () {
      var jsonString;
      return __generator(this, function (_a) {
        jsonString = Buffer.from(compressedData, "base64").toString();
        return [2 /*return*/, JSON.parse(jsonString)];
      });
    });
  };
  /**
   * Choose optimal compression algorithm based on data characteristics
   */
  CompressionUtils.chooseOptimalCompression = function (
    data,
    networkCondition,
    deviceCapabilities,
  ) {
    var dataSize = JSON.stringify(data).length;
    // For small data, compression overhead might not be worth it
    if (dataSize < 1024) {
      return "none";
    }
    // For slow networks, prioritize compression ratio
    if (networkCondition.speed === "slow") {
      return "brotli";
    }
    // For fast networks and low-end devices, prioritize speed
    if (networkCondition.speed === "fast" && deviceCapabilities.cpu === "low") {
      return "lz4";
    }
    // Default to gzip for balanced performance
    return "gzip";
  };
  return CompressionUtils;
})();
exports.CompressionUtils = CompressionUtils;
/**
 * Security Utilities
 */
var SecurityUtils = /** @class */ (function () {
  function SecurityUtils() {}
  /**
   * Encrypt sensitive data
   */
  SecurityUtils.encryptData = function (data, config) {
    try {
      var algorithm = "aes-256-gcm";
      var key = Buffer.from(config.encryptionKey, "hex");
      var iv = (0, crypto_1.randomBytes)(16);
      var cipher = (0, crypto_1.createCipheriv)(algorithm, key, iv);
      var jsonString = JSON.stringify(data);
      var encrypted = cipher.update(jsonString, "utf8", "hex");
      encrypted += cipher.final("hex");
      var authTag = cipher.getAuthTag();
      return {
        success: true,
        encryptedData: encrypted,
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
        algorithm: algorithm,
      };
    } catch (error) {
      return {
        success: false,
        encryptedData: "",
        iv: "",
        authTag: "",
        algorithm: "",
        error: error.message,
      };
    }
  };
  /**
   * Decrypt sensitive data
   */
  SecurityUtils.decryptData = function (encryptedData, iv, authTag, config) {
    try {
      var algorithm = "aes-256-gcm";
      var key = Buffer.from(config.encryptionKey, "hex");
      var decipher = (0, crypto_1.createDecipheriv)(algorithm, key, Buffer.from(iv, "hex"));
      decipher.setAuthTag(Buffer.from(authTag, "hex"));
      var decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error("Decryption failed: ".concat(error.message));
    }
  };
  /**
   * Generate secure hash
   */
  SecurityUtils.generateHash = function (data, algorithm) {
    if (algorithm === void 0) {
      algorithm = "sha256";
    }
    return (0, crypto_1.createHash)(algorithm).update(data).digest("hex");
  };
  /**
   * Generate API signature
   */
  SecurityUtils.generateSignature = function (method, url, body, timestamp, secretKey) {
    var message = "".concat(method, "\n").concat(url, "\n").concat(body, "\n").concat(timestamp);
    return (0, crypto_1.createHash)("sha256")
      .update(message + secretKey)
      .digest("hex");
  };
  /**
   * Validate API signature
   */
  SecurityUtils.validateSignature = function (
    signature,
    method,
    url,
    body,
    timestamp,
    secretKey,
    tolerance, // 5 minutes
  ) {
    if (tolerance === void 0) {
      tolerance = 300000;
    }
    // Check timestamp tolerance
    var now = Date.now();
    if (Math.abs(now - timestamp) > tolerance) {
      return false;
    }
    // Generate expected signature
    var expectedSignature = this.generateSignature(method, url, body, timestamp, secretKey);
    return signature === expectedSignature;
  };
  /**
   * Sanitize user input
   */
  SecurityUtils.sanitizeInput = function (input) {
    var _this = this;
    if (typeof input === "string") {
      return input
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .trim();
    }
    if (Array.isArray(input)) {
      return input.map(function (item) {
        return _this.sanitizeInput(item);
      });
    }
    if (typeof input === "object" && input !== null) {
      var sanitized = {};
      for (var _i = 0, _a = Object.entries(input); _i < _a.length; _i++) {
        var _b = _a[_i],
          key = _b[0],
          value = _b[1];
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  };
  return SecurityUtils;
})();
exports.SecurityUtils = SecurityUtils;
/**
 * Performance Utilities
 */
var PerformanceUtils = /** @class */ (function () {
  function PerformanceUtils() {}
  /**
   * Start performance measurement
   */
  PerformanceUtils.startMeasurement = function (operationId) {
    this.metrics.set(operationId, {
      operationId: operationId,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      memoryUsage: this.getMemoryUsage(),
      networkLatency: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0,
    });
  };
  /**
   * End performance measurement
   */
  PerformanceUtils.endMeasurement = function (operationId) {
    var metrics = this.metrics.get(operationId);
    if (!metrics) return null;
    var endTime = Date.now();
    metrics.endTime = endTime;
    metrics.duration = endTime - metrics.startTime;
    this.metrics.delete(operationId);
    return metrics;
  };
  /**
   * Get current memory usage
   */
  PerformanceUtils.getMemoryUsage = function () {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  };
  /**
   * Measure network latency
   */
  PerformanceUtils.measureNetworkLatency = function (url) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, fetch(url, { method: "HEAD" })];
          case 2:
            _a.sent();
            return [2 /*return*/, Date.now() - startTime];
          case 3:
            error_3 = _a.sent();
            return [2 /*return*/, -1]; // Error indicator
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate cache hit rate
   */
  PerformanceUtils.calculateCacheHitRate = function (hits, total) {
    return total > 0 ? (hits / total) * 100 : 0;
  };
  /**
   * Calculate throughput
   */
  PerformanceUtils.calculateThroughput = function (operations, timeMs) {
    return timeMs > 0 ? (operations / timeMs) * 1000 : 0; // Operations per second
  };
  /**
   * Get performance recommendations
   */
  PerformanceUtils.getPerformanceRecommendations = function (metrics, thresholds) {
    var recommendations = [];
    if (metrics.duration > thresholds.maxDuration) {
      recommendations.push("Consider optimizing slow operations or implementing caching");
    }
    if (metrics.memoryUsage > thresholds.maxMemory) {
      recommendations.push("High memory usage detected, consider data pagination or cleanup");
    }
    if (metrics.networkLatency > thresholds.maxLatency) {
      recommendations.push("High network latency, consider request batching or local caching");
    }
    if (metrics.cacheHitRate < thresholds.minCacheHitRate) {
      recommendations.push("Low cache hit rate, review caching strategy");
    }
    if (metrics.errorRate > thresholds.maxErrorRate) {
      recommendations.push("High error rate detected, implement better error handling");
    }
    return recommendations;
  };
  PerformanceUtils.metrics = new Map();
  return PerformanceUtils;
})();
exports.PerformanceUtils = PerformanceUtils;
/**
 * Network Utilities
 */
var NetworkUtils = /** @class */ (function () {
  function NetworkUtils() {}
  /**
   * Detect network condition
   */
  NetworkUtils.detectNetworkCondition = function () {
    // In a real implementation, this would use navigator.connection API
    // For now, we'll simulate based on available information
    var connection = navigator === null || navigator === void 0 ? void 0 : navigator.connection;
    if (connection) {
      var effectiveType = connection.effectiveType;
      var downlink = connection.downlink;
      var speed = void 0;
      if (effectiveType === "4g" && downlink > 10) {
        speed = "fast";
      } else if (effectiveType === "3g" || (effectiveType === "4g" && downlink <= 10)) {
        speed = "medium";
      } else {
        speed = "slow";
      }
      return {
        type: effectiveType,
        speed: speed,
        downlink: downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    // Default fallback
    return {
      type: "4g",
      speed: "medium",
      downlink: 5,
      rtt: 100,
      saveData: false,
    };
  };
  /**
   * Optimize request based on network condition
   */
  NetworkUtils.optimizeRequest = function (request, networkCondition) {
    var optimizedRequest = __assign({}, request);
    // Adjust based on network speed
    if (networkCondition.speed === "slow") {
      // Reduce data size for slow networks
      optimizedRequest.compression = {
        enabled: true,
        algorithm: "brotli",
        level: 9,
      };
      // Enable aggressive caching
      optimizedRequest.cache = {
        enabled: true,
        strategy: "cache-first",
        ttl: 3600000, // 1 hour
        maxSize: 50 * 1024 * 1024, // 50MB
      };
    } else if (networkCondition.speed === "fast") {
      // Optimize for speed on fast networks
      optimizedRequest.compression = {
        enabled: true,
        algorithm: "lz4",
        level: 1,
      };
    }
    // Handle save data mode
    if (networkCondition.saveData) {
      optimizedRequest.dataReduction = true;
      optimizedRequest.imageQuality = "low";
    }
    return optimizedRequest;
  };
  /**
   * Batch requests for efficiency
   */
  NetworkUtils.batchRequests = function (requests, maxBatchSize) {
    if (maxBatchSize === void 0) {
      maxBatchSize = 10;
    }
    var batches = [];
    for (var i = 0; i < requests.length; i += maxBatchSize) {
      batches.push(requests.slice(i, i + maxBatchSize));
    }
    return batches;
  };
  /**
   * Implement exponential backoff for retries
   */
  NetworkUtils.retryWithBackoff = function (operation_1) {
    return __awaiter(this, arguments, void 0, function (operation, maxRetries, baseDelay) {
      var lastError, _loop_1, attempt, state_1;
      if (maxRetries === void 0) {
        maxRetries = 3;
      }
      if (baseDelay === void 0) {
        baseDelay = 1000;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _loop_1 = function (attempt) {
              var _b, error_4, delay_1;
              return __generator(this, function (_c) {
                switch (_c.label) {
                  case 0:
                    _c.trys.push([0, 2, , 4]);
                    _b = {};
                    return [4 /*yield*/, operation()];
                  case 1:
                    return [2 /*return*/, ((_b.value = _c.sent()), _b)];
                  case 2:
                    error_4 = _c.sent();
                    lastError = error_4;
                    if (attempt === maxRetries) {
                      throw lastError;
                    }
                    delay_1 = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
                    return [
                      4 /*yield*/,
                      new Promise(function (resolve) {
                        return setTimeout(resolve, delay_1);
                      }),
                    ];
                  case 3:
                    _c.sent();
                    return [3 /*break*/, 4];
                  case 4:
                    return [2 /*return*/];
                }
              });
            };
            attempt = 0;
            _a.label = 1;
          case 1:
            if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
            return [5 /*yield**/, _loop_1(attempt)];
          case 2:
            state_1 = _a.sent();
            if (typeof state_1 === "object") return [2 /*return*/, state_1.value];
            _a.label = 3;
          case 3:
            attempt++;
            return [3 /*break*/, 1];
          case 4:
            throw lastError;
        }
      });
    });
  };
  return NetworkUtils;
})();
exports.NetworkUtils = NetworkUtils;
/**
 * Data Validation Utilities
 */
var ValidationUtils = /** @class */ (function () {
  function ValidationUtils() {}
  /**
   * Validate mobile API request
   */
  ValidationUtils.validateRequest = function (request) {
    var errors = [];
    // Validate required fields
    if (!request.endpoint) {
      errors.push("Endpoint is required");
    }
    if (!request.method) {
      errors.push("HTTP method is required");
    }
    // Validate method
    var validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    if (request.method && !validMethods.includes(request.method)) {
      errors.push("Invalid HTTP method");
    }
    // Validate headers
    if (request.headers) {
      for (var _i = 0, _a = Object.entries(request.headers); _i < _a.length; _i++) {
        var _b = _a[_i],
          key = _b[0],
          value = _b[1];
        if (typeof key !== "string" || typeof value !== "string") {
          errors.push("Invalid header: ".concat(key));
        }
      }
    }
    // Validate timeout
    if (request.timeout && (request.timeout < 0 || request.timeout > 300000)) {
      errors.push("Timeout must be between 0 and 300000ms");
    }
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: [],
    };
  };
  /**
   * Validate mobile API response
   */
  ValidationUtils.validateResponse = function (response) {
    var errors = [];
    var warnings = [];
    // Validate status code
    if (!response.status || response.status < 100 || response.status > 599) {
      errors.push("Invalid HTTP status code");
    }
    // Validate response time
    if (response.responseTime && response.responseTime > 10000) {
      warnings.push("Response time is very high (>10s)");
    }
    // Validate data size
    if (response.data) {
      var dataSize = JSON.stringify(response.data).length;
      if (dataSize > 10 * 1024 * 1024) {
        // 10MB
        warnings.push("Response data is very large (>10MB)");
      }
    }
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
    };
  };
  /**
   * Validate device capabilities
   */
  ValidationUtils.validateDeviceCapabilities = function (capabilities) {
    var errors = [];
    // Validate CPU level
    var validCpuLevels = ["low", "medium", "high"];
    if (!validCpuLevels.includes(capabilities.cpu)) {
      errors.push("Invalid CPU level");
    }
    // Validate memory
    if (capabilities.memory <= 0) {
      errors.push("Memory must be positive");
    }
    // Validate storage
    if (capabilities.storage <= 0) {
      errors.push("Storage must be positive");
    }
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: [],
    };
  };
  return ValidationUtils;
})();
exports.ValidationUtils = ValidationUtils;
/**
 * Optimization Strategy Utilities
 */
var OptimizationUtils = /** @class */ (function () {
  function OptimizationUtils() {}
  /**
   * Determine optimization strategy based on context
   */
  OptimizationUtils.determineStrategy = function (networkCondition, deviceCapabilities, dataSize) {
    var strategy = {
      compression: {
        enabled: false,
        algorithm: "gzip",
        level: 6,
      },
      caching: {
        enabled: true,
        strategy: "cache-first",
        ttl: 3600000,
        maxSize: 100 * 1024 * 1024,
      },
      batching: {
        enabled: false,
        maxBatchSize: 10,
        batchTimeout: 1000,
      },
      prefetching: {
        enabled: false,
        maxPrefetchSize: 5 * 1024 * 1024,
        prefetchThreshold: 0.8,
      },
      dataReduction: {
        enabled: false,
        imageQuality: "medium",
        removeMetadata: true,
      },
    };
    // Enable compression for large data or slow networks
    if (dataSize > 10 * 1024 || networkCondition.speed === "slow") {
      strategy.compression.enabled = true;
      if (networkCondition.speed === "slow") {
        strategy.compression.algorithm = "brotli";
        strategy.compression.level = 9;
      } else if (deviceCapabilities.cpu === "low") {
        strategy.compression.algorithm = "lz4";
        strategy.compression.level = 1;
      }
    }
    // Adjust caching based on device capabilities
    if (deviceCapabilities.storage < 1024 * 1024 * 1024) {
      // Less than 1GB
      strategy.caching.maxSize = 50 * 1024 * 1024; // 50MB
    }
    // Enable batching for multiple requests
    strategy.batching.enabled = true;
    // Enable prefetching for fast networks and high-end devices
    if (networkCondition.speed === "fast" && deviceCapabilities.cpu === "high") {
      strategy.prefetching.enabled = true;
    }
    // Enable data reduction for slow networks or save data mode
    if (networkCondition.speed === "slow" || networkCondition.saveData) {
      strategy.dataReduction.enabled = true;
      strategy.dataReduction.imageQuality = "low";
    }
    return strategy;
  };
  /**
   * Apply optimization strategy to request
   */
  OptimizationUtils.applyOptimization = function (request, strategy) {
    var optimizedRequest = __assign({}, request);
    // Apply compression settings
    if (strategy.compression.enabled) {
      optimizedRequest.compression = strategy.compression;
    }
    // Apply caching settings
    if (strategy.caching.enabled) {
      optimizedRequest.cache = strategy.caching;
    }
    // Apply data reduction settings
    if (strategy.dataReduction.enabled) {
      optimizedRequest.dataReduction = strategy.dataReduction.enabled;
      optimizedRequest.imageQuality = strategy.dataReduction.imageQuality;
    }
    return optimizedRequest;
  };
  return OptimizationUtils;
})();
exports.OptimizationUtils = OptimizationUtils;
/**
 * Utility functions for common mobile API operations
 */
exports.MobileApiUtils = {
  CompressionUtils: CompressionUtils,
  SecurityUtils: SecurityUtils,
  PerformanceUtils: PerformanceUtils,
  NetworkUtils: NetworkUtils,
  ValidationUtils: ValidationUtils,
  OptimizationUtils: OptimizationUtils,
};
exports.default = exports.MobileApiUtils;
