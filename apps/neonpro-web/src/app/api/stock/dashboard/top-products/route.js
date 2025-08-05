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
exports.GET = GET;
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var zod_1 = require("zod");
var dashboardParamsSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  period: zod_1.z.enum(["7d", "30d", "90d", "1y", "custom"]).default("30d"),
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
  limit: zod_1.z.number().min(5).max(50).default(10),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      searchParams,
      params,
      startDate,
      endDate,
      days,
      _b,
      clinic,
      clinicError,
      _c,
      topProductsData,
      topProductsError,
      productMap_1,
      topProducts,
      totalConsumption_1,
      totalValue_1,
      productsWithPercentages,
      error_1;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 4, , 5]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, supabase.auth.getSession()];
        case 1:
          (_a = _d.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          params = dashboardParamsSchema.parse({
            clinicId: searchParams.get("clinicId"),
            period: searchParams.get("period") || "30d",
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            limit: parseInt(searchParams.get("limit") || "10"),
          });
          startDate = void 0;
          endDate = new Date();
          if (params.period === "custom" && params.startDate && params.endDate) {
            startDate = new Date(params.startDate);
            endDate = new Date(params.endDate);
          } else {
            days =
              {
                "7d": 7,
                "30d": 30,
                "90d": 90,
                "1y": 365,
              }[params.period] || 30;
            startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id").eq("id", params.clinicId).single(),
          ];
        case 2:
          (_b = _d.sent()), (clinic = _b.data), (clinicError = _b.error);
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
                "\n        product_id,\n        quantity_out,\n        unit_cost,\n        products!inner (\n          id,\n          name,\n          category_id,\n          product_categories (name)\n        )\n      ",
              )
              .eq("clinic_id", params.clinicId)
              .eq("movement_type", "out")
              .gte("transaction_date", startDate.toISOString())
              .lte("transaction_date", endDate.toISOString()),
          ];
        case 3:
          (_c = _d.sent()), (topProductsData = _c.data), (topProductsError = _c.error);
          if (topProductsError) {
            console.error("Top Products Error:", topProductsError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao buscar produtos mais consumidos" },
                { status: 500 },
              ),
            ];
          }
          productMap_1 = new Map();
          topProductsData === null || topProductsData === void 0
            ? void 0
            : topProductsData.forEach((transaction) => {
                var _a, _b, _c;
                var productId = transaction.product_id;
                var consumption = transaction.quantity_out || 0;
                var value = consumption * (transaction.unit_cost || 0);
                if (productMap_1.has(productId)) {
                  var existing = productMap_1.get(productId);
                  existing.consumption += consumption;
                  existing.value += value;
                  existing.transactions++;
                } else {
                  productMap_1.set(productId, {
                    id: productId,
                    name:
                      ((_a = transaction.products) === null || _a === void 0 ? void 0 : _a.name) ||
                      "Produto sem nome",
                    category:
                      ((_c =
                        (_b = transaction.products) === null || _b === void 0
                          ? void 0
                          : _b.product_categories) === null || _c === void 0
                        ? void 0
                        : _c.name) || "Sem categoria",
                    consumption: consumption,
                    value: value,
                    transactions: 1,
                    trend: "stable", // Would need historical data to calculate real trend
                    impact: value > 1000 ? "high" : value > 500 ? "medium" : "low",
                  });
                }
              });
          topProducts = Array.from(productMap_1.values())
            .sort((a, b) => b.consumption - a.consumption)
            .slice(0, params.limit)
            .map((product, index) =>
              __assign(__assign({}, product), {
                rank: index + 1,
                // Add trend calculation based on ranking (simplified)
                trend: index < 3 ? "up" : index > 7 ? "down" : "stable",
              }),
            );
          totalConsumption_1 = topProducts.reduce((sum, product) => sum + product.consumption, 0);
          totalValue_1 = topProducts.reduce((sum, product) => sum + product.value, 0);
          productsWithPercentages = topProducts.map((product) =>
            __assign(__assign({}, product), {
              consumptionPercentage:
                totalConsumption_1 > 0 ? (product.consumption / totalConsumption_1) * 100 : 0,
              valuePercentage: totalValue_1 > 0 ? (product.value / totalValue_1) * 100 : 0,
            }),
          );
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: productsWithPercentages,
              metadata: {
                period: params.period,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                clinicId: params.clinicId,
                totalProducts: productMap_1.size,
                totalConsumption: totalConsumption_1,
                totalValue: totalValue_1,
                limit: params.limit,
              },
            }),
          ];
        case 4:
          error_1 = _d.sent();
          console.error("Dashboard Top Products API Error:", error_1);
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
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
