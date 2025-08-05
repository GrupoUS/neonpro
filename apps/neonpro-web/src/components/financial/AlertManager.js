/**
 * Alert Manager Component for NeonPro
 * Interface completa para gerenciamento de alertas financeiros
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertManager = AlertManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var use_alert_system_1 = require("@/lib/financial/hooks/use-alert-system");
function AlertManager(_a) {
    var userId = _a.userId;
    var _b = (0, react_1.useState)('active'), selectedTab = _b[0], setSelectedTab = _b[1];
    var _c = (0, react_1.useState)(), filterSeverity = _c[0], setFilterSeverity = _c[1];
    var _d = (0, react_1.useState)(), filterType = _d[0], setFilterType = _d[1];
    var _e = (0, use_alert_system_1.useFinancialAlerts)(filterSeverity, filterType), alerts = _e.alerts, isLoading = _e.isLoading, refetch = _e.refetch;
    var _f = (0, use_alert_system_1.useAlertResolution)(), resolveAlert = _f.resolveAlert, isResolving = _f.isResolving;
    var statistics = (0, use_alert_system_1.useAlertStatistics)(30).statistics;
    var _g = (0, use_alert_system_1.useRealTimeAlerts)(), realTimeAlerts = _g.alerts, unreadCount = _g.unreadCount, markAsRead = _g.markAsRead;
    var activeAlerts = alerts.filter(function (alert) { return !alert.is_resolved; });
    var resolvedAlerts = alerts.filter(function (alert) { return alert.is_resolved; });
    var getSeverityColor = function (severity) {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    var getSeverityIcon = function (severity) {
        switch (severity) {
            case 'critical': return <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600"/>;
            case 'warning': return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600"/>;
            case 'info': return <lucide_react_1.Bell className="h-4 w-4 text-blue-600"/>;
            default: return <lucide_react_1.Bell className="h-4 w-4 text-gray-600"/>;
        }
    };
    var handleResolveAlert = function (alertId, resolution) {
        resolveAlert({ alertId: alertId, resolution: resolution, userId: userId });
        markAsRead(alertId);
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando alertas...</p>
        </div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-600"/>
              <div>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>
              <div>
                <p className="text-2xl font-bold">{resolvedAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Clock className="h-5 w-5 text-blue-600"/>
              <div>
                <p className="text-2xl font-bold">
                  {(statistics === null || statistics === void 0 ? void 0 : statistics.average_resolution_time) ?
            "".concat(Math.round(statistics.average_resolution_time / 60), "h") :
            '0h'}
                </p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Bell className="h-5 w-5 text-orange-600"/>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Não Lidos</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filtros e Ações */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle>Gerenciamento de Alertas</card_1.CardTitle>
              <card_1.CardDescription>
                Monitore e gerencie alertas financeiros em tempo real
              </card_1.CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <CreateAlertRuleDialog userId={userId}/>
              <AlertSettingsDialog />
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {/* Filtros */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Filter className="h-4 w-4"/>
              <label_1.Label>Filtros:</label_1.Label>
            </div>
            <select_1.Select value={filterSeverity} onValueChange={function (value) { return setFilterSeverity(value); }}>
              <select_1.SelectTrigger className="w-[120px]">
                <select_1.SelectValue placeholder="Severidade"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="critical">Crítico</select_1.SelectItem>
                <select_1.SelectItem value="warning">Aviso</select_1.SelectItem>
                <select_1.SelectItem value="info">Info</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            <select_1.Select value={filterType} onValueChange={function (value) { return setFilterType(value); }}>
              <select_1.SelectTrigger className="w-[150px]">
                <select_1.SelectValue placeholder="Tipo"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="low_balance">Saldo Baixo</select_1.SelectItem>
                <select_1.SelectItem value="negative_cash_flow">Cash Flow Negativo</select_1.SelectItem>
                <select_1.SelectItem value="high_expenses">Despesas Altas</select_1.SelectItem>
                <select_1.SelectItem value="budget_exceeded">Orçamento Excedido</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            <button_1.Button variant="outline" size="sm" onClick={function () {
            setFilterSeverity(undefined);
            setFilterType(undefined);
        }}>
              Limpar Filtros
            </button_1.Button>
          </div>

          {/* Tabs de Alertas */}
          <tabs_1.Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <tabs_1.TabsList>
              <tabs_1.TabsTrigger value="active">
                Ativos ({activeAlerts.length})
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="resolved">
                Resolvidos ({resolvedAlerts.length})
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="active" className="space-y-4">
              {activeAlerts.length === 0 ? (<div className="text-center py-8">
                  <lucide_react_1.CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4"/>
                  <p className="text-lg font-medium">Nenhum alerta ativo</p>
                  <p className="text-muted-foreground">
                    Todos os indicadores financeiros estão dentro dos parâmetros normais
                  </p>
                </div>) : (<div className="grid gap-4">
                  {activeAlerts.map(function (alert) { return (<AlertCard key={alert.id} alert={alert} onResolve={handleResolveAlert} isResolving={isResolving}/>); })}
                </div>)}
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="resolved" className="space-y-4">
              {resolvedAlerts.length === 0 ? (<div className="text-center py-8">
                  <lucide_react_1.Clock className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                  <p className="text-lg font-medium">Nenhum alerta resolvido</p>
                  <p className="text-muted-foreground">
                    Histórico de alertas resolvidos aparecerá aqui
                  </p>
                </div>) : (<div className="grid gap-4">
                  {resolvedAlerts.map(function (alert) { return (<AlertCard key={alert.id} alert={alert} isResolved/>); })}
                </div>)}
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
function AlertCard(_a) {
    var alert = _a.alert, onResolve = _a.onResolve, isResolving = _a.isResolving, isResolved = _a.isResolved;
    var _b = (0, react_1.useState)(''), resolution = _b[0], setResolution = _b[1];
    var _c = (0, react_1.useState)(false), showResolveDialog = _c[0], setShowResolveDialog = _c[1];
    var getSeverityColor = function (severity) {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    return (<card_1.Card className={"".concat(isResolved ? 'opacity-60' : '')}>
      <card_1.CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <badge_1.Badge className={getSeverityColor(alert.severity)}>
                {alert.severity.toUpperCase()}
              </badge_1.Badge>
              <badge_1.Badge variant="outline">
                {alert.type.replace('_', ' ').toUpperCase()}
              </badge_1.Badge>
              {isResolved && (<badge_1.Badge className="bg-green-100 text-green-800 border-green-300">
                  RESOLVIDO
                </badge_1.Badge>)}
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{alert.title}</h3>
            <p className="text-muted-foreground mb-4">{alert.message}</p>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Criado: {new Date(alert.created_at).toLocaleString('pt-BR')}</span>
              {alert.resolved_at && (<span>Resolvido: {new Date(alert.resolved_at).toLocaleString('pt-BR')}</span>)}
            </div>

            {alert.resolution && (<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Resolução:</strong> {alert.resolution}
                </p>
              </div>)}
          </div>

          {!isResolved && onResolve && (<dialog_1.Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button size="sm">
                  Resolver
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Resolver Alerta</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Descreva como este alerta foi resolvido para referência futura.
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label_1.Label htmlFor="resolution">Descrição da Resolução</label_1.Label>
                    <input_1.Input id="resolution" value={resolution} onChange={function (e) { return setResolution(e.target.value); }} placeholder="Ex: Transferência realizada para normalizar saldo"/>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button_1.Button variant="outline" onClick={function () { return setShowResolveDialog(false); }}>
                      Cancelar
                    </button_1.Button>
                    <button_1.Button onClick={function () {
                onResolve(alert.id, resolution);
                setShowResolveDialog(false);
                setResolution('');
            }} disabled={!resolution.trim() || isResolving}>
                      {isResolving ? 'Resolvendo...' : 'Confirmar'}
                    </button_1.Button>
                  </div>
                </div>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
// Dialog para criar nova regra de alerta
function CreateAlertRuleDialog(_a) {
    var userId = _a.userId;
    var _b = (0, react_1.useState)(false), open = _b[0], setOpen = _b[1];
    var _c = (0, use_alert_system_1.useAlertRuleCreation)(), createRule = _c.createRule, isCreating = _c.isCreating;
    var _d = (0, use_alert_system_1.useAlertRuleTemplates)(), templates = _d.templates, createFromTemplate = _d.createFromTemplate;
    var _e = (0, react_1.useState)(''), selectedTemplate = _e[0], setSelectedTemplate = _e[1];
    var _f = (0, react_1.useState)(''), ruleName = _f[0], setRuleName = _f[1];
    var _g = (0, react_1.useState)(''), threshold = _g[0], setThreshold = _g[1];
    var handleCreateRule = function () {
        var _a;
        if (!selectedTemplate || !ruleName || !threshold)
            return;
        var template = createFromTemplate(selectedTemplate, {
            name: ruleName,
            condition: __assign(__assign({}, (_a = templates.find(function (t) { return t.id === selectedTemplate; })) === null || _a === void 0 ? void 0 : _a.template.condition), { threshold: parseFloat(threshold) })
        });
        if (template) {
            createRule(template);
            setOpen(false);
            setSelectedTemplate('');
            setRuleName('');
            setThreshold('');
        }
    };
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>
        <button_1.Button>
          <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
          Nova Regra
        </button_1.Button>
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent>
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Criar Nova Regra de Alerta</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Configure uma nova regra para monitoramento automático
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        <div className="space-y-4">
          <div>
            <label_1.Label htmlFor="template">Template</label_1.Label>
            <select_1.Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Selecione um template"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {templates.map(function (template) { return (<select_1.SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </select_1.SelectItem>); })}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
          
          <div>
            <label_1.Label htmlFor="ruleName">Nome da Regra</label_1.Label>
            <input_1.Input id="ruleName" value={ruleName} onChange={function (e) { return setRuleName(e.target.value); }} placeholder="Ex: Monitoramento Saldo Conta Principal"/>
          </div>

          <div>
            <label_1.Label htmlFor="threshold">Valor Limite</label_1.Label>
            <input_1.Input id="threshold" type="number" value={threshold} onChange={function (e) { return setThreshold(e.target.value); }} placeholder="Ex: 5000"/>
          </div>

          <div className="flex justify-end space-x-2">
            <button_1.Button variant="outline" onClick={function () { return setOpen(false); }}>
              Cancelar
            </button_1.Button>
            <button_1.Button onClick={handleCreateRule} disabled={!selectedTemplate || !ruleName || !threshold || isCreating}>
              {isCreating ? 'Criando...' : 'Criar Regra'}
            </button_1.Button>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
// Dialog para configurações de alertas
function AlertSettingsDialog() {
    var _a = (0, react_1.useState)(false), open = _a[0], setOpen = _a[1];
    var _b = (0, use_alert_system_1.useAlertChannelConfig)(), config = _b.config, updateChannelConfig = _b.updateChannelConfig;
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>
        <button_1.Button variant="outline">
          <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
          Configurações
        </button_1.Button>
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="max-w-2xl">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Configurações de Alerta</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Configure como e quando receber notificações
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        
        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label_1.Label htmlFor="email-enabled">Notificações por Email</label_1.Label>
              <switch_1.Switch id="email-enabled" checked={config.email.enabled} onCheckedChange={function (enabled) {
            return updateChannelConfig('email', { enabled: enabled });
        }}/>
            </div>
            {config.email.enabled && (<div className="ml-4 space-y-2">
                <select_1.Select value={config.email.severityThreshold} onValueChange={function (value) {
                return updateChannelConfig('email', { severityThreshold: value });
            }}>
                  <select_1.SelectTrigger className="w-[200px]">
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="info">Todos os alertas</select_1.SelectItem>
                    <select_1.SelectItem value="warning">Avisos e críticos</select_1.SelectItem>
                    <select_1.SelectItem value="critical">Apenas críticos</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>)}
          </div>

          {/* Dashboard */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label_1.Label htmlFor="dashboard-enabled">Notificações no Dashboard</label_1.Label>
              <switch_1.Switch id="dashboard-enabled" checked={config.dashboard.enabled} onCheckedChange={function (enabled) {
            return updateChannelConfig('dashboard', { enabled: enabled });
        }}/>
            </div>
            {config.dashboard.enabled && (<div className="ml-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label_1.Label htmlFor="auto-refresh">Atualização Automática</label_1.Label>
                  <switch_1.Switch id="auto-refresh" checked={config.dashboard.autoRefresh} onCheckedChange={function (autoRefresh) {
                return updateChannelConfig('dashboard', { autoRefresh: autoRefresh });
            }}/>
                </div>
                <div className="flex items-center justify-between">
                  <label_1.Label htmlFor="sound-alerts">Alertas Sonoros</label_1.Label>
                  <switch_1.Switch id="sound-alerts" checked={config.dashboard.soundAlerts} onCheckedChange={function (soundAlerts) {
                return updateChannelConfig('dashboard', { soundAlerts: soundAlerts });
            }}/>
                </div>
              </div>)}
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
