"use strict";
// Brazilian Tax Declarations API
// Story 5.5: API for DEFIS, ECF, DMED and other fiscal declarations
// Author: VoidBeast V6.0 Master Orchestrator
// Date: 2025-01-30
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
// Validation schemas
var declarationGenerationSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid(),
  declaration_type: zod_1.z.enum(["DEFIS", "ECF", "DMED", "DIPJ"]),
  period: zod_1.z.object({
    year: zod_1.z.number().int().min(2020).max(2030),
    month: zod_1.z.number().int().min(1).max(12).optional(),
  }),
  auto_submit: zod_1.z.boolean().default(false),
  test_mode: zod_1.z.boolean().default(false),
});
var declarationValidationSchema = zod_1.z.object({
  declaration_id: zod_1.z.string().uuid(),
  validate_data: zod_1.z.boolean().default(true),
  check_compliance: zod_1.z.boolean().default(true),
});
/**
 * GET /api/tax/declarations - Get declarations and status
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, searchParams, clinicId, action, _a, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 15, , 16]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          action = searchParams.get("action");
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "clinic_id parameter is required" },
                { status: 400 },
              ),
            ];
          }
          _a = action;
          switch (_a) {
            case "list":
              return [3 /*break*/, 2];
            case "status":
              return [3 /*break*/, 4];
            case "download":
              return [3 /*break*/, 6];
            case "calendar":
              return [3 /*break*/, 8];
            case "compliance":
              return [3 /*break*/, 10];
          }
          return [3 /*break*/, 12];
        case 2:
          return [4 /*yield*/, listDeclarations(supabase, clinicId, searchParams)];
        case 3:
          return [2 /*return*/, _b.sent()];
        case 4:
          return [4 /*yield*/, getDeclarationStatus(supabase, searchParams)];
        case 5:
          return [2 /*return*/, _b.sent()];
        case 6:
          return [4 /*yield*/, downloadDeclaration(supabase, searchParams)];
        case 7:
          return [2 /*return*/, _b.sent()];
        case 8:
          return [4 /*yield*/, getDeclarationCalendar(supabase, clinicId)];
        case 9:
          return [2 /*return*/, _b.sent()];
        case 10:
          return [4 /*yield*/, getComplianceStatus(supabase, clinicId)];
        case 11:
          return [2 /*return*/, _b.sent()];
        case 12:
          return [4 /*yield*/, getDeclarationsOverview(supabase, clinicId)];
        case 13:
          return [2 /*return*/, _b.sent()];
        case 14:
          return [3 /*break*/, 16];
        case 15:
          error_1 = _b.sent();
          console.error("Declarations API GET error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/tax/declarations - Generate and manage declarations
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, body, action, _a, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 13, , 14]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, request.json()];
        case 2:
          body = _b.sent();
          action = body.action;
          _a = action;
          switch (_a) {
            case "generate":
              return [3 /*break*/, 3];
            case "validate":
              return [3 /*break*/, 5];
            case "submit":
              return [3 /*break*/, 7];
            case "schedule":
              return [3 /*break*/, 9];
          }
          return [3 /*break*/, 11];
        case 3:
          return [4 /*yield*/, generateDeclaration(supabase, body)];
        case 4:
          return [2 /*return*/, _b.sent()];
        case 5:
          return [4 /*yield*/, validateDeclaration(supabase, body)];
        case 6:
          return [2 /*return*/, _b.sent()];
        case 7:
          return [4 /*yield*/, submitDeclaration(supabase, body)];
        case 8:
          return [2 /*return*/, _b.sent()];
        case 9:
          return [4 /*yield*/, scheduleDeclaration(supabase, body)];
        case 10:
          return [2 /*return*/, _b.sent()];
        case 11:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action specified" }, { status: 400 }),
          ];
        case 12:
          return [3 /*break*/, 14];
        case 13:
          error_2 = _b.sent();
          console.error("Declarations API POST error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 14:
          return [2 /*return*/];
      }
    });
  });
}
// Helper functions
function listDeclarations(supabase, clinicId, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var query, type, year, status, limit, offset, _a, data, error, count;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          query = supabase.from("tax_declarations").select("*").eq("clinic_id", clinicId);
          type = searchParams.get("type");
          if (type) {
            query = query.eq("declaration_type", type);
          }
          year = searchParams.get("year");
          if (year) {
            query = query.eq("period_year", parseInt(year));
          }
          status = searchParams.get("status");
          if (status) {
            query = query.eq("status", status);
          }
          limit = parseInt(searchParams.get("limit") || "50");
          offset = parseInt(searchParams.get("offset") || "0");
          query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch declarations" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: data,
              pagination: {
                total: count,
                limit: limit,
                offset: offset,
                has_more: count > offset + limit,
              },
            }),
          ];
      }
    });
  });
}
function getDeclarationStatus(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var declarationId,
      _a,
      data,
      error,
      TaxDeclarationService,
      declarationService,
      updatedStatus,
      error_3;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          declarationId = searchParams.get("declaration_id");
          if (!declarationId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "declaration_id parameter is required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("tax_declarations").select("*").eq("id", declarationId).single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error || !data) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Declaration not found" }, { status: 404 }),
            ];
          }
          if (!(data.status === "submitted" && data.protocol_number)) return [3 /*break*/, 8];
          _b.label = 2;
        case 2:
          _b.trys.push([2, 7, , 8]);
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("@/lib/services/tax/tax-declarations");
            }),
          ];
        case 3:
          TaxDeclarationService = _b.sent().TaxDeclarationService;
          declarationService = new TaxDeclarationService();
          return [
            4 /*yield*/,
            declarationService.checkSubmissionStatus(data.declaration_type, data.protocol_number),
          ];
        case 4:
          updatedStatus = _b.sent();
          if (!(updatedStatus.status !== data.status)) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .update({
                status: updatedStatus.status,
                processing_result: updatedStatus.result,
                updated_at: new Date().toISOString(),
              })
              .eq("id", declarationId),
          ];
        case 5:
          _b.sent();
          data.status = updatedStatus.status;
          data.processing_result = updatedStatus.result;
          _b.label = 6;
        case 6:
          return [3 /*break*/, 8];
        case 7:
          error_3 = _b.sent();
          console.error("Declaration status check error:", error_3);
          return [3 /*break*/, 8];
        case 8:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: __assign(__assign({}, data), { last_checked: new Date().toISOString() }),
            }),
          ];
      }
    });
  });
}
function downloadDeclaration(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var declarationId,
      format,
      _a,
      declaration,
      error,
      TaxDeclarationService,
      declarationService,
      fileData,
      headers,
      error_4;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          declarationId = searchParams.get("declaration_id");
          format = searchParams.get("format") || "pdf";
          if (!declarationId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "declaration_id parameter is required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("tax_declarations").select("*").eq("id", declarationId).single(),
          ];
        case 1:
          (_a = _b.sent()), (declaration = _a.data), (error = _a.error);
          if (error || !declaration) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Declaration not found" }, { status: 404 }),
            ];
          }
          _b.label = 2;
        case 2:
          _b.trys.push([2, 5, , 6]);
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("@/lib/services/tax/tax-declarations");
            }),
          ];
        case 3:
          TaxDeclarationService = _b.sent().TaxDeclarationService;
          declarationService = new TaxDeclarationService();
          return [4 /*yield*/, declarationService.exportDeclaration(declarationId, format)];
        case 4:
          fileData = _b.sent();
          headers = new Headers();
          headers.set("Content-Type", format === "pdf" ? "application/pdf" : "application/xml");
          headers.set(
            "Content-Disposition",
            'attachment; filename="'
              .concat(declaration.declaration_type, "_")
              .concat(declaration.period_year, ".")
              .concat(format, '"'),
          );
          return [2 /*return*/, new server_1.NextResponse(fileData, { headers: headers })];
        case 5:
          error_4 = _b.sent();
          console.error("Declaration download error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to download declaration" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function getDeclarationCalendar(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var currentYear, config, TaxDeclarationService, declarationService, calendar, error_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          currentYear = new Date().getFullYear();
          return [
            4 /*yield*/,
            supabase
              .from("tax_configuration")
              .select("*")
              .eq("clinic_id", clinicId)
              .eq("active", true)
              .single(),
          ];
        case 1:
          config = _a.sent().data;
          if (!config) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Tax configuration not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("@/lib/services/tax/tax-declarations");
            }),
          ];
        case 2:
          TaxDeclarationService = _a.sent().TaxDeclarationService;
          declarationService = new TaxDeclarationService();
          _a.label = 3;
        case 3:
          _a.trys.push([3, 5, , 6]);
          return [
            4 /*yield*/,
            declarationService.generateDeclarationCalendar(config.tax_regime, currentYear),
          ];
        case 4:
          calendar = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                year: currentYear,
                tax_regime: config.tax_regime,
                calendar: calendar,
                generated_at: new Date().toISOString(),
              },
            }),
          ];
        case 5:
          error_5 = _a.sent();
          console.error("Declaration calendar error:", error_5);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to generate declaration calendar" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function getComplianceStatus(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var currentYear,
      declarations,
      config,
      TaxDeclarationService,
      declarationService,
      compliance,
      error_6;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          currentYear = new Date().getFullYear();
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .select("*")
              .eq("clinic_id", clinicId)
              .eq("period_year", currentYear),
          ];
        case 1:
          declarations = _a.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("tax_configuration")
              .select("*")
              .eq("clinic_id", clinicId)
              .eq("active", true)
              .single(),
          ];
        case 2:
          config = _a.sent().data;
          if (!config) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Tax configuration not found" }, { status: 404 }),
            ];
          }
          _a.label = 3;
        case 3:
          _a.trys.push([3, 6, , 7]);
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("@/lib/services/tax/tax-declarations");
            }),
          ];
        case 4:
          TaxDeclarationService = _a.sent().TaxDeclarationService;
          declarationService = new TaxDeclarationService();
          return [
            4 /*yield*/,
            declarationService.assessCompliance(clinicId, config.tax_regime, currentYear),
          ];
        case 5:
          compliance = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                clinic_id: clinicId,
                year: currentYear,
                tax_regime: config.tax_regime,
                compliance_status: compliance.status,
                compliance_score: compliance.score,
                required_declarations: compliance.required,
                submitted_declarations: compliance.submitted,
                pending_declarations: compliance.pending,
                overdue_declarations: compliance.overdue,
                recommendations: compliance.recommendations,
                assessed_at: new Date().toISOString(),
              },
            }),
          ];
        case 6:
          error_6 = _a.sent();
          console.error("Compliance assessment error:", error_6);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to assess compliance" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function getDeclarationsOverview(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var currentYear, stats, summary;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          currentYear = new Date().getFullYear();
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .select("declaration_type, status, created_at")
              .eq("clinic_id", clinicId)
              .gte("created_at", "".concat(currentYear, "-01-01")),
          ];
        case 1:
          stats = _a.sent().data;
          summary = {
            total_declarations: (stats === null || stats === void 0 ? void 0 : stats.length) || 0,
            by_type:
              (stats === null || stats === void 0
                ? void 0
                : stats.reduce(function (acc, decl) {
                    acc[decl.declaration_type] = (acc[decl.declaration_type] || 0) + 1;
                    return acc;
                  }, {})) || {},
            by_status:
              (stats === null || stats === void 0
                ? void 0
                : stats.reduce(function (acc, decl) {
                    acc[decl.status] = (acc[decl.status] || 0) + 1;
                    return acc;
                  }, {})) || {},
            year: currentYear,
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                summary: summary,
                recent_declarations:
                  (stats === null || stats === void 0 ? void 0 : stats.slice(0, 10)) || [],
              },
            }),
          ];
      }
    });
  });
}
function generateDeclaration(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData,
      TaxDeclarationService,
      declarationService,
      declaration,
      _a,
      data,
      error,
      submission,
      submissionError_1,
      error_7;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          validatedData = declarationGenerationSchema.parse(body);
          _b.label = 1;
        case 1:
          _b.trys.push([1, 10, , 11]);
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("@/lib/services/tax/tax-declarations");
            }),
          ];
        case 2:
          TaxDeclarationService = _b.sent().TaxDeclarationService;
          declarationService = new TaxDeclarationService();
          return [
            4 /*yield*/,
            declarationService.generateDeclaration({
              clinic_id: validatedData.clinic_id,
              declaration_type: validatedData.declaration_type,
              period: validatedData.period,
              test_mode: validatedData.test_mode,
            }),
          ];
        case 3:
          declaration = _b.sent();
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .insert({
                clinic_id: validatedData.clinic_id,
                declaration_type: validatedData.declaration_type,
                period_year: validatedData.period.year,
                period_month: validatedData.period.month,
                status: "generated",
                declaration_data: declaration.data,
                file_path: declaration.file_path,
                test_mode: validatedData.test_mode,
                created_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 4:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to store declaration" }, { status: 500 }),
            ];
          }
          if (!(validatedData.auto_submit && !validatedData.test_mode)) return [3 /*break*/, 9];
          _b.label = 5;
        case 5:
          _b.trys.push([5, 8, , 9]);
          return [4 /*yield*/, declarationService.submitDeclaration(data.id)];
        case 6:
          submission = _b.sent();
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .update({
                status: "submitted",
                protocol_number: submission.protocol,
                submitted_at: new Date().toISOString(),
              })
              .eq("id", data.id),
          ];
        case 7:
          _b.sent();
          data.status = "submitted";
          data.protocol_number = submission.protocol;
          return [3 /*break*/, 9];
        case 8:
          submissionError_1 = _b.sent();
          console.error("Auto-submission failed:", submissionError_1);
          return [3 /*break*/, 9];
        case 9:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                declaration_id: data.id,
                declaration_type: data.declaration_type,
                period: {
                  year: data.period_year,
                  month: data.period_month,
                },
                status: data.status,
                file_path: data.file_path,
                protocol_number: data.protocol_number,
                generated_at: data.created_at,
              },
            }),
          ];
        case 10:
          error_7 = _b.sent();
          console.error("Declaration generation error:", error_7);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Declaration generation failed", details: error_7.message },
              { status: 500 },
            ),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
