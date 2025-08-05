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
exports.POST = POST;
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var server_1 = require("next/server");
var zod_1 = require("zod");
// Integration with Epic 7 (Financeiro Essencial)
// Provides cost analysis and financial impact of stock management
var financialIntegrationSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  startDate: zod_1.z.string().datetime(),
  endDate: zod_1.z.string().datetime(),
  includeProjections: zod_1.z.boolean().default(true),
  includeBudgetComparison: zod_1.z.boolean().default(true),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      params,
      _b,
      clinic,
      clinicError,
      _c,
      stockMovements,
      movementsError,
      _d,
      currentInventory,
      inventoryError,
      _e,
      budgetData,
      budgetError,
      financialMetrics_1,
      currentInventoryValue,
      categoryBreakdown_1,
      totalInvestment,
      totalReturns,
      wastePercentage,
      turnoverRate,
      budgetComparison,
      totalBudget,
      totalSpent,
      projections,
      daysInPeriod,
      dailyConsumption,
      dailyWaste,
      error_1;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 7, , 8]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          (_a = _f.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _f.sent();
          params = financialIntegrationSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id").eq("id", params.clinicId).single(),
          ];
        case 3:
          (_b = _f.sent()), (clinic = _b.data), (clinicError = _b.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("stock_movement_transactions")
              .select(
                "\n        movement_type,\n        quantity_in,\n        quantity_out,\n        unit_cost,\n        total_cost,\n        transaction_date,\n        reference_type,\n        reference_id,\n        product_id,\n        products (\n          name,\n          category_id,\n          product_categories (name)\n        )\n      ",
              )
              .eq("clinic_id", params.clinicId)
              .gte("transaction_date", params.startDate)
              .lte("transaction_date", params.endDate),
          ];
        case 4:
          (_c = _f.sent()), (stockMovements = _c.data), (movementsError = _c.error);
          if (movementsError) {
            console.error("Stock Movements Error:", movementsError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao buscar movimentações de estoque" },
                { status: 500 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("stock_inventory")
              .select(
                "\n        product_id,\n        quantity_available,\n        unit_cost,\n        products (\n          name,\n          category_id,\n          product_categories (name)\n        )\n      ",
              )
              .eq("clinic_id", params.clinicId)
              .eq("is_active", true),
          ];
        case 5:
          (_d = _f.sent()), (currentInventory = _d.data), (inventoryError = _d.error);
          if (inventoryError) {
            console.error("Inventory Error:", inventoryError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao buscar inventário atual" },
                { status: 500 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("financial_budgets")
              .select("category, allocated_amount, spent_amount, period_start, period_end")
              .eq("clinic_id", params.clinicId)
              .eq("budget_type", "materials")
              .gte("period_start", params.startDate)
              .lte("period_end", params.endDate),
            // Calculate financial metrics
          ];
        case 6:
          (_e = _f.sent()), (budgetData = _e.data), (budgetError = _e.error);
          financialMetrics_1 = {
            purchases: {
              totalCost: 0,
              totalQuantity: 0,
              averageUnitCost: 0,
              transactions: 0,
            },
            consumption: {
              totalCost: 0,
              totalQuantity: 0,
              averageUnitCost: 0,
              transactions: 0,
            },
            waste: {
              totalCost: 0,
              totalQuantity: 0,
              averageUnitCost: 0,
              transactions: 0,
            },
            adjustments: {
              totalCost: 0,
              totalQuantity: 0,
              transactions: 0,
            },
          };
          // Process movements by type
          stockMovements === null || stockMovements === void 0
            ? void 0
            : stockMovements.forEach((movement) => {
                var cost =
                  movement.total_cost ||
                  movement.unit_cost * (movement.quantity_in || movement.quantity_out || 0);
                switch (movement.movement_type) {
                  case "in":
                  case "purchase":
                    financialMetrics_1.purchases.totalCost += cost;
                    financialMetrics_1.purchases.totalQuantity += movement.quantity_in || 0;
                    financialMetrics_1.purchases.transactions++;
                    break;
                  case "out":
                  case "consumption":
                    financialMetrics_1.consumption.totalCost += cost;
                    financialMetrics_1.consumption.totalQuantity += movement.quantity_out || 0;
                    financialMetrics_1.consumption.transactions++;
                    break;
                  case "waste":
                  case "expired":
                    financialMetrics_1.waste.totalCost += cost;
                    financialMetrics_1.waste.totalQuantity += movement.quantity_out || 0;
                    financialMetrics_1.waste.transactions++;
                    break;
                  case "adjustment":
                    financialMetrics_1.adjustments.totalCost += Math.abs(cost);
                    financialMetrics_1.adjustments.totalQuantity += Math.abs(
                      movement.quantity_in || movement.quantity_out || 0,
                    );
                    financialMetrics_1.adjustments.transactions++;
                    break;
                }
              });
          // Calculate averages
          Object.keys(financialMetrics_1).forEach((key) => {
            var metric = financialMetrics_1[key];
            if (metric.totalQuantity > 0) {
              metric.averageUnitCost = metric.totalCost / metric.totalQuantity;
            }
          });
          currentInventoryValue =
            (currentInventory === null || currentInventory === void 0
              ? void 0
              : currentInventory.reduce(
                  (sum, item) => sum + item.quantity_available * item.unit_cost,
                  0,
                )) || 0;
          categoryBreakdown_1 = new Map();
          stockMovements === null || stockMovements === void 0
            ? void 0
            : stockMovements.forEach((movement) => {
                var _a, _b;
                var category =
                  ((_b =
                    (_a = movement.products) === null || _a === void 0
                      ? void 0
                      : _a.product_categories) === null || _b === void 0
                    ? void 0
                    : _b.name) || "Sem categoria";
                var cost =
                  movement.total_cost ||
                  movement.unit_cost * (movement.quantity_in || movement.quantity_out || 0);
                if (!categoryBreakdown_1.has(category)) {
                  categoryBreakdown_1.set(category, {
                    category: category,
                    purchases: 0,
                    consumption: 0,
                    waste: 0,
                    netValue: 0,
                  });
                }
                var categoryData = categoryBreakdown_1.get(category);
                switch (movement.movement_type) {
                  case "in":
                  case "purchase":
                    categoryData.purchases += cost;
                    categoryData.netValue += cost;
                    break;
                  case "out":
                  case "consumption":
                    categoryData.consumption += cost;
                    categoryData.netValue -= cost;
                    break;
                  case "waste":
                  case "expired":
                    categoryData.waste += cost;
                    categoryData.netValue -= cost;
                    break;
                }
              });
          totalInvestment = financialMetrics_1.purchases.totalCost;
          totalReturns = financialMetrics_1.consumption.totalCost; // Value consumed in procedures
          wastePercentage =
            totalInvestment > 0 ? (financialMetrics_1.waste.totalCost / totalInvestment) * 100 : 0;
          turnoverRate =
            currentInventoryValue > 0
              ? financialMetrics_1.consumption.totalCost / currentInventoryValue
              : 0;
          budgetComparison = null;
          if (params.includeBudgetComparison && budgetData && budgetData.length > 0) {
            totalBudget = budgetData.reduce((sum, budget) => sum + budget.allocated_amount, 0);
            totalSpent = financialMetrics_1.purchases.totalCost;
            budgetComparison = {
              totalBudget: totalBudget,
              totalSpent: totalSpent,
              remainingBudget: totalBudget - totalSpent,
              utilizationPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
              variance: totalSpent - totalBudget,
              status:
                totalSpent > totalBudget
                  ? "over_budget"
                  : totalSpent > totalBudget * 0.9
                    ? "near_budget"
                    : "within_budget",
            };
          }
          projections = null;
          if (params.includeProjections) {
            daysInPeriod = Math.ceil(
              (new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) /
                (1000 * 60 * 60 * 24),
            );
            dailyConsumption = financialMetrics_1.consumption.totalCost / daysInPeriod;
            dailyWaste = financialMetrics_1.waste.totalCost / daysInPeriod;
            projections = {
              nextMonthConsumption: dailyConsumption * 30,
              nextMonthWaste: dailyWaste * 30,
              nextMonthNeeds: dailyConsumption * 30 * 1.1, // 10% buffer
              cashFlowImpact: currentInventoryValue + dailyConsumption * 30,
              recommendations: [
                {
                  type: "optimization",
                  message:
                    wastePercentage > 5
                      ? "Alto desperdício detectado - revisar políticas de compra"
                      : "Desperdício dentro do aceitável",
                  priority: wastePercentage > 5 ? "high" : "low",
                },
                {
                  type: "budget",
                  message:
                    (budgetComparison === null || budgetComparison === void 0
                      ? void 0
                      : budgetComparison.status) === "over_budget"
                      ? "Orçamento excedido - revisar gastos"
                      : "Orçamento sob controle",
                  priority:
                    (budgetComparison === null || budgetComparison === void 0
                      ? void 0
                      : budgetComparison.status) === "over_budget"
                      ? "critical"
                      : "low",
                },
              ],
            };
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                period: {
                  startDate: params.startDate,
                  endDate: params.endDate,
                },
                summary: {
                  totalInvestment: totalInvestment,
                  totalConsumption: financialMetrics_1.consumption.totalCost,
                  totalWaste: financialMetrics_1.waste.totalCost,
                  currentInventoryValue: currentInventoryValue,
                  turnoverRate: turnoverRate,
                  wastePercentage: wastePercentage,
                  netCashFlow:
                    totalInvestment -
                    financialMetrics_1.consumption.totalCost -
                    financialMetrics_1.waste.totalCost,
                },
                metrics: financialMetrics_1,
                categoryBreakdown: Array.from(categoryBreakdown_1.values()),
                budgetComparison: budgetComparison,
                projections: projections,
                integration: {
                  source: "Epic 7 - Financeiro Essencial",
                  lastSync: new Date().toISOString(),
                  budgetDataAvailable: budgetData && budgetData.length > 0,
                },
              },
            }),
          ];
        case 7:
          error_1 = _f.sent();
          console.error("Financial Integration API Error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Parâmetros inválidos", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
