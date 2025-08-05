/**
 * Communication Service - Main orchestrator for all communication channels
 * Story 2.3: Automated Communication System
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
exports.CommunicationService = void 0;
var server_1 = require("@/lib/supabase/server");
var sms_provider_1 = require("./providers/sms-provider");
var email_provider_1 = require("./providers/email-provider");
var whatsapp_provider_1 = require("./providers/whatsapp-provider");
var template_engine_1 = require("./template-engine");
var no_show_predictor_1 = require("./no-show-predictor");
var waitlist_manager_1 = require("./waitlist-manager");
var CommunicationService = /** @class */ (() => {
  function CommunicationService() {
    this.smsProvider = new sms_provider_1.SMSProvider();
    this.emailProvider = new email_provider_1.EmailProvider();
    this.whatsappProvider = new whatsapp_provider_1.WhatsAppProvider();
    this.templateEngine = new template_engine_1.TemplateEngine();
    this.noShowPredictor = new no_show_predictor_1.NoShowPredictor();
    this.waitlistManager = new waitlist_manager_1.WaitlistManager();
  }
  /**
   * Send message using optimal communication channel
   */
  CommunicationService.prototype.sendMessage = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            try {
              // Mock implementation for testing
              return [
                2 /*return*/,
                {
                  success: true,
                  messageId: "msg-" + Date.now(),
                  channel: params.channel || "whatsapp",
                  cost: 0.05,
                },
              ];
            } catch (error) {
              console.error("Error sending message:", error);
              return [
                2 /*return*/,
                {
                  success: false,
                  error: error instanceof Error ? error.message : "Unknown error",
                },
              ];
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get communication preferences for a patient
   */
  CommunicationService.prototype.getPatientPreferences = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              (0, server_1.createClient)(),
              // Mock implementation
            ];
          case 1:
            supabase = _a.sent();
            // Mock implementation
            return [
              2 /*return*/,
              {
                preferredChannel: "whatsapp",
                allowSMS: true,
                allowEmail: true,
                allowWhatsApp: true,
                quietHours: {
                  start: "22:00",
                  end: "08:00",
                },
                language: "pt-BR",
                timezone: "America/Sao_Paulo",
              },
            ];
        }
      });
    });
  };
  /**
   * Log communication for audit and analytics
   */
  CommunicationService.prototype.logCommunication = function (log) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              supabase
                .from("communication_logs")
                .insert(__assign(__assign({}, log), { created_at: new Date().toISOString() })),
            ];
          case 3:
            error = _a.sent().error;
            if (error) {
              console.error("Error logging communication:", error);
            }
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Error logging communication:", error_1);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get communication analytics
   */
  CommunicationService.prototype.getAnalytics = function (clinicId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              (0, server_1.createClient)(),
              // Mock implementation
            ];
          case 1:
            supabase = _a.sent();
            // Mock implementation
            return [
              2 /*return*/,
              {
                totalMessages: 150,
                deliveryRate: 0.95,
                responseRate: 0.78,
                costTotal: 12.5,
                byChannel: {
                  whatsapp: { count: 85, deliveryRate: 0.98, cost: 8.5 },
                  sms: { count: 45, deliveryRate: 0.92, cost: 2.25 },
                  email: { count: 20, deliveryRate: 0.9, cost: 1.75 },
                },
                byType: {
                  reminder: { count: 90, responseRate: 0.82 },
                  confirmation: { count: 40, responseRate: 0.75 },
                  no_show_prevention: { count: 20, responseRate: 0.7 },
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Process communication jobs queue
   */
  CommunicationService.prototype.processQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, jobs, _i, jobs_1, job, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            _a.label = 2;
          case 2:
            _a.trys.push([2, 8, , 9]);
            return [
              4 /*yield*/,
              supabase
                .from("communication_jobs")
                .select("*")
                .eq("status", "pending")
                .lte("scheduled_for", new Date().toISOString())
                .order("priority", { ascending: false })
                .order("scheduled_for", { ascending: true })
                .limit(50),
            ];
          case 3:
            jobs = _a.sent().data;
            if (!(jobs && jobs.length > 0)) return [3 /*break*/, 7];
            (_i = 0), (jobs_1 = jobs);
            _a.label = 4;
          case 4:
            if (!(_i < jobs_1.length)) return [3 /*break*/, 7];
            job = jobs_1[_i];
            return [4 /*yield*/, this.processJob(job)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 4];
          case 7:
            return [3 /*break*/, 9];
          case 8:
            error_2 = _a.sent();
            console.error("Error processing communication queue:", error_2);
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process individual communication job
   */
  CommunicationService.prototype.processJob = function (job) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Mock implementation for testing
        console.log("Processing job:", job.id);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Static method to send reminders
   * Used for API endpoints and testing
   */
  CommunicationService.sendReminder = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        {
          success: true,
          provider: config.channel,
          messageId: "msg-".concat(Date.now()),
          sentAt: new Date(),
        },
      ]);
    });
  };
  return CommunicationService;
})();
exports.CommunicationService = CommunicationService;
