// Intelligent Threshold Management Component
// Story 6.2: Automated Reorder Alerts + Threshold Management
"use client";
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
exports.IntelligentThresholdManager = IntelligentThresholdManager;
var useIntelligentThresholds_1 = require("@/app/hooks/useIntelligentThresholds");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function IntelligentThresholdManager(_a) {
    var _this = this;
    var clinicId = _a.clinicId, className = _a.className;
    var _b = (0, useIntelligentThresholds_1.useIntelligentThresholds)({
        clinicId: clinicId,
        autoRefresh: true,
        refreshInterval: 30000,
    }), thresholds = _b.thresholds, optimizations = _b.optimizations, alertStats = _b.alertStats, loading = _b.loading, error = _b.error, refresh = _b.refresh, createThreshold = _b.createThreshold, updateThreshold = _b.updateThreshold, deleteThreshold = _b.deleteThreshold, generateForecast = _b.generateForecast, totalThresholds = _b.totalThresholds, activeThresholds = _b.activeThresholds, autoReorderEnabled = _b.autoReorderEnabled, optimizationOpportunities = _b.optimizationOpportunities, totalPotentialSavings = _b.totalPotentialSavings;
    var _c = (0, react_1.useState)(null), selectedThreshold = _c[0], setSelectedThreshold = _c[1];
    var _d = (0, react_1.useState)(false), showCreateDialog = _d[0], setShowCreateDialog = _d[1];
    var _e = (0, react_1.useState)(false), showOptimizationDialog = _e[0], setShowOptimizationDialog = _e[1];
    var _f = (0, react_1.useState)({
        item_id: "",
        reorder_point: 0,
        safety_stock: 0,
        lead_time_days: 7,
        demand_forecast_weekly: 0,
        auto_reorder_enabled: false,
        supplier_id: "",
        notes: "",
    }), newThreshold = _f[0], setNewThreshold = _f[1];
    if (loading && !thresholds.length) {
        return (<div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <lucide_react_1.Brain className="h-8 w-8 animate-pulse mx-auto text-blue-500"/>
          <p className="text-sm text-muted-foreground">
            Carregando sistema inteligente...
          </p>
        </div>
      </div>);
    }
    if (error) {
        return (<card_1.Card className="border-red-200">
        <card_1.CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <lucide_react_1.AlertTriangle className="h-5 w-5"/>
            <span>Erro ao carregar sistema de limites: {error}</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    var handleCreateThreshold = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, createThreshold(__assign(__assign({}, newThreshold), { clinic_id: clinicId, is_active: true }))];
                case 1:
                    _a.sent();
                    setShowCreateDialog(false);
                    setNewThreshold({
                        item_id: "",
                        reorder_point: 0,
                        safety_stock: 0,
                        lead_time_days: 7,
                        demand_forecast_weekly: 0,
                        auto_reorder_enabled: false,
                        supplier_id: "",
                        notes: "",
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Failed to create threshold:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateThreshold = function (id, updates) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateThreshold(id, updates)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Failed to update threshold:", error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleOptimizeThreshold = function (optimization) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateThreshold(optimization.item_id, {
                            reorder_point: optimization.recommended_reorder_point,
                            safety_stock: optimization.recommended_safety_stock,
                        })];
                case 1:
                    _a.sent();
                    setShowOptimizationDialog(false);
                    refresh();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("Failed to optimize threshold:", error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <lucide_react_1.Brain className="h-6 w-6 text-blue-500"/>
            Sistema Inteligente de Limites
          </h2>
          <p className="text-muted-foreground">
            Gerenciamento automatizado com IA preditiva e otimização contínua
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button onClick={refresh} variant="outline" size="sm">
            <lucide_react_1.BarChart3 className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>
          <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button size="sm">
                <lucide_react_1.Target className="h-4 w-4 mr-2"/>
                Novo Limite
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Criar Limite Inteligente</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Configure um novo limite com cálculos automáticos de IA
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              <CreateThresholdForm threshold={newThreshold} onChange={setNewThreshold} onSubmit={handleCreateThreshold}/>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Limites
                </p>
                <p className="text-2xl font-bold">{totalThresholds}</p>
              </div>
              <lucide_react_1.Target className="h-8 w-8 text-blue-500"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ativos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeThresholds}
                </p>
              </div>
              <lucide_react_1.CheckCircle className="h-8 w-8 text-green-500"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Auto-Reorder
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {autoReorderEnabled}
                </p>
              </div>
              <lucide_react_1.Zap className="h-8 w-8 text-blue-500"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Otimizações
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {optimizationOpportunities}
                </p>
              </div>
              <lucide_react_1.Lightbulb className="h-8 w-8 text-amber-500"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Optimization Opportunities */}
      {optimizations.length > 0 && (<card_1.Card className="border-amber-200 bg-amber-50">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2 text-amber-800">
              <lucide_react_1.Lightbulb className="h-5 w-5"/>
              Oportunidades de Otimização
              <badge_1.Badge variant="secondary" className="ml-auto">
                Economia: R$ {totalPotentialSavings.toFixed(2)}
              </badge_1.Badge>
            </card_1.CardTitle>
            <card_1.CardDescription>
              A IA identificou oportunidades para otimizar seus limites
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {optimizations.slice(0, 3).map(function (optimization) { return (<div key={optimization.item_id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{optimization.item_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {optimization.optimization_reason}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span>Atual: {optimization.current_reorder_point}</span>
                      <lucide_react_1.ArrowUp className="h-3 w-3"/>
                      <span>
                        Sugerido: {optimization.recommended_reorder_point}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <badge_1.Badge variant={optimization.implementation_priority === "high"
                    ? "destructive"
                    : "secondary"} className="mb-2">
                      {optimization.implementation_priority === "high"
                    ? "Alta"
                    : "Média"}{" "}
                      Prioridade
                    </badge_1.Badge>
                    <p className="text-sm font-medium text-green-600">
                      +R$ {optimization.potential_savings.toFixed(2)}
                    </p>
                    <button_1.Button size="sm" onClick={function () { return handleOptimizeThreshold(optimization); }} className="mt-2">
                      Aplicar
                    </button_1.Button>
                  </div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Threshold Management Tabs */}
      <tabs_1.Tabs defaultValue="thresholds" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="thresholds">Limites Ativos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Análise Preditiva</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alertas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="settings">Configurações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="thresholds" className="space-y-4">
          <ThresholdsList thresholds={thresholds} onUpdate={handleUpdateThreshold} onDelete={deleteThreshold}/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <PredictiveAnalytics clinicId={clinicId} generateForecast={generateForecast}/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <AlertsOverview alertStats={alertStats} clinicId={clinicId}/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="settings" className="space-y-4">
          <SystemSettings clinicId={clinicId}/>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
// Subcomponents
function CreateThresholdForm(_a) {
    var threshold = _a.threshold, onChange = _a.onChange, onSubmit = _a.onSubmit;
    return (<div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label_1.Label htmlFor="item_id">Item</label_1.Label>
          <input_1.Input id="item_id" value={threshold.item_id} onChange={function (e) {
            return onChange(__assign(__assign({}, threshold), { item_id: e.target.value }));
        }} placeholder="ID do item"/>
        </div>
        <div>
          <label_1.Label htmlFor="reorder_point">Ponto de Reposição</label_1.Label>
          <input_1.Input id="reorder_point" type="number" value={threshold.reorder_point} onChange={function (e) {
            return onChange(__assign(__assign({}, threshold), { reorder_point: parseInt(e.target.value) }));
        }}/>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label_1.Label htmlFor="safety_stock">Estoque de Segurança</label_1.Label>
          <input_1.Input id="safety_stock" type="number" value={threshold.safety_stock} onChange={function (e) {
            return onChange(__assign(__assign({}, threshold), { safety_stock: parseInt(e.target.value) }));
        }}/>
        </div>
        <div>
          <label_1.Label htmlFor="lead_time_days">Lead Time (dias)</label_1.Label>
          <input_1.Input id="lead_time_days" type="number" value={threshold.lead_time_days} onChange={function (e) {
            return onChange(__assign(__assign({}, threshold), { lead_time_days: parseInt(e.target.value) }));
        }}/>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <switch_1.Switch id="auto_reorder" checked={threshold.auto_reorder_enabled} onCheckedChange={function (checked) {
            return onChange(__assign(__assign({}, threshold), { auto_reorder_enabled: checked }));
        }}/>
        <label_1.Label htmlFor="auto_reorder">Ativar Reposição Automática</label_1.Label>
      </div>

      <div>
        <label_1.Label htmlFor="notes">Observações</label_1.Label>
        <textarea_1.Textarea id="notes" value={threshold.notes} onChange={function (e) { return onChange(__assign(__assign({}, threshold), { notes: e.target.value })); }} placeholder="Observações sobre este limite..."/>
      </div>

      <div className="flex justify-end space-x-2">
        <button_1.Button variant="outline" onClick={function () { }}>
          Cancelar
        </button_1.Button>
        <button_1.Button onClick={onSubmit}>
          <lucide_react_1.Brain className="h-4 w-4 mr-2"/>
          Criar com IA
        </button_1.Button>
      </div>
    </div>);
}
function ThresholdsList(_a) {
    var thresholds = _a.thresholds, onUpdate = _a.onUpdate, onDelete = _a.onDelete;
    return (<div className="space-y-4">
      {thresholds.map(function (threshold) { return (<card_1.Card key={threshold.id}>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{threshold.item_id}</h4>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reposição:</span>
                    <p className="font-medium">{threshold.reorder_point}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Segurança:</span>
                    <p className="font-medium">{threshold.safety_stock}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lead Time:</span>
                    <p className="font-medium">
                      {threshold.lead_time_days || 7} dias
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {threshold.auto_reorder_enabled && (<badge_1.Badge variant="outline">
                    <lucide_react_1.Zap className="h-3 w-3 mr-1"/>
                    Auto
                  </badge_1.Badge>)}
                <button_1.Button variant="outline" size="sm">
                  <lucide_react_1.Settings className="h-4 w-4"/>
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>); })}
    </div>);
}
function PredictiveAnalytics(_a) {
    var clinicId = _a.clinicId, generateForecast = _a.generateForecast;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.TrendingUp className="h-5 w-5"/>
          Análise Preditiva
        </card_1.CardTitle>
        <card_1.CardDescription>
          Previsões de demanda baseadas em IA e dados históricos
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <p className="text-center py-8 text-muted-foreground">
          Funcionalidade de análise preditiva em desenvolvimento...
        </p>
      </card_1.CardContent>
    </card_1.Card>);
}
function AlertsOverview(_a) {
    var alertStats = _a.alertStats, clinicId = _a.clinicId;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.AlertCircle className="h-5 w-5"/>
          Visão Geral de Alertas
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        {alertStats ? (<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{alertStats.total_alerts}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {alertStats.pending_alerts}
              </p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {alertStats.critical_alerts}
              </p>
              <p className="text-sm text-muted-foreground">Críticos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {alertStats.resolved_today}
              </p>
              <p className="text-sm text-muted-foreground">Resolvidos Hoje</p>
            </div>
          </div>) : (<p className="text-center py-8 text-muted-foreground">
            Carregando estatísticas de alertas...
          </p>)}
      </card_1.CardContent>
    </card_1.Card>);
}
function SystemSettings(_a) {
    var clinicId = _a.clinicId;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Settings className="h-5 w-5"/>
          Configurações do Sistema
        </card_1.CardTitle>
        <card_1.CardDescription>
          Configure comportamentos automáticos e preferências de IA
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <p className="text-center py-8 text-muted-foreground">
          Configurações avançadas em desenvolvimento...
        </p>
      </card_1.CardContent>
    </card_1.Card>);
}
