// Background Job: Alert Evaluation
// Story 11.4: Alertas e Relatórios de Estoque
// Cron job para avaliar e gerar alertas automaticamente
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var stock_alert_service_1 = require("@/app/lib/services/stock-alert.service");
var stock_1 = require("@/app/lib/types/stock");
// =====================================================
// CONFIGURATION
// =====================================================
var BATCH_SIZE = 100; // Process in batches to avoid memory issues
var MAX_EXECUTION_TIME = 50000; // 50 seconds (Vercel function timeout is 60s)
var RETRY_ATTEMPTS = 3;
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
/**
 * Validates that this is a legitimate cron request
 */
function validateCronRequest(request) {
  // In production, validate using Vercel's cron secret
  var authHeader = request.headers.get("authorization");
  var expectedAuth = "Bearer ".concat(process.env.CRON_SECRET);
  if (process.env.NODE_ENV === "production" && authHeader !== expectedAuth) {
    return false;
  }
  return true;
}
/**
 * Gets all active clinics with alert configurations
 */
function getActiveClinics(supabase) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, clinics, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("stock_alert_configs")
              .select("clinic_id")
              .eq("is_active", true)
              .group("clinic_id"),
          ];
        case 1:
          (_a = _b.sent()), (clinics = _a.data), (error = _a.error);
          if (error) {
            throw new stock_1.StockAlertError(
              "Failed to fetch active clinics",
              "FETCH_CLINICS_FAILED",
              { error: error.message },
            );
          }
          return [
            2 /*return*/,
            __spreadArray(
              [],
              new Set(
                (clinics === null || clinics === void 0
                  ? void 0
                  : clinics.map((c) => c.clinic_id)) || [],
              ),
              true,
            ),
          ];
      }
    });
  });
}
/**
 * Processes alerts for a batch of clinics
 */
function processBatch(clinicIds, supabase, startTime) {
  return __awaiter(this, void 0, void 0, function () {
    var result, _i, clinicIds_1, clinicId, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          result = {
            clinicsProcessed: 0,
            alertsGenerated: 0,
            errors: [],
            executionTime: 0,
            timestamp: new Date().toISOString(),
          };
          (_i = 0), (clinicIds_1 = clinicIds);
          _a.label = 1;
        case 1:
          if (!(_i < clinicIds_1.length)) return [3 /*break*/, 7];
          clinicId = clinicIds_1[_i];
          // Check if we're approaching timeout
          if (Date.now() - startTime > MAX_EXECUTION_TIME) {
            console.warn("Approaching timeout, stopping batch processing");
            return [3 /*break*/, 7];
          }
          _a.label = 2;
        case 2:
          _a.trys.push([2, 4, undefined, 5]);
          return [4 /*yield*/, processClinicAlerts(clinicId, supabase, result)];
        case 3:
          _a.sent();
          return [3 /*break*/, 5];
        case 4:
          error_1 = _a.sent();
          console.error("Failed to process clinic ".concat(clinicId, ":"), error_1);
          result.errors.push({
            clinicId: clinicId,
            error: error_1 instanceof Error ? error_1.message : "Unknown error",
          });
          return [3 /*break*/, 5];
        case 5:
          result.clinicsProcessed++;
          _a.label = 6;
        case 6:
          _i++;
          return [3 /*break*/, 1];
        case 7:
          result.executionTime = Date.now() - startTime;
          return [2 /*return*/, result];
      }
    });
  });
}
/**
 * Processes alerts for a single clinic
 */
function processClinicAlerts(clinicId, supabase, result) {
  return __awaiter(this, void 0, void 0, function () {
    var _alertService, attempts, alerts, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _alertService = new stock_alert_service_1.StockAlertService(supabase);
          attempts = 0;
          _a.label = 1;
        case 1:
          if (!(attempts < RETRY_ATTEMPTS)) return [3 /*break*/, 7];
          _a.label = 2;
        case 2:
          _a.trys.push([2, 4, undefined, 6]);
          return [4 /*yield*/, evaluateClinicAlerts(clinicId, supabase)];
        case 3:
          alerts = _a.sent();
          result.alertsGenerated += alerts.length;
          // Log successful processing
          console.log(
            "Processed clinic ".concat(clinicId, ": ").concat(alerts.length, " alerts generated"),
          );
          return [3 /*break*/, 7];
        case 4:
          error_2 = _a.sent();
          attempts++;
          if (attempts >= RETRY_ATTEMPTS) {
            throw error_2;
          }
          // Exponential backoff
          return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 2 ** attempts * 1000))];
        case 5:
          // Exponential backoff
          _a.sent();
          return [3 /*break*/, 6];
        case 6:
          return [3 /*break*/, 1];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Evaluates alerts for a specific clinic
 */
