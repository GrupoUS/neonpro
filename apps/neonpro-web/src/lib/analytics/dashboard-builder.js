// Customizable Dashboard Builder System
// Description: Drag-and-drop dashboard builder with widget library and layout management
// Author: Dev Agent
// Date: 2025-01-26
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
exports.createDashboardBuilder = exports.DashboardBuilder = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var DashboardBuilder = /** @class */ (() => {
  function DashboardBuilder() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
    this.widgetLibrary = this.initializeWidgetLibrary();
    this.templates = [];
  }
  // Dashboard CRUD Operations
  DashboardBuilder.prototype.createDashboard = function (userId_1, name_1) {
    return __awaiter(this, arguments, void 0, function (userId, name, layoutType, templateId) {
      var initialLayout, template, _a, data, error, error_1;
      if (layoutType === void 0) {
        layoutType = "kpi_dashboard";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            initialLayout = void 0;
            if (!templateId) return [3 /*break*/, 2];
            return [4 /*yield*/, this.getTemplate(templateId)];
          case 1:
            template = _b.sent();
            if (!template) throw new Error("Template not found");
            initialLayout = {
              layout_name: name,
              layout_type: layoutType,
              widget_configuration: template.default_widgets,
              filters: template.default_filters,
              grid_layout: this.getDefaultGridLayout(),
            };
            return [3 /*break*/, 3];
          case 2:
            initialLayout = {
              layout_name: name,
              layout_type: layoutType,
              widget_configuration: [],
              filters: this.getDefaultFilters(),
              grid_layout: this.getDefaultGridLayout(),
            };
            _b.label = 3;
          case 3:
            return [
              4 /*yield*/,
              this.supabase
                .from("dashboard_layouts")
                .insert(__assign({ user_id: userId }, initialLayout))
                .select()
                .single(),
            ];
          case 4:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 5:
            error_1 = _b.sent();
            console.error("Error creating dashboard:", error_1);
            throw error_1;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  DashboardBuilder.prototype.updateDashboard = function (dashboardId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("dashboard_layouts")
                .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                .eq("id", dashboardId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 2:
            error_2 = _b.sent();
            console.error("Error updating dashboard:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DashboardBuilder.prototype.deleteDashboard = function (dashboardId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("dashboard_layouts").delete().eq("id", dashboardId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error deleting dashboard:", error_3);
            throw error_3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DashboardBuilder.prototype.getDashboard = function (dashboardId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("dashboard_layouts").select("*").eq("id", dashboardId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [2 /*return*/, data];
          case 2:
            error_4 = _b.sent();
            console.error("Error fetching dashboard:", error_4);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DashboardBuilder.prototype.getUserDashboards = function (userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, filters) {
      var query, _a, data, error, error_5;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("dashboard_layouts")
              .select("*")
              .or("user_id.eq.".concat(userId, ",is_shared.eq.true"));
            if (filters.layoutType) {
              query = query.eq("layout_type", filters.layoutType);
            }
            if (filters.isShared !== undefined) {
              query = query.eq("is_shared", filters.isShared);
            }
            if (filters.search) {
              query = query.ilike("layout_name", "%".concat(filters.search, "%"));
            }
            return [4 /*yield*/, query.order("updated_at", { ascending: false })];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 2:
            error_5 = _b.sent();
            console.error("Error fetching user dashboards:", error_5);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Widget Management
  DashboardBuilder.prototype.addWidget = function (layout, widgetType, position, kpiIds, config) {
    var widgetTemplate = this.widgetLibrary.find((w) => w.type === widgetType);
    if (!widgetTemplate) throw new Error("Widget type not found");
    var newWidget = {
      id: "widget_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
      type: widgetType,
      kpi_ids: kpiIds,
      position: position,
      configuration: __assign(__assign({}, widgetTemplate.defaultConfig), config),
    };
    var updatedLayout = __assign(__assign({}, layout), {
      widget_configuration: __spreadArray(
        __spreadArray([], layout.widget_configuration, true),
        [newWidget],
        false,
      ),
    });
    return updatedLayout;
  };
  DashboardBuilder.prototype.removeWidget = (layout, widgetId) =>
    __assign(__assign({}, layout), {
      widget_configuration: layout.widget_configuration.filter((w) => w.id !== widgetId),
    });
  DashboardBuilder.prototype.updateWidget = (layout, widgetId, updates) =>
    __assign(__assign({}, layout), {
      widget_configuration: layout.widget_configuration.map((widget) =>
        widget.id === widgetId ? __assign(__assign({}, widget), updates) : widget,
      ),
    });
  DashboardBuilder.prototype.duplicateWidget = (layout, widgetId) => {
    var widget = layout.widget_configuration.find((w) => w.id === widgetId);
    if (!widget) throw new Error("Widget not found");
    var duplicatedWidget = __assign(__assign({}, widget), {
      id: "widget_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
      position: __assign(__assign({}, widget.position), {
        x: widget.position.x + 1,
        y: widget.position.y + 1,
      }),
      configuration: __assign(__assign({}, widget.configuration), {
        title: "".concat(widget.configuration.title || "Widget", " (Copy)"),
      }),
    });
    return __assign(__assign({}, layout), {
      widget_configuration: __spreadArray(
        __spreadArray([], layout.widget_configuration, true),
        [duplicatedWidget],
        false,
      ),
    });
  };
  // Grid Layout Management
  DashboardBuilder.prototype.updateGridLayout = (layout, gridUpdates) =>
    __assign(__assign({}, layout), {
      grid_layout: __assign(__assign({}, layout.grid_layout), gridUpdates),
    });
  DashboardBuilder.prototype.optimizeLayout = (layout) => {
    // Auto-arrange widgets to minimize gaps and overlaps
    var widgets = __spreadArray([], layout.widget_configuration, true);
    var grid = layout.grid_layout;
    // Sort widgets by y position, then x position
    widgets.sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
    var currentY = 0;
    var rowWidgets = [];
    // Group widgets by rows
    widgets.forEach((widget) => {
      if (widget.position.y >= currentY + 1) {
        rowWidgets.push([]);
        currentY = widget.position.y;
      }
      rowWidgets[rowWidgets.length - 1].push(widget);
    });
    // Reposition widgets to eliminate gaps
    var y = 0;
    var optimizedWidgets = [];
    rowWidgets.forEach((row) => {
      var x = 0;
      var maxHeight = Math.max.apply(
        Math,
        row.map((w) => w.position.h),
      );
      row.forEach((widget) => {
        optimizedWidgets.push(
          __assign(__assign({}, widget), {
            position: __assign(__assign({}, widget.position), { x: x, y: y }),
          }),
        );
        x += widget.position.w;
      });
      y += maxHeight;
    });
    return __assign(__assign({}, layout), { widget_configuration: optimizedWidgets });
  };
  // Template Management
  DashboardBuilder.prototype.createTemplate = function (
    name_1,
    description_1,
    category_1,
    layout_1,
  ) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (name, description, category, layout, recommendedFor) {
        var template;
        if (recommendedFor === void 0) {
          recommendedFor = [];
        }
        return __generator(this, function (_a) {
          template = {
            id: "template_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
            name: name,
            description: description,
            category: category,
            default_widgets: layout.widget_configuration,
            default_filters: layout.filters,
            recommended_for: recommendedFor,
          };
          this.templates.push(template);
          return [2 /*return*/, template];
        });
      },
    );
  };
  DashboardBuilder.prototype.getTemplates = function (category) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (category) {
          return [2 /*return*/, this.templates.filter((t) => t.category === category)];
        }
        return [2 /*return*/, this.templates];
      });
    });
  };
  DashboardBuilder.prototype.getTemplate = function (templateId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.templates.find((t) => t.id === templateId) || null];
      });
    });
  };
  // Widget Library
  DashboardBuilder.prototype.getWidgetLibrary = function (category) {
    if (category) {
      return this.widgetLibrary.filter((w) => w.category === category);
    }
    return this.widgetLibrary;
  };
  DashboardBuilder.prototype.getWidgetTemplate = function (type) {
    return this.widgetLibrary.find((w) => w.type === type) || null;
  };
  // Validation and Compatibility
  DashboardBuilder.prototype.validateLayout = function (layout) {
    var errors = [];
    var warnings = [];
    // Check for widget overlaps
    var positions = layout.widget_configuration.map((w) => w.position);
    for (var i = 0; i < positions.length; i++) {
      for (var j = i + 1; j < positions.length; j++) {
        if (this.doWidgetsOverlap(positions[i], positions[j])) {
          errors.push("Widgets ".concat(i + 1, " and ").concat(j + 1, " overlap"));
        }
      }
    }
    // Check widget sizes
    layout.widget_configuration.forEach((widget, index) => {
      var template = this.getWidgetTemplate(widget.type);
      if (template) {
        var _a = widget.position,
          w = _a.w,
          h = _a.h;
        if (w < template.minSize.w || h < template.minSize.h) {
          warnings.push("Widget ".concat(index + 1, " is smaller than recommended minimum size"));
        }
        if (template.maxSize && (w > template.maxSize.w || h > template.maxSize.h)) {
          warnings.push("Widget ".concat(index + 1, " exceeds maximum recommended size"));
        }
      }
    });
    // Check for missing KPIs
    layout.widget_configuration.forEach((widget, index) => {
      var _a;
      var template = this.getWidgetTemplate(widget.type);
      if (
        template &&
        template.requiredKpis.length > 0 &&
        !((_a = widget.kpi_ids) === null || _a === void 0 ? void 0 : _a.length)
      ) {
        errors.push(
          "Widget ".concat(index + 1, " (").concat(widget.type, ") requires KPI selection"),
        );
      }
    });
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
    };
  };
  DashboardBuilder.prototype.validateKPICompatibility = function (kpiIds, widgetType) {
    return __awaiter(this, void 0, void 0, function () {
      var kpis, template, categories, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("financial_kpis").select("kpi_category").in("id", kpiIds),
            ];
          case 1:
            kpis = _a.sent().data;
            template = this.getWidgetTemplate(widgetType);
            if (!template) return [2 /*return*/, false];
            categories =
              (kpis === null || kpis === void 0 ? void 0 : kpis.map((k) => k.kpi_category)) || [];
            return [2 /*return*/, this.areKPICategoriesCompatible(categories, widgetType)];
          case 2:
            error_6 = _a.sent();
            console.error("Error validating KPI compatibility:", error_6);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Performance Optimization
  DashboardBuilder.prototype.calculateLayoutPerformance = (layout) => {
    var widgetCount = layout.widget_configuration.length;
    var chartWidgets = layout.widget_configuration.filter((w) => w.type === "chart").length;
    var tableWidgets = layout.widget_configuration.filter((w) => w.type === "table").length;
    // Estimate load time based on widget types and count
    var estimatedLoadTime = 200; // Base load time
    estimatedLoadTime += widgetCount * 50;
    estimatedLoadTime += chartWidgets * 150;
    estimatedLoadTime += tableWidgets * 100;
    var complexity = "low";
    if (widgetCount > 15 || chartWidgets > 5) complexity = "high";
    else if (widgetCount > 8 || chartWidgets > 3) complexity = "medium";
    var recommendations = [];
    if (widgetCount > 20) {
      recommendations.push("Consider splitting into multiple dashboards for better performance");
    }
    if (chartWidgets > 6) {
      recommendations.push("Too many charts may impact load time");
    }
    if (tableWidgets > 3) {
      recommendations.push("Consider pagination for table widgets");
    }
    return {
      widgetCount: widgetCount,
      estimatedLoadTime: estimatedLoadTime,
      complexity: complexity,
      recommendations: recommendations,
    };
  };
  // Helper Methods
  DashboardBuilder.prototype.doWidgetsOverlap = (pos1, pos2) =>
    !(
      pos1.x + pos1.w <= pos2.x ||
      pos2.x + pos2.w <= pos1.x ||
      pos1.y + pos1.h <= pos2.y ||
      pos2.y + pos2.h <= pos1.y
    );
  DashboardBuilder.prototype.areKPICategoriesCompatible = (categories, widgetType) => {
    var compatibilityMap = {
      kpi_card: ["revenue", "profitability", "operational", "financial_health"],
      chart: ["revenue", "profitability", "operational"],
      table: ["revenue", "profitability", "operational", "financial_health"],
      alert_panel: ["revenue", "profitability", "operational", "financial_health"],
      summary_stats: ["revenue", "profitability", "operational", "financial_health"],
    };
    var compatibleCategories = compatibilityMap[widgetType] || [];
    return categories.every((category) => compatibleCategories.includes(category));
  };
  DashboardBuilder.prototype.getDefaultGridLayout = () => ({
    cols: 12,
    rows: 20,
    row_height: 60,
    margin: [10, 10],
    container_padding: [10, 10],
    breakpoints: {
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0,
    },
    layouts: {},
  });
  DashboardBuilder.prototype.getDefaultFilters = () => ({
    time_period: {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      preset: "month",
    },
  });
  DashboardBuilder.prototype.initializeWidgetLibrary = () => [
    {
      id: "kpi_card_revenue",
      type: "kpi_card",
      name: "Revenue KPI Card",
      description: "Display key revenue metrics with trend indicators",
      category: "revenue",
      defaultConfig: {
        display_format: "currency",
        comparison_enabled: true,
        chart_type: "sparkline",
      },
      requiredKpis: [],
      minSize: { w: 2, h: 2 },
      maxSize: { w: 4, h: 3 },
    },
    {
      id: "chart_revenue_trend",
      type: "chart",
      name: "Revenue Trend Chart",
      description: "Line chart showing revenue trends over time",
      category: "revenue",
      defaultConfig: {
        chart_type: "line",
        time_range: "month",
        drill_down_enabled: true,
      },
      requiredKpis: [],
      minSize: { w: 4, h: 3 },
      maxSize: { w: 8, h: 6 },
    },
    {
      id: "table_kpi_summary",
      type: "table",
      name: "KPI Summary Table",
      description: "Tabular view of multiple KPIs with sorting and filtering",
      category: "overview",
      defaultConfig: {
        comparison_enabled: true,
        drill_down_enabled: true,
      },
      requiredKpis: [],
      minSize: { w: 6, h: 4 },
      maxSize: { w: 12, h: 8 },
    },
    {
      id: "alert_panel",
      type: "alert_panel",
      name: "KPI Alerts Panel",
      description: "Display active alerts and threshold breaches",
      category: "overview",
      defaultConfig: {},
      requiredKpis: [],
      minSize: { w: 3, h: 3 },
      maxSize: { w: 6, h: 6 },
    },
    {
      id: "summary_stats",
      type: "summary_stats",
      name: "Summary Statistics",
      description: "High-level summary with key performance indicators",
      category: "overview",
      defaultConfig: {
        display_format: "number",
      },
      requiredKpis: [],
      minSize: { w: 4, h: 2 },
      maxSize: { w: 8, h: 4 },
    },
  ];
  return DashboardBuilder;
})();
exports.DashboardBuilder = DashboardBuilder;
// Export factory function instead of singleton to avoid global initialization
var createDashboardBuilder = () => new DashboardBuilder();
exports.createDashboardBuilder = createDashboardBuilder;
