"use strict";
/**
 * Offline Synchronization System
 * Story 7.4: Mobile App API Support - Offline Sync
 *
 * Comprehensive offline synchronization with:
 * - Bidirectional data sync
 * - Conflict resolution
 * - Queue management
 * - Background sync
 * - Data integrity
 * - Performance optimization
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
exports.OfflineSync = void 0;
var OfflineSync = /** @class */ (function () {
  function OfflineSync(supabase, config) {
    this.operationQueue = [];
    this.conflictQueue = [];
    this.isInitialized = false;
    this.isSyncing = false;
    this.syncProgress = 0;
    this.lastSyncTimestamp = 0;
    this.userId = null;
    this.clinicId = null;
    this.eventHandlers = {};
    this.supabase = supabase;
    this.config = __assign(
      {
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
      config,
    );
    this.offlineStorage = {
      patients: [],
      appointments: [],
      treatments: [],
      payments: [],
      metadata: {
        lastSyncTimestamp: 0,
        version: "1.0.0",
        checksum: "",
        totalRecords: 0,
        storageSize: 0,
        expiresAt: 0,
      },
    };
  }
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  OfflineSync.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.config.enabled) {
              console.log("Offline sync is disabled");
              return [2 /*return*/];
            }
            // Load offline storage from local storage
            return [
              4 /*yield*/,
              this.loadOfflineStorage(),
              // Load operation queue
            ];
          case 1:
            // Load offline storage from local storage
            _a.sent();
            // Load operation queue
            return [
              4 /*yield*/,
              this.loadOperationQueue(),
              // Load conflict queue
            ];
          case 2:
            // Load operation queue
            _a.sent();
            // Load conflict queue
            return [4 /*yield*/, this.loadConflictQueue()];
          case 3:
            // Load conflict queue
            _a.sent();
            this.isInitialized = true;
            console.log("Offline Sync initialized successfully");
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to initialize Offline Sync:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  OfflineSync.prototype.initializeForUser = function (userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.userId = userId;
        this.clinicId = clinicId;
        // Start auto sync if enabled
        if (this.config.autoSync) {
          this.startAutoSync();
        }
        console.log(
          "Offline sync initialized for user ".concat(userId, " in clinic ").concat(clinicId),
        );
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================
  OfflineSync.prototype.performSync = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, result, direction, entities, batchSize, uploadResult, downloadResult, error_2;
      var _a, _b, _c, _d, _e, _f;
      return __generator(this, function (_g) {
        switch (_g.label) {
          case 0:
            startTime = Date.now();
            _g.label = 1;
          case 1:
            _g.trys.push([1, 12, 13, 14]);
            if (this.isSyncing) {
              throw new Error("Sync already in progress");
            }
            this.isSyncing = true;
            this.syncProgress = 0;
            result = {
              success: false,
              operations: [],
              conflicts: [],
              errors: [],
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
            direction = options.direction || "both";
            entities = options.entities || ["patients", "appointments", "treatments", "payments"];
            batchSize = options.batchSize || 100;
            if (!(direction === "up" || direction === "both")) return [3 /*break*/, 3];
            return [4 /*yield*/, this.uploadLocalChanges(entities, batchSize, options)];
          case 2:
            uploadResult = _g.sent();
            (_a = result.operations).push.apply(_a, uploadResult.operations);
            (_b = result.conflicts).push.apply(_b, uploadResult.conflicts);
            (_c = result.errors).push.apply(_c, uploadResult.errors);
            result.statistics.totalOperations += uploadResult.statistics.totalOperations;
            result.statistics.successfulOperations += uploadResult.statistics.successfulOperations;
            result.statistics.failedOperations += uploadResult.statistics.failedOperations;
            result.statistics.conflictOperations += uploadResult.statistics.conflictOperations;
            _g.label = 3;
          case 3:
            this.syncProgress = 50;
            this.emitEvent("syncProgress", this.syncProgress, null);
            if (!(direction === "down" || direction === "both")) return [3 /*break*/, 5];
            return [4 /*yield*/, this.downloadServerChanges(entities, batchSize, options)];
          case 4:
            downloadResult = _g.sent();
            (_d = result.operations).push.apply(_d, downloadResult.operations);
            (_e = result.conflicts).push.apply(_e, downloadResult.conflicts);
            (_f = result.errors).push.apply(_f, downloadResult.errors);
            result.statistics.totalOperations += downloadResult.statistics.totalOperations;
            result.statistics.successfulOperations +=
              downloadResult.statistics.successfulOperations;
            result.statistics.failedOperations += downloadResult.statistics.failedOperations;
            result.statistics.conflictOperations += downloadResult.statistics.conflictOperations;
            _g.label = 5;
          case 5:
            this.syncProgress = 90;
            this.emitEvent("syncProgress", this.syncProgress, null);
            if (!(result.conflicts.length > 0)) return [3 /*break*/, 7];
            return [4 /*yield*/, this.resolveConflicts(result.conflicts)];
          case 6:
            _g.sent();
            _g.label = 7;
          case 7:
            // Update sync timestamp
            this.lastSyncTimestamp = Date.now();
            return [
              4 /*yield*/,
              this.updateOfflineMetadata(),
              // Save updated storage
            ];
          case 8:
            _g.sent();
            // Save updated storage
            return [4 /*yield*/, this.saveOfflineStorage()];
          case 9:
            // Save updated storage
            _g.sent();
            return [4 /*yield*/, this.saveOperationQueue()];
          case 10:
            _g.sent();
            return [4 /*yield*/, this.saveConflictQueue()];
          case 11:
            _g.sent();
            result.success = result.errors.length === 0;
            result.duration = Date.now() - startTime;
            this.syncProgress = 100;
            console.log("Sync completed in ".concat(result.duration, "ms:"), result.statistics);
            return [2 /*return*/, result];
          case 12:
            error_2 = _g.sent();
            console.error("Sync failed:", error_2);
            throw error_2;
          case 13:
            this.isSyncing = false;
            this.syncProgress = 0;
            return [7 /*endfinally*/];
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  OfflineSync.prototype.uploadLocalChanges = function (entities, batchSize, options) {
    return __awaiter(this, void 0, void 0, function () {
      var result, pendingOps, batches, i, batch, batchResult, progress;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            result = {
              success: true,
              operations: [],
              conflicts: [],
              errors: [],
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
            pendingOps = this.operationQueue.filter(function (op) {
              return entities.includes(op.entity) && op.status === "pending";
            });
            if (pendingOps.length === 0) {
              return [2 /*return*/, result];
            }
            batches = this.chunkArray(pendingOps, batchSize);
            i = 0;
            _d.label = 1;
          case 1:
            if (!(i < batches.length)) return [3 /*break*/, 4];
            batch = batches[i];
            return [4 /*yield*/, this.processBatch(batch, "upload")];
          case 2:
            batchResult = _d.sent();
            (_a = result.operations).push.apply(_a, batchResult.operations);
            (_b = result.conflicts).push.apply(_b, batchResult.conflicts);
            (_c = result.errors).push.apply(_c, batchResult.errors);
            result.statistics.totalOperations += batchResult.statistics.totalOperations;
            result.statistics.successfulOperations += batchResult.statistics.successfulOperations;
            result.statistics.failedOperations += batchResult.statistics.failedOperations;
            result.statistics.conflictOperations += batchResult.statistics.conflictOperations;
            progress = Math.floor(((i + 1) / batches.length) * 25); // 25% of total progress
            this.syncProgress = progress;
            this.emitEvent("syncProgress", this.syncProgress, batch[0]);
            _d.label = 3;
          case 3:
            i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, result];
        }
      });
    });
  };
  OfflineSync.prototype.downloadServerChanges = function (entities, batchSize, options) {
    return __awaiter(this, void 0, void 0, function () {
      var result, _i, entities_1, entity, serverData, operations, batchResult, error_3;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            result = {
              success: true,
              operations: [],
              conflicts: [],
              errors: [],
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
            (_i = 0), (entities_1 = entities);
            _d.label = 1;
          case 1:
            if (!(_i < entities_1.length)) return [3 /*break*/, 8];
            entity = entities_1[_i];
            _d.label = 2;
          case 2:
            _d.trys.push([2, 6, , 7]);
            return [4 /*yield*/, this.fetchServerData(entity, this.lastSyncTimestamp)];
          case 3:
            serverData = _d.sent();
            if (!(serverData.length > 0)) return [3 /*break*/, 5];
            operations = this.createDownloadOperations(entity, serverData);
            return [4 /*yield*/, this.processBatch(operations, "download")];
          case 4:
            batchResult = _d.sent();
            (_a = result.operations).push.apply(_a, batchResult.operations);
            (_b = result.conflicts).push.apply(_b, batchResult.conflicts);
            (_c = result.errors).push.apply(_c, batchResult.errors);
            result.statistics.totalOperations += batchResult.statistics.totalOperations;
            result.statistics.successfulOperations += batchResult.statistics.successfulOperations;
            result.statistics.failedOperations += batchResult.statistics.failedOperations;
            result.statistics.conflictOperations += batchResult.statistics.conflictOperations;
            _d.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_3 = _d.sent();
            console.error("Failed to download ".concat(entity, ":"), error_3);
            result.errors.push({
              code: "DOWNLOAD_FAILED",
              message: "Failed to download ".concat(entity, ": ").concat(error_3),
              retryable: true,
            });
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 1];
          case 8:
            return [2 /*return*/, result];
        }
      });
    });
  };
  OfflineSync.prototype.processBatch = function (operations, direction) {
    return __awaiter(this, void 0, void 0, function () {
      var result, _i, operations_1, operation, error_4, conflict;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            result = {
              success: true,
              operations: [],
              conflicts: [],
              errors: [],
              statistics: {
                totalOperations: operations.length,
                successfulOperations: 0,
                failedOperations: 0,
                conflictOperations: 0,
                bytesTransferred: 0,
                compressionRatio: 0,
              },
              duration: 0,
            };
            (_i = 0), (operations_1 = operations);
            _a.label = 1;
          case 1:
            if (!(_i < operations_1.length)) return [3 /*break*/, 9];
            operation = operations_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 7, , 8]);
            if (!(direction === "upload")) return [3 /*break*/, 4];
            return [4 /*yield*/, this.uploadOperation(operation)];
          case 3:
            _a.sent();
            return [3 /*break*/, 6];
          case 4:
            return [4 /*yield*/, this.downloadOperation(operation)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            operation.status = "synced";
            result.operations.push(operation);
            result.statistics.successfulOperations++;
            return [3 /*break*/, 8];
          case 7:
            error_4 = _a.sent();
            if (this.isConflictError(error_4)) {
              conflict = this.createConflict(operation, error_4);
              result.conflicts.push(conflict);
              result.statistics.conflictOperations++;
              this.emitEvent("syncConflict", conflict);
            } else {
              operation.status = "failed";
              operation.lastError = error_4.message;
              operation.retryCount++;
              result.errors.push({
                code: "OPERATION_FAILED",
                message: "Operation failed: ".concat(error_4),
                retryable: operation.retryCount < this.config.maxRetries,
              });
              result.statistics.failedOperations++;
            }
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 1];
          case 9:
            return [2 /*return*/, result];
        }
      });
    });
  };
  // ============================================================================
  // OPERATION MANAGEMENT
  // ============================================================================
  OfflineSync.prototype.queueOperation = function (operation) {
    return __awaiter(this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Add to queue
            this.operationQueue.push(operation);
            // Save queue to storage
            return [4 /*yield*/, this.saveOperationQueue()];
          case 1:
            // Save queue to storage
            _a.sent();
            console.log(
              "Queued operation: "
                .concat(operation.type, " ")
                .concat(operation.entity, " ")
                .concat(operation.entityId),
            );
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Failed to queue operation:", error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  OfflineSync.prototype.uploadOperation = function (operation) {
    return __awaiter(this, void 0, void 0, function () {
      var entity, entityId, type, data, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (entity = operation.entity),
              (entityId = operation.entityId),
              (type = operation.type),
              (data = operation.data);
            _a = type;
            switch (_a) {
              case "create":
                return [3 /*break*/, 1];
              case "update":
                return [3 /*break*/, 3];
              case "delete":
                return [3 /*break*/, 5];
            }
            return [3 /*break*/, 7];
          case 1:
            return [4 /*yield*/, this.createServerRecord(entity, data)];
          case 2:
            _b.sent();
            return [3 /*break*/, 7];
          case 3:
            return [4 /*yield*/, this.updateServerRecord(entity, entityId, data)];
          case 4:
            _b.sent();
            return [3 /*break*/, 7];
          case 5:
            return [4 /*yield*/, this.deleteServerRecord(entity, entityId)];
          case 6:
            _b.sent();
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  OfflineSync.prototype.downloadOperation = function (operation) {
    return __awaiter(this, void 0, void 0, function () {
      var entity, entityId, type, data, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (entity = operation.entity),
              (entityId = operation.entityId),
              (type = operation.type),
              (data = operation.data);
            _a = type;
            switch (_a) {
              case "create":
                return [3 /*break*/, 1];
              case "update":
                return [3 /*break*/, 1];
              case "delete":
                return [3 /*break*/, 3];
            }
            return [3 /*break*/, 5];
          case 1:
            return [4 /*yield*/, this.updateLocalRecord(entity, data)];
          case 2:
            _b.sent();
            return [3 /*break*/, 5];
          case 3:
            return [4 /*yield*/, this.deleteLocalRecord(entity, entityId)];
          case 4:
            _b.sent();
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // CONFLICT RESOLUTION
  // ============================================================================
  OfflineSync.prototype.resolveConflicts = function (conflicts) {
    return __awaiter(this, void 0, void 0, function () {
      var _loop_1, this_1, _i, conflicts_1, conflict;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _loop_1 = function (conflict) {
              var resolution, index, error_6;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, this_1.resolveConflict(conflict)];
                  case 1:
                    resolution = _b.sent();
                    if (!resolution.resolution) return [3 /*break*/, 3];
                    // Apply resolution
                    return [
                      4 /*yield*/,
                      this_1.applyConflictResolution(
                        conflict,
                        resolution.resolution,
                        resolution.resolvedData,
                      ),
                      // Remove from conflict queue
                    ];
                  case 2:
                    // Apply resolution
                    _b.sent();
                    index = this_1.conflictQueue.findIndex(function (c) {
                      return c.id === conflict.id;
                    });
                    if (index > -1) {
                      this_1.conflictQueue.splice(index, 1);
                    }
                    return [3 /*break*/, 4];
                  case 3:
                    // Add to conflict queue for manual resolution
                    this_1.conflictQueue.push(conflict);
                    _b.label = 4;
                  case 4:
                    return [3 /*break*/, 6];
                  case 5:
                    error_6 = _b.sent();
                    console.error("Failed to resolve conflict:", error_6);
                    this_1.conflictQueue.push(conflict);
                    return [3 /*break*/, 6];
                  case 6:
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (conflicts_1 = conflicts);
            _a.label = 1;
          case 1:
            if (!(_i < conflicts_1.length)) return [3 /*break*/, 4];
            conflict = conflicts_1[_i];
            return [5 /*yield**/, _loop_1(conflict)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  OfflineSync.prototype.resolveConflict = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var localTimestamp, serverTimestamp;
      return __generator(this, function (_a) {
        switch (this.config.conflictResolution) {
          case "client":
            return [2 /*return*/, { resolution: "local", resolvedData: conflict.localData }];
          case "server":
            return [2 /*return*/, { resolution: "server", resolvedData: conflict.serverData }];
          case "timestamp":
            localTimestamp = conflict.localData.updated_at || conflict.localData.created_at;
            serverTimestamp = conflict.serverData.updated_at || conflict.serverData.created_at;
            if (new Date(localTimestamp) > new Date(serverTimestamp)) {
              return [2 /*return*/, { resolution: "local", resolvedData: conflict.localData }];
            } else {
              return [2 /*return*/, { resolution: "server", resolvedData: conflict.serverData }];
            }
          case "manual":
          default:
            return [2 /*return*/, {}]; // No automatic resolution
        }
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.applyConflictResolution = function (conflict, resolution, resolvedData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(resolution === "local")) return [3 /*break*/, 2];
            // Upload local data to server
            return [
              4 /*yield*/,
              this.updateServerRecord(conflict.entity, conflict.entityId, conflict.localData),
            ];
          case 1:
            // Upload local data to server
            _a.sent();
            return [3 /*break*/, 7];
          case 2:
            if (!(resolution === "server")) return [3 /*break*/, 4];
            // Update local data with server data
            return [4 /*yield*/, this.updateLocalRecord(conflict.entity, conflict.serverData)];
          case 3:
            // Update local data with server data
            _a.sent();
            return [3 /*break*/, 7];
          case 4:
            if (!(resolution === "merge")) return [3 /*break*/, 7];
            // Apply merged data to both local and server
            return [4 /*yield*/, this.updateLocalRecord(conflict.entity, resolvedData)];
          case 5:
            // Apply merged data to both local and server
            _a.sent();
            return [
              4 /*yield*/,
              this.updateServerRecord(conflict.entity, conflict.entityId, resolvedData),
            ];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // DATA OPERATIONS
  // ============================================================================
  OfflineSync.prototype.getOfflineData = function (endpoint, params) {
    return __awaiter(this, void 0, void 0, function () {
      var entity, entityId_1;
      return __generator(this, function (_a) {
        try {
          entity = this.extractEntityFromEndpoint(endpoint);
          entityId_1 = this.extractEntityIdFromEndpoint(endpoint);
          switch (entity) {
            case "patients":
              return [
                2 /*return*/,
                entityId_1
                  ? this.offlineStorage.patients.find(function (p) {
                      return p.id === entityId_1;
                    })
                  : this.filterPatients(params),
              ];
            case "appointments":
              return [
                2 /*return*/,
                entityId_1
                  ? this.offlineStorage.appointments.find(function (a) {
                      return a.id === entityId_1;
                    })
                  : this.filterAppointments(params),
              ];
            case "treatments":
              return [
                2 /*return*/,
                entityId_1
                  ? this.offlineStorage.treatments.find(function (t) {
                      return t.id === entityId_1;
                    })
                  : this.filterTreatments(params),
              ];
            case "payments":
              return [
                2 /*return*/,
                entityId_1
                  ? this.offlineStorage.payments.find(function (p) {
                      return p.id === entityId_1;
                    })
                  : this.filterPayments(params),
              ];
            default:
              return [2 /*return*/, null];
          }
        } catch (error) {
          console.error("Failed to get offline data:", error);
          return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.getOfflineStorage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, __assign({}, this.offlineStorage)];
      });
    });
  };
  OfflineSync.prototype.updateLocalRecord = function (entity, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (entity) {
          case "patients":
            this.updatePatientRecord(data);
            break;
          case "appointments":
            this.updateAppointmentRecord(data);
            break;
          case "treatments":
            this.updateTreatmentRecord(data);
            break;
          case "payments":
            this.updatePaymentRecord(data);
            break;
        }
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.deleteLocalRecord = function (entity, entityId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (entity) {
          case "patients":
            this.offlineStorage.patients = this.offlineStorage.patients.filter(function (p) {
              return p.id !== entityId;
            });
            break;
          case "appointments":
            this.offlineStorage.appointments = this.offlineStorage.appointments.filter(
              function (a) {
                return a.id !== entityId;
              },
            );
            break;
          case "treatments":
            this.offlineStorage.treatments = this.offlineStorage.treatments.filter(function (t) {
              return t.id !== entityId;
            });
            break;
          case "payments":
            this.offlineStorage.payments = this.offlineStorage.payments.filter(function (p) {
              return p.id !== entityId;
            });
            break;
        }
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // SERVER OPERATIONS
  // ============================================================================
  OfflineSync.prototype.fetchServerData = function (entity, since) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from(entity)
                .select("*")
                .eq("clinic_id", this.clinicId)
                .gte("updated_at", new Date(since).toISOString())
                .order("updated_at", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch ".concat(entity, ": ").concat(error.message));
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  OfflineSync.prototype.createServerRecord = function (entity, data) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from(entity).insert(data)];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to create ".concat(entity, ": ").concat(error.message));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  OfflineSync.prototype.updateServerRecord = function (entity, entityId, data) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from(entity).update(data).eq("id", entityId)];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to update ".concat(entity, ": ").concat(error.message));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  OfflineSync.prototype.deleteServerRecord = function (entity, entityId) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from(entity).delete().eq("id", entityId)];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to delete ".concat(entity, ": ").concat(error.message));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // STATUS & MONITORING
  // ============================================================================
  OfflineSync.prototype.getStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            isOnline: navigator.onLine,
            lastSyncAt: this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp) : undefined,
            nextSyncAt: this.getNextSyncTime(),
            pendingOperations: this.operationQueue.filter(function (op) {
              return op.status === "pending";
            }).length,
            conflictCount: this.conflictQueue.length,
            syncInProgress: this.isSyncing,
            syncProgress: this.syncProgress,
            estimatedTimeRemaining: this.estimateTimeRemaining(),
          },
        ];
      });
    });
  };
  OfflineSync.prototype.getNextSyncTime = function () {
    if (!this.config.autoSync || !this.lastSyncTimestamp) {
      return undefined;
    }
    return new Date(this.lastSyncTimestamp + this.config.syncInterval * 1000);
  };
  OfflineSync.prototype.estimateTimeRemaining = function () {
    if (!this.isSyncing) {
      return undefined;
    }
    var pendingOps = this.operationQueue.filter(function (op) {
      return op.status === "pending";
    }).length;
    var avgTimePerOp = 100; // milliseconds
    return pendingOps * avgTimePerOp;
  };
  // ============================================================================
  // PERSISTENCE
  // ============================================================================
  OfflineSync.prototype.loadOfflineStorage = function () {
    return __awaiter(this, void 0, void 0, function () {
      var stored;
      return __generator(this, function (_a) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            stored = localStorage.getItem("offline-storage-".concat(this.userId));
            if (stored) {
              this.offlineStorage = JSON.parse(stored);
            }
          }
        } catch (error) {
          console.error("Failed to load offline storage:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.saveOfflineStorage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(
              "offline-storage-".concat(this.userId),
              JSON.stringify(this.offlineStorage),
            );
          }
        } catch (error) {
          console.error("Failed to save offline storage:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.loadOperationQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      var stored;
      return __generator(this, function (_a) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            stored = localStorage.getItem("operation-queue-".concat(this.userId));
            if (stored) {
              this.operationQueue = JSON.parse(stored);
            }
          }
        } catch (error) {
          console.error("Failed to load operation queue:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.saveOperationQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(
              "operation-queue-".concat(this.userId),
              JSON.stringify(this.operationQueue),
            );
          }
        } catch (error) {
          console.error("Failed to save operation queue:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.loadConflictQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      var stored;
      return __generator(this, function (_a) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            stored = localStorage.getItem("conflict-queue-".concat(this.userId));
            if (stored) {
              this.conflictQueue = JSON.parse(stored);
            }
          }
        } catch (error) {
          console.error("Failed to load conflict queue:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.saveConflictQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(
              "conflict-queue-".concat(this.userId),
              JSON.stringify(this.conflictQueue),
            );
          }
        } catch (error) {
          console.error("Failed to save conflict queue:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  OfflineSync.prototype.startAutoSync = function () {
    var _this = this;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(function () {
      if (navigator.onLine && !_this.isSyncing && _this.userId && _this.clinicId) {
        _this
          .performSync({
            userId: _this.userId,
            clinicId: _this.clinicId,
            priority: "low",
          })
          .catch(console.error);
      }
    }, this.config.syncInterval * 1000);
  };
  OfflineSync.prototype.stopAutoSync = function () {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  };
  OfflineSync.prototype.chunkArray = function (array, size) {
    var chunks = [];
    for (var i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };
  OfflineSync.prototype.createDownloadOperations = function (entity, serverData) {
    return serverData.map(function (data) {
      return {
        id: "download-".concat(entity, "-").concat(data.id, "-").concat(Date.now()),
        type: "update",
        entity: entity,
        entityId: data.id,
        data: data,
        timestamp: Date.now(),
        status: "pending",
        retryCount: 0,
        priority: "normal",
      };
    });
  };
  OfflineSync.prototype.isConflictError = function (error) {
    return error.message && error.message.includes("conflict");
  };
  OfflineSync.prototype.createConflict = function (operation, error) {
    return {
      id: "conflict-".concat(operation.id, "-").concat(Date.now()),
      operationId: operation.id,
      entity: operation.entity,
      entityId: operation.entityId,
      localData: operation.data,
      serverData: error.serverData || {},
      conflictType: "data",
      timestamp: Date.now(),
    };
  };
  OfflineSync.prototype.extractEntityFromEndpoint = function (endpoint) {
    var parts = endpoint.split("/").filter(Boolean);
    return parts[0] || "unknown";
  };
  OfflineSync.prototype.extractEntityIdFromEndpoint = function (endpoint) {
    var parts = endpoint.split("/").filter(Boolean);
    return parts[1] || null;
  };
  OfflineSync.prototype.filterPatients = function (params) {
    var patients = this.offlineStorage.patients;
    if (params === null || params === void 0 ? void 0 : params.search) {
      var search_1 = params.search.toLowerCase();
      patients = patients.filter(function (p) {
        var _a, _b;
        return (
          p.name.toLowerCase().includes(search_1) ||
          ((_a = p.email) === null || _a === void 0
            ? void 0
            : _a.toLowerCase().includes(search_1)) ||
          ((_b = p.phone) === null || _b === void 0 ? void 0 : _b.includes(search_1))
        );
      });
    }
    if ((params === null || params === void 0 ? void 0 : params.isActive) !== undefined) {
      patients = patients.filter(function (p) {
        return p.isActive === params.isActive;
      });
    }
    return patients;
  };
  OfflineSync.prototype.filterAppointments = function (params) {
    var appointments = this.offlineStorage.appointments;
    if (params === null || params === void 0 ? void 0 : params.patientId) {
      appointments = appointments.filter(function (a) {
        return a.patientId === params.patientId;
      });
    }
    if (params === null || params === void 0 ? void 0 : params.status) {
      appointments = appointments.filter(function (a) {
        return a.status === params.status;
      });
    }
    if (params === null || params === void 0 ? void 0 : params.date) {
      var date_1 = new Date(params.date).toDateString();
      appointments = appointments.filter(function (a) {
        return new Date(a.scheduledAt).toDateString() === date_1;
      });
    }
    return appointments;
  };
  OfflineSync.prototype.filterTreatments = function (params) {
    var treatments = this.offlineStorage.treatments;
    if (params === null || params === void 0 ? void 0 : params.category) {
      treatments = treatments.filter(function (t) {
        return t.category === params.category;
      });
    }
    if ((params === null || params === void 0 ? void 0 : params.isActive) !== undefined) {
      treatments = treatments.filter(function (t) {
        return t.isActive === params.isActive;
      });
    }
    return treatments;
  };
  OfflineSync.prototype.filterPayments = function (params) {
    var payments = this.offlineStorage.payments;
    if (params === null || params === void 0 ? void 0 : params.patientId) {
      payments = payments.filter(function (p) {
        return p.patientId === params.patientId;
      });
    }
    if (params === null || params === void 0 ? void 0 : params.status) {
      payments = payments.filter(function (p) {
        return p.status === params.status;
      });
    }
    return payments;
  };
  OfflineSync.prototype.updatePatientRecord = function (data) {
    var index = this.offlineStorage.patients.findIndex(function (p) {
      return p.id === data.id;
    });
    if (index > -1) {
      this.offlineStorage.patients[index] = __assign(
        __assign({}, this.offlineStorage.patients[index]),
        data,
      );
    } else {
      this.offlineStorage.patients.push(data);
    }
  };
  OfflineSync.prototype.updateAppointmentRecord = function (data) {
    var index = this.offlineStorage.appointments.findIndex(function (a) {
      return a.id === data.id;
    });
    if (index > -1) {
      this.offlineStorage.appointments[index] = __assign(
        __assign({}, this.offlineStorage.appointments[index]),
        data,
      );
    } else {
      this.offlineStorage.appointments.push(data);
    }
  };
  OfflineSync.prototype.updateTreatmentRecord = function (data) {
    var index = this.offlineStorage.treatments.findIndex(function (t) {
      return t.id === data.id;
    });
    if (index > -1) {
      this.offlineStorage.treatments[index] = __assign(
        __assign({}, this.offlineStorage.treatments[index]),
        data,
      );
    } else {
      this.offlineStorage.treatments.push(data);
    }
  };
  OfflineSync.prototype.updatePaymentRecord = function (data) {
    var index = this.offlineStorage.payments.findIndex(function (p) {
      return p.id === data.id;
    });
    if (index > -1) {
      this.offlineStorage.payments[index] = __assign(
        __assign({}, this.offlineStorage.payments[index]),
        data,
      );
    } else {
      this.offlineStorage.payments.push(data);
    }
  };
  OfflineSync.prototype.updateOfflineMetadata = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.offlineStorage.metadata = {
          lastSyncTimestamp: this.lastSyncTimestamp,
          version: "1.0.0",
          checksum: this.calculateChecksum(),
          totalRecords: this.getTotalRecords(),
          storageSize: this.calculateStorageSize(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
        return [2 /*return*/];
      });
    });
  };
  OfflineSync.prototype.calculateChecksum = function () {
    var data = JSON.stringify({
      patients: this.offlineStorage.patients,
      appointments: this.offlineStorage.appointments,
      treatments: this.offlineStorage.treatments,
      payments: this.offlineStorage.payments,
    });
    // Simple checksum calculation
    var hash = 0;
    for (var i = 0; i < data.length; i++) {
      var char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  };
  OfflineSync.prototype.getTotalRecords = function () {
    return (
      this.offlineStorage.patients.length +
      this.offlineStorage.appointments.length +
      this.offlineStorage.treatments.length +
      this.offlineStorage.payments.length
    );
  };
  OfflineSync.prototype.calculateStorageSize = function () {
    return JSON.stringify(this.offlineStorage).length;
  };
  // ============================================================================
  // EVENT MANAGEMENT
  // ============================================================================
  OfflineSync.prototype.on = function (event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  };
  OfflineSync.prototype.off = function (event, handler) {
    if (!this.eventHandlers[event]) {
      return;
    }
    if (handler) {
      var index = this.eventHandlers[event].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1);
      }
    } else {
      this.eventHandlers[event] = [];
    }
  };
  OfflineSync.prototype.emitEvent = function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    var handlers = this.eventHandlers[event];
    if (handlers) {
      for (var _a = 0, handlers_1 = handlers; _a < handlers_1.length; _a++) {
        var handler = handlers_1[_a];
        try {
          handler.apply(void 0, args);
        } catch (error) {
          console.error("Error in sync event handler ".concat(event, ":"), error);
        }
      }
    }
  };
  // ============================================================================
  // CLEANUP
  // ============================================================================
  OfflineSync.prototype.destroy = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.stopAutoSync();
            // Save final state
            return [
              4 /*yield*/,
              Promise.all([
                this.saveOfflineStorage(),
                this.saveOperationQueue(),
                this.saveConflictQueue(),
              ]),
              // Clear data
            ];
          case 1:
            // Save final state
            _a.sent();
            // Clear data
            this.operationQueue = [];
            this.conflictQueue = [];
            this.eventHandlers = {};
            this.userId = null;
            this.clinicId = null;
            this.isInitialized = false;
            console.log("Offline Sync destroyed successfully");
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            console.error("Error destroying Offline Sync:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return OfflineSync;
})();
exports.OfflineSync = OfflineSync;
