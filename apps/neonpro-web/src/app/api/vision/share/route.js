"use strict";
/**
 * Vision Analysis Sharing API
 * POST /api/vision/share
 * GET /api/vision/share/[shareId]
 *
 * Enables secure sharing of computer vision analysis results
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */
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
exports.DELETE = exports.GET = exports.POST = void 0;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var monitoring_1 = require("@/lib/monitoring");
var crypto_1 = require("crypto");
// Share request validation schema
var shareRequestSchema = zod_1.z.object({
  analysisId: zod_1.z.string().uuid("ID de análise inválido"),
  shareType: zod_1.z.enum(["public", "private", "professional"], {
    required_error: "Tipo de compartilhamento é obrigatório",
  }),
  expiresAt: zod_1.z.string().datetime().optional(),
  allowedEmails: zod_1.z.array(zod_1.z.string().email()).optional(),
  includeImages: zod_1.z.boolean().default(true),
  includeAnnotations: zod_1.z.boolean().default(true),
  includeMetrics: zod_1.z.boolean().default(true),
  includePersonalInfo: zod_1.z.boolean().default(false),
  shareTitle: zod_1.z.string().optional(),
  shareMessage: zod_1.z.string().optional(),
  requirePassword: zod_1.z.boolean().default(false),
  password: zod_1.z.string().optional(),
});
// POST - Create a shareable link
exports.POST = (0, monitoring_1.withErrorMonitoring)(function (request) {
  return __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedData,
      _b,
      analysis,
      analysisError,
      shareId,
      shareUrl,
      defaultExpiration,
      expiresAt,
      hashedPassword,
      _c,
      shareRecord,
      shareError,
      error_1;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          _d.label = 2;
        case 2:
          _d.trys.push([2, 8, , 9]);
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
          validatedData = shareRequestSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("image_analysis")
              .select("*")
              .eq("id", validatedData.analysisId)
              .eq("user_id", user.id)
              .single(),
          ];
        case 5:
          (_b = _d.sent()), (analysis = _b.data), (analysisError = _b.error);
          if (analysisError || !analysis) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Análise não encontrada ou acesso negado" },
                { status: 404 },
              ),
            ];
          }
          shareId = (0, crypto_1.randomUUID)();
          shareUrl = "".concat(process.env.NEXT_PUBLIC_APP_URL, "/vision/shared/").concat(shareId);
          defaultExpiration = validatedData.shareType === "public" ? 30 : 7;
          expiresAt =
            validatedData.expiresAt ||
            new Date(Date.now() + defaultExpiration * 24 * 60 * 60 * 1000).toISOString();
          hashedPassword = null;
          if (validatedData.requirePassword && validatedData.password) {
            // In production, use proper password hashing like bcrypt
            hashedPassword = Buffer.from(validatedData.password).toString("base64");
          }
          return [
            4 /*yield*/,
            supabase
              .from("analysis_shares")
              .insert({
                id: shareId,
                analysis_id: validatedData.analysisId,
                user_id: user.id,
                share_type: validatedData.shareType,
                share_url: shareUrl,
                expires_at: expiresAt,
                allowed_emails: validatedData.allowedEmails || [],
                share_options: {
                  includeImages: validatedData.includeImages,
                  includeAnnotations: validatedData.includeAnnotations,
                  includeMetrics: validatedData.includeMetrics,
                  includePersonalInfo: validatedData.includePersonalInfo,
                  shareTitle: validatedData.shareTitle,
                  shareMessage: validatedData.shareMessage,
                },
                password_hash: hashedPassword,
                view_count: 0,
                is_active: true,
                created_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 6:
          (_c = _d.sent()), (shareRecord = _c.data), (shareError = _c.error);
          if (shareError) {
            throw shareError;
          }
          // Log sharing activity
          return [
            4 /*yield*/,
            supabase.from("analysis_activity_log").insert({
              analysis_id: validatedData.analysisId,
              user_id: user.id,
              activity_type: "shared",
              activity_details: {
                shareId: shareId,
                shareType: validatedData.shareType,
                expiresAt: expiresAt,
              },
              created_at: new Date().toISOString(),
            }),
          ];
        case 7:
          // Log sharing activity
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                shareId: shareId,
                shareUrl: shareUrl,
                expiresAt: expiresAt,
                shareType: validatedData.shareType,
                requiresPassword: validatedData.requirePassword,
              },
            }),
          ];
        case 8:
          error_1 = _d.sent();
          console.error("Vision share creation error:", error_1);
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
        case 9:
          return [2 /*return*/];
      }
    });
  });
});
// GET - Retrieve shared analysis
exports.GET = (0, monitoring_1.withErrorMonitoring)(function (request) {
  return __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      searchParams,
      shareId,
      password,
      viewerEmail,
      _a,
      shareRecord,
      shareError,
      providedPasswordHash,
      analysis,
      options,
      responseData,
      error_2;
    var _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          _d.label = 2;
        case 2:
          _d.trys.push([2, 6, , 7]);
          searchParams = new URL(request.url).searchParams;
          shareId = searchParams.get("shareId");
          password = searchParams.get("password");
          viewerEmail = searchParams.get("email");
          if (!shareId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "ID de compartilhamento é obrigatório" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("analysis_shares")
              .select(
                "\n        *,\n        image_analysis!inner(\n          id,\n          patient_id,\n          treatment_type,\n          status,\n          accuracy_score,\n          confidence,\n          improvement_percentage,\n          change_metrics,\n          before_image_url,\n          after_image_url,\n          notes,\n          created_at,\n          analysis_annotations(*),\n          analysis_performance(*)\n        )\n      ",
              )
              .eq("id", shareId)
              .eq("is_active", true)
              .single(),
          ];
        case 3:
          (_a = _d.sent()), (shareRecord = _a.data), (shareError = _a.error);
          if (shareError || !shareRecord) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Link de compartilhamento não encontrado ou expirado" },
                { status: 404 },
              ),
            ];
          }
          // Check if share has expired
          if (new Date(shareRecord.expires_at) < new Date()) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Link de compartilhamento expirado" },
                { status: 410 },
              ),
            ];
          }
          // Check password if required
          if (shareRecord.password_hash && password) {
            providedPasswordHash = Buffer.from(password).toString("base64");
            if (providedPasswordHash !== shareRecord.password_hash) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Senha incorreta" }, { status: 401 }),
              ];
            }
          } else if (shareRecord.password_hash && !password) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Senha obrigatória", requiresPassword: true },
                { status: 401 },
              ),
            ];
          }
          // Check email restrictions for private shares
          if (
            shareRecord.share_type === "private" &&
            ((_b = shareRecord.allowed_emails) === null || _b === void 0 ? void 0 : _b.length) > 0
          ) {
            if (!viewerEmail || !shareRecord.allowed_emails.includes(viewerEmail)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Acesso restrito - email não autorizado" },
                  { status: 403 },
                ),
              ];
            }
          }
          // Increment view count
          return [
            4 /*yield*/,
            supabase
              .from("analysis_shares")
              .update({
                view_count: shareRecord.view_count + 1,
                last_viewed_at: new Date().toISOString(),
              })
              .eq("id", shareId),
          ];
        case 4:
          // Increment view count
          _d.sent();
          // Log view activity
          return [
            4 /*yield*/,
            supabase.from("analysis_share_views").insert({
              share_id: shareId,
              viewer_email: viewerEmail,
              viewer_ip: request.headers.get("x-forwarded-for") || "unknown",
              user_agent: request.headers.get("user-agent") || "unknown",
              viewed_at: new Date().toISOString(),
            }),
          ];
        case 5:
          // Log view activity
          _d.sent();
          analysis = shareRecord.image_analysis;
          options = shareRecord.share_options;
          responseData = {
            shareInfo: {
              id: shareRecord.id,
              shareType: shareRecord.share_type,
              title: options.shareTitle || "Análise de Visão Computacional",
              message: options.shareMessage,
              createdAt: shareRecord.created_at,
              expiresAt: shareRecord.expires_at,
              viewCount: shareRecord.view_count + 1,
            },
            analysis: __assign(
              __assign(
                __assign(
                  __assign(
                    __assign(
                      __assign(
                        { id: analysis.id },
                        options.includePersonalInfo && { patientId: analysis.patient_id },
                      ),
                      {
                        treatmentType: analysis.treatment_type,
                        status: analysis.status,
                        createdAt: analysis.created_at,
                        notes: analysis.notes,
                      },
                    ),
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
                  ((_c = analysis.analysis_performance) === null || _c === void 0
                    ? void 0
                    : _c[0]) || null,
              },
            ),
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: responseData,
            }),
          ];
        case 6:
          error_2 = _d.sent();
          console.error("Vision share retrieval error:", error_2);
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
        case 7:
          return [2 /*return*/];
      }
    });
  });
});
// DELETE - Revoke/deactivate a share
exports.DELETE = (0, monitoring_1.withErrorMonitoring)(function (request) {
  return __awaiter(void 0, void 0, void 0, function () {
    var supabase, _a, user, authError, searchParams, shareId, _b, data, error, error_3;
    return __generator(this, function (_c) {
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
          shareId = searchParams.get("shareId");
          if (!shareId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "ID de compartilhamento é obrigatório" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("analysis_shares")
              .update({
                is_active: false,
                deactivated_at: new Date().toISOString(),
              })
              .eq("id", shareId)
              .eq("user_id", user.id)
              .select()
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error || !data) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Compartilhamento não encontrado ou acesso negado" },
                { status: 404 },
              ),
            ];
          }
          // Log deactivation activity
          return [
            4 /*yield*/,
            supabase.from("analysis_activity_log").insert({
              analysis_id: data.analysis_id,
              user_id: user.id,
              activity_type: "share_revoked",
              activity_details: { shareId: shareId },
              created_at: new Date().toISOString(),
            }),
          ];
        case 5:
          // Log deactivation activity
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Compartilhamento revogado com sucesso",
            }),
          ];
        case 6:
          error_3 = _c.sent();
          console.error("Vision share revocation error:", error_3);
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
  });
});
