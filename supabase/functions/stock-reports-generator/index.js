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
Object.defineProperty(exports, "__esModule", { value: true });
var server_ts_1 = require("https://deno.land/std@0.168.0/http/server.ts");
var supabase_js_2_1 = require("https://esm.sh/@supabase/supabase-js@2");
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
(0, server_ts_1.serve)((req) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabaseUrl,
      supabaseServiceKey,
      supabase,
      now,
      currentDay,
      currentDate,
      currentHour,
      _a,
      reportConfigs,
      configError,
      processedReports,
      emailQueue,
      _i,
      _b,
      config,
      schedule,
      shouldGenerate,
      scheduleHour,
      reportData,
      _c,
      reportRecord,
      reportError_1,
      error_1,
      _d,
      emailQueue_1,
      email,
      error_2;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          // Handle CORS
          if (req.method === "OPTIONS") {
            return [2 /*return*/, new Response("ok", { headers: corsHeaders })];
          }
          _e.label = 1;
        case 1:
          _e.trys.push([1, 10, undefined, 11]);
          supabaseUrl = Deno.env.get("SUPABASE_URL");
          supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          supabase = (0, supabase_js_2_1.createClient)(supabaseUrl, supabaseServiceKey);
          console.log("Starting scheduled reports generation...");
          now = new Date();
          currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
          currentDate = now.getDate();
          currentHour = now.getHours();
          return [
            4 /*yield*/,
            supabase
              .from("custom_stock_reports")
              .select("*")
              .eq("is_active", true)
              .not("schedule_config", "is", null),
          ];
        case 2:
          (_a = _e.sent()), (reportConfigs = _a.data), (configError = _a.error);
          if (configError) {
            console.error("Error fetching report configs:", configError);
            throw configError;
          }
          console.log(
            "Found ".concat(
              (reportConfigs === null || reportConfigs === void 0
                ? void 0
                : reportConfigs.length) || 0,
              " scheduled reports",
            ),
          );
          processedReports = [];
          emailQueue = [];
          (_i = 0), (_b = reportConfigs || []);
          _e.label = 3;
        case 3:
          if (!(_i < _b.length)) return [3 /*break*/, 9];
          config = _b[_i];
          if (!config.schedule_config) return [3 /*break*/, 8];
          schedule = config.schedule_config;
          shouldGenerate = false;
          // Check if report should be generated now
          switch (schedule.frequency) {
            case "daily":
              shouldGenerate = true;
              break;
            case "weekly":
              if (schedule.dayOfWeek !== undefined && currentDay === schedule.dayOfWeek) {
                shouldGenerate = true;
              }
              break;
            case "monthly":
              if (schedule.dayOfMonth !== undefined && currentDate === schedule.dayOfMonth) {
                shouldGenerate = true;
              }
              break;
          }
          scheduleHour = parseInt(schedule.time.split(":")[0]);
          if (!(shouldGenerate && currentHour === scheduleHour)) return [3 /*break*/, 8];
          console.log(
            "Generating report: "
              .concat(config.report_name, " for clinic ")
              .concat(config.clinic_id),
          );
          _e.label = 4;
        case 4:
          _e.trys.push([4, 7, undefined, 8]);
          return [
            4 /*yield*/,
            generateReport(supabase, config),
            // Store generated report
          ];
        case 5:
          reportData = _e.sent();
          return [
            4 /*yield*/,
            supabase
              .from("stock_reports")
              .insert({
                clinic_id: config.clinic_id,
                report_config_id: config.id,
                report_name: config.report_name,
                report_type: config.report_type,
                report_data: reportData,
                generated_by: config.user_id,
                status: "completed",
              })
              .select()
              .single(),
          ];
        case 6:
          (_c = _e.sent()), (reportRecord = _c.data), (reportError_1 = _c.error);
          if (reportError_1) {
            console.error("Error storing report ".concat(config.report_name, ":"), reportError_1);
            return [3 /*break*/, 8];
          }
          processedReports.push({
            configId: config.id,
            reportId: reportRecord.id,
            reportName: config.report_name,
            clinicId: config.clinic_id,
          });
          // Queue email notifications
          if (schedule.recipients && schedule.recipients.length > 0) {
            emailQueue.push({
              recipients: schedule.recipients,
              reportName: config.report_name,
              reportId: reportRecord.id,
              reportData: reportData,
            });
          }
          return [3 /*break*/, 8];
        case 7:
          error_1 = _e.sent();
          console.error("Error generating report ".concat(config.report_name, ":"), error_1);
          return [3 /*break*/, 8];
        case 8:
          _i++;
          return [3 /*break*/, 3];
        case 9:
          console.log("Generated ".concat(processedReports.length, " reports"));
          // Process email notifications (simplified)
          for (_d = 0, emailQueue_1 = emailQueue; _d < emailQueue_1.length; _d++) {
            email = emailQueue_1[_d];
            console.log(
              "Queuing email for report "
                .concat(email.reportName, " to ")
                .concat(email.recipients.length, " recipients"),
            );
            // In a real implementation, you would:
            // 1. Generate PDF/Excel from reportData
            // 2. Send email with attachment using a service like SendGrid
            // 3. Log email delivery status
          }
          return [
            2 /*return*/,
            new Response(
              JSON.stringify({
                success: true,
                processed: {
                  reports_generated: processedReports.length,
                  emails_queued: emailQueue.length,
                  timestamp: now.toISOString(),
                },
                reports: processedReports,
              }),
              {
                headers: __assign(__assign({}, corsHeaders), {
                  "Content-Type": "application/json",
                }),
                status: 200,
              },
            ),
          ];
        case 10:
          error_2 = _e.sent();
          console.error("Stock reports generation error:", error_2);
          return [
            2 /*return*/,
            new Response(
              JSON.stringify({
                success: false,
                error: error_2.message || "Unknown error occurred",
                timestamp: new Date().toISOString(),
              }),
              {
                headers: __assign(__assign({}, corsHeaders), {
                  "Content-Type": "application/json",
                }),
                status: 500,
              },
            ),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  }),
);
function generateReport(supabase, config) {
  return __awaiter(this, void 0, void 0, function () {
    var filters, clinicId, endDate, startDate, _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          filters = config.filters || {};
          clinicId = config.clinic_id;
          endDate = new Date();
          startDate = new Date();
          if (filters.dateRange) {
            startDate.setTime(new Date(filters.dateRange.start).getTime());
            endDate.setTime(new Date(filters.dateRange.end).getTime());
          } else {
            // Default to last 30 days
            startDate.setDate(endDate.getDate() - 30);
          }
          _a = config.report_type;
          switch (_a) {
            case "consumption":
              return [3 /*break*/, 1];
            case "valuation":
              return [3 /*break*/, 3];
            case "movement":
              return [3 /*break*/, 5];
          }
          return [3 /*break*/, 7];
        case 1:
          return [
            4 /*yield*/,
            generateConsumptionReport(supabase, clinicId, filters, startDate, endDate),
          ];
        case 2:
          return [2 /*return*/, _b.sent()];
        case 3:
          return [
            4 /*yield*/,
            generateValuationReport(supabase, clinicId, filters, startDate, endDate),
          ];
        case 4:
          return [2 /*return*/, _b.sent()];
        case 5:
          return [
            4 /*yield*/,
            generateMovementReport(supabase, clinicId, filters, startDate, endDate),
          ];
        case 6:
          return [2 /*return*/, _b.sent()];
        case 7:
          return [
            4 /*yield*/,
            generateCustomReport(supabase, clinicId, filters, startDate, endDate),
          ];
        case 8:
          return [2 /*return*/, _b.sent()];
      }
    });
  });
}
function generateConsumptionReport(supabase, clinicId, _filters, startDate, endDate) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, movements, error, consumptionByProduct, totalConsumption, totalValue, topProducts;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("stock_movement_transactions")
              .select(
                "\n      product_id,\n      quantity_out,\n      unit_cost,\n      transaction_date,\n      products (\n        name,\n        category_id,\n        product_categories (name)\n      )\n    ",
              )
              .eq("clinic_id", clinicId)
              .eq("movement_type", "out")
              .gte("transaction_date", startDate.toISOString())
              .lte("transaction_date", endDate.toISOString()),
          ];
        case 1:
          (_a = _b.sent()), (movements = _a.data), (error = _a.error);
          if (error) throw error;
          consumptionByProduct = new Map();
          totalConsumption = 0;
          totalValue = 0;
          movements === null || movements === void 0
            ? void 0
            : movements.forEach((movement) => {
                var _a, _b, _c;
                var productId = movement.product_id;
                var quantity = movement.quantity_out || 0;
                var value = quantity * (movement.unit_cost || 0);
                totalConsumption += quantity;
                totalValue += value;
                if (consumptionByProduct.has(productId)) {
                  var existing = consumptionByProduct.get(productId);
                  existing.quantity += quantity;
                  existing.value += value;
                  existing.transactions++;
                } else {
                  consumptionByProduct.set(productId, {
                    productId: productId,
                    productName:
                      ((_a = movement.products) === null || _a === void 0 ? void 0 : _a.name) ||
                      "Produto sem nome",
                    category:
                      ((_c =
                        (_b = movement.products) === null || _b === void 0
                          ? void 0
                          : _b.product_categories) === null || _c === void 0
                        ? void 0
                        : _c.name) || "Sem categoria",
                    quantity: quantity,
                    value: value,
                    transactions: 1,
                  });
                }
              });
          topProducts = Array.from(consumptionByProduct.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 20);
          return [
            2 /*return*/,
            {
              type: "consumption",
              period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
              summary: {
                totalConsumption: totalConsumption,
                totalValue: totalValue,
                uniqueProducts: consumptionByProduct.size,
                totalTransactions:
                  (movements === null || movements === void 0 ? void 0 : movements.length) || 0,
              },
              topProducts: topProducts,
              generatedAt: new Date().toISOString(),
            },
          ];
      }
    });
  });
}
function generateValuationReport(supabase, clinicId, _filters, startDate, endDate) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, inventory, error, totalValue, byCategory;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("stock_inventory")
              .select(
                "\n      product_id,\n      quantity_available,\n      unit_cost,\n      min_stock_level,\n      max_stock_level,\n      products (\n        name,\n        category_id,\n        product_categories (name)\n      )\n    ",
              )
              .eq("clinic_id", clinicId)
              .eq("is_active", true),
          ];
        case 1:
          (_a = _b.sent()), (inventory = _a.data), (error = _a.error);
          if (error) throw error;
          totalValue =
            (inventory === null || inventory === void 0
              ? void 0
              : inventory.reduce(
                  (sum, item) => sum + item.quantity_available * item.unit_cost,
                  0,
                )) || 0;
          byCategory = new Map();
          inventory === null || inventory === void 0
            ? void 0
            : inventory.forEach((item) => {
                var _a, _b;
                var category =
                  ((_b =
                    (_a = item.products) === null || _a === void 0
                      ? void 0
                      : _a.product_categories) === null || _b === void 0
                    ? void 0
                    : _b.name) || "Sem categoria";
                var value = item.quantity_available * item.unit_cost;
                if (byCategory.has(category)) {
                  var existing = byCategory.get(category);
                  existing.value += value;
                  existing.quantity += item.quantity_available;
                  existing.products++;
                } else {
                  byCategory.set(category, {
                    category: category,
                    value: value,
                    quantity: item.quantity_available,
                    products: 1,
                  });
                }
              });
          return [
            2 /*return*/,
            {
              type: "valuation",
              period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
              summary: {
                totalValue: totalValue,
                totalProducts:
                  (inventory === null || inventory === void 0 ? void 0 : inventory.length) || 0,
                categories: byCategory.size,
              },
              byCategory: Array.from(byCategory.values()),
              topValueProducts:
                (inventory === null || inventory === void 0
                  ? void 0
                  : inventory
                      .map((item) => {
                        var _a;
                        return {
                          productName:
                            ((_a = item.products) === null || _a === void 0 ? void 0 : _a.name) ||
                            "Produto sem nome",
                          quantity: item.quantity_available,
                          unitCost: item.unit_cost,
                          totalValue: item.quantity_available * item.unit_cost,
                        };
                      })
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .slice(0, 20)) || [],
              generatedAt: new Date().toISOString(),
            },
          ];
      }
    });
  });
}
function generateMovementReport(supabase, clinicId, _filters, startDate, endDate) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, movements, error, summary;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("stock_movement_transactions")
              .select(
                "\n      movement_type,\n      quantity_in,\n      quantity_out,\n      unit_cost,\n      transaction_date,\n      reference_type,\n      reference_id\n    ",
              )
              .eq("clinic_id", clinicId)
              .gte("transaction_date", startDate.toISOString())
              .lte("transaction_date", endDate.toISOString()),
          ];
        case 1:
          (_a = _b.sent()), (movements = _a.data), (error = _a.error);
          if (error) throw error;
          summary = {
            totalIn: 0,
            totalOut: 0,
            totalTransactions:
              (movements === null || movements === void 0 ? void 0 : movements.length) || 0,
            byType: new Map(),
          };
          movements === null || movements === void 0
            ? void 0
            : movements.forEach((movement) => {
                summary.totalIn += movement.quantity_in || 0;
                summary.totalOut += movement.quantity_out || 0;
                var type = movement.movement_type;
                if (summary.byType.has(type)) {
                  var existing = summary.byType.get(type);
                  existing.count++;
                  existing.quantityIn += movement.quantity_in || 0;
                  existing.quantityOut += movement.quantity_out || 0;
                } else {
                  summary.byType.set(type, {
                    type: type,
                    count: 1,
                    quantityIn: movement.quantity_in || 0,
                    quantityOut: movement.quantity_out || 0,
                  });
                }
              });
          return [
            2 /*return*/,
            {
              type: "movement",
              period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
              summary: __assign(__assign({}, summary), {
                byType: Array.from(summary.byType.values()),
              }),
              generatedAt: new Date().toISOString(),
            },
          ];
      }
    });
  });
}
function generateCustomReport(_supabase, _clinicId, filters, startDate, endDate) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => {
      // Custom report based on filters
      return [
        2 /*return*/,
        {
          type: "custom",
          period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
          filters: filters,
          message: "Custom report generation not yet implemented",
          generatedAt: new Date().toISOString(),
        },
      ];
    });
  });
}
/* To deploy this function:
 * npx supabase functions deploy stock-reports-generator
 *
 * To schedule this function (add to supabase/functions/_cron/cron.ts):
 * {
 *   name: 'stock-reports-generator',
 *   cron: '0 9 * * *', // Daily at 9 AM
 *   function: 'stock-reports-generator'
 * }
 */
