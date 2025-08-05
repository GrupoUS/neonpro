"use client";
"use strict";
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialKPICards = FinancialKPICards;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
function FinancialKPICards(_a) {
  var kpis = _a.kpis,
    timeframe = _a.timeframe,
    _b = _a.loading,
    loading = _b === void 0 ? false : _b,
    _c = _a.className,
    className = _c === void 0 ? "" : _c;
  // Format value based on type
  var formatValue = function (value, format) {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      case "percentage":
        return "".concat(value.toFixed(1), "%");
      case "days":
        return "".concat(value.toFixed(0), " dias");
      case "number":
      default:
        return new Intl.NumberFormat("pt-BR").format(value);
    }
  };
  // Get trend direction
  var getTrend = function (current, previous) {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "neutral";
  };
  // Calculate change percentage
  var calculateChange = function (current, previous) {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  // Get timeframe label
  var getTimeframeLabel = function () {
    switch (timeframe) {
      case "day":
        return "hoje";
      case "week":
        return "esta semana";
      case "month":
        return "este mês";
      case "quarter":
        return "este trimestre";
      case "year":
        return "este ano";
      default:
        return timeframe;
    }
  };
  // Prepare KPI cards data
  var kpiCards = [
    {
      title: "Receita Total",
      value: kpis.total_revenue,
      change: calculateChange(kpis.total_revenue, kpis.previous_revenue || 0),
      target: kpis.revenue_target,
      icon: <lucide_react_1.DollarSign className="h-4 w-4" />,
      description: "Receita total ".concat(getTimeframeLabel()),
      trend: getTrend(kpis.total_revenue, kpis.previous_revenue || 0),
      color: "green",
      format: "currency",
    },
    {
      title: "Margem de Lucro",
      value: kpis.profit_margin,
      change: calculateChange(kpis.profit_margin, kpis.previous_profit_margin || 0),
      target: kpis.profit_target,
      icon: <lucide_react_1.TrendingUp className="h-4 w-4" />,
      description: "Margem de lucro líquida",
      trend: getTrend(kpis.profit_margin, kpis.previous_profit_margin || 0),
      color: "blue",
      format: "percentage",
    },
    {
      title: "Pacientes Ativos",
      value: kpis.active_patients,
      change: calculateChange(kpis.active_patients, kpis.previous_active_patients || 0),
      icon: <lucide_react_1.Users className="h-4 w-4" />,
      description: "Pacientes ativos ".concat(getTimeframeLabel()),
      trend: getTrend(kpis.active_patients, kpis.previous_active_patients || 0),
      color: "purple",
      format: "number",
    },
    {
      title: "Taxa de Ocupação",
      value: kpis.appointment_utilization,
      change: calculateChange(kpis.appointment_utilization, kpis.previous_utilization || 0),
      target: 85, // Target 85% utilization
      icon: <lucide_react_1.Calendar className="h-4 w-4" />,
      description: "Utilização de agenda",
      trend: getTrend(kpis.appointment_utilization, kpis.previous_utilization || 0),
      color: "yellow",
      format: "percentage",
    },
    {
      title: "Fluxo de Caixa",
      value: kpis.cash_flow,
      change: calculateChange(kpis.cash_flow, kpis.previous_cash_flow || 0),
      icon: <lucide_react_1.Activity className="h-4 w-4" />,
      description: "Fluxo de caixa ".concat(getTimeframeLabel()),
      trend: getTrend(kpis.cash_flow, kpis.previous_cash_flow || 0),
      color: kpis.cash_flow >= 0 ? "green" : "red",
      format: "currency",
    },
    {
      title: "Ticket Médio",
      value: kpis.average_treatment_value,
      change: calculateChange(kpis.average_treatment_value, kpis.previous_avg_treatment || 0),
      icon: <lucide_react_1.CreditCard className="h-4 w-4" />,
      description: "Valor médio por tratamento",
      trend: getTrend(kpis.average_treatment_value, kpis.previous_avg_treatment || 0),
      color: "blue",
      format: "currency",
    },
    {
      title: "Satisfação do Paciente",
      value: kpis.patient_satisfaction,
      change: calculateChange(kpis.patient_satisfaction, kpis.previous_satisfaction || 0),
      target: 4.5, // Target 4.5/5 satisfaction
      icon: <lucide_react_1.Target className="h-4 w-4" />,
      description: "Avaliação média (1-5)",
      trend: getTrend(kpis.patient_satisfaction, kpis.previous_satisfaction || 0),
      color:
        kpis.patient_satisfaction >= 4.0
          ? "green"
          : kpis.patient_satisfaction >= 3.0
            ? "yellow"
            : "red",
      format: "number",
    },
    {
      title: "Tempo Médio de Espera",
      value: kpis.average_wait_time,
      change: calculateChange(kpis.average_wait_time, kpis.previous_wait_time || 0),
      target: 15, // Target 15 minutes max
      icon: <lucide_react_1.Clock className="h-4 w-4" />,
      description: "Tempo médio de espera",
      trend: getTrend(kpis.previous_wait_time || 0, kpis.average_wait_time), // Inverted for wait time
      color:
        kpis.average_wait_time <= 15 ? "green" : kpis.average_wait_time <= 30 ? "yellow" : "red",
      format: "number",
    },
  ];
  // Render loading state
  if (loading) {
    return (
      <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ".concat(className)}>
        {__spreadArray([], Array(8), true).map(function (_, i) {
          return (
            <card_1.Card key={i}>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <skeleton_1.Skeleton className="h-4 w-24" />
                <skeleton_1.Skeleton className="h-4 w-4" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <skeleton_1.Skeleton className="h-8 w-20 mb-2" />
                <skeleton_1.Skeleton className="h-4 w-32" />
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>
    );
  }
  // Get color classes
  var getColorClasses = function (color) {
    switch (color) {
      case "green":
        return {
          icon: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
        };
      case "red":
        return {
          icon: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
        };
      case "blue":
        return {
          icon: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
        };
      case "yellow":
        return {
          icon: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
        };
      case "purple":
        return {
          icon: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-200",
        };
      default:
        return {
          icon: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
        };
    }
  };
  // Get trend icon and color
  var getTrendDisplay = function (trend, change) {
    if (trend === "up") {
      return {
        icon: <lucide_react_1.TrendingUp className="h-3 w-3" />,
        color: "text-green-600",
        text: "+".concat(Math.abs(change).toFixed(1), "%"),
      };
    } else if (trend === "down") {
      return {
        icon: <lucide_react_1.TrendingDown className="h-3 w-3" />,
        color: "text-red-600",
        text: "-".concat(Math.abs(change).toFixed(1), "%"),
      };
    } else {
      return {
        icon: <lucide_react_1.Activity className="h-3 w-3" />,
        color: "text-gray-600",
        text: "0.0%",
      };
    }
  };
  return (
    <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ".concat(className)}>
      {kpiCards.map(function (kpi, index) {
        var colorClasses = getColorClasses(kpi.color);
        var trendDisplay = getTrendDisplay(kpi.trend, kpi.change || 0);
        var progressValue = kpi.target
          ? Math.min((Number(kpi.value) / kpi.target) * 100, 100)
          : undefined;
        return (
          <card_1.Card
            key={index}
            className={"transition-all duration-200 hover:shadow-md ".concat(colorClasses.border)}
          >
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </card_1.CardTitle>
              <div className={"p-2 rounded-md ".concat(colorClasses.bg)}>
                <div className={colorClasses.icon}>{kpi.icon}</div>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-2">
                {/* Main Value */}
                <div className="text-2xl font-bold">
                  {formatValue(Number(kpi.value), kpi.format)}
                </div>

                {/* Change Indicator */}
                {kpi.change !== undefined && (
                  <div className={"flex items-center gap-1 text-xs ".concat(trendDisplay.color)}>
                    {trendDisplay.icon}
                    <span>{trendDisplay.text}</span>
                    <span className="text-muted-foreground ml-1">vs período anterior</span>
                  </div>
                )}

                {/* Progress Bar for Targets */}
                {kpi.target && progressValue !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Meta</span>
                      <span className="font-medium">{formatValue(kpi.target, kpi.format)}</span>
                    </div>
                    <progress_1.Progress value={progressValue} className="h-1.5" />
                    <div className="text-xs text-muted-foreground">
                      {progressValue.toFixed(0)}% da meta
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-muted-foreground">{kpi.description}</p>

                {/* Status Badge */}
                {kpi.target && (
                  <div className="flex justify-end">
                    {Number(kpi.value) >= kpi.target
                      ? <badge_1.Badge
                          variant="default"
                          className="text-xs bg-green-100 text-green-700"
                        >
                          <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
                          Meta atingida
                        </badge_1.Badge>
                      : Number(kpi.value) >= kpi.target * 0.8
                        ? <badge_1.Badge
                            variant="secondary"
                            className="text-xs bg-yellow-100 text-yellow-700"
                          >
                            <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1" />
                            Próximo da meta
                          </badge_1.Badge>
                        : <badge_1.Badge variant="destructive" className="text-xs">
                            <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1" />
                            Abaixo da meta
                          </badge_1.Badge>}
                  </div>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        );
      })}
    </div>
  );
}
exports.default = FinancialKPICards;
