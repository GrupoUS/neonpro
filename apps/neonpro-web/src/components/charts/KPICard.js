"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPICard = KPICard;
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function KPICard(_a) {
  var title = _a.title,
    value = _a.value,
    formattedValue = _a.formattedValue,
    previousValue = _a.previousValue,
    percentageChange = _a.percentageChange,
    _b = _a.trend,
    trend = _b === void 0 ? "stable" : _b,
    description = _a.description,
    icon = _a.icon,
    className = _a.className;
  var displayValue = formattedValue || value;
  var getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <lucide_react_1.Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  var getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };
  return (
    <card_1.Card className={(0, utils_1.cn)("", className)}>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </card_1.CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {(percentageChange !== undefined || trend !== "stable") && (
          <div className="flex items-center pt-1">
            {getTrendIcon()}
            {percentageChange !== undefined && (
              <span className={(0, utils_1.cn)("text-xs ml-1", getTrendColor())}>
                {percentageChange > 0 ? "+" : ""}
                {percentageChange}%
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground ml-2">{description}</span>
            )}
          </div>
        )}
        {description && !percentageChange && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
