"use client";
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
var react_1 = require("react");
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var accordion_1 = require("@/components/ui/accordion");
var lucide_react_1 = require("lucide-react");
// Validation schema
var backupConfigSchema = z.object({
  // Basic Configuration
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  // Backup Type & Source
  type: z.enum(["FULL", "INCREMENTAL", "DIFFERENTIAL", "DATABASE", "FILES"]),
  source_type: z.enum(["DATABASE", "DIRECTORY", "FILES"]),
  source_config: z.object({
    database_url: z.string().optional(),
    directory_path: z.string().optional(),
    file_patterns: z.array(z.string()).optional(),
    exclude_patterns: z.array(z.string()).optional(),
  }),
  // Schedule Configuration
  schedule_frequency: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
  schedule_config: z.object({
    cron_expression: z.string().optional(),
    time_of_day: z.string().optional(),
    day_of_week: z.number().optional(),
    day_of_month: z.number().optional(),
    timezone: z.string().default("UTC"),
  }),
  // Storage Configuration
  storage_provider: z.enum(["LOCAL", "S3", "GCS", "AZURE"]),
  storage_config: z.object({
    // Local
    local_path: z.string().optional(),
    // AWS S3
    s3_bucket: z.string().optional(),
    s3_region: z.string().optional(),
    s3_access_key: z.string().optional(),
    s3_secret_key: z.string().optional(),
    // Google Cloud
    gcs_bucket: z.string().optional(),
    gcs_project_id: z.string().optional(),
    gcs_key_file: z.string().optional(),
    // Azure
    azure_container: z.string().optional(),
    azure_account: z.string().optional(),
    azure_key: z.string().optional(),
  }),
  // Retention Policy
  retention_policy: z.object({
    daily: z.number().min(1).max(365).default(7),
    weekly: z.number().min(0).max(52).default(4),
    monthly: z.number().min(0).max(12).default(3),
    yearly: z.number().min(0).max(10).default(1),
  }),
  // Compression & Encryption
  compression_enabled: z.boolean().default(true),
  compression_level: z.number().min(1).max(9).default(6),
  encryption_enabled: z.boolean().default(true),
  encryption_key: z.string().optional(),
  // Notifications
  notification_config: z.object({
    on_success: z.boolean().default(false),
    on_failure: z.boolean().default(true),
    email_recipients: z.array(z.string().email()).optional(),
    webhook_url: z.string().url().optional(),
  }),
  // Advanced Options
  parallel_uploads: z.number().min(1).max(10).default(3),
  chunk_size_mb: z.number().min(1).max(1024).default(64),
  verify_integrity: z.boolean().default(true),
  test_restore: z.boolean().default(false),
});
var BackupConfigForm = function (_a) {
  var initialData = _a.initialData,
    onSubmit = _a.onSubmit,
    onCancel = _a.onCancel,
    _b = _a.isEditing,
    isEditing = _b === void 0 ? false : _b;
  var _c = (0, react_1.useState)(false),
    isSubmitting = _c[0],
    setIsSubmitting = _c[1];
  var _d = (0, react_1.useState)("idle"),
    testConnection = _d[0],
    setTestConnection = _d[1];
  var _e = (0, react_1.useState)("basic"),
    activeTab = _e[0],
    setActiveTab = _e[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(backupConfigSchema),
    defaultValues: __assign(
      {
        enabled: true,
        type: "FULL",
        source_type: "DATABASE",
        schedule_frequency: "DAILY",
        storage_provider: "LOCAL",
        compression_enabled: true,
        compression_level: 6,
        encryption_enabled: true,
        parallel_uploads: 3,
        chunk_size_mb: 64,
        verify_integrity: true,
        test_restore: false,
        source_config: {},
        schedule_config: {
          timezone: "UTC",
        },
        storage_config: {},
        retention_policy: {
          daily: 7,
          weekly: 4,
          monthly: 3,
          yearly: 1,
        },
        notification_config: {
          on_success: false,
          on_failure: true,
        },
      },
      initialData,
    ),
  });
  var watchedValues = form.watch();
  // Handle form submission
  var handleSubmit = function (data) {
    return __awaiter(void 0, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsSubmitting(true);
            return [4 /*yield*/, onSubmit(data)];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Error submitting form:", error_1);
            return [3 /*break*/, 4];
          case 3:
            setIsSubmitting(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Test storage connection
  var handleTestConnection = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setTestConnection("testing");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            // Simulate connection test
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 2000);
              }),
            ];
          case 2:
            // Simulate connection test
            _a.sent();
            setTestConnection("success");
            setTimeout(function () {
              return setTestConnection("idle");
            }, 3000);
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            setTestConnection("error");
            setTimeout(function () {
              return setTestConnection("idle");
            }, 3000);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Generate cron expression based on frequency
  var generateCronExpression = function (frequency, config) {
    switch (frequency) {
      case "HOURLY":
        return "0 * * * *";
      case "DAILY":
        var hour = config.time_of_day
          ? new Date("2000-01-01T".concat(config.time_of_day)).getHours()
          : 2;
        return "0 ".concat(hour, " * * *");
      case "WEEKLY":
        var weekHour = config.time_of_day
          ? new Date("2000-01-01T".concat(config.time_of_day)).getHours()
          : 2;
        var dayOfWeek = config.day_of_week || 0;
        return "0 ".concat(weekHour, " * * ").concat(dayOfWeek);
      case "MONTHLY":
        var monthHour = config.time_of_day
          ? new Date("2000-01-01T".concat(config.time_of_day)).getHours()
          : 2;
        var dayOfMonth = config.day_of_month || 1;
        return "0 ".concat(monthHour, " ").concat(dayOfMonth, " * *");
      default:
        return config.cron_expression || "0 2 * * *";
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Backup Configuration" : "Create Backup Configuration"}
          </h2>
          <p className="text-muted-foreground">Configure your backup settings and schedule</p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" onClick={onCancel}>
            Cancel
          </button_1.Button>
          <button_1.Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
            <lucide_react_1.Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </button_1.Button>
        </div>
      </div>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <tabs_1.TabsList className="grid w-full grid-cols-6">
              <tabs_1.TabsTrigger value="basic">Basic</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="source">Source</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="schedule">Schedule</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="storage">Storage</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="retention">Retention</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="advanced">Advanced</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            {/* Basic Configuration */}
            <tabs_1.TabsContent value="basic" className="space-y-4">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.Settings className="h-5 w-5" />
                    <span>Basic Configuration</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Configure the basic settings for your backup
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="name"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Backup Name</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="My Database Backup" {...field} />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              A unique name for this backup configuration
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="type"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Backup Type</form_1.FormLabel>
                            <select_1.Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <form_1.FormControl>
                                <select_1.SelectTrigger>
                                  <select_1.SelectValue placeholder="Select backup type" />
                                </select_1.SelectTrigger>
                              </form_1.FormControl>
                              <select_1.SelectContent>
                                <select_1.SelectItem value="FULL">Full Backup</select_1.SelectItem>
                                <select_1.SelectItem value="INCREMENTAL">
                                  Incremental
                                </select_1.SelectItem>
                                <select_1.SelectItem value="DIFFERENTIAL">
                                  Differential
                                </select_1.SelectItem>
                                <select_1.SelectItem value="DATABASE">
                                  Database Only
                                </select_1.SelectItem>
                                <select_1.SelectItem value="FILES">Files Only</select_1.SelectItem>
                              </select_1.SelectContent>
                            </select_1.Select>
                            <form_1.FormDescription>
                              Type of backup to perform
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  <form_1.FormField
                    control={form.control}
                    name="description"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Description</form_1.FormLabel>
                          <form_1.FormControl>
                            <textarea_1.Textarea
                              placeholder="Describe what this backup includes..."
                              {...field}
                            />
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Optional description of this backup configuration
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
                    name="enabled"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">Enable Backup</form_1.FormLabel>
                            <form_1.FormDescription>
                              Whether this backup configuration is active
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </form_1.FormControl>
                        </form_1.FormItem>
                      );
                    }}
                  />
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Source Configuration */}
            <tabs_1.TabsContent value="source" className="space-y-4">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.Database className="h-5 w-5" />
                    <span>Source Configuration</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>Configure what data to backup</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <form_1.FormField
                    control={form.control}
                    name="source_type"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Source Type</form_1.FormLabel>
                          <select_1.Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <form_1.FormControl>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Select source type" />
                              </select_1.SelectTrigger>
                            </form_1.FormControl>
                            <select_1.SelectContent>
                              <select_1.SelectItem value="DATABASE">Database</select_1.SelectItem>
                              <select_1.SelectItem value="DIRECTORY">Directory</select_1.SelectItem>
                              <select_1.SelectItem value="FILES">
                                Specific Files
                              </select_1.SelectItem>
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormDescription>
                            What type of data source to backup
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  {watchedValues.source_type === "DATABASE" && (
                    <form_1.FormField
                      control={form.control}
                      name="source_config.database_url"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Database URL</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="password"
                                placeholder="postgresql://user:pass@host:port/db"
                                {...field}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Connection string for the database
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  )}

                  {watchedValues.source_type === "DIRECTORY" && (
                    <form_1.FormField
                      control={form.control}
                      name="source_config.directory_path"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Directory Path</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="/path/to/directory" {...field} />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Path to the directory to backup
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  )}

                  <accordion_1.Accordion type="single" collapsible>
                    <accordion_1.AccordionItem value="patterns">
                      <accordion_1.AccordionTrigger>
                        File Patterns (Optional)
                      </accordion_1.AccordionTrigger>
                      <accordion_1.AccordionContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <form_1.FormLabel>Include Patterns</form_1.FormLabel>
                            <textarea_1.Textarea
                              placeholder="*.sql\n*.json\n*.txt"
                              className="mt-2"
                            />
                            <form_1.FormDescription>
                              File patterns to include (one per line)
                            </form_1.FormDescription>
                          </div>
                          <div>
                            <form_1.FormLabel>Exclude Patterns</form_1.FormLabel>
                            <textarea_1.Textarea
                              placeholder="*.log\n*.tmp\n*.cache"
                              className="mt-2"
                            />
                            <form_1.FormDescription>
                              File patterns to exclude (one per line)
                            </form_1.FormDescription>
                          </div>
                        </div>
                      </accordion_1.AccordionContent>
                    </accordion_1.AccordionItem>
                  </accordion_1.Accordion>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Schedule Configuration */}
            <tabs_1.TabsContent value="schedule" className="space-y-4">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.Calendar className="h-5 w-5" />
                    <span>Schedule Configuration</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>Configure when backups should run</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <form_1.FormField
                    control={form.control}
                    name="schedule_frequency"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Frequency</form_1.FormLabel>
                          <select_1.Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <form_1.FormControl>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Select frequency" />
                              </select_1.SelectTrigger>
                            </form_1.FormControl>
                            <select_1.SelectContent>
                              <select_1.SelectItem value="HOURLY">Hourly</select_1.SelectItem>
                              <select_1.SelectItem value="DAILY">Daily</select_1.SelectItem>
                              <select_1.SelectItem value="WEEKLY">Weekly</select_1.SelectItem>
                              <select_1.SelectItem value="MONTHLY">Monthly</select_1.SelectItem>
                              <select_1.SelectItem value="CUSTOM">
                                Custom (Cron)
                              </select_1.SelectItem>
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  {watchedValues.schedule_frequency !== "HOURLY" &&
                    watchedValues.schedule_frequency !== "CUSTOM" && (
                      <form_1.FormField
                        control={form.control}
                        name="schedule_config.time_of_day"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Time of Day</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input type="time" {...field} />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                What time to run the backup
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    )}

                  {watchedValues.schedule_frequency === "WEEKLY" && (
                    <form_1.FormField
                      control={form.control}
                      name="schedule_config.day_of_week"
                      render={function (_a) {
                        var _b;
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Day of Week</form_1.FormLabel>
                            <select_1.Select
                              onValueChange={function (value) {
                                return field.onChange(parseInt(value));
                              }}
                              defaultValue={
                                (_b = field.value) === null || _b === void 0
                                  ? void 0
                                  : _b.toString()
                              }
                            >
                              <form_1.FormControl>
                                <select_1.SelectTrigger>
                                  <select_1.SelectValue placeholder="Select day" />
                                </select_1.SelectTrigger>
                              </form_1.FormControl>
                              <select_1.SelectContent>
                                <select_1.SelectItem value="0">Sunday</select_1.SelectItem>
                                <select_1.SelectItem value="1">Monday</select_1.SelectItem>
                                <select_1.SelectItem value="2">Tuesday</select_1.SelectItem>
                                <select_1.SelectItem value="3">Wednesday</select_1.SelectItem>
                                <select_1.SelectItem value="4">Thursday</select_1.SelectItem>
                                <select_1.SelectItem value="5">Friday</select_1.SelectItem>
                                <select_1.SelectItem value="6">Saturday</select_1.SelectItem>
                              </select_1.SelectContent>
                            </select_1.Select>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  )}

                  {watchedValues.schedule_frequency === "MONTHLY" && (
                    <form_1.FormField
                      control={form.control}
                      name="schedule_config.day_of_month"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Day of Month</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="1"
                                max="31"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value));
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Which day of the month (1-31)
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  )}

                  {watchedValues.schedule_frequency === "CUSTOM" && (
                    <form_1.FormField
                      control={form.control}
                      name="schedule_config.cron_expression"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Cron Expression</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="0 2 * * *" {...field} />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Custom cron expression (minute hour day month weekday)
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  )}

                  <form_1.FormField
                    control={form.control}
                    name="schedule_config.timezone"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Timezone</form_1.FormLabel>
                          <select_1.Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <form_1.FormControl>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Select timezone" />
                              </select_1.SelectTrigger>
                            </form_1.FormControl>
                            <select_1.SelectContent>
                              <select_1.SelectItem value="UTC">UTC</select_1.SelectItem>
                              <select_1.SelectItem value="America/New_York">
                                Eastern Time
                              </select_1.SelectItem>
                              <select_1.SelectItem value="America/Chicago">
                                Central Time
                              </select_1.SelectItem>
                              <select_1.SelectItem value="America/Denver">
                                Mountain Time
                              </select_1.SelectItem>
                              <select_1.SelectItem value="America/Los_Angeles">
                                Pacific Time
                              </select_1.SelectItem>
                              <select_1.SelectItem value="Europe/London">
                                London
                              </select_1.SelectItem>
                              <select_1.SelectItem value="Europe/Paris">Paris</select_1.SelectItem>
                              <select_1.SelectItem value="Asia/Tokyo">Tokyo</select_1.SelectItem>
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  {/* Preview */}
                  <alert_1.Alert>
                    <lucide_react_1.Info className="h-4 w-4" />
                    <alert_1.AlertDescription>
                      <strong>Schedule Preview:</strong>{" "}
                      {generateCronExpression(
                        watchedValues.schedule_frequency,
                        watchedValues.schedule_config,
                      )}
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Storage Configuration */}
            <tabs_1.TabsContent value="storage" className="space-y-4">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.HardDrive className="h-5 w-5" />
                    <span>Storage Configuration</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Configure where backups are stored
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <form_1.FormField
                    control={form.control}
                    name="storage_provider"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Storage Provider</form_1.FormLabel>
                          <select_1.Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <form_1.FormControl>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Select storage provider" />
                              </select_1.SelectTrigger>
                            </form_1.FormControl>
                            <select_1.SelectContent>
                              <select_1.SelectItem value="LOCAL">Local Storage</select_1.SelectItem>
                              <select_1.SelectItem value="S3">Amazon S3</select_1.SelectItem>
                              <select_1.SelectItem value="GCS">
                                Google Cloud Storage
                              </select_1.SelectItem>
                              <select_1.SelectItem value="AZURE">
                                Azure Blob Storage
                              </select_1.SelectItem>
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  {/* Local Storage */}
                  {watchedValues.storage_provider === "LOCAL" && (
                    <form_1.FormField
                      control={form.control}
                      name="storage_config.local_path"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Local Path</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input placeholder="/path/to/backups" {...field} />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Directory where backups will be stored
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  )}

                  {/* AWS S3 */}
                  {watchedValues.storage_provider === "S3" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="storage_config.s3_bucket"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>S3 Bucket</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="my-backup-bucket" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                        <form_1.FormField
                          control={form.control}
                          name="storage_config.s3_region"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Region</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="us-east-1" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="storage_config.s3_access_key"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Access Key</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input type="password" placeholder="AKIA..." {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                        <form_1.FormField
                          control={form.control}
                          name="storage_config.s3_secret_key"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Secret Key</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="password"
                                    placeholder="Secret key"
                                    {...field}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Google Cloud Storage */}
                  {watchedValues.storage_provider === "GCS" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="storage_config.gcs_bucket"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>GCS Bucket</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="my-backup-bucket" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                        <form_1.FormField
                          control={form.control}
                          name="storage_config.gcs_project_id"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Project ID</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="my-project-id" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>
                      <form_1.FormField
                        control={form.control}
                        name="storage_config.gcs_key_file"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Service Account Key File</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  placeholder="/path/to/service-account.json"
                                  {...field}
                                />
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                  )}

                  {/* Azure Blob Storage */}
                  {watchedValues.storage_provider === "AZURE" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="storage_config.azure_container"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Container</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="backups" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                        <form_1.FormField
                          control={form.control}
                          name="storage_config.azure_account"
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Storage Account</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input placeholder="mystorageaccount" {...field} />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>
                      <form_1.FormField
                        control={form.control}
                        name="storage_config.azure_key"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Access Key</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="password"
                                  placeholder="Storage account key"
                                  {...field}
                                />
                              </form_1.FormControl>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                  )}

                  {/* Test Connection */}
                  <div className="flex items-center space-x-2">
                    <button_1.Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testConnection === "testing"}
                    >
                      <lucide_react_1.TestTube className="h-4 w-4 mr-2" />
                      {testConnection === "testing" ? "Testing..." : "Test Connection"}
                    </button_1.Button>
                    {testConnection === "success" && (
                      <badge_1.Badge variant="default" className="bg-green-500">
                        Connection successful
                      </badge_1.Badge>
                    )}
                    {testConnection === "error" && (
                      <badge_1.Badge variant="destructive">Connection failed</badge_1.Badge>
                    )}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Retention Policy */}
            <tabs_1.TabsContent value="retention" className="space-y-4">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.Clock className="h-5 w-5" />
                    <span>Retention Policy</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Configure how long to keep backups
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="retention_policy.daily"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Daily Backups</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="1"
                                max="365"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value));
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Keep daily backups for this many days
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                    <form_1.FormField
                      control={form.control}
                      name="retention_policy.weekly"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Weekly Backups</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="0"
                                max="52"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value));
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Keep weekly backups for this many weeks
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="retention_policy.monthly"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Monthly Backups</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="0"
                                max="12"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value));
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Keep monthly backups for this many months
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                    <form_1.FormField
                      control={form.control}
                      name="retention_policy.yearly"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Yearly Backups</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="0"
                                max="10"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value));
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Keep yearly backups for this many years
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Advanced Options */}
            <tabs_1.TabsContent value="advanced" className="space-y-4">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.Shield className="h-5 w-5" />
                    <span>Advanced Options</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Configure advanced backup settings
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  {/* Compression & Encryption */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Compression & Encryption</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <form_1.FormField
                        control={form.control}
                        name="compression_enabled"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">
                                  Enable Compression
                                </form_1.FormLabel>
                                <form_1.FormDescription>
                                  Compress backups to save space
                                </form_1.FormDescription>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </form_1.FormControl>
                            </form_1.FormItem>
                          );
                        }}
                      />
                      <form_1.FormField
                        control={form.control}
                        name="encryption_enabled"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">
                                  Enable Encryption
                                </form_1.FormLabel>
                                <form_1.FormDescription>
                                  Encrypt backups for security
                                </form_1.FormDescription>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </form_1.FormControl>
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                    {watchedValues.compression_enabled && (
                      <form_1.FormField
                        control={form.control}
                        name="compression_level"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Compression Level (1-9)</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="number"
                                  min="1"
                                  max="9"
                                  {...field}
                                  onChange={function (e) {
                                    return field.onChange(parseInt(e.target.value));
                                  }}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Higher levels = better compression but slower
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    )}
                    {watchedValues.encryption_enabled && (
                      <form_1.FormField
                        control={form.control}
                        name="encryption_key"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Encryption Key</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="password"
                                  placeholder="Enter encryption key"
                                  {...field}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Strong encryption key for backup security
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    )}
                  </div>

                  {/* Performance */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Performance</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <form_1.FormField
                        control={form.control}
                        name="parallel_uploads"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Parallel Uploads</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  {...field}
                                  onChange={function (e) {
                                    return field.onChange(parseInt(e.target.value));
                                  }}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Number of parallel upload threads
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                      <form_1.FormField
                        control={form.control}
                        name="chunk_size_mb"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Chunk Size (MB)</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="number"
                                  min="1"
                                  max="1024"
                                  {...field}
                                  onChange={function (e) {
                                    return field.onChange(parseInt(e.target.value));
                                  }}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Size of upload chunks in megabytes
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Verification</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <form_1.FormField
                        control={form.control}
                        name="verify_integrity"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">
                                  Verify Integrity
                                </form_1.FormLabel>
                                <form_1.FormDescription>
                                  Verify backup integrity after creation
                                </form_1.FormDescription>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </form_1.FormControl>
                            </form_1.FormItem>
                          );
                        }}
                      />
                      <form_1.FormField
                        control={form.control}
                        name="test_restore"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">
                                  Test Restore
                                </form_1.FormLabel>
                                <form_1.FormDescription>
                                  Perform test restore to verify backup
                                </form_1.FormDescription>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </form_1.FormControl>
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notifications</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <form_1.FormField
                        control={form.control}
                        name="notification_config.on_success"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">
                                  Notify on Success
                                </form_1.FormLabel>
                                <form_1.FormDescription>
                                  Send notification when backup succeeds
                                </form_1.FormDescription>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </form_1.FormControl>
                            </form_1.FormItem>
                          );
                        }}
                      />
                      <form_1.FormField
                        control={form.control}
                        name="notification_config.on_failure"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <form_1.FormLabel className="text-base">
                                  Notify on Failure
                                </form_1.FormLabel>
                                <form_1.FormDescription>
                                  Send notification when backup fails
                                </form_1.FormDescription>
                              </div>
                              <form_1.FormControl>
                                <switch_1.Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </form_1.FormControl>
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </form>
      </form_1.Form>
    </div>
  );
};
exports.default = BackupConfigForm;
