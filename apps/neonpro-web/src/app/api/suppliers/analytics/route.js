"use strict";
// =====================================================================================
// SUPPLIER ANALYTICS API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================
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
var supplier_management_service_1 = require("@/app/lib/services/supplier-management-service");
var suppliers_1 = require("@/app/lib/validations/suppliers");
var server_1 = require("next/server");
var supplierService = new supplier_management_service_1.SupplierManagementService();
// =====================================================================================
// GET /api/suppliers/analytics - Get supplier analytics
// =====================================================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, clinicId, periodStart, periodEnd, analytics, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          periodStart = searchParams.get("period_start");
          periodEnd = searchParams.get("period_end");
          if (!clinicId || !periodStart || !periodEnd) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "clinic_id, period_start e period_end são obrigatórios" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supplierService.getSupplierAnalytics(clinicId, periodStart, periodEnd),
          ];
        case 1:
          analytics = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json(analytics)];
        case 2:
          error_1 = _a.sent();
          console.error("Erro ao buscar analytics:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// POST /api/suppliers/analytics/compare - Compare suppliers
// =====================================================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, validationResult, comparison, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          validationResult = suppliers_1.supplierComparisonSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Dados inválidos", details: validationResult.error.issues },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supplierService.compareSuppliers(validationResult.data.supplier_ids),
          ];
        case 2:
          comparison = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json(comparison)];
        case 3:
          error_2 = _a.sent();
          console.error("Erro ao comparar fornecedores:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
