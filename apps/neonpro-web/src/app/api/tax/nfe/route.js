// NFE Management API
// Story 5.5: Specialized API for NFE operations
// Author: VoidBeast V6.0 Master Orchestrator
// Date: 2025-01-30
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
var nfeEmissionSchema = zod_1.z.object({
  nfe_id: zod_1.z.string().uuid(),
  force_emission: zod_1.z.boolean().default(false),
});
var nfeCancellationSchema = zod_1.z.object({
  nfe_id: zod_1.z.string().uuid(),
  justification: zod_1.z.string().min(15).max(255),
});
var nfeConsultationSchema = zod_1.z.object({
  nfe_number: zod_1.z.string().optional(),
  chave_nfe: zod_1.z.string().optional(),
  status: zod_1.z.enum(["draft", "emitted", "cancelled", "rejected"]).optional(),
  date_range: zod_1.z
    .object({
      start_date: zod_1.z.string(),
      end_date: zod_1.z.string(),
    })
    .optional(),
});
/**
 * GET /api/tax/nfe - Consult NFE documents
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, searchParams, clinicId, action, _a, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 13, , 14]);
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
            case "validate":
              return [3 /*break*/, 8];
          }
          return [3 /*break*/, 10];
        case 2:
          return [4 /*yield*/, listNFEDocuments(supabase, clinicId, searchParams)];
        case 3:
          return [2 /*return*/, _b.sent()];
        case 4:
          return [4 /*yield*/, getNFEStatus(supabase, searchParams)];
        case 5:
          return [2 /*return*/, _b.sent()];
        case 6:
          return [4 /*yield*/, downloadNFE(supabase, searchParams)];
        case 7:
          return [2 /*return*/, _b.sent()];
        case 8:
          return [4 /*yield*/, validateNFE(supabase, searchParams)];
        case 9:
          return [2 /*return*/, _b.sent()];
        case 10:
          return [4 /*yield*/, getNFEOverview(supabase, clinicId)];
        case 11:
          return [2 /*return*/, _b.sent()];
        case 12:
          return [3 /*break*/, 14];
        case 13:
          error_1 = _b.sent();
          console.error("NFE API GET error:", error_1);
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
/**
 * POST /api/tax/nfe - NFE operations
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
            case "emit":
              return [3 /*break*/, 3];
            case "cancel":
              return [3 /*break*/, 5];
            case "reprocess":
              return [3 /*break*/, 7];
            case "batch-emit":
              return [3 /*break*/, 9];
          }
          return [3 /*break*/, 11];
        case 3:
          return [4 /*yield*/, emitNFE(supabase, body)];
        case 4:
          return [2 /*return*/, _b.sent()];
        case 5:
          return [4 /*yield*/, cancelNFE(supabase, body)];
        case 6:
          return [2 /*return*/, _b.sent()];
        case 7:
          return [4 /*yield*/, reprocessNFE(supabase, body)];
        case 8:
          return [2 /*return*/, _b.sent()];
        case 9:
          return [4 /*yield*/, batchEmitNFE(supabase, body)];
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
          console.error("NFE API POST error:", error_2);
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
function listNFEDocuments(supabase, clinicId, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var query, status, startDate, endDate, limit, offset, _a, data, error, count;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          query = supabase.from("nfe_documents").select("*").eq("clinic_id", clinicId);
          status = searchParams.get("status");
          if (status) {
            query = query.eq("status", status);
          }
          startDate = searchParams.get("start_date");
          endDate = searchParams.get("end_date");
          if (startDate && endDate) {
            query = query.gte("created_at", startDate).lte("created_at", endDate);
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
                { error: "Failed to fetch NFE documents" },
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
function getNFEStatus(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var nfeId,
      chaveNfe,
      query,
      _a,
      data,
      error,
      NFEIntegrationService,
      nfeService,
      updatedStatus,
      error_3;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          nfeId = searchParams.get("nfe_id");
          chaveNfe = searchParams.get("chave_nfe");
          if (!nfeId && !chaveNfe) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "nfe_id or chave_nfe parameter is required" },
                { status: 400 },
              ),
            ];
          }
          query = supabase.from("nfe_documents").select("*");
          if (nfeId) {
            query = query.eq("id", nfeId);
          } else {
            query = query.eq("chave_nfe", chaveNfe);
          }
          return [4 /*yield*/, query.single()];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFE not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/nfe-service")),
          ];
        case 2:
          NFEIntegrationService = _b.sent().NFEIntegrationService;
          nfeService = new NFEIntegrationService();
          _b.label = 3;
        case 3:
          _b.trys.push([3, 7, , 8]);
          return [4 /*yield*/, nfeService.consultNFEStatus(data.chave_nfe)];
        case 4:
          updatedStatus = _b.sent();
          if (!(updatedStatus.status !== data.status)) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .update({
                status: updatedStatus.status,
                updated_at: new Date().toISOString(),
              })
              .eq("id", data.id),
          ];
        case 5:
          _b.sent();
          _b.label = 6;
        case 6:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: __assign(__assign({}, data), {
                status: updatedStatus.status,
                latest_consultation: updatedStatus,
              }),
            }),
          ];
        case 7:
          error_3 = _b.sent();
          console.error("NFE status consultation error:", error_3);
          return [2 /*return*/, server_1.NextResponse.json({ data: data })];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
