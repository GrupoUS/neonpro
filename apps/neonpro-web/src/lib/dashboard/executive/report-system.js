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
exports.createreportSystem =
  exports.ReportSystem =
  exports.ReportInstanceSchema =
  exports.ReportScheduleSchema =
  exports.ReportTemplateSchema =
  exports.ReportStatusSchema =
  exports.ReportFrequencySchema =
  exports.ReportFormatSchema =
  exports.ReportTypeSchema =
    void 0;
var zod_1 = require("zod");
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var kpi_calculation_service_1 = require("./kpi-calculation-service");
// Report Types and Schemas
exports.ReportTypeSchema = zod_1.z.enum([
  "executive_summary",
  "financial_report",
  "operational_report",
  "patient_analytics",
  "staff_performance",
  "custom_report",
]);
exports.ReportFormatSchema = zod_1.z.enum(["pdf", "excel", "csv", "json"]);
exports.ReportFrequencySchema = zod_1.z.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "on_demand",
]);
exports.ReportStatusSchema = zod_1.z.enum([
  "pending",
  "generating",
  "completed",
  "failed",
  "cancelled",
]);
exports.ReportTemplateSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1).max(255),
  description: zod_1.z.string().max(1000).optional(),
  type: exports.ReportTypeSchema,
  isActive: zod_1.z.boolean().default(true),
  configuration: zod_1.z.object({
    sections: zod_1.z.array(
      zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        type: zod_1.z.enum(["kpi_summary", "chart", "table", "text", "image"]),
        dataSource: zod_1.z.string(),
        parameters: zod_1.z.record(zod_1.z.any()).optional(),
        styling: zod_1.z
          .object({
            fontSize: zod_1.z.number().optional(),
            fontFamily: zod_1.z.string().optional(),
            color: zod_1.z.string().optional(),
            backgroundColor: zod_1.z.string().optional(),
            padding: zod_1.z.number().optional(),
            margin: zod_1.z.number().optional(),
          })
          .optional(),
      }),
    ),
    layout: zod_1.z.object({
      orientation: zod_1.z.enum(["portrait", "landscape"]).default("portrait"),
      pageSize: zod_1.z.enum(["A4", "A3", "Letter", "Legal"]).default("A4"),
      margins: zod_1.z.object({
        top: zod_1.z.number().default(20),
        right: zod_1.z.number().default(20),
        bottom: zod_1.z.number().default(20),
        left: zod_1.z.number().default(20),
      }),
      header: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        content: zod_1.z.string().optional(),
        height: zod_1.z.number().default(50),
      }),
      footer: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        content: zod_1.z.string().optional(),
        height: zod_1.z.number().default(30),
      }),
    }),
    filters: zod_1.z
      .object({
        dateRange: zod_1.z.object({
          enabled: zod_1.z.boolean().default(true),
          defaultPeriod: zod_1.z
            .enum(["last_7_days", "last_30_days", "last_quarter", "last_year"])
            .default("last_30_days"),
        }),
        departments: zod_1.z.array(zod_1.z.string()).optional(),
        services: zod_1.z.array(zod_1.z.string()).optional(),
        staff: zod_1.z.array(zod_1.z.string()).optional(),
      })
      .optional(),
  }),
  createdAt: zod_1.z.string().datetime(),
  updatedAt: zod_1.z.string().datetime(),
});
exports.ReportScheduleSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  templateId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1).max(255),
  frequency: exports.ReportFrequencySchema,
  format: exports.ReportFormatSchema,
  isActive: zod_1.z.boolean().default(true),
  schedule: zod_1.z.object({
    dayOfWeek: zod_1.z.number().min(0).max(6).optional(), // For weekly reports
    dayOfMonth: zod_1.z.number().min(1).max(31).optional(), // For monthly reports
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
    timezone: zod_1.z.string().default("America/Sao_Paulo"),
  }),
  recipients: zod_1.z.object({
    emails: zod_1.z.array(zod_1.z.string().email()),
    includeAttachment: zod_1.z.boolean().default(true),
    includeLink: zod_1.z.boolean().default(false),
  }),
  parameters: zod_1.z.record(zod_1.z.any()).optional(),
  lastRun: zod_1.z.string().datetime().optional(),
  nextRun: zod_1.z.string().datetime().optional(),
  createdAt: zod_1.z.string().datetime(),
  updatedAt: zod_1.z.string().datetime(),
});
exports.ReportInstanceSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  templateId: zod_1.z.string().uuid(),
  scheduleId: zod_1.z.string().uuid().optional(),
  clinicId: zod_1.z.string().uuid(),
  name: zod_1.z.string(),
  type: exports.ReportTypeSchema,
  format: exports.ReportFormatSchema,
  status: exports.ReportStatusSchema,
  parameters: zod_1.z.record(zod_1.z.any()),
  generatedBy: zod_1.z.string().uuid().optional(),
  startedAt: zod_1.z.string().datetime(),
  completedAt: zod_1.z.string().datetime().optional(),
  filePath: zod_1.z.string().optional(),
  fileSize: zod_1.z.number().optional(),
  downloadUrl: zod_1.z.string().optional(),
  expiresAt: zod_1.z.string().datetime().optional(),
  errorMessage: zod_1.z.string().optional(),
  metadata: zod_1.z
    .object({
      totalPages: zod_1.z.number().optional(),
      totalRecords: zod_1.z.number().optional(),
      generationTime: zod_1.z.number().optional(), // milliseconds
      dataSourcesUsed: zod_1.z.array(zod_1.z.string()).optional(),
    })
    .optional(),
});
// Report System Service
var ReportSystem = /** @class */ (function () {
  function ReportSystem() {
    this.supabase = (0, client_1.createClient)();
    this.schedulerTimer = null;
    this.SCHEDULER_INTERVAL = 60000; // 1 minute
    this.isRunning = false;
  }
  /**
   * Start the report system scheduler
   */
  ReportSystem.prototype.start = function () {
    var _this = this;
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    logger_1.logger.info("Starting Report System Scheduler...");
    this.schedulerTimer = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, this.processScheduledReports()];
            case 1:
              _a.sent();
              return [3 /*break*/, 3];
            case 2:
              error_1 = _a.sent();
              logger_1.logger.error("Error processing scheduled reports:", error_1);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    }, this.SCHEDULER_INTERVAL);
    logger_1.logger.info("Report System Scheduler started");
  };
  /**
   * Stop the report system scheduler
   */
  ReportSystem.prototype.stop = function () {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    logger_1.logger.info("Report System Scheduler stopped");
  };
  /**
   * Create a new report template
   */
  ReportSystem.prototype.createReportTemplate = function (template) {
    return __awaiter(this, void 0, void 0, function () {
      var templateId, now, _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            templateId = crypto.randomUUID();
            now = new Date().toISOString();
            return [
              4 /*yield*/,
              this.supabase
                .from("report_templates")
                .insert({
                  id: templateId,
                  clinic_id: template.clinicId,
                  name: template.name,
                  description: template.description,
                  type: template.type,
                  is_active: template.isActive,
                  configuration: template.configuration,
                  created_at: now,
                  updated_at: now,
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error creating report template:", error);
              return [2 /*return*/, null];
            }
            return [
              2 /*return*/,
              {
                id: data.id,
                clinicId: data.clinic_id,
                name: data.name,
                description: data.description,
                type: data.type,
                isActive: data.is_active,
                configuration: data.configuration,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
              },
            ];
          case 2:
            error_2 = _b.sent();
            logger_1.logger.error("Error creating report template:", error_2);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create a new report schedule
   */
  ReportSystem.prototype.createReportSchedule = function (schedule) {
    return __awaiter(this, void 0, void 0, function () {
      var scheduleId, now, nextRun, _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            scheduleId = crypto.randomUUID();
            now = new Date().toISOString();
            nextRun = this.calculateNextRun(schedule.frequency, schedule.schedule);
            return [
              4 /*yield*/,
              this.supabase
                .from("report_schedules")
                .insert({
                  id: scheduleId,
                  template_id: schedule.templateId,
                  clinic_id: schedule.clinicId,
                  name: schedule.name,
                  frequency: schedule.frequency,
                  format: schedule.format,
                  is_active: schedule.isActive,
                  schedule: schedule.schedule,
                  recipients: schedule.recipients,
                  parameters: schedule.parameters,
                  next_run: nextRun,
                  created_at: now,
                  updated_at: now,
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error creating report schedule:", error);
              return [2 /*return*/, null];
            }
            return [
              2 /*return*/,
              {
                id: data.id,
                templateId: data.template_id,
                clinicId: data.clinic_id,
                name: data.name,
                frequency: data.frequency,
                format: data.format,
                isActive: data.is_active,
                schedule: data.schedule,
                recipients: data.recipients,
                parameters: data.parameters,
                lastRun: data.last_run,
                nextRun: data.next_run,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
              },
            ];
          case 2:
            error_3 = _b.sent();
            logger_1.logger.error("Error creating report schedule:", error_3);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate a report on demand
   */
  ReportSystem.prototype.generateReport = function (templateId_1, format_1) {
    return __awaiter(this, arguments, void 0, function (templateId, format, parameters, userId) {
      var _a,
        templateData,
        templateError,
        template,
        reportId,
        now,
        reportInstance,
        insertError,
        error_4;
      if (parameters === void 0) {
        parameters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("report_templates").select("*").eq("id", templateId).single(),
            ];
          case 1:
            (_a = _b.sent()), (templateData = _a.data), (templateError = _a.error);
            if (templateError || !templateData) {
              logger_1.logger.error("Report template not found:", templateError);
              return [2 /*return*/, null];
            }
            template = {
              id: templateData.id,
              clinicId: templateData.clinic_id,
              name: templateData.name,
              description: templateData.description,
              type: templateData.type,
              isActive: templateData.is_active,
              configuration: templateData.configuration,
              createdAt: templateData.created_at,
              updatedAt: templateData.updated_at,
            };
            reportId = crypto.randomUUID();
            now = new Date().toISOString();
            reportInstance = {
              id: reportId,
              templateId: template.id,
              clinicId: template.clinicId,
              name: "".concat(template.name, " - ").concat(new Date().toLocaleDateString("pt-BR")),
              type: template.type,
              format: format,
              status: "pending",
              parameters: parameters,
              generatedBy: userId,
              startedAt: now,
            };
            return [
              4 /*yield*/,
              this.supabase.from("report_instances").insert({
                id: reportInstance.id,
                template_id: reportInstance.templateId,
                clinic_id: reportInstance.clinicId,
                name: reportInstance.name,
                type: reportInstance.type,
                format: reportInstance.format,
                status: reportInstance.status,
                parameters: reportInstance.parameters,
                generated_by: reportInstance.generatedBy,
                started_at: reportInstance.startedAt,
              }),
            ];
          case 2:
            insertError = _b.sent().error;
            if (insertError) {
              logger_1.logger.error("Error creating report instance:", insertError);
              return [2 /*return*/, null];
            }
            // Generate report asynchronously
            this.generateReportAsync(reportInstance, template);
            return [
              2 /*return*/,
              __assign(__assign({}, reportInstance), {
                completedAt: undefined,
                filePath: undefined,
                fileSize: undefined,
                downloadUrl: undefined,
                expiresAt: undefined,
                errorMessage: undefined,
                metadata: undefined,
              }),
            ];
          case 3:
            error_4 = _b.sent();
            logger_1.logger.error("Error generating report:", error_4);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get report instances for a clinic
   */
  ReportSystem.prototype.getReportInstances = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, limit) {
      var _a, data, error, error_5;
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("report_instances")
                .select("*")
                .eq("clinic_id", clinicId)
                .order("started_at", { ascending: false })
                .limit(limit),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching report instances:", error);
              return [2 /*return*/, []];
            }
            return [
              2 /*return*/,
              data.map(function (report) {
                return {
                  id: report.id,
                  templateId: report.template_id,
                  scheduleId: report.schedule_id,
                  clinicId: report.clinic_id,
                  name: report.name,
                  type: report.type,
                  format: report.format,
                  status: report.status,
                  parameters: report.parameters,
                  generatedBy: report.generated_by,
                  startedAt: report.started_at,
                  completedAt: report.completed_at,
                  filePath: report.file_path,
                  fileSize: report.file_size,
                  downloadUrl: report.download_url,
                  expiresAt: report.expires_at,
                  errorMessage: report.error_message,
                  metadata: report.metadata,
                };
              }),
            ];
          case 2:
            error_5 = _b.sent();
            logger_1.logger.error("Error getting report instances:", error_5);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process scheduled reports
   */
  ReportSystem.prototype.processScheduledReports = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _a, schedules, error, _i, schedules_1, scheduleData, schedule, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            now = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("report_schedules")
                .select("*")
                .eq("is_active", true)
                .lte("next_run", now.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (schedules = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching scheduled reports:", error);
              return [2 /*return*/];
            }
            (_i = 0), (schedules_1 = schedules);
            _b.label = 2;
          case 2:
            if (!(_i < schedules_1.length)) return [3 /*break*/, 5];
            scheduleData = schedules_1[_i];
            schedule = {
              id: scheduleData.id,
              templateId: scheduleData.template_id,
              clinicId: scheduleData.clinic_id,
              name: scheduleData.name,
              frequency: scheduleData.frequency,
              format: scheduleData.format,
              isActive: scheduleData.is_active,
              schedule: scheduleData.schedule,
              recipients: scheduleData.recipients,
              parameters: scheduleData.parameters,
              lastRun: scheduleData.last_run,
              nextRun: scheduleData.next_run,
              createdAt: scheduleData.created_at,
              updatedAt: scheduleData.updated_at,
            };
            return [4 /*yield*/, this.executeScheduledReport(schedule)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_6 = _b.sent();
            logger_1.logger.error("Error processing scheduled reports:", error_6);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute a scheduled report
   */
  ReportSystem.prototype.executeScheduledReport = function (schedule) {
    return __awaiter(this, void 0, void 0, function () {
      var reportInstance, nextRun, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            logger_1.logger.info("Executing scheduled report: ".concat(schedule.name));
            return [
              4 /*yield*/,
              this.generateReport(schedule.templateId, schedule.format, schedule.parameters || {}),
            ];
          case 1:
            reportInstance = _a.sent();
            if (!reportInstance) {
              logger_1.logger.error("Failed to generate scheduled report: ".concat(schedule.name));
              return [2 /*return*/];
            }
            nextRun = this.calculateNextRun(schedule.frequency, schedule.schedule);
            return [
              4 /*yield*/,
              this.supabase
                .from("report_schedules")
                .update({
                  last_run: new Date().toISOString(),
                  next_run: nextRun,
                })
                .eq("id", schedule.id),
            ];
          case 2:
            _a.sent();
            // Update report instance with schedule ID
            return [
              4 /*yield*/,
              this.supabase
                .from("report_instances")
                .update({ schedule_id: schedule.id })
                .eq("id", reportInstance.id),
            ];
          case 3:
            // Update report instance with schedule ID
            _a.sent();
            logger_1.logger.info("Scheduled report executed successfully: ".concat(schedule.name));
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            logger_1.logger.error(
              "Error executing scheduled report ".concat(schedule.name, ":"),
              error_7,
            );
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate report asynchronously
   */
  ReportSystem.prototype.generateReportAsync = function (reportInstance, template) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, reportData, filePath, endTime, generationTime, expiresAt, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 7]);
            // Update status to generating
            return [
              4 /*yield*/,
              this.supabase
                .from("report_instances")
                .update({ status: "generating" })
                .eq("id", reportInstance.id),
            ];
          case 1:
            // Update status to generating
            _a.sent();
            startTime = Date.now();
            return [4 /*yield*/, this.collectReportData(template, reportInstance.parameters)];
          case 2:
            reportData = _a.sent();
            return [4 /*yield*/, this.generateReportFile(reportInstance, template, reportData)];
          case 3:
            filePath = _a.sent();
            endTime = Date.now();
            generationTime = endTime - startTime;
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            // Update report instance with completion data
            return [
              4 /*yield*/,
              this.supabase
                .from("report_instances")
                .update({
                  status: "completed",
                  completed_at: new Date().toISOString(),
                  file_path: filePath,
                  expires_at: expiresAt.toISOString(),
                  metadata: {
                    generationTime: generationTime,
                    totalRecords: this.countTotalRecords(reportData),
                    dataSourcesUsed: this.getDataSourcesUsed(template),
                  },
                })
                .eq("id", reportInstance.id),
            ];
          case 4:
            // Update report instance with completion data
            _a.sent();
            logger_1.logger.info("Report generated successfully: ".concat(reportInstance.name));
            return [3 /*break*/, 7];
          case 5:
            error_8 = _a.sent();
            logger_1.logger.error(
              "Error generating report ".concat(reportInstance.name, ":"),
              error_8,
            );
            // Update status to failed
            return [
              4 /*yield*/,
              this.supabase
                .from("report_instances")
                .update({
                  status: "failed",
                  error_message: error_8 instanceof Error ? error_8.message : "Unknown error",
                })
                .eq("id", reportInstance.id),
            ];
          case 6:
            // Update status to failed
            _a.sent();
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Collect data for report sections
   */
  ReportSystem.prototype.collectReportData = function (template, parameters) {
    return __awaiter(this, void 0, void 0, function () {
      var data, _i, _a, section, _b, _c, _d, _e, _f, _g, _h, error_9;
      return __generator(this, function (_j) {
        switch (_j.label) {
          case 0:
            data = {};
            (_i = 0), (_a = template.configuration.sections);
            _j.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 13];
            section = _a[_i];
            _j.label = 2;
          case 2:
            _j.trys.push([2, 11, , 12]);
            _b = section.type;
            switch (_b) {
              case "kpi_summary":
                return [3 /*break*/, 3];
              case "chart":
                return [3 /*break*/, 5];
              case "table":
                return [3 /*break*/, 5];
              case "text":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 3:
            _c = data;
            _d = section.id;
            return [
              4 /*yield*/,
              this.collectKPIData(template.clinicId, section.dataSource, parameters),
            ];
          case 4:
            _c[_d] = _j.sent();
            return [3 /*break*/, 10];
          case 5:
            _e = data;
            _f = section.id;
            return [
              4 /*yield*/,
              this.collectChartTableData(template.clinicId, section.dataSource, parameters),
            ];
          case 6:
            _e[_f] = _j.sent();
            return [3 /*break*/, 10];
          case 7:
            _g = data;
            _h = section.id;
            return [4 /*yield*/, this.collectTextData(section.dataSource, parameters)];
          case 8:
            _g[_h] = _j.sent();
            return [3 /*break*/, 10];
          case 9:
            data[section.id] = null;
            _j.label = 10;
          case 10:
            return [3 /*break*/, 12];
          case 11:
            error_9 = _j.sent();
            logger_1.logger.error(
              "Error collecting data for section ".concat(section.id, ":"),
              error_9,
            );
            data[section.id] = null;
            return [3 /*break*/, 12];
          case 12:
            _i++;
            return [3 /*break*/, 1];
          case 13:
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Collect KPI data
   */
  ReportSystem.prototype.collectKPIData = function (clinicId, dataSource, parameters) {
    return __awaiter(this, void 0, void 0, function () {
      var periodStart, periodEnd, _a, allKPIs;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            periodStart = parameters.periodStart ? new Date(parameters.periodStart) : undefined;
            periodEnd = parameters.periodEnd ? new Date(parameters.periodEnd) : undefined;
            _a = dataSource;
            switch (_a) {
              case "all_kpis":
                return [3 /*break*/, 1];
              case "financial_kpis":
                return [3 /*break*/, 3];
            }
            return [3 /*break*/, 5];
          case 1:
            return [
              4 /*yield*/,
              (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(
                clinicId,
                periodStart,
                periodEnd,
              ),
            ];
          case 2:
            return [2 /*return*/, _b.sent()];
          case 3:
            return [
              4 /*yield*/,
              (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(
                clinicId,
                periodStart,
                periodEnd,
              ),
            ];
          case 4:
            allKPIs = _b.sent();
            return [
              2 /*return*/,
              allKPIs.filter(function (kpi) {
                return kpi.kpi.category === "financial";
              }),
            ];
          case 5:
            return [2 /*return*/, []];
        }
      });
    });
  };
  /**
   * Collect chart/table data
   */
  ReportSystem.prototype.collectChartTableData = function (clinicId, dataSource, parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would use the same data sources as widgets
        // For now, return mock data
        return [
          2 /*return*/,
          {
            labels: ["Jan", "Feb", "Mar", "Apr", "May"],
            datasets: [
              {
                label: "Revenue",
                data: [10000, 12000, 15000, 13000, 16000],
              },
            ],
          },
        ];
      });
    });
  };
  /**
   * Collect text data
   */
  ReportSystem.prototype.collectTextData = function (dataSource, parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would generate dynamic text content
        return [
          2 /*return*/,
          "Report generated on ".concat(new Date().toLocaleDateString("pt-BR")),
        ];
      });
    });
  };
  /**
   * Generate report file
   */
  ReportSystem.prototype.generateReportFile = function (reportInstance, template, data) {
    return __awaiter(this, void 0, void 0, function () {
      var fileName, filePath, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            fileName = "".concat(reportInstance.id, ".").concat(reportInstance.format);
            filePath = "/reports/".concat(reportInstance.clinicId, "/").concat(fileName);
            _a = reportInstance.format;
            switch (_a) {
              case "pdf":
                return [3 /*break*/, 1];
              case "excel":
                return [3 /*break*/, 3];
              case "csv":
                return [3 /*break*/, 5];
              case "json":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            return [4 /*yield*/, this.generatePDFReport(filePath, template, data)];
          case 2:
            return [2 /*return*/, _b.sent()];
          case 3:
            return [4 /*yield*/, this.generateExcelReport(filePath, template, data)];
          case 4:
            return [2 /*return*/, _b.sent()];
          case 5:
            return [4 /*yield*/, this.generateCSVReport(filePath, template, data)];
          case 6:
            return [2 /*return*/, _b.sent()];
          case 7:
            return [4 /*yield*/, this.generateJSONReport(filePath, template, data)];
          case 8:
            return [2 /*return*/, _b.sent()];
          case 9:
            throw new Error("Unsupported report format: ".concat(reportInstance.format));
        }
      });
    });
  };
  /**
   * Generate PDF report
   */
  ReportSystem.prototype.generatePDFReport = function (filePath, template, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would use a PDF library like puppeteer, jsPDF, or PDFKit
        logger_1.logger.info("Generating PDF report: ".concat(filePath));
        // Mock implementation
        return [2 /*return*/, filePath];
      });
    });
  };
  /**
   * Generate Excel report
   */
  ReportSystem.prototype.generateExcelReport = function (filePath, template, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would use a library like ExcelJS
        logger_1.logger.info("Generating Excel report: ".concat(filePath));
        // Mock implementation
        return [2 /*return*/, filePath];
      });
    });
  };
  /**
   * Generate CSV report
   */
  ReportSystem.prototype.generateCSVReport = function (filePath, template, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would generate CSV content
        logger_1.logger.info("Generating CSV report: ".concat(filePath));
        // Mock implementation
        return [2 /*return*/, filePath];
      });
    });
  };
  /**
   * Generate JSON report
   */
  ReportSystem.prototype.generateJSONReport = function (filePath, template, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would serialize data to JSON
        logger_1.logger.info("Generating JSON report: ".concat(filePath));
        // Mock implementation
        return [2 /*return*/, filePath];
      });
    });
  };
  /**
   * Calculate next run time for scheduled report
   */
  ReportSystem.prototype.calculateNextRun = function (frequency, schedule) {
    var now = new Date();
    var _a = schedule.time.split(":").map(Number),
      hours = _a[0],
      minutes = _a[1];
    var nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    // If the time has already passed today, move to next occurrence
    if (nextRun <= now) {
      switch (frequency) {
        case "daily":
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case "weekly":
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case "monthly":
          nextRun.setMonth(nextRun.getMonth() + 1);
          if (schedule.dayOfMonth) {
            nextRun.setDate(schedule.dayOfMonth);
          }
          break;
        case "quarterly":
          nextRun.setMonth(nextRun.getMonth() + 3);
          break;
        case "yearly":
          nextRun.setFullYear(nextRun.getFullYear() + 1);
          break;
      }
    }
    return nextRun.toISOString();
  };
  /**
   * Count total records in report data
   */
  ReportSystem.prototype.countTotalRecords = function (data) {
    var total = 0;
    for (var _i = 0, _a = Object.values(data); _i < _a.length; _i++) {
      var value = _a[_i];
      if (Array.isArray(value)) {
        total += value.length;
      }
    }
    return total;
  };
  /**
   * Get data sources used in template
   */
  ReportSystem.prototype.getDataSourcesUsed = function (template) {
    return template.configuration.sections.map(function (section) {
      return section.dataSource;
    });
  };
  /**
   * Get default report templates
   */
  ReportSystem.prototype.getDefaultTemplates = function () {
    return [
      {
        name: "Relatório Executivo Mensal",
        description: "Resumo executivo com principais KPIs e métricas do mês",
        type: "executive_summary",
        isActive: true,
        configuration: {
          sections: [
            {
              id: "financial_summary",
              title: "Resumo Financeiro",
              type: "kpi_summary",
              dataSource: "financial_kpis",
            },
            {
              id: "revenue_trend",
              title: "Tendência de Receita",
              type: "chart",
              dataSource: "monthly_revenue_trend",
            },
            {
              id: "operational_metrics",
              title: "Métricas Operacionais",
              type: "table",
              dataSource: "operational_summary",
            },
          ],
          layout: {
            orientation: "portrait",
            pageSize: "A4",
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            header: { enabled: true, content: "Relatório Executivo", height: 50 },
            footer: { enabled: true, content: "Confidencial", height: 30 },
          },
          filters: {
            dateRange: { enabled: true, defaultPeriod: "last_30_days" },
          },
        },
      },
      {
        name: "Relatório Financeiro Detalhado",
        description: "Análise financeira completa com receitas, custos e margens",
        type: "financial_report",
        isActive: true,
        configuration: {
          sections: [
            {
              id: "revenue_analysis",
              title: "Análise de Receita",
              type: "chart",
              dataSource: "revenue_breakdown",
            },
            {
              id: "cost_analysis",
              title: "Análise de Custos",
              type: "table",
              dataSource: "cost_breakdown",
            },
            {
              id: "profit_margins",
              title: "Margens de Lucro",
              type: "kpi_summary",
              dataSource: "profit_metrics",
            },
          ],
          layout: {
            orientation: "landscape",
            pageSize: "A4",
            margins: { top: 15, right: 15, bottom: 15, left: 15 },
            header: { enabled: true, content: "Relatório Financeiro", height: 40 },
            footer: { enabled: true, content: "Página {page}", height: 25 },
          },
          filters: {
            dateRange: { enabled: true, defaultPeriod: "last_quarter" },
          },
        },
      },
    ];
  };
  return ReportSystem;
})();
exports.ReportSystem = ReportSystem;
// Export singleton instance
var createreportSystem = function () {
  return new ReportSystem();
};
exports.createreportSystem = createreportSystem;
