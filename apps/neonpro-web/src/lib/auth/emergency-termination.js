/**
 * Emergency Session Termination System
 * Story 1.4 - Task 8: Emergency termination capabilities
 *
 * Features:
 * - Immediate session termination
 * - Bulk session management
 * - Emergency protocols
 * - Security incident response
 * - Audit trail for terminations
 * - Recovery procedures
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
exports.EmergencyTermination = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var security_audit_logger_1 = require("./security-audit-logger");
var DEFAULT_CONFIG = {
  enabled: true,
  requireApproval: {
    singleSession: false,
    userSessions: true,
    allSessions: true,
    deviceSessions: true,
    roleBasedSessions: true,
  },
  approverRoles: ["owner", "manager"],
  autoPreserveData: true,
  notificationSettings: {
    notifyUsers: true,
    notifyAdministrators: true,
    emailNotifications: true,
    smsNotifications: false,
  },
  rateLimiting: {
    enabled: true,
    maxTerminationsPerHour: 10,
    maxTerminationsPerDay: 50,
    cooldownPeriod: 5,
  },
  auditSettings: {
    detailedLogging: true,
    retentionDays: 90,
    realTimeAlerts: true,
  },
};
var DEFAULT_PROTOCOLS = [
  {
    protocolId: "security_breach",
    name: "Security Breach Response",
    description: "Immediate response to detected security breaches",
    triggerConditions: ["multiple_failed_logins", "suspicious_activity", "unauthorized_access"],
    automaticTrigger: true,
    severity: "critical",
    actions: {
      terminateAllSessions: true,
      terminateUserSessions: false,
      terminateDeviceSessions: false,
      preserveData: true,
      notifyUsers: true,
      notifyAdministrators: true,
      lockAccounts: true,
      disableNewLogins: true,
      escalateToSecurity: true,
    },
    approvalRequired: false,
    approverRoles: ["owner"],
    cooldownPeriod: 60,
    isActive: true,
    createdAt: new Date(),
  },
  {
    protocolId: "data_breach",
    name: "Data Breach Response",
    description: "Response to potential data breaches",
    triggerConditions: ["unauthorized_data_access", "data_exfiltration", "privilege_escalation"],
    automaticTrigger: true,
    severity: "critical",
    actions: {
      terminateAllSessions: true,
      terminateUserSessions: false,
      terminateDeviceSessions: false,
      preserveData: true,
      notifyUsers: true,
      notifyAdministrators: true,
      lockAccounts: false,
      disableNewLogins: true,
      escalateToSecurity: true,
    },
    approvalRequired: false,
    approverRoles: ["owner"],
    cooldownPeriod: 30,
    isActive: true,
    createdAt: new Date(),
  },
  {
    protocolId: "compromised_account",
    name: "Compromised Account Response",
    description: "Response to compromised user accounts",
    triggerConditions: ["unusual_login_pattern", "location_anomaly", "device_anomaly"],
    automaticTrigger: false,
    severity: "high",
    actions: {
      terminateAllSessions: false,
      terminateUserSessions: true,
      terminateDeviceSessions: false,
      preserveData: true,
      notifyUsers: true,
      notifyAdministrators: true,
      lockAccounts: true,
      disableNewLogins: false,
      escalateToSecurity: false,
    },
    approvalRequired: true,
    approverRoles: ["owner", "manager"],
    cooldownPeriod: 15,
    isActive: true,
    createdAt: new Date(),
  },
];
var EmergencyTermination = /** @class */ (() => {
  function EmergencyTermination(supabaseUrl, supabaseKey, sessionPreservation, customConfig) {
    this.protocols = new Map();
    this.pendingRequests = new Map();
    this.rateLimitTracker = new Map();
    this.activeSessions = new Map();
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = new security_audit_logger_1.SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.sessionPreservation = sessionPreservation;
    this.config = __assign(__assign({}, DEFAULT_CONFIG), customConfig);
    // Initialize default protocols
    DEFAULT_PROTOCOLS.forEach((protocol) => {
      this.protocols.set(protocol.protocolId, protocol);
    });
    if (this.config.enabled) {
      this.initialize();
    }
  }
  /**
   * Initialize emergency termination system
   */
  EmergencyTermination.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Load custom protocols
            return [4 /*yield*/, this.loadCustomProtocols()];
          case 1:
            // Load custom protocols
            _a.sent();
            // Load active sessions
            return [4 /*yield*/, this.loadActiveSessions()];
          case 2:
            // Load active sessions
            _a.sent();
            // Set up real-time monitoring
            return [4 /*yield*/, this.setupRealtimeMonitoring()];
          case 3:
            // Set up real-time monitoring
            _a.sent();
            console.log("Emergency termination system initialized");
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to initialize emergency termination:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Request emergency termination
   */
  EmergencyTermination.prototype.requestTermination = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, terminationRequest, result, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            startTime = Date.now();
            terminationRequest = __assign(__assign({}, request), {
              requestId: "term_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              timestamp: new Date(),
            });
            // Validate request
            return [4 /*yield*/, this.validateTerminationRequest(terminationRequest)];
          case 1:
            // Validate request
            _a.sent();
            // Check rate limits
            return [4 /*yield*/, this.checkRateLimits(terminationRequest.initiatedBy)];
          case 2:
            // Check rate limits
            _a.sent();
            if (!this.requiresApproval(terminationRequest)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.requestApproval(terminationRequest)];
          case 3:
            return [2 /*return*/, _a.sent()];
          case 4:
            return [4 /*yield*/, this.executeTermination(terminationRequest)];
          case 5:
            result = _a.sent();
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            // Log the termination
            return [4 /*yield*/, this.logTermination(terminationRequest, result)];
          case 6:
            // Log the termination
            _a.sent();
            return [2 /*return*/, result];
          case 7:
            error_2 = _a.sent();
            console.error("Failed to request termination:", error_2);
            throw error_2;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute emergency protocol
   */
  EmergencyTermination.prototype.executeProtocol = function (
    protocolId,
    initiatedBy,
    initiatorRole,
    context,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var protocol, timeSinceLastTrigger, cooldownMs, terminationRequest, result, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 10]);
            protocol = this.protocols.get(protocolId);
            if (!protocol) {
              throw new Error("Protocol ".concat(protocolId, " not found"));
            }
            if (!protocol.isActive) {
              throw new Error("Protocol ".concat(protocolId, " is not active"));
            }
            // Check cooldown period
            if (protocol.lastTriggered) {
              timeSinceLastTrigger = Date.now() - protocol.lastTriggered.getTime();
              cooldownMs = protocol.cooldownPeriod * 60 * 1000;
              if (timeSinceLastTrigger < cooldownMs) {
                throw new Error("Protocol ".concat(protocolId, " is in cooldown period"));
              }
            }
            terminationRequest = {
              requestId: "protocol_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              initiatedBy: initiatedBy,
              initiatorRole: initiatorRole,
              terminationType: protocol.actions.terminateAllSessions
                ? "all_sessions"
                : "user_sessions",
              targetIdentifier: protocol.actions.terminateAllSessions ? "all" : initiatedBy,
              reason: "Emergency protocol: ".concat(protocol.name),
              severity: protocol.severity,
              preserveData: protocol.actions.preserveData,
              notifyUsers: protocol.actions.notifyUsers,
              timestamp: new Date(),
              metadata: {
                protocolId: protocolId,
                protocolName: protocol.name,
                automaticTrigger: protocol.automaticTrigger,
                context: context || {},
              },
            };
            return [4 /*yield*/, this.executeTermination(terminationRequest)];
          case 1:
            result = _a.sent();
            // Update protocol last triggered time
            protocol.lastTriggered = new Date();
            return [4 /*yield*/, this.updateProtocol(protocol)];
          case 2:
            _a.sent();
            if (!protocol.actions.lockAccounts) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.lockUserAccounts(result.terminatedSessions.map((s) => s.userId)),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            if (!protocol.actions.disableNewLogins) return [3 /*break*/, 6];
            return [4 /*yield*/, this.disableNewLogins()];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            if (!protocol.actions.escalateToSecurity) return [3 /*break*/, 8];
            return [4 /*yield*/, this.escalateToSecurity(terminationRequest, result)];
          case 7:
            _a.sent();
            _a.label = 8;
          case 8:
            return [2 /*return*/, result];
          case 9:
            error_3 = _a.sent();
            console.error("Failed to execute protocol:", error_3);
            throw error_3;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate single session
   */
  EmergencyTermination.prototype.terminateSession = function (
    sessionId_1,
    initiatedBy_1,
    reason_1,
  ) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (sessionId, initiatedBy, reason, preserveData) {
        var session, terminationRequest, error_4;
        if (preserveData === void 0) {
          preserveData = true;
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              session = this.activeSessions.get(sessionId);
              if (!session) {
                throw new Error("Session not found");
              }
              terminationRequest = {
                requestId: "single_"
                  .concat(Date.now(), "_")
                  .concat(Math.random().toString(36).substr(2, 9)),
                initiatedBy: initiatedBy,
                initiatorRole: "manager", // Default role for single session termination
                terminationType: "single_session",
                targetIdentifier: sessionId,
                reason: reason,
                severity: "medium",
                preserveData: preserveData,
                notifyUsers: true,
                timestamp: new Date(),
                metadata: {},
              };
              return [4 /*yield*/, this.executeTermination(terminationRequest)];
            case 1:
              return [2 /*return*/, _a.sent()];
            case 2:
              error_4 = _a.sent();
              console.error("Failed to terminate session:", error_4);
              throw error_4;
            case 3:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  /**
   * Terminate all user sessions
   */
  EmergencyTermination.prototype.terminateUserSessions = function (
    userId_1,
    initiatedBy_1,
    reason_1,
  ) {
    return __awaiter(this, arguments, void 0, function (userId, initiatedBy, reason, preserveData) {
      var terminationRequest, error_5;
      if (preserveData === void 0) {
        preserveData = true;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            terminationRequest = {
              requestId: "user_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              initiatedBy: initiatedBy,
              initiatorRole: "manager",
              terminationType: "user_sessions",
              targetIdentifier: userId,
              reason: reason,
              severity: "high",
              preserveData: preserveData,
              notifyUsers: true,
              timestamp: new Date(),
              metadata: {},
            };
            return [4 /*yield*/, this.executeTermination(terminationRequest)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_5 = _a.sent();
            console.error("Failed to terminate user sessions:", error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate all sessions (nuclear option)
   */
  EmergencyTermination.prototype.terminateAllSessions = function (initiatedBy_1, reason_1) {
    return __awaiter(this, arguments, void 0, function (initiatedBy, reason, preserveData) {
      var terminationRequest, error_6;
      if (preserveData === void 0) {
        preserveData = true;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            terminationRequest = {
              requestId: "all_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              initiatedBy: initiatedBy,
              initiatorRole: "owner",
              terminationType: "all_sessions",
              targetIdentifier: "all",
              reason: reason,
              severity: "critical",
              preserveData: preserveData,
              notifyUsers: true,
              timestamp: new Date(),
              metadata: {},
            };
            return [4 /*yield*/, this.executeTermination(terminationRequest)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_6 = _a.sent();
            console.error("Failed to terminate all sessions:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get termination audit logs
   */
  EmergencyTermination.prototype.getTerminationLogs = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("termination_audit_logs").select("*");
            if (filters === null || filters === void 0 ? void 0 : filters.initiatedBy) {
              query = query.eq("initiated_by", filters.initiatedBy);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.userId) {
              query = query.eq("user_id", filters.userId);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.severity) {
              query = query.eq("severity", filters.severity);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.startDate) {
              query = query.gte("terminated_at", filters.startDate.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.endDate) {
              query = query.lte("terminated_at", filters.endDate.toISOString());
            }
            query = query
              .order("terminated_at", { ascending: false })
              .limit((filters === null || filters === void 0 ? void 0 : filters.limit) || 100);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get termination logs: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToAuditLog)];
          case 2:
            error_7 = _b.sent();
            console.error("Failed to get termination logs:", error_7);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Add custom emergency protocol
   */
  EmergencyTermination.prototype.addProtocol = function (protocol) {
    return __awaiter(this, void 0, void 0, function () {
      var newProtocol, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            newProtocol = __assign(__assign({}, protocol), { createdAt: new Date() });
            // Store protocol
            return [
              4 /*yield*/,
              this.supabase.from("emergency_protocols").insert({
                protocol_id: newProtocol.protocolId,
                name: newProtocol.name,
                description: newProtocol.description,
                trigger_conditions: newProtocol.triggerConditions,
                automatic_trigger: newProtocol.automaticTrigger,
                severity: newProtocol.severity,
                actions: newProtocol.actions,
                approval_required: newProtocol.approvalRequired,
                approver_roles: newProtocol.approverRoles,
                cooldown_period: newProtocol.cooldownPeriod,
                is_active: newProtocol.isActive,
                created_at: newProtocol.createdAt.toISOString(),
              }),
            ];
          case 1:
            // Store protocol
            _a.sent();
            // Add to protocols map
            this.protocols.set(newProtocol.protocolId, newProtocol);
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            console.error("Failed to add protocol:", error_8);
            throw error_8;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update emergency protocol
   */
  EmergencyTermination.prototype.updateProtocol = function (protocol) {
    return __awaiter(this, void 0, void 0, function () {
      var error_9;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("emergency_protocols")
                .update({
                  name: protocol.name,
                  description: protocol.description,
                  trigger_conditions: protocol.triggerConditions,
                  automatic_trigger: protocol.automaticTrigger,
                  severity: protocol.severity,
                  actions: protocol.actions,
                  approval_required: protocol.approvalRequired,
                  approver_roles: protocol.approverRoles,
                  cooldown_period: protocol.cooldownPeriod,
                  is_active: protocol.isActive,
                  last_triggered:
                    (_a = protocol.lastTriggered) === null || _a === void 0
                      ? void 0
                      : _a.toISOString(),
                })
                .eq("protocol_id", protocol.protocolId),
            ];
          case 1:
            _b.sent();
            // Update protocols map
            this.protocols.set(protocol.protocolId, protocol);
            return [3 /*break*/, 3];
          case 2:
            error_9 = _b.sent();
            console.error("Failed to update protocol:", error_9);
            throw error_9;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get emergency protocols
   */
  EmergencyTermination.prototype.getProtocols = function () {
    return Array.from(this.protocols.values());
  };
  /**
   * Update configuration
   */
  EmergencyTermination.prototype.updateConfig = function (newConfig) {
    this.config = __assign(__assign({}, this.config), newConfig);
  };
  // Private methods
  EmergencyTermination.prototype.loadCustomProtocols = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, _i, _b, protocolData, protocol, error_10;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("emergency_protocols").select("*").eq("is_active", true),
            ];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to load custom protocols:", error);
              return [2 /*return*/];
            }
            for (_i = 0, _b = data || []; _i < _b.length; _i++) {
              protocolData = _b[_i];
              protocol = this.mapDatabaseToProtocol(protocolData);
              this.protocols.set(protocol.protocolId, protocol);
            }
            return [3 /*break*/, 3];
          case 2:
            error_10 = _c.sent();
            console.error("Failed to load custom protocols:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyTermination.prototype.loadActiveSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, _i, _b, sessionData, error_11;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("user_sessions").select("*").eq("is_active", true),
            ];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to load active sessions:", error);
              return [2 /*return*/];
            }
            for (_i = 0, _b = data || []; _i < _b.length; _i++) {
              sessionData = _b[_i];
              this.activeSessions.set(sessionData.session_id, sessionData);
            }
            return [3 /*break*/, 3];
          case 2:
            error_11 = _c.sent();
            console.error("Failed to load active sessions:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyTermination.prototype.setupRealtimeMonitoring = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        try {
          // Subscribe to session changes
          this.supabase
            .channel("emergency_sessions")
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "user_sessions",
              },
              (payload) => {
                _this.handleSessionChange(payload);
              },
            )
            .subscribe();
        } catch (error) {
          console.error("Failed to setup realtime monitoring:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  EmergencyTermination.prototype.validateTerminationRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, _b, userData, userError;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _a = request.terminationType;
            switch (_a) {
              case "single_session":
                return [3 /*break*/, 1];
              case "user_sessions":
                return [3 /*break*/, 2];
              case "all_sessions":
                return [3 /*break*/, 4];
            }
            return [3 /*break*/, 5];
          case 1:
            if (!this.activeSessions.has(request.targetIdentifier)) {
              throw new Error("Target session not found");
            }
            return [3 /*break*/, 6];
          case 2:
            return [
              4 /*yield*/,
              this.supabase.from("users").select("id").eq("id", request.targetIdentifier).single(),
            ];
          case 3:
            (_b = _c.sent()), (userData = _b.data), (userError = _b.error);
            if (userError || !userData) {
              throw new Error("Target user not found");
            }
            return [3 /*break*/, 6];
          case 4:
            // No validation needed
            return [3 /*break*/, 6];
          case 5:
            throw new Error("Invalid termination type");
          case 6:
            // Validate initiator permissions
            if (!this.hasTerminationPermission(request.initiatorRole, request.terminationType)) {
              throw new Error("Insufficient permissions for termination type");
            }
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyTermination.prototype.checkRateLimits = function (initiatedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var now, tracker;
      return __generator(this, function (_a) {
        if (!this.config.rateLimiting.enabled) {
          return [2 /*return*/];
        }
        now = new Date();
        tracker = this.rateLimitTracker.get(initiatedBy) || { count: 0, lastReset: now };
        // Reset counter if hour has passed
        if (now.getTime() - tracker.lastReset.getTime() > 60 * 60 * 1000) {
          tracker.count = 0;
          tracker.lastReset = now;
        }
        if (tracker.count >= this.config.rateLimiting.maxTerminationsPerHour) {
          throw new Error("Rate limit exceeded for termination requests");
        }
        tracker.count++;
        this.rateLimitTracker.set(initiatedBy, tracker);
        return [2 /*return*/];
      });
    });
  };
  EmergencyTermination.prototype.requiresApproval = function (request) {
    switch (request.terminationType) {
      case "single_session":
        return this.config.requireApproval.singleSession;
      case "user_sessions":
        return this.config.requireApproval.userSessions;
      case "all_sessions":
        return this.config.requireApproval.allSessions;
      case "device_sessions":
        return this.config.requireApproval.deviceSessions;
      case "role_sessions":
        return this.config.requireApproval.roleBasedSessions;
      default:
        return true;
    }
  };
  EmergencyTermination.prototype.requestApproval = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Store pending request
            this.pendingRequests.set(request.requestId, request);
            // Notify approvers
            return [4 /*yield*/, this.notifyApprovers(request)];
          case 1:
            // Notify approvers
            _a.sent();
            // Return pending result
            return [
              2 /*return*/,
              {
                requestId: request.requestId,
                success: false,
                terminatedSessions: [],
                failedTerminations: [],
                totalAttempted: 0,
                totalSuccessful: 0,
                totalFailed: 0,
                executionTime: 0,
                warnings: ["Termination request pending approval"],
                errors: [],
              },
            ];
        }
      });
    });
  };
  EmergencyTermination.prototype.executeTermination = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var result,
        targetSessions,
        _i,
        targetSessions_1,
        session,
        preservationBackupId,
        backup,
        error_12,
        error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            result = {
              requestId: request.requestId,
              success: true,
              terminatedSessions: [],
              failedTerminations: [],
              totalAttempted: 0,
              totalSuccessful: 0,
              totalFailed: 0,
              executionTime: 0,
              warnings: [],
              errors: [],
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 13, , 14]);
            return [4 /*yield*/, this.getTargetSessions(request)];
          case 2:
            targetSessions = _a.sent();
            result.totalAttempted = targetSessions.length;
            (_i = 0), (targetSessions_1 = targetSessions);
            _a.label = 3;
          case 3:
            if (!(_i < targetSessions_1.length)) return [3 /*break*/, 10];
            session = targetSessions_1[_i];
            _a.label = 4;
          case 4:
            _a.trys.push([4, 8, , 9]);
            preservationBackupId = void 0;
            if (!request.preserveData) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.sessionPreservation.createEmergencyBackup(
                session.session_id,
                "Emergency termination: ".concat(request.reason),
              ),
            ];
          case 5:
            backup = _a.sent();
            preservationBackupId = backup.backupId;
            _a.label = 6;
          case 6:
            // Terminate session
            return [4 /*yield*/, this.terminateSessionById(session.session_id)];
          case 7:
            // Terminate session
            _a.sent();
            // Remove from active sessions
            this.activeSessions.delete(session.session_id);
            result.terminatedSessions.push({
              sessionId: session.session_id,
              userId: session.user_id,
              deviceId: session.device_id,
              terminatedAt: new Date(),
              preservationBackupId: preservationBackupId,
            });
            result.totalSuccessful++;
            return [3 /*break*/, 9];
          case 8:
            error_12 = _a.sent();
            result.failedTerminations.push({
              sessionId: session.session_id,
              error: error_12.message,
            });
            result.totalFailed++;
            return [3 /*break*/, 9];
          case 9:
            _i++;
            return [3 /*break*/, 3];
          case 10:
            if (!request.notifyUsers) return [3 /*break*/, 12];
            return [
              4 /*yield*/,
              this.notifyAffectedUsers(result.terminatedSessions, request.reason),
            ];
          case 11:
            _a.sent();
            _a.label = 12;
          case 12:
            result.success = result.totalFailed === 0;
            return [3 /*break*/, 14];
          case 13:
            error_13 = _a.sent();
            result.success = false;
            result.errors.push(error_13.message);
            return [3 /*break*/, 14];
          case 14:
            return [2 /*return*/, result];
        }
      });
    });
  };
  EmergencyTermination.prototype.getTargetSessions = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            query = this.supabase.from("user_sessions").select("*").eq("is_active", true);
            switch (request.terminationType) {
              case "single_session":
                query = query.eq("session_id", request.targetIdentifier);
                break;
              case "user_sessions":
                query = query.eq("user_id", request.targetIdentifier);
                break;
              case "device_sessions":
                query = query.eq("device_id", request.targetIdentifier);
                break;
              case "role_sessions":
                query = query.eq("user_role", request.targetIdentifier);
                break;
              case "all_sessions":
                // No additional filter needed
                break;
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get target sessions: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  EmergencyTermination.prototype.terminateSessionById = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Mark session as inactive
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  is_active: false,
                  terminated_at: new Date().toISOString(),
                  termination_reason: "emergency_termination",
                })
                .eq("session_id", sessionId),
            ];
          case 1:
            // Mark session as inactive
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_14 = _a.sent();
            console.error("Failed to terminate session ".concat(sessionId, ":"), error_14);
            throw error_14;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyTermination.prototype.logTermination = function (request, result) {
    return __awaiter(this, void 0, void 0, function () {
      var _i,
        _a,
        terminatedSession,
        auditLog,
        _b,
        _c,
        failedTermination,
        session,
        auditLog,
        error_15;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 9, , 10]);
            (_i = 0), (_a = result.terminatedSessions);
            _d.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            terminatedSession = _a[_i];
            auditLog = {
              requestId: request.requestId,
              sessionId: terminatedSession.sessionId,
              userId: terminatedSession.userId,
              deviceId: terminatedSession.deviceId,
              initiatedBy: request.initiatedBy,
              initiatorRole: request.initiatorRole,
              terminationType: request.terminationType,
              reason: request.reason,
              severity: request.severity,
              terminatedAt: terminatedSession.terminatedAt,
              preservationBackupId: terminatedSession.preservationBackupId,
              success: true,
              ipAddress: request.metadata.ipAddress || "",
              userAgent: request.metadata.userAgent || "",
              metadata: request.metadata,
            };
            return [4 /*yield*/, this.storeAuditLog(auditLog)];
          case 2:
            _d.sent();
            _d.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            (_b = 0), (_c = result.failedTerminations);
            _d.label = 5;
          case 5:
            if (!(_b < _c.length)) return [3 /*break*/, 8];
            failedTermination = _c[_b];
            session = this.activeSessions.get(failedTermination.sessionId);
            auditLog = {
              requestId: request.requestId,
              sessionId: failedTermination.sessionId,
              userId: (session === null || session === void 0 ? void 0 : session.user_id) || "",
              deviceId: (session === null || session === void 0 ? void 0 : session.device_id) || "",
              initiatedBy: request.initiatedBy,
              initiatorRole: request.initiatorRole,
              terminationType: request.terminationType,
              reason: request.reason,
              severity: request.severity,
              terminatedAt: new Date(),
              success: false,
              errorMessage: failedTermination.error,
              ipAddress: request.metadata.ipAddress || "",
              userAgent: request.metadata.userAgent || "",
              metadata: request.metadata,
            };
            return [4 /*yield*/, this.storeAuditLog(auditLog)];
          case 6:
            _d.sent();
            _d.label = 7;
          case 7:
            _b++;
            return [3 /*break*/, 5];
          case 8:
            return [3 /*break*/, 10];
          case 9:
            error_15 = _d.sent();
            console.error("Failed to log termination:", error_15);
            return [3 /*break*/, 10];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyTermination.prototype.storeAuditLog = function (auditLog) {
    return __awaiter(this, void 0, void 0, function () {
      var error_16;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("termination_audit_logs").insert({
                log_id: "log_"
                  .concat(Date.now(), "_")
                  .concat(Math.random().toString(36).substr(2, 9)),
                request_id: auditLog.requestId,
                session_id: auditLog.sessionId,
                user_id: auditLog.userId,
                device_id: auditLog.deviceId,
                initiated_by: auditLog.initiatedBy,
                initiator_role: auditLog.initiatorRole,
                termination_type: auditLog.terminationType,
                reason: auditLog.reason,
                severity: auditLog.severity,
                terminated_at: auditLog.terminatedAt.toISOString(),
                preservation_backup_id: auditLog.preservationBackupId,
                success: auditLog.success,
                error_message: auditLog.errorMessage,
                ip_address: auditLog.ipAddress,
                user_agent: auditLog.userAgent,
                metadata: auditLog.metadata,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_16 = _a.sent();
            console.error("Failed to store audit log:", error_16);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyTermination.prototype.notifyApprovers = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for notifying approvers
        console.log("Notifying approvers for termination request ".concat(request.requestId));
        return [2 /*return*/];
      });
    });
  };
  EmergencyTermination.prototype.notifyAffectedUsers = function (terminatedSessions, reason) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for notifying affected users
        console.log(
          "Notifying "
            .concat(terminatedSessions.length, " affected users about session termination: ")
            .concat(reason),
        );
        return [2 /*return*/];
      });
    });
  };
  EmergencyTermination.prototype.lockUserAccounts = function (userIds) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for locking user accounts
        console.log("Locking ".concat(userIds.length, " user accounts"));
        return [2 /*return*/];
      });
    });
  };
  EmergencyTermination.prototype.disableNewLogins = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for disabling new logins
        console.log("Disabling new logins system-wide");
        return [2 /*return*/];
      });
    });
  };
  EmergencyTermination.prototype.escalateToSecurity = function (request, result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for escalating to security team
        console.log(
          "Escalating emergency termination to security team: ".concat(request.requestId),
        );
        return [2 /*return*/];
      });
    });
  };
  EmergencyTermination.prototype.hasTerminationPermission = (role, terminationType) => {
    var _a;
    var permissions = {
      owner: [
        "single_session",
        "user_sessions",
        "all_sessions",
        "device_sessions",
        "role_sessions",
      ],
      manager: ["single_session", "user_sessions", "device_sessions"],
      employee: ["single_session"],
      patient: [],
    };
    return (
      ((_a = permissions[role]) === null || _a === void 0
        ? void 0
        : _a.includes(terminationType)) || false
    );
  };
  EmergencyTermination.prototype.handleSessionChange = function (payload) {
    var sessionData = payload.new || payload.old;
    if (payload.eventType === "DELETE" || !sessionData.is_active) {
      this.activeSessions.delete(sessionData.session_id);
    } else {
      this.activeSessions.set(sessionData.session_id, sessionData);
    }
  };
  EmergencyTermination.prototype.mapDatabaseToProtocol = (data) => ({
    protocolId: data.protocol_id,
    name: data.name,
    description: data.description,
    triggerConditions: data.trigger_conditions,
    automaticTrigger: data.automatic_trigger,
    severity: data.severity,
    actions: data.actions,
    approvalRequired: data.approval_required,
    approverRoles: data.approver_roles,
    cooldownPeriod: data.cooldown_period,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    lastTriggered: data.last_triggered ? new Date(data.last_triggered) : undefined,
  });
  EmergencyTermination.prototype.mapDatabaseToAuditLog = (data) => ({
    logId: data.log_id,
    requestId: data.request_id,
    sessionId: data.session_id,
    userId: data.user_id,
    deviceId: data.device_id,
    initiatedBy: data.initiated_by,
    initiatorRole: data.initiator_role,
    terminationType: data.termination_type,
    reason: data.reason,
    severity: data.severity,
    terminatedAt: new Date(data.terminated_at),
    preservationBackupId: data.preservation_backup_id,
    success: data.success,
    errorMessage: data.error_message,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    metadata: data.metadata || {},
  });
  return EmergencyTermination;
})();
exports.EmergencyTermination = EmergencyTermination;