function downloadNFE(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var nfeId,
      format,
      _a,
      nfe,
      error,
      NFEIntegrationService,
      nfeService,
      fileData,
      headers,
      error_4;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          nfeId = searchParams.get("nfe_id");
          format = searchParams.get("format") || "pdf";
          if (!nfeId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "nfe_id parameter is required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.from("nfe_documents").select("*").eq("id", nfeId).single()];
        case 1:
          (_a = _b.sent()), (nfe = _a.data), (error = _a.error);
          if (error || !nfe) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFE not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/nfe-service")),
          ];
        case 2:
          NFEIntegrationService = _b.sent().NFEIntegrationService;
          nfeService = new NFEIntegrationService();
          _b.label = 3;
        case 3:
          _b.trys.push([3, 5, , 6]);
          return [4 /*yield*/, nfeService.downloadNFE(nfe.chave_nfe, format)];
        case 4:
          fileData = _b.sent();
          headers = new Headers();
          headers.set("Content-Type", format === "pdf" ? "application/pdf" : "application/xml");
          headers.set(
            "Content-Disposition",
            'attachment; filename="NFE_'.concat(nfe.numero_nfe, ".").concat(format, '"'),
          );
          return [2 /*return*/, new server_1.NextResponse(fileData, { headers: headers })];
        case 5:
          error_4 = _b.sent();
          console.error("NFE download error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to download NFE" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function validateNFE(supabase, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var nfeId, _a, nfe, error, NFEIntegrationService, nfeService, validation, error_5;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          nfeId = searchParams.get("nfe_id");
          if (!nfeId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "nfe_id parameter is required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.from("nfe_documents").select("*").eq("id", nfeId).single()];
        case 1:
          (_a = _b.sent()), (nfe = _a.data), (error = _a.error);
          if (error || !nfe) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFE not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/nfe-service")),
          ];
        case 2:
          NFEIntegrationService = _b.sent().NFEIntegrationService;
          nfeService = new NFEIntegrationService();
          _b.label = 3;
        case 3:
          _b.trys.push([3, 5, , 6]);
          return [4 /*yield*/, nfeService.validateNFE(nfe)];
        case 4:
          validation = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                nfe_id: nfeId,
                valid: validation.valid,
                errors: validation.errors || [],
                warnings: validation.warnings || [],
                validated_at: new Date().toISOString(),
              },
            }),
          ];
        case 5:
          error_5 = _b.sent();
          console.error("NFE validation error:", error_5);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "NFE validation failed" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function getNFEOverview(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, stats, statsError, summary;
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
          (_a = _b.sent()), (stats = _a.data), (statsError = _a.error);
          if (statsError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch NFE statistics" },
                { status: 500 },
              ),
            ];
          }
          summary = {
            total_documents: stats.length,
            total_value: stats.reduce((sum, doc) => sum + doc.valor_total, 0),
            by_status: stats.reduce((acc, doc) => {
              acc[doc.status] = (acc[doc.status] || 0) + 1;
              return acc;
            }, {}),
            last_30_days: stats.length,
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                summary: summary,
                recent_documents: stats.slice(0, 10),
              },
            }),
          ];
      }
    });
  });
}
function emitNFE(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData, _a, nfe, error, NFEIntegrationService, nfeService, emission, error_6;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          validatedData = nfeEmissionSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.from("nfe_documents").select("*").eq("id", validatedData.nfe_id).single(),
          ];
        case 1:
          (_a = _b.sent()), (nfe = _a.data), (error = _a.error);
          if (error || !nfe) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFE not found" }, { status: 404 }),
            ];
          }
          if (nfe.status === "emitted" && !validatedData.force_emission) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFE already emitted" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/nfe-service")),
          ];
        case 2:
          NFEIntegrationService = _b.sent().NFEIntegrationService;
          nfeService = new NFEIntegrationService();
          _b.label = 3;
        case 3:
          _b.trys.push([3, 6, , 8]);
          return [4 /*yield*/, nfeService.emitNFE(validatedData.nfe_id)];
        case 4:
          emission = _b.sent();
          // Update document status
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .update({
                status: emission.status,
                chave_nfe: emission.chave_nfe,
                protocolo_autorizacao: emission.protocolo,
                data_emissao: emission.data_emissao,
                updated_at: new Date().toISOString(),
              })
              .eq("id", validatedData.nfe_id),
          ];
        case 5:
          // Update document status
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                nfe_id: validatedData.nfe_id,
                status: emission.status,
                chave_nfe: emission.chave_nfe,
                protocolo: emission.protocolo,
                emitted_at: emission.data_emissao,
              },
            }),
          ];
        case 6:
          error_6 = _b.sent();
          console.error("NFE emission error:", error_6);
          // Update status to error
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .update({
                status: "error",
                error_message: error_6.message,
                updated_at: new Date().toISOString(),
              })
              .eq("id", validatedData.nfe_id),
          ];
        case 7:
          // Update status to error
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "NFE emission failed", details: error_6.message },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
function cancelNFE(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData, _a, nfe, error, NFEIntegrationService, nfeService, cancellation, error_7;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          validatedData = nfeCancellationSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.from("nfe_documents").select("*").eq("id", validatedData.nfe_id).single(),
          ];
        case 1:
          (_a = _b.sent()), (nfe = _a.data), (error = _a.error);
          if (error || !nfe) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFE not found" }, { status: 404 }),
            ];
          }
          if (nfe.status !== "emitted") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Only emitted NFEs can be cancelled" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/nfe-service")),
          ];
        case 2:
          NFEIntegrationService = _b.sent().NFEIntegrationService;
          nfeService = new NFEIntegrationService();
          _b.label = 3;
        case 3:
          _b.trys.push([3, 6, , 7]);
          return [4 /*yield*/, nfeService.cancelNFE(nfe.chave_nfe, validatedData.justification)];
        case 4:
          cancellation = _b.sent();
          // Update document status
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .update({
                status: "cancelled",
                cancellation_reason: validatedData.justification,
                cancellation_protocol: cancellation.protocolo,
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", validatedData.nfe_id),
          ];
        case 5:
          // Update document status
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                nfe_id: validatedData.nfe_id,
                status: "cancelled",
                cancellation_protocol: cancellation.protocolo,
                cancelled_at: new Date().toISOString(),
              },
            }),
          ];
        case 6:
          error_7 = _b.sent();
          console.error("NFE cancellation error:", error_7);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "NFE cancellation failed", details: error_7.message },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function reprocessNFE(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var nfe_id, _a, nfe, error, NFEIntegrationService, nfeService, reprocessed, error_8;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          nfe_id = body.nfe_id;
          if (!nfe_id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "nfe_id is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("nfe_documents").select("*").eq("id", nfe_id).single(),
          ];
        case 1:
          (_a = _b.sent()), (nfe = _a.data), (error = _a.error);
          if (error || !nfe) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "NFE not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/nfe-service")),
          ];
        case 2:
          NFEIntegrationService = _b.sent().NFEIntegrationService;
          nfeService = new NFEIntegrationService();
          _b.label = 3;
        case 3:
          _b.trys.push([3, 5, , 6]);
          return [4 /*yield*/, nfeService.reprocessNFE(nfe_id)];
        case 4:
          reprocessed = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                nfe_id: nfe_id,
                status: reprocessed.status,
                reprocessed_at: new Date().toISOString(),
              },
            }),
          ];
        case 5:
          error_8 = _b.sent();
          console.error("NFE reprocessing error:", error_8);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "NFE reprocessing failed", details: error_8.message },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function batchEmitNFE(supabase, body) {
  return __awaiter(this, void 0, void 0, function () {
    var nfe_ids,
      _a,
      emit_options,
      NFEIntegrationService,
      nfeService,
      results,
      _i,
      nfe_ids_1,
      nfeId,
      emission,
      error_9,
      successful,
      failed;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          (nfe_ids = body.nfe_ids),
            (_a = body.emit_options),
            (emit_options = _a === void 0 ? {} : _a);
          if (!nfe_ids || !Array.isArray(nfe_ids)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "nfe_ids array is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.resolve().then(() => require("@/lib/services/tax/nfe-service")),
          ];
        case 1:
          NFEIntegrationService = _b.sent().NFEIntegrationService;
          nfeService = new NFEIntegrationService();
          results = [];
          (_i = 0), (nfe_ids_1 = nfe_ids);
          _b.label = 2;
        case 2:
          if (!(_i < nfe_ids_1.length)) return [3 /*break*/, 9];
          nfeId = nfe_ids_1[_i];
          _b.label = 3;
        case 3:
          _b.trys.push([3, 6, , 8]);
          return [4 /*yield*/, nfeService.emitNFE(nfeId)];
        case 4:
          emission = _b.sent();
          // Update document status
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .update({
                status: emission.status,
                chave_nfe: emission.chave_nfe,
                protocolo_autorizacao: emission.protocolo,
                data_emissao: emission.data_emissao,
                updated_at: new Date().toISOString(),
              })
              .eq("id", nfeId),
          ];
        case 5:
          // Update document status
          _b.sent();
          results.push({
            nfe_id: nfeId,
            success: true,
            status: emission.status,
            chave_nfe: emission.chave_nfe,
          });
          return [3 /*break*/, 8];
        case 6:
          error_9 = _b.sent();
          console.error("Batch NFE emission error for ".concat(nfeId, ":"), error_9);
          // Update status to error
          return [
            4 /*yield*/,
            supabase
              .from("nfe_documents")
              .update({
                status: "error",
                error_message: error_9.message,
                updated_at: new Date().toISOString(),
              })
              .eq("id", nfeId),
          ];
        case 7:
          // Update status to error
          _b.sent();
          results.push({
            nfe_id: nfeId,
            success: false,
            error: error_9.message,
          });
          return [3 /*break*/, 8];
        case 8:
          _i++;
          return [3 /*break*/, 2];
        case 9:
          successful = results.filter((r) => r.success).length;
          failed = results.filter((r) => !r.success).length;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: {
                batch_id: crypto.randomUUID(),
                total_processed: nfe_ids.length,
                successful: successful,
                failed: failed,
                results: results,
              },
            }),
          ];
      }
    });
  });
}
