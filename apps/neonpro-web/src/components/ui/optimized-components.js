"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepEqual =
  exports.shallowEqual =
  exports.OptimizedFormField =
  exports.OptimizedListItem =
  exports.OptimizedBadge =
  exports.OptimizedTableRow =
  exports.OptimizedCard =
    void 0;
exports.withMemoization = withMemoization;
exports.withPerformanceMonitoring = withPerformanceMonitoring;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var utils_1 = require("@/lib/utils");
exports.OptimizedCard = (0, react_1.memo)((_a) => {
  var title = _a.title,
    value = _a.value,
    subtitle = _a.subtitle,
    icon = _a.icon,
    trend = _a.trend,
    trendValue = _a.trendValue,
    className = _a.className,
    loading = _a.loading;
  var trendColor = (0, react_1.useMemo)(() => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }, [trend]);
  var formattedValue = (0, react_1.useMemo)(() => {
    if (loading) return "...";
    if (typeof value === "number") {
      return value.toLocaleString("pt-BR");
    }
    return value;
  }, [value, loading]);
  return (
    <card_1.Card className={(0, utils_1.cn)("relative overflow-hidden", className)}>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">{title}</card_1.CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && trendValue && (
          <div className={(0, utils_1.cn)("text-xs mt-1", trendColor)}>
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
});
exports.OptimizedCard.displayName = "OptimizedCard";
exports.OptimizedTableRow = (0, react_1.memo)((_a) => {
  var id = _a.id,
    data = _a.data,
    columns = _a.columns,
    onEdit = _a.onEdit,
    onDelete = _a.onDelete,
    selected = _a.selected,
    onSelect = _a.onSelect;
  var handleEdit = (0, react_1.useCallback)(() => {
    onEdit === null || onEdit === void 0 ? void 0 : onEdit(id);
  }, [id, onEdit]);
  var handleDelete = (0, react_1.useCallback)(() => {
    onDelete === null || onDelete === void 0 ? void 0 : onDelete(id);
  }, [id, onDelete]);
  var handleSelect = (0, react_1.useCallback)(() => {
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(id);
  }, [id, onSelect]);
  var renderedCells = (0, react_1.useMemo)(
    () =>
      columns.map((column) => (
        <td key={"".concat(id, "-").concat(column.key)} className="px-4 py-2">
          {column.render ? column.render(data[column.key], data) : data[column.key]}
        </td>
      )),
    [columns, data, id],
  );
  return (
    <tr className={(0, utils_1.cn)("hover:bg-muted/50 transition-colors", selected && "bg-muted")}>
      {onSelect && (
        <td className="px-4 py-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelect}
            className="rounded border-gray-300"
          />
        </td>
      )}
      {renderedCells}
      {(onEdit || onDelete) && (
        <td className="px-4 py-2">
          <div className="flex space-x-2">
            {onEdit && (
              <button_1.Button size="sm" variant="outline" onClick={handleEdit}>
                Edit
              </button_1.Button>
            )}
            {onDelete && (
              <button_1.Button size="sm" variant="destructive" onClick={handleDelete}>
                Delete
              </button_1.Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
});
exports.OptimizedTableRow.displayName = "OptimizedTableRow";
exports.OptimizedBadge = (0, react_1.memo)((_a) => {
  var status = _a.status,
    children = _a.children,
    className = _a.className;
  var badgeVariant = (0, react_1.useMemo)(() => {
    switch (status) {
      case "success":
        return "default";
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      case "info":
        return "outline";
      default:
        return "secondary";
    }
  }, [status]);
  var badgeColor = (0, react_1.useMemo)(() => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "info":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "";
    }
  }, [status]);
  return (
    <badge_1.Badge variant={badgeVariant} className={(0, utils_1.cn)(badgeColor, className)}>
      {children}
    </badge_1.Badge>
  );
});
exports.OptimizedBadge.displayName = "OptimizedBadge";
exports.OptimizedListItem = (0, react_1.memo)((_a) => {
  var id = _a.id,
    title = _a.title,
    subtitle = _a.subtitle,
    avatar = _a.avatar,
    status = _a.status,
    actions = _a.actions,
    onClick = _a.onClick,
    className = _a.className;
  var handleClick = (0, react_1.useCallback)(() => {
    onClick === null || onClick === void 0 ? void 0 : onClick(id);
  }, [id, onClick]);
  var actionButtons = (0, react_1.useMemo)(() => {
    if (!actions) return null;
    return actions.map((action, index) => (
      <button_1.Button
        key={index}
        size="sm"
        variant={action.variant || "outline"}
        onClick={(e) => {
          e.stopPropagation();
          action.onClick(id);
        }}
      >
        {action.label}
      </button_1.Button>
    ));
  }, [actions, id]);
  return (
    <div
      className={(0, utils_1.cn)(
        "flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer",
        className,
      )}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        {avatar && (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <img src={avatar} alt={title} className="w-full h-full rounded-full object-cover" />
          </div>
        )}
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {status && (
          <exports.OptimizedBadge
            status={status === "active" ? "success" : status === "inactive" ? "error" : "warning"}
          >
            {status}
          </exports.OptimizedBadge>
        )}
        {actionButtons && <div className="flex space-x-2">{actionButtons}</div>}
      </div>
    </div>
  );
});
exports.OptimizedListItem.displayName = "OptimizedListItem";
exports.OptimizedFormField = (0, react_1.memo)((_a) => {
  var label = _a.label,
    value = _a.value,
    onChange = _a.onChange,
    error = _a.error,
    _b = _a.type,
    type = _b === void 0 ? "text" : _b,
    placeholder = _a.placeholder,
    required = _a.required,
    disabled = _a.disabled,
    className = _a.className;
  var handleChange = (0, react_1.useCallback)(
    (e) => {
      onChange(e.target.value);
    },
    [onChange],
  );
  var inputId = (0, react_1.useMemo)(
    () => "field-".concat(label.toLowerCase().replace(/\s+/g, "-")),
    [label],
  );
  return (
    <div className={(0, utils_1.cn)("space-y-2", className)}>
      <label htmlFor={inputId} className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={(0, utils_1.cn)(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});
exports.OptimizedFormField.displayName = "OptimizedFormField";
// Higher-order component for optimizing any component with memo
function withMemoization(Component, areEqual) {
  var MemoizedComponent = (0, react_1.memo)(Component, areEqual);
  MemoizedComponent.displayName = "Memoized(".concat(Component.displayName || Component.name, ")");
  return MemoizedComponent;
}
// Custom areEqual functions for common patterns
var shallowEqual = (prevProps, nextProps) => {
  var keys1 = Object.keys(prevProps);
  var keys2 = Object.keys(nextProps);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (var _i = 0, keys1_1 = keys1; _i < keys1_1.length; _i++) {
    var key = keys1_1[_i];
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  return true;
};
exports.shallowEqual = shallowEqual;
var deepEqual = (prevProps, nextProps) => JSON.stringify(prevProps) === JSON.stringify(nextProps);
exports.deepEqual = deepEqual;
// Performance monitoring HOC
function withPerformanceMonitoring(Component, componentName) {
  return (0, react_1.memo)((props) => {
    var startTime = performance.now();
    react_1.default.useEffect(() => {
      var endTime = performance.now();
      var renderTime = endTime - startTime;
      if (renderTime > 16) {
        // More than one frame at 60fps
        console.warn(
          "Slow render detected in "
            .concat(componentName, ": ")
            .concat(renderTime.toFixed(2), "ms"),
        );
      }
    });
    return <Component {...props} />;
  });
}
