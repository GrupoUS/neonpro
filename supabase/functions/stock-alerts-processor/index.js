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
      _a,
      alertConfigs,
      configError,
      generatedAlerts,
      notificationQueue,
      clinicIds,
      _loop_1,
      _i,
      clinicIds_1,
      clinicId,
      _alertKeys,
      existingAlerts,
      existingKeys_1,
      newAlerts,
      insertError,
      _loop_2,
      _b,
      newAlerts_1,
      alert_1,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          // Handle CORS
          if (req.method === "OPTIONS") {
            return [2 /*return*/, new Response("ok", { headers: corsHeaders })];
          }
          _c.label = 1;
        case 1:
          _c.trys.push([1, 11, undefined, 12]);
          supabaseUrl = Deno.env.get("SUPABASE_URL");
          supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          supabase = (0, supabase_js_2_1.createClient)(supabaseUrl, supabaseServiceKey);
          console.log("Starting stock alerts processing...");
          return [
            4 /*yield*/,
            supabase.from("stock_alert_configs").select("*").eq("is_active", true),
          ];
        case 2:
          (_a = _c.sent()), (alertConfigs = _a.data), (configError = _a.error);
          if (configError) {
            console.error("Error fetching alert configs:", configError);
            throw configError;
          }
          console.log(
            "Found ".concat(
              (alertConfigs === null || alertConfigs === void 0 ? void 0 : alertConfigs.length) ||
                0,
              " active alert configurations",
            ),
          );
          generatedAlerts = [];
          notificationQueue = [];
          clinicIds = __spreadArray(
            [],
            new Set(
              (alertConfigs === null || alertConfigs === void 0
                ? void 0
                : alertConfigs.map((config) => config.clinic_id)) || [],
            ),
            true,
          );
          _loop_1 = function (clinicId) {
            var clinicConfigs, _d, inventory, inventoryError, _loop_3, _e, clinicConfigs_1, config;
            return __generator(this, (_f) => {
              switch (_f.label) {
                case 0:
                  console.log("Processing alerts for clinic: ".concat(clinicId));
                  clinicConfigs =
                    (alertConfigs === null || alertConfigs === void 0
                      ? void 0
                      : alertConfigs.filter((config) => config.clinic_id === clinicId)) || [];
                  return [
                    4 /*yield*/,
                    supabase
                      .from("stock_inventory")
                      .select(
                        "\n          id,\n          product_id,\n          quantity_available,\n          min_stock_level,\n          max_stock_level,\n          unit_cost,\n          products (\n            id,\n            name,\n            expiry_date\n          )\n        ",
                      )
                      .eq("clinic_id", clinicId)
                      .eq("is_active", true),
                  ];
                case 1:
                  (_d = _f.sent()), (inventory = _d.data), (inventoryError = _d.error);
                  if (inventoryError) {
                    console.error(
                      "Error fetching inventory for clinic ".concat(clinicId, ":"),
                      inventoryError,
                    );
                    return [2 /*return*/, "continue"];
                  }
                  console.log(
                    "Found "
                      .concat(
                        (inventory === null || inventory === void 0 ? void 0 : inventory.length) ||
                          0,
                        " products in inventory for clinic ",
                      )
                      .concat(clinicId),
                  );
                  _loop_3 = function (config) {
                    var relevantProducts, _g, relevantProducts_1, product, alerts;
                    return __generator(this, (_h) => {
                      switch (_h.label) {
                        case 0:
                          relevantProducts =
                            (inventory === null || inventory === void 0
                              ? void 0
                              : inventory.filter((item) => {
                                  if (config.product_id) {
                                    return item.product_id === config.product_id;
                                  }
                                  if (config.category_id) {
                                    // Would need to join with categories - for now include all
                                    return true;
                                  }
                                  return true;
                                })) || [];
                          (_g = 0), (relevantProducts_1 = relevantProducts);
                          _h.label = 1;
                        case 1:
                          if (!(_g < relevantProducts_1.length)) return [3 /*break*/, 4];
                          product = relevantProducts_1[_g];
                          return [4 /*yield*/, generateAlertsForProduct(product, config)];
                        case 2:
                          alerts = _h.sent();
                          generatedAlerts.push.apply(generatedAlerts, alerts);
                          _h.label = 3;
                        case 3:
                          _g++;
                          return [3 /*break*/, 1];
                        case 4:
                          return [2 /*return*/];
                      }
                    });
                  };
                  (_e = 0), (clinicConfigs_1 = clinicConfigs);
                  _f.label = 2;
                case 2:
                  if (!(_e < clinicConfigs_1.length)) return [3 /*break*/, 5];
                  config = clinicConfigs_1[_e];
                  return [5 /*yield**/, _loop_3(config)];
                case 3:
                  _f.sent();
                  _f.label = 4;
                case 4:
                  _e++;
                  return [3 /*break*/, 2];
                case 5:
                  return [2 /*return*/];
              }
            });
          };
          (_i = 0), (clinicIds_1 = clinicIds);
          _c.label = 3;
        case 3:
          if (!(_i < clinicIds_1.length)) return [3 /*break*/, 6];
          clinicId = clinicIds_1[_i];
          return [5 /*yield**/, _loop_1(clinicId)];
        case 4:
          _c.sent();
          _c.label = 5;
        case 5:
          _i++;
          return [3 /*break*/, 3];
        case 6:
          console.log("Generated ".concat(generatedAlerts.length, " new alerts"));
          if (!(generatedAlerts.length > 0)) return [3 /*break*/, 9];
          _alertKeys = generatedAlerts.map((alert) =>
            "".concat(alert.clinic_id, "-").concat(alert.product_id, "-").concat(alert.alert_type),
          );
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts")
              .select("clinic_id, product_id, alert_type")
              .eq("status", "active")
              .in(
                "clinic_id",
                __spreadArray([], new Set(generatedAlerts.map((a) => a.clinic_id)), true),
              ),
          ];
        case 7:
          existingAlerts = _c.sent().data;
          existingKeys_1 = new Set(
            (existingAlerts === null || existingAlerts === void 0
              ? void 0
              : existingAlerts.map((alert) =>
                  ""
                    .concat(alert.clinic_id, "-")
                    .concat(alert.product_id, "-")
                    .concat(alert.alert_type),
                )) || [],
          );
          newAlerts = generatedAlerts.filter(
            (alert) =>
              !existingKeys_1.has(
                ""
                  .concat(alert.clinic_id, "-")
                  .concat(alert.product_id, "-")
                  .concat(alert.alert_type),
              ),
          );
          console.log(
            "Inserting "
              .concat(newAlerts.length, " new alerts (")
              .concat(generatedAlerts.length - newAlerts.length, " duplicates filtered)"),
          );
          if (!(newAlerts.length > 0)) return [3 /*break*/, 9];
          return [4 /*yield*/, supabase.from("stock_alerts").insert(newAlerts)];
        case 8:
          insertError = _c.sent().error;
          if (insertError) {
            console.error("Error inserting alerts:", insertError);
            throw insertError;
          }
          _loop_2 = (alert_1) => {
            var config =
              alertConfigs === null || alertConfigs === void 0
                ? void 0
                : alertConfigs.find((c) => c.id === alert_1.alert_config_id);
            if (
              (config === null || config === void 0 ? void 0 : config.notification_channels) &&
              config.notification_channels.length > 0
            ) {
              notificationQueue.push({
                alert: alert_1,
                channels: config.notification_channels,
              });
            }
          };
          // Queue notifications for new alerts
          for (_b = 0, newAlerts_1 = newAlerts; _b < newAlerts_1.length; _b++) {
            alert_1 = newAlerts_1[_b];
            _loop_2(alert_1);
          }
          _c.label = 9;
        case 9:
          // Process notifications (simplified - would need actual notification service)
          console.log("Queued ".concat(notificationQueue.length, " notifications"));
          // Update performance metrics
          return [4 /*yield*/, updatePerformanceMetrics(supabase, clinicIds)];
        case 10:
          // Update performance metrics
          _c.sent();
          return [
            2 /*return*/,
            new Response(
              JSON.stringify({
                success: true,
                processed: {
                  clinics: clinicIds.length,
                  configurations:
                    (alertConfigs === null || alertConfigs === void 0
                      ? void 0
                      : alertConfigs.length) || 0,
                  alerts_generated: generatedAlerts.length,
                  notifications_queued: notificationQueue.length,
                },
                timestamp: new Date().toISOString(),
              }),
              {
                headers: __assign(__assign({}, corsHeaders), {
                  "Content-Type": "application/json",
                }),
                status: 200,
              },
            ),
          ];
        case 11:
          error_1 = _c.sent();
          console.error("Stock alerts processing error:", error_1);
          return [
            2 /*return*/,
            new Response(
              JSON.stringify({
                success: false,
                error: error_1.message || "Unknown error occurred",
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
        case 12:
          return [2 /*return*/];
      }
    });
  }),
);
function generateAlertsForProduct(product, config) {
  return __awaiter(this, void 0, void 0, function () {
    var alerts, productData, _expiryDate, _today, daysToExpiry, expiryDate, today, daysExpired;
    return __generator(this, (_a) => {
      alerts = [];
      productData = product.products || {};
      switch (config.alert_type) {
        case "low_stock":
          if (
            config.threshold_unit === "quantity" &&
            product.quantity_available <= config.threshold_value
          ) {
            alerts.push({
              clinic_id: config.clinic_id,
              alert_config_id: config.id,
              product_id: product.product_id,
              alert_type: "low_stock",
              severity_level: config.severity_level,
              current_value: product.quantity_available,
              threshold_value: config.threshold_value,
              message: "Estoque baixo: "
                .concat(productData.name || "Produto", " com apenas ")
                .concat(product.quantity_available, " unidades dispon\u00EDveis (m\u00EDnimo: ")
                .concat(config.threshold_value, ")"),
              status: "active",
            });
          }
          break;
        case "expiring":
          if (productData.expiry_date && config.threshold_unit === "days") {
            expiryDate = new Date(productData.expiry_date);
            today = new Date();
            daysToExpiry = Math.ceil(
              (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            if (daysToExpiry <= config.threshold_value && daysToExpiry > 0) {
              alerts.push({
                clinic_id: config.clinic_id,
                alert_config_id: config.id,
                product_id: product.product_id,
                alert_type: "expiring",
                severity_level: config.severity_level,
                current_value: daysToExpiry,
                threshold_value: config.threshold_value,
                message: "Produto pr\u00F3ximo ao vencimento: "
                  .concat(productData.name || "Produto", " vence em ")
                  .concat(daysToExpiry, " dias"),
                status: "active",
              });
            }
          }
          break;
        case "expired":
          if (productData.expiry_date) {
            expiryDate = new Date(productData.expiry_date);
            today = new Date();
            if (expiryDate < today) {
              daysExpired = Math.ceil(
                (today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24),
              );
              alerts.push({
                clinic_id: config.clinic_id,
                alert_config_id: config.id,
                product_id: product.product_id,
                alert_type: "expired",
                severity_level: "critical",
                current_value: daysExpired,
                threshold_value: 0,
                message: "Produto vencido: "
                  .concat(productData.name || "Produto", " venceu h\u00E1 ")
                  .concat(daysExpired, " dias"),
                status: "active",
              });
            }
          }
          break;
        case "overstock":
          if (
            config.threshold_unit === "quantity" &&
            product.quantity_available >= config.threshold_value
          ) {
            alerts.push({
              clinic_id: config.clinic_id,
              alert_config_id: config.id,
              product_id: product.product_id,
              alert_type: "overstock",
              severity_level: config.severity_level,
              current_value: product.quantity_available,
              threshold_value: config.threshold_value,
              message: "Excesso de estoque: "
                .concat(productData.name || "Produto", " com ")
                .concat(product.quantity_available, " unidades (m\u00E1ximo recomendado: ")
                .concat(config.threshold_value, ")"),
              status: "active",
            });
          }
          break;
      }
      return [2 /*return*/, alerts];
    });
  });
}
function updatePerformanceMetrics(supabase, clinicIds) {
  return __awaiter(this, void 0, void 0, function () {
    var _i,
      clinicIds_2,
      clinicId,
      today,
      inventory,
      totalValue,
      productsInRange,
      accuracyPercentage,
      metricsError,
      error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          console.log("Updating performance metrics...");
          (_i = 0), (clinicIds_2 = clinicIds);
          _a.label = 1;
        case 1:
          if (!(_i < clinicIds_2.length)) return [3 /*break*/, 7];
          clinicId = clinicIds_2[_i];
          _a.label = 2;
        case 2:
          _a.trys.push([2, 5, undefined, 6]);
          today = new Date().toISOString().split("T")[0];
          return [
            4 /*yield*/,
            supabase
              .from("stock_inventory")
              .select("quantity_available, unit_cost, min_stock_level")
              .eq("clinic_id", clinicId)
              .eq("is_active", true),
          ];
        case 3:
          inventory = _a.sent().data;
          if (!inventory || inventory.length === 0) return [3 /*break*/, 6];
          totalValue = inventory.reduce(
            (sum, item) => sum + item.quantity_available * item.unit_cost,
            0,
          );
          productsInRange = inventory.filter(
            (item) => item.quantity_available >= item.min_stock_level,
          ).length;
          accuracyPercentage = (productsInRange / inventory.length) * 100;
          return [
            4 /*yield*/,
            supabase.from("stock_performance_metrics").upsert(
              {
                clinic_id: clinicId,
                metric_date: today,
                total_value: totalValue,
                turnover_rate: 0, // Would need historical data
                days_coverage: 30, // Default value
                accuracy_percentage: accuracyPercentage,
                waste_value: 0, // Would need waste movement data
                waste_percentage: 0,
              },
              {
                onConflict: "clinic_id,metric_date",
              },
            ),
          ];
        case 4:
          metricsError = _a.sent().error;
          if (metricsError) {
            console.error("Error updating metrics for clinic ".concat(clinicId, ":"), metricsError);
          }
          return [3 /*break*/, 6];
        case 5:
          error_2 = _a.sent();
          console.error("Error processing metrics for clinic ".concat(clinicId, ":"), error_2);
          return [3 /*break*/, 6];
        case 6:
          _i++;
          return [3 /*break*/, 1];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/* To deploy this function:
 * npx supabase functions deploy stock-alerts-processor
 *
 * To schedule this function (add to supabase/functions/_cron/cron.ts):
 * {
 *   name: 'stock-alerts-processor',
 *   cron: '0 */ 6 *  *  * ', // Every 6 hours
    * 
    * ;
* /
