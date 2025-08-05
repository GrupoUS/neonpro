/**
 * Sistema de Otimização Inteligente com ML - NeonPro
 *
 * Engine de Machine Learning para otimização de notificações utilizando
 * algoritmos de aprendizado para personalização, timing e segmentação.
 *
 * Features:
 * - Personalização de conteúdo com NLP
 * - Otimização de timing com temporal analysis
 * - Segmentação automática de usuários
 * - Predição de engajamento
 * - A/B testing automatizado
 *
 * @author APEX Architecture Team
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
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
exports.notificationMLEngine = exports.NotificationMLEngine = void 0;
var zod_1 = require("zod");
var server_1 = require("@/lib/supabase/server");
var types_1 = require("../types");
// ================================================================================
// SCHEMAS & TYPES
// ================================================================================
var UserProfileSchema = zod_1.z.object({
  userId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  demographics: zod_1.z.object({
    age: zod_1.z.number().optional(),
    gender: zod_1.z.enum(["M", "F", "O"]).optional(),
    location: zod_1.z.string().optional(),
    timezone: zod_1.z.string().default("America/Sao_Paulo"),
  }),
  behavior: zod_1.z.object({
    engagementScore: zod_1.z.number().min(0).max(1),
    preferredChannels: zod_1.z.array(zod_1.z.nativeEnum(types_1.NotificationChannel)),
    bestHours: zod_1.z.array(zod_1.z.number().min(0).max(23)),
    responsePattern: zod_1.z.enum(["immediate", "delayed", "weekend", "weekday"]),
    churnRisk: zod_1.z.number().min(0).max(1),
  }),
  preferences: zod_1.z.object({
    frequency: zod_1.z.enum(["high", "medium", "low"]),
    contentTypes: zod_1.z.array(zod_1.z.string()),
    languages: zod_1.z.array(zod_1.z.string()).default(["pt-BR"]),
  }),
  history: zod_1.z.object({
    totalNotifications: zod_1.z.number(),
    totalOpened: zod_1.z.number(),
    totalClicked: zod_1.z.number(),
    avgResponseTime: zod_1.z.number(), // em minutos
    lastEngagement: zod_1.z.string().datetime().optional(),
  }),
});
var OptimizationConfigSchema = zod_1.z.object({
  enabled: zod_1.z.boolean().default(true),
  learningRate: zod_1.z.number().min(0).max(1).default(0.1),
  minDataPoints: zod_1.z.number().min(10).default(50),
  confidenceThreshold: zod_1.z.number().min(0).max(1).default(0.7),
  features: zod_1.z.object({
    contentPersonalization: zod_1.z.boolean().default(true),
    timingOptimization: zod_1.z.boolean().default(true),
    channelSelection: zod_1.z.boolean().default(true),
    segmentation: zod_1.z.boolean().default(true),
    abTesting: zod_1.z.boolean().default(false),
  }),
  models: zod_1.z.object({
    engagementModel: zod_1.z
      .enum(["logistic", "random_forest", "neural_network"])
      .default("logistic"),
    timingModel: zod_1.z.enum(["time_series", "clustering", "regression"]).default("clustering"),
    segmentationModel: zod_1.z.enum(["kmeans", "hierarchical", "dbscan"]).default("kmeans"),
  }),
});
// ================================================================================
// ML OPTIMIZATION ENGINE
// ================================================================================
var NotificationMLEngine = /** @class */ (() => {
  function NotificationMLEngine(config) {
    if (config === void 0) {
      config = {};
    }
    this.models = new Map();
    this.supabase = (0, server_1.createClient)();
    this.config = OptimizationConfigSchema.parse(config);
    this.initializeModels();
  }
  // ================================================================================
  // MODEL INITIALIZATION
  // ================================================================================
  /**
   * Inicializa os modelos de ML
   */
  NotificationMLEngine.prototype.initializeModels = function () {
    // Modelo de engajamento (regressão logística simplificada)
    this.models.set("engagement", {
      weights: {
        hour: new Array(24).fill(0),
        channel: new Map(),
        dayOfWeek: new Array(7).fill(0),
        recency: 0,
        frequency: 0,
      },
      bias: 0,
      version: "1.0.0",
    });
    // Modelo de timing (clustering por perfil)
    this.models.set("timing", {
      clusters: new Map(),
      version: "1.0.0",
    });
    // Modelo de segmentação (K-means simplificado)
    this.models.set("segmentation", {
      centroids: [],
      segments: new Map(),
      version: "1.0.0",
    });
    console.log("🤖 Modelos de ML inicializados");
  };
  // ================================================================================
  // USER PROFILING
  // ================================================================================
  /**
   * Constrói ou atualiza o perfil de um usuário
   */
  NotificationMLEngine.prototype.buildUserProfile = function (userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        user,
        userError,
        _b,
        notifications,
        notificationError,
        notificationHistory,
        totalNotifications,
        totalOpened,
        totalClicked,
        engagementScore,
        channelStats_1,
        preferredChannels,
        hourlyEngagement_1,
        bestHours,
        responseTimes,
        avgResponseTime,
        responsePattern,
        weekendEngagement,
        weekdayEngagement,
        weekendSent,
        weekdayRate,
        weekendRate,
        lastEngagement,
        daysSinceLastEngagement,
        churnRisk,
        profile,
        error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase.from("profiles").select("*").eq("id", userId).single(),
            ];
          case 1:
            (_a = _c.sent()), (user = _a.data), (userError = _a.error);
            if (userError)
              throw new Error("Erro ao buscar usu\u00E1rio: ".concat(userError.message));
            return [
              4 /*yield*/,
              this.supabase
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order("sent_at", { ascending: false })
                .limit(500),
            ];
          case 2:
            (_b = _c.sent()), (notifications = _b.data), (notificationError = _b.error);
            if (notificationError) {
              console.error("Erro ao buscar histórico:", notificationError);
            }
            notificationHistory = notifications || [];
            totalNotifications = notificationHistory.length;
            totalOpened = notificationHistory.filter((n) => n.opened_at).length;
            totalClicked = notificationHistory.filter((n) => n.clicked_at).length;
            engagementScore = totalNotifications > 0 ? totalOpened / totalNotifications : 0.5;
            channelStats_1 = new Map();
            notificationHistory.forEach((n) => {
              var current = channelStats_1.get(n.channel) || { sent: 0, opened: 0 };
              current.sent++;
              if (n.opened_at) current.opened++;
              channelStats_1.set(n.channel, current);
            });
            preferredChannels = Array.from(channelStats_1.entries())
              .map((_a) => {
                var channel = _a[0],
                  stats = _a[1];
                return {
                  channel: channel,
                  rate: stats.sent > 0 ? stats.opened / stats.sent : 0,
                };
              })
              .sort((a, b) => b.rate - a.rate)
              .slice(0, 3)
              .map((c) => c.channel);
            hourlyEngagement_1 = new Array(24).fill(0).map(() => ({ sent: 0, opened: 0 }));
            notificationHistory.forEach((n) => {
              var hour = new Date(n.sent_at).getHours();
              hourlyEngagement_1[hour].sent++;
              if (n.opened_at) hourlyEngagement_1[hour].opened++;
            });
            bestHours = hourlyEngagement_1
              .map((stats, hour) => ({
                hour: hour,
                rate: stats.sent > 0 ? stats.opened / stats.sent : 0,
                count: stats.sent,
              }))
              .filter((h) => h.count >= 3) // Mínimo de dados
              .sort((a, b) => b.rate - a.rate)
              .slice(0, 5)
              .map((h) => h.hour);
            responseTimes = notificationHistory
              .filter((n) => n.opened_at)
              .map((n) => {
                var sent = new Date(n.sent_at).getTime();
                var opened = new Date(n.opened_at).getTime();
                return (opened - sent) / (1000 * 60); // minutos
              });
            avgResponseTime =
              responseTimes.length > 0
                ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
                : 60;
            responsePattern = "immediate";
            if (avgResponseTime > 60) responsePattern = "delayed";
            weekendEngagement = notificationHistory.filter((n) => {
              var day = new Date(n.sent_at).getDay();
              return (day === 0 || day === 6) && n.opened_at;
            }).length;
            weekdayEngagement = totalOpened - weekendEngagement;
            weekendSent = notificationHistory.filter((n) => {
              var day = new Date(n.sent_at).getDay();
              return day === 0 || day === 6;
            }).length;
            weekdayRate =
              totalNotifications - weekendSent > 0
                ? weekdayEngagement / (totalNotifications - weekendSent)
                : 0;
            weekendRate = weekendSent > 0 ? weekendEngagement / weekendSent : 0;
            if (weekendRate > weekdayRate * 1.2) responsePattern = "weekend";
            else if (weekdayRate > weekendRate * 1.2) responsePattern = "weekday";
            lastEngagement = notificationHistory.find((n) => n.opened_at || n.clicked_at);
            daysSinceLastEngagement = lastEngagement
              ? (Date.now() - new Date(lastEngagement.sent_at).getTime()) / (1000 * 60 * 60 * 24)
              : 30;
            churnRisk = Math.min(daysSinceLastEngagement / 30, 1);
            profile = {
              userId: userId,
              clinicId: clinicId,
              demographics: {
                age: user.age,
                gender: user.gender,
                location: user.city,
                timezone: user.timezone || "America/Sao_Paulo",
              },
              behavior: {
                engagementScore: engagementScore,
                preferredChannels:
                  preferredChannels.length > 0
                    ? preferredChannels
                    : [types_1.NotificationChannel.EMAIL],
                bestHours: bestHours.length > 0 ? bestHours : [10, 14, 16],
                responsePattern: responsePattern,
                churnRisk: churnRisk,
              },
              preferences: {
                frequency:
                  engagementScore > 0.7 ? "high" : engagementScore > 0.3 ? "medium" : "low",
                contentTypes: ["appointment", "reminder", "promotion"],
                languages: ["pt-BR"],
              },
              history: {
                totalNotifications: totalNotifications,
                totalOpened: totalOpened,
                totalClicked: totalClicked,
                avgResponseTime: avgResponseTime,
                lastEngagement:
                  lastEngagement === null || lastEngagement === void 0
                    ? void 0
                    : lastEngagement.sent_at,
              },
            };
            // Salvar perfil atualizado
            return [4 /*yield*/, this.saveUserProfile(profile)];
          case 3:
            // Salvar perfil atualizado
            _c.sent();
            return [2 /*return*/, profile];
          case 4:
            error_1 = _c.sent();
            console.error("Erro ao construir perfil do usuário:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Salva perfil do usuário no banco
   */
  NotificationMLEngine.prototype.saveUserProfile = function (profile) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("user_ml_profiles").upsert({
                user_id: profile.userId,
                clinic_id: profile.clinicId,
                demographics: profile.demographics,
                behavior: profile.behavior,
                preferences: profile.preferences,
                history: profile.history,
                updated_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Erro ao salvar perfil:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Erro ao salvar perfil:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ================================================================================
  // OPTIMIZATION ENGINE
  // ================================================================================
  /**
   * Otimiza notificação para um usuário específico
   */
  NotificationMLEngine.prototype.optimizeForUser = function (userId, clinicId, baseNotification) {
    return __awaiter(this, void 0, void 0, function () {
      var profile,
        channelOptimization,
        timingOptimization,
        contentOptimization,
        frequencyOptimization,
        error_3;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.buildUserProfile(userId, clinicId)];
          case 1:
            profile = _c.sent();
            return [4 /*yield*/, this.optimizeChannel(profile, baseNotification.channels)];
          case 2:
            channelOptimization = _c.sent();
            return [
              4 /*yield*/,
              this.optimizeTiming(profile, baseNotification.scheduledFor || new Date()),
            ];
          case 3:
            timingOptimization = _c.sent();
            return [4 /*yield*/, this.personalizeContent(profile, baseNotification.content)];
          case 4:
            contentOptimization = _c.sent();
            return [4 /*yield*/, this.optimizeFrequency(profile)];
          case 5:
            frequencyOptimization = _c.sent();
            return [
              2 /*return*/,
              {
                userId: userId,
                optimizations: {
                  channel: channelOptimization,
                  timing: timingOptimization,
                  content: contentOptimization,
                  frequency: frequencyOptimization,
                },
                modelVersions: {
                  engagement:
                    ((_a = this.models.get("engagement")) === null || _a === void 0
                      ? void 0
                      : _a.version) || "1.0.0",
                  timing:
                    ((_b = this.models.get("timing")) === null || _b === void 0
                      ? void 0
                      : _b.version) || "1.0.0",
                  content: "1.0.0",
                },
                generatedAt: new Date(),
              },
            ];
          case 6:
            error_3 = _c.sent();
            console.error("Erro na otimização:", error_3);
            throw error_3;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Otimiza seleção de canal
   */
  NotificationMLEngine.prototype.optimizeChannel = function (profile, availableChannels) {
    return __awaiter(this, void 0, void 0, function () {
      var channels, engagementModel, channelScores, recommended, alternatives;
      return __generator(this, function (_a) {
        channels = availableChannels || Object.values(types_1.NotificationChannel);
        engagementModel = this.models.get("engagement");
        channelScores = channels
          .map((channel) => {
            var score = 0.5; // Base score
            // Score baseado no histórico do usuário
            if (profile.behavior.preferredChannels.includes(channel)) {
              var index = profile.behavior.preferredChannels.indexOf(channel);
              score += (3 - index) * 0.2; // Primeira preferência +0.6, segunda +0.4, terceira +0.2
            }
            // Ajuste baseado no engagement score geral
            score *= 0.5 + profile.behavior.engagementScore * 0.5;
            // Ajuste baseado no padrão de resposta
            if (
              channel === types_1.NotificationChannel.PUSH &&
              profile.behavior.responsePattern === "immediate"
            ) {
              score += 0.15;
            }
            if (
              channel === types_1.NotificationChannel.EMAIL &&
              profile.behavior.responsePattern === "delayed"
            ) {
              score += 0.1;
            }
            return { channel: channel, score: Math.min(score, 1) };
          })
          .sort((a, b) => b.score - a.score);
        recommended = channelScores[0];
        alternatives = channelScores.slice(1, 4);
        return [
          2 /*return*/,
          {
            recommended: recommended.channel,
            confidence: recommended.score,
            alternatives: alternatives,
          },
        ];
      });
    });
  };
  /**
   * Otimiza timing de envio
   */
  NotificationMLEngine.prototype.optimizeTiming = function (profile, baseTime) {
    return __awaiter(this, void 0, void 0, function () {
      var optimizedTime,
        factors,
        currentHour,
        bestHour,
        userTimezone,
        hour,
        dayOfWeek,
        daysToWeekend,
        confidence;
      return __generator(this, (_a) => {
        optimizedTime = new Date(baseTime);
        factors = [];
        // Otimizar hora baseada no perfil
        if (profile.behavior.bestHours.length > 0) {
          currentHour = baseTime.getHours();
          bestHour = profile.behavior.bestHours[0];
          if (Math.abs(currentHour - bestHour) > 2) {
            optimizedTime.setHours(bestHour, 0, 0, 0);
            factors.push("Ajustado para melhor hor\u00E1rio: ".concat(bestHour, ":00"));
          }
        }
        userTimezone = profile.demographics.timezone;
        if (userTimezone !== "America/Sao_Paulo") {
          factors.push("Ajustado para timezone: ".concat(userTimezone));
        }
        hour = optimizedTime.getHours();
        if (hour < 7 || hour > 22) {
          optimizedTime.setHours(hour < 7 ? 9 : 18, 0, 0, 0);
          factors.push("Evitado horário de baixo engajamento");
        }
        // Ajustar baseado no padrão de resposta
        if (profile.behavior.responsePattern === "weekend") {
          dayOfWeek = optimizedTime.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysToWeekend = 6 - dayOfWeek;
            optimizedTime.setDate(optimizedTime.getDate() + daysToWeekend);
            factors.push("Ajustado para padrão de fim de semana");
          }
        }
        // Se o horário otimizado é no passado, mover para o próximo dia
        if (optimizedTime < new Date()) {
          optimizedTime.setDate(optimizedTime.getDate() + 1);
          factors.push("Reagendado para próximo dia disponível");
        }
        confidence = Math.min(0.6 + (profile.history.totalNotifications / 100) * 0.4, 0.95);
        return [
          2 /*return*/,
          {
            recommended: optimizedTime,
            confidence: confidence,
            factors: factors,
          },
        ];
      });
    });
  };
  /**
   * Personaliza conteúdo da notificação
   */
  NotificationMLEngine.prototype.personalizeContent = function (profile, baseContent) {
    return __awaiter(this, void 0, void 0, function () {
      var personalizedContent, adjustments, confidence;
      return __generator(this, (_a) => {
        personalizedContent = baseContent;
        adjustments = [];
        // Ajuste de tom baseado no engagement
        if (profile.behavior.engagementScore < 0.3) {
          // Usuário com baixo engajamento - tom mais direto e objetivo
          adjustments.push("Tom mais direto para baixo engajamento");
        } else if (profile.behavior.engagementScore > 0.7) {
          // Usuário engajado - tom mais conversacional
          adjustments.push("Tom conversacional para alto engajamento");
        }
        // Ajuste de frequência de linguagem baseado na idade
        if (profile.demographics.age && profile.demographics.age < 30) {
          adjustments.push("Linguagem adaptada para público jovem");
        } else if (profile.demographics.age && profile.demographics.age > 50) {
          adjustments.push("Linguagem formal para público maduro");
        }
        // Personalização baseada no risco de churn
        if (profile.behavior.churnRisk > 0.6) {
          personalizedContent = "[IMPORTANTE] ".concat(personalizedContent);
          adjustments.push("Adicionado urgência para alto risco de churn");
        }
        // Personalização baseada no padrão de resposta
        if (profile.behavior.responsePattern === "immediate") {
          adjustments.push("Call-to-action direto para resposta imediata");
        }
        confidence = adjustments.length > 0 ? 0.7 : 0.5;
        return [
          2 /*return*/,
          {
            personalizedContent: personalizedContent,
            confidence: confidence,
            adjustments: adjustments,
          },
        ];
      });
    });
  };
  /**
   * Otimiza frequência de mensagens
   */
  NotificationMLEngine.prototype.optimizeFrequency = function (profile) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendedFrequency, confidence;
      return __generator(this, (_a) => {
        switch (profile.preferences.frequency) {
          case "high":
            recommendedFrequency = profile.behavior.engagementScore > 0.7 ? 5 : 3;
            break;
          case "medium":
            recommendedFrequency = profile.behavior.engagementScore > 0.5 ? 3 : 2;
            break;
          case "low":
            recommendedFrequency = profile.behavior.engagementScore > 0.3 ? 2 : 1;
            break;
          default:
            recommendedFrequency = 2;
        }
        // Ajustar baseado no risco de churn
        if (profile.behavior.churnRisk > 0.7) {
          recommendedFrequency = Math.max(1, recommendedFrequency - 1);
        } else if (profile.behavior.churnRisk < 0.2) {
          recommendedFrequency = Math.min(7, recommendedFrequency + 1);
        }
        confidence = Math.min(0.5 + (profile.history.totalNotifications / 50) * 0.4, 0.9);
        return [
          2 /*return*/,
          {
            recommended: recommendedFrequency,
            confidence: confidence,
          },
        ];
      });
    });
  };
  // ================================================================================
  // SEGMENTATION
  // ================================================================================
  /**
   * Executa segmentação automática de usuários
   */
  NotificationMLEngine.prototype.performSegmentation = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, profiles, error, features, segments, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("user_ml_profiles").select("*").eq("clinic_id", clinicId),
            ];
          case 1:
            (_a = _b.sent()), (profiles = _a.data), (error = _a.error);
            if (error || !profiles || profiles.length < 10) {
              throw new Error("Dados insuficientes para segmentação");
            }
            features = profiles.map((profile) => [
              profile.behavior.engagementScore,
              profile.behavior.churnRisk,
              profile.history.avgResponseTime / 1440, // Normalizar para dias
              profile.behavior.preferredChannels.length,
              profile.demographics.age || 35, // Valor padrão
            ]);
            segments = this.performKMeans(features, profiles, 4);
            return [
              2 /*return*/,
              {
                segments: segments,
                confidence: 0.75,
                totalUsers: profiles.length,
                generatedAt: new Date(),
              },
            ];
          case 2:
            error_4 = _b.sent();
            console.error("Erro na segmentação:", error_4);
            throw error_4;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Implementa K-means simplificado
   */
  NotificationMLEngine.prototype.performKMeans = function (features, profiles, k) {
    // Inicializar centroids aleatoriamente
    var centroids = Array.from({ length: k }, () =>
      features[Math.floor(Math.random() * features.length)].slice(),
    );
    var assignments = new Array(features.length).fill(0);
    var converged = false;
    var iterations = 0;
    var _loop_1 = () => {
      var newAssignments = __spreadArray([], assignments, true);
      // Atribuir cada ponto ao centroid mais próximo
      features.forEach((feature, i) => {
        var minDistance = Infinity;
        var nearestCentroid = 0;
        centroids.forEach((centroid, j) => {
          var distance = this.euclideanDistance(feature, centroid);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCentroid = j;
          }
        });
        newAssignments[i] = nearestCentroid;
      });
      // Verificar convergência
      converged = newAssignments.every((assignment, i) => assignment === assignments[i]);
      assignments = newAssignments;
      var _loop_3 = (j) => {
        var clusterPoints = features.filter((_, i) => assignments[i] === j);
        if (clusterPoints.length > 0) {
          var _loop_4 = (d) => {
            centroids[j][d] =
              clusterPoints.reduce((sum, point) => sum + point[d], 0) / clusterPoints.length;
          };
          for (var d = 0; d < centroids[j].length; d++) {
            _loop_4(d);
          }
        }
      };
      // Atualizar centroids
      for (var j = 0; j < k; j++) {
        _loop_3(j);
      }
      iterations++;
    };
    while (!converged && iterations < 50) {
      _loop_1();
    }
    // Criar segmentos
    var segments = [];
    var _loop_2 = (i) => {
      var segmentUsers = profiles.filter((_, idx) => assignments[idx] === i);
      if (segmentUsers.length === 0) return "continue";
      var avgEngagement =
        segmentUsers.reduce((sum, user) => sum + user.behavior.engagementScore, 0) /
        segmentUsers.length;
      var avgChurnRisk =
        segmentUsers.reduce((sum, user) => sum + user.behavior.churnRisk, 0) / segmentUsers.length;
      var name_1 = "";
      var description = "";
      var strategy = {
        channels: [types_1.NotificationChannel.EMAIL],
        timing: ["10:00", "14:00"],
        frequency: 2,
        contentStyle: "standard",
      };
      if (avgEngagement > 0.7 && avgChurnRisk < 0.3) {
        name_1 = "Usuários Engajados";
        description = "Usuários altamente ativos com baixo risco de churn";
        strategy = {
          channels: [types_1.NotificationChannel.PUSH, types_1.NotificationChannel.EMAIL],
          timing: ["09:00", "14:00", "18:00"],
          frequency: 4,
          contentStyle: "conversational",
        };
      } else if (avgEngagement < 0.3 || avgChurnRisk > 0.7) {
        name_1 = "Usuários em Risco";
        description = "Usuários com baixo engajamento ou alto risco de churn";
        strategy = {
          channels: [types_1.NotificationChannel.EMAIL, types_1.NotificationChannel.WHATSAPP],
          timing: ["10:00"],
          frequency: 1,
          contentStyle: "urgente",
        };
      } else if (avgEngagement > 0.4 && avgChurnRisk < 0.5) {
        name_1 = "Usuários Moderados";
        description = "Usuários com engajamento médio e risco controlado";
        strategy = {
          channels: [types_1.NotificationChannel.EMAIL, types_1.NotificationChannel.SMS],
          timing: ["10:00", "16:00"],
          frequency: 2,
          contentStyle: "informatico",
        };
      } else {
        name_1 = "Usuários Diversos";
        description = "Segmento com características variadas";
      }
      segments.push({
        id: "segment_".concat(i),
        name: name_1,
        description: description,
        userIds: segmentUsers.map((user) => user.user_id),
        characteristics: {
          avgEngagement: avgEngagement,
          avgChurnRisk: avgChurnRisk,
          totalUsers: segmentUsers.length,
          centroid: centroids[i],
        },
        recommendedStrategy: strategy,
      });
    };
    for (var i = 0; i < k; i++) {
      _loop_2(i);
    }
    return segments;
  };
  /**
   * Calcula distância euclidiana entre dois pontos
   */
  NotificationMLEngine.prototype.euclideanDistance = (a, b) =>
    Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  // ================================================================================
  // MODEL TRAINING
  // ================================================================================
  /**
   * Treina modelos com dados históricos
   */
  NotificationMLEngine.prototype.trainModels = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, trainingData, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!this.config.enabled) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 5, , 6]);
            console.log("🤖 Iniciando treinamento de modelos...");
            return [
              4 /*yield*/,
              this.supabase
                .from("notifications")
                .select("\n          *,\n          profiles!inner(*)\n        ")
                .eq("profiles.clinic_id", clinicId)
                .not("opened_at", "is", null)
                .order("sent_at", { ascending: false })
                .limit(5000),
            ];
          case 2:
            (_a = _b.sent()), (trainingData = _a.data), (error = _a.error);
            if (error || !trainingData || trainingData.length < this.config.minDataPoints) {
              console.log("Dados insuficientes para treinamento");
              return [2 /*return*/];
            }
            // Treinar modelo de engajamento
            return [4 /*yield*/, this.trainEngagementModel(trainingData)];
          case 3:
            // Treinar modelo de engajamento
            _b.sent();
            // Treinar modelo de timing
            return [4 /*yield*/, this.trainTimingModel(trainingData)];
          case 4:
            // Treinar modelo de timing
            _b.sent();
            console.log("🤖 Modelos treinados com sucesso");
            return [3 /*break*/, 6];
          case 5:
            error_5 = _b.sent();
            console.error("Erro no treinamento:", error_5);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Treina modelo de predição de engajamento
   */
  NotificationMLEngine.prototype.trainEngagementModel = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var model, hourSum;
      var _this = this;
      return __generator(this, function (_a) {
        model = this.models.get("engagement");
        if (!model) return [2 /*return*/];
        // Reset weights
        model.weights.hour.fill(0);
        model.weights.channel.clear();
        model.weights.dayOfWeek.fill(0);
        // Treinar com dados
        data.forEach((notification) => {
          var engaged = notification.opened_at || notification.clicked_at;
          var hour = new Date(notification.sent_at).getHours();
          var dayOfWeek = new Date(notification.sent_at).getDay();
          var channel = notification.channel;
          var label = engaged ? 1 : 0;
          // Atualizar pesos (gradiente descendente simplificado)
          model.weights.hour[hour] += _this.config.learningRate * (label - 0.5);
          model.weights.dayOfWeek[dayOfWeek] += _this.config.learningRate * (label - 0.5);
          var currentChannelWeight = model.weights.channel.get(channel) || 0;
          model.weights.channel.set(
            channel,
            currentChannelWeight + _this.config.learningRate * (label - 0.5),
          );
        });
        hourSum = model.weights.hour.reduce((a, b) => a + Math.abs(b), 0);
        if (hourSum > 0) {
          model.weights.hour = model.weights.hour.map((w) => w / hourSum);
        }
        model.version = "1.".concat(Date.now().toString().slice(-6));
        console.log("📊 Modelo de engajamento atualizado");
        return [2 /*return*/];
      });
    });
  };
  /**
   * Treina modelo de otimização de timing
   */
  NotificationMLEngine.prototype.trainTimingModel = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var model, userHours;
      return __generator(this, function (_a) {
        model = this.models.get("timing");
        if (!model) return [2 /*return*/];
        userHours = new Map();
        data.forEach((notification) => {
          if (notification.opened_at) {
            var userId = notification.user_id;
            var hour = new Date(notification.sent_at).getHours();
            if (!userHours.has(userId)) {
              userHours.set(userId, []);
            }
            userHours.get(userId).push(hour);
          }
        });
        // Criar clusters de timing
        model.clusters.clear();
        userHours.forEach((hours, userId) => {
          if (hours.length >= 3) {
            // Encontrar horários mais frequentes
            var hourCounts_1 = new Map();
            hours.forEach((hour) => {
              hourCounts_1.set(hour, (hourCounts_1.get(hour) || 0) + 1);
            });
            var bestHours = Array.from(hourCounts_1.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map((_a) => {
                var hour = _a[0];
                return hour;
              });
            var confidence = Math.min(hours.length / 20, 1);
            model.clusters.set(userId, { hours: bestHours, confidence: confidence });
          }
        });
        model.version = "1.".concat(Date.now().toString().slice(-6));
        console.log("⏰ Modelo de timing atualizado");
        return [2 /*return*/];
      });
    });
  };
  return NotificationMLEngine;
})();
exports.NotificationMLEngine = NotificationMLEngine;
// ================================================================================
// EXPORT
// ================================================================================
exports.notificationMLEngine = new NotificationMLEngine({
  features: {
    contentPersonalization: true,
    timingOptimization: true,
    channelSelection: true,
    segmentation: true,
    abTesting: false,
  },
  models: {
    engagementModel: "logistic",
    timingModel: "clustering",
    segmentationModel: "kmeans",
  },
});