function evaluateClinicAlerts(clinicId, supabase) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, configs, configError, generatedAlerts, _i, configs_1, config, alert_1, error_3;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("stock_alert_configs")
              .select(
                "\n      *,\n      product:products (\n        id,\n        name,\n        current_stock,\n        min_stock,\n        expiration_date,\n        unit_cost\n      )\n    ",
              )
              .eq("clinic_id", clinicId)
              .eq("is_active", true),
          ];
        case 1:
          (_a = _b.sent()), (configs = _a.data), (configError = _a.error);
          if (configError) {
            throw new stock_1.StockAlertError(
              "Failed to fetch alert configurations",
              "FETCH_CONFIGS_FAILED",
              { clinicId: clinicId, error: configError.message },
            );
          }
          if (!configs || configs.length === 0) {
            return [2 /*return*/, []];
          }
          generatedAlerts = [];
          (_i = 0), (configs_1 = configs);
          _b.label = 2;
        case 2:
          if (!(_i < configs_1.length)) return [3 /*break*/, 7];
          config = configs_1[_i];
          _b.label = 3;
        case 3:
          _b.trys.push([3, 5, undefined, 6]);
          return [4 /*yield*/, evaluateConfigCondition(config, supabase)];
        case 4:
          alert_1 = _b.sent();
          if (alert_1) {
            generatedAlerts.push(alert_1);
          }
          return [3 /*break*/, 6];
        case 5:
          error_3 = _b.sent();
          console.error("Failed to evaluate config ".concat(config.id, ":"), error_3);
          return [3 /*break*/, 6];
        case 6:
          _i++;
          return [3 /*break*/, 2];
        case 7:
          return [2 /*return*/, generatedAlerts];
      }
    });
  });
}
/**
 * Evaluates a single alert configuration condition
 */
function evaluateConfigCondition(config, supabase) {
  return __awaiter(this, void 0, void 0, function () {
    var product,
      shouldAlert,
      currentValue,
      message,
      _daysUntilExpiration,
      daysUntilExpiration,
      maxStock,
      existingAlert,
      alertData,
      _a,
      newAlert,
      error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          product = config.product;
          if (!product) {
            return [2 /*return*/, null];
          }
          shouldAlert = false;
          currentValue = 0;
          message = "";
          switch (config.alert_type) {
            case "low_stock":
              currentValue = product.current_stock || 0;
              shouldAlert = currentValue <= config.threshold_value;
              message = "Estoque baixo para "
                .concat(product.name, ": ")
                .concat(currentValue, " unidades (limite: ")
                .concat(config.threshold_value, ")");
              break;
            case "expiring":
              if (product.expiration_date) {
                daysUntilExpiration = Math.ceil(
                  (new Date(product.expiration_date).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                );
                currentValue = daysUntilExpiration;
                shouldAlert =
                  daysUntilExpiration <= config.threshold_value && daysUntilExpiration > 0;
                message = "Produto "
                  .concat(product.name, " vence em ")
                  .concat(daysUntilExpiration, " dias");
              }
              break;
            case "expired":
              if (product.expiration_date) {
                daysUntilExpiration = Math.ceil(
                  (new Date(product.expiration_date).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                );
                currentValue = Math.abs(daysUntilExpiration);
                shouldAlert = daysUntilExpiration <= 0;
                message = "Produto "
                  .concat(product.name, " vencido h\u00E1 ")
                  .concat(Math.abs(daysUntilExpiration), " dias");
              }
              break;
            case "overstock":
              currentValue = product.current_stock || 0;
              maxStock = product.max_stock || product.min_stock * 3;
              shouldAlert = currentValue >= maxStock;
              message = "Excesso de estoque para "
                .concat(product.name, ": ")
                .concat(currentValue, " unidades (m\u00E1ximo: ")
                .concat(maxStock, ")");
              break;
            default:
              return [2 /*return*/, null];
          }
          if (!shouldAlert) {
            return [2 /*return*/, null];
          }
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts")
              .select("id")
              .eq("alert_config_id", config.id)
              .eq("product_id", product.id)
              .is("acknowledged_at", null)
              .order("created_at", { ascending: false })
              .limit(1)
              .single(),
          ];
        case 1:
          existingAlert = _b.sent().data;
          if (existingAlert) {
            // Alert already exists and is not acknowledged
            return [2 /*return*/, null];
          }
          alertData = {
            clinic_id: config.clinic_id,
            alert_config_id: config.id,
            product_id: product.id,
            alert_type: config.alert_type,
            severity_level: config.severity_level,
            current_value: currentValue,
            threshold_value: config.threshold_value,
            message: message,
            status: "active",
            metadata: {
              productName: product.name,
              generatedBy: "system",
              timestamp: new Date().toISOString(),
            },
            triggered_at: new Date().toISOString(),
          };
          return [4 /*yield*/, supabase.from("stock_alerts").insert(alertData).select().single()];
        case 2:
          (_a = _b.sent()), (newAlert = _a.data), (error = _a.error);
          if (error) {
            throw new stock_1.StockAlertError("Failed to create alert", "CREATE_ALERT_FAILED", {
              configId: config.id,
              error: error.message,
            });
          }
          // Log event for audit trail
          return [
            4 /*yield*/,
            supabase.from("stock_alert_events").insert({
              event_type: "alert_generated",
              entity_id: newAlert.id,
              clinic_id: config.clinic_id,
              event_data: {
                configId: config.id,
                productId: product.id,
                alertType: config.alert_type,
                severityLevel: config.severity_level,
                currentValue: currentValue,
                thresholdValue: config.threshold_value,
                generatedBy: "system",
              },
            }),
          ];
        case 3:
          // Log event for audit trail
          _b.sent();
          return [2 /*return*/, newAlert];
      }
    });
  });
}
/**
 * Records processing statistics
 */
