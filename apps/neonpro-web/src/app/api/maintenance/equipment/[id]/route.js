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
exports.PUT = PUT;
exports.DELETE = DELETE;
var equipment_maintenance_service_1 = require("@/app/lib/services/equipment-maintenance-service");
var maintenance_1 = require("@/app/lib/validations/maintenance");
var server_1 = require("next/server");
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var searchParams, clinicId, equipment, error_1;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.getEquipment(params.id),
          ];
        case 1:
          equipment = _c.sent();
          if (!equipment) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Equipment not found" }, { status: 404 }),
            ];
          }
          // Verify equipment belongs to specified clinic
          if (equipment.clinic_id !== clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Forbidden" }, { status: 403 }),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json(equipment)];
        case 2:
          error_1 = _c.sent();
          console.error("Get Equipment Error:", error_1);
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
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var searchParams, clinicId, existingEquipment, body, validatedData, equipment, error_2;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.getEquipment(params.id),
          ];
        case 1:
          existingEquipment = _c.sent();
          if (!existingEquipment || existingEquipment.clinic_id !== clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Equipment not found" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _c.sent();
          validatedData = maintenance_1.updateEquipmentSchema.parse(body);
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.updateEquipment(
              params.id,
              validatedData,
            ),
          ];
        case 3:
          equipment = _c.sent();
          return [2 /*return*/, server_1.NextResponse.json(equipment)];
        case 4:
          error_2 = _c.sent();
          console.error("Update Equipment Error:", error_2);
          if (error_2 instanceof Error && error_2.message.includes("validation")) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid equipment data", details: error_2.message },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to update equipment" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var searchParams, clinicId, existingEquipment, error_3;
    var params = _b.params;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.getEquipment(params.id),
          ];
        case 1:
          existingEquipment = _c.sent();
          if (!existingEquipment || existingEquipment.clinic_id !== clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Equipment not found" }, { status: 404 }),
            ];
          }
          // Soft delete by setting status to out_of_service
          return [
            4 /*yield*/,
            equipment_maintenance_service_1.equipmentMaintenanceService.updateEquipment(params.id, {
              status: "out_of_service",
            }),
          ];
        case 2:
          // Soft delete by setting status to out_of_service
          _c.sent();
          return [2 /*return*/, server_1.NextResponse.json({ success: true })];
        case 3:
          error_3 = _c.sent();
          console.error("Delete Equipment Error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to delete equipment" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
