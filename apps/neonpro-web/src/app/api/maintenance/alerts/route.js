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
exports.PUT = PUT;
var equipment_maintenance_service_1 = require("@/app/lib/services/equipment-maintenance-service");
var maintenance_1 = require("@/app/lib/validations/maintenance");
var server_1 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      clinicId,
      page,
      limit,
      filters,
      equipmentId,
      alertTypes,
      severities,
      result,
      error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 }),
            ];
          }
          page = parseInt(searchParams.get("page") || "1");
          limit = parseInt(searchParams.get("limit") || "20");
          filters = {};
          equipmentId = searchParams.get("equipment_id");
          if (equipmentId) filters.equipment_id = equipmentId;
          alertTypes = searchParams.getAll("alert_type");
          if (alertTypes.length) filters.alert_type = alertTypes;
          severities = searchParams.getAll("severity");
          if (severities.length) filters.severity = severities;
          if (searchParams.get("is_active") !== null) {
            filters.is_active = searchParams.get("is_active") === "true";
          }
          if (searchParams.get("is_acknowledged") !== null) {
            filters.is_acknowledged = searchParams.get("is_acknowledged") === "true";
          }
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.getMaintenanceAlerts(
              clinicId,
              Object.keys(filters).length ? filters : undefined,
              { page: page, limit: limit },
            ),
          ];
        case 1:
          result = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json(result)];
        case 2:
          error_1 = _a.sent();
          console.error("Maintenance Alerts API Error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, validatedData, alert_1, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          validatedData = maintenance_1.createMaintenanceAlertSchema.parse(body);
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.createMaintenanceAlert(
              validatedData,
            ),
          ];
        case 2:
          alert_1 = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json(alert_1, { status: 201 })];
        case 3:
          error_2 = _a.sent();
          console.error("Create Maintenance Alert Error:", error_2);
          if (error_2 instanceof Error && error_2.message.includes("validation")) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid alert data", details: error_2.message },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to create maintenance alert" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      alertId,
      action,
      body,
      result,
      acknowledged_by,
      notes,
      resolved_by,
      notes,
      error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 7, , 8]);
          searchParams = new URL(request.url).searchParams;
          alertId = searchParams.get("alert_id");
          action = searchParams.get("action");
          if (!alertId || !action) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "alert_id e action são obrigatórios" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          result = void 0;
          if (!(action === "acknowledge")) return [3 /*break*/, 3];
          (acknowledged_by = body.acknowledged_by), (notes = body.notes);
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.acknowledgeAlert(
              alertId,
              acknowledged_by,
              notes,
            ),
          ];
        case 2:
          result = _a.sent();
          return [3 /*break*/, 6];
        case 3:
          if (!(action === "resolve")) return [3 /*break*/, 5];
          (resolved_by = body.resolved_by), (notes = body.notes);
          if (!resolved_by || !notes) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "resolved_by e notes são obrigatórios para resolver alertas" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.resolveAlert(
              alertId,
              resolved_by,
              notes,
            ),
          ];
        case 4:
          result = _a.sent();
          return [3 /*break*/, 6];
        case 5:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: 'action deve ser "acknowledge" ou "resolve"' },
              { status: 400 },
            ),
          ];
        case 6:
          return [2 /*return*/, server_1.NextResponse.json(result)];
        case 7:
          error_3 = _a.sent();
          console.error("Update Maintenance Alert Error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to update maintenance alert" },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
