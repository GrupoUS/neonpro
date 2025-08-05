"use strict";
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
exports.PatientPortal = void 0;
// Import patient portal components
var session_manager_1 = require("./auth/session-manager");
var portal_dashboard_1 = require("./dashboard/portal-dashboard");
var appointment_manager_1 = require("./appointments/appointment-manager");
var upload_manager_1 = require("./uploads/upload-manager");
var communication_manager_1 = require("./communication/communication-manager");
/**
 * Main Patient Portal class that orchestrates all portal functionality
 */
var PatientPortal = /** @class */ (function () {
  function PatientPortal(
    supabase,
    auditLogger,
    lgpdManager,
    encryptionService,
    notificationService,
    config,
  ) {
    this.isInitialized = false;
    this.supabase = supabase;
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.encryptionService = encryptionService;
    this.notificationService = notificationService;
    this.config = config;
    this.portalId = "portal_"
      .concat(Date.now(), "_")
      .concat(Math.random().toString(36).substring(7));
    // Initialize components
    this.initializeComponents();
  }
  /**
   * Initialize all portal components
   */
  PatientPortal.prototype.initializeComponents = function () {
    // Initialize session manager
    this.sessionManager = new session_manager_1.SessionManager(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.encryptionService,
      this.config.session,
    );
    // Initialize dashboard
    this.dashboard = new portal_dashboard_1.PortalDashboard(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.sessionManager,
      this.config.dashboard,
    );
    // Initialize appointment manager
    this.appointments = new appointment_manager_1.AppointmentManager(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.sessionManager,
      this.config.appointments,
    );
    // Initialize upload manager
    this.uploads = new upload_manager_1.UploadManager(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.sessionManager,
      this.encryptionService,
      this.config.uploads,
    );
    // Initialize communication manager
    this.communication = new communication_manager_1.CommunicationManager(
      this.supabase,
      this.auditLogger,
      this.lgpdManager,
      this.sessionManager,
      this.notificationService,
      this.config.communication,
    );
  };
  /**
   * Initialize the patient portal
   */
  PatientPortal.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var healthCheck, configValidation, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 6]);
            return [4 /*yield*/, this.performHealthCheck()];
          case 1:
            healthCheck = _a.sent();
            if (healthCheck.status === "unhealthy") {
              return [
                2 /*return*/,
                {
                  success: false,
                  portalId: this.portalId,
                  message: "Portal não pode ser inicializado devido a problemas de sistema.",
                  availableFeatures: [],
                  maintenanceMode: true,
                },
              ];
            }
            configValidation = this.validateConfiguration();
            if (!configValidation.isValid) {
              throw new Error(
                "Configura\u00E7\u00E3o inv\u00E1lida: ".concat(configValidation.message),
              );
            }
            // Initialize database connections and verify tables
            return [4 /*yield*/, this.verifyDatabaseSchema()];
          case 2:
            // Initialize database connections and verify tables
            _a.sent();
            // Set up event listeners
            this.setupEventListeners();
            // Mark as initialized
            this.isInitialized = true;
            // Log portal initialization
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "portal_initialized",
                userId: "system",
                userType: "system",
                details: {
                  portalId: this.portalId,
                  features: this.getAvailableFeatures(),
                  healthStatus: healthCheck.status,
                },
              }),
            ];
          case 3:
            // Log portal initialization
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                portalId: this.portalId,
                message: "Portal do paciente inicializado com sucesso!",
                availableFeatures: this.getAvailableFeatures(),
                maintenanceMode: false,
              },
            ];
          case 4:
            error_1 = _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "portal_initialization_failed",
                userId: "system",
                userType: "system",
                details: { error: error_1.message },
              }),
            ];
          case 5:
            _a.sent();
            throw error_1;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform system health check
   */
  PatientPortal.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, healthCheck, dbError, storageError, _a, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            healthCheck = {
              status: "healthy",
              components: {
                database: "up",
                storage: "up",
                notifications: "up",
                encryption: "up",
              },
              responseTime: 0,
              lastCheck: new Date(),
            };
            _b.label = 1;
          case 1:
            _b.trys.push([1, 8, , 9]);
            return [4 /*yield*/, this.supabase.from("patients").select("id").limit(1)];
          case 2:
            dbError = _b.sent().error;
            if (dbError) {
              healthCheck.components.database = "down";
              healthCheck.status = "unhealthy";
            }
            return [
              4 /*yield*/,
              this.supabase.storage.from("patient-files").list("", { limit: 1 }),
            ];
          case 3:
            storageError = _b.sent().error;
            if (storageError) {
              healthCheck.components.storage = "down";
              healthCheck.status = healthCheck.status === "healthy" ? "degraded" : "unhealthy";
            }
            _b.label = 4;
          case 4:
            _b.trys.push([4, 6, , 7]);
            return [4 /*yield*/, this.encryptionService.encrypt("test")];
          case 5:
            _b.sent();
            return [3 /*break*/, 7];
          case 6:
            _a = _b.sent();
            healthCheck.components.encryption = "down";
            healthCheck.status = healthCheck.status === "healthy" ? "degraded" : "unhealthy";
            return [3 /*break*/, 7];
          case 7:
            return [3 /*break*/, 9];
          case 8:
            error_2 = _b.sent();
            healthCheck.status = "unhealthy";
            return [3 /*break*/, 9];
          case 9:
            healthCheck.responseTime = Date.now() - startTime;
            return [2 /*return*/, healthCheck];
        }
      });
    });
  };
  /**
   * Validate portal configuration
   */
  PatientPortal.prototype.validateConfiguration = function () {
    // Validate session configuration
    if (!this.config.session.secretKey || this.config.session.secretKey.length < 32) {
      return {
        isValid: false,
        message: "Chave secreta da sessão deve ter pelo menos 32 caracteres",
      };
    }
    // Validate security settings
    if (this.config.security.sessionTimeout < 300) {
      // 5 minutes minimum
      return {
        isValid: false,
        message: "Timeout de sessão deve ser pelo menos 5 minutos",
      };
    }
    // Validate upload settings
    if (this.config.uploads.maxFileSize <= 0) {
      return {
        isValid: false,
        message: "Tamanho máximo de arquivo deve ser maior que zero",
      };
    }
    return { isValid: true, message: "Configuração válida" };
  };
  /**
   * Verify database schema
   */
  PatientPortal.prototype.verifyDatabaseSchema = function () {
    return __awaiter(this, void 0, void 0, function () {
      var requiredTables, _i, requiredTables_1, table, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            requiredTables = [
              "patients",
              "appointments",
              "services",
              "staff",
              "patient_uploads",
              "patient_files",
              "messages",
              "conversations",
              "patient_sessions",
            ];
            (_i = 0), (requiredTables_1 = requiredTables);
            _a.label = 1;
          case 1:
            if (!(_i < requiredTables_1.length)) return [3 /*break*/, 4];
            table = requiredTables_1[_i];
            return [4 /*yield*/, this.supabase.from(table).select("*").limit(1)];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error(
                "Tabela requerida '".concat(table, "' n\u00E3o encontrada ou inacess\u00EDvel"),
              );
            }
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
  /**
   * Setup event listeners
   */
  PatientPortal.prototype.setupEventListeners = function () {
    // Set up real-time subscriptions for patient data updates
    // This would include listening for appointment updates, new messages, etc.
    var _this = this;
    // Example: Listen for new messages
    this.supabase
      .channel("patient-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        function (payload) {
          _this.handleNewMessage(payload.new);
        },
      )
      .subscribe();
  };
  /**
   * Handle new message events
   */
  PatientPortal.prototype.handleNewMessage = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get available features based on configuration
   */
  PatientPortal.prototype.getAvailableFeatures = function () {
    var features = [];
    if (this.config.features.appointmentBooking) features.push("appointment_booking");
    if (this.config.features.documentUpload) features.push("document_upload");
    if (this.config.features.messaging) features.push("messaging");
    if (this.config.features.treatmentTracking) features.push("treatment_tracking");
    if (this.config.features.billingAccess) features.push("billing_access");
    if (this.config.features.telehealth) features.push("telehealth");
    return features;
  };
  /**
   * Shutdown the portal gracefully
   */
  PatientPortal.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 6]);
            // Close all active sessions
            return [4 /*yield*/, this.sessionManager.terminateAllSessions()];
          case 1:
            // Close all active sessions
            _a.sent();
            // Unsubscribe from real-time channels
            return [4 /*yield*/, this.supabase.removeAllChannels()];
          case 2:
            // Unsubscribe from real-time channels
            _a.sent();
            // Log shutdown
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "portal_shutdown",
                userId: "system",
                userType: "system",
                details: { portalId: this.portalId },
              }),
            ];
          case 3:
            // Log shutdown
            _a.sent();
            this.isInitialized = false;
            return [3 /*break*/, 6];
          case 4:
            error_3 = _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "portal_shutdown_failed",
                userId: "system",
                userType: "system",
                details: { error: error_3.message },
              }),
            ];
          case 5:
            _a.sent();
            throw error_3;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if portal is initialized
   */
  PatientPortal.prototype.isReady = function () {
    return this.isInitialized;
  };
  /**
   * Get portal configuration
   */
  PatientPortal.prototype.getConfiguration = function () {
    return __assign({}, this.config);
  };
  /**
   * Get portal ID
   */
  PatientPortal.prototype.getPortalId = function () {
    return this.portalId;
  };
  return PatientPortal;
})();
exports.PatientPortal = PatientPortal;
