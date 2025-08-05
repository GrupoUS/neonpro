"use client";
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
exports.default = PredictiveAnalyticsPage;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function PredictiveAnalyticsPage() {
    var _this = this;
    var _a = (0, react_1.useState)("dashboard"), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)([]), models = _b[0], setModels = _b[1];
    var _c = (0, react_1.useState)([]), predictions = _c[0], setPredictions = _c[1];
    var _d = (0, react_1.useState)([]), alerts = _d[0], setAlerts = _d[1];
    var _e = (0, react_1.useState)({}), accuracyStats = _e[0], setAccuracyStats = _e[1];
    var _f = (0, react_1.useState)([]), recommendations = _f[0], setRecommendations = _f[1];
    var _g = (0, react_1.useState)(true), isLoading = _g[0], setIsLoading = _g[1];
    var _h = (0, react_1.useState)(""), searchTerm = _h[0], setSearchTerm = _h[1];
    var _j = (0, react_1.useState)("all"), statusFilter = _j[0], setStatusFilter = _j[1];
    // Carregar dados iniciais
    (0, react_1.useEffect)(function () {
        loadData();
    }, []);
    var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, modelsRes, predictionsRes, alertsRes, accuracyRes, recommendationsRes, _b, modelsData, predictionsData, alertsData, accuracyData, recommendationsData, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, Promise.all([
                            fetch("/api/predictive-analytics/models"),
                            fetch("/api/predictive-analytics/predictions"),
                            fetch("/api/predictive-analytics/alerts"),
                            fetch("/api/predictive-analytics/accuracy/stats"),
                            fetch("/api/predictive-analytics/recommendations"),
                        ])];
                case 2:
                    _a = _c.sent(), modelsRes = _a[0], predictionsRes = _a[1], alertsRes = _a[2], accuracyRes = _a[3], recommendationsRes = _a[4];
                    return [4 /*yield*/, Promise.all([
                            modelsRes.json(),
                            predictionsRes.json(),
                            alertsRes.json(),
                            accuracyRes.json(),
                            recommendationsRes.json(),
                        ])];
                case 3:
                    _b = _c.sent(), modelsData = _b[0], predictionsData = _b[1], alertsData = _b[2], accuracyData = _b[3], recommendationsData = _b[4];
                    setModels(modelsData.data || []);
                    setPredictions(predictionsData.data || []);
                    setAlerts(alertsData.data || []);
                    setAccuracyStats(accuracyData);
                    setRecommendations(recommendationsData || []);
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _c.sent();
                    console.error("Erro ao carregar dados:", error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "high":
                return "destructive";
            case "medium":
                return "default";
            case "low":
                return "secondary";
            default:
                return "outline";
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "active":
                return "default";
            case "training":
                return "secondary";
            case "inactive":
                return "outline";
            case "error":
                return "destructive";
            default:
                return "outline";
        }
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center h-96">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Análise Preditiva
          </h1>
          <p className="text-muted-foreground">
            Forecasting de demanda com IA para otimização de recursos
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={loadData}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>
          <button_1.Button>
            <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
            Novo Modelo
          </button_1.Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Modelos Ativos
            </card_1.CardTitle>
            <lucide_react_1.Brain className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {models.filter(function (m) { return m.status === "active"; }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de modelos treinados
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Precisão Média
            </card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(accuracyStats.average_accuracy * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Última avaliação</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Alertas Ativos
            </card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(function (a) { return a.status === "active"; }).length}
            </div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Predições Hoje
            </card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {predictions.filter(function (p) {
            return new Date(p.prediction_date).toDateString() ===
                new Date().toDateString();
        }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Geradas automaticamente
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Tabs principais */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="dashboard">Dashboard</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="models">Modelos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="predictions">Predições</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alertas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Relatórios</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="dashboard" className="space-y-4">
          {/* Recomendações */}
          {recommendations.length > 0 && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Zap className="h-5 w-5"/>
                  Recomendações de Otimização
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Sugestões para melhorar a performance dos modelos
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map(function (rec, index) {
                var _a;
                return (<div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <badge_1.Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </badge_1.Badge>
                      <div className="flex-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rec.description}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">
                            Ações sugeridas:
                          </p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {(_a = rec.suggested_actions) === null || _a === void 0 ? void 0 : _a.map(function (action, i) { return (<li key={i}>{action}</li>); })}
                          </ul>
                        </div>
                      </div>
                    </div>);
            })}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Modelos Recentes */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Brain className="h-5 w-5"/>
                Modelos Recentes
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {models.slice(0, 5).map(function (model) { return (<div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <badge_1.Badge variant={getStatusColor(model.status)}>
                        {model.status}
                      </badge_1.Badge>
                      <span className="text-xs text-muted-foreground">
                        {model.accuracy_score
                ? "".concat((model.accuracy_score * 100).toFixed(1), "%")
                : "N/A"}
                      </span>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="models" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input_1.Input placeholder="Buscar modelos..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="max-w-sm"/>
            </div>
            <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
              <select_1.SelectTrigger className="w-40">
                <select_1.SelectValue placeholder="Status"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
                <select_1.SelectItem value="training">Treinando</select_1.SelectItem>
                <select_1.SelectItem value="inactive">Inativo</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Lista de Modelos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {models
            .filter(function (model) {
            return (statusFilter === "all" || model.status === statusFilter) &&
                model.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
            .map(function (model) { return (<card_1.Card key={model.id}>
                  <card_1.CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <card_1.CardTitle className="text-lg">{model.name}</card_1.CardTitle>
                        <card_1.CardDescription>{model.description}</card_1.CardDescription>
                      </div>
                      <badge_1.Badge variant={getStatusColor(model.status)}>
                        {model.status}
                      </badge_1.Badge>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <p className="font-medium">{model.model_type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Precisão:</span>
                        <p className="font-medium">
                          {model.accuracy_score
                ? "".concat((model.accuracy_score * 100).toFixed(1), "%")
                : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Última Atualização:
                        </span>
                        <p className="font-medium">
                          {new Date(model.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Versão:</span>
                        <p className="font-medium">{model.version}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button_1.Button size="sm" variant="outline">
                        <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
                        Configurar
                      </button_1.Button>
                      <button_1.Button size="sm" variant="outline">
                        <lucide_react_1.BarChart3 className="h-4 w-4 mr-2"/>
                        Métricas
                      </button_1.Button>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="predictions" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Predições Recentes</card_1.CardTitle>
              <card_1.CardDescription>
                Últimas predições geradas pelos modelos de IA
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {predictions.slice(0, 10).map(function (prediction) { return (<div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">
                        Predição #{prediction.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Data:{" "}
                        {new Date(prediction.prediction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {prediction.predicted_value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Confiança:{" "}
                        {(prediction.confidence_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Alertas do Sistema</card_1.CardTitle>
              <card_1.CardDescription>
                Alertas de performance e qualidade dos modelos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {alerts.map(function (alert) { return (<div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <lucide_react_1.AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5"/>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{alert.title}</h4>
                        <badge_1.Badge variant={getPriorityColor(alert.severity)}>
                          {alert.severity}
                        </badge_1.Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="reports" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Relatórios de Performance</card_1.CardTitle>
              <card_1.CardDescription>
                Análise detalhada da precisão e performance dos modelos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Estatísticas Gerais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Precisão Média:</span>
                      <span className="font-medium">
                        {(accuracyStats.average_accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Avaliações:</span>
                      <span className="font-medium">
                        {accuracyStats.total_evaluations}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Melhor Precisão:</span>
                      <span className="font-medium">
                        {(accuracyStats.best_accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pior Precisão:</span>
                      <span className="font-medium">
                        {(accuracyStats.worst_accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ações Disponíveis</h4>
                  <div className="space-y-2">
                    <button_1.Button variant="outline" className="w-full justify-start">
                      <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                      Exportar Relatório Completo
                    </button_1.Button>
                    <button_1.Button variant="outline" className="w-full justify-start">
                      <lucide_react_1.BarChart3 className="h-4 w-4 mr-2"/>
                      Análise de Tendências
                    </button_1.Button>
                    <button_1.Button variant="outline" className="w-full justify-start">
                      <lucide_react_1.Activity className="h-4 w-4 mr-2"/>
                      Comparação de Modelos
                    </button_1.Button>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
