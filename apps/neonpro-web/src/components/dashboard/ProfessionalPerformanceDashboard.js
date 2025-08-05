'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfessionalPerformanceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var professionals_1 = require("@/lib/supabase/professionals");
var metricTypeLabels = {
    quality: 'Qualidade',
    safety: 'Segurança',
    efficiency: 'Eficiência',
    patient_satisfaction: 'Satisfação do Paciente',
    productivity: 'Produtividade',
    compliance: 'Conformidade',
    availability: 'Disponibilidade'
};
var getMetricIcon = function (type) {
    switch (type) {
        case 'quality':
            return <lucide_react_1.Award className="h-4 w-4"/>;
        case 'safety':
            return <lucide_react_1.CheckCircle className="h-4 w-4"/>;
        case 'efficiency':
            return <lucide_react_1.Clock className="h-4 w-4"/>;
        case 'patient_satisfaction':
            return <lucide_react_1.Star className="h-4 w-4"/>;
        case 'productivity':
            return <lucide_react_1.TrendingUp className="h-4 w-4"/>;
        case 'compliance':
            return <lucide_react_1.Target className="h-4 w-4"/>;
        case 'availability':
            return <lucide_react_1.Calendar className="h-4 w-4"/>;
        default:
            return <lucide_react_1.Activity className="h-4 w-4"/>;
    }
};
var getChangeIcon = function (changeType) {
    switch (changeType) {
        case 'increase':
            return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>;
        case 'decrease':
            return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>;
        default:
            return <lucide_react_1.Activity className="h-4 w-4 text-gray-600"/>;
    }
};
var getPerformanceColor = function (value, max) {
    if (max === void 0) { max = 100; }
    var percentage = (value / max) * 100;
    if (percentage >= 90)
        return 'text-green-600';
    if (percentage >= 70)
        return 'text-yellow-600';
    return 'text-red-600';
};
function ProfessionalPerformanceDashboard(_a) {
    var _this = this;
    var professionalId = _a.professionalId;
    var _b = (0, react_1.useState)([]), professionals = _b[0], setProfessionals = _b[1];
    var _c = (0, react_1.useState)(professionalId || 'all'), selectedProfessional = _c[0], setSelectedProfessional = _c[1];
    var _d = (0, react_1.useState)([]), metrics = _d[0], setMetrics = _d[1];
    var _e = (0, react_1.useState)([]), teamPerformance = _e[0], setTeamPerformance = _e[1];
    var _f = (0, react_1.useState)('month'), period = _f[0], setPeriod = _f[1];
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    // Mock data for demonstration
    var overviewMetrics = [
        {
            id: 'satisfaction',
            title: 'Satisfação do Paciente',
            value: '4.8',
            previousValue: '4.6',
            change: 4.3,
            changeType: 'increase',
            icon: <lucide_react_1.Star className="h-4 w-4"/>,
            description: 'Média de avaliações dos pacientes'
        },
        {
            id: 'consultations',
            title: 'Consultas Realizadas',
            value: 142,
            previousValue: 128,
            change: 10.9,
            changeType: 'increase',
            icon: <lucide_react_1.Calendar className="h-4 w-4"/>,
            description: 'Total de consultas no período'
        },
        {
            id: 'revenue',
            title: 'Receita Gerada',
            value: 'R$ 28.400',
            previousValue: 'R$ 24.800',
            change: 14.5,
            changeType: 'increase',
            icon: <lucide_react_1.DollarSign className="h-4 w-4"/>,
            description: 'Receita total no período'
        },
        {
            id: 'efficiency',
            title: 'Eficiência Operacional',
            value: '92%',
            previousValue: '89%',
            change: 3.4,
            changeType: 'increase',
            icon: <lucide_react_1.Clock className="h-4 w-4"/>,
            description: 'Pontualidade e duração adequada'
        }
    ];
    (0, react_1.useEffect)(function () {
        loadData();
    }, [selectedProfessional, period]);
    var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
        var professionalsData, metricsData, aggregatedData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 8]);
                    setLoading(true);
                    return [4 /*yield*/, (0, professionals_1.getProfessionals)()];
                case 1:
                    professionalsData = _a.sent();
                    setProfessionals(professionalsData);
                    if (!(selectedProfessional !== 'all')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, professionals_1.getProfessionalMetrics)(selectedProfessional, period)];
                case 2:
                    metricsData = _a.sent();
                    setMetrics(metricsData);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, professionals_1.getAggregatedMetrics)(period)
                    // Handle aggregated metrics
                ];
                case 4:
                    aggregatedData = _a.sent();
                    _a.label = 5;
                case 5:
                    // Generate mock team performance data
                    generateTeamPerformanceData(professionalsData);
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error loading performance data:', error_1);
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var generateTeamPerformanceData = function (professionalsData) {
        var teamData = professionalsData.slice(0, 10).map(function (professional) { return ({
            professional: professional,
            metrics: {
                satisfaction: Math.random() * 2 + 3, // 3-5 range
                consultations: Math.floor(Math.random() * 100) + 50, // 50-150 range
                revenue: Math.floor(Math.random() * 20000) + 10000, // 10k-30k range
                efficiency: Math.floor(Math.random() * 30) + 70 // 70-100% range
            }
        }); });
        setTeamPerformance(teamData);
    };
    return (<div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Acompanhe métricas de performance e qualidade
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select_1.Select value={period} onValueChange={function (value) { return setPeriod(value); }}>
            <select_1.SelectTrigger className="w-[180px]">
              <select_1.SelectValue placeholder="Período"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="week">Última Semana</select_1.SelectItem>
              <select_1.SelectItem value="month">Último Mês</select_1.SelectItem>
              <select_1.SelectItem value="quarter">Último Trimestre</select_1.SelectItem>
              <select_1.SelectItem value="year">Último Ano</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <select_1.Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
            <select_1.SelectTrigger className="w-[200px]">
              <select_1.SelectValue placeholder="Profissional"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os Profissionais</select_1.SelectItem>
              {professionals.map(function (professional) { return (<select_1.SelectItem key={professional.id} value={professional.id}>
                  {professional.given_name} {professional.family_name}
                </select_1.SelectItem>); })}
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>

      <tabs_1.Tabs defaultValue="overview" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="individual">Performance Individual</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="team">Comparativo da Equipe</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="goals">Metas e Objetivos</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewMetrics.map(function (metric) {
            var _a;
            return (<card_1.Card key={metric.id}>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">
                    {metric.title}
                  </card_1.CardTitle>
                  {metric.icon}
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getChangeIcon(metric.changeType || 'neutral')}
                    <span className="ml-1">
                      {(_a = metric.change) === null || _a === void 0 ? void 0 : _a.toFixed(1)}% em relação ao período anterior
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                </card_1.CardContent>
              </card_1.Card>);
        })}
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.LineChart className="h-5 w-5"/>
                  Satisfação do Paciente
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Evolução da satisfação ao longo do tempo
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de linha da satisfação do paciente
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.BarChart3 className="h-5 w-5"/>
                  Produtividade por Especialidade
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Comparativo de consultas por área
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de barras da produtividade
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Top Performers */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Award className="h-5 w-5"/>
                Melhores Performers do Mês
              </card_1.CardTitle>
              <card_1.CardDescription>
                Profissionais com melhor desempenho no período
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {teamPerformance.slice(0, 5).map(function (performer, index) { return (<div key={performer.professional.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {performer.professional.given_name} {performer.professional.family_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {performer.professional.qualification}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{performer.metrics.satisfaction.toFixed(1)}</div>
                        <div className="text-muted-foreground">Satisfação</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{performer.metrics.consultations}</div>
                        <div className="text-muted-foreground">Consultas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{performer.metrics.efficiency}%</div>
                        <div className="text-muted-foreground">Eficiência</div>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Individual Performance Tab */}
        <tabs_1.TabsContent value="individual" className="space-y-6">
          {selectedProfessional === 'all' ? (<card_1.Card>
              <card_1.CardContent className="pt-6">
                <div className="text-center">
                  <lucide_react_1.Users className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                  <p className="text-muted-foreground">
                    Selecione um profissional específico para ver métricas individuais
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>) : (<>
              {/* Individual Metrics */}
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {Object.entries(metricTypeLabels).map(function (_a) {
                var type = _a[0], label = _a[1];
                return (<card_1.Card key={type}>
                    <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <card_1.CardTitle className="text-sm font-medium">{label}</card_1.CardTitle>
                      {getMetricIcon(type)}
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="text-2xl font-bold">
                        {Math.floor(Math.random() * 30) + 70}%
                      </div>
                      <progress_1.Progress value={Math.floor(Math.random() * 30) + 70} className="mt-2"/>
                    </card_1.CardContent>
                  </card_1.Card>);
            })}
              </div>

              {/* Detailed Metrics */}
              <div className="grid gap-6 md:grid-cols-2">
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Histórico de Performance</card_1.CardTitle>
                    <card_1.CardDescription>
                      Evolução das métricas nos últimos 6 meses
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Gráfico de evolução individual
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Feedback dos Pacientes</card_1.CardTitle>
                    <card_1.CardDescription>
                      Resumo das avaliações recebidas
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Excelente (5 estrelas)</span>
                        <div className="flex items-center gap-2">
                          <progress_1.Progress value={85} className="w-20"/>
                          <span className="text-sm">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Muito Bom (4 estrelas)</span>
                        <div className="flex items-center gap-2">
                          <progress_1.Progress value={12} className="w-20"/>
                          <span className="text-sm">12%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bom (3 estrelas)</span>
                        <div className="flex items-center gap-2">
                          <progress_1.Progress value={3} className="w-20"/>
                          <span className="text-sm">3%</span>
                        </div>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>

              {/* Areas for Improvement */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.AlertTriangle className="h-5 w-5"/>
                    Áreas de Melhoria
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Sugestões baseadas nos dados coletados
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5"/>
                      <div>
                        <div className="font-medium">Pontualidade</div>
                        <div className="text-sm text-muted-foreground">
                          Considere revisar o cronograma para melhorar a pontualidade nas consultas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5"/>
                      <div>
                        <div className="font-medium">Tempo de Consulta</div>
                        <div className="text-sm text-muted-foreground">
                          Algumas consultas estão excedendo o tempo programado
                        </div>
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </>)}
        </tabs_1.TabsContent>

        {/* Team Comparison Tab */}
        <tabs_1.TabsContent value="team" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Comparativo da Equipe</card_1.CardTitle>
              <card_1.CardDescription>
                Performance de todos os profissionais no período selecionado
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Profissional</table_1.TableHead>
                    <table_1.TableHead>Satisfação</table_1.TableHead>
                    <table_1.TableHead>Consultas</table_1.TableHead>
                    <table_1.TableHead>Receita</table_1.TableHead>
                    <table_1.TableHead>Eficiência</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {teamPerformance.map(function (performer) { return (<table_1.TableRow key={performer.professional.id}>
                      <table_1.TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                            {performer.professional.given_name[0]}{performer.professional.family_name[0]}
                          </div>
                          <div>
                            <div className="font-medium">
                              {performer.professional.given_name} {performer.professional.family_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {performer.professional.qualification}
                            </div>
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Star className="h-4 w-4 text-yellow-500"/>
                          <span className={getPerformanceColor(performer.metrics.satisfaction, 5)}>
                            {performer.metrics.satisfaction.toFixed(1)}
                          </span>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <span className={getPerformanceColor(performer.metrics.consultations, 150)}>
                          {performer.metrics.consultations}
                        </span>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <span className={getPerformanceColor(performer.metrics.revenue, 30000)}>
                          R$ {performer.metrics.revenue.toLocaleString()}
                        </span>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          <progress_1.Progress value={performer.metrics.efficiency} className="w-16"/>
                          <span className={getPerformanceColor(performer.metrics.efficiency)}>
                            {performer.metrics.efficiency}%
                          </span>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant={performer.metrics.efficiency >= 90 ? 'default' :
                performer.metrics.efficiency >= 70 ? 'secondary' : 'destructive'}>
                          {performer.metrics.efficiency >= 90 ? 'Excelente' :
                performer.metrics.efficiency >= 70 ? 'Bom' : 'Precisa Melhorar'}
                        </badge_1.Badge>
                      </table_1.TableCell>
                    </table_1.TableRow>); })}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Goals Tab */}
        <tabs_1.TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Target className="h-5 w-5"/>
                  Metas Individuais
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Progresso das metas do profissional selecionado
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Satisfação do Paciente</span>
                      <span className="text-sm text-muted-foreground">4.8 / 5.0</span>
                    </div>
                    <progress_1.Progress value={96}/>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Consultas Mensais</span>
                      <span className="text-sm text-muted-foreground">142 / 150</span>
                    </div>
                    <progress_1.Progress value={94.7}/>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pontualidade</span>
                      <span className="text-sm text-muted-foreground">88 / 95%</span>
                    </div>
                    <progress_1.Progress value={92.6}/>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Activity className="h-5 w-5"/>
                  Metas da Equipe
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Objetivos coletivos da clínica
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Satisfação Geral</span>
                      <span className="text-sm text-muted-foreground">4.6 / 5.0</span>
                    </div>
                    <progress_1.Progress value={92}/>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Receita Mensal</span>
                      <span className="text-sm text-muted-foreground">R$ 380k / R$ 400k</span>
                    </div>
                    <progress_1.Progress value={95}/>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Taxa de Retenção</span>
                      <span className="text-sm text-muted-foreground">78 / 85%</span>
                    </div>
                    <progress_1.Progress value={91.8}/>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Goals Timeline */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Cronograma de Metas</card_1.CardTitle>
              <card_1.CardDescription>
                Próximas avaliações e marcos importantes
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1">
                    <div className="font-medium">Avaliação Trimestral</div>
                    <div className="text-sm text-muted-foreground">Revisão completa de performance - 15 de Março</div>
                  </div>
                  <badge_1.Badge variant="outline">Em 2 semanas</badge_1.Badge>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  <div className="flex-1">
                    <div className="font-medium">Meta de Satisfação</div>
                    <div className="text-sm text-muted-foreground">Objetivo: manter acima de 4.5 estrelas</div>
                  </div>
                  <badge_1.Badge variant="default">Atingida</badge_1.Badge>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-yellow-600"></div>
                  <div className="flex-1">
                    <div className="font-medium">Treinamento Obrigatório</div>
                    <div className="text-sm text-muted-foreground">Atualização em protocolos de segurança - 30 de Março</div>
                  </div>
                  <badge_1.Badge variant="secondary">Agendado</badge_1.Badge>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
