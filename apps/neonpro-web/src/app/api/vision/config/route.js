/**
 * Vision Analysis Configuration API
 * GET /api/vision/config
 * PUT /api/vision/config
 *
 * Manages computer vision analysis configuration and user preferences
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.PUT = exports.GET = void 0;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var monitoring_1 = require("@/lib/monitoring");
// Configuration validation schema
var configSchema = zod_1.z.object({
  // Analysis Settings
  defaultAccuracyThreshold: zod_1.z.number().min(0.5).max(1.0).default(0.85),
  defaultConfidenceThreshold: zod_1.z.number().min(0.5).max(1.0).default(0.8),
  maxProcessingTimeMs: zod_1.z.number().min(1000).max(60000).default(30000),
  enableAutoAnnotations: zod_1.z.boolean().default(true),
  enableQualityControl: zod_1.z.boolean().default(true),
  // Image Processing
  imageResolution: zod_1.z.enum(["low", "medium", "high", "ultra"]).default("high"),
  compressionQuality: zod_1.z.number().min(0.1).max(1.0).default(0.9),
  enableImageEnhancement: zod_1.z.boolean().default(true),
  enableNoiseReduction: zod_1.z.boolean().default(true),
  // Analysis Features
  enableChangeDetection: zod_1.z.boolean().default(true),
  enableColorAnalysis: zod_1.z.boolean().default(true),
  enableTextureAnalysis: zod_1.z.boolean().default(true),
  enableSymmetryAnalysis: zod_1.z.boolean().default(false),
  enableVolumeEstimation: zod_1.z.boolean().default(false),
  // Notification Settings
  notifyOnCompletion: zod_1.z.boolean().default(true),
  notifyOnErrors: zod_1.z.boolean().default(true),
  notifyOnQualityIssues: zod_1.z.boolean().default(true),
  emailNotifications: zod_1.z.boolean().default(false),
  // Export Settings
  defaultExportFormat: zod_1.z.enum(["pdf", "excel", "json", "csv"]).default("pdf"),
  includeImagesInExport: zod_1.z.boolean().default(true),
  includeAnnotationsInExport: zod_1.z.boolean().default(true),
  includeMetricsInExport: zod_1.z.boolean().default(true),
  // Privacy Settings
  allowDataSharing: zod_1.z.boolean().default(false),
  anonymizeExports: zod_1.z.boolean().default(true),
  retentionPeriodDays: zod_1.z.number().min(30).max(2555).default(365), // 7 years max
  // Advanced Settings
  modelVersion: zod_1.z.string().default("v1.0"),
  enableExperimentalFeatures: zod_1.z.boolean().default(false),
  debugMode: zod_1.z.boolean().default(false),
  customThresholds: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
  // UI Preferences
  defaultView: zod_1.z.enum(["grid", "list", "timeline"]).default("grid"),
  showAdvancedMetrics: zod_1.z.boolean().default(false),
  autoRefreshResults: zod_1.z.boolean().default(true),
  resultsPerPage: zod_1.z.number().min(10).max(100).default(20),
});
// GET - Retrieve user configuration
exports.GET = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      _b,
      config,
      configError,
      defaultConfig,
      userConfig,
      systemInfo,
      error_1;
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
          return [
            4 /*yield*/,
            supabase.from("vision_analysis_config").select("*").eq("user_id", user.id).single(),
          ];
        case 4:
          (_b = _c.sent()), (config = _b.data), (configError = _b.error);
          if (configError && configError.code !== "PGRST116") {
            // Not found is OK
            throw configError;
          }
          defaultConfig = configSchema.parse({});
          userConfig = config
            ? __assign(__assign({}, defaultConfig), config.settings)
            : defaultConfig;
          systemInfo = {
            supportedFormats: ["jpg", "jpeg", "png", "webp"],
            maxImageSize: 10 * 1024 * 1024, // 10MB
            maxResolution: { width: 4096, height: 4096 },
            availableModels: ["v1.0", "v1.1-beta"],
            supportedLanguages: ["pt-BR", "en-US", "es-ES"],
            features: {
              changeDetection: true,
              colorAnalysis: true,
              textureAnalysis: true,
              symmetryAnalysis: true,
              volumeEstimation: false, // Coming soon
              realTimeAnalysis: false, // Coming soon
            },
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                config: userConfig,
                systemInfo: systemInfo,
                lastUpdated:
                  (config === null || config === void 0 ? void 0 : config.updated_at) || null,
              },
            }),
          ];
        case 5:
          error_1 = _c.sent();
          console.error("Vision config retrieval error:", error_1);
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
// PUT - Update user configuration
exports.PUT = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedConfig,
      existingConfig,
      result,
      _b,
      data,
      error,
      _c,
      data,
      error,
      error_2;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          _d.label = 2;
        case 2:
          _d.trys.push([2, 11, , 12]);
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
          validatedConfig = configSchema.parse(body);
          // Validate business rules
          if (
            validatedConfig.defaultAccuracyThreshold > validatedConfig.defaultConfidenceThreshold
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Limite de precisão não pode ser maior que limite de confiança" },
                { status: 400 },
              ),
            ];
          }
          if (validatedConfig.retentionPeriodDays < 30) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Período de retenção mínimo é de 30 dias" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("vision_analysis_config").select("id").eq("user_id", user.id).single(),
          ];
        case 5:
          existingConfig = _d.sent().data;
          result = void 0;
          if (!existingConfig) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            supabase
              .from("vision_analysis_config")
              .update({
                settings: validatedConfig,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id)
              .select()
              .single(),
          ];
        case 6:
          (_b = _d.sent()), (data = _b.data), (error = _b.error);
          if (error) throw error;
          result = data;
          return [3 /*break*/, 9];
        case 7:
          return [
            4 /*yield*/,
            supabase
              .from("vision_analysis_config")
              .insert({
                user_id: user.id,
                settings: validatedConfig,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 8:
          (_c = _d.sent()), (data = _c.data), (error = _c.error);
          if (error) throw error;
          result = data;
          _d.label = 9;
        case 9:
          // Log configuration change
          return [
            4 /*yield*/,
            supabase.from("analysis_activity_log").insert({
              user_id: user.id,
              activity_type: "config_updated",
              activity_details: {
                changedSettings: Object.keys(validatedConfig),
                timestamp: new Date().toISOString(),
              },
              created_at: new Date().toISOString(),
            }),
          ];
        case 10:
          // Log configuration change
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                config: result.settings,
                lastUpdated: result.updated_at,
              },
              message: "Configuração atualizada com sucesso",
            }),
          ];
        case 11:
          error_2 = _d.sent();
          console.error("Vision config update error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados de configuração inválidos",
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
        case 12:
          return [2 /*return*/];
      }
    });
  }),
);
// POST - Reset configuration to defaults
exports.POST = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      action,
      defaultConfig,
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
          _c.trys.push([2, 7, , 8]);
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
          action = searchParams.get("action");
          if (!(action === "reset")) return [3 /*break*/, 6];
          defaultConfig = configSchema.parse({});
          return [
            4 /*yield*/,
            supabase
              .from("vision_analysis_config")
              .upsert({
                user_id: user.id,
                settings: defaultConfig,
                updated_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error) throw error;
          // Log reset activity
          return [
            4 /*yield*/,
            supabase.from("analysis_activity_log").insert({
              user_id: user.id,
              activity_type: "config_reset",
              activity_details: {
                resetToDefaults: true,
                timestamp: new Date().toISOString(),
              },
              created_at: new Date().toISOString(),
            }),
          ];
        case 5:
          // Log reset activity
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                config: data.settings,
                lastUpdated: data.updated_at,
              },
              message: "Configuração restaurada para os padrões",
            }),
          ];
        case 6:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Ação não suportada" }, { status: 400 }),
          ];
        case 7:
          error_3 = _c.sent();
          console.error("Vision config reset error:", error_3);
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
        case 8:
          return [2 /*return*/];
      }
    });
  }),
);