function validateDeclaration(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData,
      _a,
      declaration,
      error,
      TaxDeclarationService,
      declarationService,
      validation,
      error_8;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          validatedData = declarationValidationSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .select("*")
              .eq("id", validatedData.declaration_id)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (declaration = _a.data), (error = _a.error);
          if (error || !declaration) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Declaration not found" }, { status: 404 }),
            ];
          }
          _b.label = 2;
        case 2:
          _b.trys.push([2, 6, , 7]);
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("@/lib/services/tax/tax-declarations");
            }),
          ];
        case 3:
          TaxDeclarationService = _b.sent().TaxDeclarationService;
          declarationService = new TaxDeclarationService();
          return [
            4 /*yield*/,
            declarationService.validateDeclaration(validatedData.declaration_id, {
              validate_data: validatedData.validate_data,
              check_compliance: validatedData.check_compliance,
            }),
          ];
        case 4:
          validation = _b.sent();
          // Update declaration status
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .update({
                validation_status: validation.valid ? "valid" : "invalid",
                validation_errors: validation.errors,
                validation_warnings: validation.warnings,
                validated_at: new Date().toISOString(),
              })
              .eq("id", validatedData.declaration_id),
          ];
        case 5:
          // Update declaration status
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                declaration_id: validatedData.declaration_id,
                valid: validation.valid,
                errors: validation.errors || [],
                warnings: validation.warnings || [],
                compliance_score: validation.compliance_score,
                validated_at: new Date().toISOString(),
              },
            }),
          ];
        case 6:
          error_8 = _b.sent();
          console.error("Declaration validation error:", error_8);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Declaration validation failed", details: error_8.message },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function submitDeclaration(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var declaration_id,
      _a,
      force_submit,
      _b,
      declaration,
      error,
      TaxDeclarationService,
      declarationService,
      submission,
      error_9;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          (declaration_id = body.declaration_id),
            (_a = body.force_submit),
            (force_submit = _a === void 0 ? false : _a);
          if (!declaration_id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "declaration_id is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("tax_declarations").select("*").eq("id", declaration_id).single(),
          ];
        case 1:
          (_b = _c.sent()), (declaration = _b.data), (error = _b.error);
          if (error || !declaration) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Declaration not found" }, { status: 404 }),
            ];
          }
          if (declaration.status === "submitted" && !force_submit) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Declaration already submitted" },
                { status: 400 },
              ),
            ];
          }
          _c.label = 2;
        case 2:
          _c.trys.push([2, 6, , 8]);
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("@/lib/services/tax/tax-declarations");
            }),
          ];
        case 3:
          TaxDeclarationService = _c.sent().TaxDeclarationService;
          declarationService = new TaxDeclarationService();
          return [4 /*yield*/, declarationService.submitDeclaration(declaration_id)];
        case 4:
          submission = _c.sent();
          // Update declaration status
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .update({
                status: "submitted",
                protocol_number: submission.protocol,
                submitted_at: new Date().toISOString(),
                submission_result: submission.result,
              })
              .eq("id", declaration_id),
          ];
        case 5:
          // Update declaration status
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                declaration_id: declaration_id,
                status: "submitted",
                protocol_number: submission.protocol,
                submission_result: submission.result,
                submitted_at: new Date().toISOString(),
              },
            }),
          ];
        case 6:
          error_9 = _c.sent();
          console.error("Declaration submission error:", error_9);
          // Update status to error
          return [
            4 /*yield*/,
            supabase
              .from("tax_declarations")
              .update({
                status: "error",
                error_message: error_9.message,
                updated_at: new Date().toISOString(),
              })
              .eq("id", declaration_id),
          ];
        case 7:
          // Update status to error
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Declaration submission failed", details: error_9.message },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
function scheduleDeclaration(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var clinic_id, declaration_type, period, schedule_date, _a, data, error, error_10;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          (clinic_id = body.clinic_id),
            (declaration_type = body.declaration_type),
            (period = body.period),
            (schedule_date = body.schedule_date);
          if (!clinic_id || !declaration_type || !period || !schedule_date) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "clinic_id, declaration_type, period, and schedule_date are required" },
                { status: 400 },
              ),
            ];
          }
          _b.label = 1;
        case 1:
          _b.trys.push([1, 3, , 4]);
          return [
            4 /*yield*/,
            supabase
              .from("scheduled_declarations")
              .insert({
                clinic_id: clinic_id,
                declaration_type: declaration_type,
                period_year: period.year,
                period_month: period.month,
                scheduled_date: schedule_date,
                status: "scheduled",
                created_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 2:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to schedule declaration" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                schedule_id: data.id,
                clinic_id: clinic_id,
                declaration_type: declaration_type,
                period: period,
                scheduled_date: schedule_date,
                status: "scheduled",
                created_at: data.created_at,
              },
            }),
          ];
        case 3:
          error_10 = _b.sent();
          console.error("Declaration scheduling error:", error_10);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Declaration scheduling failed", details: error_10.message },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
