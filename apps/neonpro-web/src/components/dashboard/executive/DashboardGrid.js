"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardGrid = DashboardGrid;
var react_1 = require("react");
var react_grid_layout_1 = require("react-grid-layout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tooltip_1 = require("@/components/ui/tooltip");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
// Widget Components
var KPIWidget_1 = require("./KPIWidget");
var ChartWidget_1 = require("./ChartWidget");
var MetricWidget_1 = require("./MetricWidget");
var AlertsWidget_1 = require("./AlertsWidget");
var TableWidget_1 = require("./TableWidget");
var ResponsiveGridLayout = (0, react_grid_layout_1.WidthProvider)(react_grid_layout_1.Responsive);
var WIDGET_TYPES = [
  { value: "kpi", label: "KPI Card", description: "Display key performance indicators" },
  { value: "chart", label: "Chart", description: "Various chart types for data visualization" },
  { value: "metric", label: "Metric", description: "Simple metric display with trends" },
  { value: "table", label: "Table", description: "Tabular data display" },
  { value: "alerts", label: "Alerts", description: "System alerts and notifications" },
  { value: "custom", label: "Custom", description: "Custom widget implementation" },
];
var LAYOUT_PRESETS = [
  {
    id: "executive-overview",
    name: "Executive Overview",
    description: "High-level KPIs and key metrics",
    preview: "📊",
    layout: {
      type: "grid",
      columns: 12,
      rows: 8,
      gap: 16,
      responsive: true,
      areas: [
        { id: "revenue-kpi", x: 0, y: 0, width: 3, height: 2 },
        { id: "patients-kpi", x: 3, y: 0, width: 3, height: 2 },
        { id: "satisfaction-kpi", x: 6, y: 0, width: 3, height: 2 },
        { id: "growth-kpi", x: 9, y: 0, width: 3, height: 2 },
        { id: "revenue-chart", x: 0, y: 2, width: 6, height: 4 },
        { id: "appointments-chart", x: 6, y: 2, width: 6, height: 4 },
        { id: "alerts-panel", x: 0, y: 6, width: 12, height: 2 },
      ],
    },
  },
  {
    id: "operational-dashboard",
    name: "Operational Dashboard",
    description: "Day-to-day operational metrics",
    preview: "⚙️",
    layout: {
      type: "grid",
      columns: 12,
      rows: 10,
      gap: 16,
      responsive: true,
      areas: [
        { id: "occupancy-rate", x: 0, y: 0, width: 4, height: 2 },
        { id: "avg-wait-time", x: 4, y: 0, width: 4, height: 2 },
        { id: "staff-utilization", x: 8, y: 0, width: 4, height: 2 },
        { id: "daily-appointments", x: 0, y: 2, width: 8, height: 4 },
        { id: "no-shows", x: 8, y: 2, width: 4, height: 2 },
        { id: "productivity", x: 8, y: 4, width: 4, height: 2 },
        { id: "schedule-overview", x: 0, y: 6, width: 12, height: 4 },
      ],
    },
  },
  {
    id: "financial-analysis",
    name: "Financial Analysis",
    description: "Financial performance and trends",
    preview: "💰",
    layout: {
      type: "grid",
      columns: 12,
      rows: 8,
      gap: 16,
      responsive: true,
      areas: [
        { id: "total-revenue", x: 0, y: 0, width: 3, height: 2 },
        { id: "profit-margin", x: 3, y: 0, width: 3, height: 2 },
        { id: "avg-ticket", x: 6, y: 0, width: 3, height: 2 },
        { id: "growth-rate", x: 9, y: 0, width: 3, height: 2 },
        { id: "revenue-trend", x: 0, y: 2, width: 8, height: 4 },
        { id: "payment-methods", x: 8, y: 2, width: 4, height: 4 },
        { id: "financial-summary", x: 0, y: 6, width: 12, height: 2 },
      ],
    },
  },
];
var BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};
var COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};
function DashboardGrid(_a) {
  var layout = _a.layout,
    widgets = _a.widgets,
    _b = _a.isEditing,
    isEditing = _b === void 0 ? false : _b,
    onLayoutChange = _a.onLayoutChange,
    onWidgetAdd = _a.onWidgetAdd,
    onWidgetUpdate = _a.onWidgetUpdate,
    onWidgetDelete = _a.onWidgetDelete,
    onWidgetDuplicate = _a.onWidgetDuplicate,
    onSaveLayout = _a.onSaveLayout,
    onResetLayout = _a.onResetLayout,
    className = _a.className;
  var _c = (0, react_1.useState)({
      isOpen: false,
      mode: "add",
    }),
    widgetDialog = _c[0],
    setWidgetDialog = _c[1];
  var _d = (0, react_1.useState)(""),
    selectedPreset = _d[0],
    setSelectedPreset = _d[1];
  var _e = (0, react_1.useState)("lg"),
    currentBreakpoint = _e[0],
    setCurrentBreakpoint = _e[1];
  var _f = (0, react_1.useState)(false),
    isDragging = _f[0],
    setIsDragging = _f[1];
  var _g = (0, react_1.useState)(false),
    isResizing = _g[0],
    setIsResizing = _g[1];
  var _h = (0, react_1.useState)(new Set()),
    hiddenWidgets = _h[0],
    setHiddenWidgets = _h[1];
  var _j = (0, react_1.useState)(new Set()),
    lockedWidgets = _j[0],
    setLockedWidgets = _j[1];
  // Convert widgets to grid layout format
  var gridLayouts = (0, react_1.useMemo)(() => {
    var layouts = {};
    Object.keys(BREAKPOINTS).forEach((breakpoint) => {
      layouts[breakpoint] = widgets
        .filter((widget) => !hiddenWidgets.has(widget.id))
        .map((widget) => ({
          i: widget.id,
          x: widget.position.x || 0,
          y: widget.position.y || 0,
          w: widget.position.width || 4,
          h: widget.position.height || 3,
          minW: widget.position.minWidth || 2,
          minH: widget.position.minHeight || 2,
          maxW: widget.position.maxWidth || 12,
          maxH: widget.position.maxHeight || 8,
          static: lockedWidgets.has(widget.id),
        }));
    });
    return layouts;
  }, [widgets, hiddenWidgets, lockedWidgets]);
  // Handle layout changes
  var handleLayoutChange = (0, react_1.useCallback)(
    (currentLayout, allLayouts) => {
      if (onLayoutChange && !isDragging && !isResizing) {
        onLayoutChange(currentLayout, allLayouts);
      }
    },
    [onLayoutChange, isDragging, isResizing],
  );
  // Handle widget operations
  var handleAddWidget = (0, react_1.useCallback)(() => {
    setWidgetDialog({ isOpen: true, mode: "add" });
  }, []);
  var handleEditWidget = (0, react_1.useCallback)((widget) => {
    setWidgetDialog({ isOpen: true, mode: "edit", widget: widget });
  }, []);
  var handleDeleteWidget = (0, react_1.useCallback)(
    (widgetId) => {
      if (onWidgetDelete) {
        onWidgetDelete(widgetId);
      }
    },
    [onWidgetDelete],
  );
  var handleDuplicateWidget = (0, react_1.useCallback)(
    (widgetId) => {
      if (onWidgetDuplicate) {
        onWidgetDuplicate(widgetId);
      }
    },
    [onWidgetDuplicate],
  );
  var handleToggleWidgetVisibility = (0, react_1.useCallback)((widgetId) => {
    setHiddenWidgets((prev) => {
      var newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  }, []);
  var handleToggleWidgetLock = (0, react_1.useCallback)((widgetId) => {
    setLockedWidgets((prev) => {
      var newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  }, []);
  // Apply layout preset
  var handleApplyPreset = (0, react_1.useCallback)(
    (presetId) => {
      var _a;
      var preset = LAYOUT_PRESETS.find((p) => p.id === presetId);
      if (preset && onLayoutChange) {
        // Convert preset to grid layout format
        var newLayout = preset.layout.areas.map((area) => ({
          i: area.id,
          x: area.x,
          y: area.y,
          w: area.width,
          h: area.height,
          minW: area.minWidth || 2,
          minH: area.minHeight || 2,
          maxW: area.maxWidth || 12,
          maxH: area.maxHeight || 8,
        }));
        var layouts = ((_a = {}), (_a[currentBreakpoint] = newLayout), _a);
        onLayoutChange(newLayout, layouts);
      }
      setSelectedPreset("");
    },
    [currentBreakpoint, onLayoutChange],
  );
  // Render widget based on type
  var renderWidget = (0, react_1.useCallback)(
    (widget) => {
      var commonProps = {
        widget: widget,
        isEditing: isEditing,
        onUpdate: (updates) =>
          onWidgetUpdate === null || onWidgetUpdate === void 0
            ? void 0
            : onWidgetUpdate(widget.id, updates),
      };
      switch (widget.widgetType) {
        case "kpi":
          return <KPIWidget_1.KPIWidget {...commonProps} />;
        case "chart":
          return <ChartWidget_1.ChartWidget {...commonProps} />;
        case "metric":
          return <MetricWidget_1.MetricWidget {...commonProps} />;
        case "alerts":
          return <AlertsWidget_1.AlertsWidget {...commonProps} />;
        case "table":
          return <TableWidget_1.TableWidget {...commonProps} />;
        default:
          return (
            <card_1.Card className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-2xl mb-2">🔧</div>
                <div>Widget type: {widget.widgetType}</div>
                <div className="text-sm">Not implemented</div>
              </div>
            </card_1.Card>
          );
      }
    },
    [isEditing, onWidgetUpdate],
  );
  return (
    <div className={"dashboard-grid ".concat(className || "")}>
      {/* Grid Controls */}
      {isEditing && (
        <div className="mb-4 flex items-center justify-between bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <button_1.Button onClick={handleAddWidget} size="sm">
              <lucide_react_1.Plus className="h-4 w-4 mr-2" />
              Add Widget
            </button_1.Button>

            <select_1.Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <select_1.SelectTrigger className="w-48">
                <select_1.SelectValue placeholder="Apply Layout Preset" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {LAYOUT_PRESETS.map((preset) => (
                  <select_1.SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center gap-2">
                      <span>{preset.preview}</span>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">{preset.description}</div>
                      </div>
                    </div>
                  </select_1.SelectItem>
                ))}
              </select_1.SelectContent>
            </select_1.Select>

            {selectedPreset && (
              <button_1.Button
                onClick={() => handleApplyPreset(selectedPreset)}
                size="sm"
                variant="outline"
              >
                Apply
              </button_1.Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <tooltip_1.TooltipProvider>
              <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                  <button_1.Button
                    onClick={() => setCurrentBreakpoint("xxs")}
                    size="sm"
                    variant={currentBreakpoint === "xxs" ? "default" : "outline"}
                  >
                    <lucide_react_1.Smartphone className="h-4 w-4" />
                  </button_1.Button>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent>Mobile View</tooltip_1.TooltipContent>
              </tooltip_1.Tooltip>

              <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                  <button_1.Button
                    onClick={() => setCurrentBreakpoint("sm")}
                    size="sm"
                    variant={currentBreakpoint === "sm" ? "default" : "outline"}
                  >
                    <lucide_react_1.Tablet className="h-4 w-4" />
                  </button_1.Button>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent>Tablet View</tooltip_1.TooltipContent>
              </tooltip_1.Tooltip>

              <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                  <button_1.Button
                    onClick={() => setCurrentBreakpoint("lg")}
                    size="sm"
                    variant={currentBreakpoint === "lg" ? "default" : "outline"}
                  >
                    <lucide_react_1.Monitor className="h-4 w-4" />
                  </button_1.Button>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent>Desktop View</tooltip_1.TooltipContent>
              </tooltip_1.Tooltip>
            </tooltip_1.TooltipProvider>

            <div className="h-4 w-px bg-border" />

            <button_1.Button onClick={onSaveLayout} size="sm" variant="outline">
              <lucide_react_1.Save className="h-4 w-4 mr-2" />
              Save
            </button_1.Button>

            <button_1.Button onClick={onResetLayout} size="sm" variant="outline">
              <lucide_react_1.RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </button_1.Button>
          </div>
        </div>
      )}

      {/* Responsive Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={gridLayouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={60}
        margin={[layout.gap || 16, layout.gap || 16]}
        containerPadding={[0, 0]}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={setCurrentBreakpoint}
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={() => setIsResizing(false)}
        useCSSTransforms
        preventCollision={false}
        compactType="vertical"
      >
        {widgets
          .filter((widget) => !hiddenWidgets.has(widget.id))
          .map((widget) => (
            <div key={widget.id} className="relative group">
              {/* Widget Controls */}
              {isEditing && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1 shadow-sm border">
                    <tooltip_1.TooltipProvider>
                      <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                          <button_1.Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditWidget(widget)}
                          >
                            <lucide_react_1.Settings className="h-3 w-3" />
                          </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent>Edit Widget</tooltip_1.TooltipContent>
                      </tooltip_1.Tooltip>

                      <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                          <button_1.Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDuplicateWidget(widget.id)}
                          >
                            <lucide_react_1.Copy className="h-3 w-3" />
                          </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent>Duplicate Widget</tooltip_1.TooltipContent>
                      </tooltip_1.Tooltip>

                      <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                          <button_1.Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleToggleWidgetLock(widget.id)}
                          >
                            {lockedWidgets.has(widget.id)
                              ? <lucide_react_1.Lock className="h-3 w-3" />
                              : <lucide_react_1.Unlock className="h-3 w-3" />}
                          </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent>
                          {lockedWidgets.has(widget.id) ? "Unlock" : "Lock"} Widget
                        </tooltip_1.TooltipContent>
                      </tooltip_1.Tooltip>

                      <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                          <button_1.Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleToggleWidgetVisibility(widget.id)}
                          >
                            <lucide_react_1.EyeOff className="h-3 w-3" />
                          </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent>Hide Widget</tooltip_1.TooltipContent>
                      </tooltip_1.Tooltip>

                      <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                          <button_1.Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteWidget(widget.id)}
                          >
                            <lucide_react_1.Trash2 className="h-3 w-3" />
                          </button_1.Button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent>Delete Widget</tooltip_1.TooltipContent>
                      </tooltip_1.Tooltip>
                    </tooltip_1.TooltipProvider>
                  </div>
                </div>
              )}

              {/* Widget Status Indicators */}
              {isEditing && (
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  {lockedWidgets.has(widget.id) && (
                    <badge_1.Badge variant="secondary" className="h-5 px-1 text-xs">
                      <lucide_react_1.Lock className="h-2 w-2" />
                    </badge_1.Badge>
                  )}
                </div>
              )}

              {/* Widget Content */}
              {renderWidget(widget)}
            </div>
          ))}
      </ResponsiveGridLayout>

      {/* Hidden Widgets Panel */}
      {isEditing && hiddenWidgets.size > 0 && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <lucide_react_1.EyeOff className="h-4 w-4" />
            Hidden Widgets ({hiddenWidgets.size})
          </h3>
          <div className="flex flex-wrap gap-2">
            {widgets
              .filter((widget) => hiddenWidgets.has(widget.id))
              .map((widget) => (
                <badge_1.Badge
                  key={widget.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleToggleWidgetVisibility(widget.id)}
                >
                  <lucide_react_1.Eye className="h-3 w-3 mr-1" />
                  {widget.title}
                </badge_1.Badge>
              ))}
          </div>
        </div>
      )}

      {/* Widget Dialog */}
      <WidgetConfigDialog
        isOpen={widgetDialog.isOpen}
        mode={widgetDialog.mode}
        widget={widgetDialog.widget}
        onClose={() => setWidgetDialog({ isOpen: false, mode: "add" })}
        onSave={(widget) => {
          if (widgetDialog.mode === "add" && onWidgetAdd) {
            onWidgetAdd(widget);
          } else if (widgetDialog.mode === "edit" && onWidgetUpdate && widgetDialog.widget) {
            onWidgetUpdate(widgetDialog.widget.id, widget);
          }
          setWidgetDialog({ isOpen: false, mode: "add" });
        }}
      />
    </div>
  );
}
function WidgetConfigDialog(_a) {
  var _b, _c, _d, _e, _f;
  var isOpen = _a.isOpen,
    mode = _a.mode,
    widget = _a.widget,
    onClose = _a.onClose,
    onSave = _a.onSave;
  var _g = (0, react_1.useState)({
      title: "",
      widgetType: "kpi",
      dataSource: "",
      config: {},
      position: { x: 0, y: 0, width: 4, height: 3 },
      refreshInterval: 300,
    }),
    formData = _g[0],
    setFormData = _g[1];
  // Update form data when widget changes
  react_1.default.useEffect(() => {
    if (widget && mode === "edit") {
      setFormData(widget);
    } else {
      setFormData({
        title: "",
        widgetType: "kpi",
        dataSource: "",
        config: {},
        position: { x: 0, y: 0, width: 4, height: 3 },
        refreshInterval: 300,
      });
    }
  }, [widget, mode]);
  var handleSave = () => {
    onSave(formData);
  };
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="max-w-2xl">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>
            {mode === "add" ? "Add New Widget" : "Edit Widget"}
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="title">Widget Title</label_1.Label>
              <input_1.Input
                id="title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData((prev) => __assign(__assign({}, prev), { title: e.target.value }))
                }
                placeholder="Enter widget title"
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="type">Widget Type</label_1.Label>
              <select_1.Select
                value={formData.widgetType}
                onValueChange={(value) =>
                  setFormData((prev) => __assign(__assign({}, prev), { widgetType: value }))
                }
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {WIDGET_TYPES.map((type) => (
                    <select_1.SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          <div className="space-y-2">
            <label_1.Label htmlFor="dataSource">Data Source</label_1.Label>
            <input_1.Input
              id="dataSource"
              value={formData.dataSource || ""}
              onChange={(e) =>
                setFormData((prev) => __assign(__assign({}, prev), { dataSource: e.target.value }))
              }
              placeholder="Enter data source endpoint or query"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="width">Width</label_1.Label>
              <input_1.Input
                id="width"
                type="number"
                min="1"
                max="12"
                value={
                  ((_b = formData.position) === null || _b === void 0 ? void 0 : _b.width) || 4
                }
                onChange={(e) =>
                  setFormData((prev) =>
                    __assign(__assign({}, prev), {
                      position: __assign(__assign({}, prev.position), {
                        width: parseInt(e.target.value),
                      }),
                    }),
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="height">Height</label_1.Label>
              <input_1.Input
                id="height"
                type="number"
                min="1"
                max="10"
                value={
                  ((_c = formData.position) === null || _c === void 0 ? void 0 : _c.height) || 3
                }
                onChange={(e) =>
                  setFormData((prev) =>
                    __assign(__assign({}, prev), {
                      position: __assign(__assign({}, prev.position), {
                        height: parseInt(e.target.value),
                      }),
                    }),
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="x">X Position</label_1.Label>
              <input_1.Input
                id="x"
                type="number"
                min="0"
                max="11"
                value={((_d = formData.position) === null || _d === void 0 ? void 0 : _d.x) || 0}
                onChange={(e) =>
                  setFormData((prev) =>
                    __assign(__assign({}, prev), {
                      position: __assign(__assign({}, prev.position), {
                        x: parseInt(e.target.value),
                      }),
                    }),
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="y">Y Position</label_1.Label>
              <input_1.Input
                id="y"
                type="number"
                min="0"
                value={((_e = formData.position) === null || _e === void 0 ? void 0 : _e.y) || 0}
                onChange={(e) =>
                  setFormData((prev) =>
                    __assign(__assign({}, prev), {
                      position: __assign(__assign({}, prev.position), {
                        y: parseInt(e.target.value),
                      }),
                    }),
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label_1.Label htmlFor="refreshInterval">Refresh Interval (seconds)</label_1.Label>
            <select_1.Select
              value={
                ((_f = formData.refreshInterval) === null || _f === void 0
                  ? void 0
                  : _f.toString()) || "300"
              }
              onValueChange={(value) =>
                setFormData((prev) =>
                  __assign(__assign({}, prev), { refreshInterval: parseInt(value) }),
                )
              }
            >
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="30">30 seconds</select_1.SelectItem>
                <select_1.SelectItem value="60">1 minute</select_1.SelectItem>
                <select_1.SelectItem value="300">5 minutes</select_1.SelectItem>
                <select_1.SelectItem value="600">10 minutes</select_1.SelectItem>
                <select_1.SelectItem value="1800">30 minutes</select_1.SelectItem>
                <select_1.SelectItem value="3600">1 hour</select_1.SelectItem>
                <select_1.SelectItem value="0">Manual only</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button_1.Button variant="outline" onClick={onClose}>
            Cancel
          </button_1.Button>
          <button_1.Button onClick={handleSave}>
            {mode === "add" ? "Add Widget" : "Save Changes"}
          </button_1.Button>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
