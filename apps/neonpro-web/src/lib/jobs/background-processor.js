"use strict";
/**
 * Background Job Processors - Research-Backed Implementation
 *
 * Handles background processing for:
 * - OAuth token refresh automation
 * - Data synchronization jobs
 * - Webhook event processing
 * - Analytics data aggregation
 *
 * Implementation follows Next.js serverless patterns with queue-based processing
 * Based on research from Bull, Redis patterns, and serverless job processing
 */
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
exports.JobScheduler = exports.JobQueueManager = void 0;
exports.processBackgroundJobs = processBackgroundJobs;
var server_1 = require("@/lib/supabase/server");
var instagram_handler_1 = require("@/lib/oauth/platforms/instagram-handler");
var facebook_handler_1 = require("@/lib/oauth/platforms/facebook-handler");
var whatsapp_handler_1 = require("@/lib/oauth/platforms/whatsapp-handler");
var hubspot_handler_1 = require("@/lib/oauth/platforms/hubspot-handler");
/**
 * Job Queue Manager - Serverless-compatible queue implementation
 */
var JobQueueManager = /** @class */ (function () {
  function JobQueueManager() {
    this.supabase = (0, server_1.createClient)();
  }
  /**
   * Add job to the processing queue
   */
  JobQueueManager.prototype.addJob = function (job_1) {
    return __awaiter(this, arguments, void 0, function (job, priority) {
      var _a, data, error, error_1;
      if (priority === void 0) {
        priority = "medium";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("background_jobs")
                .insert({
                  id: job.jobId,
                  type: job.type,
                  profile_id: job.profileId,
                  platform: job.platform,
                  priority: priority,
                  payload: job,
                  status: "pending",
                  retry_count: 0,
                  max_retries: job.maxRetries || 3,
                  scheduled_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                })
                .select("id")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to queue job: ".concat(error.message));
            }
            console.log(
              "Job ".concat(job.jobId, " queued successfully with priority ").concat(priority),
            );
            return [2 /*return*/, data.id];
          case 2:
            error_1 = _b.sent();
            console.error("Error adding job to queue:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process next job in the queue
   */
  JobQueueManager.prototype.processNextJob = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, job, error, processingError_1, newRetryCount, retryDelay, scheduledAt, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 12, , 13]);
            return [
              4 /*yield*/,
              this.supabase
                .from("background_jobs")
                .select("*")
                .eq("status", "pending")
                .or("scheduled_at.lte." + new Date().toISOString())
                .order("priority", { ascending: false })
                .order("created_at", { ascending: true })
                .limit(1)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (job = _a.data), (error = _a.error);
            if (error || !job) {
              return [2 /*return*/, false]; // No jobs to process
            }
            // Mark job as processing
            return [
              4 /*yield*/,
              this.supabase
                .from("background_jobs")
                .update({
                  status: "processing",
                  started_at: new Date().toISOString(),
                })
                .eq("id", job.id),
            ];
          case 2:
            // Mark job as processing
            _b.sent();
            _b.label = 3;
          case 3:
            _b.trys.push([3, 6, , 11]);
            // Process the job based on type
            return [4 /*yield*/, this.executeJob(job.payload)];
          case 4:
            // Process the job based on type
            _b.sent();
            // Mark job as completed
            return [
              4 /*yield*/,
              this.supabase
                .from("background_jobs")
                .update({
                  status: "completed",
                  completed_at: new Date().toISOString(),
                })
                .eq("id", job.id),
            ];
          case 5:
            // Mark job as completed
            _b.sent();
            console.log("Job ".concat(job.id, " completed successfully"));
            return [2 /*return*/, true];
          case 6:
            processingError_1 = _b.sent();
            console.error("Job ".concat(job.id, " processing failed:"), processingError_1);
            newRetryCount = (job.retry_count || 0) + 1;
            if (!(newRetryCount >= (job.max_retries || 3))) return [3 /*break*/, 8];
            // Max retries reached, mark as failed
            return [
              4 /*yield*/,
              this.supabase
                .from("background_jobs")
                .update({
                  status: "failed",
                  error_message: processingError_1.message,
                  failed_at: new Date().toISOString(),
                })
                .eq("id", job.id),
            ];
          case 7:
            // Max retries reached, mark as failed
            _b.sent();
            return [3 /*break*/, 10];
          case 8:
            retryDelay = Math.pow(2, newRetryCount) * 60 * 1000;
            scheduledAt = new Date(Date.now() + retryDelay).toISOString();
            return [
              4 /*yield*/,
              this.supabase
                .from("background_jobs")
                .update({
                  status: "pending",
                  retry_count: newRetryCount,
                  scheduled_at: scheduledAt,
                  error_message: processingError_1.message,
                })
                .eq("id", job.id),
            ];
          case 9:
            _b.sent();
            _b.label = 10;
          case 10:
            return [2 /*return*/, false];
          case 11:
            return [3 /*break*/, 13];
          case 12:
            error_2 = _b.sent();
            console.error("Error processing job queue:", error_2);
            return [2 /*return*/, false];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute specific job based on type
   */
  JobQueueManager.prototype.executeJob = function (job) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = job.type;
            switch (_a) {
              case "token_refresh":
                return [3 /*break*/, 1];
              case "data_sync":
                return [3 /*break*/, 3];
              case "webhook_processing":
                return [3 /*break*/, 5];
              case "analytics_aggregation":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            return [4 /*yield*/, this.processTokenRefresh(job)];
          case 2:
            _b.sent();
            return [3 /*break*/, 10];
          case 3:
            return [4 /*yield*/, this.processDataSync(job)];
          case 4:
            _b.sent();
            return [3 /*break*/, 10];
          case 5:
            return [4 /*yield*/, this.processWebhook(job)];
          case 6:
            _b.sent();
            return [3 /*break*/, 10];
          case 7:
            return [4 /*yield*/, this.processAnalyticsAggregation(job)];
          case 8:
            _b.sent();
            return [3 /*break*/, 10];
          case 9:
            throw new Error("Unknown job type: ".concat(job.type));
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process OAuth token refresh jobs
   */
  JobQueueManager.prototype.processTokenRefresh = function (job) {
    return __awaiter(this, void 0, void 0, function () {
      var handler, refreshedTokens, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 5]);
            handler = void 0;
            switch (job.platform) {
              case "instagram":
                handler = new instagram_handler_1.InstagramOAuthHandler();
                break;
              case "facebook":
                handler = new facebook_handler_1.FacebookOAuthHandler();
                break;
              case "whatsapp":
                handler = new whatsapp_handler_1.WhatsAppOAuthHandler();
                break;
              case "hubspot":
                handler = new hubspot_handler_1.HubSpotOAuthHandler();
                break;
              default:
                throw new Error("Unsupported platform: ".concat(job.platform));
            }
            return [4 /*yield*/, handler.refreshToken(job.refreshToken || job.currentToken)];
          case 1:
            refreshedTokens = _a.sent();
            // Update the connection with new tokens
            return [
              4 /*yield*/,
              this.supabase
                .from("social_media_accounts")
                .update({
                  access_token: refreshedTokens.accessToken,
                  refresh_token: refreshedTokens.refreshToken,
                  token_expires_at: refreshedTokens.expiresAt,
                  last_token_refresh: new Date().toISOString(),
                  status: "active",
                })
                .eq("id", job.accountId),
            ];
          case 2:
            // Update the connection with new tokens
            _a.sent();
            console.log(
              "Token refreshed successfully for "
                .concat(job.platform, " account ")
                .concat(job.accountId),
            );
            return [3 /*break*/, 5];
          case 3:
            error_3 = _a.sent();
            console.error("Token refresh failed for ".concat(job.platform, ":"), error_3);
            // Mark connection as needs reauthorization
            return [
              4 /*yield*/,
              this.supabase
                .from("social_media_accounts")
                .update({
                  status: "needs_reauth",
                  last_error: error_3.message,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", job.accountId),
            ];
          case 4:
            // Mark connection as needs reauthorization
            _a.sent();
            throw error_3;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process data synchronization jobs
   */
  JobQueueManager.prototype.processDataSync = function (job) {
    return __awaiter(this, void 0, void 0, function () {
      var connection, _a, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 13, , 14]);
            return [
              4 /*yield*/,
              this.supabase
                .from("social_media_accounts")
                .select("*")
                .eq("id", job.connectionId)
                .single(),
            ];
          case 1:
            connection = _b.sent().data;
            if (!connection) {
              throw new Error("Connection not found: ".concat(job.connectionId));
            }
            _a = job.syncType;
            switch (_a) {
              case "posts":
                return [3 /*break*/, 2];
              case "analytics":
                return [3 /*break*/, 4];
              case "contacts":
                return [3 /*break*/, 6];
              case "deals":
                return [3 /*break*/, 8];
            }
            return [3 /*break*/, 10];
          case 2:
            return [4 /*yield*/, this.syncSocialMediaPosts(connection, job)];
          case 3:
            _b.sent();
            return [3 /*break*/, 11];
          case 4:
            return [4 /*yield*/, this.syncSocialMediaAnalytics(connection, job)];
          case 5:
            _b.sent();
            return [3 /*break*/, 11];
          case 6:
            return [4 /*yield*/, this.syncMarketingContacts(connection, job)];
          case 7:
            _b.sent();
            return [3 /*break*/, 11];
          case 8:
            return [4 /*yield*/, this.syncMarketingDeals(connection, job)];
          case 9:
            _b.sent();
            return [3 /*break*/, 11];
          case 10:
            throw new Error("Unknown sync type: ".concat(job.syncType));
          case 11:
            // Update last sync timestamp
            return [
              4 /*yield*/,
              this.supabase
                .from("social_media_accounts")
                .update({
                  last_sync_at: new Date().toISOString(),
                })
                .eq("id", job.connectionId),
            ];
          case 12:
            // Update last sync timestamp
            _b.sent();
            return [3 /*break*/, 14];
          case 13:
            error_4 = _b.sent();
            console.error("Data sync failed for ".concat(job.syncType, ":"), error_4);
            throw error_4;
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process webhook events asynchronously
   */
  JobQueueManager.prototype.processWebhook = function (job) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 11, , 12]);
            _a = job.platform;
            switch (_a) {
              case "instagram":
                return [3 /*break*/, 1];
              case "facebook":
                return [3 /*break*/, 3];
              case "whatsapp":
                return [3 /*break*/, 5];
              case "hubspot":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            return [4 /*yield*/, this.processInstagramWebhookData(job.webhookData, job.eventType)];
          case 2:
            _b.sent();
            return [3 /*break*/, 10];
          case 3:
            return [4 /*yield*/, this.processFacebookWebhookData(job.webhookData, job.eventType)];
          case 4:
            _b.sent();
            return [3 /*break*/, 10];
          case 5:
            return [4 /*yield*/, this.processWhatsAppWebhookData(job.webhookData, job.eventType)];
          case 6:
            _b.sent();
            return [3 /*break*/, 10];
          case 7:
            return [4 /*yield*/, this.processHubSpotWebhookData(job.webhookData, job.eventType)];
          case 8:
            _b.sent();
            return [3 /*break*/, 10];
          case 9:
            throw new Error("Unsupported webhook platform: ".concat(job.platform));
          case 10:
            return [3 /*break*/, 12];
          case 11:
            error_5 = _b.sent();
            console.error("Webhook processing failed for ".concat(job.platform, ":"), error_5);
            throw error_5;
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process analytics aggregation jobs
   */
  JobQueueManager.prototype.processAnalyticsAggregation = function (job) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, startDate, endDate, _i, _b, metric, error_6;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, , 6]);
            (_a = job.dateRange), (startDate = _a.startDate), (endDate = _a.endDate);
            (_i = 0), (_b = job.metrics);
            _c.label = 1;
          case 1:
            if (!(_i < _b.length)) return [3 /*break*/, 4];
            metric = _b[_i];
            return [
              4 /*yield*/,
              this.aggregateMetric(job.profileId, job.platform, metric, startDate, endDate),
            ];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_6 = _c.sent();
            console.error("Analytics aggregation failed:", error_6);
            throw error_6;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods for specific sync operations
  JobQueueManager.prototype.syncSocialMediaPosts = function (connection, job) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for syncing social media posts
        console.log(
          "Syncing posts for ".concat(connection.platform, " account ").concat(connection.id),
        );
        return [2 /*return*/];
      });
    });
  };
  JobQueueManager.prototype.syncSocialMediaAnalytics = function (connection, job) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for syncing analytics data
        console.log(
          "Syncing analytics for ".concat(connection.platform, " account ").concat(connection.id),
        );
        return [2 /*return*/];
      });
    });
  };
  JobQueueManager.prototype.syncMarketingContacts = function (connection, job) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for syncing marketing contacts
        console.log(
          "Syncing contacts for ".concat(connection.platform, " connection ").concat(connection.id),
        );
        return [2 /*return*/];
      });
    });
  };
  JobQueueManager.prototype.syncMarketingDeals = function (connection, job) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for syncing marketing deals
        console.log(
          "Syncing deals for ".concat(connection.platform, " connection ").concat(connection.id),
        );
        return [2 /*return*/];
      });
    });
  };
  JobQueueManager.prototype.processInstagramWebhookData = function (webhookData, eventType) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Process Instagram-specific webhook data
        console.log("Processing Instagram webhook: ".concat(eventType));
        return [2 /*return*/];
      });
    });
  };
  JobQueueManager.prototype.processFacebookWebhookData = function (webhookData, eventType) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Process Facebook-specific webhook data
        console.log("Processing Facebook webhook: ".concat(eventType));
        return [2 /*return*/];
      });
    });
  };
  JobQueueManager.prototype.processWhatsAppWebhookData = function (webhookData, eventType) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Process WhatsApp-specific webhook data
        console.log("Processing WhatsApp webhook: ".concat(eventType));
        return [2 /*return*/];
      });
    });
  };
  JobQueueManager.prototype.processHubSpotWebhookData = function (webhookData, eventType) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Process HubSpot-specific webhook data
        console.log("Processing HubSpot webhook: ".concat(eventType));
        return [2 /*return*/];
      });
    });
  };
  JobQueueManager.prototype.aggregateMetric = function (
    profileId,
    platform,
    metric,
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for aggregating specific metrics
        console.log(
          "Aggregating "
            .concat(metric, " for ")
            .concat(platform, " from ")
            .concat(startDate, " to ")
            .concat(endDate),
        );
        return [2 /*return*/];
      });
    });
  };
  return JobQueueManager;
})();
exports.JobQueueManager = JobQueueManager;
/**
 * Job Scheduler - Handles recurring job scheduling
 */
