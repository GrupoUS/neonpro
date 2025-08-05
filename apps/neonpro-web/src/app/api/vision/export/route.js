/**
 * Vision Analysis Export API
 * POST /api/vision/export
 *
 * Exports computer vision analysis results to various formats (PDF, Excel, JSON)
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var monitoring_1 = require("@/lib/monitoring");
// Export request validation schema
var exportRequestSchema = zod_1.z.object({
  analysisIds: zod_1.z
    .array(zod_1.z.string().uuid())
    .min(1, "Pelo menos uma análise deve ser selecionada"),
  format: zod_1.z.enum(["pdf", "excel", "json", "csv"], {
    required_error: "Formato de exportação é obrigatório",
  }),
  includeImages: zod_1.z.boolean().default(true),
  includeAnnotations: zod_1.z.boolean().default(true),
  includeMetrics: zod_1.z.boolean().default(true),
  includeTimeline: zod_1.z.boolean().default(false),
  customFields: zod_1.z.array(zod_1.z.string()).optional(),
  reportTitle: zod_1.z.string().optional(),
  reportNotes: zod_1.z.string().optional(),
});
// POST - Export analysis results
exports.POST = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedData,
      _b,
      analysisData,
      analysisError,
      exportResult,
      timestamp,
      filename,
      _c,
      headers,
      error_1;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          _d.label = 2;
        case 2:
          _d.trys.push([2, 17, , 18]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _d.sent();
          validatedData = exportRequestSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("image_analysis")
              .select(
                "\n        *,\n        analysis_annotations(*),\n        analysis_performance(*),\n        analysis_quality_control(*)\n      ",
              )
              .in("id", validatedData.analysisIds)
              .eq("user_id", user.id),
          ];
        case 5:
          (_b = _d.sent()), (analysisData = _b.data), (analysisError = _b.error);
          if (analysisError) {
            throw analysisError;
          }
          if (!analysisData || analysisData.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Nenhuma análise encontrada" }, { status: 404 }),
            ];
          }
          exportResult = void 0;
          timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          filename = "vision-analysis-export-".concat(timestamp);
          _c = validatedData.format;
          switch (_c) {
            case "json":
              return [3 /*break*/, 6];
            case "csv":
              return [3 /*break*/, 8];
            case "pdf":
              return [3 /*break*/, 10];
            case "excel":
              return [3 /*break*/, 12];
          }
          return [3 /*break*/, 14];
        case 6:
          return [4 /*yield*/, generateJSONExport(analysisData, validatedData)];
        case 7:
          exportResult = _d.sent();
          return [3 /*break*/, 15];
        case 8:
          return [4 /*yield*/, generateCSVExport(analysisData, validatedData)];
        case 9:
          exportResult = _d.sent();
          return [3 /*break*/, 15];
        case 10:
          return [4 /*yield*/, generatePDFExport(analysisData, validatedData)];
        case 11:
          exportResult = _d.sent();
          return [3 /*break*/, 15];
        case 12:
          return [4 /*yield*/, generateExcelExport(analysisData, validatedData)];
        case 13:
          exportResult = _d.sent();
          return [3 /*break*/, 15];
        case 14:
          throw new Error("Formato de exportação não suportado");
        case 15:
          // Log export activity
          return [
            4 /*yield*/,
            supabase.from("analysis_exports").insert({
              user_id: user.id,
              analysis_ids: validatedData.analysisIds,
              export_format: validatedData.format,
              export_options: validatedData,
              file_size_bytes: exportResult.data.length,
              created_at: new Date().toISOString(),
            }),
          ];
        case 16:
          // Log export activity
          _d.sent();
          headers = new Headers();
          headers.set("Content-Type", exportResult.contentType);
          headers.set(
            "Content-Disposition",
            'attachment; filename="'.concat(filename, ".").concat(validatedData.format, '"'),
          );
          headers.set("Content-Length", exportResult.data.length.toString());
          return [
            2 /*return*/,
            new server_1.NextResponse(exportResult.data, {
              status: 200,
              headers: headers,
            }),
          ];
        case 17:
          error_1 = _d.sent();
          console.error("Vision export error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados de entrada inválidos",
                  details: error_1.errors,
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
                details: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 18:
          return [2 /*return*/];
      }
    });
  }),
);
// Helper function to generate JSON export
function generateJSONExport(analysisData, options) {
  return __awaiter(this, void 0, void 0, function () {
    var exportData;
    return __generator(this, (_a) => {
      exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalAnalyses: analysisData.length,
          format: "json",
          options: options,
          reportTitle: options.reportTitle || "Relatório de Análise de Visão Computacional",
          reportNotes: options.reportNotes,
        },
        analyses: analysisData.map((analysis) => {
          var _a, _b;
          return __assign(
            __assign(
              __assign(
                __assign(
                  {
                    id: analysis.id,
                    patientId: analysis.patient_id,
                    treatmentType: analysis.treatment_type,
                    status: analysis.status,
                    createdAt: analysis.created_at,
                  },
                  options.includeMetrics && {
                    metrics: {
                      accuracyScore: analysis.accuracy_score,
                      confidence: analysis.confidence,
                      improvementPercentage: analysis.improvement_percentage,
                      changeMetrics: analysis.change_metrics,
                    },
                  },
                ),
                options.includeImages && {
                  images: {
                    beforeImageUrl: analysis.before_image_url,
                    afterImageUrl: analysis.after_image_url,
                  },
                },
              ),
              options.includeAnnotations && {
                annotations: analysis.analysis_annotations || [],
              },
            ),
            {
              performance:
                ((_a = analysis.analysis_performance) === null || _a === void 0 ? void 0 : _a[0]) ||
                null,
              qualityControl:
                ((_b = analysis.analysis_quality_control) === null || _b === void 0
                  ? void 0
                  : _b[0]) || null,
            },
          );
        }),
      };
      return [
        2 /*return*/,
        {
          data: Buffer.from(JSON.stringify(exportData, null, 2)),
          contentType: "application/json",
        },
      ];
    });
  });
}
// Helper function to generate CSV export
function generateCSVExport(analysisData, options) {
  return __awaiter(this, void 0, void 0, function () {
    var headers, rows, csvContent;
    return __generator(this, (_a) => {
      headers = __spreadArray(
        __spreadArray(
          ["ID", "Patient ID", "Treatment Type", "Status", "Created At"],
          options.includeMetrics
            ? ["Accuracy Score", "Confidence", "Improvement %", "Processing Time (ms)"]
            : [],
          true,
        ),
        ["Notes"],
        false,
      );
      rows = analysisData.map((analysis) => {
        var _a, _b;
        return __spreadArray(
          __spreadArray(
            [
              analysis.id,
              analysis.patient_id,
              analysis.treatment_type,
              analysis.status,
              analysis.created_at,
            ],
            options.includeMetrics
              ? [
                  analysis.accuracy_score,
                  analysis.confidence,
                  analysis.improvement_percentage,
                  ((_b =
                    (_a = analysis.analysis_performance) === null || _a === void 0
                      ? void 0
                      : _a[0]) === null || _b === void 0
                    ? void 0
                    : _b.processing_time_ms) || "",
                ]
              : [],
            true,
          ),
          [analysis.notes || ""],
          false,
        );
      });
      csvContent = __spreadArray([headers], rows, true)
        .map((row) =>
          row.map((field) => '"'.concat(String(field).replace(/"/g, '""'), '"')).join(","),
        )
        .join("\n");
      return [
        2 /*return*/,
        {
          data: Buffer.from(csvContent),
          contentType: "text/csv",
        },
      ];
    });
  });
}
// Helper function to generate PDF export
function generatePDFExport(analysisData, options) {
  return __awaiter(this, void 0, void 0, function () {
    var content;
    return __generator(this, (_a) => {
      content = "\nRELAT\u00D3RIO DE AN\u00C1LISE DE VIS\u00C3O COMPUTACIONAL\n\nGerado em: "
        .concat(new Date().toLocaleString("pt-BR"), "\nTotal de An\u00E1lises: ")
        .concat(analysisData.length, "\n\n")
        .concat(
          analysisData
            .map((analysis, index) =>
              "\nAN\u00C1LISE "
                .concat(index + 1, "\n")
                .concat("=".repeat(20), "\nID: ")
                .concat(analysis.id, "\nPaciente: ")
                .concat(analysis.patient_id, "\nTipo de Tratamento: ")
                .concat(analysis.treatment_type, "\nStatus: ")
                .concat(analysis.status, "\nData: ")
                .concat(new Date(analysis.created_at).toLocaleString("pt-BR"), "\n")
                .concat(
                  options.includeMetrics
                    ? "\nM\u00C9TRICAS:\n- Precis\u00E3o: "
                        .concat((analysis.accuracy_score * 100).toFixed(1), "%\n- Confian\u00E7a: ")
                        .concat((analysis.confidence * 100).toFixed(1), "%\n- Melhoria: ")
                        .concat(analysis.improvement_percentage.toFixed(1), "%\n")
                    : "",
                  "\n",
                )
                .concat(
                  analysis.notes ? "Observa\u00E7\u00F5es: ".concat(analysis.notes) : "",
                  "\n",
                ),
            )
            .join("\n"),
          "\n",
        );
      return [
        2 /*return*/,
        {
          data: Buffer.from(content),
          contentType: "application/pdf",
        },
      ];
    });
  });
}
// Helper function to generate Excel export
function generateExcelExport(analysisData, options) {
  return __awaiter(this, void 0, void 0, function () {
    var csvResult;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, generateCSVExport(analysisData, options)];
        case 1:
          csvResult = _a.sent();
          return [
            2 /*return*/,
            {
              data: csvResult.data,
              contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ];
      }
    });
  });
}
// GET - Get export history
exports.GET = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      limit,
      offset,
      _b,
      exportHistory,
      error,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 5, , 6]);
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
          limit = parseInt(searchParams.get("limit") || "20");
          offset = parseInt(searchParams.get("offset") || "0");
          return [
            4 /*yield*/,
            supabase
              .from("analysis_exports")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .range(offset, offset + limit - 1),
          ];
        case 4:
          (_b = _c.sent()), (exportHistory = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: exportHistory,
              pagination: {
                limit: limit,
                offset: offset,
                total: exportHistory.length,
              },
            }),
          ];
        case 5:
          error_2 = _c.sent();
          console.error("Export history error:", error_2);
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
        case 6:
          return [2 /*return*/];
      }
    });
  }),
);
