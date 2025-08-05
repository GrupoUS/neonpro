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
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var email_service_1 = require("@/app/lib/services/email-service");
var email_1 = require("@/app/types/email");
var zod_1 = require("zod");
var BulkEmailSchema = zod_1.z.object({
  messages: zod_1.z.array(email_1.EmailMessageSchema).min(1, "At least one message is required"),
  batchSize: zod_1.z.number().min(1).max(100).optional().default(10),
  delayBetweenBatches: zod_1.z.number().min(0).max(60000).optional().default(1000), // Max 1 minute delay
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session_1,
      authError,
      profile_1,
      body,
      messages_1,
      batchSize_1,
      now,
      oneHourAgo,
      recentEmailCount,
      settings,
      hourlyLimit,
      dailyLimit,
      oneDayAgo,
      dailyEmailCount,
      emailService,
      providerConfigs,
      campaignId_1,
      result,
      emailLogs,
      logError,
      error_1;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 15, , 16]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _f.sent()), (session_1 = _a.data.session), (authError = _a.error);
          if (authError || !session_1) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .select("clinic_id, role")
              .eq("id", session_1.user.id)
              .single(),
          ];
        case 3:
          profile_1 = _f.sent().data;
          if (!(profile_1 === null || profile_1 === void 0 ? void 0 : profile_1.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          // Check if user has permission for bulk sending
          if (!["admin", "manager", "marketer"].includes(profile_1.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Insufficient permissions for bulk email sending" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _f.sent();
          try {
            BulkEmailSchema.parse(body);
          } catch (validationError) {
            if (validationError instanceof zod_1.z.ZodError) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  {
                    error: "Validation failed",
                    details: validationError.errors.map(function (err) {
                      return {
                        field: err.path.join("."),
                        message: err.message,
                      };
                    }),
                  },
                  { status: 400 },
                ),
              ];
            }
            throw validationError;
          }
          (messages_1 = body.messages), (batchSize_1 = body.batchSize);
          now = new Date();
          oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
          return [
            4 /*yield*/,
            supabase
              .from("email_logs")
              .select("*", { count: "exact", head: true })
              .eq("clinic_id", profile_1.clinic_id)
              .gte("created_at", oneHourAgo.toISOString()),
          ];
        case 5:
          recentEmailCount = _f.sent().count;
          return [
            4 /*yield*/,
            supabase
              .from("email_settings")
              .select("delivery_optimization")
              .eq("clinic_id", profile_1.clinic_id)
              .single(),
          ];
        case 6:
          settings = _f.sent().data;
          hourlyLimit =
            ((_c =
              (_b =
                settings === null || settings === void 0
                  ? void 0
                  : settings.delivery_optimization) === null || _b === void 0
                ? void 0
                : _b.rateLimit) === null || _c === void 0
              ? void 0
              : _c.emailsPerHour) || 1000;
          dailyLimit =
            ((_e =
              (_d =
                settings === null || settings === void 0
                  ? void 0
                  : settings.delivery_optimization) === null || _d === void 0
                ? void 0
                : _d.rateLimit) === null || _e === void 0
              ? void 0
              : _e.emailsPerDay) || 10000;
          if ((recentEmailCount || 0) + messages_1.length > hourlyLimit) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Rate limit exceeded",
                  details: "Hourly limit of ".concat(hourlyLimit, " emails would be exceeded"),
                },
                { status: 429 },
              ),
            ];
          }
          oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          return [
            4 /*yield*/,
            supabase
              .from("email_logs")
              .select("*", { count: "exact", head: true })
              .eq("clinic_id", profile_1.clinic_id)
              .gte("created_at", oneDayAgo.toISOString()),
          ];
        case 7:
          dailyEmailCount = _f.sent().count;
          if ((dailyEmailCount || 0) + messages_1.length > dailyLimit) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Daily rate limit exceeded",
                  details: "Daily limit of ".concat(dailyLimit, " emails would be exceeded"),
                },
                { status: 429 },
              ),
            ];
          }
          emailService = new email_service_1.default(supabase, profile_1.clinic_id);
          return [
            4 /*yield*/,
            supabase
              .from("email_providers")
              .select("*")
              .eq("clinic_id", profile_1.clinic_id)
              .eq("is_active", true)
              .order("priority", { ascending: true }),
          ];
        case 8:
          providerConfigs = _f.sent().data;
          if (!providerConfigs || providerConfigs.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "No email providers configured" },
                { status: 503 },
              ),
            ];
          }
          // Initialize providers
          return [
            4 /*yield*/,
            emailService.initializeProviders(
              providerConfigs.map(function (config) {
                return {
                  provider: config.provider,
                  name: config.name,
                  settings: config.settings,
                  isActive: config.is_active,
                  priority: config.priority,
                  dailyLimit: config.daily_limit,
                  monthlyLimit: config.monthly_limit,
                  rateLimit: config.rate_limit,
                };
              }),
            ),
          ];
        case 9:
          // Initialize providers
          _f.sent();
          campaignId_1 = crypto.randomUUID();
          return [
            4 /*yield*/,
            supabase.from("email_campaigns").insert([
              {
                id: campaignId_1,
                clinic_id: profile_1.clinic_id,
                created_by: session_1.user.id,
                name: "Bulk Campaign ".concat(new Date().toLocaleDateString()),
                status: "sending",
                total_recipients: messages_1.length,
                batch_size: batchSize_1,
                created_at: new Date().toISOString(),
                started_at: new Date().toISOString(),
              },
            ]),
          ];
        case 10:
          _f.sent();
          return [4 /*yield*/, emailService.sendBulkEmail(messages_1, undefined, batchSize_1)];
        case 11:
          result = _f.sent();
          emailLogs = result.results.map(function (emailResult, index) {
            var _a, _b, _c, _d;
            return {
              id: crypto.randomUUID(),
              clinic_id: profile_1.clinic_id,
              user_id: session_1.user.id,
              campaign_id: campaignId_1,
              message_id: emailResult.messageId,
              recipient_email: emailResult.email,
              subject:
                ((_a = messages_1[index]) === null || _a === void 0 ? void 0 : _a.subject) || "",
              template_id:
                (_b = messages_1[index]) === null || _b === void 0 ? void 0 : _b.templateId,
              status: emailResult.success ? "sent" : "failed",
              error_message: emailResult.error,
              metadata: {
                batch_index: Math.floor(index / batchSize_1),
                priority: (_c = messages_1[index]) === null || _c === void 0 ? void 0 : _c.priority,
                tags: (_d = messages_1[index]) === null || _d === void 0 ? void 0 : _d.tags,
              },
              created_at: new Date().toISOString(),
            };
          });
          if (!(emailLogs.length > 0)) return [3 /*break*/, 13];
          return [4 /*yield*/, supabase.from("email_logs").insert(emailLogs)];
        case 12:
          logError = _f.sent().error;
          if (logError) {
            console.error("Failed to log email sends:", logError);
          }
          _f.label = 13;
        case 13:
          // Update campaign status
          return [
            4 /*yield*/,
            supabase
              .from("email_campaigns")
              .update({
                status: "completed",
                sent_count: result.totalSent,
                failed_count: result.totalFailed,
                completed_at: new Date().toISOString(),
              })
              .eq("id", campaignId_1),
          ];
        case 14:
          // Update campaign status
          _f.sent();
          // Return results with campaign ID
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              __assign(__assign({}, result), {
                campaignId: campaignId_1,
                metadata: {
                  totalMessages: messages_1.length,
                  batchSize: batchSize_1,
                  batches: Math.ceil(messages_1.length / batchSize_1),
                  rateLimits: {
                    hourlyUsed: (recentEmailCount || 0) + result.totalSent,
                    hourlyLimit: hourlyLimit,
                    dailyUsed: (dailyEmailCount || 0) + result.totalSent,
                    dailyLimit: dailyLimit,
                  },
                },
              }),
            ),
          ];
        case 15:
          error_1 = _f.sent();
          console.error("Bulk email send error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Internal server error",
              },
              { status: 500 },
            ),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
