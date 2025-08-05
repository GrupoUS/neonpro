"use strict";
/**
 * Communication System - Automated Communication Hub
 * Story 2.3: Automated Communication System
 *
 * This module provides a comprehensive automated communication system for NeonPro,
 * including multi-channel messaging, appointment reminders, no-show prediction,
 * waitlist management, and detailed analytics.
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
exports.communicationSystem =
  exports.CommunicationSystem =
  exports.CommunicationAnalytics =
  exports.WaitlistManager =
  exports.NoShowPredictor =
  exports.TemplateEngine =
  exports.WhatsAppProvider =
  exports.EmailProvider =
  exports.SMSProvider =
  exports.CommunicationService =
    void 0;
// Core types
__exportStar(require("./types"), exports);
// Main communication service
var communication_service_1 = require("./communication-service");
Object.defineProperty(exports, "CommunicationService", {
  enumerable: true,
  get: function () {
    return communication_service_1.CommunicationService;
  },
});
// Communication providers
var sms_provider_1 = require("./providers/sms-provider");
Object.defineProperty(exports, "SMSProvider", {
  enumerable: true,
  get: function () {
    return sms_provider_1.SMSProvider;
  },
});
var email_provider_1 = require("./providers/email-provider");
Object.defineProperty(exports, "EmailProvider", {
  enumerable: true,
  get: function () {
    return email_provider_1.EmailProvider;
  },
});
var whatsapp_provider_1 = require("./providers/whatsapp-provider");
Object.defineProperty(exports, "WhatsAppProvider", {
  enumerable: true,
  get: function () {
    return whatsapp_provider_1.WhatsAppProvider;
  },
});
// Template engine
var template_engine_1 = require("./template-engine");
Object.defineProperty(exports, "TemplateEngine", {
  enumerable: true,
  get: function () {
    return template_engine_1.TemplateEngine;
  },
});
// No-show prediction
var no_show_predictor_1 = require("./no-show-predictor");
Object.defineProperty(exports, "NoShowPredictor", {
  enumerable: true,
  get: function () {
    return no_show_predictor_1.NoShowPredictor;
  },
});
// Waitlist management
var waitlist_manager_1 = require("./waitlist-manager");
Object.defineProperty(exports, "WaitlistManager", {
  enumerable: true,
  get: function () {
    return waitlist_manager_1.WaitlistManager;
  },
});
// Analytics and insights
var analytics_1 = require("./analytics");
Object.defineProperty(exports, "CommunicationAnalytics", {
  enumerable: true,
  get: function () {
    return analytics_1.CommunicationAnalytics;
  },
});
/**
 * Main communication system factory
 * Creates and configures the complete communication system
 */
var CommunicationSystem = /** @class */ (function () {
  function CommunicationSystem() {
    this.service = new CommunicationService();
    this.analytics = new CommunicationAnalytics();
    this.waitlistManager = new WaitlistManager();
    this.templateEngine = new TemplateEngine();
    this.noShowPredictor = new NoShowPredictor();
  }
  /**
   * Initialize the communication system
   * Sets up providers, templates, and background jobs
   */
  CommunicationSystem.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Initialize template engine with default templates
            return [4 /*yield*/, this.templateEngine.initializeDefaultTemplates()];
          case 1:
            // Initialize template engine with default templates
            _a.sent();
            console.log("Communication system initialized successfully");
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Failed to initialize communication system:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get system health status
   */
  CommunicationSystem.prototype.getHealthStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      var errors, providers, allProvidersHealthy, status_1;
      return __generator(this, function (_a) {
        try {
          errors = [];
          providers = {};
          // Check provider health (simplified)
          providers.sms = true; // Would check Twilio API
          providers.email = true; // Would check SendGrid API
          providers.whatsapp = true; // Would check WhatsApp API
          allProvidersHealthy = Object.values(providers).every(Boolean);
          status_1 = allProvidersHealthy ? "healthy" : "degraded";
          return [
            2 /*return*/,
            {
              status: status_1,
              providers: providers,
              lastProcessed: new Date(),
              errors: errors,
            },
          ];
        } catch (error) {
          return [
            2 /*return*/,
            {
              status: "unhealthy",
              providers: {},
              lastProcessed: new Date(),
              errors: [error.message],
            },
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Process scheduled communications
   * Should be called by a background job scheduler
   */
  CommunicationSystem.prototype.processScheduledCommunications = function () {
    return __awaiter(this, void 0, void 0, function () {
      var results, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.service.processScheduledJobs()];
          case 1:
            results = _a.sent();
            return [
              2 /*return*/,
              {
                processed: results.length,
                failed: results.filter(function (r) {
                  return !r.success;
                }).length,
                errors: results
                  .filter(function (r) {
                    return !r.success;
                  })
                  .map(function (r) {
                    return r.error || "Unknown error";
                  }),
              },
            ];
          case 2:
            error_2 = _a.sent();
            console.error("Error processing scheduled communications:", error_2);
            return [
              2 /*return*/,
              {
                processed: 0,
                failed: 1,
                errors: [error_2.message],
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process waitlist notifications
   * Should be called periodically to notify patients of available slots
   */
  CommunicationSystem.prototype.processWaitlistNotifications = function () {
    return __awaiter(this, void 0, void 0, function () {
      var results, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.waitlistManager.processNotifications()];
          case 1:
            results = _a.sent();
            return [
              2 /*return*/,
              {
                notified: results.filter(function (r) {
                  return r.notification_sent;
                }).length,
                failed: results.filter(function (r) {
                  return !r.notification_sent;
                }).length,
                errors: results
                  .filter(function (r) {
                    return !r.notification_sent;
                  })
                  .map(function (r) {
                    return r.error || "Unknown error";
                  }),
              },
            ];
          case 2:
            error_3 = _a.sent();
            console.error("Error processing waitlist notifications:", error_3);
            return [
              2 /*return*/,
              {
                notified: 0,
                failed: 1,
                errors: [error_3.message],
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update no-show predictions
   * Should be called daily to update ML model predictions
   */
  CommunicationSystem.prototype.updateNoShowPredictions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var sevenDaysFromNow, results, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            return [
              4 /*yield*/,
              this.noShowPredictor.batchPredict({
                startDate: new Date(),
                endDate: sevenDaysFromNow,
              }),
            ];
          case 1:
            results = _a.sent();
            return [
              2 /*return*/,
              {
                updated: results.length,
                errors: [],
              },
            ];
          case 2:
            error_4 = _a.sent();
            console.error("Error updating no-show predictions:", error_4);
            return [
              2 /*return*/,
              {
                updated: 0,
                errors: [error_4.message],
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return CommunicationSystem;
})();
exports.CommunicationSystem = CommunicationSystem;
// Export singleton instance
exports.communicationSystem = new CommunicationSystem();
// Export default
exports.default = CommunicationSystem;
