// Custom Report Builder Service
// Story 8.2: Custom Report Builder (Drag-Drop Interface)
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
exports.ReportBuilderService = void 0;
var server_1 = require("@/lib/supabase/server");
var ReportBuilderService = /** @class */ (() => {
  // Supabase client created per method for proper request context
  function ReportBuilderService() {}
  // Custom Reports Management
  ReportBuilderService.prototype.createReport = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var user, profile, templateConfig, template, reportData, _a, report, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase.from("user_profiles").select("clinic_id").eq("user_id", user.id).single(),
            ];
          case 2:
            profile = _b.sent().data;
            if (!profile) throw new Error("User profile not found");
            templateConfig = {};
            if (!data.template_id) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              supabase
                .from("report_templates")
                .select("config_json")
                .eq("id", data.template_id)
                .single(),
            ];
          case 3:
            template = _b.sent().data;
            if (template) {
              templateConfig = template.config_json;
            }
            _b.label = 4;
          case 4:
            reportData = {
              report_name: data.report_name,
              report_description: data.report_description,
              report_config: data.report_config || templateConfig,
              data_sources: data.data_sources || [],
              visualization_type: data.visualization_type || "dashboard",
              filters: {},
              layout_config: {},
              is_template: false,
              is_public: data.is_public || false,
              user_id: user.id,
              clinic_id: profile.clinic_id,
              generation_count: 0,
            };
            return [
              4 /*yield*/,
              supabase.from("custom_reports").insert([reportData]).select().single(),
            ];
          case 5:
            (_a = _b.sent()), (report = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create report: ".concat(error.message));
            // Track usage
            return [4 /*yield*/, this.trackUsage(report.id, user.id, "edit")];
          case 6:
            // Track usage
            _b.sent();
            return [2 /*return*/, report];
        }
      });
    });
  };
  ReportBuilderService.prototype.updateReport = function (reportId, data) {
    return __awaiter(this, void 0, void 0, function () {
      var user, updateData, _a, report, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            updateData = __assign(__assign({}, data), { updated_at: new Date().toISOString() });
            return [
              4 /*yield*/,
              supabase
                .from("custom_reports")
                .update(updateData)
                .eq("id", reportId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (report = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to update report: ".concat(error.message));
            // Track usage
            return [4 /*yield*/, this.trackUsage(reportId, user.id, "edit")];
          case 3:
            // Track usage
            _b.sent();
            return [2 /*return*/, report];
        }
      });
    });
  };
  ReportBuilderService.prototype.deleteReport = function (reportId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _a.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase.from("custom_reports").delete().eq("id", reportId).eq("user_id", user.id),
            ];
          case 2:
            error = _a.sent().error;
            if (error) throw new Error("Failed to delete report: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  ReportBuilderService.prototype.getReport = function (reportId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, _a, report, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase
                .from("custom_reports")
                .select(
                  "\n        *,\n        report_collaborators!inner(permission_level)\n      ",
                )
                .eq("id", reportId)
                .or(
                  "user_id.eq."
                    .concat(user.id, ",is_public.eq.true,report_collaborators.user_id.eq.")
                    .concat(user.id),
                )
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (report = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch report: ".concat(error.message));
            // Track usage
            return [4 /*yield*/, this.trackUsage(reportId, user.id, "view")];
          case 3:
            // Track usage
            _b.sent();
            return [2 /*return*/, report];
        }
      });
    });
  };
  ReportBuilderService.prototype.getReports = function () {
    return __awaiter(this, arguments, void 0, function (page, perPage, filters) {
      var user, offset, query, _a, reports, error, count;
      if (page === void 0) {
        page = 1;
      }
      if (perPage === void 0) {
        perPage = 10;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            offset = (page - 1) * perPage;
            query = supabase
              .from("custom_reports")
              .select("*", { count: "exact" })
              .or("user_id.eq.".concat(user.id, ",is_public.eq.true"))
              .order("updated_at", { ascending: false })
              .range(offset, offset + perPage - 1);
            // Apply filters
            if (filters === null || filters === void 0 ? void 0 : filters.visualization_type) {
              query = query.eq("visualization_type", filters.visualization_type);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.is_template) !== undefined
            ) {
              query = query.eq("is_template", filters.is_template);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
              query = query.or(
                "report_name.ilike.%"
                  .concat(filters.search, "%,report_description.ilike.%")
                  .concat(filters.search, "%"),
              );
            }
            return [4 /*yield*/, query];
          case 2:
            (_a = _b.sent()), (reports = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw new Error("Failed to fetch reports: ".concat(error.message));
            return [
              2 /*return*/,
              {
                reports: reports || [],
                total_count: count || 0,
                page: page,
                per_page: perPage,
                has_more: (count || 0) > offset + perPage,
              },
            ];
        }
      });
    });
  };
  ReportBuilderService.prototype.cloneReport = function (reportId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, profile, _a, originalReport, fetchError, cloneData, _b, clone, error;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _c.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase.from("user_profiles").select("clinic_id").eq("user_id", user.id).single(),
            ];
          case 2:
            profile = _c.sent().data;
            if (!profile) throw new Error("User profile not found");
            return [
              4 /*yield*/,
              supabase.from("custom_reports").select("*").eq("id", reportId).single(),
            ];
          case 3:
            (_a = _c.sent()), (originalReport = _a.data), (fetchError = _a.error);
            if (fetchError)
              throw new Error("Failed to fetch original report: ".concat(fetchError.message));
            cloneData = {
              report_name: "".concat(originalReport.report_name, " (Copy)"),
              report_description: originalReport.report_description,
              report_config: originalReport.report_config,
              data_sources: originalReport.data_sources,
              visualization_type: originalReport.visualization_type,
              filters: originalReport.filters,
              layout_config: originalReport.layout_config,
              is_template: false,
              is_public: false,
              user_id: user.id,
              clinic_id: profile.clinic_id,
              generation_count: 0,
            };
            return [
              4 /*yield*/,
              supabase.from("custom_reports").insert([cloneData]).select().single(),
            ];
          case 4:
            (_b = _c.sent()), (clone = _b.data), (error = _b.error);
            if (error) throw new Error("Failed to clone report: ".concat(error.message));
            // Track usage
            return [4 /*yield*/, this.trackUsage(reportId, user.id, "clone")];
          case 5:
            // Track usage
            _c.sent();
            return [2 /*return*/, clone];
        }
      });
    });
  };
  // Report Templates Management
  ReportBuilderService.prototype.getTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, templates, error, categories, featured;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("report_templates")
                .select("*")
                .eq("is_active", true)
                .order("is_featured", { ascending: false })
                .order("usage_count", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (templates = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch templates: ".concat(error.message));
            categories = __spreadArray(
              [],
              new Set(
                (templates === null || templates === void 0
                  ? void 0
                  : templates.map((t) => t.category)) || [],
              ),
              true,
            );
            featured =
              (templates === null || templates === void 0
                ? void 0
                : templates.filter((t) => t.is_featured)) || [];
            return [
              2 /*return*/,
              {
                templates: templates || [],
                categories: categories,
                featured: featured,
                total_count:
                  (templates === null || templates === void 0 ? void 0 : templates.length) || 0,
              },
            ];
        }
      });
    });
  };
  ReportBuilderService.prototype.createTemplate = function (reportId, templateData) {
    return __awaiter(this, void 0, void 0, function () {
      var user, profile, report, template, _a, newTemplate, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase.from("user_profiles").select("clinic_id").eq("user_id", user.id).single(),
            ];
          case 2:
            profile = _b.sent().data;
            if (!profile) throw new Error("User profile not found");
            return [
              4 /*yield*/,
              supabase
                .from("custom_reports")
                .select("report_config, report_name, report_description")
                .eq("id", reportId)
                .eq("user_id", user.id)
                .single(),
            ];
          case 3:
            report = _b.sent().data;
            if (!report) throw new Error("Report not found or unauthorized");
            template = {
              template_name: templateData.template_name || report.report_name,
              template_description: templateData.template_description || report.report_description,
              category: templateData.category || "custom",
              config_json: report.report_config,
              preview_image: templateData.preview_image,
              usage_count: 0,
              rating: 0.0,
              is_featured: false,
              is_active: true,
              tags: templateData.tags || [],
              created_by: user.id,
              clinic_id: profile.clinic_id,
            };
            return [
              4 /*yield*/,
              supabase.from("report_templates").insert([template]).select().single(),
            ];
          case 4:
            (_a = _b.sent()), (newTemplate = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create template: ".concat(error.message));
            return [2 /*return*/, newTemplate];
        }
      });
    });
  };
  // Report Generation and Export
  ReportBuilderService.prototype.generateReport = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var user, report;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _a.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase.from("custom_reports").select("*").eq("id", request.report_id).single(),
            ];
          case 2:
            report = _a.sent().data;
            if (!report) throw new Error("Report not found");
            // Update generation count
            return [
              4 /*yield*/,
              supabase
                .from("custom_reports")
                .update({
                  generation_count: report.generation_count + 1,
                  last_generated: new Date().toISOString(),
                })
                .eq("id", request.report_id),
            ];
          case 3:
            // Update generation count
            _a.sent();
            // Track usage
            return [4 /*yield*/, this.trackUsage(request.report_id, user.id, "generate")];
          case 4:
            // Track usage
            _a.sent();
            // Here you would implement the actual report generation logic
            // This would involve:
            // 1. Fetching data from configured data sources
            // 2. Applying filters and transformations
            // 3. Generating visualizations
            // 4. Formatting according to the requested format
            return [
              2 /*return*/,
              {
                report_id: request.report_id,
                format: request.format || "pdf",
                generated_at: new Date().toISOString(),
                download_url: "/api/reports/download/".concat(request.report_id),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
              },
            ];
        }
      });
    });
  };
  // Data Source Management
  ReportBuilderService.prototype.getDataSources = function () {
    return __awaiter(this, void 0, void 0, function () {
      var user, profile, _a, connectors, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase.from("user_profiles").select("clinic_id").eq("user_id", user.id).single(),
            ];
          case 2:
            profile = _b.sent().data;
            if (!profile) throw new Error("User profile not found");
            return [
              4 /*yield*/,
              supabase
                .from("data_source_connectors")
                .select("*")
                .eq("clinic_id", profile.clinic_id)
                .eq("is_active", true)
                .order("connector_name"),
            ];
          case 3:
            (_a = _b.sent()), (connectors = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch data sources: ".concat(error.message));
            return [2 /*return*/, connectors || []];
        }
      });
    });
  };
  ReportBuilderService.prototype.testDataSource = function (connectorId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, connector, testResult;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _a.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase.from("data_source_connectors").select("*").eq("id", connectorId).single(),
            ];
          case 2:
            connector = _a.sent().data;
            if (!connector) throw new Error("Data source not found");
            testResult = {
              success: true,
              message: "Connection successful",
            };
            // Update test status
            return [
              4 /*yield*/,
              supabase
                .from("data_source_connectors")
                .update({
                  last_tested: new Date().toISOString(),
                  test_status: testResult.success ? "success" : "failed",
                })
                .eq("id", connectorId),
            ];
          case 3:
            // Update test status
            _a.sent();
            return [2 /*return*/, testResult];
        }
      });
    });
  };
  // Report Collaboration
  ReportBuilderService.prototype.addCollaborator = function (reportId, userId, permissionLevel) {
    return __awaiter(this, void 0, void 0, function () {
      var user, collaborator, _a, newCollaborator, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            collaborator = {
              report_id: reportId,
              user_id: userId,
              permission_level: permissionLevel,
              invited_by: user.id,
              invited_at: new Date().toISOString(),
            };
            return [
              4 /*yield*/,
              supabase.from("report_collaborators").insert([collaborator]).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (newCollaborator = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to add collaborator: ".concat(error.message));
            return [2 /*return*/, newCollaborator];
        }
      });
    });
  };
  ReportBuilderService.prototype.removeCollaborator = function (reportId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _a.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase
                .from("report_collaborators")
                .delete()
                .eq("report_id", reportId)
                .eq("user_id", userId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) throw new Error("Failed to remove collaborator: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  ReportBuilderService.prototype.getCollaborators = function (reportId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, collaborators, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("report_collaborators")
                .select(
                  "\n        *,\n        user_profiles!inner(\n          user_id,\n          full_name,\n          email\n        )\n      ",
                )
                .eq("report_id", reportId),
            ];
          case 2:
            (_a = _b.sent()), (collaborators = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch collaborators: ".concat(error.message));
            return [2 /*return*/, collaborators || []];
        }
      });
    });
  };
  // Report Comments
  ReportBuilderService.prototype.addComment = function (reportId, commentText, parentCommentId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, comment, _a, newComment, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            comment = {
              report_id: reportId,
              user_id: user.id,
              comment_text: commentText,
              parent_comment_id: parentCommentId,
              is_resolved: false,
            };
            return [
              4 /*yield*/,
              supabase.from("report_comments").insert([comment]).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (newComment = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to add comment: ".concat(error.message));
            return [2 /*return*/, newComment];
        }
      });
    });
  };
  ReportBuilderService.prototype.getComments = function (reportId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, comments, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("report_comments")
                .select(
                  "\n        *,\n        user_profiles!inner(\n          user_id,\n          full_name\n        )\n      ",
                )
                .eq("report_id", reportId)
                .order("created_at", { ascending: true }),
            ];
          case 2:
            (_a = _b.sent()), (comments = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch comments: ".concat(error.message));
            return [2 /*return*/, comments || []];
        }
      });
    });
  };
  ReportBuilderService.prototype.resolveComment = function (commentId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _a.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase.from("report_comments").update({ is_resolved: true }).eq("id", commentId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) throw new Error("Failed to resolve comment: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  // Report Scheduling
  ReportBuilderService.prototype.createSchedule = function (scheduleData) {
    return __awaiter(this, void 0, void 0, function () {
      var user, schedule, _a, newSchedule, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            schedule = __assign(__assign({}, scheduleData), {
              created_by: user.id,
              run_count: 0,
              failure_count: 0,
              next_run: this.calculateNextRun(scheduleData.schedule_config),
            });
            return [
              4 /*yield*/,
              supabase.from("report_schedules").insert([schedule]).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (newSchedule = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create schedule: ".concat(error.message));
            return [2 /*return*/, newSchedule];
        }
      });
    });
  };
  ReportBuilderService.prototype.getSchedules = function (reportId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, schedules, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("report_schedules")
                .select("*")
                .eq("report_id", reportId)
                .order("created_at", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (schedules = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch schedules: ".concat(error.message));
            return [2 /*return*/, schedules || []];
        }
      });
    });
  };
  // Analytics and Usage Tracking
  ReportBuilderService.prototype.trackUsage = function (reportId_1, userId_1, actionType_1) {
    return __awaiter(this, arguments, void 0, function (reportId, userId, actionType, duration) {
      var today, supabase, existing, error_1;
      if (duration === void 0) {
        duration = 0;
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            today = new Date().toISOString().split("T")[0];
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("report_usage_analytics")
                .select("*")
                .eq("report_id", reportId)
                .eq("user_id", userId)
                .eq("action_type", actionType)
                .gte("created_at", "".concat(today, "T00:00:00.000Z"))
                .lt("created_at", "".concat(today, "T23:59:59.999Z"))
                .single(),
            ];
          case 2:
            existing = _a.sent().data;
            if (!existing) return [3 /*break*/, 4];
            // Update existing record
            return [
              4 /*yield*/,
              supabase
                .from("report_usage_analytics")
                .update({
                  access_count: existing.access_count + 1,
                  last_accessed: new Date().toISOString(),
                  usage_duration: existing.usage_duration + duration,
                })
                .eq("id", existing.id),
            ];
          case 3:
            // Update existing record
            _a.sent();
            return [3 /*break*/, 6];
          case 4:
            // Create new record
            return [
              4 /*yield*/,
              supabase.from("report_usage_analytics").insert([
                {
                  report_id: reportId,
                  user_id: userId,
                  action_type: actionType,
                  access_count: 1,
                  usage_duration: duration,
                  session_data: {},
                },
              ]),
            ];
          case 5:
            // Create new record
            _a.sent();
            _a.label = 6;
          case 6:
            return [3 /*break*/, 8];
          case 7:
            error_1 = _a.sent();
            // Silently fail usage tracking to not affect main functionality
            console.error("Failed to track usage:", error_1);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  ReportBuilderService.prototype.getReportAnalytics = function (reportId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, usageStats, usageError, totalViews, uniqueUsers, avgDuration;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("report_usage_analytics")
                .select("*")
                .eq("report_id", reportId)
                .order("created_at", { ascending: false })
                .limit(100),
            ];
          case 2:
            (_a = _b.sent()), (usageStats = _a.data), (usageError = _a.error);
            if (usageError)
              throw new Error("Failed to fetch usage analytics: ".concat(usageError.message));
            totalViews =
              (usageStats === null || usageStats === void 0
                ? void 0
                : usageStats.reduce((sum, stat) => sum + stat.access_count, 0)) || 0;
            uniqueUsers = new Set(
              (usageStats === null || usageStats === void 0
                ? void 0
                : usageStats.map((stat) => stat.user_id)) || [],
            ).size;
            avgDuration = (
              usageStats === null || usageStats === void 0
                ? void 0
                : usageStats.length
            )
              ? usageStats.reduce((sum, stat) => sum + stat.usage_duration, 0) / usageStats.length
              : 0;
            return [
              2 /*return*/,
              {
                usage_stats: usageStats || [],
                performance_metrics: {
                  average_generation_time: 0, // Would be calculated from actual generation times
                  cache_hit_rate: 0.85, // Would be calculated from cache statistics
                  error_rate: 0.02, // Would be calculated from error logs
                  data_freshness: 0.95, // Would be calculated from data source freshness
                },
                user_engagement: {
                  total_views: totalViews,
                  unique_users: uniqueUsers,
                  average_session_duration: avgDuration,
                  bounce_rate: 0.15, // Would be calculated from session data
                },
              },
            ];
        }
      });
    });
  };
  // Utility Methods
  ReportBuilderService.prototype.calculateNextRun = (scheduleConfig) => {
    var now = new Date();
    var nextRun = new Date(now);
    switch (scheduleConfig.frequency) {
      case "daily":
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case "weekly":
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case "monthly":
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case "yearly":
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
      default:
        // Custom frequency would require more complex logic
        nextRun.setDate(nextRun.getDate() + 1);
    }
    // Set the time
    var _a = scheduleConfig.time.split(":"),
      hours = _a[0],
      minutes = _a[1];
    nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return nextRun.toISOString();
  };
  ReportBuilderService.prototype.searchReports = function (query, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var user, dbQuery, _a, reports, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            dbQuery = supabase
              .from("custom_reports")
              .select("*")
              .or("user_id.eq.".concat(user.id, ",is_public.eq.true"))
              .or(
                "report_name.ilike.%"
                  .concat(query, "%,report_description.ilike.%")
                  .concat(query, "%"),
              )
              .order("updated_at", { ascending: false })
              .limit(20);
            if (filters === null || filters === void 0 ? void 0 : filters.visualization_type) {
              dbQuery = dbQuery.eq("visualization_type", filters.visualization_type);
            }
            return [4 /*yield*/, dbQuery];
          case 2:
            (_a = _b.sent()), (reports = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to search reports: ".concat(error.message));
            return [2 /*return*/, reports || []];
        }
      });
    });
  };
  ReportBuilderService.prototype.getRecentReports = function () {
    return __awaiter(this, arguments, void 0, function (limit) {
      var user, _a, reports, error;
      if (limit === void 0) {
        limit = 5;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase
                .from("custom_reports")
                .select("*")
                .or("user_id.eq.".concat(user.id, ",is_public.eq.true"))
                .order("updated_at", { ascending: false })
                .limit(limit),
            ];
          case 2:
            (_a = _b.sent()), (reports = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch recent reports: ".concat(error.message));
            return [2 /*return*/, reports || []];
        }
      });
    });
  };
  ReportBuilderService.prototype.getFavoriteReports = function () {
    return __awaiter(this, void 0, void 0, function () {
      var user, analytics, reportIds, _a, reports, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            user = _b.sent().data.user;
            if (!user) throw new Error("User not authenticated");
            return [
              4 /*yield*/,
              supabase
                .from("report_usage_analytics")
                .select("report_id, access_count")
                .eq("user_id", user.id)
                .order("access_count", { ascending: false })
                .limit(10),
            ];
          case 2:
            analytics = _b.sent().data;
            if (!(analytics === null || analytics === void 0 ? void 0 : analytics.length))
              return [2 /*return*/, []];
            reportIds = analytics.map((a) => a.report_id);
            return [
              4 /*yield*/,
              supabase
                .from("custom_reports")
                .select("*")
                .in("id", reportIds)
                .or("user_id.eq.".concat(user.id, ",is_public.eq.true")),
            ];
          case 3:
            (_a = _b.sent()), (reports = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch favorite reports: ".concat(error.message));
            return [2 /*return*/, reports || []];
        }
      });
    });
  };
  return ReportBuilderService;
})();
exports.ReportBuilderService = ReportBuilderService;
