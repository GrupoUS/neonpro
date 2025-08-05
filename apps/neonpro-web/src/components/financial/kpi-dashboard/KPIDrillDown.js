"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KPIDrillDown;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var scroll_area_1 = require("@/components/ui/scroll-area");
var progress_1 = require("@/components/ui/progress");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
// Mock drill-down data generator
var generateDrillDownData = function (kpi) {
  var baseData = [];
  switch (kpi.id) {
    case "revenue":
      return [
        {
          id: "facial-treatments",
          label: "Tratamentos Faciais",
          value: 45000,
          change: 12.5,
          trend: "up",
          category: "Serviços",
          subcategory: "Estética",
          details: {
            sessions: 156,
            avgTicket: 288.46,
            topProcedure: "Limpeza de Pele",
            growth: "+15.2%",
          },
        },
        {
          id: "body-treatments",
          label: "Tratamentos Corporais",
          value: 32000,
          change: 8.3,
          trend: "up",
          category: "Serviços",
          subcategory: "Estética",
          details: {
            sessions: 98,
            avgTicket: 326.53,
            topProcedure: "Massagem Modeladora",
            growth: "+8.3%",
          },
        },
        {
          id: "laser-treatments",
          label: "Laser e Luz",
          value: 28000,
          change: -2.1,
          trend: "down",
          category: "Serviços",
          subcategory: "Tecnologia",
          details: {
            sessions: 76,
            avgTicket: 368.42,
            topProcedure: "Laser CO2",
            growth: "-2.1%",
          },
        },
        {
          id: "injectables",
          label: "Injetáveis",
          value: 25000,
          change: 18.7,
          trend: "up",
          category: "Serviços",
          subcategory: "Procedimentos",
          details: {
            sessions: 54,
            avgTicket: 462.96,
            topProcedure: "Botox",
            growth: "+18.7%",
          },
        },
      ];
    case "profit-margin":
      return [
        {
          id: "high-margin",
          label: "Alta Margem (>60%)",
          value: 65.2,
          change: 3.1,
          trend: "up",
          category: "Margem",
          details: {
            revenue: 45000,
            cost: 15660,
            procedures: ["Botox", "Preenchimento", "Peeling"],
          },
        },
        {
          id: "medium-margin",
          label: "Média Margem (40-60%)",
          value: 52.8,
          change: -1.2,
          trend: "down",
          category: "Margem",
          details: {
            revenue: 32000,
            cost: 15104,
            procedures: ["Limpeza", "Hidratação", "Massagem"],
          },
        },
        {
          id: "low-margin",
          label: "Baixa Margem (<40%)",
          value: 35.4,
          change: -5.3,
          trend: "down",
          category: "Margem",
          details: {
            revenue: 28000,
            cost: 18088,
            procedures: ["Laser", "Equipamentos", "Materiais"],
          },
        },
      ];
    default:
      return [];
  }
};
// Generate time series data
var generateTimeSeriesData = function (kpi) {
  var data = [];
  var now = new Date();
  for (var i = 29; i >= 0; i--) {
    var date = new Date(now);
    date.setDate(date.getDate() - i);
    var baseValue = kpi.value;
    var variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    var value = baseValue * (1 + variation);
    var target = kpi.target;
    var previous = baseValue * 0.95; // 5% lower than current
    data.push({
      date: (0, date_fns_1.format)(date, "dd/MM", { locale: locale_1.ptBR }),
      value: Math.round(value * 100) / 100,
      target: target,
      previous: Math.round(previous * 100) / 100,
    });
  }
  return data;
};
// Chart colors
var COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  muted: "#6b7280",
};
var PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
function KPIDrillDown(_a) {
  var kpi = _a.kpi,
    isOpen = _a.isOpen,
    onClose = _a.onClose,
    _b = _a.className,
    className = _b === void 0 ? "" : _b;
  var _c = (0, react_1.useState)("breakdown"),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, react_1.useState)("bar"),
    chartType = _d[0],
    setChartType = _d[1];
  var drillDownData = (0, react_1.useMemo)(
    function () {
      return generateDrillDownData(kpi);
    },
    [kpi],
  );
  var timeSeriesData = (0, react_1.useMemo)(
    function () {
      return generateTimeSeriesData(kpi);
    },
    [kpi],
  );
  if (!isOpen) return null;
  // Format currency
  var formatCurrency = function (value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  // Format percentage
  var formatPercentage = function (value) {
    return "".concat(value.toFixed(1), "%");
  };
  // Get trend icon
  var getTrendIcon = function (trend, change) {
    if (trend === "up") {
      return (
        <lucide_react_1.TrendingUp
          className={(0, utils_1.cn)("h-4 w-4", change > 0 ? "text-green-500" : "text-red-500")}
        />
      );
    } else if (trend === "down") {
      return (
        <lucide_react_1.TrendingDown
          className={(0, utils_1.cn)("h-4 w-4", change < 0 ? "text-red-500" : "text-green-500")}
        />
      );
    }
    return <div className="h-4 w-4" />;
  };
  // Render breakdown chart
  var renderBreakdownChart = function () {
    if (chartType === "bar") {
      return (
        <recharts_1.ResponsiveContainer width="100%" height={300}>
          <recharts_1.BarChart data={drillDownData}>
            <recharts_1.CartesianGrid strokeDasharray="3 3" />
            <recharts_1.XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <recharts_1.YAxis />
            <recharts_1.Tooltip
              formatter={function (value) {
                return [
                  kpi.format === "currency" ? formatCurrency(value) : formatPercentage(value),
                  "Valor",
                ];
              }}
            />
            <recharts_1.Bar dataKey="value" fill={COLORS.primary} />
          </recharts_1.BarChart>
        </recharts_1.ResponsiveContainer>
      );
    } else if (chartType === "pie") {
      return (
        <recharts_1.ResponsiveContainer width="100%" height={300}>
          <recharts_1.PieChart>
            <recharts_1.Pie
              data={drillDownData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={function (_a) {
                var label = _a.label,
                  percent = _a.percent;
                return "".concat(label, " ").concat((percent * 100).toFixed(0), "%");
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {drillDownData.map(function (entry, index) {
                return (
                  <recharts_1.Cell
                    key={"cell-".concat(index)}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                );
              })}
            </recharts_1.Pie>
            <recharts_1.Tooltip
              formatter={function (value) {
                return [
                  kpi.format === "currency" ? formatCurrency(value) : formatPercentage(value),
                  "Valor",
                ];
              }}
            />
          </recharts_1.PieChart>
        </recharts_1.ResponsiveContainer>
      );
    }
    return null;
  };
  // Render trend chart
  var renderTrendChart = function () {
    return (
      <recharts_1.ResponsiveContainer width="100%" height={300}>
        <recharts_1.AreaChart data={timeSeriesData}>
          <recharts_1.CartesianGrid strokeDasharray="3 3" />
          <recharts_1.XAxis dataKey="date" />
          <recharts_1.YAxis />
          <recharts_1.Tooltip
            formatter={function (value, name) {
              return [
                kpi.format === "currency" ? formatCurrency(value) : formatPercentage(value),
                name === "value" ? "Atual" : name === "target" ? "Meta" : "Anterior",
              ];
            }}
          />
          <recharts_1.Area
            type="monotone"
            dataKey="value"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.3}
          />
          <recharts_1.Line
            type="monotone"
            dataKey="target"
            stroke={COLORS.secondary}
            strokeDasharray="5 5"
          />
          <recharts_1.Line
            type="monotone"
            dataKey="previous"
            stroke={COLORS.muted}
            strokeDasharray="3 3"
          />
        </recharts_1.AreaChart>
      </recharts_1.ResponsiveContainer>
    );
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <card_1.Card
        className={(0, utils_1.cn)("w-full max-w-6xl max-h-[90vh] overflow-hidden", className)}
      >
        <card_1.CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button_1.Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                <lucide_react_1.ArrowLeft className="h-4 w-4" />
              </button_1.Button>

              <div>
                <card_1.CardTitle className="text-xl flex items-center space-x-2">
                  <span>{kpi.name}</span>
                  <badge_1.Badge
                    variant={
                      kpi.status === "good"
                        ? "default"
                        : kpi.status === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {kpi.status === "good"
                      ? "Bom"
                      : kpi.status === "warning"
                        ? "Atenção"
                        : "Crítico"}
                  </badge_1.Badge>
                </card_1.CardTitle>

                <card_1.CardDescription className="flex items-center space-x-4 mt-1">
                  <span className="text-2xl font-bold">
                    {kpi.format === "currency"
                      ? formatCurrency(kpi.value)
                      : formatPercentage(kpi.value)}
                  </span>

                  <div className="flex items-center space-x-1">
                    {getTrendIcon(kpi.trend, kpi.change)}
                    <span
                      className={(0, utils_1.cn)(
                        "text-sm font-medium",
                        kpi.change > 0
                          ? "text-green-600"
                          : kpi.change < 0
                            ? "text-red-600"
                            : "text-gray-600",
                      )}
                    >
                      {kpi.change > 0 ? "+" : ""}
                      {formatPercentage(kpi.change)}
                    </span>
                  </div>

                  {kpi.target && (
                    <div className="text-sm text-muted-foreground">
                      Meta:{" "}
                      {kpi.format === "currency"
                        ? formatCurrency(kpi.target)
                        : formatPercentage(kpi.target)}
                    </div>
                  )}
                </card_1.CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Exportar
              </button_1.Button>

              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Share className="h-4 w-4 mr-2" />
                Compartilhar
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <tabs_1.TabsList className="grid w-full grid-cols-4">
              <tabs_1.TabsTrigger value="breakdown" className="flex items-center space-x-2">
                <lucide_react_1.BarChart3 className="h-4 w-4" />
                <span>Detalhamento</span>
              </tabs_1.TabsTrigger>

              <tabs_1.TabsTrigger value="trends" className="flex items-center space-x-2">
                <lucide_react_1.LineChart className="h-4 w-4" />
                <span>Tendências</span>
              </tabs_1.TabsTrigger>

              <tabs_1.TabsTrigger value="analysis" className="flex items-center space-x-2">
                <lucide_react_1.Target className="h-4 w-4" />
                <span>Análise</span>
              </tabs_1.TabsTrigger>

              <tabs_1.TabsTrigger value="insights" className="flex items-center space-x-2">
                <lucide_react_1.Zap className="h-4 w-4" />
                <span>Insights</span>
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="breakdown" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Detalhamento por Categoria</h3>

                <div className="flex items-center space-x-2">
                  <button_1.Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={function () {
                      return setChartType("bar");
                    }}
                  >
                    <lucide_react_1.BarChart3 className="h-4 w-4" />
                  </button_1.Button>

                  <button_1.Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={function () {
                      return setChartType("pie");
                    }}
                  >
                    <lucide_react_1.PieChart className="h-4 w-4" />
                  </button_1.Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-base">Visualização</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>{renderBreakdownChart()}</card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-base">Dados Detalhados</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <scroll_area_1.ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {drillDownData.map(function (item) {
                          return (
                            <div key={item.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{item.label}</h4>
                                <div className="flex items-center space-x-1">
                                  {getTrendIcon(item.trend, item.change)}
                                  <span
                                    className={(0, utils_1.cn)(
                                      "text-sm font-medium",
                                      item.change > 0 ? "text-green-600" : "text-red-600",
                                    )}
                                  >
                                    {item.change > 0 ? "+" : ""}
                                    {formatPercentage(item.change)}
                                  </span>
                                </div>
                              </div>

                              <div className="text-lg font-bold mb-2">
                                {kpi.format === "currency"
                                  ? formatCurrency(item.value)
                                  : formatPercentage(item.value)}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                {Object.entries(item.details).map(function (_a) {
                                  var key = _a[0],
                                    value = _a[1];
                                  return (
                                    <div key={key}>
                                      <span className="capitalize">{key}:</span> {value}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </scroll_area_1.ScrollArea>
                  </card_1.CardContent>
                </card_1.Card>
              </div>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="trends" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Evolução Temporal (30 dias)</h3>

                <card_1.Card>
                  <card_1.CardContent className="pt-6">{renderTrendChart()}</card_1.CardContent>
                </card_1.Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <card_1.Card>
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-sm font-medium">
                      Tendência Geral
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(kpi.trend, kpi.change)}
                      <span className="text-lg font-bold">
                        {kpi.change > 0 ? "+" : ""}
                        {formatPercentage(kpi.change)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">vs. período anterior</p>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-sm font-medium">
                      Volatilidade
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="text-lg font-bold">Baixa</div>
                    <progress_1.Progress value={25} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-1">Variação de ±2.5%</p>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-sm font-medium">Previsão</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="text-lg font-bold text-green-600">Positiva</div>
                    <div className="text-sm text-muted-foreground mt-1">+5.2% próximos 30 dias</div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="analysis" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Análise Comparativa</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-base">Performance vs Meta</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Atual</span>
                          <span className="font-bold">
                            {kpi.format === "currency"
                              ? formatCurrency(kpi.value)
                              : formatPercentage(kpi.value)}
                          </span>
                        </div>

                        {kpi.target && (
                          <>
                            <div className="flex justify-between items-center">
                              <span>Meta</span>
                              <span className="font-bold">
                                {kpi.format === "currency"
                                  ? formatCurrency(kpi.target)
                                  : formatPercentage(kpi.target)}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progresso</span>
                                <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                              </div>
                              <progress_1.Progress value={(kpi.value / kpi.target) * 100} />
                            </div>
                          </>
                        )}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-base">Benchmark do Setor</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Sua Performance</span>
                          <badge_1.Badge variant="default">Acima da Média</badge_1.Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Percentil</span>
                            <span className="font-medium">75º</span>
                          </div>
                          <progress_1.Progress value={75} />
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Você está melhor que 75% das clínicas similares
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>
              </div>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="insights" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Insights e Recomendações</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-base flex items-center space-x-2">
                        <lucide_react_1.CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Pontos Fortes</span>
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Crescimento consistente nos últimos 30 dias</li>
                        <li>• Performance acima da meta estabelecida</li>
                        <li>• Baixa volatilidade indica estabilidade</li>
                        <li>• Tendência positiva para próximo período</li>
                      </ul>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-base flex items-center space-x-2">
                        <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span>Oportunidades</span>
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Expandir serviços de alta margem</li>
                        <li>• Otimizar custos operacionais</li>
                        <li>• Implementar programas de fidelidade</li>
                        <li>• Investir em marketing digital</li>
                      </ul>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>

                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-base">Ações Recomendadas</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium">Curto Prazo (1-2 semanas)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Revisar precificação dos serviços de baixa margem e implementar promoções
                          para serviços de alta margem.
                        </p>
                      </div>

                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium">Médio Prazo (1-3 meses)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Desenvolver programa de fidelidade e investir em treinamento da equipe
                          para aumentar ticket médio.
                        </p>
                      </div>

                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-medium">Longo Prazo (3-6 meses)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Expandir portfólio de serviços e considerar abertura de nova unidade
                          baseada no crescimento atual.
                        </p>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
