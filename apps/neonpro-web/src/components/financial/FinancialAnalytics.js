/**
 * TASK-003: Business Logic Enhancement
 * Financial Analytics Dashboard Component
 *
 * Real-time financial analytics with predictive insights,
 * cash flow analysis, and automated reporting.
 */
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialAnalytics = FinancialAnalytics;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var use_toast_1 = require("@/components/ui/use-toast");
function FinancialAnalytics(_a) {
    var clinicId = _a.clinicId, dateRange = _a.dateRange;
    var _b = (0, react_1.useState)('30d'), selectedPeriod = _b[0], setSelectedPeriod = _b[1];
    var _c = (0, react_1.useState)([]), metrics = _c[0], setMetrics = _c[1];
    var _d = (0, react_1.useState)([]), cashFlowData = _d[0], setCashFlowData = _d[1];
    var _e = (0, react_1.useState)([]), servicePerformance = _e[0], setServicePerformance = _e[1];
    var _f = (0, react_1.useState)([]), predictiveInsights = _f[0], setPredictiveInsights = _f[1];
    var _g = (0, react_1.useState)(false), isLoading = _g[0], setIsLoading = _g[1];
    var _h = (0, react_1.useState)('overview'), activeTab = _h[0], setActiveTab = _h[1];
    var toast = (0, use_toast_1.useToast)().toast;
    // Mock data generation - In production, this would fetch from APIs
    (0, react_1.useEffect)(function () {
        generateMockData();
    }, [selectedPeriod]);
    var generateMockData = function () {
        setIsLoading(true);
        // Simulate API call
        setTimeout(function () {
            // Financial Metrics
            setMetrics([
                {
                    label: 'Receita Total',
                    value: 145800,
                    change: 12.5,
                    trend: 'up',
                    target: 150000,
                    unit: 'currency'
                },
                {
                    label: 'Lucro Líquido',
                    value: 52030,
                    change: 8.3,
                    trend: 'up',
                    target: 55000,
                    unit: 'currency'
                },
                {
                    label: 'Margem de Lucro',
                    value: 35.7,
                    change: -2.1,
                    trend: 'down',
                    target: 40,
                    unit: 'percentage'
                },
                {
                    label: 'Pacientes Ativos',
                    value: 324,
                    change: 15.2,
                    trend: 'up',
                    target: 350,
                    unit: 'number'
                },
                {
                    label: 'Ticket Médio',
                    value: 450,
                    change: 5.8,
                    trend: 'up',
                    target: 500,
                    unit: 'currency'
                },
                {
                    label: 'Taxa de Conversão',
                    value: 68.5,
                    change: 3.2,
                    trend: 'up',
                    target: 70,
                    unit: 'percentage'
                }
            ]);
            // Cash Flow Data
            var cashFlow = Array.from({ length: 30 }, function (_, i) { return ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                income: Math.random() * 8000 + 2000,
                expenses: Math.random() * 4000 + 1000,
                profit: 0,
                projection: Math.random() * 6000 + 3000
            }); });
            cashFlow.forEach(function (day) {
                day.profit = day.income - day.expenses;
            });
            setCashFlowData(cashFlow);
            // Service Performance
            setServicePerformance([
                {
                    service: 'Botox Facial',
                    revenue: 45600,
                    count: 76,
                    avgValue: 600,
                    growth: 15.3,
                    profitMargin: 45.2
                },
                {
                    service: 'Preenchimento Labial',
                    revenue: 32800,
                    count: 82,
                    avgValue: 400,
                    growth: 8.7,
                    profitMargin: 38.5
                },
                {
                    service: 'Consulta Dermatológica',
                    revenue: 28400,
                    count: 142,
                    avgValue: 200,
                    growth: 22.1,
                    profitMargin: 65.0
                },
                {
                    service: 'Limpeza de Pele',
                    revenue: 18600,
                    count: 124,
                    avgValue: 150,
                    growth: -5.2,
                    profitMargin: 55.8
                }
            ]);
            // Predictive Insights
            setPredictiveInsights([
                {
                    type: 'opportunity',
                    title: 'Oportunidade de Crescimento',
                    description: 'Botox Facial mostra tendência de alta. Recomenda-se aumentar capacidade de atendimento.',
                    impact: 'high',
                    confidence: 87,
                    actionItems: [
                        'Treinar mais profissionais no procedimento',
                        'Ampliar horários de atendimento',
                        'Criar campanhas promocionais direcionadas'
                    ]
                },
                {
                    type: 'warning',
                    title: 'Declínio em Limpeza de Pele',
                    description: 'Queda de 5.2% na procura por limpeza de pele nos últimos 30 dias.',
                    impact: 'medium',
                    confidence: 92,
                    actionItems: [
                        'Revisar preços competitivos',
                        'Avaliar qualidade do serviço',
                        'Implementar programa de fidelidade'
                    ]
                },
                {
                    type: 'recommendation',
                    title: 'Otimização de Fluxo de Caixa',
                    description: 'Padrão sazonal identificado. Implementar estratégias para períodos de baixa.',
                    impact: 'medium',
                    confidence: 78,
                    actionItems: [
                        'Criar pacotes promocionais para períodos lentos',
                        'Implementar planos de pagamento flexíveis',
                        'Diversificar portfólio de serviços'
                    ]
                }
            ]);
            setIsLoading(false);
        }, 1500);
    };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    var formatPercentage = function (value) {
        return "".concat(value.toFixed(1), "%");
    };
    var getTrendIcon = function (trend) {
        switch (trend) {
            case 'up':
                return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>;
            case 'down':
                return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>;
            default:
                return <div className="h-4 w-4"/>;
        }
    };
    var getInsightIcon = function (type) {
        switch (type) {
            case 'opportunity':
                return <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>;
            case 'warning':
                return <lucide_react_1.AlertCircle className="h-5 w-5 text-red-600"/>;
            case 'recommendation':
                return <lucide_react_1.Target className="h-5 w-5 text-blue-600"/>;
        }
    };
    var COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise Financeira</h2>
          <p className="text-gray-600">Dashboard com insights preditivos e métricas em tempo real</p>
        </div>
        <select_1.Select value={selectedPeriod} onValueChange={function (value) { return setSelectedPeriod(value); }}>
          <select_1.SelectTrigger className="w-[180px]">
            <select_1.SelectValue />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="7d">Últimos 7 dias</select_1.SelectItem>
            <select_1.SelectItem value="30d">Últimos 30 dias</select_1.SelectItem>
            <select_1.SelectItem value="90d">Últimos 90 dias</select_1.SelectItem>
            <select_1.SelectItem value="1y">Último ano</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
      </div>

      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="cashflow">Fluxo de Caixa</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="services">Serviços</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insights">Insights AI</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* Financial Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map(function (metric, index) { return (<card_1.Card key={index}>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">{metric.label}</card_1.CardTitle>
                  {getTrendIcon(metric.trend)}
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">
                    {metric.unit === 'currency' && formatCurrency(metric.value)}
                    {metric.unit === 'percentage' && formatPercentage(metric.value)}
                    {metric.unit === 'number' && metric.value.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className={"text-xs ".concat(metric.change >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}% vs período anterior
                    </p>
                    {metric.target && (<badge_1.Badge variant="outline" className="text-xs">
                        Meta: {metric.unit === 'currency' ? formatCurrency(metric.target) :
                    metric.unit === 'percentage' ? formatPercentage(metric.target) :
                        metric.target.toLocaleString()}
                      </badge_1.Badge>)}
                  </div>
                  {metric.target && (<div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "".concat(Math.min((metric.value / metric.target) * 100, 100), "%") }}/>
                      </div>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>

          {/* Revenue Trend Chart */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.LineChart className="h-5 w-5"/>
                Tendência de Receita
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.AreaChart data={cashFlowData.slice(-14)}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="date" tickFormatter={function (date) { return new Date(date).getDate().toString(); }}/>
                  <recharts_1.YAxis tickFormatter={function (value) { return "R$ ".concat((value / 1000).toFixed(0), "k"); }}/>
                  <recharts_1.Tooltip formatter={function (value, name) { return [formatCurrency(Number(value)), name]; }} labelFormatter={function (date) { return new Date(date).toLocaleDateString('pt-BR'); }}/>
                  <recharts_1.Area type="monotone" dataKey="income" stackId="1" stroke="#8884d8" fill="#8884d8" name="Receita"/>
                  <recharts_1.Area type="monotone" dataKey="expenses" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Despesas"/>
                </recharts_1.AreaChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Chart */}
            <card_1.Card className="lg:col-span-2">
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.BarChart3 className="h-5 w-5"/>
                  Fluxo de Caixa Diário
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Receitas, despesas e projeções dos últimos {cashFlowData.length} dias
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={400}>
                  <recharts_1.LineChart data={cashFlowData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="date" tickFormatter={function (date) { return new Date(date).getDate().toString(); }}/>
                    <recharts_1.YAxis tickFormatter={function (value) { return "R$ ".concat((value / 1000).toFixed(0), "k"); }}/>
                    <recharts_1.Tooltip formatter={function (value, name) { return [formatCurrency(Number(value)), name]; }} labelFormatter={function (date) { return new Date(date).toLocaleDateString('pt-BR'); }}/>
                    <recharts_1.Line type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={2} name="Receita"/>
                    <recharts_1.Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} name="Despesas"/>
                    <recharts_1.Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} name="Lucro"/>
                    <recharts_1.Line type="monotone" dataKey="projection" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Projeção"/>
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            {/* Cash Flow Summary */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Resumo do Período</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {(function () {
            var totalIncome = cashFlowData.reduce(function (sum, day) { return sum + day.income; }, 0);
            var totalExpenses = cashFlowData.reduce(function (sum, day) { return sum + day.expenses; }, 0);
            var totalProfit = totalIncome - totalExpenses;
            var avgDailyProfit = totalProfit / cashFlowData.length;
            return (<>
                      <div className="flex justify-between items-center">
                        <span>Receita Total:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Despesas Total:</span>
                        <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span>Lucro Total:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(totalProfit)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Lucro Médio/Dia:</span>
                        <span className="font-semibold">{formatCurrency(avgDailyProfit)}</span>
                      </div>
                    </>);
        })()}
              </card_1.CardContent>
            </card_1.Card>

            {/* Performance Indicators */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Indicadores de Performance</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ROI Mensal</span>
                    <badge_1.Badge variant="secondary">+23.5%</badge_1.Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}/>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Eficiência Operacional</span>
                    <badge_1.Badge variant="secondary">92%</badge_1.Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}/>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Crescimento vs Meta</span>
                    <badge_1.Badge variant="secondary">108%</badge_1.Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}/>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Performance Table */}
            <card_1.Card className="lg:col-span-2">
              <card_1.CardHeader>
                <card_1.CardTitle>Performance por Serviço</card_1.CardTitle>
                <card_1.CardDescription>
                  Análise detalhada de receita e margem por tipo de serviço
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {servicePerformance.map(function (service, index) { return (<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{service.service}</h4>
                        <p className="text-sm text-gray-600">
                          {service.count} procedimentos • {formatCurrency(service.avgValue)} ticket médio
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold">{formatCurrency(service.revenue)}</p>
                        <div className="flex items-center gap-2">
                          <badge_1.Badge variant={service.growth >= 0 ? "default" : "destructive"}>
                            {service.growth >= 0 ? '+' : ''}{service.growth.toFixed(1)}%
                          </badge_1.Badge>
                          <span className="text-sm text-gray-600">
                            {formatPercentage(service.profitMargin)} margem
                          </span>
                        </div>
                      </div>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Service Revenue Chart */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.PieChart className="h-5 w-5"/>
                  Distribuição de Receita
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <Pie data={servicePerformance} dataKey="revenue" nameKey="service" cx="50%" cy="50%" outerRadius={80} label={function (_a) {
        var name = _a.name, percent = _a.percent;
        return "".concat(name, " ").concat((percent * 100).toFixed(1), "%");
    }}>
                      {servicePerformance.map(function (entry, index) { return (<recharts_1.Cell key={"cell-".concat(index)} fill={COLORS[index % COLORS.length]}/>); })}
                    </Pie>
                    <recharts_1.Tooltip formatter={function (value) { return formatCurrency(Number(value)); }}/>
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            {/* Service Growth Chart */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Crescimento por Serviço</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={servicePerformance} layout="horizontal">
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis type="number" tickFormatter={function (value) { return "".concat(value, "%"); }}/>
                    <recharts_1.YAxis type="category" dataKey="service" width={100}/>
                    <recharts_1.Tooltip formatter={function (value) { return ["".concat(value, "%"), 'Crescimento']; }}/>
                    <recharts_1.Bar dataKey="growth" fill="#8884d8"/>
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {predictiveInsights.map(function (insight, index) { return (<card_1.Card key={index}>
                <card_1.CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <card_1.CardTitle className="text-lg">{insight.title}</card_1.CardTitle>
                        <card_1.CardDescription className="mt-1">
                          {insight.description}
                        </card_1.CardDescription>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <badge_1.Badge variant={insight.impact === 'high' ? 'destructive' :
                insight.impact === 'medium' ? 'default' : 'secondary'}>
                        Impacto {insight.impact === 'high' ? 'Alto' :
                insight.impact === 'medium' ? 'Médio' : 'Baixo'}
                      </badge_1.Badge>
                      <p className="text-sm text-gray-600">
                        {insight.confidence}% confiança
                      </p>
                    </div>
                  </div>
                </card_1.CardHeader>
                {insight.actionItems && (<card_1.CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Ações Recomendadas:</h4>
                      <ul className="space-y-1">
                        {insight.actionItems.map(function (action, actionIndex) { return (<li key={actionIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {action}
                          </li>); })}
                      </ul>
                    </div>
                  </card_1.CardContent>)}
              </card_1.Card>); })}
          </div>

          {/* Generate New Insights Button */}
          <card_1.Card>
            <card_1.CardContent className="p-6 text-center">
              <button_1.Button onClick={function () {
            toast({
                title: "Gerando Novos Insights",
                description: "Analisando dados para identificar novas oportunidades...",
            });
            setTimeout(function () { return generateMockData(); }, 2000);
        }} className="w-full sm:w-auto">
                <lucide_react_1.Target className="mr-2 h-4 w-4"/>
                Gerar Novos Insights AI
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