var JobScheduler = /** @class */ (function () {
  function JobScheduler() {
    this.jobQueue = new JobQueueManager();
  }
  /**
   * Schedule token refresh jobs for expiring tokens
   */
  JobScheduler.prototype.scheduleTokenRefreshJobs = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, expirationThreshold, expiringConnections, _i, _a, connection, job;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            expirationThreshold = new Date(Date.now() + 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              supabase
                .from("social_media_accounts")
                .select("*")
                .lt("token_expires_at", expirationThreshold.toISOString())
                .eq("status", "active")
                .not("refresh_token", "is", null),
            ];
          case 2:
            expiringConnections = _b.sent().data;
            (_i = 0), (_a = expiringConnections || []);
            _b.label = 3;
          case 3:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            connection = _a[_i];
            job = {
              jobId: "token_refresh_".concat(connection.id, "_").concat(Date.now()),
              type: "token_refresh",
              profileId: connection.profile_id,
              platform: connection.platform,
              connectionId: connection.id,
              accountId: connection.id,
              currentToken: connection.access_token,
              refreshToken: connection.refresh_token,
            };
            return [4 /*yield*/, this.jobQueue.addJob(job, "high")];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Schedule daily data sync jobs
   */
  JobScheduler.prototype.scheduleDailySyncJobs = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, activeConnections, _i, _a, connection, postsJob, analyticsJob;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("social_media_accounts").select("*").eq("status", "active"),
            ];
          case 2:
            activeConnections = _b.sent().data;
            (_i = 0), (_a = activeConnections || []);
            _b.label = 3;
          case 3:
            if (!(_i < _a.length)) return [3 /*break*/, 7];
            connection = _a[_i];
            postsJob = {
              jobId: "posts_sync_".concat(connection.id, "_").concat(Date.now()),
              type: "data_sync",
              profileId: connection.profile_id,
              platform: connection.platform,
              connectionId: connection.id,
              syncType: "posts",
            };
            analyticsJob = {
              jobId: "analytics_sync_".concat(connection.id, "_").concat(Date.now()),
              type: "data_sync",
              profileId: connection.profile_id,
              platform: connection.platform,
              connectionId: connection.id,
              syncType: "analytics",
            };
            return [4 /*yield*/, this.jobQueue.addJob(postsJob, "medium")];
          case 4:
            _b.sent();
            return [4 /*yield*/, this.jobQueue.addJob(analyticsJob, "medium")];
          case 5:
            _b.sent();
            _b.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 3];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  return JobScheduler;
})();
exports.JobScheduler = JobScheduler;
/**
 * Main job processor entry point
 */
function processBackgroundJobs() {
  return __awaiter(this, void 0, void 0, function () {
    var jobQueue, processed, errors, i, hasJob, error_7;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          jobQueue = new JobQueueManager();
          processed = 0;
          errors = 0;
          i = 0;
          _a.label = 1;
        case 1:
          if (!(i < 10)) return [3 /*break*/, 6];
          _a.label = 2;
        case 2:
          _a.trys.push([2, 4, , 5]);
          return [4 /*yield*/, jobQueue.processNextJob()];
        case 3:
          hasJob = _a.sent();
          if (!hasJob) {
            return [3 /*break*/, 6]; // No more jobs to process
          }
          processed++;
          return [3 /*break*/, 5];
        case 4:
          error_7 = _a.sent();
          console.error("Job processing error:", error_7);
          errors++;
          return [3 /*break*/, 5];
        case 5:
          i++;
          return [3 /*break*/, 1];
        case 6:
          return [2 /*return*/, { processed: processed, errors: errors }];
      }
    });
  });
}
