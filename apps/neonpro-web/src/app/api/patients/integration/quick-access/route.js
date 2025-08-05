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
var server_1 = require("next/server");
var system_integration_manager_1 = require("@/lib/patients/integration/system-integration-manager");
var server_2 = require("@/lib/supabase/server");
var audit_logger_1 = require("@/lib/audit/audit-logger");
var auditLogger = new audit_logger_1.AuditLogger();
/**
 * Quick Access Patient Lists API
 * GET /api/patients/integration/quick-access
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      searchParams,
      listType,
      limit,
      quickAccessData,
      _b,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 19, , 21]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _c.sent().data;
          if (!profile || !["admin", "manager", "staff"].includes(profile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Acesso negado: permissões insuficientes" },
                { status: 403 },
              ),
            ];
          }
          searchParams = request.nextUrl.searchParams;
          listType = searchParams.get("type") || "recent";
          limit = parseInt(searchParams.get("limit") || "20");
          quickAccessData = void 0;
          _b = listType;
          switch (_b) {
            case "recent":
              return [3 /*break*/, 4];
            case "favorites":
              return [3 /*break*/, 6];
            case "high-risk":
              return [3 /*break*/, 8];
            case "upcoming-appointments":
              return [3 /*break*/, 10];
            case "pending-verification":
              return [3 /*break*/, 12];
            case "frequent":
              return [3 /*break*/, 14];
          }
          return [3 /*break*/, 16];
        case 4:
          return [
            4 /*yield*/,
            (0,
            system_integration_manager_1.createsystemIntegrationManager)().getQuickAccessPatients(
              "recent",
              user.id,
              limit,
            ),
          ];
        case 5:
          quickAccessData = _c.sent();
          return [3 /*break*/, 17];
        case 6:
          return [
            4 /*yield*/,
            (0,
            system_integration_manager_1.createsystemIntegrationManager)().getQuickAccessPatients(
              "favorites",
              user.id,
              limit,
            ),
          ];
        case 7:
          quickAccessData = _c.sent();
          return [3 /*break*/, 17];
        case 8:
          return [
            4 /*yield*/,
            (0,
            system_integration_manager_1.createsystemIntegrationManager)().getQuickAccessPatients(
              "high-risk",
              user.id,
              limit,
            ),
          ];
        case 9:
          quickAccessData = _c.sent();
          return [3 /*break*/, 17];
        case 10:
          return [
            4 /*yield*/,
            (0,
            system_integration_manager_1.createsystemIntegrationManager)().getQuickAccessPatients(
              "upcoming-appointments",
              user.id,
              limit,
            ),
          ];
        case 11:
          quickAccessData = _c.sent();
          return [3 /*break*/, 17];
        case 12:
          return [
            4 /*yield*/,
            (0,
            system_integration_manager_1.createsystemIntegrationManager)().getQuickAccessPatients(
              "pending-verification",
              user.id,
              limit,
            ),
          ];
        case 13:
          quickAccessData = _c.sent();
          return [3 /*break*/, 17];
        case 14:
          return [
            4 /*yield*/,
            (0,
            system_integration_manager_1.createsystemIntegrationManager)().getQuickAccessPatients(
              "frequent",
              user.id,
              limit,
            ),
          ];
        case 15:
          quickAccessData = _c.sent();
          return [3 /*break*/, 17];
        case 16:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Tipo de lista inválido" }, { status: 400 }),
          ];
        case 17:
          // Log quick access activity
          return [
            4 /*yield*/,
            auditLogger.log({
              action: "quick_access_patients",
              userId: user.id,
              details: {
                listType: listType,
                patientCount: quickAccessData.patients.length,
                limit: limit,
              },
              timestamp: new Date(),
            }),
          ];
        case 18:
          // Log quick access activity
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                patients: quickAccessData.patients,
                listType: listType,
                totalCount: quickAccessData.totalCount,
                lastUpdated: quickAccessData.lastUpdated,
              },
            }),
          ];
        case 19:
          error_1 = _c.sent();
          console.error("Error in quick access patients:", error_1);
          return [
            4 /*yield*/,
            auditLogger.log({
              action: "quick_access_patients_error",
              userId: "system",
              details: { error: error_1 instanceof Error ? error_1.message : "Unknown error" },
              timestamp: new Date(),
            }),
          ];
        case 20:
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 21:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Add/Remove Patient from Favorites API
 * POST /api/patients/integration/quick-access
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      body,
      patientId,
      action,
      _b,
      patient,
      patientError,
      result,
      insertError,
      deleteError,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 11, , 13]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _c.sent().data;
          if (!profile || !["admin", "manager", "staff"].includes(profile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Acesso negado: permissões insuficientes" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          (patientId = body.patientId), (action = body.action);
          // Validate required fields
          if (!patientId || !action) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Campos obrigatórios: patientId, action" },
                { status: 400 },
              ),
            ];
          }
          if (!["add", "remove"].includes(action)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: 'Ação inválida: deve ser "add" ou "remove"' },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("patients").select("id, name").eq("id", patientId).single(),
          ];
        case 5:
          (_b = _c.sent()), (patient = _b.data), (patientError = _b.error);
          if (patientError || !patient) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 }),
            ];
          }
          result = void 0;
          if (!(action === "add")) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            supabase.from("user_favorite_patients").insert({
              user_id: user.id,
              patient_id: patientId,
              created_at: new Date().toISOString(),
            }),
          ];
        case 6:
          insertError = _c.sent().error;
          if (insertError && !insertError.message.includes("duplicate")) {
            throw insertError;
          }
          result = { action: "added", patientId: patientId, patientName: patient.name };
          return [3 /*break*/, 9];
        case 7:
          return [
            4 /*yield*/,
            supabase
              .from("user_favorite_patients")
              .delete()
              .eq("user_id", user.id)
              .eq("patient_id", patientId),
          ];
        case 8:
          deleteError = _c.sent().error;
          if (deleteError) {
            throw deleteError;
          }
          result = { action: "removed", patientId: patientId, patientName: patient.name };
          _c.label = 9;
        case 9:
          // Log favorite action
          return [
            4 /*yield*/,
            auditLogger.log({
              action: "patient_favorite_".concat(action),
              userId: user.id,
              details: {
                patientId: patientId,
                patientName: patient.name,
              },
              timestamp: new Date(),
            }),
          ];
        case 10:
          // Log favorite action
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
            }),
          ];
        case 11:
          error_2 = _c.sent();
          console.error("Error managing patient favorites:", error_2);
          return [
            4 /*yield*/,
            auditLogger.log({
              action: "patient_favorite_error",
              userId: "system",
              details: { error: error_2 instanceof Error ? error_2.message : "Unknown error" },
              timestamp: new Date(),
            }),
          ];
        case 12:
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_2 instanceof Error ? error_2.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
