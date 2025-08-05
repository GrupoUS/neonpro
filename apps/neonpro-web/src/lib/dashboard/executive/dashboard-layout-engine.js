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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdashboardLayoutEngine =
  exports.DashboardLayoutEngine =
  exports.DashboardLayoutSchema =
  exports.WidgetConfigSchema =
  exports.WidgetPositionSchema =
    void 0;
var zod_1 = require("zod");
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
// Types and Schemas
exports.WidgetPositionSchema = zod_1.z.object({
  x: zod_1.z.number().min(0),
  y: zod_1.z.number().min(0),
  w: zod_1.z.number().min(1).max(12),
  h: zod_1.z.number().min(1).max(12),
  minW: zod_1.z.number().min(1).optional(),
  minH: zod_1.z.number().min(1).optional(),
  maxW: zod_1.z.number().max(12).optional(),
  maxH: zod_1.z.number().max(12).optional(),
  static: zod_1.z.boolean().default(false),
  isDraggable: zod_1.z.boolean().default(true),
  isResizable: zod_1.z.boolean().default(true),
});
exports.WidgetConfigSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  type: zod_1.z.enum(["kpi", "chart", "table", "metric", "alert", "custom"]),
  title: zod_1.z.string().min(1).max(255),
  dataSource: zod_1.z.string().min(1),
  refreshInterval: zod_1.z.number().min(30).max(3600).default(300), // 30s to 1h
  config: zod_1.z.record(zod_1.z.any()),
  position: exports.WidgetPositionSchema,
  permissions: zod_1.z.array(zod_1.z.string()).default([]),
  isVisible: zod_1.z.boolean().default(true),
  createdAt: zod_1.z.string().datetime(),
  updatedAt: zod_1.z.string().datetime(),
});
exports.DashboardLayoutSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1).max(255),
  description: zod_1.z.string().max(1000).optional(),
  layout: zod_1.z.object({
    breakpoints: zod_1.z.record(zod_1.z.number()).default({
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0,
    }),
    cols: zod_1.z.record(zod_1.z.number()).default({
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2,
    }),
    rowHeight: zod_1.z.number().min(30).default(60),
    margin: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).default([10, 10]),
    containerPadding: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).default([10, 10]),
    compactType: zod_1.z.enum(["vertical", "horizontal", null]).default("vertical"),
    preventCollision: zod_1.z.boolean().default(false),
  }),
  widgets: zod_1.z.array(exports.WidgetConfigSchema),
  filters: zod_1.z.record(zod_1.z.any()).default({}),
  isDefault: zod_1.z.boolean().default(false),
  isPublic: zod_1.z.boolean().default(false),
  createdBy: zod_1.z.string().uuid(),
  createdAt: zod_1.z.string().datetime(),
  updatedAt: zod_1.z.string().datetime(),
});
// Dashboard Layout Engine Class
var DashboardLayoutEngine = /** @class */ (() => {
  function DashboardLayoutEngine() {
    this.supabase = (0, client_1.createClient)();
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }
  /**
   * Get dashboard layout by ID with caching
   */
  DashboardLayoutEngine.prototype.getDashboardLayout = function (dashboardId) {
    return __awaiter(this, void 0, void 0, function () {
      var cached, _a, data, error, layout, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cached = this.getCachedLayout(dashboardId);
            if (cached) {
              return [2 /*return*/, cached];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("executive_dashboards")
                .select("\n          *,\n          widgets:dashboard_widgets(*)\n        ")
                .eq("id", dashboardId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching dashboard layout:", error);
              return [2 /*return*/, null];
            }
            if (!data) {
              return [2 /*return*/, null];
            }
            layout = this.transformDatabaseToLayout(data);
            this.setCachedLayout(dashboardId, layout);
            return [2 /*return*/, layout];
          case 2:
            error_1 = _b.sent();
            logger_1.logger.error("Error in getDashboardLayout:", error_1);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get all dashboards for a clinic
   */
  DashboardLayoutEngine.prototype.getClinicDashboards = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("executive_dashboards")
                .select("\n          *,\n          widgets:dashboard_widgets(*)\n        ")
                .eq("clinic_id", clinicId)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching clinic dashboards:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data.map((item) => _this.transformDatabaseToLayout(item))];
          case 2:
            error_2 = _b.sent();
            logger_1.logger.error("Error in getClinicDashboards:", error_2);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create new dashboard layout
   */
  DashboardLayoutEngine.prototype.createDashboardLayout = function (layout) {
    return __awaiter(this, void 0, void 0, function () {
      var now_1,
        dashboardId_1,
        _a,
        dashboardData,
        dashboardError,
        widgetInserts,
        widgetsError,
        newLayout,
        error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            now_1 = new Date().toISOString();
            dashboardId_1 = crypto.randomUUID();
            return [
              4 /*yield*/,
              this.supabase
                .from("executive_dashboards")
                .insert({
                  id: dashboardId_1,
                  clinic_id: layout.clinicId,
                  name: layout.name,
                  description: layout.description,
                  layout: layout.layout,
                  filters: layout.filters,
                  is_default: layout.isDefault,
                  is_public: layout.isPublic,
                  created_by: layout.createdBy,
                  created_at: now_1,
                  updated_at: now_1,
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (dashboardData = _a.data), (dashboardError = _a.error);
            if (dashboardError) {
              logger_1.logger.error("Error creating dashboard:", dashboardError);
              return [2 /*return*/, null];
            }
            if (!(layout.widgets.length > 0)) return [3 /*break*/, 4];
            widgetInserts = layout.widgets.map((widget) => ({
              id: widget.id,
              dashboard_id: dashboardId_1,
              widget_type: widget.type,
              title: widget.title,
              config: __assign(__assign({}, widget.config), {
                permissions: widget.permissions,
                isVisible: widget.isVisible,
              }),
              position: widget.position,
              data_source: widget.dataSource,
              refresh_interval: widget.refreshInterval,
              created_at: now_1,
              updated_at: now_1,
            }));
            return [4 /*yield*/, this.supabase.from("dashboard_widgets").insert(widgetInserts)];
          case 2:
            widgetsError = _b.sent().error;
            if (!widgetsError) return [3 /*break*/, 4];
            logger_1.logger.error("Error creating widgets:", widgetsError);
            // Rollback dashboard creation
            return [
              4 /*yield*/,
              this.supabase.from("executive_dashboards").delete().eq("id", dashboardId_1),
            ];
          case 3:
            // Rollback dashboard creation
            _b.sent();
            return [2 /*return*/, null];
          case 4:
            newLayout = __assign(__assign({}, layout), {
              id: dashboardId_1,
              createdAt: now_1,
              updatedAt: now_1,
            });
            this.setCachedLayout(dashboardId_1, newLayout);
            return [2 /*return*/, newLayout];
          case 5:
            error_3 = _b.sent();
            logger_1.logger.error("Error in createDashboardLayout:", error_3);
            return [2 /*return*/, null];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update dashboard layout
   */
  DashboardLayoutEngine.prototype.updateDashboardLayout = function (dashboardId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var now_2, dashboardUpdates, dashboardError, widgetInserts, widgetsError, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            now_2 = new Date().toISOString();
            dashboardUpdates = {
              updated_at: now_2,
            };
            if (updates.name) dashboardUpdates.name = updates.name;
            if (updates.description !== undefined)
              dashboardUpdates.description = updates.description;
            if (updates.layout) dashboardUpdates.layout = updates.layout;
            if (updates.filters) dashboardUpdates.filters = updates.filters;
            if (updates.isDefault !== undefined) dashboardUpdates.is_default = updates.isDefault;
            if (updates.isPublic !== undefined) dashboardUpdates.is_public = updates.isPublic;
            return [
              4 /*yield*/,
              this.supabase
                .from("executive_dashboards")
                .update(dashboardUpdates)
                .eq("id", dashboardId),
            ];
          case 1:
            dashboardError = _a.sent().error;
            if (dashboardError) {
              logger_1.logger.error("Error updating dashboard:", dashboardError);
              return [2 /*return*/, null];
            }
            if (!updates.widgets) return [3 /*break*/, 4];
            // Delete existing widgets
            return [
              4 /*yield*/,
              this.supabase.from("dashboard_widgets").delete().eq("dashboard_id", dashboardId),
            ];
          case 2:
            // Delete existing widgets
            _a.sent();
            if (!(updates.widgets.length > 0)) return [3 /*break*/, 4];
            widgetInserts = updates.widgets.map((widget) => ({
              id: widget.id,
              dashboard_id: dashboardId,
              widget_type: widget.type,
              title: widget.title,
              config: __assign(__assign({}, widget.config), {
                permissions: widget.permissions,
                isVisible: widget.isVisible,
              }),
              position: widget.position,
              data_source: widget.dataSource,
              refresh_interval: widget.refreshInterval,
              created_at: widget.createdAt,
              updated_at: now_2,
            }));
            return [4 /*yield*/, this.supabase.from("dashboard_widgets").insert(widgetInserts)];
          case 3:
            widgetsError = _a.sent().error;
            if (widgetsError) {
              logger_1.logger.error("Error updating widgets:", widgetsError);
              return [2 /*return*/, null];
            }
            _a.label = 4;
          case 4:
            // Clear cache and fetch updated layout
            this.clearCachedLayout(dashboardId);
            return [4 /*yield*/, this.getDashboardLayout(dashboardId)];
          case 5:
            return [2 /*return*/, _a.sent()];
          case 6:
            error_4 = _a.sent();
            logger_1.logger.error("Error in updateDashboardLayout:", error_4);
            return [2 /*return*/, null];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete dashboard layout
   */
  DashboardLayoutEngine.prototype.deleteDashboardLayout = function (dashboardId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            // Delete widgets first (cascade should handle this, but being explicit)
            return [
              4 /*yield*/,
              this.supabase.from("dashboard_widgets").delete().eq("dashboard_id", dashboardId),
            ];
          case 1:
            // Delete widgets first (cascade should handle this, but being explicit)
            _a.sent();
            return [
              4 /*yield*/,
              this.supabase.from("executive_dashboards").delete().eq("id", dashboardId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Error deleting dashboard:", error);
              return [2 /*return*/, false];
            }
            this.clearCachedLayout(dashboardId);
            return [2 /*return*/, true];
          case 3:
            error_5 = _a.sent();
            logger_1.logger.error("Error in deleteDashboardLayout:", error_5);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update widget position
   */
  DashboardLayoutEngine.prototype.updateWidgetPosition = function (widgetId, position) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("dashboard_widgets")
                .update({
                  position: position,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", widgetId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Error updating widget position:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_6 = _a.sent();
            logger_1.logger.error("Error in updateWidgetPosition:", error_6);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate layout configuration
   */
  DashboardLayoutEngine.prototype.validateLayout = (layout) => {
    try {
      exports.DashboardLayoutSchema.parse(layout);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof zod_1.z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((err) =>
            "".concat(err.path.join("."), ": ").concat(err.message),
          ),
        };
      }
      return {
        isValid: false,
        errors: ["Unknown validation error"],
      };
    }
  };
  /**
   * Generate default dashboard layout
   */
  DashboardLayoutEngine.prototype.generateDefaultLayout = (clinicId, createdBy, name) => {
    if (name === void 0) {
      name = "Dashboard Executivo";
    }
    var now = new Date().toISOString();
    return {
      clinicId: clinicId,
      name: name,
      description: "Dashboard executivo padrão com KPIs principais",
      layout: {
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: 60,
        margin: [10, 10],
        containerPadding: [10, 10],
        compactType: "vertical",
        preventCollision: false,
      },
      widgets: [
        {
          id: crypto.randomUUID(),
          type: "kpi",
          title: "Receita Mensal",
          dataSource: "financial.monthly_revenue",
          refreshInterval: 300,
          config: {
            kpiType: "revenue",
            format: "currency",
            comparison: "previous_month",
          },
          position: { x: 0, y: 0, w: 3, h: 2 },
          permissions: ["admin", "manager"],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: "kpi",
          title: "Novos Pacientes",
          dataSource: "patients.new_patients",
          refreshInterval: 300,
          config: {
            kpiType: "count",
            format: "number",
            comparison: "previous_month",
          },
          position: { x: 3, y: 0, w: 3, h: 2 },
          permissions: ["admin", "manager"],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: "kpi",
          title: "Taxa de Ocupação",
          dataSource: "operations.occupancy_rate",
          refreshInterval: 300,
          config: {
            kpiType: "percentage",
            format: "percent",
            comparison: "previous_month",
          },
          position: { x: 6, y: 0, w: 3, h: 2 },
          permissions: ["admin", "manager"],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: "kpi",
          title: "Satisfação do Paciente",
          dataSource: "patients.satisfaction_score",
          refreshInterval: 300,
          config: {
            kpiType: "score",
            format: "decimal",
            comparison: "previous_month",
          },
          position: { x: 9, y: 0, w: 3, h: 2 },
          permissions: ["admin", "manager"],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: "chart",
          title: "Tendência de Receita",
          dataSource: "financial.revenue_trend",
          refreshInterval: 600,
          config: {
            chartType: "line",
            period: "12_months",
            showComparison: true,
          },
          position: { x: 0, y: 2, w: 6, h: 4 },
          permissions: ["admin", "manager"],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: "chart",
          title: "Distribuição de Agendamentos",
          dataSource: "appointments.distribution",
          refreshInterval: 300,
          config: {
            chartType: "pie",
            period: "current_month",
            groupBy: "service_type",
          },
          position: { x: 6, y: 2, w: 6, h: 4 },
          permissions: ["admin", "manager"],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      filters: {},
      isDefault: true,
      isPublic: false,
      createdBy: createdBy,
    };
  };
  // Private helper methods
  DashboardLayoutEngine.prototype.getCachedLayout = function (dashboardId) {
    var expiry = this.cacheExpiry.get(dashboardId);
    if (!expiry || Date.now() > expiry) {
      this.clearCachedLayout(dashboardId);
      return null;
    }
    return this.cache.get(dashboardId) || null;
  };
  DashboardLayoutEngine.prototype.setCachedLayout = function (dashboardId, layout) {
    this.cache.set(dashboardId, layout);
    this.cacheExpiry.set(dashboardId, Date.now() + this.CACHE_TTL);
  };
  DashboardLayoutEngine.prototype.clearCachedLayout = function (dashboardId) {
    this.cache.delete(dashboardId);
    this.cacheExpiry.delete(dashboardId);
  };
  DashboardLayoutEngine.prototype.transformDatabaseToLayout = (data) => ({
    id: data.id,
    clinicId: data.clinic_id,
    name: data.name,
    description: data.description,
    layout: data.layout,
    widgets: (data.widgets || []).map((widget) => {
      var _a, _b, _c;
      return {
        id: widget.id,
        type: widget.widget_type,
        title: widget.title,
        dataSource: widget.data_source,
        refreshInterval: widget.refresh_interval,
        config: widget.config || {},
        position: widget.position,
        permissions:
          ((_a = widget.config) === null || _a === void 0 ? void 0 : _a.permissions) || [],
        isVisible:
          (_c = (_b = widget.config) === null || _b === void 0 ? void 0 : _b.isVisible) !== null &&
          _c !== void 0
            ? _c
            : true,
        createdAt: widget.created_at,
        updatedAt: widget.updated_at,
      };
    }),
    filters: data.filters || {},
    isDefault: data.is_default,
    isPublic: data.is_public,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
  return DashboardLayoutEngine;
})();
exports.DashboardLayoutEngine = DashboardLayoutEngine;
// Export singleton instance
var createdashboardLayoutEngine = () => new DashboardLayoutEngine();
exports.createdashboardLayoutEngine = createdashboardLayoutEngine;
