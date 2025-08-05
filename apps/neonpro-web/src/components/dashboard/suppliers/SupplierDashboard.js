// =====================================================================================
// SUPPLIER MANAGEMENT DASHBOARD
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierDashboard = SupplierDashboard;
var useSupplierManagement_1 = require("@/app/hooks/useSupplierManagement");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function SupplierDashboard(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var clinicId = _a.clinicId;
    var _s = (0, useSupplierManagement_1.useSupplierManagement)({
        clinicId: clinicId,
        autoRefresh: true,
        refreshInterval: 300000, // 5 minutes
    }), suppliers = _s.suppliers, dashboardData = _s.dashboardData, contractAlerts = _s.contractAlerts, qualityIssuesSummary = _s.qualityIssuesSummary, analytics = _s.analytics, isLoading = _s.isLoading, error = _s.error, loadSuppliers = _s.loadSuppliers, loadDashboardData = _s.loadDashboardData, loadContractAlerts = _s.loadContractAlerts, loadQualityIssuesSummary = _s.loadQualityIssuesSummary, loadAnalytics = _s.loadAnalytics, refreshData = _s.refreshData;
    var _t = (0, react_1.useState)("overview"), selectedTab = _t[0], setSelectedTab = _t[1];
    (0, react_1.useEffect)(function () {
        // Initial data load
        loadSuppliers();
        loadContractAlerts();
        loadQualityIssuesSummary();
        // Load analytics for last 30 days
        var endDate = new Date();
        var startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        loadAnalytics(startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);
    }, [
        loadSuppliers,
        loadContractAlerts,
        loadQualityIssuesSummary,
        loadAnalytics,
    ]);
    // Render loading state
    if (isLoading && !dashboardData) {
        return (<div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Carregando dashboard de fornecedores...
          </p>
        </div>
      </div>);
    }
    // Render error state
    if (error) {
        return (<card_1.Card className="border-destructive">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-destructive flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-5 w-5"/>
            Erro no Dashboard
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button_1.Button onClick={refreshData} variant="outline">
            Tentar Novamente
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>);
    }
    var getSupplierTypeIcon = function (type) {
        switch (type) {
            case "medical_supplies":
                return <lucide_react_1.Package className="h-4 w-4"/>;
            case "pharmaceutical":
                return <lucide_react_1.Shield className="h-4 w-4"/>;
            case "equipment":
                return <lucide_react_1.Building2 className="h-4 w-4"/>;
            case "laboratory":
                return <lucide_react_1.BarChart3 className="h-4 w-4"/>;
            case "services":
                return <lucide_react_1.Users className="h-4 w-4"/>;
            case "technology":
                return <lucide_react_1.Building2 className="h-4 w-4"/>;
            case "maintenance":
                return <lucide_react_1.Building2 className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Building2 className="h-4 w-4"/>;
        }
    };
    var getStatusBadge = function (status) {
        switch (status) {
            case "active":
                return (<badge_1.Badge variant="default" className="bg-green-100 text-green-800">
            Ativo
          </badge_1.Badge>);
            case "inactive":
                return <badge_1.Badge variant="secondary">Inativo</badge_1.Badge>;
            case "pending":
                return <badge_1.Badge variant="outline">Pendente</badge_1.Badge>;
            case "suspended":
                return <badge_1.Badge variant="destructive">Suspenso</badge_1.Badge>;
            case "under_review":
                return (<badge_1.Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Em Análise
          </badge_1.Badge>);
            default:
                return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
        }
    };
    var getPerformanceColor = function (score) {
        if (score >= 85)
            return "text-green-600";
        if (score >= 70)
            return "text-yellow-600";
        return "text-red-600";
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground">
            Monitore performance, contratos e qualidade dos fornecedores
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
            Filtros
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar
          </button_1.Button>
          <button_1.Button size="sm">
            <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
            Novo Fornecedor
          </button_1.Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Total de Fornecedores
            </card_1.CardTitle>
            <lucide_react_1.Building2 className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.totalSuppliers) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.activeSuppliers) || 0} ativos
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Performance Média
            </card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {((_b = dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.averagePerformance) === null || _b === void 0 ? void 0 : _b.toFixed(1)) || "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Contratos Vencendo
            </card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(contractAlerts === null || contractAlerts === void 0 ? void 0 : contractAlerts.length) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 90 dias</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Issues de Qualidade
            </card_1.CardTitle>
            <lucide_react_1.AlertCircle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(qualityIssuesSummary === null || qualityIssuesSummary === void 0 ? void 0 : qualityIssuesSummary.reduce(function (acc, item) { return acc + item.openIssues; }, 0)) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Em aberto</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="suppliers">Fornecedores</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="contracts">Contratos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="quality">Qualidade</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Suppliers */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Melhores Fornecedores</card_1.CardTitle>
                <card_1.CardDescription>
                  Baseado na performance dos últimos 30 dias
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {(_c = dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.topSuppliers) === null || _c === void 0 ? void 0 : _c.slice(0, 5).map(function (supplier) {
            var _a, _b;
            return (<div key={supplier.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getSupplierTypeIcon(supplier.supplier_type)}
                          <span className="font-medium">{supplier.name}</span>
                        </div>
                        {supplier.is_preferred && (<lucide_react_1.Star className="h-4 w-4 text-yellow-500 fill-yellow-500"/>)}
                      </div>
                      <div className="text-right">
                        <div className={"font-semibold ".concat(getPerformanceColor(supplier.performance_score || 0))}>
                          {((_a = supplier.performance_score) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || "0.0"}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((_b = supplier.delivery_reliability) === null || _b === void 0 ? void 0 : _b.toFixed(0)) || "0"}%
                          entrega
                        </div>
                      </div>
                    </div>);
        })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Contract Alerts */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Alertas de Contrato</card_1.CardTitle>
                <card_1.CardDescription>
                  Contratos que requerem atenção
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {contractAlerts === null || contractAlerts === void 0 ? void 0 : contractAlerts.slice(0, 5).map(function (alert) { return (<div key={alert.contractId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
                        <div>
                          <div className="font-medium">
                            {alert.supplierName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Vence em {alert.daysUntilExpiry} dias
                          </div>
                        </div>
                      </div>
                      <badge_1.Badge variant={alert.daysUntilExpiry <= 30
                ? "destructive"
                : "outline"}>
                        {alert.alertType === "renewal"
                ? "Renovação"
                : "Atenção"}
                      </badge_1.Badge>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Performance Trends */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Tendências de Performance</card_1.CardTitle>
              <card_1.CardDescription>
                Evolução da performance por categoria
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {(_d = dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.performanceByType) === null || _d === void 0 ? void 0 : _d.map(function (category) { return (<div key={category.type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getSupplierTypeIcon(category.type)}
                        {category.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span className={getPerformanceColor(category.averageScore)}>
                        {category.averageScore.toFixed(1)}%
                      </span>
                    </div>
                    <progress_1.Progress value={category.averageScore} className="h-2"/>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Suppliers Tab */}
        <tabs_1.TabsContent value="suppliers" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Lista de Fornecedores</card_1.CardTitle>
              <card_1.CardDescription>
                Todos os fornecedores cadastrados no sistema
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Nome</table_1.TableHead>
                    <table_1.TableHead>Tipo</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Performance</table_1.TableHead>
                    <table_1.TableHead>Último Pedido</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {suppliers.slice(0, 10).map(function (supplier) {
            var _a;
            return (<table_1.TableRow key={supplier.id}>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          {getSupplierTypeIcon(supplier.supplier_type)}
                          <span className="font-medium">{supplier.name}</span>
                          {supplier.is_preferred && (<lucide_react_1.Star className="h-4 w-4 text-yellow-500 fill-yellow-500"/>)}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">
                          {supplier.supplier_type.replace("_", " ")}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>{getStatusBadge(supplier.status)}</table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={getPerformanceColor(supplier.performance_score || 0)}>
                            {((_a = supplier.performance_score) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || "0.0"}%
                          </span>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {supplier.last_order_date
                    ? new Date(supplier.last_order_date).toLocaleDateString("pt-BR")
                    : "Nunca"}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <button_1.Button variant="ghost" size="sm">
                          Ver Detalhes
                        </button_1.Button>
                      </table_1.TableCell>
                    </table_1.TableRow>);
        })}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Contracts Tab */}
        <tabs_1.TabsContent value="contracts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Gestão de Contratos</card_1.CardTitle>
              <card_1.CardDescription>
                Contratos ativos e alertas de renovação
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {contractAlerts === null || contractAlerts === void 0 ? void 0 : contractAlerts.map(function (alert) {
            var _a;
            return (<div key={alert.contractId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{alert.supplierName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Contrato: {alert.contractType}
                        </p>
                        <p className="text-sm">
                          Valor: R${" "}
                          {((_a = alert.contractValue) === null || _a === void 0 ? void 0 : _a.toLocaleString("pt-BR")) ||
                    "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <badge_1.Badge variant={alert.daysUntilExpiry <= 30
                    ? "destructive"
                    : "outline"}>
                          {alert.daysUntilExpiry} dias
                        </badge_1.Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vence:{" "}
                          {new Date(alert.expiryDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button_1.Button size="sm" variant="outline">
                        Ver Contrato
                      </button_1.Button>
                      <button_1.Button size="sm">Renovar</button_1.Button>
                    </div>
                  </div>);
        })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Quality Tab */}
        <tabs_1.TabsContent value="quality" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Issues de Qualidade</card_1.CardTitle>
              <card_1.CardDescription>
                Resumo dos problemas de qualidade por fornecedor
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {qualityIssuesSummary === null || qualityIssuesSummary === void 0 ? void 0 : qualityIssuesSummary.map(function (summary) { return (<div key={summary.supplierId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-semibold">
                          {summary.supplierName}
                        </h4>
                        <div className="flex gap-4 text-sm">
                          <span className="text-red-600">
                            {summary.openIssues} em aberto
                          </span>
                          <span className="text-green-600">
                            {summary.resolvedIssues} resolvidos
                          </span>
                          <span className="text-muted-foreground">
                            {summary.totalIssues} total
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={"font-semibold ".concat(getPerformanceColor(summary.averageResolutionTime))}>
                          {summary.averageResolutionTime.toFixed(1)} dias
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tempo médio de resolução
                        </p>
                      </div>
                    </div>
                    {summary.openIssues > 0 && (<div className="mt-3">
                        <button_1.Button size="sm" variant="outline">
                          Ver Issues
                        </button_1.Button>
                      </div>)}
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Analytics Tab */}
        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Analytics de Fornecedores</card_1.CardTitle>
              <card_1.CardDescription>
                Análise detalhada de performance e custos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {analytics ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Métricas de Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Entregas no Prazo:</span>
                        <span className="font-semibold">
                          {((_f = (_e = analytics.deliveryMetrics) === null || _e === void 0 ? void 0 : _e.onTimeDeliveryRate) === null || _f === void 0 ? void 0 : _f.toFixed(1)) || "0.0"}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Qualidade Média:</span>
                        <span className="font-semibold">
                          {((_h = (_g = analytics.qualityMetrics) === null || _g === void 0 ? void 0 : _g.averageQualityRating) === null || _h === void 0 ? void 0 : _h.toFixed(1)) || "0.0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo de Resposta:</span>
                        <span className="font-semibold">
                          {((_k = (_j = analytics.responseMetrics) === null || _j === void 0 ? void 0 : _j.averageResponseTime) === null || _k === void 0 ? void 0 : _k.toFixed(1)) || "0.0"}
                          h
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Métricas de Custo</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gastos Totais:</span>
                        <span className="font-semibold">
                          R${" "}
                          {((_m = (_l = analytics.costMetrics) === null || _l === void 0 ? void 0 : _l.totalSpent) === null || _m === void 0 ? void 0 : _m.toLocaleString("pt-BR")) || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Economia Obtida:</span>
                        <span className="font-semibold text-green-600">
                          R${" "}
                          {((_p = (_o = analytics.costMetrics) === null || _o === void 0 ? void 0 : _o.savingsAchieved) === null || _p === void 0 ? void 0 : _p.toLocaleString("pt-BR")) || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI Médio:</span>
                        <span className="font-semibold">
                          {((_r = (_q = analytics.costMetrics) === null || _q === void 0 ? void 0 : _q.averageROI) === null || _r === void 0 ? void 0 : _r.toFixed(1)) ||
                "0.0"}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>) : (<div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Carregando analytics...
                  </p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
