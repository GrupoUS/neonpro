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
// Integration with Epic 6 (Agenda Inteligente)
// Predicts material consumption based on scheduled procedures
var scheduleIntegrationSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  startDate: zod_1.z.string().datetime(),
  endDate: zod_1.z.string().datetime(),
  includeRecommendations: zod_1.z.boolean().default(true),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      params_1,
      _b,
      clinic,
      clinicError,
      _c,
      appointments,
      appointmentsError,
      _d,
      materialTemplates_1,
      templatesError,
      materialPredictions_1,
      dailyPredictions_1,
      productIds,
      _e,
      currentStock,
      stockError,
      stockMap_1,
      recommendations_1,
      alerts_1,
      dailyBreakdown,
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
          params_1 = scheduleIntegrationSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id").eq("id", params_1.clinicId).single(),
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
              .from("appointments")
              .select(
                "\n        id,\n        scheduled_date,\n        procedure_type,\n        status,\n        patient_id,\n        procedure_templates (\n          id,\n          name,\n          estimated_duration,\n          required_materials\n        )\n      ",
              )
              .eq("clinic_id", params_1.clinicId)
              .gte("scheduled_date", params_1.startDate)
              .lte("scheduled_date", params_1.endDate)
              .in("status", ["scheduled", "confirmed"]),
          ];
        case 4:
          (_c = _f.sent()), (appointments = _c.data), (appointmentsError = _c.error);
          if (appointmentsError) {
            console.error("Appointments Error:", appointmentsError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("procedure_material_templates")
              .select(
                "\n        procedure_type,\n        product_id,\n        estimated_quantity,\n        is_mandatory,\n        products (\n          id,\n          name,\n          unit_cost\n        )\n      ",
              )
              .eq("clinic_id", params_1.clinicId)
              .eq("is_active", true),
          ];
        case 5:
          (_d = _f.sent()), (materialTemplates_1 = _d.data), (templatesError = _d.error);
          if (templatesError) {
            console.error("Material Templates Error:", templatesError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao buscar templates de materiais" },
                { status: 500 },
              ),
            ];
          }
          materialPredictions_1 = new Map();
          dailyPredictions_1 = new Map();
          appointments === null || appointments === void 0
            ? void 0
            : appointments.forEach((appointment) => {
                var appointmentDate = appointment.scheduled_date.split("T")[0];
                var procedureType = appointment.procedure_type;
                // Get materials for this procedure type
                var requiredMaterials =
                  (materialTemplates_1 === null || materialTemplates_1 === void 0
                    ? void 0
                    : materialTemplates_1.filter(
                        (template) => template.procedure_type === procedureType,
                      )) || [];
                requiredMaterials.forEach((material) => {
                  var _a, _b;
                  var productId = material.product_id;
                  var quantity = material.estimated_quantity || 1;
                  var productName =
                    ((_a = material.products) === null || _a === void 0 ? void 0 : _a.name) ||
                    "Material desconhecido";
                  var unitCost =
                    ((_b = material.products) === null || _b === void 0 ? void 0 : _b.unit_cost) ||
                    0;
                  // Accumulate by product
                  if (materialPredictions_1.has(productId)) {
                    var existing = materialPredictions_1.get(productId);
                    existing.totalQuantity += quantity;
                    existing.procedures++;
                  } else {
                    materialPredictions_1.set(productId, {
                      productId: productId,
                      productName: productName,
                      unitCost: unitCost,
                      totalQuantity: quantity,
                      procedures: 1,
                      isMandatory: material.is_mandatory,
                    });
                  }
                  // Accumulate by day
                  var dayKey = "".concat(appointmentDate, "-").concat(productId);
                  if (dailyPredictions_1.has(dayKey)) {
                    var existing = dailyPredictions_1.get(dayKey);
                    existing.quantity += quantity;
                  } else {
                    dailyPredictions_1.set(dayKey, {
                      date: appointmentDate,
                      productId: productId,
                      productName: productName,
                      quantity: quantity,
                      estimatedCost: quantity * unitCost,
                    });
                  }
                });
              });
          productIds = Array.from(materialPredictions_1.keys());
          return [
            4 /*yield*/,
            supabase
              .from("stock_inventory")
              .select("product_id, quantity_available, min_stock_level")
              .eq("clinic_id", params_1.clinicId)
              .in("product_id", productIds)
              .eq("is_active", true),
          ];
        case 6:
          (_e = _f.sent()), (currentStock = _e.data), (stockError = _e.error);
          if (stockError) {
            console.error("Stock Error:", stockError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Erro ao buscar estoque atual" },
                { status: 500 },
              ),
            ];
          }
          stockMap_1 = new Map();
          currentStock === null || currentStock === void 0
            ? void 0
            : currentStock.forEach((stock) => {
                stockMap_1.set(stock.product_id, stock);
              });
          recommendations_1 = [];
          alerts_1 = [];
          Array.from(materialPredictions_1.values()).forEach((prediction) => {
            var currentStockItem = stockMap_1.get(prediction.productId);
            var availableQuantity =
              (currentStockItem === null || currentStockItem === void 0
                ? void 0
                : currentStockItem.quantity_available) || 0;
            var minStockLevel =
              (currentStockItem === null || currentStockItem === void 0
                ? void 0
                : currentStockItem.min_stock_level) || 0;
            // Check if current stock is sufficient
            var stockAfterConsumption = availableQuantity - prediction.totalQuantity;
            if (stockAfterConsumption < minStockLevel) {
              var shortfall = minStockLevel - stockAfterConsumption;
              recommendations_1.push({
                type: "reorder",
                priority: stockAfterConsumption < 0 ? "critical" : "high",
                productId: prediction.productId,
                productName: prediction.productName,
                message:
                  stockAfterConsumption < 0
                    ? "Falta cr\u00EDtica: "
                        .concat(prediction.productName, " ter\u00E1 d\u00E9ficit de ")
                        .concat(Math.abs(stockAfterConsumption), " unidades")
                    : "Reposi\u00E7\u00E3o necess\u00E1ria: ".concat(
                        prediction.productName,
                        " ficar\u00E1 abaixo do estoque m\u00EDnimo",
                      ),
                recommendedOrder: shortfall + 10, // Add buffer
                estimatedCost: (shortfall + 10) * prediction.unitCost,
                dueDate: params_1.startDate,
              });
              alerts_1.push({
                type: "schedule_shortage",
                severity: stockAfterConsumption < 0 ? "critical" : "high",
                productId: prediction.productId,
                message: "".concat(
                  prediction.productName,
                  ": estoque insuficiente para agendamentos",
                ),
                impact: "".concat(prediction.procedures, " procedimentos afetados"),
              });
            }
          });
          dailyBreakdown = Array.from(dailyPredictions_1.values()).reduce((acc, item) => {
            if (!acc[item.date]) {
              acc[item.date] = {
                date: item.date,
                totalCost: 0,
                materials: [],
              };
            }
            acc[item.date].totalCost += item.estimatedCost;
            acc[item.date].materials.push(item);
            return acc;
          }, {});
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                period: {
                  startDate: params_1.startDate,
                  endDate: params_1.endDate,
                },
                summary: {
                  totalAppointments:
                    (appointments === null || appointments === void 0
                      ? void 0
                      : appointments.length) || 0,
                  uniqueMaterials: materialPredictions_1.size,
                  totalEstimatedCost: Array.from(materialPredictions_1.values()).reduce(
                    (sum, pred) => sum + pred.totalQuantity * pred.unitCost,
                    0,
                  ),
                  potentialShortages: alerts_1.length,
                },
                predictions: Array.from(materialPredictions_1.values()),
                dailyBreakdown: Object.values(dailyBreakdown),
                recommendations: recommendations_1.slice(0, 10), // Top 10 recommendations
                alerts: alerts_1.slice(0, 20), // Top 20 alerts
                integration: {
                  source: "Epic 6 - Agenda Inteligente",
                  lastSync: new Date().toISOString(),
                },
              },
            }),
          ];
        case 7:
          error_1 = _f.sent();
          console.error("Schedule Integration API Error:", error_1);
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
