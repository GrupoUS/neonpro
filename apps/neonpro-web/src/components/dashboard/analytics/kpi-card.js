"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPICard = KPICard;
var card_1 = require("@/components/ui/card");
function KPICard(_a) {
    var title = _a.title, value = _a.value, change = _a.change, trend = _a.trend, _b = _a.format, format = _b === void 0 ? "number" : _b, icon = _a.icon, _c = _a.className, className = _c === void 0 ? "" : _c;
    var formatValue = function (val, fmt) {
        switch (fmt) {
            case "percentage":
                return "".concat(val, "%");
            case "currency":
                return "R$ ".concat(val.toLocaleString("pt-BR"));
            case "time":
                return "".concat(val, " min");
            default:
                return val.toLocaleString("pt-BR");
        }
    };
    var getTrendIcon = function () {
        switch (trend) {
            case "up":
                return "📈";
            case "down":
                return "📉";
            default:
                return "➖";
        }
    };
    var getTrendColor = function () {
        // Para métricas onde "down" é positivo (como tempo de espera, custo)
        var isInverseTrend = format === "time" || title.toLowerCase().includes("custo");
        if (isInverseTrend) {
            switch (trend) {
                case "up":
                    return "text-green-600";
                case "down":
                    return "text-red-600";
                default:
                    return "text-gray-600";
            }
        }
        else {
            switch (trend) {
                case "up":
                    return "text-green-600";
                case "down":
                    return "text-red-600";
                default:
                    return "text-gray-600";
            }
        }
    };
    return (<card_1.Card className={"hover:shadow-lg transition-shadow duration-200 ".concat(className)}>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && (<div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-lg">
            {icon}
          </div>)}
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-bold">{formatValue(value, format)}</p>
            <div className={"flex items-center space-x-1 text-xs ".concat(getTrendColor())}>
              {getTrendIcon()}
              <span>
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs mês anterior</span>
            </div>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
