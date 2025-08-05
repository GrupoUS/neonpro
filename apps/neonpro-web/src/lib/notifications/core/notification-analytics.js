"use strict";
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAnalytics = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../auth/audit/audit-logger");
var NotificationAnalytics = /** @class */ (function () {
  function NotificationAnalytics() {
    this.metricsCache = new Map();
    this.cacheTimeout = 300000; // 5 minutos
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditLogger = new audit_logger_1.AuditLogger();
  }
  /**
   * Obtém métricas gerais de notificações
   */
  NotificationAnalytics.prototype.getOverallMetrics = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, cached, query, _a, data, error, metrics, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "overall_metrics_".concat(JSON.stringify(filters));
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            query = this.buildBaseQuery("notification_logs", filters);
            return [4 /*yield*/, query];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            metrics = this.calculateMetrics(data);
            this.setCache(cacheKey, metrics);
            return [2 /*return*/, metrics];
          case 3:
            error_1 = _b.sent();
            throw new Error("Erro ao obter m\u00E9tricas gerais: ".concat(error_1));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas por canal
   */
  NotificationAnalytics.prototype.getChannelMetrics = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        channels,
        channelMetrics,
        _i,
        channels_1,
        channel,
        channelFilters,
        query,
        _a,
        data,
        error,
        metrics,
        volumeTrend,
        performanceTrend,
        error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "channel_metrics_".concat(JSON.stringify(filters));
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 8, , 9]);
            channels = ["email", "sms", "push", "whatsapp", "in_app"];
            channelMetrics = [];
            (_i = 0), (channels_1 = channels);
            _b.label = 2;
          case 2:
            if (!(_i < channels_1.length)) return [3 /*break*/, 7];
            channel = channels_1[_i];
            channelFilters = __assign(__assign({}, filters), { channels: [channel] });
            query = this.buildBaseQuery("notification_logs", channelFilters);
            return [4 /*yield*/, query];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            metrics = this.calculateMetrics(data);
            return [4 /*yield*/, this.getVolumeTrend(channel, filters)];
          case 4:
            volumeTrend = _b.sent();
            return [4 /*yield*/, this.getPerformanceTrend(channel, filters)];
          case 5:
            performanceTrend = _b.sent();
            channelMetrics.push({
              channel: channel,
              metrics: metrics,
              volume_trend: volumeTrend,
              performance_trend: performanceTrend,
            });
            _b.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 2];
          case 7:
            this.setCache(cacheKey, channelMetrics);
            return [2 /*return*/, channelMetrics];
          case 8:
            error_2 = _b.sent();
            throw new Error("Erro ao obter m\u00E9tricas por canal: ".concat(error_2));
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de engajamento do usuário
   */
  NotificationAnalytics.prototype.getUserEngagementMetrics = function (userId, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        data,
        error,
        userGroups,
        userMetrics,
        _i,
        _b,
        _c,
        userId_1,
        notifications,
        metrics,
        error_3;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("notification_logs")
              .select(
                "\n          user_id,\n          channel,\n          status,\n          sent_at,\n          delivered_at,\n          opened_at,\n          clicked_at\n        ",
              );
            if (userId) {
              query = query.eq("user_id", userId);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.start_date) {
              query = query.gte("sent_at", filters.start_date.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.end_date) {
              query = query.lte("sent_at", filters.end_date.toISOString());
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _d.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            userGroups = data.reduce(function (groups, notification) {
              var userId = notification.user_id;
              if (!groups[userId]) {
                groups[userId] = [];
              }
              groups[userId].push(notification);
              return groups;
            }, {});
            userMetrics = [];
            for (_i = 0, _b = Object.entries(userGroups); _i < _b.length; _i++) {
              (_c = _b[_i]), (userId_1 = _c[0]), (notifications = _c[1]);
              metrics = this.calculateUserEngagement(userId_1, notifications);
              userMetrics.push(metrics);
            }
            return [
              2 /*return*/,
              userMetrics.sort(function (a, b) {
                return b.engagement_score - a.engagement_score;
              }),
            ];
          case 2:
            error_3 = _d.sent();
            throw new Error("Erro ao obter m\u00E9tricas de engajamento: ".concat(error_3));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de templates
   */
  NotificationAnalytics.prototype.getTemplateMetrics = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        data,
        error,
        templateGroups,
        templateMetrics,
        _i,
        _b,
        _c,
        templateId,
        group,
        metrics,
        error_4;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("notification_logs")
              .select(
                "\n          template_id,\n          template_name,\n          status,\n          sent_at,\n          delivered_at,\n          opened_at,\n          clicked_at,\n          cost\n        ",
              )
              .not("template_id", "is", null);
            if (filters === null || filters === void 0 ? void 0 : filters.start_date) {
              query = query.gte("sent_at", filters.start_date.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.end_date) {
              query = query.lte("sent_at", filters.end_date.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.template_ids) {
              query = query.in("template_id", filters.template_ids);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _d.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            templateGroups = data.reduce(function (groups, notification) {
              var templateId = notification.template_id;
              if (!groups[templateId]) {
                groups[templateId] = {
                  template_name: notification.template_name,
                  notifications: [],
                };
              }
              groups[templateId].notifications.push(notification);
              return groups;
            }, {});
            templateMetrics = [];
            for (_i = 0, _b = Object.entries(templateGroups); _i < _b.length; _i++) {
              (_c = _b[_i]), (templateId = _c[0]), (group = _c[1]);
              metrics = this.calculateMetrics(group.notifications);
              templateMetrics.push({
                template_id: templateId,
                template_name: group.template_name,
                usage_count: group.notifications.length,
                metrics: metrics,
              });
            }
            return [
              2 /*return*/,
              templateMetrics.sort(function (a, b) {
                return b.usage_count - a.usage_count;
              }),
            ];
          case 2:
            error_4 = _d.sent();
            throw new Error("Erro ao obter m\u00E9tricas de templates: ".concat(error_4));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de campanhas
   */
  NotificationAnalytics.prototype.getCampaignMetrics = function (campaignId, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        data,
        error,
        campaignGroups,
        campaignMetrics,
        _i,
        _b,
        _c,
        campaignId_1,
        group,
        notifications,
        metrics,
        channelBreakdown,
        geographicBreakdown,
        demographicBreakdown,
        dates,
        startDate,
        endDate,
        error_5;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("notification_logs")
              .select(
                "\n          campaign_id,\n          campaign_name,\n          channel,\n          status,\n          sent_at,\n          delivered_at,\n          opened_at,\n          clicked_at,\n          cost,\n          user_metadata\n        ",
              )
              .not("campaign_id", "is", null);
            if (campaignId) {
              query = query.eq("campaign_id", campaignId);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.start_date) {
              query = query.gte("sent_at", filters.start_date.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.end_date) {
              query = query.lte("sent_at", filters.end_date.toISOString());
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _d.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            campaignGroups = data.reduce(function (groups, notification) {
              var campaignId = notification.campaign_id;
              if (!groups[campaignId]) {
                groups[campaignId] = {
                  campaign_name: notification.campaign_name,
                  notifications: [],
                };
              }
              groups[campaignId].notifications.push(notification);
              return groups;
            }, {});
            campaignMetrics = [];
            for (_i = 0, _b = Object.entries(campaignGroups); _i < _b.length; _i++) {
              (_c = _b[_i]), (campaignId_1 = _c[0]), (group = _c[1]);
              notifications = group.notifications;
              metrics = this.calculateMetrics(notifications);
              channelBreakdown = this.calculateChannelBreakdown(notifications);
              geographicBreakdown = this.calculateGeographicBreakdown(notifications);
              demographicBreakdown = this.calculateDemographicBreakdown(notifications);
              dates = notifications
                .map(function (n) {
                  return new Date(n.sent_at);
                })
                .sort();
              startDate = dates[0];
              endDate = dates[dates.length - 1];
              campaignMetrics.push({
                campaign_id: campaignId_1,
                campaign_name: group.campaign_name,
                start_date: startDate,
                end_date: endDate,
                total_recipients: new Set(
                  notifications.map(function (n) {
                    return n.user_id;
                  }),
                ).size,
                metrics: metrics,
                channel_breakdown: channelBreakdown,
                geographic_breakdown: geographicBreakdown,
                demographic_breakdown: demographicBreakdown,
              });
            }
            return [2 /*return*/, campaignMetrics];
          case 2:
            error_5 = _d.sent();
            throw new Error("Erro ao obter m\u00E9tricas de campanhas: ".concat(error_5));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas em tempo real
   */
  NotificationAnalytics.prototype.getRealTimeMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        oneHourAgo,
        oneMinuteAgo,
        queueData,
        recentData,
        errorData,
        totalHourData,
        activeChannels,
        uniqueChannels,
        errorRate,
        systemHealth,
        error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            now = new Date();
            oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase.from("scheduled_notifications").select("id").eq("status", "pending"),
            ];
          case 1:
            queueData = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_logs")
                .select("sent_at")
                .gte("sent_at", oneMinuteAgo.toISOString()),
            ];
          case 2:
            recentData = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_logs")
                .select("status")
                .gte("sent_at", oneHourAgo.toISOString())
                .eq("status", "failed"),
            ];
          case 3:
            errorData = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_logs")
                .select("status")
                .gte("sent_at", oneHourAgo.toISOString()),
            ];
          case 4:
            totalHourData = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_logs")
                .select("channel")
                .gte("sent_at", oneHourAgo.toISOString())
                .not("channel", "is", null),
            ];
          case 5:
            activeChannels = _a.sent().data;
            uniqueChannels = __spreadArray(
              [],
              new Set(
                (activeChannels === null || activeChannels === void 0
                  ? void 0
                  : activeChannels.map(function (c) {
                      return c.channel;
                    })) || [],
              ),
              true,
            );
            errorRate = (
              totalHourData === null || totalHourData === void 0
                ? void 0
                : totalHourData.length
            )
              ? (((errorData === null || errorData === void 0 ? void 0 : errorData.length) || 0) /
                  totalHourData.length) *
                100
              : 0;
            systemHealth = errorRate > 10 ? "critical" : errorRate > 5 ? "warning" : "healthy";
            return [
              2 /*return*/,
              {
                current_queue_size:
                  (queueData === null || queueData === void 0 ? void 0 : queueData.length) || 0,
                processing_rate_per_minute:
                  (recentData === null || recentData === void 0 ? void 0 : recentData.length) || 0,
                error_rate_last_hour: errorRate,
                average_response_time_ms: 150, // Simulado
                active_channels: uniqueChannels,
                system_health: systemHealth,
                last_updated: now,
              },
            ];
          case 6:
            error_6 = _a.sent();
            throw new Error("Erro ao obter m\u00E9tricas em tempo real: ".concat(error_6));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera relatório de performance
   */
  NotificationAnalytics.prototype.generatePerformanceReport = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, summary, channels, templates, userEngagement, trends, recommendations, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              Promise.all([
                this.getOverallMetrics(filters),
                this.getChannelMetrics(filters),
                this.getTemplateMetrics(filters),
                this.getUserEngagementMetrics(undefined, filters),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (summary = _a[0]),
              (channels = _a[1]),
              (templates = _a[2]),
              (userEngagement = _a[3]);
            return [4 /*yield*/, this.getMetricsTrends(filters)];
          case 2:
            trends = _b.sent();
            recommendations = this.generateRecommendations(summary, channels);
            return [
              2 /*return*/,
              {
                summary: summary,
                channels: channels,
                top_templates: templates.slice(0, 10),
                user_engagement: userEngagement.slice(0, 100),
                trends: trends,
                recommendations: recommendations,
              },
            ];
          case 3:
            error_7 = _b.sent();
            throw new Error("Erro ao gerar relat\u00F3rio: ".concat(error_7));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos privados
  NotificationAnalytics.prototype.buildBaseQuery = function (table, filters) {
    var query = this.supabase.from(table).select("*");
    if (filters === null || filters === void 0 ? void 0 : filters.start_date) {
      query = query.gte("sent_at", filters.start_date.toISOString());
    }
    if (filters === null || filters === void 0 ? void 0 : filters.end_date) {
      query = query.lte("sent_at", filters.end_date.toISOString());
    }
    if (filters === null || filters === void 0 ? void 0 : filters.channels) {
      query = query.in("channel", filters.channels);
    }
    if (filters === null || filters === void 0 ? void 0 : filters.user_ids) {
      query = query.in("user_id", filters.user_ids);
    }
    if (filters === null || filters === void 0 ? void 0 : filters.status) {
      query = query.in("status", filters.status);
    }
    return query;
  };
  NotificationAnalytics.prototype.calculateMetrics = function (data) {
    var total_sent = data.length;
    var total_delivered = data.filter(function (n) {
      return n.delivered_at;
    }).length;
    var total_opened = data.filter(function (n) {
      return n.opened_at;
    }).length;
    var total_clicked = data.filter(function (n) {
      return n.clicked_at;
    }).length;
    var total_failed = data.filter(function (n) {
      return n.status === "failed";
    }).length;
    var delivery_rate = total_sent > 0 ? (total_delivered / total_sent) * 100 : 0;
    var open_rate = total_delivered > 0 ? (total_opened / total_delivered) * 100 : 0;
    var click_rate = total_opened > 0 ? (total_clicked / total_opened) * 100 : 0;
    var failure_rate = total_sent > 0 ? (total_failed / total_sent) * 100 : 0;
    // Tempo médio de entrega
    var deliveredNotifications = data.filter(function (n) {
      return n.sent_at && n.delivered_at;
    });
    var average_delivery_time_minutes = 0;
    if (deliveredNotifications.length > 0) {
      var totalDeliveryTime = deliveredNotifications.reduce(function (sum, n) {
        var sentTime = new Date(n.sent_at).getTime();
        var deliveredTime = new Date(n.delivered_at).getTime();
        return sum + (deliveredTime - sentTime);
      }, 0);
      average_delivery_time_minutes =
        totalDeliveryTime / deliveredNotifications.length / (1000 * 60);
    }
    // Custo
    var total_cost = data.reduce(function (sum, n) {
      return sum + (n.cost || 0);
    }, 0);
    var cost_per_notification = total_sent > 0 ? total_cost / total_sent : 0;
    return {
      total_sent: total_sent,
      total_delivered: total_delivered,
      total_opened: total_opened,
      total_clicked: total_clicked,
      total_failed: total_failed,
      delivery_rate: delivery_rate,
      open_rate: open_rate,
      click_rate: click_rate,
      failure_rate: failure_rate,
      average_delivery_time_minutes: average_delivery_time_minutes,
      total_cost: total_cost,
      cost_per_notification: cost_per_notification,
    };
  };
  NotificationAnalytics.prototype.calculateUserEngagement = function (userId, notifications) {
    var _a;
    var total_received = notifications.length;
    var total_opened = notifications.filter(function (n) {
      return n.opened_at;
    }).length;
    var total_clicked = notifications.filter(function (n) {
      return n.clicked_at;
    }).length;
    // Score de engajamento (0-100)
    var engagement_score =
      total_received > 0 ? ((total_opened * 0.6 + total_clicked * 0.4) / total_received) * 100 : 0;
    // Canal preferido
    var channelCounts = notifications.reduce(function (counts, n) {
      counts[n.channel] = (counts[n.channel] || 0) + 1;
      return counts;
    }, {});
    var preferred_channel =
      ((_a = Object.entries(channelCounts).sort(function (_a, _b) {
        var a = _a[1];
        var b = _b[1];
        return b - a;
      })[0]) === null || _a === void 0
        ? void 0
        : _a[0]) || "email";
    // Horário preferido (simulado)
    var preferred_time = "14:00";
    // Última interação
    var interactions = notifications.filter(function (n) {
      return n.opened_at || n.clicked_at;
    });
    var last_interaction =
      interactions.length > 0
        ? new Date(
            Math.max.apply(
              Math,
              interactions.map(function (n) {
                return new Date(n.clicked_at || n.opened_at).getTime();
              }),
            ),
          )
        : new Date(0);
    return {
      user_id: userId,
      total_received: total_received,
      total_opened: total_opened,
      total_clicked: total_clicked,
      engagement_score: engagement_score,
      preferred_channel: preferred_channel,
      preferred_time: preferred_time,
      last_interaction: last_interaction,
      opt_out_channels: [], // Seria obtido de outra tabela
    };
  };
  NotificationAnalytics.prototype.getVolumeTrend = function (channel, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var trend, now, i, date, dateStr, count;
      return __generator(this, function (_a) {
        trend = [];
        now = new Date();
        for (i = 29; i >= 0; i--) {
          date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          dateStr = date.toISOString().split("T")[0];
          count = Math.floor(Math.random() * 100) + 50;
          trend.push({ date: dateStr, count: count });
        }
        return [2 /*return*/, trend];
      });
    });
  };
  NotificationAnalytics.prototype.getPerformanceTrend = function (channel, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var trend, now, i, date, dateStr, delivery_rate, open_rate;
      return __generator(this, function (_a) {
        trend = [];
        now = new Date();
        for (i = 29; i >= 0; i--) {
          date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          dateStr = date.toISOString().split("T")[0];
          delivery_rate = 85 + Math.random() * 10;
          open_rate = 20 + Math.random() * 15;
          trend.push({ date: dateStr, delivery_rate: delivery_rate, open_rate: open_rate });
        }
        return [2 /*return*/, trend];
      });
    });
  };
  NotificationAnalytics.prototype.calculateChannelBreakdown = function (notifications) {
    var breakdown = {};
    var channels = __spreadArray(
      [],
      new Set(
        notifications.map(function (n) {
          return n.channel;
        }),
      ),
      true,
    );
    var _loop_1 = function (channel) {
      var channelNotifications = notifications.filter(function (n) {
        return n.channel === channel;
      });
      breakdown[channel] = this_1.calculateMetrics(channelNotifications);
    };
    var this_1 = this;
    for (var _i = 0, channels_2 = channels; _i < channels_2.length; _i++) {
      var channel = channels_2[_i];
      _loop_1(channel);
    }
    return breakdown;
  };
  NotificationAnalytics.prototype.calculateGeographicBreakdown = function (notifications) {
    // Implementação simplificada - seria baseada em dados do usuário
    return {
      BR: this.calculateMetrics(notifications.slice(0, Math.floor(notifications.length * 0.8))),
      US: this.calculateMetrics(notifications.slice(Math.floor(notifications.length * 0.8))),
    };
  };
  NotificationAnalytics.prototype.calculateDemographicBreakdown = function (notifications) {
    // Implementação simplificada - seria baseada em dados do usuário
    return {
      "18-25": this.calculateMetrics(
        notifications.slice(0, Math.floor(notifications.length * 0.3)),
      ),
      "26-35": this.calculateMetrics(
        notifications.slice(
          Math.floor(notifications.length * 0.3),
          Math.floor(notifications.length * 0.7),
        ),
      ),
      "36+": this.calculateMetrics(notifications.slice(Math.floor(notifications.length * 0.7))),
    };
  };
  NotificationAnalytics.prototype.getMetricsTrends = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var trends, now, i, date, dateStr, metrics;
      return __generator(this, function (_a) {
        trends = [];
        now = new Date();
        for (i = 29; i >= 0; i--) {
          date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          dateStr = date.toISOString().split("T")[0];
          metrics = {
            total_sent: Math.floor(Math.random() * 1000) + 500,
            total_delivered: 0,
            total_opened: 0,
            total_clicked: 0,
            total_failed: 0,
            delivery_rate: 85 + Math.random() * 10,
            open_rate: 20 + Math.random() * 15,
            click_rate: 5 + Math.random() * 10,
            failure_rate: Math.random() * 5,
            average_delivery_time_minutes: 2 + Math.random() * 3,
            total_cost: Math.random() * 100,
            cost_per_notification: 0.05 + Math.random() * 0.05,
          };
          trends.push({ date: dateStr, metrics: metrics });
        }
        return [2 /*return*/, trends];
      });
    });
  };
  NotificationAnalytics.prototype.generateRecommendations = function (summary, channels) {
    var recommendations = [];
    if (summary.delivery_rate < 90) {
      recommendations.push("Taxa de entrega baixa. Verifique a qualidade das listas de contatos.");
    }
    if (summary.open_rate < 20) {
      recommendations.push("Taxa de abertura baixa. Considere melhorar os assuntos das mensagens.");
    }
    if (summary.click_rate < 5) {
      recommendations.push("Taxa de clique baixa. Revise o conteúdo e calls-to-action.");
    }
    var bestChannel = channels.sort(function (a, b) {
      return b.metrics.open_rate - a.metrics.open_rate;
    })[0];
    if (bestChannel) {
      recommendations.push(
        "Canal ".concat(
          bestChannel.channel,
          " tem melhor performance. Considere aumentar seu uso.",
        ),
      );
    }
    if (summary.cost_per_notification > 0.1) {
      recommendations.push(
        "Custo por notificação alto. Avalie otimizações de canal e segmentação.",
      );
    }
    return recommendations;
  };
  NotificationAnalytics.prototype.getFromCache = function (key) {
    var cached = this.metricsCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  };
  NotificationAnalytics.prototype.setCache = function (key, data) {
    this.metricsCache.set(key, {
      data: data,
      expires: Date.now() + this.cacheTimeout,
    });
  };
  return NotificationAnalytics;
})();
exports.NotificationAnalytics = NotificationAnalytics;
exports.default = NotificationAnalytics;
