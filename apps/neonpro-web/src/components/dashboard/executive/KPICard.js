/**
 * KPI Card Component
 *
 * Displays individual KPI metrics with trend indicators, status badges,
 * and interactive features for the executive dashboard.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPICard = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tooltip_1 = require("@/components/ui/tooltip");
var lucide_react_1 = require("lucide-react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================
var KPI_STATUS_VARIANTS = {
  excellent: {
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-900",
    iconColor: "text-green-600",
    badgeVariant: "default",
  },
  good: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    iconColor: "text-blue-600",
    badgeVariant: "secondary",
  },
  warning: {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-900",
    iconColor: "text-yellow-600",
    badgeVariant: "outline",
  },
  critical: {
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-900",
    iconColor: "text-red-600",
    badgeVariant: "destructive",
  },
};
var SIZE_VARIANTS = {
  sm: {
    cardClass: "h-24",
    titleClass: "text-sm",
    valueClass: "text-lg",
    iconSize: "h-4 w-4",
    padding: "p-3",
  },
  md: {
    cardClass: "h-32",
    titleClass: "text-base",
    valueClass: "text-2xl",
    iconSize: "h-5 w-5",
    padding: "p-4",
  },
  lg: {
    cardClass: "h-40",
    titleClass: "text-lg",
    valueClass: "text-3xl",
    iconSize: "h-6 w-6",
    padding: "p-6",
  },
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
var formatKPIValue = (value, format) => {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    case "percentage":
      return "".concat(value.toFixed(1), "%");
    case "number":
      return new Intl.NumberFormat("pt-BR").format(value);
    case "decimal":
      return value.toFixed(2);
    case "integer":
      return Math.round(value).toString();
    default:
      return value.toString();
  }
};
var getTrendIcon = (direction, iconSize) => {
  var className = ""
    .concat(iconSize, " ")
    .concat(
      direction === "up"
        ? "text-green-600"
        : direction === "down"
          ? "text-red-600"
          : "text-gray-400",
    );
  switch (direction) {
    case "up":
      return <lucide_react_1.TrendingUp className={className} />;
    case "down":
      return <lucide_react_1.TrendingDown className={className} />;
    default:
      return <lucide_react_1.Minus className={className} />;
  }
};
var getStatusIcon = (status, iconSize) => {
  var variant = KPI_STATUS_VARIANTS[status];
  var className = "".concat(iconSize, " ").concat(variant.iconColor);
  switch (status) {
    case "excellent":
      return <lucide_react_1.CheckCircle className={className} />;
    case "good":
      return <lucide_react_1.CheckCircle className={className} />;
    case "warning":
      return <lucide_react_1.AlertTriangle className={className} />;
    case "critical":
      return <lucide_react_1.XCircle className={className} />;
    default:
      return <lucide_react_1.Clock className={className} />;
  }
};
var getStatusLabel = (status) => {
  switch (status) {
    case "excellent":
      return "Excelente";
    case "good":
      return "Bom";
    case "warning":
      return "Atenção";
    case "critical":
      return "Crítico";
    default:
      return "Desconhecido";
  }
};
var getTrendLabel = (direction, changePercent) => {
  var percent = changePercent ? " (".concat(Math.abs(changePercent).toFixed(1), "%)") : "";
  switch (direction) {
    case "up":
      return "Crescimento".concat(percent);
    case "down":
      return "Decl\u00EDnio".concat(percent);
    default:
      return "Estável";
  }
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
var KPICard = (_a) => {
  var kpi = _a.kpi,
    _b = _a.size,
    size = _b === void 0 ? "md" : _b,
    _c = _a.showTrend,
    showTrend = _c === void 0 ? true : _c,
    _d = _a.showTarget,
    showTarget = _d === void 0 ? true : _d,
    _e = _a.showActions,
    showActions = _e === void 0 ? true : _e,
    onClick = _a.onClick,
    onDrillDown = _a.onDrillDown,
    onAlert = _a.onAlert;
  var _f = (0, react_1.useState)(false),
    isHovered = _f[0],
    setIsHovered = _f[1];
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  var variant = KPI_STATUS_VARIANTS[kpi.status];
  var sizeVariant = SIZE_VARIANTS[size];
  var formattedValue = (0, react_1.useMemo)(
    () => formatKPIValue(kpi.currentValue, kpi.format),
    [kpi.currentValue, kpi.format],
  );
  var formattedTarget = (0, react_1.useMemo)(() => {
    if (!kpi.target) return null;
    return formatKPIValue(kpi.target, kpi.format);
  }, [kpi.target, kpi.format]);
  var targetProgress = (0, react_1.useMemo)(() => {
    if (!kpi.target) return null;
    return Math.min(100, Math.max(0, (kpi.currentValue / kpi.target) * 100));
  }, [kpi.currentValue, kpi.target]);
  var trendLabel = (0, react_1.useMemo)(
    () => getTrendLabel(kpi.trend.direction, kpi.trend.changePercent),
    [kpi.trend],
  );
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  var handleCardClick = () => {
    onClick === null || onClick === void 0 ? void 0 : onClick(kpi);
  };
  var handleDrillDown = (e) => {
    e.stopPropagation();
    onDrillDown === null || onDrillDown === void 0 ? void 0 : onDrillDown(kpi);
  };
  var handleAlert = (e) => {
    e.stopPropagation();
    onAlert === null || onAlert === void 0 ? void 0 : onAlert(kpi);
  };
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  var renderHeader = () => (
    <card_1.CardHeader className={"".concat(sizeVariant.padding, " pb-2")}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <card_1.CardTitle
            className={"".concat(sizeVariant.titleClass, " font-medium text-gray-900 truncate")}
          >
            {kpi.name}
          </card_1.CardTitle>
          {kpi.description && size !== "sm" && (
            <tooltip_1.TooltipProvider>
              <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                  <lucide_react_1.Info className="h-3 w-3 text-gray-400 mt-1 cursor-help" />
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent>
                  <p className="max-w-xs">{kpi.description}</p>
                </tooltip_1.TooltipContent>
              </tooltip_1.Tooltip>
            </tooltip_1.TooltipProvider>
          )}
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(kpi.status, sizeVariant.iconSize)}

          {showActions && (
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <lucide_react_1.MoreVertical className="h-3 w-3" />
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end">
                {onDrillDown && (
                  <dropdown_menu_1.DropdownMenuItem onClick={handleDrillDown}>
                    Ver Detalhes
                  </dropdown_menu_1.DropdownMenuItem>
                )}
                {onAlert && kpi.status === "critical" && (
                  <dropdown_menu_1.DropdownMenuItem onClick={handleAlert}>
                    Criar Alerta
                  </dropdown_menu_1.DropdownMenuItem>
                )}
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem>Exportar Dados</dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          )}
        </div>
      </div>
    </card_1.CardHeader>
  );
  var renderContent = () => (
    <card_1.CardContent className={"".concat(sizeVariant.padding, " pt-0")}>
      <div className="space-y-2">
        {/* Main Value */}
        <div className="flex items-baseline justify-between">
          <span
            className={"".concat(sizeVariant.valueClass, " font-bold ").concat(variant.textColor)}
          >
            {formattedValue}
          </span>

          {showTrend && kpi.trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon(kpi.trend.direction, sizeVariant.iconSize)}
              {kpi.trend.changePercent && size !== "sm" && (
                <span
                  className={"text-xs ".concat(
                    kpi.trend.direction === "up"
                      ? "text-green-600"
                      : kpi.trend.direction === "down"
                        ? "text-red-600"
                        : "text-gray-500",
                  )}
                >
                  {Math.abs(kpi.trend.changePercent).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <badge_1.Badge variant={variant.badgeVariant} className="text-xs">
            {getStatusLabel(kpi.status)}
          </badge_1.Badge>

          {kpi.lastUpdated && size !== "sm" && (
            <span className="text-xs text-gray-500">
              {new Date(kpi.lastUpdated).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* Target Progress */}
        {showTarget && kpi.target && targetProgress !== null && size !== "sm" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Meta: {formattedTarget}</span>
              <span>{targetProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={"h-1.5 rounded-full transition-all duration-300 ".concat(
                  targetProgress >= 100
                    ? "bg-green-500"
                    : targetProgress >= 80
                      ? "bg-blue-500"
                      : targetProgress >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500",
                )}
                style={{ width: "".concat(Math.min(100, targetProgress), "%") }}
              />
            </div>
          </div>
        )}

        {/* Trend Information */}
        {showTrend && kpi.trend && size === "lg" && (
          <div className="pt-2 border-t border-gray-100">
            <tooltip_1.TooltipProvider>
              <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-xs text-gray-600 cursor-help">
                    {getTrendIcon(kpi.trend.direction, "h-3 w-3")}
                    <span>{trendLabel}</span>
                  </div>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent>
                  <div className="space-y-1">
                    <p>Período: {kpi.trend.period}</p>
                    {kpi.trend.previousValue && (
                      <p>Valor anterior: {formatKPIValue(kpi.trend.previousValue, kpi.format)}</p>
                    )}
                  </div>
                </tooltip_1.TooltipContent>
              </tooltip_1.Tooltip>
            </tooltip_1.TooltipProvider>
          </div>
        )}
      </div>
    </card_1.CardContent>
  );
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <card_1.Card
      className={"\n        group relative transition-all duration-200 cursor-pointer\n        "
        .concat(sizeVariant.cardClass, "\n        ")
        .concat(variant.bgColor, "\n        ")
        .concat(variant.borderColor, "\n        ")
        .concat(isHovered ? "shadow-md scale-105" : "shadow-sm", "\n        ")
        .concat(onClick ? "hover:shadow-lg" : "", "\n      ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {renderHeader()}
      {renderContent()}

      {/* Loading Overlay */}
      {kpi.isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Critical Alert Indicator */}
      {kpi.status === "critical" && (
        <div className="absolute -top-1 -right-1">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
    </card_1.Card>
  );
};
exports.KPICard = KPICard;
exports.default = exports.KPICard;
