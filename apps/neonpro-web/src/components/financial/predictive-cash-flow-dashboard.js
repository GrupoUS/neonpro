/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW DASHBOARD
 * =====================================================================================
 *
 * Advanced UI for predictive cash flow analysis and scenario planning.
 * Real-time forecasting with interactive charts and scenario comparison.
 *
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 *
 * Features:
 * - Real-time cash flow predictions
 * - Interactive forecasting charts
 * - Scenario planning and comparison
 * - Confidence interval visualization
 * - Model accuracy tracking
 * - Export and scheduling capabilities
 * =====================================================================================
 */
'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.PredictiveCashFlowDashboard = PredictiveCashFlowDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var use_toast_1 = require("@/hooks/use-toast");
var utils_1 = require("@/lib/utils");
function PredictiveCashFlowDashboard(_a) {
    // =====================================================================================
    // STATE MANAGEMENT
    // =====================================================================================
    var _this = this;
    var clinicId = _a.clinicId;
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), predicting = _c[0], setPredicting = _c[1];
    var _d = (0, react_1.useState)([]), predictions = _d[0], setPredictions = _d[1];
    var _e = (0, react_1.useState)([]), scenarios = _e[0], setScenarios = _e[1];
    var _f = (0, react_1.useState)([]), models = _f[0], setModels = _f[1];
    var _g = (0, react_1.useState)(''), selectedModel = _g[0], setSelectedModel = _g[1];
    var _h = (0, react_1.useState)('monthly'), selectedPeriod = _h[0], setSelectedPeriod = _h[1];
    var _j = (0, react_1.useState)(''), selectedScenario = _j[0], setSelectedScenario = _j[1];
    var _k = (0, react_1.useState)({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months
    }), forecastRange = _k[0], setForecastRange = _k[1];
    // =====================================================================================
    // DATA LOADING
    // =====================================================================================
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, predictionsRes, scenariosRes, modelsRes, predictionsData, scenariosData, modelsData, bestModel, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 8, 9, 10]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            fetch("/api/financial/predictive-cash-flow/predictions?clinicId=".concat(clinicId, "&limit=50")),
                            fetch("/api/financial/predictive-cash-flow/scenarios?clinicId=".concat(clinicId)),
                            fetch("/api/financial/predictive-cash-flow/models?active=true"),
                        ])];
                case 1:
                    _a = _d.sent(), predictionsRes = _a[0], scenariosRes = _a[1], modelsRes = _a[2];
                    if (!predictionsRes.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, predictionsRes.json()];
                case 2:
                    predictionsData = _d.sent();
                    setPredictions(predictionsData.predictions || []);
                    _d.label = 3;
                case 3:
                    if (!scenariosRes.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, scenariosRes.json()];
                case 4:
                    scenariosData = _d.sent();
                    setScenarios(scenariosData.scenarios || []);
                    _d.label = 5;
                case 5:
                    if (!modelsRes.ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, modelsRes.json()];
                case 6:
                    modelsData = _d.sent();
                    setModels(modelsData.models || []);
                    bestModel = ((_b = modelsData.models) === null || _b === void 0 ? void 0 : _b.find(function (m) { return m.is_production_ready; })) || ((_c = modelsData.models) === null || _c === void 0 ? void 0 : _c[0]);
                    if (bestModel) {
                        setSelectedModel(bestModel.id);
                    }
                    _d.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_1 = _d.sent();
                    console.error('Error loading predictive data:', error_1);
                    (0, use_toast_1.toast)({
                        title: 'Erro ao carregar dados',
                        description: 'Não foi possível carregar os dados de previsão.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [clinicId]);
    (0, react_1.useEffect)(function () {
        loadData();
    }, [loadData]);
    // =====================================================================================
    // PREDICTION GENERATION
    // =====================================================================================
    var generatePrediction = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedModel) {
                        (0, use_toast_1.toast)({
                            title: 'Modelo não selecionado',
                            description: 'Selecione um modelo de previsão primeiro.',
                            variant: 'destructive',
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    setPredicting(true);
                    return [4 /*yield*/, fetch('/api/financial/predictive-cash-flow/predictions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                clinicId: clinicId,
                                modelId: selectedModel,
                                periodType: selectedPeriod,
                                startDate: forecastRange.startDate,
                                endDate: forecastRange.endDate,
                                scenarioId: selectedScenario || undefined,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to generate prediction');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    (0, use_toast_1.toast)({
                        title: 'Previsão gerada',
                        description: "Previs\u00E3o de fluxo de caixa gerada com ".concat(result.prediction.confidence_score.toFixed(1), "% de confian\u00E7a."),
                    });
                    // Reload predictions
                    return [4 /*yield*/, loadData()];
                case 4:
                    // Reload predictions
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_2 = _a.sent();
                    console.error('Error generating prediction:', error_2);
                    (0, use_toast_1.toast)({
                        title: 'Erro na previsão',
                        description: 'Não foi possível gerar a previsão de fluxo de caixa.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 7];
                case 6:
                    setPredicting(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // =====================================================================================
    // CHART DATA PREPARATION
    // =====================================================================================
    var prepareChartData = function () {
        return predictions
            .filter(function (p) { return new Date(p.start_date) >= new Date(forecastRange.startDate); })
            .sort(function (a, b) { return new Date(a.start_date).getTime() - new Date(b.start_date).getTime(); })
            .map(function (prediction) { return ({
            date: new Date(prediction.start_date).toLocaleDateString('pt-BR', {
                month: 'short',
                year: '2-digit'
            }),
            predicted: prediction.predicted_net_amount / 100, // Convert from cents
            inflow: prediction.predicted_inflow_amount / 100,
            outflow: -(prediction.predicted_outflow_amount / 100),
            confidence: prediction.confidence_score,
            confidenceLower: prediction.confidence_interval_lower / 100,
            confidenceUpper: prediction.confidence_interval_upper / 100,
        }); });
    };
    var chartData = prepareChartData();
    // =====================================================================================
    // METRICS CALCULATION
    // =====================================================================================
    var calculateMetrics = function () {
        var recentPredictions = predictions.slice(0, 12); // Last 12 predictions
        if (recentPredictions.length === 0) {
            return {
                avgConfidence: 0,
                totalPredictedInflow: 0,
                totalPredictedOutflow: 0,
                totalPredictedNet: 0,
                trend: 'stable',
                trendPercentage: 0,
            };
        }
        var avgConfidence = recentPredictions.reduce(function (sum, p) { return sum + p.confidence_score; }, 0) / recentPredictions.length;
        var totalPredictedInflow = recentPredictions.reduce(function (sum, p) { return sum + p.predicted_inflow_amount; }, 0);
        var totalPredictedOutflow = recentPredictions.reduce(function (sum, p) { return sum + p.predicted_outflow_amount; }, 0);
        var totalPredictedNet = recentPredictions.reduce(function (sum, p) { return sum + p.predicted_net_amount; }, 0);
        // Calculate trend
        var firstHalf = recentPredictions.slice(recentPredictions.length / 2);
        var secondHalf = recentPredictions.slice(0, recentPredictions.length / 2);
        var firstAvg = firstHalf.reduce(function (sum, p) { return sum + p.predicted_net_amount; }, 0) / firstHalf.length;
        var secondAvg = secondHalf.reduce(function (sum, p) { return sum + p.predicted_net_amount; }, 0) / secondHalf.length;
        var trendPercentage = firstAvg !== 0 ? ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100 : 0;
        var trend = trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable';
        return {
            avgConfidence: avgConfidence,
            totalPredictedInflow: totalPredictedInflow,
            totalPredictedOutflow: totalPredictedOutflow,
            totalPredictedNet: totalPredictedNet,
            trend: trend,
            trendPercentage: Math.abs(trendPercentage),
        };
    };
    var metrics = calculateMetrics();
    // =====================================================================================
    // UI RENDERING
    // =====================================================================================
    if (loading) {
        return (<div className="flex items-center justify-center h-96">
        <div className="text-center">
          <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4"/>
          <p className="text-muted-foreground">Carregando dados de previsão...</p>
        </div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análise Preditiva de Fluxo de Caixa</h2>
          <p className="text-muted-foreground">
            Previsões inteligentes com IA e análise de cenários
          </p>
        </div>
        
        <div className="flex gap-2">
          <button_1.Button onClick={generatePrediction} disabled={predicting}>
            {predicting ? (<>
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin"/>
                Gerando...
              </>) : (<>
                <lucide_react_1.Target className="h-4 w-4 mr-2"/>
                Gerar Previsão
              </>)}
          </button_1.Button>
          <button_1.Button variant="outline">
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Confiança Média</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{metrics.avgConfidence.toFixed(1)}%</div>
            <progress_1.Progress value={metrics.avgConfidence} className="mt-2"/>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Entrada Prevista</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(0, utils_1.formatCurrency)(metrics.totalPredictedInflow)}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 12 períodos</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Saída Prevista</card_1.CardTitle>
            <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(0, utils_1.formatCurrency)(metrics.totalPredictedOutflow)}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 12 períodos</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Resultado Previsto</card_1.CardTitle>
            {metrics.trend === 'up' ? (<lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>) : metrics.trend === 'down' ? (<lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>) : (<lucide_react_1.Target className="h-4 w-4 text-blue-600"/>)}
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className={"text-2xl font-bold ".concat(metrics.totalPredictedNet >= 0 ? 'text-green-600' : 'text-red-600')}>
              {(0, utils_1.formatCurrency)(metrics.totalPredictedNet)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <badge_1.Badge variant={metrics.trend === 'up' ? 'default' : metrics.trend === 'down' ? 'destructive' : 'secondary'}>
                {metrics.trend === 'up' ? '↗' : metrics.trend === 'down' ? '↘' : '→'} {metrics.trendPercentage.toFixed(1)}%
              </badge_1.Badge>
              <span className="text-muted-foreground">tendência</span>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Dashboard */}
      <tabs_1.Tabs defaultValue="forecast" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="forecast">Previsão</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="scenarios">Cenários</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="models">Modelos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="accuracy">Precisão</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Forecast Tab */}
        <tabs_1.TabsContent value="forecast" className="space-y-4">
          {/* Configuration Panel */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Configuração da Previsão</card_1.CardTitle>
              <card_1.CardDescription>
                Configure os parâmetros para gerar previsões de fluxo de caixa
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="model-select">Modelo de IA</label_1.Label>
                  <select_1.Select value={selectedModel} onValueChange={setSelectedModel}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecionar modelo"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {models.map(function (model) {
            var _a;
            return (<select_1.SelectItem key={model.id} value={model.id}>
                          {model.name} ({(_a = model.accuracy_rate) === null || _a === void 0 ? void 0 : _a.toFixed(1)}%)
                        </select_1.SelectItem>);
        })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="period-select">Período</label_1.Label>
                  <select_1.Select value={selectedPeriod} onValueChange={function (value) { return setSelectedPeriod(value); }}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="weekly">Semanal</select_1.SelectItem>
                      <select_1.SelectItem value="monthly">Mensal</select_1.SelectItem>
                      <select_1.SelectItem value="quarterly">Trimestral</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="start-date">Data Inicial</label_1.Label>
                  <input_1.Input id="start-date" type="date" value={forecastRange.startDate} onChange={function (e) { return setForecastRange(function (prev) { return (__assign(__assign({}, prev), { startDate: e.target.value })); }); }}/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="end-date">Data Final</label_1.Label>
                  <input_1.Input id="end-date" type="date" value={forecastRange.endDate} onChange={function (e) { return setForecastRange(function (prev) { return (__assign(__assign({}, prev), { endDate: e.target.value })); }); }}/>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Forecast Chart */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Previsão de Fluxo de Caixa</card_1.CardTitle>
              <card_1.CardDescription>
                Visualização das previsões com intervalos de confiança
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="h-96 w-full">
                <recharts_1.ResponsiveContainer width="100%" height="100%">
                  <recharts_1.ComposedChart data={chartData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="date"/>
                    <recharts_1.YAxis tickFormatter={function (value) { return (0, utils_1.formatCurrency)(value * 100, true); }}/>
                    <recharts_1.Tooltip formatter={function (value, name) { return [
            (0, utils_1.formatCurrency)(value * 100),
            name === 'predicted' ? 'Previsto' :
                name === 'inflow' ? 'Entrada' :
                    name === 'outflow' ? 'Saída' : name
        ]; }} labelFormatter={function (label) { return "Per\u00EDodo: ".concat(label); }}/>
                    <recharts_1.Legend />
                    
                    {/* Confidence interval */}
                    <recharts_1.Area dataKey="confidenceUpper" stroke="none" fill="#60a5fa" fillOpacity={0.1} name="Intervalo Superior"/>
                    <recharts_1.Area dataKey="confidenceLower" stroke="none" fill="#60a5fa" fillOpacity={0.1} name="Intervalo Inferior"/>
                    
                    {/* Cash flow bars */}
                    <recharts_1.Bar dataKey="inflow" fill="#10b981" name="Entrada"/>
                    <recharts_1.Bar dataKey="outflow" fill="#ef4444" name="Saída"/>
                    
                    {/* Prediction line */}
                    <recharts_1.Line type="monotone" dataKey="predicted" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }} name="Líquido Previsto"/>
                  </recharts_1.ComposedChart>
                </recharts_1.ResponsiveContainer>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Recent Predictions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Previsões Recentes</card_1.CardTitle>
              <card_1.CardDescription>
                Histórico das últimas previsões geradas
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {predictions.slice(0, 5).map(function (prediction) { return (<div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
                        <span className="font-medium">
                          {new Date(prediction.start_date).toLocaleDateString('pt-BR')} - {new Date(prediction.end_date).toLocaleDateString('pt-BR')}
                        </span>
                        <badge_1.Badge variant="outline">{prediction.period_type}</badge_1.Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Entrada: {(0, utils_1.formatCurrency)(prediction.predicted_inflow_amount)} | 
                        Saída: {(0, utils_1.formatCurrency)(prediction.predicted_outflow_amount)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={"text-lg font-bold ".concat(prediction.predicted_net_amount >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {(0, utils_1.formatCurrency)(prediction.predicted_net_amount)}
                      </div>
                      <div className="flex items-center gap-1">
                        <lucide_react_1.Target className="h-3 w-3 text-muted-foreground"/>
                        <span className="text-xs text-muted-foreground">
                          {prediction.confidence_score.toFixed(1)}% confiança
                        </span>
                      </div>
                    </div>
                  </div>); })}
                
                {predictions.length === 0 && (<div className="text-center py-8 text-muted-foreground">
                    <lucide_react_1.BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                    <p>Nenhuma previsão encontrada</p>
                    <p className="text-sm">Gere sua primeira previsão usando o botão acima</p>
                  </div>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Scenarios Tab */}
        <tabs_1.TabsContent value="scenarios" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Análise de Cenários</card_1.CardTitle>
              <card_1.CardDescription>
                Compare diferentes cenários de previsão financeira
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Plus className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                <p>Funcionalidade de cenários em desenvolvimento</p>
                <p className="text-sm">Em breve você poderá criar e comparar diferentes cenários</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Models Tab */}
        <tabs_1.TabsContent value="models" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Modelos de IA</card_1.CardTitle>
              <card_1.CardDescription>
                Gerencie e monitore os modelos de predição
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {models.map(function (model) {
            var _a;
            return (<div key={model.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{model.name}</h3>
                        <badge_1.Badge variant={model.is_production_ready ? 'default' : 'secondary'}>
                          {model.is_production_ready ? 'Produção' : 'Desenvolvimento'}
                        </badge_1.Badge>
                        {model.is_active && (<badge_1.Badge variant="outline">Ativo</badge_1.Badge>)}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{(_a = model.accuracy_rate) === null || _a === void 0 ? void 0 : _a.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Precisão</div>
                      </div>
                    </div>
                    
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div>Tipo: {model.model_type} | Algoritmo: {model.algorithm_type}</div>
                      <div>Versão: {model.version} | Última atualização: {new Date(model.last_trained).toLocaleDateString('pt-BR')}</div>
                      {model.description && <div>{model.description}</div>}
                    </div>
                    
                    <progress_1.Progress value={model.accuracy_rate} className="mt-3"/>
                  </div>);
        })}
                
                {models.length === 0 && (<div className="text-center py-8 text-muted-foreground">
                    <lucide_react_1.Settings className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                    <p>Nenhum modelo encontrado</p>
                    <p className="text-sm">Configure modelos de IA para começar</p>
                  </div>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Accuracy Tab */}
        <tabs_1.TabsContent value="accuracy" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Precisão dos Modelos</card_1.CardTitle>
              <card_1.CardDescription>
                Monitore a precisão e performance dos modelos de IA
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                <p>Dados de precisão em desenvolvimento</p>
                <p className="text-sm">Histórico de precisão será exibido após validações</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
exports.default = PredictiveCashFlowDashboard;
