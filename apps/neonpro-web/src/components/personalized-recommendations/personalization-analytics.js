"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PersonalizationAnalytics;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var progress_1 = require("@/components/ui/progress");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
// Mock data para analytics
var performanceData = [
  { month: "Jan", accuracy: 85, engagement: 78, conversions: 12 },
  { month: "Fev", accuracy: 87, engagement: 82, conversions: 15 },
  { month: "Mar", accuracy: 89, engagement: 85, conversions: 18 },
  { month: "Abr", accuracy: 91, engagement: 88, conversions: 22 },
  { month: "Mai", accuracy: 93, engagement: 91, conversions: 25 },
  { month: "Jun", accuracy: 95, engagement: 94, conversions: 28 },
];
var segmentPerformance = [
  {
    segment: "Cliente Premium",
    recommendations: 145,
    clicks: 128,
    conversions: 35,
    revenue: 85000,
  },
  { segment: "Cliente Jovem", recommendations: 230, clicks: 195, conversions: 48, revenue: 32000 },
  {
    segment: "Cliente Executiva",
    recommendations: 88,
    clicks: 76,
    conversions: 22,
    revenue: 45000,
  },
  { segment: "Cliente VIP", recommendations: 67, clicks: 61, conversions: 18, revenue: 67000 },
];
var treatmentRecommendations = [
  { name: "Botox", value: 35, color: "#8884d8" },
  { name: "Harmonização", value: 28, color: "#82ca9d" },
  { name: "Peeling", value: 18, color: "#ffc658" },
  { name: "Limpeza", value: 12, color: "#ff7300" },
  { name: "Outros", value: 7, color: "#8dd1e1" },
];
function MetricCard(_a) {
  var title = _a.title,
    value = _a.value,
    change = _a.change,
    changeType = _a.changeType,
    icon = _a.icon;
  var changeColor =
    changeType === "positive"
      ? "text-green-600"
      : changeType === "negative"
        ? "text-red-600"
        : "text-gray-600";
  return (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">{title}</card_1.CardTitle>
        {icon}
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={"text-xs ".concat(changeColor)}>{change} vs. mês anterior</p>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function PersonalizationAnalytics() {
  var _a = (0, react_1.useState)("6m"),
    timeRange = _a[0],
    setTimeRange = _a[1];
  var _b = (0, react_1.useState)("all"),
    selectedSegment = _b[0],
    setSelectedSegment = _b[1];
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Personalização</h2>
          <p className="text-muted-foreground">
            Análise de performance e efetividade das recomendações personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <select_1.Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <select_1.SelectTrigger className="w-[180px]">
              <select_1.SelectValue placeholder="Segmento" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os Segmentos</select_1.SelectItem>
              <select_1.SelectItem value="premium">Cliente Premium</select_1.SelectItem>
              <select_1.SelectItem value="young">Cliente Jovem</select_1.SelectItem>
              <select_1.SelectItem value="executive">Cliente Executiva</select_1.SelectItem>
              <select_1.SelectItem value="vip">Cliente VIP</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <select_1.Select value={timeRange} onValueChange={setTimeRange}>
            <select_1.SelectTrigger className="w-[120px]">
              <select_1.SelectValue placeholder="Período" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="1m">1 Mês</select_1.SelectItem>
              <select_1.SelectItem value="3m">3 Meses</select_1.SelectItem>
              <select_1.SelectItem value="6m">6 Meses</select_1.SelectItem>
              <select_1.SelectItem value="1y">1 Ano</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Taxa de Precisão"
          value="95%"
          change="+2.3%"
          changeType="positive"
          icon={<lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Taxa de Engajamento"
          value="94%"
          change="+3.1%"
          changeType="positive"
          icon={<lucide_react_1.Zap className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Conversões"
          value="28"
          change="+12.5%"
          changeType="positive"
          icon={<lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Receita Gerada"
          value="R$ 229k"
          change="+18.7%"
          changeType="positive"
          icon={<lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <tabs_1.Tabs defaultValue="performance" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="segments">Segmentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="treatments">Tratamentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insights">Insights</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="performance" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Evolução da Performance</card_1.CardTitle>
              <card_1.CardDescription>
                Acompanhe a evolução das métricas de personalização ao longo do tempo
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.LineChart data={performanceData}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis dataKey="month" />
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip />
                  <recharts_1.Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Precisão (%)"
                  />
                  <recharts_1.Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Engajamento (%)"
                  />
                  <recharts_1.Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="#ffc658"
                    strokeWidth={2}
                    name="Conversões"
                  />
                </recharts_1.LineChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>

          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Taxa de Cliques por Segmento</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {segmentPerformance.map((segment) => {
                    var clickRate = ((segment.clicks / segment.recommendations) * 100).toFixed(1);
                    return (
                      <div key={segment.segment} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{segment.segment}</span>
                          <span>{clickRate}%</span>
                        </div>
                        <progress_1.Progress value={parseFloat(clickRate)} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>ROI por Segmento</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {segmentPerformance.map((segment) => {
                    var roi = (segment.revenue / (segment.recommendations * 10)).toFixed(1); // Assumindo custo de R$10 por recomendação
                    return (
                      <div key={segment.segment} className="flex justify-between items-center">
                        <span className="text-sm">{segment.segment}</span>
                        <div className="text-right">
                          <div className="font-bold">{roi}x</div>
                          <div className="text-xs text-muted-foreground">
                            R$ {(segment.revenue / 1000).toFixed(0)}k
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="segments" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Performance por Segmento</card_1.CardTitle>
              <card_1.CardDescription>
                Análise detalhada da performance de cada segmento de cliente
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.BarChart data={segmentPerformance}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis dataKey="segment" />
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip />
                  <recharts_1.Bar dataKey="recommendations" fill="#8884d8" name="Recomendações" />
                  <recharts_1.Bar dataKey="clicks" fill="#82ca9d" name="Cliques" />
                  <recharts_1.Bar dataKey="conversions" fill="#ffc658" name="Conversões" />
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {segmentPerformance.map((segment) => (
              <card_1.Card key={segment.segment}>
                <card_1.CardHeader className="pb-3">
                  <card_1.CardTitle className="text-base">{segment.segment}</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Recomendações:</span>
                    <span className="font-medium">{segment.recommendations}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Cliques:</span>
                    <span className="font-medium">
                      {((segment.clicks / segment.recommendations) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Conversão:</span>
                    <span className="font-medium">
                      {((segment.conversions / segment.clicks) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <separator_1.Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Receita:</span>
                    <span className="text-green-600">
                      R$ {(segment.revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="treatments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Distribuição de Recomendações</card_1.CardTitle>
                <card_1.CardDescription>
                  Tratamentos mais recomendados pelo sistema
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={250}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie
                      data={treatmentRecommendations}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={(_a) => {
                        var name = _a.name,
                          value = _a.value;
                        return "".concat(name, ": ").concat(value, "%");
                      }}
                    >
                      {treatmentRecommendations.map((entry, index) => (
                        <recharts_1.Cell key={"cell-".concat(index)} fill={entry.color} />
                      ))}
                    </recharts_1.Pie>
                    <recharts_1.Tooltip />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Top Tratamentos</card_1.CardTitle>
                <card_1.CardDescription>
                  Ranking dos tratamentos mais efetivos
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {treatmentRecommendations.map((treatment, index) => (
                    <div key={treatment.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{treatment.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{treatment.value}%</div>
                        <div className="text-xs text-muted-foreground">das recomendações</div>
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Eye className="h-5 w-5" />
                  Insights Principais
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                    <lucide_react_1.Star className="h-4 w-4" />
                    Melhor Performance
                  </div>
                  <p className="text-sm text-blue-700">
                    Cliente Premium tem a maior taxa de conversão (45.7%) e maior ticket médio
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                    <lucide_react_1.TrendingUp className="h-4 w-4" />
                    Crescimento
                  </div>
                  <p className="text-sm text-green-700">
                    Recomendações de Botox aumentaram 34% no último trimestre
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-800 font-medium mb-1">
                    <lucide_react_1.Users className="h-4 w-4" />
                    Oportunidade
                  </div>
                  <p className="text-sm text-orange-700">
                    Segmento Jovem tem alta interação mas baixa conversão - potencial para
                    otimização
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Recomendações de Ação</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Otimizar Segmento Jovem</p>
                    <p className="text-xs text-muted-foreground">
                      Ajustar preços e ofertas para melhorar conversão
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Expandir Ofertas Premium</p>
                    <p className="text-xs text-muted-foreground">
                      Criar mais pacotes para clientes premium
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Promover Harmonização</p>
                    <p className="text-xs text-muted-foreground">
                      Aumentar visibilidade deste tratamento em alta
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">A/B Test Horários</p>
                    <p className="text-xs text-muted-foreground">
                      Testar diferentes horários para cada segmento
                    </p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
