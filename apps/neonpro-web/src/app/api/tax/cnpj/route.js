// CNPJ Validation & Consultation API
// Story 5.5: Specialized API for CNPJ operations with Brasil API integration
// Author: VoidBeast V6.0 Master Orchestrator
// Date: 2025-01-30
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Validation schemas
var cnpjValidationSchema = zod_1.z.object({
  cnpj: zod_1.z.string().min(11).max(18),
  validate_status: zod_1.z.boolean().default(true),
  get_company_data: zod_1.z.boolean().default(true),
  store_result: zod_1.z.boolean().default(true),
});
var cnpjBatchSchema = zod_1.z.object({
  cnpjs: zod_1.z.array(zod_1.z.string()).min(1).max(100),
  validate_status: zod_1.z.boolean().default(true),
  get_company_data: zod_1.z.boolean().default(false),
});
var cnpjSearchSchema = zod_1.z.object({
  company_name: zod_1.z.string().min(3).optional(),
  activity_code: zod_1.z.string().optional(),
  city: zod_1.z.string().optional(),
  state: zod_1.z.string().optional(),
  status: zod_1.z.enum(["ativa", "inapta", "suspensa", "nula", "baixada"]).optional(),
});
/**
 * GET /api/tax/cnpj - CNPJ consultation and search
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, searchParams, action, _a, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 12, , 13]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          searchParams = new URL(request.url).searchParams;
          action = searchParams.get("action");
          _a = action;
          switch (_a) {
            case "validate":
              return [3 /*break*/, 2];
            case "search":
              return [3 /*break*/, 4];
            case "history":
              return [3 /*break*/, 6];
            case "status":
              return [3 /*break*/, 8];
          }
          return [3 /*break*/, 10];
        case 2:
          return [4 /*yield*/, validateSingleCNPJ(supabase, searchParams)];
        case 3:
          return [2 /*return*/, _b.sent()];
        case 4:
          return [4 /*yield*/, searchCompanies(supabase, searchParams)];
        case 5:
          return [2 /*return*/, _b.sent()];
        case 6:
          return [4 /*yield*/, getValidationHistory(supabase, searchParams)];
        case 7:
          return [2 /*return*/, _b.sent()];
        case 8:
          return [4 /*yield*/, getCNPJStatus(supabase, searchParams)];
        case 9:
          return [2 /*return*/, _b.sent()];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Action parameter is required" }, { status: 400 }),
          ];
        case 11:
          return [3 /*break*/, 13];
        case 12:
          error_1 = _b.sent();
          console.error("CNPJ API GET error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/tax/cnpj - CNPJ validation and batch operations
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, body, action, _a, error_2;
    return __generator(this, (_b) => {
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
            case "validate":
              return [3 /*break*/, 3];
            case "batch-validate":
              return [3 /*break*/, 5];
            case "search":
              return [3 /*break*/, 7];
            case "update-status":
              return [3 /*break*/, 9];
          }
          return [3 /*break*/, 11];
        case 3:
          return [4 /*yield*/, validateCNPJ(supabase, body)];
        case 4:
          return [2 /*return*/, _b.sent()];
        case 5:
          return [4 /*yield*/, batchValidateCNPJ(supabase, body)];
        case 6:
          return [2 /*return*/, _b.sent()];
        case 7:
          return [4 /*yield*/, searchCompaniesByData(supabase, body)];
        case 8:
          return [2 /*return*/, _b.sent()];
        case 9:
          return [4 /*yield*/, updateCNPJStatus(supabase, body)];
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
          console.error("CNPJ API POST error:", error_2);
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
function validateSingleCNPJ(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var cnpj, CNPJValidator, validator, validation, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          cnpj = searchParams.get("cnpj");
          if (!cnpj) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "cnpj parameter is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/brazilian-tax/cnpj-validator")),
          ];
        case 1:
          CNPJValidator = _a.sent().CNPJValidator;
          validator = new CNPJValidator();
          _a.label = 2;
        case 2:
          _a.trys.push([2, 6, , 7]);
          return [4 /*yield*/, validator.validateCNPJ(cnpj)];
        case 3:
          validation = _a.sent();
          if (!(validation.valid && validation.companyData)) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase.from("cnpj_validations").upsert({
              cnpj: validation.formatted,
              company_data: validation.companyData,
              validation_date: new Date().toISOString(),
              status: "valid",
              source: "api_validation",
            }),
          ];
        case 4:
          _a.sent();
          _a.label = 5;
        case 5:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                cnpj: validation.formatted,
                valid: validation.valid,
                company_data: validation.companyData,
                validation_errors: validation.errors || [],
                validated_at: new Date().toISOString(),
              },
            }),
          ];
        case 6:
          error_3 = _a.sent();
          console.error("CNPJ validation error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "CNPJ validation failed", details: error_3.message },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function searchCompanies(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var companyName,
      activityCode,
      city,
      state,
      status,
      CNPJConsultationService,
      consultationService,
      searchParams_1,
      results,
      error_4;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          companyName = searchParams.get("company_name");
          activityCode = searchParams.get("activity_code");
          city = searchParams.get("city");
          state = searchParams.get("state");
          status = searchParams.get("status");
          if (!companyName && !activityCode && !city) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "At least one search parameter is required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/brazilian-tax/cnpj-consultation")),
          ];
        case 1:
          CNPJConsultationService = _a.sent().CNPJConsultationService;
          consultationService = new CNPJConsultationService();
          _a.label = 2;
        case 2:
          _a.trys.push([2, 4, , 5]);
          searchParams_1 = {
            razao_social: companyName,
            codigo_atividade: activityCode,
            municipio: city,
            uf: state,
            situacao: status,
          };
          return [4 /*yield*/, consultationService.searchCompanies(searchParams_1)];
        case 3:
          results = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                results: results,
                total_found: results.length,
                search_parameters: searchParams_1,
                searched_at: new Date().toISOString(),
              },
            }),
          ];
        case 4:
          error_4 = _a.sent();
          console.error("Company search error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Company search failed", details: error_4.message },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function getValidationHistory(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var cnpj, limit, offset, query, _a, data, error, count;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          cnpj = searchParams.get("cnpj");
          limit = parseInt(searchParams.get("limit") || "50");
          offset = parseInt(searchParams.get("offset") || "0");
          query = supabase
            .from("cnpj_validations")
            .select("*")
            .order("validation_date", { ascending: false })
            .range(offset, offset + limit - 1);
          if (cnpj) {
            query = query.eq("cnpj", cnpj);
          }
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch validation history" },
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
function getCNPJStatus(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var cnpj,
      _a,
      latestValidation,
      error,
      validationAge,
      isRecent,
      currentStatus,
      CNPJValidator,
      validator,
      updatedValidation,
      updated,
      error_5;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          cnpj = searchParams.get("cnpj");
          if (!cnpj) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "cnpj parameter is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("cnpj_validations")
              .select("*")
              .eq("cnpj", cnpj)
              .order("validation_date", { ascending: false })
              .limit(1)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (latestValidation = _a.data), (error = _a.error);
          if (error || !latestValidation) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "CNPJ validation not found" }, { status: 404 }),
            ];
          }
          validationAge = Date.now() - new Date(latestValidation.validation_date).getTime();
          isRecent = validationAge < 24 * 60 * 60 * 1000;
          currentStatus = latestValidation;
          if (isRecent) return [3 /*break*/, 8];
          _b.label = 2;
        case 2:
          _b.trys.push([2, 7, , 8]);
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/brazilian-tax/cnpj-validator")),
          ];
        case 3:
          CNPJValidator = _b.sent().CNPJValidator;
          validator = new CNPJValidator();
          return [4 /*yield*/, validator.validateCNPJ(cnpj)];
        case 4:
          updatedValidation = _b.sent();
          if (!(updatedValidation.valid && updatedValidation.companyData)) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("cnpj_validations")
              .upsert({
                cnpj: updatedValidation.formatted,
                company_data: updatedValidation.companyData,
                validation_date: new Date().toISOString(),
                status: "valid",
                source: "status_check",
              })
              .select()
              .single(),
          ];
        case 5:
          updated = _b.sent().data;
          currentStatus = updated;
          _b.label = 6;
        case 6:
          return [3 /*break*/, 8];
        case 7:
          error_5 = _b.sent();
          console.error("CNPJ status update error:", error_5);
          return [3 /*break*/, 8];
        case 8:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                cnpj: cnpj,
                status: currentStatus.status,
                company_data: currentStatus.company_data,
                last_validated: currentStatus.validation_date,
                is_recent: isRecent,
                validation_age_hours: Math.floor(validationAge / (1000 * 60 * 60)),
              },
            }),
          ];
      }
    });
  });
}
function validateCNPJ(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData, CNPJValidator, validator, validation, error_6;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          validatedData = cnpjValidationSchema.parse(body);
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/brazilian-tax/cnpj-validator")),
          ];
        case 1:
          CNPJValidator = _a.sent().CNPJValidator;
          validator = new CNPJValidator();
          _a.label = 2;
        case 2:
          _a.trys.push([2, 6, , 7]);
          return [4 /*yield*/, validator.validateCNPJ(validatedData.cnpj)];
        case 3:
          validation = _a.sent();
          if (!(validatedData.store_result && validation.valid && validation.companyData))
            return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase.from("cnpj_validations").upsert({
              cnpj: validation.formatted,
              company_data: validation.companyData,
              validation_date: new Date().toISOString(),
              status: validation.valid ? "valid" : "invalid",
              source: "api_post_validation",
            }),
          ];
        case 4:
          _a.sent();
          _a.label = 5;
        case 5:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                cnpj: validation.formatted,
                valid: validation.valid,
                company_data: validatedData.get_company_data ? validation.companyData : undefined,
                validation_errors: validation.errors || [],
                validated_at: new Date().toISOString(),
              },
            }),
          ];
        case 6:
          error_6 = _a.sent();
          console.error("CNPJ validation error:", error_6);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "CNPJ validation failed", details: error_6.message },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function batchValidateCNPJ(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData,
      CNPJValidator,
      validator,
      results,
      validationPromises,
      results_1,
      summary,
      error_7;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          validatedData = cnpjBatchSchema.parse(body);
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/brazilian-tax/cnpj-validator")),
          ];
        case 1:
          CNPJValidator = _a.sent().CNPJValidator;
          validator = new CNPJValidator();
          results = [];
          validationPromises = validatedData.cnpjs.map((cnpj) =>
            __awaiter(this, void 0, void 0, function () {
              var validation, error_8;
              return __generator(this, (_a) => {
                switch (_a.label) {
                  case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, validator.validateCNPJ(cnpj)];
                  case 1:
                    validation = _a.sent();
                    if (!(validation.valid && validation.companyData)) return [3 /*break*/, 3];
                    return [
                      4 /*yield*/,
                      supabase.from("cnpj_validations").upsert({
                        cnpj: validation.formatted,
                        company_data: validatedData.get_company_data
                          ? validation.companyData
                          : null,
                        validation_date: new Date().toISOString(),
                        status: "valid",
                        source: "batch_validation",
                      }),
                    ];
                  case 2:
                    _a.sent();
                    _a.label = 3;
                  case 3:
                    return [
                      2 /*return*/,
                      {
                        cnpj: validation.formatted,
                        valid: validation.valid,
                        company_data: validatedData.get_company_data
                          ? validation.companyData
                          : undefined,
                        errors: validation.errors || [],
                      },
                    ];
                  case 4:
                    error_8 = _a.sent();
                    console.error("Batch CNPJ validation error for ".concat(cnpj, ":"), error_8);
                    return [
                      2 /*return*/,
                      {
                        cnpj: cnpj,
                        valid: false,
                        errors: [error_8.message],
                      },
                    ];
                  case 5:
                    return [2 /*return*/];
                }
              });
            }),
          );
          _a.label = 2;
        case 2:
          _a.trys.push([2, 4, , 5]);
          return [4 /*yield*/, Promise.all(validationPromises)];
        case 3:
          results_1 = _a.sent();
          summary = {
            total_processed: validatedData.cnpjs.length,
            valid_count: results_1.filter((r) => r.valid).length,
            invalid_count: results_1.filter((r) => !r.valid).length,
            processed_at: new Date().toISOString(),
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                batch_id: crypto.randomUUID(),
                summary: summary,
                results: results_1,
              },
            }),
          ];
        case 4:
          error_7 = _a.sent();
          console.error("Batch CNPJ validation error:", error_7);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Batch validation failed", details: error_7.message },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function searchCompaniesByData(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData, CNPJConsultationService, consultationService, results, searchRecord, error_9;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          validatedData = cnpjSearchSchema.parse(body);
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/brazilian-tax/cnpj-consultation")),
          ];
        case 1:
          CNPJConsultationService = _a.sent().CNPJConsultationService;
          consultationService = new CNPJConsultationService();
          _a.label = 2;
        case 2:
          _a.trys.push([2, 5, , 6]);
          return [
            4 /*yield*/,
            consultationService.searchCompanies({
              razao_social: validatedData.company_name,
              codigo_atividade: validatedData.activity_code,
              municipio: validatedData.city,
              uf: validatedData.state,
              situacao: validatedData.status,
            }),
          ];
        case 3:
          results = _a.sent();
          searchRecord = {
            search_parameters: validatedData,
            results_count: results.length,
            search_date: new Date().toISOString(),
            results: results.slice(0, 100), // Store first 100 results
          };
          return [4 /*yield*/, supabase.from("cnpj_searches").insert(searchRecord)];
        case 4:
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                search_id: crypto.randomUUID(),
                results: results,
                total_found: results.length,
                search_parameters: validatedData,
                searched_at: new Date().toISOString(),
              },
            }),
          ];
        case 5:
          error_9 = _a.sent();
          console.error("Company search error:", error_9);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Company search failed", details: error_9.message },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function updateCNPJStatus(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var cnpj,
      _a,
      force_update,
      existing,
      shouldUpdate,
      CNPJValidator,
      validator,
      validation,
      updated,
      error_10;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          (cnpj = body.cnpj), (_a = body.force_update), (force_update = _a === void 0 ? false : _a);
          if (!cnpj) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "cnpj is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("cnpj_validations")
              .select("*")
              .eq("cnpj", cnpj)
              .order("validation_date", { ascending: false })
              .limit(1)
              .single(),
          ];
        case 1:
          existing = _b.sent().data;
          shouldUpdate =
            force_update ||
            !existing ||
            Date.now() - new Date(existing.validation_date).getTime() > 24 * 60 * 60 * 1000;
          if (!shouldUpdate) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                data: {
                  cnpj: cnpj,
                  status: existing.status,
                  company_data: existing.company_data,
                  last_updated: existing.validation_date,
                  updated: false,
                  reason: "Recent data available",
                },
              }),
            ];
          }
          _b.label = 2;
        case 2:
          _b.trys.push([2, 8, , 9]);
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/brazilian-tax/cnpj-validator")),
          ];
        case 3:
          CNPJValidator = _b.sent().CNPJValidator;
          validator = new CNPJValidator();
          return [4 /*yield*/, validator.validateCNPJ(cnpj)];
        case 4:
          validation = _b.sent();
          if (!(validation.valid && validation.companyData)) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("cnpj_validations")
              .upsert({
                cnpj: validation.formatted,
                company_data: validation.companyData,
                validation_date: new Date().toISOString(),
                status: "valid",
                source: "status_update",
              })
              .select()
              .single(),
          ];
        case 5:
          updated = _b.sent().data;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                cnpj: validation.formatted,
                status: "valid",
                company_data: validation.companyData,
                last_updated: updated.validation_date,
                updated: true,
                reason: "Fresh data retrieved",
              },
            }),
          ];
        case 6:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "CNPJ validation failed", details: validation.errors },
              { status: 400 },
            ),
          ];
        case 7:
          return [3 /*break*/, 9];
        case 8:
          error_10 = _b.sent();
          console.error("CNPJ status update error:", error_10);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "CNPJ status update failed", details: error_10.message },
              { status: 500 },
            ),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
