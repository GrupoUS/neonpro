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
exports.analyticsNotificationService = exports.AnalyticsNotificationService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var route_1 = require("@/app/api/websocket/route");
// Initialize Supabase client
var supabase = (0, supabase_js_1.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
// Analytics notification templates
var ANALYTICS_NOTIFICATION_TEMPLATES = {
  trial_started: {
    type: "trial_started",
    title: "Trial Iniciado com Sucesso",
    message:
      "Seu trial {{trialType}} foi iniciado e expira em {{endDate}}. Aproveite todos os recursos premium!",
    priority: "medium",
    channels: ["database", "websocket", "email"],
    variables: ["trialType", "endDate"],
  },
  trial_ending: {
    type: "trial_ending",
    title: "Trial Terminando em Breve",
    message:
      "Seu trial {{trialType}} expira em {{daysLeft}} dias. Faça upgrade agora para continuar aproveitando os recursos premium.",
    priority: "high",
    channels: ["database", "websocket", "email", "push"],
    variables: ["trialType", "daysLeft"],
  },
  trial_expired: {
    type: "trial_expired",
    title: "Trial Expirado",
    message:
      "Seu trial {{trialType}} expirou. Faça upgrade para um plano pago para restaurar o acesso aos recursos premium.",
    priority: "urgent",
    channels: ["database", "websocket", "email"],
    variables: ["trialType"],
  },
  trial_converted: {
    type: "trial_converted",
    title: "Bem-vindo ao Premium!",
    message:
      "Parabéns! Seu trial foi convertido com sucesso para uma assinatura {{subscriptionTier}}.",
    priority: "medium",
    channels: ["database", "websocket", "email"],
    variables: ["subscriptionTier"],
  },
  subscription_created: {
    type: "subscription_created",
    title: "Assinatura Ativada",
    message: "Sua assinatura {{subscriptionTier}} foi ativada. Bem-vindo aos recursos premium!",
    priority: "medium",
    channels: ["database", "websocket", "email"],
    variables: ["subscriptionTier"],
  },
  subscription_updated: {
    type: "subscription_updated",
    title: "Assinatura Atualizada",
    message:
      "Sua assinatura foi atualizada para {{newTier}}. As mudanças entram em vigor imediatamente.",
    priority: "medium",
    channels: ["database", "websocket", "email"],
    variables: ["newTier"],
  },
  subscription_cancelled: {
    type: "subscription_cancelled",
    title: "Assinatura Cancelada",
    message: "Sua assinatura foi cancelada. Você manterá o acesso até {{endDate}}.",
    priority: "high",
    channels: ["database", "websocket", "email"],
    variables: ["endDate"],
  },
  payment_successful: {
    type: "payment_successful",
    title: "Pagamento Realizado com Sucesso",
    message: "Seu pagamento de {{amount}} foi processado com sucesso. Obrigado!",
    priority: "low",
    channels: ["database", "websocket"],
    variables: ["amount"],
  },
  payment_failed: {
    type: "payment_failed",
    title: "Falha no Pagamento",
    message:
      "Seu pagamento de {{amount}} não pôde ser processado. Por favor, atualize seu método de pagamento.",
    priority: "urgent",
    channels: ["database", "websocket", "email"],
    variables: ["amount"],
  },
  analytics_milestone: {
    type: "analytics_milestone",
    title: "Marco Alcançado!",
    message: "Parabéns! Você alcançou {{milestone}}. {{details}}",
    priority: "medium",
    channels: ["database", "websocket"],
    variables: ["milestone", "details"],
  },
  system_alert: {
    type: "system_alert",
    title: "Alerta do Sistema",
    message: "{{alertMessage}}",
    priority: "high",
    channels: ["database", "websocket", "email"],
    variables: ["alertMessage"],
  },
  campaign_update: {
    type: "campaign_update",
    title: "Atualização de Campanha",
    message: 'Campanha "{{campaignName}}" foi {{action}}. {{details}}',
    priority: "medium",
    channels: ["database", "websocket"],
    variables: ["campaignName", "action", "details"],
  },
  revenue_milestone: {
    type: "revenue_milestone",
    title: "Meta de Receita Alcançada!",
    message: "Parabéns! Sua receita atingiu {{amount}} este mês. {{details}}",
    priority: "medium",
    channels: ["database", "websocket", "email"],
    variables: ["amount", "details"],
  },
  user_milestone: {
    type: "user_milestone",
    title: "Marco de Usuários Alcançado!",
    message: "Incrível! Você agora tem {{userCount}} usuários ativos. {{details}}",
    priority: "medium",
    channels: ["database", "websocket"],
    variables: ["userCount", "details"],
  },
  conversion_alert: {
    type: "conversion_alert",
    title: "Alerta de Conversão",
    message: "Taxa de conversão {{trend}} para {{rate}}%. {{recommendation}}",
    priority: "high",
    channels: ["database", "websocket", "email"],
    variables: ["trend", "rate", "recommendation"],
  },
  churn_alert: {
    type: "churn_alert",
    title: "Alerta de Churn",
    message: "Taxa de churn {{trend}} para {{rate}}%. {{actionRequired}}",
    priority: "urgent",
    channels: ["database", "websocket", "email"],
    variables: ["trend", "rate", "actionRequired"],
  },
};
var AnalyticsNotificationService = /** @class */ (() => {
  function AnalyticsNotificationService() {}
  /**
   * Send an analytics notification using a template
   */
  AnalyticsNotificationService.sendNotification = function (type_1, userId_1) {
    return __awaiter(this, arguments, void 0, function (type, userId, variables, overrides) {
      var template, title, message, notificationData, error_1;
      if (variables === void 0) {
        variables = {};
      }
      if (overrides === void 0) {
        overrides = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            template = ANALYTICS_NOTIFICATION_TEMPLATES[type];
            if (!template) {
              throw new Error("Unknown notification type: ".concat(type));
            }
            title = this.replaceVariables(template.title, variables);
            message = this.replaceVariables(template.message, variables);
            notificationData = {
              type: type,
              title: title,
              message: message,
              userId: userId,
              priority: overrides.priority || template.priority,
              channels: overrides.channels || template.channels,
              data: variables,
              scheduledFor: overrides.scheduledFor,
              expiresAt: overrides.expiresAt,
              metadata: overrides.metadata,
              clinicId: overrides.clinicId,
            };
            return [4 /*yield*/, this.processNotification(notificationData)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_1 = _a.sent();
            console.error("Error sending analytics notification:", error_1);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send a custom analytics notification
   */
  AnalyticsNotificationService.sendCustomNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.processNotification(data)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_2 = _a.sent();
            console.error("Error sending custom analytics notification:", error_2);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process notification through different channels
   */
  AnalyticsNotificationService.processNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var notificationId, promises;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.saveToDatabase(data)];
          case 1:
            notificationId = _a.sent();
            if (!notificationId) {
              return [2 /*return*/, null];
            }
            promises = data.channels.map((channel) => {
              switch (channel) {
                case "websocket":
                  return _this.sendWebSocketNotification(data);
                case "email":
                  return _this.sendEmailNotification(data);
                case "push":
                  return _this.sendPushNotification(data);
                default:
                  return Promise.resolve();
              }
            });
            return [4 /*yield*/, Promise.allSettled(promises)];
          case 2:
            _a.sent();
            return [2 /*return*/, notificationId];
        }
      });
    });
  };
  /**
   * Save notification to database
   */
  AnalyticsNotificationService.saveToDatabase = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, notification, error, error_3;
      var _b, _c;
      return __generator(this, (_d) => {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("analytics_notifications")
                .insert({
                  type: data.type,
                  title: data.title,
                  message: data.message,
                  user_id: data.userId,
                  clinic_id: data.clinicId,
                  priority: data.priority,
                  channels: data.channels,
                  data: data.data || {},
                  scheduled_for:
                    (_b = data.scheduledFor) === null || _b === void 0 ? void 0 : _b.toISOString(),
                  expires_at:
                    (_c = data.expiresAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
                  metadata: data.metadata || {},
                  status: "sent",
                  created_at: new Date().toISOString(),
                })
                .select("id")
                .single(),
            ];
          case 1:
            (_a = _d.sent()), (notification = _a.data), (error = _a.error);
            if (error) {
              console.error("Database save error:", error);
              return [2 /*return*/, null];
            }
            return [2 /*return*/, notification.id];
          case 2:
            error_3 = _d.sent();
            console.error("Error saving analytics notification to database:", error_3);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send WebSocket notification
   */
  AnalyticsNotificationService.sendWebSocketNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var wsMessage;
      return __generator(this, (_a) => {
        try {
          wsMessage = {
            type: "analytics_notification",
            notification: {
              id: data.id,
              type: data.type,
              title: data.title,
              message: data.message,
              priority: data.priority,
              data: data.data,
              timestamp: new Date().toISOString(),
            },
          };
          // Send to specific user
          (0, route_1.broadcastToUser)(data.userId, wsMessage);
          // Also broadcast to analytics channel for admin monitoring
          if (data.priority === "urgent" || data.priority === "high") {
            (0, route_1.broadcastToChannel)("analytics", {
              type: "user_analytics_notification",
              userId: data.userId,
              clinicId: data.clinicId,
              notification: wsMessage.notification,
            });
          }
        } catch (error) {
          console.error("WebSocket analytics notification error:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Send email notification
   */
  AnalyticsNotificationService.sendEmailNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, user, error, analyticsEmailPrefs, error_4;
      var _b;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              supabase
                .from("users")
                .select("email, email_preferences, analytics_email_preferences")
                .eq("id", data.userId)
                .single(),
            ];
          case 1:
            (_a = _c.sent()), (user = _a.data), (error = _a.error);
            if (error || !user) {
              console.error("User not found for analytics email notification:", error);
              return [2 /*return*/];
            }
            analyticsEmailPrefs = user.analytics_email_preferences || {};
            if (analyticsEmailPrefs[data.type] === false) {
              console.log(
                "Analytics email notifications disabled for "
                  .concat(data.type, " by user ")
                  .concat(data.userId),
              );
              return [2 /*return*/];
            }
            // Queue email for sending
            return [
              4 /*yield*/,
              supabase.from("email_queue").insert({
                to_email: user.email,
                subject: data.title,
                body: data.message,
                template_type: "analytics_".concat(data.type),
                template_data: data.data || {},
                priority: data.priority,
                category: "analytics",
                scheduled_for:
                  ((_b = data.scheduledFor) === null || _b === void 0
                    ? void 0
                    : _b.toISOString()) || new Date().toISOString(),
              }),
            ];
          case 2:
            // Queue email for sending
            _c.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _c.sent();
            console.error("Analytics email notification error:", error_4);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send push notification
   */
  AnalyticsNotificationService.sendPushNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, tokens, error, pushJobs, error_5;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              supabase
                .from("push_tokens")
                .select("token, platform")
                .eq("user_id", data.userId)
                .eq("active", true),
            ];
          case 1:
            (_a = _b.sent()), (tokens = _a.data), (error = _a.error);
            if (error || !tokens || tokens.length === 0) {
              console.log("No push tokens found for user ".concat(data.userId));
              return [2 /*return*/];
            }
            pushJobs = tokens.map((tokenData) => {
              var _a;
              return {
                token: tokenData.token,
                platform: tokenData.platform,
                title: data.title,
                body: data.message,
                data: data.data || {},
                priority: data.priority,
                category: "analytics",
                scheduled_for:
                  ((_a = data.scheduledFor) === null || _a === void 0
                    ? void 0
                    : _a.toISOString()) || new Date().toISOString(),
              };
            });
            return [4 /*yield*/, supabase.from("push_queue").insert(pushJobs)];
          case 2:
            _b.sent();
            return [3 /*break*/, 4];
          case 3:
            error_5 = _b.sent();
            console.error("Analytics push notification error:", error_5);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Replace variables in template strings
   */
  AnalyticsNotificationService.replaceVariables = (template, variables) =>
    template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      var _a;
      return ((_a = variables[key]) === null || _a === void 0 ? void 0 : _a.toString()) || match;
    });
  /**
   * Mark analytics notification as read
   */
  AnalyticsNotificationService.markAsRead = function (notificationId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("analytics_notifications")
                .update({
                  read_at: new Date().toISOString(),
                  status: "read",
                })
                .eq("id", notificationId)
                .eq("user_id", userId),
            ];
          case 1:
            error = _a.sent().error;
            return [2 /*return*/, !error];
          case 2:
            error_6 = _a.sent();
            console.error("Error marking analytics notification as read:", error_6);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get user analytics notifications
   */
  AnalyticsNotificationService.getUserNotifications = function (userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, options) {
      var query, _a, data, error, error_7;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = supabase
              .from("analytics_notifications")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false });
            if (options.clinicId) {
              query = query.eq("clinic_id", options.clinicId);
            }
            if (options.unreadOnly) {
              query = query.is("read_at", null);
            }
            if (options.types && options.types.length > 0) {
              query = query.in("type", options.types);
            }
            if (options.limit) {
              query = query.limit(options.limit);
            }
            if (options.offset) {
              query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching analytics notifications:", error);
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data];
          case 2:
            error_7 = _b.sent();
            console.error("Error in getUserNotifications:", error_7);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get unread analytics notification count
   */
  AnalyticsNotificationService.getUnreadCount = function (userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, count, error, error_8;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = supabase
              .from("analytics_notifications")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId)
              .is("read_at", null);
            if (clinicId) {
              query = query.eq("clinic_id", clinicId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (count = _a.count), (error = _a.error);
            if (error) {
              console.error("Error getting unread analytics count:", error);
              return [2 /*return*/, 0];
            }
            return [2 /*return*/, count || 0];
          case 2:
            error_8 = _b.sent();
            console.error("Error in getUnreadCount:", error_8);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send trial milestone notifications
   */
  AnalyticsNotificationService.sendTrialMilestoneNotification = function (
    userId,
    trialData,
    clinicId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var notificationType, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            notificationType = void 0;
            if (trialData.daysLeft <= 0) {
              notificationType = "trial_expired";
            } else if (trialData.daysLeft <= 3) {
              notificationType = "trial_ending";
            } else {
              return [2 /*return*/]; // No notification needed
            }
            return [
              4 /*yield*/,
              this.sendNotification(
                notificationType,
                userId,
                {
                  trialType: trialData.type,
                  daysLeft: trialData.daysLeft.toString(),
                  endDate: trialData.endDate,
                },
                { clinicId: clinicId },
              ),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_9 = _a.sent();
            console.error("Error sending trial milestone notification:", error_9);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send analytics milestone notifications
   */
  AnalyticsNotificationService.sendAnalyticsMilestone = function (userId, milestone, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var notificationType, variables, trend, churnTrend, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            notificationType = void 0;
            variables = {};
            switch (milestone.type) {
              case "revenue":
                notificationType = "revenue_milestone";
                variables = {
                  amount: "R$ ".concat(milestone.value.toLocaleString("pt-BR")),
                  details: milestone.target
                    ? "Meta: R$ ".concat(milestone.target.toLocaleString("pt-BR"))
                    : "Continue assim!",
                };
                break;
              case "users":
                notificationType = "user_milestone";
                variables = {
                  userCount: milestone.value.toString(),
                  details: "Seu negócio está crescendo!",
                };
                break;
              case "conversion":
                notificationType = "conversion_alert";
                trend = milestone.previousValue
                  ? milestone.value > milestone.previousValue
                    ? "aumentou"
                    : "diminuiu"
                  : "está em";
                variables = {
                  trend: trend,
                  rate: milestone.value.toFixed(1),
                  recommendation:
                    milestone.value < 5
                      ? "Considere otimizar suas campanhas de conversão."
                      : "Excelente performance!",
                };
                break;
              case "churn":
                notificationType = "churn_alert";
                churnTrend = milestone.previousValue
                  ? milestone.value > milestone.previousValue
                    ? "aumentou"
                    : "diminuiu"
                  : "está em";
                variables = {
                  trend: churnTrend,
                  rate: milestone.value.toFixed(1),
                  actionRequired:
                    milestone.value > 10
                      ? "Ação imediata necessária para reduzir o churn."
                      : "Continue monitorando.",
                };
                break;
              default:
                return [2 /*return*/];
            }
            return [
              4 /*yield*/,
              this.sendNotification(notificationType, userId, variables, { clinicId: clinicId }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Error sending analytics milestone notification:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up old analytics notifications
   */
  AnalyticsNotificationService.cleanupOldNotifications = function () {
    return __awaiter(this, arguments, void 0, function (daysOld) {
      var cutoffDate, error, error_11;
      if (daysOld === void 0) {
        daysOld = 30;
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            return [
              4 /*yield*/,
              supabase
                .from("analytics_notifications")
                .delete()
                .lt("created_at", cutoffDate.toISOString()),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error cleaning up old analytics notifications:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Error in cleanupOldNotifications:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return AnalyticsNotificationService;
})();
exports.AnalyticsNotificationService = AnalyticsNotificationService;
// Export singleton instance
exports.analyticsNotificationService = new AnalyticsNotificationService();
