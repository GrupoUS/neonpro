/**
 * Computer Vision Analysis API Route
 * POST /api/vision/analysis
 *
 * Handles before/after image analysis with ≥95% accuracy and <30s processing time
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */
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
exports.DELETE = exports.PUT = exports.POST = exports.GET = void 0;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var analysis_engine_1 = require("@/lib/vision/analysis-engine");
var zod_1 = require("zod");
var monitoring_1 = require("@/lib/monitoring");
// Request validation schema
var analysisRequestSchema = zod_1.z.object({
  beforeImageUrl: zod_1.z.string().url('URL da imagem "antes" é obrigatória'),
  afterImageUrl: zod_1.z.string().url('URL da imagem "depois" é obrigatória'),
  patientId: zod_1.z.string().min(1, "ID do paciente é obrigatório"),
  treatmentType: zod_1.z.enum(
    [
      "acne_treatment",
      "anti_aging",
      "skin_rejuvenation",
      "scar_treatment",
      "pigmentation",
      "wrinkle_reduction",
      "other",
    ],
    { required_error: "Tipo de tratamento é obrigatório" },
  ),
  analysisOptions: zod_1.z
    .object({
      enableDetailedMetrics: zod_1.z.boolean().default(true),
      generateAnnotations: zod_1.z.boolean().default(true),
      qualityThreshold: zod_1.z.number().min(0.8).max(1.0).default(0.95),
    })
    .optional(),
});
// GET - Retrieve analysis history
exports.GET = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase, _a, user, authError, searchParams, patientId, limit, offset, history_1, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          _b.label = 2;
        case 2:
          _b.trys.push([2, 5, , 6]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          patientId = searchParams.get("patientId");
          limit = parseInt(searchParams.get("limit") || "10");
          offset = parseInt(searchParams.get("offset") || "0");
          if (!patientId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "ID do paciente é obrigatório" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            analysis_engine_1.visionAnalysisEngine.getPatientAnalysisHistory(
              patientId,
              limit,
              offset,
            ),
          ];
        case 4:
          history_1 = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: history_1,
              pagination: {
                limit: limit,
                offset: offset,
                total: history_1.length,
              },
            }),
          ];
        case 5:
          error_1 = _b.sent();
          console.error("Vision analysis history error:", error_1);
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
        case 6:
          return [2 /*return*/];
      }
    });
  }),
);
// POST - Start new analysis
exports.POST = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedData,
      startTime,
      analysisResult,
      processingTime,
      performanceWarnings,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          _b.label = 2;
        case 2:
          _b.trys.push([2, 7, , 8]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          validatedData = analysisRequestSchema.parse(body);
          startTime = Date.now();
          return [
            4 /*yield*/,
            analysis_engine_1.visionAnalysisEngine.analyzeBeforeAfter(
              validatedData.beforeImageUrl,
              validatedData.afterImageUrl,
              validatedData.patientId,
              validatedData.treatmentType,
              validatedData.analysisOptions,
            ),
          ];
        case 5:
          analysisResult = _b.sent();
          processingTime = Date.now() - startTime;
          performanceWarnings = [];
          if (analysisResult.accuracyScore < 0.95) {
            performanceWarnings.push(
              "Precis\u00E3o abaixo do esperado: ".concat(
                (analysisResult.accuracyScore * 100).toFixed(1),
                "%",
              ),
            );
          }
          if (processingTime > 30000) {
            performanceWarnings.push(
              "Tempo de processamento excedeu 30s: ".concat(
                (processingTime / 1000).toFixed(1),
                "s",
              ),
            );
          }
          // Log performance metrics
          return [
            4 /*yield*/,
            supabase.from("analysis_performance").insert({
              analysis_id: analysisResult.id,
              processing_time_ms: processingTime,
              accuracy_score: analysisResult.accuracyScore,
              confidence_score: analysisResult.confidence,
              user_id: user.id,
              created_at: new Date().toISOString(),
            }),
          ];
        case 6:
          // Log performance metrics
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: analysisResult,
              performance: {
                processingTime: processingTime,
                meetsAccuracyTarget: analysisResult.accuracyScore >= 0.95,
                meetsTimeTarget: processingTime <= 30000,
                warnings: performanceWarnings,
              },
            }),
          ];
        case 7:
          error_2 = _b.sent();
          console.error("Vision analysis error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados de entrada inválidos",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
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
        case 8:
          return [2 /*return*/];
      }
    });
  }),
);
// PUT - Update analysis
exports.PUT = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      analysisId,
      body,
      notes,
      qualityRating,
      reviewStatus,
      _b,
      data,
      error,
      error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 6, , 7]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          analysisId = searchParams.get("id");
          if (!analysisId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "ID da análise é obrigatório" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _c.sent();
          (notes = body.notes),
            (qualityRating = body.qualityRating),
            (reviewStatus = body.reviewStatus);
          return [
            4 /*yield*/,
            supabase
              .from("image_analysis")
              .update({
                notes: notes,
                quality_rating: qualityRating,
                review_status: reviewStatus,
                reviewed_at: new Date().toISOString(),
                reviewed_by: user.id,
              })
              .eq("id", analysisId)
              .eq("user_id", user.id) // Ensure user can only update their own analyses
              .select()
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
            }),
          ];
        case 6:
          error_3 = _c.sent();
          console.error("Vision analysis update error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_3 instanceof Error ? error_3.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  }),
);
// DELETE - Delete analysis
exports.DELETE = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase, _a, user, authError, searchParams, analysisId, error, error_4;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          _b.label = 2;
        case 2:
          _b.trys.push([2, 5, , 6]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          analysisId = searchParams.get("id");
          if (!analysisId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "ID da análise é obrigatório" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("image_analysis")
              .update({
                deleted_at: new Date().toISOString(),
                deleted_by: user.id,
              })
              .eq("id", analysisId)
              .eq("user_id", user.id),
          ];
        case 4:
          error = _b.sent().error;
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Análise removida com sucesso",
            }),
          ];
        case 5:
          error_4 = _b.sent();
          console.error("Vision analysis delete error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_4 instanceof Error ? error_4.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  }),
);
