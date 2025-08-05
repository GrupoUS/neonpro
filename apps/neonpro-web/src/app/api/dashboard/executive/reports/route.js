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
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var report_system_1 = require("@/lib/dashboard/executive/report-system");
// Schema for report generation request
var GenerateReportSchema = zod_1.z.object({
  templateId: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1, "Nome Ã© obrigatÃ³rio"),
  format: zod_1.z.enum(["pdf", "excel", "csv", "json"]).default("pdf"),
  parameters: zod_1.z.object({
    dateRange: zod_1.z.object({
      start: zod_1.z.string().datetime(),
      end: zod_1.z.string().datetime(),
    }),
    departments: zod_1.z.array(zod_1.z.string()).optional(),
    services: zod_1.z.array(zod_1.z.string()).optional(),
    includeCharts: zod_1.z.boolean().default(true),
    includeTables: zod_1.z.boolean().default(true),
    includeKPIs: zod_1.z.boolean().default(true),
  }),
});
// Schema for report template creation
var CreateTemplateSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome Ã© obrigatÃ³rio"),
  description: zod_1.z.string().optional(),
  type: zod_1.z.enum([
    "executive_summary",
    "financial_report",
    "operational_report",
    "patient_analytics",
    "staff_performance",
    "custom_report",
  ]),
  configuration: zod_1.z.object({
    sections: zod_1.z.array(
      zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        type: zod_1.z.enum(["kpi_summary", "chart", "table", "text"]),
        dataSource: zod_1.z.string(),
        config: zod_1.z.record(zod_1.z.any()).optional(),
      }),
    ),
    layout: zod_1.z.object({
      orientation: zod_1.z.enum(["portrait", "landscape"]).default("portrait"),
      pageSize: zod_1.z.enum(["A4", "A3", "Letter"]).default("A4"),
      margins: zod_1.z.object({
        top: zod_1.z.number(),
        right: zod_1.z.number(),
        bottom: zod_1.z.number(),
        left: zod_1.z.number(),
      }),
      header: zod_1.z
        .object({
          enabled: zod_1.z.boolean(),
          content: zod_1.z.string(),
          height: zod_1.z.number(),
        })
        .optional(),
      footer: zod_1.z
        .object({
          enabled: zod_1.z.boolean(),
          content: zod_1.z.string(),
          height: zod_1.z.number(),
        })
        .optional(),
    }),
    filters: zod_1.z
      .object({
        dateRange: zod_1.z
          .object({
            enabled: zod_1.z.boolean(),
            defaultPeriod: zod_1.z.string(),
          })
          .optional(),
        departments: zod_1.z
          .object({
            enabled: zod_1.z.boolean(),
            defaultSelection: zod_1.z.array(zod_1.z.string()).optional(),
          })
          .optional(),
        services: zod_1.z
          .object({
            enabled: zod_1.z.boolean(),
            defaultSelection: zod_1.z.array(zod_1.z.string()).optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});
// GET /api/dashboard/executive/reports
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      clinicUser,
      searchParams,
      type,
      status_1,
      limit,
      offset,
      reportSystem,
      templates,
      schedules,
      filters,
      instances,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 10, , 11]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 3:
          clinicUser = _b.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "UsuÃ¡rio nÃ£o associado a uma clÃ­nica" },
                { status: 403 },
              ),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          type = searchParams.get("type");
          status_1 = searchParams.get("status");
          limit = parseInt(searchParams.get("limit") || "50");
          offset = parseInt(searchParams.get("offset") || "0");
          reportSystem = new report_system_1.ReportSystem(supabase, clinicUser.clinic_id);
          if (!(type === "templates")) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            reportSystem.getTemplates({
              isActive: status_1 !== "inactive",
            }),
          ];
        case 4:
          templates = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ templates: templates })];
        case 5:
          if (!(type === "schedules")) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            reportSystem.getSchedules({
              isActive: status_1 !== "inactive",
            }),
          ];
        case 6:
          schedules = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ schedules: schedules })];
        case 7:
          filters = {};
          if (status_1) filters.status = status_1;
          return [4 /*yield*/, reportSystem.getReportInstances(filters, limit, offset)];
        case 8:
          instances = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ instances: instances })];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_1 = _b.sent();
          console.error("Error fetching reports:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/dashboard/executive/reports
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      clinicUser,
      searchParams,
      action,
      reportSystem,
      body,
      validatedData,
      reportInstance,
      body,
      validatedData,
      template,
      error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 10, , 11]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 3:
          clinicUser = _b.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "UsuÃ¡rio nÃ£o associado a uma clÃ­nica" },
                { status: 403 },
              ),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          action = searchParams.get("action");
          reportSystem = new report_system_1.ReportSystem(supabase, clinicUser.clinic_id);
          if (!(action === "generate")) return [3 /*break*/, 6];
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          validatedData = GenerateReportSchema.parse(body);
          return [
            4 /*yield*/,
            reportSystem.generateReport(validatedData.templateId, {
              name: validatedData.name,
              format: validatedData.format,
              parameters: validatedData.parameters,
              generatedBy: user.id,
            }),
          ];
        case 5:
          reportInstance = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ reportInstance: reportInstance }, { status: 201 }),
          ];
        case 6:
          return [4 /*yield*/, request.json()];
        case 7:
          body = _b.sent();
          validatedData = CreateTemplateSchema.parse(body);
          return [4 /*yield*/, reportSystem.createTemplate(validatedData)];
        case 8:
          template = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ template: template }, { status: 201 }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_2 = _b.sent();
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Dados invÃ¡lidos", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          console.error("Error processing report request:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
