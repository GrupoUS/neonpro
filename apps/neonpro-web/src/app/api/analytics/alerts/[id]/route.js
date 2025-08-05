"use strict";
// Individual Alert Management API
// Description: API endpoints for individual alert acknowledgment and updates
// Author: Dev Agent
// Date: 2025-01-26
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
exports.PATCH = PATCH;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, user, userError, _d, alert_1, error, error_1;
    var _e, _f;
    var params = _b.params;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 3, , 4]);
          supabase = (0, server_2.createClient)();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _g.sent()), (user = _c.data.user), (userError = _c.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("kpi_alerts")
              .select("\n        *,\n        financial_kpis(kpi_name, kpi_category)\n      ")
              .eq("id", params.id)
              .single(),
          ];
        case 2:
          (_d = _g.sent()), (alert_1 = _d.data), (error = _d.error);
          if (error) {
            if (error.code === "PGRST116") {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { success: false, error: "Alert not found" },
                  { status: 404 },
                ),
              ];
            }
            throw new Error("Database error: ".concat(error.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                id: alert_1.id,
                kpi_id: alert_1.kpi_id,
                kpi_name:
                  (_e = alert_1.financial_kpis) === null || _e === void 0 ? void 0 : _e.kpi_name,
                kpi_category:
                  (_f = alert_1.financial_kpis) === null || _f === void 0
                    ? void 0
                    : _f.kpi_category,
                alert_type: alert_1.alert_type,
                alert_message: alert_1.alert_message,
                threshold_value: alert_1.threshold_value,
                current_value: alert_1.current_value,
                variance_percent: alert_1.variance_percent,
                is_acknowledged: alert_1.is_acknowledged,
                acknowledged_at: alert_1.acknowledged_at,
                acknowledged_by: alert_1.acknowledged_by,
                created_at: alert_1.created_at,
                metadata: alert_1.metadata,
              },
            }),
          ];
        case 3:
          error_1 = _g.sent();
          console.error("Error retrieving alert:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Internal server error",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function PATCH(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      user,
      userError,
      body,
      action,
      metadata,
      updateData,
      _d,
      updatedAlert,
      error,
      error_2;
    var _e, _f;
    var params = _b.params;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 4, , 5]);
          supabase = (0, server_2.createClient)();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _g.sent()), (user = _c.data.user), (userError = _c.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _g.sent();
          (action = body.action), (metadata = body.metadata);
          updateData = {};
          if (action === "acknowledge") {
            updateData = {
              is_acknowledged: true,
              acknowledged_at: new Date().toISOString(),
              acknowledged_by: user.id,
            };
          } else if (action === "unacknowledge") {
            updateData = {
              is_acknowledged: false,
              acknowledged_at: null,
              acknowledged_by: null,
            };
          } else {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: 'Invalid action. Use "acknowledge" or "unacknowledge"' },
                { status: 400 },
              ),
            ];
          }
          if (metadata) {
            updateData.metadata = metadata;
          }
          return [
            4 /*yield*/,
            supabase
              .from("kpi_alerts")
              .update(updateData)
              .eq("id", params.id)
              .select("\n        *,\n        financial_kpis(kpi_name, kpi_category)\n      ")
              .single(),
          ];
        case 3:
          (_d = _g.sent()), (updatedAlert = _d.data), (error = _d.error);
          if (error) {
            if (error.code === "PGRST116") {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { success: false, error: "Alert not found" },
                  { status: 404 },
                ),
              ];
            }
            throw new Error("Database error: ".concat(error.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                id: updatedAlert.id,
                kpi_id: updatedAlert.kpi_id,
                kpi_name:
                  (_e = updatedAlert.financial_kpis) === null || _e === void 0
                    ? void 0
                    : _e.kpi_name,
                kpi_category:
                  (_f = updatedAlert.financial_kpis) === null || _f === void 0
                    ? void 0
                    : _f.kpi_category,
                alert_type: updatedAlert.alert_type,
                alert_message: updatedAlert.alert_message,
                threshold_value: updatedAlert.threshold_value,
                current_value: updatedAlert.current_value,
                variance_percent: updatedAlert.variance_percent,
                is_acknowledged: updatedAlert.is_acknowledged,
                acknowledged_at: updatedAlert.acknowledged_at,
                acknowledged_by: updatedAlert.acknowledged_by,
                created_at: updatedAlert.created_at,
                metadata: updatedAlert.metadata,
              },
              message: "Alert ".concat(action, "d successfully"),
            }),
          ];
        case 4:
          error_2 = _g.sent();
          console.error("Error updating alert:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Internal server error",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, user, userError, error, error_3;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 3, , 4]);
          supabase = (0, server_2.createClient)();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _d.sent()), (user = _c.data.user), (userError = _c.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.from("kpi_alerts").delete().eq("id", params.id)];
        case 2:
          error = _d.sent().error;
          if (error) {
            throw new Error("Database error: ".concat(error.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Alert deleted successfully",
            }),
          ];
        case 3:
          error_3 = _d.sent();
          console.error("Error deleting alert:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Internal server error",
                message: error_3 instanceof Error ? error_3.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
