'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LGPDDashboard = LGPDDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
function LGPDDashboard(_a) {
    var className = _a.className;
    var _b = (0, useLGPD_1.useLGPDDashboard)(), metrics = _b.metrics, isLoading = _b.isLoading, error = _b.error, refreshMetrics = _b.refreshMetrics, exportReport = _b.exportReport;
    if (isLoading) {
        return (<div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Carregando métricas...</span>
      </div>);
    }
    if (error) {
        return (<alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4"/>
        <alert_1.AlertDescription>
          Erro ao carregar métricas: {error}
        </alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    if (!metrics) {
        return (<alert_1.Alert>
        <lucide_react_1.AlertTriangle className="h-4 w-4"/>
        <alert_1.AlertDescription>
          Nenhuma métrica disponível
        </alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    var getComplianceColor = function (score) {
        if (score >= 90)
            return 'text-green-600';
        if (score >= 70)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    var getComplianceVariant = function (score) {
        if (score >= 90)
            return 'default';
        if (score >= 70)
            return 'secondary';
        return 'destructive';
    };
    return (<div className={className}>
      {/* Header com ações */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard LGPD</h2>
          <p className="text-muted-foreground">
            Visão geral da conformidade com a Lei Geral de Proteção de Dados
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={refreshMetrics}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>
          <button_1.Button onClick={exportReport}>
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar Relatório
          </button_1.Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Conformidade Geral
            </card_1.CardTitle>
            <lucide_react_1.Shield className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold mb-2">
              {metrics.overallCompliance}%
            </div>
            <progress_1.Progress value={metrics.overallCompliance} className="mb-2"/>
            <badge_1.Badge variant={getComplianceVariant(metrics.overallCompliance)}>
              {metrics.overallCompliance >= 90 ? 'Excelente' :
            metrics.overallCompliance >= 70 ? 'Bom' : 'Crítico'}
            </badge_1.Badge>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Consentimentos Ativos
            </card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeConsents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalUsers > 0 && ("".concat(((metrics.activeConsents / metrics.totalUsers) * 100).toFixed(1), "% dos usu\u00E1rios"))}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Solicitações Pendentes
            </card_1.CardTitle>
            <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {metrics.pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingRequests > 5 ? (<span className="text-red-600">Atenção necessária</span>) : ('Dentro do prazo')}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Incidentes Ativos
            </card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeIncidents}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeIncidents === 0 ? (<span className="text-green-600">Nenhum incidente</span>) : (<span className="text-red-600">Requer atenção</span>)}
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Alertas e notificações */}
      {(metrics.pendingRequests > 5 || metrics.activeIncidents > 0) && (<alert_1.Alert className="mb-6">
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertDescription>
            <strong>Atenção:</strong> 
            {metrics.pendingRequests > 5 && (<span> Há {metrics.pendingRequests} solicitações pendentes que precisam de atenção.</span>)}
            {metrics.activeIncidents > 0 && (<span> Há {metrics.activeIncidents} incidente(s) ativo(s) que requer(em) resolução.</span>)}
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* Detalhes por categoria */}
      <tabs_1.Tabs defaultValue="consents" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="consents">Consentimentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="requests">Solicitações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="incidents">Incidentes</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="assessments">Avaliações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="consents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Status dos Consentimentos</card_1.CardTitle>
                <card_1.CardDescription>
                  Distribuição dos consentimentos por status
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Ativos</span>
                  <badge_1.Badge variant="default">{metrics.activeConsents}</badge_1.Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Expirados</span>
                  <badge_1.Badge variant="secondary">{metrics.expiredConsents || 0}</badge_1.Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Retirados</span>
                  <badge_1.Badge variant="outline">{metrics.withdrawnConsents || 0}</badge_1.Badge>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Tendências</card_1.CardTitle>
                <card_1.CardDescription>
                  Evolução dos consentimentos
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Esta semana</span>
                    <div className="flex items-center">
                      <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600 mr-1"/>
                      <span className="text-sm text-green-600">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Este mês</span>
                    <div className="flex items-center">
                      <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600 mr-1"/>
                      <span className="text-sm text-green-600">+8%</span>
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Por Tipo</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Acesso</span>
                  <badge_1.Badge variant="outline">15</badge_1.Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Exclusão</span>
                  <badge_1.Badge variant="outline">8</badge_1.Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Retificação</span>
                  <badge_1.Badge variant="outline">5</badge_1.Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Portabilidade</span>
                  <badge_1.Badge variant="outline">3</badge_1.Badge>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Tempo de Resposta</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Média</span>
                    <div className="flex items-center">
                      <lucide_react_1.Clock className="h-4 w-4 mr-1"/>
                      <span className="text-sm">2.3 dias</span>
                    </div>
                  </div>
                  <progress_1.Progress value={77} className="mb-2"/>
                  <p className="text-xs text-muted-foreground">
                    Meta: 3 dias (LGPD)
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Status</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pendentes</span>
                  <badge_1.Badge variant="secondary">{metrics.pendingRequests}</badge_1.Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Em Processamento</span>
                  <badge_1.Badge variant="default">12</badge_1.Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Concluídas</span>
                  <badge_1.Badge variant="outline">156</badge_1.Badge>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="incidents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Incidentes por Severidade</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Crítica</span>
                  <badge_1.Badge variant="destructive">0</badge_1.Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Alta</span>
                  <badge_1.Badge variant="secondary">1</badge_1.Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Média</span>
                  <badge_1.Badge variant="outline">2</badge_1.Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Baixa</span>
                  <badge_1.Badge variant="outline">0</badge_1.Badge>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Tempo de Resolução</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Média</span>
                    <div className="flex items-center">
                      <lucide_react_1.Clock className="h-4 w-4 mr-1"/>
                      <span className="text-sm">4.2 horas</span>
                    </div>
                  </div>
                  <progress_1.Progress value={85} className="mb-2"/>
                  <p className="text-xs text-muted-foreground">
                    Meta: 6 horas
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Última Avaliação</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pontuação</span>
                    <badge_1.Badge variant={getComplianceVariant(metrics.overallCompliance)}>
                      {metrics.overallCompliance}%
                    </badge_1.Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <div className="flex items-center">
                      <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mr-1"/>
                      <span className="text-sm text-green-600">Aprovada</span>
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Próxima Avaliação</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Agendada para</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tipo</span>
                    <badge_1.Badge variant="outline">Automatizada</badge_1.Badge>
                  </div>
                  <button_1.Button size="sm" className="w-full mt-2">
                    Executar Agora
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
