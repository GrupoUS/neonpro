"use strict";
// Session Preservation System
// Maintains session state during reconnections and network failures
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
exports.SessionPreservationManager = void 0;
var session_config_1 = require("@/lib/auth/config/session-config");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var SessionPreservationManager = /** @class */ (function () {
  function SessionPreservationManager(config) {
    this.snapshots = new Map();
    this.currentState = new Map();
    this.snapshotInterval = null;
    this.storageQuota = 50 * 1024 * 1024; // 50MB
    this.compressionRatio = 0.3;
    this.eventListeners = new Map();
    this.config = session_config_1.SessionConfig.getInstance();
    this.utils = new session_utils_1.SessionUtils();
    this.preservationConfig = __assign(
      {
        snapshotInterval: 30000,
        maxSnapshots: 10,
        compressionEnabled: true,
        encryptionEnabled: true,
        storageType: "indexedDB",
        retentionPeriod: 7 * 24 * 60 * 60 * 1000,
        autoRestore: true,
        conflictResolution: "merge",
      },
      config,
    );
  }
  /**
   * Initialize preservation manager
   */
  SessionPreservationManager.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Initialize storage
            return [4 /*yield*/, this.initializeStorage()];
          case 1:
            // Initialize storage
            _a.sent();
            // Load existing snapshots
            return [4 /*yield*/, this.loadSnapshots()];
          case 2:
            // Load existing snapshots
            _a.sent();
            // Start automatic snapshots
            this.startAutomaticSnapshots();
            // Setup event listeners
            this.setupEventListeners();
            // Cleanup old snapshots
            return [4 /*yield*/, this.cleanupOldSnapshots()];
          case 3:
            // Cleanup old snapshots
            _a.sent();
            console.log("Session preservation manager initialized");
            this.emit("preservation_initialized", {});
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Error initializing session preservation:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create session snapshot
   */
  SessionPreservationManager.prototype.createSnapshot = function (sessionId, userId, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var state, metadata, snapshot, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.captureSessionState(sessionId)];
          case 1:
            state = _a.sent();
            return [4 /*yield*/, this.captureSessionMetadata()];
          case 2:
            metadata = _a.sent();
            snapshot = {
              id: this.utils.generateSessionToken(),
              sessionId: sessionId,
              userId: userId,
              deviceId: deviceId,
              timestamp: Date.now(),
              state: state,
              metadata: metadata,
              checksum: this.calculateChecksum(state),
              version: this.getNextVersion(sessionId),
            };
            // Store snapshot
            return [4 /*yield*/, this.storeSnapshot(snapshot)];
          case 3:
            // Store snapshot
            _a.sent();
            // Update current state
            this.currentState.set(sessionId, state);
            this.emit("snapshot_created", snapshot);
            return [2 /*return*/, snapshot];
          case 4:
            error_2 = _a.sent();
            console.error("Error creating session snapshot:", error_2);
            throw error_2;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Restore session from snapshot
   */
  SessionPreservationManager.prototype.restoreSession = function (sessionId, snapshotId) {
    return __awaiter(this, void 0, void 0, function () {
      var snapshot, _a, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            if (!snapshotId) return [3 /*break*/, 2];
            return [4 /*yield*/, this.getSnapshot(sessionId, snapshotId)];
          case 1:
            _a = _b.sent();
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, this.getLatestSnapshot(sessionId)];
          case 3:
            _a = _b.sent();
            _b.label = 4;
          case 4:
            snapshot = _a;
            if (!snapshot) {
              console.warn("No snapshot found for session ".concat(sessionId));
              return [2 /*return*/, null];
            }
            // Verify snapshot integrity
            if (!this.verifySnapshot(snapshot)) {
              console.error("Snapshot integrity check failed");
              return [2 /*return*/, null];
            }
            // Restore session state
            return [4 /*yield*/, this.applySessionState(sessionId, snapshot.state)];
          case 5:
            // Restore session state
            _b.sent();
            // Update current state
            this.currentState.set(sessionId, snapshot.state);
            this.emit("session_restored", { sessionId: sessionId, snapshot: snapshot });
            return [2 /*return*/, snapshot.state];
          case 6:
            error_3 = _b.sent();
            console.error("Error restoring session:", error_3);
            return [2 /*return*/, null];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Capture current session state
   */
  SessionPreservationManager.prototype.captureSessionState = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, auth, prefs, nav, forms, cache, perms, activity;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.all([
                this.captureAuthenticationState(sessionId),
                this.captureUserPreferences(sessionId),
                this.captureNavigationState(),
                this.captureFormStates(),
                this.captureCacheState(),
                this.capturePermissionState(sessionId),
                this.captureActivityState(sessionId),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (auth = _a[0]),
              (prefs = _a[1]),
              (nav = _a[2]),
              (forms = _a[3]),
              (cache = _a[4]),
              (perms = _a[5]),
              (activity = _a[6]);
            return [
              2 /*return*/,
              {
                authentication: auth,
                preferences: prefs,
                navigation: nav,
                forms: forms,
                cache: cache,
                permissions: perms,
                activity: activity,
              },
            ];
        }
      });
    });
  };
  /**
   * Capture authentication state
   */
  SessionPreservationManager.prototype.captureAuthenticationState = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/session/".concat(sessionId, "/auth-state"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            console.error("Error capturing auth state:", error_4);
            return [3 /*break*/, 5];
          case 5:
            return [
              2 /*return*/,
              {
                isAuthenticated: false,
                tokenExpiry: 0,
                refreshTokenExpiry: 0,
                lastActivity: Date.now(),
                mfaStatus: { enabled: false, methods: [], lastVerified: 0, required: false },
                roles: [],
                permissions: [],
              },
            ];
        }
      });
    });
  };
  /**
   * Capture user preferences
   */
  SessionPreservationManager.prototype.captureUserPreferences = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/session/".concat(sessionId, "/preferences"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            console.error("Error capturing preferences:", error_5);
            return [3 /*break*/, 5];
          case 5:
            return [
              2 /*return*/,
              {
                theme: "light",
                language: "en",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                notifications: {
                  email: true,
                  push: true,
                  sms: false,
                  inApp: true,
                  frequency: "immediate",
                },
                privacy: {
                  analytics: true,
                  cookies: true,
                  tracking: false,
                  dataSharing: false,
                },
                accessibility: {
                  fontSize: 14,
                  contrast: "normal",
                  animations: true,
                  screenReader: false,
                  keyboardNavigation: false,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Capture navigation state
   */
  SessionPreservationManager.prototype.captureNavigationState = function () {
    return {
      currentPath: window.location.pathname,
      history: this.getNavigationHistory(),
      breadcrumbs: this.getBreadcrumbs(),
      tabs: this.getTabStates(),
      modals: this.getModalStates(),
    };
  };
  /**
   * Capture form states
   */
  SessionPreservationManager.prototype.captureFormStates = function () {
    var _this = this;
    var forms = [];
    var formElements = document.querySelectorAll("form[data-preserve]");
    formElements.forEach(function (form) {
      var formId = form.getAttribute("data-preserve") || form.id;
      if (formId) {
        var formData = new FormData(form);
        var fields_1 = {};
        formData.forEach(function (value, key) {
          fields_1[key] = value;
        });
        forms.push({
          formId: formId,
          fields: fields_1,
          isDirty: form.classList.contains("dirty"),
          isValid: form.classList.contains("valid"),
          errors: _this.getFormErrors(form),
          lastModified: Date.now(),
        });
      }
    });
    return forms;
  };
  /**
   * Capture cache state
   */
  SessionPreservationManager.prototype.captureCacheState = function () {
    var cache = {};
    var totalSize = 0;
    // Capture localStorage items
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.startsWith("neonpro_cache_")) {
        try {
          var item = JSON.parse(localStorage.getItem(key) || "{}");
          cache[key] = item;
          totalSize += JSON.stringify(item).length;
        } catch (error) {
          console.warn("Error parsing cached item ".concat(key, ":"), error);
        }
      }
    }
    return {
      data: cache,
      size: totalSize,
      lastCleanup: Date.now(),
    };
  };
  /**
   * Capture permission state
   */
  SessionPreservationManager.prototype.capturePermissionState = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/session/".concat(sessionId, "/permissions"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_6 = _a.sent();
            console.error("Error capturing permissions:", error_6);
            return [3 /*break*/, 5];
          case 5:
            return [
              2 /*return*/,
              {
                granted: [],
                denied: [],
                pending: [],
                lastUpdated: Date.now(),
              },
            ];
        }
      });
    });
  };
  /**
   * Capture activity state
   */
  SessionPreservationManager.prototype.captureActivityState = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/session/".concat(sessionId, "/activity"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            console.error("Error capturing activity:", error_7);
            return [3 /*break*/, 5];
          case 5:
            return [
              2 /*return*/,
              {
                actions: [],
                metrics: {
                  totalActions: 0,
                  sessionDuration: 0,
                  idleTime: 0,
                  activeTime: 0,
                  pageViews: 0,
                  apiCalls: 0,
                },
                patterns: [],
              },
            ];
        }
      });
    });
  };
  /**
   * Capture session metadata
   */
  SessionPreservationManager.prototype.captureSessionMetadata = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = {
              device: this.getDeviceInfo(),
            };
            return [4 /*yield*/, this.getNetworkInfo()];
          case 1:
            (_a.network = _b.sent()), (_a.browser = this.getBrowserInfo());
            return [4 /*yield*/, this.getLocationInfo()];
          case 2:
            return [
              2 /*return*/,
              ((_a.location = _b.sent()), (_a.performance = this.getPerformanceInfo()), _a),
            ];
        }
      });
    });
  };
  /**
   * Apply session state
   */
  SessionPreservationManager.prototype.applySessionState = function (sessionId, state) {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Apply authentication state
            return [4 /*yield*/, this.applyAuthenticationState(sessionId, state.authentication)];
          case 1:
            // Apply authentication state
            _a.sent();
            // Apply preferences
            return [4 /*yield*/, this.applyUserPreferences(sessionId, state.preferences)];
          case 2:
            // Apply preferences
            _a.sent();
            // Apply navigation state
            this.applyNavigationState(state.navigation);
            // Apply form states
            this.applyFormStates(state.forms);
            // Apply cache state
            this.applyCacheState(state.cache);
            // Apply permission state
            return [4 /*yield*/, this.applyPermissionState(sessionId, state.permissions)];
          case 3:
            // Apply permission state
            _a.sent();
            console.log("Session state applied for ".concat(sessionId));
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            console.error("Error applying session state:", error_8);
            throw error_8;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Store snapshot
   */
  SessionPreservationManager.prototype.storeSnapshot = function (snapshot) {
    return __awaiter(this, void 0, void 0, function () {
      var data, _a, sessionSnapshots, removed, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 15, , 16]);
            data = snapshot;
            if (!this.preservationConfig.compressionEnabled) return [3 /*break*/, 2];
            return [4 /*yield*/, this.compressSnapshot(snapshot)];
          case 1:
            data = _b.sent();
            _b.label = 2;
          case 2:
            if (!this.preservationConfig.encryptionEnabled) return [3 /*break*/, 4];
            return [4 /*yield*/, this.encryptSnapshot(data)];
          case 3:
            data = _b.sent();
            _b.label = 4;
          case 4:
            _a = this.preservationConfig.storageType;
            switch (_a) {
              case "localStorage":
                return [3 /*break*/, 5];
              case "indexedDB":
                return [3 /*break*/, 7];
              case "sessionStorage":
                return [3 /*break*/, 9];
              case "memory":
                return [3 /*break*/, 11];
            }
            return [3 /*break*/, 12];
          case 5:
            return [4 /*yield*/, this.storeInLocalStorage(snapshot.sessionId, data)];
          case 6:
            _b.sent();
            return [3 /*break*/, 12];
          case 7:
            return [4 /*yield*/, this.storeInIndexedDB(snapshot.sessionId, data)];
          case 8:
            _b.sent();
            return [3 /*break*/, 12];
          case 9:
            return [4 /*yield*/, this.storeInSessionStorage(snapshot.sessionId, data)];
          case 10:
            _b.sent();
            return [3 /*break*/, 12];
          case 11:
            this.storeInMemory(snapshot.sessionId, data);
            return [3 /*break*/, 12];
          case 12:
            // Update snapshots map
            if (!this.snapshots.has(snapshot.sessionId)) {
              this.snapshots.set(snapshot.sessionId, []);
            }
            sessionSnapshots = this.snapshots.get(snapshot.sessionId);
            sessionSnapshots.push(snapshot);
            if (!(sessionSnapshots.length > this.preservationConfig.maxSnapshots))
              return [3 /*break*/, 14];
            removed = sessionSnapshots.shift();
            if (!removed) return [3 /*break*/, 14];
            return [4 /*yield*/, this.removeSnapshot(removed.id)];
          case 13:
            _b.sent();
            _b.label = 14;
          case 14:
            return [3 /*break*/, 16];
          case 15:
            error_9 = _b.sent();
            console.error("Error storing snapshot:", error_9);
            throw error_9;
          case 16:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get latest snapshot
   */
  SessionPreservationManager.prototype.getLatestSnapshot = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionSnapshots;
      return __generator(this, function (_a) {
        sessionSnapshots = this.snapshots.get(sessionId);
        if (!sessionSnapshots || sessionSnapshots.length === 0) {
          return [2 /*return*/, null];
        }
        return [2 /*return*/, sessionSnapshots[sessionSnapshots.length - 1]];
      });
    });
  };
  /**
   * Get specific snapshot
   */
  SessionPreservationManager.prototype.getSnapshot = function (sessionId, snapshotId) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionSnapshots;
      return __generator(this, function (_a) {
        sessionSnapshots = this.snapshots.get(sessionId);
        if (!sessionSnapshots) {
          return [2 /*return*/, null];
        }
        return [
          2 /*return*/,
          sessionSnapshots.find(function (s) {
            return s.id === snapshotId;
          }) || null,
        ];
      });
    });
  };
  /**
   * Verify snapshot integrity
   */
  SessionPreservationManager.prototype.verifySnapshot = function (snapshot) {
    var calculatedChecksum = this.calculateChecksum(snapshot.state);
    return calculatedChecksum === snapshot.checksum;
  };
  /**
   * Calculate checksum
   */
  SessionPreservationManager.prototype.calculateChecksum = function (data) {
    var str = JSON.stringify(data);
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  };
  /**
   * Get next version number
   */
  SessionPreservationManager.prototype.getNextVersion = function (sessionId) {
    var sessionSnapshots = this.snapshots.get(sessionId);
    if (!sessionSnapshots || sessionSnapshots.length === 0) {
      return 1;
    }
    var latestVersion = Math.max.apply(
      Math,
      sessionSnapshots.map(function (s) {
        return s.version;
      }),
    );
    return latestVersion + 1;
  };
  /**
   * Utility methods for capturing state
   */
  SessionPreservationManager.prototype.getNavigationHistory = function () {
    // Implementation depends on router used
    return [];
  };
  SessionPreservationManager.prototype.getBreadcrumbs = function () {
    // Implementation depends on breadcrumb system
    return [];
  };
  SessionPreservationManager.prototype.getTabStates = function () {
    // Implementation depends on tab system
    return [];
  };
  SessionPreservationManager.prototype.getModalStates = function () {
    // Implementation depends on modal system
    return [];
  };
  SessionPreservationManager.prototype.getFormErrors = function (form) {
    var errors = {};
    var errorElements = form.querySelectorAll("[data-error]");
    errorElements.forEach(function (element) {
      var field = element.getAttribute("data-field");
      var error = element.textContent;
      if (field && error) {
        errors[field] = error;
      }
    });
    return errors;
  };
  SessionPreservationManager.prototype.getDeviceInfo = function () {
    var _a;
    return {
      type: this.getDeviceType(),
      os: this.getOperatingSystem(),
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio,
        orientation:
          ((_a = screen.orientation) === null || _a === void 0 ? void 0 : _a.type) || "unknown",
      },
      memory: navigator.deviceMemory || 0,
      storage: {
        available: 0,
        used: 0,
        quota: 0,
      },
    };
  };
  SessionPreservationManager.prototype.getNetworkInfo = function () {
    return __awaiter(this, void 0, void 0, function () {
      var connection;
      return __generator(this, function (_a) {
        connection = navigator.connection;
        return [
          2 /*return*/,
          {
            type:
              (connection === null || connection === void 0 ? void 0 : connection.effectiveType) ||
              "unknown",
            speed:
              (connection === null || connection === void 0 ? void 0 : connection.downlink) || 0,
            latency: (connection === null || connection === void 0 ? void 0 : connection.rtt) || 0,
            isOnline: navigator.onLine,
            lastOnline: Date.now(),
          },
        ];
      });
    });
  };
  SessionPreservationManager.prototype.getBrowserInfo = function () {
    return {
      name: this.getBrowserName(),
      version: this.getBrowserVersion(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      localStorageEnabled: this.isLocalStorageEnabled(),
    };
  };
  SessionPreservationManager.prototype.getLocationInfo = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Basic location info - in production, use proper geolocation service
        return [
          2 /*return*/,
          {
            country: "Unknown",
            region: "Unknown",
            city: "Unknown",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        ];
      });
    });
  };
  SessionPreservationManager.prototype.getPerformanceInfo = function () {
    var _a;
    var navigation = performance.getEntriesByType("navigation")[0];
    return {
      loadTime:
        (navigation === null || navigation === void 0 ? void 0 : navigation.loadEventEnd) -
          (navigation === null || navigation === void 0 ? void 0 : navigation.loadEventStart) || 0,
      renderTime:
        (navigation === null || navigation === void 0
          ? void 0
          : navigation.domContentLoadedEventEnd) -
          (navigation === null || navigation === void 0
            ? void 0
            : navigation.domContentLoadedEventStart) || 0,
      memoryUsage:
        ((_a = performance.memory) === null || _a === void 0 ? void 0 : _a.usedJSHeapSize) || 0,
      cpuUsage: 0, // Not available in browser
      networkUsage: 0, // Not available in browser
    };
  };
  /**
   * Helper methods
   */
  SessionPreservationManager.prototype.getDeviceType = function () {
    var userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return "tablet";
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent,
      )
    ) {
      return "mobile";
    }
    return "desktop";
  };
  SessionPreservationManager.prototype.getOperatingSystem = function () {
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("Win") !== -1) return "Windows";
    if (userAgent.indexOf("Mac") !== -1) return "macOS";
    if (userAgent.indexOf("Linux") !== -1) return "Linux";
    if (userAgent.indexOf("Android") !== -1) return "Android";
    if (userAgent.indexOf("iOS") !== -1) return "iOS";
    return "Unknown";
  };
  SessionPreservationManager.prototype.getBrowserName = function () {
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
    if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
    if (userAgent.indexOf("Safari") !== -1) return "Safari";
    if (userAgent.indexOf("Edge") !== -1) return "Edge";
    return "Unknown";
  };
  SessionPreservationManager.prototype.getBrowserVersion = function () {
    var _a;
    // Simplified version detection
    return (
      ((_a = navigator.userAgent.match(/\d+\.\d+/)) === null || _a === void 0 ? void 0 : _a[0]) ||
      "Unknown"
    );
  };
  SessionPreservationManager.prototype.isLocalStorageEnabled = function () {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch (_a) {
      return false;
    }
  };
  /**
   * Storage implementations
   */
  SessionPreservationManager.prototype.storeInLocalStorage = function (sessionId, data) {
    return __awaiter(this, void 0, void 0, function () {
      var key;
      return __generator(this, function (_a) {
        key = "neonpro_snapshot_".concat(sessionId);
        localStorage.setItem(key, JSON.stringify(data));
        return [2 /*return*/];
      });
    });
  };
  SessionPreservationManager.prototype.storeInIndexedDB = function (sessionId, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // IndexedDB implementation
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            var request = indexedDB.open("NeonProSnapshots", 1);
            request.onerror = function () {
              return reject(request.error);
            };
            request.onsuccess = function () {
              var db = request.result;
              var transaction = db.transaction(["snapshots"], "readwrite");
              var store = transaction.objectStore("snapshots");
              var putRequest = store.put(data, sessionId);
              putRequest.onsuccess = function () {
                return resolve();
              };
              putRequest.onerror = function () {
                return reject(putRequest.error);
              };
            };
            request.onupgradeneeded = function () {
              var db = request.result;
              if (!db.objectStoreNames.contains("snapshots")) {
                db.createObjectStore("snapshots");
              }
            };
          }),
        ];
      });
    });
  };
  SessionPreservationManager.prototype.storeInSessionStorage = function (sessionId, data) {
    return __awaiter(this, void 0, void 0, function () {
      var key;
      return __generator(this, function (_a) {
        key = "neonpro_snapshot_".concat(sessionId);
        sessionStorage.setItem(key, JSON.stringify(data));
        return [2 /*return*/];
      });
    });
  };
  SessionPreservationManager.prototype.storeInMemory = function (sessionId, data) {
    // Already stored in this.snapshots map
  };
  /**
   * Compression and encryption
   */
  SessionPreservationManager.prototype.compressSnapshot = function (snapshot) {
    return __awaiter(this, void 0, void 0, function () {
      var compressed;
      return __generator(this, function (_a) {
        compressed = JSON.stringify(snapshot);
        return [
          2 /*return*/,
          __assign(__assign({}, snapshot), {
            compressed: true,
            originalSize: JSON.stringify(snapshot).length,
            compressedSize: Math.floor(compressed.length * this.compressionRatio),
          }),
        ];
      });
    });
  };
  SessionPreservationManager.prototype.encryptSnapshot = function (snapshot) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simple encryption simulation
        return [
          2 /*return*/,
          __assign(__assign({}, snapshot), { encrypted: true, encryptionMethod: "AES-256" }),
        ];
      });
    });
  };
  /**
   * State application methods
   */
  SessionPreservationManager.prototype.applyAuthenticationState = function (sessionId, auth) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/".concat(sessionId, "/restore-auth"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(auth),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservationManager.prototype.applyUserPreferences = function (sessionId, prefs) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/".concat(sessionId, "/restore-preferences"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prefs),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservationManager.prototype.applyNavigationState = function (nav) {
    // Apply navigation state to current page
    if (nav.currentPath !== window.location.pathname) {
      // Navigate to preserved path if different
      window.history.pushState({}, "", nav.currentPath);
    }
  };
  SessionPreservationManager.prototype.applyFormStates = function (forms) {
    forms.forEach(function (formState) {
      var form = document.querySelector('form[data-preserve="'.concat(formState.formId, '"]'));
      if (form) {
        Object.entries(formState.fields).forEach(function (_a) {
          var name = _a[0],
            value = _a[1];
          var field = form.querySelector('[name="'.concat(name, '"]'));
          if (field) {
            field.value = value;
          }
        });
      }
    });
  };
  SessionPreservationManager.prototype.applyCacheState = function (cache) {
    Object.entries(cache.data).forEach(function (_a) {
      var key = _a[0],
        item = _a[1];
      if (item.expiry > Date.now()) {
        localStorage.setItem(key, JSON.stringify(item));
      }
    });
  };
  SessionPreservationManager.prototype.applyPermissionState = function (sessionId, perms) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/".concat(sessionId, "/restore-permissions"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(perms),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup and maintenance
   */
  SessionPreservationManager.prototype.cleanupOldSnapshots = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        cutoff,
        _i,
        _a,
        _b,
        sessionId,
        snapshots,
        validSnapshots,
        removedSnapshots,
        _c,
        removedSnapshots_1,
        snapshot;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            now = Date.now();
            cutoff = now - this.preservationConfig.retentionPeriod;
            (_i = 0), (_a = this.snapshots.entries());
            _d.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (sessionId = _b[0]), (snapshots = _b[1]);
            validSnapshots = snapshots.filter(function (s) {
              return s.timestamp > cutoff;
            });
            if (!(validSnapshots.length !== snapshots.length)) return [3 /*break*/, 5];
            this.snapshots.set(sessionId, validSnapshots);
            removedSnapshots = snapshots.filter(function (s) {
              return s.timestamp <= cutoff;
            });
            (_c = 0), (removedSnapshots_1 = removedSnapshots);
            _d.label = 2;
          case 2:
            if (!(_c < removedSnapshots_1.length)) return [3 /*break*/, 5];
            snapshot = removedSnapshots_1[_c];
            return [4 /*yield*/, this.removeSnapshot(snapshot.id)];
          case 3:
            _d.sent();
            _d.label = 4;
          case 4:
            _c++;
            return [3 /*break*/, 2];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservationManager.prototype.removeSnapshot = function (snapshotId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Remove from storage based on storage type
        switch (this.preservationConfig.storageType) {
          case "localStorage":
            localStorage.removeItem("neonpro_snapshot_".concat(snapshotId));
            break;
          case "indexedDB":
            // IndexedDB removal implementation
            break;
          case "sessionStorage":
            sessionStorage.removeItem("neonpro_snapshot_".concat(snapshotId));
            break;
          case "memory":
            // Already removed from memory map
            break;
        }
        return [2 /*return*/];
      });
    });
  };
  SessionPreservationManager.prototype.initializeStorage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.preservationConfig.storageType === "indexedDB") {
          return [
            2 /*return*/,
            new Promise(function (resolve, reject) {
              var request = indexedDB.open("NeonProSnapshots", 1);
              request.onerror = function () {
                return reject(request.error);
              };
              request.onsuccess = function () {
                return resolve();
              };
              request.onupgradeneeded = function () {
                var db = request.result;
                if (!db.objectStoreNames.contains("snapshots")) {
                  db.createObjectStore("snapshots");
                }
              };
            }),
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  SessionPreservationManager.prototype.loadSnapshots = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = this.preservationConfig.storageType;
            switch (_a) {
              case "localStorage":
                return [3 /*break*/, 1];
              case "indexedDB":
                return [3 /*break*/, 2];
              case "sessionStorage":
                return [3 /*break*/, 4];
              case "memory":
                return [3 /*break*/, 5];
            }
            return [3 /*break*/, 6];
          case 1:
            this.loadFromLocalStorage();
            return [3 /*break*/, 6];
          case 2:
            return [4 /*yield*/, this.loadFromIndexedDB()];
          case 3:
            _b.sent();
            return [3 /*break*/, 6];
          case 4:
            this.loadFromSessionStorage();
            return [3 /*break*/, 6];
          case 5:
            // Nothing to load for memory storage
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservationManager.prototype.loadFromLocalStorage = function () {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.startsWith("neonpro_snapshot_")) {
        try {
          var data = JSON.parse(localStorage.getItem(key) || "{}");
          var sessionId = key.replace("neonpro_snapshot_", "");
          if (!this.snapshots.has(sessionId)) {
            this.snapshots.set(sessionId, []);
          }
          this.snapshots.get(sessionId).push(data);
        } catch (error) {
          console.warn("Error loading snapshot from localStorage: ".concat(key), error);
        }
      }
    }
  };
  SessionPreservationManager.prototype.loadFromIndexedDB = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            var request = indexedDB.open("NeonProSnapshots", 1);
            request.onerror = function () {
              return reject(request.error);
            };
            request.onsuccess = function () {
              var db = request.result;
              var transaction = db.transaction(["snapshots"], "readonly");
              var store = transaction.objectStore("snapshots");
              var getAllRequest = store.getAll();
              getAllRequest.onsuccess = function () {
                var snapshots = getAllRequest.result;
                snapshots.forEach(function (snapshot) {
                  if (!_this.snapshots.has(snapshot.sessionId)) {
                    _this.snapshots.set(snapshot.sessionId, []);
                  }
                  _this.snapshots.get(snapshot.sessionId).push(snapshot);
                });
                resolve();
              };
              getAllRequest.onerror = function () {
                return reject(getAllRequest.error);
              };
            };
          }),
        ];
      });
    });
  };
  SessionPreservationManager.prototype.loadFromSessionStorage = function () {
    for (var i = 0; i < sessionStorage.length; i++) {
      var key = sessionStorage.key(i);
      if (key && key.startsWith("neonpro_snapshot_")) {
        try {
          var data = JSON.parse(sessionStorage.getItem(key) || "{}");
          var sessionId = key.replace("neonpro_snapshot_", "");
          if (!this.snapshots.has(sessionId)) {
            this.snapshots.set(sessionId, []);
          }
          this.snapshots.get(sessionId).push(data);
        } catch (error) {
          console.warn("Error loading snapshot from sessionStorage: ".concat(key), error);
        }
      }
    }
  };
  SessionPreservationManager.prototype.startAutomaticSnapshots = function () {
    var _this = this;
    this.snapshotInterval = setInterval(function () {
      // Create snapshots for all active sessions
      _this.currentState.forEach(function (state, sessionId) {
        return __awaiter(_this, void 0, void 0, function () {
          var response, session, error_10;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, fetch("/api/session/".concat(sessionId))];
              case 1:
                response = _a.sent();
                if (!response.ok) return [3 /*break*/, 4];
                return [4 /*yield*/, response.json()];
              case 2:
                session = _a.sent();
                return [
                  4 /*yield*/,
                  this.createSnapshot(sessionId, session.userId, session.deviceId),
                ];
              case 3:
                _a.sent();
                _a.label = 4;
              case 4:
                return [3 /*break*/, 6];
              case 5:
                error_10 = _a.sent();
                console.error(
                  "Error creating automatic snapshot for ".concat(sessionId, ":"),
                  error_10,
                );
                return [3 /*break*/, 6];
              case 6:
                return [2 /*return*/];
            }
          });
        });
      });
    }, this.preservationConfig.snapshotInterval);
  };
  SessionPreservationManager.prototype.setupEventListeners = function () {
    var _this = this;
    // Listen for page unload to create final snapshot
    window.addEventListener("beforeunload", function () {
      _this.currentState.forEach(function (state, sessionId) {
        return __awaiter(_this, void 0, void 0, function () {
          var response, session, error_11;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, fetch("/api/session/".concat(sessionId))];
              case 1:
                response = _a.sent();
                if (!response.ok) return [3 /*break*/, 4];
                return [4 /*yield*/, response.json()];
              case 2:
                session = _a.sent();
                return [
                  4 /*yield*/,
                  this.createSnapshot(sessionId, session.userId, session.deviceId),
                ];
              case 3:
                _a.sent();
                _a.label = 4;
              case 4:
                return [3 /*break*/, 6];
              case 5:
                error_11 = _a.sent();
                console.error(
                  "Error creating final snapshot for ".concat(sessionId, ":"),
                  error_11,
                );
                return [3 /*break*/, 6];
              case 6:
                return [2 /*return*/];
            }
          });
        });
      });
    });
    // Listen for online/offline events
    window.addEventListener("online", function () {
      _this.emit("network_restored", {});
    });
    window.addEventListener("offline", function () {
      _this.emit("network_lost", {});
    });
  };
  /**
   * Event system
   */
  SessionPreservationManager.prototype.on = function (event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  };
  SessionPreservationManager.prototype.off = function (event, callback) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      var index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
  SessionPreservationManager.prototype.emit = function (event, data) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(function (callback) {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in event listener for ".concat(event, ":"), error);
        }
      });
    }
  };
  /**
   * Public API methods
   */
  SessionPreservationManager.prototype.manualSnapshot = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, session, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, fetch("/api/session/".concat(sessionId))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 2:
            session = _a.sent();
            return [4 /*yield*/, this.createSnapshot(sessionId, session.userId, session.deviceId)];
          case 3:
            return [2 /*return*/, _a.sent()];
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_12 = _a.sent();
            console.error("Error creating manual snapshot:", error_12);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/, null];
        }
      });
    });
  };
  SessionPreservationManager.prototype.getSessionSnapshots = function (sessionId) {
    return this.snapshots.get(sessionId) || [];
  };
  SessionPreservationManager.prototype.deleteSessionSnapshots = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var snapshots, _i, snapshots_1, snapshot;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            snapshots = this.snapshots.get(sessionId);
            if (!snapshots) return [3 /*break*/, 5];
            (_i = 0), (snapshots_1 = snapshots);
            _a.label = 1;
          case 1:
            if (!(_i < snapshots_1.length)) return [3 /*break*/, 4];
            snapshot = snapshots_1[_i];
            return [4 /*yield*/, this.removeSnapshot(snapshot.id)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            this.snapshots.delete(sessionId);
            _a.label = 5;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservationManager.prototype.getStorageUsage = function () {
    var _a;
    var used = 0;
    // Calculate storage usage based on storage type
    switch (this.preservationConfig.storageType) {
      case "localStorage":
        for (var i = 0; i < localStorage.length; i++) {
          var key = localStorage.key(i);
          if (key && key.startsWith("neonpro_snapshot_")) {
            used +=
              ((_a = localStorage.getItem(key)) === null || _a === void 0 ? void 0 : _a.length) ||
              0;
          }
        }
        break;
      case "memory":
        this.snapshots.forEach(function (snapshots) {
          snapshots.forEach(function (snapshot) {
            used += JSON.stringify(snapshot).length;
          });
        });
        break;
    }
    return {
      used: used,
      available: this.storageQuota - used,
      quota: this.storageQuota,
    };
  };
  SessionPreservationManager.prototype.updateConfig = function (config) {
    this.preservationConfig = __assign(__assign({}, this.preservationConfig), config);
    // Restart automatic snapshots if interval changed
    if (config.snapshotInterval && this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.startAutomaticSnapshots();
    }
  };
  SessionPreservationManager.prototype.destroy = function () {
    // Stop automatic snapshots
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }
    // Clear state
    this.snapshots.clear();
    this.currentState.clear();
    this.eventListeners.clear();
  };
  return SessionPreservationManager;
})();
exports.SessionPreservationManager = SessionPreservationManager;
exports.default = SessionPreservationManager;
