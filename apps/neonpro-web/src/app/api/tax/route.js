// Brazilian Tax Management API
// Story 5.5: API endpoints for Brazilian tax system integration
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
var taxCalculationSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid(),
  invoice_id: zod_1.z.string().uuid(),
  services: zod_1.z.array(
    zod_1.z.object({
      codigo_servico: zod_1.z.string(),
      descricao: zod_1.z.string(),
      valor_unitario: zod_1.z.number().positive(),
      quantidade: zod_1.z.number().positive(),
      valor_total: zod_1.z.number().positive(),
    }),
  ),
  customer: zod_1.z.object({
    cnpj: zod_1.z.string().optional(),
    cpf: zod_1.z.string().optional(),
    nome: zod_1.z.string(),
    endereco: zod_1.z.object({
      logradouro: zod_1.z.string(),
      numero: zod_1.z.string(),
      bairro: zod_1.z.string(),
      municipio: zod_1.z.string(),
      uf: zod_1.z.string(),
      cep: zod_1.z.string(),
    }),
  }),
  calculation_type: zod_1.z.enum(["estimate", "final"]).default("final"),
});
var nfeGenerationSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid(),
  invoice_id: zod_1.z.string().uuid(),
  emit_immediately: zod_1.z.boolean().default(false),
  test_mode: zod_1.z.boolean().default(false),
});
/**
 * GET /api/tax - Get tax configuration and statistics
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, searchParams, clinicId, action, _a, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 11, , 12]);
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
            case "config":
              return [3 /*break*/, 2];
            case "statistics":
              return [3 /*break*/, 4];
            case "nfe-status":
              return [3 /*break*/, 6];
          }
          return [3 /*break*/, 8];
        case 2:
          return [4 /*yield*/, getTaxConfiguration(supabase, clinicId)];
        case 3:
          return [2 /*return*/, _b.sent()];
        case 4:
          return [4 /*yield*/, getTaxStatistics(supabase, clinicId)];
        case 5:
          return [2 /*return*/, _b.sent()];
        case 6:
          return [4 /*yield*/, getNFEStatus(supabase, clinicId)];
        case 7:
          return [2 /*return*/, _b.sent()];
        case 8:
          return [4 /*yield*/, getTaxOverview(supabase, clinicId)];
        case 9:
          return [2 /*return*/, _b.sent()];
        case 10:
          return [3 /*break*/, 12];
        case 11:
          error_1 = _b.sent();
          console.error("Tax API GET error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/tax - Tax calculations and NFE generation
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, body, action, _a, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 11, , 12]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, request.json()];
        case 2:
          body = _b.sent();
          action = body.action;
          _a = action;
          switch (_a) {
            case "calculate":
              return [3 /*break*/, 3];
            case "generate-nfe":
              return [3 /*break*/, 5];
            case "validate-cnpj":
              return [3 /*break*/, 7];
          }
          return [3 /*break*/, 9];
        case 3:
          return [4 /*yield*/, calculateTaxes(supabase, body)];
        case 4:
          return [2 /*return*/, _b.sent()];
        case 5:
          return [4 /*yield*/, generateNFE(supabase, body)];
        case 6:
          return [2 /*return*/, _b.sent()];
        case 7:
          return [4 /*yield*/, validateCNPJ(supabase, body)];
        case 8:
          return [2 /*return*/, _b.sent()];
        case 9:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action specified" }, { status: 400 }),
          ];
        case 10:
          return [3 /*break*/, 12];
        case 11:
          error_2 = _b.sent();
          console.error("Tax API POST error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
}
// Helper functions
function getTaxConfiguration(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
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
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Tax configuration not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ data: data })];
      }
    });
  });
}
function getTaxStatistics(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, nfeStats, nfeError, totalDocuments, totalValue, byStatus;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .select("status, valor_total, created_at")
              .eq("clinic_id", clinicId)
              .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          ];
        case 1:
          (_a = _b.sent()), (nfeStats = _a.data), (nfeError = _a.error);
          if (nfeError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch NFE statistics" },
                { status: 500 },
              ),
            ];
          }
          totalDocuments = nfeStats.length;
          totalValue = nfeStats.reduce((sum, doc) => sum + doc.valor_total, 0);
          byStatus = nfeStats.reduce((acc, doc) => {
            acc[doc.status] = (acc[doc.status] || 0) + 1;
            return acc;
          }, {});
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                total_documents: totalDocuments,
                total_value: totalValue,
                by_status: byStatus,
                period: "30_days",
              },
            }),
          ];
      }
    });
  });
}
function getNFEStatus(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .select("*")
              .eq("clinic_id", clinicId)
              .order("created_at", { ascending: false })
              .limit(50),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch NFE status" }, { status: 500 }),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ data: data })];
      }
    });
  });
}
function getTaxOverview(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, configResult, statsResult, nfeResult;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            Promise.all([
              getTaxConfiguration(supabase, clinicId),
              getTaxStatistics(supabase, clinicId),
              getNFEStatus(supabase, clinicId),
            ]),
          ];
        case 1:
          (_a = _b.sent()), (configResult = _a[0]), (statsResult = _a[1]), (nfeResult = _a[2]);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                configuration: configResult,
                statistics: statsResult,
                recent_nfe: nfeResult,
              },
            }),
          ];
      }
    });
  });
}
function calculateTaxes(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData,
      BrazilianTaxEngine,
      taxEngine,
      calculations,
      _i,
      _a,
      service,
      calculation,
      _b,
      data,
      error;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          validatedData = taxCalculationSchema.parse(body);
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/tax-engine")),
          ];
        case 1:
          BrazilianTaxEngine = _c.sent().BrazilianTaxEngine;
          taxEngine = new BrazilianTaxEngine();
          calculations = [];
          (_i = 0), (_a = validatedData.services);
          _c.label = 2;
        case 2:
          if (!(_i < _a.length)) return [3 /*break*/, 5];
          service = _a[_i];
          return [
            4 /*yield*/,
            taxEngine.calculateTaxes({
              clinic_id: validatedData.clinic_id,
              valor_base: service.valor_total,
              tipo_servico: service.descricao,
              codigo_servico: service.codigo_servico,
            }),
          ];
        case 3:
          calculation = _c.sent();
          calculations.push({
            service: service,
            calculation: calculation,
          });
          _c.label = 4;
        case 4:
          _i++;
          return [3 /*break*/, 2];
        case 5:
          return [
            4 /*yield*/,
            supabase
              .from("tax_calculations")
              .insert({
                clinic_id: validatedData.clinic_id,
                invoice_id: validatedData.invoice_id,
                calculations: calculations,
                total_base: validatedData.services.reduce((sum, s) => sum + s.valor_total, 0),
                total_taxes: calculations.reduce((sum, c) => sum + c.calculation.total_taxes, 0),
                created_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 6:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to store tax calculation" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                calculation_id: data.id,
                calculations: calculations,
                summary: {
                  total_base: data.total_base,
                  total_taxes: data.total_taxes,
                  effective_rate: (data.total_taxes / data.total_base) * 100,
                },
              },
            }),
          ];
      }
    });
  });
}
function generateNFE(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData,
      NFEIntegrationService,
      nfeService,
      _a,
      invoice,
      invoiceError,
      nfeDocument,
      _b,
      data,
      error,
      error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          validatedData = nfeGenerationSchema.parse(body);
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/nfe-service")),
          ];
        case 1:
          NFEIntegrationService = _c.sent().NFEIntegrationService;
          nfeService = new NFEIntegrationService();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 8, , 9]);
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .select("*")
              .eq("id", validatedData.invoice_id)
              .eq("clinic_id", validatedData.clinic_id)
              .single(),
          ];
        case 3:
          (_a = _c.sent()), (invoice = _a.data), (invoiceError = _a.error);
          if (invoiceError || !invoice) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invoice not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            nfeService.generateNFE({
              clinic_id: validatedData.clinic_id,
              invoice_id: validatedData.invoice_id,
              services: invoice.items,
              customer: invoice.customer,
              test_mode: validatedData.test_mode,
            }),
          ];
        case 4:
          nfeDocument = _c.sent();
          return [
            4 /*yield*/,
            supabase.from("nfe_documents").insert(nfeDocument).select().single(),
          ];
        case 5:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to store NFE document" },
                { status: 500 },
              ),
            ];
          }
          if (!(validatedData.emit_immediately && !validatedData.test_mode))
            return [3 /*break*/, 7];
          return [4 /*yield*/, nfeService.emitNFE(data.id)];
        case 6:
          _c.sent();
          _c.label = 7;
        case 7:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                nfe_id: data.id,
                numero_nfe: data.numero_nfe,
                status: data.status,
                chave_nfe: data.chave_nfe,
                emitted: validatedData.emit_immediately && !validatedData.test_mode,
              },
            }),
          ];
        case 8:
          error_3 = _c.sent();
          console.error("NFE generation error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "NFE generation failed" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
function validateCNPJ(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var cnpj, CNPJValidator, validator, validation, error_4;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          cnpj = body.cnpj;
          if (!cnpj) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "CNPJ is required" }, { status: 400 }),
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
          // Store validation result
          return [
            4 /*yield*/,
            supabase.from("cnpj_validations").upsert({
              cnpj: validation.formatted,
              company_data: validation.companyData,
              validation_date: new Date().toISOString(),
              status: "valid",
            }),
          ];
        case 4:
          // Store validation result
          _a.sent();
          _a.label = 5;
        case 5:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: validation,
            }),
          ];
        case 6:
          error_4 = _a.sent();
          console.error("CNPJ validation error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "CNPJ validation failed" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