// GET endpoint to check bulk email campaign status
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      profile,
      url,
      campaignId,
      _b,
      campaigns,
      error,
      _c,
      campaign,
      campaignError,
      emailLogs,
      events,
      error_2;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 9, , 10]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _d.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _d.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          url = new URL(request.url);
          campaignId = url.searchParams.get("campaignId");
          if (!!campaignId) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase
              .from("email_campaigns")
              .select("*")
              .eq("clinic_id", profile.clinic_id)
              .order("created_at", { ascending: false })
              .limit(10),
          ];
        case 4:
          (_b = _d.sent()), (campaigns = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          return [2 /*return*/, server_1.NextResponse.json({ campaigns: campaigns })];
        case 5:
          return [
            4 /*yield*/,
            supabase
              .from("email_campaigns")
              .select("*")
              .eq("id", campaignId)
              .eq("clinic_id", profile.clinic_id)
              .single(),
          ];
        case 6:
          (_c = _d.sent()), (campaign = _c.data), (campaignError = _c.error);
          if (campaignError) {
            if (campaignError.code === "PGRST116") {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Campaign not found" }, { status: 404 }),
              ];
            }
            throw campaignError;
          }
          return [
            4 /*yield*/,
            supabase
              .from("email_logs")
              .select("*")
              .eq("campaign_id", campaignId)
              .eq("clinic_id", profile.clinic_id)
              .order("created_at", { ascending: true }),
          ];
        case 7:
          emailLogs = _d.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("email_events")
              .select("*")
              .in(
                "message_id",
                (emailLogs === null || emailLogs === void 0
                  ? void 0
                  : emailLogs.map(function (log) {
                      return log.message_id;
                    })) || [],
              )
              .eq("clinic_id", profile.clinic_id),
          ];
        case 8:
          events = _d.sent().data;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              campaign: campaign,
              emailLogs: emailLogs || [],
              events: events || [],
              analytics: {
                sent:
                  (emailLogs === null || emailLogs === void 0
                    ? void 0
                    : emailLogs.filter(function (log) {
                        return log.status === "sent";
                      }).length) || 0,
                failed:
                  (emailLogs === null || emailLogs === void 0
                    ? void 0
                    : emailLogs.filter(function (log) {
                        return log.status === "failed";
                      }).length) || 0,
                delivered:
                  (events === null || events === void 0
                    ? void 0
                    : events.filter(function (event) {
                        return event.event === "delivered";
                      }).length) || 0,
                opened:
                  (events === null || events === void 0
                    ? void 0
                    : events.filter(function (event) {
                        return event.event === "opened";
                      }).length) || 0,
                clicked:
                  (events === null || events === void 0
                    ? void 0
                    : events.filter(function (event) {
                        return event.event === "clicked";
                      }).length) || 0,
                bounced:
                  (events === null || events === void 0
                    ? void 0
                    : events.filter(function (event) {
                        return event.event === "bounced";
                      }).length) || 0,
              },
            }),
          ];
        case 9:
          error_2 = _d.sent();
          console.error("Bulk email status check error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