function recordProcessingStats(supabase, result) {
  return __awaiter(this, void 0, void 0, function () {
    var error_4;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, undefined, 3]);
          return [
            4 /*yield*/,
            supabase.from("alert_processing_stats").insert({
              processed_at: result.timestamp,
              clinics_processed: result.clinicsProcessed,
              alerts_generated: result.alertsGenerated,
              execution_time_ms: result.executionTime,
              error_count: result.errors.length,
              errors: result.errors,
            }),
          ];
        case 1:
          _a.sent();
          return [3 /*break*/, 3];
        case 2:
          error_4 = _a.sent();
          console.error("Failed to record processing stats:", error_4);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// API ENDPOINT
// =====================================================
/**
 * POST /api/cron/evaluate-alerts
 * Background job to evaluate alert conditions and generate alerts
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var startTime,
      supabase,
      clinicIds,
      batches,
      _i,
      totalResult,
      i,
      batchResult,
      error_5,
      executionTime;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          startTime = Date.now();
          _b.label = 1;
        case 1:
          _b.trys.push([1, 9, undefined, 10]);
          // Validate cron request
          if (!validateCronRequest(request)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Unauthorized", code: "INVALID_CRON_REQUEST" },
                { status: 401 },
              ),
            ];
          }
          console.log("Starting alert evaluation job...");
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _b.sent();
          return [4 /*yield*/, getActiveClinics(supabase)];
        case 3:
          clinicIds = _b.sent();
          console.log(
            "Found ".concat(clinicIds.length, " clinics with active alert configurations"),
          );
          if (clinicIds.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "No active clinics found",
                data: {
                  clinicsProcessed: 0,
                  alertsGenerated: 0,
                  errors: [],
                  executionTime: Date.now() - startTime,
                },
              }),
            ];
          }
          batches = [];
          for (i = 0; i < clinicIds.length; i += BATCH_SIZE) {
            batches.push(clinicIds.slice(i, i + BATCH_SIZE));
          }
          totalResult = {
            clinicsProcessed: 0,
            alertsGenerated: 0,
            errors: [],
            executionTime: 0,
            timestamp: new Date().toISOString(),
          };
          i = 0;
          _b.label = 4;
        case 4:
          if (!(i < batches.length)) return [3 /*break*/, 7];
          console.log("Processing batch ".concat(i + 1, "/").concat(batches.length));
          return [4 /*yield*/, processBatch(batches[i], supabase, startTime)];
        case 5:
          batchResult = _b.sent();
          // Merge results
          totalResult.clinicsProcessed += batchResult.clinicsProcessed;
          totalResult.alertsGenerated += batchResult.alertsGenerated;
          (_a = totalResult.errors).push.apply(_a, batchResult.errors);
          // Check timeout
          if (Date.now() - startTime > MAX_EXECUTION_TIME) {
            console.warn("Timeout reached, stopping processing");
            return [3 /*break*/, 7];
          }
          _b.label = 6;
        case 6:
          i++;
          return [3 /*break*/, 4];
        case 7:
          totalResult.executionTime = Date.now() - startTime;
          // Record processing statistics
          return [4 /*yield*/, recordProcessingStats(supabase, totalResult)];
        case 8:
          // Record processing statistics
          _b.sent();
          console.log("Alert evaluation job completed:", {
            clinicsProcessed: totalResult.clinicsProcessed,
            alertsGenerated: totalResult.alertsGenerated,
            errorCount: totalResult.errors.length,
            executionTime: "".concat(totalResult.executionTime, "ms"),
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Alert evaluation completed",
              data: totalResult,
            }),
          ];
        case 9:
          error_5 = _b.sent();
          executionTime = Date.now() - startTime;
          console.error("Alert evaluation job failed:", {
            error: error_5 instanceof Error ? error_5.message : "Unknown error",
            executionTime: "".concat(executionTime, "ms"),
          });
          if (error_5 instanceof stock_1.StockAlertError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: error_5.message,
                  code: error_5.code,
                  context: error_5.context,
                },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Internal server error",
                code: "INTERNAL_ERROR",
              },
              { status: 500 },
            ),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// HEALTH CHECK
// =====================================================
/**
 * GET /api/cron/evaluate-alerts
 * Health check for the cron job endpoint
 */
function GET() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json({
        status: "healthy",
        service: "alert-evaluation-cron",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      }),
    ]);
  });
}
