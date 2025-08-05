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
exports.POST = POST;
// Bulk Order Optimization API Endpoint
// POST /api/inventory/purchase-orders/optimize - Get bulk order optimization recommendations
var purchase_order_service_1 = require("@/app/lib/services/purchase-order-service");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
var optimizeBulkOrderSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().min(1, "Clinic ID is required"),
  item_ids: zod_1.z
    .array(zod_1.z.string().min(1, "Item ID is required"))
    .min(1, "At least one item is required"),
  analysis_type: zod_1.z
    .enum(["eoq", "bulk_discount", "seasonal", "all"])
    .optional()
    .default("all"),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      body,
      validatedData,
      optimizationResults,
      _a,
      itemsData_1,
      itemsError,
      enhancedRecommendations,
      bulkOpportunities,
      seasonalRecommendations,
      _b,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 10, , 11]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _c.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validatedData = optimizeBulkOrderSchema.parse(body);
          return [
            4 /*yield*/,
            purchase_order_service_1.purchaseOrderService.optimizeBulkOrder(
              validatedData.clinic_id,
              validatedData.item_ids,
            ),
          ];
        case 4:
          optimizationResults = _c.sent();
          return [
            4 /*yield*/,
            supabase
              .from("inventory_items")
              .select(
                "\n        id,\n        name,\n        sku,\n        category,\n        unit_cost,\n        current_stock,\n        minimum_threshold,\n        maximum_threshold,\n        unit\n      ",
              )
              .in("id", validatedData.item_ids),
          ];
        case 5:
          (_a = _c.sent()), (itemsData_1 = _a.data), (itemsError = _a.error);
          if (itemsError) {
            console.error("Error fetching item details:", itemsError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to fetch item details" },
                { status: 500 },
              ),
            ];
          }
          enhancedRecommendations = optimizationResults.recommendations.map(function (rec) {
            var itemData =
              itemsData_1 === null || itemsData_1 === void 0
                ? void 0
                : itemsData_1.find(function (item) {
                    return item.id === rec.itemId;
                  });
            return __assign(__assign({}, rec), {
              item_details: itemData
                ? {
                    name: itemData.name,
                    sku: itemData.sku,
                    category: itemData.category,
                    unit_cost: itemData.unit_cost,
                    current_stock: itemData.current_stock,
                    minimum_threshold: itemData.minimum_threshold,
                    maximum_threshold: itemData.maximum_threshold,
                    unit: itemData.unit,
                  }
                : null,
              optimization_type: "EOQ",
              potential_savings_percentage: itemData
                ? (rec.costSavings / (itemData.unit_cost * rec.currentQuantity)) * 100
                : 0,
            });
          });
          return [
            4 /*yield*/,
            analyzeBulkOpportunities(supabase, validatedData.item_ids, validatedData.clinic_id),
          ];
        case 6:
          bulkOpportunities = _c.sent();
          if (
            !(validatedData.analysis_type === "seasonal" || validatedData.analysis_type === "all")
          )
            return [3 /*break*/, 8];
          return [
            4 /*yield*/,
            generateSeasonalRecommendations(
              supabase,
              validatedData.item_ids,
              validatedData.clinic_id,
            ),
          ];
        case 7:
          _b = _c.sent();
          return [3 /*break*/, 9];
        case 8:
          _b = [];
          _c.label = 9;
        case 9:
          seasonalRecommendations = _b;
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              optimization_summary: {
                total_items_analyzed: validatedData.item_ids.length,
                total_potential_savings: optimizationResults.totalSavings,
                recommendations_count: enhancedRecommendations.length,
                bulk_opportunities_count: bulkOpportunities.length,
                seasonal_recommendations_count: seasonalRecommendations.length,
              },
              eoq_recommendations: enhancedRecommendations,
              bulk_opportunities: bulkOpportunities,
              seasonal_recommendations: seasonalRecommendations,
              analysis_metadata: {
                analysis_type: validatedData.analysis_type,
                generated_at: new Date().toISOString(),
                clinic_id: validatedData.clinic_id,
              },
            }),
          ];
        case 10:
          error_1 = _c.sent();
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Validation error",
                  details: error_1.errors,
                },
                { status: 400 },
              ),
            ];
          }
          console.error("Error in bulk order optimization:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
// Helper function to analyze bulk opportunities
function analyzeBulkOpportunities(supabase, itemIds, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, supplierItems, error, bulkOpportunities, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("supplier_items")
              .select(
                "\n        item_id,\n        supplier_id,\n        unit_cost,\n        bulk_discount_threshold,\n        bulk_discount_percentage,\n        minimum_order_quantity,\n        suppliers (\n          name,\n          bulk_order_incentives\n        )\n      ",
              )
              .in("item_id", itemIds)
              .not("bulk_discount_threshold", "is", null),
          ];
        case 1:
          (_a = _b.sent()), (supplierItems = _a.data), (error = _a.error);
          if (error) return [2 /*return*/, []];
          bulkOpportunities =
            (supplierItems === null || supplierItems === void 0
              ? void 0
              : supplierItems.map(function (item) {
                  var _a;
                  var potentialSavings =
                    item.unit_cost *
                    item.bulk_discount_threshold *
                    (item.bulk_discount_percentage / 100);
                  return {
                    item_id: item.item_id,
                    supplier_id: item.supplier_id,
                    supplier_name:
                      (_a = item.suppliers) === null || _a === void 0 ? void 0 : _a.name,
                    bulk_threshold: item.bulk_discount_threshold,
                    discount_percentage: item.bulk_discount_percentage,
                    minimum_order: item.minimum_order_quantity,
                    potential_savings: potentialSavings,
                    recommendation: "Order "
                      .concat(item.bulk_discount_threshold, " units to get ")
                      .concat(item.bulk_discount_percentage, "% discount"),
                    priority:
                      potentialSavings > 100 ? "high" : potentialSavings > 50 ? "medium" : "low",
                  };
                })) || [];
          return [
            2 /*return*/,
            bulkOpportunities.sort(function (a, b) {
              return b.potential_savings - a.potential_savings;
            }),
          ];
        case 2:
          error_2 = _b.sent();
          console.error("Error analyzing bulk opportunities:", error_2);
          return [2 /*return*/, []];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Helper function to generate seasonal recommendations
function generateSeasonalRecommendations(supabase, itemIds, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      consumptionData,
      error,
      monthlyConsumption,
      seasonalRecommendations,
      _loop_1,
      _i,
      _b,
      _c,
      itemId,
      monthlyData,
      error_3;
    var _d, _e;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("inventory_transactions")
              .select(
                "\n        item_id,\n        quantity,\n        created_at,\n        inventory_items (\n          name,\n          category\n        )\n      ",
              )
              .in("item_id", itemIds)
              .eq("clinic_id", clinicId)
              .eq("transaction_type", "consumption")
              .gte("created_at", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
          ];
        case 1:
          (_a = _f.sent()), (consumptionData = _a.data), (error = _a.error);
          if (error || !consumptionData) return [2 /*return*/, []];
          monthlyConsumption = consumptionData.reduce(function (acc, transaction) {
            var month = new Date(transaction.created_at).getMonth();
            var itemId = transaction.item_id;
            if (!acc[itemId]) acc[itemId] = {};
            if (!acc[itemId][month]) acc[itemId][month] = 0;
            acc[itemId][month] += Math.abs(transaction.quantity);
            return acc;
          }, {});
          seasonalRecommendations = [];
          _loop_1 = function (itemId, monthlyData) {
            var months = Object.values(monthlyData);
            var avgConsumption =
              months.reduce(function (sum, val) {
                return sum + val;
              }, 0) / months.length;
            var maxConsumption = Math.max.apply(Math, months);
            var peakMonth =
              (_d = Object.entries(monthlyData).find(function (_a) {
                var value = _a[1];
                return value === maxConsumption;
              })) === null || _d === void 0
                ? void 0
                : _d[0];
            // If peak consumption is significantly higher than average
            if (maxConsumption > avgConsumption * 1.5) {
              var itemData =
                (_e = consumptionData.find(function (t) {
                  return t.item_id === itemId;
                })) === null || _e === void 0
                  ? void 0
                  : _e.inventory_items;
              seasonalRecommendations.push({
                item_id: itemId,
                item_name: itemData === null || itemData === void 0 ? void 0 : itemData.name,
                category: itemData === null || itemData === void 0 ? void 0 : itemData.category,
                peak_month: peakMonth ? parseInt(peakMonth) : null,
                peak_consumption: maxConsumption,
                average_consumption: Math.round(avgConsumption),
                seasonality_factor: Math.round((maxConsumption / avgConsumption) * 100) / 100,
                recommendation: "Consider increasing stock before month "
                  .concat(peakMonth ? parseInt(peakMonth) + 1 : "N/A", " due to ")
                  .concat(
                    Math.round((maxConsumption / avgConsumption - 1) * 100),
                    "% higher consumption",
                  ),
                suggested_stock_increase: Math.round(maxConsumption - avgConsumption),
                priority: maxConsumption > avgConsumption * 2 ? "high" : "medium",
              });
            }
          };
          for (_i = 0, _b = Object.entries(monthlyConsumption); _i < _b.length; _i++) {
            (_c = _b[_i]), (itemId = _c[0]), (monthlyData = _c[1]);
            _loop_1(itemId, monthlyData);
          }
          return [
            2 /*return*/,
            seasonalRecommendations.sort(function (a, b) {
              return b.seasonality_factor - a.seasonality_factor;
            }),
          ];
        case 2:
          error_3 = _f.sent();
          console.error("Error generating seasonal recommendations:", error_3);
          return [2 /*return*/, []];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
