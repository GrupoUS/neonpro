/**
 * NeonPro - Clinical Dashboard Enhanced (FASE 2)
 * Dashboard otimizado para fluxos clínicos específicos
 *
 * Melhorias Fase 2:
 * - Interface orientada para personas médicas (Dr. Marina, Carla Santos)
 * - Workflows otimizados para eficiência clínica
 * - IA integrada para insights preditivos
 * - Acessibilidade aprimorada para ambiente médico
 * - Performance otimizada para uso intensivo
 */
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalDashboardEnhanced = ClinicalDashboardEnhanced;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var accessibility_context_1 = require("@/contexts/accessibility-context");
function ClinicalDashboardEnhanced(_a) {
  var className = _a.className,
    userRole = _a.userRole;
  var _b = (0, react_1.useState)({
      todayAppointments: 12,
      pendingConsultations: 3,
      completedTreatments: 8,
      revenue: 4800,
      patientSatisfaction: 4.8,
      noShowRate: 12,
      averageWaitTime: 15,
      emergencyAlerts: 2,
    }),
    metrics = _b[0],
    setMetrics = _b[1];
  var _c = (0, react_1.useState)([
      {
        id: "1",
        name: "Ana Costa",
        condition: "Pós-cirúrgico - Acompanhamento",
        priority: "high",
        nextAppointment: "14:30",
        riskScore: 85,
        lastVisit: "2 dias atrás",
      },
      {
        id: "2",
        name: "Maria Silva",
        condition: "Tratamento anti-idade",
        priority: "medium",
        nextAppointment: "16:00",
        riskScore: 45,
        lastVisit: "1 semana atrás",
      },
      {
        id: "3",
        name: "João Santos",
        condition: "Consulta inicial",
        priority: "low",
        nextAppointment: "17:15",
        riskScore: 20,
        lastVisit: "Novo paciente",
      },
    ]),
    priorityPatients = _c[0],
    setPriorityPatients = _c[1];
  var announceToScreenReader = (0, accessibility_context_1.useAccessibility)()
    .announceToScreenReader;
  var _d = (0, react_1.useState)("overview"),
    activeTab = _d[0],
    setActiveTab = _d[1];
  // Memoized calculations for performance
  var calculatedMetrics = (0, react_1.useMemo)(() => {
    var occupancyRate = Math.round((metrics.completedTreatments / metrics.todayAppointments) * 100);
    var satisfactionGrade =
      metrics.patientSatisfaction >= 4.5
        ? "Excelente"
        : metrics.patientSatisfaction >= 4.0
          ? "Bom"
          : "Regular";
    var revenueGrowth = "+12%"; // Mock data
    return {
      occupancyRate: occupancyRate,
      satisfactionGrade: satisfactionGrade,
      revenueGrowth: revenueGrowth,
    };
  }, [metrics]);
  // Announce important updates for screen readers
  (0, react_1.useEffect)(() => {
    if (metrics.emergencyAlerts > 0) {
      announceToScreenReader(
        "Aten\u00E7\u00E3o: ".concat(
          metrics.emergencyAlerts,
          " alerta(s) m\u00E9dico(s) requer(em) aten\u00E7\u00E3o imediata",
        ),
        "assertive",
      );
    }
  }, [metrics.emergencyAlerts, announceToScreenReader]);
  var handleTabChange = (tab) => {
    setActiveTab(tab);
    announceToScreenReader("Navegou para aba ".concat(tab), "polite");
  };
  var getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <lucide_react_1.Clock className="h-4 w-4" />;
      case "low":
        return <lucide_react_1.CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };
  return (
    <div className={(0, utils_1.cn)("space-y-6 p-6", className)}>
      {/* Header com contexto personalizado por role */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {userRole === "doctor"
              ? "Painel Clínico"
              : userRole === "coordinator"
                ? "Central de Coordenação"
                : "Dashboard Administrativo"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userRole === "doctor"
              ? "Visão completa dos seus pacientes e tratamentos"
              : userRole === "coordinator"
                ? "Coordenação eficiente do fluxo de pacientes"
                : "Controle administrativo e métricas gerais"}
          </p>
        </div>

        {/* Alertas de emergência */}
        {metrics.emergencyAlerts > 0 && (
          <div className="flex items-center space-x-2">
            <badge_1.Badge variant="destructive" className="animate-pulse">
              <lucide_react_1.AlertTriangle className="h-4 w-4 mr-1" />
              {metrics.emergencyAlerts} Alerta(s)
            </badge_1.Badge>
            <button_1.Button variant="destructive" size="sm">
              Ver Alertas
            </button_1.Button>
          </div>
        )}
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card className="hover:shadow-md transition-shadow">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Consultas Hoje</card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{metrics.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingConsultations} pendentes
            </p>
            <progress_1.Progress value={calculatedMetrics.occupancyRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {calculatedMetrics.occupancyRate}% ocupação
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="hover:shadow-md transition-shadow">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Tratamentos Concluídos
            </card_1.CardTitle>
            <lucide_react_1.Stethoscope className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{metrics.completedTreatments}</div>
            <p className="text-xs text-muted-foreground">
              Tempo médio: {metrics.averageWaitTime}min
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="hover:shadow-md transition-shadow">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Satisfação</card_1.CardTitle>
            <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{metrics.patientSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">{calculatedMetrics.satisfactionGrade}</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="hover:shadow-md transition-shadow">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Receita Hoje</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">R$ {metrics.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {calculatedMetrics.revenueGrowth} vs ontem
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Tabs principais */}
      <tabs_1.Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="patients">Pacientes</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insights">IA Insights</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="schedule">Agenda</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pacientes Prioritários */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.Target className="h-5 w-5 mr-2" />
                  Pacientes Prioritários
                </card_1.CardTitle>
                <card_1.CardDescription>Baseado em risco clínico e urgência</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                {priorityPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <badge_1.Badge
                        variant="outline"
                        className={(0, utils_1.cn)("text-xs", getPriorityColor(patient.priority))}
                      >
                        {getPriorityIcon(patient.priority)}
                        <span className="ml-1 sr-only">Prioridade {patient.priority}</span>
                      </badge_1.Badge>
                      <div>
                        <p className="font-medium text-sm">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{patient.nextAppointment}</p>
                      <p className="text-xs text-muted-foreground">Risco: {patient.riskScore}%</p>
                    </div>
                  </div>
                ))}
                <button_1.Button variant="outline" className="w-full" size="sm">
                  Ver Todos os Pacientes
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Ações Rápidas */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Ações Rápidas</card_1.CardTitle>
                <card_1.CardDescription>
                  Fluxos otimizados para máxima eficiência
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                <button_1.Button variant="default" className="w-full justify-start" size="sm">
                  <lucide_react_1.Users className="h-4 w-4 mr-2" />
                  Novo Paciente (Ctrl+N)
                </button_1.Button>
                <button_1.Button variant="outline" className="w-full justify-start" size="sm">
                  <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
                  Agendar Consulta (Ctrl+A)
                </button_1.Button>
                <button_1.Button variant="outline" className="w-full justify-start" size="sm">
                  <lucide_react_1.Phone className="h-4 w-4 mr-2" />
                  Ligar para Paciente
                </button_1.Button>
                <button_1.Button variant="outline" className="w-full justify-start" size="sm">
                  <lucide_react_1.TrendingUp className="h-4 w-4 mr-2" />
                  Relatório Rápido
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="patients" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Lista de Pacientes do Dia</card_1.CardTitle>
              <card_1.CardDescription>
                Pacientes agendados com status em tempo real
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Lista detalhada de pacientes será carregada aqui</p>
                <p className="text-sm">Integração com sistema de agendamento</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="insights" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Brain className="h-5 w-5 mr-2" />
                Insights de IA
              </card_1.CardTitle>
              <card_1.CardDescription>
                Análises preditivas e recomendações personalizadas
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sistema de IA em desenvolvimento</p>
                <p className="text-sm">Insights preditivos serão disponibilizados em breve</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="schedule" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Agenda Inteligente</card_1.CardTitle>
              <card_1.CardDescription>
                Visualização otimizada da agenda com conflitos e sugestões
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Componente de agenda avançada</p>
                <p className="text-sm">Integração com sistema de agendamento inteligente</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
