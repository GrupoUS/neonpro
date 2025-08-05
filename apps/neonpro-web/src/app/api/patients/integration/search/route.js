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
 * Advanced Patient Search API
 * GET /api/patients/integration/search
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      searchParams,
      query,
      limit,
      filters,
      minAge,
      maxAge,
      lastVisitFrom,
      lastVisitTo,
      tags,
      searchResults,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _b.sent().data;
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
          query = searchParams.get("q") || "";
          limit = parseInt(searchParams.get("limit") || "50");
          filters = {};
          if (searchParams.get("name")) filters.name = searchParams.get("name");
          if (searchParams.get("email")) filters.email = searchParams.get("email");
          if (searchParams.get("phone")) filters.phone = searchParams.get("phone");
          if (searchParams.get("cpf")) filters.cpf = searchParams.get("cpf");
          if (searchParams.get("gender")) filters.gender = searchParams.get("gender");
          if (searchParams.get("riskLevel")) filters.riskLevel = searchParams.get("riskLevel");
          if (searchParams.get("treatmentType"))
            filters.treatmentType = searchParams.get("treatmentType");
          if (searchParams.get("appointmentStatus"))
            filters.appointmentStatus = searchParams.get("appointmentStatus");
          if (searchParams.get("hasPhotos"))
            filters.hasPhotos = searchParams.get("hasPhotos") === "true";
          if (searchParams.get("consentStatus"))
            filters.consentStatus = searchParams.get("consentStatus") === "true";
          minAge = searchParams.get("minAge");
          maxAge = searchParams.get("maxAge");
          if (minAge && maxAge) {
            filters.ageRange = { min: parseInt(minAge), max: parseInt(maxAge) };
          }
          lastVisitFrom = searchParams.get("lastVisitFrom");
          lastVisitTo = searchParams.get("lastVisitTo");
          if (lastVisitFrom && lastVisitTo) {
            filters.lastVisit = {
              from: new Date(lastVisitFrom),
              to: new Date(lastVisitTo),
            };
          }
          tags = searchParams.get("tags");
          if (tags) {
            filters.tags = tags.split(",").map(function (tag) {
              return tag.trim();
            });
          }
          return [
            4 /*yield*/,
            (0, system_integration_manager_1.createsystemIntegrationManager)().searchPatients(
              query,
              filters,
              user.id,
              limit,
            ),
          ];
        case 4:
          searchResults = _b.sent();
          // Log search activity
          return [
            4 /*yield*/,
            auditLogger.log({
              action: "advanced_patient_search",
              userId: user.id,
              details: {
                query: query,
                filters: filters,
                resultCount: searchResults.patients.length,
                searchTime: searchResults.searchTime,
              },
              timestamp: new Date(),
            }),
          ];
        case 5:
          // Log search activity
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                patients: searchResults.patients,
                suggestions: searchResults.suggestions,
                totalCount: searchResults.totalCount,
                searchTime: searchResults.searchTime,
                query: query,
                filters: filters,
              },
            }),
          ];
        case 6:
          error_1 = _b.sent();
          console.error("Error in advanced patient search:", error_1);
          return [
            4 /*yield*/,
            auditLogger.log({
              action: "advanced_patient_search_error",
              userId: "system",
              details: { error: error_1 instanceof Error ? error_1.message : "Unknown error" },
              timestamp: new Date(),
            }),
          ];
        case 7:
          _b.sent();
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
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Create Patient Segment API
 * POST /api/patients/integration/search
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      body,
      name_1,
      description,
      criteria,
      segment,
      error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, , 9]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _b.sent().data;
          if (!profile || !["admin", "manager"].includes(profile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Acesso negado: apenas administradores e gerentes podem criar segmentos" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          (name_1 = body.name), (description = body.description), (criteria = body.criteria);
          // Validate required fields
          if (!name_1 || !description || !criteria) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Campos obrigatórios: name, description, criteria" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            (0, system_integration_manager_1.createsystemIntegrationManager)().createPatientSegment(
              name_1,
              description,
              criteria,
              user.id,
            ),
          ];
        case 5:
          segment = _b.sent();
          // Log segment creation
          return [
            4 /*yield*/,
            auditLogger.log({
              action: "patient_segment_created",
              userId: user.id,
              details: {
                segmentId: segment.id,
                name: segment.name,
                patientCount: segment.patientCount,
              },
              timestamp: new Date(),
            }),
          ];
        case 6:
          // Log segment creation
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: segment,
            }),
          ];
        case 7:
          error_2 = _b.sent();
          console.error("Error creating patient segment:", error_2);
          return [
            4 /*yield*/,
            auditLogger.log({
              action: "patient_segment_creation_error",
              userId: "system",
              details: { error: error_2 instanceof Error ? error_2.message : "Unknown error" },
              timestamp: new Date(),
            }),
          ];
        case 8:
          _b.sent();
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
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
