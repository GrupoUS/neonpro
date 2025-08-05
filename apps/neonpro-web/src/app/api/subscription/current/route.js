"use strict";
/**
 * Current Subscription API
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * GET /api/subscription/current - Get current user's subscription details
 * PUT /api/subscription/current - Update subscription settings
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
exports.GET = GET;
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      userClinic,
      _a,
      subscription,
      error,
      usageStats,
      subscriptionStatus,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_clinics")
              .select("clinic_id")
              .eq("user_id", session.user.id)
              .eq("is_active", true)
              .single(),
          ];
        case 3:
          userClinic = _b.sent().data;
          if (!userClinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "No active clinic found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_subscriptions")
              .select(
                "\n        *,\n        plan:subscription_plans(*),\n        usage:subscription_usage(*)\n      ",
              )
              .eq("clinic_id", userClinic.clinic_id)
              .in("status", ["trial", "active"])
              .single(),
          ];
        case 4:
          (_a = _b.sent()), (subscription = _a.data), (error = _a.error);
          if (error || !subscription) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                data: null,
                message: "No active subscription found",
              }),
            ];
          }
          return [4 /*yield*/, calculateUsageStats(supabase, subscription)];
        case 5:
          usageStats = _b.sent();
          subscriptionStatus = getSubscriptionStatus(subscription);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: __assign(__assign({}, subscription), {
                status_info: subscriptionStatus,
                usage_stats: usageStats,
                formatted_dates: {
                  current_period_start: subscription.current_period_start
                    ? new Date(subscription.current_period_start).toLocaleDateString("pt-BR")
                    : null,
                  current_period_end: subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR")
                    : null,
                  trial_end: subscription.trial_end
                    ? new Date(subscription.trial_end).toLocaleDateString("pt-BR")
                    : null,
                  next_billing_date: subscription.next_billing_date
                    ? new Date(subscription.next_billing_date).toLocaleDateString("pt-BR")
                    : null,
                },
              }),
            }),
          ];
        case 6:
          error_1 = _b.sent();
          console.error("Current subscription API error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      cancel_at_period_end,
      cancellation_reason,
      userClinic,
      updateData,
      _a,
      updatedSubscription,
      error,
      error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          (cancel_at_period_end = body.cancel_at_period_end),
            (cancellation_reason = body.cancellation_reason);
          return [
            4 /*yield*/,
            supabase
              .from("user_clinics")
              .select("clinic_id")
              .eq("user_id", session.user.id)
              .eq("is_active", true)
              .single(),
          ];
        case 4:
          userClinic = _b.sent().data;
          if (!userClinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "No active clinic found" }, { status: 404 }),
            ];
          }
          updateData = {};
          if (cancel_at_period_end !== undefined) {
            updateData.cancel_at_period_end = cancel_at_period_end;
            if (cancel_at_period_end && cancellation_reason) {
              updateData.cancellation_reason = cancellation_reason;
            }
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_subscriptions")
              .update(updateData)
              .eq("clinic_id", userClinic.clinic_id)
              .in("status", ["trial", "active"])
              .select()
              .single(),
          ];
        case 5:
          (_a = _b.sent()), (updatedSubscription = _a.data), (error = _a.error);
          if (error) {
            console.error("Error updating subscription:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to update subscription" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedSubscription,
              message: cancel_at_period_end
                ? "Assinatura serÃ¡ cancelada no final do perÃ­odo atual"
                : "ConfiguraÃ§Ãµes de assinatura atualizadas",
            }),
          ];
        case 6:
          error_2 = _b.sent();
          console.error("Update subscription API error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function calculateUsageStats(supabase, subscription) {
  return __awaiter(this, void 0, void 0, function () {
    var limits, stats, usagePromises, error_3;
    var _this = this;
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          limits = ((_a = subscription.plan) === null || _a === void 0 ? void 0 : _a.limits) || {};
          stats = {};
          _b.label = 1;
        case 1:
          _b.trys.push([1, 3, , 4]);
          usagePromises = Object.keys(limits).map(function (limitKey) {
            return __awaiter(_this, void 0, void 0, function () {
              var currentUsage,
                _a,
                patientCount,
                startOfMonth,
                appointmentCount,
                userCount,
                limit,
                percentage;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    currentUsage = 0;
                    _a = limitKey;
                    switch (_a) {
                      case "max_patients":
                        return [3 /*break*/, 1];
                      case "max_appointments_per_month":
                        return [3 /*break*/, 3];
                      case "max_users":
                        return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                  case 1:
                    return [
                      4 /*yield*/,
                      supabase
                        .from("patients")
                        .select("*", { count: "exact", head: true })
                        .eq("clinic_id", subscription.clinic_id)
                        .eq("is_active", true),
                    ];
                  case 2:
                    patientCount = _b.sent().count;
                    currentUsage = patientCount || 0;
                    return [3 /*break*/, 7];
                  case 3:
                    startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    return [
                      4 /*yield*/,
                      supabase
                        .from("appointments")
                        .select("*", { count: "exact", head: true })
                        .eq("clinic_id", subscription.clinic_id)
                        .gte("appointment_date", startOfMonth.toISOString()),
                    ];
                  case 4:
                    appointmentCount = _b.sent().count;
                    currentUsage = appointmentCount || 0;
                    return [3 /*break*/, 7];
                  case 5:
                    return [
                      4 /*yield*/,
                      supabase
                        .from("user_clinics")
                        .select("*", { count: "exact", head: true })
                        .eq("clinic_id", subscription.clinic_id)
                        .eq("is_active", true),
                    ];
                  case 6:
                    userCount = _b.sent().count;
                    currentUsage = userCount || 0;
                    return [3 /*break*/, 7];
                  case 7:
                    limit = limits[limitKey];
                    percentage = limit === -1 ? 0 : Math.round((currentUsage / limit) * 100);
                    stats[limitKey] = {
                      current: currentUsage,
                      limit: limit === -1 ? "Unlimited" : limit,
                      percentage: percentage,
                      remaining: limit === -1 ? Infinity : Math.max(0, limit - currentUsage),
                    };
                    return [2 /*return*/];
                }
              });
            });
          });
          return [4 /*yield*/, Promise.all(usagePromises)];
        case 2:
          _b.sent();
          return [3 /*break*/, 4];
        case 3:
          error_3 = _b.sent();
          console.error("Error calculating usage stats:", error_3);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/, stats];
      }
    });
  });
}
function getSubscriptionStatus(subscription) {
  var now = new Date();
  if (subscription.status === "trial") {
    if (subscription.trial_end) {
      var trialEnd = new Date(subscription.trial_end);
      var daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 0) {
        return {
          status: "trial_expired",
          message: "PerÃ­odo de teste expirado",
          action_required: true,
        };
      } else if (daysRemaining <= 3) {
        return {
          status: "trial_ending",
          message: "Teste expira em ".concat(daysRemaining, " dias"),
          action_required: true,
        };
      } else {
        return {
          status: "trial_active",
          message: "".concat(daysRemaining, " dias restantes no teste"),
          action_required: false,
        };
      }
    }
  }
  if (subscription.cancel_at_period_end && subscription.current_period_end) {
    var periodEnd = new Date(subscription.current_period_end);
    var daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      status: "canceling",
      message: "Assinatura ser\u00C3\u00A1 cancelada em ".concat(daysRemaining, " dias"),
      action_required: false,
    };
  }
  return {
    status: "active",
    message: "Assinatura ativa",
    action_required: false,
  };
}
