"use strict";
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      searchParams,
      patientId,
      includeHistory,
      _a,
      patientUsage,
      error,
      _b,
      generalStats,
      error,
      stats,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 8, , 9]);
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          patientId = searchParams.get("patientId");
          includeHistory = searchParams.get("includeHistory") === "true";
          if (!patientId) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase
              .from("stock_movements")
              .select(
                "\n          id,\n          movement_type,\n          quantity,\n          unit_price,\n          reason,\n          created_at,\n          stock_item:stock_items(\n            id,\n            name,\n            category,\n            unit_price\n          ),\n          appointment:appointments(\n            id,\n            appointment_date,\n            status,\n            patient:patients(\n              id,\n              full_name,\n              email\n            )\n          )\n        ",
              )
              .eq("movement_type", "out")
              .contains("reason", patientId)
              .order("created_at", { ascending: false }),
          ];
        case 4:
          (_a = _c.sent()), (patientUsage = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: error.message }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: patientUsage,
            }),
          ];
        case 5:
          return [
            4 /*yield*/,
            supabase
              .from("stock_movements")
              .select(
                "\n          id,\n          movement_type,\n          quantity,\n          unit_price,\n          reason,\n          created_at,\n          stock_item:stock_items(\n            id,\n            name,\n            category\n          )\n        ",
              )
              .eq("movement_type", "out")
              .like("reason", "%patient_%")
              .order("created_at", { ascending: false }),
          ];
        case 6:
          (_b = _c.sent()), (generalStats = _b.data), (error = _b.error);
          if (error) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: error.message }, { status: 500 }),
            ];
          }
          stats = {
            totalConsumption:
              (generalStats === null || generalStats === void 0
                ? void 0
                : generalStats.reduce(function (acc, movement) {
                    return acc + movement.quantity;
                  }, 0)) || 0,
            totalValue:
              (generalStats === null || generalStats === void 0
                ? void 0
                : generalStats.reduce(function (acc, movement) {
                    return acc + movement.quantity * movement.unit_price;
                  }, 0)) || 0,
            categoryUsage:
              (generalStats === null || generalStats === void 0
                ? void 0
                : generalStats.reduce(function (acc, movement) {
                    var _a;
                    var category =
                      ((_a = movement.stock_item) === null || _a === void 0
                        ? void 0
                        : _a.category) || "Outros";
                    acc[category] = (acc[category] || 0) + movement.quantity;
                    return acc;
                  }, {})) || {},
            monthlyTrend:
              (generalStats === null || generalStats === void 0
                ? void 0
                : generalStats.reduce(function (acc, movement) {
                    var month = new Date(movement.created_at).toISOString().slice(0, 7);
                    acc[month] = (acc[month] || 0) + movement.quantity;
                    return acc;
                  }, {})) || {},
          };
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: stats,
              movements: includeHistory ? generalStats : [],
            }),
          ];
        case 7:
          return [3 /*break*/, 9];
        case 8:
          error_1 = _c.sent();
          console.error("Patient Integration Error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      patientId,
      stockItemId,
      quantity,
      appointmentId,
      notes,
      _a,
      stockItem,
      stockError,
      _b,
      movement,
      movementError,
      updateError,
      newQuantity,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 10, , 11]);
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          (patientId = body.patientId),
            (stockItemId = body.stockItemId),
            (quantity = body.quantity),
            (appointmentId = body.appointmentId),
            (notes = body.notes);
          return [
            4 /*yield*/,
            supabase
              .from("stock_items")
              .select("current_quantity, min_threshold")
              .eq("id", stockItemId)
              .single(),
          ];
        case 5:
          (_a = _c.sent()), (stockItem = _a.data), (stockError = _a.error);
          if (stockError || !stockItem) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Item de estoque não encontrado" },
                { status: 404 },
              ),
            ];
          }
          if (stockItem.current_quantity < quantity) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Quantidade insuficiente em estoque" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("stock_movements")
              .insert({
                stock_item_id: stockItemId,
                movement_type: "out",
                quantity: quantity,
                reason: "patient_"
                  .concat(patientId)
                  .concat(appointmentId ? "_appointment_".concat(appointmentId) : ""),
                notes: notes,
                user_id: session.user.id,
              })
              .select()
              .single(),
          ];
        case 6:
          (_b = _c.sent()), (movement = _b.data), (movementError = _b.error);
          if (movementError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: movementError.message }, { status: 500 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("stock_items")
              .update({
                current_quantity: stockItem.current_quantity - quantity,
                updated_at: new Date().toISOString(),
              })
              .eq("id", stockItemId),
          ];
        case 7:
          updateError = _c.sent().error;
          if (updateError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: updateError.message }, { status: 500 }),
            ];
          }
          newQuantity = stockItem.current_quantity - quantity;
          if (!(newQuantity <= stockItem.min_threshold)) return [3 /*break*/, 9];
          // Criar alerta de estoque baixo
          return [
            4 /*yield*/,
            supabase.from("stock_alerts").insert({
              stock_item_id: stockItemId,
              alert_type: "low_stock",
              threshold_value: stockItem.min_threshold,
              current_value: newQuantity,
              message: "Estoque baixo ap\u00F3s uso em paciente ".concat(patientId),
              is_resolved: false,
              created_by: session.user.id,
            }),
          ];
        case 8:
          // Criar alerta de estoque baixo
          _c.sent();
          _c.label = 9;
        case 9:
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              movement: movement,
              newQuantity: newQuantity,
              alertGenerated: newQuantity <= stockItem.min_threshold,
            }),
          ];
        case 10:
          error_2 = _c.sent();
          console.error("Patient Stock Usage Error:", error_2);
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
