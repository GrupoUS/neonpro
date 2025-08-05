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
exports.InventoryConfiguration = InventoryConfiguration;
/**
 * Story 11.3: Inventory Configuration Component
 * System configuration and settings management
 */
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var icons_1 = require("@/components/ui/icons");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var inventory_1 = require("@/lib/inventory");
var use_toast_1 = require("@/hooks/use-toast");
function InventoryConfiguration(_a) {
    var _this = this;
    var onRefresh = _a.onRefresh, className = _a.className;
    var _b = (0, react_1.useState)(null), config = _b[0], setConfig = _b[1];
    var _c = (0, react_1.useState)([]), alertRules = _c[0], setAlertRules = _c[1];
    var _d = (0, react_1.useState)([]), automationRules = _d[0], setAutomationRules = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(false), isSaving = _f[0], setIsSaving = _f[1];
    var _g = (0, react_1.useState)('general'), activeTab = _g[0], setActiveTab = _g[1];
    var _h = (0, react_1.useState)({
        fifo_enabled: true,
        auto_alerts: true,
        cost_tracking: true,
        transfer_approval_required: true,
        min_stock_threshold: 10,
        expiry_warning_days: 30,
        consumption_forecast_days: 30,
        efficiency_target: 85,
        auto_reorder_enabled: false,
        reorder_lead_time: 7
    }), configForm = _h[0], setConfigForm = _h[1];
    var _j = (0, react_1.useState)({
        name: '',
        type: 'stock_low',
        threshold: 10,
        severity: 'media',
        enabled: true,
        description: ''
    }), alertRuleForm = _j[0], setAlertRuleForm = _j[1];
    var _k = (0, react_1.useState)(null), isEditingRule = _k[0], setIsEditingRule = _k[1];
    var toast = (0, use_toast_1.useToast)().toast;
    var inventoryConfig = new inventory_1.InventoryConfig();
    (0, react_1.useEffect)(function () {
        loadConfiguration();
    }, []);
    var loadConfiguration = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, configData, configError, _b, alertRulesData, alertRulesError, _c, automationRulesData, automationRulesError, error_1, errorMessage;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, 5, 6]);
                    setIsLoading(true);
                    return [4 /*yield*/, inventoryConfig.getConfiguration()];
                case 1:
                    _a = _d.sent(), configData = _a.data, configError = _a.error;
                    if (configError) {
                        console.warn('Config error:', configError);
                    }
                    else if (configData) {
                        setConfig(configData);
                        setConfigForm({
                            fifo_enabled: configData.fifo_enabled,
                            auto_alerts: configData.auto_alerts,
                            cost_tracking: configData.cost_tracking,
                            transfer_approval_required: configData.transfer_approval_required,
                            min_stock_threshold: configData.min_stock_threshold,
                            expiry_warning_days: configData.expiry_warning_days,
                            consumption_forecast_days: configData.consumption_forecast_days,
                            efficiency_target: configData.efficiency_target,
                            auto_reorder_enabled: configData.auto_reorder_enabled,
                            reorder_lead_time: configData.reorder_lead_time
                        });
                    }
                    return [4 /*yield*/, inventoryConfig.getAlertRules()];
                case 2:
                    _b = _d.sent(), alertRulesData = _b.data, alertRulesError = _b.error;
                    if (alertRulesError) {
                        console.warn('Alert rules error:', alertRulesError);
                    }
                    else {
                        setAlertRules(alertRulesData || []);
                    }
                    return [4 /*yield*/, inventoryConfig.getAutomationRules()];
                case 3:
                    _c = _d.sent(), automationRulesData = _c.data, automationRulesError = _c.error;
                    if (automationRulesError) {
                        console.warn('Automation rules error:', automationRulesError);
                    }
                    else {
                        setAutomationRules(automationRulesData || []);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _d.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Erro ao carregar configurações';
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveConfiguration = function () { return __awaiter(_this, void 0, void 0, function () {
        var error, error_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsSaving(true);
                    return [4 /*yield*/, inventoryConfig.updateConfiguration(configForm)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        throw new Error(error);
                    }
                    toast({
                        title: 'Sucesso',
                        description: 'Configurações salvas com sucesso',
                    });
                    loadConfiguration();
                    onRefresh();
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : 'Erro ao salvar configurações';
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveAlertRule = function () { return __awaiter(_this, void 0, void 0, function () {
        var error, error, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!alertRuleForm.name || !alertRuleForm.description) {
                        toast({
                            title: 'Erro',
                            description: 'Preencha todos os campos obrigatórios',
                            variant: 'destructive',
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!isEditingRule) return [3 /*break*/, 3];
                    return [4 /*yield*/, inventoryConfig.updateAlertRule(isEditingRule, alertRuleForm)];
                case 2:
                    error = (_a.sent()).error;
                    if (error)
                        throw new Error(error);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, inventoryConfig.createAlertRule(alertRuleForm)];
                case 4:
                    error = (_a.sent()).error;
                    if (error)
                        throw new Error(error);
                    _a.label = 5;
                case 5:
                    toast({
                        title: 'Sucesso',
                        description: isEditingRule ? 'Regra atualizada com sucesso' : 'Regra criada com sucesso',
                    });
                    setAlertRuleForm({
                        name: '',
                        type: 'stock_low',
                        threshold: 10,
                        severity: 'media',
                        enabled: true,
                        description: ''
                    });
                    setIsEditingRule(null);
                    loadConfiguration();
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : 'Erro ao salvar regra';
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteAlertRule = function (ruleId) { return __awaiter(_this, void 0, void 0, function () {
        var error, error_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, inventoryConfig.deleteAlertRule(ruleId)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        throw new Error(error);
                    }
                    toast({
                        title: 'Sucesso',
                        description: 'Regra removida com sucesso',
                    });
                    loadConfiguration();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    errorMessage = error_4 instanceof Error ? error_4.message : 'Erro ao remover regra';
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleEditAlertRule = function (rule) {
        setAlertRuleForm({
            name: rule.name,
            type: rule.type,
            threshold: rule.threshold,
            severity: rule.severity,
            enabled: rule.enabled,
            description: rule.description
        });
        setIsEditingRule(rule.id);
    };
    var getSeverityColor = function (severity) {
        var colors = {
            'baixa': 'bg-blue-100 text-blue-800',
            'media': 'bg-yellow-100 text-yellow-800',
            'alta': 'bg-red-100 text-red-800'
        };
        return colors[severity] || 'bg-gray-100 text-gray-800';
    };
    var getTypeLabel = function (type) {
        var labels = {
            'stock_low': 'Estoque Baixo',
            'expiry_warning': 'Vencimento Próximo',
            'efficiency_low': 'Eficiência Baixa',
            'cost_high': 'Custo Alto',
            'consumption_anomaly': 'Anomalia de Consumo'
        };
        return labels[type] || type;
    };
    if (isLoading) {
        return (<div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Configurações do Inventário</h2>
            <p className="text-muted-foreground">Configurações do sistema</p>
          </div>
        </div>
        
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="h-48 bg-gray-200 rounded animate-pulse"/>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações do Inventário</h2>
          <p className="text-muted-foreground">
            Configurações e regras do sistema de inventário
          </p>
        </div>
        <button_1.Button variant="outline" onClick={loadConfiguration}>
          <icons_1.Icons.RefreshCw className="w-4 h-4 mr-2"/>
          Atualizar
        </button_1.Button>
      </div>

      {/* Configuration Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="general">Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alertas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="automation">Automação</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="integrations">Integrações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* General Configuration */}
        <tabs_1.TabsContent value="general" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Configurações Gerais</card_1.CardTitle>
              <card_1.CardDescription>
                Configurações básicas do sistema de inventário
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              {/* Core Features */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Funcionalidades Principais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <label_1.Label htmlFor="fifo_enabled" className="text-sm">
                      Controle FIFO Ativado
                    </label_1.Label>
                    <switch_1.Switch id="fifo_enabled" checked={configForm.fifo_enabled} onCheckedChange={function (checked) {
            return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { fifo_enabled: checked })); });
        }}/>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <label_1.Label htmlFor="auto_alerts" className="text-sm">
                      Alertas Automáticos
                    </label_1.Label>
                    <switch_1.Switch id="auto_alerts" checked={configForm.auto_alerts} onCheckedChange={function (checked) {
            return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { auto_alerts: checked })); });
        }}/>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <label_1.Label htmlFor="cost_tracking" className="text-sm">
                      Rastreamento de Custos
                    </label_1.Label>
                    <switch_1.Switch id="cost_tracking" checked={configForm.cost_tracking} onCheckedChange={function (checked) {
            return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { cost_tracking: checked })); });
        }}/>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <label_1.Label htmlFor="transfer_approval_required" className="text-sm">
                      Aprovação de Transferências
                    </label_1.Label>
                    <switch_1.Switch id="transfer_approval_required" checked={configForm.transfer_approval_required} onCheckedChange={function (checked) {
            return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { transfer_approval_required: checked })); });
        }}/>
                  </div>
                </div>
              </div>

              <separator_1.Separator />

              {/* Thresholds */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Limites e Parâmetros</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="min_stock_threshold">Limite Mínimo de Estoque (%)</label_1.Label>
                    <input_1.Input id="min_stock_threshold" type="number" min="1" max="100" value={configForm.min_stock_threshold} onChange={function (e) { return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { min_stock_threshold: parseInt(e.target.value) || 10 })); }); }}/>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="expiry_warning_days">Aviso de Vencimento (dias)</label_1.Label>
                    <input_1.Input id="expiry_warning_days" type="number" min="1" max="365" value={configForm.expiry_warning_days} onChange={function (e) { return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { expiry_warning_days: parseInt(e.target.value) || 30 })); }); }}/>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="consumption_forecast_days">Previsão de Consumo (dias)</label_1.Label>
                    <input_1.Input id="consumption_forecast_days" type="number" min="7" max="365" value={configForm.consumption_forecast_days} onChange={function (e) { return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { consumption_forecast_days: parseInt(e.target.value) || 30 })); }); }}/>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="efficiency_target">Meta de Eficiência (%)</label_1.Label>
                    <input_1.Input id="efficiency_target" type="number" min="50" max="100" value={configForm.efficiency_target} onChange={function (e) { return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { efficiency_target: parseInt(e.target.value) || 85 })); }); }}/>
                  </div>
                </div>
              </div>

              <separator_1.Separator />

              {/* Auto Reorder */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Reposição Automática</h4>
                <div className="flex items-center justify-between space-x-2 mb-4">
                  <label_1.Label htmlFor="auto_reorder_enabled" className="text-sm">
                    Reposição Automática Ativada
                  </label_1.Label>
                  <switch_1.Switch id="auto_reorder_enabled" checked={configForm.auto_reorder_enabled} onCheckedChange={function (checked) {
            return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { auto_reorder_enabled: checked })); });
        }}/>
                </div>

                {configForm.auto_reorder_enabled && (<div className="space-y-2">
                    <label_1.Label htmlFor="reorder_lead_time">Lead Time para Reposição (dias)</label_1.Label>
                    <input_1.Input id="reorder_lead_time" type="number" min="1" max="30" value={configForm.reorder_lead_time} onChange={function (e) { return setConfigForm(function (prev) { return (__assign(__assign({}, prev), { reorder_lead_time: parseInt(e.target.value) || 7 })); }); }}/>
                  </div>)}
              </div>

              <div className="flex justify-end">
                <button_1.Button onClick={handleSaveConfiguration} disabled={isSaving}>
                  {isSaving ? (<>
                      <icons_1.Icons.Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                      Salvando...
                    </>) : (<>
                      <icons_1.Icons.Save className="w-4 h-4 mr-2"/>
                      Salvar Configurações
                    </>)}
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Alert Rules */}
        <tabs_1.TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Rules Form */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>
                  {isEditingRule ? 'Editar Regra de Alerta' : 'Nova Regra de Alerta'}
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Configure regras personalizadas para alertas automáticos
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="rule_name">Nome da Regra *</label_1.Label>
                  <input_1.Input id="rule_name" value={alertRuleForm.name} onChange={function (e) { return setAlertRuleForm(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }} placeholder="Ex: Estoque Crítico Medicamentos"/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="rule_type">Tipo de Alerta</label_1.Label>
                  <select_1.Select value={alertRuleForm.type} onValueChange={function (value) { return setAlertRuleForm(function (prev) { return (__assign(__assign({}, prev), { type: value })); }); }}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="stock_low">Estoque Baixo</select_1.SelectItem>
                      <select_1.SelectItem value="expiry_warning">Vencimento Próximo</select_1.SelectItem>
                      <select_1.SelectItem value="efficiency_low">Eficiência Baixa</select_1.SelectItem>
                      <select_1.SelectItem value="cost_high">Custo Alto</select_1.SelectItem>
                      <select_1.SelectItem value="consumption_anomaly">Anomalia de Consumo</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="rule_threshold">Limite/Threshold</label_1.Label>
                  <input_1.Input id="rule_threshold" type="number" value={alertRuleForm.threshold} onChange={function (e) { return setAlertRuleForm(function (prev) { return (__assign(__assign({}, prev), { threshold: parseInt(e.target.value) || 0 })); }); }}/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="rule_severity">Severidade</label_1.Label>
                  <select_1.Select value={alertRuleForm.severity} onValueChange={function (value) { return setAlertRuleForm(function (prev) { return (__assign(__assign({}, prev), { severity: value })); }); }}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="baixa">Baixa</select_1.SelectItem>
                      <select_1.SelectItem value="media">Média</select_1.SelectItem>
                      <select_1.SelectItem value="alta">Alta</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="rule_description">Descrição *</label_1.Label>
                  <textarea_1.Textarea id="rule_description" value={alertRuleForm.description} onChange={function (e) { return setAlertRuleForm(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }} placeholder="Descreva quando e como este alerta deve ser acionado..." rows={3}/>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <label_1.Label htmlFor="rule_enabled" className="text-sm">
                    Regra Ativa
                  </label_1.Label>
                  <switch_1.Switch id="rule_enabled" checked={alertRuleForm.enabled} onCheckedChange={function (checked) {
            return setAlertRuleForm(function (prev) { return (__assign(__assign({}, prev), { enabled: checked })); });
        }}/>
                </div>

                <div className="flex gap-2">
                  <button_1.Button onClick={handleSaveAlertRule} className="flex-1">
                    {isEditingRule ? 'Atualizar Regra' : 'Criar Regra'}
                  </button_1.Button>
                  {isEditingRule && (<button_1.Button variant="outline" onClick={function () {
                setIsEditingRule(null);
                setAlertRuleForm({
                    name: '',
                    type: 'stock_low',
                    threshold: 10,
                    severity: 'media',
                    enabled: true,
                    description: ''
                });
            }}>
                      Cancelar
                    </button_1.Button>)}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Existing Rules */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Regras Ativas</card_1.CardTitle>
                <card_1.CardDescription>
                  {alertRules.length} regra(s) configurada(s)
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                {alertRules.length === 0 ? (<div className="text-center py-8">
                    <icons_1.Icons.Bell className="h-12 w-12 mx-auto text-gray-400 mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma regra configurada
                    </h3>
                    <p className="text-gray-500">
                      Crie regras personalizadas para alertas automáticos.
                    </p>
                  </div>) : (<table_1.Table>
                    <table_1.TableHeader>
                      <table_1.TableRow>
                        <table_1.TableHead>Nome</table_1.TableHead>
                        <table_1.TableHead>Tipo</table_1.TableHead>
                        <table_1.TableHead>Limite</table_1.TableHead>
                        <table_1.TableHead>Status</table_1.TableHead>
                        <table_1.TableHead>Ações</table_1.TableHead>
                      </table_1.TableRow>
                    </table_1.TableHeader>
                    <table_1.TableBody>
                      {alertRules.map(function (rule) { return (<table_1.TableRow key={rule.id}>
                          <table_1.TableCell className="font-medium">{rule.name}</table_1.TableCell>
                          <table_1.TableCell>{getTypeLabel(rule.type)}</table_1.TableCell>
                          <table_1.TableCell>{rule.threshold}</table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex gap-2">
                              <badge_1.Badge className={getSeverityColor(rule.severity)}>
                                {rule.severity}
                              </badge_1.Badge>
                              {rule.enabled ? (<badge_1.Badge variant="default">Ativa</badge_1.Badge>) : (<badge_1.Badge variant="secondary">Inativa</badge_1.Badge>)}
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex gap-2">
                              <button_1.Button size="sm" variant="outline" onClick={function () { return handleEditAlertRule(rule); }}>
                                <icons_1.Icons.Edit className="w-4 h-4"/>
                              </button_1.Button>
                              <button_1.Button size="sm" variant="outline" onClick={function () { return handleDeleteAlertRule(rule.id); }} className="text-red-600 hover:text-red-700">
                                <icons_1.Icons.Trash2 className="w-4 h-4"/>
                              </button_1.Button>
                            </div>
                          </table_1.TableCell>
                        </table_1.TableRow>); })}
                    </table_1.TableBody>
                  </table_1.Table>)}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Automation Rules */}
        <tabs_1.TabsContent value="automation" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Regras de Automação</card_1.CardTitle>
              <card_1.CardDescription>
                Configure automações para otimizar processos do inventário
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8">
                <icons_1.Icons.Zap className="h-12 w-12 mx-auto text-gray-400 mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em Desenvolvimento
                </h3>
                <p className="text-gray-500">
                  Funcionalidades de automação serão implementadas em breve.
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Integrations */}
        <tabs_1.TabsContent value="integrations" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Integrações Externas</card_1.CardTitle>
              <card_1.CardDescription>
                Configure integrações com sistemas externos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8">
                <icons_1.Icons.Globe className="h-12 w-12 mx-auto text-gray-400 mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em Desenvolvimento
                </h3>
                <p className="text-gray-500">
                  Integrações com fornecedores e sistemas ERP serão implementadas em breve.
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
