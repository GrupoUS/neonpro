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
exports.FinancialCharts = FinancialCharts;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var skeleton_1 = require("@/components/ui/skeleton");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
function FinancialCharts(_a) {
  var charts = _a.charts,
    analytics = _a.analytics,
    timeframe = _a.timeframe,
    _b = _a.loading,
    loading = _b === void 0 ? false : _b,
    _c = _a.detailed,
    detailed = _c === void 0 ? false : _c,
    _d = _a.className,
    className = _d === void 0 ? "" : _d;
  var _e = (0, react_1.useState)("revenue"),
    selectedChart = _e[0],
    setSelectedChart = _e[1];
  var _f = (0, react_1.useState)("overview"),
    chartView = _f[0],
    setChartView = _f[1];
  var _g = (0, react_1.useState)("30"),
    dateRange = _g[0],
    setDateRange = _g[1];
  // Color palette for charts
  var colors = {
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    pink: "#ec4899",
    indigo: "#6366f1",
    teal: "#14b8a6",
  };
  // Format currency values
  var formatCurrency = function (value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  // Format percentage values
  var formatPercentage = function (value) {
    return "".concat(value.toFixed(1), "%");
  };
  // Generate mock data for demonstration
  var generateMockData = function (type, days) {
    if (days === void 0) {
      days = 30;
    }
    var data = [];
    var now = new Date();
    for (var i = days - 1; i >= 0; i--) {
      var date = new Date(now);
      date.setDate(date.getDate() - i);
      var baseValue =
        type === "revenue"
          ? 15000
          : type === "patients"
            ? 25
            : type === "treatments"
              ? 12
              : type === "satisfaction"
                ? 4.2
                : 100;
      var variance = baseValue * 0.3;
      var value = baseValue + (Math.random() - 0.5) * variance;
      data.push({
        name: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        date: date.toISOString(),
        value: Math.max(0, value),
        category: type,
      });
    }
    return data;
  };
  // Chart configurations
  var chartConfigs = (0, react_1.useMemo)(
    function () {
      return {
        revenue: {
          title: "Receita Diária",
          description: "Evolução da receita ao longo do tempo",
          type: "area",
          data: generateMockData("revenue", parseInt(dateRange)),
          xKey: "name",
          yKey: "value",
          color: colors.primary,
          format: "currency",
        },
        patients: {
          title: "Pacientes por Dia",
          description: "Número de pacientes atendidos diariamente",
          type: "bar",
          data: generateMockData("patients", parseInt(dateRange)),
          xKey: "name",
          yKey: "value",
          color: colors.secondary,
          format: "number",
        },
        treatments: {
          title: "Tratamentos Realizados",
          description: "Quantidade de tratamentos por dia",
          type: "line",
          data: generateMockData("treatments", parseInt(dateRange)),
          xKey: "name",
          yKey: "value",
          color: colors.accent,
          format: "number",
        },
        satisfaction: {
          title: "Satisfação do Paciente",
          description: "Avaliação média diária dos pacientes",
          type: "line",
          data: generateMockData("satisfaction", parseInt(dateRange)),
          xKey: "name",
          yKey: "value",
          color: colors.purple,
          format: "number",
        },
      };
    },
    [dateRange],
  );
  // Treatment distribution data for pie chart
  var treatmentDistribution = [
    { name: "Limpeza", value: 35, color: colors.primary },
    { name: "Restauração", value: 25, color: colors.secondary },
    { name: "Ortodontia", value: 20, color: colors.accent },
    { name: "Endodontia", value: 12, color: colors.danger },
    { name: "Outros", value: 8, color: colors.purple },
  ];
  // Revenue by treatment type
  var revenueByTreatment = [
    { name: "Ortodontia", value: 45000, percentage: 35 },
    { name: "Implantes", value: 32000, percentage: 25 },
    { name: "Restauração", value: 25000, percentage: 20 },
    { name: "Limpeza", value: 15000, percentage: 12 },
    { name: "Outros", value: 10000, percentage: 8 },
  ];
  // Custom tooltip component
  var CustomTooltip = function (_a) {
    var active = _a.active,
      payload = _a.payload,
      label = _a.label,
      format = _a.format;
    if (active && payload && payload.length) {
      var value = payload[0].value;
      var formattedValue =
        format === "currency"
          ? formatCurrency(value)
          : format === "percentage"
            ? formatPercentage(value)
            : value.toLocaleString("pt-BR");
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">{"".concat(payload[0].name, ": ").concat(formattedValue)}</p>
        </div>
      );
    }
    return null;
  };
  // Render loading state
  if (loading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {__spreadArray([], Array(4), true).map(function (_, i) {
            return (
              <card_1.Card key={i}>
                <card_1.CardHeader>
                  <skeleton_1.Skeleton className="h-6 w-32" />
                  <skeleton_1.Skeleton className="h-4 w-48" />
                </card_1.CardHeader>
                <card_1.CardContent>
                  <skeleton_1.Skeleton className="h-64 w-full" />
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Período:</label>
            <select_1.Select value={dateRange} onValueChange={setDateRange}>
              <select_1.SelectTrigger className="w-32">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="7">7 dias</select_1.SelectItem>
                <select_1.SelectItem value="15">15 dias</select_1.SelectItem>
                <select_1.SelectItem value="30">30 dias</select_1.SelectItem>
                <select_1.SelectItem value="60">60 dias</select_1.SelectItem>
                <select_1.SelectItem value="90">90 dias</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {detailed && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Visualização:</label>
              <select_1.Select
                value={chartView}
                onValueChange={function (value) {
                  return setChartView(value);
                }}
              >
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="overview">Visão Geral</select_1.SelectItem>
                  <select_1.SelectItem value="detailed">Detalhada</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Filter className="h-4 w-4 mr-2" />
            Filtros
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BarChart3 className="h-5 w-5" />
              {chartConfigs.revenue.title}
            </card_1.CardTitle>
            <card_1.CardDescription>{chartConfigs.revenue.description}</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.AreaChart data={chartConfigs.revenue.data}>
                <recharts_1.CartesianGrid strokeDasharray="3 3" />
                <recharts_1.XAxis dataKey={chartConfigs.revenue.xKey} />
                <recharts_1.YAxis
                  tickFormatter={function (value) {
                    return formatCurrency(value);
                  }}
                />
                <recharts_1.Tooltip
                  content={<CustomTooltip format={chartConfigs.revenue.format} />}
                />
                <recharts_1.Area
                  type="monotone"
                  dataKey={chartConfigs.revenue.yKey}
                  stroke={chartConfigs.revenue.color}
                  fill={chartConfigs.revenue.color}
                  fillOpacity={0.3}
                />
              </recharts_1.AreaChart>
            </recharts_1.ResponsiveContainer>
          </card_1.CardContent>
        </card_1.Card>

        {/* Patients Chart */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BarChart3 className="h-5 w-5" />
              {chartConfigs.patients.title}
            </card_1.CardTitle>
            <card_1.CardDescription>{chartConfigs.patients.description}</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.BarChart data={chartConfigs.patients.data}>
                <recharts_1.CartesianGrid strokeDasharray="3 3" />
                <recharts_1.XAxis dataKey={chartConfigs.patients.xKey} />
                <recharts_1.YAxis />
                <recharts_1.Tooltip
                  content={<CustomTooltip format={chartConfigs.patients.format} />}
                />
                <recharts_1.Bar
                  dataKey={chartConfigs.patients.yKey}
                  fill={chartConfigs.patients.color}
                />
              </recharts_1.BarChart>
            </recharts_1.ResponsiveContainer>
          </card_1.CardContent>
        </card_1.Card>

        {/* Treatment Distribution */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.PieChart className="h-5 w-5" />
              Distribuição de Tratamentos
            </card_1.CardTitle>
            <card_1.CardDescription>Percentual de tratamentos por tipo</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.PieChart>
                <recharts_1.Pie
                  data={treatmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={function (_a) {
                    var name = _a.name,
                      value = _a.value;
                    return "".concat(name, ": ").concat(value, "%");
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {treatmentDistribution.map(function (entry, index) {
                    return <recharts_1.Cell key={"cell-".concat(index)} fill={entry.color} />;
                  })}
                </recharts_1.Pie>
                <recharts_1.Tooltip />
              </recharts_1.PieChart>
            </recharts_1.ResponsiveContainer>
          </card_1.CardContent>
        </card_1.Card>

        {/* Satisfaction Trend */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.LineChart className="h-5 w-5" />
              {chartConfigs.satisfaction.title}
            </card_1.CardTitle>
            <card_1.CardDescription>{chartConfigs.satisfaction.description}</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.LineChart data={chartConfigs.satisfaction.data}>
                <recharts_1.CartesianGrid strokeDasharray="3 3" />
                <recharts_1.XAxis dataKey={chartConfigs.satisfaction.xKey} />
                <recharts_1.YAxis domain={[0, 5]} />
                <recharts_1.Tooltip
                  content={<CustomTooltip format={chartConfigs.satisfaction.format} />}
                />
                <recharts_1.ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="5 5" />
                <recharts_1.ReferenceLine y={4.5} stroke="#10b981" strokeDasharray="5 5" />
                <recharts_1.Line
                  type="monotone"
                  dataKey={chartConfigs.satisfaction.yKey}
                  stroke={chartConfigs.satisfaction.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfigs.satisfaction.color }}
                />
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Detailed Analytics Section */}
      {detailed && chartView === "detailed" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Análise Detalhada</h3>

          {/* Revenue by Treatment Type */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.DollarSign className="h-5 w-5" />
                Receita por Tipo de Tratamento
              </card_1.CardTitle>
              <card_1.CardDescription>
                Análise de receita por categoria de tratamento
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {revenueByTreatment.map(function (item, index) {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: Object.values(colors)[index] }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.value)}</div>
                        <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Crescimento Mensal</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="flex items-center gap-2">
                  <lucide_react_1.TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">+12.5%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Comparado ao mês anterior</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Eficiência Operacional</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="flex items-center gap-2">
                  <lucide_react_1.Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">87%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Taxa de utilização da agenda</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Ticket Médio</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="flex items-center gap-2">
                  <lucide_react_1.DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">R$ 485</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Valor médio por consulta</p>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>
      )}
    </div>
  );
}
exports.default = FinancialCharts;
