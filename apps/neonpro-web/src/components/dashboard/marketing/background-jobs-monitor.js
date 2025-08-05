"use client";
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
exports.BackgroundJobsMonitor = BackgroundJobsMonitor;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var JOB_TYPE_CONFIGS = {
  social_media_sync: {
    name: "Social Media Sync",
    description: "Synchronize posts and engagement data",
    icon: lucide_react_1.Activity,
    color: "bg-blue-500",
  },
  marketing_automation: {
    name: "Marketing Automation",
    description: "Execute automated marketing campaigns",
    icon: lucide_react_1.RefreshCw,
    color: "bg-purple-500",
  },
  data_export: {
    name: "Data Export",
    description: "Generate and export reports",
    icon: lucide_react_1.Eye,
    color: "bg-green-500",
  },
  webhook_processing: {
    name: "Webhook Processing",
    description: "Process incoming webhook events",
    icon: lucide_react_1.Timer,
    color: "bg-orange-500",
  },
  cleanup: {
    name: "System Cleanup",
    description: "Clean up temporary data and logs",
    icon: lucide_react_1.Trash2,
    color: "bg-gray-500",
  },
};
function BackgroundJobsMonitor() {
  var _a = (0, react_1.useState)([]),
    jobs = _a[0],
    setJobs = _a[1];
  var _b = (0, react_1.useState)(null),
    stats = _b[0],
    setStats = _b[1];
  var _c = (0, react_1.useState)(null),
    queueHealth = _c[0],
    setQueueHealth = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)("all"),
    selectedStatus = _e[0],
    setSelectedStatus = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedType = _f[0],
    setSelectedType = _f[1];
  var _g = (0, react_1.useState)(null),
    selectedJob = _g[0],
    setSelectedJob = _g[1];
  var _h = (0, react_1.useState)(true),
    isAutoRefresh = _h[0],
    setIsAutoRefresh = _h[1];
  (0, react_1.useEffect)(() => {
    loadJobs();
    loadStats();
    loadQueueHealth();
    var interval = null;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        loadJobs();
        loadStats();
        loadQueueHealth();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedStatus, selectedType, isAutoRefresh]);
  var loadJobs = () =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            params = new URLSearchParams();
            if (selectedStatus !== "all") params.append("status", selectedStatus);
            if (selectedType !== "all") params.append("type", selectedType);
            params.append("limit", "50");
            return [4 /*yield*/, fetch("/api/jobs?".concat(params.toString()))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setJobs(data.jobs || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to load jobs:", error_1);
            sonner_1.toast.error("Failed to load job data");
            return [3 /*break*/, 6];
          case 5:
            setLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var loadStats = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/jobs?stats=true")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setStats(data.stats);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Failed to load stats:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var loadQueueHealth = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/jobs?health=true")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setQueueHealth(data.health);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Failed to load queue health:", error_3);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var retryJob = (jobId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/jobs/".concat(jobId, "/retry"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Job queued for retry");
              loadJobs();
              loadStats();
            } else {
              throw new Error("Failed to retry job");
            }
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Retry job failed:", error_4);
            sonner_1.toast.error("Failed to retry job");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var cancelJob = (jobId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/jobs/".concat(jobId, "/cancel"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Job cancelled");
              loadJobs();
              loadStats();
            } else {
              throw new Error("Failed to cancel job");
            }
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Cancel job failed:", error_5);
            sonner_1.toast.error("Failed to cancel job");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var deleteJob = (jobId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/jobs/".concat(jobId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Job deleted");
              loadJobs();
              loadStats();
            } else {
              throw new Error("Failed to delete job");
            }
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Delete job failed:", error_6);
            sonner_1.toast.error("Failed to delete job");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <badge_1.Badge className="bg-green-100 text-green-800">
            <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </badge_1.Badge>
        );
      case "running":
        return (
          <badge_1.Badge className="bg-blue-100 text-blue-800">
            <lucide_react_1.RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Running
          </badge_1.Badge>
        );
      case "failed":
        return (
          <badge_1.Badge variant="destructive">
            <lucide_react_1.XCircle className="w-3 h-3 mr-1" />
            Failed
          </badge_1.Badge>
        );
      case "cancelled":
        return (
          <badge_1.Badge variant="secondary">
            <lucide_react_1.XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </badge_1.Badge>
        );
      default:
        return (
          <badge_1.Badge variant="outline">
            <lucide_react_1.Clock className="w-3 h-3 mr-1" />
            Pending
          </badge_1.Badge>
        );
    }
  };
  var getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return (
          <badge_1.Badge variant="destructive" className="text-xs">
            Critical
          </badge_1.Badge>
        );
      case "high":
        return (
          <badge_1.Badge className="bg-orange-100 text-orange-800 text-xs">High</badge_1.Badge>
        );
      case "normal":
        return (
          <badge_1.Badge variant="secondary" className="text-xs">
            Normal
          </badge_1.Badge>
        );
      default:
        return (
          <badge_1.Badge variant="outline" className="text-xs">
            Low
          </badge_1.Badge>
        );
    }
  };
  var getQueueHealthBadge = (status) => {
    switch (status) {
      case "healthy":
        return <badge_1.Badge className="bg-green-100 text-green-800">Healthy</badge_1.Badge>;
      case "warning":
        return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Warning</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="destructive">Critical</badge_1.Badge>;
    }
  };
  var formatDuration = (ms) => {
    if (ms < 1000) return "".concat(ms, "ms");
    if (ms < 60000) return "".concat((ms / 1000).toFixed(1), "s");
    return "".concat(Math.round(ms / 60000), "m");
  };
  var formatRelativeTime = (timestamp) => {
    var now = new Date();
    var time = new Date(timestamp);
    var diffMs = now.getTime() - time.getTime();
    if (diffMs < 60000) return "Just now";
    if (diffMs < 3600000) return "".concat(Math.round(diffMs / 60000), "m ago");
    if (diffMs < 86400000) return "".concat(Math.round(diffMs / 3600000), "h ago");
    return "".concat(Math.round(diffMs / 86400000), "d ago");
  };
  var getJobTypeConfig = (type) =>
    JOB_TYPE_CONFIGS[type] || {
      name: type,
      description: "Unknown job type",
      icon: lucide_react_1.Activity,
      color: "bg-gray-500",
    };
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {__spreadArray([], Array(3), true).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.total_jobs}</p>
                </div>
                <lucide_react_1.Activity className="w-8 h-8 text-gray-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending_jobs}</p>
                </div>
                <lucide_react_1.Clock className="w-8 h-8 text-orange-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Running</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.running_jobs}</p>
                </div>
                <lucide_react_1.RefreshCw className="w-8 h-8 text-blue-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed_jobs}</p>
                </div>
                <lucide_react_1.CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed_jobs}</p>
                </div>
                <lucide_react_1.XCircle className="w-8 h-8 text-red-400" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{Math.round(stats.success_rate)}%</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <progress_1.Progress value={stats.success_rate} className="w-6" />
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Queue Health Status */}
      {queueHealth && (
        <card_1.Card>
          <card_1.CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <card_1.CardTitle className="text-lg">Queue Health</card_1.CardTitle>
              {getQueueHealthBadge(queueHealth.status)}
            </div>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{queueHealth.queue_size}</p>
                <p className="text-sm text-gray-600">Queue Size</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{queueHealth.processing_rate.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Jobs/min</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{(queueHealth.error_rate * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Error Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">
                  {queueHealth.oldest_pending_job
                    ? formatRelativeTime(queueHealth.oldest_pending_job)
                    : "None"}
                </p>
                <p className="text-sm text-gray-600">Oldest Pending</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Jobs Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle>Background Jobs</card_1.CardTitle>
              <card_1.CardDescription>
                Monitor and manage background job execution
              </card_1.CardDescription>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button_1.Button
                  variant={isAutoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                >
                  {isAutoRefresh
                    ? <lucide_react_1.Pause className="w-4 h-4 mr-2" />
                    : <lucide_react_1.Play className="w-4 h-4 mr-2" />}
                  Auto Refresh
                </button_1.Button>

                <button_1.Button variant="outline" size="sm" onClick={loadJobs}>
                  <lucide_react_1.RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button_1.Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select_1.Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <select_1.SelectTrigger className="w-40">
                <select_1.SelectValue placeholder="Filter by status" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Statuses</select_1.SelectItem>
                <select_1.SelectItem value="pending">Pending</select_1.SelectItem>
                <select_1.SelectItem value="running">Running</select_1.SelectItem>
                <select_1.SelectItem value="completed">Completed</select_1.SelectItem>
                <select_1.SelectItem value="failed">Failed</select_1.SelectItem>
                <select_1.SelectItem value="cancelled">Cancelled</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select value={selectedType} onValueChange={setSelectedType}>
              <select_1.SelectTrigger className="w-48">
                <select_1.SelectValue placeholder="Filter by type" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Types</select_1.SelectItem>
                {Object.entries(JOB_TYPE_CONFIGS).map((_a) => {
                  var key = _a[0],
                    config = _a[1];
                  return (
                    <select_1.SelectItem key={key} value={key}>
                      {config.name}
                    </select_1.SelectItem>
                  );
                })}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Job</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead>Priority</table_1.TableHead>
                <table_1.TableHead>Created</table_1.TableHead>
                <table_1.TableHead>Duration</table_1.TableHead>
                <table_1.TableHead>Attempts</table_1.TableHead>
                <table_1.TableHead>Actions</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {jobs.map((job) => {
                var config = getJobTypeConfig(job.type);
                var Icon = config.icon;
                return (
                  <table_1.TableRow key={job.id}>
                    <table_1.TableCell>
                      <div className="flex items-center space-x-3">
                        <div
                          className={"w-8 h-8 rounded ".concat(
                            config.color,
                            " flex items-center justify-center",
                          )}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{config.name}</p>
                          {job.platform && (
                            <p className="text-xs text-gray-500">Platform: {job.platform}</p>
                          )}
                        </div>
                      </div>
                    </table_1.TableCell>

                    <table_1.TableCell>{getStatusBadge(job.status)}</table_1.TableCell>
                    <table_1.TableCell>{getPriorityBadge(job.priority)}</table_1.TableCell>
                    <table_1.TableCell className="text-sm">
                      {formatRelativeTime(job.created_at)}
                    </table_1.TableCell>

                    <table_1.TableCell className="text-sm">
                      {job.run_time_ms ? formatDuration(job.run_time_ms) : "-"}
                    </table_1.TableCell>

                    <table_1.TableCell className="text-sm">
                      {job.attempts}/{job.max_attempts}
                    </table_1.TableCell>

                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        <dialog_1.Dialog>
                          <dialog_1.DialogTrigger asChild>
                            <button_1.Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedJob(job)}
                            >
                              <lucide_react_1.Eye className="w-4 h-4" />
                            </button_1.Button>
                          </dialog_1.DialogTrigger>
                          <dialog_1.DialogContent className="max-w-2xl">
                            <dialog_1.DialogHeader>
                              <dialog_1.DialogTitle>Job Details</dialog_1.DialogTitle>
                              <dialog_1.DialogDescription>
                                Detailed information for job {job.id}
                              </dialog_1.DialogDescription>
                            </dialog_1.DialogHeader>

                            {selectedJob && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <p className="text-sm">
                                      {getJobTypeConfig(selectedJob.type).name}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <div className="mt-1">
                                      {getPriorityBadge(selectedJob.priority)}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Attempts</label>
                                    <p className="text-sm">
                                      {selectedJob.attempts}/{selectedJob.max_attempts}
                                    </p>
                                  </div>
                                </div>

                                {selectedJob.error && (
                                  <div>
                                    <label className="text-sm font-medium text-red-600">
                                      Error
                                    </label>
                                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded text-sm">
                                      {selectedJob.error}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="text-sm font-medium">Job Data</label>
                                  <pre className="mt-1 p-3 bg-gray-50 border rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(selectedJob.data, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </dialog_1.DialogContent>
                        </dialog_1.Dialog>

                        {job.status === "failed" && job.attempts < job.max_attempts && (
                          <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryJob(job.id)}
                          >
                            <lucide_react_1.RefreshCw className="w-4 h-4" />
                          </button_1.Button>
                        )}

                        {(job.status === "pending" || job.status === "running") && (
                          <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelJob(job.id)}
                          >
                            <lucide_react_1.XCircle className="w-4 h-4" />
                          </button_1.Button>
                        )}

                        {(job.status === "completed" ||
                          job.status === "failed" ||
                          job.status === "cancelled") && (
                          <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteJob(job.id)}
                          >
                            <lucide_react_1.Trash2 className="w-4 h-4" />
                          </button_1.Button>
                        )}
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>
                );
              })}
            </table_1.TableBody>
          </table_1.Table>

          {jobs.length === 0 && (
            <div className="text-center py-8">
              <lucide_react_1.Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No jobs found</p>
              <p className="text-sm text-gray-500">Jobs will appear here as they are created</p>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
