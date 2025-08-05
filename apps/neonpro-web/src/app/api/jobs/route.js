"use strict";
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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var background_processor_1 = require("@/lib/jobs/background-processor");
/**
 * Verify API key for job processing endpoints
 */
function verifyApiKey(request) {
  var apiKey = request.headers.get("x-api-key");
  var validApiKey = process.env.JOBS_API_KEY;
  if (!validApiKey) {
    console.error("JOBS_API_KEY not configured");
    return false;
  }
  return apiKey === validApiKey;
}
/**
 * Log job processing activity for monitoring
 */
function logJobActivity(supabase, activityType, stats, details) {
  return __awaiter(this, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase.from("job_processing_logs").insert({
              activity_type: activityType,
              processed_count: stats.processed,
              error_count: stats.errors,
              duration_ms: stats.duration,
              details: details || {},
              created_at: stats.timestamp,
            }),
          ];
        case 1:
          _a.sent();
          return [3 /*break*/, 3];
        case 2:
          error_1 = _a.sent();
          console.error("Failed to log job activity:", error_1);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * GET handler - Job status and monitoring
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var url, action, supabase, _a, queueStats, processingLogs, failedJobs, pendingJobs, error_2;
    var _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 10, , 11]);
          if (!verifyApiKey(request)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          url = new URL(request.url);
          action = url.searchParams.get("action");
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          _a = action;
          switch (_a) {
            case "status":
              return [3 /*break*/, 2];
            case "health":
              return [3 /*break*/, 5];
          }
          return [3 /*break*/, 8];
        case 2:
          return [
            4 /*yield*/,
            supabase
              .from("background_jobs")
              .select("status, count(*)", { count: "exact" })
              .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          ];
        case 3:
          queueStats = _d.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("job_processing_logs")
              .select("*")
              .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
              .order("created_at", { ascending: false })
              .limit(10),
          ];
        case 4:
          processingLogs = _d.sent().data;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              queue: queueStats,
              recentActivity: processingLogs,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 5:
          return [
            4 /*yield*/,
            supabase
              .from("background_jobs")
              .select("count(*)", { count: "exact" })
              .eq("status", "failed")
              .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          ];
        case 6:
          failedJobs = _d.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("background_jobs")
              .select("count(*)", { count: "exact" })
              .eq("status", "pending"),
          ];
        case 7:
          pendingJobs = _d.sent().data;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              health: "ok",
              metrics: {
                failedJobsLast24h:
                  ((_b = failedJobs === null || failedJobs === void 0 ? void 0 : failedJobs[0]) ===
                    null || _b === void 0
                    ? void 0
                    : _b.count) || 0,
                pendingJobs:
                  ((_c =
                    pendingJobs === null || pendingJobs === void 0 ? void 0 : pendingJobs[0]) ===
                    null || _c === void 0
                    ? void 0
                    : _c.count) || 0,
              },
              timestamp: new Date().toISOString(),
            }),
          ];
        case 8:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action parameter" }, { status: 400 }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_2 = _d.sent();
          console.error("Jobs API GET error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST handler - Job processing and scheduling
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      action,
      params,
      startTime,
      supabase,
      _a,
      stats,
      duration,
      processStats,
      scheduler,
      refreshStats,
      syncScheduler,
      syncStats,
      cutoffDate,
      _b,
      deletedJobs,
      cleanupError,
      cleanupStats,
      _c,
      maxAge,
      retryDate,
      _d,
      retriedJobs,
      retryError,
      retryStats,
      error_3;
    var _e, _f;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 20, , 21]);
          if (!verifyApiKey(request)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 1:
          body = _g.sent();
          (action = body.action), (params = __rest(body, ["action"]));
          startTime = Date.now();
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _g.sent();
          _a = action;
          switch (_a) {
            case "process":
              return [3 /*break*/, 3];
            case "schedule_token_refresh":
              return [3 /*break*/, 6];
            case "schedule_daily_sync":
              return [3 /*break*/, 9];
            case "cleanup":
              return [3 /*break*/, 12];
            case "retry_failed":
              return [3 /*break*/, 15];
          }
          return [3 /*break*/, 18];
        case 3:
          // Manual job processing trigger
          console.log("Starting manual job processing...");
          return [4 /*yield*/, (0, background_processor_1.processBackgroundJobs)()];
        case 4:
          stats = _g.sent();
          duration = Date.now() - startTime;
          processStats = {
            processed: stats.processed,
            errors: stats.errors,
            duration: duration,
            timestamp: new Date().toISOString(),
          };
          return [4 /*yield*/, logJobActivity(supabase, "manual_processing", processStats)];
        case 5:
          _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              stats: processStats,
              message: "Processed "
                .concat(stats.processed, " jobs with ")
                .concat(stats.errors, " errors"),
            }),
          ];
        case 6:
          scheduler = new background_processor_1.JobScheduler();
          return [4 /*yield*/, scheduler.scheduleTokenRefreshJobs()];
        case 7:
          _g.sent();
          refreshStats = {
            processed: 0,
            errors: 0,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          };
          return [4 /*yield*/, logJobActivity(supabase, "token_refresh_scheduling", refreshStats)];
        case 8:
          _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Token refresh jobs scheduled",
              duration: refreshStats.duration,
            }),
          ];
        case 9:
          syncScheduler = new background_processor_1.JobScheduler();
          return [4 /*yield*/, syncScheduler.scheduleDailySyncJobs()];
        case 10:
          _g.sent();
          syncStats = {
            processed: 0,
            errors: 0,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          };
          return [4 /*yield*/, logJobActivity(supabase, "daily_sync_scheduling", syncStats)];
        case 11:
          _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Daily sync jobs scheduled",
              duration: syncStats.duration,
            }),
          ];
        case 12:
          cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          return [
            4 /*yield*/,
            supabase
              .from("background_jobs")
              .delete()
              .in("status", ["completed", "failed"])
              .lt("completed_at", cutoffDate)
              .select("count(*)", { count: "exact" }),
          ];
        case 13:
          (_b = _g.sent()), (deletedJobs = _b.data), (cleanupError = _b.error);
          if (cleanupError) {
            throw new Error("Cleanup failed: ".concat(cleanupError.message));
          }
          cleanupStats = {
            processed:
              ((_e = deletedJobs === null || deletedJobs === void 0 ? void 0 : deletedJobs[0]) ===
                null || _e === void 0
                ? void 0
                : _e.count) || 0,
            errors: 0,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          };
          return [4 /*yield*/, logJobActivity(supabase, "job_cleanup", cleanupStats)];
        case 14:
          _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Cleaned up ".concat(cleanupStats.processed, " old jobs"),
              duration: cleanupStats.duration,
            }),
          ];
        case 15:
          (_c = params.maxAge), (maxAge = _c === void 0 ? 24 : _c);
          retryDate = new Date(Date.now() - maxAge * 60 * 60 * 1000).toISOString();
          return [
            4 /*yield*/,
            supabase
              .from("background_jobs")
              .update({
                status: "pending",
                retry_count: 0,
                scheduled_at: new Date().toISOString(),
                error_message: null,
              })
              .eq("status", "failed")
              .gte("failed_at", retryDate)
              .select("count(*)", { count: "exact" }),
          ];
        case 16:
          (_d = _g.sent()), (retriedJobs = _d.data), (retryError = _d.error);
          if (retryError) {
            throw new Error("Retry failed: ".concat(retryError.message));
          }
          retryStats = {
            processed:
              ((_f = retriedJobs === null || retriedJobs === void 0 ? void 0 : retriedJobs[0]) ===
                null || _f === void 0
                ? void 0
                : _f.count) || 0,
            errors: 0,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          };
          return [4 /*yield*/, logJobActivity(supabase, "job_retry", retryStats)];
        case 17:
          _g.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Retried ".concat(retryStats.processed, " failed jobs"),
              duration: retryStats.duration,
            }),
          ];
        case 18:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 19:
          return [3 /*break*/, 21];
        case 20:
          error_3 = _g.sent();
          console.error("Jobs API POST error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: error_3.message || "Internal server error" },
              { status: 500 },
            ),
          ];
        case 21:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT handler - Job management
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, jobId, action, supabase, _a, cancelError, retryError, error_4;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 9, , 10]);
          if (!verifyApiKey(request)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          (jobId = body.jobId), (action = body.action);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _b.sent();
          if (!jobId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Job ID required" }, { status: 400 }),
            ];
          }
          _a = action;
          switch (_a) {
            case "cancel":
              return [3 /*break*/, 3];
            case "retry":
              return [3 /*break*/, 5];
          }
          return [3 /*break*/, 7];
        case 3:
          return [
            4 /*yield*/,
            supabase
              .from("background_jobs")
              .update({
                status: "cancelled",
                cancelled_at: new Date().toISOString(),
              })
              .eq("id", jobId)
              .in("status", ["pending", "processing"]),
          ];
        case 4:
          cancelError = _b.sent().error;
          if (cancelError) {
            throw new Error("Cancel failed: ".concat(cancelError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Job ".concat(jobId, " cancelled"),
            }),
          ];
        case 5:
          return [
            4 /*yield*/,
            supabase
              .from("background_jobs")
              .update({
                status: "pending",
                retry_count: 0,
                scheduled_at: new Date().toISOString(),
                error_message: null,
              })
              .eq("id", jobId)
              .eq("status", "failed"),
          ];
        case 6:
          retryError = _b.sent().error;
          if (retryError) {
            throw new Error("Retry failed: ".concat(retryError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Job ".concat(jobId, " scheduled for retry"),
            }),
          ];
        case 7:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 8:
          return [3 /*break*/, 10];
        case 9:
          error_4 = _b.sent();
          console.error("Jobs API PUT error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: error_4.message || "Internal server error" },
              { status: 500 },
            ),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE handler - Remove specific jobs
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var url, jobId, supabase, deleteError, error_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          if (!verifyApiKey(request)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          url = new URL(request.url);
          jobId = url.searchParams.get("jobId");
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          if (!jobId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Job ID required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("background_jobs")
              .delete()
              .eq("id", jobId)
              .in("status", ["completed", "failed", "cancelled"]),
          ];
        case 2:
          deleteError = _a.sent().error;
          if (deleteError) {
            throw new Error("Delete failed: ".concat(deleteError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Job ".concat(jobId, " deleted"),
            }),
          ];
        case 3:
          error_5 = _a.sent();
          console.error("Jobs API DELETE error:", error_5);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: error_5.message || "Internal server error" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
